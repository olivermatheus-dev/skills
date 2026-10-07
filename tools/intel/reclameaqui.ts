// Reclame Aqui por script: a página da empresa cai no desafio do Cloudflare, mas a busca abre num navegador real
// e traz o essencial de cada empresa (nota, % resolvidas, nº de reclamações, anos no RA). Confirmamos pelo domínio do site.
import type { Page } from 'playwright';

/** navegador "normal": sem isto o Cloudflare do RA mostra o desafio (o user-agent padrão do headless se denuncia) */
export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
export const BROWSER_ARGS = ['--disable-blink-features=AutomationControlled'];

export interface RaHit {
  found: boolean;
  url?: string; name?: string; domain?: string; segment?: string;
  score?: number; status?: string; solvedRate?: number; complaints?: number; years?: number;
  /** como achou: domínio igual ao do site, ou nome parecido (conferir) */
  match?: 'dominio' | 'nome';
  searchUrl: string;
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const num = (s?: string) => (s ? Number(s.replace(/\./g, '').replace(',', '.')) : undefined);
// faixas do índice do RA (nota de 0 a 10)
const statusOf = (n?: number) => (n == null ? 'Sem índice' : n >= 8 ? 'Ótimo' : n >= 7 ? 'Bom' : n >= 6 ? 'Regular' : n >= 5 ? 'Ruim' : 'Não recomendada');

export async function searchReclameAqui(page: Page, name: string, siteHost?: string): Promise<RaHit> {
  const searchUrl = `https://www.reclameaqui.com.br/busca/?q=${encodeURIComponent(name)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(3_500);
  // desafio do Cloudflare ("Um momento…"): às vezes resolve sozinho em alguns segundos
  for (let i = 0; i < 5 && /momento/i.test(await page.title()); i++) await page.waitForTimeout(3_000);
  if (/momento/i.test(await page.title())) throw new Error('bloqueado pelo Cloudflare (tente de novo mais tarde)');
  const text = (await page.evaluate('document.body.innerText')) as string;
  const hrefs = (await page.evaluate(`[...document.querySelectorAll('a')].filter((a) => /ver empresa/i.test(a.textContent || '')).map((a) => a.href)`)) as string[];
  const start = text.search(/Exibindo \d+ de \d+ empresas/);
  if (start < 0) return { found: false, searchUrl };
  const blocks = text.slice(start).split(/\n\s*Ver empresa\s*\n?/).slice(0, hrefs.length || 24);
  const host = siteHost?.replace(/^www\./, '').toLowerCase();
  const cards = blocks.map((b, i) => {
    const lines = b.split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => !/^Exibindo/.test(l));
    const di = lines.findIndex((l) => /^[a-z0-9.-]+\.[a-z]{2,}(\.[a-z]{2})?$/i.test(l));
    const sc = b.match(/\((\d+,\d) \/ 10\)/);
    return {
      url: hrefs[i], name: di > 0 ? lines[di - 1] : lines.find((l) => l.length > 2), domain: di >= 0 ? lines[di].toLowerCase() : undefined,
      segment: di >= 0 && !/^\(/.test(lines[di + 1] ?? '(') ? lines[di + 1] : undefined,
      score: num(sc?.[1]), solvedRate: num(b.match(/([\d,]+)% resolvidas/)?.[1]),
      complaints: num(b.match(/([\d.]+) reclama[cç][oõ]es/)?.[1]), years: num(b.match(/(\d+) anos? no RA/)?.[1]),
    };
  });
  let hit = host ? cards.find((c) => c.domain && (c.domain === host || host.endsWith(`.${c.domain}`) || c.domain.endsWith(`.${host}`))) : undefined;
  let match: RaHit['match'] = 'dominio';
  if (!hit) { hit = cards.find((c) => c.name && norm(c.name) === norm(name)); match = 'nome'; }
  if (!hit) return { found: false, searchUrl };
  return { found: true, ...hit, status: statusOf(hit.score), complaints: hit.complaints ?? 0, match, searchUrl };
}

/** Busca e grava: site/reclameaqui.json + o bloco `reclameAqui` do módulo reputacao (mantém lojas, menções e o resto). */
export async function updateReclameAqui(slug: string, id: string, page: Page): Promise<RaHit> {
  const S = await import('../../core/store');
  const { P } = await import('../../schema');
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const { join } = await import('node:path');
  const c = S.getCompetitor(slug, id).data;
  const site = c.profiles.find((p) => p.platform === 'site');
  const host = site ? new URL(site.url).hostname : undefined;
  const hit = await searchReclameAqui(page, c.name, host);
  const dir = join(S.ROOT, P.site(slug, id));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'reclameaqui.json'), `${JSON.stringify({ fetchedAt: S.nowIso(), ...hit }, null, 2)}\n`);

  const prev = S.getAnalysisResults(slug, id).reputacao;
  const pd = prev?.data as { reclameAqui?: { topComplaints?: string[] }; stores?: unknown[]; mentions?: unknown[]; summary?: string } | undefined;
  const auto = hit.found
    ? `Reclame Aqui: ${hit.status}${hit.score != null ? ` (${hit.score.toLocaleString('pt-BR')}/10)` : ''}, ${hit.complaints ?? 0} reclamações${hit.solvedRate != null ? `, ${hit.solvedRate}% resolvidas` : ''}${hit.years ? `, ${hit.years} anos no RA` : ''}${hit.match === 'nome' ? ' (achado pelo nome: conferir)' : ''}.`
    : 'Reclame Aqui: empresa não encontrada na busca.';
  const old = pd?.summary && !/403|bloque|reclame aqui/i.test(pd.summary) ? ` ${pd.summary}` : '';
  S.saveAnalysisResult(slug, id, {
    module: 'reputacao', by: prev?.by ?? 'script', confidence: hit.found && hit.match === 'dominio' ? 'alta' : 'media',
    sources: [...(prev?.sources ?? []).filter((s) => !s.url.includes('reclameaqui.com.br')), ...(hit.url ? [{ url: hit.url, title: 'Reclame Aqui' }] : []), { url: hit.searchUrl, title: 'Busca no Reclame Aqui' }],
    data: {
      stores: [], mentions: [], ...pd,
      reclameAqui: {
        found: hit.found, url: hit.url, score: hit.score, status: hit.status, complaints: hit.complaints, solvedRate: hit.solvedRate,
        period: hit.years ? `${hit.years} anos no RA` : undefined, topComplaints: pd?.reclameAqui?.topComplaints ?? [],
      },
      summary: `${auto}${old}`,
    },
  });
  return hit;
}

/** 1 concorrente, abrindo e fechando o navegador (rota do app). */
export async function runReclameAqui(slug: string, id: string) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true, args: BROWSER_ARGS });
  try { return await updateReclameAqui(slug, id, await (await browser.newContext({ locale: 'pt-BR', userAgent: UA })).newPage()); }
  finally { await browser.close(); }
}
