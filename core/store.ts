// "Banco de dados" em arquivos: leitura e escrita validadas pelos schemas.
// Todo acesso a companies/ (app, ferramentas, agentes via scripts) passa por aqui.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import {
  Project, TagsFile, Persona, Competitor, Snapshot, MarksFile, ItemMark, Note, Idea, Task,
  COMPANIES, P, STATUS,
} from '../schema';
import { parseMd, stringifyMd, parseSimple, stringifySimple } from './frontmatter';
import { slugify } from './platform';

export const ROOT = process.env.HUB_ROOT ?? process.cwd();
const abs = (p: string) => join(ROOT, p);
const rel = (p: string) => p.replace(`${ROOT}/`, '');

export class ValidationError extends Error {
  constructor(public file: string, public issues: string[]) { super(`${file}: ${issues.join('; ')}`); }
}
const fmtIssues = (e: z.ZodError) => e.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`);
function check<T extends z.ZodTypeAny>(schema: T, data: unknown, file: string): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) throw new ValidationError(file, fmtIssues(r.error));
  return r.data;
}

// Cache de leitura: arquivo já lido e não modificado (mesmo mtime e tamanho) não é lido nem validado de novo.
// Coletas são imutáveis, então depois da 1ª leitura custam ~0. Escritas por fora (agentes, editor) mudam o mtime e invalidam sozinhas.
const cache = new Map<string, { m: number; s: number; v: unknown }>();
function cached<T>(file: string, load: () => T): T {
  const st = statSync(abs(file));
  const hit = cache.get(file);
  if (hit && hit.m === st.mtimeMs && hit.s === st.size) return hit.v as T;
  const v = load();
  cache.set(file, { m: st.mtimeMs, s: st.size, v });
  return v;
}
export const cacheSize = () => cache.size;

const ensureDir = (p: string) => mkdirSync(abs(p), { recursive: true });
const write = (p: string, txt: string) => { mkdirSync(dirname(abs(p)), { recursive: true }); writeFileSync(abs(p), txt); };
const read = (p: string) => readFileSync(abs(p), 'utf8');
const exists = (p: string) => existsSync(abs(p));
const list = (p: string, re: RegExp) => (exists(p) ? readdirSync(abs(p)).filter((f) => re.test(f)).sort() : []);
export const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
export const today = () => new Date().toISOString().slice(0, 10);

function uniqueId(dir: string, base: string, ext = '.md') {
  let id = slugify(base), n = 2;
  while (exists(join(dir, `${id}${ext}`)) || exists(join(dir, id))) id = `${slugify(base)}-${n++}`;
  return id;
}

// ---------- Projetos ----------
export function listProjects(): Project[] {
  return readdirSync(abs(COMPANIES))
    .filter((d) => !d.startsWith('_') && statSync(abs(join(COMPANIES, d))).isDirectory())
    .map((slug) => getProject(slug));
}
export function getProject(slug: string): Project {
  const f = P.project(slug);
  if (!exists(f)) return check(Project, { slug, name: slug, created: today() }, f); // projeto antigo sem project.yml
  return check(Project, YAML.parse(read(f)), f);
}
export function saveProject(p: z.input<typeof Project>) {
  const v = check(Project, p, P.project(p.slug));
  write(P.project(v.slug), YAML.stringify(v));
  return v;
}
export function createProject(slug: string, name: string) {
  const dir = join(COMPANIES, slug);
  if (exists(dir)) throw new ValidationError(dir, ['projeto já existe']);
  cpSync(abs(join(COMPANIES, '_modelo')), abs(dir), { recursive: true });
  return saveProject({ slug, name, created: today() });
}

// ---------- Tags ----------
export const getTags = (slug: string) => (exists(P.tags(slug)) ? check(TagsFile, YAML.parse(read(P.tags(slug))), P.tags(slug)) : { tags: [] });
export const saveTags = (slug: string, t: unknown) => { const v = check(TagsFile, t, P.tags(slug)); write(P.tags(slug), YAML.stringify(v)); return v; };

// ---------- Markdown genérico com frontmatter YAML ----------
type Doc<T> = { data: T; body: string; file: string };
function readDoc<T extends z.ZodTypeAny>(schema: T, file: string): Doc<z.infer<T>> {
  return cached(file, () => { const { data, body } = parseMd(read(file)); return { data: check(schema, data, file), body, file }; });
}
function writeDoc<T extends z.ZodTypeAny>(schema: T, file: string, data: unknown, body: string) {
  const v = check(schema, data, file);
  write(file, stringifyMd(v as Record<string, unknown>, body));
  return { data: v as z.infer<T>, body, file };
}

// ---------- Personas ----------
export const listPersonas = (slug: string) => list(P.personas(slug), /\.md$/).map((f) => readDoc(Persona, join(P.personas(slug), f)));
export const getPersona = (slug: string, id: string) => readDoc(Persona, join(P.personas(slug), `${id}.md`));
export function savePersona(slug: string, data: z.input<typeof Persona>, body = '') {
  return writeDoc(Persona, join(P.personas(slug), `${data.id}.md`), { ...data, updated: today() }, body);
}
export const newPersonaId = (slug: string, name: string) => uniqueId(P.personas(slug), name);
export const deletePersona = (slug: string, id: string) => rmSync(abs(join(P.personas(slug), `${id}.md`)));

// ---------- Anotações ----------
export const listNotes = (slug: string) =>
  list(P.notes(slug), /\.md$/).map((f) => readDoc(Note, join(P.notes(slug), f)))
    .sort((a, b) => Number(b.data.pinned) - Number(a.data.pinned) || b.data.updated.localeCompare(a.data.updated));
export const getNote = (slug: string, id: string) => readDoc(Note, join(P.notes(slug), `${id}.md`));
export function saveNote(slug: string, data: Partial<z.input<typeof Note>> & { title: string }, body = '') {
  const id = data.id ?? uniqueId(P.notes(slug), data.title);
  const created = data.created ?? nowIso();
  return writeDoc(Note, join(P.notes(slug), `${id}.md`), { tags: [], pinned: false, ...data, id, created, updated: nowIso() }, body);
}
export const deleteNote = (slug: string, id: string) => rmSync(abs(join(P.notes(slug), `${id}.md`)));

// ---------- Ideias ----------
export const listIdeas = (slug: string) => list(P.ideas(slug), /^I-\d{4}.*\.md$/).map((f) => readDoc(Idea, join(P.ideas(slug), f)));
export function nextIdeaId(slug: string) {
  const n = Math.max(0, ...listIdeas(slug).map((d) => parseInt(d.data.id.slice(2), 10)));
  return `I-${String(n + 1).padStart(4, '0')}`;
}
export function saveIdea(slug: string, data: Partial<z.input<typeof Idea>> & { title: string }, body = '') {
  const id = data.id ?? nextIdeaId(slug);
  const existing = list(P.ideas(slug), new RegExp(`^${id}(-|\\.md)`))[0];
  const file = join(P.ideas(slug), existing ?? `${id}-${slugify(data.title)}.md`);
  return writeDoc(Idea, file, { status: 'nova', tags: [], created: today(), ...data, id }, body);
}

// ---------- Tarefas (formato simples, compatível com tools/lib/board.mjs) ----------
const TASK_ORDER = ['id', 'title', 'board', 'status', 'assignee', 'priority', 'due', 'depends', 'parent', 'links'];
export function listTasks(slug: string) {
  return list(P.board(slug), /^T-\d{4}.*\.md$/).map((f) => {
    const file = join(P.board(slug), f);
    return cached(file, () => { const { data, body } = parseSimple(read(file)); return { data: check(Task, data, file), body, file }; });
  });
}
export function nextTaskId(slug: string) {
  const n = Math.max(0, ...listTasks(slug).map((t) => parseInt(t.data.id.slice(2), 10)));
  return `T-${String(n + 1).padStart(4, '0')}`;
}
export function saveTask(slug: string, data: Partial<z.input<typeof Task>> & { title: string }, body?: string) {
  const id = data.id ?? nextTaskId(slug);
  const existing = list(P.board(slug), new RegExp(`^${id}(-|\\.md)`))[0];
  const file = join(P.board(slug), existing ?? `${id}-${slugify(data.title).split('-').slice(0, 5).join('-')}.md`);
  const prev = existing ? parseSimple(read(file)) : null;
  const merged = { board: 'conteudo', status: 'backlog', assignee: 'oliver', priority: 'media', depends: [], links: [], ...(prev?.data ?? {}), ...data, id };
  const v = check(Task, merged, file);
  const b = body ?? prev?.body ?? `\n${v.title}\n\n## Checklist\n\n## Log\n- ${today()} · criada pela interface\n`;
  write(file, stringifySimple({ ...v, due: v.due ?? '', parent: v.parent ?? '' }, b, TASK_ORDER));
  return { data: v, body: b, file };
}
export function moveTask(slug: string, id: string, status: (typeof STATUS)[number], who = 'oliver') {
  const t = listTasks(slug).find((x) => x.data.id === id);
  if (!t) throw new ValidationError(id, ['tarefa não encontrada']);
  const body = `${t.body.trimEnd()}\n- ${today()} · ${who} · ${t.data.status} → ${status}\n`;
  return saveTask(slug, { ...t.data, status }, /\n## Log\n/.test(t.body) ? body : `${t.body.trimEnd()}\n\n## Log\n- ${today()} · ${who} · ${t.data.status} → ${status}\n`);
}

/** Arquivar = mover para board/arquivo/ (fora do quadro e do heartbeat, sem apagar). */
export function archiveTask(slug: string, id: string, who = 'oliver') {
  const t = listTasks(slug).find((x) => x.data.id === id);
  if (!t) throw new ValidationError(id, ['tarefa não encontrada']);
  const dest = join(P.board(slug), 'arquivo', basename(t.file));
  write(dest, `${read(t.file).trimEnd()}\n- ${today()} · ${who} · arquivada\n`);
  rmSync(abs(t.file));
  return { file: dest };
}

// ---------- Concorrentes ----------
export const listCompetitors = (slug: string) =>
  (exists(P.competitors(slug)) ? readdirSync(abs(P.competitors(slug))) : [])
    .filter((id) => exists(P.competitorFile(slug, id)))
    .sort()
    .map((id) => readDoc(Competitor, P.competitorFile(slug, id)));
export const getCompetitor = (slug: string, id: string) => readDoc(Competitor, P.competitorFile(slug, id));
export function saveCompetitor(slug: string, data: Partial<z.input<typeof Competitor>> & { name: string }, body = '') {
  const id = data.id ?? uniqueId(P.competitors(slug), data.name, '');
  return writeDoc(Competitor, P.competitorFile(slug, id), { kind: 'concorrente', status: 'ativo', favorite: false, tags: [], profiles: [], created: today(), ...data, id }, body);
}
export const deleteCompetitor = (slug: string, id: string) => rmSync(abs(P.competitor(slug, id)), { recursive: true });

// ---------- Coletas (imutáveis: cada coleta = arquivo novo) ----------
export const profileKey = (platform: string, handleOrId: string) => `${platform}-${slugify(handleOrId)}`;
export function saveSnapshot(slug: string, compId: string, key: string, snap: z.input<typeof Snapshot>) {
  const v = check(Snapshot, snap, `${compId}/${key}`);
  const stamp = v.collectedAt.slice(0, 19).replace(/:/g, '-'); // AAAA-MM-DDTHH-mm-ss
  const file = join(P.snapshots(slug, compId), key, `${stamp}.json`);
  write(file, `${JSON.stringify(v, null, 2)}\n`);
  return { data: v, file };
}
export function listSnapshots(slug: string, compId: string) {
  const root = P.snapshots(slug, compId);
  if (!exists(root)) return [];
  return readdirSync(abs(root)).flatMap((key) =>
    list(join(root, key), /\.json$/).map((f) => {
      const file = join(root, key, f);
      return cached(file, () => ({ key, file, data: check(Snapshot, JSON.parse(read(file)), file) }));
    }),
  ).sort((a, b) => a.data.collectedAt.localeCompare(b.data.collectedAt));
}

/**
 * Coletas para a tela de detalhe sem carregar o histórico inteiro:
 * por perfil, as `full` mais recentes completas e até `max` anteriores "leves"
 * (só seguidores e views/curtidas por item, o que o gráfico e o histórico do item usam).
 */
export function listSnapshotsForView(slug: string, compId: string, { full = 2, max = 12 } = {}) {
  const all = listSnapshots(slug, compId);
  const byKey = new Map<string, typeof all>();
  for (const s of all) byKey.set(s.key, [...(byKey.get(s.key) ?? []), s]);
  const out: typeof all = [];
  for (const list of byKey.values()) {
    const keep = list.slice(-max);
    keep.forEach((s, i) => {
      if (i >= keep.length - full) return out.push(s);
      out.push({ ...s, data: { ...s.data, profile: { followers: s.data.profile.followers, links: [] }, items: s.data.items.map((it) => ({ id: it.id, url: it.url, type: it.type, metrics: { views: it.metrics.views, likes: it.metrics.likes } })) } as typeof s.data });
    });
  }
  return { snapshots: out.sort((a, b) => a.data.collectedAt.localeCompare(b.data.collectedAt)), snapshotsTotal: all.length };
}

// ---------- Marcações ----------
export const getMarks = (slug: string, compId: string) =>
  exists(P.marks(slug, compId)) ? { ...cached(P.marks(slug, compId), () => check(MarksFile, JSON.parse(read(P.marks(slug, compId))), P.marks(slug, compId))) } : {};
export function setMark(slug: string, compId: string, key: string, mark: Partial<z.input<typeof ItemMark>>) {
  const all = getMarks(slug, compId);
  all[key] = check(ItemMark, { ...(all[key] ?? {}), ...mark, updated: nowIso() }, `${P.marks(slug, compId)}#${key}`);
  write(P.marks(slug, compId), `${JSON.stringify(all, null, 2)}\n`);
  return all[key];
}

// ---------- Contexto (markdown livre) ----------
export const listContext = (slug: string) => list(P.context(slug), /\.md$/).map((f) => ({ name: f, file: join(P.context(slug), f) }));
export const getContext = (slug: string, name: string) => read(join(P.context(slug), basename(name)));
export const saveContext = (slug: string, name: string, txt: string) => write(join(P.context(slug), basename(name)), txt);

// ---------- Validação geral ----------
export function validateAll(): { file: string; issues: string[] }[] {
  const errors: { file: string; issues: string[] }[] = [];
  const tryIt = (fn: () => unknown) => {
    try { fn(); } catch (e) {
      if (e instanceof ValidationError) errors.push({ file: rel(e.file), issues: e.issues });
      else errors.push({ file: '?', issues: [String(e)] });
    }
  };
  for (const d of readdirSync(abs(COMPANIES)).filter((d) => !d.startsWith('_') && statSync(abs(join(COMPANIES, d))).isDirectory())) {
    tryIt(() => getProject(d));
    tryIt(() => getTags(d));
    for (const f of list(P.personas(d), /\.md$/)) tryIt(() => readDoc(Persona, join(P.personas(d), f)));
    for (const f of list(P.notes(d), /\.md$/)) tryIt(() => readDoc(Note, join(P.notes(d), f)));
    for (const f of list(P.ideas(d), /\.md$/)) tryIt(() => readDoc(Idea, join(P.ideas(d), f)));
    for (const f of list(P.board(d), /^T-.*\.md$/)) tryIt(() => { const file = join(P.board(d), f); check(Task, parseSimple(read(file)).data, file); });
    if (exists(P.competitors(d))) for (const id of readdirSync(abs(P.competitors(d)))) {
      tryIt(() => getCompetitor(d, id));
      tryIt(() => getMarks(d, id));
      tryIt(() => listSnapshots(d, id));
    }
  }
  return errors;
}
