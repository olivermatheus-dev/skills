// Painel da tarefa (compacto): título, propriedades em linhas, descrição + checklist, comentários (Oliver ↔ IA) e atividade.
// Tudo no mesmo arquivo T-NNNN.md: o editor mexe só na descrição/checklist; comentários e log são seções próprias.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity as ActivityIcon, ArrowRight, Check, ChevronDown, ChevronRight, CornerDownLeft, Loader2, MessageSquareWarning, Play, SquareTerminal } from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import type { Task } from '../../api';
import { MarkdownEditor } from '../Markdown';
import { Drawer, ErrorBox, Select, cx } from '../kit';
import {
  ASSIGNEES, BOARD_OPTS, COLUMNS, PRIORITY_OPTS, STATUS_LABEL, assigneeLabel, checklist, fmtStamp, isAi, isLate, isReady, joinTaskBody,
  normalizeBody, splitTaskBody, taskThread, type BoardName, type Priority, type Status, type TaskComment, type TaskDoc,
} from './taskUtils';
import { WhoAvatar, WhoChip, WhoName, whoLabel, useWhoColor } from './Who';
import { isSystem } from '../../../../schema/task';
import type { useTaskActions } from './useTaskActions';
import type { useRunner } from './useRunner';

type Actions = ReturnType<typeof useTaskActions>;
type Runner = ReturnType<typeof useRunner>;

interface Form {
  title: string; board: BoardName; assignee: string; priority: Priority; due: string;
  depends: string; parent: string; links: string; context: string;
}
const toForm = (t: Task): Form => ({
  title: t.title, board: t.board, assignee: t.assignee, priority: t.priority, due: t.due ?? '',
  depends: t.depends.join(', '), parent: t.parent ?? '', links: t.links.join('\n'), context: t.context.join('\n'),
});
const splitList = (s: string, re: RegExp) => s.split(re).map((x) => x.trim()).filter(Boolean);
const mainOf = (body: string) => splitTaskBody(body).main;

/** Controle "sem borda até passar o mouse" (estilo Linear), para as propriedades caberem em linhas. */
const ctl = 'w-full h-7 rounded-md border border-transparent bg-transparent px-1.5 text-sm outline-none hover:border-border focus:border-primary/60 focus:bg-card';

export function TaskDrawer({ slug, task, allTasks, onClose, onMove, actions, runner }: {
  slug: string; task: TaskDoc | null; allTasks: TaskDoc[]; onClose: () => void; onMove: (id: string, s: Status) => void; actions: Actions; runner: Runner;
}) {
  const guard = useRef<() => boolean>(() => true);
  return (
    <Drawer open={!!task} onClose={onClose} canClose={() => guard.current()} width="max-w-2xl" dense
      title={task ? (
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="font-mono text-xs">{task.data.id}</span>
          <span className="text-[11px] rounded-full border border-border px-1.5 py-px text-foreground">{STATUS_LABEL[task.data.status]}</span>
          <WhoChip who={task.data.assignee} />
        </span>
      ) : ''}>
      {task && <TaskEditor key={task.data.id} slug={slug} task={task} allTasks={allTasks} onMove={onMove} onClose={onClose} guard={guard} actions={actions} runner={runner} />}
    </Drawer>
  );
}

function TaskEditor({ task, allTasks, onMove, onClose, guard, actions, runner }: {
  slug: string; task: TaskDoc; allTasks: TaskDoc[]; onMove: (id: string, s: Status) => void; onClose: () => void;
  guard: React.MutableRefObject<() => boolean>; actions: Actions; runner: Runner;
}) {
  const [base, setBase] = useState(() => toForm(task.data));
  const [f, setF] = useState(base);
  const [baseMain, setBaseMain] = useState(() => mainOf(task.body));
  const [main, setMain] = useState(baseMain);
  const [custom, setCustom] = useState(!ASSIGNEES.includes(task.data.assignee));
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setSaved(false); };

  // O arquivo mudou por fora (agente, heartbeat, comentário, mover card) e não há edição local → acompanha.
  const fieldsDirty = JSON.stringify(f) !== JSON.stringify(base);
  const mainDirty = normalizeBody(main).trim() !== normalizeBody(baseMain).trim();
  useEffect(() => {
    if (!fieldsDirty) { const nf = toForm(task.data); setBase(nf); setF(nf); }
    if (!mainDirty) { const m = mainOf(task.body); setBaseMain(m); setMain(m); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  // Salvar é otimista. O corpo junta a descrição editada com os comentários e o log ATUAIS do arquivo
  // (o que a IA escreveu enquanto você editava não se perde).
  const [saveError, setSaveError] = useState<unknown>(null);
  const save = () => {
    const prev = { base, baseMain };
    const nb = mainDirty ? joinTaskBody({ ...splitTaskBody(task.body), main: normalizeBody(main) }) : undefined;
    setSaveError(null); setBase(f); if (mainDirty) setBaseMain(main); setSaved(true);
    void actions.save(task.data.id, {
      title: f.title.trim(), board: f.board, assignee: f.assignee.trim(), priority: f.priority,
      // null limpa o campo (undefined manteria o valor anterior do arquivo)
      due: (f.due || null) as unknown as string | undefined,
      parent: (f.parent.trim() || null) as unknown as string | undefined,
      depends: splitList(f.depends, /[,\s]+/),
      links: splitList(f.links, /\n/),
      context: splitList(f.context, /\n/),
    }, nb, {
      onError: (e) => { setSaveError(e); setSaved(false); setBase(prev.base); setBaseMain(prev.baseMain); },
    });
  };

  const dirty = fieldsDirty || mainDirty;
  const ck = checklist(main);
  const byId = useMemo(() => new Map(allTasks.map((t) => [t.data.id, t])), [allTasks]);
  const deps = task.data.depends.map((id) => ({ id, t: byId.get(id) }));
  const children = allTasks.filter((t) => t.data.parent === task.data.id);
  const { comments, pending } = taskThread(task.body);
  const log = splitTaskBody(task.body).log;

  const okToClose = () => !dirty || confirm('Descartar as alterações não salvas?');
  guard.current = okToClose;
  const close = () => { if (okToClose()) onClose(); };
  // Arquivar é otimista (sai do quadro na hora) e tem "Desfazer" no aviso — sem pergunta de confirmação.
  const archive = () => { actions.archive(task); onClose(); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (dirty && f.title.trim()) save(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const t = task.data;
  const running = runner.status?.running && runner.status.task === t.id;
  const late = isLate({ ...t, due: f.due || undefined });
  return (
    <div>
      <textarea
        aria-label="Título" rows={1}
        className="w-full resize-none text-lg font-semibold leading-snug tracking-tight bg-transparent outline-none rounded-md -mx-1.5 px-1.5 py-0.5 hover:bg-muted/60 focus:bg-muted/60 [field-sizing:content]"
        value={f.title} onChange={(e) => set('title', e.target.value.replace(/\n/g, ' '))} placeholder="Título"
      />

      <NextStep task={task} byId={byId} pending={pending} running={!!running} onMove={onMove} actions={actions} runner={runner} />

      <div className="grid grid-cols-2 gap-x-4 mt-2">
        <Prop label="Status">
          <Select aria-label="Status" className={ctl} value={t.status} onChange={(e) => onMove(t.id, e.target.value as Status)}>
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Prop>
        <Prop label="Responsável">
          {custom ? (
            <input className={cx(ctl, 'font-mono')} value={f.assignee} onChange={(e) => set('assignee', e.target.value)} placeholder="agent:nome"
              onBlur={() => { if (ASSIGNEES.includes(f.assignee)) setCustom(false); }} />
          ) : (
            <Select className={ctl} value={f.assignee} onChange={(e) => (e.target.value === '__custom' ? (setCustom(true), set('assignee', 'agent:')) : set('assignee', e.target.value))}>
              <option value="oliver">Oliver</option>
              {ASSIGNEES.filter((a) => a !== 'oliver').map((a) => <option key={a} value={a}>{a === 'ai' ? 'IA (orquestrador)' : assigneeLabel(a)}</option>)}
              <option value="__custom">Outro…</option>
            </Select>
          )}
        </Prop>
        <Prop label="Prioridade">
          <Select className={ctl} value={f.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
            {PRIORITY_OPTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
        </Prop>
        <Prop label="Quadro">
          <Select className={ctl} value={f.board} onChange={(e) => set('board', e.target.value as BoardName)}>
            {BOARD_OPTS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </Select>
        </Prop>
        <Prop label="Prazo">
          <input type="date" className={cx(ctl, late && 'text-destructive')} value={f.due} onChange={(e) => set('due', e.target.value)} title={late ? 'Atrasada' : undefined} />
        </Prop>
        <Prop label="Tarefa-mãe">
          <input className={cx(ctl, 'font-mono')} placeholder="—" value={f.parent} onChange={(e) => set('parent', e.target.value)} list="hub-task-ids" />
        </Prop>
      </div>

      <MoreFields open={!!(t.depends.length || t.links.length || t.context.length)}>
        <Prop label="Depende de">
          <input className={cx(ctl, 'font-mono')} placeholder="T-0000, T-0000" value={f.depends} onChange={(e) => set('depends', e.target.value)} />
        </Prop>
        {(deps.length > 0 || children.length > 0) && (
          <div className="ml-24 mb-1 flex flex-wrap gap-1 text-[11px]">
            {deps.map(({ id, t: d }) => (
              <span key={id} className={cx('px-1.5 py-px rounded border', d?.data.status === 'done' ? 'border-green-200 text-success bg-green-50' : 'border-amber-200 text-amber-700 bg-amber-50')}
                title={d ? `${d.data.title} (${d.data.status})` : 'não encontrada'}>
                {id} · {d ? (d.data.status === 'done' ? 'feita' : STATUS_LABEL[d.data.status]) : '?'}
              </span>
            ))}
            {children.map((c) => (
              <span key={c.data.id} className="px-1.5 py-px rounded border border-border text-muted-foreground" title={c.data.title}>↳ {c.data.id} · {STATUS_LABEL[c.data.status]}</span>
            ))}
          </div>
        )}
        <Prop label="Links" top>
          <textarea rows={2} className={cx(ctl, 'h-auto py-1 font-mono text-xs resize-y')} placeholder="um por linha (caminho no repo ou URL)" value={f.links} onChange={(e) => set('links', e.target.value)} />
        </Prop>
        <Prop label="Contexto" top>
          <textarea rows={2} className={cx(ctl, 'h-auto py-1 font-mono text-xs resize-y')} placeholder="o que a IA lê, um por linha: context/BUSINESS.md#Modelo e preço (sem vírgula)"
            title="A IA lê só isto (e a tarefa). Seções disponíveis: node tools/contexto.mjs indice <slug>" value={f.context} onChange={(e) => set('context', e.target.value)} />
        </Prop>
      </MoreFields>
      <datalist id="hub-task-ids">{allTasks.map((x) => <option key={x.data.id} value={x.data.id}>{x.data.title}</option>)}</datalist>

      <SectionTitle right={ck.all > 0 ? `${ck.done}/${ck.all}` : undefined}>Descrição e checklist</SectionTitle>
      <MarkdownEditor value={main} onChange={setMain} minHeight={110} />

      <SectionTitle right={comments.length ? `${comments.length}` : undefined}>Comentários</SectionTitle>
      <Thread comments={comments} />
      <CommentBox task={task} actions={actions} />

      <Activity log={log} />

      <div className="sticky bottom-0 -mx-5 mt-4 px-5 py-2 bg-card border-t border-border">
        {saveError ? <div className="mb-2 max-h-40 overflow-y-auto"><ErrorBox error={saveError} /></div> : null}
        <div className="flex items-center gap-1.5">
          <UiButton size="sm" disabled={!dirty || !f.title.trim()} onClick={save}>Salvar</UiButton>
          <UiButton size="sm" variant="ghost" onClick={close}>Fechar</UiButton>
          <UiButton size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={archive} title="Move o arquivo para board/arquivo/ (não é apagado). Dá para desfazer no aviso.">Arquivar</UiButton>
          <span className="ml-1 text-xs text-muted-foreground whitespace-nowrap">{dirty ? 'Não salvo · Ctrl+S' : saved ? 'Salvo ✓' : ''}</span>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono truncate" title={task.file}>{task.file.split(/[\\/]/).pop()}</span>
        </div>
      </div>
    </div>
  );
}

function Prop({ label, children, top }: { label: string; children: React.ReactNode; top?: boolean }) {
  return (
    <div className={cx('flex gap-2 min-h-8', top ? 'items-start pt-1' : 'items-center')}>
      <span className={cx('w-22 shrink-0 text-xs text-muted-foreground', top && 'pt-1')}>{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/** Faixa "próximo passo": o que fazer com a tarefa agora, conforme status e responsável. */
function NextStep({ task, byId, pending, running, onMove, actions, runner }: {
  task: TaskDoc; byId: Map<string, TaskDoc>; pending: TaskComment | null; running: boolean;
  onMove: (id: string, s: Status) => void; actions: Actions; runner: Runner;
}) {
  const t = task.data;
  const box = 'mt-2 rounded-md border px-2.5 py-1.5 text-xs flex flex-wrap items-center gap-x-2 gap-y-1.5';
  if (running) {
    return <div className={cx(box, 'border-primary/30 bg-primary-soft/60')}><Loader2 className="size-3.5 animate-spin text-primary" /> A IA está trabalhando nesta tarefa.</div>;
  }
  const ready = isReady(t, byId);
  if (t.status === 'review' || (pending && !ready)) {
    return (
      <div className={cx(box, 'border-amber-200 bg-amber-50/70')}>
        <MessageSquareWarning className="size-3.5 text-amber-700" />
        <span className="flex-1 min-w-40">{pending ? <><WhoName who={pending.who} /> {pending.kind === 'pergunta' ? 'fez uma pergunta' : 'pediu revisão'}</> : 'Esperando você conferir'}</span>
        <UiButton size="xs" variant="outline" onClick={() => actions.comment(t.id, { text: 'Aprovado.', status: 'done' })}><Check /> Concluir</UiButton>
        <UiButton size="xs" onClick={() => actions.comment(t.id, { text: 'Aprovado, pode seguir.', status: 'todo', assignee: 'ai' })}><ArrowRight /> Aprovar e devolver à IA</UiButton>
      </div>
    );
  }
  if (isAi(t.assignee) && t.status === 'backlog') {
    return (
      <div className={cx(box, 'border-border bg-muted/50')}>
        <span className="flex-1 min-w-40 text-muted-foreground">Da IA, no backlog: aprovar = mover para A fazer.</span>
        <UiButton size="xs" onClick={() => onMove(t.id, 'todo')}><Check /> Aprovar</UiButton>
      </div>
    );
  }
  if (ready) {
    const busy = runner.run.isPending;
    const naFila = runner.status?.fila.find((f) => f.kind === 'quadro' && f.task === t.id); // 046 F
    return (
      <div className={cx(box, 'border-primary/25 bg-primary-soft/40')}>
        <span className="flex-1 min-w-40">{naFila ? `Na fila da IA (${naFila.posicao}º): começa sozinha quando a anterior acabar` : 'Pronta para a IA'}</span>
        <UiButton size="xs" variant="outline" disabled={busy} onClick={() => runner.run.mutate({ mode: 'terminal', task: t.id })}><SquareTerminal /> No terminal</UiButton>
        {!naFila && <UiButton size="xs" variant="ai" disabled={busy} onClick={() => runner.run.mutate({ mode: 'background', task: t.id })}><Play /> {runner.running ? 'Pôr na fila' : 'Rodar agora'}</UiButton>}
      </div>
    );
  }
  return null;
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-1.5">
      <div className="text-xs font-medium text-muted-foreground">{children}</div>
      {right && <div className="text-[11px] text-muted-foreground tabular-nums">{right}</div>}
    </div>
  );
}

function MoreFields({ open: initial, children }: { open: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(initial);
  return open ? <>{children}</> : (
    <button type="button" onClick={() => setOpen(true)} className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
      <ChevronRight className="size-3.5" /> Dependências, links e contexto
    </button>
  );
}

const KIND_TAG: Record<string, string> = { revisar: 'Revisar', pergunta: 'Pergunta' };

function Thread({ comments }: { comments: TaskComment[] }) {
  if (!comments.length) return <div className="text-xs text-muted-foreground mb-2">Nenhum comentário. A IA registra aqui o que fez e o que você precisa revisar.</div>;
  return (
    <ol className="flex flex-col gap-2 mb-2">
      {comments.map((c, i) => (isSystem(c.who) ? <SystemLine key={i} c={c} /> : <CommentItem key={i} c={c} />))}
    </ol>
  );
}

function CommentItem({ c }: { c: TaskComment }) {
  const color = useWhoColor(c.who);
  const ask = c.kind !== 'nota' && c.who !== 'oliver';
  return (
    <li className="flex gap-2">
      <WhoAvatar who={c.who} size="md" className="mt-0.5" />
      <div className={cx('flex-1 min-w-0 rounded-md border px-2.5 py-1.5', ask ? 'border-amber-200 bg-amber-50/50' : 'border-border bg-card')}
        style={c.who !== 'oliver' && !ask ? { borderLeft: `2px solid ${color}` } : undefined}>
        <div className="flex items-center gap-1.5 text-xs">
          <WhoName who={c.who} />
          <span className="text-muted-foreground">{fmtStamp(c.at)}</span>
          {KIND_TAG[c.kind] && <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 text-[10px] font-medium">{KIND_TAG[c.kind]}</span>}
        </div>
        <div className="text-sm whitespace-pre-wrap break-words mt-0.5">{c.text}</div>
      </div>
    </li>
  );
}

/** Mensagem de sistema (heartbeat): uma linha discreta, sem balão. */
function SystemLine({ c }: { c: TaskComment }) {
  return (
    <li className="flex items-start gap-2 pl-1 text-[11px] text-muted-foreground" title={c.text}>
      <ActivityIcon className="size-3 mt-0.5 shrink-0" />
      <span className="min-w-0 truncate">{c.text}</span>
      <span className="ml-auto shrink-0 tabular-nums">{fmtStamp(c.at)}</span>
    </li>
  );
}

function CommentBox({ task, actions }: { task: TaskDoc; actions: Actions }) {
  const [text, setText] = useState('');
  const t = task.data;
  const send = (handBack: boolean) => {
    const v = text.trim();
    if (!v) return;
    actions.comment(t.id, handBack ? { text: v, status: 'todo', assignee: isAi(t.assignee) ? t.assignee : 'ai' } : { text: v });
    setText('');
  };
  // devolver à IA faz sentido quando a bola está com o Oliver (revisão, ou tarefa dele parada)
  const canHandBack = t.status === 'review' || t.assignee === 'oliver';
  return (
    <div className="rounded-md border border-border bg-card focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
      <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder="Comentar ou dar uma instrução para a IA…"
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(false); } }}
        className="w-full resize-none bg-transparent px-2.5 py-1.5 text-sm outline-none [field-sizing:content] min-h-8 max-h-48" />
      {text.trim() && (
        <div className="flex items-center gap-1.5 px-1.5 pb-1.5">
          <span className="text-[11px] text-muted-foreground pl-1">Ctrl+Enter</span>
          <div className="ml-auto flex gap-1.5">
            {canHandBack && (
              <UiButton size="xs" variant="outline" onClick={() => send(true)} title="Comenta, volta para A fazer e passa para a IA"><ArrowRight /> Comentar e devolver à IA</UiButton>
            )}
            <UiButton size="xs" onClick={() => send(false)}><CornerDownLeft /> Comentar</UiButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Activity({ log }: { log: string[] }) {
  const [open, setOpen] = useState(false);
  if (!log.length) return null;
  return (
    <div className="mt-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />} Atividade <span className="font-normal tabular-nums">{log.length}</span>
      </button>
      {open && (
        <ol className="mt-1.5 border-l border-border ml-1.5 pl-3 flex flex-col gap-1">
          {log.map((l, i) => {
            const [date, who, ...rest] = l.split(' · ');
            return (
              <li key={i} className="text-[11px] text-muted-foreground">
                {rest.length ? <><span className="tabular-nums">{date}</span> · <span className="text-foreground">{whoLabel(who)}</span> · {rest.join(' · ')}</> : l}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
