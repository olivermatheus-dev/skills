// Peças compartilhadas das abas Conteúdos e Anúncios (e da ficha): barra de filtros numa linha só, tabela ordenável
// e estado de filtros/vista na URL. A barra nunca quebra de linha: o que não cabe vai para o botão "Filtros" (popover).
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Columns3, LayoutGrid, ListFilter, Search, Star, Table as TableIcon, X, type LucideIcon } from 'lucide-react';
import { cx } from '../kit';
import { useFillHeight } from '../fill';
import { Checkbox } from '../ui/checkbox';
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
export function FlagToggle({ on, onChange, icon: Icon, label, title, tone = 'success' }: { on: boolean; onChange: (v: boolean) => void; icon: LucideIcon; label: string; title?: string; tone?: 'success' | 'amber' | 'violet' }) {
  return (
    <Tip content={title}>
      <button type="button" aria-pressed={on} onClick={() => onChange(!on)}
        className={cx('h-7 shrink-0 inline-flex items-center gap-1.5 rounded-md border px-2 text-xs transition whitespace-nowrap',
          on ? (tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-700' : tone === 'violet' ? 'border-ai-border bg-ai-soft text-ai-ink' : 'border-success/40 bg-success/10 text-success-ink') : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
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
  /** fica à vista ao rolar na horizontal (precisa de `width` em px; sem ele usa 96px) */
  pin?: 'left' | 'right';
  /** coluna secundária: entra no seletor "Colunas" (só com `colsKey`); `off` = começa escondida */
  optional?: boolean; off?: boolean;
  /** coluna de seleção (caixas): o seletor "Colunas" vai para a coluna seguinte */
  select?: boolean;
}

const colPx = (c: { width?: string }) => (c.width && c.width.endsWith('px') ? parseFloat(c.width) : 96);

/** colunas escondidas, guardadas por tabela (localStorage; falha em silêncio) */
function useHiddenCols<T>(key: string | undefined, cols: Col<T>[]) {
  const initial = () => {
    if (!key) return new Set<string>();
    try { const raw = localStorage.getItem(`hub.cols.${key}`); if (raw) return new Set<string>(JSON.parse(raw) as string[]); } catch { /* sem storage */ }
    return new Set(cols.filter((c) => c.off).map((c) => c.k));
  };
  const [hidden, setHidden] = useState<Set<string>>(initial);
  const toggle = (k: string) => setHidden((h) => {
    const n = new Set(h); if (n.has(k)) n.delete(k); else n.add(k);
    try { if (key) localStorage.setItem(`hub.cols.${key}`, JSON.stringify([...n])); } catch { /* sem storage */ }
    return n;
  });
  return [hidden, toggle] as const;
}

/**
 * Tabela de dados: cabeçalho clicável com ícone de seta (a ordenação é do chamador, controlada), cabeçalho fixo e rolagem dentro da
 * caixa (`fill` = ocupa o resto da tela), linha clicável. Colunas com `pin` ficam fixas à esquerda/direita ao rolar na horizontal
 * (as medidas e o status nunca somem); `colsKey` liga o seletor "Colunas" no cabeçalho da primeira coluna.
 */
export function DataTable<T>({ rows, cols: allCols, rowKey, sort, onSort, onRowClick, fill, rowClass, colsKey, padBottom }: {
  rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; sort: SortState; onSort: (k: string, dir: 1 | -1) => void; onRowClick?: (r: T) => void; fill?: boolean; rowClass?: (r: T) => string | undefined; /** espaço no fim da rolagem (barra flutuante por cima, 040 E) */ padBottom?: boolean;
  colsKey?: string;
}) {
  const [ref, h] = useFillHeight();
  const [hidden, toggleCol] = useHiddenCols(colsKey, allCols);
  const cols = allCols.filter((c) => !(colsKey && c.optional && hidden.has(c.k)));
  const optional = allCols.filter((c) => c.optional);
  const pickerAt = Math.max(0, cols.findIndex((c) => !c.select));
  // deslocamento de cada coluna fixa = soma das larguras das fixas que vêm antes (esquerda) ou depois (direita)
  const pinStyle = new Map<string, React.CSSProperties>();
  let acc = 0;
  for (const c of cols) if (c.pin === 'left') { pinStyle.set(c.k, { position: 'sticky', left: acc }); acc += colPx(c); }
  acc = 0;
  for (const c of [...cols].reverse()) if (c.pin === 'right') { pinStyle.set(c.k, { position: 'sticky', right: acc }); acc += colPx(c); }
  const lastLeft = [...cols].reverse().find((c) => c.pin === 'left')?.k, firstRight = cols.find((c) => c.pin === 'right')?.k;
  const edge = (k: string) => (k === lastLeft ? 'shadow-[inset_-1px_0_0_var(--border)]' : k === firstRight ? 'shadow-[inset_1px_0_0_var(--border)]' : '');
  const click = (c: Col<T>, isText: boolean) => {
    if (!c.sort) return;
    onSort(c.sort, sort.k === c.sort ? (sort.dir === 1 ? -1 : 1) : isText ? 1 : -1);
  };
  return (
    <div ref={fill ? ref : undefined} style={fill ? { height: h } : undefined} className={cx('bg-card border border-border rounded-xl overflow-auto', padBottom && 'pb-16', !fill && 'max-w-full max-h-[calc(100vh-14rem)]')}>
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr>{cols.map((c, i) => {
            const on = !!c.sort && sort.k === c.sort;
            const pinned = pinStyle.has(c.k);
            return (
              <th key={c.k} title={c.title} aria-sort={on ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined} style={{ ...(c.width ? { width: c.width, minWidth: c.width } : null), ...pinStyle.get(c.k) }}
                onClick={() => click(c, !c.num && !c.desc)}
                className={cx('sticky top-0 bg-muted px-2 py-2 font-medium text-xs whitespace-nowrap select-none border-b border-border', pinned ? 'z-20' : 'z-10', edge(c.k), c.num ? 'text-right' : 'text-left',
                  c.sort ? 'cursor-pointer hover:text-foreground' : '', on ? 'text-foreground' : 'text-muted-foreground')}>
                <span className={cx('inline-flex items-center gap-1', c.num && 'flex-row-reverse')}>
                  {i === pickerAt && colsKey && optional.length > 0
                    ? <ColumnsPicker cols={optional} hidden={hidden} onToggle={toggleCol} />
                    : c.label}
                  {c.sort && <span className="inline-flex items-center justify-center w-3 h-3">{on && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}</span>}
                </span>
              </th>
            );
          })}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cx('group', onRowClick && 'cursor-pointer', 'hover:bg-muted/40', rowClass?.(r))}>
              {cols.map((c) => (
                <td key={c.k} style={pinStyle.get(c.k)}
                  className={cx('px-2 py-1.5 align-middle border-b border-border group-last:border-b-0', pinStyle.has(c.k) && 'z-[5] bg-card group-hover:bg-muted', edge(c.k), c.num && 'text-right tabular-nums whitespace-nowrap', c.className)}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** botão "Colunas" (dentro do cabeçalho da 1ª coluna): liga e desliga as colunas secundárias */
function ColumnsPicker<T>({ cols, hidden, onToggle }: { cols: Col<T>[]; hidden: Set<string>; onToggle: (k: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" onClick={(e) => e.stopPropagation()} title="Escolher colunas" aria-label="Escolher colunas"
          className="h-6 w-6 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-card">
          <Columns3 className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-2 font-normal" onClick={(e) => e.stopPropagation()}>
        <div className="px-1.5 pb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Colunas</div>
        {cols.map((c) => (
          <label key={c.k} className="flex items-center gap-2 rounded px-1.5 py-1 text-xs text-foreground hover:bg-muted cursor-pointer">
            <Checkbox checked={!hidden.has(c.k)} onCheckedChange={() => onToggle(c.k)} />{c.label}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
