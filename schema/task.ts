import { z } from 'zod';
import { nullish } from './common';

// companies/<slug>/board/T-NNNN-<slug>.md — mesmo contrato de tools/lib/board.mjs (heartbeat, agentes).
// O frontmatter é "YAML simples": 1 chave por linha, listas inline [a, b]. Ler/escrever com schema/frontmatter.ts (simple*).
export const STATUS = ['backlog', 'todo', 'doing', 'review', 'done'] as const;
export const BOARDS = ['conteudo', 'vendas', 'produto'] as const;
export const PRIORITY = ['baixa', 'media', 'alta'] as const;

const list = z.union([z.array(z.string()), z.string()]).nullish()
  .transform((v) => (Array.isArray(v) ? v : v ? [v] : []));

export const Task = z.object({
  id: z.string().regex(/^T-\d{4}$/),
  title: z.string().min(1),
  board: z.enum(BOARDS),
  status: z.enum(STATUS),
  assignee: z.string().regex(/^(oliver|ai|agent:[a-z-]+)$/, 'oliver | ai | agent:<nome>'),
  priority: z.enum(PRIORITY).default('media'),
  due: nullish(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  depends: list,
  parent: nullish(z.string().regex(/^T-\d{4}$/)),
  links: list,
});
export type Task = z.infer<typeof Task>;
