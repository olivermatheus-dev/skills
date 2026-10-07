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
  const txt = readFileSync(path, 'utf8');
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
  let txt = readFileSync(path, 'utf8');
  for (const [k, v] of Object.entries(fields)) {
    const re = new RegExp(`^${k}:.*$`, 'm');
    txt = re.test(txt) ? txt.replace(re, `${k}: ${v}`) : txt.replace(/^---\n/, `---\n${k}: ${v}\n`);
  }
  // ## Log é a última seção: a linha nova vai no fim (ordem cronológica).
  if (logLine) txt = /\n## Log\n/.test(txt) ? `${txt.trimEnd()}\n- ${logLine}\n` : `${txt.trimEnd()}\n\n## Log\n- ${logLine}\n`;
  writeFileSync(path, txt);
}

export const today = () => new Date().toISOString().slice(0, 10);
