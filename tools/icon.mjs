// Ícone do Lucide (biblioteca padrão do kit de marca, tarefa 024) como SVG pronto para carrossel e vídeo.
// Uso:
//   node tools/icon.mjs <nome> [<nome>…] [--brand <slug>] [--size 24] [--color "#hex"|css] [--out <pasta>]
//   node tools/icon.mjs --busca <termo>          lista nomes que contêm o termo (ex.: calendar, bell, user)
// Com --brand: traço, preenchimento e cor vêm do brand.json (icons). Sem --color, usa var(--icon-color) — o SVG
// inline no HTML herda do brand.css; com --out grava <nome>.svg com a cor resolvida (arquivo solto não lê variável).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ICONS = join(process.cwd(), 'node_modules', 'lucide-react', 'dist', 'esm', 'icons');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const names = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const all = () => readdirSync(ICONS).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4));

if (opt('busca')) {
  const t = opt('busca').toLowerCase();
  console.log(all().filter((n) => n.includes(t)).join('\n') || `nenhum ícone com "${t}"`);
  process.exit(0);
}
if (!names.length) { console.log('Uso: node tools/icon.mjs <nome> [--brand <slug>] [--size 24] [--color css] [--out pasta] | --busca <termo>'); process.exit(1); }

let stroke = 2, fillMode = 'linha', color = opt('color');
const slug = opt('brand');
if (slug) {
  const f = join('companies', slug, 'brand', 'brand.json');
  if (!existsSync(f)) { console.error(`❌ ${f} não existe (rode npm run brand -- ${slug})`); process.exit(1); }
  const b = JSON.parse(readFileSync(f, 'utf8'));
  stroke = b.icons?.stroke ?? stroke; fillMode = b.icons?.style ?? fillMode;
  if (!color && opt('out')) color = b.groups.flatMap((g) => g.tokens).find((t) => t.name === (b.icons?.color ?? 'primary'))?.value;
}
color ??= slug ? 'var(--icon-color)' : 'currentColor';
const size = Number(opt('size') ?? 24);

const esc = (v) => String(v).replace(/"/g, '&quot;');
for (const name of names) {
  const file = join(ICONS, `${name}.mjs`);
  if (!existsSync(file)) { console.error(`❌ ícone "${name}" não existe no Lucide. Procure: node tools/icon.mjs --busca ${name.split('-')[0]}`); process.exitCode = 1; continue; }
  const { __iconData } = await import(pathToFileURL(file).href);
  const inner = __iconData.node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${esc(v)}"`).join(' ')}/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillMode === 'preenchido' ? color : 'none'}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" data-icon="lucide-${name}">${inner}</svg>`;
  if (opt('out')) { mkdirSync(opt('out'), { recursive: true }); writeFileSync(join(opt('out'), `${name}.svg`), `${svg}\n`); console.log(`✅ ${join(opt('out'), `${name}.svg`)}`); }
  else console.log(svg);
}
