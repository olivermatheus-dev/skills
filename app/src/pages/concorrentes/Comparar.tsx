// Comparar: os concorrentes lado a lado por área de marketing (?v=): Preços (?v=oferta) · Funcionalidades (matriz features × concorrentes, intel/matriz.json) ·
// Posicionamento (?v=posicionamento, antes mensagem: ver comparar/Posicionamento.tsx) · Reputação. Clique no cabeçalho ordena; no nome, abre a ficha.
import { Grid3x3, PanelsTopLeft, Star, Tag } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { ModuleDataOf } from '../../../../schema/analysis';
import { AreaPage, REF_ID, SortTable, useMarket, useRefRow, type Col, type MarketRow } from '../../components/competitors/area';
import { money } from '../../components/competitors/Analysis';
import { Avatar, Chips } from '../../components/competitors/lib';
import MatrizFuncionalidades from './MatrizFuncionalidades';
import Posicionamento from './comparar/Posicionamento';
import { Badge, Empty, ErrorBox, cx } from '../../components/kit';

const VIEWS = {
  oferta: { label: 'Preços', icon: Tag }, funcionalidades: { label: 'Funcionalidades', icon: Grid3x3 },
  posicionamento: { label: 'Posicionamento', icon: PanelsTopLeft }, reputacao: { label: 'Reputação', icon: Star },
} as const;
/** links antigos: ?v=mensagem abre Posicionamento */
const ALIAS: Record<string, string> = { mensagem: 'posicionamento' };
type View = keyof typeof VIEWS;
type P = ModuleDataOf<'precos'>; type Lp = ModuleDataOf<'landing'>; type Rp = ModuleDataOf<'reputacao'>;
const mod = <T,>(r: MarketRow, k: 'precos' | 'features' | 'landing' | 'reputacao') => r.res[k]?.data as T | undefined;

export default function Comparar() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const raw0 = sp.get('v') ?? '';
  const raw = ALIAS[raw0] ?? raw0;
  const v = (Object.hasOwn(VIEWS, raw) ? raw : 'oferta') as View;
  const m = useMarket(slug);
  const rows = m.rows.filter((r) => r.c.data.kind === 'concorrente');
  const ref = useRefRow(slug);
  const pin = ref ? [ref] : [];
  return (
    <AreaPage>
      <div className="mb-4"><Chips value={v} onChange={(x) => setSp(x === 'oferta' ? {} : { v: x }, { replace: true })} options={Object.entries(VIEWS).map(([value, x]) => ({ value: value as View, label: <span className="inline-flex items-center gap-1.5"><x.icon className="size-3.5" strokeWidth={1.8} />{x.label}</span> }))} /></div>
      <ErrorBox error={m.error} />
      {!m.isLoading && !rows.length && <Empty title="Sem concorrentes ativos" />}
      {v === 'oferta' && <Oferta slug={slug} rows={rows} pin={pin} />}
      {v === 'funcionalidades' && <MatrizFuncionalidades slug={slug} rows={rows} />}
      {v === 'posicionamento' && <Posicionamento slug={slug} rows={rows} refRow={ref} />}
      {ref && v !== 'reputacao' && <p className="mt-2 text-[11px] text-muted-foreground">{ref.c.data.name} (você) vem de <Link to={`/p/${slug}/contexto`} className="hover:text-primary-ink">Contexto</Link> (BUSINESS, PRODUTO, COPY) via <code>intel/referencia.json</code>: preço de referência da copy, só funcionalidades prontas.</p>}
      {v === 'reputacao' && <Reputacao slug={slug} rows={rows} />}
    </AreaPage>
  );
}

const nameCol = (slug: string): Col<MarketRow> => ({
  k: 'name', label: 'Concorrente', v: (r) => r.c.data.name, className: 'min-w-48',
  render: (r) => r.c.data.id === REF_ID ? (
    <Link to={`/p/${slug}/contexto`} className="flex items-center gap-2 font-semibold text-primary-ink">
      <Avatar name={r.c.data.name} size={22} className="!ring-0" />{r.c.data.name}<span className="text-[10px] font-medium px-1.5 rounded-full bg-primary text-primary-foreground">você</span>
    </Link>
  ) : (
    <Link to={`/p/${slug}/concorrentes/${r.c.data.id}`} className="flex items-center gap-2 font-medium hover:text-primary-ink">
      <Avatar name={r.c.data.name} size={22} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />{r.c.data.name}
    </Link>
  ),
});
const dash = <span className="text-muted-foreground">—</span>;

function Oferta({ slug, rows, pin }: { slug: string; rows: MarketRow[]; pin: MarketRow[] }) {
  const cols: Col<MarketRow>[] = [
    nameCol(slug),
    { k: 'price', label: 'A partir de', num: true, v: (r) => r.ov?.fromMonthly, render: (r) => (r.ov?.fromMonthly != null ? <b title={mod<P>(r, 'precos')?.notes ?? undefined}>{money(r.ov.fromMonthly, r.ov.currency)}</b> : r.ov?.publicPrice === false ? <span className="text-muted-foreground">oculto</span> : dash) },
    { k: 'top', label: 'Plano mais caro', num: true, v: (r) => Math.max(...(mod<P>(r, 'precos')?.plans.map((p) => p.monthly ?? 0) ?? [0])) || undefined, render: (r) => { const ps = mod<P>(r, 'precos')?.plans.filter((p) => p.monthly != null) ?? []; const t = ps.sort((a, b) => b.monthly! - a.monthly!)[0]; return t ? <span title={t.name}>{money(t.monthly!, mod<P>(r, 'precos')?.currency)}</span> : dash; } },
    { k: 'yearly', label: 'No anual', num: true, title: 'menor preço mensal no plano anual', v: (r) => Math.min(...(mod<P>(r, 'precos')?.plans.map((p) => p.yearlyMonthly ?? Infinity) ?? [Infinity])), render: (r) => { const y = Math.min(...(mod<P>(r, 'precos')?.plans.map((p) => p.yearlyMonthly ?? Infinity) ?? [Infinity])); return Number.isFinite(y) ? money(y, mod<P>(r, 'precos')?.currency) : dash; } },
    { k: 'model', label: 'Modelo', v: (r) => r.ov?.priceModel, render: (r) => (r.ov?.priceModel ? <Badge color={r.ov.priceModel === 'freemium' ? '#16a34a' : undefined}>{r.ov.priceModel}</Badge> : dash) },
    { k: 'plans', label: 'Planos', num: true, v: (r) => r.ov?.plans, render: (r) => r.ov?.plans ?? dash },
    { k: 'trial', label: 'Teste grátis', v: (r) => r.ov?.trial ?? undefined, render: (r) => <span className="block max-w-56 truncate" title={r.ov?.trial ?? ''}>{r.ov?.trial ?? '—'}</span> },
    { k: 'guar', label: 'Fidelidade / garantia', v: (r) => mod<P>(r, 'precos')?.guarantee ?? undefined, render: (r) => <span className="block max-w-48 truncate text-muted-foreground" title={mod<P>(r, 'precos')?.guarantee ?? ''}>{mod<P>(r, 'precos')?.guarantee ?? '—'}</span> },
  ];
  return <SortTable fill rows={rows} pin={pin} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'price', dir: 1 }} />;
}

function Reputacao({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const cols: Col<MarketRow>[] = [
    nameCol(slug),
    { k: 'ra', label: 'Reclame Aqui', num: true, v: (r) => r.ov?.raScore, render: (r) => { const ra = mod<Rp>(r, 'reputacao')?.reclameAqui; return ra?.found ? <span><b>{ra.score?.toLocaleString('pt-BR') ?? '—'}</b>{ra.status && <span className="text-xs text-muted-foreground"> {ra.status}</span>}</span> : <span className="text-muted-foreground text-xs">{ra ? 'sem página' : '—'}</span>; } },
    { k: 'cmp', label: 'Reclamações', num: true, v: (r) => mod<Rp>(r, 'reputacao')?.reclameAqui?.complaints ?? undefined, render: (r) => mod<Rp>(r, 'reputacao')?.reclameAqui?.complaints ?? dash },
    { k: 'solved', label: 'Resolvidas', num: true, v: (r) => mod<Rp>(r, 'reputacao')?.reclameAqui?.solvedRate ?? undefined, render: (r) => { const s = mod<Rp>(r, 'reputacao')?.reclameAqui?.solvedRate; return s != null ? `${s}%` : dash; } },
    { k: 'store', label: 'Nota nas lojas', num: true, v: (r) => r.ov?.storeRating, render: (r) => { const st = mod<Rp>(r, 'reputacao')?.stores.filter((s) => s.rating != null) ?? []; return st.length ? <span title={st.map((s) => `${s.store}: ${s.rating} (${s.reviews ?? '?'} avaliações)`).join('\n')}>★ {st.map((s) => s.rating).join(' / ')}</span> : dash; } },
    { k: 'top', label: 'Reclamação recorrente', render: (r) => <span className="text-xs block max-w-64 truncate" title={mod<Rp>(r, 'reputacao')?.reclameAqui?.topComplaints.join('\n')}>{mod<Rp>(r, 'reputacao')?.reclameAqui?.topComplaints[0] ?? '—'}</span> },
    { k: 'ment', label: 'Menções', num: true, v: (r) => mod<Rp>(r, 'reputacao')?.mentions.length, render: (r) => mod<Rp>(r, 'reputacao')?.mentions.length || dash },
  ];
  return <SortTable fill rows={rows} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'store', dir: -1 }} />;
}
