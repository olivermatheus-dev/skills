// Peças compartilhadas da frente Concorrentes: ícones de plataforma, imagens com fallback, cálculos de ranking.
import { useEffect, useState, type ReactNode } from 'react';
import type { ItemMark, Snapshot, SnapshotEntry } from "../../api";
import { cx, fmtNum } from '../ui';
export { keyFor, itemKey } from '../../../../tools/intel/keys';

type Item = Snapshot['items'][number];

// ---------- plataformas ----------
export const PLATFORMS: Record<string, { label: string; color: string }> = {
  youtube: { label: 'YouTube', color: '#ff0033' },
  instagram: { label: 'Instagram', color: '#d62976' },
  tiktok: { label: 'TikTok', color: '#111111' },
  site: { label: 'Site', color: '#64748b' },
  facebook: { label: 'Facebook', color: '#1877f2' },
  linkedin: { label: 'LinkedIn', color: '#0a66c2' },
  x: { label: 'X', color: '#111111' },
  outro: { label: 'Outro', color: '#71717a' },
};
export const platformLabel = (p: string) => PLATFORMS[p]?.label ?? p;

export function PlatformIcon({ platform, size = 16, className, mono }: { platform: string; size?: number; className?: string; mono?: boolean }) {
  const c = mono ? 'currentColor' : PLATFORMS[platform]?.color ?? '#71717a';
  const common = { width: size, height: size, viewBox: '0 0 24 24', className: cx('shrink-0', className), 'aria-label': platformLabel(platform), role: 'img' as const };
  switch (platform) {
    case 'youtube':
      return <svg {...common}><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill={c} /><path d="M10 8.8v6.4l5.6-3.2z" fill="#fff" /></svg>;
    case 'instagram':
      return <svg {...common} fill="none" stroke={c} strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="0.6" fill={c} /></svg>;
    case 'tiktok':
      return <svg {...common}><path fill={c} d="M16.7 2.5h-3.3v12.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V8.9a6.3 6.3 0 1 0 5.3 6.2V8.7a7.9 7.9 0 0 0 4.4 1.3V6.7a4.5 4.5 0 0 1-4.4-4.2z" /></svg>;
    case 'site':
      return <svg {...common} fill="none" stroke={c} strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z" /></svg>;
    default: {
      const t = { facebook: 'f', linkedin: 'in', x: '𝕏' }[platform] ?? '•';
      return <svg {...common}><rect x="2" y="2" width="20" height="20" rx="5" fill={c} /><text x="12" y="16.5" textAnchor="middle" fontSize={t.length > 1 ? 11 : 13} fontWeight="700" fill="#fff" fontFamily="system-ui">{t}</text></svg>;
    }
  }
}

export const KINDS = { concorrente: 'Concorrente', referencia: 'Referência', criador: 'Criador', pagina: 'Página' } as const;
export const KIND_COLOR: Record<string, string> = { concorrente: '#dc2626', referencia: '#4f46e5', criador: '#0d9488', pagina: '#d97706' };
export const STATUS_LABEL: Record<ItemMark['status'], string> = { nova: 'Nova', marcada: 'Marcada', analisada: 'Analisada', descartada: 'Descartada' };
export const STATUS_COLOR: Record<ItemMark['status'], string> = { nova: '#71717a', marcada: '#4f46e5', analisada: '#16a34a', descartada: '#a1a1aa' };
export const TYPE_LABEL: Record<string, string> = { video: 'Vídeo', short: 'Short', reel: 'Reel', post: 'Post', carrossel: 'Carrossel', live: 'Live', outro: 'Outro' };

/** séries do gráfico: ordem fixa (paleta categórica validada do skill de dataviz) */
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];

// ---------- formatos ----------
export function fmtDelta(n?: number) {
  if (n == null || n === 0) return null;
  return `${n > 0 ? '+' : '−'}${fmtNum(Math.abs(n))}`;
}
export function timeAgo(iso?: string) {
  if (!iso) return '—';
  const d = (Date.now() - new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).getTime()) / 86400_000;
  if (d < 1 / 24) return 'agora há pouco';
  if (d < 1) return `há ${Math.round(d * 24)} h`;
  if (d < 14) return `há ${Math.round(d)} d`;
  if (d < 60) return `há ${Math.round(d / 7)} sem`;
  if (d < 365) return `há ${Math.round(d / 30)} meses`;
  return `há ${(d / 365).toFixed(1).replace('.', ',')} anos`;
}
export const fmtDur = (s?: number) => {
  if (s == null) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.round(s % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};
export const fmtRatio = (r?: number) => (r == null ? '—' : `${r.toLocaleString('pt-BR', { maximumFractionDigits: r >= 10 ? 0 : 1, minimumFractionDigits: r >= 10 ? 0 : 1 })}×`);
export const fmtPct = (r?: number) => (r == null ? '—' : `${(r * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`);
export const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

export function median(xs: number[]) {
  const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q);
  if (!a.length) return undefined;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// ---------- coletas ----------
export interface ProfileSeries { key: string; all: SnapshotEntry[]; latest?: SnapshotEntry; prev?: SnapshotEntry }
export function groupSnapshots(snaps: SnapshotEntry[]): Map<string, ProfileSeries> {
  const m = new Map<string, ProfileSeries>();
  for (const s of [...snaps].sort((a, b) => a.data.collectedAt.localeCompare(b.data.collectedAt))) {
    const g = m.get(s.key) ?? { key: s.key, all: [] };
    g.all.push(s);
    m.set(s.key, g);
  }
  for (const g of m.values()) { g.latest = g.all.at(-1); g.prev = g.all.at(-2); }
  return m;
}

export interface Row {
  /** chave da marcação `<platform>:<id>` */
  mk: string;
  profileKey: string;
  platform: string;
  item: Item;
  outlier?: number;
  outlierBasis: 'views' | 'likes';
  engagement?: number;
  viewsDelta?: number;
  prevAt?: string;
  history: { at: string; views?: number; likes?: number }[];
  mark?: ItemMark;
}

/** outlier = views ÷ mediana de views dos itens do mesmo perfil na última coleta (sem views → curtidas ÷ mediana de curtidas) */
export function buildRows(series: ProfileSeries[], marks: Record<string, ItemMark>, platformOf: (key: string) => string): Row[] {
  const rows: Row[] = [];
  for (const g of series) {
    if (!g.latest) continue;
    const items = g.latest.data.items;
    const mv = median(items.map((i) => i.metrics.views).filter((v): v is number => !!v));
    const ml = median(items.map((i) => i.metrics.likes).filter((v): v is number => !!v));
    const prevById = new Map((g.prev?.data.items ?? []).map((i) => [i.id, i]));
    const platform = g.latest.data.platform ?? platformOf(g.key);
    for (const item of items) {
      const v = item.metrics.views, l = item.metrics.likes;
      const useViews = v != null && !!mv;
      const outlier = useViews ? v! / mv! : l != null && ml ? l / ml : undefined;
      const inter = (item.metrics.likes ?? 0) + (item.metrics.comments ?? 0) + (item.metrics.shares ?? 0);
      const prev = prevById.get(item.id);
      const mk = `${platform}:${item.id}`;
      rows.push({
        mk, profileKey: g.key, platform, item, outlier, outlierBasis: useViews ? 'views' : 'likes',
        engagement: v ? inter / v : undefined,
        viewsDelta: prev?.metrics.views != null && v != null ? v - prev.metrics.views : undefined,
        prevAt: prev ? g.prev!.data.collectedAt : undefined,
        history: g.all.map((s) => { const x = s.data.items.find((i) => i.id === item.id); return x ? { at: s.data.collectedAt, views: x.metrics.views, likes: x.metrics.likes } : null; }).filter(Boolean) as Row['history'],
        mark: marks[mk],
      });
    }
  }
  return rows;
}

// ---------- imagens ----------
/** imagem com cópia local → remota → placeholder; sempre lazy e sem referrer (CDNs de IG/TikTok bloqueiam hotlink com referrer) */
export function Img({ local, remote, alt = '', className, fallback }: { local?: string; remote?: string | null; alt?: string; className?: string; fallback?: ReactNode }) {
  const srcs = [local, remote ?? undefined].filter(Boolean) as string[];
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [local, remote]);
  if (i >= srcs.length) return <>{fallback ?? <div className={cx('bg-surface-2', className)} />}</>;
  return <img src={srcs[i]} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={className} onError={() => setI((x) => x + 1)} />;
}

export function Avatar({ local, remote, name, size = 48, className }: { local?: string; remote?: string | null; name: string; size?: number; className?: string }) {
  const initials = name.split(/\s+/).filter((w) => /\w/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  const style = { width: size, height: size };
  return (
    <div className={cx('rounded-full overflow-hidden shrink-0 ring-2 ring-surface bg-surface-2', className)} style={style}>
      <Img local={local} remote={remote} alt={name} className="w-full h-full object-cover"
        fallback={<div className="w-full h-full grid place-items-center text-white font-semibold" style={{ background: `hsl(${hue} 45% 52%)`, fontSize: size * 0.36 }}>{initials || '?'}</div>} />
    </div>
  );
}

export function Star({ on, onClick, size = 'text-lg', title }: { on: boolean; onClick?: () => void; size?: string; title?: string }) {
  return (
    <button type="button" title={title ?? (on ? 'Tirar dos favoritos' : 'Favoritar')} aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick?.(); }}
      className={cx('leading-none transition hover:scale-110', size, on ? 'text-amber-400' : 'text-zinc-300 hover:text-amber-300')}>
      {on ? '★' : '☆'}
    </button>
  );
}

/** caixa de diálogo central; fecha com Esc e clique fora */
export function Modal({ open, onClose, title, children, footer, width = 'max-w-2xl' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center p-6 overflow-y-auto" onMouseDown={onClose}>
      <div className={cx('w-full bg-surface rounded-xl shadow-2xl mt-10 flex flex-col max-h-[85vh]', width)} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-muted hover:text-text text-xl leading-none" aria-label="Fechar">×</button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-border flex justify-end gap-2 bg-surface-2/50 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}

export const Spinner = ({ className }: { className?: string }) =>
  <span className={cx('inline-block w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin align-[-2px]', className)} />;

/** chips de filtro (segmented) */
export function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; count?: number }[] }) {
  return (
    <div className="inline-flex flex-wrap gap-1 p-0.5 bg-surface-2 rounded-lg">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cx('px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5', value === o.value ? 'bg-surface shadow-sm text-text' : 'text-muted hover:text-text')}>
          {o.label}{o.count != null && <span className="text-[10px] text-muted tabular-nums">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** "a, b c" → ['a','b-c'] (tags são slugs) */
export { slugify } from '../../../../core/platform';
