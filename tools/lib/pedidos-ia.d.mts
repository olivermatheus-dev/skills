// Tipos do pedidos-ia.mjs (usado pelo app em TypeScript).
export type PedidoTipo = 'ajustes' | 'analise' | 'relatorio';
export interface PedidoIa {
  id: string; slug: string; tipo: PedidoTipo; titulo: string; agente: string; link: string | null; ref: string;
  prompt: string; allowed: string[]; disallowed?: string[]; extra: Record<string, any>;
  status: 'fila' | 'rodando' | 'feito' | 'erro' | 'parado';
  criado: string; inicio: string | null; fim: string | null; atividade: string | null; resumo: string | null; erro: string | null;
}
export function criar(p: { slug: string; tipo: PedidoTipo; titulo: string; agente?: string; link?: string | null; ref: string; prompt: string; allowed?: string[]; disallowed?: string[]; extra?: Record<string, unknown> }): PedidoIa;
export function ler(id: string): PedidoIa | null;
export function atualizar(id: string, patch: Partial<PedidoIa>): PedidoIa | null;
export function ultimoPor(slug: string, ref: string): PedidoIa | null;
export function fechar(id: string, op?: { parado?: boolean; erro?: string | null; saida?: string }): { status: string; resumo: string | null; erro: string | null };
