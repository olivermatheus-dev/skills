// Pesquisar ideias (041 F3): padrões do diálogo, rótulos e formatos. Sem tela aqui; o diálogo, a lista e o detalhe usam isto.
import type { Doc, Idea, ResearchRequest, Source, StrategyRefs } from '../../api';

/** livro, podcast e newsletter só entram quando o pilar/série pede (6 e 12); no tema livre ficam de fora */
export const TIPOS_TEMA_LIVRE = new Set<Source['type']>(['periodico', 'base-artigos', 'noticia', 'orgao-oficial']);

export type Modo = 'serie' | 'pilar' | 'tema';
export interface Sobre { modo: Modo; n: number | null; tema: string }

const cruza = (s: Source, sobre: Sobre) =>
  sobre.modo === 'serie' ? s.series.includes(sobre.n ?? -1) : sobre.modo === 'pilar' ? s.pillars.includes(sobre.n ?? -1) : TIPOS_TEMA_LIVRE.has(s.type);

/**
 * Fontes do padrão: as ATIVAS que cruzam a escolha. Sem nenhuma aceita ainda, as sugeridas conferidas de confiança alta
 * (a mesma regra do `--sugeridas` do terminal); `provisorias` avisa na tela.
 */
export function fontesPadrao(sources: Source[], sobre: Sobre): { ids: string[]; provisorias: boolean } {
  const ativas = sources.filter((s) => s.status === 'ativa' && cruza(s, sobre));
  if (ativas.length) return { ids: ativas.map((s) => s.id), provisorias: false };
  return { ids: sources.filter((s) => s.status === 'sugerida' && !!s.verifiedAt && s.trust === 3 && cruza(s, sobre)).map((s) => s.id), provisorias: true };
}

/**
 * Série (ou pilar) mais antiga sem ideia nova, entre as que a rodada consegue buscar de verdade: conta só fontes com
 * coletor por script (fonte sem coletor é ignorada na rodada). Prefere quem tem 2+ fontes buscáveis; tema livre só se nada serve.
 */
export function sobrePadrao(ideas: Doc<Idea>[], sources: Source[], refs: StrategyRefs | undefined, coletores: string[]): Sobre {
  const byId = new Map(sources.map((s) => [s.id, s]));
  const buscaveis = (modo: 'serie' | 'pilar', n: number) =>
    fontesPadrao(sources, { modo, n, tema: '' }).ids.filter((id) => { const a = byId.get(id)?.access.adapter; return !!a && coletores.includes(a); }).length;
  const rank = (modo: 'serie' | 'pilar', n: number) => {
    const dela = ideas.filter((i) => (modo === 'serie' ? i.data.series : i.data.pillar) === n);
    return { n, novas: dela.filter((i) => i.data.status === 'nova').length, ultima: dela.map((i) => i.data.created).sort().pop() ?? '' };
  };
  const pick = (modo: 'serie' | 'pilar', ns: number[], minimo: number): Sobre | null => {
    const ok = ns.filter((n) => buscaveis(modo, n) >= minimo).map((n) => rank(modo, n));
    ok.sort((a, b) => a.novas - b.novas || a.ultima.localeCompare(b.ultima) || a.n - b.n);
    return ok[0] ? { modo, n: ok[0].n, tema: '' } : null;
  };
  const series = (refs?.series ?? []).map((s) => s.n), pilares = (refs?.pillars ?? []).map((p) => p.n);
  return pick('serie', series, 2) ?? pick('pilar', pilares, 2) ?? pick('serie', series, 1) ?? pick('pilar', pilares, 1) ?? { modo: 'tema', n: null, tema: '' };
}

/** "Série 3 · Mito, verdade ou… depende?" / "Pilar 6 · …" / o tema livre */
export function rotuloRodada(req: Pick<ResearchRequest, 'series' | 'pillar' | 'topic'>, refs?: StrategyRefs, curto = false) {
  if (req.series) { const nome = refs?.series.find((s) => s.n === req.series)?.name; return curto || !nome ? `Série ${req.series}` : `Série ${req.series} · ${nome}`; }
  if (req.pillar) { const nome = refs?.pillars.find((p) => p.n === req.pillar)?.name; return curto || !nome ? `Pilar ${req.pillar}` : `Pilar ${req.pillar} · ${nome}`; }
  return req.topic ?? '—';
}

export const fmtUsd = (v: number) => `US$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
/** "US$ 1,30–3,00" ou "US$ 4,51" quando a faixa é um ponto só */
export const fmtFaixa = (lo: number, hi: number) => (Math.abs(hi - lo) < 0.005 ? fmtUsd(lo) : `${fmtUsd(lo)}–${fmtUsd(hi).replace('US$ ', '')}`);
export const LIMITE_AVISO_USD = 3;

export function duracao(desdeIso: string | null | undefined, agora = Date.now()) {
  if (!desdeIso) return '';
  const m = Math.max(0, Math.round((agora - Date.parse(desdeIso)) / 60000));
  return m < 1 ? 'menos de 1 min' : m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
export const dataCurta = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** a rodada que o painel do diálogo está mostrando agora (o aviso global de fim não repete o que a pessoa está vendo) */
let emTela: string | null = null;
export const setRodadaEmTela = (id: string | null) => { emTela = id; };
export const rodadaEmTela = () => emTela;
