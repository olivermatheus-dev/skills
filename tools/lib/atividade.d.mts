// Tipos do atividade.mjs (usado pelo app em TypeScript).
export type TipoAtividade = 'ia' | 'coleta' | 'render';
export type StatusAtividade = 'rodando' | 'feito' | 'erro' | 'parado';
export interface Atividade {
  id: string; slug: string; tipo: TipoAtividade; fonte: string; titulo: string; agente: string | null; passo: string;
  status: StatusAtividade; inicio: string; fim: string | null; em?: string; pid: number | null; link: string | null; ref: string | null;
  erro: string | null; resumo: string | null; visto: boolean; custo?: number; turnos?: number;
}
export function iniciar(a: { slug: string; tipo: TipoAtividade; fonte: string; titulo: string; agente?: string | null; passo?: string; link?: string | null; pid?: number; ref?: string | null }): Atividade;
export function passo(id: string, texto: string, extra?: Partial<Pick<Atividade, 'agente' | 'titulo'>>): Atividade | null;
export function terminar(id: string, status: Exclude<StatusAtividade, 'rodando'>, op?: { resumo?: string | null; erro?: string | null; link?: string | null; custo?: number | null; turnos?: number | null }): Atividade | null;
export function marcarVisto(ids: string[]): void;
export function listar(op?: { slug?: string; limite?: number }): Atividade[];
export function lerAtividade(id: string): Atividade | null;
