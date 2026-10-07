#!/usr/bin/env node
// Custo de uma sessão do Claude Code (com subagentes), lido dos transcripts locais.
// Uso: node tools/usage.mjs <sessionId> [--until 2026-10-07T20:40:00Z] [--json]
//   sessionId = nome do .jsonl em ~/.claude/projects/<repo>/ (não é o id local_… do app)
// Soma o `usage` de cada resposta (1 vez por message.id) por modelo e converte em US$.
// Base da tarefa 025 (custo na ficha da peça). Preços: skill claude-api (cache de 2026-09-25).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// US$ por milhão de tokens. Escrita no cache: 1,25× (5 min) e 2× (1 h) o preço de entrada.
const PRICE = {
  'claude-opus-5-5': { in: 4, out: 20, read: 0.2 },
  'claude-sonnet-5-5': { in: 2, out: 10, read: 0.2 },
  'claude-haiku-4-5': { in: 1, out: 5, read: 0.1 },
  'claude-fable-5-1': { in: 10, out: 50, read: 0.25 },
};

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const until = args.includes('--until') ? Date.parse(args[args.indexOf('--until') + 1]) : Infinity;
if (!id) { console.error('uso: node tools/usage.mjs <sessionId> [--until ISO] [--json]'); process.exit(1); }

const dir = join(homedir(), '.claude', 'projects', process.cwd().replace(/[:\\/ ]/g, '-'));
const files = [join(dir, `${id}.jsonl`)];
const sub = join(dir, id, 'subagents');
if (existsSync(sub)) files.push(...readdirSync(sub).filter((f) => f.endsWith('.jsonl')).map((f) => join(sub, f)));
if (!existsSync(files[0])) { console.error(`não achei ${files[0]}`); process.exit(1); }

const byModel = {};
let first = Infinity, last = 0;
for (const f of files) {
  const seen = new Map(); // message.id → último usage (o streaming grava a mesma mensagem várias vezes)
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.includes('"usage"')) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    const m = e.message, t = Date.parse(e.timestamp);
    if (!m?.usage || !m.model || t > until) continue;
    seen.set(m.id ?? `${t}`, { model: m.model, u: m.usage, t, agent: f !== files[0] });
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
let total = 0;
const rows = Object.entries(byModel).map(([k, r]) => {
  const p = PRICE[r.model];
  const usd = p ? (r.in * p.in + r.out * p.out + r.read * p.read + r.w5 * p.in * 1.25 + r.w1h * p.in * 2) / 1e6 : NaN;
  total += usd || 0;
  return { quem: k, chamadas: r.calls, entrada: r.in, saida: r.out, cache_leitura: r.read, cache_escrita: r.w5 + r.w1h, usd: +usd.toFixed(2) };
});
const out = { sessao: id, de: new Date(first).toISOString(), ate: new Date(last).toISOString(), minutos: Math.round((last - first) / 60000), usd_total: +total.toFixed(2), por_modelo: rows };
if (args.includes('--json')) console.log(JSON.stringify(out, null, 2));
else { console.log(`${id}  ${out.de} → ${out.ate} (${out.minutos} min)  total US$ ${out.usd_total}`); console.table(rows); }
