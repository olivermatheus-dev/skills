// Banco de ideias (tarefa 012): quadro/lista por status, filtros e editor com a ficha de pauta.
// "Virar tarefa" cria a tarefa no Kanban (agent:estrategista) e liga as duas pontas.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Doc, type Idea, type Task } from '../api';
import { MessageCircle, Plus, Search, Tag as TagIcon, Target, Users } from 'lucide-react';
import { Button, Drawer, Empty, ErrorBox, Field, Input, PageHeader, Select, SelectField, cx } from '../components/kit';
import { FillBox } from '../components/fill';
import { MarkdownEditor } from '../components/Markdown';
import { TagChip, TagsInput, useProjectTags } from '../components/notes/TagsInput';
import { tidyMd } from '../components/notes/tidy';
import { nextSeqId, qk, realId, runOptimistic, trackCreate, upsertDoc, useCompetitors, useIdeas } from '../queries';
import { slugify } from '../../../core/platform';
import { FICHA_TEMPLATE, FORMATS, OBJECTIVES, STATUSES, TONES, label, type Objective, type Status, type Tone } from '../components/ideas/meta';
import { AppContent } from '../components/AppContent';
import { IdeasTabs } from '../components/ideas/IdeasTabs';

type View = 'quadro' | 'lista';
const VIEW_KEY = 'hub:ideas:view';
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Doc<Idea> => ({ data: { id: '' as Idea['id'], title: '', status: 'nova', tags: [], created: today(), origin: 'manual', refs: [] }, body: FICHA_TEMPLATE, file: '' });
/** caminho relativo à pasta da empresa (como os links das tarefas) */
const relToCompany = (file: string) => file.replace(/^companies\/[^/]+\//, '');

function ObjectiveBadge({ id }: { id?: Objective }) {
  if (!id) return null;
  const o = OBJECTIVES.find((x) => x.id === id);
  return <span className="inline-flex px-1.5 py-0 rounded-full text-[11px] font-medium" style={{ background: `${o?.color}1a`, color: o?.color }}>{o?.label ?? id}</span>;
}

export default function Ideas() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useIdeas(slug);
  const { data: competitors } = useCompetitors(slug);
  const { byId: tagDefs } = useProjectTags(slug);
  const compName = (id?: string) => competitors?.find((c) => c.data.id === id)?.data.name ?? id;

  const [view, setView] = useState<View>(() => { try { return (localStorage.getItem(VIEW_KEY) as View) || 'quadro'; } catch { return 'quadro'; } });
  const changeView = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* sem storage */ } };
  const [f, setF] = useState({ q: '', objective: '', tone: '', tag: '', competitor: '' });
  const [hideDiscarded, setHideDiscarded] = useState(false);
  const [open, setOpen] = useState<(Doc<Idea> & { error?: unknown; draft?: boolean }) | null>(null);

  const all = data ?? [];
  const tags = useMemo(() => [...new Set(all.flatMap((i) => i.data.tags))].sort(), [all]);
  const sources = useMemo(() => [...new Set(all.map((i) => i.data.source?.competitor).filter(Boolean) as string[])].sort(), [all]);
  const filtered = useMemo(() => all
    .filter((i) => !f.objective || i.data.objective === f.objective)
    .filter((i) => !f.tone || i.data.tone === f.tone)
    .filter((i) => !f.tag || i.data.tags.includes(f.tag))
    .filter((i) => !f.competitor || i.data.source?.competitor === f.competitor)
    .filter((i) => !f.q || fold(`${i.data.id} ${i.data.title} ${i.data.format ?? ''} ${i.body}`).includes(fold(f.q)))
    .sort((a, b) => b.data.id.localeCompare(a.data.id)), [all, f]);
  const anyFilter = Object.values(f).some(Boolean);
  const cols = STATUSES.filter((s) => !(hideDiscarded && s.id === 'descartada'));

  const card = (i: Doc<Idea>) => (
    <button key={i.data.id} onClick={() => setOpen(i)}
      className="w-full text-left bg-card border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-sm transition">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
        <span className="font-mono">{i.data.id}</span>
        {i.data.task && <span className="ml-auto font-mono text-primary-ink">→ {i.data.task}</span>}
      </div>
      <div className="text-sm font-medium leading-snug">{i.data.title}</div>
      <div className="flex flex-wrap items-center gap-1 mt-2">
        <ObjectiveBadge id={i.data.objective} />
        {i.data.tone && <span className="text-[11px] text-muted-foreground">· {label(TONES, i.data.tone).split(' /')[0]}</span>}
        {i.data.format && <span className="text-[11px] text-muted-foreground font-mono">· {i.data.format.replace(/^fmt-/, '')}</span>}
      </div>
      {(i.data.tags.length > 0 || i.data.source?.competitor) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {i.data.source?.competitor && <span className="text-[11px] text-muted-foreground">◉ {compName(i.data.source.competitor)}</span>}
          {i.data.tags.map((t) => <TagChip key={t} id={t} def={tagDefs[t]} small />)}
        </div>
      )}
    </button>
  );

  return (
    <AppContent>
      <PageHeader
        title="Ideias"
        subtitle="Banco de pautas: toda ideia vira ficha de pauta antes de virar tarefa."
        actions={<>
          <div className="flex rounded-md border border-border overflow-hidden text-sm">
            {(['quadro', 'lista'] as View[]).map((v) => (
              <button key={v} onClick={() => changeView(v)} className={cx('px-3 py-1.5 capitalize', view === v ? 'bg-muted font-medium' : 'bg-card text-muted-foreground hover:text-foreground')}>{v}</button>
            ))}
          </div>
          <Button onClick={() => setOpen(blank())}><Plus className="size-4 inline -mt-0.5 mr-1" aria-hidden />Nova ideia</Button>
        </>}
      />
      <IdeasTabs className="-mt-2 mb-5" />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input placeholder="Buscar…" aria-label="Buscar ideias" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className="w-full pl-8" />
        </div>
        <SelectField aria-label="Objetivo" icon={<Target />} value={f.objective} onChange={(x) => setF({ ...f, objective: x })}
          options={[{ value: '', label: 'Objetivo: todos' }, ...OBJECTIVES.map((o) => ({ value: o.id, label: o.label }))]} />
        <SelectField aria-label="Tom" icon={<MessageCircle />} value={f.tone} onChange={(x) => setF({ ...f, tone: x })}
          options={[{ value: '', label: 'Tom: todos' }, ...TONES.map((o) => ({ value: o.id, label: o.label }))]} />
        <SelectField aria-label="Tag" icon={<TagIcon />} value={f.tag} onChange={(x) => setF({ ...f, tag: x })} disabled={!tags.length}
          options={[{ value: '', label: 'Tag: todas' }, ...tags.map((t) => ({ value: t, label: tagDefs[t]?.label ?? t }))]} />
        <SelectField aria-label="Origem" icon={<Users />} value={f.competitor} onChange={(x) => setF({ ...f, competitor: x })} disabled={!sources.length}
          options={[{ value: '', label: 'Origem: todas' }, ...sources.map((c) => ({ value: c, label: compName(c) }))]} />
        {anyFilter && <Button variant="ghost" onClick={() => setF({ q: '', objective: '', tone: '', tag: '', competitor: '' })}>Limpar</Button>}
        <label className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
          <input type="checkbox" checked={hideDiscarded} onChange={(e) => setHideDiscarded(e.target.checked)} /> Ocultar descartadas
        </label>
      </div>

      <ErrorBox error={error} />
      {isLoading && <div className="grid grid-cols-5 gap-3">{cols.map((c) => <div key={c.id} className="h-64 rounded-xl bg-muted animate-pulse" />)}</div>}
      {data && !data.length && (
        <Empty title="Nenhuma ideia ainda" hint="Anote uma pauta ou transforme uma referência marcada em Concorrentes."
          action={<Button onClick={() => setOpen(blank())}>Criar a primeira ideia</Button>} />
      )}
      {data && data.length > 0 && !filtered.length && <Empty title="Nenhuma ideia com esses filtros" />}

      {data && filtered.length > 0 && view === 'quadro' && (
        <FillBox className="overflow-x-auto">
          <div className="grid gap-3 min-w-[1050px]" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
            {cols.map((s) => {
              const items = filtered.filter((i) => i.data.status === s.id);
              return (
                <div key={s.id} className="bg-muted/60 rounded-xl p-2 min-h-40">
                  <div className="flex items-center gap-2 px-1.5 py-1 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <span className={cx('h-2 w-2 rounded-full', s.dot)} />{s.label}<span className="ml-auto font-normal">{items.length}</span>
                  </div>
                  <div className="space-y-2">{items.map(card)}</div>
                </div>
              );
            })}
          </div>
        </FillBox>
      )}

      {data && filtered.length > 0 && view === 'lista' && (
        <FillBox><div className="bg-card border border-border rounded-xl overflow-hidden">
          {cols.map((s) => {
            const items = filtered.filter((i) => i.data.status === s.id);
            if (!items.length) return null;
            return (
              <div key={s.id}>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                  <span className={cx('h-2 w-2 rounded-full', s.dot)} />{s.label} <span className="font-normal">{items.length}</span>
                </div>
                {items.map((i) => (
                  <button key={i.data.id} onClick={() => setOpen(i)} className="w-full grid grid-cols-[70px_1fr_110px_130px_170px_80px] gap-3 items-center px-4 py-2.5 text-left text-sm border-b border-border last:border-0 hover:bg-muted/50">
                    <span className="font-mono text-xs text-muted-foreground">{i.data.id}</span>
                    <span className="truncate font-medium">{i.data.title}</span>
                    <span><ObjectiveBadge id={i.data.objective} /></span>
                    <span className="text-xs text-muted-foreground truncate">{label(TONES, i.data.tone)}</span>
                    <span className="text-xs text-muted-foreground font-mono truncate">{i.data.format ?? ''}</span>
                    <span className="text-xs font-mono text-primary-ink">{i.data.task ?? ''}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div></FillBox>
      )}

      {open && <IdeaDrawer key={`${open.data.id || 'nova'}${open.error ? ':erro' : ''}`} slug={slug} initial={open} compName={compName} onClose={() => setOpen(null)} onSaved={setOpen} />}
    </AppContent>
  );
}

function taskBody(idea: Doc<Idea>, rel: string) {
  const ficha = idea.body.trim().replace(/^(#{1,5}) /gm, '#$1 '); // desce um nível: fica sob "## Ficha de pauta"
  return [
    '',
    `Transformar a ideia ${idea.data.id} em peça. Ideia de origem: [${idea.data.id} · ${idea.data.title}](../${rel}) (\`${rel}\`).`,
    '',
    '## Ficha de pauta',
    '',
    ficha || '_(ficha vazia: completar antes de produzir)_',
    '',
    '## Checklist',
    '- [ ] Revisar e completar a ficha de pauta (objetivo, mensagem, gancho, prova, métrica)',
    '- [ ] Pesquisa de aprofundamento',
    '- [ ] Roteiro',
    '',
    '## Log',
    `- ${today()} · oliver · criada a partir da ideia ${idea.data.id} pela interface`,
    '',
  ].join('\n');
}

function IdeaDrawer({ slug, initial, compName, onClose, onSaved }: {
  slug: string; initial: Doc<Idea> & { error?: unknown; draft?: boolean }; compName: (id?: string) => string | undefined; onClose: () => void;
  onSaved: (d: Doc<Idea> & { error?: unknown; draft?: boolean }) => void;
}) {
  const qc = useQueryClient();
  const isNew = !initial.data.id;
  const [d, setD] = useState<Idea>(initial.data);
  const [body, setBody] = useState(initial.body);
  const [dirty, setDirty] = useState(!!initial.draft);
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState<unknown>(initial.error ?? null);
  const set = <K extends keyof Idea>(k: K, v: Idea[K]) => { setD((x) => ({ ...x, [k]: v })); setDirty(true); };

  const ideasKey = qk.ideas(slug), tasksKey = qk.tasks(slug);
  const clean = (): Idea => ({ ...d, title: d.title.trim(), format: d.format?.trim() || undefined });
  const idOf = (v: Idea) => v.id || nextSeqId('I', (qc.getQueryData<Doc<Idea>[]>(ideasKey) ?? []).map((i) => i.data.id));
  /** grava a ideia (cria se nova) — usado por Salvar e por Virar tarefa */
  const persist = async (v: Idea, tempId: string, md: string) => {
    if (v.id) return api.saveIdea(slug, await realId('idea', slug, v.id), v, md);
    const p = api.createIdea(slug, { ...v, id: undefined }, md);
    trackCreate('idea', slug, tempId, p.then((r) => r.data.id));
    return p;
  };

  // Salvar/criar é otimista: o card muda (ou aparece) na hora e o painel fecha; erro → o painel volta com o rascunho e o erro.
  const save = () => {
    const v = clean(), md = tidyMd(body), tempId = idOf(v);
    const doc: Doc<Idea> = { data: { ...v, id: tempId as Idea['id'] }, body: md, file: initial.file || `companies/${slug}/ideas/${tempId}-${slugify(v.title)}.md` };
    void runOptimistic(qc, {
      mutationFn: () => persist(v, tempId, md),
      apply: () => [[ideasKey, (old: Doc<Idea>[] | undefined) => upsertDoc(old, doc)]],
      onSuccess: (r) => qc.setQueryData<Doc<Idea>[]>(ideasKey, (old) => upsertDoc(old, r, tempId)),
      onError: (e) => onSaved({ data: d, body, file: initial.file, error: e, draft: true }),
      invalidate: () => [ideasKey],
      okMessage: isNew && !d.id ? 'Ideia criada' : 'Salvo',
    }, undefined).catch(() => {});
    onClose();
  };

  // Virar tarefa: ideia e tarefa mudam na hora (a tarefa aparece no quadro com id previsto); o servidor faz as 3 gravações em seguida.
  const [toTaskBusy, setToTaskBusy] = useState(false);
  const toTask = () => {
    const prev = { d, dirty };
    const v = clean(), md = tidyMd(body), tempIdea = idOf(v);
    const tempTask = nextSeqId('T', (qc.getQueryData<Doc<Task>[]>(tasksKey) ?? []).map((t) => t.data.id));
    const file = initial.file || `companies/${slug}/ideas/${tempIdea}-${slugify(v.title)}.md`;
    const optIdea: Doc<Idea> = { data: { ...v, id: tempIdea as Idea['id'], status: 'virou-tarefa', task: tempTask }, body: md, file };
    const rel0 = relToCompany(file);
    const optTask: Doc<Task> = {
      data: { id: tempTask, title: v.title, board: 'conteudo', status: 'todo', assignee: 'agent:estrategista', priority: 'media', depends: [], links: [rel0], context: [] } as Task,
      body: taskBody(optIdea, rel0), file: '',
    };
    setD(optIdea.data); setDirty(false); setError(null); setToTaskBusy(true);
    onSaved(optIdea);
    void runOptimistic(qc, {
      mutationFn: async () => {
        const saved = await persist(v, tempIdea, md);
        const rel = relToCompany(saved.file);
        const tp = api.createTask(slug, { title: saved.data.title, board: 'conteudo', status: 'todo', assignee: 'agent:estrategista', links: [rel] } as Partial<Task> & { title: string }, taskBody(saved, rel));
        trackCreate('task', slug, tempTask, tp.then((t) => t.data.id));
        const t = await tp;
        const final = await api.saveIdea(slug, saved.data.id, { ...saved.data, status: 'virou-tarefa', task: t.data.id }, saved.body);
        return { final, t };
      },
      apply: () => [
        [ideasKey, (old: Doc<Idea>[] | undefined) => upsertDoc(old, optIdea)],
        [tasksKey, (old: Doc<Task>[] | undefined) => (old ? upsertDoc(old, optTask) : old)],
      ],
      onSuccess: ({ final, t }) => {
        qc.setQueryData<Doc<Idea>[]>(ideasKey, (old) => upsertDoc(old, final, tempIdea));
        qc.setQueryData<Doc<Task>[]>(tasksKey, (old) => (old ? upsertDoc(old, t, tempTask) : old));
        setToTaskBusy(false);
        if (final.data.id !== tempIdea || final.data.task !== tempTask) { setD(final.data); onSaved(final); }
      },
      // o painel pode ter sido remontado (id novo): reabre com o rascunho anterior e o erro
      onError: (e) => onSaved({ data: prev.d, body, file: initial.file, error: e, draft: prev.dirty || isNew }),
      invalidate: () => [ideasKey, tasksKey],
      okMessage: `Tarefa ${tempTask} criada no quadro`,
      errorMessage: 'Não foi possível virar tarefa — nada foi alterado',
    }, undefined).catch(() => {});
  };
  const close = () => { if (!dirty || confirm('Descartar as alterações desta ideia?')) onClose(); };
  const hasFicha = /^##\s+Objetivo/m.test(body);

  return (
    <Drawer open onClose={close} width="max-w-3xl" title={isNew && !d.id ? 'Nova ideia' : <span className="flex items-center gap-2"><span className="font-mono text-muted-foreground text-sm">{d.id}</span>{d.title}</span>}>
      <Field label="Título">
        <Input autoFocus={isNew} className="w-full text-base" value={d.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: 5 apps abertos para atender 1 paciente" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <Field label="Status">
          <Select className="w-full" value={d.status} onChange={(e) => set('status', e.target.value as Status)}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </Field>
        <Field label="Objetivo (1 só)">
          <Select className="w-full" value={d.objective ?? ''} onChange={(e) => set('objective', (e.target.value || undefined) as Objective | undefined)}>
            <option value="">— definir</option>
            {OBJECTIVES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
          {d.objective === 'polemica' && <div className="text-xs text-warning mt-1">⚠ Usar raramente, com aval. Nunca contra pessoas ou contra as regras do nicho.</div>}
        </Field>
        <Field label="Tom">
          <Select className="w-full" value={d.tone ?? ''} onChange={(e) => set('tone', (e.target.value || undefined) as Tone | undefined)}>
            <option value="">— definir</option>
            {TONES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <Field label="Formato" hint="Receita fmt-* ou texto livre.">
          <Input className="w-full font-mono" list="idea-formats" value={d.format ?? ''} onChange={(e) => set('format', e.target.value)} placeholder="fmt-…" />
          <datalist id="idea-formats">{FORMATS.map((x) => <option key={x} value={x} />)}</datalist>
        </Field>
        <Field label="Tags"><TagsInput slug={slug} value={d.tags} onChange={(v) => set('tags', v)} /></Field>
      </div>

      {(d.source || d.task) && (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {d.source && (
            <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Origem</div>
              <div>
                {d.source.competitor
                  ? <Link className="text-primary-ink hover:underline" to={`/p/${slug}/concorrentes/${d.source.competitor}`}>{compName(d.source.competitor)}</Link>
                  : 'Referência'}
                {d.source.platform && <span className="text-muted-foreground"> · {d.source.platform}</span>}
              </div>
              {d.source.url && <a href={d.source.url} target="_blank" rel="noreferrer" className="text-xs text-primary-ink hover:underline break-all">{d.source.url}</a>}
            </div>
          )}
          {d.task && (
            <div className="rounded-lg border border-primary/30 bg-primary-soft px-3 py-2 text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Tarefa</div>
              <Link className="text-primary-ink font-mono hover:underline" to={`/p/${slug}/quadro`}>{d.task}</Link>
              <span className="text-muted-foreground"> no quadro de conteúdo</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center mb-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ficha de pauta e briefing</div>
          {!hasFicha && (
            <button className="ml-auto text-xs text-primary-ink hover:underline" onClick={() => { setBody(`${body.trim() ? `${body.trimEnd()}\n\n` : ''}${FICHA_TEMPLATE}`); setEditorKey((k) => k + 1); setDirty(true); }}>
              + Inserir ficha de pauta
            </button>
          )}
        </div>
        <MarkdownEditor key={editorKey} value={body} onChange={(md) => { if (md !== body) { setBody(md); setDirty(true); } }} minHeight={300} />
      </div>

      <ErrorBox error={error} />
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 px-6 py-3 bg-card border-t border-border flex items-center gap-2">
        <Button onClick={save} disabled={!d.title.trim()}>{isNew && !d.id ? 'Criar ideia' : 'Salvar'}</Button>
        <Button variant="ghost" onClick={close}>{dirty ? 'Cancelar' : 'Fechar'}</Button>
        <span className="text-xs text-muted-foreground ml-1 truncate">{initial.file ? relToCompany(initial.file) : ''}</span>
        {!d.task && d.status !== 'descartada' && (
          <Button variant="soft" className="ml-auto" disabled={toTaskBusy || !d.title.trim()}
            title="Cria a tarefa no quadro de conteúdo para o agent:estrategista, com a ficha de pauta"
            onClick={toTask}>Virar tarefa →</Button>
        )}
      </div>
    </Drawer>
  );
}
