// Comparar > Preços: peças visuais compartilhadas (selo de faixa, preço com promo/frescor, quem).
import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../../components/competitors/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cx } from '../../../components/kit';
import { BANDS, brl, dd, dmy, valueOf, type Band, type Lens, type PlanRow } from './precosLib';

export const BAND_CLS: Record<Band, string> = {
  entrada: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  popular: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  intermediaria: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  premium: 'bg-ai/15 text-ai-ink',
};
export const bandLabel = (b: Band) => BANDS.find((x) => x.id === b)!.label;
export const BandChip = ({ b, className }: { b?: Band; className?: string }) => b
  ? <span className={cx('inline-block rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap', BAND_CLS[b], className)}>{bandLabel(b)}</span>
  : <span className="text-muted-foreground">—</span>;

export const dash = <span className="text-muted-foreground" title="não coletado">—</span>;

/** aviso discreto quando o preço é velho (> 60 dias) ou a confiança não é alta */
export const StaleMark = ({ p }: { p: PlanRow }) => !p.stale ? null : (
  <Tooltip><TooltipTrigger asChild><span className="inline-flex align-middle text-warning-ink"><TriangleAlert className="size-3" /></span></TooltipTrigger>
    <TooltipContent>{p.confidence && p.confidence !== 'alta' ? `Confiança ${p.confidence}. ` : ''}Coletado em {dmy(p.updatedAt) || 'data desconhecida'}: conferir no site antes de decidir.</TooltipContent></Tooltip>
);

/** preço mensal na lente (vigente com o cheio riscado e o selo da promo) */
export function PriceTag({ p, lens, big, compact }: { p: PlanRow; lens: Lens; big?: boolean; compact?: boolean }) {
  if (p.onRequest && p.monthly == null) return <span className="text-muted-foreground text-xs">sob consulta</span>;
  if (p.free) return <b>Grátis</b>;
  const v = valueOf(p, { ...lens, cycle: 'mensal' });
  const promo = p.regular != null && p.monthly != null && p.regular > p.monthly;
  return (
    <span className={cx('inline-flex items-baseline gap-x-1.5 gap-y-0', compact ? 'flex-nowrap' : 'flex-wrap')}>
      <b className={cx('tabular-nums', big && 'text-lg')}>{brl(v)}</b>
      {promo && lens.promo === 'vigente' && <span className="text-[11px] text-muted-foreground line-through tabular-nums">{brl(p.regular)}</span>}
      {promo && lens.promo === 'vigente' && <span className="rounded bg-warning/15 px-1 text-[10px] font-medium text-warning-ink whitespace-nowrap">promo{!compact && p.plan.promo?.until ? ` até ${dd(p.plan.promo.until)}` : ''}</span>}
      <StaleMark p={p} />
    </span>
  );
}

export const Who = ({ slug, p, size = 20 }: { slug: string; p: PlanRow; size?: number }) => p.isRef ? (
  <Link to={`/p/${slug}/contexto`} className="inline-flex items-center gap-1.5 font-semibold text-primary-ink">
    <Avatar name={p.comp} size={size} className="!ring-0" />{p.comp}<span className="text-[10px] font-medium px-1.5 rounded-full bg-primary text-primary-foreground">você</span>
  </Link>
) : (
  <Link to={`/p/${slug}/concorrentes/${p.compId}`} className="inline-flex items-center gap-1.5 font-medium hover:text-primary-ink">
    <Avatar name={p.comp} size={size} local={p.row.avatar.local} remote={p.row.avatar.remote} className="!ring-0" />{p.comp}
  </Link>
);
