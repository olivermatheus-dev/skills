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
const MAX_PASSOS = 300; // histórico de passos por trabalho (página Agentes)
const PARADO_MIN = 20; // sessão de terminal (sem pid) sem notícias há tanto tempo = terminal fechado no meio

const ler = (id) => { try { return JSON.parse(readFileSync(file(id), 'utf8')); } catch { return null; } };
const gravar = (a) => { mkdirSync(DIR(), { recursive: true }); writeFileSync(file(a.id), `${JSON.stringify(a, null, 2)}\n`); return a; };
const vivo = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

/**
 * Começa um trabalho. `tipo`: ia | coleta | render. `fonte`: de onde veio (quadro, fichas, pesquisa, coleta, anuncios, site,
 * reclameaqui, semanal, previa, mockup). `link`: rota do app onde ver o resultado. `pid`: quem roda (padrão = este processo).
 */
export function iniciar({ slug, tipo, fonte, titulo, agente = null, passo = 'Começando', link = null, pid = process.pid, ref = null, ...extra }) {
  const id = `${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}-${fonte}-${Math.random().toString(36).slice(2, 6)}`;
  const inicio = new Date().toISOString();
  return gravar({ id, slug, tipo, fonte, titulo, agente, passo, status: 'rodando', inicio, fim: null, pid, link, ref, erro: null, resumo: null, visto: false, ...extra, passos: [{ em: inicio, texto: passo, agente }] });
}

/** atualiza o passo (e o agente, se mudou) de um trabalho rodando; o passo entra no histórico (`passos`) */
export function passo(id, texto, extra = {}) {
  const a = okId(id) && ler(id);
  if (!a || a.status !== 'rodando') return null;
  const em = new Date().toISOString();
  const passos = [...(a.passos ?? []), { em, texto, agente: extra.agente ?? a.agente }].slice(-MAX_PASSOS);
  return gravar({ ...a, ...extra, passo: texto, em, passos });
}

/**
 * fecha: status feito | erro | parado; `resumo` = uma linha do que saiu; `custo` (US$) e `turnos` quando é IA;
 * `final` = texto final do Claude (cortado), para o histórico; `visto` = já nasce visto (não pede atenção no dock)
 */
export function terminar(id, status, { resumo = null, erro = null, link, custo = null, turnos = null, final = null, visto } = {}) {
  const a = okId(id) && ler(id);
  if (!a) return null;
  return gravar({ ...a, status, resumo, erro, ...(link !== undefined ? { link } : {}), ...(custo != null ? { custo } : {}), ...(turnos != null ? { turnos } : {}),
    ...(final ? { final: String(final).slice(0, 6000) } : {}), ...(visto !== undefined ? { visto } : {}), fim: new Date().toISOString() });
}

/** grava campos soltos (ex.: `encerrada` da sessão de terminal) sem mexer no status */
export function marcar(id, extra) {
  const a = okId(id) && ler(id);
  return a ? gravar({ ...a, ...extra }) : null;
}

/** volta a rodar um trabalho fechado (sessão de terminal que recebeu outra mensagem) */
export function reabrir(id, texto, extra = {}) {
  const a = okId(id) && ler(id);
  if (!a) return null;
  if (a.status === 'rodando') return passo(id, texto, extra);
  const em = new Date().toISOString();
  return gravar({ ...a, ...extra, status: 'rodando', encerrada: false, fim: null, erro: null, resumo: null, visto: false, passo: texto, em, passos: [...(a.passos ?? []), { em, texto, agente: extra.agente ?? a.agente }].slice(-MAX_PASSOS) });
}

/** sessão do Claude Code → trabalho dela (mapa em logs/atividade/sessoes/<id da sessão>, uma linha com o id do trabalho) */
const okSessao = (s) => typeof s === 'string' && /^[\w-]{8,80}$/.test(s);
export function porSessao(sessao) {
  if (!okSessao(sessao)) return null;
  try { return ler(readFileSync(join(DIR(), 'sessoes', sessao), 'utf8').trim()); } catch { return null; }
}
export function ligarSessao(sessao, id) {
  if (!okSessao(sessao) || !okId(id)) return;
  mkdirSync(join(DIR(), 'sessoes'), { recursive: true });
  writeFileSync(join(DIR(), 'sessoes', sessao), id);
}

export function marcarVisto(ids) {
  for (const id of ids) { const a = okId(id) && ler(id); if (a && !a.visto) gravar({ ...a, visto: true }); }
}

/** trabalhos do mais novo ao mais velho; "rodando" cujo processo morreu vira erro (app reiniciado, terminal fechado) */
export function listar({ slug, limite = 100 } = {}) {
  if (!existsSync(DIR())) return [];
  const velho = Date.now() - DIAS * 864e5;
  const out = [];
  const mapa = join(DIR(), 'sessoes');
  if (existsSync(mapa)) for (const f of readdirSync(mapa)) if (statSync(join(mapa, f)).mtimeMs < velho) rmSync(join(mapa, f), { force: true });
  for (const f of readdirSync(DIR()).filter((n) => n.endsWith('.json')).sort().reverse()) {
    const p = join(DIR(), f);
    if (statSync(p).mtimeMs < velho) { rmSync(p, { force: true }); continue; }
    let a = ler(f.slice(0, -5));
    if (!a) continue;
    if (a.status === 'rodando' && a.pid && !vivo(a.pid)) a = terminar(a.id, 'erro', { erro: 'O processo parou no meio (app reiniciado ou janela fechada).' });
    else if (a.status === 'rodando' && !a.pid && Date.now() - Date.parse(a.em ?? a.inicio) > PARADO_MIN * 60e3)
      a = terminar(a.id, 'parado', { resumo: `Sem notícias há ${PARADO_MIN} min (terminal fechado no meio?)`, visto: true });
    if (slug && a.slug !== slug && a.slug !== '*') continue; // '*' = sessão de terminal sem empresa definida: aparece em todas
    out.push(a);
    if (out.length >= limite) break;
  }
  return out;
}

export function lerAtividade(id) { return okId(id) ? ler(id) : null; }
