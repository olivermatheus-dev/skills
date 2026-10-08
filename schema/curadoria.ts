// Curadoria (tarefa 041; 1ª peça da 029): fontes onde a IA procura ideias e temas, referências verificadas e rodadas de pesquisa.
// companies/<slug>/curadoria/fontes.json (Source[]) · referencias/R-NNNN.json (SourceRef) · rodadas/<id>/pedido.json + resultado.json
// Fonte = onde procurar. Referência = um item achado numa fonte e verificado por script (link, DOI, trecho). Ver roadmap/tasks/041.
import { z } from 'zod';
import { IsoDate, IsoDateTime, Slug, Url, TagList, nullish } from './common';

/** vocabulário do brief */
export const SourceType = z.enum([
  'periodico',        // periódico científico (ex.: Psicologia: Ciência e Profissão)
  'base-artigos',     // base/indexador (SciELO, PePSIC, PubMed, OpenAlex)
  'noticia',          // veículo ou agregador de notícias
  'orgao-oficial',    // CFP, CRPs, Ministério da Saúde, OPAS/OMS
  'livro-editora',    // catálogo de livros ou editora
  'podcast',
  'newsletter',
  'perfil-criador',   // perfil/criador (texto ou vídeo); vídeo de concorrente continua na 012
  'outro',
]);
export type SourceType = z.infer<typeof SourceType>;

export const SourceMethod = z.enum(['api', 'rss', 'busca-site', 'pagina', 'web']);
export const SourceAdapter = z.enum(['pubmed', 'europepmc', 'openalex', 'crossref', 'doaj', 'openlibrary', 'google-news', 'rss', 'html-diff']);
export const SourceLanguage = z.enum(['pt', 'en', 'es', 'multi']);
export const SourceStatus = z.enum(['sugerida', 'ativa', 'pausada', 'arquivada']);
export type SourceStatus = z.infer<typeof SourceStatus>;

/** como a IA consulta. `adapter` = qual coletor do script usa (sem LLM); 'web' = subagente lê a página */
export const SourceAccess = z.object({
  method: SourceMethod,
  adapter: nullish(SourceAdapter),
  /** URL da API/feed/busca; `{q}` é trocado pela consulta. Ex.: https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419 */
  endpoint: nullish(Url.or(z.string().includes('{q}'))),
  /** filtros fixos do adaptador (ex.: { "openalexSource": "S2739370219" } ou { "pubType": "systematic-review" }) */
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type SourceAccess = z.infer<typeof SourceAccess>;

/** fonte de curadoria (no app: "Fonte"). Nome com prefixo porque `Source` já existe em analysis.ts (fonte de um dado de análise). */
export const CuratedSource = z.object({
  id: Slug,                                   // ex.: 'scielo', 'cfp-noticias'
  name: z.string().min(1),
  url: Url,                                   // página pública (o que o Oliver abre)
  type: SourceType,
  language: SourceLanguage.default('pt'),
  access: SourceAccess,
  /** consulta padrão quando o pedido não traz tema (texto livre, na sintaxe da fonte) */
  defaultQuery: nullish(z.string()),
  /** palavras-chave somadas ao tema do pedido (ex.: ["psicoterapia", "consultório"]) */
  keywords: z.array(z.string()).default([]),
  /** o que alimenta: números dos pilares e das séries do CONTENT_STRATEGY.md (o validate confere se existem) */
  pillars: z.array(z.number().int().positive()).default([]),
  series: z.array(z.number().int().positive()).default([]),
  tags: TagList,
  /** confiabilidade editorial: 3 = revisão por pares/órgão oficial · 2 = jornalismo profissional · 1 = opinião/criador */
  trust: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** prioridade na rodada (1 baixa · 3 alta); a síntese usa para desempatar */
  weight: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  /** sugerida = proposta pela IA, espera aceite · ativa · pausada · arquivada (recusada ou morta) */
  status: SourceStatus.default('sugerida'),
  notes: z.string().default(''),
  /** quando um humano ou script abriu o link e ele funcionou; null = não conferido */
  verifiedAt: nullish(IsoDate),
  lastUsedAt: nullish(IsoDateTime),           // a rodada atualiza
  addedBy: z.enum(['oliver', 'ai']).default('ai'),
  created: IsoDate,
});
export type CuratedSource = z.infer<typeof CuratedSource>;
export const SourceList = z.array(CuratedSource).superRefine((l, ctx) => {
  const ids = new Set<string>();
  l.forEach((s, i) => { if (ids.has(s.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `id repetido: ${s.id}` }); ids.add(s.id); });
});

/** sugestão do script ao colar um link (sem IA): o que o diálogo "Adicionar fonte" preenche */
export interface SourceSuggestion {
  url: string;
  /** a página abriu (status 2xx) */
  ok: boolean;
  status?: number;
  /** título da página (<title> ou og:site_name) */
  pageTitle?: string;
  /** feed RSS/Atom achado no <link rel="alternate"> */
  feed?: string;
  /** a fonte já existe no cadastro (mesmo domínio e caminho) */
  duplicateOf?: string;
  /** regra de domínio que reconheceu o link (ex.: "SciELO: periódico") */
  matched?: string;
  error?: string;
  draft: Pick<CuratedSource, 'id' | 'name' | 'url' | 'type' | 'language' | 'access' | 'trust' | 'weight' | 'pillars' | 'series' | 'notes'> & { verifiedAt?: string };
}

/** companies/<slug>/curadoria/referencias/R-NNNN.json — um item achado e VERIFICADO */
export const SourceRef = z.object({
  id: z.string().regex(/^R-\d{4}$/),
  sourceId: Slug,                             // de qual fonte veio
  kind: z.enum(['artigo', 'revisao', 'noticia', 'documento-oficial', 'livro', 'podcast', 'post', 'outro']),
  title: z.string().min(1),                   // título original, sem tradução
  url: Url,                                   // link que abre o item (não a home da fonte)
  doi: nullish(z.string().regex(/^10\.\d{4,9}\/\S+$/)),
  authors: z.array(z.string()).default([]),
  venue: nullish(z.string()),                 // periódico, veículo ou órgão
  publishedAt: nullish(IsoDate),
  language: z.enum(['pt', 'en', 'es', 'outro']).default('pt'),
  /** só para artigo/revisão: o que o resumo declara (não o que a IA acha) */
  evidence: nullish(z.enum(['meta-analise', 'revisao-sistematica', 'ensaio-clinico', 'observacional', 'qualitativo', 'revisao-narrativa', 'documento', 'opiniao'])),
  /** trecho LITERAL curto (≤ 40 palavras) que sustenta a ideia, e de onde saiu */
  quote: z.string().min(1).max(400),
  quoteFrom: z.enum(['resumo', 'texto-completo', 'pagina', 'feed']),
  /** paráfrase em pt-BR, palavras nossas (o que o item diz, sem extrapolar) */
  summary: z.string().min(1),
  verify: z.object({
    checkedAt: IsoDateTime,
    linkOk: z.boolean(),
    doiOk: nullish(z.boolean()),              // null quando não há DOI
    quoteFound: z.boolean(),                  // o trecho existe no texto baixado (normalizado)
  }).refine((v) => v.linkOk && v.quoteFound && v.doiOk !== false, 'referência só existe se o link abrir, o DOI resolver e o trecho for achado'),
  round: nullish(z.string()),                 // pasta da rodada que achou
  ideas: z.array(z.string().regex(/^I-\d{4}$/)).default([]),
  starred: z.boolean().default(false),        // ★ do Oliver (vale guardar mesmo sem ideia)
  created: IsoDate,
});
export type SourceRef = z.infer<typeof SourceRef>;

/** curadoria/rodadas/<id>/pedido.json — o que o Oliver pediu no diálogo (a IA consome) */
export const ResearchRequest = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+$/),
  topic: nullish(z.string()),                 // tema livre; ou pilar/série abaixo (pelo menos um dos três)
  pillar: nullish(z.number().int().positive()),
  series: nullish(z.number().int().positive()),
  sources: z.array(Slug).min(1),              // padrão do diálogo: as ativas do pilar/série
  period: z.object({ from: IsoDate, to: IsoDate }),
  maxIdeas: z.number().int().min(1).max(20).default(8),
  depth: z.enum(['rapida', 'normal']).default('normal'), // rápida = só fontes com API/RSS, sem subagente Sonnet
  languages: z.array(z.enum(['pt', 'en', 'es'])).default(['pt', 'en']),
  instructions: z.string().default(''),
  estimate: z.object({ minutes: z.number(), usdLow: z.number(), usdHigh: z.number() }),
  requestedAt: IsoDateTime,
  status: z.enum(['pendente', 'rodando', 'feito', 'erro']).default('pendente'),
}).refine((r) => r.topic || r.pillar || r.series, 'informe tema, pilar ou série');
export type ResearchRequest = z.infer<typeof ResearchRequest>;

/** curadoria/rodadas/<id>/resultado.json — o que voltou (o app mostra na aba Pesquisas) */
export const ResearchResult = z.object({
  finishedAt: IsoDateTime,
  perSource: z.array(z.object({
    sourceId: Slug,
    status: z.enum(['ok', 'vazio', 'erro', 'bloqueado']),
    fetched: z.number().int(),                // itens que o script trouxe
    kept: z.number().int(),                   // passaram na triagem
    verified: z.number().int(),               // passaram na verificação
    error: nullish(z.string()),
  })),
  ideas: z.array(z.string().regex(/^I-\d{4}$/)),
  refs: z.array(z.string().regex(/^R-\d{4}$/)),
  dropped: z.array(z.object({ title: z.string(), url: Url, reason: z.string() })).default([]), // o que caiu na verificação (transparência)
  cost: nullish(z.object({ usd: z.number(), byModel: z.record(z.string(), z.number()) })), // tools/usage.mjs
  notes: z.string().default(''),
});
export type ResearchResult = z.infer<typeof ResearchResult>;
