// Formulário rápido de nova tarefa (título, quadro, responsável, prioridade).
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { Button, ErrorBox, Input, Select } from '../ui';
import { ASSIGNEES, BOARD_OPTS, PRIORITY_OPTS, assigneeLabel, type BoardName, type Priority, type TaskDoc } from './taskUtils';

export function NewTaskForm({ slug, defaultBoard, onDone, onCancel }: {
  slug: string; defaultBoard?: BoardName; onDone: (t: TaskDoc) => void; onCancel: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [board, setBoard] = useState<BoardName>(defaultBoard ?? 'conteudo');
  const [assignee, setAssignee] = useState('oliver');
  const [priority, setPriority] = useState<Priority>('media');
  const create = useMutation({
    mutationFn: () => api.createTask(slug, { title: title.trim(), board, assignee, priority, status: 'backlog' }),
    onSuccess: (t) => { qc.invalidateQueries({ queryKey: ['tasks', slug] }); onDone(t); },
  });
  return (
    <form
      className="bg-surface border border-border rounded-xl p-3 mb-4 shadow-sm"
      onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input autoFocus placeholder="Título da tarefa" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 min-w-64"
          onKeyDown={(e) => e.key === 'Escape' && onCancel()} />
        <Select aria-label="Quadro" value={board} onChange={(e) => setBoard(e.target.value as BoardName)}>
          {BOARD_OPTS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </Select>
        <Select aria-label="Responsável" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          {ASSIGNEES.map((a) => <option key={a} value={a}>{assigneeLabel(a)}</option>)}
        </Select>
        <Select aria-label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          {PRIORITY_OPTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </Select>
        <Button type="submit" disabled={!title.trim() || create.isPending}>{create.isPending ? 'Criando…' : 'Criar'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
      <div className="text-xs text-muted mt-2">Entra no backlog. Detalhes (prazo, checklist, dependências) no painel da tarefa.</div>
      <ErrorBox error={create.error} />
    </form>
  );
}
