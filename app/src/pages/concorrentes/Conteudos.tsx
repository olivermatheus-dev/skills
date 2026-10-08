// Conteúdos: feed único com o que todos os concorrentes publicaram (última coleta de cada perfil), ranqueado por
// fora da curva (× perfil e × mercado), views, engajamento ou data. Marcar, favoritar e "Virar ideia" aqui mesmo.
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type ItemMark } from '../../api';
import { qk, useTags } from '../../queries';
import { AreaPage, StatStrip, useMarket } from '../../components/competitors/area';
import { ItemPanel } from '../../components/competitors/ficha/FichaPanel';
import { useFichasResumo } from '../../components/competitors/ficha/useFichas';
import ContentsView, { type CRow, type Owner } from '../../components/competitors/ContentsView';
import { TYPE_LABEL, fmtPct, median } from '../../components/competitors/lib';
import { useMarketRows } from '../../components/competitors/market';
import { useCompetitorActions } from '../../components/competitors/useCompetitorActions';
import { useMakeIdea } from '../../components/competitors/useMakeIdea';

import { Empty, ErrorBox, fmtNum } from '../../components/kit';
import { Clapperboard, Eye, Globe2, Heart, Trophy, User } from 'lucide-react';

export default function Conteudos() {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const market = useMarketRows(slug);
  const m = useMarket(slug);
  const tags = useTags(slug);
  const actions = useCompetitorActions(slug);
  const idea = useMakeIdea(slug);
  const fichas = useFichasResumo(slug);
  // gaveta aberta = ?item=<compId>/<mk> (o Panorama linka direto para um item)
  const [sp, setSp] = useSearchParams();
  const open = sp.get('item');
  const setOpen = (k: string | null, ideia?: boolean) => setSp((prev) => {
    const n = new URLSearchParams(prev);
    if (k) n.set('item', k); else n.delete('item');
    if (k && ideia) n.set('ideia', '1'); else n.delete('ideia');
    return n;
  }, { replace: true });
  const itemKey = (r: CRow) => `${r.compId}/${r.mk}`;

  const owners = useMemo(() => new Map<string, Owner>(m.rows.map((r) => [r.c.data.id, { name: r.c.data.name, local: r.avatar.local, remote: r.avatar.remote }])), [m.rows]);
  const rows = useMemo<CRow[]>(() => market.rows.map((r) => ({ ...r, compName: owners.get(r.compId)?.name ?? r.compId })), [market.rows, owners]);

  const mark = (r: CRow, patch: Partial<ItemMark>) => { actions.mark(r.compId!, r.mk, patch).catch(() => {}).finally(() => qc.invalidateQueries({ queryKey: qk.competitorsFeed(slug) })); };
  const openRow = (open && rows.find((r) => itemKey(r) === open)) || null;
  const tagSuggestions = (tags.data?.tags ?? []).map((t) => t.id);

  const summary = (shown: CRow[]) => {
    const views = shown.map((r) => r.item.metrics.views).filter((v): v is number => !!v);
    const medV = median(views);
    const types = [...new Set(shown.map((r) => r.item.type))];
    const byType = types.map((t) => ({ t, n: shown.filter((r) => r.item.type === t).length, med: median(shown.filter((r) => r.item.type === t).map((r) => r.item.metrics.views).filter((v): v is number => !!v)) })).filter((x) => x.n);
    const bestType = [...byType].sort((a, b) => (b.med ?? 0) - (a.med ?? 0))[0];
    return (
      <StatStrip items={[
        { icon: Clapperboard, label: 'Conteúdos', value: fmtNum(shown.length), sub: `de ${new Set(shown.map((r) => r.compId)).size} concorrente(s)` },
        { icon: Eye, label: 'Mediana de views', value: fmtNum(medV != null ? Math.round(medV) : undefined) },
        { icon: Heart, label: 'Engajamento (mediana)', value: fmtPct(median(shown.map((r) => r.engagement).filter((x): x is number => x != null))), title: '(curtidas + comentários + envios) ÷ views' },
        { icon: User, label: 'Fora da curva ≥3× perfil', value: String(shown.filter((r) => (r.outlier ?? 0) >= 3).length), title: 'views ÷ mediana do próprio perfil na última coleta (sem views: curtidas)' },
        { icon: Globe2, label: 'Fora da curva ≥3× mercado', value: String(shown.filter((r) => (r.outlierMercado ?? 0) >= 3).length), title: 'views ÷ mediana dos concorrentes na mesma rede e formato (formato com menos de 10 itens: rede inteira)' },
        ...(bestType && byType.length > 1 ? [{ icon: Trophy, label: 'Formato que mais rende', value: TYPE_LABEL[bestType.t] ?? bestType.t, sub: `mediana ${fmtNum(bestType.med)} views` }] : []),
      ]} />
    );
  };

  return (
    <AreaPage>
      <ErrorBox error={idea.error} />
      {market.loading && <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">{[0, 1, 2, 3].map((i) => <div key={i} className="h-80 rounded-xl bg-card border border-border animate-pulse" />)}</div>}
      {!market.loading && !rows.length && <Empty title="Nenhum conteúdo coletado" hint="Puxe as redes dos concorrentes (aba Coletas ou a ficha de cada um)." />}
      {rows.length > 0 && (
        <ContentsView rows={rows} slug={slug} owners={owners} showComp fill panel summary={summary} fichaOf={(r) => fichas.of(r.compId, r.mk)}
          mediaOf={(r) => api.mediaUrl(slug, r.compId!, r.item.thumbnailLocal)} ideaBusy={(r) => idea.busy === r.mk}
          onMark={mark} onOpen={(r, ideia) => setOpen(itemKey(r), ideia)} onIdea={(r) => idea.make({ id: r.compId!, name: r.compName! }, '', r)} />
      )}

      <ItemPanel compId={openRow?.compId} r={openRow} open={!!openRow} focusIdea={sp.get('ideia') === '1'} onClose={() => setOpen(null)} slug={slug} media={api.mediaUrl(slug, openRow?.compId ?? '', openRow?.item.thumbnailLocal)}
        profileLabel={openRow?.compName ?? ''} tagSuggestions={tagSuggestions} ideaBusy={!!openRow && idea.busy === openRow.mk}
        onMark={(patch) => openRow && mark(openRow, patch)}
        onIdea={(title, tg, note, extra) => openRow && idea.make({ id: openRow.compId!, name: openRow.compName! }, '', openRow, title, tg, note, extra)} />
    </AreaPage>
  );
}
