// Termos novos propostos pela IA (tarefa 040, §1.4): aceitar grava no lugar certo, recusar tira das próximas propostas.
//   grupo do vocabulário (gatilho, tipoGancho, elemento5s…) → library/analise/vocabulario.json (status "proposto")
//   formato → library/formatos/<id>/formato.json como verbete "rascunho", com as fichas de origem como referência
//   tema · angulo · publico → companies/<slug>/tags.yml (campo grupo), preservando os comentários
//   recusar → vocabulario.json `recusados` (vale para qualquer grupo; o relatório e o prompt deixam de propor)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { VOCAB_GRUPOS, Vocabulario, type VocabGrupo } from '../../schema/vocabulario';
import { Format, CONTENT_TYPES } from '../../schema/format';
import { TagsFile } from '../../schema/project';
import { ROOT, VOCAB_FILE, loadVocab } from './lib';

export interface TermoIn { grupo: string; valor: string; definicao: string; exemplo?: string; nome?: string }
export interface TermoOrigem { key: string; url: string; formatoMidia?: string; tipo?: string }

const hoje = () => new Date().toISOString().slice(0, 10);
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
export const nomeDoTermo = (v: string) => { const t = v.replace(/-/g, ' '); return t.charAt(0).toUpperCase() + t.slice(1); };
const NICHO = ['tema', 'angulo', 'publico'] as const;

/** grava o vocabulário no mesmo formato do arquivo (um termo por linha), validado */
export function gravarVocab(v: Vocabulario) {
  const ok = Vocabulario.parse(v);
  const linha = (o: Record<string, unknown>) => `{ ${Object.entries(o).filter(([, x]) => x !== undefined && !(Array.isArray(x) && !x.length) && !(x === 'ativo')).map(([k, x]) => `${JSON.stringify(k)}: ${Array.isArray(x) ? `[${x.map((y) => JSON.stringify(y)).join(', ')}]` : JSON.stringify(x)}`).join(', ')} }`;
  const grupos = VOCAB_GRUPOS.map((g) => `    ${JSON.stringify(g)}: [\n${ok.grupos[g].map((t) => `      ${linha(t)}`).join(',\n')}\n    ]`).join(',\n');
  const rec = ok.recusados.length ? `[\n${ok.recusados.map((r) => `    ${linha(r)}`).join(',\n')}\n  ]` : '[]';
  writeFileSync(VOCAB_FILE, `{\n  "versao": ${ok.versao},\n  "atualizadoEm": ${JSON.stringify(ok.atualizadoEm)},\n  "grupos": {\n${grupos}\n  },\n  "recusados": ${rec}\n}\n`);
}

/** já existe no lugar dele? */
export function termoExiste(slug: string, grupo: string, valor: string): boolean {
  if (grupo === 'formato') return existsSync(join(ROOT, 'library', 'formatos', valor, 'formato.json'));
  if ((NICHO as readonly string[]).includes(grupo)) {
    const f = join(ROOT, 'companies', slug, 'tags.yml');
    return existsSync(f) && ((YAML.parse(readFileSync(f, 'utf8'))?.tags ?? []) as { id: string; grupo?: string }[]).some((t) => t.id === valor && t.grupo === grupo);
  }
  return !!(loadVocab().grupos as Record<string, { id: string }[]>)[grupo]?.some((t) => t.id === valor);
}

export function aceitarTermo(slug: string, t: TermoIn, origens: TermoOrigem[] = [], ref = ''): { onde: string; jaExistia: boolean } {
  if (!SLUG.test(t.valor)) throw new Error(`termo inválido "${t.valor}"`);
  if (!t.definicao?.trim()) throw new Error(`o termo ${t.valor} precisa de uma definição`);
  const nome = t.nome?.trim() || nomeDoTermo(t.valor);
  const v = loadVocab();
  const tiraRecusa = () => { const antes = v.recusados.length; v.recusados = v.recusados.filter((r) => !(r.grupo === t.grupo && r.valor === t.valor)); return antes !== v.recusados.length; };

  if (t.grupo === 'formato') {
    const dir = join(ROOT, 'library', 'formatos', t.valor);
    const file = join(dir, 'formato.json');
    if (existsSync(file)) { if (tiraRecusa()) gravarVocab(v); return { onde: `library/formatos/${t.valor}/formato.json`, jaExistia: true }; }
    const video = origens.some((o) => /reel|short|video|tiktok|youtube/.test(`${o.formatoMidia ?? ''} ${o.key}`));
    const tipos = [...new Set(origens.map((o) => o.tipo).filter((x): x is (typeof CONTENT_TYPES)[number] => (CONTENT_TYPES as readonly string[]).includes(x ?? '')))];
    const f = Format.parse({
      id: t.valor, nome, status: 'rascunho', midia: video ? 'video' : 'imagem', essencia: t.definicao.trim(), tipos,
      observacoes: `Proposto pela análise de concorrentes (tarefa 040)${ref ? `, aceito no relatório ${ref}` : ''}.${t.exemplo ? ` Exemplo: ${t.exemplo}` : ''}`,
      referencias: origens.map((o) => ({ url: o.url, observacao: `ficha ${o.key}`, adicionadoEm: hoje() })),
      updatedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    });
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, `${JSON.stringify(f, null, 2)}\n`);
    if (tiraRecusa()) gravarVocab(v);
    return { onde: `library/formatos/${t.valor}/formato.json`, jaExistia: false };
  }

  if ((NICHO as readonly string[]).includes(t.grupo)) {
    const file = join(ROOT, 'companies', slug, 'tags.yml');
    const doc = YAML.parseDocument(existsSync(file) ? readFileSync(file, 'utf8') : 'tags: []\n');
    const atuais = (TagsFile.parse(doc.toJS() ?? {}).tags);
    const onde = `companies/${slug}/tags.yml`;
    if (atuais.some((x) => x.id === t.valor && x.grupo === t.grupo)) { if (tiraRecusa()) gravarVocab(v); return { onde, jaExistia: true }; }
    if (atuais.some((x) => x.id === t.valor)) throw new Error(`já existe uma tag "${t.valor}" em outro grupo no tags.yml`);
    const cor = atuais.find((x) => x.grupo === t.grupo)?.color ?? '#888888';
    const node = doc.createNode({ id: t.valor, label: nome, color: cor, grupo: t.grupo, definicao: t.definicao.trim() });
    (node as unknown as { flow: boolean }).flow = true;
    const seq = doc.get('tags') as YAML.YAMLSeq | undefined;
    if (seq && YAML.isSeq(seq)) {
      // entra logo depois da última tag do mesmo grupo (o arquivo é organizado por grupo)
      const idx = seq.items.map((it) => (YAML.isMap(it) ? it.get('grupo') : undefined)).lastIndexOf(t.grupo);
      if (idx >= 0) seq.items.splice(idx + 1, 0, node as never); else seq.items.push(node as never);
    } else doc.set('tags', doc.createNode([{ id: t.valor, label: nome, color: cor, grupo: t.grupo, definicao: t.definicao.trim() }]));
    TagsFile.parse(doc.toJS());
    writeFileSync(file, doc.toString({ lineWidth: 0 }));
    if (tiraRecusa()) gravarVocab(v);
    return { onde, jaExistia: false };
  }

  if (!(VOCAB_GRUPOS as readonly string[]).includes(t.grupo)) throw new Error(`grupo "${t.grupo}" não existe no vocabulário`);
  const lista = v.grupos[t.grupo as VocabGrupo];
  const onde = `library/analise/vocabulario.json (${t.grupo})`;
  if (lista.some((x) => x.id === t.valor)) { if (tiraRecusa()) gravarVocab(v); return { onde, jaExistia: true }; }
  lista.push({ id: t.valor, nome, definicao: t.definicao.trim(), sinais: [], ...(t.exemplo ? { exemplo: t.exemplo } : {}), status: 'proposto' });
  tiraRecusa();
  v.versao += 1;
  v.atualizadoEm = hoje();
  gravarVocab(v);
  return { onde, jaExistia: false };
}

/** recusa: o termo some das próximas propostas (relatório e prompt). `substituto` = o termo existente que ficou no lugar (o prompt manda a IA usá-lo) */
export function recusarTermo(t: { grupo: string; valor: string }, motivo?: string, substituto?: string) {
  const v = loadVocab();
  const ja = v.recusados.find((r) => r.grupo === t.grupo && r.valor === t.valor);
  if (ja) {
    if (substituto && ja.substituto !== substituto) { ja.substituto = substituto; gravarVocab(v); }
    return { jaRecusado: true };
  }
  v.recusados.push({ grupo: t.grupo, valor: t.valor, ...(motivo?.trim() ? { motivo: motivo.trim() } : {}), ...(substituto ? { substituto } : {}), em: hoje() });
  gravarVocab(v);
  return { jaRecusado: false };
}
