// Sidebar contextual (tarefa 019): UM componente para a barra da esquerda de cada área — mesma largura, cabeçalho,
// busca, rolagem, estado vazio, redimensionar e recolher em todas. Cada área monta o conteúdo do seu jeito:
// Conteúdos/Anotações/Ideias → lista estilo Notion (páginas, busca, novo item, favoritos) · Concorrentes → lista dos
// cadastrados · Mockups → camadas + prints. Largura e recolhido ficam lembrados por área (storageKey).
//
//   <ContextSidebar storageKey="concorrentes" title="Concorrentes" action={<button…/>} search={{ value, onChange }}>
//     <ContextSidebar.Section title="Favoritos">
//       <ContextSidebar.Item to="…" icon={<Star/>} active trailing={<span>3</span>}>Nome</ContextSidebar.Item>
//     </ContextSidebar.Section>
//     <ContextSidebar.Empty>Nenhum resultado</ContextSidebar.Empty>
//   </ContextSidebar>
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MIN = 200, MAX = 440, PADRAO = 256;
const ler = (k: string) => { try { return JSON.parse(localStorage.getItem(`hub:ctx:${k}`) ?? 'null') as { w?: number; fechada?: boolean } | null; } catch { return null; } };
const gravar = (k: string, v: { w: number; fechada: boolean }) => { try { localStorage.setItem(`hub:ctx:${k}`, JSON.stringify(v)); } catch { /* só conveniência */ } };

export function ContextSidebar({ storageKey, title, action, search, footer, children, className, width = PADRAO }: {
  storageKey: string;
  title: ReactNode;
  /** botão no cabeçalho (ex.: + novo) */
  action?: ReactNode;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  width?: number;
}) {
  const salvo = ler(storageKey);
  const [w, setW] = useState(salvo?.w ?? width);
  const [fechada, setFechada] = useState(!!salvo?.fechada);
  useEffect(() => { gravar(storageKey, { w, fechada }); }, [storageKey, w, fechada]);
  const arraste = useRef<{ x: number; w: number } | null>(null);

  if (fechada) {
    return (
      <aside className="w-10 shrink-0 border-r border-border bg-sidebar flex flex-col items-center py-2">
        <button onClick={() => setFechada(false)} className="size-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title={`Abrir ${typeof title === 'string' ? title : 'a barra'}`}>
          <PanelLeftOpen className="size-4" />
        </button>
      </aside>
    );
  }
  return (
    <aside className={cn('relative shrink-0 border-r border-border bg-sidebar flex flex-col min-h-0', className)} style={{ width: w }}>
      <header className="h-12 shrink-0 flex items-center gap-2 pl-3 pr-2 border-b border-border">
        <div className="flex-1 min-w-0 truncate text-sm font-semibold">{title}</div>
        {action}
        <button onClick={() => setFechada(true)} className="size-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="Recolher"><PanelLeftClose className="size-4" /></button>
      </header>
      {search && (
        <div className="px-2 pt-2">
          <label className="flex items-center gap-1.5 h-8 px-2 rounded-md bg-muted/70 focus-within:bg-card focus-within:ring-1 focus-within:ring-ring text-sm">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input value={search.value} onChange={(e) => search.onChange(e.target.value)} placeholder={search.placeholder ?? 'Buscar…'} className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground" />
            {search.value && <button onClick={() => search.onChange('')} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>}
          </label>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-3">{children}</div>
      {footer && <div className="shrink-0 border-t border-border p-2">{footer}</div>}
      {/* alça de redimensionar (duplo clique volta ao padrão) */}
      <div className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-10 hover:bg-primary/20 active:bg-primary/30"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); arraste.current = { x: e.clientX, w }; }}
        onPointerMove={(e) => { if (arraste.current) setW(Math.max(MIN, Math.min(MAX, arraste.current.w + e.clientX - arraste.current.x))); }}
        onPointerUp={() => { arraste.current = null; }}
        onDoubleClick={() => setW(width)} />
    </aside>
  );
}

function Section({ title, action, children }: { title?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      {title && <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}{action}</div>}
      <div className="space-y-px">{children}</div>
    </section>
  );
}

function Item({ to, onClick, active, icon, trailing, muted, children, title, draggable, onDragStart }: {
  to?: string; onClick?: () => void; active?: boolean; icon?: ReactNode; trailing?: ReactNode; muted?: boolean; children: ReactNode; title?: string;
  draggable?: boolean; onDragStart?: React.DragEventHandler;
}) {
  const cls = cn('group flex items-center gap-2 w-full min-w-0 h-8 px-2 rounded-md text-sm text-left',
    active ? 'bg-primary-soft text-primary-ink font-medium' : 'text-foreground hover:bg-muted', muted && !active && 'text-muted-foreground');
  const corpo = (<>{icon && <span className="shrink-0 grid place-items-center size-4 [&_svg]:size-4 text-muted-foreground group-[.bg-primary-soft]:text-primary-ink">{icon}</span>}<span className="flex-1 min-w-0 truncate">{children}</span>{trailing && <span className="shrink-0 text-xs text-muted-foreground">{trailing}</span>}</>);
  return to
    ? <Link to={to} className={cls} title={title} draggable={draggable} onDragStart={onDragStart}>{corpo}</Link>
    : <button type="button" onClick={onClick} className={cls} title={title} draggable={draggable} onDragStart={onDragStart}>{corpo}</button>;
}

const Empty = ({ children }: { children: ReactNode }) => <div className="px-2 py-6 text-center text-xs text-muted-foreground">{children}</div>;

ContextSidebar.Section = Section;
ContextSidebar.Item = Item;
ContextSidebar.Empty = Empty;
export default ContextSidebar;
