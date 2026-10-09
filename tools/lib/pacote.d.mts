// Tipos do pacote.mjs (usado pelo app em TypeScript).
export class PacoteErro extends Error {}
export const CTA_META: Record<string, string>;
export interface AnuncioPacote { nome: string; variante: string; escolhas: Record<string, string>; arquivos: Record<string, { origem: string; arquivo: string }>; url_tags: string }
export interface Pacote {
  saida: string; data: string; projeto: string; campanha: string; conjunto: string; link: string; botao: string; cta_meta: string;
  textos: string[]; titulos: string[]; descricoes: string[]; anuncios: AnuncioPacote[]; avisos: string[];
}
export function urlTags(campanha: string, nomeAnuncio: string): string;
export function montarPacote(pasta: string, opts?: { ids?: string[]; formatos?: string[]; campanha?: string; conjunto?: string; link?: string; data?: string; seco?: boolean; empresa?: string }): Pacote;
export interface Metricas {
  gasto: number | null; impressoes: number | null; cliques: number | null; resultados: number | null; v3s: number | null; thruplay: number | null;
  /** 3 s ÷ impressões */ hook: number | null; /** ThruPlay ÷ 3 s */ retencao: number | null; ctr: number | null; cpc: number | null; /** custo por resultado */ cpr: number | null;
}
export interface OpcaoResultado extends Metricas { opcao: string; n: number; status?: 'vencedor' | 'em teste' | 'aposentado' }
export interface EixoResultado { eixo: string; opcoes: OpcaoResultado[]; metrica: 'hook' | 'retencao' | 'ctr' | null; vencedora: string | null; lider?: string; motivo: string }
export interface Resultados {
  data: string; projeto: string; arquivo_csv: string | null;
  variantes: Record<string, Metricas & { escolhas: Record<string, string> }>;
  eixos: EixoResultado[]; sem_par: string[]; log: string[]; arquivos: string[];
}
export function lerCsv(texto: string): { cab: string[]; linhas: Record<string, string>[] };
export function num(s: unknown): number | null;
export function importarResultados(pasta: string, csvTexto: string, opts?: { data?: string; campanha?: string; seco?: boolean; empresa?: string; arquivo?: string }): Resultados;
export function ultimoResultado(pasta: string): Omit<Resultados, 'arquivos'> | null;
