// Brechas para nós: lista completa por tema (com "Virar tarefa" no quadro Produto) + produto × mercado pela matriz.
import { useParams } from 'react-router-dom';
import type { GapTheme } from '../../api';
import { AreaPage, useMarket } from '../../components/competitors/area';
import { useTaskActions } from '../../components/board/useTaskActions';
import { toast } from '../../components/toast';
import { Empty, ErrorBox } from '../../components/kit';
import { GapThemes, ProductVsMarket, useMatrixStats } from './PanoramaBrechas';

export default function Brechas() {
  const { slug = '' } = useParams();
  const m = useMarket(slug);
  const comp = m.rows.filter((r) => r.c.data.kind === 'concorrente');
  const ms = useMatrixStats(slug, comp);
  const tasks = useTaskActions(slug);

  /** uma tarefa no quadro Produto, em Backlog (vira "A fazer" quando o Oliver aprovar) */
  const toTask = (t: GapTheme) => new Promise<string | undefined>((resolve) => {
    const names = [...new Set(t.sources.map((s) => s.competitor))];
    const body = `\n## Brecha\n${t.action}\n${t.dependsOn ? `\nDepende de: ${t.dependsOn}\n` : ''}\n## O que os concorrentes deixam aberto\n${t.sources.map((s) => `- ${s.competitor}: “${s.text}”`).join('\n')}\n\n## Checklist\n\n## Log\n- ${new Date().toISOString().slice(0, 10)} · criada a partir da página Brechas (tema ${t.id}, ${names.length} concorrente(s))\n`;
    const { promise } = tasks.create({ title: t.title, board: 'produto', status: 'backlog', assignee: 'oliver', priority: 'media' }, body, {
      okMessage: false,
      onError: () => resolve(undefined),
    });
    promise.then((r) => { toast.ok(`Tarefa ${r.data.id} criada em Produto`); resolve(r.data.id); }, () => resolve(undefined));
  });

  if (m.error) return <AreaPage><ErrorBox error={m.error} /></AreaPage>;
  if (!m.isLoading && !m.rows.length) return <AreaPage><Empty title="Nenhum concorrente ainda" hint="Use + Adicionar para colar os links." /></AreaPage>;
  return (
    <AreaPage sub="onde os concorrentes deixam espaço">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
        <GapThemes slug={slug} rows={comp} onTask={toTask} />
        <ProductVsMarket slug={slug} s={ms} />
      </div>
    </AreaPage>
  );
}
