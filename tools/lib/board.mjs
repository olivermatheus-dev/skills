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

// ---------- Estado e log compacto (021) ----------
// "## Estado" = primeira seção do corpo, ≤ 5 linhas: onde parou, próximo passo, o que falta do Oliver.
// Quem retoma lê o Estado (via `board.mjs pacote`), não o log inteiro.
export const ESTADO_MAX = 5;
export const LOG_MAX = 15;
const splitFm = (txt) => { const m = txt.match(/^---\n[\s\S]*?\n---\n?/); return m ? [m[0], txt.slice(m[0].length)] : ['', txt]; };

/** Texto de uma seção "## <nome>" do corpo (sem o título), ou null. */
export function getSection(body, name) {
  const re = new RegExp(String.raw`(^|\n)## ${name}\s*\n([\s\S]*?)(?=\n## |$)`, 'i');
  const m = body.replace(/\r\n/g, '\n').match(re);
  return m ? m[2].trim() : null;
}

export function setEstado(path, text) {
  const [fm, rawBody] = splitFm(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'));
  const lines = String(text).trim().replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/^(#{2,3} )/, ' $1'));
  const block = `## Estado\n${lines.map((l) => (/^\s*[-*] /.test(l) ? l : `- ${l}`)).join('\n')}\n`;
  // Vai logo depois da descrição (texto sem título no começo) e antes da 1ª seção: o Oliver vê no app sem rolar.
  const body = `\n${rawBody.replace(/(^|\n)## Estado\s*\n[\s\S]*?(?=\n## |$)/, '$1').replace(/^\n+/, '')}`;
  const at = body.search(/\n## /);
  const out = at < 0 ? `${body.trimEnd()}\n\n${block}` : `${body.slice(0, at).trimEnd()}\n\n${block}${body.slice(at)}`;
  writeFileSync(path, `${fm}${out.replace(/^\n*/, '\n').replace(/\n*$/, '\n')}`);
  return lines.length;
}

/** Junta as linhas antigas do log numa só ("resumo de N linhas: …"), mantendo as `keep` mais recentes. */
export function compactLog(path, who, resumo, keep = 5) {
  const txt = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const at = txt.search(/\n## Log\s*\n/);
  if (at < 0) return 0;
  const head = txt.slice(0, at);
  const items = txt.slice(at).split('\n').filter((l) => /^\s*- /.test(l));
  if (items.length <= keep + 1) return 0;
  const old = items.slice(0, items.length - keep);
  const line = `- ${today()} · ${who} · resumo de ${old.length} linhas antigas: ${String(resumo).trim().replace(/\s*\n\s*/g, ' ')}`;
  writeFileSync(path, `${head}\n\n## Log\n${[line, ...items.slice(-keep)].join('\n')}\n`);
  return old.length;
}
