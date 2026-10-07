// Análise de concorrentes por módulos (site, preços, features, LP, reputação…).
// Cada módulo grava 1 arquivo: companies/<slug>/competitors/<id>/analysis/<modulo>.json (o último resultado).
// Script faz o que é mecânico (baixar site, sitemap, contatos); a IA só interpreta o texto já extraído.
// Pedido (o que o Oliver marcou para rodar) → analysis/pedido.json. Anotações do Oliver → analysis/notas.json (a IA nunca sobrescreve).
import { z } from 'zod';
import { IsoDateTime, Url, Platform, nullish } from './common';

/** Catálogo de módulos. `engine`: script = roda no app/terminal sem IA · ia = vai para a fila do Claude · misto = script + IA. */
export const MODULES = [
  { id: 'perfis', label: 'Perfis e redes', engine: 'ia', needsSite: false, hint: 'acha site oficial, Instagram, YouTube, TikTok, LinkedIn, Facebook (só links verificados)' },
  { id: 'site', label: 'Site e sitemap', engine: 'script', needsSite: false, hint: 'baixa a home e as páginas-chave (preços, recursos, sobre, contato), monta o sitemap básico' },
  { id: 'contato', label: 'Contato', engine: 'misto', needsSite: true, hint: 'e-mails, telefones, WhatsApp, CNPJ, endereço, razão social' },
  { id: 'atuacao', label: 'Onde atua', engine: 'ia', needsSite: true, hint: 'Brasil, internacional ou ambos; países, idioma e moeda' },
  { id: 'resumo', label: 'Resumo', engine: 'ia', needsSite: true, hint: '3–5 linhas: o que é, para quem, como se posiciona' },
  { id: 'features', label: 'Funcionalidades', engine: 'ia', needsSite: true, hint: 'lista de features por grupo e o que é diferencial' },
  { id: 'forcas', label: 'Pontos fortes e fracos', engine: 'ia', needsSite: true, hint: 'fortes, fracos e brechas que a nossa empresa pode explorar' },
  { id: 'precos', label: 'Preços e planos', engine: 'misto', needsSite: true, hint: 'preço mensal, anual, planos, limites, teste grátis, garantia' },
  { id: 'landing', label: 'Landing page', engine: 'misto', needsSite: true, hint: 'seções em ordem, hero, CTAs, prova social e o que tem de interessante' },
  { id: 'reputacao', label: 'Reputação', engine: 'misto', needsSite: false, hint: 'Reclame Aqui (script, na hora) + notas nas lojas de app e menções (IA)' },
  { id: 'redes', label: 'Coleta das redes', engine: 'script', needsSite: false, hint: 'puxa perfis e conteúdos (YouTube, Instagram, TikTok) — a coleta de sempre' },
] as const;
export const ModuleId = z.enum(MODULES.map((m) => m.id) as [(typeof MODULES)[number]['id'], ...(typeof MODULES)[number]['id'][]]);
export type ModuleId = z.infer<typeof ModuleId>;
/** módulos que só a IA faz (vão para a fila) */
export const LLM_MODULES = MODULES.filter((m) => m.engine !== 'script').map((m) => m.id) as ModuleId[];
/** módulos que o app roda sozinho */
export const SCRIPT_MODULES = MODULES.filter((m) => m.engine === 'script').map((m) => m.id) as ModuleId[];
/** análise completa (a feita 1x ao aceitar um concorrente) */
export const FULL_ANALYSIS = MODULES.map((m) => m.id) as ModuleId[];
/** triagem barata de candidato (antes do aceite) */
export const TRIAGE = ['perfis', 'site', 'resumo', 'atuacao'] as ModuleId[];

export const Market = z.enum(['brasil', 'internacional', 'ambos', 'desconhecido']);
export type Market = z.infer<typeof Market>;

const S = z.string();
const Strs = z.array(S).default([]);
const Num = nullish(z.number().nonnegative());
export const Source = z.object({ url: Url, title: nullish(S) });

// ---------- dados por módulo ----------
export const ModuleData = {
  perfis: z.object({
    found: z.array(z.object({ platform: Platform, url: Url, handle: nullish(S), note: nullish(S) })).default([]),
    notFound: Strs, // plataformas procuradas e não achadas
  }),
  site: z.object({
    url: Url,
    rendered: z.boolean().default(false),
    pages: z.array(z.object({ url: Url, kind: S, file: S, title: nullish(S), chars: z.number().int().nonnegative() })).default([]),
    sitemap: z.object({
      source: z.enum(['sitemap.xml', 'links', 'nenhum']),
      total: z.number().int().nonnegative(),
      groups: z.array(z.object({ name: S, count: z.number().int().nonnegative(), sample: Strs })).default([]),
    }),
    errors: Strs,
  }),
  contato: z.object({
    emails: Strs, phones: Strs, whatsapp: Strs,
    cnpj: nullish(S), companyName: nullish(S), address: nullish(S), city: nullish(S),
    socials: z.array(z.object({ platform: S, url: Url })).default([]),
    support: nullish(S), // canais/horário de suporte
  }),
  atuacao: z.object({
    market: Market,
    countries: Strs, languages: Strs, currencies: Strs,
    evidence: S, // por que essa classificação
  }),
  resumo: z.object({
    oneLiner: S,      // 1 linha (aparece no card)
    text: S,          // 3–5 linhas
    audience: nullish(S),
    positioning: nullish(S),
    size: nullish(S), // "40k+ psicólogas", "fundada em 2015"
  }),
  features: z.object({
    groups: z.array(z.object({ name: S, items: z.array(z.object({ name: S, detail: nullish(S), highlight: z.boolean().default(false) })).default([]) })).default([]),
    differentials: Strs,
    missing: Strs, // o que um concorrente típico tem e este não mostra
  }),
  forcas: z.object({
    strengths: z.array(z.object({ point: S, evidence: nullish(S) })).default([]),
    weaknesses: z.array(z.object({ point: S, evidence: nullish(S) })).default([]),
    opportunities: Strs, // brechas para a nossa empresa
  }),
  precos: z.object({
    publicPrice: z.boolean(),
    currency: S.default('BRL'),
    model: z.enum(['assinatura', 'freemium', 'por-uso', 'sob-consulta', 'comissao', 'gratis', 'outro']),
    fromMonthly: Num, // menor preço mensal de plano pago (cobrança mensal)
    trial: nullish(S), guarantee: nullish(S),
    plans: z.array(z.object({
      name: S, monthly: Num, yearlyMonthly: Num, yearlyTotal: Num,
      users: nullish(S), highlights: Strs, recommended: z.boolean().default(false),
    })).default([]),
    extras: Strs, // add-ons, setup, taxa por paciente…
    notes: nullish(S),
  }),
  landing: z.object({
    url: Url,
    hero: z.object({ headline: S, subheadline: nullish(S), cta: nullish(S), visual: nullish(S) }),
    sections: z.array(z.object({
      type: z.enum(['hero', 'logos', 'problema', 'solucao', 'features', 'como-funciona', 'beneficios', 'prova-social', 'depoimentos', 'numeros', 'precos', 'comparativo', 'seguranca', 'integracoes', 'fundador', 'faq', 'blog', 'cta', 'rodape', 'outro']),
      title: S, summary: S,
    })).default([]),
    ctas: Strs, socialProof: Strs,
    interesting: Strs, // o que vale copiar/observar
    tone: nullish(S),
  }),
  reputacao: z.object({
    reclameAqui: nullish(z.object({
      url: nullish(Url), found: z.boolean(), score: Num, status: nullish(S), complaints: Num,
      responseRate: Num, solvedRate: Num, period: nullish(S), topComplaints: Strs,
    })),
    stores: z.array(z.object({ store: z.enum(['app-store', 'google-play', 'google', 'capterra', 'outro']), rating: Num, reviews: Num, url: nullish(Url) })).default([]),
    mentions: z.array(z.object({ source: S, url: nullish(Url), summary: S })).default([]),
    summary: S,
  }),
  redes: z.object({ results: z.array(z.object({ key: S, ok: z.boolean(), items: z.number().int(), followers: Num })).default([]) }),
} satisfies Record<ModuleId, z.ZodTypeAny>;

/** analysis/<modulo>.json */
export const AnalysisResult = z.object({
  module: ModuleId,
  updatedAt: IsoDateTime,
  /** quem gerou: 'script' ou o modelo (ex.: claude-sonnet-5-5) */
  by: S,
  sources: z.array(Source).default([]),
  /** confiança da IA no resultado (baixa = conferir) */
  confidence: z.enum(['alta', 'media', 'baixa']).default('media'),
  data: z.unknown(),
}).superRefine((v, ctx) => {
  const r = ModuleData[v.module].safeParse(v.data);
  if (!r.success) for (const i of r.error.issues) ctx.addIssue({ code: 'custom', path: ['data', ...i.path], message: i.message });
}).transform((v) => ({ ...v, data: ModuleData[v.module].parse(v.data) }));
export type AnalysisResult = z.infer<typeof AnalysisResult>;
export type ModuleDataOf<M extends ModuleId> = z.infer<(typeof ModuleData)[M]>;

/** analysis/pedido.json — o que o Oliver marcou para rodar (a IA consome e limpa). */
export const AnalysisRequest = z.object({
  modules: z.array(ModuleId).min(1),
  requestedAt: IsoDateTime,
  /** refazer mesmo o que já existe */
  force: z.boolean().default(false),
  /** instruções extras do Oliver para esta rodada */
  instructions: z.string().default(''),
  status: z.enum(['pendente', 'rodando']).default('pendente'),
});
export type AnalysisRequest = z.infer<typeof AnalysisRequest>;

/** analysis/notas.json — anotações do Oliver por módulo (chave `geral` para o concorrente como um todo). */
export const AnalysisNotes = z.record(z.string().regex(/^[a-z]+$/), z.object({ text: z.string(), updated: IsoDateTime }));
export type AnalysisNotes = z.infer<typeof AnalysisNotes>;
