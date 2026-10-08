// Área Concorrentes: cabeçalho com as abas (cada uma com rota própria) e os dados de mercado juntos por concorrente
// (cadastro + resumo das coletas + visão da análise + resultados completos), para Panorama, Lista, Comparar e Redes.
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Clapperboard, Columns3, LayoutDashboard, List, Megaphone, Plus, RefreshCw, Share2, Target, type LucideIcon } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';
import { api, type AnalysisFull, type AnalysisOverview, type Competitor, type CompetitorSummary, type Doc, type Referencia } from '../../api';
import { useAnalysisAll, useAnalysisOverview, useCompetitors, useCompetitorsSummary, useReferencia } from '../../queries';
import { Button, cx } from '../kit';
import AddLinksModal from './AddLinksModal';
import { useFillHeight } from '../fill';
import { CONTENT_MAX } from '../AppContent';

export { FillBox, useFillHeight } from '../fill';

export const AREA_TABS = [
  { path: '', label: 'Panorama', icon: LayoutDashboard },
  { path: 'lista', label: 'Concorrentes', icon: List },
  { path: 'comparar', label: 'Comparar', icon: Columns3 },
  { path: 'brechas', label: 'Brechas', icon: Target },
  { path: 'conteudos', label: 'Conteúdos', icon: Clapperboard },
  { path: 'redes', label: 'Redes', icon: Share2 },
  { path: 'anuncios', label: 'Anúncios', icon: Megaphone },
  { path: 'coletas', label: 'Coletas', icon: RefreshCw },
] as const;

/** cabeçalho comum das abas da área; `actions` entra à direita ao lado de "+ Adicionar". A faixa vai de ponta a ponta, o conteúdo fica centralizado */
export function AreaHeader({ actions, sub }: { actions?: ReactNode; sub?: ReactNode }) {
  const { slug = '' } = useParams();
  const list = useCompetitors(slug);
  const [adding, setAdding] = useState(false);
  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className={cx('mx-auto w-full px-8 pt-5', CONTENT_MAX)}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Concorrentes</h1>
          {sub && <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">{sub}</span>}
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <Button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5"><Plus className="size-4" />Adicionar</Button>
          </div>
        </div>
        <nav className="mt-3 flex gap-0.5 -mb-px overflow-x-auto">
          {AREA_TABS.map((t) => (
            <NavLink key={t.path} end to={`/p/${slug}/concorrentes${t.path ? `/${t.path}` : ''}`}
              className={({ isActive }) => cx('inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 whitespace-nowrap', isActive ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              <t.icon className="size-4" strokeWidth={1.8} />{t.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <AddLinksModal slug={slug} open={adding} onClose={() => setAdding(false)} competitors={list.data ?? []} />
    </header>
  );
}

/** casca de uma aba: cabeçalho + conteúdo centralizado com o mesmo respiro (o fim da página é descontado pelo useFillHeight) */
export function AreaPage({ children, actions, sub }: { children: ReactNode; actions?: ReactNode; sub?: ReactNode }) {
  return <div><AreaHeader actions={actions} sub={sub} /><div className={cx('mx-auto w-full px-8 pt-5 pb-8', CONTENT_MAX)}>{children}</div></div>;
}

export interface MarketRow {
  c: Doc<Competitor>;
  sum?: CompetitorSummary;
  ov?: AnalysisOverview;
  res: AnalysisFull['results'];
  avatar: { local?: string; remote?: string | null };
  /** seguidores somados das redes com coleta; delta só quando todas têm coleta anterior */
  followers?: number;
  delta?: number;
  lastCollected?: string;
}

/** tudo que as abas da área precisam por concorrente; `all` inclui candidatos e arquivados */
export function useMarket(slug: string, { all = false } = {}) {
  const list = useCompetitors(slug);
  const summary = useCompetitorsSummary(slug);
  const overview = useAnalysisOverview(slug);
  const analysis = useAnalysisAll(slug);
  const rows = useMemo<MarketRow[]>(() => {
    const sum = new Map((summary.data ?? []).map((s) => [s.id, s]));
    const ov = new Map((overview.data ?? []).map((o) => [o.id, o]));
    const res = new Map((analysis.data ?? []).map((a) => [a.id, a.results]));
    return (list.data ?? []).filter((c) => all || c.data.status === 'ativo').map((c) => {
      const s = sum.get(c.data.id);
      const profs = s?.profiles ?? [];
      const av = profs.find((p) => p.latest?.profile.avatarLocal) ?? profs.find((p) => p.latest?.profile.avatar);
      const withF = profs.filter((p) => p.latest?.profile.followers != null);
      const followers = withF.length ? withF.reduce((n, p) => n + p.latest!.profile.followers!, 0) : undefined;
      const delta = withF.length && withF.every((p) => p.prevFollowers != null) ? followers! - withF.reduce((n, p) => n + p.prevFollowers!, 0) : undefined;
      return {
        c, sum: s, ov: ov.get(c.data.id), res: res.get(c.data.id) ?? {},
        avatar: { local: api.mediaUrl(slug, c.data.id, av?.latest?.profile.avatarLocal), remote: av?.latest?.profile.avatar },
        followers, delta, lastCollected: s?.lastCollected,
      };
    });
  }, [list.data, summary.data, overview.data, analysis.data, slug, all]);
  return { rows, isLoading: list.isLoading || summary.isLoading, error: list.error ?? summary.error ?? overview.error ?? analysis.error };
}

/** a própria empresa (intel/referencia.json) no formato de uma linha de concorrente, para as mesmas colunas */
export const REF_ID = '__referencia';
export function refRow(r: Referencia): MarketRow {
  const p = r.price;
  const c = { data: { id: REF_ID, name: r.name, kind: 'concorrente', status: 'ativo', favorite: false, tags: [], profiles: [], created: r.updated }, body: '', file: '' } as unknown as Doc<Competitor>;
  return {
    c, avatar: {}, followers: r.followers ?? undefined,
    ov: { id: REF_ID, fromMonthly: p.fromMonthly ?? undefined, currency: p.currency, publicPrice: p.fromMonthly != null, priceModel: p.model, trial: p.trial ?? undefined, plans: p.plans, features: r.features.reduce((n, g) => n + g.items.length, 0), updated: {}, hasNotes: false } as AnalysisOverview,
    res: {
      precos: { data: { fromMonthly: p.fromMonthly, currency: p.currency, publicPrice: p.fromMonthly != null, model: p.model, trial: p.trial, guarantee: p.guarantee, notes: p.note, extras: [], plans: [{ name: 'Único', monthly: p.fromMonthly, highlights: [] }] } },
      features: { data: { groups: r.features.map((g) => ({ name: g.name, items: g.items.map((i) => ({ name: i.name, highlight: i.highlight })) })), differentials: [], missing: [] } },
      landing: { data: { hero: { headline: r.message.headline, subheadline: r.message.subheadline, cta: r.message.cta }, sections: [], ctas: r.message.cta ? [r.message.cta] : [], socialProof: [], interesting: [], tone: r.message.tone, url: '' } },
    } as unknown as AnalysisFull['results'],
  };
}
export function useRefRow(slug: string) {
  const q = useReferencia(slug);
  return useMemo(() => (q.data ? refRow(q.data) : null), [q.data]);
}

/** tabela densa com ordenação por coluna (clique no cabeçalho); `v` dá o valor de ordenação */
export interface Col<T> { k: string; label: ReactNode; title?: string; num?: boolean; v?: (r: T) => string | number | undefined; render: (r: T) => ReactNode; className?: string }
/**
 * `pin` = linhas fixas no topo, fora da ordenação (ex.: a própria empresa como referência).
 * `fill` = ocupa o resto da tela (useFillHeight), com o cabeçalho fixo e a rolagem dentro.
 */
export function SortTable<T>({ rows, cols, rowKey, initial, empty, pin = [], fill }: { rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; initial?: { k: string; dir: 1 | -1 }; empty?: ReactNode; pin?: T[]; fill?: boolean }) {
  const [sort, setSort] = useState(initial ?? { k: cols[0].k, dir: 1 as 1 | -1 });
  const [boxRef, boxH] = useFillHeight();
  const col = cols.find((c) => c.k === sort.k);
  const sorted = !col?.v ? rows : [...rows].sort((a, b) => {
    const va = col.v!(a), vb = col.v!(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')) * sort.dir;
  });
  if (!rows.length && empty) return <>{empty}</>;
  return (
    <div ref={fill ? boxRef : undefined} style={fill ? { height: boxH } : undefined} className={cx('bg-card border border-border rounded-xl', fill ? 'overflow-auto' : 'overflow-x-auto')}>
      <table className={cx('w-full text-sm', fill && 'h-full')}>
        <thead className="border-b border-border bg-muted/40">
          <tr>{cols.map((c) => (
            <th key={c.k} title={c.title} onClick={() => c.v && setSort((s) => ({ k: c.k, dir: s.k === c.k ? (s.dir === 1 ? -1 : 1) : c.num ? -1 : 1 }))}
              className={cx('px-3 py-2 font-medium text-xs text-muted-foreground whitespace-nowrap select-none', c.num ? 'text-right' : 'text-left', c.v && 'cursor-pointer hover:text-foreground',
                fill && 'sticky top-0 z-10 bg-muted shadow-[inset_0_-1px_0_var(--border)]')}>
              {c.label}{sort.k === c.k ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {[...pin, ...sorted].map((r, i) => (
            <tr key={rowKey(r)} className={cx('border-b border-border last:border-0', i < pin.length ? 'bg-primary/5 border-b-primary/30' : 'hover:bg-muted/30')}>
              {cols.map((c) => <td key={c.k} className={cx('px-3 py-2 align-middle', c.num && 'text-right tabular-nums whitespace-nowrap', c.className)}>{c.render(r)}</td>)}
            </tr>
          ))}
          {/* preenche a sobra de altura sem esticar as linhas de dados */}
          {fill && <tr aria-hidden className="h-full"><td colSpan={cols.length} className="p-0" /></tr>}
        </tbody>
      </table>
    </div>
  );
}

/**
 * faixa de KPIs: grade de colunas iguais (mín. 160 px) com ícone, rótulo, valor e comparação.
 * Quando não cabe numa linha, reparte por igual (7 itens viram 4+3, nunca 6+1): nenhum card fica sozinho embaixo.
 */
export interface Stat { label: string; value: ReactNode; sub?: ReactNode; title?: string; icon?: LucideIcon }
export function StatStrip({ items }: { items: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(items.length);
  const n = items.length;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const fits = Math.max(1, Math.floor((el.clientWidth + 8) / (160 + 8)));
      setCols(n <= fits ? n : Math.ceil(n / Math.ceil(n / fits)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);
  return (
    <div ref={ref} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, cols)}, minmax(0, 1fr))` }}>
      {items.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-lg px-3.5 py-2.5 min-w-0" title={s.title}>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
            {s.icon && <s.icon className="size-3.5 shrink-0" strokeWidth={1.8} />}<span className="truncate">{s.label}</span>
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums leading-tight truncate">{s.value}</div>
          <div className="text-xs text-muted-foreground truncate min-h-4">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/** Δ com seta e cor */
export const Delta = ({ n, fmt }: { n?: number; fmt: (n: number) => string }) =>
  n ? <span className={cx('text-xs tabular-nums', n > 0 ? 'text-success' : 'text-destructive')}>{n > 0 ? '▲' : '▼'}{fmt(Math.abs(n))}</span> : null;
