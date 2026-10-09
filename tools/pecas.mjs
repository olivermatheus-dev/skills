// Peças de contents/ com ID (tarefa 050). Regra e helpers em tools/lib/pecas.mjs.
//
//   node tools/pecas.mjs proximo <slug> <video|carrossel|post|mockup|roteiro>     próximo ID livre (ex.: V0004)
//   node tools/pecas.mjs listar <slug>                                             ID · tipo · criado · pasta
//   node tools/pecas.mjs migrar <slug> [--aplicar] [--slug <pasta>=<novo-slug>]… [--familia <pasta>=<nome>]… [--teste <pasta>]… [--exceto <pasta>]…
//
// migrar (simulação por padrão; só move com --aplicar):
//   pastas AAAA-MM-DD-<tema> → <ID>-<tema> (tipo pela ficha ou pelo conteúdo; numeração por data e nome); testes do hub
//   (nome com "teste"/"ab-sessao", ou --teste) → _testes/<pasta>. Os MP4 de exports/ perdem o nome longo
//   (2026-10-08-x-9x16-v03.mp4 → V0002-9x16-v03.mp4). A ficha ganha id, criado (a data do nome), familia e o título que
//   o app já mostrava. Depois troca o caminho antigo pelo novo em todo arquivo de texto do hub (tarefas do quadro,
//   roadmap, revisao.json, peca.json, versoes/, logs), do nome mais longo para o mais curto.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PREFIXO, ID_RE, TESTES, contentsDir, proximoId, idDaPasta } from './lib/pecas.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const [cmd, slug, tipoArg] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(slug|familia|teste|exceto)$/));
const pares = (n) => args.flatMap((a, i) => (a === `--${n}` && args[i + 1] ? [args[i + 1]] : []));
const mapa = (n) => Object.fromEntries(pares(n).map((p) => p.split('=')));
const lerJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return null; } };
const sai = (m) => { console.error(m); process.exit(1); };
if (!cmd || !slug) sai('uso: node tools/pecas.mjs proximo|listar|migrar <slug> … (veja o cabeçalho)');
const C = contentsDir(slug);
if (!existsSync(C)) sai(`sem ${C}`);

const lista = (d, re) => (existsSync(d) ? readdirSync(d).filter((f) => re.test(f)) : []);
/** mesma detecção do app (core/store.ts > pieceKind) */
function tipoDe(dir) {
  const ficha = lerJson(join(dir, 'peca.json'));
  if (ficha?.kind) return ficha.kind;
  const videos = lista(join(dir, 'exports'), /\.mp4$/i), imgs = lista(join(dir, 'png'), /\.(png|jpe?g|webp)$/i);
  if (videos.length || existsSync(join(dir, 'timeline.json')) || existsSync(join(dir, 'composition.html'))) return 'video';
  if (existsSync(join(dir, 'mockup.json'))) return 'mockup';
  if (existsSync(join(dir, 'post.html'))) return 'post';
  if (existsSync(join(dir, 'carrossel.html')) || imgs.length > 1) return 'carrossel';
  if (imgs.length === 1) return 'post';
  return 'roteiro';
}
const tituloPadrao = (nome) => nome.replace(/^\d{4}-\d{2}-\d{2}-?/, '').replace(/-/g, ' ').trim();

if (cmd === 'proximo') {
  if (!PREFIXO[tipoArg]) sai(`tipo: ${Object.keys(PREFIXO).join(' | ')}`);
  console.log(proximoId(slug, tipoArg));
} else if (cmd === 'listar') {
  for (const d of readdirSync(C).filter((n) => statSync(join(C, n)).isDirectory()).sort()) {
    const f = lerJson(join(C, d, 'peca.json')) ?? {};
    console.log(`${(f.id ?? idDaPasta(d) ?? '—').padEnd(6)} ${(f.kind ?? tipoDe(join(C, d))).padEnd(9)} ${(f.criado ?? '').padEnd(10)} ${d}${f.familia ? `  · família ${f.familia}` : ''}`);
  }
} else if (cmd === 'migrar') {
  const aplicar = args.includes('--aplicar');
  const slugs = mapa('slug'), familias = mapa('familia'), testesExtra = pares('teste'), exceto = pares('exceto');
  const antigas = readdirSync(C).filter((n) => /^\d{4}-\d{2}-\d{2}-/.test(n) && !exceto.includes(n) && statSync(join(C, n)).isDirectory()).sort();
  if (exceto.length) console.log(`fica para depois (--exceto, pasta em uso): ${exceto.join(', ')}`);
  if (!antigas.length) { console.log('nada a migrar: nenhuma pasta AAAA-MM-DD-… em contents/'); process.exit(0); }

  // plano: testes → _testes/; o resto ganha ID por tipo, na ordem de data e nome
  const usados = {};
  const plano = antigas.map((nome) => {
    const dir = join(C, nome);
    const criado = nome.slice(0, 10);
    if (testesExtra.includes(nome) || /(^|-)teste(-|$)|ab-sessao/.test(nome)) return { nome, criado, teste: true, novo: `${TESTES}/${nome}` };
    const tipo = tipoDe(dir);
    usados[tipo] ??= +proximoId(slug, tipo).slice(1) - 1;
    const id = `${PREFIXO[tipo]}${String(++usados[tipo]).padStart(4, '0')}`;
    const s = slugs[nome] ?? nome.slice(11).replace(tipo === 'mockup' ? /^mockup-/ : /^$/, '');
    return { nome, criado, tipo, id, novo: `${id}-${s}`, familia: familias[nome] };
  });

  console.log(`${aplicar ? 'MIGRANDO' : 'SIMULAÇÃO (nada muda; rode com --aplicar)'} · companies/${slug}/contents\n`);
  for (const p of plano) console.log(`  ${p.nome.padEnd(36)} → ${p.novo}${p.tipo ? `  (${p.tipo}, criado ${p.criado}${p.familia ? `, família ${p.familia}` : ''})` : ''}`);

  // MP4 renomeados (pasta da peça e subpastas de exports/, fora das variantes, que têm nome próprio)
  const mp4s = [];
  for (const p of plano.filter((x) => x.id)) {
    const walk = (d) => { for (const f of existsSync(d) ? readdirSync(d) : []) { const g = join(d, f); if (statSync(g).isDirectory()) walk(g); else if (f.startsWith(`${p.nome}-`)) mp4s.push({ de: g, para: join(d, f.replace(`${p.nome}-`, `${p.id}-`)) }); } };
    walk(join(C, p.nome, 'exports'));
  }
  console.log(`\n  ${mp4s.length} arquivo(s) em exports/ perdem o nome longo${mp4s[0] ? ` (ex.: ${relative(C, mp4s[0].de).split(/[\\/]/).pop()} → ${mp4s[0].para.split(/[\\/]/).pop()})` : ''}`);

  // troca de texto: export longo → curto, depois pasta antiga → nova; do nome mais longo para o mais curto
  const trocas = [...plano].sort((a, b) => b.nome.length - a.nome.length).flatMap((p) => [
    ...(p.id ? [[new RegExp(`${p.nome}-(4x5|9x16|16x9|1x1)(?=[-.])`, 'g'), `${p.id}-$1`]] : []),
    [new RegExp(`(?<![\\w/-]${TESTES}/)${p.nome}(?![\\w-])`, 'g'), p.novo],
  ]);
  const PULA = new Set(['.git', 'worktrees', 'node_modules', 'render', 'renders', 'audio', 'cache', '.cache', 'molduras', 'dist']);
  const TEXTO = new Set(['.md', '.json', '.mjs', '.js', '.ts', '.tsx', '.html', '.yml', '.yaml', '.txt', '.css', '.jsonl']);
  const mudam = [];
  const varrer = (d) => {
    for (const f of readdirSync(d)) {
      if (PULA.has(f) || f.startsWith('qc')) continue;
      const g = join(d, f);
      let st; try { st = statSync(g); } catch { continue; }
      if (st.isDirectory()) { varrer(g); continue; }
      if (!TEXTO.has(extname(f).toLowerCase()) || st.size > 3e6) continue;
      const txt = readFileSync(g, 'utf8');
      if (!plano.some((p) => txt.includes(p.nome))) continue;
      let novo = txt;
      for (const [re, por] of trocas) novo = novo.replace(re, por);
      if (novo !== txt) mudam.push({ f: g, novo });
    }
  };
  varrer(ROOT);
  console.log(`  ${mudam.length} arquivo(s) de texto com o caminho antigo: ${[...new Set(mudam.map((m) => relative(ROOT, m.f).split(/[\\/]/).slice(0, 2).join('/')))].join(', ')}`);

  if (!aplicar) { console.log('\nConfira a tabela e rode de novo com --aplicar (feche o Explorer/terminal aberto dentro dessas pastas).'); process.exit(0); }

  // 1) texto (antes de mover: os caminhos lidos aqui ainda são os antigos) · 2) MP4 · 3) pastas · 4) fichas
  for (const m of mudam) writeFileSync(m.f, m.novo);
  for (const m of mp4s) renameSync(m.de, m.para);
  mkdirSync(join(C, TESTES), { recursive: true });
  const falhas = [];
  for (const p of plano) {
    try { renameSync(join(C, p.nome), join(C, p.novo)); } catch (e) { falhas.push(`${p.nome}: ${e.code ?? e.message}`); continue; }
    if (!p.id) continue;
    const fichaF = join(C, p.novo, 'peca.json');
    const ficha = lerJson(fichaF) ?? { tags: [], notes: {} };
    // o título que o app já mostrava continua (antes vinha do nome da pasta)
    const titulo = ficha.title ?? (slugs[p.nome] ? tituloPadrao(p.nome) : tituloPadrao(p.nome));
    const novo = { id: p.id, ...ficha, title: titulo, kind: ficha.kind ?? p.tipo, criado: ficha.criado ?? p.criado, ...(p.familia ? { familia: p.familia } : {}) };
    writeFileSync(fichaF, `${JSON.stringify(novo, null, 2)}\n`);
  }
  // a troca de texto mexeu em bloco.json de versões guardadas (campo origem): o hash volta a bater com o conteúdo
  const { rehash } = await import('./video-kit/scripts/versao.mjs');
  for (const p of plano.filter((x) => x.id && existsSync(join(C, x.novo, 'versoes')))) for (const l of rehash({ dir: join(C, p.novo) })) console.log(`  ${p.novo} · ${l}`);
  console.log(`\n✓ ${plano.length - falhas.length} pasta(s) movida(s) · ${mp4s.length} MP4 renomeado(s) · ${mudam.length} arquivo(s) de texto atualizados`);
  if (falhas.length) console.log(`⚠ não movidas (pasta em uso? feche e rode de novo): ${falhas.join(' · ')}`);
} else sai(`comando desconhecido: ${cmd}`);
