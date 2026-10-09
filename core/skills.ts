// Agentes e skills (página Agentes e skills): arquivos de cada agente e as skills que ele usa, para ver e editar pelo app.
// · Arquivos fixos do agente: definição (.claude/agents/<id>.md), instruções permanentes (.claude/agent-notes/<id>.md)
//   e o protocolo comum (.claude/skills/orquestrar/references/protocolo.md). Orquestrador = CLAUDE.md.
// · Skills: .claude/skills/<id>/ (SKILL.md + references/, scripts/…) em árvore; quem usa = `skills:` no frontmatter do agente.
// Só lê e grava arquivos de texto dentro de .claude/agents, .claude/agent-notes, .claude/skills e o CLAUDE.md. Sem LLM.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, sep, extname, dirname } from 'node:path';
import { listAgents, ValidationError, ROOT } from './store';
import { parseSimple } from './frontmatter';

const SKILLS = join(ROOT, '.claude', 'skills');
const AGENTS = join(ROOT, '.claude', 'agents');
const okId = (s: string) => /^[a-z0-9][a-z0-9-]*$/.test(s);
const TEXTO = new Set(['.md', '.mdx', '.txt', '.json', '.yml', '.yaml', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.html', '.css', '.py', '.sh', '.ps1', '.csv', '.svg', '.xml']);
const PERMITIDO = [/^\.claude\/agents\/[^/]+\.md$/, /^\.claude\/agent-notes\/[^/]+\.md$/, /^\.claude\/skills\/[a-z0-9][a-z0-9-]*\/.+/, /^CLAUDE\.md$/];
const MAX = 1_000_000;

export interface NoArquivo { nome: string; path: string; pasta: boolean; texto: boolean; filhos?: NoArquivo[] }
export interface ArquivoFixo { path: string; titulo: string; dica: string; existe: boolean }
export interface SkillResumo { id: string; nome: string; descricao: string; grupo: 'formato' | 'skill'; arquivos: number; agentes: string[]; principal: boolean }

const rel = (abs: string) => relative(ROOT, abs).split(sep).join('/');

function arvore(dir: string): NoArquivo[] {
  let nomes: string[] = [];
  try { nomes = readdirSync(dir); } catch { return []; }
  return nomes.filter((n) => !n.startsWith('.') && n !== 'node_modules' && n !== '__pycache__')
    .map((n) => {
      const abs = join(dir, n);
      const pasta = statSync(abs).isDirectory();
      return pasta ? { nome: n, path: rel(abs), pasta, texto: false, filhos: arvore(abs) } : { nome: n, path: rel(abs), pasta, texto: TEXTO.has(extname(n).toLowerCase()) };
    })
    // SKILL.md primeiro, depois pastas, depois arquivos (alfabético)
    .sort((a, b) => Number(b.nome === 'SKILL.md') - Number(a.nome === 'SKILL.md') || Number(b.pasta) - Number(a.pasta) || a.nome.localeCompare(b.nome));
}
const contar = (nos: NoArquivo[]): number => nos.reduce((s, n) => s + (n.pasta ? contar(n.filhos ?? []) : 1), 0);

function frontmatter(abs: string): Record<string, unknown> {
  try { return parseSimple(readFileSync(abs, 'utf8')).data as Record<string, unknown>; } catch { return {}; }
}
/** skills declaradas no frontmatter de cada agente (+ orquestrador → orquestrar) */
export function skillsPorAgente(): Record<string, string[]> {
  const out: Record<string, string[]> = { orquestrador: ['orquestrar'] };
  for (const a of listAgents()) {
    const fm = frontmatter(join(AGENTS, `${a.name}.md`));
    out[a.name] = Array.isArray(fm.skills) ? fm.skills.map(String) : [];
  }
  return out;
}

function resumoSkill(id: string, uso: Record<string, string[]>): SkillResumo {
  const fm = frontmatter(join(SKILLS, id, 'SKILL.md'));
  const agentes = Object.entries(uso).filter(([, s]) => s.includes(id)).map(([a]) => a);
  return {
    id, nome: String(fm.name ?? id), descricao: String(fm.description ?? '').replace(/\s+/g, ' ').trim().replace(/^(["'])([\s\S]*)\1$/, '$2'),
    grupo: id.startsWith('fmt-') ? 'formato' : 'skill', arquivos: contar(arvore(join(SKILLS, id))), agentes,
    principal: !agentes.length || agentes.includes('orquestrador'),
  };
}

export function listarSkills(): SkillResumo[] {
  const uso = skillsPorAgente();
  let ids: string[] = [];
  try { ids = readdirSync(SKILLS).filter((n) => okId(n) && statSync(join(SKILLS, n)).isDirectory()); } catch { /* sem skills */ }
  return ids.map((id) => resumoSkill(id, uso)).sort((a, b) => a.grupo.localeCompare(b.grupo) * -1 || a.id.localeCompare(b.id));
}

export function lerSkill(id: string) {
  if (!okId(id) || !existsSync(join(SKILLS, id))) throw new ValidationError('skills', [`skill desconhecida: ${id}`]);
  return { ...resumoSkill(id, skillsPorAgente()), arvore: arvore(join(SKILLS, id)) };
}

/** arquivos fixos (topo da lista) + skills ativas do agente, cada uma com a árvore de arquivos */
export function arquivosDoAgente(nome: string) {
  const orq = nome === 'orquestrador';
  if (!orq && !listAgents().some((a) => a.name === nome)) throw new ValidationError('agentes', [`agente desconhecido: ${nome}`]);
  const f = (path: string, titulo: string, dica: string): ArquivoFixo => ({ path, titulo, dica, existe: existsSync(join(ROOT, path)) });
  const fixos = orq
    ? [f('CLAUDE.md', 'Regras gerais', 'CLAUDE.md: o que a sessão principal (orquestrador) lê sempre'), f('.claude/skills/orquestrar/references/protocolo.md', 'Protocolo de tarefa', 'Como todo agente pega, executa e devolve uma tarefa')]
    : [
      f(`.claude/agents/${nome}.md`, 'Definição do agente', 'Quem é, o que faz, modelo, skills e ordem de trabalho'),
      f(`.claude/agent-notes/${nome}.md`, 'Instruções permanentes', 'Suas preferências e correções: o agente lê antes de toda tarefa'),
      f('.claude/skills/orquestrar/references/protocolo.md', 'Protocolo de tarefa', 'Comum a todos os agentes'),
    ];
  const ids = skillsPorAgente()[nome] ?? [];
  return { fixos, skills: ids.filter((id) => existsSync(join(SKILLS, id))).map((id) => lerSkill(id)) };
}

function caminho(path: string) {
  const p = String(path ?? '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (p.split('/').some((s) => s === '..' || s === '') || !PERMITIDO.some((r) => r.test(p))) throw new ValidationError('arquivo', [`fora das pastas de agentes e skills: ${p}`]);
  return { p, abs: join(ROOT, p) };
}

export function lerArquivo(path: string) {
  const { p, abs } = caminho(path);
  if (!TEXTO.has(extname(p).toLowerCase())) throw new ValidationError('arquivo', ['arquivo binário: abra pela pasta']);
  if (!existsSync(abs)) return { path: p, texto: '', existe: false, mtime: null as number | null };
  const st = statSync(abs);
  if (st.size > MAX) throw new ValidationError('arquivo', ['arquivo grande demais para o editor']);
  return { path: p, texto: readFileSync(abs, 'utf8'), existe: true, mtime: st.mtimeMs };
}

/** `mtime` = versão que a tela abriu: se o arquivo mudou no disco depois (ex.: um agente editou), não sobrescreve */
export function salvarArquivo(path: string, b: { texto?: string; mtime?: number | null }) {
  const { p, abs } = caminho(path);
  if (!TEXTO.has(extname(p).toLowerCase())) throw new ValidationError('arquivo', ['só arquivos de texto']);
  if (typeof b.texto !== 'string') throw new ValidationError('arquivo', ['texto ausente']);
  if (b.mtime != null && existsSync(abs) && Math.abs(statSync(abs).mtimeMs - b.mtime) > 1) throw new ValidationError('arquivo', ['o arquivo mudou no disco desde que você abriu: recarregue antes de salvar']);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, b.texto.replace(/\r\n/g, '\n').trimEnd() + '\n');
  return lerArquivo(p);
}

/** liga/desliga skills de um agente: reescreve só a linha `skills:` do frontmatter */
export function definirSkills(nome: string, skills: string[]) {
  if (!listAgents().some((a) => a.name === nome)) throw new ValidationError('agentes', [`agente desconhecido: ${nome}`]);
  const lista = [...new Set((skills ?? []).map(String))];
  const bad = lista.filter((s) => !okId(s) || !existsSync(join(SKILLS, s)));
  if (bad.length) throw new ValidationError('agentes', [`skill desconhecida: ${bad.join(', ')}`]);
  const abs = join(AGENTS, `${nome}.md`);
  const txt = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new ValidationError('agentes', ['agente sem frontmatter']);
  const linha = `skills: [${lista.join(', ')}]`;
  const fm = /^skills:.*$/m.test(m[1]) ? m[1].replace(/^skills:.*$/m, linha) : `${m[1]}\n${linha}`;
  writeFileSync(abs, txt.replace(m[0], `---\n${fm}\n---`));
  return arquivosDoAgente(nome);
}
