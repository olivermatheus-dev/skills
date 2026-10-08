#!/usr/bin/env node
// Registra um print como captura do estúdio de mockups (tarefa 028): copia, mede e grava captura.json — sem a IA olhar a imagem.
// Uso: node tools/mockup/captura.mjs <arquivo.png|jpg|webp> --empresa <slug> [--nome painel-inicio] [--dpr 2]
//        [--aparelho celular|tablet|desktop] [--ficticios] [--tags a,b] [--url https://…] [--data AAAA-MM-DD]
// Depois: marque regiões/áreas a ocultar no captura.json (ou no app, fase C) e rode o render.mjs.
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename, resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { analisar, resumo } from './analisar.mjs';
const BR = String.fromCharCode(10);

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
const has = (n) => args.includes('--' + n);
const SEM_VALOR = ['--ficticios', '--substituir'];
const pos = [];
for (let i = 0; i < args.length; i++) { if (!args[i].startsWith('--')) pos.push(args[i]); else if (!SEM_VALOR.includes(args[i])) i++; }
const arquivo = pos[0];
const empresa = flag('empresa');
if (!arquivo || !empresa) {
  console.error('Uso: node tools/mockup/captura.mjs <print.png> --empresa <slug> [--nome tela] [--dpr 2] [--aparelho celular|tablet|desktop] [--ficticios] [--tags a,b]');
  process.exit(1);
}
if (!existsSync(arquivo)) { console.error('arquivo não encontrado: ' + arquivo); process.exit(1); }
if (!existsSync(join('companies', empresa))) { console.error(`empresa "${empresa}" não existe em companies/`); process.exit(1); }

/** largura × altura: PNG pelo cabeçalho; outros formatos pelo ffprobe */
function medir(f) {
  const b = readFileSync(f);
  if (b.slice(1, 4).toString() === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f]).toString().trim();
  const [w, h] = out.split(',').map(Number);
  return { w, h };
}
/** cor média (ffmpeg reduz para 1 px) */
function corMedia(f) {
  try {
    const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=1:1:flags=area', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1024 });
    return '#' + [...raw.subarray(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('');
  } catch { return undefined; }
}
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const { w, h } = medir(arquivo);
const a = w / h;
const aparelho = flag('aparelho') ?? (a < 0.8 ? 'celular' : a < 1.25 ? 'tablet' : 'desktop');
// palpite de densidade: telas de celular exportadas costumam vir em 3×, desktop acima de 2560 px em 2×
const dpr = Number(flag('dpr') ?? (aparelho === 'celular' && w >= 1000 ? 3 : aparelho !== 'celular' && w >= 2560 ? 2 : 1));
const data = flag('data') ?? new Date().toLocaleDateString('sv-SE');
const nome = slugify(flag('nome') ?? basename(arquivo, extname(arquivo)).replace(/^\d{4}-\d{2}-\d{2}-?|-?\d{4}-\d{2}-\d{2}$/g, ''));
const dir = join('companies', empresa, 'capturas', `${data}-${nome}`);
if (existsSync(join(dir, 'captura.json')) && !has('substituir')) { console.error(`já existe: ${dir} (use --substituir)`); process.exit(1); }
mkdirSync(dir, { recursive: true });
const ext = extname(arquivo).toLowerCase().replace('.jpeg', '.jpg');
copyFileSync(arquivo, join(dir, 'original' + ext));

const cor = corMedia(arquivo);
const captura = {
  origem: flag('url') ? 'link' : 'print',
  arquivo: 'original' + ext,
  ...(flag('url') ? { url: flag('url') } : {}),
  largura: w, altura: h, dpr, aparelho,
  ...(cor ? { corDominante: cor } : {}),
  tags: (flag('tags') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  dadosFicticios: has('ficticios'),
  ocultar: [],
  regioes: {},
  data,
};
writeFileSync(join(dir, 'captura.json'), JSON.stringify(captura, null, 2) + '\n');
console.log(`✓ ${relative(process.cwd(), resolve(dir))}  ${w}×${h} · ${aparelho} · dpr ${dpr}${flag('dpr') ? '' : ' (palpite)'} · cor ${captura.corDominante ?? '?'}`);
if (dpr < 2) console.log('  ⚠ print em 1×: herói fica bom; zoom e cards ficam macios. Se puder, capture em 2–3× (zoom do navegador 200% ou DevTools).');
if (!captura.dadosFicticios) console.log('  ⚠ dados reais na tela? Marque áreas em "ocultar" (borradas no render) ou rode com --ficticios se for conta demo. Sem isso a peça sai "nao-publicar".');
// onde cortar (barra do navegador/sistema, rolagem, fio, elemento cortado): sugestão gravada no captura.json
try {
  const s = await analisar(resolve(dir));
  console.log(resumo(s, dir).split(BR).map((l) => '  ' + l).join(BR));
} catch (e) { console.log('  ⚠ análise de corte falhou: ' + e.message); }
console.log(`  Próximo: node tools/mockup/render.mjs --captura ${dir.replace(/\\/g, '/')} --alternativas 6 --formato 4:5`);
