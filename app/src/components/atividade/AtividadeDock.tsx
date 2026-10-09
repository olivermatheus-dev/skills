// Dock "Em andamento" (tarefa 046 A): tudo o que roda por trás de um clique (IA, coleta, render), em qualquer tela.
// Compacto no canto (agente · passo · tempo), quase transparente enquanto se navega e opaco com o mouse em cima.
// Clique abre a lista: abrir onde rodou, parar (IA) e dispensar. Ao terminar algo, recarrega os dados da tela.
// Só observa o registro (logs/atividade/ via /api/atividade); não dispara nada.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Check, ChevronDown, Clapperboard, Globe, Loader2, Square, SquareTerminal, X, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { api, type Atividade, type AtividadeView } from '../../api';
import { setToastOffset, toast } from '../toast';
import { cn } from '@/lib/utils';

const NOMES: Record<string, string> = {
  orquestrador: 'Orquestrador', ai: 'Orquestrador', estrategista: 'Estrategista', roteirista: 'Roteirista', designer: 'Designer',
  'editor-de-video': 'Editor de vídeo', 'sound-designer': 'Sound designer', revisor: 'Revisor', pesquisador: 'Pesquisador',
};
/** quem está fazendo: o agente (IA) ou o tipo de script */
export function quem(a: Atividade) {
  if (a.agente) { const n = a.agente.replace(/^agent:/, ''); return NOMES[n] ?? n; }
  return a.tipo === 'render' ? 'Render' : 'Coleta';
}
const ICONE = { ia: Bot, coleta: Globe, render: Clapperboard } as const;

/** 75 s → 1:15 · 3700 s → 1 h 01 */
export function duracao(desde: string, ate?: string | null) {
  const s = Math.max(0, Math.round(((ate ? Date.parse(ate) : Date.now()) - Date.parse(desde)) / 1000));
  if (s >= 3600) return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function useAgora(ligado: boolean) {
  const [, set] = useState(0);
  useEffect(() => { if (!ligado) return; const t = setInterval(() => set((n) => n + 1), 1000); return () => clearInterval(t); }, [ligado]);
}

export function AtividadeDock({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const key = ['atividade', slug] as const;
  const { data } = useQuery({
    queryKey: key, queryFn: () => api.atividade(slug), enabled: !!slug,
    refetchInterval: (q) => (q.state.data?.dock.some((a) => a.status === 'rodando') ? 2000 : 6000),
  });
  useEffect(() => {
    const f = () => void qc.invalidateQueries({ queryKey: key });
    window.addEventListener('hub:acao', f);
    return () => window.removeEventListener('hub:acao', f);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const dock = data?.dock ?? [];
  const rodando = dock.filter((a) => a.status === 'rodando');
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(false);
  useAgora(rodando.length > 0);

  // terminou algo → recarrega os dados das telas (o resultado aparece sem F5) e realça o dock por uns segundos
  const antes = useRef<Set<string> | null>(null);
  useEffect(() => { antes.current = null; }, [slug]);
  useEffect(() => {
    if (!data) return;
    const agora = new Set(rodando.map((a) => a.id));
    const prev = antes.current;
    antes.current = agora;
    if (!prev) return;
    const novos = [...agora].some((id) => !prev.has(id));
    const fim = [...prev].some((id) => !agora.has(id));
    if (fim) void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'atividade' });
    if (novos || fim) { setDestaque(true); const t = setTimeout(() => setDestaque(false), 5000); return () => clearTimeout(t); }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // os avisos do canto sobem acima do dock
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = caixa.current;
    if (!el) { setToastOffset(0); return; }
    const ro = new ResizeObserver(() => setToastOffset(el.offsetHeight + 8));
    ro.observe(el);
    return () => { ro.disconnect(); setToastOffset(0); };
  }, [dock.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (v: AtividadeView) => qc.setQueryData(key, v);
  const visto = async (ids: string[]) => { try { set(await api.atividadeVisto(slug, ids)); } catch (e) { toast.error(e, 'Não foi possível dispensar'); } };
  const parar = async (a: Atividade) => {
    try { set(await api.atividadeParar(slug, a.id)); toast.ok('Parado'); void qc.invalidateQueries({ queryKey: ['runner', slug] }); } catch (e) { toast.error(e, 'Não foi possível parar'); }
  };
  const abrir = (a: Atividade) => { if (a.status !== 'rodando') void visto([a.id]); if (a.link) nav(a.link); setAberto(false); };

  if (!dock.length) return null;
  const principal = rodando[0] ?? dock[0];
  const erros = dock.filter((a) => a.status === 'erro').length;

  return (
    <div ref={caixa} className={cn('fixed bottom-4 right-4 z-[55] w-[min(380px,calc(100vw-32px))] transition-opacity duration-200',
      aberto || destaque ? 'opacity-100' : 'opacity-55 hover:opacity-100 focus-within:opacity-100')}>
      {aberto && (
        <div className="mb-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden" role="dialog" aria-label="Atividade em andamento">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-medium">Atividade</span>
            <div className="flex items-center gap-2">
              {dock.some((a) => a.status !== 'rodando') && (
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => visto(dock.filter((a) => a.status !== 'rodando').map((a) => a.id))}>Limpar concluídos</button>
              )}
              <button className="text-muted-foreground hover:text-foreground" aria-label="Minimizar" onClick={() => setAberto(false)}><ChevronDown className="size-4" /></button>
            </div>
          </div>
          <ul className="max-h-[50vh] overflow-y-auto divide-y divide-border">
            {dock.map((a) => <Linha key={a.id} a={a} onAbrir={() => abrir(a)} onParar={() => parar(a)} onDispensar={() => visto([a.id])} />)}
          </ul>
        </div>
      )}
      <button onClick={() => setAberto((v) => !v)} aria-expanded={aberto}
        className={cn('w-full flex items-center gap-2.5 rounded-full border bg-card shadow-md pl-2 pr-3 py-1.5 text-left',
          principal.status === 'erro' ? 'border-destructive/40' : 'border-border')}>
        <Selo a={principal} />
        <span className="min-w-0 flex-1 truncate text-sm">
          <b className="font-medium">{quem(principal)}</b>
          <span className="text-muted-foreground"> · {principal.status === 'rodando' ? principal.passo : principal.status === 'erro' ? `falhou: ${principal.titulo}` : principal.resumo ?? principal.titulo}</span>
        </span>
        {rodando.length > 1 && <span className="text-xs rounded-full bg-primary-soft text-primary-ink px-1.5 tabular-nums">+{rodando.length - 1}</span>}
        {erros > 0 && principal.status !== 'erro' && <span className="text-xs rounded-full bg-destructive/10 text-destructive px-1.5 tabular-nums">{erros}</span>}
        {principal.status === 'rodando' && <span className="text-xs text-muted-foreground tabular-nums">{duracao(principal.inicio)}</span>}
      </button>
    </div>
  );
}

export function Selo({ a }: { a: Atividade }) {
  const Icone = a.origem === 'terminal' ? SquareTerminal : ICONE[a.tipo] ?? Bot;
  return (
    <span className={cn('relative size-7 shrink-0 rounded-full grid place-items-center',
      a.status === 'erro' ? 'bg-destructive/10 text-destructive' : a.status === 'rodando' ? 'bg-primary-soft text-primary-ink' : 'bg-success/10 text-success')}>
      {a.status === 'feito' || a.status === 'parado' ? <Check className="size-3.5" /> : a.status === 'erro' ? <AlertTriangle className="size-3.5" /> : <Icone className="size-3.5" />}
      {a.status === 'rodando' && <Loader2 className="absolute -right-0.5 -bottom-0.5 size-3 animate-spin text-primary-ink bg-card rounded-full" />}
    </span>
  );
}

function Linha({ a, onAbrir, onParar, onDispensar }: { a: Atividade & { podeParar?: boolean }; onAbrir: () => void; onParar: () => void; onDispensar: () => void }) {
  const podeParar = !!a.podeParar;
  return (
    <li className="px-3 py-2.5 flex gap-2.5">
      <Selo a={a} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{quem(a)}</span>
          <span>·</span>
          <span className="tabular-nums">{a.status === 'rodando' ? duracao(a.inicio) : `${a.status === 'erro' ? 'falhou' : a.status === 'parado' ? 'parado' : 'pronto'} em ${duracao(a.inicio, a.fim)}${a.custo != null ? ` · US$ ${a.custo.toFixed(2).replace('.', ',')}` : ''}`}</span>
        </div>
        <div className="text-sm truncate" title={a.titulo}>{a.titulo}</div>
        <div className={cn('text-xs mt-0.5 line-clamp-2', a.status === 'erro' ? 'text-destructive' : 'text-muted-foreground')}>
          {a.status === 'rodando' ? a.passo : a.status === 'erro' ? a.erro : a.resumo}
        </div>
        <div className="flex gap-3 mt-1.5 text-xs">
          {a.origem === 'terminal' && <span className="text-muted-foreground">no terminal</span>}
          {a.link && <button className="inline-flex items-center gap-1 text-primary-ink hover:underline" onClick={onAbrir}><ArrowUpRight className="size-3" />{a.origem === 'terminal' ? 'Ver passos' : a.status === 'rodando' ? 'Abrir' : 'Ver resultado'}</button>}
          {podeParar && <button className="inline-flex items-center gap-1 text-destructive hover:underline" onClick={onParar}><Square className="size-3" />Parar</button>}
        </div>
      </div>
      {a.status !== 'rodando' && <button className="self-start text-muted-foreground hover:text-foreground" aria-label="Dispensar" onClick={onDispensar}><X className="size-3.5" /></button>}
    </li>
  );
}
