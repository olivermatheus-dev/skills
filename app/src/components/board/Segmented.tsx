import { cx } from '../kit';

/** Grupo de botões exclusivo (visão, quadro). */
export function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T; options: { id: T; label: string; count?: number }[]; onChange: (v: T) => void; label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex p-0.5 rounded-lg bg-muted border border-border">
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}
          className={cx('px-2.5 py-1 rounded-md text-sm transition whitespace-nowrap',
            value === o.id ? 'bg-card shadow-sm text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')}>
          {o.label}{o.count != null && <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
