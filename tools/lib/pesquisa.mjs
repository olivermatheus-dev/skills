// Pesquisa de ideias pelo app (041 F3): o que o heartbeat (--pesquisa) e o app compartilham, só JSON, sem LLM.
// O pedido da rodada (companies/<slug>/curadoria/rodadas/<id>/pedido.json) é o MESMO que `npm run curadoria -- pedir` grava;
// aqui ficam o status dele durante a execução, o fecho (quando o Claude sai) e o prompt que dispara a rodada.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = (f) => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const gravar = (f, v) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`); };
export const agora = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');

export const rodadaDir = (slug, round) => join(ROOT(), 'companies', slug, 'curadoria', 'rodadas', round);
export const pedidoFile = (slug, round) => join(rodadaDir(slug, round), 'pedido.json');
export const resultadoFile = (slug, round) => join(rodadaDir(slug, round), 'resultado.json');
const ultimoFile = (slug) => join(ROOT(), 'logs', 'curadoria', `${slug}-ultimo.json`);

export const lerPedido = (slug, round) => (existsSync(pedidoFile(slug, round)) ? json(pedidoFile(slug, round)) : null);
export function marcarPedido(slug, round, status) {
  const p = lerPedido(slug, round);
  if (!p) throw new Error(`rodada ${round} não existe`);
  if (p.status !== status) gravar(pedidoFile(slug, round), { ...p, status });
  return { ...p, status };
}
export function lerUltimo(slug) { try { return existsSync(ultimoFile(slug)) ? json(ultimoFile(slug)) : null; } catch { return null; } }

/**
 * Fecha a rodada quando o Claude sai: com resultado.json = feita; sem ele, "parado" volta a pendente (dá para rodar de novo)
 * e o resto vira erro. O motivo fica em logs/curadoria/<slug>-ultimo.json (o app mostra no painel).
 */
export function fechar(slug, round, { erro = null, parado = false, inicio = null } = {}) {
  const feita = existsSync(resultadoFile(slug, round));
  const p = lerPedido(slug, round);
  if (p && p.status !== 'feito') marcarPedido(slug, round, feita ? 'feito' : parado ? 'pendente' : 'erro');
  const msg = feita ? null : (erro ?? (parado ? 'Parado por você.' : 'A rodada terminou sem gravar o resultado.'));
  const res = { round, inicio, fim: agora(), feita, parado, erro: msg };
  gravar(ultimoFile(slug), res);
  return res;
}

/**
 * Prompt de uma linha (vai pelo shell do Windows: sem quebras de linha nem aspas duplas). Não copia texto do pedido para
 * dentro dele: o Claude lê pedido.json (instruções do Oliver ficam lá).
 */
export function promptPesquisa(slug, round, { interativo = false } = {}) {
  const dir = `companies/${slug}/curadoria/rodadas/${round}`;
  return [
    `Use a skill curadoria e rode a rodada ${round} da empresa ${slug} do começo ao fim.`,
    interativo ? 'O Oliver está no terminal com você: pode confirmar dúvidas rápidas.'
      : 'Você foi disparado pelo app: o Oliver não está na conversa, não pergunte nada; o que não der, explique na última linha da resposta.',
    `O pedido está em ${dir}/pedido.json (série, pilar ou tema, fontes, período, quantas ideias, profundidade, idiomas e instruções do Oliver): leia primeiro e obedeça.`,
    `Se não existir ${dir}/consultas.json, defina as consultas e os termos pela série, pilar ou tema e pelo CONTENT_STRATEGY.md (consultas em pt e en, curtas): npm run curadoria -- consultas ${slug} ${round} --pt 'a; b' --en 'c; d' --termos 'x; y'.`,
    `Depois, na ordem da skill: npm run curadoria -- rodada ${slug} ${round}; triagem (um subagente model haiku, ou triar --sem-modelo se a profundidade for rapida); npm run curadoria -- verificar ${slug} ${round}; síntese sua com no máximo o número de ideias do pedido (sintese.json); npm run curadoria -- gravar ${slug} ${round}; npm run validate.`,
    'Profundidade rapida = sem subagente Sonnet de leitura de página. Nunca invente referência: sem trecho verificado não há ideia.',
    'O app acompanha pelos arquivos da rodada (consultas, brutos, candidatos, achados, verificados, sintese e resultado): grave cada um assim que o passo terminar.',
    'Se medir o custo (node tools/usage.mjs), ponha em cost no sintese.json; acima de US$ 3 avise nas notas.',
  ].join(' ');
}
