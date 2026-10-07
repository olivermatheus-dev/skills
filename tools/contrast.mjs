// Contraste WCAG entre duas cores. Uso: node tools/contrast.mjs "#ffffff" "#ef7960"
// Ou passe um brand.css para checar os pares principais: node tools/contrast.mjs companies/kz/brand/brand.css
import { readFileSync, existsSync } from 'node:fs';

const lum = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const verdict = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'só texto grande' : 'REPROVADO');

const [a, b] = process.argv.slice(2);
if (a && existsSync(a)) {
  const css = readFileSync(a, 'utf8');
  const v = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)].map((m) => [m[1], m[2]]));
  const pairs = [
    ['text', 'bg'], ['text', 'surface'], ['accent', 'bg'], ['primary', 'bg'],
    ['on-primary', 'primary'], ['on-inverse', 'inverse-bg'], ['muted', 'surface'],
  ];
  for (const [fg, bg] of pairs) {
    if (!v[fg] || !v[bg]) continue;
    const r = ratio(v[fg], v[bg]);
    console.log(`${`--${fg} sobre --${bg}`.padEnd(30)} ${v[fg]} / ${v[bg]}  ${r.toFixed(2)}:1  ${verdict(r)}`);
  }
} else if (a && b) {
  const r = ratio(a, b);
  console.log(`${a} / ${b}  ${r.toFixed(2)}:1  ${verdict(r)}`);
} else {
  console.log('Uso: node tools/contrast.mjs "#fff" "#ef7960"  |  node tools/contrast.mjs companies/<slug>/brand/brand.css');
}
