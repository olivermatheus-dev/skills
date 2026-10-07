// Formulário rápido de nova tarefa (título, quadro, responsável, prioridade).
import { useState } from 'react';
import type { Task } from '../../api';
import { Button, Input, Select } from '../ui';
import { ASSIGNEES, BOARD_OPTS, PRIORITY_OPTS, assigneeLabel, type BoardName, type Priority } from './taskUtils';

/** Criar é otimista: o card aparece na hora (onCreate) e o formulário fecha; erro → aviso e o formulário volta. */
export function NewTaskForm({ defaultBoard, initial = {}, onCreate, onCancel }: {
  slug: string; initial?: Partial<Task>; defaultBoard?: BoardName; onCreate: (data: Partial<Task> & { title: string }) => void; onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [board, setBoard] = useState<BoardName>(initial.board ?? defaultBoard ?? 'conteudo');
  const [assignee, setAssignee] = useState(initial.assignee ?? 'oliver');
  const [priority, setPriority] = useState<Priority>(initial.priority ?? 'media');
  return (
    <form
      className="bg-surface border border-border rounded-xl p-3 mb-4 shadow-sm"
      onSubmit={(e) => { e.preventDefault(); if (title.trim()) onCreate({ title: title.trim(), board, assignee, priority, status: 'backlog' }); }}
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
        <Button type="submit" disabled={!title.trim()}>Criar</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
      <div className="text-xs text-muted mt-2">Entra no backlog. Detalhes (prazo, checklist, dependências) no painel da tarefa.</div>
    </form>
  );
}
