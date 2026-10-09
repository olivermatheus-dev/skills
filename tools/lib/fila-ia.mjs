// Fila da IA (tarefa 046 F): IA uma por vez (custo e limite da conta); o resto espera aqui e roda sozinho quando a anterior
// acaba. Tudo sob clique: o app grava a entrada e chama o heartbeat (`--run --fila`); o heartbeat que segura o lock esvazia
// a fila, um trabalho por vez. Um arquivo por entrada em logs/fila-ia/<id>.json (fora do git); o id começa pela data, então
// a ordem dos nomes é a ordem da fila. Coletas e renders não passam por aqui (rodam em paralelo). Só JSON, sem LLM.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as AT from './atividade.mjs';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = () => join(ROOT(), 'logs', 'fila-ia');
const okId = (id) => typeof id === 'string' && /^[\w-]+$/.test(id);
const json = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };

/** entradas na ordem em que rodam (a primeira é a próxima) */
export function listar() {
  if (!existsSync(DIR())) return [];
  return readdirSync(DIR()).filter((n) => n.endsWith('.json')).sort().map((n) => json(join(DIR(), n))).filter(Boolean);
}

/**
 * Entra na fila. `job`: { kind: quadro | fichas | pesquisa | pedido, slug, task?, max?, round?, pedido? }. `chave` = o mesmo
 * trabalho não entra duas vezes (devolve o que já estava). `meta` = o que o dock mostra enquanto espera (titulo, agente,
 * fonte, link, ref). Devolve { entrada, posicao (1 = a próxima), ja }.
 */
export function entrar(job, chave, meta) {
  const atual = listar();
  const i = atual.findIndex((e) => e.chave === chave);
  if (i >= 0) return { entrada: atual[i], posicao: i + 1, ja: true };
  const id = `${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 17)}-${job.kind}-${Math.random().toString(36).slice(2, 6)}`;
  const at = AT.enfileirar({ slug: job.slug, tipo: 'ia', ...meta });
  const entrada = { id, criado: new Date().toISOString(), chave, job, titulo: meta.titulo, atividade: at.id };
  mkdirSync(DIR(), { recursive: true });
  writeFileSync(join(DIR(), `${id}.json`), `${JSON.stringify(entrada, null, 2)}\n`);
  return { entrada, posicao: atual.length + 1, ja: false };
}

/** o heartbeat pega a próxima: o rename é atômico, então duas batidas nunca pegam a mesma entrada */
export function proxima() {
  for (const e of listar()) {
    const de = join(DIR(), `${e.id}.json`), para = join(DIR(), `${e.id}.pega`);
    try { renameSync(de, para); } catch { continue; } // outra batida pegou
    rmSync(para, { force: true });
    return e;
  }
  return null;
}

/** posição de uma entrada pela chave ou pelo id da atividade (null = não está na fila) */
export function posicao(pred) {
  const i = listar().findIndex(pred);
  return i >= 0 ? i + 1 : null;
}

/** tira da fila (o Oliver desistiu): a atividade vira "parado". Devolve a entrada, ou null se ela já começou. */
export function tirar(id) {
  if (!okId(id)) return null;
  const f = join(DIR(), `${id}.json`);
  const e = json(f);
  if (!e) return null;
  try { renameSync(f, join(DIR(), `${id}.pega`)); } catch { return null; } // o heartbeat pegou agora
  rmSync(join(DIR(), `${id}.pega`), { force: true });
  AT.terminar(e.atividade, 'parado', { resumo: 'Tirado da fila por você', visto: true });
  return e;
}
