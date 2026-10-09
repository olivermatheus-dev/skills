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
// --pedido <id>: roda UM pedido avulso do app (046 D: ajustes por anotação, análise do concorrente, relatório), gravado em
//   logs/pedidos-ia/<id>.json (tools/lib/pedidos-ia.mjs) com prompt, agente e ferramentas extras; mesmo lock e dock.
// --fila: só esvazia a fila da IA (046 F, tools/lib/fila-ia.mjs). IA uma por vez: o app grava a entrada e chama isto; quem
//   segura o lock roda um trabalho por vez até a fila acabar. Qualquer batida com --run também esvazia a fila no fim, e um
//   trabalho pedido à mão com a IA ocupada entra na fila em vez de ser pulado.
// Pronta = status todo · assignee agent:<nome> ou ai · todas as dependências done.
// Recorrentes: companies/<slug>/board/recorrentes.json (ver companies/_modelo/board/recorrentes.json).
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, unlinkSync, statSync, utimesSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { companies, boardDir, listTasks, nextId, updateTask, addComment, today } from './lib/board.mjs';
import { listarPedidos, marcarRodando, escreverProgresso, fechar, promptFila } from './lib/fichas-fila.mjs';
import * as PQ from './lib/pesquisa.mjs';
import * as PI from './lib/pedidos-ia.mjs';
import * as AT from './lib/atividade.mjs';
import * as FILA from './lib/fila-ia.mjs';
import { rodarClaude } from './lib/claude-stream.mjs';

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
const PEDIDO = opt('--pedido');
const FILA_SO = args.includes('--fila');
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
function readyTasks(slug, { agent, task } = {}) {
  const tasks = listTasks(slug);
  const done = new Set(tasks.filter((t) => t.status === 'done').map((t) => t.id));
  const rank = { alta: 0, media: 1, baixa: 2 };
  return tasks
    .filter((t) => t.status === 'todo' && /^(ai|agent:[\w-]+)$/.test(t.assignee || ''))
    .filter((t) => [].concat(t.depends || []).every((d) => done.has(d)))
    .filter((t) => !agent || t.assignee === `agent:${agent}`)
    .filter((t) => !task || t.id === task)
    .sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1) || a.id.localeCompare(b.id))
    .map((t) => ({ ...t, slug }));
}

/**
 * Roda o claude com o registro de atividade (046 B): cada ferramenta vira passo no dock, o subagente chamado vira o agente
 * da vez, e o log ganha linhas curtas + o texto final. Devolve { status, saida, custo, turnos, ms }.
 */
async function claudeNoDock(cli, { at, agente, rotulo, env = {} }) {
  appendFileSync(LOG, `--- saída ${rotulo} ---\n`);
  let ultimo = 0;
  const r = await rodarClaude(cli, {
    // HUB_ATIVIDADE: os hooks do terminal (046 E) veem que esta sessão já está no registro e não a duplicam
    log: LOG, agente, env: { ...cleanEnv(), HUB_ATIVIDADE: at.id, ...env },
    onPasso: (texto, quem, extra = {}) => {
      AT.passo(at.id, texto, { agente: quem, ...(extra.sessao ? { sessao: extra.sessao } : {}) });
      // a cada 30 s o lock é tocado: o mtime velho não engana a próxima batida
      if (Date.now() - ultimo > 30e3) { ultimo = Date.now(); try { utimesSync(LOCK, new Date(), new Date()); } catch { /* sem lock */ } }
    },
  });
  appendFileSync(LOG, `\n--- fim ${rotulo} ---\n`);
  if (r.custo != null) log(`${rotulo}: ${r.turnos ?? '?'} turnos · ${Math.round((r.ms ?? 0) / 1000)} s · US$ ${r.custo.toFixed(2)}`);
  return r;
}
const semLogin = (out) => /not logged in|\/login/i.test(out);
const fimDe = (r) => ({ custo: r.custo, turnos: r.turnos, final: r.texto || null });

async function wake(t, filaAt = null) {
  const agent = t.assignee.startsWith('agent:') ? t.assignee.slice(6) : null;
  const first = `Comece por \`node tools/board.mjs pacote ${t.slug} ${t.id}\` (tarefa, Estado, comentários e só o contexto declarado). `;
  const prompt = first + (agent
    ? `Execute a tarefa ${t.path} seguindo o protocolo em .claude/skills/orquestrar/references/protocolo.md. Você foi acordado pelo heartbeat: o Oliver não está na conversa; leia os comentários do card e, se precisar dele, use o portão (comentário revisar/pergunta).`
    : `Use a skill orquestrar para executar a tarefa ${t.path}. Você foi acordado pelo heartbeat: o Oliver não está na conversa; leia os comentários do card e, se precisar dele, use o portão (comentário revisar/pergunta).`);
  const cli = ['-p', ...(agent ? ['--agent', agent] : []), '--permission-mode', PERMISSION, '--allowedTools', ...ALLOWED, '--', prompt];
  if (!RUN) { log(`[simulação] acordaria ${agent ? `agent:${agent}` : 'orquestrador'} → ${t.slug}/${t.id} ${t.title}`); return; }
  updateTask(t.path, { status: 'doing' }, `${today()} · heartbeat · acordou ${agent ? `agent:${agent}` : 'orquestrador'}`);
  log(`acordando ${agent ? `agent:${agent}` : 'orquestrador'} → ${t.slug}/${t.id} ${t.title}`);
  const quem = agent ? `agent:${agent}` : 'orquestrador';
  const at = AT.comecar(filaAt, { slug: t.slug, tipo: 'ia', fonte: 'quadro', titulo: `${t.id} · ${t.title}`, agente: quem, passo: 'Abrindo o Claude Code', link: `/p/${t.slug}/quadro?t=${t.id}`, ref: t.id });
  writeLock({ slug: t.slug, task: t.id, title: t.title, who: agent ? `agent:${agent}` : 'ai', atividade: at.id });
  const r = await claudeNoDock(cli, { at, agente: quem, rotulo: t.id });
  const out = r.saida;
  const after = listTasks(t.slug).find((x) => x.id === t.id);
  if (r.status !== 0) log(`⚠ ${t.id}: claude saiu com código ${r.status}`);
  log(`${t.id} agora está em: ${after?.status} (${after?.assignee})`);
  const COL = { todo: 'A fazer', doing: 'Fazendo', review: 'Revisão', done: 'Feito', backlog: 'Backlog' };
  if (after?.status !== 'doing') {
    if (r.status !== 0) AT.terminar(at.id, 'erro', { erro: `O Claude saiu com código ${r.status}.`, ...fimDe(r) });
    else AT.terminar(at.id, 'feito', { resumo: `${t.id} foi para ${COL[after?.status] ?? after?.status}${after?.status === 'review' ? ': sua vez de revisar' : ''}`, ...fimDe(r) });
    return;
  }
  // falhou ou parou no meio: avisa no card e devolve para "A fazer" (entra de novo no próximo Rodar IA)
  const why = semLogin(out)
    ? 'Falhou: Claude Code do terminal sem login (`claude` → `/login`).'
    : `Terminou sem mudar o status (código ${r.status}). ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}`;
  addComment(t.path, 'heartbeat', why, 'revisar');
  AT.terminar(at.id, 'erro', { erro: why, ...fimDe(r) });
  if (r.status !== 0) updateTask(t.path, { status: 'todo' }, `${today()} · heartbeat · falhou (código ${r.status}); voltou para todo`);
}

// Rodando dentro de outra sessão do Claude (app desktop, preview), as variáveis dela confundem o claude filho.
function cleanEnv() {
  if (!process.env.CLAUDE_CODE_ENTRYPOINT && !process.env.CLAUDECODE) return process.env;
  return Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK_|CLAUDE_PID$|CLAUDE_EFFORT$|ANTHROPIC_BASE_URL$)/.test(k)));
}

// ---------- fila de fichas (040 E) ----------
async function runFichas(slug, filaAt = null) {
  const rodada = RUN ? marcarRodando(slug) : listarPedidos(slug).map(({ comp, pedido }) => ({ comp, itens: pedido.itens, reanalisar: !!pedido.reanalisar, requestedAt: pedido.requestedAt }));
  const n = rodada.reduce((a, r) => a + r.itens.length, 0);
  if (!n) { log(`fila de fichas da ${slug} vazia`); semNada(filaAt, 'A fila de fichas já estava vazia'); return; }
  const inicio = new Date().toISOString();
  const fichasAllowed = [...ALLOWED, 'Bash(npm run fichas *)', 'Bash(npm run validate)', 'Bash(node tools/fichas-fila.mjs *)'];
  const cli = ['-p', '--permission-mode', PERMISSION, '--allowedTools', ...fichasAllowed, '--', promptFila(slug, rodada)];
  if (!RUN) { log(`[simulação] rodaria a fila de fichas da ${slug} (${n} item(ns))`); return; }
  const at = AT.comecar(filaAt, { slug, tipo: 'ia', fonte: 'fichas', titulo: `Análise de ${n} conteúdo(s) de concorrentes`, agente: 'orquestrador', passo: 'Abrindo o Claude Code', link: `/p/${slug}/concorrentes/conteudos` });
  writeLock({ slug, kind: 'fichas', title: `Fila de fichas · ${n} conteúdo(s)`, who: 'ai', atividade: at.id });
  escreverProgresso(slug, 'Abrindo o Claude Code');
  log(`fila de fichas → ${slug}: ${rodada.map((r) => `${r.comp} (${r.itens.join(', ')})`).join(' · ')}`);
  const r = await claudeNoDock(cli, { at, agente: 'orquestrador', rotulo: 'fichas' });
  const out = r.saida;
  const erro = semLogin(out) ? 'Claude Code do terminal sem login (abra um terminal: claude → /login).'
    : r.status !== 0 ? `O Claude saiu com código ${r.status}. ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}` : null;
  const res = fechar(slug, { erro, inicio, rodada });
  log(`fila de fichas: ${res.feitos.length} analisado(s), ${res.restantes.length} continuam na fila${erro ? ` · ${erro}` : ''}`);
  const resumo = `${res.feitos.length} analisado(s)${res.restantes.length ? `, ${res.restantes.length} continuam na fila` : ''}`;
  AT.terminar(at.id, erro ? 'erro' : 'feito', { resumo, erro, ...fimDe(r) });
}

// ---------- pesquisa de ideias (041 F3) ----------
async function runPesquisa(slug, round, filaAt = null) {
  const pedido = PQ.lerPedido(slug, round);
  if (!pedido) { log(`rodada ${round} não existe em ${slug}`); semNada(filaAt, 'A rodada não existe mais'); return; }
  if (pedido.status === 'feito') { log(`rodada ${round} já está feita`); semNada(filaAt, 'A rodada já estava feita'); return; }
  const allowed = [...ALLOWED, 'Bash(npm run curadoria *)', 'Bash(npm run validate)'];
  const cli = ['-p', '--permission-mode', PERMISSION, '--allowedTools', ...allowed, '--', PQ.promptPesquisa(slug, round)];
  if (!RUN) { log(`[simulação] rodaria a pesquisa ${round} da ${slug}`); return; }
  const inicio = new Date().toISOString();
  const at = AT.comecar(filaAt, { slug, tipo: 'ia', fonte: 'pesquisa', titulo: `Pesquisa de ideias · ${round}`, agente: 'pesquisador', passo: 'Abrindo o Claude Code', link: `/p/${slug}/ideias/pesquisas/${round}`, ref: round });
  writeLock({ slug, kind: 'pesquisa', round, title: `Pesquisa de ideias · ${round}`, who: 'ai', atividade: at.id });
  PQ.marcarPedido(slug, round, 'rodando');
  log(`pesquisa de ideias → ${slug}/${round}`);
  const r = await claudeNoDock(cli, { at, agente: 'pesquisador', rotulo: 'pesquisa' });
  const out = r.saida;
  const erro = semLogin(out) ? 'Claude Code do terminal sem login (abra um terminal: claude → /login).'
    : r.status !== 0 ? `O Claude saiu com código ${r.status}. ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}` : null;
  const res = PQ.fechar(slug, round, { erro, inicio });
  log(`pesquisa ${round}: ${res.feita ? 'feita' : `não terminou${res.erro ? ` · ${res.erro}` : ''}`}`);
  AT.terminar(at.id, res.feita ? 'feito' : 'erro', res.feita ? { resumo: 'Pesquisa pronta', ...fimDe(r) } : { erro: res.erro ?? erro ?? 'A pesquisa não terminou.', ...fimDe(r) });
}

// ---------- pedido avulso do app (046 D) ----------
async function runPedido(id, filaAt = null) {
  const p = PI.ler(id);
  if (!p) { log(`pedido ${id} não existe`); semNada(filaAt, 'O pedido não existe mais'); return; }
  if (p.status !== 'fila') { log(`pedido ${id} já está ${p.status}`); semNada(filaAt, `O pedido já estava ${p.status}`); return; }
  const agent = p.agente?.startsWith('agent:') ? p.agente.slice(6) : null;
  const cli = ['-p', ...(agent ? ['--agent', agent] : []), '--permission-mode', PERMISSION, '--allowedTools', ...ALLOWED, ...(p.allowed ?? []), ...(p.disallowed?.length ? ['--disallowedTools', ...p.disallowed] : []), '--', p.prompt];
  if (!RUN) { log(`[simulação] rodaria o pedido ${id} (${p.titulo})`); return; }
  const at = AT.comecar(filaAt, { slug: p.slug, tipo: 'ia', fonte: p.tipo, titulo: p.titulo, agente: p.agente, passo: 'Abrindo o Claude Code', link: p.link, ref: p.ref });
  PI.atualizar(id, { status: 'rodando', inicio: new Date().toISOString(), atividade: at.id });
  writeLock({ slug: p.slug, kind: 'pedido', pedido: id, title: p.titulo, who: agent ? p.agente : 'ai', atividade: at.id });
  log(`pedido ${p.tipo} → ${p.slug}: ${p.titulo}`);
  // HUB_PEDIDO_IA: ferramentas que gravam dados (insumos.mjs) sabem que é a IA do app e recusam mexer no que é do Oliver
  const r = await claudeNoDock(cli, { at, agente: p.agente, rotulo: p.tipo, env: { HUB_PEDIDO_IA: '1' } });
  const out = r.saida;
  const erro = semLogin(out) ? 'Claude Code do terminal sem login (abra um terminal: claude → /login).'
    : r.status !== 0 ? `O Claude saiu com código ${r.status}. ${out.trim().split('\n').slice(-2).join(' · ').slice(0, 200)}` : null;
  const res = PI.fechar(id, { erro, saida: erro ? '' : r.texto ?? '' });
  log(`pedido ${id}: ${res.resumo ?? ''}${erro ? ` · ${erro}` : ''}`);
  AT.terminar(at.id, erro ? 'erro' : 'feito', { resumo: res.resumo, erro, ...fimDe(r) });
}

// ---------- fila da IA (046 F) ----------
/** a vez chegou e não havia o que fazer: a atividade que esperava na fila fecha sem pedir atenção */
function semNada(filaAt, resumo) { if (filaAt) AT.terminar(filaAt, 'feito', { resumo, visto: true }); }

/** um trabalho: `job` = { kind: quadro | fichas | pesquisa | pedido, slug, task, max, agent, round, pedido }; `filaAt` = atividade da fila */
async function rodarJob(job, filaAt = null) {
  try {
    if (job.kind === 'pedido') return await runPedido(job.pedido, filaAt);
    if (!job.slug && job.kind !== 'quadro') { log(`--${job.kind} precisa de --slug`); return; }
    if (job.kind === 'pesquisa') return await runPesquisa(job.slug, job.round, filaAt);
    if (job.kind === 'fichas') return await runFichas(job.slug, filaAt);
    const slugs = job.slug ? [job.slug] : companies();
    if (!job.task) for (const s of slugs) createRecurring(s);
    const ready = slugs.flatMap((s) => readyTasks(s, job)).slice(0, job.max ?? 1);
    if (!ready.length) { log('nenhuma tarefa pronta para agentes'); semNada(filaAt, 'Nenhuma tarefa pronta quando chegou a vez'); }
    for (const [i, t] of ready.entries()) await wake(t, i === 0 ? filaAt : null);
  } catch (e) {
    log(`⚠ ${job.kind}: ${e.message}`);
    if (filaAt) AT.terminar(filaAt, 'erro', { erro: e.message }); // se já virou "rodando", fecha do mesmo jeito
  } finally { if (RUN) writeLock({}); } // entre um trabalho e outro o lock continua nosso, sem os dados do anterior
}

// ---------- batida ----------
const LOCK = 'logs/heartbeat/.lock';
const STARTED = new Date().toISOString();
const writeLock = (extra) => writeFileSync(LOCK, JSON.stringify({ pid: process.pid, started: Object.keys(extra).length ? new Date().toISOString() : STARTED, log: LOG, ...extra }));
const vivo = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };

/** pega o lock sem corrida (flag wx); lock de processo morto ou sem toque há 2 h é velho e sai */
function pegarLock() {
  for (let i = 0; i < 2; i++) {
    try { writeFileSync(LOCK, JSON.stringify({ pid: process.pid, started: STARTED, log: LOG }), { flag: 'wx' }); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; }
    let pid = null;
    try { const l = JSON.parse(readFileSync(LOCK, 'utf8')); pid = typeof l === 'number' ? l : l?.pid; } catch { /* sendo escrito agora */ }
    let mtime = Date.now();
    try { mtime = statSync(LOCK).mtimeMs; } catch { continue; } // sumiu entre uma olhada e outra: tenta de novo
    if (pid === process.pid) return true;
    if (pid && vivo(pid) && Date.now() - mtime < 2 * 3600e3) return false;
    if (!pid && Date.now() - mtime < 60e3) return false;
    rmSync(LOCK, { force: true });
  }
  return false;
}
function soltarLock() {
  try { const l = JSON.parse(readFileSync(LOCK, 'utf8')); if (l?.pid === process.pid) unlinkSync(LOCK); } catch { /* já saiu (Parar) */ }
}

/** trabalho pedido na linha de comando (sem --fila); null = só esvaziar a fila */
const JOB = PEDIDO ? { kind: 'pedido', pedido: PEDIDO }
  : PESQUISA ? { kind: 'pesquisa', slug: ONLY_SLUG, round: PESQUISA }
  : FICHAS ? { kind: 'fichas', slug: ONLY_SLUG }
  : FILA_SO ? null
  : { kind: 'quadro', slug: ONLY_SLUG, task: ONLY_TASK, agent: ONLY_AGENT, max: MAX };

let batendo = false;
async function beat(primeiro) {
  if (batendo) return; // --watch: a batida anterior ainda roda
  if (!RUN) {
    if (primeiro) await rodarJob(primeiro);
    const fila = FILA.listar();
    if (fila.length) log(`[simulação] fila da IA: ${fila.map((e) => e.titulo).join(' · ')}`);
    return;
  }
  batendo = true;
  try {
    for (;;) {
      if (!pegarLock()) {
        // ocupado: um trabalho pedido à mão (tarefa, fichas, pesquisa, pedido) entra na fila; a batida que roda pega depois
        if (primeiro && (primeiro.kind !== 'quadro' || primeiro.task)) {
          const r = FILA.entrar(primeiro, chaveDe(primeiro), { titulo: tituloDe(primeiro), fonte: primeiro.kind === 'pedido' ? 'pedido' : primeiro.kind, agente: null });
          log(`IA ocupada: ${tituloDe(primeiro)} ${r.ja ? 'já estava' : 'entrou'} na fila (${r.posicao}º)`);
        } else log('outra batida em andamento; ela roda a fila');
        return;
      }
      try {
        if (primeiro) await rodarJob(primeiro);
        primeiro = null;
        for (let e; (e = FILA.proxima());) { log(`fila: vez de ${e.titulo}`); await rodarJob(e.job, e.atividade); }
      } finally { soltarLock(); }
      if (!FILA.listar().length) return; // alguém entrou entre a última olhada e a soltura do lock: mais uma volta
    }
  } finally { batendo = false; }
}
const chaveDe = (j) => (j.kind === 'pedido' ? `pedido:${j.pedido}` : j.kind === 'pesquisa' ? `pesquisa:${j.slug}:${j.round}` : j.kind === 'fichas' ? `fichas:${j.slug}` : `quadro:${j.slug}:${j.task ?? '*'}`);
const tituloDe = (j) => (j.kind === 'pedido' ? (PI.ler(j.pedido)?.titulo ?? `Pedido ${j.pedido}`) : j.kind === 'pesquisa' ? `Pesquisa de ideias · ${j.round}` : j.kind === 'fichas' ? 'Fila de fichas' : `Tarefa ${j.task}`);

await beat(JOB);
if (WATCH > 0) { log(`watch: nova batida a cada ${WATCH} min (Ctrl+C para parar)`); setInterval(() => beat(JOB), WATCH * 60e3); }

