// Seleção para análise (040 E): caixas na tabela/cards, atalhos Top 10/20 pela ordem atual, "Incluir já analisados",
// barra fixa embaixo (N selecionados · ~US$ · ~min · Analisar), diálogo curto com Rodar agora e a faixa ao vivo da fila.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Clock, ListChecks, ListOrdered, ScanSearch, Square, TriangleAlert, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Switch } from '../../ui/switch';
import { Button, cx } from '../../kit';
import { PlatformIcon, Spinner, platformLabel } from '../lib';
import { titleOf, type FichaSelo } from '../Items';
import type { CRow } from '../ContentsView';
import { estimativa, fmtUsd, type useFichasFila } from './useFila';

type Fila = ReturnType<typeof useFichasFila>;
type Bulk = { kind: 'top'; n: number } | { kind: 'all' };

// ───────────────────────── estado da seleção ─────────────────────────
export function useSelecao(shown: CRow[], compOf: (r: CRow) => string | undefined, selo: (r: CRow) => FichaSelo | undefined) {
  const [sel, setSel] = useState<Map<string, CRow>>(() => new Map());
  const [incluir, setIncluirState] = useState(false);
  const [bulk, setBulk] = useState<Bulk | null>(null);
  const [fora, setFora] = useState(0);
  const idOf = (r: CRow) => `${compOf(r)}|${r.mk}`;
  const analisada = (r: CRow) => !!selo(r)?.analisada;
  const motivo = (r: CRow, inc = incluir): string | null =>
    !compOf(r) ? 'sem concorrente' : selo(r)?.analisando ? 'A IA está analisando este agora' : !inc && analisada(r) ? 'Já analisado: ligue "Incluir já analisados" para reanalisar' : null;

  const aplicar = (b: Bulk, inc = incluir) => {
    const pool = b.kind === 'top' ? shown.slice(0, b.n) : shown;
    const ok = pool.filter((r) => !motivo(r, inc));
    setFora(inc ? 0 : pool.filter(analisada).length);
    setSel(new Map(ok.map((r) => [idOf(r), r])));
    setBulk(b);
  };
  const toggle = (r: CRow) => {
    if (motivo(r)) return;
    setSel((m) => { const n = new Map(m); const k = idOf(r); if (n.has(k)) n.delete(k); else n.set(k, r); return n; });
  };
  const setIncluir = (v: boolean) => {
    setIncluirState(v);
    if (bulk) aplicar(bulk, v);
    else if (!v) {
      const tirar = [...sel.values()].filter(analisada);
      if (tirar.length) { setFora(tirar.length); setSel((m) => new Map([...m].filter(([, r]) => !analisada(r)))); }
    }
  };
  const limpar = () => { setSel(new Map()); setBulk(null); setFora(0); };
  // "selecionar tudo" (cabeçalho): todos os visíveis que podem entrar
  const elegiveis = shown.filter((r) => !motivo(r));
  const marcados = elegiveis.filter((r) => sel.has(idOf(r))).length;
  const todos: boolean | 'indeterminate' = marcados === 0 ? false : marcados === elegiveis.length ? true : 'indeterminate';
  const toggleTodos = () => (todos === true ? limpar() : aplicar({ kind: 'all' }));
  const itens = [...sel.values()];
  return { sel, itens, has: (r: CRow) => sel.has(idOf(r)), motivo, toggle, aplicar, limpar, incluir, setIncluir, fora, todos, toggleTodos, nElegiveis: elegiveis.length, compOf, analisada };
}
export type Selecao = ReturnType<typeof useSelecao>;

/** caixa do cabeçalho / da linha (input nativo: leve e acessível; nada de propagar o clique para a linha) */
export function Caixa({ checked, onChange, disabled, title, label }: { checked: boolean | 'indeterminate'; onChange: () => void; disabled?: boolean; title?: string; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = checked === 'indeterminate'; }, [checked]);
  return (
    <label title={title ?? undefined} onClick={(e) => e.stopPropagation()} className={cx('-m-2 p-2 grid place-items-center', disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer')}>
      <input ref={ref} type="checkbox" aria-label={label} className="size-4 accent-[var(--primary)] cursor-[inherit]" checked={checked === true} disabled={disabled} onChange={onChange} />
    </label>
  );
}

// ───────────────────────── botão "Analisar" na barra de filtros (Top 10/20) ─────────────────────────
export function AnalisarMenu({ s, rede, ordem }: { s: Selecao; rede: string; ordem: string }) {
  const [open, setOpen] = useState(false);
  const top = (n: number) => { s.aplicar({ kind: 'top', n }); setOpen(false); };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" title="Selecionar conteúdos para a IA analisar (Top 10, Top 20 ou as caixas da lista)"
          className={cx('h-8 inline-flex items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition whitespace-nowrap',
            s.itens.length ? 'border-ai-border bg-ai-soft text-ai-ink' : 'border-border bg-card text-foreground hover:bg-muted')}>
          <ScanSearch className="size-4" />Analisar<ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="text-sm font-semibold">Analisar com a IA</div>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2.5">Pega os primeiros da lista como está: ordem <b className="font-medium text-foreground">{ordem}</b>, {rede ? <>só <b className="font-medium text-foreground">{platformLabel(rede)}</b></> : 'todas as redes'}.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="soft" className="inline-flex items-center justify-center gap-1.5" onClick={() => top(10)}><ListOrdered className="size-4" />Top 10</Button>
          <Button variant="soft" className="inline-flex items-center justify-center gap-1.5" onClick={() => top(20)}><ListOrdered className="size-4" />Top 20</Button>
        </div>
        <button type="button" onClick={() => { s.aplicar({ kind: 'all' }); setOpen(false); }} className="mt-2 w-full inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
          <ListChecks className="size-3.5" />Todos os {s.nElegiveis} visíveis
        </button>
        <label className="mt-2 pt-2.5 border-t border-border flex items-center justify-between gap-3 text-xs cursor-pointer">
          <span><span className="font-medium text-foreground">Incluir já analisados</span><br /><span className="text-muted-foreground">reanalisa e custa de novo</span></span>
          <Switch checked={s.incluir} onCheckedChange={s.setIncluir} aria-label="Incluir já analisados" />
        </label>
        <p className="mt-2.5 text-[11px] text-muted-foreground">Ou marque as caixas na lista.</p>
      </PopoverContent>
    </Popover>
  );
}

// ───────────────────────── barra fixa embaixo ─────────────────────────
export function SelecaoBar({ s, onAnalisar, busy }: { s: Selecao; onAnalisar: () => void; busy: boolean }) {
  const n = s.itens.length;
  if (!n && !s.fora) return null;
  const e = estimativa(n);
  return (
    <div role="region" aria-label="Seleção para análise" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg text-sm">
        <button type="button" onClick={s.limpar} title="Limpar a seleção" aria-label="Limpar a seleção" className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
        <span className="font-semibold tabular-nums whitespace-nowrap">{n} selecionado{n === 1 ? '' : 's'}</span>
        {s.fora > 0 && <span className="text-xs text-muted-foreground whitespace-nowrap" title="Sem o “Incluir já analisados”, o que já tem análise fica fora (reanalisar custa de novo)">{s.fora} já analisado{s.fora === 1 ? '' : 's'} ficaram de fora</span>}
        {n > 0 && <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap" title="≈ US$ 0,08 por item no Opus (equivalente na API, §5b). Pela assinatura do Claude Code não há cobrança por token: consome a cota.">~{fmtUsd(e.usd)} · ~{e.min} min</span>}
        <span className="h-5 w-px bg-border" />
        <label className="inline-flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer">
          <Switch checked={s.incluir} onCheckedChange={s.setIncluir} aria-label="Incluir já analisados" />Incluir já analisados
        </label>
        <Button disabled={!n || busy} onClick={onAnalisar} className="inline-flex items-center gap-1.5 whitespace-nowrap"><ScanSearch className="size-4" />Analisar</Button>
      </div>
    </div>
  );
}

// ───────────────────────── diálogo ─────────────────────────
export function AnalisarDialog({ open, onOpenChange, s, fila, compName, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; s: Selecao; fila: Fila; compName: (comp: string) => string; onDone: () => void;
}) {
  const [reanalisar, setReanalisar] = useState(true);
  useEffect(() => { if (open) setReanalisar(true); }, [open]);
  const todos = s.itens;
  const jaAnalisados = todos.filter(s.analisada);
  const itens = reanalisar ? todos : todos.filter((r) => !s.analisada(r));
  const e = estimativa(itens.length);
  const ig = itens.filter((r) => r.platform === 'instagram' && r.item.type !== 'post' && r.item.type !== 'carrossel');
  const igSemCookies = ig.length > 0 && !fila.status?.igCookies;
  const ocupado = fila.status?.ocupado ?? (fila.running ? { task: null, title: 'a fila de fichas', slug: null } : null);
  const grupos = useMemo(() => {
    const m = new Map<string, CRow[]>();
    for (const r of itens) { const c = s.compOf(r) ?? '?'; m.set(c, [...(m.get(c) ?? []), r]); }
    return [...m];
  }, [itens, s]);
  const enviar = (rodar: boolean) => fila.pedir.mutate(
    { itens: itens.map((r) => ({ comp: s.compOf(r)!, key: r.mk })), reanalisar: reanalisar && jaAnalisados.length > 0, origem: 'selecao', rodar },
    { onSuccess: () => { onOpenChange(false); onDone(); } },
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-3">
        <DialogTitle>Analisar {itens.length} conteúdo{itens.length === 1 ? '' : 's'}</DialogTitle>
        <DialogDescription className="-mt-1">
          A IA prepara (transcrição e quadros), analisa cada um no Opus e grava a ficha. Você acompanha aqui; ao terminar, o painel abre.
        </DialogDescription>

        <div className="rounded-lg border border-border divide-y divide-border max-h-56 overflow-auto">
          {grupos.map(([comp, rs]) => (
            <div key={comp} className="px-3 py-2">
              <div className="text-xs font-semibold text-foreground mb-1">{compName(comp)} <span className="font-normal text-muted-foreground">· {rs.length}</span></div>
              <ul className="space-y-0.5">
                {rs.slice(0, 5).map((r) => (
                  <li key={r.mk} className="flex items-center gap-1.5 text-xs min-w-0">
                    <PlatformIcon platform={r.platform} size={13} />
                    <span className="truncate">{titleOf(r)}</span>
                    {s.analisada(r) && <span className="ml-auto shrink-0 text-[10px] text-ai-ink">reanálise</span>}
                  </li>
                ))}
                {rs.length > 5 && <li className="text-[11px] text-muted-foreground">+ {rs.length - 5} outro(s)</li>}
              </ul>
            </div>
          ))}
          {!itens.length && <div className="px-3 py-3 text-xs text-muted-foreground">Nada para analisar: ligue “reanalisar” ou escolha outros itens.</div>}
        </div>

        {igSemCookies && (
          <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
            <TriangleAlert className="size-4 shrink-0 mt-px" />
            <span><b className="font-semibold">{ig.length} do Instagram:</b> sem vídeo, só capa e legenda até liberar os cookies (Configurações → YTDLP_COOKIES_FROM_BROWSER).</span>
          </div>
        )}
        {jaAnalisados.length > 0 && (
          <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs cursor-pointer">
            <span><span className="font-medium text-foreground">Reanalisar os {jaAnalisados.length} já analisado{jaAnalisados.length === 1 ? '' : 's'}</span><br />
              <span className="text-muted-foreground">suas edições no painel continuam valendo</span></span>
            <Switch checked={reanalisar} onCheckedChange={setReanalisar} aria-label="Reanalisar os já analisados" />
          </label>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span title="≈ US$ 0,08 por item no Opus (equivalente na API). Pela assinatura do Claude Code não há cobrança por token: consome a cota.">~{fmtUsd(e.usd)} · ~{e.min} min · roda no Claude Code em segundo plano</span>
        </div>
        {ocupado && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            A IA está ocupada{ocupado.task ? ` com ${ocupado.task}` : ocupado.title ? ` com ${ocupado.title}` : ''}. Rodar agora entra na fila e começa sozinho quando ela acabar.
          </p>
        )}
        {fila.pedir.error && <p className="text-xs text-destructive">{(fila.pedir.error as Error).message}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="ghost" disabled={!itens.length || fila.pedir.isPending} onClick={() => enviar(false)} title="Grava o pedido sem rodar (para rodar depois, aqui ou no terminal)">Só pôr na fila</Button>
          <Button disabled={!itens.length || fila.pedir.isPending} onClick={() => enviar(true)} className="inline-flex items-center gap-1.5">
            {fila.pedir.isPending ? <Spinner /> : <ScanSearch className="size-4" />}{ocupado ? 'Entrar na fila' : 'Rodar agora'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────── faixa ao vivo (no lugar, acima da lista) ─────────────────────────
function since(iso: string | null) {
  if (!iso) return '';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'agora' : m < 60 ? `há ${m} min` : `há ${Math.floor(m / 60)} h ${m % 60} min`;
}

export function FilaFaixa({ fila }: { fila: Fila }) {
  const s = fila.status;
  const [showLog, setShowLog] = useState(false);
  const [fechado, setFechado] = useState<string | null>(null);
  const pre = useRef<HTMLPreElement>(null);
  useEffect(() => { if (pre.current) pre.current.scrollTop = pre.current.scrollHeight; }, [showLog, s?.log]);
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(i); }, []);
  if (!s) return null;

  if (s.running) {
    const n = s.pedidos.reduce((a, p) => a + p.itens.length, 0);
    return (
      <div className="mb-3 rounded-xl border border-ai-border/60 bg-ai-soft/70" role="status" aria-live="polite">
        <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ai opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-ai" />
          </span>
          <span className="min-w-0 truncate"><b className="font-semibold">IA analisando {n} conteúdo{n === 1 ? '' : 's'}</b> · {s.passo ?? 'trabalhando'}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{since(s.started)}</span>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" className="!border-0 !px-2 inline-flex items-center gap-1 text-xs" onClick={() => setShowLog((v) => !v)}>{showLog ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}Log</Button>
            <Button variant="ghost" className="inline-flex items-center gap-1.5 text-xs bg-card" disabled={fila.parar.isPending} onClick={() => fila.parar.mutate()}><Square className="size-3.5" />Parar</Button>
          </div>
        </div>
        {showLog && (
          <pre ref={pre} className="mx-4 mb-3 max-h-56 overflow-auto rounded-lg bg-zinc-950 text-zinc-200 text-[11px] leading-relaxed p-3 whitespace-pre-wrap">
            {s.log.length ? s.log.join('\n') : 'Sem saída ainda. O Claude escreve no log ao terminar; a etapa atual aparece na faixa.'}
          </pre>
        )}
      </div>
    );
  }

  const u = s.ultimo;
  const erroRecente = u?.erro && !u.parado && Date.now() - Date.parse(u.fim) < 30 * 60e3 && fechado !== u.fim;
  const n = fila.naFila;
  if (!n && !erroRecente) return null;
  const e = estimativa(n);
  return (
    <div className="mb-3 space-y-2">
      {erroRecente && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <span className="min-w-0"><b className="font-semibold">A última análise não terminou.</b> {u!.erro}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setFechado(u!.fim)} className="ml-auto shrink-0 text-amber-700 hover:text-amber-950"><X className="size-4" /></button>
        </div>
      )}
      {n > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span><b className="font-semibold tabular-nums">{n}</b> na fila de análise</span>
          <span className="text-xs text-muted-foreground">~{fmtUsd(e.usd)} · ~{e.min} min</span>
          <div className="ml-auto flex items-center gap-2">
            {s.naFila
              ? <span className="text-xs text-muted-foreground">Na fila da IA ({s.naFila}º): começa sozinha quando a anterior acabar.</span>
              : <Button disabled={fila.rodar.isPending} onClick={() => fila.rodar.mutate()} className="!py-1 inline-flex items-center gap-1.5 text-xs"
                title={s.ocupado ? `A IA está ocupada${s.ocupado.task ? ` com ${s.ocupado.task}` : ''}: entra na fila e roda sozinha quando ela acabar` : undefined}>
                {fila.rodar.isPending ? <Spinner /> : <ScanSearch className="size-3.5" />}{s.ocupado ? 'Entrar na fila' : 'Rodar agora'}</Button>}
          </div>
        </div>
      )}
    </div>
  );
}
