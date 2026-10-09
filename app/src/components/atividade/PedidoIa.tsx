// Pedidos avulsos de IA (046 D): o mesmo jeito de pedir (popover com instruções opcionais · segundo plano ou terminal) e de
// acompanhar no lugar do clique (agente · passo · tempo · Parar; depois o resumo) para "Pedir ajustes ao Claude",
// "Rodar agora" da análise do concorrente e o relatório. O estado vem de /api/pedido-ia?ref= (o pedido mais novo da tela);
// o dock global mostra o mesmo trabalho.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, Clock, Loader2, Play, Square, SquareTerminal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api, type PedidoIaView } from '../../api';
import { toast } from '../toast';
import { duracao, quem } from './AtividadeDock';
import { cn } from '@/lib/utils';

export const rodandoPedido = (p?: PedidoIaView | null) => !!p && (p.status === 'fila' || p.status === 'rodando');

/**
 * Pedido mais novo de uma tela. Enquanto roda: confere a cada 2,5 s e chama `enquantoRoda` (ex.: recarregar a peça para as
 * anotações resolvidas aparecerem uma a uma); ao terminar chama `aoTerminar`.
 */
export function usePedidoIa(slug: string, ref: string | null, op: { enquantoRoda?: () => void; aoTerminar?: (p: PedidoIaView) => void } = {}) {
  const q = useQuery({
    queryKey: ['pedido-ia', slug, ref],
    queryFn: () => api.pedidoIa(slug, ref!),
    enabled: !!slug && !!ref,
    refetchInterval: (x) => (rodandoPedido(x.state.data) ? 2500 : false),
  });
  const p = q.data ?? null;
  const antes = useRef<string | null>(null);
  const opRef = useRef(op);
  opRef.current = op;
  useEffect(() => {
    const st = p ? `${p.id}:${p.status}` : null;
    if (rodandoPedido(p)) opRef.current.enquantoRoda?.();
    else if (p && antes.current?.startsWith(`${p.id}:`) && antes.current !== st) opRef.current.aoTerminar?.(p);
    antes.current = st;
  }, [p?.id, p?.status, q.dataUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const qc = useQueryClient();
  const atualizar = () => void qc.invalidateQueries({ queryKey: ['pedido-ia', slug, ref] });
  return { pedido: p, rodando: rodandoPedido(p), atualizar };
}

function useTique(ligado: boolean) {
  const [, set] = useState(0);
  useEffect(() => { if (!ligado) return; const t = setInterval(() => set((n) => n + 1), 1000); return () => clearInterval(t); }, [ligado]);
}

/** linha de andamento no lugar do clique: rodando (agente · passo · tempo · Parar) ou o resultado do último pedido */
export function PedidoStatus({ slug, pedido, className, mostrarFim = true }: { slug: string; pedido: PedidoIaView | null; className?: string; mostrarFim?: boolean }) {
  const rodando = rodandoPedido(pedido);
  useTique(rodando);
  const qc = useQueryClient();
  const [parando, setParando] = useState(false);
  if (!pedido || (!rodando && !mostrarFim)) return null;
  const nome = quem({ agente: pedido.agenteAtivo ?? pedido.agente, tipo: 'ia' } as Parameters<typeof quem>[0]);
  const naFila = pedido?.status === 'fila' && !!pedido.posicao;
  async function parar() {
    const id = naFila ? pedido?.fila : pedido?.atividade; // na fila (046 F): tira da fila; rodando: para
    if (!id) return;
    setParando(true);
    try { await api.atividadeParar(slug, id); toast.ok(naFila ? 'Tirado da fila' : 'Parado'); } catch (e) { toast.error(e, 'Não foi possível parar'); }
    finally { setParando(false); void qc.invalidateQueries({ queryKey: ['pedido-ia', slug] }); }
  }
  if (rodando) return (
    <div className={cn('flex items-center gap-2 rounded-md border border-ai-border bg-ai-soft px-3 py-1.5 text-xs text-ai-ink', className)}>
      {naFila ? <Clock className="size-3.5 shrink-0" /> : <Loader2 className="size-3.5 animate-spin shrink-0" />}
      <span className="font-medium shrink-0">{nome}</span>
      <span className="min-w-0 truncate opacity-80" title={pedido.passo ?? undefined}>{naFila ? `Na fila (${pedido.posicao}º): começa sozinho quando a IA ficar livre` : pedido.status === 'fila' ? 'Abrindo o Claude Code…' : pedido.passo ?? 'Trabalhando…'}</span>
      <span className="ml-auto tabular-nums opacity-70 shrink-0">{duracao(pedido.inicio ?? pedido.criado)}</span>
      {(naFila ? pedido.fila : pedido.atividade) && <button onClick={parar} disabled={parando} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-ai-muted shrink-0">{naFila ? <><X className="size-3" />Tirar da fila</> : <><Square className="size-3" />Parar</>}</button>}
    </div>
  );
  const erro = pedido.status === 'erro';
  return (
    <div className={cn('flex items-center gap-2 text-xs', erro ? 'text-destructive' : 'text-muted-foreground', className)} title={pedido.erro ?? undefined}>
      {erro ? <AlertTriangle className="size-3.5 shrink-0" /> : <Check className="size-3.5 shrink-0 text-success" />}
      <span className="min-w-0 truncate">{erro ? `Não terminou: ${pedido.erro ?? 'erro'}` : pedido.resumo ?? 'Pronto'}</span>
      {pedido.fim && <span className="shrink-0 opacity-70">· {quando(pedido.fim)}</span>}
    </div>
  );
}
const quando = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  return m < 1 ? 'agora' : m < 60 ? `há ${m} min` : m < 1440 ? `há ${Math.floor(m / 60)} h` : new Date(iso).toLocaleDateString('pt-BR');
};

/**
 * Popover de pedir (mesmo do Rodar IA): o que vai acontecer, instruções opcionais e os dois jeitos de rodar.
 * `onRodar` recebe o modo e as instruções; o popover fecha quando ele resolve.
 */
export function PedirIa({ trigger, titulo, descricao, instrucoes = true, placeholder, onRodar, align = 'end', children }: {
  trigger: ReactNode; titulo: string; descricao: ReactNode; instrucoes?: boolean; placeholder?: string; align?: 'start' | 'end';
  onRodar: (modo: 'background' | 'terminal', instrucoes: string) => Promise<unknown>; children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  async function go(modo: 'background' | 'terminal') {
    setBusy(modo);
    try { await onRodar(modo, txt.trim()); setTxt(''); setOpen(false); }
    catch (e) { toast.error(e, 'Não foi possível pedir'); }
    finally { setBusy(null); }
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align={align} className="w-96 p-0">
        <div className="p-4 pb-3 border-b border-border">
          <div className="font-medium text-sm">{titulo}</div>
          <div className="text-xs text-muted-foreground mt-1">{descricao}</div>
        </div>
        {children}
        {instrucoes && (
          <div className="px-4 pt-3">
            <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={2} placeholder={placeholder ?? 'Instruções para esta rodada (opcional)'}
              className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary" />
          </div>
        )}
        <div className="p-3 flex flex-col gap-2">
          <Button size="sm" variant="ai" disabled={!!busy} onClick={() => go('background')}>{busy === 'background' ? <Loader2 className="animate-spin" /> : <Play />} Rodar em segundo plano</Button>
          <Button size="sm" variant="outline" disabled={!!busy} onClick={() => go('terminal')}><SquareTerminal /> Abrir no terminal (acompanhar e conversar)</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
