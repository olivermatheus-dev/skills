// Panorama do mercado como dashboard (039 C, desenho em roadmap/tasks/039-panorama-dashboard/DASHBOARD.md):
// faixa de 6 números · Brechas (top 5, fixo à direita) · Fora da curva 30 d (× perfil / × mercado) · Quem anuncia e há quanto
// tempo · Quem publica · Preço × audiência. Cada bloco aponta para a tela que aprofunda; a lista completa de brechas mora na aba Brechas.
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CircleAlert, Flame, Grid3x3, Megaphone, PenLine, Tag, Timer, Trophy, TriangleAlert, Wallet, type LucideIcon } from 'lucide-react';
import type { Ad } from '../../api';
import { api } from '../../api';
import { useAds } from '../../queries';
import { AreaPage, Delta, StatStrip, useMarket, useRefRow, type MarketRow } from '../../components/competitors/area';
import { money } from '../../components/competitors/Analysis';
import { Avatar, Chips, Img, PlatformIcon, TYPE_LABEL, fmtRatio, median, platformLabel } from '../../components/competitors/lib';
import { useMarketRows, type MarketRow as ContentRow } from '../../components/competitors/market';
import { Empty, ErrorBox, cx, fmtNum } from '../../components/kit';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { GapSummaryCard, coverageKpi, useMatrixStats } from './PanoramaBrechas';

const DAY = 86_400_000;
const PERIOD_DAYS = 30;
/** limiares do desenho (038 §0): 3× = forte, 2× = sinal */
const STRONG = 3, SIGNAL = 2;
/** anúncio há 30+ dias no ar = ângulo que paga a conta */
const PROVEN_DAYS = 30;
const MEDIA: Record<string, string> = { imagem: 'imagem', video: 'vídeo', carrossel: 'carrossel', desconhecido: 'outro' };

type Mode = 'perfil' | 'mercado' | 'ambos';
type CRow = ContentRow & { compName: string };

export default function Panorama() {
  const { slug = '' } = useParams();
  const m = useMarket(slug);
  const ref = useRefRow(slug);
  const market = useMarketRows(slug);
  const comp = m.rows.filter((r) => r.c.data.kind === 'concorrente');
  const ms = useMatrixStats(slug, comp);
  const cov = coverageKpi(ms);
  const ads = useAdStats(slug, comp);

  const names = useMemo(() => new Map(m.rows.map((r) => [r.c.data.id, r.c.data.name])), [m.rows]);
  const recent = useMemo<CRow[]>(() => {
    const since = Date.now() - PERIOD_DAYS * DAY;
    return market.rows.filter((r) => r.item.publishedAt && Date.parse(r.item.publishedAt) >= since).map((r) => ({ ...r, compName: names.get(r.compId) ?? r.compId }));
  }, [market.rows, names]);

  // preço
  const prices = comp.map((r) => r.ov?.fromMonthly).filter((v): v is number => v != null);
  const refPrice = ref?.ov?.fromMonthly;
  const medPrice = median(prices);
  const cheaper = refPrice != null ? prices.filter((p) => p < refPrice).length : 0;
  const trial = comp.filter((r) => r.ov?.trial);
  const free = comp.filter((r) => r.ov?.priceModel === 'freemium' || (r.res.precos?.data as { plans?: { monthly?: number | null }[] } | undefined)?.plans?.some((p) => p.monthly === 0));
  // maior audiência numa rede só (a soma de redes mistura públicos diferentes)
  const biggest = comp.flatMap((r) => (r.sum?.profiles ?? []).map((p) => ({ r, p: p.platform, f: p.latest?.profile.followers ?? 0 }))).sort((a, b) => b.f - a.f)[0];
  const strongP = recent.filter((r) => (r.outlier ?? 0) >= STRONG).length;
  const strongM = recent.filter((r) => (r.outlierMercado ?? 0) >= STRONG).length;
  const base = `/p/${slug}/concorrentes`;

  if (m.error) return <AreaPage><ErrorBox error={m.error} /></AreaPage>;
  if (!m.isLoading && !m.rows.length) return <AreaPage><Empty title="Nenhum concorrente ainda" hint="Use + Adicionar para colar os links (site, Instagram, YouTube, TikTok)." /></AreaPage>;
  return (
    <AreaPage sub={`${comp.length} monitorados`}>
      <StatStrip items={[
        ref && refPrice != null
          ? { icon: Tag, label: `${ref.c.data.name} × mercado`, value: <>{money(refPrice)}{medPrice ? <Pill up={refPrice >= medPrice}>{refPrice >= medPrice ? '+' : ''}{Math.round((refPrice / medPrice - 1) * 100)}%</Pill> : null}</>,
            sub: `vs mediana · ${cheaper}/${prices.length} abaixo`, to: `/p/${slug}/contexto?s=BUSINESS`,
            title: `Seu preço de entrada contra a mediana dos ${prices.length} concorrentes com preço público (${medPrice ? money(medPrice) : '—'}).${(ref.res.precos?.data as { notes?: string } | undefined)?.notes ? `\n${(ref.res.precos?.data as { notes?: string }).notes}` : ''}\nClique: pendências de preço no contexto (BUSINESS › A validar).` }
          : { icon: Wallet, label: 'Preço de entrada (mediana)', value: medPrice ? money(medPrice) : '—', sub: prices.length > 1 ? `${money(Math.min(...prices))} a ${money(Math.max(...prices))}` : undefined },
        ...(cov ? [{ icon: Grid3x3, label: 'Cobertura (matriz)', value: <>{Math.round(ms!.mine * 100)}%<Small>você</Small></>, sub: `mediana ${Math.round(ms!.median * 100)}% · subestimada`, to: `${base}/comparar?v=funcionalidades`,
          title: `${cov.title}\nCélulas vazias contam como "não tem", então a cobertura de todos está subestimada.` }] : []),
        { icon: Timer, label: 'Teste grátis', value: <>{trial.length}/{comp.length}<Small>oferecem</Small></>, sub: `${free.length} c/ plano grátis · você: ${ref?.ov?.trial ?? '?'}`, to: `/p/${slug}/contexto?s=BUSINESS`,
          title: `${ref?.c.data.name ?? 'Você'}: teste grátis ${ref?.ov?.trial ?? 'a definir (BUSINESS › A validar)'}\nCom teste grátis: ${trial.map((r) => `${r.c.data.name} (${r.ov?.trial})`).join(', ') || 'nenhum'}\nCom plano grátis: ${free.map((r) => r.c.data.name).join(', ') || 'nenhum'}` },
        { icon: Megaphone, label: 'Anúncios ativos', value: <>{ads.total}<Small>{ads.list.length} anunciantes</Small></>, sub: `${ads.proven} há ${PROVEN_DAYS}+ dias no ar`, to: `${base}/anuncios?vista=lista`,
          title: 'Biblioteca de Anúncios da Meta, última coleta de cada concorrente. Anúncio há 30+ dias no ar costuma ser o que dá resultado.' },
        { icon: Flame, label: `Fora da curva · ${PERIOD_DAYS} d`, value: <>{strongP}<Small>× perfil</Small><span className="text-muted-foreground font-normal mx-1">·</span>{strongM}<Small>× mercado</Small></>, sub: `conteúdos ≥${STRONG}× a mediana`, to: `${base}/conteudos?vista=painel`,
          title: `× perfil: views ÷ mediana do próprio perfil.\n× mercado: views ÷ mediana dos concorrentes na mesma rede e formato (só com 3+ concorrentes na comparação).` },
        { icon: Trophy, label: 'Maior audiência', value: biggest?.f ? biggest.r.c.data.name : '—', sub: biggest?.f ? `${fmtNum(biggest.f)} no ${platformLabel(biggest.p)}` : undefined, to: biggest?.f ? `${base}/${biggest.r.c.data.id}?aba=redes` : undefined },
      ]} />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        {/* coluna da direita primeiro no DOM: abaixo de 1280 px vira o 2º bloco da coluna única */}
        <aside className="xl:col-start-2 xl:row-start-1 xl:sticky xl:top-[118px]">
          <GapSummaryCard slug={slug} rows={comp} s={ms} />
        </aside>
        <div className="xl:col-start-1 xl:row-start-1 min-w-0 space-y-4">
          <Outliers slug={slug} rows={recent} loading={market.loading} />
          <Advertisers slug={slug} stats={ads} />
          <div className="grid gap-4 min-[1400px]:grid-cols-2 items-start">
            <Publishers slug={slug} rows={comp} content={market.rows} />
            <Block icon={Wallet} title="Preço × audiência" hint="preço de entrada × seguidores" link={{ to: `${base}/comparar`, label: 'Comparar' }}>
              <PriceAudience slug={slug} rows={comp} ref_={ref} />
            </Block>
          </div>
        </div>
      </div>
    </AreaPage>
  );
}

const Pill = ({ up, children }: { up: boolean; children: ReactNode }) =>
  <span className={cx('ml-1.5 align-[2px] rounded px-1 py-px text-[11px] font-semibold', up ? 'bg-warning/15 text-amber-700 dark:text-amber-400' : 'bg-success/15 text-success-ink')}>{children}</span>;
const Small = ({ children }: { children: ReactNode }) => <span className="ml-1 text-xs font-normal text-muted-foreground">{children}</span>;

/** casca de bloco: ícone + título + dica à esquerda, controles e o link que aprofunda à direita */
function Block({ icon: Icon, title, hint, link, actions, children, footer, className }: {
  icon: LucideIcon; title: string; hint?: ReactNode; link?: { to: string; label: string }; actions?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string;
}) {
  return (
    <section className={cx('bg-card border border-border rounded-xl', className)}>
      <header className="flex items-center gap-2 px-4 pt-3 pb-2 min-w-0">
        <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
        <h2 className="text-sm font-semibold whitespace-nowrap">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground truncate min-w-0">{hint}</span>}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {actions}
          {link && <Link to={link.to} className="inline-flex items-center gap-1 text-xs text-primary-ink hover:underline whitespace-nowrap">{link.label}<ArrowRight className="size-3" /></Link>}
        </div>
      </header>
      <div className="px-4 pb-3">{children}</div>
      {footer && <footer className="px-4 py-2 border-t border-border text-[11px] text-muted-foreground">{footer}</footer>}
    </section>
  );
}

// ---------- Fora da curva (30 d) ----------
const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'perfil', label: 'Perfil', hint: 'views ÷ mediana do próprio perfil' },
  { value: 'mercado', label: 'Mercado', hint: 'views ÷ mediana dos concorrentes na rede e formato' },
  { value: 'ambos', label: 'Os dois', hint: 'fora da curva nas duas medidas (a menor das duas)' },
];
const score = (r: CRow, m: Mode) => m === 'perfil' ? r.outlier : m === 'mercado' ? r.outlierMercado : r.outlier != null && r.outlierMercado != null ? Math.min(r.outlier, r.outlierMercado) : undefined;
const mercadoTip = (r: CRow) => r.outlierMercado == null
  ? `× mercado: — (menos de 3 concorrentes nesta comparação${r.mercadoConcorrentes != null ? `: ${r.mercadoConcorrentes}` : ''})`
  : `× mercado: ${fmtRatio(r.outlierMercado)} a mediana de ${r.outlierMercadoBasis === 'likes' ? 'curtidas' : 'views'} de ${r.mercadoConcorrentes} concorrentes (${r.mercadoEscopo === 'formato' ? `${TYPE_LABEL[r.item.type]?.toLowerCase() ?? r.item.type} no ${platformLabel(r.platform)}` : `toda a rede ${platformLabel(r.platform)}`}, ${r.mercadoAmostra} itens)`;

function Outliers({ slug, rows, loading }: { slug: string; rows: CRow[]; loading: boolean }) {
  const [sp, setSp] = useSearchParams();
  const mode = (['perfil', 'mercado', 'ambos'].includes(sp.get('fc') ?? '') ? sp.get('fc') : 'perfil') as Mode;
  const setMode = (v: Mode) => setSp((p) => { const n = new URLSearchParams(p); if (v === 'perfil') n.delete('fc'); else n.set('fc', v); return n; }, { replace: true });
  const top = useMemo(() => {
    const per = new Map<string, number>();
    const out: CRow[] = [];
    for (const r of rows.filter((x) => score(x, mode) != null).sort((a, b) => score(b, mode)! - score(a, mode)!)) {
      const n = per.get(r.compId) ?? 0;
      if (n >= 2) continue; // no máximo 2 por concorrente: o painel não vira vitrine de um perfil só
      per.set(r.compId, n + 1);
      out.push(r);
      if (out.length === 6) break;
    }
    return out;
  }, [rows, mode]);
  // concentração: um concorrente com mais da metade dos ≥3× mercado (o perfil grande puxa a medida)
  const conc = useMemo(() => {
    const strong = rows.filter((r) => (r.outlierMercado ?? 0) >= STRONG);
    if (strong.length < 4) return null;
    const by = new Map<string, number>();
    for (const r of strong) by.set(r.compName, (by.get(r.compName) ?? 0) + 1);
    const [name, n] = [...by].sort((a, b) => b[1] - a[1])[0];
    return n / strong.length > 0.5 ? { name, pct: Math.round((n / strong.length) * 100), n: strong.length } : null;
  }, [rows]);
  const ordem = mode === 'mercado' ? 'mercado' : 'outlier';
  const conteudos = `/p/${slug}/concorrentes/conteudos`;
  return (
    <Block icon={Flame} title={`Fora da curva · ${PERIOD_DAYS} dias`} hint={MODES.find((x) => x.value === mode)!.hint}
      actions={<Chips value={mode} onChange={setMode} options={MODES.map(({ value, label }) => ({ value, label }))} />}
      link={{ to: `${conteudos}?vista=painel&ordem=${ordem}`, label: 'Painel' }}
      footer={conc ? <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400"><TriangleAlert className="size-3.5" />{conc.pct}% dos {conc.n} conteúdos ≥{STRONG}× mercado são da {conc.name}: o perfil grande puxa essa medida.</span> : undefined}>
      {loading ? <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[4/5] rounded-lg bg-muted animate-pulse" />)}</div>
        : !top.length ? <p className="text-sm text-muted-foreground py-8 text-center">{mode === 'perfil' ? 'Nada publicado nos últimos 30 dias com coleta.' : 'Nenhum conteúdo dos últimos 30 dias com a medida de mercado (precisa de 3+ concorrentes na mesma rede).'}</p>
          : (
            <ol className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
              {top.map((r) => (
                <li key={`${r.compId}|${r.profileKey}|${r.mk}`} className="min-w-0">
                  <Link to={`${conteudos}?item=${encodeURIComponent(`${r.compId}/${r.mk}`)}&ordem=${ordem}`} className="group block" title={`${r.item.title ?? r.item.caption ?? ''}`.slice(0, 200)}>
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted ring-1 ring-border group-hover:ring-primary/50 transition">
                      <Img local={api.mediaUrl(slug, r.compId, r.item.thumbnailLocal)} remote={r.item.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
                      <span className="absolute top-1.5 right-1.5 bg-white/90 rounded p-0.5 shadow-sm"><PlatformIcon platform={r.platform} size={12} /></span>
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-5 pb-1.5 text-[11px] text-white/90 tabular-nums">
                        {fmtNum(r.item.metrics[r.outlierBasis])} {r.outlierBasis === 'views' ? 'views' : 'curtidas'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      <Ratio v={r.outlier} label="perfil" on={mode !== 'mercado'} tip={`× perfil: ${fmtRatio(r.outlier)} a mediana de ${r.outlierBasis === 'likes' ? 'curtidas' : 'views'} do próprio perfil`} />
                      <Ratio v={r.outlierMercado} label="mercado" on={mode !== 'perfil'} tip={mercadoTip(r)} />
                    </div>
                    <div className="mt-1 text-xs font-medium truncate group-hover:text-primary-ink">{r.compName}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{platformLabel(r.platform)} · {TYPE_LABEL[r.item.type] ?? r.item.type}</div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
    </Block>
  );
}

/** selo de uma medida: a escolhida em destaque, a outra discreta; "—" quando não há base */
function Ratio({ v, label, on, tip }: { v?: number; label: string; on: boolean; tip: string }) {
  const hot = v != null && v >= STRONG;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cx('flex-1 min-w-0 rounded px-1 py-0.5 text-center leading-tight border',
          on ? (hot ? 'bg-primary-soft border-primary/30 text-primary-ink' : 'bg-muted border-transparent text-foreground') : 'border-border text-muted-foreground')}>
          <span className="block text-xs font-semibold tabular-nums truncate">{v == null ? '—' : fmtRatio(v)}</span>
          <span className="block text-[10px] opacity-80">{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64">{tip}</TooltipContent>
    </Tooltip>
  );
}

// ---------- Quem anuncia e há quanto tempo ----------
interface AdStat { id: string; name: string; row?: MarketRow; total: number; proven: number; oldest?: number; format?: string }
function useAdStats(slug: string, comp: MarketRow[]) {
  const q = useAds(slug);
  return useMemo(() => {
    const byId = new Map(comp.map((r) => [r.c.data.id, r]));
    const now = Date.now();
    const days = (a: Ad) => (a.startedAt ? Math.max(0, Math.floor((now - Date.parse(a.startedAt)) / DAY)) : undefined);
    const seen = new Set<string>();
    const list: AdStat[] = [];
    const none: { name: string; why: string }[] = [];
    for (const a of q.data ?? []) {
      const r = byId.get(a.id);
      if (!r) continue;
      seen.add(a.id);
      const cur = a.history.at(-1)?.data;
      const act = (cur?.ads ?? []).filter((x) => x.active);
      if (!act.length) { none.push({ name: r.c.data.name, why: cur?.pageId ? 'nenhum ativo' : 'busca pelo nome, sem página do Facebook' }); continue; }
      const ds = act.map(days).filter((d): d is number => d != null);
      const fm = Object.entries(act.reduce<Record<string, number>>((o, x) => ({ ...o, [x.media.type]: (o[x.media.type] ?? 0) + 1 }), {})).sort((x, y) => y[1] - x[1])[0]?.[0];
      list.push({ id: a.id, name: r.c.data.name, row: r, total: act.length, proven: ds.filter((d) => d >= PROVEN_DAYS).length, oldest: ds.length ? Math.max(...ds) : undefined, format: fm });
    }
    for (const r of comp) if (!seen.has(r.c.data.id)) none.push({ name: r.c.data.name, why: 'sem coleta de anúncios' });
    list.sort((a, b) => b.proven - a.proven || b.total - a.total);
    return { list, none, loading: q.isLoading, total: list.reduce((n, x) => n + x.total, 0), proven: list.reduce((n, x) => n + x.proven, 0) };
  }, [q.data, q.isLoading, comp]);
}

function Advertisers({ slug, stats }: { slug: string; stats: ReturnType<typeof useAdStats> }) {
  const max = Math.max(1, ...stats.list.map((x) => x.total));
  const anuncios = `/p/${slug}/concorrentes/anuncios`;
  return (
    <Block icon={Megaphone} title="Quem anuncia e há quanto tempo" hint={`anúncio há ${PROVEN_DAYS}+ dias no ar = ângulo que paga a conta`}
      link={{ to: `${anuncios}?vista=lista`, label: 'Anúncios' }}
      footer={
        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" />há {PROVEN_DAYS}+ dias</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary/30" />até {PROVEN_DAYS} dias</span>
          {stats.none.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 min-w-0" title={stats.none.map((x) => `${x.name}: ${x.why}`).join('\n')}>
              <CircleAlert className="size-3.5 shrink-0" />
              <span className="truncate">sem anúncio achado: {stats.none.map((x) => x.name).join(', ')}</span>
            </span>
          )}
        </div>
      }>
      {stats.loading ? <div className="h-40 rounded bg-muted animate-pulse" />
        : !stats.list.length ? <p className="text-sm text-muted-foreground py-6 text-center">Nenhum anúncio ativo na última coleta. Puxe na aba Anúncios.</p>
          : (
            <div role="table" aria-label="Anúncios ativos por concorrente" className="text-sm">
              <div role="row" className="grid grid-cols-[9rem_minmax(0,1fr)_9.5rem] gap-3 pb-1 text-[11px] text-muted-foreground">
                <span role="columnheader">concorrente</span><span role="columnheader">anúncios ativos</span><span role="columnheader" className="text-right">mais antigo · formato</span>
              </div>
              {stats.list.map((x) => (
                <Tooltip key={x.id}>
                  <TooltipTrigger asChild>
                    <Link role="row" to={`/p/${slug}/concorrentes/${x.id}?aba=anuncios`} className="grid grid-cols-[9rem_minmax(0,1fr)_9.5rem] gap-3 items-center h-8 -mx-2 px-2 rounded-md hover:bg-muted/50 group">
                      <span className="flex items-center gap-2 min-w-0">
                        <Avatar name={x.name} size={18} local={x.row?.avatar.local} remote={x.row?.avatar.remote} className="!ring-0" />
                        <span className="truncate group-hover:text-primary-ink">{x.name}</span>
                      </span>
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="flex h-3.5 gap-0.5" style={{ width: `${(x.total / max) * 100}%` }}>
                          {x.proven > 0 && <span className="h-full rounded-[4px] bg-primary" style={{ flex: x.proven }} />}
                          {x.total - x.proven > 0 && <span className="h-full rounded-[4px] bg-primary/30" style={{ flex: x.total - x.proven }} />}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums"><b className="font-semibold">{x.total}</b><span className="text-muted-foreground"> · {x.proven === x.total ? 'todos' : x.proven} há {PROVEN_DAYS}+</span></span>
                      </span>
                      <span className="text-right text-xs tabular-nums text-muted-foreground whitespace-nowrap">{x.oldest != null ? <><span className="text-foreground">{x.oldest} d</span> · {MEDIA[x.format ?? ''] ?? x.format}</> : '—'}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top">{x.name}: {x.total} ativo(s), {x.proven} no ar há {PROVEN_DAYS}+ dias{x.oldest != null ? `, o mais antigo há ${x.oldest} dias` : ''}. Clique para ver os anúncios.</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
    </Block>
  );
}

// ---------- Quem publica ----------
function Publishers({ slug, rows, content }: { slug: string; rows: MarketRow[]; content: ContentRow[] }) {
  const since = Date.now() - PERIOD_DAYS * DAY;
  const data = useMemo(() => rows.map((r) => {
    const profs = (r.sum?.profiles ?? []).filter((p) => p.latest);
    if (!profs.length) return null;
    const big = [...profs].sort((a, b) => (b.latest!.profile.followers ?? 0) - (a.latest!.profile.followers ?? 0))[0];
    const mine = content.filter((x) => x.compId === r.c.data.id);
    const dated = mine.filter((x) => x.item.publishedAt);
    const inWin = dated.filter((x) => Date.parse(x.item.publishedAt!) >= since);
    // perfil com todos os itens da coleta dentro da janela: a coleta cortou (ex.: Instagram traz 6), a conta é um piso
    const capped = [...new Set(dated.map((x) => x.profileKey))].some((k) => { const its = dated.filter((x) => x.profileKey === k); return its.length > 0 && its.every((x) => Date.parse(x.item.publishedAt!) >= since); });
    const last = dated.reduce<number | undefined>((mx, x) => Math.max(mx ?? 0, Date.parse(x.item.publishedAt!)), undefined);
    return {
      r, followers: big.latest!.profile.followers ?? undefined, platform: big.platform,
      perWeek: inWin.length / (PERIOD_DAYS / 7), capped,
      lastDays: last != null ? Math.floor((Date.now() - last) / DAY) : undefined,
      hits: inWin.filter((x) => (x.outlier ?? 0) >= SIGNAL).length,
    };
  }).filter((x): x is NonNullable<typeof x> => !!x).sort((a, b) => (b.followers ?? -1) - (a.followers ?? -1)), [rows, content, since]);
  const anyDelta = rows.some((r) => r.delta);
  if (!data.length) return null;
  return (
    <Block icon={PenLine} title="Quem publica" hint={`últimos ${PERIOD_DAYS} dias, todas as redes`} link={{ to: `/p/${slug}/concorrentes/redes`, label: 'Redes' }}
      footer={!anyDelta ? 'Δ seguidores aparece com duas coletas com 7+ dias de distância.' : undefined}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-muted-foreground text-right">
            <th className="font-normal text-left pb-1">concorrente</th>
            <th className="font-normal pb-1 pl-2" title="seguidores da maior rede">seguidores</th>
            <th className="font-normal pb-1 pl-3" title="posts por semana nos últimos 30 dias, somando as redes; ≥ = a coleta trouxe só os últimos posts">posts/sem</th>
            <th className="font-normal pb-1 pl-3" title="dias desde o último post em qualquer rede">último</th>
            <th className="font-normal pb-1 pl-3" title={`conteúdos ≥${SIGNAL}× a mediana do próprio perfil nos últimos 30 dias`}>≥{SIGNAL}×</th>
            <th className="font-normal pb-1 pl-3" title="variação de seguidores desde a coleta anterior">Δ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((x) => (
            <tr key={x.r.c.data.id} className="border-t border-border/60 hover:bg-muted/40">
              <td className="py-1.5 pr-2 max-w-0 w-full">
                <Link to={`/p/${slug}/concorrentes/${x.r.c.data.id}?aba=redes`} className="flex items-center gap-2 min-w-0 hover:text-primary-ink">
                  <Avatar name={x.r.c.data.name} size={18} local={x.r.avatar.local} remote={x.r.avatar.remote} className="!ring-0" />
                  <span className="truncate">{x.r.c.data.name}</span>
                </Link>
              </td>
              <td className="py-1.5 pl-2 text-right tabular-nums whitespace-nowrap">
                <span className="inline-flex items-center gap-1" title={platformLabel(x.platform)}><PlatformIcon platform={x.platform} size={11} />{fmtNum(x.followers)}</span>
              </td>
              <td className="py-1.5 pl-3 text-right tabular-nums whitespace-nowrap">{x.capped && x.perWeek > 0 ? '≥' : ''}{x.perWeek.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td>
              <td className={cx('py-1.5 pl-3 text-right tabular-nums whitespace-nowrap', (x.lastDays ?? 0) > 21 && 'text-amber-700 dark:text-amber-400 font-medium')} title={(x.lastDays ?? 0) > 21 ? 'parou de publicar?' : undefined}>
                {x.lastDays == null ? '—' : x.lastDays === 0 ? 'hoje' : `${x.lastDays} d`}
              </td>
              <td className="py-1.5 pl-3 text-right tabular-nums">{x.hits || <span className="text-muted-foreground">0</span>}</td>
              <td className="py-1.5 pl-3 text-right">{x.r.delta ? <Delta n={x.r.delta} fmt={fmtNum} /> : <span className="text-muted-foreground">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Block>
  );
}

// ---------- Preço × audiência ----------
/** dispersão: 1 série (os concorrentes), rótulo direto em cada ponto, tooltip no hover; a linha tracejada é o seu preço */
function PriceAudience({ slug, rows, ref_ }: { slug: string; rows: MarketRow[]; ref_: MarketRow | null }) {
  const [hover, setHover] = useState<string | null>(null);
  const nav = useNavigate();
  const pts = rows.filter((r) => r.ov?.fromMonthly != null && r.followers);
  const out = rows.filter((r) => !pts.includes(r));
  if (pts.length < 2) return <div className="text-sm text-muted-foreground py-10 text-center">Precisa de preço e seguidores de pelo menos 2 concorrentes.</div>;
  const W = 440, H = 280, L = 44, R = 12, T = 10, B = 28;
  const rp = ref_?.ov?.fromMonthly;
  const maxP = Math.max(...pts.map((r) => r.ov!.fromMonthly!), rp ?? 0) * 1.1;
  const fs = [...pts.map((r) => r.followers!), ...(rp != null && ref_?.followers ? [ref_.followers] : [])];
  const lo = Math.floor(Math.log10(Math.min(...fs))), hi = Math.ceil(Math.log10(Math.max(...fs)));
  const x = (p: number) => L + (p / maxP) * (W - L - R);
  const y = (f: number) => T + (1 - (Math.log10(f) - lo) / Math.max(1, hi - lo)) * (H - T - B);
  const step = maxP > 150 ? 50 : 25;
  const xt = Array.from({ length: Math.floor(maxP / step) + 1 }, (_, i) => i * step);
  const yt = Array.from({ length: hi - lo + 1 }, (_, i) => 10 ** (lo + i));
  const h = pts.find((r) => r.c.data.id === hover);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Preço de entrada por seguidores">
        {yt.map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} /><text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmtNum(v)}</text></g>)}
        {xt.map((v) => <text key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{money(v)}</text>)}
        {rp != null && (
          <g>
            <line x1={x(rp)} x2={x(rp)} y1={T} y2={H - B} className="stroke-primary" strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={x(rp) - 6} y={H - B - 20} textAnchor="end" className="fill-primary-ink text-[11px] font-semibold">{ref_!.c.data.name} {money(rp)}</text>
            {!ref_!.followers && <text x={x(rp) - 6} y={H - B - 7} textAnchor="end" className="fill-muted-foreground text-[10px]">ainda sem audiência própria</text>}
            {ref_!.followers ? <circle cx={x(rp)} cy={y(ref_!.followers)} r={6} className="fill-background stroke-primary" strokeWidth={2.5} /> : null}
          </g>
        )}
        {pts.map((r, i) => {
          const cx_ = x(r.ov!.fromMonthly!), cy = y(r.followers!);
          const on = hover === r.c.data.id;
          // dois pontos colados: o da esquerda põe o nome à esquerda, o outro à direita (não sobrepõe)
          const left = pts.some((o, j) => j !== i && x(o.ov!.fromMonthly!) > cx_ && x(o.ov!.fromMonthly!) - cx_ < 80 && Math.abs(y(o.followers!) - cy) < 14);
          return (
            <g key={r.c.data.id} onClick={() => nav(`/p/${slug}/concorrentes/${r.c.data.id}`)} onMouseEnter={() => setHover(r.c.data.id)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
              <circle cx={cx_} cy={cy} r={14} fill="transparent" />
              <circle cx={cx_} cy={cy} r={on ? 6 : 5} className="fill-primary stroke-card" strokeWidth={2} />
              <text x={left ? cx_ - 9 : cx_ + 9} y={cy + 4} textAnchor={left ? 'end' : 'start'} className={on ? 'fill-foreground text-[11px] font-medium' : 'fill-muted-foreground text-[11px]'}>{r.c.data.name}</text>
            </g>
          );
        })}
      </svg>
      {h && (
        <div className="pointer-events-none absolute bg-popover text-popover-foreground border border-border shadow-md rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap"
          style={{ left: `${(x(h.ov!.fromMonthly!) / W) * 100}%`, top: `${(y(h.followers!) / H) * 100}%`, transform: 'translate(-50%, calc(-100% - 12px))' }}>
          <div className="font-medium">{h.c.data.name}</div>
          <div className="text-muted-foreground">{money(h.ov!.fromMonthly!, h.ov!.currency)}/mês · {h.ov?.priceModel} · {fmtNum(h.followers)} seguidores</div>
        </div>
      )}
      {out.length > 0 && <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2" title={out.map((r) => r.c.data.name).join(', ')}>Fora do gráfico (sem preço público ou sem coleta): {out.map((r) => r.c.data.name).join(', ')}</div>}
    </div>
  );
}
