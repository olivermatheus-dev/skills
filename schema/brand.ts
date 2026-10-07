import { z } from 'zod';

/**
 * companies/<slug>/brand/brand.json — kit de marca (tarefa 024). FONTE DE VERDADE dos tokens:
 * `npm run brand -- <slug>` (ou salvar no app) gera o brand.css que carrossel, vídeo e LP linkam.
 * Tokens em grupos, na ordem do CSS; `note` vira o comentário ao lado do token.
 */
const TokenName = z.string().regex(/^[a-z][a-z0-9-]*$/, 'minúsculas, números e hífen (sem "--")');

export const BrandToken = z.object({
  name: TokenName,
  value: z.string().min(1).refine((v) => !/[;{}]/.test(v), 'valor não pode ter ; { }'),
  note: z.string().optional(),
});
export type BrandToken = z.infer<typeof BrandToken>;

export const BrandGroup = z.object({
  /** título do grupo (vira o comentário que abre o bloco no CSS) */
  label: z.string().min(1),
  tokens: z.array(BrandToken),
});

export const FontFile = z.object({
  /** caminho relativo a brand/ (ex.: fonts/montserrat.woff2) */
  src: z.string().regex(/^fonts\/[\w.-]+\.(woff2|woff|ttf|otf)$/, 'arquivo em fonts/ (.woff2, .woff, .ttf, .otf)'),
  style: z.enum(['normal', 'italic']).default('normal'),
  /** "400" ou faixa da fonte variável "100 900" */
  weight: z.string().regex(/^\d{3}( \d{3})?$/).default('400'),
  unicodeRange: z.string().optional(),
});
export const BrandFont = z.object({
  family: z.string().min(1),
  /** local = arquivos em brand/fonts/ (render offline); google = @import do Google Fonts */
  source: z.enum(['local', 'google']),
  files: z.array(FontFile).default([]),
  /** google: trecho do css2 depois de family= (ex.: "Inter:wght@400;500;600;700") */
  google: z.string().optional(),
  /** arquivo da licença (ex.: fonts/OFL-Montserrat.txt) */
  license: z.string().optional(),
  display: z.enum(['auto', 'block', 'swap', 'fallback', 'optional']).default('block'),
  note: z.string().optional(),
}).superRefine((f, ctx) => {
  if (f.source === 'local' && !f.files.length) ctx.addIssue({ code: 'custom', path: ['files'], message: 'fonte local precisa de ao menos 1 arquivo' });
  if (f.source === 'google' && !f.google) ctx.addIssue({ code: 'custom', path: ['google'], message: 'fonte do Google precisa do trecho family= (ex.: Inter:wght@400;700)' });
});
export type BrandFont = z.infer<typeof BrandFont>;

export const ICON_LIBRARIES = ['lucide'] as const;
export const BrandIcons = z.object({
  library: z.enum(ICON_LIBRARIES).default('lucide'),
  /** espessura do traço (Lucide padrão = 2) */
  stroke: z.number().min(0.5).max(3).default(1.75),
  style: z.enum(['linha', 'preenchido']).default('linha'),
  /** cor do ícone: nome de um token de cor (sem --) */
  color: TokenName.default('primary'),
});

export const BrandStyle = z.object({
  /** id do preset aplicado (core/brand-presets.ts); null = estilo livre */
  preset: z.string().nullish().transform((v) => v ?? undefined).optional(),
  /** anotações de estilo do Oliver: vão para o BRAND.md (bloco do kit) e as skills seguem */
  do: z.array(z.string().min(1)).default([]),
  dont: z.array(z.string().min(1)).default([]),
  notes: z.string().optional(),
});

/** nomes que as skills usam (molde em companies/_modelo/brand/): o kit precisa ter todos */
export const REQUIRED_TOKENS = [
  'bg', 'surface', 'surface-2', 'text', 'muted', 'border', 'primary', 'on-primary', 'accent', 'success', 'warning', 'danger',
  'inverse-bg', 'on-inverse', 'accent-soft',
  'font-heading', 'font-body', 'weight-heading', 'tracking-heading', 'leading-heading', 'case-heading',
  'radius', 'radius-sm', 'border-width', 'shadow-sm', 'shadow-md', 'shadow-lg',
] as const;

export const Brand = z.object({
  /** comentário do topo do CSS (origem dos tokens etc.) */
  header: z.string().optional(),
  style: BrandStyle.default({ do: [], dont: [] }),
  icons: BrandIcons.default({ library: 'lucide', stroke: 1.75, style: 'linha', color: 'primary' }),
  fonts: z.array(BrandFont).default([]),
  groups: z.array(BrandGroup).min(1),
}).superRefine((b, ctx) => {
  const names = new Set<string>();
  b.groups.forEach((g, gi) => g.tokens.forEach((t, ti) => {
    if (['icon-stroke', 'icon-color', 'icon-fill'].includes(t.name)) ctx.addIssue({ code: 'custom', path: ['groups', gi, 'tokens', ti, 'name'], message: `${t.name} é gerado a partir de icons` });
    if (names.has(t.name)) ctx.addIssue({ code: 'custom', path: ['groups', gi, 'tokens', ti, 'name'], message: `token repetido: ${t.name}` });
    names.add(t.name);
  }));
  const missing = REQUIRED_TOKENS.filter((n) => !names.has(n));
  if (missing.length) ctx.addIssue({ code: 'custom', path: ['groups'], message: `faltam tokens usados pelas skills: ${missing.join(', ')}` });
  if (!names.has(b.icons.color)) ctx.addIssue({ code: 'custom', path: ['icons', 'color'], message: `token de cor inexistente: ${b.icons.color}` });
});
export type Brand = z.infer<typeof Brand>;
