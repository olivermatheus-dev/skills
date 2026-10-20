#!/usr/bin/env node
// Markdown → PDF A4 na marca da empresa (estudos, planos, documentos de texto).
// node tools/relatorio/md-pdf.mjs <slug> <a.md> [b.md …] [--saida x.pdf] [--impressao] [--titulo "…"] [--subtitulo "…"]
//   1 arquivo, sem --impressao: documento simples (cabeçalho com logo).
//   --impressao: feito para imprimir e anotar à mão: capa, sumário, cada arquivo começa em página nova,
//   sem fundos de cor (só cinza claro), margem direita larga para anotações e página de "Anotações" no fim de cada capítulo.
//   --sem-anotacoes: tira as páginas de anotação, usa margens normais e emenda os capítulos (menos papel).
//   --fonte-min 14: nenhum texto abaixo de 14 pt (títulos crescem na proporção).
// Markdown suportado: # ## ### ####, parágrafos, listas (- e 1.), tabelas, citação (>), --- (quebra de página), **negrito**, *itálico*, ~~riscado~~, `código`.
// QA: MD_PDF_PNG=<arquivo.png> salva a página inteira renderizada (para conferir sem abrir o PDF).
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = (k) => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
const saidaArg = opt('--saida'); const titulo = opt('--titulo'); const subtitulo = opt('--subtitulo');
const impressao = flag('--impressao');
const semAnotacoes = flag('--sem-anotacoes'); // economia de papel: sem páginas de anotação, margens normais, capítulos corridos
const fonteMin = Number(opt('--fonte-min')) || 0; // tamanho mínimo de qualquer texto, em pt (ex.: 14)
const [slug, ...arqs] = args;
if (!slug || !arqs.length || arqs.some((a) => !existsSync(a))) {
  console.error('uso: node tools/relatorio/md-pdf.mjs <slug> <a.md> [b.md …] [--saida x.pdf] [--impressao] [--titulo "…"] [--subtitulo "…"]');
  for (const a of arqs) if (!existsSync(a)) console.error('não achei:', a);
  process.exit(1);
}
const brandDir = join(ROOT, 'companies', slug, 'brand');
const brandCss = join(brandDir, 'brand.css');
const logo = ['logo-horizontal-cor.svg', 'logo-horizontal-cor.png'].map((f) => join(brandDir, 'logo', f)).find(existsSync);
const saida = resolve(saidaArg || arqs[0].replace(/\.md$/, '.pdf'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/(https?:\/\/[^\s<|)]+)/g, '<span class="url">$1</span>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/~~([^~]+)~~/g, '<s>$1</s>')
  .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

function md(texto) {
  const linhas = texto.replace(/\r/g, '').split('\n');
  const out = []; const h1s = [];
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if (/^---+\s*$/.test(l)) { out.push('<div class="quebra"></div>'); i++; continue; }
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) {
      const n = m[1].length; if (n === 1) h1s.push(m[2]);
      out.push(`<h${n}>${inline(m[2])}</h${n}>`); i++; continue;
    }
    if (l.startsWith('|')) {
      const bloco = [];
      while (i < linhas.length && linhas[i].startsWith('|')) bloco.push(linhas[i++]);
      const cel = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const [cab, , ...corpo] = bloco;
      out.push('<table><thead><tr>' + cel(cab).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
        + corpo.map((r) => '<tr>' + cel(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    if (l.startsWith('>')) {
      const bloco = [];
      while (i < linhas.length && linhas[i].startsWith('>')) bloco.push(linhas[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${bloco.map(inline).join('<br>')}</blockquote>`);
      continue;
    }
    if (/^\s*(-|\d+\.)\s/.test(l)) {
      const ord = /^\s*\d+\./.test(l);
      const itens = [];
      while (i < linhas.length && (/^\s*(-|\d+\.)\s/.test(linhas[i]) || (/^\s{2,}\S/.test(linhas[i]) && itens.length))) {
        const t = linhas[i++];
        if (/^\s{2,}(-|\d+\.)\s/.test(t) && itens.length) itens[itens.length - 1] += '<span class="sub">' + inline(t.replace(/^\s*(-|\d+\.)\s+/, '')) + '</span>';
        else if (/^\s*(-|\d+\.)\s/.test(t)) itens.push(inline(t.replace(/^\s*(-|\d+\.)\s+/, '')));
        else itens[itens.length - 1] += ' ' + inline(t.trim());
      }
      out.push(`<${ord ? 'ol' : 'ul'}>` + itens.map((t) => `<li>${t}</li>`).join('') + `</${ord ? 'ol' : 'ul'}>`);
      continue;
    }
    const par = [];
    while (i < linhas.length && linhas[i].trim() && !/^(#|\||>|\s*-\s|\s*\d+\.\s|---)/.test(linhas[i])) par.push(linhas[i++]);
    out.push(`<p>${inline(par.join(' '))}</p>`);
  }
  // título nunca fica sozinho no pé da página: vai junto com o bloco seguinte (tabela longa fica de fora, para não empurrar página inteira)
  const juntos = [];
  for (let k = 0; k < out.length; k++) {
    if (/^<h[1-4]/.test(out[k]) && out[k + 1] && !/^<h[1-4]/.test(out[k + 1]) && out[k + 1].length < 2500) { juntos.push(`<div class="titulo-junto">${out[k]}${out[k + 1]}</div>`); k++; }
    else juntos.push(out[k]);
  }
  return { html: juntos.join('\n'), h1s };
}

const partes = arqs.map((a) => ({ arq: a, ...md(readFileSync(a, 'utf8')) }));
const logoTag = logo ? `<img class="logo" src="${pathToFileURL(logo).href}">` : `<strong>${slug}</strong>`;
const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const cssBase = `
@import url("${pathToFileURL(brandCss).href}");
body { font-family: var(--font-body); color: var(--text); background: #fff; font-size: 10.5pt; line-height: 1.5; margin: 0; }
h1 { break-after: avoid; font-family: var(--font-heading); font-size: 22pt; line-height: 1.15; margin: 0 0 12px; letter-spacing: var(--tracking-heading); }
h2 { font-size: 14pt; margin: 22px 0 8px; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 16px 0 6px; break-after: avoid; }
h4 { font-size: 10.5pt; margin: 12px 0 4px; break-after: avoid; }
p, li { margin: 0 0 6px; } ul, ol { padding-left: 20px; margin: 0 0 10px; } li { margin-bottom: 4px; }
li .sub { display: block; padding-left: 14px; position: relative; } li .sub::before { content: "–"; position: absolute; left: 2px; }
table { width: 100%; border-collapse: collapse; margin: 6px 0 14px; font-size: 8.8pt; }
tr { break-inside: avoid; }
td { vertical-align: top; }
.url, code { word-break: break-all; } p, li { overflow-wrap: break-word; }
strong { font-weight: 800; } code { font-size: 8.5pt; padding: 0 3px; }
s { color: var(--muted); }
.quebra { break-after: page; }
.titulo-junto { break-inside: avoid; }`;

const cssTela = `
header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--primary); padding-bottom: 10px; margin-bottom: 18px; }
header .logo { height: 30px; } header span { color: var(--muted); font-size: 9pt; }
h2 { padding-left: 10px; border-left: 4px solid var(--primary); }
blockquote { margin: 0 0 14px; padding: 10px 14px; background: var(--accent-soft); border-radius: var(--radius-sm); font-size: 9.5pt; }
th { background: var(--inverse-bg); color: var(--on-inverse); text-align: left; padding: 6px 7px; font-weight: 700; }
td { padding: 6px 7px; border-bottom: 1px solid var(--border); }
tbody tr:nth-child(even) td { background: var(--surface-2); }
code { background: var(--surface-2); border-radius: 4px; }`;

// impressão: preto no branco, cinza claro só em cabeçalho de tabela, linhas finas, margem direita para anotar
const cssImpressao = `
body { color: #111; font-size: 10.3pt; }
.capa { height: 247mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
.capa .logo { height: 40px; align-self: flex-start; }
.capa .meio { border-top: 2px solid #111; padding-top: 18px; }
.capa h1 { font-size: 30pt; margin-bottom: 10px; } .capa .sub { font-size: 13pt; color: #444; max-width: 140mm; }
.capa .rodape { font-size: 9.5pt; color: #444; border-top: 0.5pt solid #999; padding-top: 8px; display: flex; justify-content: space-between; }
.sumario { break-after: page; } .sumario h1 { font-size: 18pt; }
.sumario ol { font-size: 11pt; padding-left: 0; list-style: none; } .sumario li { margin-bottom: 8px; }
.capitulo { break-before: page; }
.capitulo > h1:first-child { border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 14px; }
h2 { border-bottom: 0.5pt solid #999; padding-bottom: 3px; margin-top: 20px; }
blockquote { break-inside: avoid; margin: 0 0 12px; padding: 6px 12px; border-left: 3px solid #111; font-size: 9.6pt; color: #222; }
th { background: #EAEAEA; color: #111; text-align: left; padding: 5px 6px; font-weight: 800; border: 0.5pt solid #888; }
td { padding: 5px 6px; border: 0.5pt solid #AAA; }
thead { display: table-header-group; }
.anotacoes { break-before: page; } .anotacoes h2 { border: 0; font-size: 11pt; color: #444; margin-top: 0; }
.anotacoes .linha { border-bottom: 0.5pt solid #BBB; height: 9.2mm; }`;

const linhas = Array.from({ length: 24 }, () => '<div class="linha"></div>').join('');
const corpo = impressao
  ? `<section class="capa">${logoTag}<div class="meio"><h1>${esc(titulo || partes[0].h1s[0] || basename(arqs[0], '.md'))}</h1>${subtitulo ? `<div class="sub">${esc(subtitulo)}</div>` : ''}</div>
     <div class="rodape"><span>Versão para impressão${semAnotacoes ? '' : ' e anotação'} · ${hoje}</span><span>Uso interno</span></div></section>`
    + (partes.length > 1 ? `<section class="sumario"><h1>Sumário</h1><ol>${partes.map((p) => `<li>${inline(p.h1s[0] || basename(p.arq, '.md'))}</li>`).join('')}</ol></section>` : '')
    + partes.map((p) => `<section class="capitulo">${p.html}</section>` + (semAnotacoes || /glossario/.test(p.arq) ? '' : `<section class="anotacoes"><h2>Anotações — ${inline(p.h1s[0] || basename(p.arq, '.md'))}</h2>${linhas}</section>`)).join('\n')
  : `<header>${logoTag}<span>${basename(arqs[0], '.md')}</span></header>` + partes.map((p) => p.html).join('\n');

const f = fonteMin;
const cssFonte = f ? `
body, p, li, td, th, blockquote, code, h4, .capa .rodape, .capa .sub, .sumario ol, header span { font-size: ${f}pt !important; }
ol { padding-left: 32px; } ul { padding-left: 22px; }
body { line-height: 1.38; } h3 { font-size: ${f + 1.5}pt; } h2 { font-size: ${f + 4}pt; } h1 { font-size: ${f + 9}pt; } .capa h1 { font-size: ${f + 16}pt; }
table { margin: 4px 0 10px; } th, td { padding: 3px 5px; } li { margin-bottom: 3px; } p { margin-bottom: 5px; } h2 { margin: 16px 0 6px; } h3 { margin: 12px 0 4px; }` : '';
const cssPapel = semAnotacoes ? `
.capa { height: auto; break-after: auto; justify-content: flex-start; gap: 14px; margin-bottom: 18px; } .capa .rodape { margin-top: 6px; }
.capitulo { break-before: auto; margin-top: 18px; } .capitulo > h1:first-child { break-before: auto; } h1 + blockquote, h1 + p { break-before: avoid; } .sumario + .capitulo { break-before: page; }` : '';
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${cssBase}${impressao ? cssImpressao : cssTela}${cssPapel}${cssFonte}</style></head><body>${corpo}</body></html>`;

const rodapeTxt = esc(titulo || basename(saida, '.pdf'));
const b = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));
const pg = await b.newPage();
const tmp = join(dirname(saida), '.md-pdf-tmp.html');
writeFileSync(tmp, html);
await pg.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready);
await pg.pdf({ path: saida, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: `<div style="font-size:${f ? f + 'pt' : '8px'};color:#555;width:100%;padding:0 14mm;display:flex;justify-content:space-between"><span>${impressao ? rodapeTxt : ''}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  margin: impressao ? { top: '14mm', bottom: f ? '20mm' : '18mm', left: semAnotacoes ? '14mm' : '18mm', right: semAnotacoes ? '14mm' : '34mm' } : { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } });
if (process.env.MD_PDF_PNG) { await pg.setViewportSize({ width: impressao ? 680 : 794, height: 1123 }); await pg.screenshot({ path: process.env.MD_PDF_PNG, fullPage: true }); }
await b.close();
if (!process.env.MD_PDF_KEEP) rmSync(tmp, { force: true });
console.log('PDF →', saida);
