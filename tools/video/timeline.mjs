// Edição determinística da timeline de um vídeo: trocar áudio, duração, texto e trilha sem reescrever nada à mão.
// (É o núcleo do futuro MCP de edição: cada comando = uma ferramenta.)
// Uso (pasta = companies/<slug>/contents/<vídeo>):
//   node tools/video/timeline.mjs show  <pasta>
//   node tools/video/timeline.mjs check <pasta>
//   node tools/video/timeline.mjs vo    <pasta> <fala-id> <arquivo-de-audio>   troca a voz de uma fala e reencaixa tudo depois dela
//   node tools/video/timeline.mjs dur   <pasta> <cena-id> <segundos>           muda a duração de uma cena e empurra o resto
//   node tools/video/timeline.mjs text  <pasta> <cena-id> "<texto na tela>"    troca o texto e confere o tempo de leitura
//   node tools/video/timeline.mjs music <pasta> <music-id> [--gain -18]        troca a trilha por uma do catálogo (com licença)
//   node tools/video/timeline.mjs vol   <pasta> <voz|trilha|efeitos|evento-id> <dB>   volume da faixa ou do som de um evento
// Depois de vol/dur: sfx.mjs + mix.mjs (o app faz isso no "Gerar prévia").
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { layout } from '../video-kit/scripts/lib.mjs';

const [cmd, dir, a, b, ...rest] = process.argv.slice(2);
const usage = () => { console.log('Uso: node tools/video/timeline.mjs <show|check|vo|dur|text|music|vol> <pasta> [...]'); process.exit(1); };
if (!cmd || !dir) usage();
const file = join(dir, 'timeline.json');
if (!existsSync(file)) { console.log(`Sem ${file}`); process.exit(1); }
const tl = JSON.parse(readFileSync(file, 'utf8'));
const save = () => writeFileSync(file, JSON.stringify(tl, null, 2) + '\n');
const r3 = (x) => Math.round(x * 1000) / 1000;
const words = (s = '') => s.trim().split(/\s+/).filter(Boolean).length;
const readMin = (s) => Math.max(1, 0.3 * words(s));
const catalog = (k) => { try { return JSON.parse(readFileSync(`library/audio/${k}.json`, 'utf8')); } catch { return []; } };

// empurra tudo que começa em/depois de `pivot` por `delta` segundos
function shiftAfter(pivot, delta, except = {}) {
  const sh = (t) => (t >= pivot - 1e-6 ? r3(t + delta) : t);
  for (const v of tl.vo || []) if (v !== except.vo) { v.start = sh(v.start); v.end = sh(v.end); for (const w of v.words || []) { w.s = sh(w.s); w.e = sh(w.e); } }
  for (const s of tl.scenes || []) if (s !== except.scene) { s.start = sh(s.start); s.end = sh(s.end); }
  for (const e of tl.events || []) e.t = sh(e.t);
  for (const c of tl.captions || []) { c.start = sh(c.start); c.end = sh(c.end); }
  tl.duration = r3(tl.duration + delta);
}

function check() {
  const out = [];
  const vo = [...(tl.vo || [])].sort((x, y) => x.start - y.start);
  for (let i = 1; i < vo.length; i++) {
    const gap = r3(vo[i].start - vo[i - 1].end);
    const sc = (tl.scenes || []).find((s) => s.start <= vo[i].start && vo[i].start < s.end);
    const lim = sc?.pause ? 1.0 : 0.5;
    if (gap > lim) out.push(`silêncio de ${gap}s entre ${vo[i - 1].id} e ${vo[i].id} (limite ${lim}s)`);
    if (gap < 0) out.push(`falas sobrepostas: ${vo[i - 1].id} e ${vo[i].id}`);
  }
  for (const s of tl.scenes || []) {
    const len = r3(s.end - s.start);
    if (s.on_screen && len < readMin(s.on_screen)) out.push(`cena ${s.id}: texto pede ${readMin(s.on_screen).toFixed(1)}s de leitura, cena tem ${len}s`);
    const marks = [s.start, ...(tl.events || []).filter((e) => e.scene === s.id).map((e) => e.t), ...vo.filter((v) => v.start >= s.start && v.start < s.end).map((v) => v.start), s.end].sort((x, y) => x - y);
    const still = Math.max(...marks.slice(1).map((m, i) => m - marks[i]));
    if (still > 3) out.push(`cena ${s.id}: ${r3(still)}s sem nada novo (teto 3s)`);
  }
  const last = (tl.scenes || []).at(-1);
  if (last && last.end - last.start < 2) out.push(`cartão final com ${r3(last.end - last.start)}s (mínimo 2s)`);
  for (const e of tl.events || []) { const s = (tl.scenes || []).find((x) => x.id === e.scene); if (s && (e.t < s.start || e.t > s.end)) out.push(`evento ${e.id} fora da cena ${s.id}`); }
  const sfxCat = catalog('sfx'); const uses = {};
  for (const x of tl.sfx || []) {
    if (!x.asset) continue;
    uses[x.asset] = (uses[x.asset] || 0) + 1;
    const c = sfxCat.find((e) => e.id === x.asset);
    if (!c) out.push(`sfx ${x.asset} não está no catálogo`); else if (!c.license) out.push(`sfx ${x.asset} sem licença`);
  }
  for (const [id, n] of Object.entries(uses)) if (n > 3) out.push(`sfx ${id} usado ${n}× (use variantes da família)`);
  if (!tl.music || !tl.music.file) out.push('sem trilha (padrão: nunca vídeo com fundo mudo)');
  console.log(out.length ? out.map((o) => `✗ ${o}`).join('\n') : '✓ timeline ok');
  return out.length;
}

function show() {
  console.log(`${tl.duration}s · ${tl.fps}fps · ${(tl.formats || []).join(', ')} · trilha: ${tl.music?.id || tl.music?.file || '—'}`);
  for (const s of tl.scenes || []) {
    const v = (tl.vo || []).filter((x) => x.start >= s.start && x.start < s.end).map((x) => x.id).join(',');
    console.log(`${s.id.padEnd(4)} ${String(s.start).padStart(6)}–${String(s.end).padEnd(6)} ${(s.block || '').padEnd(12)} ${v ? `[${v}] ` : ''}${s.on_screen || s.note || ''}`);
  }
}

const dur = (f) => +JSON.parse(execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', f], { encoding: 'utf8' })).format.duration;

if (cmd === 'show') show();
else if (cmd === 'check') process.exitCode = check() ? 1 : 0;
else if (cmd === 'vo') {
  const v = (tl.vo || []).find((x) => x.id === a); if (!v || !b) usage();
  mkdirSync(join(dir, 'audio', 'vo'), { recursive: true });
  const dest = join('audio', 'vo', `${a}${extname(b)}`);
  copyFileSync(b, join(dir, dest));
  const oldLen = r3(v.end - v.start), newLen = r3(dur(b)), delta = r3(newLen - oldLen), oldEnd = v.end;
  const k = newLen / oldLen;
  for (const w of v.words || []) { w.s = r3(v.start + (w.s - v.start) * k); w.e = r3(v.start + (w.e - v.start) * k); }
  if (v.words?.length) v.words_approx = true; // tempos por palavra estimados: refazer com o script words do kit para precisão
  v.end = r3(v.start + newLen); v.file = dest;
  const sc = (tl.scenes || []).find((s) => s.start <= v.start && v.start < s.end);
  if (sc) sc.end = r3(sc.end + delta);
  shiftAfter(oldEnd, delta, { vo: v, scene: sc });
  save(); console.log(`${a}: ${oldLen}s → ${newLen}s (${delta >= 0 ? '+' : ''}${delta}s); tudo depois foi reencaixado. Duração: ${tl.duration}s`); check();
} else if (cmd === 'dur') {
  const s = (tl.scenes || []).find((x) => x.id === a); if (!s || !b || !(+b > 0)) usage();
  const before = r3(s.end - s.start);
  if (tl.scenes.some((x) => x.vo?.length) && tl.scenes.every((x) => !x.vo?.length || x.vo.every((id) => tl.vo?.find((v) => v.id === id)?.length != null))) {
    // timeline que nasce do áudio (layout do kit): grava a regra na cena (min com fala, len sem fala) e recalcula,
    // senão o próximo relayout/tts desfaz a mudança
    if (s.vo?.length) s.min = r3(+b); else s.len = r3(+b);
    layout(tl);
  } else {
    const delta = r3(+b - before), oldEnd = s.end;
    s.end = r3(s.start + +b); shiftAfter(oldEnd, delta, { scene: s });
  }
  const now = r3(s.end - s.start), delta = r3(now - before);
  save(); console.log(`${a}: agora ${now}s (${delta >= 0 ? '+' : ''}${delta}s)${now > +b + 0.01 ? ` — a fala ocupa ${now}s, não dá para encurtar mais sem mexer na voz` : ''}. Duração: ${tl.duration}s`); check();
} else if (cmd === 'vol') {
  const db = +b; if (!a || b === undefined || !Number.isFinite(db) || db < -40 || db > 12) { console.log('vol: dB entre -40 e +12'); process.exit(1); }
  const r = Math.round(db * 10) / 10;
  if (a === 'voz' || a === 'efeitos') { tl.mix = { ...(tl.mix || {}), [a === 'voz' ? 'vo_db' : 'sfx_db']: r }; }
  else if (a === 'trilha') { if (!tl.music) { console.log('sem trilha na timeline'); process.exit(1); } tl.music.gain_db = r; }
  else {
    const cues = (tl.sfx || []).filter((x) => x.event === a);
    if (!cues.length) { console.log(`evento ${a} sem som em timeline.sfx`); process.exit(1); }
    for (const c of cues) c.gain_db = r;
  }
  save(); console.log(`volume ${a}: ${r} dB  → rode sfx.mjs (se for evento) e mix.mjs`);
} else if (cmd === 'text') {
  const s = (tl.scenes || []).find((x) => x.id === a) || (tl.captions || []).find((x) => x.id === a); if (!s || b === undefined) usage();
  if ('on_screen' in s || !('text' in s)) s.on_screen = b; else s.text = b;
  save(); const need = readMin(b), len = r3(s.end - s.start);
  console.log(`${a}: "${b}" (${words(b)} palavras, leitura ${need.toFixed(1)}s, cena ${len}s)${len < need ? `  ✗ aumente: node tools/video/timeline.mjs dur ${dir} ${a} ${need.toFixed(1)}` : ''}`);
} else if (cmd === 'music') {
  const m = catalog('music').find((x) => x.id === a);
  if (!m) { console.log(`${a} não está em library/audio/music.json. Busque: node tools/audio/catalog.mjs search music --mood <x> --n 3`); process.exit(1); }
  if (!m.license) { console.log(`${a} sem licença: não pode ser usada.`); process.exit(1); }
  const gi = rest.indexOf('--gain'); const gain = gi >= 0 ? +rest[gi + 1] : (tl.music?.gain_db ?? -18);
  tl.music = { ...(tl.music || {}), id: m.id, file: `library/audio/${m.file}`, bpm: m.bpm ?? tl.music?.bpm ?? null, gain_db: gain, license: m.license };
  save(); console.log(`trilha → ${m.id} (${m.bpm ?? '?'} BPM, ${m.duration_s}s, ${m.license})${m.duration_s < tl.duration ? `  ⚠ trilha mais curta que o vídeo (${tl.duration}s): editar/loopar` : ''}`);
} else usage();
