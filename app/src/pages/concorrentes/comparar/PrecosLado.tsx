// Comparar > Preços > Lado a lado: colunas = planos, linhas = preço, para quem, limites, funcionalidades (matriz), o que inclui, extras e condições.
// Padrão = o plano equivalente de cada concorrente (cobre o pacote Kzloo, DESENHO 3.4) ao lado da Kzloo. ?s= equiv|entrada|topo|custom · ?sel= planos escolhidos.
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, CircleDot, ExternalLink, ListChecks, Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Matrix } from '../../../../../schema/matrix';
import { useFillHeight } from '../../../components/competitors/area';
import { Chips } from '../../../components/competitors/lib';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cx } from '../../../components/kit';
import {
  BANDS, COMMIT_LABEL, PACOTE, PAY_LABEL, bandOf, brl, coverOf, dmy, equivalents, hasMatrix, limitText, perSeat, planCell, realCost, seatsText, statsOf, valueOf,
  type Lens, type PlanCell, type PlanRow,
} from './precosLib';
import { BandChip, PriceTag, Who, dash } from './precosUi';

type Mode = 'equiv' | 'entrada' | 'topo' | 'custom';
const COL_W = 'w-[190px] min-w-[190px] max-w-[190px]';
const NAME_W = 'w-[190px] min-w-[190px] max-w-[190px]';

interface RowDef { keep?: boolean; id: string; label: ReactNode; title?: string; cells: ReactNode[]; sig: string[]; tint?: (string | undefined)[] }
interface GroupDef { id: string; label: string; rows: RowDef[]; counts?: (string | undefined)[] }

export default function Lado({ slug, pr, m, lens }: { slug: string; pr: PlanRow[]; m: Matrix | undefined; lens: Lens }) {
  const [sp, setSp] = useSearchParams();
  const mode: Mode = (['equiv', 'entrada', 'topo', 'custom'] as const).find((x) => x === sp.get('s')) ?? 'equiv';
  const selKeys = (sp.get('sel') ?? '').split(',').filter(Boolean);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [vsKz, setVsKz] = useState(false);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [boxRef, boxH] = useFillHeight();
  const setMode = (s: Mode, sel?: string[]) => { const n = new URLSearchParams(sp); if (s === 'equiv') n.delete('s'); else n.set('s', s); if (sel?.length) n.set('sel', sel.join(',')); else n.delete('sel'); setSp(n, { replace: true }); };

  const kz = pr.find((p) => p.isRef);
  const comp = pr.filter((p) => !p.isRef);
  const eq = useMemo(() => equivalents(pr, m, lens), [pr, m, lens]);
  const stats = useMemo(() => statsOf(pr, { cycle: 'mensal', promo: lens.promo }), [pr, lens.promo]);
  const cols = useMemo<PlanRow[]>(() => {
    const solo = comp.filter((p) => p.paid && p.audience === 'solo');
    const by = new Map<string, PlanRow[]>();
    for (const p of solo) by.set(p.compId, [...(by.get(p.compId) ?? []), p]);
    const val = (p: PlanRow) => valueOf(p, { ...lens, cycle: 'mensal' }) ?? Infinity;
    let list: PlanRow[];
    if (mode === 'custom' && selKeys.length) list = selKeys.map((k) => comp.find((p) => p.key === k)).filter((p): p is PlanRow => !!p);
    else if (mode === 'entrada') list = [...by.values()].map((ps) => [...ps].sort((a, b) => val(a) - val(b))[0]);
    else if (mode === 'topo') list = [...by.values()].map((ps) => [...ps].sort((a, b) => val(b) - val(a))[0]);
    else list = [...eq.values()].map((x) => x.p);
    list = [...list].sort((a, b) => val(a) - val(b));
    return kz ? [kz, ...list] : list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pr, mode, sp, eq, lens.promo]);

  const grid = useMemo(() => buildGroups(cols, m, lens, stats.cuts, eq), [cols, m, lens, stats.cuts, eq]);
  const noMatrix = cols.filter((p) => !hasMatrix(p) && !p.isRef).length;
  const toggle = (g: string) => setClosed((s) => { const n = new Set(s); if (n.has(g)) n.delete(g); else n.add(g); return n; });
  const kzIdx = cols.findIndex((c) => c.isRef);

  const picked = new Set(cols.filter((c) => !c.isRef).map((c) => c.key));
  const pick = (key: string) => { const n = new Set(picked); if (n.has(key)) n.delete(key); else n.add(key); setMode('custom', [...n]); };
  const byComp = useMemo(() => { const g = new Map<string, PlanRow[]>(); for (const p of comp) g.set(p.compId, [...(g.get(p.compId) ?? []), p]); return [...g.values()].sort((a, b) => a[0].comp.localeCompare(b[0].comp, 'pt-BR')); }, [pr]);

  const empty = (r: RowDef) => r.sig.every((x) => x === '') && !r.keep;
  const showRow = (r: RowDef) => !empty(r) && (!onlyDiff || new Set(r.sig).size > 1);
  const hiddenRows = grid.reduce((n, g) => n + g.rows.filter(empty).length, 0);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Chips value={mode} onChange={(x) => setMode(x, x === 'custom' ? [...picked] : undefined)} options={[
          { value: 'equiv', label: 'Equivalentes' }, { value: 'entrada', label: 'Entradas' }, { value: 'topo', label: 'Topos' }, { value: 'custom', label: 'Escolher' },
        ]} />
        <Popover>
          <PopoverTrigger asChild><Button size="sm" variant="outline"><ListChecks /> Planos <span className="tabular-nums text-muted-foreground">{picked.size}</span></Button></PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-0">
            <div className="border-b border-border px-3 py-2 text-xs font-medium">Escolher planos para comparar</div>
            <div className="max-h-96 overflow-auto p-1">
              {byComp.map((ps) => (
                <div key={ps[0].compId} className="px-1 py-1">
                  <div className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{ps[0].comp}</div>
                  {ps.map((p) => (
                    <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted">
                      <Checkbox checked={picked.has(p.key)} onCheckedChange={() => pick(p.key)} />
                      <span className="truncate">{p.plan.name}</span>
                      {p.audience === 'equipe' && <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">equipe</span>}
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">{p.free ? 'grátis' : p.monthly != null ? brl(p.monthly) : 'consulta'}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs"><Switch checked={onlyDiff} onCheckedChange={setOnlyDiff} />Só diferenças</label>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs" title="Verde: o plano tem e a Kzloo não. Vermelho: a Kzloo tem e o plano não."><Switch checked={vsKz} onCheckedChange={setVsKz} />Comparar com a Kzloo</label>
        <Button size="sm" variant="outline" onClick={() => setClosed(closed.size ? new Set() : new Set(grid.map((g) => g.id)))}>{closed.size ? 'Abrir grupos' : 'Recolher grupos'}</Button>
        <span className="text-xs text-muted-foreground">
          {mode === 'equiv' ? 'Plano solo mais barato que cobre o pacote Kzloo (8 itens).' : mode === 'entrada' ? 'Menor plano solo pago de cada um.' : mode === 'topo' ? 'Maior plano solo pago de cada um.' : 'Seleção manual.'}
          {hiddenRows > 0 && ` ${hiddenRows} linhas sem nenhum dado escondidas.`}
          {noMatrix > 0 && ` ${noMatrix} sem matriz por plano ainda (re-coleta em andamento): equivalente = plano de entrada.`}
        </span>
      </div>

      <div ref={boxRef} style={{ height: boxH }} className="overflow-auto rounded-xl border border-border bg-card">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className={cx('sticky left-0 top-0 z-30 border-b border-r border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground align-bottom', NAME_W)}>
                {cols.length} planos<div className="font-normal">1 profissional · {lens.cycle === 'anual' ? 'anual eq.' : 'mensal'}</div>
              </th>
              {cols.map((p) => {
                const cov = coverOf(p, m), b = (() => { const v = valueOf(p, { ...lens, cycle: 'mensal' }); return v && stats.cuts ? bandOf(v, stats.cuts) : undefined; })();
                return (
                  <th key={p.key} className={cx('sticky top-0 z-20 border-b border-border px-3 py-2 text-left align-top font-normal', COL_W, p.isRef ? 'bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))]' : 'bg-card')}>
                    <Who slug={slug} p={p} size={18} />
                    <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">{p.plan.name}{p.plan.recommended && <Star className="size-3 fill-warning text-warning" />}{p.audience === 'equipe' && <span className="rounded bg-muted px-1 text-[10px]">equipe</span>}</div>
                    <div className="mt-1"><PriceTag p={p} lens={lens} big /></div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {!p.free && !p.onRequest && <BandChip b={b} />}
                      {mode === 'equiv' && !p.isRef && (cov.known
                        ? <span className={cx('rounded px-1.5 py-0.5 text-[11px]', cov.sim + cov.parcial / 2 >= PACOTE.length ? 'bg-success/15 text-success-ink' : 'bg-muted text-muted-foreground')} title={`Dos ${PACOTE.length} itens do pacote Kzloo, ${cov.sim} completos${cov.parcial ? ` e ${cov.parcial} em parte` : ''}`}>cobre {cov.sim} de {PACOTE.length}{cov.parcial ? ` · ${cov.parcial} em parte` : ''}</span>
                        : <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground" title="matriz por plano ainda não coletada: mostrando o plano de entrada">pacote não conferido</span>)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grid.map((g) => {
              const rows = g.rows.filter(showRow);
              if (!rows.length) return null;
              const open = !closed.has(g.id);
              return (
                <Fragment key={g.id}>
                  <tr className="cursor-pointer" onClick={() => toggle(g.id)}>
                    <td className="sticky left-0 z-10 border-b border-r border-border bg-muted px-3 py-1.5 text-xs font-semibold">
                      <span className="inline-flex items-center gap-1">{open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}{g.label}</span>
                    </td>
                    {cols.map((p, i) => <td key={p.key} className="border-b border-border bg-muted px-3 py-1.5 text-[11px] tabular-nums text-muted-foreground">{g.counts?.[i]}</td>)}
                  </tr>
                  {open && rows.map((r) => (
                    <tr key={r.id} className="group">
                      <td className={cx('sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-1.5 align-top text-[13px] group-hover:bg-muted', NAME_W)} title={r.title}>{r.label}</td>
                      {r.cells.map((c, i) => {
                        const t = vsKz && cols[i] && !cols[i].isRef && kzIdx >= 0 ? r.tint?.[i] : undefined;
                        return <td key={cols[i].key} className={cx('border-b border-border px-3 py-1.5 align-top text-[13px] group-hover:bg-muted/40', COL_W, cols[i].isRef && 'bg-primary/5', t === 'plus' && 'bg-emerald-500/15', t === 'minus' && 'bg-red-500/15')}>{c}</td>;
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
            <tr aria-hidden className="h-full"><td colSpan={cols.length + 1} className="p-0" /></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Comparação justa: 1 profissional, mesmo ciclo, promoção marcada. “—” = o site não informa (ou não coletado). Ícone cinza claro = vem da matriz do concorrente, não do plano. Kzloo a {brl(kz?.monthly)} sem somar extras por uso.
      </p>
    </div>
  );
}

// ---------- células ----------
const MUTED = (t: string, title?: string) => <span className="text-muted-foreground" title={title}>{t}</span>;
function CellIcon({ c }: { c: PlanCell }) {
  const faint = !c.exact;
  const title = `${c.st === 'sim' ? 'Tem' : c.st === 'parcial' ? 'Parcial' : c.st === 'planejado' ? 'Planejado' : c.st === 'nao' ? 'Não tem' : 'Não sei'}${c.note ? `: ${c.note}` : ''}${faint ? ' (da matriz do concorrente, não do plano)' : ''}`;
  if (c.st === 'sim') return <span title={title} className={cx('inline-flex items-center gap-1', faint && 'opacity-45')}><Check className="size-4 text-success-ink" strokeWidth={3} />{c.note && <span className="truncate text-[11px] text-muted-foreground">{c.note}</span>}</span>;
  if (c.st === 'parcial') return <span title={title} className={cx('inline-flex items-center gap-1', faint && 'opacity-45')}><CircleDot className="size-4 text-warning-ink" />{c.note && <span className="truncate text-[11px] text-muted-foreground">{c.note}</span>}</span>;
  if (c.st === 'planejado') return <span title={title} className="text-[11px] text-warning-ink">planejado</span>;
  return <span title={title} className="text-muted-foreground/40">—</span>;
}
const pos = (c: PlanCell) => c.st === 'sim' || c.st === 'parcial';
const num = (v?: number | null) => (v == null ? undefined : v.toLocaleString('pt-BR'));
const list = (xs: string[], max = 6) => xs.length ? <ul className="list-disc space-y-0.5 pl-4 text-[12px] leading-snug">{xs.slice(0, max).map((x, i) => <li key={i}>{x}</li>)}{xs.length > max && <li className="list-none -ml-4 text-muted-foreground" title={xs.slice(max).join('\n')}>+{xs.length - max} itens</li>}</ul> : null;

function buildGroups(cols: PlanRow[], m: Matrix | undefined, lens: Lens, _cuts: unknown, eq: ReturnType<typeof equivalents>): GroupDef[] {
  const clean = (x?: string) => (x == null || x === 'undefined' || x === 'null' || x === 'NaN' ? '' : x);
  const same = (f: (p: PlanRow) => string | undefined) => cols.map((p) => clean(f(p)));
  const R = (id: string, label: ReactNode, f: (p: PlanRow) => ReactNode, sig: (p: PlanRow) => string | undefined, title?: string, keep?: boolean): RowDef => ({ id, label, title, keep, cells: cols.map(f), sig: same(sig) });
  const mensal = (p: PlanRow) => valueOf(p, { ...lens, cycle: 'mensal' });
  const kzOnly = (p: PlanRow, f: () => ReactNode) => p.isRef ? f() : null;

  // ---- preço
  const preco: GroupDef = { id: 'preco', label: 'Preço', rows: [
    R('mensal', 'Mensal', (p) => <PriceTag p={p} lens={lens} />, (p) => String(mensal(p)), undefined, true),
    R('anual', 'Anual eq. por mês', (p) => p.yearly != null ? <b className="tabular-nums">{brl(p.yearly)}</b> : p.isRef ? MUTED('a definir', 'trimestral/anual: % a definir (BUSINESS)') : dash, (p) => String(p.yearly), undefined, true),
    R('total', 'Total anual', (p) => p.plan.yearlyTotal != null ? brl(p.plan.yearlyTotal) : dash, (p) => String(p.plan.yearlyTotal)),
    R('desc', 'Desconto no anual', (p) => p.monthly && p.yearly != null && p.yearly < p.monthly ? `${Math.round((1 - p.yearly / p.monthly) * 100)}%` : dash, (p) => String(p.monthly && p.yearly != null ? Math.round((1 - p.yearly / p.monthly) * 100) : '')),
    R('outros', 'Outros ciclos', (p) => p.plan.otherCycles.length ? <div className="space-y-0.5 text-[12px]">{p.plan.otherCycles.map((c) => <div key={c.cycle}>{c.cycle}: {brl(c.total)}{c.perMonth != null && <span className="text-muted-foreground"> ({brl(c.perMonth)}/mês)</span>}</div>)}</div> : dash, (p) => p.plan.otherCycles.map((c) => `${c.cycle}${c.total}`).join()),
    R('padrao', 'Ciclo que o site mostra primeiro', (p) => p.data?.pageDefaultCycle ? <span className={cx(p.data.pageDefaultCycle === 'anual' && 'font-medium text-warning-ink')} title={p.data.pageDefaultCycle === 'anual' ? 'A vitrine mostra o preço do anual: cuidado ao comparar com o mensal de outro' : undefined}>{p.data.pageDefaultCycle}</span> : dash, (p) => p.data?.pageDefaultCycle ?? undefined),
    R('promo', 'Promoção', (p) => p.plan.promo ? <div className="text-[12px]"><span className="line-clamp-3" title={p.plan.promo.label}>{p.plan.promo.label}</span>{p.plan.promo.until && <div className="text-muted-foreground">até {dmy(p.plan.promo.until)}</div>}</div> : p.regular && p.monthly && p.regular > p.monthly ? <span className="text-[12px]">cheio {brl(p.regular)}</span> : dash, (p) => p.plan.promo?.label ?? (p.regular && p.monthly && p.regular > p.monthly ? String(p.regular) : undefined)),
    R('dia', 'R$ por dia', (p) => p.monthly ? brl(p.monthly / 30) : dash, (p) => String(p.monthly ? p.monthly / 30 : '')),
    R('custo', 'Custo real por mês', (p) => {
      const c = realCost(p, m, lens);
      if (c.total == null) return dash;
      return (
        <div className="space-y-0.5">
          <div><b className="tabular-nums">{brl(c.total)}</b></div>
          {c.added.length > 0 && <div className="text-[11px] text-muted-foreground">+ {c.added.join(' + ')}</div>}
          {c.unknown.length > 0 && <div className="text-[11px] text-warning-ink">+ {c.unknown.join(', ')} (preço não informado)</div>}
          {c.perUse.length > 0 && (
            <Tooltip><TooltipTrigger asChild>
              <div className="w-fit cursor-help text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2">+ {c.perUse.length === 1 ? '1 extra por uso' : `${c.perUse.length} extras por uso`} (não somados)</div>
            </TooltipTrigger><TooltipContent className="max-w-80"><ul className="space-y-0.5">{c.perUse.map((x) => <li key={x}>{x}</li>)}</ul></TooltipContent></Tooltip>
          )}
          {!p.isRef && !c.added.length && !c.unknown.length && !c.perUse.length && <div className="text-[11px] text-muted-foreground">= preço do plano</div>}
          {p.isRef && <div className="text-[11px] text-muted-foreground">sem extras por uso</div>}
        </div>
      );
    }, (p) => String(realCost(p, m, lens).total), 'preço do plano + add-ons fixos necessários para o pacote; por uso aparece só como nota', true),
  ] };

  // ---- para quem
  const quem: GroupDef = { id: 'quem', label: 'Para quem', rows: [
    R('seats', 'Profissionais', (p) => { const s = seatsText(p); return s ? <span title={p.audienceInferred ? 'solo/equipe inferido do nome' : undefined}>{s}</span> : p.isRef ? '1' : dash; }, (p) => seatsText(p) ?? (p.isRef ? '1' : undefined)),
    R('extra', 'Assento extra', (p) => p.plan.seats?.extraPrice != null ? brl(p.plan.seats.extraPrice) : dash, (p) => String(p.plan.seats?.extraPrice)),
    R('seat', 'Por profissional', (p) => { const v = perSeat(p, { ...lens, cycle: 'mensal' }); return v != null ? brl(v) : dash; }, (p) => String(perSeat(p, { ...lens, cycle: 'mensal' }))),
    R('staff', 'Secretária / atendente', (p) => p.plan.seats?.staff != null ? `${p.plan.seats.staff} incluída` : dash, (p) => String(p.plan.seats?.staff)),
  ] };

  // ---- limites
  const metrics = new Map<string, string>();
  for (const p of cols) for (const l of p.plan.limits) metrics.set(l.metric === 'outro' ? `outro:${l.note ?? ''}` : l.metric, l.metric === 'outro' ? l.note ?? 'outro' : l.metric);
  const labelOf = (k: string) => { const t = k.startsWith('outro:') ? k.slice(6) || 'outros' : ({ pacientes: 'Pacientes', sessoes: 'Sessões', profissionais: 'Profissionais', 'whatsapp-msgs': 'Mensagens de WhatsApp', 'video-min': 'Minutos de vídeo', 'video-sessoes': 'Sessões de vídeo', 'ia-creditos': 'Créditos de IA', nf: 'Notas fiscais', cobrancas: 'Cobranças', 'armazenamento-gb': 'Armazenamento (GB)', relatorios: 'Relatórios' } as Record<string, string>)[k] ?? k; return t; };
  const findLim = (p: PlanRow, k: string) => p.plan.limits.find((l) => (l.metric === 'outro' ? `outro:${l.note ?? ''}` : l.metric) === k);
  const limites: GroupDef = { id: 'limites', label: 'Limites', rows: [...metrics.keys()].map((k) => R(`lim-${k}`, labelOf(k),
    (p) => { if (p.isRef) return MUTED('a definir'); const l = findLim(p, k); return l ? <span title={l.note ?? undefined}>{l.unlimited ? 'ilimitado' : num(l.value) ?? l.note}{!l.unlimited && l.period ? <span className="text-muted-foreground"> {l.period === 'mes' ? '/mês' : l.period === 'ano' ? '/ano' : l.period === 'trimestre' ? '/trim.' : ''}</span> : null}</span> : <span className="text-muted-foreground/60" title="sem limite informado (não é o mesmo que ilimitado)">—</span>; },
    (p) => { const l = findLim(p, k); return l ? limitText(l) : undefined; })) };
  if (!limites.rows.length) limites.rows.push({ keep: true, id: 'lim-vazio', label: MUTED('Limites'), cells: cols.map((p) => p.isRef ? MUTED('a definir') : dash), sig: cols.map(() => '') });

  // ---- funcionalidades (matriz)
  const feats: GroupDef[] = [];
  if (m) {
    const kzi = cols.findIndex((c) => c.isRef);
    for (const g of m.groups) {
      const fs = m.features.filter((f) => f.group === g).sort((a, b) => a.order - b.order);
      const cells = (fid: string) => cols.map((p) => planCell(p, fid, m));
      const shown = fs.filter((f) => cells(f.id).some(pos));
      if (!shown.length) continue;
      feats.push({
        id: `m-${g}`, label: g, counts: cols.map((p) => { const n = fs.filter((f) => pos(planCell(p, f.id, m))).length; return `${n}/${fs.length}`; }),
        rows: shown.map((f) => {
          const cs = cells(f.id);
          return { id: `f-${f.id}`, label: f.name, title: f.description, cells: cs.map((c) => <CellIcon c={c} />), sig: cs.map((c) => (pos(c) ? c.st : '')),
            tint: cs.map((c, i) => kzi < 0 ? undefined : pos(c) && !pos(cs[kzi]) ? 'plus' : !pos(c) && pos(cs[kzi]) ? 'minus' : undefined) };
        }),
      });
    }
  }

  // ---- inclui (texto do site)
  const inc = (p: PlanRow) => p.plan.includes.length ? p.plan.includes : p.plan.highlights;
  const inclui: GroupDef = { id: 'inclui', label: 'Inclui (texto do site)', rows: [
    R('includes', 'Lista do plano', (p) => p.isRef ? MUTED('—') : inc(p).length ? <div>{list(inc(p), 8)}{!p.plan.includes.length && <div className="mt-0.5 text-[10px] text-muted-foreground">só os destaques do site: lista completa não coletada</div>}{p.plan.inherits && <div className="mt-0.5 text-[10px] text-muted-foreground">tudo do plano “{p.plan.inherits}”</div>}</div> : dash, (p) => inc(p).join('|')),
  ] };

  // ---- extras
  const addOnsOf = (p: PlanRow) => (p.data?.addOns ?? []).filter((a) => !a.planIds.length || (p.plan.id != null && a.planIds.includes(p.plan.id)));
  const extras: GroupDef = { id: 'extras', label: 'Extras pagos', rows: [
    R('addons', 'Add-ons e taxas', (p) => {
      if (p.isRef) return MUTED('sem extras por uso', 'decisão de 2026-10-08');
      const a = addOnsOf(p);
      if (a.length) return <ul className="space-y-0.5 text-[12px]">{a.slice(0, 3).map((x) => <li key={x.name}>{x.name}: {x.price != null ? <><b>{`${x.price.toLocaleString('pt-BR', { minimumFractionDigits: x.price % 1 ? 2 : 0 })}${x.unit === 'percentual' ? '%' : ''}`}</b><span className="text-muted-foreground"> {x.unit === 'por-uso' ? `por ${x.per ?? 'uso'}` : x.unit === 'mes' ? '/mês' : x.unit === 'unico' ? 'único' : x.per ? `por ${x.per}` : ''}</span></> : <span className="text-muted-foreground">preço não publicado</span>}</li>)}{a.length > 3 && <li className="text-muted-foreground" title={a.slice(3).map((x) => `${x.name}: ${x.price ?? 'preço não publicado'}`).join('\n')}>+{a.length - 3} outros</li>}</ul>;
      const t = p.data?.extras ?? [];
      return t.length ? <div title="observações do site sobre cobranças, sem preço estruturado">{list(t, 3)}<div className="text-[10px] text-muted-foreground">observações do site</div></div> : dash;
    }, (p) => p.isRef ? '' : addOnsOf(p).map((x) => `${x.name}${x.price}`).join() || (p.data?.extras ?? []).join()),
  ] };

  // ---- condições
  const cond: GroupDef = { id: 'cond', label: 'Condições', rows: [
    R('trial', 'Teste grátis', (p) => { if (p.isRef) return MUTED('sem teste (acesso por aprovação)'); const d = p.data; if (!d) return dash; if (d.trialDays) return <span>{d.trialDays} dias{d.trialNeedsCard === false ? ', sem cartão' : d.trialNeedsCard ? ', pede cartão' : ''}{d.trialPlanId && d.plans.length > 1 && <div className="text-[11px] text-muted-foreground">do plano {d.plans.find((x) => x.id === d.trialPlanId)?.name ?? d.trialPlanId}</div>}</span>; return d.trial ? <span className="text-[12px]">{d.trial}</span> : MUTED('sem teste informado'); }, (p) => p.isRef ? 'sem' : p.data?.trialDays ? `${p.data.trialDays}${p.data.trialNeedsCard}` : p.data?.trial ?? undefined),
    R('refund', 'Garantia / reembolso', (p) => { if (p.isRef) return MUTED('a definir'); const d = p.data; if (!d) return dash; if (d.refundDays) return <span>{d.refundDays} dias{d.refundScope && <div className="text-[11px] text-muted-foreground">{d.refundScope}</div>}</span>; return d.guarantee ? <span className="text-[12px]">{d.guarantee}</span> : dash; }, (p) => p.isRef ? 'a definir' : p.data?.refundDays ? String(p.data.refundDays) : p.data?.guarantee ?? undefined),
    R('commit', 'Fidelidade', (p) => p.data?.commitment ? COMMIT_LABEL[p.data.commitment] : dash, (p) => p.data?.commitment ?? undefined),
    R('pay', 'Formas de pagamento', (p) => p.data?.paymentMethods?.length ? p.data.paymentMethods.map((x) => PAY_LABEL[x]).join(', ') : dash, (p) => p.data?.paymentMethods?.join()),
  ] };

  // ---- fonte
  const fonte: GroupDef = { id: 'fonte', label: 'Fonte', rows: [
    R('src', 'Onde e quando', (p) => {
      if (p.isRef) return <span className="text-[12px] text-muted-foreground">Contexto (BUSINESS, COPY) · preço a validar</span>;
      const res = p.row.res.precos; const s = res?.sources?.[0];
      return (
        <div className="space-y-0.5 text-[12px]">
          {s ? <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-ink hover:underline"><ExternalLink className="size-3" />{(() => { try { return new URL(s.url).hostname.replace(/^www\./, ''); } catch { return 'fonte'; } })()}</a> : dash}
          <div className="text-muted-foreground">{dmy(res?.updatedAt)} · confiança {res?.confidence ?? '—'}</div>
          {p.data?.checkedPages?.length ? <div className="text-muted-foreground">{p.data.checkedPages.length} páginas conferidas</div> : null}
        </div>
      );
    }, (p) => p.row.res.precos?.sources?.[0]?.url),
  ] };

  void kzOnly; void eq;
  return [preco, quem, limites, ...feats, inclui, extras, cond, fonte];
}
