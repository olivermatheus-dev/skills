// Avatar de quem fez/está com a tarefa: Oliver (cor do projeto), IA/orquestrador (âmbar), cada agente com ícone e
// a cor do campo `color` de .claude/agents/<nome>.md (mesma cor que o Claude Code usa no terminal), heartbeat (cinza).
import { useQuery } from '@tanstack/react-query';
import { Activity, AudioLines, Clapperboard, Compass, Palette, PenLine, Search, ShieldCheck, Sparkles, Bot, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '../../api';
import { assigneeLabel } from './taskUtils';

const AGENT_ICON: Record<string, LucideIcon> = {
  ai: Sparkles, heartbeat: Activity,
  'agent:estrategista': Compass, 'agent:roteirista': PenLine, 'agent:designer': Palette, 'agent:editor-de-video': Clapperboard,
  'agent:sound-designer': AudioLines, 'agent:pesquisador': Search, 'agent:revisor': ShieldCheck,
};

/** Nomes de cor do Claude Code → tom usado no app. */
const COLOR: Record<string, string> = {
  red: '#dc2626', orange: '#ea580c', yellow: '#ca8a04', green: '#16a34a', cyan: '#0891b2',
  blue: '#2563eb', purple: '#7c3aed', pink: '#db2777', gray: '#71717a',
};

function useAgentColors() {
  const q = useQuery({ queryKey: ['agents'], queryFn: api.agents, staleTime: Infinity });
  return Object.fromEntries((q.data ?? []).map((a) => [`agent:${a.name}`, a.color])) as Record<string, string | null>;
}

/** Cor de quem: hex. Oliver = cor do projeto. */
export function useWhoColor(who: string) {
  const colors = useAgentColors();
  if (who === 'oliver') return 'var(--primary)';
  if (who === 'ai') return COLOR.yellow;
  if (who === 'heartbeat') return COLOR.gray;
  const c = colors[who];
  return (c && (COLOR[c] ?? c)) || COLOR.gray;
}

export const whoLabel = (w: string) => (w === 'heartbeat' ? 'Heartbeat' : w === 'ai' ? 'IA' : assigneeLabel(w));

export function WhoAvatar({ who, size = 'sm', className }: { who: string; size?: 'xs' | 'sm' | 'md'; className?: string }) {
  const color = useWhoColor(who);
  const box = size === 'xs' ? 'size-4 text-[9px]' : size === 'sm' ? 'size-5 text-[10px]' : 'size-6 text-[11px]';
  const ico = size === 'xs' ? 'size-2.5' : size === 'sm' ? 'size-3' : 'size-3.5';
  if (who === 'oliver') {
    return <span title="Oliver" className={cn('inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shrink-0', box, className)}>O</span>;
  }
  const Icon = AGENT_ICON[who] ?? Bot;
  return (
    <span title={whoLabel(who)} className={cn('inline-flex items-center justify-center rounded-full shrink-0', box, className)}
      style={{ color, background: `color-mix(in oklab, ${color} 14%, white)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 30%, white)` }}>
      <Icon className={ico} />
    </span>
  );
}

/** Nome na cor de quem é. */
export function WhoName({ who, className }: { who: string; className?: string }) {
  const color = useWhoColor(who);
  return <span className={cn('font-medium', className)} style={{ color: who === 'oliver' ? undefined : color }}>{whoLabel(who)}</span>;
}

export function WhoChip({ who }: { who: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
      <WhoAvatar who={who} size="xs" /><WhoName who={who} />
    </span>
  );
}
