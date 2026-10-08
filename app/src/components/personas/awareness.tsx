// Nível de consciência (Eugene Schwartz) usado em personas e ideias.
import { cx } from '../kit';

export const AWARENESS: Record<number, string> = {
  1: 'inconsciente do problema',
  2: 'consciente do problema',
  3: 'consciente da solução',
  4: 'consciente do produto',
  5: 'pronto para comprar',
};

/** `color` = cor dos segmentos preenchidos (ex.: var(--pc) da persona); padrão = cor do projeto */
export function AwarenessMeter({ value, showLabel = true, color, className }: { value?: number; showLabel?: boolean; color?: string; className?: string }) {
  return (
    <div className={cx('flex items-center gap-2 min-w-0', className)} title={value ? `Consciência ${value} de 5 · ${AWARENESS[value]}` : 'consciência não definida'}>
      <div className="flex gap-0.5 shrink-0" aria-label={`consciência ${value ?? '—'} de 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const on = !!value && i <= value;
          return <span key={i} className={cx('h-1.5 w-4 rounded-full', on ? (color ? '' : 'bg-primary') : 'bg-muted border border-border')} style={on && color ? { background: color } : undefined} />;
        })}
      </div>
      {showLabel && <span className="text-xs text-muted-foreground truncate">{value ? AWARENESS[value] : 'consciência —'}</span>}
    </div>
  );
}
