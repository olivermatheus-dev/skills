// Monta e exporta o vídeo em cada formato: troca os marcadores do composition.html, copia a marca da empresa
// e o runtime do kit, renderiza com o HyperFrames e junta o audio/mix.wav. (Base: kit do Ludus.)
//
// Marcadores no composition.html: __W__ __H__ __FORMAT__ __DURATION__ __TIMELINE__ __TIME_OFFSET__, __S:<cena>__ (início),
// __D:<cena>__ (duração), __E:<evento>__ (segundo) e {{i:<ícone>}}
// (Lucide, runtime/icons.json). No render, a pasta tem: brand/ (companies/<slug>/brand), kit/ (gsap, motion.js,
// tl.js), lib/motion/ (galeria library/motion), data/ e assets/ do vídeo.
//
// **Motion blur** (padrão): renderiza a 60 quadros duas vezes — a segunda com o relógio meio quadro atrás
// (`__TIME_OFFSET__`, lido por `M.offset`) —, intercala em 120 amostras/s e cada quadro de 30 soma três:
// 1/60 s de exposição, obturador a 180°. `--no-blur` renderiza direto a 30; `--fps=60` exporta a 60 sem rastro.
// `--blur=nativo[:N]` usa o motion blur nativo do HyperFrames (native-blur.mjs: até 16 amostras por quadro, rastro
// liso em vez de 3 cópias), ~7–8× mais lento: para a versão final de vídeo com movimento rápido (tarefa 033).
//
// Uso: node tools/video-kit/scripts/produce.mjs <pasta> [--only=9x16] [--draft] [--build-only] [--no-blur] [--blur=nativo[:N]] [--fps=60] [--v=3] [--mute]
//   → exports/<AAAA-MM-DD-nome>-<formato>-vNN.mp4  (rascunho: -rascunho.mp4, sobrescreve; `nome_export` na timeline troca o nome)
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { HUB, KIT, video, ff } from './lib.mjs';
import { compor } from './compor.mjs';

const FORMATS = { '4x5': { W: 1080, H: 1350 }, '9x16': { W: 1080, H: 1920 }, '16x9': { W: 1920, H: 1080 }, '1x1': { W: 1080, H: 1080 } };
const ALIAS = { story: '9x16', reels: '9x16', feed: '4x5' };

const v = video(process.argv[2]);
const flags = process.argv.slice(3);
const flag = (n) => flags.find((f) => f.startsWith(`--${n}=`))?.split('=')[1];
const draft = flags.includes('--draft');
const buildOnly = flags.includes('--build-only');
const fps60 = flags.includes('--fps=60');
const mute = flags.includes('--mute');
const nativeArg = flag('blur')?.match(/^nativo(?::(\d+))?$/);
if (flag('blur') && !nativeArg) throw new Error(`--blur=${flag('blur')}: use --blur=nativo ou --blur=nativo:N (N amostras por quadro)`);
const native = !draft && !fps60 && !flags.includes('--no-blur') && !!nativeArg;
const blur = !draft && !fps60 && !flags.includes('--no-blur') && !native;

const tl = v.tl;
const duration = tl.duration ?? tl.scenes.at(-1).end;
const icons = JSON.parse(readFileSync(join(KIT, 'runtime', 'icons.json'), 'utf8'));
// vídeo montado por blocos (045): a composição é gerada da timeline a cada produce, nunca editada à mão
if (tl.scenes.some((s) => s.use)) compor(v);
const template = readFileSync(join(v.dir, 'composition.html'), 'utf8');
const hf = join(HUB, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs');
const mix = join(v.dir, 'audio', 'mix.wav');
if (!buildOnly && !mute && !existsSync(mix)) throw new Error('sem audio/mix.wav: rode mix.mjs (ou --mute para testar sem som)');

const only = flag('only');
const targets = (only ? only.split(',') : tl.formats || ['4x5', '9x16']).map((f) => ALIAS[f] || f);
for (const f of targets) if (!FORMATS[f]) throw new Error(`formato desconhecido: ${f} (${Object.keys(FORMATS).join(', ')})`);

// versão: a próxima livre para este vídeo (todos os formatos da rodada saem com o mesmo número)
const exportsDir = join(v.dir, 'exports');
const existing = existsSync(exportsDir) ? readdirSync(exportsDir).map((f) => +(f.match(/-v(\d+)\.mp4$/)?.[1] ?? 0)) : [];
const version = String(flag('v') ?? Math.max(0, ...existing) + 1).padStart(2, '0');

function build(format, offset) {
  const { W, H } = FORMATS[format];
  const html = template
    .replaceAll('__W__', W).replaceAll('__H__', H).replaceAll('__FORMAT__', format).replaceAll('__DURATION__', duration)
    .replaceAll('__TIMELINE__', JSON.stringify({ ...tl, duration, format, W, H }))
    .replaceAll('__TIME_OFFSET__', String(offset))
    .replace(/__([SDE]):([\w-]+)__/g, (m, k, id) => {
      if (k === 'E') { const e = (tl.events || []).find((x) => x.id === id); if (!e) throw new Error(`marcador sem evento: ${m}`); return e.t; }
      const sc = tl.scenes.find((x) => x.id === id); if (!sc) throw new Error(`marcador sem cena: ${m}`);
      return k === 'S' ? sc.start : +(sc.end - sc.start).toFixed(3);
    })
    .replace(/\{\{i:([a-z0-9-]+)\}\}/g, (m, icon) => {
      if (!icons[icon]) throw new Error(`ícone ausente em tools/video-kit/runtime/icons.json: ${icon} (copie o SVG do Lucide para lá)`);
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</svg>`;
    });
  const dir = join(v.dir, 'render', offset ? `${format}-b` : format);
  // limpa o conteúdo (não a pasta: no Windows ela pode estar aberta num terminal ou no Explorer)
  if (existsSync(dir)) for (const f of readdirSync(dir)) rmSync(join(dir, f), { recursive: true, force: true });
  mkdirSync(join(dir, 'kit'), { recursive: true });
  if (v.companyDir && existsSync(join(v.companyDir, 'brand'))) cpSync(join(v.companyDir, 'brand'), join(dir, 'brand'), { recursive: true });
  for (const f of ['motion.js', 'tl.js', 'blocos.js']) cpSync(join(KIT, 'runtime', f), join(dir, 'kit', f));
  cpSync(join(HUB, 'node_modules', 'gsap', 'dist', 'gsap.min.js'), join(dir, 'kit', 'gsap.min.js'));
  // galeria de componentes de motion (library/motion) → lib/motion/<categoria>/<id>/ (ex.: lib/motion/cta/navegador/navegador.js)
  if (existsSync(join(HUB, 'library', 'motion'))) cpSync(join(HUB, 'library', 'motion'), join(dir, 'lib', 'motion'), { recursive: true });
  // numa variante (045 B), data/ e assets/ vêm do projeto de origem quando a variante não tem os seus
  for (const d of ['data', 'assets']) {
    const src = [v.dir, tl.origem && join(v.dir, tl.origem)].filter(Boolean).map((b) => join(b, d)).find(existsSync);
    if (src) cpSync(src, join(dir, d), { recursive: true });
  }
  writeFileSync(join(dir, 'index.html'), html);
  return dir;
}

for (const format of targets) {
  // um projeto do HyperFrames por formato (e por passe): ele exige um index.html só por pasta
  const passes = blur ? [0, 1 / 120] : [0];
  const silents = [];
  for (const offset of passes) {
    const dir = build(format, offset);
    if (buildOnly) break;
    if (native) {
      // um passe só, a 30: o próprio HyperFrames tira as amostras dentro do obturador
      execFileSync(process.execPath, [join(KIT, 'scripts', 'native-blur.mjs'), dir, join(dir, `${format}-silent.mp4`), '--fps=30', `--amostras=${nativeArg[1] ?? 'auto'}`], { stdio: 'inherit' });
      silents.push(join(dir, `${format}-silent.mp4`));
      continue;
    }
    // o HyperFrames do projeto (versão fixa), nunca o do npx: fora daqui o npx baixa a mais nova e o render muda sem aviso
    execFileSync(process.execPath, [hf, 'render', '-o', `${format}-silent.mp4`, '-f', blur || fps60 ? '60' : '30', '-q', draft ? 'draft' : 'high'], { cwd: dir, stdio: 'inherit' });
    silents.push(join(dir, `${format}-silent.mp4`));
  }
  if (buildOnly) { console.log(`${format}: montado em render/${format}/ (abra o index.html ou rode check.mjs)`); continue; }

  mkdirSync(exportsDir, { recursive: true });
  const out = join(exportsDir, `${tl.nome_export || v.name}-${format}${draft ? '-rascunho' : `-v${version}`}${fps60 ? '-60fps' : ''}.mp4`);
  // BT.709 completo (matriz, primárias e transferência), no stream e no contêiner: sem isso a cor da marca muda em alguns players
  const bt709 = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-x264-params', 'colorprim=bt709:transfer=bt709:colormatrix=bt709'];
  // o passe B mostra a cena meio quadro atrás; intercalado antes do A, dá uma amostra a cada 1/120 s, e o
  // quadro de saída soma as três amostras de t − 1/120 a t + 1/120 (1/60 s de exposição, centrada)
  const vid = blur
    ? ['-filter_complex', "[0:v]setpts=PTS+1/(120*TB)[a];[1:v][a]interleave,tmix=frames=3:weights='1 1 1',select='eq(mod(n\\,4)\\,2)',setpts=N/(30*TB),setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv[v]",
       '-map', '[v]', '-r', '30', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', ...bt709]
    : ['-vf', 'setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv', '-map', '0:v', '-c:v', 'libx264', '-crf', draft ? '23' : '16', '-preset', draft ? 'veryfast' : 'slow', '-pix_fmt', 'yuv420p', ...bt709];
  ff([...silents.flatMap((s) => ['-i', s]), ...(mute ? [] : ['-i', mix]), ...vid, ...(mute ? ['-an'] : ['-map', `${silents.length}:a`, '-c:a', 'aac', '-b:a', '192k']), '-t', String(duration), '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log(`✓ ${out}`);
}
