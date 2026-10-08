// Monta o composition.html de um vídeo a partir dos BLOCOS citados na timeline (tarefa 045).
//
//   node tools/video-kit/scripts/compor.mjs <pasta> [--listar]
//
// timeline.json:
//   "camadas": [{ "use": "fundo/blobs", "params": {…} }]           ← blocos do vídeo inteiro (fundo atrás do palco, frente na frente)
//   "scenes":  [{ "id": "s1", "use": "abertura/pergunta-fragmentos", "vo": ["f1"], "on_screen": "a|b", "params": {…} }]
//   "events":  [{ "id": "e2", "scene": "s1", "cue": "troca", "word": "f1:ainda", … }]   ← o bloco pede o tempo por ctx.cue('troca')
//
// Onde o bloco é procurado (o 1º que existir): <pasta>/blocos/<use> → companies/<slug>/video-templates/blocos/<use> → library/blocos/<use>.
// Bloco = bloco.json (slots, params padrão, camada) + bloco.html + bloco.css + bloco.js (BLOCO('<use>', fn)). Contrato em
// tools/video-kit/runtime/blocos.js e no TASK.md da 045. O CSS de cada bloco é prefixado com a classe do bloco (.b-<use>),
// então dois blocos podem usar os mesmos nomes de classe. `:scope` no CSS = a raiz do bloco.
// O produce.mjs chama este script sozinho quando a timeline tem blocos; o composition.html gerado não deve ser editado à mão.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { HUB, KIT, video } from './lib.mjs';

export function resolverBloco(v, use) {
  const lugares = [
    ['projeto', join(v.dir, 'blocos', use)],
    ['empresa', v.companyDir && join(v.companyDir, 'video-templates', 'blocos', use)],
    ['global', join(HUB, 'library', 'blocos', use)],
  ];
  for (const [escopo, dir] of lugares) if (dir && existsSync(join(dir, 'bloco.json'))) return { escopo, dir, use };
  throw new Error(`bloco "${use}" não encontrado (procurei em ${lugares.map(([, d]) => d).filter(Boolean).join(' · ')})`);
}

function lerBloco(v, use) {
  const r = resolverBloco(v, use);
  const ler = (f) => (existsSync(join(r.dir, f)) ? readFileSync(join(r.dir, f), 'utf8') : '');
  const meta = JSON.parse(ler('bloco.json'));
  const js = ler('bloco.js');
  if (/<\/script/i.test(js)) throw new Error(`${use}/bloco.js: tem fecho de tag script (o HyperFrames embute o JS na página)`);
  if (!js.includes(`BLOCO('${use}'`)) throw new Error(`${use}/bloco.js: registre com BLOCO('${use}', fn)`);
  return { ...r, meta, html: ler('bloco.html'), css: ler('bloco.css'), js };
}

const classe = (use) => 'b-' + use.replace(/[^\w-]+/g, '-');

/** Prefixa cada seletor do CSS com a classe do bloco (entra em @media/@supports; @keyframes e @font-face ficam como estão). */
export function prefixar(css, pre) {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let out = '', i = 0;
  while (i < semComentario.length) {
    const ab = semComentario.indexOf('{', i);
    if (ab < 0) break;
    const sel = semComentario.slice(i, ab).trim();
    // acha o fecho correspondente
    let prof = 1, j = ab + 1;
    while (j < semComentario.length && prof) { if (semComentario[j] === '{') prof++; else if (semComentario[j] === '}') prof--; j++; }
    const corpo = semComentario.slice(ab + 1, j - 1);
    if (/^@(media|supports|container)/.test(sel)) out += `${sel} {\n${prefixar(corpo, pre)}}\n`;
    else if (sel.startsWith('@')) out += `${sel} {${corpo}}\n`;
    else out += sel.split(',').map((s) => s.trim()).map((s) => (s.startsWith(':scope') ? s.replace(':scope', pre) : `${pre} ${s}`)).join(', ') + ` {${corpo}}\n`;
    i = j;
  }
  return out;
}

export function compor(v) {
  const tl = v.tl;
  const cenas = tl.scenes.filter((s) => s.use);
  if (!cenas.length) throw new Error('a timeline não usa blocos (nenhuma cena com "use")');
  const semBloco = tl.scenes.filter((s) => !s.use).map((s) => s.id);
  if (semBloco.length) throw new Error(`cenas sem bloco: ${semBloco.join(', ')} (todas precisam de "use" para compor)`);

  const instancias = [
    ...(tl.camadas || []).map((c, k) => ({ inst: c.inst || `c${k + 1}`, use: c.use, params: c.params, cena: null })),
    ...cenas.map((s) => ({ inst: s.id, use: s.use, cena: s.id })),
  ];
  const blocos = new Map();
  for (const it of instancias) if (!blocos.has(it.use)) blocos.set(it.use, lerBloco(v, it.use));

  const camada = (it) => (it.cena ? 'palco' : blocos.get(it.use).meta.camada || 'fundo');
  const div = (it) => `<div class="layer ${classe(it.use)}" data-inst="${it.inst}" data-bloco="${it.use}">\n${blocos.get(it.use).html.trim()}\n</div>`;
  const de = (onde) => instancias.filter((it) => camada(it) === onde).map(div).join('\n');

  // validação barata antes de montar: slots e cues que o bloco declara precisam existir na timeline
  const avisos = [];
  for (const s of cenas) {
    const m = blocos.get(s.use).meta;
    const partes = String(s.on_screen || '').split('|');
    if (m.slots && partes.length < m.slots.length) avisos.push(`${s.id} (${s.use}): on_screen tem ${partes.length} parte(s), o bloco espera ${m.slots.length} (${m.slots.join(' | ')})`);
    for (const c of m.cues || []) {
      const nome = typeof c === 'string' ? c : c.nome;
      const opcional = typeof c === 'object' && c.opcional;
      if (!opcional && !(tl.events || []).some((e) => e.scene === s.id && e.cue === nome)) avisos.push(`${s.id} (${s.use}): falta evento com cue "${nome}"`);
    }
  }
  if (avisos.length) throw new Error('blocos sem o que precisam:\n  ' + avisos.join('\n  '));

  const plano = instancias.map((it) => {
    const m = blocos.get(it.use).meta;
    const padroes = Object.fromEntries(Object.entries(m.params || {}).map(([k, p]) => [k, p && typeof p === 'object' && 'padrao' in p ? p.padrao : p]));
    return { inst: it.inst, use: it.use, cena: it.cena, slots: m.slots || [], padroes, ...(it.params ? { params: it.params } : {}) };
  });
  // ordem de montagem: fundo → cenas → frente (cada bloco mede o que precisa antes de animar)
  const ordem = ['fundo', 'palco', 'frente'];
  plano.sort((a, b) => ordem.indexOf(camada(a)) - ordem.indexOf(camada(b)));

  const base = readFileSync(join(KIT, 'runtime', 'base.css'), 'utf8');
  const marca = v.companyDir && existsSync(join(v.companyDir, 'video-templates', 'base.css')) ? readFileSync(join(v.companyDir, 'video-templates', 'base.css'), 'utf8') : '';
  const css = [...blocos.values()].map((b) => `/* ── ${b.use} (${b.escopo}) ── */\n${prefixar(b.css, '.' + classe(b.use))}`).join('\n');
  const js = [...blocos.values()].map((b) => `    <script>\n${b.js.trim()}\n    </script>`).join('\n');

  const html = `<!doctype html>
<!--
  GERADO por tools/video-kit/scripts/compor.mjs a partir dos blocos da timeline. NÃO edite aqui: edite o bloco
  (${[...blocos.values()].map((b) => `${b.use} [${b.escopo}]`).join(', ')}) ou a timeline.json e rode o compor/produce de novo.
-->
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=__W__, height=__H__" />
    <script src="kit/gsap.min.js"></script>
    <script src="kit/motion.js"></script>
    <link rel="stylesheet" href="brand/brand.css" />
    <style>
${base}
${marca}
${css}
    </style>
  </head>
  <body>
    <div id="root" class="f-__FORMAT__" data-composition-id="main" data-start="0" data-duration="__DURATION__" data-width="__W__" data-height="__H__">
${de('fundo')}
      <div id="stage">
${de('palco')}
      </div>
${de('frente')}
    </div>

    <script>
      window.__TL = __TIMELINE__
    </script>
    <script src="kit/tl.js"></script>
    <script src="kit/blocos.js"></script>
${js}
    <script>
      const tl = gsap.timeline({ paused: true })
      BLOCOS.montar(tl, ${JSON.stringify(plano)})
      tl.set({}, {}, T.duration)
      window.__timelines = window.__timelines || {}
      window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)
    </script>
  </body>
</html>
`;
  writeFileSync(join(v.dir, 'composition.html'), html);
  return { blocos: [...blocos.values()].map((b) => ({ use: b.use, escopo: b.escopo })) };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('compor.mjs')) {
  const v = video(process.argv[2]);
  const r = compor(v);
  if (process.argv.includes('--listar')) for (const b of r.blocos) console.log(`${b.use}  [${b.escopo}]`);
  console.log(`✓ composition.html montado com ${r.blocos.length} bloco(s)`);
}
