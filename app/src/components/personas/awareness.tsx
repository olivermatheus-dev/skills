// Nível de consciência (Eugene Schwartz) usado em personas e ideias.
import { cx } from '../kit';

export const AWARENESS: Record<number, string> = {
  1: 'inconsciente do problema',
  2: 'consciente do problema',
  3: 'consciente da solução',
  4: 'consciente do produto',
  5: 'pronto para comprar',
};

export function AwarenessMeter({ value, showLabel = true }: { value?: number; showLabel?: boolean }) {
  return (
    <div className="flex items-center gap-2" title={value ? `${value} · ${AWARENESS[value]}` : 'consciência não definida'}>
      <div className="flex gap-0.5" aria-label={`consciência ${value ?? '—'} de 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cx('h-1.5 w-4 rounded-full', value && i <= value ? 'bg-primary' : 'bg-muted border border-border')} />
        ))}
      </div>
      {showLabel && <span className="text-xs text-muted-foreground">{value ? AWARENESS[value] : 'consciência —'}</span>}
    </div>
  );
}
