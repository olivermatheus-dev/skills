// Tipos do insumos.mjs (usado pelo app em TypeScript).
export type TipoInsumo = 'abertura' | 'voz' | 'headline' | 'cta' | 'copy';
export const TIPOS: TipoInsumo[];
export const BOTOES: string[];
export class InsumoErro extends Error { erros: string[]; constructor(erros: string[]); }
interface Marca { origem?: 'oliver' | 'ia'; por_que?: string; criado?: string; /** aparece em alguma variante já gerada */ usada: boolean }
export interface InsumoAbertura extends Marca { id: string; titulo?: string; fala: string; tela: string; /** chave do cue → palavra dita na fala */ cues: Record<string, string> }
export interface InsumoVoz extends Marca { id: string; voz: string; nome: string; genero?: string; rate?: string }
export interface InsumoHeadline extends Marca { id: string; texto: string }
export interface InsumoCta extends Marca { id: string; botao: string; fala?: string }
export interface InsumoCopy extends Marca { id: string; texto_principal: string; titulo: string; descricao?: string }
export interface InsumosView {
  aberturas: InsumoAbertura[]; vozes: InsumoVoz[]; headlines: InsumoHeadline[]; ctas: InsumoCta[]; copys: InsumoCopy[];
  molde: { cena: string; cues: string[] } | null;
  vozesDisponiveis: { id: string; nome: string; genero?: string }[];
  /** "tipo:id" → erros e avisos da validação (texto curto em pt-BR) */
  avisos: Record<string, string[]>;
}
export interface InsumoDados { fala?: string; tela?: string; cues?: Record<string, string>; titulo?: string; voz?: string; rate?: string; texto?: string; botao?: string; texto_principal?: string; descricao?: string; por_que?: string; origem?: 'oliver' | 'ia' }
export function view(pasta: string, opts?: { empresa?: string }): InsumosView;
export function contexto(pasta: string, opts?: { empresa?: string }): string;
export function aplicar(pasta: string, op: { acao: 'add' | 'editar' | 'rm'; tipo: TipoInsumo; id?: string; dados?: InsumoDados; forcar?: boolean; empresa?: string }): { id: string; avisos: string[] };
export function vozesDisponiveis(): { id: string; nome: string; genero?: string }[];
export function moldeDe(proj: unknown): { cena: string; fala: string; cues: string[] } | null;
export function termosProibidos(slug: string | null): string[];
export function empresaDe(pasta: string, empresa?: string): string | null;
export function jsonCompacto(v: unknown, ind?: string, prefixo?: number): string;
