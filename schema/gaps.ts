import { z } from 'zod';
import { IsoDateTime, Slug } from './common';

/**
 * companies/<slug>/intel/brechas.json — brechas somadas (Concorrentes → Panorama).
 * A IA junta as "brechas para nós" de todas as análises de pontos fortes e fracos (módulo `forcas`) em temas e conta
 * quantos concorrentes abrem cada tema. `basedOn` guarda a data da análise usada de cada concorrente: se alguma
 * análise ficar mais nova (ou entrar concorrente novo), o Panorama avisa que o resumo está desatualizado.
 * Regenerar: skill analise-concorrentes → "atualiza as brechas".
 */
export const GAP_KINDS = ['mensagem', 'publico', 'oferta', 'produto'] as const;
export const GapKind = z.enum(GAP_KINDS);

export const GapTheme = z.object({
  id: Slug,
  title: z.string().min(1).max(70, 'título com no máximo 70 caracteres'),
  kind: GapKind,
  /** o que a nossa empresa faz com isso (direção, sem inventar fato do produto) */
  action: z.string().min(1),
  /** o que precisa existir antes de usar (ex.: "T-0009 origin story") */
  dependsOn: z.string().optional(),
  /** funcionalidades da matriz ligadas ao tema: o Panorama mostra se já temos */
  features: z.array(Slug).default([]),
  /** frase original de cada análise que caiu no tema */
  sources: z.array(z.object({ competitor: Slug, text: z.string().min(1) })).min(1),
});
export type GapTheme = z.infer<typeof GapTheme>;

export const Gaps = z.object({
  updatedAt: IsoDateTime,
  by: z.string(),
  /** concorrente → updatedAt da análise `forcas` usada */
  basedOn: z.record(z.string(), IsoDateTime).default({}),
  themes: z.array(GapTheme).default([]),
}).superRefine((g, ctx) => {
  const ids = new Set<string>();
  g.themes.forEach((t, i) => {
    if (ids.has(t.id)) ctx.addIssue({ code: 'custom', path: ['themes', i, 'id'], message: `id repetido: ${t.id}` });
    ids.add(t.id);
    for (const s of t.sources) if (!(s.competitor in g.basedOn)) ctx.addIssue({ code: 'custom', path: ['themes', i, 'sources'], message: `"${s.competitor}" não está em basedOn` });
  });
});
export type Gaps = z.infer<typeof Gaps>;
