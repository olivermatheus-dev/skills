// Instagram logado por um navegador de verdade (Chrome ou Edge instalados, sem tela, via Playwright): fora do navegador,
// as chamadas diretas da API respondem 429 ou redirecionam para a home. Abre o perfil com os cookies da conta secundária,
// rola a grade (pausa entre rolagens) e lê as respostas que o próprio site carrega:
//   grade do perfil → xdt_api__v1__feed__user_timeline_graphql_connection (data, legenda, curtidas, comentários, tipo)
//   aba Reels       → fetch__XDTUserDict.clips_connection (views dos reels)
import type { IgBrowseOpts, IgBrowseResult } from './types';

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

export interface IgHarvest { user: Any | null; timeline: Map<string, Any>; clips: Map<string, Any> }

/** procura, em qualquer JSON do site, o perfil pedido e as conexões da grade e da aba Reels (puro: testável) */
export function harvest(x: unknown, handle: string, acc: IgHarvest) {
  const h = handle.toLowerCase();
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
      } else if ((k === 'clips_connection' || /^xdt_api__v1__clips__user__connection/.test(k)) && Array.isArray(val?.edges)) {
        for (const e of val.edges) { const m = e?.node?.media; if (m?.code) acc.clips.set(m.code, m); }
      }
      visit(val, depth + 1);
    }
  };
  visit(x, 0);
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

export async function igBrowse(handle: string, cookies: { name: string; value: string }[], opt: IgBrowseOpts): Promise<IgBrowseResult> {
  const { chromium } = await import('playwright');
  const pause = opt.pauseMs ?? 2500;
  const maxScrolls = opt.maxScrolls ?? 25;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  let lastErr: unknown;
  for (const channel of ['chrome', 'msedge', undefined]) {
    try { browser = await chromium.launch({ channel, headless: true }); break; } catch (e) { lastErr = e; }
  }
  if (!browser) throw new Error(`não achei Chrome nem Edge para a coleta logada do Instagram (${String((lastErr as Error)?.message ?? lastErr).split('\n')[0]})`);
  const acc: IgHarvest = { user: null, timeline: new Map(), clips: new Map() };
  const errors: string[] = [];
  try {
    const ctx = await browser.newContext({ userAgent: UA, locale: 'pt-BR', viewport: { width: 1280, height: 900 } });
    await ctx.addCookies(cookies.map((c) => ({ ...c, domain: '.instagram.com', path: '/', secure: true, httpOnly: c.name === 'sessionid' })));
    const page = await ctx.newPage();
    page.on('response', async (r) => {
      const u = r.url();
      if (!/instagram\.com\/(api\/graphql|graphql\/query|api\/v1\/)/.test(u)) return;
      try { for (const j of parseChunks(await r.text())) harvest(j, handle, acc); } catch { /* resposta sem corpo */ }
    });
    const open = async (path: string) => {
      await page.goto(`https://www.instagram.com/${handle}/${path}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(pause + 1500);
      if (/\/accounts\/login|\/challenge\//.test(page.url())) throw new Error('sessão do Instagram recusada (expirou ou pediu verificação): entre de novo na conta secundária e salve os cookies em Configurações');
      // o começo da grade já vem no HTML
      for (const s of await page.$$eval('script[type="application/json"]', (els) => els.map((e) => e.textContent ?? ''))) {
        for (const j of parseChunks(s)) harvest(j, handle, acc);
      }
    };
    /** rola até `stop`, até o teto, ou até 3 rolagens seguidas sem nada novo (fim do perfil) */
    const scroll = async (stop: () => boolean, size: () => number, what: string) => {
      let idle = 0;
      for (let i = 0; i < maxScrolls && !stop(); i++) {
        const before = size();
        await page.mouse.wheel(0, 3500);
        await page.waitForTimeout(pause + Math.round(Math.random() * 800));
        idle = size() === before ? idle + 1 : 0;
        if (idle >= 3) return;
        if (i === maxScrolls - 1) errors.push(`${what}: parou no teto de ${maxScrolls} rolagens`);
      }
    };
    await open('');
    const tl = () => [...acc.timeline.values()];
    await scroll(() => opt.done(tl()), () => acc.timeline.size, 'grade');
    const need = opt.reels(tl());
    if (need.length) {
      await open('reels/');
      await scroll(() => need.every((c) => acc.clips.has(c)), () => acc.clips.size, 'aba Reels');
    }
    return { user: acc.user, timeline: tl(), clips: [...acc.clips.values()], errors };
  } finally {
    await browser.close();
  }
}
