import { z } from 'zod';
import { Slug, IsoDate, TagList, nullish } from './common';

/** companies/<slug>/personas/<id>.md — frontmatter tipado + corpo livre (história, notas). */
export const Persona = z.object({
  id: Slug,
  name: z.string().min(1),
  role: z.enum(['primaria', 'secundaria', 'anti-persona']).default('primaria'),
  summary: z.string().default(''),
  age: nullish(z.string()),
  occupation: nullish(z.string()),
  /** 1 = inconsciente do problema · 5 = pronto para comprar */
  awareness: nullish(z.number().int().min(1).max(5)),
  pains: z.array(z.string()).default([]),
  desires: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  quotes: z.array(z.string()).default([]),
  tags: TagList,
  updated: IsoDate,
});
export type Persona = z.infer<typeof Persona>;
