import { z } from 'zod';
import { IsoDateTime } from './common';

/**
 * <pasta da peça>/revisao.json — anotações do Oliver num vídeo (tarefa 022, v1 enxuta).
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

export const Review = z.object({
  comments: z.array(ReviewComment).default([]),
}).superRefine((r, ctx) => {
  const seen = new Set<string>();
  r.comments.forEach((c, i) => { if (seen.has(c.id)) ctx.addIssue({ code: 'custom', path: ['comments', i, 'id'], message: `id repetido: ${c.id}` }); seen.add(c.id); });
});
export type Review = z.infer<typeof Review>;
