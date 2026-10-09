#!/usr/bin/env node
// Plano de slides (049 A): confere o slides.json e desenha os wireframes.
//   node tools/carrossel/plano.mjs check <pasta>        regras mecânicas do plano (✗ bloqueia, ⚠ a autocrítica olha)
//   node tools/carrossel/plano.mjs wireframes <pasta>   <pasta>/wireframes.png: um quadro por slide, layout em blocos, no fundo do plano
//   node tools/carrossel/plano.mjs familias             lista as famílias do catálogo (references/layouts/)
// Contrato: .claude/skills/plano-de-slides/references/slides-json.md
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LAYOUTS = join(ROOT, '.claude/skills/carousel/references/layouts');
const FAMILIAS = readdirSync(LAYOUTS).filter((f) => /^\d\d-.*\.html$/.test(f)).map((f) => f.slice(3, -5));
const PAPEIS = ['gancho', 'contexto', 'tensao', 'virada', 'prova', 'sintese', 'cta'];
const FUNDOS = ['creme', 'branco', 'tom-50', 'tom-100', 'tom-200', 'tom-300', 'tom-800', 'tom-900'];
const ESCUROS = ['tom-800', 'tom-900'];
const LEVES = new Set(['capa-tipografica', 'campo', 'numero', 'citacao', 'cta']);
const [cmd, alvo] = process.argv.slice(2);

if (cmd === 'familias') { console.log(FAMILIAS.join('\n')); process.exit(0); }
if (!['check', 'wireframes'].includes(cmd) || !alvo) {
  console.log('Uso: node tools/carrossel/plano.mjs check|wireframes <pasta> | familias'); process.exit(2);
}
const pasta = resolve(alvo);
const arq = join(pasta, 'slides.json');
if (!existsSync(arq)) { console.error(`✗ não existe ${arq}`); process.exit(2); }
const plano = JSON.parse(readFileSync(arq, 'utf8'));
const S = plano.slides || [];
const n = S.length;

if (cmd === 'check') {
  const X = [], W = [];
  const palavras = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;
  if (!plano.leitura || palavras(plano.leitura) < 6) X.push('falta a "leitura" de design (1 linha: peça, público, tom, família estética)');
  if (!plano.motivo?.o_que || !plano.motivo?.evolucao) X.push('falta o motivo visual (o_que + evolucao)');
  if (!plano.autocritica?.length) W.push('sem autocrítica contra o default previsível');
  if (!n) X.push('nenhum slide');
  S.forEach((s, i) => {
    const id = `s${i + 1}`;
    if (s.n !== i + 1) W.push(`${id}: n=${s.n} fora de ordem`);
    if (!PAPEIS.includes(s.papel)) X.push(`${id}: papel "${s.papel}" (use ${PAPEIS.join('|')})`);
    if (!FAMILIAS.includes(s.familia)) X.push(`${id}: família "${s.familia}" não existe no catálogo`);
    if (!FUNDOS.includes(s.fundo)) X.push(`${id}: fundo "${s.fundo}" (use ${FUNDOS.join('|')})`);
    if (!s.heroi) X.push(`${id}: sem herói (o elemento que o olho vê primeiro)`);
    if (!s.texto?.ancora) X.push(`${id}: sem texto.ancora`);
    if (!['leve', 'media', 'densa'].includes(s.densidade)) X.push(`${id}: densidade leve|media|densa`);
    for (const c of s.camadas || []) if (!c.funcao) X.push(`${id}: camada "${c.o_que}" sem função (detalhe sem função sai)`);
    if (i < n - 1 && !s.liga?.proximo) W.push(`${id}: sem ligação com o próximo slide`);
    if (s.enfase && !['cor', 'serifa'].includes(s.enfase.tipo)) X.push(`${id}: ênfase tipo cor|serifa`);
    if (s.enfase && !s.enfase.palavra) X.push(`${id}: ênfase sem a palavra`);
    const w = palavras(s.texto?.ancora) + palavras(s.texto?.apoio);
    if (w > 35) W.push(`${id}: ${w} palavras em âncora+apoio (alvo ≤ 35)`);
    if (i === 0 && palavras(s.texto?.ancora) > 10) X.push(`s1: capa com ${palavras(s.texto?.ancora)} palavras (máx. 10)`);
    if ((s.camadas || []).some((c) => c.gradiente)) s._grad = true;
  });
  if (n > 1 && !String(S[0]?.familia).startsWith('capa')) X.push(`s1 precisa de uma família de capa (${FAMILIAS.filter((f) => f.startsWith('capa')).join(', ')})`);
  if (n >= 3 && S[n - 1]?.papel !== 'cta') W.push(`último slide não é CTA`);
  for (let i = 1; i < n; i++) if (S[i].familia === S[i - 1].familia) X.push(`s${i}–s${i + 1}: vizinhos com a mesma família (${S[i].familia})`);
  const fam = new Set(S.map((s) => s.familia)).size;
  if (n >= 8 && fam < 4) X.push(`só ${fam} famílias em ${n} slides (mín. 4)`);
  if (n >= 5 && n < 8 && fam < 3) W.push(`só ${fam} famílias em ${n} slides`);
  for (let i = 0; i + 4 <= n; i++) if (!S.slice(i, i + 4).some((s) => s.densidade === 'leve')) { X.push(`s${i + 1}–s${i + 4}: 4 slides sem respiro (densidade leve)`); break; }
  for (let i = 1; i < n; i++) if (S[i].densidade === 'densa' && S[i - 1].densidade === 'densa' && S[i + 1]?.densidade === 'densa') { W.push(`s${i}–s${i + 2}: 3 densos seguidos`); break; }
  const grad = S.filter((s) => s._grad).length;
  if (grad > 1) X.push(`gradiente em ${grad} slides (máx. 1, local)`);
  const enf = S.map((s, i) => (s.enfase ? s.enfase.tipo : s.familia === 'citacao' ? 'serifa' : null));
  for (let i = 0; i + 3 <= n; i++) { const k = enf.slice(i, i + 3).filter(Boolean).length; if (k > 1) { X.push(`ênfase em ${k} de s${i + 1}–s${i + 3} (máx. 1 a cada 3; citação conta como serifa)`); break; } }
  const seq = enf.map((t, i) => [t, i + 1]).filter(([t]) => t);
  for (let i = 1; i < seq.length; i++) if (seq[i][0] === seq[i - 1][0]) W.push(`ênfases s${seq[i - 1][1]} e s${seq[i][1]} do mesmo tipo (${seq[i][0]}): alterne cor e serifa`);
  const eb = S.filter((s) => s.texto?.rotulo).length;
  if (eb > Math.ceil(n / 3)) X.push(`rótulo/eyebrow em ${eb} slides (teto ${Math.ceil(n / 3)})`);
  for (let i = 0; i + 3 <= n; i++) if (S[i].fundo === S[i + 1].fundo && S[i + 1].fundo === S[i + 2].fundo) { W.push(`s${i + 1}–s${i + 3}: 3 fundos ${S[i].fundo} seguidos (máx. 2)`); break; }
  const esc = S.filter((s) => ESCUROS.includes(s.fundo)).length;
  if (esc > Math.ceil(n / 3)) W.push(`${esc} slides escuros (alvo ≤ 1/3)`);
  const cards = S.filter((s) => ['pilha', 'capa-objeto', 'zoom'].includes(s.familia) || (s.camadas || []).some((c) => /card/i.test(c.o_que))).length;
  if (n > 2 && cards > Math.ceil(n * 0.4)) W.push(`card em ${cards} de ${n} slides (teto ~40%)`);
  console.log(`plano ${plano.peca || ''} · ${n} slides · ${fam} famílias · leitura: ${String(plano.leitura || '—').slice(0, 90)}`);
  console.log('  ' + S.map((s, i) => `${i + 1} ${s.familia}${enf[i] ? '*' : ''} (${s.fundo})`).join(' · '));
  for (const x of X) console.log(`✗ ${x}`);
  for (const w of W) console.log(`⚠ ${w}`);
  console.log(`resumo: ${X.length} ✗ · ${W.length} ⚠`);
  process.exit(X.length ? 1 : 0);
}

// ---------- wireframes ----------
// blocos por família (coordenadas 1080×1350): [x, y, w, h, tipo]; tipo: t=título · a=apoio · r=rótulo · o=objeto/card · c=campo · n=número · l=linha
const B = {
  'capa-tipografica': [[96, 96, 300, 24, 'r'], [560, 176, 392, 136, 'o'], [632, 248, 392, 136, 'o'], [704, 320, 392, 136, 'o'], [776, 392, 392, 136, 'o'], [848, 464, 392, 136, 'o'], [96, 640, 790, 400, 't'], [96, 1090, 540, 90, 'a']],
  'capa-objeto': [[96, 96, 680, 280, 't'], [96, 410, 660, 110, 'a'], [248, 680, 960, 420, 'o']],
  split: [[0, 0, 1080, 783, 'c'], [96, 96, 240, 24, 'r'], [96, 430, 820, 290, 't'], [96, 846, 860, 120, 'a'], [96, 1090, 888, 90, 'o']],
  campo: [[96, 144, 736, 220, 'a'], [96, 860, 888, 320, 't']],
  numero: [[96, 96, 736, 150, 'a'], [96, 300, 330, 520, 'n'], [450, 600, 500, 140, 'a'], [96, 940, 888, 2, 'l'], [96, 980, 420, 150, 'a'], [564, 980, 420, 150, 'a']],
  citacao: [[96, 96, 400, 24, 'r'], [96, 430, 200, 170, 'n'], [96, 690, 888, 340, 't'], [96, 1110, 128, 2, 'l'], [96, 1140, 460, 40, 'a']],
  trilho: [[96, 96, 400, 24, 'r'], [96, 140, 888, 200, 't'], [96, 582, 888, 2, 'l'], [96, 782, 888, 2, 'l'], [96, 982, 888, 2, 'l'], [96, 1182, 888, 2, 'l'], [96, 640, 88, 88, 'o'], [248, 660, 520, 50, 't'], [96, 840, 88, 88, 'o'], [248, 860, 600, 50, 't'], [96, 1040, 88, 88, 'o'], [248, 1060, 560, 50, 't']],
  pilha: [[96, 96, 600, 150, 'a'], [96, 360, 744, 168, 'o'], [208, 500, 744, 168, 'o'], [120, 640, 744, 168, 'o'], [232, 780, 744, 168, 'o'], [144, 920, 744, 168, 'o']],
  comparacao: [[96, 96, 620, 190, 't'], [96, 470, 420, 24, 'r'], [96, 560, 400, 600, 'a'], [552, 470, 432, 710, 'o']],
  zoom: [[96, 96, 820, 100, 't'], [96, 448, 888, 424, 'o'], [326, 968, 620, 120, 'a']],
  fluxo: [[96, 96, 700, 100, 't'], [96, 210, 700, 70, 'a'], [96, 500, 296, 72, 'o'], [96, 604, 296, 72, 'o'], [96, 708, 296, 72, 'o'], [96, 812, 296, 72, 'o'], [96, 916, 296, 72, 'o'], [624, 624, 360, 240, 'o'], [96, 1080, 736, 110, 'a']],
  cta: [[96, 160, 888, 450, 't'], [96, 980, 300, 24, 'r'], [96, 1046, 888, 136, 'o']],
};
const cor = (f) => ({ creme: '#faf5f1', branco: '#ffffff', 'tom-50': '#fff4f2', 'tom-100': '#fee8e3', 'tom-200': '#fed3c9', 'tom-300': '#fdb7a7', 'tom-800': '#6c2718', 'tom-900': '#48170c' }[f] || '#faf5f1');
// lê os tons reais do brand.css da empresa, se der
try {
  const css = readFileSync(join(ROOT, 'companies', plano.empresa || 'kz', 'brand', 'brand.css'), 'utf8');
  const v = (k) => css.match(new RegExp(`--${k}:\\s*(#[0-9a-f]{3,6})`, 'i'))?.[1];
  var CORES = { creme: v('bg'), branco: v('surface'), ...Object.fromEntries(FUNDOS.filter((f) => f.startsWith('tom')).map((f) => [f, v(f.replace('tom', 'tone'))])) };
} catch { var CORES = {}; }
const fundo = (f) => CORES[f] || cor(f);
const K = 0.25;
const tile = (s, i) => {
  const esc = ESCUROS.includes(s.fundo);
  const tinta = esc ? 'rgba(255,255,255,' : 'rgba(80,80,94,';
  const blocos = (B[s.familia] || [[96, 96, 888, 1158, 'a']]).map(([x, y, w, h, t]) => {
    const st = { t: `${tinta}.55)`, a: `${tinta}.25)`, r: `${tinta}.4)`, o: esc ? 'rgba(255,255,255,.14)' : '#fff', c: fundo('tom-200'), n: `${tinta}.7)`, l: `${tinta}.35)` }[t];
    const borda = t === 'o' ? `border:1px solid ${tinta}.25);` : '';
    return `<i style="left:${x * K}px;top:${y * K}px;width:${w * K}px;height:${Math.max(1, h * K)}px;background:${st};${borda}${t === 'o' && h < 100 ? '' : ''}"></i>`;
  }).join('');
  const enf = s.enfase ? ` · ênfase ${s.enfase.tipo}: “${s.enfase.palavra}”` : '';
  return `<figure><div class="q" style="background:${fundo(s.fundo)}">${blocos}</div><figcaption><b>${String(i + 1).padStart(2, '0')} ${s.papel}</b> · ${s.familia} · ${s.fundo}${enf}<br><span>${(s.heroi || '').slice(0, 70)}</span></figcaption></figure>`;
};
const htmlW = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{background:#ecebe8;font:500 12px/1.35 system-ui,sans-serif;color:#333;padding:24px;width:${Math.min(n, 6) * 286 + 40}px}
h1{font-size:14px;margin-bottom:4px}p.l{color:#666;margin-bottom:16px;max-width:1100px}
.g{display:grid;grid-template-columns:repeat(${Math.min(n, 6)},270px);gap:20px 16px}
.q{position:relative;width:270px;height:337px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.15)}
.q i{position:absolute;border-radius:2px}figcaption{margin-top:6px}figcaption span{color:#777}
</style><h1>Wireframes · ${plano.peca || ''}</h1><p class="l">${plano.leitura || ''}<br>motivo: ${plano.motivo?.o_que || ''} → ${plano.motivo?.evolucao || ''}</p>
<div class="g">${S.map(tile).join('')}</div>`;
const { chromium } = await import('playwright');
const b = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const p = await b.newPage({ viewport: { width: 800, height: 600 } });
await p.setContent(htmlW);
const out = join(pasta, 'wireframes.png');
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log(`✓ ${out}`);
