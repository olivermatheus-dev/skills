// Peças comuns do editor de mockups (tarefa 030): catálogo de molduras e capturas no formato que o runtime (cena.js) recebe.
// Usado pelo export (tools/mockup/cena.mjs, file://) e pela API do app (app/server/api.ts, http).
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// raiz do hub: HUB_ROOT (o app define; a API é empacotada pelo Vite e o import.meta.url deixa de apontar para tools/) ou a pasta deste arquivo
const PADRAO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const root = () => process.env.HUB_ROOT ?? PADRAO;
export const lib = () => join(root(), 'library', 'mockups');
export const FORMATOS = { '1:1': [1080, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920], '16:9': [1920, 1080] };
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));

/** molduras reais com imagem presente. base(id) → URL da pasta (com / no fim); mascaraInline: data URL (file:// não carrega mask-image cruzado) */
export function aparelhos(base, { mascaraInline = false } = {}) {
  const out = {}, dir = join(lib(), 'aparelhos');
  if (!existsSync(dir)) return out;
  for (const d of readdirSync(dir)) {
    const f = join(dir, d, 'aparelho.json');
    if (!existsSync(f)) continue;
    const a = readJson(f);
    const vs = Object.values(a.variantes);
    if (!vs.every((v) => existsSync(join(dir, d, v.mascara)) && Object.values(v.arquivos).some((x) => existsSync(join(dir, d, x))))) continue;
    a.base = base(d);
    for (const v of vs) {
      v.mascaraUrl = mascaraInline ? 'data:image/png;base64,' + readFileSync(join(dir, d, v.mascara)).toString('base64') : a.base + v.mascara;
      for (const [c, x] of Object.entries(v.arquivos)) if (!existsSync(join(dir, d, x))) delete v.arquivos[c];
    }
    out[a.id] = a;
  }
  return out;
}
/** resumo leve para a interface (sem geometria) */
export const resumoAparelhos = (aps) => Object.values(aps).map((a) => ({ id: a.id, nome: a.nome, tipo: a.tipo, marca: a.marca, cores: a.cores.filter((c) => Object.values(a.variantes).some((v) => v.arquivos[c.id])), orientacoes: Object.keys(a.variantes), padrao: a.padrao }));

/** região nomeada, fração 0–1 ou px → px da imagem original */
function regiao(r, cap) {
  if (r == null) return undefined;
  if (typeof r === 'string') r = cap.regioes?.[r];
  if (!r) return undefined;
  const frac = [r.x, r.y, r.w, r.h].every((v) => v <= 1);
  return frac ? { x: r.x * cap.largura, y: r.y * cap.altura, w: r.w * cap.largura, h: r.h * cap.altura } : { x: r.x, y: r.y, w: r.w, h: r.h };
}
const capDir = (slug, ref) => join(root(), 'companies', slug, ref);

/** uma captura (ref = "capturas/<pasta>") no formato do runtime. url(slug, ref, arquivo) → endereço da imagem */
export function captura(slug, ref, url) {
  const dir = capDir(slug, ref);
  if (!/^capturas\/[^/\\.][^/\\]*$/.test(ref) || !existsSync(join(dir, 'captura.json'))) return null;
  const cap = readJson(join(dir, 'captura.json'));
  let endereco;
  try { endereco = cap.url ? new URL(cap.url).host : undefined; } catch { /* sem endereço */ }
  return {
    ref, nome: ref.split('/').pop(), src: url(slug, ref, cap.arquivo || 'original.png'),
    largura: cap.largura, altura: cap.altura, dpr: cap.dpr || 1, aparelho: cap.aparelho, endereco,
    ocultar: (cap.ocultar || []).map((o) => regiao(o, cap)).filter(Boolean),
    recorteSeguro: regiao(cap.sugestoes?.recorteSeguro, cap), recorteSugerido: regiao(cap.sugestoes?.recorte, cap),
    dadosFicticios: !!cap.dadosFicticios, tags: cap.tags || [], data: cap.data,
  };
}
export function listarCapturas(slug, url) {
  const dir = join(root(), 'companies', slug, 'capturas');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).sort().reverse().map((d) => captura(slug, `capturas/${d}`, url)).filter(Boolean);
}
/** todas as capturas que o documento usa */
export function capturasDoDoc(doc, url) {
  const refs = new Set();
  for (const c of doc.camadas || []) if (c.captura) refs.add(c.captura);
  if (doc.fundo?.captura) refs.add(doc.fundo.captura);
  const out = {};
  for (const r of refs) { const c = captura(doc.empresa, r, url); if (c) out[r] = c; }
  return out;
}

/** documento novo (mockup.json v2) */
export function docNovo(slug, { captura: ref, formatos = ['4:5'], titulo } = {}) {
  const doc = {
    versao: 2, empresa: slug, escala: 3, formatos,
    fundo: { tipo: 'malha', base: '#f3ebe3', desfoque: 0.18, grao: 0.05, pontos: [
      { x: 0.45, y: 0.28, r: 0.48, cor: '#fffaf5' }, { x: 0.05, y: 0.95, r: 0.4, cor: '#f2d9cb' }, { x: 1, y: 0.75, r: 0.36, cor: '#ece0ec' }] },
    camadas: [],
  };
  if (ref) doc.camadas.push({ id: 'c1', tipo: 'aparelho', nome: 'Aparelho', captura: ref, modelo: '', x: 0.5, y: 0.58, w: 0.86, sombra: { preset: 'produto' } });
  if (titulo) doc.camadas.push({ id: 'c2', tipo: 'texto', nome: 'Título', texto: titulo, fonte: 'titulo', tamanho: 0.072, x: 0.5, y: 0.16, w: 0.84, formatos: { '9:16': { y: 0.17 } } });
  return doc;
}
export const salvarJson = (f, v) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(v, null, 2) + '\n'); };
