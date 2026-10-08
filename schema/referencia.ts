import { z } from 'zod';
import { IsoDate, nullish } from './common';

/**
 * companies/<slug>/intel/referencia.json — a própria empresa como linha de referência no Comparar e no Panorama.
 * Tirado do contexto (BUSINESS, PRODUTO, COPY, VOICE): só o que está lá; o que falta fica null. Atualizar junto com o contexto.
 */
export const Referencia = z.object({
  name: z.string().min(1),
  updated: IsoDate,
  /** de onde veio cada parte (arquivos de context/) */
  sources: z.array(z.string()).default([]),
  price: z.object({
    /** preço de entrada mensal usado como referência (ex.: o da copy) */
    fromMonthly: nullish(z.number().nonnegative()),
    /** faixa ou ressalva (ex.: "R$ 100–129, final a definir") */
    note: nullish(z.string()),
    currency: z.string().default('BRL'),
    model: z.string(),
    plans: z.number().int().nonnegative(),
    trial: nullish(z.string()),
    guarantee: nullish(z.string()),
  }),
  message: z.object({
    headline: z.string(),
    subheadline: nullish(z.string()),
    cta: nullish(z.string()),
    tone: nullish(z.string()),
  }),
  /** seguidores somados das redes próprias (null = ainda sem redes) */
  followers: nullish(z.number().int().nonnegative()),
  /** mesmos nomes de grupo da análise de funcionalidades dos concorrentes; só o que está pronto */
  features: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({ name: z.string(), highlight: z.boolean().default(false) })),
  })).default([]),
});
export type Referencia = z.infer<typeof Referencia>;
