#!/usr/bin/env node
// Uso: node .claude/skills/carousel/scripts/render.mjs <carrossel.html> [pasta-saida] [--escala 2] [--sem-contato]
// Gera um PNG por <section class="slide"> (slide-01.png…) no tamanho do slide × escala (padrão 1 = 1080 px de largura)
// e a folha de contato (contato.png, ao lado da pasta png/): o carrossel em sequência + a grade do perfil
// (capa recortada em 3:4, no tamanho de miniatura do celular ≈ 1/3 da largura = teste dos 33%).
// Espera fontes (document.fonts) e imagens; avisa fonte da marca que não carregou (render inválido).
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1] === '--escala'));
const [htmlArg, outArg] = pos;
if (!htmlArg) {
  console.error('Uso: node .claude/skills/carousel/scripts/render.mjs <carrossel.html> [pasta-saida] [--escala 2] [--sem-contato]');
  process.exit(1);
}
const escala = Number(opt('escala') || 1);
const htmlPath = resolve(htmlArg);
const outDir = resolve(outArg || join(dirname(htmlPath), 'png'));
const contatoDir = basename(outDir) === 'png' ? dirname(outDir) : outDir;

let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  console.error('Playwright não está instalado. Rode na raiz: npm i -D playwright (e, se pedir, npx playwright install chromium).');
  process.exit(1);
}
let browser;
try { browser = await chromium.launch(); } catch (e1) {
  try { browser = await chromium.launch({ channel: 'chrome' }); } catch {
    console.error('Não consegui abrir o navegador. Rode: npx playwright install chromium\n' + e1.message);
    process.exit(1);
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: escala });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  // fontes: espera o carregamento e confere se as famílias usadas nos slides existem de fato
  const fontes = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    const usadas = new Map();
    for (const el of document.querySelectorAll('.slide, .slide *')) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      usadas.set(`${cs.fontStyle} ${cs.fontWeight} 40px "${fam}"`, fam);
    }
    const genericas = ['serif', 'sans-serif', 'Georgia', 'Arial', 'Roboto', '-apple-system', 'Segoe UI', 'system-ui'];
    const faltam = [];
    for (const [spec, fam] of usadas) {
      if (genericas.includes(fam)) continue;
      try { await document.fonts.load(spec); } catch {}
      if (!document.fonts.check(spec)) faltam.push(spec);
    }
    return faltam;
  });
  if (fontes.length) console.warn(`⚠ fonte não carregou (render inválido para crítica): ${[...new Set(fontes)].join(' · ')}`);

  const slides = await page.$$('.slide');
  if (!slides.length) throw new Error('Nenhum elemento .slide encontrado no HTML.');
  mkdirSync(outDir, { recursive: true });
  const arquivos = [];
  for (let i = 0; i < slides.length; i++) {
    const file = join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: file });
    arquivos.push(file);
    console.log('✓', file);
  }
  console.log(`${slides.length} slide(s) exportado(s) em ${outDir}${escala !== 1 ? ` (escala ${escala}×)` : ''}`);

  if (!flag('sem-contato') && slides.length > 1) {
    const meta = await page.$$eval('.slide', (els) => els.map((e) => ({ layout: e.dataset.layout || '', w: e.offsetWidth, h: e.offsetHeight })));
    const img = (f) => `data:image/png;base64,${readFileSync(f).toString('base64')}`;
    const W = 248, H = Math.round(W * meta[0].h / meta[0].w);
    const cols = Math.min(6, slides.length);
    const tile = 280; // miniatura da grade do perfil no celular ≈ 1/3 de 1080 com escala de tela
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box;margin:0}body{background:#ecebe8;font:600 15px/1.3 system-ui,sans-serif;color:#3a3a3a;padding:32px;width:${cols * (W + 16) + 48}px}
      h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#777;margin:0 0 14px}
      .seq{display:grid;grid-template-columns:repeat(${cols},${W}px);gap:16px 16px;margin-bottom:36px}
      .seq figure img{width:${W}px;height:${H}px;display:block;box-shadow:0 1px 2px rgba(0,0,0,.12)}
      .seq figcaption{margin-top:6px;font-size:13px;color:#555;display:flex;justify-content:space-between}
      .perfil{display:grid;grid-template-columns:repeat(3,${tile}px);gap:3px;width:${tile * 3 + 6}px;background:#fff;padding:0}
      .perfil div{width:${tile}px;height:${Math.round(tile * 4 / 3)}px;overflow:hidden;background:#d9d6d1;display:grid;place-items:center;color:#999;font-size:12px}
      .perfil .capa{background-size:cover;background-position:center}
      .lado{display:flex;gap:40px;align-items:flex-start}.nota{max-width:360px;color:#666;font-weight:500}
    </style></head><body>
      <h2>Carrossel em sequência</h2>
      <div class="seq">${arquivos.map((f, i) => `<figure><img src="${img(f)}"><figcaption><span>${String(i + 1).padStart(2, '0')}</span><span>${meta[i].layout}</span></figcaption></figure>`).join('')}</div>
      <div class="lado"><div><h2>Grade do perfil (capa em 3:4)</h2>
      <div class="perfil"><div class="capa" style="background-image:url(${img(arquivos[0])})"></div><div>post anterior</div><div>post anterior</div><div>post anterior</div><div>post anterior</div><div>post anterior</div></div></div>
      <p class="nota">A miniatura tem ~${tile} px de largura (≈ 1/3 do slide): o título da capa precisa ler aqui. O recorte 3:4 corta ~34 px de cada lado do 4:5.</p></div>
    </body></html>`;
    const p2 = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
    await p2.setContent(html, { waitUntil: 'load' });
    const sheet = join(contatoDir, 'contato.png');
    await p2.screenshot({ path: sheet, fullPage: true });
    console.log('✓ folha de contato:', sheet);
  }
} catch (e) {
  console.error('Erro ao renderizar:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
