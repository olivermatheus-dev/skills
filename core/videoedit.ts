// Ajustes diretos no vídeo pelo app (tarefa 022 fase C): volume por faixa e por evento, duração e texto de cena,
// e "Gerar prévia" (sfx → mix → produce --draft). Tudo passa pelo mesmo núcleo da linha de comando
// (tools/video/timeline.mjs e os scripts do kit), que é o do futuro MCP de edição (009). Rotas em app/server/handler.ts.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile, execFileSync, spawn } from 'node:child_process';
import { ROOT, ValidationError } from './store';
import { Slug } from '../schema';

function pasta(slug: string, path: string) {
  if (!Slug.safeParse(slug).success) throw new ValidationError(slug, ['slug inválido']);
  if (!path || /(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(path)) throw new ValidationError(path, ['caminho da peça inválido']);
  const dir = join(ROOT, 'companies', slug, 'contents', path);
  if (!existsSync(join(dir, 'timeline.json'))) throw new ValidationError(dir, ['peça sem timeline.json']);
  return dir;
}
const lerTimeline = (dir: string) => JSON.parse(readFileSync(join(dir, 'timeline.json'), 'utf8'));
const node = (args: string[]) => new Promise<{ out: string; code: number }>((ok) => {
  execFile(process.execPath, args, { cwd: ROOT, maxBuffer: 16 << 20, env: { ...process.env, HUB_ROOT: ROOT } },
    (e, out, err) => ok({ out: `${out}${err}`.trim(), code: e ? (typeof e.code === 'number' ? e.code : 1) : 0 }));
});

export type Ajuste =
  | { op: 'volume'; alvo: string; db: number } // alvo: voz | trilha | efeitos | id de evento
  | { op: 'duracao'; cena: string; s: number }
  | { op: 'texto'; cena: string; texto: string };

/** aplica um ajuste na timeline.json; devolve a timeline nova e a saída do comando (avisos de leitura, silêncio etc.) */
export async function ajustar(slug: string, path: string, a: Ajuste) {
  const dir = pasta(slug, path);
  if (jobs.get(chave(slug, path))?.estado === 'rodando') throw new ValidationError(dir, ['a prévia está sendo gerada: espere terminar']);
  const id = /^[\w-]+$/;
  let args: string[];
  if (a?.op === 'volume' && id.test(a.alvo) && Number.isFinite(+a.db)) args = ['vol', dir, a.alvo, String(+a.db)];
  else if (a?.op === 'duracao' && id.test(a.cena) && +a.s > 0 && +a.s <= 120) args = ['dur', dir, a.cena, String(+a.s)];
  else if (a?.op === 'texto' && id.test(a.cena) && typeof a.texto === 'string') args = ['text', dir, a.cena, a.texto];
  else throw new ValidationError(dir, ['ajuste inválido']);
  const r = await node(['tools/video/timeline.mjs', ...args]);
  // `dur` sai com código 1 quando o check acusa algo: a mudança foi gravada, o aviso vai junto
  if (r.code && a.op !== 'duracao') throw new ValidationError(dir, [r.out.split('\n').pop() || 'ajuste falhou']);
  return { saida: r.out, timeline: lerTimeline(dir) };
}

// ---------- prévia (um job por peça, em memória) ----------
type Job = { estado: 'rodando' | 'ok' | 'erro'; passo: string; passos: string[]; formato: string; log: string[]; inicio: string; fim?: string; arquivo?: string; erro?: string };
const jobs = new Map<string, Job>();
const chave = (slug: string, path: string) => `${slug}/${path}`;
const KIT = 'tools/video-kit/scripts';

function duracao(f: string) {
  try { return +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim(); } catch { return 0; }
}

export function previaStatus(slug: string, path: string) {
  pasta(slug, path);
  return jobs.get(chave(slug, path)) ?? null;
}

/** sfx → mix → produce --draft --only=<formato> (+ music.mjs antes, se a trilha sintetizada ficou mais curta que o vídeo) */
export function gerarPrevia(slug: string, path: string, b: { formato?: string }) {
  const dir = pasta(slug, path);
  const k = chave(slug, path);
  if (jobs.get(k)?.estado === 'rodando') return jobs.get(k)!;
  const tl = lerTimeline(dir);
  const formato = b?.formato && /^\d+x\d+$/.test(b.formato) ? b.formato : (tl.formats?.[0] ?? '9x16');
  const passos: [string, string[]][] = [];
  const musica = join(dir, 'audio', 'music.wav');
  if (tl.music?.synth && (!existsSync(musica) || duracao(musica) < (tl.duration ?? 0) + 0.5)) passos.push(['trilha', [`${KIT}/music.mjs`, dir]]);
  if (tl.sfx?.length) passos.push(['efeitos', [`${KIT}/sfx.mjs`, dir]]);
  passos.push(['mix', [`${KIT}/mix.mjs`, dir]]);
  passos.push(['vídeo', [`${KIT}/produce.mjs`, dir, '--draft', `--only=${formato}`]]);

  const job: Job = { estado: 'rodando', passo: passos[0][0], passos: passos.map((p) => p[0]), formato, log: [], inicio: new Date().toISOString() };
  jobs.set(k, job);
  const push = (s: string) => { for (const l of s.split(/\r?\n|\r/)) if (l.trim()) job.log.push(l.trimEnd()); if (job.log.length > 200) job.log.splice(0, job.log.length - 200); };
  const next = (i: number) => {
    if (i >= passos.length) {
      job.estado = 'ok'; job.fim = new Date().toISOString();
      job.arquivo = `${dir.split(/[\\/]/).pop()}-${formato}-rascunho.mp4`;
      return;
    }
    job.passo = passos[i][0];
    push(`── ${job.passo}`);
    const p = spawn(process.execPath, passos[i][1], { cwd: ROOT, env: { ...process.env, HUB_ROOT: ROOT, FORCE_COLOR: '0' } });
    p.stdout.on('data', (d) => push(String(d)));
    p.stderr.on('data', (d) => push(String(d)));
    p.on('error', (e) => { job.estado = 'erro'; job.erro = e.message; job.fim = new Date().toISOString(); });
    p.on('close', (code) => {
      if (job.estado !== 'rodando') return;
      if (code) { job.estado = 'erro'; job.erro = `${job.passo}: ${job.log.filter((l) => !l.startsWith('──')).at(-1) ?? `código ${code}`}`; job.fim = new Date().toISOString(); return; }
      next(i + 1);
    });
  };
  next(0);
  return job;
}
