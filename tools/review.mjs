// Lê as anotações do Oliver numa peça (tarefa 022): só as abertas, com o contexto resolvido pela timeline.json
// (vídeo) ou pelo próprio texto (roteiro.md/plano.md: o trecho é reencontrado mesmo se as linhas mudaram)
// (texto da cena, fala, tempo, alvo, trecho do HTML) e os quadros dos tempos anotados extraídos do MP4 (ffmpeg).
// Uso:
//   node tools/review.mjs <pasta-da-peça> [--all] [--no-frames]       lista (abertas por padrão)
//   node tools/review.mjs <pasta-da-peça> resolve <id> "o que mudou"   marca resolvida e guarda a resposta
//   node tools/review.mjs <pasta-da-peça> responde <id> "pergunta"     responde sem resolver (precisa de decisão do Oliver)
// Os quadros vão para <pasta>/render/review/<id>-<tempo>s.jpg: abra com Read para ver o que o Oliver viu.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve as rpath } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const pos = args.filter((a) => !a.startsWith('--'));
const dir = pos[0] && rpath(pos[0]);
if (!dir || !existsSync(dir)) { console.log('Uso: node tools/review.mjs <pasta-da-peça> [--all] [--no-frames]\n     node tools/review.mjs <pasta-da-peça> resolve <id> "o que mudou"'); process.exit(1); }

const file = join(dir, 'revisao.json');
const review = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { comments: [] };
const save = () => writeFileSync(file, `${JSON.stringify(review, null, 2)}\n`);
const read = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8') : null);
const tl = read('timeline.json') ? JSON.parse(read('timeline.json')) : null;
const html = read('composition.html');
const fmt = (t) => `${t.toFixed(2)}s`;

// ---- resolve ----
if (pos[1] === 'resolve') {
  const [id, ...msg] = pos.slice(2);
  const c = review.comments.find((x) => x.id === id);
  if (!c) { console.log(`❌ anotação ${id} não existe (ids: ${review.comments.map((x) => x.id).join(', ') || 'nenhuma'})`); process.exit(1); }
  if (!msg.length) { console.log('❌ diga o que mudou: resolve <id> "o que mudou"'); process.exit(1); }
  c.status = 'resolvido'; c.reply = msg.join(' '); c.resolvedAt = new Date().toISOString().slice(0, 19);
  save();
  const left = review.comments.filter((x) => x.status === 'aberto').length;
  console.log(`✅ ${id} resolvida. Abertas restantes: ${left}`);
  process.exit(0);
}

// ---- responde (pergunta ao Oliver sem resolver: decisão dele ou algo pago) ----
if (pos[1] === 'responde') {
  const [id, ...msg] = pos.slice(2);
  const c = review.comments.find((x) => x.id === id);
  if (!c) { console.log(`❌ anotação ${id} não existe (ids: ${review.comments.map((x) => x.id).join(', ') || 'nenhuma'})`); process.exit(1); }
  if (!msg.length) { console.log('❌ escreva a pergunta: responde <id> "pergunta"'); process.exit(1); }
  c.reply = msg.join(' '); c.replyAt = new Date().toISOString().slice(0, 19);
  save();
  console.log(`💬 ${id} respondida (continua aberta para o Oliver decidir).`);
  process.exit(0);
}

// ---- resolver contexto ----
const scene = (id) => tl?.scenes.find((s) => s.id === id);
const sceneAt = (t) => tl?.scenes.find((s) => t >= s.start && t < s.end) ?? tl?.scenes.at(-1);
const voOf = (id) => tl?.vo.find((v) => v.id === id);
const ev = (id) => tl?.events.find((e) => e.id === id);
const evT = (e) => e.t ?? e.at ?? 0;
const clean = (s) => (s ?? '').replace(/\|/g, ' / ').replace(/\*/g, '');
const snippet = (sel) => {
  if (!html) return null;
  const m = sel.match(/^#([\w-]+)$/) ?? sel.match(/^\[data-bloco=["']?([\w-]+)["']?\]$/);
  if (!m) return null;
  const re = sel.startsWith('#') ? new RegExp(`id=["']${m[1]}["']`) : new RegExp(`data-bloco=["']${m[1]}["']`);
  const i = html.split('\n').findIndex((l) => re.test(l));
  return i < 0 ? `(seletor ${sel} NÃO encontrado no composition.html: o id mudou? procure pelo texto da cena)` : `composition.html:${i + 1}: ${html.split('\n')[i].trim().slice(0, 220)}`;
};

function resolveCtx(c) {
  const a = c.anchor;
  const x = { t: a.t ?? null, lines: [] };
  if (a.kind === 'cena') {
    const s = scene(a.scene);
    if (s) { x.t ??= s.start; x.lines.push(`cena ${s.id} (${s.block}) ${fmt(s.start)}–${fmt(s.end)} · na tela: ${clean(s.on_screen)}`); x.lines.push(...(s.vo ?? []).map((v) => `fala ${v}: "${voOf(v)?.text}"`)); }
    else x.lines.push(`⚠ cena ${a.scene} não existe mais na timeline`);
  } else if (a.kind === 'fala') {
    const v = voOf(a.vo);
    if (v) { x.t ??= v.start; x.lines.push(`fala ${v.id} a partir de ${fmt(v.start)}: "${v.text}"${a.word ? ` · palavra "${a.word}"` : ''}`); const s = sceneAt(v.start); if (s) x.lines.push(`cena ${s.id} (${s.block}) · na tela: ${clean(s.on_screen)}`); }
    else x.lines.push(`⚠ fala ${a.vo} não existe mais`);
  } else if (a.kind === 'evento') {
    const e = ev(a.event);
    if (e) { x.t ??= evT(e); x.lines.push(`evento ${e.id}: ${e.type} em ${e.target ?? '—'} aos ${fmt(evT(e))}${e.word ? ` (ligado à palavra ${e.word})` : ''}${e.scene ? ` · cena ${e.scene}` : ''}`); if (e.target) { const sn = snippet(e.target); if (sn) x.lines.push(sn); } const sfx = tl.sfx?.filter((f) => f.event === e.id).map((f) => f.asset); if (sfx?.length) x.lines.push(`sfx do evento: ${sfx.join(', ')}`); }
    else x.lines.push(`⚠ evento ${a.event} não existe mais`);
  } else if (a.kind === 'elemento') {
    const s = scene(a.scene) ?? sceneAt(a.t);
    x.lines.push(`elemento ${a.selector} aos ${fmt(a.t)}${s ? ` · cena ${s.id} (${s.block}) · na tela: ${clean(s.on_screen)}` : ''}`);
    const sn = snippet(a.selector); if (sn) x.lines.push(sn);
    const evs = tl?.events.filter((e) => e.target === a.selector).map((e) => `${e.id}@${fmt(evT(e))}`); if (evs?.length) x.lines.push(`eventos que mexem nele: ${evs.join(', ')}`);
  } else if (a.kind === 'roteiro') {
    // reencontra o trecho pelo texto (as linhas podem ter mudado desde a anotação)
    const f = a.file ?? 'roteiro.md', txt = read(f);
    if (!txt) x.lines.push(`⚠ ${f} não existe mais`);
    else {
      const lines = txt.split('\n'), h = a.quote.split('\n').map((l) => l.trim()).find(Boolean)?.slice(0, 80) ?? '';
      let at = lines[a.line - 1]?.includes(h) ? a.line : null;
      if (!at) { let d = Infinity; lines.forEach((l, i) => { if (h && l.includes(h) && Math.abs(i + 1 - a.line) < d) { at = i + 1; d = Math.abs(i + 1 - a.line); } }); }
      x.lines.push(`trecho de ${f}: "${a.quote.replace(/\n/g, ' / ').slice(0, 300)}"`);
      if (at) {
        const from = Math.max(1, at - 1), to = Math.min(lines.length, at + a.quote.split('\n').length);
        x.lines.push(`${f}:${at}${at !== a.line ? ` (anotado na linha ${a.line})` : ''}`);
        for (let i = from; i <= to; i++) if (lines[i - 1].trim()) x.lines.push(`  ${i === at ? '>' : ' '} ${i}| ${lines[i - 1].slice(0, 200)}`);
      } else x.lines.push(`⚠ o trecho não está mais em ${f} (texto mudou): confira se a anotação ainda vale`);
    }
  } else if (a.kind === 'slide') {
    const imgs = existsSync(join(dir, 'png')) ? readdirSync(join(dir, 'png')).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort((p, q) => p.localeCompare(q, 'en', { numeric: true })) : [];
    const at = imgs.indexOf(a.file) + 1;
    const pin = a.x != null && a.y != null ? ` · pino em x ${Math.round(a.x * 100)}% · y ${Math.round(a.y * 100)}% (${a.y < 0.33 ? 'topo' : a.y < 0.66 ? 'meio' : 'base'}, ${a.x < 0.33 ? 'esquerda' : a.x < 0.66 ? 'centro' : 'direita'})` : ' · o slide todo';
    if (!at) x.lines.push(`⚠ png/${a.file} não existe mais (slide ${a.slide} quando anotado): reexportado com outro nome?`);
    else x.lines.push(`slide ${at}${at !== a.slide ? ` (era o ${a.slide})` : ''} · png/${a.file}${pin}`);
    for (const src of ['carrossel.html', 'carousel.html', 'mockup.json']) if (read(src)) { x.lines.push(`fonte: ${src} (corrija lá e reexporte o PNG)`); break; }
    if (at) x.img = join(dir, 'png', a.file);
  } else if (a.kind === 'tempo') {
    const s = sceneAt(a.t);
    if (s) { x.lines.push(`cena ${s.id} (${s.block}) ${fmt(s.start)}–${fmt(s.end)} · na tela: ${clean(s.on_screen)}`); const v = tl.vo.find((f) => a.t >= f.start && a.t <= (f.end ?? f.start + 9)); if (v) x.lines.push(`fala ${v.id}: "${v.text}"`); }
    const near = tl?.events.filter((e) => Math.abs(evT(e) - a.t) <= 0.8).map((e) => `${e.id} ${e.type} ${e.target ?? ''}@${fmt(evT(e))}`); if (near?.length) x.lines.push(`eventos por perto: ${near.join(' · ')}`);
  }
  return x;
}

// ---- quadros ----
const exportsDir = join(dir, 'exports');
const latest = existsSync(exportsDir) ? readdirSync(exportsDir).filter((f) => /\.mp4$/i.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).at(-1) : null;
const wantFrames = !flags.includes('--no-frames');
function frame(c, t) {
  const mp4 = latest;
  if (!wantFrames || !mp4 || t == null) return null;
  const out = join(dir, 'render', 'review');
  mkdirSync(out, { recursive: true });
  const f = join(out, `${c.id}-${t.toFixed(2)}s.jpg`);
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(t), '-i', join(exportsDir, mp4), '-frames:v', '1', '-q:v', '3', f], { encoding: 'utf8' });
  return r.status === 0 && existsSync(f) ? f : null;
}
/** slide com o pino marcado (anel vermelho) → render/review/<id>-slide.png; sem pino, a própria imagem */
function pinned(c, img) {
  const { x, y } = c.anchor;
  if (!wantFrames || x == null || y == null) return img;
  const out = join(dir, 'render', 'review');
  mkdirSync(out, { recursive: true });
  const f = join(out, `${c.id}-slide.png`);
  const ring = `if(lt(abs(hypot(X-${x}*W,Y-${y}*H)-0.035*W),0.006*W),1,0)`;
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', img, '-vf', `format=rgba,geq=r='if(${ring},230,r(X,Y))':g='if(${ring},30,g(X,Y))':b='if(${ring},30,b(X,Y))':a='alpha(X,Y)'`, '-frames:v', '1', f], { encoding: 'utf8' });
  return r.status === 0 && existsSync(f) ? f : img;
}

// ---- saída ----
const all = flags.includes('--all');
const list = review.comments.filter((c) => all || c.status === 'aberto');
// formato da galeria (027) marcado na ficha: a IA segue a skill e as observações do Oliver (mandam sobre a skill)
const formato = read('peca.json') && JSON.parse(read('peca.json')).formato;
if (formato) {
  const ff = rpath('library', 'formatos', formato, 'formato.json');
  const fm = existsSync(ff) ? JSON.parse(readFileSync(ff, 'utf8')) : null;
  console.log(fm ? `formato: ${fm.nome} → ${fm.skill ? `skill ${fm.skill}` : 'rascunho sem skill (seguir essência e estrutura do formato.json)'}${fm.observacoes ? `\n   observações do Oliver: ${fm.observacoes.replace(/\n/g, ' / ')}` : ''}\n` : `⚠ formato "${formato}" não existe em library/formatos/\n`);
}
if (!list.length) { console.log(`Nenhuma anotação ${all ? '' : 'aberta '}em ${dir}.`); process.exit(0); }
// pasta de uma variante (045 D): timeline e composição são geradas; o ajuste vai no projeto.json, nunca na variante
const varProj = /[\\/]variantes[\\/][\w-]+$/.test(dir) && existsSync(join(dir, '..', '..', 'projeto.json')) ? rpath(dir, '..', '..') : null;
const varId = varProj && dir.split(/[\\/]/).pop();
if (varProj) console.log(`VARIANTE ${varId} do projeto ${varProj}: não edite a timeline/composição desta pasta (são geradas).\n   alcance "variante" → projeto.json > ajustes["${varId}"] · alcance "todas" → base (timeline.json do projeto) ou a opção do eixo\n   contrato: .claude/skills/video/references/variantes.md · depois: node tools/video-kit/scripts/variantes.mjs "${varProj}" --matriz --so <ids>\n`);
console.log(`# Anotações ${all ? '' : 'abertas '}— ${dir}`);
const appr = Object.entries(review.approvals ?? {}).filter(([, d]) => d).map(([k, d]) => `${k} aprovado em ${d}`);
console.log(`status: ${review.status ?? '—'}${appr.length ? ` · ${appr.join(' · ')}` : ' · roteiro ainda NÃO aprovado'}`);
if (list.some((c) => !['roteiro', 'slide'].includes(c.anchor.kind))) console.log(`vídeo mais recente: ${latest ?? '(sem MP4 em exports/)'}`);
console.log(`${list.length} anotação(ões)\n`);
const ORDER = { corrigir: 0, ajustar: 1, template: 2, ok: 3 };
for (const c of [...list].sort((a, b) => (ORDER[a.tipo] ?? 9) - (ORDER[b.tipo] ?? 9) || a.id.localeCompare(b.id, 'en', { numeric: true }))) {
  const x = resolveCtx(c);
  console.log(`## ${c.id} · ${c.tipo.toUpperCase()}${c.status === 'resolvido' ? ' (resolvida)' : ''} · âncora: ${c.anchor.kind}${x.t != null ? ` · ${fmt(x.t)}` : ''}${c.video && latest && c.video !== latest ? ` · ⚠ anotada em ${c.video} (o mais recente é ${latest})` : ''}`);
  console.log(`   "${c.text.replace(/\n/g, '\n   ')}"`);
  if (varProj) console.log(`   · vale para: ${c.alcance === 'todas' ? 'TODAS as variantes (base ou opção do eixo)' : `só esta variante (ajustes["${varId}"])`}`);
  for (const l of x.lines) console.log(`   · ${l}`);
  const f = x.img ? pinned(c, x.img) : frame(c, x.t);
  if (f) console.log(`   · ${x.img ? 'imagem' : 'quadro'}: ${f}`);
  if (c.reply) console.log(`   · resposta anterior: ${c.reply}`);
  if (c.tipo === 'template') console.log('   → TEMPLATE: promover para a galeria (library/motion/, tarefa 014), não só corrigir nesta peça.');
  if (c.tipo === 'ok') console.log('   → OK: está aprovado; não mexer. Resolva só para registrar.');
  console.log(`   resolver: node tools/review.mjs "${pos[0]}" resolve ${c.id} "o que mudou"\n`);
}
