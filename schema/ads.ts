import { z } from 'zod';
import { IsoDateTime, nullish } from './common';

/** Um anúncio da Biblioteca de Anúncios da Meta (como aparece na página pública, sem login). */
export const Ad = z.object({
  /** id da biblioteca ("Identificação da biblioteca") */
  id: z.string().min(1),
  pageName: nullish(z.string()),
  pageId: nullish(z.string()),
  active: z.boolean().default(true),
  /** "Veiculação iniciada em" (AAAA-MM-DD) */
  startedAt: nullish(z.string()),
  endedAt: nullish(z.string()),
  /** onde roda: facebook, instagram, messenger, audience_network, threads… */
  platforms: z.array(z.string()).default([]),
  text: nullish(z.string()),
  title: nullish(z.string()),
  description: nullish(z.string()),
  cta: nullish(z.string()),
  linkUrl: nullish(z.string()),
  media: z.object({
    type: z.enum(['imagem', 'video', 'carrossel', 'desconhecido']).default('desconhecido'),
    thumbnail: nullish(z.string()),
    /** cópia local, relativa à pasta do concorrente (media/ads/…) */
    thumbnailLocal: nullish(z.string()),
    videoUrl: nullish(z.string()),
  }).default({ type: 'desconhecido' }),
  /** "N anúncios usam esse criativo e texto" */
  variations: nullish(z.number().int().nonnegative()),
  url: z.string(),
});
export type Ad = z.infer<typeof Ad>;

/**
 * companies/<slug>/competitors/<id>/ads/<AAAA-MM-DDTHH-mm-ss>.json — uma coleta da biblioteca (imutável, como os snapshots).
 * Busca pela página do Facebook do concorrente (pageId) quando houver; senão, pelo nome (query).
 */
export const AdsSnapshot = z.object({
  schema: z.literal(1).default(1),
  collectedAt: IsoDateTime,
  source: z.string().default('meta-ads-library'),
  country: z.string().default('BR'),
  query: nullish(z.string()),
  pageId: nullish(z.string()),
  pageName: nullish(z.string()),
  /** total que a biblioteca diz ter (pode ser maior que `ads`, que é o que foi lido) */
  total: nullish(z.number().int().nonnegative()),
  ads: z.array(Ad).default([]),
  errors: z.array(z.string()).default([]),
});
export type AdsSnapshot = z.infer<typeof AdsSnapshot>;
