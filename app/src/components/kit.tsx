// Componentes base compartilhados por todas as telas. Mantenha simples e consistente.
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useEffect } from 'react';
import { ApiError } from '../api';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');
export { cx };

export function Button({ variant = 'primary', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'soft' }) {
  const v = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    soft: 'bg-primary-soft text-primary-ink hover:bg-primary/15',
    ghost: 'bg-transparent text-foreground hover:bg-muted border border-border',
    danger: 'bg-transparent text-destructive hover:bg-red-50 border border-border',
  }[variant];
  return <button {...p} className={cx('px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition', v, className)} />;
}
export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) =>
  <input {...p} className={cx('px-3 py-1.5 rounded-md border border-border bg-card text-sm outline-none focus:border-primary', className)} />;
export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  <textarea {...p} className={cx('px-3 py-2 rounded-md border border-border bg-card text-sm outline-none focus:border-primary w-full', className)} />;
export const Select = ({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) =>
  <select {...p} className={cx('px-2 py-1.5 rounded-md border border-border bg-card text-sm outline-none focus:border-primary', className)} />;

export const Card = ({ className, children, ...p }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) =>
  <div {...p} className={cx('bg-card border border-border rounded-xl p-4', className)}>{children}</div>;

export const Badge = ({ children, color, className }: { children: ReactNode; color?: string; className?: string }) =>
  <span className={cx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground', className)} style={color ? { background: `${color}22`, color } : undefined}>{children}</span>;

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const e = error as ApiError;
  return (
    <div className="mt-3 text-sm text-destructive bg-red-50 border border-red-200 rounded-md p-3">
      <div className="font-medium">{e.payload?.error ?? String(e.message ?? e)}</div>
      {e.payload?.file && <div className="text-xs opacity-80">{e.payload.file}</div>}
      {e.payload?.issues?.map((i) => <div key={i} className="text-xs">• {i}</div>)}
    </div>
  );
}

export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="text-center py-16 border border-dashed border-border rounded-xl">
    <div className="font-medium">{title}</div>
    {hint && <div className="text-sm text-muted-foreground mt-1">{hint}</div>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/** Painel lateral (detalhe/edição). Fecha com Esc. */
export function Drawer({ open, onClose, title, children, width = 'max-w-2xl', canClose }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string; /** devolve false para impedir o fechamento (ex.: alterações não salvas) */ canClose?: () => boolean }) {
  const tryClose = () => { if (!canClose || canClose()) onClose(); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && tryClose();
    if (open) window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={tryClose}>
      <div className={cx('h-full w-full bg-card shadow-xl overflow-y-auto', width)} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border px-6 py-3 flex items-center justify-between z-10">
          <div className="font-semibold">{title}</div>
          <button onClick={tryClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** Editor de lista de textos (dores, desejos, tags…): 1 item por linha. */
export function LinesInput({ value, onChange, placeholder, rows = 4 }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; rows?: number }) {
  return <Textarea rows={rows} placeholder={placeholder} value={value.join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} onBlur={() => onChange(value.map((x) => x.trim()).filter(Boolean))} />;
}

export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block mb-4">
    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">{label}</div>
    {children}
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </label>
);

export const fmtNum = (n?: number) => (n == null ? '—' : new Intl.NumberFormat('pt-BR', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n));
export const fmtDate = (s?: string) => (s ? new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString('pt-BR') : '—');
