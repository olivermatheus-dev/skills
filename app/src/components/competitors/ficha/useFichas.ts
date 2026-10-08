// Dados das fichas de análise (040 D): resumo para o selo e o filtro, vocabulário dos selects, a ficha aberta e a edição (override).
import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type FichaResumo, type FichaView } from '../../../api';
import { toast } from '../../toast';
import type { FichaSelo } from '../Items';

export const fk = {
  resumo: (slug: string) => ['fichas-resumo', slug] as const,
  vocab: (slug: string) => ['fichas-vocab', slug] as const,
  ficha: (slug: string, comp: string, key: string) => ['ficha', slug, comp, key] as const,
};

/** resumo de todas as fichas do projeto → `of(compId, mk)` */
export function useFichasResumo(slug: string) {
  const q = useQuery({ queryKey: fk.resumo(slug), queryFn: () => api.fichasResumo(slug), enabled: !!slug });
  const of = useCallback((comp: string | undefined, mk: string): (FichaSelo & Pick<FichaResumo, 'anuncio'>) | undefined => (comp ? q.data?.[comp]?.[mk] : undefined), [q.data]);
  return { of, loading: q.isLoading, data: q.data };
}

export const useFichasVocab = (slug: string) => useQuery({ queryKey: fk.vocab(slug), queryFn: () => api.fichasVocab(slug), enabled: !!slug, staleTime: 60_000 });

export function useFicha(slug: string, comp: string, key: string, enabled = true) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: fk.ficha(slug, comp, key), queryFn: () => api.ficha(slug, comp, key), enabled: enabled && !!slug && !!comp && !!key });
  const m = useMutation({
    mutationFn: (e: { path: string; value?: unknown; revert?: boolean }) => api.editFicha(slug, comp, key, e),
    onSuccess: (v: FichaView) => { qc.setQueryData(fk.ficha(slug, comp, key), v); void qc.invalidateQueries({ queryKey: fk.resumo(slug) }); },
    onError: (e: unknown) => { toast.error(e, 'Não foi possível salvar a edição'); },
  });
  const edit = useCallback((path: string, value: unknown) => m.mutate({ path, value }), [m]);
  const revert = useCallback((path: string) => m.mutate({ path, revert: true }), [m]);
  return useMemo(() => ({ ...q, edit, revert, saving: m.isPending }), [q, edit, revert, m.isPending]);
}

/** "Analisar este": grava/retira o item do pedido de fila do concorrente */
export function usePedido(slug: string, comp: string, key: string) {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: fk.resumo(slug) });
  const pedir = useMutation({ mutationFn: () => api.pedirFicha(slug, comp, key), onSuccess: done });
  const cancelar = useMutation({ mutationFn: () => api.cancelarFicha(slug, comp, key), onSuccess: done });
  return { pedir, cancelar };
}
