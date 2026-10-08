// Contexto e marca: documentos de context/*.md (salvar explícito), dados do projeto, tags e tokens da marca.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Project, type TagDef } from '../api';
import { Button, Card, ErrorBox, Field, Input, Select, Textarea, cx } from '../components/kit';
import { MarkdownEditor } from '../components/Markdown';
import BrandEditor from '../components/brand/BrandEditor';
import { toTag } from '../components/notes/TagsInput';
import { tidyMd } from '../components/notes/tidy';
import { qk, runOptimistic, useContextDoc, useContextList, useProject, useTags } from '../queries';

const DOCS: Record<string, { label: string; hint: string }> = {
  'BUSINESS.md': { label: 'Negócio', hint: 'Produto, oferta, preço, diferenciais, história.' },
  'AUDIENCE.md': { label: 'Público', hint: 'Personas, dores, desejos, objeções, linguagem.' },
  'VOICE.md': { label: 'Voz', hint: 'Tom, vocabulário, o que dizer e o que nunca dizer.' },
  'COMPETITORS.md': { label: 'Concorrentes', hint: 'Quem disputa a mesma atenção e como nos diferenciamos.' },
  'CONTENT_STRATEGY.md': { label: 'Estratégia de conteúdo', hint: 'Pilares, frequência, formatos, aprendizados.' },
  'COPY.md': { label: 'Copy', hint: 'Big idea, promessas, provas, CTAs aprovados.' },
};
const ORDER = Object.keys(DOCS);
const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'site', 'facebook', 'linkedin', 'x', 'outro'] as const;
type Section = { kind: 'doc'; name: string } | { kind: 'projeto' | 'tags' | 'marca' };

export default function Context() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: docs, isLoading, error } = useContextList(slug);
  const [dirty, setDirty] = useState(false);

  const sorted = useMemo(() => [...(docs ?? [])].sort((a, b) => {
    const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
  }), [docs]);

  const s = params.get('s') ?? (sorted[0]?.name ?? 'projeto');
  const section: Section = ['projeto', 'tags', 'marca'].includes(s) ? { kind: s as 'projeto' } : { kind: 'doc', name: s };
  const go = (v: string) => {
    if (v === s) return;
    if (dirty && !confirm('Há alterações não salvas. Sair sem salvar?')) return;
    setDirty(false);
    setParams({ s: v }, { replace: true });
  };

  // Aviso ao fechar a aba com alterações pendentes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const item = (key: string, label: string, sub?: string) => (
    <button key={key} onClick={() => go(key)}
      className={cx('w-full text-left px-3 py-2 rounded-md text-sm transition', s === key ? 'bg-primary-soft text-primary-ink font-medium' : 'hover:bg-muted')}>
      <div className="flex items-center gap-2">{label}{s === key && dirty && <span className="ml-auto h-2 w-2 rounded-full bg-warning" title="alterações não salvas" />}</div>
      {sub && <div className={cx('text-[11px] font-mono', s === key ? 'text-primary-ink/70' : 'text-muted-foreground')}>{sub}</div>}
    </button>
  );

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-64 shrink-0 border-r border-border bg-card overflow-y-auto p-3">
        <h1 className="text-base font-semibold tracking-tight px-2 pt-1 pb-3">Contexto e marca</h1>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 mb-1">Documentos</div>
        {isLoading && <div className="space-y-2 px-2">{[0, 1, 2].map((i) => <div key={i} className="h-9 rounded bg-muted animate-pulse" />)}</div>}
        <ErrorBox error={error} />
        {docs && !docs.length && <div className="text-xs text-muted-foreground px-3 py-2">Sem arquivos em context/. Use a skill <code>setup</code>.</div>}
        <div className="space-y-0.5">{sorted.map((d) => item(d.name, DOCS[d.name]?.label ?? d.name.replace(/\.md$/, ''), d.name))}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 mt-5 mb-1">Projeto</div>
        <div className="space-y-0.5">
          {item('projeto', 'Dados do projeto', 'project.yml')}
          {item('tags', 'Tags do projeto', 'tags.yml')}
          {item('marca', 'Kit de marca', 'brand/brand.json')}
        </div>
      </aside>
      <section className="flex-1 min-w-0 overflow-y-auto">
        {section.kind === 'doc' && <DocEditor key={`${slug}/${section.name}`} slug={slug} name={section.name} onDirty={setDirty} />}
        {section.kind === 'projeto' && <ProjectForm key={slug} slug={slug} onDirty={setDirty} />}
        {section.kind === 'tags' && <TagsEditor key={slug} slug={slug} onDirty={setDirty} />}
        {section.kind === 'marca' && <BrandEditor key={slug} slug={slug} onDirty={setDirty} />}
      </section>
    </div>
  );
}

// ---------- Documento de contexto (salvar explícito) ----------
function DocEditor({ slug, name, onDirty }: { slug: string; name: string; onDirty: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useContextDoc(slug, name);
  const [text, setText] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [mode, setMode] = useState<'visual' | 'texto'>('visual');
  const [rev, setRev] = useState(0); // remonta o editor visual ao voltar do modo texto / descartar
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  useEffect(() => { if (data && saved === null) { setText(data.text); setSaved(data.text); } }, [data, saved]);
  const dirty = text !== null && saved !== null && text !== saved;
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);

  // Salvar é otimista: "Salvo" na hora; erro → volta a "Não salvo" (o texto continua no editor) e mostra o erro.
  const [saveError, setSaveError] = useState<unknown>(null);
  const doSave = () => {
    if (!dirty || text === null) return;
    const t = text, prevSaved = saved, prevAt = savedAt;
    setSaved(t); setSavedAt(new Date()); setSaveError(null);
    void runOptimistic(qc, {
      mutationFn: () => api.saveContext(slug, name, tidyMd(t)),
      apply: () => [[qk.context(slug, name), () => ({ name, text: t })]],
      onError: (e) => { setSaved(prevSaved); setSavedAt(prevAt); setSaveError(e); },
      invalidate: () => [qk.contextList(slug)],
    }, undefined).catch(() => {});
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const meta = DOCS[name];

  return (
    <div className="max-w-4xl mx-auto px-8 pb-6">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur pt-6 pb-3 mb-1 flex items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">{meta?.label ?? name}</h2>
          <div className="text-sm text-muted-foreground mt-0.5">{meta?.hint} <span className="font-mono text-xs">context/{name}</span></div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            {(['visual', 'texto'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); if (m === 'visual') setRev((r) => r + 1); }}
                className={cx('px-2.5 py-1', mode === m ? 'bg-muted font-medium' : 'bg-card text-muted-foreground hover:text-foreground')}>{m === 'visual' ? 'Visual' : 'Markdown'}</button>
            ))}
          </div>
          {dirty
            ? <span className="text-xs text-warning flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />Não salvo</span>
            : savedAt ? <span className="text-xs text-success">Salvo às {savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span> : null}
          {dirty && <Button variant="ghost" onClick={() => { if (confirm('Descartar as alterações?')) { setText(saved); setRev((r) => r + 1); } }}>Descartar</Button>}
          <Button onClick={doSave} disabled={!dirty} title="Ctrl/Cmd+S">Salvar</Button>
        </div>
      </div>
      <ErrorBox error={error ?? saveError} />
      {isLoading && <div className="h-96 rounded-lg bg-muted animate-pulse" />}
      {text !== null && (mode === 'visual'
        ? <MarkdownEditor key={rev} value={text} onChange={setText} minHeight={480} />
        : <Textarea value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[13px] leading-relaxed min-h-[560px]" spellCheck={false} />)}
      <p className="text-xs text-muted-foreground mt-3">Documento importante: as mudanças só vão para o arquivo ao clicar em Salvar. Aprendizados novos (hook vencedor, objeção, frase de cliente) entram aqui.</p>
    </div>
  );
}

// ---------- project.yml ----------
type ProjectDraft = Omit<Project, 'website' | 'color'> & { website: string; color: string };
function ProjectForm({ slug, onDirty }: { slug: string; onDirty: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useProject(slug);
  const [d, setD] = useState<ProjectDraft | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data && !d) setD({ ...data, website: data.website ?? '', color: data.color ?? '' }); }, [data, d]);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => { setD((x) => (x ? { ...x, [k]: v } : x)); setDirty(true); };

  // Salvar é otimista: nome/cor/menu mudam na hora; erro → volta a "Não salvo" com o erro.
  const [saveError, setSaveError] = useState<unknown>(null);
  const [justSaved, setJustSaved] = useState(false);
  const save = (p: ProjectDraft) => {
    const payload = {
      ...p, name: p.name.trim(), website: p.website.trim() || undefined, color: p.color.trim() || undefined,
      socials: p.socials.filter((x) => x.url.trim()).map((x) => ({ ...x, url: x.url.trim() })),
    } as Project;
    setDirty(false); setJustSaved(true); setSaveError(null);
    void runOptimistic(qc, {
      mutationFn: () => api.saveProject(slug, payload),
      apply: () => [
        [qk.project(slug), () => payload],
        [qk.projects(), (old: Project[] | undefined) => old?.map((x) => (x.slug === slug ? payload : x))],
      ],
      onSuccess: (r) => { qc.setQueryData(qk.project(slug), r); setD((cur) => (cur && !dirtyRef.current ? { ...r, website: r.website ?? '', color: r.color ?? '' } : cur)); },
      onError: (e) => { setDirty(true); setJustSaved(false); setSaveError(e); },
      invalidate: () => [qk.project(slug), qk.projects()],
    }, undefined).catch(() => {});
  };
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;

  return (
    <div className="max-w-3xl mx-auto px-8 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">Dados do projeto</h2>
      <div className="text-sm text-muted-foreground mt-0.5 mb-5">Nome, descrição e redes oficiais. <span className="font-mono text-xs">companies/{slug}/project.yml</span></div>
      {isLoading && <div className="h-80 rounded-xl bg-muted animate-pulse" />}
      <ErrorBox error={error} />
      {d && (
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Field label="Nome"><Input className="w-full" value={d.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="Status">
              <Select className="w-full" value={d.status} onChange={(e) => set('status', e.target.value as Project['status'])}>
                <option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="arquivado">Arquivado</option>
              </Select>
            </Field>
          </div>
          <Field label="Descrição"><Textarea rows={2} value={d.description} onChange={(e) => set('description', e.target.value)} /></Field>
          <Field label="Segmento"><Input className="w-full" value={d.segment} onChange={(e) => set('segment', e.target.value)} placeholder="Ex.: Saúde mental · SaaS B2C" /></Field>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-x-4">
            <Field label="Site"><Input className="w-full" type="url" value={d.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" /></Field>
            <Field label="Cor (interface)">
              <div className="flex gap-2 items-center">
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#888888'} onChange={(e) => set('color', e.target.value)} className="h-8 w-9 rounded border border-border bg-card cursor-pointer" aria-label="Escolher cor" />
                <Input className="w-full font-mono" value={d.color} onChange={(e) => set('color', e.target.value)} placeholder="#ef7960" />
              </div>
            </Field>
          </div>
          <div className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Redes</div>
            <div className="space-y-2">
              {d.socials.map((x, i) => (
                <div key={i} className="flex gap-2">
                  <Select value={x.platform} onChange={(e) => set('socials', d.socials.map((y, j) => (j === i ? { ...y, platform: e.target.value as typeof x.platform } : y)))}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Input className="flex-1" value={x.url} placeholder="https://instagram.com/…" onChange={(e) => set('socials', d.socials.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)))} />
                  <button className="px-2 text-muted-foreground hover:text-destructive" onClick={() => set('socials', d.socials.filter((_, j) => j !== i))} aria-label="remover rede">×</button>
                </div>
              ))}
              {!d.socials.length && <div className="text-sm text-muted-foreground">Nenhuma rede cadastrada.</div>}
              <Button variant="ghost" onClick={() => set('socials', [...d.socials, { platform: 'instagram', url: '' }])}>+ Adicionar rede</Button>
            </div>
          </div>
          <ErrorBox error={saveError} />
          <div className="flex items-center gap-3 pt-4 mt-2 border-t border-border">
            <Button onClick={() => save(d)} disabled={!dirty || !d.name.trim()}>Salvar projeto</Button>
            {dirty ? <span className="text-xs text-warning">Não salvo</span> : justSaved ? <span className="text-xs text-success">Salvo</span> : null}
            <span className="ml-auto text-xs text-muted-foreground">criado em {new Date(`${d.created}T12:00:00`).toLocaleDateString('pt-BR')}</span>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- tags.yml ----------
type TagRow = TagDef & { _auto?: boolean };
const TAG_GRID = 'grid grid-cols-[120px_1fr_1fr_150px_28px] gap-2 px-4';
const TAG_COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#dc2626', '#64748b'];
function TagsEditor({ slug, onDirty }: { slug: string; onDirty: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useTags(slug);
  const [rows, setRows] = useState<TagRow[] | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data && !rows) setRows(data.tags); }, [data, rows]);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const upd = (i: number, patch: Partial<TagRow>) => { setRows((r) => r!.map((x, j) => (j === i ? { ...x, ...patch } : x))); setDirty(true); };
  // Salvar é otimista: as cores/rótulos novos valem na hora em todas as telas; erro → volta a "Não salvo" com o erro.
  const [saveError, setSaveError] = useState<unknown>(null);
  const [justSaved, setJustSaved] = useState(false);
  const save = (r: TagRow[]) => {
    // preserva todos os campos da tag (grupo, definicao… da 040); só tira o marcador interno _auto
    const tags = r.filter((x) => x.id || x.label).map(({ _auto, ...t }) => ({ ...t, label: t.label.trim() })); // eslint-disable-line @typescript-eslint/no-unused-vars
    setDirty(false); setJustSaved(true); setSaveError(null);
    void runOptimistic(qc, {
      mutationFn: () => api.saveTags(slug, tags),
      apply: () => [[qk.tags(slug), () => ({ tags })]],
      onSuccess: (res) => { if (!dirtyRef.current) setRows(res.tags); },
      onError: (e) => { setDirty(true); setJustSaved(false); setSaveError(e); },
      invalidate: () => [qk.tags(slug)],
    }, undefined).catch(() => {});
  };
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  const dupes = rows ? rows.map((r) => r.id).filter((id, i, a) => id && a.indexOf(id) !== i) : [];

  return (
    <div className="max-w-3xl mx-auto px-8 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">Tags do projeto</h2>
      <div className="text-sm text-muted-foreground mt-0.5 mb-5">Vocabulário comum de anotações, ideias, personas e tarefas. O id vai nos arquivos; o rótulo e a cor, na interface.</div>
      {isLoading && <div className="h-60 rounded-xl bg-muted animate-pulse" />}
      <ErrorBox error={error} />
      {rows && (
        <Card className="p-0 overflow-hidden">
          <div className={cx(TAG_GRID, 'py-2 bg-muted/60 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground border-b border-border')}>
            <span>Prévia</span><span>Rótulo</span><span>Id (slug)</span><span>Cor</span><span />
          </div>
          {rows.map((t, i) => (
            <div key={i} className={cx(TAG_GRID, 'py-2 items-center border-b border-border')}>
              <span className="justify-self-start inline-flex max-w-full truncate px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${t.color}22`, color: t.color }}>{t.label || '—'}</span>
              <Input className="w-full" value={t.label} placeholder="Rótulo" autoFocus={t._auto && !t.label} onChange={(e) => upd(i, { label: e.target.value, ...(t._auto ? { id: toTag(e.target.value) } : {}) })} />
              <Input className={cx('w-full font-mono', dupes.includes(t.id) && 'border-destructive')} value={t.id} placeholder="id"
                onChange={(e) => upd(i, { id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), _auto: false })} />
              <div className="flex items-center gap-2">
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(t.color) ? t.color : '#888888'} onChange={(e) => upd(i, { color: e.target.value })} className="h-8 w-9 rounded border border-border bg-card cursor-pointer" aria-label="cor" />
                <Input className="w-full font-mono text-xs" value={t.color} onChange={(e) => upd(i, { color: e.target.value })} />
              </div>
              <button className="text-muted-foreground hover:text-destructive text-lg" onClick={() => { setRows(rows.filter((_, j) => j !== i)); setDirty(true); }} aria-label="remover tag">×</button>
            </div>
          ))}
          {!rows.length && <div className="px-4 py-6 text-sm text-muted-foreground text-center">Nenhuma tag ainda.</div>}
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setRows([...rows, { id: '', label: '', color: TAG_COLORS[rows.length % TAG_COLORS.length], _auto: true }]); setDirty(true); }}>+ Nova tag</Button>
            {dupes.length > 0 && <span className="text-xs text-destructive">Id repetido: {[...new Set(dupes)].join(', ')}</span>}
            <div className="ml-auto flex items-center gap-3">
              {dirty ? <span className="text-xs text-warning">Não salvo</span> : justSaved ? <span className="text-xs text-success">Salvo</span> : null}
              <Button onClick={() => save(rows)} disabled={!dirty || dupes.length > 0}>Salvar tags</Button>
            </div>
          </div>
          {saveError ? <div className="px-4 pb-3"><ErrorBox error={saveError} /></div> : null}
        </Card>
      )}
    </div>
  );
}
