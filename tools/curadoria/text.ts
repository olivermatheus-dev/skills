// Texto: limpar HTML/JATS, normalizar para comparar trechos, adivinhar idioma e tipo de evidência. Sem rede.
import type { Evidence, Lang } from './types';

const ENT: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' };
export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCp(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => safeCp(+n))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
}
const safeCp = (n: number) => { try { return String.fromCodePoint(n); } catch { return ' '; } };

/** HTML/XML/JATS → texto corrido */
export function stripTags(s: string): string {
  return decodeEntities(
    s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
}

/** forma canônica para conferir um trecho: sem caixa, acento, pontuação tipográfica nem espaço extra */
export function norm(s: string): string {
  return stripTags(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‐-―−]/g, '-')
    .replace(/[“”«»"‘’'`´]/g, '')
    .replace(/[^a-z0-9%.,;:()\-\s]/g, ' ')
    .replace(/\s*([.,;:()])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** palpite de idioma pelo vocabulário (o resumo manda; o campo da API vem antes quando existe) */
export function guessLang(s: string): Lang {
  const t = ` ${s.toLowerCase()} `;
  const count = (ws: string[]) => ws.reduce((n, w) => n + (t.split(` ${w} `).length - 1), 0);
  const pt = count(['de', 'que', 'não', 'para', 'com', 'uma', 'os', 'das', 'dos', 'como', 'pacientes', 'estudo', 'resultados']);
  const es = count(['el', 'los', 'las', 'para', 'con', 'una', 'del', 'estudio', 'resultados', 'pacientes', 'y']);
  const en = count(['the', 'of', 'and', 'with', 'for', 'was', 'were', 'study', 'patients', 'results']);
  if (en >= pt && en >= es) return en ? 'en' : 'outro';
  return pt >= es ? 'pt' : 'es';
}
export function langCode(raw: string | undefined | null, fallbackText = ''): Lang {
  const r = (raw ?? '').toLowerCase();
  if (/^(pt|por)/.test(r)) return 'pt';
  if (/^(en|eng)/.test(r)) return 'en';
  if (/^(es|spa)/.test(r)) return 'es';
  return fallbackText ? guessLang(fallbackText) : 'outro';
}

/** palpite de força de evidência pelos tipos de publicação e pelo título (a triagem confirma) */
export function guessEvidence(pubTypes: string[], title: string, abstract = ''): Evidence | undefined {
  const t = `${pubTypes.join(' ')} ${title} ${abstract.slice(0, 600)}`.toLowerCase();
  if (/meta-?an[aá]lis|metan[aá]lis/.test(t)) return 'meta-analise';
  if (/systematic review|revis[aã]o sistem[aá]tica|revisi[oó]n sistem[aá]tica|scoping review|umbrella review|revis[aã]o de escopo/.test(t)) return 'revisao-sistematica';
  if (/randomi[sz]ed|ensaio cl[ií]nico|clinical trial|randomizad/.test(t)) return 'ensaio-clinico';
  if (/qualitativ|interpretative phenomenological|grounded theory|grupo focal|focus group/.test(t)) return 'qualitativo';
  if (/cohort|coorte|cross-sectional|transversal|longitudinal|survey|levantamento|observational/.test(t)) return 'observacional';
  if (/\breview\b|revis[aã]o/.test(t)) return 'revisao-narrativa';
  if (/editorial|comment|opinion|letter|carta ao editor/.test(t)) return 'opiniao';
  return undefined;
}
export const EVIDENCE_RANK: Record<Evidence, number> = {
  'meta-analise': 5, 'revisao-sistematica': 4.5, 'ensaio-clinico': 4, observacional: 3, qualitativo: 2.5, 'revisao-narrativa': 2, documento: 3, opiniao: 0.5,
};

/** AAAA-MM-DD a partir de pedaços (mês e dia faltando viram 01) */
export function isoDate(y?: string | number | null, m?: string | number | null, d?: string | number | null): string | undefined {
  if (!y || !/^\d{4}$/.test(String(y))) return undefined;
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  let mm = m == null ? 1 : /^\d+$/.test(String(m)) ? +m : MONTHS.indexOf(String(m).slice(0, 3).toLowerCase()) + 1 || 1;
  const dd = d == null || !/^\d+$/.test(String(d)) ? 1 : +d;
  if (mm < 1 || mm > 12) mm = 1;
  return `${y}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}
export function toIso(s?: string | null): string | undefined {
  if (!s) return undefined;
  const m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (m) return `${m[1]}-${m[2]}-${m[3] ?? '01'}`;
  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10);
}

export const cleanDoi = (s?: string | null) => {
  if (!s) return undefined;
  const m = s.trim().match(/10\.\d{4,9}\/\S+/);
  return m ? m[0].replace(/[.,;)\]]+$/, '').toLowerCase() : undefined;
};

/** periódicos brasileiros conhecidos e sinais de origem brasileira */
const BR_VENUES = /psicologia|psiquiatria|brasileir|brazil|scielo|psico-usf|estudos de psicologia|paid[eé]ia|interação em psicologia|temas em psicologia|avaliação psicológica|revista da sbph|cadernos de sa[uú]de p[uú]blica|ci[eê]ncia & sa[uú]de coletiva|revista de sa[uú]de p[uú]blica/i;
export function isBrazilian(o: { venue?: string; doi?: string; language: Lang; countries?: string[] }) {
  if (o.countries?.some((c) => c.toUpperCase() === 'BR')) return true;
  if (o.doi?.startsWith('10.1590/')) return true; // prefixo SciELO Brasil
  return o.language === 'pt' && !!o.venue && BR_VENUES.test(o.venue);
}

export function dedupKey(o: { doi?: string; pmid?: string; url: string }) {
  return o.doi ? `doi:${o.doi}` : o.pmid ? `pmid:${o.pmid}` : `url:${o.url}`;
}
export const titleKey = (t: string) => norm(t).replace(/[^a-z0-9]/g, '').slice(0, 80);
