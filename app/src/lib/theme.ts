// Cor principal da interface = cor do projeto aberto (pedido do Oliver, tarefa 019): na kz, o coral da marca.
// Ajuda a saber de relance em que projeto se está. Fonte: project.yml → color; se vazio, o --primary do brand.css
// da empresa; sem nenhum, o índigo padrão do index.css. Daqui saem --primary, --primary-foreground (preto ou branco,
// o que tiver mais contraste) e --primary-ink (a mesma cor escurecida até 4,5:1 no branco, para texto e links).
import { useEffect } from 'react';
import { useBrandCss, useProject } from '../queries';

const hexRgb = (h: string): [number, number, number] | null => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  const v = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  const n = parseInt(v, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const luz = ([r, g, b]: [number, number, number]) => {
  const l = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);
};
export const contraste = (a: [number, number, number], b: [number, number, number]) => { const x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const hex = (c: [number, number, number]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const BRANCO: [number, number, number] = [255, 255, 255], TINTA: [number, number, number] = [24, 24, 27];

/** cor válida → tokens; null → volta ao padrão */
export function tokensDaCor(cor: string | null | undefined) {
  const c = cor ? hexRgb(cor) : null;
  if (!c) return null;
  let ink = c;
  for (let k = 0; k <= 1 && contraste(ink, BRANCO) < 4.6; k += 0.04) ink = [c[0] * (1 - k), c[1] * (1 - k), c[2] * (1 - k)];
  return { '--primary': hex(c), '--primary-foreground': contraste(c, BRANCO) >= contraste(c, TINTA) ? '#ffffff' : '#18181b', '--primary-ink': hex(ink) };
}
export function aplicarCor(cor: string | null | undefined) {
  const t = tokensDaCor(cor), raiz = document.documentElement.style;
  for (const k of ['--primary', '--primary-foreground', '--primary-ink']) raiz.removeProperty(k);
  if (t) for (const [k, v] of Object.entries(t)) raiz.setProperty(k, v);
}
/** cor do projeto: project.yml → color, senão o --primary do brand.css */
export function useCorDoProjeto(slug: string | undefined) {
  const projeto = useProject(slug ?? '');
  const marca = useBrandCss(slug ?? '');
  const daMarca = marca.data?.text?.match(/--primary\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1] ?? null;
  const cor = slug ? projeto.data?.color || daMarca : null;
  useEffect(() => { aplicarCor(cor); }, [cor]);
  return cor;
}
