// Lista de conteúdos dos concorrentes (barra de filtros + grade de cards ou tabela), igual na aba Conteúdos e na ficha.
// Filtros, ordenação e vista ficam na URL (?vista=tabela&ordem=mercado). Quem usa só entrega as linhas e as ações.
import { useDeferredValue, useMemo, type ReactNode } from 'react';
import { ArrowUpDown, CalendarDays, Clapperboard, Film, GalleryHorizontal, Image as ImageIcon, LayoutDashboard, LayoutGrid, ListFilter, Radio, Shapes, Share2, Table as TableIcon, Users, Video } from 'lucide-react';
import type { ItemMark } from '../../api';
import { Empty, SelectField, cx, fmtDate, fmtNum, type SelectOption } from '../kit';
import { FillBox } from '../fill';
import { Avatar, PlatformIcon, STATUS_COLOR, STATUS_LABEL, TYPE_LABEL, fmtPct, platformLabel, timeAgo, type Row } from './lib';
import { FavStar, ItemCard, RatioCell, Thumb, mercadoTip, mercadoVazioTip, perfilTip, porSeguidorTip, titleOf } from './Items';
import ContentsPanel from './ContentsPanel';
import { DataTable, FavToggle, FilterBar, ViewToggle, parseSort, sortRows, useUrlState, type BarFilter, type Col, type SortDef } from './toolbar';

export type CRow = Row & { compId?: string; compName?: string };
export interface Owner { name: string; local?: string; remote?: string | null }

const PERIODS: SelectOption[] = [{ value: '7', label: '7 dias' }, { value: '30', label: '30 dias' }, { value: '90', label: '90 dias' }, { value: 'tudo', label: 'Tudo' }];
const FORMAT_ICON: Record<string, ReactNode> = { video: <Video />, short: <Film />, reel: <Film />, post: <ImageIcon />, carrossel: <GalleryHorizontal />, live: <Radio /> };
const STATUS_RANK: Record<string, number> = { nova: 0, marcada: 1, analisada: 2, descartada: 3 };
const dayMs = 86_400_000;

export const rowId = (r: CRow) => `${r.compId ?? ''}|${r.profileKey}|${r.mk}`;

/** definições de ordenação (a tabela usa todas; o "Ordenar" da barra, as marcadas com `bar`) */
const SORTS: Record<string, SortDef<CRow> & { bar?: boolean }> = {
  outlier: { label: 'Fora da curva · × perfil', get: (r) => r.outlier, bar: true },
  mercado: { label: 'Fora da curva · × mercado', get: (r) => r.outlierMercado, bar: true },
  porSeguidor: { label: 'Alcance por seguidor', get: (r) => r.porSeguidor, bar: true },
  porSeguidorMercado: { label: 'Por seguidor × mercado', get: (r) => r.porSeguidorMercado, bar: true },
  views: { label: 'Mais views', get: (r) => r.item.metrics.views, bar: true },
  engagement: { label: 'Engajamento', get: (r) => r.engagement, bar: true },
  recent: { label: 'Mais recentes', get: (r) => (r.item.publishedAt ? Date.parse(r.item.publishedAt) : undefined), bar: true },
  growth: { label: 'Cresceu desde a coleta', get: (r) => r.viewsDelta, bar: true },
  likes: { label: 'Curtidas', get: (r) => r.item.metrics.likes },
  comments: { label: 'Comentários', get: (r) => r.item.metrics.comments },
  shares: { label: 'Envios', get: (r) => r.item.metrics.shares },
  title: { label: 'Título', get: (r) => titleOf(r).toLowerCase(), text: true },
  comp: { label: 'Concorrente', get: (r) => r.compName?.toLowerCase(), text: true },
  platform: { label: 'Rede', get: (r) => r.platform, text: true },
  type: { label: 'Formato', get: (r) => TYPE_LABEL[r.item.type] ?? r.item.type, text: true },
  status: { label: 'Status', get: (r) => STATUS_RANK[r.mark?.status ?? 'nova'] },
};

const DEFAULTS = { q: '', periodo: '30', rede: '', formato: '', conc: '', status: 'ativas', fav: '', vista: 'grade', ordem: 'outlier', asc: '' };
const DEFAULTS_ALL = { ...DEFAULTS, periodo: 'tudo' };

const VIEWS_PANEL = [{ value: 'grade', label: 'Grade', icon: LayoutGrid }, { value: 'tabela', label: 'Tabela', icon: TableIcon }, { value: 'painel', label: 'Painel', icon: LayoutDashboard }];

export default function ContentsView({ rows, slug, owners, showComp, showPlatformFilter = true, defaultAll, panel, fill, stickyTop, mediaOf, ideaBusy, onMark, onIdea, onOpen, summary, searchPlaceholder, stickyClass }: {
  rows: CRow[]; slug: string; owners?: Map<string, Owner>; showComp: boolean; showPlatformFilter?: boolean;
  /** período padrão "Tudo" (ficha) em vez de 30 dias (feed) */
  defaultAll?: boolean; fill: boolean; stickyTop?: number; stickyClass?: string;
  mediaOf: (r: CRow) => string | undefined; ideaBusy: (r: CRow) => boolean;
  onMark: (r: CRow, patch: Partial<ItemMark>) => void; onIdea: (r: CRow) => void; onOpen: (r: CRow, ideia?: boolean) => void;
  /** faixa de números calculada sobre o que passou nos filtros */
  summary?: (shown: CRow[]) => ReactNode; searchPlaceholder?: string;
  /** terceira vista "Painel" (?vista=painel): só na aba Conteúdos da área, conforme o DASHBOARD.md da 038 */
  panel?: boolean;
}) {
  const defaults = defaultAll ? DEFAULTS_ALL : DEFAULTS;
  const { values: v, set, reset } = useUrlState(defaults);
  const q = useDeferredValue(v.q);
  const vista = v.vista === 'painel' && !panel ? 'grade' : v.vista;
  const sort = parseSort(v.ordem in SORTS ? v.ordem : 'outlier', v.asc);

  const shown = useMemo(() => {
    const since = v.periodo === 'tudo' ? 0 : Date.now() - Number(v.periodo) * dayMs;
    const needle = q.toLowerCase();
    const list = rows.filter((r) => {
      const st = r.mark?.status ?? 'nova';
      if (v.status === 'ativas' ? st === 'descartada' : v.status !== 'todas' && st !== v.status) return false;
      if (v.rede && r.platform !== v.rede) return false;
      if (v.formato && r.item.type !== v.formato) return false;
      if (v.conc && r.compId !== v.conc) return false;
      if (since && (!r.item.publishedAt || Date.parse(r.item.publishedAt) < since)) return false;
      if (v.fav && !r.mark?.favorite) return false;
      if (needle && !`${r.item.title ?? ''} ${r.item.caption ?? ''} ${r.compName ?? ''} ${r.mark?.note ?? ''} ${(r.mark?.tags ?? []).join(' ')}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    return sortRows(list, SORTS, sort);
  }, [rows, v.periodo, v.status, v.rede, v.formato, v.conc, v.fav, q, sort.k, sort.dir]); // eslint-disable-line react-hooks/exhaustive-deps

  const platforms = [...new Set(rows.map((r) => r.platform))];
  const types = [...new Set(rows.map((r) => r.item.type))];
  const comps = [...new Set(rows.map((r) => r.compId).filter((x): x is string => !!x))];

  const redeOpts: SelectOption[] = [{ value: '', label: 'Todas as redes', icon: <Share2 /> }, ...platforms.map((p) => ({ value: p, label: platformLabel(p), icon: <PlatformIcon platform={p} size={16} />, count: rows.filter((r) => r.platform === p).length }))];
  const formatoOpts: SelectOption[] = [{ value: '', label: 'Todos os formatos', icon: <Shapes /> }, ...types.map((t) => ({ value: t, label: TYPE_LABEL[t] ?? t, icon: FORMAT_ICON[t] ?? <Clapperboard />, count: rows.filter((r) => r.item.type === t).length }))];
  const concOpts: SelectOption[] = [{ value: '', label: 'Todos os concorrentes', icon: <Users /> }, ...comps.map((id) => {
    const o = owners?.get(id);
    return { value: id, label: o?.name ?? id, icon: <Avatar name={o?.name ?? id} size={16} local={o?.local} remote={o?.remote} className="!ring-0" />, count: rows.filter((r) => r.compId === id).length };
  })];
  const statusOpts: SelectOption[] = [
    { value: 'ativas', label: 'Sem descartadas', icon: <ListFilter /> }, { value: 'todas', label: 'Todos os status', icon: <ListFilter /> },
    ...Object.entries(STATUS_LABEL).map(([k, label]) => ({ value: k, label, icon: <span className="size-2 rounded-full" style={{ background: STATUS_COLOR[k as ItemMark['status']] }} /> })),
  ];
  const sortOpts: SelectOption[] = Object.entries(SORTS).filter(([, d]) => d.bar).map(([value, d]) => ({ value, label: d.label }));

  const sel = (opts: SelectOption[], value: string, key: keyof typeof DEFAULTS, label: string) => (
    <SelectField size="sm" aria-label={label} value={value} options={opts} onChange={(x) => set({ [key]: x })} />
  );
  const secondary: BarFilter[] = [
    ...(types.length > 1 ? [{ label: 'Formato', node: sel(formatoOpts, v.formato, 'formato', 'Formato'), active: !!v.formato }] : []),
    ...(showComp && comps.length > 1 ? [{ label: 'Concorrente', node: sel(concOpts, v.conc, 'conc', 'Concorrente'), active: !!v.conc }] : []),
    { label: 'Status', node: sel(statusOpts, v.status, 'status', 'Status'), active: v.status !== 'ativas' },
  ];
  const active = !!(v.q || v.periodo !== defaults.periodo || v.rede || v.formato || v.conc || v.status !== 'ativas' || v.fav);

  const bar = (
    <FilterBar
      search={{ value: v.q, onChange: (x) => set({ q: x }), placeholder: searchPlaceholder ?? 'Buscar título, legenda, concorrente…' }}
      primary={<>
        <SelectField size="sm" aria-label="Período" icon={<CalendarDays />} value={v.periodo} options={PERIODS} onChange={(x) => set({ periodo: x })} />
        {showPlatformFilter && platforms.length > 1 && sel(redeOpts, v.rede, 'rede', 'Rede')}
        <SelectField size="sm" aria-label="Ordenar" icon={<ArrowUpDown />} disabled={vista === 'painel'} title={vista === 'painel' ? 'O Painel não usa ordenação' : undefined} value={sort.k} options={sortOpts} placeholder={SORTS[sort.k]?.label} onChange={(x) => set({ ordem: x, asc: '' })} />
      </>}
      secondary={secondary}
      trailing={<><FavToggle on={!!v.fav} onChange={(x) => set({ fav: x ? '1' : '' })} /><ViewToggle value={vista} options={panel ? VIEWS_PANEL : undefined} onChange={(x) => set({ vista: x })} /></>}
      active={active}
      onClear={() => reset(['q', 'periodo', 'rede', 'formato', 'conc', 'status', 'fav'])}
    />
  );

  const ownerOf = (r: CRow) => { const o = r.compId ? owners?.get(r.compId) : undefined; return o ? { name: o.name, avatar: <Avatar name={o.name} size={16} local={o.local} remote={o.remote} className="!ring-0" /> } : undefined; };

  const cols: Col<CRow>[] = [
    { k: 'thumb', label: '', width: '64px', render: (r) => <Thumb r={r} media={mediaOf(r)} className="h-8 w-14 rounded" /> },
    { k: 'title', label: 'Título', sort: 'title', width: '180px', className: 'max-w-[200px]', render: (r) => (
      <div className="flex items-center gap-1.5 min-w-0">{r.mark?.favorite && <FavStar on size="size-3.5" />}<span className="truncate font-medium" title={titleOf(r)}>{titleOf(r)}</span></div>
    ) },
    ...(showComp ? [{ k: 'comp', label: 'Concorrente', sort: 'comp', render: (r: CRow) => { const o = ownerOf(r); return o ? <span className="inline-flex items-center gap-1.5 whitespace-nowrap">{o.avatar}{o.name}</span> : null; } } as Col<CRow>] : []),
    { k: 'platform', label: 'Rede', sort: 'platform', render: (r) => <span title={platformLabel(r.platform)}><PlatformIcon platform={r.platform} size={16} /></span> },
    { k: 'type', label: 'Formato', sort: 'type', className: 'whitespace-nowrap', render: (r) => TYPE_LABEL[r.item.type] ?? r.item.type },
    { k: 'recent', label: 'Publicado', sort: 'recent', desc: true, className: 'whitespace-nowrap', render: (r) => <span title={r.item.publishedAt ? fmtDate(r.item.publishedAt) : undefined}>{r.item.publishedAt ? timeAgo(r.item.publishedAt) : '—'}</span> },
    { k: 'views', label: 'Views', sort: 'views', num: true, render: (r) => fmtNum(r.item.metrics.views) },
    { k: 'likes', label: 'Curtidas', sort: 'likes', num: true, render: (r) => fmtNum(r.item.metrics.likes) },
    { k: 'comments', label: 'Coment.', sort: 'comments', num: true, render: (r) => fmtNum(r.item.metrics.comments) },
    { k: 'shares', label: 'Envios', sort: 'shares', num: true, render: (r) => fmtNum(r.item.metrics.shares) },
    { k: 'engagement', label: 'Engaj.', sort: 'engagement', num: true, title: '(curtidas + comentários + envios) ÷ views', render: (r) => r.engagement != null ? fmtPct(r.engagement) : '—' },
    { k: 'outlier', label: '× perfil', sort: 'outlier', num: true, title: 'contra a mediana do próprio perfil', render: (r) => <RatioCell v={r.outlier} tip={r.outlier != null ? perfilTip(r) : undefined} /> },
    { k: 'mercado', label: '× mercado', sort: 'mercado', num: true, title: 'contra a mediana dos concorrentes (mesma rede e formato)', render: (r) => <RatioCell v={r.outlierMercado} tip={r.outlierMercado != null ? mercadoTip(r) : mercadoVazioTip(r)} /> },
    { k: 'porSeguidor', label: 'Por seguidor', sort: 'porSeguidor', num: true, title: 'views (ou curtidas) ÷ seguidores do perfil', render: (r) => r.porSeguidor != null ? <span title={porSeguidorTip(r)}>{fmtPct(r.porSeguidor)}</span> : '—' },
    { k: 'status', label: 'Status', sort: 'status', desc: true, render: (r) => { const s = r.mark?.status ?? 'nova'; return <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap"><span className="size-1.5 rounded-full" style={{ background: STATUS_COLOR[s] }} />{STATUS_LABEL[s]}</span>; } },
  ];

  const grid = (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
      {shown.map((r) => (
        <ItemCard key={rowId(r)} r={r} slug={slug} media={mediaOf(r)} showPlatform owner={ownerOf(r)} ideaBusy={ideaBusy(r)}
          onMark={(patch) => onMark(r, patch)} onIdea={() => onIdea(r)} onOpen={() => onOpen(r)} />
      ))}
    </div>
  );
  const table = (
    <DataTable rows={shown} cols={cols} rowKey={rowId} sort={sort} fill={fill} onRowClick={(r) => onOpen(r)}
      rowClass={(r) => (r.mark?.status === 'descartada' ? 'opacity-55' : undefined)}
      onSort={(k, dir) => set({ ordem: k, asc: dir === 1 ? '1' : '' })} />
  );

  return (
    <>
      {stickyTop != null
        ? <div style={{ top: stickyTop }} className={cx('sticky z-10 -mx-8 px-8 py-2 mb-2 bg-background/95 backdrop-blur border-b border-border', stickyClass)}>{bar}</div>
        : <div className="mb-3">{bar}</div>}
      {shown.length > 0 && summary && vista !== 'painel' && <div className="mb-4">{summary(shown)}</div>}
      {rows.length > 0 && !shown.length && <Empty title="Nada com esses filtros" hint={v.periodo !== 'tudo' ? 'Tente um período maior ou limpe os filtros.' : 'Limpe os filtros para ver tudo.'} />}
      {shown.length > 0 && (vista === 'painel'
        ? <ContentsPanel rows={shown} all={rows} periodo={v.periodo} owners={owners} mediaOf={mediaOf} ideaBusy={ideaBusy} onMark={onMark} onOpen={onOpen}
            onGoTable={() => set({ vista: 'tabela', ordem: 'outlier', asc: '' })} />
        : vista === 'tabela' ? table : fill ? <FillBox>{grid}</FillBox> : grid)}
    </>
  );
}
