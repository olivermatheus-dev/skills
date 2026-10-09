// Agentes e skills (tarefa 046 E): a equipe de IA, o que cada um está fazendo e as skills que usam. Quatro abas:
// · Em andamento: trabalhos rodando agora (com os últimos passos), tarefas do quadro em execução e as próximas da IA.
// · Equipe: um cartão por agente (orquestrador + 7) com estado, passo atual, fila e últimas entregas; clique abre a página do agente.
// · Skills: todas as skills de .claude/skills/ com quem usa cada uma; clique abre a skill (arquivos + editor).
// · Histórico: cada trabalho de IA (pelo app ou sessão aberta no terminal, via hooks) com passos, duração, custo e texto final.
// Só observa o registro (logs/atividade/); rodar continua nos botões de cada tela.
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowUpRight, CircleDashed, History, ListTodo, Search, Sparkles, SquareKanban, SquareTerminal, UsersRound } from 'lucide-react';
import { api, type AgenteCard, type AgentesView, type Atividade, type SkillResumo, type TarefaResumo } from '../api';
import { Drawer, Empty, ErrorBox, PageHeader, SelectField, cx } from '../components/kit';
import { AppContent } from '../components/AppContent';
import { FillBox } from '../components/fill';
import { Selo, duracao, quem } from '../components/atividade/AtividadeDock';
import { Avatar, EstadoPill, NOME_AGENTE, Pilha, agenteDoAssignee, usd } from '../components/agentes/shared';
import { fmtDateTime, fmtRelative } from '@/lib/dates';

const STATUS: Record<Atividade['status'], string> = { fila: 'na fila', rodando: 'rodando', feito: 'pronto', erro: 'falhou', parado: 'parado' };
type Aba = 'andamento' | 'equipe' | 'skills' | 'historico';
const ABAS: Aba[] = ['andamento', 'equipe', 'skills', 'historico'];

export default function Agentes() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const aba: Aba = (ABAS as string[]).includes(sp.get('aba') ?? '') ? (sp.get('aba') as Aba) : 'andamento';
  const aberto = sp.get('h');
  const setParam = (k: string, v: string | null) => setSp((p) => { const n = new URLSearchParams(p); if (v) n.set(k, v); else n.delete(k); return n; }, { replace: true });

  const { data, error, isLoading } = useQuery({
    queryKey: ['agentes', slug], queryFn: () => api.agentes(slug), enabled: !!slug,
    refetchInterval: (q) => (q.state.data?.resumo.rodando ? 2500 : 15000),
  });
  const skills = useQuery({ queryKey: ['skills'], queryFn: api.skills });
  const detalhe = data?.historico.find((a) => a.id === aberto) ?? null;
  const ativos = (data?.historico ?? []).filter((a) => a.status === 'rodando' || a.status === 'fila');

  const tab = 'inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 whitespace-nowrap -mb-px';
  const cls = (on: boolean) => cx(tab, on ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground');
  const Num = ({ n }: { n?: number }) => (n == null ? null : <span className="text-xs tabular-nums text-muted-foreground">{n}</span>);

  return (
    <AppContent>
      <PageHeader title="Agentes e skills" subtitle="Quem da equipe de IA está trabalhando, em quê, com quais skills e o que já entregou. Inclui as sessões abertas no terminal." />
      {data && <Resumo r={data.resumo} />}
      <nav className="flex gap-0.5 border-b border-border mb-5">
        <button className={cls(aba === 'andamento')} onClick={() => setParam('aba', null)}>
          <Activity className="size-4" strokeWidth={1.8} />Em andamento<Num n={data ? ativos.length + data.quadro.fazendo.length : undefined} />
          {!!data?.resumo.rodando && <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-label="rodando" />}
        </button>
        <button className={cls(aba === 'equipe')} onClick={() => setParam('aba', 'equipe')}><UsersRound className="size-4" strokeWidth={1.8} />Equipe<Num n={data?.agentes.length} /></button>
        <button className={cls(aba === 'skills')} onClick={() => setParam('aba', 'skills')}><Sparkles className="size-4" strokeWidth={1.8} />Skills<Num n={skills.data?.length} /></button>
        <button className={cls(aba === 'historico')} onClick={() => setParam('aba', 'historico')}><History className="size-4" strokeWidth={1.8} />Histórico<Num n={data?.historico.length} /></button>
      </nav>
      <ErrorBox error={error} />
      {isLoading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-72 rounded-xl bg-muted/70 animate-pulse" />)}</div>}
      {data && aba === 'andamento' && <Andamento data={data} slug={slug} ativos={ativos} onAbrir={(id) => setParam('h', id)} />}
      {data && aba === 'equipe' && (
        <FillBox>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pb-2">
            {data.agentes.map((a) => <Cartao key={a.id} a={a} slug={slug} onAbrir={(id) => setParam('h', id)} />)}
          </div>
        </FillBox>
      )}
      {aba === 'skills' && <Skills lista={skills.data} erro={skills.error} agentes={data?.agentes ?? []} slug={slug} />}
      {data && aba === 'historico' && <Historico data={data} onAbrir={(id) => setParam('h', id)} />}
      <Drawer open={!!detalhe} onClose={() => setParam('h', null)} title={detalhe ? detalhe.titulo : ''} width="max-w-xl">
        {detalhe && <Detalhe a={detalhe} />}
      </Drawer>
    </AppContent>
  );
}

function Resumo({ r }: { r: AgentesView['resumo'] }) {
  const itens = [
    { k: 'Trabalhando agora', v: String(r.rodando) },
    { k: 'Sessões abertas no terminal', v: String(r.sessoes) },
    { k: 'Custo hoje', v: usd(r.custoHoje), dica: 'Só o que rodou pelo app (segundo plano). Sessões de terminal não informam custo.' },
    { k: 'Custo em 7 dias', v: usd(r.custoSemana), dica: 'Só o que rodou pelo app (segundo plano). Sessões de terminal não informam custo.' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl border border-border bg-border overflow-hidden mb-5 -mt-2">
      {itens.map((i) => (
        <div key={i.k} className="bg-card px-4 py-3" title={i.dica}>
          <div className="text-xs text-muted-foreground">{i.k}</div>
          <div className="text-lg font-semibold tabular-nums mt-0.5">{i.v}</div>
        </div>
      ))}
    </div>
  );
}

// ── Em andamento ──────────────────────────────────────────────────────────────
const Bloco = ({ titulo, icone, n, extra, children }: { titulo: string; icone: React.ReactNode; n?: number; extra?: React.ReactNode; children: React.ReactNode }) => (
  <section>
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2.5">
      {icone}<span>{titulo}</span>{n != null && <span className="tabular-nums">· {n}</span>}<span className="flex-1" />{extra}
    </div>
    {children}
  </section>
);

function Andamento({ data, slug, ativos, onAbrir }: { data: AgentesView; slug: string; ativos: Atividade[]; onAbrir: (id: string) => void }) {
  const porId = (id: string) => data.agentes.find((a) => a.id === id);
  const agenteDe = (a: Atividade) => porId((a.agente ?? 'ai').replace(/^agent:/, '').replace(/^ai$/, 'orquestrador'));
  const rodandoNa = (t: TarefaResumo) => data.historico.find((a) => a.ref === t.id && (a.status === 'rodando' || a.status === 'fila'));
  const equipe = [...data.agentes].sort((a, b) => ['trabalhando', 'acordado', 'dormindo'].indexOf(a.estado) - ['trabalhando', 'acordado', 'dormindo'].indexOf(b.estado));
  const nada = !ativos.length && !data.quadro.fazendo.length && !data.quadro.prontas.length;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-7 min-w-0">
        {nada && <Empty title="Ninguém trabalhando agora" hint="Quando a IA pegar uma tarefa do quadro, um pedido do app ou uma sessão no terminal, ela aparece aqui com os passos ao vivo." />}

        {ativos.length > 0 && (
          <Bloco titulo="Trabalhando agora" icone={<span className="size-1.5 rounded-full bg-primary animate-pulse" />} n={ativos.length}>
            <div className="grid gap-3 xl:grid-cols-2">
              {ativos.map((a) => {
                const ag = agenteDe(a);
                const passos = a.passos ?? [];
                const tarefa = a.ref && /^T-\d{4}$/.test(a.ref) ? a.ref : null;
                return (
                  <article key={a.id} className={cx('rounded-xl border bg-card p-4 flex flex-col gap-3', a.status === 'rodando' ? 'border-primary/35 shadow-[0_0_0_3px_var(--primary-soft)]' : 'border-border')}>
                    <div className="flex items-start gap-3">
                      {ag ? <Link to={`/p/${slug}/agentes/${ag.id}`}><Avatar a={ag} size="sm" /></Link> : <Selo a={a} />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{quem(a)}</span>
                          {a.origem === 'terminal' && <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><SquareTerminal className="size-3" />terminal</span>}
                          <span className="ml-auto text-xs tabular-nums text-muted-foreground">{a.status === 'fila' ? 'na fila' : duracao(a.inicio)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate" title={a.titulo}>{a.titulo}</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                      <div className="text-sm font-medium leading-snug">{a.status === 'fila' ? 'Esperando a vez na fila da IA' : a.passo}</div>
                      {passos.length > 1 && (
                        <ol className="mt-2 space-y-0.5">
                          {passos.slice(-4, -1).reverse().map((p, i) => <li key={i} className="text-xs text-muted-foreground truncate">· {p.texto}</li>)}
                        </ol>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {tarefa && <Link to={`/p/${slug}/quadro?t=${tarefa}`} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 hover:bg-primary-soft hover:text-primary-ink"><SquareKanban className="size-3" />{tarefa}</Link>}
                      <button className="text-primary-ink hover:underline" onClick={() => onAbrir(a.id)}>Ver passos</button>
                      {a.link && <Link to={a.link} className="ml-auto inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground">Abrir onde roda<ArrowUpRight className="size-3" /></Link>}
                    </div>
                  </article>
                );
              })}
            </div>
          </Bloco>
        )}

        {data.quadro.fazendo.length > 0 && (
          <Bloco titulo="Em andamento no quadro" icone={<SquareKanban className="size-3.5" />} n={data.quadro.fazendo.length}
            extra={<Link to={`/p/${slug}/quadro`} className="normal-case tracking-normal text-primary-ink hover:underline">Abrir quadro</Link>}>
            <ul className="rounded-xl border border-border bg-card divide-y divide-border">
              {data.quadro.fazendo.map((t) => {
                const exec = rodandoNa(t);
                const humano = t.assignee === 'oliver';
                const ag = humano ? null : porId(agenteDoAssignee(t.assignee));
                return (
                  <li key={t.id}>
                    <Link to={`/p/${slug}/quadro?t=${t.id}`} className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-muted/40">
                      {ag ? <Avatar a={ag} size="sm" /> : <span className="size-7 shrink-0 rounded-full bg-muted grid place-items-center text-[11px] font-semibold text-muted-foreground">OM</span>}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm truncate"><span className="text-muted-foreground tabular-nums mr-1.5">{t.id}</span>{t.title}</span>
                        <span className="block text-xs text-muted-foreground truncate">{humano ? 'Com você' : ag?.nome ?? NOME_AGENTE[agenteDoAssignee(t.assignee)]}{exec?.status === 'rodando' ? ` · ${exec.passo}` : ''}</span>
                      </span>
                      {exec ? (
                        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] rounded-full bg-primary-soft text-primary-ink px-2 py-0.5"><span className="size-1.5 rounded-full bg-primary animate-pulse" />{exec.status === 'fila' ? 'na fila' : `executando · ${duracao(exec.inicio)}`}</span>
                      ) : !humano ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] rounded-full bg-muted text-muted-foreground px-2 py-0.5" title="Está em Fazendo, mas nenhum agente está rodando nela agora"><CircleDashed className="size-3" />parada</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Bloco>
        )}

        {data.quadro.prontas.length > 0 && (
          <Bloco titulo="Próximas da IA" icone={<ListTodo className="size-3.5" />} n={data.quadro.prontas.length}>
            <ul className="rounded-xl border border-border bg-card divide-y divide-border">
              {data.quadro.prontas.map((t) => {
                const ag = porId(agenteDoAssignee(t.assignee));
                return (
                  <li key={t.id}>
                    <Link to={`/p/${slug}/quadro?t=${t.id}`} className="flex items-center gap-3 px-3.5 py-2 hover:bg-muted/40 text-sm">
                      {ag && <Avatar a={ag} size="xs" estado={false} />}
                      <span className="text-muted-foreground tabular-nums text-xs">{t.id}</span><span className="truncate flex-1">{t.title}</span>
                      <span className="text-[11px] rounded-full bg-primary-soft text-primary-ink px-1.5">pronta</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Bloco>
        )}
      </div>

      <aside className="space-y-4">
        {data.quadro.revisao > 0 && (
          <Link to={`/p/${slug}/quadro`} className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 hover:bg-warning/10">
            <span className="text-2xl font-semibold tabular-nums text-warning-ink">{data.quadro.revisao}</span>
            <span className="text-sm leading-tight">esperando sua revisão no quadro</span>
          </Link>
        )}
        <div className="rounded-xl border border-border bg-card p-1.5">
          <div className="px-2.5 pt-2 pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Equipe agora</div>
          {equipe.map((a) => (
            <Link key={a.id} to={`/p/${slug}/agentes/${a.id}`} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60">
              <Avatar a={a} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm truncate">{a.nome}</span>
                <span className={cx('block text-xs truncate', a.estado === 'trabalhando' ? 'text-primary-ink' : 'text-muted-foreground')}>
                  {a.estado === 'trabalhando' ? a.atual?.passo : a.estado === 'acordado' ? 'Sessão aberta' : a.fila.length ? `${a.fila.length} na fila` : 'Dormindo'}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ── Equipe ────────────────────────────────────────────────────────────────────
function Cartao({ a, slug, onAbrir }: { a: AgenteCard; slug: string; onAbrir: (id: string) => void }) {
  const at = a.atual;
  const nav = useNavigate();
  const pagina = `/p/${slug}/agentes/${a.id}`;
  return (
    <div role="link" tabIndex={0} onClick={() => nav(pagina)} onKeyDown={(e) => { if (e.key === 'Enter') nav(pagina); }}
      className={cx('group rounded-xl border bg-card p-4 flex flex-col gap-3 min-h-[300px] cursor-pointer transition-[border-color,box-shadow] hover:shadow-md',
        a.estado === 'trabalhando' ? 'border-primary/40 shadow-sm' : 'border-border hover:border-primary/30')}>
      <div className="flex items-start gap-3">
        <Avatar a={a} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate group-hover:text-primary-ink">{a.nome}</span>
            {a.modelo && <span className="text-[11px] text-muted-foreground border border-border rounded px-1">{a.modelo}</span>}
          </div>
          <div className="mt-1 flex items-center gap-1.5"><EstadoPill a={a} />
            {a.simultaneos > 1 && <span className="text-xs text-muted-foreground" title={`Mais ${a.simultaneos - 1} trabalho(s) rodando ao mesmo tempo: veja no Histórico`}>+{a.simultaneos - 1}</span>}
          </div>
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* agora */}
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm min-h-[64px]">
        {a.estado === 'trabalhando' && at ? (
          <button className="text-left w-full" onClick={(e) => { e.stopPropagation(); onAbrir(at.id); }} title="Ver os passos">
            <div className="line-clamp-2">{at.passo}</div>
            <div className="text-xs text-muted-foreground truncate mt-0.5 inline-flex items-center gap-1 max-w-full">
              {at.origem === 'terminal' && <SquareTerminal className="size-3 shrink-0" />}<span className="truncate">{at.titulo}</span>
            </div>
          </button>
        ) : a.estado === 'acordado' && at ? (
          <button className="text-left w-full" onClick={(e) => { e.stopPropagation(); onAbrir(at.id); }}>
            <div className="inline-flex items-center gap-1.5"><SquareTerminal className="size-3.5" />Sessão aberta: esperando você</div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">{at.titulo}</div>
          </button>
        ) : (
          <div className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{a.descricao}</div>
        )}
      </div>

      {/* fila do quadro */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><ListTodo className="size-3.5" />Fila no quadro{a.fila.length > 0 && <span className="tabular-nums">· {a.fila.length}</span>}</div>
        {a.fila.length ? (
          <ul className="space-y-0.5">
            {a.fila.slice(0, 3).map((t) => (
              <li key={t.id} className="text-sm flex items-center gap-1.5 min-w-0">
                <Link to={`/p/${slug}/quadro?t=${t.id}`} onClick={(e) => e.stopPropagation()} className="truncate hover:underline" title={t.title}><span className="text-muted-foreground tabular-nums">{t.id}</span> {t.title}</Link>
                {t.pronta && <span className="shrink-0 text-[11px] rounded-full bg-primary-soft text-primary-ink px-1.5">pronta</span>}
              </li>
            ))}
            {a.fila.length > 3 && <li className="text-xs text-muted-foreground">+ {a.fila.length - 3}</li>}
          </ul>
        ) : <div className="text-xs text-muted-foreground/70">Nada na fila</div>}
      </div>

      {/* últimas entregas */}
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-1">Últimos trabalhos</div>
        {a.ultimas.length ? (
          <ul className="space-y-1">
            {a.ultimas.slice(0, 3).map((t) => (
              <li key={t.id}>
                <button className="w-full text-left flex items-center gap-1.5 text-sm hover:text-primary-ink min-w-0" onClick={(e) => { e.stopPropagation(); onAbrir(t.id); }}>
                  <span className={cx('size-1.5 shrink-0 rounded-full', t.status === 'erro' ? 'bg-destructive' : t.status === 'parado' ? 'bg-muted-foreground/50' : 'bg-success')} />
                  <span className="truncate flex-1" title={t.titulo}>{t.titulo}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmtRelative(t.fim ?? t.inicio).replace('há ', '')}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <div className="text-xs text-muted-foreground/70">Nenhum ainda</div>}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 min-w-0 truncate"><Sparkles className="size-3.5 shrink-0" />
          {a.id === 'orquestrador' ? 'orquestrar' : a.skills.length ? a.skills.join(', ') : 'sem skills'}
        </span>
        <span className="tabular-nums whitespace-nowrap" title="Últimos 7 dias (custo só do que rodou pelo app)">7 dias: {a.semana.trabalhos}{a.semana.custo > 0 ? ` · ${usd(a.semana.custo)}` : ''}</span>
      </div>
    </div>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────────
function Skills({ lista, erro, agentes, slug }: { lista?: SkillResumo[]; erro: unknown; agentes: AgenteCard[]; slug: string }) {
  const [q, setQ] = useState('');
  const [grupo, setGrupo] = useState('');
  const [agente, setAgente] = useState('');
  const filtradas = useMemo(() => (lista ?? []).filter((s) => (!grupo || s.grupo === grupo)
    && (!agente || (agente === 'principal' ? !s.agentes.length : s.agentes.includes(agente)))
    && (!q || `${s.id} ${s.descricao}`.toLowerCase().includes(q.toLowerCase()))), [lista, q, grupo, agente]);
  if (erro) return <ErrorBox error={erro} />;
  if (!lista) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-40 rounded-xl bg-muted/70 animate-pulse" />)}</div>;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <label className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar skill" className="h-8 w-56 rounded-lg border border-border bg-card pl-8 pr-2.5 text-sm outline-none focus:border-primary/40" />
        </label>
        <SelectField size="sm" value={grupo} onChange={setGrupo} aria-label="Tipo" options={[{ value: '', label: 'Skills e formatos' }, { value: 'skill', label: 'Skills' }, { value: 'formato', label: 'Formatos (fmt-*)' }]} />
        <SelectField size="sm" value={agente} onChange={setAgente} aria-label="Agente" options={[{ value: '', label: 'Todos os agentes' }, ...agentes.map((a) => ({ value: a.id, label: a.nome })), { value: 'principal', label: 'Só sessão principal' }]} />
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{filtradas.length} de {lista.length}</span>
      </div>
      <FillBox>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pb-2">
          {filtradas.map((s) => (
            <Link key={s.id} to={`/p/${slug}/agentes/skills/${s.id}`}
              className="group rounded-xl border border-border bg-card p-4 flex flex-col gap-2.5 hover:border-primary/30 hover:shadow-md transition-[border-color,box-shadow]">
              <div className="flex items-center gap-2.5">
                <span className="size-8 shrink-0 rounded-lg grid place-items-center bg-ai-soft text-ai-ink"><Sparkles className="size-4" strokeWidth={1.8} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium truncate group-hover:text-primary-ink">{s.id}</span>
                  <span className="block text-[11px] text-muted-foreground">{s.grupo === 'formato' ? 'Formato' : 'Skill'} · {s.arquivos} arquivo{s.arquivos === 1 ? '' : 's'}</span>
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">{s.descricao || 'Sem descrição no SKILL.md.'}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {s.agentes.length ? (
                  <>
                    <Pilha ids={s.agentes} agentes={agentes} />
                    <span className="text-xs text-muted-foreground truncate">{s.agentes.map((id) => agentes.find((a) => a.id === id)?.nome ?? NOME_AGENTE[id] ?? id).join(', ')}</span>
                  </>
                ) : <span className="text-xs text-muted-foreground">Sessão principal (você chama direto)</span>}
              </div>
            </Link>
          ))}
        </div>
        {!filtradas.length && <div className="p-6 text-sm text-muted-foreground text-center">Nada com esses filtros.</div>}
      </FillBox>
    </>
  );
}

// ── Histórico ─────────────────────────────────────────────────────────────────
function Historico({ data, onAbrir }: { data: AgentesView; onAbrir: (id: string) => void }) {
  const [agente, setAgente] = useState('');
  const [origem, setOrigem] = useState('');
  const [status, setStatus] = useState('');
  const lista = useMemo(() => data.historico.filter((a) =>
    (!agente || (a.agente ?? 'orquestrador').replace(/^agent:/, '').replace(/^ai$/, 'orquestrador') === agente || (a.passos ?? []).some((p) => (p.agente ?? '').replace(/^agent:/, '') === agente))
    && (!origem || (origem === 'terminal' ? a.origem === 'terminal' : a.origem !== 'terminal'))
    && (!status || a.status === status)), [data, agente, origem, status]);
  if (!data.historico.length) return <Empty title="Nenhum trabalho de IA ainda" hint="Tudo o que a IA fizer pelo app (Rodar IA, Pedir ajustes, análises, pesquisas) ou numa sessão aberta no terminal aparece aqui, com os passos." />;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <SelectField size="sm" value={agente} onChange={setAgente} aria-label="Agente" options={[{ value: '', label: 'Todos os agentes' }, ...data.agentes.map((a) => ({ value: a.id, label: a.nome }))]} />
        <SelectField size="sm" value={origem} onChange={setOrigem} aria-label="Origem" options={[{ value: '', label: 'App e terminal' }, { value: 'app', label: 'Pelo app' }, { value: 'terminal', label: 'No terminal' }]} />
        <SelectField size="sm" value={status} onChange={setStatus} aria-label="Status" options={[{ value: '', label: 'Todos' }, { value: 'rodando', label: 'Rodando' }, { value: 'feito', label: 'Prontos' }, { value: 'erro', label: 'Com erro' }, { value: 'parado', label: 'Parados' }]} />
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{lista.length} de {data.historico.length}</span>
      </div>
      <FillBox className="rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {lista.map((a) => (
            <li key={a.id}>
              <button className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50" onClick={() => onAbrir(a.id)}>
                <Selo a={a} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate" title={a.titulo}>{a.titulo}</div>
                  <div className={cx('text-xs truncate', a.status === 'erro' ? 'text-destructive' : 'text-muted-foreground')}>
                    {a.status === 'rodando' ? a.passo : a.status === 'erro' ? a.erro : a.resumo ?? '—'}
                  </div>
                </div>
                <span className="hidden md:block w-32 shrink-0 text-xs truncate">{quem(a)}{a.origem === 'terminal' && <span className="text-muted-foreground"> · terminal</span>}</span>
                <span className="w-36 shrink-0 text-xs text-muted-foreground tabular-nums hidden sm:block">{fmtDateTime(a.inicio)}</span>
                <span className="w-24 shrink-0 text-xs tabular-nums text-right">{a.status === 'rodando' ? duracao(a.inicio) : `${STATUS[a.status]} · ${duracao(a.inicio, a.fim)}`}</span>
                <span className="w-16 shrink-0 text-xs tabular-nums text-right text-muted-foreground">{a.custo != null ? usd(a.custo).replace('US$ ', '$') : '—'}</span>
              </button>
            </li>
          ))}
        </ul>
        {!lista.length && <div className="p-6 text-sm text-muted-foreground text-center">Nada com esses filtros.</div>}
      </FillBox>
    </>
  );
}

function Detalhe({ a }: { a: Atividade }) {
  const passos = a.passos ?? [];
  const t0 = Date.parse(a.inicio);
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <Selo a={a} />
        <div className="min-w-0 flex-1 text-sm">
          <div className="font-medium">{quem(a)}{a.origem === 'terminal' && <span className="text-muted-foreground font-normal"> · sessão no terminal</span>}</div>
          <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {fmtDateTime(a.inicio)} · {a.status === 'rodando' ? `rodando há ${duracao(a.inicio)}` : `${STATUS[a.status]} em ${duracao(a.inicio, a.fim)}`}
            {a.turnos != null && ` · ${a.turnos} turnos`}{a.custo != null && ` · ${usd(a.custo)}`}
          </div>
        </div>
        {a.link && <Link to={a.link} className="shrink-0 inline-flex items-center gap-1 text-sm text-primary-ink hover:underline"><ArrowUpRight className="size-3.5" />Abrir onde rodou</Link>}
      </div>
      {a.status === 'erro' && a.erro && <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2">{a.erro}</div>}
      {a.origem === 'terminal' && a.status === 'rodando' && <div className="text-xs text-muted-foreground">Para parar ou responder, use a janela do terminal onde a sessão está aberta.</div>}

      <section>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Passos</h3>
        {passos.length ? (
          <ol className="relative border-l border-border ml-1.5 space-y-2">
            {passos.map((p, i) => (
              <li key={i} className="pl-4 relative">
                <span className={cx('absolute -left-[4.5px] top-1.5 size-2 rounded-full', i === passos.length - 1 && a.status === 'rodando' ? 'bg-primary animate-pulse' : 'bg-border')} />
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-xs text-muted-foreground tabular-nums w-10 shrink-0">{duracao(new Date(t0).toISOString(), p.em)}</span>
                  <span className="min-w-0">
                    {p.agente && p.agente !== a.agente && <span className="text-xs font-medium text-primary-ink mr-1.5">{quem({ ...a, agente: p.agente })}</span>}
                    {p.texto}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : <div className="text-sm text-muted-foreground">Sem passos registrados (trabalho anterior ao histórico de passos).</div>}
      </section>

      {(a.final || a.resumo) && (
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{a.origem === 'terminal' ? 'Última resposta' : 'Resposta final'}</h3>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm whitespace-pre-wrap max-h-[40vh] overflow-y-auto">{a.final ?? a.resumo}</div>
        </section>
      )}
    </div>
  );
}

