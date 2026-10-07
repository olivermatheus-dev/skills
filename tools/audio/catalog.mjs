// Catálogo da biblioteca de áudio (library/audio/{sfx,music,bases}.json).
// Uso:
//   node tools/audio/catalog.mjs scan [sfx|music|bases]      cadastra arquivos novos (mede duração, canais e pico)
//   node tools/audio/catalog.mjs search sfx --category whoosh --intensity light --character clean [--max 1.0] [--n 5]
//   node tools/audio/catalog.mjs search sfx --family UI_Elegant_Click --n 3      (variantes para alternar)
//   node tools/audio/catalog.mjs search music --mood calmo --energy low --bpm 70-95
//   node tools/audio/catalog.mjs search sfx --q "porta"                            (palavra no nome; sem acento)
//   node tools/audio/catalog.mjs search sfx --category foley --sub passos
//   node tools/audio/catalog.mjs check                        valida fichas e licenças
//   node tools/audio/catalog.mjs index                        gera library/audio/INDEX.md (1 linha por família; é o que o Claude lê)
//   node tools/audio/catalog.mjs license --origin EditorPro "<licença>" [--attribution "<texto>"]   licença de um pacote inteiro
// Pacote inteiro do _inbox: node tools/audio/import.mjs <mapa.json> (ver library/audio/imports/).
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, basename, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = 'library/audio';
const KINDS = ['sfx', 'music', 'bases'];
const AUDIO = new Set(['.wav', '.mp3', '.flac', '.ogg', '.aif', '.aiff', '.m4a']);
const load = (k) => JSON.parse(readFileSync(join(ROOT, `${k}.json`), 'utf8'));
const save = (k, d) => writeFileSync(join(ROOT, `${k}.json`), JSON.stringify(d, null, 2) + '\n');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function probe(file) {
  try {
    const j = JSON.parse(execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', file], { encoding: 'utf8' }));
    const a = j.streams.find((s) => s.codec_type === 'audio') || {};
    return { duration_s: +(+j.format.duration).toFixed(3), channels: a.channels ?? null };
  } catch { return { duration_s: null, channels: null }; }
}
function peak(file) {
  const r = (() => { try { return execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'asetnsamples=441,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-', '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } })();
  let best = -Infinity, at = null, t = null;
  for (const line of r.split('\n')) {
    const mt = line.match(/pts_time:([\d.]+)/); if (mt) t = +mt[1];
    const mp = line.match(/Peak_level=(-?[\d.]+|-inf)/); if (mp && mp[1] !== '-inf' && +mp[1] > best) { best = +mp[1]; at = t; }
  }
  return at === null ? null : +at.toFixed(3);
}

function scan(kinds) {
  for (const k of kinds) {
    const dir = join(ROOT, k);
    if (!existsSync(dir)) continue;
    const cat = load(k);
    const known = new Set(cat.map((e) => e.file));
    let added = 0;
    for (const f of walk(dir).filter((p) => AUDIO.has(extname(p).toLowerCase()))) {
      const rel = relative(ROOT, f).split('\\').join('/');
      if (known.has(rel)) continue;
      const name = basename(f, extname(f));
      const base = { id: slug(name), file: rel, ...probe(f) };
      let entry;
      if (k === 'sfx') {
        const [category = '?', sub = null] = relative(dir, dirname(f)).split(/[\/]/).filter(Boolean);
        entry = { ...base, family: name.replace(/_\d+$/, ''), category, subcategory: sub,
          function: ['?'], intensity: '?', character: ['?'], movement: '?', weight: '?', scale: '?', peak_s: peak(f),
          tonal: false, key: '', style: '?', texture: '', uses: '', source: { type: '?', origin: '', author: '' }, license: '', attribution: '', tags: [] };
      } else if (k === 'music') {
        entry = { ...base, title: name, mood: ['?'], energy: '?', bpm: null, key: '', sections: [], stems: [], uses: [], brand: null, source: { type: '?', origin: '' }, license: '' };
      } else {
        entry = { ...base, kind: '?', instrument: '', bpm: null, key: '', bars: null, mood: [], source: { type: '?', origin: '' }, license: '' };
      }
      cat.push(entry); added++;
      console.log(`+ ${k}: ${rel} (${entry.duration_s}s${entry.peak_s != null ? `, pico em ${entry.peak_s}s` : ''})`);
    }
    save(k, cat);
    console.log(`${k}: ${added} novo(s), ${cat.length} no catálogo. Complete os campos "?" e a licença.`);
  }
}

function search(k, args) {
  const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
  const n = +(opt('n') || 5);
  const want = { category: opt('category'), intensity: opt('intensity'), character: opt('character'), movement: opt('movement'),
    weight: opt('weight'), function: opt('function'), mood: opt('mood'), energy: opt('energy'), kind: opt('kind'), family: opt('family'), subcategory: opt('sub') };
  const fold = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const q = opt('q') ? fold(opt('q')).split(/\s+/) : null;
  const max = opt('max') ? +opt('max') : null;
  const [bmin, bmax] = (opt('bpm') || '').split('-').map(Number);
  const has = (v, w) => Array.isArray(v) ? v.includes(w) : v === w;
  const rows = load(k).filter((e) => e.license) // sem licença não aparece
    .filter((e) => !want.family || (e.family || '').startsWith(want.family))
    .filter((e) => !q || q.every((w) => fold(`${e.label || ''} ${e.family} ${(e.tags || []).join(' ')}`).includes(w)))
    .filter((e) => max == null || (e.duration_s ?? 0) <= max)
    .filter((e) => !bmin || (e.bpm >= bmin && e.bpm <= (bmax || bmin)))
    .map((e) => ({ e, score: Object.entries(want).filter(([key, w]) => w && key !== 'family' && has(e[key], w)).length }))
    .filter((r) => Object.entries(want).every(([key, w]) => !w || key === 'family' || key === 'character' || key === 'mood' || has(r.e[key], w)) )
    .sort((a, b) => b.score - a.score || (a.e.duration_s ?? 0) - (b.e.duration_s ?? 0))
    .slice(0, n);
  if (!rows.length) { console.log('Nada no catálogo com licença para esse filtro → gerar ou baixar, e catalogar (skill audio).'); return; }
  for (const { e } of rows) {
    const info = k === 'music' ? `${e.bpm ?? '?'} BPM · ${e.key || '?'} · ${(e.mood || []).join('/')} · ${e.energy}` : `${e.category} · ${e.intensity} · ${(e.character || []).join('/')} · pico ${e.peak_s ?? '?'}s`;
    console.log(`${e.id}  ${e.duration_s ?? '?'}s  ${info}  [${e.license}]  ${e.file}${existsSync(join(ROOT, e.file)) ? '' : '  (arquivo não está nesta máquina)'}`);
  }
}

function check() {
  let bad = 0;
  for (const k of KINDS) {
    const ids = new Set();
    for (const e of load(k)) {
      const errs = [];
      if (!e.id || ids.has(e.id)) errs.push('id ausente ou repetido'); ids.add(e.id);
      if (!e.license) errs.push('SEM LICENÇA (não pode ser usado)');
      if (e.license && /CC-BY/i.test(e.license) && !e.attribution) errs.push('CC-BY sem atribuição');
      const q = Object.entries(e).filter(([, v]) => v === '?' || (Array.isArray(v) && v.includes('?'))).map(([key]) => key);
      if (q.length) errs.push(`campos a preencher: ${q.join(', ')}`);
      if (errs.length) { bad++; console.log(`✗ ${k}/${e.id}: ${errs.join('; ')}`); }
    }
  }
  console.log(bad ? `${bad} ficha(s) com pendência` : '✓ catálogos válidos');
  process.exitCode = bad ? 1 : 0;
}

function license(args) {
  const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
  const origin = opt('origin');
  const lic = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))[0];
  if (!origin || !lic) { console.log('Uso: node tools/audio/catalog.mjs license --origin <origem> "<licença>" [--attribution "<texto>"]'); process.exitCode = 1; return; }
  for (const k of KINDS) {
    const cat = load(k); let n = 0;
    for (const e of cat) if (e.source?.origin === origin) { e.license = lic; if (opt('attribution')) e.attribution = opt('attribution'); n++; }
    if (n) { save(k, cat); console.log(`${k}: licença "${lic}" em ${n} item(ns) de ${origin}`); }
  }
}

function index() {
  const L = ['# Índice da biblioteca de áudio', '', '> Gerado por `node tools/audio/catalog.mjs index`. Não editar à mão. Uma linha por família: `família ×variantes · duração · intensidade · caráter · licença`.', '> Detalhes de um item: `node tools/audio/catalog.mjs search sfx --family <Família>`.', ''];
  const sfx = load('sfx');
  const groups = {};
  for (const e of sfx) ((groups[`${e.category}${e.subcategory ? '/' + e.subcategory : ''}`] ??= {})[e.family] ??= []).push(e);
  L.push(`## SFX (${sfx.length} arquivos)`);
  for (const g of Object.keys(groups).sort()) {
    const fams = groups[g];
    L.push('', `### ${g} (${Object.values(fams).flat().length})`);
    for (const f of Object.keys(fams).sort()) {
      const v = fams[f], d = v.map((e) => e.duration_s ?? 0);
      const dur = Math.min(...d) === Math.max(...d) ? `${d[0].toFixed(1)}s` : `${Math.min(...d).toFixed(1)}–${Math.max(...d).toFixed(1)}s`;
      const lic = [...new Set(v.map((e) => e.license || 'SEM LICENÇA'))].join('/');
      L.push(`- ${f}${v.length > 1 ? ` ×${v.length}` : ''} · ${dur} · ${v[0].intensity} · ${(v[0].character || []).join('/')}${v[0].key ? ` · tom ${v[0].key}` : ''} · ${lic}`);
    }
  }
  for (const k of ['music', 'bases']) { const c = load(k); L.push('', `## ${k} (${c.length})`, ...c.map((e) => `- ${e.id} · ${e.duration_s ?? '?'}s · ${(e.mood || []).join('/')} · ${e.license || 'SEM LICENÇA'}`)); }
  writeFileSync(join(ROOT, 'INDEX.md'), L.join('\n') + '\n');
  console.log(`INDEX.md: ${L.length} linhas`);
}

const [cmd, kind, ...rest] = process.argv.slice(2);
if (cmd === 'scan') scan(kind && KINDS.includes(kind) ? [kind] : KINDS);
else if (cmd === 'search' && KINDS.includes(kind)) search(kind, rest);
else if (cmd === 'check') check();
else if (cmd === 'license') { license([kind, ...rest]); index(); }
else if (cmd === 'index') index();
else console.log('Uso: node tools/audio/catalog.mjs scan [sfx|music|bases] | search <sfx|music|bases> [filtros] | check');
