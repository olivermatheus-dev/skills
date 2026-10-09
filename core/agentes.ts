// Página Agentes (tarefa 046 E): a equipe (orquestrador + agentes de .claude/agents/) com o estado de cada um
// (trabalhando · acordado · dormindo), o que está fazendo, a fila do quadro, as últimas entregas e o histórico de
// trabalhos (logs/atividade/, incluindo as sessões de terminal registradas pelos hooks). Instruções permanentes
// em .claude/agent-notes/<agente>.md: ler e acrescentar pelo app. Só leitura de arquivos, sem LLM.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as AT from '../tools/lib/atividade.mjs';
import type { Atividade } from '../tools/lib/atividade.mjs';
import { listAgents, listTasks, ValidationError, ROOT } from './store';
import { readyTasks } from './runner';
import { parseSimple } from './frontmatter';

const okSlug = (s: string) => /^[a-z0-9][a-z0-9-]*$/.test(s);
const ACORDADO_H = 2; // sessão de terminal aberta (sem SessionEnd) e com notícia nas últimas 2 h = acordado
const NOTAS = (nome: string) => join(ROOT, '.claude', 'agent-notes', `${nome}.md`);

export type EstadoAgente = 'trabalhando' | 'acordado' | 'dormindo';
export interface AgenteCard {
  id: string; nome: string; descricao: string; cor: string | null; modelo: string | null; skills: string[];
  estado: EstadoAgente; atual: Atividade | null; desde: string | null; /** trabalhos rodando ao mesmo tempo (ex.: 2 sessões) */ simultaneos: number;
  fila: { id: string; title: string; status: string; pronta: boolean }[];
  ultimas: Atividade[]; semana: { trabalhos: number; custo: number };
  notas: { arquivo: string | null; itens: number };
}

const NOMES: Record<string, string> = {
  orquestrador: 'Orquestrador', estrategista: 'Estrategista', roteirista: 'Roteirista', designer: 'Designer',
  'editor-de-video': 'Editor de vídeo', 'sound-designer': 'Sound designer', revisor: 'Revisor', pesquisador: 'Pesquisador',
};
const ORDEM = ['orquestrador', 'estrategista', 'roteirista', 'designer', 'editor-de-video', 'sound-designer', 'pesquisador', 'revisor'];

/** agente do registro → id curto (agent:designer → designer; ai/null → orquestrador) */
const idDe = (a: string | null | undefined) => (!a || a === 'ai' ? 'orquestrador' : a.replace(/^agent:/, ''));
/** agentes que trabalharam num trabalho (quem abriu + quem aparece nos passos) */
const envolvidos = (a: Atividade) => new Set([idDe(a.agente), ...(a.passos ?? []).map((p) => idDe(p.agente))]);

function frontmatter(nome: string) {
  const f = join(ROOT, '.claude', 'agents', `${nome}.md`);
  try { return parseSimple(readFileSync(f, 'utf8')).data as Record<string, unknown>; } catch { return {}; }
}
const contarNotas = (txt: string) => txt.split(/\r?\n/).filter((l) => /^\s*-\s+\d{4}-\d{2}-\d{2}/.test(l)).length;

export function agentesView(slug: string) {
  if (!okSlug(slug)) throw new ValidationError('agentes', ['empresa inválida']);
  const historico = AT.listar({ slug, limite: 400 }).filter((a) => a.tipo === 'ia');
  const tarefas = listTasks(slug).map((t) => t.data);
  const prontas = new Set(readyTasks(slug).map((t) => t.id));
  const semanaDesde = Date.now() - 7 * 864e5;
  const agora = Date.now();

  const defs = [{ name: 'orquestrador', color: null as string | null, description: 'Sessão principal: recebe o pedido, divide em partes, delega aos especialistas, revisa e devolve para você.' }, ...listAgents()];
  const cards: AgenteCard[] = defs.map((d) => {
    const id = d.name;
    const meus = historico.filter((a) => envolvidos(a).has(id));
    // trabalhando = o passo atual de um trabalho rodando é deste agente
    const rodando = historico.filter((a) => a.status === 'rodando' && idDe(a.agente) === id);
    const atual: Atividade | null = rodando[0] ?? null;
    const sessao: Atividade | null = atual ? null : historico.find((a) => a.origem === 'terminal' && !a.encerrada && a.status !== 'erro' && idDe(a.principal ?? a.agente) === id
      && agora - Date.parse(a.em ?? a.fim ?? a.inicio) < ACORDADO_H * 3600e3) ?? null;
    const estado: EstadoAgente = atual ? 'trabalhando' : sessao ? 'acordado' : 'dormindo';
    const quem = id === 'orquestrador' ? ['ai'] : [`agent:${id}`];
    const fila = tarefas.filter((t) => quem.includes(t.assignee) && (t.status === 'todo' || t.status === 'doing' || t.status === 'backlog'))
      .sort((a, b) => Number(prontas.has(b.id)) - Number(prontas.has(a.id)) || ['doing', 'todo', 'backlog'].indexOf(a.status) - ['doing', 'todo', 'backlog'].indexOf(b.status))
      .map((t) => ({ id: t.id, title: t.title, status: t.status, pronta: prontas.has(t.id) }));
    const semana = meus.filter((a) => Date.parse(a.inicio) > semanaDesde);
    const fm = id === 'orquestrador' ? {} : frontmatter(id);
    const notasArq = id === 'orquestrador' ? null : NOTAS(id);
    const notasTxt = notasArq && existsSync(notasArq) ? readFileSync(notasArq, 'utf8') : '';
    return {
      id, nome: NOMES[id] ?? id, descricao: d.description.split('. ')[0].replace(/\.$/, ''), cor: d.color,
      modelo: fm.model ? String(fm.model) : null,
      skills: Array.isArray(fm.skills) ? fm.skills.map(String) : [],
      estado, atual: atual || (sessao || null), simultaneos: rodando.length, desde: atual ? atual.inicio : sessao ? sessao.inicio : null,
      fila, ultimas: meus.filter((a) => a.status !== 'rodando').slice(0, 4),
      semana: { trabalhos: semana.length, custo: semana.reduce((s, a) => s + (a.custo ?? 0), 0) },
      notas: { arquivo: notasArq ? `.claude/agent-notes/${id}.md` : 'CLAUDE.md', itens: contarNotas(notasTxt) },
    };
  }).sort((a, b) => (ORDEM.indexOf(a.id) + 1 || 99) - (ORDEM.indexOf(b.id) + 1 || 99));

  const hoje = new Date().toISOString().slice(0, 10);
  return {
    agentes: cards,
    historico,
    resumo: {
      rodando: historico.filter((a) => a.status === 'rodando').length,
      sessoes: historico.filter((a) => a.origem === 'terminal' && !a.encerrada && agora - Date.parse(a.em ?? a.fim ?? a.inicio) < ACORDADO_H * 3600e3).length,
      custoHoje: historico.filter((a) => a.inicio.slice(0, 10) === hoje).reduce((s, a) => s + (a.custo ?? 0), 0),
      custoSemana: historico.filter((a) => Date.parse(a.inicio) > semanaDesde).reduce((s, a) => s + (a.custo ?? 0), 0),
    },
  };
}

function agenteValido(nome: string) {
  if (!listAgents().some((a) => a.name === nome)) throw new ValidationError('agentes', [`agente desconhecido: ${nome}`]);
}

export function lerNotas(nome: string) {
  agenteValido(nome);
  const f = NOTAS(nome);
  return { arquivo: `.claude/agent-notes/${nome}.md`, texto: existsSync(f) ? readFileSync(f, 'utf8') : '' };
}

const CABECALHO = (nome: string) => `# Instruções permanentes do Oliver — ${nome}\n\n> Lidas pelo agente **antes de toda tarefa**. Escreva aqui preferências e correções que valem sempre. Para uma tarefa só, use o log da própria tarefa.\n> Formato: \`- AAAA-MM-DD · instrução\`. Instrução que vale para todos os agentes vai no CLAUDE.md ou no BRAND.md.\n\n`;

/** `nova` = acrescenta uma linha datada; `texto` = substitui o arquivo inteiro (editar tudo) */
export function salvarNotas(nome: string, b: { nova?: string; texto?: string }) {
  agenteValido(nome);
  const f = NOTAS(nome);
  mkdirSync(join(ROOT, '.claude', 'agent-notes'), { recursive: true });
  if (typeof b.texto === 'string') writeFileSync(f, b.texto.replace(/\r\n/g, '\n').trimEnd() + '\n');
  else {
    const nova = String(b.nova ?? '').replace(/\s+/g, ' ').trim();
    if (!nova) throw new ValidationError('agentes', ['instrução vazia']);
    const atual = existsSync(f) ? readFileSync(f, 'utf8') : CABECALHO(nome);
    writeFileSync(f, `${atual.trimEnd()}\n- ${new Date().toLocaleDateString('sv-SE')} · ${nova}\n`); // sv-SE = AAAA-MM-DD no fuso local
  }
  return lerNotas(nome);
}
