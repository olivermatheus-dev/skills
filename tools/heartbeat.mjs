// Heartbeat dos agentes: cria tarefas recorrentes vencidas e acorda o agente de cada tarefa pronta.
// Uso:
//   node tools/heartbeat.mjs                 só mostra o que faria (seguro)
//   node tools/heartbeat.mjs --run           executa (chama `claude -p --agent <nome>`)
//   node tools/heartbeat.mjs --run --watch 30   repete a cada 30 min (deixe um terminal aberto)
// Opções: --slug kz · --agent roteirista · --max 1 (tarefas por batida, default 1) · --task T-0016 (só essa)
// O app (Quadro → Rodar IA) chama este mesmo script; o lock (logs/heartbeat/.lock, JSON) diz qual tarefa está rodando.
// --fichas (com --slug): roda a fila de fichas da 040 (pedido.json de cada concorrente) num `claude -p` só, com o mesmo lock;
//   no fim tira da fila o que ficou analisado (tools/lib/fichas-fila.mjs). O app (Concorrentes → Conteúdos → Analisar) chama isto.
// --pesquisa <rodada> (com --slug): roda UMA rodada de pesquisa de ideias da 041 (curadoria/rodadas/<id>/pedido.json) num `claude -p`, com o mesmo lock;
//   no fim marca o pedido (feito/erro/pendente). O app (Ideias → Pesquisar ideias) chama isto. Sob comando, nunca agendado.
// Pronta = status todo · assignee agent:<nome> ou ai · todas as dependências done.
// Recorrentes: companies/<slug>/board/recorrentes.json (ver companies/_modelo/board/recorrentes.json).
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, unlinkSync, statSync, openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { companies, boardDir, listTasks, nextId, updateTask, addComment, today } from './lib/board.mjs';
import { listarPedidos, marcarRodando, escreverProgresso, fechar, promptFila } from './lib/fichas-fila.mjs';
import * as PQ from './lib/pesquisa.mjs';
import * as AT from './lib/atividade.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const RUN = args.includes('--run');
const MAX = parseInt(opt('--max', '1'), 10);
const ONLY_SLUG = opt('--slug');
const ONLY_AGENT = opt('--agent');
const ONLY_TASK = opt('--task');
const WATCH = parseInt(opt('--watch', '0'), 10);
const FICHAS = args.includes('--fichas');
const PESQUISA = opt('--pesquisa');
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
    .filter((t) => !ONLY_TASK || t.id === ONLY_TASK)
    .sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1) || a.id.localeCompare(b.id))
    .map((t) => ({ ...t, slug }));
}

function wake(t) {
  const agent = t.assignee.startsWith('agent:') ? t.assignee.slice(6) : null;
  const first = `Comece por \`node tools/board.mjs pacote ${t.slug} ${t.id}\` (tarefa, Estado, comentários e só o contexto declarado). `;
  const prompt = first + (agent
    ? `Execute a tarefa ${t.path} seguindo o protocolo em .claude/skills/orquestrar/references/protocolo.md. Você foi acordado pelo heartbeat: o Oliver não está na conversa; leia os comentários do card e, se precisar dele, use o portão (comentário revisar/pergunta).`
    : `Use a skill orquestrar para executar a tarefa ${t.path}. Você foi acordado pelo heartbeat: o Oliver não está na conversa; leia os comentários do card e, se precisar dele, use o portão (comentário revisar/pergunta).`);
  const cli = ['-p', ...(agent ? ['--agent', agent] : []), '--permission-mode', PERMISSION, '--allowedTools', ...ALLOWED, '--', prompt];
  if (!RUN) { log(`[simulação] acordaria ${agent ? `agent:${agent}` : 'orquestrador'} → ${t.slug}/${t.id} ${t.title}`); return; }
  updateTask(t.path, { status: 'doing' }, `${today()} · heartbeat · acordou ${agent ? `agent:${agent}` : 'orquestrador'}`);
  log(`acordando ${agent ? `agent:${agent}` : 'orquestrador'} → ${t.slug}/${t.id} ${t.title}`);
  const at = AT.iniciar({ slug: t.slug, tipo: 'ia', fonte: 'quadro', titulo: `${t.id} · ${t.title}`, agente: agent ? `agent:${agent}` : 'orquestrador', passo: 'Abrindo o Claude Code', link: `/p/${t.slug}/quadro?t=${t.id}`, ref: t.id });
  writeLock({ slug: t.slug, task: t.id, title: t.title, who: agent ? `agent:${agent}` : 'ai', atividade: at.id });
  // a saída vai direto para o log (dá para acompanhar enquanto roda)
  appendFileSync(LOG, `--- saída ${t.id} ---\n`);
  const from = statSync(LOG).size;
  const fd = openSync(LOG, 'a');
  // Windows: o claude é um .cmd (precisa de shell) e o shell não põe aspas sozinho → cada argumento vai entre aspas
  const win = process.platform === 'win32';
  const q = (a) => (/[\s"&|<>^()*]/.test(a) ? `"${a.replace(/"/g, "'")}"` : a);
  const r = spawnSync('claude', win ? cli.map(q) : cli, { stdio: ['ignore', fd, fd], shell: win, env: cleanEnv() });
  closeSync(fd);
  const out = readFileSync(LOG).subarray(from).toString('utf8');
  appendFileSync(LOG, `\n--- fim ${t.id} ---\n`);
  const after = listTasks(t.slug).find((x) => x.id === t.id);
  if (r.status !== 0) log(`⚠ ${t.id}: claude saiu com código ${r.status}`);
  log(`${t.id} agora está em: ${after?.status} (${after?.assignee})`);
  const COL = { todo: 'A fazer', doing: 'Fazendo', review: 'Revisão', done: 'Feito', backlog: 'Backlog' };
  if (after?.status !== 'doing') {
    if (r.status !== 0) AT.terminar(at.id, 'erro', { erro: `O Claude saiu com código ${r.status}.` });
    else AT.terminar(at.id, 'feito', { resumo: `${t.id} foi para ${COL[after?.status] ?? after?.status}${after?.status === 'review' ? ': sua vez de revisar' : ''}` });
    return;
  }
  // falhou ou parou no meio: avisa no card e devolve para "A fazer" (entra de novo no próximo Rodar IA)
  const why = /not logged in|\/login/i.test(out)
    ? 'Falhou: Claude Code do terminal sem login (`claude` → `/login`).'
    : `Terminou sem mudar o status (código ${r.status}). ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}`;
  addComment(t.path, 'heartbeat', why, 'revisar');
  AT.terminar(at.id, 'erro', { erro: why });
  if (r.status !== 0) updateTask(t.path, { status: 'todo' }, `${today()} · heartbeat · falhou (código ${r.status}); voltou para todo`);
}

// Rodando dentro de outra sessão do Claude (app desktop, preview), as variáveis dela confundem o claude filho.
function cleanEnv() {
  if (!process.env.CLAUDE_CODE_ENTRYPOINT && !process.env.CLAUDECODE) return process.env;
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK_|CLAUDE_PID$|CLAUDE_EFFORT$|ANTHROPIC_BASE_URL$)/.test(k)));
}

// ---------- fila de fichas (040 E) ----------
function runFichas(slug) {
  const rodada = RUN ? marcarRodando(slug) : listarPedidos(slug).map(({ comp, pedido }) => ({ comp, itens: pedido.itens, reanalisar: !!pedido.reanalisar, requestedAt: pedido.requestedAt }));
  const n = rodada.reduce((a, r) => a + r.itens.length, 0);
  if (!n) { log(`fila de fichas da ${slug} vazia`); return; }
  const inicio = new Date().toISOString();
  const fichasAllowed = [...ALLOWED, 'Bash(npm run fichas *)', 'Bash(npm run validate)', 'Bash(node tools/fichas-fila.mjs *)'];
  const cli = ['-p', '--permission-mode', PERMISSION, '--allowedTools', ...fichasAllowed, '--', promptFila(slug, rodada)];
  if (!RUN) { log(`[simulação] rodaria a fila de fichas da ${slug} (${n} item(ns))`); return; }
  const at = AT.iniciar({ slug, tipo: 'ia', fonte: 'fichas', titulo: `Análise de ${n} conteúdo(s) de concorrentes`, agente: 'orquestrador', passo: 'Abrindo o Claude Code', link: `/p/${slug}/concorrentes/conteudos` });
  writeLock({ slug, kind: 'fichas', title: `Fila de fichas · ${n} conteúdo(s)`, who: 'ai', atividade: at.id });
  escreverProgresso(slug, 'Abrindo o Claude Code');
  log(`fila de fichas → ${slug}: ${rodada.map((r) => `${r.comp} (${r.itens.join(', ')})`).join(' · ')}`);
  appendFileSync(LOG, '--- saída fichas ---\n');
  const from = statSync(LOG).size;
  const fd = openSync(LOG, 'a');
  const win = process.platform === 'win32';
  const q = (a) => (/[\s"&|<>^()*]/.test(a) ? `"${a.replace(/"/g, "'")}"` : a);
  const r = spawnSync('claude', win ? cli.map(q) : cli, { stdio: ['ignore', fd, fd], shell: win, env: cleanEnv() });
  closeSync(fd);
  const out = readFileSync(LOG).subarray(from).toString('utf8');
  appendFileSync(LOG, '\n--- fim fichas ---\n');
  const erro = /not logged in|\/login/i.test(out) ? 'Claude Code do terminal sem login (abra um terminal: claude → /login).'
    : r.status !== 0 ? `O Claude saiu com código ${r.status}. ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}` : null;
  const res = fechar(slug, { erro, inicio, rodada });
  log(`fila de fichas: ${res.feitos.length} analisado(s), ${res.restantes.length} continuam na fila${erro ? ` · ${erro}` : ''}`);
  const resumo = `${res.feitos.length} analisado(s)${res.restantes.length ? `, ${res.restantes.length} continuam na fila` : ''}`;
  AT.terminar(at.id, erro ? 'erro' : 'feito', { resumo, erro });
}

// ---------- pesquisa de ideias (041 F3) ----------
function runPesquisa(slug, round) {
  const pedido = PQ.lerPedido(slug, round);
  if (!pedido) { log(`rodada ${round} não existe em ${slug}`); return; }
  if (pedido.status === 'feito') { log(`rodada ${round} já está feita`); return; }
  const allowed = [...ALLOWED, 'Bash(npm run curadoria *)', 'Bash(npm run validate)'];
  const cli = ['-p', '--permission-mode', PERMISSION, '--allowedTools', ...allowed, '--', PQ.promptPesquisa(slug, round)];
  if (!RUN) { log(`[simulação] rodaria a pesquisa ${round} da ${slug}`); return; }
  const inicio = new Date().toISOString();
  const at = AT.iniciar({ slug, tipo: 'ia', fonte: 'pesquisa', titulo: `Pesquisa de ideias · ${round}`, agente: 'pesquisador', passo: 'Abrindo o Claude Code', link: `/p/${slug}/ideias/pesquisas/${round}`, ref: round });
  writeLock({ slug, kind: 'pesquisa', round, title: `Pesquisa de ideias · ${round}`, who: 'ai', atividade: at.id });
  PQ.marcarPedido(slug, round, 'rodando');
  log(`pesquisa de ideias → ${slug}/${round}`);
  appendFileSync(LOG, '--- saída pesquisa ---\n');
  const from = statSync(LOG).size;
  const fd = openSync(LOG, 'a');
  const win = process.platform === 'win32';
  const q = (a) => (/[\s"&|<>^()*]/.test(a) ? `"${a.replace(/"/g, "'")}"` : a);
  const r = spawnSync('claude', win ? cli.map(q) : cli, { stdio: ['ignore', fd, fd], shell: win, env: cleanEnv() });
  closeSync(fd);
  const out = readFileSync(LOG).subarray(from).toString('utf8');
  appendFileSync(LOG, '\n--- fim pesquisa ---\n');
  const erro = /not logged in|\/login/i.test(out) ? 'Claude Code do terminal sem login (abra um terminal: claude → /login).'
    : r.status !== 0 ? `O Claude saiu com código ${r.status}. ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}` : null;
  const res = PQ.fechar(slug, round, { erro, inicio });
  log(`pesquisa ${round}: ${res.feita ? 'feita' : `não terminou${res.erro ? ` · ${res.erro}` : ''}`}`);
  AT.terminar(at.id, res.feita ? 'feito' : 'erro', res.feita ? { resumo: 'Pesquisa pronta' } : { erro: res.erro ?? erro ?? 'A pesquisa não terminou.' });
}

// ---------- batida ----------
const LOCK = 'logs/heartbeat/.lock';
const STARTED = new Date().toISOString();
const writeLock = (extra) => writeFileSync(LOCK, JSON.stringify({ pid: process.pid, started: STARTED, log: LOG, ...extra }));
function beat() {
  if (existsSync(LOCK) && Date.now() - statSync(LOCK).mtimeMs < 2 * 3600e3) { log('outra batida em andamento; pulando'); return; }
  if (RUN) writeLock({});
  try {
    if (PESQUISA) { if (!ONLY_SLUG) log('--pesquisa precisa de --slug'); else runPesquisa(ONLY_SLUG, PESQUISA); return; }
    if (FICHAS) { if (!ONLY_SLUG) log('--fichas precisa de --slug'); else runFichas(ONLY_SLUG); return; }
    const slugs = ONLY_SLUG ? [ONLY_SLUG] : companies();
    if (!ONLY_TASK) for (const s of slugs) createRecurring(s);
    const ready = slugs.flatMap(readyTasks).slice(0, MAX);
    if (!ready.length) log('nenhuma tarefa pronta para agentes');
    for (const t of ready) wake(t);
  } finally { if (RUN && existsSync(LOCK)) unlinkSync(LOCK); }
}

beat();
if (WATCH > 0) { log(`watch: nova batida a cada ${WATCH} min (Ctrl+C para parar)`); setInterval(beat, WATCH * 60e3); }
