// Ideias → Fontes (041 F1): onde a IA procura ideias e temas. Lista com filtros por tipo e tema, aceitar/recusar as
// sugeridas (uma a uma ou em lote), pausar, gaveta de edição e "Adicionar fonte" colando o link (sugestão por script, sem IA).
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, Inbox, Pause, Play, Plus, RotateCcw, X } from 'lucide-react';
import { api, type Source, type StrategyRefs } from '../api';
import { Button, Empty, ErrorBox, PageHeader, SelectField, cx, type SelectOption } from '../components/kit';
import { AppContent } from '../components/AppContent';
import { IdeasTabs } from '../components/ideas/IdeasTabs';
import { DataTable, FilterBar, Tip, parseSort, sortRows, useUrlState, type Col, type SortDef } from '../components/competitors/toolbar';
import { Checkbox } from '../components/ui/checkbox';
import { qk, runOptimistic, useSources, useStrategyRefs } from '../queries';
import { toast } from '../components/toast';
import { Dots, LANGS, METHODS, STATUS, TRUST, TYPES, VerifiedBadge, WEIGHT, consultaLabel, domainOf, methodMeta, statusMeta, typeMeta } from '../components/ideas/sources-meta';
import { SourceDrawer } from '../components/ideas/SourceDrawer';
import { AddSourceDialog } from '../components/ideas/AddSourceDialog';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const DEFAULTS = { q: '', tipo: '', tema: '', status: '', idioma: '', consulta: '', ordem: 'status', asc: '1' };
const STATUS_ORDER: Record<Source['status'], number> = { sugerida: 0, ativa: 1, pausada: 2, arquivada: 3 };

/** "P4 P6 · S3" com os nomes no tooltip */
export function FeedsCell({ s, refs }: { s: Pick<Source, 'pillars' | 'series'>; refs?: StrategyRefs }) {
  if (!s.pillars.length && !s.series.length) return <span className="text-muted-foreground/60">—</span>;
  const tip = [
    ...s.pillars.map((n) => `Pilar ${n}: ${refs?.pillars.find((p) => p.n === n)?.name ?? '?'}`),
    ...s.series.map((n) => `Série ${n}: ${refs?.series.find((x) => x.n === n)?.name ?? '?'}`),
  ].join('\n');
  return (
    <Tip content={tip}>
      <span className="inline-flex flex-wrap gap-1">
        {s.pillars.map((n) => <span key={`p${n}`} className="rounded bg-muted px-1 text-[11px] font-medium tabular-nums text-muted-foreground">P{n}</span>)}
        {s.series.map((n) => <span key={`s${n}`} className="rounded bg-primary-soft px-1 text-[11px] font-medium tabular-nums text-primary-ink">S{n}</span>)}
      </span>
    </Tip>
  );
}

export default function Fontes() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const { data, isLoading, error } = useSources(slug);
  const refs = useStrategyRefs(slug).data;
  const { values: f, set, reset } = useUrlState(DEFAULTS);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Source | null>(null);
  const [adding, setAdding] = useState(false);
  const all = data ?? [];
  const key = qk.sources(slug);

  // ---------- filtros ----------
  const matches = (s: Source, skip?: string) =>
    (skip === 'status' || (f.status === 'todas' ? true : f.status ? s.status === f.status : s.status !== 'arquivada'))
    && (skip === 'tipo' || !f.tipo || s.type === f.tipo)
    && (skip === 'tema' || !f.tema || (f.tema[0] === 'p' ? s.pillars.includes(+f.tema.slice(1)) : s.series.includes(+f.tema.slice(1))))
    && (skip === 'idioma' || !f.idioma || s.language === f.idioma)
    && (skip === 'consulta' || !f.consulta || s.access.method === f.consulta)
    && (!f.q || fold(`${s.name} ${s.url} ${s.id} ${s.notes} ${s.keywords.join(' ')}`).includes(fold(f.q)));
  const count = (skip: string, pred: (s: Source) => boolean) => all.filter((s) => matches(s, skip) && pred(s)).length;

  const sortDefs: Record<string, SortDef<Source>> = {
    nome: { label: 'Fonte', get: (s) => s.name, text: true },
    tipo: { label: 'Tipo', get: (s) => typeMeta(s.type).short, text: true },
    consulta: { label: 'Consulta', get: (s) => consultaLabel(s.access), text: true },
    trust: { label: 'Confiança', get: (s) => s.trust },
    peso: { label: 'Peso', get: (s) => s.weight },
    status: { label: 'Status', get: (s) => STATUS_ORDER[s.status], text: true },
  };
  const sort = parseSort(f.ordem, f.asc);
  const rows = useMemo(() => {
    const base = all.filter((s) => matches(s)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    // padrão: sugeridas primeiro e, dentro de cada status, as de maior peso (brasileiras) no topo
    if (sort.k === 'status') base.sort((a, b) => b.weight - a.weight);
    return sortRows(base, sortDefs, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, f]);
  const anyFilter = !!(f.q || f.tipo || f.tema || f.status || f.idioma || f.consulta);

  const suggested = all.filter((s) => s.status === 'sugerida');
  const suggestedOk = suggested.filter((s) => s.verifiedAt);

  // ---------- status (otimista, com desfazer) ----------
  const STATUS_MSG: Record<Source['status'], (n: number) => string> = {
    ativa: (n) => (n === 1 ? 'Fonte ativa' : `${n} fontes ativas`),
    arquivada: (n) => (n === 1 ? 'Fonte recusada' : `${n} fontes recusadas`),
    pausada: (n) => (n === 1 ? 'Fonte pausada' : `${n} fontes pausadas`),
    sugerida: (n) => (n === 1 ? 'Fonte de volta às sugeridas' : `${n} fontes de volta às sugeridas`),
  };
  const apply = (ids: string[], status: Source['status']) => runOptimistic(qc, {
    mutationFn: () => api.setSourcesStatus(slug, ids, status),
    apply: () => [[key, (old: Source[] | undefined) => old?.map((s) => (ids.includes(s.id) ? { ...s, status } : s))]],
    onSuccess: (res) => qc.setQueryData(key, res),
    invalidate: () => [key],
    okMessage: false,
  }, undefined);
  const setStatus = (ids: string[], status: Source['status']) => {
    if (!ids.length) return;
    const prev = new Map(all.filter((s) => ids.includes(s.id)).map((s) => [s.id, s.status]));
    setSel((x) => { const n = new Set(x); for (const id of ids) n.delete(id); return n; });
    void apply(ids, status).then(() => toast.undo(STATUS_MSG[status](ids.length), () => {
      const byStatus = new Map<Source['status'], string[]>();
      for (const [id, st] of prev) byStatus.set(st, [...(byStatus.get(st) ?? []), id]);
      for (const [st, l] of byStatus) void apply(l, st).catch(() => {});
    })).catch(() => {});
  };

  // ---------- seleção ----------
  const visibleIds = rows.map((s) => s.id);
  const selVisible = visibleIds.filter((id) => sel.has(id));
  const toggle = (id: string) => setSel((x) => { const n = new Set(x); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selRows = all.filter((s) => sel.has(s.id));
  const can = (st: Source['status'][]) => selRows.filter((s) => st.includes(s.status)).map((s) => s.id);

  // ---------- opções dos filtros ----------
  const statusOpts: SelectOption[] = [
    { value: '', label: 'Ativas e sugeridas', count: count('status', (s) => s.status !== 'arquivada') },
    ...STATUS.map((s) => ({ value: s.id, label: s.id === 'arquivada' ? 'Recusadas' : `${s.label}s`, icon: <span className={cx('size-2 rounded-full', s.dot)} />, count: count('status', (x) => x.status === s.id) })),
    { value: 'todas', label: 'Todas', count: count('status', () => true) },
  ];
  const typeOpts: SelectOption[] = [
    { value: '', label: 'Todos os tipos' },
    ...TYPES.map((t) => ({ value: t.id, label: t.label, icon: <t.icon />, count: count('tipo', (s) => s.type === t.id) })).filter((o) => o.count > 0 || o.value === f.tipo),
  ];
  const temaOpts: SelectOption[] = [
    { value: '', label: 'Todos os temas' },
    ...(refs?.pillars ?? []).map((p) => ({ value: `p${p.n}`, label: `P${p.n} · ${p.name}`, group: 'Pilares', count: count('tema', (s) => s.pillars.includes(p.n)) })),
    ...(refs?.series ?? []).map((x) => ({ value: `s${x.n}`, label: `S${x.n} · ${x.name}`, group: 'Séries', count: count('tema', (s) => s.series.includes(x.n)) })),
  ];
  const langOpts: SelectOption[] = [{ value: '', label: 'Todos os idiomas' }, ...LANGS.map((l) => ({ value: l.id, label: l.label, count: count('idioma', (s) => s.language === l.id) }))];
  const methodOpts: SelectOption[] = [{ value: '', label: 'Todas as consultas' }, ...METHODS.map((m) => ({ value: m.id, label: m.label, icon: <m.icon />, count: count('consulta', (s) => s.access.method === m.id) }))];

  // ---------- colunas ----------
  const allChecked = selVisible.length > 0 && selVisible.length === visibleIds.length;
  const cols: Col<Source>[] = [
    {
      k: 'sel', width: '36px', className: '!pr-0',
      label: <span onClick={(e) => e.stopPropagation()} className="inline-flex"><Checkbox aria-label="Selecionar todas" checked={allChecked ? true : selVisible.length ? 'indeterminate' : false}
        onCheckedChange={() => setSel(allChecked ? new Set([...sel].filter((id) => !visibleIds.includes(id))) : new Set([...sel, ...visibleIds]))} /></span>,
      render: (s) => <span onClick={(e) => e.stopPropagation()} className="inline-flex"><Checkbox aria-label={`Selecionar ${s.name}`} checked={sel.has(s.id)} onCheckedChange={() => toggle(s.id)} /></span>,
    },
    {
      k: 'nome', label: 'Fonte', sort: 'nome', className: 'max-w-0 w-full',
      render: (s) => (
        <div className={cx('min-w-0 py-0.5', (s.status === 'pausada' || s.status === 'arquivada') && 'opacity-60')}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-medium truncate">{s.name}</span>
            {s.verifiedAt ? <VerifiedBadge s={s} /> : <VerifiedBadge s={s} withLabel />}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <a href={s.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 truncate hover:text-primary-ink hover:underline">
              {domainOf(s.url)}<ExternalLink className="size-3 shrink-0" />
            </a>
            {s.language !== 'pt' && <span className="shrink-0 rounded border border-border px-1 text-[10px] font-medium uppercase">{s.language === 'multi' ? 'vários' : s.language}</span>}
          </div>
        </div>
      ),
    },
    {
      k: 'tipo', label: 'Tipo', sort: 'tipo', width: '118px',
      render: (s) => { const t = typeMeta(s.type); return <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap"><t.icon className="size-3.5 text-muted-foreground" />{t.short}</span>; },
    },
    {
      k: 'consulta', label: 'Consulta', sort: 'consulta', width: '128px',
      render: (s) => { const m = methodMeta(s.access.method); return <Tip content={m.hint}><span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground"><m.icon className="size-3.5" />{consultaLabel(s.access)}</span></Tip>; },
    },
    { k: 'alimenta', label: 'Alimenta', width: '120px', render: (s) => <FeedsCell s={s} refs={refs} /> },
    { k: 'trust', label: 'Confiança', sort: 'trust', desc: true, width: '84px', render: (s) => <Dots n={s.trust} title={`Confiança ${TRUST[s.trust].label.toLowerCase()}: ${TRUST[s.trust].hint}`} /> },
    { k: 'peso', label: 'Peso', sort: 'peso', desc: true, width: '60px', render: (s) => <Dots n={s.weight} title={`Peso ${WEIGHT[s.weight].toLowerCase()} na pesquisa (desempate da síntese)`} /> },
    {
      k: 'status', label: 'Status', sort: 'status', width: '158px',
      render: (s) => <StatusCell s={s} onSet={(st) => setStatus([s.id], st)} />,
    },
  ];

  return (
    <AppContent>
      <PageHeader
        title="Ideias"
        subtitle="Fontes onde a IA procura ideias e temas. Só as ativas entram nas pesquisas."
        actions={<Button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5"><Plus className="size-4" />Adicionar fonte</Button>}
      />
      <IdeasTabs className="-mt-2 mb-5" />

      {suggested.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
          <Inbox className="size-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-medium">{suggested.length === 1 ? '1 fonte sugerida' : `${suggested.length} fontes sugeridas`} esperando você.</span>{' '}
            <span className="text-muted-foreground">
              {suggestedOk.length} com link conferido{suggested.length - suggestedOk.length > 0 && <> · {suggested.length - suggestedOk.length} não conferidas: abra no navegador antes de aceitar</>}.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {f.status !== 'sugerida' && <Button variant="ghost" onClick={() => set({ status: 'sugerida' })}>Ver só as sugeridas</Button>}
            {suggestedOk.length > 0 && (
              <Button onClick={() => setStatus(suggestedOk.map((s) => s.id), 'ativa')} className="inline-flex items-center gap-1.5">
                <Check className="size-4" />Aceitar as {suggestedOk.length} conferidas
              </Button>
            )}
          </div>
        </div>
      )}

      <FilterBar
        className="mb-3"
        search={{ value: f.q, onChange: (v) => set({ q: v }), placeholder: 'Buscar fonte…' }}
        primary={<>
          <SelectField size="sm" value={f.tipo} onChange={(v) => set({ tipo: v })} options={typeOpts} aria-label="Tipo" className="w-[168px]" />
          <SelectField size="sm" value={f.tema} onChange={(v) => set({ tema: v })} options={temaOpts} aria-label="Tema" className="w-[190px]" />
          <SelectField size="sm" value={f.status} onChange={(v) => set({ status: v })} options={statusOpts} aria-label="Status" className="w-[168px]" />
        </>}
        secondary={[
          { label: 'Idioma', active: !!f.idioma, node: <SelectField size="sm" value={f.idioma} onChange={(v) => set({ idioma: v })} options={langOpts} aria-label="Idioma" className="w-[150px]" /> },
          { label: 'Consulta', active: !!f.consulta, node: <SelectField size="sm" value={f.consulta} onChange={(v) => set({ consulta: v })} options={methodOpts} aria-label="Consulta" className="w-[150px]" /> },
        ]}
        active={anyFilter}
        onClear={() => reset(['q', 'tipo', 'tema', 'status', 'idioma', 'consulta'])}
      />

      {sel.size > 0 && (
        <div className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary-soft px-3 text-sm">
          <span className="font-medium text-primary-ink">{sel.size === 1 ? '1 selecionada' : `${sel.size} selecionadas`}</span>
          <span className="mx-1 h-4 w-px bg-primary/20" />
          {can(['sugerida', 'pausada', 'arquivada']).length > 0 && <BulkBtn icon={Check} onClick={() => setStatus(can(['sugerida', 'pausada', 'arquivada']), 'ativa')}>{selRows.every((s) => s.status === 'sugerida') ? 'Aceitar' : 'Ativar'} {can(['sugerida', 'pausada', 'arquivada']).length}</BulkBtn>}
          {can(['sugerida', 'ativa', 'pausada']).length > 0 && <BulkBtn icon={X} onClick={() => setStatus(can(['sugerida', 'ativa', 'pausada']), 'arquivada')}>Recusar {can(['sugerida', 'ativa', 'pausada']).length}</BulkBtn>}
          {can(['ativa']).length > 0 && <BulkBtn icon={Pause} onClick={() => setStatus(can(['ativa']), 'pausada')}>Pausar {can(['ativa']).length}</BulkBtn>}
          <button type="button" onClick={() => setSel(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Limpar seleção</button>
        </div>
      )}

      <ErrorBox error={error} />
      {isLoading && <div className="h-96 rounded-xl bg-muted animate-pulse" />}
      {data && !data.length && (
        <Empty title="Nenhuma fonte ainda" hint="Cole o link de um periódico, órgão oficial ou veículo: o app sugere nome, tipo e como consultar."
          action={<Button onClick={() => setAdding(true)}>Adicionar a primeira fonte</Button>} />
      )}
      {data && data.length > 0 && !rows.length && <Empty title="Nenhuma fonte com esses filtros" action={<Button variant="ghost" onClick={() => reset(['q', 'tipo', 'tema', 'status', 'idioma', 'consulta'])}>Limpar filtros</Button>} />}
      {data && rows.length > 0 && (
        <DataTable fill rows={rows} cols={cols} rowKey={(s) => s.id} sort={sort}
          onSort={(k, dir) => set({ ordem: k, asc: dir === 1 ? '1' : '0' })}
          onRowClick={(s) => setOpen(s)}
          rowClass={(s) => (sel.has(s.id) ? 'bg-primary/5' : undefined)} />
      )}

      {open && <SourceDrawer key={open.id} slug={slug} source={all.find((s) => s.id === open.id) ?? open} refs={refs} onClose={() => setOpen(null)} onStatus={(st) => setStatus([open.id], st)} />}
      <AddSourceDialog slug={slug} open={adding} onClose={() => setAdding(false)} refs={refs} onOpenExisting={(id) => { const s = all.find((x) => x.id === id); setAdding(false); if (s) setOpen(s); }} />
    </AppContent>
  );
}

function BulkBtn({ icon: Icon, onClick, children }: { icon: typeof Check; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium hover:bg-muted">
      <Icon className="size-3.5" />{children}
    </button>
  );
}

/** status da linha: sugerida → Aceitar / Recusar; ativa ↔ pausada; recusada → Restaurar */
function StatusCell({ s, onSet }: { s: Source; onSet: (st: Source['status']) => void }) {
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  if (s.status === 'sugerida') return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={stop(() => onSet('ativa'))} title={s.verifiedAt ? 'Aceitar: passa a ser usada nas pesquisas' : 'Aceitar mesmo sem o link conferido'}
        className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400">
        <Check className="size-3.5 text-emerald-600" />Aceitar
      </button>
      <Tip content="Recusar (vai para Recusadas; dá para restaurar)">
        <button type="button" onClick={stop(() => onSet('arquivada'))} aria-label={`Recusar ${s.name}`}
          className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/40">
          <X className="size-3.5" />
        </button>
      </Tip>
    </div>
  );
  const m = statusMeta(s.status);
  const action = s.status === 'ativa' ? { icon: Pause, label: 'Pausar', to: 'pausada' as const }
    : s.status === 'pausada' ? { icon: Play, label: 'Ativar', to: 'ativa' as const }
      : { icon: RotateCcw, label: 'Restaurar', to: 'sugerida' as const };
  return (
    <div className="flex items-center gap-1.5">
      <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium', m.pill)}><span className={cx('size-1.5 rounded-full', m.dot)} />{m.label}</span>
      <Tip content={action.label}>
        <button type="button" onClick={stop(() => onSet(action.to))} aria-label={`${action.label} ${s.name}`}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100">
          <action.icon className="size-3.5" />
        </button>
      </Tip>
    </div>
  );
}
