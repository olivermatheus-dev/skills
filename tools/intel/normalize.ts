// Normalizadores PUROS: JSON/HTML bruto de cada fonte → Snapshot do schema. Sem rede, sem disco: testáveis com fixtures.
import type { ItemDraft, SnapshotDraft } from './types';

type Any = Record<string, any>;
type ProfileDraft = NonNullable<SnapshotDraft['profile']>;

// ---------- utilitários ----------
/** inteiro não negativo ou undefined (aceita "123", 123.0; rejeita -1, que algumas fontes usam para "oculto") */
export function num(v: unknown): number | undefined {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const isUrl = (v: unknown): v is string => { try { return typeof v === 'string' && /^https?:/.test(new URL(v).protocol); } catch { return false; } };
const absUrl = (v: unknown, base: string) => { try { return typeof v === 'string' && v.trim() ? new URL(v.trim(), base).href : undefined; } catch { return undefined; } };

/** "12,3 mil", "1.2K", "3M", "1.234", "1,234" → número */
export function parseHumanCount(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const s = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  const m = s.match(/^([\d.,]+)\s*(k|mil|m|mi|mn|b|bi)?\b/);
  if (!m) return undefined;
  const mult = { k: 1e3, mil: 1e3, m: 1e6, mi: 1e6, mn: 1e6, b: 1e9, bi: 1e9 }[m[2] ?? ''] ?? 1;
  if (mult === 1) return num(m[1].replace(/[.,]/g, ''));
  return num(parseFloat(m[1].replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')) * mult);
}

/** timestamp (s) ou AAAAMMDD → ISO */
export function publishedFrom(e: Any): string | undefined {
  const ts = num(e.timestamp) ?? num(e.release_timestamp);
  if (ts) return new Date(ts * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
  const d = str(e.upload_date) ?? str(e.release_date);
  if (d && /^\d{8}$/.test(d)) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return undefined;
}

/** maior thumbnail da lista (yt-dlp: [{url,width,height,preference}]) */
export function bestThumb(e: Any): string | undefined {
  const list: Any[] = Array.isArray(e.thumbnails) ? e.thumbnails.filter((t: Any) => isUrl(t?.url)) : [];
  if (list.length) {
    const area = (t: Any) => (num(t.width) ?? 0) * (num(t.height) ?? 0);
    const sized = list.filter((t) => area(t) > 0);
    if (sized.length) return sized.sort((a, b) => area(b) - area(a))[0].url;
    return list.at(-1)!.url;
  }
  return isUrl(e.thumbnail) ? e.thumbnail : undefined;
}

/** "PT1H2M3S" → 3723 */
export function isoDuration(s: unknown): number | undefined {
  const m = typeof s === 'string' ? s.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/) : null;
  if (!m) return undefined;
  return (+(m[1] ?? 0)) * 86400 + (+(m[2] ?? 0)) * 3600 + (+(m[3] ?? 0)) * 60 + (+(m[4] ?? 0));
}

const nowIso = (d: Date) => d.toISOString().replace(/\.\d+Z$/, 'Z');
const dedupe = (items: ItemDraft[]) => { const seen = new Set<string>(); return items.filter((i) => !seen.has(i.id) && seen.add(i.id)); };

/** entrada genérica do yt-dlp → item */
export function ytdlpEntry(e: Any, fallbackUrl: (id: string) => string, type: ItemDraft['type'] = 'video'): ItemDraft | null {
  const id = str(e.id);
  if (!id) return null;
  const url = [e.webpage_url, e.url, e.original_url].find((u) => isUrl(u) && !/\.(mp4|m3u8)(\?|$)/.test(u)) ?? fallbackUrl(id);
  if (!isUrl(url)) return null;
  const title = str(e.title);
  const caption = str(e.description);
  return {
    id, url, type: e.live_status === 'was_live' || e.live_status === 'is_live' ? 'live' : type,
    title: title && title !== caption ? title : title?.slice(0, 140),
    caption,
    publishedAt: publishedFrom(e),
    durationS: typeof e.duration === 'number' && e.duration >= 0 ? e.duration : undefined,
    thumbnail: bestThumb(e),
    metrics: { views: num(e.view_count), likes: num(e.like_count), comments: num(e.comment_count), shares: num(e.repost_count), saves: num(e.save_count) },
  };
}

// ---------- YouTube via yt-dlp ----------
export interface YtdlpYoutubeInput {
  profileUrl: string;
  now: Date;
  /** `yt-dlp -J --flat-playlist <canal>/videos` */
  videos?: Any | null;
  /** `yt-dlp -J --flat-playlist <canal>/shorts` */
  shorts?: Any | null;
  /** `yt-dlp -j --skip-download <urls…>` (1 JSON por vídeo; traz curtidas, comentários e data exata) */
  deep?: Any[];
  errors?: string[];
}

export function youtubeChannelInfo(pl: Any): ProfileDraft {
  const thumbs: Any[] = Array.isArray(pl.thumbnails) ? pl.thumbnails : [];
  const byId = (re: RegExp) => thumbs.filter((t) => re.test(String(t.id ?? '')) && isUrl(t.url));
  const banner = byId(/banner_uncropped/)[0] ?? byId(/banner/).sort((a, b) => (num(b.width) ?? 0) - (num(a.width) ?? 0))[0];
  const avatar = byId(/avatar_uncropped/)[0] ?? byId(/avatar/).sort((a, b) => (num(b.width) ?? 0) - (num(a.width) ?? 0))[0];
  const uploaderId = str(pl.uploader_id) ?? str(pl.channel_handle);
  return {
    name: str(pl.channel) ?? str(pl.uploader) ?? str(pl.title)?.replace(/\s+-\s+(Videos|Vídeos|Shorts|Home|Início)$/i, ''),
    handle: uploaderId?.startsWith('@') ? uploaderId.slice(1) : uploaderId,
    bio: str(pl.description),
    avatar: avatar?.url,
    banner: banner?.url,
    followers: num(pl.channel_follower_count),
    links: [],
  };
}

export function normalizeYtdlpYoutube(i: YtdlpYoutubeInput): SnapshotDraft {
  const base = i.videos ?? i.shorts ?? {};
  const deep = new Map((i.deep ?? []).filter((d) => d?.id).map((d) => [String(d.id), d]));
  const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;
  const short = (id: string) => `https://www.youtube.com/shorts/${id}`;
  const fromTab = (pl: Any | null | undefined, type: 'video' | 'short') =>
    (Array.isArray(pl?.entries) ? pl!.entries : []).map((e: Any) => {
      const d = deep.get(String(e.id));
      const merged = d ? { ...e, ...d, view_count: d.view_count ?? e.view_count, thumbnails: e.thumbnails?.length ? e.thumbnails : d.thumbnails } : e;
      const isShort = type === 'short' || /\/shorts\//.test(String(e.url ?? ''));
      const it = ytdlpEntry({ ...merged, webpage_url: isShort ? short(e.id) : watch(e.id) }, isShort ? short : watch, isShort ? 'short' : 'video');
      if (it && d?.description && !e.description) it.caption = String(d.description);
      return it;
    }).filter(Boolean) as ItemDraft[];
  const profile = youtubeChannelInfo(base);
  if (!profile.followers && i.shorts) profile.followers = num(i.shorts.channel_follower_count);
  return {
    collectedAt: nowIso(i.now), platform: 'youtube', profileUrl: i.profileUrl, source: 'yt-dlp',
    profile, items: dedupe([...fromTab(i.videos, 'video'), ...fromTab(i.shorts, 'short')]), errors: i.errors ?? [],
  };
}

// ---------- YouTube Data API v3 ----------
export interface YoutubeApiInput {
  profileUrl: string;
  now: Date;
  /** item de channels.list (part=snippet,statistics,brandingSettings,contentDetails) */
  channel: Any;
  /** itens de videos.list (part=snippet,statistics,contentDetails) */
  videos: Any[];
  /** ids confirmados como Shorts (youtube.com/shorts/<id> responde 200) */
  shortIds?: Set<string>;
  errors?: string[];
}

export function normalizeYoutubeApi(i: YoutubeApiInput): SnapshotDraft {
  const sn = i.channel?.snippet ?? {}, st = i.channel?.statistics ?? {};
  const pickThumb = (t: Any = {}) => (t.maxres ?? t.standard ?? t.high ?? t.medium ?? t.default)?.url;
  const banner = str(i.channel?.brandingSettings?.image?.bannerExternalUrl);
  const items = (i.videos ?? []).map((v): ItemDraft | null => {
    const id = str(v.id);
    if (!id) return null;
    const isShort = i.shortIds?.has(id) ?? false;
    const live = v.liveStreamingDetails || v.snippet?.liveBroadcastContent === 'live';
    return {
      id, url: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
      type: live ? 'live' : isShort ? 'short' : 'video',
      title: str(v.snippet?.title), caption: str(v.snippet?.description), publishedAt: str(v.snippet?.publishedAt),
      durationS: isoDuration(v.contentDetails?.duration), thumbnail: pickThumb(v.snippet?.thumbnails),
      metrics: { views: num(v.statistics?.viewCount), likes: num(v.statistics?.likeCount), comments: num(v.statistics?.commentCount) },
    };
  }).filter(Boolean) as ItemDraft[];
  return {
    collectedAt: nowIso(i.now), platform: 'youtube', profileUrl: i.profileUrl, source: 'youtube-api',
    profile: {
      name: str(sn.title), handle: str(sn.customUrl)?.replace(/^@/, ''), bio: str(sn.description),
      avatar: pickThumb(sn.thumbnails), banner: banner ? `${banner}=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nfpr-rj` : undefined,
      followers: st.hiddenSubscriberCount ? undefined : num(st.subscriberCount), postsCount: num(st.videoCount), links: [],
    },
    items: dedupe(items), errors: i.errors ?? [],
  };
}

// ---------- TikTok ----------
/** perfil a partir do HTML de tiktok.com/@handle (__UNIVERSAL_DATA_FOR_REHYDRATION__ ou SIGI_STATE) */
export function parseTiktokProfileHtml(html: string, handle?: string): ProfileDraft | null {
  const grab = (id: string) => html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`))?.[1];
  let user: Any | undefined, stats: Any | undefined;
  try {
    const u = grab('__UNIVERSAL_DATA_FOR_REHYDRATION__');
    if (u) { const info = JSON.parse(u)?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo; user = info?.user; stats = info?.statsV2 ?? info?.stats; }
    const s = !user && grab('SIGI_STATE');
    if (s) { const j = JSON.parse(s); const k = handle ?? Object.keys(j?.UserModule?.users ?? {})[0]; user = j?.UserModule?.users?.[k]; stats = j?.UserModule?.stats?.[k]; }
  } catch { return null; }
  if (!user) return null;
  return {
    name: str(user.nickname), handle: str(user.uniqueId), bio: str(user.signature),
    avatar: [user.avatarLarger, user.avatarMedium, user.avatarThumb].find(isUrl),
    followers: num(stats?.followerCount), following: num(stats?.followingCount), postsCount: num(stats?.videoCount),
    verified: typeof user.verified === 'boolean' ? user.verified : undefined,
    links: [user.bioLink?.link].filter(Boolean).map((l: string) => (l.startsWith('http') ? l : `https://${l}`)),
  };
}

export interface TiktokInput { profileUrl: string; now: Date; handle?: string; list?: Any | null; profileHtml?: string | null; errors?: string[] }

export function normalizeTiktok(i: TiktokInput): SnapshotDraft {
  const entries: Any[] = Array.isArray(i.list?.entries) ? i.list!.entries : [];
  const handle = i.handle ?? str(entries[0]?.uploader) ?? str(i.list?.uploader);
  const vurl = (id: string) => `https://www.tiktok.com/@${handle ?? 'user'}/video/${id}`;
  const items = entries.map((e) => {
    // TikTok usa cover (vertical) — prefere "cover"/"originCover" sobre a "dynamicCover" animada
    const cover = (e.thumbnails ?? []).find((t: Any) => /^(cover|originCover)$/.test(String(t.id)) && isUrl(t.url))?.url;
    const it = ytdlpEntry({ ...e, webpage_url: isUrl(e.webpage_url) ? e.webpage_url : vurl(e.id) }, vurl, 'video');
    if (it && cover) it.thumbnail = cover;
    return it;
  }).filter(Boolean) as ItemDraft[];
  const fromHtml = i.profileHtml ? parseTiktokProfileHtml(i.profileHtml, handle) : null;
  const e0 = entries[0] ?? {};
  const profile: ProfileDraft = fromHtml ?? {
    name: str(e0.channel) ?? str(i.list?.title), handle, followers: num(e0.channel_follower_count), links: [],
  };
  return {
    collectedAt: nowIso(i.now), platform: 'tiktok', profileUrl: i.profileUrl, source: 'yt-dlp',
    profile, items: dedupe(items), errors: i.errors ?? [],
  };
}

// ---------- Instagram ----------
/** post do Apify (instagram-profile-scraper.latestPosts ou instagram-scraper resultsType=posts) → item */
export function apifyPost(p: Any): ItemDraft | null {
  const code = str(p.shortCode) ?? str(p.shortcode);
  const id = code ?? str(p.id);
  if (!id) return null;
  const url = isUrl(p.url) ? p.url : `https://www.instagram.com/p/${code ?? id}/`;
  const t = String(p.type ?? '').toLowerCase();
  const isReel = p.productType === 'clips' || /\/reels?\//.test(url);
  const type: ItemDraft['type'] = t === 'sidecar' ? 'carrossel' : t === 'video' ? (isReel || !p.productType ? 'reel' : 'video') : 'post';
  return {
    id, url, type,
    caption: str(p.caption),
    publishedAt: str(p.timestamp),
    durationS: typeof p.videoDuration === 'number' ? p.videoDuration : undefined,
    thumbnail: [p.displayUrl, p.images?.[0], p.thumbnailUrl].find(isUrl),
    metrics: { views: num(p.videoPlayCount) ?? num(p.videoViewCount), likes: num(p.likesCount), comments: num(p.commentsCount) },
  };
}

export interface ApifyInstagramInput { profileUrl: string; now: Date; result: Any[]; extraPosts?: Any[]; errors?: string[] }

export function normalizeApifyInstagram(i: ApifyInstagramInput): SnapshotDraft {
  const errors = [...(i.errors ?? [])];
  const prof = (i.result ?? []).find((r) => r && !r.error && (r.username || r.id));
  for (const r of i.result ?? []) if (r?.error) errors.push(`Apify: ${r.errorDescription ?? r.error}`);
  if (!prof) throw new Error(errors[0] ?? 'Apify não devolveu o perfil');
  if (prof.private) errors.push('perfil privado: só os dados públicos do perfil');
  const posts = [...(prof.latestPosts ?? []), ...(i.extraPosts ?? [])].map(apifyPost).filter(Boolean) as ItemDraft[];
  const links = [prof.externalUrl, ...(prof.externalUrls ?? []).map((l: Any) => l?.url)].filter(isUrl);
  return {
    collectedAt: nowIso(i.now), platform: 'instagram', profileUrl: i.profileUrl, source: 'apify',
    profile: {
      name: str(prof.fullName) ?? str(prof.username), handle: str(prof.username), bio: str(prof.biography),
      avatar: [prof.profilePicUrlHD, prof.profilePicUrl].find(isUrl),
      followers: num(prof.followersCount), following: num(prof.followsCount), postsCount: num(prof.postsCount),
      verified: typeof prof.verified === 'boolean' ? prof.verified : undefined, links: [...new Set(links)],
    },
    items: dedupe(posts), errors,
  };
}

/** perfil mínimo pelo og:description público ("1.234 seguidores, 56 seguindo, 78 publicações - …") */
export function parseInstagramOg(html: string): ProfileDraft | null {
  const meta = parseMeta(html);
  const d = meta['og:description'] ?? meta.description;
  if (!d) return null;
  const pick = (re: RegExp) => parseHumanCount(d.match(re)?.[1]);
  const followers = pick(/([\d.,]+\s*(?:k|mil|m|mi|mn|b)?)\s+(?:followers|seguidores)/i);
  if (followers == null) return null;
  const title = meta['og:title'] ?? '';
  return {
    name: title.replace(/\s*\(@[^)]+\).*$/, '').trim() || undefined,
    handle: title.match(/\(@([^)]+)\)/)?.[1],
    followers,
    following: pick(/([\d.,]+\s*(?:k|mil|m|mi|mn|b)?)\s+(?:following|seguindo)/i),
    postsCount: pick(/([\d.,]+\s*(?:k|mil|m|mi|mn|b)?)\s+(?:posts|publica[çc][õo]es|posts)/i),
    avatar: isUrl(meta['og:image']) ? meta['og:image'] : undefined,
    links: [],
  };
}

// --- Instagram sem token: embed público do perfil (/<user>/embed/) + embed de cada post (/p/<code>/embed/captioned/) ---
/** extrai o JSON do `contextJSON` que o Instagram embute nas páginas de embed (null se a página for outra coisa, ex.: casca de login) */
export function parseInstagramEmbedContext(html: string): Any | null {
  const m = html.match(/"contextJSON"\s*:\s*("(?:[^"\\]|\\.)*")/);
  if (!m) return null;
  try { return JSON.parse(JSON.parse(m[1])); } catch { return null; }
}

/** `shortcode_media` (do embed do perfil ou do post) → item. `extra` = shortcode_media do embed do post, com views/duração/tipo do vídeo */
export function publicIgPost(sm: Any, extra?: Any): ItemDraft | null {
  const code = str(sm?.shortcode);
  if (!code) return null;
  const m = { ...sm, ...(extra ?? {}) };
  const kind = String(m.__typename ?? '');
  const type: ItemDraft['type'] = kind === 'GraphSidecar' ? 'carrossel' : kind === 'GraphVideo' || m.is_video ? (m.product_type && m.product_type !== 'clips' ? 'video' : 'reel') : 'post';
  const ts = num(sm.taken_at_timestamp) ?? num(m.taken_at_timestamp);
  return {
    id: code, url: `https://www.instagram.com/${type === 'reel' ? 'reel' : 'p'}/${code}/`, type,
    caption: str(m.edge_media_to_caption?.edges?.[0]?.node?.text),
    publishedAt: ts ? new Date(ts * 1000).toISOString().replace(/\.\d+Z$/, 'Z') : undefined,
    durationS: typeof m.video_duration === 'number' ? Math.round(m.video_duration) : undefined,
    thumbnail: [m.display_url, m.thumbnail_src].find(isUrl),
    metrics: {
      views: num(m.video_view_count) ?? num(m.video_play_count),
      likes: m.like_and_view_counts_disabled ? undefined : num(m.edge_liked_by?.count) ?? num(m.edge_media_preview_like?.count),
      comments: num(m.edge_media_to_comment?.count) ?? num(m.edge_media_to_parent_comment?.count),
    },
  };
}

export interface PublicInstagramInput {
  profileUrl: string; now: Date;
  /** HTML de https://www.instagram.com/<user>/embed/ (UA de rastreador) */
  embedHtml: string;
  /** HTML de https://www.instagram.com/<user>/ (UA de rastreador): bio e "seguindo" saem do og:description */
  profileHtml?: string | null;
  /** HTML do embed de cada vídeo, por shortcode */
  postHtml?: Record<string, string>;
  errors?: string[];
}

export function normalizePublicInstagram(i: PublicInstagramInput): SnapshotDraft {
  const errors = [...(i.errors ?? [])];
  const c = parseInstagramEmbedContext(i.embedHtml)?.context;
  if (!c?.username) throw new Error('o Instagram não devolveu o embed do perfil (perfil privado, inexistente ou bloqueio temporário)');
  const og = i.profileHtml ? parseInstagramOg(i.profileHtml) : null;
  const desc = i.profileHtml ? (parseMeta(i.profileHtml).description ?? '') : '';
  const bio = desc.match(/ on Instagram: "([\s\S]*)"\s*$/)?.[1];
  const extras = new Map<string, Any>();
  for (const [code, html] of Object.entries(i.postHtml ?? {})) {
    const sm = parseInstagramEmbedContext(html)?.gql_data?.shortcode_media;
    if (sm) extras.set(code, sm); else errors.push(`detalhes do vídeo ${code}: embed sem dados`);
  }
  const items = (c.graphql_media ?? []).map((g: Any) => publicIgPost(g.shortcode_media, extras.get(g.shortcode_media?.shortcode))).filter(Boolean) as ItemDraft[];
  return {
    collectedAt: nowIso(i.now), platform: 'instagram', profileUrl: i.profileUrl, source: 'instagram-public',
    profile: {
      name: str(c.full_name) ?? og?.name ?? c.username, handle: c.username,
      bio: bio ? decodeEntities(bio) : undefined,
      avatar: [c.profile_pic_url, og?.avatar].find(isUrl),
      followers: num(c.followers_count) ?? og?.followers, following: og?.following, postsCount: num(c.posts_count) ?? og?.postsCount,
      verified: typeof c.verified === 'boolean' ? c.verified : undefined, links: [],
    },
    items: dedupe(items), errors,
  };
}

export function normalizeYtdlpInstagram(i: { profileUrl: string; now: Date; list: Any; errors?: string[] }): SnapshotDraft {
  const pl = i.list ?? {};
  const items = (pl.entries ?? []).map((e: Any) => ytdlpEntry(e, (id) => `https://www.instagram.com/p/${id}/`, e.duration ? 'reel' : 'post')).filter(Boolean) as ItemDraft[];
  return {
    collectedAt: nowIso(i.now), platform: 'instagram', profileUrl: i.profileUrl, source: 'yt-dlp',
    profile: { name: str(pl.uploader) ?? str(pl.title), handle: str(pl.uploader_id) ?? str(pl.id), links: [] },
    items: dedupe(items), errors: i.errors ?? [],
  };
}

// ---------- Site ----------
const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export const decodeEntities = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? m);

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) out[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return out;
}
/** <meta name|property=… content=…> → mapa (chaves em minúsculas) */
export function parseMeta(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of html.matchAll(/<meta\s[^>]*>/gi)) {
    const a = attrs(m[0]);
    const k = (a.property ?? a.name ?? a.itemprop ?? '').toLowerCase();
    if (k && a.content != null && !(k in out)) out[k] = a.content.trim();
  }
  return out;
}

const SOCIAL = /^https?:\/\/(www\.|m\.)?(instagram\.com|youtube\.com|youtu\.be|tiktok\.com|facebook\.com|linkedin\.com|x\.com|twitter\.com)\/[^\s"'#?]+/i;

export function parseSiteHtml(html: string, pageUrl: string): ProfileDraft {
  const meta = parseMeta(html);
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
  const icons = [...html.matchAll(/<link\s[^>]*>/gi)].map((m) => attrs(m[0])).filter((a) => /icon/i.test(a.rel ?? '') && a.href);
  const rank = (a: Record<string, string>) => (/apple-touch/i.test(a.rel) ? 3 : /\.svg/i.test(a.href) ? 0 : parseInt(a.sizes ?? '0', 10) >= 96 ? 2 : 1);
  const icon = icons.sort((a, b) => rank(b) - rank(a))[0];
  const links = [...new Set([...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)]
    .map((m) => absUrl(decodeEntities(m[1]), pageUrl))
    .filter((u): u is string => !!u && SOCIAL.test(u) && !/\/(share|sharer|intent|embed)/i.test(u))
    .map((u) => u.replace(/\/$/, '')))].slice(0, 20);
  return {
    name: meta['og:site_name'] || meta['og:title'] || title || new URL(pageUrl).hostname,
    handle: new URL(pageUrl).hostname.replace(/^www\./, ''),
    bio: meta['og:description'] || meta.description || meta['twitter:description'] || undefined,
    banner: absUrl(meta['og:image'] || meta['twitter:image'], pageUrl),
    avatar: absUrl(icon?.href ?? '/favicon.ico', pageUrl),
    links,
  };
}

export function normalizeSite(i: { profileUrl: string; finalUrl?: string; now: Date; html: string; errors?: string[] }): SnapshotDraft {
  return {
    collectedAt: nowIso(i.now), platform: 'site', profileUrl: i.profileUrl, source: 'html',
    profile: parseSiteHtml(i.html, i.finalUrl ?? i.profileUrl), items: [], errors: i.errors ?? [],
  };
}
