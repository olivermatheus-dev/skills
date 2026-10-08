import { z } from 'zod';
import { IsoDateTime, Slug } from './common';
import { FICHA_KEY_RE } from './ficha';

/**
 * companies/<slug>/competitors/<id>/relatorios/AAAA-MM-DD-<rede|anuncios>-<escopo>.md — mini compilado de uma rodada de análise (tarefa 040).
 * Frontmatter = este schema; corpo = as seções fixas do desenho (§6). Os números do texto só podem vir de `agregados` (calculados por script).
 */
const Itens = z.array(z.string().regex(FICHA_KEY_RE)).default([]);

/** termo proposto pelas fichas da rodada; `decisao` é gravada quando o Oliver aceita ou recusa no app */
export const RelatorioTermo = z.object({
  /** grupo do vocabulário (tipoConteudo, gatilho…) ou `formato` · `tema` · `angulo` · `publico` */
  grupo: z.string().min(1),
  valor: Slug,
  definicao: z.string().min(1),
  exemplo: z.string().optional(),
  /** fichas que propuseram */
  itens: Itens,
  decisao: z.enum(['aceito', 'recusado']).optional(),
  em: IsoDateTime.optional(),
});
export type RelatorioTermo = z.infer<typeof RelatorioTermo>;

/** a leitura do Opus em blocos fixos (§6 do desenho); `itens` = fichas que sustentam o bloco */
export const RelatorioLeitura = z.object({
  /** a aposta deste concorrente nesta rede e o que funciona, em até 5 linhas */
  resumo: z.array(z.string().min(1)).min(1).max(5),
  padroes: z.array(z.object({ titulo: z.string().min(1), texto: z.string().min(1), itens: Itens })).default([]),
  /** o mecanismo (nunca a frase) e como levar para a nossa marca */
  copiar: z.array(z.object({ mecanismo: z.string().min(1), como: z.string().min(1), itens: Itens })).default([]),
  evitar: z.array(z.object({ texto: z.string().min(1), itens: Itens })).default([]),
  ideias: z.array(z.object({ ideia: z.string().min(1), formato: z.string().optional(), itens: Itens })).max(5).default([]),
  limites: z.array(z.string().min(1)).default([]),
});
export type RelatorioLeitura = z.infer<typeof RelatorioLeitura>;

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
  /** termos que as fichas da rodada propuseram (fora do vocabulário), para aceitar ou recusar em lote */
  termosNovos: z.array(RelatorioTermo).default([]),
  /** leitura do Opus (sem ela, o relatório tem só os números do script); nenhum número fora de `agregados` */
  leitura: RelatorioLeitura.optional(),
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
