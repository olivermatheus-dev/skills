// Abas da área Ideias (041): Ideias · Fontes · Pesquisas. Cada aba tem rota própria (`ideias`, `ideias/fontes`, `ideias/pesquisas`).
import { Library, Lightbulb, ScrollText } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';
import { useIdeas, usePesquisas, useSources } from '../../queries';
import { cx } from '../kit';

export function IdeasTabs({ className }: { className?: string }) {
  const { slug = '' } = useParams();
  const ideas = useIdeas(slug).data;
  const sources = useSources(slug).data;
  const pesquisas = usePesquisas(slug).data;
  const nIdeas = ideas?.length;
  const nSources = sources?.filter((s) => s.status !== 'arquivada').length;
  const nPesquisas = pesquisas?.rodadas.length;
  const tab = 'inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 whitespace-nowrap -mb-px';
  const cls = ({ isActive }: { isActive: boolean }) => cx(tab, isActive ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground');
  const count = (n?: number) => n != null && <span className="text-xs tabular-nums text-muted-foreground">{n}</span>;
  return (
    <nav className={cx('flex gap-0.5 border-b border-border', className)}>
      <NavLink end to={`/p/${slug}/ideias`} className={cls}>
        <Lightbulb className="size-4" strokeWidth={1.8} />Ideias{count(nIdeas)}
      </NavLink>
      <NavLink end to={`/p/${slug}/ideias/fontes`} className={cls}>
        <Library className="size-4" strokeWidth={1.8} />Fontes{count(nSources)}
      </NavLink>
      {/* a rodada aberta (…/pesquisas/<id>) continua na aba Pesquisas */}
      <NavLink to={`/p/${slug}/ideias/pesquisas`} className={cls}>
        <ScrollText className="size-4" strokeWidth={1.8} />Pesquisas{count(nPesquisas)}
        {pesquisas?.rodando && <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-label="rodando" />}
      </NavLink>
    </nav>
  );
}
