// Termo novo proposto pela IA (040 H): o diálogo simples de aceitar/recusar, o mesmo no painel da ficha e no relatório.
// Aceitar = 1 clique. Recusar = 1 clique até aqui, com o substituto mais provável já escolhido (o Oliver só confirma ou troca):
// as fichas que usavam o termo passam a usar o substituto, como edição dele ("você" > IA). Quem decide é o servidor, a mesma função do CLI.
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type TermoInfo, type VocabView } from '../../../api';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Button, SelectField } from '../../kit';
import { toast } from '../../toast';
import { Spinner } from '../lib';
import { fk, useFichasVocab } from './useFichas';

export const GRUPO_TERMO: Record<string, string> = {
  tipoConteudo: 'tipo de conteúdo', gatilho: 'gatilho', tipoGancho: 'tipo de gancho', canalGancho: 'canal do gancho', elemento5s: 'elemento dos 5 s', estruturaMacro: 'estrutura',
  estiloProducao: 'estilo de produção', ctaTipo: 'CTA', produtoPresenca: 'presença do produto', consciencia: 'consciência', tom: 'tom', som: 'som', risco: 'risco', autoria: 'autoria',
  formato: 'formato', tema: 'tema', angulo: 'ângulo', publico: 'público', provaTipo: 'prova', funil: 'funil',
};
/** onde o termo aceito vai morar (desenho §1.4) */
export const destinoDoTermo = (g: string) => (g === 'formato' ? 'vira um formato rascunho na galeria, com esta ficha de referência' : ['tema', 'angulo', 'publico'].includes(g) ? 'entra nas tags do projeto' : 'entra no vocabulário da análise');
export const rotuloAceitar = (g: string) => (g === 'formato' ? 'Virar formato rascunho' : 'Aceitar');
const NAO = '__nao'; // "não reetiquetar"

/** estado do termo no painel, sem chamar o servidor: a lista do vocabulário já traz os aceitos (e os formatos/tags) e os recusados */
export function estadoNoVocab(vocab: VocabView | undefined, grupo: string, valor: string): 'aceito' | 'recusado' | 'pendente' {
  if (vocab?.recusados.some((r) => r.grupo === grupo && r.valor === valor)) return 'recusado';
  if (vocab?.grupos[grupo]?.some((o) => o.id === valor)) return 'aceito';
  return 'pendente';
}

/** tudo o que muda quando um termo é decidido */
export function useDecidirTermo(slug: string, onDone?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: { grupo: string; valor: string; decisao: 'aceito' | 'recusado'; substituto?: string }) => api.decidirTermo(slug, d),
    onSuccess: (res) => {
      for (const k of [['ficha', slug], ['fichas-resumo', slug], ['fichas-vocab', slug], ['relatorio', slug], ['relatorios', slug], ['termo', slug]]) void qc.invalidateQueries({ queryKey: k });
      const bad = res.resultado.filter((r) => !r.ok);
      if (bad.length) toast.error(new Error(bad.map((r) => r.msg).join('\n')), 'Não foi possível gravar a decisão');
      else { toast.ok(res.resultado[0]?.msg.replace(/^./, (c) => c.toUpperCase()) ?? 'Decidido'); onDone?.(); }
    },
    onError: (e) => toast.error(e, 'Não foi possível gravar a decisão'),
  });
}

const plural = (n: number, a: string, b: string) => `${n} ${n === 1 ? a : b}`;

export function TermoDialog({ slug, grupo, valor, modo: modoIni, onClose }: { slug: string; grupo: string; valor: string; modo?: 'recusar'; onClose: () => void }) {
  const q = useQuery({ queryKey: ['termo', slug, grupo, valor], queryFn: () => api.termoInfo(slug, grupo, valor) });
  const vocab = useFichasVocab(slug);
  const [modo, setModo] = useState<'recusar' | undefined>(modoIni);
  const [sub, setSub] = useState<string | null>(null);
  const m = useDecidirTermo(slug, onClose);
  const info = q.data;
  const nome = (id: string) => vocab.data?.grupos[grupo]?.find((o) => o.id === id)?.nome ?? id;
  const opcoes = (vocab.data?.grupos[grupo] ?? []).filter((o) => o.id !== valor);
  const escolhido = sub ?? info?.sugestao ?? (opcoes.length ? opcoes[0].id : NAO);
  const usos = info?.usos;
  const nomeGrupo = GRUPO_TERMO[grupo] ?? grupo;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-[520px]">
        <DialogTitle className="text-base font-semibold inline-flex items-center gap-2"><Sparkles className="size-4 text-violet-600" />Termo novo: <code className="font-mono text-[15px]">{valor}</code></DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground -mt-2">A IA propôs este {nomeGrupo} porque nenhum da lista servia. Você decide se ele entra.</DialogDescription>
        {q.isLoading ? <div className="py-6 grid place-items-center"><Spinner /></div> : !info ? (
          <p className="text-sm text-muted-foreground">Nenhuma ficha propõe este termo agora: a análise que o propôs foi refeita sem ele.</p>
        ) : <>
          <div className="rounded-lg border border-dashed border-violet-300 bg-violet-50/50 dark:bg-violet-500/5 dark:border-violet-500/30 p-3 text-sm space-y-1">
            <p>{info.definicao}</p>
            {info.exemplo && <p className="text-xs text-muted-foreground">Exemplo: {info.exemplo}</p>}
            <p className="text-xs text-muted-foreground">
              Proposto em {plural(info.proponentes, 'ficha', 'fichas')}{usos && usos.fichas > 0 ? ` · usado em ${plural(usos.campos, 'campo', 'campos')} de ${plural(usos.fichas, 'ficha', 'fichas')}` : ''}.
            </p>
          </div>

          {info.estado === 'aceito' && (
            <p className="text-sm text-success-ink inline-flex items-center gap-1.5"><Check className="size-4" />
              {grupo === 'formato' && info.rascunhoCriado ? <>Já é um formato. <Link to={`/p/${slug}/formatos?formato=${valor}`} className="underline" onClick={onClose}>Abrir na galeria</Link></> : 'Este termo já foi aceito.'}
            </p>
          )}
          {info.estado === 'recusado' && <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5"><Ban className="size-4" />Recusado: a IA não propõe de novo.{usos && usos.fichas > 0 ? ' Escolha o substituto abaixo para reetiquetar as fichas que ainda o usam.' : ''}</p>}

          {(info.estado === 'pendente' && !modo) && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button disabled={m.isPending} onClick={() => m.mutate({ grupo, valor, decisao: 'aceito' })} className="inline-flex items-center gap-1.5">{m.isPending ? <Spinner /> : <Check className="size-4" />}{rotuloAceitar(grupo)}</Button>
              <Button variant="ghost" onClick={() => setModo('recusar')} className="inline-flex items-center gap-1.5"><Ban className="size-4" />Recusar…</Button>
              <p className="basis-full text-xs text-muted-foreground">Ao aceitar, {destinoDoTermo(grupo)}.</p>
            </div>
          )}

          {((modo === 'recusar' && info.estado === 'pendente') || (info.estado === 'recusado' && !!usos?.fichas)) && (
            <div className="space-y-2 pt-1">
              <label className="text-sm font-medium block">Qual {nomeGrupo} existente fica no lugar?</label>
              <SelectField aria-label="Termo que substitui" value={escolhido} className="w-full"
                options={[...opcoes.map((o) => ({ value: o.id, label: o.id === info.sugestao ? `${o.nome}  (mais provável)` : o.nome })), { value: NAO, label: 'Nenhum: deixar as fichas como estão' }]} onChange={setSub} />
              <p className="text-xs text-muted-foreground">
                {escolhido === NAO ? 'As fichas continuam com o termo recusado; ele só deixa de ser proposto.'
                  : usos?.fichas ? `${plural(usos.fichas, 'ficha passa', 'fichas passam')} a usar "${nome(escolhido)}" (${plural(usos.campos, 'campo', 'campos')}). Conta como edição sua; "voltar ao da IA" desfaz.`
                    : 'Nenhuma ficha usa este termo nos campos; ele só deixa de ser proposto.'}
              </p>
              <div className="flex gap-2">
                <Button variant="danger" disabled={m.isPending} onClick={() => m.mutate({ grupo, valor, decisao: 'recusado', substituto: escolhido === NAO ? undefined : escolhido })} className="inline-flex items-center gap-1.5">
                  {m.isPending ? <Spinner /> : <Ban className="size-4" />}{info.estado === 'recusado' ? 'Reetiquetar' : escolhido !== NAO && usos?.fichas ? `Recusar e reetiquetar ${plural(usos.fichas, 'ficha', 'fichas')}` : 'Recusar'}
                </Button>
                {info.estado === 'pendente' && !modoIni && <Button variant="ghost" onClick={() => setModo(undefined)}>Voltar</Button>}
              </div>
            </div>
          )}

        </>}
      </DialogContent>
    </Dialog>
  );
}

export type { TermoInfo };
