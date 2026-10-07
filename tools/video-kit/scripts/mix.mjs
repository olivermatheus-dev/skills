// Mixa o vídeo: cada fala no seu tempo (vo[].start), a trilha abaixa sozinha sob a voz (sidechain), os
// efeitos de audio/sfx.wav por cima, e o todo sai em −14 LUFS (pico −1,5 dBTP), o alvo das redes.
// (Base: kit do Ludus.)
//
// Trilha: `music.file` (audio/music.wav do music.mjs, ou library/audio/... do catálogo), `music.start` (s a
// pular do começo da trilha), `music.gain_db` (nível da trilha antes do ducking; padrão −9 com voz, −3 sem),
// `music.duck` (0–1, quanto abaixa sob a voz; padrão 0,7). A trilha é levada a −16 LUFS antes, então o ganho
// vale igual para qualquer arquivo.
//
// Uso: node tools/video-kit/scripts/mix.mjs <pasta-do-video>  →  audio/mix.wav
import { existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, isAbsolute } from 'node:path';
import { HUB, video, ff, r3 } from './lib.mjs';

const v = video(process.argv[2]);
const tl = v.tl;
const total = r3((tl.duration ?? tl.scenes.at(-1).end) + 0.5);
const vo = (tl.vo || []).filter((x) => x.file && x.start != null);
const m = tl.music || {};
const musicFile = m.file ? (isAbsolute(m.file) ? m.file : existsSync(join(v.dir, m.file)) ? join(v.dir, m.file) : join(HUB, m.file)) : null;
if (!musicFile || !existsSync(musicFile)) throw new Error('sem trilha: rode music.mjs ou escolha uma do catálogo (timeline.mjs music). Nunca fundo mudo.');
const sfx = join(v.dir, 'audio', 'sfx.wav');
const hasSfx = existsSync(sfx);

const inputs = ['-stream_loop', '-1', '-i', musicFile];
const f = [];
const fadeOut = Math.max(0, total - 1.2);
f.push(`[0:a]atrim=start=${m.start ?? 0},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2:LRA=11,volume=${m.gain_db ?? (vo.length ? -9 : -3)}dB,atrim=0:${total},afade=t=in:d=0.05,afade=t=out:st=${fadeOut}:d=1.2[music]`);
vo.forEach((x, k) => {
  inputs.push('-i', join(v.dir, x.file));
  const ms = Math.round(x.start * 1000);
  f.push(`[${k + 1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${k}]`);
});
let last = '[music]';
if (vo.length) {
  const duck = Math.max(0, Math.min(1, m.duck ?? 0.7));
  f.push(`${vo.map((_, k) => `[v${k}]`).join('')}amix=inputs=${vo.length}:normalize=0,highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,loudnorm=I=-15:TP=-2:LRA=7,apad=whole_dur=${total},asplit=2[voice][key]`);
  f.push(`[music][key]sidechaincompress=threshold=0.02:ratio=${(2 + duck * 8).toFixed(1)}:attack=20:release=450:makeup=1[ducked]`);
  last = '[ducked][voice]';
}
let n = vo.length ? 2 : 1;
if (hasSfx) { inputs.push('-i', sfx); f.push(`[${vo.length + 1}:a]aresample=48000,aformat=channel_layouts=stereo[fx]`); last += '[fx]'; n++; }
f.push(`${last}amix=inputs=${n}:normalize=0:dropout_transition=0,atrim=0:${total}[out]`);
const pre = join(v.dir, 'audio', 'mix-pre.wav');
ff([...inputs, '-filter_complex', f.join(';'), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_f32le', pre]);
// −14 LUFS em duas passadas: mede e aplica linear (a passada única erra ~1 LU em clipes curtos)
const target = 'I=-14:TP=-1.5:LRA=11';
const log = spawnSync('ffmpeg', ['-hide_banner', '-i', pre, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const mj = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
ff(['-i', pre, '-af', `loudnorm=${target}:measured_I=${mj.input_i}:measured_TP=${mj.input_tp}:measured_LRA=${mj.input_lra}:measured_thresh=${mj.input_thresh}:offset=${mj.target_offset}:linear=true,aresample=48000`, '-ar', '48000', join(v.dir, 'audio', 'mix.wav')]);
rmSync(pre);
console.log(`mix.wav · ${total} s · ${vo.length} fala(s)${hasSfx ? ' · com efeitos' : ''} · trilha ${m.id || m.file}`);
