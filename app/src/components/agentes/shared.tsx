// Peças comuns da área Agentes e skills: cor e avatar de cada agente, selo de estado e nomes.
import { Moon } from 'lucide-react';
import type { AgenteCard, EstadoAgente } from '../../api';
import { cx } from '../kit';
import { duracao } from '../atividade/AtividadeDock';

// cores do campo `color` dos agentes do Claude Code
export const COR: Record<string, string> = { red: '#e5484d', orange: '#f76b15', yellow: '#d6a10a', green: '#30a46c', cyan: '#00a2c7', blue: '#3e63dd', purple: '#8e4ec6', pink: '#d6409f' };
export const corDe = (a: Pick<AgenteCard, 'cor'> | undefined | null) => (a?.cor && COR[a.cor]) ?? 'var(--primary)';
export const usd = (v: number) => `US$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const ESTADO = {
  trabalhando: { label: 'Trabalhando', cls: 'bg-primary-soft text-primary-ink', dot: 'bg-primary animate-pulse' },
  acordado: { label: 'Acordado', cls: 'bg-success/10 text-success', dot: 'bg-success' },
  dormindo: { label: 'Dormindo', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/40' },
} as const;
export const NOME_AGENTE: Record<string, string> = {
  orquestrador: 'Orquestrador', estrategista: 'Estrategista', roteirista: 'Roteirista', designer: 'Designer',
  'editor-de-video': 'Editor de vídeo', 'sound-designer': 'Sound designer', revisor: 'Revisor', pesquisador: 'Pesquisador',
};
/** assignee do quadro (ai | agent:x | oliver) → id do agente */
export const agenteDoAssignee = (a: string) => (a === 'ai' ? 'orquestrador' : a.replace(/^agent:/, ''));

const iniciais = (nome: string) => nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export function Avatar({ a, size = 'md', estado = true }: { a: Pick<AgenteCard, 'nome' | 'cor'> & { estado?: EstadoAgente }; size?: 'xs' | 'sm' | 'md' | 'lg'; estado?: boolean }) {
  const sz = { xs: 'size-5 text-[9px]', sm: 'size-7 text-[11px]', md: 'size-10 text-sm', lg: 'size-14 text-lg' }[size];
  const dot = { xs: 'size-2 ring-1', sm: 'size-2.5 ring-2', md: 'size-3 ring-2', lg: 'size-3.5 ring-[3px]' }[size];
  return (
    <span className={cx('relative shrink-0 rounded-full grid place-items-center font-semibold text-white', sz)} style={{ background: corDe(a) }} title={a.nome}>
      {iniciais(a.nome)}
      {estado && a.estado && <span className={cx('absolute -right-0.5 -bottom-0.5 rounded-full ring-card', dot, ESTADO[a.estado].dot)} />}
    </span>
  );
}

export function EstadoPill({ a }: { a: Pick<AgenteCard, 'estado' | 'desde'> }) {
  const e = ESTADO[a.estado];
  return (
    <span className={cx('inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5', e.cls)}>
      {a.estado === 'dormindo' ? <Moon className="size-3" /> : <span className={cx('size-1.5 rounded-full', e.dot)} />}
      {e.label}{a.desde && a.estado === 'trabalhando' && <span className="tabular-nums">· {duracao(a.desde)}</span>}
    </span>
  );
}

/** pilha de avatares (quem usa uma skill) */
export function Pilha({ ids, agentes, max = 4 }: { ids: string[]; agentes: Pick<AgenteCard, 'id' | 'nome' | 'cor'>[]; max?: number }) {
  const lista = ids.map((id) => agentes.find((a) => a.id === id) ?? { id, nome: NOME_AGENTE[id] ?? id, cor: null });
  return (
    <span className="inline-flex items-center -space-x-1.5">
      {lista.slice(0, max).map((a) => <span key={a.id} className="rounded-full ring-2 ring-card"><Avatar a={a} size="xs" estado={false} /></span>)}
      {lista.length > max && <span className="size-5 rounded-full ring-2 ring-card bg-muted text-[9px] grid place-items-center text-muted-foreground">+{lista.length - max}</span>}
    </span>
  );
}
