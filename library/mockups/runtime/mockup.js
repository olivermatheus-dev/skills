/* mockup.js — runtime dos templates do estúdio de mockups (tarefa 028).
   Script clássico (sem módulo) para abrir via file:// no Playwright e num iframe do app.
   Config: window.MOCKUP (injetado pelo tools/mockup/render.mjs) ou JSON no #hash da URL.
   O template chama MK.montar(async (MK) => { ...monta no MK.palco... }); no fim window.MK_PRONTO = { ok, qa }.

   cfg = { brandCss, largura, altura, formato, fundo, transparente, params, textos: {titulo, subtitulo},
           telas: { tela: { src, recorte?: {x,y,w,h}, ocultar: [{x,y,w,h}], aparelho, url? }, tela2?: … },
           destaques: [{ x,y,w,h, rotulo? }],   // px da imagem ORIGINAL da tela "tela"
           zoom: { x,y,w,h } | null }            // idem */
(function () {
  'use strict';
  const cfg = window.MOCKUP || (location.hash.length > 1 ? JSON.parse(decodeURIComponent(location.hash.slice(1))) : null);
  const qa = [];
  const escalas = [];
  const MK = { cfg, qa, telas: {}, params: (cfg && cfg.params) || {} };
  window.MK = MK;

  // ---------- utilidades ----------
  const el = (tag, cls, style, parent) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) for (const [k, v] of Object.entries(style)) e.style[k] = typeof v === 'number' ? v + 'px' : v;
    if (parent) parent.appendChild(e);
    return e;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /** *palavra* = ênfase na cor de destaque · _palavra_ = serifa itálica (1 por título, regra das marcas) */
  const enfase = (s) => esc(s).replace(/_(.+?)_/g, '<em class="mk-serifa">$1</em>').replace(/\*(.+?)\*/g, '<span class="mk-enfase">$1</span>');
  MK.el = el; MK.clamp = clamp; MK.enfase = enfase;
  MK.p = (nome, padrao) => (MK.params[nome] === undefined || MK.params[nome] === '' ? padrao : MK.params[nome]);
  MK.aviso = (msg) => { if (!qa.includes(msg)) qa.push(msg); };

  const carregar = (src) => new Promise((ok, erro) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => erro(new Error('não carregou a imagem ' + src));
    i.src = src;
  });

  // ---------- telas: recorta e borra (ocultar) no canvas, uma vez ----------
  async function prepararTela(nome, t) {
    const img = await carregar(t.src);
    const W = img.naturalWidth, H = img.naturalHeight;
    const r = t.recorte || { x: 0, y: 0, w: W, h: H };
    const c = document.createElement('canvas');
    c.width = Math.round(r.w); c.height = Math.round(r.h);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, -r.x, -r.y);
    for (const o of t.ocultar || []) {
      ctx.save();
      ctx.beginPath(); ctx.rect(o.x - r.x, o.y - r.y, o.w, o.h); ctx.clip();
      ctx.filter = `blur(${Math.max(7, Math.round(o.h * 0.4))}px)`;
      ctx.drawImage(img, -r.x, -r.y);
      ctx.drawImage(c, 0, 0); // 2ª passada: texto pequeno não fica legível
      ctx.restore();
    }
    let url;
    try { url = c.toDataURL('image/png'); } catch { url = t.src; if ((t.ocultar || []).length) MK.aviso('não consegui borrar as áreas ocultas (canvas bloqueado): abra pelo render.mjs'); }
    return { nome, url, canvas: c, w: c.width, h: c.height, ox: r.x, oy: r.y, aparelho: t.aparelho, src: t.src, endereco: t.url };
  }
  /** recorte de uma região (px da imagem original) de uma tela já preparada → nova tela */
  MK.recorte = function (t, reg) {
    const x = clamp(reg.x - t.ox, 0, t.w - 1), y = clamp(reg.y - t.oy, 0, t.h - 1);
    const w = clamp(reg.w, 1, t.w - x), h = clamp(reg.h, 1, t.h - y);
    const c = document.createElement('canvas');
    c.width = Math.round(w); c.height = Math.round(h);
    c.getContext('2d').drawImage(t.canvas, -x, -y);
    let url; try { url = c.toDataURL('image/png'); } catch { url = t.url; }
    return { nome: t.nome + ':recorte', url, canvas: c, w: c.width, h: c.height, ox: t.ox + x, oy: t.oy + y, aparelho: t.aparelho };
  };

  /** caixa w×h com a tela em "cobrir" (padrão) ou "conter"; foco [fx, fy] de 0 a 1 decide o que sobra no corte */
  MK.imagem = function (t, w, h, { ajuste = 'cobrir', foco = [0.5, 0] } = {}) {
    const box = el('div', 'mk-tela', { width: w, height: h });
    const s = ajuste === 'conter' ? Math.min(w / t.w, h / t.h) : Math.max(w / t.w, h / t.h);
    const iw = t.w * s, ih = t.h * s;
    const ox = (iw - w) * (ajuste === 'conter' ? 0.5 : foco[0]), oy = (ih - h) * (ajuste === 'conter' ? 0.5 : foco[1]);
    const im = el('img', '', { width: iw, height: ih, left: -ox, top: -oy }, box);
    im.src = t.url; im.draggable = false; im.alt = '';
    box.mk = { t, s, ox, oy, w, h };
    escalas.push({ nome: t.nome, s });
    return box;
  };
  /** região (px da imagem original) → retângulo dentro da caixa da tela */
  MK.mapear = (box, reg) => {
    const { t, s, ox, oy } = box.mk;
    return { x: (reg.x - t.ox) * s - ox, y: (reg.y - t.oy) * s - oy, w: reg.w * s, h: reg.h * s };
  };
  /** retângulo de um elemento em coordenadas do palco (só vale sem rotação 3D) */
  MK.noPalco = (e) => {
    const a = e.getBoundingClientRect(), p = MK.palco.getBoundingClientRect();
    return { x: a.left - p.left, y: a.top - p.top, w: a.width, h: a.height };
  };
  /** região da tela → coordenadas do palco */
  MK.regiaoNoPalco = (box, reg) => { const b = MK.noPalco(box), m = MK.mapear(box, reg); return { x: b.x + m.x, y: b.y + m.y, w: m.w, h: m.h }; };

  // ---------- aparelhos ----------
  const ANGULOS = {
    frente: '',
    esquerda: 'rotateY(17deg) rotateX(4deg)',
    direita: 'rotateY(-17deg) rotateX(4deg)',
    inclinado: 'rotateX(24deg)',
    isometrico: 'rotateX(50deg) rotateZ(-32deg)',
  };
  MK.ANGULOS = ANGULOS;
  const asp = (t) => t.w / t.h;
  const FRAMES = {
    'sem-moldura': {
      aspecto: (t) => clamp(asp(t), 0.3, 3.5),
      montar(t, w, h, op) {
        const m = el('div');
        const tela = MK.imagem(t, w, h, { foco: op.foco || [0.5, 0] });
        tela.style.borderRadius = Math.round(clamp(w * 0.018, 8, 24)) + 'px';
        m.appendChild(tela);
        return { el: m, tela };
      },
    },
    navegador: {
      // barra proporcional à largura: altura total = w/a + 0.042w
      aspecto: (t) => 1 / (1 / clamp(asp(t), 0.45, 2.4) + 0.042),
      montar(t, w, h, op) {
        const bar = w * 0.042, a = clamp(asp(t), 0.45, 2.4);
        const m = el('div', op.tema === 'escuro' ? 'mk-escuro' : '', { borderRadius: Math.round(clamp(w * 0.014, 8, 18)) });
        const b = el('div', 'mk-barra', { height: bar, paddingLeft: bar * 0.55, gap: bar * 0.28 }, m);
        for (let i = 0; i < 3; i++) el('span', 'mk-bolinha', { width: bar * 0.26, height: bar * 0.26 }, b);
        const end = el('div', 'mk-endereco', { height: bar * 0.6, width: w * 0.36, borderRadius: bar * 0.3, fontSize: bar * 0.3 }, b);
        if (op.endereco) end.textContent = op.endereco;
        const tela = MK.imagem(t, w, w / a, { foco: op.foco || [0, 0] });
        m.appendChild(tela);
        return { el: m, tela };
      },
    },
    celular: {
      aspecto: () => 1 / ((1 - 0.08) / (9 / 19.5) + 0.08),
      montar(t, w, h, op) {
        const p = w * 0.04;
        const m = el('div', op.tema === 'claro' ? 'mk-claro' : '', { borderRadius: w * 0.165 });
        const tela = MK.imagem(t, w - 2 * p, h - 2 * p, { foco: op.foco || [0.5, 0] });
        Object.assign(tela.style, { left: p + 'px', top: p + 'px', borderRadius: w * 0.13 + 'px' });
        m.appendChild(tela);
        el('div', 'mk-ilha', { width: w * 0.29, height: w * 0.085, left: (w - w * 0.29) / 2, top: p + w * 0.03 }, m);
        if (asp(t) > 0.9) MK.aviso('tela larga (desktop) dentro do celular: use um print do celular ou um recorte vertical');
        return { el: m, tela };
      },
    },
    notebook: {
      // tampa L com moldura (lado 2,2%, topo 3%, baixo 4,5%) + base 114% × 3,2%
      aspecto: (t) => { const a = clamp(asp(t), 1.6, 1.78); return 1.14 / ((1 - 0.044) / a + 0.075 + 0.032); },
      montar(t, w, h, op) {
        const L = w / 1.14, a = clamp(asp(t), 1.6, 1.78);
        const sw = L * (1 - 0.044), sh = sw / a, lidH = sh + L * 0.075, baseH = L * 0.032;
        const m = el('div');
        const lid = el('div', 'mk-tampa', { width: L, height: lidH, left: (w - L) / 2, top: 0, borderRadius: `${L * 0.028}px ${L * 0.028}px ${L * 0.008}px ${L * 0.008}px` }, m);
        el('div', 'mk-camera', { width: L * 0.006, height: L * 0.006, left: L / 2 - L * 0.003, top: L * 0.012 }, lid);
        const tela = MK.imagem(t, sw, sh, { foco: op.foco || [0, 0] });
        Object.assign(tela.style, { left: L * 0.022 + 'px', top: L * 0.03 + 'px', borderRadius: L * 0.004 + 'px' });
        lid.appendChild(tela);
        const base = el('div', 'mk-base', { width: w, height: baseH, left: 0, top: lidH, borderRadius: `${baseH * 0.15}px ${baseH * 0.15}px ${baseH * 0.9}px ${baseH * 0.9}px / ${baseH * 0.15}px ${baseH * 0.15}px ${baseH * 0.9}px ${baseH * 0.9}px` }, m);
        el('div', 'mk-entalhe', { width: L * 0.15, height: baseH * 0.4, left: (w - L * 0.15) / 2, top: 0, borderRadius: `0 0 ${baseH * 0.4}px ${baseH * 0.4}px` }, base);
        return { el: m, tela };
      },
    },
  };
  MK.FRAMES = Object.keys(FRAMES);
  /** aparelho com a tela, cabendo na caixa {w,h}. Devolve { el (posicionar com MK.colocar), w, h, tela } */
  MK.moldura = function (tipo, t, caixa, op = {}) {
    const f = FRAMES[tipo];
    if (!f) throw new Error(`aparelho desconhecido: ${tipo} (use ${Object.keys(FRAMES).join(', ')})`);
    const a = f.aspecto(t);
    const w = Math.min(caixa.w, caixa.h * a), h = w / a;
    const r = f.montar(t, w, h, { endereco: t.endereco, ...op });
    r.el.classList.add('mk-moldura', 'mk-' + tipo);
    Object.assign(r.el.style, { width: w + 'px', height: h + 'px' });
    const ang = op.angulo || 'frente';
    const wrap = el('div', 'mk-3d', { width: w, height: h, transform: ANGULOS[ang] ?? ang });
    wrap.appendChild(r.el);
    if (op.reflexo && tipo !== 'sem-moldura') el('div', 'mk-reflexo', null, r.tela);
    if (ang === 'isometrico') r.el.style.filter = 'drop-shadow(0 60px 70px rgba(43,43,43,.22))';
    return { el: wrap, w, h, tela: r.tela, tipo };
  };
  MK.colocar = (o, x, y, z = 5) => { Object.assign((o.el || o).style, { left: x + 'px', top: y + 'px', zIndex: z }); MK.palco.appendChild(o.el || o); return o; };
  MK.sombraChao = (x, y, w, h = w * 0.08) => el('div', 'mk-sombra-chao', { left: x, top: y - h / 2, width: w, height: h }, MK.palco);

  // ---------- textos ----------
  MK.tamTitulo = () => Math.round(Math.min(MK.W, MK.H * 1.1) * (MK.H > MK.W * 1.5 ? 0.072 : MK.H > MK.W ? 0.066 : 0.058));
  /** título/subtítulo numa faixa {x, y, w}; devolve a altura usada (0 se não há texto) */
  MK.titulo = function ({ x, y, w, tam = MK.tamTitulo(), alinhar = 'center' } = {}) {
    const { titulo, subtitulo } = cfg.textos || {};
    if (!titulo && !subtitulo) return 0;
    const wrap = el('div', 'mk-titulos', { left: x, top: y, width: w, textAlign: alinhar }, MK.palco);
    if (titulo) el('h1', 'mk-titulo', { fontSize: tam }, wrap).innerHTML = enfase(titulo);
    if (subtitulo) el('p', 'mk-subtitulo', { fontSize: Math.round(tam * 0.46) }, wrap).innerHTML = enfase(subtitulo);
    return wrap.getBoundingClientRect().height;
  };
  /** coloca título/subtítulo (respeitando a área segura do 9:16) e devolve a área livre {x, y, w, h} para o resto */
  MK.cabecalho = function () {
    const m = MK.margem, alto = MK.H / MK.W > 1.7;
    const topo = alto ? Math.round(MK.H * 0.11) : m;
    const ht = MK.titulo({ x: m, y: topo, w: MK.W - 2 * m });
    const y = ht ? topo + ht + m * 0.8 : m;
    const base = ht && alto ? Math.round(MK.H * 0.12) : m;
    return { x: m, y, w: MK.W - 2 * m, h: MK.H - y - base };
  };
  MK.tamChip = () => Math.round(Math.min(MK.W, MK.H) * 0.026);
  /** rótulo em pílula; com largura máxima quebra em 2 linhas */
  MK.chip = (texto, tam, maxW) => {
    const c = el('div', 'mk-chip', { fontSize: tam, padding: `${tam * 0.62}px ${tam * 0.9}px` }, MK.palco);
    c.textContent = texto;
    if (maxW && c.getBoundingClientRect().width > maxW) Object.assign(c.style, { whiteSpace: 'normal', width: maxW + 'px', lineHeight: '1.25', borderRadius: tam * 1.1 + 'px' });
    return c;
  };
  MK.medir = (e) => e.getBoundingClientRect();
  MK.svg = () => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'mk-linhas'); s.setAttribute('width', MK.W); s.setAttribute('height', MK.H); MK.palco.appendChild(s); return s; };
  MK.tracar = (svg, tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); svg.appendChild(n); return n; };

  // ---------- montagem ----------
  async function carregarMarca(href) {
    if (!href) return;
    await new Promise((ok) => { const l = el('link'); l.rel = 'stylesheet'; l.href = href; l.onload = ok; l.onerror = () => { MK.aviso('brand.css não carregou'); ok(); }; document.head.appendChild(l); });
    const cs = getComputedStyle(document.documentElement);
    const fontes = [`700 64px ${cs.getPropertyValue('--font-heading') || 'sans-serif'}`, `500 32px ${cs.getPropertyValue('--font-body') || 'sans-serif'}`, `italic 500 64px ${cs.getPropertyValue('--font-accent') || 'serif'}`];
    await Promise.all(fontes.map((f) => document.fonts.load(f).catch(() => null)));
    await document.fonts.ready;
  }
  MK.montar = async function (fn) {
    try {
      if (!cfg) throw new Error('sem configuração (window.MOCKUP ou #hash)');
      await carregarMarca(cfg.brandCss);
      for (const [nome, t] of Object.entries(cfg.telas || {})) MK.telas[nome] = await prepararTela(nome, t);
      MK.W = cfg.largura; MK.H = cfg.altura;
      MK.dpr = Math.max(1, ...Object.values(cfg.telas || {}).map((t) => t.dpr || 1)); // print em 1× não aguenta muito zoom
      MK.retrato = MK.H > MK.W * 1.05; MK.paisagem = MK.W > MK.H * 1.05;
      MK.margem = Math.round(Math.min(MK.W, MK.H) * 0.07);
      const palco = (MK.palco = el('div', '', { width: MK.W, height: MK.H }, document.body));
      palco.id = 'palco';
      const fundo = cfg.transparente ? 'transparente' : cfg.fundo || 'liso';
      if (fundo !== 'transparente') {
        palco.classList.add('mk-fundo-' + fundo);
        if (fundo === 'desfoque' && MK.telas.tela) el('div', 'mk-fundo-desfoque-img', { backgroundImage: `url(${MK.telas.tela.url})` }, palco);
      }
      await fn(MK);
      await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
      conferir();
      window.MK_PRONTO = { ok: true, qa };
    } catch (e) {
      console.error(e);
      window.MK_PRONTO = { ok: false, erro: String((e && e.stack) || e), qa };
    }
  };

  // ---------- QA automático ----------
  function conferir() {
    const pior = escalas.reduce((m, e) => (e.s > m.s ? e : m), { s: 0 });
    const dpr = Math.max(...Object.values(cfg.telas || {}).map((t) => t.dpr || 1), 1);
    // s = px de tela por px do print. Acima de ~1,35 o print é esticado e o texto fica macio
    if (pior.s > 1.35) MK.aviso(`print esticado ${pior.s.toFixed(1)}× (${pior.nome}): texto pode ficar macio${dpr < 2 ? '; capture com dpr 2–3 (fase B) ou reduza o zoom' : ''}`);
    const p = MK.palco.getBoundingClientRect();
    const mx = MK.W * 0.04, my = MK.H * 0.04;
    for (const n of MK.palco.querySelectorAll('.mk-titulos, .mk-chip')) {
      const r = n.getBoundingClientRect();
      if (r.left - p.left < mx - 1 || r.top - p.top < my - 1 || p.right - r.right < mx - 1 || p.bottom - r.bottom < my - 1) MK.aviso(`texto fora da área segura: "${n.textContent.slice(0, 40)}"`);
    }
    if (MK.H / MK.W > 1.7) for (const n of MK.palco.querySelectorAll('.mk-titulos')) {
      const r = n.getBoundingClientRect();
      if (r.top - p.top < MK.H * 0.1 || p.bottom - r.bottom < MK.H * 0.18) MK.aviso('9:16: título sob a interface do Stories/Reels (topo 10%, base 18%)');
    }
  }
})();
