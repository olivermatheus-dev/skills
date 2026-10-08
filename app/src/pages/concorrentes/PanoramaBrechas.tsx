// Brechas: a base comum da página Brechas (pages/concorrentes/brechas/*) e do card do Panorama (GapSummaryCard).
// Brechas somadas por tema vêm de intel/brechas.json; o produto contra a matriz, de intel/matriz.json.
// As contas da matriz seguem a mesma regra da Matriz de funcionalidades: tem = sim/parcial; coluna `_nos` = a própria empresa.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Hammer, ListPlus, Megaphone, MessageSquare, Package, Search, Tag, Target, TriangleAlert, Users, type LucideIcon } from 'lucide-react';
import type { GapTheme, Gaps, Matrix } from '../../api';
import { NOS } from '../../../../schema/matrix';
import { useGaps, useMatrix, useTasks } from '../../queries';
import { Avatar, Spinner } from '../../components/competitors/lib';
import type { MarketRow } from '../../components/competitors/area';
import { useTaskActions } from '../../components/board/useTaskActions';
import { toast } from '../../components/toast';
import { cx } from '../../components/kit';

export const POS = (s?: string) => s === 'sim' || s === 'parcial';
/** as áreas de brecha como perguntas simples (o tipo no JSON continua público/mensagem/oferta/produto) */
export const KIND = { publico: 'Para quem falar', mensagem: 'O que dizer', oferta: 'Como vender', produto: 'Produto' } as const;
export type Kind = keyof typeof KIND;
export const KIND_ICON: Record<Kind, LucideIcon> = { publico: Users, mensagem: MessageSquare, oferta: Tag, produto: Package };

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

export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const coverageKpi = (s: MatrixStats | null) => s && {
  label: 'Cobertura de funcionalidades', value: `${pct(s.mine)} você`, sub: `mediana ${pct(s.median)}`,
  title: `De ${s.m.features.length} funcionalidades da matriz (tem = 1, parcial = ½), contra ${s.n} concorrentes.`,
};

export type Has = { key: 'tem' | 'parte' | 'nao' | 'confirmar'; label: string; cls: string };
/** você tem? a partir das funcionalidades ligadas ao tema */
export function nosHas(m: Matrix | undefined, t: GapTheme): Has | null {
  if (!m || !t.features.length) return null;
  const s = t.features.map((f) => m.cells[NOS]?.[f]?.status);
  if (s.every(POS)) return { key: 'tem', label: 'você tem', cls: 'text-success-ink' };
  if (s.some(POS)) return { key: 'parte', label: 'você tem em parte', cls: 'text-warning-ink' };
  if (s.some((x) => x === 'nao')) return { key: 'nao', label: 'você não tem', cls: 'text-destructive' };
  return { key: 'confirmar', label: 'confirmar se você tem', cls: 'text-muted-foreground' };
}

/** o verbo da brecha: o que a Kzloo faz com ela (produto que já tem = comunicar; que falta = construir) */
export function gapVerb(t: GapTheme, has: Has | null): { label: string; icon: LucideIcon; hint: string } {
  if (t.kind === 'oferta') return { label: 'Ajustar a oferta', icon: Tag, hint: 'preço, plano, teste ou garantia (LP e anúncios)' };
  if (t.kind === 'produto') {
    if (has?.key === 'tem') return { label: 'Comunicar', icon: Megaphone, hint: 'você já tem: falta mostrar' };
    if (has?.key === 'confirmar' || !has) return { label: 'Confirmar se tem', icon: Search, hint: 'a matriz ainda não diz se você tem' };
    return { label: 'Construir', icon: Hammer, hint: has.key === 'parte' ? 'você tem só uma parte' : 'você ainda não tem' };
  }
  return { label: 'Comunicar', icon: Megaphone, hint: 'LP, anúncios e posts' };
}

/** análises de pontos fortes e fracos feitas ou refeitas depois do resumo das brechas */
export function staleNames(g: Gaps | null | undefined, rows: MarketRow[]) {
  if (!g) return [];
  return rows.filter((r) => {
    const at = r.res.forcas?.updatedAt;
    return at && (!g.basedOn[r.c.data.id] || at > g.basedOn[r.c.data.id]);
  }).map((r) => r.c.data.name);
}

/** ordem de desempate: o que vira peça sem esperar o produto vem antes */
const KIND_RANK: Record<Kind, number> = { oferta: 0, mensagem: 1, publico: 2, produto: 3 };
export const gapComps = (t: GapTheme) => [...new Set(t.sources.map((s) => s.competitor))];
/** temas por nº de concorrentes distintos; empate: oferta > mensagem > público > produto */
export const rankGaps = (themes: GapTheme[]) => [...themes].sort((a, b) => gapComps(b).length - gapComps(a).length || KIND_RANK[a.kind] - KIND_RANK[b.kind]);
/** link para uma brecha aberta na sub-aba "Todas as brechas" */
export const gapHref = (slug: string, id?: string) => `/p/${slug}/concorrentes/brechas?v=temas${id ? `&t=${id}` : ''}`;

/** quadro de cada tipo de brecha (DASHBOARD 039 §2): produto → Produto · oferta → Vendas (LP, anúncio) · mensagem e público → Conteúdo */
export const GAP_BOARD = { produto: 'produto', oferta: 'vendas', mensagem: 'conteudo', publico: 'conteudo' } as const;
export const BOARD_NAME = { produto: 'Produto', vendas: 'Vendas', conteudo: 'Conteúdo' } as const;
/** o marcador gravado no corpo da tarefa; o formato antigo "(tema <id>," do Log também vale */
const gapMarker = (id: string) => `Tema da brecha: ${id}`;
const MARK_RE = /Tema da brecha: (\S+)|\(tema (\S+?),/g;

export type GapTasks = ReturnType<typeof useGapTask>;
/**
 * brecha → tarefa no quadro certo, em Backlog (vira "A fazer" quando o Oliver aprovar). Antes de criar procura no quadro uma tarefa
 * com o marcador do tema (vale depois de recarregar e entre telas): se existir, devolve o id dela e não duplica.
 */
export function useGapTask(slug: string, origem: string) {
  const tasks = useTaskActions(slug);
  const tq = useTasks(slug);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const index = useMemo(() => {
    const m = new Map<string, { id: string; board: string; status: string }>();
    for (const d of tq.data ?? []) for (const x of d.body.matchAll(MARK_RE)) m.set(x[1] ?? x[2], { id: d.data.id, board: d.data.board, status: d.data.status });
    return m;
  }, [tq.data]);
  const create = (t: GapTheme) => new Promise<string | undefined>((resolve) => {
    const prior = index.get(t.id);
    if (prior) return resolve(prior.id);
    const board = GAP_BOARD[t.kind];
    const names = gapComps(t);
    const body = `\n${gapMarker(t.id)}\n\n## Brecha\n${t.action}\n${t.dependsOn ? `\nDepende de: ${t.dependsOn}\n` : ''}\n## O que os concorrentes deixam aberto\n${t.sources.map((s) => `- ${s.competitor}: “${s.text}”`).join('\n')}\n\n## Checklist\n\n## Log\n- ${new Date().toISOString().slice(0, 10)} · criada a partir ${origem} (tema ${t.id}, ${names.length} concorrente(s))\n`;
    setBusy((b) => new Set(b).add(t.id));
    const done = () => setBusy((b) => { const n = new Set(b); n.delete(t.id); return n; });
    const { promise } = tasks.create({ title: t.title, board, status: 'backlog', assignee: 'oliver', priority: 'media' }, body, {
      okMessage: false,
      onError: () => { done(); resolve(undefined); },
    });
    promise.then((r) => { done(); toast.ok(`Tarefa ${r.data.id} criada em ${BOARD_NAME[board]}`); resolve(r.data.id); }, () => { done(); resolve(undefined); });
  });
  return { create, existing: (t: GapTheme) => index.get(t.id), creating: (t: GapTheme) => busy.has(t.id), loading: tq.isLoading };
}

/**
 * "Virar tarefa" → "Criando…" → "Ver T-NNNN" (link para o quadro).
 * `variant`: compact = rótulo curto do card do Panorama · outline = botão de linha · primary = a ação principal do detalhe.
 */
export function GapTaskButton({ slug, t, tasks, className, variant = 'outline' }: { slug: string; t: GapTheme; tasks: GapTasks; className?: string; variant?: 'compact' | 'outline' | 'primary' }) {
  const have = tasks.existing(t);
  const board = BOARD_NAME[GAP_BOARD[t.kind]];
  const compact = variant === 'compact';
  if (tasks.creating(t)) return <span className={cx('inline-flex items-center gap-1 text-muted-foreground', className)}><Spinner />Criando…</span>;
  if (have) {
    return (
      <Link to={`/p/${slug}/quadro?quadro=${have.board}&t=${have.id}`} onClick={(e) => e.stopPropagation()} title={`Já existe a tarefa ${have.id} para esta brecha (quadro ${BOARD_NAME[have.board as keyof typeof BOARD_NAME] ?? have.board})`}
        className={cx('inline-flex items-center gap-1 rounded-md font-medium text-primary-ink hover:underline', className)}>
        <ArrowUpRight className={compact ? 'size-3' : 'size-3.5'} />Ver {have.id}
      </Link>
    );
  }
  return (
    <button type="button" disabled={tasks.loading} onClick={(e) => { e.stopPropagation(); void tasks.create(t); }} title={`Cria uma tarefa no quadro ${board}, em Backlog, para você aprovar`}
      className={cx('inline-flex items-center gap-1.5 disabled:opacity-50', {
        compact: 'rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground opacity-70 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-primary-soft hover:text-primary-ink transition',
        outline: 'rounded-md border border-border bg-card hover:bg-muted',
        primary: 'rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-sm',
      }[variant], className)}>
      <ListPlus className={compact ? 'size-3' : 'size-4'} />{compact ? 'tarefa' : `Virar tarefa em ${board}`}
    </button>
  );
}

/** avatares dos concorrentes de uma brecha (máx. `max`) */
export function GapAvatars({ ids, byId, size = 20, max = 6, more = true }: { ids: string[]; byId: Map<string, MarketRow>; size?: number; max?: number; more?: boolean }) {
  return (
    <span className="flex -space-x-1.5">
      {ids.slice(0, max).map((id) => { const r = byId.get(id); return r ? <span key={id} title={r.c.data.name}><Avatar name={r.c.data.name} size={size} local={r.avatar.local} remote={r.avatar.remote} className="ring-2 ring-card" /></span> : null; })}
      {more && ids.length > max && <span className="grid place-items-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-card tabular-nums" style={{ width: size, height: size }}>+{ids.length - max}</span>}
    </span>
  );
}

/** "7 de 11" com barra: quantos concorrentes deixam a brecha aberta */
export function GapMeter({ n, total, className }: { n: number; total: number; className?: string }) {
  return (
    <span className={cx('block', className)} title={`${n} de ${total} concorrentes analisados deixam essa brecha aberta`}>
      <span className="block leading-none"><b className="text-lg font-semibold tabular-nums">{n}</b><span className="text-xs text-muted-foreground"> de {total}</span></span>
      <span className="mt-1.5 block h-1 rounded-full bg-muted overflow-hidden"><span className="block h-full bg-primary rounded-full" style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></span>
    </span>
  );
}

// ---------- Panorama: card resumido ----------

/** Panorama: as 5 maiores brechas, sempre à vista, com "→ tarefa" em cada linha e o produto × mercado em 2 números */
export function GapSummaryCard({ slug, rows, s, className }: { slug: string; rows: MarketRow[]; s: MatrixStats | null; className?: string }) {
  const gq = useGaps(slug);
  const mq = useMatrix(slug);
  const tasks = useGapTask(slug, 'do Panorama');
  const byId = useMemo(() => new Map(rows.map((r) => [r.c.data.id, r])), [rows]);
  const g = gq.data;
  const stale = useMemo(() => staleNames(g, rows).length, [g, rows]);
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
          return (
            <li key={t.id} className="group px-4 py-2.5 hover:bg-muted/30">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-muted-foreground" title={KIND[t.kind]}><Icon className="size-4" strokeWidth={1.8} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <Link to={gapHref(slug, t.id)} className="flex-1 text-[13px] font-medium leading-snug line-clamp-2 hover:text-primary-ink">{t.title}</Link>
                    <span className="shrink-0 flex items-center gap-1.5 pt-px" title={`${cs.length} de ${total} concorrentes deixam essa brecha aberta: ${cs.map((id) => byId.get(id)?.c.data.name ?? id).join(', ')}`}>
                      <GapAvatars ids={cs} byId={byId} size={18} max={3} more={false} />
                      <span className="text-xs font-semibold tabular-nums">{cs.length}<span className="font-normal text-muted-foreground">/{total}</span></span>
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="flex-1 min-w-0 truncate text-xs text-muted-foreground" title={t.action}>{t.action}</p>
                    {has && <span className={cx('shrink-0 text-[11px] font-medium', has.cls)}>{has.label}</span>}
                    <span className="shrink-0"><GapTaskButton slug={slug} t={t} tasks={tasks} variant="compact" /></span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <footer className="mt-auto px-4 py-2.5 border-t border-border bg-muted/30 rounded-b-xl text-xs flex items-center gap-2">
        {s ? (
          <Link to={`${page}?v=produto`} className="flex items-center gap-1.5 hover:text-primary-ink" title={`Pela matriz: ${s.lacunas.length} funcionalidade(s) que metade ou mais dos concorrentes têm e você não; ${s.exclusivas.length} que só você tem.`}>
            <Package className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Produto:</span>
            <span><b className="tabular-nums text-destructive">{s.lacunas.length}</b> faltam</span>
            <span className="text-muted-foreground">·</span>
            <span><b className="tabular-nums text-success-ink">{s.exclusivas.length}</b> só você tem</span>
          </Link>
        ) : <span className="text-muted-foreground">Produto × mercado: sem matriz</span>}
        {stale > 0 && <span className="ml-auto inline-flex items-center gap-1 text-amber-700 dark:text-amber-400" title={`${stale} análise(s) nova(s) ou refeita(s) depois do resumo. Peça à IA “atualiza as brechas”.`}><TriangleAlert className="size-3.5" />desatualizado</span>}
      </footer>
    </section>
  );
}
