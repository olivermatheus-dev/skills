import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../api';
import { PAGES } from '../pages';
import { cx, Select } from './ui';

export default function Layout({ children }: { children?: ReactNode }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: api.projects });
  useEffect(() => { if (slug) localStorage.setItem('hub:project', slug); }, [slug]);

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
                className={({ isActive }) => cx('flex items-center gap-2 px-3 py-2 rounded-md text-sm', isActive ? 'bg-accent-soft text-accent font-medium' : 'text-text hover:bg-surface-2')}>
                <span className="w-4 text-center opacity-70">{p.icon}</span>{p.label}
              </NavLink>
            ))}
          </nav>
        )}
        <div className="p-4 text-xs text-muted border-t border-border">Arquivos locais · companies/{slug ?? ''}</div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children ?? <Outlet />}</main>
    </div>
  );
}
