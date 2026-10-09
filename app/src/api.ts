// Cliente tipado da API local. Os tipos vêm dos mesmos schemas que validam os arquivos.
import type { Project, Persona, Note, Idea, Task, Competitor, Snapshot, ItemMark, TagDef, CommentKind, AdMark, AdMarkPatch } from '../../schema';
export type { AdMark, AdMarkPatch };
export type { Project, Persona, Note, Idea, Task, Competitor, Snapshot, ItemMark, TagDef };
import type { CollectResult, CompetitorSummary, ProfileSummary, AnalysisOverview, SiteRunResult } from '../../tools/intel/types';
import type { Classificacao } from '../../tools/intel/ads-classify';
export type { Classificacao };
export type { CollectResult, CompetitorSummary, ProfileSummary, AnalysisOverview, SiteRunResult };
import type { AnalysisResult, AnalysisRequest, AnalysisNotes, ModuleId } from '../../schema/analysis';
export type { AnalysisResult, AnalysisRequest, AnalysisNotes, ModuleId };
export interface AnalysisFull { results: Partial<Record<ModuleId, AnalysisResult>>; notes: AnalysisNotes; request: AnalysisRequest | null }
export interface QueueEntry { id: string; name: string; status: string; request: AnalysisRequest }

import type { FichaResumo, FichaView, VocabView, OpcaoVocab, EdicaoInfo } from '../../core/fichas';
export type { FichaResumo, FichaView, VocabView, OpcaoVocab, EdicaoInfo };
import type { FilaStatus, PedirLote } from '../../core/fichas-fila';
import type { RelatorioLinha, RelatorioView, FichaOpcao } from '../../core/relatorios';
import type { TermoInfo } from '../../core/termos';
export type { TermoInfo };
export interface DecisaoTermo { grupo: string; valor: string; ok: boolean; msg: string; reetiquetadas?: number }
export type { RelatorioLinha, RelatorioView, FichaOpcao };
export type { FilaStatus, PedirLote };
import type { Review, ReviewComment } from '../../schema/review';
import type { Brand, BrandFont, BrandToken } from '../../schema/brand';
import type { BrandPreset } from '../../core/brand-presets';
export type { Brand, BrandFont, BrandToken, BrandPreset };
export interface BrandKit { brand: Brand; imported: boolean; fonts: string[]; presets: BrandPreset[] }
export type { Review, ReviewComment };
import type { PieceMeta } from '../../schema/piece';
import type { Piece as PieceInfo } from '../../core/store';
export type { PieceMeta, PieceInfo };
export type PieceKind = PieceInfo['kind'];
import type { Format } from '../../schema/format';
import type { FormatInfo, FormatUse, FormatRefInput } from '../../core/store';
export type { Format, FormatInfo, FormatUse, FormatRefInput };
export type { PieceCover } from '../../core/store';
import type { AdsHistorico } from '../../core/store';
export type { AdsHistorico, AnuncioHistorico } from '../../core/store';
export interface NewFormatInput extends FormatRefInput { nome: string; midia: Format['midia']; essencia?: string; tipos?: Format['tipos'] }
import type { Atividade } from '../../tools/lib/atividade.mjs';
export type { Atividade };
/** atividade (046 A): dock = o que mostrar agora; historico = últimos trabalhos (página Agentes) */
import type { PedidoIa } from '../../tools/lib/pedidos-ia.mjs';
/** pedido avulso de IA (046 D) como a tela vê: `passo`/`agenteAtivo` enquanto roda */
export type PedidoIaView = PedidoIa & { passo?: string | null; agenteAtivo?: string | null };
export interface PedidoIaStart { started: boolean; mode: 'background' | 'terminal'; pedido: PedidoIaView | null }
export interface AtividadeView { dock: (Atividade & { podeParar: boolean })[]; historico: Atividade[] }
export interface RunnerStatus {
  running: boolean; pid: number | null; started: string | null; task: string | null; title: string | null; who: string | null;
  kind: 'fichas' | 'pesquisa' | 'pedido' | null; otherProject: string | null; ready: { id: string; title: string; assignee: string }[]; log: string[];
}
export interface NewPieceInput { title: string; text?: string; upload?: { name: string; base64: string }; formato?: string; format?: string; notes?: string; task?: boolean }
/** timeline.json da peça (só os campos que a tela lê) */
export interface PieceTimeline {
  formats?: string[];
  duration: number;
  scenes: { id: string; block?: string; start: number; end: number; on_screen?: string; vo?: string[] }[];
  vo: { id: string; text: string; start: number; end?: number; words?: { w: string; s: number; e: number }[] }[];
  events: { id: string; type: string; scene?: string; t?: number; at?: number; target?: string; word?: string }[];
  music?: { file?: string; id?: string; bpm?: number; gain_db?: number; license?: string; synth?: unknown } | null;
  sfx?: { event: string; asset?: string; synth?: string; gain_db?: number }[];
  mix?: { vo_db?: number; sfx_db?: number };
}
/** ajuste direto no vídeo (core/videoedit.ts) */
export type VideoAdjust = { op: 'volume'; alvo: string; db: number } | { op: 'duracao'; cena: string; s: number } | { op: 'texto'; cena: string; texto: string };
export interface PreviewJob { estado: 'rodando' | 'ok' | 'erro'; passo: string; passos: string[]; formato: string; log: string[]; inicio: string; fim?: string; arquivo?: string; erro?: string }
export interface PieceFull extends PieceInfo { timeline: PieceTimeline | null; previews: string[]; review: Review; meta: PieceMeta }
export interface SecretState { key: string; label: string; hint: string; test?: string; project: string | null; general: string | null; active: 'projeto' | 'geral' | null }
// Editor de mockups (tarefa 030)
import type { MockupScene } from '../../schema/mockup';
import type { CapturaRuntime } from '../../tools/mockup/cena-lib.mjs';
export type { MockupScene, CapturaRuntime };
export type MockupCatalogo = ReturnType<typeof import('../../core/mockups').catalogo>;
export type MockupItem = ReturnType<typeof import('../../core/mockups').listarMockups>[number];
export interface MockupExport { ok: boolean; arquivos: string[]; qa: string[]; erro?: string }
export interface Doc<T> { data: T; body: string; file: string }
export interface SnapshotEntry { key: string; file: string; data: Snapshot }
/** `snapshots`: por perfil, as 2 últimas completas + até 10 anteriores leves (seguidores e views/curtidas). `snapshotsTotal`: todas no disco. */
import type { AdsSnapshot, Ad } from '../../schema/ads';
export type { AdsSnapshot, Ad };
/** coleta semanal (tools/intel/semanal.ts) */
export interface WeeklyInfo {
  last?: string; lastWeek?: string;
  running?: { startedAt: string; done: number; total: number; current?: string } | null;
  lastSummary?: { profiles: number; ok: number; ads?: number; newAds?: number; report: string; errors: number };
  reports: { week: string; file: string }[];
}
import type { Matrix, CellStatus } from '../../schema/matrix';
export type { Matrix, CellStatus };
import type { Gaps, GapTheme } from '../../schema/gaps';
export type { Gaps, GapTheme };
import type { Referencia } from '../../schema/referencia';
export type { Referencia };
import type { CuratedSource as Source, SourceSuggestion, SourceRef, ResearchRequest, ResearchResult } from '../../schema/curadoria';
export type { Source, SourceSuggestion, SourceRef, ResearchRequest, ResearchResult };
import type { PesquisasStatus, RodadaView, RodadaLinha, Progresso, FonteProg, EtapaProg, Estimativa, PesquisaBody, UltimoPesquisa } from '../../core/pesquisas';
export type { PesquisasStatus, RodadaView, RodadaLinha, Progresso, FonteProg, EtapaProg, Estimativa, PesquisaBody, UltimoPesquisa };
export interface StrategyRefs { pillars: { n: number; name: string }[]; series: { n: number; name: string; pillars: number[] }[] }
export interface AdsResult { id: string; ok: boolean; ads: number; total?: number; pageId?: string; pageName?: string; file?: string; errors: string[] }
export interface CompetitorFull extends Doc<Competitor> { snapshots: SnapshotEntry[]; snapshotsTotal: number; marks: Record<string, ItemMark> }
export interface DetectedLink { platform: string; url: string; handle?: string; externalId?: string; kind: 'perfil' | 'conteudo' }

export class ApiError extends Error {
  constructor(public status: number, public payload: { error: string; file?: string; issues?: string[] }) {
    super(payload.issues?.length ? `${payload.error}: ${payload.issues.join('; ')}` : payload.error);
  }
}

/** Conexão com o servidor do app: cai quando um fetch falha por rede (servidor reiniciando) e volta na 1ª resposta.
 *  O aviso global "Reconectando…" (components/Reconnecting.tsx) lê daqui. */
let offline = false;
const netSubs = new Set<() => void>();
const setOffline = (v: boolean) => { if (offline !== v) { offline = v; for (const f of netSubs) f(); } };
export const net = {
  get: () => offline,
  subscribe: (f: () => void) => { netSubs.add(f); return () => { netSubs.delete(f); }; },
  /** o fetch falhou por rede (não é uma resposta de erro da API) */
  isNetworkError: (e: unknown) => e instanceof TypeError,
};

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  let r: Response;
  // um POST pode ter começado um trabalho (IA, coleta, render): o dock de atividade (046) confere logo, sem esperar o ciclo
  const acao = method === 'POST' && !path.includes('/atividade');
  if (acao) setTimeout(() => window.dispatchEvent(new Event('hub:acao')), 600);
  try {
    r = await fetch(path, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  } catch (e) { setOffline(true); throw e; }
  setOffline(false);
  const data = await r.json().catch(() => ({ error: r.statusText }));
  if (acao) window.dispatchEvent(new Event('hub:acao'));
  if (!r.ok) throw new ApiError(r.status, data);
  return data as T;
}
const pj = (slug: string) => `/api/projects/${encodeURIComponent(slug)}`;

export const api = {
  projects: () => req<Project[]>('GET', '/api/projects'),
  createProject: (slug: string, name: string) => req<Project>('POST', '/api/projects', { slug, name }),
  project: (slug: string) => req<Project>('GET', pj(slug)),
  saveProject: (slug: string, p: Partial<Project>) => req<Project>('PUT', pj(slug), p),
  tags: (slug: string) => req<{ tags: TagDef[] }>('GET', `${pj(slug)}/tags`),
  saveTags: (slug: string, tags: TagDef[]) => req<{ tags: TagDef[] }>('PUT', `${pj(slug)}/tags`, { tags }),

  tasks: (slug: string) => req<Doc<Task>[]>('GET', `${pj(slug)}/tasks`),
  createTask: (slug: string, data: Partial<Task> & { title: string }, body?: string) => req<Doc<Task>>('POST', `${pj(slug)}/tasks`, { data, body }),
  saveTask: (slug: string, id: string, data: Partial<Task> & { title: string }, body?: string) => req<Doc<Task>>('PUT', `${pj(slug)}/tasks/${id}`, { data, body }),
  archiveTask: (slug: string, id: string) => req<{ file: string }>('DELETE', `${pj(slug)}/tasks/${id}`),
  unarchiveTask: (slug: string, id: string) => req<Doc<Task>>('POST', `${pj(slug)}/tasks/${id}/unarchive`),
  moveTask: (slug: string, id: string, status: Task['status']) => req<Doc<Task>>('POST', `${pj(slug)}/tasks/${id}/move`, { status }),
  commentTask: (slug: string, id: string, c: { text: string; kind?: CommentKind; status?: Task['status']; assignee?: string }) => req<Doc<Task>>('POST', `${pj(slug)}/tasks/${id}/comments`, c),
  agents: () => req<{ name: string; color: string | null; description: string }[]>('GET', '/api/agents'),
  runner: (slug: string) => req<RunnerStatus>('GET', `${pj(slug)}/runner`),
  atividade: (slug: string) => req<AtividadeView>('GET', `${pj(slug)}/atividade`),
  atividadeVisto: (slug: string, ids: string[]) => req<AtividadeView>('POST', `${pj(slug)}/atividade/visto`, { ids }),
  atividadeParar: (slug: string, id: string) => req<AtividadeView>('POST', `${pj(slug)}/atividade/${encodeURIComponent(id)}/parar`),
  pedidoIa: (slug: string, ref: string) => req<PedidoIaView | null>('GET', `${pj(slug)}/pedido-ia?ref=${encodeURIComponent(ref)}`),
  pedirAjustes: (slug: string, path: string, b: { aba: 'video' | 'slides' | 'roteiro'; ids?: string[]; instrucoes?: string; modo?: 'background' | 'terminal' }) =>
    req<PedidoIaStart & { ids: string[] }>('POST', `${pj(slug)}/piece/ajustes?path=${encodeURIComponent(path)}`, b),
  rodarAnalise: (slug: string, b: { comp?: string; modo?: 'background' | 'terminal' } = {}) => req<PedidoIaStart>('POST', `${pj(slug)}/analysis-queue/rodar`, b),
  runAi: (slug: string, o: { mode: 'background' | 'terminal'; max?: number; task?: string }) => req<{ started: boolean; mode: string }>('POST', `${pj(slug)}/runner`, o),
  stopAi: (slug: string) => req<{ stopped: boolean }>('DELETE', `${pj(slug)}/runner`),

  personas: (slug: string) => req<Doc<Persona>[]>('GET', `${pj(slug)}/personas`),
  createPersona: (slug: string, data: Partial<Persona> & { name: string }, body?: string) => req<Doc<Persona>>('POST', `${pj(slug)}/personas`, { data, body }),
  savePersona: (slug: string, id: string, data: Partial<Persona> & { name: string }, body?: string) => req<Doc<Persona>>('PUT', `${pj(slug)}/personas/${id}`, { data, body }),
  deletePersona: (slug: string, id: string) => req<null>('DELETE', `${pj(slug)}/personas/${id}`),

  notes: (slug: string) => req<Doc<Note>[]>('GET', `${pj(slug)}/notes`),
  createNote: (slug: string, data: Partial<Note> & { title: string }, body?: string) => req<Doc<Note>>('POST', `${pj(slug)}/notes`, { data, body }),
  saveNote: (slug: string, id: string, data: Partial<Note> & { title: string }, body?: string) => req<Doc<Note>>('PUT', `${pj(slug)}/notes/${id}`, { data, body }),
  deleteNote: (slug: string, id: string) => req<null>('DELETE', `${pj(slug)}/notes/${id}`),

  ideas: (slug: string) => req<Doc<Idea>[]>('GET', `${pj(slug)}/ideas`),
  createIdea: (slug: string, data: Partial<Idea> & { title: string }, body?: string) => req<Doc<Idea>>('POST', `${pj(slug)}/ideas`, { data, body }),
  saveIdea: (slug: string, id: string, data: Partial<Idea> & { title: string }, body?: string) => req<Doc<Idea>>('PUT', `${pj(slug)}/ideas/${id}`, { data, body }),
  // curadoria (041 F1): fontes onde a IA procura ideias
  sources: (slug: string) => req<Source[]>('GET', `${pj(slug)}/sources`),
  createSource: (slug: string, s: Partial<Source> & { name: string; url: string }) => req<Source>('POST', `${pj(slug)}/sources`, s),
  saveSource: (slug: string, id: string, s: Partial<Source> & { name: string; url: string }) => req<Source>('PUT', `${pj(slug)}/sources/${encodeURIComponent(id)}`, s),
  setSourcesStatus: (slug: string, ids: string[], status: Source['status']) => req<Source[]>('POST', `${pj(slug)}/sources-status`, { ids, status }),
  suggestSource: (slug: string, url: string) => req<SourceSuggestion>('POST', `${pj(slug)}/sources-suggest`, { url }),
  strategyRefs: (slug: string) => req<StrategyRefs>('GET', `${pj(slug)}/strategy-refs`),
  // pesquisar ideias (041 F3)
  refs: (slug: string) => req<SourceRef[]>('GET', `${pj(slug)}/refs`),
  pesquisas: (slug: string) => req<PesquisasStatus>('GET', `${pj(slug)}/pesquisas`),
  pesquisa: (slug: string, rodada: string) => req<RodadaView>('GET', `${pj(slug)}/pesquisas/${encodeURIComponent(rodada)}`),
  pedirPesquisa: (slug: string, b: PesquisaBody) => req<{ round: string; rodando: boolean; aviso: string | null; modo: string }>('POST', `${pj(slug)}/pesquisas`, b),
  rodarPesquisa: (slug: string, rodada: string, modo: 'background' | 'terminal' = 'background') => req<{ started: boolean; mode: string }>('POST', `${pj(slug)}/pesquisas/${encodeURIComponent(rodada)}/rodar`, { modo }),
  pararPesquisa: (slug: string) => req<{ stopped: boolean }>('POST', `${pj(slug)}/pesquisas-parar`),

  contextList: (slug: string) => req<{ name: string; file: string }[]>('GET', `${pj(slug)}/context`),
  context: (slug: string, name: string) => req<{ name: string; text: string }>('GET', `${pj(slug)}/context/${encodeURIComponent(name)}`),
  saveContext: (slug: string, name: string, text: string) => req<null>('PUT', `${pj(slug)}/context/${encodeURIComponent(name)}`, { text }),
  brand: (slug: string) => req<BrandKit>('GET', `${pj(slug)}/brand`),
  saveBrand: (slug: string, brand: Brand) => req<BrandKit>('PUT', `${pj(slug)}/brand`, brand),
  uploadBrandFont: (slug: string, name: string, base64: string) => req<{ file: string }>('POST', `${pj(slug)}/brand/font`, { name, base64 }),
  brandFileUrl: (slug: string, file: string) => `/brand-file/${slug}/${file.split('/').map(encodeURIComponent).join('/')}`,
  brandCss: (slug: string) => req<{ file: string; text: string | null }>('GET', `${pj(slug)}/brand-css`),

  detectLink: (url: string) => req<DetectedLink | null>('POST', '/api/detect-link', { url }),
  competitors: (slug: string) => req<Doc<Competitor>[]>('GET', `${pj(slug)}/competitors`),
  competitor: (slug: string, id: string) => req<CompetitorFull>('GET', `${pj(slug)}/competitors/${id}`),
  createCompetitor: (slug: string, data: Partial<Competitor> & { name: string }, body?: string) => req<Doc<Competitor>>('POST', `${pj(slug)}/competitors`, { data, body }),
  saveCompetitor: (slug: string, id: string, data: Partial<Competitor> & { name: string }, body?: string) => req<Doc<Competitor>>('PUT', `${pj(slug)}/competitors/${id}`, { data, body }),
  deleteCompetitor: (slug: string, id: string) => req<null>('DELETE', `${pj(slug)}/competitors/${id}`),
  setMark: (slug: string, id: string, key: string, mark: Partial<ItemMark>) => req<ItemMark>('PUT', `${pj(slug)}/competitors/${id}/marks`, { key, mark }),
  collect: (slug: string, id: string, opt: { platforms?: string[]; maxItems?: number } = {}) => req<unknown>('POST', `${pj(slug)}/competitors/${id}/collect`, opt),
  mediaUrl: (slug: string, compId: string, local?: string) => (local ? `/media/${slug}/${compId}/${local.replace(/^media\//, '')}` : undefined),

  competitorsSummary: (slug: string) => req<CompetitorSummary[]>('GET', `${pj(slug)}/competitors-summary`),
  collectResults: (slug: string, id: string, opt: { platforms?: string[]; maxItems?: number } = {}) => req<CollectResult[]>('POST', `${pj(slug)}/competitors/${id}/collect`, opt),

  analysis: (slug: string, id: string) => req<AnalysisFull>('GET', `${pj(slug)}/competitors/${id}/analysis`),
  setAnalysisNote: (slug: string, id: string, key: string, text: string) => req<AnalysisNotes>('PUT', `${pj(slug)}/competitors/${id}/analysis/notes/${key}`, { text }),
  requestAnalysis: (slug: string, id: string, r: { modules: ModuleId[]; force?: boolean; instructions?: string }) => req<AnalysisRequest>('PUT', `${pj(slug)}/competitors/${id}/analysis/request`, r),
  cancelAnalysis: (slug: string, id: string) => req<null>('DELETE', `${pj(slug)}/competitors/${id}/analysis/request`),
  runSite: (slug: string, id: string) => req<SiteRunResult>('POST', `${pj(slug)}/competitors/${id}/analysis/site`),
  runReclameAqui: (slug: string, id: string) => req<{ found: boolean; status?: string; score?: number; complaints?: number }>('POST', `${pj(slug)}/competitors/${id}/analysis/ra`),
  matrix: (slug: string) => req<Matrix>('GET', `${pj(slug)}/matrix`),
  gaps: (slug: string) => req<Gaps | null>('GET', `${pj(slug)}/gaps`),
  setMatrixCell: (slug: string, col: string, feat: string, c: { status: CellStatus | null; note?: string; source?: string }) => req<Matrix>('PUT', `${pj(slug)}/matrix/cells/${encodeURIComponent(col)}/${encodeURIComponent(feat)}`, c),
  saveMatrixFeature: (slug: string, f: { id?: string; name: string; group: string; description?: string }) => req<Matrix>(f.id ? 'PUT' : 'POST', `${pj(slug)}/matrix/features${f.id ? `/${encodeURIComponent(f.id)}` : ''}`, f),
  deleteMatrixFeature: (slug: string, id: string) => req<Matrix>('DELETE', `${pj(slug)}/matrix/features/${encodeURIComponent(id)}`),
  renameMatrixGroup: (slug: string, from: string, to: string) => req<Matrix>('POST', `${pj(slug)}/matrix/rename-group`, { from, to }),
  referencia: (slug: string) => req<Referencia | null>('GET', `${pj(slug)}/referencia`),
  weekly: (slug: string) => req<WeeklyInfo>('GET', `${pj(slug)}/weekly`),
  runWeekly: (slug: string) => req<WeeklyInfo>('POST', `${pj(slug)}/weekly`),
  weeklyReport: (slug: string, week: string) => req<{ text: string }>('GET', `${pj(slug)}/weekly/report?week=${encodeURIComponent(week)}`),
  adsClassified: (slug: string) => req<{ id: string; ads: (Classificacao & { adId: string })[] }[]>('GET', `${pj(slug)}/ads/classified`),
  adsHistory: (slug: string, id: string) => req<AdsHistorico>('GET', `${pj(slug)}/competitors/${encodeURIComponent(id)}/ads/history`),
  adsMarks: (slug: string) => req<Record<string, Record<string, AdMark>>>('GET', `${pj(slug)}/ads/marks`),
  setAdMark: (slug: string, compId: string, adId: string, patch: AdMarkPatch) => req<AdMark | null>('PUT', `${pj(slug)}/competitors/${encodeURIComponent(compId)}/ads/marks/${encodeURIComponent(adId)}`, patch),
  adSalvoUrl: (slug: string, compId: string, file?: string) => (file ? `/ads-salvo/${slug}/${compId}/${file}` : undefined),
  ads: (slug: string) => req<{ id: string; history: { file: string; data: AdsSnapshot }[] }[]>('GET', `${pj(slug)}/ads`),
  collectAds: (slug: string, id: string) => req<AdsResult>('POST', `${pj(slug)}/competitors/${id}/ads`),
  analysisAll: (slug: string) => req<{ id: string; results: AnalysisFull['results'] }[]>('GET', `${pj(slug)}/analysis-all`),
  competitorsFeed: (slug: string) => req<{ id: string; snapshots: SnapshotEntry[]; marks: Record<string, ItemMark> }[]>('GET', `${pj(slug)}/competitors-feed`),
  analysisOverview: (slug: string) => req<AnalysisOverview[]>('GET', `${pj(slug)}/analysis-overview`),
  analysisQueue: (slug: string) => req<QueueEntry[]>('GET', `${pj(slug)}/analysis-queue`),
  // fichas de análise (040 D)
  fichasResumo: (slug: string) => req<Record<string, Record<string, FichaResumo>>>('GET', `${pj(slug)}/fichas`),
  fichasVocab: (slug: string) => req<VocabView>('GET', `${pj(slug)}/fichas-vocab`),
  ficha: (slug: string, comp: string, key: string) => req<FichaView | null>('GET', `${pj(slug)}/competitors/${comp}/fichas/${encodeURIComponent(key)}`),
  editFicha: (slug: string, comp: string, key: string, edit: { path: string; value?: unknown; revert?: boolean }) => req<FichaView>('PUT', `${pj(slug)}/competitors/${comp}/fichas/${encodeURIComponent(key)}/override`, edit),
  pedirFicha: (slug: string, comp: string, key: string) => req<{ naFila: boolean; itens: number }>('POST', `${pj(slug)}/competitors/${comp}/fichas/${encodeURIComponent(key)}/pedido`),
  cancelarFicha: (slug: string, comp: string, key: string) => req<{ naFila: boolean; itens: number }>('DELETE', `${pj(slug)}/competitors/${comp}/fichas/${encodeURIComponent(key)}/pedido`),
  // fila de fichas (040 E)
  fichasFila: (slug: string) => req<FilaStatus>('GET', `${pj(slug)}/fichas-fila`),
  pedirFichas: (slug: string, b: PedirLote) => req<{ gravados: number; fora: number; rodando: boolean; aviso: string | null }>('POST', `${pj(slug)}/fichas-fila`, b),
  rodarFichas: (slug: string) => req<{ started: boolean }>('POST', `${pj(slug)}/fichas-fila/rodar`),
  pararFichas: (slug: string) => req<{ stopped: boolean }>('DELETE', `${pj(slug)}/fichas-fila/rodar`),
  // relatórios por concorrente (040 F)
  relatorios: (slug: string, comp: string) => req<RelatorioLinha[]>('GET', `${pj(slug)}/competitors/${comp}/relatorios`),
  relatorio: (slug: string, comp: string, id: string) => req<RelatorioView | null>('GET', `${pj(slug)}/competitors/${comp}/relatorios/${id}`),
  relatorioFichas: (slug: string, comp: string) => req<FichaOpcao[]>('GET', `${pj(slug)}/competitors/${comp}/relatorios-fichas`),
  gerarRelatorio: (slug: string, comp: string, b: { rede: string; itens?: string[]; abrir?: boolean; modo?: 'background' | 'terminal' }) => req<{ aberto: boolean; modo: 'background' | 'terminal' | 'comando'; comando: string; itens: number; pedido?: PedidoIaView | null }>('POST', `${pj(slug)}/competitors/${comp}/relatorios`, b),
  decidirTermos: (slug: string, comp: string, id: string, decisoes: { grupo: string; valor: string; decisao: 'aceito' | 'recusado'; substituto?: string }[]) => req<{ resultado: DecisaoTermo[]; view: RelatorioView | null }>('POST', `${pj(slug)}/competitors/${comp}/relatorios/${id}/termos`, { decisoes }),
  // vocabulário vivo (040 H): termos novos da ficha, info para o diálogo, decisão fora do relatório
  termoInfo: (slug: string, grupo: string, valor: string) => req<TermoInfo | null>('GET', `${pj(slug)}/termos/${encodeURIComponent(grupo)}/${encodeURIComponent(valor)}`),
  decidirTermo: (slug: string, d: { grupo: string; valor: string; decisao: 'aceito' | 'recusado'; substituto?: string; motivo?: string }) => req<{ resultado: DecisaoTermo[] }>('POST', `${pj(slug)}/termos/decidir`, { decisoes: [d] }),

  secrets: (slug: string) => req<SecretState[]>('GET', `${pj(slug)}/secrets`),
  setSecret: (slug: string, key: string, value: string, scope: 'projeto' | 'geral' = 'projeto') => req<SecretState | null>('PUT', `${pj(slug)}/secrets/${encodeURIComponent(key)}`, { value, scope }),
  testSecret: (slug: string, key: string) => req<{ ok: boolean; message: string }>('POST', `${pj(slug)}/secrets/${encodeURIComponent(key)}/test`),

  pieces: (slug: string) => req<PieceInfo[]>('GET', `${pj(slug)}/pieces`),
  piece: (slug: string, path: string) => req<PieceFull>('GET', `${pj(slug)}/piece?path=${encodeURIComponent(path)}`),
  saveReview: (slug: string, path: string, review: Review) => req<Review>('PUT', `${pj(slug)}/piece/review?path=${encodeURIComponent(path)}`, review),
  createPiece: (slug: string, input: NewPieceInput) => req<{ path: string; task?: Task }>('POST', `${pj(slug)}/pieces`, input),
  pieceText: (slug: string, path: string, file: string) => req<{ file: string; text: string }>('GET', `${pj(slug)}/piece/text?path=${encodeURIComponent(path)}&file=${encodeURIComponent(file)}`),
  savePieceText: (slug: string, path: string, file: string, text: string) => req<{ file: string; text: string }>('PUT', `${pj(slug)}/piece/text?path=${encodeURIComponent(path)}&file=${encodeURIComponent(file)}`, { text }),
  savePieceMeta: (slug: string, path: string, patch: Partial<PieceMeta>) => req<PieceMeta>('PUT', `${pj(slug)}/piece/meta?path=${encodeURIComponent(path)}`, patch),
  /** abre no computador: reveal = Explorer com o arquivo selecionado; open = app padrão (player). file vazio = a pasta */
  pieceDesktop: (slug: string, path: string, how: 'reveal' | 'open', file = '') => req<{ ok: boolean }>('POST', `${pj(slug)}/piece/${how}?path=${encodeURIComponent(path)}&file=${encodeURIComponent(file)}`),
  adjustVideo: (slug: string, path: string, a: VideoAdjust) => req<{ saida: string; timeline: PieceTimeline }>('POST', `${pj(slug)}/piece/adjust?path=${encodeURIComponent(path)}`, a),
  previewStatus: (slug: string, path: string) => req<PreviewJob | null>('GET', `${pj(slug)}/piece/preview?path=${encodeURIComponent(path)}`),
  generatePreview: (slug: string, path: string, formato?: string) => req<PreviewJob>('POST', `${pj(slug)}/piece/preview?path=${encodeURIComponent(path)}`, { formato }),
  pieceFileUrl: (slug: string, path: string, file: string) => `/piece-file/${slug}/${path.split('/').map(encodeURIComponent).join('/')}/${file.split('/').map(encodeURIComponent).join('/')}`,

  formats: () => req<FormatInfo[]>('GET', '/api/formats'),
  format: (id: string) => req<FormatInfo>('GET', `/api/formats/${encodeURIComponent(id)}`),
  createFormat: (input: NewFormatInput) => req<FormatInfo>('POST', '/api/formats', input),
  saveFormat: (id: string, patch: Partial<Omit<Format, 'nota'>> & { nota?: number | null }) => req<Format>('PUT', `/api/formats/${encodeURIComponent(id)}`, patch),
  addFormatRef: (id: string, r: FormatRefInput) => req<Format>('POST', `/api/formats/${encodeURIComponent(id)}/refs`, r),
  removeFormatRef: (id: string, i: number) => req<Format>('DELETE', `/api/formats/${encodeURIComponent(id)}/refs/${i}`),
  promoteExample: (id: string, ex: { empresa: string; peca: string; arquivo?: string; legenda?: string }) => req<Format>('POST', `/api/formats/${encodeURIComponent(id)}/examples`, ex),
  removeExample: (id: string, i: number) => req<Format>('DELETE', `/api/formats/${encodeURIComponent(id)}/examples/${i}`),
  formatRefUrl: (id: string, file: string) => `/format-ref/${id}/${encodeURIComponent(file)}`,

  mockupCatalogo: () => req<MockupCatalogo>('GET', '/api/mockup/catalogo'),
  mockupAparelhos: () => req<Record<string, unknown>>('GET', '/api/mockup/aparelhos'),
  capturas: (slug: string) => req<CapturaRuntime[]>('GET', `${pj(slug)}/capturas`),
  novaCaptura: (slug: string, b: { nome?: string; base64: string; ext?: string }) => req<CapturaRuntime>('POST', `${pj(slug)}/capturas`, b),
  mockups: (slug: string) => req<MockupItem[]>('GET', `${pj(slug)}/mockups`),
  criarMockup: (slug: string, b: { nome?: string; captura?: string; titulo?: string; formatos?: string[] }) => req<{ path: string }>('POST', `${pj(slug)}/mockups`, b),
  mockup: (slug: string, path: string) => req<{ doc: MockupScene; capturas: Record<string, CapturaRuntime> }>('GET', `${pj(slug)}/mockup?path=${encodeURIComponent(path)}`),
  salvarMockup: (slug: string, path: string, doc: MockupScene) => req<{ ok: boolean }>('PUT', `${pj(slug)}/mockup?path=${encodeURIComponent(path)}`, doc),
  exportarMockup: (slug: string, path: string, b: { formatos?: string[]; escala?: number; webp?: boolean }) => req<MockupExport>('POST', `${pj(slug)}/mockup/export?path=${encodeURIComponent(path)}`, b),

  validate: () => req<{ file: string; issues: string[] }[]>('GET', '/api/validate'),
};
