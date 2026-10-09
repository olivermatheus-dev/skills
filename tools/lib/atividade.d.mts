// Tipos do atividade.mjs (usado pelo app em TypeScript).
export type TipoAtividade = 'ia' | 'coleta' | 'render';
export type StatusAtividade = 'rodando' | 'feito' | 'erro' | 'parado';
export interface PassoAtividade { em: string; texto: string; agente: string | null }
export interface Atividade {
  id: string; slug: string; tipo: TipoAtividade; fonte: string; titulo: string; agente: string | null; passo: string;
  status: StatusAtividade; inicio: string; fim: string | null; em?: string; pid: number | null; link: string | null; ref: string | null;
  erro: string | null; resumo: string | null; visto: boolean; custo?: number; turnos?: number;
  /** histórico dos passos (046 E) */ passos?: PassoAtividade[];
  /** texto final do Claude (cortado) */ final?: string;
  /** sessão do Claude Code (terminal/hooks ou heartbeat) */ sessao?: string; origem?: 'app' | 'terminal'; cwd?: string;
  /** sessão de terminal fechada (SessionEnd) */ encerrada?: boolean; principal?: string;
  /** o que a coleta devolveu (046 C) */ resultado?: unknown;
}
export function iniciar(a: { slug: string; tipo: TipoAtividade; fonte: string; titulo: string; agente?: string | null; passo?: string; link?: string | null; pid?: number | null; ref?: string | null; sessao?: string; origem?: 'app' | 'terminal'; cwd?: string }): Atividade;
export function passo(id: string, texto: string, extra?: Partial<Pick<Atividade, 'agente' | 'titulo' | 'slug' | 'sessao'>>): Atividade | null;
export function terminar(id: string, status: Exclude<StatusAtividade, 'rodando'>, op?: { resumo?: string | null; erro?: string | null; link?: string | null; custo?: number | null; turnos?: number | null; final?: string | null; visto?: boolean; resultado?: unknown }): Atividade | null;
export function reabrir(id: string, texto: string, extra?: Partial<Pick<Atividade, 'agente' | 'titulo' | 'slug'>>): Atividade | null;
export function marcar(id: string, extra: Partial<Atividade>): Atividade | null;
export function porSessao(sessao: string): Atividade | null;
export function ligarSessao(sessao: string, id: string): void;
export function marcarVisto(ids: string[]): void;
export function listar(op?: { slug?: string; limite?: number }): Atividade[];
export function lerAtividade(id: string): Atividade | null;
