// Leitura/escrita do Kanban em arquivos (companies/<slug>/board/T-NNNN-<slug>.md).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const STATUS = ['backlog', 'todo', 'doing', 'review', 'done'];
export const BOARDS = ['conteudo', 'vendas', 'produto'];
export const PRIORITY = ['baixa', 'media', 'alta'];

export const boardDir = (slug) => join('companies', slug, 'board');

export const companies = () =>
  readdirSync('companies').filter((d) => !d.startsWith('_') && existsSync(boardDir(d)));

export function parseTask(path) {
  const txt = readFileSync(path, 'utf8').replace(/\r\n/g, '\n'); // arquivo editado no Windows (CRLF) também vale
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  const t = { path };
  if (!m) return t;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean);
    t[kv[1]] = v;
  }
  const body = txt.slice(m[0].length);
  const done = (body.match(/- \[x\]/gi) || []).length;
  const all = done + (body.match(/- \[ \]/g) || []).length;
  t.check = all ? `${done}/${all}` : '';
  return t;
}

export const listTasks = (slug) => {
  const dir = boardDir(slug);
  return readdirSync(dir).filter((f) => /^T-\d+.*\.md$/.test(f)).map((f) => ({ ...parseTask(join(dir, f)), file: f }));
};

export const nextId = (tasks) =>
  `T-${String(Math.max(0, ...tasks.map((t) => parseInt((t.id || 'T-0').slice(2), 10) || 0)) + 1).padStart(4, '0')}`;

// Troca um campo do frontmatter e acrescenta uma linha no ## Log.
export function updateTask(path, fields = {}, logLine) {
  let txt = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  for (const [k, v] of Object.entries(fields)) {
    const re = new RegExp(`^${k}:.*$`, 'm');
    txt = re.test(txt) ? txt.replace(re, `${k}: ${v}`) : txt.replace(/^---\n/, `---\n${k}: ${v}\n`);
  }
  // ## Log é a última seção: a linha nova vai no fim (ordem cronológica).
  if (logLine) txt = /\n## Log\n/.test(txt) ? `${txt.trimEnd()}\n- ${logLine}\n` : `${txt.trimEnd()}\n\n## Log\n- ${logLine}\n`;
  writeFileSync(path, txt);
}

export const today = () => new Date().toISOString().slice(0, 10);

// Comentário no card (mesmo formato de schema/task.ts): bloco "### AAAA-MM-DD HH:MM · <autor>[ · revisar|pergunta]"
// dentro de "## Comentários", logo antes do "## Log" (que segue sendo a última seção).
export const COMMENT_KINDS = ['nota', 'revisar', 'pergunta'];
export const nowStamp = (d = new Date()) => `${today()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
export function addComment(path, who, text, kind = 'nota') {
  if (!COMMENT_KINDS.includes(kind)) throw new Error(`tipo inválido: ${kind} (${COMMENT_KINDS.join(' | ')})`);
  const block = `### ${nowStamp()} · ${who}${kind !== 'nota' ? ` · ${kind}` : ''}\n${String(text).trim().replace(/\r\n/g, '\n').replace(/^(#{2,3} )/gm, ' $1')}\n`;
  let txt = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const sec = txt.match(/\n## Coment[aá]rios\s*\n/);
  if (sec) {
    // fim da seção = próximo "## " depois dela (ou fim do arquivo)
    const start = sec.index + sec[0].length;
    const next = txt.slice(start).search(/\n## /);
    const end = next < 0 ? txt.length : start + next;
    txt = `${txt.slice(0, end).trimEnd()}\n\n${block}${txt.slice(end).replace(/^\n*/, '\n')}`;
  } else if (/\n## Log\s*\n/.test(txt)) {
    txt = txt.replace(/\n## Log\s*\n/, (m) => `\n## Comentários\n${block}\n${m.replace(/^\n/, '')}`);
  } else {
    txt = `${txt.trimEnd()}\n\n## Comentários\n${block}`;
  }
  writeFileSync(path, txt);
}
