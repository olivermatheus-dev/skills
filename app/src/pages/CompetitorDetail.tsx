// Detalhe do concorrente: capa, bio e perfis. Duas abas:
//   Análise — módulos (site, preços, features, LP, reputação…), pedido para a fila da IA e anotações por módulo;
//   Redes e conteúdos — "Puxar agora", seguidores por coleta, conteúdos ranqueados por outlier, marcação e "Virar ideia".
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type CollectResult, type Competitor, type CompetitorFull, type Doc, type Idea, type ItemMark } from '../api';
import { nextSeqId, qk, runOptimistic, trackCreate, upsertDoc, useAnalysis, useCompetitor, useCompetitors, useTags } from '../queries';
import { Star as StarIcon } from 'lucide-react';
import ContextSidebar from '../components/ContextSidebar';
import { useCompetitorActions } from '../components/competitors/useCompetitorActions';
import { Badge, Button, Empty, ErrorBox, Input, Select, cx, fmtNum } from '../components/kit';
import { ResultLine } from '../components/competitors/AddLinksModal';
import EditCompetitor from '../components/competitors/EditCompetitor';
import AnalysisPanel, { MARKET } from '../components/competitors/Analysis';
import FollowersChart, { type FollowerSeries } from '../components/competitors/FollowersChart';
import { ItemCard, ItemDrawer, titleOf } from '../components/competitors/Items';
import {
  Avatar, Chips, Img, KINDS, KIND_COLOR, PlatformIcon, SERIES, STATUS_LABEL, Spinner, Star, TYPE_LABEL, buildRows, fmtDateTime, fmtDelta,
  fmtPct, fmtRatio, groupSnapshots, keyFor, median, platformLabel, timeAgo, type Row,
} from '../components/competitors/lib';

type Sort = 'outlier' | 'views' | 'recent' | 'engagement' | 'growth';
const SORTS: Record<Sort, string> = { outlier: 'Outlier (fora da curva)', views: 'Mais views', recent: 'Mais recentes', engagement: 'Engajamento', growth: 'Cresceu desde a última coleta' };
const sortFn: Record<Sort, (a: Row, b: Row) => number> = {
  outlier: (a, b) => (b.outlier ?? -1) - (a.outlier ?? -1),
  views: (a, b) => (b.item.metrics.views ?? -1) - (a.item.metrics.views ?? -1),
  recent: (a, b) => (b.item.publishedAt ?? '').localeCompare(a.item.publishedAt ?? ''),
  engagement: (a, b) => (b.engagement ?? -1) - (a.engagement ?? -1),
  growth: (a, b) => (b.viewsDelta ?? -1) - (a.viewsDelta ?? -1),
};
const handleOf = (p: { platform: string; handle?: string; externalId?: string; url: string }) =>
  p.handle ? (p.platform === 'site' ? p.handle : `@${p.handle}`) : p.externalId ?? p.url.replace(/^https?:\/\/(www\.)?/, '');

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
  const [busca, setBusca] = useState('');
  const b = busca.trim().toLowerCase();
  const lista = data.filter((d) => d.data.status !== 'arquivado' && (!b || d.data.name.toLowerCase().includes(b)));
  const item = (d: Doc<Competitor>) => (
    <ContextSidebar.Item key={d.data.id} to={`/p/${slug}/concorrentes/${d.data.id}`} active={d.data.id === id}
      icon={<span className="size-4 rounded-full bg-muted text-[9px] font-semibold grid place-items-center text-muted-foreground">{d.data.name.slice(0, 1).toUpperCase()}</span>}
      trailing={d.data.favorite ? <StarIcon className="size-3 fill-current text-warning" /> : undefined}>{d.data.name}</ContextSidebar.Item>
  );
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

  const [view, setView] = useState<'analise' | 'redes'>('analise');
  const analysis = useAnalysis(slug, id);
  const [tab, setTab] = useState<string>('all');
  const [sort, setSort] = useState<Sort>('outlier');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<'ativas' | 'todas' | ItemMark['status']>('ativas');
  const [platform, setPlatform] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<false | { draft?: { data: Competitor; body: string }; error?: unknown }>(false);
  const [pulling, setPulling] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<CollectResult[] | null>(null);
  const [pullError, setPullError] = useState<unknown>(null);
  const [ideaBusy, setIdeaBusy] = useState<string | null>(null);
  const [ideaError, setIdeaError] = useState<unknown>(null);

  useEffect(() => { if (!pulling) return; setElapsed(0); const t = setInterval(() => setElapsed((s) => s + 1), 1000); return () => clearInterval(t); }, [pulling]);

  const d = q.data;
  const series = useMemo(() => groupSnapshots(d?.snapshots ?? []), [d?.snapshots]);
  const profiles = useMemo(() => (d?.data.profiles ?? []).map((p, i) => ({ ...p, key: keyFor(p), series: series.get(keyFor(p)), color: SERIES[i % SERIES.length] })), [d?.data.profiles, series]);
  const rows = useMemo(() => buildRows(profiles.map((p) => p.series).filter(Boolean) as NonNullable<(typeof profiles)[number]['series']>[], d?.marks ?? {}, (k) => k.split('-')[0]), [profiles, d?.marks]);

  // marcar (★, status, tags, nota) é otimista: muda na hora; erro → volta e avisa
  const mark = { mutate: ({ mk, patch }: { mk: string; patch: Partial<ItemMark> }) => { actions.mark(id, mk, patch).catch(() => {}); } };

  if (q.isLoading) return <div className="p-8"><div className="h-48 rounded-xl bg-card border border-border animate-pulse" /><div className="mt-4 h-24 rounded-xl bg-card border border-border animate-pulse" /></div>;
  if (q.error || !d) return <div className="p-8"><Link to={`/p/${slug}/concorrentes`} className="text-sm text-muted-foreground">← Concorrentes</Link><ErrorBox error={q.error ?? new Error('não encontrado')} /></div>;

  const c = d.data;
  const sel = profiles.find((p) => p.key === tab);
  const scope = sel ? [sel] : profiles;
  const look = sel ?? profiles.find((p) => p.series?.latest?.data.profile.bannerLocal || p.series?.latest?.data.profile.banner) ?? profiles[0];
  const lookAvatar = sel ?? profiles.find((p) => p.series?.latest?.data.profile.avatarLocal) ?? profiles.find((p) => p.series?.latest?.data.profile.avatar);
  const lp = look?.series?.latest?.data.profile;
  const ap = lookAvatar?.series?.latest?.data.profile;
  const bio = (sel ? sel.series?.latest?.data.profile.bio : profiles.map((p) => p.series?.latest?.data.profile.bio).find(Boolean)) ?? null;
  const media = (local?: string) => api.mediaUrl(slug, id, local);

  // números do escopo
  const scopeRows = rows.filter((r) => scope.some((p) => p.key === r.profileKey));
  // soma só dos perfis que têm seguidores; o delta só entra quando todos eles têm coleta anterior
  const withF = scope.filter((p) => p.series?.latest?.data.profile.followers != null);
  const fTotal = withF.length ? withF.reduce((n, p) => n + p.series!.latest!.data.profile.followers!, 0) : undefined;
  const prevF = withF.map((p) => p.series!.all.slice(0, -1).reverse().find((s) => s.data.profile.followers != null)?.data.profile.followers);
  const fDelta = fTotal != null && prevF.every((x) => x != null) ? fTotal - (prevF as number[]).reduce((a, b) => a + b, 0) : undefined;
  const medViews = median(scopeRows.map((r) => r.item.metrics.views).filter((v): v is number => !!v));
  const hot = scopeRows.filter((r) => (r.outlier ?? 0) >= 3).length;
  const lastAt = scope.map((p) => p.series?.latest?.data.collectedAt).filter(Boolean).sort().at(-1);
  const nSnaps = scope.reduce((n, p) => n + (p.series?.all.length ?? 0), 0);

  const types = [...new Set(scopeRows.map((r) => r.item.type))];
  const filtered = scopeRows.filter((r) => {
    const st = r.mark?.status ?? 'nova';
    if (status === 'ativas' ? st === 'descartada' : status !== 'todas' && st !== status) return false;
    if (type && r.item.type !== type) return false;
    if (platform && r.platform !== platform) return false;
    if (favOnly && !r.mark?.favorite) return false;
    if (search && !`${r.item.title ?? ''} ${r.item.caption ?? ''} ${r.mark?.note ?? ''} ${(r.mark?.tags ?? []).join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort(sortFn[sort]);

  const chart: FollowerSeries[] = scope.flatMap((p) => {
    const pts = (p.series?.all ?? []).filter((s) => s.data.profile.followers != null).map((s) => ({ at: s.data.collectedAt, v: s.data.profile.followers! }));
    return pts.length ? [{ key: p.key, label: `${platformLabel(p.platform)} · ${handleOf(p)}`, platform: p.platform, color: p.color, points: pts }] : [];
  });

  const siteLinks = scope.flatMap((p) => (p.platform === 'site' ? p.series?.latest?.data.profile.links ?? [] : []));
  const missingLinks = [...new Set(siteLinks)].filter((l) => !c.profiles.some((p) => p.url.replace(/\/$/, '').toLowerCase() === l.replace(/\/$/, '').toLowerCase()));

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
  async function makeIdea(r: Row, title = titleOf(r).slice(0, 120), tags = r.mark?.tags ?? [], note = r.mark?.note ?? '') {
    setIdeaBusy(r.mk); setIdeaError(null);
    try {
      const prof = profiles.find((p) => p.key === r.profileKey);
      const m = r.item.metrics;
      const body = [
        `Referência: [${titleOf(r).replace(/[[\]]/g, '')}](${r.item.url}) — ${c.name} (${platformLabel(r.platform)} ${prof ? handleOf(prof) : ''}), ${TYPE_LABEL[r.item.type]?.toLowerCase() ?? r.item.type}${r.item.publishedAt ? ` publicado em ${new Date(r.item.publishedAt).toLocaleDateString('pt-BR')}` : ''}.`,
        '',
        '| métrica | valor |', '|---|---|',
        `| views | ${m.views?.toLocaleString('pt-BR') ?? '—'} |`,
        `| curtidas | ${m.likes?.toLocaleString('pt-BR') ?? '—'} |`,
        `| comentários | ${m.comments?.toLocaleString('pt-BR') ?? '—'} |`,
        `| outlier | ${fmtRatio(r.outlier)} a mediana do perfil |`,
        `| engajamento | ${fmtPct(r.engagement)} |`,
        '',
        ...(r.item.caption ? ['## Legenda original', '', `> ${r.item.caption.slice(0, 600).replace(/\n/g, '\n> ')}`, ''] : []),
        '## Observações do Oliver', '', note, '',
      ].join('\n');
      // otimista: a ideia entra no banco e o item já aparece como "virou ideia" (id previsto);
      // o servidor cria a ideia e só então grava a marcação com o id real (sem marcação órfã se falhar)
      const ideasKey = qk.ideas(slug);
      const tempId = nextSeqId('I', (qc.getQueryData<Doc<Idea>[]>(ideasKey) ?? []).map((i) => i.data.id)) as Idea['id'];
      const data = { title, status: 'nova', source: { competitor: id, platform: r.platform as never, itemId: r.item.id, url: r.item.url }, tags } as Partial<Idea> & { title: string };
      const opt: Doc<Idea> = { data: { ...data, id: tempId, created: new Date().toISOString().slice(0, 10) } as Idea, body, file: '' };
      const markPatch = (ideaId: string) => ({ ideaId, status: 'analisada' as const, tags });
      setIdeaBusy(null);
      await runOptimistic(qc, {
        mutationFn: async () => {
          const p = api.createIdea(slug, data, body);
          trackCreate('idea', slug, tempId, p.then((x) => x.data.id));
          const idea = await p;
          const m = await api.setMark(slug, id, r.mk, markPatch(idea.data.id));
          return { idea, m };
        },
        apply: () => [
          [ideasKey, (old: Doc<Idea>[] | undefined) => (old ? upsertDoc(old, opt) : old)],
          [key, (old: CompetitorFull | undefined) => old && { ...old, marks: { ...old.marks, [r.mk]: { ...({ status: 'nova', favorite: false, tags: [], note: '' } as Partial<ItemMark>), ...old.marks[r.mk], ...markPatch(tempId), updated: new Date().toISOString() } } }],
        ],
        onSuccess: ({ idea, m }) => {
          qc.setQueryData<Doc<Idea>[]>(ideasKey, (old) => (old ? upsertDoc(old, idea, tempId) : old));
          qc.setQueryData<CompetitorFull>(key, (old) => old && { ...old, marks: { ...old.marks, [r.mk]: m } });
        },
        invalidate: () => [ideasKey, key],
        okMessage: `Ideia ${tempId} criada`,
        errorMessage: 'Não foi possível criar a ideia',
      }, undefined);
    } catch (e) { setIdeaError(e); } finally { setIdeaBusy(null); }
  }

  const openRow = rows.find((r) => r.mk === open) ?? null;
  const allTagSuggestions = [...new Set([...(projectTags.data?.tags ?? []).map((t) => t.id), ...Object.values(d.marks).flatMap((m) => m.tags)])];

  return (
    <div className="max-w-[1400px] pb-16">
      {/* capa */}
      <div className="relative h-44 bg-gradient-to-r from-primary/25 via-primary-soft to-muted overflow-hidden">
        {lp && <Img local={media(lp.bannerLocal)} remote={lp.banner} className="absolute inset-0 w-full h-full object-cover" fallback={<span />} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <Link to={`/p/${slug}/concorrentes`} className="absolute top-4 left-6 text-xs font-medium bg-card/90 backdrop-blur px-2.5 py-1 rounded-md hover:bg-card">← Concorrentes</Link>
      </div>

      <div className="px-8">
        <div className="flex items-end gap-5 -mt-12 relative">
          <Avatar name={c.name} size={104} local={media(ap?.avatarLocal)} remote={ap?.avatar} className="ring-4 shadow-md" />
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight truncate">{c.name}</h1>
              <Star on={c.favorite} onClick={toggleFav} />
              <Badge color={KIND_COLOR[c.kind]}>{KINDS[c.kind]}</Badge>
              {c.status !== 'ativo' && <Badge color={c.status === 'candidato' ? '#d97706' : undefined}>{c.status}</Badge>}
              {c.market && <Badge color={MARKET[c.market].color}>{MARKET[c.market].label}</Badge>}
              {c.tags.map((t) => <span key={t} className="text-xs text-muted-foreground">#{t}</span>)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {lastAt ? <>Última coleta {timeAgo(lastAt)} ({fmtDateTime(lastAt)}) · {nSnaps} coleta(s) no histórico</> : 'Ainda não puxado'}
            </div>
          </div>
          <div className="flex gap-2 pb-1">
            <Button variant="ghost" onClick={() => setEditing({})}>Editar</Button>
            <Button onClick={pull} disabled={pulling || !c.profiles.length} title="Grava uma coleta nova de cada perfil (as antigas ficam)">
              {pulling ? <><Spinner /> Puxando… {elapsed}s</> : '↻ Puxar agora'}
            </Button>
          </div>
        </div>

        {(() => { const one = (analysis.data?.results.resumo?.data as { oneLiner?: string } | undefined)?.oneLiner; return one ? <p className="mt-4 text-[15px] font-medium max-w-3xl">{one}</p> : null; })()}
        {bio && <p className="mt-2 text-sm whitespace-pre-line max-w-3xl text-foreground/90 line-clamp-4">{bio}</p>}

        <div className="mt-6 flex gap-1 border-b border-border">
          {([['analise', 'Análise'], ['redes', 'Redes e conteúdos']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setView(k)} className={cx('px-4 py-2.5 text-sm border-b-2 -mb-px', view === k ? 'border-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {label}{k === 'analise' && analysis.data?.request && <span className="ml-1.5 text-[10px] text-violet-600">● fila</span>}
            </button>
          ))}
        </div>

        {view === 'analise' && <AnalysisPanel slug={slug} c={c} onCollect={pull} collecting={pulling} />}
        {view === 'redes' && <>

        {/* resultado da coleta */}
        {pulling && <div className="mt-4 text-sm text-muted-foreground bg-card border border-border rounded-lg p-3"><Spinner /> Coletando {c.profiles.length} perfil(is). YouTube com detalhes de cada vídeo pode levar 1–2 minutos…</div>}
        {pullError ? <ErrorBox error={pullError} /> : null}
        {results && (
          <div className={cx('mt-4 border rounded-lg p-3 bg-card', results.every((r) => r.ok) ? 'border-green-200' : 'border-amber-200')}>
            <div className="flex items-center justify-between text-sm font-medium mb-1">
              <span>{results.filter((r) => r.ok).length} de {results.length} perfil(is) coletado(s)</span>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setResults(null)} aria-label="Fechar">×</button>
            </div>
            {results.map((r) => <ResultLine key={r.key} r={r} />)}
          </div>
        )}

        {/* abas por perfil */}
        <div className="mt-4 flex gap-1 border-b border-border overflow-x-auto">
          {[{ key: 'all' } as const, ...profiles].map((p) => {
            const active = tab === p.key;
            const isAll = p.key === 'all';
            const pf = !isAll ? (p as (typeof profiles)[number]) : null;
            const f = pf?.series?.latest?.data.profile.followers;
            return (
              <button key={p.key} onClick={() => setTab(p.key)}
                className={cx('px-3 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px flex items-center gap-2', active ? 'border-primary text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                {isAll ? <>Todos <span className="text-xs text-muted-foreground">{rows.length}</span></> : <>
                  <PlatformIcon platform={pf!.platform} size={15} />
                  {handleOf(pf!)}
                  {f != null && <span className="text-xs text-muted-foreground tabular-nums">{fmtNum(f)}</span>}
                  {!pf!.series && <span className="text-[10px] text-warning">não puxado</span>}
                </>}
              </button>
            );
          })}
        </div>

        {sel && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <a href={sel.url} target="_blank" rel="noreferrer" className="text-primary-ink">{sel.url} ↗</a>
            {sel.series?.latest && <span>via {sel.series.latest.data.source}</span>}
            {sel.series?.latest?.data.profile.links.filter((l) => !siteLinks.includes(l)).map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="hover:text-primary-ink">🔗 {l.replace(/^https?:\/\//, '')}</a>)}
            {sel.series?.latest?.data.errors.map((e) => <span key={e} className="text-warning">⚠ {e}</span>)}
          </div>
        )}

        {/* números */}
        {sel?.platform !== 'site' && <div className="mt-5 grid gap-3 grid-cols-2 md:grid-cols-5">
          <Stat label={sel ? 'Seguidores' : 'Seguidores (soma)'} value={fmtNum(fTotal)} sub={fDelta ? <span className={fDelta > 0 ? 'text-success' : 'text-destructive'}>{fmtDelta(fDelta)} vs coleta anterior</span> : undefined} />
          <Stat label="Conteúdos na última coleta" value={fmtNum(scopeRows.length)} sub={types.map((t) => `${scopeRows.filter((r) => r.item.type === t).length} ${TYPE_LABEL[t]?.toLowerCase()}`).join(' · ')} />
          <Stat label="Mediana de views" value={fmtNum(medViews)} sub="base do outlier" />
          <Stat label="Fora da curva (≥ 3×)" value={String(hot)} sub={hot ? 'destacados em amarelo' : 'nenhum por enquanto'} accent={hot > 0} />
          <Stat label="Marcados" value={String(scopeRows.filter((r) => r.mark && (r.mark.favorite || r.mark.status !== 'nova')).length)} sub={`${scopeRows.filter((r) => r.mark?.ideaId).length} viraram ideia`} />
        </div>}

        {chart.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold mb-2">Seguidores por coleta</h2>
            <FollowersChart series={chart} />
          </section>
        )}

        {missingLinks.length > 0 && (
          <div className="mt-5 bg-card border border-border rounded-lg p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Redes encontradas no site</div>
            <div className="flex flex-wrap gap-2">
              {missingLinks.map((l) => (
                <button key={l} onClick={() => addLink(l)} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border hover:border-primary hover:text-primary-ink text-xs">
                  + {l.replace(/^https?:\/\/(www\.)?/, '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* conteúdos */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h2 className="text-base font-semibold mr-2">Conteúdos</h2>
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar">
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            {types.length > 1 && <Chips value={type} onChange={setType} options={[{ value: '', label: 'Todos' }, ...types.map((t) => ({ value: t, label: TYPE_LABEL[t] ?? t, count: scopeRows.filter((r) => r.item.type === t).length }))]} />}
            {!sel && new Set(rows.map((r) => r.platform)).size > 1 && (
              <Select value={platform} onChange={(e) => setPlatform(e.target.value)} aria-label="Plataforma">
                <option value="">Todas as plataformas</option>
                {[...new Set(rows.map((r) => r.platform))].map((p) => <option key={p} value={p}>{platformLabel(p)}</option>)}
              </Select>
            )}
            <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status">
              <option value="ativas">Sem descartadas</option>
              <option value="todas">Todos os status</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <button onClick={() => setFavOnly(!favOnly)} className={cx('px-2.5 py-1.5 rounded-md text-sm border', favOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-border text-muted-foreground hover:text-foreground')}>★ Favoritos</button>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no título, legenda, nota…" className="ml-auto w-64" />
          </div>
          <ErrorBox error={ideaError} />

          {!c.profiles.length && <Empty title="Sem perfis" hint="Adicione links em Editar." action={<Button onClick={() => setEditing({})}>Editar</Button>} />}
          {c.profiles.length > 0 && !rows.length && (
            <Empty title={series.size ? 'Nenhum conteúdo coletado' : 'Ainda não puxado'}
              hint={series.size ? 'Sites trazem só o perfil. Confira os avisos da última coleta.' : 'Clique em “Puxar agora” para trazer perfil, vídeos e métricas.'}
              action={!series.size ? <Button onClick={pull} disabled={pulling}>↻ Puxar agora</Button> : undefined} />
          )}
          {rows.length > 0 && !filtered.length && scopeRows.length > 0 && <Empty title="Nada com esses filtros" />}
          {sel && rows.length > 0 && !scopeRows.length && sel.platform === 'site' && <Empty title="Site não tem lista de conteúdos" hint="A coleta do site traz título, descrição, imagem de capa, ícone e as redes linkadas." />}

          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {filtered.map((r) => (
              <ItemCard key={`${r.profileKey}/${r.item.id}`} r={r} slug={slug} media={media(r.item.thumbnailLocal)} showPlatform={!sel}
                ideaBusy={ideaBusy === r.mk}
                onMark={(patch) => mark.mutate({ mk: r.mk, patch })} onIdea={() => makeIdea(r)} onOpen={() => setOpen(r.mk)} />
            ))}
          </div>
          {filtered.length > 0 && <div className="text-xs text-muted-foreground mt-4">{filtered.length} de {scopeRows.length} conteúdos · outlier = views ÷ mediana de views do mesmo perfil na última coleta (sem views: curtidas ♥)</div>}
        </section>
        </>}
      </div>

      <ItemDrawer r={openRow} open={!!openRow} onClose={() => setOpen(null)} slug={slug} media={media(openRow?.item.thumbnailLocal)}
        profileLabel={openRow ? handleOf(profiles.find((p) => p.key === openRow.profileKey) ?? { platform: openRow.platform, url: '' }) : ''}
        tagSuggestions={allTagSuggestions} ideaBusy={!!openRow && ideaBusy === openRow.mk}
        onMark={(patch) => openRow && mark.mutate({ mk: openRow.mk, patch })}
        onIdea={(title, tags, note) => openRow && makeIdea(openRow, title, tags, note)} />
      {editing && <EditCompetitor key={editing.error ? 'erro' : 'ok'} slug={slug} open onClose={() => setEditing(false)} onFailed={(draft, error) => setEditing({ draft, error })}
        data={editing.draft?.data ?? c} body={editing.draft?.body ?? d.body} initialError={editing.error} snapshotsCount={d.snapshotsTotal} />}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cx('bg-card border rounded-xl px-4 py-3', accent ? 'border-amber-300' : 'border-border')}>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xl font-semibold tabular-nums mt-0.5">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </div>
  );
}
