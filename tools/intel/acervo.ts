// Coleta longa do Instagram (1–2 anos para trás) em LOTES, sem rolar o perfil inteiro de uma vez.
// Cada lote continua de onde o anterior parou (cursor salvo em competitors/<id>/acervo/<perfil>.json) e grava os posts
// antigos no acervo do perfil (a tela junta com as coletas; análises e marcações valem pelo id do post).
// Limites: os da conta (tools/intel/ig-conta.ts: até 2 lotes por 24 h, 4 h entre lotes, horário, pausa de 48 h após
// alerta) e os do lote: 3 páginas de 12, 12–24 s entre páginas.
// Só sob comando (botão "Continuar acervo" ou npm run acervo); nada agendado.
import { join } from 'node:path';
import * as S from '../../core/store';
import { P, type AcervoFile } from '../../schema';
import { igCookieList } from './adapters';
import { env } from './env';
import { guarda, REGRAS, statusConta } from './ig-conta';
import { keyFor } from './keys';
import { attachMedia } from './media';
import { loggedIgPost } from './normalize';
import { realRunner } from './runner';
import type { IgGuard, ItemDraft, Runner, SnapshotDraft } from './types';

export const LIMITES = { paginas: 3, pausaPaginaMs: 12_000 };
const DIA = 86_400_000;

function perfilInstagram(slug: string, id: string) {
  const p = S.getCompetitor(slug, id).data.profiles.find((x) => x.platform === 'instagram');
  if (!p) throw new Error('este concorrente não tem Instagram cadastrado');
  const handle = (p.handle ?? new URL(p.url).pathname.split('/').filter(Boolean)[0])?.replace(/^@/, '');
  return { p, key: keyFor(p), handle, url: `https://www.instagram.com/${handle}/` };
}

/** estado para a tela: progresso do perfil + limites da conta */
export function status(slug: string, id: string, now = new Date()) {
  const conta = statusConta(slug, now);
  let perfil: ReturnType<typeof perfilInstagram> | null = null;
  try { perfil = perfilInstagram(slug, id); } catch { /* sem Instagram */ }
  const a = perfil ? S.getAcervo(slug, id, perfil.key) : null;
  return {
    temInstagram: !!perfil, handle: perfil?.handle ?? null, sessao: !!env('INSTAGRAM_SESSIONID', slug),
    acervo: a ? { alvoDias: a.progresso.alvoDias, maisAntigo: a.progresso.maisAntigo ?? null, terminado: a.progresso.terminado, posts: a.items.length, lotes: a.progresso.lotes.slice(-5), updated: a.updated } : null,
    conta: { ...conta.lote, lotes24h: conta.lotes24h, aberturas24h: conta.aberturas24h, limites: { lotesPorDia: REGRAS.lotesPorDia, intervaloMs: REGRAS.intervaloLoteMs, paginas: LIMITES.paginas, aberturasPorDia: REGRAS.aberturasPorDia, horario: REGRAS.horario } },
  };
}

export interface LoteOpts { alvoDias?: number; runner?: Runner; now?: Date; noMedia?: boolean; pausaPaginaMs?: number; conta?: IgGuard }

/** roda UM lote para o Instagram do concorrente; devolve o resumo */
export async function runLote(slug: string, id: string, o: LoteOpts = {}) {
  const now = o.now ?? new Date();
  const runner = o.runner ?? realRunner;
  const conta = o.conta ?? guarda(slug);
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

  await conta.antesDeAbrir('lote'); // lança se a conta não pode agora; conta o lote antes de abrir: erro também gasta
  let res;
  try {
    res = await runner.igBackfill(handle, igCookieList((k) => env(k, slug), session), {
      cursor: prog.cursor ?? null, clipsCursor: prog.clipsCursor ?? null, pages: LIMITES.paginas, clips: true,
      pauseMs: o.pausaPaginaMs ?? LIMITES.pausaPaginaMs,
      stop: (tl) => tl.some((n) => velha(n) && !fixado(n)),
      perfilDir: conta.perfilDir,
    });
  } catch (e) {
    const m = (e as Error).message;
    conta.erro(m); // alerta do Instagram → pausa a conta por 48 h
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
  // até onde a leitura chegou: post fixado no topo pode ser antigo e não conta
  const lidoAte = res.timeline.filter((n) => !fixado(n) && typeof n.taken_at === 'number').map((n) => new Date(n.taken_at * 1000).toISOString().slice(0, 10)).sort()[0];
  const ate = [lidoAte, prog.maisAntigo].filter(Boolean).sort()[0] ?? null;
  const chegou = res.timeline.some((n) => velha(n) && !fixado(n)) || !res.hasNext;
  const novos = items.filter((i) => !conhecidos.has(i.id)).length;
  const data: AcervoFile = S.saveAcervo(slug, id, key, {
    platform: 'instagram', profileUrl: url, updated: now.toISOString(), items: [...byId.values()],
    progresso: {
      ...prog, cursor: res.cursor, clipsCursor: res.clipsCursor, maisAntigo: ate, terminado: chegou,
      lotes: [...prog.lotes, { at: now.toISOString(), posts: items.length, novos, ate: lidoAte ?? null, erro: res.errors[0]?.slice(0, 200) ?? null }],
    },
  });
  if (res.errors.some((x) => conta.erro(x))) res.errors.push('conta pausada por 48 h para proteger');
  else if (!res.errors.length) conta.ok();
  return { novos, posts: data.items.length, ate: data.progresso.maisAntigo, terminado: data.progresso.terminado, erros: res.errors };
}
