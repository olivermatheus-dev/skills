/* cena.js — renderiza um mockup em CAMADAS (editor de mockups, tarefa 030). Usa as peças do mockup.js (molduras reais
   calibradas, encaixe do print, sombras) e acrescenta: lista de camadas, fundo editável (cor, gradiente, malha, imagem,
   padrão, grão, vinheta) e geometria relativa ao formato (a mesma peça sai em 1:1, 4:5, 9:16 e 16:9).
   O MESMO arquivo roda no editor do app (iframe, mensagens) e no export do Playwright (tools/mockup/cena.mjs): o que se vê é o que sai.

   doc = { versao: 2, empresa, escala, formatos: ['4:5', …], fundo: {…}, camadas: [ … de baixo para cima ] }
   camada = { id, tipo: 'aparelho'|'imagem'|'texto'|'forma', nome, visivel, travada, opacidade (0–1),
              x, y (centro, fração do formato), w (largura em u = menor lado do formato), rot (graus),
              formatos: { '9:16': { x, y, w, rot } }   // ajuste fino por formato (sobrepõe a base)
              …props do tipo (abaixo) }
     aparelho: captura (ref "capturas/<pasta>"), recorte ('nenhum' | {x,y,w,h} px do original; padrão = recorteSeguro da captura),
               modelo (id real, apelido ou desenho: navegador, sem-moldura, vidro), cor, orientacao, angulo, ajuste, cantos, reflexo, tema,
               sombra: { preset, forca, distancia, desfoque, cor }, chao (sombra de chão quando apoiado)
     imagem:   captura, recorte, raio (u), sombra
     texto:    texto (*ênfase* _serifa_, \n quebra), fonte (titulo|corpo|serifa), tamanho (u), peso, cor (auto|texto|destaque|#hex),
               corEnfase, alinhar, entrelinha, espacamento (em)
     forma:    forma (retangulo|pilula|circulo), h (u), cor, raio (u), vidro (bool), borda: { cor, largura (u) }, sombra
   fundo = { tipo: 'cor'|'linear'|'radial'|'malha'|'imagem'|'transparente', escuro, cor, base, angulo, centro {x,y},
             paradas [{cor, pos}], pontos [{x,y,r,cor}], desfoque, captura, padrao { tipo, escala, opacidade, cor, esmaecer },
             grao (0–0,15), vinheta (0–0,4) }

   Modos: Playwright → window.CENA_INIT + window.CENA_DOC + window.CENA_FORMATO, fim em window.MK_PRONTO = { ok, qa, caixas }.
          Editor → postMessage { tipo: 'iniciar', init } · { tipo: 'render', doc, formato, seq } → { tipo: 'renderizado', seq, caixas, seguro, qa }. */
(function () {
  'use strict';
  const MK = window.MK;
  const FORMATOS = { '1:1': [1080, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920], '16:9': [1920, 1080] };
  const CENA = (window.CENA = { FORMATOS });
  const el = MK.el;
  let init = { capturas: {} };
  const telas = new Map();
  let marcaAtual = null;

  // ---------- marca, molduras e capturas ----------
  async function carregarMarca(href) {
    if (!href || marcaAtual === href) return;
    document.querySelectorAll('link[data-marca]').forEach((l) => l.remove());
    await new Promise((ok) => { const l = el('link'); l.rel = 'stylesheet'; l.href = href; l.dataset.marca = '1'; l.onload = ok; l.onerror = () => ok(); document.head.appendChild(l); });
    const cs = getComputedStyle(document.documentElement);
    const fontes = [`700 64px ${cs.getPropertyValue('--font-heading') || 'sans-serif'}`, `400 32px ${cs.getPropertyValue('--font-body') || 'sans-serif'}`, `600 32px ${cs.getPropertyValue('--font-body') || 'sans-serif'}`, `italic 500 64px ${cs.getPropertyValue('--font-accent') || 'serif'}`];
    await Promise.all(fontes.map((f) => document.fonts.load(f).catch(() => null)));
    await document.fonts.ready;
    marcaAtual = href;
  }
  CENA.iniciar = async (i) => {
    init = { ...init, ...i, capturas: { ...init.capturas, ...(i.capturas || {}) } };
    if (i.aparelhos) MK.registrarAparelhos(i.aparelhos);
    await carregarMarca(init.brandCss);
  };
  async function tela(ref, recorte) {
    const c = init.capturas[ref];
    if (!c) throw new Error('captura não encontrada: ' + ref);
    let rec = recorte === 'nenhum' ? undefined : recorte || c.recorteSeguro;
    // recorte sempre dentro da imagem (sobra vira faixa preta na tela do aparelho)
    if (rec && c.largura) { const x = Math.max(0, rec.x), y = Math.max(0, rec.y); rec = { x, y, w: Math.max(1, Math.min(rec.w, c.largura - x)), h: Math.max(1, Math.min(rec.h, c.altura - y)) }; }
    const chave = ref + '|' + JSON.stringify(rec || null) + '|' + JSON.stringify(c.ocultar || []);
    if (!telas.has(chave)) telas.set(chave, MK.prepararTela(ref, { src: c.src, recorte: rec, ocultar: c.ocultar, aparelho: c.aparelho, dpr: c.dpr, url: c.endereco }));
    return telas.get(chave);
  }

  // ---------- geometria ----------
  const GEO = ['x', 'y', 'w', 'rot', 'h', 'tamanho'];
  /** base da camada + ajuste fino do formato */
  CENA.geometria = (c, fmt) => {
    const g = { x: 0.5, y: 0.5, w: 0.6, rot: 0 };
    for (const k of GEO) if (c[k] != null) g[k] = c[k];
    const f = c.formatos && c.formatos[fmt];
    if (f) for (const k of GEO) if (f[k] != null) g[k] = f[k];
    return g;
  };
  /** área segura: 6% do menor lado; no 9:16, topo 10% e base 18% (interface do Stories/Reels) */
  CENA.seguro = (W, H) => {
    const m = Math.round(Math.min(W, H) * 0.06), alto = H / W > 1.7;
    const top = alto ? Math.round(H * 0.1) : m, bot = alto ? Math.round(H * 0.18) : m;
    return { x: m, y: top, w: W - 2 * m, h: H - top - bot };
  };

  // ---------- sombra (camada própria, plana: nunca dentro do 3D, para o desfoque não ser cortado) ----------
  function sombraFiltro(s, tam) {
    if (!s || s.preset === 'nenhuma') return '';
    const base = MK.SOMBRAS[s.preset || 'produto'] || MK.SOMBRAS.produto;
    const k = Math.max(0.35, Math.min(2.4, tam / 900));
    const f = s.forca ?? 1, d = s.distancia ?? 1, b = s.desfoque ?? 1;
    const c = s.cor ? hexRgb(s.cor) : MK.corSombra();
    return base.map(([y, bl, a]) => `drop-shadow(0 ${(y * k * d).toFixed(1)}px ${(bl * k * b * 0.5).toFixed(1)}px rgb(${c} / ${Math.min(1, a * f).toFixed(3)}))`).join(' ');
  }
  /** a mesma sombra em box-shadow (objetos translúcidos ou retangulares) + fio de 0,5 px */
  function sombraCaixa(s, tam) {
    if (!s || s.preset === 'nenhuma') return '';
    const base = MK.SOMBRAS[s.preset || 'produto'] || MK.SOMBRAS.produto;
    const k = Math.max(0.35, Math.min(2.4, tam / 900));
    const f = s.forca ?? 1, d = s.distancia ?? 1, b = s.desfoque ?? 1;
    const c = s.cor ? hexRgb(s.cor) : MK.corSombra();
    return [`0 0 0 0.5px rgb(${c} / .08)`, ...base.map(([y, bl, a]) => `0 ${(y * k * d).toFixed(1)}px ${(bl * k * b).toFixed(1)}px rgb(${c} / ${Math.min(1, a * f).toFixed(3)})`)].join(', ');
  }
  function hexRgb(h) {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
    if (!m) return '22 26 38';
    const n = parseInt(m[1], 16);
    return `${n >> 16} ${(n >> 8) & 255} ${n & 255}`;
  }

  // ---------- fundo ----------
  const corCss = (c, padrao) => (!c ? padrao : c.startsWith('--') ? `var(${c})` : c);
  // ---------- gradientes pintados à mão: conta em ponto flutuante (oklab) e pontilha cada pixel antes de arredondar.
  // O gradiente CSS do navegador sai quantizado em 8 bits e faz anéis/faixas visíveis nos fundos claros e grandes (3×). ----------
  const LIN = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const SRGB = new Float32Array(4097);
  for (let i = 0; i <= 4096; i++) { const v = i / 4096; SRGB[i] = 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055); }
  function rgbDe(c) {
    const s = el('span', '', { color: corCss(c, '#000'), display: 'none' }, document.body);
    const v = (getComputedStyle(s).color.match(/[\d.]+/g) || [0, 0, 0]).map(Number);
    s.remove();
    return v.slice(0, 3);
  }
  function lab(c) {
    const [r, g, b] = rgbDe(c).map(LIN);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  /** erfc (Abramowitz–Stegun 7.1.26): mancha = disco desfocado por gaussiana, igual ao blur() do CSS */
  const erfc = (x) => { const z = Math.abs(x), t = 1 / (1 + 0.3275911 * z), y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z); return x >= 0 ? y : 2 - y; };
  let telaFundo = null; // { chave, canvas }: o editor só repinta quando o fundo muda
  function canvasGradiente(f, W, H) {
    const k = Math.max(0.25, Math.min(4, init.qualidade || window.devicePixelRatio || 1));
    const chave = JSON.stringify([f.tipo, f.base, f.angulo, f.centro, f.paradas, f.pontos, f.desfoque, W, H, k, marcaAtual]);
    if (telaFundo && telaFundo.chave === chave) return telaFundo.canvas;
    const cw = Math.round(W * k), ch = Math.round(H * k);
    const cv = el('canvas', 'cn-gradiente');
    cv.width = cw; cv.height = ch;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(cw, ch), d = img.data;
    const lado = Math.max(W, H);
    let cor; // (px, py) em px CSS → [L, a, b]
    if (f.tipo === 'malha') {
      const base = lab(f.base || '#eee');
      const sig = (f.desfoque ?? 0.18) * lado;
      const ms = (f.pontos || []).map((p) => { const r = (p.r ?? 0.4) * lado, s = Math.sqrt(sig * sig + (0.2 * r) ** 2); return { x: p.x * W, y: p.y * H, R: 0.65 * r, k: 1 / (s * Math.SQRT2), c: lab(p.cor) }; });
      cor = (px, py, o) => {
        let L = base[0], A = base[1], B = base[2];
        for (const m of ms) {
          const a = 0.5 * erfc((Math.hypot(px - m.x, py - m.y) - m.R) * m.k);
          L += (m.c[0] - L) * a; A += (m.c[1] - A) * a; B += (m.c[2] - B) * a;
        }
        o[0] = L; o[1] = A; o[2] = B;
      };
    } else {
      const ps = (f.paradas && f.paradas.length ? f.paradas : [{ cor: '#fff', pos: 0 }, { cor: '#ddd', pos: 1 }]).map((p) => ({ pos: p.pos ?? 0, c: lab(p.cor) })).sort((a, b) => a.pos - b.pos);
      let t;
      if (f.tipo === 'linear') {
        const ang = ((f.angulo ?? 180) * Math.PI) / 180, sx = Math.sin(ang), sy = -Math.cos(ang), len = Math.abs(W * sx) + Math.abs(H * sy);
        t = (px, py) => ((px - W / 2) * sx + (py - H / 2) * sy) / len + 0.5;
      } else {
        const c = f.centro || { x: 0.5, y: 0.4 }, cx = c.x * W, cy = c.y * H;
        const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
        t = (px, py) => Math.hypot(px - cx, py - cy) / far;
      }
      cor = (px, py, o) => {
        const v = t(px, py);
        let i = 0;
        while (i < ps.length - 1 && ps[i + 1].pos < v) i++;
        const a = ps[i], b = ps[Math.min(i + 1, ps.length - 1)];
        const q = b.pos > a.pos ? Math.max(0, Math.min(1, (v - a.pos) / (b.pos - a.pos))) : v <= a.pos ? 0 : 1;
        o[0] = a.c[0] + (b.c[0] - a.c[0]) * q; o[1] = a.c[1] + (b.c[1] - a.c[1]) * q; o[2] = a.c[2] + (b.c[2] - a.c[2]) * q;
      };
    }
    const o = [0, 0, 0];
    let semente = 1234567;
    const rnd = () => ((semente = (semente * 1103515245 + 12345) >>> 0) / 4294967296);
    for (let y = 0, i = 0; y < ch; y++) {
      const py = (y + 0.5) / k;
      for (let x = 0; x < cw; x++, i += 4) {
        cor((x + 0.5) / k, py, o);
        const l = (o[0] + 0.3963377774 * o[1] + 0.2158037573 * o[2]) ** 3, m = (o[0] - 0.1055613458 * o[1] - 0.0638541728 * o[2]) ** 3, s = (o[0] - 0.0894841775 * o[1] - 1.291485548 * o[2]) ** 3;
        const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
        for (let c = 0; c < 3; c++) {
          const v = SRGB[Math.max(0, Math.min(4096, Math.round(lin[c] * 4096)))] + (rnd() + rnd() - 1); // pontilhado triangular ±1 nível
          d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v + 0.5;
        }
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    telaFundo = { chave, canvas: cv };
    return cv;
  }

  function pintarFundo(palco, f, W, H) {
    const lado = Math.max(W, H);
    const camada = el('div', 'cn-fundo', null, palco);
    if (!f || f.tipo === 'transparente') return camada;
    if (f.tipo === 'cor') camada.style.background = corCss(f.cor, 'var(--bg)');
    else if (f.tipo === 'linear' || f.tipo === 'radial' || f.tipo === 'malha') camada.appendChild(canvasGradiente(f, W, H));
    else if (f.tipo === 'imagem' && f.captura && init.capturas[f.captura]) {
      camada.style.background = corCss(f.base, 'var(--bg)');
      el('div', 'cn-fundo-img', { backgroundImage: `url("${init.capturas[f.captura].src}")`, filter: f.desfoque ? `blur(${Math.round(f.desfoque * lado)}px) saturate(1.15)` : '', inset: f.desfoque ? '-12%' : '0' }, camada);
    }
    const p = f.padrao;
    if (p && p.tipo && p.tipo !== 'nenhum') {
      const e = Math.max(4, (p.escala ?? 0.05) * Math.min(W, H)), cor = corCss(p.cor, f.escuro ? '#ffffff' : 'var(--text, #222)'), lw = Math.max(1, e * 0.025);
      const tinta = `color-mix(in srgb, ${cor} 100%, transparent)`;
      const bg = {
        grade: `linear-gradient(${tinta} ${lw}px, transparent ${lw}px) 0 0 / ${e}px ${e}px, linear-gradient(90deg, ${tinta} ${lw}px, transparent ${lw}px) 0 0 / ${e}px ${e}px`,
        pontos: `radial-gradient(circle, ${tinta} ${e * 0.06}px, transparent ${e * 0.06 + 1}px) 0 0 / ${e}px ${e}px`,
        linhas: `repeating-linear-gradient(45deg, ${tinta} 0 ${lw}px, transparent ${lw}px ${e / 2}px)`,
        xadrez: `repeating-conic-gradient(${tinta} 0 25%, transparent 0 50%) 0 0 / ${e}px ${e}px`,
        ondas: `repeating-radial-gradient(circle at 50% 50%, transparent 0 ${e - lw}px, ${tinta} ${e - lw}px ${e}px)`,
      }[p.tipo];
      if (bg) {
        const pd = el('div', 'cn-padrao', { background: bg, opacity: String(p.opacidade ?? 0.08) }, camada);
        if (p.esmaecer !== false) { const mk = 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 0%, #000 30%, transparent 100%)'; pd.style.maskImage = mk; pd.style.webkitMaskImage = mk; }
      }
    }
    if (f.vinheta) el('div', 'cn-vinheta', { background: `radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgb(0 0 0 / ${f.vinheta}) 100%)` }, camada);
    if (f.grao) el('div', 'mk-grao' + (f.escuro ? ' mk-grao-escuro' : ''), { opacity: String(f.grao) }, camada);
    return camada;
  }

  // ---------- camadas ----------
  const FONTES = { titulo: 'var(--font-heading)', corpo: 'var(--font-body)', serifa: 'var(--font-accent, serif)' };
  function corTexto(c, escuro) {
    if (!c || c === 'auto') return escuro ? '#f5f5f7' : 'var(--text)';
    if (c === 'texto') return 'var(--text)';
    if (c === 'destaque') return 'var(--accent, var(--primary))';
    if (c === 'tinta') return 'var(--ink, var(--text))';
    return corCss(c);
  }
  async function montarCamada(c, ctx) {
    const { W, H, u, fmt } = ctx;
    const g = CENA.geometria(c, fmt);
    const box = el('div', 'cn-camada', { left: g.x * W, top: g.y * H, opacity: String(c.opacidade ?? 1), transform: `translate(-50%, -50%) rotate(${g.rot || 0}deg)` });
    box.dataset.id = c.id;
    const w = Math.max(8, g.w * u);
    if (c.tipo === 'aparelho') {
      if (!c.captura) throw new Error(`camada ${c.nome || c.id}: sem captura`);
      const t = await tela(c.captura, c.recorte);
      MK.params = { cantos: c.cantos, cor: c.cor, ajuste: c.ajuste, realista: true };
      const ap = MK.moldura(c.modelo || MK.aparelhoPadrao(t), t, { w, h: 1e6 }, { angulo: c.angulo || 'frente', cor: c.cor, orientacao: c.orientacao, sombra: 'nenhuma', cantos: c.cantos, ajuste: c.ajuste && c.ajuste !== 'auto' ? c.ajuste : undefined, reflexo: c.reflexo ?? false, tema: c.tema });
      Object.assign(box.style, { width: ap.w + 'px', height: ap.h + 'px' });
      const ang = c.angulo || 'frente';
      // 3D só no aparelho; perspectiva própria (não a do palco) e a sombra numa camada plana por fora
      ap.el.style.transform = ang === 'frente' ? '' : `perspective(${Math.round(Math.max(W, H) * 2.2)}px) ${MK.ANGULOS[ang] ?? ang}`;
      Object.assign(ap.el.style, { left: 0, top: 0 });
      if (ap.apoiado && c.chao !== false && (c.sombra?.preset ?? 'produto') !== 'nenhuma') chao(box, ap.w, ap.h, c.sombra);
      const sombra = c.sombra ?? { preset: ap.real ? 'produto' : 'flutuante' };
      // moldura opaca (aparelho real, genéricos): drop-shadow numa camada plana por fora do 3D, segue o contorno do PNG.
      // vidro, janela e tela sem moldura: box-shadow (não pinta por baixo do objeto: o vidro não mostra a sombra através dele
      // e o backdrop-filter continua vendo o fundo — um filter no pai desligaria o desfoque do vidro)
      const caixa = ['vidro', 'navegador', 'sem-moldura'].includes(ap.tipo);
      const s = el('div', 'cn-sombra', { width: ap.w, height: ap.h, filter: caixa ? '' : sombraFiltro(sombra, Math.max(ap.w, ap.h)) }, box);
      s.appendChild(ap.el);
      if (caixa) { const alvo = ap.tipo === 'sem-moldura' ? ap.tela : ap.el.firstChild; alvo.style.boxShadow = [alvo.style.boxShadow, sombraCaixa(sombra, Math.max(ap.w, ap.h))].filter(Boolean).join(', '); }
    } else if (c.tipo === 'imagem') {
      if (!c.captura) throw new Error(`camada ${c.nome || c.id}: sem imagem`);
      const t = await tela(c.captura, c.recorte ?? 'nenhum');
      const h = w * (t.h / t.w);
      Object.assign(box.style, { width: w + 'px', height: h + 'px' });
      const s = el('div', 'cn-sombra', { width: w, height: h, filter: sombraFiltro(c.sombra ?? { preset: 'nenhuma' }, Math.max(w, h)) }, box);
      const im = MK.imagem(t, w, h, { ajuste: 'cobrir' });
      im.style.borderRadius = (c.raio ?? 0) * u + 'px';
      s.appendChild(im);
    } else if (c.tipo === 'texto') {
      box.style.width = w + 'px';
      const tx = el('div', 'cn-texto', {
        fontFamily: FONTES[c.fonte || 'titulo'] || FONTES.titulo, fontSize: (g.tamanho ?? c.tamanho ?? 0.07) * u + 'px',
        fontWeight: String(c.peso ?? (c.fonte === 'corpo' ? 500 : 'var(--weight-heading, 700)')), color: corTexto(c.cor, ctx.escuro),
        textAlign: c.alinhar || 'center', lineHeight: String(c.entrelinha ?? (c.fonte === 'corpo' ? 1.4 : 1.12)),
        letterSpacing: c.espacamento != null ? c.espacamento + 'em' : c.fonte === 'corpo' ? '0' : 'var(--tracking-heading, -0.01em)',
      }, box);
      tx.style.setProperty('--cn-enfase', corTexto(c.corEnfase || 'destaque', ctx.escuro));
      tx.innerHTML = MK.enfase(c.texto || '').replace(/\n/g, '<br>');
    } else if (c.tipo === 'forma') {
      const h = c.forma === 'circulo' ? w : Math.max(2, (g.h ?? c.h ?? 0.2) * u);
      Object.assign(box.style, { width: w + 'px', height: h + 'px' });
      const s = el('div', 'cn-sombra', { width: w, height: h, filter: sombraFiltro(c.sombra ?? { preset: 'nenhuma' }, Math.max(w, h)) }, box);
      const raio = c.forma === 'circulo' || c.forma === 'pilula' ? 9999 : (c.raio ?? 0.03) * u;
      const f = el('div', 'cn-forma' + (c.vidro ? ' mk-card-vidro' : ''), { width: w, height: h, borderRadius: raio }, s);
      if (!c.vidro) f.style.background = corCss(c.cor, 'var(--surface, #fff)');
      if (c.borda && c.borda.largura) f.style.border = `${Math.max(1, c.borda.largura * u)}px solid ${corCss(c.borda.cor, 'var(--border)')}`;
    } else throw new Error('tipo de camada desconhecido: ' + c.tipo);
    return box;
  }
  /** sombra de chão (aparelho apoiado): contato curto e escuro + ambiente largo e suave, presos à camada */
  function chao(box, w, h, s) {
    const c = s?.cor ? hexRgb(s.cor) : MK.corSombra(), f = s?.forca ?? 1;
    const x = w * 0.02, y = h * 0.995, ww = w * 0.96, hh = w * 0.035;
    el('div', 'mk-sombra-chao', { left: x - ww * 0.06, top: y - hh * 0.7, width: ww * 1.12, height: hh * 1.4, background: `radial-gradient(closest-side, rgb(${c} / ${0.18 * f}), rgb(${c} / 0))`, filter: `blur(${Math.round(hh * 0.35)}px)` }, box);
    el('div', 'mk-sombra-chao', { left: x + ww * 0.04, top: y - hh * 0.22, width: ww * 0.92, height: hh * 0.44, background: `radial-gradient(closest-side, rgb(${c} / ${0.32 * f}), rgb(${c} / 0))`, filter: `blur(${Math.round(hh * 0.12)}px)` }, box);
  }

  // ---------- render ----------
  let palco = null;
  CENA.render = async (doc, fmt) => {
    const [W, H] = FORMATOS[fmt] || FORMATOS['4:5'];
    const u = Math.min(W, H), qa = [];
    const novo = el('div', 'cn-palco', { width: W, height: H });
    novo.id = 'palco';
    MK.W = W; MK.H = H; MK.palco = novo; MK.qa.length = 0;
    const f = doc.fundo || { tipo: 'cor' };
    const escuro = !!f.escuro && f.tipo !== 'transparente';
    if (escuro) novo.classList.add('mk-sobre-escuro');
    pintarFundo(novo, f, W, H);
    const ctx = { W, H, u, fmt, escuro };
    for (const c of doc.camadas || []) {
      if (c.visivel === false) continue;
      try { novo.appendChild(await montarCamada(c, ctx)); } catch (e) { qa.push(`${c.nome || c.id}: ${e.message}`); }
    }
    // troca de uma vez (sem piscar no editor)
    if (palco) palco.replaceWith(novo); else document.body.appendChild(novo);
    palco = novo;
    await Promise.all([...novo.querySelectorAll('img')].map((i) => i.decode().catch(() => null)));
    // caixas (sem rotação) para o editor desenhar seleção e alças; área segura medida em todo texto
    const seguro = CENA.seguro(W, H), caixas = {};
    const p = novo.getBoundingClientRect();
    for (const b of novo.querySelectorAll('.cn-camada')) {
      const w = b.offsetWidth, h = b.offsetHeight, x = parseFloat(b.style.left), y = parseFloat(b.style.top);
      caixas[b.dataset.id] = { x: x - w / 2, y: y - h / 2, w, h };
      const c = (doc.camadas || []).find((k) => k.id === b.dataset.id);
      if (c && c.tipo === 'texto') {
        const r = b.getBoundingClientRect();
        if (r.left - p.left < seguro.x - 1 || r.top - p.top < seguro.y - 1 || r.right - p.left > seguro.x + seguro.w + 1 || r.bottom - p.top > seguro.y + seguro.h + 1) qa.push(`texto fora da área segura (${fmt}): "${(c.texto || '').replace(/[*_\n]/g, ' ').slice(0, 40)}"`);
      }
    }
    return { W, H, caixas, seguro, qa: [...qa, ...MK.qa] };
  };

  // ---------- edição de texto no próprio quadro ----------
  CENA.editarTexto = (id, aoMudar, aoSair) => {
    const b = palco && palco.querySelector(`.cn-camada[data-id="${CSS.escape(id)}"] .cn-texto`);
    if (!b) return false;
    b.contentEditable = 'plaintext-only';
    b.textContent = aoMudar.textoInicial ?? b.textContent;
    b.focus();
    const sel = getSelection(); sel.selectAllChildren(b);
    b.oninput = () => aoMudar(b.innerText.replace(/\n$/, ''));
    b.onblur = () => { b.contentEditable = 'false'; aoSair(); };
    b.onkeydown = (e) => { if (e.key === 'Escape') b.blur(); e.stopPropagation(); };
    return true;
  };

  // ---------- modos ----------
  if (window.CENA_DOC) {
    (async () => {
      try {
        await CENA.iniciar(window.CENA_INIT || {});
        const r = await CENA.render(window.CENA_DOC, window.CENA_FORMATO || '4:5');
        window.MK_PRONTO = { ok: true, qa: r.qa, caixas: r.caixas };
      } catch (e) { console.error(e); window.MK_PRONTO = { ok: false, erro: String((e && e.stack) || e), qa: [] }; }
    })();
  } else {
    let fila = null, ocupado = false;
    const responder = (m) => parent.postMessage({ origem: 'cena', ...m }, '*');
    async function processar() {
      if (ocupado || !fila) return;
      ocupado = true;
      const m = fila; fila = null;
      try { const r = await CENA.render(m.doc, m.formato); responder({ tipo: 'renderizado', seq: m.seq, formato: m.formato, ...r }); }
      catch (e) { responder({ tipo: 'erro', seq: m.seq, erro: String(e && e.message || e) }); }
      ocupado = false;
      processar();
    }
    addEventListener('message', async (ev) => {
      const m = ev.data || {};
      if (m.tipo === 'iniciar') { try { await CENA.iniciar(m.init); responder({ tipo: 'pronto' }); } catch (e) { responder({ tipo: 'erro', erro: String(e.message || e) }); } }
      else if (m.tipo === 'render') { fila = m; processar(); }
      else if (m.tipo === 'editarTexto') {
        const ok = CENA.editarTexto(m.id, Object.assign((t) => responder({ tipo: 'texto', id: m.id, texto: t }), { textoInicial: m.texto }), () => responder({ tipo: 'textoFim', id: m.id }));
        if (!ok) responder({ tipo: 'textoFim', id: m.id });
      }
    });
    responder({ tipo: 'carregado' });
  }
})();
