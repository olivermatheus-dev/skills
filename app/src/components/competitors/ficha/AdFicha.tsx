// Análise da IA no painel do anúncio (040 G): o mini painel da ficha de um anúncio, com o que importa de um criativo (por que roda há tanto tempo,
// headline da arte, gancho, ângulo, prova, gatilhos, o que adaptar) (o sinal de resultado mora no painel do anúncio, ao vivo).
// Reaproveita os componentes de edição do painel de conteúdo (FichaPanel): cada edição vai para `ficha.override`, como no conteúdo.
// Funil, tipo e objetivo NÃO se editam aqui: moram na seção "Classificação" do painel do anúncio e vão só para ads/marks.json (um lugar só).
import { useMemo } from 'react';
import { Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { FCtx, Campo, EditText, Gatilhos, MultiSelect, VSelect, type Ctx } from './FichaPanel';
import { useFicha, useFichasVocab } from './useFichas';
import { fmtDate } from '../../kit';
import { Spinner } from '../lib';
import type { FichaResumo } from '../../../api';

const NOME_CAMPO = { funil: 'Funil', tipo: 'Tipo', objetivo: 'Objetivo' } as const;

export function AnaliseAnuncio({ slug, compId, fichaKey, resumo }: { slug: string; compId: string; fichaKey: string; resumo?: Pick<FichaResumo, 'analisada'> }) {
  const analisada = !!resumo?.analisada;
  const fq = useFicha(slug, compId, fichaKey, analisada);
  const vocab = useFichasVocab(slug);
  const v = analisada ? fq.data : undefined;
  const ctx = useMemo<Ctx | null>(() => (v ? { slug, v, vocab: vocab.data, saving: fq.saving, edit: fq.edit, revert: fq.revert } : null), [slug, v, vocab.data, fq.saving, fq.edit, fq.revert]);

  // sem análise não há o que mostrar: o pedido (Analisar / Na fila) fica no cabeçalho do painel
  if (!analisada) return null;
  if (!v || !ctx) return <div className="py-6 grid place-items-center text-sm text-muted-foreground">{fq.isError ? 'Não foi possível abrir a ficha.' : <Spinner />}</div>;

  const f = v.ficha, a = f.analise, c = v.campos, h = f.medidas.historico;
  // o porQue é guardado como a IA escreve ("hipótese: …"); a tela tira o prefixo e o devolve ao salvar
  const porQue = c.porQue?.replace(/^hip[oó]tese:\s*/i, '');
  const correcoes = c.correcaoRegra ?? [];

  return (
    <FCtx.Provider value={ctx}>
      <div className="space-y-5">
        <Campo label={`Por que está no ar${h?.diasNoAr != null ? ` há ${h.diasNoAr} dias` : ''}`} icon={<Sparkles />} paths={['porQue']} aside={<span className="text-[11px] text-muted-foreground">hipótese da IA</span>}
          className="rounded-xl border border-ai-border bg-ai-soft/60 p-3.5">
          <div className="text-sm leading-relaxed"><EditText path="porQue" value={porQue} multiline placeholder="hipótese de por que o anúncio segue no ar"
            onSave={(x) => ctx.edit('porQue', x.trim() ? `hipótese: ${x.trim().replace(/^hip[oó]tese:\s*/i, '')}` : null)} /></div>
        </Campo>


        <div className="grid gap-5 lg:grid-cols-2">
          <Campo label={<>Headline da arte <span className="font-normal normal-case tracking-normal">· {c.headline?.fonte === 'arte' ? 'texto na imagem' : c.headline?.fonte ?? '—'}</span></>} paths={['headline.texto']}>
            <blockquote className="border-l-[3px] border-foreground/80 pl-3 text-[15px] font-semibold leading-snug"><EditText path="headline.texto" value={c.headline?.texto} placeholder="sem headline" /></blockquote>
          </Campo>
          <Campo label="Gancho" paths={['gancho.texto', 'gancho.tipo', 'gancho.canal']}>
            <blockquote className="border-l-[3px] border-primary pl-3 text-[15px] leading-snug"><EditText path="gancho.texto" value={c.gancho?.texto} placeholder="gancho não identificado" /></blockquote>
            <div className="flex flex-wrap gap-1.5 mt-2 pl-3">
              <VSelect path="gancho.tipo" grupo="tipoGancho" value={c.gancho?.tipo} vazio="tipo indefinido" />
              <VSelect path="gancho.canal" grupo="canalGancho" value={c.gancho?.canal} vazio="canal —" />
            </div>
          </Campo>
          <Campo label="Ângulo" paths={['angulo']}><MultiSelect path="angulo" grupo="angulo" values={c.angulo ?? []} max={2} /></Campo>
          <Campo label="Prova" paths={['provaTipo']}><VSelect path="provaTipo" grupo="provaTipo" value={c.provaTipo} vazio="nenhuma" /></Campo>
        </div>

        <Gatilhos c={c} />

        {correcoes.length > 0 && (
          <Campo label="Onde a IA corrigiu a regra" icon={<RefreshCw />}>
            <ul className="space-y-1.5">
              {correcoes.map((x) => (
                <li key={x.campo} className="text-sm rounded-lg border border-border px-3 py-2">
                  <b>{NOME_CAMPO[x.campo]}</b>: regra <span className="text-muted-foreground">{x.regra}</span> → IA <b>{x.ia}</b>
                  <span className="block text-xs text-muted-foreground mt-0.5">{x.motivo}</span>
                </li>
              ))}
            </ul>
          </Campo>
        )}

        {c.coerenciaLP && (
          <Campo label="Coerência com a landing page"><p className="text-sm leading-relaxed">{c.coerenciaLP}</p></Campo>
        )}

        <Campo label="Adaptar para a nossa marca" icon={<Lightbulb />} paths={['adaptar']}>
          {!(c.adaptar ?? []).length && <div className="text-sm text-muted-foreground">Sem sugestão.</div>}
          <ol className="space-y-2">
            {(c.adaptar ?? []).map((x, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <span className="size-5 shrink-0 rounded-full bg-muted text-xs font-semibold grid place-items-center mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0 text-sm space-y-1.5">
                  <EditText value={x.ideia} multiline onSave={(t) => t.trim() && ctx.edit('adaptar', (c.adaptar ?? []).map((y, j) => (j === i ? { ...y, ideia: t.trim() } : y)))} />
                  <VSelect grupo="formato" value={x.formato} vazio="sem formato" label="Formato da adaptação" onChange={(t) => ctx.edit('adaptar', (c.adaptar ?? []).map((y, j) => (j === i ? { ...y, formato: t || null } : y)))} />
                </div>
              </li>
            ))}
          </ol>
        </Campo>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
          <span>Análise de {a?.modelo} em {fmtDate(a?.geradoEm)}. Clique em qualquer valor para corrigir: o que você muda fica à parte e vale sobre a IA.</span>
          {fq.saving && <span className="inline-flex items-center gap-1"><Spinner />salvando</span>}
        </div>
      </div>
    </FCtx.Provider>
  );
}
