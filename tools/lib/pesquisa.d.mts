// Tipos do pesquisa.mjs (usado pelo app em TypeScript).
export interface UltimoPesquisa { round: string; inicio: string | null; fim: string; feita: boolean; parado: boolean; erro: string | null }
export function agora(): string;
export function rodadaDir(slug: string, round: string): string;
export function pedidoFile(slug: string, round: string): string;
export function resultadoFile(slug: string, round: string): string;
export function lerPedido(slug: string, round: string): { status?: string; [k: string]: unknown } | null;
export function marcarPedido(slug: string, round: string, status: 'pendente' | 'rodando' | 'feito' | 'erro'): { status?: string; [k: string]: unknown };
export function lerUltimo(slug: string): UltimoPesquisa | null;
export function fechar(slug: string, round: string, op?: { erro?: string | null; parado?: boolean; inicio?: string | null }): UltimoPesquisa;
export function promptPesquisa(slug: string, round: string, op?: { interativo?: boolean }): string;
