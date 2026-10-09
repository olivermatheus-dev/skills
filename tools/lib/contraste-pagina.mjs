// Auditoria de contraste no render real (WCAG), para uma página Playwright já aberta.
//   import { auditarContraste } from './contraste-pagina.mjs';
//   const r = await auditarContraste(page, { seletor: '.slide' });
// Para cada trecho de texto visível: cor computada (alfa da cor × opacidade dos ancestrais) e o FUNDO REAL,
// medido em pixels: o texto é escondido (color/fill transparentes), tira-se um screenshot e amostra-se o
// retângulo do texto. Vale sobre imagem, gradiente e card. A razão é calculada pixel a pixel (texto composto
// sobre o pixel) e usa o p10, isto é, o pior caso quase total (10% mais desfavorável).
// "Grande" (mínimo 3:1): fonte ≥ 48 px em arte de 1080 px de largura (escala pela largura do slide/quadro),
// ou ≥ 38 px com peso ≥ 600. Demais: corpo (4,5:1).
// Ignorados: display:none, visibility:hidden, opacidade efetiva < 0,05, cor transparente (ex.: texto em
// gradiente com background-clip:text), texto com menos de metade da caixa dentro do slide/quadro.
// Retorna [{ slide, texto, seletor, cor, fundo, razao, minimo, ok, grande, px, bbox:{x,y,w,h} }].

const COLETAR = ({ seletor }) => {
  const curto = (el) => {
    const p = [];
    for (let e = el; e && e.nodeType === 1 && p.length < 3 && e !== document.body; e = e.parentElement) {
      p.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : e.classList[0] ? '.' + e.classList[0] : ''));
    }
    return p.join('>');
  };
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/) || c.match(/color\(srgb ([^)]+)\)/);
    if (!m) return null;
    const n = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (/srgb/.test(c)) return { r: n[0] * 255, g: n[1] * 255, b: n[2] * 255, a: n[3] ?? 1 };
    return { r: n[0], g: n[1], b: n[2], a: n[3] ?? 1 };
  };
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const raizes = seletor ? [...document.querySelectorAll(seletor)] : [document.body];
  const itens = [];
  const grupos = new Map();
  const vis = (el) => {
    let o = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= +cs.opacity;
    }
    return o;
  };
  raizes.forEach((raiz, si) => {
    const rr = raiz.getBoundingClientRect();
    const sw = rr.width || innerWidth;
    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const txt = n.textContent.replace(/\s+/g, ' ').trim();
      if (!txt) continue;
      const el = n.parentElement;
      if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE'].includes(el.tagName)) continue;
      const o = vis(el);
      if (o < 0.05) continue;
      const cs = getComputedStyle(el);
      const svg = !!el.ownerSVGElement;
      const cor = parse(svg ? cs.fill : (cs.webkitTextFillColor && cs.webkitTextFillColor !== 'rgba(0, 0, 0, 0)' ? cs.webkitTextFillColor : cs.color));
      if (!cor || cor.a * o < 0.05) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const r = rg.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const ix = Math.max(0, Math.min(r.right, rr.right) - Math.max(r.left, rr.left));
      const iy = Math.max(0, Math.min(r.bottom, rr.bottom) - Math.max(r.top, rr.top));
      if (ix * iy < r.width * r.height * 0.5) continue;
      const fs = parseFloat(cs.fontSize), peso = +cs.fontWeight || 400;
      const esc = sw / 1080;
      const grande = fs / esc >= 48 || (fs / esc >= 38 && peso >= 600);
      const host = el.closest(':not(.w)') || el;
      const chave = [si, host.tagName, curto(host), hex(cor), cor.a * o, Math.round(fs)].join('|');
      const box = { x0: r.left + scrollX, y0: r.top + scrollY, x1: r.right + scrollX, y1: r.bottom + scrollY };
      let g = grupos.get(chave);
      if (!g) {
        g = { slide: si + 1, texto: '', seletor: curto(host), cor, alfa: cor.a * o, grande, px: Math.round(fs / esc * 10) / 10, box };
        grupos.set(chave, g);
        itens.push(g);
      } else {
        g.box = { x0: Math.min(g.box.x0, box.x0), y0: Math.min(g.box.y0, box.y0), x1: Math.max(g.box.x1, box.x1), y1: Math.max(g.box.y1, box.y1) };
      }
      g.texto += (g.texto ? ' ' : '') + txt;
    }
  });
  return itens.map((g) => ({ ...g, texto: g.texto.slice(0, 40) }));
};

const ESCONDER = `*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;caret-color:transparent!important}
text,tspan{fill:transparent!important;stroke:transparent!important}`;

// roda na página: amostra o screenshot (data URL) nos retângulos e devolve a razão p10 por item
const AMOSTRAR = async ({ png, itens, pct }) => {
  const img = new Image();
  await new Promise((ok, err) => { img.onload = ok; img.onerror = err; img.src = png; });
  const cv = document.createElement('canvas');
  cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(img, 0, 0);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return itens.map((it) => {
    const x = Math.max(0, Math.floor(it.box.x0)), y = Math.max(0, Math.floor(it.box.y0));
    const w = Math.min(cv.width - x, Math.ceil(it.box.x1) - x), h = Math.min(cv.height - y, Math.ceil(it.box.y1) - y);
    if (w < 1 || h < 1) return null;
    const d = cx.getImageData(x, y, w, h).data;
    const a = it.alfa, { r, g, b } = it.cor;
    const razoes = [];
    let sr = 0, sg = 0, sb = 0, n = 0;
    const passo = Math.max(1, Math.floor(Math.sqrt((w * h) / 4000)));
    for (let j = 0; j < h; j += passo) for (let i = 0; i < w; i += passo) {
      const k = (j * w + i) * 4;
      const R = d[k], G = d[k + 1], B = d[k + 2];
      sr += R; sg += G; sb += B; n++;
      const lf = L(r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)), lb = L(R, G, B);
      razoes.push((Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05));
    }
    razoes.sort((p, q) => p - q);
    const fundo = '#' + [sr, sg, sb].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
    return { razao: razoes[Math.min(razoes.length - 1, Math.floor(razoes.length * pct))], fundo };
  });
};

/**
 * @param {import('playwright').Page} page página já aberta, com fontes carregadas e (vídeo) no instante desejado
 * @param {{seletor?:string, minimoCorpo?:number, minimoGrande?:number, percentil?:number}} [o]
 */
export async function auditarContraste(page, { seletor = null, minimoCorpo = 4.5, minimoGrande = 3, percentil = 0.1 } = {}) {
  const itens = await page.evaluate(COLETAR, { seletor });
  if (!itens.length) return [];
  const estilo = await page.addStyleTag({ content: ESCONDER });
  let png;
  try {
    png = 'data:image/png;base64,' + (await page.screenshot({ fullPage: true, type: 'png' })).toString('base64');
  } finally {
    await estilo.evaluate((e) => e.remove());
  }
  const med = await page.evaluate(AMOSTRAR, { png, itens, pct: percentil });
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  return itens.map((it, i) => {
    const m = med[i];
    if (!m) return null;
    const minimo = it.grande ? minimoGrande : minimoCorpo;
    const razao = Math.round(m.razao * 100) / 100;
    return {
      slide: it.slide, texto: it.texto, seletor: it.seletor, cor: hex(it.cor) + (it.alfa < 0.99 ? `@${Math.round(it.alfa * 100)}%` : ''),
      fundo: m.fundo, razao, minimo, ok: razao >= minimo, grande: it.grande, px: it.px,
      bbox: { x: Math.round(it.box.x0), y: Math.round(it.box.y0), w: Math.round(it.box.x1 - it.box.x0), h: Math.round(it.box.y1 - it.box.y0) },
    };
  }).filter(Boolean);
}
