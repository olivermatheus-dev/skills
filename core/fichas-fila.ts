// Fila de fichas no app (tarefa 040, fase E): seleção → pedido.json de cada concorrente (lista fixada no clique) →
// "Rodar agora" dispara o Claude Code pelo mesmo caminho do Rodar IA (heartbeat --fichas, mesmo lock) → progresso e fecho.
// Um pedido POR CONCORRENTE (não um geral): é o arquivo que a fase D já grava ("Analisar este"), mora ao lado das fichas,
// e os comandos de tools/fichas (preparar/pacote/salvar) já trabalham por concorrente. O app só junta tudo na tela.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { FICHA_KEY_RE } from '../schema/ficha';
import { FichasPedido } from '../schema/relatorio';
import { ROOT, ValidationError, listCompetitors } from './store';
import { readLock, runFichas, stopAi, filaPor, posicaoNaFila } from './runner';
import { env } from '../tools/intel/env';
import * as L from '../tools/lib/fichas-fila.mjs';

const isSlug = (v: string) => /^[a-z0-9][a-z0-9-]*$/.test(v);

export interface FilaItem { comp: string; key: string }
export interface FilaStatus {
  /** a fila de fichas desta empresa está rodando agora */
  running: boolean;
  started: string | null;
  /** etapa atual (o Claude grava com `node tools/fichas-fila.mjs passo`) */
  passo: string | null;
  /** "comp|key" em análise agora (vazio = a rodada inteira está em andamento) */
  analisando: string[];
  /** a IA está ocupada com outra coisa (tarefa do quadro ou outra empresa) */
  ocupado: { task: string | null; title: string | null; slug: string | null } | null;
  /** a fila de fichas esperando a vez na fila da IA (046 F): posição (1 = a próxima) */
  naFila: number | null;
  pedidos: { comp: string; itens: string[]; status: 'pendente' | 'rodando'; reanalisar: boolean; requestedAt: string }[];
  ultimo: L.Ultimo | null;
  /** cookies do navegador para o yt-dlp (sem isso, reel do Instagram sai só com capa e legenda) */
  igCookies: boolean;
  log: string[];
}

export function filaStatus(slug: string): FilaStatus {
  const l = readLock();
  const running = !!l && l.kind === 'fichas' && l.slug === slug;
  // rodada que morreu sem fechar (app fechado, processo morto): volta tudo a "pendente"
  if (!running && L.listarPedidos(slug).some((p) => p.pedido.status === 'rodando')) L.fechar(slug, { erro: 'A rodada anterior parou sem terminar.' });
  const prog = running ? L.lerProgresso(slug) : null;
  const pedidos = L.listarPedidos(slug).map(({ comp, pedido }) => ({ comp, itens: pedido.itens, status: pedido.status ?? 'pendente', reanalisar: !!pedido.reanalisar, requestedAt: pedido.requestedAt }));
  const analisando = running ? (prog?.itens.length
    ? pedidos.flatMap((p) => p.itens.filter((k) => prog.itens.includes(k)).map((k) => `${p.comp}|${k}`))
    : []) : [];
  let log: string[] = [];
  if (running && l?.log) {
    try {
      log = readFileSync(isAbsolute(l.log) ? l.log : join(ROOT, l.log), 'utf8').replace(/\x1b\[[0-9;]*m/g, '').split(/\r?\n/).filter(Boolean).slice(-30);
    } catch { /* sem log ainda */ }
  }
  return {
    running, started: running ? l!.started : null, passo: prog?.passo ?? (running ? 'Abrindo o Claude Code' : null), analisando,
    ocupado: l && !running ? { task: l.task ?? null, title: l.title ?? null, slug: l.slug ?? null } : null,
    naFila: posicaoNaFila(filaPor((j) => j.kind === 'fichas' && j.slug === slug)?.atividade),
    pedidos, ultimo: L.lerUltimo(slug),
    igCookies: !!(env('YTDLP_COOKIES_FROM_BROWSER', slug) || env('YTDLP_COOKIES', slug)),
    log,
  };
}

export interface PedirLote {
  itens: FilaItem[]; reanalisar?: boolean; origem?: 'selecao' | 'top'; rede?: 'instagram' | 'tiktok' | 'youtube'; n?: number;
  criterio?: 'xPerfil' | 'xMercado' | 'porSeguidor' | 'engajamento'; rodar?: boolean;
}

/**
 * Grava a lista fixada no pedido de cada concorrente (junta com o que já estava na fila) e, com `rodar`, dispara.
 * Sem `reanalisar`, os já analisados saem aqui também (defesa: o app já tira no clique).
 */
export function pedirLote(slug: string, body: PedirLote) {
  if (!isSlug(slug)) throw new ValidationError('fila', ['empresa inválida']);
  const comps = new Set(listCompetitors(slug).map((c) => c.data.id));
  const itens = Array.isArray(body?.itens) ? body.itens : [];
  if (!itens.length) throw new ValidationError('fila', ['nenhum conteúdo selecionado']);
  const porComp = new Map<string, string[]>();
  const fora: FilaItem[] = [];
  for (const it of itens) {
    const comp = String(it?.comp ?? ''), key = String(it?.key ?? '');
    if (!comps.has(comp)) throw new ValidationError('fila', [`concorrente "${comp}" não existe`]);
    if (!FICHA_KEY_RE.test(key) || /[\\/]/.test(key)) throw new ValidationError('fila', [`chave inválida "${key}"`]);
    if (!body.reanalisar && L.analisadaEm(slug, comp, key)) { fora.push({ comp, key }); continue; }
    porComp.set(comp, [...new Set([...(porComp.get(comp) ?? []), key])]);
  }
  const atuais = new Map(L.listarPedidos(slug).map((p) => [p.comp, p.pedido]));
  for (const comp of porComp.keys()) if (atuais.get(comp)?.status === 'rodando') throw new ValidationError('fila', [`a fila de ${comp} está rodando agora; espere terminar`]);
  const requestedAt = L.agora();
  for (const [comp, keys] of porComp) {
    const atual = atuais.get(comp);
    const p = FichasPedido.parse({
      itens: [...new Set([...(atual?.itens ?? []), ...keys])],
      origem: body.origem ?? 'selecao', ...(body.rede ? { rede: body.rede } : {}), ...(body.n ? { n: body.n } : {}), ...(body.criterio ? { criterio: body.criterio } : {}),
      reanalisar: !!body.reanalisar || !!atual?.reanalisar,
      relatorio: false, // o relatório por concorrente é a fase F
      instrucoes: typeof atual?.instrucoes === 'string' ? atual.instrucoes : '',
      requestedAt, status: 'pendente',
    });
    const f = L.pedidoPath(slug, comp);
    if (!existsSync(dirname(f))) mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, `${JSON.stringify(p, null, 2)}\n`);
  }
  const gravados = [...porComp.values()].reduce((a, k) => a + k.length, 0);
  let rodando = false, aviso: string | null = null;
  if (body.rodar && gravados + L.listarPedidos(slug).length > 0) {
    try { const r = runFichas(slug); rodando = true; if (r.fila.ocupado) aviso = `a IA está ocupada com "${r.fila.ocupado}": entrou na fila (${r.fila.posicao}º) e roda sozinha quando ela acabar`; } catch (e) { aviso = e instanceof ValidationError ? e.issues.join('; ') : String(e); }
  }
  return { gravados, fora: fora.length, rodando, aviso };
}

/** "Rodar a fila" (sem nova seleção): o que já está pedido */
export function rodarFila(slug: string) {
  if (!L.listarPedidos(slug).length) throw new ValidationError('fila', ['a fila de fichas está vazia']);
  return runFichas(slug);
}

/** Parar: mata o Claude da fila; o que já foi salvo sai da fila e o resto volta a "pendente" */
export function pararFila(slug: string) {
  const l = readLock();
  if (!l || l.kind !== 'fichas' || l.slug !== slug) return { stopped: false };
  return stopAi(slug);
}
