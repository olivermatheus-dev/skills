// Kanban em arquivos. Cada tarefa = companies/<slug>/board/T-NNNN-<slug>.md (frontmatter).
// Uso:
//   node tools/board.mjs <slug>            quadro completo
//   node tools/board.mjs <slug> --me       minha visão (assignee: oliver — inclui o que está em revisão)
//   node tools/board.mjs <slug> --ai       visão da IA (assignee: ai ou agent:*)
//   node tools/board.mjs <slug> --board conteudo
//   node tools/board.mjs <slug> --check    valida os campos
//   node tools/board.mjs <slug> --next-id  próximo id livre
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATUS = ['backlog', 'todo', 'doing', 'review', 'done'];
const BOARDS = ['conteudo', 'vendas', 'produto'];
const PRIORITY = ['baixa', 'media', 'alta'];

const [slug, ...args] = process.argv.slice(2);
if (!slug) { console.log('Uso: node tools/board.mjs <slug> [--me|--ai|--board X|--check|--next-id]'); process.exit(1); }
const dir = join('companies', slug, 'board');
if (!existsSync(dir)) { console.log(`Sem quadro: ${dir}`); process.exit(1); }

const parse = (file) => {
  const txt = readFileSync(join(dir, file), 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  const t = { file };
  if (!m) return t;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean);
    t[kv[1]] = v;
  }
  const body = txt.slice(m[0].length);
  const done = (body.match(/- \[x\]/gi) || []).length;
  const all = done + (body.match(/- \[ \]/g) || []).length;
  t.check = all ? `${done}/${all}` : '';
  return t;
};

const tasks = readdirSync(dir).filter((f) => /^T-\d+.*\.md$/.test(f)).map(parse);

if (args.includes('--next-id')) {
  const n = Math.max(0, ...tasks.map((t) => parseInt((t.id || 'T-0').slice(2), 10) || 0)) + 1;
  console.log(`T-${String(n).padStart(4, '0')}`);
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
