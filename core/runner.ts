// Botão "Rodar IA" do quadro: dispara o Claude Code nas tarefas prontas (A fazer · de IA · dependências feitas).
// Dois jeitos: em segundo plano (tools/heartbeat.mjs --run, o mesmo do agendamento) ou numa janela de terminal
// interativa (o Oliver acompanha e responde). Estado = o lock do heartbeat (logs/heartbeat/.lock); nada de banco.
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { listTasks, commentTask, ValidationError, ROOT } from './store';
import { fechar } from '../tools/lib/fichas-fila.mjs';
import * as PQ from '../tools/lib/pesquisa.mjs';
import * as AT from '../tools/lib/atividade.mjs';
import * as PI from '../tools/lib/pedidos-ia.mjs';
import * as FILA from '../tools/lib/fila-ia.mjs';
import type { JobFila } from '../tools/lib/fila-ia.mjs';

const LOCK = join(ROOT, 'logs/heartbeat/.lock');
const isAi = (a: string) => a === 'ai' || a.startsWith('agent:');

/** `kind: 'fichas'` = fila de fichas da 040 (Concorrentes → Conteúdos → Analisar); `'pesquisa'` = rodada de pesquisa de ideias da 041 (`round`); `'pedido'` = pedido avulso do app (046 D, `pedido`); sem kind = tarefa do quadro */
export interface Lock { pid: number; started: string; log?: string; slug?: string; task?: string; title?: string; who?: string; kind?: 'fichas' | 'pesquisa' | 'pedido'; round?: string; pedido?: string; atividade?: string }

// App aberto de dentro de outra sessão do Claude (desktop, preview): as variáveis dela confundem o claude filho.
const cleanEnv = () => (process.env.CLAUDE_CODE_ENTRYPOINT || process.env.CLAUDECODE
  ? Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK_|CLAUDE_PID$|CLAUDE_EFFORT$|ANTHROPIC_BASE_URL$)/.test(k)))
  : process.env);

const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch (e) { return (e as NodeJS.ErrnoException).code === 'EPERM'; } };
export function readLock(): Lock | null {
  if (!existsSync(LOCK)) return null;
  try {
    const raw = readFileSync(LOCK, 'utf8').trim();
    const l: Lock = raw.startsWith('{') ? JSON.parse(raw) : { pid: Number(raw), started: '' }; // lock antigo = só o pid
    if (!l.pid || !alive(l.pid)) { rmSync(LOCK, { force: true }); return null; } // processo morreu: lock velho
    return l;
  } catch { return null; }
}

/** Prontas = A fazer, de IA, com todas as dependências feitas (mesma regra do heartbeat). */
export function readyTasks(slug: string) {
  const tasks = listTasks(slug);
  const done = new Set(tasks.filter((t) => t.data.status === 'done').map((t) => t.data.id));
  const rank = { alta: 0, media: 1, baixa: 2 } as const;
  return tasks.filter((t) => t.data.status === 'todo' && isAi(t.data.assignee) && t.data.depends.every((d) => done.has(d)))
    .sort((a, b) => rank[a.data.priority] - rank[b.data.priority] || a.data.id.localeCompare(b.data.id))
    .map((t) => ({ id: t.data.id, title: t.data.title, assignee: t.data.assignee }));
}

function tail(file: string | undefined, n = 40) {
  if (!file) return [];
  const f = join(ROOT, file);
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').replace(/\x1b\[[0-9;]*m/g, '').split(/\r?\n/).filter(Boolean).slice(-n);
}

export function runnerStatus(slug: string) {
  const l = readLock();
  return {
    running: !!l,
    pid: l?.pid ?? null,
    started: l?.started ?? null,
    task: l?.slug === slug ? l.task ?? null : null,
    title: l?.slug === slug ? l.title ?? null : null,
    who: l?.who ?? null,
    kind: l?.kind ?? null,
    otherProject: l?.slug && l.slug !== slug ? l.slug : null,
    ready: readyTasks(slug),
    /** fila da IA (046 F), na ordem em que vai rodar; a do quadro desta empresa diz qual tarefa */
    fila: FILA.listar().map((e, i) => ({ posicao: i + 1, titulo: e.titulo, atividade: e.atividade, slug: e.job.slug, kind: e.job.kind, task: e.job.task ?? null })),
    log: tail(l?.log ?? `logs/heartbeat/${new Date().toISOString().slice(0, 10)}.log`),
  };
}

export function runAi(slug: string, opts: { mode?: 'background' | 'terminal'; max?: number; task?: string } = {}) {
  const ready = readyTasks(slug);
  if (opts.task && !ready.some((t) => t.id === opts.task))
    throw new ValidationError(opts.task, ['a tarefa não está pronta para a IA: precisa estar em "A fazer", com responsável IA/agente e dependências feitas']);
  if (!ready.length) throw new ValidationError(slug, ['nenhuma tarefa pronta: mova para "A fazer" uma tarefa da IA']);

  if (opts.mode === 'terminal') {
    const alvo = opts.task ? `a tarefa ${opts.task}` : `as tarefas prontas do quadro da ${slug} (${ready.map((t) => t.id).join(', ')}), uma por vez`;
    const prompt = `Use a skill orquestrar e execute ${alvo}. Registre no card (comentário) o que fez e o que eu preciso revisar.`;
    openTerminal(prompt);
    return { started: true, mode: 'terminal' as const };
  }

  const l = readLock();
  if (opts.task && l?.slug === slug && l.task === opts.task) throw new ValidationError('heartbeat', [`a IA já está rodando ${opts.task}`]);
  const t = opts.task ? ready.find((x) => x.id === opts.task)! : null;
  const max = opts.task ? 1 : Math.max(1, Math.min(10, opts.max ?? ready.length));
  const fila = naFila({ kind: 'quadro', slug, max, ...(t ? { task: t.id } : {}) }, `quadro:${slug}:${t?.id ?? '*'}`, {
    titulo: t ? `${t.id} · ${t.title}` : `Rodar IA · ${Math.min(max, ready.length)} tarefa(s) do quadro`, fonte: 'quadro',
    agente: t ? (t.assignee === 'ai' ? 'orquestrador' : t.assignee) : 'orquestrador', link: `/p/${slug}/quadro${t ? `?t=${t.id}` : ''}`, ref: t?.id ?? null,
  });
  return { started: true, mode: 'background' as const, fila };
}

// ---------- fila da IA (046 F) ----------
let ultimoChute = 0;
/** chama o heartbeat para esvaziar a fila (o que já roda pega a entrada nova sozinho; um a mais só confere e sai) */
export function chutarFila(forcar = false) {
  if (!forcar && Date.now() - ultimoChute < 15_000) return false; // o último chute ainda está abrindo (WMI leva 1–2 s)
  ultimoChute = Date.now();
  mkdirSync(join(ROOT, 'logs/heartbeat'), { recursive: true });
  soltar(['tools/heartbeat.mjs', '--run', '--fila']);
  return true;
}

/** a fila travou (heartbeat morto, app reiniciado no meio): sem lock e com entrada esperando há mais de 20 s, chama de novo */
export function conferirFila() {
  const fila = FILA.listar();
  if (!fila.length || readLock()) return;
  if (Date.now() - Date.parse(fila[0].criado) > 20_000) chutarFila();
}

/**
 * IA uma por vez: todo disparo de IA em segundo plano entra na fila e chama o heartbeat. Livre = começa em 1–2 s; ocupada =
 * espera a vez e roda sozinha quando a anterior acabar (sob o clique, nada agendado). `ocupado` = o que roda agora.
 */
export function naFila(job: JobFila, chave: string, meta: Parameters<typeof FILA.entrar>[2]) {
  const r = FILA.entrar(job, chave, meta);
  const l = readLock();
  if (!l) chutarFila(true);
  return { posicao: r.posicao, ja: r.ja, atividade: r.entrada.atividade, ocupado: l ? (l.title ?? l.task ?? 'outro trabalho') : null };
}
export type NaFila = ReturnType<typeof naFila>;

/** posição na fila de quem espera (pela atividade); null = não está esperando */
export const posicaoNaFila = (atividade: string | null | undefined) => (atividade ? FILA.posicao((e) => e.atividade === atividade) : null);
export const filaPor = (pred: (j: JobFila) => boolean) => FILA.listar().find((e) => pred(e.job)) ?? null;

/** tira da fila (antes de começar) e arruma o que é de cada tipo: o pedido avulso fecha como parado (a análise volta a pendente) */
export function tirarDaFila(atividade: string) {
  const e = FILA.listar().find((x) => x.atividade === atividade);
  if (!e) return null;
  const tirada = FILA.tirar(e.id);
  if (tirada?.job.kind === 'pedido' && tirada.job.pedido) PI.fechar(tirada.job.pedido, { parado: true });
  return tirada;
}

/** Parar: mata o heartbeat e o Claude que ele abriu; a tarefa volta para "A fazer" com um comentário. */
export function stopAi(slug: string) {
  const l = readLock();
  if (!l) return { stopped: false };
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(l.pid), '/t', '/f'], { windowsHide: true });
  else { try { process.kill(-l.pid, 'SIGTERM'); } catch { try { process.kill(l.pid, 'SIGTERM'); } catch { /* já saiu */ } } }
  rmSync(LOCK, { force: true });
  if (l.atividade) AT.terminar(l.atividade, 'parado', { resumo: 'Parado por você' });
  if (l.kind === 'fichas' && l.slug) fechar(l.slug, { parado: true, inicio: l.started }); // o que já foi salvo sai da fila; o resto volta a pendente
  if (l.kind === 'pesquisa' && l.slug && l.round) PQ.fechar(l.slug, l.round, { parado: true, inicio: l.started }); // a rodada volta a pendente (dá para rodar de novo)
  if (l.kind === 'pedido' && l.pedido) PI.fechar(l.pedido, { parado: true });
  if (l.task && l.slug === slug) {
    const t = listTasks(slug).find((x) => x.data.id === l.task);
    if (t?.data.status === 'doing') commentTask(slug, l.task, { text: 'Execução parada pelo Oliver no app; voltou para "A fazer".', who: 'oliver', status: 'todo' });
  }
  if (FILA.listar().length) chutarFila(true); // parar é só este: o próximo da fila começa
  return { stopped: true };
}

/** Fila de fichas (040 E): o mesmo heartbeat, em segundo plano, com `--fichas` (um `claude -p` para a fila inteira). */
export function runFichas(slug: string) {
  const fila = naFila({ kind: 'fichas', slug }, `fichas:${slug}`, { titulo: 'Análise de conteúdos de concorrentes', fonte: 'fichas', agente: 'orquestrador', link: `/p/${slug}/concorrentes/conteudos` });
  return { started: true, fila };
}

/** Pesquisa de ideias (041 F3): o mesmo heartbeat, em segundo plano, com `--pesquisa <rodada>` (um `claude -p` para a rodada inteira). */
export function runPesquisa(slug: string, round: string, mode: 'background' | 'terminal' = 'background') {
  if (mode === 'terminal') {
    // janela interativa: o Oliver acompanha; o pedido fica "rodando" até o resultado.json aparecer (o app confere pelos arquivos)
    openTerminal(PQ.promptPesquisa(slug, round, { interativo: true }));
    return { started: true, mode };
  }
  const fila = naFila({ kind: 'pesquisa', slug, round }, `pesquisa:${slug}:${round}`, { titulo: `Pesquisa de ideias · ${round}`, fonte: 'pesquisa', agente: 'pesquisador', link: `/p/${slug}/ideias/pesquisas/${round}`, ref: round });
  return { started: true, mode, fila };
}

/**
 * Pedido avulso do app (046 D): grava em logs/pedidos-ia/ e dispara o heartbeat com `--pedido` (mesmo lock, dock e passos).
 * `terminal` = janela interativa com o mesmo prompt (o app não acompanha: fase E). `antes` roda só se o disparo for aceito.
 */
export function runPedido(p: Parameters<typeof PI.criar>[0], mode: 'background' | 'terminal' = 'background', antes?: () => void) {
  if (mode === 'terminal') { openTerminal(p.prompt); return { started: true, mode, pedido: null }; }
  const job = PI.criar(p);
  antes?.();
  const fila = naFila({ kind: 'pedido', slug: p.slug, pedido: job.id }, `pedido:${job.id}`, { titulo: job.titulo, fonte: job.tipo, agente: job.agente, link: job.link, ref: job.ref });
  PI.atualizar(job.id, { fila: fila.atividade });
  return { started: true, mode, pedido: PI.ler(job.id), fila };
}

/**
 * Dispara o heartbeat em segundo plano, solto do app (046 B). No Windows, um filho comum morre junto quando o terminal do
 * app fecha ou o servidor reinicia (código 0xC000013A, 2 de 6 rodadas de fichas em 2026-10-08): criado pelo WMI, o processo
 * nasce fora da árvore e do job do app, com o ambiente do usuário (sem as variáveis da sessão do Claude que abriu o app).
 * Com HUB_ROOT (cópia de teste) ou se o WMI falhar, cai no spawn destacado de antes.
 */
export function soltar(args: string[]) {
  if (process.platform === 'win32' && !process.env.HUB_ROOT) {
    const linha = [process.execPath, ...args].map((a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '')}"` : a)).join(' ');
    const sq = (s: string) => s.replace(/'/g, "''"); // aspas simples do PowerShell
    const ps = `$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '${sq(linha)}'; CurrentDirectory = '${sq(ROOT)}' }; exit $r.ReturnValue`;
    const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], { windowsHide: true, timeout: 20000 });
    if (r.status === 0) return;
    console.error(`[runner] WMI falhou (${r.status}); usando spawn: ${String(r.stderr ?? '').slice(0, 200)}`);
  }
  spawn(process.execPath, args, { cwd: ROOT, detached: true, stdio: 'ignore', windowsHide: true, env: cleanEnv() }).unref();
}

export function openTerminal(prompt: string) {
  const p = prompt.replace(/"/g, "'");
  if (process.platform === 'win32') {
    // Um .cmd em logs/ (fora do git) evita o inferno de aspas do cmd; a janela fica aberta (cmd /k) ao sair do claude.
    const file = join(ROOT, 'logs', 'abrir-ia.cmd');
    mkdirSync(join(ROOT, 'logs'), { recursive: true });
    writeFileSync(file, ['@echo off', `cd /d "${ROOT}"`, 'title Hub - IA', `claude "${p.replace(/%/g, '%%')}"`, ''].join('\r\n'));
    spawn('cmd.exe', ['/c', `start "Hub - IA" cmd /k "${file}"`], { cwd: ROOT, detached: true, stdio: 'ignore', windowsVerbatimArguments: true, env: cleanEnv() }).unref();
  } else if (process.platform === 'darwin') {
    const cmd = `cd ${JSON.stringify(ROOT)} && claude ${JSON.stringify(p)}`;
    spawn('osascript', ['-e', `tell application "Terminal" to do script ${JSON.stringify(cmd)}`, '-e', 'tell application "Terminal" to activate'], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn('x-terminal-emulator', ['-e', 'bash', '-lc', `cd ${JSON.stringify(ROOT)} && claude ${JSON.stringify(p)}; exec bash`], { detached: true, stdio: 'ignore' }).unref();
  }
}
