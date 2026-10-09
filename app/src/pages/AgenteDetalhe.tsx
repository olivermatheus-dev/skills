// Página de um agente (Agentes e skills → clique no agente): cabeçalho com o resumo e duas abas.
// · Geral: o que está fazendo agora, fila do quadro, últimos trabalhos, skills e instruções permanentes (acrescentar rápido).
// · Instruções e skills: arquivos fixos do agente no topo (definição, instruções, protocolo) + cada skill ativada como pasta;
//   à direita o editor do arquivo aberto. Ativar/desativar skill reescreve só a linha `skills:` da definição.
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, FolderTree, LayoutDashboard, ListTodo, Plus, SquareTerminal, Sparkles } from 'lucide-react';
import { api, type AgenteCard, type AgentesView } from '../api';
import { AppContent } from '../components/AppContent';
import { Button, Empty, ErrorBox, Input, cx } from '../components/kit';
import { Avatar, EstadoPill, usd } from '../components/agentes/shared';
import { ArquivosWorkspace } from '../components/agentes/Arquivos';
import { Selo, duracao } from '../components/atividade/AtividadeDock';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { fmtRelative } from '@/lib/dates';
import { toast } from '../components/toast';

export default function AgenteDetalhe() {
  const { slug = '', agente = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const aba = sp.get('aba') === 'arquivos' ? 'arquivos' : 'geral';
  const { data, error, isLoading } = useQuery({
    queryKey: ['agentes', slug], queryFn: () => api.agentes(slug), enabled: !!slug,
    refetchInterval: (q) => (q.state.data?.resumo.rodando ? 2500 : 15000),
  });
  const a = data?.agentes.find((x) => x.id === agente);
  const base = `/p/${slug}/agentes`;
  const tab = (on: boolean) => cx('inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 whitespace-nowrap -mb-px', on ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground');
  const irAba = (v: 'geral' | 'arquivos') => setSp((p) => { const n = new URLSearchParams(p); if (v === 'geral') { n.delete('aba'); n.delete('f'); } else n.set('aba', v); return n; }, { replace: true });

  return (
    <AppContent>
      <Link to={base} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />Agentes e skills</Link>
      <ErrorBox error={error} />
      {isLoading && <div className="h-28 rounded-xl bg-muted/70 animate-pulse" />}
      {data && !a && <Empty title="Agente não encontrado" hint={`Não há agente "${agente}" em .claude/agents/.`} />}
      {a && data && (
        <>
          <Cabecalho a={a} compacto={aba === 'arquivos'} />
          <nav className="flex gap-0.5 border-b border-border mb-5">
            <button className={tab(aba === 'geral')} onClick={() => irAba('geral')}><LayoutDashboard className="size-4" strokeWidth={1.8} />Geral</button>
            <button className={tab(aba === 'arquivos')} onClick={() => irAba('arquivos')}>
              <FolderTree className="size-4" strokeWidth={1.8} />Instruções e skills<span className="text-xs tabular-nums text-muted-foreground">{a.id === 'orquestrador' ? 1 : a.skills.length}</span>
            </button>
          </nav>
          {aba === 'geral' ? <Geral a={a} data={data} slug={slug} onArquivos={() => irAba('arquivos')} /> : <Arquivos a={a} />}
        </>
      )}
    </AppContent>
  );
}

function Cabecalho({ a, compacto }: { a: AgenteCard; compacto?: boolean }) {
  const stats = [
    { k: 'Na fila do quadro', v: String(a.fila.length) },
    { k: 'Trabalhos em 7 dias', v: String(a.semana.trabalhos) },
    { k: 'Custo em 7 dias', v: a.semana.custo > 0 ? usd(a.semana.custo) : '—' },
    { k: 'Instruções permanentes', v: a.id === 'orquestrador' ? '—' : String(a.notas.itens) },
  ];
  return (
    <header className={cx('rounded-2xl border border-border bg-card mb-5', compacto ? 'px-5 py-3.5' : 'p-5')}>
      <div className="flex items-start gap-4">
        <Avatar a={a} size={compacto ? 'md' : 'lg'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{a.nome}</h1>
            <EstadoPill a={a} />
            {a.modelo && <span className="text-[11px] text-muted-foreground border border-border rounded-md px-1.5 py-0.5">modelo {a.modelo}</span>}
          </div>
          <p className={cx('text-sm text-muted-foreground max-w-3xl leading-relaxed', compacto ? 'mt-0.5 line-clamp-1' : 'mt-1.5')} title={a.sobre}>{a.sobre}</p>
        </div>
      </div>
      {!compacto && <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl border border-border bg-border overflow-hidden mt-4">
        {stats.map((s) => (
          <div key={s.k} className="bg-card px-4 py-2.5">
            <div className="text-xs text-muted-foreground">{s.k}</div>
            <div className="text-base font-semibold tabular-nums mt-0.5">{s.v}</div>
          </div>
        ))}
      </div>}
    </header>
  );
}

const Secao = ({ titulo, icone, extra, children, className }: { titulo: string; icone?: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <section className={cx('rounded-xl border border-border bg-card p-4', className)}>
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">{icone}<span className="flex-1">{titulo}</span>{extra}</div>
    {children}
  </section>
);

function Geral({ a, data, slug, onArquivos }: { a: AgenteCard; data: AgentesView; slug: string; onArquivos: () => void }) {
  const at = a.atual;
  const meus = data.historico.filter((h) => (h.agente ?? 'ai').replace(/^agent:/, '').replace(/^ai$/, 'orquestrador') === a.id || (h.passos ?? []).some((p) => (p.agente ?? '').replace(/^agent:/, '') === a.id)).slice(0, 12);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4 min-w-0">
        <Secao titulo="Agora" extra={at && <Link to={`/p/${slug}/agentes?aba=historico&h=${at.id}`} className="normal-case tracking-normal text-primary-ink hover:underline inline-flex items-center gap-0.5">Ver passos<ArrowUpRight className="size-3" /></Link>}>
          {a.estado !== 'dormindo' && at ? (
            <div className="flex items-start gap-3">
              <Selo a={at} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{a.estado === 'acordado' ? 'Sessão aberta: esperando você' : at.passo}</div>
                <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                  {at.origem === 'terminal' && <SquareTerminal className="size-3" />}{at.titulo}{a.desde && <span className="tabular-nums"> · {duracao(a.desde)}</span>}
                </div>
                {!!at.passos?.length && (
                  <ol className="mt-3 space-y-1 border-l border-border ml-1">
                    {at.passos.slice(-4).map((p, i, l) => (
                      <li key={i} className="pl-3 relative text-xs text-muted-foreground">
                        <span className={cx('absolute -left-[3.5px] top-1.5 size-1.5 rounded-full', i === l.length - 1 && at.status === 'rodando' ? 'bg-primary animate-pulse' : 'bg-border')} />{p.texto}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          ) : <div className="text-sm text-muted-foreground">Dormindo: nenhum trabalho rodando agora.</div>}
        </Secao>

        <Secao titulo="Fila no quadro" icone={<ListTodo className="size-3.5" />} extra={<span className="tabular-nums">{a.fila.length}</span>}>
          {a.fila.length ? (
            <ul className="divide-y divide-border -my-1">
              {a.fila.map((t) => (
                <li key={t.id}>
                  <Link to={`/p/${slug}/quadro?t=${t.id}`} className="flex items-center gap-2 py-2 text-sm hover:text-primary-ink">
                    <span className="text-xs text-muted-foreground tabular-nums w-14 shrink-0">{t.id}</span>
                    <span className="truncate flex-1">{t.title}</span>
                    <span className="text-[11px] text-muted-foreground">{({ doing: 'fazendo', todo: 'a fazer', backlog: 'backlog' } as Record<string, string>)[t.status] ?? t.status}</span>
                    {t.pronta && <span className="text-[11px] rounded-full bg-primary-soft text-primary-ink px-1.5">pronta</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : <div className="text-sm text-muted-foreground">Nada na fila.</div>}
        </Secao>

        <Secao titulo="Últimos trabalhos">
          {meus.length ? (
            <ul className="divide-y divide-border -my-1">
              {meus.map((h) => (
                <li key={h.id}>
                  <Link to={`/p/${slug}/agentes?aba=historico&h=${h.id}`} className="flex items-center gap-3 py-2 text-sm hover:text-primary-ink">
                    <Selo a={h} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{h.titulo}</span>
                      <span className={cx('block text-xs truncate', h.status === 'erro' ? 'text-destructive' : 'text-muted-foreground')}>{h.status === 'rodando' ? h.passo : h.status === 'erro' ? h.erro : h.resumo ?? '—'}</span>
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{fmtRelative(h.fim ?? h.inicio)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <div className="text-sm text-muted-foreground">Nenhum trabalho ainda.</div>}
        </Secao>
      </div>

      <div className="space-y-4">
        <Secao titulo="Skills" icone={<Sparkles className="size-3.5" />} extra={<button className="normal-case tracking-normal text-primary-ink hover:underline" onClick={onArquivos}>Abrir</button>}>
          {(a.id === 'orquestrador' ? ['orquestrar'] : a.skills).length ? (
            <div className="flex flex-wrap gap-1.5">
              {(a.id === 'orquestrador' ? ['orquestrar'] : a.skills).map((s) => (
                <Link key={s} to={`/p/${slug}/agentes/skills/${s}`} className="inline-flex items-center gap-1 rounded-lg bg-ai-soft text-ai-ink px-2 py-1 text-xs hover:bg-ai-muted">
                  <Sparkles className="size-3" />{s}
                </Link>
              ))}
            </div>
          ) : <div className="text-sm text-muted-foreground">Nenhuma skill ativada.</div>}
        </Secao>
        {a.id !== 'orquestrador' ? <NotasRapidas a={a} slug={slug} onArquivos={onArquivos} /> : (
          <Secao titulo="Regras">
            <p className="text-sm text-muted-foreground">O orquestrador é a sessão principal: as regras dele ficam no <button className="text-primary-ink hover:underline" onClick={onArquivos}>CLAUDE.md</button>.</p>
          </Secao>
        )}
      </div>
    </div>
  );
}

function NotasRapidas({ a, slug, onArquivos }: { a: AgenteCard; slug: string; onArquivos: () => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['agente-notas', a.id], queryFn: () => api.agenteNotas(a.id) });
  const [nova, setNova] = useState('');
  const salvar = useMutation({
    mutationFn: () => api.salvarAgenteNotas(a.id, { nova }),
    onSuccess: (r) => { qc.setQueryData(['agente-notas', a.id], r); void qc.invalidateQueries({ queryKey: ['agentes', slug] }); void qc.invalidateQueries({ queryKey: ['arquivo'] }); setNova(''); toast.ok('Instrução salva: vale a partir da próxima tarefa'); },
    onError: (e) => toast.error(e, 'Não foi possível salvar'),
  });
  const linhas = (data?.texto ?? '').split(/\r?\n/).filter((l) => /^\s*-\s+/.test(l)).map((l) => l.replace(/^\s*-\s+/, '').replace(/\*\*/g, '')).reverse();
  return (
    <Secao titulo="Instruções permanentes" extra={<button className="normal-case tracking-normal text-primary-ink hover:underline" onClick={onArquivos}>Editar arquivo</button>}>
      <form className="flex gap-1.5 mb-3" onSubmit={(e) => { e.preventDefault(); if (nova.trim()) salvar.mutate(); }}>
        <Input className="flex-1 h-8 text-sm" value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Nova instrução que vale sempre" />
        <Button type="submit" className="h-8 px-2" disabled={!nova.trim() || salvar.isPending} title="Acrescentar"><Plus className="size-4" /></Button>
      </form>
      {linhas.length ? (
        <ul className="space-y-1.5 max-h-80 overflow-y-auto">
          {linhas.map((l, i) => {
            const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*·\s*(.*)$/);
            return <li key={i} className="text-[13px] leading-snug rounded-lg bg-muted/50 px-2.5 py-1.5">{m ? <><span className="text-[11px] text-muted-foreground tabular-nums mr-1.5">{m[1].split('-').reverse().join('/')}</span>{m[2]}</> : l}</li>;
          })}
        </ul>
      ) : <div className="text-sm text-muted-foreground">Nenhuma instrução ainda.</div>}
    </Secao>
  );
}

function Arquivos({ a }: { a: AgenteCard }) {
  const qc = useQueryClient();
  const { data, error } = useQuery({ queryKey: ['agente-arquivos', a.id], queryFn: () => api.agenteArquivos(a.id) });
  const todas = useQuery({ queryKey: ['skills'], queryFn: api.skills, enabled: a.id !== 'orquestrador' });
  const definir = useMutation({
    mutationFn: (skills: string[]) => api.agenteSkills(a.id, skills),
    onSuccess: (r) => { qc.setQueryData(['agente-arquivos', a.id], r); for (const k of ['agentes', 'skills', 'skill', 'arquivo']) void qc.invalidateQueries({ queryKey: [k] }); toast.ok('Skills do agente atualizadas'); },
    onError: (e) => toast.error(e, 'Não foi possível salvar'),
  });
  if (error) return <ErrorBox error={error} />;
  if (!data) return <div className="h-96 rounded-xl bg-muted/70 animate-pulse" />;
  const ativas = data.skills.map((s) => s.id);
  const livres = (todas.data ?? []).filter((s) => !ativas.includes(s.id));
  const editavel = a.id !== 'orquestrador';
  return (
    <ArquivosWorkspace
      fixos={data.fixos}
      skills={data.skills}
      onRemoverSkill={editavel ? (id) => { if (window.confirm(`Desativar a skill "${id}" para o ${a.nome.toLowerCase()}? Os arquivos dela continuam no lugar.`)) definir.mutate(ativas.filter((s) => s !== id)); } : undefined}
      rodapeSkills={editavel && livres.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-1 w-full flex items-center gap-1.5 h-7 px-2 rounded-md text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground">
              <Plus className="size-3.5" />Ativar skill
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 max-h-80 rounded-xl p-1">
            {livres.map((s) => (
              <DropdownMenuItem key={s.id} className="rounded-lg items-start" onSelect={() => definir.mutate([...ativas, s.id])}>
                <Sparkles className="size-3.5 mt-0.5 text-ai-ink" />
                <span className="min-w-0"><span className="block text-[13px]">{s.id}</span><span className="block text-[11px] text-muted-foreground line-clamp-1">{s.descricao}</span></span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}
