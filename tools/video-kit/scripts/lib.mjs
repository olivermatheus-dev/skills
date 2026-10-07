// Base comum dos scripts do kit: pasta do vídeo, timeline.json, empresa, ffmpeg e medidas de áudio.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

export const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const HUB = resolve(KIT, '..', '..');
export const r3 = (x) => Math.round(x * 1000) / 1000;

/** Pasta do vídeo (companies/<slug>/contents|campaigns/<data-nome>) + timeline + empresa. */
export function video(arg) {
  if (!arg) throw new Error('informe a pasta do vídeo (companies/<slug>/contents/<AAAA-MM-DD-nome>)');
  const dir = resolve(arg);
  const file = join(dir, 'timeline.json');
  if (!existsSync(file)) throw new Error(`sem ${file}`);
  const parts = dir.split(/[\\/]/);
  const i = parts.lastIndexOf('companies');
  const slug = i >= 0 ? parts[i + 1] : null;
  const companyDir = slug ? join(HUB, 'companies', slug) : null;
  const tl = JSON.parse(readFileSync(file, 'utf8'));
  return { dir, file, tl, slug, companyDir, name: basename(dir), save: () => writeFileSync(file, JSON.stringify(tl, null, 2) + '\n') };
}

export const json = (f, fallback) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : fallback);

/** Catálogo da biblioteca de áudio (library/audio/<k>.json). */
export const catalog = (k) => json(join(HUB, 'library', 'audio', `${k}.json`), []);

export function ff(args, opts = {}) {
  return execFileSync('ffmpeg', ['-y', '-hide_banner', '-v', 'error', ...args], { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 256 << 20, ...opts });
}
export function duration(file) {
  return +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim();
}

/** Onde a fala começa e termina de fato (o TTS deixa silêncio nas pontas). */
export function speechBounds(file, threshold = '-45dB') {
  const total = duration(file);
  const log = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', `silencedetect=n=${threshold}:d=0.05`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const starts = [...log.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => Math.max(0, +m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const begin = starts[0] != null && starts[0] < 0.02 && ends[0] != null ? ends[0] : 0;
  const last = starts.at(-1);
  const end = last != null && last > begin && (ends.length < starts.length || total - ends.at(-1) < 0.02) ? last : total;
  return { begin: r3(begin), end: r3(end), total: r3(total) };
}

/** Prepara um arquivo de voz: corta silêncio das pontas (deixa `pad` s), mono 48 kHz, corta grave abaixo de 70 Hz e suaviza as pontas. O volume final sai na mixagem. */
export function prepVoice(src, dest, { pad = 0.04 } = {}) {
  const { begin, end } = speechBounds(src);
  const from = Math.max(0, begin - pad);
  const to = end + pad;
  ff(['-i', src, '-ss', String(from), '-to', String(to), '-af', 'highpass=f=70,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse', '-ac', '1', '-ar', '48000', dest]);
  return { offset: r3(begin - from), length: r3(duration(dest)) };
}

/** Voz escolhida para o vídeo: timeline.voice > brand/voices.json da empresa (rascunho) > Thalita (padrão do hub). */
export function voiceFor(v, stage = 'draft') {
  if (v.tl.voice?.[stage]) return resolveVoice(v.tl.voice[stage]);
  const brand = v.companyDir ? json(join(v.companyDir, 'brand', 'voices.json'), null) : null;
  return resolveVoice(brand?.[stage] || 'edge-thalita');
}
export function resolveVoice(id) {
  const all = json(join(HUB, 'library', 'voices', 'voices.json'), []);
  const found = all.find((x) => x.id === id);
  if (!found) throw new Error(`voz "${id}" não está em library/voices/voices.json`);
  return found;
}

/**
 * Monta os tempos do vídeo a partir das falas (o áudio manda no relógio).
 * Cena: `vo` (ids das falas), `lead` (respiro antes da 1ª fala; 0,3 na 1ª cena, 0,15 nas outras),
 * `gap` (entre falas da cena, 0,2), `tail` (depois da última fala, 0,3), `min` (duração mínima),
 * `len` (duração fixa de cena sem fala, padrão 2,5), `pause: true` (respiro maior antes, na virada: 0,5 + tail da cena anterior ≤ 1 s).
 * Evento: `t` fixo, ou âncora relativa — `word: "f2:WhatsApp"` (+`offset`), `at` (s depois do início da cena)
 * ou `before_end` (s antes do fim da cena). Âncoras recalculam `t` toda vez.
 */
export function layout(tl) {
  const vo = Object.fromEntries((tl.vo || []).map((x) => [x.id, x]));
  let t = 0;
  tl.scenes.forEach((s, k) => {
    s.start = r3(t);
    const ids = s.vo || [];
    if (ids.length) {
      let cur = t + (s.lead ?? (k === 0 ? 0.3 : s.pause ? 0.5 : 0.15));
      ids.forEach((id, j) => {
        const x = vo[id];
        if (!x) throw new Error(`cena ${s.id}: fala ${id} não existe em vo[]`);
        if (x.length == null) throw new Error(`fala ${id} sem áudio: rode tts.mjs`);
        if (j) cur += s.gap ?? 0.2;
        const d = r3(cur - (x.start ?? cur));
        x.start = r3(cur);
        x.end = r3(cur + x.length);
        for (const w of x.words || []) { w.s = r3(w.s + d); w.e = r3(w.e + d); }
        cur = x.end;
      });
      s.end = r3(Math.max(cur + (s.tail ?? 0.3), s.start + (s.min ?? 0)));
    } else s.end = r3(s.start + (s.len ?? Math.max(2.5, s.min ?? 0)));
    t = s.end;
  });
  tl.duration = r3(t);
  for (const e of tl.events || []) {
    const sc = tl.scenes.find((s) => s.id === e.scene);
    if (e.word) {
      const [vid, word] = e.word.split(':');
      const x = vo[vid];
      const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '');
      const w = /^\d+$/.test(word) ? x?.words?.[+word] : x?.words?.find((y) => fold(y.w) === fold(word));
      if (!w) throw new Error(`evento ${e.id}: palavra "${e.word}" não encontrada`);
      e.t = r3(w.s + (e.offset ?? 0));
      e.scene = tl.scenes.find((s) => s.start <= e.t && e.t < s.end)?.id ?? tl.scenes.at(-1).id;
    } else if (e.at != null && sc) e.t = r3(sc.start + e.at);
    else if (e.before_end != null && sc) e.t = r3(sc.end - e.before_end);
  }
  (tl.events || []).sort((a, b) => a.t - b.t);
  return tl;
}

/**
 * Corrige os tempos por palavra de uma transcrição (o Whisper costuma marcar 0,1–0,3 s DEPOIS da fala real) usando o
 * próprio áudio: a 1ª palavra vai para o início real do som e cada palavra que vem depois de uma pausa vai para o fim
 * dessa pausa; as palavras entre duas âncoras andam junto com a âncora anterior. `rel` = [{w, s}] relativos ao arquivo.
 */
export function snapWords(file, rel, { pad = 0.04 } = {}) {
  const words = rel.filter((w) => /[\p{L}\p{N}]/u.test(w.w)).map((w) => ({ ...w }));
  if (!words.length) return words;
  const log = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=n=-40dB:d=0.1', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sil = [...log.matchAll(/silence_start: (-?[\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => ({ a: Math.max(0, +m[1]), b: +m[2] }));
  // 1ª palavra no início do som, só se for perto (um suspiro antes da fala não pode puxar a palavra para trás)
  const t0 = sil[0] && sil[0].a < 0.02 ? sil[0].b : pad;
  const anchors = Math.abs(words[0].s - t0) < 0.35 ? [{ i: 0, t: t0 }] : [];
  for (const { a, b } of sil) {
    if (a < 0.05) continue;
    const i = words.findIndex((w) => w.s > a - 0.1);
    if (i >= 0 && Math.abs(words[i].s - b) < 0.5 && i > (anchors.at(-1)?.i ?? -1)) anchors.push({ i, t: b });
  }
  anchors.forEach((an, k) => {
    const d = an.t - words[an.i].s, end = anchors[k + 1]?.i ?? words.length;
    for (let j = an.i; j < end; j++) words[j].s = r3(Math.max(0, words[j].s + d));
  });
  for (let j = 1; j < words.length; j++) if (words[j].s <= words[j - 1].s) words[j].s = r3(words[j - 1].s + 0.05);
  return words;
}

/** Palavras com fim: o fim de cada uma é o começo da próxima (o último vai até o fim da fala). */
export function closeWords(words, end) {
  return words.map((w, i) => ({ w: w.w, s: r3(w.s), e: r3(Math.max(w.s, i + 1 < words.length ? words[i + 1].s : end)) }));
}

/** Caminho do Python real. No Windows, `python` direto cai no atalho da Microsoft Store; os shims do pyenv
 *  são .bat e só resolvem via shell. Ordem: $PYTHON → o que o shell acha (sys.executable) → 'python'. */
let pythonPath;
export function python() {
  if (pythonPath) return pythonPath;
  if (process.env.PYTHON) return (pythonPath = process.env.PYTHON);
  try {
    const exe = execFileSync('python -c "import sys; print(sys.executable)"', { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (exe && existsSync(exe)) return (pythonPath = exe);
  } catch { /* cai no padrão */ }
  return (pythonPath = 'python');
}
