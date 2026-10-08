#!/usr/bin/env node
// Estúdio de mockups (tarefa 028): compõe print + template + fundo e renderiza PNG em alta pelo Playwright.
// O Claude escolhe (template, parâmetros), o script compõe. Pedido explícito = 1 comando, zero imagem lida.
//
//   1 composição:   node tools/mockup/render.mjs --captura companies/kz/capturas/2026-10-07-painel-inicio \
//                     --template heroi --aparelho notebook --angulo frente --fundo liso --formato 4:5 [--transparente] [--escala 3]
//                     [--titulo "Sua agenda, *simples*"] [--subtitulo "…"] [--zoom proxima-sessao | --zoom x,y,w,h]
//                     [--destaques atalhos,proxima-sessao] [--tela2 <captura do celular>] [--recorte <regiao>] [--tema escuro]
//   alternativas:   node tools/mockup/render.mjs --captura <pasta> --alternativas 6 [--formato 4:5] [--titulo "…"] [--objetivo "…"]
//                     → N composições coerentes + folha.png (folha de contato: a IA olha só ela para escolher)
//   re-render:      node tools/mockup/render.mjs <pasta-da-peça> [--so a2,a5] [--escala 3]   (lê o mockup.json)
//   catálogo:       node tools/mockup/render.mjs --listar
//   prévias:        node tools/mockup/render.mjs --previews --captura <pasta>   (preview.png de cada template)
// Comuns: --saida <pasta da peça> (padrão companies/<slug>/contents/<hoje>-mockup-<tela>) · --webp · --substituir · --sem-folha
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve, dirname, relative, basename, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LIB = join(ROOT, 'library', 'mockups');
const FORMATOS = { '1:1': [1080, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920], '16:9': [1920, 1080] };
const t0 = Date.now();

// ---------- argumentos ----------
const BOOL = ['sem-corte', 'transparente', 'webp', 'listar', 'previews', 'substituir', 'sem-folha', 'reflexo', 'sem-reflexo', 'galeria', 'sem-grao', 'generico'];
const PARAMS_GLOBAIS = ['aparelho', 'angulo', 'tema', 'ampliacao', 'sombra', 'cantos', 'cor', 'orientacao', 'ajuste', 'chips', 'bolinhas', 'aparelho2', 'aparelho3'];
const argv = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) { pos.push(a); continue; }
  const k = a.slice(2);
  if (BOOL.includes(k)) opt[k] = true; else opt[k] = argv[++i];
}
const fail = (msg) => { console.error('✗ ' + msg); process.exit(1); };
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const writeJson = (f, v) => writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
const rel = (p) => relative(ROOT, p).split(sep).join('/');
const hoje = () => new Date().toLocaleDateString('sv-SE');
const templates = () => readdirSync(join(LIB, 'templates')).filter((d) => existsSync(join(LIB, 'templates', d, 'meta.json'))).map((d) => readJson(join(LIB, 'templates', d, 'meta.json')));

// ---------- catálogo ----------
if (opt.listar) {
  const cat = readJson(join(LIB, 'catalogo.json'));
  console.log('TEMPLATES (--template)');
  for (const t of templates()) console.log(`  ${t.id.padEnd(10)} ${t.descricao}${t.precisa.length ? `  [precisa: ${t.precisa.join(', ')}]` : ''}`);
  console.log('APARELHOS (--aparelho): apelidos e desenhos');
  for (const a of cat.aparelhos) console.log(`  ${a.id.padEnd(14)} ${a.descricao} · ângulos: ${a.angulos.join(', ')}`);
  console.log('APARELHOS REAIS (--aparelho <id> --cor <cor> --orientacao <o>)');
  for (const a of Object.values(aparelhosCfg())) console.log(`  ${a.id.padEnd(20)} ${a.tipo.padEnd(9)} ${Object.keys(a.variantes).join('/')} · cores: ${a.cores.map((c) => c.id).join(', ')}`);
  console.log('FUNDOS (--fundo)  marca = tokens do brand.css · premium = paleta própria (a marca libera em brand/mockups.json)');
  for (const f of cat.fundos) console.log(`  ${f.id.padEnd(14)} ${f.marca ? 'marca  ' : 'premium'} ${f.descricao}`);
  console.log('SOMBRAS (--sombra)  ' + Object.keys(cat.sombras).join(' · '));
  console.log('CANTOS (--cantos)   ' + Object.keys(cat.cantos).join(' · '));
  console.log('ÂNGULOS (--angulo)  ' + Object.keys(cat.angulos).join(' · '));
  console.log('AJUSTE (--ajuste)   ' + Object.keys(cat.ajustes).join(' · ') + '   · RECORTE: --recorte auto (sugestão do analisar.mjs) | <regiao> | x,y,w,h · --sem-corte');
  console.log('FORMATOS (--formato)  ' + Object.keys(cat.formatos).join(' · ') + ' · escala padrão 3');
  process.exit(0);
}

// ---------- capturas e regiões ----------
/** pasta da captura (relativa à raiz ou a companies/<slug>/) → { slug, rel (relativa a companies/<slug>), dir, cap } */
function loadCaptura(p, slug) {
  let dir = resolve(ROOT, p);
  if (!existsSync(join(dir, 'captura.json')) && slug) dir = resolve(ROOT, 'companies', slug, p);
  if (!existsSync(join(dir, 'captura.json'))) fail(`captura não encontrada: ${p} (registre com tools/mockup/captura.mjs)`);
  const parts = rel(dir).split('/');
  // telas de exemplo da biblioteca (galeria): caminho a partir da raiz, marca neutra (ou --empresa)
  if (parts[0] === 'library') return { slug: slug ?? opt.empresa ?? null, rel: rel(dir), dir, nome: basename(dir), cap: readJson(join(dir, 'captura.json')) };
  if (parts[0] !== 'companies') fail('a captura precisa estar em companies/<slug>/capturas/ (ou library/mockups/exemplos/)');
  return { slug: parts[1], rel: parts.slice(2).join('/'), dir, nome: basename(dir), cap: readJson(join(dir, 'captura.json')) };
}
const parseRef = (s) => (s && /^[\d.]+(,[\d.]+){3}$/.test(s) ? Object.fromEntries(s.split(',').map((v, i) => ['xywh'[i], Number(v)])) : s);
/** região nomeada ou coordenadas (fração 0–1 ou px) → px da imagem original */
function regiao(ref, c) {
  if (ref == null) return undefined;
  let r = ref;
  if (ref === 'auto') { // recorte sugerido pelo tools/mockup/analisar.mjs (bordas, barra do navegador/sistema, elemento cortado)
    r = c.cap.sugestoes?.recorte;
    if (!r) fail(`${c.rel}: sem recorte sugerido — rode node tools/mockup/analisar.mjs ${c.rel.startsWith('library') ? c.rel : 'companies/' + c.slug + '/' + c.rel}`);
  } else if (typeof ref === 'string') {
    r = c.cap.regioes?.[ref];
    if (!r) fail(`região "${ref}" não existe em ${c.rel}/captura.json (tem: ${Object.keys(c.cap.regioes || {}).join(', ') || 'nenhuma'})`);
  }
  const frac = [r.x, r.y, r.w, r.h].every((v) => v <= 1);
  const W = c.cap.largura, H = c.cap.altura;
  const out = frac ? { x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H } : { x: r.x, y: r.y, w: r.w, h: r.h };
  if (r.rotulo) out.rotulo = r.rotulo;
  return out;
}

// ---------- molduras realistas (calibradas por tools/mockup/aparelhos.mjs) ----------
var _aps; // var: --listar usa antes da linha
/** aparelho.json de cada moldura com imagens presentes + base file:// + máscara inline (data URL: mask-image não carrega file:// cruzado) */
function aparelhosCfg() {
  if (_aps) return _aps;
  _aps = {};
  const dir = join(LIB, 'aparelhos');
  if (!existsSync(dir)) return _aps;
  let faltando = 0;
  for (const d of readdirSync(dir)) {
    const f = join(dir, d, 'aparelho.json');
    if (!existsSync(f)) continue;
    const a = readJson(f);
    const vs = Object.values(a.variantes);
    if (!vs.every((v) => existsSync(join(dir, d, v.mascara)) && Object.values(v.arquivos).some((x) => existsSync(join(dir, d, x))))) { faltando++; continue; }
    for (const v of vs) {
      v.mascaraUrl = 'data:image/png;base64,' + readFileSync(join(dir, d, v.mascara)).toString('base64');
      for (const [c, x] of Object.entries(v.arquivos)) if (!existsSync(join(dir, d, x))) delete v.arquivos[c];
    }
    a.base = pathToFileURL(join(dir, d)).href + '/';
    _aps[a.id] = a;
  }
  if (faltando) console.log(`  ⚠ ${faltando} moldura(s) realista(s) sem imagem: node tools/mockup/aparelhos.mjs baixar && node tools/mockup/aparelhos.mjs preparar (até lá, celular/notebook saem genéricos)`);
  return _aps;
}

// ---------- composição → configuração do runtime ----------
function montarCfg(comp, slug) {
  const telas = {}, caps = {};
  for (const [slot, s] of Object.entries(comp.telas)) {
    const c = (caps[slot] = loadCaptura(s.captura, slug));
    let endereco;
    try { endereco = c.cap.url ? new URL(c.cap.url).host : undefined; } catch { /* url inválida: sem endereço */ }
    telas[slot] = {
      src: pathToFileURL(join(c.dir, c.cap.arquivo || 'original.png')).href,
      recorte: regiao(s.recorte ?? (comp.params?.semCorte || opt['sem-corte'] ? undefined : c.cap.sugestoes?.recorteSeguro), c), ocultar: (c.cap.ocultar || []).map((o) => regiao(o, c)),
      aparelho: c.cap.aparelho, dpr: c.cap.dpr || 1, url: endereco,
    };
  }
  const base = caps.tela ?? Object.values(caps)[0];
  const zoom = regiao(comp.zoom, base);
  const destaques = (comp.destaques || []).map((d) => ({ ...regiao(d.regiao, base), ...(d.rotulo ? { rotulo: d.rotulo } : {}) }));
  let [W, H] = FORMATOS[comp.formato] ?? [0, 0];
  if (comp.formato === 'livre') {
    const r = zoom ?? telas.tela.recorte ?? { w: base.cap.largura, h: base.cap.altura };
    const s = Math.min(1, 1600 / r.w, 1600 / r.h);
    W = Math.round(r.w * s + 192); H = Math.round(r.h * s + 192);
  }
  if (!W) fail(`formato inválido: ${comp.formato}`);
  return {
    cfg: {
      brandCss: pathToFileURL(slug ? join(ROOT, 'companies', slug, 'brand', 'brand.css') : join(LIB, 'runtime', 'neutro.css')).href,
      aparelhos: aparelhosCfg(),
      largura: W, altura: H, formato: comp.formato, fundo: comp.fundo, transparente: !!comp.transparente,
      params: comp.params || {}, textos: comp.textos || {}, telas, destaques, zoom: zoom ?? null,
    },
    caps,
  };
}

// ---------- gerador de alternativas (determinístico, sem IA) ----------
function alternativas(c, n, base) {
  const prefs = existsSync(join(ROOT, 'companies', c.slug, 'brand', 'mockups.json')) ? readJson(join(ROOT, 'companies', c.slug, 'brand', 'mockups.json')) : null;
  const fundos = (prefs?.fundos ?? ['liso', 'gradiente', 'malha', 'brilho', 'desfoque', 'grade', 'pontos']).filter((f) => f !== 'transparente');
  const comRotulo = Object.entries(c.cap.regioes || {}).filter(([, r]) => r.rotulo).map(([k]) => k);
  const tela = { tela: { captura: c.rel } };
  const desk = c.cap.aparelho !== 'celular';
  const cand = desk ? [
    { template: 'heroi', params: { aparelho: 'notebook' } },
    { template: 'heroi', params: { aparelho: 'navegador', angulo: 'esquerda' } },
    { template: 'perspectiva', params: { aparelho: 'vidro' } },
    comRotulo.length && { template: 'zoom', params: { aparelho: 'navegador' }, zoom: comRotulo[0] },
    comRotulo.length >= 2 && { template: 'cards', params: { aparelho: 'navegador' }, destaques: comRotulo.slice(0, base.formato === '16:9' ? 3 : 2).map((r) => ({ regiao: r })) },
    comRotulo.length && { template: 'anotacoes', params: { aparelho: 'navegador' }, destaques: comRotulo.slice(0, 3).map((r) => ({ regiao: r })) },
    { template: 'heroi', params: { aparelho: 'imac' } },
    { template: 'heroi', params: { aparelho: 'sem-moldura', cantos: 'grande', sombra: 'flutuante' } },
    { template: 'heroi', params: { aparelho: 'sem-moldura', angulo: 'isometrico' } },
    { template: 'recorte', transparente: true, formato: 'livre', params: { cantos: 'grande' } },
  ] : [
    { template: 'heroi', params: { aparelho: 'celular' } },
    { template: 'perspectiva', params: { aparelho: 'celular' } },
    { template: 'heroi', params: { aparelho: 'celular', angulo: 'esquerda', cor: 'black' } },
    comRotulo.length && { template: 'zoom', params: { aparelho: 'celular' }, zoom: comRotulo[0] },
    comRotulo.length >= 2 && { template: 'cards', params: { aparelho: 'celular' }, destaques: comRotulo.slice(0, 2).map((r) => ({ regiao: r })) },
    comRotulo.length && { template: 'anotacoes', params: { aparelho: 'celular' }, destaques: comRotulo.slice(0, 3).map((r) => ({ regiao: r })) },
    { template: 'heroi', params: { aparelho: 'android' } },
    { template: 'recorte', transparente: true, formato: 'livre', params: { cantos: 'ios' } },
  ].filter(Boolean);
  let fi = 0;
  return cand.slice(0, n).map((k, i) => {
    const transparente = !!(k.transparente || base.transparente);
    return {
      id: `a${i + 1}`, template: k.template, formato: k.formato ?? base.formato, fundo: transparente ? 'liso' : fundos[fi++ % fundos.length],
      transparente, params: k.params ?? {}, telas: tela,
      textos: k.template === 'recorte' ? {} : base.textos, ...(k.zoom ? { zoom: k.zoom } : {}), destaques: k.destaques ?? [],
    };
  });
}

// ---------- composição a partir das flags ----------
function composicaoDasFlags(c) {
  const template = opt.template ?? 'heroi';
  if (!existsSync(join(LIB, 'templates', template, 'template.html'))) fail(`template "${template}" não existe (node tools/mockup/render.mjs --listar)`);
  const params = {};
  for (const k of PARAMS_GLOBAIS) if (opt[k] != null) params[k] = k === 'ampliacao' ? Number(opt[k]) : opt[k];
  if (opt['sem-reflexo']) params.reflexo = false;
  if (opt['sem-grao']) params.grao = false;
  if (opt.generico) params.realista = false;
  const telas = { tela: { captura: c.rel, ...(opt.recorte ? { recorte: parseRef(opt.recorte) } : {}) } };
  if (opt.tela2) telas.tela2 = { captura: loadCaptura(opt.tela2, c.slug).rel };
  if (opt.tela3) telas.tela3 = { captura: loadCaptura(opt.tela3, c.slug).rel };
  return {
    id: opt.id ?? [template, params.aparelho, params.angulo, (opt.formato ?? '4:5').replace(':', 'x')].filter(Boolean).join('-'),
    template, formato: opt.formato ?? '4:5', fundo: opt.fundo ?? 'liso', transparente: !!opt.transparente, params, telas,
    textos: textosDasFlags(), ...(opt.zoom ? { zoom: parseRef(opt.zoom) } : {}),
    destaques: (opt.destaques ?? '').split(',').filter(Boolean).map((r) => ({ regiao: parseRef(r) })),
  };
}
function textosDasFlags() { const t = {}; if (opt.titulo) t.titulo = opt.titulo; if (opt.subtitulo) t.subtitulo = opt.subtitulo; return t; }

// ---------- navegador ----------
async function abrirNavegador() {
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch { fail('Playwright não instalado: npm install && npx playwright install chromium'); }
  const args = ['--allow-file-access-from-files'];
  try { return await chromium.launch({ args }); } catch (e1) {
    try { return await chromium.launch({ channel: 'chrome', args }); } catch { fail('não consegui abrir o Chromium: npx playwright install chromium\n' + e1.message); }
  }
}
async function renderizar(browser, comp, slug, escala, destino) {
  const tpl = join(LIB, 'templates', comp.template, 'template.html');
  if (!existsSync(tpl)) return { erro: `template "${comp.template}" não existe` };
  const { cfg } = montarCfg(comp, slug);
  const ctx = await browser.newContext({ viewport: { width: cfg.largura, height: cfg.altura }, deviceScaleFactor: escala });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  try {
    await page.addInitScript((c) => { window.MOCKUP = c; }, cfg);
    await page.goto(pathToFileURL(tpl).href);
    await page.waitForFunction(() => window.MK_PRONTO, null, { timeout: 30000 });
    const r = await page.evaluate(() => window.MK_PRONTO);
    if (!r.ok) return { erro: r.erro.split('\n')[0], qa: r.qa };
    mkdirSync(dirname(destino), { recursive: true });
    await page.locator('#palco').screenshot({ path: destino, omitBackground: cfg.transparente });
    return { qa: [...r.qa, ...erros], largura: cfg.largura * escala, altura: cfg.altura * escala };
  } catch (e) {
    return { erro: (erros[0] ?? e.message).split('\n')[0] };
  } finally { await ctx.close(); }
}
function paraWebp(png, transparente) {
  const out = png.replace(/\.png$/, '.webp');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', '92', ...(transparente ? ['-pix_fmt', 'yuva420p'] : []), out]);
    return out;
  } catch (e) { console.log(`  ⚠ webp falhou (${e.message.split('\n')[0]})`); return null; }
}

/** folha de contato: miniaturas lado a lado com o id, o template e os avisos — a IA olha só esta imagem para escolher */
async function folhaDeContato(browser, itens, titulo, destino) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cards = itens.map((it) => `<figure><div class="img${it.comp.transparente ? ' xadrez' : ''}">${it.arquivo ? `<img src="${pathToFileURL(it.arquivo).href}">` : `<p class="erro">${esc(it.erro)}</p>`}</div>
    <figcaption><b>${esc(it.comp.id)}</b> · ${esc(it.comp.template)}${it.comp.params?.aparelho ? ' · ' + esc(it.comp.params.aparelho) : ''}${it.comp.params?.angulo ? ' ' + esc(it.comp.params.angulo) : ''} · ${it.comp.transparente ? 'transparente' : esc(it.comp.fundo)} · ${esc(it.comp.formato)}
    ${(it.qa || []).map((q) => `<br><span class="aviso">⚠ ${esc(q)}</span>`).join('')}</figcaption></figure>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:28px;background:#f4f4f5;font:15px/1.4 system-ui,sans-serif;color:#222;width:1544px;box-sizing:border-box}
    h1{font-size:20px;margin:0 0 18px}.grade{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
    figure{margin:0;background:#fff;border-radius:12px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .img{height:420px;display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden;background:#fafafa}
    .xadrez{background:repeating-conic-gradient(#e7e7ea 0 25%,#fff 0 50%) 0 0/20px 20px}
    img{max-width:100%;max-height:100%;object-fit:contain}figcaption{margin-top:8px}.aviso{color:#b45309;font-size:13px}.erro{color:#b91c1c;padding:12px}
    </style><h1>${esc(titulo)}</h1><div class="grade">${cards}</div>`;
  const tmp = join(tmpdir(), `folha-${process.pid}.html`);
  writeFileSync(tmp, html);
  const ctx = await browser.newContext({ viewport: { width: 1544, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => null))));
  await page.screenshot({ path: destino, fullPage: true });
  await ctx.close();
  rmSync(tmp, { force: true });
}

// ---------- prévias dos templates ----------
if (opt.previews) {
  if (!opt.captura) fail('--previews precisa de --captura (um print para ilustrar)');
  const c = loadCaptura(opt.captura);
  const regs = Object.entries(c.cap.regioes || {}).filter(([, r]) => r.rotulo).map(([k]) => k);
  const browser = await abrirNavegador();
  for (const t of templates()) {
    const comp = { id: 'preview', template: t.id, formato: '4:5', fundo: 'liso', transparente: false, params: {}, telas: { tela: { captura: c.rel } }, textos: t.id === 'recorte' ? {} : { titulo: 'Título da *peça*' }, zoom: regs[0], destaques: regs.slice(0, 3).map((r) => ({ regiao: r })) };
    if (t.precisa.includes('tela2')) { // sem print de celular: faixa vertical do desktop a partir da 1ª região, na proporção do celular
      const r = regiao(regs[0] ?? { x: 0, y: 0, w: 0.3, h: 1 }, c);
      comp.telas.tela2 = { captura: c.rel, recorte: { x: r.x, y: r.y, w: r.w, h: Math.min(c.cap.altura - r.y, r.w / 0.46) } };
    }
    const r = await renderizar(browser, comp, c.slug, 0.5, join(LIB, 'templates', t.id, 'preview.png'));
    console.log(r.erro ? `✗ ${t.id}: ${r.erro}` : `✓ templates/${t.id}/preview.png`);
  }
  await browser.close();
  process.exit(0);
}

// ---------- montar o pedido ----------
let pasta, mockup, slug, so = null;
const pecaDir = pos[0] && existsSync(join(resolve(ROOT, pos[0]), 'mockup.json')) ? resolve(ROOT, pos[0]) : null;
if (pecaDir) {
  pasta = pecaDir;
  mockup = readJson(join(pasta, 'mockup.json'));
  slug = mockup.empresa;
  if (opt.escala) mockup.escala = Number(opt.escala);
  if (opt.so) so = opt.so.split(',');
} else {
  if (!opt.captura) fail('informe --captura <pasta> (ou a pasta de uma peça com mockup.json). Ajuda: cabeçalho deste arquivo.');
  const c = loadCaptura(opt.captura);
  slug = c.slug;
  pasta = resolve(ROOT, opt.saida ?? join('companies', slug, 'contents', `${hoje()}-mockup-${c.nome.replace(/^\d{4}-\d{2}-\d{2}-/, '')}`));
  if (existsSync(join(pasta, 'mockup.json')) && !opt.substituir) fail(`${rel(pasta)} já tem mockup.json: re-renderize com "node tools/mockup/render.mjs ${rel(pasta)}", ou use --substituir / outra --saida`);
  const base = { formato: opt.formato ?? '4:5', transparente: !!opt.transparente, textos: textosDasFlags() };
  const composicoes = opt.alternativas ? alternativas(c, Math.max(1, Math.min(9, Number(opt.alternativas))), base) : [composicaoDasFlags(c)];
  mockup = { empresa: slug, ...(opt.objetivo ? { objetivo: opt.objetivo } : {}), escala: Number(opt.escala ?? 3), composicoes, escolhidas: [] };
}

// ---------- renderizar ----------
const escala = mockup.escala ?? 3;
const browser = await abrirNavegador();
const itens = [];
const capsUsadas = new Map();
mkdirSync(join(pasta, 'png'), { recursive: true });
for (const comp of mockup.composicoes) {
  if (so && !so.includes(comp.id)) continue;
  for (const s of Object.values(comp.telas)) { const c = loadCaptura(s.captura, slug); capsUsadas.set(c.rel, c); }
  const arq = join(pasta, 'png', `${comp.id}.png`);
  const r = await renderizar(browser, comp, slug, escala, arq);
  if (r.erro) { console.log(`✗ ${comp.id} (${comp.template}): ${r.erro}`); itens.push({ comp, erro: r.erro, qa: r.qa }); continue; }
  comp.arquivo = `png/${comp.id}.png`;
  console.log(`✓ ${rel(arq)}  ${r.largura}×${r.altura} · ${comp.template}${comp.params?.aparelho ? ' ' + comp.params.aparelho : ''}${comp.params?.angulo ? ' ' + comp.params.angulo : ''} · ${comp.transparente ? 'transparente' : comp.fundo}`);
  for (const q of r.qa) console.log(`  ⚠ ${q}`);
  if (opt.webp) { const w = paraWebp(arq, comp.transparente); if (w) console.log(`  + ${rel(w)}`); }
  itens.push({ comp, arquivo: arq, qa: r.qa });
}
writeJson(join(pasta, 'mockup.json'), mockup);

// dados reais: a peça sai marcada até o Oliver confirmar que só há dados fictícios (ou borrados)
const reais = [...capsUsadas.values()].filter((c) => !c.cap.dadosFicticios);
const fichaF = join(pasta, 'peca.json');
const ficha = existsSync(fichaF) ? readJson(fichaF) : { title: `Mockup · ${[...capsUsadas.values()][0]?.nome.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ') ?? 'tela'}`, tags: [], notes: {} };
ficha.kind = 'mockup';
ficha.tags = [...new Set([...(ficha.tags || []), 'mockup', ...(reais.length ? ['nao-publicar'] : [])])];
ficha.updatedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
writeJson(fichaF, ficha);

if (itens.length > 1 && !opt['sem-folha']) {
  const folha = join(pasta, 'folha.png');
  await folhaDeContato(browser, itens, `${rel(pasta)} · ${itens.length} alternativas${reais.length ? ' · NÃO PUBLICAR (dados reais na captura)' : ''}`, folha);
  console.log(`▦ folha de contato: ${rel(folha)}`);
}
await browser.close();
if (reais.length) console.log(`⚠ ${reais.map((c) => c.rel).join(', ')}: dadosFicticios = false → peça marcada "nao-publicar"${reais.some((c) => !(c.cap.ocultar || []).length) ? ' (e sem áreas ocultas!)' : ' (áreas em "ocultar" saem borradas)'}`);
const ok = itens.filter((i) => i.arquivo).length;
console.log(`${ok}/${itens.length} imagem(ns) em ${((Date.now() - t0) / 1000).toFixed(1)} s → ${rel(pasta)}`);
if (ok < itens.length) process.exitCode = 1;
