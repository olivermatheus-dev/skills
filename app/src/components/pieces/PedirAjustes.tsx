// "Pedir ajustes ao Claude" (046 D) nas abas Edição do vídeo, Slides e Roteiro: manda as anotações abertas da aba para o
// agente da vez (editor de vídeo, designer, roteirista) pelo mesmo caminho do Rodar IA. Enquanto roda, as anotações
// enviadas mostram "em ajuste" (contexto lido pelo CommentCard) e a peça recarrega para as respostas da IA aparecerem.
import { createContext, useContext, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, avisoFila, type ReviewComment } from '../../api';
import { qk } from '../../queries';
import { toast } from '../toast';
import { PedidoStatus, PedirIa, usePedidoIa } from '../atividade/PedidoIa';

export type AbaAjuste = 'video' | 'slides' | 'roteiro';
const AGENTE: Record<AbaAjuste, string> = { video: 'o editor de vídeo', slides: 'o designer', roteiro: 'o roteirista' };
const DEPOIS: Record<AbaAjuste, string> = {
  video: 'corrige na composição, renderiza uma versão nova (sem sobrescrever) e responde em cada anotação',
  slides: 'corrige na fonte, reexporta os PNG e responde em cada anotação',
  roteiro: 'ajusta o texto (sem mudar o sentido) e responde em cada anotação',
};
export const abaDe = (c: ReviewComment): AbaAjuste => (c.anchor.kind === 'roteiro' ? 'roteiro' : c.anchor.kind === 'slide' ? 'slides' : 'video');

/** ids das anotações que o Claude está ajustando agora (o CommentCard mostra "em ajuste") */
const EmAjuste = createContext<Set<string>>(new Set());
export const useEmAjuste = () => useContext(EmAjuste);

export function AjustesProvider({ slug, path, children }: { slug: string; path: string; children: ReactNode }) {
  const { pedido, rodando } = useAjustes(slug, path);
  const ids = rodando && pedido ? new Set<string>((pedido.extra.ids as string[]) ?? []) : new Set<string>();
  return <EmAjuste.Provider value={ids}>{children}</EmAjuste.Provider>;
}

function useAjustes(slug: string, path: string) {
  const qc = useQueryClient();
  const recarregar = () => { void qc.invalidateQueries({ queryKey: qk.piece(slug, path) }); void qc.invalidateQueries({ queryKey: qk.pieces(slug) }); };
  return usePedidoIa(slug, `peca:${path}`, {
    enquantoRoda: recarregar,
    aoTerminar: (p) => { recarregar(); if (p.status === 'feito') toast.ok(p.resumo ?? 'Ajustes prontos'); },
  });
}

/** barra acima da aba: N abertas · Pedir ajustes ao Claude, ou o andamento / resultado do último pedido */
export function PedirAjustesBar({ slug, path, aba, comments }: { slug: string; path: string; aba: AbaAjuste; comments: ReviewComment[] }) {
  const { pedido, rodando, atualizar } = useAjustes(slug, path);
  const abertas = comments.filter((c) => c.status === 'aberto' && c.tipo !== 'ok' && abaDe(c) === aba);
  const daAba = pedido?.extra.aba === aba;
  if (!abertas.length && !(pedido && daAba)) return null;
  return (
    <div className="mb-4 flex items-center gap-3 flex-wrap">
      {rodando ? <PedidoStatus slug={slug} pedido={pedido} className="flex-1 min-w-0" /> : (
        <>
          {abertas.length > 0 && (
            <PedirIa
              trigger={<Button size="sm" variant="ai" className="gap-1.5"><Sparkles />Pedir ajustes ao Claude<span className="ml-0.5 rounded-full bg-black/10 px-1.5 text-[11px] tabular-nums">{abertas.length}</span></Button>}
              titulo={`Pedir ajustes: ${abertas.length} anotação(ões)`}
              descricao={<>Vai para {AGENTE[aba]}, que {DEPOIS[aba]}. O que precisar de decisão sua volta como pergunta na anotação. Anotações “ok” ficam de fora.</>}
              placeholder="Algo a mais para esta rodada? (opcional)"
              align="start"
              onRodar={async (modo, instrucoes) => {
                const r = await api.pedirAjustes(slug, path, { aba, modo, instrucoes });
                toast.ok(modo === 'terminal' ? 'Claude Code aberto num terminal' : avisoFila(r.fila, `Claude ajustando ${r.ids.length} anotação(ões)`));
                atualizar();
              }}
            >
              <ul className="max-h-40 overflow-y-auto px-4 pt-2 space-y-1 text-xs">
                {abertas.map((c) => <li key={c.id} className="truncate"><span className="font-mono text-muted-foreground mr-1.5">{c.id}</span>{c.text}</li>)}
              </ul>
            </PedirIa>
          )}
          {pedido && daAba && <PedidoStatus slug={slug} pedido={pedido} className="min-w-0" />}
        </>
      )}
    </div>
  );
}
