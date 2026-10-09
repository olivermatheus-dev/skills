// Ideias → Pesquisas → uma rodada (041 F3): o pedido, o que cada fonte trouxe (e por que algo caiu), as ideias geradas com as
// referências e as notas da rodada. Tudo vem de pedido.json e resultado.json (e, com a rodada rodando, dos arquivos dela).
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Coins, ExternalLink, Quote, Sparkles, Square, TriangleAlert } from 'lucide-react';
import { api, avisoFila } from '../api';
import { Button, ErrorBox, PageHeader, cx } from '../components/kit';
import { AppContent } from '../components/AppContent';
import { IdeasTabs } from '../components/ideas/IdeasTabs';
import { PesquisarIdeias } from '../components/ideas/PesquisarIdeias';
import { EstadoPill, LinhasFontes, PesquisaProgresso } from '../components/ideas/PesquisaProgresso';
import { RefChip } from '../components/ideas/RefChips';
import { STATUSES } from '../components/ideas/meta';
import { LIMITE_AVISO_USD, dataCurta, duracao, fmtUsd, rotuloRodada } from '../components/ideas/pesquisa';
import { qk, usePesquisa, usePesquisas, useSources, useStrategyRefs } from '../queries';
import { toast } from '../components/toast';
import { Spinner } from '../components/competitors/lib';

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2" title={hint}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default function PesquisaDetalhe() {
  const { slug = '', rodada = '' } = useParams();
  const qc = useQueryClient();
  const q = usePesquisa(slug, rodada);
  const st = usePesquisas(slug).data;
  const refs = useStrategyRefs(slug).data;
  const sources = useSources(slug).data;
  const v = q.data;
  const refresh = () => { void qc.invalidateQueries({ queryKey: qk.pesquisas(slug) }); void qc.invalidateQueries({ queryKey: qk.pesquisa(slug, rodada) }); };
  const rodar = useMutation({ mutationFn: () => api.rodarPesquisa(slug, rodada), onSuccess: (r) => { toast.ok(avisoFila(r.fila, 'Pesquisa iniciada no Claude Code')); refresh(); setTimeout(refresh, 1200); }, onError: (e) => toast.error(e, 'Não foi possível rodar') });
  const parar = useMutation({ mutationFn: () => api.pararPesquisa(slug), onSuccess: () => { toast.ok('Pesquisa parada'); refresh(); }, onError: (e) => toast.error(e, 'Não foi possível parar') });

  const voltar = <Link to={`/p/${slug}/ideias/pesquisas`} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Todas as pesquisas</Link>;

  if (q.error) return (<AppContent><PageHeader title="Ideias" actions={<PesquisarIdeias slug={slug} />} /><IdeasTabs className="-mt-2 mb-5" />{voltar}<ErrorBox error={q.error} /></AppContent>);
  if (!v) return (<AppContent><PageHeader title="Ideias" actions={<PesquisarIdeias slug={slug} />} /><IdeasTabs className="-mt-2 mb-5" />{voltar}<div className="h-64 animate-pulse rounded-xl bg-muted" /></AppContent>);

  const l = v.linha, r = l.result, req = l.req;
  const rodando = l.estado === 'rodando';
  const ultimo = st?.ultimo?.round === rodada ? st.ultimo : null;
  const statusDe = (id: string) => STATUSES.find((s) => s.id === id);
  const nomes = new Map((sources ?? []).map((s) => [s.id, s.name]));

  return (
    <AppContent>
      <PageHeader title="Ideias" subtitle="Histórico das pesquisas nas fontes: o que cada rodada trouxe e quanto custou." actions={<PesquisarIdeias slug={slug} />} />
      <IdeasTabs className="-mt-2 mb-5" />
      {voltar}

      <div className="mb-4 flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold leading-tight">{rotuloRodada(req, refs)}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Pedida em {dataCurta(req.requestedAt)} · {req.maxIdeas} ideias · estudos de {req.period.from.split('-').reverse().join('/')} a {req.period.to.split('-').reverse().join('/')} · {req.depth === 'rapida' ? 'rápida' : 'normal'} · {req.languages.join(' + ')}</p>
        </div>
        <EstadoPill estado={l.estado} />
        <div className="flex items-center gap-2">
          {rodando && !l.terminal && <Button variant="ghost" disabled={parar.isPending} onClick={() => parar.mutate()} className="inline-flex items-center gap-1.5"><Square className="size-3.5" />Parar</Button>}
          {(l.estado === 'pendente' || l.estado === 'erro') && !rodando && (
            <Button disabled={rodar.isPending || !!l.naFila} onClick={() => rodar.mutate()} className="inline-flex items-center gap-1.5">{rodar.isPending ? <Spinner /> : <Sparkles className="size-4" />}{l.naFila ? `Na fila (${l.naFila}º)` : l.estado === 'erro' ? 'Tentar de novo' : st?.ocupado ? 'Entrar na fila' : 'Rodar agora'}</Button>
          )}
          {l.estado === 'feito' && r && r.ideas.length > 0 && <Link to={`/p/${slug}/ideias?rodada=${encodeURIComponent(rodada)}`}><Button variant="soft">Ver as {r.ideas.length} ideias no banco</Button></Link>}
        </div>
      </div>

      {(l.estado === 'erro' || ultimo?.erro) && l.estado !== 'feito' && (
        <div role="alert" className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" /><span><b className="font-semibold">Não terminou.</b> {l.erro ?? ultimo?.erro ?? 'A rodada parou sem gravar o resultado.'} O que já foi buscado fica guardado em data/curadoria.</span>
        </div>
      )}

      {r && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Ideias geradas" value={r.ideas.length} />
          <Stat label="Aprovadas depois" value={<>{l.aprovadas}<span className="text-sm font-normal text-muted-foreground"> de {r.ideas.length}</span></>} hint="Aprovadas ou viraram tarefa" />
          <Stat label="Referências" value={r.refs.length} />
          <Stat label="Caíram" value={r.dropped.length} hint="Não passaram na verificação de link, DOI ou trecho" />
          <Stat label="Custo real" value={l.custo != null ? <span className={cx(l.custo > LIMITE_AVISO_USD && 'text-amber-600')}>{fmtUsd(l.custo)}</span> : '—'} hint="Medido com tools/usage.mjs; pela assinatura é cota do plano" />
          <Stat label="Estimado" value={<span className="inline-flex items-center gap-1 text-sm"><Clock className="size-3.5 text-muted-foreground" />~{req.estimate.minutes} min <Coins className="ml-1 size-3.5 text-muted-foreground" />{req.estimate.usdLow === req.estimate.usdHigh ? fmtUsd(req.estimate.usdLow) : `${req.estimate.usdLow.toFixed(2)}–${req.estimate.usdHigh.toFixed(2)}`}</span>} />
        </div>
      )}

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold">{r ? 'Por fonte' : 'Andamento'}</h3>
        {r || !rodando
          ? <LinhasFontes fontes={v.progresso.fontes} sources={sources} />
          : <PesquisaProgresso p={v.progresso} sources={sources} maxH="max-h-none" />}
        {r && v.progresso.fontes.some((f) => f.error) && (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {v.progresso.fontes.filter((f) => f.error).map((f) => <li key={f.sourceId}><b className="font-medium text-foreground">{nomes.get(f.sourceId) ?? f.sourceId}:</b> {f.error}</li>)}
          </ul>
        )}
      </section>

      {r && r.dropped.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">O que caiu na verificação e por quê</h3>
          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {r.dropped.map((d) => (
              <li key={d.url} className="flex items-start gap-3 px-3 py-2">
                <span className="min-w-0 flex-1">{d.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{d.reason}</span>
                <a href={d.url} target="_blank" rel="noreferrer" aria-label="Abrir o item" className="shrink-0 text-muted-foreground hover:text-primary-ink"><ExternalLink className="size-3.5" /></a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {l.ideias.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">Ideias geradas</h3>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {[...l.ideias].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((i) => {
              const s = statusDe(i.status);
              return (
                <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                  <span className="min-w-0 flex-1">{i.title}</span>
                  {i.score != null && <span className="text-xs tabular-nums text-muted-foreground" title="Nota da síntese (0–10)">nota {i.score.toFixed(1)}</span>}
                  {s && <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className={cx('size-2 rounded-full', s.dot)} />{s.label}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {v.refs.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">Referências conferidas</h3>
          <ul className="space-y-2">
            {v.refs.map((x) => (
              <li key={x.id} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{x.id}</span><RefChip r={x} /><span className="text-xs text-muted-foreground">{nomes.get(x.sourceId) ?? x.sourceId}</span></div>
                <div className="mt-1 font-medium leading-snug">{x.title}</div>
                <p className="mt-1 flex gap-1.5 text-xs text-muted-foreground"><Quote className="mt-0.5 size-3 shrink-0" /><span className="italic">{x.quote}</span></p>
                <p className="mt-1 text-xs">{x.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Pedido</h3>
          <dl className="space-y-1 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">Fontes</dt><dd className="min-w-0">{req.sources.map((id) => nomes.get(id) ?? id).join(' · ')}</dd></div>
            {req.instructions && <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">Instruções</dt><dd className="min-w-0 whitespace-pre-line">{req.instructions}</dd></div>}
            {v.consultas && <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">Consultas</dt><dd className="min-w-0">{[...v.consultas.pt, ...v.consultas.en].join(' · ') || '—'}</dd></div>}
            {v.consultas?.termos?.length ? <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">Termos</dt><dd className="min-w-0">{v.consultas.termos.join(', ')}</dd></div> : null}
            {rodando && <div className="flex gap-2"><dt className="w-28 shrink-0 text-muted-foreground">Rodando há</dt><dd>{duracao(st?.rodando?.round === rodada ? st.rodando.started : req.requestedAt)}</dd></div>}
          </dl>
        </div>
        {r?.notes && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Notas da rodada</h3>
            <p className="whitespace-pre-line rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">{r.notes}</p>
          </div>
        )}
      </section>
    </AppContent>
  );
}
