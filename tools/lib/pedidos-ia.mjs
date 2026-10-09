// Pedidos avulsos de IA pelo app (046 D): "Pedir ajustes ao Claude" (anotações de vídeo, slides e roteiro), "Rodar agora" na
// análise do concorrente e o relatório em segundo plano. O app grava o pedido (prompt, agente, ferramentas extras) em
// logs/pedidos-ia/<id>.json (fora do git) e dispara `heartbeat.mjs --run --pedido <id>`: mesmo lock, dock e passos do Rodar IA.
// No fim (ou no Parar), `fechar` arruma o que é de cada tipo e devolve uma linha de resumo. Só JSON, sem LLM.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = () => join(ROOT(), 'logs', 'pedidos-ia');
const file = (id) => join(DIR(), `${id}.json`);
const okId = (id) => typeof id === 'string' && /^[\w-]+$/.test(id);
const json = (f) => { try { return JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return null; } };
const gravar = (p) => { mkdirSync(DIR(), { recursive: true }); writeFileSync(file(p.id), `${JSON.stringify(p, null, 2)}\n`); return p; };
const agora = () => new Date().toISOString();

/**
 * Novo pedido. `tipo`: ajustes | analise | relatorio | insumos. `ref`: chave da tela que acompanha (peca:<pasta> · analise:<id|*> ·
 * relatorio:<concorrente>). `agente`: orquestrador ou agent:<nome> (este roda com --agent). `allowed`: ferramentas além das
 * do heartbeat. `extra`: o que o fecho do tipo precisa (ids das anotações, concorrentes…).
 */
export function criar({ slug, tipo, titulo, agente = 'orquestrador', link = null, ref, prompt, allowed = [], disallowed = [], extra = {} }) {
  const id = `${agora().replace(/[-:T]/g, '').slice(0, 14)}-${tipo}-${Math.random().toString(36).slice(2, 6)}`;
  return gravar({ id, slug, tipo, titulo, agente, link, ref, prompt, allowed, disallowed, extra, status: 'fila', criado: agora(), inicio: null, fim: null, atividade: null, resumo: null, erro: null });
}

export const ler = (id) => (okId(id) ? json(file(id)) : null);
export function atualizar(id, patch) { const p = ler(id); return p ? gravar({ ...p, ...patch }) : null; }

/** o pedido mais novo de uma tela (ref), ou null */
export function ultimoPor(slug, ref) {
  if (!existsSync(DIR())) return null;
  for (const f of readdirSync(DIR()).filter((n) => n.endsWith('.json')).sort().reverse()) {
    const p = json(join(DIR(), f));
    if (p?.slug === slug && p.ref === ref) return p;
  }
  return null;
}

// ---------- fecho por tipo ----------
const pecaDir = (slug, pasta) => join(ROOT(), 'companies', slug, 'contents', pasta);
const pedidoAnalise = (slug, comp) => join(ROOT(), 'companies', slug, 'competitors', comp, 'analysis', 'pedido.json');

function fecharAjustes(p, saida) {
  const f = join(pecaDir(p.slug, p.extra.pasta), 'revisao.json');
  const rev = json(f);
  const ids = p.extra.ids ?? [];
  const cs = (rev?.comments ?? []).filter((c) => ids.includes(c.id));
  // resolvida sem resposta (a IA não usou o review.mjs): a resposta vira o texto final do Claude, para o Oliver ver o que mudou
  const semResposta = cs.filter((c) => c.status === 'resolvido' && !c.reply);
  const fala = (saida ?? '').trim().replace(/\s+/g, ' ').slice(0, 400);
  if (semResposta.length && fala) {
    for (const c of semResposta) { c.reply = fala; c.resolvedAt ??= agora().slice(0, 19); }
    writeFileSync(f, `${JSON.stringify(rev, null, 2)}\n`);
  }
  const feitas = cs.filter((c) => c.status === 'resolvido').length;
  const respondidas = cs.filter((c) => c.status === 'aberto' && c.reply && (!c.replyAt || c.replyAt >= p.inicio)).length;
  return `${feitas} de ${ids.length} anotação(ões) resolvida(s)${respondidas ? ` · ${respondidas} com pergunta para você` : ''}`;
}

/** quantas opções a IA gravou (origem ia, criada depois do início do pedido) */
function fecharInsumos(p) {
  const proj = json(join(pecaDir(p.slug, p.extra.pasta), 'projeto.json')) ?? {};
  const lista = { abertura: proj.eixos?.abertura, headline: proj.insumos?.headlines, cta: proj.insumos?.ctas, copy: proj.insumos?.copys }[p.extra.tipo] ?? [];
  const novas = lista.filter((o) => o?.origem === 'ia' && o.criado && o.criado >= (p.inicio ?? p.criado).slice(0, 19)).length;
  return `${novas} de ${p.extra.quantidade ?? '?'} opção(ões) gravada(s)`;
}

function fecharAnalise(p) {
  // o que ficou "rodando" volta a pendente (dá para rodar de novo); cada `salvar` do script já tirou do pedido o que ficou pronto
  let restam = 0;
  for (const comp of p.extra.comps ?? []) {
    const f = pedidoAnalise(p.slug, comp);
    const ped = existsSync(f) && json(f);
    if (!ped) continue;
    restam += ped.modules?.length ?? 0;
    if (ped.status === 'rodando') writeFileSync(f, `${JSON.stringify({ ...ped, status: 'pendente' }, null, 2)}\n`);
  }
  const total = p.extra.modulos ?? 0;
  return `${Math.max(0, total - restam)} de ${total} módulo(s) feitos${restam ? ` · ${restam} continuam na fila` : ''}`;
}

/** fecha o pedido: arruma o que é do tipo e grava o status. Devolve { status, resumo, erro }. */
export function fechar(id, { parado = false, erro = null, saida = '' } = {}) {
  const p = ler(id);
  if (!p) return { status: 'erro', resumo: null, erro: 'pedido não encontrado' };
  if (['feito', 'erro', 'parado'].includes(p.status)) return { status: p.status, resumo: p.resumo, erro: p.erro };
  let resumo = null;
  try {
    if (p.tipo === 'ajustes') resumo = fecharAjustes(p, saida);
    else if (p.tipo === 'analise') resumo = fecharAnalise(p);
    else if (p.tipo === 'insumos') resumo = fecharInsumos(p);
    else if (p.tipo === 'relatorio') resumo = 'Relatório pronto';
  } catch (e) { resumo = `(não consegui resumir: ${e.message})`; }
  const status = parado ? 'parado' : erro ? 'erro' : 'feito';
  if (parado) resumo = `Parado por você${resumo && p.tipo !== 'relatorio' ? ` · ${resumo}` : ''}`;
  gravar({ ...p, status, resumo, erro, fim: agora() });
  return { status, resumo, erro };
}
