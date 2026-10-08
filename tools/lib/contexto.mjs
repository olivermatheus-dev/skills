// Contexto declarado por tarefa (021): refs "arquivo#Seção" → só o trecho necessário.
// Ref: caminho relativo a companies/<slug>/ (ex.: context/BUSINESS.md#Modelo e preço) ou à raiz do repo
// (ex.: library/formatos/fmt-meme/formato.json). Sem "#" = arquivo inteiro. Seção = título de qualquer nível,
// sem diferença de maiúscula/acento; vale do título até o próximo título de nível igual ou maior.
// No frontmatter da tarefa a lista é inline ([a, b]): seção com vírgula no nome não serve como ref.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const HEAD = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
export const BIG_FILE = 150; // linhas: acima disso, ref sem seção gera aviso

/** Títulos markdown de um texto, com início/fim (linhas, 0-based, fim exclusivo). Ignora blocos de código. */
export function sections(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let fence = false;
  lines.forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) fence = !fence;
    const m = !fence && l.match(HEAD);
    if (m) out.push({ level: m[1].length, title: m[2], start: i });
  });
  out.forEach((s, k) => {
    const next = out.slice(k + 1).find((x) => x.level <= s.level);
    s.end = next ? next.start : lines.length;
  });
  return { lines, sections: out };
}

export function resolveFile(slug, path) {
  const inCompany = join('companies', slug, path);
  if (slug && existsSync(inCompany)) return inCompany;
  return existsSync(path) ? path : null;
}

/** Resolve uma ref. Devolve { ref, file, section, ok, error?, warn?, text }. */
export function readRef(slug, ref) {
  const [path, ...rest] = String(ref).split('#');
  const section = rest.join('#').trim() || null;
  const file = resolveFile(slug, path.trim());
  if (!file) return { ref, ok: false, error: `arquivo não existe: ${path}` };
  if (statSync(file).isDirectory()) return { ref, file, ok: false, error: 'é uma pasta (aponte um arquivo)' };
  const raw = readFileSync(file, 'utf8');
  const { lines, sections: secs } = sections(raw);
  if (!section) {
    const warn = lines.length > BIG_FILE ? `arquivo inteiro com ${lines.length} linhas: prefira uma seção` : undefined;
    return { ref, file, section, ok: true, warn, text: lines.join('\n').trimEnd() };
  }
  const want = norm(section);
  const hit = secs.find((s) => norm(s.title) === want) ?? secs.find((s) => norm(s.title).startsWith(want));
  if (!hit) return { ref, file, section, ok: false, error: `seção não encontrada: "${section}" (há: ${secs.map((s) => s.title).slice(0, 12).join(' · ')})` };
  return { ref, file, section: hit.title, ok: true, text: lines.slice(hit.start, hit.end).join('\n').trimEnd() };
}

/** Arquivos de contexto da empresa com as seções e o tamanho de cada uma (para escolher o que declarar). */
export function contextIndex(slug) {
  const base = join('companies', slug);
  const files = [];
  const ctx = join(base, 'context');
  if (existsSync(ctx)) for (const f of readdirSync(ctx).filter((x) => x.endsWith('.md')).sort()) files.push(`context/${f}`);
  if (existsSync(join(base, 'brand', 'BRAND.md'))) files.push('brand/BRAND.md');
  return files.map((f) => {
    const { lines, sections: secs } = sections(readFileSync(join(base, f), 'utf8'));
    const top = Math.min(...secs.map((s) => s.level), 6);
    return { file: f, lines: lines.length, sections: secs.filter((s) => s.level <= top + 1).map((s) => ({ title: s.title, level: s.level, lines: s.end - s.start })) };
  });
}
