import { z } from 'zod';
import { IsoDate, Url, TagList, Platform, nullish } from './common';
import { FICHA_KEY_RE } from './ficha';

export const Objective = z.enum(['informar', 'novidade', 'curiosidade', 'engajar', 'converter', 'polemica']);
export const Tone = z.enum(['dramatico', 'epico', 'animado', 'inspirador', 'calmo', 'urgente', 'curioso']);

/** companies/<slug>/ideas/I-NNNN-<slug>.md — banco de ideias (tarefa 012). Corpo = briefing e observações. */
export const Idea = z.object({
  id: z.string().regex(/^I-\d{4}$/),
  title: z.string().min(1),
  status: z.enum(['nova', 'analisada', 'aprovada', 'virou-tarefa', 'descartada']).default('nova'),
  objective: nullish(Objective),
  tone: nullish(Tone),
  format: nullish(z.string()),
  source: nullish(z.object({
    competitor: nullish(z.string()),
    platform: nullish(Platform),
    itemId: nullish(z.string()),
    url: nullish(Url),
    /** ficha de análise do item (040): `<plataforma>:<id>`; a análise vai no corpo da ideia */
    ficha: nullish(z.string().regex(FICHA_KEY_RE)),
    /** relatório do concorrente que cita o item (competitors/<id>/relatorios/<relatorio>.md) */
    relatorio: nullish(z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/)),
  })),
  task: nullish(z.string().regex(/^T-\d{4}$/)),
  tags: TagList,
  created: IsoDate,
  // curadoria (041): de onde a ideia veio e o que a sustenta. Ideias antigas ficam como 'manual' sem refs.
  origin: z.enum(['concorrente', 'pesquisa', 'manual']).default('manual'),
  /** referências verificadas (curadoria/referencias/R-NNNN.json) que sustentam a ideia */
  refs: z.array(z.string().regex(/^R-\d{4}$/)).default([]),
  /** pilar e série do CONTENT_STRATEGY.md */
  pillar: nullish(z.number().int().positive()),
  series: nullish(z.number().int().positive()),
  /** rodada de pesquisa que gerou (curadoria/rodadas/<id>) */
  round: nullish(z.string()),
  /** nota da síntese (ranking da rodada) */
  score: nullish(z.number().min(0).max(10)),
}).superRefine((i, ctx) => {
  if (i.origin === 'pesquisa' && !i.refs.length) ctx.addIssue({ code: 'custom', path: ['refs'], message: 'ideia de pesquisa precisa de ao menos 1 referência verificada (R-NNNN)' });
});
export type Idea = z.infer<typeof Idea>;
