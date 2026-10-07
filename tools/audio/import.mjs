// Importa um pacote de SFX do _inbox para library/audio/sfx/, já catalogado.
// Uso:
//   node tools/audio/import.mjs <mapa.json> [--dry]
// O mapa diz de onde vem o pacote, a licença e qual pasta do pacote vira qual categoria:
//   { "source": "_inbox/audio", "origin": "EditorPro", "license": "", "folders": { "SFX Whoosh PRO": "whoosh", ... } }
// O que o script faz:
//   1. limpa o nome (tira marca do pacote, acentos e erros comuns) e agrupa variantes numa família: "Whoosh Fino2" → Whoosh_Fino_02;
//   2. descarta duplicatas exatas (mesmo conteúdo);
//   3. move para library/audio/sfx/<categoria>/[<subcategoria>/]<Familia>_NN.<ext>;
//   4. mede duração, canais e pico e infere intensidade, caráter, peso e duração pelo nome (auto: true = inferido, não ouvido);
//   5. grava em sfx.json e salva o registro original → novo em library/audio/imports/<origem>.log.json.
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, renameSync, existsSync, rmSync } from 'node:fs';
import { join, relative, extname, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = 'library/audio';
const [mapFile, ...flags] = process.argv.slice(2);
if (!mapFile) { console.log('Uso: node tools/audio/import.mjs <mapa.json> [--dry]'); process.exit(1); }
const DRY = flags.includes('--dry');
const map = JSON.parse(readFileSync(mapFile, 'utf8'));
const AUDIO = new Set(['.wav', '.mp3', '.flac', '.ogg', '.aif', '.aiff', '.m4a']);
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const md5 = (f) => createHash('md5').update(readFileSync(f)).digest('hex');
const ascii = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/´/g, '');
const slug = (s) => ascii(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Correções de digitação e grafia (aplicadas antes de agrupar).
const FIX = [[/Tecladdo/g, 'Teclado'], [/FLoresta/g, 'Floresta'], [/PIano/g, 'Piano'], [/FIta/g, 'Fita'], [/Casete/g, 'Cassete'],
  [/Showl/g, 'Show'], [/Escritorio/g, 'Escritório'], [/Trovao/g, 'Trovão'], [/Rapid([oa])/g, 'Rápid$1'], [/Liquido/g, 'Líquido'],
  [/Lapis/g, 'Lápis'], [/^LapisEscrevendo|^LápisEscrevendo/, 'Lápis Escrevendo'], [/^CliqueCaneta/, 'Clique Caneta'],
  [/\bCo2\b|\bCO2\b/gi, 'CO2'], [/\bTv\b/g, 'TV'], [/\bGAMER\b/g, 'Gamer'], [/\bSciFi\b/g, 'SciFi'], [/\bRISER\b/g, 'Riser'],
  [/\bem Baixo\b/, 'Embaixo'], [/\bR to L\b/, 'Direita para Esquerda']];

function parseName(file) {
  let n = basename(file, extname(file)).normalize('NFC');
  let variant = 1;
  const paren = n.match(/^(.*?)\s*\((\d+)\)$/);
  if (paren) { n = paren[1]; variant = +paren[2]; }
  n = n.replace(/_?by_?editor_?pro$|_?editorpro$/i, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [a, b] of FIX) n = n.replace(a, b);
  // variante = número colado no fim ("Curto2"); número com espaço ("Anos 90") ou "CO2" faz parte do nome
  const m = n.match(/^(.*?[A-Za-zÀ-ÿ])(\d+)$/);
  if (m && !/(^|\s)CO$/.test(m[1])) { n = m[1]; variant = +m[2]; }
  for (const [a, b] of FIX) n = n.replace(a, b);
  const LOW = new Set(['com', 'de', 'do', 'da', 'na', 'nas', 'ao', 'a', 'o', 'para', 'entre', 'sobre']);
  // "E"/"Em" depois de instrumento é tom (Mi, Mi menor); no resto é preposição
  const INSTR = /^(piano|violao|violino|violoncelo|flauta)$/i;
  const words = n.trim().split(' ');
  n = words.map((w, i) => {
    const lw = w.toLowerCase();
    if (i > 0 && (LOW.has(lw) || ((lw === 'e' || lw === 'em') && !INSTR.test(ascii(words[i - 1]))))) return lw;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
  return { label: n, family: ascii(n).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, ''), variant };
}

// Padrões por categoria + palavras do nome → ficha. Inferido do nome; quem ouvir corrige.
const DEF = {
  whoosh: { function: ['movement', 'transition'], character: ['cinematic'], movement: 'fast' },
  riser: { function: ['anticipation', 'transition'], character: ['cinematic'], movement: 'slow' },
  impact: { function: ['impact'], character: ['cinematic'], weight: 'heavy' },
  transition: { function: ['transition'], character: ['cinematic'] },
  ui: { function: ['feedback'], character: ['clean', 'digital'], weight: 'light', scale: 'small' },
  hud: { function: ['feedback'], character: ['futuristic', 'digital'], weight: 'light', scale: 'small' },
  ambience: { function: ['atmosphere', 'continuity'], character: ['organic'], movement: 'slow' },
  nature: { function: ['atmosphere'], character: ['organic'] },
  foley: { function: ['foley'], character: ['organic'], style: 'natural' },
  pyro: { function: ['impact'], character: ['aggressive'] },
  emotion: { function: ['atmosphere', 'anticipation'], character: ['cinematic'], tonal: true },
  tonal: { function: ['resolution', 'atmosphere'], character: ['soft'], tonal: true },
  reverb: { function: ['transition', 'resolution'], character: ['cinematic'] },
  retro: { function: ['feedback', 'atmosphere'], character: ['mechanical'] },
};
const WORDS = [
  [/suave|leve|calma|silencio|fino/i, { intensity: 'light', character: 'soft' }], [/forte|intens|potente|agressiv|distorc/i, { intensity: 'strong', character: 'aggressive' }],
  [/epico|trailer|orquestra|explos|ultra/i, { intensity: 'extreme', character: 'cinematic', scale: 'large' }],
  [/grave|sub|profund/i, { weight: 'heavy', character: 'dark' }], [/abafad/i, { character: 'soft' }],
  [/scifi|futurist|holograma|digital|robot|glitch/i, { character: 'futuristic' }], [/magic|brilh|ouro/i, { character: 'elegant' }],
  [/terror|sombrio|fantasm|suspense|tensao|angustia|ansiedade/i, { character: 'dark' }], [/cartoon/i, { character: 'playful' }],
  [/metal|mecanic/i, { character: 'mechanical' }], [/rapid|swipe|tiro/i, { movement: 'fast' }], [/lent|sustent/i, { movement: 'slow' }],
];
const KEY = /\b(C|D|E|F|G|A|B|Do|Re|Sol)(m|\s?Maior|\s?Menor)?\b/;
const NOTE = { Do: 'C', Re: 'D', Sol: 'G' };

function describe(category, label, dur) {
  const d = DEF[category] || {};
  const e = { function: [...(d.function || ['?'])], intensity: 'medium', character: [...(d.character || [])], movement: d.movement || 'medium',
    weight: d.weight || 'medium', scale: d.scale || 'medium', tonal: !!d.tonal, key: '', style: d.style || 'stylized' };
  const a = ascii(label);
  for (const [re, v] of WORDS) if (re.test(a)) {
    if (v.intensity) e.intensity = v.intensity;
    if (v.character && !e.character.includes(v.character)) e.character.unshift(v.character);
    for (const k of ['weight', 'scale', 'movement']) if (v[k]) e[k] = v[k];
  }
  if (/curt/i.test(a) && e.intensity === 'medium' && category === 'whoosh') e.intensity = 'light';
  if (e.tonal || category === 'tonal') {
    const k = a.match(KEY);
    if (k) e.key = (NOTE[k[1]] || k[1]) + (/m$|menor/i.test(k[2] || '') ? 'm' : '');
  }
  e.character = [...new Set(e.character)].slice(0, 3);
  if (!e.character.length) e.character = ['clean'];
  e.length = dur == null ? '?' : dur < 1 ? 'short' : dur < 4 ? 'medium' : 'long';
  return e;
}

function probe(file) {
  try {
    const j = JSON.parse(execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', file], { encoding: 'utf8' }));
    const a = j.streams.find((s) => s.codec_type === 'audio') || {};
    return { duration_s: +(+j.format.duration).toFixed(3), channels: a.channels ?? null };
  } catch { return { duration_s: null, channels: null }; }
}
function peak(file) {
  let out = '';
  try { out = execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'asetnsamples=441,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-', '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 }); } catch { return null; }
  let best = -Infinity, at = null, t = null;
  for (const line of out.split('\n')) {
    const mt = line.match(/pts_time:([\d.]+)/); if (mt) t = +mt[1];
    const mp = line.match(/Peak_level=(-?[\d.]+)/); if (mp && +mp[1] > best) { best = +mp[1]; at = t; }
  }
  return at === null ? null : +at.toFixed(3);
}

// 1. ler e classificar
const files = walk(map.source).filter((f) => AUDIO.has(extname(f).toLowerCase()));
const seen = new Map(); const dups = []; const items = [];
for (const f of files) {
  const rel = relative(map.source, f).split('\\').join('/');
  const top = rel.split('/')[0];
  const rule = map.folders[top];
  if (!rule) { console.log(`? sem regra para a pasta "${top}": ${rel}`); continue; }
  const h = md5(f);
  if (seen.has(h)) { dups.push({ file: rel, same_as: seen.get(h) }); continue; }
  seen.set(h, rel);
  const { label, family, variant } = parseName(f);
  const category = typeof rule === 'string' ? rule : rule.category;
  let sub = typeof rule === 'string' ? '' : rule.sub || '';
  for (const [re, s] of Object.entries(map.subByName?.[category] || {})) if (new RegExp(re, 'i').test(ascii(label))) { sub = s; break; }
  items.push({ src: f, rel, label, family, variant, category, sub, ext: extname(f).toLowerCase() });
}

// 2. numerar variantes por família (na ordem original)
const fam = new Map();
for (const it of items.sort((a, b) => a.family.localeCompare(b.family) || a.variant - b.variant || a.rel.localeCompare(b.rel))) {
  const key = `${it.category}/${it.sub}/${it.family}`;
  const n = (fam.get(key) || 0) + 1; fam.set(key, n);
  it.nn = String(n).padStart(2, '0');
  it.dest = ['sfx', it.category, it.sub, `${it.family}_${it.nn}${it.ext}`].filter(Boolean).join('/');
}

if (flags.includes("--list")) { for (const it of items) console.log(`${it.rel}  →  ${it.dest}`); process.exit(0); }
if (DRY) {
  const by = {}; for (const it of items) (by[it.category + (it.sub ? '/' + it.sub : '')] ??= []).push(it);
  for (const [c, l] of Object.entries(by).sort()) console.log(`${c}: ${l.length} arquivos, ${new Set(l.map((i) => i.family)).size} famílias  ex.: ${l.slice(0, 3).map((i) => basename(i.dest)).join(', ')}`);
  console.log(`\n${items.length} a importar · ${dups.length} duplicata(s) descartada(s): ${dups.map((d) => d.file).join(' | ')}`);
  process.exit(0);
}

// 3. mover, medir e catalogar
const catPath = join(ROOT, 'sfx.json');
const cat = JSON.parse(readFileSync(catPath, 'utf8'));
const ids = new Set(cat.map((e) => e.id));
const log = [];
let i = 0;
for (const it of items) {
  const to = join(ROOT, it.dest);
  if (existsSync(to)) { console.log(`= já existe, pulei: ${it.dest}`); continue; }
  mkdirSync(dirname(to), { recursive: true });
  renameSync(it.src, to);
  const { duration_s, channels } = probe(to);
  const d = describe(it.category, it.label, duration_s);
  const id = slug(`${it.category}-${it.family}-${it.nn}`);
  if (ids.has(id)) { console.log(`! id repetido ${id}`); continue; }
  ids.add(id);
  const { length, ...fields } = d;
  cat.push({ id, file: it.dest, family: it.family, label: it.label, category: it.category, subcategory: it.sub || null, ...fields,
    duration_s, length, peak_s: peak(to), channels, texture: '', uses: '', tags: [], auto: true,
    source: { type: 'downloaded', origin: map.origin, pack_folder: it.rel.split('/')[0], original: it.rel, author: map.author || map.origin },
    license: map.license || '', attribution: map.attribution || '' });
  log.push({ from: it.rel, to: it.dest });
  if (++i % 50 === 0) console.log(`… ${i}/${items.length}`);
}
writeFileSync(catPath, JSON.stringify(cat, null, 2) + '\n');
execFileSync(process.execPath, ['tools/audio/catalog.mjs', 'index'], { stdio: 'inherit' });
mkdirSync(join(ROOT, 'imports'), { recursive: true });
writeFileSync(join(ROOT, 'imports', `${slug(map.origin)}.log.json`), JSON.stringify({ date: new Date().toISOString().slice(0, 10), origin: map.origin, imported: log, duplicates_removed: dups }, null, 2) + '\n');
if (map.removeDuplicates) for (const d of dups) rmSync(join(map.source, d.file));
console.log(`✓ ${log.length} importados para ${ROOT}/sfx · ${dups.length} duplicata(s) ${map.removeDuplicates ? 'apagada(s)' : 'deixada(s) no _inbox'} · catálogo: ${cat.length} itens`);
if (!map.license) console.log('⚠ Licença vazia: os itens não aparecem na busca até registrar a licença (node tools/audio/catalog.mjs license --origin <origem> "<licença>").');
