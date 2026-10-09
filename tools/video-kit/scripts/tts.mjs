// Voz de RASCUNHO (v1.0) de todas as falas do vídeo, com o tempo de cada palavra, e encaixe da timeline.
// Grátis: Microsoft neural online via edge-tts (edge-*, padrão: Thalita) ou Windows local, offline (win-*). A voz final vem da
// ElevenLabs depois do aval e entra com fit-vo.mjs.
//
// Uso: node tools/video-kit/scripts/tts.mjs <pasta-do-video> [--voice win-maria] [--only f2,f3]
//   → audio/vo/<fala>.wav (cortado nas pontas) · vo[].length/start/end/words · cenas e eventos reencaixados
// Voz: --voice > timeline.voice.draft > companies/<slug>/brand/voices.json (draft) > edge-thalita.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { KIT, video, voiceFor, resolveVoice, layout, r3 } from './lib.mjs';
import { falar, extCru } from './voz.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const v = video(args[0]);
const voice = opt('voice') ? resolveVoice(opt('voice')) : voiceFor(v, 'draft');
const only = opt('only')?.split(',');
const raw = join(v.dir, 'audio', 'vo', 'raw');
mkdirSync(raw, { recursive: true });

for (const x of v.tl.vo || []) {
  if (only && !only.includes(x.id)) continue;
  const text = x.say ?? x.text; // `say` = como se fala (números por extenso), `text` = como se lê
  const { length, words } = falar(voice, text, join(raw, `${x.id}.${extCru(voice)}`), join(v.dir, 'audio', 'vo', `${x.id}.wav`));
  const start = (x.start ??= 0); // a layout() desloca as palavras junto com a fala
  x.file = `audio/vo/${x.id}.wav`;
  x.length = length;
  x.words = words.map((w) => ({ w: w.w, s: r3(start + w.s), e: r3(start + w.e) }));
  x.voice = voice.id;
  delete x.words_approx;
  console.log(`${x.id}  ${length.toFixed(2)} s  ${voice.id}  "${text}"`);
}
v.tl.voice = { ...(v.tl.voice || {}), current: voice.id, stage: 'draft' };
layout(v.tl);
v.save();
console.log(`✓ timeline encaixada: ${v.tl.duration} s · ${v.tl.scenes.length} cenas · ${(v.tl.events || []).length} eventos`);
try { execFileSync(process.execPath, [join(KIT, '..', 'video', 'timeline.mjs'), 'check', v.dir], { stdio: 'inherit', cwd: join(KIT, '..', '..') }); } catch { /* check já imprimiu as pendências */ }
