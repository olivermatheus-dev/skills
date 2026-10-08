// Ações da matriz de funcionalidades: a célula muda na hora (otimista) e o servidor confirma; tudo que o Oliver edita vira by: 'oliver'.
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type CellStatus, type Matrix } from '../../api';
import { qk, runOptimistic } from '../../queries';

export interface CellEdit { status: CellStatus | null; note?: string; source?: string }

export function useMatrixActions(slug: string) {
  const qc = useQueryClient();
  return useMemo(() => {
    const key = qk.matrix(slug);
    const keep = (r: Matrix) => qc.setQueryData<Matrix>(key, r);

    function setCell(col: string, feat: string, c: CellEdit) {
      return runOptimistic(qc, {
        mutationFn: () => api.setMatrixCell(slug, col, feat, c),
        apply: () => [[key, (old: Matrix | undefined) => {
          if (!old) return old;
          const cells = { ...old.cells, [col]: { ...(old.cells[col] ?? {}) } };
          if (c.status === null) delete cells[col][feat];
          else cells[col][feat] = { status: c.status, note: c.note?.trim() || undefined, source: c.source?.trim() || undefined, by: 'oliver', updatedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z') };
          return { ...old, cells };
        }]],
        onSuccess: keep,
        invalidate: () => [key],
        okMessage: false,
      }, undefined).catch(() => undefined);
    }
    const saveFeature = (f: { id?: string; name: string; group: string; description?: string }) =>
      runOptimistic(qc, { mutationFn: () => api.saveMatrixFeature(slug, f), apply: () => [], onSuccess: keep, invalidate: () => [key], okMessage: f.id ? 'Funcionalidade atualizada' : 'Funcionalidade criada' }, undefined).catch(() => undefined);
    const deleteFeature = (id: string) =>
      runOptimistic(qc, {
        mutationFn: () => api.deleteMatrixFeature(slug, id),
        apply: () => [[key, (old: Matrix | undefined) => old && { ...old, features: old.features.filter((x) => x.id !== id) }]],
        onSuccess: keep, invalidate: () => [key], okMessage: 'Funcionalidade removida',
      }, undefined).catch(() => undefined);
    const renameGroup = (from: string, to: string) =>
      runOptimistic(qc, { mutationFn: () => api.renameMatrixGroup(slug, from, to), apply: () => [], onSuccess: keep, invalidate: () => [key], okMessage: 'Grupo renomeado' }, undefined).catch(() => undefined);
    return { setCell, saveFeature, deleteFeature, renameGroup };
  }, [qc, slug]);
}
