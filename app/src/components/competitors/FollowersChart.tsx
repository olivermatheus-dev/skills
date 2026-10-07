// Seguidores ao longo das coletas: um gráfico pequeno por perfil (escala própria), SVG inline com cursor e tooltip.
import { useEffect, useRef, useState } from 'react';
import { fmtNum } from '../ui';
import { PlatformIcon, fmtDelta } from './lib';

export interface FollowerSeries { key: string; label: string; platform: string; color: string; points: { at: string; v: number }[] }

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export function FollowerMini({ s }: { s: FollowerSeries }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 84, padX = 6, padY = 10;
  const pts = s.points;
  const first = pts[0], last = pts.at(-1)!;
  const t0 = new Date(first.at).getTime(), t1 = new Date(last.at).getTime();
  const vs = pts.map((p) => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs);
  if (hi === lo) { lo -= Math.max(1, lo * 0.01); hi += Math.max(1, hi * 0.01); }
  const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
  const x = (at: string) => (t1 === t0 ? w / 2 : padX + ((new Date(at).getTime() - t0) / (t1 - t0)) * (w - padX * 2));
  const y = (v: number) => padY + (1 - (v - lo) / (hi - lo)) * (H - padY * 2);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const delta = pts.length > 1 ? last.v - first.v : undefined;
  const h = hover != null ? pts[hover] : null;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    let best = 0;
    pts.forEach((p, i) => { if (Math.abs(x(p.at) - mx) < Math.abs(x(pts[best].at) - mx)) best = i; });
    setHover(best);
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-surface">
      <div className="flex items-center gap-2 text-xs text-muted">
        <PlatformIcon platform={s.platform} size={14} />
        <span className="truncate">{s.label}</span>
        <span className="ml-auto">{pts.length} coleta{pts.length > 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-semibold tabular-nums">{fmtNum(h?.v ?? last.v)}</span>
        {h ? <span className="text-xs text-muted">em {shortDate(h.at)}</span>
          : delta != null && delta !== 0 && <span className={delta > 0 ? 'text-xs text-ok' : 'text-xs text-danger'}>{fmtDelta(delta)} desde {shortDate(first.at)}</span>}
      </div>
      <div ref={ref} className="relative mt-1">
        {w > 0 && (
          <svg width={w} height={H} className="block overflow-visible" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img"
            aria-label={`Seguidores de ${s.label}: ${pts.map((p) => `${shortDate(p.at)} ${p.v}`).join(', ')}`}>
            <line x1={0} x2={w} y1={H - 1} y2={H - 1} stroke="var(--color-border)" />
            {pts.length > 1 && <path d={`${d} L${x(last.at)},${H - 1} L${x(first.at)},${H - 1} Z`} fill={s.color} opacity={0.08} />}
            {pts.length > 1 && <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
            {hover != null && <line x1={x(pts[hover].at)} x2={x(pts[hover].at)} y1={0} y2={H} stroke="var(--color-muted)" strokeDasharray="2 3" opacity={0.6} />}
            {pts.map((p, i) => (
              <circle key={p.at} cx={x(p.at)} cy={y(p.v)} r={hover === i ? 4.5 : i === pts.length - 1 || pts.length === 1 ? 3.5 : 0}
                fill={s.color} stroke="var(--color-surface)" strokeWidth={2} />
            ))}
            <rect x={0} y={0} width={w} height={H} fill="transparent" />
          </svg>
        )}
        <div className="flex justify-between text-[10px] text-muted mt-1 tabular-nums">
          <span>{shortDate(first.at)}</span>
          {pts.length === 1 ? <span>o gráfico cresce a cada coleta</span> : <span>{shortDate(last.at)}</span>}
        </div>
      </div>
    </div>
  );
}

export default function FollowersChart({ series }: { series: FollowerSeries[] }) {
  if (!series.length) return null;
  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
      {series.map((s) => <FollowerMini key={s.key} s={s} />)}
    </div>
  );
}
