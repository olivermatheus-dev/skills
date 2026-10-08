// Fichas de ANÚNCIO (tarefa 040, fase G): o anúncio da Biblioteca da Meta no lugar do conteúdo orgânico. Sem LLM e sem rede
// (a única rede é o download do vídeo do anúncio, quando a coleta trouxe `videoUrl`). Reaproveita o resto do fluxo das fichas.
// Chave da ficha = `meta-ads:<id>` (a marca do Oliver da 037 é `meta:<id>`: conversores em schema/ads-marks.ts).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ad, AdsSnapshot } from '../../schema/ads';
import { AD_CAMPOS, AD_CAMPO_FICHA, AD_FUNIS, AD_OBJETIVOS, AD_TIPOS, adIdDeFichaKey, adKey, markKeyDeFichaKey, resolverCampo, type AdCampo, type OrigemCampo } from '../../schema/ads-marks';
import type { Ficha, FichaCampos, FichaMedidas } from '../../schema/ficha';
import { adsHistory, getAdsMarks } from '../../core/store';
import { classificarAnuncio, contarIrmaos, type Classificacao } from '../intel/ads-classify';
import { compDir, limparLegenda, sha1 } from './lib';

const readJson = (f: string) => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const limpo = (t?: string | null) => (t ?? '').replace(/\{\{[^}]+\}\}/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();

export const idDoAnuncio = (key: string): string => adIdDeFichaKey(key) ?? (() => { throw new Error(`chave "${key}" não é de anúncio (use meta-ads:<id>)`); })();

// ───────────────────────── coletas e o anúncio ─────────────────────────
interface Coleta { arquivo: string; snap: AdsSnapshot }

/** coletas de anúncios do concorrente em ordem (a ilegível fica de fora, como no app) */
export function coletasDeAnuncios(slug: string, comp: string): Coleta[] {
  const dir = join(compDir(slug, comp), 'ads');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /^\d.*\.json$/.test(f)).flatMap((f) => {
    try { return [{ arquivo: `ads/${f}`, snap: AdsSnapshot.parse(readJson(join(dir, f))) }]; } catch { return []; }
  }).sort((a, b) => a.snap.collectedAt.localeCompare(b.snap.collectedAt) || a.arquivo.localeCompare(b.arquivo));
}

export interface AnuncioAchado { ad: Ad; arquivo: string; collectedAt: string; copia: boolean }

/** a coleta mais recente que traz o anúncio; sem ela, a cópia que o Oliver guardou ao salvar (frozen) */
export function acharAnuncio(slug: string, comp: string, key: string): AnuncioAchado {
  const id = idDoAnuncio(key);
  const hit = coletasDeAnuncios(slug, comp).filter((c) => c.snap.ads.some((a) => a.id === id)).at(-1);
  if (hit) return { ad: hit.snap.ads.find((a) => a.id === id)!, arquivo: hit.arquivo, collectedAt: hit.snap.collectedAt, copia: false };
  const m = getAdsMarks(slug, comp).ads[markKeyDeFichaKey(key)!];
  if (m?.frozen) return { ad: m.frozen, arquivo: 'ads/marks.json', collectedAt: m.savedAt ?? m.updatedAt, copia: true };
  throw new Error(`anúncio ${key} não está em nenhuma coleta de ${comp} (puxe os anúncios antes: app → Anúncios → Puxar anúncios)`);
}

// ───────────────────────── texto, hash e miniatura ─────────────────────────
/** texto + título + descrição + CTA do anúncio, na ordem em que a pessoa lê */
export function legendaDoAnuncio(ad: Ad): string {
  const partes = [
    limpo(ad.title) && `Título: ${limpo(ad.title)}`, limpo(ad.text), limpo(ad.description) && `Descrição: ${limpo(ad.description)}`, ad.cta && `Botão: ${ad.cta}`,
  ].filter(Boolean);
  return partes.join('\n');
}

/** decide, antes de baixar, se o preparo já foi feito: id + os campos do anúncio que a análise lê */
export const hashEntradaAnuncio = (ad: Ad) => sha1(['meta-ads', ad.id, ad.text ?? '', ad.title ?? '', ad.description ?? '', ad.cta ?? '', ad.linkUrl ?? '', ad.media.type, ad.url].join('|'));

/** miniatura relativa à pasta do concorrente: a de media/ads/ ou, se sumiu, a cópia guardada ao salvar */
function miniaturaDe(slug: string, comp: string, ad: Ad): string | null {
  const dir = compDir(slug, comp);
  if (ad.media.thumbnailLocal && existsSync(join(dir, ad.media.thumbnailLocal))) return ad.media.thumbnailLocal;
  const salvo = getAdsMarks(slug, comp).ads[adKey(ad.id)]?.frozenMedia;
  return salvo && existsSync(join(dir, 'ads', 'salvos', salvo)) ? `ads/salvos/${salvo}` : null;
}

/** o que o preparo (preparar.ts) lê de um item, na forma que ele já conhece */
export interface ItemPreparo {
  id: string; url: string; type: 'video' | 'carrossel' | 'imagem'; durationS: null; caption: string; title: null; thumbnailLocal: string | null; videoUrl: string | null;
}
export function itemParaPreparo(slug: string, comp: string, key: string) {
  const { ad, arquivo, collectedAt } = acharAnuncio(slug, comp, key);
  // vídeo só se a coleta trouxe o endereço; sem ele (ou se o download falhar) a miniatura vira o quadro 0
  const videoUrl = ad.media.type === 'video' ? ad.media.videoUrl ?? null : null;
  const item: ItemPreparo = {
    id: ad.id, url: ad.url, type: videoUrl ? 'video' : ad.media.type === 'carrossel' ? 'carrossel' : 'imagem', durationS: null,
    caption: legendaDoAnuncio(ad), title: null, thumbnailLocal: miniaturaDe(slug, comp, ad), videoUrl,
  };
  return { snap: { file: arquivo, data: { collectedAt, profile: { followers: null as number | null } } }, item, plataforma: 'meta-ads', hashEntrada: hashEntradaAnuncio(ad), semVideoUrl: ad.media.type === 'video' && !videoUrl };
}

/** baixa um arquivo (o vídeo do anúncio) direto; até 150 MB e 2 minutos */
export async function baixarArquivo(url: string, destino: string): Promise<number> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 120_000);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const len = Number(r.headers.get('content-length') ?? 0);
    if (len > 150 * 1024 * 1024) throw new Error(`arquivo grande demais (${Math.round(len / 1048576)} MB)`);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(destino, buf);
    return buf.length;
  } finally { clearTimeout(t); }
}

// ───────────────────────── medidas: sem views, o sinal é o histórico da 037 ─────────────────────────
export function medidasAnuncio(slug: string, comp: string, key: string): FichaMedidas {
  const id = idDoAnuncio(key);
  const h = adsHistory(slug, comp).ads.find((a) => a.id === id);
  let variations: number | null = null;
  try { variations = acharAnuncio(slug, comp, key).ad.variations ?? null; } catch { /* sem anúncio: o histórico basta */ }
  if (!h && variations == null) return {};
  return { historico: { diasNoAr: h?.diasNoAr ?? null, variations, irmaos: h?.irmaos ?? null, saiuDoAr: h?.saiuDoAr ?? null, reapareceu: h?.reapareceu ?? null } };
}

/** ficha nova a partir da coleta mais recente que traz o anúncio */
export function novaFichaAnuncio(slug: string, comp: string, key: string): Ficha {
  const { ad, arquivo, collectedAt } = acharAnuncio(slug, comp, key);
  return {
    schema: 1, kind: 'anuncio', key, competitorId: comp, url: ad.url, item: ad, origem: { arquivo, collectedAt },
    medidas: medidasAnuncio(slug, comp, key), anteriores: [], override: {}, relatorios: [],
  };
}

// ───────────────────────── regras da 037 (com o motivo) ─────────────────────────
export function regrasDoAnuncio(slug: string, comp: string, ad: Ad): Classificacao {
  const ultima = coletasDeAnuncios(slug, comp).at(-1)?.snap.ads.filter((a) => a.active) ?? [];
  return classificarAnuncio(ad, { irmaos: contarIrmaos(ultima).get(ad.id) });
}

/** linhas de `motivos` de um campo ("funil→topo (+2): leva ao perfil" → "topo (+2): leva ao perfil") */
const motivosDe = (c: Classificacao, campo: AdCampo) => c.motivos.filter((m) => m.startsWith(`${campo}→`)).map((m) => m.slice(campo.length + 1));

/** resumo da análise da landing do concorrente (analysis/landing.json), para a IA julgar a `coerenciaLP` */
export function landingResumida(slug: string, comp: string) {
  const f = join(compDir(slug, comp), 'analysis', 'landing.json');
  if (!existsSync(f)) return null;
  try {
    const d = (readJson(f).data ?? {}) as { url?: string; hero?: Record<string, string>; ctas?: string[]; socialProof?: string[]; sections?: { type: string; title: string; summary: string }[]; interesting?: string[] };
    return {
      url: d.url ?? null, headline: d.hero?.headline ?? null, subheadline: d.hero?.subheadline ?? null, cta: d.hero?.cta ?? null, ctas: d.ctas ?? [], provaSocial: d.socialProof ?? [],
      oferta: (d.sections ?? []).filter((s) => s.type === 'precos').map((s) => `${s.title}: ${s.summary}`), secoes: (d.sections ?? []).map((s) => s.type), destaques: (d.interesting ?? []).slice(0, 4),
    };
  } catch { return null; }
}

/** o que o Oliver já corrigiu no marks.json da 037 (override + nota), ou null */
export function override037(slug: string, comp: string, key: string) {
  const m = getAdsMarks(slug, comp).ads[markKeyDeFichaKey(key)!];
  if (!m?.override && !m?.note) return null;
  return { ...(m.override ?? {}), ...(m.note ? { nota: m.note } : {}) };
}

/** o pacote de anúncio que o Opus recebe (junto ao que o `pacote` já imprime para qualquer item) */
export function pacoteAnuncio(slug: string, comp: string, f: Ficha) {
  const ad = f.item as Ad;
  const c = regrasDoAnuncio(slug, comp, ad);
  const h = adsHistory(slug, comp).ads.find((a) => a.id === ad.id);
  const campo = (k: AdCampo) => ({ valor: c[k], confianca: c.confiancaCampos[k], motivos: motivosDe(c, k) });
  return {
    formatoMidia: ad.media.type === 'desconhecido' ? 'imagem' : ad.media.type,
    publicadoEm: ad.startedAt ?? null,
    titulo: limpo(ad.title) || null,
    anuncio: {
      id: ad.id, anunciante: ad.pageName ?? null, ativo: ad.active, inicio: ad.startedAt ?? null, fim: ad.endedAt ?? null, plataformas: ad.platforms, variacoes: ad.variations ?? null,
      texto: limpo(ad.text) || null, titulo: limpo(ad.title) || null, descricao: limpo(ad.description) || null, cta: ad.cta ?? null, formato: ad.media.type,
      catalogoDinamico: c.sinais.catalogoDinamico,
    },
    destino: { linkUrl: ad.linkUrl ?? null, tipo: c.destino.kind, dominio: c.destino.dominio, caminho: c.destino.caminho, utm: c.sinais.utm },
    regras: {
      aviso: 'Palpite por regras (sem IA). Confirme ou corrija funil, tipoAnuncio e objetivo; onde discordar, preencha correcaoRegra com o motivo.',
      funil: campo('funil'), tipo: campo('tipo'), objetivo: campo('objetivo'),
      oferta: c.oferta, funcionalidadesCitadas: c.sinais.funcionalidades, ganchoDaRegra: c.sinais.gancho, confiancaGeral: c.confianca,
    },
    override037: override037(slug, comp, f.key),
    historico: h ? {
      diasNoAr: h.diasNoAr, coletas: h.coletas, primeiraVez: h.primeiraVez, ultimaVez: h.ultimaVez, irmaos: h.irmaos, variacoes: ad.variations ?? null,
      saiuDoAr: h.saiuDoAr, saiuEm: h.saiuEm, duracaoFinal: h.duracaoFinal, reapareceu: h.reapareceu, reapareceuDe: h.reapareceuDe,
      leitura: 'Sem gasto nem alcance na Biblioteca: tempo no ar, versões e persistência são o sinal (indireto) de que o anúncio dá resultado.',
    } : null,
    landing: landingResumida(slug, comp),
  };
}

// ───────────────────────── salvar: a IA confirma ou corrige as regras ─────────────────────────
const LISTA = { funil: AD_FUNIS, tipo: AD_TIPOS, objetivo: AD_OBJETIVOS } as const;
/**
 * Confere a análise de um anúncio contra as regras da 037: funil, tipoAnuncio e objetivo são obrigatórios e, onde a IA discorda da regra,
 * `correcaoRegra` precisa trazer o motivo. Corrige `regra` para o valor que a regra de fato deu (a IA copia errado). Devolve os erros.
 */
export function conferirAnalise(slug: string, comp: string, f: Ficha, campos: FichaCampos): string[] {
  const c = regrasDoAnuncio(slug, comp, f.item as Ad);
  const erros: string[] = [];
  const ia = { funil: campos.funil, tipo: campos.tipoAnuncio, objetivo: campos.objetivo };
  const corr = campos.correcaoRegra ?? [];
  for (const k of AD_CAMPOS) {
    const nome = AD_CAMPO_FICHA[k];
    if (!ia[k]) { erros.push(`${nome} é obrigatório em anúncio: confirme ou corrija a regra (${c[k]}).`); continue; }
    if (!(LISTA[k] as readonly string[]).includes(ia[k]!)) { erros.push(`${nome} = "${ia[k]}" não está na lista. Aceitos: ${LISTA[k].join(', ')}.`); continue; }
    const item = corr.find((x) => x.campo === k);
    if (ia[k] !== c[k] && !item) erros.push(`${nome} = "${ia[k]}" mas a regra deu "${c[k]}": explique em correcaoRegra [{ campo: "${k}", regra: "${c[k]}", ia: "${ia[k]}", motivo }].`);
    if (item) item.regra = c[k];
  }
  campos.correcaoRegra = corr.filter((x) => ia[x.campo] !== c[x.campo]);
  if (!campos.correcaoRegra.length) campos.correcaoRegra = null;
  return erros;
}

// ───────────────────────── valor resolvido (para relatórios) ─────────────────────────
/** funil/tipo/objetivo com a mesma ordem do app: override do Oliver > IA (ficha) > regra */
export function resolvidosDoAnuncio(slug: string, comp: string, f: Ficha, campos: Partial<FichaCampos>): Record<AdCampo, { valor: string; origem: OrigemCampo }> {
  const c = regrasDoAnuncio(slug, comp, f.item as Ad);
  const mark = getAdsMarks(slug, comp).ads[markKeyDeFichaKey(f.key)!];
  const out = {} as Record<AdCampo, { valor: string; origem: OrigemCampo }>;
  for (const k of AD_CAMPOS) out[k] = resolverCampo(k, c[k] as string, mark, campos[AD_CAMPO_FICHA[k]] as string | undefined);
  return out;
}
