// Coleta longa do Instagram (1–2 anos para trás) em LOTES, sem rolar o perfil inteiro de uma vez.
// Cada lote continua de onde o anterior parou (cursor salvo em competitors/<id>/acervo/<perfil>.json) e grava os posts
// antigos no acervo do perfil (a tela junta com as coletas; análises e marcações valem pelo id do post).
// Limites da CONTA (a conta secundária é quem absorve o risco), em companies/<slug>/intel/acervo-conta.json:
//   até 3 lotes por 24 h · 2 h entre lotes · 5 páginas de 12 por lote · 6–12 s entre páginas ·
//   verificação, login ou 429 → para na hora e pausa a conta por 24 h.
// Só sob comando (botão "Continuar acervo" ou npm run acervo); nada agendado.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as S from '../../core/store';
import { company, P, type AcervoFile } from '../../schema';
import { igCookieList } from './adapters';
import { env } from './env';
import { keyFor } from './keys';
import { attachMedia } from './media';
import { loggedIgPost } from './normalize';
import { realRunner } from './runner';
import type { ItemDraft, Runner, SnapshotDraft } from './types';

export const LIMITES = { lotesPorDia: 3, intervaloMs: 2 * 3_600_000, pausaErroMs: 24 * 3_600_000, paginas: 5, pausaPaginaMs: 6000 };
const DIA = 86_400_000;

export interface ContaState { lotes: string[]; pausadoAte?: string | null; ultimoErro?: string | null }
const contaFile = (slug: string) => join(S.ROOT, company(slug), 'intel', 'acervo-conta.json');
export function readConta(slug: string): ContaState {
  try { const j = JSON.parse(readFileSync(contaFile(slug), 'utf8')); return { lotes: Array.isArray(j.lotes) ? j.lotes : [], pausadoAte: j.pausadoAte ?? null, ultimoErro: j.ultimoErro ?? null }; } catch { return { lotes: [] }; }
}
function writeConta(slug: string, c: ContaState) {
  mkdirSync(join(S.ROOT, company(slug), 'intel'), { recursive: true });
  writeFileSync(contaFile(slug), `${JSON.stringify(c, null, 2)}\n`);
}

/** pode rodar um lote agora? Se não, por quê e quando libera (puro: testável) */
export function liberacao(c: ContaState, now: Date) {
  const t = now.getTime();
  if (c.pausadoAte && Date.parse(c.pausadoAte) > t) return { ok: false, motivo: `conta pausada por segurança${c.ultimoErro ? ` (${c.ultimoErro})` : ''}`, liberaEm: c.pausadoAte };
  const recentes = c.lotes.map(Date.parse).filter((x) => t - x < DIA).sort((a, b) => a - b);
  if (recentes.length >= LIMITES.lotesPorDia) return { ok: false, motivo: `já foram ${LIMITES.lotesPorDia} lotes nas últimas 24 h`, liberaEm: new Date(recentes[0] + DIA).toISOString() };
  const ultimo = recentes.at(-1);
  if (ultimo && t - ultimo < LIMITES.intervaloMs) return { ok: false, motivo: 'intervalo mínimo de 2 h entre lotes', liberaEm: new Date(ultimo + LIMITES.intervaloMs).toISOString() };
  return { ok: true as const, motivo: null, liberaEm: null, restamHoje: LIMITES.lotesPorDia - recentes.length };
}

function perfilInstagram(slug: string, id: string) {
  const p = S.getCompetitor(slug, id).data.profiles.find((x) => x.platform === 'instagram');
  if (!p) throw new Error('este concorrente não tem Instagram cadastrado');
  const handle = (p.handle ?? new URL(p.url).pathname.split('/').filter(Boolean)[0])?.replace(/^@/, '');
  return { p, key: keyFor(p), handle, url: `https://www.instagram.com/${handle}/` };
}

/** estado para a tela: progresso do perfil + limites da conta */
export function status(slug: string, id: string, now = new Date()) {
  const conta = readConta(slug);
  let perfil: ReturnType<typeof perfilInstagram> | null = null;
  try { perfil = perfilInstagram(slug, id); } catch { /* sem Instagram */ }
  const a = perfil ? S.getAcervo(slug, id, perfil.key) : null;
  return {
    temInstagram: !!perfil, handle: perfil?.handle ?? null, sessao: !!env('INSTAGRAM_SESSIONID', slug),
    acervo: a ? { alvoDias: a.progresso.alvoDias, maisAntigo: a.progresso.maisAntigo ?? null, terminado: a.progresso.terminado, posts: a.items.length, lotes: a.progresso.lotes.slice(-5), updated: a.updated } : null,
    conta: { ...liberacao(conta, now), lotes24h: conta.lotes.filter((x) => now.getTime() - Date.parse(x) < DIA).length, limites: LIMITES },
  };
}

export interface LoteOpts { alvoDias?: number; runner?: Runner; now?: Date; noMedia?: boolean; pausaPaginaMs?: number; ignorarLimites?: boolean }

/** roda UM lote para o Instagram do concorrente; devolve o resumo */
export async function runLote(slug: string, id: string, o: LoteOpts = {}) {
  const now = o.now ?? new Date();
  const runner = o.runner ?? realRunner;
  const conta = readConta(slug);
  const lib = liberacao(conta, now);
  if (!lib.ok && !o.ignorarLimites) throw new Error(`${lib.motivo}; libera ${new Date(lib.liberaEm!).toLocaleString('pt-BR')}`);
  const session = env('INSTAGRAM_SESSIONID', slug);
  if (!session) throw new Error('sem sessão do Instagram: salve os cookies da conta secundária em Configurações');
  if (!runner.igBackfill) throw new Error('coleta longa indisponível aqui (sem navegador)');
  const { key, handle, url } = perfilInstagram(slug, id);
  const atual = S.getAcervo(slug, id, key);
  const alvoDias = o.alvoDias ?? atual?.progresso.alvoDias ?? 365;
  const prog = { ...(atual?.progresso ?? { alvoDias, cursor: null, clipsCursor: null, maisAntigo: null, terminado: false, lotes: [] }), alvoDias };
  // mudou o alvo para mais longe depois de terminar: continua de onde parou
  if (prog.terminado && prog.cursor && (!atual || atual.progresso.alvoDias < alvoDias)) prog.terminado = false;
  if (prog.terminado) return { novos: 0, posts: atual?.items.length ?? 0, ate: prog.maisAntigo, terminado: true, erros: [] as string[] };
  const desde = now.getTime() - alvoDias * DIA;
  const velha = (n: { taken_at?: number }) => typeof n.taken_at === 'number' && n.taken_at * 1000 < desde;
  const fixado = (n: { timeline_pinned_user_ids?: unknown[] }) => !!n.timeline_pinned_user_ids?.length;

  conta.lotes = [...conta.lotes.filter((x) => now.getTime() - Date.parse(x) < 7 * DIA), now.toISOString()];
  writeConta(slug, conta); // conta o lote antes de abrir o navegador: erro também gasta
  let res;
  try {
    res = await runner.igBackfill(handle, igCookieList((k) => env(k, slug), session), {
      cursor: prog.cursor ?? null, clipsCursor: prog.clipsCursor ?? null, pages: LIMITES.paginas, clips: true,
      pauseMs: o.pausaPaginaMs ?? LIMITES.pausaPaginaMs,
      stop: (tl) => tl.some((n) => velha(n) && !fixado(n)),
    });
  } catch (e) {
    const m = (e as Error).message;
    if (/429|verificação|recusada|login/.test(m)) writeConta(slug, { ...conta, pausadoAte: new Date(now.getTime() + LIMITES.pausaErroMs).toISOString(), ultimoErro: m.slice(0, 160) });
    S.saveAcervo(slug, id, key, { platform: 'instagram', profileUrl: url, updated: now.toISOString(), items: atual?.items ?? [], progresso: { ...prog, lotes: [...prog.lotes, { at: now.toISOString(), posts: 0, novos: 0, erro: m.slice(0, 200) }] } });
    throw e;
  }
  const views = new Map(res.clips.map((c) => [String(c.code), c]));
  const conhecidos = new Set([...(atual?.items ?? []).map((i) => i.id), ...S.listSnapshots(slug, id).filter((s) => s.key === key).flatMap((s) => s.data.items.map((i) => i.id))]);
  const lidos = res.timeline; // guarda também os que passaram da data: se o alvo crescer depois, nada se perde
  const items = lidos.map((n) => {
    const c = views.get(String(n.code));
    return loggedIgPost(c ? { ...n, play_count: n.play_count ?? c.play_count, view_count: n.view_count ?? c.view_count } : n);
  }).filter(Boolean).map((it) => ({ ...it!, seenAt: now.toISOString() }));
  // capas locais dos posts novos (a tela usa a remota se falhar)
  if (!o.noMedia && items.length) await attachMedia({ items } as SnapshotDraft, key, join(S.ROOT, P.competitor(slug, id)), runner).catch(() => undefined);
  const byId = new Map<string, ItemDraft>((atual?.items ?? []).map((i) => [i.id, i]));
  for (const it of items) byId.set(it.id, { ...byId.get(it.id), ...it });
  const datas = [...byId.values()].map((i) => i.publishedAt).filter(Boolean).sort() as string[];
  const chegou = res.timeline.some((n) => velha(n) && !fixado(n)) || !res.hasNext;
  const novos = items.filter((i) => !conhecidos.has(i.id)).length;
  const data: AcervoFile = S.saveAcervo(slug, id, key, {
    platform: 'instagram', profileUrl: url, updated: now.toISOString(), items: [...byId.values()],
    progresso: {
      ...prog, cursor: res.cursor, clipsCursor: res.clipsCursor, maisAntigo: datas[0]?.slice(0, 10) ?? prog.maisAntigo, terminado: chegou,
      lotes: [...prog.lotes, { at: now.toISOString(), posts: items.length, novos, ate: datas[0]?.slice(0, 10) ?? null, erro: res.errors[0]?.slice(0, 200) ?? null }],
    },
  });
  if (!res.errors.length) writeConta(slug, { ...readConta(slug), ultimoErro: null });
  return { novos, posts: data.items.length, ate: data.progresso.maisAntigo, terminado: data.progresso.terminado, erros: res.errors };
}
