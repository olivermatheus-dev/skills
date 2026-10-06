#!/usr/bin/env node
// Uso: node .claude/skills/carousel/scripts/render.mjs <caminho/carrossel.html> [pasta-saida]
// Gera um PNG por <section class="slide"> (slide-01.png, slide-02.png...).
import { mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [htmlArg, outArg] = process.argv.slice(2);
if (!htmlArg) {
  console.error('Uso: node .claude/skills/carousel/scripts/render.mjs <carrossel.html> [pasta-saida]');
  process.exit(1);
}
const htmlPath = resolve(htmlArg);
const outDir = resolve(outArg || join(dirname(htmlPath), 'png'));

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Playwright não está instalado.\n' +
    '  Rode na raiz do projeto:  npm i -D playwright\n' +
    '  Depois (se não tiver Chrome instalado):  npx playwright install chromium\n' +
    'Se você já tem o Google Chrome na máquina, o script tenta usá-lo automaticamente (channel: "chrome").'
  );
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch();
} catch (e1) {
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch {
    console.error(
      'Não consegui abrir o navegador.\n' +
      '  Rode:  npx playwright install chromium\n' +
      '  ou instale o Google Chrome (o script tenta channel: "chrome").\n\n' + e1.message
    );
    process.exit(1);
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const slides = await page.$$('.slide');
  if (!slides.length) throw new Error('Nenhum elemento .slide encontrado no HTML.');

  mkdirSync(outDir, { recursive: true });
  for (let i = 0; i < slides.length; i++) {
    const file = join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: file });
    console.log('✓', file);
  }
  console.log(`${slides.length} slide(s) exportado(s) em ${outDir}`);
} catch (e) {
  console.error('Erro ao renderizar:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
