// Área Concorrentes: cabeçalho com as abas (cada uma com rota própria) e os dados de mercado juntos por concorrente
// (cadastro + resumo das coletas + visão da análise + resultados completos), para Panorama, Lista, Comparar e Redes.
import { useMemo, useState, type ReactNode } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { api, type AnalysisFull, type AnalysisOverview, type Competitor, type CompetitorSummary, type Doc } from '../../api';
import { useAnalysisAll, useAnalysisOverview, useCompetitors, useCompetitorsSummary } from '../../queries';
import { Button, cx } from '../kit';
import AddLinksModal from './AddLinksModal';

export const AREA_TABS = [
  { path: '', label: 'Panorama' },
  { path: 'lista', label: 'Concorrentes' },
  { path: 'comparar', label: 'Comparar' },
  { path: 'conteudos', label: 'Conteúdos' },
  { path: 'redes', label: 'Redes' },
  { path: 'anuncios', label: 'Anúncios' },
  { path: 'coletas', label: 'Coletas' },
] as const;

/** cabeçalho comum das abas da área; `actions` entra à direita ao lado de "+ Adicionar" */
export function AreaHeader({ actions, sub }: { actions?: ReactNode; sub?: ReactNode }) {
  const { slug = '' } = useParams();
  const list = useCompetitors(slug);
  const [adding, setAdding] = useState(false);
  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-8 pt-5">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Concorrentes</h1>
        {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
        <div className="ml-auto flex items-center gap-2">
          {actions}
          <Button onClick={() => setAdding(true)}>+ Adicionar</Button>
        </div>
      </div>
      <nav className="mt-3 flex gap-0.5 -mb-px overflow-x-auto">
        {AREA_TABS.map((t) => (
          <NavLink key={t.path} end to={`/p/${slug}/concorrentes${t.path ? `/${t.path}` : ''}`}
            className={({ isActive }) => cx('px-3 py-2 text-sm border-b-2 whitespace-nowrap', isActive ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <AddLinksModal slug={slug} open={adding} onClose={() => setAdding(false)} competitors={list.data ?? []} />
    </header>
  );
}

/** casca de uma aba: cabeçalho + conteúdo com o mesmo respiro */
export function AreaPage({ children, actions, sub }: { children: ReactNode; actions?: ReactNode; sub?: ReactNode }) {
  return <div className="max-w-[1400px] pb-16"><AreaHeader actions={actions} sub={sub} /><div className="px-8 pt-5">{children}</div></div>;
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

/** tabela densa com ordenação por coluna (clique no cabeçalho); `v` dá o valor de ordenação */
export interface Col<T> { k: string; label: ReactNode; title?: string; num?: boolean; v?: (r: T) => string | number | undefined; render: (r: T) => ReactNode; className?: string }
export function SortTable<T>({ rows, cols, rowKey, initial, empty }: { rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; initial?: { k: string; dir: 1 | -1 }; empty?: ReactNode }) {
  const [sort, setSort] = useState(initial ?? { k: cols[0].k, dir: 1 as 1 | -1 });
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
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>{cols.map((c) => (
            <th key={c.k} title={c.title} onClick={() => c.v && setSort((s) => ({ k: c.k, dir: s.k === c.k ? (s.dir === 1 ? -1 : 1) : c.num ? -1 : 1 }))}
              className={cx('px-3 py-2 font-medium text-xs text-muted-foreground whitespace-nowrap select-none', c.num ? 'text-right' : 'text-left', c.v && 'cursor-pointer hover:text-foreground')}>
              {c.label}{sort.k === c.k ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={rowKey(r)} className="border-b border-border last:border-0 hover:bg-muted/30">
              {cols.map((c) => <td key={c.k} className={cx('px-3 py-2 align-middle', c.num && 'text-right tabular-nums whitespace-nowrap', c.className)}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** faixa de números no topo das abas (substitui os cards grandes) */
export function StatStrip({ items }: { items: { label: string; value: ReactNode; sub?: ReactNode; title?: string }[] }) {
  return (
    <div className="flex flex-wrap items-stretch bg-card border border-border rounded-lg divide-x divide-border">
      {items.map((s) => (
        <div key={s.label} className="px-4 py-2 min-w-0" title={s.title}>
          <div className="text-[11px] text-muted-foreground">{s.label}</div>
          <div className="flex items-baseline gap-1.5"><span className="text-lg font-semibold tabular-nums">{s.value}</span>{s.sub && <span className="text-xs text-muted-foreground truncate">{s.sub}</span>}</div>
        </div>
      ))}
    </div>
  );
}

/** Δ com seta e cor */
export const Delta = ({ n, fmt }: { n?: number; fmt: (n: number) => string }) =>
  n ? <span className={cx('text-xs tabular-nums', n > 0 ? 'text-success' : 'text-destructive')}>{n > 0 ? '▲' : '▼'}{fmt(Math.abs(n))}</span> : null;
