// Chaves de API: uma .env por projeto (companies/<slug>/.env) e a .env geral do hub (raiz), as duas fora do git.
// Ordem de leitura de qualquer ferramenta: ambiente do processo > .env do projeto > .env geral.
// A interface nunca recebe o valor inteiro: só se está definida, em qual nível e os 4 últimos caracteres.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ValidationError } from './store';
import { company } from '../schema/paths';

export interface SecretDef { key: string; label: string; hint: string; test?: 'elevenlabs' }
/** Chaves conhecidas (aparecem na tela). Outras podem existir no arquivo e são preservadas. */
export const SECRETS: SecretDef[] = [
  { key: 'ELEVENLABS_API_KEY', label: 'ElevenLabs', hint: 'Voz final (Eleven v4) e efeitos. elevenlabs.io → Developers → API Keys.', test: 'elevenlabs' },
  { key: 'APIFY_TOKEN', label: 'Apify', hint: 'Coleta de Instagram com views (concorrentes).' },
  { key: 'YOUTUBE_API_KEY', label: 'YouTube Data API', hint: 'Coleta de YouTube mais rica (opcional; sem ela usa o yt-dlp).' },
  { key: 'META_ACCESS_TOKEN', label: 'Meta (token)', hint: 'Leitura de anúncios e posts da conta.' },
  { key: 'META_IG_BUSINESS_ID', label: 'Meta (ID do Instagram Business)', hint: 'Par do token acima.' },
];

export type Scope = 'projeto' | 'geral';
export interface SecretState extends SecretDef { project: string | null; general: string | null; active: Scope | null }

const KEY = /^[A-Z][A-Z0-9_]*$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
export const envFile = (slug: string | null) => {
  if (slug !== null && !SLUG.test(slug)) throw new ValidationError(slug, ['slug inválido']);
  return join(ROOT, slug === null ? '.env' : company(slug), '.env');
};

export function parseEnv(txt: string): Record<string, string> {
  const out: Record<string, string> = {};
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
const read = (slug: string | null) => { const f = envFile(slug); return existsSync(f) ? parseEnv(readFileSync(f, 'utf8')) : {}; };
const mask = (v?: string) => (v ? `••••${v.slice(-4)}` : null);

export function listSecrets(slug: string): SecretState[] {
  const p = read(slug), g = read(null);
  const extra = Object.keys(p).filter((k) => !SECRETS.some((s) => s.key === k)).map((key) => ({ key, label: key, hint: 'Chave extra deste projeto.' }));
  return [...SECRETS, ...extra].map((d) => ({
    ...d, project: mask(p[d.key]), general: mask(g[d.key]),
    active: p[d.key] ? 'projeto' : g[d.key] ? 'geral' : null,
  }));
}

/** Grava (ou apaga, com valor vazio) uma chave mexendo só na linha dela; comentários e outras chaves ficam. */
export function setSecret(slug: string | null, key: string, value: string) {
  if (!KEY.test(key)) throw new ValidationError(key, ['nome de chave inválido (use MAIÚSCULAS_E_SUBLINHADO)']);
  const v = value.trim();
  if (/[\r\n]/.test(v)) throw new ValidationError(key, ['o valor não pode ter quebra de linha']);
  const f = envFile(slug);
  const lines = existsSync(f) ? readFileSync(f, 'utf8').split(/\r?\n/) : [`# Chaves de API ${slug ? `do projeto ${slug}` : 'gerais do hub'} (fora do git). Editável pela interface: Configurações.`];
  const i = lines.findIndex((l) => new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(l));
  const line = `${key}=${v}`;
  if (i >= 0) { if (v) lines[i] = line; else lines.splice(i, 1); } else if (v) lines.push(line);
  while (lines.length && lines.at(-1) === '') lines.pop();
  writeFileSync(f, lines.join('\n') + '\n');
  return listSecrets(slug ?? '').find((s) => s.key === key) ?? null;
}

/** Valor efetivo para as ferramentas: ambiente > projeto > geral. */
export function secret(key: string, slug?: string | null): string | undefined {
  if (process.env[key]) return process.env[key];
  return (slug ? read(slug)[key] : undefined) || read(null)[key] || undefined;
}

/** Confere se a chave funciona (sem gastar crédito): ElevenLabs → GET /v1/user. */
export async function testSecret(slug: string, key: string) {
  const def = SECRETS.find((s) => s.key === key);
  const v = secret(key, slug);
  if (!v) return { ok: false, message: 'chave não definida' };
  if (def?.test !== 'elevenlabs') return { ok: true, message: 'definida (sem teste automático para esta chave)' };
  const r = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': v } });
  if (!r.ok) {
    const t = await r.text();
    // chave com permissões restritas: válida, só não lê o plano
    if (/missing_permissions/.test(t)) return { ok: true, message: 'chave aceita (sem a permissão "User: read", então não dá para mostrar plano e créditos)' };
    return { ok: false, message: `ElevenLabs recusou (${r.status}): ${t.slice(0, 200)}` };
  }
  const s = await r.json() as { tier?: string; character_count?: number; character_limit?: number; next_character_count_reset_unix?: number };
  const reset = s.next_character_count_reset_unix ? new Date(s.next_character_count_reset_unix * 1000).toLocaleDateString('pt-BR') : '?';
  return { ok: true, message: `plano ${s.tier ?? '?'} · ${s.character_count ?? '?'} de ${s.character_limit ?? '?'} créditos usados · renova em ${reset}` };
}
