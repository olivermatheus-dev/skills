// Matriz de funcionalidades × concorrentes (Comparar → Funcionalidades). Dados: intel/matriz.json (schema/matrix.ts).
// Linhas = funcionalidades (por grupo, recolhíveis) · colunas = concorrentes · a coluna da própria empresa fica fixa,
// na cor do projeto, logo depois do nome. Clicar numa célula edita (vira by: 'oliver'; a IA nunca sobrescreve).
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, ChevronRight, CircleDot, CircleHelp, Clock, Pencil, Plus, X } from 'lucide-react';
import type { Matrix, MatrixCell, MatrixFeature } from '../../../../schema/matrix';
import { NOS } from '../../../../schema/matrix';
import { Avatar, Chips } from '../../components/competitors/lib';
import { useFillHeight, type MarketRow } from '../../components/competitors/area';
import { useMatrixActions } from '../../components/competitors/useMatrixActions';
import { Empty, cx } from '../../components/kit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMatrix, useProject } from '../../queries';

type Status = MatrixCell['status'];
const LABEL: Record<Status, string> = { sim: 'Tem', parcial: 'Parcial', nao: 'Não tem', desconhecido: 'Não sei', planejado: 'Planejado' };
const POSITIVE = (s?: Status) => s === 'sim' || s === 'parcial';
const COL_W = 'w-[150px] min-w-[150px] max-w-[150px]';
const NAME_W = 'w-[290px] min-w-[290px] max-w-[290px]';
const NOS_W = 'w-[200px] min-w-[200px] max-w-[200px]';

/** fundos sólidos (a coluna fixa não pode ser translúcida: o conteúdo passa por baixo ao rolar) */
const NOS_BG: Record<Status, string> = {
  sim: 'bg-emerald-100 dark:bg-emerald-950',
  parcial: 'bg-amber-100 dark:bg-amber-950',
  planejado: 'bg-amber-100 dark:bg-amber-950',
  nao: 'bg-red-100 dark:bg-red-950',
  desconhecido: 'bg-zinc-100 dark:bg-zinc-800',
};

function Icon({ s, className }: { s: Status; className?: string }) {
  const c = cx('size-4 shrink-0', className);
  if (s === 'sim') return <Check className={cx(c, 'text-success-ink')} strokeWidth={3} />;
  if (s === 'parcial') return <CircleDot className={cx(c, 'text-warning-ink')} />;
  if (s === 'planejado') return <Clock className={cx(c, 'text-warning-ink')} />;
  if (s === 'nao') return <X className={cx(c, 'text-destructive')} strokeWidth={3} />;
  return <CircleHelp className={cx(c, 'text-muted-foreground/50')} />;
}

const byLabel = (c: MatrixCell) => (c.by === 'oliver' ? 'Oliver' : 'IA') + ` · ${new Date(c.updatedAt).toLocaleDateString('pt-BR')}`;

interface Col { id: string; name: string; row?: MarketRow }
interface Editing { col: string; feat: string }

export default function MatrizFuncionalidades({ slug, rows }: { slug: string; rows: MarketRow[] }) {
  const mq = useMatrix(slug);
  const proj = useProject(slug);
  const act = useMatrixActions(slug);
  const [q, setQ] = useState('');
  type Mode = 'todas' | 'diferenca' | 'brecha' | 'diferencial';
  const [sp] = useSearchParams();
  // ?f= abre já filtrado (links do Panorama)
  const [mode, setMode] = useState<Mode>(() => (['diferenca', 'brecha', 'diferencial'].includes(sp.get('f') ?? '') ? sp.get('f') as Mode : 'todas'));
  const [group, setGroup] = useState('todos');
  const [order, setOrder] = useState<'cobertura' | 'alfabetica'>('cobertura');
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Editing | null>(null);
  const [featDlg, setFeatDlg] = useState<{ f?: MatrixFeature } | null>(null);
  // a caixa da tabela ocupa o resto da tela (a legenda fica embaixo)
  const [boxRef, boxH] = useFillHeight();
  const m: Matrix | undefined = mq.data;
  const nosName = proj.data?.name ?? 'Nós';

  const cell = (col: string, f: string) => m?.cells[col]?.[f];
  const total = m?.features.length ?? 0;
  /** cobertura: tem = 1, parcial = ½ */
  const coverage = (col: string) => (total && m ? m.features.reduce((n, f) => n + (cell(col, f.id)?.status === 'sim' ? 1 : cell(col, f.id)?.status === 'parcial' ? 0.5 : 0), 0) / total : 0);

  const cols = useMemo<Col[]>(() => {
    const base = rows.map((r) => ({ id: r.c.data.id, name: r.c.data.name, row: r }));
    return base.sort((a, b) => (order === 'alfabetica' ? a.name.localeCompare(b.name, 'pt-BR') : coverage(b.id) - coverage(a.id) || a.name.localeCompare(b.name, 'pt-BR')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, m, order]);

  const info = (f: MatrixFeature) => {
    const ids = cols.map((c) => c.id);
    const st = ids.map((id) => cell(id, f.id)?.status);
    const nos = cell(NOS, f.id)?.status;
    const known = [...st, nos].filter((s): s is Status => !!s && s !== 'desconhecido');
    return {
      have: st.filter(POSITIVE).length, sim: st.filter((s) => s === 'sim').length, parcial: st.filter((s) => s === 'parcial').length,
      diff: known.some((s) => s === 'nao') && known.some((s) => s !== 'nao'),
      brecha: (nos === 'nao' || nos === 'planejado') && st.some((s) => s === 'sim' || s === 'parcial'),
      diferencial: POSITIVE(nos) && !st.some(POSITIVE),
    };
  };

  const visible = useMemo(() => {
    if (!m) return [];
    const needle = q.trim().toLowerCase();
    return m.features.filter((f) => {
      if (group !== 'todos' && f.group !== group) return false;
      if (needle && !`${f.name} ${f.group} ${f.description ?? ''}`.toLowerCase().includes(needle)) return false;
      const i = info(f);
      return mode === 'todas' || (mode === 'diferenca' && i.diff) || (mode === 'brecha' && i.brecha) || (mode === 'diferencial' && i.diferencial);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, q, mode, group, cols]);

  const counts = useMemo(() => {
    const c = { todas: total, diferenca: 0, brecha: 0, diferencial: 0 };
    for (const f of m?.features ?? []) { const i = info(f); if (i.diff) c.diferenca++; if (i.brecha) c.brecha++; if (i.diferencial) c.diferencial++; }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, cols, total]);

  if (!m || !m.features.length) return <Empty title="Matriz de funcionalidades ainda vazia" hint="Peça à IA: “monta a matriz de funcionalidades” (skill analise-concorrentes) ou adicione a primeira funcionalidade." action={<Button size="sm" onClick={() => setFeatDlg({})}><Plus /> Funcionalidade</Button>} />;

  const groups = m.groups.filter((g) => visible.some((f) => f.group === g));
  const nCols = cols.length + 2;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar funcionalidade…" className="h-8 w-56" />
        <Chips value={mode} onChange={setMode} options={[
          { value: 'todas', label: 'Todas', count: counts.todas },
          { value: 'diferenca', label: 'Só onde há diferença', count: counts.diferenca },
          { value: 'brecha', label: 'Eles têm, nós não', count: counts.brecha },
          { value: 'diferencial', label: 'Só nós temos', count: counts.diferencial },
        ]} />
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger size="sm" className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="todos">Todos os grupos</SelectItem>{m.groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => setOrder(v as typeof order)}>
          <SelectTrigger size="sm" className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="cobertura">Colunas: mais completos</SelectItem><SelectItem value="alfabetica">Colunas: A–Z</SelectItem></SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setClosed(closed.size ? new Set() : new Set(m.groups))}>{closed.size ? 'Abrir grupos' : 'Recolher grupos'}</Button>
          <Button size="sm" onClick={() => setFeatDlg({})}><Plus /> Funcionalidade</Button>
        </div>
      </div>

      <div ref={boxRef} style={{ height: boxH }} className="bg-card border border-border rounded-xl overflow-auto">
        <table className="text-sm border-separate border-spacing-0 min-w-full h-full">
          <thead>
            <tr>
              <th className={cx('sticky left-0 top-0 z-30 bg-card border-b border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground', NAME_W)}>Funcionalidade <span className="font-normal">({visible.length})</span></th>
              <th className={cx('sticky left-[290px] top-0 z-30 bg-primary text-primary-foreground border-b border-primary px-3 py-2 text-left', NOS_W)}>
                <div className="text-sm font-semibold truncate">{nosName}</div>
                <div className="text-[10px] uppercase tracking-wide opacity-80">nosso produto</div>
              </th>
              {cols.map((c) => (
                <th key={c.id} className={cx('sticky top-0 z-20 bg-card border-b border-border px-2 py-2 text-left font-medium', COL_W)}>
                  <Link to={`/p/${slug}/concorrentes/${c.id}?aba=produto`} className="flex items-center gap-1.5 hover:text-primary-ink" title={`Ver o produto de ${c.name}`}>
                    <Avatar name={c.name} size={20} local={c.row?.avatar.local} remote={c.row?.avatar.remote} className="!ring-0 shrink-0" />
                    <span className="truncate text-xs">{c.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const fs = visible.filter((f) => f.group === g);
              const isClosed = closed.has(g);
              return [
                <tr key={`g-${g}`}>
                  <td colSpan={nCols} className="bg-muted border-b border-border p-0">
                    <div className="sticky left-0 flex w-fit items-center gap-1 px-2 py-1">
                      <button type="button" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-foreground/80 hover:text-foreground"
                        onClick={() => setClosed((s) => { const n = new Set(s); if (n.has(g)) n.delete(g); else n.add(g); return n; })}>
                        {isClosed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}{g}
                        <span className="font-normal normal-case tracking-normal text-muted-foreground">· {fs.length}</span>
                      </button>
                      <button type="button" title="Renomear grupo" className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => { const to = window.prompt('Novo nome do grupo', g); if (to && to.trim() && to !== g) void act.renameGroup(g, to.trim()); }}>
                        <Pencil className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>,
                ...(isClosed ? [] : fs.map((f) => {
                  const i = info(f);
                  const nosCell = cell(NOS, f.id);
                  return (
                    <tr key={f.id} className="group/row">
                      <td className={cx('sticky left-0 z-10 bg-card group-hover/row:bg-muted border-b border-r border-border px-3 py-1.5', NAME_W)}>
                        <div className="flex items-center gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild><span className="truncate font-medium cursor-default">{f.name}</span></TooltipTrigger>
                            <TooltipContent className="max-w-xs">{f.description || f.name}</TooltipContent>
                          </Tooltip>
                          <button type="button" title="Editar funcionalidade" className="opacity-0 group-hover/row:opacity-100 text-muted-foreground hover:text-foreground" onClick={() => setFeatDlg({ f })}><Pencil className="size-3" /></button>
                          <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground" title={`${i.sim} têm · ${i.parcial} parcial`}>{i.have}/{cols.length}</span>
                        </div>
                      </td>
                      <CellBox key="nos" feature={f.id} col={NOS} c={nosCell} editing={editing} setEditing={setEditing} onSave={act.setCell} nos
                        className={cx('sticky left-[290px] z-10 border-x-2 border-b border-x-primary border-b-border', NOS_BG[nosCell?.status ?? 'desconhecido'], NOS_W)} />
                      {cols.map((c) => (
                        <CellBox key={c.id} feature={f.id} col={c.id} c={cell(c.id, f.id)} editing={editing} setEditing={setEditing} onSave={act.setCell}
                          className={cx('border-b border-border group-hover/row:bg-muted/50', COL_W)} />
                      ))}
                    </tr>
                  );
                })),
              ];
            })}
            {!visible.length && <tr><td colSpan={nCols} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma funcionalidade neste filtro.</td></tr>}
            {/* preenche a sobra de altura: a cobertura fica sempre no rodapé, com as colunas fixas continuando até ele */}
            <tr aria-hidden className="h-full">
              <td className={cx('sticky left-0 z-10 bg-card border-r border-border p-0', NAME_W)} />
              <td className={cx('sticky left-[290px] z-10 border-x-2 border-x-primary bg-card p-0', NOS_W)} />
              {cols.map((c) => <td key={c.id} className="p-0" />)}
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className={cx('sticky left-0 bottom-0 z-30 bg-card border-t border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground', NAME_W)} title="tem = 1, parcial = ½, sobre todas as funcionalidades do catálogo">Cobertura do catálogo</td>
              <td className={cx('sticky left-[290px] bottom-0 z-30 border-x-2 border-t border-x-primary border-t-border bg-[color-mix(in_oklab,var(--primary)_15%,var(--card))] px-3 py-2 text-sm font-semibold tabular-nums', NOS_W)}>{Math.round(coverage(NOS) * 100)}%</td>
              {cols.map((c) => <td key={c.id} className={cx('sticky bottom-0 z-20 bg-card border-t border-border px-2 py-2 text-xs font-medium tabular-nums', COL_W)}>{Math.round(coverage(c.id) * 100)}%</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        <Check className="inline size-3 text-success-ink" strokeWidth={3} /> tem · <CircleDot className="inline size-3 text-warning-ink" /> parcial (plano, limite ou só em parte) · <X className="inline size-3 text-destructive" strokeWidth={3} /> a análise não mostra · <CircleHelp className="inline size-3" /> ninguém olhou ainda.
        {' '}Clique numa célula para corrigir (fica marcada como sua e a IA não sobrescreve). Fonte: o que cada site divulga, não o produto por dentro.
      </p>

      {featDlg && <FeatureDialog key={featDlg.f?.id ?? 'novo'} groups={m.groups} f={featDlg.f} onClose={() => setFeatDlg(null)}
        onSave={(v) => { void act.saveFeature(v); setFeatDlg(null); }}
        onDelete={featDlg.f ? () => { if (window.confirm(`Remover "${featDlg.f!.name}" da matriz? As células dela também saem.`)) { void act.deleteFeature(featDlg.f!.id); setFeatDlg(null); } } : undefined} />}
    </div>
  );
}

/** uma célula: ícone + nota curta (tooltip com nota inteira e fonte); clique abre o editor */
function CellBox({ feature, col, c, editing, setEditing, onSave, className, nos }: {
  feature: string; col: string; c?: MatrixCell; editing: Editing | null; setEditing: (e: Editing | null) => void;
  onSave: (col: string, feat: string, v: { status: Status | null; note?: string; source?: string }) => unknown; className?: string; nos?: boolean;
}) {
  const s: Status = c?.status ?? 'desconhecido';
  const open = editing?.col === col && editing.feat === feature;
  const body = (
    <button type="button" onClick={() => setEditing({ col, feat: feature })}
      className={cx('flex w-full items-center gap-1.5 text-left px-2 py-1.5 min-h-9 cursor-pointer', nos ? 'hover:brightness-95' : 'hover:bg-accent/60')}>
      <Icon s={s} />
      {c?.note && s !== 'nao' && <span className={cx('text-xs leading-tight', nos ? 'line-clamp-2 text-foreground' : 'truncate text-muted-foreground')}>{c.note}</span>}
      {nos && !c?.note && <span className="text-xs text-foreground/70">{LABEL[s]}</span>}
    </button>
  );
  const tip = c && (c.note || c.source) ? (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="font-medium">{LABEL[s]}{c.note ? ` · ${c.note}` : ''}</div>
        {c.source && <div className="opacity-80 break-all">{c.source}</div>}
        <div className="opacity-70">{byLabel(c)}</div>
      </TooltipContent>
    </Tooltip>
  ) : body;
  return (
    <td className={cx('p-0', className)}>
      {open ? (
        <Popover open onOpenChange={(o) => !o && setEditing(null)}>
          <PopoverAnchor asChild><div>{body}</div></PopoverAnchor>
          <PopoverContent align="start" className="w-72 p-3" onOpenAutoFocus={(e) => e.preventDefault()}>
            <CellEditor c={c} nos={nos} onCancel={() => setEditing(null)} onSave={(v) => { void onSave(col, feature, v); setEditing(null); }} />
          </PopoverContent>
        </Popover>
      ) : tip}
    </td>
  );
}

function CellEditor({ c, nos, onSave, onCancel }: { c?: MatrixCell; nos?: boolean; onSave: (v: { status: Status | null; note?: string; source?: string }) => void; onCancel: () => void }) {
  const [status, setStatus] = useState<Status>(c?.status ?? 'desconhecido');
  const [note, setNote] = useState(c?.note ?? '');
  const [source, setSource] = useState(c?.source ?? '');
  const opts: Status[] = nos ? ['sim', 'parcial', 'planejado', 'nao', 'desconhecido'] : ['sim', 'parcial', 'nao', 'desconhecido'];
  const save = () => onSave({ status, note, source });
  return (
    <div className="space-y-2.5" onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel(); }}>
      <div className="flex flex-wrap gap-1">
        {opts.map((o) => (
          <button key={o} type="button" onClick={() => setStatus(o)}
            className={cx('flex items-center gap-1 rounded-md border px-2 py-1 text-xs', status === o ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted')}>
            <Icon s={o} className="size-3.5" />{LABEL[o]}
          </button>
        ))}
      </div>
      <div>
        <Input value={note} maxLength={50} onChange={(e) => setNote(e.target.value)} placeholder="Nota curta (opcional)" className="h-8" autoFocus />
        <div className="mt-0.5 text-right text-[10px] text-muted-foreground tabular-nums">{note.length}/50</div>
      </div>
      <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Fonte (URL ou arquivo)" className="h-8" />
      <div className="flex items-center gap-2">
        {c && <span className="text-[10px] text-muted-foreground">{byLabel(c)}</span>}
        <Button size="xs" variant="ghost" className="ml-auto" onClick={() => onSave({ status: null })} disabled={!c}>Limpar</Button>
        <Button size="xs" onClick={save}>Salvar</Button>
      </div>
    </div>
  );
}

function FeatureDialog({ f, groups, onSave, onDelete, onClose }: {
  f?: MatrixFeature; groups: string[]; onClose: () => void; onDelete?: () => void;
  onSave: (v: { id?: string; name: string; group: string; description?: string }) => void;
}) {
  const [name, setName] = useState(f?.name ?? '');
  const [group, setGroup] = useState(f?.group ?? groups[0] ?? '');
  const [desc, setDesc] = useState(f?.description ?? '');
  const ok = name.trim() && group.trim();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{f ? 'Editar funcionalidade' : 'Nova funcionalidade'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nome (até 40 caracteres)</label>
            <Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Grupo (escolha ou digite um novo)</label>
            <Input value={group} onChange={(e) => setGroup(e.target.value)} list="matriz-grupos" />
            <datalist id="matriz-grupos">{groups.map((g) => <option key={g} value={g} />)}</datalist>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Descrição (aparece no tooltip)</label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {onDelete ? <Button variant="ghost" className="text-destructive" onClick={onDelete}>Remover</Button> : <span />}
          <div className="flex gap-2"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={!ok} onClick={() => onSave({ id: f?.id, name: name.trim(), group: group.trim(), description: desc.trim() || undefined })}>Salvar</Button></div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
