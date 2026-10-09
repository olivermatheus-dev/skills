// Kanban em arquivos. Cada tarefa = companies/<slug>/board/T-NNNN-<slug>.md (frontmatter).
// Uso:
//   node tools/board.mjs <slug>            quadro completo
//   node tools/board.mjs <slug> --me       minha visão (assignee: oliver — inclui o que está em revisão)
//   node tools/board.mjs <slug> --ai       visão da IA (assignee: ai ou agent:*)
//   node tools/board.mjs <slug> --board conteudo
//   node tools/board.mjs <slug> --check    valida os campos
//   node tools/board.mjs <slug> --next-id  próximo id livre
//   node tools/board.mjs comment <slug> <T-NNNN> "texto" --as agent:<nome> [--tipo nota|revisar|pergunta] [--status review --para oliver]
//        comentário no card (aparece no app, na aba da tarefa). revisar/pergunta = o Oliver precisa ver/responder.
//   node tools/board.mjs pacote <slug> <T-NNNN>          o que ler para executar/retomar: Estado, tarefa, mãe, comentários
//        e SÓ os trechos do `context:` declarado (021) + o 
//   node tools/board.mjs estado <slug> <T-NNNN> "linha 1\nlinha 2" [--as agent:<nome>]   reescreve o ## Estado (≤ 5 linhas)
//   node tools/board.mjs compactar <slug> <T-NNNN> "resumo" [--manter 5] [--as …]   log antigo vira 1 linha
//   node tools/contexto.mjs indice <slug>                seções do contexto da empresa (para escolher o `context:`)
import { existsSync, readFileSync } from 'node:fs';
import { STATUS, BOARDS, PRIORITY, boardDir, listTasks, nextId, addComment, updateTask, today,
  getSection, setEstado, compactLog, ESTADO_MAX, LOG_MAX } from './lib/board.mjs';
import { readRef, norm } from './lib/contexto.mjs';
import { contextoDoAgente } from './lib/ficha-agente.mjs';

const argv = process.argv.slice(2);
if (argv[0] === 'comment') {
  const [, cslug, id, text] = argv;
  const o = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const who = o('--as') || 'ai';
  if (!cslug || !id || !text) { console.log('Uso: node tools/board.mjs comment <slug> <T-NNNN> "texto" --as agent:<nome> [--tipo revisar|pergunta] [--status review --para oliver]'); process.exit(1); }
  const t = listTasks(cslug).find((x) => x.id === id);
  if (!t) { console.log(`Tarefa ${id} não encontrada em ${boardDir(cslug)}`); process.exit(1); }
  addComment(t.path, who, text, o('--tipo') || 'nota');
  const fields = {};
  if (o('--status')) fields.status = o('--status');
  if (o('--para')) fields.assignee = o('--para');
  if (Object.keys(fields).length) updateTask(t.path, fields, `${today()} · ${who} · ${Object.entries(fields).map(([k, v]) => `${k} → ${v}`).join(' · ')}`);
  console.log(`✓ comentário em ${t.file}${Object.keys(fields).length ? ` (${JSON.stringify(fields)})` : ''}`);
  process.exit(0);
}

const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const findTask = (cslug, id) => {
  if (!cslug || !id) { console.log(`Uso: node tools/board.mjs ${argv[0]} <slug> <T-NNNN> …`); process.exit(1); }
  const t = listTasks(cslug).find((x) => x.id === id);
  if (!t) { console.log(`Tarefa ${id} não encontrada em ${boardDir(cslug)}`); process.exit(1); }
  return t;
};

if (argv[0] === 'estado') {
  const t = findTask(argv[1], argv[2]);
  const text = String(argv[3] ?? '').replace(/\\n/g, '\n'); // "\n" digitado no terminal = quebra de linha
  if (!text.trim()) { console.log('Estado vazio. Ex.: "Parou em: …\\nPróximo: …\\nFalta do Oliver: …"'); process.exit(1); }
  const n = setEstado(t.path, text);
  console.log(`✓ Estado de ${t.id} atualizado (${n} linha${n > 1 ? 's' : ''})${n > ESTADO_MAX ? ` ⚠ passe de ${ESTADO_MAX}: resuma` : ''}`);
  process.exit(0);
}

if (argv[0] === 'compactar') {
  const t = findTask(argv[1], argv[2]);
  if (!argv[3]) { console.log('Falta o resumo das linhas antigas.'); process.exit(1); }
  const n = compactLog(t.path, opt('--as') || 'ai', argv[3], parseInt(opt('--manter') || '5', 10));
  console.log(n ? `✓ ${n} linhas antigas do log de ${t.id} viraram 1` : `nada a compactar em ${t.id}`);
  process.exit(0);
}

if (argv[0] === 'pacote') {
  const [, cslug, id] = argv;
  const t = findTask(cslug, id);
  const all = listTasks(cslug);
  const body = readFileSync(t.path, 'utf8').replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n?/, '');
  const estado = getSection(body, 'Estado');
  const logItems = (getSection(body, 'Log') || '').split('\n').filter((l) => /^\s*- /.test(l));
  const main = body.replace(/(^|\n)## (Estado|Coment[aá]rios|Log)\s*\n[\s\S]*?(?=\n## |$)/gi, '').trim();
  const comments = (getSection(body, 'Coment[aá]rios') || '').trim();
  const refs = [].concat(t.context || []);
  const out = [];
  out.push(`# Pacote ${t.id} — ${t.title}`);
  out.push(`${t.path} · ${t.board} · ${t.status} · ${t.assignee}${t.depends?.length ? ` · depende de ${[].concat(t.depends).join(', ')}` : ''}${t.parent ? ` · mãe ${t.parent}` : ''}`);
  if ([].concat(t.links || []).length) out.push(`links: ${[].concat(t.links).join(' · ')}`);
  out.push('', '## Estado', estado || '(sem Estado: tarefa nova ou formato antigo; escreva um ao primeiro marco)');
  out.push('', '## Tarefa', main || '(sem descrição)');
  if (comments) out.push('', '## Comentários (o mais recente do Oliver manda)', comments);
  const keep = 5;
  out.push('', `## Log (${logItems.length} linha${logItems.length === 1 ? '' : 's'}${logItems.length > keep ? `, últimas ${keep}` : ''})`, ...logItems.slice(-keep));
  if (logItems.length > LOG_MAX) out.push(`⚠ log com mais de ${LOG_MAX} linhas: ao fechar o marco, \`node tools/board.mjs compactar ${cslug} ${t.id} "resumo"\``);
  if (t.parent) {
    const p = all.find((x) => x.id === t.parent);
    if (p) {
      const pb = readFileSync(p.path, 'utf8').replace(/\r\n/g, '\n');
      const pe = getSection(pb, 'Estado');
      out.push('', `## Tarefa-mãe ${p.id} — ${p.title} (${p.status})`, pe || '(sem Estado)', `arquivo: ${p.path}`);
    }
  }
  // 048: contexto da função = ## Contexto da ficha do agente + das skills da tarefa (`skills:`; sem lista, as do agente só como índice)
  const agente = /^agent:/.test(t.assignee || '') ? t.assignee.slice(6) : null;
  const tskills = [].concat(t.skills || []);
  const naTarefa = new Set(refs.map(norm));
  const funcao = contextoDoAgente(agente, tskills).filter((i) => !naTarefa.has(norm(i.ref)));
  const ler = funcao.filter((i) => i.quando === 'sempre' && (tskills.length || i.de.some((d) => d.startsWith('agente'))));
  const indice = funcao.filter((i) => !ler.includes(i));
  const lidos = [...refs.map((r) => ({ ref: r, de: 'tarefa' })), ...ler.map((i) => ({ ref: i.ref, de: i.de.join(', ') }))];
  out.push('', `## Contexto (${lidos.length}: tarefa${agente ? ` + ficha do ${agente}` : ''}${tskills.length ? ` + skills ${tskills.join(', ')}` : ''})`);
  if (!lidos.length) out.push('(nenhum contexto declarado: leia o que sua função exige e, ao terminar, registre em `context:` o que de fato usou)');
  for (const r of lidos) {
    const x = readRef(cslug, r.ref);
    out.push('', `### ▸ ${r.ref}  [${r.de}]${x.warn ? `  ⚠ ${x.warn}` : ''}`);
    out.push(x.ok ? x.text : `✗ ${x.error}`);
  }
  if (indice.length) {
    out.push('', `## Contexto sob condição (${indice.length}) — leia só se valer: \`node tools/contexto.mjs ler ${cslug} "<ref>"\``);
    for (const i of indice) out.push(`- ${i.ref} · ${i.quando === 'sempre' ? 'sempre que usar a skill' : `quando: ${i.quando}`}${i.motivo ? ` — ${i.motivo}` : ''}  [${i.de.join(', ')}]`);
  }
  console.log(out.join('\n'));
  process.exit(0);
}

const [slug, ...args] = argv;
if (!slug) { console.log('Uso: node tools/board.mjs <slug> [--me|--ai|--board X|--check|--next-id]'); process.exit(1); }
const dir = boardDir(slug);
if (!existsSync(dir)) { console.log(`Sem quadro: ${dir}`); process.exit(1); }
const tasks = listTasks(slug);

if (args.includes('--next-id')) {
  console.log(nextId(tasks));
  process.exit(0);
}

if (args.includes('--check')) {
  const ids = new Set(tasks.map((t) => t.id));
  let bad = 0;
  const warns = [];
  for (const t of tasks) {
    const errs = [];
    if (!/^T-\d{4}$/.test(t.id || '')) errs.push('id');
    if (!t.title) errs.push('title');
    if (!STATUS.includes(t.status)) errs.push(`status "${t.status}"`);
    if (!BOARDS.includes(t.board)) errs.push(`board "${t.board}"`);
    if (!/^(oliver|ai|agent:[\w-]+)$/.test(t.assignee || '')) errs.push(`assignee "${t.assignee}"`);
    if (t.priority && !PRIORITY.includes(t.priority)) errs.push(`priority "${t.priority}"`);
    for (const d of [].concat(t.depends || [])) if (!ids.has(d)) errs.push(`depends ${d} não existe`);
    if (t.parent && !ids.has(t.parent)) errs.push(`parent ${t.parent} não existe`);
    for (const r of [].concat(t.context || [])) { const x = readRef(slug, r); if (!x.ok) errs.push(`context "${r}": ${x.error}`); else if (x.warn) warns.push(`${t.file}: context "${r}": ${x.warn}`); }
    if (['doing', 'review'].includes(t.status)) {
      const body = readFileSync(t.path, 'utf8').replace(/\r\n/g, '\n');
      const est = getSection(body, 'Estado');
      const nLog = (getSection(body, 'Log') || '').split('\n').filter((l) => /^\s*- /.test(l)).length;
      if (est == null) warns.push(`${t.file}: ${t.status} sem ## Estado`);
      else if (est.split('\n').filter(Boolean).length > ESTADO_MAX) warns.push(`${t.file}: Estado com mais de ${ESTADO_MAX} linhas`);
      if (nLog > LOG_MAX) warns.push(`${t.file}: log com ${nLog} linhas (compactar)`);
    }
    if (errs.length) { bad++; console.log(`✗ ${t.file}: ${errs.join(', ')}`); }
  }
  for (const w of warns) console.log(`⚠ ${w}`);
  console.log(bad ? `${bad} tarefa(s) com problema` : `✓ ${tasks.length} tarefas válidas${warns.length ? ` (${warns.length} aviso${warns.length > 1 ? 's' : ''})` : ''}`);
  process.exit(bad ? 1 : 0);
}

let view = tasks;
let title = `Quadro — ${slug}`;
if (args.includes('--me')) { view = view.filter((t) => t.assignee === 'oliver'); title += ' · minha visão'; }
if (args.includes('--ai')) { view = view.filter((t) => /^(ai|agent:)/.test(t.assignee || '')); title += ' · IA'; }
const bi = args.indexOf('--board');
if (bi >= 0) { view = view.filter((t) => t.board === args[bi + 1]); title += ` · ${args[bi + 1]}`; }

console.log(title);
const done = new Set(tasks.filter((t) => t.status === 'done').map((t) => t.id));
for (const s of STATUS) {
  const col = view.filter((t) => t.status === s);
  if (!col.length) continue;
  console.log(`\n${s.toUpperCase()} (${col.length})`);
  for (const t of col) {
    const blocked = [].concat(t.depends || []).filter((d) => !done.has(d));
    const extra = [t.board, t.assignee, t.priority === 'alta' ? 'alta' : '', t.due, t.check, blocked.length ? `bloqueada por ${blocked.join(',')}` : '']
      .filter(Boolean).join(' · ');
    console.log(`  ${t.id}  ${t.title}  — ${extra}`);
  }
}
