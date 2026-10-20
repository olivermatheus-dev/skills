// Renderiza o estudo das capas (estudo.html) e monta a folha do trio na grade do perfil.
//   node companies/kz/campaigns/2026-10-09-posts-fixados/capas/render-trio.mjs
// Saída nesta pasta: capa-1..3.png (1080×1350), guias.png (as 3 com o quadrado 1:1 e a zona segura desenhados)
// e grade.png (o perfil em 1:1, que é o que o Oliver vê, e em 3:4), na ordem Dor | Promessa | Dúvidas.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const DIR = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
await p.goto(pathToFileURL(join(DIR, 'estudo.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const slides = await p.$$('.slide');
const arq = [];
for (let i = 0; i < slides.length; i++) {
  const f = join(DIR, `capa-${i + 1}.png`);
  await slides[i].screenshot({ path: f });
  arq.push(f);
}
await p.evaluate(() => document.body.classList.add('guias'));
const guias = [];
for (let i = 0; i < slides.length; i++) { const f = join(DIR, `.guia-${i + 1}.png`); await slides[i].screenshot({ path: f }); guias.push(f); }

const img = (f) => `data:image/png;base64,${readFileSync(f).toString('base64')}`;
const t = 360;
const grade = (alt, pos) => `<div class="g">${arq.map((f) => `<div style="height:${alt}px;background-image:url(${img(f)});background-size:${pos}"></div>`).join('')}</div>`;
const folha = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{background:#ecebe8;font:500 15px/1.4 system-ui,sans-serif;color:#444;padding:32px;width:${t * 3 + 6 + 64}px}
h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#777;margin:28px 0 12px}h2:first-child{margin-top:0}
.tel{background:#fff;width:${t * 3 + 6}px;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.cab{display:flex;align-items:center;gap:18px;padding:18px 22px;font:600 16px system-ui}.cab i{width:64px;height:64px;border-radius:50%;background:#faf5f1;border:1px solid #ece4dc}
.g{display:grid;grid-template-columns:repeat(3,${t}px);gap:3px;background:#fff}
.g div{background-position:center;background-repeat:no-repeat}
.trio{display:flex;gap:3px}.trio img{width:${t}px}
p{margin-top:10px;color:#666}</style>
<h2>Grade do perfil · 1:1 (quadrado central, como aparece hoje)</h2>
<div class="tel"><div class="cab"><i></i>kz · fixados</div>${grade(t, `${t}px auto`)}</div>
<h2>Grade do perfil · 3:4 (corta ~34 px de cada lado)</h2>
<div class="tel">${grade(Math.round(t * 4 / 3), `auto ${Math.round(t * 4 / 3)}px`)}</div>
<h2>As 3 capas inteiras (4:5) com as guias: verde = quadrado 1:1 · azul = zona segura</h2>
<div class="trio">${guias.map((f) => `<img src="${img(f)}">`).join('')}</div>
<p>Fixar na ordem Dúvidas → Promessa → Dor: o último fixado aparece à esquerda.</p>`;
await p.setViewportSize({ width: t * 3 + 70, height: 900 });
await p.setContent(folha);
await p.screenshot({ path: join(DIR, 'grade.png'), fullPage: true });
await b.close();
console.log('✓ capa-1..3.png · grade.png em', DIR);
