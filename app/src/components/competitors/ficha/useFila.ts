// Fila de fichas (040 E): estado da rodada (pedidos, etapa, "analisando"), pedir em lote + Rodar agora, Parar e o fecho.
import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type FilaStatus, type PedirLote } from '../../../api';
import { toast } from '../../toast';
import type { FichaSelo } from '../Items';

export type Ultimo = NonNullable<FilaStatus['ultimo']>;

/** §5b do DESENHO: ≈ US$ 0,08 por item no Opus (equivalente na API; pela assinatura, consome a cota) */
export const CUSTO_ITEM = 0.08;
/** tempo da rodada no Claude Code. Medido em 2026-10-08 (3 rodadas de 1 TikTok: 2,7 · 8,5 · 7,4 min): ≈ 5 min fixos
 *  (abrir, subagente Haiku dos quadros, subagente Opus, validate) + ≈ 1,5 min por item (preparo + análise; os subagentes Opus vão em paralelo) */
export const estimativa = (n: number) => ({ usd: n * CUSTO_ITEM, min: Math.max(1, Math.round(5 + n * 1.5)) });
export const fmtUsd = (v: number) => `US$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function useFichasFila(slug: string, onFim?: (u: Ultimo) => void) {
  const qc = useQueryClient();
  const key = ['fichas-fila', slug] as const;
  const q = useQuery({ queryKey: key, queryFn: () => api.fichasFila(slug), enabled: !!slug, refetchInterval: (s) => (s.state.data?.running ? 3000 : 20000) });
  const running = !!q.data?.running;
  const refresh = useCallback(() => { void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: ['fichas-resumo', slug] }); }, [qc, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // terminou → recarrega fichas, marcas e feed; avisa e deixa quem chamou abrir o painel
  const was = useRef(running);
  const fimRef = useRef(onFim);
  fimRef.current = onFim;
  useEffect(() => {
    if (was.current && !running) {
      void qc.invalidateQueries();
      const u = q.data?.ultimo;
      if (u) {
        if (u.erro && !u.feitos.length) toast.error(new Error(u.erro), 'A fila de análise não terminou');
        else toast.ok(`${u.feitos.length} conteúdo(s) analisado(s)${u.restantes.length ? ` · ${u.restantes.length} ficaram na fila` : ''}`);
        fimRef.current?.(u);
      }
    }
    was.current = running;
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const pedir = useMutation({
    mutationFn: (b: PedirLote) => api.pedirFichas(slug, b),
    onSuccess: (r, b) => {
      if (b.rodar && r.rodando) toast.ok(`Análise iniciada · ${r.gravados} conteúdo(s) no Claude Code`);
      else if (r.aviso) toast.info(`Pedido gravado (${r.gravados}). ${r.aviso}`);
      else toast.ok(`${r.gravados} conteúdo(s) na fila de análise`);
      refresh(); setTimeout(refresh, 1200);
    },
    onError: (e) => toast.error(e, 'Não foi possível gravar o pedido'),
  });
  const rodar = useMutation({
    mutationFn: () => api.rodarFichas(slug),
    onSuccess: () => { toast.ok('Análise iniciada no Claude Code'); refresh(); setTimeout(refresh, 1200); },
    onError: (e) => toast.error(e, 'Não foi possível rodar a fila'),
  });
  const parar = useMutation({
    mutationFn: () => api.pararFichas(slug),
    onSuccess: () => { toast.ok('Análise parada; o que faltou voltou para a fila'); refresh(); },
    onError: (e) => toast.error(e, 'Não foi possível parar'),
  });

  /** selo do item com o estado da rodada por cima do resumo das fichas */
  const selo = useCallback((comp: string | undefined, mk: string, base: FichaSelo | undefined): FichaSelo | undefined => {
    const s = q.data;
    if (!comp || !s) return base;
    const p = s.pedidos.find((x) => x.comp === comp && x.itens.includes(mk));
    if (!p) return base && { ...base, naFila: false, analisando: false };
    const analisando = s.running && p.status === 'rodando' && (!s.analisando.length || s.analisando.includes(`${comp}|${mk}`));
    return { ...(base ?? { analisada: false, editados: 0 }), naFila: true, analisando };
  }, [q.data]);

  const naFila = (q.data?.pedidos ?? []).reduce((a, p) => a + p.itens.length, 0);
  return { status: q.data, running, naFila, selo, pedir, rodar, parar };
}
