// Comparar > Posicionamento: como cada concorrente se apresenta e vende na página (módulo `landing`).
// Visões por chips (?p=): Estrutura (matriz seção × concorrente) · Promessa · Porta de entrada · Prova · Tom · Vale copiar.
// Tudo é calculado aqui a partir de analysis/landing.json; a Kzloo entra quando houver dado (hero/tom do referencia.json; seções só com `landing.sections`).
import { useMemo, useState } from 'react';
import { BadgeCheck, LayoutList, Lightbulb, MessageSquareQuote, MousePointerClick, Search, Speech } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ModuleDataOf } from '../../../../../schema/analysis';
import { FillBox, REF_ID, SortTable, useFillHeight, type Col, type MarketRow } from '../../../components/competitors/area';
import { Avatar, Chips } from '../../../components/competitors/lib';
import { Badge, cx } from '../../../components/kit';
import { COMMIT_LABEL } from './precosLib';

type Lp = ModuleDataOf<'landing'>;
type Pr = ModuleDataOf<'precos'>;
const lp = (r: MarketRow) => r.res.landing?.data as Lp | undefined;
const dash = <span className="text-muted-foreground">—</span>;

const PVIEWS = {
  estrutura: { label: 'Estrutura', icon: LayoutList },
  promessa: { label: 'Promessa', icon: MessageSquareQuote },
  entrada: { label: 'Porta de entrada', icon: MousePointerClick },
  prova: { label: 'Prova', icon: BadgeCheck },
  tom: { label: 'Tom', icon: Speech },
  copiar: { label: 'Vale copiar', icon: Lightbulb },
} as const;
type PView = keyof typeof PVIEWS;

export default function Posicionamento({ slug, rows, refRow }: { slug: string; rows: MarketRow[]; refRow: MarketRow | null }) {
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('p') ?? '';
  const p = (Object.hasOwn(PVIEWS, raw) ? raw : 'estrutura') as PView;
  const withLp = rows.filter((r) => lp(r));
  const set = (x: PView) => { const n = new URLSearchParams(sp); if (x === 'estrutura') n.delete('p'); else n.set('p', x); setSp(n, { replace: true }); };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Chips value={p} onChange={set} options={Object.entries(PVIEWS).map(([value, v]) => ({ value: value as PView, label: <span className="inline-flex items-center gap-1.5"><v.icon className="size-3.5" strokeWidth={1.8} />{v.label}</span> }))} />
        <span className="text-xs text-muted-foreground">{withLp.length} de {rows.length} com a página analisada</span>
      </div>
      {p === 'estrutura' && <Estrutura slug={slug} rows={withLp} refRow={refRow} />}
      {p === 'promessa' && <Promessa slug={slug} rows={withLp} refRow={refRow} />}
      {p === 'entrada' && <Entrada slug={slug} rows={withLp} refRow={refRow} />}
      {p === 'prova' && <Prova slug={slug} rows={withLp} />}
      {p === 'tom' && <Tom slug={slug} rows={withLp} refRow={refRow} />}
      {p === 'copiar' && <Copiar slug={slug} rows={withLp} />}
    </div>
  );
}

const who = (slug: string, r: MarketRow, size = 20) => (
  <Link to={`/p/${slug}/concorrentes/${r.c.data.id}`} className="inline-flex items-center gap-1.5 font-medium hover:text-primary-ink">
    <Avatar name={r.c.data.name} size={size} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />{r.c.data.name}
  </Link>
);

// ---------- Estrutura ----------
type Kind = string;
const KIND_LABEL: Record<Kind, string> = {
  hero: 'Hero (promessa)', logos: 'Logos de clientes', problema: 'Problema', solucao: 'Solução', features: 'Funcionalidades', 'como-funciona': 'Como funciona', beneficios: 'Benefícios',
  'prova-social': 'Prova social', depoimentos: 'Depoimentos', numeros: 'Números', precos: 'Preços na página', comparativo: 'Comparativo', seguranca: 'Segurança e LGPD', integracoes: 'Integrações',
  fundador: 'Fundador', faq: 'Perguntas frequentes', blog: 'Blog', cta: 'CTA final', 'para-quem': 'Para quem é', demonstracao: 'Demonstração', migracao: 'Migração', midia: 'Na mídia',
  comunidade: 'Comunidade', suporte: 'Suporte humano', diferencial: 'Diferencial', outro: 'Outras',
};
/** `outro` reclassificado pelo título (só em memória; o schema não muda) */
function kindOf(s: Lp['sections'][number]): Kind {
  if (s.type !== 'outro') return s.type;
  const t = s.title.toLowerCase();
  if (/pra quem|para quem|especialidade/.test(t)) return 'para-quem';
  if (/demonstra|v[ií]deo|na pr[aá]tica/.test(t)) return 'demonstracao';
  if (/migra/.test(t)) return 'migracao';
  if (/m[ií]dia|imprensa/.test(t)) return 'midia';
  if (/comunidade/.test(t)) return 'comunidade';
  if (/suporte|tem gente/.test(t)) return 'suporte';
  if (/diferencial/.test(t)) return 'diferencial';
  return 'outro';
}
const PROVA = new Set(['depoimentos', 'numeros', 'logos', 'prova-social']);
type Cls = 'padrao' | 'comum' | 'rara';
const CLS: Record<Cls, { label: string; cls: string }> = {
  padrao: { label: 'Padrão', cls: 'bg-success/15 text-success-ink' },
  comum: { label: 'Comum', cls: 'bg-warning/15 text-warning-ink' },
  rara: { label: 'Rara', cls: 'bg-muted text-muted-foreground' },
};
const clsOf = (pct: number): Cls => (pct >= 70 ? 'padrao' : pct >= 40 ? 'comum' : 'rara');

interface Cell { pos: number[]; rel: number; tips: string[] }
interface Line { kind: Kind; label: string; cells: Map<string, Cell>; n: number; pct: number; typ: number; cls: Cls; any?: boolean }

function Estrutura({ slug, rows, refRow }: { slug: string; rows: MarketRow[]; refRow: MarketRow | null }) {
  const [cf, setCf] = useState<'todas' | Cls>('todas');
  const [ord, setOrd] = useState<'pos' | 'freq'>('pos');
  const kz = refRow && lp(refRow)?.sections.length ? refRow : null;
  const { lines, ranking } = useMemo(() => {
    const all = kz ? [...rows, kz] : rows;
    const map = new Map<Kind, Map<string, Cell>>();
    const ranking: [string, number][] = [];
    for (const r of all) {
      const secs = (lp(r)?.sections ?? []).filter((s) => s.type !== 'rodape');
      ranking.push([r.c.data.name, secs.length]);
      secs.forEach((s, i) => {
        const k = kindOf(s), rel = secs.length > 1 ? i / (secs.length - 1) : 0, tip = `${s.title}${s.summary ? ` — ${s.summary}` : ''}`;
        for (const key of PROVA.has(k) ? [k, '__prova'] : [k]) {
          const m = map;
          const row = m.get(key) ?? new Map<string, Cell>();
          const c = row.get(r.c.data.id) ?? { pos: [], rel: 0, tips: [] };
          c.pos.push(i + 1); c.rel = c.pos.length === 1 ? rel : (c.rel * (c.pos.length - 1) + rel) / c.pos.length; c.tips.push(tip);
          row.set(r.c.data.id, c); m.set(key, row);
        }
      });
    }
    const N = rows.length || 1;
    const lines: Line[] = [...map.entries()].map(([kind, cells]) => {
      const n = rows.filter((r) => cells.has(r.c.data.id)).length, pct = Math.round((n / N) * 100);
      const rels = rows.filter((r) => cells.has(r.c.data.id)).map((r) => cells.get(r.c.data.id)!.rel);
      return { kind, label: kind === '__prova' ? 'Prova social (qualquer)' : KIND_LABEL[kind] ?? kind, cells, n, pct, typ: rels.length ? rels.reduce((a, b) => a + b, 0) / rels.length : 1, cls: clsOf(pct), any: kind === '__prova' };
    });
    ranking.sort((a, b) => b[1] - a[1]);
    return { lines, ranking };
  }, [rows, kz]);
  const view = lines.filter((l) => cf === 'todas' || l.cls === cf).sort((a, b) => ord === 'pos' ? a.typ - b.typ || b.n - a.n : b.n - a.n || a.typ - b.typ);
  const cols = kz ? [kz, ...rows] : rows;
  const [boxRef, boxH] = useFillHeight();
  const tone = (rel: number) => (rel < 0.34 ? 'bg-primary/30' : rel < 0.67 ? 'bg-primary/18' : 'bg-primary/8');
  const counts = (c: Cls) => lines.filter((l) => l.cls === c && !l.any).length;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
        <Chips value={cf} onChange={setCf} options={[{ value: 'todas', label: 'Todas', count: lines.length }, ...(['padrao', 'comum', 'rara'] as Cls[]).map((c) => ({ value: c, label: CLS[c].label, count: counts(c) }))]} />
        <Chips value={ord} onChange={setOrd} options={[{ value: 'pos', label: 'Posição típica' }, { value: 'freq', label: 'Frequência' }]} />
        <span className="text-muted-foreground" title="Padrão: 70% ou mais dos concorrentes têm · Comum: 40 a 69% · Rara: menos de 40%. Rodapé fica fora da conta.">número = em que posição a seção aparece na página (mais escuro = mais perto do topo) · Padrão ≥ 70% · Comum 40–69% · Rara &lt; 40%</span>
      </div>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Mais seções: {ranking.slice(0, 3).map(([n, c]) => `${n} ${c}`).join(' · ')}. Menos: {ranking.slice(-2).reverse().map(([n, c]) => `${n} ${c}`).join(' · ')}.
        {!kz && ' A Kzloo ainda não tem coluna (falta mapear as seções da sua página).'} Na linha “Prova social (qualquer)” o número é quantos blocos de prova a página tem.
      </p>
      <div ref={boxRef} style={{ height: boxH }} className="bg-card border border-border rounded-xl overflow-auto">
        <table className="text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-30 bg-muted px-3 py-2 text-left text-xs font-medium text-muted-foreground min-w-52 shadow-[inset_0_-1px_0_var(--border)]">Seção</th>
              <th className="sticky top-0 z-20 bg-muted px-2 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap shadow-[inset_0_-1px_0_var(--border)]">Quantos têm</th>
              <th className="sticky top-0 z-20 bg-muted px-2 py-2 text-left text-xs font-medium text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]">Classe</th>
              {cols.map((r) => (
                <th key={r.c.data.id} className={cx('sticky top-0 z-20 px-1.5 py-2 text-[11px] font-medium shadow-[inset_0_-1px_0_var(--border)] align-bottom', r.c.data.id === REF_ID ? 'bg-primary/10 text-primary-ink' : 'bg-muted text-muted-foreground')}>
                  <Link to={r.c.data.id === REF_ID ? `/p/${slug}/contexto` : `/p/${slug}/concorrentes/${r.c.data.id}`} className="flex flex-col items-center gap-1 w-16 hover:text-foreground" title={r.c.data.name}>
                    <Avatar name={r.c.data.name} size={20} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />
                    <span className="truncate w-full text-center">{r.c.data.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((l) => (
              <tr key={l.kind} className={cx('hover:bg-muted/30', l.any && 'bg-muted/20')}>
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-medium whitespace-nowrap border-b border-border">{l.label}</td>
                <td className="px-2 py-1.5 border-b border-border">
                  <div className="flex items-center gap-2 w-36"><div className="h-1.5 w-14 shrink-0 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${l.pct}%` }} /></div><span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{l.n}/{rows.length} · {l.pct}%</span></div>
                </td>
                <td className="px-2 py-1.5 border-b border-border"><span className={cx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', CLS[l.cls].cls)}>{CLS[l.cls].label}</span></td>
                {cols.map((r) => {
                  const c = l.cells.get(r.c.data.id);
                  return <td key={r.c.data.id} className="p-0.5 border-b border-border text-center" title={c?.tips.join('\n')}>
                    {c ? <div className={cx('rounded text-xs font-semibold tabular-nums py-1', tone(c.rel))}>{l.any ? c.pos.length : c.pos.join('·')}</div> : <span className="text-muted-foreground/40">·</span>}
                  </td>;
                })}
              </tr>
            ))}
            {!view.length && <tr><td colSpan={cols.length + 3} className="px-3 py-6 text-center text-muted-foreground text-sm">Nenhuma seção nessa classe.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Promessa ----------
function Promessa({ slug, rows, refRow }: { slug: string; rows: MarketRow[]; refRow: MarketRow | null }) {
  const [q, setQ] = useState('');
  const all = refRow ? [refRow, ...rows] : rows;
  const f = q.trim().toLowerCase();
  const view = all.filter((r) => { const h = lp(r)?.hero; return !f || [h?.headline, h?.subheadline, h?.cta, h?.visual].join(' ').toLowerCase().includes(f); });
  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <label className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar palavra (IA, WhatsApp…)" className="h-8 w-64 rounded-md border border-border bg-card pl-7 pr-2 text-xs outline-none focus:border-primary" /></label>
        <span className="text-xs text-muted-foreground">{view.length} promessas{refRow ? ' (a sua primeiro)' : ''} · a frase principal do topo de cada página, com o subtítulo e o botão</span>
      </div>
      <FillBox>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {view.map((r) => { const h = lp(r)!.hero, me = r.c.data.id === REF_ID; return (
            <div key={r.c.data.id} className={cx('rounded-xl border p-4 flex flex-col gap-2', me ? 'border-primary/40 bg-primary/5' : 'border-border bg-card')}>
              <div className="flex items-center gap-2 text-xs">{me ? <span className="inline-flex items-center gap-1.5 font-semibold text-primary-ink"><Avatar name={r.c.data.name} size={20} className="!ring-0" />{r.c.data.name}<span className="text-[10px] px-1.5 rounded-full bg-primary text-primary-foreground">você</span></span> : who(slug, r)}</div>
              <div className="text-base font-semibold leading-snug">{h.headline}</div>
              {h.subheadline && <div className="text-sm text-muted-foreground line-clamp-3">{h.subheadline}</div>}
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                {h.cta && <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-ink">{h.cta}</span>}
                {h.visual && <span className="text-[11px] text-muted-foreground line-clamp-1" title={h.visual}>visual: {h.visual}</span>}
              </div>
            </div>); })}
        </div>
        {!view.length && <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma promessa com “{q}”.</p>}
      </FillBox>
    </div>
  );
}

// ---------- Porta de entrada ----------
type Door = 'teste' | 'conta' | 'demo' | 'pedido' | 'contato' | 'outro';
const DOOR: Record<Door, { label: string; color?: string }> = {
  teste: { label: 'Testar grátis', color: '#16a34a' }, conta: { label: 'Criar conta grátis', color: '#16a34a' }, demo: { label: 'Demonstração', color: '#d97706' }, pedido: { label: 'Pedir acesso', color: '#d97706' }, contato: { label: 'Falar com alguém', color: '#d97706' }, outro: { label: 'Outro' },
};
const doorOf = (cta?: string | null): Door | undefined => {
  if (!cta) return undefined;
  const c = cta.toLowerCase();
  if (/conta/.test(c) && /gr[aá]t/.test(c)) return 'conta';
  if (/gr[aá]t|teste|experimente|testar|come[cç]ar/.test(c)) return 'teste';
  if (/demonstra/.test(c)) return 'demo';
  if (/acesso/.test(c) && /pedir|solicit|quero/.test(c)) return 'pedido';
  if (/consultor|whatsapp|falar|pedir|acesso/.test(c)) return 'contato';
  return 'outro';
};
/** tipo pelo CTA do hero; se cair em "outro", vale a demonstração oferecida nos outros CTAs */
const doorRow = (r: MarketRow): Door | undefined => { const d = doorOf(lp(r)?.hero.cta); return d === "outro" && lp(r)?.ctas.some((c) => /demonstra/i.test(c)) ? "demo" : d; };
function Entrada({ slug, rows, refRow }: { slug: string; rows: MarketRow[]; refRow: MarketRow | null }) {
  const cleanCta = (s?: string | null) => (s ?? '').split('|').pop()!.trim();
  const free = rows.filter((r) => ['teste', 'conta'].includes(doorRow(r) ?? '')).length;
  const demo = rows.filter((r) => doorRow(r) === 'demo').length;
  const cols: Col<MarketRow>[] = [
    { k: 'name', label: 'Concorrente', v: (r) => r.c.data.name, className: 'min-w-44', render: (r) => r.c.data.id === REF_ID ? <span className="inline-flex items-center gap-1.5 font-semibold text-primary-ink"><Avatar name={r.c.data.name} size={20} className="!ring-0" />{r.c.data.name}<span className="text-[10px] px-1.5 rounded-full bg-primary text-primary-foreground">você</span></span> : who(slug, r) },
    { k: 'cta', label: 'CTA principal', v: (r) => cleanCta(lp(r)?.hero.cta), render: (r) => { const c = cleanCta(lp(r)?.hero.cta); return c ? <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary-ink whitespace-nowrap">{c}</span> : dash; } },
    { k: 'tipo', label: 'Tipo', title: 'classificado pelo texto do CTA', v: (r) => doorRow(r), render: (r) => { const d = doorRow(r); return d ? <span className="whitespace-nowrap"><Badge color={DOOR[d].color}>{DOOR[d].label}</Badge></span> : dash; } },
    { k: 'sec', label: 'Outros CTAs', render: (r) => { const main = cleanCta(lp(r)?.hero.cta); const o = (lp(r)?.ctas ?? []).filter((c) => c !== main && !main.startsWith(c)); return o.length ? <div className="flex flex-wrap gap-1 max-w-72">{o.slice(0, 3).map((c) => <span key={c} className="whitespace-nowrap text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c}</span>)}{o.length > 3 && <span className="text-[11px] text-muted-foreground" title={o.slice(3).join('\n')}>+{o.length - 3}</span>}</div> : dash; } },
    { k: 'trial', label: 'Teste', v: (r) => (r.res.precos?.data as Pr | undefined)?.trialDays ?? undefined, render: (r) => { const d = r.res.precos?.data as Pr | undefined; const t = d?.trialDays ? `${d.trialDays} dias${d.trialNeedsCard === false ? ', sem cartão' : ''}` : r.ov?.trial; return <span className="block max-w-40 truncate" title={r.ov?.trial ?? ''}>{t ?? '—'}</span>; } },
    { k: 'free', label: 'Plano grátis', v: (r) => (r.ov?.priceModel === 'freemium' ? 1 : 0), render: (r) => (r.ov?.priceModel === 'freemium' ? <Badge color="#16a34a">sim</Badge> : dash) },
    { k: 'price', label: 'Preço na página', title: 'a página inicial mostra os preços', v: (r) => (lp(r)?.sections.some((s) => s.type === 'precos') ? 1 : 0), render: (r) => (lp(r)?.sections.some((s) => s.type === 'precos') ? 'sim' : r.c.data.id === REF_ID ? dash : <span className="text-muted-foreground">não</span>) },
    { k: 'guar', label: 'Garantia', v: (r) => (r.res.precos?.data as Pr | undefined)?.refundDays || undefined, render: (r) => { const d = r.res.precos?.data as Pr | undefined; return d?.refundDays ? <span className="whitespace-nowrap" title={d.guarantee ?? ''}>{d.refundDays} dias</span> : <span className="text-muted-foreground" title={d?.guarantee ?? 'sem garantia informada'}>—</span>; } },
    { k: 'fid', label: 'Fidelidade', v: (r) => (r.res.precos?.data as Pr | undefined)?.commitment ?? undefined, render: (r) => { const c = (r.res.precos?.data as Pr | undefined)?.commitment; return c && c !== 'nao-informado' ? <span className={cx('whitespace-nowrap text-xs', c !== 'sem-fidelidade' && 'font-medium text-warning-ink')}>{COMMIT_LABEL[c]}</span> : dash; } },
  ];
  const refCta = refRow ? cleanCta(lp(refRow)?.hero.cta) : '';
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{free} de {rows.length} levam a teste ou conta grátis e {demo} a demonstração.{refCta && ` A Kzloo (“${refCta}”, sem teste grátis) é a porta com mais fricção: vale explicar o motivo na própria página.`}</p>
      <SortTable fill rows={rows} pin={refRow ? [refRow] : []} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'name', dir: 1 }} />
    </div>
  );
}

// ---------- Prova ----------
const PTYPES = [
  { id: 'dep', label: 'Depoimentos', re: /depoimento|CRP/i },
  { id: 'base', label: 'Base de usuários', re: /(profissionais|psic[oó]log|usu[aá]rios|cadastrad|terapeutas|cl[ií]nicas)/i, num: true },
  { id: 'volume', label: 'Volume de uso', re: /(sess[oõ]es|atendimentos|notas gera|pacientes|registros|cobran[cç]as)/i, num: true },
  { id: 'result', label: 'Resultado declarado', re: /(%|menos )/i },
  { id: 'selo', label: 'Selo / instituição', re: /(apoio|fapesp|m[ií]dia|selo|certific)/i },
  { id: 'nota', label: 'Nota / tempo de mercado', re: /(nota \d|\d[.,]\d\/5|estrelas|anos|estados)/i },
] as const;
const bigNum = (s: string) => { const m = s.replace(/\./g, '').match(/(\d+(?:,\d+)?)\s*(mil|mi|k|milh)?/i); if (!m) return 0; const n = parseFloat(m[1].replace(',', '.')); const u = (m[2] ?? '').toLowerCase(); return n * (u === 'mil' || u === 'k' ? 1e3 : u.startsWith('mi') ? 1e6 : 1); };
function Prova({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const cls = (s: string) => PTYPES.find((t) => t.re.test(s))?.id ?? 'outro';
  const biggest = (r: MarketRow) => Math.max(0, ...(lp(r)?.socialProof ?? []).filter((s) => cls(s) === 'base').map(bigNum));
  const cols: Col<MarketRow>[] = [
    { k: 'name', label: 'Concorrente', v: (r) => r.c.data.name, className: 'min-w-40', render: (r) => who(slug, r) },
    { k: 'big', label: 'Maior base declarada', num: true, title: 'o maior número de usuários que a página declara (a unidade é a deles: profissionais, psicólogas, clínicas)', v: (r) => biggest(r) || undefined, render: (r) => {
      const b = biggest(r); if (!b) return dash;
      const src = (lp(r)?.socialProof ?? []).find((s) => cls(s) === 'base' && bigNum(s) === b);
      const unit = src?.match(/(profissionais|psic[oó]log[ao]s?(?: e psic[oó]log[ao]s)?|usu[aá]rios|terapeutas|cl[ií]nicas)/i)?.[1];
      return <span className="whitespace-nowrap" title={src}><b>{b >= 1e3 ? `+${(b / 1e3).toLocaleString('pt-BR')} mil` : b}</b>{unit && <span className="ml-1 text-xs text-muted-foreground">{unit.toLowerCase()}</span>}</span>;
    } },
    ...[...PTYPES, { id: 'outro', label: 'Outros' }].map((t): Col<MarketRow> => ({
      k: t.id, label: t.label, className: 'min-w-36 align-top',
      render: (r) => { const it = (lp(r)?.socialProof ?? []).filter((s) => cls(s) === t.id); return it.length ? <div className="flex flex-col gap-0.5">{it.map((s) => <span key={s} className="text-xs leading-snug">{s}</span>)}</div> : <span className="text-muted-foreground/40">·</span>; },
    })),
  ];
  const none = rows.filter((r) => !(lp(r)?.socialProof.length)).map((r) => r.c.data.name);
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">Prova social declarada na página, separada por tipo (por palavras-chave do texto; o que não encaixa vai em “Outros”).{none.length > 0 && ` Sem prova nenhuma: ${none.join(', ')}.`}</p>
      <SortTable fill rows={rows} cols={cols} rowKey={(r) => r.c.data.id} initial={{ k: 'big', dir: -1 }} />
    </div>
  );
}

// ---------- Tom ----------
const ADJ: [string, RegExp][] = [['institucional', /institucion/i], ['corporativo', /corporativ|empresarial/i], ['acolhedor', /acolhed|cuidad|calm[oa]|humano/i], ['técnico', /t[eé]cnic|cient[ií]f|compliance|conformidade/i], ['direto', /diret[oa]|pr[aá]tic|objetiv/i], ['sóbrio', /s[oó]brio/i], ['confiante', /confiante|l[ií]der/i]];
function Tom({ slug, rows, refRow }: { slug: string; rows: MarketRow[]; refRow: MarketRow | null }) {
  const all = refRow ? [refRow, ...rows] : rows;
  const adj = (t?: string | null) => ADJ.filter(([, re]) => re.test(t ?? '')).map(([a]) => a);
  const inst = rows.filter((r) => adj(lp(r)?.tone).some((a) => a === 'institucional' || a === 'corporativo')).length;
  const close = rows.filter((r) => adj(lp(r)?.tone).includes('acolhedor') && !adj(lp(r)?.tone).some((a) => a === 'institucional' || a === 'corporativo')).map((r) => r.c.data.name);
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{inst} de {rows.length} soam institucionais ou corporativos.{close.length > 0 && ` Acolhedor sem ser institucional (mais perto da voz da Kzloo): ${close.join(', ')}.`}</p>
      <FillBox>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {all.map((r) => { const t = lp(r)?.tone ?? (r.c.data.id === REF_ID ? null : null); const me = r.c.data.id === REF_ID; return (
            <div key={r.c.data.id} className={cx('flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-2.5', me && 'bg-primary/5')}>
              <div className="w-44 shrink-0 text-sm">{me ? <span className="inline-flex items-center gap-1.5 font-semibold text-primary-ink"><Avatar name={r.c.data.name} size={20} className="!ring-0" />{r.c.data.name}<span className="text-[10px] px-1.5 rounded-full bg-primary text-primary-foreground">você</span></span> : who(slug, r)}</div>
              <div className="flex flex-wrap gap-1 w-64 shrink-0">{adj(t).map((a) => <Badge key={a}>{a}</Badge>)}{!adj(t).length && dash}</div>
              <div className="flex-1 min-w-64 text-sm text-muted-foreground">{t ?? '—'}</div>
            </div>); })}
        </div>
      </FillBox>
    </div>
  );
}

// ---------- Vale copiar ----------
const THEMES: [string, string, RegExp][] = [
  ['preco', 'Preço e ancoragem', /pre[cç]o|plano|R\$|desconto|promo|garantia|gr[aá]tis|teste|cart[aã]o|anual/i],
  ['prova', 'Prova e autoridade', /prova|depoimento|n[uú]mero|mil |avalia|selo|crp|cliente|case/i],
  ['demo', 'Demonstração e produto', /demonstra|v[ií]deo|tour|interface|print|mockup|simula|calculadora/i],
  ['ia', 'IA', /\bIA\b|intelig[eê]ncia|transcri|cr[eé]dito/i],
  ['objecao', 'Quebra de objeção', /lgpd|seguran|migra|suporte|cancel|fidelidade|sem |obje[cç]/i],
  ['seo', 'SEO e conteúdo', /seo|blog|google|artigo|conte[uú]do/i],
];
const themeOf = (s: string) => THEMES.find(([, , re]) => re.test(s))?.[0] ?? 'outros';
function Copiar({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const [th, setTh] = useState('todos');
  const items = rows.flatMap((r) => (lp(r)?.interesting ?? []).map((t) => ({ r, t, th: themeOf(t) })));
  const view = items.filter((i) => th === 'todos' || i.th === th);
  const label = (id: string) => THEMES.find(([x]) => x === id)?.[1] ?? 'Outros';
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Chips value={th} onChange={setTh} options={[{ value: 'todos', label: 'Todos', count: items.length }, ...[...THEMES.map(([id]) => id), 'outros'].map((id) => ({ value: id, label: label(id), count: items.filter((i) => i.th === id).length })).filter((o) => o.count)]} />
        <span className="text-xs text-muted-foreground">Ideias que cada página usa e valem copiar ou observar · tema separado por palavras-chave</span>
      </div>
      <FillBox>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {view.map((i, n) => (
            <div key={n} className="flex items-start gap-3 px-4 py-2">
              <div className="w-40 shrink-0 text-sm">{who(slug, i.r)}</div>
              <div className="flex-1 text-sm">{i.t}</div>
              <Badge className="shrink-0">{label(i.th)}</Badge>
            </div>
          ))}
          {!view.length && <p className="py-8 text-center text-sm text-muted-foreground">Nada nesse tema.</p>}
        </div>
      </FillBox>
    </div>
  );
}
