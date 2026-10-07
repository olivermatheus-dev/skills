// Monta a faixa de efeitos do vídeo: cada item de `timeline.sfx` aponta para um evento de `timeline.events`
// (o mesmo número que move a tela) e para um som — da biblioteca licenciada (`asset`) ou sintetizado aqui (`synth`).
//
//   { "event": "e2", "asset": "ui-cartoon-shutter-01", "align": "start", "gain_db": -16, "pan": 0.2, "max": 0.8 }
//   { "event": "e3", "asset": "whoosh-whoosh-fino-02", "align": "peak" }    ← o pico cai no quadro do evento
//   { "event": "e4", "synth": "pop" }      ← pop · click · swish · whoosh · typing (com "until") · chime · ding
// `delay` (s) desloca; `max` (s) corta o som com fade curto. Sem licença no catálogo = erro.
//
// Uso: node tools/video-kit/scripts/sfx.mjs <pasta-do-video>  →  audio/sfx.wav
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { HUB, video, catalog, ff, r3 } from './lib.mjs';

const v = video(process.argv[2]);
const tl = v.tl;
const cues = tl.sfx || [];
const total = r3((tl.duration ?? tl.scenes.at(-1).end) + 2);
const SR = 48000;
mkdirSync(join(v.dir, 'audio'), { recursive: true });
const ev = (id) => {
  const e = (tl.events || []).find((x) => x.id === id);
  if (!e) throw new Error(`sfx aponta para evento inexistente: ${id}`);
  return e.t;
};

// ── efeitos sintetizados (do kit do Ludus): vão todos para um arquivo só ────────────────
const synthCues = cues.filter((c) => c.synth);
let synthFile = null;
if (synthCues.length) {
  const length = Math.ceil(total * SR);
  const L = new Float32Array(length), R = new Float32Array(length);
  let seed = 3;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const noise = () => random() * 2 - 1;
  const write = (start, seconds, fn, pan = 0, gain = 1) => {
    const n0 = Math.floor(start * SR);
    for (let i = 0; i < seconds * SR; i++) {
      const k = n0 + i; if (k < 0 || k >= length) continue;
      const s = fn(i / SR) * gain; L[k] += s * (1 - pan); R[k] += s * (1 + pan);
    }
  };
  const SOUNDS = {
    pop(t0, _, g, p) { const base = 900 + random() * 180;
      write(t0, 0.09, (t) => Math.sin(2 * Math.PI * (base + 2400 * t) * t) * Math.exp(-t * 45) * 0.28, p, g);
      write(t0 + 0.06, 0.12, (t) => Math.sin(2 * Math.PI * base * 1.5 * t) * Math.exp(-t * 38) * 0.18, p, g); },
    click(t0, _, g, p) { let lp = 0;
      write(t0, 0.05, (t) => { lp = 0.5 * lp + 0.5 * noise(); return (noise() - lp) * Math.exp(-t * 400) * 0.5 + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 160) * 0.25; }, p, g);
      write(t0, 0.06, (t) => Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 60) * 0.25, p, g); },
    swish(t0, _, g, p) { let y = 0;
      write(t0, 0.35, (t) => { const k = t / 0.35; const a = Math.exp((-2 * Math.PI * (600 + 5000 * Math.sin(Math.PI * k))) / SR); y = (1 - a) * noise() + a * y; return y * Math.sin(Math.PI * k) * 0.22; }, p, g); },
    whoosh(t0, _, g, p) { let y = 0;
      write(t0, 0.7, (t) => { const k = t / 0.7; const a = Math.exp((-2 * Math.PI * (300 + 7000 * k * k)) / SR); y = (1 - a) * noise() + a * y; return y * Math.sin(Math.PI * k) ** 1.5 * 0.35; }, p, g); },
    typing(t0, t1, g) { for (let t = t0; t < (t1 ?? t0 + 1); t += 0.045 + random() * 0.03) { const f = 2600 + random() * 900; let lp = 0;
      write(t, 0.03, (s) => { lp = 0.6 * lp + 0.4 * noise(); return (lp * 0.5 + Math.sin(2 * Math.PI * f * s) * 0.2) * Math.exp(-s * 220) * 0.28; }, random() * 0.3 - 0.15, g); } },
    chime(t0, _, g) { [[1046.5, 0], [1568, 0.09]].forEach(([f, d]) => write(t0 + d, 1.0, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.01 * t)) * Math.exp(-t * 5) * 0.14, 0, g)); },
    ding(t0, _, g) { [[1318.5, 0], [1975.5, 0.07], [2637, 0.14]].forEach(([f, d], k) => write(t0 + d, 1.4, (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * t)) * Math.exp(-t * (4 + k)) * 0.14, (k - 1) * 0.3, g)); },
  };
  for (const c of synthCues) {
    if (!SOUNDS[c.synth]) throw new Error(`synth desconhecido: ${c.synth}`);
    SOUNDS[c.synth](ev(c.event) + (c.delay ?? 0), c.until ? ev(c.until) : undefined, 10 ** ((c.gain_db ?? 0) / 20), c.pan ?? 0);
  }
  const data = Buffer.alloc(44 + length * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + length * 4, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22); data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(length * 4, 40);
  for (let i = 0; i < length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  synthFile = join(v.dir, 'audio', 'sfx-synth.wav');
  writeFileSync(synthFile, data);
}

// ── efeitos da biblioteca: cada arquivo posicionado, com ganho e pan ─────────────────────
const lib = catalog('sfx');
const inputs = [], chains = [];
const uses = {};
for (const c of cues.filter((x) => x.asset)) {
  const a = lib.find((x) => x.id === c.asset);
  if (!a) throw new Error(`sfx "${c.asset}" não está no catálogo (node tools/audio/catalog.mjs search sfx …)`);
  if (!a.license) throw new Error(`sfx "${c.asset}" sem licença: não pode ser usado`);
  const file = join(HUB, 'library', 'audio', a.file);
  if (!existsSync(file)) throw new Error(`arquivo do sfx não está nesta máquina: ${a.file}`);
  uses[c.asset] = (uses[c.asset] || 0) + 1;
  let t = ev(c.event) + (c.delay ?? 0) - (c.align === 'peak' ? (a.peak_s ?? 0) : 0);
  const skip = t < 0 ? -t : 0; t = Math.max(0, t);
  const p = Math.max(-1, Math.min(1, c.pan ?? 0));
  const gl = (Math.cos(((p + 1) * Math.PI) / 4) * Math.SQRT2).toFixed(3), gr = (Math.sin(((p + 1) * Math.PI) / 4) * Math.SQRT2).toFixed(3);
  const k = inputs.length / 2;
  inputs.push('-i', file);
  const cut = c.max ? `,atrim=0:${c.max},afade=t=out:st=${Math.max(0, c.max - 0.08)}:d=0.08` : '';
  const ms = Math.round(t * 1000);
  chains.push(`[${k}:a]aresample=${SR},aformat=channel_layouts=stereo,atrim=start=${skip.toFixed(3)},asetpts=PTS-STARTPTS${cut},volume=${c.gain_db ?? -14}dB,pan=stereo|c0=${gl}*c0|c1=${gr}*c1,adelay=${ms}|${ms}[s${k}]`);
}
if (synthFile) { const k = inputs.length / 2; inputs.push('-i', synthFile); chains.push(`[${k}:a]aresample=${SR},aformat=channel_layouts=stereo[s${k}]`); }
const n = inputs.length / 2;
const out = join(v.dir, 'audio', 'sfx.wav');
if (!n) { console.log('sem sfx na timeline'); process.exit(0); }
const mix = `${chains.map((_, k) => `[s${k}]`).join('')}amix=inputs=${n}:normalize=0:dropout_transition=0,apad=whole_dur=${total},atrim=0:${total}[out]`;
ff([...inputs, '-filter_complex', [...chains, mix].join(';'), '-map', '[out]', '-ar', String(SR), out]);
for (const [id, k] of Object.entries(uses)) if (k > 3) console.log(`⚠ ${id} usado ${k}×: alterne variantes da família`);
console.log(`sfx.wav · ${cues.length} efeito(s) (${cues.length - synthCues.length} da biblioteca, ${synthCues.length} sintetizado(s))`);
