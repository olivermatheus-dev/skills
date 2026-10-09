// Análise do concorrente por área de marketing (Diagnóstico, Oferta, Produto, Mensagem, Reputação, Dados): resultado de cada
// módulo e anotação por módulo (do Oliver: a IA nunca sobrescreve). Escolher o que rodar fica no diálogo do "Puxar" (RunDialog).
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, avisoFila, type AnalysisFull, type AnalysisResult, type Competitor, type ModuleId } from '../../api';
import { MODULES, FULL_ANALYSIS } from '../../../../schema/analysis';
import type { ModuleDataOf } from '../../../../schema/analysis';
import { qk, useAnalysis } from '../../queries';
import { toast } from '../toast';
import { Badge, Button, ErrorBox, Textarea, cx } from '../kit';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { PlatformIcon, Spinner, platformLabel, timeAgo, fmtDateTime } from './lib';
import { AtSign, BadgeDollarSign, FileText, Globe, Hourglass, LayoutTemplate, Lightbulb, ListChecks, MapPin, Pencil, Phone, Play, Scale, ScanSearch, ShieldCheck, Sparkles, StickyNote } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Secao } from './ficha/FichaPanel';
import { PedidoStatus, PedirIa, usePedidoIa } from '../atividade/PedidoIa';

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
/** áreas da ficha, do ponto de vista do marketing; "atuacao" vira chip no cabeçalho e fica em Dados */
export const AREAS = [
  { id: 'diagnostico', label: 'Diagnóstico', modules: ['resumo', 'forcas'] },
  { id: 'oferta', label: 'Oferta', modules: ['precos'] },
  { id: 'produto', label: 'Produto', modules: ['features'] },
  { id: 'mensagem', label: 'Posicionamento', modules: ['landing'] },
  { id: 'reputacao', label: 'Reputação', modules: ['reputacao'] },
  { id: 'dados', label: 'Dados', modules: ['atuacao', 'contato', 'perfis', 'site'] },
] as const satisfies readonly { id: string; label: string; modules: readonly ModuleId[] }[];
export type AreaId = (typeof AREAS)[number]['id'];
const ageDays = (iso?: string) => (iso ? (Date.now() - Date.parse(iso)) / 86_400_000 : Infinity);
export const money = (v?: number, cur = 'BRL') => (v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: cur, maximumFractionDigits: v % 1 ? 2 : 0 }));

/** atualiza análise, ficha e listas (a IA grava pelos scripts) */
function useRefresh(slug: string, id: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: qk.analysis(slug, id) });
    void qc.invalidateQueries({ queryKey: qk.analysisOverview(slug) });
    void qc.invalidateQueries({ queryKey: qk.competitor(slug, id) });
    void qc.invalidateQueries({ queryKey: qk.competitors(slug) });
  };
}

export default function AnalysisPanel({ slug, c, area, onRun }: { slug: string; c: Competitor; area: AreaId; onRun: () => void }) {
  const a = useAnalysis(slug, c.id);
  const d = a.data;
  const refresh = useRefresh(slug, c.id);
  // enquanto houver pedido na fila, confere de tempos em tempos
  useEffect(() => {
    if (!d?.request) return;
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [d?.request?.requestedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (a.isLoading) return <div className="mt-5 h-40 rounded-xl bg-card border border-border animate-pulse" />;
  if (a.error || !d) return <ErrorBox error={a.error ?? new Error('sem dados')} />;

  const def = AREAS.find((x) => x.id === area) ?? AREAS[0];
  const mods = def.modules as readonly ModuleId[];
  const shown = mods.filter((m) => d.results[m]);
  const pending = mods.filter((m) => !d.results[m]);
  const interesting = area === 'diagnostico' ? (d.results.landing?.data as ModuleDataOf<'landing'> | undefined)?.interesting ?? [] : [];
  // uma superfície só, cada módulo uma seção separada por divisor (mesmo padrão dos painéis de conteúdo e de anúncio)
  return (
    <div className="mt-5 rounded-xl border border-border bg-card p-6 space-y-5">
      {!shown.length && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">Ainda sem {pending.map((m) => MOD[m].label.toLowerCase()).join(' e ')}.</p>
          <Button variant="ai" onClick={onRun} className="inline-flex items-center gap-1.5"><ScanSearch className="size-4" />Analisar</Button>
        </div>
      )}
      {shown.map((m, i) => (
        <Fragment key={m}>
          {i > 0 && <Separator />}
          <ModuloSecao slug={slug} id={c.id} r={d.results[m]!} note={d.notes[m]?.text ?? ''} queued={!!d.request?.modules.includes(m)} onSaved={refresh}>
            <Body m={m} r={d.results[m]!} />
          </ModuloSecao>
        </Fragment>
      ))}
      {interesting.length > 0 && <>
        <Separator />
        <Secao icone={<Lightbulb />} titulo="O que vale copiar" dica="Tirado da análise da landing page (aba Posicionamento).">
          <List xs={interesting} className="text-sm" />
        </Secao>
      </>}
      {shown.length > 0 && pending.length > 0 && <p className="text-xs text-muted-foreground">Falta: {pending.map((m) => MOD[m].label).join(', ')} · <button className="text-ai-ink font-medium hover:underline" onClick={onRun}>analisar</button></p>}
      {area === 'diagnostico' && <>
        <Separator />
        <Secao icone={<StickyNote />} titulo="Minhas anotações" dica="O que você acha deles, o que copiar, o que evitar. A IA nunca sobrescreve.">
          <NoteBox slug={slug} id={c.id} k="geral" value={d.notes.geral?.text ?? ''} onSaved={refresh} big />
        </Secao>
      </>}
    </div>
  );
}

/** pedido na fila da IA, em uma linha (cabeçalho da ficha): Rodar agora (046 D) ou o andamento */
export function QueueChip({ slug, c }: { slug: string; c: Competitor }) {
  const a = useAnalysis(slug, c.id);
  const refresh = useRefresh(slug, c.id);
  const { pedido, rodando, atualizar } = usePedidoIa(slug, `analise:${c.id}`, { enquantoRoda: refresh, aoTerminar: refresh });
  const r = a.data?.request;
  if (rodando) return <PedidoStatus slug={slug} pedido={pedido} className="max-w-md !py-0.5 rounded-full" />;
  if (!r) return null;
  async function cancel() {
    try { await api.cancelAnalysis(slug, c.id); toast.ok('Pedido cancelado'); } catch (e) { toast.error(e, 'Não cancelou'); } finally { refresh(); }
  }
  const mods = r.modules.map((m) => MOD[m]?.label ?? m).join(', ');
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-ai-soft border border-ai-border text-ai-ink rounded-full pl-2 pr-1 py-0.5"
      title={`${mods} · pedido ${timeAgo(r.requestedAt)}`}>
      <Hourglass className="size-3" />na fila da IA · {r.modules.length}
      <RodarAnalise slug={slug} comp={c.id} titulo={`Rodar a análise de ${c.name}`} mods={mods.toLowerCase()} onFeito={() => { atualizar(); refresh(); }}
        trigger={<button className="inline-flex items-center gap-0.5 rounded-full bg-ai text-white px-1.5 py-px hover:bg-ai-ink"><Play className="size-3" />Rodar agora</button>} />
      <button className="px-1 rounded-full hover:bg-ai-muted" onClick={cancel} aria-label="Cancelar pedido">×</button>
    </span>
  );
}

/** popover "Rodar agora" da fila de análise (um concorrente ou a fila inteira), pelo mesmo caminho do Rodar IA */
export function RodarAnalise({ slug, comp, titulo, mods, trigger, onFeito }: { slug: string; comp?: string; titulo: string; mods: string; trigger: ReactNode; onFeito?: () => void }) {
  return (
    <PedirIa trigger={trigger} titulo={titulo} instrucoes={false}
      descricao={<>O pesquisador roda {mods}: script no que é mecânico (site, Reclame Aqui) e um subagente Sonnet por concorrente no que exige leitura. As instruções que você deixou no pedido valem.</>}
      onRodar={async (modo) => { const r = await api.rodarAnalise(slug, { comp, modo }); toast.ok(modo === 'terminal' ? 'Claude Code aberto num terminal' : avisoFila(r.fila, 'Análise rodando em segundo plano')); onFeito?.(); }} />
  );
}

/** a fila inteira (Lista e Coletas): "N na fila da IA · Rodar agora", ou o andamento */
export function FilaAnalise({ slug, fila }: { slug: string; fila: { id: string; name: string; modules: string[] }[] }) {
  const qc = useQueryClient();
  const refresh = () => { void qc.invalidateQueries({ queryKey: qk.analysisOverview(slug) }); void qc.invalidateQueries({ queryKey: ['analysis', slug] }); };
  const { pedido, rodando, atualizar } = usePedidoIa(slug, 'analise:*', { enquantoRoda: refresh, aoTerminar: refresh });
  if (rodando) return <PedidoStatus slug={slug} pedido={pedido} className="max-w-sm" />;
  if (!fila.length) return null;
  return (
    <RodarAnalise slug={slug} titulo={`Rodar a fila de análise (${fila.length} concorrente${fila.length > 1 ? 's' : ''})`}
      mods={fila.map((f) => `${f.name} (${f.modules.map((m) => MOD[m as ModuleId]?.label.toLowerCase() ?? m).join(', ')})`).join('; ')}
      onFeito={() => { atualizar(); refresh(); }}
      trigger={<button className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-ai-soft text-ai-ink border border-ai-border hover:bg-ai-muted">
        <Hourglass className="size-3.5" />{fila.length} na fila da IA · <span className="inline-flex items-center gap-0.5 font-medium"><Play className="size-3" />Rodar agora</span>
      </button>} />
  );
}

// ---------- escolher e rodar (diálogo do "Puxar") ----------
/** diálogo do Puxar (coleta: redes e site) e do Analisar (módulos da IA); `inicial` só muda a pré-seleção e o título */
export function RunDialog({ slug, c, open, onOpenChange, onCollect, inicial = 'coleta' }: { slug: string; c: Competitor; open: boolean; onOpenChange: (v: boolean) => void; onCollect: () => Promise<void>; inicial?: 'coleta' | 'analise' }) {
  const a = useAnalysis(slug, c.id);
  const d = a.data;
  const refresh = useRefresh(slug, c.id);
  const hasNet = c.profiles.some((p) => p.platform !== 'site');
  const hasSite = c.profiles.some((p) => p.platform === 'site');
  const missing = useMemo(() => FULL_ANALYSIS.filter((m) => (m === 'redes' ? false : ageDays(d?.results[m]?.updatedAt) > STALE_DAYS)), [d?.results]);
  const preset = (ms: ModuleId[]) => new Set<ModuleId>([...(hasNet ? ['redes' as ModuleId] : []), ...ms]);
  const [sel, setSel] = useState<Set<ModuleId>>(new Set());
  const [force, setForce] = useState(false);
  const [instr, setInstr] = useState('');
  const [agora, setAgora] = useState(true);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<unknown>(null);
  // ao abrir: redes + o que falta
  // Puxar: as redes (e o site, se nunca baixado); Analisar: os módulos da IA que faltam ou estão velhos (nenhum faltando = todos)
  const iaMods: ModuleId[] = MODULES.filter((m) => m.engine !== 'script').map((m) => m.id);
  const faltaIa = missing.filter((m) => iaMods.includes(m));
  useEffect(() => { if (open) { setSel(inicial === 'analise' ? new Set(faltaIa.length ? faltaIa : iaMods) : preset(missing.filter((m) => !iaMods.includes(m)))); setErr(null); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (m: ModuleId) => setSel((s) => { const n = new Set(s); if (n.has(m)) n.delete(m); else n.add(m); return n; });
  const iaSel = [...sel].filter((m) => MOD[m].engine !== 'script');

  async function run() {
    setErr(null);
    try {
      // a coleta das redes roda no fundo (a ficha mostra o progresso); o diálogo segue com o resto
      if (sel.has('redes')) void onCollect();
      if (iaSel.length) {
        setBusy('fila');
        const needSite = iaSel.some((m) => MOD[m].needsSite) && !d?.results.site && !sel.has('site');
        await api.requestAnalysis(slug, c.id, { modules: needSite ? [...iaSel, 'site'] : iaSel, force, instructions: instr });
        if (!agora) toast.ok(`${iaSel.length} módulo(s) na fila da IA`);
      }
      if (sel.has('site')) {
        setBusy('site');
        const r = await api.runSite(slug, c.id);
        if (r.ok) toast.ok(`Site: ${r.pages} páginas, sitemap com ${r.sitemap} URLs`);
        else toast.error(new Error(r.errors.join(' · ') || 'falhou'), 'Site não baixado');
      }
      if (sel.has('reputacao')) {
        setBusy('ra');
        try { const h = await api.runReclameAqui(slug, c.id); toast.ok(h.found ? `Reclame Aqui: ${h.status}${h.score != null ? ` ${h.score}` : ''} · ${h.complaints} reclamações` : 'Reclame Aqui: não achado'); }
        catch (e) { toast.error(e, 'Reclame Aqui não respondeu (a IA tenta na fila)'); }
      }
      // depois do script (site já baixado): a IA roda agora, em segundo plano (046 D)
      if (iaSel.length && agora) {
        try { const r = await api.rodarAnalise(slug, { comp: c.id }); toast.ok(avisoFila(r.fila, `IA rodando ${iaSel.length} módulo(s) em segundo plano`)); void qc.invalidateQueries({ queryKey: ['pedido-ia', slug] }); }
        catch (e) { toast.error(e, 'Ficou na fila (use Rodar agora quando a IA estiver livre)'); }
      }
      setInstr(''); setForce(false);
      onOpenChange(false);
    } catch (e) { setErr(e); } finally { setBusy(null); refresh(); }
  }

  const chip = 'px-2 py-1 rounded-md border border-border hover:border-primary';
  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="sm:max-w-xl gap-3">
        <DialogHeader>
          <DialogTitle className="text-base">{inicial === 'analise' ? 'Analisar' : 'Puxar'} {c.name}</DialogTitle>
          <DialogDescription className="text-xs">Script roda agora e é grátis; a IA roda em segundo plano (ou fica na fila, se desmarcar). Rode só o necessário.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-1.5 text-xs">
          <button className={chip} onClick={() => setSel(preset(missing))}>Redes + o que falta ({missing.length})</button>
          <button className={chip} onClick={() => setSel(preset([]))}>Só redes</button>
          <button className={chip} onClick={() => setSel(new Set(FULL_ANALYSIS))}>Completa</button>
          <button className="px-2 py-1 rounded-md text-muted-foreground hover:text-foreground ml-auto" onClick={() => setSel(new Set())}>Limpar</button>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border max-h-[50vh] overflow-y-auto">
          {[...MODULES].sort((x, y) => Number(y.id === 'redes') - Number(x.id === 'redes')).map((m) => {
            const r = d?.results[m.id];
            const stale = r && ageDays(r.updatedAt) > STALE_DAYS;
            const blocked = m.id === 'redes' && !hasNet;
            return (
              <label key={m.id} title={m.hint} className={cx('flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer select-none hover:bg-muted/50', blocked && 'opacity-50 cursor-not-allowed')}>
                <input type="checkbox" checked={sel.has(m.id)} disabled={blocked} onChange={() => toggle(m.id)} />
                <span className="font-medium">{m.label}</span>
                <span className="text-[10px] px-1.5 rounded-full font-medium" style={{ background: `${ENGINE[m.engine].color}18`, color: ENGINE[m.engine].color }} title={ENGINE[m.engine].title}>{ENGINE[m.engine].label}</span>
                <span className={cx('ml-auto text-xs', r && !stale ? 'text-muted-foreground' : m.id === 'redes' ? 'text-muted-foreground' : 'text-warning-ink')}>
                  {d?.request?.modules.includes(m.id) ? <span className="text-ai">na fila</span> : r ? `${timeAgo(r.updatedAt)}${stale ? ' (velho)' : ''}` : m.id === 'redes' ? 'perfis e conteúdos' : 'nunca'}
                </span>
              </label>
            );
          })}
        </div>
        {iaSel.length > 0 && <>
          <Textarea rows={2} value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="Instruções para a IA (opcional). Ex.: compare o preço com o nosso plano…" className="text-sm" />
          <div className="flex gap-4">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><input type="checkbox" checked={agora} onChange={(e) => setAgora(e.target.checked)} /> rodar a IA agora (segundo plano)</label>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> refazer mesmo o que já existe</label>
          </div>
        </>}
        {sel.has('site') && !hasSite && <div className="text-xs text-warning-ink">Sem site cadastrado: marque “Perfis e redes” (a IA acha o site) ou cole o link em Editar.</div>}
        <ErrorBox error={err} />
        <div className="flex items-center gap-2 justify-end">
          <span className="text-xs text-muted-foreground mr-auto">{sel.size} selecionado(s){iaSel.length ? ` · ${iaSel.length} na IA` : ''}</span>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={!!busy}>Cancelar</Button>
          <Button variant={iaSel.length ? 'ai' : 'primary'} onClick={run} disabled={!!busy || !sel.size}>
            {busy ? <><Spinner /> {busy === 'site' ? 'Baixando o site…' : busy === 'ra' ? 'Reclame Aqui…' : 'Enviando…'}</> : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- seção de módulo ----------
const ICONE: Partial<Record<ModuleId, ReactNode>> = {
  resumo: <FileText />, forcas: <Scale />, precos: <BadgeDollarSign />, features: <ListChecks />, landing: <LayoutTemplate />,
  reputacao: <ShieldCheck />, atuacao: <MapPin />, contato: <Phone />, perfis: <AtSign />, site: <Globe />,
};
/** um módulo da análise: título com ícone; à direita confiança, quem fez e quando, fontes e "anotar" */
function ModuloSecao({ slug, id, r, note, queued, onSaved, children }: { slug: string; id: string; r: AnalysisResult; note: string; queued: boolean; onSaved: () => void; children: ReactNode }) {
  const m = MOD[r.module];
  const [src, setSrc] = useState(false);
  const [anotar, setAnotar] = useState(!!note);
  const ia = r.by !== 'script';
  return (
    <Secao icone={ICONE[r.module]} titulo={m.label} dica={m.hint}
      aside={<span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
        {r.confidence !== 'alta' && <span className={cx('rounded-full px-1.5 py-px font-medium', r.confidence === 'baixa' ? 'bg-destructive/10 text-destructive' : 'bg-warning/15 text-warning-ink')}>confiança {r.confidence}</span>}
        {queued && <span className="rounded-full px-1.5 py-px font-medium bg-ai-soft text-ai-ink">na fila</span>}
        <span title={fmtDateTime(r.updatedAt)} className={cx('inline-flex items-center gap-1', ia && 'text-ai-ink')}>{ia && <Sparkles className="!size-3" />}{ia ? r.by.replace('claude-', '') : 'script'} · {timeAgo(r.updatedAt)}</span>
        {r.sources.length > 0 && <button className="hover:text-foreground underline-offset-2 hover:underline" onClick={() => setSrc(!src)}>{r.sources.length} fonte(s)</button>}
        {!anotar && <button className="hover:text-foreground inline-flex items-center gap-1" onClick={() => setAnotar(true)}><Pencil className="!size-3" />anotar</button>}
      </span>}>
      {src && (
        <div className="rounded-lg bg-muted/60 px-3 py-2 text-xs space-y-0.5">
          {r.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block truncate text-muted-foreground hover:text-primary-ink">↗ {s.title ? `${s.title} — ` : ''}{s.url}</a>)}
        </div>
      )}
      <div className="text-sm">{children}</div>
      {anotar && <NoteBox slug={slug} id={id} k={r.module} value={note} onSaved={onSaved} />}
    </Secao>
  );
}

/** anotação do Oliver num módulo (ou a geral, `big`): salva ao sair do campo */
function NoteBox({ slug, id, k, value, onSaved, big }: { slug: string; id: string; k: string; value: string; onSaved: () => void; big?: boolean }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  async function save() {
    if (v === value) return;
    try { await api.setAnalysisNote(slug, id, k, v); toast.ok('Anotação salva'); onSaved(); } catch (e) { toast.error(e, 'Não salvou a anotação'); }
  }
  return (
    <Textarea autoFocus={!big && !value} rows={big ? 4 : 2} value={v} onChange={(e) => setV(e.target.value)} onBlur={save}
      placeholder={big ? 'O que você acha deles, o que copiar, o que evitar… (salva ao sair do campo)' : 'Sua anotação sobre este módulo (salva ao sair do campo)'}
      className="text-sm" />
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
      {d.errors.length > 0 && <L label="Avisos"><List xs={d.errors} className="text-warning-ink text-xs" /></L>}
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
