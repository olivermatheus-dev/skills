// Compõe a trilha de um vídeo a partir de `music.synth` do timeline.json — tudo sintetizado aqui,
// sem amostra de terceiros, então a música é nossa e não tem direito autoral a pagar. (Veio do kit do Ludus.)
// Alternativa: trilha do catálogo (`node tools/video/timeline.mjs music <pasta> <id>`).
//
// Estilos de seção: `tension` (pad escuro, batida de coração), `light` (pad, arpejo leve, chimbal —
// o calmo), `drive` (groove cheio, arpejo, palmas) e `resolve` (acorde longo que se apaga). `risers` sobem até o compasso seguinte; `impacts`
// batem no primeiro tempo do compasso.
//
// Bloco na timeline (compassos a partir de 0):
//   "music": { "bpm": 84, "synth": { "beatsPerBar": 4, "seed": 3, "chords": ["Fmaj7","Am","Dm","C"],
//              "sections": [{ "from": 0, "to": 8, "style": "light" }], "risers": [], "impacts": [] } }
// Uso: node tools/video-kit/scripts/music.mjs <pasta-do-video>  →  <pasta>/audio/music.wav
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { video } from './lib.mjs'

const v = video(process.argv[2])
const dir = v.dir
const timeline = v.tl
if (!timeline.music?.synth) throw new Error('sem music.synth na timeline (ou use uma trilha do catálogo)')
const music = { risers: [], impacts: [], ...timeline.music.synth }
const bpm = timeline.music.bpm
const beatsPerBar = music.beatsPerBar ?? 4
const totalBars = music.totalBars ?? Math.ceil(((timeline.duration ?? 20) + 1) / ((60 / bpm) * beatsPerBar))

const SR = 44100
const beat = 60 / bpm
const bar = beat * beatsPerBar
const length = Math.ceil((totalBars * bar + 4) * SR)
const L = new Float32Array(length)
const R = new Float32Array(length)
const revSend = new Float32Array(length)
const delaySend = new Float32Array(length)

let seed = music.seed ?? 1
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const noise = () => random() * 2 - 1

const midiHz = (m) => 440 * 2 ** ((m - 69) / 12)
const ROOTS = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 }
function chordNotes(name) {
  const root = ROOTS[name[0]] + (name[1] === '#' ? 1 : name[1] === 'b' ? -1 : 0)
  const minor = /m(?!aj)/.test(name.slice(1))
  return { root, notes: [root, root + (minor ? 3 : 4), root + 7] }
}

function add(i, l, r, rev = 0, dly = 0) {
  if (i < 0 || i >= length) return
  L[i] += l
  R[i] += r
  revSend[i] += (l + r) * 0.5 * rev
  delaySend[i] += (l + r) * 0.5 * dly
}

/** Pad: três serras desafinadas por nota, filtro passa-baixa de um polo, ataque lento. */
function pad(notes, start, dur, amp, cutoff) {
  const a = 0.6
  const rel = 1.2
  const n0 = Math.floor(start * SR)
  const n = Math.floor((dur + rel) * SR)
  notes.forEach((m, k) => {
    ;[-0.08, 0, 0.08].forEach((cents, v) => {
      const f = midiHz(m) * 2 ** (cents / 12)
      const pan = (v - 1) * 0.6 + (k - 1) * 0.15
      const g = Math.exp((-2 * Math.PI * cutoff) / SR)
      let phase = random()
      let y = 0
      for (let i = 0; i < n; i++) {
        const t = i / SR
        const env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / rel) : 1)
        phase += f / SR
        phase -= Math.floor(phase)
        const x = 2 * phase - 1
        y = (1 - g) * x + g * y
        const s = y * env * amp
        add(n0 + i, s * (1 - pan) * 0.5, s * (1 + pan) * 0.5, 0.5)
      }
    })
  })
}

function bass(m, start, dur, amp) {
  const f = midiHz(m)
  const n0 = Math.floor(start * SR)
  const n = Math.floor(dur * SR)
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const env = Math.min(1, t / 0.01) * Math.exp(-t * 1.6) * Math.min(1, (dur - t) / 0.03)
    const s = Math.tanh(1.6 * Math.sin(2 * Math.PI * f * t)) * env * amp
    add(n0 + i, s, s)
  }
}

function kick(start, amp) {
  const n0 = Math.floor(start * SR)
  let phase = 0
  for (let i = 0; i < 0.5 * SR; i++) {
    const t = i / SR
    const f = 45 + 110 * Math.exp(-t * 28)
    phase += f / SR
    const s = Math.sin(2 * Math.PI * phase) * Math.exp(-t * 7) * amp
    add(n0 + i, s, s)
  }
}

function hat(start, amp, pan = 0) {
  const n0 = Math.floor(start * SR)
  let prev = 0
  for (let i = 0; i < 0.06 * SR; i++) {
    const t = i / SR
    const x = noise()
    const hp = x - prev
    prev = x
    const s = hp * Math.exp(-t * 70) * amp
    add(n0 + i, s * (1 - pan), s * (1 + pan), 0.1)
  }
}

function clap(start, amp) {
  const n0 = Math.floor(start * SR)
  let lp = 0
  for (let i = 0; i < 0.25 * SR; i++) {
    const t = i / SR
    const burst = [0, 0.011, 0.022].reduce((e, o) => e + (t >= o ? Math.exp(-(t - o) * 90) : 0), 0)
    const x = noise()
    lp = 0.6 * lp + 0.4 * x
    const s = (x - lp) * (burst * 0.5 + Math.exp(-t * 14) * 0.4) * amp
    add(n0 + i, s, s, 0.6)
  }
}

function pluck(m, start, amp, pan) {
  const f = midiHz(m)
  const n0 = Math.floor(start * SR)
  for (let i = 0; i < 0.9 * SR; i++) {
    const t = i / SR
    const p = (f * t) % 1
    const tri = 4 * Math.abs(p - 0.5) - 1
    const s = (tri * 0.6 + Math.sin(2 * Math.PI * f * 2 * t) * 0.25) * Math.min(1, t / 0.004) * Math.exp(-t * 6) * amp
    add(n0 + i, s * (1 - pan), s * (1 + pan), 0.3, 0.5)
  }
}

function riser(start, dur, amp) {
  const n0 = Math.floor(start * SR)
  let y = 0
  let phase = 0
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const k = t / dur
    const cutoff = 200 * 40 ** k
    const g = Math.exp((-2 * Math.PI * cutoff) / SR)
    y = (1 - g) * noise() + g * y
    phase += (110 * 8 ** k) / SR
    const s = (y * 0.9 + Math.sin(2 * Math.PI * phase) * 0.15) * k ** 2 * amp
    add(n0 + i, s, s, 0.6)
  }
}

function impact(start, amp) {
  kick(start, amp * 1.2)
  const n0 = Math.floor(start * SR)
  let lp = 0
  for (let i = 0; i < 2.5 * SR; i++) {
    const t = i / SR
    const boom = Math.sin(2 * Math.PI * 42 * t) * Math.exp(-t * 1.8) * 0.7
    const x = noise()
    lp = 0.3 * lp + 0.7 * x
    const crash = lp * Math.exp(-t * 2.2) * 0.35
    const s = (boom + crash) * amp
    add(n0 + i, s + crash * amp * 0.2, s - crash * amp * 0.2, 0.7)
  }
}

// ── a partitura ──────────────────────────────────────────────────────────────
const styleAt = (b) => music.sections.find((s) => b >= s.from && b < s.to)?.style ?? 'resolve'
const riserBars = new Set(music.risers.flatMap((r) => Array.from({ length: r.to - r.from }, (_, k) => r.from + k)))

for (let b = 0; b < Math.ceil(totalBars); b++) {
  const t0 = b * bar
  const style = styleAt(b)
  const { root, notes } = chordNotes(music.chords[b] ?? music.chords.at(-1))
  const inRiser = riserBars.has(b)

  if (style === 'tension') {
    pad(notes.map((n) => n - 12), t0, bar, 0.05, 900)
    if (b >= 1 && !inRiser) {
      kick(t0, 0.55)
      kick(t0 + beat * 0.5, 0.3)
    }
    if (b >= 2) bass(root - 24, t0, bar * 0.95, 0.22)
    if (b >= 4 && !inRiser) [0, 1.5, 2, 3].forEach((q, k) => pluck(notes[k % 3] + 12, t0 + q * beat, 0.07, k % 2 ? 0.4 : -0.4))
  }

  if (style === 'light') {
    pad(notes, t0, bar, 0.04, 1600)
    if (b >= 1) bass(root - 24, t0, bar * 0.95, 0.16)
    if (!inRiser) [0, 1, 2, 1, 2, 1, 0, 2].forEach((k, s) => pluck(notes[k] + 12, t0 + s * (beat / 2), s % 2 ? 0.045 : 0.07, s % 2 ? 0.45 : -0.45))
    if (b >= 1 && !inRiser) for (let q = 0; q < beatsPerBar; q++) hat(t0 + (q + 0.5) * beat, 0.05, 0.3)
  }

  if (style === 'drive') {
    pad(notes, t0, bar, 0.045, 2200)
    for (let q = 0; q < beatsPerBar; q++) {
      if (!inRiser) kick(t0 + q * beat, 0.6)
      hat(t0 + (q + 0.5) * beat, 0.07, 0.3)
      if (q % 2 === 1 && !inRiser) clap(t0 + q * beat, 0.35)
      bass(root - 24, t0 + (q + 0.5) * beat, beat * 0.45, 0.2)
    }
    const arp = [0, 1, 2, 1, 2, 0 + 12 - 12, 1, 2]
    arp.forEach((k, s) => pluck(notes[k] + 12 + (s >= 4 ? 12 : 0), t0 + s * (beat / 2), 0.08, s % 2 ? 0.5 : -0.5))
  }

  if (style === 'resolve' && (b === music.impacts.at(-1) || (!music.impacts.length && b === music.sections.find((s) => s.style === 'resolve')?.from))) {
    pad([...notes, notes[0] + 11, notes[0] + 14].map((n) => n), t0, totalBars * bar - t0, 0.05, 1800)
    bass(root - 24, t0, 4, 0.3)
    ;[0, 4, 7, 11, 14, 19].forEach((i, k) => pluck(root + 12 + i, t0 + k * beat * 0.5, 0.07, k % 2 ? 0.5 : -0.5))
  }
}
music.risers.forEach((r) => riser(r.from * bar, (r.to - r.from) * bar, 0.35))
music.impacts.forEach((b) => impact(b * bar, 0.8))

// ── eco (colcheia pontuada) e reverb (Schroeder) ────────────────────────────
const delayN = Math.floor(beat * 0.75 * SR)
for (let i = delayN; i < length; i++) {
  delaySend[i] += delaySend[i - delayN] * 0.38
  L[i] += delaySend[i - delayN] * 0.35
  R[i] += delaySend[i - delayN] * 0.28
}

function reverb(input, offset) {
  const out = new Float32Array(length)
  for (const size of [1116, 1188, 1277, 1356]) {
    const d = size + offset
    const buf = new Float32Array(d)
    let idx = 0
    let filt = 0
    for (let i = 0; i < length; i++) {
      const y = buf[idx]
      filt = y * 0.8 + filt * 0.2
      buf[idx] = input[i] + filt * 0.86
      idx = (idx + 1) % d
      out[i] += y
    }
  }
  for (const size of [556, 441]) {
    const d = size + offset
    const buf = new Float32Array(d)
    let idx = 0
    for (let i = 0; i < length; i++) {
      const b = buf[idx]
      const y = -out[i] + b
      buf[idx] = out[i] + b * 0.5
      idx = (idx + 1) % d
      out[i] = y
    }
  }
  return out
}
const revL = reverb(revSend, 0)
const revR = reverb(revSend, 23)
for (let i = 0; i < length; i++) {
  L[i] += revL[i] * 0.09
  R[i] += revR[i] * 0.09
}

// ── master: saturação suave, fim em fade, pico em −1 dB ─────────────────────
const fadeFrom = (totalBars * bar - 1.5) * SR
let peak = 0
for (let i = 0; i < length; i++) {
  const fade = i > fadeFrom ? Math.max(0, 1 - (i - fadeFrom) / (3.5 * SR)) : 1
  L[i] = Math.tanh(L[i] * 1.2) * fade
  R[i] = Math.tanh(R[i] * 1.2) * fade
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
}
const gain = 0.89 / peak

const data = Buffer.alloc(44 + length * 4)
data.write('RIFF', 0)
data.writeUInt32LE(36 + length * 4, 4)
data.write('WAVEfmt ', 8)
data.writeUInt32LE(16, 16)
data.writeUInt16LE(1, 20)
data.writeUInt16LE(2, 22)
data.writeUInt32LE(SR, 24)
data.writeUInt32LE(SR * 4, 28)
data.writeUInt16LE(4, 32)
data.writeUInt16LE(16, 34)
data.write('data', 36)
data.writeUInt32LE(length * 4, 40)
for (let i = 0; i < length; i++) {
  data.writeInt16LE(Math.round(L[i] * gain * 32767), 44 + i * 4)
  data.writeInt16LE(Math.round(R[i] * gain * 32767), 46 + i * 4)
}
mkdirSync(join(dir, 'audio'), { recursive: true })
writeFileSync(join(dir, 'audio', 'music.wav'), data)
timeline.music = { ...timeline.music, file: 'audio/music.wav', id: null, license: 'própria (sintetizada no kit)' }
v.save()
console.log(`music.wav · ${(length / SR).toFixed(1)} s · ${bpm} BPM · ganho ${gain.toFixed(2)}`)
