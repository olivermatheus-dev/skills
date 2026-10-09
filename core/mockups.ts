// Editor de mockups (tarefa 030): capturas, peças em camadas (mockup.json versão 2) e export. As rotas ficam em app/server/handler.ts.
// O desenho é do runtime library/mockups/runtime/cena.js (o mesmo no editor e no export pelo Playwright).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { ROOT, ValidationError } from './store';
import { MockupScene, Slug } from '../schema';
import * as L from '../tools/mockup/cena-lib.mjs';
import * as PC from '../tools/lib/pecas.mjs';

const readJson = (f: string) => JSON.parse(readFileSync(f, 'utf8'));
const contents = (slug: string) => join(ROOT, 'companies', slug, 'contents');
const okSlug = (slug: string) => { if (!Slug.safeParse(slug).success) throw new ValidationError(slug, ['slug inválido']); return slug; };
function pasta(slug: string, path: string) {
  if (!path || /(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(path)) throw new ValidationError(path, ['caminho da peça inválido']);
  return join(contents(okSlug(slug)), path);
}
/** endereço das imagens das capturas no app (servidas por /mk/emp/…) */
export const urlCaptura = (slug: string, ref: string, arq: string) => `/mk/emp/${slug}/${ref.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(arq)}`;
const hoje = () => new Date().toLocaleDateString('sv-SE');
const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'mockup';
const run = (args: string[]) => new Promise<{ out: string; err: string; code: number }>((ok) => {
  execFile(process.execPath, args, { cwd: ROOT, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, HUB_ROOT: ROOT } }, (e, out, err) => ok({ out: String(out), err: String(err), code: e ? (typeof e.code === 'number' ? e.code : 1) : 0 }));
});

// ---------- catálogo ----------
let _aps: Record<string, any> | null = null;
/** molduras para o runtime do iframe (imagens e máscaras por http, servidas em /mk/lib/) */
export const aparelhosRuntime = () => (_aps ??= L.aparelhos((d) => `/mk/lib/aparelhos/${d}/`));
export function catalogo() {
  const f = readJson(join(L.lib(), 'fundos.json'));
  return {
    aparelhos: L.resumoAparelhos(aparelhosRuntime()),
    desenhos: [{ id: 'navegador', nome: 'Janela do navegador' }, { id: 'vidro', nome: 'Borda de vidro' }, { id: 'sem-moldura', nome: 'Tela sem moldura' }],
    fundos: f.presets, padroes: f.padroes,
    angulos: ['frente', 'esquerda', 'direita', 'inclinado', 'heroi', 'heroi-esq', 'isometrico'],
    sombras: ['nenhuma', 'contato', 'suave', 'flutuante', 'produto', 'dramatica'],
    cantos: ['nenhum', 'sutil', 'medio', 'grande', 'ios', 'macos'],
    formatos: Object.keys(L.FORMATOS),
  };
}

// ---------- capturas ----------
export const listarCapturas = (slug: string) => L.listarCapturas(okSlug(slug), urlCaptura);
/** imagem colada/arrastada → captura nova (tools/mockup/captura.mjs mede e sugere cortes) */
export async function novaCaptura(slug: string, b: { nome?: string; base64?: string; ext?: string }) {
  okSlug(slug);
  const ext = /^(png|jpe?g|webp)$/i.test(b.ext ?? '') ? b.ext!.toLowerCase() : 'png';
  if (!b.base64) throw new ValidationError('captura', ['imagem vazia']);
  const base = slugify(b.nome || 'colado');
  const dir = join(ROOT, 'companies', slug, 'capturas');
  let nome = base, i = 2;
  while (existsSync(join(dir, `${hoje()}-${nome}`))) nome = `${base}-${i++}`;
  const tmp = join(tmpdir(), `captura-${Date.now()}.${ext}`);
  writeFileSync(tmp, Buffer.from(b.base64.replace(/^data:[^,]+,/, ''), 'base64'));
  try {
    const r = await run(['tools/mockup/captura.mjs', tmp, '--empresa', slug, '--nome', nome]);
    if (r.code) throw new Error((r.err || r.out).trim().split('\n').pop());
  } finally { rmSync(tmp, { force: true }); }
  const c = L.captura(slug, `capturas/${hoje()}-${nome}`, urlCaptura);
  if (!c) throw new Error('captura não registrada');
  return c;
}

// ---------- peças (mockup.json versão 2) ----------
export function listarMockups(slug: string) {
  const out: { path: string; title: string; formatos: string[]; png: string[]; updatedAt?: string }[] = [];
  const dir = contents(okSlug(slug));
  if (!existsSync(dir)) return out;
  for (const d of readdirSync(dir)) {
    const f = join(dir, d, 'mockup.json');
    if (!existsSync(f)) continue;
    try {
      const doc = readJson(f);
      if (doc.versao !== 2) continue;
      const ficha = existsSync(join(dir, d, 'peca.json')) ? readJson(join(dir, d, 'peca.json')) : {};
      const png = existsSync(join(dir, d, 'png')) ? readdirSync(join(dir, d, 'png')).filter((x) => /\.png$/.test(x)).map((x) => `png/${x}`) : [];
      out.push({ path: d, title: ficha.title ?? d, formatos: doc.formatos, png, updatedAt: statSync(f).mtime.toISOString() });
    } catch { /* arquivo inválido: o validate acusa */ }
  }
  return out.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}
export function criarMockup(slug: string, b: { nome?: string; captura?: string; titulo?: string; formatos?: string[] }) {
  okSlug(slug);
  // pasta com ID (050): M0004-<tela>; a data vai para a ficha
  const { id, pasta: path } = PC.novaPasta(slug, 'mockup', b.nome || b.captura?.split('/').pop()?.replace(/^\d{4}-\d{2}-\d{2}-/, '') || 'editor');
  const doc = L.docNovo(slug, { captura: b.captura, formatos: b.formatos?.length ? b.formatos : ['4:5', '9:16'], titulo: b.titulo });
  L.salvarJson(join(contents(slug), path, 'mockup.json'), MockupScene.parse(doc));
  L.salvarJson(join(contents(slug), path, 'peca.json'), { id, criado: hoje(), title: b.nome?.trim() || `Mockup · ${path.replace(PC.ID_RE, '').replace(/-/g, ' ').trim()}`, kind: 'mockup', tags: ['mockup'], notes: {} });
  return { path };
}
export function lerMockup(slug: string, path: string) {
  const f = join(pasta(slug, path), 'mockup.json');
  if (!existsSync(f)) throw new ValidationError(f, ['peça sem mockup.json']);
  const doc = readJson(f);
  if (doc.versao !== 2) throw new ValidationError(f, ['mockup da versão 1 (templates): abra pela galeria ou refaça no editor']);
  return { doc: MockupScene.parse(doc), capturas: L.capturasDoDoc(doc, urlCaptura) };
}
export function salvarMockup(slug: string, path: string, doc: unknown) {
  const dir = pasta(slug, path);
  if (!existsSync(join(dir, 'mockup.json'))) throw new ValidationError(dir, ['peça sem mockup.json']);
  const r = MockupScene.safeParse(doc);
  if (!r.success) throw new ValidationError(join(dir, 'mockup.json'), r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
  if (r.data.empresa !== slug) throw new ValidationError(dir, ['empresa do documento não bate com o projeto']);
  writeFileSync(join(dir, 'mockup.json'), JSON.stringify(r.data, null, 2) + '\n');
  return { ok: true };
}
/** export pelo Playwright (mesmo runtime do editor) → png/<formato>.png */
export async function exportarMockup(slug: string, path: string, b: { formatos?: string[]; escala?: number; webp?: boolean }) {
  const dir = pasta(slug, path);
  const args = ['tools/mockup/cena.mjs', dir];
  if (b.formatos?.length) args.push('--formatos', b.formatos.join(','));
  if (b.escala) args.push('--escala', String(b.escala));
  if (b.webp) args.push('--webp');
  const r = await run(args);
  const ultima = r.out.trim().split('\n').pop() ?? '';
  try { return JSON.parse(ultima) as { ok: boolean; arquivos: string[]; qa: string[]; erro?: string }; }
  catch { throw new Error((r.err || r.out).trim().split('\n').slice(-3).join(' · ') || 'export falhou'); }
}
/** arquivo servido em /mk/emp/<slug>/… : só brand/ e capturas/ */
export function arquivoEmpresa(slug: string, resto: string) {
  if (!Slug.safeParse(slug).success || /(^|\/)\.\.(\/|$)|[\\:]/.test(resto) || !/^(brand|capturas)\//.test(resto)) return null;
  const f = join(ROOT, 'companies', slug, resto);
  return existsSync(f) && statSync(f).isFile() ? f : null;
}
/** arquivo servido em /mk/lib/… : runtime, molduras e fundos */
export function arquivoLib(resto: string) {
  if (/(^|\/)\.\.(\/|$)|[\\:]/.test(resto) || !/^(runtime|aparelhos)\/|^fundos\.json$/.test(resto)) return null;
  const f = join(L.lib(), resto);
  return existsSync(f) && statSync(f).isFile() ? f : null;
}
