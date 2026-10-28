// Trilha própria do V0001 (Olá Espanhol): violão de nylon (Karplus-Strong) + percussão de mão leve,
// ~105,9 BPM, grade de compassos ancorada no "Vira aula" e na entrada da f01.
// V04 (2026-10-28): 69,87 s — 1ª fala (f03) em 7,57 s, "Conviértela en clase" em 61,873 s (24 compassos); fecha em 69,86 s.
// V03 (2026-10-26, voz final Carla): 82,06 s — f01 em 8,90 s, "Vira aula" em 74,256 s (29 compassos); drop sem subir o nível geral.
// V02: timeline de 80,13 s — f01 em 8,90 s, "Vira aula" em 72,329 s (28 compassos entre os dois).
// V01 (45,92 s): T0 1,903 · HIT 40,443 · 17 compassos (versão anterior do script no histórico da tarefa).
// Uso: node trilha-ola.mjs <saida.wav> [--perc full|light|none]
import { writeFileSync } from 'node:fs'

const out = process.argv[2]
const percMode = (() => { const i = process.argv.indexOf('--perc'); return i > 0 ? process.argv[i + 1] : 'full' })()
const SR = 48000
const DUR = 70.6
const N = Math.ceil(DUR * SR)
const L = new Float32Array(N), R = new Float32Array(N), rev = new Float32Array(N)

const T0 = 7.57, HIT = 61.873
const BAR = (HIT - T0) / 24 // 2.2626 s → 106,1 BPM
const BEAT = BAR / 4, STEP = BEAT / 4
const barT = (k) => T0 + k * BAR

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const noise = () => rnd() * 2 - 1
const hz = (m) => 440 * 2 ** ((m - 69) / 12)

function put(i, l, r, send) {
  if (i < 0 || i >= N) return
  L[i] += l; R[i] += r; rev[i] += (l + r) * 0.5 * send
}

// violão de nylon: Karplus-Strong com excitação macia (ruído filtrado) e posição de dedilhado
function pluck(m, t, vel, pan = 0, ring = 2.2) {
  if (t < -0.01) return
  const f = hz(m)
  const P = SR / f
  const Pi = Math.floor(P)
  const frac = P - Pi
  const buf = new Float32Array(Pi + 2)
  let lp = 0
  const bright = 0.35 + 0.25 * vel
  for (let i = 0; i < buf.length; i++) { lp = lp + bright * (noise() - lp); buf[i] = lp }
  // posição do dedilhado (comb) → timbre de nylon, menos "metal"
  const pos = Math.floor(buf.length * 0.18)
  for (let i = buf.length - 1; i >= pos; i--) buf[i] -= buf[i - pos] * 0.6
  const rho = Math.exp(-1 / (ring * f)) ** 0.5
  const n = Math.floor((ring + 0.2) * SR)
  const n0 = Math.floor(t * SR)
  let idx = 0, prev = 0, body = 0
  const gl = Math.cos(((pan + 1) * Math.PI) / 4), gr = Math.sin(((pan + 1) * Math.PI) / 4)
  for (let i = 0; i < n; i++) {
    const a = buf[idx % buf.length]
    const b = buf[(idx + 1) % buf.length]
    const y = a * (1 - frac * 0.5) + b * (frac * 0.5)
    const nv = (y + prev) * 0.5 * rho
    prev = y
    buf[idx % buf.length] = nv
    idx++
    body = body + 0.25 * (y - body) // corpo: tira o "fio" agudo
    const env = Math.min(1, i / (0.002 * SR)) * (i > n - 0.15 * SR ? (n - i) / (0.15 * SR) : 1)
    const s = (body * 0.75 + y * 0.25) * env * vel * 0.55
    put(n0 + i, s * gl, s * gr, 0.35)
  }
}

function strum(notes, t, vel, spread = 0.018, ring = 3) {
  notes.forEach((m, k) => pluck(m, t + k * spread, vel * (k === 0 ? 1 : 0.85), -0.35 + (0.7 * k) / Math.max(1, notes.length - 1), ring))
}

function shaker(t, vel, pan = 0.4) {
  const n0 = Math.floor(t * SR), n = Math.floor(0.07 * SR)
  let x1 = 0, y1 = 0
  for (let i = 0; i < n; i++) {
    const tt = i / SR
    const x = noise(); const hp = x - x1 + 0.6 * y1; x1 = x; y1 = hp // passa-alta
    const env = Math.min(1, tt / 0.012) * Math.exp(-tt * 55)
    const s = hp * env * vel * 0.07
    put(n0 + i, s * (1 - pan) * 0.7, s * (1 + pan) * 0.7, 0.15)
  }
}

function cajonBass(t, vel) {
  const n0 = Math.floor(t * SR), n = Math.floor(0.35 * SR)
  let ph = 0
  for (let i = 0; i < n; i++) {
    const tt = i / SR
    ph += (62 + 70 * Math.exp(-tt * 30)) / SR
    const s = Math.sin(2 * Math.PI * ph) * Math.exp(-tt * 11) * vel * 0.32 + noise() * Math.exp(-tt * 200) * vel * 0.03
    put(n0 + i, s, s, 0.05)
  }
}

function cajonSlap(t, vel) {
  const n0 = Math.floor(t * SR), n = Math.floor(0.18 * SR)
  let lp = 0, ph = 0
  for (let i = 0; i < n; i++) {
    const tt = i / SR
    const x = noise(); lp = lp + 0.35 * (x - lp)
    ph += 210 / SR
    const s = ((x - lp) * Math.exp(-tt * 40) * 0.35 + Math.sin(2 * Math.PI * ph) * Math.exp(-tt * 30) * 0.25) * vel * 0.22
    put(n0 + i, s * 0.9, s * 1.1, 0.25)
  }
}

function conga(t, vel, f = 200, pan = -0.45) {
  const n0 = Math.floor(t * SR), n = Math.floor(0.3 * SR)
  let ph = 0
  for (let i = 0; i < n; i++) {
    const tt = i / SR
    ph += (f * (1 + 0.12 * Math.exp(-tt * 40))) / SR
    const s = (Math.sin(2 * Math.PI * ph) * Math.exp(-tt * 13) + noise() * Math.exp(-tt * 300) * 0.25) * vel * 0.16
    put(n0 + i, s * (1 - pan), s * (1 + pan), 0.3)
  }
}

function sub(m, t, dur, vel) {
  const f = hz(m), n0 = Math.floor(t * SR), n = Math.floor(dur * SR)
  for (let i = 0; i < n; i++) {
    const tt = i / SR
    const env = Math.min(1, tt / 0.015) * Math.exp(-tt * 1.4) * Math.min(1, (dur - tt) / 0.08)
    const s = Math.sin(2 * Math.PI * f * tt) * env * vel * 0.2
    put(n0 + i, s, s, 0)
  }
}

function bell(m, t, vel) { // harmônico/brilho do fim: seno com parcial leve
  const f = hz(m), n0 = Math.floor(t * SR), n = Math.floor(2.5 * SR)
  for (let i = 0; i < n; i++) {
    const tt = i / SR
    const s = (Math.sin(2 * Math.PI * f * tt) + 0.2 * Math.sin(2 * Math.PI * f * 3 * tt)) * Math.min(1, tt / 0.004) * Math.exp(-tt * 2.2) * vel * 0.06
    put(n0 + i, s * 0.8, s * 1.2, 0.6)
  }
}

// ── harmonia: um acorde por compasso (k = −1 … 19) ─────────────────────────
const CH = {
  D: { bass: [38, 45], up: [62, 66, 69, 73] },     // Dmaj7
  Bm: { bass: [35, 42], up: [62, 66, 69, 57] },    // Bm7
  G: { bass: [43, 50], up: [59, 62, 66, 69] },     // Gmaj7 (com 9: A)
  A: { bass: [45, 52], up: [61, 64, 69, 57] },     // A
  Em: { bass: [40, 47], up: [59, 62, 67, 71] },    // Em7
  Asus: { bass: [45, 52], up: [62, 64, 67, 69] },  // A7sus4
  D9: { bass: [38, 45], up: [64, 66, 69, 73, 76] },// Dmaj9
}
const LOOP = ['D', 'Bm', 'G', 'A']
const chordAt = (k) => (k === 22 ? 'Em' : k === 23 ? 'Asus' : k === 24 ? 'D' : k >= 25 ? 'D9' : LOOP[((k % 4) + 4) % 4])

// densidade por tempo (curva do plano: 2·2·3·2·3·2·1·3·2·4·1)
function density(t) {
  if (t < 4.0) return 'intro'        // s01 barra: violão ralo (a digitação aparece)
  if (t < 6.75) return 'intro2'      // s02 cards: entra o shaker, crescendo até o clique (6,05 s)
  if (t < 10.948) return 'light'     // s04 planos
  if (t < 27.881) return 'full'      // s05 a hora se divide (int 3)
  if (t < 37.538) return 'light'     // s06 prova / videochamada
  if (t < 38.258) return 'thin'      // s07 virada
  if (t < 46.22) return 'full'       // s08 professor (int 3)
  if (t < 58.738) return 'light'     // s09 4 cards
  if (t < HIT) return 'thin'         // s10 pergunta: menos densidade antes do evento
  if (t < barT(25)) return 'peak'    // "Conviértela en clase" (curto, sem subir o nível)
  return 'resolve'
}

// dedilhado por compasso (16 passos): baixo 0 e 6 (antecipação), agudos sincopados 3-3-2
const UP_STEPS = [[3, 0], [8, 1], [11, 2], [14, 3]]
for (let k = -4; k <= 25; k++) {
  const t0 = barT(k)
  const c = CH[chordAt(k)]
  for (let s = 0; s < 16; s++) {
    const t = t0 + s * STEP
    if (t < 0 || t >= HIT && k < 24) continue
    const d = density(t)
    if (d === 'resolve') continue
    if (t > 61.41 && t < HIT) continue // respiro antes do "Vira aula" (sem notas novas)
    const hum = (rnd() - 0.5) * 0.008
    // violão
    if (s === 0) pluck(c.bass[0], t + hum, d === 'thin' ? 0.7 : 0.85, -0.2, 2.4)
    if (s === 6 && d !== 'thin' && d !== 'intro') pluck(c.bass[1], t + hum, 0.6, -0.15, 1.8)
    if (s === 10 && (d === 'full' || d === 'peak')) pluck(c.bass[0] + 12, t + hum, 0.45, -0.1, 1.4)
    for (const [st, ni] of UP_STEPS) {
      if (s !== st) continue
      if ((d === 'thin' || d === 'intro') && st !== 8 && !(d === 'intro' && st === 14)) continue
      const note = c.up[ni % c.up.length]
      pluck(note, t + hum, (d === 'intro' ? 0.55 : 0.5) * (st === 8 ? 1 : 0.85), 0.25 + 0.1 * ni, 2)
      if (st === 8 && d !== 'thin' && d !== 'intro') pluck(c.up[(ni + 1) % c.up.length], t + hum + 0.012, 0.35, 0.4, 1.8)
    }
    // percussão
    if (percMode === 'none') continue
    if (d !== 'thin' && d !== 'intro' && d !== 'intro2' && s % 2 === 0) shaker(t + hum, s % 4 === 2 ? 0.9 : 0.55)
    if (d === 'intro2' && s % 2 === 0) shaker(t + hum, (s % 4 === 2 ? 0.7 : 0.35) * (0.6 + 0.4 * Math.min(1, (t - 4) / 2.05)))
    if (d === 'intro' && s === 8) shaker(t + hum, 0.4)
    if (d === 'thin' && s % 8 === 4 && t < 58.738) shaker(t, 0.4)
    if (percMode === 'light') continue
    if ((d === 'full' || d === 'peak') && (s === 0 || s === 10)) cajonBass(t + hum, s === 0 ? 0.9 : 0.6)
    if ((d === 'full' || d === 'peak') && (s === 4 || s === 12)) cajonSlap(t + hum, 0.7)
    if (d === 'light' && s === 0) cajonBass(t + hum, 0.5)
    if (d === 'intro2' && s === 0 && t > 5.2) cajonBass(t + hum, 0.35)
    if ((d === 'full' || d === 'peak') && (s === 7 || s === 14 || s === 15)) conga(t + hum, s === 14 ? 0.9 : 0.6, s === 15 ? 175 : 205)
  }
}

// cama do respiro: o Asus segura soando (sem silêncio digital)
pluck(45, barT(23) + 8 * STEP, 0.6, -0.2, 4)
pluck(64, barT(23) + 8 * STEP + 0.01, 0.4, 0.3, 4)

// 1º quadro: o violão já soa (strum curto no tom)
strum([50, 57, 62, 66, 69], 0.0, 0.55, 0.012, 2.4)
// pickup para a f01
;[57, 62, 66].forEach((m, i) => pluck(m, T0 - BEAT + i * STEP * 1.33, 0.4, 0.3, 1.5))
// fim do crescendo: conga puxa a f01 (último tempo antes de 8,90 s)
if (percMode === 'full') [0, 2, 3].forEach((q, i) => conga(T0 - BEAT + q * STEP, 0.5 + 0.15 * i, i === 2 ? 175 : 205))

// "Vira aula": o único golpe forte — strum cheio + caixa grave + sub
strum([38, 45, 50, 57, 62, 66, 69, 73], HIT, 0.42, 0.011, 3.2)
cajonBass(HIT, 0.45)
sub(38, HIT, 1.8, 0.25)

// resolução (42,71 s, na "Comece"): Dmaj9 longo + brilho; cauda até o fim
const RES = barT(25)
strum([38, 45, 52, 57, 62, 64, 66, 69, 73], RES, 0.7, 0.03, 4.5)
sub(38, RES, 3.5, 0.6)
if (percMode !== 'none') { shaker(RES, 0.7); shaker(RES + BEAT, 0.45); shaker(RES + 2 * BEAT, 0.3) }
bell(86, RES + 2 * BEAT, 0.8)
bell(81, RES + 6 * BEAT, 0.5)
// "olá" (76,9 s): strum suave no mesmo acorde, a cauda leva até o fim
strum([50, 57, 62, 66, 69, 76], 66.989, 0.45, 0.035, 2.8)

// ── reverb (Schroeder) ─────────────────────────────────────────────────────
function reverb(input, off) {
  const o = new Float32Array(N)
  for (const size of [1557, 1617, 1491, 1422]) {
    const d = size + off, buf = new Float32Array(d); let idx = 0, filt = 0
    for (let i = 0; i < N; i++) { const y = buf[idx]; filt = y * 0.6 + filt * 0.4; buf[idx] = input[i] + filt * 0.84; idx = (idx + 1) % d; o[i] += y }
  }
  for (const size of [225, 556, 441]) {
    const d = size + off, buf = new Float32Array(d); let idx = 0
    for (let i = 0; i < N; i++) { const b = buf[idx]; const y = -o[i] + b; buf[idx] = o[i] + b * 0.5; idx = (idx + 1) % d; o[i] = y }
  }
  return o
}
const rl = reverb(rev, 0), rr = reverb(rev, 31)
for (let i = 0; i < N; i++) { L[i] += rl[i] * 0.05; R[i] += rr[i] * 0.05 }

// ── automação (curvas por amostra, sem degrau): respiro antes do "Vira aula" ─
// 61,43→61,56 desce para −18 dB (130 ms) · 61,83→61,873 volta (43 ms) · abertura: crescendo −6 dB → 0 até 6,05 s (clique) · fim: fade 68,0→69,86 (fecha no fim do vídeo)
const g20 = 10 ** (-18 / 20)
const gDrop = 10 ** (-2.5 / 20)
const smooth = (x) => x * x * (3 - 2 * x)
function gainAt(t) {
  let g = 1
  if (t >= 61.43 && t < 61.56) g = 1 + (g20 - 1) * smooth((t - 61.43) / 0.13)
  else if (t >= 61.56 && t < 61.83) g = g20
  else if (t >= 61.83 && t < HIT) g = g20 + (gDrop - g20) * smooth((t - 61.83) / (HIT - 61.83))
  else if (t >= HIT && t < RES) g = gDrop // drop sem subir o nível geral (V03)
  else if (t >= RES && t < RES + 0.3) g = gDrop + (1 - gDrop) * smooth((t - RES) / 0.3)
  if (t < 6.05) g *= 10 ** ((-6 * (1 - smooth(t / 6.05))) / 20)
  if (t > 68.0) g *= Math.max(0, 1 - smooth(Math.min(1, (t - 68.0) / 1.86)))
  return g
}
let peak = 0
for (let i = 0; i < N; i++) {
  const g = gainAt(i / SR)
  L[i] = Math.tanh(L[i] * 1.1) * g; R[i] = Math.tanh(R[i] * 1.1) * g
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
}
const norm = 0.85 / peak
const data = Buffer.alloc(44 + N * 4)
data.write('RIFF', 0); data.writeUInt32LE(36 + N * 4, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16)
data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22); data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28)
data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(N * 4, 40)
let maxJump = 0
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4)
  data.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4)
}
writeFileSync(out, data)
console.log(`${out} · ${DUR}s · ${(60 / BEAT).toFixed(2)} BPM · compasso ${BAR.toFixed(4)} s · perc ${percMode}`)
