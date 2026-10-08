// Peças compartilhadas das abas Conteúdos e Anúncios (e da ficha): barra de filtros numa linha só, tabela ordenável
// e estado de filtros/vista na URL. A barra nunca quebra de linha: o que não cabe vai para o botão "Filtros" (popover).
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, LayoutGrid, ListFilter, Search, Star, Table as TableIcon, X, type LucideIcon } from 'lucide-react';
import { cx } from '../kit';
import { useFillHeight } from '../fill';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// ---------- URL ----------
/** filtros na URL (`?vista=tabela&rede=instagram`): só o que difere do padrão aparece; preserva os outros parâmetros (ex.: `aba`). `defaults` precisa ser estável. */
export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const [sp, setSp] = useSearchParams();
  const values = useMemo(() => Object.fromEntries(Object.keys(defaults).map((k) => [k, sp.get(k) ?? defaults[k]])) as T, [sp, defaults]);
  const set = useCallback((patch: Partial<T>) => setSp((prev) => {
    const n = new URLSearchParams(prev);
    for (const [k, v] of Object.entries(patch)) { if (v == null || v === defaults[k]) n.delete(k); else n.set(k, v as string); }
    return n;
  }, { replace: true }), [setSp, defaults]);
  const reset = useCallback((keys: (keyof T)[]) => set(Object.fromEntries(keys.map((k) => [k, defaults[k as string]])) as Partial<T>), [set, defaults]);
  return { values, set, reset };
}

// ---------- tooltip ----------
export function Tip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  if (!content) return <>{children}</>;
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side={side} className="max-w-xs whitespace-pre-line text-left">{content}</TooltipContent></Tooltip>;
}

// ---------- barra ----------
/**
 * Decide se os filtros secundários cabem inline: renderiza inline, e se a barra estoura (scrollWidth > clientWidth) passa para o
 * popover guardando a largura que precisava; volta para inline quando a barra voltar a ter essa largura.
 */
function useCompact(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const need = useRef(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      if (!compact) { if (el.scrollWidth > el.clientWidth + 1) { need.current = el.scrollWidth; setCompact(true); } }
      else if (el.clientWidth >= need.current) setCompact(false);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, ...deps]);
  return [ref, compact] as const;
}

export interface BarFilter { label: string; node: ReactNode; active?: boolean }

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1 min-w-[150px]">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Buscar"
        className="h-7 w-full rounded-md border border-border bg-card pl-7 pr-2 text-xs outline-none focus:border-primary placeholder:text-muted-foreground" />
    </div>
  );
}

export function FavToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Tip content={on ? 'Mostrando só os favoritos' : 'Só favoritos'}>
      <button type="button" aria-pressed={on} aria-label="Só favoritos" onClick={() => onChange(!on)}
        className={cx('h-7 w-7 shrink-0 grid place-items-center rounded-md border transition', on ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
        <Star className={cx('size-3.5', on && 'fill-current')} />
      </button>
    </Tip>
  );
}

/** toggle com ícone e rótulo (ex.: "Só novos") */
export function FlagToggle({ on, onChange, icon: Icon, label, title, tone = 'success' }: { on: boolean; onChange: (v: boolean) => void; icon: LucideIcon; label: string; title?: string; tone?: 'success' | 'amber' }) {
  return (
    <Tip content={title}>
      <button type="button" aria-pressed={on} onClick={() => onChange(!on)}
        className={cx('h-7 shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2 text-xs transition whitespace-nowrap',
          on ? (tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-success/40 bg-success/10 text-success') : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
        <Icon className="size-3.5" />{label}
      </button>
    </Tip>
  );
}

export function ViewToggle({ value, onChange, options }: { value: string; onChange: (v: string) => void; options?: { value: string; label: string; icon: LucideIcon }[] }) {
  const opts = options ?? [{ value: 'grade', label: 'Grade', icon: LayoutGrid }, { value: 'tabela', label: 'Tabela', icon: TableIcon }];
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)} className="shrink-0 !p-0.5" aria-label="Vista">
      {opts.map((o) => (
        <Tip key={o.value} content={o.label}>
          <ToggleGroupItem value={o.value} aria-label={o.label} className="!h-6 !px-2"><o.icon className="size-3.5" /></ToggleGroupItem>
        </Tip>
      ))}
    </ToggleGroup>
  );
}

/**
 * Barra numa linha: busca flexível · `primary` (sempre inline) · `secondary` (inline se couber, senão no botão "Filtros")
 * · `trailing` (favoritos, vista) · "Limpar filtros" quando `active`. Nunca quebra linha.
 */
export function FilterBar({ search, primary, secondary = [], trailing, active, onClear, className, style }: {
  search: { value: string; onChange: (v: string) => void; placeholder: string };
  primary?: ReactNode; secondary?: BarFilter[]; trailing?: ReactNode; active?: boolean; onClear?: () => void; className?: string; style?: React.CSSProperties;
}) {
  const [ref, overflow] = useCompact([secondary.length, active]);
  const compact = overflow && secondary.length > 0;
  const nActive = secondary.filter((s) => s.active).length;
  return (
    <div ref={ref} style={style} className={cx('flex flex-nowrap items-center gap-2', className)}>
      <SearchBox {...search} />
      {primary}
      {!compact && secondary.map((s) => <div key={s.label} className="shrink-0">{s.node}</div>)}
      {compact && (
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={cx('h-7 shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2 text-xs whitespace-nowrap', nActive ? 'border-primary/50 bg-primary/5 text-primary-ink' : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
              <ListFilter className="size-3.5" />Filtros{nActive > 0 && <span className="grid place-items-center min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] tabular-nums">{nActive}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-3 flex flex-col gap-3">
            {secondary.map((s) => (
              <div key={s.label}>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{s.label}</div>
                <div className="[&_button]:w-full">{s.node}</div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
      {trailing}
      {active && onClear && (
        <button type="button" onClick={onClear} title="Limpar filtros" className="h-7 shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted whitespace-nowrap">
          <X className="size-3.5" />{!compact && 'Limpar filtros'}
        </button>
      )}
    </div>
  );
}

// ---------- ordenação ----------
export interface SortState { k: string; dir: 1 | -1 }
export interface SortDef<T> { label: string; get: (r: T) => number | string | undefined | null; /** texto: A–Z por padrão ao clicar */ text?: boolean }

/** ordena por `defs[sort.k]`; vazio vai sempre para o fim */
export function sortRows<T>(rows: T[], defs: Record<string, SortDef<T>>, sort: SortState): T[] {
  const d = defs[sort.k];
  if (!d) return rows;
  return [...rows].sort((a, b) => {
    const va = d.get(a), vb = d.get(b);
    const na = va == null || va === '', nb = vb == null || vb === '';
    if (na && nb) return 0;
    if (na) return 1;
    if (nb) return -1;
    return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')) * sort.dir;
  });
}

/** ordenação guardada na URL (`ordem=` e `asc=1`) */
export function parseSort(ordem: string, asc: string): SortState { return { k: ordem, dir: asc === '1' ? 1 : -1 }; }

// ---------- tabela ----------
export interface Col<T> {
  k: string; label: ReactNode; title?: string; num?: boolean; /** chave em SortDef: sem isso a coluna não ordena */ sort?: string; /** 1º clique ordena do maior para o menor (datas, ranks); números já fazem isso */ desc?: boolean; width?: string;
  render: (r: T) => ReactNode; className?: string;
}

/**
 * Tabela de dados: cabeçalho clicável com seta (a ordenação é do chamador, controlada), cabeçalho fixo e rolagem dentro da
 * caixa (`fill` = ocupa o resto da tela), linha clicável.
 */
export function DataTable<T>({ rows, cols, rowKey, sort, onSort, onRowClick, fill, rowClass }: {
  rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; sort: SortState; onSort: (k: string, dir: 1 | -1) => void; onRowClick?: (r: T) => void; fill?: boolean; rowClass?: (r: T) => string | undefined;
}) {
  const [ref, h] = useFillHeight();
  const click = (c: Col<T>, isText: boolean) => {
    if (!c.sort) return;
    onSort(c.sort, sort.k === c.sort ? (sort.dir === 1 ? -1 : 1) : isText ? 1 : -1);
  };
  return (
    <div ref={fill ? ref : undefined} style={fill ? { height: h } : undefined} className={cx('bg-card border border-border rounded-xl overflow-auto', !fill && 'max-w-full')}>
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr>{cols.map((c) => {
            const on = !!c.sort && sort.k === c.sort;
            return (
              <th key={c.k} title={c.title} aria-sort={on ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined} style={c.width ? { width: c.width, minWidth: c.width } : undefined}
                onClick={() => click(c, !c.num && !c.desc)}
                className={cx('sticky top-0 z-10 bg-muted px-2 py-2 font-medium text-xs whitespace-nowrap select-none border-b border-border', c.num ? 'text-right' : 'text-left',
                  c.sort ? 'cursor-pointer hover:text-foreground' : '', on ? 'text-foreground' : 'text-muted-foreground')}>
                <span className={cx('inline-flex items-center gap-1', c.num && 'flex-row-reverse')}>
                  {c.label}
                  {c.sort && <span className="inline-flex items-center justify-center w-3 h-3">{on && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}</span>}
                </span>
              </th>
            );
          })}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cx('group', onRowClick && 'cursor-pointer', 'hover:bg-muted/40', rowClass?.(r))}>
              {cols.map((c) => <td key={c.k} className={cx('px-2 py-1.5 align-middle border-b border-border group-last:border-b-0', c.num && 'text-right tabular-nums whitespace-nowrap', c.className)}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
