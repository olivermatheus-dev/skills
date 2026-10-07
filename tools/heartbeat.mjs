// Heartbeat dos agentes: cria tarefas recorrentes vencidas e acorda o agente de cada tarefa pronta.
// Uso:
//   node tools/heartbeat.mjs                 só mostra o que faria (seguro)
//   node tools/heartbeat.mjs --run           executa (chama `claude -p --agent <nome>`)
//   node tools/heartbeat.mjs --run --watch 30   repete a cada 30 min (deixe um terminal aberto)
// Opções: --slug kz · --agent roteirista · --max 1 (tarefas por batida, default 1)
// Pronta = status todo · assignee agent:<nome> ou ai · todas as dependências done.
// Recorrentes: companies/<slug>/board/recorrentes.json (ver companies/_modelo/board/recorrentes.json).
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { companies, boardDir, listTasks, nextId, updateTask, today } from './lib/board.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const RUN = args.includes('--run');
const MAX = parseInt(opt('--max', '1'), 10);
const ONLY_SLUG = opt('--slug');
const ONLY_AGENT = opt('--agent');
const WATCH = parseInt(opt('--watch', '0'), 10);
const PERMISSION = process.env.HEARTBEAT_PERMISSION_MODE || 'acceptEdits';
const ALLOWED = (process.env.HEARTBEAT_ALLOWED_TOOLS || 'Read,Write,Edit,Glob,Grep,Skill,Agent,Bash(node tools/*),Bash(node .claude/skills/*),Bash(ffmpeg *),Bash(npx hyperframes *)').split(',');

mkdirSync('logs/heartbeat', { recursive: true });
const LOG = join('logs/heartbeat', `${today()}.log`);
const log = (msg) => { const line = `[${new Date().toISOString()}] ${msg}`; console.log(line); appendFileSync(LOG, line + '\n'); };

// ---------- recorrentes ----------
const DOW = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
const iso = (d) => d.toISOString().slice(0, 10);
function lastDue(every, now = new Date()) {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const [kind, val] = every.split(':');
  if (kind === 'diario') return iso(d);
  if (kind === 'semanal') { const back = (d.getUTCDay() - DOW[val] + 7) % 7; d.setUTCDate(d.getUTCDate() - back); return iso(d); }
  if (kind === 'mensal') { const day = parseInt(val, 10); if (d.getUTCDate() < day) d.setUTCMonth(d.getUTCMonth() - 1); d.setUTCDate(day); return iso(d); }
  throw new Error(`every inválido: ${every} (use diario | semanal:seg | mensal:1)`);
}

function createRecurring(slug) {
  const file = join(boardDir(slug), 'recorrentes.json');
  if (!existsSync(file)) return;
  const recs = JSON.parse(readFileSync(file, 'utf8'));
  let changed = false;
  for (const r of recs) {
    if (r.active === false) continue;
    const due = lastDue(r.every);
    if (r.last && r.last >= due) continue;
    const id = nextId(listTasks(slug));
    const name = `${id}-${r.id.toLowerCase()}-${due}.md`;
    const checklist = (r.checklist || []).map((c) => `- [ ] ${c}`).join('\n') || '(definir ao planejar)';
    const body = `---\nid: ${id}\ntitle: ${r.title} (${due})\nboard: ${r.board}\nstatus: todo\nassignee: ${r.assignee}\npriority: ${r.priority || 'media'}\ndue: ${due}\ndepends: []\nparent:\nrecurring: ${r.id}\nlinks: []\n---\n${r.description || ''}\n\n## Checklist\n${checklist}\n\n## Log\n- ${today()} · heartbeat · criada pela recorrência ${r.id} (${r.every})\n`;
    if (RUN) { writeFileSync(join(boardDir(slug), name), body); r.last = due; changed = true; }
    log(`${RUN ? 'criada' : '[simulação] criaria'} ${slug}/${name} ← ${r.id} ${r.every}`);
  }
  if (changed) writeFileSync(file, JSON.stringify(recs, null, 2) + '\n');
}

// ---------- tarefas prontas ----------
function readyTasks(slug) {
  const tasks = listTasks(slug);
  const done = new Set(tasks.filter((t) => t.status === 'done').map((t) => t.id));
  const rank = { alta: 0, media: 1, baixa: 2 };
  return tasks
    .filter((t) => t.status === 'todo' && /^(ai|agent:[\w-]+)$/.test(t.assignee || ''))
    .filter((t) => [].concat(t.depends || []).every((d) => done.has(d)))
    .filter((t) => !ONLY_AGENT || t.assignee === `agent:${ONLY_AGENT}`)
    .sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1) || a.id.localeCompare(b.id))
    .map((t) => ({ ...t, slug }));
}

function wake(t) {
  const agent = t.assignee.startsWith('agent:') ? t.assignee.slice(6) : null;
  const prompt = agent
    ? `Execute a tarefa ${t.path} seguindo o protocolo em .claude/skills/orquestrar/references/protocolo.md. Você foi acordado pelo heartbeat: o Oliver não está na conversa; se precisar dele, use o portão.`
    : `Use a skill orquestrar para executar a tarefa ${t.path}. Você foi acordado pelo heartbeat: o Oliver não está na conversa; se precisar dele, use o portão.`;
  const cli = ['-p', ...(agent ? ['--agent', agent] : []), '--permission-mode', PERMISSION, '--allowedTools', ...ALLOWED, '--', prompt];
  if (!RUN) { log(`[simulação] acordaria ${agent ? `agent:${agent}` : 'orquestrador'} → ${t.slug}/${t.id} ${t.title}`); return; }
  updateTask(t.path, { status: 'doing' }, `${today()} · heartbeat · acordou ${agent ? `agent:${agent}` : 'orquestrador'}`);
  log(`acordando ${agent ? `agent:${agent}` : 'orquestrador'} → ${t.slug}/${t.id} ${t.title}`);
  const r = spawnSync('claude', cli, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
  appendFileSync(LOG, `--- saída ${t.id} ---\n${r.stdout || ''}${r.stderr || ''}\n--- fim ${t.id} ---\n`);
  const after = listTasks(t.slug).find((x) => x.id === t.id);
  if (r.status !== 0) log(`⚠ ${t.id}: claude saiu com código ${r.status}`);
  log(`${t.id} agora está em: ${after?.status} (${after?.assignee})`);
  if (after?.status === 'doing') updateTask(t.path, {}, `${today()} · heartbeat · ⚠ agente terminou sem mudar o status; conferir`);
}

// ---------- batida ----------
function beat() {
  const lock = 'logs/heartbeat/.lock';
  if (existsSync(lock) && Date.now() - statSync(lock).mtimeMs < 2 * 3600e3) { log('outra batida em andamento; pulando'); return; }
  if (RUN) writeFileSync(lock, String(process.pid));
  try {
    const slugs = ONLY_SLUG ? [ONLY_SLUG] : companies();
    for (const s of slugs) createRecurring(s);
    const ready = slugs.flatMap(readyTasks).slice(0, MAX);
    if (!ready.length) log('nenhuma tarefa pronta para agentes');
    for (const t of ready) wake(t);
  } finally { if (RUN && existsSync(lock)) unlinkSync(lock); }
}

beat();
if (WATCH > 0) { log(`watch: nova batida a cada ${WATCH} min (Ctrl+C para parar)`); setInterval(beat, WATCH * 60e3); }
