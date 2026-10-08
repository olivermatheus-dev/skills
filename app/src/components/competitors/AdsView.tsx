// AdsView (era a página Anúncios): o que os concorrentes estão anunciando agora (Biblioteca de Anúncios da Meta, página pública, sem login).
// Ordena por tempo no ar (anúncio que roda há muito tempo é o que está dando resultado), marca os novos desde a coleta
// anterior e filtra por concorrente, formato e plataforma. Grade de cards ou tabela. "Puxar" busca de novo (script, grátis).
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, Clapperboard, GalleryHorizontal, Image as ImageIcon, Layers, List, LayoutGrid, CalendarClock, Info, Link2, Megaphone, RefreshCw, Share2, Shapes, Sparkles, Timer, TriangleAlert, Users } from 'lucide-react';
import { api, type Ad } from '../../api';
import { qk, useAds } from '../../queries';
import { FillBox, StatStrip, useMarket } from './area';
import { Avatar, Img, PlatformIcon, Spinner, platformLabel } from '../../components/competitors/lib';
import { DataTable, FilterBar, FlagToggle, Tip, ViewToggle, parseSort, sortRows, useUrlState, type Col, type SortDef } from '../../components/competitors/toolbar';
import { toast } from '../../components/toast';
import { Button, Empty, ErrorBox, SelectField, cx, fmtDate, fmtNum, type SelectOption } from '../../components/kit';

type Row = Ad & { compId: string; compName: string; isNew: boolean; days?: number };
const MEDIA = { imagem: 'Imagem', video: 'Vídeo', carrossel: 'Carrossel', desconhecido: 'Outro' } as const;
const MEDIA_ICON: Record<string, React.ReactNode> = { imagem: <ImageIcon />, video: <Clapperboard />, carrossel: <GalleryHorizontal />, desconhecido: <Shapes /> };
const PROVEN_DAYS = 30;
/** anúncio de catálogo (DPA) vem com o modelo {{product.brand}} no lugar do texto */
const adText = (t?: string | null) => { const x = (t ?? '').replace(/\{\{[^}]+\}\}/g, '').trim(); return x || (t?.includes('{{') ? 'Catálogo (texto dinâmico)' : ''); };
const daysSince = (d?: string | null) => (d ? Math.max(0, Math.floor((Date.now() - Date.parse(d)) / 86_400_000)) : undefined);
const hostOf = (u?: string | null) => { try { return u ? new URL(u).hostname.replace(/^www\./, '') : null; } catch { return null; } };
const mediaLabel = (t: string) => MEDIA[t as keyof typeof MEDIA] ?? t;

/** ordenações: tempo no ar (padrão), mais novos, variações e concorrente na barra; o resto só no cabeçalho da tabela */
const SORTS: Record<string, SortDef<Row> & { bar?: boolean }> = {
  tempo: { label: 'Mais tempo no ar', get: (r) => r.days, bar: true },
  recentes: { label: 'Mais novos', get: (r) => (r.startedAt ? Date.parse(r.startedAt) : undefined), bar: true },
  variacoes: { label: 'Mais variações', get: (r) => r.variations ?? 0, bar: true },
  concorrente: { label: 'Concorrente (A–Z)', get: (r) => r.compName.toLowerCase(), text: true, bar: true },
  texto: { label: 'Texto', get: (r) => adText(r.text).toLowerCase(), text: true },
  formato: { label: 'Formato', get: (r) => mediaLabel(r.media.type), text: true },
  cta: { label: 'CTA', get: (r) => r.cta?.toLowerCase(), text: true },
  dominio: { label: 'Domínio', get: (r) => hostOf(r.linkUrl) ?? undefined, text: true },
  plataformas: { label: 'Plataformas', get: (r) => r.platforms.length },
  status: { label: 'Status', get: (r) => ((r.days ?? 0) >= PROVEN_DAYS ? 2 : r.isNew ? 1 : 0) },
};
const DEFAULTS = { q: '', conc: '', rede: '', formato: '', novos: '', vista: 'grade', ordem: 'tempo', asc: '' };

/**
 * Anúncios em grade ou tabela. Sem `compId` = todos os concorrentes (página Anúncios); com `compId` = só esse concorrente (aba da ficha:
 * sem o select de concorrente, com resumo próprio). `shell` recebe os botões de puxar e o corpo e decide onde colocá-los.
 */
export default function AdsView({ slug, compId, shell }: { slug: string; compId?: string; shell: (actions: ReactNode, body: ReactNode) => ReactNode }) {
  const qc = useQueryClient();
  const ads = useAds(slug);
  const m = useMarket(slug);
  const { values: v, set, reset } = useUrlState(DEFAULTS);
  const [pulling, setPulling] = useState<{ i: number; n: number; name: string } | null>(null);
  const [one, setOne] = useState<string | null>(null);

  const names = useMemo(() => new Map(m.rows.map((r) => [r.c.data.id, r])), [m.rows]);
  const per = (ads.data ?? []).filter((a) => !compId || a.id === compId).map((a) => {
    const cur = a.history.at(-1)?.data, prev = a.history.at(-2)?.data;
    const prevIds = new Set(prev?.ads.map((x) => x.id) ?? []);
    return { id: a.id, cur, prev, newN: prev && cur ? cur.ads.filter((x) => !prevIds.has(x.id)).length : 0, prevIds };
  });
  const rows: Row[] = per.flatMap((p) => (p.cur?.ads ?? []).filter((x) => x.active).map((x) => ({
    ...x, compId: p.id, compName: names.get(p.id)?.c.data.name ?? p.id, isNew: !!p.prev && !p.prevIds.has(x.id), days: daysSince(x.startedAt),
  })));
  const sort = parseSort(Object.hasOwn(SORTS, v.ordem) ? v.ordem : 'tempo', v.asc);
  const q = v.q.toLowerCase();
  const shown = sortRows(rows.filter((r) => (compId || !v.conc || r.compId === v.conc) && (!v.formato || r.media.type === v.formato) && (!v.rede || r.platforms.includes(v.rede)) && (!v.novos || r.isNew)
    && (!q || `${r.text ?? ''} ${r.title ?? ''} ${r.compName}`.toLowerCase().includes(q))), SORTS, sort);
  const platforms = [...new Set(rows.flatMap((r) => r.platforms))];
  const mediaTypes = [...new Set(rows.map((r) => r.media.type))];
  const advertising = per.filter((p) => p.cur?.ads.some((x) => x.active));
  const collected = per.filter((p) => p.cur);
  const proven = rows.filter((r) => (r.days ?? 0) >= PROVEN_DAYS).length;
  const fmtCount = Object.entries(rows.reduce<Record<string, number>>((o, r) => ({ ...o, [r.media.type]: (o[r.media.type] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0];
  // "não achou página de anunciante" é o estado normal de quem não anuncia; o resto (login, captcha, HTTP) é erro de coleta
  const NAO_ANUNCIA = /nenhuma página de anunciante/;
  const semPagina = per.filter((p) => p.cur?.errors.length && p.cur.errors.every((e) => NAO_ANUNCIA.test(e)));
  const oldest = rows.reduce<Row | undefined>((o, r) => ((r.days ?? -1) > (o?.days ?? -1) ? r : o), undefined);
  const topHost = Object.entries(rows.reduce<Record<string, number>>((o, r) => { const h = hostOf(r.linkUrl); return h ? { ...o, [h]: (o[h] ?? 0) + 1 } : o; }, {})).sort((a, b) => b[1] - a[1])[0];
  const withErrors = per.filter((p) => p.cur?.errors.length && !p.cur.errors.every((e) => NAO_ANUNCIA.test(e)));

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

  // opções com ícone/logo/avatar e contagem
  const concOpts: SelectOption[] = [{ value: '', label: 'Todos os concorrentes', icon: <Users />, count: rows.length }, ...per.flatMap((p) => {
    const mr = names.get(p.id);
    if (!mr || mr.c.data.kind !== 'concorrente') return [];
    return [{ value: p.id, label: mr.c.data.name, icon: <Avatar name={mr.c.data.name} size={16} local={mr.avatar.local} remote={mr.avatar.remote} className="!ring-0" />, count: p.cur?.ads.filter((x) => x.active).length ?? 0 }];
  })];
  const redeOpts: SelectOption[] = [{ value: '', label: 'Todas as redes', icon: <Share2 /> }, ...platforms.map((p) => ({ value: p, label: platformLabel(p), icon: <PlatformIcon platform={p} size={16} />, count: rows.filter((r) => r.platforms.includes(p)).length }))];
  const formatoOpts: SelectOption[] = [{ value: '', label: 'Todos os formatos', icon: <Shapes /> }, ...mediaTypes.map((t) => ({ value: t, label: mediaLabel(t), icon: MEDIA_ICON[t], count: rows.filter((r) => r.media.type === t).length }))];
  const sortOpts: SelectOption[] = Object.entries(SORTS).filter(([, d]) => d.bar).map(([value, d]) => ({ value, label: d.label }));
  const active = !!(v.q || v.conc || v.rede || v.formato || v.novos);

  const cols: Col<Row>[] = [
    { k: 'thumb', label: '', width: '60px', pin: 'left', render: (r) => (
      <a href={r.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title="Abrir na Biblioteca de Anúncios" className="block size-11 rounded-md overflow-hidden bg-muted">
        <Img local={api.mediaUrl(slug, r.compId, r.media.thumbnailLocal ?? undefined)} remote={r.media.thumbnail} className="size-full object-cover" fallback={<div className="size-full grid place-items-center text-muted-foreground"><Megaphone className="size-4" /></div>} />
      </a>
    ) },
    { k: 'comp', label: 'Concorrente', sort: 'concorrente', render: (r) => {
      const mr = names.get(r.compId);
      return <Link to={`/p/${slug}/concorrentes/${r.compId}`} className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-primary-ink"><Avatar name={r.compName} size={18} local={mr?.avatar.local} remote={mr?.avatar.remote} className="!ring-0" />{r.compName}</Link>;
    } },
    // espaço para as colunas de funil, tipo e objetivo da 037 C: entram aqui, antes do formato
    { k: 'texto', label: 'Gancho / texto', sort: 'texto', width: '220px', render: (r) => {
      const t = adText(r.text), title = (r.title ?? '').replace(/\{\{[^}]+\}\}/g, '').trim();
      const full = [title, t].filter(Boolean).join('\n\n');
      return <Tip content={full || undefined}><span className={cx('block max-w-[240px] truncate', !r.text?.replace(/\{\{[^}]+\}\}/g, '').trim() && 'text-muted-foreground italic')}>{t || title || '—'}</span></Tip>;
    } },
    { k: 'formato', label: 'Formato', sort: 'formato', className: 'whitespace-nowrap', render: (r) => mediaLabel(r.media.type) },
    { k: 'cta', label: 'CTA', sort: 'cta', render: (r) => r.cta ? <span className="block max-w-[130px] truncate px-1.5 py-0.5 rounded bg-muted text-xs" title={r.cta}>{r.cta}</span> : <span className="text-muted-foreground">—</span> },
    { k: 'dominio', label: 'Link', sort: 'dominio', render: (r) => {
      const h = hostOf(r.linkUrl);
      return h ? <a href={r.linkUrl!} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="block max-w-[130px] truncate text-primary-ink hover:underline" title={r.linkUrl!}>{h}</a> : <span className="text-muted-foreground">—</span>;
    } },
    { k: 'inicio', label: 'Início', sort: 'recentes', desc: true, className: 'whitespace-nowrap', title: 'início da veiculação', render: (r) => r.startedAt ? fmtDate(r.startedAt) : '—' },
    { k: 'variacoes', label: 'Variações', optional: true, off: true, sort: 'variacoes', num: true, title: 'anúncios que usam este criativo e texto', render: (r) => (r.variations ?? 0) > 1 ? fmtNum(r.variations ?? 0) : <span className="text-muted-foreground">1</span> },
    { k: 'plataformas', label: 'Onde roda', optional: true, sort: 'plataformas', desc: true, render: (r) => <span className="inline-flex gap-1">{r.platforms.map((p) => <span key={p} title={platformLabel(p)}><PlatformIcon platform={p} size={14} /></span>)}</span> },
    { k: 'dias', label: 'Dias no ar', width: '96px', pin: 'right', sort: 'tempo', num: true, title: 'desde o início informado pela biblioteca', render: (r) => r.days != null ? <span className={cx('tabular-nums', (r.days ?? 0) >= PROVEN_DAYS ? 'font-semibold text-amber-700' : '')}>{r.days}</span> : '—' },
    { k: 'status', label: 'Status', width: '88px', pin: 'right', sort: 'status', desc: true, render: (r) => (r.days ?? 0) >= PROVEN_DAYS
      ? <span className="text-[11px] font-semibold rounded px-1.5 py-0.5 bg-amber-100 text-amber-800 whitespace-nowrap" title="no ar há 30+ dias: sinal de que dá resultado">Provado</span>
      : r.isNew ? <span className="text-[11px] font-semibold rounded px-1.5 py-0.5 bg-success/15 text-success-ink">Novo</span> : <span className="text-xs text-muted-foreground">Ativo</span> },
  ];

  const pullChip = (id: string) => (
    <Button variant="ghost" onClick={() => pullOne(id)} disabled={one === id || !!pulling} title={`Puxar só os anúncios de ${names.get(id)?.c.data.name}`}>{one === id ? <Spinner /> : <RefreshCw className="size-3.5" />} {names.get(id)?.c.data.name}</Button>
  );

  return shell(<>
      {!compId && v.conc && pullChip(v.conc)}
      <Button variant="ghost" className="inline-flex items-center gap-1.5 whitespace-nowrap" onClick={compId ? () => pullOne(compId) : pullAll} disabled={!!pulling || (!!compId && one === compId)} title={compId ? 'Busca os anúncios deste concorrente na Biblioteca de Anúncios da Meta' : 'Busca na Biblioteca de Anúncios da Meta, um concorrente por vez'}>{pulling ? <><Spinner /> {pulling.i}/{pulling.n} {pulling.name}</> : <><RefreshCw className="size-3.5" />Puxar anúncios</>}</Button>
    </>, <>
      <ErrorBox error={ads.error} />
      {ads.isLoading && <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />}
      {ads.data && !collected.length && (
        <Empty title={compId ? 'Anúncios ainda não puxados' : 'Nenhuma coleta de anúncios ainda'} hint={compId ? 'Clique em “Puxar anúncios” para buscar na Biblioteca de Anúncios da Meta (página pública, sem login).' : "Busca os anúncios ativos de cada concorrente na Biblioteca de Anúncios da Meta (página pública, sem login). Também roda sozinha na coleta semanal."}
          action={<Button onClick={compId ? () => pullOne(compId) : pullAll} disabled={!!pulling}>{pulling ? <><Spinner /> {pulling.i}/{pulling.n}</> : <><RefreshCw className="size-3.5" />Puxar anúncios de todos</>}</Button>} />
      )}
      {collected.length > 0 && <>
        {compId ? <>
          <StatStrip items={[
            { icon: Megaphone, label: 'Anúncios ativos', value: fmtNum(rows.length), sub: rows.filter((r) => r.isNew).length ? `${rows.filter((r) => r.isNew).length} novo(s) desde a coleta anterior` : undefined },
            { icon: Timer, label: `No ar há ${PROVEN_DAYS}+ dias`, value: String(proven), sub: 'sinal de que dá resultado' },
            { icon: CalendarClock, label: 'Mais antigo no ar', value: oldest ? `${oldest.days} dias` : '—', sub: oldest?.startedAt ? `desde ${fmtDate(oldest.startedAt)}` : undefined },
            { icon: Layers, label: 'Formato dominante', value: fmtCount ? mediaLabel(fmtCount[0]) : '—', sub: fmtCount ? `${fmtCount[1]} de ${rows.length}` : undefined },
            { icon: Link2, label: 'Destino mais usado', value: topHost ? topHost[0] : '—', sub: topHost ? `${topHost[1]} anúncio(s)` : undefined, title: 'Domínio do link de destino dos anúncios' },
          ]} />
          {/* lugar da estrutura de campanha por UTM (037 G) */}
        </> : <StatStrip items={[
          { icon: Megaphone, label: 'Anúncios ativos', value: fmtNum(rows.length), title: 'Fonte: Biblioteca de Anúncios da Meta (Brasil, ativos). Tempo no ar = desde a data de início informada pela biblioteca. A coleta semanal atualiza esta aba.' },
          { icon: Users, label: 'Concorrentes anunciando', value: `${advertising.length}/${collected.length}`, title: advertising.map((p) => names.get(p.id)?.c.data.name).join(', ') },
          { icon: Sparkles, label: 'Novos desde a coleta anterior', value: String(rows.filter((r) => r.isNew).length) },
          { icon: Timer, label: `No ar há ${PROVEN_DAYS}+ dias`, value: String(proven), sub: 'sinal de que dá resultado' },
          ...(fmtCount ? [{ icon: Layers, label: 'Formato mais usado', value: mediaLabel(fmtCount[0]), sub: `${fmtCount[1]} anúncio(s)` }] : []),
        ]} />}

        <FilterBar className="mt-4 mb-3"
          search={{ value: v.q, onChange: (x) => set({ q: x }), placeholder: 'Buscar no texto do anúncio…' }}
          primary={<>
            {!compId && <SelectField size="sm" aria-label="Concorrente" value={v.conc} options={concOpts} onChange={(x) => set({ conc: x })} />}
            {platforms.length > 1 && <SelectField size="sm" aria-label="Rede" value={v.rede} options={redeOpts} onChange={(x) => set({ rede: x })} />}
            {mediaTypes.length > 1 && <SelectField size="sm" aria-label="Formato" value={v.formato} options={formatoOpts} onChange={(x) => set({ formato: x })} />}
            <SelectField size="sm" aria-label="Ordenar" icon={<ArrowUpDown />} value={sort.k} options={sortOpts} placeholder={SORTS[sort.k]?.label} onChange={(x) => set({ ordem: x, asc: SORTS[x]?.text ? '1' : '' })} />
          </>}
          trailing={<>
            <FlagToggle on={!!v.novos} onChange={(x) => set({ novos: x ? '1' : '' })} icon={Sparkles} label="Só novos" title="Só os anúncios que não estavam na coleta anterior" />
            <ViewToggle value={v.vista} onChange={(x) => set({ vista: x })} options={[{ value: 'grade', label: 'Grade', icon: LayoutGrid }, { value: 'lista', label: 'Lista', icon: List }]} />
          </>}
          active={active} onClear={() => reset(['q', 'conc', 'rede', 'formato', 'novos'])} />

        {(semPagina.length > 0 || withErrors.length > 0) && (
          <div className="mb-3 space-y-0.5 text-xs">
            {semPagina.length > 0 && (
              <Tip content="Não há página de anunciante com esse nome na Biblioteca de Anúncios: em geral, não anunciam.">
                <p className="flex items-center gap-1.5 text-muted-foreground truncate"><Info className="size-3.5 shrink-0" />Sem anúncios na biblioteca: {semPagina.map((p) => names.get(p.id)?.c.data.name ?? p.id).join(', ')}</p>
              </Tip>
            )}
            {withErrors.length > 0 && (
              <Tip content={withErrors.map((p) => `${names.get(p.id)?.c.data.name ?? p.id}: ${p.cur!.errors[0]}`).join('\n\n')}>
                <p className="flex items-center gap-1.5 text-warning-ink truncate"><TriangleAlert className="size-3.5 shrink-0" />Coleta com erro (puxe de novo): {withErrors.map((p) => names.get(p.id)?.c.data.name ?? p.id).join(', ')}</p>
              </Tip>
            )}
          </div>
        )}
        {!shown.length && <div className="mt-6"><Empty title={rows.length ? 'Nada com esses filtros' : compId ? 'Sem anúncios na Biblioteca da Meta' : 'Nenhum anúncio ativo nos concorrentes coletados'} hint={!rows.length && compId ? 'Confira o link da página do Facebook em Editar.' : undefined} /></div>}
        {shown.length > 0 && (v.vista === 'lista'
          ? <DataTable rows={shown} cols={cols} colsKey="anuncios" rowKey={(r) => `${r.compId}/${r.id}`} sort={sort} fill={!compId} onSort={(k, dir) => set({ ordem: k, asc: dir === 1 ? '1' : '' })} />
                      : (compId ? (c: ReactNode) => <>{c}</> : (c: ReactNode) => <FillBox>{c}</FillBox>)(<div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
            {shown.map((r) => <AdCard key={`${r.compId}/${r.id}`} slug={slug} r={r} />)}
          </div>))}
      </>}
    </>);
}

function AdCard({ slug, r }: { slug: string; r: Row }) {
  const proven = (r.days ?? 0) >= PROVEN_DAYS;
  const title = (r.title ?? '').replace(/\{\{[^}]+\}\}/g, '').trim();
  const host = hostOf(r.linkUrl);
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
