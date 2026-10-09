// Contraste WCAG. Três usos:
//  1. Duas cores:   node tools/contrast.mjs "#ffffff" "#ef7960"
//  2. Tokens:       node tools/contrast.mjs companies/kz/brand/brand.css
//  3. RENDER REAL:  node tools/contrast.mjs --html <arquivo.html> [--seletor .slide] [--tempo 2.5 | --tempos 1,2.5,4] [--json]
//     Abre no Chromium, esconde o texto, mede o fundo em pixels (imagem/gradiente/card) e reprova (✗) o texto
//     abaixo de 4,5:1 (corpo) ou 3:1 (grande: ≥48 px em arte de 1080, ou ≥38 px com peso ≥600). Pior caso = p10.
//     Carrossel: --seletor .slide (padrão quando há .slide). Vídeo: abra render/<fmt>/index.html (o formato vem do #root)
//     e passe --tempo(s): o script faz window.__timelines.main.seek(t) como o kit (sincronia.mjs). Sem --tempo em vídeo = t=0.
//     Saída curta; código de saída 1 se houver ✗. Lógica em tools/lib/contraste-pagina.mjs (auditarContraste).
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
if (argv.includes('--html')) {
  const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const file = resolve(opt('--html') || '');
  if (!existsSync(file)) { console.error('Arquivo não encontrado: ' + file); process.exit(2); }
  const json = argv.includes('--json');
  let seletor = opt('--seletor');
  const tempos = (opt('--tempos') || opt('--tempo') || '').split(',').filter(Boolean).map(Number);
  const { chromium } = await import('playwright');
  const { auditarContraste } = await import('./lib/contraste-pagina.mjs');
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
  let falhou = false;
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
    // vídeo: o viewport precisa ser o do quadro ANTES de carregar (como o kit; trocar depois derruba a página)
    const dim = readFileSync(file, 'utf8').match(/id="root"[^>]*data-width="(d+)"[^>]*data-height="(d+)"/);
    if (dim) await page.setViewportSize({ width: +dim[1], height: +dim[2] });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const video = await page.evaluate(() => {
      const r = document.getElementById('root');
      return r && window.__timelines?.main ? { w: +r.dataset.width || r.offsetWidth, h: +r.dataset.height || r.offsetHeight } : null;
    });
    if (video) {
      seletor ??= '#root';
    } else if (!seletor && (await page.$('.slide'))) seletor = '.slide';
    await page.waitForTimeout(1500); // a 1ª pintura de composição pesada trava o seek logo após o load
    const instantes = video ? (tempos.length ? tempos : [0]) : [null];
    const todos = [];
    for (const t of instantes) {
      if (t != null) { // avança em passos de 1/15 s como o kit (um salto direto de 0 até t trava composições pesadas)
        await page.evaluate((s) => { const tl = window.__timelines.main; let x = tl.time() > s ? 0 : tl.time(); for (; x < s; x += 1 / 15) tl.seek(x, false); tl.seek(s, false); }, t);
        await page.waitForTimeout(100); }
      const r = await auditarContraste(page, { seletor });
      todos.push(...r.map((x) => ({ ...(t != null ? { t } : {}), ...x })));
    }
    falhou = todos.some((x) => !x.ok);
    if (json) console.log(JSON.stringify(todos, null, 1));
    else {
      const chaves = [...new Set(todos.map((x) => (x.t != null ? `t=${x.t}s` : `slide ${x.slide}`)))];
      for (const c of chaves) {
        const lin = todos.filter((x) => (x.t != null ? `t=${x.t}s` : `slide ${x.slide}`) === c);
        const ruins = lin.filter((x) => !x.ok);
        console.log(`${c}: ${lin.length - ruins.length}/${lin.length} ok`);
        for (const x of ruins) console.log(`  ✗ ${x.razao}:1 (mín ${x.minimo}) "${x.texto}" ${x.cor} sobre ${x.fundo} · ${x.seletor} · ${x.px}px @${x.bbox.x},${x.bbox.y}`);
      }
      const n = todos.filter((x) => !x.ok).length;
      console.log(n ? `RESUMO: ${n} reprovado(s) de ${todos.length}` : `RESUMO: tudo ok (${todos.length} trechos)`);
    }
  } finally { await browser.close(); }
  process.exit(falhou ? 1 : 0);
}


const lum = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const verdict = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'só texto grande' : 'REPROVADO');

const [a, b] = process.argv.slice(2);
if (a && existsSync(a)) {
  const css = readFileSync(a, 'utf8');
  const v = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)].map((m) => [m[1], m[2]]));
  const pairs = [
    ['text', 'bg'], ['text', 'surface'], ['accent', 'bg'], ['primary', 'bg'],
    ['on-primary', 'primary'], ['on-inverse', 'inverse-bg'], ['muted', 'surface'],
  ];
  for (const [fg, bg] of pairs) {
    if (!v[fg] || !v[bg]) continue;
    const r = ratio(v[fg], v[bg]);
    console.log(`${`--${fg} sobre --${bg}`.padEnd(30)} ${v[fg]} / ${v[bg]}  ${r.toFixed(2)}:1  ${verdict(r)}`);
  }
} else if (a && b) {
  const r = ratio(a, b);
  console.log(`${a} / ${b}  ${r.toFixed(2)}:1  ${verdict(r)}`);
} else {
  console.log('Uso: node tools/contrast.mjs "#fff" "#ef7960"  |  node tools/contrast.mjs companies/<slug>/brand/brand.css');
}
