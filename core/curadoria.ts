// Curadoria (041 F1): sugestão de fonte a partir de um link colado, só por script (sem IA).
// Abre o link, lê o título e o feed RSS/Atom, reconhece domínios conhecidos e devolve um rascunho que o Oliver confirma.
import type { SourceAccess, SourceSuggestion, SourceType } from '../schema/curadoria';
import { listSources, strategyRefs, today } from './store';
import { slugify } from './platform';

type Draft = SourceSuggestion['draft'];
interface Rule {
  label: string;
  test: (host: string, path: string) => boolean;
  type: SourceType;
  trust: 1 | 2 | 3;
  access?: SourceAccess;
  language?: Draft['language'];
  name?: string;
  weight?: 1 | 2 | 3;
}
const api = (adapter: NonNullable<SourceAccess['adapter']>, endpoint?: string): SourceAccess => ({ method: 'api', adapter, endpoint, filters: {} });
const is = (...hosts: string[]) => (h: string) => hosts.some((x) => h === x || h.endsWith(`.${x}`));

/** domínios conhecidos (a ordem importa: o 1º que bate vence) */
const RULES: Rule[] = [
  { label: 'SciELO: periódico', test: (h, p) => is('scielo.br')(h) && /^\/j\/[^/]+/.test(p), type: 'periodico', trust: 3, weight: 3, access: api('openalex', 'https://api.openalex.org/works'), language: 'pt' },
  { label: 'SciELO', test: (h) => is('scielo.br', 'scielo.org')(h) && !h.startsWith('pepsic'), type: 'base-artigos', trust: 3, weight: 3, access: api('openalex', 'https://api.openalex.org/works'), language: 'pt' },
  { label: 'PePSIC', test: (h) => h.startsWith('pepsic.'), type: 'base-artigos', trust: 3, weight: 3, access: { method: 'web', filters: {} }, language: 'pt', name: 'PePSIC (Periódicos Eletrônicos em Psicologia)' },
  { label: 'PubMed', test: is('pubmed.ncbi.nlm.nih.gov'), type: 'base-artigos', trust: 3, access: api('pubmed', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'), language: 'en', name: 'PubMed' },
  { label: 'Europe PMC', test: is('europepmc.org'), type: 'base-artigos', trust: 3, access: api('europepmc', 'https://www.ebi.ac.uk/europepmc/webservices/rest/search'), language: 'en', name: 'Europe PMC' },
  { label: 'OpenAlex', test: is('openalex.org'), type: 'base-artigos', trust: 3, access: api('openalex', 'https://api.openalex.org/works'), language: 'multi', name: 'OpenAlex' },
  { label: 'DOAJ', test: is('doaj.org'), type: 'base-artigos', trust: 3, access: api('doaj', 'https://doaj.org/api/search/articles/{q}'), language: 'multi', name: 'DOAJ (acesso aberto)' },
  { label: 'Crossref', test: is('crossref.org'), type: 'base-artigos', trust: 3, weight: 1, access: api('crossref', 'https://api.crossref.org/works'), language: 'multi', name: 'Crossref' },
  { label: 'BVS', test: is('bvsalud.org', 'bvs-psi.org.br'), type: 'base-artigos', trust: 3, weight: 3, language: 'pt' },
  { label: 'Revista científica', test: (h, p) => is('springer.com', 'springeropen.com', 'thelancet.com', 'nature.com', 'wiley.com', 'sciencedirect.com', 'tandfonline.com', 'frontiersin.org', 'sagepub.com', 'cochranelibrary.com', 'jamanetwork.com', 'bmj.com', 'plos.org')(h) || /\/(index\.php\/)?(revista|journal|periodico)s?\b/i.test(p) || /^(revista|periodicos?|seer|journals?)\./.test(h), type: 'periodico', trust: 3 },
  { label: 'CFP', test: is('cfp.org.br'), type: 'orgao-oficial', trust: 3, weight: 3, language: 'pt' },
  { label: 'CRP', test: (h) => /(^|\.)crp[a-z0-9-]*\.org(\.br)?$/.test(h), type: 'orgao-oficial', trust: 3, weight: 3, language: 'pt' },
  { label: 'Governo federal', test: is('gov.br'), type: 'orgao-oficial', trust: 3, weight: 3, language: 'pt' },
  { label: 'OPAS/OMS', test: is('paho.org', 'who.int'), type: 'orgao-oficial', trust: 3 },
  { label: 'Google Notícias', test: is('news.google.com'), type: 'noticia', trust: 2, access: { method: 'rss', adapter: 'google-news', endpoint: 'https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419', filters: {} }, language: 'pt', name: 'Google Notícias (busca por consulta)' },
  { label: 'Veículo de notícias', test: is('globo.com', 'uol.com.br', 'folha.uol.com.br', 'estadao.com.br', 'abril.com.br', 'ebc.com.br', 'cnnbrasil.com.br', 'bbc.com', 'nexojornal.com.br', 'metropoles.com', 'terra.com.br', 'r7.com', 'g1.globo.com', 'exame.com', 'valor.globo.com'), type: 'noticia', trust: 2, language: 'pt' },
  { label: 'Open Library', test: is('openlibrary.org'), type: 'livro-editora', trust: 2, access: api('openlibrary', 'https://openlibrary.org/search.json?q={q}'), language: 'multi', name: 'Open Library' },
  { label: 'Livros', test: (h) => is('books.google.com', 'books.google.com.br', 'grupoa.com.br', 'sinopsyseditora.com.br', 'gruposummus.com.br', 'vozes.com.br', 'record.com.br', 'companhiadasletras.com.br', 'intrinseca.com.br', 'sextante.com.br')(h) || /editora/.test(h), type: 'livro-editora', trust: 2, language: 'pt' },
  { label: 'Podcast', test: (h, p) => is('podcasts.apple.com', 'anchor.fm', 'podcasters.spotify.com', 'castbox.fm')(h) || (is('open.spotify.com')(h) && /^\/(show|episode)\//.test(p)), type: 'podcast', trust: 1 },
  { label: 'Newsletter', test: is('substack.com', 'beehiiv.com', 'buttondown.email', 'mailchi.mp', 'ghost.io'), type: 'newsletter', trust: 1 },
  { label: 'Perfil/criador', test: is('instagram.com', 'youtube.com', 'youtu.be', 'tiktok.com', 'linkedin.com', 'x.com', 'twitter.com', 'facebook.com', 'threads.net'), type: 'perfil-criador', trust: 1, access: { method: 'web', filters: {} } },
];

/** o que cada tipo alimenta por padrão (o Oliver ajusta); só entra o que existe no CONTENT_STRATEGY.md */
const FEEDS: Record<SourceType, { pillars: number[]; series: number[] }> = {
  periodico: { pillars: [4, 6], series: [3] },
  'base-artigos': { pillars: [4, 6], series: [3] },
  'orgao-oficial': { pillars: [4, 6], series: [6] },
  noticia: { pillars: [6], series: [] },
  'livro-editora': { pillars: [6], series: [12] },
  podcast: { pillars: [3, 6], series: [12] },
  newsletter: { pillars: [3, 6], series: [] },
  'perfil-criador': { pillars: [3], series: [] },
  outro: { pillars: [6], series: [] },
};

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
const normUrl = (u: string) => u.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/+$/, '');

export function parseUrl(raw: string): URL | null {
  const t = raw.trim();
  if (!t) return null;
  try { const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`); return /\./.test(u.hostname) ? u : null; } catch { return null; }
}

/** lê o HTML: título, nome do site, idioma e feed */
export function readPage(html: string, base: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  const og = metas.find((m) => /property\s*=\s*["']og:site_name["']/i.test(m));
  const lang = html.match(/<html\b[^>]*\blang\s*=\s*["']([a-z]{2})/i)?.[1]?.toLowerCase();
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  const feedTag = links.find((l) => /rel\s*=\s*["'][^"']*alternate/i.test(l) && /type\s*=\s*["']application\/(rss|atom)\+xml["']/i.test(l));
  const href = feedTag && attr(feedTag, 'href');
  let feed: string | undefined;
  if (href) try { feed = new URL(decode(href), base).href; } catch { /* href quebrado */ }
  return { title: title ? decode(title) : undefined, siteName: og ? decode(attr(og, 'content') ?? '') || undefined : undefined, lang, feed };
}

/**
 * Nome no padrão do cadastro ("Agência Brasil: Saúde"): o título vem como "Seção | Site" ou "Seção - Site | Site";
 * tira repetições e põe o site na frente quando a seção é curta.
 */
export function niceName(title: string | undefined, siteName: string | undefined, host: string) {
  const segs: string[] = [];
  for (const s of [...(title ?? '').split(/\s+[|–—-]\s+/), siteName ?? ''].map((x) => x.trim()).filter(Boolean)) {
    if (!segs.some((x) => x.toLowerCase() === s.toLowerCase())) segs.push(s);
  }
  if (!segs.length) return host;
  if (segs.length === 1) return segs[0].slice(0, 90);
  const site = segs[segs.length - 1], rest = segs.slice(0, -1).join(' · ');
  return (rest.split(/\s+/).length <= 4 ? `${site}: ${rest}` : rest).slice(0, 90);
}

/** rascunho só a partir do link (sem rede): serve de base e de teste */
export function draftFromUrl(u: URL, page: { title?: string; siteName?: string; lang?: string; feed?: string } = {}, known = { pillars: [] as number[], series: [] as number[] }) {
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const rule = RULES.find((r) => r.test(host, u.pathname));
  const type: SourceType = rule?.type ?? (page.feed ? 'noticia' : 'outro');
  const language: Draft['language'] = rule?.language ?? (page.lang === 'pt' || /\.br$/.test(host) ? 'pt' : page.lang === 'es' ? 'es' : page.lang === 'en' ? 'en' : 'pt');
  const access: SourceAccess = rule?.access
    ?? (page.feed ? { method: 'rss', adapter: 'rss', endpoint: page.feed, filters: {} }
      : type === 'orgao-oficial' || type === 'livro-editora' || type === 'noticia' ? { method: 'pagina', adapter: 'html-diff', filters: {} }
        : { method: 'web', filters: {} });
  const name = rule?.name ?? niceName(page.title, page.siteName, host);
  const feeds = FEEDS[type];
  const keep = (l: number[], ok: number[]) => (ok.length ? l.filter((n) => ok.includes(n)) : l);
  const trust = rule?.trust ?? 2; // desconhecido: média (o Oliver ajusta)
  const draft: Draft = {
    id: slugify(name).slice(0, 40) || slugify(host),
    name, url: u.href, type, language, access, trust,
    // prioridade para as brasileiras (decisão do Oliver, 041)
    weight: rule?.weight ?? (language === 'pt' && trust === 3 ? 3 : 2),
    pillars: keep(feeds.pillars, known.pillars), series: keep(feeds.series, known.series),
    notes: '',
  };
  return { draft, matched: rule?.label };
}

/** POST /api/projects/:slug/sources/suggest — abre o link (8 s), lê título e feed, aplica as regras de domínio */
export async function suggestSource(slug: string, raw: string): Promise<SourceSuggestion> {
  const u = parseUrl(raw);
  if (!u) throw new Error('link inválido: cole o endereço completo (ex.: https://www.scielo.br/j/pcp/)');
  const refs = strategyRefs(slug);
  const known = { pillars: refs.pillars.map((p) => p.n), series: refs.series.map((s) => s.n) };
  const dup = listSources(slug).find((s) => normUrl(s.url) === normUrl(u.href));
  let ok = false, status: number | undefined, error: string | undefined, page: ReturnType<typeof readPage> = { title: undefined, siteName: undefined, lang: undefined, feed: undefined };
  let finalUrl = u;
  try {
    const r = await fetch(u.href, {
      redirect: 'follow', signal: AbortSignal.timeout(8000),
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' },
    });
    status = r.status; ok = r.ok;
    if (r.url) finalUrl = parseUrl(r.url) ?? u;
    const ct = r.headers.get('content-type') ?? '';
    if (/xml|rss|atom/.test(ct)) page = { ...page, feed: r.url || u.href };
    else if (/html|text\/plain/.test(ct) || !ct) page = readPage((await r.text()).slice(0, 400_000), r.url || u.href);
    if (!ok) error = r.status === 403 || r.status === 429 ? `o site recusou o acesso automático (${r.status}); abra no navegador para conferir` : `a página respondeu ${r.status}`;
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    error = /timeout|aborted/i.test(msg) ? 'a página não respondeu em 8 s' : `não abriu (${msg.slice(0, 120)})`;
  }
  // regras olham o link colado (o redirecionamento pode cair numa página genérica), o título vem da página final
  const { draft, matched } = draftFromUrl(u, page, known);
  if (finalUrl.hostname !== u.hostname) draft.notes = `redireciona para ${finalUrl.hostname}`;
  if (!ok) draft.notes = [draft.notes, `não conferido: ${error}`].filter(Boolean).join(' · ');
  return {
    url: u.href, ok, status, pageTitle: page.title ?? page.siteName, feed: page.feed, duplicateOf: dup?.id, matched, error,
    draft: { ...draft, ...(ok ? { verifiedAt: today() } : {}) },
  };
}
