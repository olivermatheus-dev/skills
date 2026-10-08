// Registro de atividade (tarefa 046 A): tudo o que roda por trás de um clique no app (IA, coleta, render) vira um arquivo
// em logs/atividade/<id>.json (fora do git). O app lê daqui o dock "Em andamento" e, depois, a página Agentes.
// Quem escreve: o servidor do app (coletas, prévia, export) e o heartbeat (tarefas, fichas, pesquisa). Só JSON, sem LLM.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = () => join(ROOT(), 'logs', 'atividade');
const file = (id) => join(DIR(), `${id}.json`);
const okId = (id) => typeof id === 'string' && /^[\w-]+$/.test(id);
const DIAS = 30; // histórico guardado

const ler = (id) => { try { return JSON.parse(readFileSync(file(id), 'utf8')); } catch { return null; } };
const gravar = (a) => { mkdirSync(DIR(), { recursive: true }); writeFileSync(file(a.id), `${JSON.stringify(a, null, 2)}\n`); return a; };
const vivo = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

/**
 * Começa um trabalho. `tipo`: ia | coleta | render. `fonte`: de onde veio (quadro, fichas, pesquisa, coleta, anuncios, site,
 * reclameaqui, semanal, previa, mockup). `link`: rota do app onde ver o resultado. `pid`: quem roda (padrão = este processo).
 */
export function iniciar({ slug, tipo, fonte, titulo, agente = null, passo = 'Começando', link = null, pid = process.pid, ref = null }) {
  const id = `${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}-${fonte}-${Math.random().toString(36).slice(2, 6)}`;
  return gravar({ id, slug, tipo, fonte, titulo, agente, passo, status: 'rodando', inicio: new Date().toISOString(), fim: null, pid, link, ref, erro: null, resumo: null, visto: false });
}

/** atualiza o passo (e o agente, se mudou) de um trabalho rodando */
export function passo(id, texto, extra = {}) {
  const a = okId(id) && ler(id);
  if (!a || a.status !== 'rodando') return null;
  return gravar({ ...a, ...extra, passo: texto, em: new Date().toISOString() });
}

/** fecha: status feito | erro | parado; `resumo` = uma linha do que saiu */
export function terminar(id, status, { resumo = null, erro = null, link } = {}) {
  const a = okId(id) && ler(id);
  if (!a) return null;
  return gravar({ ...a, status, resumo, erro, ...(link !== undefined ? { link } : {}), fim: new Date().toISOString() });
}

export function marcarVisto(ids) {
  for (const id of ids) { const a = okId(id) && ler(id); if (a && !a.visto) gravar({ ...a, visto: true }); }
}

/** trabalhos do mais novo ao mais velho; "rodando" cujo processo morreu vira erro (app reiniciado, terminal fechado) */
export function listar({ slug, limite = 100 } = {}) {
  if (!existsSync(DIR())) return [];
  const velho = Date.now() - DIAS * 864e5;
  const out = [];
  for (const f of readdirSync(DIR()).filter((n) => n.endsWith('.json')).sort().reverse()) {
    const p = join(DIR(), f);
    if (statSync(p).mtimeMs < velho) { rmSync(p, { force: true }); continue; }
    let a = ler(f.slice(0, -5));
    if (!a) continue;
    if (a.status === 'rodando' && a.pid && !vivo(a.pid)) a = terminar(a.id, 'erro', { erro: 'O processo parou no meio (app reiniciado ou janela fechada).' });
    if (slug && a.slug !== slug) continue;
    out.push(a);
    if (out.length >= limite) break;
  }
  return out;
}

export function lerAtividade(id) { return okId(id) ? ler(id) : null; }
