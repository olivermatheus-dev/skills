// Coletor da Biblioteca de Anúncios da Meta (página pública, país BR, sem login, sem token, sem pagar).
// A página já vem com o JSON dos resultados embutido no HTML (<script type="application/json">) e, ao rolar,
// carrega mais por /api/graphql/ (mesmo formato: ad_library_main.search_results_connection). Lemos esse JSON,
// nunca o DOM. Grava companies/<slug>/competitors/<id>/ads/<AAAA-MM-DDTHH-mm-ss>.json (imutável).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { Ad, AdsSnapshot, P } from '../../schema';

const root = () => process.env.HUB_ROOT ?? fileURLToPath(new URL('../..', import.meta.url));
const adsDir = (slug: string, id: string) => join(P.competitor(slug, id), 'ads');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const LIB = 'https://www.facebook.com/ads/library/';

// ───────────────────────── normalização (pura, testável com fixture) ─────────────────────────

type Json = any;

/** acha todas as ocorrências de uma chave em qualquer profundidade */
function findKey(o: Json, key: string, out: Json[] = []): Json[] {
  if (!o || typeof o !== 'object') return out;
  if (key in o) out.push(o[key]);
  for (const v of Array.isArray(o) ? o : Object.values(o)) findKey(v, key, out);
  return out;
}

export interface LibraryPage { ads: Ad[]; total?: number; endCursor?: string | null; hasNext: boolean; pages: { id: string; name: string }[]; captcha: boolean }

const ymd = (sec: unknown) => {
  const n = Number(sec);
  if (!n || n < 1e8) return undefined;
  // dia no fuso de Brasília (a biblioteca exibe a data de lá)
  return new Date(n * 1000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
};
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);

/** um item de `collated_results` → Ad */
export function normalizeAd(r: Json): Ad | null {
  const id = str(String(r?.ad_archive_id ?? ''));
  if (!id) return null;
  const s = r.snapshot ?? {};
  const cards: Json[] = Array.isArray(s.cards) ? s.cards : [];
  const card = cards[0] ?? {};
  const video = (s.videos ?? [])[0] ?? card;
  const image = (s.images ?? [])[0] ?? card;
  const videoUrl = str(video?.video_hd_url) ?? str(video?.video_sd_url);
  const thumbnail = str(video?.video_preview_image_url) ?? str(image?.resized_image_url) ?? str(image?.original_image_url) ?? str(card?.resized_image_url) ?? str(card?.original_image_url);
  const fmt = String(s.display_format ?? '').toUpperCase();
  const type = cards.length > 1 || fmt === 'CAROUSEL' ? 'carrossel' : fmt === 'VIDEO' || (videoUrl && !(s.images ?? []).length) ? 'video' : thumbnail ? 'imagem' : 'desconhecido';
  const active = r.is_active !== false;
  const ad = {
    id,
    pageName: str(r.page_name) ?? str(s.page_name),
    pageId: str(String(r.page_id ?? s.page_id ?? '')),
    active,
    startedAt: ymd(r.start_date),
    endedAt: active ? undefined : ymd(r.end_date),
    platforms: (Array.isArray(r.publisher_platform) ? r.publisher_platform : []).map((p: string) => String(p).toLowerCase()),
    text: str(s.body?.text) ?? str(card.body),
    title: str(s.title) ?? str(card.title),
    description: str(s.link_description) ?? str(card.link_description),
    cta: str(s.cta_text) ?? str(card.cta_text),
    linkUrl: str(s.link_url) ?? str(card.link_url),
    media: { type: type as Ad['media']['type'], thumbnail, videoUrl },
    variations: Number.isInteger(r.collation_count) && r.collation_count >= 0 ? r.collation_count : undefined,
    url: `${LIB}?id=${id}`,
  };
  return Ad.parse(ad);
}

/** `search_results_connection` (do HTML ou de uma resposta graphql) → anúncios únicos + total + cursor */
export function normalizeConnection(conn: Json): Pick<LibraryPage, 'ads' | 'total' | 'endCursor' | 'hasNext'> {
  const seen = new Set<string>();
  const ads: Ad[] = [];
  for (const e of conn?.edges ?? []) for (const r of e?.node?.collated_results ?? []) {
    const ad = normalizeAd(r);
    if (ad && !seen.has(ad.id)) { seen.add(ad.id); ads.push(ad); }
  }
  const total = Number.isInteger(conn?.count) ? conn.count : undefined;
  return { ads, total, endCursor: conn?.page_info?.end_cursor ?? null, hasNext: !!conn?.page_info?.has_next_page };
}

/** JSON já parseado (script do HTML ou resposta graphql) → página de resultados, ou null se não for da biblioteca */
export function normalizeAdsLibrary(json: Json): LibraryPage | null {
  const conn = findKey(json, 'search_results_connection')[0];
  if (!conn) return null;
  const pages = (findKey(json, 'dynamic_filter_options')[0]?.pages ?? []).map((p: Json) => ({ id: String(p.key), name: String(p.display_name) }));
  const captcha = findKey(json, 'xfb_ad_library_is_captcha_required')[0] === true;
  return { ...normalizeConnection(conn), pages, captcha };
}

/** HTML da página → resultados embutidos (o servidor já entrega a 1ª leva dentro de <script type="application/json">) */
export function parseLibraryHtml(html: string): LibraryPage | null {
  let captcha = false;
  for (const m of html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) {
    if (!m[1].includes('search_results_connection')) continue;
    try {
      const j = JSON.parse(m[1]);
      const r = normalizeAdsLibrary(j);
      if (r) return r;
    } catch { /* script que não é o nosso */ }
  }
  if (/xfb_ad_library_is_captcha_required":true/.test(html)) captcha = true;
  return captcha ? { ads: [], hasNext: false, pages: [], captcha } : null;
}

/** corpo de uma resposta graphql (pode vir como várias linhas JSON) */
export function parseGraphqlBody(body: string): LibraryPage | null {
  for (const line of body.split('\n')) {
    if (!line.includes('search_results_connection') && !line.includes('dynamic_filter_options')) continue;
    try { const r = normalizeAdsLibrary(JSON.parse(line)); if (r) return r; } catch { /* próxima */ }
  }
  return null;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const words = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/** o nome da página bate com o concorrente? (igual, ou contém o nome como palavra inteira) */
export function pageMatches(pageName: string, names: string[]): boolean {
  const pn = norm(pageName), pw = words(pageName);
  return names.some((n) => {
    const nn = norm(n);
    if (nn.length < 3) return false;
    if (pn === nn) return true;
    const nw = words(n);
    return nw.length > 0 && nw.length <= pw.length && pw.some((_, i) => nw.every((w, k) => pw[i + k] === w));
  });
}

/** escolhe o pageId a partir de uma busca por palavra-chave: anúncios cujo pageName bate, senão a lista de páginas do filtro */
export function pickPage(res: Pick<LibraryPage, 'ads' | 'pages'>, names: string[]): { pageId: string; pageName: string } | undefined {
  const count = new Map<string, { n: number; name: string }>();
  for (const a of res.ads) if (a.pageId && a.pageName && pageMatches(a.pageName, names)) {
    const c = count.get(a.pageId) ?? { n: 0, name: a.pageName };
    c.n++; count.set(a.pageId, c);
  }
  const best = [...count.entries()].sort((a, b) => b[1].n - a[1].n)[0];
  if (best) return { pageId: best[0], pageName: best[1].name };
  const p = res.pages.find((x) => pageMatches(x.name, names));
  return p ? { pageId: p.id, pageName: p.name } : undefined;
}

// ───────────────────────── leitura das coletas gravadas ─────────────────────────

export function listAds(slug: string, compId: string): { file: string; data: AdsSnapshot }[] {
  const dir = adsDir(slug, compId);
  const abs = join(root(), dir);
  if (!existsSync(abs)) return [];
  const out: { file: string; data: AdsSnapshot }[] = [];
  for (const f of readdirSync(abs).filter((x) => x.endsWith('.json'))) {
    try { out.push({ file: join(dir, f).replace(/\\/g, '/'), data: AdsSnapshot.parse(JSON.parse(readFileSync(join(abs, f), 'utf8'))) }); } catch { /* arquivo ilegível: ignora */ }
  }
  return out.sort((a, b) => a.data.collectedAt.localeCompare(b.data.collectedAt) || a.file.localeCompare(b.file));
}
export const latestAds = (slug: string, compId: string) => listAds(slug, compId).at(-1);

// ───────────────────────── coleta ─────────────────────────

export interface AdsResult { id: string; ok: boolean; ads: number; total?: number; pageId?: string; pageName?: string; file?: string; errors: string[] }
export interface AdsOptions { max?: number; headless?: boolean }

function readCompetitor(slug: string, id: string): { name: string; handles: string[]; fbPageId?: string } {
  const f = join(root(), P.competitorFile(slug, id));
  if (!existsSync(f)) throw new Error(`concorrente não encontrado: ${slug}/${id}`);
  const m = readFileSync(f, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = (m ? parseYaml(m[1]) : {}) as { name?: string; profiles?: { platform: string; url?: string; handle?: string }[] };
  const handles: string[] = [];
  let fbPageId: string | undefined;
  for (const p of fm.profiles ?? []) if (p.platform === 'facebook') {
    const u = p.url ?? '';
    const num = u.match(/[?&]id=(\d{6,})/)?.[1] ?? u.match(/-(\d{10,})\/?$/)?.[1] ?? (/^\d{10,}$/.test(p.handle ?? '') ? p.handle : undefined);
    if (num) fbPageId = num;
    if (p.handle && !/^\d+$/.test(p.handle)) handles.push(p.handle);
  }
  return { name: fm.name ?? id, handles, fbPageId };
}

const stamp = (d: Date) => d.toISOString().slice(0, 19);

const keywordUrl = (q: string) => `${LIB}?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(q)}&search_type=keyword_unordered&media_type=all`;
const pageUrl = (pageId: string) => `${LIB}?active_status=active&ad_type=all&country=BR&view_all_page_id=${pageId}&search_type=page&media_type=all`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** abre uma URL da biblioteca, lê o JSON embutido e rola até `max` anúncios; nunca contorna login/captcha */
async function readLibrary(page: any, url: string, max: number, errors: string[]): Promise<LibraryPage> {
  const more: LibraryPage[] = [];
  const onResponse = async (r: any) => {
    if (!/\/api\/graphql/.test(r.url())) return;
    try { const p = parseGraphqlBody(await r.text()); if (p && p.ads.length) more.push(p); } catch { /* resposta sem corpo */ }
  };
  page.on('response', onResponse);
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    // banner de cookies: recusa os opcionais
    for (const label of [/recusar cookies opcionais/i, /decline optional cookies/i]) {
      const b = page.getByRole('button', { name: label }).first();
      if (await b.isVisible({ timeout: 800 }).catch(() => false)) { await b.click().catch(() => {}); break; }
    }
    const u = page.url();
    if (/login|checkpoint|captcha/i.test(u)) { errors.push(`a Meta pediu login/verificação (${u.slice(0, 80)}); coleta interrompida`); return { ads: [], hasNext: false, pages: [], captcha: true }; }
    const first = parseLibraryHtml(await page.content());
    if (!first) {
      errors.push(`a página não trouxe resultados embutidos (HTTP ${resp?.status() ?? '?'})`);
      return { ads: [], hasNext: false, pages: [], captcha: false };
    }
    if (first.captcha) { errors.push('a Meta exigiu captcha; coleta interrompida'); return first; }
    const byId = new Map<string, Ad>(first.ads.map((a) => [a.id, a]));
    let hasNext = first.hasNext, idle = 0;
    const pages = [...first.pages];
    for (let i = 0; i < 30 && byId.size < max && hasNext && idle < 2; i++) {
      const before = byId.size, seen = more.length;
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      for (let w = 0; w < 12 && more.length === seen; w++) await page.waitForTimeout(500);
      for (const p of more.splice(0)) { for (const a of p.ads) if (!byId.has(a.id)) byId.set(a.id, a); hasNext = p.hasNext; pages.push(...p.pages); }
      idle = byId.size === before ? idle + 1 : 0;
      await page.waitForTimeout(700);
    }
    return { ads: [...byId.values()].slice(0, max), total: first.total, hasNext, pages, captcha: false };
  } finally {
    page.off('response', onResponse);
  }
}

async function downloadThumbs(ads: Ad[], slug: string, compId: string) {
  const { extFromType } = await import('./runner');
  const dir = join(root(), P.competitor(slug, compId), 'media', 'ads');
  mkdirSync(dir, { recursive: true });
  let i = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (i < ads.length) {
      const ad = ads[i++];
      const url = ad.media.thumbnail;
      if (!url || !/^https?:/.test(url)) continue;
      const have = ['jpg', 'png', 'webp', 'gif'].find((e) => existsSync(join(dir, `${ad.id}.${e}`)));
      if (have) { ad.media.thumbnailLocal = `media/ads/${ad.id}.${have}`; continue; }
      try {
        const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) });
        if (!r.ok) continue;
        const ext = extFromType(r.headers.get('content-type') ?? '', url);
        const buf = Buffer.from(await r.arrayBuffer());
        if (!ext || !buf.length || buf.length > 15 * 1024 * 1024) continue;
        writeFileSync(join(dir, `${ad.id}.${ext}`), buf);
        ad.media.thumbnailLocal = `media/ads/${ad.id}.${ext}`;
      } catch { /* miniatura é opcional */ }
    }
  }));
}

export async function collectAds(slug: string, compId: string, opt: AdsOptions = {}): Promise<AdsResult> {
  const errors: string[] = [];
  const res: AdsResult = { id: compId, ok: false, ads: 0, errors };
  const max = opt.max ?? 30;
  let browser: any;
  try {
    const comp = readCompetitor(slug, compId);
    const names = [comp.name, ...comp.handles.map((h) => h.split('.')[0]).filter((h) => h.length >= 4)];
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: opt.headless ?? true });
    const ctx = await browser.newContext({ locale: 'pt-BR', userAgent: UA, viewport: { width: 1400, height: 1000 } });
    const page = await ctx.newPage();

    let pageId = comp.fbPageId, pageName: string | undefined;
    let query: string | undefined;
    let lib: LibraryPage | undefined;
    if (!pageId) {
      query = comp.name;
      const kw = await readLibrary(page, keywordUrl(query), max, errors);
      if (errors.length) { res.errors = errors; return res; }
      const picked = pickPage(kw, names);
      if (picked) ({ pageId, pageName } = picked);
      else { lib = { ...kw, ads: [], total: 0 }; errors.push(`nenhuma página de anunciante com o nome "${comp.name}" entre os resultados (a biblioteca achou ${kw.total ?? 0} anúncios que só citam o termo)`); }
    }
    if (pageId) {
      lib = await readLibrary(page, pageUrl(pageId), max, errors);
      if (errors.length) { res.errors = errors; return res; }
      pageName = pageName ?? lib.ads[0]?.pageName ?? undefined;
    }
    const ads = lib?.ads ?? [];
    await downloadThumbs(ads, slug, compId);
    const now = new Date();
    const snap = AdsSnapshot.parse({ schema: 1, collectedAt: stamp(now) + 'Z', source: 'meta-ads-library', country: 'BR', query, pageId, pageName, total: pageId ? lib?.total : 0, max, truncada: ads.length >= max || !!lib?.hasNext, ads, errors });
    const rel = join(adsDir(slug, compId), `${stamp(now).replace(/:/g, '-')}.json`);
    mkdirSync(dirname(join(root(), rel)), { recursive: true });
    writeFileSync(join(root(), rel), JSON.stringify(snap, null, 2) + '\n');
    return { id: compId, ok: true, ads: ads.length, total: snap.total ?? undefined, pageId, pageName, file: rel.replace(/\\/g, '/'), errors };
  } catch (e) {
    errors.push((e as Error).message);
    return res;
  } finally {
    await browser?.close().catch(() => {});
  }
}

/** várias coleções em sequência, com pausa entre concorrentes (≥ 3 s) */
export async function collectAdsAll(slug: string, ids: string[], opt: AdsOptions = {}, onEach?: (r: AdsResult) => void): Promise<AdsResult[]> {
  const out: AdsResult[] = [];
  for (const [i, id] of ids.entries()) {
    if (i) await sleep(Number(process.env.INTEL_ADS_PAUSE_MS ?? 4000));
    const r = await collectAds(slug, id, opt);
    out.push(r); onEach?.(r);
    if (r.errors.some((e) => /login|captcha|verifica/i.test(e))) break; // bloqueio: para tudo
  }
  return out;
}
