// Tipos da curadoria (041 F2). Brutos e achados ficam em data/curadoria/<slug>/<rodada>/ (fora do git).
import type { CuratedSource, SourceRef } from '../../schema';
import type { Runner } from '../intel/types';

export type Lang = 'pt' | 'en' | 'es' | 'outro';
export type Evidence = NonNullable<SourceRef['evidence']>;
export type RefKind = SourceRef['kind'];

/** um item como o script trouxe da fonte (sem LLM) */
export interface RawItem {
  /** chave estável: doi:<doi> · pmid:<n> · url:<url> */
  key: string;
  /** fontes do cadastro que trouxeram o item (o mesmo artigo pode vir de várias) */
  sourceIds: string[];
  adapter: string;
  query: string;
  title: string;
  /** link do item (não a home da fonte) */
  url: string;
  /** outros links que abrem o item (a verificação tenta na ordem) */
  altUrls: string[];
  doi?: string;
  pmid?: string;
  abstract?: string;
  authors: string[];
  venue?: string;
  publishedAt?: string; // AAAA-MM-DD
  language: Lang;
  kind: RefKind;
  /** palpite do script pelo tipo de publicação e pelo título (a triagem confirma pelo resumo) */
  evidence?: Evidence;
  pubTypes: string[];
  /** periódico, autor ou idioma brasileiro */
  brazilian: boolean;
  openAccess?: boolean;
}

export interface SearchParams {
  queries: string[];
  from: string; // AAAA-MM-DD
  to: string;
  max: number;  // por consulta
  languages: ('pt' | 'en' | 'es')[];
}

export interface AdapterCtx { runner: Runner; env: (k: string) => string | undefined; now: Date }

export type CurAdapter = (src: CuratedSource, p: SearchParams, ctx: AdapterCtx) => Promise<{ items: RawItem[]; warnings: string[] }>;

/** resultado do script por fonte (mesmo padrão de tools/intel: erro por fonte, a rodada não para) */
export interface SourceRun {
  sourceId: string;
  status: 'ok' | 'vazio' | 'erro' | 'bloqueado';
  fetched: number;
  errors: string[];
  warnings: string[];
}

/** brutos.json */
export interface RawFile { round: string; slug: string; fetchedAt: string; params: SearchParams & { newsFrom?: string }; perSource: SourceRun[]; items: RawItem[] }

/** candidatos.json: o que a triagem (Haiku) lê — título + resumo, nada mais */
export interface Candidate { id: string; key: string; title: string; abstract: string; venue?: string; year?: string; language: Lang; evidenceHint?: Evidence; brazilian: boolean; preScore: number }

/** achados.json: o que a triagem devolve (1 por item aproveitado) */
export interface Finding {
  cand: string;          // C-NNN
  score: number;         // 0–10 pela rubrica
  claim: string;         // a crença comum que o item ajuda a testar (série 3) ou o tema
  quote: string;         // trecho LITERAL do resumo (≤ 40 palavras)
  summary: string;       // paráfrase pt-BR do que o resumo diz
  evidence?: Evidence;
  why?: string;
}

/** verificados.json */
export interface Verified extends Finding {
  key: string;
  item: RawItem;
  url: string;           // o link que abriu
  quoteFrom: SourceRef['quoteFrom'];
  verify: { checkedAt: string; linkOk: boolean; doiOk: boolean | null; quoteFound: boolean; linkVia?: string; textFrom?: string[] };
  ok: boolean;
  reason?: string;
}
