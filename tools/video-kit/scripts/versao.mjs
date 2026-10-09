// Versões de um vídeo (tarefa 050): cada export guarda a FONTE que gerou o MP4 em versoes/vNN/, para que uma anotação
// feita na v03 sempre possa ser refeita a partir da v03, mesmo que o plano, a timeline ou os blocos mudem depois.
//
//   node tools/video-kit/scripts/versao.mjs <pasta> listar                 versões, formatos exportados e se a fonte atual é igual
//   node tools/video-kit/scripts/versao.mjs <pasta> diff vNN               o que mudou na fonte atual desde a vNN
//   node tools/video-kit/scripts/versao.mjs <pasta> restaurar vNN [--so-projeto]   a fonte volta a ser a da vNN, igual (a atual vai para versoes/_backup-<hora>/)
//   node tools/video-kit/scripts/versao.mjs <pasta> rehash                 recalcula o hash guardado de cada versão
//
// versoes/vNN/: versao.json (número, hash da fonte, formatos → export, blocos e de onde vieram) · timeline.json ·
// composition.html (o modelo, com os marcadores) · blocos/<use>/ (TODOS os blocos usados, de qualquer escopo) · data/.
// O produce.mjs grava sozinho (gravarVersao) e reaproveita o número quando a fonte não mudou e falta só outro formato.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { video } from './lib.mjs';
import { compor, resolverBloco } from './compor.mjs';

const VDIR = (v) => join(v.dir, 'versoes');
const pad = (n) => String(n).padStart(2, '0');
const lerJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);

function arquivos(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? arquivos(join(dir, d.name)) : [join(dir, d.name)])).sort();
}
// miniatura do bloco (preview.png/.json, gerada para a galeria) não é fonte: não muda o vídeo nem a versão
const naoFonte = (f) => /[\\/]preview\.[^\\/]+$/.test(f);
const arquivosFonte = (dir) => arquivos(dir).filter((f) => !naoFonte(f));

/** hash da fonte: timeline + modelo da composição + arquivos de cada bloco usado + data/ */
export function hashFonte(v, { html, blocos = [] }) {
  const h = createHash('sha1');
  h.update(readFileSync(v.file, 'utf8').replace(/\r\n/g, '\n'));
  h.update(html.replace(/\r\n/g, '\n'));
  for (const b of [...blocos].sort((a, c) => a.use.localeCompare(c.use))) for (const f of arquivosFonte(b.dir)) { h.update(b.use + relative(b.dir, f)); h.update(readFileSync(f)); }
  for (const f of arquivos(join(v.dir, 'data'))) h.update(readFileSync(f));
  return h.digest('hex').slice(0, 12);
}

export function versoes(v) {
  if (!existsSync(VDIR(v))) return [];
  return readdirSync(VDIR(v)).filter((n) => /^v\d+$/.test(n)).map((n) => ({ nome: n, n: +n.slice(1), ...lerJson(join(VDIR(v), n, 'versao.json')) })).sort((a, b) => a.n - b.n);
}

/** número da versão deste export: a última, se a fonte é a mesma e o formato ainda não saiu nela; senão a próxima livre */
export function numeroVersao(v, hash, formato, exportsExistentes = []) {
  const vs = versoes(v);
  const ult = vs.at(-1);
  if (ult && ult.hash === hash && !ult.formatos?.[formato]) return pad(ult.n);
  return pad(Math.max(0, ...exportsExistentes, ...vs.map((x) => x.n)) + 1);
}

/** grava (ou completa) versoes/vNN com a fonte deste export */
export function gravarVersao(v, num, { hash, html, blocos = [], formato, saida }) {
  const dir = join(VDIR(v), `v${num}`);
  const meta = lerJson(join(dir, 'versao.json'));
  if (meta && meta.hash !== hash) throw new Error(`versoes/v${num} já existe com outra fonte (hash ${meta.hash} ≠ ${hash}): exporte sem --v para sair numa versão nova`);
  if (!meta) {
    mkdirSync(dir, { recursive: true });
    cpSync(v.file, join(dir, 'timeline.json'));
    writeFileSync(join(dir, 'composition.html'), html);
    for (const b of blocos) cpSync(b.dir, join(dir, 'blocos', b.use), { recursive: true, filter: (f) => !naoFonte(f) });
    if (existsSync(join(v.dir, 'data'))) cpSync(join(v.dir, 'data'), join(dir, 'data'), { recursive: true });
  }
  const novo = {
    versao: `v${num}`, criado: meta?.criado ?? new Date().toISOString().slice(0, 19), hash,
    formatos: { ...(meta?.formatos ?? {}), [formato]: relative(v.dir, saida).replace(/\\/g, '/') },
    blocos: blocos.map((b) => ({ use: b.use, escopo: b.escopo })), ...(meta?.nota ? { nota: meta.nota } : {}),
  };
  writeFileSync(join(dir, 'versao.json'), `${JSON.stringify(novo, null, 2)}\n`);
  return novo;
}

/** recalcula o hash de cada versão pelo que está guardada nela (depois de uma troca de texto em massa, ex.: migração 050) */
export function rehash(v) {
  const out = [];
  for (const x of versoes(v)) {
    const base = join(VDIR(v), x.nome);
    const blocos = (x.blocos ?? []).map((b) => ({ use: b.use, dir: join(base, 'blocos', b.use) }));
    const hash = hashFonte({ dir: base, file: join(base, 'timeline.json') }, { html: readFileSync(join(base, 'composition.html'), 'utf8'), blocos });
    if (hash !== x.hash) {
      const f = join(base, 'versao.json');
      writeFileSync(f, `${JSON.stringify({ ...lerJson(f), hash }, null, 2)}\n`);
      out.push(`${x.nome}: ${x.hash} → ${hash}`);
    }
  }
  return out;
}

/** versão de um MP4 pelo nome (…-v03.mp4 → 3) */
export const versaoDoArquivo = (nome) => +(String(nome).match(/-v(\d+)(?:-60fps)?\.mp4$/)?.[1] ?? 0) || null;

// ---------- fonte atual, diff e restaurar (CLI e app, 050 D) ----------
/** a fonte que o próximo export usaria (composição montada sem gravar) */
export function fonteAtual(v) {
  if (!v.tl.scenes.some((s) => s.use)) return { html: readFileSync(join(v.dir, 'composition.html'), 'utf8'), blocos: [] };
  const r = compor(v, { gravar: false });
  return { html: r.html, blocos: r.blocos };
}
/** hash da fonte atual, ou null se ela não monta (bloco faltando, cue sem evento…) */
export function hashAtual(v) {
  try { return hashFonte(v, fonteAtual(v)); } catch { return null; }
}
/** o que mudou na fonte atual desde a versão `nome` (lista vazia = igual) */
export function diffVersao(v, nome) {
  const x = acharVersao(v, nome);
  const base = join(VDIR(v), x.nome);
  const dif = [];
  if (readFileSync(join(base, 'timeline.json'), 'utf8') !== readFileSync(v.file, 'utf8')) dif.push('timeline.json');
  const { blocos } = fonteAtual(v);
  for (const b of blocos) {
    const snap = join(base, 'blocos', b.use);
    if (!existsSync(snap)) { dif.push(`bloco novo: ${b.use}`); continue; }
    for (const f of arquivosFonte(b.dir)) { const g = join(snap, relative(b.dir, f)); if (!existsSync(g) || !readFileSync(g).equals(readFileSync(f))) dif.push(`${b.use}/${relative(b.dir, f).replace(/\\/g, '/')} [${b.escopo}]`); }
  }
  for (const b of x.blocos ?? []) if (!blocos.some((c) => c.use === b.use)) dif.push(`bloco saiu: ${b.use}`);
  return dif;
}
function acharVersao(v, nome) {
  const vs = versoes(v);
  const x = vs.find((y) => y.nome === nome);
  if (!x) throw new Error(`versão ${nome} não existe (há: ${vs.map((y) => y.nome).join(', ') || 'nenhuma'})`);
  return x;
}
/**
 * A fonte atual volta a ser a da versão `nome`; a de antes vai para versoes/_backup-<hora>/.
 * Blocos do projeto voltam como eram. Bloco da empresa/global que mudou na biblioteca desde então: com `fiel` (padrão)
 * a cópia guardada entra em blocos/ da peça (o projeto vence a biblioteca) e o vídeo sai igual; sem `fiel`, só avisa.
 */
export function restaurar(v, nome, { fiel = true } = {}) {
  const x = acharVersao(v, nome);
  const base = join(VDIR(v), x.nome);
  const bk = join(VDIR(v), `_backup-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}`);
  mkdirSync(bk, { recursive: true });
  for (const f of ['timeline.json', 'composition.html']) if (existsSync(join(v.dir, f))) cpSync(join(v.dir, f), join(bk, f));
  if (existsSync(join(v.dir, 'blocos'))) cpSync(join(v.dir, 'blocos'), join(bk, 'blocos'), { recursive: true });
  cpSync(join(base, 'timeline.json'), v.file);
  cpSync(join(base, 'composition.html'), join(v.dir, 'composition.html'));
  const avisos = [];
  for (const b of x.blocos ?? []) {
    const snap = join(base, 'blocos', b.use);
    const local = join(v.dir, 'blocos', b.use);
    if (b.escopo === 'projeto') { rmSync(local, { recursive: true, force: true }); cpSync(snap, local, { recursive: true }); continue; }
    const atual = resolverBloco(v, b.use).dir;
    const mudou = arquivosFonte(snap).some((f) => { const g = join(atual, relative(snap, f)); return !existsSync(g) || !readFileSync(g).equals(readFileSync(f)); });
    if (!mudou) continue;
    if (fiel) { rmSync(local, { recursive: true, force: true }); cpSync(snap, local, { recursive: true }); avisos.push(`${b.use} [${b.escopo}] mudou na biblioteca: a cópia da ${x.nome} entrou em blocos/${b.use} da peça`); }
    else avisos.push(`${b.use} [${b.escopo}] mudou na biblioteca desde a ${x.nome}: para ficar igual, copie versoes/${x.nome}/blocos/${b.use} para blocos/${b.use}`);
  }
  return { versao: x.nome, backup: relative(v.dir, bk).replace(/\\/g, '/'), avisos };
}

// ---------- CLI ----------
if (process.argv[1]?.endsWith('versao.mjs')) {
  const [pasta, cmd = 'listar', alvo] = process.argv.slice(2);
  const v = video(pasta);
  const vs = versoes(v);
  if (cmd === 'listar') {
    const atual = hashAtual(v);
    if (!atual) console.log('(fonte atual não monta: rode compor.mjs para ver o erro)');
    if (!vs.length) console.log('nenhuma versão guardada ainda (o próximo export grava versoes/v01…)');
    for (const x of vs) console.log(`${x.nome}  ${x.criado}  ${Object.keys(x.formatos ?? {}).join(' + ') || '—'}${x.hash === atual ? '  ← igual à fonte atual' : ''}${x.nota ? `  · ${x.nota}` : ''}`);
    if (atual && !vs.some((x) => x.hash === atual)) console.log('fonte atual: mudou desde a última versão (o próximo export sai numa versão nova)');
  } else if (cmd === 'diff') {
    const dif = diffVersao(v, alvo);
    console.log(dif.length ? `mudou desde a ${alvo}:\n  ${dif.join('\n  ')}` : `fonte atual = ${alvo}`);
  } else if (cmd === 'restaurar') {
    const r = restaurar(v, alvo, { fiel: !process.argv.includes('--so-projeto') });
    console.log(`✓ fonte de volta à ${r.versao} (a de antes está em ${r.backup})${r.avisos.length ? `\n⚠ ${r.avisos.join('\n⚠ ')}` : ''}`);
  } else if (cmd === 'rehash') {
    const r = rehash(v);
    console.log(r.length ? `hash recalculado: ${r.join(' · ')}` : 'hashes já batem com o conteúdo de cada versão');
  } else throw new Error(`comando desconhecido: ${cmd} (listar | diff vNN | restaurar vNN [--so-projeto] | rehash)`);
}
