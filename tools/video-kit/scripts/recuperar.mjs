// Recupera a FONTE de um vídeo por blocos a partir de um HTML já montado (render/<formato>/index.html), para quando a
// timeline.json ou os blocos do projeto foram perdidos ou sobrescritos depois do export (tarefa 050).
//
//   node tools/video-kit/scripts/recuperar.mjs <pasta> [--de render/4x5] [--para <dir>]
//
// Grava em <para> (padrão <pasta>/_recuperado/): timeline.json (o __TL sem os campos do formato) e blocos/<use>/
// (bloco.json com slots, padrões e cues; bloco.html com os ícones de volta a {{i:…}}; bloco.css sem o prefixo; bloco.js)
// de cada bloco de escopo "projeto". Blocos da empresa ou globais não são copiados (continuam onde estão).
// Desde a 050 o produce guarda cada versão em versoes/vNN/: isto é só para peças antigas.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { KIT } from './lib.mjs';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const pasta = resolve(args[0] ?? '');
const de = join(pasta, flag('de') ?? 'render/4x5', 'index.html');
const para = resolve(flag('para') ?? join(pasta, '_recuperado'));
if (!existsSync(de)) throw new Error(`não achei ${de} (use --de render/<formato>)`);

const html = readFileSync(de, 'utf8');
const linhas = html.split('\n');
const classe = (use) => 'b-' + use.replace(/[^\w-]+/g, '-');

// timeline: o __TL sem o que o produce acrescenta por formato
const tlLinha = linhas.find((l) => l.includes('window.__TL = '));
const tl = JSON.parse(tlLinha.slice(tlLinha.indexOf('window.__TL = ') + 14));
for (const k of ['format', 'W', 'H']) delete tl[k];

// plano do BLOCOS.montar: slots e padrões de cada instância
const montar = linhas.find((l) => l.includes('BLOCOS.montar(tl, '));
const plano = JSON.parse(montar.slice(montar.indexOf('BLOCOS.montar(tl, ') + 18, montar.lastIndexOf(')')));

// ícones: o SVG montado volta a ser {{i:nome}}
const icons = JSON.parse(readFileSync(join(KIT, 'runtime', 'icons.json'), 'utf8'));
const svg = (body) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const desicone = (s) => Object.entries(icons).sort((a, b) => b[1].length - a[1].length).reduce((acc, [n, b]) => acc.replaceAll(svg(b), `{{i:${n}}}`), s);

// CSS por bloco: seções "/* ── use (escopo) ── */"
const css = {};
const re = /\/\* ── ([\w/-]+) \((\w+)\) ── \*\/\n([\s\S]*?)(?=\/\* ── |\n\s*<\/style>)/g;
for (let m; (m = re.exec(html)); ) css[m[1]] = { escopo: m[2], css: m[3] };

// HTML por bloco: miolo da primeira <div class="layer …" data-bloco="use"> (até a próxima layer ou o fim do palco)
function marcacao(use) {
  const i = linhas.findIndex((l) => l.startsWith('<div class="layer') && l.includes(`data-bloco="${use}"`));
  // a layer acaba antes da próxima layer ou da linha indentada que fecha o palco/abre o palco; a última linha dela é o "</div>"
  let j = i + 1;
  while (j < linhas.length && !linhas[j].startsWith('<div class="layer') && !/^ {6}<\/div>$|<div id="stage">|^\s*<script/.test(linhas[j])) j++;
  let fim = j - 1;
  while (fim > i && linhas[fim].trim() !== '</div>') fim--;
  return linhas.slice(i + 1, fim).join('\n');
}

// JS por bloco: <script> com BLOCO('use'
function script(use) {
  const m = html.match(new RegExp(`<script>\\n(BLOCO\\('${use.replace(/[/-]/g, '\\$&')}'[\\s\\S]*?)\\n\\s*</script>`));
  return m?.[1];
}

const feitos = [];
for (const p of plano) {
  const c = css[p.use];
  if (!c || c.escopo !== 'projeto' || feitos.includes(p.use)) continue;
  const pre = '.' + classe(p.use);
  const cssLimpo = c.css.split('\n').map((l) => l.replaceAll(`${pre} `, '').replaceAll(pre, ':scope')).join('\n').trim();
  const cues = [...new Set((tl.events || []).filter((e) => e.scene === p.cena && e.cue).map((e) => e.cue))];
  const meta = {
    id: p.use, tipo: p.use.split('/')[0], titulo: `${p.use} (recuperado do render)`, camada: 'palco', slots: p.slots,
    params: Object.fromEntries(Object.entries(p.padroes).map(([k, v]) => [k, { padrao: v, descricao: '' }])),
    cues, elastico: true, formatos: tl.formats, origem: `recuperado de ${de.slice(pasta.length + 1).replace(/\\/g, '/')} pelo recuperar.mjs`, licenca: 'própria',
  };
  const dir = join(para, 'blocos', p.use);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'bloco.json'), `${JSON.stringify(meta, null, 2)}\n`);
  writeFileSync(join(dir, 'bloco.html'), `${desicone(marcacao(p.use))}\n`);
  writeFileSync(join(dir, 'bloco.css'), `${cssLimpo}\n`);
  const js = script(p.use);
  if (!js) throw new Error(`não achei o script de ${p.use}`);
  writeFileSync(join(dir, 'bloco.js'), `${js.trim()}\n`);
  feitos.push(p.use);
}
mkdirSync(para, { recursive: true });
writeFileSync(join(para, 'timeline.json'), `${JSON.stringify(tl, null, 2)}\n`);
console.log(`✓ ${para}: timeline.json + ${feitos.length} bloco(s) do projeto (${feitos.join(', ')})`);
