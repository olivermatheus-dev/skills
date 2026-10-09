// Galeria de blocos de vídeo (tarefa 045 G). Regras e lógica em tools/lib/blocos.mjs; o app usa o mesmo (Formatos → Blocos de vídeo).
//
//   node tools/video/blocos.mjs indice                                   regera library/INDEX.md (1 linha por bloco, todas as empresas)
//   node tools/video/blocos.mjs buscar "<termos>" [--empresa kz] [--tipo cta] [--formato 9x16] [--escopo global|empresa|projeto] [--json]
//                                                                         5–10 melhores (id, título, cues, usos, prévia); sem abrir mídia
//   node tools/video/blocos.mjs previews [--empresa kz] [--use cena/x] [--forcar]
//                                                                         preview.png de cada bloco: 1 quadro assentado do vídeo onde foi usado
//   node tools/video/blocos.mjs folha <use> [<use>…] [--empresa kz] [--saida arquivo.png]
//                                                                         folha com as prévias dos finalistas lado a lado (1 imagem para olhar)
//   node tools/video/blocos.mjs promover <use> --de <pasta-do-video|slug> [--para empresa|global] [--copiar] [--forcar]
//                                                                         sobe o bloco (projeto → marca → global); move por padrão, nunca sobrescreve
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { ROOT, buscar, catalogo, escreverIndice, gerarPreviews, promover } from '../lib/blocos.mjs';

const args = process.argv.slice(2);
const COM_VALOR = ['empresa', 'tipo', 'formato', 'escopo', 'use', 'de', 'para', 'saida'];
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const has = (n) => args.includes(`--${n}`);
const pos = args.filter((a, i) => !a.startsWith('--') && !COM_VALOR.includes(args[i - 1]?.slice(2)));
const [cmd, ...resto] = pos;
const sai = (m) => { console.error(m); process.exit(1); };
const onde = (b) => (b.escopo === 'global' ? 'global' : b.escopo === 'empresa' ? `marca ${b.empresa}` : `projeto ${b.empresa}/${b.pasta}`);

if (cmd === 'indice') {
  const r = escreverIndice();
  console.log(`✓ ${r.arquivo}: ${r.blocos} blocos`);
} else if (cmd === 'buscar') {
  const q = resto.join(' ');
  const r = buscar(q, { empresa: opt('empresa'), tipo: opt('tipo'), formato: opt('formato'), escopo: opt('escopo'), limite: 10 });
  if (has('json')) { console.log(JSON.stringify(r.map(({ use, escopo, empresa, pasta, dir, preview, usos, pontos, meta }) => ({ use, escopo, empresa, pasta, dir, preview, usos: usos.length, pontos, titulo: meta.titulo, cues: meta.cues, slots: meta.slots, min_s: meta.min_s, formatos: meta.formatos })), null, 2)); process.exit(0); }
  if (!r.length) { console.log(`Nada para "${q}". Veja o índice inteiro: library/INDEX.md`); process.exit(0); }
  for (const b of r) {
    console.log(`${b.use}  [${onde(b)}]  ${b.meta.titulo ?? ''}`);
    console.log(`   slots: ${(b.meta.slots ?? []).join(' | ') || '—'} · cues: ${(b.meta.cues ?? []).join(', ') || '—'} · min ${b.meta.min_s ?? '—'} s · ${(b.meta.formatos ?? []).join(' ') || 'todos'} · ${b.usos.length} uso(s)${b.preview ? ` · prévia: ${b.preview}` : ''}`);
  }
  console.log(`\nVer os finalistas juntos: node tools/video/blocos.mjs folha ${r.slice(0, 4).map((b) => b.use).join(' ')}`);
} else if (cmd === 'previews') {
  const r = gerarPreviews({ empresa: opt('empresa'), use: opt('use'), forcar: has('forcar') });
  console.log(`✓ ${r.feitos.length} prévia(s) gerada(s)${r.feitos.length ? ': ' + r.feitos.join(', ') : ''}`);
  if (r.pulados.length) console.log(`  ${r.pulados.length} já tinham (--forcar refaz)`);
  if (r.sem_fonte.length) console.log(`  sem vídeo exportado que use o bloco: ${r.sem_fonte.join(' · ')}`);
  escreverIndice();
} else if (cmd === 'folha') {
  if (!resto.length) sai('uso: blocos.mjs folha <use> [<use>…]');
  const cat = catalogo({ empresa: opt('empresa') });
  const itens = resto.map((u) => cat.find((b) => b.use === u && b.preview) ?? cat.find((b) => b.use === u) ?? { use: u, faltando: true });
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#f4f4f5;font:14px system-ui;display:flex;gap:16px;flex-wrap:wrap;width:${Math.min(itens.length, 4) * 300}px}
    .c{width:284px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px #0002}.c img,.c .x{width:284px;height:355px;object-fit:cover;display:block;background:#ddd}
    .c .x{display:flex;align-items:center;justify-content:center;color:#888}.t{padding:8px 10px}.u{font:600 13px ui-monospace,monospace}.d{color:#555;font-size:12px;margin-top:4px}</style>
    ${itens.map((b) => `<div class="c">${b.preview ? `<img src="${pathToFileURL(join(ROOT(), b.preview)).href}">` : `<div class="x">${b.faltando ? 'não existe' : 'sem prévia'}</div>`}<div class="t"><div class="u">${esc(b.use)}</div><div class="d">${esc(b.faltando ? '' : `${onde(b)} · ${b.meta.titulo ?? ''}`.slice(0, 140))}</div></div></div>`).join('')}`;
  const dir = mkdtempSync(join(tmpdir(), 'folha-blocos-'));
  const page = join(dir, 'folha.html');
  writeFileSync(page, html);
  const saida = resolve(opt('saida') ?? join(dir, 'folha.png'));
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: Math.min(itens.length, 4) * 300 + 48, height: 600 }, deviceScaleFactor: 1 });
  await p.goto(pathToFileURL(page).href);
  await p.waitForLoadState('networkidle');
  await p.screenshot({ path: saida, fullPage: true });
  await b.close();
  console.log(`✓ ${saida}`);
} else if (cmd === 'promover') {
  const use = resto[0], de = opt('de');
  if (!use || !de) sai('uso: blocos.mjs promover <use> --de <pasta-do-video|slug> [--para empresa|global] [--copiar] [--forcar]');
  // --de: caminho da pasta do vídeo (companies/<slug>/contents/<pasta>) ou o slug da empresa (bloco da marca → global)
  const abs = resolve(de);
  const m = abs.split('\\').join('/').match(/companies\/([a-z0-9-]+)(?:\/contents\/(.+?))?\/?$/);
  const empresa = m?.[1] ?? (existsSync(join(ROOT(), 'companies', de)) ? de : opt('empresa'));
  if (!empresa) sai(`não sei de que empresa é ${de}; passe o caminho da pasta do vídeo ou --empresa`);
  try {
    const r = promover({ empresa, use, de: m?.[2] ?? empresa, para: opt('para'), copiar: has('copiar'), forcar: has('forcar') });
    if (!r.ok) { console.log(`✗ não subiu para o global:\n  - ${r.erros.join('\n  - ')}${r.avisos.length ? '\n  ⚠ ' + r.avisos.join('\n  ⚠ ') : ''}\n  (corrija o bloco ou use --forcar)`); process.exit(1); }
    console.log(`✓ ${use}: ${r.de} → ${r.para}${r.movido ? ' (movido; os vídeos continuam achando o bloco)' : ' (copiado)'} · ${r.usos} uso(s) · library/INDEX.md atualizado`);
    for (const a of r.avisos) console.log(`  ⚠ ${a}`);
  } catch (e) { sai(`✗ ${e.message}`); }
} else {
  sai('uso: node tools/video/blocos.mjs indice | buscar "<termos>" | previews | folha <use…> | promover <use> --de <pasta> (veja o cabeçalho)');
}
