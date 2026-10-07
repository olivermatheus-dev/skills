// Adaptadores por plataforma: decidem COMO buscar (yt-dlp, API, Apify, HTML) e entregam o bruto aos normalizadores puros.
import type { Profile } from '../../schema';
import type { Adapter, AdapterCtx, SnapshotDraft } from './types';
import {
  normalizeYtdlpYoutube, normalizeYoutubeApi, normalizeTiktok, normalizeApifyInstagram, normalizeYtdlpInstagram,
  normalizeSite, parseInstagramOg,
} from './normalize';

type Any = Record<string, any>;
const msg = (e: unknown) => String((e as Error)?.message ?? e);
const parseJson = (txt: string, what: string) => { try { return JSON.parse(txt); } catch { throw new Error(`${what}: resposta não é JSON`); } };
/** saída de `yt-dlp -j` (1 JSON por linha) */
const parseLines = (txt: string) => txt.split(/\r?\n/).flatMap((l) => { try { return l.trim().startsWith('{') ? [JSON.parse(l)] : []; } catch { return []; } });
const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

async function pool<T, R>(list: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, list.length) }, async () => { while (i < list.length) { const k = i++; out[k] = await fn(list[k]); } }));
  return out;
}

/** detalhes completos (curtidas, comentários, data exata) de vários vídeos: `yt-dlp -j` em lotes paralelos */
async function deepInfo(urls: string[], ctx: AdapterCtx): Promise<{ infos: Any[]; error?: string }> {
  if (!urls.length) return { infos: [] };
  const errs: string[] = [];
  const res = await pool(chunk(urls, 10), 3, async (batch) => {
    try {
      return parseLines(await ctx.runner.ytdlp(['-j', '--skip-download', '--ignore-errors', '--ignore-no-formats-error', '--no-playlist', ...batch], { timeoutMs: 600_000, allowFail: true }));
    } catch (e) { errs.push(msg(e)); return []; }
  });
  return { infos: res.flat(), error: errs[0] };
}

// ---------- YouTube ----------
/** URL do canal sem a aba (…/@x/videos → …/@x). Link de vídeo → descobre o canal. */
async function youtubeChannelUrl(p: Profile, ctx: AdapterCtx): Promise<string> {
  const u = new URL(p.url);
  if (/^\/(watch|shorts\/)/.test(u.pathname) || u.hostname === 'youtu.be') {
    const info = parseJson(await ctx.runner.ytdlp(['-J', '--skip-download', '--ignore-no-formats-error', '--no-playlist', p.url]), 'yt-dlp');
    if (!info.channel_url) throw new Error('não achei o canal deste vídeo; cole o link do canal (youtube.com/@…)');
    return String(info.channel_url);
  }
  return `https://www.youtube.com${u.pathname.replace(/\/(videos|shorts|streams|featured|playlists|about|community)\/?$/, '').replace(/\/$/, '')}`;
}

async function youtubeViaYtdlp(p: Profile, ctx: AdapterCtx, pre: string[] = []): Promise<SnapshotDraft> {
  const base = await youtubeChannelUrl(p, ctx);
  const tab = async (name: 'videos' | 'shorts') => {
    try {
      return parseJson(await ctx.runner.ytdlp(['-J', '--flat-playlist', '--playlist-end', String(ctx.maxItems), '--extractor-args', 'youtubetab:approximate_date', `${base}/${name}`]), `yt-dlp ${name}`);
    } catch (e) { return { error: msg(e) }; }
  };
  const [videos, shorts] = await Promise.all([tab('videos'), tab('shorts')]);
  const errors = [...pre];
  const ok = (x: Any) => !x.error;
  if (!ok(videos) && !ok(shorts)) throw new Error(videos.error);
  // canal sem aba de Shorts (ou sem vídeos longos) é normal: só registra se não for "não tem a aba"
  for (const [n, x] of [['vídeos', videos], ['shorts', shorts]] as const) if (!ok(x) && !/does not have a .* tab|no .*tab/i.test(x.error)) errors.push(`aba ${n}: ${x.error}`);
  const list = [...(ok(videos) ? videos.entries ?? [] : []), ...(ok(shorts) ? shorts.entries ?? [] : [])];
  const limit = Number(ctx.env('INTEL_YT_DEEP') ?? list.length);
  const urls = list.slice(0, limit).map((e: Any) => `https://www.youtube.com/watch?v=${e.id}`);
  const deep = await deepInfo(urls, ctx);
  if (deep.error) errors.push(`detalhes (curtidas/comentários) parciais: ${deep.error}`);
  return normalizeYtdlpYoutube({ profileUrl: base, now: ctx.now, videos: ok(videos) ? videos : null, shorts: ok(shorts) ? shorts : null, deep: deep.infos, errors });
}

async function ytApi(path: string, params: Record<string, string>, key: string, ctx: AdapterCtx) {
  const qs = new URLSearchParams({ ...params, key }).toString();
  const r = await ctx.runner.fetchText(`https://www.googleapis.com/youtube/v3/${path}?${qs}`);
  const j = parseJson(r.text, 'YouTube API');
  if (r.status >= 400 || j.error) throw new Error(`YouTube API: ${j.error?.message ?? r.status}`);
  return j;
}

async function youtubeViaApi(p: Profile, ctx: AdapterCtx, key: string): Promise<SnapshotDraft> {
  const part = 'snippet,statistics,brandingSettings,contentDetails';
  const u = new URL(p.url);
  const seg = u.pathname.split('/').filter(Boolean);
  const q: Record<string, string> =
    p.externalId?.startsWith('UC') ? { id: p.externalId } : seg[0] === 'channel' ? { id: seg[1] }
      : seg[0] === 'user' ? { forUsername: seg[1] } : { forHandle: `@${(p.handle ?? seg[0] ?? seg[1] ?? '').replace(/^@/, '')}` };
  const ch = (await ytApi('channels', { part, ...q }, key, ctx)).items?.[0];
  if (!ch) throw new Error('YouTube API: canal não encontrado');
  const uploads = ch.contentDetails?.relatedPlaylists?.uploads;
  const want = ctx.maxItems * 2; // ~ o mesmo que N vídeos + N shorts do yt-dlp
  const ids: string[] = [];
  let token = '';
  while (uploads && ids.length < want) {
    const pl = await ytApi('playlistItems', { part: 'contentDetails', playlistId: uploads, maxResults: '50', ...(token ? { pageToken: token } : {}) }, key, ctx);
    ids.push(...(pl.items ?? []).map((i: Any) => i.contentDetails?.videoId).filter(Boolean));
    token = pl.nextPageToken;
    if (!token) break;
  }
  const videos = (await Promise.all(chunk(ids.slice(0, want), 50).map((c) =>
    ytApi('videos', { part: 'snippet,statistics,contentDetails,liveStreamingDetails', id: c.join(','), maxResults: '50' }, key, ctx)))).flatMap((r) => r.items ?? []);
  // A API não diz o que é Short: /shorts/<id> responde 200 para Short e redireciona os demais.
  const shortIds = new Set<string>();
  const candidates = videos.filter((v) => { const d = /PT(?:(\d+)M)?(?:(\d+)S)?$/.exec(v.contentDetails?.duration ?? ''); return d && !/H/.test(v.contentDetails.duration) && (+(d[1] ?? 0)) * 60 + (+(d[2] ?? 0)) <= 180; });
  await pool(candidates, 8, async (v) => {
    try { const r = await ctx.runner.fetchText(`https://www.youtube.com/shorts/${v.id}`, { method: 'HEAD', redirect: 'manual', timeoutMs: 10_000 }); if (r.status === 200) shortIds.add(v.id); } catch { /* fica como vídeo */ }
  });
  return normalizeYoutubeApi({ profileUrl: p.url, now: ctx.now, channel: ch, videos, shortIds });
}

export const youtube: Adapter = {
  platform: 'youtube',
  async collect(p, ctx) {
    const key = ctx.env('YOUTUBE_API_KEY');
    if (key) {
      try { return await youtubeViaApi(p, ctx, key); } catch (e) {
        return youtubeViaYtdlp(p, ctx, [`YouTube API falhou, usei yt-dlp: ${msg(e)}`]);
      }
    }
    return youtubeViaYtdlp(p, ctx);
  },
};

// ---------- TikTok ----------
const tiktokHandle = (p: Profile) => (p.handle ?? new URL(p.url).pathname.split('/').find((s) => s.startsWith('@'))?.slice(1))?.replace(/^@/, '');

export const tiktok: Adapter = {
  platform: 'tiktok',
  async collect(p, ctx) {
    const handle = tiktokHandle(p);
    if (!handle) throw new Error('não achei o @ do perfil no link do TikTok; cole tiktok.com/@perfil');
    const url = `https://www.tiktok.com/@${handle}`;
    const errors: string[] = [];
    const [list, html] = await Promise.all([
      ctx.runner.ytdlp(['-J', '--flat-playlist', '--playlist-end', String(ctx.maxItems), url]).then((t) => parseJson(t, 'yt-dlp')).catch((e) => { errors.push(`vídeos: ${msg(e)}`); return null; }),
      ctx.runner.fetchText(url).then((r) => { if (r.status < 400) return r.text; errors.push(`perfil: TikTok respondeu ${r.status}`); return null; }).catch((e) => { errors.push(`perfil: ${msg(e)}`); return null; }),
    ]);
    if (!list && !html) throw new Error(errors.join(' · '));
    // versões antigas do yt-dlp devolvem entradas "planas" sem métricas → completa com -j
    const entries: Any[] = list?.entries ?? [];
    if (entries.length && entries.filter((e) => e.view_count == null).length > entries.length / 2) {
      const deep = await deepInfo(entries.map((e) => e.url ?? `${url}/video/${e.id}`), ctx);
      if (deep.error) errors.push(`detalhes parciais: ${deep.error}`);
      const byId = new Map(deep.infos.map((d) => [String(d.id), d]));
      list.entries = entries.map((e) => ({ ...e, ...(byId.get(String(e.id)) ?? {}) }));
    }
    const snap = normalizeTiktok({ profileUrl: url, now: ctx.now, handle, list, profileHtml: html, errors });
    if (!snap.items?.length && !snap.profile?.followers) throw new Error(errors.join(' · ') || 'TikTok não devolveu dados (tente YTDLP_COOKIES_FROM_BROWSER=chrome no .env)');
    return snap;
  },
};

// ---------- Instagram ----------
export const IG_HELP = 'Instagram precisa de APIFY_TOKEN (recomendado, apify.com → Settings → Integrations) ou cookies do navegador para o yt-dlp (YTDLP_COOKIES_FROM_BROWSER=chrome) no .env';

async function apify(actor: string, input: Any, token: string, ctx: AdapterCtx): Promise<Any[]> {
  const r = await ctx.runner.fetchText(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?format=json&clean=true`, {
    method: 'POST', timeoutMs: 300_000, body: JSON.stringify(input),
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
  });
  const j = parseJson(r.text, 'Apify');
  if (r.status >= 400) throw new Error(`Apify ${r.status}: ${j?.error?.message ?? r.text.slice(0, 200)}`);
  return Array.isArray(j) ? j : [];
}

export const instagram: Adapter = {
  platform: 'instagram',
  async collect(p, ctx) {
    const handle = (p.handle ?? new URL(p.url).pathname.split('/').filter(Boolean)[0])?.replace(/^@/, '');
    if (!handle || ['p', 'reel', 'reels', 'tv'].includes(handle)) throw new Error('isto é link de post; cole o link do perfil (instagram.com/perfil)');
    const url = `https://www.instagram.com/${handle}/`;
    const token = ctx.env('APIFY_TOKEN');
    if (token) {
      // apify~instagram-profile-scraper: perfil + ~12 posts recentes por 1 execução (mais barato).
      const result = await apify('apify~instagram-profile-scraper', { usernames: [handle] }, token, ctx);
      let extraPosts: Any[] = [];
      const errors: string[] = [];
      const latest = result[0]?.latestPosts?.length ?? 0;
      if (ctx.env('APIFY_IG_EXTRA_POSTS') === '1' && ctx.maxItems > latest) {
        // apify~instagram-scraper (resultsType=posts) para passar dos ~12 posts — custa mais créditos, por isso é opcional.
        try { extraPosts = await apify('apify~instagram-scraper', { directUrls: [url], resultsType: 'posts', resultsLimit: ctx.maxItems, addParentData: false }, token, ctx); }
        catch (e) { errors.push(`posts extras: ${msg(e)}`); }
      }
      return normalizeApifyInstagram({ profileUrl: url, now: ctx.now, result, extraPosts, errors });
    }
    const errors: string[] = [];
    const [list, html] = await Promise.all([
      ctx.runner.ytdlp(['-J', '--flat-playlist', '--playlist-end', String(ctx.maxItems), url]).then((t) => parseJson(t, 'yt-dlp')).catch((e) => { errors.push(`yt-dlp: ${msg(e)}`); return null; }),
      ctx.runner.fetchText(url).then((r) => r.text).catch((e) => { errors.push(`perfil: ${msg(e)}`); return null; }),
    ]);
    const og = html ? parseInstagramOg(html) : null;
    if (list?.entries?.length) {
      const snap = normalizeYtdlpInstagram({ profileUrl: url, now: ctx.now, list, errors: [] });
      if (og) snap.profile = { ...snap.profile, ...og, handle };
      return snap;
    }
    if (og) return { collectedAt: ctx.now.toISOString().replace(/\.\d+Z$/, 'Z'), platform: 'instagram', profileUrl: url, source: 'html', profile: { ...og, handle }, items: [], errors: [`só dados públicos do perfil (sem posts). ${IG_HELP}`] };
    throw new Error(`${IG_HELP}. Detalhes: ${errors.join(' · ') || 'sem resposta'}`);
  },
};

// ---------- Site ----------
export const site: Adapter = {
  platform: 'site',
  async collect(p, ctx) {
    const r = await ctx.runner.fetchText(p.url);
    if (r.status >= 400) throw new Error(`site respondeu ${r.status}`);
    if (!/html/i.test(r.contentType) && !/<html|<head/i.test(r.text)) throw new Error('o link não é uma página HTML');
    return normalizeSite({ profileUrl: p.url, finalUrl: r.url, now: ctx.now, html: r.text });
  },
};

export const ADAPTERS: Record<string, Adapter> = { youtube, tiktok, instagram, site };
