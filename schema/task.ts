import { z } from 'zod';
import { nullish } from './common';

// companies/<slug>/board/T-NNNN-<slug>.md — mesmo contrato de tools/lib/board.mjs (heartbeat, agentes).
// O frontmatter é "YAML simples": 1 chave por linha, listas inline [a, b]. Ler/escrever com schema/frontmatter.ts (simple*).
export const STATUS = ['backlog', 'todo', 'doing', 'review', 'done'] as const;
export const BOARDS = ['conteudo', 'vendas', 'produto'] as const;
export const PRIORITY = ['baixa', 'media', 'alta'] as const;

const list = z.union([z.array(z.string()), z.string()]).nullish()
  .transform((v) => (Array.isArray(v) ? v : v ? [v] : []));

export const Task = z.object({
  id: z.string().regex(/^T-\d{4}$/),
  title: z.string().min(1),
  board: z.enum(BOARDS),
  status: z.enum(STATUS),
  assignee: z.string().regex(/^(oliver|ai|agent:[a-z-]+)$/, 'oliver | ai | agent:<nome>'),
  priority: z.enum(PRIORITY).default('media'),
  due: nullish(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  depends: list,
  parent: nullish(z.string().regex(/^T-\d{4}$/)),
  links: list,
});
export type Task = z.infer<typeof Task>;

// ---------- Corpo da tarefa: descrição + checklist · ## Comentários · ## Log (sempre a última seção) ----------
// Comentário = bloco "### AAAA-MM-DD HH:MM · <autor>[ · revisar|pergunta]" + texto livre. Mesmo formato em tools/lib/board.mjs.
// revisar = a IA pede que o Oliver confira algo · pergunta = a IA precisa de uma resposta · nota = só registro.
export const COMMENT_KINDS = ['nota', 'revisar', 'pergunta'] as const;
export type CommentKind = (typeof COMMENT_KINDS)[number];
export interface TaskComment { at: string; who: string; kind: CommentKind; text: string }
export interface TaskBodyParts { main: string; comments: TaskComment[]; log: string[] }

const SECTION = /^## (.+?)\s*$/;
const COMMENT_HEAD = /^### (\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?) · (\S+)(?: · (\w+))?\s*$/;

export function splitTaskBody(body: string): TaskBodyParts {
  const main: string[] = [], com: string[] = [], log: string[] = [];
  let into = main;
  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    const s = line.match(SECTION);
    if (s) {
      const name = s[1].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      into = name === 'comentarios' ? com : name === 'log' ? log : main;
      if (into !== main) continue;
    }
    into.push(line);
  }
  const comments: TaskComment[] = [];
  for (const line of com) {
    const h = line.match(COMMENT_HEAD);
    if (h) comments.push({ at: h[1], who: h[2], kind: (COMMENT_KINDS as readonly string[]).includes(h[3] ?? '') ? (h[3] as CommentKind) : 'nota', text: '' });
    else if (comments.length) comments[comments.length - 1].text += `${line}\n`;
  }
  for (const c of comments) c.text = c.text.trim();
  return { main: main.join('\n').replace(/^\n+/, '').replace(/\s+$/, ''), comments, log: log.filter((l) => /^\s*- /.test(l)).map((l) => l.replace(/^\s*- /, '')) };
}

/** "## X" ou "### X" no texto do comentário quebraria as seções: vira texto com um espaço na frente. */
const safeText = (t: string) => t.trim().replace(/\r\n/g, '\n').replace(/^(#{2,3} )/gm, ' $1');
export const commentHead = (c: Pick<TaskComment, 'at' | 'who' | 'kind'>) => `### ${c.at} · ${c.who}${c.kind !== 'nota' ? ` · ${c.kind}` : ''}`;

export function joinTaskBody({ main, comments, log }: TaskBodyParts): string {
  let out = `${main.replace(/\s+$/, '')}\n`;
  if (comments.length) out += `\n## Comentários\n${comments.map((c) => `${commentHead(c)}\n${safeText(c.text)}\n`).join('\n')}`;
  out += `\n## Log\n${log.map((l) => `- ${l}`).join('\n')}${log.length ? '\n' : ''}`;
  return out.startsWith('\n') ? out : `\n${out}`;
}

export const nowStamp = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Último comentário da IA pedindo algo e sem resposta do Oliver depois dele = o card espera o Oliver. */
export const isSystem = (who: string) => who === 'heartbeat';
export function pendingAsk(comments: TaskComment[]): TaskComment | null {
  const last = comments.filter((c) => !isSystem(c.who)).at(-1);
  return last && last.who !== 'oliver' && last.kind !== 'nota' ? last : null;
}
