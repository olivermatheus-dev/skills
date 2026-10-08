// Avisos rápidos no canto da tela ("Salvo", erros, "Desfazer"). Sem dependência: um store simples + useSyncExternalStore.
import { useSyncExternalStore } from 'react';
import type { ApiError } from '../api';
import { cx } from './kit';

type Kind = 'ok' | 'error' | 'info';
export interface ToastItem {
  id: number; kind: Kind; message: string; error?: unknown;
  action?: { label: string; run: () => void }; duration: number;
}

let items: ToastItem[] = [];
let seq = 0;
const subs = new Set<() => void>();
const emit = () => { for (const s of subs) s(); };
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function dismiss(id: number) {
  clearTimeout(timers.get(id)); timers.delete(id);
  items = items.filter((t) => t.id !== id); emit();
}

function show(t: Omit<ToastItem, 'id' | 'duration'> & { duration?: number }) {
  const id = ++seq;
  const duration = t.duration ?? (t.kind === 'error' ? 9000 : t.action ? 7000 : 2200);
  // um "Salvo" substitui o anterior (não empilha)
  items = [...items.filter((x) => !(t.kind === 'ok' && !t.action && x.kind === 'ok' && !x.action)), { ...t, id, duration }].slice(-4);
  emit();
  timers.set(id, setTimeout(() => dismiss(id), duration));
  return id;
}

export const toast = {
  ok: (message = 'Salvo') => show({ kind: 'ok', message }),
  info: (message: string) => show({ kind: 'info', message }),
  /** erro da API: mostra arquivo e campos (422) como o ErrorBox */
  error: (error: unknown, message = 'Não foi possível salvar — a alteração foi desfeita') => show({ kind: 'error', message, error }),
  undo: (message: string, run: () => void) => show({ kind: 'info', message, action: { label: 'Desfazer', run } }),
  action: (message: string, label: string, run: () => void, kind: Kind = 'info') => show({ kind, message, action: { label, run } }),
};

/** altura do dock de atividade (046) no mesmo canto: os avisos sobem para não ficar por cima dele */
let offset = 0;
export function setToastOffset(px: number) { if (px !== offset) { offset = px; emit(); } }

export function Toaster() {
  const list = useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => items, () => items);
  const off = useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => offset, () => offset);
  if (!list.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 items-end pointer-events-none" style={off ? { bottom: 16 + off } : undefined} aria-live="polite">
      {list.map((t) => {
        const e = t.error as ApiError | undefined;
        return (
          <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'} data-toast={t.kind}
            className={cx('pointer-events-auto max-w-sm rounded-lg shadow-lg border px-3 py-2 text-sm bg-card animate-[hubToast_.12s_ease-out]',
              t.kind === 'error' ? 'border-red-200' : 'border-border')}>
            <div className="flex items-start gap-3">
              <span className={cx('mt-px', t.kind === 'ok' ? 'text-success' : t.kind === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{t.kind === 'ok' ? '✓' : t.kind === 'error' ? '!' : '•'}</span>
              <div className="min-w-0 flex-1">
                <div className={t.kind === 'error' ? 'text-destructive font-medium' : ''}>{t.message}</div>
                {e && (
                  <div className="text-xs text-destructive/90 mt-0.5">
                    <div>{e.payload?.error ?? String((e as Error).message ?? e)}</div>
                    {e.payload?.file && <div className="opacity-80 font-mono break-all">{e.payload.file}</div>}
                    {e.payload?.issues?.map((i) => <div key={i}>• {i}</div>)}
                  </div>
                )}
              </div>
              {t.action && (
                <button className="text-primary-ink font-medium hover:underline shrink-0" onClick={() => { dismiss(t.id); t.action!.run(); }}>{t.action.label}</button>
              )}
              <button className="text-muted-foreground hover:text-foreground leading-none shrink-0" aria-label="Fechar aviso" onClick={() => dismiss(t.id)}>×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
