// Tipos do ficha-agente.mjs (usado pelo app em TypeScript).
export type TipoFicha = 'agente' | 'skill';
export interface CampoMolde { key: 'especialista' | 'contexto' | 'entradas' | 'ordem' | 'regras' | 'checklist'; titulo: string; obrigatorio: boolean; dica: string }
export interface ItemContexto { ref: string; quando: string; agentes: string[]; motivo: string }
export interface ContextoFicha { nota: string; itens: ItemContexto[] }
export interface SecaoLivre { titulo: string; corpo: string; raw?: string }
export interface FichaParse {
  fm: Record<string, unknown>; fmRaw: string; titulo: string; preTitulo: string; abertura: string;
  campos: Record<CampoMolde['key'], string>; contexto: ContextoFicha; outras: SecaoLivre[];
  blocos: { titulo: string; key: string | null; corpo: string; raw: string }[]; noMolde: boolean;
}
export interface Ficha extends FichaParse { tipo: TipoFicha; id: string; path: string; texto: string; mtime: number }
export interface EdicaoFicha { fm?: Record<string, unknown>; titulo?: string; abertura?: string; campos?: Partial<Record<CampoMolde['key'], string>>; contexto?: ContextoFicha; outras?: SecaoLivre[] }
export interface RefConferida { ref: string; escopo: 'raiz' | 'empresa' | null; ok: boolean; erro?: string; avisos: string[] }
export interface Conferencia { erros: string[]; avisos: string[]; noMolde: boolean; refs: (ItemContexto & RefConferida)[] }
export interface Candidato { ref: string; grupo: string; linhas: number; secoes: { titulo: string; nivel: number; linhas: number }[] }
export interface ItemDaFuncao { ref: string; quando: string; motivo: string; de: string[] }
export const ROOT: string;
export const CAMPOS: CampoMolde[];
export function parseItem(linha: string): ItemContexto | null;
export function itemTexto(i: ItemContexto): string;
export function parseContexto(body: string): ContextoFicha;
export function contextoTexto(c: ContextoFicha): string;
export function parseFicha(texto: string): FichaParse;
export function gravarFicha(base: string, edit: EdicaoFicha): string;
export function empresas(): string[];
export function conferirRef(ref: string, slug?: string): RefConferida;
export function listarAgentes(): string[];
export function listarSkills(): string[];
export function arquivoDe(tipo: TipoFicha, id: string): string;
export function relDe(tipo: TipoFicha, id: string): string;
export function lerFicha(tipo: TipoFicha, id: string): Ficha | null;
export function salvarFicha(tipo: TipoFicha, id: string, edit: EdicaoFicha): Ficha;
export function conferirFicha(tipo: TipoFicha, id: string, slug?: string): Conferencia;
export function conferirTudo(): (Conferencia & { tipo: TipoFicha; id: string; path: string })[];
export function contextoDoAgente(agente: string | null, skills?: string[]): ItemDaFuncao[];
export function candidatos(slug?: string): Candidato[];
