// Tipos do fila-ia.mjs (usado pelo app em TypeScript).
export interface JobFila { kind: 'quadro' | 'fichas' | 'pesquisa' | 'pedido'; slug: string; task?: string; max?: number; round?: string; pedido?: string }
export interface EntradaFila { id: string; criado: string; chave: string; job: JobFila; titulo: string; atividade: string }
export function listar(): EntradaFila[];
export function entrar(job: JobFila, chave: string, meta: { titulo: string; fonte: string; agente?: string | null; link?: string | null; ref?: string | null }): { entrada: EntradaFila; posicao: number; ja: boolean };
export function proxima(): EntradaFila | null;
export function posicao(pred: (e: EntradaFila) => boolean): number | null;
export function tirar(id: string): EntradaFila | null;
