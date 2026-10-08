// Conteúdos: feed único com o que todos os concorrentes publicaram (última coleta de cada perfil), ranqueado por
// fora da curva, views, engajamento ou data. Marcar, favoritar e "Virar ideia" aqui mesmo.
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type ItemMark } from '../../api';
import { qk, useCompetitorsFeed, useTags } from '../../queries';
import { AreaPage, FillBox, StatStrip, useMarket } from '../../components/competitors/area';
import { ItemCard, ItemDrawer } from '../../components/competitors/Items';
import { Chips, PlatformIcon, STATUS_LABEL, TYPE_LABEL, buildRows, fmtPct, groupSnapshots, median, platformLabel, type Row } from '../../components/competitors/lib';
import { useCompetitorActions } from '../../components/competitors/useCompetitorActions';
import { useMakeIdea } from '../../components/competitors/useMakeIdea';
import { Empty, ErrorBox, Input, Select, cx, fmtNum } from '../../components/kit';
import { Clapperboard, Eye, Flame, Heart, Trophy } from 'lucide-react';

type FeedRow = Row & { compId: string; compName: string };
type Sort = 'outlier' | 'views' | 'engagement' | 'recent';
const SORTS: Record<Sort, string> = { outlier: 'Fora da curva', views: 'Mais views', engagement: 'Engajamento', recent: 'Mais recentes' };
const PERIODS = { '7': '7 dias', '30': '30 dias', '90': '90 dias', '': 'Tudo' } as const;

export default function Conteudos() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const feed = useCompetitorsFeed(slug);
  const m = useMarket(slug);
  const tags = useTags(slug);
  const actions = useCompetitorActions(slug);
  const idea = useMakeIdea(slug);
  const [platform, setPlatform] = useState('');
  const [type, setType] = useState('');
  const [comp, setComp] = useState('');
  const [period, setPeriod] = useState<keyof typeof PERIODS>('30');
  const [sort, setSort] = useState<Sort>('outlier');
  const [status, setStatus] = useState<'ativas' | 'todas' | ItemMark['status']>('ativas');
  const [favOnly, setFavOnly] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const names = useMemo(() => new Map(m.rows.map((r) => [r.c.data.id, r.c.data.name])), [m.rows]);
  const rows = useMemo<FeedRow[]>(() => (feed.data ?? []).flatMap((f) =>
    buildRows([...groupSnapshots(f.snapshots).values()], f.marks, (k) => k.split('-')[0]).map((r) => ({ ...r, compId: f.id, compName: names.get(f.id) ?? f.id }))), [feed.data, names]);

  const since = period ? Date.now() - Number(period) * 86_400_000 : 0;
  const shown = rows.filter((r) => {
    const st = r.mark?.status ?? 'nova';
    if (status === 'ativas' ? st === 'descartada' : status !== 'todas' && st !== status) return false;
    if (platform && r.platform !== platform) return false;
    if (type && r.item.type !== type) return false;
    if (comp && r.compId !== comp) return false;
    if (since && (!r.item.publishedAt || Date.parse(r.item.publishedAt) < since)) return false;
    if (favOnly && !r.mark?.favorite) return false;
    if (q && !`${r.item.title ?? ''} ${r.item.caption ?? ''} ${r.compName}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => sort === 'recent' ? (b.item.publishedAt ?? '').localeCompare(a.item.publishedAt ?? '')
    : sort === 'views' ? (b.item.metrics.views ?? -1) - (a.item.metrics.views ?? -1)
    : sort === 'engagement' ? (b.engagement ?? -1) - (a.engagement ?? -1)
    : (b.outlier ?? -1) - (a.outlier ?? -1));

  const platforms = [...new Set(rows.map((r) => r.platform))];
  const types = [...new Set(rows.map((r) => r.item.type))];
  const byType = types.map((t) => ({ t, n: shown.filter((r) => r.item.type === t).length, med: median(shown.filter((r) => r.item.type === t).map((r) => r.item.metrics.views).filter((v): v is number => !!v)) })).filter((x) => x.n);
  const bestType = [...byType].sort((a, b) => (b.med ?? 0) - (a.med ?? 0))[0];
  const mark = (r: FeedRow, patch: Partial<ItemMark>) => { actions.mark(r.compId, r.mk, patch).catch(() => {}).finally(() => qc.invalidateQueries({ queryKey: qk.competitorsFeed(slug) })); };
  const openRow = shown.find((r) => `${r.compId}/${r.mk}` === open) ?? null;
  const tagSuggestions = (tags.data?.tags ?? []).map((t) => t.id);

  return (
    <AreaPage>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Chips value={period} onChange={setPeriod} options={Object.entries(PERIODS).map(([value, label]) => ({ value: value as keyof typeof PERIODS, label }))} />
        {platforms.length > 1 && <Chips value={platform} onChange={setPlatform} options={[{ value: '', label: 'Todas' }, ...platforms.map((p) => ({ value: p, label: <span className="inline-flex items-center gap-1"><PlatformIcon platform={p} size={12} />{platformLabel(p)}</span>, count: rows.filter((r) => r.platform === p).length }))]} />}
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Formato">
          <option value="">Todos os formatos</option>
          {types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t] ?? t}</option>)}
        </Select>
        <Select value={comp} onChange={(e) => setComp(e.target.value)} aria-label="Concorrente">
          <option value="">Todos os concorrentes</option>
          {[...new Set(rows.map((r) => r.compId))].map((id) => <option key={id} value={id}>{names.get(id) ?? id}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar">{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status">
          <option value="ativas">Sem descartadas</option><option value="todas">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <button onClick={() => setFavOnly(!favOnly)} className={cx('px-2.5 py-1.5 rounded-md text-sm border', favOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-border text-muted-foreground hover:text-foreground')}>★</button>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar legenda, título, concorrente…" className="ml-auto w-64" />
      </div>

      {shown.length > 0 && <div className="mb-4"><StatStrip items={[
        { icon: Clapperboard, label: 'Conteúdos', value: fmtNum(shown.length), sub: `de ${[...new Set(shown.map((r) => r.compId))].length} concorrente(s)` },
        { icon: Eye, label: 'Mediana de views', value: fmtNum(median(shown.map((r) => r.item.metrics.views).filter((v): v is number => !!v)) && Math.round(median(shown.map((r) => r.item.metrics.views).filter((v): v is number => !!v))!)) },
        { icon: Heart, label: 'Engajamento (mediana)', value: fmtPct(median(shown.map((r) => r.engagement).filter((v): v is number => v != null))), title: '(curtidas + comentários + envios) ÷ views' },
        { icon: Flame, label: 'Fora da curva ≥3×', value: String(shown.filter((r) => (r.outlier ?? 0) >= 3).length), title: 'fora da curva = views ÷ mediana do próprio perfil na última coleta (sem views: curtidas)' },
        ...(bestType && byType.length > 1 ? [{ icon: Trophy, label: 'Formato que mais rende', value: TYPE_LABEL[bestType.t] ?? bestType.t, sub: `mediana ${fmtNum(bestType.med)} views` }] : []),
      ]} /></div>}

      <ErrorBox error={feed.error ?? idea.error} />
      {feed.isLoading && <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">{[0, 1, 2, 3].map((i) => <div key={i} className="h-80 rounded-xl bg-card border border-border animate-pulse" />)}</div>}
      {feed.data && !rows.length && <Empty title="Nenhum conteúdo coletado" hint="Puxe as redes dos concorrentes (aba Coletas ou a ficha de cada um)." />}
      {rows.length > 0 && !shown.length && <Empty title="Nada com esses filtros" hint={period ? 'Tente um período maior.' : undefined} />}
      {shown.length > 0 && <FillBox><div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {shown.map((r) => (
          <div key={`${r.compId}/${r.mk}`} className="flex flex-col">
            <div className="text-[11px] text-muted-foreground mb-1 truncate">{r.compName}</div>
            <ItemCard r={r} slug={slug} media={api.mediaUrl(slug, r.compId, r.item.thumbnailLocal)} showPlatform ideaBusy={idea.busy === r.mk}
              onMark={(patch) => mark(r, patch)} onIdea={() => idea.make({ id: r.compId, name: r.compName }, '', r)} onOpen={() => setOpen(`${r.compId}/${r.mk}`)} />
          </div>
        ))}
      </div></FillBox>}

      <ItemDrawer r={openRow} open={!!openRow} onClose={() => setOpen(null)} slug={slug} media={api.mediaUrl(slug, openRow?.compId ?? '', openRow?.item.thumbnailLocal)}
        profileLabel={openRow?.compName ?? ''} tagSuggestions={tagSuggestions} ideaBusy={!!openRow && idea.busy === openRow.mk}
        onMark={(patch) => openRow && mark(openRow, patch)}
        onIdea={(title, tg, note) => openRow && idea.make({ id: openRow.compId, name: openRow.compName }, '', openRow, title, tg, note)} />
    </AreaPage>
  );
}
