import { z } from 'zod';
import { IsoDateTime, Slug } from './common';
import { Ad } from './ads';

/**
 * competitors/<id>/ads/marks.json — o que o Oliver marcou nos anúncios de um concorrente (037 fase D).
 * Camada do Oliver: coleta nova e reclassificação NUNCA sobrescrevem este arquivo. Chave = `${fonte}:${adId}` (`meta:123`).
 * Resolução de um campo (ordem fixa): override do Oliver > (IA, fase F) > regras.
 */
export const AD_FUNIS = ['topo', 'meio', 'fundo'] as const;
export const AD_TIPOS = ['oferta', 'conteudo', 'prova-social', 'demonstracao', 'institucional', 'isca', 'remarketing', 'indefinido'] as const;
export const AD_OBJETIVOS = ['trafego', 'cadastro', 'mensagem-whatsapp', 'lead', 'instalacao-app', 'engajamento', 'indefinido'] as const;
export const AD_CAMPOS = ['funil', 'tipo', 'objetivo'] as const;
export type AdCampo = (typeof AD_CAMPOS)[number];

export const AdOverride = z.object({
  funil: z.enum(AD_FUNIS).optional(),
  tipo: z.enum(AD_TIPOS).optional(),
  objetivo: z.enum(AD_OBJETIVOS).optional(),
});
export type AdOverride = z.infer<typeof AdOverride>;

export const AdMark = z.object({
  saved: z.boolean().default(false),
  savedAt: IsoDateTime.optional(),
  /** ids de intel/colecoes-anuncios.yml (fase futura) */
  colecoes: z.array(z.string()).default([]),
  /** markdown curto */
  note: z.string().optional(),
  /** ids de tags.yml (grupo `angulo`, `gancho`…) ou livres */
  tags: z.array(Slug).default([]),
  /** correção manual: SEMPRE ganha de regra e IA */
  override: AdOverride.optional(),
  ideaId: z.string().regex(/^I-\d+$/).optional(),
  /** cópia do anúncio no momento de salvar (a Biblioteca apaga o que sai do ar) */
  frozen: Ad.optional(),
  /** miniatura leve copiada para competitors/<id>/ads/salvos/ (relativa a essa pasta); vídeo pesado nunca entra no git */
  frozenMedia: z.string().optional(),
  updatedAt: IsoDateTime,
});
export type AdMark = z.infer<typeof AdMark>;

export const AdsMarks = z.object({
  schema: z.literal(1).default(1),
  ads: z.record(z.string().regex(/^[a-z]+:.+$/, 'chave "fonte:id"'), AdMark).default({}),
});
export type AdsMarks = z.infer<typeof AdsMarks>;

export const adKey = (adId: string, fonte = 'meta') => `${fonte}:${adId}`;

/** alteração parcial de uma marca: `null` apaga o campo (override: volta ao automático) */
export interface AdMarkPatch {
  saved?: boolean;
  note?: string | null;
  tags?: string[];
  override?: { [K in AdCampo]?: string | null };
}

/** Aplica o patch (função pura, a mesma no servidor e no cache otimista do app). Não mexe em `frozen`/`frozenMedia`: isso é do servidor. */
export function aplicarMarca(old: AdMark | undefined, patch: AdMarkPatch, agora: string): AdMark {
  const m: AdMark = { saved: false, colecoes: [], tags: [], ...structuredClone(old ?? {}), updatedAt: agora };
  if (patch.saved !== undefined && patch.saved !== m.saved) {
    m.saved = patch.saved;
    if (patch.saved) m.savedAt = agora; else delete m.savedAt;
  }
  if (patch.note !== undefined) { if (patch.note?.trim()) m.note = patch.note; else delete m.note; }
  if (patch.tags) m.tags = [...new Set(patch.tags)];
  if (patch.override) {
    const o: Record<string, string> = { ...m.override };
    for (const [k, v] of Object.entries(patch.override)) { if (v == null || v === '') delete o[k]; else o[k] = v; }
    if (Object.keys(o).length) m.override = o as AdOverride; else delete m.override;
  }
  return m;
}

/** marca sem nada do Oliver: pode sair do arquivo */
export const marcaVazia = (m: AdMark) => !m.saved && !m.note && !m.tags.length && !m.override && !m.colecoes.length && !m.ideaId;

/** valor de um campo: override do Oliver vence a regra (a IA entra entre os dois na fase F) */
export function resolverCampo<T extends string>(campo: AdCampo, regra: T, mark?: Pick<AdMark, 'override'>): { valor: T; origem: 'voce' | 'regra' } {
  const o = mark?.override?.[campo];
  return o ? { valor: o as T, origem: 'voce' } : { valor: regra, origem: 'regra' };
}
