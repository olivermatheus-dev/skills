// Tipos do blocos.mjs (usado pelo app em TypeScript).
export type Escopo = 'global' | 'empresa' | 'projeto';
export interface BlocoMeta { id?: string; tipo?: string; titulo?: string; camada?: string; slots?: string[]; cues?: string[]; min_s?: number; elastico?: boolean; formatos?: string[]; params?: Record<string, { padrao?: unknown; descricao?: string }>; vivo?: string; origem?: string; licenca?: string; tags?: string[]; sfx_sugeridos?: Record<string, string> }
export interface Bloco { use: string; escopo: Escopo; empresa?: string; pasta?: string; dir: string; meta: BlocoMeta; usos: { empresa: string; pasta: string; cena: string }[]; preview: string | null; pontos?: number }
export const ROOT: () => string;
export function fold(s: unknown): string;
export function empresas(): string[];
export function pastasDeVideo(slug: string): string[];
export function catalogo(o?: { empresa?: string }): Bloco[];
export function buscar(q: string, o?: { tipo?: string; escopo?: Escopo; formato?: string; empresa?: string; limite?: number }): Bloco[];
export function gerarPreviews(o?: { empresa?: string; use?: string; forcar?: boolean }): { feitos: string[]; pulados: string[]; sem_fonte: string[] };
export function escreverIndice(): { arquivo: string; blocos: number };
export function conferirGlobal(dir: string): { erros: string[]; avisos: string[] };
export function promover(o: { empresa: string; use: string; de: string; para?: Escopo; copiar?: boolean; forcar?: boolean }):
  { ok: true; de: string; para: string; movido: boolean; avisos: string[]; usos: number } | { ok: false; erros: string[]; avisos: string[] };
export function arquivoPreview(rel: string): string | null;
