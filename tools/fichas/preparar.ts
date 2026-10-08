// Preparo barato de UM item (tarefa 040, fase B): sem LLM.
//   legenda automática do YouTube (se houver) → senão áudio (ffmpeg mono 16 kHz) → faster-whisper local (small, pt)
//   quadros-chave (0 · 0,5 · 1,5 · 3 · 5 s + meio + último + cortes de cena dos 5 s iniciais) a 540 px
//   hash de idempotência; o vídeo é apagado depois de extrair áudio e quadros (decisão do Oliver).
// Pesados em data/intel/<empresa>/<concorrente>/<plataforma>__<id>/ (fora do git); a transcrição vai para dentro da ficha.
import { execFileSync, spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Ficha, FichaInsumos } from '../../schema/ficha';
import { realRunner } from '../intel/runner';
import { compDir, dadosDir, findItem, hashEntrada, limparLegenda, nowIso, readFicha, sha1, writeFicha } from './lib';
import { medidasDe, novaFicha } from './medidas';
import { baixarTiktokDireto } from './tiktok';

const PY_SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'transcrever.py');
const MODELO = 'small';
/** o cliente web do YouTube hoje devolve 'The page needs to be reloaded' (SABR): android_vr e tv funcionam (yt-dlp 2025.10) */
const YT_ARGS = ['--extractor-args', 'youtube:player_client=android_vr,tv,web'];
const argsDe = (plataforma: string) => (plataforma === 'youtube' ? YT_ARGS : []);

/** Python real (mesma regra do video-kit): $PYTHON → o que o shell acha → 'python'. No Windows, 'python' direto cai no atalho da Microsoft Store. */
let pyPath: string | undefined;
function python(): string {
  if (pyPath) return pyPath;
  if (process.env.PYTHON) return (pyPath = process.env.PYTHON);
  try {
    const exe = execFileSync('python -c "import sys; print(sys.executable)"', { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (exe && existsSync(exe)) return (pyPath = exe);
  } catch { /* cai no padrão */ }
  return (pyPath = 'python');
}

function exec(cmd: string, args: string[], timeoutMs = 300_000): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const c = spawn(cmd, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf8' } });
    let stdout = '', stderr = '';
    const t = setTimeout(() => { c.kill(); reject(new Error(`${cmd} passou de ${Math.round(timeoutMs / 1000)} s`)); }, timeoutMs);
    c.stdout.setEncoding('utf8').on('data', (d: string) => (stdout += d));
    c.stderr.setEncoding('utf8').on('data', (d: string) => (stderr += d));
    c.on('error', (e: NodeJS.ErrnoException) => { clearTimeout(t); reject(e.code === 'ENOENT' ? new Error(`${cmd} não encontrado no PATH`) : e); });
    c.on('close', (code) => { clearTimeout(t); resolve({ code: code ?? 1, stdout, stderr }); });
  });
}
const secs = (t0: number) => Math.round((Date.now() - t0) / 100) / 10;

/** legenda automática do YouTube (json3) → segmentos */
function lerLegendaYt(dir: string) {
  const f = ['pt-orig', 'pt', 'pt-BR'].map((l) => `legenda.${l}.json3`).find((x) => existsSync(join(dir, x)));
  if (!f) return null;
  const j = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[] };
  const segmentos = (j.events ?? []).flatMap((e) => {
    const texto = (e.segs ?? []).map((s) => s.utf8 ?? '').join('').replace(/\s+/g, ' ').trim();
    return texto && e.tStartMs != null ? [{ ini: e.tStartMs / 1000, fim: (e.tStartMs + (e.dDurationMs ?? 0)) / 1000, texto }] : [];
  });
  return segmentos.length ? { idioma: f.match(/legenda\.([\w-]+)\./)?.[1] ?? 'pt', segmentos } : null;
}

async function duracao(video: string): Promise<number | undefined> {
  const r = await exec('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', video], 30_000);
  const n = parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : undefined;
}
async function temAudio(video: string) {
  const r = await exec('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', video], 30_000);
  return r.stdout.trim().length > 0;
}
async function cortesDeCena(video: string): Promise<number[]> {
  const r = await exec('ffmpeg', ['-hide_banner', '-nostats', '-i', video, '-an', '-vf', "select='gt(scene,0.3)',showinfo", '-f', 'null', '-'], 120_000);
  return [...r.stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Math.round(parseFloat(m[1]) * 100) / 100);
}

/** instantes dos quadros: base do desenho + cortes de cena dos 5 s iniciais (até 3) */
export function instantesQuadros(dur: number, cortes: number[]): number[] {
  const max = Math.max(0, dur - 0.15);
  const base = [0, 0.5, 1.5, 3, 5, dur / 2, dur - 0.15].map((t) => Math.min(max, Math.max(0, t)));
  const out: number[] = [];
  for (const t of [...base].sort((a, b) => a - b)) if (!out.some((o) => Math.abs(o - t) < 0.3)) out.push(t);
  let extra = 0;
  for (const c of cortes) if (c > 0 && c <= 5 && extra < 3 && c <= max && !out.some((o) => Math.abs(o - c) < 0.4)) { out.push(c); extra++; }
  return out.sort((a, b) => a - b).map((t) => Math.round(t * 1000) / 1000);
}

export interface PrepResultado {
  key: string;
  estado: 'preparado' | 'pulado' | 'parcial' | 'erro';
  motivo?: string;
  segundos: number;
  fonteTexto?: string;
  palavras?: number;
  quadros?: number;
  cortes?: number;
  tempos?: FichaInsumos['tempos'];
  avisos: string[];
}

export async function preparar(slug: string, comp: string, key: string, opt: { reanalisar?: boolean } = {}): Promise<PrepResultado> {
  const t0 = Date.now();
  const avisos: string[] = [];
  const { snap, item, plataforma } = findItem(slug, comp, key);
  const antiga = readFicha(slug, comp, key);
  const he = hashEntrada(item);
  const ins0 = antiga?.insumos;
  if (!opt.reanalisar && ins0 && ins0.hashEntrada === he && ins0.quadros.length > 0 && !ins0.faltou.includes('midia-indisponivel')) {
    return { key, estado: 'pulado', motivo: 'insumos já preparados (mesmo hash); use --reanalisar para refazer', segundos: secs(t0), fonteTexto: ins0.transcricao?.fonte, avisos };
  }

  const dir = dadosDir(slug, comp, key);
  const qDir = join(dir, 'quadros');
  rmSync(qDir, { recursive: true, force: true });
  mkdirSync(qDir, { recursive: true });
  const faltou = new Set<FichaInsumos['faltou'][number]>();
  const tempos: NonNullable<FichaInsumos['tempos']> = { total: 0 };
  let transcricao: FichaInsumos['transcricao'];
  let quadros: FichaInsumos['quadros'] = [];
  let cenas: number[] | undefined;
  let dur: number | undefined = item.durationS ?? undefined;
  let bytesVideo: number | undefined;
  const ehVideo = item.type !== 'post' && item.type !== 'carrossel';

  // 1. legenda automática do YouTube
  if (plataforma === 'youtube') {
    // uma língua que dá 429 faz o yt-dlp sair com erro mesmo tendo baixado as outras: lê o que veio
    await realRunner.ytdlp([...YT_ARGS, '--skip-download', '--write-subs', '--write-auto-subs', '--sub-langs', 'pt-orig,pt,pt-BR', '--sub-format', 'json3', '--no-playlist', '-o', join(dir, 'legenda.%(ext)s'), item.url], { timeoutMs: 120_000 })
      .catch((e) => avisos.push(`legenda do YouTube: ${(e as Error).message}`));
    const l = lerLegendaYt(dir);
    if (l) transcricao = { fonte: 'yt-auto-subs', idioma: l.idioma, texto: l.segmentos.map((s) => s.texto).join(' '), segmentos: l.segmentos };
  }

  // 2. vídeo (uma vez só, em até 720p): serve para áudio, quadros e cortes
  let video: string | undefined;
  if (ehVideo) {
    const tb = Date.now();
    rmSync(join(dir, 'audio.wav'), { force: true });
    for (const f of existsSync(dir) ? readdirSync(dir) : []) if (/^video\./.test(f)) rmSync(join(dir, f), { force: true });
    try {
      await realRunner.ytdlp([...argsDe(plataforma), '-f', 'bv*[height<=720]+ba/b[height<=720]/b', '--merge-output-format', 'mp4', '--no-playlist', '-o', join(dir, 'video.%(ext)s'), item.url], { timeoutMs: 300_000 });
      const f = readdirSync(dir).find((x) => /^video\./.test(x));
      if (f) { video = join(dir, f); bytesVideo = statSync(video).size; }
    } catch (e) {
      const motivo = (e as Error).message;
      if (plataforma === 'tiktok') {
        // o extrator do yt-dlp quebrou: lê a página pública direto
        try { bytesVideo = await baixarTiktokDireto(item.url, join(dir, 'video.mp4')); video = join(dir, 'video.mp4'); avisos.push('TikTok baixado pela página pública (o extrator do yt-dlp está quebrado)'); }
        catch (e2) { avisos.push(`vídeo não baixou: ${(e2 as Error).message} (yt-dlp: ${motivo.slice(0, 80)})`); faltou.add('midia-indisponivel'); }
      } else { avisos.push(`vídeo não baixou: ${motivo}`); faltou.add('midia-indisponivel'); }
    }
    tempos.baixar = secs(tb);
  }

  if (video) {
    dur = (await duracao(video)) ?? dur;
    // 3. áudio → Whisper (só se a legenda do YouTube não veio)
    if (!transcricao) {
      const tt = Date.now();
      if (await temAudio(video)) {
        const wav = join(dir, 'audio.wav');
        const a = await exec('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-vn', '-ac', '1', '-ar', '16000', wav], 120_000);
        if (a.code !== 0 || !existsSync(wav)) { avisos.push(`ffmpeg não extraiu o áudio: ${a.stderr.slice(-200)}`); faltou.add('sem-transcricao'); }
        else {
          const out = join(dir, 'whisper.json');
          const r = await exec(python(), [PY_SCRIPT, wav, out, MODELO], 900_000).catch((e) => ({ code: 1, stdout: '', stderr: String(e.message) }));
          if (r.code !== 0 || !existsSync(out)) { avisos.push(`faster-whisper falhou (python -m pip install faster-whisper): ${r.stderr.trim().split('\n').at(-1)}`); faltou.add('sem-transcricao'); }
          else {
            const w = JSON.parse(readFileSync(out, 'utf8')) as { idioma: string; segmentos: { ini: number; fim: number; texto: string }[] };
            if (!w.segmentos.length) faltou.add('audio-sem-fala');
            else transcricao = { fonte: 'whisper-small', idioma: w.idioma, texto: w.segmentos.map((s) => s.texto).join(' '), segmentos: w.segmentos };
          }
        }
      } else faltou.add('audio-sem-fala');
      tempos.transcrever = secs(tt);
    }
    // 4. quadros e cortes de cena
    const tq = Date.now();
    cenas = await cortesDeCena(video).catch(() => undefined);
    for (const t of instantesQuadros(dur ?? 10, cenas ?? [])) {
      const nome = `${String(Math.round(t * 1000)).padStart(5, '0')}ms.jpg`;
      const r = await exec('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', 'scale=540:-2', '-q:v', '4', join(qDir, nome)], 60_000);
      if (r.code === 0 && existsSync(join(qDir, nome))) quadros.push({ tMs: Math.round(t * 1000), arquivo: `quadros/${nome}` });
    }
    tempos.quadros = secs(tq);
    if (!quadros.length) faltou.add('sem-quadros');
  } else if (item.thumbnailLocal && existsSync(join(compDir(slug, comp), item.thumbnailLocal))) {
    // sem vídeo (post/carrossel ou download falhou): a miniatura é o único quadro
    const src = join(compDir(slug, comp), item.thumbnailLocal);
    const nome = `00000ms${extname(src) || '.jpg'}`;
    copyFileSync(src, join(qDir, nome));
    quadros = [{ tMs: 0, arquivo: `quadros/${nome}` }];
    if (ehVideo) avisos.push('só a miniatura (o vídeo não baixou)');
  } else faltou.add('sem-quadros');

  if (!transcricao && ehVideo && !faltou.has('audio-sem-fala')) faltou.add('sem-transcricao');
  if (!transcricao && !ehVideo) faltou.add('sem-transcricao');
  const legenda = limparLegenda(item.caption ?? item.title);
  if (!legenda) faltou.add('legenda-vazia');

  // 5. o vídeo sai (decisão do Oliver); ficam áudio, quadros e transcrição
  let videoApagado = false;
  if (video) { rmSync(video, { force: true }); videoApagado = true; }

  tempos.total = secs(t0);
  const ins: FichaInsumos = {
    hash: sha1(`${he}|${transcricao?.texto ?? ''}`), hashEntrada: he,
    preparadoEm: nowIso(), preparadoPor: 'script',
    legendaLimpa: legenda || undefined, transcricao, quadros, cenas, faltou: [...faltou],
    midia: ehVideo ? { duracaoS: dur, videoApagado, bytesVideo } : undefined, tempos,
  };
  const seguidores = snap.data.profile.followers;
  const ficha: Ficha = antiga ?? novaFicha(slug, comp, key);
  if (antiga && !antiga.analise) ficha.medidas = medidasDe(slug, comp, key, seguidores); // medidas só congelam quando há análise
  ficha.insumos = ins;
  writeFicha(slug, comp, ficha);

  const parcial = faltou.has('midia-indisponivel') || !quadros.length;
  return {
    key, estado: parcial ? 'parcial' : 'preparado', segundos: tempos.total, fonteTexto: transcricao?.fonte,
    palavras: transcricao ? transcricao.texto.split(/\s+/).filter(Boolean).length : 0, quadros: quadros.length, cortes: cenas?.length, tempos, avisos,
  };
}
