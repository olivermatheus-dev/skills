import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FolderOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { PAGES, preloadAllPages } from '../pages';
import { prefetchPage, prefetchProject, useProjects, whenIdle } from '../queries';
import { preloadMarkdownEditor } from './Markdown';
import { cx, Select } from './kit';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCorDoProjeto } from '@/lib/theme';

/** esqueleto leve enquanto o código de uma tela chega (nunca tela em branco) */
export function PageSkeleton() {
  return (
    <div className="p-8" aria-busy="true" aria-label="Carregando">
      <div className="h-7 w-56 rounded-md bg-muted animate-pulse" />
      <div className="h-4 w-80 rounded-md bg-muted/70 animate-pulse mt-3" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-8">{[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-muted/70 animate-pulse" />)}</div>
    </div>
  );
}

// sidebar principal: aberta ou só ícones. Padrão por tela (pages/index.ts → sidebar: 'recolhida'); a escolha manual fica lembrada por tela.
const PREF = 'hub:sidebar';
const lerPref = (): Record<string, boolean> => { try { return JSON.parse(localStorage.getItem(PREF) ?? '{}'); } catch { return {}; } };

export default function Layout({ children }: { children?: ReactNode }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { pathname } = useLocation();
  const { data: projects = [] } = useProjects();
  const projeto = projects.find((p) => p.slug === slug);
  useCorDoProjeto(slug);
  useEffect(() => { if (slug) localStorage.setItem('hub:project', slug); }, [slug]);

  // Depois da 1ª pintura: código de todas as telas, editor markdown e listas do projeto → trocar de tela não espera.
  useEffect(() => whenIdle(() => { preloadAllPages(); void preloadMarkdownEditor(); if (slug) prefetchProject(qc, slug); }), [slug, qc]);
  const warm = (path: string, load: () => Promise<unknown>) => { void load(); if (slug) prefetchPage(qc, slug, path); };

  const tela = PAGES.find((p) => p.path && pathname.startsWith(`/p/${slug}/${p.path}`)) ?? PAGES[0];
  const [pref, setPref] = useState(lerPref);
  const recolhida = pref[tela.path] ?? tela.sidebar === 'recolhida';
  const alternar = () => setPref((p) => { const n = { ...p, [tela.path]: !recolhida }; try { localStorage.setItem(PREF, JSON.stringify(n)); } catch { /* só conveniência */ } return n; });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full">
        <aside className={cx('shrink-0 border-r border-border bg-sidebar flex flex-col transition-[width] duration-150', recolhida ? 'w-14' : 'w-60')}>
          {/* projeto: a cor dele é a cor principal da interface */}
          <div className={cx('border-b border-border', recolhida ? 'p-2 flex justify-center' : 'px-4 py-4')}>
            {recolhida ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={alternar} className="size-9 rounded-lg bg-primary text-primary-foreground font-semibold text-sm grid place-items-center">{(projeto?.name ?? '?').slice(0, 2)}</button>
                </TooltipTrigger>
                <TooltipContent side="right">{projeto?.name ?? 'Escolha um projeto'} · abrir a barra</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground"><span className="size-2 rounded-full bg-primary" />Projeto</div>
                  <button onClick={alternar} className="text-muted-foreground hover:text-foreground" title="Recolher a barra"><PanelLeftClose className="size-4" /></button>
                </div>
                <Select className="w-full" value={slug ?? ''} onChange={(e) => (e.target.value === '__new' ? nav('/projetos') : nav(`/p/${e.target.value}`))}>
                  {!slug && <option value="">Escolha…</option>}
                  {projects.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                  <option value="__new">+ Gerenciar projetos</option>
                </Select>
              </>
            )}
          </div>
          {slug && (
            <nav className={cx('flex-1 space-y-0.5 overflow-y-auto', recolhida ? 'p-2' : 'p-2')}>
              {PAGES.map((p) => {
                const Icone = p.icon;
                const link = (
                  <NavLink key={p.path} end={p.path === ''} to={`/p/${slug}${p.path ? `/${p.path}` : ''}`}
                    onMouseEnter={() => warm(p.path, p.load)} onFocus={() => warm(p.path, p.load)} onPointerDown={() => warm(p.path, p.load)}
                    className={({ isActive }) => cx('flex items-center rounded-md text-sm', recolhida ? 'justify-center size-10 mx-auto' : 'gap-2.5 px-3 py-2', isActive ? 'bg-primary-soft text-primary-ink font-medium' : 'text-foreground hover:bg-muted')}>
                    <Icone className={cx('size-4 shrink-0', recolhida && 'size-[18px]')} strokeWidth={1.8} />{!recolhida && p.label}
                  </NavLink>
                );
                return recolhida ? (
                  <Tooltip key={p.path}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{p.label}</TooltipContent></Tooltip>
                ) : link;
              })}
            </nav>
          )}
          {recolhida ? (
            <button onClick={alternar} className="m-2 size-10 mx-auto grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" title="Abrir a barra"><PanelLeftOpen className="size-4" /></button>
          ) : (
            <div className="p-4 text-xs text-muted-foreground border-t border-border flex items-center gap-1.5"><FolderOpen className="size-3.5" />companies/{slug ?? ''}</div>
          )}
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Suspense fallback={<PageSkeleton />}>{children ?? <Outlet />}</Suspense>
        </main>
      </div>
    </TooltipProvider>
  );
}
