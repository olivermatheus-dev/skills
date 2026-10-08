// Passo 2 (parte por script): pré-triagem por regra, sem LLM. Corta o que não pode virar referência e ordena o resto,
// para a triagem do modelo barato (Haiku) ler só título + resumo dos N melhores (candidatos.json).
// Sem a ferramenta Agent, a mesma nota serve de triagem final (modo --sem-modelo): ver a skill `curadoria`.
import * as S from '../../core/store';
import { queriesFile, readJsonFile, work, writeJsonFile, type Queries } from './paths';
import { EVIDENCE_RANK, norm, words } from './text';
import type { Candidate, RawFile, RawItem } from './types';

/** por que um item sai antes de qualquer modelo ler */
export function dropReason(it: RawItem): string | null {
  const science = it.kind === 'artigo' || it.kind === 'revisao';
  if (science && words(it.abstract ?? '') < 60) return 'sem resumo utilizável (o trecho precisa sair do resumo)';
  if (science && !it.doi) return 'sem DOI (a verificação exige DOI em artigo)';
  if (it.evidence === 'opiniao') return 'editorial/opinião';
  if (/\b(erratum|errata|corrigendum|retraction|retratação|protocol for|study protocol|protocolo de estudo)\b/i.test(it.title)) return 'errata, retratação ou protocolo';
  return null;
}

/** nota 0–10 por regra: aderência aos termos · força da evidência · Brasil · acesso aberto · peso da fonte · recência */
export function preScore(it: RawItem, termos: string[], weight: (id: string) => number, to: string): number {
  const t = norm(`${it.title} ${it.title} ${it.abstract ?? ''}`);
  const hits = termos.filter((x) => t.includes(norm(x))).length;
  const rel = Math.min(4, hits * 1.2);
  const ev = it.evidence ? EVIDENCE_RANK[it.evidence] * 0.5 : 1;
  const br = it.brazilian ? 1.5 : 0;
  const oa = it.openAccess ? 0.3 : 0;
  const w = Math.max(...it.sourceIds.map(weight), 1) * 0.2;
  const ageDays = it.publishedAt ? (Date.parse(to) - Date.parse(it.publishedAt)) / 86_400_000 : 365;
  const rec = ageDays < 180 ? 0.5 : ageDays < 365 ? 0.25 : 0;
  return Math.round(Math.min(10, rel + ev + br + oa + w + rec) * 10) / 10;
}

export function triar(slug: string, round: string, top = 60, log = console.log) {
  const raw = readJsonFile<RawFile>(work(slug, round, 'brutos.json'));
  const q = readJsonFile<Queries>(queriesFile(slug, round));
  const weights = new Map(S.listSources(slug).map((s) => [s.id, s.weight]));
  const termos = q.termos ?? [];
  const dropped: { key: string; title: string; reason: string }[] = [];
  const kept: (RawItem & { preScore: number })[] = [];
  for (const it of raw.items) {
    const science = it.kind === 'artigo' || it.kind === 'revisao';
    const r = science && it.publishedAt && it.publishedAt < raw.params.from ? `fora do período (${it.publishedAt})` : dropReason(it);
    if (r) { dropped.push({ key: it.key, title: it.title, reason: r }); continue; }
    kept.push({ ...it, preScore: preScore(it, termos, (id) => weights.get(id) ?? 1, raw.params.to) });
  }
  kept.sort((a, b) => b.preScore - a.preScore);
  const cands: Candidate[] = kept.slice(0, top).map((it, i) => ({
    id: `C-${String(i + 1).padStart(3, '0')}`, key: it.key, title: it.title,
    abstract: (it.abstract ?? '').slice(0, 2200), venue: it.venue, year: it.publishedAt?.slice(0, 4),
    language: it.language, evidenceHint: it.evidence, brazilian: it.brazilian, preScore: it.preScore,
  }));
  writeJsonFile(work(slug, round, 'candidatos.json'), cands);
  writeJsonFile(work(slug, round, 'pretriagem-descartes.json'), dropped);
  log(`pré-triagem: ${raw.items.length} brutos → ${kept.length} aproveitáveis → ${cands.length} candidatos (${cands.filter((c) => c.brazilian).length} brasileiros); ${dropped.length} descartados por regra`);
  return cands;
}

/** junta itens escolhidos a dedo (por DOI ou chave) ao fim de candidatos.json, sem renumerar os que já existem */
export function anexar(slug: string, round: string, keys: string[], log = console.log) {
  const raw = readJsonFile<RawFile>(work(slug, round, 'brutos.json'));
  const file = work(slug, round, 'candidatos.json');
  const cands = readJsonFile<Candidate[]>(file);
  let n = Math.max(0, ...cands.map((c) => +c.id.slice(2)));
  for (const k of keys) {
    const key = k.startsWith('doi:') || k.startsWith('pmid:') || k.startsWith('url:') ? k : `doi:${k.toLowerCase()}`;
    const it = raw.items.find((i) => i.key === key);
    if (!it) { log(`✗ ${k}: não está nos brutos`); continue; }
    if (cands.some((c) => c.key === key)) { log(`· ${k}: já é candidato`); continue; }
    const r = dropReason(it);
    if (r) { log(`✗ ${k}: ${r}`); continue; }
    const c: Candidate = { id: `C-${String(++n).padStart(3, '0')}`, key, title: it.title, abstract: (it.abstract ?? '').slice(0, 2200), venue: it.venue, year: it.publishedAt?.slice(0, 4), language: it.language, evidenceHint: it.evidence, brazilian: it.brazilian, preScore: 0 };
    cands.push(c);
    log(`+ ${c.id} ${it.title.slice(0, 80)}`);
  }
  writeJsonFile(file, cands);
}

/** trecho literal por regra: a frase de resultado/conclusão do resumo (12–40 palavras; se passar, corta no fim de uma palavra) */
export function autoQuote(abstract: string): string | null {
  const sents = abstract.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/).map((s) => s.replace(/^(conclus(ion|ions|ão|ões)|results?|resultados?|discussion)\s*:?\s*/i, '').trim());
  const RE = /conclu|we found|showed|no significant|significant|associated|were unrelated|equivalent|similar|não houve|resultados indicam|mostraram|associad|semelhante|indicam|evidenciam/i;
  const pick = [...sents].reverse().find((s) => RE.test(s) && words(s) >= 12) ?? sents.find((s) => words(s) >= 12);
  if (!pick) return null;
  const w = pick.split(' ');
  return (w.length > 40 ? w.slice(0, 40).join(' ') : pick).replace(/[;,:]$/, '');
}

/** triagem sem modelo (sem a ferramenta Agent): os N melhores da pré-triagem viram achados com trecho por regra; a paráfrase fica vazia e a síntese preenche */
export function triarSemModelo(slug: string, round: string, n = 20, log = console.log) {
  const cands = readJsonFile<Candidate[]>(work(slug, round, 'candidatos.json'));
  const out = cands.slice(0, n).flatMap((c) => {
    const quote = autoQuote(c.abstract);
    return quote ? [{ cand: c.id, score: c.preScore, claim: '', quote, summary: '', evidence: c.evidenceHint, why: 'triagem por regra (sem modelo)' }] : [];
  });
  writeJsonFile(work(slug, round, 'achados.json'), out);
  log(`triagem por regra: ${out.length} achados (paráfrase e crença ficam para a síntese)`);
}
