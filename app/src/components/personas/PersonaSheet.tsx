// Painel lateral da persona: cabeçalho com identidade (cor, avatar, nome, resumo, fatos), seções com ícone para ler
// de relance e lápis por seção para editar só aquele bloco. Persona nova abre tudo em edição. Salvar grava o arquivo.
import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Briefcase, Cake, Check, ChevronDown, Gauge, Palette, Pencil, Save, Tag, Trash2, type LucideIcon } from 'lucide-react';
import { api, type Doc, type Persona, type TagDef } from '../../api';
import { Button, Drawer, ErrorBox, Field, Input, LinesInput, Select, Textarea, cx } from '../kit';
import { MarkdownEditor } from '../Markdown';
import { TagChip, TagsInput } from '../notes/TagsInput';
import { tidyMd } from '../notes/tidy';
import { qk, realId, removeDoc, runOptimistic, trackCreate, upsertDoc } from '../../queries';
import { toast } from '../toast';
import { slugify } from '../../../../core/platform';
import { AWARENESS, AwarenessMeter } from './awareness';
import { autoColor, Avatar, colorOf, ColorPicker, colorVars, RoleBadge, ROLES, splitName, type Role } from './identity';
import { LISTS, SECTIONS, type SectionDef } from './sections';
import { PERSONA_COLORS } from '../../../../schema/persona';

export const BODY_TEMPLATE = `## História\n\n\n## Um dia na vida\n\n\n## Observações\n\n`;
export const blankPersona = (): Doc<Persona> => ({
  data: { id: '', name: '', role: 'primaria', summary: '', pains: [], desires: [], objections: [], triggers: [], channels: [], quotes: [], tags: [], updated: '' },
  body: BODY_TEMPLATE, file: '',
});
export type OpenPersona = Doc<Persona> & { error?: unknown; draft?: boolean };

/** id que o servidor vai dar (mesma regra do store: slug do nome, -2, -3… se já existir) */
function predictId(name: string, taken: string[]) {
  const base = slugify(name); let id = base, n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}
/** corpo só com o molde (títulos vazios) = nada escrito */
const bodyIsEmpty = (md: string) => !md.replace(/^#+ .*$/gm, '').trim();

const iconBtn = 'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition';

export function PersonaSheet({ slug, initial, tagDefs, onClose, onFailed }: {
  slug: string; initial: OpenPersona; tagDefs: Record<string, TagDef>; onClose: () => void;
  onFailed: (d: OpenPersona & { error: unknown; draft: true }) => void;
}) {
  const qc = useQueryClient();
  const isNew = !initial.data.id;
  // persona nova já nasce com a cor menos usada no projeto (fica gravada: não muda enquanto digita o nome nem depois de salvar)
  const [d, setD] = useState<Persona>(() => {
    if (!isNew || initial.data.color) return initial.data;
    const used = (qc.getQueryData<Doc<Persona>[]>(qk.personas(slug)) ?? []).map((p) => colorOf(p.data));
    const color = [...PERSONA_COLORS].sort((a, b) => used.filter((c) => c === a).length - used.filter((c) => c === b).length)[0];
    return { ...initial.data, color };
  });
  const [body, setBody] = useState(initial.body);
  const [dirty, setDirty] = useState(!!initial.draft);
  // blocos em edição: 'perfil' + chaves das listas. Persona nova (ou rascunho que voltou com erro) abre tudo.
  const [editing, setEditing] = useState<Set<string>>(() => new Set(isNew || initial.draft ? ['perfil', ...LISTS] : []));
  const [storyOpen, setStoryOpen] = useState(() => isNew || !bodyIsEmpty(initial.body));
  const set = <K extends keyof Persona>(k: K, v: Persona[K]) => { setD((x) => ({ ...x, [k]: v })); setDirty(true); };
  const toggle = (k: string) => setEditing((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const color = colorOf(d);
  const { short, tagline } = splitName(d.name);

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

  const editProfile = editing.has('perfil');
  const title = isNew && !d.name.trim()
    ? <span className="flex items-center gap-2"><Avatar name="?" color={color} size="sm" />Nova persona</span>
    : <span className="flex items-center gap-2 min-w-0"><Avatar name={d.name} color={color} size="sm" /><span className="truncate">{short || 'Persona'}</span><RoleBadge role={d.role} /></span>;

  return (
    <Drawer open onClose={close} width="max-w-3xl" title={title}>
      <div style={colorVars(color)}>
        {/* ---------- Identidade ---------- */}
        <section className="-mx-6 -mt-6 px-6 pt-5 pb-5 mb-5 border-b border-[var(--pc-line)]"
          style={{ background: 'linear-gradient(180deg, var(--pc-soft), var(--pc-softer))' }}>
          <div className="flex items-start gap-4">
            <ColorPicker value={d.color} auto={autoColor(d.id || d.name || 'persona')} onChange={(c) => set('color', c)}>
              <button type="button" className="relative group/av rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pc)] focus-visible:ring-offset-2" title="Trocar a cor da persona">
                <Avatar name={d.name || '?'} color={color} size="lg" className="shadow-sm" />
                <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-card border border-[var(--pc-line)] shadow-sm flex items-center justify-center text-[var(--pc-ink)] group-hover/av:scale-110 transition">
                  <Palette className="h-3.5 w-3.5" />
                </span>
              </button>
            </ColorPicker>

            {editProfile ? (
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3">
                  <div className="sm:col-span-2"><Field label="Nome"><Input autoFocus={isNew} className="w-full" value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Mariana — a terapeuta que não quer ser secretária" /></Field></div>
                  <Field label="Papel">
                    <Select className="w-full" value={d.role} onChange={(e) => set('role', e.target.value as Role)}>
                      {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </Select>
                  </Field>
                </div>
                <Field label="Resumo" hint="1–2 frases: quem é e o que mais importa para ela. Dica: “Nome — apelido” vira nome + subtítulo.">
                  <Textarea rows={2} value={d.summary} onChange={(e) => set('summary', e.target.value)} />
                </Field>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold tracking-tight leading-tight">{short || 'Sem nome'}</h2>
                    {tagline && <p className="text-sm text-[var(--pc-ink)] mt-0.5">{tagline}</p>}
                  </div>
                  <button type="button" className={iconBtn} onClick={() => toggle('perfil')} title="Editar nome, papel, resumo e dados"><Pencil className="h-3.5 w-3.5" />Editar</button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <RoleBadge role={d.role} />
                  {d.tags.map((t) => <TagChip key={t} id={t} def={tagDefs[t]} small />)}
                </div>
                {d.summary
                  ? <p className="text-sm text-foreground/85 leading-relaxed mt-3">{d.summary}</p>
                  : <button type="button" onClick={() => toggle('perfil')} className="text-sm text-muted-foreground hover:text-foreground mt-3">+ Escrever um resumo</button>}
              </div>
            )}
          </div>

          {/* fatos curtos em grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            <Fact icon={Briefcase} label="Ocupação">
              {editProfile ? <Input className="w-full h-8" value={d.occupation ?? ''} onChange={(e) => set('occupation', e.target.value)} placeholder="Psicóloga clínica" />
                : <span className="line-clamp-2" title={d.occupation}>{d.occupation || <Muted />}</span>}
            </Fact>
            <Fact icon={Cake} label="Idade">
              {editProfile ? <Input className="w-full h-8" value={d.age ?? ''} onChange={(e) => set('age', e.target.value)} placeholder="28–40" />
                : d.age || <Muted />}
            </Fact>
            <Fact icon={Gauge} label={d.awareness ? `Consciência · ${d.awareness}/5` : 'Consciência'}>
              {editProfile ? (
                <Select className="w-full" value={d.awareness ?? ''} onChange={(e) => set('awareness', e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">— não definido</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} · {AWARENESS[n]}</option>)}
                </Select>
              ) : (
                <div className="space-y-1 pt-0.5">
                  <AwarenessMeter value={d.awareness} color="var(--pc)" showLabel={false} />
                  <div className="text-xs font-normal text-muted-foreground">{d.awareness ? AWARENESS[d.awareness] : 'não definida'}</div>
                </div>
              )}
            </Fact>
          </div>

          {/* tags (na leitura, ficam ao lado do papel) */}
          {editProfile && (
            <div className="flex items-center gap-2 mt-3">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <TagsInput slug={slug} value={d.tags} onChange={(v) => set('tags', v)} className="flex-1" />
              {!isNew && <button type="button" className={iconBtn} onClick={() => toggle('perfil')}><Check className="h-3.5 w-3.5" />Pronto</button>}
            </div>
          )}
        </section>

        {/* ---------- Seções ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTIONS.map((s) => (
            <SectionCard key={s.key} def={s} items={d[s.key]} editing={editing.has(s.key)} canClose={!isNew}
              wide={s.view !== 'bullets'}
              onToggle={() => toggle(s.key)} onChange={(v) => set(s.key, v)} />
          ))}
        </div>

        {/* ---------- História ---------- */}
        <section className="mt-3 rounded-xl border border-border bg-card">
          <button type="button" onClick={() => setStoryOpen((o) => !o)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
            <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-[var(--pc-soft)] text-[var(--pc-ink)]"><BookOpen className="h-4 w-4" /></span>
            <span className="text-sm font-semibold">História e observações</span>
            {!storyOpen && bodyIsEmpty(body) && <span className="text-xs text-muted-foreground">vazio</span>}
            <ChevronDown className={cx('h-4 w-4 ml-auto text-muted-foreground transition', storyOpen && 'rotate-180')} />
          </button>
          {storyOpen && (
            <div className="px-3 pb-3">
              <MarkdownEditor value={body} onChange={(md) => { if (md !== body) { setBody(md); setDirty(true); } }} minHeight={160} />
            </div>
          )}
        </section>

        <ErrorBox error={initial.error} />

        {/* ---------- Rodapé ---------- */}
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-5 px-6 py-3 bg-card/95 backdrop-blur border-t border-border flex items-center gap-2">
          <Button onClick={save} disabled={!d.name.trim() || (!dirty && !isNew)}>
            <span className="inline-flex items-center gap-1.5"><Save className="h-4 w-4" />{isNew ? 'Criar persona' : 'Salvar'}</span>
          </Button>
          <Button variant="ghost" onClick={close}>{dirty ? 'Cancelar' : 'Fechar'}</Button>
          <span className="text-xs text-muted-foreground ml-1 truncate min-w-0">
            {dirty
              ? <span className="inline-flex items-center gap-1.5 text-warning-ink"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Alterações não salvas</span>
              : !isNew && <>{initial.file}{d.updated ? ` · atualizada ${new Date(`${d.updated}T12:00:00`).toLocaleDateString('pt-BR')}` : ''}</>}
          </span>
          {!isNew && (
            <button type="button" onClick={del} title="Remove o arquivo. Dá para desfazer no aviso."
              className="ml-auto shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-destructive hover:bg-red-50 transition">
              <Trash2 className="h-4 w-4" />Apagar
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

const Muted = () => <span className="text-muted-foreground">—</span>;

function Fact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-card/80 border border-[var(--pc-line)] px-3 py-2 min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5 text-[var(--pc-ink)]" />{label}
      </div>
      <div className="text-sm font-medium leading-snug">{children}</div>
    </div>
  );
}

function SectionCard({ def, items, editing, canClose, wide, onToggle, onChange }: {
  def: SectionDef; items: string[]; editing: boolean; canClose: boolean; wide: boolean;
  onToggle: () => void; onChange: (v: string[]) => void;
}) {
  const Icon = def.icon;
  const list = items.filter((x) => x.trim());
  return (
    <section className={cx('rounded-xl border border-border bg-card p-3 flex flex-col', wide && 'sm:col-span-2')}>
      <header className="flex items-center gap-2.5 mb-2">
        <span className={cx('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', def.tile)}><Icon className="h-4 w-4" /></span>
        <h3 className="text-sm font-semibold">{def.label}</h3>
        {list.length > 0 && <span className="text-xs text-muted-foreground tabular-nums">{list.length}</span>}
        {(!editing || canClose) && (
          <button type="button" onClick={onToggle} className={cx(iconBtn, 'ml-auto')} title={editing ? 'Terminar de editar' : `Editar ${def.short}`}>
            {editing ? <><Check className="h-3.5 w-3.5" />Pronto</> : <Pencil className="h-3.5 w-3.5" />}
          </button>
        )}
      </header>

      {editing ? (
        <>
          <LinesInput value={items} onChange={onChange} placeholder={def.placeholder} rows={Math.max(3, items.length + 1)} />
          <div className="text-[11px] text-muted-foreground mt-1">{def.hint ?? 'Um item por linha.'}</div>
        </>
      ) : !list.length ? (
        <button type="button" onClick={onToggle} className="text-left text-sm text-muted-foreground hover:text-foreground rounded-md border border-dashed border-border px-2.5 py-2">
          + Adicionar {def.short}
        </button>
      ) : def.view === 'chips' ? (
        <div className="flex flex-wrap gap-1.5">
          {list.map((x, i) => <span key={i} className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[13px] leading-tight">{x}</span>)}
        </div>
      ) : def.view === 'quotes' ? (
        <div className="flex flex-wrap gap-1.5">
          {list.map((x, i) => (
            <span key={i} className="rounded-2xl rounded-bl-sm px-3 py-1.5 text-[13px] italic leading-snug bg-[var(--pc-soft)] text-[var(--pc-ink)]">“{x.replace(/^["“”']+|["“”']+$/g, '')}”</span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {list.map((x, i) => (
            <li key={i} className="flex gap-2 text-sm leading-snug">
              <span className={cx('mt-[7px] h-1.5 w-1.5 rounded-full shrink-0', def.dot)} />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
