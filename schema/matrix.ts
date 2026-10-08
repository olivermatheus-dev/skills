import { z } from 'zod';
import { IsoDateTime, Slug } from './common';

/**
 * companies/<slug>/intel/matriz.json — matriz de funcionalidades × concorrentes (Concorrentes → Comparar → Funcionalidades).
 * Linhas = `features` (catálogo canônico, agrupado por `groups`). Colunas = o `id` de cada concorrente e `_nos` (a própria empresa).
 * Célula ausente = desconhecido (ninguém olhou). Regra: a IA nunca sobrescreve célula com `by: 'oliver'`.
 */
export const NOS = '_nos';
export const CELL_STATUS = ['sim', 'parcial', 'nao', 'desconhecido', 'planejado'] as const;
export const CellStatus = z.enum(CELL_STATUS);
export type CellStatus = z.infer<typeof CellStatus>;

export const MatrixCell = z.object({
  status: CellStatus,
  /** texto curtíssimo que aparece na célula */
  note: z.string().max(50, 'nota com no máximo 50 caracteres').optional(),
  /** URL ou arquivo de onde veio */
  source: z.string().optional(),
  by: z.enum(['ia', 'oliver']),
  updatedAt: IsoDateTime,
});
export type MatrixCell = z.infer<typeof MatrixCell>;

export const MatrixFeature = z.object({
  id: Slug,
  name: z.string().min(1).max(40, 'nome com no máximo 40 caracteres'),
  group: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
});
export type MatrixFeature = z.infer<typeof MatrixFeature>;

export const Matrix = z.object({
  updatedAt: IsoDateTime,
  /** grupos em ordem de exibição */
  groups: z.array(z.string().min(1)).default([]),
  features: z.array(MatrixFeature).default([]),
  /** coluna (id do concorrente ou `_nos`) → feature → célula */
  cells: z.record(z.string(), z.record(z.string(), MatrixCell)).default({}),
}).superRefine((m, ctx) => {
  const ids = new Set<string>();
  m.features.forEach((f, i) => {
    if (ids.has(f.id)) ctx.addIssue({ code: 'custom', path: ['features', i, 'id'], message: `id repetido: ${f.id}` });
    ids.add(f.id);
    if (!m.groups.includes(f.group)) ctx.addIssue({ code: 'custom', path: ['features', i, 'group'], message: `grupo "${f.group}" não está em groups` });
  });
  for (const [col, cs] of Object.entries(m.cells)) for (const [fid, c] of Object.entries(cs)) {
    if (!ids.has(fid)) ctx.addIssue({ code: 'custom', path: ['cells', col, fid], message: `feature "${fid}" não existe no catálogo` });
    if (c.status === 'planejado' && col !== NOS) ctx.addIssue({ code: 'custom', path: ['cells', col, fid, 'status'], message: '"planejado" só vale para a coluna _nos' });
  }
});
export type Matrix = z.infer<typeof Matrix>;

export const EMPTY_MATRIX: Matrix = { updatedAt: '2000-01-01T00:00:00Z', groups: [], features: [], cells: {} };
