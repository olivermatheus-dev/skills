// Roda `claude -p` com saída em stream-json e traduz cada evento em passo legível (tarefa 046 B): qual ferramenta,
// qual arquivo, qual agente (o subagente chamado pela ferramenta Agent vira o "agente" do passo). O log recebe linhas
// curtas e o texto final; quem chama recebe { status, texto, custo, turnos, ms }. Usado pelo heartbeat.
import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { basename } from 'node:path';

const curto = (s, n = 70) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
const arq = (p) => (p ? basename(String(p)) : '');

/** ferramenta → frase em português (null = não vale um passo) */
export function passoDaFerramenta(nome, input = {}) {
  switch (nome) {
    case 'Bash': return input.description ? curto(input.description) : `Rodando ${curto(input.command, 60)}`;
    case 'Read': return `Lendo ${arq(input.file_path)}`;
    case 'Write': return `Escrevendo ${arq(input.file_path)}`;
    case 'Edit': case 'MultiEdit': case 'NotebookEdit': return `Editando ${arq(input.file_path ?? input.notebook_path)}`;
    case 'Grep': return `Procurando "${curto(input.pattern, 40)}"`;
    case 'Glob': return `Procurando arquivos ${curto(input.pattern, 40)}`;
    case 'Skill': return `Usando a skill ${input.skill ?? input.command ?? ''}`.trim();
    case 'Agent': case 'Task': return `Chamou o ${input.subagent_type ?? 'subagente'}: ${curto(input.description, 50)}`;
    case 'WebFetch': return `Lendo a página ${curto(input.url, 50)}`;
    case 'WebSearch': return `Pesquisando "${curto(input.query, 50)}"`;
    case 'TodoWrite': return 'Organizando os passos';
    default: return nome.startsWith('mcp__') ? `Usando ${nome.split('__').slice(1).join(' · ')}` : `Usando ${nome}`;
  }
}

/**
 * @param {string[]} cli argumentos do claude (sem --output-format; este módulo põe)
 * @param {{ log: string, agente: string, onPasso?: (texto: string, agente: string, extra?: { sessao?: string }) => void, env?: NodeJS.ProcessEnv }} op
 */
export function rodarClaude(cli, { log, agente, onPasso = () => {}, env = process.env }) {
  const args = [...cli];
  const sep = args.indexOf('--');
  args.splice(sep < 0 ? args.length : sep, 0, '--output-format', 'stream-json', '--verbose',
    // as descrições das ferramentas viram o passo no dock do app
    '--append-system-prompt', 'O campo description de cada comando aparece para o Oliver no app como o passo em andamento: escreva-o em português, curto (até 8 palavras).');
  // Windows: o claude é um .cmd (precisa de shell) e o shell não põe aspas sozinho → cada argumento vai entre aspas
  const win = process.platform === 'win32';
  const q = (a) => (/[\s"&|<>^()*]/.test(a) ? `"${a.replace(/"/g, "'")}"` : a);
  const filho = spawn('claude', win ? args.map(q) : args, { stdio: ['ignore', 'pipe', 'pipe'], shell: win, env, windowsHide: true });

  const subagentes = new Map(); // id da chamada Agent → tipo do subagente
  let ultimo = '';
  let resto = '';
  const bruto = []; // linhas que não são JSON (erros do próprio claude, "not logged in")
  const fim = { texto: '', custo: null, turnos: null, ms: null, erro: false, sessao: null };
  const escreve = (l) => appendFileSync(log, `${l}\n`);

  const entregues = new Set(); // subagentes que já devolveram: o que chegar deles depois só vai para o log
  let aberto = false;
  const evento = (e) => {
    const quem = (e.parent_tool_use_id && subagentes.get(e.parent_tool_use_id)) || agente;
    const atrasado = e.parent_tool_use_id && entregues.has(e.parent_tool_use_id);
    if (e.type === 'system' && e.subtype === 'init') {
      if (aberto) return; // o subagente também manda init
      aberto = true; fim.sessao = e.session_id ?? null; onPasso('Claude Code aberto', agente, { sessao: e.session_id }); escreve(`  · sessão ${e.session_id ?? ''} · ${e.model ?? ''}`); return;
    }
    if (e.type === 'assistant') {
      for (const c of e.message?.content ?? []) {
        if (c.type !== 'tool_use') continue;
        if ((c.name === 'Agent' || c.name === 'Task') && c.input?.subagent_type) subagentes.set(c.id, `agent:${c.input.subagent_type}`);
        const p = passoDaFerramenta(c.name, c.input);
        if (!p || p === ultimo) continue;
        ultimo = p;
        escreve(`  · [${quem.replace(/^agent:/, '')}] ${p}`);
        if (!atrasado) onPasso(p, quem);
      }
      return;
    }
    if (e.type === 'user') {
      // resposta de um subagente: o trabalho volta para quem chamou
      for (const c of e.message?.content ?? []) if (c.type === 'tool_result' && subagentes.has(c.tool_use_id)) {
        const tipo = subagentes.get(c.tool_use_id);
        entregues.add(c.tool_use_id);
        escreve(`  · [${tipo.replace(/^agent:/, '')}] terminou`);
        onPasso(`${tipo.replace(/^agent:/, '')} entregou; seguindo`, (e.parent_tool_use_id && subagentes.get(e.parent_tool_use_id)) || agente);
      }
      return;
    }
    if (e.type === 'result') Object.assign(fim, { texto: e.result ?? '', custo: e.total_cost_usd ?? null, turnos: e.num_turns ?? null, ms: e.duration_ms ?? null, erro: !!e.is_error });
  };

  const linha = (l) => {
    if (!l.trim()) return;
    try { evento(JSON.parse(l)); } catch { bruto.push(l); escreve(l); }
  };
  filho.stdout.on('data', (d) => { resto += d; const ls = resto.split(/\r?\n/); resto = ls.pop(); ls.forEach(linha); });
  filho.stderr.on('data', (d) => { for (const l of String(d).split(/\r?\n/)) if (l.trim()) { bruto.push(l); escreve(l); } });

  return new Promise((ok) => {
    filho.on('error', (err) => { bruto.push(err.message); ok({ status: -1, ...fim, saida: bruto.join('\n') }); });
    filho.on('close', (code) => {
      if (resto) linha(resto);
      if (fim.texto) escreve(fim.texto);
      ok({ status: code ?? -1, ...fim, saida: [...bruto, fim.texto].join('\n') });
    });
  });
}
