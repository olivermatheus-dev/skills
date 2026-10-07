// Encaixa a voz FINAL (ElevenLabs, ou qualquer arquivo gravado) no lugar do rascunho.
// Para cada arquivo: guarda o original, corta o silêncio das pontas, padroniza (mono 48 kHz, sem grave
// abaixo de 70 Hz), mede, reencaixa cenas e eventos (os presos a palavras andam junto) e mostra
// quanto cada fala mudou. Depois: check → build → olhar as folhas → exportar.
//
// Uso:
//   node tools/video-kit/scripts/fit-vo.mjs <pasta> <fala> <arquivo> [--words <json>] [--voice <id>]
//   node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta-com-arquivos>      (f1.mp3, f2.mp3… pelo nome;
//     f1.words.json ao lado = tempos exatos daquela fala, como o elevenlabs.mjs grava)
// --words: tempos por palavra exatos ([{w, s}] em segundos, relativos ao arquivo original — a API da
// ElevenLabs "with timestamps" devolve isso). Sem ele, as palavras são estimadas pela proporção do
// rascunho (words_approx: true) — confira os gestos presos a palavras na folha de contato.
import { mkdirSync, copyFileSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { KIT, video, prepVoice, speechBounds, layout, closeWords, snapWords, r3 } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const v = video(args[0]);
const finalDir = join(v.dir, 'audio', 'vo', 'final');
mkdirSync(finalDir, { recursive: true });

const jobs = opt('dir')
  ? readdirSync(opt('dir')).filter((f) => /\.(mp3|wav|m4a|flac|ogg)$/i.test(f)).map((f) => {
    const id = basename(f, extname(f)), w = join(opt('dir'), `${id}.words.json`);
    return { id, file: join(opt('dir'), f), words: existsSync(w) ? w : undefined };
  })
  : [{ id: args[1], file: args[2], words: opt('words') }];
if (!jobs.length || !jobs[0].id || !jobs[0].file) {
  console.log('Uso: fit-vo.mjs <pasta> <fala> <arquivo> [--words <json>] | fit-vo.mjs <pasta> --dir <pasta-com-arquivos>');
  process.exit(1);
}

const report = [];
for (const { id, file, words } of jobs) {
  const x = (v.tl.vo || []).find((y) => y.id === id);
  if (!x) { console.log(`? ${basename(file)}: não há fala "${id}" na timeline (pulei)`); continue; }
  const keep = join(finalDir, `${id}${extname(file)}`);
  if (file !== keep) copyFileSync(file, keep);
  const before = x.length;
  x.start ??= 0; // fala que nunca teve rascunho: layout() posiciona depois
  const out = join(v.dir, 'audio', 'vo', `${id}.wav`);
  const { offset, length } = prepVoice(keep, out);
  if (words) {
    const exact = JSON.parse(readFileSync(words, 'utf8'));
    const { begin } = speechBounds(keep);
    // tempos no arquivo tratado, corrigidos pelo próprio som (pausas = âncoras), depois no relógio do vídeo
    const rel = snapWords(out, exact.map((w) => ({ w: w.w ?? w.word, s: r3(Math.max(0, (w.s ?? w.start) - begin + offset)) })));
    x.words = closeWords(rel.map((w) => ({ w: w.w, s: r3(x.start + w.s) })), x.start + length);
    delete x.words_approx;
  } else if (x.words?.length && before) {
    const k = length / before;
    x.words = x.words.map((w) => ({ w: w.w, s: r3(x.start + (w.s - x.start) * k), e: r3(x.start + (w.e - x.start) * k) }));
    x.words_approx = true;
  }
  x.length = length;
  x.file = `audio/vo/${id}.wav`;
  x.voice = opt('voice') || v.tl.voice?.final || 'final';
  report.push({ id, before, length });
}
v.tl.voice = { ...(v.tl.voice || {}), stage: 'final' };
layout(v.tl);
v.save();
for (const r of report) {
  const d = r3(r.length - (r.before ?? 0));
  console.log(`${r.id}  rascunho ${r.before?.toFixed(2) ?? '?'} s → final ${r.length.toFixed(2)} s  (${d >= 0 ? '+' : ''}${d.toFixed(2)} s)${Math.abs(d) > 0.6 ? '  ⚠ mudou bastante: confira a cena e o texto na tela' : ''}`);
}
console.log(`✓ timeline reencaixada: ${v.tl.duration} s`);
if (report.some((r) => v.tl.vo.find((x) => x.id === r.id)?.words_approx)) console.log('⚠ tempos por palavra estimados: confira na folha de contato os gestos presos a palavras (ou passe --words).');
try { execFileSync(process.execPath, [join(KIT, '..', 'video', 'timeline.mjs'), 'check', v.dir], { stdio: 'inherit', cwd: join(KIT, '..', '..') }); } catch { /* pendências já impressas */ }
