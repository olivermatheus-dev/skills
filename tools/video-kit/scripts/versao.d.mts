// Tipos do versao.mjs (usado pelo app em TypeScript, 050 D).
export interface VideoDir { dir: string; file?: string; tl?: unknown; [k: string]: unknown }
export interface VersaoInfo {
  nome: string; n: number; versao: string; criado: string; hash: string; nota?: string;
  formatos?: Record<string, string>; blocos?: { use: string; escopo: string }[];
}
export function versoes(v: VideoDir): VersaoInfo[];
export function hashAtual(v: VideoDir): string | null;
export function diffVersao(v: VideoDir, nome: string): string[];
export function restaurar(v: VideoDir, nome: string, opts?: { fiel?: boolean }): { versao: string; backup: string; avisos: string[] };
export function rehash(v: VideoDir): string[];
export const versaoDoArquivo: (nome: string) => number | null;
