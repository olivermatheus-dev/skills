// Painel da tarefa: título, propriedades, descrição + checklist (editor), comentários (Oliver ↔ IA) e atividade (log).
// Tudo no mesmo arquivo T-NNNN.md: o editor mexe só na descrição/checklist; comentários e log são seções próprias.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronRight, CornerDownLeft, Loader2, MessageSquareWarning, Play, SquareTerminal } from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import type { Task } from '../../api';
import { MarkdownEditor } from '../Markdown';
import { Button, Drawer, ErrorBox, Field, Input, Select, Textarea, cx } from '../kit';
import {
  ASSIGNEES, BOARD_OPTS, COLUMNS, PRIORITY_OPTS, STATUS_LABEL, assigneeLabel, checklist, fmtStamp, isAi, isLate, isReady, joinTaskBody,
  normalizeBody, splitTaskBody, taskThread, type BoardName, type Priority, type Status, type TaskComment, type TaskDoc,
} from './taskUtils';
import { AssigneeBadge } from './TaskCard';
import { WhoAvatar, whoLabel } from './Who';
import type { useTaskActions } from './useTaskActions';
import type { useRunner } from './useRunner';

type Actions = ReturnType<typeof useTaskActions>;
type Runner = ReturnType<typeof useRunner>;

interface Form {
  title: string; board: BoardName; assignee: string; priority: Priority; due: string;
  depends: string; parent: string; links: string;
}
const toForm = (t: Task): Form => ({
  title: t.title, board: t.board, assignee: t.assignee, priority: t.priority, due: t.due ?? '',
  depends: t.depends.join(', '), parent: t.parent ?? '', links: t.links.join('\n'),
});
const splitList = (s: string, re: RegExp) => s.split(re).map((x) => x.trim()).filter(Boolean);
const mainOf = (body: string) => splitTaskBody(body).main;

export function TaskDrawer({ slug, task, allTasks, onClose, onMove, actions, runner }: {
  slug: string; task: TaskDoc | null; allTasks: TaskDoc[]; onClose: () => void; onMove: (id: string, s: Status) => void; actions: Actions; runner: Runner;
}) {
  const guard = useRef<() => boolean>(() => true);
  return (
    <Drawer open={!!task} onClose={onClose} canClose={() => guard.current()} width="max-w-3xl"
      title={task ? (
        <span className="flex items-center gap-2.5">
          <span className="font-mono text-muted-foreground text-sm">{task.data.id}</span>
          <span className="text-xs font-medium rounded-full border border-border px-2 py-0.5">{STATUS_LABEL[task.data.status]}</span>
          <AssigneeBadge assignee={task.data.assignee} />
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
  return (
    <div>
      <input
        aria-label="Título"
        className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none border-b border-transparent focus:border-border pb-1 mb-4"
        value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Título"
      />

      <NextStep task={task} byId={byId} pending={pending} running={!!running} onMove={onMove} actions={actions} runner={runner} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
        <Field label="Status">
          <Select aria-label="Status" className="w-full" value={t.status} onChange={(e) => onMove(t.id, e.target.value as Status)}>
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Responsável" hint={custom ? 'oliver · ai · agent:<nome>' : undefined}>
          {custom ? (
            <div className="flex gap-1">
              <Input className="w-full min-w-0 font-mono" value={f.assignee} onChange={(e) => set('assignee', e.target.value)} placeholder="agent:nome" />
              <Button variant="ghost" type="button" title="Voltar à lista" onClick={() => { setCustom(false); if (!ASSIGNEES.includes(f.assignee)) set('assignee', base.assignee && ASSIGNEES.includes(base.assignee) ? base.assignee : 'oliver'); }}>↺</Button>
            </div>
          ) : (
            <Select className="w-full" value={f.assignee} onChange={(e) => (e.target.value === '__custom' ? (setCustom(true), set('assignee', 'agent:')) : set('assignee', e.target.value))}>
              <optgroup label="Pessoas"><option value="oliver">Oliver</option></optgroup>
              <optgroup label="IA">
                {ASSIGNEES.filter((a) => a !== 'oliver').map((a) => <option key={a} value={a}>{a === 'ai' ? 'IA (orquestrador)' : assigneeLabel(a)}</option>)}
              </optgroup>
              <option value="__custom">Outro…</option>
            </Select>
          )}
        </Field>
        <Field label="Prioridade">
          <Select className="w-full" value={f.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
            {PRIORITY_OPTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
        </Field>
        <Field label="Quadro">
          <Select className="w-full" value={f.board} onChange={(e) => set('board', e.target.value as BoardName)}>
            {BOARD_OPTS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </Select>
        </Field>
        <Field label="Prazo" hint={isLate({ ...t, due: f.due || undefined }) ? 'Atrasada' : undefined}>
          <div className="flex gap-1">
            <Input type="date" className={cx('w-full min-w-0', isLate({ ...t, due: f.due || undefined }) && 'text-destructive border-red-200')} value={f.due} onChange={(e) => set('due', e.target.value)} />
            {f.due && <Button variant="ghost" type="button" title="Limpar prazo" onClick={() => set('due', '')}>×</Button>}
          </div>
        </Field>
        <Field label="Tarefa-mãe">
          <Input className="w-full font-mono" placeholder="T-0000" value={f.parent} onChange={(e) => set('parent', e.target.value)} list="hub-task-ids" />
        </Field>
      </div>

      <MoreFields open={!!(t.depends.length || t.links.length)}>
        <Field label="Depende de" hint="IDs separados por vírgula (ex.: T-0011, T-0012)">
          <Input className="w-full font-mono" placeholder="T-0000, T-0000" value={f.depends} onChange={(e) => set('depends', e.target.value)} />
        </Field>
        {(deps.length > 0 || children.length > 0) && (
          <div className="-mt-2 mb-4 flex flex-wrap gap-1.5 text-xs">
            {deps.map(({ id, t: d }) => (
              <span key={id} className={cx('px-2 py-0.5 rounded border', d?.data.status === 'done' ? 'border-green-200 text-success bg-green-50' : 'border-amber-200 text-amber-700 bg-amber-50')}
                title={d ? `${d.data.title} (${d.data.status})` : 'não encontrada'}>
                {id} · {d ? (d.data.status === 'done' ? 'feita' : STATUS_LABEL[d.data.status]) : '?'}
              </span>
            ))}
            {children.map((c) => (
              <span key={c.data.id} className="px-2 py-0.5 rounded border border-border text-muted-foreground" title={c.data.title}>↳ {c.data.id} · {STATUS_LABEL[c.data.status]}</span>
            ))}
          </div>
        )}
        <Field label="Links" hint="Um por linha (caminho no repo ou URL): entregas, peças, referências">
          <Textarea rows={2} className="font-mono text-xs" value={f.links} onChange={(e) => set('links', e.target.value)} />
        </Field>
      </MoreFields>
      <datalist id="hub-task-ids">{allTasks.map((x) => <option key={x.data.id} value={x.data.id}>{x.data.title}</option>)}</datalist>

      <SectionTitle right={ck.all > 0 ? `Checklist ${ck.done}/${ck.all}` : undefined}>Descrição e checklist</SectionTitle>
      <MarkdownEditor value={main} onChange={setMain} minHeight={160} />

      <SectionTitle right={comments.length ? `${comments.length}` : undefined}>Comentários</SectionTitle>
      <Thread comments={comments} />
      <CommentBox task={task} actions={actions} />

      <Activity log={log} />

      <div className="sticky bottom-0 -mx-6 mt-6 px-6 py-3 bg-card border-t border-border">
        {saveError ? <div className="-mt-3 mb-3 max-h-40 overflow-y-auto"><ErrorBox error={saveError} /></div> : null}
        <div className="flex items-center gap-3">
          <Button disabled={!dirty || !f.title.trim()} onClick={save}>Salvar</Button>
          <Button variant="ghost" onClick={close}>Fechar</Button>
          <Button variant="danger" onClick={archive} title="Move o arquivo para board/arquivo/ (não é apagado). Dá para desfazer no aviso.">Arquivar</Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{dirty ? 'Alterações não salvas · Ctrl+S' : saved ? 'Salvo ✓' : ''}</span>
          <span className="ml-auto text-xs text-muted-foreground font-mono truncate" title={task.file}>{task.file.split(/[\\/]/).pop()}</span>
        </div>
      </div>
    </div>
  );
}

/** Faixa "próximo passo": o que fazer com a tarefa agora, conforme status e responsável. */
function NextStep({ task, byId, pending, running, onMove, actions, runner }: {
  task: TaskDoc; byId: Map<string, TaskDoc>; pending: TaskComment | null; running: boolean;
  onMove: (id: string, s: Status) => void; actions: Actions; runner: Runner;
}) {
  const t = task.data;
  const box = 'mb-5 rounded-lg border px-3.5 py-3 text-sm flex flex-wrap items-center gap-x-3 gap-y-2';
  if (running) {
    return <div className={cx(box, 'border-primary/30 bg-primary-soft/60')}><Loader2 className="size-4 animate-spin text-primary" /> A IA está trabalhando nesta tarefa. Os comentários aparecem aqui quando ela registrar.</div>;
  }
  const ready = isReady(t, byId);
  if (t.status === 'review' || (pending && !ready)) {
    return (
      <div className={cx(box, 'border-amber-200 bg-amber-50/70')}>
        <MessageSquareWarning className="size-4 text-amber-700" />
        <span className="flex-1 min-w-48">{pending ? <>{whoLabel(pending.who)} {pending.kind === 'pergunta' ? 'fez uma pergunta' : 'pediu revisão'}. Responda nos comentários abaixo.</> : 'Esperando você conferir.'}</span>
        <UiButton size="sm" variant="outline" onClick={() => actions.comment(t.id, { text: 'Aprovado.', status: 'done' })}><Check /> Aprovar e concluir</UiButton>
        <UiButton size="sm" onClick={() => actions.comment(t.id, { text: 'Aprovado, pode seguir.', status: 'todo', assignee: 'ai' })}><ArrowRight /> Aprovar e devolver à IA</UiButton>
      </div>
    );
  }
  if (isAi(t.assignee) && t.status === 'backlog') {
    return (
      <div className={cx(box, 'border-border bg-muted/50')}>
        <span className="flex-1 min-w-48 text-muted-foreground">Tarefa da IA no backlog. Aprovar = mover para <b className="text-foreground">A fazer</b>; ela entra no próximo Rodar IA.</span>
        <UiButton size="sm" onClick={() => onMove(t.id, 'todo')}><Check /> Aprovar</UiButton>
      </div>
    );
  }
  if (ready) {
    const busy = runner.running || runner.run.isPending;
    return (
      <div className={cx(box, 'border-primary/25 bg-primary-soft/40')}>
        <span className="flex-1 min-w-48">
          Pronta para a IA.
          {pending && <span className="block text-xs text-amber-800 mt-0.5">Último aviso de {whoLabel(pending.who)}: veja nos comentários.</span>}
        </span>
        <UiButton size="sm" variant="outline" disabled={busy} onClick={() => runner.run.mutate({ mode: 'terminal', task: t.id })}><SquareTerminal /> No terminal</UiButton>
        <UiButton size="sm" disabled={busy} onClick={() => runner.run.mutate({ mode: 'background', task: t.id })}><Play /> Rodar agora</UiButton>
      </div>
    );
  }
  return null;
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{children}</div>
      {right && <div className="text-xs text-muted-foreground tabular-nums">{right}</div>}
    </div>
  );
}

function MoreFields({ open: initial, children }: { open: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(initial);
  return open ? <>{children}</> : (
    <button type="button" onClick={() => setOpen(true)} className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
      <ChevronRight className="size-3.5" /> Dependências e links
    </button>
  );
}

const KIND_TAG: Record<string, string> = { revisar: 'Revisar', pergunta: 'Pergunta' };

function Thread({ comments }: { comments: TaskComment[] }) {
  if (!comments.length) return <div className="text-sm text-muted-foreground mb-3">Nenhum comentário. A IA registra aqui o que fez e o que você precisa revisar.</div>;
  return (
    <ol className="flex flex-col gap-3 mb-3">
      {comments.map((c, i) => {
        const fromOliver = c.who === 'oliver';
        return (
          <li key={i} className="flex gap-2.5">
            <WhoAvatar who={c.who} size="md" />
            <div className={cx('flex-1 min-w-0 rounded-lg border px-3 py-2', c.kind !== 'nota' && !fromOliver ? 'border-amber-200 bg-amber-50/50' : 'border-border bg-card')}>
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-medium">{whoLabel(c.who)}</span>
                <span className="text-muted-foreground">{fmtStamp(c.at)}</span>
                {KIND_TAG[c.kind] && <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-px text-[10px] font-medium">{KIND_TAG[c.kind]}</span>}
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">{c.text}</div>
            </div>
          </li>
        );
      })}
    </ol>
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
    <div className="flex gap-2.5">
      <WhoAvatar who="oliver" size="md" />
      <div className="flex-1 rounded-lg border border-border bg-card focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva um comentário, uma resposta ou uma instrução para a IA…"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(false); } }}
          className="w-full resize-y bg-transparent px-3 py-2 text-sm outline-none" />
        <div className="flex items-center gap-2 px-2 pb-2">
          <span className="text-[11px] text-muted-foreground pl-1">Ctrl+Enter comenta</span>
          <div className="ml-auto flex gap-1.5">
            {canHandBack && (
              <UiButton size="sm" variant="outline" disabled={!text.trim()} onClick={() => send(true)} title="Comenta, volta para A fazer e passa para a IA">
                <ArrowRight /> Comentar e devolver à IA
              </UiButton>
            )}
            <UiButton size="sm" disabled={!text.trim()} onClick={() => send(false)}><CornerDownLeft /> Comentar</UiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Activity({ log }: { log: string[] }) {
  const [open, setOpen] = useState(false);
  if (!log.length) return null;
  const shown = open ? log : log.slice(-3);
  return (
    <div className="mt-6">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground">
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />} Atividade <span className="normal-case font-normal tabular-nums">({log.length})</span>
      </button>
      <ol className="mt-2 border-l border-border ml-1.5 pl-4 flex flex-col gap-1.5">
        {!open && log.length > 3 && <li className="text-xs text-muted-foreground">… {log.length - 3} anteriores</li>}
        {shown.map((l, i) => {
          const [date, who, ...rest] = l.split(' · ');
          return (
            <li key={i} className="text-xs text-muted-foreground relative">
              <span className="absolute -left-[21px] top-1.5 size-1.5 rounded-full bg-border" />
              {rest.length ? <><span className="tabular-nums">{date}</span> · <span className="text-foreground font-medium">{whoLabel(who)}</span> · {rest.join(' · ')}</> : l}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
