// Locução ÚNICA (um arquivo com todas as falas, ex.: gerado pelo Oliver no site da ElevenLabs) → uma fala por arquivo,
// com tempo exato de cada palavra, encaixada na timeline. O texto de cada fala vem de vo[].text do timeline.json.
//   1. transcreve o arquivo inteiro (asr.py, faster-whisper local) e acha onde cada fala termina;
//   2. corta no meio da maior pausa entre uma fala e a próxima (silencedetect);
//   3. transcreve cada pedaço de novo (tempos por palavra mais precisos) → audio/vo/split/<fala>.wav + .words.json;
//   4. chama fit-vo.mjs --dir (corta silêncio das pontas, padroniza, reencaixa cenas e eventos).
// Uso: node tools/video-kit/scripts/split-vo.mjs <pasta> <audio> [--voice el-carla] [--model medium] [--cuts 4.8,11.4,…]
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { KIT, HUB, video, duration, python } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const v = video(args[0]);
const src = args[1];
if (!src || !existsSync(src)) { console.log('Uso: split-vo.mjs <pasta> <audio> [--voice <id>] [--model medium] [--cuts a,b,…]'); process.exit(1); }
const model = opt('model') || 'medium';
const out = join(v.dir, 'audio', 'vo', 'split');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const asr = (file, json) => { execFileSync(python(), [join(KIT, 'scripts', 'asr.py'), file, json, model], { stdio: ['ignore', 'ignore', 'inherit'] }); return JSON.parse(readFileSync(json, 'utf8')); };
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '');
const vo = v.tl.vo || [];
const total = duration(src);

let cuts = opt('cuts')?.split(',').map(Number);
if (!cuts) {
  const all = asr(src, join(out, '_tudo.json'));
  const log = spawnSync('ffmpeg', ['-hide_banner', '-i', src, '-af', 'silencedetect=n=-40dB:d=0.2', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sil = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => ({ a: +m[1], b: +m[2] }));
  // fim de cada fala: a última palavra dela na transcrição (busca para a frente, tolerante a palavra trocada)
  let k = 0;
  cuts = [];
  vo.slice(0, -1).forEach((x, i) => {
    const ws = (x.say ?? x.text).split(/\s+/).map(fold).filter(Boolean);
    const last = ws.at(-1), min = k + Math.floor(ws.length * 0.6);
    let j = all.findIndex((w, idx) => idx >= min && fold(w.w) === last);
    if (j < 0) j = Math.min(all.length - 2, k + ws.length - 1);
    const end = all[j].e, next = all[j + 1]?.s ?? end;
    const gap = sil.filter((s) => s.b > end - 0.3 && s.a < next + 0.8).sort((p, q) => (q.b - q.a) - (p.b - p.a))[0];
    cuts.push(+(gap ? (gap.a + gap.b) / 2 : (end + next) / 2).toFixed(3));
    k = j + 1;
    console.log(`${x.id} termina em "${all[j].w}" ${end.toFixed(2)} s → corte ${cuts.at(-1)} s`);
  });
}
const edges = [0, ...cuts, total];
vo.forEach((x, i) => {
  const wav = join(out, `${x.id}.wav`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, '-ss', String(edges[i]), '-to', String(edges[i + 1]), '-ac', '1', '-ar', '48000', wav]);
  let words = asr(wav, join(out, `${x.id}.words.json`)).filter((w) => fold(w.w)).map((w) => ({ w: w.w, s: w.s }));
  // mesma contagem de palavras do roteiro → usa a grafia do roteiro (o Whisper escreve "Cazê" para "kz")
  const script = (x.say ?? x.text).split(/\s+/).filter((w) => fold(w));
  if (script.length === words.length) words = words.map((w, k) => ({ w: script[k], s: w.s }));
  else console.log(`  ⚠ ${x.id}: ${words.length} palavras ouvidas × ${script.length} no roteiro — mantive a grafia da transcrição`);
  writeFileSync(join(out, `${x.id}.words.json`), JSON.stringify(words));
  console.log(`${x.id}  ${edges[i].toFixed(2)}–${edges[i + 1].toFixed(2)} s  "${words.map((w) => w.w).join(' ')}"`);
});
rmSync(join(out, '_tudo.json'), { force: true });
execFileSync(process.execPath, [join(KIT, 'scripts', 'fit-vo.mjs'), v.dir, '--dir', out, ...(opt('voice') ? ['--voice', opt('voice')] : [])], { stdio: 'inherit', cwd: HUB });
console.log('Confira no texto acima se cada fala começa e termina na frase certa (senão: --cuts a,b,… em segundos).');
