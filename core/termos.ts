// Vocabulário vivo (tarefa 040, fase H): o que o app e o CLI precisam saber de um termo novo proposto pela IA:
// em que estado está, quem o propôs, onde as fichas o usam e qual termo existente o substitui se for recusado.
// Reetiquetar = as fichas que usavam o recusado passam a usar o substituto COMO EDIÇÃO DO OLIVER (override com data, só nos caminhos
// afetados): a ordem "você > IA > regra" e o histórico ficam intactos, porque a análise da IA nunca é tocada e "voltar ao da IA" desfaz.
// Quem decide (aceitar/recusar) é tools/fichas/decidir.ts, o mesmo para o CLI, o painel da ficha e o relatório; aqui só a leitura e a troca.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Ficha, TermoNovo } from '../schema/ficha';
import { ROOT, ValidationError, listCompetitors } from './store';
import { CAMINHOS_EDITAVEIS, camposEfetivos, editarFicha, getAt, vocabView } from './fichas';
import { fichasDir, loadVocab } from '../tools/fichas/lib';
import { termoExiste } from '../tools/fichas/termos';
import { VOCAB_GRUPOS } from '../schema/vocabulario';

export type EstadoTermo = 'aceito' | 'recusado' | 'pendente';

/** o termo já existe no lugar dele (aceito), foi recusado ou ainda espera o Oliver? Vale para qualquer caminho (painel, relatório, CLI). */
export function estadoDoTermo(slug: string, grupo: string, valor: string): EstadoTermo {
  if (loadVocab().recusados.some((r) => r.grupo === grupo && r.valor === valor)) return 'recusado';
  try { if (termoExiste(slug, grupo, valor)) return 'aceito'; } catch { /* grupo desconhecido: fica pendente */ }
  return 'pendente';
}

// ───────────────────────── onde cada grupo aparece na ficha ─────────────────────────
type Forma = 'str' | 'arr' | 'objs';
interface Uso { path: string; forma: Forma; chave?: string }
/** grupo do termo → caminhos editáveis da ficha em que o id aparece. `funil` fica de fora: o Oliver o corrige no marks.json da 037 */
const USOS: Record<string, Uso[]> = {
  tipoConteudo: [{ path: 'tipoConteudo.principal', forma: 'str' }, { path: 'tipoConteudo.secundarios', forma: 'arr' }],
  formato: [{ path: 'formato', forma: 'str' }, { path: 'adaptar', forma: 'objs', chave: 'formato' }],
  estiloProducao: [{ path: 'estiloProducao', forma: 'str' }],
  tema: [{ path: 'tema.tag', forma: 'str' }],
  tipoGancho: [{ path: 'gancho.tipo', forma: 'str' }],
  canalGancho: [{ path: 'gancho.canal', forma: 'str' }],
  elemento5s: [{ path: 'retencao5s', forma: 'objs', chave: 'elemento' }],
  gatilho: [{ path: 'gatilhos', forma: 'objs', chave: 'id' }, { path: 'retencao5s', forma: 'objs', chave: 'gatilho' }],
  estruturaMacro: [{ path: 'estrutura.macro', forma: 'str' }],
  ctaTipo: [{ path: 'cta.tipo', forma: 'str' }],
  produtoPresenca: [{ path: 'produto.presenca', forma: 'str' }],
  publico: [{ path: 'publico.quem', forma: 'arr' }],
  consciencia: [{ path: 'publico.consciencia', forma: 'str' }],
  tom: [{ path: 'tom', forma: 'arr' }],
  som: [{ path: 'som', forma: 'str' }],
  risco: [{ path: 'riscos', forma: 'objs', chave: 'tipo' }],
  autoria: [{ path: 'autoria', forma: 'str' }],
  provaTipo: [{ path: 'provaTipo', forma: 'str' }],
  angulo: [{ path: 'angulo', forma: 'arr' }],
};
const editavel = (p: string) => (CAMINHOS_EDITAVEIS as readonly string[]).includes(p);

type Obj = Record<string, unknown>;
/** troca `de` por `para` no valor efetivo; devolve o valor novo ou `undefined` se nada mudou */
function trocar(val: unknown, u: Uso, de: string, para: string): unknown {
  if (u.forma === 'str') return val === de ? para : undefined;
  if (!Array.isArray(val)) return undefined;
  if (u.forma === 'arr') {
    if (!val.includes(de)) return undefined;
    return [...new Set(val.map((x) => (x === de ? para : x)))];
  }
  if (!val.some((o) => o && (o as Obj)[u.chave!] === de)) return undefined;
  const novo = val.map((o) => (o && (o as Obj)[u.chave!] === de ? { ...(o as Obj), [u.chave!]: para } : o));
  // gatilhos: dois com o mesmo id depois da troca viram um só (fica o primeiro, com o trecho dele)
  return u.path === 'gatilhos' ? novo.filter((o, i) => novo.findIndex((p) => (p as Obj).id === (o as Obj).id) === i) : novo;
}

/** todas as fichas analisadas do projeto (leitura leve, sem validar) */
function fichasAnalisadas(slug: string): { comp: string; ficha: Ficha }[] {
  const out: { comp: string; ficha: Ficha }[] = [];
  for (const c of listCompetitors(slug)) {
    const dir = fichasDir(slug, c.data.id);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json') && x !== 'pedido.json')) {
      try {
        const ficha = JSON.parse(readFileSync(join(dir, f), 'utf8').replace(/^﻿/, '')) as Ficha;
        if (ficha?.key && ficha.analise) out.push({ comp: c.data.id, ficha });
      } catch { /* ficha quebrada: o validate acusa */ }
    }
  }
  return out;
}

/** fichas que PROPUSERAM o termo (análise atual) */
export function proponentesDoTermo(slug: string, grupo: string, valor: string): { comp: string; ficha: Ficha; termo: TermoNovo }[] {
  return fichasAnalisadas(slug).flatMap(({ comp, ficha }) => {
    const termo = ficha.analise!.termosNovos.find((t) => t.grupo === grupo && t.valor === valor);
    return termo ? [{ comp, ficha, termo }] : [];
  });
}

export interface UsoDoTermo { comp: string; key: string; paths: string[] }
/** onde o termo está sendo usado AGORA (valor efetivo: o que o Oliver editou já vale) */
export function usosDoTermo(slug: string, grupo: string, valor: string): { fichas: UsoDoTermo[]; campos: number } {
  const fichas: UsoDoTermo[] = [];
  for (const { comp, ficha } of fichasAnalisadas(slug)) {
    const ef = camposEfetivos(ficha);
    const paths = (USOS[grupo] ?? []).filter((u) => trocar(getAt(ef, u.path), u, valor, '') !== undefined).map((u) => u.path);
    if (paths.length) fichas.push({ comp, key: ficha.key, paths });
  }
  return { fichas, campos: fichas.reduce((n, f) => n + f.paths.length, 0) };
}

// ───────────────────────── qual termo existente substitui ─────────────────────────
const STOP = new Set(['para', 'como', 'com', 'uma', 'que', 'sem', 'nos', 'nas', 'dos', 'das', 'pelo', 'pela', 'mais', 'muito', 'sobre', 'entre', 'quando', 'onde', 'seu', 'sua', 'seus', 'suas', 'esse', 'essa', 'isso', 'este', 'esta', 'caso', 'tipo', 'video', 'conteudo']);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tokens = (s: string) => new Set(norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOP.has(w)).map((w) => w.replace(/(es|s)$/, '')));

/** candidatos do mesmo grupo, do mais provável ao menos: palavras em comum entre o termo (id, definição, exemplo) e o verbete (nome pesa 3, definição e sinais 1); sem nada em comum, o mais usado nas fichas */
export function sugerirSubstitutos(slug: string, grupo: string, valor: string, texto: string, limite = 4): string[] {
  const opcoes = (vocabView(slug).grupos[grupo] ?? []).filter((o) => o.id !== valor);
  if (!opcoes.length) return [];
  const alvo = tokens(`${valor.replace(/-/g, ' ')} ${texto}`);
  const sinais = new Map((loadVocab().grupos as unknown as Record<string, { id: string; sinais: string[] }[]>)[grupo]?.map((t) => [t.id, t.sinais.join(' ')]) ?? []);
  // palavra que aparece em muitos verbetes do grupo diz pouco: pesa 1/df (df = em quantos verbetes aparece)
  const nomes = opcoes.map((o) => tokens(`${o.id.replace(/-/g, ' ')} ${o.nome}`));
  const defs = opcoes.map((o) => tokens(`${o.definicao ?? ''} ${sinais.get(o.id) ?? ''}`));
  const df = new Map<string, number>();
  opcoes.forEach((_, i) => { for (const w of new Set([...nomes[i], ...defs[i]])) df.set(w, (df.get(w) ?? 0) + 1); });
  const pontos = opcoes.map((o, i) => {
    let s = 0;
    for (const w of nomes[i]) if (alvo.has(w)) s += 3 / (df.get(w) ?? 1);
    for (const w of defs[i]) if (alvo.has(w)) s += 1 / (df.get(w) ?? 1);
    return { id: o.id, s };
  });
  if (pontos.every((p) => p.s === 0)) {
    const uso = new Map<string, number>();
    for (const { ficha } of fichasAnalisadas(slug)) for (const u of USOS[grupo] ?? []) {
      const v = getAt(camposEfetivos(ficha), u.path);
      const ids = u.forma === 'str' ? [v] : Array.isArray(v) ? v.map((x) => (u.forma === 'arr' ? x : (x as Obj)?.[u.chave!])) : [];
      for (const id of ids) if (typeof id === 'string') uso.set(id, (uso.get(id) ?? 0) + 1);
    }
    for (const p of pontos) p.s = (uso.get(p.id) ?? 0) / 1000; // desempate só por uso
  }
  return pontos.sort((a, b) => b.s - a.s).slice(0, limite).map((p) => p.id);
}

// ───────────────────────── o que a tela precisa para decidir ─────────────────────────
export interface TermoInfo {
  grupo: string; valor: string; definicao: string; exemplo?: string; estado: EstadoTermo;
  /** fichas que propuseram */
  proponentes: number;
  /** fichas e campos que usam o termo agora (é o que o Recusar reetiqueta) */
  usos: { fichas: number; campos: number };
  /** o mais provável e os demais candidatos, em ordem; vazio se o grupo não tem outro termo */
  sugestao: string | null;
  candidatos: string[];
  /** formato: o rascunho já existe em library/formatos/? */
  rascunhoCriado?: boolean;
}

export function termoInfo(slug: string, grupo: string, valor: string): TermoInfo | null {
  if (!SLUG.test(slug)) throw new ValidationError('termo', ['empresa inválida']);
  conferirTermo(grupo, valor);
  const props = proponentesDoTermo(slug, grupo, valor);
  const estado = estadoDoTermo(slug, grupo, valor);
  if (!props.length && estado === 'pendente') return null;
  const t = props[0]?.termo;
  const definicao = t?.definicao ?? '';
  const candidatos = sugerirSubstitutos(slug, grupo, valor, `${definicao} ${t?.exemplo ?? ''}`);
  const u = usosDoTermo(slug, grupo, valor);
  return {
    grupo, valor, definicao, ...(t?.exemplo ? { exemplo: t.exemplo } : {}), estado, proponentes: props.length,
    usos: { fichas: u.fichas.length, campos: u.campos }, sugestao: candidatos[0] ?? null, candidatos,
    ...(grupo === 'formato' ? { rascunhoCriado: existsSync(join(ROOT, 'library', 'formatos', valor, 'formato.json')) } : {}),
  };
}

// ───────────────────────── reetiquetar ─────────────────────────
export interface Reetiquetado { fichas: number; campos: number; puladas: { key: string; path: string; motivo: string }[] }

/**
 * Recusou o termo e escolheu o substituto: em TODAS as fichas do projeto, o campo que o usava passa a usar o substituto, como edição
 * do Oliver (`override` + data em `override.editados`). A análise da IA fica como estava; "voltar ao da IA" restaura o termo recusado
 * (que continua válido, porque a própria análise o propôs). Não mexe em campo que já não usa o termo (o Oliver já o trocou).
 */
/** o substituto serve? (grupo com campo na ficha, outro termo, existente no grupo). Chamado ANTES de gravar a recusa: substituto ruim não vai para `recusados` */
export function conferirSubstituto(slug: string, grupo: string, valor: string, substituto: string) {
  if (!USOS[grupo]) throw new ValidationError('termo', [`o grupo "${grupo}" não tem campo para reetiquetar`]);
  if (substituto === valor) throw new ValidationError('termo', ['o substituto precisa ser outro termo']);
  if (!(vocabView(slug).grupos[grupo] ?? []).some((o) => o.id === substituto)) throw new ValidationError('termo', [`"${substituto}" não existe no grupo ${grupo}: escolha um termo do vocabulário`]);
}

/** grupos que um termo novo pode ter (vocabulário + formato + tags do nicho) */
export const GRUPOS_TERMO = [...VOCAB_GRUPOS, 'formato', 'tema', 'angulo', 'publico'] as const;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
/** grupo e valor bem formados (vêm da URL ou do corpo da requisição; o valor vira nome de pasta no formato rascunho) */
export function conferirTermo(grupo: string, valor: string) {
  if (!(GRUPOS_TERMO as readonly string[]).includes(grupo)) throw new ValidationError('termo', [`grupo desconhecido "${grupo}"`]);
  if (!SLUG.test(valor) || valor.length > 80) throw new ValidationError('termo', [`termo inválido "${valor}"`]);
}

export function reetiquetarTermo(slug: string, grupo: string, valor: string, substituto: string): Reetiquetado {
  conferirSubstituto(slug, grupo, valor, substituto);
  const r: Reetiquetado = { fichas: 0, campos: 0, puladas: [] };
  for (const { comp, key, paths } of usosDoTermo(slug, grupo, valor).fichas) {
    let feitos = 0;
    for (const u of USOS[grupo].filter((x) => paths.includes(x.path))) {
      if (!editavel(u.path)) { r.puladas.push({ key, path: u.path, motivo: 'campo não editável no painel' }); continue; }
      try {
        // relê a cada caminho: o anterior pode ter mudado a mesma ficha (retencao5s serve a dois grupos)
        const atual = fichasAnalisadas(slug).find((x) => x.ficha.key === key && x.comp === comp)!;
        const novo = trocar(getAt(camposEfetivos(atual.ficha), u.path), u, valor, substituto);
        if (novo === undefined) continue;
        editarFicha(slug, comp, key, { path: u.path, value: novo });
        feitos++;
      } catch (e) { r.puladas.push({ key, path: u.path, motivo: String((e as Error).message).split('\n')[0] }); }
    }
    if (feitos) { r.fichas++; r.campos += feitos; }
  }
  return r;
}
