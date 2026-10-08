// Adaptadores grátis da curadoria (041 F2): PubMed (E-utilities), Europe PMC, OpenAlex, Crossref, DOAJ, RSS e Google Notícias.
// Só rede + normalização; nenhum LLM. Cada adaptador devolve RawItem[] e avisos; erro sobe para o buscar.ts, que registra por fonte.
import type { CuratedSource } from '../../schema';
import type { AdapterCtx, CurAdapter, RawItem, SearchParams } from './types';
import { cleanDoi, decodeEntities, dedupKey, guessEvidence, isBrazilian, isoDate, langCode, stripTags, toIso } from './text';

const enc = encodeURIComponent;
/** cota da API acabou (OpenAlex sem chave): o adaptador tenta a alternativa grátis antes de desistir */
export class BudgetError extends Error {}
async function getJson<T = any>(ctx: AdapterCtx, url: string, what: string): Promise<T> {
  let r = await ctx.runner.fetchText(url, { headers: { accept: 'application/json' }, timeoutMs: 40_000 });
  // 429 passageiro (não é cota do dia): espera e tenta mais 2 vezes
  for (let i = 0; i < 2 && r.status === 429 && !/budget/i.test(r.text); i++) {
    await sleep(4000 * (i + 1));
    r = await ctx.runner.fetchText(url, { headers: { accept: 'application/json' }, timeoutMs: 40_000 });
  }
  if (r.status === 429) {
    if (/budget/i.test(r.text)) throw new BudgetError(`${what}: acabou a cota grátis do dia sem chave (volta à meia-noite UTC). Crie uma chave grátis em https://help.openalex.org/api/authentication/ e salve OPENALEX_API_KEY no .env do projeto (app → Configurações)`);
    throw new Error(`${what}: limite de requisições (429); tente de novo em alguns minutos`);
  }
  if (r.status >= 400) throw new Error(`${what}: HTTP ${r.status} em ${url.slice(0, 160)}`);
  try { return JSON.parse(r.text) as T; } catch { throw new Error(`${what}: resposta não é JSON (${r.text.slice(0, 120)})`); }
}
async function getText(ctx: AdapterCtx, url: string, what: string): Promise<string> {
  const r = await ctx.runner.fetchText(url, { timeoutMs: 40_000 });
  if (r.status >= 400) throw new Error(`${what}: HTTP ${r.status} em ${url.slice(0, 160)}`);
  return r.text;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const tag = (xml: string, name: string) => { const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i')); return m ? stripTags(m[1]) : ''; };
const tags = (xml: string, name: string) => [...xml.matchAll(new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)</${name}>`, 'gi'))].map((m) => ({ attrs: m[1], text: stripTags(m[2]) }));
const inPeriod = (d: string | undefined, p: { from: string; to: string }) => !d || (d >= p.from && d <= p.to);

function item(src: CuratedSource, adapter: string, query: string, o: Omit<RawItem, 'key' | 'sourceIds' | 'adapter' | 'query' | 'brazilian' | 'altUrls'> & { altUrls?: string[]; countries?: string[] }): RawItem {
  const { countries, ...rest } = o;
  return {
    ...rest,
    altUrls: [...new Set((o.altUrls ?? []).filter((u) => u && u !== o.url))],
    key: dedupKey(o), sourceIds: [src.id], adapter, query,
    brazilian: isBrazilian({ venue: o.venue, doi: o.doi, language: o.language, countries }),
  };
}

/** consultas que valem para a fonte: pt para fonte pt, en para fonte en, as duas para multi ou periódico filtrado */
export function queriesFor(src: CuratedSource, p: SearchParams, byLang: { pt: string[]; en: string[] }): string[] {
  const filtered = !!src.access.filters?.openalexSource || !!src.access.filters?.openalexFilter;
  const langs = filtered || src.language === 'multi' ? ['pt', 'en'] : src.language === 'en' ? ['en'] : ['pt'];
  return langs.filter((l) => p.languages.includes(l as 'pt' | 'en')).flatMap((l) => byLang[l as 'pt' | 'en'] ?? []);
}

// ───────────── PubMed (E-utilities: esearch + efetch) ─────────────
export const pubmed: CurAdapter = async (src, p, ctx) => {
  const key = ctx.env('NCBI_API_KEY');
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  const k = key ? `&api_key=${enc(key)}` : '';
  const out: RawItem[] = [], warnings: string[] = [];
  for (const q of p.queries) {
    const es = await getJson(ctx, `${base}/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${p.max}&datetype=pdat&mindate=${p.from.replace(/-/g, '/')}&maxdate=${p.to.replace(/-/g, '/')}&term=${enc(`(${q}) AND hasabstract`)}${k}`, 'PubMed esearch');
    const ids: string[] = es?.esearchresult?.idlist ?? [];
    if (!ids.length) { warnings.push(`PubMed: 0 resultados para "${q}"`); continue; }
    await sleep(key ? 120 : 400);
    const xml = await getText(ctx, `${base}/efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(',')}${k}`, 'PubMed efetch');
    for (const art of xml.split(/<PubmedArticle>/).slice(1)) {
      const pmid = tag(art, 'PMID');
      const title = tag(art, 'ArticleTitle');
      const abstract = tags(art, 'AbstractText').map((a) => { const l = a.attrs.match(/Label="([^"]+)"/); return l ? `${l[1]}: ${a.text}` : a.text; }).join(' ');
      const doi = cleanDoi(tags(art, 'ArticleId').find((a) => /IdType="doi"/.test(a.attrs))?.text);
      const pmc = tags(art, 'ArticleId').find((a) => /IdType="pmc"/.test(a.attrs))?.text;
      const pubTypes = tags(art, 'PublicationType').map((t) => t.text);
      const pd = art.match(/<PubDate>([\s\S]*?)<\/PubDate>/)?.[1] ?? '';
      const ad = art.match(/<ArticleDate[^>]*>([\s\S]*?)<\/ArticleDate>/)?.[1];
      const date = ad ? isoDate(tag(ad, 'Year'), tag(ad, 'Month'), tag(ad, 'Day')) : isoDate(tag(pd, 'Year') || tag(pd, 'MedlineDate').slice(0, 4), tag(pd, 'Month'), tag(pd, 'Day'));
      const names = [...art.matchAll(/<Author\b[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?(?:<ForeName>([^<]+)<\/ForeName>)?[\s\S]*?<\/Author>/g)].slice(0, 8).map((m) => `${decodeEntities(m[2] ?? '')} ${decodeEntities(m[1])}`.trim());
      const aff = tags(art, 'Affiliation').map((a) => a.text).join(' ');
      if (!title || !pmid) continue;
      out.push(item(src, 'pubmed', q, {
        title, abstract, doi, pmid, pubTypes,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        altUrls: [pmc ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmc}/` : '', doi ? `https://doi.org/${doi}` : ''],
        authors: names, venue: tag(art.match(/<Journal>[\s\S]*?<\/Journal>/)?.[0] ?? '', 'Title') || undefined,
        publishedAt: date, language: langCode(tag(art, 'Language'), abstract), kind: /review/i.test(pubTypes.join(' ')) ? 'revisao' : 'artigo',
        evidence: guessEvidence(pubTypes, title, abstract), countries: /brazil|brasil/i.test(aff) ? ['BR'] : [],
      }));
    }
    await sleep(key ? 120 : 400);
  }
  return { items: out, warnings };
};

// ───────────── Europe PMC ─────────────
export const europepmc: CurAdapter = async (src, p, ctx) => {
  const out: RawItem[] = [], warnings: string[] = [];
  for (const q of p.queries) {
    const query = `(${q}) AND (FIRST_PDATE:[${p.from} TO ${p.to}]) AND HAS_ABSTRACT:y AND NOT SRC:PPR`;
    const j = await getJson(ctx, `https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=${p.max}&query=${enc(query)}`, 'Europe PMC');
    const list: any[] = j?.resultList?.result ?? [];
    if (!list.length) warnings.push(`Europe PMC: 0 resultados para "${q}"`);
    for (const r of list) {
      const doi = cleanDoi(r.doi), abstract = stripTags(r.abstractText ?? '');
      const pubTypes: string[] = r.pubTypeList?.pubType ?? [];
      const aff = JSON.stringify(r.authorList ?? '').toLowerCase();
      out.push(item(src, 'europepmc', q, {
        title: stripTags(r.title ?? ''), abstract, doi, pmid: r.pmid, pubTypes,
        url: r.pmid ? `https://europepmc.org/article/MED/${r.pmid}` : r.pmcid ? `https://europepmc.org/article/PMC/${r.pmcid}` : `https://doi.org/${doi}`,
        altUrls: [r.pmcid ? `https://pmc.ncbi.nlm.nih.gov/articles/${r.pmcid}/` : '', doi ? `https://doi.org/${doi}` : '', r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : ''],
        authors: (r.authorString ?? '').split(/,\s*/).filter(Boolean).slice(0, 8),
        venue: r.journalInfo?.journal?.title, publishedAt: toIso(r.firstPublicationDate),
        language: langCode(r.language, abstract), kind: /review/i.test(pubTypes.join(' ')) ? 'revisao' : 'artigo',
        evidence: guessEvidence(pubTypes, r.title ?? '', abstract), openAccess: r.isOpenAccess === 'Y',
        countries: /brazil|brasil/.test(aff) ? ['BR'] : [],
      }));
    }
  }
  return { items: out.filter((i) => i.title), warnings };
};

// ───────────── OpenAlex ─────────────
export function invertedToText(inv: Record<string, number[]> | null | undefined): string {
  if (!inv) return '';
  const pos: string[] = [];
  for (const [w, ps] of Object.entries(inv)) for (const i of ps) pos[i] = w;
  return pos.filter((w) => w !== undefined).join(' ');
}
function fromOpenAlex(src: CuratedSource, q: string, w: any): RawItem {
  const doi = cleanDoi(w.doi), abstract = invertedToText(w.abstract_inverted_index);
  const pmid = String(w.ids?.pmid ?? '').match(/(\d+)$/)?.[1];
  const landing = w.primary_location?.landing_page_url as string | undefined;
  const title = stripTags(w.display_name ?? '');
  return item(src, 'openalex', q, {
    title, abstract, doi, pmid, pubTypes: [w.type ?? ''],
    url: landing && !/doi\.org/.test(landing) ? landing : doi ? `https://doi.org/${doi}` : String(w.id),
    altUrls: [doi ? `https://doi.org/${doi}` : '', w.best_oa_location?.landing_page_url ?? '', pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : ''],
    authors: (w.authorships ?? []).slice(0, 8).map((a: any) => a.author?.display_name).filter(Boolean),
    venue: w.primary_location?.source?.display_name, publishedAt: toIso(w.publication_date),
    language: langCode(w.language, abstract), kind: w.type === 'review' ? 'revisao' : 'artigo',
    evidence: guessEvidence([w.type ?? ''], title, abstract), openAccess: !!w.open_access?.is_oa,
    countries: (w.authorships ?? []).flatMap((a: any) => a.countries ?? []),
  });
}

/**
 * OpenAlex. Periódico com `openalexSource` = modo revista: traz TODOS os artigos do período (revista pequena; a pré-triagem
 * ordena pelos termos), em vez de buscar consulta por consulta. Sem cota (sem chave) → cai no Crossref pelo `issn` ou `crossrefPrefix`.
 */
export const openalex: CurAdapter = async (src, p, ctx) => {
  const out: RawItem[] = [], warnings: string[] = [];
  const f = src.access.filters ?? {};
  const key = ctx.env('OPENALEX_API_KEY'), mail = ctx.env('CURADORIA_MAILTO');
  const auth = `${key ? `&api_key=${enc(key)}` : ''}${mail ? `&mailto=${enc(mail)}` : ''}`;
  const sel = 'id,doi,display_name,publication_date,language,type,primary_location,best_oa_location,abstract_inverted_index,authorships,open_access,ids';
  const base = [`from_publication_date:${p.from}`, `to_publication_date:${p.to}`, 'type:article|review', 'has_abstract:true'];
  try {
    if (f.openalexSource) {
      let cursor = '*';
      for (let page = 0; page < 3 && cursor; page++) {
        const filter = [...base, `primary_location.source.id:${f.openalexSource}`].join(',');
        const j = await getJson(ctx, `https://api.openalex.org/works?per-page=200&cursor=${enc(cursor)}&select=${sel}&filter=${enc(filter)}${auth}`, 'OpenAlex');
        for (const w of j?.results ?? []) out.push(fromOpenAlex(src, '(revista inteira)', w));
        cursor = j?.meta?.next_cursor ?? '';
        await sleep(150);
      }
      if (!out.length) warnings.push('OpenAlex: a revista não tem artigos com resumo no período');
      return { items: out.filter((i) => i.title), warnings };
    }
    const extra = f.openalexFilter ? [String(f.openalexFilter)] : [];
    for (const q of p.queries) {
      const filter = [`title_and_abstract.search:${q.replace(/[,:|]/g, ' ')}`, ...base, ...extra].join(',');
      const j = await getJson(ctx, `https://api.openalex.org/works?per-page=${p.max}&sort=relevance_score:desc&select=${sel}&filter=${enc(filter)}${auth}`, 'OpenAlex');
      const list: any[] = j?.results ?? [];
      if (!list.length) warnings.push(`OpenAlex: 0 resultados para "${q}"`);
      for (const w of list) out.push(fromOpenAlex(src, q, w));
      await sleep(150);
    }
    return { items: out.filter((i) => i.title), warnings };
  } catch (e) {
    const alt = f.issn || f.crossrefPrefix;
    if (!(e instanceof BudgetError) || !alt) {
      if (out.length && e instanceof BudgetError) { warnings.push((e as Error).message); return { items: out, warnings }; }
      throw e;
    }
    warnings.push(`${(e as Error).message} → usei o Crossref (${f.issn ? `ISSN ${f.issn}` : `prefixo ${f.crossrefPrefix}`})`);
    const r = await crossref(src, p, ctx);
    return { items: [...out, ...r.items], warnings: [...warnings, ...r.warnings] };
  }
};

// ───────────── Crossref ─────────────
function fromCrossref(src: CuratedSource, q: string, w: any): RawItem {
  const doi = cleanDoi(w.DOI), abstract = stripTags(w.abstract ?? '').replace(/^(abstract|resumo|resumen)\s*/i, '');
  const title = stripTags((w.title ?? [])[0] ?? '');
  const dp = w.issued?.['date-parts']?.[0] ?? [];
  return item(src, 'crossref', q, {
    title, abstract, doi, pubTypes: [w.type ?? ''],
    url: `https://doi.org/${doi}`, altUrls: [w.URL ?? ''],
    authors: (w.author ?? []).slice(0, 8).map((a: any) => `${a.given ?? ''} ${a.family ?? ''}`.trim()).filter(Boolean),
    venue: (w['container-title'] ?? [])[0], publishedAt: isoDate(dp[0], dp[1], dp[2]),
    language: langCode(w.language, abstract), kind: 'artigo', evidence: guessEvidence([], title, abstract),
  });
}
/** Crossref. Com `issn` = modo revista (todos os artigos do período, paginado); senão busca por consulta (com `crossrefPrefix` opcional). */
export const crossref: CurAdapter = async (src, p, ctx) => {
  const out: RawItem[] = [], warnings: string[] = [];
  const f = src.access.filters ?? {};
  const mail = ctx.env('CURADORIA_MAILTO');
  const m = mail ? `&mailto=${enc(mail)}` : '';
  const select = '&select=DOI,title,abstract,container-title,issued,author,type,URL';
  const dates = `from-pub-date:${p.from},until-pub-date:${p.to},has-abstract:true,type:journal-article`;
  if (f.issn) {
    let cursor = '*';
    for (let page = 0; page < 3 && cursor; page++) {
      const j = await getJson(ctx, `https://api.crossref.org/works?rows=200&cursor=${enc(cursor)}&filter=${enc(`${dates},issn:${f.issn}`)}${select}${m}`, 'Crossref');
      const list: any[] = j?.message?.items ?? [];
      for (const w of list) out.push(fromCrossref(src, '(revista inteira)', w));
      await sleep(1000);
      cursor = list.length === 200 ? j?.message?.['next-cursor'] ?? '' : '';
    }
    if (!out.length) warnings.push(`Crossref: a revista (ISSN ${f.issn}) não tem artigos com resumo no período`);
    return { items: out.filter((i) => i.title && i.doi), warnings };
  }
  const prefix = f.crossrefPrefix ? `,prefix:${f.crossrefPrefix}` : '';
  for (const q of p.queries) {
    const j = await getJson(ctx, `https://api.crossref.org/works?rows=${p.max}&query.bibliographic=${enc(q)}&filter=${enc(dates + prefix)}${select}${m}`, 'Crossref');
    const list: any[] = j?.message?.items ?? [];
    if (!list.length) warnings.push(`Crossref: 0 resultados para "${q}"`);
    for (const w of list) out.push(fromCrossref(src, q, w));
    await sleep(1000);
  }
  return { items: out.filter((i) => i.title && i.doi), warnings };
};

// ───────────── DOAJ ─────────────
export const doaj: CurAdapter = async (src, p, ctx) => {
  const out: RawItem[] = [], warnings: string[] = [];
  const years: string[] = [];
  for (let y = +p.from.slice(0, 4); y <= +p.to.slice(0, 4); y++) years.push(String(y));
  for (const q of p.queries) {
    const query = `(${q}) AND bibjson.year:(${years.join(' OR ')})`;
    const j = await getJson(ctx, `https://doaj.org/api/search/articles/${enc(query)}?pageSize=${p.max}`, 'DOAJ');
    const list: any[] = j?.results ?? [];
    if (!list.length) warnings.push(`DOAJ: 0 resultados para "${q}"`);
    for (const r of list) {
      const b = r.bibjson ?? {};
      const doi = cleanDoi((b.identifier ?? []).find((i: any) => i.type?.toLowerCase() === 'doi')?.id);
      const full = (b.link ?? []).find((l: any) => l.type === 'fulltext')?.url;
      const abstract = stripTags(b.abstract ?? ''), title = stripTags(b.title ?? '');
      const date = isoDate(b.year, b.month, null);
      if (!inPeriod(date, p)) continue;
      const aff = JSON.stringify(b.author ?? '').toLowerCase();
      out.push(item(src, 'doaj', q, {
        title, abstract, doi, pubTypes: [],
        url: full || (doi ? `https://doi.org/${doi}` : `https://doaj.org/article/${r.id}`),
        altUrls: [doi ? `https://doi.org/${doi}` : '', `https://doaj.org/article/${r.id}`],
        authors: (b.author ?? []).slice(0, 8).map((a: any) => a.name).filter(Boolean),
        venue: b.journal?.title, publishedAt: date, language: langCode((b.journal?.language ?? [])[0], abstract),
        kind: 'artigo', evidence: guessEvidence([], title, abstract), openAccess: true,
        countries: /brazil|brasil/.test(aff) || /^br$/i.test(b.journal?.country ?? '') ? ['BR'] : [],
      }));
    }
  }
  return { items: out.filter((i) => i.title), warnings };
};

// ───────────── RSS / Atom (genérico) ─────────────
export function parseFeed(xml: string): { title: string; link: string; date?: string; description: string; source?: string }[] {
  const blocks = xml.includes('<item') ? xml.split(/<item[\s>]/).slice(1) : xml.split(/<entry[\s>]/).slice(1);
  return blocks.map((b) => {
    const link = tag(b, 'link') || b.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
    return {
      title: tag(b, 'title'), link: decodeEntities(link.trim()),
      date: toIso(tag(b, 'pubDate') || tag(b, 'updated') || tag(b, 'published') || tag(b, 'dc:date')),
      description: tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded').slice(0, 1500),
      source: tag(b, 'source') || undefined,
    };
  }).filter((x) => x.title && /^https?:/.test(x.link));
}
export const rss: CurAdapter = async (src, p, ctx) => {
  const ep = src.access.endpoint;
  if (!ep) throw new Error('fonte RSS sem endpoint (feed) no cadastro');
  const qs = ep.includes('{q}') ? p.queries : [''];
  const out: RawItem[] = [], warnings: string[] = [];
  for (const q of qs) {
    const xml = await getText(ctx, ep.replace('{q}', enc(q)), `RSS ${src.id}`);
    const entries = parseFeed(xml).filter((e) => inPeriod(e.date, p));
    for (const e of entries) out.push(item(src, 'rss', q, {
      title: e.title, abstract: e.description, url: e.link, pubTypes: [], authors: [], venue: e.source ?? src.name,
      publishedAt: e.date, language: src.language === 'multi' ? langCode('', e.title + ' ' + e.description) : (src.language as 'pt' | 'en' | 'es'),
      kind: src.type === 'orgao-oficial' ? 'documento-oficial' : 'noticia',
    }));
  }
  return { items: out, warnings };
};

// ───────────── Google Notícias (RSS de busca) ─────────────
export const googleNews: CurAdapter = async (src, p, ctx) => {
  const ep = src.access.endpoint ?? 'https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419';
  const days = Math.max(1, Math.round((Date.parse(p.to) - Date.parse(p.from)) / 86_400_000));
  const out: RawItem[] = [], warnings: string[] = [];
  for (const q of p.queries) {
    const xml = await getText(ctx, ep.replace('{q}', enc(`${q} when:${days}d`)), 'Google Notícias');
    const entries = parseFeed(xml).filter((e) => inPeriod(e.date, p)).slice(0, p.max);
    if (!entries.length) warnings.push(`Google Notícias: 0 resultados para "${q}"`);
    for (const e of entries) {
      const venue = e.source ?? e.title.match(/ - ([^-]+)$/)?.[1]?.trim();
      out.push(item(src, 'google-news', q, {
        title: e.title.replace(/ - [^-]+$/, '').trim(), abstract: '', url: e.link, pubTypes: [], authors: [], venue,
        publishedAt: e.date, language: 'pt', kind: 'noticia',
      }));
    }
  }
  return { items: out, warnings };
};

export const ADAPTERS: Partial<Record<NonNullable<CuratedSource['access']['adapter']>, CurAdapter>> = {
  pubmed, europepmc, openalex, crossref, doaj, rss, 'google-news': googleNews,
};
