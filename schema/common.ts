// Tipos básicos compartilhados. Todo arquivo de dados do hub é validado por estes schemas
// (app, ferramentas e `npm run validate`). Chaves em inglês; textos da interface em pt-BR.
import { z } from 'zod';

export const Slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'use minúsculas, números e hífen');
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data AAAA-MM-DD');
export const IsoDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/, 'data-hora ISO');
export const Url = z.string().url();
export const TagList = z.array(Slug).default([]);
/** YAML vazio (`due:`) chega como null: trate como ausente. */
export const nullish = <T extends z.ZodTypeAny>(s: T) => s.nullish().transform((v) => v ?? undefined).optional();

export const Platform = z.enum(['youtube', 'instagram', 'tiktok', 'site', 'facebook', 'linkedin', 'x', 'outro']);
export type Platform = z.infer<typeof Platform>;
