// npm run fichas -- relatorio … (tarefa 040, fase F). O script calcula os agregados (contagens e medianas por tipo, gatilho,
// gancho, estrutura, tema, formato…) e grava o relatório; a leitura do Opus entra depois com --leitura e só pode citar números
// que estão nos agregados. Valores lidos com camposEfetivos: as edições do Oliver mandam.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import type { Ficha, FichaMedidas } from '../../schema/ficha';
import { RelatorioLeitura, type Relatorio, type RelatorioTermo } from '../../schema/relatorio';
import { camposEfetivos } from '../../core/fichas';
import { adsHistory } from '../../core/store';
import type { Ad } from '../../schema/ads';
import { ROOT, fichasDir, nowIso, readFicha, vocabCtx, writeFicha } from './lib';
import { resolvidosDoAnuncio } from './anuncios';
import { marketRows, medidasDe } from './medidas';
import { DIMENSOES, DIMENSOES_ANUNCIO, atualizarDestaque, gravarRelatorio, lerRelatorio, listarRelatorios, numerosForaDosAgregados, type GrupoAg } from './relatorio-lib';

/** regras de amostra (§6): com menos de 10 itens fala-se em observações e não há lift; grupo com n < 3 é fraco */
export const METODO = { janelaRetencaoS: 5, minItensPadrao: 10, minNGrupo: 3, quartilVencedor: 0.75, minConcorrentesMercado: 3 } as const;

const r2 = (x: number | null | undefined, k = 2) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10 ** k) / 10 ** k);
function mediana(xs: (number | null | undefined)[]): number | null {
  const v = xs.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

export interface ItemAg {
  key: string; url: string; titulo: string; publicadoEm: string | null; duracaoS: number | null;
  views: number | null; likes: number | null; comments: number | null; shares: number | null; seguidores: number | null;
  xPerfil: number | null; xMercado: number | null; porSeguidor: number | null; porSeguidorMercado: number | null; engajamento: number | null;
  tipo: string | null; tiposSecundarios: string[]; formato: string | null; tipoGancho: string | null; gancho: string | null; headline: string | null;
  estrutura: string | null; tema: string | null; temaTexto: string | null; gatilhos: string[]; elementos5s: string[]; produto: string | null;
  faltou: string[]; editados: number;
}

function itemDe(slug: string, comp: string, f: Ficha): ItemAg {
  const c = camposEfetivos(f);
  const atual = medidasDe(slug, comp, f.key, f.medidas.seguidores);
  const m: FichaMedidas = Object.keys(atual).length ? atual : f.medidas;
  const it = f.item as { title?: string | null; caption?: string | null; publishedAt?: string | null; durationS?: number | null };
  return {
    key: f.key, url: f.url,
    titulo: (it.title || c.headline?.texto || it.caption || f.key).replace(/\s+/g, ' ').slice(0, 90),
    publicadoEm: it.publishedAt?.slice(0, 10) ?? null, duracaoS: r2(c.duracaoS ?? f.insumos?.midia?.duracaoS ?? it.durationS, 0),
    views: m.views ?? null, likes: m.likes ?? null, comments: m.comments ?? null, shares: m.shares ?? null, seguidores: m.seguidores ?? null,
    // 4 casas aqui; as medianas arredondam só no fim (a conta manual com os valores do app bate)
    xPerfil: r2(m.xPerfil, 4), xMercado: r2(m.xMercado, 4), porSeguidor: r2(m.porSeguidor, 4), porSeguidorMercado: r2(m.porSeguidorMercado, 4), engajamento: r2(m.engajamento, 4),
    tipo: c.tipoConteudo?.principal ?? null, tiposSecundarios: c.tipoConteudo?.secundarios ?? [], formato: c.formato ?? null,
    tipoGancho: c.gancho?.tipo ?? null, gancho: c.gancho?.texto ?? null, headline: c.headline?.texto ?? null,
    estrutura: c.estrutura?.macro ?? null, tema: c.tema?.tag ?? null, temaTexto: c.tema?.texto ?? null,
    gatilhos: [...new Set((c.gatilhos ?? []).map((g) => g.id))], elementos5s: [...new Set((c.retencao5s ?? []).map((e) => e.elemento))],
    produto: c.produto?.presenca ?? null, faltou: f.insumos?.faltou ?? [], editados: Object.keys(f.override?.editados ?? {}).length,
  };
}

/** valores de uma dimensão num item (as de lista contam o item uma vez por valor) */
const VALORES: Record<string, (i: ItemAg) => string[]> = {
  tipo: (i) => (i.tipo ? [i.tipo] : []), formato: (i) => (i.formato ? [i.formato] : []), tipoGancho: (i) => (i.tipoGancho ? [i.tipoGancho] : []),
  estrutura: (i) => (i.estrutura ? [i.estrutura] : []), tema: (i) => (i.tema ? [i.tema] : []), gatilho: (i) => i.gatilhos,
  elemento5s: (i) => i.elementos5s, produto: (i) => (i.produto ? [i.produto] : []),
};
/** dimensão → grupo do vocabulário (para nome e "proposto") */
const GRUPO_DIM: Record<string, string> = { tipo: 'tipoConteudo', formato: 'formato', tipoGancho: 'tipoGancho', estrutura: 'estruturaMacro', tema: 'tema', gatilho: 'gatilho', elemento5s: 'elemento5s', produto: 'produtoPresenca' };

function nomes(slug: string) {
  const ctx = vocabCtx(slug);
  const mapa = new Map<string, string>();
  for (const [g, l] of Object.entries(ctx.vocab.grupos)) for (const t of l) mapa.set(`${g}:${t.id}`, t.nome);
  const tf = join(ROOT, 'companies', slug, 'tags.yml');
  if (existsSync(tf)) for (const t of (YAML.parse(readFileSync(tf, 'utf8'))?.tags ?? []) as { id: string; label: string; grupo?: string }[]) if (t.grupo) mapa.set(`${t.grupo}:${t.id}`, t.label);
  for (const id of ctx.formatos) {
    try { mapa.set(`formato:${id}`, String(JSON.parse(readFileSync(join(ROOT, 'library', 'formatos', id, 'formato.json'), 'utf8')).nome ?? id)); } catch { mapa.set(`formato:${id}`, id); }
  }
  return {
    ctx,
    nome: (g: string, v: string) => mapa.get(`${g}:${v}`) ?? v.replace(/-/g, ' '),
    existe: (g: string, v: string) => (g === 'formato' ? ctx.formatos.includes(v) : g === 'tema' || g === 'angulo' || g === 'publico' ? ctx.tags[g].includes(v) : !!(ctx.vocab.grupos as Record<string, { id: string }[]>)[g]?.some((t) => t.id === v)),
  };
}

export interface Selecao { rede: string; itens?: string[]; top?: number }

/** rede do relatório ↔ prefixo das chaves: os anúncios (rede `anuncios`) têm chave `meta-ads:` */
export const prefixoDe = (rede: string) => (rede === 'anuncios' ? 'meta-ads' : rede);
export const redeDeChave = (key: string) => (key.startsWith('meta-ads:') ? 'anuncios' : key.split(':')[0]);

/** fichas analisadas do concorrente na rede (ou as chaves pedidas), já ordenadas por × perfil */
export function fichasDaRodada(slug: string, comp: string, sel: Selecao): Ficha[] {
  const dir = fichasDir(slug, comp);
  const todas = existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith('.json') && x !== 'pedido.json') : [];
  const fichas = todas.map((f) => readFicha(slug, comp, f.replace(/\.json$/, '').replace('__', ':'))).filter((f): f is Ficha => !!f?.analise);
  let out = fichas.filter((f) => f.key.startsWith(`${prefixoDe(sel.rede)}:`));
  if (sel.itens?.length) {
    const faltam = sel.itens.filter((k) => !fichas.some((f) => f.key === k));
    if (faltam.length) throw new Error(`sem ficha analisada para: ${faltam.join(', ')}`);
    out = fichas.filter((f) => sel.itens!.includes(f.key));
  }
  // anúncio não tem views: ordena pelo tempo no ar
  out.sort((a, b) => (a.kind === 'anuncio' ? (b.medidas.historico?.diasNoAr ?? -1) - (a.medidas.historico?.diasNoAr ?? -1) : (b.medidas.xPerfil ?? -1) - (a.medidas.xPerfil ?? -1)));
  return sel.top ? out.slice(0, sel.top) : out;
}

export function calcularAgregados(slug: string, comp: string, rede: string, fichas: Ficha[]) {
  if (rede === 'anuncios') return calcularAgregadosAnuncios(slug, comp, fichas);
  const itens = fichas.map((f) => itemDe(slug, comp, f)).sort((a, b) => (b.xPerfil ?? -1) - (a.xPerfil ?? -1));
  const { nome, existe, ctx } = nomes(slug);
  const n = itens.length;
  const nivel = n >= METODO.minItensPadrao ? 'padroes' : 'observacoes';
  // quartil de cima por × perfil (só com amostra suficiente)
  const xs = itens.map((i) => i.xPerfil).filter((x): x is number => x != null).sort((a, b) => a - b);
  const corte = nivel === 'padroes' && xs.length ? xs[Math.floor(xs.length * METODO.quartilVencedor)] : null;
  const vencedores = corte == null ? [] : itens.filter((i) => (i.xPerfil ?? -1) >= corte);
  const resto = corte == null ? [] : itens.filter((i) => !vencedores.includes(i));

  const dimensoes: Record<string, GrupoAg[]> = {};
  for (const d of DIMENSOES) {
    const g = GRUPO_DIM[d.id];
    const valores = [...new Set(itens.flatMap(VALORES[d.id]))];
    dimensoes[d.id] = valores.map((v) => {
      const sub = itens.filter((i) => VALORES[d.id](i).includes(v));
      const melhor = [...sub].sort((a, b) => (b.xPerfil ?? -1) - (a.xPerfil ?? -1))[0];
      let lift: number | null = null;
      if (corte != null && sub.length >= METODO.minNGrupo && vencedores.length && resto.length) {
        const pv = vencedores.filter((i) => VALORES[d.id](i).includes(v)).length / vencedores.length;
        const pr = resto.filter((i) => VALORES[d.id](i).includes(v)).length / resto.length;
        lift = pr > 0 ? r2(pv / pr) : null;
      }
      return {
        valor: v, nome: nome(g, v), n: sub.length, fraca: sub.length < METODO.minNGrupo, itens: sub.map((i) => i.key), melhor: melhor?.key ?? null,
        ...(existe(g, v) ? {} : { proposto: true }), lift,
        med: {
          views: r2(mediana(sub.map((i) => i.views)), 0), xPerfil: r2(mediana(sub.map((i) => i.xPerfil))), xMercado: r2(mediana(sub.map((i) => i.xMercado))),
          porSeguidor: r2(mediana(sub.map((i) => i.porSeguidor))), porSeguidorMercado: r2(mediana(sub.map((i) => i.porSeguidorMercado))), engajamento: r2(mediana(sub.map((i) => i.engajamento)), 4),
        },
      } satisfies GrupoAg;
    }).sort((a, b) => b.n - a.n || (b.med.xPerfil ?? -1) - (a.med.xPerfil ?? -1));
  }

  // cobertura e régua de mercado (a mesma conta do app)
  const rows = marketRows(slug).filter((x) => x.comp === comp && x.platform === rede);
  const conc = rows.find((x) => x.mercadoConcorrentes != null)?.mercadoConcorrentes ?? null;
  const semMercado = itens.every((i) => i.xMercado == null);
  const avisos: string[] = [];
  const pl = (k: number, um: string, varios: string) => `${k} ${k === 1 ? um : varios}`;
  if (nivel === 'observacoes') avisos.push(`Amostra pequena: ${pl(n, 'item analisado', 'itens analisados')}, abaixo de ${METODO.minItensPadrao}. São observações, não padrões, e não há lift.`);
  if (semMercado) avisos.push(`Sem régua de mercado nesta rede: ${pl(conc ?? 0, 'concorrente tem', 'concorrentes têm')} dados, e o × mercado pede ${METODO.minConcorrentesMercado}.`);
  const semTexto = itens.filter((i) => i.faltou.some((x) => x === 'sem-transcricao' || x === 'audio-sem-fala'));
  if (semTexto.length) avisos.push(`${pl(semTexto.length, 'item sem', 'itens sem')} fala transcrita (o som não entra na análise): ${semTexto.map((i) => `"${i.titulo.slice(0, 40)}"`).join(', ')}.`);
  const editados = itens.filter((i) => i.editados > 0).length;
  if (editados) avisos.push(`${pl(editados, 'ficha tem', 'fichas têm')} correção sua: os números usam o valor corrigido.`);
  const muitoAcima = itens.filter((i) => (i.xPerfil ?? 0) >= 10);
  if (muitoAcima.length && n < METODO.minItensPadrao) avisos.push(`Mediana com poucos itens: ${muitoAcima.length === 1 ? 'o item' : `${muitoAcima.length} itens`} muito fora da curva (≥ 10× o perfil) ${muitoAcima.length === 1 ? 'puxa' : 'puxam'} a mediana de todo grupo em que ${muitoAcima.length === 1 ? 'aparece' : 'aparecem'}.`);

  const termos = termosDaRodada(fichas, existe, ctx.vocab.recusados);
  return {
    agregados: {
      metodo: METODO,
      amostra: { n, nivel, coletadosNaRede: rows.length, mercadoDisponivel: !semMercado, concorrentesNoMercado: conc, avisos },
      geral: {
        views: r2(mediana(itens.map((i) => i.views)), 0), xPerfil: r2(mediana(itens.map((i) => i.xPerfil))), xMercado: r2(mediana(itens.map((i) => i.xMercado))),
        porSeguidor: r2(mediana(itens.map((i) => i.porSeguidor))), engajamento: r2(mediana(itens.map((i) => i.engajamento)), 4),
        corteVencedor: r2(corte), vencedores: vencedores.map((i) => i.key),
      },
      itens,
      dimensoes,
    },
    termos,
  };
}

// ───────────────────────── anúncios (040 G): sem views, a medida é o tempo no ar ─────────────────────────
export interface ItemAnuncioAg {
  key: string; url: string; titulo: string; publicadoEm: string | null; diasNoAr: number | null; variacoes: number | null; irmaos: number | null; saiuDoAr: boolean | null; reapareceu: boolean | null;
  funil: string | null; tipoAnuncio: string | null; objetivo: string | null; origemClassificacao: Record<string, string>; angulo: string[]; tipoGancho: string | null; gancho: string | null; headline: string | null;
  provaTipo: string | null; gatilhos: string[]; formatoMidia: string | null; faltou: string[]; editados: number;
  // compatível com o ItemAg dos relatórios de conteúdo (a tela lê estes campos; anúncio não tem)
  views: null; shares: null; xPerfil: null; xMercado: null; porSeguidor: null; engajamento: null; duracaoS: null; tipo: string | null; formato: string | null; estrutura: null;
}

function itemAnuncio(slug: string, comp: string, f: Ficha): ItemAnuncioAg {
  const c = camposEfetivos(f);
  const ad = f.item as Ad;
  const h = adsHistory(slug, comp).ads.find((a) => a.id === ad.id);
  const m = f.medidas.historico;
  const rs = resolvidosDoAnuncio(slug, comp, f, c);
  const t = (ad.text || ad.title || c.headline?.texto || f.key).replace(/\{\{[^}]+\}\}/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    key: f.key, url: f.url, titulo: t.slice(0, 90), publicadoEm: ad.startedAt ?? null,
    // o histórico de hoje (a 037 recalcula a cada coleta); sem ele, o congelado na análise
    diasNoAr: h?.diasNoAr ?? m?.diasNoAr ?? null, variacoes: ad.variations ?? m?.variations ?? null, irmaos: h?.irmaos ?? m?.irmaos ?? null, saiuDoAr: h?.saiuDoAr ?? m?.saiuDoAr ?? null, reapareceu: h?.reapareceu ?? m?.reapareceu ?? null,
    funil: rs.funil.valor, tipoAnuncio: rs.tipo.valor, objetivo: rs.objetivo.valor, origemClassificacao: { funil: rs.funil.origem, tipo: rs.tipo.origem, objetivo: rs.objetivo.origem },
    angulo: c.angulo ?? [], tipoGancho: c.gancho?.tipo ?? null, gancho: c.gancho?.texto ?? null, headline: c.headline?.texto ?? null, provaTipo: c.provaTipo ?? null,
    gatilhos: [...new Set((c.gatilhos ?? []).map((g) => g.id))], formatoMidia: ad.media.type, faltou: f.insumos?.faltou ?? [], editados: Object.keys(f.override?.editados ?? {}).length,
    views: null, shares: null, xPerfil: null, xMercado: null, porSeguidor: null, engajamento: null, duracaoS: null, tipo: rs.tipo.valor, formato: ad.media.type, estrutura: null,
  };
}

const VALORES_AD: Record<string, (i: ItemAnuncioAg) => string[]> = {
  funil: (i) => (i.funil ? [i.funil] : []), tipoAnuncio: (i) => (i.tipoAnuncio ? [i.tipoAnuncio] : []), objetivo: (i) => (i.objetivo ? [i.objetivo] : []),
  angulo: (i) => i.angulo, tipoGancho: (i) => (i.tipoGancho ? [i.tipoGancho] : []), provaTipo: (i) => (i.provaTipo ? [i.provaTipo] : []), gatilho: (i) => i.gatilhos,
  formatoMidia: (i) => (i.formatoMidia ? [i.formatoMidia] : []),
};
/** dimensão → grupo do vocabulário; tipo, objetivo e formato do criativo têm lista própria (sem "proposto") */
const GRUPO_DIM_AD: Record<string, string | null> = { funil: 'funil', tipoAnuncio: null, objetivo: null, angulo: 'angulo', tipoGancho: 'tipoGancho', provaTipo: 'provaTipo', gatilho: 'gatilho', formatoMidia: null };

function calcularAgregadosAnuncios(slug: string, comp: string, fichas: Ficha[]) {
  const itens = fichas.map((f) => itemAnuncio(slug, comp, f)).sort((a, b) => (b.diasNoAr ?? -1) - (a.diasNoAr ?? -1));
  const { nome, existe, ctx } = nomes(slug);
  const n = itens.length;
  const nivel = n >= METODO.minItensPadrao ? 'padroes' : 'observacoes';
  const dias = itens.map((i) => i.diasNoAr).filter((x): x is number => x != null).sort((a, b) => a - b);
  const corte = nivel === 'padroes' && dias.length ? dias[Math.floor(dias.length * METODO.quartilVencedor)] : null;
  const vencedores = corte == null ? [] : itens.filter((i) => (i.diasNoAr ?? -1) >= corte);
  const resto = corte == null ? [] : itens.filter((i) => !vencedores.includes(i));

  const dimensoes: Record<string, GrupoAg[]> = {};
  for (const d of DIMENSOES_ANUNCIO) {
    const g = GRUPO_DIM_AD[d.id];
    const valores = [...new Set(itens.flatMap(VALORES_AD[d.id]))];
    dimensoes[d.id] = valores.map((v) => {
      const sub = itens.filter((i) => VALORES_AD[d.id](i).includes(v));
      const melhor = [...sub].sort((a, b) => (b.diasNoAr ?? -1) - (a.diasNoAr ?? -1))[0];
      let lift: number | null = null;
      if (corte != null && sub.length >= METODO.minNGrupo && vencedores.length && resto.length) {
        const pv = vencedores.filter((i) => VALORES_AD[d.id](i).includes(v)).length / vencedores.length;
        const pr = resto.filter((i) => VALORES_AD[d.id](i).includes(v)).length / resto.length;
        lift = pr > 0 ? r2(pv / pr) : null;
      }
      return {
        valor: v, nome: g ? nome(g, v) : v.replace(/-/g, ' '), n: sub.length, fraca: sub.length < METODO.minNGrupo, itens: sub.map((i) => i.key), melhor: melhor?.key ?? null,
        ...(g && !existe(g, v) ? { proposto: true } : {}), lift,
        med: { views: null, xPerfil: null, xMercado: null, porSeguidor: null, porSeguidorMercado: null, engajamento: null, diasNoAr: r2(mediana(sub.map((i) => i.diasNoAr)), 0), variacoes: r2(mediana(sub.map((i) => i.variacoes)), 1) },
      } satisfies GrupoAg;
    }).sort((a, b) => b.n - a.n || (b.med.diasNoAr ?? -1) - (a.med.diasNoAr ?? -1));
  }

  const avisos: string[] = [];
  const pl = (k: number, um: string, varios: string) => `${k} ${k === 1 ? um : varios}`;
  avisos.push('Anúncio não tem views, gasto nem alcance: o sinal de resultado é indireto (tempo no ar, versões e persistência); anúncio barato ou institucional também fica no ar.');
  if (nivel === 'observacoes') avisos.push(`Amostra pequena: ${pl(n, 'anúncio analisado', 'anúncios analisados')}, abaixo de ${METODO.minItensPadrao}. São observações, não padrões, e não há lift.`);
  const coletas = adsHistory(slug, comp).coletas;
  if (coletas < 2) avisos.push(`Só ${pl(coletas, 'coleta', 'coletas')} da Biblioteca: ainda não dá para ver quem saiu do ar nem quem voltou.`);
  const novos = itens.filter((i) => (i.diasNoAr ?? 0) < 14);
  if (novos.length) avisos.push(`${pl(novos.length, 'anúncio está', 'anúncios estão')} no ar há menos de 14 dias: ainda em teste, sem sinal.`);
  const editados = itens.filter((i) => i.editados > 0 || Object.values(i.origemClassificacao).includes('voce')).length;
  if (editados) avisos.push(`${pl(editados, 'anúncio tem', 'anúncios têm')} correção sua (campo da ficha ou funil/tipo/objetivo): os números usam o valor corrigido.`);

  const termos = termosDaRodada(fichas, existe, ctx.vocab.recusados);
  return {
    agregados: {
      metodo: METODO,
      amostra: { n, nivel, coletadosNaRede: n, mercadoDisponivel: false, concorrentesNoMercado: null, avisos },
      geral: {
        views: null, xPerfil: null, xMercado: null, porSeguidor: null, engajamento: null,
        diasNoAr: r2(mediana(itens.map((i) => i.diasNoAr)), 0), variacoes: r2(mediana(itens.map((i) => i.variacoes)), 1), corteVencedor: r2(corte, 0), vencedores: vencedores.map((i) => i.key),
      },
      itens,
      dimensoes,
    },
    termos,
  };
}

/** termos propostos nas fichas (análise atual), sem os que já existem e sem os recusados */
function termosDaRodada(fichas: Ficha[], existe: (g: string, v: string) => boolean, recusados: { grupo: string; valor: string }[]): RelatorioTermo[] {
  const m = new Map<string, RelatorioTermo>();
  for (const f of fichas) for (const t of f.analise?.termosNovos ?? []) {
    if (existe(t.grupo, t.valor) || recusados.some((r) => r.grupo === t.grupo && r.valor === t.valor)) continue;
    const k = `${t.grupo}:${t.valor}`;
    const cur = m.get(k) ?? { grupo: t.grupo, valor: t.valor, definicao: t.definicao, exemplo: t.exemplo, itens: [] };
    if (!cur.itens.includes(f.key)) cur.itens.push(f.key);
    m.set(k, cur);
  }
  return [...m.values()].sort((a, b) => b.itens.length - a.itens.length);
}

const hoje = () => new Date().toISOString().slice(0, 10);

/** calcula e grava (sem leitura); devolve o relatório */
export function gerarRelatorio(slug: string, comp: string, sel: Selecao & { rodada?: string; escopo?: Relatorio['escopo'] }): Relatorio {
  const fichas = fichasDaRodada(slug, comp, sel);
  if (!fichas.length) throw new Error(`nenhuma ficha analisada de ${comp} em ${sel.rede}${sel.itens ? ' entre as chaves pedidas' : ''}: rode a análise antes`);
  const escopo: Relatorio['escopo'] = sel.escopo ?? (sel.itens?.length ? 'selecao' : sel.top === 10 ? 'top10' : sel.top === 20 ? 'top20' : 'todos-analisados');
  const rede = (sel.itens?.length && !sel.itens.every((k) => k.startsWith(`${prefixoDe(sel.rede)}:`)) ? redeDeChave(sel.itens[0]) : sel.rede) as Relatorio['rede'];
  let id = sel.rodada ?? `${hoje()}-${rede}-${escopo}`;
  const anteriorMesmo = sel.rodada ? lerRelatorio(slug, comp, id) : null;
  if (!sel.rodada) for (let i = 2; lerRelatorio(slug, comp, id); i++) id = `${hoje()}-${rede}-${escopo}-${i}`;
  const { agregados, termos } = calcularAgregados(slug, comp, rede, fichas);
  const anterior = listarRelatorios(slug, comp).find((r) => r.data.rede === rede && r.data.id !== id)?.data.id;
  const rel: Relatorio = {
    id, competitor: comp, rede, escopo, itens: fichas.map((f) => f.key), agregados, modelo: 'script', gerado: nowIso(),
    ...(anterior ? { anterior } : {}), emDestaque: false,
    // decisões já tomadas num relatório refeito com --rodada continuam
    termosNovos: termos.map((t) => ({ ...t, ...pick(anteriorMesmo?.data.termosNovos.find((x) => x.grupo === t.grupo && x.valor === t.valor)) })),
    custo: { via: 'claude-code' },
  };
  // refazer com --rodada mantém a leitura só se ela ainda bate com os números novos
  if (anteriorMesmo?.data.leitura && !numerosForaDosAgregados({ ...rel, leitura: anteriorMesmo.data.leitura }).length) { rel.leitura = anteriorMesmo.data.leitura; rel.modelo = anteriorMesmo.data.modelo; }
  gravarRelatorio(slug, comp, rel);
  for (const f of fichas) if (!f.relatorios.includes(id)) { f.relatorios = [...f.relatorios, id]; writeFicha(slug, comp, f); }
  atualizarDestaque(slug, comp);
  return lerRelatorio(slug, comp, id)!.data;
}
const pick = (t?: RelatorioTermo) => (t?.decisao ? { decisao: t.decisao, em: t.em } : {});

/** grava a leitura do Opus (arquivo JSON) num relatório existente; recusa número fora dos agregados e chave fora da rodada */
export function salvarLeitura(slug: string, comp: string, id: string, arquivo: string, modelo = 'claude-opus-5-5'): Relatorio {
  const doc = lerRelatorio(slug, comp, id);
  if (!doc) throw new Error(`relatório ${id} não existe em ${comp}: gere antes com npm run fichas -- relatorio ${slug} ${comp} --rede …`);
  const raw = JSON.parse(readFileSync(arquivo, 'utf8').replace(/^﻿/, '')) as Record<string, unknown>;
  const p = RelatorioLeitura.safeParse(raw.leitura ?? raw);
  if (!p.success) throw new Error(`leitura fora do schema:\n  ${p.error.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`).join('\n  ')}`);
  const l = p.data;
  const fora = [...l.padroes, ...l.copiar, ...l.evitar, ...l.ideias].flatMap((b) => b.itens).filter((k) => !doc.data.itens.includes(k));
  if (fora.length) throw new Error(`a leitura cita item(ns) fora da rodada: ${[...new Set(fora)].join(', ')}`);
  const rel: Relatorio = { ...doc.data, leitura: l, modelo: String(raw.modelo ?? modelo) };
  const bad = numerosForaDosAgregados(rel);
  if (bad.length) throw new Error(`a leitura cita número(s) que não estão nos agregados: ${bad.join(', ')}. Use só os números do pacote (contagens, medianas, medidas dos itens).`);
  gravarRelatorio(slug, comp, rel);
  return rel;
}

/** pacote enxuto que o Opus lê para escrever a leitura: agregados + o essencial de cada ficha (hipótese, adaptar, riscos) */
export function pacoteRelatorio(slug: string, comp: string, id: string) {
  const doc = lerRelatorio(slug, comp, id);
  if (!doc) throw new Error(`relatório ${id} não existe`);
  const fichas = doc.data.itens.map((k) => readFicha(slug, comp, k)).filter((f): f is Ficha => !!f);
  return {
    relatorio: { id, competitor: comp, rede: doc.data.rede, escopo: doc.data.escopo, anterior: doc.data.anterior ?? null },
    regras: 'A leitura (resumo, padroes, copiar, evitar, ideias, limites) só pode citar números que estão em `agregados`. Com amostra.nivel = "observacoes", fale em observações, não em padrões. Copiar = o mecanismo, nunca a frase. Ideias para a Kzloo (SaaS de gestão para psicólogas e terapeutas autônomas): a dor dela é o caos administrativo, não a teoria.',
    agregados: doc.data.agregados,
    fichas: fichas.map((f) => {
      const c = camposEfetivos(f);
      return { key: f.key, tema: c.tema?.texto, mensagem: c.mensagem, headline: c.headline?.texto, gancho: c.gancho?.texto, retencao5s: c.retencao5s, porQue: c.porQue, adaptar: c.adaptar, riscos: c.riscos, som: c.som, cta: c.cta?.tipo, faltou: c.faltou };
    }),
    termosNovos: doc.data.termosNovos,
    formatoLeitura: { resumo: ['até 5 linhas'], padroes: [{ titulo: '', texto: '', itens: ['<chave>'] }], copiar: [{ mecanismo: '', como: '', itens: [] }], evitar: [{ texto: '', itens: [] }], ideias: [{ ideia: '', formato: '<id de library/formatos ou omitir>', itens: [] }], limites: [''] },
  };
}
