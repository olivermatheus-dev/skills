// Registro das telas do projeto (menu lateral + rotas). Cada frente adiciona só a própria linha.
// Cada tela é um pedaço separado do bundle (React.lazy); `load` pré-carrega o pedaço (hover no menu, ocioso).
import { lazy, type ComponentType } from 'react';

type Loader = () => Promise<{ default: ComponentType }>;
const page = (load: Loader) => ({ element: lazy(load), load });

export interface PageDef { path: string; label: string; icon: string; element: ComponentType; load: Loader; children?: { path: string; element: ComponentType; load: Loader }[] }

export const PAGES: PageDef[] = [
  { path: '', label: 'Visão geral', icon: '◎', ...page(() => import('./Dashboard')) },
  { path: 'quadro', label: 'Quadro', icon: '▦', ...page(() => import('./Board')) },
  { path: 'concorrentes', label: 'Concorrentes', icon: '◉', ...page(() => import('./Competitors')), children: [{ path: ':id', ...page(() => import('./CompetitorDetail')) }] },
  { path: 'ideias', label: 'Ideias', icon: '✦', ...page(() => import('./Ideas')) },
  { path: 'personas', label: 'Personas', icon: '☺', ...page(() => import('./Personas')) },
  { path: 'anotacoes', label: 'Anotações', icon: '✎', ...page(() => import('./Notes')) },
  { path: 'contexto', label: 'Contexto e marca', icon: '❖', ...page(() => import('./Context')) },
  { path: 'configuracoes', label: 'Configurações', icon: '⚙', ...page(() => import('./Settings')) },
];
export const ProjectsPage = page(() => import('./Projects'));

/** baixa o código de todas as telas (chamado quando o navegador está ocioso) */
export const preloadAllPages = () => { for (const p of PAGES) { void p.load(); for (const c of p.children ?? []) void c.load(); } void ProjectsPage.load(); };
