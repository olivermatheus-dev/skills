// Estado do "Rodar IA" (lock do heartbeat) + atualização do quadro enquanto a IA trabalha.
import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { qk } from '../../queries';
import { toast } from '../toast';

export function useRunner(slug: string) {
  const qc = useQueryClient();
  const key = ['runner', slug] as const;
  const status = useQuery({
    queryKey: key, queryFn: () => api.runner(slug), enabled: !!slug,
    refetchInterval: (q) => (q.state.data?.running ? 3000 : 15000),
  });
  const running = !!status.data?.running;

  // terminou → recarrega o quadro uma última vez
  const was = useRef(running);
  useEffect(() => {
    if (was.current && !running) void qc.invalidateQueries({ queryKey: qk.tasks(slug) });
    was.current = running;
  }, [running, qc, slug]);

  const refresh = () => { void qc.invalidateQueries({ queryKey: key }); void qc.invalidateQueries({ queryKey: qk.tasks(slug) }); };
  const run = useMutation({
    mutationFn: (o: { mode: 'background' | 'terminal'; max?: number; task?: string }) => api.runAi(slug, o),
    onSuccess: (r) => { toast.ok(r.mode === 'terminal' ? 'Claude Code aberto numa janela de terminal' : 'IA rodando em segundo plano'); setTimeout(refresh, 800); },
    onError: (e) => toast.error(e, 'Não foi possível rodar a IA'),
  });
  const stop = useMutation({
    mutationFn: () => api.stopAi(slug),
    onSuccess: () => { toast.ok('Execução parada'); refresh(); },
    onError: (e) => toast.error(e, 'Não foi possível parar'),
  });
  return { status: status.data, running, run, stop };
}
