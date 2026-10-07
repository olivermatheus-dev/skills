// Módulo `site` (script, sem IA): abre o site do concorrente num navegador de verdade (Playwright, funciona com site em React),
// salva o texto limpo da home e das páginas-chave em competitors/<id>/site/*.md (fora do git) e grava:
//   analysis/site.json     páginas baixadas + sitemap básico (grupos de URLs)
//   analysis/contato.json  e-mails, telefones, WhatsApp, CNPJ e redes achados no HTML (só se não houver um feito pela IA)
//   site/extract.json      insumo para a IA: seções da home em ordem, trechos com preço, redes linkadas
// A IA lê esses .md (baratos) em vez de navegar o site de novo.
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright';
import * as S from '../../core/store';
import { detectLink } from '../../core/platform';
import { P } from '../../schema';
import type { SiteRunResult } from './types';
import { updateReclameAqui, UA, BROWSER_ARGS } from './reclameaqui';
export type { SiteRunResult } from './types';

const KEY_PAGES: [kind: string, re: RegExp][] = [
  ['precos', /pre[cç]o|planos?\b|pricing|assine|valores/i], // "assinatura" pega "assinatura digital"
  ['recursos', /funcionalidade|recursos|features|o-que-faz|produto|solu[cç][aã]o|ferramentas/i],
  ['sobre', /sobre|quem-somos|about|nossa-hist|empresa/i],
  ['contato', /contato|fale-conosco|contact|suporte|ajuda|atendimento/i],
  ['faq', /faq|d[uú]vidas|perguntas/i],
];
const GUESS: Record<string, string[]> = { precos: ['/precos', '/planos', '/pricing', '/preco'], recursos: ['/funcionalidades', '/recursos'] };

interface Extract {
  url: string; status: number; title: string; description: string; lang: string; text: string;
  headings: { level: number; text: string }[];
  sections: { tag: string; heading: string; snippet: string }[];
  links: { href: string; text: string }[];
  /** linhas que mudam ao clicar em "Anual" / "Mensal" (páginas de preço com alternador) */
  alt?: { label: string; lines: string[] }[];
}
const RE_PRICE_HINT = /R\$|US\$|€|\/m[eê]s|anual/i;

// rola até o fim para carregar seções preguiçosas (lazy load / animações on-scroll)
const SCROLL_JS = `(async () => {
  for (let y = 0; y < document.body.scrollHeight && y < 30000; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
})()`;
// título, descrição, idioma, títulos (h1–h4), blocos de topo em ordem (seções da LP), links e texto visível
const EXTRACT_JS = `(() => {
  const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const visible = (el) => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden'; };
  const headings = [...document.querySelectorAll('h1,h2,h3,h4')].filter(visible).map((h) => ({ level: Number(h.tagName[1]), text: clean(h.textContent) })).filter((h) => h.text).slice(0, 150);
  let blocks = [...document.querySelectorAll('section, header, footer')].filter((el) => visible(el) && !(el.parentElement && el.parentElement.closest('section, header, footer')));
  if (blocks.length < 3) {
    const root = document.querySelector('main') || document.body;
    blocks = [...root.querySelectorAll(':scope > *, :scope > * > *')].filter((el) => visible(el) && el.offsetHeight > 160 && clean(el.innerText).length > 40);
    blocks = blocks.filter((el) => !blocks.some((o) => o !== el && o.contains(el)));
  }
  const sections = blocks.slice(0, 40).map((el) => { const h = el.querySelector('h1,h2,h3'); return { tag: el.tagName.toLowerCase(), heading: clean(h && h.textContent), snippet: clean(el.innerText).slice(0, 320) }; });
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, text: clean(a.textContent).slice(0, 80) })).filter((l) => l.href.startsWith('http') || l.href.startsWith('mailto:') || l.href.startsWith('tel:'));
  const meta = document.querySelector('meta[name="description"]');
  return {
    title: document.title, description: (meta && meta.getAttribute('content')) || '',
    lang: document.documentElement.lang || '', text: (document.body.innerText || '').replace(/\\n{3,}/g, '\\n\\n').slice(0, 40000), headings, sections, links,
  };
})()`;

// alternador "Mensal | Anual" das páginas de preço: clica na opção e devolve o texto visível
const toggleJs = (re: string) => `(async () => {
  const re = new RegExp(${JSON.stringify(re)}, 'i');
  const els = [...document.querySelectorAll('button, label, [role=tab], [role=switch], [role=radio], span, div, p')]
    .filter((el) => re.test((el.textContent || '').trim()) && (el.textContent || '').trim().length < 40 && el.getBoundingClientRect().height > 0);
  const el = els[0];
  if (!el) return null;
  el.click();
  await new Promise((r) => setTimeout(r, 700));
  return document.body.innerText;
})()`;
async function toggles(page: Page, base: string) {
  const out: { label: string; lines: string[] }[] = [];
  const baseLines = new Set(base.split('\n').map((l) => l.trim()));
  for (const [label, re] of [['Anual', '^(plano )?anual(mente)?\\b|^yearly|^annual'], ['Mensal', '^(plano )?mensal(mente)?\\b|^monthly']] as const) {
    const t = (await page.evaluate(toggleJs(re)).catch(() => null)) as string | null;
    if (!t) continue;
    const lines = [...new Set(t.split('\n').map((l) => l.trim()).filter((l) => l && !baseLines.has(l)))].slice(0, 120);
    if (lines.length) out.push({ label, lines });
  }
  return out;
}

async function extract(page: Page, url: string, opt: { toggles?: boolean } = {}): Promise<Extract> {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35_000 });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
  // rola até o fim para carregar seções preguiçosas (lazy load / animações on-scroll)
  // código do navegador vai como texto: o tsx injeta helpers (__name) em funções TS, que não existem na página
  await page.evaluate(SCROLL_JS).catch(() => {});
  await page.waitForTimeout(400);
  const data = (await page.evaluate(EXTRACT_JS)) as Omit<Extract, 'url' | 'status'>;
  const alt = opt.toggles && RE_PRICE_HINT.test(data.text) ? await toggles(page, data.text) : [];
  return { url: page.url(), status: resp?.status() ?? 0, ...data, alt };
}

function toMd(kind: string, e: Extract) {
  return [
    `# ${kind} · ${e.title}`, '', `URL: ${e.url}`, e.description ? `Descrição: ${e.description}` : '', e.lang ? `Idioma: ${e.lang}` : '', '',
    '## Seções em ordem (do topo ao rodapé)', '',
    ...e.sections.map((s, i) => `${i + 1}. [${s.tag}] ${s.heading ? `**${s.heading}** — ` : ''}${s.snippet}`), '',
    '## Títulos', '', ...e.headings.map((h) => `${'  '.repeat(h.level - 1)}- h${h.level}: ${h.text}`), '',
    '## Texto da página', '', e.text,
    ...(e.alt ?? []).flatMap((a) => ['', `## Linhas que mudam com "${a.label}" selecionado (alternador de preço)`, '', ...a.lines]),
  ].join('\n');
}

// ---------- sitemap ----------
async function fetchText(url: string) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15_000) });
    return r.ok ? await r.text() : null;
  } catch { return null; }
}
async function sitemapUrls(origin: string) {
  const robots = await fetchText(`${origin}/robots.txt`);
  const maps = [...(robots?.matchAll(/^sitemap:\s*(\S+)/gim) ?? [])].map((m) => m[1]);
  if (!maps.length) maps.push(`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`);
  const urls = new Set<string>();
  const seen = new Set<string>();
  const queue = [...maps];
  while (queue.length && seen.size < 8 && urls.size < 3000) {
    const m = queue.shift()!;
    if (seen.has(m)) continue;
    seen.add(m);
    const xml = await fetchText(m);
    if (!xml || !xml.includes('<loc>')) continue;
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((x) => x[1].replace(/&amp;/g, '&'));
    if (/<sitemapindex/i.test(xml)) queue.push(...locs); else locs.forEach((u) => urls.add(u));
  }
  return [...urls];
}
function groupUrls(urls: string[], host: string) {
  const g = new Map<string, string[]>();
  for (const u of urls) {
    let path: string;
    try { const x = new URL(u); if (x.hostname.replace(/^www\./, '') !== host) continue; path = x.pathname; } catch { continue; }
    const seg = path.split('/').filter(Boolean)[0] ?? '';
    const name = seg ? `/${seg}` : '/';
    g.set(name, [...(g.get(name) ?? []), path]);
  }
  return [...g.entries()].map(([name, ps]) => ({ name, count: ps.length, sample: [...new Set(ps)].slice(0, 4) })).sort((a, b) => b.count - a.count).slice(0, 40);
}

// ---------- contatos e preços ----------
const RE = {
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  phone: /(?:\+?55\s?)?\(?\b\d{2}\)?\s?9?\d{4}[-.\s]\d{4}\b/g,
  cnpj: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
  price: /(?:R\$|US\$|\$|€|£)\s?\d{1,5}(?:[.,]\d{2,3})*(?:[.,]\d{2})?/g,
};
const uniq = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];
function contactsFrom(pages: Extract[]) {
  const text = pages.map((p) => p.text).join('\n');
  const links = pages.flatMap((p) => p.links);
  const emails = uniq([...(text.match(RE.email) ?? []), ...links.filter((l) => l.href.startsWith('mailto:')).map((l) => l.href.slice(7).split('?')[0])])
    .filter((e) => !/\.(png|jpe?g|webp|svg|gif)$/i.test(e) && !/sentry|example|wixpress|@2x/i.test(e)).map((e) => e.toLowerCase());
  const whatsapp = uniq(links.filter((l) => /wa\.me|whatsapp\.com\/send|api\.whatsapp/i.test(l.href)).map((l) => {
    const m = l.href.match(/(?:wa\.me\/|phone=)(\d{10,13})/); return m ? `+${m[1]}` : l.href;
  }));
  const phones = uniq([...(text.match(RE.phone) ?? []), ...links.filter((l) => l.href.startsWith('tel:')).map((l) => l.href.slice(4))]).slice(0, 8);
  const cnpj = text.match(RE.cnpj)?.[0];
  const socials = uniq(links.map((l) => l.href)).flatMap((href) => {
    const d = detectLink(href);
    return d && d.platform !== 'site' && d.kind === 'perfil' && !/share|sharer|intent|login/i.test(href) ? [{ platform: d.platform, url: d.url }] : [];
  }).filter((s, i, all) => all.findIndex((o) => o.url.toLowerCase() === s.url.toLowerCase()) === i);
  return { emails, whatsapp, phones, cnpj, socials };
}
function priceSnippets(pages: Extract[]) {
  const out: { page: string; line: string }[] = [];
  for (const p of pages) for (const line of p.text.split('\n')) if (RE.price.test(line) && out.length < 80) { out.push({ page: p.url, line: line.trim().slice(0, 200) }); RE.price.lastIndex = 0; }
  return out;
}

// ---------- execução ----------
export async function analyzeSite(slug: string, id: string, opt: { browser?: Browser } = {}): Promise<SiteRunResult> {
  const t0 = Date.now();
  const c = S.getCompetitor(slug, id).data;
  const site = c.profiles.find((p) => p.platform === 'site');
  const res: SiteRunResult = { id, ok: false, url: site?.url, pages: 0, sitemap: 0, contacts: 0, errors: [], ms: 0 };
  if (!site) { res.errors.push('sem site cadastrado: rode o módulo "perfis" ou cole o link do site no concorrente'); res.ms = Date.now() - t0; return res; }

  const { chromium } = await import('playwright');
  const browser = opt.browser ?? await chromium.launch({ headless: true, args: BROWSER_ARGS });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'pt-BR', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const dir = join(S.ROOT, P.site(slug, id));
  const pages: { kind: string; e: Extract }[] = [];
  try {
    const home = await extract(page, site.url, { toggles: true });
    if (home.status >= 400) res.errors.push(`home respondeu ${home.status}`);
    pages.push({ kind: 'home', e: home });
    const host = new URL(home.url).hostname.replace(/^www\./, '');
    const origin = new URL(home.url).origin;
    const internal = home.links.filter((l) => { try { const u = new URL(l.href); return u.hostname.replace(/^www\./, '') === host && u.pathname.length > 1; } catch { return false; } });

    for (const [kind, re] of KEY_PAGES) {
      const hit = internal.find((l) => re.test(new URL(l.href).pathname) || re.test(l.text));
      const candidates = hit ? [hit.href.split('#')[0]] : (GUESS[kind] ?? []).map((p) => origin + p);
      for (const url of candidates) {
        if (pages.some((p) => p.e.url.split('#')[0] === url)) break;
        try {
          const e = await extract(page, url, { toggles: kind === 'precos' });
          if (e.status < 400 && e.text.length > 200) { pages.push({ kind, e }); break; }
        } catch (err) { if (hit) res.errors.push(`${kind}: ${(err as Error).message.split('\n')[0]}`); }
      }
    }

    // grava o texto (substitui a extração anterior)
    if (existsSync(dir)) rmSync(dir, { recursive: true });
    mkdirSync(dir, { recursive: true });
    for (const p of pages) writeFileSync(join(dir, `${p.kind}.md`), toMd(p.kind, p.e));

    let urls = await sitemapUrls(origin);
    const source = urls.length ? 'sitemap.xml' as const : 'links' as const;
    if (!urls.length) urls = uniq(pages.flatMap((p) => p.e.links.map((l) => l.href.split('#')[0])));
    const groups = groupUrls(urls, host);
    const total = groups.reduce((n, g) => n + g.count, 0);

    const ct = contactsFrom(pages.map((p) => p.e));
    writeFileSync(join(dir, 'extract.json'), `${JSON.stringify({
      url: home.url, fetchedAt: S.nowIso(), lang: home.lang,
      homeSections: home.sections, prices: priceSnippets(pages.map((p) => p.e)), contacts: ct,
      sitemapGroups: groups,
    }, null, 2)}\n`);

    S.saveAnalysisResult(slug, id, {
      module: 'site', by: 'script', confidence: 'alta',
      sources: pages.map((p) => ({ url: p.e.url, title: p.e.title || undefined })),
      data: {
        url: home.url, rendered: true,
        pages: pages.map((p) => ({ url: p.e.url, kind: p.kind, file: `site/${p.kind}.md`, title: p.e.title || undefined, chars: p.e.text.length })),
        sitemap: { source: total ? source : 'nenhum', total, groups },
        errors: res.errors,
      },
    });
    // contato do script só entra se a IA ainda não fez um melhor
    const prev = S.getAnalysisResults(slug, id).contato;
    if (!prev || prev.by === 'script') {
      S.saveAnalysisResult(slug, id, {
        module: 'contato', by: 'script', confidence: 'media', sources: [{ url: home.url }],
        data: { emails: ct.emails, phones: ct.phones, whatsapp: ct.whatsapp, cnpj: ct.cnpj, socials: ct.socials },
      });
    }
    res.ok = true; res.pages = pages.length; res.sitemap = total;
    res.contacts = ct.emails.length + ct.phones.length + ct.whatsapp.length;
    S.clearAnalysisRequest(slug, id, ['site']);
    // Reclame Aqui (busca por script, ~5 s): alimenta o módulo reputacao sem gastar IA
    try { const ra = await updateReclameAqui(slug, id, page); res.ra = ra.found ? `${ra.status}${ra.score != null ? ` ${ra.score}` : ''} · ${ra.complaints} recl.` : 'não achado'; }
    catch (err) { res.errors.push(`Reclame Aqui: ${(err as Error).message.split('\n')[0]}`); }
  } catch (err) {
    res.errors.push((err as Error).message.split('\n')[0]);
  } finally {
    await ctx.close();
    if (!opt.browser) await browser.close();
    res.ms = Date.now() - t0;
  }
  return res;
}

/** Vários concorrentes reaproveitando 1 navegador. */
export async function analyzeSites(slug: string, ids: string[], onDone?: (r: SiteRunResult) => void) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true, args: BROWSER_ARGS });
  const out: SiteRunResult[] = [];
  try {
    for (const id of ids) { const r = await analyzeSite(slug, id, { browser }); out.push(r); onDone?.(r); }
  } finally { await browser.close(); }
  return out;
}
