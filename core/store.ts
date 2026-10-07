// "Banco de dados" em arquivos: leitura e escrita validadas pelos schemas.
// Todo acesso a companies/ (app, ferramentas, agentes via scripts) passa por aqui.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import {
  Project, TagsFile, Persona, Competitor, Snapshot, MarksFile, ItemMark, Note, Idea, Task,
  AnalysisResult, AnalysisRequest, AnalysisNotes, ModuleId, MODULES, Review, Brand,
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

/** Desfazer o arquivamento: volta o arquivo de board/arquivo/ para o quadro. */
export function unarchiveTask(slug: string, id: string, who = 'oliver') {
  const dir = join(P.board(slug), 'arquivo');
  const f = list(dir, new RegExp(`^${id}(-|\\.md)`))[0];
  if (!f) throw new ValidationError(id, ['tarefa arquivada não encontrada']);
  if (listTasks(slug).some((t) => t.data.id === id)) throw new ValidationError(id, ['já existe uma tarefa ativa com esse id']);
  const dest = join(P.board(slug), f);
  write(dest, `${read(join(dir, f)).trimEnd()}\n- ${today()} · ${who} · desarquivada\n`);
  rmSync(abs(join(dir, f)));
  return listTasks(slug).find((t) => t.data.id === id)!;
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

// ---------- Análise por módulos (analysis/<modulo>.json, pedido.json, notas.json) ----------
const MODULE_IDS = MODULES.map((m) => m.id) as string[];
const aFile = (slug: string, id: string, name: string) => join(P.analysis(slug, id), `${name}.json`);
const readJson = <T extends z.ZodTypeAny>(schema: T, file: string): z.infer<T> => cached(file, () => check(schema, JSON.parse(read(file)), file));
const writeJson = (file: string, v: unknown) => write(file, `${JSON.stringify(v, null, 2)}\n`);

export function getAnalysisResults(slug: string, id: string) {
  const out: Partial<Record<ModuleId, AnalysisResult>> = {};
  for (const m of MODULE_IDS) if (exists(aFile(slug, id, m))) out[m as ModuleId] = readJson(AnalysisResult, aFile(slug, id, m));
  return out;
}
export const getAnalysisNotes = (slug: string, id: string): AnalysisNotes => (exists(aFile(slug, id, 'notas')) ? { ...readJson(AnalysisNotes, aFile(slug, id, 'notas')) } : {});
export const getAnalysisRequest = (slug: string, id: string): AnalysisRequest | null => (exists(aFile(slug, id, 'pedido')) ? readJson(AnalysisRequest, aFile(slug, id, 'pedido')) : null);
export const getAnalysis = (slug: string, id: string) => ({ results: getAnalysisResults(slug, id), notes: getAnalysisNotes(slug, id), request: getAnalysisRequest(slug, id) });

const normUrl = (u: string) => u.toLowerCase().replace(/^https?:\/\/(www\.|m\.)?/, '').replace(/\/+$/, '');
/** Grava o resultado de um módulo (validado). Efeitos: `atuacao` → market no competitor.md; `perfis` → soma os links novos aos perfis. */
export function saveAnalysisResult(slug: string, id: string, input: Omit<z.input<typeof AnalysisResult>, 'updatedAt'> & { updatedAt?: string }) {
  const file = aFile(slug, id, String(input.module));
  const v = check(AnalysisResult, { ...input, updatedAt: nowIso() }, file);
  writeJson(file, { ...v });
  const c = getCompetitor(slug, id);
  if (v.module === 'atuacao') {
    const market = (v.data as { market: Competitor['market'] }).market;
    if (market && market !== c.data.market) saveCompetitor(slug, { ...c.data, market }, c.body);
  }
  if (v.module === 'perfis') {
    const found = (v.data as { found: Competitor['profiles'] }).found;
    const have = new Set(c.data.profiles.map((p) => normUrl(p.url)));
    const add = found.filter((p) => !have.has(normUrl(p.url))).map(({ platform, url, handle }) => ({ platform, url, handle }));
    if (add.length) saveCompetitor(slug, { ...c.data, profiles: [...c.data.profiles, ...add] }, c.body);
  }
  return v;
}
export function setAnalysisNote(slug: string, id: string, key: string, text: string) {
  const all = getAnalysisNotes(slug, id);
  if (!text.trim()) delete all[key]; else all[key] = { text, updated: nowIso() };
  const v = check(AnalysisNotes, all, aFile(slug, id, 'notas'));
  writeJson(aFile(slug, id, 'notas'), v);
  return v;
}
/** Pede módulos (soma ao pedido que já estiver na fila). */
export function requestAnalysis(slug: string, id: string, r: { modules: string[]; force?: boolean; instructions?: string }) {
  getCompetitor(slug, id); // 404 claro se não existir
  const prev = getAnalysisRequest(slug, id);
  const modules = [...new Set([...(prev?.modules ?? []), ...r.modules])].filter((m) => MODULE_IDS.includes(m));
  const instructions = [prev?.instructions, r.instructions].filter((x) => x?.trim()).join('\n');
  const v = check(AnalysisRequest, { modules, requestedAt: nowIso(), force: !!(prev?.force || r.force), instructions, status: 'pendente' }, aFile(slug, id, 'pedido'));
  writeJson(aFile(slug, id, 'pedido'), v);
  return v;
}
/** Tira módulos do pedido (feitos ou cancelados). Sem `modules` = cancela tudo. Pedido vazio some. */
export function clearAnalysisRequest(slug: string, id: string, modules?: string[]) {
  const prev = getAnalysisRequest(slug, id);
  if (!prev) return null;
  const left = modules ? prev.modules.filter((m) => !modules.includes(m)) : [];
  if (!left.length) { rmSync(abs(aFile(slug, id, 'pedido'))); return null; }
  const v = { ...prev, modules: left };
  writeJson(aFile(slug, id, 'pedido'), v);
  return v;
}
export function setAnalysisRequestStatus(slug: string, id: string, status: AnalysisRequest['status']) {
  const prev = getAnalysisRequest(slug, id);
  if (!prev) return null;
  writeJson(aFile(slug, id, 'pedido'), { ...prev, status });
  return { ...prev, status };
}
/** Fila do projeto: concorrentes com pedido pendente. */
export const listAnalysisQueue = (slug: string) =>
  listCompetitors(slug).flatMap((c) => { const r = getAnalysisRequest(slug, c.data.id); return r ? [{ id: c.data.id, name: c.data.name, status: c.data.status, request: r }] : []; });

// ---------- Contexto (markdown livre) ----------
export const listContext = (slug: string) => list(P.context(slug), /\.md$/).map((f) => ({ name: f, file: join(P.context(slug), f) }));
export const getContext = (slug: string, name: string) => read(join(P.context(slug), basename(name)));
export const saveContext = (slug: string, name: string, txt: string) => write(join(P.context(slug), basename(name)), txt);

// ---------- Kit de marca (tarefa 024): brand.json → brand.css + bloco no BRAND.md ----------
const brandFile = (slug: string, f: string) => join(P.brand(slug), f);
/** kit da marca; sem brand.json, importa do brand.css (imported: true = ainda não salvo como JSON) */
export async function getBrand(slug: string) {
  const { cssToBrand } = await import('./brand');
  const { BRAND_PRESETS } = await import('./brand-presets');
  const json = brandFile(slug, 'brand.json'), css = brandFile(slug, 'brand.css');
  const fonts = list(brandFile(slug, 'fonts'), /\.(woff2|woff|ttf|otf|txt)$/i);
  if (exists(json)) return { brand: check(Brand, JSON.parse(read(json)), json), imported: false, fonts, presets: BRAND_PRESETS };
  if (exists(css)) {
    try { return { brand: cssToBrand(read(css)), imported: true, fonts, presets: BRAND_PRESETS }; }
    catch (e) { throw new ValidationError(css, [`não consegui importar o brand.css: ${e instanceof z.ZodError ? fmtIssues(e).join('; ') : String((e as Error).message)}`]); }
  }
  throw new ValidationError(css, ['sem brand.json e sem brand.css: rode a skill setup']);
}
/** grava brand.json, gera brand.css e atualiza o bloco do kit no BRAND.md */
export async function saveBrand(slug: string, data: unknown) {
  const { brandToCss, brandMdBlock, upsertBrandMd } = await import('./brand');
  const json = brandFile(slug, 'brand.json');
  const v = check(Brand, data, json);
  write(json, `${JSON.stringify(v, null, 2)}\n`);
  write(brandFile(slug, 'brand.css'), brandToCss(v));
  const md = brandFile(slug, 'BRAND.md');
  write(md, upsertBrandMd(exists(md) ? read(md) : `# Marca — ${slug}\n`, brandMdBlock(v)));
  return getBrand(slug);
}
/** fonte enviada pelo app → brand/fonts/<nome> (não sobrescreve: devolve o nome final) */
export function uploadBrandFont(slug: string, name: string, base64: string) {
  const ext = name.match(/\.(woff2|woff|ttf|otf|txt)$/i)?.[1]?.toLowerCase();
  if (!ext) throw new ValidationError(name, ['envie .woff2, .woff, .ttf, .otf (ou a licença .txt)']);
  const base = slugify(name.replace(/\.[^.]+$/, '')) || 'fonte';
  let f = `${base}.${ext}`, n = 2;
  while (exists(brandFile(slug, `fonts/${f}`))) f = `${base}-${n++}.${ext}`;
  ensureDir(brandFile(slug, 'fonts'));
  writeFileSync(abs(brandFile(slug, `fonts/${f}`)), Buffer.from(base64, 'base64'));
  return { file: `fonts/${f}` };
}
/** brand.css igual ao gerado pelo brand.json? (null = sem brand.json) */
export async function brandInSync(slug: string) {
  const json = brandFile(slug, 'brand.json');
  if (!exists(json)) return null;
  const { brandToCss } = await import('./brand');
  const css = brandFile(slug, 'brand.css');
  return exists(css) && read(css).replace(/\r\n/g, '\n') === brandToCss(check(Brand, JSON.parse(read(json)), json));
}

// ---------- Peças (vídeos, carrosséis, roteiros) e revisão por anotações (tarefa 022) ----------
export type PieceKind = 'video' | 'carrossel' | 'roteiro';
export interface Piece {
  path: string; kind: PieceKind; hasTimeline: boolean; videos: string[]; texts: string[];
  status?: Review['status']; approvals?: Review['approvals']; openComments: number; totalComments: number;
}
const contentsDir = (slug: string) => join(COMPANIES, slug, 'contents');
/** caminho da peça relativo a contents/ (ex.: "2026-10-07-ab-sessao/B-sonnet"); recusa "..", absolutos e barras invertidas */
function piecePath(slug: string, path: string) {
  if (!path || /(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(path)) throw new ValidationError(path, ['caminho da peça inválido']);
  return join(contentsDir(slug), path);
}
const videosOf = (dir: string) => list(join(dir, 'exports'), /\.mp4$/i).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
/** textos anotáveis da peça: .md/.txt na raiz da pasta, roteiro primeiro */
const TEXT_FIRST = ['roteiro.md', 'legenda.md', 'plano.md'];
const textsOf = (dir: string) => list(dir, /^[\w.-]+\.(md|txt)$/i).sort((a, b) => {
  const ia = TEXT_FIRST.indexOf(a), ib = TEXT_FIRST.indexOf(b);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
});
const SKIP_DIRS = ['exports', 'render', 'audio', 'png', 'input', 'assets', 'node_modules'];
function pieceKind(dir: string, videos: string[], hasTimeline: boolean): PieceKind | null {
  if (videos.length || hasTimeline || exists(join(dir, 'composition.html'))) return 'video';
  if (exists(join(dir, 'carrossel.html')) || exists(join(dir, 'png'))) return 'carrossel';
  if (textsOf(dir).length || exists(join(dir, 'revisao.json'))) return 'roteiro';
  return null;
}
export function listPieces(slug: string): Piece[] {
  const out: Piece[] = [];
  const walk = (rel: string, depth: number) => {
    const dir = join(contentsDir(slug), rel);
    const videos = videosOf(dir), hasTimeline = exists(join(dir, 'timeline.json'));
    const kind = rel ? pieceKind(dir, videos, hasTimeline) : null;
    if (kind) {
      const path = rel.replace(/\\/g, '/'); // no Windows o join usa "\": o caminho da peça é sempre com "/"
      let r: Review = { comments: [] };
      try { r = getReview(slug, path); } catch { /* arquivo inválido: aparece no npm run validate */ }
      out.push({ path, kind, hasTimeline, videos, texts: textsOf(dir), status: r.status, approvals: r.approvals,
        openComments: r.comments.filter((c) => c.status === 'aberto').length, totalComments: r.comments.length });
    }
    if (depth < 3) for (const d of exists(dir) ? readdirSync(abs(dir)) : []) {
      if (SKIP_DIRS.includes(d) || d.startsWith('qc') || d.startsWith('.')) continue;
      if (statSync(abs(join(dir, d))).isDirectory()) walk(join(rel, d), depth + 1);
    }
  };
  if (exists(contentsDir(slug))) walk('', 0);
  return out.sort((a, b) => b.path.localeCompare(a.path));
}
export function getPiece(slug: string, path: string) {
  const dir = piecePath(slug, path);
  if (!exists(dir)) throw new ValidationError(dir, ['peça não encontrada']);
  const tl = join(dir, 'timeline.json');
  // previews = pastas render/<formato>/ com index.html (composição montada): a UI renderiza ao vivo para clicar no elemento
  const previews = exists(join(dir, 'render')) ? readdirSync(abs(join(dir, 'render'))).filter((d) => exists(join(dir, 'render', d, 'index.html'))) : [];
  const videos = videosOf(dir), hasTimeline = exists(tl);
  return { path, kind: pieceKind(dir, videos, hasTimeline) ?? 'roteiro', timeline: hasTimeline ? JSON.parse(read(tl)) : null, videos, texts: textsOf(dir), previews, review: getReview(slug, path) };
}
const textFile = (slug: string, path: string, file: string) => {
  if (!/^[\w.-]+\.(md|txt)$/i.test(file)) throw new ValidationError(file, ['só .md/.txt na raiz da peça']);
  return join(piecePath(slug, path), file);
};
export function getPieceText(slug: string, path: string, file: string) {
  const f = textFile(slug, path, file);
  if (!exists(f)) throw new ValidationError(f, ['arquivo não encontrado']);
  return { file, text: read(f) };
}
export function savePieceText(slug: string, path: string, file: string, text: string) {
  const f = textFile(slug, path, file);
  if (!exists(piecePath(slug, path))) throw new ValidationError(f, ['peça não encontrada']);
  write(f, text.endsWith('\n') ? text : `${text}\n`);
  return { file, text: read(f) };
}

/**
 * Novo conteúdo a partir de um roteiro pronto (colado ou enviado): cria contents/AAAA-MM-DD-<tema>/roteiro.md
 * e, se pedido, a tarefa no quadro para a IA produzir a peça a partir dele.
 */
export async function createPiece(slug: string, input: { title: string; text?: string; upload?: { name: string; base64: string }; format?: string; notes?: string; task?: boolean }) {
  const title = input.title?.trim();
  if (!title) throw new ValidationError('contents', ['dê um nome ao conteúdo']);
  let text = input.text ?? '';
  if (input.upload) {
    const buf = Buffer.from(input.upload.base64, 'base64');
    if (/\.docx$/i.test(input.upload.name)) {
      const { docxToText } = await import('./docx');
      const t = docxToText(buf);
      if (t == null) throw new ValidationError(input.upload.name, ['não consegui ler o .docx (salve de novo no Word ou cole o texto)']);
      text = t;
    } else if (/\.(md|txt|markdown)$/i.test(input.upload.name)) text = buf.toString('utf8').replace(/^﻿/, '');
    else throw new ValidationError(input.upload.name, ['envie .md, .txt ou .docx']);
  }
  text = text.replace(/\r\n/g, '\n').trim();
  if (!text) throw new ValidationError('roteiro.md', ['o roteiro está vazio']);
  if (!/^#\s/m.test(text.split('\n').slice(0, 3).join('\n'))) text = `# ${title}\n\n${text}`;
  const base = `${today()}-${slugify(title).split('-').slice(0, 6).join('-')}`;
  let rel = base, n = 2;
  while (exists(join(contentsDir(slug), rel))) rel = `${base}-${n++}`;
  write(join(contentsDir(slug), rel, 'roteiro.md'), `${text}\n`);
  saveReview(slug, rel, { status: 'rascunho', comments: [] });
  let task: z.infer<typeof Task> | undefined;
  if (input.task) {
    const fmt = input.format?.trim();
    const body = [
      '', `Produzir ${fmt ? `um(a) **${fmt}**` : 'a peça'} a partir do roteiro pronto do Oliver: \`contents/${rel}/roteiro.md\`.`,
      `O roteiro é a fonte: não mudar o sentido. Antes de produzir, ler e resolver as anotações abertas: \`node tools/review.mjs companies/${slug}/contents/${rel}\`.`,
      ...(input.notes?.trim() ? ['', `Observações do Oliver: ${input.notes.trim()}`] : []),
      '', '## Checklist', '- [ ] resolver as anotações abertas do roteiro (se houver)', '- [ ] escolher o formato `fmt-*` e produzir na pasta da peça', '- [ ] revisor', '',
      '## Log', `- ${today()} · criada pela interface (roteiro pronto)`, '',
    ].join('\n');
    task = saveTask(slug, { title: `Produzir a partir do roteiro: ${title}`, board: 'conteudo', status: 'todo', assignee: 'ai', links: [`contents/${rel}/roteiro.md`] }, body).data;
  }
  return { path: rel, task };
}
export function getReview(slug: string, path: string): Review {
  const f = join(piecePath(slug, path), 'revisao.json');
  if (!exists(f)) return { comments: [] };
  return cached(f, () => check(Review, JSON.parse(read(f)), f));
}
export function saveReview(slug: string, path: string, data: unknown): Review {
  const f = join(piecePath(slug, path), 'revisao.json');
  const v = check(Review, data, f);
  write(f, `${JSON.stringify(v, null, 2)}
`);
  return v;
}
/** arquivo servido ao player (somente dentro da peça); null se não existir */
export const pieceFile = (slug: string, path: string, file: string) => {
  if (/(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(file)) return null;
  const f = join(ROOT, piecePath(slug, path), file);
  return existsSync(f) ? f : null;
};

// ---------- Validação geral ----------
export function validateAll():{ file: string; issues: string[] }[] {
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
    if (exists(join(P.brand(d), 'brand.json'))) tryIt(() => check(Brand, JSON.parse(read(join(P.brand(d), 'brand.json'))), join(P.brand(d), 'brand.json')));
    for (const f of list(P.personas(d), /\.md$/)) tryIt(() => readDoc(Persona, join(P.personas(d), f)));
    for (const f of list(P.notes(d), /\.md$/)) tryIt(() => readDoc(Note, join(P.notes(d), f)));
    for (const f of list(P.ideas(d), /\.md$/)) tryIt(() => readDoc(Idea, join(P.ideas(d), f)));
    for (const f of list(P.board(d), /^T-.*\.md$/)) tryIt(() => { const file = join(P.board(d), f); check(Task, parseSimple(read(file)).data, file); });
    for (const pc of listPieces(d)) if (exists(join(contentsDir(d), pc.path, 'revisao.json'))) tryIt(() => getReview(d, pc.path));
    if (exists(P.competitors(d))) for (const id of readdirSync(abs(P.competitors(d)))) {
      tryIt(() => getCompetitor(d, id));
      tryIt(() => getMarks(d, id));
      tryIt(() => listSnapshots(d, id));
      if (exists(P.competitorFile(d, id))) {
        tryIt(() => getAnalysisResults(d, id));
        tryIt(() => getAnalysisNotes(d, id));
        tryIt(() => getAnalysisRequest(d, id));
      }
    }
  }
  return errors;
}
