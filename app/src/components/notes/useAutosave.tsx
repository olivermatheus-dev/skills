// Autosave com debounce: guarda o último rascunho pendente, salva em fila (uma gravação por vez)
// e permite forçar a gravação (flush) ao trocar de documento, ao sair da tela ou ao fechar a aba.
import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export function useAutosave<T>({ save, beacon, delay = 800 }: {
  /** grava de fato; o retorno é ignorado aqui (quem chama atualiza o cache) */
  save: (v: T) => Promise<unknown>;
  /** gravação "de emergência" ao fechar a aba (fetch keepalive) */
  beacon?: (v: T) => void;
  delay?: number;
}) {
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<unknown>(null);
  const pending = useRef<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const saveRef = useRef(save); saveRef.current = save;
  const beaconRef = useRef(beacon); beaconRef.current = beacon;

  const flush = useCallback((): Promise<void> => {
    clearTimeout(timer.current);
    const v = pending.current;
    pending.current = null;
    if (v === null) return chain.current;
    chain.current = chain.current.then(async () => {
      setState('saving');
      try {
        await saveRef.current(v);
        setError(null);
        setState(pending.current === null ? 'saved' : 'dirty');
      } catch (e) {
        setError(e);
        setState('error');
        pending.current ??= v; // tenta de novo na próxima edição/flush
      }
    });
    return chain.current;
  }, []);

  const schedule = useCallback((v: T) => {
    pending.current = v;
    setState('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush(); }, delay);
  }, [delay, flush]);

  /** descarta o pendente (ex.: documento apagado) */
  const cancel = useCallback(() => { clearTimeout(timer.current); pending.current = null; setState('idle'); setError(null); }, []);

  useEffect(() => {
    const onUnload = () => { if (pending.current !== null) { beaconRef.current?.(pending.current); pending.current = null; } };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
      void flush(); // saiu da tela (navegação interna): grava o que faltava
    };
  }, [flush]);

  return { state, error, schedule, flush, cancel, hasPending: () => pending.current !== null };
}

export function SaveIndicator({ state }: { state: SaveState }) {
  const map: Record<SaveState, [string, string]> = {
    idle: ['', ''],
    dirty: ['Editando…', 'text-muted'],
    saving: ['Salvando…', 'text-muted'],
    saved: ['Salvo', 'text-ok'],
    error: ['Erro ao salvar', 'text-danger'],
  };
  const [label, cls] = map[state];
  return <span className={`text-xs ${cls}`} aria-live="polite">{label}</span>;
}
