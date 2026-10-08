// Aba "Análise" do concorrente: escolher módulos (script roda aqui, IA vai para a fila), ver o resultado de cada módulo
// e anotar por módulo. As anotações são do Oliver: a IA nunca sobrescreve.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type AnalysisFull, type AnalysisResult, type Competitor, type ModuleId } from '../../api';
import { MODULES, FULL_ANALYSIS } from '../../../../schema/analysis';
import type { ModuleDataOf } from '../../../../schema/analysis';
import { qk, useAnalysis } from '../../queries';
import { toast } from '../toast';
import { Badge, Button, ErrorBox, Textarea, cx } from '../kit';
import { PlatformIcon, Spinner, platformLabel, timeAgo, fmtDateTime } from './lib';

const STALE_DAYS = 30;
const MOD = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, (typeof MODULES)[number]>;
const ENGINE: Record<string, { label: string; color: string; title: string }> = {
  script: { label: 'script', color: '#16a34a', title: 'Roda aqui no app, sem IA (grátis)' },
  ia: { label: 'IA', color: '#7c3aed', title: 'Vai para a fila do Claude (subagente Sonnet)' },
  misto: { label: 'script + IA', color: '#2563eb', title: 'Script extrai, a IA interpreta' },
};
export const MARKET: Record<string, { label: string; color: string }> = {
  brasil: { label: 'Brasil', color: '#16a34a' },
  internacional: { label: 'Internacional', color: '#2563eb' },
  ambos: { label: 'Brasil + exterior', color: '#7c3aed' },
  desconhecido: { label: 'A classificar', color: '#71717a' },
};
const ORDER: ModuleId[] = ['resumo', 'atuacao', 'precos', 'features', 'forcas', 'landing', 'reputacao', 'contato', 'perfis', 'site', 'redes'];
const WIDE = new Set<ModuleId>(['precos', 'features', 'forcas', 'landing', 'site']);
const ageDays = (iso?: string) => (iso ? (Date.now() - Date.parse(iso)) / 86_400_000 : Infinity);
export const money = (v?: number, cur = 'BRL') => (v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: cur, maximumFractionDigits: v % 1 ? 2 : 0 }));

export default function AnalysisPanel({ slug, c, onCollect, collecting }: { slug: string; c: Competitor; onCollect: () => Promise<void>; collecting: boolean }) {
  const qc = useQueryClient();
  const a = useAnalysis(slug, c.id);
  const d = a.data;
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: qk.analysis(slug, c.id) });
    void qc.invalidateQueries({ queryKey: qk.analysisOverview(slug) });
    void qc.invalidateQueries({ queryKey: qk.competitor(slug, c.id) });
    void qc.invalidateQueries({ queryKey: qk.competitors(slug) });
  };
  // a IA grava pelos scripts: enquanto houver pedido na fila, confere de tempos em tempos
  useEffect(() => {
    if (!d?.request) return;
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [d?.request?.requestedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (a.isLoading) return <div className="mt-6 h-40 rounded-xl bg-card border border-border animate-pulse" />;
  if (a.error || !d) return <ErrorBox error={a.error ?? new Error('sem dados')} />;

  const shown = ORDER.filter((m) => d.results[m]);
  return (
    <div className="mt-6 space-y-6">
      <RequestBar slug={slug} c={c} d={d} onChanged={refresh} onCollect={onCollect} collecting={collecting} />
      <NoteBox slug={slug} id={c.id} k="geral" label="Minhas anotações sobre este concorrente" value={d.notes.geral?.text ?? ''} onSaved={refresh} big />
      {!shown.length && <div className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-8 text-center">Nenhum módulo rodado ainda. Marque acima o que quer e clique em <b>Rodar</b>.</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {shown.map((m) => (
          <ModuleCard key={m} slug={slug} id={c.id} r={d.results[m]!} note={d.notes[m]?.text ?? ''} queued={!!d.request?.modules.includes(m)} wide={WIDE.has(m)} onSaved={refresh}>
            <Body m={m} r={d.results[m]!} />
          </ModuleCard>
        ))}
      </div>
    </div>
  );
}

// ---------- escolher e pedir ----------
function RequestBar({ slug, c, d, onChanged, onCollect, collecting }: { slug: string; c: Competitor; d: AnalysisFull; onChanged: () => void; onCollect: () => Promise<void>; collecting: boolean }) {
  const [sel, setSel] = useState<Set<ModuleId>>(new Set());
  const [force, setForce] = useState(false);
  const [instr, setInstr] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const hasSite = c.profiles.some((p) => p.platform === 'site');
  const missing = useMemo(() => FULL_ANALYSIS.filter((m) => (m === 'redes' ? false : ageDays(d.results[m]?.updatedAt) > STALE_DAYS)), [d.results]);
  const toggle = (m: ModuleId) => setSel((s) => { const n = new Set(s); if (n.has(m)) n.delete(m); else n.add(m); return n; });
  const scriptSel = [...sel].filter((m) => MOD[m].engine === 'script');
  const iaSel = [...sel].filter((m) => MOD[m].engine !== 'script');

  async function run() {
    setErr(null);
    try {
      if (iaSel.length) {
        setBusy('fila');
        // módulos de IA que leem o site: se o site não foi baixado ainda, entra junto na fila (o Claude roda o script antes)
        const needSite = iaSel.some((m) => MOD[m].needsSite) && !d.results.site && !sel.has('site');
        await api.requestAnalysis(slug, c.id, { modules: needSite ? [...iaSel, 'site'] : iaSel, force, instructions: instr });
        toast.ok(`${iaSel.length} módulo(s) na fila da IA`);
      }
      if (sel.has('site')) {
        setBusy('site');
        const r = await api.runSite(slug, c.id);
        if (r.ok) toast.ok(`Site baixado: ${r.pages} páginas, sitemap com ${r.sitemap} URLs (${Math.round(r.ms / 1000)}s)`);
        else toast.error(new Error(r.errors.join(' · ') || 'falhou'), 'Site não baixado');
      }
      if (sel.has('reputacao')) {
        setBusy('ra');
        try { const h = await api.runReclameAqui(slug, c.id); toast.ok(h.found ? `Reclame Aqui: ${h.status}${h.score != null ? ` ${h.score}` : ''} · ${h.complaints} reclamações` : 'Reclame Aqui: não achado'); }
        catch (e) { toast.error(e, 'Reclame Aqui não respondeu (a IA tenta na fila)'); }
      }
      if (sel.has('redes')) { setBusy('redes'); await onCollect(); }
      setSel(new Set()); setInstr(''); setForce(false);
    } catch (e) { setErr(e); } finally { setBusy(null); onChanged(); }
  }
  async function cancel() {
    try { await api.cancelAnalysis(slug, c.id); toast.ok('Pedido cancelado'); } catch (e) { setErr(e); } finally { onChanged(); }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {d.request && (
        <div className="mb-4 -mt-1 flex flex-wrap items-center gap-2 text-sm bg-violet-50 border border-violet-200 text-violet-900 rounded-lg px-3 py-2">
          <span className="font-medium">{d.request.status === 'rodando' ? <><Spinner /> A IA está rodando</> : '⏳ Na fila da IA'}:</span>
          {d.request.modules.map((m) => <Badge key={m} color="#7c3aed">{MOD[m]?.label ?? m}</Badge>)}
          <span className="text-xs opacity-75">pedido {timeAgo(d.request.requestedAt)}{d.request.force ? ' · refazer' : ''}</span>
          <span className="text-xs opacity-75 basis-full">Para rodar, diga ao Claude: <code className="bg-white/70 px-1 rounded">roda a fila de concorrentes</code></span>
          <button className="ml-auto text-xs underline" onClick={cancel}>cancelar pedido</button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="font-semibold text-sm mr-2">O que rodar</div>
        <Button variant="ghost" className="!py-1 text-xs" onClick={() => setSel(new Set(FULL_ANALYSIS))}>Completa</Button>
        <Button variant="ghost" className="!py-1 text-xs" onClick={() => setSel(new Set(missing))} title={`o que não existe ou tem mais de ${STALE_DAYS} dias`}>Só o que falta ({missing.length})</Button>
        <Button variant="ghost" className="!py-1 text-xs" onClick={() => setSel(new Set())}>Limpar</Button>
        <span className="text-xs text-muted-foreground ml-auto">Rodar só o necessário economiza tokens. A análise completa normalmente é feita 1x.</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((m) => {
          const r = d.results[m.id];
          const on = sel.has(m.id);
          const stale = r && ageDays(r.updatedAt) > STALE_DAYS;
          const blocked = m.id === 'redes' && !c.profiles.some((p) => p.platform !== 'site');
          return (
            <label key={m.id} title={m.hint} className={cx('flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer select-none transition', on ? 'border-primary bg-primary-soft' : 'border-border hover:border-zinc-300', blocked && 'opacity-50 cursor-not-allowed')}>
              <input type="checkbox" className="mt-0.5" checked={on} disabled={blocked} onChange={() => toggle(m.id)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {m.label}
                  <span className="text-[10px] px-1.5 rounded-full font-medium" style={{ background: `${ENGINE[m.engine].color}18`, color: ENGINE[m.engine].color }} title={ENGINE[m.engine].title}>{ENGINE[m.engine].label}</span>
                </div>
                <div className={cx('text-xs', r ? (stale ? 'text-warning' : 'text-success') : 'text-muted-foreground')}>
                  {r ? `✓ ${timeAgo(r.updatedAt)}${stale ? ' (velho)' : ''}` : m.id === 'redes' ? 'aba Redes e conteúdos' : 'não rodado'}
                  {d.request?.modules.includes(m.id) && <span className="text-violet-600"> · na fila</span>}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      {sel.size > 0 && (
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] items-end">
          <Textarea rows={2} value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="Instruções para a IA nesta rodada (opcional). Ex.: compare o preço com o nosso plano; foque no público de hipnoterapeutas…" disabled={!iaSel.length} />
          <div className="flex flex-col items-end gap-2">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> refazer mesmo o que já existe</label>
            <Button onClick={run} disabled={!!busy || collecting}>
              {busy ? <><Spinner /> {busy === 'site' ? 'Baixando o site…' : busy === 'redes' ? 'Puxando redes…' : busy === 'ra' ? 'Buscando no Reclame Aqui…' : 'Enviando…'}</> : `Rodar ${sel.size} módulo(s)`}
            </Button>
            <div className="text-[11px] text-muted-foreground text-right">
              {scriptSel.length > 0 && <>agora: {scriptSel.map((m) => MOD[m].label).join(', ')}</>}
              {scriptSel.length > 0 && iaSel.length > 0 && ' · '}
              {iaSel.length > 0 && <>fila da IA: {iaSel.length}</>}
            </div>
          </div>
        </div>
      )}
      {sel.has('site') && !hasSite && <div className="mt-2 text-xs text-warning">Sem site cadastrado: marque também “Perfis e redes” (a IA acha o site) ou cole o link em Editar.</div>}
      <ErrorBox error={err} />
    </div>
  );
}

// ---------- cartão de módulo ----------
function ModuleCard({ slug, id, r, note, queued, wide, onSaved, children }: { slug: string; id: string; r: AnalysisResult; note: string; queued: boolean; wide: boolean; onSaved: () => void; children: ReactNode }) {
  const m = MOD[r.module];
  const [src, setSrc] = useState(false);
  return (
    <section className={cx('bg-card border border-border rounded-xl flex flex-col', wide && 'lg:col-span-2')}>
      <header className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm">{m.label}</h3>
        {r.confidence !== 'alta' && <Badge color={r.confidence === 'baixa' ? '#dc2626' : '#d97706'}>confiança {r.confidence}</Badge>}
        {queued && <Badge color="#7c3aed">na fila</Badge>}
        <span className="ml-auto text-[11px] text-muted-foreground" title={fmtDateTime(r.updatedAt)}>{r.by === 'script' ? 'script' : r.by.replace('claude-', '')} · {timeAgo(r.updatedAt)}</span>
        {r.sources.length > 0 && <button className="text-[11px] text-primary-ink" onClick={() => setSrc(!src)}>{r.sources.length} fonte(s)</button>}
      </header>
      {src && (
        <div className="px-4 py-2 text-xs border-b border-border bg-muted/50 space-y-0.5">
          {r.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block truncate text-muted-foreground hover:text-primary-ink">↗ {s.title ? `${s.title} — ` : ''}{s.url}</a>)}
        </div>
      )}
      <div className="px-4 py-3 text-sm flex-1">{children}</div>
      <div className="px-4 pb-3"><NoteBox slug={slug} id={id} k={r.module} value={note} onSaved={onSaved} /></div>
    </section>
  );
}

function NoteBox({ slug, id, k, value, onSaved, label, big }: { slug: string; id: string; k: string; value: string; onSaved: () => void; label?: string; big?: boolean }) {
  const [v, setV] = useState(value);
  const [open, setOpen] = useState(!!value || !!big);
  useEffect(() => setV(value), [value]);
  async function save() {
    if (v === value) return;
    try { await api.setAnalysisNote(slug, id, k, v); toast.ok('Anotação salva'); onSaved(); } catch (e) { toast.error(e, 'Não salvou a anotação'); }
  }
  if (!open) return <button className="text-xs text-muted-foreground hover:text-primary-ink" onClick={() => setOpen(true)}>✎ anotar</button>;
  return (
    <div className={cx(big && 'bg-amber-50/60 border border-amber-200 rounded-xl p-3')}>
      {label && <div className="text-xs font-medium text-amber-800 mb-1.5">✎ {label}</div>}
      <Textarea rows={big ? 3 : 2} value={v} onChange={(e) => setV(e.target.value)} onBlur={save}
        placeholder={big ? 'O que você acha deles, o que copiar, o que evitar… (salva ao sair do campo)' : 'Sua anotação sobre este módulo (salva ao sair do campo)'}
        className={cx('text-sm', !big && 'bg-amber-50/40 border-amber-200')} />
    </div>
  );
}

// ---------- corpo de cada módulo ----------
const L = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="mt-2 first:mt-0"><div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</div><div>{children}</div></div>
);
const List = ({ xs, empty = '—', className }: { xs: string[]; empty?: string; className?: string }) =>
  xs.length ? <ul className={cx('list-disc pl-4 space-y-0.5', className)}>{xs.map((x, i) => <li key={i}>{x}</li>)}</ul> : <span className="text-muted-foreground">{empty}</span>;
const Tags = ({ xs }: { xs: string[] }) => <div className="flex flex-wrap gap-1">{xs.map((x) => <span key={x} className="px-2 py-0.5 rounded-full bg-muted text-xs">{x}</span>)}</div>;

function Body({ m, r }: { m: ModuleId; r: AnalysisResult }) {
  const x = r.data as never;
  switch (m) {
    case 'resumo': return <Resumo d={x} />;
    case 'atuacao': return <Atuacao d={x} />;
    case 'precos': return <Precos d={x} />;
    case 'features': return <Features d={x} />;
    case 'forcas': return <Forcas d={x} />;
    case 'landing': return <Landing d={x} />;
    case 'reputacao': return <Reputacao d={x} />;
    case 'contato': return <Contato d={x} />;
    case 'perfis': return <Perfis d={x} />;
    case 'site': return <Site d={x} />;
    default: return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(r.data, null, 2)}</pre>;
  }
}

function Resumo({ d }: { d: ModuleDataOf<'resumo'> }) {
  return <>
    <p className="font-medium">{d.oneLiner}</p>
    <p className="mt-1.5 text-foreground/85 whitespace-pre-line">{d.text}</p>
    {d.audience && <L label="Público">{d.audience}</L>}
    {d.positioning && <L label="Posicionamento">“{d.positioning}”</L>}
    {d.size && <L label="Tamanho">{d.size}</L>}
  </>;
}
function Atuacao({ d }: { d: ModuleDataOf<'atuacao'> }) {
  const mk = MARKET[d.market];
  return <>
    <div className="flex items-center gap-2 text-base font-semibold"><span style={{ color: mk.color }}>{mk.label}</span></div>
    <div className="grid grid-cols-3 gap-2 mt-2">
      <L label="Países">{d.countries.join(', ') || '—'}</L>
      <L label="Idiomas">{d.languages.join(', ') || '—'}</L>
      <L label="Moedas">{d.currencies.join(', ') || '—'}</L>
    </div>
    <L label="Evidência"><span className="text-foreground/80">{d.evidence}</span></L>
  </>;
}
function Precos({ d }: { d: ModuleDataOf<'precos'> }) {
  return <>
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
      <div><span className="text-[11px] uppercase tracking-wide text-muted-foreground mr-1.5">a partir de</span><span className="text-xl font-semibold">{d.publicPrice ? money(d.fromMonthly ?? undefined, d.currency) : 'não divulgado'}</span>{d.publicPrice && d.fromMonthly != null && <span className="text-muted-foreground">/mês</span>}</div>
      <Badge>{d.model}</Badge>
      {d.trial && <span className="text-xs">🎁 {d.trial}</span>}
      {d.guarantee && <span className="text-xs">🛡 {d.guarantee}</span>}
    </div>
    {d.plans.length > 0 && (
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(190px, 1fr))` }}>
        {d.plans.map((p) => (
          <div key={p.name} className={cx('border rounded-lg p-3', p.recommended ? 'border-primary ring-1 ring-primary/30' : 'border-border')}>
            <div className="flex items-center gap-1.5 font-semibold">{p.name}{p.recommended && <Badge color="#4f46e5">destaque</Badge>}</div>
            <div className="mt-1"><span className="text-lg font-semibold tabular-nums">{money(p.monthly ?? undefined, d.currency)}</span><span className="text-muted-foreground text-xs">/mês</span></div>
            {p.yearlyMonthly != null && <div className="text-xs text-muted-foreground">no anual: {money(p.yearlyMonthly, d.currency)}/mês{p.yearlyTotal != null && ` (${money(p.yearlyTotal, d.currency)}/ano)`}</div>}
            {p.users && <div className="text-xs mt-1">👤 {p.users}</div>}
            {p.highlights.length > 0 && <List xs={p.highlights} className="mt-1.5 text-xs text-foreground/80" />}
          </div>
        ))}
      </div>
    )}
    {d.extras.length > 0 && <L label="Extras e add-ons"><List xs={d.extras} /></L>}
    {d.notes && <L label="Observações"><span className="text-foreground/80">{d.notes}</span></L>}
  </>;
}
function Features({ d }: { d: ModuleDataOf<'features'> }) {
  return <>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {d.groups.map((g) => (
        <div key={g.name}>
          <div className="text-xs font-semibold mb-1">{g.name} <span className="text-muted-foreground font-normal">{g.items.length}</span></div>
          <ul className="space-y-0.5">
            {g.items.map((it) => <li key={it.name} className="text-[13px] leading-snug" title={it.detail ?? undefined}>{it.highlight ? <span className="text-amber-500">★ </span> : <span className="text-muted-foreground">· </span>}{it.name}{it.detail && <span className="text-muted-foreground"> — {it.detail}</span>}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <div className="grid gap-3 md:grid-cols-2 mt-3 pt-3 border-t border-border">
      <L label="Diferenciais"><List xs={d.differentials} /></L>
      <L label="Não mostram (comum no setor)"><List xs={d.missing} /></L>
    </div>
  </>;
}
function Forcas({ d }: { d: ModuleDataOf<'forcas'> }) {
  const Col = ({ title, xs, color }: { title: string; xs: { point: string; evidence?: string }[]; color: string }) => (
    <div>
      <div className="text-xs font-semibold mb-1" style={{ color }}>{title}</div>
      <ul className="space-y-1.5">{xs.map((x, i) => <li key={i} className="text-[13px] leading-snug border-l-2 pl-2" style={{ borderColor: color }}>{x.point}{x.evidence && <div className="text-xs text-muted-foreground">{x.evidence}</div>}</li>)}</ul>
    </div>
  );
  return <>
    <div className="grid gap-4 md:grid-cols-2">
      <Col title="Pontos fortes" xs={d.strengths} color="#16a34a" />
      <Col title="Pontos fracos" xs={d.weaknesses} color="#dc2626" />
    </div>
    {d.opportunities.length > 0 && <div className="mt-3 bg-primary-soft rounded-lg p-3"><div className="text-xs font-semibold text-primary-ink mb-1">Brechas para nós</div><List xs={d.opportunities} /></div>}
  </>;
}
const SECTION_COLOR: Record<string, string> = { hero: '#4f46e5', 'prova-social': '#16a34a', depoimentos: '#16a34a', numeros: '#16a34a', logos: '#16a34a', precos: '#d97706', cta: '#dc2626', faq: '#0891b2', features: '#7c3aed', 'como-funciona': '#7c3aed', beneficios: '#7c3aed', problema: '#be123c', solucao: '#2563eb', comparativo: '#ca8a04', fundador: '#db2777' };
function Landing({ d }: { d: ModuleDataOf<'landing'> }) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="rounded-lg border border-border p-3 bg-muted/40">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Hero</div>
          <div className="font-semibold text-base leading-snug mt-0.5">{d.hero.headline}</div>
          {d.hero.subheadline && <div className="text-foreground/80 mt-1">{d.hero.subheadline}</div>}
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            {d.hero.cta && <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground">{d.hero.cta}</span>}
            {d.hero.visual && <span className="text-muted-foreground">🖼 {d.hero.visual}</span>}
          </div>
        </div>
        <L label={`Seções (${d.sections.length}, de cima para baixo)`}>
          <ol className="space-y-1">
            {d.sections.map((s, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-snug">
                <span className="text-muted-foreground tabular-nums w-5 shrink-0 text-right">{i + 1}.</span>
                <span className="shrink-0 text-[10px] px-1.5 h-fit mt-0.5 rounded-full font-medium" style={{ background: `${SECTION_COLOR[s.type] ?? '#71717a'}18`, color: SECTION_COLOR[s.type] ?? '#71717a' }}>{s.type}</span>
                <span><b className="font-medium">{s.title}</b> <span className="text-muted-foreground">— {s.summary}</span></span>
              </li>
            ))}
          </ol>
        </L>
        <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-primary-ink mt-2 inline-block">abrir a página ↗</a>
      </div>
      <div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><div className="text-xs font-semibold text-amber-800 mb-1">O que tem de interessante</div><List xs={d.interesting} /></div>
        <L label="CTAs"><Tags xs={d.ctas} /></L>
        <L label="Prova social"><List xs={d.socialProof} /></L>
        {d.tone && <L label="Tom">{d.tone}</L>}
      </div>
    </div>
  );
}
function Reputacao({ d }: { d: ModuleDataOf<'reputacao'> }) {
  const ra = d.reclameAqui;
  return <>
    {ra && (
      <div className="border border-border rounded-lg p-3">
        <div className="flex items-center gap-2"><b>Reclame Aqui</b>{ra.url && <a href={ra.url} target="_blank" rel="noreferrer" className="text-xs text-primary-ink">↗</a>}</div>
        {ra.found ? (
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
            <span className="text-xl font-semibold">{ra.score?.toLocaleString('pt-BR') ?? '—'}<span className="text-xs text-muted-foreground">/10</span></span>
            {ra.status && <Badge color={/ótimo|bom/i.test(ra.status) ? '#16a34a' : /regular/i.test(ra.status) ? '#d97706' : '#dc2626'}>{ra.status}</Badge>}
            {ra.complaints != null && <span className="text-xs">{ra.complaints} reclamações</span>}
            {ra.responseRate != null && <span className="text-xs">respondeu {ra.responseRate}%</span>}
            {ra.solvedRate != null && <span className="text-xs">resolveu {ra.solvedRate}%</span>}
            {ra.period && <span className="text-xs text-muted-foreground">{ra.period}</span>}
          </div>
        ) : <div className="text-muted-foreground text-xs mt-1">Sem página no Reclame Aqui</div>}
        {ra.topComplaints.length > 0 && <L label="Reclamações recorrentes"><List xs={ra.topComplaints} /></L>}
      </div>
    )}
    {d.stores.length > 0 && <div className="flex flex-wrap gap-3 mt-2">{d.stores.map((s) => <a key={s.store + s.url} href={s.url ?? undefined} target="_blank" rel="noreferrer" className="text-xs border border-border rounded-md px-2 py-1">{s.store} ★ {s.rating ?? '—'}{s.reviews != null && ` (${s.reviews})`}</a>)}</div>}
    <p className="mt-2 text-foreground/85">{d.summary}</p>
    {d.mentions.length > 0 && <L label="Menções">{d.mentions.map((x, i) => <div key={i} className="text-xs"><b>{x.source}</b>: {x.summary} {x.url && <a href={x.url} target="_blank" rel="noreferrer" className="text-primary-ink">↗</a>}</div>)}</L>}
  </>;
}
function Contato({ d }: { d: ModuleDataOf<'contato'> }) {
  return <div className="grid grid-cols-2 gap-x-4">
    <L label="E-mails">{d.emails.join(', ') || '—'}</L>
    <L label="WhatsApp">{d.whatsapp.join(', ') || '—'}</L>
    <L label="Telefones">{d.phones.join(', ') || '—'}</L>
    <L label="CNPJ">{d.cnpj ?? '—'}{d.companyName && <div className="text-xs text-muted-foreground">{d.companyName}</div>}</L>
    {(d.address || d.city) && <L label="Endereço">{[d.address, d.city].filter(Boolean).join(' · ')}</L>}
    {d.support && <L label="Suporte">{d.support}</L>}
    {d.socials.length > 0 && <div className="col-span-2"><L label="Redes no site"><div className="flex flex-wrap gap-2">{d.socials.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs hover:text-primary-ink"><PlatformIcon platform={s.platform} size={13} />{s.url.replace(/^https?:\/\/(www\.)?/, '')}</a>)}</div></L></div>}
  </div>;
}
function Perfis({ d }: { d: ModuleDataOf<'perfis'> }) {
  return <>
    <div className="space-y-1">{d.found.map((p) => (
      <div key={p.url} className="flex items-center gap-2"><PlatformIcon platform={p.platform} size={15} /><a href={p.url} target="_blank" rel="noreferrer" className="hover:text-primary-ink truncate">{platformLabel(p.platform)} {p.handle ? `· ${p.handle}` : p.url.replace(/^https?:\/\//, '')}</a>{p.note && <span className="text-xs text-muted-foreground truncate">{p.note}</span>}</div>
    ))}</div>
    {d.notFound.length > 0 && <div className="text-xs text-muted-foreground mt-2">Não achado: {d.notFound.join(', ')}</div>}
    <div className="text-xs text-muted-foreground mt-1">Os links confirmados já entram nos perfis do concorrente (coleta das redes).</div>
  </>;
}
function Site({ d }: { d: ModuleDataOf<'site'> }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <div>
      <a href={d.url} target="_blank" rel="noreferrer" className="font-medium hover:text-primary-ink">{d.url.replace(/^https?:\/\//, '')} ↗</a>
      <L label={`Páginas baixadas (${d.pages.length})`}>
        {d.pages.map((p) => <div key={p.url} className="text-[13px] flex gap-2"><Badge>{p.kind}</Badge><a href={p.url} target="_blank" rel="noreferrer" className="truncate hover:text-primary-ink">{p.title || p.url}</a><span className="text-xs text-muted-foreground ml-auto shrink-0">{(p.chars / 1000).toFixed(1)}k</span></div>)}
      </L>
      {d.errors.length > 0 && <L label="Avisos"><List xs={d.errors} className="text-warning text-xs" /></L>}
    </div>
    <div>
      <L label={`Sitemap básico · ${d.sitemap.total} URLs (${d.sitemap.source})`}>
        <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5">
          {d.sitemap.groups.map((g) => (
            <details key={g.name} className="text-[13px]">
              <summary className="cursor-pointer"><span className="font-mono">{g.name}</span> <span className="text-muted-foreground">{g.count}</span></summary>
              <div className="pl-4 text-xs text-muted-foreground font-mono">{g.sample.map((s) => <div key={s} className="truncate">{s}</div>)}</div>
            </details>
          ))}
        </div>
      </L>
    </div>
  </div>;
}
