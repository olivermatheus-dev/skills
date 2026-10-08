// Comparar > Preços: dados e contas (sem React). Fonte: analysis/precos.json de cada concorrente (+ a Kzloo de intel/referencia.json).
// Regras do DESENHO 3.3/3.4: base = 1 profissional, mesmo ciclo, promoção marcada, faixas = quartis dos planos solo pagos (recalculadas a cada dado).
import type { ModuleDataOf } from '../../../../../schema/analysis';
import type { Matrix } from '../../../../../schema/matrix';
import { NOS } from '../../../../../schema/matrix';
import { REF_ID, type MarketRow } from '../../../components/competitors/area';

export type Pr = ModuleDataOf<'precos'>;
export type Plan = Pr['plans'][number];
export type Band = 'entrada' | 'popular' | 'intermediaria' | 'premium';
export const BANDS: { id: Band; label: string; rule: string }[] = [
  { id: 'entrada', label: 'Entrada', rule: 'abaixo do 1º quartil' },
  { id: 'popular', label: 'Popular', rule: 'do 1º quartil à mediana' },
  { id: 'intermediaria', label: 'Intermediária', rule: 'da mediana ao 3º quartil' },
  { id: 'premium', label: 'Premium', rule: 'acima do 3º quartil' },
];
/** pacote que define o "plano equivalente" (DESENHO 3.4, confirmado pelo Oliver em 2026-10-08) */
export const PACOTE = ['agenda-visual', 'recorrencia', 'prontuario', 'formulario-paciente', 'video-nativa', 'wpp-lembrete', 'controle-cobrancas', 'portal-paciente'];

export interface PlanRow {
  key: string; // concorrente:plano
  row: MarketRow;
  comp: string; compId: string;
  data: Pr;
  plan: Plan;
  isRef: boolean;
  audience: 'solo' | 'equipe';
  audienceInferred: boolean;
  /** mensal vigente, mensal cheio (sem promo), anual equivalente por mês */
  monthly?: number; regular?: number; yearly?: number;
  paid: boolean; free: boolean; onRequest: boolean;
  updatedAt?: string; confidence?: string;
  stale: boolean;
}

const DAY = 864e5;
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const EQUIPE_USERS = /(at[eé]|ate)\s*\d|\b([2-9]|\d{2,})\s*(profissionais|acessos|usu[aá]rios)|ilimitad|equipe/i;
const EQUIPE_NAME = /cl[ií]nica|equipe|time\b/i;

export function audienceOf(p: Plan): { a: 'solo' | 'equipe'; inferred: boolean } {
  if (p.audience) return { a: p.audience, inferred: false };
  if (p.seats && ((p.seats.max ?? p.seats.included ?? 1) > 1 || p.seats.unlimited)) return { a: 'equipe', inferred: false };
  if (EQUIPE_NAME.test(p.name) || EQUIPE_USERS.test(p.users ?? '')) return { a: 'equipe', inferred: true };
  return { a: 'solo', inferred: true };
}

/** uma linha por plano (concorrentes sem plano detalhado mas com "a partir de" viram um plano sintético) */
export function buildPlanRows(rows: MarketRow[], ref: MarketRow | null, now = Date.now()): PlanRow[] {
  const out: PlanRow[] = [];
  for (const r of rows) {
    const res = r.res.precos;
    const d = res?.data as Pr | undefined;
    if (!d) continue;
    let plans = d.plans;
    if (!plans.length && d.fromMonthly != null) plans = [{ name: 'A partir de', monthly: d.fromMonthly, highlights: [], recommended: false, onRequest: false, otherCycles: [], includes: [], matrix: [], limits: [] } as Plan];
    plans.forEach((p, i) => {
      const { a, inferred } = audienceOf(p);
      const monthly = p.monthly ?? undefined;
      const upd = res?.updatedAt;
      out.push({
        key: `${r.c.data.id}:${p.id ?? (slug(p.name) || i)}`, row: r, comp: r.c.data.name, compId: r.c.data.id, data: d, plan: p, isRef: false,
        audience: a, audienceInferred: inferred, monthly, regular: p.regularMonthly ?? undefined, yearly: p.yearlyMonthly ?? undefined,
        paid: monthly != null && monthly > 0, free: monthly === 0, onRequest: p.onRequest || (monthly == null && p.yearlyMonthly == null),
        updatedAt: upd, confidence: res?.confidence, stale: !upd || now - new Date(upd).getTime() > 60 * DAY || res?.confidence !== 'alta',
      });
    });
  }
  const kz = ref?.ov?.fromMonthly;
  if (ref && kz != null) {
    const p = { name: 'Plano único', id: 'unico', monthly: kz, audience: 'solo', highlights: [], recommended: false, onRequest: false, otherCycles: [], includes: [], matrix: [], limits: [] } as unknown as Plan;
    out.unshift({
      key: `${REF_ID}:unico`, row: ref, comp: ref.c.data.name, compId: REF_ID, data: ref.res.precos?.data as Pr, plan: p, isRef: true, audience: 'solo', audienceInferred: false,
      monthly: kz, paid: true, free: false, onRequest: false, stale: false,
    });
  }
  return out;
}

export type Lens = { cycle: 'mensal' | 'anual'; promo: 'vigente' | 'cheio' };
/** valor mensal do plano na lente escolhida (anual sem dado = undefined: nunca usa o mensal no lugar) */
export const valueOf = (p: PlanRow, l: Lens): number | undefined => (l.cycle === 'anual' ? p.yearly : l.promo === 'cheio' ? p.regular ?? p.monthly : p.monthly);

export function quant(xs: number[], q: number) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return undefined;
  const i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.min(lo + 1, s.length - 1);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);
export const median = (xs: number[]) => quant(xs, 0.5);

export interface Cuts { q1: number; med: number; q3: number; n: number }
export function cutsOf(vals: number[]): Cuts | undefined {
  const q1 = quant(vals, 0.25), med = quant(vals, 0.5), q3 = quant(vals, 0.75);
  return q1 == null || med == null || q3 == null ? undefined : { q1, med, q3, n: vals.length };
}
export const bandOf = (v: number, c: Cuts): Band => (v < c.q1 ? 'entrada' : v <= c.med ? 'popular' : v <= c.q3 ? 'intermediaria' : 'premium');

/** desconto anual % de um plano (derivado: nunca gravado) */
export const discount = (p: PlanRow) => (p.monthly && p.yearly != null && p.monthly > 0 && p.yearly < p.monthly ? Math.round((1 - p.yearly / p.monthly) * 100) : undefined);

export interface Stats {
  cuts?: Cuts; // quartis dos planos solo pagos na lente
  entry: number[]; // menor plano solo pago de cada concorrente
  top: number[]; // maior plano solo pago de cada concorrente
  discounts: number[]; // desconto anual por concorrente (média dos planos)
  trial: { n: number; of: number; free: number };
  mean?: number; med?: number;
}
export function statsOf(pr: PlanRow[], lens: Lens): Stats {
  const comp = pr.filter((p) => !p.isRef);
  const solo = comp.filter((p) => p.paid && p.audience === 'solo');
  const vals = solo.map((p) => valueOf(p, lens)).filter((v): v is number => v != null);
  const by = new Map<string, number[]>();
  for (const p of solo) { const v = valueOf(p, lens); if (v != null) by.set(p.compId, [...(by.get(p.compId) ?? []), v]); }
  const entry = [...by.values()].map((v) => Math.min(...v)), top = [...by.values()].map((v) => Math.max(...v));
  const dBy = new Map<string, number[]>();
  for (const p of comp) { const d = discount(p); if (d != null) dBy.set(p.compId, [...(dBy.get(p.compId) ?? []), d]); }
  const discounts = [...dBy.values()].map((v) => mean(v)!);
  const rows = new Map<string, MarketRow>(comp.map((p) => [p.compId, p.row]));
  const hasTrial = (r: MarketRow) => { const d = r.res.precos?.data as Pr | undefined; return !!d && ((d.trialDays ?? 0) > 0 || (!!d.trial && !/^(n[aã]o|sem teste)/i.test(d.trial))); };
  const withData = [...rows.values()].filter((r) => (r.res.precos?.data as Pr | undefined)?.publicPrice !== false || (r.res.precos?.data as Pr | undefined)?.plans.length);
  const free = [...rows.values()].filter((r) => { const d = r.res.precos?.data as Pr | undefined; return !!d && (d.model === 'freemium' || d.plans.some((p) => p.monthly === 0)); }).length;
  return { cuts: cutsOf(vals), entry, top, discounts, mean: mean(vals), med: median(vals), trial: { n: withData.filter(hasTrial).length, of: withData.length, free } };
}

/** ---- matriz por plano ---- */
export type CellSt = 'sim' | 'parcial' | 'nao' | 'planejado' | 'desconhecido';
export interface PlanCell { st: CellSt; note?: string; exact: boolean }
/** célula plano × funcionalidade; sem `matrix` no plano cai na matriz do concorrente (exact=false) */
export function planCell(p: PlanRow, fid: string, m: Matrix | undefined): PlanCell {
  if (p.isRef) { const c = m?.cells[NOS]?.[fid]; return c ? { st: c.status, note: c.note, exact: true } : { st: 'desconhecido', exact: true }; }
  if (p.plan.matrix.length) { const c = p.plan.matrix.find((x) => x.id === fid); return c ? { st: c.status, note: c.note ?? undefined, exact: true } : { st: 'nao', exact: true }; }
  const c = m?.cells[p.compId]?.[fid];
  return c ? { st: c.status, note: c.note, exact: false } : { st: 'desconhecido', exact: false };
}
export const hasMatrix = (p: PlanRow) => p.isRef || p.plan.matrix.length > 0;
export const featureCount = (p: PlanRow, m: Matrix | undefined) => (m ? m.features.filter((f) => ['sim', 'parcial'].includes(planCell(p, f.id, m).st)).length : 0);

export interface Cover { sim: number; parcial: number; known: boolean }
export const coverOf = (p: PlanRow, m: Matrix | undefined): Cover => {
  if (!hasMatrix(p)) return { sim: 0, parcial: 0, known: false };
  const cs = PACOTE.map((id) => planCell(p, id, m).st);
  return { sim: cs.filter((s) => s === 'sim').length, parcial: cs.filter((s) => s === 'parcial').length, known: true };
};

/** plano equivalente de cada concorrente: o solo pago mais barato que cobre o pacote; senão o que cobre mais; sem matriz por plano, o de entrada (não conferido) */
export function equivalents(pr: PlanRow[], m: Matrix | undefined, lens: Lens): Map<string, { p: PlanRow; cover: Cover }> {
  const out = new Map<string, { p: PlanRow; cover: Cover }>();
  const by = new Map<string, PlanRow[]>();
  for (const p of pr) if (!p.isRef && p.paid && p.audience === 'solo') by.set(p.compId, [...(by.get(p.compId) ?? []), p]);
  for (const [id, ps] of by) {
    const cheap = (a: PlanRow, b: PlanRow) => (valueOf(a, lens) ?? Infinity) - (valueOf(b, lens) ?? Infinity);
    const withM = ps.filter(hasMatrix).map((p) => ({ p, cover: coverOf(p, m) }));
    if (withM.length) {
      const score = (c: Cover) => c.sim + c.parcial / 2;
      const best = Math.max(...withM.map((x) => score(x.cover)));
      const pick = withM.filter((x) => score(x.cover) === best).sort((a, b) => cheap(a.p, b.p))[0];
      // se algum cobre os 8 inteiros, o mais barato deles; é o mesmo critério (score máximo)
      out.set(id, pick);
    } else {
      const p = [...ps].sort(cheap)[0];
      out.set(id, { p, cover: { sim: 0, parcial: 0, known: false } });
    }
  }
  return out;
}

/** add-ons fixos (por mês) que o plano precisa para chegar ao pacote */
export function realCost(p: PlanRow, m: Matrix | undefined, lens: Lens) {
  const base = valueOf(p, lens);
  if (base == null) return { base, total: undefined as number | undefined, added: [] as string[], unknown: [] as string[], perUse: [] as string[] };
  const missing = new Set(PACOTE.filter((id) => !['sim', 'parcial'].includes(planCell(p, id, m).st)));
  let total = base; const added: string[] = [], unknown: string[] = [], perUse: string[] = [];
  for (const a of p.data.addOns ?? []) {
    const applies = !a.planIds.length || (p.plan.id != null && a.planIds.includes(p.plan.id));
    if (!applies) continue;
    const fmt = a.price != null ? `${a.name} (${a.price.toLocaleString('pt-BR', { minimumFractionDigits: a.price % 1 ? 2 : 0 })}${a.unit === 'percentual' ? '%' : ''}${a.unit === 'por-uso' ? ` por ${a.per ?? 'uso'}` : a.unit === 'mes' ? '/mês' : ''})` : a.name;
    if (a.unit === 'por-uso' || a.unit === 'percentual') { perUse.push(fmt); continue; }
    if (!a.unlocks.some((u) => missing.has(u))) continue;
    if (a.price == null) unknown.push(a.name);
    else if (a.unit === 'mes') { total += a.price; added.push(fmt); }
  }
  return { base, total, added, unknown, perUse };
}

export const GROUP_ORDER_FALLBACK = 'Outras';
export const dd = (iso?: string | null) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '');
export const dmy = (iso?: string | null) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('pt-BR') : '');
export const brl = (v?: number | null, d = 2) => (v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: v % 1 ? d : 0, maximumFractionDigits: d }));
export const LIMIT_LABEL: Record<string, string> = {
  pacientes: 'pacientes', sessoes: 'sessões', profissionais: 'profissionais', 'whatsapp-msgs': 'msgs WhatsApp', 'video-min': 'min de vídeo', 'video-sessoes': 'sessões de vídeo',
  'ia-creditos': 'créditos de IA', nf: 'NF', cobrancas: 'cobranças', 'armazenamento-gb': 'GB', relatorios: 'relatórios', outro: '',
};
export const PERIOD_LABEL: Record<string, string> = { mes: '/mês', trimestre: '/trim.', ano: '/ano', total: '' };
export type Limit = Plan['limits'][number];
export const limitText = (l: Limit) => {
  const lab = LIMIT_LABEL[l.metric] || l.note || '';
  if (l.unlimited) return `${lab} ilimitado`.trim();
  const one = l.value === 1 ? ({ profissionais: 'profissional', pacientes: 'paciente', sessoes: 'sessão', cobrancas: 'cobrança' } as Record<string, string>)[l.metric] : undefined;
  return `${l.value != null ? l.value.toLocaleString('pt-BR') : ''} ${one ?? lab}${l.period ? PERIOD_LABEL[l.period] : ''}`.trim();
};
export const COMMIT_LABEL: Record<string, string> = { 'sem-fidelidade': 'sem fidelidade', 'fidelidade-anual': 'fidelidade anual', multa: 'com multa', 'nao-informado': 'não informado' };
export const PAY_LABEL: Record<string, string> = { cartao: 'cartão', pix: 'Pix', boleto: 'boleto', debito: 'débito', outro: 'outro' };
export const seatsText = (p: PlanRow) => {
  const s = p.plan.seats;
  if (s) return s.unlimited ? 'profissionais ilimitados' : s.max != null && s.max !== s.included && s.included != null ? `${s.included} a ${s.max} prof.` : `${s.max ?? s.included ?? '?'} prof.`;
  return p.plan.users ?? undefined;
};
/** preço por profissional (planos de equipe com número de assentos conhecido) */
export const perSeat = (p: PlanRow, l: Lens) => { const v = valueOf(p, l), n = p.plan.seats?.unlimited ? undefined : p.plan.seats?.max ?? p.plan.seats?.included ?? undefined; return v != null && n && n > 1 ? v / n : undefined; };
