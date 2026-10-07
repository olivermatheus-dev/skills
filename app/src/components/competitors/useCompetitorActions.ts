// Ações otimistas de concorrentes: salvar/editar, favoritar, criar (cards aparecem na hora), excluir e marcar itens.
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Competitor, type CompetitorFull, type Doc, type ItemMark } from '../../api';
import { patchDoc, qk, realId, removeDoc, runOptimistic, trackCreate, upsertDoc } from '../../queries';
import { slugify } from './lib';

type CDoc = Doc<Competitor>;
interface Cb<R> { onSuccess?: (r: R) => void; onError?: (e: unknown) => void; okMessage?: string | false }

export function useCompetitorActions(slug: string) {
  const qc = useQueryClient();
  return useMemo(() => {
    const listKey = qk.competitors(slug);
    const sumKey = qk.competitorsSummary(slug);
    const detailKey = (id: string) => qk.competitor(slug, id);

    /** grava os dados do concorrente; lista e detalhe mudam na hora */
    function save(id: string, data: Competitor, body: string, cb: Cb<CDoc> = {}) {
      return runOptimistic(qc, {
        mutationFn: async () => api.saveCompetitor(slug, await realId('competitor', slug, id), data, body),
        apply: () => [
          [listKey, (old: CDoc[] | undefined) => patchDoc(old, id, (c) => ({ ...c, data, body }))],
          [detailKey(id), (old: CompetitorFull | undefined) => old && { ...old, data, body }],
        ],
        onSuccess: (r) => {
          qc.setQueryData<CDoc[]>(listKey, (old) => upsertDoc(old, r, id));
          qc.setQueryData<CompetitorFull>(detailKey(id), (old) => old && { ...old, data: r.data, body: r.body });
          cb.onSuccess?.(r);
        },
        onError: cb.onError,
        invalidate: () => [listKey, detailKey(id), sumKey],
        okMessage: cb.okMessage,
      }, undefined).catch(() => undefined);
    }

    const toggleFavorite = (c: { data: Competitor; body: string }) =>
      save(c.data.id, { ...c.data, favorite: !c.data.favorite }, c.body, { okMessage: false });

    /** cria e devolve os ids previstos na hora (o servidor dá o slug do nome; -2, -3… se repetir) */
    function create(items: { name: string; kind: Competitor['kind']; tags: string[]; profiles: Competitor['profiles'] }[], cb: Cb<CDoc[]> = {}) {
      const taken = new Set((qc.getQueryData<CDoc[]>(listKey) ?? []).map((c) => c.data.id));
      const today = new Date().toISOString().slice(0, 10);
      const temps = items.map((it) => {
        const base = slugify(it.name); let id = base, n = 2;
        while (taken.has(id)) id = `${base}-${n++}`;
        taken.add(id);
        return { data: { ...it, id, status: 'ativo', favorite: false, created: today } as Competitor, body: '', file: `companies/${slug}/competitors/${id}/competitor.md` } satisfies CDoc;
      });
      const promise = runOptimistic(qc, {
        mutationFn: async () => {
          const out: CDoc[] = [];
          for (const [i, it] of items.entries()) { // em série: o servidor escolhe o id olhando as pastas existentes
            const p = api.createCompetitor(slug, it, '');
            trackCreate('competitor', slug, temps[i].data.id, p.then((r) => r.data.id));
            out.push(await p);
          }
          return out;
        },
        apply: () => [[listKey, (old: CDoc[] | undefined) => temps.reduce((l, t) => upsertDoc(l, t), old ?? [])]],
        onSuccess: (rs) => { qc.setQueryData<CDoc[]>(listKey, (old) => rs.reduce((l, r, i) => upsertDoc(l, r, temps[i].data.id), old ?? [])); cb.onSuccess?.(rs); },
        onError: cb.onError,
        invalidate: () => [listKey, sumKey],
        okMessage: cb.okMessage ?? (items.length > 1 ? `${items.length} concorrentes criados` : 'Concorrente criado'),
        errorMessage: 'Não foi possível criar — nada foi gravado',
      }, undefined);
      promise.catch(() => {});
      return { ids: temps.map((t) => t.data.id), promise };
    }

    function remove(id: string, cb: Cb<null> = {}) {
      return runOptimistic(qc, {
        mutationFn: async () => api.deleteCompetitor(slug, await realId('competitor', slug, id)),
        apply: () => [[listKey, (old: CDoc[] | undefined) => removeDoc(old, id)]],
        onSuccess: (r) => { qc.removeQueries({ queryKey: detailKey(id), exact: true }); cb.onSuccess?.(r); },
        onError: cb.onError,
        invalidate: () => [listKey, sumKey],
        okMessage: cb.okMessage ?? 'Concorrente excluído',
        errorMessage: 'Não foi possível excluir',
      }, undefined).catch(() => undefined);
    }

    /** marcação de um conteúdo (★, status, tags, nota, ideia) */
    function mark(id: string, mk: string, patch: Partial<ItemMark>) {
      return runOptimistic(qc, {
        mutationFn: () => api.setMark(slug, id, mk, patch),
        apply: () => [[detailKey(id), (old: CompetitorFull | undefined) => old && ({
          ...old,
          marks: { ...old.marks, [mk]: { ...({ status: 'nova', favorite: false, tags: [], note: '' } as Partial<ItemMark>), ...old.marks[mk], ...patch, updated: new Date().toISOString() } },
        })]],
        onSuccess: (m) => qc.setQueryData<CompetitorFull>(detailKey(id), (old) => old && { ...old, marks: { ...old.marks, [mk]: m } }),
        invalidate: () => [detailKey(id)],
        okMessage: false,
        errorMessage: 'Não foi possível marcar — voltou ao que era',
      }, undefined);
    }

    return { save, toggleFavorite, create, remove, mark };
  }, [qc, slug]);
}
