// Botão "Rodar IA" (cabeçalho do quadro) e faixa "IA trabalhando" com log e Parar.
// Prontas = A fazer · responsável IA/agente · dependências feitas. Segundo plano = heartbeat; terminal = janela interativa.
// IA uma por vez (046 F): com a IA ocupada, o segundo plano entra na fila e roda sozinho quando a anterior acaba.
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Loader2, Play, Square, SquareTerminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { RunnerStatus } from '../../api';
import type { useRunner } from './useRunner';
import { WhoAvatar } from './Who';

type Runner = ReturnType<typeof useRunner>;

export function RunAiButton({ runner, onOpenTask }: { runner: Runner; onOpenTask: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const s = runner.status;
  const ready = s?.ready ?? [];
  const go = (mode: 'background' | 'terminal') => { runner.run.mutate({ mode }); setOpen(false); };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant={ready.length && !runner.running ? 'ai' : 'ai-soft'} className="gap-1.5">
          {runner.running ? <Loader2 className="animate-spin" /> : <Play />}
          {runner.running ? 'IA rodando' : 'Rodar IA'}
          {!!s?.fila.length && <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-black/10 px-1.5 text-[11px] tabular-nums" title="Na fila da IA"><Clock className="size-3" />{s.fila.length}</span>}
          {!runner.running && <span className="ml-0.5 rounded-full bg-black/10 px-1.5 text-[11px] tabular-nums">{ready.length}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="p-4 pb-3 border-b border-border">
          <div className="font-medium text-sm">Rodar o Claude Code nas tarefas aprovadas</div>
          <p className="text-xs text-muted-foreground mt-1">Entram as tarefas em <b>A fazer</b>, com responsável IA ou agente e dependências feitas. O que a IA fizer fica registrado nos comentários do card.</p>
        </div>
        {ready.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Nenhuma tarefa pronta. Para aprovar uma tarefa da IA, mova o card para <b>A fazer</b>.</div>
        ) : (
          <ol className="max-h-56 overflow-y-auto py-1">
            {ready.map((t, i) => (
              <li key={t.id}>
                <button type="button" onClick={() => { setOpen(false); onOpenTask(t.id); }} className="w-full flex items-center gap-2 px-4 py-1.5 text-left text-sm hover:bg-muted">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{i + 1}</span>
                  <WhoAvatar who={t.assignee} size="xs" />
                  <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                  <span className="truncate">{t.title}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
        {!!s?.fila.length && (
          <div className="border-t border-border py-1">
            <div className="px-4 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">Na fila da IA (roda um por vez, sozinho)</div>
            <ol className="max-h-32 overflow-y-auto">
              {s.fila.map((f) => (
                <li key={f.atividade} className="flex items-center gap-2 px-4 py-1 text-sm">
                  <span className="text-xs text-muted-foreground tabular-nums w-4">{f.posicao}º</span>
                  <span className="truncate">{f.titulo}</span>
                  {f.slug !== runner.slug && <span className="ml-auto text-xs text-muted-foreground">{f.slug}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="p-3 border-t border-border flex flex-col gap-2">
          {runner.running && <Button variant="outline" size="sm" onClick={() => { runner.stop.mutate(); setOpen(false); }}><Square /> Parar a execução atual</Button>}
          {(!runner.running || ready.length > 0) && (
            <>
              <Button size="sm" disabled={!ready.length || runner.run.isPending} onClick={() => go('background')}>
                {runner.running ? <><Clock /> Pôr {ready.length > 1 ? `as ${ready.length}` : ''} na fila</> : <><Play /> Rodar {ready.length > 1 ? `as ${ready.length}` : ''} em segundo plano</>}
              </Button>
              <Button size="sm" variant="outline" disabled={!ready.length || runner.run.isPending} onClick={() => go('terminal')}>
                <SquareTerminal /> Abrir no terminal (acompanhar e conversar)
              </Button>
            </>
          )}
          {s?.otherProject && <p className="text-xs text-muted-foreground">Rodando agora no projeto <b>{s.otherProject}</b>.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function since(iso: string | null) {
  if (!iso) return '';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'agora' : m < 60 ? `há ${m} min` : `há ${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Faixa no topo do quadro enquanto a IA trabalha. */
export function RunningBar({ status, onStop, onOpenTask }: { status: RunnerStatus; onStop: () => void; onOpenTask: (id: string) => void }) {
  const [showLog, setShowLog] = useState(false);
  const pre = useRef<HTMLPreElement>(null);
  useEffect(() => { if (pre.current) pre.current.scrollTop = pre.current.scrollHeight; }, [showLog, status.log]);
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(i); }, []);
  return (
    <div className="mb-4 rounded-xl border border-primary/25 bg-primary-soft/60">
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        {status.task ? (
          <span className="min-w-0 truncate">
            IA trabalhando em{' '}
            <button type="button" className="font-medium underline-offset-2 hover:underline" onClick={() => onOpenTask(status.task!)}>
              <span className="font-mono">{status.task}</span> · {status.title}
            </button>
          </span>
        ) : status.kind === 'fichas' ? <span className="min-w-0 truncate">IA analisando conteúdos dos concorrentes{status.title ? ` · ${status.title}` : ''}</span>
          : status.kind === 'pesquisa' ? <span className="min-w-0 truncate">IA pesquisando ideias nas fontes{status.title ? ` · ${status.title}` : ''}</span>
          : status.title ? <span className="min-w-0 truncate">IA trabalhando · {status.title}</span>
          : <span>IA preparando a execução…</span>}
        {!!status.fila.length && <span className="text-xs text-muted-foreground whitespace-nowrap">· {status.fila.length} na fila</span>}
        <span className="text-xs text-muted-foreground whitespace-nowrap">{since(status.started)}</span>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setShowLog((v) => !v)}>{showLog ? <ChevronDown /> : <ChevronRight />} Log</Button>
          <Button size="sm" variant="outline" onClick={onStop}><Square /> Parar</Button>
        </div>
      </div>
      {showLog && (
        <pre ref={pre} className="mx-4 mb-3 max-h-64 overflow-auto rounded-lg bg-zinc-950 text-zinc-200 text-[11px] leading-relaxed p-3 whitespace-pre-wrap">
          {status.log.length ? status.log.join('\n') : 'Sem saída ainda. O Claude escreve no log quando termina cada etapa.'}
        </pre>
      )}
    </div>
  );
}
