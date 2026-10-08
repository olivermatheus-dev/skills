// Brechas para nós: lista completa por tema (com "Virar tarefa" no quadro Produto) + produto × mercado pela matriz
// + as frases originais de cada análise. O Panorama mostra só o resumo (GapSummaryCard) e aponta para cá.
import { useParams } from 'react-router-dom';
import { AreaPage, useMarket } from '../../components/competitors/area';
import { Empty, ErrorBox } from '../../components/kit';
import { GapThemes, GapsByCompetitor, ProductVsMarket, useGapTask, useMatrixStats } from './PanoramaBrechas';

export default function Brechas() {
  const { slug = '' } = useParams();
  const m = useMarket(slug);
  const comp = m.rows.filter((r) => r.c.data.kind === 'concorrente');
  const ms = useMatrixStats(slug, comp);
  const toTask = useGapTask(slug, 'da página Brechas');

  if (m.error) return <AreaPage><ErrorBox error={m.error} /></AreaPage>;
  if (!m.isLoading && !m.rows.length) return <AreaPage><Empty title="Nenhum concorrente ainda" hint="Use + Adicionar para colar os links." /></AreaPage>;
  return (
    <AreaPage sub="onde os concorrentes deixam espaço">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
        <GapThemes slug={slug} rows={comp} onTask={toTask} />
        <ProductVsMarket slug={slug} s={ms} />
      </div>
      <GapsByCompetitor slug={slug} rows={comp} />
    </AreaPage>
  );
}
