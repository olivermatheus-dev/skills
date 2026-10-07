// Chaves de API para os scripts .mjs. Ordem: ambiente do processo > companies/<slug>/.env (tela Configurações) > .env da raiz.
// Mesma regra de core/secrets.ts (app) e tools/intel/env.ts (coletas).
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUB = process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function parseEnv(txt) {
  const out = {};
  for (const raw of txt.split(/\r?\n/)) {
    const m = raw.trim().match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    else v = v.replace(/\s+#.*$/, '');
    out[m[1]] = v;
  }
  return out;
}
const read = (f) => (existsSync(f) ? parseEnv(readFileSync(f, 'utf8')) : {});

/** Valor da chave para a empresa (ou só a geral, sem slug) e de onde veio. */
export function envFor(key, slug) {
  if (process.env[key]) return { value: process.env[key], from: 'ambiente' };
  if (slug) { const v = read(join(HUB, 'companies', slug, '.env'))[key]; if (v) return { value: v, from: `companies/${slug}/.env` }; }
  const v = read(join(HUB, '.env'))[key];
  return v ? { value: v, from: '.env (geral)' } : { value: undefined, from: null };
}
