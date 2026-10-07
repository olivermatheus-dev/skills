// Anotações: lista à esquerda (busca, tag, pastas, fixadas primeiro) e editor à direita com autosave.
// Corpo = markdown puro em companies/<slug>/notes/<id>.md.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Doc, type Note } from '../api';
import { Button, ErrorBox, Input, Select, cx } from '../components/ui';
import { MarkdownEditor } from '../components/Markdown';
import { TagChip, TagsInput, useProjectTags } from '../components/notes/TagsInput';
import { SaveIndicator, useAutosave } from '../components/notes/useAutosave';
import { tidyMd } from '../components/notes/tidy';

type Draft = { slug: string; data: Note; body: string };
const NO_FOLDER = '__sem_pasta';
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function fmtWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'ontem';
  return d.toLocaleDateString('pt-BR', d.getFullYear() === now.getFullYear() ? { day: '2-digit', month: 'short' } : undefined);
}
/** primeira linha de texto do corpo, sem marcação, para a prévia da lista */
function snippet(md: string) {
  const line = md.split('\n').map((l) => l.replace(/^#+\s*|^[-*>]\s+|^\d+\.\s+|[*_`~[\]]|\(http[^)]*\)/g, '').trim()).find(Boolean);
  return line ?? '';
}
/** id = data e hora da criação (o título muda à vontade sem renomear o arquivo) */
function newNoteId(existing: Doc<Note>[]) {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  const base = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  let id = base, n = 2;
  while (existing.some((x) => x.data.id === id)) id = `${base}-${n++}`;
  return id;
}
const toPayload = (d: Draft) => ({ ...d.data, title: d.data.title.trim() || 'Sem título', folder: d.data.folder?.trim() || undefined });

export default function Notes() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('n');
  const { data: notes, isLoading, error: loadError } = useQuery({ queryKey: ['notes', slug], queryFn: () => api.notes(slug), enabled: !!slug });
  const { byId: tagDefs } = useProjectTags(slug);

  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const draftRef = useRef<Draft | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const focusTitle = useRef(false);

  const putInCache = useCallback((s: string, doc: Doc<Note>) => {
    qc.setQueryData<Doc<Note>[]>(['notes', s], (old = []) => {
      const rest = old.filter((n) => n.data.id !== doc.data.id);
      return [doc, ...rest];
    });
  }, [qc]);

  const auto = useAutosave<Draft>({
    save: async (d) => { const r = await api.saveNote(d.slug, d.data.id, toPayload(d), tidyMd(d.body)); putInCache(d.slug, r); },
    beacon: (d) => {
      void fetch(`/api/projects/${encodeURIComponent(d.slug)}/notes/${d.data.id}`, {
        method: 'PUT', keepalive: true, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: toPayload(d), body: tidyMd(d.body) }),
      });
    },
  });

  // Trocou de projeto: grava o pendente do anterior e limpa a seleção.
  const prevSlug = useRef(slug);
  useEffect(() => {
    if (prevSlug.current !== slug) { void auto.flush(); prevSlug.current = slug; draftRef.current = null; setDraft(null); setParams({}, { replace: true }); }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Seleção: ?n=<id> na URL; sem seleção → a primeira da lista.
  const select = useCallback(async (id: string | null) => {
    await auto.flush();
    setParams((p) => { const n = new URLSearchParams(p); if (id) n.set('n', id); else n.delete('n'); return n; }, { replace: true });
  }, [auto, setParams]);

  useEffect(() => {
    if (!notes) return;
    if (draftRef.current && draftRef.current.data.id === selectedId && draftRef.current.slug === slug) return;
    const doc = notes.find((n) => n.data.id === selectedId) ?? (selectedId ? undefined : notes[0]);
    if (!selectedId && doc) { setParams((p) => { const n = new URLSearchParams(p); n.set('n', doc.data.id); return n; }, { replace: true }); return; }
    const next = doc ? { slug, data: doc.data, body: doc.body } : null;
    draftRef.current = next;
    setDraft(next);
    auto.cancel();
  }, [notes, selectedId, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (focusTitle.current && draft) { focusTitle.current = false; titleRef.current?.focus(); titleRef.current?.select(); } }, [draft]);

  const edit = (patch: Partial<Note>, body?: string, forId?: string) => {
    const cur = draftRef.current;
    if (!cur || (forId && forId !== cur.data.id)) return; // evento atrasado do editor da anotação anterior
    if (body !== undefined && body === cur.body && !Object.keys(patch).length) return; // editor só normalizou
    const next = { ...cur, data: { ...cur.data, ...patch }, body: body ?? cur.body };
    draftRef.current = next;
    setDraft(next);
    auto.schedule(next);
  };

  const create = useCallback(async () => {
    setActionError(null);
    try {
      await auto.flush();
      const folder = draftRef.current?.data.folder;
      const r = await api.createNote(slug, { id: newNoteId(notes ?? []), title: 'Sem título', folder, tags: tag ? [tag] : [] }, '');
      putInCache(slug, r);
      focusTitle.current = true;
      setQ('');
      await select(r.data.id);
    } catch (e) { setActionError(e); }
  }, [auto, slug, tag, notes, putInCache, select]);

  const remove = async () => {
    const cur = draftRef.current;
    if (!cur || !confirm(`Apagar a anotação "${cur.data.title}"? Isso remove o arquivo.`)) return;
    setActionError(null);
    try {
      auto.cancel();
      await api.deleteNote(slug, cur.data.id);
      const rest = (notes ?? []).filter((n) => n.data.id !== cur.data.id);
      qc.setQueryData(['notes', slug], rest);
      draftRef.current = null;
      setDraft(null);
      await select(rest[0]?.data.id ?? null);
    } catch (e) { setActionError(e); }
  };

  // Ctrl/Cmd+N → nova anotação (Alt+N como alternativa, já que alguns navegadores reservam Ctrl+N).
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && (e.ctrlKey || e.metaKey || e.altKey) && !e.shiftKey) { e.preventDefault(); void create(); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [create]);

  // Lista: o rascunho aberto aparece com o título digitado, sem esperar a gravação.
  const all = useMemo(() => (notes ?? []).map((n) => (draft && n.data.id === draft.data.id ? { ...n, data: draft.data, body: draft.body } : n)), [notes, draft]);
  const allTags = useMemo(() => [...new Set(all.flatMap((n) => n.data.tags))].sort(), [all]);
  const folders = useMemo(() => [...new Set(all.map((n) => n.data.folder?.trim()).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'pt-BR')), [all]);
  const filtered = useMemo(() => {
    const f = fold(q.trim());
    return all
      .filter((n) => !tag || n.data.tags.includes(tag))
      .filter((n) => !f || fold(`${n.data.title} ${n.data.folder ?? ''} ${n.data.tags.join(' ')} ${n.body}`).includes(f))
      .sort((a, b) => b.data.updated.localeCompare(a.data.updated));
  }, [all, q, tag]);
  const groups = useMemo(() => {
    const pinned = filtered.filter((n) => n.data.pinned);
    const rest = filtered.filter((n) => !n.data.pinned);
    const out: { key: string; label: string; items: Doc<Note>[] }[] = [];
    if (pinned.length) out.push({ key: '__fixadas', label: 'Fixadas', items: pinned });
    for (const f of folders) { const items = rest.filter((n) => n.data.folder?.trim() === f); if (items.length) out.push({ key: f, label: f, items }); }
    const loose = rest.filter((n) => !n.data.folder?.trim());
    if (loose.length) out.push({ key: NO_FOLDER, label: folders.length ? 'Sem pasta' : 'Anotações', items: loose });
    return out;
  }, [filtered, folders]);

  return (
    <div className="flex h-full min-h-0">
      {/* Lista */}
      <section className="w-80 shrink-0 border-r border-border bg-surface flex flex-col min-h-0">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold tracking-tight">Anotações</h1>
            <Button onClick={create} title={`Nova anotação (${isMac ? '⌘' : 'Ctrl'}+N)`} className="!px-2.5 !py-1">+ Nova</Button>
          </div>
          <Input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full" aria-label="Buscar anotações" />
          {allTags.length > 0 && (
            <Select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full" aria-label="Filtrar por tag">
              <option value="">Todas as tags</option>
              {allTags.map((t) => <option key={t} value={t}>{tagDefs[t]?.label ?? t}</option>)}
            </Select>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && <div className="p-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-md bg-surface-2 animate-pulse" />)}</div>}
          {loadError && <div className="p-3"><ErrorBox error={loadError} /></div>}
          {notes && !all.length && (
            <div className="p-6 text-center text-sm text-muted">
              Nenhuma anotação ainda.
              <div className="mt-3"><Button variant="soft" onClick={create}>Criar a primeira</Button></div>
            </div>
          )}
          {notes && all.length > 0 && !filtered.length && <div className="p-6 text-center text-sm text-muted">Nada encontrado para essa busca.</div>}
          {groups.map((g) => (
            <div key={g.key} className="py-1">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
                className="w-full flex items-center gap-1 px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-text"
              >
                <span className={cx('inline-block transition-transform text-[9px]', collapsed[g.key] ? '-rotate-90' : '')}>▼</span>
                {g.key === '__fixadas' ? '📌 ' : ''}{g.label}
                <span className="ml-auto font-normal normal-case tracking-normal">{g.items.length}</span>
              </button>
              {!collapsed[g.key] && g.items.map((n) => {
                const active = n.data.id === draft?.data.id;
                return (
                  <button
                    key={n.data.id}
                    onClick={() => void select(n.data.id)}
                    className={cx('w-full text-left px-3 py-2 mx-0 border-l-2 transition', active ? 'bg-accent-soft border-accent' : 'border-transparent hover:bg-surface-2')}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className={cx('flex-1 truncate text-sm', active ? 'font-semibold text-accent' : 'font-medium')}>{n.data.title || 'Sem título'}</span>
                      <span className="text-[11px] text-muted shrink-0">{fmtWhen(n.data.updated)}</span>
                    </div>
                    <div className="text-xs text-muted truncate mt-0.5">{snippet(n.body) || 'Sem texto'}</div>
                    {n.data.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">{n.data.tags.slice(0, 4).map((t) => <TagChip key={t} id={t} def={tagDefs[t]} small />)}</div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Editor */}
      <section className="flex-1 min-w-0 overflow-y-auto bg-surface">
        {!draft ? (
          <div className="h-full flex items-center justify-center text-center text-muted text-sm p-8">
            <div>
              {notes && !all.length ? 'Crie uma anotação para começar.' : selectedId && notes ? 'Anotação não encontrada.' : 'Selecione uma anotação.'}
              <div className="mt-3"><Button variant="ghost" onClick={create}>Nova anotação <kbd className="ml-1 text-[10px] text-muted">{isMac ? '⌘' : 'Ctrl'}+N</kbd></Button></div>
              <ErrorBox error={actionError} />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-8 py-6">
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="text-muted text-xs">📁</span>
              <input
                list="note-folders"
                value={draft.data.folder ?? ''}
                onChange={(e) => edit({ folder: e.target.value })}
                placeholder="Sem pasta"
                aria-label="Pasta"
                className="bg-transparent outline-none text-sm text-muted hover:text-text focus:text-text w-48 border-b border-transparent focus:border-border"
              />
              <datalist id="note-folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
              <div className="ml-auto flex items-center gap-3">
                <SaveIndicator state={auto.state} />
                <button
                  onClick={() => edit({ pinned: !draft.data.pinned })}
                  className={cx('px-2 py-1 rounded-md text-xs border transition', draft.data.pinned ? 'border-accent text-accent bg-accent-soft' : 'border-border text-muted hover:text-text')}
                  aria-pressed={draft.data.pinned}
                  title={draft.data.pinned ? 'Desafixar' : 'Fixar no topo'}
                >📌 {draft.data.pinned ? 'Fixada' : 'Fixar'}</button>
                <Button variant="danger" onClick={remove} className="!px-2 !py-1 text-xs">Apagar</Button>
              </div>
            </div>
            <input
              ref={titleRef}
              value={draft.data.title}
              onChange={(e) => edit({ title: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (document.querySelector('.note-editor [contenteditable]') as HTMLElement | null)?.focus(); } }}
              placeholder="Título"
              aria-label="Título"
              className="w-full text-3xl font-bold tracking-tight bg-transparent outline-none placeholder:text-muted/50"
            />
            <div className="mt-2 mb-1 text-xs text-muted">
              Editada {new Date(draft.data.updated).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · criada {new Date(draft.data.created).toLocaleDateString('pt-BR')}
            </div>
            <TagsInput slug={slug} value={draft.data.tags} onChange={(tags) => edit({ tags })} className="mt-3 border-dashed" />
            {auto.state === 'error' && <ErrorBox error={auto.error} />}
            <ErrorBox error={actionError} />
            <div className="note-editor mt-5">
              <MarkdownEditor key={`${slug}/${draft.data.id}`} value={draft.body} onChange={(md) => edit({}, md, draft.data.id)} placeholder="Escreva aqui… (markdown: # título, - lista, **negrito**)" minHeight={420} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
