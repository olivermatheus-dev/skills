// Coleta como trabalho (046 C): a tela pergunta ao registro de atividade se já há uma coleta rodando para o que ela mostra
// (Puxar, anúncios, site, Reclame Aqui), para mostrar "puxando…" mesmo depois de sair e voltar ou se o clique foi em outra tela.
// Usa a mesma consulta do dock (['atividade', slug]): sem requisição a mais.
import { useQuery } from '@tanstack/react-query';
import { api, type Atividade } from '../../api';

/** fonte = 'coleta' | 'anuncios' | 'site' | 'reclameaqui'; ref = id do concorrente */
export function useColetas(slug: string) {
  const { data } = useQuery({
    queryKey: ['atividade', slug], queryFn: () => api.atividade(slug), enabled: !!slug,
    refetchInterval: (q) => (q.state.data?.dock.some((a) => a.status === 'rodando') ? 2000 : 6000),
  });
  const rodando = (data?.dock ?? []).filter((a) => a.status === 'rodando' && a.tipo === 'coleta');
  return (fonte: string, ref?: string | null): Atividade | undefined => rodando.find((a) => a.fonte === fonte && (ref === undefined || a.ref === ref));
}

export const segundosDesde = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000)) : 0);
