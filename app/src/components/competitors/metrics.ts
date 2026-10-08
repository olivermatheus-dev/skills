// Métricas de rede por perfil, a partir das coletas (última + anterior): o que um gestor de marketing compara.
import type { CompetitorFull } from '../../api';
import { groupSnapshots, median, type ProfileSeries } from './lib';

export interface ProfileMetrics {
  key: string;
  platform: string;
  url?: string;
  handle?: string;
  followers?: number;
  delta?: number;
  items: number;
  /** posts por semana, pela distância entre o mais antigo e o mais novo da última coleta */
  perWeek?: number;
  medViews?: number;
  medLikes?: number;
  /** (curtidas + comentários) ÷ seguidores, mediana dos itens */
  engFollowers?: number;
  /** formato com a maior mediana de views (ou curtidas) */
  topFormat?: { type: string; med: number; basis: 'views' | 'likes' };
  lastPost?: string;
  collectedAt?: string;
  source?: string;
  errors: string[];
}

export function profileMetrics(g: ProfileSeries): ProfileMetrics {
  const last = g.latest?.data;
  const items = last?.items ?? [];
  const f = last?.profile.followers;
  const prevF = g.all.slice(0, -1).reverse().find((s) => s.data.profile.followers != null)?.data.profile.followers;
  const dates = items.map((i) => i.publishedAt).filter(Boolean).map((d) => Date.parse(d!)).sort((a, b) => a - b);
  const spanDays = dates.length >= 2 ? (dates.at(-1)! - dates[0]) / 86_400_000 : 0;
  const views = items.map((i) => i.metrics.views).filter((v): v is number => !!v);
  const basis: 'views' | 'likes' = views.length >= items.length / 2 ? 'views' : 'likes';
  const byType = new Map<string, number[]>();
  for (const i of items) { const v = i.metrics[basis]; if (v) byType.set(i.type, [...(byType.get(i.type) ?? []), v]); }
  const top = [...byType].map(([type, xs]) => ({ type, med: median(xs) ?? 0, basis })).sort((a, b) => b.med - a.med)[0];
  return {
    key: g.key, platform: last?.platform ?? g.key.split('-')[0], handle: undefined,
    followers: f, delta: f != null && prevF != null ? f - prevF : undefined,
    items: items.length,
    perWeek: spanDays >= 1 ? ((dates.length - 1) / spanDays) * 7 : undefined,
    medViews: median(views), medLikes: median(items.map((i) => i.metrics.likes).filter((v): v is number => v != null)),
    engFollowers: f ? median(items.filter((i) => i.metrics.likes != null || i.metrics.comments != null).map((i) => ((i.metrics.likes ?? 0) + (i.metrics.comments ?? 0)) / f)) : undefined,
    topFormat: byType.size > 1 ? top : undefined,
    lastPost: dates.length ? new Date(dates.at(-1)!).toISOString() : undefined,
    collectedAt: last?.collectedAt, source: last?.source, errors: last?.errors ?? [],
  };
}

/** perfis de um concorrente (do feed) com métricas; só os que têm coleta */
export const metricsOf = (snapshots: CompetitorFull['snapshots']) => [...groupSnapshots(snapshots).values()].filter((g) => g.latest).map(profileMetrics);
