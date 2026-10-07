// Coletores de concorrentes: para cada perfil cadastrado, puxa perfil + conteúdos e grava um snapshot NOVO (imutável).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import * as S from '../../core/store';
import { P } from '../../schema';
import type { Snapshot } from '../../schema';
import { ADAPTERS } from './adapters';
import { env } from './env';
import { keyFor } from './keys';
import { attachMedia } from './media';
import { realRunner } from './runner';
import type { Adapter, CollectResult, Runner, SnapshotDraft } from './types';

export type { CollectResult } from './types';

export interface CollectOptions {
  platforms?: string[];
  /** itens por perfil (no YouTube: por aba, vídeos e shorts). Padrão 30. */
  maxItems?: number;
  /** testes/demonstração: troca rede e processos por fixtures */
  runner?: Runner;
  adapters?: Record<string, Adapter>;
  now?: Date;
  source?: Snapshot['source'];
  /** não baixar imagens */
  noMedia?: boolean;
}

const stampOf = (iso: string) => iso.slice(0, 19).replace(/:/g, '-'); // igual ao saveSnapshot do store

/**
 * O store nomeia o arquivo pelo minuto da coleta: duas coletas no mesmo minuto sobrescreveriam a anterior.
 * Para manter a promessa de imutabilidade, avança collectedAt para o próximo minuto livre.
 */
function freeCollectedAt(slug: string, id: string, key: string, iso: string) {
  let t = new Date(iso).getTime();
  const taken = (ms: number) => existsSync(join(S.ROOT, P.snapshots(slug, id), key, `${stampOf(new Date(ms).toISOString())}.json`));
  while (taken(t)) t += 60_000;
  return new Date(t).toISOString().replace(/\.\d+Z$/, 'Z');
}

function useful(s: SnapshotDraft) {
  const p = s.profile ?? {};
  return (s.items?.length ?? 0) > 0 || p.followers != null || !!p.name || !!p.bio;
}

export async function collectCompetitor(slug: string, id: string, opt: CollectOptions = {}): Promise<CollectResult[]> {
  const comp = S.getCompetitor(slug, id).data;
  const runner = opt.runner ?? realRunner;
  const adapters = opt.adapters ?? ADAPTERS;
  const maxItems = Math.max(1, Math.min(200, opt.maxItems ?? 30));
  const compDir = join(S.ROOT, P.competitor(slug, id));
  // perfis sem coletor (Facebook, LinkedIn, X, lojas) são só links de referência: não entram na coleta nem viram erro
  const profiles = comp.profiles.filter((p) => (opt.platforms?.length ? opt.platforms.includes(p.platform) : !!adapters[p.platform]));

  const results = await Promise.all(profiles.map(async (p): Promise<CollectResult> => {
    const key = keyFor(p);
    const res: CollectResult = { key, platform: p.platform, url: p.url, ok: false, items: 0, errors: [], warnings: [] };
    const adapter = adapters[p.platform];
    if (!adapter) { res.errors.push(`coleta automática de ${p.platform} ainda não existe (por enquanto: YouTube, TikTok, Instagram e site)`); return res; }
    let snap: SnapshotDraft;
    try {
      snap = await adapter.collect(p, { runner, maxItems, env: (k: string) => env(k, slug), now: opt.now ?? new Date() });
    } catch (e) {
      res.errors.push(String((e as Error)?.message ?? e));
      return res;
    }
    if (!useful(snap)) { res.errors.push(...(snap.errors ?? []), 'a plataforma não devolveu dados'); return res; }
    if (opt.source) snap.source = opt.source;
    if (!opt.noMedia) {
      const m = await attachMedia(snap, key, compDir, runner);
      if (m.failed) res.warnings.push(`${m.failed} imagem(ns) não baixada(s) (a tela usa o link remoto)`);
    }
    snap.collectedAt = freeCollectedAt(slug, id, key, snap.collectedAt);
    try {
      const saved = S.saveSnapshot(slug, id, key, snap);
      Object.assign(res, {
        ok: true, items: saved.data.items.length, followers: saved.data.profile.followers, source: saved.data.source,
        file: saved.file, errors: saved.data.errors,
      });
    } catch (e) {
      res.errors.push(e instanceof S.ValidationError ? `dados inválidos: ${e.issues.slice(0, 3).join('; ')}` : String(e));
    }
    return res;
  }));
  // coleta feita (algum perfil ok) = módulo "redes" da análise atendido: sai da fila
  if (results.some((r) => r.ok) && !opt.runner) S.clearAnalysisRequest(slug, id, ['redes']);
  return results;
}

/** todos os concorrentes ativos, um por vez */
export async function collectAll(slug: string, opt: CollectOptions = {}, onEach?: (id: string, r: CollectResult[]) => void) {
  const out: Record<string, CollectResult[]> = {};
  for (const c of S.listCompetitors(slug).filter((c) => c.data.status === 'ativo')) {
    out[c.data.id] = await collectCompetitor(slug, c.data.id, opt);
    onEach?.(c.data.id, out[c.data.id]);
  }
  return out;
}
