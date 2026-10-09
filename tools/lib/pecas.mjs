// ID das peças (tarefa 050): toda peça de contents/ tem um ID curto e fixo, letra do tipo + 4 dígitos (V0012 = 12º vídeo),
// e a pasta é `<ID>-<slug>`. O slug pode mudar; o ID não. A data de criação fica na ficha (peca.json > criado).
// Testes do hub ficam em contents/_testes/ (sem ID, fora da lista principal).
// Usado pelo app (core/store.ts, core/mockups.ts), pelas ferramentas que criam peça e pelo tools/pecas.mjs (migração).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const contentsDir = (slug) => join(ROOT(), 'companies', slug, 'contents');

export const PREFIXO = { video: 'V', carrossel: 'C', post: 'P', mockup: 'M', roteiro: 'R' };
export const TIPO_DO_PREFIXO = Object.fromEntries(Object.entries(PREFIXO).map(([k, v]) => [v, k]));
export const ID_RE = /^([VCPMR])(\d{4})(?=-|$)/;
export const TESTES = '_testes';

/** "V0002-apresentacao-janela" → "V0002" (ou null para pasta antiga/sem ID) */
export const idDaPasta = (nome) => String(nome ?? '').split('/').pop().match(ID_RE)?.[0] ?? null;
/** "V0002", "v2", "V 12", "12" → número; para a busca do app */
export const numeroDoId = (id) => +(String(id).match(/(\d+)\s*$/)?.[1] ?? NaN);

export const slugify = (s, palavras = 6) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-').filter(Boolean).slice(0, palavras).join('-') || 'peca';

/** tipo da peça a partir do formato da galeria (library/formatos/<id>/formato.json > midia) */
export function tipoDoFormato(formato) {
  if (!formato) return 'roteiro';
  const f = join(ROOT(), 'library', 'formatos', formato, 'formato.json');
  const midia = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).midia : null;
  if (midia === 'video') return 'video';
  if (['post-frase', 'meme'].includes(formato)) return 'post';
  return midia === 'imagem' ? 'carrossel' : 'roteiro';
}

/** próximo ID livre do tipo na empresa (olha as pastas e os ids das fichas; nunca reaproveita) */
export function proximoId(slug, tipo) {
  const p = PREFIXO[tipo];
  if (!p) throw new Error(`tipo de peça desconhecido: ${tipo} (${Object.keys(PREFIXO).join(', ')})`);
  const dir = contentsDir(slug);
  let max = 0;
  for (const d of existsSync(dir) ? readdirSync(dir) : []) {
    const m = d.match(ID_RE);
    if (m?.[1] === p) max = Math.max(max, +m[2]);
    const ficha = join(dir, d, 'peca.json');
    if (existsSync(ficha)) { try { const id = JSON.parse(readFileSync(ficha, 'utf8')).id; const n = id?.match(ID_RE); if (n?.[1] === p) max = Math.max(max, +n[2]); } catch { /* ficha inválida: o validate acusa */ } }
  }
  return `${p}${String(max + 1).padStart(4, '0')}`;
}

/** pasta nova `<ID>-<slug>` (relativa a contents/) + o id, para quem cria peça */
export function novaPasta(slug, tipo, titulo) {
  const id = proximoId(slug, tipo);
  return { id, pasta: `${id}-${slugify(titulo)}` };
}
