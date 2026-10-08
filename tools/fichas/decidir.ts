// Decisão em lote dos termos novos de um relatório (tarefa 040, fase F): aceita/recusa e anota a decisão no próprio relatório.
import type { Ficha } from '../../schema/ficha';
import { readFicha } from './lib';
import { gravarRelatorio, lerRelatorio } from './relatorio-lib';
import { aceitarTermo, recusarTermo, type TermoOrigem } from './termos';

export interface Decisao { grupo: string; valor: string; decisao: 'aceito' | 'recusado'; motivo?: string; nome?: string; definicao?: string }
export interface DecisaoResultado { grupo: string; valor: string; ok: boolean; msg: string }

const agora = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');

export function decidirTermos(slug: string, comp: string, relId: string, decisoes: Decisao[]): DecisaoResultado[] {
  const doc = comp && relId ? lerRelatorio(slug, comp, relId) : null;
  if ((comp || relId) && !doc) throw new Error(`relatório ${relId} não encontrado em ${comp}`);
  const out: DecisaoResultado[] = [];
  for (const d of decisoes) {
    const t = doc?.data.termosNovos.find((x) => x.grupo === d.grupo && x.valor === d.valor);
    try {
      if (d.decisao === 'aceito') {
        const definicao = d.definicao ?? t?.definicao;
        if (!definicao) throw new Error('sem definição: aceite pelo relatório (--de <concorrente> --rodada <id>)');
        const origens: TermoOrigem[] = (t?.itens ?? []).map((k) => readFicha(slug, comp, k)).filter((f): f is Ficha => !!f).map((f) => ({
          key: f.key, url: f.url, formatoMidia: f.analise?.campos.formatoMidia, tipo: f.analise?.campos.tipoConteudo?.principal,
        }));
        const r = aceitarTermo(slug, { grupo: d.grupo, valor: d.valor, definicao, exemplo: t?.exemplo, nome: d.nome }, origens, relId);
        out.push({ grupo: d.grupo, valor: d.valor, ok: true, msg: `${r.jaExistia ? 'já existia em' : 'aceito →'} ${r.onde}` });
      } else {
        const r = recusarTermo(d, d.motivo);
        out.push({ grupo: d.grupo, valor: d.valor, ok: true, msg: r.jaRecusado ? 'já estava recusado' : 'recusado: não volta nas próximas propostas' });
      }
      if (t) { t.decisao = d.decisao; t.em = agora(); }
    } catch (e) { out.push({ grupo: d.grupo, valor: d.valor, ok: false, msg: (e as Error).message }); }
  }
  if (doc) gravarRelatorio(slug, comp, doc.data);
  return out;
}
