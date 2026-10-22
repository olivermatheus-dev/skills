// Instagram logado por um navegador de verdade (Chrome ou Edge instalados, sem tela, via Playwright): fora do navegador,
// as chamadas diretas da API respondem 429 ou redirecionam para a home. Abre o perfil com os cookies da conta secundária,
// rola a grade (pausa entre rolagens) e lê as respostas que o próprio site carrega:
//   grade do perfil → xdt_api__v1__feed__user_timeline_graphql_connection (data, legenda, curtidas, comentários, tipo)
//   aba Reels       → fetch__XDTUserDict.clips_connection (views dos reels)
// Coleta longa (igBackfill): em vez de rolar tudo desde o topo, repete a consulta que o site usa para a próxima página,
// de dentro da própria página, a partir do cursor onde o lote anterior parou.
import type { IgBackfillOpts, IgBackfillResult, IgBrowseOpts, IgBrowseResult } from './types';

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

export interface PageInfo { end: string | null; hasNext: boolean }
export interface IgHarvest {
  user: Any | null; timeline: Map<string, Any>; clips: Map<string, Any>;
  /** última posição vista de cada conexão (onde continuar) */
  cur?: { timeline?: PageInfo; clips?: PageInfo };
}

const pageInfo = (c: Any): PageInfo | undefined => (c?.page_info ? { end: c.page_info.end_cursor ?? null, hasNext: !!c.page_info.has_next_page } : undefined);

/** procura, em qualquer JSON do site, o perfil pedido e as conexões da grade e da aba Reels (puro: testável).
 *  Devolve a posição (page_info) das conexões encontradas NESTE JSON. */
export function harvest(x: unknown, handle: string, acc: IgHarvest): { timeline?: PageInfo; clips?: PageInfo } {
  const h = handle.toLowerCase();
  const found: { timeline?: PageInfo; clips?: PageInfo } = {};
  const visit = (v: unknown, depth: number) => {
    if (!v || typeof v !== 'object' || depth > 60) return;
    if (Array.isArray(v)) { for (const i of v) visit(i, depth + 1); return; }
    const o = v as Any;
    if (String(o.username ?? '').toLowerCase() === h && (o.follower_count != null || o.edge_followed_by != null || o.media_count != null)) acc.user = { ...(acc.user ?? {}), ...o };
    for (const [k, val] of Object.entries(o)) {
      if (k === 'xdt_api__v1__feed__user_timeline_graphql_connection' && Array.isArray(val?.edges)) {
        for (const e of val.edges) {
          const n = e?.node;
          const owner = String(n?.user?.username ?? n?.owner?.username ?? h).toLowerCase();
          if (n?.code && owner === h && !acc.timeline.has(n.code)) acc.timeline.set(n.code, n);
        }
        found.timeline = pageInfo(val) ?? found.timeline;
      } else if ((k === 'clips_connection' || /^xdt_api__v1__clips__user__connection/.test(k)) && Array.isArray(val?.edges)) {
        for (const e of val.edges) { const m = e?.node?.media; if (m?.code) acc.clips.set(m.code, m); }
        found.clips = pageInfo(val) ?? found.clips;
      }
      visit(val, depth + 1);
    }
  };
  visit(x, 0);
  acc.cur = { ...acc.cur, ...found };
  return found;
}

/** respostas do site podem vir com "for (;;);" na frente ou várias linhas de JSON */
export function parseChunks(text: string): unknown[] {
  const out: unknown[] = [];
  for (const line of text.replace(/^for \(;;\);/, '').split('\n')) {
    const s = line.trim();
    if (s.startsWith('{') || s.startsWith('[')) { try { out.push(JSON.parse(s)); } catch { /* pedaço que não é JSON */ } }
  }
  return out;
}

/** consulta (POST do site) com `after` trocado: mesmo corpo, só a posição muda */
export function withCursor(body: string, after: string | null): string {
  const p = new URLSearchParams(body);
  const vars = JSON.parse(p.get('variables') ?? '{}');
  vars.after = after;
  if ('first' in vars) vars.first = 12;
  p.set('variables', JSON.stringify(vars));
  return p.toString();
}

export const IG_CHALLENGE = 'o Instagram pediu uma verificação na conta';
type Template = { url: string; body: string; headers: Record<string, string> };

/** navegador sem tela logado, com as respostas do site alimentando `acc` e os modelos das consultas da grade e da aba Reels */
async function session(handle: string, cookies: { name: string; value: string }[], pause: number) {
  const { chromium } = await import('playwright');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  let lastErr: unknown;
  for (const channel of ['chrome', 'msedge', undefined]) {
    try { browser = await chromium.launch({ channel, headless: true }); break; } catch (e) { lastErr = e; }
  }
  if (!browser) throw new Error(`não achei Chrome nem Edge para a coleta logada do Instagram (${String((lastErr as Error)?.message ?? lastErr).split('\n')[0]})`);
  const acc: IgHarvest = { user: null, timeline: new Map(), clips: new Map() };
  const tpl: { timeline?: Template; clips?: Template } = {};
  const ctx = await browser.newContext({ userAgent: UA, locale: 'pt-BR', viewport: { width: 1280, height: 900 } });
  await ctx.addCookies(cookies.map((c) => ({ ...c, domain: '.instagram.com', path: '/', secure: true, httpOnly: c.name === 'sessionid' })));
  const page = await ctx.newPage();
  page.on('response', async (r) => {
    const u = r.url();
    if (!/instagram\.com\/(api\/graphql|graphql\/query|api\/v1\/)/.test(u)) return;
    try {
      for (const j of parseChunks(await r.text())) {
        const f = harvest(j, handle, acc);
        const body = r.request().postData();
        if (body && r.request().method() === 'POST') for (const k of ['timeline', 'clips'] as const) if (f[k] && !tpl[k]) tpl[k] = { url: u, body, headers: r.request().headers() };
      }
    } catch { /* resposta sem corpo */ }
  });
  const open = async (path: string) => {
    await page.goto(`https://www.instagram.com/${handle}/${path}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(pause + 1500);
    // login, desafio ou "confirme seu contato" (accounts/update_risky_contactpoint): parar na hora, sem insistir
    if (/\/accounts\/|\/challenge\/|challenge_context|__coig_challenge/.test(page.url())) throw new Error(`sessão do Instagram recusada (${/contactpoint|challenge/.test(page.url()) ? IG_CHALLENGE : 'expirou'}): abra o Instagram com a conta secundária no navegador, resolva o aviso e salve os cookies de novo em Configurações`);
    // o começo da grade já vem no HTML
    for (const s of await page.$$eval('script[type="application/json"]', (els) => els.map((e) => e.textContent ?? ''))) {
      for (const j of parseChunks(s)) harvest(j, handle, acc);
    }
  };
  const wait = (ms: number) => page.waitForTimeout(ms);
  const wheel = () => page.mouse.wheel(0, 3500);
  /** repete a consulta `k` a partir de `after`, de dentro da página (mesmos cookies e cabeçalhos do site) */
  const replay = async (k: 'timeline' | 'clips', after: string | null): Promise<PageInfo | undefined> => {
    const t = tpl[k];
    if (!t) throw new Error(`não achei a consulta da ${k === 'timeline' ? 'grade' : 'aba Reels'} para continuar de onde parou`);
    const keep = ['content-type', 'x-csrftoken', 'x-ig-app-id', 'x-fb-lsd', 'x-asbd-id', 'x-fb-friendly-name', 'x-bloks-version-id', 'x-ig-www-claim', 'x-root-field-name'];
    const headers = Object.fromEntries(Object.entries(t.headers).filter(([h]) => keep.includes(h)));
    const res = await page.evaluate(async ({ url, body, headers }) => {
      const r = await fetch(url, { method: 'POST', body, headers, credentials: 'include' });
      return { status: r.status, text: await r.text(), url: r.url };
    }, { url: t.url, body: withCursor(t.body, after), headers });
    if (res.status === 429) throw new Error('Instagram limitou as requisições (429)');
    if (res.status >= 400 || /\/accounts\/|challenge/.test(res.url)) throw new Error(res.status >= 400 ? `Instagram respondeu ${res.status}` : `sessão do Instagram recusada (${IG_CHALLENGE})`);
    let info: PageInfo | undefined;
    for (const j of parseChunks(res.text)) info = harvest(j, handle, acc)[k] ?? info;
    if (!info) throw new Error(`resposta sem a ${k === 'timeline' ? 'grade' : 'aba Reels'} (o Instagram pode ter mudado o site)`);
    return info;
  };
  return { acc, tpl, open, wait, wheel, replay, close: () => browser!.close() };
}

export async function igBrowse(handle: string, cookies: { name: string; value: string }[], opt: IgBrowseOpts): Promise<IgBrowseResult> {
  const pause = opt.pauseMs ?? 2500;
  const maxScrolls = opt.maxScrolls ?? 25;
  const s = await session(handle, cookies, pause);
  const errors: string[] = [];
  try {
    /** rola até `stop`, até o teto, ou até 3 rolagens seguidas sem nada novo (fim do perfil) */
    const scroll = async (stop: () => boolean, size: () => number, what: string) => {
      let idle = 0;
      for (let i = 0; i < maxScrolls && !stop(); i++) {
        const before = size();
        await s.wheel();
        await s.wait(pause + Math.round(Math.random() * 800));
        idle = size() === before ? idle + 1 : 0;
        if (idle >= 3) return;
        if (i === maxScrolls - 1) errors.push(`${what}: parou no teto de ${maxScrolls} rolagens`);
      }
    };
    await s.open('');
    const tl = () => [...s.acc.timeline.values()];
    await scroll(() => opt.done(tl()), () => s.acc.timeline.size, 'grade');
    const need = opt.reels(tl());
    if (need.length) {
      await s.open('reels/');
      await scroll(() => need.every((c) => s.acc.clips.has(c)), () => s.acc.clips.size, 'aba Reels');
    }
    return { user: s.acc.user, timeline: tl(), clips: [...s.acc.clips.values()], errors };
  } finally {
    await s.close();
  }
}

/**
 * Um LOTE da coleta longa: abre o perfil (1 rolagem para o site mostrar a consulta da grade), continua do `cursor` por até
 * `pages` páginas de 12 (pausa `pauseMs` + até 100% a mais entre elas) e, se pedido, busca as views dos reels na aba Reels
 * a partir do `clipsCursor`. Para antes se `stop` disser que já chegou na data alvo.
 */
export async function igBackfill(handle: string, cookies: { name: string; value: string }[], opt: IgBackfillOpts): Promise<IgBackfillResult> {
  const pause = opt.pauseMs ?? 6000;
  const jitter = () => pause + Math.round(Math.random() * pause);
  const s = await session(handle, cookies, 2500);
  const errors: string[] = [];
  try {
    await s.open('');
    for (let i = 0; i < 4 && !s.tpl.timeline; i++) { await s.wheel(); await s.wait(jitter()); }
    let cur: PageInfo = opt.cursor ? { end: opt.cursor, hasNext: true } : (s.acc.cur?.timeline ?? { end: null, hasNext: false });
    const seen = new Set(s.acc.timeline.keys()); // topo do perfil (já conhecido): fora do lote quando há cursor
    const lote = () => [...s.acc.timeline.values()].filter((n) => !opt.cursor || !seen.has(n.code));
    for (let i = 0; i < opt.pages && cur.hasNext && cur.end && !opt.stop(lote()); i++) {
      await s.wait(jitter());
      try { cur = (await s.replay('timeline', cur.end)) ?? cur; } catch (e) { errors.push(`grade: ${(e as Error).message}`); if (/429|verificação|recusada/.test((e as Error).message)) throw e; break; }
    }
    const timeline = lote();
    let clipsCur: PageInfo | undefined;
    const want = new Set(timeline.filter((n) => n.media_type === 2).map((n) => String(n.code)));
    if (opt.clips && want.size) {
      await s.wait(jitter());
      await s.open('reels/');
      for (let i = 0; i < 4 && !s.tpl.clips; i++) { await s.wheel(); await s.wait(jitter()); }
      clipsCur = opt.clipsCursor ? { end: opt.clipsCursor, hasNext: true } : s.acc.cur?.clips;
      for (let i = 0; i < opt.pages + 2 && clipsCur?.hasNext && clipsCur.end && ![...want].every((c) => s.acc.clips.has(c)); i++) {
        await s.wait(jitter());
        try { clipsCur = (await s.replay('clips', clipsCur.end)) ?? clipsCur; } catch (e) { errors.push(`aba Reels: ${(e as Error).message}`); if (/429|verificação|recusada/.test((e as Error).message)) throw e; break; }
      }
    }
    return {
      user: s.acc.user, timeline, clips: [...s.acc.clips.values()].filter((c) => want.has(String(c.code))),
      cursor: cur.hasNext ? cur.end : null, hasNext: cur.hasNext, clipsCursor: clipsCur?.hasNext ? clipsCur.end : opt.clipsCursor ?? null, errors,
    };
  } finally {
    await s.close();
  }
}
