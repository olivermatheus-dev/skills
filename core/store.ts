// "Banco de dados" em arquivos: leitura e escrita validadas pelos schemas.
// Todo acesso a companies/ (app, ferramentas, agentes via scripts) passa por aqui.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, copyFileSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import YAML from 'yaml';
import { z } from 'zod';
import {
  Project, TagsFile, Persona, Competitor, Snapshot, MarksFile, ItemMark, AdsMarks, AdMark, aplicarMarca, marcaVazia, adKey, type AdMarkPatch, Note, Idea, Task,
  AnalysisResult, AnalysisRequest, AdsSnapshot, AnalysisNotes, ModuleId, MODULES, Review, Brand, PieceMeta,
  Capture, Mockup, MockupBrand, Format, Matrix, EMPTY_MATRIX, Gaps, type CellStatus, company, FormatExample, COMPANIES, FORMATS, P, STATUS,
  splitTaskBody, joinTaskBody, nowStamp, COMMENT_KINDS, type CommentKind,
  CuratedSource, SourceList, SourceStatus, SourceRef, ResearchRequest, ResearchResult,
} from '../schema';
import { parseMd, stringifyMd, parseSimple, stringifySimple } from './frontmatter';
import { slugify } from './platform';
import * as PC from '../tools/lib/pecas.mjs';

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
const TASK_ORDER = ['id', 'title', 'board', 'status', 'assignee', 'priority', 'due', 'depends', 'parent', 'recurring', 'links', 'context'];
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
  const merged = { board: 'conteudo', status: 'backlog', assignee: 'oliver', priority: 'media', depends: [], links: [], context: [], ...(prev?.data ?? {}), ...data, id };
  const v = check(Task, merged, file);
  const b = body ?? prev?.body ?? `\n## Checklist\n\n## Log\n- ${today()} · criada pela interface\n`;
  const { recurring, ...rest } = v;
  write(file, stringifySimple({ ...rest, due: v.due ?? '', parent: v.parent ?? '', ...(recurring ? { recurring } : {}) }, b, TASK_ORDER));
  return { data: v, body: b, file };
}
export function moveTask(slug: string, id: string, status: (typeof STATUS)[number], who = 'oliver') {
  const t = listTasks(slug).find((x) => x.data.id === id);
  if (!t) throw new ValidationError(id, ['tarefa não encontrada']);
  const body = `${t.body.trimEnd()}\n- ${today()} · ${who} · ${t.data.status} → ${status}\n`;
  return saveTask(slug, { ...t.data, status }, /\n## Log\n/.test(t.body) ? body : `${t.body.trimEnd()}\n\n## Log\n- ${today()} · ${who} · ${t.data.status} → ${status}\n`);
}

/** Comentário no card (Oliver ou IA). Opcional: no mesmo gesto mudar status/responsável (ex.: "devolver à IA"). */
export function commentTask(slug: string, id: string, input: { text: string; who?: string; kind?: CommentKind; status?: (typeof STATUS)[number]; assignee?: string }) {
  const t = listTasks(slug).find((x) => x.data.id === id);
  if (!t) throw new ValidationError(id, ['tarefa não encontrada']);
  const text = String(input.text ?? '').trim();
  const kind = input.kind ?? 'nota';
  if (!text) throw new ValidationError(id, ['comentário vazio']);
  if (!COMMENT_KINDS.includes(kind)) throw new ValidationError(id, [`tipo inválido: ${kind}`]);
  const who = input.who ?? 'oliver';
  const parts = splitTaskBody(t.body);
  parts.comments.push({ at: nowStamp(), who, kind, text });
  const data = { ...t.data, ...(input.status ? { status: input.status } : {}), ...(input.assignee ? { assignee: input.assignee } : {}) };
  const moves = [input.status && input.status !== t.data.status && `${t.data.status} → ${input.status}`, input.assignee && input.assignee !== t.data.assignee && `para ${input.assignee}`].filter(Boolean);
  if (moves.length) parts.log.push(`${today()} · ${who} · ${moves.join(' · ')}`);
  return saveTask(slug, data, joinTaskBody(parts));
}

/** Agentes (.claude/agents/*.md): nome, cor (campo color do Claude Code) e descrição — para o app mostrar quem é quem. */
export function listAgents() {
  return list('.claude/agents', /\.md$/).map((f) => {
    const { data } = parseSimple(read(join('.claude/agents', f)));
    return { name: String(data.name ?? f.replace(/\.md$/, '')), color: data.color ? String(data.color) : null, description: String(data.description ?? '') };
  });
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

// ---------- Peças (vídeos, carrosséis, posts, roteiros): ficha (peca.json) e revisão por anotações (tarefa 022) ----------
export type PieceKind = PieceMeta['kind'] & string;
export interface PieceCover { type: 'video' | 'image'; file: string }
export interface Piece {
  /** id: V0012 (050) · teste: peça em contents/_testes/ (fora da lista principal) · familia: tentativas do mesmo conteúdo */
  id?: string; teste?: boolean; familia?: string;
  path: string; kind: PieceKind; title: string; date?: string; hasTimeline: boolean; videos: string[]; images: string[]; texts: string[];
  cover?: PieceCover; tags: string[]; favorite: boolean; archived: boolean; publication?: PieceMeta['publication'];
  status?: Review['status']; approvals?: Review['approvals']; openComments: number; totalComments: number; mtime: number;
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
const imagesOf = (dir: string) => list(join(dir, 'png'), /\.(png|jpe?g|webp)$/i).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const SKIP_DIRS = ['exports', 'render', 'audio', 'png', 'input', 'assets', 'node_modules'];
function pieceKind(dir: string, videos: string[], hasTimeline: boolean, images: string[]): PieceKind | null {
  if (videos.length || hasTimeline || exists(join(dir, 'composition.html'))) return 'video';
  if (exists(join(dir, 'mockup.json'))) return 'mockup';
  if (exists(join(dir, 'post.html'))) return 'post';
  if (exists(join(dir, 'carrossel.html')) || images.length > 1) return 'carrossel';
  if (images.length === 1) return 'post';
  if (textsOf(dir).length || exists(join(dir, 'revisao.json')) || exists(join(dir, 'peca.json'))) return 'roteiro';
  return null;
}
/** nome padrão de uma peça sem ficha: pastas sem a data nem o ID, "ab sessao · A opus" */
const defaultTitle = (path: string) => path.split('/').filter((s) => s !== PC.TESTES).map((s) => s.replace(/^\d{4}-\d{2}-\d{2}-?/, '').replace(PC.ID_RE, '').replace(/-/g, ' ').trim()).filter(Boolean).join(' · ') || path;
function coverOf(kind: PieceKind, videos: string[], images: string[], principal?: string): PieceCover | undefined {
  if (principal && (videos.includes(principal.replace(/^exports\//, '')) || images.includes(principal.replace(/^png\//, ''))))
    return { type: principal.startsWith('exports/') ? 'video' : 'image', file: principal };
  if (kind === 'video' && videos.length) return { type: 'video', file: `exports/${videos[videos.length - 1]}` };
  if (images.length) return { type: 'image', file: `png/${images[0]}` };
  return undefined;
}
export function getPieceMeta(slug: string, path: string): PieceMeta {
  const f = join(piecePath(slug, path), 'peca.json');
  return exists(f) ? readJson(PieceMeta, f) : PieceMeta.parse({});
}
/** grava a ficha (merge raso; notes e publication são mesclados campo a campo) */
export function savePieceMeta(slug: string, path: string, patch: Partial<PieceMeta>): PieceMeta {
  const dir = piecePath(slug, path);
  if (!exists(dir)) throw new ValidationError(dir, ['peça não encontrada']);
  const cur = getPieceMeta(slug, path);
  // campo vazio ("") apaga: na publicação (data/link validados) e no principal/título
  const pub = patch.publication === undefined ? cur.publication : Object.fromEntries(Object.entries({ ...cur.publication, ...patch.publication }).filter(([, v]) => v !== ''));
  const next = { ...cur, ...patch, notes: { ...cur.notes, ...patch.notes }, publication: pub && Object.keys(pub).length ? pub : undefined, updatedAt: nowIso() };
  for (const k of ['title', 'principal', 'formato'] as const) if (next[k] === '') delete next[k];
  const f = join(dir, 'peca.json');
  const v = check(PieceMeta, JSON.parse(JSON.stringify(next)), f); // JSON: tira os undefined
  writeJson(f, v);
  return v;
}
function pieceSummary(slug: string, rel: string): Piece | null {
  const dir = join(contentsDir(slug), rel);
  const videos = videosOf(dir), images = imagesOf(dir), hasTimeline = exists(join(dir, 'timeline.json'));
  const path = rel.replace(/\\/g, '/'); // no Windows o join usa "\": o caminho da peça é sempre com "/"
  let meta: PieceMeta = PieceMeta.parse({});
  try { meta = getPieceMeta(slug, path); } catch { /* ficha inválida: aparece no npm run validate */ }
  const kind = meta.kind ?? pieceKind(dir, videos, hasTimeline, images);
  if (!kind) return null;
  let r: Review = { comments: [] };
  try { r = getReview(slug, path); } catch { /* arquivo inválido: aparece no npm run validate */ }
  const mtime = Math.max(statSync(abs(dir)).mtimeMs, ...['exports', 'png', 'peca.json', 'revisao.json'].filter((f) => exists(join(dir, f))).map((f) => statSync(abs(join(dir, f))).mtimeMs));
  const testePath = path.startsWith(`${PC.TESTES}/`);
  return {
    id: meta.id ?? PC.idDaPasta(path.split('/')[0]) ?? undefined, ...(testePath && { teste: true }), ...(meta.familia && { familia: meta.familia }),
    path, kind, title: meta.title ?? defaultTitle(path), date: meta.criado ?? path.replace(`${PC.TESTES}/`, '').match(/^(\d{4}-\d{2}-\d{2})/)?.[1], hasTimeline, videos, images, texts: textsOf(dir),
    cover: coverOf(kind, videos, images, meta.principal), tags: meta.tags, favorite: !!meta.favorite, archived: !!meta.archived, publication: meta.publication,
    status: r.status, approvals: r.approvals, openComments: r.comments.filter((c) => c.status === 'aberto').length, totalComments: r.comments.length, mtime,
  };
}
export function listPieces(slug: string): Piece[] {
  const out: Piece[] = [];
  const walk = (rel: string, depth: number) => {
    const dir = join(contentsDir(slug), rel);
    const pc = rel ? pieceSummary(slug, rel) : null;
    if (pc) out.push(pc);
    if (depth < 3) for (const d of exists(dir) ? readdirSync(abs(dir)) : []) {
      if (SKIP_DIRS.includes(d) || d.startsWith('qc') || d.startsWith('.')) continue;
      // variantes de um projeto de vídeo (045) aparecem na aba Variantes da peça, não soltas na lista
      if (d === 'variantes' && exists(join(dir, 'projeto.json'))) continue;
      if (statSync(abs(join(dir, d))).isDirectory()) walk(join(rel, d), depth + 1);
    }
  };
  if (exists(contentsDir(slug))) walk('', 0);
  // mais nova primeiro pela data de criação (o nome da pasta começa pelo ID, não pela data); empate: o ID/pasta maior
  return out.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.path.localeCompare(a.path, 'en', { numeric: true }));
}
export function getPiece(slug: string, path: string) {
  const dir = piecePath(slug, path);
  if (!exists(dir)) throw new ValidationError(dir, ['peça não encontrada']);
  const tl = join(dir, 'timeline.json');
  // previews = pastas render/<formato>/ com index.html (composição montada): a UI renderiza ao vivo para clicar no elemento
  const previews = exists(join(dir, 'render')) ? readdirSync(abs(join(dir, 'render'))).filter((d) => exists(join(dir, 'render', d, 'index.html'))) : [];
  const summary = pieceSummary(slug, path) ?? emptyPiece(path);
  // projeto de vídeo com variantes (045 D): a peça ganha a aba Variantes; a pasta de uma variante sabe de quem ela é
  const vm = path.match(/^(.+)\/variantes\/([\w-]+)$/);
  const variante = vm && exists(join(contentsDir(slug), vm[1], 'projeto.json')) ? { projeto: vm[1], id: vm[2] } : undefined;
  return { ...summary, timeline: exists(tl) ? JSON.parse(read(tl)) : null, previews, review: getReview(slug, path), meta: getPieceMeta(slug, path), projeto: exists(join(dir, 'projeto.json')), variante };
}
const emptyPiece = (path: string): Piece => ({ path, kind: 'roteiro', title: defaultTitle(path), hasTimeline: false, videos: [], images: [], texts: [], tags: [], favorite: false, archived: false, openComments: 0, totalComments: 0, mtime: 0 });
/** caminho absoluto de um arquivo da peça (ou da própria pasta, file vazio), para abrir no Explorer/player */
export function pieceAbsPath(slug: string, path: string, file = '') {
  const dir = piecePath(slug, path);
  if (file && /(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(file)) throw new ValidationError(file, ['arquivo inválido']);
  const f = file ? join(dir, file) : dir;
  if (!exists(f)) throw new ValidationError(f, ['arquivo não encontrado']);
  return abs(f);
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
 * Novo conteúdo: a partir de um roteiro pronto (colado ou enviado) → contents/<ID>-<tema>/roteiro.md,
 * ou só com um formato da galeria + o pedido ("quero um X sobre Y") → briefing.md, para a IA escrever o roteiro.
 * O formato escolhido fica na ficha (peca.json → formato) e, se pedido, vira a tarefa no quadro para a IA produzir.
 */
export async function createPiece(slug: string, input: { title: string; text?: string; upload?: { name: string; base64: string }; formato?: string; format?: string; notes?: string; task?: boolean }) {
  const title = input.title?.trim();
  if (!title) throw new ValidationError('contents', ['dê um nome ao conteúdo']);
  const fmt = input.formato ? getFormatRaw(input.formato) : undefined;
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
  if (!text && !fmt) throw new ValidationError('roteiro.md', ['o roteiro está vazio (ou escolha um formato para a IA escrever)']);
  const hasScript = !!text;
  // pasta com ID (050): o tipo sai do formato (vídeo V, carrossel C, post P); sem formato é roteiro (R)
  const { id, pasta: rel } = PC.novaPasta(slug, PC.tipoDoFormato(fmt?.id), title);
  if (hasScript) {
    if (!/^#\s/m.test(text.split('\n').slice(0, 3).join('\n'))) text = `# ${title}\n\n${text}`;
    write(join(contentsDir(slug), rel, 'roteiro.md'), `${text}\n`);
  } else {
    write(join(contentsDir(slug), rel, 'briefing.md'), [`# ${title}`, '', `**Formato:** ${fmt!.nome} (\`${fmt!.skill ?? `library/formatos/${fmt!.id}`}\`)`, '', '## Pedido', input.notes?.trim() || '(o nome acima é o pedido)', ''].join('\n'));
  }
  saveReview(slug, rel, { status: 'rascunho', comments: [] });
  savePieceMeta(slug, rel, { id, criado: today(), title, ...(fmt && { formato: fmt.id }) });
  let task: z.infer<typeof Task> | undefined;
  if (input.task) {
    const fmtLine = fmt
      ? `Formato: **${fmt.nome}** → ${fmt.skill ? `carregar a skill \`${fmt.skill}\`` : `verbete rascunho (sem skill): seguir a essência e a estrutura`} e ler as observações do Oliver em \`library/formatos/${fmt.id}/formato.json\` (mandam sobre a skill).`
      : input.format?.trim() ? `Formato pedido: **${input.format.trim()}**.` : 'Formato: escolher o `fmt-*` pela galeria (`library/formatos/`).';
    const body = [
      '', hasScript
        ? `Produzir a peça a partir do roteiro pronto do Oliver: \`contents/${rel}/roteiro.md\`. O roteiro é a fonte: não mudar o sentido.`
        : `Escrever o roteiro (skill \`ig-post\`) e produzir a peça a partir do pedido em \`contents/${rel}/briefing.md\`; roteiro vai para aprovação antes da produção.`,
      fmtLine,
      `Antes de produzir, ler e resolver as anotações abertas: \`node tools/review.mjs companies/${slug}/contents/${rel}\`.`,
      ...(input.notes?.trim() && hasScript ? ['', `Observações do Oliver: ${input.notes.trim()}`] : []),
      '', '## Checklist',
      ...(hasScript ? ['- [ ] resolver as anotações abertas do roteiro (se houver)'] : ['- [ ] roteiro em `roteiro.md` → aprovação do Oliver']),
      `- [ ] produzir no formato ${fmt ? fmt.nome : '`fmt-*` escolhido'} na pasta da peça`, '- [ ] revisor', '',
      '## Log', `- ${today()} · criada pela interface (${hasScript ? 'roteiro pronto' : `formato ${fmt!.nome}`})`, '',
    ].join('\n');
    const links = [`contents/${rel}/${hasScript ? 'roteiro.md' : 'briefing.md'}`, ...(fmt ? [`library/formatos/${fmt.id}/formato.json`] : [])];
    task = saveTask(slug, { title: `${hasScript ? 'Produzir a partir do roteiro' : `${fmt!.nome}`}: ${title}`, board: 'conteudo', status: 'todo', assignee: 'ai', links }, body).data;
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
  // a IA pode ter respondido enquanto a tela estava aberta (Pedir ajustes, 046 D): a resposta do disco não some com o salvar
  // de uma tela que ainda não a viu (sem `reply` no que chegou = a tela não viu; reabrir mantém o reply, então não cai aqui)
  if (exists(f)) {
    const disco = new Map(getReview(slug, path).comments.map((c) => [c.id, c]));
    v.comments = v.comments.map((c) => { const d = disco.get(c.id); return d?.reply && !c.reply ? { ...c, status: d.status, reply: d.reply, replyAt: d.replyAt, resolvedAt: d.resolvedAt } : c; });
  }
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

// ---------- Galeria de formatos (tarefa 027): library/formatos/<id>/formato.json, global ----------
const formatDir = (id: string) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new ValidationError(id, ['formato inválido']);
  return join(FORMATS, id);
};
const formatJson = (id: string) => join(formatDir(id), 'formato.json');
/** peça feita com o formato (peca.json → formato), em qualquer empresa */
export interface FormatUse { empresa: string; peca: string; title: string; cover?: PieceCover; status?: Review['status'] }
export interface FormatExampleInfo extends FormatExample { title: string; cover?: PieceCover; missing?: boolean }
export interface FormatInfo extends Omit<Format, 'exemplos'> { exemplos: FormatExampleInfo[]; skillOk: boolean; usos: FormatUse[] }
const companySlugs = () => (exists(COMPANIES) ? readdirSync(abs(COMPANIES)).filter((d) => !d.startsWith('_') && statSync(abs(join(COMPANIES, d))).isDirectory()) : []);
function formatUses(): Map<string, FormatUse[]> {
  const out = new Map<string, FormatUse[]>();
  for (const empresa of companySlugs()) for (const p of listPieces(empresa)) {
    if (p.archived) continue;
    let f: string | undefined;
    try { f = getPieceMeta(empresa, p.path).formato; } catch { /* ficha inválida: aparece no validate */ }
    if (f) out.set(f, [...(out.get(f) ?? []), { empresa, peca: p.path, title: p.title, cover: p.cover, status: p.status }]);
  }
  return out;
}
/** exemplo com capa e nome da peça (o arquivo escolhido ou o principal); peça apagada → missing */
function exampleInfo(e: FormatExample): FormatExampleInfo {
  let pc: Piece | null = null;
  try { pc = pieceSummary(e.empresa, e.peca); } catch { /* caminho inválido */ }
  if (!pc) return { ...e, title: e.peca, missing: true };
  const file = e.arquivo && pieceFile(e.empresa, e.peca, e.arquivo) ? e.arquivo : undefined;
  return { ...e, title: pc.title, cover: file ? { type: file.startsWith('exports/') ? 'video' : 'image', file } : pc.cover };
}
const withInfo = (f: Format, uses: Map<string, FormatUse[]>): FormatInfo => ({
  ...f, exemplos: f.exemplos.map(exampleInfo),
  skillOk: !!f.skill && exists(join('.claude', 'skills', f.skill, 'SKILL.md')), usos: uses.get(f.id) ?? [],
});
export const getFormatRaw = (id: string): Format => {
  if (!exists(formatJson(id))) throw new ValidationError(formatJson(id), ['formato não encontrado']);
  return readJson(Format, formatJson(id));
};
export function listFormats(): FormatInfo[] {
  const uses = formatUses();
  return list(FORMATS, /^[a-z0-9][a-z0-9-]*$/).filter((d) => exists(join(FORMATS, d, 'formato.json')))
    .map((d) => withInfo(getFormatRaw(d), uses))
    .sort((a, b) => Number(b.status === 'ativo') - Number(a.status === 'ativo') || a.nome.localeCompare(b.nome, 'pt-BR'));
}
export const getFormat = (id: string) => withInfo(getFormatRaw(id), formatUses());
function writeFormat(f: Format) {
  const v = check(Format, JSON.parse(JSON.stringify({ ...f, updatedAt: nowIso() })), formatJson(f.id));
  writeJson(formatJson(f.id), v);
  return v;
}
/** campos que o app edita (estrutura e skill mudam junto com a skill fmt-*) */
const FORMAT_EDITABLE = ['nome', 'status', 'essencia', 'tipos', 'funil', 'canais', 'proporcoes', 'tamanho', 'quandoUsar', 'quandoNaoUsar', 'variacoes', 'observacoes', 'nota'] as const;
export function saveFormat(id: string, patch: Partial<Format>) {
  const cur = getFormatRaw(id);
  const next: Record<string, unknown> = { ...cur };
  for (const k of FORMAT_EDITABLE) if (k in patch) next[k] = (patch as Record<string, unknown>)[k];
  if (next.nota === null) delete next.nota;
  return writeFormat(next as Format);
}
/** print de referência: grava em refs/ (fora do git) e devolve o nome do arquivo */
function saveRefImage(id: string, upload: { name: string; base64: string }) {
  const ext = upload.name.match(/\.(png|jpe?g|webp|gif)$/i)?.[1]?.toLowerCase();
  if (!ext) throw new ValidationError(upload.name, ['print em .png, .jpg, .webp ou .gif']);
  const dir = join(formatDir(id), 'refs');
  const base = `${today()}-${slugify(upload.name.replace(/\.[^.]+$/, '')).slice(0, 40) || 'print'}`;
  let name = `${base}.${ext}`, n = 2;
  while (exists(join(dir, name))) name = `${base}-${n++}.${ext}`;
  ensureDir(dir);
  writeFileSync(abs(join(dir, name)), Buffer.from(upload.base64, 'base64'));
  return name;
}
export interface FormatRefInput { url?: string; observacao?: string; upload?: { name: string; base64: string } }
export function addFormatRef(id: string, r: FormatRefInput) {
  const cur = getFormatRaw(id);
  const url = r.url?.trim() || undefined;
  if (!url && !r.upload) throw new ValidationError(id, ['cole um link ou envie um print']);
  const imagem = r.upload ? saveRefImage(id, r.upload) : undefined;
  return writeFormat({ ...cur, referencias: [...cur.referencias, { url, imagem, observacao: r.observacao?.trim() ?? '', adicionadoEm: today() }] });
}
export function removeFormatRef(id: string, index: number) {
  const cur = getFormatRaw(id);
  const ref = cur.referencias[index];
  if (!ref) throw new ValidationError(id, ['referência não encontrada']);
  if (ref.imagem && exists(join(formatDir(id), 'refs', ref.imagem))) rmSync(abs(join(formatDir(id), 'refs', ref.imagem)));
  return writeFormat({ ...cur, referencias: cur.referencias.filter((_, i) => i !== index) });
}
/** referência solta que ainda não é skill: novo verbete "rascunho" (vira fmt-* quando repetir 2–3 vezes) */
export function createFormatDraft(input: { nome: string; midia: Format['midia']; essencia?: string; tipos?: Format['tipos'] } & FormatRefInput) {
  const nome = input.nome?.trim();
  if (!nome) throw new ValidationError(FORMATS, ['dê um nome ao formato']);
  const id = uniqueId(FORMATS, nome, '');
  const draft = { id, nome, status: 'rascunho', midia: input.midia, essencia: input.essencia?.trim() || input.observacao?.trim() || nome, tipos: input.tipos ?? [] };
  writeFormat(check(Format, draft, formatJson(id)));
  if (input.url?.trim() || input.upload) addFormatRef(id, input);
  return getFormat(id);
}
/** "Promover como exemplo": aponta para a peça (não copia mídia) e marca o formato na ficha dela */
export function promoteExample(id: string, ex: { empresa: string; peca: string; arquivo?: string; legenda?: string }) {
  const cur = getFormatRaw(id);
  const piece = pieceSummary(ex.empresa, ex.peca);
  if (!piece) throw new ValidationError(ex.peca, ['peça não encontrada']);
  if (cur.exemplos.some((e) => e.empresa === ex.empresa && e.peca === piece.path)) throw new ValidationError(ex.peca, ['essa peça já é exemplo deste formato']);
  if (!piece.cover) throw new ValidationError(ex.peca, ['a peça ainda não tem arquivo exportado (exports/ ou png/)']);
  savePieceMeta(ex.empresa, piece.path, { formato: id });
  return writeFormat({ ...cur, exemplos: [...cur.exemplos, { empresa: ex.empresa, peca: piece.path, arquivo: ex.arquivo || undefined, legenda: ex.legenda?.trim() || undefined, adicionadoEm: today() }] });
}
export function removeExample(id: string, index: number) {
  const cur = getFormatRaw(id);
  if (!cur.exemplos[index]) throw new ValidationError(id, ['exemplo não encontrado']);
  return writeFormat({ ...cur, exemplos: cur.exemplos.filter((_, i) => i !== index) });
}
/** print de referência servido ao app; null se não existir */
export const formatRefFile = (id: string, file: string) => {
  if (!/^[\w.-]+$/.test(file) || file.startsWith('.')) return null;
  const f = join(ROOT, formatDir(id), 'refs', file);
  return existsSync(f) ? f : null;
};

// ---------- Matriz de funcionalidades × concorrentes (intel/matriz.json) ----------
const matrixFile = (slug: string) => join(company(slug), 'intel', 'matriz.json');
export function getMatrix(slug: string): Matrix {
  return exists(matrixFile(slug)) ? readJson(Matrix, matrixFile(slug)) : { ...EMPTY_MATRIX, updatedAt: nowIso() };
}
function saveMatrix(slug: string, m: Matrix) {
  const v = check(Matrix, { ...m, updatedAt: nowIso() }, matrixFile(slug));
  writeJson(matrixFile(slug), v);
  return v;
}
/** Grava (ou limpa, com `status: null`) uma célula. A IA (`by: 'ia'`) nunca sobrescreve célula do Oliver: devolve a matriz como está. */
export function setMatrixCell(slug: string, col: string, featureId: string, c: { status: CellStatus | null; note?: string; source?: string }, by: 'ia' | 'oliver' = 'oliver') {
  const m = structuredClone(getMatrix(slug));
  const cur = m.cells[col]?.[featureId];
  if (by === 'ia' && cur?.by === 'oliver') return m;
  m.cells[col] ??= {};
  if (c.status === null) delete m.cells[col][featureId];
  else m.cells[col][featureId] = { status: c.status, ...(c.note?.trim() ? { note: c.note.trim() } : {}), ...(c.source?.trim() ? { source: c.source.trim() } : {}), by, updatedAt: nowIso() };
  return saveMatrix(slug, m);
}
/** Cria (sem `id`) ou atualiza uma funcionalidade; grupo novo entra no fim da lista de grupos. */
export function saveMatrixFeature(slug: string, f: { id?: string; name: string; group: string; description?: string }) {
  const m = structuredClone(getMatrix(slug));
  const group = f.group.trim();
  if (!m.groups.includes(group)) m.groups.push(group);
  const cur = f.id ? m.features.find((x) => x.id === f.id) : undefined;
  if (cur) Object.assign(cur, { name: f.name.trim(), group, description: f.description?.trim() || undefined });
  else {
    let id = slugify(f.name).slice(0, 40) || 'feature', n = 2;
    while (m.features.some((x) => x.id === id)) id = `${slugify(f.name).slice(0, 36)}-${n++}`;
    m.features.push({ id, name: f.name.trim(), group, description: f.description?.trim() || undefined, order: Math.max(0, ...m.features.map((x) => x.order)) + 1 });
  }
  m.groups = m.groups.filter((g) => m.features.some((x) => x.group === g));
  return saveMatrix(slug, m);
}
export function deleteMatrixFeature(slug: string, id: string) {
  const m = structuredClone(getMatrix(slug));
  m.features = m.features.filter((x) => x.id !== id);
  for (const col of Object.keys(m.cells)) delete m.cells[col][id];
  m.groups = m.groups.filter((g) => m.features.some((x) => x.group === g));
  return saveMatrix(slug, m);
}
export function renameMatrixGroup(slug: string, from: string, to: string) {
  const m = structuredClone(getMatrix(slug));
  const t = to.trim();
  if (!t || !m.groups.includes(from)) return m;
  m.groups = [...new Set(m.groups.map((g) => (g === from ? t : g)))];
  for (const f of m.features) if (f.group === from) f.group = t;
  return saveMatrix(slug, m);
}

// ---------- Brechas somadas (intel/brechas.json, gerado pela IA a partir das análises `forcas`) ----------
const gapsFile = (slug: string) => join(company(slug), 'intel', 'brechas.json');
export const getGaps = (slug: string): Gaps | null => (exists(gapsFile(slug)) ? readJson(Gaps, gapsFile(slug)) : null);

// ---------- Curadoria: fontes (041) ----------
const sourcesFile = (slug: string) => join(P.curadoria(slug), 'fontes.json');
export const listSources = (slug: string): CuratedSource[] => (exists(sourcesFile(slug)) ? readJson(SourceList, sourcesFile(slug)) : []);
function writeSources(slug: string, l: unknown[]) {
  const v = check(SourceList, l, sourcesFile(slug));
  writeJson(sourcesFile(slug), v);
  return v;
}
/** Cria (sem `id` ou com `id` novo) ou atualiza uma fonte (merge com a gravada; `id` e `created` não mudam). */
export function saveSource(slug: string, input: Partial<z.input<typeof CuratedSource>> & { name: string; url: string }) {
  const all = structuredClone(listSources(slug));
  const i = input.id ? all.findIndex((x) => x.id === input.id) : -1;
  if (i >= 0) {
    all[i] = { ...all[i], ...input, id: all[i].id, created: all[i].created } as CuratedSource;
    return writeSources(slug, all)[i];
  }
  const base = slugify(input.id || input.name).slice(0, 40) || 'fonte';
  let id = base, n = 2;
  while (all.some((x) => x.id === id)) id = `${base}-${n++}`;
  const v = writeSources(slug, [...all, { addedBy: 'oliver', status: 'ativa', trust: 2, access: { method: 'web' }, created: today(), ...input, id }]);
  return v[v.length - 1];
}
/** aceitar (ativa), recusar (arquivada), pausar ou reativar várias de uma vez */
export function setSourcesStatus(slug: string, ids: string[], status: SourceStatus) {
  const st = SourceStatus.parse(status);
  const set = new Set(ids);
  return writeSources(slug, listSources(slug).map((s) => (set.has(s.id) ? { ...s, status: st } : s)));
}
/** pilares e séries numerados do CONTENT_STRATEGY.md (rótulos na tela e conferência no validate) */
export function strategyRefs(slug: string) {
  const f = join(P.context(slug), 'CONTENT_STRATEGY.md');
  const out = { pillars: [] as { n: number; name: string }[], series: [] as { n: number; name: string; pillars: number[] }[] };
  if (!exists(f)) return out;
  let sec: 'pillars' | 'series' | null = null;
  for (const line of read(f).split(/\r?\n/)) {
    if (line.startsWith('## ')) { sec = /^## Pilares/i.test(line) ? 'pillars' : /^## S[ée]ries/i.test(line) ? 'series' : null; continue; }
    const m = sec && line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/);
    if (!m) continue;
    if (sec === 'pillars') out.pillars.push({ n: +m[1], name: m[2] });
    else out.series.push({ n: +m[1], name: m[2], pillars: (m[3].match(/\d+/g) ?? []).map(Number) });
  }
  return out;
}
function checkSourcesRefs(slug: string) {
  const list = listSources(slug), refs = strategyRefs(slug);
  if (!refs.pillars.length && !refs.series.length) return;
  const P_ = new Set(refs.pillars.map((p) => p.n)), S_ = new Set(refs.series.map((s) => s.n)), issues: string[] = [];
  list.forEach((s, i) => {
    for (const n of s.pillars) if (!P_.has(n)) issues.push(`${i}.pillars: pilar ${n} não existe no CONTENT_STRATEGY.md (${s.id})`);
    for (const n of s.series) if (!S_.has(n)) issues.push(`${i}.series: série ${n} não existe no CONTENT_STRATEGY.md (${s.id})`);
  });
  if (issues.length) throw new ValidationError(sourcesFile(slug), issues);
}

// ---------- Curadoria: referências e rodadas (041 F2) ----------
const refsDir = (slug: string) => join(P.curadoria(slug), 'referencias');
const roundsDir = (slug: string) => join(P.curadoria(slug), 'rodadas');
export const listRefs = (slug: string): SourceRef[] => list(refsDir(slug), /^R-\d{4}\.json$/).map((f) => readJson(SourceRef, join(refsDir(slug), f)));
export function nextRefId(slug: string, offset = 0) {
  const n = Math.max(0, ...list(refsDir(slug), /^R-\d{4}\.json$/).map((f) => parseInt(f.slice(2, 6), 10)));
  return `R-${String(n + 1 + offset).padStart(4, '0')}`;
}
export function saveRef(slug: string, data: z.input<typeof SourceRef>) {
  const file = join(refsDir(slug), `${data.id}.json`);
  const v = check(SourceRef, data, file);
  writeJson(file, v);
  return v;
}
export const listRounds = (slug: string) => list(roundsDir(slug), /^\d{4}-\d{2}-\d{2}-\d{4}-/);
export const roundFile = (slug: string, round: string, f: 'pedido.json' | 'resultado.json') => join(roundsDir(slug), round, f);
export const getRoundRequest = (slug: string, round: string) => readJson(ResearchRequest, roundFile(slug, round, 'pedido.json'));
export const getRoundResult = (slug: string, round: string) => (exists(roundFile(slug, round, 'resultado.json')) ? readJson(ResearchResult, roundFile(slug, round, 'resultado.json')) : null);
export function saveRoundRequest(slug: string, data: z.input<typeof ResearchRequest>) {
  const file = roundFile(slug, data.id, 'pedido.json');
  const v = check(ResearchRequest, data, file);
  writeJson(file, v);
  return v;
}
export function saveRoundResult(slug: string, round: string, data: z.input<typeof ResearchResult>) {
  const file = roundFile(slug, round, 'resultado.json');
  const v = check(ResearchResult, data, file);
  writeJson(file, v);
  return v;
}
/** ideia de pesquisa aponta para referências que existem; referência aponta para fonte cadastrada */
function checkCuradoria(slug: string) {
  const refs = new Set(listRefs(slug).map((r) => r.id));
  const srcs = new Set(listSources(slug).map((s) => s.id));
  for (const r of listRefs(slug)) if (!srcs.has(r.sourceId)) throw new ValidationError(join(refsDir(slug), `${r.id}.json`), [`sourceId: fonte ${r.sourceId} não existe em fontes.json`]);
  for (const d of listIdeas(slug)) {
    const miss = d.data.refs.filter((id) => !refs.has(id));
    if (miss.length) throw new ValidationError(d.file, [`refs: ${miss.join(', ')} não existe(m) em curadoria/referencias/`]);
  }
}

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
    for (const pc of listPieces(d)) {
      if (exists(join(contentsDir(d), pc.path, 'revisao.json'))) tryIt(() => getReview(d, pc.path));
      if (exists(join(contentsDir(d), pc.path, 'peca.json'))) tryIt(() => getPieceMeta(d, pc.path));
      if (exists(join(contentsDir(d), pc.path, 'mockup.json'))) tryIt(() => readJson(Mockup, join(contentsDir(d), pc.path, 'mockup.json')));
    }
    // estúdio de mockups (028): capturas e preferências da marca
    for (const c of list(P.capturas(d), /^\d{4}-\d{2}-\d{2}-/)) if (exists(join(P.capturas(d), c, 'captura.json'))) tryIt(() => readJson(Capture, join(P.capturas(d), c, 'captura.json')));
    if (exists(join(P.brand(d), 'mockups.json'))) tryIt(() => readJson(MockupBrand, join(P.brand(d), 'mockups.json')));
    if (exists(matrixFile(d))) tryIt(() => getMatrix(d));
    if (exists(gapsFile(d))) tryIt(() => getGaps(d));
    if (exists(sourcesFile(d))) tryIt(() => checkSourcesRefs(d)); // curadoria (041): schema + pilares/séries existentes
    for (const f of list(refsDir(d), /\.json$/)) tryIt(() => readJson(SourceRef, join(refsDir(d), f)));
    for (const r of listRounds(d)) {
      if (exists(roundFile(d, r, 'pedido.json'))) tryIt(() => getRoundRequest(d, r));
      if (exists(roundFile(d, r, 'resultado.json'))) tryIt(() => getRoundResult(d, r));
    }
    if (exists(P.curadoria(d))) tryIt(() => checkCuradoria(d));
    if (exists(P.competitors(d))) for (const id of readdirSync(abs(P.competitors(d)))) {
      tryIt(() => getCompetitor(d, id));
      tryIt(() => getMarks(d, id));
      if (exists(adsMarksFile(d, id))) tryIt(() => {
        for (const [k, m] of Object.entries(getAdsMarks(d, id).ads)) {
          if (m.saved && !m.frozen) throw new ValidationError(adsMarksFile(d, id), [`${k}: salvo sem cópia do anúncio (frozen)`]);
          if (m.frozenMedia && !exists(join(P.adsSalvos(d, id), m.frozenMedia))) throw new ValidationError(adsMarksFile(d, id), [`${k}: miniatura ${m.frozenMedia} não existe em ads/salvos/`]);
        }
      });
      tryIt(() => listSnapshots(d, id));
      if (exists(P.competitorFile(d, id))) {
        tryIt(() => getAnalysisResults(d, id));
        tryIt(() => getAnalysisNotes(d, id));
        tryIt(() => getAnalysisRequest(d, id));
      }
    }
  }
  // galeria de formatos (027)
  for (const d of list(FORMATS, /^[a-z0-9][a-z0-9-]*$/)) if (exists(join(FORMATS, d, 'formato.json'))) tryIt(() => {
    const f = getFormatRaw(d);
    if (f.id !== d) throw new ValidationError(formatJson(d), [`id "${f.id}" diferente da pasta`]);
    if (f.skill && !exists(join('.claude', 'skills', f.skill, 'SKILL.md'))) throw new ValidationError(formatJson(d), [`skill ${f.skill} não existe`]);
  });
  return errors;
}

// ───────────────────────── histórico de anúncios entre coletas (037 fase A) ─────────────────────────

/** Limite do coletor nos snapshots antigos, que não gravam `max`/`truncada` (tools/intel/ads.ts). Só vale para eles. */
export const ADS_LIMITE_COLETA = 30;

/** Conceito = hash (sha1, 12 hex) de texto + título normalizados (sem acento, minúsculas, espaços únicos), dentro de um concorrente. Mesma regra de `contarIrmaos` em tools/intel/ads-classify.ts. */
export const chaveConceito = (a: { text?: string | null; title?: string | null }) =>
  createHash('sha1').update(`${a.text ?? ''}|${a.title ?? ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12);

/**
 * Coleta completa = sem erro e lida inteira. Snapshot novo grava `truncada` (limite atingido ou havia próxima página).
 * Snapshot antigo (sem `truncada`): abaixo de ADS_LIMITE_COLETA e, quando a Biblioteca informou `total`, com tudo lido.
 * Só uma coleta completa prova que um anúncio saiu do ar.
 */
export const coletaCompleta = (s: { ads: unknown[]; total?: number | null; truncada?: boolean | null; errors: string[] }) => {
  if (s.errors.length) return false;
  if (s.truncada != null) return !s.truncada;
  return s.ads.length < ADS_LIMITE_COLETA && (s.total == null || s.ads.length >= s.total);
};

export interface AnuncioHistorico {
  id: string;
  /** hash normalizado de texto+título (dentro do concorrente) */
  conceito: string;
  /** nº de anúncios ativos do mesmo conceito na última coleta */
  irmaos: number;
  /** collectedAt da primeira e da última coleta em que o id apareceu */
  primeiraVez: string;
  ultimaVez: string;
  /** nº de coletas em que apareceu */
  coletas: number;
  /** hoje − startedAt da Biblioteca (null sem data) */
  diasNoAr: number | null;
  /** estava na coleta anterior e sumiu de uma coleta completa */
  saiuDoAr: boolean;
  /** collectedAt da coleta que provou a saída (precisão = intervalo entre coletas) */
  saiuEm: string | null;
  /** saiuEm − startedAt, em dias */
  duracaoFinal: number | null;
  /** mesmo conceito voltou com id novo depois de um anúncio sumir */
  reapareceu: boolean;
  /** id do anúncio anterior do mesmo conceito que tinha saído */
  reapareceuDe: string | null;
}
export interface AdsHistorico {
  slug: string;
  competitorId: string;
  /** coletas lidas (todas) e quantas contam como completas */
  coletas: number;
  coletasCompletas: number;
  ultimaColeta: string | null;
  saidas: number;
  ads: AnuncioHistorico[];
}

const DIA_MS = 86_400_000;
const diasEntre = (de: string, ate: Date | string) => {
  const a = Date.parse(de.length === 10 ? `${de}T00:00:00Z` : de);
  const b = typeof ate === 'string' ? Date.parse(ate) : ate.getTime();
  return Number.isNaN(a) || Number.isNaN(b) ? null : Math.max(0, Math.floor((b - a) / DIA_MS));
};

/** Percorre todos os snapshots de anúncios do concorrente, em ordem, e devolve o histórico por anúncio (calculado ao ler, não é arquivo). */
export function adsHistory(slug: string, compId: string, { hoje = new Date() }: { hoje?: Date } = {}): AdsHistorico {
  const dir = join(P.competitor(slug, compId), 'ads');
  const snaps = (exists(dir) ? list(dir, /^\d.*\.json$/) : []).flatMap((f) => {
    const file = join(dir, f);
    try { return [{ f, snap: cached(file, () => check(AdsSnapshot, JSON.parse(read(file)), file)) }]; } catch { return []; } // arquivo ilegível: ignora, como listAds
  }).sort((a, b) => a.snap.collectedAt.localeCompare(b.snap.collectedAt) || a.f.localeCompare(b.f)).map((x) => x.snap);

  const porId = new Map<string, AnuncioHistorico & { _ad: z.infer<typeof AdsSnapshot>['ads'][number] }>();
  const saiuPorConceito = new Map<string, string>(); // conceito → id do último que saiu
  let completas = 0;
  let anterior = new Set<string>();
  for (const snap of snaps) {
    // coleta vazia logo depois de uma com anúncios só prova saídas se a Biblioteca disse total 0 e a leitura não foi truncada
    const completa = coletaCompleta(snap) && (snap.ads.length > 0 || anterior.size === 0 || (snap.total === 0 && snap.truncada === false));
    if (completa) completas++;
    const agora = new Set(snap.ads.map((a) => a.id));
    for (const ad of snap.ads) {
      const h = porId.get(ad.id);
      if (h) { // voltou com o mesmo id (ou segue no ar)
        h.ultimaVez = snap.collectedAt; h.coletas++; h._ad = ad;
        if (h.saiuDoAr) {
          h.saiuDoAr = false; h.saiuEm = null; h.duracaoFinal = null;
          if (saiuPorConceito.get(h.conceito) === ad.id) saiuPorConceito.delete(h.conceito); // o mesmo id voltou: não é "reapareceu"
        }
      } else {
        const conceito = chaveConceito(ad);
        const de = saiuPorConceito.get(conceito) ?? null;
        porId.set(ad.id, { id: ad.id, conceito, irmaos: 1, primeiraVez: snap.collectedAt, ultimaVez: snap.collectedAt, coletas: 1, diasNoAr: null, saiuDoAr: false, saiuEm: null, duracaoFinal: null, reapareceu: de != null && de !== ad.id, reapareceuDe: de, _ad: ad });
      }
    }
    if (completa) {
      for (const id of anterior) {
        const h = porId.get(id);
        if (!h || agora.has(id) || h.saiuDoAr) continue;
        h.saiuDoAr = true; h.saiuEm = snap.collectedAt;
        h.duracaoFinal = h._ad.startedAt ? diasEntre(h._ad.startedAt, snap.collectedAt) : null;
        saiuPorConceito.set(h.conceito, id);
      }
      anterior = agora;
    } else {
      for (const id of agora) anterior.add(id); // coleta parcial: o que ela viu segue como "estava no ar"; o que não viu fica como estava
    }
  }

  const ultima = snaps.at(-1);
  // irmãos: sobre a última coleta completa (ou, sem nenhuma, a última com anúncios), não sobre uma coleta quebrada
  const base = [...snaps].reverse().find((s) => coletaCompleta(s) && s.ads.length) ?? [...snaps].reverse().find((s) => s.ads.length);
  const ativos = new Map<string, number>();
  for (const a of base?.ads ?? []) if (a.active !== false) ativos.set(chaveConceito(a), (ativos.get(chaveConceito(a)) ?? 0) + 1);
  const ads = [...porId.values()].map(({ _ad, ...h }) => ({
    ...h,
    diasNoAr: h.saiuDoAr ? h.duracaoFinal : _ad.startedAt ? diasEntre(_ad.startedAt, hoje) : null,
    irmaos: ativos.get(h.conceito) ?? 0,
  }));
  return { slug, competitorId: compId, coletas: snaps.length, coletasCompletas: completas, ultimaColeta: ultima?.collectedAt ?? null, saidas: ads.filter((a) => a.saiuDoAr).length, ads };
}

// ───────────────────────── marcas do Oliver nos anúncios (037 fase D) ─────────────────────────
// competitors/<id>/ads/marks.json: nota, tags, salvo (com cópia do anúncio) e override de funil/tipo/objetivo.
// Coleta e classificação nunca escrevem aqui; o override vence a regra (e a IA) na hora de mostrar.

const adsMarksFile = (slug: string, compId: string) => P.adsMarks(slug, compId);
/** lê sem cache (arquivo pequeno, e a escrita logo em seguida não pode enxergar versão velha) */
export function getAdsMarks(slug: string, compId: string): AdsMarks {
  const f = adsMarksFile(slug, compId);
  return exists(f) ? check(AdsMarks, JSON.parse(read(f)), f) : { schema: 1, ads: {} };
}
/** marcas de todos os concorrentes que têm arquivo: { compId: { 'meta:123': marca } } */
export function listAdsMarks(slug: string): Record<string, AdsMarks['ads']> {
  const out: Record<string, AdsMarks['ads']> = {};
  if (!exists(P.competitors(slug))) return out;
  for (const id of readdirSync(abs(P.competitors(slug)))) if (exists(adsMarksFile(slug, id))) { try { out[id] = getAdsMarks(slug, id).ads; } catch { /* inválido: aparece no validate */ } }
  return out;
}

/** o anúncio mais recente com esse id em qualquer coleta (a mais nova primeiro) */
function findAdInSnapshots(slug: string, compId: string, adId: string) {
  const dir = join(P.competitor(slug, compId), 'ads');
  const files = list(dir, /^\d.*\.json$/).reverse();
  for (const f of files) {
    try {
      const snap = check(AdsSnapshot, JSON.parse(read(join(dir, f))), join(dir, f));
      const ad = snap.ads.find((a) => a.id === adId);
      if (ad) return ad;
    } catch { /* ilegível: ignora */ }
  }
  return undefined;
}

/** miniatura leve (até 1,5 MB) copiada de media/ads/ (fora do git) para ads/salvos/ (no git). Vídeo pesado nunca entra: só o poster. */
const SALVO_MAX_BYTES = 1.5 * 1024 * 1024;
function copiarMiniatura(slug: string, compId: string, ad: { id: string; media: { thumbnailLocal?: string } }): string | undefined {
  const local = ad.media.thumbnailLocal;
  if (!local || !/^media\/ads\/[\w.-]+$/.test(local)) return undefined;
  const src = join(P.competitor(slug, compId), local);
  if (!exists(src) || statSync(abs(src)).size > SALVO_MAX_BYTES) return undefined;
  const name = `${ad.id}${local.slice(local.lastIndexOf('.'))}`;
  mkdirSync(abs(P.adsSalvos(slug, compId)), { recursive: true });
  copyFileSync(abs(src), abs(join(P.adsSalvos(slug, compId), name)));
  return name;
}

/**
 * Grava a marca de um anúncio. Ao salvar, copia o anúncio inteiro (`frozen`) e a miniatura; ao tirar dos salvos, apaga a cópia.
 * Marca que ficou sem nada do Oliver sai do arquivo. `fonte` = 'meta' (Google Transparency entra depois).
 */
export function setAdMark(slug: string, compId: string, adId: string, patch: AdMarkPatch, fonte = 'meta'): AdMark | null {
  if (!/^[\w.-]+$/.test(adId)) throw new ValidationError(adsMarksFile(slug, compId), ['id de anúncio inválido']);
  const file = getAdsMarks(slug, compId);
  const key = adKey(adId, fonte);
  const old = file.ads[key];
  const next = aplicarMarca(old, patch, nowIso());
  if (next.saved && !next.frozen) {
    const ad = findAdInSnapshots(slug, compId, adId);
    if (!ad) throw new ValidationError(adsMarksFile(slug, compId), [`anúncio ${adId} não está em nenhuma coleta; nada para guardar`]);
    next.frozen = ad;
    const media = copiarMiniatura(slug, compId, ad);
    if (media) next.frozenMedia = media;
  } else if (!next.saved && (next.frozen || next.frozenMedia)) {
    if (next.frozenMedia) rmSync(abs(join(P.adsSalvos(slug, compId), next.frozenMedia)), { force: true });
    delete next.frozen; delete next.frozenMedia;
  }
  if (marcaVazia(next)) delete file.ads[key]; else file.ads[key] = check(AdMark, next, `${adsMarksFile(slug, compId)}#${key}`);
  if (Object.keys(file.ads).length) write(adsMarksFile(slug, compId), `${JSON.stringify(check(AdsMarks, file, adsMarksFile(slug, compId)), null, 2)}\n`);
  else rmSync(abs(adsMarksFile(slug, compId)), { force: true });
  return file.ads[key] ?? null;
}
