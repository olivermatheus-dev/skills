// Concorrentes e referências: cards com avatar, seguidores por plataforma (Δ vs coleta anterior), filtros e "Puxar todos".
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CollectResult, type Competitor, type CompetitorSummary, type Doc } from '../api';
import { Badge, Button, Empty, ErrorBox, Input, PageHeader, Select, cx, fmtNum } from '../components/ui';
import AddLinksModal, { ResultLine } from '../components/competitors/AddLinksModal';
import { Avatar, Chips, Img, KINDS, KIND_COLOR, PlatformIcon, Spinner, Star, fmtDelta, keyFor, platformLabel, timeAgo } from '../components/competitors/lib';

type KindFilter = 'todos' | Competitor['kind'];

export default function Competitors() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['competitors', slug], queryFn: () => api.competitors(slug) });
  const summary = useQuery({ queryKey: ['competitors-summary', slug], queryFn: () => api.competitorsSummary(slug) });
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<KindFilter>('todos');
  const [platform, setPlatform] = useState('');
  const [tag, setTag] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [archived, setArchived] = useState(false);
  const [pulling, setPulling] = useState<{ i: number; n: number; name: string } | null>(null);
  const [pullLog, setPullLog] = useState<{ id: string; name: string; results: CollectResult[] }[] | null>(null);
  const [pullingOne, setPullingOne] = useState<string | null>(null);

  const sum = useMemo(() => new Map((summary.data ?? []).map((s) => [s.id, s])), [summary.data]);
  const all = list.data ?? [];
  const allTags = [...new Set(all.flatMap((c) => c.data.tags))].sort();
  const allPlatforms = [...new Set(all.flatMap((c) => c.data.profiles.map((p) => p.platform)))];
  const counts = (k: KindFilter) => all.filter((c) => c.data.status === (archived ? 'arquivado' : 'ativo') && (k === 'todos' || c.data.kind === k)).length;

  const shown = all.filter((c) => {
    const d = c.data;
    if ((d.status === 'arquivado') !== archived) return false;
    if (kind !== 'todos' && d.kind !== kind) return false;
    if (platform && !d.profiles.some((p) => p.platform === platform)) return false;
    if (tag && !d.tags.includes(tag)) return false;
    if (favOnly && !d.favorite) return false;
    if (q && !`${d.name} ${d.profiles.map((p) => p.handle ?? p.url).join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => Number(b.data.favorite) - Number(a.data.favorite) || a.data.name.localeCompare(b.data.name, 'pt-BR'));

  const fav = useMutation({
    mutationFn: (c: Doc<Competitor>) => api.saveCompetitor(slug, c.data.id, { ...c.data, favorite: !c.data.favorite }, c.body),
    onMutate: (c) => qc.setQueryData<Doc<Competitor>[]>(['competitors', slug], (old) => old?.map((x) => (x.data.id === c.data.id ? { ...x, data: { ...x.data, favorite: !x.data.favorite } } : x))),
    onSettled: () => qc.invalidateQueries({ queryKey: ['competitors', slug] }),
  });

  const refresh = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['competitors-summary', slug] });
    if (id) qc.invalidateQueries({ queryKey: ['competitor', slug, id] });
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
          <Button onClick={() => setAdding(true)}>+ Adicionar</Button>
        </>}
      />

      {pulling && (
        <div className="mb-5 bg-surface border border-border rounded-xl p-3">
          <div className="flex justify-between text-sm mb-2"><span>Puxando <b>{pulling.name}</b>…</span><span className="text-muted tabular-nums">{pulling.i} de {pulling.n}</span></div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: `${((pulling.i - 0.5) / pulling.n) * 100}%` }} /></div>
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
          <button onClick={() => setFavOnly(!favOnly)} className={cx('px-2.5 py-1.5 rounded-md text-sm border', favOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-border text-muted hover:text-text')}>★ Favoritos</button>
          <button onClick={() => setArchived(!archived)} className={cx('px-2.5 py-1.5 rounded-md text-sm border ml-auto', archived ? 'border-accent text-accent bg-accent-soft' : 'border-border text-muted hover:text-text')}>Arquivados</button>
        </div>
      )}

      <ErrorBox error={list.error ?? summary.error} />
      {list.isLoading && <SkeletonGrid />}
      {list.data && all.length === 0 && (
        <Empty title="Nenhum concorrente ainda" hint="Cole os links de perfis (YouTube, Instagram, TikTok, site) de concorrentes, criadores e páginas de referência."
          action={<Button onClick={() => setAdding(true)}>+ Adicionar o primeiro</Button>} />
      )}
      {list.data && all.length > 0 && shown.length === 0 && <Empty title="Nada com esses filtros" hint="Limpe a busca ou troque os filtros." />}

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {shown.map((c) => (
          <CompetitorCard key={c.data.id} slug={slug} c={c} s={sum.get(c.data.id)} loadingSummary={summary.isLoading}
            onFav={() => fav.mutate(c)} onPull={() => pullOne(c)} pulling={pullingOne === c.data.id || pulling?.name === c.data.name} />
        ))}
      </div>

      <AddLinksModal slug={slug} open={adding} onClose={() => setAdding(false)} competitors={all} />
    </div>
  );
}

function CompetitorCard({ slug, c, s, onFav, onPull, pulling, loadingSummary }: {
  slug: string; c: Doc<Competitor>; s?: CompetitorSummary; onFav: () => void; onPull: () => void; pulling: boolean; loadingSummary: boolean;
}) {
  const d = c.data;
  const profs = s?.profiles ?? [];
  const withAvatar = profs.find((p) => p.latest?.profile.avatarLocal) ?? profs.find((p) => p.latest?.profile.avatar);
  const withBanner = profs.find((p) => p.latest?.profile.bannerLocal) ?? profs.find((p) => p.latest?.profile.banner);
  const items = profs.reduce((n, p) => n + (p.latest?.items ?? 0), 0);
  const hadErrors = profs.some((p) => p.latest?.errors.length);
  return (
    <Link to={`/p/${slug}/concorrentes/${d.id}`} className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition flex flex-col">
      <div className="h-16 relative bg-gradient-to-r from-indigo-100 via-violet-50 to-sky-100">
        {withBanner && <Img local={api.mediaUrl(slug, d.id, withBanner.latest?.profile.bannerLocal)} remote={withBanner.latest?.profile.banner} className="absolute inset-0 w-full h-full object-cover" fallback={<span />} />}
        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur rounded-full w-7 h-7 grid place-items-center shadow-sm"><Star on={d.favorite} onClick={onFav} size="text-base" /></div>
      </div>
      <div className="px-4 pb-4 -mt-6 flex-1 flex flex-col">
        <div className="flex items-end gap-3">
          <Avatar name={d.name} size={52} local={api.mediaUrl(slug, d.id, withAvatar?.latest?.profile.avatarLocal)} remote={withAvatar?.latest?.profile.avatar} />
          <div className="min-w-0 pb-0.5 flex-1">
            <div className="font-semibold truncate group-hover:text-accent">{d.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <Badge color={KIND_COLOR[d.kind]}>{KINDS[d.kind]}</Badge>
          {d.tags.map((t) => <span key={t} className="text-xs text-muted">#{t}</span>)}
        </div>

        <div className="mt-3 space-y-1.5 flex-1">
          {d.profiles.length === 0 && <div className="text-sm text-muted">Sem perfis. Abra para adicionar links.</div>}
          {d.profiles.map((p) => {
            const ps = profs.find((x) => x.key === keyFor(p));
            const f = ps?.latest?.profile.followers;
            const delta = f != null && ps?.prevFollowers != null ? f - ps.prevFollowers : undefined;
            const handle = p.handle ? (p.platform === 'site' ? p.handle : `@${p.handle}`) : p.externalId ?? p.url.replace(/^https?:\/\//, '');
            return (
              <div key={`${p.platform}-${p.url}`} className="flex items-center gap-2 text-sm">
                <PlatformIcon platform={p.platform} size={15} />
                <span className="truncate text-muted flex-1 min-w-0">{handle}</span>
                {f != null ? (
                  <span className="tabular-nums font-medium">{fmtNum(f)}</span>
                ) : <span className="text-xs text-muted">{ps?.latest ? (p.platform === 'site' ? 'site' : '—') : loadingSummary ? '' : 'não puxado'}</span>}
                {delta != null && delta !== 0 && <span className={cx('text-xs tabular-nums w-14 text-right', delta > 0 ? 'text-ok' : 'text-danger')}>{delta > 0 ? '▲' : '▼'} {fmtDelta(delta)!.slice(1)}</span>}
                {(delta == null || delta === 0) && <span className="w-14" />}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted">
          <span title={s?.lastCollected ? new Date(s.lastCollected).toLocaleString('pt-BR') : undefined}>
            {s?.lastCollected ? `Puxado ${timeAgo(s.lastCollected)}` : 'Nunca puxado'}
          </span>
          {items > 0 && <span>· {fmtNum(items)} itens</span>}
          {hadErrors && <span className="text-warn" title="A última coleta teve avisos">· ⚠</span>}
          <button className="ml-auto px-2 py-1 rounded-md border border-border hover:bg-surface-2 text-text disabled:opacity-50" disabled={pulling || !d.profiles.length}
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
    <div className={cx('mb-5 border rounded-xl p-3 bg-surface', okN === total ? 'border-green-200' : 'border-amber-200')}>
      <div className="flex items-center gap-3 text-sm">
        <span className={okN === total ? 'text-ok' : 'text-warn'}>{okN === total ? '✓' : '⚠'}</span>
        <span><b>{okN}</b> de {total} perfil(is) coletado(s){okN < total ? ' — veja os erros' : ''}</span>
        <button className="text-accent text-xs" onClick={() => setOpen(!open)}>{open ? 'ocultar' : 'detalhes'}</button>
        <button className="ml-auto text-muted hover:text-text" onClick={onClose} aria-label="Fechar">×</button>
      </div>
      {open && (
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {log.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-2.5">
              <Link to={`/p/${slug}/concorrentes/${c.id}`} className="font-medium text-sm hover:text-accent">{c.name}</Link>
              {c.results.length === 0 && <div className="text-xs text-muted">sem perfis</div>}
              {c.results.map((r) => <ResultLine key={r.key} r={r} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SkeletonGrid = () => (
  <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
    {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-surface border border-border animate-pulse" />)}
  </div>
);
