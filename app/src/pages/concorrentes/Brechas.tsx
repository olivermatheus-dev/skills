// Brechas: o que os concorrentes deixam aberto e o que a Kzloo faz com isso. Sub-abas (?v=), uma pergunta por tela:
// Resumo (por onde começo?) · Todas as brechas (lista + detalhe, ?t=<tema>) · Produto × mercado (matriz) · Por concorrente (frases originais).
// Dados: intel/brechas.json (temas), intel/matriz.json (produto), analysis/forcas.json (frases). Desenho em roadmap/tasks/043-*/BRECHAS.md.
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Compass, ListChecks, Package, TriangleAlert, Users } from 'lucide-react';
import { AreaPage, useMarket } from '../../components/competitors/area';
import { Chips } from '../../components/competitors/lib';
import { Empty, ErrorBox } from '../../components/kit';
import { useGaps } from '../../queries';
import { staleNames, useGapTask, useMatrixStats } from './PanoramaBrechas';
import Resumo from './brechas/Resumo';
import Temas from './brechas/Temas';
import ProdutoMercado from './brechas/ProdutoMercado';
import PorConcorrente from './brechas/PorConcorrente';

const VIEWS = {
  resumo: { label: 'Resumo', icon: Compass },
  temas: { label: 'Todas as brechas', icon: ListChecks },
  produto: { label: 'Produto × mercado', icon: Package },
  concorrentes: { label: 'Por concorrente', icon: Users },
} as const;
export type BrechasView = keyof typeof VIEWS;

export default function Brechas() {
  const { slug = '' } = useParams();
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('v') ?? '';
  const v = (Object.hasOwn(VIEWS, raw) ? raw : 'resumo') as BrechasView;
  const m = useMarket(slug);
  const comp = useMemo(() => m.rows.filter((r) => r.c.data.kind === 'concorrente'), [m.rows]);
  const ms = useMatrixStats(slug, comp);
  const tasks = useGapTask(slug, 'da página Brechas');
  const g = useGaps(slug).data;
  const stale = useMemo(() => staleNames(g, comp), [g, comp]);
  /** troca de sub-aba levando filtros (ex.: área, tema) */
  const go = (view: BrechasView, extra: Record<string, string> = {}) => setSp({ ...(view === 'resumo' ? {} : { v: view }), ...extra }, { replace: false });

  if (m.error) return <AreaPage><ErrorBox error={m.error} /></AreaPage>;
  if (!m.isLoading && !m.rows.length) return <AreaPage><Empty title="Nenhum concorrente ainda" hint="Use + Adicionar para colar os links." /></AreaPage>;
  return (
    <AreaPage sub="o que os concorrentes deixam aberto">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Chips value={v} onChange={(x) => go(x)} options={(Object.keys(VIEWS) as BrechasView[]).map((k) => {
          const I = VIEWS[k].icon;
          return { value: k, label: <><I className="size-3.5" strokeWidth={1.8} />{VIEWS[k].label}</> };
        })} />
        {g && stale.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-xs" title={`Análise nova ou refeita depois do resumo: ${stale.join(', ')}`}>
            <TriangleAlert className="size-3.5 shrink-0" />
            Resumo de {new Date(g.updatedAt).toLocaleDateString('pt-BR')}: {stale.length} análise(s) mais nova(s). Peça à IA “atualiza as brechas”.
          </span>
        )}
      </div>
      {v === 'resumo' && <Resumo slug={slug} rows={comp} s={ms} tasks={tasks} go={go} />}
      {v === 'temas' && <Temas slug={slug} rows={comp} tasks={tasks} />}
      {v === 'produto' && <ProdutoMercado slug={slug} s={ms} />}
      {v === 'concorrentes' && <PorConcorrente slug={slug} rows={comp} />}
    </AreaPage>
  );
}
