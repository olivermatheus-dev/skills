// Redes: um perfil por linha (concorrente × rede) com as métricas de gestor: seguidores e variação, frequência de posts,
// mediana de views, engajamento por seguidor, formato que mais rende e último post. Filtro por rede; clique ordena.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCompetitorsFeed } from '../../queries';
import { AreaPage, Delta, SortTable, StatStrip, useMarket, type Col } from '../../components/competitors/area';
import { metricsOf, type ProfileMetrics } from '../../components/competitors/metrics';
import { Avatar, Chips, PlatformIcon, TYPE_LABEL, fmtPct, keyFor, median, platformLabel, timeAgo } from '../../components/competitors/lib';
import { Empty, ErrorBox, fmtNum } from '../../components/kit';
import { Heart, TrendingUp, Trophy, UserPlus, Users } from 'lucide-react';

type R = ProfileMetrics & { compId: string; compName: string; avatar: { local?: string; remote?: string | null } };
const dash = <span className="text-muted-foreground">—</span>;

export default function Redes() {
  const { slug = '' } = useParams();
  const feed = useCompetitorsFeed(slug);
  const m = useMarket(slug);
  const [platform, setPlatform] = useState('instagram');
  const all = useMemo<R[]>(() => {
    const byId = new Map(m.rows.map((r) => [r.c.data.id, r]));
    return (feed.data ?? []).flatMap((f) => {
      const mr = byId.get(f.id);
      return metricsOf(f.snapshots).filter((p) => p.platform !== 'site').map((p) => {
        const prof = mr?.c.data.profiles.find((x) => keyFor(x) === p.key);
        return { ...p, url: prof?.url, handle: prof?.handle ?? p.key.replace(/^[a-z]+-/, ''), compId: f.id, compName: mr?.c.data.name ?? f.id, avatar: mr?.avatar ?? {} };
      });
    });
  }, [feed.data, m.rows]);
  const platforms = [...new Set(all.map((r) => r.platform))];
  const plat = platforms.includes(platform) ? platform : '';
  const rows = all.filter((r) => !plat || r.platform === plat);
  const missing = m.rows.filter((r) => plat && !all.some((x) => x.compId === r.c.data.id && x.platform === plat));

  const cols: Col<R>[] = [
    { k: 'name', label: 'Concorrente', v: (r) => r.compName, className: 'min-w-44', render: (r) => (
      <Link to={`/p/${slug}/concorrentes/${r.compId}?aba=redes`} className="flex items-center gap-2 font-medium hover:text-primary-ink">
        <Avatar name={r.compName} size={22} local={r.avatar.local} remote={r.avatar.remote} className="!ring-0" />{r.compName}
      </Link>) },
    { k: 'handle', label: 'Perfil', v: (r) => r.handle, render: (r) => <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary-ink"><PlatformIcon platform={r.platform} size={13} />@{r.handle}</a> },
    { k: 'f', label: 'Seguidores', num: true, v: (r) => r.followers, render: (r) => r.followers != null ? <b>{fmtNum(r.followers)}</b> : dash },
    { k: 'd', label: 'Δ', num: true, title: 'vs coleta anterior', v: (r) => r.delta, render: (r) => <Delta n={r.delta} fmt={fmtNum} /> },
    { k: 'pw', label: 'Posts/sem', num: true, title: 'pelo intervalo entre o mais antigo e o mais novo da última coleta', v: (r) => r.perWeek, render: (r) => r.perWeek != null ? r.perWeek.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : dash },
    { k: 'mv', label: 'Mediana views', num: true, v: (r) => r.medViews, render: (r) => r.medViews != null ? fmtNum(Math.round(r.medViews)) : dash },
    { k: 'ml', label: 'Mediana ♥', num: true, v: (r) => r.medLikes, render: (r) => r.medLikes != null ? fmtNum(Math.round(r.medLikes)) : dash },
    { k: 'eng', label: 'Eng./seguidor', num: true, title: '(curtidas + comentários) ÷ seguidores, mediana dos posts', v: (r) => r.engFollowers, render: (r) => r.engFollowers != null ? fmtPct(r.engFollowers) : dash },
    { k: 'top', label: 'Formato que rende', v: (r) => r.topFormat?.type, render: (r) => r.topFormat ? <span title={`mediana ${fmtNum(r.topFormat.med)} ${r.topFormat.basis === 'views' ? 'views' : 'curtidas'}`}>{TYPE_LABEL[r.topFormat.type] ?? r.topFormat.type}</span> : dash },
    { k: 'n', label: 'Itens', num: true, title: 'conteúdos na última coleta', v: (r) => r.items, render: (r) => r.items },
    { k: 'last', label: 'Último post', num: true, v: (r) => r.lastPost, render: (r) => r.lastPost ? <span className="text-xs text-muted-foreground">{timeAgo(r.lastPost)}</span> : dash },
  ];

  const fs = rows.map((r) => r.followers).filter((v): v is number => v != null);
  const top = [...rows].sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))[0];
  const grower = [...rows].filter((r) => r.delta).sort((a, b) => b.delta! - a.delta!)[0];
  return (
    <AreaPage>
      <div className="mb-3 flex items-center gap-2">
        <Chips value={plat} onChange={setPlatform} options={[...platforms.map((p) => ({ value: p, label: <span className="inline-flex items-center gap-1"><PlatformIcon platform={p} size={12} />{platformLabel(p)}</span>, count: all.filter((r) => r.platform === p).length })), { value: '', label: 'Todas' }]} />
      </div>
      {rows.length > 0 && <div className="mb-4"><StatStrip items={[
        { icon: Users, label: 'Perfis', value: String(rows.length) },
        { icon: UserPlus, label: 'Seguidores (mediana)', value: fmtNum(median(fs)) },
        { icon: Trophy, label: 'Maior', value: top?.followers ? top.compName : '—', sub: top?.followers ? fmtNum(top.followers) : undefined },
        { icon: TrendingUp, label: 'Mais cresceu', value: grower ? grower.compName : '—', sub: grower ? `+${fmtNum(grower.delta)}` : 'precisa de 2 coletas' },
        { icon: Heart, label: 'Eng./seguidor (mediana)', value: fmtPct(median(rows.map((r) => r.engFollowers).filter((v): v is number => v != null))) },
      ]} /></div>}
      <ErrorBox error={feed.error ?? m.error} />
      {feed.isLoading && <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />}
      {feed.data && <SortTable fill rows={rows} cols={cols} rowKey={(r) => `${r.compId}/${r.key}`} initial={{ k: 'f', dir: -1 }}
        empty={<Empty title="Nenhum perfil coletado nessa rede" hint="Puxe as redes na aba Coletas." />} />}
      {missing.length > 0 && <div className="mt-3 text-xs text-muted-foreground">Sem coleta de {platformLabel(plat)}: {missing.map((r) => <Link key={r.c.data.id} to={`/p/${slug}/concorrentes/${r.c.data.id}`} className="hover:text-primary-ink mr-2">{r.c.data.name}</Link>)}</div>}
      {plat === 'instagram' && rows.length > 0 && <div className="mt-2 text-[11px] text-muted-foreground">Instagram sem token traz os 6 posts mais recentes: frequência e medianas valem para esse recorte. O histórico cresce com a coleta semanal.</div>}
    </AreaPage>
  );
}
