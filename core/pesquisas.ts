// Pesquisa de ideias pelo app (041 F3): lista de rodadas (aba Pesquisas), andamento lido dos arquivos da rodada,
// pedido gravado pelo MESMO código do terminal (tools/curadoria/pedido.ts) e disparo pelo mesmo caminho do "Rodar IA".
// Nada agendado: a rodada só roda quando o Oliver clica (heartbeat --pesquisa, segundo plano; ou janela de terminal).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ResearchRequest, ResearchResult, SourceRef } from '../schema/curadoria';
import * as S from './store';
import { readLock, runPesquisa as dispararPesquisa, stopAi } from './runner';
import { ESTIMATIVA_PADRAO, criarPedido } from '../tools/curadoria/pedido';
import { ADAPTERS } from '../tools/curadoria/adapters';
import { workDir } from '../tools/curadoria/paths';
import * as PQ from '../tools/lib/pesquisa.mjs';
import type { UltimoPesquisa } from '../tools/lib/pesquisa.mjs';

export type { UltimoPesquisa };
export type EstadoRodada = 'pendente' | 'rodando' | 'feito' | 'erro';
const isRound = (v: string) => /^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+$/.test(v);
const isSlug = (v: string) => /^[a-z0-9][a-z0-9-]*$/.test(v);
const bad = (msg: string): never => { throw new S.ValidationError('pesquisa', [msg]); };

// ───────────────────────── andamento (lido dos arquivos da rodada) ─────────────────────────
export interface EtapaProg { id: 'consultas' | 'buscar' | 'triar' | 'verificar' | 'sintese'; label: string; estado: 'feito' | 'rodando' | 'espera' }
export interface FonteProg {
  sourceId: string;
  estado: 'espera' | 'rodando' | 'feito' | 'vazio' | 'erro' | 'bloqueado';
  /** achados pelo script · ficaram na triagem · passaram na verificação (null = ainda não chegou nessa etapa) */
  fetched: number | null; kept: number | null; verified: number | null;
  error: string | null;
}
export interface Progresso {
  etapas: EtapaProg[];
  fontes: FonteProg[];
  totais: { candidatos: number | null; achados: number | null; verificados: number | null; caidos: number | null };
  /** fonte sendo buscada agora */
  atual: string | null;
  /** última vez que algum arquivo da rodada mudou (ISO) */
  atividade: string | null;
}

const rodadaAbs = (slug: string, round: string) => join(S.ROOT, 'companies', slug, 'curadoria', 'rodadas', round);
function readJson<T>(file: string): T | null {
  try { return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')) as T) : null; } catch { return null; }
}
const mtime = (file: string) => { try { return statSync(file).mtimeMs; } catch { return 0; } };

// brutos.json passa de 3 MB: guarda só chave → fontes, por data de modificação
const keyCache = new Map<string, { m: number; map: Map<string, string[]>; per: { sourceId: string; status: string; fetched: number; errors: string[] }[] }>();
function brutos(file: string) {
  const m = mtime(file);
  const hit = keyCache.get(file);
  if (hit && hit.m === m) return hit;
  const raw = readJson<{ items: { key: string; sourceIds: string[] }[]; perSource: { sourceId: string; status: string; fetched: number; errors: string[] }[] }>(file);
  if (!raw) return null;
  const v = { m, map: new Map(raw.items.map((i) => [i.key, i.sourceIds])), per: raw.perSource };
  keyCache.set(file, v);
  return v;
}

export function progressoRodada(slug: string, round: string, req: ResearchRequest, result: ResearchResult | null, rodando: boolean): Progresso {
  const dir = workDir(slug, round);
  const f = (n: string) => join(dir, n);
  const temConsultas = existsSync(join(rodadaAbs(slug, round), 'consultas.json'));
  const temBrutos = existsSync(f('brutos.json'));
  const cands = readJson<{ id: string; key: string }[]>(f('candidatos.json'));
  const achados = readJson<{ cand: string }[]>(f('achados.json'));
  const verif = readJson<{ cand: string; ok: boolean }[]>(f('verificados.json'));
  const feito = { consultas: temConsultas || !!result, buscar: temBrutos || !!result, triar: !!achados || !!result, verificar: !!verif || !!result, sintese: !!result };
  const ordem: EtapaProg['id'][] = ['consultas', 'buscar', 'triar', 'verificar', 'sintese'];
  const rotulos: Record<EtapaProg['id'], string> = { consultas: 'Consultas', buscar: 'Buscar nas fontes', triar: 'Triar', verificar: 'Verificar link, DOI e trecho', sintese: 'Síntese e ranking' };
  const primeiraPendente = ordem.find((id) => !feito[id]);
  const etapas: EtapaProg[] = ordem.map((id) => ({ id, label: rotulos[id], estado: feito[id] ? 'feito' : id === primeiraPendente && rodando ? 'rodando' : 'espera' }));

  const mapa = temBrutos ? brutos(f('brutos.json')) : null;
  const doPorFonte = (lista: { cand: string }[] | null, id: string) => {
    if (!lista || !cands || !mapa) return null;
    const keys = new Map(cands.map((c) => [c.id, c.key]));
    return lista.filter((x) => mapa.map.get(keys.get(x.cand) ?? '')?.includes(id)).length;
  };
  const prog = readJson<{ atual: string | null; perSource: { sourceId: string; status: string; fetched: number }[] }>(f('buscar-progresso.json'));
  const fontes: FonteProg[] = req.sources.map((id) => {
    if (result) {
      const p = result.perSource.find((x) => x.sourceId === id);
      return p ? { sourceId: id, estado: p.status === 'ok' ? 'feito' : p.status, fetched: p.fetched, kept: p.kept, verified: p.verified, error: p.error ?? null }
        : { sourceId: id, estado: 'espera', fetched: null, kept: null, verified: null, error: null };
    }
    const b = mapa?.per.find((x) => x.sourceId === id);
    if (b) {
      return {
        sourceId: id, estado: b.status === 'ok' ? 'feito' : (b.status as FonteProg['estado']), fetched: b.fetched,
        kept: achados ? doPorFonte(achados, id) : null,
        verified: verif ? doPorFonte(verif.filter((v) => v.ok), id) : null,
        error: b.errors.length ? b.errors.join('; ').slice(0, 300) : null,
      };
    }
    const p = prog?.perSource.find((x) => x.sourceId === id);
    if (p) return { sourceId: id, estado: p.status === 'ok' ? 'feito' : (p.status as FonteProg['estado']), fetched: p.fetched, kept: null, verified: null, error: null };
    return { sourceId: id, estado: rodando && prog?.atual === id ? 'rodando' : 'espera', fetched: null, kept: null, verified: null, error: null };
  });

  let atividade = 0;
  for (const d of [dir, rodadaAbs(slug, round)]) {
    if (!existsSync(d)) continue;
    for (const n of readdirSync(d)) atividade = Math.max(atividade, mtime(join(d, n)));
  }
  return {
    etapas, fontes, atual: !temBrutos ? prog?.atual ?? null : null,
    totais: {
      candidatos: cands ? cands.length : null, achados: achados ? achados.length : null,
      verificados: verif ? verif.filter((v) => v.ok).length : null, caidos: verif ? verif.filter((v) => !v.ok).length : null,
    },
    atividade: atividade ? new Date(atividade).toISOString() : null,
  };
}

// ───────────────────────── lista (aba Pesquisas) ─────────────────────────
export interface RodadaLinha {
  id: string;
  req: ResearchRequest;
  result: ResearchResult | null;
  estado: EstadoRodada;
  /** rodando numa janela de terminal (sem o lock do app): o estado vem dos arquivos que mudaram há pouco */
  terminal: boolean;
  ideias: { id: string; title: string; status: string; score: number | null }[];
  aprovadas: number;
  custo: number | null;
  erro: string | null;
}
export interface Estimativa { minutes: number; usdLow: number; usdHigh: number; real: { n: number; media: number } | null }
export interface PesquisasStatus {
  rodadas: RodadaLinha[];
  /** a pesquisa que o app está rodando agora (lock) */
  rodando: { round: string; started: string; passo: string } | null;
  ocupado: { task: string | null; title: string | null; slug: string | null } | null;
  ultimo: UltimoPesquisa | null;
  estimativa: { normal: Estimativa; rapida: Estimativa };
  /** adaptadores com coletor por script; as outras fontes ficam de fora da rodada (bloqueado) */
  coletores: string[];
}

const RECENTE_MS = 20 * 60e3;
function estimativas(rows: { req: ResearchRequest; result: ResearchResult | null }[]) {
  const mk = (depth: 'normal' | 'rapida'): Estimativa => {
    const base = ESTIMATIVA_PADRAO[depth];
    const custos = rows.filter((r) => r.req.depth === depth && r.result?.cost).map((r) => r.result!.cost!.usd).slice(0, 5);
    if (!custos.length) return { ...base, real: null };
    const media = custos.reduce((a, b) => a + b, 0) / custos.length;
    return { minutes: base.minutes, usdLow: Math.min(...custos), usdHigh: Math.max(...custos), real: { n: custos.length, media } };
  };
  return { normal: mk('normal'), rapida: mk('rapida') };
}

export function pesquisasStatus(slug: string): PesquisasStatus {
  if (!isSlug(slug)) bad('empresa inválida');
  const lock = readLock();
  const meu = lock?.kind === 'pesquisa' && lock.slug === slug ? lock : null;
  const ideias = S.listIdeas(slug).filter((i) => i.data.round);
  const rows: RodadaLinha[] = [];
  for (const id of S.listRounds(slug)) {
    let req: ResearchRequest;
    try { req = S.getRoundRequest(slug, id); } catch { continue; } // pedido ilegível: o validate acusa
    let result: ResearchResult | null = null;
    try { result = S.getRoundResult(slug, id); } catch { /* resultado ilegível: o validate acusa */ }
    const rodandoApp = meu?.round === id;
    // rodada que morreu sem fechar (app fechado, processo morto): sai de "rodando"
    if (req.status === 'rodando' && !rodandoApp) { PQ.fechar(slug, id, { erro: 'A rodada anterior parou sem terminar.' }); req = S.getRoundRequest(slug, id); }
    const ult = PQ.lerUltimo(slug);
    let terminal = false;
    if (!result && !rodandoApp && req.status === 'pendente') {
      const p = progressoRodada(slug, id, req, null, false);
      // fechada (parada ou com erro) depois do último arquivo mexido: não é o terminal rodando, é uma rodada parada
      const fechada = ult?.round === id && p.atividade != null && Date.parse(ult.fim) >= Date.parse(p.atividade) - 2000;
      terminal = !fechada && !!p.atividade && Date.now() - Date.parse(p.atividade) < RECENTE_MS && (p.etapas.some((e) => e.id !== 'consultas' && e.estado === 'feito') || p.fontes.some((x) => x.estado !== 'espera'));
    }
    const dela = ideias.filter((i) => i.data.round === id);
    rows.push({
      id, req, result,
      estado: result || req.status === 'feito' ? 'feito' : rodandoApp || terminal ? 'rodando' : req.status === 'rodando' ? 'erro' : req.status,
      terminal,
      ideias: dela.map((i) => ({ id: i.data.id, title: i.data.title, status: i.data.status, score: i.data.score ?? null })),
      aprovadas: dela.filter((i) => i.data.status === 'aprovada' || i.data.status === 'virou-tarefa').length,
      custo: result?.cost?.usd ?? null,
      erro: req.status === 'erro' && ult?.round === id ? ult.erro : null,
    });
  }
  rows.sort((a, b) => b.id.localeCompare(a.id));
  const atual = rows.find((r) => r.id === meu?.round);
  let passo = 'Abrindo o Claude Code';
  if (atual) {
    const p = progressoRodada(slug, atual.id, atual.req, atual.result, true);
    passo = p.etapas.find((e) => e.estado === 'rodando')?.label ?? passo;
  }
  return {
    rodadas: rows,
    rodando: meu?.round ? { round: meu.round, started: meu.started, passo } : null,
    ocupado: lock && !meu ? { task: lock.task ?? null, title: lock.title ?? null, slug: lock.slug ?? null } : null,
    ultimo: PQ.lerUltimo(slug),
    estimativa: estimativas(rows),
    coletores: Object.keys(ADAPTERS),
  };
}

// ───────────────────────── detalhe de uma rodada ─────────────────────────
export interface RodadaView {
  linha: RodadaLinha;
  progresso: Progresso;
  refs: SourceRef[];
  consultas: { pt: string[]; en: string[]; termos?: string[] } | null;
}
export function rodadaView(slug: string, round: string): RodadaView {
  if (!isSlug(slug) || !isRound(round)) bad('rodada inválida');
  const linha = pesquisasStatus(slug).rodadas.find((r) => r.id === round);
  if (!linha) bad(`a rodada ${round} não existe`);
  const l = linha!;
  const rodando = l.estado === 'rodando';
  const ids = new Set(l.result?.refs ?? []);
  return {
    linha: l, progresso: progressoRodada(slug, round, l.req, l.result, rodando),
    refs: S.listRefs(slug).filter((r) => ids.has(r.id) || r.round === round),
    consultas: readJson(join(rodadaAbs(slug, round), 'consultas.json')),
  };
}

// ───────────────────────── pedir e rodar ─────────────────────────
export interface PesquisaBody {
  serie?: number | null; pilar?: number | null; tema?: string | null; fontes?: string[];
  meses?: number; diasNoticia?: number; ideias?: number; rapida?: boolean; idiomas?: ('pt' | 'en' | 'es')[]; instrucoes?: string;
  /** rodar = segundo plano (heartbeat) · terminal = janela interativa · so-pedir = grava e espera */
  acao?: 'rodar' | 'terminal' | 'so-pedir';
}
const int = (v: unknown, min: number, max: number, nome: string, def: number) => {
  if (v == null) return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) bad(`${nome} precisa ser um número inteiro de ${min} a ${max}`);
  return n;
};

export function pedirPesquisa(slug: string, b: PesquisaBody) {
  if (!isSlug(slug)) bad('empresa inválida');
  b = b ?? {};
  const serie = b.serie ? int(b.serie, 1, 99, 'série', 0) : null, pilar = b.pilar ? int(b.pilar, 1, 99, 'pilar', 0) : null;
  const tema = typeof b.tema === 'string' ? b.tema.trim().slice(0, 200) : null;
  if (!serie && !pilar && !tema) bad('escolha uma série, um pilar ou escreva um tema');
  const refs = S.strategyRefs(slug);
  if (serie && !refs.series.some((x) => x.n === serie)) bad(`a série ${serie} não existe no CONTENT_STRATEGY.md`);
  if (pilar && !refs.pillars.some((x) => x.n === pilar)) bad(`o pilar ${pilar} não existe no CONTENT_STRATEGY.md`);
  const fontes = Array.isArray(b.fontes) ? b.fontes.map(String).filter(isSlug) : [];
  if (!fontes.length) bad('escolha ao menos uma fonte');
  const rapida = !!b.rapida;
  const e = pesquisasStatusEstimativa(slug, rapida);
  let criado;
  try {
    criado = criarPedido(slug, {
      serie, pilar: serie ? null : pilar, tema: serie || pilar ? null : tema, fontes,
      ideias: int(b.ideias, 1, 20, 'quantas ideias', 8), meses: int(b.meses, 1, 120, 'período em meses', 24), diasNoticia: int(b.diasNoticia, 1, 365, 'período das notícias em dias', 60),
      rapida, idiomas: Array.isArray(b.idiomas) ? b.idiomas.filter((x) => ['pt', 'en', 'es'].includes(x)) : undefined,
      instrucoes: typeof b.instrucoes === 'string' ? b.instrucoes.trim().slice(0, 2000) : '',
      estimate: { minutes: e.minutes, usdLow: Math.round(e.usdLow * 100) / 100, usdHigh: Math.round(e.usdHigh * 100) / 100 },
    });
  } catch (err) {
    if (err instanceof S.ValidationError) throw err;
    return bad((err as Error).message);
  }
  const round = criado.req.id;
  const acao = b.acao ?? 'rodar';
  let rodando = false, aviso: string | null = null;
  if (acao !== 'so-pedir') {
    try { dispararPesquisa(slug, round, acao === 'terminal' ? 'terminal' : 'background'); rodando = true; } catch (err) { aviso = err instanceof S.ValidationError ? err.issues.join('; ') : String(err); }
  }
  return { round, rodando, aviso, modo: acao };
}
function pesquisasStatusEstimativa(slug: string, rapida: boolean) {
  const e = pesquisasStatus(slug).estimativa;
  return rapida ? e.rapida : e.normal;
}

/** "Rodar" um pedido que ficou gravado (a IA estava ocupada, ou foi parado) */
export function rodarPesquisa(slug: string, round: string, modo: 'background' | 'terminal' = 'background') {
  if (!isSlug(slug) || !isRound(round)) bad('rodada inválida');
  const req = S.getRoundRequest(slug, round);
  if (req.status === 'feito' || S.getRoundResult(slug, round)) bad('essa rodada já terminou');
  if (req.status === 'erro') PQ.marcarPedido(slug, round, 'pendente');
  return dispararPesquisa(slug, round, modo);
}

/** Parar: mata o Claude da rodada; ela volta a "pendente" e o que já foi gerado nos arquivos fica */
export function pararPesquisa(slug: string) {
  const l = readLock();
  if (!l || l.kind !== 'pesquisa' || l.slug !== slug) return { stopped: false };
  return stopAi(slug);
}
