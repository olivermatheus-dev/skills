// Brechas → Por concorrente: as frases originais de cada análise de pontos fortes e fracos (forcas.opportunities)
// e em que brecha (tema de intel/brechas.json) cada frase entrou.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ModuleDataOf } from '../../../../../schema/analysis';
import { Avatar } from '../../../components/competitors/lib';
import type { MarketRow } from '../../../components/competitors/area';
import { FillBox } from '../../../components/fill';
import { useGaps } from '../../../queries';
import { gapHref } from '../PanoramaBrechas';

export default function PorConcorrente({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const g = useGaps(slug).data;
  /** concorrente → frase → tema (a frase como foi copiada para o tema) */
  const themeOf = useMemo(() => {
    const m = new Map<string, { id: string; title: string }>();
    for (const t of g?.themes ?? []) for (const s of t.sources) m.set(`${s.competitor}\u0000${s.text.trim()}`, { id: t.id, title: t.title });
    return m;
  }, [g]);
  const list = rows
    .map((r) => ({ r, ops: (r.res.forcas?.data as ModuleDataOf<'forcas'> | undefined)?.opportunities ?? [] }))
    .filter((x) => x.ops.length)
    .sort((a, b) => b.ops.length - a.ops.length || a.r.c.data.name.localeCompare(b.r.c.data.name));
  if (!list.length) return <p className="text-sm text-muted-foreground">Nenhuma análise de pontos fortes e fracos ainda.</p>;
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">O que a análise de cada concorrente apontou como brecha para nós, com as palavras de lá. O link mostra em que brecha a frase entrou.</p>
      <FillBox>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 items-start">
          {list.map(({ r, ops }) => {
            const id = r.c.data.id;
            const temas = new Set(ops.map((o) => themeOf.get(`${id}\u0000${o.trim()}`)?.id).filter(Boolean));
            return (
              <article key={id} className="bg-card border border-border rounded-xl">
                <header className="px-3.5 pt-3 pb-2.5 border-b border-border flex items-center gap-2.5">
                  <Avatar name={r.c.data.name} size={28} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0 shrink-0" />
                  <div className="min-w-0">
                    <Link to={`/p/${slug}/concorrentes/${id}`} className="block text-sm font-semibold truncate hover:text-primary-ink">{r.c.data.name}</Link>
                    <p className="text-[11px] text-muted-foreground">{ops.length} {ops.length === 1 ? 'frase' : 'frases'}{temas.size ? ` · ${temas.size === 1 ? 'entra em 1 brecha' : `entram em ${temas.size} brechas`}` : ''}</p>
                  </div>
                </header>
                <ul className="p-3.5 space-y-2.5">
                  {ops.map((o, i) => {
                    const t = themeOf.get(`${id}\u0000${o.trim()}`);
                    return (
                      <li key={i} className="text-[13px] leading-snug">
                        <p className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:size-1.5 before:rounded-full before:bg-primary/60">{o}</p>
                        {t && <Link to={gapHref(slug, t.id)} className="ml-3 mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary-ink hover:underline"><ArrowRight className="size-3" />{t.title}</Link>}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </FillBox>
    </div>
  );
}
