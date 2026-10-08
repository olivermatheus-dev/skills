// Passo 3: verificação por script, sem LLM. Para cada achado da triagem confere três coisas:
//   1. o link abre (HTTP 2xx depois dos redirecionamentos; site que barra robô → navegador headless);
//   2. o DOI resolve (API de handles do doi.org: responseCode 1);
//   3. o trecho citado existe, literal, no texto BAIXADO DE NOVO aqui (resumo pela API, por DOI/PMID, ou a página do item),
//      comparado em forma normalizada (caixa, acento, aspas, espaço).
// Grava data/curadoria/<slug>/<rodada>/verificados.json. Só item com os três ok vira referência (schema SourceRef recusa o resto).
import { realRunner } from '../intel/runner';
import { invertedToText } from './adapters';
import { readJsonFile, work, writeJsonFile } from './paths';
import { norm, stripTags, words } from './text';
import type { Candidate, Finding, RawFile, RawItem, Verified } from './types';

const BLOCKED = new Set([401, 403, 406, 429, 503]);
const enc = encodeURIComponent;

async function fetchOk(url: string): Promise<{ ok: boolean; status: number; text: string; finalUrl: string; err?: string }> {
  try {
    const r = await realRunner.fetchText(url, { timeoutMs: 40_000, headers: { accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } });
    return { ok: r.status >= 200 && r.status < 300, status: r.status, text: r.text, finalUrl: r.url };
  } catch (e) { return { ok: false, status: 0, text: '', finalUrl: url, err: (e as Error).message }; }
}

/** navegador headless (Playwright, já instalado no hub) para sites que barram fetch simples */
let browser: any = null;
async function browserOpen(url: string): Promise<{ ok: boolean; status: number; text: string; finalUrl: string }> {
  try {
    if (!browser) { const { chromium } = await import('playwright'); browser = await chromium.launch({ headless: true }); }
    const page = await browser.newPage({ locale: 'pt-BR' });
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await page.waitForTimeout(1500);
      const status = resp?.status() ?? 0;
      const text = await page.content();
      return { ok: status >= 200 && status < 300, status, text, finalUrl: page.url() };
    } finally { await page.close(); }
  } catch { return { ok: false, status: 0, text: '', finalUrl: url }; }
}
export async function closeBrowser() { if (browser) { await browser.close().catch(() => {}); browser = null; } }

export async function doiResolves(doi: string): Promise<boolean> {
  const r = await fetchOk(`https://doi.org/api/handles/${doi.split('/').map(enc).join('/')}`);
  try { return r.ok && JSON.parse(r.text).responseCode === 1; } catch { return false; }
}

/** resumos baixados de novo, por identificador, em APIs independentes da que trouxe o item */
async function abstractsFor(it: RawItem): Promise<{ from: string; text: string }[]> {
  const out: { from: string; text: string }[] = [];
  const add = (from: string, text?: string) => { if (text && words(text) > 20) out.push({ from, text }); };
  if (it.doi) {
    const oa = await fetchOk(`https://api.openalex.org/works/doi:${it.doi}?select=abstract_inverted_index`);
    if (oa.ok) try { add('openalex', invertedToText(JSON.parse(oa.text).abstract_inverted_index)); } catch { /* segue */ }
    const ep = await fetchOk(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&query=${enc(`DOI:"${it.doi}"`)}`);
    if (ep.ok) try { add('europepmc', stripTags(JSON.parse(ep.text).resultList?.result?.[0]?.abstractText ?? '')); } catch { /* segue */ }
    const cr = await fetchOk(`https://api.crossref.org/works/${enc(it.doi)}`);
    if (cr.ok) try { add('crossref', stripTags(JSON.parse(cr.text).message?.abstract ?? '')); } catch { /* segue */ }
  }
  if (it.pmid) {
    const pm = await fetchOk(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${it.pmid}`);
    if (pm.ok) add('pubmed', [...pm.text.matchAll(/<AbstractText\b[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((m) => stripTags(m[1])).join(' '));
  }
  return out;
}

/** o trecho bate com algum texto? compara normalizado; tolera reticências do meio ("a … b" = a e b no mesmo texto, em ordem) */
export function quoteIn(quote: string, text: string): boolean {
  const t = norm(text);
  const parts = quote.split(/\s*(?:\.\.\.|…|\[\.\.\.\])\s*/).map(norm).filter((p) => p.length >= 12);
  if (!parts.length) return false;
  let from = 0;
  for (const p of parts) { const i = t.indexOf(p, from); if (i < 0) return false; from = i + p.length; }
  return true;
}

export function isItemPage(html: string, it: Pick<RawItem, 'title' | 'doi'>): boolean {
  const t = norm(html);
  const head = norm(it.title).split(' ').slice(0, 8).join(' ');
  return (head.length >= 15 && t.includes(head)) || (!!it.doi && html.toLowerCase().includes(it.doi.toLowerCase()));
}

export async function verificar(slug: string, round: string, opts: { requireDoi?: boolean } = {}, log = console.log): Promise<Verified[]> {
  const requireDoi = opts.requireDoi ?? true;
  const raw = readJsonFile<RawFile>(work(slug, round, 'brutos.json'));
  const cands = readJsonFile<Candidate[]>(work(slug, round, 'candidatos.json'));
  const findings = readJsonFile<Finding[]>(work(slug, round, 'achados.json'));
  const byKey = new Map(raw.items.map((i) => [i.key, i]));
  const byCand = new Map(cands.map((c) => [c.id, c]));
  const out: Verified[] = [];
  for (const f of findings) {
    const c = byCand.get(f.cand);
    const it = c && byKey.get(c.key);
    const v: Verified = { ...f, key: c?.key ?? '', item: it as RawItem, url: it?.url ?? '', quoteFrom: 'resumo', verify: { checkedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), linkOk: false, doiOk: null, quoteFound: false }, ok: false };
    out.push(v);
    if (!it) { v.reason = `candidato ${f.cand} não existe`; continue; }
    if (words(f.quote) > 40 || f.quote.length > 400) { v.reason = `trecho longo (${words(f.quote)} palavras; máx. 40)`; continue; }

    // 1. link
    const pages: { from: string; text: string }[] = [];
    for (const u of [it.url, ...it.altUrls]) {
      let r = await fetchOk(u);
      let via = 'fetch';
      // bloqueio de robô (403/429…) ou página de desafio com 2xx (ex.: PubMed responde 203 sem o artigo): tenta no navegador
      if ((!r.ok && (BLOCKED.has(r.status) || r.status === 0)) || (r.ok && !isItemPage(r.text, it))) { r = await browserOpen(u); via = 'navegador'; }
      // abrir não basta: a página tem que ser a do item (título ou DOI no HTML), não uma tela de bloqueio ou a home
      if (r.ok && !isItemPage(r.text, it)) { v.verify.linkVia = `${via} ${r.status}, mas a página não mostra o título nem o DOI`; continue; }
      if (r.ok) { v.url = u; v.verify.linkOk = true; v.verify.linkVia = `${via} ${r.status}`; pages.push({ from: 'pagina', text: r.text }); break; }
    }
    // 2. DOI
    if (it.doi) v.verify.doiOk = await doiResolves(it.doi);
    // 3. trecho
    const abs = await abstractsFor(it);
    const hitAbs = abs.find((a) => quoteIn(f.quote, a.text));
    const hitPage = !hitAbs && pages.find((p) => quoteIn(f.quote, p.text));
    v.verify.quoteFound = !!(hitAbs || hitPage);
    v.verify.textFrom = [...abs.map((a) => a.from), ...pages.map((p) => p.from)];
    v.quoteFrom = hitAbs ? 'resumo' : 'pagina';

    const why: string[] = [];
    if (!v.verify.linkOk) why.push('link não abriu');
    if (v.verify.doiOk === false) why.push('DOI não resolve');
    if (requireDoi && !it.doi && (it.kind === 'artigo' || it.kind === 'revisao')) why.push('artigo sem DOI');
    if (!v.verify.quoteFound) why.push(`trecho não achado no texto baixado (${v.verify.textFrom.join(', ') || 'nada baixado'})`);
    v.ok = !why.length;
    if (!v.ok) v.reason = why.join('; ');
    log(`${v.ok ? '✓' : '✗'} ${f.cand} ${it.title.slice(0, 70)}${v.ok ? ` [${v.verify.linkVia}; trecho no ${hitAbs ? hitAbs.from : 'pagina'}]` : ` — ${v.reason}`}`);
  }
  await closeBrowser();
  writeJsonFile(work(slug, round, 'verificados.json'), out);
  log(`verificação: ${out.filter((v) => v.ok).length}/${out.length} ok`);
  return out;
}
