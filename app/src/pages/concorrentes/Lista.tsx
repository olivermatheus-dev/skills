// Aba "Concorrentes" da área: quem são. Tabela densa (logo, frase, preço, audiência, redes, atualizado) ou cards;
// filtros (tipo, onde atua, plataforma, tag), candidatos achados pela IA (aceitar → análise completa) e "Puxar todos".
// A comparação lado a lado (oferta, funcionalidades, mensagem, reputação) fica na aba Comparar.
import { useMemo, useState, type ReactNode } from 'react';
import { Archive, ArrowDown, ArrowUp, Check, CircleCheck, Globe, Hash, LayoutGrid, MapPin, RefreshCw, Sparkles, Table as TableIcon, TriangleAlert, Users, WifiOff, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type AnalysisOverview, type CollectResult, type Competitor, type CompetitorSummary, type Doc } from '../../api';
import { FilaAnalise, MARKET, money } from '../../components/competitors/Analysis';
import { FULL_ANALYSIS } from '../../../../schema/analysis';
import { toast } from '../../components/toast';
import { Badge, Button, Empty, ErrorBox, SelectField, cx, fmtNum, type SelectOption } from '../../components/kit';
import { FavToggle, FilterBar, ViewToggle, useUrlState, type BarFilter } from '../../components/competitors/toolbar';
import { AreaPage, Delta, SortTable, type Col } from '../../components/competitors/area';
import { ResultLine } from '../../components/competitors/AddLinksModal';
import { useCompetitorActions } from '../../components/competitors/useCompetitorActions';
import { prefetchCompetitor, qk, useAnalysisOverview, useCompetitors, useCompetitorsSummary } from '../../queries';
import { Avatar, Img, KINDS, KIND_COLOR, PlatformIcon, Spinner, Star, fmtDelta, keyFor, platformLabel, timeAgo } from '../../components/competitors/lib';
import { useColetas } from '../../components/atividade/useColeta';

type Stage = Competitor['status'];
const MODE_KEY = 'hub:comp-mode';
const lastMode = () => { try { return localStorage.getItem(MODE_KEY) === 'cards' ? 'cards' : 'tabela'; } catch { return 'tabela'; } };
const STAGES: { value: Stage; label: string; icon: ReactNode }[] = [
  { value: 'ativo', label: 'Ativos', icon: <CircleCheck className="text-success-ink" /> },
  { value: 'candidato', label: 'Candidatos', icon: <Sparkles className="text-ai" /> },
  { value: 'arquivado', label: 'Arquivados', icon: <Archive className="text-muted-foreground" /> },
];
const dot = (color: string) => <span className="size-2 rounded-full" style={{ background: color }} />;

export default function Competitors() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const list = useCompetitors(slug);
  const summary = useCompetitorsSummary(slug);
  const actions = useCompetitorActions(slug);
  // filtros e vista na URL (como em Conteúdos e Anúncios); a vista lembra a última escolha
  const [defaults] = useState(() => ({ q: '', etapa: 'ativo', tipo: '', rede: '', tag: '', onde: '', fav: '', vista: lastMode() }));
  const { values: v, set, reset } = useUrlState(defaults);
  const { q, tipo: kind, rede: platform, tag, onde: market } = v;
  const stage = v.etapa as Stage;
  const favOnly = !!v.fav;
  const mode = v.vista === 'cards' ? 'cards' : 'tabela';
  const setMode = (m: string) => { set({ vista: m }); try { localStorage.setItem(MODE_KEY, m); } catch { /* sem storage */ } };
  const overview = useAnalysisOverview(slug);
  const ov = useMemo(() => new Map((overview.data ?? []).map((o) => [o.id, o])), [overview.data]);
  const [pulling, setPulling] = useState<{ i: number; n: number; name: string } | null>(null);
  const [pullLog, setPullLog] = useState<{ id: string; name: string; results: CollectResult[] }[] | null>(null);
  const [pullingOne, setPullingOne] = useState<string | null>(null);
  const coleta = useColetas(slug); // coleta rodando no servidor (046 C), mesmo disparada em outra tela

  const sum = useMemo(() => new Map((summary.data ?? []).map((s) => [s.id, s])), [summary.data]);
  const all = list.data ?? [];
  const allTags = [...new Set(all.flatMap((c) => c.data.tags))].sort();
  const allPlatforms = [...new Set(all.flatMap((c) => c.data.profiles.map((p) => p.platform)))];
  const counts = (k: string) => all.filter((c) => c.data.status === stage && (!k || c.data.kind === k)).length;
  const nStage = (st: Stage) => all.filter((c) => c.data.status === st).length;
  const fila = (overview.data ?? []).filter((o) => o.request).map((o) => ({ id: o.id, name: (list.data ?? []).find((c) => c.data.id === o.id)?.data.name ?? o.id, modules: o.request!.modules }));

  const shown = all.filter((c) => {
    const d = c.data;
    if (d.status !== stage) return false;
    if (market && marketOf(c, ov.get(d.id)) !== market) return false;
    if (kind && d.kind !== kind) return false;
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

  // barra numa linha só (FilterBar de components/competitors/toolbar): busca · etapa e tipo sempre visíveis ·
  // rede, tag e onde atua inline se couber, senão no popover "Filtros" · favoritos e vista no fim
  const stageOpts: SelectOption[] = STAGES.map((s) => ({ ...s, count: nStage(s.value) }));
  const kindOpts: SelectOption[] = [
    { value: '', label: 'Todos os tipos', icon: <Users className="text-muted-foreground" />, count: counts('') },
    ...Object.entries(KINDS).map(([k, label]) => ({ value: k, label, icon: dot(KIND_COLOR[k]), count: counts(k), disabled: !counts(k) && kind !== k })),
  ];
  const platformOpts: SelectOption[] = [
    { value: '', label: 'Todas as redes', icon: <Globe className="text-muted-foreground" /> },
    ...allPlatforms.map((p) => ({ value: p, label: platformLabel(p), icon: <PlatformIcon platform={p} size={14} /> })),
  ];
  const tagOpts: SelectOption[] = [{ value: '', label: 'Todas as tags', icon: <Hash className="text-muted-foreground" /> }, ...allTags.map((t) => ({ value: t, label: `#${t}` }))];
  const marketOpts: SelectOption[] = [
    { value: '', label: 'Brasil e exterior', icon: <MapPin className="text-muted-foreground" /> },
    ...Object.entries(MARKET).map(([k, m]) => ({ value: k, label: m.label, icon: dot(m.color) })),
  ];
  const sel = (label: string, opts: SelectOption[], value: string, onChange: (x: string) => void) => <SelectField size="sm" aria-label={label} title={label} value={value} options={opts} onChange={onChange} />;
  const secondary: BarFilter[] = [
    ...(allPlatforms.length > 1 ? [{ label: 'Rede', node: sel('Rede', platformOpts, platform, (x) => set({ rede: x })), active: !!platform }] : []),
    ...(allTags.length ? [{ label: 'Tag', node: sel('Tag', tagOpts, tag, (x) => set({ tag: x })), active: !!tag }] : []),
    { label: 'Onde atua', node: sel('Onde atua', marketOpts, market, (x) => set({ onde: x })), active: !!market },
  ];
  const filtered = !!(q || kind || platform || tag || market || favOnly);
  const bar = (
    <div data-lista-bar className="mb-4"><FilterBar
      search={{ value: q, onChange: (x) => set({ q: x }), placeholder: 'Buscar nome ou @' }}
      primary={<>
        {sel('Etapa', stageOpts, stage, (x) => set({ etapa: x }))}
        {sel('Tipo', kindOpts, kind, (x) => set({ tipo: x }))}
      </>}
      secondary={secondary}
      trailing={<>
        <FavToggle on={favOnly} onChange={(x) => set({ fav: x ? '1' : '' })} />
        <ViewToggle value={mode} onChange={setMode} options={[{ value: 'tabela', label: 'Tabela', icon: TableIcon }, { value: 'cards', label: 'Cards', icon: LayoutGrid }]} />
      </>}
      active={filtered}
      onClear={() => reset(['q', 'tipo', 'rede', 'tag', 'onde', 'fav'])}
    /></div>
  );

  return (
    <AreaPage sub={list.data ? `${active.length} monitorado(s)` : undefined} actions={<>
      <FilaAnalise slug={slug} fila={fila} />
      <Button variant="ghost" className="inline-flex items-center gap-1.5" disabled={!!pulling || !pullTargets.length} onClick={() => pull(pullTargets)} title="Puxa um por vez os concorrentes visíveis">
        {pulling ? <><Spinner /> {pulling.i}/{pulling.n}</> : <><RefreshCw className="size-4" />Puxar todos{pullTargets.length !== active.length ? ` (${pullTargets.length})` : ''}</>}
      </Button>
    </>}>
      {pulling && (
        <div className="mb-5 bg-card border border-border rounded-xl p-3">
          <div className="flex justify-between text-sm mb-2"><span>Puxando <b>{pulling.name}</b>…</span><span className="text-muted-foreground tabular-nums">{pulling.i} de {pulling.n}</span></div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${((pulling.i - 0.5) / pulling.n) * 100}%` }} /></div>
        </div>
      )}
      {pullLog && <PullLog log={pullLog} onClose={() => setPullLog(null)} slug={slug} />}

      {all.length > 0 && bar}

      <LoadError errors={[list, summary, overview]} onRetry={() => { void list.refetch(); void summary.refetch(); void overview.refetch(); }} />
      {list.isLoading && <SkeletonGrid />}
      {list.data && all.length === 0 && (
        <Empty title="Nenhum concorrente ainda" hint="Cole os links de perfis (YouTube, Instagram, TikTok, site) de concorrentes, criadores e páginas de referência."
 />
      )}
      {list.data && all.length > 0 && shown.length === 0 && <Empty title="Nada com esses filtros" hint="Limpe a busca ou troque os filtros."
        action={filtered ? <Button variant="ghost" onClick={() => reset(['q', 'tipo', 'rede', 'tag', 'onde', 'fav'])}>Limpar filtros</Button> : undefined} />}

      {stage === 'candidato' && shown.length > 0 && <div className="mb-4 text-sm text-muted-foreground">Achados pela IA (radar). <b>Aceitar</b> = vira ativo e entra na fila da análise completa (feita 1x). <b>Recusar</b> = arquiva.</div>}
      {mode === 'tabela' && shown.length > 0 && <ListTable slug={slug} rows={shown} ov={ov} sum={sum} onFav={(c) => actions.toggleFavorite(c)} onPull={pullOne} pullingId={(cid) => pullingOne === cid || !!coleta('coleta', cid)} onAccept={accept}
        onReject={(c) => { void actions.save(c.data.id, { ...c.data, status: 'arquivado' }, c.body, { okMessage: 'Candidato recusado (arquivado)' }); }} />}
      {mode === 'cards' && <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {shown.map((c) => (
          <CompetitorCard key={c.data.id} slug={slug} c={c} s={sum.get(c.data.id)} o={ov.get(c.data.id)} loadingSummary={summary.isLoading}
            onAccept={() => accept(c)} onReject={() => { void actions.save(c.data.id, { ...c.data, status: 'arquivado' }, c.body, { okMessage: 'Candidato recusado (arquivado)' }); }}
            onFav={() => actions.toggleFavorite(c)} onWarm={() => prefetchCompetitor(qc, slug, c.data.id)} onPull={() => pullOne(c)} pulling={pullingOne === c.data.id || pulling?.name === c.data.name || !!coleta('coleta', c.data.id)} />
        ))}
      </div>}
    </AreaPage>
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
            <Button className="!py-1 text-xs flex-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAccept(); }}><span className="inline-flex items-center justify-center gap-1"><Check className="size-3.5" />Aceitar</span></Button>
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
                {delta != null && delta !== 0 && <span className={cx('inline-flex items-center justify-end gap-0.5 text-xs tabular-nums min-w-16 whitespace-nowrap', delta > 0 ? 'text-success-ink' : 'text-destructive')} title="vs coleta anterior">{delta > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{fmtDelta(delta)!.slice(1)}</span>}
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
          {hadErrors && <span className="text-warning-ink" title="A última coleta teve avisos"><TriangleAlert className="inline size-3 align-[-1px]" /></span>}
          <button className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border hover:bg-muted text-foreground disabled:opacity-50" disabled={pulling || !d.profiles.length}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPull(); }}>
            {pulling ? <Spinner /> : <RefreshCw className="size-3" />}Puxar
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
        <span className={okN === total ? 'text-success-ink' : 'text-warning-ink'}>{okN === total ? <Check className="size-3.5" /> : <TriangleAlert className="size-3.5" />}</span>
        <span><b>{okN}</b> de {total} perfil(is) coletado(s){okN < total ? ' — veja os erros' : ''}</span>
        <button className="text-primary-ink text-xs" onClick={() => setOpen(!open)}>{open ? 'ocultar' : 'detalhes'}</button>
        <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Fechar"><X className="size-4" /></button>
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

/** Tabela da lista: quem são, quanto cobram, que audiência têm e quando foram atualizados. Clique ordena; nome abre. */
function ListTable({ slug, rows, ov, sum, onFav, onPull, pullingId, onAccept, onReject }: {
  slug: string; rows: Doc<Competitor>[]; ov: Map<string, AnalysisOverview>; sum: Map<string, CompetitorSummary>;
  onFav: (c: Doc<Competitor>) => void; onPull: (c: Doc<Competitor>) => void; pullingId: (id: string) => boolean; onAccept: (c: Doc<Competitor>) => void; onReject: (c: Doc<Competitor>) => void;
}) {
  const followers = (c: Doc<Competitor>) => { const ps = (sum.get(c.data.id)?.profiles ?? []).filter((p) => p.latest?.profile.followers != null); return ps.length ? ps.reduce((n, p) => n + p.latest!.profile.followers!, 0) : undefined; };
  const delta = (c: Doc<Competitor>) => { const ps = (sum.get(c.data.id)?.profiles ?? []).filter((p) => p.latest?.profile.followers != null); return ps.length && ps.every((p) => p.prevFollowers != null) ? ps.reduce((n, p) => n + p.latest!.profile.followers! - p.prevFollowers!, 0) : undefined; };
  const cols: Col<Doc<Competitor>>[] = [
    { k: 'name', label: 'Concorrente', v: (c) => c.data.name, className: 'min-w-64 max-w-[26rem]', render: (c) => {
      const profs = sum.get(c.data.id)?.profiles ?? [];
      const av = profs.find((p) => p.latest?.profile.avatarLocal) ?? profs.find((p) => p.latest?.profile.avatar);
      return (
        <Link to={`/p/${slug}/concorrentes/${c.data.id}`} onMouseEnter={() => undefined} className="flex items-center gap-2.5 group">
          <Avatar name={c.data.name} size={30} local={api.mediaUrl(slug, c.data.id, av?.latest?.profile.avatarLocal)} remote={av?.latest?.profile.avatar} className="!ring-0" />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-medium group-hover:text-primary-ink">{c.data.name}{c.data.kind !== 'concorrente' && <Badge color={KIND_COLOR[c.data.kind]}>{KINDS[c.data.kind]}</Badge>}{ov.get(c.data.id)?.request && <span className="text-[10px] text-ai">⏳</span>}</span>
            {ov.get(c.data.id)?.oneLiner && <span className="block text-xs text-muted-foreground truncate">{ov.get(c.data.id)!.oneLiner}</span>}
          </span>
        </Link>
      );
    } },
    { k: 'price', label: 'A partir de', num: true, v: (c) => ov.get(c.data.id)?.fromMonthly, render: (c) => { const o = ov.get(c.data.id); return o?.fromMonthly != null ? <b>{money(o.fromMonthly, o.currency)}</b> : <span className="text-muted-foreground text-xs">{o?.publicPrice === false ? 'oculto' : '—'}</span>; } },
    { k: 'model', label: 'Modelo', v: (c) => ov.get(c.data.id)?.priceModel, render: (c) => <span className="text-xs text-muted-foreground">{ov.get(c.data.id)?.priceModel ?? '—'}</span> },
    { k: 'f', label: 'Seguidores', num: true, v: followers, render: (c) => { const f = followers(c); return f != null ? <span className="inline-flex items-baseline gap-1.5"><b>{fmtNum(f)}</b><Delta n={delta(c)} fmt={fmtNum} /></span> : <span className="text-muted-foreground">—</span>; } },
    { k: 'nets', label: 'Redes', render: (c) => {
      const profs = sum.get(c.data.id)?.profiles ?? [];
      return <span className="inline-flex items-center gap-1.5">{c.data.profiles.map((p) => { const ps = profs.find((x) => x.key === keyFor(p)); const err = !!ps?.latest?.errors.length && !ps.latest.items && p.platform !== 'site'; return (
        <a key={p.url} href={p.url} target="_blank" rel="noreferrer" className={cx('relative', !ps?.latest && 'opacity-30 hover:opacity-80')} title={`${platformLabel(p.platform)}${ps?.latest?.profile.followers != null ? ` · ${fmtNum(ps.latest.profile.followers)}` : ''}${ps?.latest ? '' : ' · não puxado'}`}>
          <PlatformIcon platform={p.platform} size={14} />{err && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-destructive" />}
        </a>); })}</span>;
    } },
    { k: 'at', label: 'Atualizado', num: true, v: (c) => sum.get(c.data.id)?.lastCollected, render: (c) => { const at = sum.get(c.data.id)?.lastCollected; return <span className="text-xs text-muted-foreground" title={at ? new Date(at).toLocaleString('pt-BR') : undefined}>{at ? timeAgo(at) : 'nunca'}</span>; } },
    { k: 'act', label: '', render: (c) => (
      <span className="flex items-center justify-end gap-1.5">
        {c.data.status === 'candidato' ? <>
          <Button className="!py-0.5 !px-2 text-xs" onClick={() => onAccept(c)}><span className="inline-flex items-center gap-1"><Check className="size-3.5" />Aceitar</span></Button>
          <Button variant="ghost" className="!py-0.5 !px-2 text-xs" onClick={() => onReject(c)}>Recusar</Button>
        </> : <>
          <Star on={c.data.favorite} onClick={() => onFav(c)} size="text-base" />
          <button title="Puxar agora" aria-label="Puxar agora" className="h-6 w-6 grid place-items-center rounded-md border border-border hover:bg-muted disabled:opacity-50" disabled={pullingId(c.data.id) || !c.data.profiles.length} onClick={() => onPull(c)}>{pullingId(c.data.id) ? <Spinner /> : <RefreshCw className="size-3.5" />}</button>
        </>}
      </span>
    ) },
  ];
  return <SortTable fill rows={rows} cols={cols} rowKey={(c) => c.data.id} initial={{ k: 'f', dir: -1 }} />;
}

/**
 * Erro de carga. "Failed to fetch" = o servidor do app não respondeu (caiu, reiniciou ou está fora do ar): com dados já
 * na tela vira um aviso discreto com "Tentar de novo" em vez de uma caixa vermelha sobre uma tabela que está certa.
 */
function LoadError({ errors, onRetry }: { errors: { error: unknown; data?: unknown; isFetching: boolean }[]; onRetry: () => void }) {
  const failed = errors.filter((e) => e.error);
  if (!failed.length) return null;
  const offline = failed.every((e) => e.error instanceof TypeError);
  if (!offline) return <ErrorBox error={failed[0].error} />;
  const stale = failed.every((e) => e.data != null);
  const busy = failed.some((e) => e.isFetching);
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <WifiOff className="size-4 shrink-0" />
      <span>Sem resposta do servidor do app.{stale ? ' Mostrando os últimos dados carregados.' : ''} Se continuar, rode <code className="text-xs">npm run app</code> de novo.</span>
      <button type="button" onClick={onRetry} disabled={busy} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-amber-100 disabled:opacity-50">
        <RefreshCw className={cx('size-3.5', busy && 'animate-spin')} />Tentar de novo
      </button>
    </div>
  );
}

const SkeletonGrid = () => (
  <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
    {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-card border border-border animate-pulse" />)}
  </div>
);
