import { Suspense, useEffect, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PAGES, preloadAllPages } from '../pages';
import { prefetchPage, prefetchProject, useProjects, whenIdle } from '../queries';
import { preloadMarkdownEditor } from './Markdown';
import { cx, Select } from './ui';

/** esqueleto leve enquanto o código de uma tela chega (nunca tela em branco) */
export function PageSkeleton() {
  return (
    <div className="p-8" aria-busy="true" aria-label="Carregando">
      <div className="h-7 w-56 rounded-md bg-surface-2 animate-pulse" />
      <div className="h-4 w-80 rounded-md bg-surface-2/70 animate-pulse mt-3" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-8">{[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-surface-2/70 animate-pulse" />)}</div>
    </div>
  );
}

export default function Layout({ children }: { children?: ReactNode }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: projects = [] } = useProjects();
  useEffect(() => { if (slug) localStorage.setItem('hub:project', slug); }, [slug]);

  // Depois da 1ª pintura: código de todas as telas, editor markdown e listas do projeto → trocar de tela não espera.
  useEffect(() => whenIdle(() => { preloadAllPages(); void preloadMarkdownEditor(); if (slug) prefetchProject(qc, slug); }), [slug, qc]);

  const warm = (path: string, load: () => Promise<unknown>) => { void load(); if (slug) prefetchPage(qc, slug, path); };

  return (
    <div className="flex h-full">
      <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <div className="text-xs uppercase tracking-wide text-muted mb-2">Projeto</div>
          <Select className="w-full" value={slug ?? ''} onChange={(e) => (e.target.value === '__new' ? nav('/projetos') : nav(`/p/${e.target.value}`))}>
            {!slug && <option value="">Escolha…</option>}
            {projects.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            <option value="__new">+ Gerenciar projetos</option>
          </Select>
        </div>
        {slug && (
          <nav className="flex-1 p-2 space-y-0.5">
            {PAGES.map((p) => (
              <NavLink key={p.path} end={p.path === ''} to={`/p/${slug}${p.path ? `/${p.path}` : ''}`}
                onMouseEnter={() => warm(p.path, p.load)} onFocus={() => warm(p.path, p.load)} onPointerDown={() => warm(p.path, p.load)}
                className={({ isActive }) => cx('flex items-center gap-2 px-3 py-2 rounded-md text-sm', isActive ? 'bg-accent-soft text-accent font-medium' : 'text-text hover:bg-surface-2')}>
                <span className="w-4 text-center opacity-70">{p.icon}</span>{p.label}
              </NavLink>
            ))}
          </nav>
        )}
        <div className="p-4 text-xs text-muted border-t border-border">Arquivos locais · companies/{slug ?? ''}</div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<PageSkeleton />}>{children ?? <Outlet />}</Suspense>
      </main>
    </div>
  );
}
