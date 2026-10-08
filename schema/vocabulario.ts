import { z } from 'zod';
import { IsoDate, Slug } from './common';

/**
 * library/analise/vocabulario.json — vocabulário fechado da ficha de análise (tarefa 040), global (todas as empresas).
 * A IA só escolhe ids daqui; o que não cabe vira `termosNovos` na ficha e o Oliver aceita (entra aqui) ou recusa (vai para `recusados`).
 * Os grupos do nicho (tema, ângulo, público) ficam em companies/<slug>/tags.yml, e o formato em library/formatos/.
 */
export const VocabTermo = z.object({
  id: Slug,
  nome: z.string().min(1),
  definicao: z.string().min(1),
  /** pistas de que o termo se aplica (palavras, cenas) */
  sinais: z.array(z.string()).default([]),
  exemplo: z.string().optional(),
  /** `proposto` = aceito de uma proposta da IA, ainda sem revisão */
  status: z.enum(['ativo', 'proposto']).default('ativo'),
});
export type VocabTermo = z.infer<typeof VocabTermo>;

export const VOCAB_GRUPOS = [
  'tipoConteudo', 'gatilho', 'tipoGancho', 'canalGancho', 'elemento5s', 'estruturaMacro', 'estiloProducao',
  'ctaTipo', 'produtoPresenca', 'consciencia', 'tom', 'som', 'risco', 'autoria', 'provaTipo', 'funil',
] as const;
export type VocabGrupo = (typeof VOCAB_GRUPOS)[number];

export const VocabRecusado = z.object({
  grupo: z.string().min(1),
  valor: z.string().min(1),
  motivo: z.string().optional(),
  em: IsoDate,
});

export const Vocabulario = z.object({
  versao: z.number().int().positive(),
  atualizadoEm: IsoDate,
  grupos: z.object(Object.fromEntries(VOCAB_GRUPOS.map((g) => [g, z.array(VocabTermo).min(1)])) as Record<VocabGrupo, z.ZodArray<typeof VocabTermo>>),
  recusados: z.array(VocabRecusado).default([]),
}).superRefine((v, ctx) => {
  for (const g of VOCAB_GRUPOS) {
    const seen = new Set<string>();
    v.grupos[g].forEach((t, i) => {
      if (seen.has(t.id)) ctx.addIssue({ code: 'custom', path: ['grupos', g, i, 'id'], message: `id repetido no grupo ${g}: ${t.id}` });
      seen.add(t.id);
    });
  }
});
export type Vocabulario = z.infer<typeof Vocabulario>;
