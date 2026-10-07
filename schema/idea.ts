import { z } from 'zod';
import { IsoDate, Url, TagList, Platform, nullish } from './common';

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
  })),
  task: nullish(z.string().regex(/^T-\d{4}$/)),
  tags: TagList,
  created: IsoDate,
});
export type Idea = z.infer<typeof Idea>;
