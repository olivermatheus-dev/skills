// Registro das telas do projeto (menu lateral + rotas). Cada frente adiciona só a própria linha.
// Cada tela é um pedaço separado do bundle (React.lazy); `load` pré-carrega o pedaço (hover no menu, ocioso).
import { lazy, type ComponentType } from 'react';
import { Bot, Clapperboard, LayoutDashboard, LayoutTemplate, Lightbulb, NotebookPen, Palette, Radar, Settings, Smartphone, SquareKanban, UsersRound, type LucideIcon } from 'lucide-react';

type Loader = () => Promise<{ default: ComponentType }>;
const page = (load: Loader) => ({ element: lazy(load), load });

/** sidebar: 'recolhida' = telas de trabalho (editor, análise) abrem com a barra principal só em ícones; o Oliver pode abrir à mão (fica lembrado por tela) */
export interface PageDef { path: string; label: string; icon: LucideIcon; sidebar?: 'recolhida'; element: ComponentType; load: Loader; children?: { path: string; element: ComponentType; load: Loader }[] }

export const PAGES: PageDef[] = [
  { path: '', label: 'Visão geral', icon: LayoutDashboard, ...page(() => import('./Dashboard')) },
  { path: 'quadro', label: 'Quadro', icon: SquareKanban, ...page(() => import('./Board')) },
  // área Agentes e skills: abas na raiz (Em andamento · Equipe · Skills · Histórico); página de cada agente e de cada skill
  { path: 'agentes', label: 'Agentes e skills', icon: Bot, ...page(() => import('./Agentes')), children: [
    { path: 'skills/:skill', ...page(() => import('./SkillDetalhe')) },
    { path: ':agente', ...page(() => import('./AgenteDetalhe')) },
  ] },
  // área Concorrentes: Panorama na raiz; as outras abas são rotas fixas (ganham da `:id` da ficha)
  { path: 'concorrentes', label: 'Concorrentes', icon: Radar, sidebar: 'recolhida', ...page(() => import('./concorrentes/Panorama')), children: [
    { path: 'lista', ...page(() => import('./concorrentes/Lista')) },
    { path: 'comparar', ...page(() => import('./concorrentes/Comparar')) },
    { path: 'brechas', ...page(() => import('./concorrentes/Brechas')) },
    { path: 'conteudos', ...page(() => import('./concorrentes/Conteudos')) },
    { path: 'redes', ...page(() => import('./concorrentes/Redes')) },
    { path: 'anuncios', ...page(() => import('./concorrentes/Anuncios')) },
    { path: 'coletas', ...page(() => import('./concorrentes/Coletas')) },
    { path: ':id', ...page(() => import('./CompetitorDetail')) },
  ] },
  { path: 'conteudos', label: 'Conteúdos', icon: Clapperboard, ...page(() => import('./Conteudos')) },
  { path: 'mockups', label: 'Mockups', icon: Smartphone, sidebar: 'recolhida', ...page(() => import('./Mockups')) },
  { path: 'formatos', label: 'Formatos', icon: LayoutTemplate, ...page(() => import('./Formatos')) },
  // área Ideias (041): banco na raiz; Fontes e Pesquisas (histórico das rodadas + uma rodada) são abas com rota própria
  { path: 'ideias', label: 'Ideias', icon: Lightbulb, ...page(() => import('./Ideas')), children: [
    { path: 'fontes', ...page(() => import('./Fontes')) },
    { path: 'pesquisas', ...page(() => import('./Pesquisas')) },
    { path: 'pesquisas/:rodada', ...page(() => import('./PesquisaDetalhe')) },
  ] },
  { path: 'personas', label: 'Personas', icon: UsersRound, ...page(() => import('./Personas')) },
  { path: 'anotacoes', label: 'Anotações', icon: NotebookPen, ...page(() => import('./Notes')) },
  { path: 'contexto', label: 'Contexto e marca', icon: Palette, ...page(() => import('./Context')) },
  { path: 'configuracoes', label: 'Configurações', icon: Settings, ...page(() => import('./Settings')) },
];
export const ProjectsPage = page(() => import('./Projects'));

/** baixa o código de todas as telas (chamado quando o navegador está ocioso) */
export const preloadAllPages = () => { for (const p of PAGES) { void p.load(); for (const c of p.children ?? []) void c.load(); } void ProjectsPage.load(); };
