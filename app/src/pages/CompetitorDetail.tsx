// Ficha do concorrente, organizada por área de marketing. Cabeçalho compacto (fixo): logo, frase, chips (mercado, preço,
// audiência, reputação, redes) e "Puxar" → diálogo com o que atualizar. Abas (?aba=): Diagnóstico · Oferta · Produto ·
// Mensagem · Redes e conteúdos · Reputação · Dados. Redes: números do perfil, conteúdos por outlier, marcação e "Virar ideia".
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type CollectResult, type Competitor, type Doc, type ItemMark } from '../api';
import type { ModuleDataOf } from '../../../schema/analysis';
import { qk, useAnalysis, useCompetitor, useCompetitors, useCompetitorsSummary, useTags } from '../queries';
import { ArrowDown, ArrowUp, Clapperboard, ChevronRight, ExternalLink, Eye, Globe2, Lightbulb, Link2, MapPin, Plus, RefreshCw, Star as StarIcon, TriangleAlert, User, Users, X, Zap } from 'lucide-react';
import ContextSidebar from '../components/ContextSidebar';
import { useCompetitorActions } from '../components/competitors/useCompetitorActions';
import { Badge, Button, Empty, ErrorBox, cx, fmtNum } from '../components/kit';
import EditCompetitor from '../components/competitors/EditCompetitor';
import { useMakeIdea } from '../components/competitors/useMakeIdea';
import AnalysisPanel, { AREAS, QueueChip, RunDialog, money, type AreaId } from '../components/competitors/Analysis';
import FollowersChart, { type FollowerSeries } from '../components/competitors/FollowersChart';
import { ItemPanel } from '../components/competitors/ficha/FichaPanel';
import { useFichasResumo } from '../components/competitors/ficha/useFichas';
import AdsView from '../components/competitors/AdsView';
import ContentsView from '../components/competitors/ContentsView';
import { useMarketRows } from '../components/competitors/market';
import { StatStrip } from '../components/competitors/area';
import { AppContent } from '../components/AppContent';
import {
  Avatar, KINDS, KIND_COLOR, PlatformIcon, SERIES, Spinner, Star, TYPE_LABEL, buildRows, fmtDateTime, fmtDelta,
  fmtPct, groupSnapshots, keyFor, median, platformLabel, timeAgo, type Row,
} from '../components/competitors/lib';

const handleOf = (p: { platform: string; handle?: string; externalId?: string; url: string }) =>
  p.handle ? (p.platform === 'site' ? p.handle : `@${p.handle}`) : p.externalId ?? p.url.replace(/^https?:\/\/(www\.)?/, '');

/** abas da ficha: as áreas da análise + Redes e conteúdos depois de Mensagem */
const TABS = [...AREAS.slice(0, 4), { id: 'redes', label: 'Redes e conteúdos' } as const, ...AREAS.slice(4), { id: 'anuncios', label: 'Anúncios' } as const];
type TabId = AreaId | 'redes' | 'anuncios';

/** links do site que não são perfil de verdade (páginas de produto das redes, compartilhar, políticas) */
const JUNK_LINK = /facebook\.com\/(business|sharer|policies|privacy|help|tr\b)|instagram\.com\/(p|reel|explore|accounts)\/|twitter\.com\/(intent|share)|x\.com\/(intent|share)|linkedin\.com\/(shareArticle|sharing)|youtube\.com\/(watch|embed)|wa\.me|api\.whatsapp/i;

/** erro de coleta em poucas palavras (o texto inteiro fica no tooltip) */
function shortError(e: string) {
  if (/APIFY_TOKEN|cookies|login|precisa de/i.test(e)) return 'precisa de acesso';
  if (/429|rate|limit/i.test(e)) return 'limite de acesso, tente depois';
  if (/timeout|timed out|demorou/i.test(e)) return 'demorou demais';
  if (/404|não encontrado|not found/i.test(e)) return 'perfil não encontrado';
  return e.replace(/^[^:]{0,30}:\s*/, '').slice(0, 40) + (e.length > 40 ? '…' : '');
}

/** resultado da coleta em uma linha: um chip por perfil; tooltip com o detalhe */
function CollectStrip({ results, pulling, elapsed, total, onClose }: { results: CollectResult[] | null; pulling: boolean; elapsed: number; total: number; onClose: () => void }) {
  if (pulling) return <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Spinner /> Coletando {total} perfil(is)… {elapsed}s <span className="opacity-70">(YouTube com detalhes leva 1–2 min)</span></div>;
  if (!results) return null;
  const okN = results.filter((r) => r.ok).length;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted-foreground mr-0.5">Coleta: {okN}/{results.length}</span>
      {results.map((r) => {
        const msg = [...r.errors, ...r.warnings].join('\n');
        const zero = r.ok && r.items === 0 && r.platform !== 'site';
        return (
          <span key={r.key} title={msg || undefined}
            className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5', !r.ok ? 'border-destructive/30 bg-destructive/5 text-destructive' : zero ? 'border-warning/30 bg-warning/5' : 'border-border bg-card')}>
            {r.platform !== '-' && <PlatformIcon platform={r.platform} size={12} />}
            {r.ok ? <>{r.followers != null ? fmtNum(r.followers) : r.platform === 'site' ? 'ok' : ''}{r.platform !== 'site' && <span className="text-muted-foreground">· {r.items} itens</span>}</> : shortError(r.errors[0] ?? 'falhou')}
          </span>
        );
      })}
      <button className="text-muted-foreground hover:text-foreground p-0.5" onClick={onClose} aria-label="Fechar"><X className="size-3.5" /></button>
    </div>
  );
}

/** chip do cabeçalho: ícone/rótulo curto + valor; o detalhe vai no tooltip */
const Chip = ({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) => (
  <button type="button" onClick={onClick} title={title} className={cx('inline-flex items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-xs whitespace-nowrap', onClick ? 'hover:bg-muted' : 'cursor-default')}>{children}</button>
);

/** página: barra contextual com todos os concorrentes (clicar troca o detalhe sem voltar à lista) + o detalhe */
export default function CompetitorDetail() {
  const { slug = '', id = '' } = useParams();
  return (
    <div className="flex h-full">
      <ListaConcorrentes slug={slug} id={id} />
      <div className="flex-1 min-w-0 overflow-y-auto"><Detalhe key={id} /></div>
    </div>
  );
}

function ListaConcorrentes({ slug, id }: { slug: string; id: string }) {
  const { data = [] } = useCompetitors(slug);
  const summary = useCompetitorsSummary(slug);
  const [search] = useSearchParams();
  const [busca, setBusca] = useState('');
  const b = busca.trim().toLowerCase();
  const lista = data.filter((d) => d.data.status !== 'arquivado' && (!b || d.data.name.toLowerCase().includes(b)));
  // logo real (avatar da última coleta) e audiência somada ao lado do nome
  const look = useMemo(() => new Map((summary.data ?? []).map((s) => {
    const withAv = s.profiles.find((p) => p.latest?.profile.avatarLocal) ?? s.profiles.find((p) => p.latest?.profile.avatar);
    const followers = s.profiles.reduce((n, p) => n + (p.latest?.profile.followers ?? 0), 0);
    return [s.id, { local: api.mediaUrl(slug, s.id, withAv?.latest?.profile.avatarLocal), remote: withAv?.latest?.profile.avatar, followers }];
  })), [summary.data, slug]);
  const aba = search.get('aba');
  const item = (d: Doc<Competitor>) => {
    const l = look.get(d.data.id);
    return (
      <ContextSidebar.Item key={d.data.id} to={`/p/${slug}/concorrentes/${d.data.id}${aba ? `?aba=${aba}` : ''}`} active={d.data.id === id}
        icon={<Avatar name={d.data.name} size={18} local={l?.local} remote={l?.remote} className="!ring-0" />}
        trailing={<span className="flex items-center gap-1">{l?.followers ? <span className="text-[10px] tabular-nums text-muted-foreground">{fmtNum(l.followers)}</span> : null}{d.data.favorite && <StarIcon className="size-3 fill-current text-warning-ink" />}</span>}>{d.data.name}</ContextSidebar.Item>
    );
  };
  const grupos: [string, Doc<Competitor>[]][] = [
    ['Concorrentes', lista.filter((d) => d.data.status === 'ativo' && d.data.kind === 'concorrente')],
    ['Referências e criadores', lista.filter((d) => d.data.status === 'ativo' && d.data.kind !== 'concorrente')],
    ['Candidatos (aceitar)', lista.filter((d) => d.data.status === 'candidato')],
  ];
  return (
    <ContextSidebar storageKey="concorrentes" label="Concorrentes" title={<Link to={`/p/${slug}/concorrentes`} className="hover:underline">Concorrentes</Link>} search={{ value: busca, onChange: setBusca, placeholder: 'Buscar concorrente…' }}>
      {grupos.filter(([, l]) => l.length).map(([t, l]) => <ContextSidebar.Section key={t} title={<>{t} <span className="font-normal">{l.length}</span></>}>{l.map(item)}</ContextSidebar.Section>)}
      {!lista.length && <ContextSidebar.Empty>Nenhum concorrente{b ? ' com esse nome' : ''}.</ContextSidebar.Empty>}
    </ContextSidebar>
  );
}

function Detalhe() {
  const { slug = '', id = '' } = useParams();
  const qc = useQueryClient();
  const key = qk.competitor(slug, id);
  const q = useCompetitor(slug, id);
  const projectTags = useTags(slug);
  const actions = useCompetitorActions(slug);
  const idea = useMakeIdea(slug);
  const fichas = useFichasResumo(slug);

  const [search_, setSearch_] = useSearchParams();
  const view = (TABS.some((t) => t.id === search_.get('aba')) ? search_.get('aba') : 'diagnostico') as TabId;
  const setView = (v: TabId) => setSearch_((s) => { const n = new URLSearchParams(s); if (v === 'diagnostico') n.delete('aba'); else n.set('aba', v); return n; }, { replace: true });
  const [runOpen, setRunOpen] = useState(false);
  const analysis = useAnalysis(slug, id);
  const [tab, setTab] = useState<string>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<false | { draft?: { data: Competitor; body: string }; error?: unknown }>(false);
  const [pulling, setPulling] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<CollectResult[] | null>(null);
  const [pullError, setPullError] = useState<unknown>(null);

  // altura do cabeçalho fixo: a barra de filtros dos Conteúdos gruda logo abaixo dele
  const headRef = useRef<HTMLElement>(null);
  const [headH, setHeadH] = useState(0);
  useLayoutEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const fit = () => setHeadH(el.offsetHeight);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  });

  useEffect(() => { if (!pulling) return; setElapsed(0); const t = setInterval(() => setElapsed((s) => s + 1), 1000); return () => clearInterval(t); }, [pulling]);

  const d = q.data;
  const series = useMemo(() => groupSnapshots(d?.snapshots ?? []), [d?.snapshots]);
  const profiles = useMemo(() => (d?.data.profiles ?? []).map((p, i) => ({ ...p, key: keyFor(p), series: series.get(keyFor(p)), color: SERIES[i % SERIES.length] })), [d?.data.profiles, series]);
  const market = useMarketRows(slug);
  const rows = useMemo(() => buildRows(profiles.map((p) => p.series).filter(Boolean) as NonNullable<(typeof profiles)[number]['series']>[], d?.marks ?? {}, (k) => k.split('-')[0]).map((r) => {
    const mr = market.byKey.get(`${id}|${r.profileKey}|${r.mk}`);
    return mr ? { ...r, outlierMercado: mr.outlierMercado, outlierMercadoBasis: mr.outlierMercadoBasis, mercadoAmostra: mr.mercadoAmostra, mercadoEscopo: mr.mercadoEscopo, mercadoConcorrentes: mr.mercadoConcorrentes, porSeguidorMercado: mr.porSeguidorMercado } : r;
  }), [profiles, d?.marks, market.byKey, id]);

  // marcar (★, status, tags, nota) é otimista: muda na hora; erro → volta e avisa
  const mark = { mutate: ({ mk, patch }: { mk: string; patch: Partial<ItemMark> }) => { actions.mark(id, mk, patch).catch(() => {}); } };

  if (q.isLoading) return <AppContent><div className="h-48 rounded-xl bg-card border border-border animate-pulse" /><div className="mt-4 h-24 rounded-xl bg-card border border-border animate-pulse" /></AppContent>;
  if (q.error || !d) return <AppContent><Link to={`/p/${slug}/concorrentes`} className="text-sm text-muted-foreground">← Concorrentes</Link><ErrorBox error={q.error ?? new Error('não encontrado')} /></AppContent>;

  const c = d.data;
  const sel = profiles.find((p) => p.key === tab);
  const scope = sel ? [sel] : profiles;
  const lookAvatar = profiles.find((p) => p.series?.latest?.data.profile.avatarLocal) ?? profiles.find((p) => p.series?.latest?.data.profile.avatar);
  const ap = lookAvatar?.series?.latest?.data.profile;
  const media = (local?: string) => api.mediaUrl(slug, id, local);

  // chips do cabeçalho (o essencial de cada módulo)
  const res = analysis.data?.results;
  const oneLiner = (res?.resumo?.data as ModuleDataOf<'resumo'> | undefined)?.oneLiner;
  const atu = res?.atuacao?.data as ModuleDataOf<'atuacao'> | undefined;
  const pre = res?.precos?.data as ModuleDataOf<'precos'> | undefined;
  const rep = res?.reputacao?.data as ModuleDataOf<'reputacao'> | undefined;
  const withFAll = profiles.filter((p) => p.series?.latest?.data.profile.followers != null);
  const fTotalAll = withFAll.length ? withFAll.reduce((n, p) => n + p.series!.latest!.data.profile.followers!, 0) : undefined;
  const prevAll = withFAll.map((p) => p.series!.all.slice(0, -1).reverse().find((s) => s.data.profile.followers != null)?.data.profile.followers);
  const fDeltaAll = fTotalAll != null && prevAll.every((x) => x != null) ? fTotalAll - (prevAll as number[]).reduce((a, b) => a + b, 0) : undefined;

  // números do escopo
  const scopeRows = rows.filter((r) => scope.some((p) => p.key === r.profileKey));
  // soma só dos perfis que têm seguidores; o delta só entra quando todos eles têm coleta anterior
  const withF = scope.filter((p) => p.series?.latest?.data.profile.followers != null);
  const fTotal = withF.length ? withF.reduce((n, p) => n + p.series!.latest!.data.profile.followers!, 0) : undefined;
  const prevF = withF.map((p) => p.series!.all.slice(0, -1).reverse().find((s) => s.data.profile.followers != null)?.data.profile.followers);
  const fDelta = fTotal != null && prevF.every((x) => x != null) ? fTotal - (prevF as number[]).reduce((a, b) => a + b, 0) : undefined;
  const medViews = median(scopeRows.map((r) => r.item.metrics.views).filter((v): v is number => !!v));
  const hot = scopeRows.filter((r) => (r.outlier ?? 0) >= 3).length;
  const hotMkt = scopeRows.filter((r) => (r.outlierMercado ?? 0) >= 3).length;
  const lastAt = scope.map((p) => p.series?.latest?.data.collectedAt).filter(Boolean).sort().at(-1);
  const nSnaps = scope.reduce((n, p) => n + (p.series?.all.length ?? 0), 0);

  const types = [...new Set(scopeRows.map((r) => r.item.type))];

  const chart: FollowerSeries[] = scope.flatMap((p) => {
    const pts = (p.series?.all ?? []).filter((s) => s.data.profile.followers != null).map((s) => ({ at: s.data.collectedAt, v: s.data.profile.followers! }));
    return pts.length ? [{ key: p.key, label: `${platformLabel(p.platform)} · ${handleOf(p)}`, platform: p.platform, color: p.color, points: pts }] : [];
  });

  const siteLinks = scope.flatMap((p) => (p.platform === 'site' ? p.series?.latest?.data.profile.links ?? [] : []));
  const missingLinks = [...new Set(siteLinks)].filter((l) => !JUNK_LINK.test(l) && !c.profiles.some((p) => p.url.replace(/\/$/, '').toLowerCase() === l.replace(/\/$/, '').toLowerCase()));

  async function pull() {
    setPulling(true); setResults(null); setPullError(null);
    try { setResults(await api.collectResults(slug, id)); } catch (e) { setPullError(e); }
    finally {
      setPulling(false);
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: qk.competitorsSummary(slug) });
    }
  }
  const toggleFav = () => { void actions.toggleFavorite({ data: c, body: d!.body }); };
  async function addLink(url: string) {
    const det = await api.detectLink(url); // leitura (rápida); a gravação abaixo é otimista
    if (!det || det.kind !== 'perfil') return;
    void actions.save(id, { ...c, profiles: [...c.profiles, { platform: det.platform as never, url: det.url, handle: det.handle, externalId: det.externalId }] }, d!.body, { okMessage: 'Perfil adicionado' });
  }
  const makeIdea = (r: Row, title?: string, tags?: string[], note?: string) => {
    const prof = profiles.find((p) => p.key === r.profileKey);
    return idea.make({ id, name: c.name }, prof ? handleOf(prof) : '', r, title, tags, note);
  };
  const ideaBusy = idea.busy, ideaError = idea.error;

  const openRow = rows.find((r) => r.mk === open) ?? null;
  const allTagSuggestions = [...new Set([...(projectTags.data?.tags ?? []).map((t) => t.id), ...Object.values(d.marks).flatMap((m) => m.tags)])];

  return (
    <div className="pb-8">
      {/* cabeçalho compacto, fixo ao rolar */}
      <header ref={headRef} className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border"><div className="mx-auto w-full max-w-[1440px] px-8 pt-4">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Link to={`/p/${slug}/concorrentes`} className="hover:text-foreground">Concorrentes</Link><ChevronRight className="size-3" /><span className="text-foreground">{c.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size={44} local={media(ap?.avatarLocal)} remote={ap?.avatar} className="!ring-1 ring-border" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-semibold tracking-tight truncate">{c.name}</h1>
              <Star on={c.favorite} onClick={toggleFav} size="text-base" />
              {c.kind !== 'concorrente' && <Badge color={KIND_COLOR[c.kind]}>{KINDS[c.kind]}</Badge>}
              {c.status !== 'ativo' && <Badge color={c.status === 'candidato' ? '#d97706' : undefined}>{c.status}</Badge>}
              <QueueChip slug={slug} c={c} />
            </div>
            {oneLiner && <p className="text-sm text-muted-foreground truncate" title={oneLiner}>{oneLiner}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing({})}>Editar</Button>
            <Button onClick={() => setRunOpen(true)} disabled={!c.profiles.length} title="Escolher o que atualizar (redes, site, análises)">
              {pulling ? <><Spinner /> {elapsed}s</> : <><RefreshCw className="size-3.5 inline -mt-0.5 mr-1" />Puxar</>}
            </Button>
          </div>
        </div>

        {/* chips: o essencial de cada módulo em uma linha */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {atu && <Chip title={`${atu.countries.join(', ')} · ${atu.languages.join(', ')} · ${atu.currencies.join(', ')}\n${atu.evidence}`}><MapPin className="size-3 text-muted-foreground" />{atu.countries.length > 2 ? `${atu.countries.length} países` : atu.countries.join(', ') || '—'} · {atu.languages.join(', ')}</Chip>}
          {pre && <Chip onClick={() => setView('oferta')} title={pre.notes ?? undefined}>{pre.publicPrice && pre.fromMonthly != null ? <><b className="font-semibold">{money(pre.fromMonthly, pre.currency)}</b>/mês</> : 'preço oculto'} · {pre.model}{pre.trial ? ` · ${pre.trial.replace(/,? sem cartão/i, '').slice(0, 28)}` : ''}</Chip>}
          {fTotalAll != null && <Chip onClick={() => setView('redes')} title="seguidores somados das redes puxadas">{fmtNum(fTotalAll)} seguidores{fDeltaAll ? <span className={cx('ml-1 inline-flex items-center', fDeltaAll > 0 ? 'text-success-ink' : 'text-destructive')}>{fDeltaAll > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{fmtNum(Math.abs(fDeltaAll))}</span> : null}</Chip>}
          {rep && <Chip onClick={() => setView('reputacao')} title={rep.summary}>Reclame Aqui {rep.reclameAqui?.found ? <b className="font-semibold">{rep.reclameAqui.score?.toLocaleString('pt-BR') ?? '—'}</b> : '—'}{rep.stores.find((s) => s.rating != null) ? ` · app ★ ${rep.stores.find((s) => s.rating != null)!.rating}` : ''}</Chip>}
          <span className="inline-flex items-center gap-1.5 ml-1">
            {profiles.map((p) => {
              const res = results?.find((r) => r.key === p.key);
              const failed = res ? !res.ok : !!p.series?.latest?.data.errors.length && !p.series?.latest?.data.items?.length && p.platform !== 'site';
              return (
                <a key={p.key} href={p.url} target="_blank" rel="noreferrer" className={cx('relative', !p.series && 'opacity-35 hover:opacity-80')}
                  title={`${platformLabel(p.platform)} ${handleOf(p)}${p.series?.latest ? ` · coletado ${timeAgo(p.series.latest.data.collectedAt)}` : ' · ainda não puxado'}${res && !res.ok ? `\n${res.errors.join('\n')}` : ''}`}>
                  <PlatformIcon platform={p.platform} size={15} />
                  {failed && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-destructive" />}
                </a>
              );
            })}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto" title={lastAt ? `${fmtDateTime(lastAt)} · ${nSnaps} coleta(s) no histórico` : undefined}>{lastAt ? `atualizado ${timeAgo(lastAt)}` : 'ainda não puxado'}</span>
        </div>
        <CollectStrip results={results} pulling={pulling} elapsed={elapsed} total={c.profiles.length} onClose={() => setResults(null)} />
        {pullError ? <ErrorBox error={pullError} /> : null}

        <div className="mt-3 flex gap-0.5 -mb-px overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} className={cx('px-3 py-2 text-sm border-b-2 whitespace-nowrap', view === t.id ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {t.label}{t.id === 'redes' && rows.length > 0 && <span className="ml-1 text-xs text-muted-foreground tabular-nums">{rows.length}</span>}
            </button>
          ))}
        </div>
      </div></header>

      <div className="mx-auto w-full max-w-[1440px] px-8">
        {view === 'anuncios' && <AdsView slug={slug} compId={id} shell={(actions, body) => <>
          <div className="flex items-center justify-end gap-2 mb-3">{actions}</div>
          {body}
        </>} />}
        {view !== 'redes' && view !== 'anuncios' && <AnalysisPanel slug={slug} c={c} area={view} onRun={() => setRunOpen(true)} />}
        {view === 'redes' && <>

        {/* perfis: os puxados como abas; os sem coleta só como ícone apagado */}
        <div className="mt-4 flex items-center gap-1 border-b border-border overflow-x-auto">
          {[{ key: 'all' } as const, ...profiles.filter((p) => p.series)].map((p) => {
            const active = tab === p.key;
            const isAll = p.key === 'all';
            const pf = !isAll ? (p as (typeof profiles)[number]) : null;
            const f = pf?.series?.latest?.data.profile.followers;
            return (
              <button key={p.key} onClick={() => setTab(p.key)}
                className={cx('px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px flex items-center gap-1.5', active ? 'border-primary text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                {isAll ? <>Todos <span className="text-xs text-muted-foreground">{rows.length}</span></> : <>
                  <PlatformIcon platform={pf!.platform} size={14} />
                  {handleOf(pf!)}
                  {f != null && <span className="text-xs text-muted-foreground tabular-nums">{fmtNum(f)}</span>}
                </>}
              </button>
            );
          })}
          {profiles.some((p) => !p.series) && (
            <span className="ml-auto flex items-center gap-1.5 pl-3 text-[11px] text-muted-foreground whitespace-nowrap">
              sem coleta:
              {profiles.filter((p) => !p.series).map((p) => <a key={p.key} href={p.url} target="_blank" rel="noreferrer" title={`${platformLabel(p.platform)} ${handleOf(p)}`} className="opacity-50 hover:opacity-100"><PlatformIcon platform={p.platform} size={13} /></a>)}
            </span>
          )}
        </div>

        {sel && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <a href={sel.url} target="_blank" rel="noreferrer" className="text-primary-ink"><span className="inline-flex items-center gap-1">{sel.url}<ExternalLink className="size-3" /></span></a>
            {sel.series?.latest && <span>via {sel.series.latest.data.source}</span>}
            {sel.series?.latest?.data.profile.links.filter((l) => !siteLinks.includes(l)).map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="hover:text-primary-ink"><Link2 className="size-3 inline mr-1" />{l.replace(/^https?:\/\//, '')}</a>)}
            {sel.series?.latest?.data.errors.map((e) => <span key={e} className="inline-flex items-center gap-1 text-warning-ink"><TriangleAlert className="size-3.5" />{e}</span>)}
          </div>
        )}

        {/* números */}
        {sel?.platform !== 'site' && (() => {
          const marked = scopeRows.filter((r) => r.mark && (r.mark.favorite || r.mark.status !== 'nova')).length;
          const ideas = scopeRows.filter((r) => r.mark?.ideaId).length;
          const eng = median(scopeRows.map((r) => r.engagement).filter((v): v is number => v != null));
          return (
            <div className="mt-4">
              <StatStrip items={[
                { icon: Users, label: sel ? 'Seguidores' : 'Seguidores (soma)', value: fmtNum(fTotal), sub: fDelta ? <span className={fDelta > 0 ? 'text-success-ink' : 'text-destructive'}>{fmtDelta(fDelta)}</span> : undefined },
                { icon: Clapperboard, label: 'Conteúdos', value: fmtNum(scopeRows.length), sub: types.map((t) => `${scopeRows.filter((r) => r.item.type === t).length} ${TYPE_LABEL[t]?.toLowerCase()}`).join(' · ') },
                { icon: Eye, label: 'Mediana de views', value: fmtNum(medViews != null ? Math.round(medViews) : undefined) },
                ...(eng != null ? [{ icon: Zap, label: 'Engajamento (mediana)', value: fmtPct(eng) }] : []),
                { icon: User, label: '≥3× o perfil', value: String(hot) },
                { icon: Globe2, label: '≥3× o mercado', value: String(hotMkt) },
                ...(marked > 0 || ideas > 0 ? [{ icon: Lightbulb, label: 'Marcados', value: String(marked), sub: ideas ? `${ideas} viraram ideia` : undefined }] : []),
              ]} />
            </div>
          );
        })()}

        {/* evolução só faz sentido com 3+ coletas; antes disso o número acima basta */}
        {chart.some((s) => s.points.length >= 3) && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold mb-2">Seguidores por coleta</h2>
            <FollowersChart series={chart.filter((s) => s.points.length >= 3)} />
          </section>
        )}

        {missingLinks.length > 0 && (
          <div className="mt-5 bg-card border border-border rounded-lg p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Redes encontradas no site</div>
            <div className="flex flex-wrap gap-2">
              {missingLinks.map((l) => (
                <button key={l} onClick={() => addLink(l)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border hover:border-primary hover:text-primary-ink text-xs">
                  <Plus className="size-3" />{l.replace(/^https?:\/\/(www\.)?/, '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* conteúdos */}
        <section className="mt-8">
          <h2 className="text-base font-semibold mb-2">Conteúdos</h2>
          <ErrorBox error={ideaError} />

          {!c.profiles.length && <Empty title="Sem perfis" hint="Adicione links em Editar." action={<Button onClick={() => setEditing({})}>Editar</Button>} />}
          {c.profiles.length > 0 && !rows.length && (
            <Empty title={series.size ? "Nenhum conteúdo coletado" : "Ainda não puxado"}
              hint={series.size ? "Sites trazem só o perfil. Confira os avisos da última coleta." : "Clique em “Puxar agora” para trazer perfil, vídeos e métricas."}
              action={!series.size ? <Button onClick={pull} disabled={pulling} className="inline-flex items-center gap-1.5"><RefreshCw className="size-3.5" />Puxar agora</Button> : undefined} />
          )}
          {sel && rows.length > 0 && !scopeRows.length && sel.platform === "site" && <Empty title="Site não tem lista de conteúdos" hint="A coleta do site traz título, descrição, imagem de capa, ícone e as redes linkadas." />}
          {scopeRows.length > 0 && (
            <ContentsView rows={scopeRows} slug={slug} showComp={false} fichaOf={(r) => fichas.of(id, r.mk)} showPlatformFilter={!sel} defaultAll fill={false} stickyTop={headH}
              searchPlaceholder="Buscar título, legenda, nota…"
              mediaOf={(r) => media(r.item.thumbnailLocal)} ideaBusy={(r) => ideaBusy === r.mk}
              onMark={(r, patch) => mark.mutate({ mk: r.mk, patch })} onIdea={(r) => makeIdea(r)} onOpen={(r) => setOpen(r.mk)} />
          )}
        </section>
        </>}
      </div>

      <ItemPanel compId={id} r={openRow} open={!!openRow} onClose={() => setOpen(null)} slug={slug} media={media(openRow?.item.thumbnailLocal)}
        profileLabel={openRow ? handleOf(profiles.find((p) => p.key === openRow.profileKey) ?? { platform: openRow.platform, url: '' }) : ''}
        tagSuggestions={allTagSuggestions} ideaBusy={!!openRow && ideaBusy === openRow.mk}
        onMark={(patch) => openRow && mark.mutate({ mk: openRow.mk, patch })}
        onIdea={(title, tags, note) => openRow && makeIdea(openRow, title, tags, note)} />
      <RunDialog slug={slug} c={c} open={runOpen} onOpenChange={setRunOpen} onCollect={pull} />
      {editing && <EditCompetitor key={editing.error ? 'erro' : 'ok'} slug={slug} open onClose={() => setEditing(false)} onFailed={(draft, error) => setEditing({ draft, error })}
        data={editing.draft?.data ?? c} body={editing.draft?.body ?? d.body} initialError={editing.error} snapshotsCount={d.snapshotsTotal} />}
    </div>
  );
}

