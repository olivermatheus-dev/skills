#!/usr/bin/env node
// Custo de uma sessão do Claude Code (com subagentes), lido dos transcripts locais, e gravação na ficha da peça (025).
// Uso:
//   node tools/usage.mjs <sessão|--atual> [--since ISO] [--until ISO] [--json]
//   node tools/usage.mjs <sessão|--atual> --piece <pasta-da-peça> --etapa <etapa> [--esforco alto] [--nota "…"] [--since ISO]
//     sessão  = nome do .jsonl em ~/.claude/projects/<repo>/ (não é o id local_… do app). Procura em todas as pastas
//               do repo (inclusive worktrees). --atual = a sessão mexida por último (a que está rodando agora).
//     --piece = grava a rodada em <pasta>/peca.json → custo[] (mesma sessão + etapa: substitui, então pode rodar de novo),
//               junta skills/agentes usados em producao e grava o commit atual. Etapas: schema/piece.ts → COST_ETAPAS.
// Soma o `usage` de cada resposta (1 vez por message.id) por modelo e converte em US$. Preços: skill claude-api (2026-09-25).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';

// US$ por milhão de tokens. Escrita no cache: 1,25× (5 min) e 2× (1 h) o preço de entrada.
const PRICE = {
  'claude-opus-5-5': { in: 4, out: 20, read: 0.2 },
  'claude-sonnet-5-5': { in: 2, out: 10, read: 0.2 },
  'claude-haiku-4-5': { in: 1, out: 5, read: 0.1 },
  'claude-fable-5-1': { in: 10, out: 50, read: 0.25 },
};
const ETAPAS = ['pauta', 'roteiro', 'plano', 'producao', 'voz', 'trilha', 'revisao', 'ajustes', 'outro'];

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
const VALUED = ['--since', '--until', '--piece', '--etapa', '--esforco', '--nota'];
const id0 = args.find((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
const since = opt('--since') ? Date.parse(opt('--since')) : -Infinity;
const until = opt('--until') ? Date.parse(opt('--until')) : Infinity;
const piece = opt('--piece'), etapa = opt('--etapa');
const die = (m) => { console.error(m); process.exit(1); };
if (!id0 && !args.includes('--atual')) die('uso: node tools/usage.mjs <sessão|--atual> [--since ISO] [--until ISO] [--json] [--piece <pasta> --etapa <etapa> [--esforco x] [--nota "…"]]');
if (piece && !ETAPAS.includes(etapa)) die(`--etapa obrigatória com --piece: ${ETAPAS.join(' · ')}`);
if (piece && !existsSync(piece)) die(`pasta da peça não existe: ${piece}`);

// pastas de transcript deste repo: a raiz e as worktrees (.claude/worktrees/<x>) viram nomes com o mesmo prefixo
const PROJECTS = join(homedir(), '.claude', 'projects');
const root = process.cwd().split(`${sep}.claude${sep}worktrees${sep}`)[0];
const prefix = root.replace(/[^A-Za-z0-9]/g, '-');
const dirs = existsSync(PROJECTS) ? readdirSync(PROJECTS).filter((d) => d.startsWith(prefix)).map((d) => join(PROJECTS, d)) : [];
let main;
if (id0) main = dirs.map((d) => join(d, `${id0}.jsonl`)).find(existsSync);
else main = dirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.jsonl')).map((f) => join(d, f))).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
if (!main) die(`não achei a sessão ${id0 ?? '(atual)'} em ${PROJECTS}${sep}${prefix}*`);
const id = main.split(sep).pop().replace(/\.jsonl$/, '');
const files = [main];
const sub = join(main.replace(/\.jsonl$/, ''), 'subagents');
if (existsSync(sub)) files.push(...readdirSync(sub).filter((f) => f.endsWith('.jsonl')).map((f) => join(sub, f)));

const byModel = {};
const skills = new Set(), agents = new Set();
let first = Infinity, last = 0;
for (const f of files) {
  const seen = new Map(); // message.id → último usage (o streaming grava a mesma mensagem várias vezes)
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.includes('"usage"')) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    const m = e.message, t = Date.parse(e.timestamp);
    if (!m?.usage || !m.model || t > until || t < since) continue;
    seen.set(m.id ?? `${t}`, { model: m.model, u: m.usage, t, agent: f !== main });
    if (f === main) for (const c of Array.isArray(m.content) ? m.content : []) {
      if (c?.type !== 'tool_use') continue;
      if (c.name === 'Skill' && c.input?.skill) skills.add(c.input.skill);
      if ((c.name === 'Agent' || c.name === 'Task') && c.input) agents.add(c.input.subagent_type ?? 'general-purpose');
    }
  }
  for (const { model, u, t, agent } of seen.values()) {
    first = Math.min(first, t); last = Math.max(last, t);
    const k = `${model}${agent ? ' (subagente)' : ''}`;
    const r = (byModel[k] ??= { model, calls: 0, in: 0, out: 0, read: 0, w5: 0, w1h: 0 });
    const cw = u.cache_creation ?? {};
    r.calls++; r.in += u.input_tokens ?? 0; r.out += u.output_tokens ?? 0; r.read += u.cache_read_input_tokens ?? 0;
    const w1h = cw.ephemeral_1h_input_tokens ?? 0;
    r.w1h += w1h; r.w5 += (u.cache_creation_input_tokens ?? 0) - w1h;
  }
}
if (first === Infinity) die(`nenhuma resposta do modelo em ${id} nesse intervalo`);
let total = 0;
const rows = Object.entries(byModel).map(([k, r]) => {
  const p = PRICE[r.model];
  const usd = p ? (r.in * p.in + r.out * p.out + r.read * p.read + r.w5 * p.in * 1.25 + r.w1h * p.in * 2) / 1e6 : NaN;
  total += usd || 0;
  return { quem: k, model: r.model, chamadas: r.calls, entrada: r.in, saida: r.out, cache_leitura: r.read, cache_escrita: r.w5 + r.w1h, usd: +(usd || 0).toFixed(2), semPreco: !p };
});
const iso = (t) => new Date(t).toISOString().replace(/\.\d+Z$/, 'Z');
const out = { sessao: id, de: iso(first), ate: iso(last), minutos: Math.round((last - first) / 60000), usd_total: +total.toFixed(2), por_modelo: rows, skills: [...skills], agentes: [...agents] };
for (const r of rows) if (r.semPreco) console.error(`⚠ sem preço para ${r.model}: contado como US$ 0 (atualize PRICE em tools/usage.mjs)`);
if (args.includes('--json')) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`${id}  ${out.de} → ${out.ate} (${out.minutos} min)  total US$ ${out.usd_total}`);
  console.table(rows.map(({ model, semPreco, ...r }) => r));
}

// ---- gravar na ficha da peça ----
if (piece) {
  const f = join(piece, 'peca.json');
  const meta = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
  const top = [...rows].sort((a, b) => b.usd - a.usd)[0];
  const round = {
    data: out.de, ate: out.ate, etapa, sessao: id, modelo: top.model,
    ...(opt('--esforco') && { esforco: opt('--esforco') }),
    chamadas: sum('chamadas'),
    tokens: { entrada: sum('entrada'), saida: sum('saida'), cacheLeitura: sum('cache_leitura'), cacheEscrita: sum('cache_escrita') },
    usd: out.usd_total, minutos: out.minutos,
    porModelo: rows.map((r) => ({ quem: r.quem, chamadas: r.chamadas, usd: r.usd })),
    ...(opt('--nota') && { nota: opt('--nota') }),
  };
  meta.custo = [...(meta.custo ?? []).filter((r) => !(r.sessao === id && r.etapa === etapa)), round].sort((a, b) => a.data.localeCompare(b.data));
  const union = (a = [], b) => [...new Set([...a, ...b])];
  const commit = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: resolve(piece), encoding: 'utf8' }).stdout?.trim();
  meta.producao = { ...meta.producao, skills: union(meta.producao?.skills, skills), agentes: union(meta.producao?.agentes, agents), ...(commit && { commit }) };
  for (const k of ['skills', 'agentes']) if (!meta.producao[k].length) delete meta.producao[k];
  meta.updatedAt = iso(Date.now());
  writeFileSync(f, `${JSON.stringify(meta, null, 2)}\n`);
  const tot = meta.custo.reduce((s, r) => s + r.usd, 0);
  console.log(`\n✔ ${f}: rodada "${etapa}" US$ ${round.usd} · total da peça US$ ${tot.toFixed(2)} (${meta.custo.length} rodada(s)). Confira com npm run validate.`);
}
