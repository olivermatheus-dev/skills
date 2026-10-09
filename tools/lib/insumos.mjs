// Insumos de um projeto de vídeo (tarefa 045 E): aberturas, vozes, headlines, CTAs e copys do projeto.json, lidos, validados e
// gravados por aqui (script insumos.mjs, app e IA usam o mesmo código; a IA nunca edita o projeto.json à mão).
// Aberturas e vozes são eixos (precisam de render); headlines, CTAs e copys são opções de texto do anúncio (insumos.*).
// Contrato: .claude/skills/video/references/variantes.md > "Insumos (fase E)". Só JSON e texto, sem LLM.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fold, casar } from './texto-fala.mjs';

const ROOT = () => process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TIPOS = ['abertura', 'voz', 'headline', 'cta', 'copy'];
export const BOTOES = ['Saiba mais', 'Cadastre-se', 'Comece agora', 'Baixar', 'Fale conosco', 'Enviar mensagem', 'Assinar'];
const LISTA = { headline: 'headlines', cta: 'ctas', copy: 'copys' };
const PREFIXO = { headline: 'h', cta: 'cta', copy: 'copy' };
const CAMPOS = {
  abertura: ['fala', 'tela', 'cues', 'titulo', 'por_que', 'origem'],
  voz: ['voz', 'rate', 'por_que', 'origem'],
  headline: ['texto', 'por_que', 'origem'],
  cta: ['botao', 'fala', 'por_que', 'origem'],
  copy: ['texto_principal', 'titulo', 'descricao', 'por_que', 'origem'],
};
export class InsumoErro extends Error { constructor(erros) { super(erros.join('; ')); this.erros = erros; } }

const lerJson = (f, padrao) => { try { return JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return padrao; } };
const palavras = (s) => String(s).split(/\s+/).map((w) => ({ w, f: fold(w) })).filter((x) => x.f);
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const texto = (v) => (v == null ? '' : typeof v === 'object' ? String(v.say ?? v.text ?? '').trim() : String(v).trim());
const agora = () => new Date().toISOString().slice(0, 19) + 'Z';
const slugId = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** empresa pela pasta (companies/<slug>/...) ou por `empresa` explícita (testes em cópia) */
export function empresaDe(pasta, empresa) {
  if (empresa) return empresa;
  const partes = resolve(pasta).split(/[\\/]/);
  const i = partes.lastIndexOf('companies');
  return i >= 0 ? partes[i + 1] : null;
}

function carregar(pasta) {
  const f = join(resolve(pasta), 'projeto.json');
  if (!existsSync(f)) throw new InsumoErro([`sem projeto.json em ${pasta}`]);
  return { f, proj: JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, '')) };
}
/** JSON com 2 espaços, mas o que couber numa linha (≤ 180 colunas) fica numa linha, como o projeto.json escrito à mão */
const paresDe = (v) => (Array.isArray(v) ? v.map((x) => [null, x]) : Object.entries(v).filter(([, x]) => x !== undefined));
const chave = (k) => (k === null ? '' : `${JSON.stringify(k)}: `);
function inline(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  const itens = paresDe(v).map(([k, x]) => chave(k) + inline(x));
  if (Array.isArray(v)) return `[${itens.join(', ')}]`;
  return itens.length ? `{ ${itens.join(', ')} }` : '{}';
}
function compacto(v, ind, prefixo) {
  const linha = inline(v);
  if (v === null || typeof v !== 'object' || !paresDe(v).length || (ind && ind.length + prefixo + linha.length <= 180)) return linha;
  const ind2 = ind + '  ';
  const corpo = paresDe(v).map(([k, x]) => ind2 + chave(k) + compacto(x, ind2, chave(k).length)).join(',\n');
  return Array.isArray(v) ? `[\n${corpo}\n${ind}]` : `{\n${corpo}\n${ind}}`;
}
/** passa pelo JSON antes: undefined em array vira null, função/undefined em objeto some, toJSON vale (como o JSON.stringify) */
export const jsonCompacto = (v, ind = '', prefixo = 0) => compacto(JSON.parse(JSON.stringify(v) ?? 'null'), ind, prefixo);
const gravar = (f, proj) => writeFileSync(f, jsonCompacto(proj) + '\n');

// ---------- vozes de rascunho ----------
export function vozesDisponiveis() {
  const todas = lerJson(join(ROOT(), 'library', 'voices', 'voices.json'), []);
  return todas.filter((v) => /^(edge|win)-/.test(v.id) && (!v.stage || v.stage === 'draft'))
    .map((v) => ({ id: v.id, nome: nomeVoz(v), genero: v.gender }));
}
function nomeVoz(v) {
  const m = String(v.voice ?? v.id).replace(/^pt-BR-/, '').replace(/(Multilingual)?Neural$/, '');
  return m || v.id;
}

// ---------- proibições (BRAND.md/VOICE.md) ----------
const secao = (md, titulo) => {
  const l = md.replace(/\r\n/g, '\n').split('\n');
  const i = l.findIndex((x) => /^#{1,6}\s/.test(x) && norm(x).includes(norm(titulo)));
  if (i < 0) return '';
  const nivel = l[i].match(/^#+/)[0].length;
  let j = i + 1;
  while (j < l.length && !(/^(#{1,6})\s/.test(l[j]) && l[j].match(/^#+/)[0].length <= nivel)) j++;
  return l.slice(i + 1, j).join('\n').trim();
};
const lerEmpresa = (slug, rel) => {
  if (!slug) return '';
  try { return readFileSync(join(ROOT(), 'companies', slug, rel), 'utf8').replace(/^﻿/, ''); } catch { return ''; }
};
/** termos que a marca não diz: "Evitar" do VOICE, aspas da coluna "Não faz" e emojis proibidos */
export function termosProibidos(slug) {
  const voice = lerEmpresa(slug, 'context/VOICE.md');
  const termos = new Set();
  const evitar = voice.match(/\*\*Evitar:\*\*([^\n]*)/);
  if (evitar) for (const t of evitar[1].split(/[·,]/)) { const x = t.trim().replace(/[.]$/, ''); if (x) termos.add(x); }
  for (const l of secao(voice, 'Faz / não faz').split('\n')) {
    const col = l.split('|')[2];
    if (!col) continue;
    for (const m of col.matchAll(/"([^"]+)"/g)) if (!/^[A-ZÀ-Ý\s]+$/.test(m[1])) termos.add(m[1]);
    for (const m of col.matchAll(/\p{Extended_Pictographic}/gu)) termos.add(m[0]);
  }
  return [...termos];
}
const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** o termo aparece no texto (já sem acento/caixa)? Palavra longa casa pelo radical ("transforme" pega "transformar"); frase, com plural no fim */
function casaTermo(termo, n) {
  const k = norm(termo).trim();
  if (!k) return false;
  if (!/^[\p{L}\p{N}\s-]+$/u.test(k)) return n.includes(k); // emoji
  const ps = k.split(/\s+/);
  const ult = ps.at(-1);
  const corpo = ps.length === 1 && ult.length >= 6 ? `${escRe(ult.replace(/(es|os|as|e|a|o|s)$/, ''))}[a-z0-9]*` : [...ps.slice(0, -1).map(escRe), `${escRe(ult)}s?`].join('\\s+');
  return new RegExp(`(^|[^a-z0-9])${corpo}($|[^a-z0-9])`).test(n);
}
function proibidos(slug, textos) {
  const termos = termosProibidos(slug);
  const achados = [];
  for (const t of textos) {
    const n = norm(t);
    for (const termo of termos) if (!achados.includes(termo) && casaTermo(termo, n)) achados.push(termo);
  }
  return achados;
}
const CURA = /(^|[^a-z])(cura|curar|cure|curo|curamos|curativ[oa]s?)($|[^a-z])/;
const SENSIVEL = [['tratamento', /tratament/], ['resultado garantido', /resultado\s+garantid/], ['garantia', /garantia|garantimos|garantid[oa]/], ['depoimento', /depoiment/], ['antes e depois', /antes\s+e\s+depois/], ['Setembro Amarelo', /setembro\s+amarelo/]];

// ---------- molde da abertura ----------
export function moldeDe(proj) {
  const m = (proj.eixos?.abertura ?? [])[0];
  if (!m) return null;
  const cues = Object.entries(m.cues ?? {}).filter(([, v]) => typeof v === 'string').map(([k]) => k);
  const fala = Object.keys(m.falas ?? {})[0] ?? 'f1';
  return { cena: m.cena ?? 's1', fala, cues, base: m };
}
const valorCue = (v, fala) => (typeof v === 'string' ? v.replace(new RegExp(`^${fala}:`), '') : null);

// ---------- validação: { erros, avisos } ----------
function validarTexto(slug, tipo, o, erros, avisos) {
  const textos = Object.entries(o).filter(([k, v]) => typeof v === 'string' && !['id', 'origem', 'criado', 'por_que', 'botao', 'voz', 'rate'].includes(k)).map(([, v]) => v);
  const ach = proibidos(slug, textos);
  if (ach.length) erros.push(`termo que a marca não usa: ${ach.map((a) => `"${a}"`).join(', ')} (VOICE.md)`);
  const n = textos.map(norm).join(' | ');
  if (CURA.test(n)) erros.push('promessa de cura ou de resultado terapêutico ("cura", "curar"): fere o CFP/CRP e a política do Meta');
  const sens = SENSIVEL.filter(([, re]) => re.test(n)).map(([nome]) => `"${nome}"`);
  if (sens.length) avisos.push(`tema sensível (CFP/CRP, política do Meta, BUSINESS.md): ${sens.join(', ')}; confira antes de usar`);
  if (textos.some((t) => /(^|[^\p{L}])[A-ZÀ-Ý]{4,}($|[^\p{L}])/u.test(t.replace(/\*/g, '')))) avisos.push('tem palavra em CAIXA ALTA (a voz da marca evita)');
}

function validarAbertura(slug, o, molde, erros, avisos) {
  if (!molde) { erros.push('o projeto não tem abertura de molde (eixos.abertura vazio)'); return; }
  const fala = texto(Object.values(o.falas ?? {})[0]);
  const tela = texto(o.on_screen);
  if (!fala) erros.push('falta a fala');
  if (!tela) erros.push('falta o texto da tela');
  const ws = palavras(fala);
  if (fala && tela) { // mesma regra do QC (texto-fala): cada palavra da tela, na ordem, é dita na fala
    const soltas = casar(tela, ws.map((x) => ({ w: x.w, s: 0 }))).filter((x) => x.t == null).map((x) => x.w);
    if (soltas.length) erros.push(`a tela tem palavra que a fala não diz (ou fora da ordem): ${soltas.join(', ')}`);
  }
  const fk = Object.keys(o.falas ?? {})[0] ?? molde.fala;
  for (const c of molde.cues) {
    const v = o.cues?.[c];
    if (typeof v !== 'string' || !v) { erros.push(`falta a palavra do cue "${c}" (o molde usa: ${molde.cues.join(', ')})`); continue; }
    const w = valorCue(v, fk);
    if (w.includes(':')) { erros.push(`cue "${c}": use só a palavra (a fala é ${fk})`); continue; }
    if (/^\d+$/.test(w)) { erros.push(`cue "${c}": escolha uma palavra da fala, não um número`); continue; }
    if (!ws.some((x) => x.f === fold(w))) erros.push(`cue "${c}": a palavra "${w}" não está na fala`);
  }
  for (const c of Object.keys(o.cues ?? {})) if (!molde.cues.includes(c) && typeof o.cues[c] === 'string') erros.push(`cue "${c}" não existe no molde (${molde.cues.join(', ')})`);
  const gancho = tela.split('|')[0].replace(/\*/g, '');
  if (palavras(gancho).length > 9) avisos.push(`gancho longo: a 1ª frase da tela tem ${palavras(gancho).length} palavras (até ~9 para caber em 3 s)`);
  if (ws.length > 16) avisos.push(`fala de abertura longa: ${ws.length} palavras (até ~16 para fechar em ~5 s)`);
  validarTexto(slug, 'abertura', { fala, tela }, erros, avisos);
}

function validarVoz(o, erros, avisos) {
  const v = texto(o.voz);
  if (!v) { erros.push('falta a voz'); return; }
  if (!/^(edge|win)-/.test(v)) erros.push(`só voz de rascunho (edge-* ou win-*); "${v}" é voz final: peça a voz final pela skill elevenlabs`);
  else if (!vozesDisponiveis().some((x) => x.id === v)) erros.push(`voz "${v}" não existe em library/voices/voices.json`);
  if (o.rate != null && o.rate !== '' && !/^[+-]\d{1,2}%$/.test(String(o.rate))) erros.push('rate deve ser como "-8%" ou "+5%"');
}

function validarOpcaoTexto(slug, tipo, o, erros, avisos) {
  if (tipo === 'headline') {
    if (!texto(o.texto)) erros.push('falta o texto da headline');
    else if (texto(o.texto).length > 40) avisos.push(`headline com ${texto(o.texto).length} caracteres (limite ~40)`);
  } else if (tipo === 'cta') {
    if (!BOTOES.includes(o.botao)) erros.push(`botão inválido (use um dos CTAs da Meta: ${BOTOES.join(', ')})`);
  } else if (tipo === 'copy') {
    if (!texto(o.texto_principal)) erros.push('falta o texto principal');
    else if (texto(o.texto_principal).length > 125) avisos.push(`texto principal com ${texto(o.texto_principal).length} caracteres (a Meta corta em ~125 com "ver mais")`);
    if (!texto(o.titulo)) erros.push('falta o título');
    else if (texto(o.titulo).length > 40) avisos.push(`título com ${texto(o.titulo).length} caracteres (limite ~40)`);
  }
  validarTexto(slug, tipo, o, erros, avisos);
}

function validar(slug, tipo, o, proj) {
  const erros = [], avisos = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.id ?? '')) erros.push(`id inválido "${o.id}" (use a-z, 0-9 e hífen)`);
  if (tipo === 'abertura') validarAbertura(slug, o, moldeDe(proj), erros, avisos);
  else if (tipo === 'voz') validarVoz(o, erros, avisos);
  else validarOpcaoTexto(slug, tipo, o, erros, avisos);
  return { erros, avisos };
}

// ---------- leitura normalizada (headlines etc. podem ser strings no rascunho antigo) ----------
function listaTexto(proj, tipo) {
  const arr = proj.insumos?.[LISTA[tipo]] ?? [];
  return arr.map((x, i) => {
    if (typeof x === 'string') return { id: `${PREFIXO[tipo]}${i + 1}`, ...({ headline: { texto: x }, cta: { botao: x }, copy: { texto_principal: x } })[tipo] };
    return x;
  });
}
function opcoes(proj, tipo) {
  if (tipo === 'abertura') return proj.eixos?.abertura ?? [];
  if (tipo === 'voz') return proj.eixos?.voz ?? [];
  return listaTexto(proj, tipo);
}
function usos(pasta, tipo, id) {
  if (tipo !== 'abertura' && tipo !== 'voz') return 0;
  const ind = lerJson(join(resolve(pasta), 'variantes', 'indice.json'), {});
  return (ind.variantes ?? []).filter((v) => v.escolhas?.[tipo === 'abertura' ? 'abertura' : 'voz'] === id && !v.erro).length;
}

// ---------- view (contrato do app) ----------
export function view(pasta, opts = {}) {
  const { proj } = carregar(pasta);
  const slug = empresaDe(pasta, opts.empresa);
  const molde = moldeDe(proj);
  const avisos = {};
  const guardar = (tipo, o) => {
    const { erros, avisos: av } = validar(slug, tipo, o, proj);
    if (erros.length || av.length) avisos[`${tipo}:${o.id}`] = [...erros, ...av];
  };
  const comum = (tipo, o) => ({ origem: o.origem, por_que: o.por_que, criado: o.criado, usada: usos(pasta, tipo, o.id) > 0 });
  const disp = vozesDisponiveis();
  const aberturas = opcoes(proj, 'abertura').map((o) => {
    guardar('abertura', o);
    const fk = Object.keys(o.falas ?? {})[0] ?? 'f1';
    const cues = {};
    for (const [k, v] of Object.entries(o.cues ?? {})) cues[k] = valorCue(v, fk) ?? `@${v.at ?? v.before_end ?? v.offset ?? ''}`;
    const fala = Object.values(o.falas ?? {})[0];
    return { id: o.id, titulo: o.titulo, fala: typeof fala === 'string' ? fala : fala?.say ?? fala?.text ?? '', tela: o.on_screen ?? '', cues, ...comum('abertura', o) };
  });
  const vozes = opcoes(proj, 'voz').map((o) => {
    guardar('voz', o);
    const d = disp.find((x) => x.id === o.voz);
    return { id: o.id, voz: o.voz, nome: d?.nome ?? o.voz, genero: d?.genero, rate: o.rate ?? Object.values(o.falas ?? {}).map((x) => x?.rate).find(Boolean), ...comum('voz', o) };
  });
  const out = { aberturas, vozes };
  for (const tipo of ['headline', 'cta', 'copy']) {
    out[LISTA[tipo]] = listaTexto(proj, tipo).map((o) => { guardar(tipo, o); return { ...o, ...comum(tipo, o) }; });
  }
  return { ...out, molde: molde ? { cena: molde.cena, cues: molde.cues } : null, vozesDisponiveis: disp, avisos };
}

// ---------- gravação ----------
const S = (v) => (v == null ? '' : String(v).trim());
function montarAbertura(d, proj, base = null) {
  const molde = moldeDe(proj);
  if (!molde) throw new InsumoErro(['o projeto não tem abertura de molde (eixos.abertura vazio)']);
  const m = base ?? molde.base;
  const fk = base ? Object.keys(base.falas ?? {})[0] ?? molde.fala : molde.fala;
  const cuesIn = d.cues ?? {};
  const pal = (x) => S(x).replace(/^f\d+:/, '');
  const cues = {};
  for (const [k, v] of Object.entries(m.cues ?? {})) { // mesmas chaves do molde; objetos (at/offset) ficam como estão
    cues[k] = typeof v === 'string' ? (S(cuesIn[k]) ? `${fk}:${pal(cuesIn[k])}` : '') : v;
  }
  for (const k of Object.keys(cuesIn)) if (!(k in cues)) cues[k] = `${fk}:${pal(cuesIn[k])}`;
  const { id, titulo, falas, on_screen, cues: _c, origem, criado, por_que, nota, ...resto } = m; // cena, use, params… vêm do molde
  return { id: d.id, ...(S(d.titulo) ? { titulo: S(d.titulo) } : {}), ...resto, falas: { [fk]: S(d.fala) }, on_screen: S(d.tela), cues };
}

function carimbo(o, d) {
  if (S(d.por_que)) o.por_que = S(d.por_que);
  o.origem = d.origem === 'ia' ? 'ia' : 'oliver';
  o.criado = agora();
  return o;
}
function idLivre(proj, tipo, pedido, sugestao) {
  const usados = new Set(opcoes(proj, tipo).map((o) => o.id));
  if (pedido) return pedido;
  let base = slugId(sugestao) || PREFIXO[tipo] || tipo;
  if (tipo === 'headline' || tipo === 'cta' || tipo === 'copy') {
    let n = usados.size + 1;
    while (usados.has(`${PREFIXO[tipo]}${n}`)) n++;
    return `${PREFIXO[tipo]}${n}`;
  }
  base = base.split('-').slice(0, 4).join('-');
  let id = base, n = 2;
  while (usados.has(id)) id = `${base}-${n++}`;
  return id;
}
function sugestaoDe(tipo, d) {
  if (tipo === 'abertura') return S(d.fala);
  if (tipo === 'voz') return S(d.voz).replace(/^(edge|win)-/, '');
  return '';
}
function fixar(proj, tipo, lista) {
  if (tipo === 'abertura' || tipo === 'voz') { proj.eixos = proj.eixos ?? {}; proj.eixos[tipo] = lista; }
  else { proj.insumos = proj.insumos ?? {}; proj.insumos[LISTA[tipo]] = lista; }
}
/** copia os campos do tipo; no editar, '' apaga a chave opcional (a obrigatória apagada vira erro de validação) */
function aplicarCampos(tipo, atual, d, editar = false) {
  const o = { ...atual };
  for (const [k, v0] of Object.entries(d ?? {})) {
    if (v0 === undefined || !CAMPOS[tipo].includes(k) || k === 'origem') continue;
    if (tipo === 'abertura' && ['fala', 'tela', 'cues'].includes(k)) continue; // tratados em montarAbertura
    const v = S(v0);
    if (v === '') { if (editar) delete o[k]; continue; }
    o[k] = v;
  }
  return o;
}
/** o ritmo da voz vale na opção e em cada fala que já tem rate próprio */
function ritmo(o, rate) {
  const v = S(rate);
  if (v) o.rate = v; else delete o.rate;
  for (const f of Object.values(o.falas ?? {})) if (f && typeof f === 'object' && 'rate' in f) { if (v) f.rate = v; else delete f.rate; }
}

/**
 * add | editar | rm. Devolve { id, avisos } (avisos gravam; erro lança InsumoErro e não grava).
 * `dados`: abertura { fala, tela, cues:{chave:palavra}, titulo } · voz { voz, rate } · headline { texto } · cta { botao, fala } ·
 * copy { texto_principal, titulo, descricao } · todos aceitam por_que e origem ("ia" | "oliver"). No editar, '' apaga o campo opcional.
 * `forcar`: confirma o que muda variante já gerada (editar/rm de opção em uso, rodada que esvazia, 1ª voz do projeto).
 * Com HUB_PEDIDO_IA=1 (pedido de IA do app) só vale add: editar/rm só do que a própria IA criou, voz nunca, forcar ignorado.
 */
export function aplicar(pasta, { acao, tipo, id, dados = {}, forcar = false, empresa } = {}) {
  if (!['add', 'editar', 'rm'].includes(acao)) throw new InsumoErro([`ação inválida "${acao}" (add, editar, rm)`]);
  if (!TIPOS.includes(tipo)) throw new InsumoErro([`tipo inválido "${tipo}" (${TIPOS.join(', ')})`]);
  const doPedido = process.env.HUB_PEDIDO_IA === '1';
  if (doPedido) forcar = false;
  const { f, proj } = carregar(pasta);
  const slug = empresaDe(pasta, empresa);
  const lista = opcoes(proj, tipo).map((o) => ({ ...o }));
  const i = lista.findIndex((o) => o.id === id);
  const eixo = tipo === 'abertura' || tipo === 'voz';
  if (doPedido && acao !== 'add' && i >= 0 && lista[i].origem !== 'ia') throw new InsumoErro([`pedido de IA só mexe no que a própria IA criou: ${tipo} "${id}" é do Oliver`]);
  if (doPedido && acao === 'add' && tipo === 'voz') throw new InsumoErro(['a IA não escolhe voz: o Oliver escolhe na aba Variantes']);

  if (acao === 'rm') {
    if (i < 0) throw new InsumoErro([`${tipo} "${id}" não existe`]);
    const n = usos(pasta, tipo, id);
    if (n && !forcar) throw new InsumoErro([`${tipo} "${id}" está em uso em ${n} variante(s) já gerada(s); apague com forcar se tiver certeza`]);
    if (eixo && lista.length === 1) throw new InsumoErro([`não dá para apagar a única ${tipo} do projeto`]);
    const resto = lista.filter((o) => o.id !== id);
    const impactos = [];
    for (const [rid, r] of Object.entries(proj.rodadas ?? {})) {
      if (!eixo) break;
      if (Array.isArray(r)) { const k = r.filter((c) => c?.[tipo] === id).length; if (k) impactos.push(`a rodada ${rid} (lista) tem ${k} combinação(ões) com ${tipo} "${id}"; elas saem da rodada`); }
      else if (Array.isArray(r?.[tipo]) && r[tipo].includes(id) && r[tipo].every((x) => x === id)) impactos.push(`a rodada ${rid} usa só ${tipo} "${id}"; sem ela, a rodada assume a 1ª opção ("${resto[0].id}")`);
    }
    if (impactos.length && !forcar) throw new InsumoErro([...impactos, 'apague com forcar para aceitar']);
    const avisos = impactos.map((x) => x);
    if (eixo && i === 0) avisos.push(tipo === 'abertura'
      ? `era a abertura de molde: o molde passa a ser "${resto[0].id}" (cena ${resto[0].cena ?? 's1'}, cues ${Object.keys(resto[0].cues ?? {}).join(', ') || 'nenhum'}); confira se as aberturas novas ainda servem`
      : `era a voz que vale quando a rodada não escolhe voz: passa a ser "${resto[0].id}"`);
    fixar(proj, tipo, resto);
    for (const [rid, r] of Object.entries(proj.rodadas ?? {})) { // a rodada não pode citar o que saiu
      if (!eixo) break;
      if (Array.isArray(r)) proj.rodadas[rid] = r.filter((c) => c?.[tipo] !== id);
      else if (Array.isArray(r?.[tipo])) { r[tipo] = r[tipo].filter((x) => x !== id); if (!r[tipo].length) delete r[tipo]; }
    }
    gravar(f, proj);
    return { id, avisos };
  }

  let o;
  if (acao === 'add') {
    const novoId = idLivre(proj, tipo, id, sugestaoDe(tipo, dados));
    if (lista.some((x) => x.id === novoId)) throw new InsumoErro([`já existe ${tipo} com o id "${novoId}"`]);
    if (tipo === 'voz' && !lista.length && !forcar) throw new InsumoErro(['o projeto não tem eixo de voz: criar a 1ª voz muda o id de todas as variantes (passam a ter "__voz-…") e as já geradas ficam órfãs; confirme com forcar']);
    if (tipo === 'abertura') o = montarAbertura({ ...dados, id: novoId }, proj);
    else o = aplicarCampos(tipo, { id: novoId }, dados);
    carimbo(o, dados);
  } else {
    if (i < 0) throw new InsumoErro([`${tipo} "${id}" não existe`]);
    const atual = lista[i];
    const so = Object.keys(dados).filter((k) => dados[k] !== undefined);
    const n = usos(pasta, tipo, id);
    if (eixo && n && !forcar && so.some((k) => !['por_que', 'titulo'].includes(k))) throw new InsumoErro([`${tipo} "${id}" já gerou ${n} variante(s); o vídeo e o aval ficam com o texto antigo. Edite com forcar se for isso mesmo`]);
    if (tipo === 'abertura') {
      const fk = Object.keys(atual.falas ?? {})[0] ?? 'f1';
      const atualCues = Object.fromEntries(Object.entries(atual.cues ?? {}).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, valorCue(v, fk)]));
      const d = dados;
      o = montarAbertura({
        id, titulo: d.titulo !== undefined ? d.titulo : atual.titulo, fala: d.fala !== undefined ? d.fala : texto(Object.values(atual.falas ?? {})[0]),
        tela: d.tela !== undefined ? d.tela : atual.on_screen, cues: { ...atualCues, ...(d.cues ?? {}) },
      }, proj, atual);
      for (const k of ['origem', 'criado', 'por_que']) if (atual[k] !== undefined) o[k] = atual[k];
      if (d.por_que !== undefined) { if (S(d.por_que)) o.por_que = S(d.por_que); else delete o.por_que; }
      for (const k of Object.keys(atual)) if (!(k in o) && k !== 'titulo') o[k] = atual[k]; // chaves do molde que a montagem não conhece
    } else {
      o = aplicarCampos(tipo, atual, dados, true);
      if (tipo === 'voz' && dados.rate !== undefined) ritmo(o, dados.rate);
    }
  }

  const { erros, avisos } = validar(slug, tipo, o, proj);
  if (erros.length) throw new InsumoErro(erros);
  if (acao === 'add') lista.push(o); else lista[i] = o;
  fixar(proj, tipo, lista);
  gravar(f, proj);
  return { id: o.id, avisos };
}

// ---------- contexto curto para a IA (≈ 2,5 mil tokens) ----------
const corta = (s, n) => { const t = String(s).replace(/\n{2,}/g, '\n').trim(); return t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')} […]` : t; };
const bullets = (s) => String(s).split('\n').map((l) => l.trim()).filter((l) => l && !/^\|?[\s:|-]+\|?$/.test(l)).join('\n');

export function contexto(pasta, opts = {}) {
  const { proj } = carregar(pasta);
  const slug = empresaDe(pasta, opts.empresa);
  const molde = moldeDe(proj);
  const v = view(pasta, opts);
  const out = [];
  out.push(`# Projeto ${proj.nome ?? ''} · tipo ${proj.tipo ?? '?'}\nObjetivo: ${proj.objetivo ?? '(não informado)'}`);

  const tl = lerJson(join(resolve(pasta), proj.base ?? 'timeline.json'), {});
  const cena = (tl.scenes ?? []).find((s) => s.id === molde?.cena);
  out.push([
    '## Molde da abertura (todas as aberturas novas copiam a cena, só trocam texto)',
    molde ? `Cena ${molde.cena}${cena?.use ? ` · bloco ${cena.use}` : ''}${cena?.note ? ` · ${corta(cena.note, 160)}` : ''}. Cues a preencher (palavra dita na fala): ${molde.cues.join(', ') || '(nenhum)'}.` : 'Sem abertura de molde (não dá para gerar aberturas).',
    'Regras: fala curta (até ~16 palavras, fecha em ~5 s); a 1ª frase da tela tem até ~9 palavras (aparece em 3 s). Tela: `*destaque*` marca a palavra de força e `|` troca de linha; toda palavra da tela tem de estar na fala. Cada cue = UMA palavra que a fala diz (a tela troca/anima nela). Trate por "você", chame de terapeuta/paciente.',
  ].join('\n'));

  const lin = (arr, f) => (arr.length ? arr.map(f).join('\n') : '(nenhuma)');
  out.push([
    '## O que já existe (não repita ângulo)',
    'Aberturas:\n' + lin(v.aberturas, (a) => `- ${a.id}${a.titulo ? ` (${corta(a.titulo, 60)})` : ''}: "${a.fala}" | tela "${a.tela}"`),
    'Headlines: ' + (v.headlines.length ? v.headlines.map((h) => `"${h.texto}"`).join(' · ') : '(nenhuma)'),
    'CTAs: ' + (v.ctas.length ? v.ctas.map((c) => c.botao + (c.fala ? ` ("${c.fala}")` : '')).join(' · ') : '(nenhum)'),
    'Copys:\n' + lin(v.copys, (c) => `- ${c.id}: "${corta(c.texto_principal, 110)}" / título "${c.titulo}"`),
  ].join('\n'));

  const md = (rel) => lerEmpresa(slug, rel);
  const copy = md('context/COPY.md'), aud = md('context/AUDIENCE.md'), voice = md('context/VOICE.md'), brand = md('brand/BRAND.md');
  const blocos = [];
  const pega = (txt, titulo, max) => { const s = secao(txt, titulo); return s ? `### ${titulo}\n${corta(bullets(s), max)}` : ''; };
  blocos.push(pega(copy, 'Big Idea', 700), pega(copy, 'Mecanismo da falha', 800), pega(copy, 'CTAs por estágio', 700), pega(copy, 'Objeções', 700));
  blocos.push(pega(aud, 'Dores', 800), pega(aud, 'Linguagem literal', 800));
  const evitar = voice.match(/\*\*Evitar:\*\*([^\n]*)/);
  if (evitar) blocos.push(`### Voz: evitar\n${corta(evitar[1], 400)}`);
  out.push('## Contexto da empresa (trechos)\n' + blocos.filter(Boolean).join('\n'));

  const log = slug ? join(ROOT(), 'companies', slug, 'campaigns', 'LOG_ANGULOS.md') : null;
  if (log && existsSync(log)) {
    const l = readFileSync(log, 'utf8').split('\n').filter((x) => x.trim()).slice(-14).join('\n');
    out.push(`## Ângulos já usados (LOG_ANGULOS, fim do arquivo; "aposentado" não repete)\n${corta(l, 900)}`);
  }

  if (slug) {
    const base = join(ROOT(), 'companies', slug, 'competitors');
    const rels = [];
    if (existsSync(base)) for (const c of readdirSync(base)) {
      const d = join(base, c, 'relatorios');
      if (!existsSync(d)) continue;
      const mais = readdirSync(d).filter((n) => /anuncios.*\.md$/.test(n)).sort().at(-1);
      if (mais) rels.push({ c, f: join(d, mais), n: mais });
    }
    rels.sort((a, b) => b.n.localeCompare(a.n));
    const ps = [];
    for (const r of rels.slice(0, 3)) {
      const t = readFileSync(r.f, 'utf8');
      const partes = ['Em 5 linhas', 'O que copiar', 'O que evitar'].map((s) => secao(t, s)).filter(Boolean).map((s) => bullets(s)).join('\n');
      if (partes) ps.push(`### ${r.c} (${r.n.slice(0, 10)})\n${corta(partes, 1100)}`);
    }
    if (ps.length) out.push('## Anúncios dos concorrentes (conclusões; copie o mecanismo, não a frase)\n' + ps.join('\n'));

    const br = lerJson(join(ROOT(), 'companies', slug, 'intel', 'brechas.json'), null);
    if (br?.themes?.length) {
      const top = [...br.themes].sort((a, b) => (b.sources?.length ?? 0) - (a.sources?.length ?? 0)).slice(0, 5);
      out.push('## Brechas do mercado (o que os concorrentes deixam aberto)\n' + top.map((t) => `- ${t.title}: ${corta(t.action, 170)}`).join('\n'));
    }
  }

  const prib = secao(brand, 'Proibições');
  const termos = termosProibidos(slug);
  out.push('## Proibições (respeite; o script só checa os termos)\n' + [prib ? bullets(prib) : '', termos.length ? `Termos que o script recusa: ${termos.join(', ')}.` : ''].filter(Boolean).join('\n') +
    '\nNada de resultado terapêutico prometido nem fala/caso de paciente (CFP/CRP); sem número, prova ou depoimento que não esteja no contexto.');
  return out.join('\n\n') + '\n';
}
