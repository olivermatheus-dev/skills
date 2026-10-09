#!/usr/bin/env node
// Catálogo de famílias do carrossel (049) e expansão de tokens.
//   node .claude/skills/carousel/scripts/catalogo.mjs [--brand kz]
//       monta references/catalogo.html com TODAS as famílias de references/layouts/ na marca pedida
//       (depois: node .claude/skills/carousel/scripts/render.mjs .claude/skills/carousel/references/catalogo.html .claude/skills/carousel/references/catalogo/png)
//   node .claude/skills/carousel/scripts/catalogo.mjs --expandir <carrossel.html> --brand <slug>
//       troca, no próprio arquivo, os tokens dos fragmentos copiados de layouts/:
//       {{icone:nome}} → SVG Lucide (traço do kit) · {{logo}} → logo da marca (fill currentColor) · {{n}}/{{t}} → nº do slide/total
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const REF = join(ROOT, '.claude/skills/carousel/references');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const slug = opt('brand') || 'kz';

async function icone(nome, stroke) {
  const f = join(ROOT, 'node_modules/lucide-react/dist/esm/icons', `${nome}.mjs`);
  if (!existsSync(f)) throw new Error(`ícone "${nome}" não existe no Lucide (node tools/icon.mjs --busca ${nome.split('-')[0]})`);
  const { __iconData } = await import(pathToFileURL(f).href);
  const inner = __iconData.node.map(([tag, a]) => `<${tag} ${Object.entries(a).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" data-icon="lucide-${nome}">${inner}</svg>`;
}
function logo(s) {
  const dir = join(ROOT, 'companies', s, 'brand', 'logo');
  const arq = existsSync(dir) && readdirSync(dir).filter((f) => f.endsWith('.svg')).sort((a, b) => a.length - b.length)[0];
  if (!arq) return `<b>${s}</b>`;
  return readFileSync(join(dir, arq), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/\s(width|height)="[^"]*"/g, '')
    .replace(/\sfill="#[0-9a-fA-F]{3,6}"/g, '').replace(/\n\s*/g, '').trim();
}
export async function expandir(html, s) {
  // comentários (guia de uso dos fragmentos) ficam intactos
  const partes = html.split(/(<!--[\s\S]*?-->)/);
  for (let k = 0; k < partes.length; k += 2) partes[k] = await expandirTrecho(partes[k], s);
  html = partes.join('');
  const total = (html.match(/<section class="slide/g) || []).length;
  let i = 0;
  return html.replace(/<section class="slide[\s\S]*?<\/section>/g, (sec) => { i++; return sec.replaceAll('{{n}}', String(i).padStart(2, '0')).replaceAll('{{t}}', String(total).padStart(2, '0')); });
}
async function expandirTrecho(html, s) {
  let stroke = 1.5;
  try { stroke = JSON.parse(readFileSync(join(ROOT, 'companies', s, 'brand', 'brand.json'), 'utf8')).icons?.stroke ?? 1.5; } catch {}
  const nomes = [...new Set([...html.matchAll(/\{\{icone:([a-z0-9-]+)\}\}/g)].map((m) => m[1]))];
  for (const n of nomes) html = html.replaceAll(`{{icone:${n}}}`, await icone(n, stroke));
  return html.replaceAll('{{logo}}', logo(s));
}

if (opt('expandir')) {
  const f = resolve(opt('expandir'));
  writeFileSync(f, await expandir(readFileSync(f, 'utf8'), slug));
  console.log(`✓ tokens expandidos em ${relative(ROOT, f)}`);
  process.exit(0);
}

const frag = readdirSync(join(REF, 'layouts')).filter((f) => /^\d\d-.*\.html$/.test(f)).sort();
const corpo = frag.map((f) => readFileSync(join(REF, 'layouts', f), 'utf8').trim()).join('\n\n');
const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Catálogo de famílias · carrossel (${slug})</title>
<!-- GERADO por scripts/catalogo.mjs a partir de references/layouts/*.html — edite os fragmentos, não este arquivo -->
<link rel="stylesheet" href="../../../../companies/${slug}/brand/brand.css">
<link rel="stylesheet" href="sistema.css">
</head>
<body>
${await expandir(corpo, slug)}
</body>
</html>
`;
writeFileSync(join(REF, 'catalogo.html'), html);
console.log(`✓ ${relative(ROOT, join(REF, 'catalogo.html'))} · ${frag.length} famílias (${slug})`);
