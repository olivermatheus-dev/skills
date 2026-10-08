// Concorrentes e referências: cards (resumo, onde atua, preço, seguidores por plataforma) ou tabela comparativa;
// filtros (tipo, onde atua, plataforma, tag), candidatos achados pela IA (aceitar → análise completa) e "Puxar todos".
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type AnalysisOverview, type CollectResult, type Competitor, type CompetitorSummary, type Doc } from '../api';
import { MARKET, money } from '../components/competitors/Analysis';
import { FULL_ANALYSIS } from '../../../schema/analysis';
import { toast } from '../components/toast';
import { Badge, Button, Empty, ErrorBox, Input, PageHeader, Select, cx, fmtNum } from '../components/kit';
import AddLinksModal, { ResultLine } from '../components/competitors/AddLinksModal';
import { useCompetitorActions } from '../components/competitors/useCompetitorActions';
import { prefetchCompetitor, qk, useAnalysisOverview, useCompetitors, useCompetitorsSummary } from '../queries';
import { Avatar, Chips, Img, KINDS, KIND_COLOR, PlatformIcon, Spinner, Star, fmtDelta, keyFor, platformLabel, timeAgo } from '../components/competitors/lib';

type KindFilter = 'todos' | Competitor['kind'];

export default function Competitors() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const list = useCompetitors(slug);
  const summary = useCompetitorsSummary(slug);
  const actions = useCompetitorActions(slug);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<KindFilter>('todos');
  const [platform, setPlatform] = useState('');
  const [tag, setTag] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [stage, setStage] = useState<Competitor['status']>('ativo');
  const [market, setMarket] = useState('');
  const [mode, setMode] = useState<'cards' | 'tabela'>(() => { try { return (localStorage.getItem('hub:comp-mode') as 'cards' | 'tabela') ?? 'cards'; } catch { return 'cards'; } });
  const setModeP = (m: 'cards' | 'tabela') => { setMode(m); try { localStorage.setItem('hub:comp-mode', m); } catch { /* sem storage */ } };
  const overview = useAnalysisOverview(slug);
  const ov = useMemo(() => new Map((overview.data ?? []).map((o) => [o.id, o])), [overview.data]);
  const [pulling, setPulling] = useState<{ i: number; n: number; name: string } | null>(null);
  const [pullLog, setPullLog] = useState<{ id: string; name: string; results: CollectResult[] }[] | null>(null);
  const [pullingOne, setPullingOne] = useState<string | null>(null);

  const sum = useMemo(() => new Map((summary.data ?? []).map((s) => [s.id, s])), [summary.data]);
  const all = list.data ?? [];
  const allTags = [...new Set(all.flatMap((c) => c.data.tags))].sort();
  const allPlatforms = [...new Set(all.flatMap((c) => c.data.profiles.map((p) => p.platform)))];
  const counts = (k: KindFilter) => all.filter((c) => c.data.status === stage && (k === 'todos' || c.data.kind === k)).length;
  const nStage = (st: Competitor['status']) => all.filter((c) => c.data.status === st).length;
  const queued = (overview.data ?? []).filter((o) => o.request).length;

  const shown = all.filter((c) => {
    const d = c.data;
    if (d.status !== stage) return false;
    if (market && marketOf(c, ov.get(d.id)) !== market) return false;
    if (kind !== 'todos' && d.kind !== kind) return false;
    if (platform && !d.profiles.some((p) => p.platform === platform)) return false;
    if (tag && !d.tags.includes(tag)) return false;
    if (favOnly && !d.favorite) return false;
    if (q && !`${d.name} ${d.profiles.map((p) => p.handle ?? p.url).join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => Number(b.data.favorite) - Number(a.data.favorite) || a.data.name.localeCompare(b.data.name, 'pt-BR'));


  const refresh = (id?: string) => {
    void qc.invalidateQueries({ queryKey: qk.competitorsSummary(slug) });
    if (id) void qc.invalidateQueries({ queryKey: qk.competitor(slug, id) });
  };

  async function pull(cs: Doc<Competitor>[]) {
    const log: { id: string; name: string; results: CollectResult[] }[] = [];
    setPullLog(null);
    for (const [i, c] of cs.entries()) {
      setPulling({ i: i + 1, n: cs.length, name: c.data.name });
      try { log.push({ id: c.data.id, name: c.data.name, results: await api.collectResults(slug, c.data.id) }); }
      catch (e) { log.push({ id: c.data.id, name: c.data.name, results: [{ key: '-', platform: '-', url: '', ok: false, items: 0, errors: [String((e as Error).message)], warnings: [] }] }); }
      refresh(c.data.id);
    }
    setPulling(null);
    setPullLog(log);
  }
  async function pullOne(c: Doc<Competitor>) {
    setPullingOne(c.data.id);
    try { const results = await api.collectResults(slug, c.data.id); setPullLog([{ id: c.data.id, name: c.data.name, results }]); }
    catch (e) { setPullLog([{ id: c.data.id, name: c.data.name, results: [{ key: '-', platform: '-', url: '', ok: false, items: 0, errors: [String((e as Error).message)], warnings: [] }] }]); }
    finally { setPullingOne(null); refresh(c.data.id); }
  }

  const active = all.filter((c) => c.data.status === 'ativo');
  async function accept(c: Doc<Competitor>) {
    try {
      await actions.save(c.data.id, { ...c.data, status: 'ativo' }, c.body, { okMessage: false });
      await api.requestAnalysis(slug, c.data.id, { modules: FULL_ANALYSIS });
      toast.ok(`${c.data.name} aceito · análise completa na fila da IA`);
    } catch (e) { toast.error(e, 'Não foi possível aceitar'); }
    void qc.invalidateQueries({ queryKey: qk.analysisOverview(slug) });
  }
  const pullTargets = shown.filter((c) => c.data.status === 'ativo' && c.data.profiles.length);

  return (
    <div className="p-8 max-w-[1400px]">
      <PageHeader
        title="Concorrentes e referências"
        subtitle={list.data ? `${active.length} monitorado(s) · cada “Puxar” guarda uma coleta nova, o histórico nunca é apagado` : undefined}
        actions={<>
          <Button variant="ghost" disabled={!!pulling || !pullTargets.length} onClick={() => pull(pullTargets)} title="Puxa um por vez os concorrentes visíveis">
            {pulling ? <><Spinner /> {pulling.i}/{pulling.n}</> : `↻ Puxar todos${pullTargets.length !== active.length ? ` (${pullTargets.length})` : ''}`}
          </Button>
          {queued > 0 && <span className="self-center text-xs px-2 py-1 rounded-md bg-violet-50 text-violet-700 border border-violet-200" title="Diga ao Claude: roda a fila de concorrentes">⏳ {queued} na fila da IA</span>}
          <Button onClick={() => setAdding(true)}>+ Adicionar</Button>
        </>}
      />

      {pulling && (
        <div className="mb-5 bg-card border border-border rounded-xl p-3">
          <div className="flex justify-between text-sm mb-2"><span>Puxando <b>{pulling.name}</b>…</span><span className="text-muted-foreground tabular-nums">{pulling.i} de {pulling.n}</span></div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${((pulling.i - 0.5) / pulling.n) * 100}%` }} /></div>
        </div>
      )}
      {pullLog && <PullLog log={pullLog} onClose={() => setPullLog(null)} slug={slug} />}

      {/* filtros */}
      {all.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <Input placeholder="Buscar nome ou @" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
          <Chips value={kind} onChange={setKind} options={[{ value: 'todos', label: 'Todos', count: counts('todos') }, ...Object.entries(KINDS).map(([k, v]) => ({ value: k as KindFilter, label: v, count: counts(k as KindFilter) }))]} />
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">Todas as plataformas</option>
            {allPlatforms.map((p) => <option key={p} value={p}>{platformLabel(p)}</option>)}
          </Select>
          {allTags.length > 0 && (
            <Select value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">Todas as tags</option>
              {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
            </Select>
          )}
          <button onClick={() => setFavOnly(!favOnly)} className={cx('px-2.5 py-1.5 rounded-md text-sm border', favOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-border text-muted-foreground hover:text-foreground')}>★ Favoritos</button>
          <Select value={market} onChange={(e) => setMarket(e.target.value)} aria-label="Onde atua">
            <option value="">Brasil e exterior</option>
            {Object.entries(MARKET).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Chips value={stage} onChange={setStage} options={[
              { value: 'ativo', label: 'Ativos', count: nStage('ativo') },
              { value: 'candidato', label: 'Candidatos', count: nStage('candidato') },
              { value: 'arquivado', label: 'Arquivados', count: nStage('arquivado') },
            ]} />
            <Chips value={mode} onChange={setModeP} options={[{ value: 'cards', label: '▦ Cards' }, { value: 'tabela', label: '☰ Comparar' }]} />
          </div>
        </div>
      )}

      <ErrorBox error={list.error ?? summary.error} />
      {list.isLoading && <SkeletonGrid />}
      {list.data && all.length === 0 && (
        <Empty title="Nenhum concorrente ainda" hint="Cole os links de perfis (YouTube, Instagram, TikTok, site) de concorrentes, criadores e páginas de referência."
          action={<Button onClick={() => setAdding(true)}>+ Adicionar o primeiro</Button>} />
      )}
      {list.data && all.length > 0 && shown.length === 0 && <Empty title="Nada com esses filtros" hint="Limpe a busca ou troque os filtros." />}

      {stage === 'candidato' && shown.length > 0 && <div className="mb-4 text-sm text-muted-foreground">Achados pela IA (radar). <b>Aceitar</b> = vira ativo e entra na fila da análise completa (feita 1x). <b>Recusar</b> = arquiva.</div>}
      {mode === 'tabela' && shown.length > 0 && <CompareTable slug={slug} rows={shown} ov={ov} />}
      {mode === 'cards' && <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {shown.map((c) => (
          <CompetitorCard key={c.data.id} slug={slug} c={c} s={sum.get(c.data.id)} o={ov.get(c.data.id)} loadingSummary={summary.isLoading}
            onAccept={() => accept(c)} onReject={() => { void actions.save(c.data.id, { ...c.data, status: 'arquivado' }, c.body, { okMessage: 'Candidato recusado (arquivado)' }); }}
            onFav={() => actions.toggleFavorite(c)} onWarm={() => prefetchCompetitor(qc, slug, c.data.id)} onPull={() => pullOne(c)} pulling={pullingOne === c.data.id || pulling?.name === c.data.name} />
        ))}
      </div>}

      <AddLinksModal slug={slug} open={adding} onClose={() => setAdding(false)} competitors={all} />
    </div>
  );
}

function CompetitorCard({ slug, c, s, o, onFav, onWarm, onPull, pulling, loadingSummary, onAccept, onReject }: {
  slug: string; c: Doc<Competitor>; s?: CompetitorSummary; o?: AnalysisOverview; onFav: () => void; onWarm: () => void; onPull: () => void; pulling: boolean; loadingSummary: boolean;
  onAccept: () => void; onReject: () => void;
}) {
  const mkId = marketOf(c, o);
  const mk = MARKET[mkId];
  const d = c.data;
  const profs = s?.profiles ?? [];
  const withAvatar = profs.find((p) => p.latest?.profile.avatarLocal) ?? profs.find((p) => p.latest?.profile.avatar);
  const withBanner = profs.find((p) => p.latest?.profile.bannerLocal) ?? profs.find((p) => p.latest?.profile.banner);
  const items = profs.reduce((n, p) => n + (p.latest?.items ?? 0), 0);
  const hadErrors = profs.some((p) => p.latest?.errors.length);
  return (
    <Link to={`/p/${slug}/concorrentes/${d.id}`} onMouseEnter={onWarm} onFocus={onWarm} onPointerDown={onWarm} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition flex flex-col">
      <div className="h-16 relative bg-gradient-to-r from-primary/15 via-primary-soft to-muted">
        {withBanner && <Img local={api.mediaUrl(slug, d.id, withBanner.latest?.profile.bannerLocal)} remote={withBanner.latest?.profile.banner} className="absolute inset-0 w-full h-full object-cover" fallback={<span />} />}
        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur rounded-full w-7 h-7 grid place-items-center shadow-sm"><Star on={d.favorite} onClick={onFav} size="text-base" /></div>
      </div>
      <div className="relative px-4 pb-4 -mt-6 flex-1 flex flex-col">
        <div className="flex items-end gap-3">
          <Avatar name={d.name} size={52} local={api.mediaUrl(slug, d.id, withAvatar?.latest?.profile.avatarLocal)} remote={withAvatar?.latest?.profile.avatar} />
          <div className="min-w-0 pb-0.5 flex-1">
            <div className="font-semibold truncate group-hover:text-primary-ink">{d.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <Badge color={KIND_COLOR[d.kind]}>{KINDS[d.kind]}</Badge>
          {mkId !== 'desconhecido' && <Badge color={mk.color}>{mk.label}</Badge>}
          {o?.fromMonthly != null && <Badge color="#0f766e">a partir de {money(o.fromMonthly, o.currency)}</Badge>}
          {o?.publicPrice === false && <Badge>preço oculto</Badge>}
          {o?.request && <Badge color="#7c3aed">⏳ fila</Badge>}
          {d.tags.map((t) => <span key={t} className="text-xs text-muted-foreground">#{t}</span>)}
        </div>
        {o?.oneLiner && <p className="mt-2 text-[13px] leading-snug text-foreground/85 line-clamp-2">{o.oneLiner}</p>}
        {d.status === 'candidato' && (
          <div className="mt-3 flex gap-2">
            <Button className="!py-1 text-xs flex-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAccept(); }}>✓ Aceitar</Button>
            <Button variant="ghost" className="!py-1 text-xs" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReject(); }}>Recusar</Button>
          </div>
        )}

        <div className="mt-3 space-y-1.5 flex-1">
          {d.profiles.length === 0 && <div className="text-sm text-muted-foreground">Sem perfis. Abra para adicionar links.</div>}
          {d.profiles.map((p) => {
            const ps = profs.find((x) => x.key === keyFor(p));
            const f = ps?.latest?.profile.followers;
            const delta = f != null && ps?.prevFollowers != null ? f - ps.prevFollowers : undefined;
            const handle = p.handle ? (p.platform === 'site' ? p.handle : `@${p.handle}`) : p.externalId ?? p.url.replace(/^https?:\/\//, '');
            return (
              <div key={`${p.platform}-${p.url}`} className="flex items-center gap-2 text-sm">
                <PlatformIcon platform={p.platform} size={15} />
                <span className="truncate text-muted-foreground flex-1 min-w-0">{handle}</span>
                {f != null ? (
                  <span className="tabular-nums font-medium">{fmtNum(f)}</span>
                ) : <span className="text-xs text-muted-foreground">{ps?.latest ? (p.platform === 'site' ? 'site' : '—') : loadingSummary ? '' : 'não puxado'}</span>}
                {delta != null && delta !== 0 && <span className={cx('text-xs tabular-nums min-w-16 text-right whitespace-nowrap', delta > 0 ? 'text-success' : 'text-destructive')} title="vs coleta anterior">{delta > 0 ? '▲' : '▼'} {fmtDelta(delta)!.slice(1)}</span>}
                {(delta == null || delta === 0) && <span className="min-w-16" />}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
          <span title={s?.lastCollected ? new Date(s.lastCollected).toLocaleString('pt-BR') : undefined}>
            {s?.lastCollected ? `Puxado ${timeAgo(s.lastCollected)}` : 'Nunca puxado'}
          </span>
          {items > 0 && <span>· {fmtNum(items)} itens</span>}
          {hadErrors && <span className="text-warning" title="A última coleta teve avisos">· ⚠</span>}
          <button className="ml-auto px-2 py-1 rounded-md border border-border hover:bg-muted text-foreground disabled:opacity-50" disabled={pulling || !d.profiles.length}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPull(); }}>
            {pulling ? <Spinner /> : '↻'} Puxar
          </button>
        </div>
      </div>
    </Link>
  );
}

function PullLog({ log, onClose, slug }: { log: { id: string; name: string; results: CollectResult[] }[]; onClose: () => void; slug: string }) {
  const okN = log.reduce((n, c) => n + c.results.filter((r) => r.ok).length, 0);
  const total = log.reduce((n, c) => n + c.results.length, 0);
  const [open, setOpen] = useState(okN < total);
  return (
    <div className={cx('mb-5 border rounded-xl p-3 bg-card', okN === total ? 'border-green-200' : 'border-amber-200')}>
      <div className="flex items-center gap-3 text-sm">
        <span className={okN === total ? 'text-success' : 'text-warning'}>{okN === total ? '✓' : '⚠'}</span>
        <span><b>{okN}</b> de {total} perfil(is) coletado(s){okN < total ? ' — veja os erros' : ''}</span>
        <button className="text-primary-ink text-xs" onClick={() => setOpen(!open)}>{open ? 'ocultar' : 'detalhes'}</button>
        <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Fechar">×</button>
      </div>
      {open && (
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {log.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-2.5">
              <Link to={`/p/${slug}/concorrentes/${c.id}`} className="font-medium text-sm hover:text-primary-ink">{c.name}</Link>
              {c.results.length === 0 && <div className="text-xs text-muted-foreground">sem perfis</div>}
              {c.results.map((r) => <ResultLine key={r.key} r={r} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const marketOf = (c: Doc<Competitor>, o?: AnalysisOverview) => (c.data.market ?? o?.market ?? 'desconhecido') as keyof typeof MARKET;

/** Tabela comparativa: o essencial de cada análise lado a lado. Clique no cabeçalho ordena; no nome, abre o concorrente. */
function CompareTable({ slug, rows, ov }: { slug: string; rows: Doc<Competitor>[]; ov: Map<string, AnalysisOverview> }) {
  type O = AnalysisOverview | undefined;
  type Col = { k: string; label: string; num?: boolean; v: (o: O, c: Doc<Competitor>) => string | number | undefined; render?: (o: O, c: Doc<Competitor>) => React.ReactNode };
  const cols: Col[] = [
    { k: 'market', label: 'Onde atua', v: (o, c) => marketOf(c, o), render: (o, c) => { const m = MARKET[marketOf(c, o)]; return <span style={{ color: m.color }}>{m.label}</span>; } },
    { k: 'price', label: 'A partir de', num: true, v: (o) => o?.fromMonthly ?? undefined, render: (o) => (o?.fromMonthly != null ? <b>{money(o.fromMonthly, o.currency)}</b> : o?.publicPrice === false ? <span className="text-muted-foreground">oculto</span> : '—') },
    { k: 'model', label: 'Modelo', v: (o) => o?.priceModel },
    { k: 'plans', label: 'Planos', num: true, v: (o) => o?.plans },
    { k: 'trial', label: 'Teste grátis', v: (o) => o?.trial ?? undefined, render: (o) => <span className="block max-w-44 truncate" title={o?.trial ?? ''}>{o?.trial ?? '—'}</span> },
    { k: 'features', label: 'Features', num: true, v: (o) => o?.features },
    { k: 'fw', label: 'Fortes / fracos', v: (o) => (o?.strengths != null ? `${o.strengths} / ${o.weaknesses}` : undefined) },
    { k: 'sections', label: 'Seções da LP', num: true, v: (o) => o?.sections },
    { k: 'ra', label: 'Reclame Aqui', num: true, v: (o) => o?.raScore ?? undefined, render: (o) => (o?.raScore != null ? o.raScore.toLocaleString('pt-BR') : o?.raFound === false ? <span className="text-muted-foreground">não achado</span> : '—') },
    { k: 'store', label: 'Nota app', num: true, v: (o) => o?.storeRating ?? undefined },
    { k: 'done', label: 'Módulos', num: true, v: (o) => Object.keys(o?.updated ?? {}).length, render: (o) => <span className="text-muted-foreground">{Object.keys(o?.updated ?? {}).length}/{FULL_ANALYSIS.length - 1}{o?.request ? ' ⏳' : ''}{o?.hasNotes ? ' ✎' : ''}</span> },
  ];
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 }>({ k: 'price', dir: 1 });
  const col = cols.find((c) => c.k === sort.k);
  const sorted = [...rows].sort((a, b) => {
    if (!col) return a.data.name.localeCompare(b.data.name, 'pt-BR') * sort.dir;
    const va = col.v(ov.get(a.data.id), a), vb = col.v(ov.get(b.data.id), b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')) * sort.dir;
  });
  const th = (k: string, label: string) => (
    <th key={k} className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground" onClick={() => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : 1 }))}>
      {label}{sort.k === k ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  );
  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50"><tr>{th('name', 'Concorrente')}{cols.map((c) => th(c.k, c.label))}</tr></thead>
        <tbody>
          {sorted.map((c) => {
            const o = ov.get(c.data.id);
            return (
              <tr key={c.data.id} className="border-b border-border last:border-0 hover:bg-muted/40 align-top">
                <td className="px-3 py-2 min-w-56 max-w-80">
                  <Link to={`/p/${slug}/concorrentes/${c.data.id}`} className="font-medium hover:text-primary-ink">{c.data.name}</Link>
                  {o?.oneLiner && <div className="text-xs text-muted-foreground line-clamp-2">{o.oneLiner}</div>}
                </td>
                {cols.map((cl) => <td key={cl.k} className={cx('px-3 py-2 whitespace-nowrap', cl.num && 'tabular-nums')}>{cl.render ? cl.render(o, c) : (cl.v(o, c) ?? '—')}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SkeletonGrid = () => (
  <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
    {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-card border border-border animate-pulse" />)}
  </div>
);
