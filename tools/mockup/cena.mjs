#!/usr/bin/env node
// Export do editor de mockups (tarefa 030): lê o mockup.json (versão 2, camadas) de uma peça e renderiza cada formato
// pelo Playwright com o MESMO runtime do editor (library/mockups/runtime/cena.html) → png/<formato>.png em 3×.
//
//   node tools/mockup/cena.mjs companies/kz/contents/<pasta> [--formatos 4:5,9:16] [--escala 3] [--webp] [--transparente]
//   node tools/mockup/cena.mjs --novo --captura companies/kz/capturas/<pasta> [--titulo "…"] [--formatos 4:5,9:16] [--saida <pasta>]
//   node tools/mockup/cena.mjs --teste-fundos [--formato 4:5]      (renderiza os presets de fundos.json para conferir em 100%)
// Saída (stdout, última linha): JSON { ok, arquivos[], qa[] } — a API do app lê isto.
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve, relative, sep, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { novaPasta } from '../lib/pecas.mjs';
import { root, lib, FORMATOS, aparelhos, capturasDoDoc, docNovo, salvarJson } from './cena-lib.mjs';
const ROOT = root(), LIB = lib();

const argv = process.argv.slice(2), opt = {}, pos = [];
const BOOL = ['webp', 'transparente', 'novo', 'teste-fundos', 'json'];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (!a.startsWith('--')) pos.push(a); else if (BOOL.includes(a.slice(2))) opt[a.slice(2)] = true; else opt[a.slice(2)] = argv[++i]; }
const fail = (m) => { console.error('✗ ' + m); console.log(JSON.stringify({ ok: false, erro: m })); process.exit(1); };
const rel = (p) => relative(ROOT, p).split(sep).join('/');
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const urlArquivo = (slug, ref, arq) => pathToFileURL(join(ROOT, 'companies', slug, ref, arq)).href;
const nomeFormato = (f) => f.replace(':', 'x');

async function navegador() {
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch { fail('Playwright não instalado: npm install && npx playwright install chromium'); }
  const args = ['--allow-file-access-from-files'];
  try { return await chromium.launch({ args }); } catch (e) { try { return await chromium.launch({ channel: 'chrome', args }); } catch { fail('não abriu o Chromium: ' + e.message); } }
}
let _aps;
const aps = () => (_aps ??= aparelhos((d) => pathToFileURL(join(LIB, 'aparelhos', d)).href + '/', { mascaraInline: true }));

/** um formato → PNG. Devolve { arquivo, qa } ou { erro } */
export async function renderFormato(browser, doc, fmt, destino, { escala = 3, transparente = false } = {}) {
  const [W, H] = FORMATOS[fmt] ?? [];
  if (!W) return { erro: 'formato inválido: ' + fmt };
  const init = {
    brandCss: pathToFileURL(doc.empresa && existsSync(join(ROOT, 'companies', doc.empresa, 'brand', 'brand.css')) ? join(ROOT, 'companies', doc.empresa, 'brand', 'brand.css') : join(LIB, 'runtime', 'neutro.css')).href,
    aparelhos: aps(), capturas: capturasDoDoc(doc, urlArquivo),
  };
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: escala });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  try {
    await page.addInitScript(([i, d, f]) => { window.CENA_INIT = i; window.CENA_DOC = d; window.CENA_FORMATO = f; }, [init, doc, fmt]);
    await page.goto(pathToFileURL(join(LIB, 'runtime', 'cena.html')).href);
    await page.waitForFunction(() => window.MK_PRONTO, null, { timeout: 60000 });
    const r = await page.evaluate(() => window.MK_PRONTO);
    if (!r.ok) return { erro: r.erro.split('\n')[0] };
    mkdirSync(resolve(destino, '..'), { recursive: true });
    await page.locator('#palco').screenshot({ path: destino, omitBackground: transparente || doc.fundo?.tipo === 'transparente' });
    return { arquivo: destino, qa: [...r.qa, ...erros] };
  } catch (e) { return { erro: (erros[0] ?? e.message).split('\n')[0] }; }
  finally { await ctx.close(); }
}

// ---------- conferir os fundos-padrão em 100% ----------
if (opt['teste-fundos']) {
  const { presets } = readJson(join(LIB, 'fundos.json'));
  const fmt = opt.formato ?? '4:5', out = join(LIB, 'galeria', 'fundos');
  const b = await navegador();
  for (const p of presets) {
    const doc = { versao: 2, empresa: opt.empresa ?? null, fundo: p.fundo, camadas: [] };
    const r = await renderFormato(b, doc, fmt, join(out, `${p.id}-${nomeFormato(fmt)}.png`), { escala: Number(opt.escala ?? 1) });
    console.log(r.erro ? `✗ ${p.id}: ${r.erro}` : `✓ ${rel(r.arquivo)}`);
  }
  await b.close();
  process.exit(0);
}

// ---------- peça nova a partir de uma captura ----------
let pasta;
if (opt.novo) {
  if (!opt.captura) fail('--novo precisa de --captura companies/<slug>/capturas/<pasta>');
  const capAbs = resolve(ROOT, opt.captura), partes = rel(capAbs).split('/');
  if (partes[0] !== 'companies' || partes[2] !== 'capturas') fail('a captura precisa estar em companies/<slug>/capturas/');
  const slug = partes[1], ref = partes.slice(2).join('/');
  pasta = resolve(ROOT, opt.saida ?? join('companies', slug, 'contents', novaPasta(slug, 'mockup', basename(capAbs).replace(/^\d{4}-\d{2}-\d{2}-/, '')).pasta));
  if (existsSync(join(pasta, 'mockup.json'))) fail(`${rel(pasta)} já tem mockup.json`);
  salvarJson(join(pasta, 'mockup.json'), docNovo(slug, { captura: ref, formatos: (opt.formatos ?? '4:5').split(','), titulo: opt.titulo }));
} else {
  if (!pos[0]) fail('informe a pasta da peça (com mockup.json versão 2)');
  pasta = resolve(ROOT, pos[0]);
}
const docF = join(pasta, 'mockup.json');
if (!existsSync(docF)) fail(`${rel(pasta)}: sem mockup.json`);
const doc = readJson(docF);
if (doc.versao !== 2) fail(`${rel(docF)} é da versão 1 (templates): use node tools/mockup/render.mjs ${rel(pasta)}`);
const formatos = (opt.formatos ? opt.formatos.split(',') : doc.formatos) ?? ['4:5'];
const escala = Number(opt.escala ?? doc.escala ?? 3);
const b = await navegador();
const arquivos = [], qa = [];
for (const fmt of formatos) {
  const destino = join(pasta, 'png', `${nomeFormato(fmt)}.png`);
  const r = await renderFormato(b, doc, fmt, destino, { escala, transparente: !!opt.transparente });
  if (r.erro) { console.error(`✗ ${fmt}: ${r.erro}`); qa.push(`${fmt}: ${r.erro}`); continue; }
  arquivos.push(`png/${nomeFormato(fmt)}.png`);
  console.error(`✓ ${rel(destino)} (${escala}×)`);
  for (const q of r.qa) { console.error('  ⚠ ' + q); qa.push(q); }
  if (opt.webp) { try { execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', destino, '-c:v', 'libwebp', '-quality', '92', destino.replace(/\.png$/, '.webp')]); arquivos.push(`png/${nomeFormato(fmt)}.webp`); } catch (e) { qa.push('webp falhou: ' + e.message.split('\n')[0]); } }
}
await b.close();

// ficha da peça (central de conteúdos): tipo mockup; dados reais sem confirmação → "nao-publicar"
const caps = Object.values(capturasDoDoc(doc, urlArquivo));
const fichaF = join(pasta, 'peca.json');
const ficha = existsSync(fichaF) ? readJson(fichaF) : { title: `Mockup · ${caps[0]?.nome.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ') ?? 'editor'}`, tags: [], notes: {} };
ficha.kind = 'mockup';
const reais = caps.some((c) => !c.dadosFicticios);
ficha.tags = [...new Set([...(ficha.tags || []).filter((t) => t !== 'nao-publicar' || reais), 'mockup', ...(reais ? ['nao-publicar'] : [])])];
if (arquivos[0]) ficha.principal = ficha.principal && arquivos.includes(ficha.principal) ? ficha.principal : arquivos[0];
ficha.updatedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
writeFileSync(fichaF, JSON.stringify(ficha, null, 2) + '\n');
console.log(JSON.stringify({ ok: arquivos.length > 0, pasta: rel(pasta), arquivos, qa }));
if (!arquivos.length) process.exitCode = 1;
