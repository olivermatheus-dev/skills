#!/usr/bin/env node
// Lint do carrossel (049 C), sem LLM: abre o HTML no navegador e mede o que dá para medir.
//   node tools/carrossel/check.mjs <pasta-da-peça | carrossel.html> [--html carrossel-v2.html] [--json]
// Lê cada <section class="slide" data-layout="…"> e, se existir, o slides.json da pasta.
// ✗ = bloqueia (exit 1) · ⚠ = a crítica olha · saída curta, feita para LLM.
// Regras: texto fora da margem (96 px; rodapé até 56 px da base; [data-sangra] só não pode ser cortado) · fonte < 24 px ·
// texto corrido pequeno · área vazia / faixa vazia · vizinhos com a mesma família · nº de famílias · eyebrow > 1/3 ·
// card > 40% · ênfase > 1 a cada 3 (e alternância) · gradiente em > 1 slide · placeholder · cor fora do brand.css ·
// respiro a cada 3–4 · capa sem marca, último sem seta · fonte que não carregou · contraste medido (tools/lib/contraste-pagina.mjs).
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const alvo = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1] === '--html'));
if (!alvo) { console.error('Uso: node tools/carrossel/check.mjs <pasta | carrossel.html> [--html arquivo.html] [--json]'); process.exit(2); }
let html = resolve(alvo), pasta = html;
if (existsSync(html) && statSync(html).isDirectory()) html = join(html, opt('html') || 'carrossel.html'); else pasta = dirname(html);
if (!existsSync(html)) { console.error(`✗ não achei ${html}`); process.exit(2); }

const LEVES = new Set(['capa-tipografica', 'campo', 'numero', 'citacao', 'cta']);
const plano = (() => { const f = join(pasta, 'slides.json'); try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } })();

// paleta permitida = toda cor escrita no brand.css linkado + as do sistema.css (fallbacks da escala)
function hexes(txt) { return [...txt.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)].map((m) => { let h = m[1]; if (h.length === 3) h = [...h].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }); }
const src = readFileSync(html, 'utf8');
const css = [...src.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => resolve(dirname(html), m[1])).filter(existsSync);
const paleta = [[255, 255, 255], [0, 0, 0], ...css.flatMap((f) => hexes(readFileSync(f, 'utf8').replace(/body\s*\{[^}]*\}/, '')))];

let chromium;
try { ({ chromium } = await import('playwright')); } catch { console.error('Playwright não instalado: npm i -D playwright'); process.exit(2); }
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });

const dados = await page.evaluate(async ({ paleta }) => {
  await document.fonts.ready;
  const parse = (c) => {
    if (!c || c === 'none' || c === 'transparent') return null;
    let m = c.match(/rgba?\(([^)]+)\)/);
    if (m) { const n = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { rgb: n.slice(0, 3), a: n[3] ?? 1 }; }
    m = c.match(/color\(srgb ([^)]+)\)/);
    if (m) { const n = m[1].split(/[ /]+/).filter(Boolean).map(Number); return { rgb: n.slice(0, 3).map((v) => Math.round(v * 255)), a: n[3] ?? 1 }; }
    return null;
  };
  const naPaleta = (rgb) => paleta.some((p) => Math.abs(p[0] - rgb[0]) <= 3 && Math.abs(p[1] - rgb[1]) <= 3 && Math.abs(p[2] - rgb[2]) <= 3);
  const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const curto = (el) => { const p = []; for (let e = el; e && p.length < 2 && !e.classList?.contains('slide'); e = e.parentElement) p.unshift(e.tagName.toLowerCase() + (e.classList[0] ? '.' + e.classList[0] : '')); return p.join('>'); };
  const faltam = [];
  return [...document.querySelectorAll('.slide')].map((s, si) => {
    const o = s.getBoundingClientRect();
    const W = o.width, H = o.height, M = 96;
    const r = { n: si + 1, layout: s.dataset.layout || '', fundo: [...s.classList].find((c) => c.startsWith('fundo-')) || '', problemas: [], avisos: [] };
    // ---------- texto: margem, corte, tamanho ----------
    const cel = 24, cols = Math.ceil((W - 2 * M) / cel), rows = Math.ceil((H - 2 * M) / cel);
    const grade = new Uint8Array(cols * rows);
    const marca = (x0, y0, x1, y1) => {
      for (let y = Math.max(0, Math.floor((y0 - M) / cel)); y < Math.min(rows, Math.ceil((y1 - M) / cel)); y++)
        for (let x = Math.max(0, Math.floor((x0 - M) / cel)); x < Math.min(cols, Math.ceil((x1 - M) / cel)); x++) grade[y * cols + x] = 1;
    };
    const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
    let palavras = 0;
    for (let t = w.nextNode(); t; t = w.nextNode()) {
      const txt = t.textContent.replace(/\s+/g, ' ').trim();
      if (!txt) continue;
      const el = t.parentElement, cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      if (el.closest('[aria-hidden="true"]')) { /* ornamento: conta na ocupação, não no texto */ }
      const rg = document.createRange(); rg.selectNodeContents(t);
      const rects = [...rg.getClientRects()].filter((q) => q.width > 1 && q.height > 1);
      if (!rects.length) continue;
      const fs = parseFloat(cs.fontSize) * (1080 / W);
      const rodape = !!el.closest('.rodape');
      const sangra = !!el.closest('[data-sangra]');
      // recorte intencional: ancestral (≠ slide) com overflow hidden
      let clip = null; for (let e = el.parentElement; e && e !== s; e = e.parentElement) { const ov = getComputedStyle(e).overflow; if (ov.includes('hidden') || ov.includes('clip')) { clip = e.getBoundingClientRect(); break; } }
      for (const q of rects) {
        const x0 = q.left - o.left, y0 = q.top - o.top, x1 = q.right - o.left, y1 = q.bottom - o.top;
        if (clip && (q.right < clip.left || q.left > clip.right || q.bottom < clip.top || q.top > clip.bottom)) continue;
        if (!el.closest('[aria-hidden="true"]')) marca(x0, y0, x1, y1);
        // tolerância: a caixa da linha passa da tinta (ascendente, sidebearing) em tipo grande
        const tol = Math.max(4, fs * 0.12), tolx = Math.max(4, fs * 0.06);
        if (x0 < -tol || y0 < -tol || x1 > W + tol || y1 > H + tol) { r.problemas.push(`texto cortado pela borda: "${txt.slice(0, 32)}" (${curto(el)})`); break; }
        if (sangra || clip || el.closest('[aria-hidden="true"]')) continue;
        const baseMax = rodape ? H - 56 : H - M;
        if (x0 < M - tolx || x1 > W - M + tolx || y0 < M - tol || y1 > baseMax + tol) {
          r.problemas.push(`texto fora da margem: "${txt.slice(0, 32)}" x ${Math.round(x0)}–${Math.round(x1)} y ${Math.round(y0)}–${Math.round(y1)} (${curto(el)})`); break;
        }
      }
      if (el.closest('[aria-hidden="true"]')) continue;
      const n = txt.split(' ').length;
      palavras += rodape ? 0 : n;
      if (fs < 23.5) r.problemas.push(`fonte ${Math.round(fs)} px < 24: "${txt.slice(0, 32)}" (${curto(el)})`);
      else if (fs < 32 && n > 12 && !rodape) r.avisos.push(`texto corrido em ${Math.round(fs)} px (${n} palavras): "${txt.slice(0, 32)}"`);
      else if (fs < 36 && n > 8 && !el.closest('.ui, .ui-janela, .rodape') && !/(rotulo|eyebrow|nota)/.test(el.className)) r.avisos.push(`corpo em ${Math.round(fs)} px (< 36) com ${n} palavras: "${txt.slice(0, 32)}"`);
    }
    r.palavras = palavras;
    // ---------- cor, gradiente, ocupação dos objetos ----------
    const corRuim = new Map();
    let gradiente = false;
    for (const el of [s, ...s.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none') continue;
      if (/gradient\(/.test(cs.backgroundImage)) gradiente = true;
      const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const checar = [];
      if (temTexto) checar.push(['texto', cs.color]);
      checar.push(['fundo', cs.backgroundColor]);
      if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') checar.push(['borda', cs.borderTopColor]);
      if (el instanceof SVGElement && el.tagName !== 'svg') { checar.push(['traço', cs.stroke]); checar.push(['preenchimento', cs.fill]); }
      for (const [tipo, c] of checar) {
        const p = parse(c);
        if (!p || p.a < 0.02) continue;
        if (!naPaleta(p.rgb)) corRuim.set(hex(p.rgb), `${tipo} em ${curto(el)}`);
      }
      if (el === s) continue;
      const b = el.getBoundingClientRect();
      const area = b.width * b.height;
      const objeto = el.tagName === 'svg' || el.tagName === 'IMG' || el.classList.contains('card') || el.classList.contains('ui-janela') ||
        el.classList.contains('chip') || (cs.boxShadow !== 'none' && area > 400) || (parseFloat(cs.borderTopWidth) > 0 && area > 2000 && area < W * H * 0.4);
      if (objeto) marca(b.left - o.left, b.top - o.top, b.right - o.left, b.bottom - o.top);
    }
    for (const [h, onde] of corRuim) r.problemas.push(`cor fora do brand.css: ${h} (${onde})`);
    r.gradiente = gradiente;
    // ocupação e maior faixa vazia (linhas inteiras sem nada) dentro da zona de texto
    const ocup = grade.reduce((a, v) => a + v, 0) / grade.length;
    let faixa = 0, cur = 0;
    for (let y = 0; y < rows; y++) { let vazia = true; for (let x = 0; x < cols; x++) if (grade[y * cols + x]) { vazia = false; break; } cur = vazia ? cur + 1 : 0; faixa = Math.max(faixa, cur); }
    r.ocupacao = Math.round(ocup * 100);
    r.faixa = Math.round((faixa / rows) * 100);
    // ---------- componentes e ênfase ----------
    r.eyebrow = !!s.querySelector('.eyebrow');
    r.card = !!s.querySelector('.card, .ui-janela');
    const enf = [...s.querySelectorAll('.enf-cor, .enf-serifa')];
    r.enfases = enf.length;
    r.enfase = enf.length ? (enf[0].classList.contains('enf-serifa') ? 'serifa' : 'cor') : (r.layout === 'citacao' ? 'serifa' : null);
    r.marca = !!s.querySelector('.rodape .marca svg, .rodape .marca img');
    r.arraste = !!s.querySelector('.arraste');
    // ---------- placeholder ----------
    const tx = s.innerText;
    const ph = tx.match(/\[[^\]\n]{1,40}\]|\{\{[^}]*\}\}|@suamarca|@handle|lorem ipsum|\bTODO\b|\bXXX\b|a confirmar/i);
    if (ph) r.problemas.push(`placeholder: "${ph[0]}"`);
    // fonte de verdade: as famílias usadas carregaram?
    for (const el of s.querySelectorAll('*')) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el); const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const spec = `${cs.fontStyle} ${cs.fontWeight} 40px "${fam}"`;
      if (!/^(serif|sans-serif|system-ui|Georgia|Arial)$/.test(fam) && !document.fonts.check(spec) && !faltam.includes(spec)) { faltam.push(spec); r.problemas.push(`fonte não carregou: ${spec}`); }
    }
    return r;
  });
}, { paleta });

// ---------- contraste no render real ----------
let contraste = null;
const libC = join(ROOT, 'tools/lib/contraste-pagina.mjs');
if (existsSync(libC)) {
  try {
    const { auditarContraste } = await import(pathToFileURL(libC).href);
    contraste = await auditarContraste(page, { seletor: '.slide' });
  } catch (e) { contraste = { erro: e.message }; }
}
await browser.close();

// ---------- regras do conjunto ----------
const n = dados.length, tot = [], av = [];
const L = dados.map((d) => d.layout);
if (L.some((l) => !l)) tot.push(`slide sem data-layout: ${dados.filter((d) => !d.layout).map((d) => 's' + d.n).join(', ')}`);
for (let i = 1; i < n; i++) if (L[i] && L[i] === L[i - 1]) tot.push(`s${i}–s${i + 1} vizinhos com a mesma família (${L[i]})`);
const fam = new Set(L.filter(Boolean)).size;
if (n >= 8 && fam < 4) tot.push(`só ${fam} famílias em ${n} slides (mín. 4)`);
else if (n >= 5 && n < 8 && fam < 3) av.push(`só ${fam} famílias em ${n} slides`);
const eb = dados.filter((d) => d.eyebrow).length;
if (eb > Math.ceil(n / 3)) tot.push(`eyebrow em ${eb} slides (teto ${Math.ceil(n / 3)} = 1 a cada 3)`);
const cd = dados.filter((d) => d.card).length;
if (n > 2 && cd > Math.ceil(n * 0.4)) av.push(`card em ${cd} de ${n} slides (teto ~40%)`);
for (const d of dados) if (d.enfases > 1) tot.push(`s${d.n} com ${d.enfases} ênfases (máx. 1, na palavra da virada)`);
for (let i = 0; i < n; i++) {
  const jan = dados.slice(i, i + 3).filter((d) => d.enfase);
  if (jan.length > 1 && i + 3 <= n) { tot.push(`ênfase em ${jan.map((d) => 's' + d.n).join(' e ')}: máx. 1 a cada 3 slides`); break; }
}
const comEnf = dados.filter((d) => d.enfase);
for (let i = 1; i < comEnf.length; i++) if (comEnf[i].enfase === comEnf[i - 1].enfase) av.push(`ênfases seguidas do mesmo tipo (${comEnf[i].enfase}) em s${comEnf[i - 1].n} e s${comEnf[i].n}: alterne cor e serifa`);
const gr = dados.filter((d) => d.gradiente);
if (gr.length > 1) tot.push(`gradiente em ${gr.length} slides (${gr.map((d) => 's' + d.n).join(', ')}): máx. 1, e só local`);
const leve = (d, i) => (plano?.slides?.[i]?.densidade ? plano.slides[i].densidade === 'leve' : LEVES.has(d.layout));
for (let i = 0; i + 4 <= n; i++) if (!dados.slice(i, i + 4).some((d, k) => leve(d, i + k))) { av.push(`s${i + 1}–s${i + 4} sem slide de respiro (campo, número, citação…)`); break; }
for (let i = 0; i + 3 <= n; i++) { const f = dados.slice(i, i + 3).map((d) => d.fundo); if (f[0] && f.every((x) => x === f[0])) { av.push(`s${i + 1}–s${i + 3} com o mesmo fundo (${f[0]}): máx. 2 seguidos`); break; } }
if (n > 1 && dados[0].marca) av.push('s1 (capa) com a marca no rodapé: a marca vai no fim');
if (n > 1 && dados[n - 1].arraste) av.push(`s${n} (último) com "arraste"`);
if (plano?.slides) {
  if (plano.slides.length !== n) av.push(`slides.json tem ${plano.slides.length} slides, o HTML tem ${n}`);
  plano.slides.forEach((p, i) => { if (dados[i] && p.familia && p.familia !== dados[i].layout) av.push(`s${i + 1}: plano diz ${p.familia}, HTML diz ${dados[i].layout}`); });
}
for (const d of dados) {
  const respiro = LEVES.has(d.layout);
  if (d.ocupacao < (respiro ? 6 : 14)) av.push(`s${d.n} quase vazio: ${d.ocupacao}% da zona de texto ocupada`);
  if (d.faixa > (respiro ? 55 : 38)) av.push(`s${d.n} com faixa vazia de ${d.faixa}% da altura (vazio, não respiro?)`);
  if (d.palavras > 40) av.push(`s${d.n} com ${d.palavras} palavras (alvo ≤ 35)`);
  if (d.n === 1 && n > 1 && !String(d.layout).startsWith('capa')) av.push(`s1 não é uma família de capa (${d.layout})`);
}

// ---------- saída ----------
const linhas = [];
linhas.push(`check carrossel · ${basename(pasta)}/${basename(html)} · ${n} slides · ${fam} famílias${plano ? ' · slides.json ok' : ''}`);
linhas.push(`  ${dados.map((d) => `${String(d.n).padStart(2, '0')} ${d.layout || '?'}${d.enfase ? '*' : ''}`).join(' · ')}`);
// agrupa por tipo (texto antes do ":"): mostra o 1º e conta os iguais
const agrupa = (lista) => { const g = new Map(); for (const p of lista) { const k = p.split(':')[0]; g.has(k) ? g.get(k).n++ : g.set(k, { p, n: 0 }); } return [...g.values()].map(({ p, n }) => (n ? `${p} (+${n} iguais)` : p)); };
for (const d of dados) { for (const p of agrupa(d.problemas)) linhas.push(`✗ s${d.n} ${p}`); for (const a of agrupa(d.avisos)) linhas.push(`⚠ s${d.n} ${a}`); }
for (const t of tot) linhas.push(`✗ ${t}`);
for (const a of av) linhas.push(`⚠ ${a}`);
let ruins = 0;
if (contraste === null) linhas.push('⚠ contraste não medido: tools/lib/contraste-pagina.mjs não existe');
else if (contraste.erro) linhas.push(`⚠ contraste não medido: ${contraste.erro}`);
else {
  // ornamento tipográfico (aspas gigantes, aria-hidden) não é texto de leitura
  const r = contraste.filter((c) => c && !c.ok && !/^[“”"«»‘’]+$/.test(String(c.texto).trim())); ruins = r.length;
  for (const c of r.slice(0, 10)) linhas.push(`✗ s${c.slide} contraste ${c.razao}:1 < ${c.minimo} "${c.texto}" (${c.cor} sobre ${c.fundo})`);
  linhas.push(`${r.length ? '✗' : '✓'} contraste: ${contraste.length} textos medidos, ${r.length} abaixo do mínimo`);
}
const nx = linhas.filter((l) => l.startsWith('✗')).length - (ruins ? 1 : 0), nw = linhas.filter((l) => l.startsWith('⚠')).length;
linhas.push(`resumo: ${nx} ✗ · ${nw} ⚠  (ocupação % por slide: ${dados.map((d) => d.ocupacao).join(' ')})`);
if (argv.includes('--json')) console.log(JSON.stringify({ slides: dados, conjunto: { erros: tot, avisos: av }, contraste }, null, 2));
else console.log(linhas.join('\n'));
process.exit(nx > 0 ? 1 : 0);
