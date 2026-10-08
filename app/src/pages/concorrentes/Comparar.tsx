// Comparar: os concorrentes lado a lado por área de marketing (?v=): Oferta e preço · Funcionalidades (matriz) ·
// Mensagem (hero, CTA, prova social, tom) · Reputação. Clique no cabeçalho ordena; no nome, abre a ficha.
import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { ModuleDataOf } from '../../../../schema/analysis';
import { AreaPage, SortTable, useMarket, type Col, type MarketRow } from '../../components/competitors/area';
import { money } from '../../components/competitors/Analysis';
import { Avatar, Chips } from '../../components/competitors/lib';
import { Badge, Empty, ErrorBox, cx } from '../../components/kit';

const VIEWS = { oferta: 'Oferta e preço', funcionalidades: 'Funcionalidades', mensagem: 'Mensagem', reputacao: 'Reputação' } as const;
type View = keyof typeof VIEWS;
type P = ModuleDataOf<'precos'>; type F = ModuleDataOf<'features'>; type Lp = ModuleDataOf<'landing'>; type Rp = ModuleDataOf<'reputacao'>;
const mod = <T,>(r: MarketRow, k: 'precos' | 'features' | 'landing' | 'reputacao') => r.res[k]?.data as T | undefined;

export default function Comparar() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('v') ?? '';
  const v = (raw in VIEWS ? raw : 'oferta') as View;
  const m = useMarket(slug);
  const rows = m.rows.filter((r) => r.c.data.kind === 'concorrente');
  return (
    <AreaPage>
      <div className="mb-4"><Chips value={v} onChange={(x) => setSp(x === 'oferta' ? {} : { v: x }, { replace: true })} options={Object.entries(VIEWS).map(([value, label]) => ({ value: value as View, label }))} /></div>
      <ErrorBox error={m.error} />
      {!m.isLoading && !rows.length && <Empty title="Sem concorrentes ativos" />}
      {v === 'oferta' && <Oferta slug={slug} rows={rows} />}
      {v === 'funcionalidades' && <Funcionalidades slug={slug} rows={rows} />}
      {v === 'mensagem' && <Mensagem slug={slug} rows={rows} />}
      {v === 'reputacao' && <Reputacao slug={slug} rows={rows} />}
    </AreaPage>
  );
}

const nameCol = (slug: string): Col<MarketRow> => ({
  k: 'name', label: 'Concorrente', v: (r) => r.c.data.name, className: 'min-w-48',
  render: (r) => (
    <Link to={`/p/${slug}/concorrentes/${r.c.data.id}`} className="flex items-center gap-2 font-medium hover:text-primary-ink">
      <Avatar name={r.c.data.name} size={22} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />{r.c.data.name}
    </Link>
  ),
});
const dash = <span className="text-muted-foreground">—</span>;

function Oferta({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const cols: Col<MarketRow>[] = [
    nameCol(slug),
    { k: 'price', label: 'A partir de', num: true, v: (r) => r.ov?.fromMonthly, render: (r) => (r.ov?.fromMonthly != null ? <b>{money(r.ov.fromMonthly, r.ov.currency)}</b> : r.ov?.publicPrice === false ? <span className="text-muted-foreground">oculto</span> : dash) },
    { k: 'top', label: 'Plano mais caro', num: true, v: (r) => Math.max(...(mod<P>(r, 'precos')?.plans.map((p) => p.monthly ?? 0) ?? [0])) || undefined, render: (r) => { const ps = mod<P>(r, 'precos')?.plans.filter((p) => p.monthly != null) ?? []; const t = ps.sort((a, b) => b.monthly! - a.monthly!)[0]; return t ? <span title={t.name}>{money(t.monthly!, mod<P>(r, 'precos')?.currency)}</span> : dash; } },
    { k: 'yearly', label: 'No anual', num: true, title: 'menor preço mensal no plano anual', v: (r) => Math.min(...(mod<P>(r, 'precos')?.plans.map((p) => p.yearlyMonthly ?? Infinity) ?? [Infinity])), render: (r) => { const y = Math.min(...(mod<P>(r, 'precos')?.plans.map((p) => p.yearlyMonthly ?? Infinity) ?? [Infinity])); return Number.isFinite(y) ? money(y, mod<P>(r, 'precos')?.currency) : dash; } },
    { k: 'model', label: 'Modelo', v: (r) => r.ov?.priceModel, render: (r) => (r.ov?.priceModel ? <Badge color={r.ov.priceModel === 'freemium' ? '#16a34a' : undefined}>{r.ov.priceModel}</Badge> : dash) },
    { k: 'plans', label: 'Planos', num: true, v: (r) => r.ov?.plans, render: (r) => r.ov?.plans ?? dash },
    { k: 'trial', label: 'Teste grátis', v: (r) => r.ov?.trial ?? undefined, render: (r) => <span className="block max-w-56 truncate" title={r.ov?.trial ?? ''}>{r.ov?.trial ?? '—'}</span> },
    { k: 'guar', label: 'Fidelidade / garantia', v: (r) => mod<P>(r, 'precos')?.guarantee ?? undefined, render: (r) => <span className="block max-w-48 truncate text-muted-foreground" title={mod<P>(r, 'precos')?.guarantee ?? ''}>{mod<P>(r, 'precos')?.guarantee ?? '—'}</span> },
  ];
  return <SortTable rows={rows} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'price', dir: 1 }} />;
}

/** matriz: grupo de funcionalidade × concorrente; célula = nº de itens (★ = diferencial), detalhe no tooltip */
function Funcionalidades({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const withF = rows.filter((r) => mod<F>(r, 'features'));
  const groups = useMemo(() => {
    const n = new Map<string, number>();
    for (const r of withF) for (const g of mod<F>(r, 'features')!.groups) n.set(g.name, (n.get(g.name) ?? 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1]).map(([g]) => g);
  }, [withF]);
  if (!withF.length) return <Empty title="Nenhuma análise de funcionalidades ainda" />;
  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      <table className="text-sm w-full">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground sticky left-0 bg-muted/40 min-w-44">Grupo</th>
            {withF.map((r) => (
              <th key={r.c.data.id} className="px-2 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                <Link to={`/p/${slug}/concorrentes/${r.c.data.id}?aba=produto`} className="hover:text-foreground">{r.c.data.name}</Link>
              </th>
            ))}
            <th className="px-3 py-2 text-xs font-medium text-muted-foreground text-right">Têm</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const has = withF.filter((r) => mod<F>(r, 'features')!.groups.some((x) => x.name === g)).length;
            return (
              <tr key={g} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-3 py-1.5 sticky left-0 bg-card font-medium">{g}</td>
                {withF.map((r) => {
                  const grp = mod<F>(r, 'features')!.groups.find((x) => x.name === g);
                  const stars = grp?.items.filter((i) => i.highlight).length ?? 0;
                  return (
                    <td key={r.c.data.id} className="px-2 py-1.5 text-center" title={grp ? grp.items.map((i) => `${i.highlight ? '★ ' : '· '}${i.name}`).join('\n') : 'não mostram'}>
                      {grp ? <span className={cx('inline-flex items-center justify-center min-w-7 h-6 rounded-md text-xs tabular-nums', stars ? 'bg-primary/15 text-primary-ink font-semibold' : 'bg-muted')}>{grp.items.length}{stars ? '★' : ''}</span> : <span className="text-muted-foreground/50">·</span>}
                    </td>
                  );
                })}
                <td className="px-3 py-1.5 text-right tabular-nums text-xs text-muted-foreground">{has}/{withF.length}</td>
              </tr>
            );
          })}
          <tr className="bg-muted/30">
            <td className="px-3 py-1.5 sticky left-0 bg-muted/30 text-xs text-muted-foreground">Total de itens</td>
            {withF.map((r) => <td key={r.c.data.id} className="px-2 py-1.5 text-center text-xs tabular-nums font-medium">{mod<F>(r, 'features')!.groups.reduce((n, g) => n + g.items.length, 0)}</td>)}
            <td />
          </tr>
        </tbody>
      </table>
      <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border">Número = itens no grupo · ★ = tem diferencial no grupo · passe o mouse para ver a lista. Grupos que poucos têm são brecha ou nicho.</div>
    </div>
  );
}

function Mensagem({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const cols: Col<MarketRow>[] = [
    nameCol(slug),
    { k: 'hero', label: 'Promessa (hero)', v: (r) => mod<Lp>(r, 'landing')?.hero.headline, className: 'min-w-72', render: (r) => { const l = mod<Lp>(r, 'landing'); return l ? <div><div className="font-medium leading-snug">{l.hero.headline}</div>{l.hero.subheadline && <div className="text-xs text-muted-foreground line-clamp-2">{l.hero.subheadline}</div>}</div> : dash; } },
    { k: 'cta', label: 'CTA principal', v: (r) => mod<Lp>(r, 'landing')?.hero.cta ?? undefined, render: (r) => { const c = mod<Lp>(r, 'landing')?.hero.cta; return c ? <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-ink whitespace-nowrap">{c}</span> : dash; } },
    { k: 'proof', label: 'Prova social', render: (r) => <span className="text-xs block max-w-64">{mod<Lp>(r, 'landing')?.socialProof.slice(0, 2).join(' · ') || '—'}</span> },
    { k: 'tone', label: 'Tom', v: (r) => mod<Lp>(r, 'landing')?.tone ?? undefined, render: (r) => <span className="text-xs text-muted-foreground block max-w-48">{mod<Lp>(r, 'landing')?.tone ?? '—'}</span> },
    { k: 'sec', label: 'Seções', num: true, v: (r) => r.ov?.sections, render: (r) => r.ov?.sections ?? dash },
  ];
  return <SortTable rows={rows} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'name', dir: 1 }} />;
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
  return <SortTable rows={rows} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'store', dir: -1 }} />;
}
