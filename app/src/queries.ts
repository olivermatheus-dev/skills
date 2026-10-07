// Camada de dados da interface: chaves do cache, consultas, pré-carga e o padrão de mutação otimista.
// Regra: a tela muda na hora (setQueryData), o servidor confirma depois; erro → desfaz e avisa (toast).
import { queryOptions, useMutation, useQuery, useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { api, type Doc } from './api';
import { toast } from './components/toast';

// ---------- chaves ----------
export const qk = {
  projects: () => ['projects'] as const,
  project: (slug: string) => ['project', slug] as const,
  tags: (slug: string) => ['tags', slug] as const,
  tasks: (slug: string) => ['tasks', slug] as const,
  personas: (slug: string) => ['personas', slug] as const,
  notes: (slug: string) => ['notes', slug] as const,
  ideas: (slug: string) => ['ideas', slug] as const,
  competitors: (slug: string) => ['competitors', slug] as const,
  competitor: (slug: string, id: string) => ['competitor', slug, id] as const,
  competitorsSummary: (slug: string) => ['competitors-summary', slug] as const,
  analysis: (slug: string, id: string) => ['analysis', slug, id] as const,
  analysisOverview: (slug: string) => ['analysis-overview', slug] as const,
  contextList: (slug: string) => ['context-list', slug] as const,
  context: (slug: string, name: string) => ['context', slug, name] as const,
  brandCss: (slug: string) => ['brand-css', slug] as const,
  brand: (slug: string) => ['brand', slug] as const,
  secrets: (slug: string) => ['secrets', slug] as const,
  pieces: (slug: string) => ['pieces', slug] as const,
  piece: (slug: string, path: string) => ['piece', slug, path] as const,
  pieceText: (slug: string, path: string, file: string) => ['piece-text', slug, path, file] as const,
  formats: () => ['formats'] as const,
};

// ---------- consultas ----------
export const q = {
  projects: () => queryOptions({ queryKey: qk.projects(), queryFn: api.projects }),
  project: (slug: string) => queryOptions({ queryKey: qk.project(slug), queryFn: () => api.project(slug), enabled: !!slug }),
  tags: (slug: string) => queryOptions({ queryKey: qk.tags(slug), queryFn: () => api.tags(slug), enabled: !!slug }),
  tasks: (slug: string) => queryOptions({ queryKey: qk.tasks(slug), queryFn: () => api.tasks(slug), enabled: !!slug }),
  personas: (slug: string) => queryOptions({ queryKey: qk.personas(slug), queryFn: () => api.personas(slug), enabled: !!slug }),
  notes: (slug: string) => queryOptions({ queryKey: qk.notes(slug), queryFn: () => api.notes(slug), enabled: !!slug }),
  ideas: (slug: string) => queryOptions({ queryKey: qk.ideas(slug), queryFn: () => api.ideas(slug), enabled: !!slug }),
  competitors: (slug: string) => queryOptions({ queryKey: qk.competitors(slug), queryFn: () => api.competitors(slug), enabled: !!slug }),
  // recém-criado (otimista): espera a criação e usa o id real
  competitor: (slug: string, id: string) => queryOptions({ queryKey: qk.competitor(slug, id), queryFn: async () => api.competitor(slug, await realId('competitor', slug, id)), enabled: !!slug && !!id }),
  competitorsSummary: (slug: string) => queryOptions({ queryKey: qk.competitorsSummary(slug), queryFn: () => api.competitorsSummary(slug), enabled: !!slug }),
  analysis: (slug: string, id: string) => queryOptions({ queryKey: qk.analysis(slug, id), queryFn: () => api.analysis(slug, id), enabled: !!slug && !!id }),
  analysisOverview: (slug: string) => queryOptions({ queryKey: qk.analysisOverview(slug), queryFn: () => api.analysisOverview(slug), enabled: !!slug }),
  contextList: (slug: string) => queryOptions({ queryKey: qk.contextList(slug), queryFn: () => api.contextList(slug), enabled: !!slug }),
  // documento importante com salvar explícito: não recarrega sozinho por baixo da edição
  context: (slug: string, name: string) => queryOptions({ queryKey: qk.context(slug, name), queryFn: () => api.context(slug, name), staleTime: Infinity, refetchOnWindowFocus: false }),
  brandCss: (slug: string) => queryOptions({ queryKey: qk.brandCss(slug), queryFn: () => api.brandCss(slug), enabled: !!slug }),
  // kit com salvar explícito: não recarrega por baixo da edição
  brand: (slug: string) => queryOptions({ queryKey: qk.brand(slug), queryFn: () => api.brand(slug), enabled: !!slug, staleTime: Infinity, refetchOnWindowFocus: false }),
  secrets: (slug: string) => queryOptions({ queryKey: qk.secrets(slug), queryFn: () => api.secrets(slug), enabled: !!slug }),
  pieces: (slug: string) => queryOptions({ queryKey: qk.pieces(slug), queryFn: () => api.pieces(slug), enabled: !!slug }),
  piece: (slug: string, path: string) => queryOptions({ queryKey: qk.piece(slug, path), queryFn: () => api.piece(slug, path), enabled: !!slug && !!path }),
  // texto com salvar explícito: não recarrega por baixo da edição
  pieceText: (slug: string, path: string, file: string) => queryOptions({ queryKey: qk.pieceText(slug, path, file), queryFn: () => api.pieceText(slug, path, file), enabled: !!slug && !!path && !!file, staleTime: Infinity, refetchOnWindowFocus: false }),
  formats: () => queryOptions({ queryKey: qk.formats(), queryFn: api.formats }),
};

export const useProjects = () => useQuery(q.projects());
export const useProject = (slug: string) => useQuery(q.project(slug));
export const useTags = (slug?: string) => useQuery(q.tags(slug ?? ''));
export const useTasks = (slug: string) => useQuery(q.tasks(slug));
export const usePersonas = (slug: string) => useQuery(q.personas(slug));
export const useNotes = (slug: string) => useQuery(q.notes(slug));
export const useIdeas = (slug: string) => useQuery(q.ideas(slug));
export const useCompetitors = (slug: string) => useQuery(q.competitors(slug));
export const useCompetitor = (slug: string, id: string) => useQuery(q.competitor(slug, id));
export const useCompetitorsSummary = (slug: string) => useQuery(q.competitorsSummary(slug));
export const useAnalysis = (slug: string, id: string) => useQuery(q.analysis(slug, id));
export const useAnalysisOverview = (slug: string) => useQuery(q.analysisOverview(slug));
export const useContextList = (slug: string) => useQuery(q.contextList(slug));
export const useContextDoc = (slug: string, name: string) => useQuery(q.context(slug, name));
export const useBrandCss = (slug: string) => useQuery(q.brandCss(slug));
export const useBrandKit = (slug: string) => useQuery(q.brand(slug));
export const useSecrets = (slug: string) => useQuery(q.secrets(slug));
export const usePieces = (slug: string) => useQuery(q.pieces(slug));
export const usePiece = (slug: string, path: string) => useQuery(q.piece(slug, path));
export const usePieceText = (slug: string, path: string, file: string) => useQuery(q.pieceText(slug, path, file));
export const useFormats = () => useQuery(q.formats());

// ---------- pré-carga ----------
/** o que cada tela lê (para pré-carregar ao passar o mouse no menu) */
const PAGE_QUERIES: Record<string, (slug: string) => { queryKey: QueryKey }[]> = {
  '': (s) => [q.project(s), q.tasks(s), q.notes(s), q.ideas(s), q.competitors(s)],
  quadro: (s) => [q.tasks(s)],
  concorrentes: (s) => [q.competitors(s), q.competitorsSummary(s), q.analysisOverview(s)],
  ideias: (s) => [q.ideas(s), q.competitors(s), q.tags(s), q.tasks(s)],
  personas: (s) => [q.personas(s), q.tags(s)],
  anotacoes: (s) => [q.notes(s), q.tags(s)],
  contexto: (s) => [q.contextList(s), q.project(s), q.tags(s)],
  conteudos: (s) => [q.pieces(s), q.formats()],
  formatos: (s) => [q.formats(), q.pieces(s)],
  configuracoes: (s) => [q.secrets(s)],
};
export function prefetchPage(qc: QueryClient, slug: string, path: string) {
  // prefetchQuery respeita o staleTime: se o cache está fresco, não faz nada
  for (const o of PAGE_QUERIES[path]?.(slug) ?? []) void qc.prefetchQuery(o as Parameters<QueryClient['prefetchQuery']>[0]);
}
export function prefetchProject(qc: QueryClient, slug: string) {
  for (const p of Object.keys(PAGE_QUERIES)) prefetchPage(qc, slug, p);
}
export const prefetchCompetitor = (qc: QueryClient, slug: string, id: string) => { void qc.prefetchQuery(q.competitor(slug, id)); void qc.prefetchQuery(q.analysis(slug, id)); };

/** roda quando o navegador está ocioso (depois da 1ª pintura) */
export function whenIdle(fn: () => void, timeout = 1500) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) { const id = w.requestIdleCallback(fn, { timeout }); return () => w.cancelIdleCallback?.(id); }
  const t = setTimeout(fn, 200); return () => clearTimeout(t);
}

// ---------- ids provisórios ----------
// Criar algo mostra o item na hora com um id previsto. Ações sobre ele (salvar, mover, arquivar) esperam a criação
// terminar e usam o id real devolvido pelo servidor.
const creating = new Map<string, Promise<string>>();
const resolved = new Map<string, string>();
const rk = (kind: string, slug: string, id: string) => `${kind}:${slug}:${id}`;
export function trackCreate(kind: string, slug: string, tempId: string, p: Promise<string>) {
  const k = rk(kind, slug, tempId);
  creating.set(k, p);
  p.then((real) => { resolved.set(k, real); }, () => {}).finally(() => { if (creating.get(k) === p) creating.delete(k); });
  return p;
}
/** id real de um item (espera a criação em andamento, se houver) */
export async function realId(kind: string, slug: string, id: string): Promise<string> {
  const k = rk(kind, slug, id);
  const p = creating.get(k);
  if (p) return p;
  return resolved.get(k) ?? id;
}
export const isCreating = (kind: string, slug: string, id: string) => creating.has(rk(kind, slug, id));

/** próximo id sequencial (T-0001, I-0001) previsto a partir do cache, igual ao que o servidor vai dar */
export function nextSeqId(prefix: 'T' | 'I', ids: string[]) {
  const n = Math.max(0, ...ids.filter((x) => x.startsWith(`${prefix}-`)).map((x) => parseInt(x.slice(2), 10) || 0));
  return `${prefix}-${String(n + 1).padStart(4, '0')}`;
}

// ---------- utilidades de lista ----------
type Docs<T> = Doc<T>[] | undefined;
type WithId = { id: string };
export const upsertDoc = <T extends WithId>(list: Docs<T>, doc: Doc<T>, replaceId = doc.data.id): Doc<T>[] => {
  const cur = list ?? [];
  const i = cur.findIndex((x) => x.data.id === replaceId);
  if (i < 0) return [...cur, doc];
  const next = cur.slice(); next[i] = doc; return next;
};
export const patchDoc = <T extends WithId>(list: Docs<T>, id: string, fn: (d: Doc<T>) => Doc<T>): Doc<T>[] | undefined =>
  list?.map((x) => (x.data.id === id ? fn(x) : x));
export const removeDoc = <T extends WithId>(list: Docs<T>, id: string): Doc<T>[] | undefined => list?.filter((x) => x.data.id !== id);

// ---------- mutação otimista ----------
// Invalida só depois que todas as mutações otimistas em andamento terminaram: um refetch no meio
// traria o estado antigo do servidor e faria a tela "piscar" para trás.
const toInvalidate = new Map<string, QueryKey>();
let inFlight = 0;
function settle(qc: QueryClient, keys: QueryKey[]) {
  for (const k of keys) toInvalidate.set(JSON.stringify(k), k);
  inFlight = Math.max(0, inFlight - 1);
  if (inFlight === 0) {
    const all = [...toInvalidate.values()]; toInvalidate.clear();
    for (const k of all) void qc.invalidateQueries({ queryKey: k });
  }
}

type Update = [QueryKey, (old: never) => unknown];
export interface OptimisticOpts<V, R> {
  mutationFn: (vars: V) => Promise<R>;
  /** o que muda no cache já no clique */
  apply: (vars: V) => Update[];
  /** aplica a resposta do servidor (ex.: troca o id provisório pelo real) */
  onSuccess?: (res: R, vars: V) => void;
  onError?: (err: unknown, vars: V) => void;
  /** chaves recarregadas ao final (só as afetadas) */
  invalidate: (vars: V) => QueryKey[];
  /** aviso de sucesso (false = nenhum) */
  okMessage?: string | false | ((vars: V) => string | false);
  errorMessage?: string;
}

export function runOptimistic<V, R>(qc: QueryClient, o: OptimisticOpts<V, R>, vars: V): Promise<R> {
  inFlight++;
  const ups = o.apply(vars);
  const snaps = ups.map(([k]) => [k, qc.getQueryData(k)] as const);
  for (const [k] of ups) void qc.cancelQueries({ queryKey: k, exact: true });
  for (const [k, fn] of ups) qc.setQueryData(k, (old: unknown) => fn(old as never));
  const ok = typeof o.okMessage === 'function' ? o.okMessage(vars) : o.okMessage;
  return o.mutationFn(vars).then(
    (res) => {
      o.onSuccess?.(res, vars);
      if (ok !== false) toast.ok(ok ?? 'Salvo');
      settle(qc, o.invalidate(vars));
      return res;
    },
    (err) => {
      for (const [k, v] of snaps) qc.setQueryData(k, v);
      o.onError?.(err, vars);
      toast.error(err, o.errorMessage);
      settle(qc, o.invalidate(vars));
      throw err;
    },
  );
}

/** useMutation com o padrão otimista (onMutate → snapshot → setQueryData; erro → rollback + aviso; fim → invalida). */
export function useOptimistic<V, R>(o: OptimisticOpts<V, R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: V) => runOptimistic(qc, o, vars) });
}
