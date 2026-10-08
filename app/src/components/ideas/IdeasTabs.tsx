// Abas da área Ideias (041): Ideias · Fontes · Pesquisas. Cada aba tem rota própria (`ideias`, `ideias/fontes`);
// Pesquisas (histórico das rodadas) chega na fase 3 da 041 e fica reservada aqui.
import { Library, Lightbulb, ScrollText } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';
import { useIdeas, useSources } from '../../queries';
import { cx } from '../kit';
import { Tip } from '../competitors/toolbar';

export function IdeasTabs({ className }: { className?: string }) {
  const { slug = '' } = useParams();
  const ideas = useIdeas(slug).data;
  const sources = useSources(slug).data;
  const nIdeas = ideas?.length;
  const nSources = sources?.filter((s) => s.status !== 'arquivada').length;
  const tab = 'inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 whitespace-nowrap';
  const count = (n?: number) => n != null && <span className="text-xs tabular-nums text-muted-foreground">{n}</span>;
  return (
    <nav className={cx('flex gap-0.5 border-b border-border', className)}>
      <NavLink end to={`/p/${slug}/ideias`} className={({ isActive }) => cx(tab, '-mb-px', isActive ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
        <Lightbulb className="size-4" strokeWidth={1.8} />Ideias{count(nIdeas)}
      </NavLink>
      <NavLink end to={`/p/${slug}/ideias/fontes`} className={({ isActive }) => cx(tab, '-mb-px', isActive ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
        <Library className="size-4" strokeWidth={1.8} />Fontes{count(nSources)}
      </NavLink>
      <Tip content="Histórico das pesquisas de ideias nas fontes. Chega com o botão Pesquisar ideias (fase 3 da 041).">
        <span className={cx(tab, '-mb-px border-transparent text-muted-foreground/50 cursor-default')} aria-disabled="true">
          <ScrollText className="size-4" strokeWidth={1.8} />Pesquisas<span className="text-[10px] uppercase tracking-wide">em breve</span>
        </span>
      </Tip>
    </nav>
  );
}
