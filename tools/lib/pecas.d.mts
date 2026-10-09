// Tipos do pecas.mjs (usado pelo app em TypeScript).
export type TipoPeca = 'video' | 'carrossel' | 'post' | 'mockup' | 'roteiro';
export const PREFIXO: Record<TipoPeca, string>;
export const TIPO_DO_PREFIXO: Record<string, TipoPeca>;
export const ID_RE: RegExp;
export const TESTES: string;
export function contentsDir(slug: string): string;
export function idDaPasta(nome: string | null | undefined): string | null;
export function numeroDoId(id: string): number;
export function slugify(s: string, palavras?: number): string;
export function tipoDoFormato(formato?: string | null): TipoPeca;
export function proximoId(slug: string, tipo: TipoPeca): string;
export function novaPasta(slug: string, tipo: TipoPeca, titulo: string): { id: string; pasta: string };
