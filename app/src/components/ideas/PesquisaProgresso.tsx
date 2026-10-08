// Andamento de uma rodada de pesquisa (041 F3): etapas (consultas → buscar → triar → verificar → síntese) e uma linha por fonte
// ("42 achados → 9 na triagem → 7 conferidos"). Tudo lido dos arquivos da rodada pelo servidor; aqui só desenho.
import { Ban, Check, CircleMinus, CircleX, Loader2 } from 'lucide-react';
import type { EtapaProg, FonteProg, Progresso, Source } from '../../api';
import { cx } from '../kit';
import { Tip } from '../competitors/toolbar';
import { typeMeta } from './sources-meta';

export function Etapas({ etapas }: { etapas: EtapaProg[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs" aria-label="Etapas da pesquisa">
      {etapas.map((e, i) => (
        <li key={e.id} className="flex items-center gap-1">
          {i > 0 && <span className="mx-1 h-px w-3 bg-border" aria-hidden />}
          <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 whitespace-nowrap',
            e.estado === 'feito' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
              : e.estado === 'rodando' ? 'border-primary/40 bg-primary-soft text-primary-ink font-medium' : 'border-border text-muted-foreground')}>
            {e.estado === 'feito' ? <Check className="size-3" /> : e.estado === 'rodando' ? <Loader2 className="size-3 animate-spin" /> : <span className="size-1.5 rounded-full bg-current opacity-40" />}
            {e.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** o que a linha da fonte diz, em português corrido */
function textoFonte(f: FonteProg) {
  if (f.estado === 'espera') return <span className="text-muted-foreground">na espera</span>;
  if (f.estado === 'rodando') return <span className="text-primary-ink">buscando…</span>;
  if (f.estado === 'bloqueado') return <span className="text-muted-foreground">sem coletor por script ainda · seguiu sem ela</span>;
  if (f.estado === 'erro') return <Tip content={f.error}><span className="text-destructive">{erroCurto(f.error)} · seguiu sem ela</span></Tip>;
  if (f.estado === 'vazio') return <span className="text-muted-foreground">nada no período</span>;
  const partes = [`${f.fetched ?? 0} achados`];
  if (f.kept != null) partes.push(`${f.kept} na triagem`);
  if (f.verified != null) partes.push(`${f.verified} conferidos`);
  return <span className="tabular-nums">{partes.join(' → ')}</span>;
}
const erroCurto = (e: string | null) => (!e ? 'erro' : /429|limit|cota|quota/i.test(e) ? 'limite de acesso' : /sem coletor/i.test(e) ? 'sem coletor' : /timeout|timed out|abort/i.test(e) ? 'não respondeu' : e.length > 48 ? `${e.slice(0, 48)}…` : e);

const icone = (e: FonteProg['estado']) => e === 'feito' ? <Check className="size-4 text-emerald-600" />
  : e === 'rodando' ? <Loader2 className="size-4 animate-spin text-primary-ink" />
    : e === 'erro' ? <CircleX className="size-4 text-destructive" />
      : e === 'bloqueado' ? <Ban className="size-4 text-muted-foreground" />
        : e === 'vazio' ? <CircleMinus className="size-4 text-muted-foreground" />
          : <span className="size-1.5 rounded-full bg-muted-foreground/40 mx-[5px]" />;

export function LinhasFontes({ fontes, sources, className }: { fontes: FonteProg[]; sources: Source[] | undefined; className?: string }) {
  const byId = new Map((sources ?? []).map((s) => [s.id, s]));
  return (
    <ul className={cx('divide-y divide-border rounded-lg border border-border', className)}>
      {fontes.map((f) => {
        const s = byId.get(f.sourceId);
        const T = s ? typeMeta(s.type).icon : null;
        return (
          <li key={f.sourceId} className="flex items-center gap-2.5 px-3 py-1.5 text-sm">
            <span className="grid w-4 place-items-center shrink-0">{icone(f.estado)}</span>
            {T && <T className="size-3.5 shrink-0 text-muted-foreground" />}
            <span className="min-w-0 flex-1 truncate">{s?.name ?? f.sourceId}</span>
            <span className="shrink-0 text-xs">{textoFonte(f)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function PesquisaProgresso({ p, sources, maxH = 'max-h-[40vh]' }: { p: Progresso; sources: Source[] | undefined; maxH?: string }) {
  const t = p.totais;
  return (
    <div className="space-y-3">
      <Etapas etapas={p.etapas} />
      <LinhasFontes fontes={p.fontes} sources={sources} className={cx('overflow-auto', maxH)} />
      {(t.candidatos != null || t.achados != null) && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {t.candidatos != null && <>{t.candidatos} candidatos</>}
          {t.achados != null && <> → {t.achados} na triagem</>}
          {t.verificados != null && <> → {t.verificados} conferidos{t.caidos ? ` · ${t.caidos} caíram na verificação` : ''}</>}
        </p>
      )}
    </div>
  );
}

const ESTADO: Record<'pendente' | 'rodando' | 'feito' | 'erro', { label: string; pill: string; dot: string }> = {
  pendente: { label: 'Na fila', pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50', dot: 'bg-amber-500' },
  rodando: { label: 'Rodando', pill: 'bg-primary-soft text-primary-ink border-primary/30', dot: 'bg-primary animate-pulse' },
  feito: { label: 'Pronta', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50', dot: 'bg-emerald-500' },
  erro: { label: 'Não terminou', pill: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50', dot: 'bg-red-500' },
};
export function EstadoPill({ estado }: { estado: keyof typeof ESTADO }) {
  const m = ESTADO[estado];
  return <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium', m.pill)}><span className={cx('size-1.5 rounded-full', m.dot)} />{m.label}</span>;
}
