// Decisão dos termos novos (tarefa 040, fases F e H): aceita/recusa e, se veio de um relatório, anota a decisão nele.
// É a ÚNICA porta: o CLI (`fichas termo`), o relatório e o painel da ficha chamam esta função.
//   aceitar → grava no lugar do termo (vocabulário, tags.yml ou verbete rascunho de formato com as fichas que o propuseram como referência)
//   recusar → `recusados` (some das próximas propostas); com `substituto`, as fichas que o usavam passam a usar o substituto (core/termos.ts)
import type { Ficha } from '../../schema/ficha';
import { conferirSubstituto, conferirTermo, proponentesDoTermo, reetiquetarTermo, usosDoTermo } from '../../core/termos';
import { readFicha } from './lib';
import { gravarRelatorio, lerRelatorio } from './relatorio-lib';
import { aceitarTermo, recusarTermo, type TermoOrigem } from './termos';

export interface Decisao { grupo: string; valor: string; decisao: 'aceito' | 'recusado'; motivo?: string; nome?: string; definicao?: string; /** recusar: termo existente que fica no lugar nas fichas */ substituto?: string }
export interface DecisaoResultado { grupo: string; valor: string; ok: boolean; msg: string; /** fichas reetiquetadas ao recusar com substituto */ reetiquetadas?: number }

const agora = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** `comp` e `relId` vazios = decisão fora de um relatório (painel da ficha, CLI sem --rodada): a definição vem da ficha que propôs */
export function decidirTermos(slug: string, comp: string, relId: string, decisoes: Decisao[]): DecisaoResultado[] {
  const doc = comp && relId ? lerRelatorio(slug, comp, relId) : null;
  if ((comp || relId) && !doc) throw new Error(`relatório ${relId} não encontrado em ${comp}`);
  const out: DecisaoResultado[] = [];
  for (const d of decisoes) {
    const t = doc?.data.termosNovos.find((x) => x.grupo === d.grupo && x.valor === d.valor);
    try {
      conferirTermo(d.grupo, d.valor);
      if (d.decisao === 'aceito') {
        // quem propôs (o projeto todo): dá a definição quando não há relatório e as referências do formato rascunho
        const props = proponentesDoTermo(slug, d.grupo, d.valor);
        const definicao = d.definicao ?? t?.definicao ?? props[0]?.termo.definicao;
        if (!definicao) throw new Error('sem definição: ninguém propôs este termo (aceite pelo relatório ou informe a definição)');
        const fichas = new Map<string, Ficha>();
        for (const k of t?.itens ?? []) { const f = readFicha(slug, comp, k); if (f) fichas.set(f.key, f); }
        for (const p of props) fichas.set(p.ficha.key, p.ficha);
        const origens: TermoOrigem[] = [...fichas.values()].map((f) => ({ key: f.key, url: f.url, formatoMidia: f.analise?.campos.formatoMidia, tipo: f.analise?.campos.tipoConteudo?.principal }));
        const r = aceitarTermo(slug, { grupo: d.grupo, valor: d.valor, definicao, exemplo: t?.exemplo ?? props[0]?.termo.exemplo, nome: d.nome }, origens, relId);
        out.push({ grupo: d.grupo, valor: d.valor, ok: true, msg: `${r.jaExistia ? 'já existia em' : d.grupo === 'formato' ? 'formato rascunho criado →' : 'aceito →'} ${r.onde}` });
      } else {
        // substituto ruim (outro grupo, inexistente, o próprio termo) para ANTES de gravar a recusa
        if (d.substituto) conferirSubstituto(slug, d.grupo, d.valor, d.substituto);
        const r = recusarTermo(d, d.motivo, d.substituto);
        let msg = r.jaRecusado ? 'já estava recusado' : 'recusado: não volta nas próximas propostas';
        let reetiquetadas: number | undefined;
        if (d.substituto) {
          const re = reetiquetarTermo(slug, d.grupo, d.valor, d.substituto);
          reetiquetadas = re.fichas;
          msg += re.fichas ? `; ${plural(re.fichas, 'ficha reetiquetada', 'fichas reetiquetadas')} para ${d.substituto} (${plural(re.campos, 'campo', 'campos')})` : `; nenhuma ficha usa mais o termo`;
          if (re.puladas.length) msg += `; ${re.puladas.length} campo(s) não trocado(s): ${re.puladas.map((p) => `${p.key} ${p.path} (${p.motivo})`).join(', ')}`;
        } else {
          const u = usosDoTermo(slug, d.grupo, d.valor);
          if (u.fichas.length) msg += `; ${plural(u.fichas.length, 'ficha ainda usa', 'fichas ainda usam')} o termo (recuse de novo com um substituto para reetiquetar)`;
        }
        out.push({ grupo: d.grupo, valor: d.valor, ok: true, msg, reetiquetadas });
      }
      if (t) { t.decisao = d.decisao; t.em = agora(); }
    } catch (e) { out.push({ grupo: d.grupo, valor: d.valor, ok: false, msg: (e as Error).message }); }
  }
  if (doc) gravarRelatorio(slug, comp, doc.data);
  return out;
}
