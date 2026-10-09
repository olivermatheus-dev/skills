import { z } from 'zod';
import { IsoDate, IsoDateTime } from './common';

/**
 * <pasta da peça>/peca.json — ficha da peça (vídeo, carrossel, post, roteiro ou mockup): tudo o que NÃO é edição.
 * Nome de exibição (renomear não move a pasta), versão principal, tags, favorito/arquivada, publicação
 * e as notas de texto da peça (legenda, copy, CTA, hashtags, notas livres). Comentários de edição ficam em revisao.json.
 * Opcional: peça sem ficha usa o nome da pasta e o último arquivo exportado.
 */
export const PIECE_KINDS = ['video', 'carrossel', 'post', 'roteiro', 'mockup'] as const;
export const PIECE_NOTE_FIELDS = ['legenda', 'copy', 'cta', 'hashtags', 'notas'] as const;

export const PieceMeta = z.object({
  /** ID fixo da peça (050): letra do tipo + 4 dígitos (V vídeo · C carrossel · P post · M mockup · R roteiro); a pasta é <ID>-<slug> */
  id: z.string().regex(/^[VCPMR]\d{4}$/, 'ID = letra do tipo + 4 dígitos (ex.: V0012)').optional(),
  /** data de criação (antes vinha no nome da pasta) */
  criado: IsoDate.optional(),
  /** tentativas/versões do mesmo conteúdo em peças diferentes (ex.: apresentacao-kz) */
  familia: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).optional(),
  /** campanha a que a peça pertence (companies/<slug>/campaigns/<pasta>) */
  campanha: z.string().optional(),
  /** nome de exibição (a pasta continua a mesma: tarefas e revisão apontam para ela) */
  title: z.string().trim().min(1).optional(),
  /** força o tipo quando a detecção pela pasta erra */
  kind: z.enum(PIECE_KINDS).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  /** formato da galeria (library/formatos/<id>, tarefa 027): a IA carrega a skill dele antes de produzir */
  formato: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).optional(),
  /** arquivo principal relativo à pasta (ex.: "exports/x-9x16-v03.mp4" ou "png/01.png"); vazio = o mais recente */
  principal: z.string().regex(/^(exports|png)\/[^\\:]+$/, 'arquivo em exports/ ou png/').optional(),
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
  publication: z.object({
    platform: z.string().optional(),
    date: IsoDate.optional(),
    url: z.string().optional(),
  }).optional(),
  notes: z.object(Object.fromEntries(PIECE_NOTE_FIELDS.map((k) => [k, z.string().optional()])) as Record<typeof PIECE_NOTE_FIELDS[number], z.ZodOptional<z.ZodString>>).default({}),
  updatedAt: IsoDateTime.optional(),
});
export type PieceMeta = z.infer<typeof PieceMeta>;
