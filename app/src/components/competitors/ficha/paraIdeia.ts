// "Virar ideia" a partir da ficha (040, fase I): a análise inteira entra no corpo da ideia, já como ficha de pauta,
// com a ficha e o relatório de origem. Os valores de vocabulário ficam como estão (ids), que é o que as skills leem.
import type { FichaView } from '../../../api';

type Campos = FichaView['campos'];
// texto da tela vem com quebras de linha: numa linha só (com " / "), senão quebra a lista do markdown
const q = (s?: string | null) => (s ? `“${s.replace(/^["“]|["”]$/g, '').trim().replace(/\s*\n\s*/g, ' / ')}”` : '');
const join = (xs: (string | null | undefined | false)[], sep = ' · ') => xs.filter(Boolean).join(sep);

export interface IdeaExtra {
  /** markdown da análise (seção "Análise da ficha") */
  analise?: string;
  ficha?: string;
  relatorio?: string;
}

export function analiseParaIdeia(v: FichaView, comp: string, foco?: { ideia: string; formato?: string | null }): IdeaExtra {
  const c: Campos = v.campos;
  const linhas: string[] = ['## Análise da ficha', ''];
  if (foco) linhas.push(`**Adaptação escolhida:** ${foco.ideia}${foco.formato ? ` (formato: ${foco.formato})` : ''}`, '');
  const item = (rot: string, val?: string | null) => { if (val) linhas.push(`- **${rot}:** ${val}`); };
  item('Tema', join([c.tema?.texto, c.tema?.tag && `(${c.tema.tag})`], ' '));
  item('Mensagem', c.mensagem);
  item('Tipo e formato', join([c.tipoConteudo?.principal, ...(c.tipoConteudo?.secundarios ?? []), c.formato, c.estiloProducao]));
  item('Headline', c.headline?.texto ? `${q(c.headline.texto)} (${c.headline.fonte})` : null);
  item('Gancho', join([q(c.gancho?.texto), c.gancho?.tipo && `(${c.gancho.tipo})`, c.gancho?.canal && `no ${c.gancho.canal}`], ' '));
  if (c.retencao5s?.length) item('Primeiros 5 s', c.retencao5s.map((x) => `${x.t} ${x.elemento}${x.gatilho ? ` [${x.gatilho}]` : ''}`).join(' → '));
  if (c.gatilhos?.length) item('Gatilhos', c.gatilhos.map((g) => `${g.id} ${q(g.trecho)}`).join('; '));
  item('Estrutura', c.estrutura?.macro || (c.estrutura?.blocos?.length ? 'por blocos' : null));
  if (c.estrutura?.blocos?.length) c.estrutura.blocos.forEach((b) => linhas.push(`  - ${b.quando ? `${b.quando} · ` : ''}**${b.bloco}:** ${b.oque}`));
  item('CTA', join([c.cta?.tipo, q(c.cta?.texto), c.cta?.momento && `(${c.cta.momento})`], ' '));
  item('Produto', join([c.produto?.presenca, c.produto?.primeiraMencaoS != null && `aparece aos ${c.produto.primeiraMencaoS} s`, ...(c.produto?.funcionalidades ?? [])]));
  item('Público', join([...(c.publico?.quem ?? []), c.publico?.consciencia && `consciência: ${c.publico.consciencia}`]));
  item('Tom e som', join([...(c.tom ?? []), c.som]));
  item('Por que funcionou (hipótese)', c.porQue);
  if (c.adaptar?.length) { linhas.push('', '**Como adaptar (sugestões da análise):**'); c.adaptar.forEach((a, i) => linhas.push(`${i + 1}. ${a.ideia}${a.formato ? ` (${a.formato})` : ''}`)); }
  if (c.riscos?.length) { linhas.push('', '**O que não copiar:**'); c.riscos.forEach((r) => linhas.push(`- ${r.tipo}${r.trecho ? `: ${q(r.trecho)}` : ''}`)); }
  linhas.push('', join([
    `Ficha: ${v.ficha.key} (\`competitors/${comp}/fichas/\`)`,
    v.relatorio && `relatório de origem: \`competitors/${comp}/relatorios/${v.relatorio.id}.md\``,
    v.ficha.analise && `análise de ${v.ficha.analise.modelo} em ${v.ficha.analise.geradoEm.slice(0, 10)}`,
  ], ' · '), '');
  return { analise: linhas.join('\n'), ficha: v.ficha.key, relatorio: v.relatorio?.id };
}
