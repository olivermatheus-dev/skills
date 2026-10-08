// Vocabulário da aba Fontes (041): rótulos e ícones Lucide de tipo, forma de consulta, idioma, confiança e status.
import { BookOpen, CircleAlert, Database, FlaskConical, Globe, Landmark, Library, Mail, Mic, Newspaper, Rss, ScanSearch, Shapes, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import type { Source } from '../../api';
import { cx } from '../kit';
import { Tip } from '../competitors/toolbar';

type T = Source['type'];
export const TYPES: { id: T; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'periodico', label: 'Periódico científico', short: 'Periódico', icon: BookOpen },
  { id: 'base-artigos', label: 'Base de artigos', short: 'Base', icon: Database },
  { id: 'orgao-oficial', label: 'Órgão oficial / conselho', short: 'Órgão', icon: Landmark },
  { id: 'noticia', label: 'Notícia', short: 'Notícia', icon: Newspaper },
  { id: 'livro-editora', label: 'Livro / editora', short: 'Livro', icon: Library },
  { id: 'podcast', label: 'Podcast', short: 'Podcast', icon: Mic },
  { id: 'newsletter', label: 'Newsletter', short: 'Newsletter', icon: Mail },
  { id: 'perfil-criador', label: 'Perfil / criador', short: 'Criador', icon: UserRound },
  { id: 'outro', label: 'Outro', short: 'Outro', icon: Shapes },
];
export const typeMeta = (t: T) => TYPES.find((x) => x.id === t) ?? TYPES[TYPES.length - 1];

type M = Source['access']['method'];
export const METHODS: { id: M; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'api', label: 'API', hint: 'o script consulta a API (grátis, sem IA)', icon: FlaskConical },
  { id: 'rss', label: 'RSS', hint: 'o script lê o feed (grátis, sem IA)', icon: Rss },
  { id: 'busca-site', label: 'Busca do site', hint: 'o script usa a busca do próprio site', icon: ScanSearch },
  { id: 'pagina', label: 'Página a vigiar', hint: 'o script compara a página com a última visita', icon: Globe },
  { id: 'web', label: 'Leitura pela IA', hint: 'sem API nem feed: um subagente lê a página', icon: Globe },
];
export const methodMeta = (m: M) => METHODS.find((x) => x.id === m) ?? METHODS[METHODS.length - 1];

export const ADAPTERS: Record<string, string> = {
  pubmed: 'PubMed', europepmc: 'Europe PMC', openalex: 'OpenAlex', crossref: 'Crossref', doaj: 'DOAJ', openlibrary: 'Open Library',
  'google-news': 'Google Notícias', rss: 'feed', 'html-diff': 'diferença',
};
export const consultaLabel = (a: Source['access']) => {
  const m = methodMeta(a.method);
  return a.adapter && a.adapter !== 'rss' && a.adapter !== 'html-diff' && a.method === 'api' ? `${m.label} · ${ADAPTERS[a.adapter]}` : a.adapter === 'google-news' ? 'RSS · Google' : m.label;
};

export const LANGS: { id: Source['language']; label: string }[] = [
  { id: 'pt', label: 'Português' }, { id: 'en', label: 'Inglês' }, { id: 'es', label: 'Espanhol' }, { id: 'multi', label: 'Vários' },
];
export const TRUST: Record<1 | 2 | 3, { label: string; hint: string }> = {
  3: { label: 'Alta', hint: 'revisão por pares ou órgão oficial: sustenta afirmação técnica' },
  2: { label: 'Média', hint: 'jornalismo profissional ou editora: gatilho de pauta, não prova' },
  1: { label: 'Baixa', hint: 'opinião ou criador: só inspiração' },
};
export const WEIGHT: Record<1 | 2 | 3, string> = { 3: 'Alta', 2: 'Normal', 1: 'Baixa' };

export const STATUS: { id: Source['status']; label: string; dot: string; pill: string }[] = [
  { id: 'sugerida', label: 'Sugerida', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'ativa', label: 'Ativa', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'pausada', label: 'Pausada', dot: 'bg-slate-400', pill: 'bg-muted text-muted-foreground border-border' },
  { id: 'arquivada', label: 'Recusada', dot: 'bg-slate-300', pill: 'bg-muted text-muted-foreground border-border' },
];
export const statusMeta = (s: Source['status']) => STATUS.find((x) => x.id === s) ?? STATUS[0];

/** domínio + caminho curto (scielo.br/j/rbp): distingue os periódicos do mesmo site */
export const domainOf = (url: string) => {
  try {
    const u = new URL(url), p = u.pathname.replace(/\/+$/, '');
    return `${u.hostname.replace(/^www\./, '')}${p.length <= 24 ? p : ''}`;
  } catch { return url; }
};

/** pontos 1–3 (confiança, peso) */
export function Dots({ n, title, className }: { n: number; title?: string; className?: string }) {
  return (
    <Tip content={title}>
      <span className={cx('inline-flex gap-0.5 align-middle', className)} aria-label={`${n} de 3`}>
        {[1, 2, 3].map((i) => <span key={i} className={cx('size-1.5 rounded-full', i <= n ? 'bg-foreground/70' : 'bg-foreground/15')} />)}
      </span>
    </Tip>
  );
}

/** selo de conferência do link */
export function VerifiedBadge({ s, withLabel }: { s: Source; withLabel?: boolean }) {
  if (s.verifiedAt) return (
    <Tip content={`Link conferido em ${s.verifiedAt.split('-').reverse().join('/')}`}>
      <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px]"><ShieldCheck className="size-3.5" />{withLabel && 'conferido'}</span>
    </Tip>
  );
  return (
    <Tip content={s.notes || 'Link não conferido: abra no navegador e decida se fica.'}>
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 text-[11px] font-medium text-amber-700 whitespace-nowrap"><CircleAlert className="size-3" />não conferido</span>
    </Tip>
  );
}
