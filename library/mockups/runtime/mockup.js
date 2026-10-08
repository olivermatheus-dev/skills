/* mockup.js — runtime dos templates do estúdio de mockups (tarefa 028).
   Script clássico (sem módulo) para abrir via file:// no Playwright e num iframe do app.
   Config: window.MOCKUP (injetado pelo tools/mockup/render.mjs) ou JSON no #hash da URL.
   O template chama MK.montar(async (MK) => { ...monta no MK.palco... }); no fim window.MK_PRONTO = { ok, qa }.

   cfg = { brandCss, largura, altura, formato, fundo, transparente, params, textos: {titulo, subtitulo},
           telas: { tela: { src, recorte?: {x,y,w,h}, ocultar: [{x,y,w,h}], aparelho, url?, dpr }, tela2?: …, tela3?: … },
           destaques: [{ x,y,w,h, rotulo? }],   // px da imagem ORIGINAL da tela "tela"
           zoom: { x,y,w,h } | null,            // idem
           aparelhos: { <id>: aparelho.json + { base, variantes[o].mascaraUrl } } }   // molduras realistas calibradas

   Params globais (todo template): sombra (nenhuma|contato|suave|flutuante|produto|dramatica), cantos (nenhum|sutil|medio|grande|ios|macos),
   cor (do aparelho real), orientacao, ajuste (auto|cobrir|conter|estender), grao (true|false), realista (true|false). */
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
  /** cor média e uniformidade de uma faixa da borda (para "estender" a tela sem emenda) */
  /** faixa da borda (base: últimas linhas; direita: últimas colunas). "lisa" = cada coluna (ou linha) não muda ao longo da faixa,
      mesmo com cores diferentes (barra lateral branca + conteúdo creme): aí dá para esticar a última linha sem emenda. */
  function borda(ctx, lado, W, H) {
    const n = Math.min(4, lado === 'base' ? H : W); // só as últimas linhas: é o que vai ser esticado
    const d = lado === 'base' ? ctx.getImageData(0, H - n, W, n).data : ctx.getImageData(W - n, 0, n, H).data;
    const largura = lado === 'base' ? W : n, comp = lado === 'base' ? W : H;
    let ruins = 0, r = 0, g = 0, b = 0;
    for (let k = 0; k < comp; k++) {
      // pixel da última linha/coluna × os de dentro da faixa
      const ult = lado === 'base' ? ((n - 1) * largura + k) * 4 : (k * largura + n - 1) * 4;
      r += d[ult]; g += d[ult + 1]; b += d[ult + 2];
      let dif = 0;
      for (let j = 0; j < n - 1; j++) { const i = lado === 'base' ? (j * largura + k) * 4 : (k * largura + j) * 4; dif = Math.max(dif, Math.abs(d[i] - d[ult]) + Math.abs(d[i + 1] - d[ult + 1]) + Math.abs(d[i + 2] - d[ult + 2])); }
      if (dif > 12) ruins++;
    }
    const tira = document.createElement('canvas');
    tira.width = lado === 'base' ? W : 1; tira.height = lado === 'base' ? 1 : H;
    tira.getContext('2d').drawImage(ctx.canvas, lado === 'base' ? 0 : W - 1, lado === 'base' ? H - 1 : 0, tira.width, tira.height, 0, 0, tira.width, tira.height);
    return { cor: `rgb(${(r / comp) | 0},${(g / comp) | 0},${(b / comp) | 0})`, uniforme: ruins / comp < 0.1, tira: tira.toDataURL('image/png') };
  }
  async function prepararTela(nome, t) {
    const img = await carregar(t.src);
    const W = img.naturalWidth, H = img.naturalHeight;
    const r = t.recorte || { x: 0, y: 0, w: W, h: H };
    const c = document.createElement('canvas');
    c.width = Math.round(r.w); c.height = Math.round(r.h);
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, -r.x, -r.y);
    for (const o of t.ocultar || []) {
      ctx.save();
      ctx.beginPath(); ctx.rect(o.x - r.x, o.y - r.y, o.w, o.h); ctx.clip();
      ctx.filter = `blur(${Math.max(7, Math.round(o.h * 0.4))}px)`;
      ctx.drawImage(img, -r.x, -r.y);
      ctx.drawImage(c, 0, 0); // 2ª passada: texto pequeno não fica legível
      ctx.restore();
    }
    let url, baixo, direita;
    try {
      url = c.toDataURL('image/png');
      baixo = borda(ctx, 'base', c.width, c.height); direita = borda(ctx, 'direita', c.width, c.height);
    } catch { url = t.src; if ((t.ocultar || []).length) MK.aviso('não consegui borrar as áreas ocultas (canvas bloqueado): abra pelo render.mjs'); }
    return { nome, url, canvas: c, w: c.width, h: c.height, ox: r.x, oy: r.y, aparelho: t.aparelho, src: t.src, endereco: t.url, dpr: t.dpr || 1, baixo, direita };
  }
  /** recorte de uma região (px da imagem original) de uma tela já preparada → nova tela */
  MK.prepararTela = prepararTela;
  MK.recorte = function (t, reg) {
    const x = clamp(reg.x - t.ox, 0, t.w - 1), y = clamp(reg.y - t.oy, 0, t.h - 1);
    const w = clamp(reg.w, 1, t.w - x), h = clamp(reg.h, 1, t.h - y);
    const c = document.createElement('canvas');
    c.width = Math.round(w); c.height = Math.round(h);
    c.getContext('2d').drawImage(t.canvas, -x, -y);
    let url; try { url = c.toDataURL('image/png'); } catch { url = t.url; }
    return { nome: t.nome + ':recorte', url, canvas: c, w: c.width, h: c.height, ox: t.ox + x, oy: t.oy + y, aparelho: t.aparelho, dpr: t.dpr };
  };

  /** caixa w×h com a tela.
      ajuste: "cobrir" (corta o que sobra, foco [fx, fy] 0–1 decide o quê) · "conter" (inteira, centralizada) ·
              "estender" (inteira, colada no topo/esquerda; a sobra é pintada com a cor da borda do print — some a emenda) */
  MK.imagem = function (t, w, h, { ajuste = 'cobrir', foco = [0.5, 0] } = {}) {
    const box = el('div', 'mk-tela', { width: w, height: h });
    const larga = t.w / t.h > w / h;
    let s, ox, oy;
    if (ajuste === 'estender') {
      // a sobra é a última linha (ou coluna) do print esticada: cada coluna continua com a própria cor, sem emenda
      s = larga ? w / t.w : h / t.h; ox = 0; oy = 0;
      const b = larga ? t.baixo : t.direita;
      if (b) {
        box.style.background = b.cor;
        const ih = t.h * s, iw = t.w * s;
        const resto = el('div', '', larga ? { position: 'absolute', left: 0, top: ih - 1, width: w, height: Math.max(0, h - ih + 1) } : { position: 'absolute', top: 0, left: iw - 1, height: h, width: Math.max(0, w - iw + 1) }, box);
        resto.style.background = `url(${b.tira}) 0 0 / 100% 100% no-repeat`;
      }
    } else {
      s = ajuste === 'conter' ? Math.min(w / t.w, h / t.h) : Math.max(w / t.w, h / t.h);
      const iw = t.w * s, ih = t.h * s;
      ox = (iw - w) * (ajuste === 'conter' ? 0.5 : foco[0]); oy = (ih - h) * (ajuste === 'conter' ? 0.5 : foco[1]);
    }
    const im = el('img', '', { width: t.w * s, height: t.h * s, left: -ox, top: -oy }, box);
    im.src = t.url; im.draggable = false; im.alt = '';
    box.mk = { t, s, ox, oy, w, h };
    escalas.push({ nome: t.nome, s, dpr: t.dpr });
    return box;
  };
  /** escolhe o ajuste quando a proporção do print e a da tela do aparelho não batem */
  MK.ajusteAuto = function (t, w, h) {
    const pedido = MK.p('ajuste', 'auto');
    if (pedido !== 'auto') return pedido;
    const r = (t.w / t.h) / (w / h);
    if (Math.abs(Math.log(r)) < 0.08) return 'cobrir';
    // print mais largo que a tela: cortar as laterais esconde coisa; se a base do print é lisa, estende para baixo
    // print mais largo que a tela: cortar as laterais esconde conteúdo; se as últimas linhas são "lisas" por coluna, estende para baixo
    if (r > 1 && t.baixo && t.baixo.uniforme && r < 1.6) return 'estender';
    // print mais estreito/alto que a tela: corta embaixo (a tela "rola"), nunca deixa sobra à direita
    return 'cobrir';
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
  /** região da tela → coordenadas do palco (a tela pode estar escalada dentro do aparelho real) */
  MK.regiaoNoPalco = (box, reg) => {
    const b = MK.noPalco(box), m = MK.mapear(box, reg), k = b.w / box.mk.w;
    return { x: b.x + m.x * k, y: b.y + m.y * k, w: m.w * k, h: m.h * k };
  };

  // ---------- presets ----------
  /** raio do canto como fração da largura da tela (macos = janela do macOS ~16 px em 1512) */
  const CANTOS = { nenhum: 0, sutil: 0.008, medio: 0.016, grande: 0.03, ios: 0.055, macos: 0.0105 };
  MK.CANTOS = CANTOS;
  MK.raio = (w, nome) => Math.round(w * (CANTOS[nome ?? MK.p('cantos', 'medio')] ?? CANTOS.medio));
  /** sombras em camadas (Comeau/Ahlin): [y, blur, alfa] × k (k = tamanho do objeto). Cor tingida, nunca preto puro. */
  const SOMBRAS = {
    nenhuma: [],
    contato: [[1, 2, 0.22], [3, 6, 0.12]],
    suave: [[1, 2, 0.07], [4, 8, 0.06], [12, 24, 0.06], [24, 48, 0.05]],
    flutuante: [[2, 4, 0.06], [8, 16, 0.06], [24, 48, 0.08], [48, 96, 0.1]],
    produto: [[1, 2, 0.1], [6, 12, 0.09], [24, 40, 0.13], [60, 100, 0.17]],
    dramatica: [[10, 20, 0.12], [30, 60, 0.18], [80, 140, 0.3]],
  };
  MK.SOMBRAS = SOMBRAS;
  const corSombra = () => (getComputedStyle(document.documentElement).getPropertyValue('--mk-sombra-rgb').trim() || '22 26 38');
  MK.corSombra = corSombra;
  /** filter: drop-shadow em camadas (segue o contorno do PNG: moldura real, recorte transparente) */
  MK.dropShadow = (nome, tam) => {
    const k = clamp(tam / 900, 0.35, 2.2), c = corSombra();
    return (SOMBRAS[nome] || []).map(([y, b, a]) => `drop-shadow(0 ${(y * k).toFixed(1)}px ${(b * k * 0.5).toFixed(1)}px rgb(${c} / ${a}))`).join(' ');
  };
  /** box-shadow em camadas (caixas: tela sem moldura, cards, navegador) + borda de 0,5 px */
  MK.boxShadow = (nome, tam) => {
    const k = clamp(tam / 900, 0.35, 2.2), c = corSombra();
    const camadas = (SOMBRAS[nome] || []).map(([y, b, a]) => `0 ${(y * k).toFixed(1)}px ${(b * k).toFixed(1)}px rgb(${c} / ${a})`);
    return [`0 0 0 0.5px rgb(${c} / .10)`, ...camadas].join(', ');
  };

  // ---------- aparelhos ----------
  const ANGULOS = {
    frente: '',
    esquerda: 'rotateY(17deg) rotateX(4deg)',
    direita: 'rotateY(-17deg) rotateX(4deg)',
    inclinado: 'rotateX(24deg)',
    isometrico: 'rotateX(50deg) rotateZ(-32deg)',
    heroi: 'rotateX(12deg) rotateY(-20deg) rotateZ(3deg)',
    'heroi-esq': 'rotateX(12deg) rotateY(20deg) rotateZ(-3deg)',
    deitado: 'rotateX(58deg) rotateZ(0deg)',
  };
  MK.ANGULOS = ANGULOS;
  const asp = (t) => t.w / t.h;

  // molduras realistas (Apple Product Bezels, Android Studio device art), calibradas pelo tools/mockup/aparelhos.mjs
  const APS = {}, APELIDO = {};
  /** registra (ou troca) o catálogo de molduras: o editor (cena.js) recebe o catálogo depois do carregamento */
  MK.registrarAparelhos = (aps) => {
    for (const k of Object.keys(APS)) delete APS[k];
    for (const k of Object.keys(APELIDO)) delete APELIDO[k];
    Object.assign(APS, aps || {});
    for (const a of Object.values(APS)) for (const k of a.apelidos || []) APELIDO[k] = a.id;
    MK.APARELHOS = Object.keys(APS);
  };
  MK.registrarAparelhos(cfg && cfg.aparelhos);
  // nomes genéricos → aparelho real equivalente (o CSS genérico continua em "<nome>-generico")
  const REAL_DE = { celular: 'iphone', notebook: 'macbook', tablet: 'ipad', desktop: 'imac', monitor: 'monitor' };
  MK.aparelhoReal = (tipo) => {
    if (APS[tipo]) return APS[tipo];
    if (APELIDO[tipo]) return APS[APELIDO[tipo]];
    if (REAL_DE[tipo] && MK.p('realista', true) !== false && MK.p('realista', true) !== 'false') return APS[APELIDO[REAL_DE[tipo]]];
    return null;
  };
  function varianteReal(a, t, op) {
    const vs = a.variantes;
    if (op.orientacao && vs[op.orientacao]) return op.orientacao;
    const nomes = Object.keys(vs);
    if ((a.tipo === 'celular' || a.tipo === 'dobravel') && vs[a.padrao.orientacao]) return a.padrao.orientacao; // celular deitado só se pedir
    let melhor = nomes[0], dif = Infinity;
    for (const n of nomes) { const v = vs[n], d = Math.abs(Math.log((v.tela.w / v.tela.h) / asp(t))); if (d < dif) { dif = d; melhor = n; } }
    return melhor;
  }
  function montarReal(a, t, w, h, op) {
    const ori = varianteReal(a, t, op), v = a.variantes[ori];
    const cor = [op.cor, MK.p('cor'), a.padrao.cor].find((c) => c && v.arquivos[c]) || Object.keys(v.arquivos)[0];
    if (op.cor && !v.arquivos[op.cor]) MK.aviso(`${a.id}: cor "${op.cor}" não existe (tem: ${Object.keys(v.arquivos).join(', ')})`);
    const s = w / v.largura;
    const m = el('div', 'mk-real');
    const T = v.tela, tw = T.w * s, th = T.h * s;
    const tela = MK.imagem(t, tw, th, { ajuste: op.ajuste || MK.ajusteAuto(t, tw, th), foco: op.foco || (a.tipo === 'celular' || a.tipo === 'dobravel' ? [0.5, 0] : [0, 0]) });
    tela.classList.add('mk-tela-real');
    Object.assign(tela.style, { left: T.x * s + 'px', top: T.y * s + 'px' });
    if (v.mascaraUrl) { tela.style.maskImage = `url("${v.mascaraUrl}")`; tela.style.maskSize = '100% 100%'; }
    m.appendChild(tela);
    const q = el('img', 'mk-quadro', { width: w, height: h }, m);
    q.src = a.base + v.arquivos[cor]; q.alt = ''; q.draggable = false;
    if ((a.tipo === 'celular' || a.tipo === 'dobravel') && asp(t) > 0.9 && !op.orientacao) MK.aviso(`tela larga (desktop) dentro do ${a.nome}: use um print do celular ou um recorte vertical`);
    return { el: m, tela, real: a, variante: ori, cor };
  }
  const aspectoReal = (a, t, op) => { const v = a.variantes[varianteReal(a, t, op)]; return v.largura / v.altura; };

  const FRAMES = {
    'sem-moldura': {
      aspecto: (t) => clamp(asp(t), 0.3, 3.5),
      montar(t, w, h, op) {
        const m = el('div');
        const tela = MK.imagem(t, w, h, { foco: op.foco || [0.5, 0] });
        tela.style.borderRadius = MK.raio(w, op.cantos) + 'px';
        if (MK.p('cantos', 'medio') === 'ios') tela.style.cornerShape = 'superellipse(1.6)';
        m.appendChild(tela);
        return { el: m, tela };
      },
    },
    vidro: {
      // tela dentro de uma borda de vidro (backdrop-filter): o fundo atravessa, desfocado — estilo "glass" do shots.so/visionOS
      aspecto: (t) => { const a = clamp(asp(t), 0.3, 3.5); return (1 + 0.05) / (1 / a + 0.05); },
      montar(t, w, h, op) {
        const p = w * 0.025;
        const r = MK.raio(w - 2 * p, op.cantos || MK.p('cantos', 'grande'));
        const m = el('div', 'mk-vidro-borda' + (op.tema === 'escuro' ? ' mk-escuro' : ''), { padding: p, borderRadius: r + p });
        const tela = MK.imagem(t, w - 2 * p, h - 2 * p, { foco: op.foco || [0.5, 0] });
        tela.style.borderRadius = r + 'px';
        m.appendChild(tela);
        return { el: m, tela };
      },
    },
    navegador: {
      // janela estilo macOS/Safari: barra = 3,8% da largura, semáforo à esquerda, endereço centralizado
      aspecto: (t) => 1 / (1 / clamp(asp(t), 0.45, 2.4) + 0.038),
      montar(t, w, h, op) {
        const bar = w * 0.038, a = clamp(asp(t), 0.45, 2.4);
        const r = Math.round(clamp(w * 0.0105, 8, 22));
        const m = el('div', op.tema === 'escuro' ? 'mk-escuro' : '', { borderRadius: r });
        const b = el('div', 'mk-barra', { height: bar, paddingLeft: bar * 0.48, gap: bar * 0.2 }, m);
        const cores = MK.p('bolinhas', 'neutras') === 'cores';
        for (let i = 0; i < 3; i++) el('span', 'mk-bolinha' + (cores ? ' mk-b' + i : ''), { width: bar * 0.27, height: bar * 0.27 }, b);
        const end = el('div', 'mk-endereco', { height: bar * 0.58, width: w * 0.34, borderRadius: bar * 0.18, fontSize: bar * 0.3 }, b);
        if (op.endereco) end.textContent = op.endereco;
        const tela = MK.imagem(t, w, w / a, { foco: op.foco || [0, 0] });
        m.appendChild(tela);
        return { el: m, tela };
      },
    },
    'celular-generico': {
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
    'notebook-generico': {
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
  const PADRAO_SOMBRA = { 'sem-moldura': 'flutuante', vidro: 'flutuante', navegador: 'produto' };
  /** onde o aparelho "pisa" (para a sombra de chão): notebook, iMac e monitor ficam apoiados; celular e tela flutuam */
  const APOIADO = { notebook: 1, desktop: 1, monitor: 1, 'notebook-generico': 1 };

  /** aparelho com a tela, cabendo na caixa {w,h}. Devolve { el (posicionar com MK.colocar), w, h, tela, tipo, real, apoiado }.
      tipo: id real (iphone-18-pro, macbook-pro-14, pixel-10-pro…), apelido (iphone, macbook, ipad, android, imac, monitor),
            genérico (celular, notebook, tablet → viram o real equivalente) ou CSS (navegador, sem-moldura, vidro, celular-generico, notebook-generico) */
  MK.moldura = function (tipo, t, caixa, op = {}) {
    const real = FRAMES[tipo] ? null : MK.aparelhoReal(tipo);
    let f = FRAMES[tipo];
    if (!real && !f) {
      if (FRAMES[tipo + '-generico']) { f = FRAMES[tipo + '-generico']; tipo = tipo + '-generico'; }
      else throw new Error(`aparelho desconhecido: ${tipo} (use ${[...Object.keys(FRAMES), ...Object.keys(APS)].join(', ')})`);
    }
    const a = real ? aspectoReal(real, t, op) : op.aspecto || f.aspecto(t); // op.aspecto: força a proporção (pilha: camadas iguais)
    const w = Math.min(caixa.w, caixa.h * a), h = w / a;
    const r = real ? montarReal(real, t, w, h, op) : f.montar(t, w, h, { endereco: t.endereco, ...op });
    r.el.classList.add('mk-moldura', 'mk-' + (real ? 'real' : tipo));
    Object.assign(r.el.style, { width: w + 'px', height: h + 'px' });
    const ang = op.angulo || 'frente';
    const wrap = el('div', 'mk-3d', { width: w, height: h, transform: ANGULOS[ang] ?? ang });
    wrap.appendChild(r.el);
    // sombra: segue o contorno no aparelho real (drop-shadow), caixa nos genéricos
    const sombra = op.sombra || MK.p('sombra', real ? 'produto' : PADRAO_SOMBRA[tipo] || 'produto');
    if (real || tipo === 'celular-generico' || tipo === 'notebook-generico') r.el.style.filter = MK.dropShadow(sombra, Math.max(w, h));
    else if (tipo === 'vidro') r.el.style.boxShadow = (op.tema === 'escuro' ? 'inset 0 1px 0 rgb(255 255 255 / .16), inset 0 -1px 0 rgb(0 0 0 / .3), ' : 'inset 0 1px 0 rgb(255 255 255 / .75), inset 0 0 0 1px rgb(255 255 255 / .18), ') + MK.boxShadow(sombra, Math.max(w, h));
    else (tipo === 'navegador' ? r.el : r.tela).style.boxShadow = MK.boxShadow(sombra, Math.max(w, h));
    if (op.reflexo && tipo !== 'sem-moldura') el('div', 'mk-reflexo', null, r.tela);
    const rotulo = real ? real.tipo : tipo;
    return { el: wrap, w, h, tela: r.tela, tipo, real: real || null, cor: r.cor, apoiado: !!APOIADO[rotulo], sombra };
  };
  /** família do aparelho: celular | tablet | notebook | desktop | monitor | janela (navegador) | tela (sem moldura, vidro) */
  MK.classe = (tipo) => {
    const r = FRAMES[tipo] ? null : MK.aparelhoReal(tipo);
    if (r) return r.tipo === 'dobravel' ? 'celular' : r.tipo;
    return { navegador: 'janela', 'sem-moldura': 'tela', vidro: 'tela', 'celular-generico': 'celular', 'notebook-generico': 'notebook' }[tipo] || tipo;
  };
  /** aparelho padrão para o print: celular → iPhone real, tablet → iPad real, desktop → janela de navegador */
  MK.aparelhoPadrao = (t) => (t.aparelho === 'celular' ? 'celular' : t.aparelho === 'tablet' ? 'tablet' : 'navegador');
  MK.colocar = (o, x, y, z = 5) => { Object.assign((o.el || o).style, { left: x + 'px', top: y + 'px', zIndex: z }); MK.palco.appendChild(o.el || o); return o; };
  /** sombra de chão em 2 camadas: contato (curta e escura) + ambiente (larga e suave) */
  MK.sombraChao = (x, y, w, h = w * 0.08, forca = 1) => {
    const c = corSombra();
    const amb = el('div', 'mk-sombra-chao', { left: x - w * 0.06, top: y - h * 0.7, width: w * 1.12, height: h * 1.4, background: `radial-gradient(closest-side, rgb(${c} / ${0.18 * forca}), rgb(${c} / 0))`, filter: `blur(${Math.round(h * 0.35)}px)` }, MK.palco);
    const con = el('div', 'mk-sombra-chao', { left: x + w * 0.04, top: y - h * 0.22, width: w * 0.92, height: h * 0.44, background: `radial-gradient(closest-side, rgb(${c} / ${0.32 * forca}), rgb(${c} / 0))`, filter: `blur(${Math.round(h * 0.12)}px)` }, MK.palco);
    return [amb, con];
  };
  /** sombra de chão automática para aparelho apoiado (notebook, iMac, monitor), colocado em (x, y) */
  MK.chao = (ap, x, y) => { if (ap.apoiado && ap.sombra !== 'nenhuma') MK.sombraChao(x + ap.w * 0.02, y + ap.h * 0.995, ap.w * 0.96, ap.w * 0.035); };

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
  /** rótulo em pílula; com largura máxima quebra em 2 linhas. Estilo: param chips = solido | vidro */
  MK.chip = (texto, tam, maxW) => {
    const c = el('div', 'mk-chip' + (MK.p('chips', 'solido') === 'vidro' ? ' mk-chip-vidro' : ''), { fontSize: tam, padding: `${tam * 0.62}px ${tam * 0.9}px` }, MK.palco);
    c.textContent = texto;
    if (maxW && c.getBoundingClientRect().width > maxW) Object.assign(c.style, { whiteSpace: 'normal', width: maxW + 'px', lineHeight: '1.25', borderRadius: tam * 1.1 + 'px' });
    return c;
  };
  MK.medir = (e) => e.getBoundingClientRect();
  MK.svg = () => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'mk-linhas'); s.setAttribute('width', MK.W); s.setAttribute('height', MK.H); MK.palco.appendChild(s); return s; };
  MK.tracar = (svg, tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); svg.appendChild(n); return n; };

  // ---------- fundos ----------
  /** fundos premium com paleta própria (não usam a marca): o gerador de alternativas só usa os que a marca libera em brand/mockups.json */
  const PREMIUM = ['estudio', 'estudio-escuro', 'neutro', 'grafite', 'aurora', 'pessego', 'gelo', 'ametista', 'por-do-sol', 'macos', 'menta', 'vinho', 'papel', 'vidro-fosco'];
  MK.FUNDOS = ['liso', 'gradiente', 'malha', 'grade', 'pontos', 'brilho', 'desfoque', 'spot', ...PREMIUM, 'transparente'];
  const COM_GRAO = { aurora: 1, pessego: 1, gelo: 1, ametista: 1, 'por-do-sol': 1, macos: 1, menta: 1, vinho: 1, papel: 1, malha: 1, grafite: 1, 'estudio-escuro': 1, 'vidro-fosco': 1 };
  const ESCUROS = { 'estudio-escuro': 1, grafite: 1, aurora: 1, vinho: 1, macos: 1, ametista: 1 };
  MK.fundoEscuro = () => !!ESCUROS[MK.fundo];
  function pintarFundo(palco, fundo) {
    palco.classList.add('mk-fundo-' + fundo);
    if (ESCUROS[fundo]) palco.classList.add('mk-sobre-escuro');
    if (fundo === 'desfoque' && MK.telas.tela) el('div', 'mk-fundo-desfoque-img', { backgroundImage: `url(${MK.telas.tela.url})` }, palco);
    if (fundo === 'vidro-fosco' && MK.telas.tela) el('div', 'mk-fundo-desfoque-img mk-forte', { backgroundImage: `url(${MK.telas.tela.url})` }, palco);
    const grao = MK.p('grao', COM_GRAO[fundo] ? true : false);
    if (grao && grao !== 'false') el('div', 'mk-grao' + (ESCUROS[fundo] ? ' mk-grao-escuro' : ''), null, palco);
  }

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
      MK.fundo = cfg.transparente ? 'transparente' : cfg.fundo || 'liso';
      if (MK.fundo !== 'transparente') pintarFundo(palco, MK.fundo);
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
    // s = px de tela (CSS) por px do print, já descontando a escala real dentro do aparelho
    const pior = escalas.map((e) => ({ ...e, s: e.s })).reduce((m, e) => (e.s > m.s ? e : m), { s: 0 });
    const dpr = Math.max(...Object.values(cfg.telas || {}).map((t) => t.dpr || 1), 1);
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
