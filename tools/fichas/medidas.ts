// Medidas do item no momento da análise: a MESMA conta do app (lib.tsx: buildRows + withMarketOutlier). Separado de lib.ts
// para o `npm run validate` não carregar o código do app.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Ficha, FichaMedidas } from '../../schema/ficha';
import { buildRows, groupSnapshots, withMarketOutlier, type Row } from '../../app/src/components/competitors/lib';
import { ROOT, findItem, readSnapshots } from './lib';
import { novaFichaAnuncio } from './anuncios';

let rowsCache: (Row & { comp: string })[] | null = null;
export function marketRows(slug: string) {
  if (rowsCache) return rowsCache;
  const dir = join(ROOT, 'companies', slug, 'competitors');
  const all: (Row & { comp: string })[] = [];
  for (const c of readdirSync(dir).filter((x) => statSync(join(dir, x)).isDirectory())) {
    const snaps = readSnapshots(slug, c);
    all.push(...buildRows([...groupSnapshots(snaps as never).values()], {}, (k) => k.split('-')[0]).map((x) => ({ ...x, comp: c })));
  }
  return (rowsCache = withMarketOutlier(all, (x) => x.comp) as (Row & { comp: string })[]);
}

export function medidasDe(slug: string, comp: string, key: string, seguidores?: number | null): FichaMedidas {
  const r = marketRows(slug).find((x) => x.comp === comp && x.mk === key);
  if (!r) return {};
  const m = r.item.metrics;
  const base = r.outlierBasis === 'views' ? m.views : m.likes;
  return {
    views: m.views, likes: m.likes, comments: m.comments, shares: m.shares, saves: m.saves, seguidores,
    xPerfil: r.outlier, xMercado: r.outlierMercado, porSeguidor: r.porSeguidor, porSeguidorMercado: r.porSeguidorMercado, engajamento: r.engagement,
    escopoMercado: r.mercadoEscopo, amostraMercado: r.mercadoAmostra, base: base != null ? r.outlierBasis : undefined,
  };
}

/** ficha nova a partir da última coleta que traz o item (conteúdo orgânico; anúncio vai para anuncios.ts) */
export function novaFicha(slug: string, comp: string, key: string): Ficha {
  if (key.startsWith('meta-ads:')) return novaFichaAnuncio(slug, comp, key); // anúncio: tools/fichas/anuncios.ts (040 G)
  const { snap, item } = findItem(slug, comp, key);
  return {
    schema: 1, kind: 'conteudo', key, competitorId: comp, url: item.url, item,
    origem: { arquivo: snap.file, collectedAt: snap.data.collectedAt },
    medidas: medidasDe(slug, comp, key, snap.data.profile.followers), anteriores: [], override: {}, relatorios: [],
  };
}
