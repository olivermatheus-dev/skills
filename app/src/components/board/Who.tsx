// Avatar de quem fez/está com a tarefa: Oliver, IA (orquestrador), cada agente com um ícone, heartbeat.
import { Activity, AudioLines, Clapperboard, Compass, Palette, PenLine, Search, ShieldCheck, Sparkles, Bot, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assigneeLabel } from './taskUtils';

const AGENT_ICON: Record<string, LucideIcon> = {
  ai: Sparkles, heartbeat: Activity,
  'agent:estrategista': Compass, 'agent:roteirista': PenLine, 'agent:designer': Palette, 'agent:editor-de-video': Clapperboard,
  'agent:sound-designer': AudioLines, 'agent:pesquisador': Search, 'agent:revisor': ShieldCheck,
};

export const whoLabel = (w: string) => (w === 'heartbeat' ? 'Heartbeat' : w === 'ai' ? 'IA' : assigneeLabel(w));

export function WhoAvatar({ who, size = 'sm', className }: { who: string; size?: 'xs' | 'sm' | 'md'; className?: string }) {
  const box = size === 'xs' ? 'size-4 text-[9px]' : size === 'sm' ? 'size-5 text-[10px]' : 'size-7 text-xs';
  const ico = size === 'xs' ? 'size-2.5' : size === 'sm' ? 'size-3' : 'size-4';
  if (who === 'oliver') {
    return <span title="Oliver" className={cn('inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shrink-0', box, className)}>O</span>;
  }
  const Icon = AGENT_ICON[who] ?? Bot;
  return (
    <span title={whoLabel(who)} className={cn('inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200 shrink-0', box, className)}>
      <Icon className={ico} />
    </span>
  );
}

export function WhoChip({ who }: { who: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
      <WhoAvatar who={who} size="xs" />{whoLabel(who)}
    </span>
  );
}
