// Resumo por concorrente para a lista (última coleta e seguidores da anterior, por perfil), sem carregar itens na tela.
import * as S from '../../core/store';
import { keyFor } from './keys';
import type { CompetitorSummary, ProfileSummary } from './types';

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
