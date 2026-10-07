// Registro das telas do projeto (menu lateral + rotas). Cada frente adiciona só a própria linha.
import type { ComponentType } from 'react';
import Dashboard from './Dashboard';
import Board from './Board';
import Competitors from './Competitors';
import CompetitorDetail from './CompetitorDetail';
import Ideas from './Ideas';
import Personas from './Personas';
import Notes from './Notes';
import Context from './Context';

export interface PageDef { path: string; label: string; icon: string; element: ComponentType; children?: { path: string; element: ComponentType }[] }

export const PAGES: PageDef[] = [
  { path: '', label: 'Visão geral', icon: '◎', element: Dashboard },
  { path: 'quadro', label: 'Quadro', icon: '▦', element: Board },
  { path: 'concorrentes', label: 'Concorrentes', icon: '◉', element: Competitors, children: [{ path: ':id', element: CompetitorDetail }] },
  { path: 'ideias', label: 'Ideias', icon: '✦', element: Ideas },
  { path: 'personas', label: 'Personas', icon: '☺', element: Personas },
  { path: 'anotacoes', label: 'Anotações', icon: '✎', element: Notes },
  { path: 'contexto', label: 'Contexto e marca', icon: '❖', element: Context },
];
