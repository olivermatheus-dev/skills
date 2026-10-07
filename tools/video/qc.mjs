// QC técnico do arquivo renderizado (a entrega real é o MP4, não a timeline).
// Uso:
//   node tools/video/qc.mjs <pasta-do-vídeo | arquivo.mp4> [--lufs -14] [--sheet]
// Na pasta, confere todo .mp4 de exports/ e procura placeholders nos arquivos de texto.
// --sheet gera uma folha de contato do MP4 final em render/qc/ (1 quadro a cada ~0,5 s) para olhar.
// Saída: ❌ crítico (bloqueia entrega) · ⚠️ maior · · menor. Código de saída 1 se houver crítico.
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, basename, dirname, extname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LUFS = +opt('--lufs', -14);
const SHEET = args.includes('--sheet');
if (!target || !existsSync(target)) { console.log('Uso: node tools/video/qc.mjs <pasta|arquivo.mp4> [--lufs -14] [--sheet]'); process.exit(1); }

const FORMATS = { '1080x1350': '4:5', '1080x1920': '9:16', '1920x1080': '16:9', '1080x1080': '1:1' };
const issues = [];
const add = (lvl, file, msg) => issues.push({ lvl, file, msg });

const isDir = statSync(target).isDirectory();
const dir = isDir ? target : basename(dirname(target)) === 'exports' ? dirname(dirname(target)) : dirname(target);
const files = isDir
  ? (existsSync(join(dir, 'exports')) ? readdirSync(join(dir, 'exports')).filter((f) => extname(f) === '.mp4').map((f) => join(dir, 'exports', f)) : [])
  : [target];
const tl = existsSync(join(dir, 'timeline.json')) ? JSON.parse(readFileSync(join(dir, 'timeline.json'), 'utf8')) : null;

// 1. placeholders e afirmações sem fonte (procure de propósito; assistindo não se acha)
if (isDir) {
  const rx = [/\bTODO\b/, /\bFIXME\b/, /\bTBD\b/, /\bXXX\b/, /lorem ipsum/i, /placeholder/i, /\[?a confirmar\]?/i, /watermark/i];
  for (const f of ['composition.html', 'locucao.json', 'timeline.json']) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      const hit = rx.find((r) => r.test(line));
      if (hit) add('crit', f, `linha ${i + 1}: "${line.trim().slice(0, 80)}" (placeholder ou afirmação a confirmar)`);
    });
  }
}
if (!files.length) add('crit', dir, 'nenhum .mp4 em exports/');

const probe = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', f], { encoding: 'utf8' }));
const ff = (f, filter, audio = false) => spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, audio ? '-af' : '-vf', filter, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const frac = (s = '0/1') => { const [a, b] = s.split('/').map(Number); return b ? a / b : 0; };

for (const f of files) {
  const name = basename(f);
  const info = probe(f);
  const v = info.streams.find((s) => s.codec_type === 'video');
  const a = info.streams.find((s) => s.codec_type === 'audio');
  const d = +info.format.duration;
  const mb = (+info.format.size / 1e6).toFixed(1);
  if (!v) { add('crit', name, 'sem trilha de vídeo'); continue; }
  const res = `${v.width}x${v.height}`;
  const fps = frac(v.r_frame_rate), avg = frac(v.avg_frame_rate);
  console.log(`\n${name}: ${res} (${FORMATS[res] || '?'}) · ${v.codec_name} ${v.pix_fmt} · ${fps.toFixed(2)} fps · ${d.toFixed(2)} s · ${mb} MB · cor ${v.color_space || '-'}/${v.color_primaries || '-'}/${v.color_transfer || '-'}` +
    (a ? ` · áudio ${a.codec_name} ${a.sample_rate} Hz ${a.channels} canais` : ' · SEM ÁUDIO'));

  // 2. propriedades reais do arquivo
  if (!FORMATS[res]) add('crit', name, `resolução ${res} fora dos formatos (${Object.keys(FORMATS).join(', ')})`);
  if (v.sample_aspect_ratio && !['1:1', '0:1'].includes(v.sample_aspect_ratio)) add('crit', name, `pixel não quadrado (SAR ${v.sample_aspect_ratio})`);
  if (v.codec_name !== 'h264') add('maior', name, `codec ${v.codec_name}; entrega social = h264`);
  if (v.pix_fmt !== 'yuv420p') add('maior', name, `pix_fmt ${v.pix_fmt}; use yuv420p (compatibilidade)`);
  if (v.color_space !== 'bt709' || v.color_primaries !== 'bt709') add('maior', name, 'cor sem BT.709 marcado: a cor da marca pode mudar (compositing.md §9)');
  if (v.field_order && !['progressive', 'unknown'].includes(v.field_order)) add('crit', name, `entrelaçado (${v.field_order}); entregue progressivo`);
  if (Math.abs(fps - avg) > 0.05) add('maior', name, `fps variável (${fps.toFixed(2)} × média ${avg.toFixed(2)}); exporte CFR`);
  if (tl?.fps && Math.abs(fps - tl.fps) > 0.05) add('menor', name, `fps ${fps.toFixed(2)} ≠ timeline ${tl.fps} (ok só se for decisão)`);
  if (tl?.duration && Math.abs(d - tl.duration) > 2 / (fps || 30)) add('crit', name, `duração ${d.toFixed(2)} s ≠ timeline ${tl.duration} s`);
  if (!/^\d{4}-\d{2}-\d{2}-.+-(4x5|9x16|16x9|1x1)-v\d{2}\.mp4$/.test(name)) add('menor', name, 'nome fora do padrão <AAAA-MM-DD>-<nome>-<formato>-vNN.mp4 (nada de final.mp4)');

  // 3. áudio: existe, especificação e loudness medida (o Claude não escuta; mede)
  if (!a) add('crit', name, 'sem áudio (regra: nunca fundo mudo)');
  else {
    if (a.codec_name !== 'aac') add('maior', name, `áudio ${a.codec_name}; entrega social = aac`);
    if (![44100, 48000].includes(+a.sample_rate)) add('maior', name, `sample rate ${a.sample_rate}`);
    if (a.channels !== 2) add('menor', name, `${a.channels} canal(is); padrão estéreo`);
    const eb = ff(f, 'ebur128=peak=true', true);
    const I = +(eb.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)?.[0]);
    const TP = +(eb.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.match(/-?[\d.]+/)?.[0]);
    console.log(`  loudness ${I} LUFS (alvo ${LUFS} ±1) · true peak ${TP} dBTP (máx −1)`);
    if (Number.isFinite(I) && Math.abs(I - LUFS) > 1) add(Math.abs(I - LUFS) > 3 ? 'crit' : 'maior', name, `loudness ${I} LUFS, alvo ${LUFS}`);
    if (Number.isFinite(TP) && TP > -1) add('crit', name, `true peak ${TP} dBTP > −1 (risco de clipping)`);
  }

  // 4. quadro preto/branco isolado, preto no início/fim, congelamento
  const fr = 1 / (fps || 30);
  for (const m of ff(f, 'blackdetect=d=0:pix_th=0.10').matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)) {
    const [s, e] = [+m[1], +m[2]];
    const where = s < fr ? 'no início' : e > d - fr ? 'no fim' : `em ${s.toFixed(2)}–${e.toFixed(2)} s`;
    add(e - s <= 3 * fr ? 'crit' : 'maior', name, `quadro preto ${where} (${Math.round((e - s) / fr)} quadro(s))`);
  }
  for (const m of ff(f, 'negate,blackdetect=d=0:pix_th=0.10').matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g))
    if (+m[2] - +m[1] <= 3 * fr) add('crit', name, `flash branco em ${(+m[1]).toFixed(2)} s`);
  for (const m of ff(f, 'freezedetect=n=0.0005:d=1.5').matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g))
    add('maior', name, `tela congelada em ${(+m[1]).toFixed(2)} s por ${(+m[2]).toFixed(1)} s (nada fica parado; confira se é intencional)`);

  // 5. folha de contato do arquivo final (olhar compressão, legendas, final)
  if (SHEET) {
    const out = join(dir, 'render', 'qc'); mkdirSync(out, { recursive: true });
    const step = Math.max(0.5, d / 36), sheet = join(out, name.replace(/\.mp4$/, '-sheet.png'));
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', f, '-vf', `fps=1/${step},scale=320:-1,tile=6x${Math.ceil(Math.ceil(d / step) / 6)}:padding=4`, '-frames:v', '1', sheet]);
    console.log(`  folha de contato: ${sheet} (1 quadro a cada ${step.toFixed(2)} s)`);
  }
}

const icon = { crit: '❌ crítico', maior: '⚠️ maior', menor: '· menor' };
console.log('');
for (const lvl of ['crit', 'maior', 'menor']) for (const i of issues.filter((x) => x.lvl === lvl)) console.log(`${icon[lvl]} — ${i.file}: ${i.msg}`);
if (!issues.length) console.log('✅ QC técnico limpo. Falta o que a ferramenta não vê: assistir à folha de contato e o ouvido do Oliver.');
process.exit(issues.some((i) => i.lvl === 'crit') ? 1 : 0);
