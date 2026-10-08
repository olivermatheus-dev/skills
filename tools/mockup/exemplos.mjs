#!/usr/bin/env node
// Telas de exemplo da galeria de mockups (tarefa 028): renderiza library/mockups/exemplos/tela.html (app fictício "Rotina")
// nas resoluções nativas das telas dos aparelhos e grava cada uma como captura (captura.json com regiões nomeadas).
//   node tools/mockup/exemplos.mjs   → library/mockups/exemplos/{celular,tablet,desktop}/original.png + captura.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(ROOT, 'library', 'mockups', 'exemplos');
// viewport CSS × dpr = px nativos da tela (iPhone 17/18 Pro 1206×2622 · iPad Pro 13" 2064×2752 · MacBook Pro 14" 3024×1964)
const TELAS = [
  { nome: 'celular', vw: 402, vh: 874, dpr: 3, aparelho: 'celular' },
  { nome: 'celular-escuro', vw: 402, vh: 874, dpr: 3, aparelho: 'celular', hash: 'escuro' },
  { nome: 'celular-rolado', vw: 402, vh: 874, dpr: 3, aparelho: 'celular', rolar: 'agenda' },
  { nome: 'tablet', vw: 1032, vh: 1376, dpr: 2, aparelho: 'tablet' },
  { nome: 'desktop', vw: 1512, vh: 982, dpr: 2, aparelho: 'desktop' },
  { nome: 'desktop-escuro', vw: 1512, vh: 982, dpr: 2, aparelho: 'desktop', hash: 'escuro' },
];
const ROTULOS = { resumo: 'Resumo do dia num olhar', agenda: 'Agenda de hoje com confirmação', semana: 'Semana inteira em 1 linha', grafico: 'Atendimentos do mês', saudacao: null };

const browser = await chromium.launch();
for (const t of TELAS) {
  const ctx = await browser.newContext({ viewport: { width: t.vw, height: t.vh }, deviceScaleFactor: t.dpr });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(join(DIR, 'tela.html')).href + (t.hash ? '#' + t.hash : ''));
  if (t.rolar) await page.evaluate((id) => { const e = document.getElementById(id); scrollTo(0, e.getBoundingClientRect().top - 60); }, t.rolar);
  const regioes = await page.evaluate((ids) => Object.fromEntries(Object.keys(ids).map((id) => {
    const r = document.getElementById(id).getBoundingClientRect();
    return [id, { x: r.x, y: Math.max(0, r.y), w: r.width, h: Math.min(r.height + Math.min(0, r.y), innerHeight - Math.max(0, r.y)) }];
  }).filter(([, r]) => r.h > 40)), ROTULOS);
  const out = join(DIR, t.nome);
  mkdirSync(out, { recursive: true });
  await page.screenshot({ path: join(out, 'original.png') });
  const px = (v) => Math.round(v * t.dpr);
  const captura = {
    origem: 'print', arquivo: 'original.png', largura: px(t.vw), altura: px(t.vh), dpr: t.dpr, aparelho: t.aparelho, tags: ['exemplo'], dadosFicticios: true, ocultar: [],
    regioes: Object.fromEntries(Object.entries(regioes).map(([k, r]) => [k, { x: px(r.x), y: px(r.y), w: px(r.w), h: px(r.h), ...(ROTULOS[k] ? { rotulo: ROTULOS[k] } : {}) }])),
    data: new Date().toLocaleDateString('sv-SE'), notas: 'Tela de exemplo da galeria (app fictício "Rotina", dados inventados). Refazer: node tools/mockup/exemplos.mjs',
  };
  writeFileSync(join(out, 'captura.json'), JSON.stringify(captura, null, 2) + '\n');
  console.log(`✓ exemplos/${t.nome}  ${captura.largura}×${captura.altura} · regiões: ${Object.keys(captura.regioes).join(', ')}`);
  await ctx.close();
}
await browser.close();
