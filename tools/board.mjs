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
import { existsSync } from 'node:fs';
import { STATUS, BOARDS, PRIORITY, boardDir, listTasks, nextId, addComment, updateTask, today } from './lib/board.mjs';

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
    if (errs.length) { bad++; console.log(`✗ ${t.file}: ${errs.join(', ')}`); }
  }
  console.log(bad ? `${bad} tarefa(s) com problema` : `✓ ${tasks.length} tarefas válidas`);
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
