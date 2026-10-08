// Tipos do cena-lib.mjs (usado pela API do app em TypeScript).
export const FORMATOS: Record<string, [number, number]>;
export function root(): string;
export function lib(): string;
export interface CapturaRuntime {
  ref: string; nome: string; src: string; largura: number; altura: number; dpr: number; aparelho: string; endereco?: string;
  ocultar: { x: number; y: number; w: number; h: number }[];
  recorteSeguro?: { x: number; y: number; w: number; h: number }; recorteSugerido?: { x: number; y: number; w: number; h: number };
  dadosFicticios: boolean; tags: string[]; data?: string;
}
export type UrlArquivo = (slug: string, ref: string, arquivo: string) => string;
export function aparelhos(base: (pasta: string) => string, op?: { mascaraInline?: boolean }): Record<string, any>;
export function resumoAparelhos(aps: Record<string, any>): { id: string; nome: string; tipo: string; marca: string; cores: { id: string; nome: string }[]; orientacoes: string[]; padrao: { cor: string; orientacao: string } }[];
export function captura(slug: string, ref: string, url: UrlArquivo): CapturaRuntime | null;
export function listarCapturas(slug: string, url: UrlArquivo): CapturaRuntime[];
export function capturasDoDoc(doc: any, url: UrlArquivo): Record<string, CapturaRuntime>;
export function docNovo(slug: string, op?: { captura?: string; formatos?: string[]; titulo?: string }): any;
export function salvarJson(arquivo: string, valor: unknown): void;
