// Banco de ideias (tarefa 012): quadro/lista por status, filtros e editor com a ficha de pauta.
// "Virar tarefa" cria a tarefa no Kanban (agent:estrategista) e liga as duas pontas.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Doc, type Idea, type Task } from '../api';
import { Button, Drawer, Empty, ErrorBox, Field, Input, PageHeader, Select, cx } from '../components/ui';
import { MarkdownEditor } from '../components/Markdown';
import { TagChip, TagsInput, useProjectTags } from '../components/notes/TagsInput';
import { FICHA_TEMPLATE, FORMATS, OBJECTIVES, STATUSES, TONES, label, type Objective, type Status, type Tone } from '../components/ideas/meta';

type View = 'quadro' | 'lista';
const VIEW_KEY = 'hub:ideas:view';
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Doc<Idea> => ({ data: { id: '' as Idea['id'], title: '', status: 'nova', tags: [], created: today() }, body: FICHA_TEMPLATE, file: '' });
/** caminho relativo à pasta da empresa (como os links das tarefas) */
const relToCompany = (file: string) => file.replace(/^companies\/[^/]+\//, '');

function ObjectiveBadge({ id }: { id?: Objective }) {
  if (!id) return null;
  const o = OBJECTIVES.find((x) => x.id === id);
  return <span className="inline-flex px-1.5 py-0 rounded-full text-[11px] font-medium" style={{ background: `${o?.color}1a`, color: o?.color }}>{o?.label ?? id}</span>;
}

export default function Ideas() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ['ideas', slug], queryFn: () => api.ideas(slug), enabled: !!slug });
  const { data: competitors } = useQuery({ queryKey: ['competitors', slug], queryFn: () => api.competitors(slug), enabled: !!slug });
  const { byId: tagDefs } = useProjectTags(slug);
  const compName = (id?: string) => competitors?.find((c) => c.data.id === id)?.data.name ?? id;

  const [view, setView] = useState<View>(() => { try { return (localStorage.getItem(VIEW_KEY) as View) || 'quadro'; } catch { return 'quadro'; } });
  const changeView = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* sem storage */ } };
  const [f, setF] = useState({ q: '', objective: '', tone: '', tag: '', competitor: '' });
  const [hideDiscarded, setHideDiscarded] = useState(false);
  const [open, setOpen] = useState<Doc<Idea> | null>(null);

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
      className="w-full text-left bg-surface border border-border rounded-lg p-3 hover:border-accent/50 hover:shadow-sm transition">
      <div className="flex items-center gap-2 text-[11px] text-muted mb-1">
        <span className="font-mono">{i.data.id}</span>
        {i.data.task && <span className="ml-auto font-mono text-accent">→ {i.data.task}</span>}
      </div>
      <div className="text-sm font-medium leading-snug">{i.data.title}</div>
      <div className="flex flex-wrap items-center gap-1 mt-2">
        <ObjectiveBadge id={i.data.objective} />
        {i.data.tone && <span className="text-[11px] text-muted">· {label(TONES, i.data.tone).split(' /')[0]}</span>}
        {i.data.format && <span className="text-[11px] text-muted font-mono">· {i.data.format.replace(/^fmt-/, '')}</span>}
      </div>
      {(i.data.tags.length > 0 || i.data.source?.competitor) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {i.data.source?.competitor && <span className="text-[11px] text-muted">◉ {compName(i.data.source.competitor)}</span>}
          {i.data.tags.map((t) => <TagChip key={t} id={t} def={tagDefs[t]} small />)}
        </div>
      )}
    </button>
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Ideias"
        subtitle="Banco de pautas: toda ideia vira ficha de pauta antes de virar tarefa."
        actions={<>
          <div className="flex rounded-md border border-border overflow-hidden text-sm">
            {(['quadro', 'lista'] as View[]).map((v) => (
              <button key={v} onClick={() => changeView(v)} className={cx('px-3 py-1.5 capitalize', view === v ? 'bg-surface-2 font-medium' : 'bg-surface text-muted hover:text-text')}>{v}</button>
            ))}
          </div>
          <Button onClick={() => setOpen(blank())}>+ Nova ideia</Button>
        </>}
      />

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Input placeholder="Buscar…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} className="w-56" />
        <Select value={f.objective} onChange={(e) => setF({ ...f, objective: e.target.value })}>
          <option value="">Objetivo: todos</option>
          {OBJECTIVES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </Select>
        <Select value={f.tone} onChange={(e) => setF({ ...f, tone: e.target.value })}>
          <option value="">Tom: todos</option>
          {TONES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </Select>
        <Select value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })} disabled={!tags.length}>
          <option value="">Tag: todas</option>
          {tags.map((t) => <option key={t} value={t}>{tagDefs[t]?.label ?? t}</option>)}
        </Select>
        <Select value={f.competitor} onChange={(e) => setF({ ...f, competitor: e.target.value })} disabled={!sources.length}>
          <option value="">Origem: todas</option>
          {sources.map((c) => <option key={c} value={c}>{compName(c)}</option>)}
        </Select>
        {anyFilter && <Button variant="ghost" onClick={() => setF({ q: '', objective: '', tone: '', tag: '', competitor: '' })}>Limpar</Button>}
        <label className="ml-auto flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={hideDiscarded} onChange={(e) => setHideDiscarded(e.target.checked)} /> Ocultar descartadas
        </label>
      </div>

      <ErrorBox error={error} />
      {isLoading && <div className="grid grid-cols-5 gap-3">{cols.map((c) => <div key={c.id} className="h-64 rounded-xl bg-surface-2 animate-pulse" />)}</div>}
      {data && !data.length && (
        <Empty title="Nenhuma ideia ainda" hint="Anote uma pauta ou transforme uma referência marcada em Concorrentes."
          action={<Button onClick={() => setOpen(blank())}>Criar a primeira ideia</Button>} />
      )}
      {data && data.length > 0 && !filtered.length && <Empty title="Nenhuma ideia com esses filtros" />}

      {data && filtered.length > 0 && view === 'quadro' && (
        <div className="overflow-x-auto pb-2">
          <div className="grid gap-3 min-w-[1050px]" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
            {cols.map((s) => {
              const items = filtered.filter((i) => i.data.status === s.id);
              return (
                <div key={s.id} className="bg-surface-2/60 rounded-xl p-2 min-h-40">
                  <div className="flex items-center gap-2 px-1.5 py-1 mb-1 text-xs font-semibold text-muted uppercase tracking-wide">
                    <span className={cx('h-2 w-2 rounded-full', s.dot)} />{s.label}<span className="ml-auto font-normal">{items.length}</span>
                  </div>
                  <div className="space-y-2">{items.map(card)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data && filtered.length > 0 && view === 'lista' && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {cols.map((s) => {
            const items = filtered.filter((i) => i.data.status === s.id);
            if (!items.length) return null;
            return (
              <div key={s.id}>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-2/60 text-xs font-semibold text-muted uppercase tracking-wide border-b border-border">
                  <span className={cx('h-2 w-2 rounded-full', s.dot)} />{s.label} <span className="font-normal">{items.length}</span>
                </div>
                {items.map((i) => (
                  <button key={i.data.id} onClick={() => setOpen(i)} className="w-full grid grid-cols-[70px_1fr_110px_130px_170px_80px] gap-3 items-center px-4 py-2.5 text-left text-sm border-b border-border last:border-0 hover:bg-surface-2/50">
                    <span className="font-mono text-xs text-muted">{i.data.id}</span>
                    <span className="truncate font-medium">{i.data.title}</span>
                    <span><ObjectiveBadge id={i.data.objective} /></span>
                    <span className="text-xs text-muted truncate">{label(TONES, i.data.tone)}</span>
                    <span className="text-xs text-muted font-mono truncate">{i.data.format ?? ''}</span>
                    <span className="text-xs font-mono text-accent">{i.data.task ?? ''}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {open && <IdeaDrawer key={open.data.id || 'nova'} slug={slug} initial={open} compName={compName} onClose={() => setOpen(null)} onSaved={setOpen} />}
    </div>
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
  slug: string; initial: Doc<Idea>; compName: (id?: string) => string | undefined; onClose: () => void; onSaved: (d: Doc<Idea>) => void;
}) {
  const qc = useQueryClient();
  const isNew = !initial.data.id;
  const [d, setD] = useState<Idea>(initial.data);
  const [body, setBody] = useState(initial.body);
  const [dirty, setDirty] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const set = <K extends keyof Idea>(k: K, v: Idea[K]) => { setD((x) => ({ ...x, [k]: v })); setDirty(true); };

  const persist = async (patch: Partial<Idea> = {}) => {
    const v: Idea = { ...d, ...patch, title: d.title.trim(), format: d.format?.trim() || undefined };
    const r = isNew && !v.id ? await api.createIdea(slug, { ...v, id: undefined }, body) : await api.saveIdea(slug, v.id, v, body);
    setD(r.data); setDirty(false);
    void qc.invalidateQueries({ queryKey: ['ideas', slug] });
    return r;
  };
  const save = useMutation({ mutationFn: () => persist(), onSuccess: () => onClose() });
  const toTask = useMutation({
    mutationFn: async () => {
      const saved = await persist();
      const rel = relToCompany(saved.file);
      const t = await api.createTask(slug, { title: saved.data.title, board: 'conteudo', assignee: 'agent:estrategista', links: [rel] } as Partial<Task> & { title: string }, taskBody(saved, rel));
      const final = await api.saveIdea(slug, saved.data.id, { ...saved.data, status: 'virou-tarefa', task: t.data.id }, saved.body);
      void qc.invalidateQueries({ queryKey: ['tasks', slug] });
      void qc.invalidateQueries({ queryKey: ['ideas', slug] });
      return final;
    },
    onSuccess: (final) => { setD(final.data); setDirty(false); onSaved(final); },
  });
  const close = () => { if (!dirty || confirm('Descartar as alterações desta ideia?')) onClose(); };
  const busy = save.isPending || toTask.isPending;
  const hasFicha = /^##\s+Objetivo/m.test(body);

  return (
    <Drawer open onClose={close} width="max-w-3xl" title={isNew && !d.id ? 'Nova ideia' : <span className="flex items-center gap-2"><span className="font-mono text-muted text-sm">{d.id}</span>{d.title}</span>}>
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
          {d.objective === 'polemica' && <div className="text-xs text-warn mt-1">⚠ Usar raramente, com aval. Nunca contra pessoas ou contra as regras do nicho.</div>}
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
            <div className="rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-0.5">Origem</div>
              <div>
                {d.source.competitor
                  ? <Link className="text-accent hover:underline" to={`/p/${slug}/concorrentes/${d.source.competitor}`}>{compName(d.source.competitor)}</Link>
                  : 'Referência'}
                {d.source.platform && <span className="text-muted"> · {d.source.platform}</span>}
              </div>
              {d.source.url && <a href={d.source.url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline break-all">{d.source.url}</a>}
            </div>
          )}
          {d.task && (
            <div className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-0.5">Tarefa</div>
              <Link className="text-accent font-mono hover:underline" to={`/p/${slug}/quadro`}>{d.task}</Link>
              <span className="text-muted"> no quadro de conteúdo</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center mb-1">
          <div className="text-xs font-medium text-muted uppercase tracking-wide">Ficha de pauta e briefing</div>
          {!hasFicha && (
            <button className="ml-auto text-xs text-accent hover:underline" onClick={() => { setBody(`${body.trim() ? `${body.trimEnd()}\n\n` : ''}${FICHA_TEMPLATE}`); setEditorKey((k) => k + 1); setDirty(true); }}>
              + Inserir ficha de pauta
            </button>
          )}
        </div>
        <MarkdownEditor key={editorKey} value={body} onChange={(md) => { if (md !== body) { setBody(md); setDirty(true); } }} minHeight={300} />
      </div>

      <ErrorBox error={save.error ?? toTask.error} />
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 px-6 py-3 bg-surface border-t border-border flex items-center gap-2">
        <Button onClick={() => save.mutate()} disabled={busy || !d.title.trim()}>{save.isPending ? 'Salvando…' : isNew && !d.id ? 'Criar ideia' : 'Salvar'}</Button>
        <Button variant="ghost" onClick={close}>{dirty ? 'Cancelar' : 'Fechar'}</Button>
        <span className="text-xs text-muted ml-1 truncate">{initial.file ? relToCompany(initial.file) : ''}</span>
        {!d.task && d.status !== 'descartada' && (
          <Button variant="soft" className="ml-auto" disabled={busy || !d.title.trim()}
            title="Cria a tarefa no quadro de conteúdo para o agent:estrategista, com a ficha de pauta"
            onClick={() => toTask.mutate()}>{toTask.isPending ? 'Criando tarefa…' : 'Virar tarefa →'}</Button>
        )}
      </div>
    </Drawer>
  );
}
