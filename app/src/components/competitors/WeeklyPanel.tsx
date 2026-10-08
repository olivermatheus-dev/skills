// Coleta semanal (aba Coletas): roda só quando o Oliver clica em "Rodar agora" (sem agendamento). Mostra a última
// rodada, o progresso e os relatórios digeridos de cada semana (companies/<slug>/intel/semanas/AAAA-Wss.md).
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { api } from '../../api';
import { qk, useWeekly } from '../../queries';
import { toast } from '../toast';
import { Button, Drawer, cx } from '../kit';
import { Spinner, fmtDateTime, timeAgo } from './lib';

export default function WeeklyPanel({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const w = useWeekly(slug);
  const [report, setReport] = useState<{ week: string; text: string } | null>(null);
  const d = w.data;
  // terminou uma rodada: atualiza as outras abas
  useEffect(() => {
    if (d?.last) for (const k of ['competitors-summary', 'competitors-feed', 'ads', 'analysis-all']) void qc.invalidateQueries({ queryKey: [k, slug] });
  }, [d?.last]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return null;
  async function run() {
    try { qc.setQueryData(qk.weekly(slug), await api.runWeekly(slug)); toast.ok('Coleta semanal começou (roda no fundo)'); } catch (e) { toast.error(e, 'Não começou'); }
  }
  async function open(week: string) {
    try { setReport({ week, ...(await api.weeklyReport(slug, week)) }); } catch (e) { toast.error(e, 'Relatório não encontrado'); }
  }
  const r = d.running;
  return (
    <section className="mb-4 bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium"><CalendarClock className="size-4 text-muted-foreground" />Coleta semanal</span>
        <span className="text-xs text-muted-foreground">
          {d.last ? <>última <span title={fmtDateTime(d.last)}>{timeAgo(d.last)}</span>{d.lastSummary && <> · {d.lastSummary.ok}/{d.lastSummary.profiles} perfis{d.lastSummary.ads != null ? ` · ${d.lastSummary.ads} anúncios (${d.lastSummary.newAds ?? 0} novos)` : ''}{d.lastSummary.errors ? ` · ${d.lastSummary.errors} falha(s)` : ''}</>}</> : 'nunca rodou'}
          {!r && <span className="opacity-70"> · roda só quando você manda: redes + anúncios de todos, alguns minutos</span>}
        </span>
        <span className="ml-auto flex items-center gap-2">
          {d.reports.slice(0, 4).map((x) => <button key={x.week} onClick={() => open(x.week)} className="text-xs px-2 py-0.5 rounded-md border border-border hover:border-primary hover:text-primary-ink">{x.week.replace(/^\d{4}-/, '')}</button>)}
          <Button variant="ghost" onClick={run} disabled={!!r} className="!py-1 text-xs">{r ? <><Spinner /> {r.done}/{r.total}</> : 'Rodar agora'}</Button>
        </span>
      </div>
      {r && (
        <div className="mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${Math.max(3, (r.done / Math.max(1, r.total)) * 100)}%` }} /></div>
          <div className="mt-1 text-[11px] text-muted-foreground">{r.current ?? 'começando'}… (pode levar alguns minutos; pode sair da tela)</div>
        </div>
      )}
      <Drawer open={!!report} onClose={() => setReport(null)} title={`Semana ${report?.week ?? ''}`}>
        {report && <ReportView text={report.text} />}
      </Drawer>
    </section>
  );
}

/** Markdown do relatório (títulos, listas, tabela, **negrito** e [links]) sem biblioteca: o formato é o que semanal.ts escreve */
function ReportView({ text }: { text: string }) {
  const inline = (t: string) => t.split(/(\*\*[^*]+\*\*|\[[^\]]*\]\([^)]+\)|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**')) return <b key={i}>{p.slice(2, -2)}</b>;
    const l = p.match(/^\[([^\]]*)\]\(([^)]+)\)$/);
    if (l) return <a key={i} href={l[2]} target="_blank" rel="noreferrer" className="text-primary-ink hover:underline">{l[1] || 'link'}</a>;
    if (p.startsWith('`')) return <code key={i} className="text-xs bg-muted px-1 rounded">{p.slice(1, -1)}</code>;
    return p;
  });
  const out: React.ReactNode[] = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.startsWith('# ')) out.push(<h2 key={i} className="text-base font-semibold">{ln.slice(2)}</h2>);
    else if (ln.startsWith('## ')) out.push(<h3 key={i} className="text-sm font-semibold mt-5 mb-1.5">{ln.slice(3)}</h3>);
    else if (ln.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) { if (!/^\|[-| ]+\|$/.test(lines[i])) rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim())); i++; }
      i--;
      out.push(<table key={i} className="w-full text-xs border border-border rounded"><thead className="bg-muted/50"><tr>{rows[0].map((c) => <th key={c} className="px-2 py-1 text-left font-medium">{c}</th>)}</tr></thead>
        <tbody>{rows.slice(1).map((r, j) => <tr key={j} className="border-t border-border">{r.map((c, k) => <td key={k} className={cx('px-2 py-1', k >= 2 && 'tabular-nums')}>{c}</td>)}</tr>)}</tbody></table>);
    } else if (/^\s+- /.test(ln)) out.push(<div key={i} className="pl-8 text-xs text-muted-foreground leading-snug py-0.5">· {inline(ln.trim().slice(2))}</div>);
    else if (ln.startsWith('- ')) out.push(<div key={i} className="pl-3 text-[13px] leading-snug py-0.5 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground">{inline(ln.slice(2))}</div>);
    else if (ln.trim()) out.push(<p key={i} className="text-xs text-muted-foreground">{inline(ln)}</p>);
  }
  return <div className="space-y-1">{out}</div>;
}
