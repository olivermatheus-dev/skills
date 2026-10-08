// Fichas de análise no app (tarefa 040, fase D): ler a ficha de um item, aplicar as edições do Oliver como override
// (por caminho, com data, sem nunca tocar na análise da IA), resumo por concorrente para o selo "analisado" e o pedido de fila.
// Grava pela mesma porta das ferramentas (tools/fichas/lib.ts → writeFicha valida schema + vocabulário).
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { FICHA_KEY_RE, fichaFileName, type Ficha, type FichaCampos } from '../schema/ficha';
import { FichasPedido } from '../schema/relatorio';
import type { Vocabulario } from '../schema/vocabulario';
import { ROOT, ValidationError, listCompetitors } from './store';
import { fichasDir, loadVocab, readFicha, writeFicha } from '../tools/fichas/lib';

const json = (f: string) => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
const nowIso = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const okKey = (key: string) => { if (!FICHA_KEY_RE.test(key) || /[\\/]/.test(key)) throw new ValidationError('ficha', [`chave inválida "${key}"`]); };

// ───────────────────────── caminhos editáveis ─────────────────────────
/** o que o painel deixa editar (folhas; listas contam como uma folha só) */
export const CAMINHOS_EDITAVEIS = [
  'tema.texto', 'tema.tag', 'mensagem', 'tipoConteudo.principal', 'tipoConteudo.secundarios', 'formato', 'estiloProducao',
  'headline.texto', 'gancho.texto', 'gancho.tipo', 'gancho.canal', 'retencao5s', 'gatilhos', 'estrutura.macro',
  'cta.tipo', 'cta.texto', 'produto.presenca', 'publico.quem', 'publico.consciencia', 'tom', 'som', 'porQue', 'adaptar',
  'riscos', 'replicavel', 'autoria', 'serie',
] as const;

type Obj = Record<string, unknown>;
export const getAt = (o: unknown, path: string): unknown => path.split('.').reduce<unknown>((a, k) => (a && typeof a === 'object' ? (a as Obj)[k] : undefined), o);
const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const igual = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function setAt(o: Obj, path: string, v: unknown) {
  const ks = path.split('.');
  let cur = o;
  for (const k of ks.slice(0, -1)) { if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k] as Obj; }
  cur[ks.at(-1)!] = v;
}

/** override → mapa caminho → data. Override sem `editados` (escrito à mão) vale por chave de topo. */
function editadosDe(f: Ficha): Record<string, string> {
  const { editadoEm, editados, ...resto } = f.override;
  if (editados) return editados;
  return Object.fromEntries(Object.keys(resto).filter((k) => (resto as Obj)[k] !== undefined).map((k) => [k, editadoEm ?? '']));
}

/** os campos que valem: análise da IA com as edições do Oliver por cima (só nos caminhos editados) */
export function camposEfetivos(f: Ficha): Partial<FichaCampos> {
  const out = (clone(f.analise?.campos) ?? {}) as Obj;
  for (const p of Object.keys(editadosDe(f))) setAt(out, p, clone(getAt(f.override, p)));
  return out as Partial<FichaCampos>;
}

export interface EdicaoInfo {
  em: string;
  /** o que a IA diz hoje nesse caminho */
  ia: unknown;
  /** a análise atual é posterior à edição e discorda dela → "a IA agora diz" */
  diverge: boolean;
}
export interface FichaView {
  ficha: Ficha;
  campos: Partial<FichaCampos>;
  edicoes: Record<string, EdicaoInfo>;
  naFila: boolean;
  /** prefixo das imagens dos quadros (data/intel, fora do git) */
  quadrosUrl: string;
}

const quadrosUrl = (slug: string, comp: string, key: string) => `/ficha-file/${slug}/${comp}/${encodeURIComponent(fichaFileName(key).replace(/\.json$/, ''))}/`;

function view(slug: string, comp: string, f: Ficha): FichaView {
  const ger = f.analise?.geradoEm ?? '';
  const edicoes: Record<string, EdicaoInfo> = {};
  for (const [p, em] of Object.entries(editadosDe(f))) {
    const ia = getAt(f.analise?.campos, p);
    edicoes[p] = { em, ia: ia ?? null, diverge: !!ger && !!em && ger > em && !igual(ia, getAt(f.override, p)) };
  }
  return { ficha: f, campos: camposEfetivos(f), edicoes, naFila: pedidoKeys(slug, comp).includes(f.key), quadrosUrl: quadrosUrl(slug, comp, f.key) };
}

export function getFichaView(slug: string, comp: string, key: string): FichaView | null {
  okKey(key);
  const f = readFicha(slug, comp, key);
  return f ? view(slug, comp, f) : null;
}

/** objeto-pai que falta no override: parte do valor efetivo (assim o objeto passa no schema) ou de um mínimo válido */
const MINIMO: Record<string, Obj> = { tema: { texto: '—' }, headline: { texto: '', fonte: 'tela' }, tipoConteudo: { secundarios: [] } };

/**
 * Edita UM caminho. `revert: true` volta ao valor da IA (tira o caminho do override).
 * Nunca toca em `analise` nem em `anteriores`. Valida o arquivo inteiro antes de gravar (schema + vocabulário).
 */
export function editarFicha(slug: string, comp: string, key: string, body: { path?: string; value?: unknown; revert?: boolean }): FichaView {
  okKey(key);
  const path = String(body.path ?? '');
  if (!(CAMINHOS_EDITAVEIS as readonly string[]).includes(path)) throw new ValidationError('ficha', [`campo "${path}" não é editável no painel`]);
  const f = readFicha(slug, comp, key);
  if (!f) throw new ValidationError('ficha', [`${key} não tem ficha`]);
  const ov = f.override as Obj & { editados?: Record<string, string> };
  const editados = { ...editadosDe(f) };
  const top = path.split('.')[0];
  if (body.revert) {
    delete editados[path];
    if (path.includes('.')) {
      if (!Object.keys(editados).some((p) => p === top || p.startsWith(`${top}.`))) delete ov[top];
    } else delete ov[path];
  } else {
    let v = body.value === undefined ? null : body.value;
    if (typeof v === 'string') { v = v.trim(); if (v === '') v = null; }
    if (path === 'tema.texto' && v == null) throw new ValidationError('ficha', ['o tema precisa de um texto (para limpar, use "voltar ao da IA")']);
    if (path === 'tipoConteudo.principal' && v == null) throw new ValidationError('ficha', ['escolha um tipo principal']);
    if (path.includes('.') && (!ov[top] || typeof ov[top] !== 'object')) {
      const efetivo = getAt(camposEfetivos(f), top);
      ov[top] = clone(efetivo && typeof efetivo === 'object' ? efetivo : MINIMO[top] ?? {});
    }
    if (path === 'tipoConteudo.secundarios' && !getAt(ov, 'tipoConteudo.principal')) throw new ValidationError('ficha', ['escolha o tipo principal antes dos secundários']);
    setAt(ov, path, v);
    editados[path] = nowIso();
  }
  ov.editados = editados;
  if (Object.keys(editados).length) ov.editadoEm = nowIso(); else { delete ov.editados; delete ov.editadoEm; }
  try { writeFicha(slug, comp, f); }
  catch (e) { throw new ValidationError(`fichas/${fichaFileName(key)}`, String((e as Error).message).split('\n').map((s) => s.replace(/^\s*-\s*/, '')).filter(Boolean)); }
  return view(slug, comp, f);
}

// ───────────────────────── resumo (selo e filtro) ─────────────────────────
export interface FichaResumo { analisada: boolean; geradoEm?: string; editados: number; naFila: boolean }

/** { concorrente: { chave: resumo } } — leitura leve (sem validar), para o selo nos cards e o filtro "Só analisados" */
export function resumoFichas(slug: string): Record<string, Record<string, FichaResumo>> {
  const out: Record<string, Record<string, FichaResumo>> = {};
  for (const c of listCompetitors(slug)) {
    const comp = c.data.id, dir = fichasDir(slug, comp);
    const fila = new Set(pedidoKeys(slug, comp));
    const m: Record<string, FichaResumo> = {};
    if (existsSync(dir)) for (const file of readdirSync(dir).filter((x) => x.endsWith('.json') && x !== 'pedido.json')) {
      try {
        const f = json(join(dir, file)) as Ficha;
        if (!f?.key) continue;
        m[f.key] = { analisada: !!f.analise, geradoEm: f.analise?.geradoEm, editados: Object.keys(f.override?.editados ?? {}).length, naFila: fila.has(f.key) };
      } catch { /* ficha quebrada: o validate acusa */ }
    }
    for (const k of fila) m[k] ??= { analisada: false, editados: 0, naFila: true };
    if (Object.keys(m).length) out[comp] = m;
  }
  return out;
}

// ───────────────────────── vocabulário para os selects ─────────────────────────
export interface OpcaoVocab { id: string; nome: string; definicao?: string }
export interface VocabView { versao: number; grupos: Record<string, OpcaoVocab[]>; recusados: Vocabulario['recusados'] }

/** grupos do vocabulário + formatos (library/formatos) + tema/ângulo/público do tags.yml, já com nome e definição */
export function vocabView(slug: string): VocabView {
  const v = loadVocab();
  const grupos: Record<string, OpcaoVocab[]> = Object.fromEntries(Object.entries(v.grupos).map(([g, l]) => [g, l.map((t) => ({ id: t.id, nome: t.nome, definicao: t.definicao }))]));
  const fd = join(ROOT, 'library', 'formatos');
  grupos.formato = existsSync(fd) ? readdirSync(fd).filter((x) => existsSync(join(fd, x, 'formato.json'))).map((id) => {
    try { const f = json(join(fd, id, 'formato.json')); return { id, nome: String(f.nome ?? id), definicao: f.essencia ? String(f.essencia) : undefined }; } catch { return { id, nome: id }; }
  }) : [];
  for (const g of ['tema', 'angulo', 'publico']) grupos[g] = [];
  const tf = join(ROOT, 'companies', slug, 'tags.yml');
  if (existsSync(tf)) for (const t of (YAML.parse(readFileSync(tf, 'utf8'))?.tags ?? []) as { id: string; label: string; grupo?: string; definicao?: string }[]) {
    if (t.grupo && grupos[t.grupo] && ['tema', 'angulo', 'publico'].includes(t.grupo)) grupos[t.grupo].push({ id: t.id, nome: t.label, definicao: t.definicao });
  }
  return { versao: v.versao, grupos, recusados: v.recusados };
}

// ───────────────────────── pedido de fila (o "Analisar este") ─────────────────────────
const pedidoFile = (slug: string, comp: string) => join(fichasDir(slug, comp), 'pedido.json');
function lerPedido(slug: string, comp: string): FichasPedido | null {
  const f = pedidoFile(slug, comp);
  if (!existsSync(f)) return null;
  const r = FichasPedido.safeParse(json(f));
  return r.success ? r.data : null;
}
function pedidoKeys(slug: string, comp: string): string[] { return lerPedido(slug, comp)?.itens ?? []; }

/** põe um item no pedido do concorrente (sem rodar nada: a fila roda sob comando, fase E) */
export function pedirAnalise(slug: string, comp: string, key: string) {
  okKey(key);
  const atual = lerPedido(slug, comp);
  if (atual?.status === 'rodando') throw new ValidationError('pedido.json', ['a fila deste concorrente está rodando agora; peça de novo quando terminar']);
  const p = FichasPedido.parse({
    ...(atual ?? { origem: 'selecao', relatorio: false }),
    itens: [...new Set([...(atual?.itens ?? []), key])],
    requestedAt: nowIso(), status: 'pendente',
  });
  mkdirSync(fichasDir(slug, comp), { recursive: true });
  writeFileSync(pedidoFile(slug, comp), `${JSON.stringify(p, null, 2)}\n`);
  return { naFila: true, itens: p.itens.length };
}

/** tira um item do pedido (vazio = apaga o pedido) */
export function cancelarPedido(slug: string, comp: string, key: string) {
  okKey(key);
  const atual = lerPedido(slug, comp);
  if (!atual) return { naFila: false, itens: 0 };
  if (atual.status === 'rodando') throw new ValidationError('pedido.json', ['a fila deste concorrente está rodando agora']);
  const itens = atual.itens.filter((k) => k !== key);
  if (!itens.length) unlinkSync(pedidoFile(slug, comp));
  else writeFileSync(pedidoFile(slug, comp), `${JSON.stringify({ ...atual, itens }, null, 2)}\n`);
  return { naFila: false, itens: itens.length };
}

/** arquivo de quadro em data/intel/<slug>/<comp>/<pasta da ficha>/ (fora do git), ou null */
export function quadroFile(slug: string, comp: string, dir: string, arquivo: string): string | null {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || !/^[a-z0-9][a-z0-9-]*$/.test(comp)) return null;
  if (!/^(instagram|tiktok|youtube|meta-ads)__[A-Za-z0-9_-]+$/.test(dir) || !/^quadros\/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$/.test(arquivo) || arquivo.includes('..')) return null;
  const f = join(ROOT, 'data', 'intel', slug, comp, dir, arquivo);
  return existsSync(f) ? f : null;
}
