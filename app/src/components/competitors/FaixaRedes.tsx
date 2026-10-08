// Topo compacto da aba "Redes e conteúdos" (042): números em linha (rótulo pequeno + valor), sparkline de seguidores
// (detalhe por coleta no tooltip) e as redes achadas no site como chips com ícone. Substitui os cards + gráfico + bloco de links.
import { useMemo, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cx, fmtNum } from '../kit';
import { PlatformIcon, fmtDelta } from './lib';
import { Tip } from './toolbar';
import type { FollowerSeries } from './FollowersChart';

export interface FaixaNumero { label: string; value: ReactNode; delta?: number; title?: string }

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const REDE_DO_LINK: [RegExp, string][] = [
  [/instagram\.com/i, 'instagram'], [/tiktok\.com/i, 'tiktok'], [/youtu(\.be|be\.com)/i, 'youtube'], [/facebook\.com|fb\.com/i, 'facebook'],
  [/linkedin\.com/i, 'linkedin'], [/(^|\/\/|\.)(x|twitter)\.com/i, 'x'],
];
const redeDe = (l: string) => REDE_DO_LINK.find(([re]) => re.test(l))?.[1] ?? 'outro';

/** soma dos seguidores das séries por data de coleta (cada série segura o último valor até a próxima coleta; só conta depois que todas começaram) */
function somar(series: FollowerSeries[]) {
  if (series.length <= 1) return series[0]?.points ?? [];
  const dia = (iso: string) => iso.slice(0, 10);
  const datas = [...new Set(series.flatMap((s) => s.points.map((p) => dia(p.at))))].sort();
  const inicio = series.map((s) => dia(s.points[0].at)).sort().at(-1)!;
  return datas.filter((d) => d >= inicio).map((d) => ({
    at: `${d}T12:00:00.000Z`,
    v: series.reduce((n, s) => n + ([...s.points].reverse().find((p) => dia(p.at) <= d)?.v ?? 0), 0),
  }));
}

function Spark({ pts }: { pts: { at: string; v: number }[] }) {
  const W = 88, H = 26, pad = 3;
  const vs = pts.map((p) => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs);
  if (hi === lo) { lo -= 1; hi += 1; }
  const t0 = new Date(pts[0].at).getTime(), t1 = new Date(pts.at(-1)!.at).getTime();
  const x = (a: string) => (t1 === t0 ? W / 2 : pad + ((new Date(a).getTime() - t0) / (t1 - t0)) * (W - pad * 2));
  const y = (v: number) => pad + (1 - (v - lo) / (hi - lo)) * (H - pad * 2);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const up = pts.at(-1)!.v >= pts[0].v;
  const cor = up ? 'var(--color-success-ink, #15803d)' : 'var(--color-destructive, #dc2626)';
  const last = pts.at(-1)!;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block overflow-visible" role="img" aria-label={`Seguidores nas últimas ${pts.length} coletas`}>
      <path d={d} fill="none" stroke={cor} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.at)} cy={y(last.v)} r={2.5} fill={cor} />
    </svg>
  );
}

export default function FaixaRedes({ numeros, series, linksSite, onAddLink }: {
  numeros: FaixaNumero[]; series: FollowerSeries[]; linksSite: string[]; onAddLink: (url: string) => void;
}) {
  const pts = useMemo(() => somar(series.filter((s) => s.points.length >= 2)), [series]);
  const detalhe = pts.length >= 2
    ? `Seguidores por coleta${series.length > 1 ? ' (soma das redes)' : ''}\n` + pts.map((p, i) => `${shortDate(p.at)}  ${p.v.toLocaleString('pt-BR')}${i ? `  (${fmtDelta(p.v - pts[i - 1].v) ?? '='})` : ''}`).join('\n')
    : undefined;
  return (
    <div className="mt-4 rounded-lg border border-border bg-card px-4 py-2.5 grid grid-cols-3 gap-x-4 gap-y-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
      {numeros.map((n) => (
        <Tip key={n.label} content={n.title}>
          <div className={cx('min-w-0', n.title && 'cursor-help')}>
            <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground leading-tight whitespace-nowrap">{n.label}</div>
            <div className="text-[15px] font-semibold tabular-nums leading-snug whitespace-nowrap">
              {n.value}
              {n.delta ? <span className={cx('ml-1 text-[11px] font-medium', n.delta > 0 ? 'text-success-ink' : 'text-destructive')}>{fmtDelta(n.delta)}</span> : null}
            </div>
          </div>
        </Tip>
      ))}
      {pts.length >= 2 && (
        <Tip content={detalhe}><div className="cursor-help col-span-3 sm:col-span-1" aria-label="Seguidores por coleta"><Spark pts={pts} /></div></Tip>
      )}
      {linksSite.length > 0 && (
        <div className="col-span-3 sm:col-span-1 flex flex-wrap items-center gap-1.5 sm:ml-auto">
          <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground whitespace-nowrap">Achadas no site</span>
          {linksSite.map((l) => (
            <Tip key={l} content={`Adicionar ${l.replace(/^https?:\/\/(www\.)?/, '')} aos perfis`}>
              <button type="button" onClick={() => onAddLink(l)} aria-label={`Adicionar ${l}`}
                className="group inline-flex items-center gap-1 rounded-full border border-border bg-background pl-1.5 pr-2 py-0.5 text-xs hover:border-primary hover:text-primary-ink">
                <PlatformIcon platform={redeDe(l)} size={13} /><Plus className="size-3 text-muted-foreground group-hover:text-primary-ink" />
              </button>
            </Tip>
          ))}
        </div>
      )}
    </div>
  );
}
