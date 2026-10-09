// Paleta tonal (tarefa 049 F): escala 50…950 em OKLCH a partir da cor principal. Puro (sem node): roda no app e no CLI.
export const TONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ToneStep = (typeof TONE_STEPS)[number];
export interface Tonal { base: string; auto: boolean; steps: Record<string, string>; overrides: Record<string, string> }

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', ''), f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255) as [number, number, number];
}
export function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}
function oklchToLinear(L: number, C: number, H: number): [number, number, number] {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (v: number[]) => v.every((x) => x >= -0.0005 && x <= 1.0005);
const toHex = (v: number[]) => '#' + v.map((x) => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, x))))) * 255).toString(16).padStart(2, '0')).join('');
/** OKLCH → hex; se sair do sRGB, reduz o croma até caber */
export function oklchToHex(L: number, C: number, H: number): string {
  let c = C;
  for (let i = 0; i < 40; i++) { const v = oklchToLinear(L, c, H); if (inGamut(v)) return toHex(v); c *= 0.94; }
  return toHex(oklchToLinear(L, 0, H));
}

// croma relativo ao da cor principal: claros dessaturados (sem rosa-chiclete), escuros mantêm calor
const CHROMA: Record<number, number> = { 50: 0.1, 100: 0.2, 200: 0.38, 300: 0.6, 400: 0.82, 500: 1, 600: 0.97, 700: 0.85, 800: 0.68, 900: 0.52, 950: 0.4 };
const LIGHT_W: Record<number, number> = { 50: 0, 100: 0.1, 200: 0.28, 300: 0.5, 400: 0.75 };
const DARK_W: Record<number, number> = { 600: 0.28, 700: 0.48, 800: 0.66, 900: 0.84, 950: 1 };
const L_TOP = 0.975, L_BOTTOM = 0.2;

export function generateScale(primary: string): Record<string, string> {
  const [L0, C0, H0] = hexToOklch(primary);
  const out: Record<string, string> = {};
  for (const s of TONE_STEPS) {
    if (s === 500) { out[s] = primary.toLowerCase(); continue; }
    const L = s < 500 ? L_TOP + (Math.min(L0, 0.9) - L_TOP) * LIGHT_W[s] : L0 + (L_BOTTOM - L0) * DARK_W[s];
    // escuros levemente mais quentes (hue puxado para ~35°) para não virar cinza/preto
    const H = s > 500 ? H0 + (((35 - H0 + 540) % 360) - 180) * 0.15 * DARK_W[s] : H0;
    out[s] = oklchToHex(L, C0 * CHROMA[s], H);
  }
  return out;
}

/** completa/normaliza o bloco `tonal`: auto → regera dos passos a partir de `base`; overrides valem por cima */
export function resolveTonal(primary: string, cur?: Partial<Tonal> | null): Tonal {
  const auto = cur?.auto ?? true;
  const base = (auto ? primary : cur?.base ?? primary).toLowerCase();
  const overrides = Object.fromEntries(Object.entries(cur?.overrides ?? {}).filter(([k, v]) => (TONE_STEPS as readonly number[]).includes(Number(k)) && /^#[0-9a-f]{6}$/i.test(v)).map(([k, v]) => [k, v.toLowerCase()]));
  const gen = generateScale(base);
  const steps = Object.fromEntries(TONE_STEPS.map((s) => [s, overrides[s] ?? gen[s]]));
  return { base, auto, steps, overrides };
}

export function contrastHex(a: string, b: string) {
  const lum = (h: string) => { const [r, g, bl] = hexToRgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** melhor tinta (entre as candidatas) para texto sobre `bg` */
export function bestInk(bg: string, cands: { name: string; hex: string }[]) {
  const ranked = cands.map((c) => ({ ...c, ratio: contrastHex(bg, c.hex) })).sort((a, b) => b.ratio - a.ratio);
  return ranked[0];
}
export const grade = (r: number): 'AAA' | 'AA' | '✗' => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : '✗');
