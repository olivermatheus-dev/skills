// Agentes (tarefa 046 E): a equipe de IA e o que cada um está fazendo. Duas abas:
// · Equipe: um cartão por agente (orquestrador + 7) com estado (trabalhando · acordado · dormindo), o passo atual,
//   a fila do quadro, as últimas entregas e as instruções permanentes (.claude/agent-notes/, acrescentar pelo app).
// · Histórico: cada trabalho de IA (pelo app ou sessão aberta no terminal, via hooks) com passos, duração, custo e texto final.
// Só observa o registro (logs/atividade/); rodar continua nos botões de cada tela.
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, BookOpenText, History, ListTodo, Moon, Plus, SquareTerminal, UsersRound } from 'lucide-react';
import { api, type AgenteCard, type AgentesView, type Atividade } from '../api';
import { Button, Drawer, Empty, ErrorBox, PageHeader, SelectField, Textarea, Input, cx } from '../components/kit';
import { AppContent } from '../components/AppContent';
import { FillBox } from '../components/fill';
import { Selo, duracao, quem } from '../components/atividade/AtividadeDock';
import { fmtDateTime, fmtRelative } from '@/lib/dates';
import { toast } from '../components/toast';

// cores do campo `color` dos agentes do Claude Code
const COR: Record<string, string> = { red: '#e5484d', orange: '#f76b15', yellow: '#d6a10a', green: '#30a46c', cyan: '#00a2c7', blue: '#3e63dd', purple: '#8e4ec6', pink: '#d6409f' };
const usd = (v: number) => `US$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const ESTADO = {
  trabalhando: { label: 'Trabalhando', cls: 'bg-primary-soft text-primary-ink', dot: 'bg-primary animate-pulse' },
  acordado: { label: 'Acordado', cls: 'bg-success/10 text-success', dot: 'bg-success' },
  dormindo: { label: 'Dormindo', cls: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/40' },
} as const;
const STATUS: Record<Atividade['status'], string> = { fila: 'na fila', rodando: 'rodando', feito: 'pronto', erro: 'falhou', parado: 'parado' };

export default function Agentes() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const aba = sp.get('aba') === 'historico' ? 'historico' : 'equipe';
  const aberto = sp.get('h');
  const notasDe = sp.get('notas');
  const setParam = (k: string, v: string | null) => setSp((p) => { const n = new URLSearchParams(p); if (v) n.set(k, v); else n.delete(k); return n; }, { replace: true });

  const { data, error, isLoading } = useQuery({
    queryKey: ['agentes', slug], queryFn: () => api.agentes(slug), enabled: !!slug,
    refetchInterval: (q) => (q.state.data?.resumo.rodando ? 2500 : 15000),
  });
  const detalhe = data?.historico.find((a) => a.id === aberto) ?? null;
  const agenteNotas = data?.agentes.find((a) => a.id === notasDe) ?? null;

  const tab = 'inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 whitespace-nowrap -mb-px';
  const cls = (on: boolean) => cx(tab, on ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground');

  return (
    <AppContent>
      <PageHeader title="Agentes" subtitle="Quem da equipe de IA está trabalhando, em quê e o que já entregou. Inclui as sessões abertas no terminal." />
      {data && <Resumo r={data.resumo} />}
      <nav className="flex gap-0.5 border-b border-border mb-5">
        <button className={cls(aba === 'equipe')} onClick={() => setParam('aba', null)}><UsersRound className="size-4" strokeWidth={1.8} />Equipe</button>
        <button className={cls(aba === 'historico')} onClick={() => setParam('aba', 'historico')}>
          <History className="size-4" strokeWidth={1.8} />Histórico{data && <span className="text-xs tabular-nums text-muted-foreground">{data.historico.length}</span>}
          {!!data?.resumo.rodando && <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-label="rodando" />}
        </button>
      </nav>
      <ErrorBox error={error} />
      {isLoading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-72 rounded-xl bg-muted/70 animate-pulse" />)}</div>}
      {data && aba === 'equipe' && (
        <FillBox>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pb-2">
            {data.agentes.map((a) => <Cartao key={a.id} a={a} slug={slug} onAbrir={(id) => setParam('h', id)} onNotas={() => setParam('notas', a.id)} />)}
          </div>
        </FillBox>
      )}
      {data && aba === 'historico' && <Historico data={data} onAbrir={(id) => setParam('h', id)} />}
      <Drawer open={!!detalhe} onClose={() => setParam('h', null)} title={detalhe ? detalhe.titulo : ''} width="max-w-xl">
        {detalhe && <Detalhe a={detalhe} />}
      </Drawer>
      <Drawer open={!!agenteNotas} onClose={() => setParam('notas', null)} title={agenteNotas ? `Instruções permanentes · ${agenteNotas.nome}` : ''} width="max-w-xl">
        {agenteNotas && <Notas a={agenteNotas} slug={slug} />}
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

function Avatar({ a }: { a: AgenteCard }) {
  const cor = (a.cor && COR[a.cor]) ?? 'var(--primary)';
  const ini = a.nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className="relative size-10 shrink-0 rounded-full grid place-items-center text-sm font-semibold text-white" style={{ background: cor }}>
      {ini}
      <span className={cx('absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-card', ESTADO[a.estado].dot)} />
    </span>
  );
}

function Cartao({ a, slug, onAbrir, onNotas }: { a: AgenteCard; slug: string; onAbrir: (id: string) => void; onNotas: () => void }) {
  const e = ESTADO[a.estado];
  const at = a.atual;
  return (
    <div className={cx('rounded-xl border bg-card p-4 flex flex-col gap-3 min-h-[300px]', a.estado === 'trabalhando' ? 'border-primary/40 shadow-sm' : 'border-border')}>
      <div className="flex items-start gap-3">
        <Avatar a={a} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{a.nome}</span>
            {a.modelo && <span className="text-[11px] text-muted-foreground border border-border rounded px-1">{a.modelo}</span>}
          </div>
          <span className={cx('inline-flex items-center gap-1 mt-1 text-xs rounded-full px-2 py-0.5', e.cls)}>
            {a.estado === 'dormindo' && <Moon className="size-3" />}{e.label}{a.desde && a.estado === 'trabalhando' && <span className="tabular-nums">· {duracao(a.desde)}</span>}
          </span>
          {a.simultaneos > 1 && <span className="ml-1.5 text-xs text-muted-foreground" title={`Mais ${a.simultaneos - 1} trabalho(s) rodando ao mesmo tempo (sessões ou pedidos): veja no Histórico`}>+{a.simultaneos - 1}</span>}
        </div>
      </div>

      {/* agora */}
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm min-h-[64px]">
        {a.estado === 'trabalhando' && at ? (
          <button className="text-left w-full" onClick={() => onAbrir(at.id)} title="Ver os passos">
            <div className="line-clamp-2">{at.passo}</div>
            <div className="text-xs text-muted-foreground truncate mt-0.5 inline-flex items-center gap-1 max-w-full">
              {at.origem === 'terminal' && <SquareTerminal className="size-3 shrink-0" />}<span className="truncate">{at.titulo}</span>
            </div>
          </button>
        ) : a.estado === 'acordado' && at ? (
          <button className="text-left w-full" onClick={() => onAbrir(at.id)}>
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
                <Link to={`/p/${slug}/quadro?t=${t.id}`} className="truncate hover:underline" title={t.title}><span className="text-muted-foreground tabular-nums">{t.id}</span> {t.title}</Link>
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
                <button className="w-full text-left flex items-center gap-1.5 text-sm hover:text-primary-ink min-w-0" onClick={() => onAbrir(t.id)}>
                  <span className={cx('size-1.5 shrink-0 rounded-full', t.status === 'erro' ? 'bg-destructive' : t.status === 'parado' ? 'bg-muted-foreground/50' : 'bg-success')} />
                  <span className="truncate flex-1" title={t.titulo}>{t.titulo}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmtRelative(t.fim ?? t.inicio).replace('há ', '')}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <div className="text-xs text-muted-foreground/70">Nenhum ainda</div>}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border text-xs">
        {a.id === 'orquestrador' ? (
          <span className="text-muted-foreground inline-flex items-center gap-1" title="As regras do orquestrador ficam no CLAUDE.md">
            <BookOpenText className="size-3.5" />CLAUDE.md
          </span>
        ) : (
          <button className="inline-flex items-center gap-1 text-primary-ink hover:underline" onClick={onNotas}>
            <BookOpenText className="size-3.5" />Instruções{a.notas.itens ? ` (${a.notas.itens})` : ''}
          </button>
        )}
        <span className="text-muted-foreground tabular-nums whitespace-nowrap" title="Últimos 7 dias (custo só do que rodou pelo app)">7 dias: {a.semana.trabalhos}{a.semana.custo > 0 ? ` · ${usd(a.semana.custo)}` : ''}</span>
      </div>
    </div>
  );
}

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

function Notas({ a, slug }: { a: AgenteCard; slug: string }) {
  const qc = useQueryClient();
  const { data, error } = useQuery({ queryKey: ['agente-notas', a.id], queryFn: () => api.agenteNotas(a.id) });
  const [nova, setNova] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const salvar = useMutation({
    mutationFn: (b: { nova?: string; texto?: string }) => api.salvarAgenteNotas(a.id, b),
    onSuccess: (r) => { qc.setQueryData(['agente-notas', a.id], r); void qc.invalidateQueries({ queryKey: ['agentes', slug] }); setNova(''); setEditando(null); toast.ok('Instrução salva: vale a partir da próxima tarefa'); },
    onError: (e) => toast.error(e, 'Não foi possível salvar'),
  });
  const linhas = (data?.texto ?? '').split(/\r?\n/).filter((l) => /^\s*-\s+/.test(l)).map((l) => l.replace(/^\s*-\s+/, '').replace(/\*\*/g, ''));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">O {a.nome.toLowerCase()} lê estas instruções antes de toda tarefa. Use para preferências e correções que valem sempre; para uma tarefa só, comente no card do quadro.</p>
      <ErrorBox error={error} />
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (nova.trim()) salvar.mutate({ nova }); }}>
        <Input className="flex-1" value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Nova instrução (ex.: nunca usar foto de banco de imagem)" autoFocus />
        <Button type="submit" disabled={!nova.trim() || salvar.isPending} className="inline-flex items-center gap-1.5"><Plus className="size-4" />Acrescentar</Button>
      </form>
      {editando == null ? (
        <>
          {linhas.length ? (
            <ul className="space-y-1.5">
              {linhas.map((l, i) => {
                const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*·\s*(.*)$/);
                return (
                  <li key={i} className="text-sm rounded-lg border border-border px-3 py-2">
                    {m ? <><span className="text-xs text-muted-foreground tabular-nums mr-2">{m[1].split('-').reverse().join('/')}</span>{m[2]}</> : l}
                  </li>
                );
              })}
            </ul>
          ) : data && <div className="text-sm text-muted-foreground">Nenhuma instrução ainda.</div>}
          {data && <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setEditando(data.texto)}>Editar o arquivo inteiro ({data.arquivo})</button>}
        </>
      ) : (
        <div className="space-y-2">
          <Textarea rows={16} value={editando} onChange={(e) => setEditando(e.target.value)} className="font-mono text-xs" />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button disabled={salvar.isPending} onClick={() => salvar.mutate({ texto: editando })}>Salvar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
