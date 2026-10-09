// Ideias → Pesquisas (041 F3): o histórico das rodadas de pesquisa de ideias. Data, tema, fontes, ideias geradas, quantas foram
// aprovadas depois e o custo real (resultado.json). Serve para calibrar o peso das fontes e a estimativa do diálogo.
// Uma rodada pendente ou que não terminou tem "Rodar"; clicar na linha abre o detalhe.
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { api, avisoFila, type RodadaLinha } from '../api';
import { Button, Empty, ErrorBox, PageHeader } from '../components/kit';
import { AppContent } from '../components/AppContent';
import { IdeasTabs } from '../components/ideas/IdeasTabs';
import { PesquisarIdeias } from '../components/ideas/PesquisarIdeias';
import { EstadoPill } from '../components/ideas/PesquisaProgresso';
import { dataCurta, fmtUsd, rotuloRodada } from '../components/ideas/pesquisa';
import { DataTable, Tip, type Col } from '../components/competitors/toolbar';
import { Spinner } from '../components/competitors/lib';
import { qk, usePesquisas, useSources, useStrategyRefs } from '../queries';
import { toast } from '../components/toast';

export default function Pesquisas() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, error } = usePesquisas(slug);
  const refs = useStrategyRefs(slug).data;
  const sources = useSources(slug).data;
  const nomes = new Map((sources ?? []).map((s) => [s.id, s.name]));
  const rodar = useMutation({
    mutationFn: (id: string) => api.rodarPesquisa(slug, id),
    onSuccess: (r) => { toast.ok(avisoFila(r.fila, 'Pesquisa iniciada no Claude Code')); void qc.invalidateQueries({ queryKey: qk.pesquisas(slug) }); },
    onError: (e) => toast.error(e, 'Não foi possível rodar'),
  });
  const rows = data?.rodadas ?? [];
  const feitas = rows.filter((r) => r.result);
  const totalIdeias = feitas.reduce((a, r) => a + (r.result?.ideas.length ?? 0), 0);
  const aprovadas = rows.reduce((a, r) => a + r.aprovadas, 0);
  const custo = feitas.reduce((a, r) => a + (r.custo ?? 0), 0);

  const cols: Col<RodadaLinha>[] = [
    { k: 'data', label: 'Quando', width: '104px', render: (r) => <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{dataCurta(r.req.requestedAt)}</span> },
    {
      k: 'tema', label: 'Tema', className: 'max-w-0 w-full',
      render: (r) => (
        <div className="min-w-0 py-0.5">
          <div className="truncate font-medium">{rotuloRodada(r.req, refs)}</div>
          <div className="truncate text-xs text-muted-foreground">pedido: {r.req.maxIdeas} ideias · {r.req.depth === 'rapida' ? 'rápida' : 'normal'} · {r.req.languages.join(' + ')}</div>
        </div>
      ),
    },
    {
      k: 'fontes', label: 'Fontes', width: '76px', num: true,
      render: (r) => <Tip content={r.req.sources.map((id) => nomes.get(id) ?? id).join('\n')}><span>{r.req.sources.length}</span></Tip>,
    },
    { k: 'ideias', label: 'Ideias geradas', width: '112px', num: true, render: (r) => (r.result ? r.result.ideas.length : <span className="text-muted-foreground/60">—</span>) },
    {
      k: 'aprov', label: 'Aprovadas depois', width: '132px', num: true,
      title: 'Ideias desta rodada que você já aprovou ou que viraram tarefa',
      render: (r) => (r.result ? <span>{r.aprovadas}<span className="text-muted-foreground"> de {r.result.ideas.length}</span></span> : <span className="text-muted-foreground/60">—</span>),
    },
    { k: 'custo', label: 'Custo real', width: '96px', num: true, render: (r) => (r.custo != null ? fmtUsd(r.custo) : <span className="text-muted-foreground/60">—</span>) },
    { k: 'estado', label: 'Estado', width: '170px', render: (r) => <EstadoPill estado={r.estado} /> },
    {
      k: 'acao', label: '', width: '104px',
      render: (r) => (r.estado === 'pendente' || r.estado === 'erro') && !r.terminal ? (
        <Button variant="soft" className="!py-1 inline-flex items-center gap-1.5 text-xs" disabled={rodar.isPending || !!r.naFila}
          title={r.naFila ? `Na fila da IA (${r.naFila}º): começa sozinha quando a anterior acabar` : data?.ocupado || data?.rodando ? 'A IA está ocupada: entra na fila e roda sozinha quando ela acabar' : 'Roda a pesquisa no Claude Code, em segundo plano'}
          onClick={(e) => { e.stopPropagation(); rodar.mutate(r.id); }}>
          {rodar.isPending && rodar.variables === r.id ? <Spinner /> : <Sparkles className="size-3.5" />}{r.naFila ? `Fila ${r.naFila}º` : r.estado === 'erro' ? 'De novo' : 'Rodar'}
        </Button>
      ) : null,
    },
  ];

  return (
    <AppContent>
      <PageHeader title="Ideias" subtitle="Histórico das pesquisas nas fontes: o que cada rodada trouxe e quanto custou." actions={<PesquisarIdeias slug={slug} />} />
      <IdeasTabs className="-mt-2 mb-5" />
      <ErrorBox error={error} />
      {isLoading && <div className="h-64 animate-pulse rounded-xl bg-muted" />}
      {data && !rows.length && (
        <Empty title="Nenhuma pesquisa ainda" hint="Clique em Pesquisar ideias: a IA procura nas fontes aceitas e traz ideias com a referência conferida. Só roda quando você pede." />
      )}
      {data && rows.length > 0 && (
        <>
          <p className="mb-3 text-sm text-muted-foreground tabular-nums">
            {rows.length} {rows.length === 1 ? 'rodada' : 'rodadas'} · {totalIdeias} ideias geradas · {aprovadas} aprovadas depois{custo > 0 && <> · {fmtUsd(custo)} no total</>}
          </p>
          <DataTable fill rows={rows} cols={cols} rowKey={(r) => r.id} sort={{ k: 'data', dir: -1 }} onSort={() => {}}
            onRowClick={(r) => nav(`/p/${slug}/ideias/pesquisas/${encodeURIComponent(r.id)}`)} />
        </>
      )}
    </AppContent>
  );
}
