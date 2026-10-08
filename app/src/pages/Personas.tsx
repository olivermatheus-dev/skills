// Personas: cartões por papel + editor lateral com todos os campos do schema e a história em markdown.
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Doc, type Persona } from '../api';
import { Button, Card, Drawer, Empty, ErrorBox, Field, Input, LinesInput, PageHeader, Select, Textarea, cx } from '../components/kit';
import { MarkdownEditor } from '../components/Markdown';
import { TagChip, TagsInput, useProjectTags } from '../components/notes/TagsInput';
import { AWARENESS, AwarenessMeter } from '../components/personas/awareness';
import { tidyMd } from '../components/notes/tidy';
import { qk, realId, removeDoc, runOptimistic, trackCreate, upsertDoc, usePersonas } from '../queries';
import { toast } from '../components/toast';
import { slugify } from '../../../core/platform';
import { AppContent } from '../components/AppContent';

type Role = Persona['role'];
const ROLES: { id: Role; label: string; cls: string }[] = [
  { id: 'primaria', label: 'Primária', cls: 'bg-primary-soft text-primary-ink' },
  { id: 'secundaria', label: 'Secundária', cls: 'bg-sky-50 text-sky-700' },
  { id: 'anti-persona', label: 'Anti-persona', cls: 'bg-red-50 text-destructive' },
];
const roleOf = (r: Role) => ROLES.find((x) => x.id === r) ?? ROLES[0];
const LISTS = ['pains', 'desires', 'objections', 'triggers', 'channels', 'quotes'] as const;
type ListKey = (typeof LISTS)[number];

const BODY_TEMPLATE = `## História\n\n\n## Um dia na vida\n\n\n## Observações\n\n`;
const blank = (): Doc<Persona> => ({
  data: { id: '', name: '', role: 'primaria', summary: '', pains: [], desires: [], objections: [], triggers: [], channels: [], quotes: [], tags: [], updated: '' },
  body: BODY_TEMPLATE, file: '',
});

function RoleBadge({ role }: { role: Role }) {
  const r = roleOf(role);
  return <span className={cx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', r.cls)}>{r.label}</span>;
}

export default function Personas() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = usePersonas(slug);
  const { byId: tagDefs } = useProjectTags(slug);
  // painel aberto; `error` = a gravação falhou e o painel voltou com o rascunho do usuário
  const [open, setOpen] = useState<(Doc<Persona> & { error?: unknown; draft?: boolean }) | null>(null);

  const sorted = useMemo(() => {
    const order = (r: Role) => ROLES.findIndex((x) => x.id === r);
    return [...(data ?? [])].sort((a, b) => order(a.data.role) - order(b.data.role) || a.data.name.localeCompare(b.data.name, 'pt-BR'));
  }, [data]);

  return (
    <AppContent>
      <PageHeader
        title="Personas"
        subtitle="Para quem a gente fala (e para quem não). Base de roteiros, anúncios e páginas."
        actions={<Button onClick={() => setOpen(blank())}>+ Nova persona</Button>}
      />
      {isLoading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />)}</div>}
      <ErrorBox error={error} />
      {data && !data.length && (
        <Empty title="Nenhuma persona cadastrada" hint="Comece pela persona primária: quem mais sente a dor que o produto resolve."
          action={<Button onClick={() => setOpen(blank())}>Criar persona</Button>} />
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((p) => (
          <Card key={p.data.id} onClick={() => setOpen(p)} className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.data.name}</div>
                {(p.data.occupation || p.data.age) && (
                  <div className="text-xs text-muted-foreground truncate">{[p.data.occupation, p.data.age].filter(Boolean).join(' · ')}</div>
                )}
              </div>
              <RoleBadge role={p.data.role} />
            </div>
            {p.data.summary && <p className="text-sm text-foreground/80 line-clamp-3">{p.data.summary}</p>}
            <AwarenessMeter value={p.data.awareness} />
            {p.data.pains.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Dores</div>
                <ul className="text-sm space-y-0.5">
                  {p.data.pains.slice(0, 3).map((x) => <li key={x} className="flex gap-1.5"><span className="text-muted-foreground">–</span><span className="line-clamp-1">{x}</span></li>)}
                  {p.data.pains.length > 3 && <li className="text-xs text-muted-foreground">+{p.data.pains.length - 3}</li>}
                </ul>
              </div>
            )}
            {p.data.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-auto">{p.data.tags.map((t) => <TagChip key={t} id={t} def={tagDefs[t]} small />)}</div>}
          </Card>
        ))}
      </div>
      {open && <PersonaDrawer key={`${open.data.id || 'nova'}${open.error ? ':erro' : ''}`} slug={slug} initial={open} onClose={() => setOpen(null)} onFailed={setOpen} />}
    </AppContent>
  );
}

/** id que o servidor vai dar (mesma regra do store: slug do nome, -2, -3… se já existir) */
function predictId(name: string, taken: string[]) {
  const base = slugify(name); let id = base, n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}

function PersonaDrawer({ slug, initial, onClose, onFailed }: {
  slug: string; initial: Doc<Persona> & { error?: unknown; draft?: boolean }; onClose: () => void;
  onFailed: (d: Doc<Persona> & { error: unknown; draft: true }) => void;
}) {
  const qc = useQueryClient();
  const isNew = !initial.data.id;
  const [d, setD] = useState<Persona>(initial.data);
  const [body, setBody] = useState(initial.body);
  const [dirty, setDirty] = useState(!!initial.draft);
  const set = <K extends keyof Persona>(k: K, v: Persona[K]) => { setD((x) => ({ ...x, [k]: v })); setDirty(true); };

  const clean = (): Persona => {
    const out = { ...d, name: d.name.trim(), age: d.age?.trim() || undefined, occupation: d.occupation?.trim() || undefined };
    for (const k of LISTS) out[k] = d[k].map((x) => x.trim()).filter(Boolean);
    return out;
  };
  const key = qk.personas(slug);
  // Salvar/criar é otimista: o card muda (ou aparece) na hora e o painel fecha; erro → o painel volta com o rascunho e o erro.
  const save = () => {
    const v = clean();
    const md = tidyMd(body);
    const today = new Date().toISOString().slice(0, 10);
    const tempId = isNew ? predictId(v.name, (qc.getQueryData<Doc<Persona>[]>(key) ?? []).map((p) => p.data.id)) : v.id;
    const doc: Doc<Persona> = { data: { ...v, id: tempId, updated: today }, body: md, file: initial.file || `companies/${slug}/personas/${tempId}.md` };
    void runOptimistic(qc, {
      mutationFn: async () => {
        if (!isNew) return api.savePersona(slug, await realId('persona', slug, v.id), v, md);
        const p = api.createPersona(slug, { ...v, id: undefined }, md);
        trackCreate('persona', slug, tempId, p.then((r) => r.data.id));
        return p;
      },
      apply: () => [[key, (old: Doc<Persona>[] | undefined) => upsertDoc(old, doc)]],
      onSuccess: (r) => qc.setQueryData<Doc<Persona>[]>(key, (old) => upsertDoc(old, r, tempId)),
      onError: (e) => onFailed({ data: d, body, file: initial.file, error: e, draft: true }),
      invalidate: () => [key],
      okMessage: isNew ? 'Persona criada' : 'Salvo',
    }, undefined).catch(() => {});
    onClose();
  };
  // Apagar é otimista e sem pergunta: "Desfazer" no aviso grava de novo o mesmo arquivo.
  const del = () => {
    const snapshot: Doc<Persona> = { data: initial.data, body: initial.body, file: initial.file };
    const done = runOptimistic(qc, {
      mutationFn: async () => api.deletePersona(slug, await realId('persona', slug, d.id)),
      apply: () => [[key, (old: Doc<Persona>[] | undefined) => removeDoc(old, d.id)]],
      invalidate: () => [key],
      okMessage: false,
      errorMessage: 'Não foi possível apagar a persona',
    }, undefined).then(() => true, () => false);
    onClose();
    toast.undo(`Persona "${d.name}" apagada`, async () => {
      if (!(await done)) return;
      void runOptimistic(qc, {
        mutationFn: () => api.savePersona(slug, snapshot.data.id, snapshot.data, snapshot.body),
        apply: () => [[key, (old: Doc<Persona>[] | undefined) => upsertDoc(old, snapshot)]],
        onSuccess: (r) => qc.setQueryData<Doc<Persona>[]>(key, (old) => upsertDoc(old, r)),
        invalidate: () => [key],
        okMessage: 'Persona restaurada',
      }, undefined).catch(() => {});
    });
  };
  const close = () => { if (!dirty || confirm('Descartar as alterações desta persona?')) onClose(); };

  const list = (k: ListKey, label: string, ph: string, hint?: string) => (
    <Field label={label} hint={hint}><LinesInput value={d[k]} onChange={(v) => set(k, v)} placeholder={ph} rows={Math.max(3, d[k].length + 1)} /></Field>
  );

  return (
    <Drawer open onClose={close} width="max-w-3xl" title={isNew ? 'Nova persona' : <span className="flex items-center gap-2">{d.name || 'Persona'} <RoleBadge role={d.role} /></span>}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <div className="sm:col-span-2"><Field label="Nome"><Input autoFocus={isNew} className="w-full" value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Psicóloga recém-autônoma" /></Field></div>
        <Field label="Papel">
          <Select className="w-full" value={d.role} onChange={(e) => set('role', e.target.value as Role)}>
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Resumo" hint="1–2 frases: quem é e o que mais importa para ela.">
        <Textarea rows={2} value={d.summary} onChange={(e) => set('summary', e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <Field label="Idade"><Input className="w-full" value={d.age ?? ''} onChange={(e) => set('age', e.target.value)} placeholder="28–40" /></Field>
        <Field label="Ocupação"><Input className="w-full" value={d.occupation ?? ''} onChange={(e) => set('occupation', e.target.value)} placeholder="Psicóloga clínica" /></Field>
        <Field label="Consciência">
          <Select className="w-full" value={d.awareness ?? ''} onChange={(e) => set('awareness', e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">— não definido</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} · {AWARENESS[n]}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        {list('pains', 'Dores', 'Uma dor por linha')}
        {list('desires', 'Desejos', 'Um desejo por linha')}
        {list('objections', 'Objeções', 'Uma objeção por linha')}
        {list('triggers', 'Gatilhos de compra', 'O que faz agir agora')}
        {list('channels', 'Canais', 'Onde está (Instagram, grupos de WhatsApp…)')}
        {list('quotes', 'Frases reais', 'Como ela fala, entre aspas', 'Só frases ouvidas de verdade, nunca inventadas.')}
      </div>
      <Field label="Tags"><TagsInput slug={slug} value={d.tags} onChange={(v) => set('tags', v)} /></Field>
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">História e observações</div>
        <MarkdownEditor value={body} onChange={(md) => { if (md !== body) { setBody(md); setDirty(true); } }} minHeight={180} />
      </div>
      <ErrorBox error={initial.error} />
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 px-6 py-3 bg-card border-t border-border flex items-center gap-2">
        <Button onClick={save} disabled={!d.name.trim()}>{isNew ? 'Criar persona' : 'Salvar'}</Button>
        <Button variant="ghost" onClick={close}>Cancelar</Button>
        {!isNew && <span className="text-xs text-muted-foreground ml-2">{initial.file}{d.updated ? ` · atualizada ${new Date(`${d.updated}T12:00:00`).toLocaleDateString('pt-BR')}` : ''}</span>}
        {!isNew && (
          <Button variant="danger" className="ml-auto" onClick={del} title="Remove o arquivo. Dá para desfazer no aviso.">Apagar</Button>
        )}
      </div>
    </Drawer>
  );
}
