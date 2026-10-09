// Componentes base compartilhados por todas as telas. Mantenha simples e consistente.
import type { ButtonHTMLAttributes, ChangeEvent, InputHTMLAttributes, ReactElement, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { Children, Fragment, isValidElement, useEffect } from 'react';
import { Select as SelectRoot, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { ApiError, net } from '../api';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');
export { cx };

export function Button({ variant = 'primary', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'soft' | 'ai' | 'ai-soft' }) {
  const v = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    soft: 'bg-primary-soft text-primary-ink hover:bg-primary/15',
    // roxo = ação de IA (analisar, gerar, pedir ao Claude): o usuário reconhece pela cor
    ai: 'bg-ai text-ai-foreground hover:bg-ai-ink',
    'ai-soft': 'bg-ai-soft text-ai-ink hover:bg-ai-muted',
    ghost: 'bg-transparent text-foreground hover:bg-muted border border-border',
    danger: 'bg-transparent text-destructive hover:bg-red-50 border border-border',
  }[variant];
  return <button {...p} className={cx('px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition', v, className)} />;
}
export const Input = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) =>
  <input {...p} className={cx('px-3 py-1.5 rounded-md border border-border bg-card text-sm outline-none focus:border-primary', className)} />;
export const Textarea = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  <textarea {...p} className={cx('px-3 py-2 rounded-md border border-border bg-card text-sm outline-none focus:border-primary w-full', className)} />;
// Select do app (radix por baixo). `SelectField` recebe `options` com ícone e contador; `Select` é a forma curta com
// <option> filhos (mesma API do <select> nativo: value, onChange com e.target.value), para quem só precisa de uma lista.
export interface SelectOption { value: string; label: ReactNode; icon?: ReactNode; count?: number; disabled?: boolean; group?: string }
const VAZIO = '__vazio'; // radix não aceita item com valor ''
export function SelectField({ value, onChange, options, size = 'default', placeholder, icon, className, disabled, 'aria-label': ariaLabel, title, style }: {
  value: string; onChange?: (v: string) => void; options: SelectOption[]; size?: 'sm' | 'default'; placeholder?: ReactNode;
  /** ícone fixo do gatilho quando nenhuma opção tem o seu (ex.: CalendarDays no Período) */
  icon?: ReactNode; className?: string; disabled?: boolean; 'aria-label'?: string; title?: string; style?: React.CSSProperties;
}) {
  const cur = options.find((o) => o.value === value);
  const item = (o: SelectOption) => (
    <SelectItem key={o.value} value={o.value || VAZIO} disabled={o.disabled}>
      {o.icon && <span className="grid place-items-center shrink-0 [&_svg]:size-4">{o.icon}</span>}
      <span className="truncate">{o.label}</span>
      {o.count != null && <span className="ml-auto pl-3 text-xs tabular-nums text-muted-foreground">{o.count}</span>}
    </SelectItem>
  );
  const groups: { name?: string; items: SelectOption[] }[] = [];
  for (const o of options) {
    const g = groups[groups.length - 1];
    if (g && g.name === o.group) g.items.push(o); else groups.push({ name: o.group, items: [o] });
  }
  return (
    <SelectRoot value={value || VAZIO} onValueChange={(v) => onChange?.(v === VAZIO ? '' : v)} disabled={disabled}>
      <SelectTrigger size={size} aria-label={ariaLabel} title={title} style={style}
        className={cn('bg-card hover:bg-muted/50 border-border shadow-none font-normal focus-visible:ring-0 focus-visible:border-primary', size === 'sm' ? 'h-7 px-2 py-0 text-xs gap-1.5' : 'h-[34px] px-3 py-0', className)}>
        <SelectValue placeholder={placeholder}>
          {cur ? (
            <>
              {(cur.icon ?? icon) && <span className="grid place-items-center shrink-0 [&_svg]:size-4">{cur.icon ?? icon}</span>}
              <span className="truncate">{cur.label}</span>
            </>
          ) : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[200]">
        {groups.map((g, i) => g.name
          ? <SelectGroup key={i}><SelectLabel>{g.name}</SelectLabel>{g.items.map(item)}</SelectGroup>
          : <Fragment key={i}>{g.items.map(item)}</Fragment>)}
      </SelectContent>
    </SelectRoot>
  );
}

function optionsOf(children: ReactNode, group?: string): SelectOption[] {
  const out: SelectOption[] = [];
  Children.forEach(children, (ch) => {
    if (!isValidElement(ch)) return;
    const el = ch as ReactElement<{ value?: string | number; children?: ReactNode; label?: string; disabled?: boolean }>;
    if (el.type === Fragment) out.push(...optionsOf(el.props.children, group));
    else if (el.type === 'optgroup') out.push(...optionsOf(el.props.children, el.props.label));
    else if (el.type === 'option') {
      const text = Children.toArray(el.props.children).join('');
      out.push({ value: String(el.props.value ?? text), label: text, disabled: el.props.disabled, group });
    }
  });
  return out;
}

/** forma curta: <option> filhos, mesma API do <select> nativo (onChange recebe e.target.value) */
export function Select({ value, onChange, children, className, disabled, title, style, 'aria-label': ariaLabel }: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { 'aria-label'?: string }) {
  const emit = (v: string) => onChange?.({ target: { value: v }, currentTarget: { value: v } } as unknown as ChangeEvent<HTMLSelectElement>);
  return <SelectField value={String(value ?? '')} onChange={emit} options={optionsOf(children)} className={className} disabled={disabled} title={title} style={style} aria-label={ariaLabel} />;
}

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
  // servidor do app fora do ar (reiniciando): o aviso global "Reconectando…" já cobre; aqui só uma linha discreta
  if (net.isNetworkError(error)) return <div className="mt-3 text-sm text-muted-foreground">Sem conexão com o app. Tentando de novo…</div>;
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
export function Drawer({ open, onClose, title, children, width = 'max-w-2xl', canClose, dense }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string; /** devolve false para impedir o fechamento (ex.: alterações não salvas) */ canClose?: () => boolean; /** cabeçalho baixo e margens menores */ dense?: boolean }) {
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
        <div className={cx('sticky top-0 bg-card border-b border-border flex items-center justify-between z-10', dense ? 'px-4 py-1.5' : 'px-6 py-3')}>
          <div className={dense ? 'text-sm' : 'font-semibold'}>{title}</div>
          <button onClick={tryClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className={dense ? 'px-5 py-3' : 'p-6'}>{children}</div>
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
