import { z } from 'zod';
import { IsoDateTime, Slug } from './common';
import { FICHA_KEY_RE } from './ficha';

/**
 * companies/<slug>/competitors/<id>/relatorios/AAAA-MM-DD-<rede|anuncios>-<escopo>.md — mini compilado de uma rodada de análise (tarefa 040).
 * Frontmatter = este schema; corpo = as seções fixas do desenho (§6). Os números do texto só podem vir de `agregados` (calculados por script).
 */
export const Relatorio = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/, 'AAAA-MM-DD-<rede>-<escopo>'),
  competitor: Slug,
  rede: z.enum(['instagram', 'tiktok', 'youtube', 'anuncios']),
  escopo: z.enum(['top10', 'top20', 'selecao', 'todos-analisados']),
  itens: z.array(z.string().regex(FICHA_KEY_RE)).min(1),
  /** números do script (contagens, medianas, lift); o texto nunca traz número fora daqui */
  agregados: z.record(z.string(), z.unknown()).default({}),
  modelo: z.string().min(1),
  custo: z.object({ usd: z.number().nonnegative().optional(), via: z.enum(['api', 'api-batch', 'claude-code']) }).optional(),
  gerado: IsoDateTime,
  /** id do relatório anterior do mesmo concorrente e rede */
  anterior: z.string().optional(),
  /** a ficha do concorrente mostra o mais recente em destaque */
  emDestaque: z.boolean().default(false),
});
export type Relatorio = z.infer<typeof Relatorio>;

/** pedido de rodada: companies/<slug>/competitors/<id>/fichas/pedido.json (fase E grava; a fila lê) */
export const FichasPedido = z.object({
  /** chaves congeladas no clique (o "top 10" vira lista fixa) */
  itens: z.array(z.string().regex(FICHA_KEY_RE)).min(1),
  origem: z.enum(['selecao', 'top']),
  rede: z.enum(['instagram', 'tiktok', 'youtube']).optional(),
  n: z.number().int().positive().optional(),
  criterio: z.enum(['xPerfil', 'xMercado', 'porSeguidor', 'engajamento']).optional(),
  /** default false: os já analisados saem no clique */
  reanalisar: z.boolean().default(false),
  relatorio: z.boolean().default(true),
  instrucoes: z.string().default(''),
  requestedAt: IsoDateTime,
  status: z.enum(['pendente', 'rodando']).default('pendente'),
});
export type FichasPedido = z.infer<typeof FichasPedido>;
