// Identidade visual da persona: cor (paleta curta, legível no claro e no escuro), avatar com iniciais, papel e nome curto.
import { Ban, Check, Palette, Star, Users, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { PERSONA_COLORS, type PersonaColor } from '../../../../schema/persona';
import type { Persona } from '../../api';
import { cx } from '../kit';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

/**
 * solid = fundo do avatar e acentos (texto branco >= 4,7:1, node tools/contrast.mjs) · ink = texto da cor sobre o fundo suave.
 * O fundo suave mistura a cor com o --card, então acompanha o tema.
 */
export const PALETTE: Record<PersonaColor, { label: string; solid: string; ink: string }> = {
  indigo: { label: 'Índigo', solid: '#4f46e5', ink: '#3730a3' },
  violet: { label: 'Violeta', solid: '#7c3aed', ink: '#5b21b6' },
  pink: { label: 'Rosa', solid: '#be185d', ink: '#9d174d' },
  rose: { label: 'Vermelho', solid: '#e11d48', ink: '#9f1239' },
  orange: { label: 'Laranja', solid: '#c2410c', ink: '#9a3412' },
  amber: { label: 'Âmbar', solid: '#b45309', ink: '#92400e' },
  emerald: { label: 'Esmeralda', solid: '#047857', ink: '#065f46' },
  teal: { label: 'Petróleo', solid: '#0f766e', ink: '#115e59' },
  sky: { label: 'Azul', solid: '#0369a1', ink: '#075985' },
  slate: { label: 'Grafite', solid: '#475569', ink: '#334155' },
};

/** cor automática estável: hash do id (ou do nome, na persona nova) → paleta */
export function autoColor(seed: string): PersonaColor {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PERSONA_COLORS[h % PERSONA_COLORS.length];
}
export const colorOf = (p: Pick<Persona, 'id' | 'name' | 'color'>) => p.color ?? autoColor(p.id || p.name || 'persona');

/** variáveis CSS da cor da persona: --pc (sólida), --pc-ink (texto), --pc-soft (fundo suave), --pc-line (borda) */
export function colorVars(c: PersonaColor): CSSProperties {
  const { solid, ink } = PALETTE[c];
  return {
    '--pc': solid,
    '--pc-ink': ink,
    '--pc-soft': `color-mix(in oklab, ${solid} 11%, var(--card))`,
    '--pc-softer': `color-mix(in oklab, ${solid} 5%, var(--card))`,
    '--pc-line': `color-mix(in oklab, ${solid} 28%, var(--card))`,
  } as CSSProperties;
}

/** "Mariana — a terapeuta que…" → { short: 'Mariana', tagline: 'a terapeuta que…' } */
export function splitName(name: string) {
  const m = name.match(/^(.+?)\s+[—–-]\s+(.+)$/);
  return m ? { short: m[1].trim(), tagline: m[2].trim() } : { short: name.trim(), tagline: '' };
}
export function initials(name: string) {
  const words = splitName(name).short.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (!words.length) return '?';
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0]).toUpperCase();
}

export function Avatar({ name, color, size = 'md', className }: { name: string; color: PersonaColor; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none ring-2 ring-[var(--card)]',
        size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'md' ? 'h-10 w-10 text-sm' : 'h-14 w-14 text-lg', className)}
      style={{ background: PALETTE[color].solid }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

// ---------- Papel ----------
export type Role = Persona['role'];
export const ROLES: { id: Role; label: string; icon: LucideIcon; cls: string }[] = [
  { id: 'primaria', label: 'Primária', icon: Star, cls: 'bg-primary-soft text-primary-ink' },
  { id: 'secundaria', label: 'Secundária', icon: Users, cls: 'bg-sky-50 text-sky-800' },
  { id: 'anti-persona', label: 'Anti-persona', icon: Ban, cls: 'bg-red-50 text-red-800' },
];
export const roleOf = (r: Role) => ROLES.find((x) => x.id === r) ?? ROLES[0];

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const r = roleOf(role);
  const Icon = r.icon;
  return (
    <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap', r.cls, className)}>
      <Icon className="h-3 w-3" strokeWidth={2.25} />{r.label}
    </span>
  );
}

// ---------- Seletor de cor ----------
export function ColorPicker({ value, auto, onChange, children }: { value?: PersonaColor; auto: PersonaColor; onChange: (c: PersonaColor | undefined) => void; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      {/* Esc fecha só o seletor: sem isso o aviso chegava ao painel (que perguntaria se descarta as alterações) */}
      <PopoverContent align="start" className="w-auto p-3" onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }}>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2"><Palette className="h-3.5 w-3.5" />Cor da persona</div>
        <div className="grid grid-cols-5 gap-2">
          {PERSONA_COLORS.map((c) => (
            <button key={c} type="button" title={PALETTE[c].label} aria-label={PALETTE[c].label} aria-pressed={value === c}
              onClick={() => onChange(c)}
              className={cx('h-8 w-8 rounded-full flex items-center justify-center transition hover:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                value === c && 'ring-2 ring-offset-2 ring-[var(--sw)]')}
              style={{ background: PALETTE[c].solid, '--sw': PALETTE[c].solid } as CSSProperties}>
              {value === c && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onChange(undefined)}
          className={cx('mt-3 w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted', !value && 'bg-muted font-medium')}>
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: PALETTE[auto].solid }} />
          Automática ({PALETTE[auto].label.toLowerCase()})
          {!value && <Check className="h-3.5 w-3.5 ml-auto" />}
        </button>
      </PopoverContent>
    </Popover>
  );
}
