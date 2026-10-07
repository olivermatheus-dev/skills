// Resumo por concorrente para a lista (última coleta e seguidores da anterior, por perfil), sem carregar itens na tela.
import * as S from '../../core/store';
import { keyFor } from './keys';
import type { AnalysisOverview, CompetitorSummary, ProfileSummary } from './types';

export function summarizeCompetitor(slug: string, id: string, profiles = S.getCompetitor(slug, id).data.profiles): CompetitorSummary {
  const snaps = S.listSnapshots(slug, id); // já em ordem de collectedAt
  const out: ProfileSummary[] = profiles.map((p) => {
    const key = keyFor(p);
    const list = snaps.filter((s) => s.key === key);
    const last = list.at(-1)?.data;
    const prev = list.slice(0, -1).reverse().find((s) => s.data.profile.followers != null)?.data;
    return {
      key, platform: p.platform, url: p.url, handle: p.handle, snapshots: list.length,
      latest: last && { collectedAt: last.collectedAt, source: last.source, items: last.items.length, profile: last.profile, errors: last.errors },
      prevFollowers: prev?.profile.followers,
    };
  });
  const lastCollected = out.map((p) => p.latest?.collectedAt).filter(Boolean).sort().at(-1);
  return { id, profiles: out, lastCollected };
}

export const summarizeCompetitors = (slug: string) => S.listCompetitors(slug).map((c) => summarizeCompetitor(slug, c.data.id, c.data.profiles));

export function analysisOverview(slug: string): AnalysisOverview[] {
  return S.listCompetitors(slug).map(({ data: c }) => {
    const r = S.getAnalysisResults(slug, c.id) as Record<string, { updatedAt: string; data: any } | undefined>;
    const req = S.getAnalysisRequest(slug, c.id);
    const pr = r.precos?.data, ra = r.reputacao?.data;
    return {
      id: c.id, market: c.market ?? r.atuacao?.data.market,
      oneLiner: r.resumo?.data.oneLiner,
      fromMonthly: pr?.fromMonthly, currency: pr?.currency, publicPrice: pr?.publicPrice, priceModel: pr?.model, trial: pr?.trial, plans: pr?.plans.length,
      features: r.features?.data.groups.reduce((n: number, g: { items: unknown[] }) => n + g.items.length, 0),
      sections: r.landing?.data.sections.length,
      raScore: ra?.reclameAqui?.score, raFound: ra?.reclameAqui?.found,
      storeRating: ra?.stores.find((s: { rating?: number }) => s.rating != null)?.rating,
      strengths: r.forcas?.data.strengths.length, weaknesses: r.forcas?.data.weaknesses.length,
      request: req ? { modules: req.modules, status: req.status, requestedAt: req.requestedAt } : undefined,
      updated: Object.fromEntries(Object.entries(r).filter(([, v]) => v).map(([k, v]) => [k, v!.updatedAt])),
      hasNotes: Object.keys(S.getAnalysisNotes(slug, c.id)).length > 0,
    };
  });
}
