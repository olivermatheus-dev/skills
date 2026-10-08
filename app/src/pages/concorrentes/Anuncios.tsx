// Anúncios: o que os concorrentes estão anunciando agora (Biblioteca de Anúncios da Meta, página pública, sem login).
// Ordena por tempo no ar (anúncio que roda há muito tempo é o que está dando resultado), marca os novos desde a coleta
// anterior e filtra por concorrente, formato e plataforma. "Puxar" busca de novo (script, grátis).
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Ad } from '../../api';
import { qk, useAds } from '../../queries';
import { AreaPage, StatStrip, useMarket } from '../../components/competitors/area';
import { Avatar, Chips, Img, PlatformIcon, Spinner, timeAgo } from '../../components/competitors/lib';
import { toast } from '../../components/toast';
import { Button, Empty, ErrorBox, Input, Select, cx, fmtNum } from '../../components/kit';

type Row = Ad & { compId: string; compName: string; isNew: boolean; days?: number };
type Sort = 'tempo' | 'recentes' | 'variacoes';
const MEDIA = { '': 'Todos os formatos', imagem: 'Imagem', video: 'Vídeo', carrossel: 'Carrossel' } as const;
const PROVEN_DAYS = 30;
/** anúncio de catálogo (DPA) vem com o modelo {{product.brand}} no lugar do texto */
const adText = (t?: string | null) => { const x = (t ?? '').replace(/\{\{[^}]+\}\}/g, '').trim(); return x || (t?.includes('{{') ? 'Catálogo (texto dinâmico)' : ''); };
const daysSince = (d?: string | null) => (d ? Math.max(0, Math.floor((Date.now() - Date.parse(d)) / 86_400_000)) : undefined);

export default function Anuncios() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const ads = useAds(slug);
  const m = useMarket(slug);
  const [comp, setComp] = useState('');
  const [media, setMedia] = useState<keyof typeof MEDIA>('');
  const [plat, setPlat] = useState('');
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<Sort>('tempo');
  const [q, setQ] = useState('');
  const [pulling, setPulling] = useState<{ i: number; n: number; name: string } | null>(null);
  const [one, setOne] = useState<string | null>(null);

  const names = useMemo(() => new Map(m.rows.map((r) => [r.c.data.id, r])), [m.rows]);
  const per = (ads.data ?? []).map((a) => {
    const cur = a.history.at(-1)?.data, prev = a.history.at(-2)?.data;
    const prevIds = new Set(prev?.ads.map((x) => x.id) ?? []);
    return { id: a.id, cur, prev, newN: prev && cur ? cur.ads.filter((x) => !prevIds.has(x.id)).length : 0, prevIds };
  });
  const rows: Row[] = per.flatMap((p) => (p.cur?.ads ?? []).filter((x) => x.active).map((x) => ({
    ...x, compId: p.id, compName: names.get(p.id)?.c.data.name ?? p.id, isNew: !!p.prev && !p.prevIds.has(x.id), days: daysSince(x.startedAt),
  })));
  const shown = rows.filter((r) => (!comp || r.compId === comp) && (!media || r.media.type === media) && (!plat || r.platforms.includes(plat)) && (!onlyNew || r.isNew)
    && (!q || `${r.text ?? ''} ${r.title ?? ''} ${r.compName}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === 'recentes' ? (b.startedAt ?? '').localeCompare(a.startedAt ?? '') : sort === 'variacoes' ? (b.variations ?? 0) - (a.variations ?? 0) : (b.days ?? -1) - (a.days ?? -1));
  const platforms = [...new Set(rows.flatMap((r) => r.platforms))];
  const advertising = per.filter((p) => p.cur?.ads.some((x) => x.active));
  const collected = per.filter((p) => p.cur);
  const proven = rows.filter((r) => (r.days ?? 0) >= PROVEN_DAYS).length;
  const fmtCount = Object.entries(rows.reduce<Record<string, number>>((o, r) => ({ ...o, [r.media.type]: (o[r.media.type] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0];

  const refresh = () => void qc.invalidateQueries({ queryKey: qk.ads(slug) });
  async function pullOne(id: string) {
    setOne(id);
    try { const r = await api.collectAds(slug, id); if (r.ok) toast.ok(`${names.get(id)?.c.data.name}: ${r.ads} anúncio(s) ativo(s)`); else toast.error(new Error(r.errors.join(' · ') || 'falhou'), 'Anúncios não coletados'); }
    catch (e) { toast.error(e, 'Anúncios não coletados'); } finally { setOne(null); refresh(); }
  }
  async function pullAll() {
    const list = m.rows.filter((r) => r.c.data.kind === 'concorrente');
    let n = 0;
    for (const [i, r] of list.entries()) {
      setPulling({ i: i + 1, n: list.length, name: r.c.data.name });
      try { n += (await api.collectAds(slug, r.c.data.id)).ads; } catch { /* segue para o próximo */ }
      refresh();
    }
    setPulling(null);
    toast.ok(`${n} anúncio(s) ativo(s) em ${list.length} concorrente(s)`);
  }

  return (
    <AreaPage actions={<Button variant="ghost" onClick={pullAll} disabled={!!pulling} title="Busca na Biblioteca de Anúncios da Meta, um concorrente por vez">{pulling ? <><Spinner /> {pulling.i}/{pulling.n} {pulling.name}</> : '↻ Puxar anúncios'}</Button>}>
      <ErrorBox error={ads.error} />
      {ads.isLoading && <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />}
      {ads.data && !collected.length && (
        <Empty title="Nenhuma coleta de anúncios ainda" hint="Busca os anúncios ativos de cada concorrente na Biblioteca de Anúncios da Meta (página pública, sem login). Também roda sozinha na coleta semanal."
          action={<Button onClick={pullAll} disabled={!!pulling}>{pulling ? <><Spinner /> {pulling.i}/{pulling.n}</> : '↻ Puxar anúncios de todos'}</Button>} />
      )}
      {collected.length > 0 && <>
        <StatStrip items={[
          { label: 'Anúncios ativos', value: fmtNum(rows.length) },
          { label: 'Concorrentes anunciando', value: `${advertising.length}/${collected.length}`, title: advertising.map((p) => names.get(p.id)?.c.data.name).join(', ') },
          { label: 'Novos desde a coleta anterior', value: String(rows.filter((r) => r.isNew).length) },
          { label: `No ar há ${PROVEN_DAYS}+ dias`, value: String(proven), sub: 'sinal de que dá resultado' },
          ...(fmtCount ? [{ label: 'Formato mais usado', value: MEDIA[fmtCount[0] as keyof typeof MEDIA] ?? fmtCount[0], sub: `${fmtCount[1]} anúncio(s)` }] : []),
        ]} />

        {/* por concorrente: contagem e puxar só ele */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <button onClick={() => setComp('')} className={cx('px-2.5 py-1 rounded-full text-xs border', !comp ? 'border-primary bg-primary/10 text-primary-ink' : 'border-border hover:bg-muted')}>Todos <span className="text-muted-foreground">{rows.length}</span></button>
          {per.map((p) => {
            const mr = names.get(p.id);
            if (!mr || mr.c.data.kind !== 'concorrente') return null;
            const n = p.cur?.ads.filter((x) => x.active).length ?? 0;
            return (
              <span key={p.id} className={cx('inline-flex items-center rounded-full border text-xs', comp === p.id ? 'border-primary bg-primary/10' : 'border-border')}>
                <button onClick={() => setComp(comp === p.id ? '' : p.id)} className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5" title={p.cur ? `coletado ${timeAgo(p.cur.collectedAt)}${p.cur.pageName ? ` · página ${p.cur.pageName}` : ''}${p.cur.errors.length ? `\n${p.cur.errors.join('\n')}` : ''}` : 'ainda não coletado'}>
                  <Avatar name={mr.c.data.name} size={16} local={mr.avatar.local} remote={mr.avatar.remote} className="!ring-0" />
                  {mr.c.data.name} <span className={cx('tabular-nums', p.cur ? 'text-foreground font-medium' : 'text-muted-foreground')}>{p.cur ? n : '—'}</span>
                  {p.newN > 0 && <span className="text-success">+{p.newN}</span>}
                  {p.cur?.errors.length ? <span className="text-destructive" title={p.cur.errors.join('\n')}>⚠</span> : null}
                </button>
                <button onClick={() => pullOne(p.id)} disabled={one === p.id || !!pulling} className="pr-2 pl-1 text-muted-foreground hover:text-foreground border-l border-border" aria-label="Puxar anúncios">{one === p.id ? <Spinner /> : '↻'}</button>
              </span>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={media} onChange={(e) => setMedia(e.target.value as keyof typeof MEDIA)} aria-label="Formato">{Object.entries(MEDIA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
          {platforms.length > 1 && <Chips value={plat} onChange={setPlat} options={[{ value: '', label: 'Todas' }, ...platforms.map((p) => ({ value: p, label: <span className="inline-flex items-center gap-1"><PlatformIcon platform={p} size={12} />{p}</span> }))]} />}
          <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar">
            <option value="tempo">Mais tempo no ar</option><option value="recentes">Mais recentes</option><option value="variacoes">Mais variações</option>
          </Select>
          <button onClick={() => setOnlyNew(!onlyNew)} className={cx('px-2.5 py-1.5 rounded-md text-sm border', onlyNew ? 'border-success/40 bg-success/10 text-success' : 'border-border text-muted-foreground hover:text-foreground')}>Só novos</button>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar no texto do anúncio…" className="ml-auto w-64" />
        </div>

        {!shown.length && <div className="mt-6"><Empty title={rows.length ? 'Nada com esses filtros' : 'Nenhum anúncio ativo nos concorrentes coletados'} /></div>}
        <div className="mt-4 grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {shown.map((r) => <AdCard key={`${r.compId}/${r.id}`} slug={slug} r={r} />)}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">Fonte: Biblioteca de Anúncios da Meta (Brasil, ativos). Tempo no ar = desde a data de início informada pela biblioteca. A coleta semanal atualiza esta aba.</p>
      </>}
    </AreaPage>
  );
}

function AdCard({ slug, r }: { slug: string; r: Row }) {
  const proven = (r.days ?? 0) >= PROVEN_DAYS;
  const title = (r.title ?? '').replace(/\{\{[^}]+\}\}/g, '').trim();
  const host = (() => { try { return r.linkUrl ? new URL(r.linkUrl).hostname.replace(/^www\./, '') : null; } catch { return null; } })();
  return (
    <article className={cx('bg-card border rounded-xl overflow-hidden flex flex-col', proven ? 'border-amber-300' : 'border-border')}>
      <a href={r.url} target="_blank" rel="noreferrer" className="relative block aspect-square bg-muted">
        <Img local={api.mediaUrl(slug, r.compId, r.media.thumbnailLocal ?? undefined)} remote={r.media.thumbnail} className="absolute inset-0 w-full h-full object-cover" fallback={<div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">sem miniatura</div>} />
        <span className="absolute top-2 left-2 flex gap-1">
          {r.isNew && <span className="text-[10px] font-semibold bg-success text-white rounded px-1.5 py-0.5">NOVO</span>}
          <span className="text-[10px] font-semibold bg-black/70 text-white rounded px-1.5 py-0.5 uppercase">{r.media.type === 'desconhecido' ? 'anúncio' : r.media.type}</span>
        </span>
        {r.days != null && <span className={cx('absolute bottom-2 left-2 text-[11px] font-semibold rounded px-1.5 py-0.5', proven ? 'bg-amber-400 text-black' : 'bg-black/70 text-white')} title={`no ar desde ${new Date(r.startedAt!).toLocaleDateString('pt-BR')}`}>{r.days} dia(s) no ar</span>}
        {(r.variations ?? 0) > 1 ? <span className="absolute bottom-2 right-2 text-[11px] bg-black/70 text-white rounded px-1.5 py-0.5" title="anúncios que usam este criativo e texto">{r.variations} variações</span> : null}
      </a>
      <div className="p-3 flex-1 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to={`/p/${slug}/concorrentes/${r.compId}`} className="font-medium text-foreground hover:text-primary-ink truncate">{r.compName}</Link>
          <span className="ml-auto flex gap-1">{r.platforms.map((p) => <PlatformIcon key={p} platform={p} size={12} />)}</span>
        </div>
        {adText(r.text) && <p className={cx('text-[13px] leading-snug line-clamp-5 whitespace-pre-line', !r.text?.replace(/\{\{[^}]+\}\}/g, '').trim() && 'text-muted-foreground italic')}>{adText(r.text)}</p>}
        {(title || r.cta) && (
          <div className="mt-auto pt-2 border-t border-border flex items-center gap-2 text-xs">
            <span className="min-w-0 flex-1"><span className="block font-medium truncate">{title}</span>{host && <span className="block text-muted-foreground truncate">{host}</span>}</span>
            {r.cta && <span className="shrink-0 px-2 py-0.5 rounded bg-muted">{r.cta}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
