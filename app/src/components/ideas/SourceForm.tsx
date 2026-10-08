// Formulário de uma fonte (041): usado na gaveta (tudo à vista) e no "Adicionar fonte" (`compact`: o resto em "Avançado").
import { useState, type ReactNode } from 'react';
import { Check, ChevronRight, ExternalLink, Pencil } from 'lucide-react';
import type { Source, StrategyRefs } from '../../api';
import { Input, SelectField, Textarea, cx } from '../kit';
import { TagsInput } from '../notes/TagsInput';
import { Tip } from '../competitors/toolbar';
import { ADAPTERS, LANGS, METHODS, TRUST, TYPES, WEIGHT } from './sources-meta';

/** campos que o formulário edita */
export type SourceDraft = Pick<Source, 'name' | 'url' | 'type' | 'language' | 'access' | 'defaultQuery' | 'keywords' | 'pillars' | 'series' | 'tags' | 'trust' | 'weight' | 'notes'>;

export function Box({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx('mb-4', className)}>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; hint?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-border bg-card p-0.5">
      {options.map((o) => (
        <Tip key={String(o.value)} content={o.hint}>
          <button type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={cx('h-7 rounded px-2.5 text-xs transition', value === o.value ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
            {o.label}
          </button>
        </Tip>
      ))}
    </div>
  );
}

function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <Tip content={title}>
      <button type="button" aria-pressed={on} onClick={onClick}
        className={cx('inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs transition',
          on ? 'border-primary/60 bg-primary-soft text-primary-ink font-medium' : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30')}>
        {on && <Check className="size-3 -ml-0.5" />}{children}
      </button>
    </Tip>
  );
}

/**
 * Pilares e séries que a fonte alimenta (CONTENT_STRATEGY.md). `summary` (diálogo curto): mostra só o que está marcado,
 * com "Alterar" para abrir a escolha.
 */
export function FeedPicker({ v, set, refs, summary }: { v: Pick<SourceDraft, 'pillars' | 'series'>; set: (p: Partial<SourceDraft>) => void; refs?: StrategyRefs; summary?: boolean }) {
  const [editing, setEditing] = useState(!summary);
  const flip = (l: number[], n: number) => (l.includes(n) ? l.filter((x) => x !== n) : [...l, n].sort((a, b) => a - b));
  if (!refs) return <div className="text-xs text-muted-foreground">Carregando pilares e séries…</div>;
  if (!editing) {
    const picked = [
      ...v.pillars.map((n) => ({ k: `p${n}`, label: `P${n} · ${refs.pillars.find((p) => p.n === n)?.name ?? '?'}` })),
      ...v.series.map((n) => ({ k: `s${n}`, label: `S${n} · ${refs.series.find((x) => x.n === n)?.name ?? '?'}` })),
    ];
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {picked.length ? picked.map((x) => <span key={x.k} className="inline-flex h-7 items-center rounded-full border border-primary/40 bg-primary-soft px-2.5 text-xs font-medium text-primary-ink">{x.label}</span>)
          : <span className="text-xs text-muted-foreground">Nenhum pilar ou série.</span>}
        <button type="button" onClick={() => setEditing(true)} className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Pencil className="size-3" />Alterar</button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="w-12 shrink-0 pt-1.5 text-[11px] text-muted-foreground">Pilares</span>
        <div className="flex flex-wrap gap-1.5">
          {refs.pillars.map((p) => <Chip key={p.n} on={v.pillars.includes(p.n)} onClick={() => set({ pillars: flip(v.pillars, p.n) })} title={`Pilar ${p.n}`}><b className="tabular-nums">{p.n}</b> {p.name}</Chip>)}
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="w-12 shrink-0 pt-1.5 text-[11px] text-muted-foreground">Séries</span>
        <div className="flex flex-wrap gap-1.5">
          {refs.series.map((x) => <Chip key={x.n} on={v.series.includes(x.n)} onClick={() => set({ series: flip(v.series, x.n) })} title={`Série ${x.n} · pilares ${x.pillars.join(' e ')}`}><b className="tabular-nums">{x.n}</b> {x.name}</Chip>)}
        </div>
      </div>
    </div>
  );
}

const typeOptions = TYPES.map((t) => ({ value: t.id, label: t.label, icon: <t.icon /> }));
const langOptions = LANGS.map((l) => ({ value: l.id, label: l.label }));
const methodOptions = METHODS.map((m) => ({ value: m.id, label: m.label, icon: <m.icon /> }));
const adapterOptions = [{ value: '', label: 'Nenhum (subagente lê)' }, ...Object.entries(ADAPTERS).map(([value, label]) => ({ value, label: value === 'rss' ? 'Feed RSS/Atom' : value === 'html-diff' ? 'Diferença da página' : label }))];
const trustOptions = ([3, 2, 1] as const).map((n) => ({ value: n, label: TRUST[n].label, hint: TRUST[n].hint }));
const weightOptions = ([3, 2, 1] as const).map((n) => ({ value: n, label: WEIGHT[n] }));

export function SourceForm({ v, set, refs, slug, compact }: { v: SourceDraft; set: (p: Partial<SourceDraft>) => void; refs?: StrategyRefs; slug: string; compact?: boolean }) {
  const [adv, setAdv] = useState(!compact);
  const setAccess = (p: Partial<Source['access']>) => set({ access: { ...v.access, ...p } });
  const method = METHODS.find((m) => m.id === v.access.method);
  const showEndpoint = v.access.method !== 'web';

  const access = (
    <>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Box label="Como a IA consulta" hint={method?.hint}>
          <SelectField value={v.access.method} onChange={(m) => setAccess({ method: m as Source['access']['method'] })} options={methodOptions} className="w-full" aria-label="Como a IA consulta" />
        </Box>
        {showEndpoint && (
          <Box label="Coletor do script">
            <SelectField value={v.access.adapter ?? ''} onChange={(a) => setAccess({ adapter: (a || undefined) as Source['access']['adapter'] })} options={adapterOptions} className="w-full" aria-label="Coletor do script" />
          </Box>
        )}
      </div>
      {showEndpoint && (
        <Box label="Endereço da API ou do feed" hint={<>Use <code className="rounded bg-muted px-1">{'{q}'}</code> onde entra a consulta.</>}>
          <Input className="w-full font-mono text-xs" value={v.access.endpoint ?? ''} onChange={(e) => setAccess({ endpoint: e.target.value || undefined })} placeholder="https://…/rss?q={q}" />
        </Box>
      )}
    </>
  );

  const advanced = (
    <>
      {compact && access}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Box label="Peso na pesquisa" hint="Desempate da síntese. Brasileiras têm prioridade.">
          <Segmented label="Peso" value={v.weight} options={weightOptions} onChange={(n) => set({ weight: n })} />
        </Box>
        <Box label="Consulta padrão" hint="Quando o pedido não traz tema.">
          <Input className="w-full" value={v.defaultQuery ?? ''} onChange={(e) => set({ defaultQuery: e.target.value || undefined })} placeholder="ex.: psicoterapia" />
        </Box>
      </div>
      <Box label="Palavras-chave" hint="Separadas por vírgula; somadas ao tema de cada pesquisa.">
        <Input className="w-full" value={v.keywords.join(', ')} onChange={(e) => set({ keywords: e.target.value.split(',').map((x) => x.trimStart()) })}
          onBlur={() => set({ keywords: v.keywords.map((x) => x.trim()).filter(Boolean) })} placeholder="psicoterapia, consultório" />
      </Box>
      <Box label="Tags"><TagsInput slug={slug} value={v.tags} onChange={(tags) => set({ tags })} /></Box>
      <Box label="Notas" hint="O que a IA precisa saber: bloqueios, paywall, o que vale e o que não vale desta fonte.">
        <Textarea rows={3} value={v.notes} onChange={(e) => set({ notes: e.target.value })} />
      </Box>
    </>
  );

  return (
    <div>
      <Box label="Nome">
        <Input className="w-full text-base" value={v.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: Psicologia: Ciência e Profissão" />
      </Box>
      {!compact && (
        <Box label="Link">
          <div className="flex gap-2">
            <Input className="w-full" value={v.url} onChange={(e) => set({ url: e.target.value })} />
            <a href={v.url} target="_blank" rel="noreferrer" className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted"><ExternalLink className="size-4" />Abrir</a>
          </div>
        </Box>
      )}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[1fr_160px]">
        <Box label="Tipo"><SelectField value={v.type} onChange={(t) => set({ type: t as Source['type'] })} options={typeOptions} className="w-full" aria-label="Tipo" /></Box>
        <Box label="Idioma"><SelectField value={v.language} onChange={(l) => set({ language: l as Source['language'] })} options={langOptions} className="w-full" aria-label="Idioma" /></Box>
      </div>
      {compact && (
        <Box label="Como a IA consulta" hint={method?.hint}>
          <SelectField value={v.access.method} onChange={(m) => setAccess({ method: m as Source['access']['method'] })} options={methodOptions} className="w-full sm:w-[260px]" aria-label="Como a IA consulta" />
        </Box>
      )}
      <Box label="Alimenta"><FeedPicker v={v} set={set} refs={refs} summary={compact} /></Box>
      <Box label="Confiança" hint={TRUST[v.trust].hint}>
        <Segmented label="Confiança" value={v.trust} options={trustOptions} onChange={(n) => set({ trust: n })} />
      </Box>
      {!compact && access}
      {compact ? (
        <div className="border-t border-border pt-3">
          <button type="button" onClick={() => setAdv((x) => !x)} aria-expanded={adv} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronRight className={cx('size-4 transition', adv && 'rotate-90')} />Avançado <span className="text-xs">(coletor, peso, palavras-chave, notas)</span>
          </button>
          {adv && advanced}
        </div>
      ) : advanced}
    </div>
  );
}
