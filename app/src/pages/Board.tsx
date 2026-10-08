// Kanban do projeto: colunas backlog · todo · doing · review · done, visões Oliver / IA / todas, arrastar entre colunas.
import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import type { Task } from '../api';
import { useTasks } from '../queries';
import { useTaskActions } from '../components/board/useTaskActions';
import { Button, Empty, ErrorBox, Input, PageHeader, cx } from '../components/kit';
import { TaskCard } from '../components/board/TaskCard';
import { TaskDrawer } from '../components/board/TaskDrawer';
import { NewTaskForm } from '../components/board/NewTaskForm';
import { Segmented } from '../components/board/Segmented';
import { BOARD_OPTS, COLUMNS, VIEWS, inView, type BoardName, type Status, type TaskDoc, type View } from '../components/board/taskUtils';

const PRIO_RANK = { alta: 0, media: 1, baixa: 2 } as const;
const sortTasks = (a: TaskDoc, b: TaskDoc) =>
  PRIO_RANK[a.data.priority] - PRIO_RANK[b.data.priority]
  || (a.data.due ?? '9999').localeCompare(b.data.due ?? '9999')
  || a.data.id.localeCompare(b.data.id);

const COL_DOT: Record<Status, string> = {
  backlog: '#a1a1aa', todo: '#60a5fa', doing: 'var(--color-primary)', review: 'var(--color-warning)', done: 'var(--color-success)',
};
const VIEW_KEY = 'hub:board:view';
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sem storage */ } };

export default function Board() {
  const { slug = '' } = useParams();
  const q = useTasks(slug);
  const actions = useTaskActions(slug);
  const tasks = q.data ?? [];

  const [sp, setSp] = useSearchParams();
  const view = (VIEWS.some((v) => v.id === sp.get('visao')) ? sp.get('visao') : lsGet(VIEW_KEY) ?? 'todas') as View;
  const board = (BOARD_OPTS.some((b) => b.id === sp.get('quadro')) ? sp.get('quadro') : 'todos') as BoardName | 'todos';
  const search = sp.get('q') ?? '';
  const openId = sp.get('t');
  // Lê da URL atual (não do render): várias trocas seguidas não se sobrescrevem.
  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(window.location.search);
    if (v) n.set(k, v); else n.delete(k);
    setSp(n, { replace: true });
  };
  const setView = (v: View) => { lsSet(VIEW_KEY, v); setParam('visao', v); };

  const [creating, setCreating] = useState<false | Partial<Task>>(false); // rascunho da nova tarefa (volta se a criação falhar)
  const [dragId, setDragId] = useState<string | null>(null);

  const [moveError, setMoveError] = useState<unknown>(null);
  // Mover = otimista: o card troca de coluna no mesmo quadro; erro → volta e avisa.
  const moveTo = (id: string, status: Status) => actions.move(id, status, { onSuccess: () => setMoveError(null), onError: setMoveError });

  const byId = useMemo(() => new Map(tasks.map((t) => [t.data.id, t])), [tasks]);
  const isBlocked = (t: TaskDoc) => t.data.status !== 'done' && t.data.depends.some((d) => byId.get(d)?.data.status !== 'done');

  const needle = search.trim().toLowerCase();
  const scoped = tasks.filter((t) => board === 'todos' || t.data.board === board)
    .filter((t) => !needle || `${t.data.id} ${t.data.title} ${t.data.assignee} ${t.body}`.toLowerCase().includes(needle));
  const visible = scoped.filter((t) => inView(t.data, view));
  const viewCounts = Object.fromEntries(VIEWS.map((v) => [v.id, scoped.filter((t) => inView(t.data, v.id)).length])) as Record<View, number>;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const onDragStart = (e: DragStartEvent) => setDragId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDragId(null);
    if (e.over) moveTo(String(e.active.id), e.over.id as Status);
  };
  const dragTask = dragId ? byId.get(dragId) : undefined;
  const openTask = openId ? byId.get(openId) ?? null : null;

  const waiting = tasks.filter((t) => t.data.status === 'review').length;
  return (
    <div className="p-8 flex flex-col min-h-full">
      <PageHeader
        title="Quadro"
        subtitle={q.isSuccess ? `${tasks.length} tarefas · ${waiting} em revisão aguardando o Oliver` : 'Tarefas do projeto (companies/<slug>/board)'}
        actions={<Button onClick={() => setCreating({})}>+ Nova tarefa</Button>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmented label="Visão" value={view} onChange={setView} options={VIEWS.map((v) => ({ ...v, count: viewCounts[v.id] }))} />
        <Segmented label="Quadro" value={board} onChange={(v) => setParam('quadro', v === 'todos' ? null : v)}
          options={[{ id: 'todos' as const, label: 'Todos' }, ...BOARD_OPTS]} />
        <div className="relative ml-auto">
          <span aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">⌕</span>
          <Input type="search" aria-label="Buscar" placeholder="Buscar tarefa…" value={search} onChange={(e) => setParam('q', e.target.value || null)} className="pl-7 w-64" />
        </div>
      </div>

      {creating && (
        <NewTaskForm slug={slug} initial={creating} defaultBoard={board === 'todos' ? undefined : board} onCancel={() => setCreating(false)}
          onCreate={(data) => {
            // card provisório na hora + painel aberto; se o servidor der outro id, o painel acompanha
            const { tempId } = actions.create(data, undefined, {
              onSuccess: (t) => { if (t.data.id !== tempId && new URLSearchParams(window.location.search).get('t') === tempId) setParam('t', t.data.id); },
              onError: () => { if (new URLSearchParams(window.location.search).get('t') === tempId) setParam('t', null); setCreating(data); },
            });
            setCreating(false); setParam('t', tempId);
          }} />
      )}
      {moveError ? <div className="mb-3"><ErrorBox error={moveError} /></div> : null}

      {q.isLoading ? (
        <div className="flex gap-3">{COLUMNS.map((c) => <div key={c.id} className="flex-1 min-w-56 h-64 rounded-xl bg-muted/70 animate-pulse" />)}</div>
      ) : q.isError ? (
        <ErrorBox error={q.error} />
      ) : tasks.length === 0 ? (
        <Empty title="Nenhuma tarefa ainda" hint="As tarefas ficam em companies/<slug>/board/T-NNNN-*.md." action={<Button onClick={() => setCreating({})}>+ Nova tarefa</Button>} />
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragId(null)}>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 flex-1 items-stretch">
            {COLUMNS.map((c) => {
              const items = visible.filter((t) => t.data.status === c.id).sort(sortTasks);
              return (
                <Column key={c.id} id={c.id} label={c.label} count={items.length} highlight={c.id === 'review' && view === 'oliver'}>
                  {items.map((t) => (
                    <DraggableCard key={t.data.id} task={t} hidden={dragId === t.data.id}>
                      <TaskCard task={t} blocked={isBlocked(t)} showBoard={board === 'todos'} onOpen={() => setParam('t', t.data.id)} />
                    </DraggableCard>
                  ))}
                  {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">{needle ? 'Nada encontrado' : 'Vazio'}</div>}
                </Column>
              );
            })}
          </div>
          <DragOverlay dropAnimation={null}>
            {dragTask && <div><TaskCard task={dragTask} blocked={isBlocked(dragTask)} showBoard={board === 'todos'} dragging /></div>}
          </DragOverlay>
        </DndContext>
      )}

      <TaskDrawer slug={slug} task={openTask} allTasks={tasks} onClose={() => setParam('t', null)} onMove={moveTo} actions={actions} />
    </div>
  );
}

function Column({ id, label, count, highlight, children }: { id: Status; label: string; count: number; highlight?: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section ref={setNodeRef} aria-label={label}
      className={cx('flex-1 min-w-56 max-w-80 rounded-xl p-2 flex flex-col transition-colors border',
        isOver ? 'bg-primary-soft border-primary/40' : highlight ? 'bg-amber-50/60 border-amber-200/70' : 'bg-muted/60 border-transparent')}>
      <header className="flex items-center gap-2 px-1.5 pt-1 pb-2.5">
        <span className="w-2 h-2 rounded-full" style={{ background: COL_DOT[id] }} />
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      </header>
      <div className="flex flex-col gap-2 flex-1 min-h-24">{children}</div>
    </section>
  );
}

function DraggableCard({ task, hidden, children }: { task: TaskDoc; hidden?: boolean; children: React.ReactNode }) {
  const { setNodeRef, listeners, attributes } = useDraggable({ id: task.data.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} role="button" tabIndex={0}
      aria-label={`${task.data.id} ${task.data.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget.firstElementChild as HTMLElement | null)?.click(); }}
      className={cx('outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary/50 touch-none', hidden && 'opacity-30')}>
      {children}
    </div>
  );
}
