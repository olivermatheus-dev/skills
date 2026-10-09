// Galeria de blocos de vídeo (tarefa 045 G): catálogo de todos os blocos (global, marca, projeto), busca barata,
// miniatura por bloco (1 quadro do vídeo onde ele foi usado), índice library/INDEX.md e Promover (projeto → marca → global).
// Usado pelo tools/video/blocos.mjs (terminal) e pelo app (core/blocos.ts → aba Formatos · Blocos de vídeo).
// O Claude acha um bloco pelo índice ou pela busca, sem abrir mídia; só olha a miniatura dos finalistas.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, cpSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const rel = (p) => relative(ROOT(), p).split('\\').join('/');
const lerJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
const dirs = (d) => (existsSync(d) ? readdirSync(d, { withFileTypes: true }).filter((x) => x.isDirectory()).map((x) => x.name) : []);
export const fold = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const ORDEM = { projeto: 0, empresa: 1, global: 2 };

export const empresas = () => dirs(join(ROOT(), 'companies')).filter((s) => !s.startsWith('_') && existsSync(join(ROOT(), 'companies', s, 'project.yml')));

/** pastas de vídeo de uma empresa (contents/<pasta> e contents/_testes/<pasta>), relativas a contents/ */
export function pastasDeVideo(slug) {
  const C = join(ROOT(), 'companies', slug, 'contents');
  const out = [];
  for (const p of dirs(C)) {
    if (p === '_testes') { for (const t of dirs(join(C, p))) out.push(`_testes/${t}`); continue; }
    if (!p.startsWith('_')) out.push(p);
  }
  return out.filter((p) => existsSync(join(C, p, 'timeline.json')) || existsSync(join(C, p, 'blocos')));
}

/** blocos de uma raiz <raiz>/<tipo>/<id>/bloco.json */
function blocosDe(raiz, escopo, extra) {
  const out = [];
  for (const tipo of dirs(raiz)) for (const id of dirs(join(raiz, tipo))) {
    const dir = join(raiz, tipo, id), meta = lerJson(join(dir, 'bloco.json'));
    if (!meta) continue;
    out.push({ use: `${tipo}/${id}`, escopo, dir: rel(dir), ...extra, meta });
  }
  return out;
}

/** usos: em que vídeos (timeline atual) cada bloco aparece; resolvido como o compor (projeto → empresa → global) */
function usosDe(slug, pasta) {
  const tl = lerJson(join(ROOT(), 'companies', slug, 'contents', pasta, 'timeline.json'));
  if (!tl) return [];
  return [...(tl.scenes ?? []).filter((s) => s.use).map((s) => ({ use: s.use, cena: s.id })), ...(tl.camadas ?? []).filter((c) => c.use).map((c) => ({ use: c.use, cena: 'camada' }))];
}

/**
 * Catálogo completo. `empresa` limita a uma empresa (global sempre entra). Cada item: use, escopo (global | empresa | projeto),
 * empresa, pasta (projeto), dir, meta (bloco.json), usos [{ empresa, pasta, cena }], preview (caminho relativo ou null).
 */
export function catalogo({ empresa } = {}) {
  const slugs = empresa ? [empresa] : empresas();
  const itens = [...blocosDe(join(ROOT(), 'library', 'blocos'), 'global', {})];
  for (const s of slugs) {
    itens.push(...blocosDe(join(ROOT(), 'companies', s, 'video-templates', 'blocos'), 'empresa', { empresa: s }));
    for (const p of pastasDeVideo(s)) itens.push(...blocosDe(join(ROOT(), 'companies', s, 'contents', p, 'blocos'), 'projeto', { empresa: s, pasta: p }));
  }
  const chave = (b) => `${b.escopo}|${b.empresa ?? ''}|${b.pasta ?? ''}|${b.use}`;
  const porChave = new Map(itens.map((b) => [chave(b), { ...b, usos: [] }]));
  for (const s of slugs) for (const p of pastasDeVideo(s)) {
    const vistos = new Set();
    for (const u of usosDe(s, p)) {
      const alvo = [`projeto|${s}|${p}|${u.use}`, `empresa|${s}||${u.use}`, `global|||${u.use}`].map((k) => porChave.get(k)).find(Boolean);
      if (!alvo || vistos.has(`${chave(alvo)}|${u.cena}`)) continue;
      vistos.add(`${chave(alvo)}|${u.cena}`);
      alvo.usos.push({ empresa: s, pasta: p, cena: u.cena });
    }
  }
  return [...porChave.values()].map((b) => ({ ...b, preview: existsSync(join(ROOT(), b.dir, 'preview.png')) ? `${b.dir}/preview.png` : null }))
    .sort((a, b) => ORDEM[b.escopo] - ORDEM[a.escopo] || (a.empresa ?? '').localeCompare(b.empresa ?? '') || (a.pasta ?? '').localeCompare(b.pasta ?? '') || a.use.localeCompare(b.use));
}

/** texto pesquisável de um bloco, com peso: id/tipo 3 · título 2 · resto 1 */
function campos(b) {
  const m = b.meta;
  const params = Object.entries(m.params ?? {}).map(([k, v]) => `${k} ${v?.descricao ?? ''}`).join(' ');
  return [
    [3, `${b.use} ${b.use.replace(/[/-]/g, ' ')} ${(m.tags ?? []).join(' ')}`],
    [2, m.titulo ?? ''],
    [1, `${(m.slots ?? []).join(' ')} ${(m.cues ?? []).join(' ')} ${m.vivo ?? ''} ${params} ${m.origem ?? ''} ${m.camada ?? ''}`],
  ].map(([p, t]) => [p, fold(t)]);
}
const PARADAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'o', 'a', 'os', 'as', 'um', 'uma', 'com', 'em', 'no', 'na', 'para', 'por', 'que', 'se']);

/**
 * Busca por termos (sem acento, prefixo de 4+ letras vale): "cta navegador 9x16", "cards caos", "logo revela".
 * Filtros: tipo, escopo, formato ("9x16"), empresa. Formato no texto da busca também filtra.
 */
export function buscar(q, { tipo, escopo, formato, empresa, limite = 10 } = {}) {
  let termos = fold(q).split(/[^a-z0-9]+/).filter((t) => t && !PARADAS.has(t));
  const fmtNaBusca = termos.find((t) => /^\d+x\d+$/.test(t));
  if (fmtNaBusca) { formato ??= fmtNaBusca; termos = termos.filter((t) => t !== fmtNaBusca); }
  const lista = catalogo({ empresa }).filter((b) => b.use !== 'rascunho/cena-nova'
    && (!tipo || b.use.startsWith(`${tipo}/`)) && (!escopo || b.escopo === escopo)
    && (!formato || !(b.meta.formatos?.length) || b.meta.formatos.includes(formato)));
  if (!termos.length) return lista.slice(0, limite).map((b) => ({ ...b, pontos: 0 }));
  const pont = lista.map((b) => {
    const cs = campos(b);
    let pontos = 0, achou = 0;
    for (const t of termos) {
      const re = new RegExp(`\\b${t.length >= 4 ? t.slice(0, Math.max(4, t.length - 2)) : t}`, 'g');
      let melhor = 0;
      for (const [peso, texto] of cs) { const n = (texto.match(re) ?? []).length; if (n) melhor = Math.max(melhor, peso * Math.min(n, 3)); }
      if (melhor) { achou++; pontos += melhor; }
    }
    // todos os termos achados vale mais que muitos acertos de um só; uso real desempata
    return { ...b, pontos: achou ? pontos + achou * 4 + (achou === termos.length ? 6 : 0) + Math.min(b.usos.length, 3) * 0.5 : 0 };
  });
  return pont.filter((b) => b.pontos > 0).sort((a, b) => b.pontos - a.pontos).slice(0, limite);
}

// ---------- miniaturas ----------
const versaoNum = (s) => +(String(s).match(/v(\d+)/i)?.[1] ?? 0);

/** de onde tirar o quadro de um uso: a versão mais nova com MP4 (versoes/vNN) ou a timeline atual + o export mais novo */
function fonteDoQuadro(empresa, pasta, use, cena) {
  const P = join(ROOT(), 'companies', empresa, 'contents', pasta);
  const tentativas = [];
  const vdir = join(P, 'versoes');
  for (const v of dirs(vdir).filter((d) => /^v\d+$/.test(d)).sort((a, b) => versaoNum(b) - versaoNum(a))) {
    const info = lerJson(join(vdir, v, 'versao.json'));
    tentativas.push({ tl: join(vdir, v, 'timeline.json'), formatos: info?.formatos ?? {}, versao: v });
  }
  const exps = existsSync(join(P, 'exports')) ? readdirSync(join(P, 'exports')).filter((f) => /\.mp4$/i.test(f) && !/rascunho/i.test(f)) : [];
  const ultimo = (fmt) => exps.filter((f) => f.includes(fmt)).sort((a, b) => versaoNum(b) - versaoNum(a))[0];
  tentativas.push({ tl: join(P, 'timeline.json'), formatos: Object.fromEntries(['4x5', '9x16', '1x1', '16x9'].map((f) => [f, ultimo(f) && `exports/${ultimo(f)}`]).filter(([, v]) => v)), versao: 'atual' });
  for (const t of tentativas) {
    const tl = lerJson(t.tl);
    if (!tl) continue;
    const fmt = ['4x5', '9x16', '1x1', '16x9'].find((f) => t.formatos[f] && existsSync(join(P, t.formatos[f])));
    if (!fmt) continue;
    let tempo;
    if (cena === 'camada') tempo = 0.1; // fundo: antes de o palco entrar
    else {
      const s = (tl.scenes ?? []).find((x) => x.id === cena && x.use === use) ?? (tl.scenes ?? []).find((x) => x.use === use);
      if (!s || s.start == null || s.end == null) continue;
      // quadro assentado: 0,6 s antes do fim da cena (mesma regra do storyboard), nunca antes da entrada
      tempo = Math.max(s.start + 0.4, s.end - 0.6);
    }
    return { mp4: join(P, t.formatos[fmt]), tempo: Math.round(tempo * 100) / 100, formato: fmt, versao: t.versao };
  }
  return null;
}

/**
 * Gera preview.png (432 px de largura) + preview.json em cada bloco que tem uso com MP4 exportado.
 * Sem `forcar`, pula quem já tem. Retorna { feitos, pulados, sem_fonte }.
 */
export function gerarPreviews({ empresa, use, forcar = false } = {}) {
  const r = { feitos: [], pulados: [], sem_fonte: [] };
  for (const b of catalogo({ empresa })) {
    if (use && b.use !== use) continue;
    if (b.preview && !forcar) { r.pulados.push(b.use); continue; }
    const fonte = b.usos.map((u) => fonteDoQuadro(u.empresa, u.pasta, b.use, u.cena)).find(Boolean);
    if (!fonte) { r.sem_fonte.push(`${b.use} (${b.escopo}${b.pasta ? ' · ' + b.pasta : ''})`); continue; }
    const out = join(ROOT(), b.dir, 'preview.png');
    const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(fonte.tempo), '-i', fonte.mp4, '-frames:v', '1', '-vf', 'scale=432:-2', out], { encoding: 'utf8' });
    if (ff.status !== 0 || !existsSync(out)) { r.sem_fonte.push(`${b.use}: ffmpeg falhou ${ff.stderr?.trim() ?? ''}`); continue; }
    writeFileSync(join(ROOT(), b.dir, 'preview.json'), JSON.stringify({ fonte: rel(fonte.mp4), tempo: fonte.tempo, formato: fonte.formato, versao: fonte.versao, gerado: new Date().toISOString().slice(0, 19) }, null, 2) + '\n');
    r.feitos.push(b.use);
  }
  return r;
}

// ---------- índice ----------
const curto = (s, n = 110) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
const linha = (b) => `| \`${b.use}\` | ${curto(b.meta.titulo)} | ${(b.meta.slots ?? []).join(', ') || '—'} | ${(b.meta.cues ?? []).join(', ') || '—'} | ${b.meta.min_s ?? '—'} | ${(b.meta.formatos ?? []).join(' ') || 'todos'} | ${b.usos.length} | ${b.meta.licenca ?? '**sem licença**'} | ${b.preview ? 'sim' : '—'} |`;
const CAB = '| use | o que faz | slots | cues | min s | formatos | usos | licença | prévia |\n|---|---|---|---|---|---|---|---|---|';

/** library/INDEX.md: 1 linha por bloco (todas as empresas), mais os ponteiros para os outros catálogos da biblioteca */
export function escreverIndice() {
  const cat = catalogo();
  const grupos = [
    ['Globais (`library/blocos/`, só tokens: servem a qualquer empresa)', cat.filter((b) => b.escopo === 'global')],
    ...empresas().map((s) => [`Da marca ${s} (\`companies/${s}/video-templates/blocos/\`)`, cat.filter((b) => b.escopo === 'empresa' && b.empresa === s)]),
    ...empresas().flatMap((s) => {
      const porPasta = new Map();
      for (const b of cat.filter((x) => x.escopo === 'projeto' && x.empresa === s)) porPasta.set(b.pasta, [...(porPasta.get(b.pasta) ?? []), b]);
      return [...porPasta].map(([p, l]) => [`Do projeto ${s}/${p} (só esse vídeo usa; promova se servir de novo)`, l]);
    }),
  ].filter(([, l]) => l.length);
  const md = [
    '# Índice da biblioteca (gerado: não editar à mão)',
    '',
    `> \`node tools/video/blocos.mjs indice\` regera. Buscar: \`node tools/video/blocos.mjs buscar "<termos>" [--empresa kz] [--tipo cta] [--formato 9x16]\`. Atualizado em ${new Date().toISOString().slice(0, 10)}.`,
    '> Leia este índice (ou a busca) antes de criar bloco, fundo ou transição. Só abra a `preview.png` dos finalistas; o `bloco.json` só do escolhido.',
    '> Ordem em que o vídeo acha um bloco: projeto → marca → global (o mesmo `use` no projeto vence). Promover: `blocos.mjs promover <use> --de <pasta> --para empresa|global`.',
    '',
    '## Blocos de vídeo (tarefa 045)',
    '',
    `${cat.length} blocos · ${cat.filter((b) => b.preview).length} com prévia · contrato: \`.claude/skills/video/references/blocos.md\`.`,
    '',
    ...grupos.flatMap(([t, l]) => [`### ${t}`, '', CAB, ...l.map(linha), '']),
    '## Outros catálogos',
    '',
    '- Áudio (trilhas, bases, SFX): `library/audio/INDEX.md` (nunca o `sfx.json` inteiro).',
    '- Formatos de conteúdo (`fmt-*`): `library/formatos/<id>/formato.json` (app → Formatos).',
    '- Molduras e fundos de mockup: `library/mockups/README.md`.',
    '- Visual (ícones Lucide, mapas, bandeiras): `library/visual/README.md`; ícone: `node tools/icon.mjs --busca <termo>`.',
    '- Componentes CSS antigos de motion: `library/motion/README.md` (o `cta/navegador` já virou bloco global).',
    '',
  ].join('\n');
  writeFileSync(join(ROOT(), 'library', 'INDEX.md'), md);
  return { arquivo: 'library/INDEX.md', blocos: cat.length };
}

// ---------- promover ----------
const HEX = /#[0-9a-f]{3,8}\b/gi;
/** confere se um bloco pode subir para a galeria global (só tokens, sem dado fixo de marca) */
export function conferirGlobal(dir) {
  const erros = [], avisos = [];
  const ler = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8') : '');
  const semComent = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const codigo = semComent(ler('bloco.css')) + '\n' + semComent(ler('bloco.js'));
  // cor de reserva dentro de var(--token, #fff) é o recomendado: tira os var() (de dentro para fora) antes de procurar cor fixa
  let semVar = codigo, antes;
  do { antes = semVar; semVar = semVar.replace(/var\(--[a-z0-9-]+(?:\s*,[^()]*)?\)/gi, 'TOKEN'); } while (semVar !== antes);
  // no JS, reserva depois de ler o token (cor('--x') || '#888') também vale
  const hex = [...new Set(semVar.replace(/\|\|\s*['"]#[0-9a-f]{3,8}['"]/gi, '').match(HEX) ?? [])];
  if (hex.length) erros.push(`cor fixa fora de token (${hex.slice(0, 4).join(', ')}): use var(--token, reserva)`);
  const html = ler('bloco.html').replace(/<[^>]+>/g, ' ').replace(/\{\{[^}]+\}\}/g, ' ').replace(/\s+/g, ' ').trim();
  if (/[a-zà-ú]{3,}/i.test(html)) erros.push(`texto fixo no HTML ("${curto(html, 50)}"): no global o texto vem de slot ou param`);
  // token que só a marca tem, usado sem reserva: em outra marca vira transparente
  const tokens = [...new Set([...codigo.matchAll(/var\((--[a-z0-9-]+)\)/gi)].map((x) => x[1]))].filter((t) => /^--(pastel|ui-|kz|brand)/.test(t));
  if (tokens.length) avisos.push(`tokens que nem toda marca tem, sem reserva: ${tokens.join(', ')} (use var(--x, reserva) ou deixe na marca)`);
  return { erros, avisos };
}

/**
 * Sobe um bloco um nível (ou direto para global): projeto → empresa → global. Move por padrão (uma fonte só; o vídeo
 * continua achando o bloco porque a busca desce até o global); `copiar` deixa o original. Nunca sobrescreve.
 * `de`: pasta do vídeo (relativa a contents/ ou caminho) para bloco de projeto, ou o slug da empresa para bloco da marca.
 */
export function promover({ empresa, use, de, para, copiar = false, forcar = false }) {
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(use ?? '')) throw new Error(`use inválido: ${use}`);
  const cat = catalogo({ empresa });
  const pasta = de && de !== empresa ? String(de).split(/[\\/]contents[\\/]/).pop().replace(/[\\/]+$/, '').split('\\').join('/') : null;
  const origem = cat.find((b) => b.use === use && (pasta ? b.escopo === 'projeto' && b.pasta === pasta : b.escopo === 'empresa'));
  if (!origem) throw new Error(`bloco ${use} não achado em ${pasta ? `contents/${pasta}/blocos` : `companies/${empresa}/video-templates/blocos`}`);
  const destinoEscopo = para ?? (origem.escopo === 'projeto' ? 'empresa' : 'global');
  if (ORDEM[destinoEscopo] <= ORDEM[origem.escopo]) throw new Error(`${use} já está em ${origem.escopo}; promover só sobe (projeto → empresa → global)`);
  const destino = destinoEscopo === 'global' ? join(ROOT(), 'library', 'blocos', use) : join(ROOT(), 'companies', origem.empresa, 'video-templates', 'blocos', use);
  if (existsSync(destino)) throw new Error(`já existe ${rel(destino)}: renomeie o bloco antes (o mesmo use não pode morar em dois lugares)`);
  const src = join(ROOT(), origem.dir);
  const conf = destinoEscopo === 'global' ? conferirGlobal(src) : { erros: [], avisos: [] };
  if (conf.erros.length && !forcar) return { ok: false, erros: conf.erros, avisos: conf.avisos };
  mkdirSync(dirname(destino), { recursive: true });
  cpSync(src, destino, { recursive: true });
  const meta = lerJson(join(destino, 'bloco.json'));
  const nota = `promovido de ${origem.escopo === 'projeto' ? `${origem.empresa}/${origem.pasta}` : `marca ${origem.empresa}`} para ${destinoEscopo === 'global' ? 'library/blocos' : `marca ${origem.empresa}`} em ${new Date().toISOString().slice(0, 10)}`;
  meta.origem = meta.origem ? `${meta.origem}; ${nota}` : nota;
  writeFileSync(join(destino, 'bloco.json'), JSON.stringify(meta, null, 2) + '\n');
  if (!copiar) {
    rmSync(src, { recursive: true, force: true });
    // pasta do tipo vazia (ex.: blocos/cena/) some junto
    const tipoDir = dirname(src);
    if (existsSync(tipoDir) && !readdirSync(tipoDir).length) rmSync(tipoDir, { recursive: true, force: true });
  }
  escreverIndice();
  return { ok: true, de: origem.dir, para: rel(destino), movido: !copiar, avisos: conf.avisos, usos: origem.usos.length };
}

/** caminho seguro de uma miniatura (para o app servir): só preview.png dentro de uma pasta de blocos */
export function arquivoPreview(relPath) {
  const p = String(relPath ?? '');
  if (p.includes('..') || !/^(library\/blocos|companies\/[a-z0-9-]+\/(video-templates|contents\/.+)\/blocos)\/[a-z0-9-]+\/[a-z0-9-]+\/preview\.png$/.test(p)) return null;
  const f = join(ROOT(), p);
  return existsSync(f) && statSync(f).isFile() ? f : null;
}
