// Painel da aba Conteúdos (038 C2, desenho em roadmap/tasks/038-conteudos-concorrentes-v2/DASHBOARD.md):
// faixa de números · mapa × perfil × × mercado (quadrantes, corte 2×) · fila "Para virar ideia" · régua por formato ·
// aposta de cada concorrente. Recebe as linhas que passaram nos filtros da barra (e todas, para a janela de coleta).
import { useMemo, useState, type ReactNode } from 'react';
import { CartesianGrid, ReferenceArea, ReferenceLine, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle, ArrowRight, ArrowUp, CheckCircle2, Clapperboard, Eye, Flame, Globe2, Heart, Ruler, Scale, Sparkles, Info, User, X,
} from 'lucide-react';
import type { ItemMark } from '../../api';
import { cx, fmtNum } from '../kit';
import { ChartContainer, ChartTooltip } from '../ui/chart';
import { StatStrip } from './area';
import { Avatar, PlatformIcon, SERIES, Spinner, TYPE_LABEL, fmtPct, fmtRatio, median, platformLabel, timeAgo } from './lib';
import { RatioCell, Thumb, mercadoTip, mercadoVazioTip, perfilTip, titleOf } from './Items';
import { FlagToggle, Tip } from './toolbar';
import type { CRow, Owner } from './ContentsView';

const dayMs = 86_400_000;
const L2 = Math.log10(2), L15 = Math.log10(1.5);

// ---------- quadrantes (definições únicas, valem também no Panorama) ----------
export type Quad = 'viralizou' | 'achado' | 'efeito' | 'resto' | 'sem';
export function quadOf(r: CRow): Quad | null {
  if (r.outlier == null) return null;
  if (r.outlierMercado == null) return 'sem';
  const p = r.outlier, m = r.outlierMercado;
  if (p >= 2 && m >= 2) return 'viralizou';
  if (p >= 2 && m < 1) return 'achado';
  if (p < 1.5 && m >= 2) return 'efeito';
  return 'resto';
}
const NEUTRAL = '#a1a1aa';
const QUAD: Record<Quad, { label: string; color: string; hint: string }> = {
  viralizou: { label: 'Viralizou', color: SERIES[1], hint: 'Viralizou de verdade: ≥2× no próprio perfil e ≥2× no mercado.' },
  achado: { label: 'Achado de perfil pequeno', color: SERIES[2], hint: '≥2× no perfil e <1× no mercado: o tema rendeu sem audiência grande (a situação da Kzloo).' },
  efeito: { label: 'Efeito tamanho', color: SERIES[0], hint: '<1,5× no perfil e ≥2× no mercado: é o tamanho do perfil, não o conteúdo. Estudar a máquina (frequência, formato), não copiar o tema.' },
  resto: { label: 'Resto', color: NEUTRAL, hint: 'Dentro do normal em pelo menos uma das medidas.' },
  sem: { label: 'Sem mercado', color: NEUTRAL, hint: 'Menos de 3 concorrentes nesta rede/formato: não existe "mercado" para comparar (hoje: TikTok e YouTube).' },
};
const QUAD_ORDER: Quad[] = ['viralizou', 'achado', 'efeito', 'resto', 'sem'];

/** cores fixas por formato (paleta categórica validada, ordem fixa) */
const FMT_ORDER = ['reel', 'carrossel', 'post', 'video', 'short', 'live', 'outro'];
const FMT_COLOR: Record<string, string> = { reel: SERIES[0], carrossel: SERIES[1], post: SERIES[2], video: SERIES[3], short: SERIES[4], live: SERIES[5], outro: NEUTRAL };
const fmtLabel = (t: string) => TYPE_LABEL[t] ?? t;
const isVideoType = (t: string) => ['reel', 'short', 'video'].includes(t);
const NET_SHORT: Record<string, string> = { instagram: 'IG', tiktok: 'TikTok', youtube: 'YT' };

/** mediana da métrica-base (views onde há views, senão curtidas) */
function baseOf(rows: CRow[]) {
  const views = rows.map((r) => r.item.metrics.views).filter((v): v is number => !!v);
  if (views.length) return { basis: 'views' as const, med: median(views), n: views.length };
  const likes = rows.map((r) => r.item.metrics.likes).filter((v): v is number => !!v);
  return { basis: 'likes' as const, med: median(likes), n: likes.length };
}
const fmtMed = (v?: number) => (v == null ? '—' : v < 100 ? v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : fmtNum(Math.round(v)));
const BasisIcon = ({ b }: { b: 'views' | 'likes' }) => (b === 'views' ? <Eye className="size-3.5 text-muted-foreground" strokeWidth={1.8} /> : <Heart className="size-3.5 text-muted-foreground" strokeWidth={1.8} />);

export interface PanelProps {
  /** linhas que passaram nos filtros da barra */
  rows: CRow[];
  /** todas as linhas (sem filtro): janela de coleta de cada perfil */
  all: CRow[];
  periodo: string;
  owners?: Map<string, Owner>;
  mediaOf: (r: CRow) => string | undefined;
  ideaBusy: (r: CRow) => boolean;
  onMark: (r: CRow, patch: Partial<ItemMark>) => void;
  /** abre a gaveta do item; `ideia` = já rola até o "Virar ideia" com o título pronto (um clique até um diálogo simples) */
  onOpen: (r: CRow, ideia?: boolean) => void;
  onGoTable: () => void;
}

export default function ContentsPanel(p: PanelProps) {
  const { rows } = p;
  const [quad, setQuad] = useState<Quad | null>(null);
  const counts = useMemo(() => {
    const c: Record<Quad, number> = { viralizou: 0, achado: 0, efeito: 0, resto: 0, sem: 0 };
    for (const r of rows) { const q = quadOf(r); if (q) c[q]++; }
    return c;
  }, [rows]);

  return (
    <div className="flex flex-col gap-4">
      <Faixa rows={rows} counts={counts} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7" title="Conteúdo bom ou perfil grande?" sub="cada ponto é um conteúdo · clique para abrir">
          <Mapa {...p} quad={quad} />
          <QuadChips counts={counts} quad={quad} onQuad={setQuad} />
        </Card>
        <Fila {...p} quad={quad} onClearQuad={() => setQuad(null)} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2 items-start">
        <Regua rows={rows} owners={p.owners} />
        <Aposta {...p} />
      </div>
    </div>
  );
}

function Card({ title, sub, right, className, children, bodyClass }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; className?: string; children: ReactNode; bodyClass?: string }) {
  return (
    <section className={cx('bg-card border border-border rounded-xl flex flex-col min-w-0', className)}>
      <header className="flex items-center gap-2 px-4 pt-3 pb-2 min-h-11">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-tight truncate">{title}</h2>
          {sub && <div className="text-[11px] text-muted-foreground truncate">{sub}</div>}
        </div>
        {right && <div className="ml-auto flex items-center gap-2 shrink-0">{right}</div>}
      </header>
      <div className={cx('px-4 pb-3 flex-1 min-h-0', bodyClass)}>{children}</div>
    </section>
  );
}

// ---------- 1. faixa ----------
function Faixa({ rows, counts }: { rows: CRow[]; counts: Record<Quad, number> }) {
  const comps = new Set(rows.map((r) => r.compId)).size;
  const hotP = rows.filter((r) => (r.outlier ?? 0) >= 3);
  const sigP = rows.filter((r) => (r.outlier ?? 0) >= 2).length;
  const hotM = rows.filter((r) => (r.outlierMercado ?? 0) >= 3);
  const byComp = new Map<string, number>();
  for (const r of hotM) byComp.set(r.compName ?? r.compId ?? '?', (byComp.get(r.compName ?? r.compId ?? '?') ?? 0) + 1);
  const top = [...byComp.entries()].sort((a, b) => b[1] - a[1])[0];
  const topShare = top && hotM.length ? top[1] / hotM.length : 0;
  // régua: o grupo rede · formato com mais itens (empate: o que tem views)
  const groups = new Map<string, CRow[]>();
  for (const r of rows) { const k = `${r.platform}|${r.item.type}`; groups.set(k, [...(groups.get(k) ?? []), r]); }
  const main = [...groups.entries()].map(([k, g]) => ({ k, g, b: baseOf(g) })).sort((a, b) => b.g.length - a.g.length || (a.b.basis === 'views' ? -1 : 1))[0];
  const [net, type] = main ? main.k.split('|') : ['', ''];
  const mainComps = main ? new Set(main.g.map((r) => r.compId)).size : 0;

  return (
    <StatStrip items={[
      { icon: Clapperboard, label: 'Conteúdos', value: fmtNum(rows.length), sub: `de ${comps} concorrente${comps === 1 ? '' : 's'}` },
      { icon: User, label: 'Fora da curva ≥3× perfil', value: String(hotP.length), sub: `≥2× (sinal): ${sigP}`, title: 'views ÷ mediana do próprio perfil (sem views: curtidas). O Instagram tem 6 posts por perfil: ≥2× já é sinal.' },
      {
        icon: Globe2, label: 'Fora da curva ≥3× mercado', value: String(hotM.length),
        sub: top && topShare > 0.5
          ? <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400"><AlertTriangle className="size-3" />{Math.round(topShare * 100)}% {top[0]}: olhe o mapa</span>
          : top ? `mais: ${top[0]} (${Math.round(topShare * 100)}%)` : 'mesma rede e formato',
        title: 'views ÷ mediana dos concorrentes na mesma rede e formato. Mais da metade de um só concorrente = mede tamanho de perfil, não conteúdo.',
      },
      { icon: Flame, label: 'Viralizou de verdade', value: String(counts.viralizou), sub: '≥2× no perfil e no mercado', title: QUAD.viralizou.hint },
      {
        icon: Ruler, label: main ? `Régua · ${fmtLabel(type)} ${NET_SHORT[net] ?? platformLabel(net)}` : 'Régua',
        value: main ? <span className="inline-flex items-baseline gap-1">{fmtMed(main.b.med)}<span className="text-xs font-normal text-muted-foreground">{main.b.basis === 'views' ? 'views' : 'curtidas'}</span></span> : '—',
        sub: main ? `mediana · n = ${main.g.length} · ${mainComps} conc.` : undefined,
        title: 'Mediana da métrica-base no formato com mais conteúdos do filtro: a meta inicial dos posts da Kzloo nesse formato.',
      },
    ]} />
  );
}

// ---------- 2. mapa ----------
type Pt = { x: number; y: number; r: CRow; q: Quad; label?: string; left?: boolean };
const clampLog = (v: number) => Math.log10(Math.max(v, 0.02));
const ratioTick = (t: number) => { const v = 10 ** t; return v < 0.1 ? `${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×` : fmtRatio(v).replace(/,0×$/, '×'); };

function Mapa({ rows, onOpen, quad }: PanelProps & { quad: Quad | null }) {
  const { pts, xDom, yDom, xTicks, yTicks, band } = useMemo(() => {
    const withP = rows.filter((r) => r.outlier != null);
    const ms = withP.filter((r) => r.outlierMercado != null).map((r) => clampLog(r.outlierMercado!));
    const ps = withP.map((r) => clampLog(r.outlier!));
    const xlo = Math.min(-1, Math.floor(Math.min(...ms, 0))), xhi = Math.max(1, Math.ceil(Math.max(...ms, 0)));
    const ylo = Math.min(-1, Math.floor(Math.min(...ps, 0))), yhi = Math.max(1, Math.ceil(Math.max(...ps, 0)));
    const hasSem = withP.some((r) => r.outlierMercado == null);
    const bandW = (xhi - xlo) * 0.14;
    const band = hasSem ? { x0: xlo - bandW * 1.25, x1: xlo - bandW * 0.25, mid: xlo - bandW * 0.75 } : null;
    // rótulo direto nos 5 de maior × perfil entre os que importam (viralizou / achado), senão os maiores no geral
    const ranked = [...withP].sort((a, b) => (b.outlier ?? 0) - (a.outlier ?? 0));
    const lead = new Set(ranked.filter((r) => ['viralizou', 'achado'].includes(quadOf(r)!)).slice(0, 5));
    if (lead.size < 3) ranked.slice(0, 3).forEach((r) => lead.add(r));
    // pontos sem mercado: espalha um pouco na horizontal da faixa (determinístico) para não empilhar
    const posOf = (r: CRow, i: number) => ({
      x: r.outlierMercado != null ? clampLog(r.outlierMercado) : band!.mid + (((i * 37) % 11) / 10 - 0.5) * bandW * 0.6,
      y: clampLog(r.outlier!),
    });
    // nome só onde cabe, do maior para o menor: descarta o rótulo que cairia em cima de outro já escolhido (o período "Tudo" tem dezenas de pontos)
    const kept: { x: number; y: number }[] = [];
    const named = new Set<CRow>();
    for (const r of ranked) {
      if (!lead.has(r)) continue;
      const p = posOf(r, withP.indexOf(r));
      if (kept.some((k) => Math.abs(k.x - p.x) < (xhi - xlo) * 0.2 && Math.abs(k.y - p.y) < (yhi - ylo) * 0.1)) continue;
      kept.push(p); named.add(r);
    }
    const pts: Pt[] = withP.map((r, i) => {
      const { x, y } = posOf(r, i);
      return { x, y, r, q: quadOf(r)!, label: named.has(r) ? (r.compName ?? '') : undefined, left: x > xhi - (xhi - xlo) * 0.2 };
    });
    const dec = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    return {
      pts, band,
      xDom: [band ? band.x0 : xlo, xhi] as [number, number], yDom: [ylo, yhi] as [number, number],
      xTicks: [...dec(xlo, xhi), L2].sort((a, b) => a - b), yTicks: dec(ylo, yhi), // sem o 2× aqui: o tique extra escondia o 1× (a linha tracejada já marca o 2×)
    };
  }, [rows]);

  const byQuad = QUAD_ORDER.map((q) => ({ q, data: pts.filter((pt) => pt.q === q) }));
  const fade = (q: Quad) => (quad && quad !== q ? 0.15 : 1);
  const lbl = (value: string, position: 'insideTopLeft' | 'insideTopRight' | 'insideBottomRight', color: string) =>
    ({ value, position, fill: color, fontSize: 10, fontWeight: 600, letterSpacing: 0.4 });

  return (
    <div className="relative h-[340px] -ml-2">
      <span className="absolute left-2 top-0 inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">× perfil (log)<ArrowUp className="size-3" /></span>
      <span className="absolute right-3 bottom-0 inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">× mercado (log)<ArrowRight className="size-3" /></span>
      <ChartContainer config={{}} className="aspect-auto h-full w-full">
        <ScatterChart margin={{ top: 20, right: 12, bottom: 18, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.6} />
          {band && <ReferenceArea x1={band.x0} x2={band.x1} y1={yDom[0]} y2={yDom[1]} fill="var(--color-muted)" fillOpacity={0.7} stroke="none"
            label={{ value: 'SEM MERCADO', position: 'insideTop', fill: 'var(--color-muted-foreground)', fontSize: 9, fontWeight: 600 }} />}
          <ReferenceArea x1={L2} x2={xDom[1]} y1={L2} y2={yDom[1]} fill={QUAD.viralizou.color} fillOpacity={0.07} stroke="none" label={lbl('VIRALIZOU', 'insideTopRight', QUAD.viralizou.color)} />
          <ReferenceArea x1={band ? band.x1 + 0.05 : xDom[0]} x2={0} y1={L2} y2={yDom[1]} fill={QUAD.achado.color} fillOpacity={0.07} stroke="none" label={lbl('ACHADO DE PERFIL PEQUENO', 'insideTopLeft', QUAD.achado.color)} />
          <ReferenceArea x1={L2} x2={xDom[1]} y1={yDom[0]} y2={L15} fill={QUAD.efeito.color} fillOpacity={0.07} stroke="none" label={lbl('EFEITO TAMANHO', 'insideBottomRight', QUAD.efeito.color)} />
          <ReferenceLine x={0} stroke="var(--color-muted-foreground)" strokeOpacity={0.45} />
          <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeOpacity={0.45} />
          <ReferenceLine x={L2} stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeOpacity={0.6} />
          <ReferenceLine y={L2} stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeOpacity={0.6} />
          <XAxis type="number" dataKey="x" domain={xDom} ticks={xTicks} tickFormatter={ratioTick} allowDataOverflow tickLine={false} axisLine={false} fontSize={11}
            />
          <YAxis type="number" dataKey="y" domain={yDom} ticks={yTicks} tickFormatter={ratioTick} allowDataOverflow tickLine={false} axisLine={false} fontSize={11} width={44} />
          <ChartTooltip cursor={false} isAnimationActive={false} content={<MapTip />} />
          {byQuad.map(({ q, data }) => (
            <Scatter key={q} name={QUAD[q].label} data={data} isAnimationActive={false}
              shape={(s: unknown) => <Dot {...(s as DotProps)} color={QUAD[q].color} hollow={q === 'sem'} opacity={fade(q)} onOpen={onOpen} />} />
          ))}
        </ScatterChart>
      </ChartContainer>
    </div>
  );
}

type DotProps = { cx?: number; cy?: number; payload?: Pt };
function Dot({ cx = 0, cy = 0, payload, color, hollow, opacity, onOpen }: DotProps & { color: string; hollow?: boolean; opacity: number; onOpen: (r: CRow) => void }) {
  if (!payload) return null;
  return (
    <g opacity={opacity} style={{ cursor: 'pointer' }} onClick={() => onOpen(payload.r)} data-ponto={payload.r.mk}>
      <circle cx={cx} cy={cy} r={11} fill="transparent" />
      <circle cx={cx} cy={cy} r={hollow ? 3.5 : 5} fill={hollow ? 'var(--color-card)' : color} stroke={hollow ? color : 'var(--color-card)'} strokeWidth={hollow ? 1.5 : 2} />
      {payload.label && opacity === 1 && (
        <text x={payload.left ? cx - 8 : cx + 8} y={cy + 3.5} textAnchor={payload.left ? 'end' : 'start'} fontSize={10.5} fontWeight={500} fill="var(--color-foreground)" stroke="var(--color-card)" strokeWidth={3} paintOrder="stroke">{payload.label}</text>
      )}
    </g>
  );
}

function MapTip({ active, payload }: { active?: boolean; payload?: { payload?: Pt }[] }) {
  const pt = payload?.[0]?.payload;
  if (!active || !pt) return null;
  const r = pt.r;
  return (
    <div className="bg-background border border-border/60 rounded-lg shadow-xl px-3 py-2 text-xs max-w-[280px]">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
        <PlatformIcon platform={r.platform} size={12} /><span className="truncate">{r.compName} · {fmtLabel(r.item.type)}</span>
      </div>
      <div className="font-medium leading-snug line-clamp-2 mb-1.5">{titleOf(r)}</div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 tabular-nums">
        <span className="text-muted-foreground">× perfil</span><span className="font-semibold">{fmtRatio(r.outlier)} <span className="font-normal text-muted-foreground">({r.outlierBasis === 'likes' ? 'curtidas' : 'views'})</span></span>
        <span className="text-muted-foreground">× mercado</span>
        <span className="font-semibold">{r.outlierMercado != null ? <>{fmtRatio(r.outlierMercado)} <span className="font-normal text-muted-foreground">(n = {r.mercadoAmostra}, {r.mercadoConcorrentes} conc.)</span></> : <span className="font-normal text-muted-foreground">— menos de 3 concorrentes (n={r.mercadoConcorrentes ?? 0})</span>}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: QUAD[pt.q].color }} /><span className="font-medium">{QUAD[pt.q].label}</span></div>
    </div>
  );
}

function QuadChips({ counts, quad, onQuad }: { counts: Record<Quad, number>; quad: Quad | null; onQuad: (q: Quad | null) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1" role="group" aria-label="Filtrar a fila por quadrante">
      {QUAD_ORDER.map((q) => (
        <Tip key={q} content={QUAD[q].hint}>
          <button type="button" aria-pressed={quad === q} onClick={() => onQuad(quad === q ? null : q)}
            className={cx('h-6 inline-flex items-center gap-1.5 rounded-full border px-2 text-[11px] transition whitespace-nowrap',
              quad === q ? 'border-foreground/40 bg-muted text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
            <span className={cx('size-2 rounded-full', q === 'sem' && 'border-[1.5px] bg-transparent')} style={q === 'sem' ? { borderColor: QUAD[q].color } : { background: QUAD[q].color }} />
            {QUAD[q].label}<span className="tabular-nums font-semibold text-foreground">{counts[q]}</span>
          </button>
        </Tip>
      ))}
      {quad && <button type="button" onClick={() => onQuad(null)} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"><X className="size-3" />todos</button>}
    </div>
  );
}

// ---------- 3. fila ----------
function Fila({ rows, mediaOf, ideaBusy, onMark, onOpen, onGoTable, quad, onClearQuad }: PanelProps & { quad: Quad | null; onClearQuad: () => void }) {
  const [efeito, setEfeito] = useState(false);
  const list = useMemo(() => rows.filter((r) => {
    const st = r.mark?.status ?? 'nova';
    if (!(st === 'nova' || st === 'marcada') || r.mark?.ideaId) return false;
    const q = quadOf(r);
    if (quad && q !== quad) return false;
    return (r.outlier ?? 0) >= 2 || (efeito && q === 'efeito') || (quad === 'efeito' && q === 'efeito');
  }).sort((a, b) => (b.outlier ?? 0) - (a.outlier ?? 0)), [rows, quad, efeito]);

  return (
    <Card className="lg:col-span-5 lg:h-[422px]" bodyClass="!px-0 !pb-0 flex flex-col"
      title={<span className="inline-flex items-center gap-2">Para virar ideia<span className="text-xs font-semibold tabular-nums rounded-full bg-muted px-1.5">{list.length}</span></span>}
      sub={quad ? <>só <b className="font-medium text-foreground">{QUAD[quad].label.toLowerCase()}</b> · <button type="button" onClick={onClearQuad} className="underline">ver todos</button></> : '≥2× no perfil, ainda sem ideia · maior primeiro'}
      right={<FlagToggle on={efeito} onChange={setEfeito} icon={Scale} label="Efeito tamanho" tone="amber" title="Mostrar também os itens de efeito tamanho (alto no mercado só porque o perfil é grande)" />}>
      <div className="flex-1 min-h-0 overflow-y-auto border-t border-border">
        {!list.length && (
          <div className="h-full min-h-40 grid place-items-center text-center px-6">
            <div><CheckCircle2 className="size-6 mx-auto text-success-ink mb-1.5" /><div className="text-sm font-medium">Fila zerada</div><div className="text-xs text-muted-foreground">Nada ≥2× sem ideia neste filtro.</div></div>
          </div>
        )}
        <ul className="divide-y divide-border">
          {list.map((r) => {
            const busy = ideaBusy(r);
            return (
              <li key={`${r.compId}|${r.profileKey}|${r.mk}`} className="group flex items-center gap-3 px-4 py-1.5 hover:bg-muted/40">
                <button type="button" onClick={() => onOpen(r)} className="flex items-center gap-3 min-w-0 flex-1 text-left" aria-label={`Abrir ${titleOf(r)}`}>
                  <Thumb r={r} media={mediaOf(r)} className="size-10 rounded-md shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-tight truncate group-hover:text-primary-ink" title={titleOf(r)}>{titleOf(r)}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 min-w-0">
                      <PlatformIcon platform={r.platform} size={11} /><span className="truncate">{r.compName} · {fmtLabel(r.item.type)}</span>
                    </span>
                  </span>
                </button>
                <span className="w-[108px] shrink-0 grid grid-cols-[1fr_auto] gap-x-1 gap-y-0.5 items-baseline text-[11px] leading-tight text-right whitespace-nowrap [&_svg]:inline">
                  <RatioCell v={r.outlier} tip={perfilTip(r)} /><span className="text-muted-foreground text-left">perfil</span>
                  <RatioCell v={r.outlierMercado} tip={r.outlierMercado != null ? mercadoTip(r) : mercadoVazioTip(r)} /><span className="text-muted-foreground text-left">mercado</span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Tip content="Virar ideia: abre o item com o título pronto para criar"><button type="button" aria-label="Virar ideia" onClick={() => onOpen(r, true)} disabled={busy}
                    className="h-7 inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary-soft px-2 text-xs font-medium text-primary-ink hover:bg-primary/15 disabled:opacity-50">
                    {busy ? <Spinner /> : <Sparkles className="size-3.5" />}Ideia
                  </button></Tip>
                  <Tip content="Descartar (sai da fila)">
                    <button type="button" aria-label="Descartar" onClick={() => onMark(r, { status: 'descartada' })}
                      className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/40"><X className="size-3.5" /></button>
                  </Tip>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="border-t border-border px-4 py-2 flex items-center text-[11px] text-muted-foreground">
        <span>Meta: fila zerada toda semana</span>
        <button type="button" onClick={onGoTable} className="ml-auto inline-flex items-center gap-1 font-medium text-primary-ink hover:underline">ver na tabela<ArrowRight className="size-3" /></button>
      </div>
    </Card>
  );
}

// ---------- 4. régua por formato ----------
const WeakSeal = ({ why }: { why: string }) => (
  <Tip content={`Amostra fraca: ${why}. Use como pista, não como meta.`}>
    <span className="inline-flex items-center gap-0.5 rounded px-1 text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 cursor-help"><AlertTriangle className="size-2.5" />fraca</span>
  </Tip>
);

function Regua({ rows, owners }: { rows: CRow[]; owners?: Map<string, Owner> }) {
  const groups = useMemo(() => {
    const m = new Map<string, CRow[]>();
    for (const r of rows) { const k = `${r.platform}|${r.item.type}`; m.set(k, [...(m.get(k) ?? []), r]); }
    return [...m.entries()].map(([k, g]) => {
      const [net, type] = k.split('|');
      const comps = new Map<string, number>();
      for (const r of g) comps.set(r.compId ?? '', (comps.get(r.compId ?? '') ?? 0) + 1);
      const top = [...comps.entries()].sort((a, b) => b[1] - a[1])[0];
      const eng = median(g.map((r) => r.engagement).filter((x): x is number => x != null));
      const sig = g.filter((r) => (r.outlier ?? 0) >= 2).length;
      return { k, net, type, n: g.length, comps: comps.size, b: baseOf(g), eng, sig: g.length ? sig / g.length : 0, top: top?.[0], topN: top?.[1] ?? 0 };
    }).sort((a, b) => b.n - a.n);
  }, [rows]);
  const th = 'px-2 py-1.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap';
  return (
    <Card title="Régua por formato" sub="quanto um conteúdo típico do nicho faz em cada rede · formato (mediana)">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead><tr className="[&>th]:border-b [&>th]:border-border">
          <th className={cx(th, 'text-left pl-0')}>Rede · formato</th><th className={cx(th, 'text-right')}>n</th><th className={cx(th, 'text-right')}>Conc.</th>
          <th className={cx(th, 'text-right')}>Mediana</th><th className={cx(th, 'text-right')} title="(curtidas + comentários + envios) ÷ views">Engaj.</th>
          <th className={cx(th, 'text-right')} title="% dos conteúdos com ≥2× o próprio perfil">≥2× perfil</th><th className={cx(th, 'text-left pr-0')}>Quem mais publica</th>
        </tr></thead>
        <tbody>
          {groups.map((g) => {
            const weak = g.n < 10 ? `só ${g.n} conteúdos (mínimo 10)` : g.comps < 3 ? `só ${g.comps} concorrente${g.comps === 1 ? '' : 's'} (mínimo 3)` : '';
            const o = g.top ? owners?.get(g.top) : undefined;
            return (
              <tr key={g.k} className="[&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0">
                <td className="py-1.5 pr-2"><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><PlatformIcon platform={g.net} size={14} />{fmtLabel(g.type)}{weak && <WeakSeal why={weak} />}</span></td>
                <td className="px-2 text-right tabular-nums">{g.n}</td>
                <td className="px-2 text-right tabular-nums">{g.comps}</td>
                <td className="px-2 text-right tabular-nums font-semibold whitespace-nowrap"><span className="inline-flex items-center gap-1">{fmtMed(g.b.med)}<BasisIcon b={g.b.basis} /></span></td>
                <td className="px-2 text-right tabular-nums">{g.eng != null ? fmtPct(g.eng) : <span className="text-muted-foreground" title="sem views: sem engajamento">—</span>}</td>
                <td className="px-2 text-right tabular-nums">{Math.round(g.sig * 100)}%</td>
                <td className="py-1.5 pl-2 max-w-[150px]">
                  {g.top && <span className="inline-flex items-center gap-1.5 min-w-0 text-xs"><Avatar name={o?.name ?? g.top} size={16} local={o?.local} remote={o?.remote} className="!ring-0 shrink-0" /><span className="truncate">{o?.name ?? g.top}</span><span className="text-muted-foreground tabular-nums">{g.topN}</span></span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><Eye className="size-3" />views</span>
        <span className="inline-flex items-center gap-1"><Heart className="size-3" />curtidas (formato sem views)</span>
        <span className="inline-flex items-center gap-1"><AlertTriangle className="size-3 text-amber-600" />amostra fraca: n &lt; 10 ou &lt; 3 concorrentes</span>
      </div>
    </Card>
  );
}

// ---------- 5. aposta de cada concorrente ----------
function Aposta({ rows, all, periodo, owners, onOpen }: PanelProps) {
  const data = useMemo(() => {
    const now = Date.now();
    const days = periodo === 'tudo' ? null : Number(periodo);
    const oldestOf = new Map<string, number>();
    for (const r of all) {
      if (!r.item.publishedAt) continue;
      const k = `${r.compId}|${r.profileKey}`, t = Date.parse(r.item.publishedAt);
      oldestOf.set(k, Math.min(oldestOf.get(k) ?? t, t));
    }
    // todo concorrente com perfil coletado entra, mesmo sem post no filtro (0 posts/sem); o "Último" olha a coleta inteira
    const by = new Map<string, CRow[]>();
    const allBy = new Map<string, CRow[]>();
    for (const r of all) allBy.set(r.compId ?? '', [...(allBy.get(r.compId ?? '') ?? []), r]);
    for (const id of allBy.keys()) by.set(id, []);
    for (const r of rows) by.set(r.compId ?? '', [...(by.get(r.compId ?? '') ?? []), r]);
    return [...by.entries()].map(([id, g]) => {
      const ga = allBy.get(id) ?? g;
      // posts por semana: soma de cada perfil ÷ semanas da janela (o período, ou desde o post mais antigo coletado se a coleta for mais curta)
      const profiles = new Map<string, number>();
      for (const r of g) profiles.set(r.profileKey, (profiles.get(r.profileKey) ?? 0) + 1);
      let rate = 0, short = false;
      for (const [pk, n] of profiles) {
        const oldest = oldestOf.get(`${id}|${pk}`);
        const since = oldest != null ? (now - oldest) / dayMs : days ?? 7;
        let win = days ?? since;
        if (days != null && since < days) { win = since; short = true; }
        rate += n / (Math.max(win, 7) / 7);
      }
      const mix = new Map<string, number>();
      for (const r of g) mix.set(r.item.type, (mix.get(r.item.type) ?? 0) + 1);
      const vids = g.filter((r) => isVideoType(r.item.type)).map((r) => r.item.metrics.views).filter((v): v is number => !!v);
      const best = [...g].sort((a, b) => (b.outlier ?? 0) - (a.outlier ?? 0))[0];
      const last = Math.max(0, ...ga.map((r) => (r.item.publishedAt ? Date.parse(r.item.publishedAt) : 0)));
      return { id, name: ga[0]?.compName ?? id, n: g.length, rate, short, mix: [...mix.entries()].sort((a, b) => FMT_ORDER.indexOf(a[0]) - FMT_ORDER.indexOf(b[0])), vid: median(vids), best, lastDays: last ? (now - last) / dayMs : undefined, lastIso: ga.find((r) => r.item.publishedAt && Date.parse(r.item.publishedAt) === last)?.item.publishedAt };
    }).sort((a, b) => b.rate - a.rate);
  }, [rows, all, periodo]);
  const types = FMT_ORDER.filter((t) => data.some((d) => d.mix.some(([x]) => x === t)));
  const anyShort = data.some((d) => d.short);
  const th = 'px-2 py-1.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap';

  return (
    <Card title="Aposta de cada concorrente" sub="ritmo e mix de formatos no filtro"
      right={<div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">{types.map((t) => <span key={t} className="inline-flex items-center gap-1"><span className="size-2 rounded-sm" style={{ background: FMT_COLOR[t] ?? NEUTRAL }} />{fmtLabel(t)}</span>)}</div>}>
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead><tr className="[&>th]:border-b [&>th]:border-border">
          <th className={cx(th, 'text-left pl-0')}>Concorrente</th><th className={cx(th, 'text-right')} title="posts por semana no período, somando as redes">Posts/sem</th>
          <th className={cx(th, 'text-left w-[30%]')}>Mix</th><th className={cx(th, 'text-right')} title="mediana de views dos vídeos (reel, short, vídeo)">Views/vídeo</th>
          <th className={cx(th, 'text-right')}>Maior × perfil</th><th className={cx(th, 'text-right pr-0')}>Último</th>
        </tr></thead>
        <tbody>
          {data.map((d) => {
            const o = owners?.get(d.id);
            const stale = (d.lastDays ?? 0) >= 21;
            return (
              <tr key={d.id} className="[&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0">
                <td className="py-1.5 pr-2 max-w-[150px]"><span className="inline-flex items-center gap-1.5 min-w-0"><Avatar name={o?.name ?? d.name} size={18} local={o?.local} remote={o?.remote} className="!ring-0 shrink-0" /><span className="truncate text-[13px]">{o?.name ?? d.name}</span></span></td>
                <td className="px-2 text-right tabular-nums font-semibold">{d.rate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}{d.short && <span className="text-muted-foreground font-normal" title="a coleta deste perfil cobre menos que o período: conta desde o post mais antigo coletado">*</span>}</td>
                <td className="px-2">
                  {!d.mix.length ? <span className="text-xs text-muted-foreground">sem posts no filtro</span> : <Tip content={d.mix.map(([t, n]) => `${fmtLabel(t)}: ${n} (${Math.round((n / d.n) * 100)}%)`).join('\n')}>
                    <div className="flex h-2.5 w-full gap-[2px] rounded-sm overflow-hidden">
                      {d.mix.map(([t, n]) => <div key={t} style={{ flex: n, background: FMT_COLOR[t] ?? NEUTRAL }} />)}
                    </div>
                  </Tip>}
                </td>
                <td className="px-2 text-right tabular-nums">{d.vid != null ? fmtNum(Math.round(d.vid)) : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-2 text-right">{d.best?.outlier != null ? <button type="button" onClick={() => onOpen(d.best)} title={`Abrir: ${titleOf(d.best)}`} className="hover:underline"><RatioCell v={d.best.outlier} /></button> : '—'}</td>
                <td className={cx('py-1.5 pl-2 text-right tabular-nums whitespace-nowrap text-xs', stale ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-muted-foreground')}>
                  {stale ? <Tip content="3 semanas ou mais sem postar: parou? Vale uma nota na ficha."><span className="inline-flex items-center gap-1 cursor-help"><AlertTriangle className="size-3" />{timeAgo(d.lastIso)}</span></Tip> : timeAgo(d.lastIso)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {anyShort && <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1"><Info className="size-3" />* a coleta do perfil cobre menos que o período (Instagram = 6 posts): o ritmo conta desde o post mais antigo coletado.</div>}
    </Card>
  );
}
