// Relatórios por concorrente no app (tarefa 040, fase F): lista por data e rede, leitura, termos novos em lote e "Gerar relatório".
// O cálculo e a gravação ficam em tools/fichas (relatorio.ts, relatorio-lib.ts, termos.ts, decidir.ts); aqui só a ponte.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Relatorio, RelatorioTermo } from '../schema/relatorio';
import type { Ficha } from '../schema/ficha';
import { ValidationError } from './store';
import { openTerminal } from './runner';
import { fichasDir } from '../tools/fichas/lib';
import { lerRelatorio, listarRelatorios } from '../tools/fichas/relatorio-lib';
import { decidirTermos, type Decisao } from '../tools/fichas/decidir';
import { estadoDoTermo } from './termos';

const okSlug = (v: string) => /^[a-z0-9][a-z0-9-]*$/.test(v);
function guard(slug: string, comp: string, id?: string) {
  if (!okSlug(slug) || !okSlug(comp)) throw new ValidationError('relatorio', ['empresa ou concorrente inválido']);
  if (id !== undefined && !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id)) throw new ValidationError('relatorio', [`id inválido "${id}"`]);
}

export interface RelatorioLinha {
  id: string; rede: Relatorio['rede']; escopo: Relatorio['escopo']; itens: number; gerado: string; emDestaque: boolean; modelo: string;
  leitura: boolean; nivel: string | null; resumo: string | null; termosPendentes: number; custoUsd: number | null;
}

/** o termo ainda está pendente? (decidido no relatório, ou aceito/recusado por outro caminho desde então: painel da ficha, CLI) */
function estadoTermo(slug: string, t: RelatorioTermo): 'aceito' | 'recusado' | 'pendente' {
  // o estado do vocabulário manda: recusado no relatório e aceito depois no painel aparece como aceito (e vice-versa)
  const atual = estadoDoTermo(slug, t.grupo, t.valor);
  return atual !== 'pendente' ? atual : (t.decisao ?? 'pendente');
}

export function listarRelatoriosView(slug: string, comp: string): RelatorioLinha[] {
  guard(slug, comp);
  return listarRelatorios(slug, comp).map(({ data: r }) => ({
    id: r.id, rede: r.rede, escopo: r.escopo, itens: r.itens.length, gerado: r.gerado, emDestaque: r.emDestaque, modelo: r.modelo,
    leitura: !!r.leitura, nivel: ((r.agregados as { amostra?: { nivel?: string } }).amostra?.nivel) ?? null, resumo: r.leitura?.resumo[0] ?? null,
    termosPendentes: r.termosNovos.filter((t) => estadoTermo(slug, t) === 'pendente').length, custoUsd: r.custo?.usd ?? null,
  }));
}

export interface RelatorioView { relatorio: Relatorio; termos: (RelatorioTermo & { estado: 'aceito' | 'recusado' | 'pendente' })[] }

export function relatorioView(slug: string, comp: string, id: string): RelatorioView | null {
  guard(slug, comp, id);
  const d = lerRelatorio(slug, comp, id);
  if (!d) return null;
  return { relatorio: d.data, termos: d.data.termosNovos.map((t) => ({ ...t, estado: estadoTermo(slug, t) })) };
}

/** aceitar/recusar em lote: body = { decisoes: [{ grupo, valor, decisao: 'aceito' | 'recusado', motivo?, substituto? }] } (recusar com substituto reetiqueta as fichas) */
export function decidirTermosView(slug: string, comp: string, id: string, body: { decisoes?: Decisao[] }) {
  guard(slug, comp, id);
  const ds = (Array.isArray(body?.decisoes) ? body.decisoes : []).filter((d) => d && (d.decisao === 'aceito' || d.decisao === 'recusado') && typeof d.grupo === 'string' && typeof d.valor === 'string');
  if (!ds.length) throw new ValidationError('termos', ['nenhuma decisão enviada']);
  const resultado = decidirTermos(slug, comp, id, ds);
  const ruins = resultado.filter((r) => !r.ok);
  if (ruins.length === resultado.length) throw new ValidationError('termos', ruins.map((r) => `${r.grupo}:${r.valor}: ${r.msg}`));
  return { resultado, view: relatorioView(slug, comp, id) };
}

/** fichas analisadas do concorrente, para o diálogo "Gerar relatório" escolher rede e itens */
export interface FichaOpcao { key: string; rede: string; titulo: string; xPerfil: number | null; views: number | null; analisadaEm: string }
export function fichasParaRelatorio(slug: string, comp: string): FichaOpcao[] {
  guard(slug, comp);
  const dir = fichasDir(slug, comp);
  if (!existsSync(dir)) return [];
  const out: FichaOpcao[] = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json') && x !== 'pedido.json')) {
    try {
      const fi = JSON.parse(readFileSync(join(dir, f), 'utf8').replace(/^﻿/, '')) as Ficha;
      if (!fi.analise) continue;
      const it = fi.item as { title?: string | null; caption?: string | null };
      out.push({
        key: fi.key, rede: fi.key.startsWith('meta-ads:') ? 'anuncios' : fi.key.split(':')[0], titulo: (it.title || fi.analise.campos.headline?.texto || it.caption || (it as { text?: string | null }).text || fi.key).replace(/\s+/g, ' ').slice(0, 80),
        xPerfil: fi.medidas?.xPerfil ?? null, views: fi.medidas?.views ?? null, analisadaEm: fi.analise.geradoEm,
      });
    } catch { /* ficha quebrada: o validate acusa */ }
  }
  return out.sort((a, b) => (b.xPerfil ?? -1) - (a.xPerfil ?? -1));
}

/** comando do script (números) — a leitura do Opus vem depois, pelo Claude Code */
export function comandoRelatorio(slug: string, comp: string, rede: string, itens?: string[]) {
  return `npm run fichas -- relatorio ${slug} ${comp} --rede ${rede}${itens?.length ? ` --itens ${itens.join(',')}` : ''} --pacote`;
}

/**
 * "Gerar relatório": abre o Claude Code num terminal (o mesmo caminho do Rodar IA → terminal) com a skill referencias, passo 5.
 * Devolve o comando para quem preferir rodar à mão. Rodar em segundo plano fica para a fila (fase seguinte).
 */
export function gerarRelatorioView(slug: string, comp: string, body: { rede?: string; itens?: string[]; abrir?: boolean }) {
  guard(slug, comp);
  const rede = String(body?.rede ?? '');
  if (!['tiktok', 'youtube', 'instagram', 'anuncios'].includes(rede)) throw new ValidationError('relatorio', ['escolha a rede (TikTok, YouTube, Instagram ou Anúncios)']);
  const ops = fichasParaRelatorio(slug, comp).filter((f) => f.rede === rede);
  if (!ops.length) throw new ValidationError('relatorio', [`nenhuma ficha analisada de ${comp} em ${rede}: analise os conteúdos antes`]);
  const itens = Array.isArray(body?.itens) ? body.itens.filter((k) => ops.some((o) => o.key === k)) : [];
  const todos = !itens.length || itens.length === ops.length;
  const comando = comandoRelatorio(slug, comp, rede, todos ? undefined : itens);
  const prompt = `Use a skill referencias, passo 5 (relatório da rodada): gere o relatório de ${comp} (empresa ${slug}) no ${rede} com ${todos ? `todas as ${ops.length} fichas analisadas` : `as fichas ${itens.join(', ')}`}. Rode ${comando}, leia o pacote, escreva a leitura como especialista sênior em social media (só números dos agregados; amostra pequena = observações) e grave com --rodada <id> --leitura. Termine com npm run validate e me diga o id do relatório.`;
  if (body?.abrir !== false) openTerminal(prompt);
  return { aberto: body?.abrir !== false, comando, itens: todos ? ops.length : itens.length };
}

/** aceitar/recusar FORA de um relatório (painel da ficha): mesma função, a definição vem da ficha que propôs */
export function decidirTermosAvulsosView(slug: string, body: { decisoes?: Decisao[] }) {
  if (!okSlug(slug)) throw new ValidationError('termos', ['empresa inválida']);
  const ds = (Array.isArray(body?.decisoes) ? body.decisoes : []).filter((d) => d && (d.decisao === 'aceito' || d.decisao === 'recusado') && typeof d.grupo === 'string' && typeof d.valor === 'string');
  if (!ds.length) throw new ValidationError('termos', ['nenhuma decisão enviada']);
  const resultado = decidirTermos(slug, '', '', ds);
  const ruins = resultado.filter((r) => !r.ok);
  if (ruins.length === resultado.length) throw new ValidationError('termos', ruins.map((r) => `${r.grupo}:${r.valor}: ${r.msg}`));
  return { resultado };
}
