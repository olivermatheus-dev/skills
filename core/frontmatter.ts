// Markdown com frontmatter. Dois dialetos:
// - YAML de verdade (personas, notas, ideias, concorrentes): lib `yaml`, com aspas quando precisa.
// - "simples" (tarefas do quadro): 1 chave por linha e listas inline, compatível com tools/lib/board.mjs.
import YAML from 'yaml';

const FM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseMd(txt: string): { data: Record<string, unknown>; body: string } {
  const m = txt.match(FM);
  if (!m) return { data: {}, body: txt };
  return { data: (YAML.parse(m[1]) ?? {}) as Record<string, unknown>, body: txt.slice(m[0].length) };
}

export function stringifyMd(data: Record<string, unknown>, body = ''): string {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const y = YAML.stringify(clean, { lineWidth: 0 }).trimEnd();
  return `---\n${y}\n---\n${body.startsWith('\n') ? body : `\n${body}`}`.replace(/\n*$/, '\n');
}

export function parseSimple(txt: string): { data: Record<string, unknown>; body: string } {
  const m = txt.match(FM);
  if (!m) return { data: {}, body: txt };
  const data: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) data[kv[1]] = v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean);
    else data[kv[1]] = v === '' ? null : v;
  }
  return { data, body: txt.slice(m[0].length) };
}

export function stringifySimple(data: Record<string, unknown>, body = '', order: string[] = []): string {
  const keys = [...order.filter((k) => k in data), ...Object.keys(data).filter((k) => !order.includes(k))];
  const val = (v: unknown) =>
    v == null ? '' : Array.isArray(v) ? `[${v.join(', ')}]` : String(v).replace(/\r?\n/g, ' ');
  const head = keys.map((k) => `${k}: ${val(data[k])}`.trimEnd()).join('\n');
  return `---\n${head}\n---\n${body.startsWith('\n') ? body : `\n${body}`}`.replace(/\n*$/, '\n');
}
