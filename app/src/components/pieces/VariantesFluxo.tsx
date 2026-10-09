// Fluxo das variantes (045 D): insumos → base v1 → um ramo por opção de cada eixo → folhas = variantes, em React Flow.
// Layout determinístico (árvore da esquerda para a direita, folhas empilhadas); clicar numa folha abre o painel,
// a caixa marca para gerar/baixar e "marcar ramo" marca tudo que sai de uma opção.
import { useMemo } from 'react';
import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { VariantesView, VarianteView } from '../../api';
import { cx } from '../kit';
import { AvalSelo, QcSelo, VarThumb, exportDe, urlVar } from './Variantes';

type Ctx = { slug: string; path: string; sel: Set<string>; foco: string | null; formato: string; onFoco: (id: string) => void; onToggle: (ids: string[], on?: boolean) => void };
type Props = Ctx & { data: VariantesView };

const COL = 250, LEAF_H = 108, ZOOM_MIN = 0.75;
const H = { l: <Handle type="target" position={Position.Left} className="!opacity-0" />, r: <Handle type="source" position={Position.Right} className="!opacity-0" /> };

function Insumos({ data }: NodeProps<Node<{ eixos: VariantesView['eixos'] }>>) {
  return (
    <div className="w-[200px] rounded-xl border border-border bg-muted/60 p-3 text-xs">
      <div className="font-medium text-sm mb-1">Insumos</div>
      {data.eixos.map((e) => <div key={e.nome}><span className="text-muted-foreground">{e.nome}:</span> {e.opcoes.map((o) => o.id).join(', ')}</div>)}
      {H.r}
    </div>
  );
}
function Base({ data }: NodeProps<Node<{ nome: string; duracao?: number; n: number }>>) {
  return (
    <div className="w-[170px] rounded-xl border-2 border-primary/60 bg-card p-3 text-xs">
      {H.l}
      <div className="font-medium text-sm">Base v1</div>
      <div className="text-muted-foreground">aprovada{data.duracao ? ` · ${data.duracao.toFixed(1)} s` : ''}</div>
      <div className="text-muted-foreground">{data.n} combinações</div>
      {H.r}
    </div>
  );
}
function Opcao({ data }: NodeProps<Node<{ eixo: string; id: string; fala?: string; voz?: string; ids: string[]; todas: boolean; onToggle: Ctx['onToggle'] }>>) {
  return (
    <div className="w-[220px] rounded-xl border border-border bg-card p-2.5 text-xs">
      {H.l}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{data.eixo}</span>
        <button className="nodrag ml-auto text-[11px] text-primary-ink hover:underline" onClick={() => data.onToggle(data.ids, !data.todas)}>{data.todas ? 'desmarcar ramo' : 'marcar ramo'}</button>
      </div>
      <div className="font-medium text-sm">{data.id}</div>
      {data.fala && <div className="text-muted-foreground line-clamp-2" title={data.fala}>“{data.fala}”</div>}
      {data.voz && !data.fala && <div className="text-muted-foreground">{data.voz}</div>}
      {H.r}
    </div>
  );
}
function Folha({ data }: NodeProps<Node<Ctx & { v: VarianteView; rotulo: string }>>) {
  const { v } = data;
  const ex = exportDe(v, data.formato);
  return (
    <div role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && data.onFoco(v.id)}
      className={cx('w-[250px] flex gap-2 rounded-xl border bg-card p-2 text-xs cursor-pointer', data.foco === v.id ? 'border-primary ring-2 ring-primary/25' : 'border-border hover:border-foreground/30',
        !v.gerada && 'border-dashed', v.aval === 'descartada' && 'opacity-50')}>
      {H.l}
      <VarThumb src={ex && urlVar(data.slug, data.path, v, ex.file)} className="w-[50px] h-[90px] shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        <label className="nodrag flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={data.sel.has(v.id)} onChange={(e) => data.onToggle([v.id], e.target.checked)} aria-label={`marcar ${v.id}`} />
          <span className="font-medium text-sm truncate">{data.rotulo}</span>
        </label>
        <div className="text-muted-foreground">{v.duracao ? `${v.duracao.toFixed(1)} s` : ''}{v.abertura_s ? ` · corpo em ${v.abertura_s.toFixed(1)} s` : ''}</div>
        <div className="flex flex-wrap gap-1"><QcSelo v={v} /><AvalSelo v={v} /></div>
        {v.abertas > 0 && <div className="text-[11px] text-destructive">{v.abertas} anotação(ões)</div>}
      </div>
    </div>
  );
}
const nodeTypes = { insumos: Insumos, base: Base, opcao: Opcao, folha: Folha };

export default function VariantesFluxo({ data, ...ctx }: Props) {
  const { nodes, edges } = useMemo(() => {
    const eixos = data.eixos;
    const nodes: Node[] = [], edges: Edge[] = [];
    const vs = data.variantes;
    const prefixo = (v: VarianteView, i: number) => eixos.slice(0, i + 1).map((e) => `${e.nome}-${v.escolhas[e.nome]}`).join('__');
    const yFolha = (i: number) => i * LEAF_H;
    const meio = (idx: number[]) => (yFolha(Math.min(...idx)) + yFolha(Math.max(...idx))) / 2;
    const xFolha = COL * (eixos.length + 1);
    // níveis intermediários: um nó por prefixo (opção do eixo i dentro do ramo do eixo i-1); a última opção já é a folha
    for (let i = 0; i < eixos.length - 1; i++) {
      const grupos = new Map<string, number[]>();
      vs.forEach((v, k) => grupos.set(prefixo(v, i), [...(grupos.get(prefixo(v, i)) ?? []), k]));
      for (const [id, idx] of grupos) {
        const v0 = vs[idx[0]], o = eixos[i].opcoes.find((x) => x.id === v0.escolhas[eixos[i].nome]);
        const ids = idx.map((k) => vs[k].id);
        nodes.push({ id, type: 'opcao', position: { x: COL * (i + 2), y: meio(idx) }, data: { eixo: eixos[i].nome, id: o?.id ?? '', fala: o?.fala, voz: o?.voz, ids, todas: ids.every((x) => ctx.sel.has(x)), onToggle: ctx.onToggle } });
        edges.push({ id: `e-${id}`, source: i ? prefixo(v0, i - 1) : 'base', target: id, type: 'smoothstep' });
      }
    }
    const ultimo = eixos.at(-1)!;
    vs.forEach((v, k) => {
      nodes.push({ id: v.id, type: 'folha', position: { x: xFolha, y: yFolha(k) }, data: { ...ctx, v, rotulo: `${ultimo.nome} ${v.escolhas[ultimo.nome]}` } });
      edges.push({ id: `e-${v.id}`, source: eixos.length > 1 ? prefixo(v, eixos.length - 2) : 'base', target: v.id, type: 'smoothstep', animated: ctx.sel.has(v.id) });
    });
    const centro = meio(vs.map((_, k) => k));
    nodes.push({ id: 'insumos', type: 'insumos', position: { x: 0, y: centro }, data: { eixos } });
    nodes.push({ id: 'base', type: 'base', position: { x: COL, y: centro }, data: { nome: data.projeto.nome, duracao: data.base.duracao, n: vs.length } });
    edges.push({ id: 'e-base', source: 'insumos', target: 'base', type: 'smoothstep' });
    return { nodes, edges };
  }, [data, ctx.sel, ctx.foco, ctx.formato]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // cabe tudo se der para ler; senão fica legível (zoom mínimo) a partir do canto de cima e a roda do mouse rola o quadro
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} minZoom={0.2} maxZoom={1.5} panOnScroll zoomOnScroll={false}
      nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
      // sem onNodeClick o React Flow deixa os nós sem clique (nem arrastáveis nem selecionáveis)
      onNodeClick={(_, n) => { if (n.type === 'folha') ctx.onFoco(n.id); }}
      onInit={(rf) => requestAnimationFrame(() => {
        void rf.fitView({ padding: 0.05, maxZoom: 1 }).then(() => { if (rf.getViewport().zoom < ZOOM_MIN) void rf.setViewport({ x: 12, y: 12, zoom: ZOOM_MIN }); });
      })}>
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
