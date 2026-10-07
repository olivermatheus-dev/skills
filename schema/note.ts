import { z } from 'zod';
import { Slug, IsoDateTime, TagList, nullish } from './common';

/** companies/<slug>/notes/<id>.md — anotação em markdown (editor rich text na interface). */
export const Note = z.object({
  id: Slug,
  title: z.string().min(1),
  folder: nullish(z.string()),
  tags: TagList,
  pinned: z.boolean().default(false),
  created: IsoDateTime,
  updated: IsoDateTime,
});
export type Note = z.infer<typeof Note>;
