// Cria o pedido de uma rodada de pesquisa (041): o MESMO código serve ao terminal (`npm run curadoria -- pedir`) e ao
// botão "Pesquisar ideias" do app. Grava rodadas/<id>/pedido.json (+ consultas.json quando já há consultas).
import * as S from '../../core/store';
import { slugify } from '../../core/platform';
import { queriesFile, roundDir, writeJsonFile, type Queries } from './paths';

export interface PedidoOpts {
  serie?: number | null;
  pilar?: number | null;
  tema?: string | null;
  /** ids das fontes; vazio = as ativas que cruzam a série/pilar */
  fontes?: string[];
  /** sem fonte ativa: usa as sugeridas conferidas de confiança 3 (registrado nas instruções) */
  sugeridas?: boolean;
  ideias?: number;
  /** janela dos estudos em meses (padrão aprovado: 24) */
  meses?: number;
  /** janela das notícias em dias (padrão aprovado: 60) */
  diasNoticia?: number;
  rapida?: boolean;
  idiomas?: ('pt' | 'en' | 'es')[];
  instrucoes?: string;
  pt?: string[]; en?: string[]; noticias?: string[]; termos?: string[]; max?: number;
  estimate?: { minutes: number; usdLow: number; usdHigh: number };
}

/** faixa do desenho (041 §3): normal US$ 1,30–3,00 · rápida US$ 1,00–2,10, 5–12 min */
export const ESTIMATIVA_PADRAO = {
  normal: { minutes: 12, usdLow: 1.3, usdHigh: 3.0 },
  rapida: { minutes: 8, usdLow: 1.0, usdHigh: 2.1 },
};

const monthsBefore = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() - m); return x.toISOString().slice(0, 10); };
const pad = (n: number) => String(n).padStart(2, '0');

export function criarPedido(slug: string, o: PedidoOpts) {
  const serie = o.serie || null, pilar = o.pilar || null, tema = o.tema?.trim() || null;
  if (!serie && !pilar && !tema) throw new Error('informe --serie, --pilar ou --tema');
  const all = S.listSources(slug);
  const fits = (s: (typeof all)[number]) => (serie ? s.series.includes(serie) : pilar ? s.pillars.includes(pilar) : true);
  let sources = o.fontes?.length ? [...new Set(o.fontes)] : all.filter((s) => s.status === 'ativa' && fits(s)).map((s) => s.id);
  let note = '';
  if (!sources.length && o.sugeridas) {
    // nenhuma aceita ainda: usa as sugeridas conferidas de confiança 3 (registrado nas instruções do pedido)
    sources = all.filter((s) => s.status === 'sugerida' && s.verifiedAt && s.trust === 3 && fits(s)).map((s) => s.id);
    note = 'Nenhuma fonte aceita pelo Oliver ainda: rodada com as sugeridas conferidas de confiança 3. ';
  }
  if (!sources.length) throw new Error('nenhuma fonte ativa para esse filtro (aceite fontes no app ou use --sugeridas / --fontes)');
  const byId = new Map(all.map((s) => [s.id, s]));
  const miss = sources.filter((id) => !byId.has(id));
  if (miss.length) throw new Error(`fonte(s) que não existem: ${miss.join(', ')}`);
  const arq = sources.filter((id) => byId.get(id)!.status === 'arquivada');
  if (arq.length) throw new Error(`fonte(s) recusadas: ${arq.join(', ')}`);
  if (!note) {
    const sug = sources.filter((id) => byId.get(id)!.status === 'sugerida');
    if (sug.length) note = `Fontes ainda não aceitas pelo Oliver (sugeridas): ${sug.join(', ')}. `;
  }

  const now = new Date();
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const label = slugify(tema ?? (serie ? `serie-${serie}` : `pilar-${pilar}`)).slice(0, 30);
  let id = `${stamp}-${label}`, n = 2;
  while (S.listRounds(slug).includes(id)) id = `${stamp}-${label}-${n++}`;
  const rapida = !!o.rapida;
  const req = S.saveRoundRequest(slug, {
    id, topic: tema, pillar: pilar, series: serie, sources,
    period: { from: monthsBefore(now, o.meses ?? 24), to: now.toISOString().slice(0, 10) },
    maxIdeas: o.ideias ?? 8, depth: rapida ? 'rapida' : 'normal', languages: o.idiomas?.length ? o.idiomas : ['pt', 'en'],
    instructions: `${note}${o.instrucoes ?? ''}`.trim(),
    estimate: o.estimate ?? (rapida ? ESTIMATIVA_PADRAO.rapida : ESTIMATIVA_PADRAO.normal),
    requestedAt: now.toISOString().replace(/\.\d+Z$/, 'Z'), status: 'pendente',
  });
  const q: Queries = { pt: o.pt ?? [], en: o.en ?? [], noticias: o.noticias ?? [], noticiasDias: o.diasNoticia ?? 60, termos: o.termos ?? [], max: o.max ?? 20 };
  if (!q.pt.length && !q.en.length) {
    if (!tema) return { req, dir: roundDir(slug, id), consultas: false }; // série/pilar sem consultas: quem rodar define (comando `consultas`)
    q.pt = [tema];
  }
  writeJsonFile(queriesFile(slug, id), q);
  return { req, dir: roundDir(slug, id), consultas: true };
}
