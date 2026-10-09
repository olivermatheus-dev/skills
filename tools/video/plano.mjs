// Plano de cenas (skill `plano-de-cenas`, tarefa 047): confere o cenas.json e gera o esqueleto da timeline.json.
// O cenas.json é o plano em formato de máquina (contrato: .claude/skills/plano-de-cenas/references/cenas-json.md).
// Uso:
//   node tools/video/plano.mjs blocos   <pasta|slug>          blocos disponíveis (projeto → empresa → global): slots, cues, min_s
//   node tools/video/plano.mjs check    <pasta> [--json]      ✗ bloqueia · ⚠ aviso · tabela curta para a revisão crítica
//   node tools/video/plano.mjs timeline <pasta> [--force]     cenas.json → timeline.json (vo só com texto; o tts.mjs mede e encaixa)
//                                                             cena com "novo" entra como rascunho/cena-nova até o bloco existir
//   node tools/video/plano.mjs storyboard <pasta>             1 quadro por cena (render montado) → storyboard-<fmt>.png
//                                                             (antes: timeline → tts.mjs → produce.mjs --build-only)
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [cmd, arg, ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(`--${f}`);
const usage = () => { console.log('Uso: node tools/video/plano.mjs <blocos|check|timeline|storyboard> <pasta> [--json|--force]'); process.exit(1); };
if (!cmd || !arg) usage();

const WPS = 2.7; // palavras por segundo de locução (skill video)
const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '');
const words = (s = '') => String(s).trim().split(/\s+/).filter(Boolean);
const json = (f) => JSON.parse(readFileSync(f, 'utf8'));
const r1 = (x) => Math.round(x * 10) / 10;

// pasta do vídeo ou slug da empresa
function alvo(a) {
  const dir = existsSync(join(HUB, 'companies', a)) && !existsSync(join(resolve(a), 'cenas.json')) ? null : resolve(a);
  const parts = (dir || '').split(/[\\/]/);
  const i = parts.lastIndexOf('companies');
  const slug = dir ? (i >= 0 ? parts[i + 1] : null) : a;
  return { dir, slug, companyDir: slug ? join(HUB, 'companies', slug) : null };
}
const lugares = (t) => [
  ['projeto', t.dir && join(t.dir, 'blocos')],
  ['empresa', t.companyDir && join(t.companyDir, 'video-templates', 'blocos')],
  ['global', join(HUB, 'library', 'blocos')],
].filter(([, d]) => d && existsSync(d));

function todosBlocos(t) {
  const out = new Map();
  for (const [escopo, raiz] of lugares(t))
    for (const tipo of readdirSync(raiz, { withFileTypes: true }).filter((d) => d.isDirectory()))
      for (const id of readdirSync(join(raiz, tipo.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
        const use = `${tipo.name}/${id.name}`;
        const f = join(raiz, use, 'bloco.json');
        if (!out.has(use) && existsSync(f)) out.set(use, { escopo, ...json(f) });
      }
  return out;
}

if (cmd === 'blocos') {
  const t = alvo(arg);
  const bl = todosBlocos(t);
  if (!bl.size) { console.log('Nenhum bloco ainda (projeto, empresa ou library/blocos).'); process.exit(0); }
  for (const [use, m] of bl) {
    console.log(`${use}  [${m.escopo}${m.camada && m.camada !== 'palco' ? ' · ' + m.camada : ''}]  ${m.titulo || ''}`);
    console.log(`   slots: ${(m.slots || []).join(' | ') || '—'} · cues: ${(m.cues || []).join(', ') || '—'} · min ${m.min_s ?? '—'} s${m.params ? ' · params: ' + Object.keys(m.params).join(', ') : ''}`);
  }
  process.exit(0);
}

const t = alvo(arg);
if (!t.dir) usage();
const file = join(t.dir, 'cenas.json');
if (!existsSync(file)) { console.log(`Sem ${file} (molde: .claude/skills/plano-de-cenas/references/cenas-json.md)`); process.exit(1); }
const P = json(file);
const vo = Object.fromEntries((P.vo || []).map((x) => [x.id, x]));
const scenes = P.scenes || [];

if (cmd === 'timeline') {
  const out = join(t.dir, 'timeline.json');
  if (existsSync(out) && !has('force')) { console.log(`${out} já existe (use --force para sobrescrever; a timeline atual perde os tempos medidos)`); process.exit(1); }
  let n = 0;
  const events = [];
  const tl = {
    status: 'plano',
    fps: P.fps ?? 30,
    formats: P.formatos ?? ['4x5', '9x16'],
    vo: (P.vo || []).map(({ id, text, say }) => ({ id, text, ...(say ? { say } : {}) })),
    ...(P.camadas ? { camadas: P.camadas } : {}),
    scenes: scenes.map((s) => {
      for (const g of s.gestos || []) {
        if (!g.cue) continue;
        const e = { id: `e${++n}`, cue: g.cue, type: g.type || 'reveal', scene: s.id };
        if (g.word) { e.word = g.word; if (g.offset != null) e.offset = g.offset; } else if (g.before_end != null) e.before_end = g.before_end; else e.at = g.at ?? 0.02;
        events.push(e);
      }
      // bloco novo ainda não existe: entra o rascunho (library/blocos/rascunho/cena-nova) até o bloco ser escrito, depois do aval
      const novo = !s.use && s.novo ? `${s.novo.tipo}/${s.novo.id}` : undefined;
      return Object.fromEntries(Object.entries({
        id: s.id, use: s.use || (novo && 'rascunho/cena-nova'), block: s.block, vo: s.vo?.length ? s.vo : undefined,
        pause: s.pause, lead: s.lead, tail: s.tail, min: s.min, len: s.len,
        on_screen: s.on_screen, params: novo ? { ...s.params, novo, spec: s.novo.spec } : s.params,
        novo, note: s.acrescenta,
      }).filter(([, v]) => v !== undefined));
    }),
    events,
    sfx: [],
  };
  writeFileSync(out, JSON.stringify(tl, null, 2) + '\n');
  console.log(`✓ ${out}: ${tl.scenes.length} cenas · ${events.length} eventos · ${tl.vo.length} falas (sem áudio). Próximo: tts.mjs <pasta> (mede e encaixa).`);
  process.exit(0);
}

if (cmd === 'storyboard') {
  // 1 quadro assentado por cena (0,6 s antes do fim) de cada formato montado; cena com style_frame usa o PNG dele
  const tlf = join(t.dir, 'timeline.json');
  if (!existsSync(tlf)) { console.log('Sem timeline.json: rode plano.mjs timeline, tts.mjs e produce.mjs --build-only antes'); process.exit(1); }
  const tl = json(tlf);
  if (tl.scenes.some((s) => s.end == null)) { console.log('Timeline sem tempos: rode tts.mjs <pasta> antes'); process.exit(1); }
  const porId = Object.fromEntries(scenes.map((s) => [s.id, s]));
  const fmts = existsSync(join(t.dir, 'render')) ? readdirSync(join(t.dir, 'render')).filter((d) => !d.endsWith('-b') && existsSync(join(t.dir, 'render', d, 'index.html'))) : [];
  if (!fmts.length) { console.log('Nenhum formato montado: rode produce.mjs <pasta> --build-only'); process.exit(1); }
  // instante assentado: 0,6 s depois do último gesto (o estado parou), antes do cue "sai" e do corte
  const at = tl.scenes.map((s) => {
    const evs = (tl.events || []).filter((e) => e.scene === s.id && e.t != null);
    const sai = evs.find((e) => e.cue === 'sai')?.t ?? s.end;
    const ultimo = Math.max(s.start, ...evs.filter((e) => e.cue !== 'sai').map((e) => e.t));
    return +Math.max(s.start + 0.05, Math.min(sai - 0.15, Math.max(s.end - 0.6, ultimo + 0.6))).toFixed(2);
  });
  for (const fmt of fmts) {
    const dir = join(t.dir, 'render', fmt);
    rmSync(join(dir, 'storyboard'), { recursive: true, force: true });
    execFileSync(process.execPath, [join(HUB, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs'), 'snapshot', '.', '-o', 'storyboard', '--at', at.join(','), '--no-end', '--describe', 'false'],
      { cwd: dir, stdio: ['ignore', 'ignore', 'inherit'] });
    const pngs = readdirSync(join(dir, 'storyboard')).filter((f) => f.endsWith('.png')).sort();
    const quadros = tl.scenes.map((s, k) => {
      const sf = porId[s.id]?.style_frame && join(t.dir, porId[s.id].style_frame);
      return sf && existsSync(sf) ? sf : join(dir, 'storyboard', pngs[k]);
    }).filter((f) => f && existsSync(f));
    const cols = Math.min(4, quadros.length);
    const out = join(t.dir, `storyboard-${fmt}.png`);
    const ins = quadros.flatMap((f) => ['-i', f]);
    const filtro = quadros.map((_, k) => `[${k}:v]scale=360:-2,setsar=1[q${k}]`).join(';') + ';'
      + quadros.map((_, k) => `[q${k}]`).join('') + `xstack=inputs=${quadros.length}:layout=${quadros.map((_, k) => `${(k % cols) ? Array.from({ length: k % cols }, () => 'w0').join('+') : '0'}_${Math.floor(k / cols) ? Array.from({ length: Math.floor(k / cols) }, () => 'h0').join('+') : '0'}`).join('|')}:fill=white[s]`;
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', quadros.length > 1 ? filtro : '[0:v]scale=360:-2[s]', '-map', '[s]', '-frames:v', '1', out]);
    if (r.status) { console.log(String(r.stderr)); process.exit(1); }
    console.log(`${fmt}: ${out} (${quadros.length} cenas, ${cols} por linha: ${tl.scenes.map((s) => s.id).join(' · ')})`);
  }
  process.exit(0);
}

if (cmd !== 'check') usage();

// ---------- check ----------
const erros = [];
const avisos = [];
const bl = todosBlocos(t);
const REL = ['mostra', 'complementa', 'contrasta', 'prova', 'literal'];

if (!P.recorte) erros.push('falta "recorte" (1 frase: o que vende e para quem)');
if (!P.conceito?.motivo) erros.push('conceito sem "motivo" (o objeto/forma que atravessa o vídeo)');
if (!P.conceito?.transicao) avisos.push('conceito sem "transicao" (a regra de passagem entre cenas)');
if ((P.conceito?.alternativas || []).length < 1 && P.nivel !== 'simples') avisos.push('conceito sem alternativas registradas (médio/alto: 2–3 conceitos, 1 escolhido)');

// ideias → cenas
const ideias = P.ideias || [];
if (!ideias.length) erros.push('sem "ideias" (mapa de ideias da fase B)');
const cobertas = new Set(scenes.flatMap((s) => s.ideias || []));
for (const i of ideias) if (!cobertas.has(i.id)) erros.push(`ideia ${i.id} ("${String(i.trecho || '').slice(0, 40)}") não está em nenhuma cena`);
for (const i of ideias) if (!i.tipo) avisos.push(`ideia ${i.id} sem tipo (dor, prova, processo, contraste, lista, número, pergunta, promessa, CTA…)`);

// falas
const usadas = new Set(scenes.flatMap((s) => s.vo || []));
for (const id of Object.keys(vo)) if (!usadas.has(id)) erros.push(`fala ${id} não está em nenhuma cena`);

let tEst = 0;
const linhas = [];
let literal = 0;
let comMotivo = 0;
scenes.forEach((s, k) => {
  const id = s.id || `#${k + 1}`;
  const req = ['relacao', 'acrescenta', 'on_screen', 'entra', 'sai', 'olhar', 'intensidade', 'composicao'];
  for (const r of req) if (s[r] == null || s[r] === '') erros.push(`${id}: falta "${r}"`);
  if (s.relacao && !REL.includes(s.relacao)) erros.push(`${id}: relacao "${s.relacao}" (use ${REL.join(' | ')})`);
  if (s.relacao === 'literal') literal++;
  if (s.motivo) comMotivo++;
  if (!(s.poses || []).length) avisos.push(`${id}: sem poses-chave (início · meio · fim)`);
  if (!s.vo?.length && s.len == null && s.min == null) erros.push(`${id}: sem fala e sem "len"`);
  for (const f of s.vo || []) if (!vo[f]) erros.push(`${id}: fala ${f} não existe em vo[]`);

  // bloco
  let meta = null;
  if (s.use) {
    meta = bl.get(s.use);
    if (!meta) erros.push(`${id}: bloco "${s.use}" não existe (veja: plano.mjs blocos <pasta>); bloco a criar vai em "novo"`);
  } else if (s.novo) {
    if (!s.novo.tipo || !s.novo.id) erros.push(`${id}: "novo" precisa de tipo e id (vira <pasta>/blocos/<tipo>/<id>)`);
    if (!s.novo.spec) erros.push(`${id}: bloco novo sem "spec" (o que o bloco faz, slots, cues, params)`);
    if (!s.style_frame) avisos.push(`${id}: bloco novo sem style_frame (o storyboard precisa de um quadro estático)`);
    meta = { slots: s.novo.slots, cues: s.novo.cues };
  } else erros.push(`${id}: sem "use" (bloco existente) nem "novo"`);
  const partes = String(s.on_screen || '').split('|');
  if (meta?.slots && partes.length < meta.slots.length) erros.push(`${id}: on_screen tem ${partes.length} parte(s), o bloco espera ${meta.slots.length} (${meta.slots.join(' | ')})`);
  const cuesCena = new Set((s.gestos || []).map((g) => g.cue).filter(Boolean));
  for (const c of meta?.cues || []) if (!['entra', 'sai'].includes(c) && !cuesCena.has(c)) avisos.push(`${id}: cue "${c}" do bloco sem gesto na cena (o compor recusa cue declarado sem evento)`);

  // tempo estimado da cena e gestos (posição da palavra na fala ≈ proporção das palavras)
  const ws = (s.vo || []).flatMap((f) => words(vo[f]?.say ?? vo[f]?.text).map((w) => ({ f, w })));
  const lead = s.lead ?? (k === 0 ? 0.3 : 0.15);
  const dur = s.vo?.length ? lead + ws.length / WPS + 0.2 * ((s.vo.length || 1) - 1) + (s.tail ?? 0.3) : (s.len ?? s.min ?? 2.5);
  const durC = Math.max(dur, s.min ?? 0);
  const marcas = [0];
  for (const g of s.gestos || []) {
    if (!g.o_que) avisos.push(`${id}: gesto ${g.cue || g.word || ''} sem "o_que" (o que acontece na tela)`);
    if (g.word) {
      const [f, w] = String(g.word).split(':');
      const idx = ws.findIndex((x) => x.f === f && fold(x.w) === fold(w));
      if (idx < 0) erros.push(`${id}: gesto na palavra "${g.word}" que não está nas falas da cena`);
      else marcas.push(lead + idx / WPS + (g.offset ?? 0));
    } else if (g.at != null) marcas.push(g.at);
    else if (g.before_end != null) marcas.push(durC - g.before_end);
  }
  marcas.push(durC);
  marcas.sort((a, b) => a - b);
  const vao = Math.max(...marcas.slice(1).map((m, j) => m - marcas[j]));
  if (vao > 1.5 && !s.vivo) avisos.push(`${id}: ~${r1(vao)} s sem gesto novo (Padrões: ≤ 1,5 s sem algo novo; deriva ou ambiente que segura a tela vai em "vivo")`);
  if (!s.headline && /ui|card|painel|produto|lista/i.test(`${s.use || ''} ${s.block || ''}`)) avisos.push(`${id}: tela de UI/cards sem headline (Padrões do Oliver)`);
  if (!s.icone && !/cart|cta|final|logo|revela/i.test(`${s.use || ''} ${s.block || ''}`)) avisos.push(`${id}: ideia sem ícone/elemento de apoio declarado ("icone")`);
  for (const a of s.fontes || []) if (!a.fonte || /confirmar/i.test(a.status || '')) erros.push(`${id}: afirmação sem fonte confirmada: "${a.afirmacao}" (não entra)`);

  linhas.push({ id, t: `${r1(tEst)}–${r1(tEst + durC)}`, int: s.intensidade, rel: s.relacao, bloco: s.use || `novo:${s.novo?.tipo}/${s.novo?.id}`, acrescenta: s.acrescenta });
  tEst += durC;
});

// curva e arco
const ints = scenes.map((s) => s.intensidade ?? 0);
for (let k = 0; k + 2 < ints.length; k++) if (ints[k] >= 4 && ints[k + 1] >= 4 && ints[k + 2] >= 4) { avisos.push(`intensidade 4 em 3 cenas seguidas (${scenes[k].id}…): a curva precisa descer`); break; }
if (new Set(ints).size <= 1 && ints.length > 2) avisos.push('intensidade igual em todas as cenas (curva sem subida e descida)');
const ult = scenes.at(-1);
if (ult && (ult.len ?? ult.min ?? 0) < 2 && !/final|cta/i.test(`${ult.block} ${ult.use}`)) avisos.push('última cena não é cartão final com ≥ 2 s');
const g0 = scenes[0]?.gestos || [];
if (scenes[0] && !g0.some((g) => (g.at ?? 99) <= 0.1 || g.cue === 'entra')) avisos.push(`${scenes[0].id}: nada declarado entrando no 1º quadro (gesto "entra" com at ≈ 0)`);
if (scenes.length && literal / scenes.length > 0.3) avisos.push(`${literal}/${scenes.length} cenas "literal" (> 30%): a imagem só repete a fala; troque por complementa/contrasta/prova`);
if (scenes.length >= 3 && comMotivo < Math.ceil(scenes.length / 2)) avisos.push(`motivo "${P.conceito?.motivo || '?'}" só aparece em ${comMotivo}/${scenes.length} cenas (fio condutor fraco)`);
if (P.duracao_alvo && Math.abs(tEst - P.duracao_alvo) / P.duracao_alvo > 0.2) avisos.push(`duração estimada ${r1(tEst)} s × alvo ${P.duracao_alvo} s (> 20% de diferença)`);

if (has('json')) { console.log(JSON.stringify({ erros, avisos, duracao_estimada: r1(tEst), cenas: linhas }, null, 2)); process.exit(erros.length ? 2 : 0); }
console.log(`Plano: ${scenes.length} cenas · ${ideias.length} ideias · ${Object.keys(vo).length} falas · ≈ ${r1(tEst)} s${P.duracao_alvo ? ` (alvo ${P.duracao_alvo} s)` : ''} · motivo: ${P.conceito?.motivo || '—'}`);
for (const l of linhas) console.log(`  ${l.id.padEnd(4)} ${l.t.padEnd(11)} int ${l.int ?? '?'} · ${String(l.rel || '?').padEnd(11)} ${l.bloco}  — ${String(l.acrescenta || '').slice(0, 70)}`);
for (const e of erros) console.log(`✗ ${e}`);
for (const a of avisos) console.log(`⚠ ${a}`);
console.log(erros.length ? `\n${erros.length} bloqueio(s): corrija antes da revisão crítica.` : `\n✓ sem bloqueios${avisos.length ? ` · ${avisos.length} aviso(s) para a revisão olhar` : ''}.`);
process.exit(erros.length ? 2 : 0);
