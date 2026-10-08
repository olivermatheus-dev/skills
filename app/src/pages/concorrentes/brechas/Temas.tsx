// Brechas → Todas as brechas: lista à esquerda (rola por dentro, filtros à vista) e o detalhe da brecha escolhida à direita.
// URL: ?v=temas&k=<área>&f=sem-tarefa|com-tarefa&t=<tema>
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { GapTheme } from '../../../api';
import { NOS } from '../../../../../schema/matrix';
import { Avatar, Chips } from '../../../components/competitors/lib';
import type { MarketRow } from '../../../components/competitors/area';
import { FillBox } from '../../../components/fill';
import { cx } from '../../../components/kit';
import { useGaps, useMatrix } from '../../../queries';
import {
  GapAvatars, GapMeter, GapTaskButton, KIND, KIND_ICON, POS, gapComps, gapVerb, nosHas, rankGaps,
  type GapTasks, type Kind,
} from '../PanoramaBrechas';

type Filtro = 'todas' | 'sem-tarefa' | 'com-tarefa';

export default function Temas({ slug, rows, tasks }: { slug: string; rows: MarketRow[]; tasks: GapTasks }) {
  const gq = useGaps(slug);
  const mq = useMatrix(slug);
  const [sp, setSp] = useSearchParams();
  const g = gq.data;
  const byId = useMemo(() => new Map(rows.map((r) => [r.c.data.id, r])), [rows]);
  const kRaw = sp.get('k') ?? '';
  const kind = (Object.hasOwn(KIND, kRaw) ? kRaw : 'todas') as 'todas' | Kind;
  const fRaw = sp.get('f') ?? '';
  const filtro = (['sem-tarefa', 'com-tarefa'].includes(fRaw) ? fRaw : 'todas') as Filtro;
  const set = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) if (v == null) n.delete(k); else n.set(k, v);
    setSp(n, { replace: true });
  };

  if (gq.isLoading) return <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />;
  if (!g?.themes.length) return <p className="text-sm text-muted-foreground">Ainda sem resumo de brechas. Peça à IA “atualiza as brechas”.</p>;
  const total = Object.keys(g.basedOn).length;
  const byKind = g.themes.filter((t) => kind === 'todas' || t.kind === kind);
  const list = rankGaps(byKind.filter((t) => filtro === 'todas' || (filtro === 'sem-tarefa') === !tasks.existing(t)));
  const sel = list.find((t) => t.id === sp.get('t')) ?? list[0];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Chips value={kind} onChange={(x) => set({ k: x === 'todas' ? null : x, t: null })} options={[
          { value: 'todas', label: 'Todas as áreas', count: g.themes.length },
          ...(Object.keys(KIND) as Kind[]).map((k) => ({ value: k, label: KIND[k], count: g.themes.filter((t) => t.kind === k).length })),
        ]} />
        <Chips value={filtro} onChange={(x) => set({ f: x === 'todas' ? null : x, t: null })} options={[
          { value: 'todas', label: 'Todas' },
          { value: 'sem-tarefa', label: 'Sem tarefa', count: byKind.filter((t) => !tasks.existing(t)).length },
          { value: 'com-tarefa', label: 'Já viraram tarefa', count: byKind.filter((t) => tasks.existing(t)).length },
        ]} />
        <span className="ml-auto text-xs text-muted-foreground">Número = quantos dos {total} concorrentes analisados deixam a brecha aberta.</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
        <FillBox>
          {list.length ? (
            <ul className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {list.map((t) => {
                const cs = gapComps(t);
                const has = t.kind === 'produto' ? nosHas(mq.data, t) : null;
                const verb = gapVerb(t, has);
                const KI = KIND_ICON[t.kind];
                const task = tasks.existing(t);
                const on = sel?.id === t.id;
                return (
                  <li key={t.id}>
                    <button type="button" onClick={() => set({ t: t.id })} aria-current={on || undefined}
                      className={cx('w-full text-left px-3.5 py-3 flex gap-3 border-l-[3px] transition', on ? 'bg-primary-soft/60 border-l-primary' : 'border-l-transparent hover:bg-muted/40')}>
                      <GapMeter n={cs.length} total={total} className="w-14 shrink-0 pt-0.5" />
                      <span className="flex-1 min-w-0">
                        <span className={cx('block text-sm leading-snug', on ? 'font-semibold' : 'font-medium')}>{t.title}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><KI className="size-3" strokeWidth={1.8} />{KIND[t.kind]}</span>
                          <span className="font-medium text-foreground/80">{verb.label}</span>
                          {task && <span className="inline-flex items-center gap-0.5 text-success-ink"><CircleCheck className="size-3" />{task.id}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">Nenhuma brecha com esse filtro.</p>}
        </FillBox>
        <FillBox>
          {sel && <Detalhe slug={slug} t={sel} total={total} byId={byId} tasks={tasks} />}
        </FillBox>
      </div>
    </div>
  );
}

function Detalhe({ slug, t, total, byId, tasks }: { slug: string; t: GapTheme; total: number; byId: Map<string, MarketRow>; tasks: GapTasks }) {
  const mq = useMatrix(slug);
  const m = mq.data;
  const cs = gapComps(t);
  const has = t.kind === 'produto' ? nosHas(m, t) : null;
  const verb = gapVerb(t, has);
  const KI = KIND_ICON[t.kind];
  const VI = verb.icon;
  const feats = t.features.map((id) => ({ id, f: m?.features.find((x) => x.id === id), st: m?.cells[NOS]?.[id]?.status }));
  const stLabel = (st?: string) => POS(st) ? { t: st === 'parcial' ? 'em parte' : 'tem', c: st === 'parcial' ? 'text-warning-ink' : 'text-success-ink' }
    : st === 'nao' ? { t: 'não tem', c: 'text-destructive' } : st === 'planejado' ? { t: 'planejado', c: 'text-warning-ink' } : { t: 'confirmar', c: 'text-muted-foreground' };
  return (
    <article className="bg-card border border-border rounded-xl">
      <header className="p-5 pb-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground"><KI className="size-3.5" strokeWidth={1.8} />{KIND[t.kind]}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary-ink px-2 py-0.5 font-medium"><VI className="size-3.5" />{verb.label}</span>
          <span className="text-muted-foreground">{verb.hint}</span>
        </div>
        <h2 className="mt-2.5 text-lg font-semibold leading-snug">{t.title}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <GapMeter n={cs.length} total={total} className="w-24" />
          <span className="text-xs text-muted-foreground">concorrentes deixam aberto</span>
          <GapTaskButton slug={slug} t={t} tasks={tasks} variant="primary" className="ml-auto px-3 py-1.5 text-sm" />
        </div>
      </header>

      <div className="p-5 space-y-5">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">O que fazer</h3>
          <p className="mt-1.5 text-sm leading-relaxed">{t.action}</p>
          {t.dependsOn && (
            <p className="mt-2 flex items-start gap-1.5 rounded-md bg-warning/10 text-amber-700 dark:text-amber-400 px-2.5 py-1.5 text-xs">
              <TriangleAlert className="size-3.5 shrink-0 mt-px" /><span><b className="font-medium">Antes, precisa de:</b> {t.dependsOn}</span>
            </p>
          )}
        </section>

        {feats.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Você tem? <span className={cx('normal-case tracking-normal font-medium', has?.cls)}>{has?.label}</span></h3>
            <ul className="mt-1.5 space-y-1">
              {feats.map(({ id, f, st }) => {
                const l = stLabel(st);
                return (
                  <li key={id} className="flex items-center gap-2 text-[13px]" title={f?.description}>
                    <span className="flex-1 truncate">{f?.name ?? id}</span>
                    <span className={cx('text-xs font-medium', l.c)}>{l.t}</span>
                  </li>
                );
              })}
            </ul>
            <Link to={`/p/${slug}/concorrentes/comparar?v=funcionalidades`} className="mt-1.5 inline-block text-xs text-primary-ink hover:underline">ver na matriz →</Link>
          </section>
        )}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">Quem deixa aberto <GapAvatars ids={cs} byId={byId} size={18} max={8} /></h3>
          <ul className="mt-2 space-y-2.5">
            {t.sources.map((s, i) => {
              const r = byId.get(s.competitor);
              return (
                <li key={i} className="flex gap-2.5">
                  {r ? <Avatar name={r.c.data.name} size={24} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0 shrink-0" /> : <span className="size-6 shrink-0" />}
                  <div className="min-w-0 text-[13px] leading-snug">
                    <Link to={`/p/${slug}/concorrentes/${s.competitor}`} className="font-medium hover:text-primary-ink">{r?.c.data.name ?? s.competitor}</Link>
                    <p className="text-muted-foreground">“{s.text}”</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground"><Info className="size-3 shrink-0 mt-px" />Frases da análise de pontos fortes e fracos de cada concorrente.</p>
        </section>
      </div>
    </article>
  );
}
