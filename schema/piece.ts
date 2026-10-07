import { z } from 'zod';
import { IsoDate, IsoDateTime, Platform } from './common';

/**
 * <pasta da peça>/peca.json — ficha de produção da peça (vídeo, carrossel, post ou roteiro): tudo o que NÃO é edição.
 * Nome de exibição (renomear não move a pasta), versão principal, tags, favorito/arquivada, publicação,
 * notas de texto (legenda, copy, CTA, hashtags, notas livres) e, desde a 025: briefing, status do funil,
 * custo por rodada de IA, dados de produção, histórico de observações e resultado depois de publicar.
 * Comentários de edição ficam em revisao.json.
 * Opcional: peça sem ficha usa o nome da pasta e o último arquivo exportado.
 */
export const PIECE_KINDS = ['video', 'carrossel', 'post', 'roteiro'] as const;
export const PIECE_NOTE_FIELDS = ['legenda', 'copy', 'cta', 'hashtags', 'notas'] as const;

/** funil único da peça (substitui o status solto do revisao.json). Arquivar é à parte (`archived`). */
export const PIECE_STATUS = ['ideia', 'roteiro', 'producao', 'revisao', 'aprovado', 'publicado'] as const;
export type PieceStatus = typeof PIECE_STATUS[number];
/** status antigo do revisao.json → funil (só para ler peças ainda não migradas) */
export const LEGACY_STATUS: Record<string, PieceStatus> = { rascunho: 'roteiro', em_revisao: 'revisao', aprovado: 'aprovado' };

export const PIECE_OBJETIVOS = ['atrair', 'educar', 'engajar', 'converter', 'reter'] as const;
export const PIECE_PROPORCOES = ['1:1', '4:5', '9:16', '16:9'] as const;
export const PIECE_NIVEIS = ['simples', 'medio', 'alto'] as const;
export const PieceBriefing = z.object({
  /** frase principal da peça (gancho / título) */
  headline: z.string().trim().min(1).optional(),
  tema: z.string().trim().min(1).optional(),
  objetivo: z.enum(PIECE_OBJETIVOS).optional(),
  /** receita usada: `fmt-*` (galeria de formatos, 027) */
  formato: z.string().regex(/^fmt-[a-z0-9-]+$/, 'fmt-…').optional(),
  /** id da persona em personas/ */
  persona: z.string().trim().min(1).optional(),
  plataformas: z.array(Platform).optional(),
  proporcoes: z.array(z.enum(PIECE_PROPORCOES)).optional(),
  /** duração-alvo em segundos (vídeo) */
  duracao: z.number().positive().optional(),
  /** nível de edição do vídeo (skill video) */
  nivel: z.enum(PIECE_NIVEIS).optional(),
});
export type PieceBriefing = z.infer<typeof PieceBriefing>;

/** etapa de uma rodada de IA na peça */
export const COST_ETAPAS = ['pauta', 'roteiro', 'plano', 'producao', 'voz', 'trilha', 'revisao', 'ajustes', 'outro'] as const;
const Int = z.number().int().min(0);
/** uma rodada de IA medida nos transcripts (`node tools/usage.mjs <sessão> --piece <pasta> --etapa <etapa>`) */
export const CostRound = z.object({
  /** início e fim do trecho medido */
  data: IsoDateTime,
  ate: IsoDateTime.optional(),
  etapa: z.enum(COST_ETAPAS),
  /** id da sessão do Claude Code (nome do .jsonl) */
  sessao: z.string().min(1),
  /** modelo principal da rodada (o que mais custou) */
  modelo: z.string().min(1),
  /** esforço de raciocínio (não fica no transcript: informado ao medir) */
  esforco: z.string().optional(),
  chamadas: Int,
  tokens: z.object({ entrada: Int, saida: Int, cacheLeitura: Int, cacheEscrita: Int }),
  usd: z.number().min(0),
  minutos: Int,
  /** detalhe por modelo (subagentes separados) */
  porModelo: z.array(z.object({ quem: z.string(), chamadas: Int, usd: z.number().min(0) })).default([]),
  nota: z.string().optional(),
});
export type CostRound = z.infer<typeof CostRound>;

/** dados de produção: preenchidos pela IA ao fechar etapas (usage.mjs junta skills, agentes e o commit) */
export const PieceProduction = z.object({
  /** duração real do arquivo principal, em segundos */
  duracao: z.number().positive().optional(),
  /** formatos exportados (9x16, 4x5, png…) */
  formatos: z.array(z.string()).optional(),
  voz: z.string().optional(),
  trilha: z.object({ arquivo: z.string().min(1), licenca: z.string().optional() }).optional(),
  skills: z.array(z.string()).optional(),
  agentes: z.array(z.string()).optional(),
  /** commit do repositório na última rodada medida */
  commit: z.string().regex(/^[0-9a-f]{7,40}$/).optional(),
});
export type PieceProduction = z.infer<typeof PieceProduction>;

/** observação com data: o que mudou de uma versão para outra e por quê */
export const PieceObservation = z.object({
  data: IsoDate,
  versao: z.string().optional(),
  autor: z.enum(['oliver', 'ia']).default('oliver'),
  texto: z.string().trim().min(1),
});
export type PieceObservation = z.infer<typeof PieceObservation>;

export const RESULT_FIELDS = ['views', 'alcance', 'curtidas', 'comentarios', 'salvamentos', 'compartilhamentos'] as const;
/** números depois de publicar (à mão no começo; depois pelos coletores, 023) */
export const PieceResult = z.object({
  coletadoEm: IsoDate.optional(),
  ...(Object.fromEntries(RESULT_FIELDS.map((k) => [k, Int.optional()])) as Record<typeof RESULT_FIELDS[number], z.ZodOptional<typeof Int>>),
});
export type PieceResult = z.infer<typeof PieceResult>;

export const PieceMeta = z.object({
  /** nome de exibição (a pasta continua a mesma: tarefas e revisão apontam para ela) */
  title: z.string().trim().min(1).optional(),
  /** força o tipo quando a detecção pela pasta erra */
  kind: z.enum(PIECE_KINDS).optional(),
  status: z.enum(PIECE_STATUS).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  /** arquivo principal relativo à pasta (ex.: "exports/x-9x16-v03.mp4" ou "png/01.png"); vazio = o mais recente */
  principal: z.string().regex(/^(exports|png)\/[^\\:]+$/, 'arquivo em exports/ ou png/').optional(),
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
  briefing: PieceBriefing.default({}),
  publication: z.object({
    platform: z.string().optional(),
    date: IsoDate.optional(),
    url: z.string().optional(),
  }).optional(),
  notes: z.object(Object.fromEntries(PIECE_NOTE_FIELDS.map((k) => [k, z.string().optional()])) as Record<typeof PIECE_NOTE_FIELDS[number], z.ZodOptional<z.ZodString>>).default({}),
  producao: PieceProduction.default({}),
  custo: z.array(CostRound).default([]),
  historico: z.array(PieceObservation).default([]),
  resultado: PieceResult.optional(),
  updatedAt: IsoDateTime.optional(),
});
export type PieceMeta = z.infer<typeof PieceMeta>;

/** total em US$ das rodadas da peça */
export const pieceCost = (custo: CostRound[]) => +custo.reduce((s, r) => s + r.usd, 0).toFixed(2);
