// Panorama do mercado: números da concorrência, preço × audiência, quem cresce, conteúdos fora da curva e as brechas
// somadas de todas as análises (o que o gestor lê primeiro).
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ModuleDataOf } from '../../../../schema/analysis';
import { api } from '../../api';
import { useCompetitorsFeed } from '../../queries';
import { AreaPage, Delta, StatStrip, useMarket, useRefRow, type MarketRow } from '../../components/competitors/area';
import { money } from '../../components/competitors/Analysis';
import { Avatar, Img, PlatformIcon, TYPE_LABEL, buildRows, fmtRatio, groupSnapshots, median } from '../../components/competitors/lib';
import { titleOf } from '../../components/competitors/Items';
import { Empty, ErrorBox, fmtNum } from '../../components/kit';

export default function Panorama() {
  const { slug = '' } = useParams();
  const m = useMarket(slug);
  const ref = useRefRow(slug);
  const comp = m.rows.filter((r) => r.c.data.kind === 'concorrente');
  const prices = comp.map((r) => r.ov?.fromMonthly).filter((v): v is number => v != null);
  const free = comp.filter((r) => r.ov?.priceModel === 'freemium' || (r.res.precos?.data as ModuleDataOf<'precos'> | undefined)?.plans.some((p) => p.monthly === 0));
  const trial = comp.filter((r) => r.ov?.trial);
  const audience = comp.reduce((n, r) => n + (r.followers ?? 0), 0);
  const biggest = [...comp].sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))[0];
  const refPrice = ref?.ov?.fromMonthly;
  const medPrice = median(prices);
  const cheaper = refPrice != null ? prices.filter((p) => p < refPrice).length : 0;

  if (m.error) return <AreaPage><ErrorBox error={m.error} /></AreaPage>;
  if (!m.isLoading && !m.rows.length) return <AreaPage><Empty title="Nenhum concorrente ainda" hint="Use + Adicionar para colar os links (site, Instagram, YouTube, TikTok)." /></AreaPage>;
  return (
    <AreaPage sub={`${comp.length} concorrente(s) monitorado(s)`}>
      <StatStrip items={[
        ...(ref && refPrice != null ? [{ label: `${ref.c.data.name} (você)`, value: money(refPrice), title: (ref.res.precos?.data as { notes?: string } | undefined)?.notes ?? undefined,
          sub: medPrice ? `${refPrice >= medPrice ? '+' : ''}${Math.round((refPrice / medPrice - 1) * 100)}% vs mediana · ${cheaper}/${prices.length} cobram menos` : undefined }] : []),
        { label: 'Preço de entrada (mediana)', value: prices.length ? money(median(prices)) : '—', sub: prices.length > 1 ? `${money(Math.min(...prices))} a ${money(Math.max(...prices))}` : undefined },
        { label: 'Com plano grátis', value: `${free.length}/${comp.length}`, title: free.map((r) => r.c.data.name).join(', ') },
        { label: 'Com teste grátis', value: `${trial.length}/${comp.length}`, title: trial.map((r) => `${r.c.data.name}: ${r.ov?.trial}`).join('\n') },
        { label: 'Audiência somada', value: fmtNum(audience || undefined), sub: 'seguidores nas redes puxadas' },
        { label: 'Maior audiência', value: biggest?.followers ? biggest.c.data.name : '—', sub: biggest?.followers ? fmtNum(biggest.followers) : undefined },
      ]} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold">Preço × audiência</h2>
          <p className="text-xs text-muted-foreground">Preço de entrada por mês × seguidores somados (escala log). Quem está no canto de baixo à esquerda é barato e pouco conhecido.</p>
          <PriceAudience slug={slug} rows={comp} ref_={ref} />
        </section>
        <section className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-2">Audiência e crescimento</h2>
          <Growth slug={slug} rows={comp} />
        </section>
      </div>

      <TopContent slug={slug} rows={m.rows} />
      <Gaps slug={slug} rows={comp} />
    </AreaPage>
  );
}

/** gráfico de dispersão: 1 série (os concorrentes), rótulo direto em cada ponto, tooltip no hover */
function PriceAudience({ slug, rows, ref_ }: { slug: string; rows: MarketRow[]; ref_: MarketRow | null }) {
  const [hover, setHover] = useState<string | null>(null);
  const nav = useNavigate();
  const pts = rows.filter((r) => r.ov?.fromMonthly != null && r.followers);
  const out = rows.filter((r) => !pts.includes(r));
  if (pts.length < 2) return <div className="text-sm text-muted-foreground py-10 text-center">Precisa de preço e seguidores de pelo menos 2 concorrentes.</div>;
  const W = 640, H = 300, L = 48, R = 16, T = 12, B = 32;
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
    <div className="relative mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Preço de entrada por seguidores">
        {yt.map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} /><text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmtNum(v)}</text></g>)}
        {xt.map((v) => <text key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{money(v)}</text>)}
        {/* você: linha no seu preço; ponto só quando houver audiência própria */}
        {rp != null && (
          <g>
            <line x1={x(rp)} x2={x(rp)} y1={T} y2={H - B} className="stroke-primary" strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={x(rp) - 6} y={H - B - 20} textAnchor="end" className="fill-primary text-[11px] font-semibold">{ref_!.c.data.name} {money(rp)}</text>
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
        <div className="pointer-events-none absolute bg-popover text-popover-foreground border border-border shadow-md rounded-md px-2.5 py-1.5 text-xs"
          style={{ left: `${(x(h.ov!.fromMonthly!) / W) * 100}%`, top: `${(y(h.followers!) / H) * 100}%`, transform: 'translate(-50%, calc(-100% - 12px))' }}>
          <div className="font-medium">{h.c.data.name}</div>
          <div className="text-muted-foreground">{money(h.ov!.fromMonthly!, h.ov!.currency)}/mês · {h.ov?.priceModel} · {fmtNum(h.followers)} seguidores</div>
        </div>
      )}
      {out.length > 0 && <div className="text-[11px] text-muted-foreground mt-1">Fora do gráfico (sem preço público ou sem coleta): {out.map((r) => r.c.data.name).join(', ')}</div>}
    </div>
  );
}

function Growth({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.followers ?? 0));
  const sorted = [...rows].sort((a, b) => (b.followers ?? -1) - (a.followers ?? -1));
  return (
    <div className="space-y-1.5">
      {sorted.map((r) => (
        <Link key={r.c.data.id} to={`/p/${slug}/concorrentes/${r.c.data.id}?aba=redes`} className="flex items-center gap-2 text-sm group">
          <Avatar name={r.c.data.name} size={18} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />
          <span className="w-28 truncate group-hover:text-primary-ink">{r.c.data.name}</span>
          <span className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">{r.followers ? <span className="block h-full rounded-full bg-primary/70" style={{ width: `${Math.max(2, (r.followers / max) * 100)}%` }} /> : null}</span>
          <span className="w-14 text-right tabular-nums text-xs">{r.followers ? fmtNum(r.followers) : <span className="text-muted-foreground">—</span>}</span>
          <span className="w-12 text-right"><Delta n={r.delta} fmt={fmtNum} /></span>
        </Link>
      ))}
    </div>
  );
}

/** os conteúdos mais fora da curva de todos os concorrentes (atalho para a aba Conteúdos) */
function TopContent({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const feed = useCompetitorsFeed(slug);
  const top = useMemo(() => {
    const name = new Map(rows.map((r) => [r.c.data.id, r.c.data.name]));
    return (feed.data ?? []).flatMap((f) => buildRows([...groupSnapshots(f.snapshots).values()], f.marks, (k) => k.split('-')[0]).map((r) => ({ ...r, compId: f.id, compName: name.get(f.id) ?? f.id })))
      .filter((r) => r.outlier != null).sort((a, b) => b.outlier! - a.outlier!).slice(0, 6);
  }, [feed.data, rows]);
  if (!top.length) return null;
  return (
    <section className="mt-5">
      <div className="flex items-baseline gap-2 mb-2">
        <h2 className="text-sm font-semibold">Conteúdos fora da curva</h2>
        <span className="text-xs text-muted-foreground">views ÷ mediana do próprio perfil</span>
        <Link to={`/p/${slug}/concorrentes/conteudos`} className="ml-auto text-xs text-primary-ink">ver todos →</Link>
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {top.map((r) => (
          <a key={r.mk + r.compId} href={r.item.url} target="_blank" rel="noreferrer" className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 group">
            <div className="relative aspect-[4/5] bg-muted">
              <Img local={api.mediaUrl(slug, r.compId, r.item.thumbnailLocal)} remote={r.item.thumbnail} className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute top-1.5 left-1.5 text-[11px] font-semibold bg-black/70 text-white rounded px-1.5 py-0.5">{fmtRatio(r.outlier)}</span>
              <span className="absolute top-1.5 right-1.5 bg-white/90 rounded p-0.5"><PlatformIcon platform={r.platform} size={12} /></span>
            </div>
            <div className="p-2">
              <div className="text-xs font-medium line-clamp-2 group-hover:text-primary-ink">{titleOf(r)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{r.compName} · {TYPE_LABEL[r.item.type] ?? r.item.type} · {fmtNum(r.item.metrics.views ?? r.item.metrics.likes)} {r.item.metrics.views != null ? 'views' : '♥'}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/** brechas para nós, somadas de todas as análises de pontos fortes e fracos */
function Gaps({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const list = rows.map((r) => ({ r, d: r.res.forcas?.data as ModuleDataOf<'forcas'> | undefined })).filter((x) => x.d?.opportunities.length);
  if (!list.length) return null;
  return (
    <section className="mt-5">
      <h2 className="text-sm font-semibold mb-2">Brechas para nós <span className="font-normal text-xs text-muted-foreground">de {list.length} análise(s) de pontos fortes e fracos</span></h2>
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
        {list.map(({ r, d }) => (
          <div key={r.c.data.id} className="break-inside-avoid mb-4 bg-card border border-border rounded-lg p-3">
            <Link to={`/p/${slug}/concorrentes/${r.c.data.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary-ink mb-1.5">
              <Avatar name={r.c.data.name} size={18} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />{r.c.data.name}
            </Link>
            <ul className="space-y-1 text-[13px] leading-snug">{d!.opportunities.map((o, i) => <li key={i} className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:size-1.5 before:rounded-full before:bg-primary/60">{o}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
