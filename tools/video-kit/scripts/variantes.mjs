// Variantes de um vídeo por script, sem LLM (tarefa 045 B e C): base aprovada + uma opção por eixo (voz, abertura…) →
// uma timeline por variante, falas do cache, trilha ancorada, QC de sincronia com correção automática, efeitos, mix,
// render de rascunho e relatório curto para o LLM só do que o script não resolveu.
//
//   node tools/video-kit/scripts/variantes.mjs <projeto> [--rodada r1] [--matriz] [--so id1,id2] [--listar]
//        [--sem-render] [--only=9x16] [--final] [--qc] [--sem-tela] [--relatorio [id]]
//   --qc         monta, confere e corrige sem efeitos/mix/render (rápido; diz quem vai precisar do LLM)
//   --sem-tela   pula a medição no navegador (leitura, área segura, colisão)
//   --relatorio  imprime o relatório da variante (ou de todas com pendência) e sai
//
// <projeto> = pasta do vídeo com projeto.json (ao lado da timeline.json aprovada, que é a base). Contrato:
// .claude/skills/video/references/variantes.md. Saída:
//   <projeto>/variantes/<id>/timeline.json (+ audio/ render/ exports/<nome>-<formato>-rascunho.mp4)
//   <projeto>/variantes/<id>/sincronia.json + sincronia.md (QC: status, o que o script corrigiu, o que falta)
//   <projeto>/variantes/indice.json        (o que foi gerado: escolhas, duração, abertura, arquivos, qc)
//   <projeto>/audio/cache/                 (falas por texto + voz e as trilhas-mãe; fora do git, refazível)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { HUB, KIT, video, json, resolveVoice, layout, r3, duration } from './lib.mjs';
import { falar, extCru } from './voz.mjs';
import { qcTempo, qcTelaMedir, qcTela, relatorio, minimos, fecharNavegador } from './sincronia.mjs';

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

// ── trilha ancorada: uma trilha-mãe com respiro antes; cada variante pula até o corpo cair no mesmo compasso ──
// Com trilha sintetizada há uma 2ª âncora (`trilha.ancora_fim`, padrão a última cena): o andamento da trilha-mãe se
// ajusta (até `trilha.andamento_max`, 15%) para o cartão final cair no mesmo ponto da música (o "resolve") que na base,
// mesmo quando a voz da variante deixa o corpo mais curto ou mais longo.
const ancora = proj.trilha?.ancora || base.tl.scenes[1]?.id;
const ancoraFim = proj.trilha?.ancora_fim === null ? null : proj.trilha?.ancora_fim || base.tl.scenes.at(-1)?.id;
const inicioDe = (tl, id) => tl.scenes.find((s) => s.id === id)?.start ?? 0;
const ancoraBase = inicioDe(base.tl, ancora);
const pre = proj.trilha?.respiro_compassos ?? 2;
function trilhaMae(bpm) {
  const m = base.tl.music || {};
  if (!m.synth) return { file: m.file, start: m.start ?? 0, preS: 0 };
  const ciclo = m.synth.ciclo ?? 4;
  const barS = (60 / bpm) * (m.synth.beatsPerBar ?? 4);
  const s = clone(m.synth);
  const mv = (b) => b + pre;
  s.chords = [...s.chords.slice(ciclo - pre, ciclo), ...s.chords];
  s.sections = [{ from: 0, to: pre, style: s.sections[0]?.style ?? 'light' }, ...s.sections.map((x) => ({ ...x, from: mv(x.from), to: mv(x.to) }))];
  s.risers = (s.risers || []).map((x) => ({ from: mv(x.from), to: mv(x.to) }));
  s.impacts = (s.impacts || []).map(mv);
  s.totalBars = Math.ceil(((base.tl.duration ?? 0) * 1.2) / barS) + pre + 4; // folga para abertura ou voz mais longas
  const dir = join(pasta, 'audio', 'cache', `trilha-${hash({ bpm, s })}`);
  if (!existsSync(join(dir, 'audio', 'music.wav'))) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'timeline.json'), JSON.stringify({ duration: s.totalBars * barS, music: { bpm, synth: s }, scenes: [] }, null, 2));
    run('music.mjs', dir);
  }
  return { file: join(dir, 'audio', 'music.wav'), start: 0, preS: r3(pre * barS) };
}
/** Andamento e pulo da trilha desta variante + as medidas para o QC (pulo, sobra, resíduo do fim). */
function trilhaDe(tl) {
  const m = base.tl.music || {};
  if (!m.synth) {
    const mae = trilhaMae(m.bpm);
    const pulo = r3(mae.start + ancoraBase - inicioDe(tl, ancora));
    return { mae, bpm: m.bpm, qc: { pulo, sobra: null, residuo: null } };
  }
  const bpb = m.synth.beatsPerBar ?? 4, barB = (60 / m.bpm) * bpb, mb = m.start ?? 0;
  const pa = (mb + ancoraBase) / barB; // compasso (fracionário) da âncora do corpo na base
  let bpm = m.bpm, fator = 1, limitado = false, pf = null;
  if (ancoraFim && ancoraFim !== ancora) {
    pf = (mb + inicioDe(base.tl, ancoraFim)) / barB;
    const barV = (inicioDe(tl, ancoraFim) - inicioDe(tl, ancora)) / (pf - pa);
    const max = proj.trilha?.andamento_max ?? 0.15;
    fator = barB / barV;
    const f = Math.min(1 + max, Math.max(1 - max, fator));
    limitado = f !== fator;
    bpm = Math.round(m.bpm * f * 10) / 10; // cache por 0,1 BPM
  }
  const mae = trilhaMae(bpm);
  const bar = (60 / bpm) * bpb;
  const start = r3((pa + pre) * bar - inicioDe(tl, ancora));
  const residuo = pf == null ? null : r3((pf + pre) * bar - start - inicioDe(tl, ancoraFim));
  const sobra = r3(duration(mae.file) - Math.max(0, start) - tl.duration);
  return { mae, bpm, start, qc: { pulo: start, sobra, residuo, batida: 60 / bpm, fator: r3(fator), limitado, fim: ancoraFim } };
}

// ── falas: cache por (texto + voz); a da base é reaproveitada quando texto e voz são os mesmos ──
function falaDe(x, baseX, vozId, dirVar, rate) {
  const texto = x.say ?? x.text;
  rate = x.rate ?? rate; // velocidade da fala (edge: "-10%"; windows: número), por fala ou pela opção de voz
  const rel = (f) => relative(dirVar, f).replace(/\\/g, '/');
  if (!rate && baseX && (baseX.say ?? baseX.text) === texto && baseX.voice === vozId && baseX.file && existsSync(join(pasta, baseX.file)))
    return { file: rel(join(pasta, baseX.file)), length: baseX.length, words: baseX.words, start: baseX.start, voice: vozId };
  let voice = resolveVoice(vozId);
  if (rate) voice = { ...voice, settings: { ...voice.settings, rate } };
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
  if (o.rate) ctx.rate = o.rate;
  for (const [id, txt] of Object.entries(o.falas || {})) {
    const x = tl.vo.find((y) => y.id === id);
    if (!x) throw new Error(`opção ${o.id}: fala ${id} não existe na base`);
    if (typeof txt === 'string') { x.text = txt; delete x.say; } else Object.assign(x, txt);
  }
  const cenas = { ...(o.cenas || {}) };
  if (o.cena) cenas[o.cena] = { ...cenas[o.cena], ...Object.fromEntries(Object.entries(o).filter(([k]) => !['id', 'cena', 'voz', 'rate', 'falas', 'cenas', 'titulo', 'nota'].includes(k))) };
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

/** Aplica um ajuste { scenes: { s1: { tail } }, events: { e2: { offset } }, vo: { f1: { … } } } na timeline. */
function ajustar(tl, aj, origem) {
  for (const k of ['scenes', 'events', 'vo']) for (const [x, p] of Object.entries(aj?.[k] || {})) {
    const alvo = tl[k].find((y) => y.id === x);
    if (!alvo) throw new Error(`ajuste ${origem}: ${k}.${x} não existe`);
    Object.assign(alvo, p);
  }
}
const juntar = (a, b) => {
  const out = clone(a);
  for (const k of ['scenes', 'events', 'vo']) for (const [x, p] of Object.entries(b?.[k] || {})) ((out[k] ??= {})[x] = { ...out[k]?.[x], ...p });
  return out;
};

/** Monta a timeline de uma combinação. `auto` = correções do QC (refeitas a cada rodada, nunca gravadas no projeto.json). */
function montar(c, auto = {}) {
  const id = idDe(c);
  const dirVar = join(pasta, 'variantes', id);
  mkdirSync(dirVar, { recursive: true });
  const tl = clone(base.tl);
  const ctx = { voz: proj.voz ?? null };
  for (const e of nomesEixos) aplicar(tl, opcao(e, c[e]), ctx);
  // ajustes finos só desta variante: os do projeto.json (escritos à mão ou pelo LLM) e, por cima, os automáticos
  ajustar(tl, proj.ajustes?.[id], `de ${id} (projeto.json)`);
  ajustar(tl, auto, `automático de ${id}`);
  const vozPadrao = ctx.voz || json(join(base.companyDir, 'brand', 'voices.json'), {}).draft || 'edge-thalita';
  for (const x of tl.vo) {
    const baseX = base.tl.vo.find((y) => y.id === x.id);
    Object.assign(x, falaDe(x, baseX, x.voz || vozPadrao, dirVar, ctx.rate));
    delete x.end;
  }
  // a cena que cada evento deveria ter (o layout reatribui pela hora; o QC compara)
  const intent = Object.fromEntries((tl.events || []).map((e) => [e.id, e.scene]));
  let erro = null;
  try { layout(tl); } catch (e) { erro = String(e.message); }
  let trilha = null;
  if (!erro) {
    // trilha: o corpo (cena-âncora) e o cartão final caem no mesmo ponto da música que na base
    const t = trilhaDe(tl);
    trilha = t.qc;
    tl.music = { ...(tl.music || {}), bpm: t.bpm, file: relative(dirVar, t.mae.file).replace(/\\/g, '/'), start: Math.max(0, t.start ?? t.qc.pulo),
      ancora: { cena: ancora, base_s: ancoraBase, ...(t.qc.fim ? { fim: t.qc.fim, residuo_s: t.qc.residuo, andamento: t.qc.fator } : {}) } };
    delete tl.music.synth;
  }
  tl.origem = relative(dirVar, pasta).replace(/\\/g, '/');
  tl.nome_export = `${nomeProjeto}__${id}`;
  tl.variante = { id, projeto: nomeProjeto, escolhas: c };
  tl.voice = { current: vozPadrao, stage: 'draft' };
  tl.status = 'variante (rascunho)';
  writeFileSync(join(dirVar, 'timeline.json'), JSON.stringify(tl, null, 2) + '\n');
  return { id, dirVar, tl, intent, trilha, erro };
}

// ── rodar ────────────────────────────────────────────────────────────────────────────────
let lista = combinacoes();
if (opt('so')) { const so = opt('so').split(','); lista = lista.filter((c) => so.includes(idDe(c))); }
if (has('listar')) { for (const c of lista) console.log(idDe(c)); console.log(`${lista.length} variante(s)`); process.exit(0); }
if (!lista.length) throw new Error('nenhuma variante para gerar');

const indiceFile = join(pasta, 'variantes', 'indice.json');
const indice = existsSync(indiceFile) ? JSON.parse(readFileSync(indiceFile, 'utf8')) : { projeto: nomeProjeto, variantes: [] };

if (has('relatorio')) {
  const qual = opt('relatorio');
  const ids = qual && !qual.startsWith('--') ? [qual] : indice.variantes.filter((x) => x.qc && x.qc.status !== 'ok').map((x) => x.id);
  for (const id of ids) {
    const f = join(pasta, 'variantes', id, 'sincronia.md');
    console.log(existsSync(f) ? readFileSync(f, 'utf8') + '\n' : `${id}: sem relatório (rode o variantes.mjs nela)\n`);
  }
  if (!ids.length) console.log('nenhuma variante com pendência de sincronia');
  process.exit(0);
}

// ── QC de sincronia (fase C) ──────────────────────────────────────────────────────────────
const soQc = has('qc'), tela = !has('sem-tela');
const limites = { ...(proj.tipo === 'anuncio' ? { abertura_max_s: 5 } : {}), ...(proj.limites || {}) };
const formatosQc = only ? only.split('=')[1].split(',') : base.tl.formats || ['4x5', '9x16'];
const minS = minimos(base);
let medBase;
/** Medidas de tela da base aprovada (o gabarito), em cache enquanto a base e os blocos não mudarem. */
async function medidasBase() {
  if (medBase !== undefined) return medBase;
  const f = join(pasta, 'variantes', 'qc-base.json');
  const blocos = [...new Set(base.tl.scenes.map((s) => s.use).filter(Boolean))].map((u) => { try { return readFileSync(join(base.companyDir, 'video-templates', 'blocos', u, 'bloco.js'), 'utf8'); } catch { return u; } });
  const k = hash({ tl: base.tl, formatosQc, blocos });
  const c = json(f, null);
  if (c?.hash === k) return (medBase = c.med);
  try {
    run('produce.mjs', base.dir, '--build-only', `--only=${formatosQc.join(',')}`);
    medBase = await qcTelaMedir(base.dir, formatosQc, { tipo: proj.tipo, limites });
    writeFileSync(f, JSON.stringify({ hash: k, med: medBase }) + '\n');
  } catch (e) { console.log(`  ⚠ base sem medida de tela (${String(e.message).split('\n')[0]}): tudo da tela sai como aviso`); medBase = null; }
  return medBase;
}

/** Monta, confere e corrige sozinho (até 3 voltas). → { m, problemas, auto: [consertos] } */
async function montarComQc(c) {
  let auto = {}, consertos = [], m, problemas;
  for (let volta = 0; volta < 3; volta++) {
    m = montar(c, auto);
    if (m.erro) { problemas = [{ nivel: 'erro', regra: 'layout', cena: null, msg: m.erro }]; break; }
    problemas = qcTempo({ tl: m.tl, base: base.tl, intent: m.intent, limites, minS, trilha: m.trilha });
    if (tela && !problemas.some((p) => p.nivel === 'erro')) {
      try {
        run('produce.mjs', m.dirVar, '--build-only', `--only=${formatosQc.join(',')}`);
        const med = await qcTelaMedir(m.dirVar, formatosQc, { tipo: proj.tipo, limites });
        problemas.push(...qcTela({ med, medBase: await medidasBase(), tl: m.tl, tlBase: base.tl, limites }));
      } catch (e) { problemas.push({ nivel: 'erro', regra: 'compor', cena: null, msg: String(e.message).split('\n').slice(0, 3).join(' · ') }); }
    }
    const novos = problemas.filter((p) => p.auto);
    if (!novos.length || volta === 2) break;
    const proximo = novos.reduce((a, p) => juntar(a, p.auto), auto);
    if (JSON.stringify(proximo) === JSON.stringify(auto)) break;
    auto = proximo;
    consertos.push(...novos.map((p) => p.conserto));
    console.log(`  ↻ ${m.id}: ${[...new Set(novos.map((p) => p.conserto))].join('; ')}`);
  }
  // o que ainda pede correção depois das voltas: o script não deu conta, vai para o LLM
  for (const p of problemas) if (p.auto) { delete p.auto; p.msg += ` (a correção automática "${p.conserto}" não bastou)`; }
  return { m, problemas, auto: [...new Set(consertos)], ajuste_auto: auto };
}

/** Lê o QC técnico do MP4 (tools/video/qc.mjs): crítico vira erro, maior vira aviso. */
function qcTecnico(dirVar) {
  let saida;
  try { saida = execFileSync(process.execPath, [join(HUB, 'tools', 'video', 'qc.mjs'), dirVar], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { saida = String(e.stdout || ''); }
  return saida.split('\n').filter((l) => /^(❌|⚠️)/.test(l)).map((l) => ({ nivel: l.startsWith('❌') ? 'erro' : 'aviso', regra: 'tecnico', cena: null, msg: l.replace(/^(❌ crítico|⚠️ maior) — /, '') }));
}

console.log(`${nomeProjeto}: ${lista.length} variante(s) · eixos ${nomesEixos.join(' × ')} · trilha ancorada em ${ancora} (${ancoraBase} s na base)${ancoraFim ? ` e ${ancoraFim}` : ''}${soQc ? ' · só QC' : ''}`);
const falhas = [];
const resumo = [];
for (const c of lista) {
  const { m, problemas, auto, ajuste_auto } = await montarComQc(c);
  const { id, dirVar, tl } = m;
  console.log(`\n▸ ${id}  ${tl.duration} s (corpo em ${inicioDe(tl, ancora)} s${tl.music?.bpm ? `, trilha ${tl.music.bpm} BPM` : ''})`);
  // uma variante que falha não derruba as outras: vai para o índice com o erro e a rodada segue
  let erro = problemas.find((p) => p.nivel === 'erro' && ['layout', 'compor', 'cue-fora'].includes(p.regra))?.msg ?? null;
  if (!erro && !soQc) {
    try {
      run('sfx.mjs', dirVar);
      run('mix.mjs', dirVar);
      if (!has('sem-render')) { run('produce.mjs', dirVar, ...(has('final') ? [] : ['--draft']), ...(only ? [only] : [])); problemas.push(...qcTecnico(dirVar)); }
    } catch (e) { erro = String(e.message).split('\n')[0]; problemas.push({ nivel: 'erro', regra: 'render', cena: null, msg: erro }); }
  }
  if (erro) { falhas.push(id); console.log(`  ✗ ${id}: ${erro}`); }
  // QC: status, o que o script corrigiu, o que sobra para o LLM
  const status = problemas.some((p) => p.nivel === 'erro') ? 'erro' : problemas.some((p) => p.nivel === 'aviso' && !p.auto) ? 'aviso' : 'ok';
  const restam = problemas.filter((p) => ['erro', 'aviso'].includes(p.nivel) && !p.auto);
  const opcoes = Object.fromEntries(nomesEixos.map((e) => [e, opcao(e, c[e])]).filter(([, o]) => Object.keys(o).some((k) => !['id', 'titulo', 'nota', 'voz'].includes(k))));
  const md = relatorio({ id, tl, problemas, auto, escolhas: c, opcoes });
  writeFileSync(join(dirVar, 'sincronia.json'), JSON.stringify({ status, auto, ajuste_auto, problemas, medido_em: new Date().toISOString().slice(0, 19) + 'Z' }, null, 2) + '\n');
  if (restam.length) writeFileSync(join(dirVar, 'sincronia.md'), md + '\n'); else rmSync(join(dirVar, 'sincronia.md'), { force: true });
  const tokens = Math.round(md.length / 3.5);
  for (const p of restam) console.log(`  ${p.nivel === 'erro' ? '✗' : '⚠'} ${p.regra}${p.cena ? ` ${p.cena}` : ''}: ${p.msg}`);
  console.log(`  QC ${status}${auto.length ? ` · corrigido: ${auto.join('; ')}` : ''}${restam.length ? ` · relatório para o LLM ≈ ${tokens} tokens (variantes/${id}/sincronia.md)` : ''}`);
  resumo.push({ id, status, auto: auto.length, restam: restam.length, tokens: restam.length ? tokens : 0 });

  const exp = join(dirVar, 'exports');
  const anterior = indice.variantes.find((x) => x.id === id);
  const item = {
    id, nome: tl.nome_export, escolhas: c, duracao: tl.duration, abertura_s: inicioDe(tl, ancora),
    exports: existsSync(exp) ? readdirSync(exp).filter((f) => f.endsWith('.mp4')).map((f) => `variantes/${id}/exports/${f}`) : [],
    gerada_em: soQc && anterior?.gerada_em ? anterior.gerada_em : new Date().toISOString().slice(0, 19) + 'Z',
    qc: { status, corrigidos: auto.length, pendentes: restam.length, ...(soQc ? { sem_render: true } : {}) },
    ...(erro ? { erro } : {}),
  };
  indice.variantes = [...indice.variantes.filter((x) => x.id !== id), item];
  mkdirSync(join(pasta, 'variantes'), { recursive: true });
  writeFileSync(indiceFile, JSON.stringify(indice, null, 2) + '\n');
}
await fecharNavegador();
console.log('\nSincronia:');
for (const r of resumo) console.log(`  ${r.status === 'ok' ? '✓' : r.status === 'aviso' ? '⚠' : '✗'} ${r.id.padEnd(44)} ${r.auto ? `${r.auto} corrigido(s) ` : ''}${r.restam ? `${r.restam} para o LLM (≈ ${r.tokens} tokens)` : ''}`);
if (resumo.some((r) => r.restam)) console.log(`  relatórios: node tools/video-kit/scripts/variantes.mjs ${relative(HUB, pasta).replace(/\\/g, '/')} --relatorio [id]`);
if (falhas.length) { console.log(`\n✗ ${falhas.length} de ${lista.length} falharam: ${falhas.join(', ')}`); process.exit(1); }
console.log(`\n✓ ${lista.length} variante(s) em ${relative(process.cwd(), join(pasta, 'variantes'))} (índice: variantes/indice.json)`);
