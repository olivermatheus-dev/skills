// Fora da curva duplo: linhas de TODOS os concorrentes com `outlier` (perfil) e `outlierMercado`.
// Serve a ficha de um concorrente (que só tem os próprios snapshots) e qualquer tela que precise da medida de mercado.
import { useMemo } from 'react';
import { useCompetitors, useCompetitorsFeed } from '../../queries';
import { buildRows, groupSnapshots, withMarketOutlier, type Row } from './lib';

export type MarketRow = Row & { compId: string };

/** linhas de todos os concorrentes ativos, com as duas medidas; `rows` vazio enquanto carrega */
export function useMarketRows(slug: string) {
  const feed = useCompetitorsFeed(slug);
  const list = useCompetitors(slug);
  // só `kind` concorrente forma o mercado: referência, criador ou página de outro nicho não mexem na mediana
  const kinds = useMemo(() => new Map((list.data ?? []).map((c) => [c.data.id, c.data.kind])), [list.data]);
  const rows = useMemo<MarketRow[]>(() => withMarketOutlier((feed.data ?? []).flatMap((f) =>
    buildRows([...groupSnapshots(f.snapshots).values()], f.marks, (k) => k.split('-')[0]).map((r) => ({ ...r, compId: f.id }))),
    undefined, (r) => (kinds.get(r.compId) ?? 'concorrente') === 'concorrente'), [feed.data, kinds]);
  /** mk → linha com as duas medidas (cada concorrente tem o próprio mk; chave composta evita colisão entre perfis) */
  const byKey = useMemo(() => new Map(rows.map((r) => [`${r.compId}|${r.profileKey}|${r.mk}`, r])), [rows]);
  return { rows, byKey, loading: feed.isLoading || list.isLoading };
}
