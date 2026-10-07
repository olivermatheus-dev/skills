// Contexto e marca: documentos de context/*.md (salvar explícito), dados do projeto, tags e tokens da marca.
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Project, type TagDef } from '../api';
import { Button, Card, ErrorBox, Field, Input, Select, Textarea, cx } from '../components/ui';
import { MarkdownEditor } from '../components/Markdown';
import { toTag } from '../components/notes/TagsInput';
import { tidyMd } from '../components/notes/tidy';

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
  const { data: docs, isLoading, error } = useQuery({ queryKey: ['context', slug], queryFn: () => api.contextList(slug), enabled: !!slug });
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
      className={cx('w-full text-left px-3 py-2 rounded-md text-sm transition', s === key ? 'bg-accent-soft text-accent font-medium' : 'hover:bg-surface-2')}>
      <div className="flex items-center gap-2">{label}{s === key && dirty && <span className="ml-auto h-2 w-2 rounded-full bg-warn" title="alterações não salvas" />}</div>
      {sub && <div className={cx('text-[11px] font-mono', s === key ? 'text-accent/70' : 'text-muted')}>{sub}</div>}
    </button>
  );

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-64 shrink-0 border-r border-border bg-surface overflow-y-auto p-3">
        <h1 className="text-base font-semibold tracking-tight px-2 pt-1 pb-3">Contexto e marca</h1>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted px-3 mb-1">Documentos</div>
        {isLoading && <div className="space-y-2 px-2">{[0, 1, 2].map((i) => <div key={i} className="h-9 rounded bg-surface-2 animate-pulse" />)}</div>}
        <ErrorBox error={error} />
        {docs && !docs.length && <div className="text-xs text-muted px-3 py-2">Sem arquivos em context/. Use a skill <code>setup</code>.</div>}
        <div className="space-y-0.5">{sorted.map((d) => item(d.name, DOCS[d.name]?.label ?? d.name.replace(/\.md$/, ''), d.name))}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted px-3 mt-5 mb-1">Projeto</div>
        <div className="space-y-0.5">
          {item('projeto', 'Dados do projeto', 'project.yml')}
          {item('tags', 'Tags do projeto', 'tags.yml')}
          {item('marca', 'Marca', 'brand/brand.css')}
        </div>
      </aside>
      <section className="flex-1 min-w-0 overflow-y-auto">
        {section.kind === 'doc' && <DocEditor key={`${slug}/${section.name}`} slug={slug} name={section.name} onDirty={setDirty} />}
        {section.kind === 'projeto' && <ProjectForm key={slug} slug={slug} onDirty={setDirty} />}
        {section.kind === 'tags' && <TagsEditor key={slug} slug={slug} onDirty={setDirty} />}
        {section.kind === 'marca' && <BrandPanel key={slug} slug={slug} />}
      </section>
    </div>
  );
}

// ---------- Documento de contexto (salvar explícito) ----------
function DocEditor({ slug, name, onDirty }: { slug: string; name: string; onDirty: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['context', slug, name], queryFn: () => api.context(slug, name), staleTime: Infinity, refetchOnWindowFocus: false });
  const [text, setText] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [mode, setMode] = useState<'visual' | 'texto'>('visual');
  const [rev, setRev] = useState(0); // remonta o editor visual ao voltar do modo texto / descartar
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  useEffect(() => { if (data && saved === null) { setText(data.text); setSaved(data.text); } }, [data, saved]);
  const dirty = text !== null && saved !== null && text !== saved;
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);

  const save = useMutation({
    mutationFn: (t: string) => api.saveContext(slug, name, tidyMd(t)),
    onSuccess: (_, t) => { setSaved(t); setSavedAt(new Date()); qc.setQueryData(['context', slug, name], { name, text: t }); },
  });
  const doSave = () => { if (dirty && text !== null && !save.isPending) save.mutate(text); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const meta = DOCS[name];

  return (
    <div className="max-w-4xl mx-auto px-8 pb-6">
      <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur pt-6 pb-3 mb-1 flex items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">{meta?.label ?? name}</h2>
          <div className="text-sm text-muted mt-0.5">{meta?.hint} <span className="font-mono text-xs">context/{name}</span></div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            {(['visual', 'texto'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); if (m === 'visual') setRev((r) => r + 1); }}
                className={cx('px-2.5 py-1', mode === m ? 'bg-surface-2 font-medium' : 'bg-surface text-muted hover:text-text')}>{m === 'visual' ? 'Visual' : 'Markdown'}</button>
            ))}
          </div>
          {dirty
            ? <span className="text-xs text-warn flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warn" />Não salvo</span>
            : savedAt ? <span className="text-xs text-ok">Salvo às {savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span> : null}
          {dirty && <Button variant="ghost" onClick={() => { if (confirm('Descartar as alterações?')) { setText(saved); setRev((r) => r + 1); } }}>Descartar</Button>}
          <Button onClick={doSave} disabled={!dirty || save.isPending} title="Ctrl/Cmd+S">{save.isPending ? 'Salvando…' : 'Salvar'}</Button>
        </div>
      </div>
      <ErrorBox error={error ?? save.error} />
      {isLoading && <div className="h-96 rounded-lg bg-surface-2 animate-pulse" />}
      {text !== null && (mode === 'visual'
        ? <MarkdownEditor key={rev} value={text} onChange={setText} minHeight={480} />
        : <Textarea value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[13px] leading-relaxed min-h-[560px]" spellCheck={false} />)}
      <p className="text-xs text-muted mt-3">Documento importante: as mudanças só vão para o arquivo ao clicar em Salvar. Aprendizados novos (hook vencedor, objeção, frase de cliente) entram aqui.</p>
    </div>
  );
}

// ---------- project.yml ----------
type ProjectDraft = Omit<Project, 'website' | 'color'> & { website: string; color: string };
function ProjectForm({ slug, onDirty }: { slug: string; onDirty: (v: boolean) => void }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['project', slug], queryFn: () => api.project(slug) });
  const [d, setD] = useState<ProjectDraft | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data && !d) setD({ ...data, website: data.website ?? '', color: data.color ?? '' }); }, [data, d]);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const set = <K extends keyof ProjectDraft>(k: K, v: ProjectDraft[K]) => { setD((x) => (x ? { ...x, [k]: v } : x)); setDirty(true); };

  const save = useMutation({
    mutationFn: (p: ProjectDraft) => api.saveProject(slug, {
      ...p, name: p.name.trim(), website: p.website.trim() || undefined, color: p.color.trim() || undefined,
      socials: p.socials.filter((x) => x.url.trim()).map((x) => ({ ...x, url: x.url.trim() })),
    }),
    onSuccess: (r) => {
      setD({ ...r, website: r.website ?? '', color: r.color ?? '' }); setDirty(false);
      qc.setQueryData(['project', slug], r);
      void qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-8 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">Dados do projeto</h2>
      <div className="text-sm text-muted mt-0.5 mb-5">Nome, descrição e redes oficiais. <span className="font-mono text-xs">companies/{slug}/project.yml</span></div>
      {isLoading && <div className="h-80 rounded-xl bg-surface-2 animate-pulse" />}
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
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(d.color) ? d.color : '#888888'} onChange={(e) => set('color', e.target.value)} className="h-8 w-9 rounded border border-border bg-surface cursor-pointer" aria-label="Escolher cor" />
                <Input className="w-full font-mono" value={d.color} onChange={(e) => set('color', e.target.value)} placeholder="#ef7960" />
              </div>
            </Field>
          </div>
          <div className="mb-4">
            <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">Redes</div>
            <div className="space-y-2">
              {d.socials.map((x, i) => (
                <div key={i} className="flex gap-2">
                  <Select value={x.platform} onChange={(e) => set('socials', d.socials.map((y, j) => (j === i ? { ...y, platform: e.target.value as typeof x.platform } : y)))}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Input className="flex-1" value={x.url} placeholder="https://instagram.com/…" onChange={(e) => set('socials', d.socials.map((y, j) => (j === i ? { ...y, url: e.target.value } : y)))} />
                  <button className="px-2 text-muted hover:text-danger" onClick={() => set('socials', d.socials.filter((_, j) => j !== i))} aria-label="remover rede">×</button>
                </div>
              ))}
              {!d.socials.length && <div className="text-sm text-muted">Nenhuma rede cadastrada.</div>}
              <Button variant="ghost" onClick={() => set('socials', [...d.socials, { platform: 'instagram', url: '' }])}>+ Adicionar rede</Button>
            </div>
          </div>
          <ErrorBox error={save.error} />
          <div className="flex items-center gap-3 pt-4 mt-2 border-t border-border">
            <Button onClick={() => save.mutate(d)} disabled={!dirty || save.isPending || !d.name.trim()}>{save.isPending ? 'Salvando…' : 'Salvar projeto'}</Button>
            {dirty ? <span className="text-xs text-warn">Não salvo</span> : save.isSuccess ? <span className="text-xs text-ok">Salvo</span> : null}
            <span className="ml-auto text-xs text-muted">criado em {new Date(`${d.created}T12:00:00`).toLocaleDateString('pt-BR')}</span>
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
  const { data, isLoading, error } = useQuery({ queryKey: ['tags', slug], queryFn: () => api.tags(slug) });
  const [rows, setRows] = useState<TagRow[] | null>(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (data && !rows) setRows(data.tags); }, [data, rows]);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const upd = (i: number, patch: Partial<TagRow>) => { setRows((r) => r!.map((x, j) => (j === i ? { ...x, ...patch } : x))); setDirty(true); };
  const save = useMutation({
    mutationFn: (r: TagRow[]) => api.saveTags(slug, r.filter((x) => x.id || x.label).map(({ id, label, color }) => ({ id, label: label.trim(), color }))),
    onSuccess: (r) => { setRows(r.tags); setDirty(false); qc.setQueryData(['tags', slug], r); },
  });
  const dupes = rows ? rows.map((r) => r.id).filter((id, i, a) => id && a.indexOf(id) !== i) : [];

  return (
    <div className="max-w-3xl mx-auto px-8 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">Tags do projeto</h2>
      <div className="text-sm text-muted mt-0.5 mb-5">Vocabulário comum de anotações, ideias, personas e tarefas. O id vai nos arquivos; o rótulo e a cor, na interface.</div>
      {isLoading && <div className="h-60 rounded-xl bg-surface-2 animate-pulse" />}
      <ErrorBox error={error} />
      {rows && (
        <Card className="p-0 overflow-hidden">
          <div className={cx(TAG_GRID, 'py-2 bg-surface-2/60 text-[11px] font-semibold uppercase tracking-wide text-muted border-b border-border')}>
            <span>Prévia</span><span>Rótulo</span><span>Id (slug)</span><span>Cor</span><span />
          </div>
          {rows.map((t, i) => (
            <div key={i} className={cx(TAG_GRID, 'py-2 items-center border-b border-border')}>
              <span className="justify-self-start inline-flex max-w-full truncate px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${t.color}22`, color: t.color }}>{t.label || '—'}</span>
              <Input className="w-full" value={t.label} placeholder="Rótulo" autoFocus={t._auto && !t.label} onChange={(e) => upd(i, { label: e.target.value, ...(t._auto ? { id: toTag(e.target.value) } : {}) })} />
              <Input className={cx('w-full font-mono', dupes.includes(t.id) && 'border-danger')} value={t.id} placeholder="id"
                onChange={(e) => upd(i, { id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), _auto: false })} />
              <div className="flex items-center gap-2">
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(t.color) ? t.color : '#888888'} onChange={(e) => upd(i, { color: e.target.value })} className="h-8 w-9 rounded border border-border bg-surface cursor-pointer" aria-label="cor" />
                <Input className="w-full font-mono text-xs" value={t.color} onChange={(e) => upd(i, { color: e.target.value })} />
              </div>
              <button className="text-muted hover:text-danger text-lg" onClick={() => { setRows(rows.filter((_, j) => j !== i)); setDirty(true); }} aria-label="remover tag">×</button>
            </div>
          ))}
          {!rows.length && <div className="px-4 py-6 text-sm text-muted text-center">Nenhuma tag ainda.</div>}
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setRows([...rows, { id: '', label: '', color: TAG_COLORS[rows.length % TAG_COLORS.length], _auto: true }]); setDirty(true); }}>+ Nova tag</Button>
            {dupes.length > 0 && <span className="text-xs text-danger">Id repetido: {[...new Set(dupes)].join(', ')}</span>}
            <div className="ml-auto flex items-center gap-3">
              {dirty ? <span className="text-xs text-warn">Não salvo</span> : save.isSuccess ? <span className="text-xs text-ok">Salvo</span> : null}
              <Button onClick={() => save.mutate(rows)} disabled={!dirty || save.isPending || dupes.length > 0}>{save.isPending ? 'Salvando…' : 'Salvar tags'}</Button>
            </div>
          </div>
          {save.error ? <div className="px-4 pb-3"><ErrorBox error={save.error} /></div> : null}
        </Card>
      )}
    </div>
  );
}

// ---------- brand.css (somente leitura) ----------
interface Token { name: string; value: string; comment?: string }
function parseTokens(css: string): Token[] {
  const out: Token[] = [];
  const re = /--([\w-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*([\s\S]*?)\s*\*\/)?/g;
  for (let m; (m = re.exec(css));) out.push({ name: m[1], value: m[2].trim(), comment: m[3]?.trim() });
  return out;
}
const isColor = (v: string) => /^(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|oklab\()/i.test(v);

function BrandPanel({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery({ queryKey: ['brand-css', slug], queryFn: () => api.brandCss(slug) });
  const tokens = useMemo(() => (data?.text ? parseTokens(data.text) : []), [data]);
  const colors = tokens.filter((t) => isColor(t.value));
  const others = tokens.filter((t) => !isColor(t.value));
  const fonts = others.filter((t) => t.name.startsWith('font'));
  const rest = others.filter((t) => !t.name.startsWith('font'));

  return (
    <div className="max-w-5xl mx-auto px-8 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">Marca</h2>
      <div className="text-sm text-muted mt-0.5 mb-5">
        Tokens de <span className="font-mono text-xs">{data?.file ?? 'brand/brand.css'}</span> — fonte única de cores e tipografia das peças. Somente leitura aqui; regras de uso em <span className="font-mono text-xs">brand/BRAND.md</span>.
      </div>
      {isLoading && <div className="h-60 rounded-xl bg-surface-2 animate-pulse" />}
      <ErrorBox error={error} />
      {data && data.text === null && <div className="text-sm text-muted border border-dashed border-border rounded-xl p-8 text-center">Sem brand.css. A skill <code>setup</code> extrai os tokens da marca.</div>}
      {colors.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Cores</div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-8">
            {colors.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="h-16 border-b border-border" style={{ background: t.value }} />
                <div className="px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium font-mono truncate">--{t.name}</span>
                    <span className="text-[11px] font-mono text-muted shrink-0">{t.value}</span>
                  </div>
                  {t.comment && <div className="text-[11px] text-muted mt-0.5 line-clamp-2" title={t.comment}>{t.comment}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {fonts.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Tipografia</div>
          <Card className="mb-8 p-0 overflow-hidden">
            {fonts.map((t) => (
              <div key={t.name} className="grid grid-cols-[200px_1fr] gap-3 px-4 py-2 border-b border-border last:border-0 text-sm">
                <span className="font-mono text-muted">--{t.name}</span><span className="font-mono text-xs break-all">{t.value}</span>
              </div>
            ))}
          </Card>
        </>
      )}
      {rest.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Forma e outros</div>
          <Card className="p-0 overflow-hidden">
            {rest.map((t) => (
              <div key={t.name} className="grid grid-cols-[200px_1fr_auto] gap-3 px-4 py-2 border-b border-border last:border-0 text-sm items-center">
                <span className="font-mono text-muted">--{t.name}</span>
                <span className="font-mono text-xs break-all">{t.value}</span>
                {t.name.startsWith('radius') && <span className="h-6 w-10 border border-border bg-surface-2" style={{ borderRadius: t.value }} />}
                {t.name.startsWith('shadow') && <span className="h-6 w-10 bg-surface" style={{ boxShadow: t.value }} />}
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
