// Voz FINAL pela API da ElevenLabs (Eleven v4), uma fala = um arquivo, com o tempo exato de cada palavra.
// Só depois do aval da v1.0 (voz de rascunho). Chave: ELEVENLABS_API_KEY do projeto (app → Configurações) ou a geral.
//
// Uso:
//   node tools/video-kit/scripts/elevenlabs.mjs <pasta> --dry                       mostra o texto de cada fala, a voz e os créditos (não gasta)
//   node tools/video-kit/scripts/elevenlabs.mjs <pasta> --aprovado [--only f1,f3]   gera, trata e encaixa (fit-vo.mjs com tempos exatos)
//   node tools/video-kit/scripts/elevenlabs.mjs <pasta> --aprovado --takes 3 [--only f2]   gera 3 versões por fala e PARA (ouvir)
//   node tools/video-kit/scripts/elevenlabs.mjs <pasta> --pick f2=3,f4=1             encaixa as versões escolhidas (não gasta)
// Opções: --voice <id do catálogo> · --format mp3_44100_192 (Creator+) · --stability creative|natural|robust|0..1
//
// Texto de cada fala: vo[].el (versão ElevenLabs, com audio tags do v4: "[animada] Pronto… [suspira] acabou.")
//   > vo[].say (como se fala) > vo[].text. Tags ficam só no `el`: a voz de rascunho leria os colchetes em voz alta.
// Voz de cada fala: --voice > vo[].voice_final > brand/voices.json roles[vo[].role] > timeline.voice.final > brand/voices.json final.
// Ajustes: catálogo (library/voices/voices.json > settings) < vo[].el_settings. v4 aceita só stability e similarity
//   (sem style, speed e SSML/<break>): ritmo e emoção vêm do texto (pontuação, reticências, MAIÚSCULAS, audio tags).
import { mkdirSync, writeFileSync, existsSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { KIT, HUB, video, json, resolveVoice } from './lib.mjs';
import { envFor } from '../../lib/env.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const has = (n) => args.includes(`--${n}`);
const v = video(args[0]);
const outDir = join(v.dir, 'audio', 'vo', 'elevenlabs');
const fitDir = join(outDir, '_encaixe');
const only = opt('only')?.split(',');
const STAB = { creative: 0, natural: 0.5, robust: 1 };
const brand = v.companyDir ? json(join(v.companyDir, 'brand', 'voices.json'), {}) : {};

function voiceOf(x) {
  const id = opt('voice') || x.voice_final || (x.role && brand.roles?.[x.role]) || v.tl.voice?.final || brand.final;
  if (!id) throw new Error(`fala ${x.id}: sem voz final. Defina "final" em companies/${v.slug}/brand/voices.json (catálogo: library/voices/voices.json, entradas el-*).`);
  const voice = resolveVoice(id);
  if (voice.engine !== 'elevenlabs') throw new Error(`voz "${id}" não é da ElevenLabs (engine ${voice.engine})`);
  if (!voice.voice || /^<|TODO/.test(voice.voice)) throw new Error(`voz "${id}" sem voice_id no catálogo`);
  return voice;
}
const textOf = (x) => (x.el ?? x.say ?? x.text ?? '').trim();
const lines = (v.tl.vo || []).filter((x) => !only || only.includes(x.id));

// ---------- --pick: encaixa versões já geradas (sem gastar) ----------
if (opt('pick')) {
  rmSync(fitDir, { recursive: true, force: true }); mkdirSync(fitDir, { recursive: true });
  for (const p of opt('pick').split(',')) {
    const [id, n] = p.split('=');
    const src = join(outDir, `${id}.t${n}.mp3`);
    if (!existsSync(src)) throw new Error(`não achei ${src}`);
    copyFileSync(src, join(fitDir, `${id}.mp3`));
    copyFileSync(join(outDir, `${id}.t${n}.words.json`), join(fitDir, `${id}.words.json`));
  }
  fit();
  process.exit(0);
}

// ---------- plano (sempre impresso) ----------
let total = 0, missing = null;
for (const x of lines) {
  let vid; try { vid = voiceOf(x).id; } catch (e) { vid = '(sem voz)'; missing ??= e.message; }
  const t = textOf(x);
  total += t.length;
  console.log(`${x.id}  ${vid}  ${t.length} car.  "${t}"`);
}
if (missing) console.log(`
⚠ ${missing}`);
const takes = Math.max(1, +(opt('takes') ?? 1));
console.log(`\n${lines.length} falas · ${total} caracteres × ${takes} versão(ões) ≈ ${total * takes} créditos (v4: confira o custo por caractere do seu plano)`);
if (has('dry')) process.exit(0);
if (missing) process.exit(1);

if (!has('aprovado')) {
  console.log('\nParado: a voz final só sai depois do aval da v1.0 (rascunho). Com o aval do Oliver, rode de novo com --aprovado.');
  process.exit(1);
}
const { value: key, from } = envFor('ELEVENLABS_API_KEY', v.slug);
if (!key) { console.log(`Falta ELEVENLABS_API_KEY: app → Configurações (projeto ${v.slug}) ou companies/${v.slug}/.env.`); process.exit(1); }
console.log(`chave: ${from}`);

// ---------- geração ----------
mkdirSync(outDir, { recursive: true });
const logFile = join(outDir, 'log.json');
const log = json(logFile, []);

async function tts(x, voice) {
  const s = { ...(voice.settings || {}), ...(x.el_settings || {}) };
  const st = opt('stability') ?? s.stability ?? 'natural';
  const body = {
    text: textOf(x),
    model_id: s.model || 'eleven_v4',
    voice_settings: { stability: STAB[st] ?? +st, similarity_boost: s.similarity ?? 0.75, use_speaker_boost: s.speaker_boost ?? true },
    language_code: s.language_code ?? 'pt',
    ...(s.seed != null ? { seed: s.seed } : {}),
  };
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.voice}/with-timestamps?output_format=${opt('format') || s.format || 'mp3_44100_128'}`;
  const call = (b) => fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  let r = await call(body);
  if (r.status === 400 || r.status === 422) {
    const err = await r.text();
    if (/language_code/i.test(err)) { delete body.language_code; r = await call(body); } // modelo sem language_code
    else throw new Error(`${x.id}: ElevenLabs ${r.status}: ${err.slice(0, 300)}`);
  }
  if (!r.ok) throw new Error(`${x.id}: ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  return { data, body, requestId: r.headers.get('request-id') };
}

/** Caracteres com tempo → palavras [{w, s}] relativas ao arquivo. Ignora as audio tags ([...]). */
function wordsFrom(al) {
  if (!al?.characters?.length) return [];
  const out = [];
  let cur = null, tag = 0;
  al.characters.forEach((c, i) => {
    if (c === '[') { tag++; return; }
    if (c === ']') { tag = Math.max(0, tag - 1); return; }
    if (tag) return;
    if (/\s/.test(c)) { if (cur) out.push(cur); cur = null; return; }
    if (!cur) cur = { w: '', s: al.character_start_times_seconds[i] };
    cur.w += c;
  });
  if (cur) out.push(cur);
  return out.filter((w) => /[\p{L}\p{N}]/u.test(w.w));
}

for (const x of lines) {
  const voice = voiceOf(x);
  for (let k = 1; k <= takes; k++) {
    const base = takes > 1 ? `${x.id}.t${k}` : x.id;
    const { data, body, requestId } = await tts(x, voice);
    writeFileSync(join(outDir, `${base}.mp3`), Buffer.from(data.audio_base64, 'base64'));
    writeFileSync(join(outDir, `${base}.words.json`), JSON.stringify(wordsFrom(data.alignment), null, 0));
    log.push({ at: new Date().toISOString(), id: x.id, take: k, voice: voice.id, model: body.model_id, settings: body.voice_settings, chars: body.text.length, text: body.text, requestId });
    console.log(`✓ ${base}.mp3`);
  }
}
writeFileSync(logFile, JSON.stringify(log, null, 2) + '\n');

if (takes > 1) {
  console.log(`\nVersões em ${outDir}. Ouça e escolha: node tools/video-kit/scripts/elevenlabs.mjs ${args[0]} --pick ${lines.map((x) => `${x.id}=1`).join(',')}`);
  process.exit(0);
}
rmSync(fitDir, { recursive: true, force: true }); mkdirSync(fitDir, { recursive: true });
for (const x of lines) { copyFileSync(join(outDir, `${x.id}.mp3`), join(fitDir, `${x.id}.mp3`)); copyFileSync(join(outDir, `${x.id}.words.json`), join(fitDir, `${x.id}.words.json`)); }
v.tl.voice = { ...(v.tl.voice || {}), final: v.tl.voice?.final || brand.final };
v.save();
fit();

function fit() {
  // fit-vo pega <id>.words.json ao lado de cada áudio: tempos exatos, sem estimativa
  execFileSync(process.execPath, [join(KIT, 'scripts', 'fit-vo.mjs'), v.dir, '--dir', fitDir], { stdio: 'inherit', cwd: HUB });
}
