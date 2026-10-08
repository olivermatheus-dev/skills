// Ações otimistas do quadro: criar (card provisório na hora), salvar, mover/arrastar, arquivar (com desfazer).
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Task } from '../../api';
import { nextSeqId, patchDoc, qk, realId, removeDoc, runOptimistic, trackCreate, upsertDoc } from '../../queries';
import { toast } from '../toast';
import { joinTaskBody, nowStamp, splitTaskBody, todayIso, type CommentKind, type Status, type TaskDoc } from './taskUtils';

type Data = Partial<Task> & { title: string };
interface Cb<R> { onSuccess?: (r: R) => void; onError?: (e: unknown) => void }

export function useTaskActions(slug: string) {
  const qc = useQueryClient();
  return useMemo(() => {
    const key = qk.tasks(slug);
    const list = () => qc.getQueryData<TaskDoc[]>(key) ?? [];

    /** cria e devolve o id previsto na hora (o card já aparece); ações sobre ele esperam o id real */
    function create(data: Data, body?: string, cb: Cb<TaskDoc> & { okMessage?: string | false } = {}) {
      const tempId = nextSeqId('T', list().map((t) => t.data.id));
      const temp: TaskDoc = {
        data: { board: 'conteudo', status: 'backlog', assignee: 'oliver', priority: 'media', depends: [], links: [], ...data, id: tempId } as Task,
        body: body ?? `\n## Checklist\n\n## Log\n- ${todayIso()} · criada pela interface\n`,
        file: '',
      };
      const promise = runOptimistic(qc, {
        mutationFn: () => {
          const p = api.createTask(slug, data, body);
          trackCreate('task', slug, tempId, p.then((r) => r.data.id));
          return p;
        },
        apply: () => [[key, (old: TaskDoc[] | undefined) => upsertDoc(old, temp)]],
        onSuccess: (r) => { qc.setQueryData<TaskDoc[]>(key, (old) => upsertDoc(old, r, tempId)); cb.onSuccess?.(r); },
        onError: cb.onError,
        invalidate: () => [key],
        okMessage: cb.okMessage ?? false,
        errorMessage: 'Não foi possível criar a tarefa',
      }, undefined);
      promise.catch(() => {});
      return { tempId, promise };
    }

    function save(id: string, data: Data, body: string | undefined, cb: Cb<TaskDoc> = {}) {
      return runOptimistic(qc, {
        mutationFn: async () => api.saveTask(slug, await realId('task', slug, id), data, body),
        apply: () => [[key, (old: TaskDoc[] | undefined) => patchDoc(old, id, (t) => ({
          ...t,
          // null limpa o campo no servidor; no cache vira "sem valor"
          data: { ...t.data, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? undefined])) } as Task,
          body: body ?? t.body,
        }))]],
        onSuccess: (r) => { qc.setQueryData<TaskDoc[]>(key, (old) => upsertDoc(old, r, id)); cb.onSuccess?.(r); },
        onError: cb.onError,
        invalidate: () => [key],
        errorMessage: `Não foi possível salvar ${id} — a alteração foi desfeita`,
      }, undefined).catch(() => undefined);
    }

    function move(id: string, status: Status, cb: Cb<TaskDoc> = {}) {
      const t = list().find((x) => x.data.id === id);
      if (!t || t.data.status === status) return;
      void runOptimistic(qc, {
        mutationFn: async () => api.moveTask(slug, await realId('task', slug, id), status),
        apply: () => [[key, (old: TaskDoc[] | undefined) => patchDoc(old, id, (x) => ({ ...x, data: { ...x.data, status } }))]],
        onSuccess: (r) => { qc.setQueryData<TaskDoc[]>(key, (old) => upsertDoc(old, r, id)); cb.onSuccess?.(r); },
        onError: cb.onError,
        invalidate: () => [key],
        okMessage: false,
        errorMessage: `Não foi possível mover ${id} — voltou para a coluna anterior`,
      }, undefined).catch(() => {});
    }

    function unarchive(doc: TaskDoc) {
      void runOptimistic(qc, {
        mutationFn: () => api.unarchiveTask(slug, doc.data.id),
        apply: () => [[key, (old: TaskDoc[] | undefined) => upsertDoc(old, doc)]],
        onSuccess: (r) => qc.setQueryData<TaskDoc[]>(key, (old) => upsertDoc(old, r, doc.data.id)),
        invalidate: () => [key],
        okMessage: `${doc.data.id} voltou para o quadro`,
        errorMessage: 'Não foi possível desfazer o arquivamento',
      }, undefined).catch(() => {});
    }

    function archive(doc: TaskDoc) {
      const id = doc.data.id;
      const done = runOptimistic(qc, {
        mutationFn: async () => api.archiveTask(slug, await realId('task', slug, id)),
        apply: () => [[key, (old: TaskDoc[] | undefined) => removeDoc(old, id)]],
        invalidate: () => [key],
        okMessage: false,
        errorMessage: `Não foi possível arquivar ${id}`,
      }, undefined).then(() => true, () => false);
      // desfazer espera o arquivamento terminar (a ordem no servidor importa)
      toast.undo(`${id} arquivada (board/arquivo/)`, async () => { if (await done) unarchive({ ...doc, data: { ...doc.data, id: await realId('task', slug, id) } }); });
    }

    /** comentário do Oliver; opcionalmente muda status/responsável no mesmo gesto ("devolver à IA") */
    function comment(id: string, c: { text: string; kind?: CommentKind; status?: Status; assignee?: string }, cb: Cb<TaskDoc> = {}) {
      return runOptimistic(qc, {
        mutationFn: async () => api.commentTask(slug, await realId('task', slug, id), c),
        apply: () => [[key, (old: TaskDoc[] | undefined) => patchDoc(old, id, (t) => {
          const parts = splitTaskBody(t.body);
          parts.comments.push({ at: nowStamp(), who: 'oliver', kind: c.kind ?? 'nota', text: c.text });
          return { ...t, body: joinTaskBody(parts), data: { ...t.data, ...(c.status ? { status: c.status } : {}), ...(c.assignee ? { assignee: c.assignee } : {}) } };
        })]],
        onSuccess: (r) => { qc.setQueryData<TaskDoc[]>(key, (old) => upsertDoc(old, r, id)); cb.onSuccess?.(r); },
        onError: cb.onError,
        invalidate: () => [key],
        okMessage: false,
        errorMessage: `Não foi possível comentar em ${id}`,
      }, undefined).catch(() => undefined);
    }

    return { create, save, move, archive, comment };
  }, [qc, slug]);
}
