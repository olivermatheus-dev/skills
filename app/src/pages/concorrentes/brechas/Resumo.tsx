// Brechas → Resumo: "por onde eu começo?". 4 números (cada um abre a sub-aba), as 3 maiores brechas em cards e as brechas por área.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, ListChecks, PackageX, Target } from 'lucide-react';
import { StatStrip, type MarketRow, type Stat } from '../../../components/competitors/area';
import { cx } from '../../../components/kit';
import { useGaps, useMatrix } from '../../../queries';
import type { BrechasView } from '../Brechas';
import {
  GapAvatars, GapMeter, GapTaskButton, KIND, KIND_ICON, gapComps, gapHref, gapVerb, nosHas, rankGaps,
  type GapTasks, type Kind, type MatrixStats,
} from '../PanoramaBrechas';

export default function Resumo({ slug, rows, s, tasks, go }: {
  slug: string; rows: MarketRow[]; s: MatrixStats | null; tasks: GapTasks; go: (v: BrechasView, extra?: Record<string, string>) => void;
}) {
  const gq = useGaps(slug);
  const mq = useMatrix(slug);
  const g = gq.data;
  const byId = useMemo(() => new Map(rows.map((r) => [r.c.data.id, r])), [rows]);
  const base = `/p/${slug}/concorrentes/brechas`;
  if (gq.isLoading) return <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />;
  if (!g?.themes.length) return (
    <div className="bg-card border border-border rounded-xl p-6 text-center">
      <Target className="size-6 mx-auto text-primary-ink" />
      <h2 className="mt-2 text-sm font-semibold">Ainda sem resumo de brechas</h2>
      <p className="text-xs text-muted-foreground mt-1">Peça à IA “atualiza as brechas” depois das análises de pontos fortes e fracos dos concorrentes.</p>
    </div>
  );
  const total = Object.keys(g.basedOn).length;
  const ranked = rankGaps(g.themes);
  const top = ranked.slice(0, 3);
  const withTask = g.themes.filter((t) => tasks.existing(t)).length;
  const stats: Stat[] = [
    { icon: Target, label: 'Brechas abertas', value: g.themes.length, sub: `tiradas de ${total} concorrentes analisados`, to: `${base}?v=temas` },
    { icon: ListChecks, label: 'Já viraram tarefa', value: <>{withTask}<span className="text-sm font-normal text-muted-foreground"> de {g.themes.length}</span></>, sub: withTask ? 'no quadro' : 'nenhuma ainda', to: `${base}?v=temas&f=sem-tarefa`, title: 'Abre as brechas que ainda não viraram tarefa' },
    ...(s ? [
      { icon: PackageX, label: 'Faltam no produto', value: s.lacunas.length, sub: 'metade ou mais dos concorrentes têm', to: `${base}?v=produto` },
      { icon: Gem, label: 'Só você tem', value: s.exclusivas.length, sub: s.raras.length ? `+ ${s.raras.length} que só 1 ou 2 têm` : 'ninguém mais tem', to: `${base}?v=produto` },
    ] : []),
  ];
  const kinds = (Object.keys(KIND) as Kind[]).map((k) => ({ k, n: g.themes.filter((t) => t.kind === k).length })).filter((x) => x.n);

  return (
    <div className="space-y-6">
      <StatStrip items={stats} />

      <section>
        <div className="flex items-baseline gap-3 mb-2.5">
          <h2 className="text-base font-semibold">Comece por aqui</h2>
          <p className="text-xs text-muted-foreground">As 3 brechas que mais concorrentes deixam abertas. Brecha = algo que eles não fazem ou fazem mal, tirado da análise de cada um.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {top.map((t, i) => {
            const cs = gapComps(t);
            const has = t.kind === 'produto' ? nosHas(mq.data, t) : null;
            const verb = gapVerb(t, has);
            const KI = KIND_ICON[t.kind];
            const VI = verb.icon;
            return (
              <article key={t.id} className="bg-card border border-border rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="grid place-items-center size-5 rounded-full bg-primary text-primary-foreground font-semibold tabular-nums">{i + 1}</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground"><KI className="size-3.5" strokeWidth={1.8} />{KIND[t.kind]}</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary-ink px-2 py-0.5 font-medium" title={verb.hint}><VI className="size-3" />{verb.label}</span>
                </div>
                <Link to={gapHref(slug, t.id)} className="mt-3 text-[15px] font-semibold leading-snug hover:text-primary-ink">{t.title}</Link>
                <p className="mt-1.5 text-[13px] text-muted-foreground leading-snug line-clamp-3" title={t.action}>{t.action}</p>
                <div className="mt-auto pt-4 flex items-end gap-3">
                  <GapMeter n={cs.length} total={total} className="w-24" />
                  <span className="ml-auto pb-0.5"><GapAvatars ids={cs} byId={byId} size={20} max={5} /></span>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
                  <GapTaskButton slug={slug} t={t} tasks={tasks} variant="primary" className="px-2.5 py-1.5 text-xs" />
                  <Link to={gapHref(slug, t.id)} className="ml-auto inline-flex items-center gap-1 text-xs text-primary-ink hover:underline">detalhes<ArrowRight className="size-3" /></Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-baseline gap-3 mb-2.5">
          <h2 className="text-base font-semibold">Brechas por área</h2>
          <p className="text-xs text-muted-foreground">Clique para ver só as de uma área.</p>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {kinds.map(({ k, n }) => {
            const I = KIND_ICON[k];
            const best = ranked.find((t) => t.kind === k)!;
            return (
              <button key={k} type="button" onClick={() => go('temas', { k })}
                className={cx('text-left bg-card border border-border rounded-xl p-3.5 transition hover:border-primary/40 hover:bg-muted/30')}>
                <span className="flex items-center gap-2 text-sm font-medium"><I className="size-4 text-muted-foreground" strokeWidth={1.8} />{KIND[k]}<b className="ml-auto text-lg tabular-nums">{n}</b></span>
                <span className="mt-1.5 block text-xs text-muted-foreground line-clamp-2">maior: {best.title}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
