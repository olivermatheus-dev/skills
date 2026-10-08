import { z } from 'zod';
import { IsoDateTime, Slug } from './common';
import { ContentItem } from './competitor';
import { Ad } from './ads';
import { AD_CAMPOS, AD_OBJETIVOS, AD_TIPOS } from './ads-marks';
import { FormatBlock } from './format';
import type { Vocabulario } from './vocabulario';

/**
 * companies/<slug>/competitors/<id>/fichas/<plataforma>__<itemId>.json — ficha de análise de UM item (conteúdo ou anúncio), tarefa 040.
 * Guarda a cópia congelada do item, as medidas daquele momento, os insumos baratos (transcrição, quadros), a análise da IA
 * (com versão e modelo) e as edições do Oliver em `override`, que nenhuma reanálise apaga.
 * Campos categóricos são `string` aqui e conferidos contra o vocabulário por `issuesVocabulario` (o vocabulário é um arquivo e cresce).
 */

export const FICHA_PLATAFORMAS = ['instagram', 'tiktok', 'youtube', 'meta-ads'] as const;
export const FICHA_FORMATOS_MIDIA = ['reel', 'short', 'video', 'carrossel', 'imagem', 'post'] as const;
export const FICHA_FALTOU = ['sem-transcricao', 'sem-quadros', 'legenda-vazia', 'audio-sem-fala', 'midia-indisponivel'] as const;
export const FICHA_CONFIANCA = ['alta', 'media', 'baixa', 'nula'] as const;

const Txt = z.string();
const Num = z.number();
const Voc = z.string().min(1); // id de vocabulário; conferido em issuesVocabulario
const Lvl = z.enum(FICHA_CONFIANCA);

/** medidas do item NO MOMENTO da análise (congeladas); o app mostra também as atuais */
export const FichaMedidas = z.object({
  views: Num.nullish(), likes: Num.nullish(), comments: Num.nullish(), shares: Num.nullish(), saves: Num.nullish(),
  seguidores: Num.nullish(),
  xPerfil: Num.nullish(), xMercado: Num.nullish(), porSeguidor: Num.nullish(), porSeguidorMercado: Num.nullish(), engajamento: Num.nullish(),
  escopoMercado: z.enum(['formato', 'rede']).nullish(), amostraMercado: Num.nullish(), base: z.enum(['views', 'likes']).nullish(),
  /** anúncio: sem views, o sinal é o histórico da 037 */
  historico: z.object({ diasNoAr: Num.nullish(), variations: Num.nullish(), irmaos: Num.nullish(), saiuDoAr: z.boolean().nullish(), reapareceu: z.boolean().nullish() }).nullish(),
});
export type FichaMedidas = z.infer<typeof FichaMedidas>;

export const TermoNovo = z.object({
  /** grupo do vocabulário (tipoConteudo, gatilho…) ou `formato` · `tema` · `angulo` · `publico` */
  grupo: z.string().min(1),
  valor: Slug,
  definicao: z.string().min(1),
  exemplo: z.string().optional(),
});
export type TermoNovo = z.infer<typeof TermoNovo>;

/** os campos da análise (§1 do desenho). Quase tudo é opcional: sem insumo, o campo fica vazio e `faltou` diz por quê. */
export const FichaCampos = z.object({
  // comum
  plataforma: z.enum(FICHA_PLATAFORMAS),
  formatoMidia: z.enum(FICHA_FORMATOS_MIDIA),
  duracaoS: Num.nullish(),
  publicadoEm: Txt.nullish(),
  tema: z.object({ texto: Txt.min(1), tag: Voc.nullish() }).nullish(),
  mensagem: Txt.nullish(),
  tipoConteudo: z.object({ principal: Voc, secundarios: z.array(Voc).max(2).default([]) }).nullish(),
  formato: Voc.nullish(),
  estiloProducao: Voc.nullish(),
  headline: z.object({ texto: Txt, fonte: z.enum(['tela', 'legenda', 'titulo', 'arte']) }).nullish(),
  gancho: z.object({ texto: Txt.nullish(), tipo: Voc.nullish(), canal: Voc.nullish() }).nullish(),
  retencao5s: z.array(z.object({ t: Txt.min(1), elemento: Voc, gatilho: Voc.nullish() })).nullish(),
  gatilhos: z.array(z.object({ id: Voc, onde: Txt.nullish(), trecho: Txt.min(1, 'o gatilho precisa do trecho literal que o prova') })).nullish(),
  estrutura: z.object({ macro: Voc.nullish(), blocos: z.array(FormatBlock).default([]) }).nullish(),
  cta: z.object({ tipo: Voc.nullish(), texto: Txt.nullish(), momento: Txt.nullish() }).nullish(),
  produto: z.object({ presenca: Voc.nullish(), primeiraMencaoS: Num.nullish(), funcionalidades: z.array(Txt).default([]) }).nullish(),
  oferta: z.object({ tem: z.boolean().nullish(), tipos: z.array(Txt).nullish(), precoBRL: Num.nullish(), diasTeste: Num.nullish(), cupom: Txt.nullish(), trecho: Txt.nullish() }).nullish(),
  publico: z.object({ quem: z.array(Voc).default([]), consciencia: Voc.nullish() }).nullish(),
  tom: z.array(Voc).max(2).nullish(),
  som: Voc.nullish(),
  legendaTela: z.boolean().nullish(),
  ritmo: z.object({ cortesPorMin: Num.nullish() }).nullish(),
  hashtags: z.array(Txt).nullish(),
  porQue: Txt.nullish(),
  adaptar: z.array(z.object({ ideia: Txt.min(1), formato: Voc.nullish() })).max(3).nullish(),
  riscos: z.array(z.object({ tipo: Voc, trecho: Txt.nullish() })).nullish(),
  replicavel: z.number().int().min(0).max(3).nullish(),
  confianca: z.object({ texto: Lvl.nullish(), visual: Lvl.nullish(), retencao: Lvl.nullish() }).nullish(),
  faltou: z.array(z.enum(FICHA_FALTOU)).nullish(),
  // só conteúdo orgânico
  autoria: Voc.nullish(),
  serie: Txt.nullish(),
  // só anúncio
  funil: Voc.nullish(), objetivo: Txt.nullish(), tipoAnuncio: Txt.nullish(),
  angulo: z.array(Voc).nullish(),
  destino: z.object({ kind: Txt.nullish(), dominio: Txt.nullish(), caminho: Txt.nullish() }).nullish(),
  provaTipo: Voc.nullish(),
  coerenciaLP: Txt.nullish(),
  /** anúncio: onde a IA discorda da regra da 037 (funil/tipo/objetivo), com o motivo; `ia` é o valor que ficou em funil / tipoAnuncio / objetivo */
  correcaoRegra: z.array(z.object({ campo: z.enum(AD_CAMPOS), regra: Txt.min(1), ia: Txt.min(1), motivo: Txt.min(1, 'diga por que a regra errou') })).nullish(),
});
export type FichaCampos = z.infer<typeof FichaCampos>;

export const FichaAnalise = z.object({
  versaoPrompt: z.number().int().nonnegative(),
  versaoVocab: z.number().int().positive(),
  /** hash dos insumos que esta análise leu: mesmo hash = não reanalisa */
  insumosHash: Txt.optional(),
  modelo: Txt.min(1),
  esforco: z.enum(['low', 'medium', 'high']).optional(),
  geradoEm: IsoDateTime,
  custo: z.object({ entrada: Num, saida: Num, cacheLeitura: Num.optional(), usd: Num.optional(), via: z.enum(['api', 'api-batch', 'claude-code']) }).optional(),
  campos: FichaCampos,
  termosNovos: z.array(TermoNovo).default([]),
});
export type FichaAnalise = z.infer<typeof FichaAnalise>;

export const FichaQuadro = z.object({
  tMs: z.number().int().nonnegative(),
  /** relativo a data/intel/<empresa>/<concorrente>/<plataforma>__<itemId>/ (fora do git) */
  arquivo: Txt.min(1),
  descricao: Txt.optional(),
  ocr: Txt.optional(),
  /** assinatura visual (média 16×16 em cinza, hex): o preparo só descarta descrição/OCR se o quadro mudou */
  assinatura: Txt.optional(),
});

export const FichaInsumos = z.object({
  /** sha1(itemId + legenda + duração + texto da transcrição): muda o insumo, muda o hash */
  hash: Txt.min(8),
  /** sha1(itemId + legenda + duração + url): decide, antes de baixar, se o preparo já foi feito */
  hashEntrada: Txt.min(8).optional(),
  preparadoEm: IsoDateTime,
  preparadoPor: z.enum(['script', 'claude-haiku-5-5']),
  legendaLimpa: Txt.optional(),
  transcricao: z.object({
    fonte: z.enum(['yt-auto-subs', 'whisper-small', 'whisper-medium']),
    idioma: Txt,
    texto: Txt,
    segmentos: z.array(z.object({ ini: Num, fim: Num, texto: Txt })).default([]),
  }).optional(),
  quadros: z.array(FichaQuadro).default([]),
  /** tempos (s) dos cortes de cena detectados: dá o ritmo */
  cenas: z.array(Num).optional(),
  faltou: z.array(z.enum(FICHA_FALTOU)).default([]),
  /** o vídeo é apagado depois de extrair áudio e quadros (decisão do Oliver); fica só o que mediu */
  midia: z.object({ duracaoS: Num.optional(), videoApagado: z.boolean(), bytesVideo: Num.optional() }).optional(),
  /** quanto custou preparar (segundos de relógio), por etapa */
  tempos: z.object({ total: Num, baixar: Num.optional(), transcrever: Num.optional(), quadros: Num.optional() }).optional(),
});
export type FichaInsumos = z.infer<typeof FichaInsumos>;

export const FICHA_KEY_RE = /^(instagram|tiktok|youtube|meta-ads):.+$/;

/** campos comuns a conteúdo e anúncio; só `kind` e `item` mudam (por isso a união é discriminada: ContentItem tem defaults e engoliria um Ad) */
const FichaComum = {
  schema: z.literal(1).default(1),
  /** `<plataforma>:<itemId>`, igual ao marks.json */
  key: z.string().regex(FICHA_KEY_RE, 'use <plataforma>:<itemId> (instagram, tiktok, youtube ou meta-ads)'),
  competitorId: Slug,
  url: Txt.min(1),
  origem: z.object({ arquivo: Txt.min(1), collectedAt: IsoDateTime }),
  medidas: FichaMedidas.default({}),
  insumos: FichaInsumos.optional(),
  analise: FichaAnalise.optional(),
  /** análises antigas (até 3): reanálise não perde o que custou */
  anteriores: z.array(FichaAnalise).max(3).default([]),
  /**
   * edições do Oliver: SEMPRE ganham da análise.
   * `editados` diz QUAIS caminhos o Oliver editou e quando (`"gancho.tipo": "2026-10-08T…Z"`). Com ele, só esses caminhos valem;
   * o resto de um objeto copiado (ex.: `gancho.texto` ao editar só `gancho.tipo`) é ignorado e segue a IA. Sem `editados`
   * (override escrito à mão), cada chave de topo vale inteira. O "a IA agora diz" compara a data da edição com `analise.geradoEm`.
   * Leia o valor efetivo com `camposEfetivos` de core/fichas.ts, nunca com `{ ...analise.campos, ...override }`.
   */
  override: FichaCampos.partial().extend({ editadoEm: IsoDateTime.optional(), editados: z.record(z.string(), IsoDateTime).optional() }).default({}),
  /** ids dos relatórios (schema/relatorio.ts) que usaram esta ficha */
  relatorios: z.array(Txt).default([]),
};

export const Ficha = z.discriminatedUnion('kind', [
  /** `item` = cópia congelada do item (o snapshot de origem fica em `origem`) */
  z.object({ kind: z.literal('conteudo'), item: ContentItem, ...FichaComum }),
  z.object({ kind: z.literal('anuncio'), item: Ad, ...FichaComum }),
]);
export type Ficha = z.infer<typeof Ficha>;

/** nome do arquivo da ficha (`:` não vale no Windows) */
export const fichaFileName = (key: string) => `${key.replace(':', '__').replace(/[\\/:*?"<>|]/g, '_')}.json`;

// ───────────────────────── conferência contra o vocabulário ─────────────────────────

/** o que a conferência precisa saber além do vocabulário global */
export interface VocabCtx {
  vocab: Vocabulario;
  /** ids de library/formatos/ */
  formatos: string[];
  /** grupos do nicho de companies/<slug>/tags.yml: tema · angulo · publico → ids */
  tags: { tema: string[]; angulo: string[]; publico: string[] };
  /** termos que a própria análise propõe: valem como "proposto", não como erro */
  termosNovos: { grupo: string; valor: string }[];
}

const lev = (a: string, b: string) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

/**
 * Mensagens de erro (vazio = ok) para todo valor categórico que não está no vocabulário nem em `termosNovos`.
 * `base` é o prefixo do caminho na mensagem (ex.: "analise.campos" ou "override").
 */
export function issuesVocabulario(campos: Partial<FichaCampos>, ctx: VocabCtx, base = 'campos'): string[] {
  const out: string[] = [];
  const proposto = (g: string, v: string) => ctx.termosNovos.some((t) => t.grupo === g && t.valor === v);
  const lista = (g: string): string[] | undefined => {
    if (g === 'formato') return ctx.formatos;
    if (g === 'tema' || g === 'angulo' || g === 'publico') return ctx.tags[g];
    return (ctx.vocab.grupos as Record<string, { id: string }[]>)[g]?.map((t) => t.id);
  };
  const onde = (g: string) => (g === 'formato' ? 'library/formatos/' : g === 'tema' || g === 'angulo' || g === 'publico' ? `tags.yml (grupo ${g})` : `vocabulário (grupo ${g})`);
  const chk = (path: string, g: string, v: string | null | undefined) => {
    if (v == null || v === '') return;
    const ok = lista(g);
    if (!ok) { out.push(`${base}.${path}: grupo "${g}" não existe no vocabulário`); return; }
    if (ok.includes(v) || proposto(g, v)) return;
    const perto = ok.map((o) => [o, o.startsWith(v) || v.startsWith(o) ? 0 : lev(o, v)] as const).sort((a, b) => a[1] - b[1])[0];
    const dica = perto && perto[1] <= Math.max(3, Math.floor(v.length / 3)) ? ` Você quis dizer "${perto[0]}"?` : '';
    const rec = ctx.vocab.recusados.find((r) => r.grupo === g && r.valor === v);
    out.push(`${base}.${path} = "${v}" não está em ${onde(g)}.${dica} Aceitos: ${ok.join(', ') || '(nenhum)'}.${rec ? ` O Oliver já recusou este termo${rec.motivo ? ` (${rec.motivo})` : ''}.` : ` Se for um termo novo, proponha em analise.termosNovos: { grupo: "${g}", valor: "${v}", definicao, exemplo }.`}`);
  };
  const c = campos;
  chk('tipoConteudo.principal', 'tipoConteudo', c.tipoConteudo?.principal);
  c.tipoConteudo?.secundarios?.forEach((v, i) => chk(`tipoConteudo.secundarios[${i}]`, 'tipoConteudo', v));
  chk('formato', 'formato', c.formato);
  chk('estiloProducao', 'estiloProducao', c.estiloProducao);
  chk('tema.tag', 'tema', c.tema?.tag);
  chk('gancho.tipo', 'tipoGancho', c.gancho?.tipo);
  chk('gancho.canal', 'canalGancho', c.gancho?.canal);
  c.retencao5s?.forEach((r, i) => { chk(`retencao5s[${i}].elemento`, 'elemento5s', r.elemento); chk(`retencao5s[${i}].gatilho`, 'gatilho', r.gatilho); });
  c.gatilhos?.forEach((g, i) => chk(`gatilhos[${i}].id`, 'gatilho', g.id));
  chk('estrutura.macro', 'estruturaMacro', c.estrutura?.macro);
  chk('cta.tipo', 'ctaTipo', c.cta?.tipo);
  chk('produto.presenca', 'produtoPresenca', c.produto?.presenca);
  c.publico?.quem?.forEach((v, i) => chk(`publico.quem[${i}]`, 'publico', v));
  chk('publico.consciencia', 'consciencia', c.publico?.consciencia);
  c.tom?.forEach((v, i) => chk(`tom[${i}]`, 'tom', v));
  chk('som', 'som', c.som);
  c.adaptar?.forEach((a, i) => chk(`adaptar[${i}].formato`, 'formato', a.formato));
  c.riscos?.forEach((r, i) => chk(`riscos[${i}].tipo`, 'risco', r.tipo));
  chk('autoria', 'autoria', c.autoria);
  chk('provaTipo', 'provaTipo', c.provaTipo);
  chk('funil', 'funil', c.funil);
  // anúncio: tipo e objetivo seguem a lista da 037 (schema/ads-marks.ts), não o vocabulário
  if (c.tipoAnuncio != null && !(AD_TIPOS as readonly string[]).includes(c.tipoAnuncio)) out.push(`${base}.tipoAnuncio = "${c.tipoAnuncio}" não é um tipo de anúncio. Aceitos: ${AD_TIPOS.join(', ')}.`);
  if (c.objetivo != null && !(AD_OBJETIVOS as readonly string[]).includes(c.objetivo)) out.push(`${base}.objetivo = "${c.objetivo}" não é um objetivo de anúncio. Aceitos: ${AD_OBJETIVOS.join(', ')}.`);
  c.correcaoRegra?.forEach((x, i) => {
    const atual = { funil: c.funil, tipo: c.tipoAnuncio, objetivo: c.objetivo }[x.campo];
    if (atual !== x.ia) out.push(`${base}.correcaoRegra[${i}]: ia = "${x.ia}" mas ${x.campo === 'tipo' ? 'tipoAnuncio' : x.campo} = "${atual ?? 'vazio'}"; devem ser iguais`);
    if (x.regra === x.ia) out.push(`${base}.correcaoRegra[${i}]: a IA concorda com a regra (${x.ia}); tire a correção`);
  });
  c.angulo?.forEach((v, i) => chk(`angulo[${i}]`, 'angulo', v));
  return out;
}

/** Conferência completa de uma ficha: campos da análise e override contra o vocabulário. */
export function issuesFicha(f: Ficha, ctx: Omit<VocabCtx, 'termosNovos'>): string[] {
  const out: string[] = [];
  const all = [f.analise, ...f.anteriores].filter(Boolean) as FichaAnalise[];
  const novos = all.flatMap((a) => a.termosNovos.map((t) => ({ grupo: t.grupo, valor: t.valor })));
  if (f.analise) out.push(...issuesVocabulario(f.analise.campos, { ...ctx, termosNovos: novos }, 'analise.campos'));
  if (f.analise && f.analise.versaoVocab > ctx.vocab.versao) out.push(`analise.versaoVocab ${f.analise.versaoVocab} é maior que a versão do vocabulário (${ctx.vocab.versao})`);
  out.push(...issuesVocabulario(f.override, { ...ctx, termosNovos: novos }, 'override'));
  const [plat] = f.key.split(':');
  if ((plat === 'meta-ads') !== (f.kind === 'anuncio')) out.push(`kind "${f.kind}" não combina com a chave (${f.key}): anúncio é meta-ads:<id>, conteúdo é instagram, tiktok ou youtube`);
  if (f.analise && f.analise.campos.plataforma !== plat) out.push(`analise.campos.plataforma = "${f.analise.campos.plataforma}" diferente da chave (${plat})`);
  return out;
}
