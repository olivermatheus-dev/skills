// Guarda da conta secundária do Instagram: TODA abertura de perfil logada (coleta normal e lotes do acervo) passa por aqui.
// O que mais pesa para o Instagram achar que é robô é volume e ritmo, então as regras são de gente:
//   até 12 perfis abertos por 24 h (somando coleta e acervo) · 1,5–3 min entre um perfil e outro ·
//   só das 8h às 23h · acervo: até 2 lotes por 24 h, 4 h entre lotes ·
//   verificação, login ou 429 → para tudo e pausa a conta por 48 h (a coleta normal cai nos 6 posts públicos).
// Estado em companies/<slug>/intel/instagram-conta.json (o antigo acervo-conta.json é lido uma vez).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as S from '../../core/store';
import { company } from '../../schema';

export const REGRAS = {
  aberturasPorDia: 12,
  intervaloAberturaMs: [90_000, 180_000] as const,
  horario: [8, 23] as const,
  lotesPorDia: 2,
  intervaloLoteMs: 4 * 3_600_000,
  pausaErroMs: 48 * 3_600_000,
};
const DIA = 86_400_000;

export interface ContaState { aberturas: string[]; lotes: string[]; pausadoAte?: string | null; ultimoErro?: string | null; proximoIntervaloMs?: number }

const dir = (slug: string) => join(S.ROOT, company(slug), 'intel');
const file = (slug: string) => join(dir(slug), 'instagram-conta.json');
export function readConta(slug: string): ContaState {
  for (const f of [file(slug), join(dir(slug), 'acervo-conta.json')]) {
    if (!existsSync(f)) continue;
    try {
      const j = JSON.parse(readFileSync(f, 'utf8'));
      const arr = (x: unknown) => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : []);
      return { aberturas: arr(j.aberturas), lotes: arr(j.lotes), pausadoAte: j.pausadoAte ?? null, ultimoErro: j.ultimoErro ?? null, proximoIntervaloMs: j.proximoIntervaloMs };
    } catch { /* arquivo estragado: recomeça */ }
  }
  return { aberturas: [], lotes: [] };
}
export function writeConta(slug: string, c: ContaState, now = new Date()) {
  mkdirSync(dir(slug), { recursive: true });
  const recente = (x: string) => now.getTime() - Date.parse(x) < 7 * DIA;
  writeFileSync(file(slug), `${JSON.stringify({ ...c, aberturas: c.aberturas.filter(recente), lotes: c.lotes.filter(recente) }, null, 2)}\n`);
}

const fmt = (ms: number) => new Date(ms).toISOString();
const sorteio = ([a, b]: readonly [number, number]) => a + Math.round(Math.random() * (b - a));

/** pode abrir um perfil agora? `esperarMs` > 0 = pode, depois de esperar o intervalo (puro: testável) */
export function podeAbrir(c: ContaState, now: Date) {
  const t = now.getTime();
  if (c.pausadoAte && Date.parse(c.pausadoAte) > t) return { ok: false, motivo: `conta pausada por segurança${c.ultimoErro ? ` (${c.ultimoErro})` : ''}`, liberaEm: c.pausadoAte, esperarMs: 0 };
  const h = now.getHours();
  if (h < REGRAS.horario[0] || h >= REGRAS.horario[1]) {
    const libera = new Date(now); libera.setHours(REGRAS.horario[0], 0, 0, 0); if (h >= REGRAS.horario[1]) libera.setDate(libera.getDate() + 1);
    return { ok: false, motivo: `fora do horário (só das ${REGRAS.horario[0]}h às ${REGRAS.horario[1]}h)`, liberaEm: libera.toISOString(), esperarMs: 0 };
  }
  const dia = c.aberturas.map(Date.parse).filter((x) => t - x < DIA).sort((a, b) => a - b);
  if (dia.length >= REGRAS.aberturasPorDia) return { ok: false, motivo: `já foram ${REGRAS.aberturasPorDia} perfis abertos nas últimas 24 h`, liberaEm: fmt(dia[0] + DIA), esperarMs: 0 };
  const ultimo = dia.at(-1);
  const gap = c.proximoIntervaloMs ?? REGRAS.intervaloAberturaMs[0];
  return { ok: true, motivo: null, liberaEm: null, esperarMs: ultimo ? Math.max(0, ultimo + gap - t) : 0, restamHoje: REGRAS.aberturasPorDia - dia.length };
}

/** pode rodar um lote do acervo agora? (regras dos lotes + as de abrir perfil) */
export function podeLote(c: ContaState, now: Date) {
  const base = podeAbrir(c, now);
  if (!base.ok) return base;
  const t = now.getTime();
  const lotes = c.lotes.map(Date.parse).filter((x) => t - x < DIA).sort((a, b) => a - b);
  if (lotes.length >= REGRAS.lotesPorDia) return { ok: false, motivo: `já foram ${REGRAS.lotesPorDia} lotes nas últimas 24 h`, liberaEm: fmt(lotes[0] + DIA), esperarMs: 0 };
  const ultimo = lotes.at(-1);
  if (ultimo && t - ultimo < REGRAS.intervaloLoteMs) return { ok: false, motivo: `intervalo mínimo de ${REGRAS.intervaloLoteMs / 3_600_000} h entre lotes`, liberaEm: fmt(ultimo + REGRAS.intervaloLoteMs), esperarMs: 0 };
  return base;
}

/** o que o Instagram responde quando desconfia: para tudo e pausa a conta */
export const ehAlerta = (msg: string) => /429|verificação|recusada|login|challenge|limitou/i.test(msg);

/** guarda usada pelos coletores; `perfilDir` = perfil fixo do navegador (o mesmo "aparelho" em toda coleta, fora do git) */
export function guarda(slug: string, o: { sleep?: (ms: number) => Promise<void>; now?: () => Date } = {}) {
  const now = o.now ?? (() => new Date());
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  return {
    perfilDir: join(S.ROOT, 'data', 'ig-browser', slug),
    /** espera o intervalo desde o último perfil e registra a abertura; lança se a conta não pode abrir agora */
    async antesDeAbrir(tipo: 'perfil' | 'lote' = 'perfil') {
      const c = readConta(slug);
      const p = tipo === 'lote' ? podeLote(c, now()) : podeAbrir(c, now());
      if (!p.ok) throw new Error(`conta do Instagram protegida: ${p.motivo}; libera ${new Date(p.liberaEm!).toLocaleString('pt-BR')}`);
      if (p.esperarMs) await sleep(p.esperarMs);
      const c2 = readConta(slug);
      const at = now().toISOString();
      writeConta(slug, { ...c2, aberturas: [...c2.aberturas, at], lotes: tipo === 'lote' ? [...c2.lotes, at] : c2.lotes, proximoIntervaloMs: sorteio(REGRAS.intervaloAberturaMs) }, now());
    },
    /** depois de um erro: se for alerta do Instagram, pausa a conta */
    erro(msg: string) {
      if (!ehAlerta(msg)) return false;
      writeConta(slug, { ...readConta(slug), pausadoAte: new Date(now().getTime() + REGRAS.pausaErroMs).toISOString(), ultimoErro: msg.slice(0, 160) }, now());
      return true;
    },
    ok() { const c = readConta(slug); if (c.ultimoErro) writeConta(slug, { ...c, ultimoErro: null }, now()); },
  };
}
export type Guarda = ReturnType<typeof guarda>;

/** estado para a tela */
export function statusConta(slug: string, now = new Date()) {
  const c = readConta(slug);
  const t = now.getTime();
  return {
    perfil: podeAbrir(c, now), lote: podeLote(c, now),
    aberturas24h: c.aberturas.filter((x) => t - Date.parse(x) < DIA).length, lotes24h: c.lotes.filter((x) => t - Date.parse(x) < DIA).length,
    pausadoAte: c.pausadoAte && Date.parse(c.pausadoAte) > t ? c.pausadoAte : null, ultimoErro: c.ultimoErro ?? null, regras: REGRAS,
  };
}
