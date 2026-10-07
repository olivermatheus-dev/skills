// Voz de RASCUNHO (v1.0) de todas as falas do vídeo, com o tempo de cada palavra, e encaixe da timeline.
// Grátis: Microsoft neural online via edge-tts (edge-*, padrão: Thalita) ou Windows local, offline (win-*). A voz final vem da
// ElevenLabs depois do aval e entra com fit-vo.mjs.
//
// Uso: node tools/video-kit/scripts/tts.mjs <pasta-do-video> [--voice win-maria] [--only f2,f3]
//   → audio/vo/<fala>.wav (cortado nas pontas) · vo[].length/start/end/words · cenas e eventos reencaixados
// Voz: --voice > timeline.voice.draft > companies/<slug>/brand/voices.json (draft) > edge-thalita.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { KIT, video, voiceFor, resolveVoice, prepVoice, layout, closeWords, r3, python } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const v = video(args[0]);
const voice = opt('voice') ? resolveVoice(opt('voice')) : voiceFor(v, 'draft');
const only = opt('only')?.split(',');
const raw = join(v.dir, 'audio', 'vo', 'raw');
mkdirSync(raw, { recursive: true });

/** Gera o áudio cru e devolve as palavras com o início de cada uma (s, relativo ao arquivo). */
function synth(text, out) {
  if (voice.engine === 'windows') {
    const res = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(KIT, 'scripts', 'tts-windows.ps1'),
      '-Text', text, '-Voice', voice.voice, '-Out', out, '-Rate', String(voice.settings?.rate ?? 1)], { encoding: 'utf8' });
    return JSON.parse(res.trim().split('\n').at(-1)).map((w) => ({ w: w.w, s: w.s }));
  }
  if (voice.engine === 'edge') {
    const py = `
import asyncio, json, sys, edge_tts
async def main():
    c = edge_tts.Communicate(sys.argv[1], sys.argv[2], rate=sys.argv[3], pitch=sys.argv[4], boundary='WordBoundary')
    words = []
    with open(sys.argv[5], 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 's': round(ch['offset'] / 1e7, 3)})
    print(json.dumps(words))
asyncio.run(main())`;
    const res = execFileSync(python(), ['-c', py, text, voice.voice, voice.settings?.rate ?? '+0%', voice.settings?.pitch ?? '+0Hz', out], { encoding: 'utf8' });
    return JSON.parse(res.trim().split('\n').at(-1));
  }
  throw new Error(`motor de voz "${voice.engine}" não é de rascunho (ElevenLabs entra com fit-vo.mjs)`);
}

for (const x of v.tl.vo || []) {
  if (only && !only.includes(x.id)) continue;
  const text = x.say ?? x.text; // `say` = como se fala (números por extenso), `text` = como se lê
  const src = join(raw, `${x.id}.${voice.engine === 'edge' ? 'mp3' : 'wav'}`);
  const words = synth(text, src);
  const prep = join(v.dir, 'audio', 'vo', `${x.id}.wav`);
  const { offset, length } = prepVoice(src, prep);
  // palavras no tempo do arquivo cortado: o corte tirou (início da fala − respiro)
  const begin = words[0]?.s ?? 0;
  const rel = words.map((w) => ({ w: w.w, s: r3(Math.max(0, w.s - begin + offset)) }));
  const start = (x.start ??= 0); // a layout() desloca as palavras junto com a fala
  x.file = `audio/vo/${x.id}.wav`;
  x.length = length;
  x.words = closeWords(rel.map((w) => ({ ...w, s: start + w.s })), start + length);
  x.voice = voice.id;
  delete x.words_approx;
  console.log(`${x.id}  ${length.toFixed(2)} s  ${voice.id}  "${text}"`);
}
v.tl.voice = { ...(v.tl.voice || {}), current: voice.id, stage: 'draft' };
layout(v.tl);
v.save();
console.log(`✓ timeline encaixada: ${v.tl.duration} s · ${v.tl.scenes.length} cenas · ${(v.tl.events || []).length} eventos`);
try { execFileSync(process.execPath, [join(KIT, '..', 'video', 'timeline.mjs'), 'check', v.dir], { stdio: 'inherit', cwd: join(KIT, '..', '..') }); } catch { /* check já imprimiu as pendências */ }
