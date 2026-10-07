// Leitor mínimo de .env (KEY=VALUE). Cada coletor pede só a própria chave; process.env tem prioridade.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

let cache: Record<string, string> | null = null;

export function parseEnv(txt: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    else v = v.replace(/\s+#.*$/, '');
    out[m[1]] = v;
  }
  return out;
}

function envFiles() {
  const here = (() => { try { return fileURLToPath(new URL('../../.env', import.meta.url)); } catch { return ''; } })();
  return [process.env.HUB_ENV_FILE, here, process.env.HUB_ROOT && join(process.env.HUB_ROOT, '.env'), join(process.cwd(), '.env')].filter(Boolean) as string[];
}

const projectCache = new Map<string, Record<string, string>>();
/** .env do projeto (companies/<slug>/.env, salvo pela tela Configurações): vem antes da .env geral. */
function projectEnv(slug: string) {
  if (!projectCache.has(slug)) {
    const f = join(process.env.HUB_ROOT ?? fileURLToPath(new URL('../..', import.meta.url)), 'companies', slug, '.env');
    projectCache.set(slug, existsSync(f) ? parseEnv(readFileSync(f, 'utf8')) : {});
  }
  return projectCache.get(slug)!;
}

export function env(key: string, slug?: string): string | undefined {
  if (key in process.env) return process.env[key] || undefined; // definido (mesmo vazio) no ambiente manda
  if (slug && /^[a-z0-9][a-z0-9-]*$/.test(slug) && projectEnv(slug)[key]) return projectEnv(slug)[key];
  if (!cache) {
    cache = {};
    for (const f of envFiles().reverse()) if (existsSync(f)) Object.assign(cache, parseEnv(readFileSync(f, 'utf8')));
  }
  return cache[key] || undefined;
}
export const resetEnvCache = () => { cache = null; projectCache.clear(); };
