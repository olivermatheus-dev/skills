// Fila de fichas da 040 pelo terminal (o app grava os pedidos; quem roda é o Claude Code, sob comando).
//   node tools/fichas-fila.mjs fila <slug>                       o que está pedido (por concorrente)
//   node tools/fichas-fila.mjs passo <slug> <etapa> [chave,…]    progresso para a faixa do app
//   node tools/fichas-fila.mjs tirar <slug> <concorrente> <chave>…   tira da fila (depois do salvar)
//   node tools/fichas-fila.mjs fechar <slug>                     tira o que já foi analisado e volta o resto a "pendente"
// Rodar a fila inteira em segundo plano (o mesmo do botão do app): node tools/heartbeat.mjs --run --slug <slug> --fichas
import { listarPedidos, feito, tirar, escreverProgresso, fechar } from './lib/fichas-fila.mjs';

const [cmd, slug, ...rest] = process.argv.slice(2);
if (!cmd || !slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.log('uso: node tools/fichas-fila.mjs fila|passo|tirar|fechar <slug> …');
  process.exit(cmd ? 1 : 0);
}

if (cmd === 'fila') {
  const ps = listarPedidos(slug);
  if (!ps.length) console.log(`Fila de fichas da ${slug} vazia.`);
  for (const { comp, pedido } of ps) {
    console.log(`${comp} · ${pedido.itens.length} item(ns) · ${pedido.status ?? 'pendente'}${pedido.reanalisar ? ' · REANALISAR' : ''} · pedido em ${pedido.requestedAt}`);
    for (const k of pedido.itens) console.log(`  ${k}${feito(slug, comp, k, pedido) ? '  (já analisado: sai no fechar)' : ''}`);
  }
} else if (cmd === 'passo') {
  const [etapa, chaves = ''] = rest;
  if (!etapa) { console.error('falta a etapa'); process.exit(1); }
  escreverProgresso(slug, etapa, chaves.split(',').map((s) => s.trim()).filter(Boolean));
  console.log(`progresso: ${etapa}`);
} else if (cmd === 'tirar') {
  const [comp, ...keys] = rest;
  if (!comp || !keys.length) { console.error('uso: tirar <slug> <concorrente> <chave>…'); process.exit(1); }
  console.log(`${comp}: ${tirar(slug, comp, keys)} item(ns) ainda na fila`);
} else if (cmd === 'fechar') {
  const r = fechar(slug);
  console.log(`${r.feitos.length} analisado(s) saíram da fila · ${r.restantes.length} continuam pendentes`);
} else {
  console.error(`comando desconhecido: ${cmd}`);
  process.exit(1);
}
