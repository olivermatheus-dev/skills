// Relatórios de análise do concorrente (040 F), na aba Redes e conteúdos: o mais recente em destaque, os anteriores numa lista
// compacta por data e rede, a leitura num diálogo (leitura em blocos à esquerda, números em tabela compacta à direita) e os
// termos novos da rodada com "Aceitar todos" ou um a um. "Gerar relatório" roda em segundo plano (046 D, mesmo caminho do Rodar IA, com dock e Parar) ou abre o Claude Code num terminal.
import { useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Check, ChevronRight, Copy, ExternalLink, FileBarChart, Lightbulb, Play, ScanSearch, ShieldAlert, Sparkles, TriangleAlert } from 'lucide-react';
import { api, type RelatorioLinha, type RelatorioView } from '../../../api';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Checkbox } from '../../ui/checkbox';
import { Button, cx, fmtDate, fmtNum } from '../../kit';
import { toast } from '../../toast';
import { PlatformIcon, Spinner, fmtPct, fmtRatio, platformLabel } from '../lib';
import { fk } from '../ficha/useFichas';
import { TermoDialog, rotuloAceitar } from '../ficha/TermoDialog';
import { PedidoStatus, usePedidoIa } from '../../atividade/PedidoIa';

const rk = {
  lista: (slug: string, comp: string) => ['relatorios', slug, comp] as const,
  um: (slug: string, comp: string, id: string) => ['relatorio', slug, comp, id] as const,
  fichas: (slug: string, comp: string) => ['relatorios-fichas', slug, comp] as const,
};
const ESCOPO: Record<string, string> = { top10: 'Top 10', top20: 'Top 20', selecao: 'Seleção', 'todos-analisados': 'Todos os analisados' };
const GRUPO_NOME: Record<string, string> = {
  tipoConteudo: 'Tipo de conteúdo', gatilho: 'Gatilho', tipoGancho: 'Tipo de gancho', canalGancho: 'Canal do gancho', elemento5s: 'Elemento dos 5 s',
  estruturaMacro: 'Estrutura', estiloProducao: 'Estilo de produção', ctaTipo: 'CTA', produtoPresenca: 'Presença do produto', consciencia: 'Consciência',
  tom: 'Tom', som: 'Som', risco: 'Risco', autoria: 'Autoria', provaTipo: 'Prova', funil: 'Funil', formato: 'Formato', tema: 'Tema', angulo: 'Ângulo', publico: 'Público',
};
/** onde o termo aceito vai morar (desenho §1.4) */
const DESTINO = (g: string) => (g === 'formato' ? 'vira verbete rascunho na galeria de formatos' : ['tema', 'angulo', 'publico'].includes(g) ? 'entra nas tags do projeto' : 'entra no vocabulário da análise');
/** razão com 2 casas abaixo de 10 (o mesmo que a leitura cita: 2,48×), inteira acima */
const fmtX = (n?: number | null) => (n == null ? '—' : n >= 10 ? fmtRatio(n) : `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×`);
const nivelTxt = (n: string | null) => (n === 'observacoes' ? 'amostra pequena · observações' : n === 'padroes' ? 'padrões' : '');

// tipos dos agregados (gravados pelo script tools/fichas/relatorio.ts)
interface ItemAg { key: string; url: string; titulo: string; duracaoS: number | null; views: number | null; shares: number | null; xPerfil: number | null; xMercado: number | null; porSeguidor: number | null; engajamento: number | null; tipo: string | null; formato: string | null; tipoGancho: string | null; estrutura: string | null }
interface GrupoAg { valor: string; nome: string; n: number; fraca: boolean; itens: string[]; melhor: string | null; proposto?: boolean; lift: number | null; med: { xPerfil: number | null; xMercado: number | null; porSeguidor: number | null; engajamento: number | null } }
interface Agregados { amostra?: { n: number; nivel: string; coletadosNaRede: number; avisos: string[] }; itens?: ItemAg[]; dimensoes?: Record<string, GrupoAg[]> }
const DIMS: [string, string][] = [['tipo', 'Tipo'], ['formato', 'Formato'], ['tipoGancho', 'Gancho'], ['estrutura', 'Estrutura'], ['tema', 'Tema'], ['gatilho', 'Gatilhos'], ['elemento5s', '5 s'], ['produto', 'Produto']];


/** itemKey → relatório mais recente que cita o item (um mapa por concorrente; a lista já vem do mais novo ao mais antigo) */
export function useRelatorioPorItem(slug: string, comp: string) {
  const lista = useQuery({ queryKey: rk.lista(slug, comp), queryFn: () => api.relatorios(slug, comp), enabled: !!slug && !!comp });
  const ls = (lista.data ?? []).slice(0, 12);
  const views = useQueries({ queries: ls.map((l) => ({ queryKey: rk.um(slug, comp, l.id), queryFn: () => api.relatorio(slug, comp, l.id), staleTime: 60_000 })) });
  return useMemo(() => {
    const m = new Map<string, { id: string; gerado: string }>();
    ls.forEach((l, i) => { for (const k of views[i]?.data?.relatorio.itens ?? []) if (!m.has(k)) m.set(k, { id: l.id, gerado: l.gerado }); });
    return m;
  }, [lista.data, views.map((v) => v.dataUpdatedAt).join()]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ───────────────────────── seção na aba ─────────────────────────
export default function RelatoriosSection({ slug, comp, onOpenItem }: { slug: string; comp: string; onOpenItem: (key: string) => void }) {
  const q = useQuery({ queryKey: rk.lista(slug, comp), queryFn: () => api.relatorios(slug, comp) });
  const [aberto, setAberto] = useState<string | null>(null);
  const [gerar, setGerar] = useState(false);
  const qc = useQueryClient();
  const recarregar = () => void qc.invalidateQueries({ queryKey: rk.lista(slug, comp) });
  const { pedido, rodando } = usePedidoIa(slug, `relatorio:${comp}`, { aoTerminar: (x) => { recarregar(); if (x.status === 'feito') toast.ok('Relatório pronto'); } });
  const lista = q.data ?? [];
  const destaque = lista.find((r) => r.emDestaque) ?? lista[0];
  const resto = lista.filter((r) => r !== destaque);

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-base font-semibold">Relatórios de análise</h2>
        {lista.length > 0 && <span className="text-xs text-muted-foreground tabular-nums">{lista.length}</span>}
        {rodando
          ? <PedidoStatus slug={slug} pedido={pedido} className="ml-auto max-w-md" />
          : <Button variant="ghost" className="ml-auto inline-flex items-center gap-1.5" onClick={() => setGerar(true)}><ScanSearch className="size-3.5" />Gerar relatório</Button>}
      </div>
      {!rodando && pedido?.status === 'erro' && <PedidoStatus slug={slug} pedido={pedido} className="mb-2" />}
      {q.isLoading && <div className="h-24 rounded-lg border border-border bg-card animate-pulse" />}
      {!q.isLoading && !lista.length && (
        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Nenhum relatório ainda. Cada rodada de análise vira um mini compilado aqui: o que se repete, o que copiar e o que evitar.
        </div>
      )}
      {destaque && <Destaque r={destaque} onOpen={() => setAberto(destaque.id)} />}
      {resto.length > 0 && (
        <div className="mt-2 rounded-lg border border-border bg-card divide-y divide-border">
          {resto.map((r) => (
            <button key={r.id} onClick={() => setAberto(r.id)} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50">
              <span className="w-20 text-xs text-muted-foreground tabular-nums">{fmtDate(r.gerado)}</span>
              <span className="w-28 inline-flex items-center gap-1.5"><PlatformIcon platform={r.rede} size={13} />{platformLabel(r.rede)}</span>
              <span className="w-36 text-xs text-muted-foreground">{ESCOPO[r.escopo]} · {r.itens} itens</span>
              <span className="flex-1 min-w-0 truncate">{r.resumo ?? <span className="text-muted-foreground">leitura pendente (só os números)</span>}</span>
              {r.termosPendentes > 0 && <span className="text-xs text-ai-ink">{r.termosPendentes} termo(s)</span>}
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
      {aberto && <RelatorioDialog slug={slug} comp={comp} id={aberto} onClose={() => setAberto(null)} onOpenItem={(k) => { setAberto(null); onOpenItem(k); }} />}
      {gerar && <GerarDialog slug={slug} comp={comp} onClose={() => setGerar(false)} />}
    </section>
  );
}

function Destaque({ r, onOpen }: { r: RelatorioLinha; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full text-left rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/50 transition group">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary-ink px-2 py-0.5 font-medium">mais recente</span>
        <PlatformIcon platform={r.rede} size={13} /><span className="text-foreground font-medium">{platformLabel(r.rede)}</span>
        <span>· {ESCOPO[r.escopo]} · {r.itens} itens · {fmtDate(r.gerado)}</span>
        {r.nivel === 'observacoes' && <span className="inline-flex items-center gap-1 text-warning-ink"><TriangleAlert className="size-3" />{nivelTxt(r.nivel)}</span>}
        <span className="ml-auto inline-flex items-center gap-1 text-primary-ink font-medium group-hover:underline"><FileBarChart className="size-3.5" />Abrir relatório</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed line-clamp-2">{r.resumo ?? <span className="text-muted-foreground">Leitura do Opus pendente: o relatório tem só os números do script.</span>}</p>
      {r.termosPendentes > 0 && <p className="mt-1 text-xs text-ai-ink inline-flex items-center gap-1"><Sparkles className="size-3" />{r.termosPendentes} termo(s) novo(s) para aceitar ou recusar</p>}
    </button>
  );
}

// ───────────────────────── leitura ─────────────────────────
export function RelatorioDialog({ slug, comp, id, onClose, onOpenItem }: { slug: string; comp: string; id: string; onClose: () => void; onOpenItem: (key: string) => void }) {
  const q = useQuery({ queryKey: rk.um(slug, comp, id), queryFn: () => api.relatorio(slug, comp, id) });
  const v = q.data;
  const r = v?.relatorio;
  const ag = (r?.agregados ?? {}) as Agregados;
  const itens = useMemo(() => new Map((ag.itens ?? []).map((i) => [i.key, i])), [ag.itens]);
  const Cita = ({ keys }: { keys: string[] }) => (keys.length ? (
    <span className="inline-flex flex-wrap gap-1 ml-1 align-middle">
      {keys.map((k) => (
        <button key={k} onClick={() => onOpenItem(k)} title={`${itens.get(k)?.titulo ?? k}\nabrir o painel do item`}
          className="max-w-[180px] truncate rounded bg-muted px-1.5 py-px text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/70">
          {(itens.get(k)?.titulo ?? k).slice(0, 28)}
        </button>
      ))}
    </span>
  ) : null);
  const l = r?.leitura;
  const obs = ag.amostra?.nivel !== 'padroes';

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined} className="p-0 gap-0 flex flex-col overflow-hidden w-[calc(100vw-2rem)] max-w-[1240px] sm:max-w-[1240px] h-[calc(100vh-2rem)] max-h-[960px]">
        <header className="flex items-center gap-3 px-6 py-3.5 pr-14 border-b border-border">
          {r && <PlatformIcon platform={r.rede} size={20} />}
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-snug truncate">{r ? `Relatório · ${platformLabel(r.rede)} · ${ESCOPO[r.escopo]}` : 'Relatório'}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              {r ? <>{fmtDate(r.gerado)} · {r.itens.length} itens analisados{ag.amostra ? ` de ${ag.amostra.coletadosNaRede} coletados` : ''} · leitura: {l ? r.modelo : 'pendente'}{r.anterior ? ` · anterior: ${r.anterior}` : ''}</> : ' '}
            </DialogDescription>
          </div>
        </header>
        {!v ? (
          <div className="flex-1 grid place-items-center text-sm text-muted-foreground">{q.isError ? 'Não foi possível abrir o relatório.' : <Spinner />}</div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!!ag.amostra?.avisos.length && (
              <div className="mx-6 mt-4 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-foreground/80 space-y-0.5">
                {ag.amostra.avisos.map((a) => <p key={a} className="flex gap-1.5"><TriangleAlert className="size-3.5 shrink-0 mt-px text-warning-ink" />{a}</p>)}
              </div>
            )}
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] gap-6 px-6 py-4">
              {/* leitura em blocos */}
              <div className="space-y-5 min-w-0">
                {!l && <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">A leitura do Opus ainda não foi escrita: aqui estão só os números do script. Use "Gerar relatório" para completar.</p>}
                {l && (
                  <Bloco titulo="Em 5 linhas">
                    <ul className="space-y-1.5 text-sm leading-relaxed">{l.resumo.map((x) => <li key={x} className="pl-3 border-l-2 border-primary/40">{x}</li>)}</ul>
                  </Bloco>
                )}
                {l && l.padroes.length > 0 && (
                  <Bloco titulo={obs ? 'Observações' : 'Padrões'} hint={obs ? 'amostra pequena: hipóteses para testar' : undefined}>
                    <div className="space-y-2.5">{l.padroes.map((p) => <p key={p.titulo} className="text-sm leading-relaxed"><b className="font-semibold">{p.titulo}.</b> {p.texto}<Cita keys={p.itens} /></p>)}</div>
                  </Bloco>
                )}
                {l && l.copiar.length > 0 && (
                  <Bloco titulo="O que copiar" hint="o mecanismo, nunca a frase" icon={<Check className="size-3.5 text-success-ink" />}>
                    <div className="space-y-2.5">{l.copiar.map((c) => (
                      <div key={c.mecanismo} className="text-sm leading-relaxed"><p className="font-medium">{c.mecanismo}</p><p className="text-foreground/80">{c.como}<Cita keys={c.itens} /></p></div>
                    ))}</div>
                  </Bloco>
                )}
                {l && l.evitar.length > 0 && (
                  <Bloco titulo="O que evitar" icon={<ShieldAlert className="size-3.5 text-destructive" />}>
                    <ul className="space-y-1.5 text-sm leading-relaxed">{l.evitar.map((e) => <li key={e.texto}>{e.texto}<Cita keys={e.itens} /></li>)}</ul>
                  </Bloco>
                )}
                {l && l.ideias.length > 0 && (
                  <Bloco titulo="Ideias para nós" icon={<Lightbulb className="size-3.5 text-warning-ink" />}>
                    <ol className="space-y-2 text-sm leading-relaxed list-decimal pl-5">{l.ideias.map((i) => <li key={i.ideia}>{i.ideia}{i.formato && <span className="ml-1.5 rounded border border-border px-1 py-px text-[11px] text-muted-foreground">formato: {i.formato}</span>}<Cita keys={i.itens} /></li>)}</ol>
                  </Bloco>
                )}
                {l && l.limites.length > 0 && (
                  <Bloco titulo="Limites">
                    <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed list-disc pl-4">{l.limites.map((x) => <li key={x}>{x}</li>)}</ul>
                  </Bloco>
                )}
              </div>
              {/* números */}
              <div className="space-y-5 min-w-0 lg:sticky lg:top-4 lg:self-start">
                <Termos slug={slug} comp={comp} id={id} v={v} />
                <Bloco titulo="Itens da rodada" hint="medidas da última coleta">
                  <table className="w-full text-xs tabular-nums">
                    <thead><tr className="text-muted-foreground text-left"><th className="font-normal py-1">item</th><th className="font-normal text-right whitespace-nowrap pl-2">views</th><th className="font-normal text-right whitespace-nowrap pl-2" title="views ÷ mediana do perfil">× perfil</th><th className="font-normal text-right whitespace-nowrap pl-2" title="views ÷ seguidores">por seg.</th><th className="font-normal text-right whitespace-nowrap pl-2">engaj.</th></tr></thead>
                    <tbody>{(ag.itens ?? []).map((i) => (
                      <tr key={i.key} className="border-t border-border">
                        <td className="py-1.5 pr-2 max-w-0 w-full"><button onClick={() => onOpenItem(i.key)} className="block truncate text-left hover:text-primary-ink w-full" title={i.titulo}>{i.titulo}</button></td>
                        <td className="text-right pl-2">{fmtNum(i.views ?? undefined)}</td>
                        <td className={cx('text-right pl-2', (i.xPerfil ?? 0) >= 3 && 'font-semibold text-success-ink')}>{fmtX(i.xPerfil)}</td>
                        <td className="text-right pl-2">{fmtX(i.porSeguidor)}</td>
                        <td className="text-right pl-2">{fmtPct(i.engajamento ?? undefined)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </Bloco>
                <Mix ag={ag} itens={itens} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Bloco({ titulo, hint, icon, children, acao }: { titulo: string; hint?: string; icon?: ReactNode; children: ReactNode; acao?: ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{icon}{titulo}{hint && <span className="normal-case tracking-normal font-normal">· {hint}</span>}{acao && <span className="ml-auto normal-case tracking-normal font-normal">{acao}</span>}</h3>
      {children}
    </section>
  );
}

function Mix({ ag, itens }: { ag: Agregados; itens: Map<string, ItemAg> }) {
  const [dim, setDim] = useState('tipo');
  const gs = ag.dimensoes?.[dim] ?? [];
  const temMercado = gs.some((g) => g.med.xMercado != null);
  return (
    <Bloco titulo="Mix × desempenho" hint="medianas; ⚠ = n < 3">
      <div className="flex flex-wrap gap-1 mb-2">
        {DIMS.filter(([d]) => ag.dimensoes?.[d]?.length).map(([d, nome]) => (
          <button key={d} onClick={() => setDim(d)} className={cx('rounded-md px-2 py-0.5 text-xs border', dim === d ? 'border-primary bg-primary-soft text-primary-ink font-medium' : 'border-border text-muted-foreground hover:text-foreground')}>{nome}</button>
        ))}
      </div>
      <table className="w-full text-xs tabular-nums">
        <thead><tr className="text-muted-foreground text-left">
          <th className="font-normal py-1">valor</th><th className="font-normal text-right whitespace-nowrap pl-2">n</th><th className="font-normal text-right whitespace-nowrap pl-2">× perfil</th>
          {temMercado && <th className="font-normal text-right whitespace-nowrap pl-2">× mercado</th>}<th className="font-normal text-right whitespace-nowrap pl-2">por seg.</th><th className="font-normal text-right whitespace-nowrap pl-2">engaj.</th>
        </tr></thead>
        <tbody>{gs.map((g) => (
          <tr key={g.valor} className="border-t border-border" title={`${g.n} item(ns): ${g.itens.map((k) => itens.get(k)?.titulo ?? k).join(' · ')}${g.lift != null ? `\nlift ${g.lift}` : ''}`}>
            <td className="py-1.5 pr-2">{g.nome}{g.proposto && <span className="ml-1 text-[10px] text-ai-ink">proposto</span>}{g.fraca && <span className="ml-1 text-warning-ink" title="amostra fraca (n < 3)">⚠</span>}</td>
            <td className="text-right pl-2">{g.n}</td>
            <td className="text-right pl-2">{fmtX(g.med.xPerfil)}</td>
            {temMercado && <td className="text-right pl-2">{fmtX(g.med.xMercado)}</td>}
            <td className="text-right pl-2">{fmtX(g.med.porSeguidor)}</td>
            <td className="text-right pl-2">{fmtPct(g.med.engajamento ?? undefined)}</td>
          </tr>
        ))}</tbody>
      </table>
      {!temMercado && <p className="mt-1.5 text-[11px] text-muted-foreground">× mercado indefinido nesta rede (menos de 3 concorrentes com dados).</p>}
    </Bloco>
  );
}

// ───────────────────────── termos novos ─────────────────────────
function Termos({ slug, comp, id, v }: { slug: string; comp: string; id: string; v: RelatorioView }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (ds: { grupo: string; valor: string; decisao: 'aceito' | 'recusado' }[]) => api.decidirTermos(slug, comp, id, ds),
    onSuccess: (res) => {
      if (res.view) qc.setQueryData(rk.um(slug, comp, id), res.view);
      void qc.invalidateQueries({ queryKey: rk.lista(slug, comp) });
      void qc.invalidateQueries({ queryKey: fk.vocab(slug) });
      const ruins = res.resultado.filter((r) => !r.ok);
      if (ruins.length) toast.error(new Error(ruins.map((r) => `${r.valor}: ${r.msg}`).join('\n')), 'Alguns termos não foram gravados');
      else toast.ok(res.resultado.length > 1 ? `${res.resultado.length} termos decididos` : 'Termo decidido');
    },
    onError: (e) => toast.error(e, 'Não foi possível gravar a decisão'),
  });
  const [recusar, setRecusar] = useState<{ grupo: string; valor: string } | null>(null);
  if (!v.termos.length) return null;
  const pend = v.termos.filter((t) => t.estado === 'pendente');
  const decide = (ts: typeof v.termos, decisao: 'aceito' | 'recusado') => m.mutate(ts.map((t) => ({ grupo: t.grupo, valor: t.valor, decisao })));
  return (
    <Bloco titulo="Termos novos" hint={pend.length ? `${pend.length} para decidir` : 'todos decididos'} icon={<Sparkles className="size-3.5 text-ai" />}
      acao={pend.length > 1 ? <Button variant="soft" className="!py-0.5 !px-2 text-xs inline-flex items-center gap-1" disabled={m.isPending} onClick={() => decide(pend, 'aceito')}>{m.isPending ? <Spinner /> : <Check className="size-3" />}Aceitar todos</Button> : undefined}>
      <div className="rounded-md border border-border divide-y divide-border">
        {v.termos.map((t) => (
          <div key={`${t.grupo}:${t.valor}`} className={cx('px-3 py-2 text-xs', t.estado !== 'pendente' && 'bg-muted/30')}>
            <div className="flex items-center gap-2">
              <code className="font-mono text-[12px] font-medium text-foreground">{t.valor}</code>
              <span className="text-muted-foreground">{GRUPO_NOME[t.grupo] ?? t.grupo} · {t.itens.length} item(ns)</span>
              <span className="ml-auto flex items-center gap-1">
                {t.estado === 'pendente' ? <>
                  <button disabled={m.isPending} onClick={() => decide([t], 'aceito')} title={`Aceitar: ${DESTINO(t.grupo)}`} className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:border-success hover:text-success-ink disabled:opacity-40"><Check className="size-3" />{rotuloAceitar(t.grupo)}</button>
                  <button disabled={m.isPending} onClick={() => setRecusar({ grupo: t.grupo, valor: t.valor })} title="Recusar: escolha o termo que fica no lugar; a IA não propõe de novo" className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 hover:border-destructive hover:text-destructive disabled:opacity-40"><Ban className="size-3" />Recusar</button>
                </> : <span className={cx('inline-flex items-center gap-1 font-medium', t.estado === 'aceito' ? 'text-success-ink' : 'text-muted-foreground')}>{t.estado === 'aceito' ? <><Check className="size-3" />aceito</> : <><Ban className="size-3" />recusado</>}</span>}
              </span>
            </div>
            <p className="mt-0.5 text-foreground/80 leading-relaxed">{t.definicao}</p>
            {t.estado === 'pendente' && <p className="mt-0.5 text-[11px] text-muted-foreground">Ao aceitar, {DESTINO(t.grupo)}.</p>}
          </div>
        ))}
      </div>
      {recusar && <TermoDialog slug={slug} grupo={recusar.grupo} valor={recusar.valor} modo="recusar" onClose={() => setRecusar(null)} />}
    </Bloco>
  );
}

// ───────────────────────── gerar ─────────────────────────
function GerarDialog({ slug, comp, onClose }: { slug: string; comp: string; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: rk.fichas(slug, comp), queryFn: () => api.relatorioFichas(slug, comp) });
  const fichas = q.data ?? [];
  const redes = [...new Set(fichas.map((f) => f.rede))];
  const [rede, setRede] = useState<string | null>(null);
  const r = rede ?? redes[0] ?? null;
  const daRede = fichas.filter((f) => f.rede === r);
  const [fora, setFora] = useState<Set<string>>(new Set());
  const sel = daRede.filter((f) => !fora.has(f.key));
  const [feito, setFeito] = useState<{ comando: string; aberto: boolean } | null>(null);
  const m = useMutation({
    mutationFn: (modo: 'background' | 'terminal' | 'comando') => api.gerarRelatorio(slug, comp, { rede: r!, itens: sel.map((f) => f.key), abrir: modo !== 'comando', ...(modo !== 'comando' && { modo }) }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: rk.lista(slug, comp) });
      void qc.invalidateQueries({ queryKey: ['pedido-ia', slug] });
      if (res.modo === 'background') { toast.ok('Relatório rodando em segundo plano'); onClose(); return; }
      setFeito(res);
      if (res.aberto) toast.ok('Claude Code aberto num terminal');
    },
    onError: (e) => toast.error(e, 'Não foi possível gerar'),
  });
  const copiar = (t: string) => { void navigator.clipboard?.writeText(t).then(() => toast.ok('Comando copiado')); };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[560px]">
        <DialogTitle className="text-base font-semibold">Gerar relatório</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground -mt-2">
          O script calcula os números das fichas escolhidas; o Opus escreve a leitura no Claude Code, em segundo plano (acompanhe aqui ou no painel de atividade). O relatório aparece aqui quando terminar.
        </DialogDescription>
        {q.isLoading ? <div className="py-6 grid place-items-center"><Spinner /></div> : !fichas.length ? (
          <p className="text-sm text-muted-foreground">Nenhum conteúdo deste concorrente foi analisado ainda. Selecione conteúdos na tabela e use "Analisar" antes.</p>
        ) : <>
          <div className="flex flex-wrap gap-1.5">
            {redes.map((x) => (
              <button key={x} onClick={() => { setRede(x); setFora(new Set()); }} className={cx('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm', r === x ? 'border-primary bg-primary-soft text-primary-ink font-medium' : 'border-border text-muted-foreground hover:text-foreground')}>
                <PlatformIcon platform={x} size={14} />{platformLabel(x)}<span className="text-xs tabular-nums opacity-70">{fichas.filter((f) => f.rede === x).length}</span>
              </button>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-border divide-y divide-border">
            {daRede.map((f) => (
              <label key={f.key} className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/40">
                <Checkbox checked={!fora.has(f.key)} onCheckedChange={(c) => setFora((s) => { const n = new Set(s); if (c) n.delete(f.key); else n.add(f.key); return n; })} />
                <span className="flex-1 min-w-0 truncate" title={f.titulo}>{f.titulo}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{fmtX(f.xPerfil)}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {sel.length} ficha(s) analisada(s).{sel.length < 10 && ' Abaixo de 10, o relatório fala em observações, não em padrões.'}
          </p>
          {feito && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
              <p className="mb-1 text-muted-foreground">{feito.aberto ? 'Terminal aberto. Se preferir rodar à mão, os números saem com:' : 'Rode no Claude Code (a leitura do Opus vem depois do pacote):'}</p>
              <div className="flex items-center gap-2"><code className="flex-1 min-w-0 truncate font-mono" title={feito.comando}>{feito.comando}</code><button onClick={() => copiar(feito.comando)} className="text-muted-foreground hover:text-foreground" aria-label="Copiar comando"><Copy className="size-3.5" /></button></div>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" disabled={!sel.length || m.isPending} onClick={() => m.mutate('comando')} className="inline-flex items-center gap-1.5"><Copy className="size-3.5" />Só o comando</Button>
            <Button variant="ghost" disabled={!sel.length || m.isPending} onClick={() => m.mutate('terminal')} className="inline-flex items-center gap-1.5"><ExternalLink className="size-3.5" />Abrir no terminal</Button>
            <Button disabled={!sel.length || m.isPending} onClick={() => m.mutate('background')} className="inline-flex items-center gap-1.5">{m.isPending ? <Spinner /> : <Play className="size-3.5" />}Gerar em segundo plano</Button>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}
