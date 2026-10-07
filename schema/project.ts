import { z } from 'zod';
import { Slug, IsoDate, Url, Platform, nullish } from './common';

/** companies/<slug>/project.yml */
export const Project = z.object({
  slug: Slug,
  name: z.string().min(1),
  description: z.string().default(''),
  segment: z.string().default(''),
  status: z.enum(['ativo', 'pausado', 'arquivado']).default('ativo'),
  website: nullish(Url),
  socials: z.array(z.object({ platform: Platform, url: Url })).default([]),
  color: nullish(z.string()),
  created: IsoDate,
});
export type Project = z.infer<typeof Project>;

/** companies/<slug>/tags.yml — vocabulário de tags do projeto (cor para a interface). */
export const TagDef = z.object({ id: Slug, label: z.string().min(1), color: z.string().default('#888888') });
export const TagsFile = z.object({ tags: z.array(TagDef).default([]) });
export type TagDef = z.infer<typeof TagDef>;
