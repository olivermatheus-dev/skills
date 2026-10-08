// Fila de fichas (tarefa 040, fase E): os pedidos de análise (companies/<slug>/competitors/<id>/fichas/pedido.json, um por
// concorrente), o progresso da rodada (logs/fichas/<slug>.json, fora do git) e o fecho da rodada (tira da fila o que ficou
// analisado). Usado pelo heartbeat (--fichas), pela CLI tools/fichas-fila.mjs e pelo app (core/fichas-fila.ts). Só JSON, sem LLM.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as AT from './atividade.mjs';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = (f) => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const gravar = (f, v) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`); };
export const agora = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');

export const fichaFile = (key) => `${key.replace(':', '__').replace(/[\\/:*?"<>|]/g, '_')}.json`;
const compsDir = (slug) => join(ROOT(), 'companies', slug, 'competitors');
export const pedidoPath = (slug, comp) => join(compsDir(slug), comp, 'fichas', 'pedido.json');

/** todos os pedidos da empresa: [{ comp, pedido }] (pedido ilegível fica de fora; o validate acusa) */
export function listarPedidos(slug) {
  const d = compsDir(slug);
  if (!existsSync(d)) return [];
  const out = [];
  for (const comp of readdirSync(d)) {
    const f = pedidoPath(slug, comp);
    if (!existsSync(f)) continue;
    try { const p = json(f); if (Array.isArray(p?.itens) && p.itens.length) out.push({ comp, pedido: p }); } catch { /* inválido */ }
  }
  return out;
}

/** data da análise da ficha (ou null) */
export function analisadaEm(slug, comp, key) {
  const f = join(compsDir(slug), comp, 'fichas', fichaFile(key));
  if (!existsSync(f)) return null;
  try { return json(f)?.analise?.geradoEm ?? null; } catch { return null; }
}

/** o item já saiu como deveria? sem "reanalisar": tem análise; com "reanalisar": análise posterior ao pedido */
export function feito(slug, comp, key, pedido) {
  const em = analisadaEm(slug, comp, key);
  if (!em) return false;
  return !pedido.reanalisar || Date.parse(em) >= Date.parse(pedido.requestedAt);
}

/** tira chaves do pedido do concorrente (vazio = apaga o arquivo). Devolve quantas sobraram. */
export function tirar(slug, comp, keys) {
  const f = pedidoPath(slug, comp);
  if (!existsSync(f)) return 0;
  const p = json(f);
  const itens = (p.itens ?? []).filter((k) => !keys.includes(k));
  if (!itens.length) { unlinkSync(f); return 0; }
  gravar(f, { ...p, itens });
  return itens.length;
}

/** marca os pedidos pendentes como "rodando" (a rodada começou); devolve [{ comp, itens, reanalisar }] */
export function marcarRodando(slug) {
  const out = [];
  for (const { comp, pedido } of listarPedidos(slug)) {
    if (pedido.status !== 'rodando') gravar(pedidoPath(slug, comp), { ...pedido, status: 'rodando' });
    out.push({ comp, itens: pedido.itens, reanalisar: !!pedido.reanalisar, requestedAt: pedido.requestedAt });
  }
  return out;
}

// ───────── progresso e resultado da rodada (logs/, fora do git) ─────────
const progFile = (slug) => join(ROOT(), 'logs', 'fichas', `${slug}.json`);
const ultimoFile = (slug) => join(ROOT(), 'logs', 'fichas', `${slug}-ultimo.json`);
export function lerProgresso(slug) { try { return existsSync(progFile(slug)) ? json(progFile(slug)) : null; } catch { return null; } }
/** passo atual ("Preparando", "Quadros (Haiku)", "Analisando (Opus)"…) e as chaves em análise agora */
export function escreverProgresso(slug, passo, itens = []) {
  gravar(progFile(slug), { passo, itens, em: agora() });
  // o mesmo passo no registro de atividade (046): o dock do app mostra
  try { const l = json(join(ROOT(), 'logs', 'heartbeat', '.lock')); if (l.kind === 'fichas' && l.atividade) AT.passo(l.atividade, itens.length ? `${passo} · ${itens.length} item(ns)` : passo); } catch { /* sem lock: rodando à mão */ }
}
export function lerUltimo(slug) { try { return existsSync(ultimoFile(slug)) ? json(ultimoFile(slug)) : null; } catch { return null; } }

/**
 * Fecha a rodada: o que ficou analisado sai da fila (pedido vazio = apagado); o resto volta a "pendente".
 * Grava o resultado em logs/fichas/<slug>-ultimo.json (o app mostra e abre o painel do primeiro feito).
 */
export function fechar(slug, { erro = null, parado = false, inicio = null, rodada = null } = {}) {
  // `rodada` = o que estava na fila quando começou (o Claude pode já ter tirado itens com `tirar`)
  const base = rodada ?? listarPedidos(slug).map(({ comp, pedido }) => ({ comp, itens: pedido.itens, reanalisar: !!pedido.reanalisar, requestedAt: pedido.requestedAt }));
  const feitos = base.flatMap((r) => r.itens.filter((k) => feito(slug, r.comp, k, r)).map((key) => ({ comp: r.comp, key })));
  const restantes = [];
  for (const { comp, pedido } of listarPedidos(slug)) {
    const ok = pedido.itens.filter((k) => feito(slug, comp, k, pedido) || feitos.some((x) => x.comp === comp && x.key === k));
    if (tirar(slug, comp, ok)) {
      const p = json(pedidoPath(slug, comp));
      gravar(pedidoPath(slug, comp), { ...p, status: 'pendente' });
      restantes.push(...p.itens.map((key) => ({ comp, key })));
    }
  }
  const res = { fim: agora(), inicio, feitos, restantes, erro: erro ?? (parado ? 'Parado por você.' : null), parado };
  gravar(ultimoFile(slug), res);
  rmSync(progFile(slug), { force: true });
  return res;
}

/** prompt de uma linha (vai pelo shell do Windows: sem quebras de linha nem aspas duplas) */
export function promptFila(slug, pedidos) {
  const fila = pedidos.map((p) => `${p.comp}: ${p.itens.join(', ')}${p.reanalisar ? ' (REANALISAR: use --reanalisar no preparar e no salvar)' : ''}`).join(' | ');
  return [
    `Use a skill referencias, passo 3 (fichas da 040), e rode a fila de fichas da empresa ${slug}.`,
    'Você foi disparado pelo app: o Oliver não está na conversa, não pergunte nada; o que não der, explique na última linha da resposta.',
    `Fila fixada no clique (pedido.json de cada concorrente; conferir com node tools/fichas-fila.mjs fila ${slug}): ${fila}.`,
    `Ordem: 1) preparar (script): npm run fichas -- preparar ${slug} <concorrente> <chaves...>;`,
    '2) quadros: UM subagente model haiku para a rodada inteira descreve os quadros de data/intel/... em 1 linha + texto literal da tela, grava o JSON e roda npm run fichas -- quadros;',
    '3) pacote + análise: subagente model opus (até 5 itens por subagente) lê tools/fichas/prompt-analise.md, roda npm run fichas -- pacote, abre só as 2 imagens marcadas e grava o JSON da análise;',
    `4) salvar: npm run fichas -- salvar; a cada item salvo, tire da fila: node tools/fichas-fila.mjs tirar ${slug} <concorrente> <chave>;`,
    '5) npm run validate no fim.',
    `Progresso para o app: no começo de cada etapa rode node tools/fichas-fila.mjs passo ${slug} <etapa> [chaves separadas por vírgula] (etapas: Preparando, Quadros, Analisando, Salvando).`,
    'Item que falhar fica na fila; não invente o que faltar (Instagram sem cookies = só capa e legenda).',
  ].join(' ');
}
