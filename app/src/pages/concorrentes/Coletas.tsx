// Coletas: a operação por trás dos dados. Um perfil por linha com o estado da última coleta (ok, erro resumido, nunca),
// "Puxar todos" (um concorrente por vez) ou só um, e o que está na fila da IA. Os erros completos ficam no tooltip.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type CollectResult, type ProfileSummary } from '../../api';
import { qk } from '../../queries';
import { AreaPage, SortTable, StatStrip, useMarket, type Col, type MarketRow } from '../../components/competitors/area';
import { Avatar, Chips, PlatformIcon, Spinner, fmtDateTime, platformLabel, timeAgo } from '../../components/competitors/lib';
import { toast } from '../../components/toast';
import { Button, ErrorBox, cx, fmtNum } from '../../components/kit';

type R = ProfileSummary & { m: MarketRow };
const STALE_DAYS = 7;
/** redes com coletor (tools/intel/adapters.ts → ADAPTERS); as outras ficam só como link */
const COLLECTABLE = new Set(['youtube', 'tiktok', 'instagram', 'site']);
const age = (iso?: string) => (iso ? (Date.now() - Date.parse(iso)) / 86_400_000 : Infinity);
const short = (e: string) => (/APIFY_TOKEN|cookies|login/i.test(e) ? 'precisa de acesso' : /429|limit/i.test(e) ? 'limite de acesso' : /404|não encontrado/i.test(e) ? 'não encontrado' : e.slice(0, 36) + (e.length > 36 ? '…' : ''));

export default function Coletas() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const m = useMarket(slug);
  const [filter, setFilter] = useState<'todos' | 'problema' | 'velho' | 'nunca'>('todos');
  const [showAll, setShowAll] = useState(false);
  const [pulling, setPulling] = useState<{ i: number; n: number; name: string } | null>(null);
  const [one, setOne] = useState<string | null>(null);

  const refresh = () => ['competitors-summary', 'competitors-feed', 'analysis-all'].forEach((k) => qc.invalidateQueries({ queryKey: [k, slug] }));
  const every: R[] = m.rows.flatMap((r) => (r.sum?.profiles ?? []).map((p) => ({ ...p, m: r })));
  const all = every.filter((p) => showAll || COLLECTABLE.has(p.platform));
  const stateOf = (p: R) => (!COLLECTABLE.has(p.platform) ? 'sem coletor' : !p.latest ? 'nunca' : p.latest.errors.length && !p.latest.items && p.platform !== 'site' && p.latest.profile.followers == null ? 'erro' : age(p.latest.collectedAt) > STALE_DAYS ? 'velho' : 'ok');
  const shown = all.filter((p) => filter === 'todos' || (filter === 'problema' ? stateOf(p) === 'erro' : stateOf(p) === filter));
  const queue = m.rows.filter((r) => r.ov?.request);

  async function pullAll(rows: MarketRow[]) {
    let ok = 0, total = 0;
    for (const [i, r] of rows.entries()) {
      setPulling({ i: i + 1, n: rows.length, name: r.c.data.name });
      try { const res: CollectResult[] = await api.collectResults(slug, r.c.data.id); total += res.length; ok += res.filter((x) => x.ok).length; }
      catch { total += r.c.data.profiles.length; }
      refresh();
    }
    setPulling(null);
    if (ok === total) toast.ok(`${ok} de ${total} perfis coletados`);
    else toast.error(new Error(`${total - ok} perfil(is) com erro: veja a coluna Estado`), `${ok} de ${total} perfis coletados`);
  }
  async function pullOne(r: MarketRow) {
    setOne(r.c.data.id);
    try { const res = await api.collectResults(slug, r.c.data.id); toast.ok(`${r.c.data.name}: ${res.filter((x) => x.ok).length}/${res.length} perfis`); }
    catch (e) { toast.error(e, `${r.c.data.name} não coletado`); }
    finally { setOne(null); refresh(); void qc.invalidateQueries({ queryKey: qk.competitor(slug, r.c.data.id) }); }
  }

  const cols: Col<R>[] = [
    { k: 'name', label: 'Concorrente', v: (p) => p.m.c.data.name, render: (p) => !keyFirst(p, all) ? <Link to={`/p/${slug}/concorrentes/${p.m.c.data.id}`} title={p.m.c.data.name} className="inline-block opacity-40 hover:opacity-100"><Avatar name={p.m.c.data.name} size={16} local={p.m.avatar.local} remote={p.m.avatar.remote} className="!ring-0" /></Link> : <Link to={`/p/${slug}/concorrentes/${p.m.c.data.id}`} className="flex items-center gap-2 font-medium hover:text-primary-ink"><Avatar name={p.m.c.data.name} size={20} local={p.m.avatar.local} remote={p.m.avatar.remote} className="!ring-0" />{p.m.c.data.name}</Link> },
    { k: 'prof', label: 'Perfil', v: (p) => p.platform, render: (p) => <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary-ink"><PlatformIcon platform={p.platform} size={13} />{p.handle ? (p.platform === 'site' ? p.handle : `@${p.handle}`) : platformLabel(p.platform)}</a> },
    { k: 'st', label: 'Estado', v: (p) => stateOf(p), render: (p) => {
      const s = stateOf(p);
      const err = p.latest?.errors.join('\n');
      return <span title={err || (s === 'sem coletor' ? 'ainda não há coletor para esta rede (fica só como link)' : undefined)} className={cx('inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border', s === 'ok' ? 'border-success/30 text-success' : s === 'erro' ? 'border-destructive/30 bg-destructive/5 text-destructive' : s === 'velho' ? 'border-warning/30 text-warning' : s === 'sem coletor' ? 'border-transparent text-muted-foreground/70' : 'border-border text-muted-foreground')}>
        {s === 'ok' ? '✓ ok' : s === 'erro' ? `✗ ${short(p.latest!.errors[0] ?? 'falhou')}` : s === 'velho' ? `velho (${Math.floor(age(p.latest?.collectedAt))} d)` : s === 'sem coletor' ? 'sem coletor' : 'nunca puxado'}
        {s === 'ok' && p.latest?.errors.length ? <span className="text-warning" title={err}>⚠</span> : null}
      </span>;
    } },
    { k: 'at', label: 'Última coleta', num: true, v: (p) => p.latest?.collectedAt, render: (p) => p.latest ? <span className="text-xs text-muted-foreground" title={fmtDateTime(p.latest.collectedAt)}>{timeAgo(p.latest.collectedAt)}</span> : <span className="text-muted-foreground">—</span> },
    { k: 'src', label: 'Fonte', v: (p) => p.latest?.source, render: (p) => <span className="text-xs text-muted-foreground">{p.latest?.source ?? '—'}</span> },
    { k: 'f', label: 'Seguidores', num: true, v: (p) => p.latest?.profile.followers ?? undefined, render: (p) => fmtNum(p.latest?.profile.followers ?? undefined) },
    { k: 'items', label: 'Itens', num: true, v: (p) => p.latest?.items, render: (p) => p.latest?.items ?? '—' },
    { k: 'n', label: 'Coletas', num: true, v: (p) => p.snapshots, render: (p) => p.snapshots },
    { k: 'act', label: '', render: (p) => p.m.c.data.profiles[0] && keyFirst(p, all) ? <button className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted disabled:opacity-50" disabled={!!pulling || one === p.m.c.data.id} onClick={() => pullOne(p.m)}>{one === p.m.c.data.id ? <Spinner /> : '↻'} Puxar</button> : null },
  ];

  const nOk = all.filter((p) => stateOf(p) === 'ok').length;
  const targets = m.rows.filter((r) => r.c.data.profiles.length);
  return (
    <AreaPage actions={<Button variant="ghost" disabled={!!pulling || !targets.length} onClick={() => pullAll(targets)} title="Puxa as redes de todos, um concorrente por vez">{pulling ? <><Spinner /> {pulling.i}/{pulling.n} {pulling.name}</> : '↻ Puxar todos'}</Button>}>
      <ErrorBox error={m.error} />
      <div className="mb-4"><StatStrip items={[
        { label: 'Perfis', value: String(all.length) },
        { label: 'Em dia', value: `${nOk}/${all.length}`, sub: `coleta com menos de ${STALE_DAYS} dias` },
        { label: 'Com erro', value: String(all.filter((p) => stateOf(p) === 'erro').length) },
        { label: 'Nunca puxados', value: String(all.filter((p) => stateOf(p) === 'nunca').length) },
        { label: 'Fila da IA', value: String(queue.length), title: queue.map((r) => `${r.c.data.name}: ${r.ov!.request!.modules.join(', ')}`).join('\n') || undefined, sub: queue.length ? 'diga ao Claude: roda a fila de concorrentes' : undefined },
      ]} /></div>
      {pulling && <div className="mb-3 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${((pulling.i - 0.5) / pulling.n) * 100}%` }} /></div>}
      <div className="mb-3 flex items-center"><Chips value={filter} onChange={setFilter} options={[
        { value: 'todos', label: 'Todos', count: all.length },
        { value: 'problema', label: 'Com erro', count: all.filter((p) => stateOf(p) === 'erro').length },
        { value: 'velho', label: 'Velhos', count: all.filter((p) => stateOf(p) === 'velho').length },
        { value: 'nunca', label: 'Nunca puxados', count: all.filter((p) => stateOf(p) === 'nunca').length },
      ]} />
        {every.length > all.length || showAll ? <label className="ml-3 text-xs text-muted-foreground inline-flex items-center gap-1.5"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> mostrar redes sem coletor ({every.filter((p) => !COLLECTABLE.has(p.platform)).length})</label> : null}
      </div>
      <SortTable rows={shown} cols={cols} rowKey={(p) => `${p.m.c.data.id}/${p.key}`} initial={{ k: 'name', dir: 1 }} />
      <p className="mt-3 text-[11px] text-muted-foreground">Cada coleta grava um arquivo novo (o histórico nunca é apagado). Instagram sem token: 6 posts mais recentes. LinkedIn, Facebook e X ainda não têm coletor.</p>
    </AreaPage>
  );
}

/** o botão "Puxar" aparece só na primeira linha de cada concorrente (puxa todos os perfis dele) */
const keyFirst = (p: R, all: R[]) => all.find((x) => x.m.c.data.id === p.m.c.data.id)?.key === p.key;
