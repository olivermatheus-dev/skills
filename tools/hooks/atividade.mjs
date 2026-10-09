#!/usr/bin/env node
// Hook do Claude Code (tarefa 046 E): sessões abertas no terminal (ou no app desktop, ou à mão) entram no mesmo registro
// de atividade do app (logs/atividade/). Assim a página Agentes e o dock mostram o que o Claude está fazendo fora do app.
// Ligado em .claude/settings.json: SessionStart · UserPromptSubmit · PreToolUse · SubagentStart/Stop · Stop · SessionEnd.
// Lê o JSON do evento no stdin. Nunca escreve no stdout (no SessionStart/UserPromptSubmit isso entraria no contexto)
// e nunca falha: qualquer erro sai com 0, o Claude segue.
// Sessões abertas pelo heartbeat já estão no registro (HUB_ATIVIDADE no ambiente) e são ignoradas aqui.
import { closeSync, openSync, readFileSync, readSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as AT from '../lib/atividade.mjs';
import { passoDaFerramenta } from '../lib/claude-stream.mjs';

const ROOT = process.env.HUB_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const curto = (s, n = 70) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
const ag = (t) => (t ? `agent:${String(t).replace(/^agent:/, '')}` : null);

/** empresa da sessão: a única cadastrada, ou '*' (todas) até um caminho companies/<slug>/ aparecer */
function empresas() { try { return readdirSync(join(ROOT, 'companies'), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name); } catch { return []; } }
function slugDe(input) {
  const s = JSON.stringify(input ?? {}).replace(/\\\\/g, '/');
  const m = s.match(/companies\/([a-z0-9][a-z0-9-]*)\//);
  return m && empresas().includes(m[1]) ? m[1] : null;
}

/** 1º pedido da sessão, lido do começo do transcript (sessão que já estava aberta quando o hook entrou) */
function primeiroPedido(arq) {
  if (!arq) return null;
  try {
    const fd = openSync(arq, 'r');
    const buf = Buffer.alloc(256 * 1024);
    const n = readSync(fd, buf, 0, buf.length, 0);
    closeSync(fd);
    for (const l of buf.subarray(0, n).toString('utf8').split(/\r?\n/)) {
      if (!l.includes('"type":"user"')) continue;
      let c; try { c = JSON.parse(l).message?.content; } catch { continue; }
      const txt = typeof c === 'string' ? c : Array.isArray(c) ? c.find((x) => x.type === 'text')?.text : null;
      if (txt && !txt.trimStart().startsWith('<')) return curto(txt, 90);
    }
  } catch { /* sem transcript */ }
  return null;
}

function main(e) {
  if (process.env.HUB_ATIVIDADE) return; // já registrada pelo heartbeat
  const sid = e.session_id;
  if (!sid) return;
  const ev = e.hook_event_name;
  let a = AT.porSessao(sid);

  const abrir = (passo) => {
    const lista = empresas();
    const pedido = ev === 'UserPromptSubmit' ? null : primeiroPedido(e.transcript_path);
    a = AT.iniciar({
      slug: lista.length === 1 ? lista[0] : '*', tipo: 'ia', fonte: 'terminal', titulo: pedido ? `Terminal · ${pedido}` : 'Sessão no terminal', passo,
      agente: ag(e.agent_type) ?? 'orquestrador', pid: null, link: null, sessao: sid, origem: 'terminal', cwd: e.cwd ?? null,
    });
    AT.ligarSessao(sid, a.id);
    return a;
  };
  // o trabalho fica com a empresa que aparecer primeiro nos caminhos
  const extra = (input) => { const s = a?.slug === '*' && slugDe(input); return s ? { slug: s } : {}; };

  switch (ev) {
    case 'SessionStart': {
      if (!a) { abrir('Sessão aberta: esperando o pedido'); AT.terminar(a.id, 'feito', { resumo: 'Esperando você no terminal', visto: true }); }
      return;
    }
    case 'UserPromptSubmit': {
      const pedido = curto(e.prompt, 90);
      if (!a) abrir('Lendo o pedido');
      const titulo = a.titulo === 'Sessão no terminal' && pedido ? `Terminal · ${pedido}` : a.titulo;
      AT.reabrir(a.id, pedido ? `Pedido: ${pedido}` : 'Lendo o pedido', { titulo, agente: a.principal ?? a.agente, ...extra(e.prompt) });
      return;
    }
    case 'PreToolUse': {
      if (!a) abrir('Trabalhando');
      const p = passoDaFerramenta(e.tool_name ?? '', e.tool_input ?? {});
      if (!p) return;
      if (a.status !== 'rodando') AT.reabrir(a.id, p, extra(e.tool_input));
      else AT.passo(a.id, p, { ...(e.agent_type ? { agente: ag(e.agent_type) } : {}), ...extra(e.tool_input) });
      return;
    }
    case 'SubagentStart': {
      if (!a || !e.agent_type) return;
      AT.passo(a.id, `${String(e.agent_type)} começou`, { agente: ag(e.agent_type), principal: a.principal ?? a.agente });
      return;
    }
    case 'SubagentStop': {
      if (!a) return;
      const volta = a.principal ?? 'orquestrador';
      AT.passo(a.id, `${e.agent_type ?? 'subagente'} entregou; seguindo`, { agente: volta });
      return;
    }
    case 'Stop': {
      if (!a || a.status !== 'rodando') return;
      const msg = e.last_assistant_message ? String(e.last_assistant_message) : null;
      AT.terminar(a.id, 'feito', { resumo: msg ? curto(msg, 140) : 'Turno terminado: esperando você no terminal', final: msg, visto: true });
      return;
    }
    case 'SessionEnd': {
      if (!a) return;
      if (a.status === 'rodando') AT.terminar(a.id, 'parado', { resumo: 'Sessão fechada no meio do turno', visto: true });
      AT.marcar(a.id, { encerrada: true });
      return;
    }
    default:
  }
}

try {
  const raw = readFileSync(0, 'utf8');
  if (raw.trim()) main(JSON.parse(raw));
} catch { /* nunca atrapalha o Claude */ }
process.exit(0);
