// Tipos do fichas-fila.mjs (usado pelo app em TypeScript).
export interface PedidoJson { itens: string[]; status?: 'pendente' | 'rodando'; reanalisar?: boolean; requestedAt: string; [k: string]: unknown }
export interface ItemFila { comp: string; key: string }
export interface Progresso { passo: string; itens: string[]; em: string }
export interface Ultimo { fim: string; inicio: string | null; feitos: ItemFila[]; restantes: ItemFila[]; erro: string | null; parado: boolean }
export function agora(): string;
export function fichaFile(key: string): string;
export function pedidoPath(slug: string, comp: string): string;
export function listarPedidos(slug: string): { comp: string; pedido: PedidoJson }[];
export function analisadaEm(slug: string, comp: string, key: string): string | null;
export function feito(slug: string, comp: string, key: string, pedido: { reanalisar?: boolean; requestedAt: string }): boolean;
export function tirar(slug: string, comp: string, keys: string[]): number;
export interface Rodada { comp: string; itens: string[]; reanalisar: boolean; requestedAt: string }
export function marcarRodando(slug: string): Rodada[];
export function lerProgresso(slug: string): Progresso | null;
export function escreverProgresso(slug: string, passo: string, itens?: string[]): void;
export function lerUltimo(slug: string): Ultimo | null;
export function fechar(slug: string, op?: { erro?: string | null; parado?: boolean; inicio?: string | null; rodada?: Rodada[] | null }): Ultimo;
export function promptFila(slug: string, pedidos: Rodada[]): string;
