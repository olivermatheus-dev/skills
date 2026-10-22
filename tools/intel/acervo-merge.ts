// Acervo de um perfil (puro: sem disco; usado pelo store/app e pelas fichas): todo post que já apareceu em alguma
// coleta ou num lote da coleta longa, uma vez só. Cada post fica com os dados da coleta MAIS RECENTE em que apareceu;
// quem não está na última coleta leva `seenAt` (quando foi medido pela última vez). Análises e marcações são por id
// do post, então seguem valendo entre coletas.
import type { AcervoFile, ContentItem } from '../../schema/competitor';

export function acervoItems(snaps: { collectedAt: string; items: ContentItem[] }[], acervo?: Pick<AcervoFile, 'items'> | null): ContentItem[] {
  const latest = snaps.at(-1);
  const byId = new Map<string, ContentItem>();
  for (const it of acervo?.items ?? []) byId.set(it.id, it);
  for (const s of snaps.slice(0, -1)) for (const it of s.items) {
    const prev = byId.get(it.id);
    if (!prev || (prev.seenAt ?? '') <= s.collectedAt) byId.set(it.id, { ...it, seenAt: s.collectedAt });
  }
  for (const it of latest?.items ?? []) byId.set(it.id, { ...it, seenAt: undefined });
  const t = (i: ContentItem) => (i.publishedAt ? Date.parse(i.publishedAt) : 0);
  return [...byId.values()].sort((a, b) => t(b) - t(a));
}
