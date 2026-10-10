#!/usr/bin/env node
// Renderiza um relatorio.json (skill relatorio-pdf) na marca da empresa: 1 PNG por página (1080×1350) + PDF.
// node tools/relatorio/render.mjs <pasta-do-relatorio> [--so-pdf]
// Listas longas (ranking, matriz, tabela, conteudos, cards) quebram sozinhas em páginas que cabem; nada é cortado.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pasta = resolve(process.argv[2] || '');
const relPath = join(pasta, 'relatorio.json');
if (!process.argv[2] || !existsSync(relPath)) { console.error('uso: node tools/relatorio/render.mjs <pasta com relatorio.json>'); process.exit(1); }
const rel = JSON.parse(readFileSync(relPath, 'utf8'));
const brandCss = join(ROOT, 'companies', rel.empresa, 'brand', 'brand.css');
if (!existsSync(brandCss)) { console.error(`sem brand.css para ${rel.empresa}: rode npm run brand -- ${rel.empresa}`); process.exit(1); }
const W = 1080, H = 1350;

// ---------- texto ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// **negrito** e *destaque* (itálico na cor da marca)
const md = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const num = (n) => (n == null ? '—' : Number(n).toLocaleString('pt-BR'));
const img = (p) => { if (!p) return ''; const a = isAbsolute(p) ? p : join(pasta, p); return existsSync(a) ? pathToFileURL(a).href : ''; };
const ST = { sim: ['Tem', 's'], parcial: ['Em parte', 'p'], nao: ['Não tem', 'n'], desconhecido: ['A confirmar', 'u'], '?': ['A confirmar', 'u'] };

const css = `
@import url("${pathToFileURL(brandCss).href}");
:root{--r-bg:var(--bg,#faf7f4);--r-surface:var(--surface,#fff);--r-text:var(--text,#3a3a44);--r-ink:var(--ink,var(--text,#222));--r-muted:var(--muted,#666);
--r-border:var(--border,#e8e2dc);--r-primary:var(--primary,#e0603f);--r-soft:var(--accent-soft,#fde3db);--r-ok:var(--pastel-sage,#d6e8d7);--r-mid:var(--pastel-butter,#f3eacb);
--r-head:var(--font-accent,var(--font-heading,Georgia,serif));--r-body:var(--font-body,system-ui,sans-serif)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:var(--r-bg);font-family:var(--r-body);color:var(--r-text);padding:64px 64px 48px;display:flex;flex-direction:column}
#c{display:flex;flex-direction:column;flex:1;min-height:0}
.k{font-size:18px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--r-muted);display:flex;justify-content:space-between;gap:20px}
h1{font-family:var(--r-head);font-weight:500;font-size:64px;line-height:1.04;color:var(--r-text);margin:16px 0 14px}
h1 em,.capa h1 em{color:var(--r-primary);font-style:italic}
h1 .pg{font-size:32px;color:var(--r-muted);font-style:normal}
.sub{font-size:22px;line-height:1.4;color:var(--r-muted);margin:-2px 0 22px;max-width:920px}
b{color:var(--r-ink)} em{font-style:italic;color:var(--r-primary)}
.card{background:var(--r-surface);border:1px solid var(--r-border);border-radius:20px;padding:20px 24px;margin-bottom:14px}
.card h2,.lb{font-size:15px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--r-muted);margin-bottom:10px}
ul.b{list-style:none;display:flex;flex-direction:column;gap:9px}
ul.b li{font-size:21px;line-height:1.4;padding-left:18px;position:relative}
ul.b li:before{content:"";position:absolute;left:0;top:11px;width:7px;height:7px;border-radius:50%;background:var(--r-border)}
.sug{border:2px solid var(--r-primary)}
.sug h2{color:var(--r-primary)}
ol.n{list-style:none;display:flex;flex-direction:column;gap:11px;counter-reset:n}
ol.n li{font-size:21px;line-height:1.4;color:var(--r-ink);padding-left:42px;position:relative}
ol.n li:before{counter-increment:n;content:counter(n);position:absolute;left:0;top:1px;width:28px;height:28px;border-radius:50%;background:var(--r-primary);color:var(--r-ink);font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center}
.pill{display:inline-block;font-size:15px;font-weight:800;border-radius:999px;padding:3px 11px;color:var(--r-ink);white-space:nowrap}
.pill.s{background:var(--r-ok)}.pill.p{background:var(--r-mid)}.pill.n{background:var(--r-soft)}.pill.u{background:var(--r-border)}
.dots{display:flex;gap:4px;flex-wrap:wrap}.d{width:12px;height:12px;border-radius:50%;background:var(--r-border)}
.d.s{background:var(--r-primary)}.d.p{background:var(--r-soft);box-shadow:inset 0 0 0 2px var(--r-primary)}
.fill{flex:1}
.foot{display:flex;justify-content:space-between;gap:24px;font-size:15px;color:var(--r-muted);margin-top:18px;align-items:flex-end}
.lg{display:flex;gap:16px;align-items:center;white-space:nowrap}.lg span{display:flex;gap:6px;align-items:center}
/* capa */
.capa h1{font-size:88px;margin-top:120px}
.meta{display:grid;grid-template-columns:200px 1fr;gap:10px 20px;font-size:20px}
.meta div:nth-child(odd){font-weight:800;color:var(--r-muted);text-transform:uppercase;letter-spacing:.08em;font-size:15px;padding-top:4px}
/* ranking */
.row{background:var(--r-surface);border:1px solid var(--r-border);border-radius:18px;padding:13px 22px;display:grid;grid-template-columns:54px 1fr 190px;gap:16px;align-items:center;margin-bottom:10px}
.row .i{font-family:var(--r-head);font-size:38px;color:var(--r-primary);text-align:center}
.row .g{font-size:14px;font-weight:700;color:var(--r-muted);text-transform:uppercase;letter-spacing:.08em}
.row .t{font-size:23px;font-weight:700;color:var(--r-ink);line-height:1.2;margin:2px 0}
.row .w{font-size:16px;color:var(--r-muted);line-height:1.35}
.row .nt{display:inline-block;font-size:14px;font-weight:700;background:var(--r-soft);color:var(--r-ink);border-radius:999px;padding:3px 10px;margin-top:6px}
.row .c{text-align:right}.row .c .dots{justify-content:flex-end;margin-top:6px}
.big{font-size:30px;font-weight:800;color:var(--r-ink)}.big small{font-size:17px;font-weight:600;color:var(--r-muted)}
/* tabela e matriz */
table{width:100%;border-collapse:separate;border-spacing:0;background:var(--r-surface);border:1px solid var(--r-border);border-radius:18px;overflow:hidden;font-size:18px}
th{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--r-muted);text-align:left;padding:12px 12px;border-bottom:1px solid var(--r-border);vertical-align:bottom}
td{padding:10px 12px;border-bottom:1px solid var(--r-border);vertical-align:top;line-height:1.35}
tr:last-child td{border-bottom:0}
td.num,th.num{text-align:right;white-space:nowrap}
tr.grp td{background:var(--r-bg);font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--r-muted);padding:7px 12px}
.mx td.v,.mx th.v{text-align:center;padding:9px 4px;width:96px}
.mx th.v{writing-mode:vertical-rl;transform:rotate(180deg);height:150px;text-align:left;padding:10px 0;vertical-align:middle}
.mx th.nos,.mx td.nos{background:var(--r-soft)}
.mk{display:inline-block;width:20px;height:20px;border-radius:50%;vertical-align:middle}
.mk.s{background:var(--r-primary)}.mk.p{background:var(--r-surface);box-shadow:inset 0 0 0 3px var(--r-primary)}.mk.n{background:var(--r-border);width:10px;height:10px}.mk.u{background:none;width:auto;height:auto;color:var(--r-muted);font-weight:800}
/* secao */
.stats{display:flex;gap:14px;margin-bottom:14px}
.st{background:var(--r-surface);border:1px solid var(--r-border);border-radius:18px;padding:14px 20px;flex:1}
.track{position:relative;height:8px;border-radius:9px;background:var(--r-border);margin:14px 0 6px}
.track i{position:absolute;top:-5px;width:18px;height:18px;border-radius:50%;background:var(--r-primary);transform:translateX(-50%);box-shadow:0 0 0 4px var(--r-surface)}
.ends{display:flex;justify-content:space-between;font-size:13px;color:var(--r-muted)}
/* conteudos */
.ct{background:var(--r-surface);border:1px solid var(--r-border);border-radius:18px;padding:14px;display:grid;grid-template-columns:150px 1fr;gap:18px;margin-bottom:12px}
.ct .th{width:150px;height:188px;border-radius:12px;background:var(--r-border) center/cover no-repeat}
.ct .h{display:flex;justify-content:space-between;gap:10px;font-size:15px;font-weight:700;color:var(--r-muted);text-transform:uppercase;letter-spacing:.06em}
.ct .lg2{font-size:19px;color:var(--r-ink);font-weight:600;line-height:1.35;margin:6px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ct .m{font-size:17px;color:var(--r-text)}.ct .m b{font-size:19px}
.ct .o{font-size:18px;line-height:1.4;color:var(--r-text);margin-top:7px;border-left:4px solid var(--r-primary);padding-left:12px}
/* cards */
.cd .t{font-size:23px;font-weight:700;color:var(--r-ink);margin-bottom:8px;line-height:1.25}
.cd .x{font-size:20px;line-height:1.42;border-left:4px solid var(--r-primary);padding-left:14px}
`;

const legendaRank = `<div class="lg"><span><i class="d s"></i> tem</span><span><i class="d p"></i> tem em parte</span><span><i class="d"></i> não tem ou não vimos</span></div>`;
const mk = (v) => { const [l, c] = ST[v] || ST['?']; return c === 'u' ? '<span class="mk u">?</span>' : `<span class="mk ${c}" title="${l}"></span>`; };

// cada tipo: corpo(pagina, itens, offset) · lista = chave da lista que pode quebrar
const TIPOS = {
  capa: { corpo: (p) => `<div class="capa"><h1>${md(p.titulo)}</h1>${p.subtitulo ? `<div class="sub" style="font-size:26px">${md(p.subtitulo)}</div>` : ''}</div>
    ${p.pontos?.length ? `<div class="card sug"><h2>${esc(p.pontosTitulo || 'Em resumo')}</h2><ol class="n">${p.pontos.map((t) => `<li>${md(t)}</li>`).join('')}</ol></div>` : ''}
    ${p.meta?.length ? `<div class="card"><div class="meta">${p.meta.map(([a, b]) => `<div>${esc(a)}</div><div>${md(b)}</div>`).join('')}</div></div>` : ''}` },
  ranking: { lista: 'itens', legenda: legendaRank, corpo: (p, it, off) => it.map((r, i) => {
      const total = p.total || r.total;
      const tem = r.tem || [], par = r.parcial || [];
      return `<div class="row"><div class="i">${off + i + 1}</div><div>${r.grupo ? `<div class="g">${esc(r.grupo)}</div>` : ''}<div class="t">${md(r.nome)}</div>
      <div class="w">${esc([...tem, ...par.map((x) => x + ' (em parte)')].join(' · '))}</div>${r.nota ? `<span class="nt">${md(r.nota)}</span>` : ''}</div>
      <div class="c"><div class="big">${tem.length}<small> de ${total}</small></div>${par.length ? `<div class="w">+${par.length} em parte</div>` : ''}
      <div class="dots">${Array.from({ length: total }, (_, k) => `<i class="d ${k < tem.length ? 's' : k < tem.length + par.length ? 'p' : ''}"></i>`).join('')}</div></div></div>`;
    }).join('') },
  matriz: { lista: 'linhas', legenda: `<div class="lg"><span><i class="mk s"></i> tem</span><span><i class="mk p"></i> em parte</span><span><i class="mk n"></i> não tem</span><span><b>?</b> a confirmar</span></div>`,
    corpo: (p, it) => { const nos = p.colunaNos ?? 0;
      let grp = null;
      return `<table class="mx"><tr><th>${esc(p.cabecalho || 'Funcionalidade')}</th>${p.colunas.map((c, j) => `<th class="v${j === nos ? ' nos' : ''}">${esc(c)}</th>`).join('')}</tr>
      ${it.map((l) => { const g = l.grupo && l.grupo !== grp ? `<tr class="grp"><td colspan="${p.colunas.length + 1}">${esc((grp = l.grupo))}</td></tr>` : '';
        return g + `<tr><td>${md(l.nome)}</td>${l.valores.map((v, j) => `<td class="v${j === nos ? ' nos' : ''}">${mk(v)}</td>`).join('')}</tr>`; }).join('')}</table>`; } },
  tabela: { lista: 'linhas', corpo: (p, it) => `<table><tr>${p.colunas.map((c, j) => `<th class="${p.numericas?.includes(j) ? 'num' : ''}">${esc(c)}</th>`).join('')}</tr>
      ${it.map((l) => (l.grupo ? `<tr class="grp"><td colspan="${p.colunas.length}">${esc(l.grupo)}</td></tr>` : `<tr${l.destaque ? ' style="background:var(--r-soft)"' : ''}>${(l.celulas || l).map((c, j) => `<td class="${p.numericas?.includes(j) ? 'num' : ''}">${typeof c === 'number' ? num(c) : md(c ?? '—')}</td>`).join('')}</tr>`)).join('')}</table>` },
  secao: { corpo: (p) => `<div class="stats">
      ${p.quantos != null ? `<div class="st"><div class="lb">Quantos têm</div><div class="big">${p.quantos}<small> de ${p.de}</small></div><div class="dots" style="margin-top:8px">${Array.from({ length: p.de }, (_, k) => `<i class="d ${k < p.quantos ? 's' : ''}"></i>`).join('')}</div></div>` : ''}
      ${p.posicao != null ? `<div class="st"><div class="lb">Onde aparece</div><div style="font-size:19px;font-weight:700;color:var(--r-ink)">${p.posicao < .25 ? 'topo da página' : p.posicao < .5 ? 'primeira metade' : p.posicao < .75 ? 'segunda metade' : 'final da página'}</div><div class="track"><i style="left:${p.posicao * 100}%"></i></div><div class="ends"><span>topo</span><span>rodapé</span></div></div>` : ''}
      ${p.status ? `<div class="st"><div class="lb">${esc(rel.nos || 'Nós')}</div><span class="pill ${(ST[p.status] || ST['?'])[1]}" style="font-size:19px;padding:4px 14px">${{ sim: 'Temos', parcial: 'Temos em parte', nao: 'Não temos' }[p.status] || 'A confirmar'}</span></div>` : ''}</div>
      ${p.eles?.length ? `<div class="card"><h2>Como eles fazem</h2><ul class="b">${p.eles.map(([w, t]) => `<li><b>${esc(w)}</b> ${md(t)}</li>`).join('')}</ul></div>` : ''}
      ${p.nos ? `<div class="card"><h2>A nossa hoje</h2><div style="font-size:21px;line-height:1.4">${md(p.nos)}</div></div>` : ''}
      ${p.sugestoes?.length ? `<div class="card sug"><h2>O que aproveitar</h2><ol class="n">${p.sugestoes.map((t) => `<li>${md(t)}</li>`).join('')}</ol></div>` : ''}` },
  conteudos: { lista: 'itens', corpo: (p, it) => it.map((c) => `<div class="ct"><div class="th" style="background-image:url('${img(c.thumb)}')"></div><div>
      <div class="h"><span>${esc(c.perfil)} · ${esc(c.rede)}${c.tipo ? ' · ' + esc(c.tipo) : ''}</span><span>${esc(c.data || '')}</span></div>
      <div class="lg2">${esc(c.legenda || '')}</div><div class="m">${md(c.metricas || '')}${c.multiplo ? ` · <b>${esc(c.multiplo)}</b> a mediana do perfil` : ''}</div>
      ${c.obs ? `<div class="o">${md(c.obs)}</div>` : ''}</div></div>`).join('') },
  cards: { lista: 'itens', corpo: (p, it) => it.map((c) => `<div class="card cd">${c.rotulo ? `<h2>${esc(c.rotulo)}</h2>` : ''}${c.titulo ? `<div class="t">${md(c.titulo)}</div>` : ''}${c.texto ? `<div class="x">${md(c.texto)}</div>` : ''}</div>`).join('') },
  insights: { corpo: (p) => `${p.pontos?.length ? `<div class="card"><h2>${esc(p.pontosTitulo || 'O que os dados mostram')}</h2><ul class="b">${p.pontos.map((t) => `<li>${md(t)}</li>`).join('')}</ul></div>` : ''}
      ${p.sugestoes?.length ? `<div class="card sug"><h2>${esc(p.sugestoesTitulo || 'O que fazer')}</h2><ol class="n">${p.sugestoes.map((t) => `<li>${md(t)}</li>`).join('')}</ol></div>` : ''}` },
};

const html = (p, itens, off, parte, idx, total) => {
  const T = TIPOS[p.tipo];
  const titulo = p.tipo === 'capa' ? '' : `<h1>${md(p.titulo || '')}${parte ? ` <span class="pg">(${parte})</span>` : ''}</h1>${p.sub ? `<div class="sub">${md(p.sub)}</div>` : ''}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
  <div class="k"><span>${esc(rel.cabecalho || rel.titulo || '')}</span><span>${idx}/${total}</span></div>
  <div id="c">${titulo}${T.corpo(p, itens, off)}</div>
  <div class="foot">${p.legenda !== false && T.legenda ? T.legenda : '<span></span>'}<span style="text-align:right">${md(p.fonte || rel.fonte || '')}</span></div></body></html>`;
};

const b = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const pg = await b.newPage({ viewport: { width: W, height: H } });
const tmp = join(pasta, '_render.html');
const cabe = async (h) => { writeFileSync(tmp, h); await pg.goto(pathToFileURL(tmp).href); await pg.evaluate(() => document.fonts.ready);
  return pg.evaluate(() => { const c = document.getElementById('c'); return c.scrollHeight <= c.clientHeight + 1; }); };

// 1) quebra as listas em páginas que cabem
const paginas = [];
for (const p of rel.paginas) {
  const T = TIPOS[p.tipo]; if (!T) { console.error(`tipo desconhecido: ${p.tipo}`); process.exit(1); }
  if (!T.lista) { paginas.push({ p, itens: null, off: 0 }); continue; }
  const todos = p[T.lista] || []; const partes = []; let i = 0;
  while (i < todos.length) {
    let k = todos.length - i;
    while (k > 1 && !(await cabe(html(p, todos.slice(i, i + k), i, null, 1, 1)))) k--;
    partes.push({ p, itens: todos.slice(i, i + k), off: i }); i += k;
  }
  partes.forEach((x, j) => { x.parte = partes.length > 1 ? `${j + 1}/${partes.length}` : null; paginas.push(x); });
}
// 2) renderiza
const png = join(pasta, 'png'); rmSync(png, { recursive: true, force: true }); mkdirSync(png, { recursive: true });
const arquivos = []; const avisos = [];
for (const [n, x] of paginas.entries()) {
  const h = html(x.p, x.itens, x.off, x.parte, n + 1, paginas.length);
  if (!(await cabe(h))) avisos.push(`página ${n + 1} (${x.p.tipo} "${x.p.titulo || ''}") não coube: encurte o texto`);
  const f = join(png, `${String(n + 1).padStart(2, '0')}-${x.p.tipo}.png`);
  await pg.screenshot({ path: f }); arquivos.push(f);
}
// 3) PDF: as próprias imagens, 1 por página
const pdfNome = `${rel.empresa}-${rel.modulo || 'relatorio'}-${rel.data || new Date().toISOString().slice(0, 10)}.pdf`;
await pg.setContent(`<style>@page{size:${W}px ${H}px;margin:0}body{margin:0}img{display:block;width:${W}px;height:${H}px;break-after:page}</style>` +
  arquivos.map((f) => `<img src="data:image/png;base64,${readFileSync(f).toString('base64')}">`).join(''), { waitUntil: 'load' });
await pg.pdf({ path: join(pasta, pdfNome), width: `${W}px`, height: `${H}px`, printBackground: true });
await b.close(); rmSync(tmp, { force: true });
console.log(`${paginas.length} páginas → ${join(pasta, pdfNome)}`);
if (avisos.length) { console.log('AVISOS:\n  ' + avisos.join('\n  ')); process.exitCode = 2; }
