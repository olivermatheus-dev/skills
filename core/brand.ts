// Kit de marca (tarefa 024): brand.json (fonte de verdade) → brand.css (o que carrossel, vídeo e LP linkam)
// + bloco gerado no BRAND.md (estilo, ícones, fazer / não fazer). Também importa um brand.css antigo para JSON.
import { Brand, type BrandFont, type BrandToken } from '../schema/brand';
import { BRAND_PRESETS } from './brand-presets';
import { resolveTonal, bestInk, TONE_STEPS } from './tonal';

const GENERATED = '/* brand.css — GERADO de brand.json pelo kit de marca (app → Contexto e marca → Marca, ou `npm run brand -- <slug>`). Não edite à mão: edite o brand.json. */';
/** tokens que o gerador escreve a partir de `icons` (não podem estar nos grupos) */
export const ICON_TOKENS = ['icon-stroke', 'icon-color', 'icon-fill'];

const comment = (s: string) => `/* ${s.replace(/\*\//g, '* /')} */`;

function fontCss(f: BrandFont): string[] {
  if (f.source === 'google') return [];
  return f.files.map((x) => [
    `@font-face{font-family:"${f.family}";font-style:${x.style};font-weight:${x.weight};font-display:${f.display};`,
    `  src:url("${x.src}") format("${x.src.endsWith('.woff2') ? 'woff2' : x.src.endsWith('.woff') ? 'woff' : x.src.endsWith('.otf') ? 'opentype' : 'truetype'}");${x.unicodeRange ? `\n  unicode-range:${x.unicodeRange}` : ''}}`,
  ].join('\n'));
}

export function brandToCss(input: unknown): string {
  const b = Brand.parse(input);
  const out: string[] = [GENERATED];
  if (b.header) out.push(comment(b.header));
  // @import precisa vir antes de qualquer outra regra
  const google = b.fonts.filter((f) => f.source === 'google');
  if (google.length) out.push(`@import url('https://fonts.googleapis.com/css2?${google.map((f) => `family=${f.google!.replace(/ /g, '+')}`).join('&')}&display=swap');`);
  for (const f of b.fonts) {
    const css = fontCss(f);
    if (!css.length) continue;
    if (f.note || f.license) out.push(comment([f.note, f.license && !f.note?.includes(f.license) ? `licença: ${f.license}` : ''].filter(Boolean).join(' · ')));
    out.push(...css);
  }
  out.push('', ':root{');
  b.groups.forEach((g, i) => {
    if (i) out.push('');
    out.push(`  ${comment(g.label)}`);
    for (const t of g.tokens) out.push(`  --${t.name}:${t.value};${t.note ? ` ${comment(t.note)}` : ''}`);
  });
  const p = b.style.preset ? BRAND_PRESETS.find((x) => x.id === b.style.preset) : undefined;
  out.push('', `  ${comment(`Ícones (kit): ${b.icons.library}, traço ${b.icons.stroke}, ${b.icons.style}${p ? ` · estilo: ${p.label}` : ''}`)}`);
  out.push(`  --icon-stroke:${b.icons.stroke};`);
  out.push(`  --icon-color:var(--${b.icons.color});`);
  out.push(`  --icon-fill:${b.icons.style === 'preenchido' ? `var(--${b.icons.color})` : 'none'};`);
  const all = b.groups.flatMap((g) => g.tokens);
  const val = (n: string) => all.find((t) => t.name === n)?.value;
  const primary = val('primary');
  if (primary && /^#[0-9a-f]{6}$/i.test(primary)) {
    const tn = resolveTonal(primary, b.tonal);
    const hex6 = (v?: string) => !!v && /^#[0-9a-f]{6}$/i.test(v);
    const cands = [
      ...(['ink', 'text'] as const).filter((n) => hex6(val(n))).map((n) => ({ name: n as string, hex: val(n)!, ref: `var(--${n})` })),
      { name: 'white', hex: '#ffffff', ref: '#fff' },
    ];
    out.push('', `  ${comment(`Paleta tonal (kit): escala clara→escura da cor principal${tn.auto ? ' (automática)' : ''} · --on-tone-N = tinta legível sobre o tom`)}`);
    for (const s of TONE_STEPS) out.push(`  --tone-${s}:${tn.steps[s]};`);
    for (const s of TONE_STEPS) {
      const best = bestInk(tn.steps[s], cands);
      out.push(`  --on-tone-${s}:${cands.find((c) => c.name === best.name)!.ref};`);
    }
  }
  out.push('}', '');
  return out.join('\n');
}

// ---------- importar um brand.css escrito à mão ----------
const unComment = (s: string) => s.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '').trim();

export function cssToBrand(css: string): Brand {
  css = css.replace(/\r\n/g, '\n');
  const rootAt = css.indexOf(':root');
  if (rootAt < 0) throw new Error('brand.css sem :root');
  const pre = css.slice(0, rootAt);
  const body = css.slice(css.indexOf('{', rootAt) + 1, css.lastIndexOf('}'));

  // preâmbulo: comentários, @import e @font-face, na ordem
  const items = [...pre.matchAll(/\/\*[\s\S]*?\*\/|@import\s+url\([^)]*\)\s*;|@font-face\s*\{[\s\S]*?\}/g)].map((m) => m[0]);
  const headers: string[] = [];
  const fonts: BrandFont[] = [];
  let pending: string | undefined;
  for (const it of items) {
    if (it.startsWith('/*')) {
      const c = unComment(it);
      if (/GERADO de brand\.json/.test(c)) continue;
      if (pending) headers.push(pending);
      pending = c;
    } else if (it.startsWith('@import')) {
      if (pending) { headers.push(pending); pending = undefined; }
      const url = it.match(/url\(['"]?([^'")]+)/)?.[1] ?? '';
      for (const fam of [...url.matchAll(/family=([^&]+)/g)].map((m) => decodeURIComponent(m[1]).replace(/\+/g, ' '))) {
        fonts.push({ family: fam.split(':')[0], source: 'google', google: fam, files: [], display: 'swap' });
      }
    } else {
      const get = (k: string) => it.match(new RegExp(`${k}\\s*:\\s*([^;}]+)`))?.[1].trim();
      const family = get('font-family')!.replace(/["']/g, '');
      const file = {
        src: it.match(/url\(["']?([^"')]+)/)![1],
        style: (get('font-style') ?? 'normal') as 'normal' | 'italic',
        weight: get('font-weight') ?? '400',
        ...(get('unicode-range') ? { unicodeRange: get('unicode-range') } : {}),
      };
      const display = (get('font-display') ?? 'block') as BrandFont['display'];
      const last = fonts[fonts.length - 1];
      if (last && last.family === family && last.source === 'local' && !pending) last.files.push(file);
      else {
        const note = pending; pending = undefined;
        const license = note?.match(/fonts\/[\w.-]+\.txt/)?.[0];
        fonts.push({ family, source: 'local', files: [file], display, ...(note ? { note } : {}), ...(license ? { license } : {}) });
      }
    }
  }
  if (pending) headers.push(pending);

  // :root — comentário sozinho na linha abre um grupo; comentário depois de uma declaração é a nota dela
  const groups: { label: string; tokens: BrandToken[] }[] = [];
  let cur: { label: string; tokens: BrandToken[] } | null = null;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\/\*[\s\S]*\*\/$/.test(line)) {
      const label = unComment(line);
      if (/^Ícones \(kit\)|^Paleta tonal \(kit\)/.test(label)) { cur = null; continue; }
      cur = { label, tokens: [] }; groups.push(cur);
      continue;
    }
    const decls = [...line.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)];
    if (!decls.length) continue;
    const note = line.match(/;\s*\/\*\s*([\s\S]*?)\s*\*\/\s*$/)?.[1];
    if (!cur) { cur = { label: 'Tokens', tokens: [] }; groups.push(cur); }
    decls.forEach((d, i) => {
      if (ICON_TOKENS.includes(d[1]) || /^(on-)?tone-\d+$/.test(d[1])) return;
      cur!.tokens.push({ name: d[1], value: d[2].trim(), ...(note && i === decls.length - 1 ? { note } : {}) });
    });
  }
  const iconStroke = Number(body.match(/--icon-stroke\s*:\s*([\d.]+)/)?.[1]);
  return Brand.parse({
    ...(headers.length ? { header: headers.join(' · ') } : {}),
    fonts,
    groups: groups.filter((g) => g.tokens.length),
    ...(iconStroke ? { icons: { stroke: iconStroke } } : {}),
  });
}

/** mapa nome → valor (para comparar dois CSS: o gerado tem que ser equivalente ao original) */
export function tokenMap(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

// ---------- bloco do kit no BRAND.md ----------
const START = '<!-- kit-de-marca:inicio (gerado pelo app; edite em Contexto e marca → Marca) -->';
const END = '<!-- kit-de-marca:fim -->';

export function brandMdBlock(input: unknown): string {
  const b = Brand.parse(input);
  const p = b.style.preset ? BRAND_PRESETS.find((x) => x.id === b.style.preset) : undefined;
  const lines = [START, '## Kit de marca (estilo, ícones e anotações)'];
  if (p) lines.push('', `**Estilo: ${p.label}.** ${p.summary}`, ...p.rules.map((r) => `- ${r}`));
  lines.push('', `**Ícones:** só **${b.icons.library === 'lucide' ? 'Lucide' : b.icons.library}** (lucide.dev, licença ISC), sem misturar bibliotecas. Traço \`${b.icons.stroke}\` (\`--icon-stroke\`), estilo ${b.icons.style}, cor \`--${b.icons.color}\` (\`--icon-color\`). SVG pronto: \`node tools/icon.mjs <nome> --brand <slug>\`.`);
  if (b.style.do.length) lines.push('', '**Fazer:**', ...b.style.do.map((x) => `- ${x}`));
  if (b.style.dont.length) lines.push('', '**Não fazer** (regra dura, como as Proibições):', ...b.style.dont.map((x) => `- ${x}`));
  if (b.style.notes?.trim()) lines.push('', '**Anotações:**', b.style.notes.trim());
  lines.push(END);
  return lines.join('\n');
}

/** troca (ou insere logo depois do título) o bloco do kit no BRAND.md, sem tocar no resto */
export function upsertBrandMd(md: string, block: string): string {
  md = md.replace(/\r\n/g, '\n');
  const i = md.indexOf('<!-- kit-de-marca:inicio'), j = md.indexOf(END);
  if (i >= 0 && j > i) return md.slice(0, i) + block + md.slice(j + END.length);
  const lines = md.split('\n');
  const h1 = lines.findIndex((l) => /^# /.test(l));
  // depois do título e do parágrafo de abertura (até a 1ª linha em branco depois dele)
  let at = h1 < 0 ? 0 : h1 + 1;
  while (at < lines.length && lines[at].trim() === '') at++;
  while (at < lines.length && lines[at].trim() !== '' && !/^## /.test(lines[at])) at++;
  lines.splice(at, 0, '', block, '');
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}
