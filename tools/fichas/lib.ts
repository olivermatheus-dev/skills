// Núcleo das fichas de análise (tarefa 040): caminhos, vocabulário, leitura/gravação validada, item do snapshot.
// Sem rede e sem LLM. O preparo de mídia fica em preparar.ts; os comandos em cli.ts.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { Ficha, fichaFileName, issuesFicha, type VocabCtx } from '../../schema/ficha';
import { Vocabulario } from '../../schema/vocabulario';
import { Snapshot } from '../../schema/competitor';

export const ROOT = process.env.HUB_ROOT ?? process.cwd();
export const compDir = (slug: string, comp: string) => join(ROOT, 'companies', slug, 'competitors', comp);
export const fichasDir = (slug: string, comp: string) => join(compDir(slug, comp), 'fichas');
export const fichaPath = (slug: string, comp: string, key: string) => join(fichasDir(slug, comp), fichaFileName(key));
/** pesados (áudio, quadros, legenda bruta): fora do git */
export const dadosDir = (slug: string, comp: string, key: string) => join(ROOT, 'data', 'intel', slug, comp, fichaFileName(key).replace(/\.json$/, ''));
export const VOCAB_FILE = join(ROOT, 'library', 'analise', 'vocabulario.json');

export const sha1 = (s: string) => createHash('sha1').update(s).digest('hex');
export const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const readJson = (f: string) => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));

// ───────────────────────── vocabulário ─────────────────────────
export function loadVocab(): Vocabulario {
  const r = Vocabulario.safeParse(readJson(VOCAB_FILE));
  if (!r.success) throw new Error(`library/analise/vocabulario.json inválido:\n  ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ')}`);
  return r.data;
}

export function loadTags(slug: string): VocabCtx['tags'] {
  const out = { tema: [] as string[], angulo: [] as string[], publico: [] as string[] };
  const f = join(ROOT, 'companies', slug, 'tags.yml');
  if (!existsSync(f)) return out;
  const tags = (YAML.parse(readFileSync(f, 'utf8'))?.tags ?? []) as { id: string; grupo?: string }[];
  for (const t of tags) if (t.grupo && t.grupo in out) out[t.grupo as keyof typeof out].push(t.id);
  return out;
}

export function loadFormatos(): string[] {
  const d = join(ROOT, 'library', 'formatos');
  return existsSync(d) ? readdirSync(d).filter((x) => existsSync(join(d, x, 'formato.json'))) : [];
}

export function vocabCtx(slug: string): Omit<VocabCtx, 'termosNovos'> {
  return { vocab: loadVocab(), formatos: loadFormatos(), tags: loadTags(slug) };
}

// ───────────────────────── ficha: ler e gravar (sempre validada) ─────────────────────────
export function parseFicha(raw: unknown, slug: string, file = 'ficha'): Ficha {
  const r = Ficha.safeParse(raw);
  if (!r.success) throw new Error(`${file}: ${r.error.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`).join('; ')}`);
  const bad = issuesFicha(r.data, vocabCtx(slug));
  if (bad.length) throw new Error(`${file}:\n  - ${bad.join('\n  - ')}`);
  return r.data;
}

export function readFicha(slug: string, comp: string, key: string): Ficha | null {
  const f = fichaPath(slug, comp, key);
  return existsSync(f) ? parseFicha(readJson(f), slug, f) : null;
}

export function writeFicha(slug: string, comp: string, ficha: Ficha) {
  parseFicha(ficha, slug); // não grava nada inválido
  mkdirSync(fichasDir(slug, comp), { recursive: true });
  writeFileSync(fichaPath(slug, comp, ficha.key), `${JSON.stringify(ficha, null, 2)}\n`);
}

/** chave `<plataforma>:<itemId>`; aceita também a URL do item */
export function parseKey(k: string): { plataforma: string; id: string } {
  const m = k.match(/^(instagram|tiktok|youtube|meta-ads):(.+)$/);
  if (!m) throw new Error(`chave inválida "${k}": use <plataforma>:<itemId> (instagram, tiktok, youtube, meta-ads)`);
  return { plataforma: m[1], id: m[2] };
}

// ───────────────────────── snapshots ─────────────────────────
export interface SnapEntry { key: string; file: string; data: Snapshot }
export function readSnapshots(slug: string, comp: string): SnapEntry[] {
  const sd = join(compDir(slug, comp), 'snapshots');
  if (!existsSync(sd)) return [];
  return readdirSync(sd, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) =>
    readdirSync(join(sd, d.name)).filter((f) => f.endsWith('.json')).map((f) => ({ key: d.name, file: `snapshots/${d.name}/${f}`, data: Snapshot.parse(readJson(join(sd, d.name, f))) })));
}

/** a coleta mais recente que traz o item */
export function findItem(slug: string, comp: string, key: string) {
  const { plataforma, id } = parseKey(key);
  const hits = readSnapshots(slug, comp).filter((s) => s.data.platform === plataforma && s.data.items.some((i) => i.id === id))
    .sort((a, b) => a.data.collectedAt.localeCompare(b.data.collectedAt));
  const s = hits.at(-1);
  if (!s) throw new Error(`item ${key} não está em nenhuma coleta de ${comp} (rode npm run collect antes)`);
  return { snap: s, item: s.data.items.find((i) => i.id === id)!, plataforma, id };
}

// ───────────────────────── texto ─────────────────────────
/** legenda sem listas de links e com hashtags sem repetição (Mais Terapias tem 4 mil caracteres de links) */
export function limparLegenda(txt: string | null | undefined, max = 1500): string {
  if (!txt) return '';
  const linhas = txt.split(/\r?\n/).map((l) => l.replace(/https?:\/\/\S+/g, '').trim()).filter((l, i, a) => l || (a[i - 1] ?? '') !== '');
  const vistos = new Set<string>();
  const out = linhas.join('\n').replace(/#[\p{L}\p{N}_]+/gu, (h) => (vistos.has(h.toLowerCase()) ? '' : (vistos.add(h.toLowerCase()), h))).replace(/[ \t]{2,}/g, ' ').trim();
  return out.length > max ? `${out.slice(0, max)}…` : out;
}

export function hashEntrada(item: { id: string; caption?: string | null; title?: string | null; durationS?: number | null; url: string }) {
  return sha1([item.id, item.caption ?? item.title ?? '', item.durationS ?? '', item.url].join('|'));
}
