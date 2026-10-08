// Kanban do projeto: colunas backlog · todo · doing · review · done, visões Oliver / IA / todas, arrastar entre colunas.
// Criar = direto na coluna (estilo Trello: só o título; detalhes no painel). Rodar IA = Claude Code nas tarefas aprovadas.
import { useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useQuery } from '@tanstack/react-query';
import { LayoutGroup, MotionConfig, motion } from 'motion/react';
import { Circle, CircleCheck, CircleDashed, CircleDot, Eye, Plus, Search, Sparkles, User, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { q as Q } from '../queries';
import { useTaskActions } from '../components/board/useTaskActions';
import { useRunner } from '../components/board/useRunner';
import { Empty, ErrorBox, PageHeader, cx } from '../components/kit';
import { TaskCard } from '../components/board/TaskCard';
import { TaskDrawer } from '../components/board/TaskDrawer';
import { RunAiButton, RunningBar } from '../components/board/RunAi';
import { Segmented } from '../components/board/Segmented';
import { BOARD_OPTS, COLUMNS, VIEWS, inView, isReady, taskThread, type BoardName, type Status, type TaskDoc, type View } from '../components/board/taskUtils';
import { AppContent } from '../components/AppContent';

const PRIO_RANK = { alta: 0, media: 1, baixa: 2 } as const;
const sortTasks = (a: TaskDoc, b: TaskDoc) =>
  PRIO_RANK[a.data.priority] - PRIO_RANK[b.data.priority]
  || (a.data.due ?? '9999').localeCompare(b.data.due ?? '9999')
  || a.data.id.localeCompare(b.data.id);

const COL_ICON: Record<Status, { icon: LucideIcon; color: string }> = {
  backlog: { icon: CircleDashed, color: '#a1a1aa' },
  todo: { icon: Circle, color: '#60a5fa' },
  doing: { icon: CircleDot, color: 'var(--color-primary)' },
  review: { icon: Eye, color: 'var(--color-warning)' },
  done: { icon: CircleCheck, color: 'var(--color-success)' },
};
// Piloto do Motion (ex-Framer Motion): cards com mola ao reordenar, trocar de coluna, nascer e soltar do arrasto.
// layoutId = id da tarefa: o card "voa" de onde estava (coluna antiga ou ponto onde foi solto) para o lugar novo.
const SPRING = { type: 'spring', bounce: 0.18, duration: 0.45 } as const;
const VIEW_KEY = 'hub:board:view';
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sem storage */ } };

export default function Board() {
  const { slug = '' } = useParams();
  const runner = useRunner(slug);
  // enquanto a IA roda, o quadro se atualiza sozinho (os agentes editam os arquivos)
  const q = useQuery({ ...Q.tasks(slug), refetchInterval: runner.running ? 4000 : 20000 });
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

  const [composer, setComposer] = useState<Status | null>(null); // coluna com o "Adicionar tarefa" aberto
  const [dragId, setDragId] = useState<string | null>(null);
  const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set()); // criadas agora: entram com mola

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
  const runningId = runner.status?.running ? runner.status.task : null;

  /** cria o card na coluna; open = já abre o painel */
  const createIn = (status: Status, title: string, assignee: string, open: boolean) => {
    const { tempId } = actions.create({ title, status, assignee, board: board === 'todos' ? 'conteudo' : board }, undefined, {
      onSuccess: (t) => { if (t.data.id !== tempId && new URLSearchParams(window.location.search).get('t') === tempId) setParam('t', t.data.id); },
      onError: () => { if (new URLSearchParams(window.location.search).get('t') === tempId) setParam('t', null); },
    });
    setFresh((s) => new Set(s).add(tempId));
    if (open) { setComposer(null); setParam('t', tempId); }
  };

  const waiting = tasks.filter((t) => t.data.status === 'review' || taskThread(t.body).pending).length;
  return (
    <AppContent wide className="flex flex-col min-h-full">
      <PageHeader
        title="Quadro"
        subtitle={q.isSuccess ? `${tasks.length} tarefas · ${waiting} esperando você` : 'Tarefas do projeto (companies/<slug>/board)'}
        actions={(
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setComposer('backlog')}><Plus /> Nova tarefa</Button>
            <RunAiButton runner={runner} onOpenTask={(id) => setParam('t', id)} />
          </div>
        )}
      />

      {runner.status?.running && !runner.status.otherProject && (
        <RunningBar status={runner.status} onStop={() => runner.stop.mutate()} onOpenTask={(id) => setParam('t', id)} />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmented label="Visão" value={view} onChange={setView} options={VIEWS.map((v) => ({ ...v, count: viewCounts[v.id] }))} />
        <Segmented label="Quadro" value={board} onChange={(v) => setParam('quadro', v === 'todos' ? null : v)}
          options={[{ id: 'todos' as const, label: 'Todos' }, ...BOARD_OPTS]} />
        <div className="relative ml-auto">
          <Search aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input type="search" aria-label="Buscar" placeholder="Buscar tarefa…" value={search} onChange={(e) => setParam('q', e.target.value || null)}
            className="h-8 pl-8 pr-3 w-64 rounded-md border border-border bg-card text-sm outline-none focus:border-primary" />
        </div>
      </div>

      {moveError ? <div className="mb-3"><ErrorBox error={moveError} /></div> : null}

      {q.isLoading ? (
        <div className="flex gap-3">{COLUMNS.map((c) => <div key={c.id} className="flex-1 min-w-56 h-64 rounded-xl bg-muted/70 animate-pulse" />)}</div>
      ) : q.isError ? (
        <ErrorBox error={q.error} />
      ) : tasks.length === 0 && !composer ? (
        <Empty title="Nenhuma tarefa ainda" hint="As tarefas ficam em companies/<slug>/board/T-NNNN-*.md." action={<Button onClick={() => setComposer('backlog')}><Plus /> Nova tarefa</Button>} />
      ) : (
        <MotionConfig reducedMotion="user" transition={SPRING}>
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragId(null)}>
          <LayoutGroup>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 flex-1 items-start">
            {COLUMNS.map((c) => {
              const items = visible.filter((t) => t.data.status === c.id).sort(sortTasks);
              return (
                <Column key={c.id} id={c.id} label={c.label} hint={c.hint} count={items.length}
                  highlight={c.id === 'review' && items.length > 0}
                  onAdd={() => setComposer(c.id)}
                  footer={composer === c.id ? (
                    <Composer defaultAssignee={view === 'ia' || c.id === 'todo' ? 'ai' : 'oliver'}
                      onCreate={(title, assignee, open) => createIn(c.id, title, assignee, open)} onClose={() => setComposer(null)} />
                  ) : (
                    <button type="button" onClick={() => setComposer(c.id)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-black/5 hover:text-foreground transition">
                      <Plus className="size-4" /> Adicionar tarefa
                    </button>
                  )}>
                  {items.map((t) => (
                    <DraggableCard key={t.data.id} task={t} hidden={dragId === t.data.id} fresh={fresh.has(t.data.id)}>
                      <TaskCard task={t} blocked={isBlocked(t)} showBoard={board === 'todos'} running={t.data.id === runningId}
                        ready={!runningId && isReady(t.data, byId)} onOpen={() => setParam('t', t.data.id)} />
                    </DraggableCard>
                  ))}
                  {items.length === 0 && composer !== c.id && needle && <div className="text-xs text-muted-foreground text-center py-4">Nada encontrado</div>}
                </Column>
              );
            })}
          </div>
          <DragOverlay dropAnimation={null}>
            {/* mesmo layoutId do card: ao soltar, o card da coluna nasce a partir daqui e assenta com mola */}
            {dragTask && (
              <motion.div layoutId={dragTask.data.id} layout="position">
                <motion.div initial={{ scale: 1, rotate: 0 }} animate={{ scale: 1.03, rotate: 1.2 }}>
                  <TaskCard task={dragTask} blocked={isBlocked(dragTask)} showBoard={board === 'todos'} dragging />
                </motion.div>
              </motion.div>
            )}
          </DragOverlay>
          </LayoutGroup>
        </DndContext>
        </MotionConfig>
      )}

      <TaskDrawer slug={slug} task={openTask} allTasks={tasks} onClose={() => setParam('t', null)} onMove={moveTo} actions={actions} runner={runner} />
    </AppContent>
  );
}

function Column({ id, label, hint, count, highlight, onAdd, footer, children }: {
  id: Status; label: string; hint: string; count: number; highlight?: boolean; onAdd: () => void; footer: React.ReactNode; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { icon: Icon, color } = COL_ICON[id];
  return (
    <section ref={setNodeRef} aria-label={label}
      className={cx('flex-1 min-w-56 max-w-80 rounded-xl p-2 flex flex-col transition-colors border',
        isOver ? 'bg-primary-soft border-primary/40' : highlight ? 'bg-amber-50/60 border-amber-200/70' : 'bg-muted/60 border-transparent')}>
      <header className="group/col flex items-center gap-2 px-1.5 pt-1 pb-2.5" title={hint}>
        <Icon className="size-4" style={{ color }} />
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
        <button type="button" onClick={onAdd} aria-label={`Adicionar tarefa em ${label}`}
          className="ml-auto size-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-black/5 hover:text-foreground opacity-0 group-hover/col:opacity-100 focus:opacity-100 transition">
          <Plus className="size-4" />
        </button>
      </header>
      <div className="flex flex-col gap-2 min-h-8">{children}</div>
      <div className="mt-2">{footer}</div>
    </section>
  );
}

/** Adicionar tarefa na coluna: só o título. Enter cria e mantém aberto para a próxima; Ctrl+Enter cria e abre o painel. */
function Composer({ defaultAssignee, onCreate, onClose }: { defaultAssignee: string; onCreate: (title: string, assignee: string, open: boolean) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(defaultAssignee);
  const ref = useRef<HTMLTextAreaElement>(null);
  const submit = (open: boolean) => {
    const t = title.trim();
    if (!t) return;
    onCreate(t, assignee, open);
    setTitle('');
    ref.current?.focus();
  };
  const isAiSel = assignee !== 'oliver';
  return (
    <div className="flex flex-col gap-2" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node) && !title.trim()) onClose(); }}>
      <textarea ref={ref} autoFocus rows={2} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da tarefa…"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e.ctrlKey || e.metaKey); }
        }}
        className="w-full resize-none rounded-lg border border-primary/40 bg-card px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20" />
      <div className="flex items-center gap-1.5">
        <Button size="sm" disabled={!title.trim()} onClick={() => submit(false)}>Adicionar</Button>
        <button type="button" onClick={() => setAssignee(isAiSel ? 'oliver' : 'ai')} title="Quem faz: clique para trocar"
          className={cx('inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-medium border transition',
            isAiSel ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-card text-muted-foreground border-border hover:text-foreground')}>
          {isAiSel ? <Sparkles className="size-3.5" /> : <User className="size-3.5" />}{isAiSel ? 'IA' : 'Oliver'}
        </button>
        <button type="button" onClick={onClose} aria-label="Fechar" className="ml-auto size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-black/5">
          <X className="size-4" />
        </button>
      </div>
      <div className="text-[11px] text-muted-foreground px-0.5">Enter adiciona · Ctrl+Enter adiciona e abre</div>
    </div>
  );
}

function DraggableCard({ task, hidden, fresh, children }: { task: TaskDoc; hidden?: boolean; fresh?: boolean; children: React.ReactNode }) {
  const { setNodeRef, listeners, attributes } = useDraggable({ id: task.data.id });
  const props = {
    ref: setNodeRef, ...listeners, ...attributes, role: 'button', tabIndex: 0,
    'aria-label': `${task.data.id} ${task.data.title}`,
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter') (e.currentTarget.firstElementChild as HTMLElement | null)?.click(); },
    className: cx('outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary/50 touch-none', hidden && 'opacity-30'),
  };
  // Enquanto arrasta, a origem é um div comum (fantasma parado): o layoutId fica só com o card flutuante,
  // e ao soltar o card remonta com o layoutId e sai de onde o flutuante estava.
  if (hidden) return <div {...props}>{children}</div>;
  return (
    <motion.div {...props} layout="position" layoutId={task.data.id}
      initial={fresh ? { opacity: 0, y: -8, scale: 0.97 } : false} animate={{ opacity: 1, y: 0, scale: 1 }}>
      {children}
    </motion.div>
  );
}
