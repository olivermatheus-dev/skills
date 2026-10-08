// Relatórios por concorrente (tarefa 040, fase F): caminhos, leitura/gravação do .md, destaque, corpo legível e a conferência
// "nenhum número na leitura fora dos agregados". Sem código do app (o `npm run validate` carrega este arquivo).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Relatorio, type RelatorioLeitura } from '../../schema/relatorio';
import { parseMd, stringifyMd } from '../../core/frontmatter';
import { compDir } from './lib';

export const relatoriosDir = (slug: string, comp: string) => join(compDir(slug, comp), 'relatorios');
export const relatorioPath = (slug: string, comp: string, id: string) => join(relatoriosDir(slug, comp), `${id}.md`);
export const REL_ID_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;

export interface RelatorioDoc { data: Relatorio; body: string; file: string }

export function lerRelatorio(slug: string, comp: string, id: string): RelatorioDoc | null {
  if (!REL_ID_RE.test(id)) throw new Error(`id de relatório inválido "${id}" (AAAA-MM-DD-<rede>-<escopo>)`);
  const f = relatorioPath(slug, comp, id);
  if (!existsSync(f)) return null;
  const { data, body } = parseMd(readFileSync(f, 'utf8'));
  const r = Relatorio.safeParse(data);
  if (!r.success) throw new Error(`${f}: ${r.error.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`).join('; ')}`);
  return { data: r.data, body, file: f };
}

/** todos os relatórios do concorrente (os inválidos ficam de fora: o validate acusa), mais recente primeiro */
export function listarRelatorios(slug: string, comp: string): RelatorioDoc[] {
  const d = relatoriosDir(slug, comp);
  if (!existsSync(d)) return [];
  const out: RelatorioDoc[] = [];
  for (const f of readdirSync(d).filter((x) => x.endsWith('.md'))) {
    try { const r = lerRelatorio(slug, comp, f.replace(/\.md$/, '')); if (r) out.push(r); } catch { /* validate acusa */ }
  }
  return out.sort((a, b) => b.data.gerado.localeCompare(a.data.gerado) || b.data.id.localeCompare(a.data.id));
}

export function gravarRelatorio(slug: string, comp: string, rel: Relatorio, body = corpoRelatorio(rel)) {
  const r = Relatorio.parse(rel);
  const bad = numerosForaDosAgregados(r);
  if (bad.length) throw new Error(`a leitura cita número(s) que não estão nos agregados: ${bad.join(', ')}`);
  mkdirSync(relatoriosDir(slug, comp), { recursive: true });
  writeFileSync(relatorioPath(slug, comp, r.id), stringifyMd(r as unknown as Record<string, unknown>, body));
}

/** só o mais recente (por `gerado`) do concorrente fica em destaque; regrava os que mudaram */
export function atualizarDestaque(slug: string, comp: string) {
  const todos = listarRelatorios(slug, comp);
  todos.forEach((r, i) => {
    const quer = i === 0;
    if (r.data.emDestaque !== quer) gravarRelatorio(slug, comp, { ...r.data, emDestaque: quer });
  });
}

// ───────────────────────── números: a leitura só cita o que está nos agregados ─────────────────────────
const CHAVE_RE = /\b(instagram|tiktok|youtube|meta-ads):[A-Za-z0-9_-]+/g;
const URL_RE = /https?:\/\/\S+/g;

/** todo número que aparece nos agregados (valores e dígitos dentro de textos, como headlines) */
function numerosDe(v: unknown, out: number[] = []): number[] {
  if (typeof v === 'number' && Number.isFinite(v)) out.push(v);
  else if (typeof v === 'string') out.push(...numerosDoTexto(v.replace(CHAVE_RE, ' ').replace(URL_RE, ' ')));
  else if (Array.isArray(v)) v.forEach((x) => numerosDe(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => numerosDe(x, out));
  return out;
}

/** números escritos em pt-BR ("126.300", "2,5", "18%", "1,9 mil") */
export function numerosDoTexto(t: string): number[] {
  const out: number[] = [];
  for (const m of t.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(\s*mil\b)?/g)) {
    const inteiro = m[1].replace(/\./g, '');
    let n = Number(m[2] ? `${inteiro}.${m[2]}` : inteiro);
    if (m[3]) n *= 1000;
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

/** formas aceitas de citar um número dos agregados: arredondado (0–2 casas), em % (frações) e em "mil" */
function formas(a: number): number[] {
  const r = (x: number, k: number) => Math.round(x * 10 ** k) / 10 ** k;
  const out = [a, r(a, 0), r(a, 1), r(a, 2), Math.trunc(a)];
  if (Math.abs(a) <= 1.5) out.push(r(a * 100, 0), r(a * 100, 1), r(a * 100, 2));
  if (Math.abs(a) >= 1000) out.push(r(a / 1000, 0) * 1000, r(a / 1000, 1) * 1000);
  return out;
}

/** textos da leitura sem chaves de item, URLs e marcadores de lista */
export function textosDaLeitura(l: RelatorioLeitura): string[] {
  return [
    ...l.resumo, ...l.padroes.flatMap((p) => [p.titulo, p.texto]), ...l.copiar.flatMap((c) => [c.mecanismo, c.como]),
    ...l.evitar.map((e) => e.texto), ...l.ideias.map((i) => i.ideia), ...l.limites,
  ].map((t) => t.replace(CHAVE_RE, ' ').replace(URL_RE, ' '));
}

/** números citados na leitura que não saem dos agregados (vazio = ok) */
export function numerosForaDosAgregados(r: Pick<Relatorio, 'agregados' | 'leitura' | 'itens'>): string[] {
  if (!r.leitura) return [];
  const ok = new Set(numerosDe(r.agregados).flatMap(formas).map((x) => x.toFixed(4)));
  ok.add((r.itens.length).toFixed(4));
  const ruins = new Set<string>();
  for (const t of textosDaLeitura(r.leitura)) for (const n of numerosDoTexto(t)) if (!ok.has(n.toFixed(4))) ruins.add(String(n).replace('.', ','));
  return [...ruins];
}

// ───────────────────────── corpo legível (o app lê o frontmatter; o .md serve para ler no git) ─────────────────────────
type Ag = Record<string, unknown>;
const fx = (n: unknown, k = 1) => (typeof n === 'number' ? n.toLocaleString('pt-BR', { maximumFractionDigits: k }) : '—');
const pct = (n: unknown) => (typeof n === 'number' ? `${(n * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : '—');

export interface GrupoAg {
  valor: string; nome: string; n: number; fraca: boolean; itens: string[]; melhor: string | null; proposto?: boolean; lift: number | null;
  med: { views: number | null; xPerfil: number | null; xMercado: number | null; porSeguidor: number | null; porSeguidorMercado: number | null; engajamento: number | null; /** anúncio: a medida é o tempo no ar e as versões */ diasNoAr?: number | null; variacoes?: number | null };
}
export const DIMENSOES: { id: string; nome: string }[] = [
  { id: 'tipo', nome: 'Tipo de conteúdo' }, { id: 'formato', nome: 'Formato' }, { id: 'tipoGancho', nome: 'Tipo de gancho' },
  { id: 'estrutura', nome: 'Estrutura' }, { id: 'tema', nome: 'Tema' }, { id: 'gatilho', nome: 'Gatilho' },
  { id: 'elemento5s', nome: 'Elementos dos 5 s' }, { id: 'produto', nome: 'Produto no conteúdo' },
];

/** anúncio (040 G): dimensões do relatório; sem views, a medida é o tempo no ar */
export const DIMENSOES_ANUNCIO: { id: string; nome: string }[] = [
  { id: 'funil', nome: 'Funil' }, { id: 'tipoAnuncio', nome: 'Tipo de anúncio' }, { id: 'objetivo', nome: 'Objetivo' }, { id: 'angulo', nome: 'Ângulo' },
  { id: 'tipoGancho', nome: 'Tipo de gancho' }, { id: 'provaTipo', nome: 'Prova' }, { id: 'gatilho', nome: 'Gatilho' }, { id: 'formatoMidia', nome: 'Formato do criativo' },
];

export function corpoRelatorio(r: Relatorio): string {
  const ag = r.agregados as Ag;
  const anuncios = r.rede === 'anuncios';
  const am = (ag.amostra ?? {}) as Ag;
  const L: string[] = [`# Relatório · ${r.competitor} · ${r.rede} · ${r.escopo}`, ''];
  L.push(`Gerado em ${r.gerado.slice(0, 10)} · ${r.itens.length} item(ns) · leitura: ${r.leitura ? r.modelo : 'pendente (só os números do script)'}`, '');
  for (const a of (am.avisos as string[] | undefined) ?? []) L.push(`> ${a}`);
  L.push('');
  if (r.leitura) {
    L.push('## Em 5 linhas', ...r.leitura.resumo.map((x) => `- ${x}`), '');
  }
  if (anuncios) L.push('## Itens', '', '| anúncio | dias no ar | variações | funil | tipo | objetivo | ângulo | gancho | prova |', '|---|---|---|---|---|---|---|---|---|');
  else L.push('## Itens', '', '| item | views | × perfil | × mercado | por seguidor | engaj. | tipo | formato | gancho | estrutura |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const it of (ag.itens as Ag[] | undefined) ?? []) {
    if (anuncios) { L.push(`| [${String(it.titulo ?? it.key).slice(0, 50).replace(/\|/g, '/')}](${it.url}) | ${fx(it.diasNoAr, 0)} | ${fx(it.variacoes, 0)} | ${it.funil ?? '—'} | ${it.tipoAnuncio ?? '—'} | ${it.objetivo ?? '—'} | ${((it.angulo as string[] | undefined) ?? []).join(', ') || '—'} | ${it.tipoGancho ?? '—'} | ${it.provaTipo ?? '—'} |`); continue; }
    L.push(`| [${String(it.titulo ?? it.key).slice(0, 50).replace(/\|/g, '/')}](${it.url}) | ${fx(it.views, 0)} | ${fx(it.xPerfil, 2)} | ${fx(it.xMercado, 2)} | ${fx(it.porSeguidor, 2)} | ${pct(it.engajamento)} | ${it.tipo ?? '—'} | ${it.formato ?? '—'} | ${it.tipoGancho ?? '—'} | ${it.estrutura ?? '—'} |`);
  }
  L.push('');
  const dims = (ag.dimensoes ?? {}) as Record<string, GrupoAg[]>;
  L.push(anuncios ? '## Mix × tempo no ar (medianas)' : '## Mix × desempenho (medianas)', '');
  for (const d of anuncios ? DIMENSOES_ANUNCIO : DIMENSOES) {
    const gs = dims[d.id];
    if (!gs?.length) continue;
    if (anuncios) {
      L.push(`### ${d.nome}`, '', '| valor | n | dias no ar | variações | melhor |', '|---|---|---|---|---|');
      for (const g of gs) L.push(`| ${g.nome}${g.proposto ? ' (proposto)' : ''}${g.fraca ? ' ⚠' : ''} | ${g.n} | ${fx(g.med.diasNoAr, 0)} | ${fx(g.med.variacoes, 1)} | ${g.melhor ?? '—'} |`);
      L.push('');
      continue;
    }
    L.push(`### ${d.nome}`, '', '| valor | n | × perfil | × mercado | por seguidor | engaj. | melhor |', '|---|---|---|---|---|---|---|');
    for (const g of gs) L.push(`| ${g.nome}${g.proposto ? ' (proposto)' : ''}${g.fraca ? ' ⚠' : ''} | ${g.n} | ${fx(g.med.xPerfil, 2)} | ${fx(g.med.xMercado, 2)} | ${fx(g.med.porSeguidor, 2)} | ${pct(g.med.engajamento)} | ${g.melhor ?? '—'} |`);
    L.push('');
  }
  if (r.leitura) {
    const it = (xs: string[]) => (xs.length ? ` _(${xs.join(', ')})_` : '');
    if (r.leitura.padroes.length) L.push(am.nivel === 'padroes' ? '## Padrões' : '## Observações (amostra pequena)', ...r.leitura.padroes.map((p) => `- **${p.titulo}.** ${p.texto}${it(p.itens)}`), '');
    if (r.leitura.copiar.length) L.push('## O que copiar (o mecanismo, não a frase)', ...r.leitura.copiar.map((c) => `- **${c.mecanismo}** → ${c.como}${it(c.itens)}`), '');
    if (r.leitura.evitar.length) L.push('## O que evitar', ...r.leitura.evitar.map((e) => `- ${e.texto}${it(e.itens)}`), '');
    if (r.leitura.ideias.length) L.push('## Ideias para nós', ...r.leitura.ideias.map((i, n) => `${n + 1}. ${i.ideia}${i.formato ? ` (\`${i.formato}\`)` : ''}${it(i.itens)}`), '');
    if (r.leitura.limites.length) L.push('## Limites', ...r.leitura.limites.map((x) => `- ${x}`), '');
  }
  if (r.termosNovos.length) {
    L.push('## Termos novos propostos', '', '| grupo | termo | definição | decisão |', '|---|---|---|---|');
    for (const t of r.termosNovos) L.push(`| ${t.grupo} | \`${t.valor}\` | ${t.definicao.replace(/\|/g, '/')} | ${t.decisao ?? 'pendente'} |`);
    L.push('');
  }
  return L.join('\n');
}
