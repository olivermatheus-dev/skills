// Passo 1 da rodada: busca nas fontes com API/RSS, normaliza, deduplica e grava data/curadoria/<slug>/<rodada>/brutos.json. Sem LLM.
// Erro numa fonte não para a rodada: fica no perSource (mesmo padrão de tools/intel/collect.ts).
import { existsSync } from 'node:fs';
import * as S from '../../core/store';
import type { CuratedSource } from '../../schema';
import { realRunner } from '../intel/runner';
import { env } from '../intel/env';
import { ADAPTERS, queriesFor } from './adapters';
import { queriesFile, readJsonFile, work, writeJsonFile, type Queries } from './paths';
import { titleKey } from './text';
import type { RawFile, RawItem, SearchParams, SourceRun } from './types';

const NEWS_TYPES = new Set(['noticia']);
const daysBefore = (iso: string, d: number) => new Date(Date.parse(iso) - d * 86_400_000).toISOString().slice(0, 10);

function merge(into: RawItem, it: RawItem) {
  into.sourceIds = [...new Set([...into.sourceIds, ...it.sourceIds])];
  if ((it.abstract?.length ?? 0) > (into.abstract?.length ?? 0)) into.abstract = it.abstract;
  into.doi ??= it.doi; into.pmid ??= it.pmid; into.venue ??= it.venue; into.publishedAt ??= it.publishedAt;
  into.evidence ??= it.evidence; into.openAccess ||= it.openAccess; into.brazilian ||= it.brazilian;
  into.altUrls = [...new Set([...into.altUrls, it.url, ...it.altUrls])].filter((u) => u !== into.url);
  into.pubTypes = [...new Set([...into.pubTypes, ...it.pubTypes])].filter(Boolean);
}

/** `only` = refaz só essas fontes e junta ao brutos.json que já existe (ex.: repetir as que deram erro) */
export async function buscar(slug: string, round: string, only: string[] = [], log = console.log): Promise<RawFile> {
  const req = S.getRoundRequest(slug, round);
  const q = readJsonFile<Queries>(queriesFile(slug, round));
  const all = new Map(S.listSources(slug).map((s) => [s.id, s]));
  const base: SearchParams = { queries: [], from: req.period.from, to: req.period.to, max: q.max ?? 20, languages: req.languages };
  const newsFrom = daysBefore(req.period.to, q.noticiasDias ?? 60);
  const ctx = { runner: realRunner, env: (k: string) => env(k, slug), now: new Date() };
  const perSource: SourceRun[] = [];
  const byKey = new Map<string, RawItem>(), byTitle = new Map<string, RawItem>();
  const file = work(slug, round, 'brutos.json');
  if (only.length && existsSync(file)) {
    const prev = readJsonFile<RawFile>(file);
    perSource.push(...prev.perSource.filter((p) => !only.includes(p.sourceId)));
    for (const it of prev.items) {
      it.sourceIds = it.sourceIds.filter((id) => !only.includes(id));
      if (!it.sourceIds.length) continue;
      byKey.set(it.key, it); byTitle.set(titleKey(it.title), it);
    }
  }

  for (const id of only.length ? req.sources.filter((x) => only.includes(x)) : req.sources) {
    const src = all.get(id) as CuratedSource | undefined;
    const run: SourceRun = { sourceId: id, status: 'ok', fetched: 0, errors: [], warnings: [] };
    perSource.push(run);
    if (!src) { run.status = 'erro'; run.errors.push('fonte não existe em fontes.json'); continue; }
    const fn = src.access.adapter ? ADAPTERS[src.access.adapter] : undefined;
    if (!fn) {
      run.status = 'bloqueado';
      run.errors.push(`sem coletor por script (método ${src.access.method}${src.access.adapter ? `, ${src.access.adapter}` : ''}): só na rodada normal, pelo subagente que lê a página`);
      continue;
    }
    const news = NEWS_TYPES.has(src.type);
    const p: SearchParams = { ...base, from: news ? newsFrom : base.from, queries: news ? (q.noticias?.length ? q.noticias : q.pt) : queriesFor(src, base, q) };
    if (!p.queries.length) { run.status = 'vazio'; run.warnings.push('nenhuma consulta no idioma da fonte'); continue; }
    try {
      const r = await fn(src, p, ctx);
      run.warnings.push(...r.warnings);
      run.fetched = r.items.length;
      if (!r.items.length) run.status = 'vazio';
      for (const it of r.items) {
        const tk = titleKey(it.title);
        const hit = byKey.get(it.key) ?? byTitle.get(tk);
        if (hit) merge(hit, it);
        else { byKey.set(it.key, it); byTitle.set(tk, it); }
      }
    } catch (e) {
      run.status = 'erro';
      run.errors.push(String((e as Error)?.message ?? e));
    }
    log(`${run.status === 'ok' ? '✓' : run.status === 'vazio' ? '·' : '✗'} ${id}: ${run.fetched} itens${run.errors.length ? ` — ${run.errors.join('; ')}` : ''}`);
  }
  perSource.sort((a, b) => req.sources.indexOf(a.sourceId) - req.sources.indexOf(b.sourceId));
  const out: RawFile = { round, slug, fetchedAt: new Date().toISOString(), params: { ...base, queries: [...q.pt, ...q.en], newsFrom }, perSource, items: [...byKey.values()] };
  writeJsonFile(file, out);
  log(`→ ${out.items.length} itens únicos em ${file}`);
  return out;
}
