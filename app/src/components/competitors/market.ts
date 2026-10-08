// Fora da curva duplo: linhas de TODOS os concorrentes com `outlier` (perfil) e `outlierMercado`.
// Serve a ficha de um concorrente (que só tem os próprios snapshots) e qualquer tela que precise da medida de mercado.
import { useMemo } from 'react';
import { useCompetitorsFeed } from '../../queries';
import { buildRows, groupSnapshots, withMarketOutlier, type Row } from './lib';

export type MarketRow = Row & { compId: string };

/** linhas de todos os concorrentes ativos, com as duas medidas; `rows` vazio enquanto carrega */
export function useMarketRows(slug: string) {
  const feed = useCompetitorsFeed(slug);
  const rows = useMemo<MarketRow[]>(() => withMarketOutlier((feed.data ?? []).flatMap((f) =>
    buildRows([...groupSnapshots(f.snapshots).values()], f.marks, (k) => k.split('-')[0]).map((r) => ({ ...r, compId: f.id })))), [feed.data]);
  /** mk → linha com as duas medidas (cada concorrente tem o próprio mk; chave composta evita colisão entre perfis) */
  const byKey = useMemo(() => new Map(rows.map((r) => [`${r.compId}|${r.profileKey}|${r.mk}`, r])), [rows]);
  return { rows, byKey, loading: feed.isLoading };
}
