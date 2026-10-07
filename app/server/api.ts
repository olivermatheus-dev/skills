// API local da interface: um plugin do Vite que expõe /api/* sobre core/store.ts.
// Roda só na máquina do Oliver (npm run app). Não há banco: os arquivos do repo são o banco.
import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import * as S from '../../core/store';
import { detectLink } from '../../core/platform';
import { P } from '../../schema';

type Params = Record<string, string>;
type Handler = (p: Params, body: any, q: URLSearchParams) => unknown | Promise<unknown>;
const routes: [string, string, Handler][] = [];
const on = (method: string, path: string, h: Handler) => routes.push([method, path, h]);

// Projetos e tags
on('GET', '/api/projects', () => S.listProjects());
on('POST', '/api/projects', (_, b) => S.createProject(b.slug, b.name));
on('GET', '/api/projects/:slug', (p) => S.getProject(p.slug));
on('PUT', '/api/projects/:slug', (p, b) => S.saveProject({ ...b, slug: p.slug }));
on('GET', '/api/projects/:slug/tags', (p) => S.getTags(p.slug));
on('PUT', '/api/projects/:slug/tags', (p, b) => S.saveTags(p.slug, b));

// Tarefas (Kanban)
on('GET', '/api/projects/:slug/tasks', (p) => S.listTasks(p.slug));
on('POST', '/api/projects/:slug/tasks', (p, b) => S.saveTask(p.slug, b.data, b.body));
on('PUT', '/api/projects/:slug/tasks/:id', (p, b) => S.saveTask(p.slug, { ...b.data, id: p.id }, b.body));
on('DELETE', '/api/projects/:slug/tasks/:id', (p) => S.archiveTask(p.slug, p.id));
on('POST', '/api/projects/:slug/tasks/:id/move', (p, b) => S.moveTask(p.slug, p.id, b.status, b.who ?? 'oliver'));

// Personas
on('GET', '/api/projects/:slug/personas', (p) => S.listPersonas(p.slug));
on('POST', '/api/projects/:slug/personas', (p, b) => S.savePersona(p.slug, { ...b.data, id: b.data.id ?? S.newPersonaId(p.slug, b.data.name) }, b.body ?? ''));
on('PUT', '/api/projects/:slug/personas/:id', (p, b) => S.savePersona(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
on('DELETE', '/api/projects/:slug/personas/:id', (p) => S.deletePersona(p.slug, p.id));

// Anotações
on('GET', '/api/projects/:slug/notes', (p) => S.listNotes(p.slug));
on('POST', '/api/projects/:slug/notes', (p, b) => S.saveNote(p.slug, b.data, b.body ?? ''));
on('PUT', '/api/projects/:slug/notes/:id', (p, b) => S.saveNote(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
on('DELETE', '/api/projects/:slug/notes/:id', (p) => S.deleteNote(p.slug, p.id));

// Ideias
on('GET', '/api/projects/:slug/ideas', (p) => S.listIdeas(p.slug));
on('POST', '/api/projects/:slug/ideas', (p, b) => S.saveIdea(p.slug, b.data, b.body ?? ''));
on('PUT', '/api/projects/:slug/ideas/:id', (p, b) => S.saveIdea(p.slug, { ...b.data, id: p.id }, b.body ?? ''));

// Contexto (markdown livre)
on('GET', '/api/projects/:slug/context', (p) => S.listContext(p.slug));
on('GET', '/api/projects/:slug/context/:name', (p) => ({ name: p.name, text: S.getContext(p.slug, p.name) }));
on('PUT', '/api/projects/:slug/context/:name', (p, b) => S.saveContext(p.slug, p.name, b.text));

// Marca: brand.css (somente leitura; a interface mostra os tokens). Sem arquivo → text: null.
on('GET', '/api/projects/:slug/brand-css', (p) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(p.slug)) throw new S.ValidationError(p.slug, ['slug inválido']);
  const file = join(S.ROOT, P.brand(p.slug), 'brand.css');
  return { file: join(P.brand(p.slug), 'brand.css'), text: existsSync(file) ? readFileSync(file, 'utf8') : null };
});

// Concorrentes
on('POST', '/api/detect-link', (_, b) => detectLink(b.url));
on('GET', '/api/projects/:slug/competitors', (p) => S.listCompetitors(p.slug));
on('POST', '/api/projects/:slug/competitors', (p, b) => S.saveCompetitor(p.slug, b.data, b.body ?? ''));
on('GET', '/api/projects/:slug/competitors/:id', (p) => ({
  ...S.getCompetitor(p.slug, p.id), snapshots: S.listSnapshots(p.slug, p.id), marks: S.getMarks(p.slug, p.id),
}));
on('PUT', '/api/projects/:slug/competitors/:id', (p, b) => S.saveCompetitor(p.slug, { ...b.data, id: p.id }, b.body ?? ''));
on('DELETE', '/api/projects/:slug/competitors/:id', (p) => S.deleteCompetitor(p.slug, p.id));
on('PUT', '/api/projects/:slug/competitors/:id/marks', (p, b) => S.setMark(p.slug, p.id, b.key, b.mark));
on('POST', '/api/projects/:slug/competitors/:id/collect', async (p, b) => {
  const { collectCompetitor } = await import('../../tools/intel/collect');
  return collectCompetitor(p.slug, p.id, { platforms: b?.platforms, maxItems: b?.maxItems });
});

// Concorrentes: resumo leve para a lista (última coleta por perfil, sem itens)
on('GET', '/api/projects/:slug/competitors-summary', async (p) => (await import('../../tools/intel/summary')).summarizeCompetitors(p.slug));

on('GET', '/api/validate', () => S.validateAll());

// ---------- infraestrutura ----------
function match(pattern: string, path: string): Params | null {
  const a = pattern.split('/'), b = path.split('/');
  if (a.length !== b.length) return null;
  const out: Params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) out[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return out;
}
const readBody = (req: IncomingMessage) => new Promise<any>((res, rej) => {
  let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { res(d ? JSON.parse(d) : {}); } catch (e) { rej(e); } }); req.on('error', rej);
});
const send = (res: ServerResponse, code: number, data: unknown) => {
  res.statusCode = code; res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify(data ?? null));
};
const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon' };

const handler: Connect.NextHandleFunction = async (req, res, next) => {
  const url = new URL(req.url ?? '/', 'http://x');
  // /media/<slug>/<competitor>/<arquivo> → imagens baixadas pelos coletores
  const m = url.pathname.match(/^\/media\/([^/]+)\/([^/]+)\/(.+)$/);
  if (m) {
    const file = normalize(join(S.ROOT, P.media(m[1], m[2]), decodeURIComponent(m[3])));
    if (!file.startsWith(join(S.ROOT, 'companies')) || !existsSync(file)) return send(res, 404, { error: 'não encontrado' });
    res.setHeader('content-type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    return createReadStream(file).pipe(res);
  }
  if (!url.pathname.startsWith('/api/')) return next();
  for (const [method, pattern, h] of routes) {
    if (method !== req.method) continue;
    const p = match(pattern, url.pathname);
    if (!p) continue;
    try {
      const body = ['POST', 'PUT'].includes(method) ? await readBody(req) : undefined;
      return send(res, 200, await h(p, body, url.searchParams));
    } catch (e) {
      if (e instanceof S.ValidationError) return send(res, 422, { error: 'validação', file: e.file, issues: e.issues });
      return send(res, 500, { error: String((e as Error)?.message ?? e) });
    }
  }
  send(res, 404, { error: `rota não encontrada: ${req.method} ${url.pathname}` });
};

export const hubApi = (): Plugin => ({ name: 'hub-api', configureServer: (s) => { s.middlewares.use(handler); } });
