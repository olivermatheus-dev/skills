// Comparar > Preços > Régua: faixa de números, régua (cada plano é um ponto sobre as faixas de preço calculadas), tabela de planos e resumo por faixa.
import { useMemo, useState } from 'react';
import { Crown, Gift, Percent, Plus, Scale, Star, Tag, TrendingUp } from 'lucide-react';
import { FillBox, SortTable, StatStrip, type Col, type Stat } from '../../../components/competitors/area';
import { Chips } from '../../../components/competitors/lib';
import { Link } from 'react-router-dom';
import type { Matrix } from '../../../../../schema/matrix';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cx } from '../../../components/kit';
import {
  BANDS, bandOf, brl, discount, featureCount, hasMatrix, limitText, median, perSeat, planCell, seatsText, statsOf, valueOf,
  type Band, type Cuts, type Lens, type PlanRow,
} from './precosLib';
import { BAND_CLS, BandChip, PriceTag, Who, bandLabel, dash } from './precosUi';

const AXIS = 200;
type Base = 'solo' | 'equipe' | 'todos';
type Ord = 'entrada' | 'topo' | 'nome';
const pct = (v: number) => `${Math.min(100, Math.max(0, (v / AXIS) * 100))}%`;

export default function Regua({ slug, pr, m, lens, onOpen }: { slug: string; pr: PlanRow[]; m: Matrix | undefined; lens: Lens; onOpen: (key: string) => void }) {
  const [base, setBase] = useState<Base>('solo');
  const [ord, setOrd] = useState<Ord>('entrada');
  const [low, setLow] = useState<'planos' | 'faixas'>('planos');
  const st = useMemo(() => statsOf(pr, lens), [pr, lens]);
  const kz = pr.find((p) => p.isRef);
  const cuts = st.cuts;
  const band = (p: PlanRow): Band | undefined => { const v = valueOf(p, lens); return v != null && v > 0 && cuts ? bandOf(v, cuts) : undefined; };
  const inBase = (p: PlanRow) => !p.isRef && (base === 'todos' || p.audience === base);

  const topSoloMed = median(st.top);
  const kzBand = kz && cuts ? bandOf(kz.monthly!, cuts) : undefined;
  const cyc = lens.cycle === 'anual' ? ' (anual eq.)' : '';
  const stats: Stat[] = [
    { label: 'Entrada mediana', icon: Tag, value: st.entry.length ? brl(median(st.entry)) : '—', sub: `${st.entry.length} concorrentes${cyc}`, title: `Mediana do menor plano solo pago de cada concorrente (${st.entry.length}). Média: ${brl(st.entry.length ? st.entry.reduce((a, b) => a + b, 0) / st.entry.length : undefined)}.` },
    { label: 'Plano solo mediano', icon: Scale, value: brl(st.med), sub: `média ${brl(st.mean)} · ${cuts?.n ?? 0} planos`, title: 'Mediana de todos os planos solo pagos (1 profissional). Os quartis desta amostra definem as faixas da régua.' },
    { label: 'Topo solo mediano', icon: TrendingUp, value: brl(topSoloMed), sub: `${st.top.length} concorrentes${cyc}`, title: 'Mediana do plano solo mais caro de cada concorrente.' },
    { label: 'Desconto anual mediano', icon: Percent, value: st.discounts.length ? `${Math.round(median(st.discounts)!)}%` : '—', sub: `${st.discounts.length} de ${new Set(pr.filter((p) => !p.isRef).map((p) => p.compId)).size} têm anual`, title: 'Derivado: 1 − anual equivalente ÷ mensal, média por concorrente e depois a mediana. Quem não tem anual não entra (nunca se usa o mensal no lugar).' },
    { label: 'Teste grátis', icon: Gift, value: `${st.trial.n}/${st.trial.of}`, sub: `${st.trial.free} com plano grátis para sempre`, title: 'Concorrentes com teste grátis declarado sobre os que têm preço coletado.' },
    kz && kz.monthly != null ? {
      label: 'Kzloo', icon: Crown, value: brl(kz.monthly),
      sub: kzBand && topSoloMed ? `${bandLabel(kzBand)} · ${kz.monthly >= topSoloMed ? '+' : ''}${Math.round((kz.monthly / topSoloMed - 1) * 100)}% vs topo solo` : 'sem comparação',
      title: 'Preço de referência da copy (R$ 129/mês, sem somar extras por uso). Faixa e % calculados contra a amostra acima, no ciclo mensal.',
    } : { label: 'Kzloo', icon: Crown, value: '—', sub: 'sem preço de referência' },
  ];
  if (lens.cycle === 'anual' && stats[5].value !== '—') stats[5] = { ...stats[5], sub: 'anual ainda a definir', title: 'A Kzloo não tem ciclo anual definido (BUSINESS: % a definir).' };

  // ---- régua ----
  const comps = useMemo(() => {
    const by = new Map<string, PlanRow[]>();
    for (const p of pr) if (inBase(p) && p.paid && valueOf(p, lens) != null) by.set(p.compId, [...(by.get(p.compId) ?? []), p]);
    const list = [...by.values()].map((ps) => ps.sort((a, b) => valueOf(a, lens)! - valueOf(b, lens)!));
    const key = (ps: PlanRow[]) => (ord === 'topo' ? valueOf(ps[ps.length - 1], lens)! : ord === 'nome' ? 0 : valueOf(ps[0], lens)!);
    return list.sort((a, b) => (ord === 'nome' ? a[0].comp.localeCompare(b[0].comp, 'pt-BR') : key(a) - key(b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pr, lens, base, ord]);
  const freeBy = new Set(pr.filter((p) => p.free).map((p) => p.compId));
  const missing = [...new Set(pr.filter((p) => !p.isRef).map((p) => p.compId))].filter((id) => !comps.some((c) => c[0].compId === id));

  return (
    <div className="space-y-4">
      <StatStrip items={stats} />

      <section className="bg-card border border-border rounded-xl px-4 pt-3 pb-3">
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="text-sm font-semibold">Onde cada plano cai</h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">Base
            <Chips value={base} onChange={setBase} options={[{ value: 'solo', label: 'Solo' }, { value: 'equipe', label: 'Equipe' }, { value: 'todos', label: 'Todos' }]} />
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">Ordem
            <Chips value={ord} onChange={setOrd} options={[{ value: 'entrada', label: 'Entrada' }, { value: 'topo', label: 'Topo' }, { value: 'nome', label: 'Nome' }]} />
          </span>
          <span className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><i className="size-2.5 rounded-full bg-foreground" />solo</span>
            <span className="inline-flex items-center gap-1"><i className="size-2.5 rounded-full border-2 border-foreground" />equipe</span>
            <span className="inline-flex items-center gap-1"><i className="size-3 rounded-full ring-2 ring-primary ring-offset-1 ring-offset-card bg-foreground" />recomendado</span>
            <span className="inline-flex items-center gap-1"><i className="h-3 w-px border-l border-dashed border-foreground/60" />média</span>
          </span>
        </div>
        <Ruler slug={slug} comps={comps} kz={kz} cuts={cuts} mean={st.mean} lens={lens} band={band} onOpen={onOpen} />
        {(freeBy.size > 0 || missing.length > 0) && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {freeBy.size > 0 && <>Plano grátis fora da régua: {[...freeBy].map((id) => pr.find((p) => p.compId === id)!.comp).join(', ')}. </>}
            {missing.length > 0 && <>Sem plano {base === 'todos' ? '' : base} com preço nesta lente: {missing.map((id) => pr.find((p) => p.compId === id)!.comp).join(', ')}.</>}
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Chips value={low} onChange={setLow} options={[{ value: 'planos', label: 'Planos' }, { value: 'faixas', label: 'Por faixa' }]} />
        {low === 'planos' && <span className="text-xs text-muted-foreground">Clique no plano para abri-lo no Lado a lado.</span>}
        {low === 'faixas' && cuts && <span className="text-xs text-muted-foreground">Cortes: {brl(cuts.q1)} · {brl(cuts.med)} · {brl(cuts.q3)} (quartis de {cuts.n} planos solo pagos)</span>}
      </div>
      {low === 'planos' && <Tabela slug={slug} pr={pr} m={m} lens={lens} base={base} band={band} onOpen={onOpen} />}
      {low === 'faixas' && <PorFaixa pr={pr.filter((p) => !p.isRef && p.paid && p.audience === 'solo')} m={m} lens={lens} cuts={cuts} band={band} />}
    </div>
  );
}

// ---------- régua ----------
const LABEL_W = 168;
function Ruler({ slug, comps, kz, cuts, mean, lens, band, onOpen }: {
  slug: string; comps: PlanRow[][]; kz?: PlanRow; cuts?: Cuts; mean?: number; lens: Lens; band: (p: PlanRow) => Band | undefined; onOpen: (key: string) => void;
}) {
  if (!comps.length) return <p className="py-6 text-center text-sm text-muted-foreground">Nenhum plano com preço nesta combinação.</p>;
  const marks = cuts ? [0, cuts.q1, cuts.med, cuts.q3, AXIS] : [0, AXIS];
  const kzOn = kz?.monthly != null && lens.cycle === 'mensal';
  return (
    <div className="select-none">
      {/* cabeçalho: nome das faixas sobre cada intervalo */}
      <div className="flex text-[10px] text-muted-foreground" style={{ paddingLeft: LABEL_W }}>
        <div className="relative h-8 flex-1 mr-3">
          {cuts && BANDS.map((b, i) => (
            <div key={b.id} className="absolute top-0 flex h-full flex-col items-center justify-end overflow-hidden whitespace-nowrap pb-0.5 leading-tight" style={{ left: pct(marks[i]), width: `${(Math.min(marks[i + 1], AXIS) - marks[i]) / AXIS * 100}%` }}>
              <b className="w-full truncate text-center font-semibold text-foreground/70">{b.label}</b>
              <span className="w-full truncate text-center tabular-nums">{i === 0 ? `< ${brl(cuts.q1)}` : i === 3 ? `> ${brl(cuts.q3)}` : `${brl(marks[i])} a ${brl(marks[i + 1])}`}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative">
        {/* fundo: faixas, linhas de mediana e média, grade */}
        <div className="pointer-events-none absolute inset-y-0 right-3" style={{ left: LABEL_W }}>
          {cuts && BANDS.map((b, i) => (
            <div key={b.id} className="absolute inset-y-0" style={{ left: pct(marks[i]), width: `${(Math.min(marks[i + 1], AXIS) - marks[i]) / AXIS * 100}%`, background: `color-mix(in oklab, var(--foreground) ${3 + i * 3.5}%, transparent)` }} />
          ))}
          {cuts && <div className="absolute inset-y-0 w-px bg-foreground/50" style={{ left: pct(cuts.med) }} title={`mediana ${brl(cuts.med)}`} />}
          {mean != null && <div className="absolute inset-y-0 border-l border-dashed border-foreground/60" style={{ left: pct(mean) }} title={`média ${brl(mean)}`} />}
          {kzOn && <div className="absolute inset-y-0 w-px bg-primary/70" style={{ left: pct(kz!.monthly!) }} />}
        </div>
        {kz && (
          <div className="relative flex h-8 items-center border-b border-primary/30">
            <div className="shrink-0 truncate pr-2" style={{ width: LABEL_W }}><Who slug={slug} p={kz} size={18} /></div>
            <div className="relative mr-3 h-full flex-1">
              {kzOn ? (
                <>
                  <Tooltip><TooltipTrigger asChild>
                    <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] bg-primary ring-2 ring-card" style={{ left: pct(kz.monthly!) }} />
                  </TooltipTrigger><TooltipContent>Kzloo: {brl(kz.monthly)}/mês (preço da copy; a validar). {band(kz) ? `Faixa ${bandLabel(band(kz)!)}.` : ''}</TooltipContent></Tooltip>
                  <span className="absolute top-1/2 -translate-y-1/2 pl-3 text-[11px] font-semibold text-primary-ink whitespace-nowrap" style={{ left: pct(kz.monthly!) }}>{brl(kz.monthly)}{band(kz) ? ` · ${bandLabel(band(kz)!)}` : ''}</span>
                </>
              ) : <span className="absolute inset-y-0 left-2 flex items-center text-[11px] text-muted-foreground">anual ainda a definir</span>}
            </div>
          </div>
        )}
        {comps.map((ps) => {
          const lo = valueOf(ps[0], lens)!, hi = valueOf(ps[ps.length - 1], lens)!;
          return (
            <div key={ps[0].compId} className="relative flex h-7 items-center border-b border-border/40 last:border-0">
              <div className="shrink-0 truncate pr-2 text-[13px]" style={{ width: LABEL_W }}><Who slug={slug} p={ps[0]} size={18} /></div>
              <div className="relative mr-3 h-full flex-1">
                {ps.length > 1 && <span className="absolute top-1/2 h-px -translate-y-1/2 bg-foreground/35" style={{ left: pct(lo), width: `${(Math.min(hi, AXIS) - lo) / AXIS * 100}%` }} />}
                {ps.map((p) => <Dot key={p.key} p={p} lens={lens} band={band(p)} onOpen={onOpen} />)}
              </div>
            </div>
          );
        })}
      </div>
      {/* eixo */}
      <div className="flex" style={{ paddingLeft: LABEL_W }}>
        <div className="relative mr-3 h-4 flex-1 text-[10px] text-muted-foreground tabular-nums">
          {[0, 50, 100, 150, 200].map((t) => <span key={t} className={cx('absolute top-0.5', t === 0 ? '' : t === AXIS ? '-translate-x-full' : '-translate-x-1/2')} style={{ left: pct(t) }}>{t === AXIS ? 'R$ 200' : t}</span>)}
        </div>
      </div>
    </div>
  );
}

function Dot({ p, lens, band, onOpen }: { p: PlanRow; lens: Lens; band?: Band; onOpen: (key: string) => void }) {
  const v = valueOf(p, lens)!;
  const over = v > AXIS;
  const inc = p.plan.includes.length ? p.plan.includes : p.plan.highlights;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" onClick={() => onOpen(p.key)} aria-label={`${p.comp} ${p.plan.name} ${brl(v)}`}
          className={cx('absolute top-1/2 -translate-y-1/2 outline-none', over ? '-translate-x-full pl-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums text-foreground' : '-translate-x-1/2 size-3 rounded-full transition hover:scale-125 focus-visible:ring-2 focus-visible:ring-primary',
            !over && (p.audience === 'equipe' ? 'border-2 border-foreground bg-card' : 'bg-foreground'), p.plan.recommended && !over && 'ring-2 ring-primary ring-offset-1 ring-offset-card')}
          style={{ left: over ? '100%' : pct(v) }}>
          {over && <>{brl(v)} →</>}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 space-y-1 text-left">
        <div className="font-semibold">{p.comp} · {p.plan.name}{p.plan.recommended && ' ★'}</div>
        <div className="tabular-nums">{brl(p.monthly)}/mês{p.regular && p.regular > (p.monthly ?? 0) ? ` (cheio ${brl(p.regular)})` : ''}{p.yearly != null ? ` · anual eq. ${brl(p.yearly)}` : ''}</div>
        <div className="opacity-80">{band ? `Faixa ${bandLabel(band)} · ` : ''}{seatsText(p) ?? 'para quem: não coletado'}{p.audienceInferred ? ' (inferido)' : ''}</div>
        {inc.length > 0 && <ul className="list-disc pl-4 opacity-90">{inc.slice(0, 3).map((x) => <li key={x}>{x}</li>)}</ul>}
        {p.plan.limits.length > 0 && <div className="opacity-80">{p.plan.limits.slice(0, 3).map(limitText).join(' · ')}</div>}
        <div className="opacity-60">fonte: {p.data ? 'site do concorrente' : ''} · {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('pt-BR') : '—'}</div>
      </TooltipContent>
    </Tooltip>
  );
}

// ---------- tabela de planos ----------
function Tabela({ slug, pr, m, lens, base, band, onOpen }: { slug: string; pr: PlanRow[]; m: Matrix | undefined; lens: Lens; base: Base; band: (p: PlanRow) => Band | undefined; onOpen: (key: string) => void }) {
  const [fb, setFb] = useState<'todas' | Band>('todas');
  const kz = pr.filter((p) => p.isRef);
  const rows = pr.filter((p) => !p.isRef && (base === 'todos' || p.audience === base) && (fb === 'todas' || band(p) === fb));
  const total = m?.features.length ?? 0;
  const addOnsOf = (p: PlanRow) => (p.data.addOns ?? []).filter((a) => !a.planIds.length || (p.plan.id != null && a.planIds.includes(p.plan.id)));
  const cols: Col<PlanRow>[] = [
    { k: 'comp', label: 'Concorrente', v: (p) => p.comp, className: 'min-w-40', render: (p) => <Who slug={slug} p={p} /> },
    { k: 'plan', label: 'Plano', v: (p) => p.plan.name, className: 'min-w-36', render: (p) => (
      p.isRef ? <span className="font-medium">{p.plan.name}</span> :
      <button type="button" onClick={() => onOpen(p.key)} className="inline-flex items-center gap-1 text-left font-medium hover:text-primary-ink">{p.plan.name}{p.plan.recommended && <Star className="size-3 fill-warning text-warning" />}</button>) },
    { k: 'band', label: 'Faixa', v: (p) => { const b = band(p); return b ? BANDS.findIndex((x) => x.id === b) : undefined; }, render: (p) => p.free ? <span className="text-xs text-muted-foreground">Grátis</span> : <BandChip b={band(p)} /> },
    { k: 'who', label: 'Para quem', v: (p) => seatsText(p), className: 'max-w-44', render: (p) => { const s = seatsText(p); return s ? <span className="block truncate text-xs" title={`${s}${p.audienceInferred ? ' (equipe/solo inferido do nome)' : ''}`}>{s}{p.audience === 'equipe' && <span className="ml-1 rounded bg-muted px-1 text-[10px] text-muted-foreground">equipe</span>}</span> : dash; } },
    { k: 'monthly', label: 'Mensal', num: true, v: (p) => valueOf(p, { ...lens, cycle: 'mensal' }), render: (p) => <PriceTag p={p} lens={lens} compact /> },
    { k: 'yearly', label: 'Anual eq.', num: true, title: 'preço mensal equivalente no plano anual', v: (p) => p.yearly, render: (p) => (p.yearly != null ? brl(p.yearly) : p.isRef ? <span className="text-xs text-muted-foreground" title="trimestral/anual: % a definir">a definir</span> : dash) },
    { k: 'disc', label: 'Desc.', num: true, title: 'desconto do anual sobre o mensal (derivado)', v: (p) => discount(p), render: (p) => { const d = discount(p); return d != null ? `${d}%` : dash; } },
    { k: 'day', label: 'R$/dia', num: true, v: (p) => (p.monthly ? p.monthly / 30 : undefined), render: (p) => (p.monthly ? brl(p.monthly / 30) : dash) },
    { k: 'lim', label: 'Limites', render: (p) => p.plan.limits.length ? (
      <span className="flex max-w-56 flex-wrap gap-1">{p.plan.limits.slice(0, 2).map((l, i) => <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] whitespace-nowrap">{limitText(l)}</span>)}{p.plan.limits.length > 2 && <span className="text-[11px] text-muted-foreground" title={p.plan.limits.map(limitText).join('\n')}>+{p.plan.limits.length - 2}</span>}</span>
    ) : <span className="text-muted-foreground" title="sem limite informado ou não coletado">—</span> },
    { k: 'feat', label: 'Funcionalidades', num: true, title: 'funcionalidades da matriz que o plano tem (sim ou parcial)', v: (p) => (hasMatrix(p) ? featureCount(p, m) : undefined), render: (p) => (hasMatrix(p) ? <span className="tabular-nums">{featureCount(p, m)}<span className="text-muted-foreground">/{total}</span></span> : <span className="text-muted-foreground" title="matriz por plano ainda não coletada">—</span>) },
    { k: 'add', label: 'Extras', render: (p) => { const a = addOnsOf(p); return a.length ? (
      <Tooltip><TooltipTrigger asChild><span className="inline-flex items-center gap-0.5 text-xs text-warning-ink"><Plus className="size-3" />{a.length}</span></TooltipTrigger>
        <TooltipContent className="space-y-0.5">{a.map((x) => <div key={x.name}>{x.name}: {x.price != null ? `${x.price.toLocaleString('pt-BR')}${x.unit === 'percentual' ? '%' : ''}${x.unit === 'por-uso' ? ` por ${x.per ?? 'uso'}` : x.unit === 'mes' ? '/mês' : ''}` : 'preço não informado'}</div>)}</TooltipContent></Tooltip>
    ) : dash; } },
    { k: 'trial', label: 'Teste', v: (p) => p.data?.trialDays ?? undefined, render: (p) => { const d = p.data; if (p.isRef) return <span className="text-xs text-muted-foreground" title="acesso por aprovação manual">sem teste</span>; return d?.trialDays ? <span className="whitespace-nowrap text-xs" title={d.trial ?? ''}>{d.trialDays} d{d.trialNeedsCard === false ? ' · sem cartão' : d.trialNeedsCard ? ' · cartão' : ''}</span> : d?.trial ? <span className="block max-w-36 truncate text-xs" title={d.trial}>{d.trial}</span> : dash; } },
  ];
  const hidden = pr.filter((p) => !p.isRef && base !== 'todos' && p.audience !== base).length;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Chips value={fb} onChange={setFb} options={[{ value: 'todas', label: 'Todas as faixas' }, ...BANDS.map((b) => ({ value: b.id, label: b.label }))]} />
        <span className="text-xs text-muted-foreground">{rows.length} planos{hidden > 0 && ` · ${hidden} de outra base escondidos (troque a Base na régua)`}</span>
      </div>
      <SortTable fill rows={rows} pin={kz} cols={cols} rowKey={(p) => p.key} initial={{ k: 'monthly', dir: 1 }} empty={<p className="py-8 text-center text-sm text-muted-foreground">Nenhum plano nesta faixa.</p>} />
    </div>
  );
}

// ---------- por faixa ----------
function PorFaixa({ pr, m, lens, cuts, band }: { pr: PlanRow[]; m: Matrix | undefined; lens: Lens; cuts?: Cuts; band: (p: PlanRow) => Band | undefined }) {
  const POS = ['sim', 'parcial'];
  const info = useMemo(() => BANDS.map((b, bi) => {
    const ps = pr.filter((p) => band(p) === b.id).sort((a, c) => valueOf(a, lens)! - valueOf(c, lens)!);
    const withM = ps.filter(hasMatrix);
    const feats = (m?.features ?? []).filter((f) => withM.length && withM.filter((p) => POS.includes(planCell(p, f.id, m).st)).length / withM.length >= 0.6);
    const lower = pr.filter((p) => { const x = band(p); return x && BANDS.findIndex((y) => y.id === x) < bi && hasMatrix(p); });
    const only = (m?.features ?? []).filter((f) => withM.some((p) => POS.includes(planCell(p, f.id, m).st)) && !lower.some((p) => POS.includes(planCell(p, f.id, m).st)) && bi > 0 && lower.length > 0);
    return { b, ps, withM, feats, only, lowerN: lower.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [pr, m, lens, cuts]);
  return (
    <FillBox>
      <div className="grid gap-3 lg:grid-cols-2">
        {info.map(({ b, ps, withM, feats, only, lowerN }) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2"><BandChip b={b.id} /><span className="text-xs text-muted-foreground">{b.rule}</span><span className="ml-auto text-xs tabular-nums text-muted-foreground">{ps.length} planos</span></div>
            <div className="mt-2 flex flex-wrap gap-1">
              {ps.map((p) => <span key={p.key} className="rounded bg-muted px-1.5 py-0.5 text-[11px]"><b className="font-medium">{p.comp}</b> {p.plan.name} <span className="tabular-nums text-muted-foreground">{brl(valueOf(p, lens))}</span></span>)}
              {!ps.length && <span className="text-xs text-muted-foreground">nenhum plano</span>}
            </div>
            <div className="mt-3 text-xs">
              <div className="mb-0.5 font-medium">O que a faixa costuma incluir <span className="font-normal text-muted-foreground">(presente em 60% ou mais dos planos com matriz)</span></div>
              {!withM.length ? <p className="text-muted-foreground">Ainda sem matriz por plano nesta faixa (a re-coleta traz). Hoje só há os nomes dos planos.</p>
                : feats.length ? <div className="flex flex-wrap gap-1">{feats.map((f) => <span key={f.id} className={cx('rounded px-1.5 py-0.5 text-[11px]', BAND_CLS[b.id])}>{f.name}</span>)}</div>
                : <p className="text-muted-foreground">Nada em comum acima de 60%.</p>}
              {withM.length > 0 && <p className="mt-1 text-[11px] text-muted-foreground">{withM.length} de {ps.length} planos com matriz</p>}
              {withM.length > 0 && b.id !== 'entrada' && (
                <div className="mt-2"><div className="mb-0.5 font-medium">Só aparece daqui para cima</div>
                  {only.length ? <div className="flex flex-wrap gap-1">{only.map((f) => <span key={f.id} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{f.name}</span>)}</div> : <p className="text-muted-foreground">{lowerN ? 'Nada novo em relação às faixas de baixo.' : 'Faixas de baixo sem matriz para comparar.'}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Só planos solo pagos. Para ver o plano mais barato da Kzloo contra o equivalente de cada concorrente, use o Lado a lado.<Link to="?p=lado" className="ml-1 text-primary-ink hover:underline">Abrir</Link></p>
    </FillBox>
  );
}
