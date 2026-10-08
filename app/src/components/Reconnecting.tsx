// Aviso global discreto quando o servidor do app sai do ar (reiniciando, edição na API): no lugar das caixas
// vermelhas de "Failed to fetch". Enquanto estiver fora, testa a conexão a cada 2 s; ao voltar, recarrega o
// que tinha dado erro.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { api, net } from '../api';

export function Reconnecting() {
  const offline = useSyncExternalStore(net.subscribe, net.get, net.get);
  const qc = useQueryClient();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!offline) {
      setShow(false);
      void qc.refetchQueries({ predicate: (q) => q.state.status === 'error' });
      return;
    }
    // só aparece se durar: uma falha isolada que a nova tentativa resolve não pisca na tela
    const t = setTimeout(() => setShow(true), 800);
    const ping = setInterval(() => { api.projects().catch(() => {}); }, 2000);
    return () => { clearTimeout(t); clearInterval(ping); };
  }, [offline, qc]);

  if (!show) return null;
  return (
    <div role="status" aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-md"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      Reconectando ao app…
    </div>
  );
}
