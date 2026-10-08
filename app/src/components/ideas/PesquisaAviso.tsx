// Aviso de fim da pesquisa de ideias (041 F3): fica no Layout e acompanha as rodadas "rodando". Quando uma termina (a pessoa
// pode ter fechado o painel e ido para outra tela), avisa com o resumo e um botão que abre Ideias filtrada pela rodada.
// Só observa: não dispara nada e não agenda nada.
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { qk, usePesquisas } from '../../queries';
import { toast } from '../toast';
import { rodadaEmTela } from './pesquisa';

export function PesquisaAviso({ slug }: { slug: string }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data } = usePesquisas(slug);
  const antes = useRef<Set<string> | null>(null);
  useEffect(() => { antes.current = null; }, [slug]);
  useEffect(() => {
    if (!data) return;
    const agora = new Set(data.rodadas.filter((r) => r.estado === 'rodando').map((r) => r.id));
    const prev = antes.current;
    antes.current = agora;
    if (!prev) return;
    for (const id of prev) {
      if (agora.has(id)) continue;
      const r = data.rodadas.find((x) => x.id === id);
      if (!r) continue;
      // o que a pessoa fez nesta sessão mudou ideias, referências e fontes: recarrega
      for (const k of [qk.ideas(slug), qk.refs(slug), qk.sources(slug), qk.pesquisa(slug, id)]) void qc.invalidateQueries({ queryKey: k });
      if (rodadaEmTela() === id) continue; // o painel aberto já mostra o fim
      if (r.estado === 'feito' && r.result) {
        const n = r.result.ideas.length;
        toast.action(`Pesquisa pronta: ${n} ${n === 1 ? 'ideia nova' : 'ideias novas'} · ${r.result.refs.length} referências`, 'Ver ideias', () => nav(`/p/${slug}/ideias?rodada=${encodeURIComponent(id)}`), 'ok');
      } else {
        toast.action('A pesquisa de ideias não terminou', 'Ver detalhes', () => nav(`/p/${slug}/ideias/pesquisas/${encodeURIComponent(id)}`), 'error');
      }
    }
  }, [data, slug, qc, nav]);
  return null;
}
