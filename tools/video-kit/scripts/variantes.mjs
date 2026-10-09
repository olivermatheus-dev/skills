// Variantes de um vídeo por script, sem LLM (tarefa 045 B): base aprovada + uma opção por eixo (voz, abertura…) →
// uma timeline por variante, falas do cache, trilha ancorada no corpo, efeitos, mix e render de rascunho.
//
//   node tools/video-kit/scripts/variantes.mjs <projeto> [--rodada r1] [--matriz] [--so id1,id2] [--listar]
//        [--sem-render] [--only=9x16] [--final]
//
// <projeto> = pasta do vídeo com projeto.json (ao lado da timeline.json aprovada, que é a base). Contrato:
// .claude/skills/video/references/variantes.md. Saída:
//   <projeto>/variantes/<id>/timeline.json (+ audio/ render/ exports/<nome>-<formato>-rascunho.mp4)
//   <projeto>/variantes/indice.json        (o que foi gerado: escolhas, duração, abertura, arquivos)
//   <projeto>/audio/cache/                 (falas por texto + voz e a trilha-mãe; fora do git, refazível)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { KIT, video, json, resolveVoice, layout, r3 } from './lib.mjs';
import { falar, extCru } from './voz.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const has = (n) => args.includes(`--${n}`);
const only = args.find((a) => a.startsWith('--only='));

const pasta = resolve(args[0] || '');
const projFile = join(pasta, 'projeto.json');
if (!existsSync(projFile)) throw new Error(`sem ${projFile} (molde em .claude/skills/video/references/variantes.md)`);
const proj = JSON.parse(readFileSync(projFile, 'utf8'));
const base = video(join(pasta, proj.base ? proj.base.replace(/timeline\.json$/, '') : '.'));
const nomeProjeto = proj.nome || base.name;
const clone = (x) => JSON.parse(JSON.stringify(x));
const hash = (x) => createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0, 12);
const run = (script, ...a) => execFileSync(process.execPath, [join(KIT, 'scripts', script), ...a], { stdio: 'inherit' });

// ── combinações ───────────────────────────────────────────────────────────────────────────
const eixos = proj.eixos || {};
const nomesEixos = Object.keys(eixos);
const opcao = (eixo, id) => {
  const o = (eixos[eixo] || []).find((x) => x.id === id);
  if (!o) throw new Error(`eixo "${eixo}" não tem a opção "${id}" (tem: ${(eixos[eixo] || []).map((x) => x.id).join(', ')})`);
  return o;
};
function combinacoes() {
  const rodada = opt('rodada') ?? (has('matriz') ? null : proj.rodada);
  let escolha;
  if (rodada) {
    escolha = proj.rodadas?.[rodada];
    if (!escolha) throw new Error(`rodada "${rodada}" não existe em projeto.json > rodadas (${Object.keys(proj.rodadas || {}).join(', ')})`);
  } else escolha = Object.fromEntries(nomesEixos.map((e) => [e, eixos[e].map((x) => x.id)]));
  if (Array.isArray(escolha)) return escolha; // lista explícita de combinações [{ abertura, voz }]
  // produto cartesiano dos eixos citados; eixo não citado fica com a 1ª opção
  return nomesEixos.reduce((acc, e) => acc.flatMap((c) => (escolha[e] ?? [eixos[e][0].id]).map((id) => ({ ...c, [e]: id }))), [{}]);
}
const idDe = (c) => nomesEixos.map((e) => `${e}-${c[e]}`).join('__');

// ── trilha ancorada: uma trilha-mãe com respiro antes, cada variante pula até o corpo cair no mesmo compasso ──
const ancora = proj.trilha?.ancora || base.tl.scenes[1]?.id;
const inicioDe = (tl, id) => tl.scenes.find((s) => s.id === id)?.start ?? 0;
const ancoraBase = inicioDe(base.tl, ancora);
function trilhaMae() {
  const m = base.tl.music || {};
  if (!m.synth) return { file: m.file, start: m.start ?? 0, preS: 0 };
  const pre = proj.trilha?.respiro_compassos ?? 2;
  const ciclo = m.synth.ciclo ?? 4;
  const barS = (60 / m.bpm) * (m.synth.beatsPerBar ?? 4);
  const s = clone(m.synth);
  const mv = (b) => b + pre;
  s.chords = [...s.chords.slice(ciclo - pre, ciclo), ...s.chords];
  s.sections = [{ from: 0, to: pre, style: s.sections[0]?.style ?? 'light' }, ...s.sections.map((x) => ({ ...x, from: mv(x.from), to: mv(x.to) }))];
  s.risers = (s.risers || []).map((x) => ({ from: mv(x.from), to: mv(x.to) }));
  s.impacts = (s.impacts || []).map(mv);
  s.totalBars = Math.ceil((base.tl.duration ?? 0) / barS) + pre + 4; // folga para abertura mais longa
  const dir = join(pasta, 'audio', 'cache', `trilha-${hash({ bpm: m.bpm, s })}`);
  if (!existsSync(join(dir, 'audio', 'music.wav'))) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'timeline.json'), JSON.stringify({ duration: s.totalBars * barS, music: { bpm: m.bpm, synth: s }, scenes: [] }, null, 2));
    run('music.mjs', dir);
  }
  return { file: join(dir, 'audio', 'music.wav'), start: 0, preS: r3(pre * barS) };
}

// ── falas: cache por (texto + voz); a da base é reaproveitada quando texto e voz são os mesmos ──
function falaDe(x, baseX, vozId, dirVar) {
  const texto = x.say ?? x.text;
  const rel = (f) => relative(dirVar, f).replace(/\\/g, '/');
  if (baseX && (baseX.say ?? baseX.text) === texto && baseX.voice === vozId && baseX.file && existsSync(join(pasta, baseX.file)))
    return { file: rel(join(pasta, baseX.file)), length: baseX.length, words: baseX.words, start: baseX.start, voice: vozId };
  const voice = resolveVoice(vozId);
  if (!['edge', 'windows'].includes(voice.engine)) throw new Error(`${x.id}: a voz ${vozId} é final (${voice.engine}); variante gera só com voz de rascunho. Voz final só nas aprovadas (skill elevenlabs).`);
  const dir = join(pasta, 'audio', 'cache', 'vo', vozId);
  const k = hash({ texto, voz: vozId, s: voice.settings || {} });
  const wav = join(dir, `${k}.wav`), meta = join(dir, `${k}.json`);
  if (!existsSync(wav) || !existsSync(meta)) {
    mkdirSync(join(dir, 'cru'), { recursive: true });
    const r = falar(voice, texto, join(dir, 'cru', `${k}.${extCru(voice)}`), wav);
    writeFileSync(meta, JSON.stringify({ texto, voz: vozId, ...r }, null, 1));
    console.log(`  + fala ${x.id} (${vozId}) ${r.length.toFixed(2)} s  "${texto}"`);
  }
  const c = JSON.parse(readFileSync(meta, 'utf8'));
  return { file: rel(wav), length: c.length, words: c.words, start: 0, voice: vozId };
}

// ── aplicar uma opção de eixo na timeline ───────────────────────────────────────────────────
const ANCORAS = ['word', 'at', 'before_end', 't'];
function aplicar(tl, o, ctx) {
  if (o.voz) ctx.voz = o.voz;
  for (const [id, txt] of Object.entries(o.falas || {})) {
    const x = tl.vo.find((y) => y.id === id);
    if (!x) throw new Error(`opção ${o.id}: fala ${id} não existe na base`);
    if (typeof txt === 'string') { x.text = txt; delete x.say; } else Object.assign(x, txt);
  }
  const cenas = { ...(o.cenas || {}) };
  if (o.cena) cenas[o.cena] = { ...cenas[o.cena], ...Object.fromEntries(Object.entries(o).filter(([k]) => !['id', 'cena', 'voz', 'falas', 'cenas', 'titulo', 'nota'].includes(k))) };
  for (const [sid, patch] of Object.entries(cenas)) {
    const sc = tl.scenes.find((s) => s.id === sid);
    if (!sc) throw new Error(`opção ${o.id}: cena ${sid} não existe na base`);
    const { cues, ...resto } = patch;
    Object.assign(sc, resto);
    for (const [cue, a] of Object.entries(cues || {})) {
      const anc = typeof a === 'string' ? { word: a } : a;
      let e = tl.events.find((x) => x.scene === sid && x.cue === cue);
      if (!e) tl.events.push((e = { id: `${sid}-${cue}`, cue, type: 'reveal', scene: sid }));
      if (ANCORAS.some((k) => k in anc)) for (const k of ANCORAS) delete e[k];
      Object.assign(e, anc);
    }
  }
}

function montar(c) {
  const id = idDe(c);
  const dirVar = join(pasta, 'variantes', id);
  mkdirSync(dirVar, { recursive: true });
  const tl = clone(base.tl);
  const ctx = { voz: proj.voz ?? null };
  for (const e of nomesEixos) aplicar(tl, opcao(e, c[e]), ctx);
  // ajustes finos só desta variante (fase C escreve aqui): { scenes: { s1: { tail } }, events: { e2: { offset } }, vo: { f1: { … } } }
  const aj = proj.ajustes?.[id] || {};
  for (const k of ['scenes', 'events', 'vo']) for (const [x, p] of Object.entries(aj[k] || {})) {
    const alvo = tl[k].find((y) => y.id === x);
    if (!alvo) throw new Error(`ajuste de ${id}: ${k}.${x} não existe`);
    Object.assign(alvo, p);
  }
  const vozPadrao = ctx.voz || json(join(base.companyDir, 'brand', 'voices.json'), {}).draft || 'edge-thalita';
  for (const x of tl.vo) {
    const baseX = base.tl.vo.find((y) => y.id === x.id);
    Object.assign(x, falaDe(x, baseX, x.voz || vozPadrao, dirVar));
    delete x.end;
  }
  layout(tl);
  // trilha: o corpo (cena-âncora) cai no mesmo ponto da música que na base
  const mae = trilhaMae();
  const pulo = r3(mae.start + mae.preS + ancoraBase - inicioDe(tl, ancora));
  if (pulo < 0) console.log(`  ⚠ ${id}: abertura ${(-pulo).toFixed(2)} s mais longa que o respiro da trilha; aumente trilha.respiro_compassos`);
  tl.music = { ...(tl.music || {}), file: relative(dirVar, mae.file).replace(/\\/g, '/'), start: Math.max(0, pulo), ancora: { cena: ancora, base_s: ancoraBase } };
  delete tl.music.synth;
  tl.origem = relative(dirVar, pasta).replace(/\\/g, '/');
  tl.nome_export = `${nomeProjeto}__${id}`;
  tl.variante = { id, projeto: nomeProjeto, escolhas: c };
  tl.voice = { current: vozPadrao, stage: 'draft' };
  tl.status = 'variante (rascunho)';
  writeFileSync(join(dirVar, 'timeline.json'), JSON.stringify(tl, null, 2) + '\n');
  return { id, dirVar, tl };
}

// ── rodar ────────────────────────────────────────────────────────────────────────────────
let lista = combinacoes();
if (opt('so')) { const so = opt('so').split(','); lista = lista.filter((c) => so.includes(idDe(c))); }
if (has('listar')) { for (const c of lista) console.log(idDe(c)); console.log(`${lista.length} variante(s)`); process.exit(0); }
if (!lista.length) throw new Error('nenhuma variante para gerar');

const indiceFile = join(pasta, 'variantes', 'indice.json');
const indice = existsSync(indiceFile) ? JSON.parse(readFileSync(indiceFile, 'utf8')) : { projeto: nomeProjeto, variantes: [] };
console.log(`${nomeProjeto}: ${lista.length} variante(s) · eixos ${nomesEixos.join(' × ')} · trilha ancorada em ${ancora} (${ancoraBase} s na base)`);
const falhas = [];
for (const c of lista) {
  const { id, dirVar, tl } = montar(c);
  console.log(`\n▸ ${id}  ${tl.duration} s (corpo em ${inicioDe(tl, ancora)} s)`);
  // uma variante que falha não derruba as outras: vai para o índice com o erro e a rodada segue
  let erro = null;
  try {
    run('sfx.mjs', dirVar);
    run('mix.mjs', dirVar);
    if (!has('sem-render')) run('produce.mjs', dirVar, ...(has('final') ? [] : ['--draft']), ...(only ? [only] : []));
  } catch (e) { erro = String(e.message).split('\n')[0]; falhas.push(id); console.log(`  ✗ ${id}: ${erro}`); }
  const exp = join(dirVar, 'exports');
  const item = {
    id, nome: tl.nome_export, escolhas: c, duracao: tl.duration, abertura_s: inicioDe(tl, ancora),
    exports: existsSync(exp) ? readdirSync(exp).filter((f) => f.endsWith('.mp4')).map((f) => `variantes/${id}/exports/${f}`) : [],
    gerada_em: new Date().toISOString().slice(0, 19) + 'Z',
    ...(erro ? { erro } : {}),
  };
  indice.variantes = [...indice.variantes.filter((x) => x.id !== id), item];
  mkdirSync(join(pasta, 'variantes'), { recursive: true });
  writeFileSync(indiceFile, JSON.stringify(indice, null, 2) + '\n');
}
if (falhas.length) { console.log(`\n✗ ${falhas.length} de ${lista.length} falharam: ${falhas.join(', ')}`); process.exit(1); }
console.log(`\n✓ ${lista.length} variante(s) em ${relative(process.cwd(), join(pasta, 'variantes'))} (índice: variantes/indice.json)`);
