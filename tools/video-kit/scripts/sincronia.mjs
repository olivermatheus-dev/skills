// Sincronia de um vídeo ou de uma variante (tarefa 045 C): confere por script o que faz cada variante "sair perfeita"
// e diz o que corrigir. Duas partes:
//   qcTempo  (sem navegador): evento preso a palavra fora da cena, bloco abaixo do min_s, gancho na tela, abertura e
//            duração no teto, tela parada, texto na tela que a fala não diz, trilha (pulo, sobra, fim no compasso).
//   qcTela   (Playwright no render/<formato>/index.html, quadro a quadro): tempo de leitura real de cada texto,
//            texto fora da área segura e texto em cima de outro elemento (cartão, fragmento, outro texto).
// Numa variante, a base aprovada é o gabarito: o que já acontecia na base sai como "herdado" (informação), não aviso.
// Cada problema traz `auto` quando o script resolve sozinho (patch pequeno: tail, min, offset); o resto vai para o
// relatório curto do LLM (relatorio()), que devolve um ajuste JSON em projeto.json > ajustes.
//
// Uso avulso (qualquer vídeo, sem base): node tools/video-kit/scripts/sincronia.mjs <pasta> [--only=9x16] [--sem-tela]
//   (a tela precisa do render montado: produce.mjs <pasta> --build-only)
// Nas variantes, o variantes.mjs chama tudo sozinho. Contrato: .claude/skills/video/references/variantes.md > Sincronia.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { r3, video } from './lib.mjs';
import { resolverBloco } from './compor.mjs';

export const LIMITES = {
  gancho_s: 3,          // a 1ª frase da tela completa até aqui (regra do gancho)
  abertura_max_s: null, // início do corpo (2ª cena); no anúncio, defina no projeto
  max_s: null,          // duração total
  parado_s: 3,          // teto sem nada novo numa cena
  leitura_palavra_s: 0.3, leitura_min_s: 1, leitura_cauda_s: 0.5, // texto legível e parado ≥ max(1; 0,3 × palavras) (knowledge/video/REGRAS.md §2)
  tail_extra_max: 0.8,  // a correção automática estica o fim de uma cena no máximo isto
  colisao: 0.1,         // fração da área do texto coberta por outro elemento
  colisao_min_s: 0.2,   // só conta se durar isto
  batidas: 1,           // tolerância da trilha (em batidas)
};
const FORMATOS = { '4x5': [1080, 1350], '9x16': [1080, 1920], '16x9': [1920, 1080], '1x1': [1080, 1080] };
/** Área segura do texto-chave (knowledge/video/REGRAS.md §3). */
const seguro = (f, tipo) => (f === '9x16' ? { x0: 65, x1: 930, y0: 270, y1: tipo === 'anuncio' ? 1250 : 1440 } : { x0: 80, x1: FORMATOS[f][0] - 80, y0: 80, y1: FORMATOS[f][1] - 80 });

const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '');
const palavras = (s = '') => s.replace(/\*/g, '').split(/[\s|]+/).filter((w) => fold(w));
const falaDaCena = (tl, s) => (s?.vo || []).flatMap((id) => tl.vo?.find((x) => x.id === id)?.words || []);
/** Casa o texto da tela com a fala na ordem, como o K.type do runtime: [{ w, t }] (t = null se a fala não diz). */
function casar(texto, ws) {
  let j = 0;
  return palavras(texto).map((w) => {
    const k = ws.findIndex((x, i) => i >= j && fold(x.w) === fold(w));
    if (k < 0) return { w, t: null };
    j = k + 1;
    return { w, t: ws[k].s };
  });
}
const parado = (tl, s) => {
  const marcas = [s.start, s.end, ...(tl.events || []).filter((e) => e.scene === s.id).map((e) => e.t), ...(tl.vo || []).filter((v) => v.start >= s.start && v.start < s.end).map((v) => v.start)].sort((a, b) => a - b);
  return r3(Math.max(0, ...marcas.slice(1).map((m, i) => m - marcas[i])));
};
const gancho = (tl) => {
  const s = tl.scenes[0];
  const parte = String(s?.on_screen || '').split('|')[0];
  const t = casar(parte, falaDaCena(tl, s)).filter((x) => x.t != null).at(-1)?.t;
  return { parte: parte.replace(/\*/g, ''), t: t == null ? null : r3(t) };
};

/** min_s de cada bloco usado (use → segundos), lido do bloco.json. */
export function minimos(v) {
  const out = {};
  for (const s of v.tl.scenes) if (s.use && !(s.use in out)) {
    try { out[s.use] = JSON.parse(readFileSync(join(resolverBloco(v, s.use).dir, 'bloco.json'), 'utf8')).min_s ?? null; } catch { out[s.use] = null; }
  }
  return out;
}

/**
 * Regras de tempo. `intent` = cena que cada evento deveria ter (antes do layout); `base` = timeline aprovada;
 * `trilha` = medidas do variantes.mjs ({ pulo, sobra, residuo, batida, fator, limitado }).
 */
export function qcTempo({ tl, base = null, intent = {}, limites = {}, minS = {}, trilha = null }) {
  const L = { ...LIMITES, ...limites };
  const out = [];
  const add = (nivel, regra, cena, msg, extra = {}) => out.push({ nivel, regra, cena, msg, ...extra });
  const cena = (t, id) => t?.scenes.find((s) => s.id === id);

  // 1. evento preso a palavra: tem de cair dentro da cena que o bloco espera (senão o compor recusa)
  for (const e of tl.events || []) {
    const quer = intent[e.id];
    if (!quer || quer === e.scene) continue;
    const s = cena(tl, quer);
    if (e.word && e.t < s.start && e.t >= s.start - 0.5) {
      const novo = r3((e.offset ?? 0) + (s.start + 0.02 - e.t));
      add('aviso', 'cue-fora', quer, `evento ${e.id} ("${e.cue}", ${e.word}) caía em ${e.t} s, antes do início da cena ${quer} (${s.start} s)`, { auto: { events: { [e.id]: { offset: novo } } }, conserto: `${e.id}.offset ${e.offset ?? 0} → ${novo}` });
    } else add('erro', 'cue-fora', quer, `evento ${e.id} ("${e.cue}", ${e.word || 'sem palavra'}) caiu em ${e.t} s, na cena ${e.scene}, fora da ${quer} (${s.start}–${s.end} s)`);
  }
  // 2. bloco abaixo do mínimo
  for (const s of tl.scenes) {
    const m = minS[s.use], d = r3(s.end - s.start);
    if (m && d < m - 0.01) add('aviso', 'min_s', s.id, `cena ${s.id} (${s.use}) com ${d} s, abaixo do mínimo do bloco (${m} s)`, { auto: { scenes: { [s.id]: { min: m } } }, conserto: `${s.id}.min = ${m}` });
  }
  // 3. gancho, abertura e duração
  const g = gancho(tl), gb = base && gancho(base);
  if (g.t != null && g.t > L.gancho_s) {
    const herdado = gb?.t != null && gb.t > L.gancho_s && g.t <= gb.t + 0.1;
    add(herdado ? 'herdado' : 'aviso', 'gancho', tl.scenes[0].id, `a 1ª frase da tela ("${g.parte}") só completa em ${g.t} s (teto ${L.gancho_s} s${gb?.t != null ? `; na base, ${gb.t} s` : ''})`);
  }
  const corpo = tl.scenes[1]?.start;
  if (L.abertura_max_s && corpo > L.abertura_max_s) add('aviso', 'abertura', tl.scenes[0].id, `o corpo começa em ${corpo} s (teto da abertura ${L.abertura_max_s} s)`);
  if (L.max_s && tl.duration > L.max_s) add('aviso', 'duracao', null, `duração ${tl.duration} s (teto ${L.max_s} s)`);
  // 4. tela parada e texto que a fala não diz (contra a base: só o que piorou)
  for (const s of tl.scenes) {
    const sb = cena(base, s.id);
    const p = parado(tl, s), pb = sb ? parado(base, sb) : 0;
    if (p > L.parado_s && p > pb + 0.3) add('aviso', 'parado', s.id, `cena ${s.id}: ${p} s sem nada novo (teto ${L.parado_s} s${sb ? `; base ${pb} s` : ''})`);
    if (!s.vo?.length || !s.on_screen) continue;
    const soltas = (t, sc) => new Set(casar(sc.on_screen, falaDaCena(t, sc)).filter((x) => x.t == null).map((x) => fold(x.w)));
    const nb = sb?.on_screen ? soltas(base, sb) : new Set();
    const novas = casar(s.on_screen, falaDaCena(tl, s)).filter((x) => x.t == null && !nb.has(fold(x.w))).map((x) => x.w.replace(/[*]/g, ''));
    if (novas.length) add('aviso', 'texto-fala', s.id, `na tela e não na fala: "${novas.join(' ')}" (entram sem voz, logo depois da palavra anterior)`);
  }
  // 5. trilha
  if (trilha) {
    if (trilha.pulo < 0) add('erro', 'trilha', null, `abertura ${r3(-trilha.pulo)} s mais longa que o respiro da trilha: aumente trilha.respiro_compassos no projeto.json`);
    if (trilha.sobra < 0) add('erro', 'trilha', null, `a trilha acaba ${r3(-trilha.sobra)} s antes do vídeo`);
    if (trilha.residuo != null && Math.abs(trilha.residuo) > trilha.batida * L.batidas)
      add('aviso', 'trilha', trilha.fim, `o fim da música (resolve) cai ${r3(trilha.residuo)} s ${trilha.residuo > 0 ? 'depois' : 'antes'} do ponto da base em relação à cena ${trilha.fim}${trilha.limitado ? ` (andamento no teto: ${Math.round((trilha.fator - 1) * 100)}%)` : ''}`);
  }
  return out;
}

// ── tela: mede no navegador, quadro a quadro ───────────────────────────────────────────────
/** Roda dentro da página: avança a timeline do GSAP e devolve medidas compactas (nada por quadro). */
function medirNaPagina({ passo, area, L }) {
  const tl = window.__timelines.main, dur = window.__TL.duration;
  const root = document.getElementById('root'), R0 = root.getBoundingClientRect();
  const instDe = (el) => el.closest('[data-inst]')?.getAttribute('data-inst') || '';
  const cont = {};
  const chave = (el) => {
    const base = `${instDe(el)} ${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''}`;
    cont[base] = (cont[base] || 0) + 1;
    return cont[base] > 1 ? `${base}:${cont[base]}` : base;
  };
  const textos = [...new Set([...root.querySelectorAll('.w')].map((w) => w.parentElement))].map((el) => ({ el, key: chave(el), inst: instDe(el), ws: [...el.querySelectorAll(':scope > .w, .w')].filter((w, i, a) => a.indexOf(w) === i) }));
  const solido = (el) => {
    if (el === root || el.id === 'stage' || el.classList.contains('layer') || el.classList.contains('w')) return false;
    if (el.closest('[data-bloco^="fundo/"]') || el.closest('.k-cursor,.k-ripple')) return false;
    const cs = getComputedStyle(el), alfa = (c) => +(c.match(/rgba?\(([^)]+)\)/)?.[1].split(',')[3] ?? 1) * (c === 'transparent' ? 0 : 1);
    const borda = parseFloat(cs.borderTopWidth) > 0 && alfa(cs.borderTopColor) > 0.1;
    // brilho/halo decorativo (gradiente radial sem cor de fundo, ou desfoque grande) não "cobre" texto
    if (+(cs.filter.match(/blur\((\d+)/)?.[1] ?? 0) >= 20) return false;
    if (/radial-gradient/.test(cs.backgroundImage) && alfa(cs.backgroundColor) <= 0.1 && !borda) return false;
    // svg solto (logo que se desenha, ícone) fica de fora: a opacidade dele não diz se o traço já apareceu
    return cs.backgroundImage !== 'none' || alfa(cs.backgroundColor) > 0.1 || borda || ['img', 'canvas', 'video'].includes(el.tagName.toLowerCase());
  };
  const solidos = [...root.querySelectorAll('*')].filter((el) => !(el.ownerSVGElement) && solido(el)).map((el) => ({ el, key: chave(el), inst: instDe(el) }));
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x0: r.left - R0.left, y0: r.top - R0.top, x1: r.right - R0.left, y1: r.bottom - R0.top }; };
  const uniao = (a, b) => (a ? { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) } : b);
  const areaDe = (r) => Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);
  const inter = (a, b) => areaDe({ x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) });
  const frame = areaDe({ x0: 0, y0: 0, x1: R0.width, y1: R0.height });

  const res = { textos: {}, colisoes: {} };
  const aberto = {};
  for (const c of textos) res.textos[c.key] = { inst: c.inst, n: c.ws.length, txt: c.el.textContent.trim().slice(0, 60), holds: [], fora: null };
  const ops = new Map();
  const percorrer = (el, o) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const v = o * +cs.opacity;
    if (v < 0.05) return;
    ops.set(el, v);
    for (const f of el.children) percorrer(f, v);
  };
  for (let k = 0, t = 0; t <= dur + 1e-6; k++, t = k * passo) {
    tl.seek(t, false);
    ops.clear();
    percorrer(root, 1);
    const caixas = [];
    for (const c of textos) {
      const r = res.textos[c.key];
      // episódio de leitura: [1ª palavra legível, texto inteiro legível, 1ª palavra que some ou recua]
      let vis = 0, caixa = null;
      for (const w of c.ws) {
        const o = ops.get(w) || 0;
        if (o >= 0.9) vis++;
        if (o >= 0.5) caixa = uniao(caixa, rect(w));
      }
      const a = aberto[c.key];
      if (a && vis < a.vis) { r.holds.push([+a.de.toFixed(3), a.cheio == null ? null : +a.cheio.toFixed(3), +t.toFixed(3)]); aberto[c.key] = null; }
      if (vis > 0 && !aberto[c.key]) aberto[c.key] = { de: t, cheio: null, vis: 0 };
      if (aberto[c.key]) { aberto[c.key].vis = vis; if (vis === c.ws.length && aberto[c.key].cheio == null) aberto[c.key].cheio = t; }
      if (!caixa || areaDe(caixa) < 50) continue;
      caixas.push({ c, caixa });
      const px = Math.max(area.x0 - caixa.x0, caixa.x1 - area.x1, area.y0 - caixa.y0, caixa.y1 - area.y1);
      if (px > 4) r.fora = { px: Math.round(Math.max(px, r.fora?.px ?? 0)), de: r.fora?.de ?? +t.toFixed(2), ate: +t.toFixed(2), n: (r.fora?.n ?? 0) + 1 };
    }
    const visiveis = solidos.filter((s) => (ops.get(s.el) || 0) >= 0.5).map((s) => ({ ...s, r: rect(s.el) })).filter((s) => areaDe(s.r) > 400 && areaDe(s.r) < frame * 0.5);
    for (const { c, caixa } of caixas) {
      const a = areaDe(caixa);
      const outros = [...visiveis, ...caixas.filter((x) => x.c !== c).map((x) => ({ el: x.c.el, key: x.c.key, r: x.caixa }))];
      for (const s of outros) {
        if (s.el.contains(c.el) || c.el.contains(s.el)) continue;
        const f = inter(caixa, s.r) / a;
        if (f < L.colisao) continue;
        const par = [c.key, s.key].sort().join(' × ');
        const p = res.colisoes[par] || (res.colisoes[par] = { texto: c.key, outro: s.key, inst: c.inst, max: 0, de: +t.toFixed(2), ate: 0, n: 0 });
        p.max = Math.max(p.max, +f.toFixed(2)); p.ate = +t.toFixed(2); p.n++;
      }
    }
  }
  for (const [key, a] of Object.entries(aberto)) if (a) res.textos[key].holds.push([+a.de.toFixed(3), a.cheio == null ? null : +a.cheio.toFixed(3), +dur.toFixed(3)]);
  for (const [k, p] of Object.entries(res.colisoes)) if (p.n * passo < L.colisao_min_s) delete res.colisoes[k];
  for (const r of Object.values(res.textos)) if (r.fora && r.fora.n * passo < L.colisao_min_s) r.fora = null;
  return res;
}

let navegador = null;
export async function fecharNavegador() { if (navegador) await navegador.close(); navegador = null; }

/** Mede cada formato montado em <dir>/render/<f>/index.html. → { '9x16': { textos, colisoes }, … } */
export async function qcTelaMedir(dir, formatos, { tipo, passo = 1 / 15, limites = {} } = {}) {
  const { chromium } = await import('playwright');
  navegador ??= await chromium.launch();
  const L = { ...LIMITES, ...limites };
  const out = {};
  for (const f of formatos) {
    const file = join(dir, 'render', f, 'index.html');
    if (!existsSync(file)) throw new Error(`sem ${file}: rode produce.mjs ${dir} --build-only`);
    const [W, H] = FORMATOS[f];
    const page = await navegador.newPage({ viewport: { width: W, height: H } });
    const erros = [];
    page.on('pageerror', (e) => erros.push(String(e.message)));
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    if (erros.length) { await page.close(); throw new Error(`${f}: a composição deu erro no navegador: ${erros[0]}`); }
    out[f] = await page.evaluate(medirNaPagina, { passo, area: seguro(f, tipo), L: { colisao: L.colisao, colisao_min_s: L.colisao_min_s } });
    await page.close();
  }
  return out;
}

/** Medidas de tela → problemas (contra a base, quando houver). */
export function qcTela({ med, medBase = null, tl, tlBase = null, limites = {} }) {
  const L = { ...LIMITES, ...limites };
  const out = [];
  const tails = {};
  const cenaDe = (inst) => tl.scenes.find((s) => s.id === inst);
  for (const [f, m] of Object.entries(med)) {
    const mb = medBase?.[f];
    // leitura (o texto que entra com a voz é lido junto): na tela ≥ max(1 s; 0,3 s × palavras) desde a 1ª palavra
    // e a última palavra legível ≥ cauda_s antes de o texto sumir ou recuar
    const falta = (r) => {
      const precisa = Math.max(L.leitura_min_s, L.leitura_palavra_s * r.n);
      const ok = r.holds.filter((h) => h[1] != null).map(([de, cheio, ate]) => ({ de, cheio, ate, precisa, f: r3(Math.max(precisa - (ate - de), L.leitura_cauda_s - (ate - cheio), 0)) }));
      return ok.length ? ok.reduce((a, h) => (h.f < a.f ? h : a)) : null;
    };
    for (const [key, r] of Object.entries(m.textos)) {
      if (!r.n || !r.holds.length) continue;
      const h = falta(r);
      if (!h || h.f <= 0.05) continue;
      const { ate, precisa } = h;
      const hb = mb?.textos[key] ? falta(mb.textos[key]) : null;
      if (hb && hb.f > 0.05 && h.f <= hb.f + 0.1) continue; // a base aprovada já era assim
      const sc = cenaDe(r.inst);
      const extra = { formato: f, texto: key };
      if (sc && ate >= sc.end - 0.7) {
        const atual = sc.tail ?? 0.3, teto = (tlBase?.scenes.find((s) => s.id === sc.id)?.tail ?? atual) + L.tail_extra_max;
        const novo = r3(Math.min(teto, Math.max(tails[sc.id] ?? 0, atual + h.f + 0.05)));
        if (novo > atual) { tails[sc.id] = novo; extra.auto = { scenes: { [sc.id]: { tail: novo } } }; extra.conserto = `${sc.id}.tail ${atual} → ${novo}`; }
      } else if (sc) {
        // sai no meio da cena: quase sempre presa ao próximo evento (que segue uma palavra da fala)
        const e = (tl.events || []).filter((x) => x.scene === sc.id && Math.abs(x.t - ate) < 0.5).sort((a, b) => Math.abs(a.t - ate) - Math.abs(b.t - ate))[0];
        if (e) extra.dica = `sai junto do ${e.id}/${e.cue}${e.word ? ` (${e.word})` : ''}: fala mais lenta (vo.${e.word?.split(':')[0] ?? '?'}.rate "-10%") ou outra palavra no cue`;
      }
      out.push({ nivel: 'aviso', regra: 'leitura', cena: r.inst, msg: `${f}: "${r.txt}" fica ${r3(ate - h.de)} s na tela e a última palavra ${r3(ate - h.cheio)} s (${r.n} palavras pedem ${precisa.toFixed(1)} s e ${L.leitura_cauda_s} s; falta ${h.f} s${hb ? `; na base faltava ${hb.f} s` : ''})`, ...extra });
    }
    // área segura
    for (const [key, r] of Object.entries(m.textos)) {
      if (!r.fora) continue;
      const fb = mb?.textos[key]?.fora;
      if (fb && r.fora.px <= fb.px + 10) continue;
      out.push({ nivel: 'aviso', regra: 'area-segura', cena: r.inst, formato: f, texto: key, msg: `${f}: "${r.txt}" sai ${r.fora.px} px da área segura (${r.fora.de}–${r.fora.ate} s)` });
    }
    // texto em cima de outro elemento
    for (const [par, p] of Object.entries(m.colisoes)) {
      const pb = mb?.colisoes[par];
      if (pb && p.max <= pb.max + 0.1) continue;
      out.push({ nivel: 'aviso', regra: 'colisao', cena: p.inst, formato: f, texto: `${p.texto} × ${p.outro}`, msg: `${f}: "${m.textos[p.texto]?.txt ?? p.texto}" coberto ${Math.round(p.max * 100)}% por ${p.outro} (${p.de}–${p.ate} s)${pb ? `; na base ${Math.round(pb.max * 100)}%` : '; na base não acontece'}` });
    }
  }
  // o mesmo problema em vários formatos vira uma linha só ("4x5, 9x16: …"), com a correção mais forte
  const juntos = new Map();
  for (const p of out) {
    const k = `${p.regra}|${p.texto}`, j = juntos.get(k);
    if (!j) { juntos.set(k, { ...p, formatos: [p.formato] }); continue; }
    j.formatos.push(p.formato);
    const tail = (x) => Object.values(x.auto?.scenes || {})[0]?.tail ?? 0;
    if (p.auto && tail(p) > tail(j)) Object.assign(j, { auto: p.auto, conserto: p.conserto });
  }
  return [...juntos.values()].map(({ formatos, ...p }) => ({ ...p, formato: formatos.join(','), msg: p.msg.replace(/^[\dx]+: /, `${formatos.join(', ')}: `) }));
}

// ── relatório curto para o LLM ──────────────────────────────────────────────────────────────
/** Markdown curto (meta: ≤ 2 mil tokens) só com o que o script não resolveu: problema, falas e tempos da cena, o que responder. */
export function relatorio({ id, tl, problemas, auto = [], escolhas = {}, opcoes = {} }) {
  const resta = problemas.filter((p) => !p.auto && ['erro', 'aviso'].includes(p.nivel));
  const L = [];
  L.push(`# Sincronia · ${id}`);
  L.push(`escolhas: ${Object.entries(escolhas).map(([k, v]) => `${k}=${v}`).join(' · ')} · ${tl.duration} s · corpo em ${tl.scenes[1]?.start ?? '?'} s`);
  if (auto.length) L.push(`\nCorrigido pelo script: ${auto.join('; ')}`);
  if (!resta.length) { L.push('\nNada para o LLM.'); return L.join('\n'); }
  L.push(`\n## Falta resolver (${resta.length})`);
  resta.forEach((p, i) => L.push(`${i + 1}. [${p.nivel}] ${p.regra}${p.cena ? ` · ${p.cena}` : ''}: ${p.msg}${p.dica ? ` → ${p.dica}` : ''}`));
  const cenas = [...new Set(resta.map((p) => p.cena).filter((c) => tl.scenes.some((s) => s.id === c)))];
  for (const cid of cenas) {
    const s = tl.scenes.find((x) => x.id === cid);
    L.push(`\n### ${cid} (${s.use || s.block || ''}) ${s.start}–${s.end} s · lead ${s.lead ?? '-'} · tail ${s.tail ?? 0.3}${s.min ? ` · min ${s.min}` : ''}`);
    L.push(`on_screen: ${s.on_screen || '—'}`);
    for (const fid of s.vo || []) {
      const x = tl.vo.find((y) => y.id === fid);
      L.push(`${fid} ${x.start}–${x.end} s: ${(x.words || []).map((w) => `${w.w}@${w.s}`).join(' ')}`);
    }
    const evs = (tl.events || []).filter((e) => e.scene === cid);
    if (evs.length) L.push(`eventos: ${evs.map((e) => `${e.id}/${e.cue}@${e.t}${e.word ? `(${e.word}${e.offset ? ` ${e.offset}` : ''})` : ''}`).join(' ')}`);
  }
  const ops = Object.entries(opcoes).filter(([, o]) => o).map(([k, o]) => `${k}: ${JSON.stringify(o)}`);
  if (ops.length) L.push(`\nopções desta variante: ${ops.join(' · ')}`);
  L.push(`\n## Responda com um ajuste JSON (só desta variante)`);
  L.push('`projeto.json > ajustes["' + id + '"]` = `{ "scenes": { "<cena>": { "lead"|"tail"|"min"|"on_screen"|"params": … } }, "events": { "<evento>": { "offset"|"word"|"at": … } }, "vo": { "<fala>": { "rate": "-10%" | "say": … } } }`. Texto mais curto/diferente que valha para todas as vozes: mude a opção do eixo no projeto.json. Depois: `variantes.mjs <pasta> --so ' + id + '`.');
  return L.join('\n');
}

// ── uso avulso ──────────────────────────────────────────────────────────────────────────────
if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/sincronia.mjs')) {
  const v = video(process.argv[2]);
  const flags = process.argv.slice(3);
  const only = flags.find((f) => f.startsWith('--only='))?.split('=')[1];
  const problemas = qcTempo({ tl: v.tl, minS: minimos(v) });
  if (!flags.includes('--sem-tela')) {
    const fmts = only ? only.split(',') : (v.tl.formats || ['4x5', '9x16']).filter((f) => existsSync(join(v.dir, 'render', f, 'index.html')));
    const med = await qcTelaMedir(v.dir, fmts, { tipo: v.tl.tipo });
    await fecharNavegador();
    problemas.push(...qcTela({ med, tl: v.tl }));
  }
  for (const p of problemas) console.log(`${p.nivel === 'erro' ? '✗' : p.nivel === 'aviso' ? '⚠' : '·'} ${p.regra}${p.cena ? ` ${p.cena}` : ''}: ${p.msg}${p.conserto ? `  → ${p.conserto}` : ''}`);
  if (!problemas.length) console.log('✓ sincronia ok');
  process.exitCode = problemas.some((p) => p.nivel === 'erro') ? 1 : 0;
}
