// Quadros para conferir antes de exportar (a etapa "olhar os stills nas palavras-chave"): para cada formato,
// o fim assentado de cada cena (0,6 s antes do corte), cada evento 0,6 s depois (o estado já parou) e os
// tempos pedidos. Olhe as folhas você mesmo: texto cortado ou fora da área segura, sobreposição, cursor fora
// do quadro, cor fora da marca, palavra fora do tempo da fala. (Base: kit do Ludus.)
//
// Uso: node tools/video-kit/scripts/check.mjs <pasta> [--only=9x16] [--at=1.2,3.4]
//   → render/<formato>/check/*.png  (rode antes: produce.mjs <pasta> --build-only)
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { HUB, KIT, video } from './lib.mjs';

const v = video(process.argv[2]);
const flags = process.argv.slice(3);
const flag = (n) => flags.find((f) => f.startsWith(`--${n}=`))?.split('=')[1];
const tl = v.tl;
const end = tl.duration ?? tl.scenes.at(-1).end;

// regras de tempo (silêncio entre falas, leitura, cartão final, sfx licenciado…)
try { execFileSync(process.execPath, [join(KIT, '..', 'video', 'timeline.mjs'), 'check', v.dir], { stdio: 'inherit', cwd: HUB }); } catch { /* pendências já impressas */ }

const times = new Set();
for (const s of tl.scenes) times.add(+(s.end - 0.6).toFixed(2));
for (const e of tl.events || []) times.add(+(e.t + 0.6).toFixed(2));
for (const t of (flag('at') || '').split(',').filter(Boolean)) times.add(+t);
const at = [...times].filter((t) => t >= 0 && t <= end).sort((a, b) => a - b);

const formats = (flag('only') || '').split(',').filter(Boolean);
const targets = formats.length ? formats : readdirSync(join(v.dir, 'render')).filter((d) => !d.endsWith('-b') && existsSync(join(v.dir, 'render', d, 'index.html')));
for (const format of targets) {
  const dir = join(v.dir, 'render', format);
  if (!existsSync(join(dir, 'index.html'))) throw new Error(`rode antes: produce.mjs ${v.dir} --build-only`);
  rmSync(join(dir, 'check'), { recursive: true, force: true });
  // o HyperFrames do projeto, nunca o do npx
  execFileSync(process.execPath, [join(HUB, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs'), 'snapshot', '.', '-o', 'check', '--at', at.join(','), '--no-end', '--describe', 'false'],
    { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] });
  console.log(`${format}: ${at.length} quadros → ${join(dir, 'check')}`);
}
