// Panorama → você × mercado: brechas somadas por tema (intel/brechas.json) e o produto contra a matriz (intel/matriz.json).
// As contas da matriz seguem a mesma regra da Matriz de funcionalidades: tem = sim/parcial; coluna `_nos` = a própria empresa.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronRight, ListPlus, MessageSquare, Package, Tag, Target, TriangleAlert, Users, type LucideIcon } from 'lucide-react';
import type { GapTheme, Matrix } from '../../api';
import type { ModuleDataOf } from '../../../../schema/analysis';
import { NOS } from '../../../../schema/matrix';
import { useGaps, useMatrix } from '../../queries';
import { Avatar, Chips } from '../../components/competitors/lib';
import type { MarketRow } from '../../components/competitors/area';
import { useTaskActions } from '../../components/board/useTaskActions';
import { toast } from '../../components/toast';
import { cx } from '../../components/kit';

const POS = (s?: string) => s === 'sim' || s === 'parcial';
const KIND = { publico: 'Público', mensagem: 'Mensagem', oferta: 'Oferta', produto: 'Produto' } as const;
type Kind = keyof typeof KIND;

/** números do produto contra a matriz, só com os concorrentes ativos que estão nela */
export function useMatrixStats(slug: string, rows: MarketRow[]) {
  const mq = useMatrix(slug);
  return useMemo(() => {
    const m = mq.data;
    if (!m?.features.length) return null;
    const cols = rows.map((r) => r.c.data.id).filter((id) => m.cells[id]);
    if (!cols.length) return null;
    const st = (col: string, f: string) => m.cells[col]?.[f]?.status;
    const cov = (col: string) => m.features.reduce((n, f) => n + (st(col, f.id) === 'sim' ? 1 : st(col, f.id) === 'parcial' ? 0.5 : 0), 0) / m.features.length;
    const covs = cols.map(cov).sort((a, b) => a - b);
    const feats = m.features.map((f) => ({ f, have: cols.filter((c) => POS(st(c, f.id))).length, nos: st(NOS, f.id) }));
    return {
      m, n: cols.length,
      mine: cov(NOS),
      median: covs.length % 2 ? covs[(covs.length - 1) / 2] : (covs[covs.length / 2 - 1] + covs[covs.length / 2]) / 2,
      /** metade ou mais dos concorrentes têm e você não (ou ninguém confirmou) */
      lacunas: feats.filter((x) => x.have >= cols.length / 2 && !POS(x.nos)).sort((a, b) => b.have - a.have),
      /** você tem e nenhum concorrente tem */
      exclusivas: feats.filter((x) => POS(x.nos) && x.have === 0),
      /** você tem e no máximo 2 concorrentes têm */
      raras: feats.filter((x) => POS(x.nos) && x.have > 0 && x.have <= 2).sort((a, b) => a.have - b.have),
    };
  }, [mq.data, rows]);
}
export type MatrixStats = NonNullable<ReturnType<typeof useMatrixStats>>;

const pct = (v: number) => `${Math.round(v * 100)}%`;
export const coverageKpi = (s: MatrixStats | null) => s && {
  label: 'Cobertura de funcionalidades', value: `${pct(s.mine)} você`, sub: `mediana ${pct(s.median)}`,
  title: `De ${s.m.features.length} funcionalidades da matriz (tem = 1, parcial = ½), contra ${s.n} concorrentes.`,
};

/** você tem? a partir das funcionalidades ligadas ao tema */
function nosHas(m: Matrix | undefined, t: GapTheme) {
  if (!m || !t.features.length) return null;
  const s = t.features.map((f) => m.cells[NOS]?.[f]?.status);
  if (s.every(POS)) return { label: 'você tem', cls: 'text-success' };
  if (s.some(POS)) return { label: 'você tem em parte', cls: 'text-warning' };
  if (s.some((x) => x === 'nao')) return { label: 'você não tem', cls: 'text-destructive' };
  return { label: 'confirmar se você tem', cls: 'text-muted-foreground' };
}

/** `onTask`: quando vem, cada brecha ganha o botão "Virar tarefa"; devolve o id da tarefa criada (ou nada, se falhar) */
export function GapThemes({ slug, rows, onTask }: { slug: string; rows: MarketRow[]; onTask?: (t: GapTheme) => Promise<string | undefined> }) {
  const gq = useGaps(slug);
  const mq = useMatrix(slug);
  const [kind, setKind] = useState<'todas' | Kind>('todas');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [made, setMade] = useState<Record<string, string | "...">>({});
  const turn = async (t: GapTheme) => {
    if (!onTask || made[t.id]) return;
    setMade((m) => ({ ...m, [t.id]: "..." }));
    const id = await onTask(t);
    setMade((m) => { const n = { ...m }; if (id) n[t.id] = id; else delete n[t.id]; return n; });
  };
  const g = gq.data;
  const byId = useMemo(() => new Map(rows.map((r) => [r.c.data.id, r])), [rows]);
  // análises de pontos fortes e fracos feitas ou refeitas depois do resumo
  const stale = useMemo(() => !g ? [] : rows.filter((r) => {
    const at = r.res.forcas?.updatedAt;
    return at && (!g.basedOn[r.c.data.id] || at > g.basedOn[r.c.data.id]);
  }).map((r) => r.c.data.name), [g, rows]);
  if (!g?.themes.length) return null;
  const total = Object.keys(g.basedOn).length;
  const comps = (t: GapTheme) => [...new Set(t.sources.map((s) => s.competitor))];
  const themes = rankGaps(g.themes.filter((t) => kind === 'todas' || t.kind === kind));
  const toggle = (id: string) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <section className="bg-card border border-border rounded-xl">
      <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div>
          <h2 className="text-sm font-semibold">Brechas para nós</h2>
          <p className="text-xs text-muted-foreground">As brechas de {total} análises de pontos fortes e fracos, agrupadas por tema. Número = quantos concorrentes deixam a brecha aberta.</p>
        </div>
        <div className="ml-auto">
          <Chips value={kind} onChange={setKind} options={[
            { value: 'todas', label: 'Todas', count: g.themes.length },
            ...(Object.keys(KIND) as Kind[]).map((k) => ({ value: k, label: KIND[k], count: g.themes.filter((t) => t.kind === k).length })),
          ]} />
        </div>
      </div>
      {stale.length > 0 && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-md bg-warning/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 text-xs">
          <TriangleAlert className="size-3.5 shrink-0" />
          <span>Resumo de {new Date(g.updatedAt).toLocaleDateString('pt-BR')}. Análise nova ou refeita depois: {stale.join(', ')}. Peça à IA “atualiza as brechas”.</span>
        </div>
      )}
      <ul className="divide-y divide-border border-t border-border">
        {themes.map((t) => {
          const cs = comps(t);
          const has = nosHas(mq.data, t);
          const on = open.has(t.id);
          return (
            <li key={t.id} className="relative">
              <button type="button" onClick={() => toggle(t.id)} className={cx("w-full text-left px-4 py-2.5 hover:bg-muted/30 flex gap-3", onTask && "pr-36")}>
                <span className="w-14 shrink-0 pt-0.5">
                  <span className="block text-sm font-semibold tabular-nums">{cs.length}<span className="text-muted-foreground font-normal text-xs">/{total}</span></span>
                  <span className="mt-1 block h-1 rounded-full bg-muted overflow-hidden"><span className="block h-full bg-primary" style={{ width: `${(cs.length / total) * 100}%` }} /></span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {on ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
                    <span className="text-sm font-medium">{t.title}</span>
                    <span className="text-[11px] px-1.5 rounded bg-muted text-muted-foreground">{KIND[t.kind]}</span>
                    {has && <span className={cx('text-[11px] font-medium', has.cls)}>{has.label}</span>}
                  </span>
                  <span className="block text-[13px] text-muted-foreground leading-snug mt-0.5 pl-5">{t.action}</span>
                  {t.dependsOn && <span className="block text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 pl-5">depende de: {t.dependsOn}</span>}
                </span>
                <span className="hidden md:flex shrink-0 -space-x-1.5 pt-0.5">
                  {cs.slice(0, 6).map((id) => { const r = byId.get(id); return r ? <span key={id} title={r.c.data.name}><Avatar name={r.c.data.name} size={20} local={r.avatar.local} remote={r.avatar.remote} className="ring-2 ring-card" /></span> : null; })}
                </span>
              </button>
              {onTask && (
                <button type="button" disabled={!!made[t.id]} onClick={() => void turn(t)} title="Cria uma tarefa em Produto, em Backlog, para você aprovar"
                  className={cx("absolute right-4 top-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs", made[t.id] ? "border-transparent text-success" : "border-border bg-card hover:bg-muted")}>
                  {made[t.id] ? <><Check className="size-3.5" />{made[t.id] === "..." ? "Criando…" : `Criada ${made[t.id]}`}</> : <><ListPlus className="size-3.5" />Virar tarefa</>}
                </button>
              )}
              {on && (
                <ul className="px-4 pb-3 pl-[6.25rem] space-y-1">
                  {t.sources.map((s, i) => (
                    <li key={i} className="text-[13px] leading-snug">
                      <Link to={`/p/${slug}/concorrentes/${s.competitor}`} className="font-medium hover:text-primary-ink">{byId.get(s.competitor)?.c.data.name ?? s.competitor}</Link>
                      <span className="text-muted-foreground">: “{s.text}”</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** produto × mercado pela matriz: o que falta (a maioria tem) e o que é seu */
export function ProductVsMarket({ slug, s }: { slug: string; s: MatrixStats | null }) {
  if (!s) return null;
  const label = (st?: string) => st === 'nao' ? { t: 'não tem', c: 'text-destructive' } : st === 'planejado' ? { t: 'planejado', c: 'text-warning' } : { t: 'confirmar', c: 'text-muted-foreground' };
  const mat = (f: string) => `/p/${slug}/concorrentes/comparar?v=funcionalidades&f=${f}`;
  return (
    <section className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">Faltam no produto</h2>
          <span className="text-xs text-muted-foreground">metade ou mais têm</span>
          <Link to={mat('brecha')} className="ml-auto text-xs text-primary-ink">matriz →</Link>
        </div>
        {s.lacunas.length ? (
          <ul className="mt-1.5 space-y-1">
            {s.lacunas.map(({ f, have, nos }) => {
              const l = label(nos);
              return (
                <li key={f.id} className="flex items-center gap-2 text-[13px]" title={f.description}>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className={cx('text-[11px]', l.c)}>{l.t}</span>
                  <span className="w-10 text-right tabular-nums text-xs text-muted-foreground">{have}/{s.n}</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-xs text-muted-foreground mt-1">Nada: você tem tudo o que a maioria tem.</p>}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">Só você tem</h2>
          <Link to={mat('diferencial')} className="ml-auto text-xs text-primary-ink">matriz →</Link>
        </div>
        <ul className="mt-1.5 space-y-1">
          {s.exclusivas.map(({ f }) => <li key={f.id} className="flex items-center gap-2 text-[13px]" title={f.description}><span className="flex-1 truncate font-medium">{f.name}</span><span className="text-xs tabular-nums text-success">0/{s.n}</span></li>)}
          {s.raras.map(({ f, have }) => <li key={f.id} className="flex items-center gap-2 text-[13px]" title={f.description}><span className="flex-1 truncate">{f.name}</span><span className="text-xs tabular-nums text-muted-foreground">{have}/{s.n}</span></li>)}
        </ul>
        {s.raras.length > 0 && <p className="text-[11px] text-muted-foreground mt-1">Em negrito, ninguém mais tem; o resto, no máximo 2 concorrentes.</p>}
      </div>
    </section>
  );
}

// ---------- Panorama: card resumido + "virar tarefa" + frases por concorrente ----------

/** ordem de desempate: o que vira peça sem esperar o produto vem antes */
const KIND_RANK: Record<Kind, number> = { oferta: 0, mensagem: 1, publico: 2, produto: 3 };
const KIND_ICON: Record<Kind, LucideIcon> = { publico: Users, mensagem: MessageSquare, oferta: Tag, produto: Package };
export const gapComps = (t: GapTheme) => [...new Set(t.sources.map((s) => s.competitor))];
/** temas por nº de concorrentes distintos; empate: oferta > mensagem > público > produto */
export const rankGaps = (themes: GapTheme[]) => [...themes].sort((a, b) => gapComps(b).length - gapComps(a).length || KIND_RANK[a.kind] - KIND_RANK[b.kind]);

/** brecha → tarefa no quadro Produto, em Backlog (vira "A fazer" quando o Oliver aprovar); devolve o id criado */
export function useGapTask(slug: string, origem: string) {
  const tasks = useTaskActions(slug);
  return (t: GapTheme) => new Promise<string | undefined>((resolve) => {
    const names = gapComps(t);
    const body = `\n## Brecha\n${t.action}\n${t.dependsOn ? `\nDepende de: ${t.dependsOn}\n` : ''}\n## O que os concorrentes deixam aberto\n${t.sources.map((s) => `- ${s.competitor}: “${s.text}”`).join('\n')}\n\n## Checklist\n\n## Log\n- ${new Date().toISOString().slice(0, 10)} · criada a partir ${origem} (tema ${t.id}, ${names.length} concorrente(s))\n`;
    const { promise } = tasks.create({ title: t.title, board: 'produto', status: 'backlog', assignee: 'oliver', priority: 'media' }, body, {
      okMessage: false,
      onError: () => resolve(undefined),
    });
    promise.then((r) => { toast.ok(`Tarefa ${r.data.id} criada em Produto`); resolve(r.data.id); }, () => resolve(undefined));
  });
}

/** Panorama: as 5 maiores brechas, sempre à vista, com "→ tarefa" em cada linha e o produto × mercado em 2 números */
export function GapSummaryCard({ slug, rows, s, className }: { slug: string; rows: MarketRow[]; s: MatrixStats | null; className?: string }) {
  const gq = useGaps(slug);
  const mq = useMatrix(slug);
  const toTask = useGapTask(slug, 'do Panorama');
  const [made, setMade] = useState<Record<string, string>>({});
  const byId = useMemo(() => new Map(rows.map((r) => [r.c.data.id, r])), [rows]);
  const g = gq.data;
  const stale = useMemo(() => !g ? 0 : rows.filter((r) => { const at = r.res.forcas?.updatedAt; return at && (!g.basedOn[r.c.data.id] || at > g.basedOn[r.c.data.id]); }).length, [g, rows]);
  const page = `/p/${slug}/concorrentes/brechas`;
  if (gq.isLoading) return <section className={cx('bg-card border border-border rounded-xl h-64 animate-pulse', className)} />;
  if (!g?.themes.length) return (
    <section className={cx('bg-card border border-border rounded-xl p-4', className)}>
      <h2 className="text-sm font-semibold flex items-center gap-2"><Target className="size-4 text-primary-ink" />Brechas para nós</h2>
      <p className="text-xs text-muted-foreground mt-1">Ainda sem resumo. Peça à IA “atualiza as brechas” depois das análises de pontos fortes e fracos.</p>
    </section>
  );
  const total = Object.keys(g.basedOn).length;
  const top = rankGaps(g.themes).slice(0, 5);
  const turn = async (t: GapTheme) => {
    if (made[t.id]) return;
    setMade((m) => ({ ...m, [t.id]: '…' }));
    const id = await toTask(t);
    setMade((m) => { const n = { ...m }; if (id) n[t.id] = id; else delete n[t.id]; return n; });
  };
  return (
    <section className={cx('bg-card border border-border rounded-xl flex flex-col', className)}>
      <header className="px-4 pt-3.5 pb-2.5 flex items-center gap-2.5 border-b border-border">
        <span className="grid place-items-center size-7 rounded-md bg-primary-soft text-primary-ink shrink-0"><Target className="size-4" /></span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-tight">Brechas para nós</h2>
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">as {top.length} maiores de {g.themes.length} · atualizado em {new Date(g.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
        </div>
        <Link to={page} className="ml-auto text-xs text-primary-ink hover:underline whitespace-nowrap">ver todas →</Link>
      </header>
      <ol className="divide-y divide-border">
        {top.map((t) => {
          const cs = gapComps(t);
          const Icon = KIND_ICON[t.kind];
          const has = t.kind === 'produto' ? nosHas(mq.data, t) : null;
          const done = made[t.id];
          return (
            <li key={t.id} className="group px-4 py-2.5 hover:bg-muted/30">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-muted-foreground" title={KIND[t.kind]}><Icon className="size-4" strokeWidth={1.8} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <Link to={page} className="flex-1 text-[13px] font-medium leading-snug line-clamp-2 hover:text-primary-ink">{t.title}</Link>
                    <span className="shrink-0 flex items-center gap-1.5 pt-px" title={`${cs.length} de ${total} concorrentes deixam essa brecha aberta: ${cs.map((id) => byId.get(id)?.c.data.name ?? id).join(', ')}`}>
                      <span className="flex -space-x-1.5">
                        {cs.slice(0, 3).map((id) => { const r = byId.get(id); return r ? <Avatar key={id} name={r.c.data.name} size={18} local={r.avatar.local} remote={r.avatar.remote} className="ring-2 ring-card" /> : null; })}
                      </span>
                      <span className="text-xs font-semibold tabular-nums">{cs.length}<span className="font-normal text-muted-foreground">/{total}</span></span>
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="flex-1 min-w-0 truncate text-xs text-muted-foreground" title={t.action}>{t.action}</p>
                    {has && <span className={cx('shrink-0 text-[11px] font-medium', has.cls)}>{has.label}</span>}
                    <button type="button" disabled={!!done} onClick={() => void turn(t)} title="Cria uma tarefa em Produto, em Backlog, para você aprovar"
                      className={cx('shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition',
                        done ? 'text-success' : 'text-muted-foreground opacity-70 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-primary-soft hover:text-primary-ink')}>
                      {done ? <><Check className="size-3" />{done === '…' ? 'Criando…' : done}</> : <><ListPlus className="size-3" />tarefa</>}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <footer className="mt-auto px-4 py-2.5 border-t border-border bg-muted/30 rounded-b-xl text-xs flex items-center gap-2">
        {s ? (
          <Link to={page} className="flex items-center gap-1.5 hover:text-primary-ink" title={`Pela matriz: ${s.lacunas.length} funcionalidade(s) que metade ou mais dos concorrentes têm e você não; ${s.exclusivas.length} que só você tem.`}>
            <Package className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Produto:</span>
            <span><b className="tabular-nums text-destructive">{s.lacunas.length}</b> faltam</span>
            <span className="text-muted-foreground">·</span>
            <span><b className="tabular-nums text-success">{s.exclusivas.length}</b> só você tem</span>
          </Link>
        ) : <span className="text-muted-foreground">Produto × mercado: sem matriz</span>}
        {stale > 0 && <span className="ml-auto inline-flex items-center gap-1 text-amber-700 dark:text-amber-400" title={`${stale} análise(s) nova(s) ou refeita(s) depois do resumo. Peça à IA “atualiza as brechas”.`}><TriangleAlert className="size-3.5" />desatualizado</span>}
      </footer>
    </section>
  );
}

/** brechas de cada análise de pontos fortes e fracos, como vieram (o resumo por tema fica em GapThemes) */
export function GapsByCompetitor({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const list = rows.map((r) => ({ r, d: r.res.forcas?.data as ModuleDataOf<'forcas'> | undefined })).filter((x) => x.d?.opportunities.length);
  if (!list.length) return null;
  return (
    <details className="mt-5 group">
      <summary className="text-sm font-semibold mb-2 cursor-pointer select-none">Brechas por concorrente <span className="font-normal text-xs text-muted-foreground">as frases originais de {list.length} análise(s)</span></summary>
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
        {list.map(({ r, d }) => (
          <div key={r.c.data.id} className="break-inside-avoid mb-4 bg-card border border-border rounded-lg p-3">
            <Link to={`/p/${slug}/concorrentes/${r.c.data.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary-ink mb-1.5">
              <Avatar name={r.c.data.name} size={18} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />{r.c.data.name}
            </Link>
            <ul className="space-y-1 text-[13px] leading-snug">{d!.opportunities.map((o, i) => <li key={i} className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:size-1.5 before:rounded-full before:bg-primary/60">{o}</li>)}</ul>
          </div>
        ))}
      </div>
    </details>
  );
}
