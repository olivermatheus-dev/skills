// Ficha de agente e de skill (tarefa 048): o molde em campos que o app mostra como formulário e que o Claude Code
// continua lendo como markdown. Molde e regras: .claude/skills/orquestrar/references/ficha.md.
// · Frontmatter: os campos do Claude Code (name, description, model, color, skills, tools). Só os alterados são reescritos.
// · Corpo: "# Título" + abertura + seções "## " com títulos fixos (CAMPOS). Seções fora do molde ficam intactas, na ordem.
// · ## Contexto = lista de refs (mesmo formato do `context:` das tarefas, 021):
//     - `context/COPY.md#Objeções` · sempre — para quê
//     - `knowledge/video/REGRAS.md` · quando: vídeo — para quê
//     - `context/AUDIENCE.md#Linguagem literal` · sempre · só: roteirista, designer — para quê   (skill usada por vários agentes)
//   Ref relativa à empresa (context/, brand/…: vale para toda empresa, o <slug> é o da tarefa) ou à raiz do repo.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { sections, norm } from './contexto.mjs';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const AGENTS = join(ROOT, '.claude', 'agents');
const SKILLS = join(ROOT, '.claude', 'skills');

/** seções fixas do molde, na ordem canônica */
export const CAMPOS = [
  { key: 'especialista', titulo: 'Especialista', obrigatorio: true, dica: 'Quem é, nível, repertório, o que considera bom e o que NÃO faz. É o que faz o modelo se portar como especialista.' },
  { key: 'contexto', titulo: 'Contexto', obrigatorio: true, dica: 'Os arquivos e seções exatos que precisa ler. Nada de procurar.' },
  { key: 'entradas', titulo: 'Entradas e saídas', obrigatorio: true, dica: 'O que recebe, o que entrega e onde salva.' },
  { key: 'ordem', titulo: 'Ordem de trabalho', obrigatorio: true, dica: 'Os passos, na ordem.' },
  { key: 'regras', titulo: 'Regras duras', obrigatorio: false, dica: 'O que nunca pode acontecer.' },
  { key: 'checklist', titulo: 'Checklist antes de entregar', obrigatorio: true, dica: 'Perguntas de sim/não que a entrega precisa passar.' },
];
const POR_TITULO = new Map(CAMPOS.map((c) => [norm(c.titulo), c.key]));

const okId = (s) => /^[a-z0-9][a-z0-9-]*$/.test(s);
export const arquivoDe = (tipo, id) => (tipo === 'agente' ? join(AGENTS, `${id}.md`) : join(SKILLS, id, 'SKILL.md'));
export const relDe = (tipo, id) => (tipo === 'agente' ? `.claude/agents/${id}.md` : `.claude/skills/${id}/SKILL.md`);

// ── frontmatter ──────────────────────────────────────────────────────────────
const FM = /^---\n([\s\S]*?)\n---\n?/;
/** linhas do frontmatter agrupadas por chave (continuações indentadas ficam com a chave) */
function fmBlocos(raw) {
  const out = [];
  for (const l of raw.split('\n')) {
    const m = l.match(/^([\w-]+):/);
    if (m || !out.length) out.push({ key: m ? m[1] : null, linhas: [l] });
    else out[out.length - 1].linhas.push(l);
  }
  return out;
}
const precisaAspas = (s) => /: |\s#|^[\s"'[{>|*&!%@`-]|^$/.test(s) || /[\n]/.test(s);
function fmValor(v) {
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  const s = String(v).replace(/\s*\n\s*/g, ' ').trim();
  return precisaAspas(s) ? JSON.stringify(s) : s;
}

// ── contexto ─────────────────────────────────────────────────────────────────
const ITEM = /^\s*[-*]\s+`([^`]+)`\s*(.*)$/;
/** "- `ref` · sempre · só: a, b — motivo" → { ref, quando, agentes, motivo } */
export function parseItem(linha) {
  const m = linha.match(ITEM);
  if (!m) return null;
  let resto = m[2].trim();
  let motivo = '';
  const tr = resto.search(/\s[—–]\s|^[—–]\s/);
  if (tr >= 0) { motivo = resto.slice(tr).replace(/^\s*[—–]\s*/, '').trim(); resto = resto.slice(0, tr); }
  let quando = 'sempre';
  let agentes = [];
  for (const p0 of resto.split('·').map((x) => x.trim()).filter(Boolean)) {
    const p = p0.replace(/^\(|\)$/g, '');
    if (/^s[oó]\s*:/i.test(p)) agentes = p.replace(/^s[oó]\s*:\s*/i, '').split(',').map((x) => x.trim()).filter(Boolean);
    else if (/^quando\b/i.test(p)) quando = p.replace(/^quando\s*:?\s*/i, '').trim() || 'sempre';
    else if (/^sempre$/i.test(p)) quando = 'sempre';
    else motivo = motivo ? `${p}; ${motivo}` : p;
  }
  return { ref: m[1].trim(), quando, agentes, motivo };
}
export function itemTexto(i) {
  const q = String(i.quando ?? '').trim();
  const partes = [`- \`${i.ref.trim()}\``, q === 'sempre' ? 'sempre' : `quando: ${q || 'a definir'}`];
  if (i.agentes?.length) partes.push(`só: ${i.agentes.join(', ')}`);
  return partes.join(' · ') + (i.motivo?.trim() ? ` — ${i.motivo.trim()}` : '');
}
export function parseContexto(body) {
  const itens = [];
  const nota = [];
  for (const l of String(body ?? '').split('\n')) {
    const it = parseItem(l);
    if (it) itens.push(it); else nota.push(l);
  }
  return { nota: nota.join('\n').trim(), itens };
}
export const contextoTexto = (c) => [c.nota?.trim(), c.itens.map(itemTexto).join('\n')].filter(Boolean).join('\n\n');

// ── ficha ⇄ markdown ─────────────────────────────────────────────────────────
/** markdown → ficha. Guarda os blocos na ordem original para gravar de volta sem perder nada. */
export function parseFicha(texto) {
  const txt = String(texto).replace(/\r\n/g, '\n');
  const m = txt.match(FM);
  const fmRaw = m ? m[1] : '';
  let fm = {};
  try { fm = (YAML.parse(fmRaw) ?? {}); } catch { fm = {}; }
  const body = m ? txt.slice(m[0].length) : txt;
  const { lines, sections: secs } = sections(body);
  const h2 = secs.filter((s) => s.level === 2);
  const h1 = secs.find((s) => s.level === 1 && (!h2.length || s.start < h2[0].start));
  const iniAbertura = h1 ? h1.start + 1 : 0;
  const fimAbertura = h2.length ? h2[0].start : lines.length;
  const blocos = h2.map((s, k) => {
    const fim = h2[k + 1] ? h2[k + 1].start : lines.length;
    return { titulo: s.title, key: POR_TITULO.get(norm(s.title)) ?? null, corpo: lines.slice(s.start + 1, fim).join('\n').trim(), raw: lines.slice(s.start, fim).join('\n').trimEnd() };
  });
  const campos = Object.fromEntries(CAMPOS.map((c) => [c.key, blocos.find((b) => b.key === c.key)?.corpo ?? '']));
  return {
    fm, fmRaw,
    titulo: h1 ? h1.title : '',
    preTitulo: body.split('\n').slice(0, h1 ? h1.start : 0).join('\n').trim(),
    abertura: lines.slice(iniAbertura, fimAbertura).join('\n').trim(),
    campos,
    contexto: parseContexto(campos.contexto),
    outras: blocos.filter((b) => !b.key).map((b) => ({ titulo: b.titulo, corpo: b.corpo, raw: b.raw })),
    blocos,
    noMolde: blocos.some((b) => b.key === 'especialista'),
  };
}

/**
 * ficha (do formulário) → markdown. `base` = texto atual do arquivo: mantém chaves de frontmatter não tocadas,
 * a ordem das seções e o que está fora do molde. Campos do molde vazios não viram título vazio.
 * edit = { fm?: {chave: valor|null}, titulo?, abertura?, campos?: {key: texto}, contexto?: {nota, itens}, outras?: [{titulo, corpo}] }
 */
export function gravarFicha(base, edit) {
  const atual = parseFicha(base);
  // frontmatter
  const blocos = fmBlocos(atual.fmRaw);
  for (const [k, v] of Object.entries(edit.fm ?? {})) {
    const vazio = v == null || (Array.isArray(v) ? !v.length && k !== 'skills' : String(v).trim() === '');
    const i = blocos.findIndex((b) => b.key === k);
    if (vazio) { if (i >= 0) blocos.splice(i, 1); continue; }
    const linha = { key: k, linhas: [`${k}: ${fmValor(v)}`] };
    if (i >= 0) {
      // não reescreve se o valor é o mesmo (preserva aspas e formatação originais)
      const igual = JSON.stringify(atual.fm[k]) === JSON.stringify(Array.isArray(v) ? v : String(v).trim());
      if (!igual) blocos[i] = linha;
    } else blocos.push(linha);
  }
  const fmTxt = blocos.flatMap((b) => b.linhas).join('\n').trim();

  // corpo
  const campos = { ...atual.campos, ...(edit.campos ?? {}) };
  if (edit.contexto) campos.contexto = contextoTexto(edit.contexto);
  const outras = edit.outras ?? atual.outras;
  const ordem = []; // [{titulo, corpo}]
  const temCampo = (key) => String(campos[key] ?? '').trim() !== '';
  const usados = new Set();
  let outrasI = 0;
  for (const b of atual.blocos) {
    if (b.key) {
      if (usados.has(b.key)) continue;
      // antes deste campo, os campos canônicos anteriores que ainda não existem no arquivo
      for (const c of CAMPOS.slice(0, CAMPOS.findIndex((x) => x.key === b.key))) {
        if (!usados.has(c.key) && !atual.blocos.some((x) => x.key === c.key) && temCampo(c.key)) { ordem.push({ titulo: c.titulo, corpo: campos[c.key] }); usados.add(c.key); }
      }
      usados.add(b.key);
      if (temCampo(b.key)) ordem.push({ titulo: CAMPOS.find((c) => c.key === b.key).titulo, corpo: campos[b.key] });
    } else if (outrasI < outras.length) ordem.push(outras[outrasI++]);
  }
  const faltam = CAMPOS.filter((c) => !usados.has(c.key) && temCampo(c.key)).map((c) => ({ titulo: c.titulo, corpo: campos[c.key] }));
  // arquivo sem nenhum campo do molde: o molde vem logo depois da abertura, antes das seções antigas
  if (!atual.blocos.some((b) => b.key)) ordem.unshift(...faltam); else ordem.push(...faltam);
  ordem.push(...outras.slice(outrasI));

  const titulo = (edit.titulo ?? atual.titulo).trim();
  const abertura = (edit.abertura ?? atual.abertura).trim();
  const partes = [];
  if (atual.preTitulo) partes.push(atual.preTitulo);
  if (titulo) partes.push(`# ${titulo}`);
  if (abertura) partes.push(abertura);
  // bloco sem mudança sai como estava (linhas em branco originais)
  const original = new Map(atual.blocos.map((b) => [`${norm(b.titulo)}\n${b.corpo}`, b.raw]));
  for (const s of ordem) {
    const corpo = String(s.corpo ?? '').trim();
    partes.push(original.get(`${norm(s.titulo)}\n${corpo}`) ?? `## ${s.titulo}\n${corpo}`.trimEnd());
  }
  return `---\n${fmTxt}\n---\n\n${partes.join('\n\n')}\n`;
}

// ── refs: onde existe e se a seção existe ────────────────────────────────────
export const empresas = () => {
  try { return readdirSync(join(ROOT, 'companies')).filter((d) => okId(d) && statSync(join(ROOT, 'companies', d)).isDirectory()); } catch { return []; }
};
function lerSecao(abs, secao) {
  if (statSync(abs).isDirectory()) return { ok: false, erro: 'é uma pasta (aponte um arquivo)' };
  if (!secao) return { ok: true };
  const { sections: secs } = sections(readFileSync(abs, 'utf8'));
  const want = norm(secao);
  const hit = secs.find((s) => norm(s.title) === want) ?? secs.find((s) => norm(s.title).startsWith(want));
  return hit ? { ok: true, secao: hit.title } : { ok: false, erro: `seção não encontrada: "${secao}"` };
}
/**
 * Confere uma ref. Raiz do repo vale para todos; ref de empresa é conferida em cada empresa (slug = uma só).
 * → { ref, escopo: 'raiz'|'empresa'|null, ok, erro?, avisos: string[] }
 */
export function conferirRef(ref, slug) {
  const [path0, ...rest] = String(ref).split('#');
  const path = path0.trim().replace(/^\/+/, '');
  const secao = rest.join('#').trim() || null;
  if (!path || path.split('/').includes('..')) return { ref, escopo: null, ok: false, erro: 'caminho inválido', avisos: [] };
  const raiz = join(ROOT, path);
  if (existsSync(raiz)) { const r = lerSecao(raiz, secao); return { ref, escopo: 'raiz', ok: r.ok, erro: r.erro, avisos: [] }; }
  const lista = slug ? [slug] : empresas();
  const falhas = [];
  for (const s of lista) {
    const abs = join(ROOT, 'companies', s, path);
    if (!existsSync(abs)) { falhas.push(`${s}: arquivo não existe`); continue; }
    const r = lerSecao(abs, secao);
    if (!r.ok) falhas.push(`${s}: ${r.erro}`);
  }
  if (!lista.length) return { ref, escopo: 'empresa', ok: false, erro: 'nenhuma empresa cadastrada', avisos: [] };
  if (falhas.length === lista.length) return { ref, escopo: 'empresa', ok: false, erro: falhas.length === 1 ? falhas[0].replace(/^[^:]+: /, '') : falhas.join(' · '), avisos: [] };
  return { ref, escopo: 'empresa', ok: true, avisos: falhas };
}

// ── leitura de agentes e skills ──────────────────────────────────────────────
export const listarAgentes = () => { try { return readdirSync(AGENTS).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort(); } catch { return []; } };
export const listarSkills = () => { try { return readdirSync(SKILLS).filter((d) => okId(d) && existsSync(join(SKILLS, d, 'SKILL.md'))).sort(); } catch { return []; } };
export function lerFicha(tipo, id) {
  const abs = arquivoDe(tipo, id);
  if (!okId(id) || !existsSync(abs)) return null;
  const texto = readFileSync(abs, 'utf8');
  return { tipo, id, path: relDe(tipo, id), texto, mtime: statSync(abs).mtimeMs, ...parseFicha(texto) };
}
export function salvarFicha(tipo, id, edit) {
  const atual = lerFicha(tipo, id);
  if (!atual) throw new Error(`${tipo} desconhecido: ${id}`);
  const novo = gravarFicha(atual.texto, edit);
  writeFileSync(arquivoDe(tipo, id), novo);
  return lerFicha(tipo, id);
}
const skillsDoAgente = (id) => { const f = lerFicha('agente', id); return Array.isArray(f?.fm.skills) ? f.fm.skills.map(String) : []; };

/** problemas de uma ficha → { erros: string[], avisos: string[] } (fora do molde: só 1 aviso) */
export function conferirFicha(tipo, id, slug) {
  const f = lerFicha(tipo, id);
  if (!f) return { erros: [`${tipo} não encontrado: ${id}`], avisos: [], noMolde: false, refs: [] };
  const erros = [];
  const avisos = [];
  if (!String(f.fm.description ?? '').trim()) erros.push('falta a descrição (quando usar) no frontmatter');
  const refs = f.contexto.itens.map((i) => ({ ...i, ...conferirRef(i.ref, slug) }));
  for (const r of refs) {
    if (!r.ok) erros.push(`contexto ${r.ref}: ${r.erro}`);
    for (const a of r.avisos) avisos.push(`contexto ${r.ref}: ${a}`);
  }
  if (!f.noMolde) { avisos.push('fora do molde (sem ## Especialista): ainda não revisada'); return { erros, avisos, noMolde: false, refs }; }
  for (const c of CAMPOS.filter((x) => x.obrigatorio)) {
    if (c.key === 'contexto') { if (!f.contexto.itens.length && !/nenhum/i.test(f.contexto.nota)) erros.push('## Contexto sem nenhum arquivo (se não precisa de nada, escreva "Nenhum: …")'); }
    else if (!f.campos[c.key].trim()) erros.push(`falta a seção ## ${c.titulo}`);
  }
  const agentes = new Set(listarAgentes());
  for (const i of f.contexto.itens) for (const a of i.agentes) {
    if (tipo === 'agente') avisos.push(`contexto ${i.ref}: "só:" vale só dentro de skill`);
    else if (!agentes.has(a)) erros.push(`contexto ${i.ref}: agente desconhecido em "só:" (${a})`);
    else if (!skillsDoAgente(a).includes(id)) avisos.push(`contexto ${i.ref}: ${a} não tem a skill ${id} ativada`);
  }
  return { erros, avisos, noMolde: true, refs };
}

export function conferirTudo() {
  return [
    ...listarAgentes().map((id) => ({ tipo: 'agente', id, path: relDe('agente', id), ...conferirFicha('agente', id) })),
    ...listarSkills().map((id) => ({ tipo: 'skill', id, path: relDe('skill', id), ...conferirFicha('skill', id) })),
  ];
}

/**
 * Contexto que um agente deve ler: o do agente + o das skills (só os itens sem "só:" ou com o agente no "só:").
 * skills = as da tarefa; sem lista, todas as skills ativadas do agente. → [{ ref, quando, motivo, de }] sem repetição.
 */
export function contextoDoAgente(agente, skills) {
  const out = [];
  const visto = new Map();
  const add = (i, de) => {
    const k = norm(i.ref);
    if (visto.has(k)) { const o = visto.get(k); if (!o.de.includes(de)) o.de.push(de); if (i.quando === 'sempre') o.quando = 'sempre'; return; }
    const it = { ref: i.ref, quando: i.quando, motivo: i.motivo, de: [de] };
    visto.set(k, it); out.push(it);
  };
  const fa = agente ? lerFicha('agente', agente) : null;
  for (const i of fa?.contexto.itens ?? []) add(i, `agente ${agente}`);
  const lista = skills?.length ? skills : agente ? skillsDoAgente(agente) : [];
  for (const s of lista) {
    const fs = lerFicha('skill', s);
    for (const i of fs?.contexto.itens ?? []) if (!i.agentes.length || !agente || i.agentes.includes(agente)) add(i, `skill ${s}`);
  }
  return out;
}

/** arquivos e seções que podem entrar no ## Contexto (o select do app) */
export function candidatos(slug) {
  const out = [];
  const md = (abs, ref, grupo) => {
    let secs = [];
    try { secs = sections(readFileSync(abs, 'utf8')).sections; } catch { /* ilegível */ }
    const top = secs.length ? Math.min(...secs.map((s) => s.level)) : 1;
    const linhas = (() => { try { return readFileSync(abs, 'utf8').split('\n').length; } catch { return 0; } })();
    out.push({ ref, grupo, linhas, secoes: secs.filter((s) => s.level > top && s.level <= top + 2).map((s) => ({ titulo: s.title, nivel: s.level - top, linhas: s.end - s.start })) });
  };
  const varre = (dir, base, grupo, prof = 3) => {
    let nomes = [];
    try { nomes = readdirSync(dir).sort(); } catch { return; }
    for (const n of nomes) {
      if (n.startsWith('.') || n.startsWith('_') || n === 'node_modules') continue;
      const abs = join(dir, n);
      const st = statSync(abs);
      if (st.isDirectory()) { if (prof > 0) varre(abs, `${base}/${n}`, grupo, prof - 1); }
      else if (/\.md$/i.test(n)) md(abs, `${base}/${n}`, grupo);
    }
  };
  const emp = slug && okId(slug) ? slug : empresas()[0];
  if (emp) {
    varre(join(ROOT, 'companies', emp, 'context'), 'context', 'Contexto da empresa', 0);
    const brand = join(ROOT, 'companies', emp, 'brand', 'BRAND.md');
    if (existsSync(brand)) md(brand, 'brand/BRAND.md', 'Marca');
  }
  varre(join(ROOT, 'knowledge'), 'knowledge', 'Conhecimento');
  for (const s of listarSkills()) {
    const ref = join(SKILLS, s, 'references');
    if (existsSync(ref)) varre(ref, `.claude/skills/${s}/references`, `Referências de skills`, 1);
  }
  return out;
}
