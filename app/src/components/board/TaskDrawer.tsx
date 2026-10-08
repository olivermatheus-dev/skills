// Painel de edição da tarefa: campos do frontmatter + corpo em markdown (checklist e log).
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '../../api';
import { MarkdownEditor } from '../Markdown';
import { Button, Drawer, ErrorBox, Field, Input, Select, Textarea, cx } from '../kit';
import {
  ASSIGNEES, BOARD_OPTS, COLUMNS, PRIORITY_OPTS, assigneeLabel, checklist, isLate, normalizeBody,
  type BoardName, type Priority, type Status, type TaskDoc,
} from './taskUtils';
import { AssigneeBadge } from './TaskCard';
import type { useTaskActions } from './useTaskActions';

type Actions = ReturnType<typeof useTaskActions>;

interface Form {
  title: string; board: BoardName; assignee: string; priority: Priority; due: string;
  depends: string; parent: string; links: string;
}
const toForm = (t: Task): Form => ({
  title: t.title, board: t.board, assignee: t.assignee, priority: t.priority, due: t.due ?? '',
  depends: t.depends.join(', '), parent: t.parent ?? '', links: t.links.join('\n'),
});
const splitList = (s: string, re: RegExp) => s.split(re).map((x) => x.trim()).filter(Boolean);

export function TaskDrawer({ slug, task, allTasks, onClose, onMove, actions }: {
  slug: string; task: TaskDoc | null; allTasks: TaskDoc[]; onClose: () => void; onMove: (id: string, s: Status) => void; actions: Actions;
}) {
  const guard = useRef<() => boolean>(() => true);
  return (
    <Drawer open={!!task} onClose={onClose} canClose={() => guard.current()} width="max-w-3xl"
      title={task ? <span className="flex items-center gap-2"><span className="font-mono text-muted-foreground text-sm">{task.data.id}</span><AssigneeBadge assignee={task.data.assignee} /></span> : ''}>
      {task && <TaskEditor key={task.data.id} slug={slug} task={task} allTasks={allTasks} onMove={onMove} onClose={onClose} guard={guard} actions={actions} />}
    </Drawer>
  );
}

function TaskEditor({ task, allTasks, onMove, onClose, guard, actions }: {
  slug: string; task: TaskDoc; allTasks: TaskDoc[]; onMove: (id: string, s: Status) => void; onClose: () => void; guard: React.MutableRefObject<() => boolean>; actions: Actions;
}) {
  const [base, setBase] = useState(() => toForm(task.data));
  const [f, setF] = useState(base);
  const [baseBody, setBaseBody] = useState(task.body);
  const [body, setBody] = useState(task.body);
  const [custom, setCustom] = useState(!ASSIGNEES.includes(task.data.assignee));
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setSaved(false); };

  // O arquivo mudou por fora (agente, heartbeat, mover card) e não há edição local → acompanha.
  const fieldsDirty = JSON.stringify(f) !== JSON.stringify(base);
  const bodyDirty = normalizeBody(body).trim() !== normalizeBody(baseBody).trim();
  useEffect(() => {
    if (!fieldsDirty) { const nf = toForm(task.data); setBase(nf); setF(nf); }
    if (!bodyDirty) { setBaseBody(task.body); setBody(task.body); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  // Salvar é otimista: o quadro e o painel mostram o novo valor na hora; erro → volta a "não salvo" com o erro.
  const [saveError, setSaveError] = useState<unknown>(null);
  const save = () => {
    const prev = { base, baseBody };
    const nb = bodyDirty ? normalizeBody(body) : undefined;
    setSaveError(null); setBase(f); if (nb !== undefined) setBaseBody(body); setSaved(true);
    void actions.save(task.data.id, {
      title: f.title.trim(), board: f.board, assignee: f.assignee.trim(), priority: f.priority,
      // null limpa o campo (undefined manteria o valor anterior do arquivo)
      due: (f.due || null) as unknown as string | undefined,
      parent: (f.parent.trim() || null) as unknown as string | undefined,
      depends: splitList(f.depends, /[,\s]+/),
      links: splitList(f.links, /\n/),
    }, nb, {
      onError: (e) => { setSaveError(e); setSaved(false); setBase(prev.base); setBaseBody(prev.baseBody); },
    });
  };

  const dirty = fieldsDirty || bodyDirty;
  const ck = checklist(body);
  const byId = useMemo(() => new Map(allTasks.map((t) => [t.data.id, t])), [allTasks]);
  const deps = task.data.depends.map((id) => ({ id, t: byId.get(id) }));
  const children = allTasks.filter((t) => t.data.parent === task.data.id);

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

  return (
    <div>
      <input
        aria-label="Título"
        className="w-full text-xl font-semibold tracking-tight bg-transparent outline-none border-b border-transparent focus:border-border pb-1 mb-5"
        value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Título"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
        <Field label="Status">
          <Select aria-label="Status" className="w-full" value={task.data.status} onChange={(e) => onMove(task.data.id, e.target.value as Status)}>
            {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Quadro">
          <Select className="w-full" value={f.board} onChange={(e) => set('board', e.target.value as BoardName)}>
            {BOARD_OPTS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </Select>
        </Field>
        <Field label="Prioridade">
          <Select className="w-full" value={f.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
            {PRIORITY_OPTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
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
        <Field label="Prazo" hint={isLate({ ...task.data, due: f.due || undefined }) ? 'Atrasada' : undefined}>
          <div className="flex gap-1">
            <Input type="date" className={cx('w-full min-w-0', isLate({ ...task.data, due: f.due || undefined }) && 'text-destructive border-red-200')} value={f.due} onChange={(e) => set('due', e.target.value)} />
            {f.due && <Button variant="ghost" type="button" title="Limpar prazo" onClick={() => set('due', '')}>×</Button>}
          </div>
        </Field>
        <Field label="Tarefa-mãe">
          <Input className="w-full font-mono" placeholder="T-0000" value={f.parent} onChange={(e) => set('parent', e.target.value)} list="hub-task-ids" />
        </Field>
      </div>

      <Field label="Depende de" hint="IDs separados por vírgula (ex.: T-0011, T-0012)">
        <Input className="w-full font-mono" placeholder="T-0000, T-0000" value={f.depends} onChange={(e) => set('depends', e.target.value)} />
      </Field>
      {(deps.length > 0 || children.length > 0) && (
        <div className="-mt-2 mb-4 flex flex-wrap gap-1.5 text-xs">
          {deps.map(({ id, t }) => (
            <span key={id} className={cx('px-2 py-0.5 rounded border', t?.data.status === 'done' ? 'border-green-200 text-success bg-green-50' : 'border-amber-200 text-amber-700 bg-amber-50')}
              title={t ? `${t.data.title} (${t.data.status})` : 'não encontrada'}>
              ⛓ {id} · {t ? (t.data.status === 'done' ? 'feita' : t.data.status) : '?'}
            </span>
          ))}
          {children.map((c) => (
            <span key={c.data.id} className="px-2 py-0.5 rounded border border-border text-muted-foreground" title={c.data.title}>↳ {c.data.id} · {c.data.status}</span>
          ))}
        </div>
      )}
      <datalist id="hub-task-ids">{allTasks.map((t) => <option key={t.data.id} value={t.data.id}>{t.data.title}</option>)}</datalist>

      <Field label="Links" hint="Um por linha (caminho no repo ou URL)">
        <Textarea rows={2} className="font-mono text-xs" value={f.links} onChange={(e) => set('links', e.target.value)} />
      </Field>

      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição, checklist e log</div>
        {ck.all > 0 && <div className="text-xs text-muted-foreground">Checklist {ck.done}/{ck.all}</div>}
      </div>
      <MarkdownEditor value={body} onChange={setBody} minHeight={260} />

      <div className="sticky bottom-0 -mx-6 mt-6 px-6 py-3 bg-card border-t border-border">
        {saveError ? <div className="-mt-3 mb-3 max-h-40 overflow-y-auto"><ErrorBox error={saveError} /></div> : null}
        <div className="flex items-center gap-3">
        <Button disabled={!dirty || !f.title.trim()} onClick={save}>Salvar</Button>
        <Button variant="ghost" onClick={close}>Fechar</Button>
        <Button variant="danger" onClick={archive} title="Move o arquivo para board/arquivo/ (não é apagado). Dá para desfazer no aviso.">Arquivar</Button>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{dirty ? 'Alterações não salvas · Ctrl+S' : saved ? 'Salvo ✓' : ''}</span>
        <span className="ml-auto text-xs text-muted-foreground font-mono truncate" title={task.file}>{task.file}</span>
        </div>
      </div>
    </div>
  );
}
