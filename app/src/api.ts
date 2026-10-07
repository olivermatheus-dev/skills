// Cliente tipado da API local. Os tipos vêm dos mesmos schemas que validam os arquivos.
import type { Project, Persona, Note, Idea, Task, Competitor, Snapshot, ItemMark, TagDef } from '../../schema';
export type { Project, Persona, Note, Idea, Task, Competitor, Snapshot, ItemMark, TagDef };

export interface Doc<T> { data: T; body: string; file: string }
export interface SnapshotEntry { key: string; file: string; data: Snapshot }
export interface CompetitorFull extends Doc<Competitor> { snapshots: SnapshotEntry[]; marks: Record<string, ItemMark> }
export interface DetectedLink { platform: string; url: string; handle?: string; externalId?: string; kind: 'perfil' | 'conteudo' }

export class ApiError extends Error {
  constructor(public status: number, public payload: { error: string; file?: string; issues?: string[] }) {
    super(payload.issues?.length ? `${payload.error}: ${payload.issues.join('; ')}` : payload.error);
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({ error: r.statusText }));
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
  moveTask: (slug: string, id: string, status: Task['status']) => req<Doc<Task>>('POST', `${pj(slug)}/tasks/${id}/move`, { status }),

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

  contextList: (slug: string) => req<{ name: string; file: string }[]>('GET', `${pj(slug)}/context`),
  context: (slug: string, name: string) => req<{ name: string; text: string }>('GET', `${pj(slug)}/context/${encodeURIComponent(name)}`),
  saveContext: (slug: string, name: string, text: string) => req<null>('PUT', `${pj(slug)}/context/${encodeURIComponent(name)}`, { text }),
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

  validate: () => req<{ file: string; issues: string[] }[]>('GET', '/api/validate'),
};
