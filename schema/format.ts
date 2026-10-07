import { z } from 'zod';
import { IsoDate, IsoDateTime, Slug } from './common';

/**
 * library/formatos/<id>/formato.json — verbete da galeria de formatos (tarefa 027), global (todas as empresas).
 * Formato = o COMO (texto cinético, meme, antes × depois…); tipo de conteúdo = o PORQUÊ (educativo, humor, prova…).
 * Verbete `ativo` tem a skill `.claude/skills/fmt-<id>/` (instruções que a IA executa); `rascunho` é referência
 * solta (link/print + observação) que vira skill quando a gente repetir 2–3 vezes.
 * Exemplos nossos apontam para a peça (companies/<empresa>/contents/<pasta>): a mídia não é copiada.
 * Prints de referência ficam em library/formatos/<id>/refs/ (fora do git: são de terceiros).
 */
export const CONTENT_TYPES = ['educativo', 'identificacao', 'humor', 'bastidor', 'prova', 'produto', 'lancamento', 'oferta'] as const;
export const CONTENT_TYPE_LABEL: Record<(typeof CONTENT_TYPES)[number], string> = {
  educativo: 'Educativo', identificacao: 'Identificação', humor: 'Humor', bastidor: 'Bastidor',
  prova: 'Prova', produto: 'Produto', lancamento: 'Lançamento', oferta: 'Oferta',
};
export const FORMAT_MEDIA = ['imagem', 'video'] as const;
export const FORMAT_CHANNELS = ['feed', 'reels', 'stories', 'tiktok', 'youtube-shorts', 'anuncio', 'lp'] as const;
export const FORMAT_RATIOS = ['1:1', '4:5', '9:16', '16:9'] as const;
export const FUNNEL = ['topo', 'meio', 'fundo'] as const;

export const FormatExample = z.object({
  empresa: Slug,
  /** pasta da peça relativa a contents/ */
  peca: z.string().min(1),
  /** arquivo da peça (exports/… ou png/…); vazio = o principal da peça */
  arquivo: z.string().regex(/^(exports|png)\/[^\\:]+$/, 'arquivo em exports/ ou png/').optional(),
  legenda: z.string().optional(),
  /** peça de teste: serve de exemplo visual, não de modelo de texto */
  teste: z.boolean().optional(),
  adicionadoEm: IsoDate,
});
export type FormatExample = z.infer<typeof FormatExample>;

export const FormatRef = z.object({
  url: z.string().url().optional(),
  /** print salvo em refs/ (nome do arquivo) */
  imagem: z.string().regex(/^[\w.-]+\.(png|jpe?g|webp|gif)$/i, 'imagem em refs/').optional(),
  observacao: z.string().default(''),
  adicionadoEm: IsoDate,
}).refine((r) => r.url || r.imagem, 'link ou print');
export type FormatRef = z.infer<typeof FormatRef>;

export const FormatBlock = z.object({
  bloco: z.string().min(1),
  /** tempo (vídeo, "0–2 s") ou posição (imagem, "slide 1") */
  quando: z.string().optional(),
  oque: z.string().min(1),
});

export const Format = z.object({
  id: Slug,
  nome: z.string().trim().min(1),
  status: z.enum(['ativo', 'rascunho']).default('rascunho'),
  /** skill que a IA carrega (obrigatória no ativo) */
  skill: z.string().regex(/^fmt-[a-z0-9-]+$/).optional(),
  midia: z.enum(FORMAT_MEDIA),
  /** motor que gera a peça */
  motor: z.enum(['carousel', 'video', 'mockup']).optional(),
  /** a essência em 1 frase */
  essencia: z.string().trim().min(1),
  tipos: z.array(z.enum(CONTENT_TYPES)).default([]),
  funil: z.array(z.enum(FUNNEL)).default([]),
  canais: z.array(z.enum(FORMAT_CHANNELS)).default([]),
  proporcoes: z.array(z.enum(FORMAT_RATIOS)).default([]),
  /** duração (vídeo) ou tamanho (imagem): "15–20 s", "7–9 slides" */
  tamanho: z.string().optional(),
  quandoUsar: z.array(z.string()).default([]),
  quandoNaoUsar: z.array(z.string()).default([]),
  estrutura: z.array(FormatBlock).default([]),
  variacoes: z.array(z.string()).default([]),
  /** observações do Oliver (editáveis no app): a IA lê junto com a skill e elas mandam sobre ela */
  observacoes: z.string().default(''),
  /** nota do Oliver para o formato, 1–5 */
  nota: z.number().int().min(1).max(5).optional(),
  exemplos: z.array(FormatExample).default([]),
  referencias: z.array(FormatRef).default([]),
  updatedAt: IsoDateTime.optional(),
}).refine((f) => f.status !== 'ativo' || !!f.skill, { message: 'formato ativo precisa da skill fmt-*', path: ['skill'] });
export type Format = z.infer<typeof Format>;
