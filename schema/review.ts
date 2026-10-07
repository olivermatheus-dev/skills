import { z } from 'zod';
import { IsoDate, IsoDateTime } from './common';

/**
 * <pasta da peça>/revisao.json — anotações do Oliver numa peça (tarefa 022): vídeo (v1 enxuta) e textos/roteiro (fase A).
 * Âncoras por id (cena, fala, evento) continuam válidas se o tempo mudar; `t` é só a posição vista no player.
 * `tipo`: corrigir (bug) · ajustar (ajuste fino) · template (promover a componente da galeria, tarefa 014) · ok (aprovado, nada a fazer).
 */
const T = z.number().min(0);
export const ReviewAnchor = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('cena'), scene: z.string().min(1), t: T.optional() }),
  z.object({ kind: z.literal('fala'), vo: z.string().min(1), word: z.string().optional(), t: T.optional() }),
  z.object({ kind: z.literal('evento'), event: z.string().min(1), t: T.optional() }),
  z.object({ kind: z.literal('tempo'), t: T, end: T.optional() }),
  /** `selector` = id estável do elemento no composition.html (ex.: "#h1" ou "[data-bloco=card-1]"); `t` = quando aparece o problema */
  z.object({ kind: z.literal('elemento'), selector: z.string().min(1), t: T, scene: z.string().optional(), event: z.string().optional() }),
  /** trecho de um texto da peça (roteiro.md, plano.md…): `quote` reencontra o trecho se as linhas mudarem; `line` = 1ª linha quando anotado */
  z.object({ kind: z.literal('roteiro'), file: z.string().regex(/^[\w.-]+\.(md|txt)$/, 'arquivo .md/.txt da pasta da peça').default('roteiro.md'), quote: z.string().min(1), line: z.number().int().min(1) }),
]);
export type ReviewAnchor = z.infer<typeof ReviewAnchor>;

export const REVIEW_TIPOS = ['corrigir', 'ajustar', 'template', 'ok'] as const;
export const ReviewComment = z.object({
  id: z.string().regex(/^c\d+$/, 'c1, c2…'),
  at: IsoDateTime,
  author: z.string().default('oliver'),
  tipo: z.enum(REVIEW_TIPOS),
  status: z.enum(['aberto', 'resolvido']).default('aberto'),
  /** vídeo visto ao anotar (ex.: B-sonnet-9x16-v06.mp4) */
  video: z.string().optional(),
  anchor: ReviewAnchor,
  text: z.string().min(1, 'escreva o que está errado'),
  /** preenchido pela IA em `review.mjs resolve` */
  reply: z.string().optional(),
  resolvedAt: IsoDateTime.optional(),
});
export type ReviewComment = z.infer<typeof ReviewComment>;

export const REVIEW_STATUS = ['rascunho', 'em_revisao', 'aprovado'] as const;
export const Review = z.object({
  /** legado: desde a 025 o status mora no peca.json (funil ideia → publicado). Só lido de peças antigas */
  status: z.enum(REVIEW_STATUS).optional(),
  /** trava real: roteiro aprovado antes de produzir; v1 aprovada antes da voz final (data AAAA-MM-DD) */
  approvals: z.object({ roteiro: IsoDate.optional(), v1: IsoDate.optional(), final: IsoDate.optional() }).optional(),
  comments: z.array(ReviewComment).default([]),
}).superRefine((r, ctx) => {
  const seen = new Set<string>();
  r.comments.forEach((c, i) => { if (seen.has(c.id)) ctx.addIssue({ code: 'custom', path: ['comments', i, 'id'], message: `id repetido: ${c.id}` }); seen.add(c.id); });
});
export type Review = z.infer<typeof Review>;
