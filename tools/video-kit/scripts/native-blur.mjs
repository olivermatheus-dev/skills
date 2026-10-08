// Render com o motion blur NATIVO do HyperFrames (sub-quadro: N capturas por quadro, obturador 180°).
// O CLI não expõe a opção: chamamos o producer que vem embutido no pacote `hyperframes` (versão fixa no
// package.json). Ele integra tudo o que a composição faz dentro do obturador (posição, escala, rotação, opacidade),
// mas captura por screenshot em PNG: bem mais lento que o 2 passes do kit. Usado pelo produce.mjs --blur=nativo.
// Teste e números: roadmap/tasks/033-upgrade-hyperframes/TASK.md.
//
// Uso: node tools/video-kit/scripts/native-blur.mjs <projeto-render> <saida.mp4> [--fps=30] [--amostras=auto|N] [--quality=high|draft]
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { HUB } from './lib.mjs';

const [project, out, ...flags] = process.argv.slice(2);
if (!project || !out) throw new Error('uso: native-blur.mjs <projeto-render> <saida.mp4> [--fps=30] [--amostras=auto|N]');
const flag = (n, d) => flags.find((f) => f.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const fps = +flag('fps', 30);
const samples = flag('amostras', 'auto');
const quality = flag('quality', 'high');

// o bundle tem nome com hash: acha pelo carregador do próprio CLI (o mesmo que o `hyperframes render` usa)
const dist = join(HUB, 'node_modules', 'hyperframes', 'dist');
const loader = readdirSync(dist).filter((f) => f.startsWith('chunk-')).find((f) => readFileSync(join(dist, f), 'utf8').includes('async function loadProducer()'));
const src = loader && readFileSync(join(dist, loader), 'utf8').match(/import\("\.\/(src-[A-Za-z0-9_-]+\.js)"\)/)?.[1];
if (!src) throw new Error('producer do HyperFrames não encontrado (a estrutura do pacote mudou?): use o blur padrão do kit');
const producer = await import(pathToFileURL(join(dist, src)).href);

// o motion blur nativo exige captura por screenshot (o fast capture é recusado)
const engine = producer.resolveConfig({ browserGpuMode: 'auto', forceScreenshot: true });
const motionBlur = { shutterAngle: 180, ...(samples === 'auto' ? {} : { samplesPerFrame: +samples }) };
const job = producer.createRenderJob({ fps, quality, format: 'mp4', motionBlur, producerConfig: engine, logger: producer.createConsoleLogger?.('warn') });
const t0 = Date.now();
let last = -1;
await producer.executeRenderJob(job, resolve(project), resolve(out), (j) => {
  const p = Math.floor(j.progress / 10) * 10;
  if (p !== last) { last = p; process.stdout.write(`${p}% `); }
});
for (const w of job.warnings || []) console.warn(`  [${w.code}] ${w.message}`);
console.log(`\nblur nativo (${samples === 'auto' ? 'amostras adaptativas, até 16' : `${samples} amostras`}): ${((Date.now() - t0) / 1000).toFixed(0)} s`);
