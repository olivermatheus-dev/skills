// Regras do Kanban usadas pela interface (mesma semântica de tools/lib/board.mjs e da skill orquestrar).
import type { Doc, Task } from '../../api';
import { splitTaskBody, pendingAsk, type TaskComment } from '../../../../schema/task';
export { splitTaskBody, joinTaskBody, pendingAsk, nowStamp, type TaskComment, type CommentKind } from '../../../../schema/task';

export type TaskDoc = Doc<Task>;
export type Status = Task['status'];
export type BoardName = Task['board'];
export type Priority = Task['priority'];

/** hint = o que a coluna significa no fluxo com a IA (A fazer = aprovado; a IA só pega daqui). */
export const COLUMNS: { id: Status; label: string; hint: string }[] = [
  { id: 'backlog', label: 'Backlog', hint: 'Ideias e rascunhos. A IA não mexe aqui.' },
  { id: 'todo', label: 'A fazer', hint: 'Aprovado. As tarefas da IA saem daqui quando você clica em Rodar IA.' },
  { id: 'doing', label: 'Fazendo', hint: 'Em execução (por você ou pela IA).' },
  { id: 'review', label: 'Revisão', hint: 'Esperando você: conferir, responder ou aprovar.' },
  { id: 'done', label: 'Feito', hint: 'Concluído.' },
];
export const STATUS_LABEL = Object.fromEntries(COLUMNS.map((c) => [c.id, c.label])) as Record<Status, string>;

export const BOARD_OPTS: { id: BoardName; label: string }[] = [
  { id: 'conteudo', label: 'Conteúdo' },
  { id: 'vendas', label: 'Vendas' },
  { id: 'produto', label: 'Produto' },
];
export const BOARD_LABEL = Object.fromEntries(BOARD_OPTS.map((b) => [b.id, b.label])) as Record<BoardName, string>;

export const PRIORITY_OPTS: { id: Priority; label: string; color: string }[] = [
  { id: 'alta', label: 'Alta', color: 'var(--color-destructive)' },
  { id: 'media', label: 'Média', color: 'var(--color-warning)' },
  { id: 'baixa', label: 'Baixa', color: '#a1a1aa' },
];
export const PRIORITY_META = Object.fromEntries(PRIORITY_OPTS.map((p) => [p.id, p])) as Record<Priority, (typeof PRIORITY_OPTS)[number]>;

export const AGENTS = ['estrategista', 'roteirista', 'designer', 'editor-de-video', 'sound-designer', 'pesquisador', 'revisor'];
export const ASSIGNEES = ['oliver', 'ai', ...AGENTS.map((a) => `agent:${a}`)];

export type View = 'oliver' | 'ia' | 'todas';
export const VIEWS: { id: View; label: string }[] = [
  { id: 'oliver', label: 'Minha (Oliver)' },
  { id: 'ia', label: 'IA' },
  { id: 'todas', label: 'Todas' },
];

export const isAi = (a: string) => a === 'ai' || a.startsWith('agent:');
/** Visão do Oliver = tarefas dele + tudo em revisão. Visão da IA = ai e agent:*. */
export function inView(t: Task, v: View) {
  if (v === 'oliver') return t.assignee === 'oliver' || t.status === 'review';
  if (v === 'ia') return isAi(t.assignee);
  return true;
}

export function assigneeLabel(a: string) {
  if (a === 'oliver') return 'Oliver';
  if (a === 'ai') return 'IA';
  return a.replace(/^agent:/, '');
}

/** Contagem de checklist igual a tools/lib/board.mjs ("- [x]" vs "- [ ]"). */
export function checklist(body: string) {
  const done = (body.match(/- \[x\]/gi) ?? []).length;
  const all = done + (body.match(/- \[ \]/g) ?? []).length;
  return { done, all };
}

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const isLate = (t: Task) => !!t.due && t.status !== 'done' && t.due < todayIso();

export const fmtShortDate = (s: string) =>
  new Date(`${s}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

/** O editor (MDXEditor) serializa listas com "*"; o quadro (board.mjs, heartbeat) conta "- [ ]". Volta para "-". */
export const normalizeBody = (md: string) => md.replace(/^(\s*)\* (?=\S)/gm, '$1- ');

/** Comentários e pendência do card (lidos do corpo da tarefa). */
export function taskThread(body: string): { comments: TaskComment[]; pending: TaskComment | null } {
  const { comments } = splitTaskBody(body);
  return { comments, pending: pendingAsk(comments) };
}

/** Pronta para a IA = A fazer, responsável IA/agente, dependências feitas (mesma regra do heartbeat). */
export const isReady = (t: Task, byId: Map<string, TaskDoc>) =>
  t.status === 'todo' && isAi(t.assignee) && t.depends.every((d) => byId.get(d)?.data.status === 'done');

/** "2026-10-08 14:32" → "hoje 14:32" / "8 out 14:32" */
export function fmtStamp(at: string) {
  const [d, h] = at.split(' ');
  const day = d === todayIso() ? 'hoje' : fmtShortDate(d);
  return h ? `${day} ${h}` : day;
}
