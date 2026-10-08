// Passo 4→5: grava o que a síntese (Opus) decidiu. Lê data/.../sintese.json e verificados.json e escreve:
//   curadoria/referencias/R-NNNN.json (só achado verificado) · ideas/I-NNNN-*.md (origin: pesquisa, refs, ## Fontes) · rodadas/<id>/resultado.json.
// Recusa ideia sem referência e referência que não passou nos três testes. Sem LLM.
import * as S from '../../core/store';
import type { SourceRef } from '../../schema';
import { readJsonFile, work, writeJsonFile } from './paths';
import type { Candidate, RawFile, Verified } from './types';

export interface SynthIdea {
  title: string;
  /** candidatos verificados (C-NNN) que sustentam a ideia; o 1º é a referência principal */
  refs: string[];
  pillar?: number;
  series?: number;
  score: number;
  objective?: 'informar' | 'novidade' | 'curiosidade' | 'engajar' | 'converter' | 'polemica';
  tone?: 'dramatico' | 'epico' | 'animado' | 'inspirador' | 'calmo' | 'urgente' | 'curioso';
  format?: string;
  tags?: string[];
  /** ficha de pauta em markdown (sem a seção ## Fontes, que o script escreve) */
  body: string;
}
export interface Synthesis { ideas: SynthIdea[]; notes?: string; cost?: { usd: number; byModel: Record<string, number> } }

const EVID: Record<string, string> = {
  'meta-analise': 'meta-análise', 'revisao-sistematica': 'revisão sistemática', 'ensaio-clinico': 'ensaio clínico', observacional: 'estudo observacional',
  qualitativo: 'estudo qualitativo', 'revisao-narrativa': 'revisão narrativa', documento: 'documento', opiniao: 'opinião',
};

export function fontesSection(refs: SourceRef[]): string {
  return ['## Fontes', ...refs.map((r) => [
    `- [${r.id}] ${r.title} — ${r.venue ?? 's/ veículo'}${r.publishedAt ? `, ${r.publishedAt.slice(0, 4)}` : ''}. ${r.doi ? `https://doi.org/${r.doi}` : r.url}${r.evidence ? ` (${EVID[r.evidence] ?? r.evidence})` : ''}`,
    `  Trecho do ${r.quoteFrom === 'resumo' ? 'resumo' : r.quoteFrom}: "${r.quote}"`,
    `  O que dá para afirmar: ${r.summary}`,
    `  Verificado em ${r.verify.checkedAt.slice(0, 10)}: link ok · DOI ${r.verify.doiOk == null ? 'sem DOI' : r.verify.doiOk ? 'ok' : 'falhou'} · trecho achado.`,
  ].join('\n'))].join('\n');
}

export function gravar(slug: string, round: string, log = console.log) {
  const req = S.getRoundRequest(slug, round);
  const raw = readJsonFile<RawFile>(work(slug, round, 'brutos.json'));
  const cands = readJsonFile<Candidate[]>(work(slug, round, 'candidatos.json'));
  const ver = readJsonFile<Verified[]>(work(slug, round, 'verificados.json'));
  const syn = readJsonFile<Synthesis>(work(slug, round, 'sintese.json'));
  const okByCand = new Map(ver.filter((v) => v.ok).map((v) => [v.cand, v]));
  const sources = new Map(S.listSources(slug).map((s) => [s.id, s]));

  // 1. checa tudo antes de escrever qualquer arquivo
  for (const i of syn.ideas) {
    if (!i.refs.length) throw new Error(`ideia sem referência: "${i.title}"`);
    const bad = i.refs.filter((c) => !okByCand.has(c));
    if (bad.length) throw new Error(`"${i.title}" cita ${bad.join(', ')}, que não passou na verificação`);
    const noSum = i.refs.filter((c) => !okByCand.get(c)!.summary.trim());
    if (noSum.length) throw new Error(`${noSum.join(', ')} sem paráfrase (summary) em achados.json: a síntese escreve antes de gravar`);
  }

  // 2. referências (reaproveita R-NNNN se o mesmo DOI/URL já existe)
  const existing = S.listRefs(slug);
  const refByCand = new Map<string, SourceRef>();
  let offset = 0;
  const used = [...new Set(syn.ideas.flatMap((i) => i.refs))];
  for (const c of used) {
    const v = okByCand.get(c)!;
    const it = v.item;
    const prev = existing.find((r) => (it.doi && r.doi === it.doi) || r.url === v.url);
    const sourceId = [...it.sourceIds].filter((id) => req.sources.includes(id)).sort((a, b) => (sources.get(b)?.weight ?? 0) - (sources.get(a)?.weight ?? 0))[0] ?? it.sourceIds[0];
    const ref: SourceRef = prev ? { ...prev, verify: { checkedAt: v.verify.checkedAt, linkOk: v.verify.linkOk, doiOk: v.verify.doiOk ?? undefined, quoteFound: v.verify.quoteFound } } : {
      id: S.nextRefId(slug, offset++), sourceId,
      kind: it.kind === 'artigo' && (v.evidence === 'meta-analise' || v.evidence === 'revisao-sistematica' || v.evidence === 'revisao-narrativa') ? 'revisao' : it.kind,
      title: it.title, url: v.url, doi: it.doi, authors: it.authors.slice(0, 6), venue: it.venue, publishedAt: it.publishedAt,
      language: it.language, evidence: v.evidence ?? it.evidence, quote: v.quote, quoteFrom: v.quoteFrom, summary: v.summary,
      verify: { checkedAt: v.verify.checkedAt, linkOk: v.verify.linkOk, doiOk: v.verify.doiOk ?? undefined, quoteFound: v.verify.quoteFound },
      round, ideas: [], starred: false, created: S.today(),
    };
    refByCand.set(c, ref);
  }

  // 3. ideias
  const ideaIds: string[] = [];
  for (const i of syn.ideas) {
    const refs = i.refs.map((c) => refByCand.get(c)!);
    // {C-NNN} no corpo vira o id da referência (R-NNNN): a "Prova" da ficha aponta para a referência, nunca para "estudos mostram"
    const text = i.body.trim().replace(/\{(C-\d{3})\}/g, (m, c: string) => refByCand.get(c)?.id ?? m);
    const loose = text.match(/\{C-\d{3}\}/g);
    if (loose) throw new Error(`"${i.title}" cita ${loose.join(', ')} no corpo sem pôr em refs`);
    const body = `${text}\n\n${fontesSection(refs)}\n\n## Observações do Oliver\n`;
    const d = S.saveIdea(slug, {
      title: i.title, status: 'nova', origin: 'pesquisa', refs: refs.map((r) => r.id), pillar: i.pillar ?? null, series: i.series ?? req.series ?? null,
      round, score: i.score, objective: i.objective ?? null, tone: i.tone ?? null, format: i.format ?? null, tags: i.tags ?? [],
    }, body);
    ideaIds.push(d.data.id);
    for (const r of refs) r.ideas = [...new Set([...r.ideas, d.data.id])];
    log(`+ ${d.data.id} ${i.title}  ← ${refs.map((r) => r.id).join(', ')}`);
  }
  for (const r of refByCand.values()) S.saveRef(slug, r);

  // 4. resultado da rodada
  const candSrc = new Map(cands.map((c) => [c.id, raw.items.find((x) => x.key === c.key)?.sourceIds ?? []]));
  const count = (ids: string[], id: string) => ids.filter((c) => candSrc.get(c)?.includes(id)).length;
  const findings = ver.map((v) => v.cand);
  const perSource = raw.perSource.map((p) => ({
    sourceId: p.sourceId, status: p.status, fetched: p.fetched,
    kept: count(findings, p.sourceId), verified: count(ver.filter((v) => v.ok).map((v) => v.cand), p.sourceId),
    error: p.errors.length ? p.errors.join('; ').slice(0, 500) : null,
  }));
  const res = S.saveRoundResult(slug, round, {
    finishedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), perSource, ideas: ideaIds, refs: [...refByCand.values()].map((r) => r.id),
    dropped: ver.filter((v) => !v.ok && v.url).map((v) => ({ title: v.item?.title ?? v.cand, url: v.url, reason: v.reason ?? '' })),
    cost: syn.cost ?? null, notes: syn.notes ?? '',
  });
  S.saveRoundRequest(slug, { ...req, status: 'feito' });
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  for (const id of new Set(res.refs.map((rid) => [...refByCand.values()].find((r) => r.id === rid)!.sourceId))) {
    const s = sources.get(id);
    if (s) S.saveSource(slug, { id, name: s.name, url: s.url, lastUsedAt: now });
  }
  writeJsonFile(work(slug, round, 'gravado.json'), { ideas: ideaIds, refs: res.refs });
  log(`→ ${ideaIds.length} ideias, ${res.refs.length} referências; resultado em companies/${slug}/curadoria/rodadas/${round}/resultado.json`);
  return res;
}
