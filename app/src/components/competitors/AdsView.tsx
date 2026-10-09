// AdsView (era a página Anúncios): o que os concorrentes estão anunciando agora (Biblioteca de Anúncios da Meta, página pública, sem login).
// Ordena por tempo no ar (anúncio que roda há muito tempo é o que está dando resultado), marca os novos desde a coleta
// anterior e filtra por concorrente, formato e plataforma. Grade de cards ou tabela. "Puxar" busca de novo (script, grátis).
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, BadgePercent, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Clapperboard, Funnel, Target, Tag, LogOut, GalleryHorizontal, Image as ImageIcon, Layers, List, LayoutGrid, CalendarClock, Info, Link2, Megaphone, RefreshCw, ScanSearch, Share2, Shapes, Sparkles, Timer, TriangleAlert, Users } from 'lucide-react';
import { api, type Ad, type AdMark, type AdMarkPatch, type AnuncioHistorico, type Classificacao, type FichaResumo } from '../../api';
import { adKey, fichaKeyDeAd, resolverCampo, type AdCampo } from '../../../../schema/ads-marks';
import type { FichaAnuncioIa } from '../../../../core/fichas';
import { qk, useAds, useAdsClassified, useAdsHistories, useAdsMarks, useSetAdMark } from '../../queries';
import { FillBox, StatStrip, useMarket } from './area';
import { Avatar, Img, PlatformIcon, Spinner, platformLabel } from '../../components/competitors/lib';
import { DataTable, FilterBar, FlagToggle, Tip, ViewToggle, parseSort, sortRows, useUrlState, type Col, type SortDef } from '../../components/competitors/toolbar';
import { toast } from '../../components/toast';
import { ChipDestino, ChipFunil, ChipObjetivo, ChipOferta, ChipTipo, DESTINO, FUNIL, OBJETIVO, OFERTA_TIPO, PROVADO_DIAS, STATUS, StatusBadge, TIPO, sinalResultado, statusDe, type StatusAd, type Voce } from './AdChips';
import { AdPanel } from './AdPanel';
import { AnalyzedBadge } from './Items';
import { useFichasResumo } from './ficha/useFichas';
import { useFichasFila } from './ficha/useFila';
import { FilaFaixa } from './ficha/Selecao';
import { Button, Empty, ErrorBox, SelectField, cx, fmtDate, fmtNum, type SelectOption } from '../../components/kit';
import { useColetas } from '../atividade/useColeta';

type Row = Ad & {
  compId: string; compName: string; isNew: boolean; days?: number;
  /** classificação das regras (só anúncios ativos da última coleta) */
  c?: Classificacao; hist?: AnuncioHistorico;
  /** mesmo texto+título no mesmo concorrente = mesmo conceito (vazio = não agrupa) */
  gk: string; status: StatusAd; sinal: number; gone?: boolean;
  /** o que as regras dizem (sem a correção do Oliver) e a marca dele (nota, tags, salvo, override) */
  auto?: Classificacao; mark?: AdMark;
  /** ficha de análise (040 G): o selo e o que a IA disse de funil/tipo/objetivo (vale entre a regra e a correção do Oliver) */
  ficha?: FichaResumo; ia?: FichaAnuncioIa;
  /** não está na coleta: veio da cópia guardada ao salvar */
  fromCopy?: boolean;
};
/** linha da lista: o anúncio-pai do conceito (kids = versões escondidas) ou uma versão exibida embaixo dele (child) */
type Item = Row & { kids: number; child: boolean };
const normKey = (a: Ad) => `${a.text ?? ''}|${a.title ?? ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const STATUS_ORDER = Object.keys(STATUS);
const MEDIA = { imagem: 'Imagem', video: 'Vídeo', carrossel: 'Carrossel', desconhecido: 'Outro' } as const;
const MEDIA_ICON: Record<string, React.ReactNode> = { imagem: <ImageIcon />, video: <Clapperboard />, carrossel: <GalleryHorizontal />, desconhecido: <Shapes /> };
const PROVEN_DAYS = PROVADO_DIAS;
/** anúncio de catálogo (DPA) vem com o modelo {{product.brand}} no lugar do texto */
const adText = (t?: string | null) => { const x = (t ?? '').replace(/\{\{[^}]+\}\}/g, '').trim(); return x || (t?.includes('{{') ? 'Catálogo (texto dinâmico)' : ''); };
const daysSince = (d?: string | null) => (d ? Math.max(0, Math.floor((Date.now() - Date.parse(d)) / 86_400_000)) : undefined);
const hostOf = (u?: string | null) => { try { return u ? new URL(u).hostname.replace(/^www\./, '') : null; } catch { return null; } };
const mediaLabel = (t: string) => MEDIA[t as keyof typeof MEDIA] ?? t;

/** ordenações: tempo no ar (padrão), mais novos, variações e concorrente na barra; o resto só no cabeçalho da tabela */
const SORTS: Record<string, SortDef<Row> & { bar?: boolean }> = {
  tempo: { label: 'Mais tempo no ar', get: (r) => r.days, bar: true },
  recentes: { label: 'Mais novos', get: (r) => (r.startedAt ? Date.parse(r.startedAt) : undefined), bar: true },
  sinal: { label: 'Sinal de resultado', get: (r) => r.sinal, bar: true },
  variacoes: { label: 'Mais variações', get: (r) => r.variations ?? 0, bar: true },
  concorrente: { label: 'Concorrente (A–Z)', get: (r) => r.compName.toLowerCase(), text: true, bar: true },
  texto: { label: 'Texto', get: (r) => adText(r.text).toLowerCase(), text: true },
  formato: { label: 'Formato', get: (r) => mediaLabel(r.media.type), text: true },
  cta: { label: 'CTA', get: (r) => r.cta?.toLowerCase(), text: true },
  dominio: { label: 'Domínio', get: (r) => hostOf(r.linkUrl) ?? undefined, text: true },
  plataformas: { label: 'Plataformas', get: (r) => r.platforms.length },
  status: { label: 'Status', get: (r) => STATUS_ORDER.indexOf(r.status) },
  funil: { label: 'Funil', get: (r) => (r.c ? ['topo', 'meio', 'fundo'].indexOf(r.c.funil) : undefined) },
  tipo: { label: 'Tipo', get: (r) => (r.c ? TIPO[r.c.tipo] : undefined), text: true },
  objetivo: { label: 'Objetivo', get: (r) => (r.c ? OBJETIVO[r.c.objetivo] : undefined), text: true },
  oferta: { label: 'Oferta', get: (r) => (r.c?.oferta.tem ? r.c.oferta.precoBRL ?? 0 : undefined) },
  destino: { label: 'Destino', get: (r) => (r.c ? DESTINO[r.c.destino.kind] : undefined), text: true },
};
/** valor final de cada campo, na ordem fixa: correção do Oliver > análise da IA (ficha) > regra. Sem nenhum dos dois devolve a classificação como veio */
function resolver(rule: Classificacao, mark?: AdMark, ia?: FichaAnuncioIa): Classificacao {
  if (!mark?.override && !ia) return rule;
  const r = (k: AdCampo) => resolverCampo(k, rule[k] as string, mark, ia?.[k]);
  const f = r('funil'), t = r('tipo'), o = r('objetivo');
  const conf = (x: { origem: string }, k: AdCampo) => (x.origem === 'regra' ? rule.confiancaCampos[k] : 1);
  return { ...rule, funil: f.valor as Classificacao['funil'], tipo: t.valor as Classificacao['tipo'], objetivo: o.valor as Classificacao['objetivo'],
    confiancaCampos: { funil: conf(f, 'funil'), tipo: conf(t, 'tipo'), objetivo: conf(o, 'objetivo') } };
}
const ROTULO: Record<AdCampo, Record<string, string>> = { funil: FUNIL, tipo: TIPO, objetivo: OBJETIVO };
/** chip de origem do campo: "você" (correção), "IA" (análise da ficha) ou nada (regra) */
const voceDe = (r: Row, k: AdCampo): Voce => {
  if (!r.auto) return undefined;
  const { origem } = resolverCampo(k, r.auto[k] as string, r.mark, r.ia?.[k]);
  if (origem === 'regra') return undefined;
  return { auto: ROTULO[k][r.auto[k]], origem, ...(origem === 'ia' && r.ia?.motivo?.[k] ? { motivo: r.ia.motivo[k] } : {}) };
};
const diasEntre = (de?: string | null, ate?: string | null) => (de && ate ? Math.max(0, Math.floor((Date.parse(ate) - Date.parse(de)) / 86_400_000)) : undefined);
const DEFAULTS = { q: '', conc: '', rede: '', formato: '', funil: '', tipo: '', obj: '', oferta: '', novos: '', saiu: '', salvos: '', vista: 'grade', ordem: 'tempo', asc: '' };

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
  const coleta = useColetas(slug); // coleta de anúncios rodando no servidor (046 C), mesmo disparada em outra tela
  const puxando = (id: string) => one === id || !!coleta('anuncios', id);

  const names = useMemo(() => new Map(m.rows.map((r) => [r.c.data.id, r])), [m.rows]);
  const per = (ads.data ?? []).filter((a) => !compId || a.id === compId).map((a) => {
    const cur = a.history.at(-1)?.data, prev = a.history.at(-2)?.data;
    const prevIds = new Set(prev?.ads.map((x) => x.id) ?? []);
    return { id: a.id, cur, prev, newN: prev && cur ? cur.ads.filter((x) => !prevIds.has(x.id)).length : 0, prevIds };
  });
  const cls = useAdsClassified(slug);
  const clsOf = new Map((cls.data ?? []).flatMap((k) => k.ads.map((a) => [`${k.id}/${a.adId}`, a] as const)));
  const marksQ = useAdsMarks(slug);
  const fichasQ = useFichasResumo(slug);
  const fila = useFichasFila(slug);
  const setMark = useSetAdMark(slug);
  const onMark = (cid: string, adId: string, patch: AdMarkPatch) => void setMark(cid, adId, patch).catch(() => { /* o toast já avisou e o cache voltou */ });
  const [openKey, setOpenKey] = useState<string | null>(null);
  const histQ = useAdsHistories(slug, per.map((p) => p.id));
  const histOf = new Map(per.map((p, i) => [p.id, new Map((histQ[i]?.data?.ads ?? []).map((h) => [h.id, h]))] as const));
  const mk = (x: Ad, p: (typeof per)[number], extra: Partial<Row> = {}): Row => {
    const auto = clsOf.get(`${p.id}/${x.id}`), hist = histOf.get(p.id)?.get(x.id);
    const mark = marksQ.data?.[p.id]?.[adKey(x.id)];
    const ficha = fichasQ.of(p.id, fichaKeyDeAd(x.id)), ia = ficha?.analisada ? ficha.anuncio : undefined;
    const c = auto && resolver(auto, mark, ia);
    const days = daysSince(x.startedAt);
    const base = normKey(x);
    return { ...x, compId: p.id, compName: names.get(p.id)?.c.data.name ?? p.id, isNew: !!p.prev && !p.prevIds.has(x.id), days, c, auto, mark, ficha, ia, hist, gk: base.replace('|', '') ? `${p.id}|${base}` : '',
      status: statusDe(days, false), sinal: sinalResultado({ dias: days, irmaos: c?.sinais.irmaos ?? 1, variacoes: x.variations, coletas: hist?.coletas, reapareceu: hist?.reapareceu }), ...extra };
  };
  const rows: Row[] = per.flatMap((p) => (p.cur?.ads ?? []).filter((x) => x.active).map((x) => mk(x, p)));
  // anúncios que a última coleta completa mostrou fora do ar (precisam do histórico; os dados vêm da coleta em que ainda estavam)
  const gone: Row[] = per.flatMap((p) => [...histOf.get(p.id)?.values() ?? []].filter((h) => h.saiuDoAr).flatMap((h) => {
    const ad = [...(ads.data?.find((a) => a.id === p.id)?.history ?? [])].reverse().flatMap((s) => s.data.ads).find((x) => x.id === h.id);
    return ad ? [mk(ad, p, { gone: true, isNew: false, hist: h, days: h.duracaoFinal ?? undefined, status: statusDe(h.duracaoFinal, true), sinal: sinalResultado({ dias: h.duracaoFinal, irmaos: 1, variacoes: ad.variations, coletas: h.coletas, reapareceu: h.reapareceu }) })] : [];
  }));
  // salvos que já não estão na coleta nem no histórico de saídas (coleta truncada, por exemplo): abrem pela cópia guardada
  const known = new Set([...rows, ...gone].map((r) => `${r.compId}/${r.id}`));
  const copies: Row[] = per.flatMap((p) => Object.values(marksQ.data?.[p.id] ?? {}).flatMap((m) => {
    if (!m.saved || !m.frozen || known.has(`${p.id}/${m.frozen.id}`)) return [];
    const h = histOf.get(p.id)?.get(m.frozen.id), days = h?.duracaoFinal ?? diasEntre(m.frozen.startedAt, h?.saiuEm ?? m.savedAt);
    return [mk(m.frozen, p, { gone: true, fromCopy: true, isNew: false, hist: h, days, status: statusDe(days, true), sinal: sinalResultado({ dias: days, irmaos: 1, variacoes: m.frozen.variations, coletas: h?.coletas, reapareceu: h?.reapareceu }) })];
  }));
  const allRows = [...rows, ...gone, ...copies];
  const savedRows = allRows.filter((r) => r.mark?.saved);
  const pool = v.salvos ? savedRows.filter((r) => !v.saiu || r.gone) : v.saiu ? gone : rows;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggleOpen = (gk: string) => setOpen((o) => { const n = new Set(o); if (n.has(gk)) n.delete(gk); else n.add(gk); return n; });
  const sort = parseSort(Object.hasOwn(SORTS, v.ordem) ? v.ordem : 'tempo', v.asc);
  const q = v.q.toLowerCase();
  // um filtro só para a lista e para as contagens dos selects (skip = o próprio select, contado como se estivesse vazio)
  type Skip = 'conc' | 'rede' | 'formato' | 'funil' | 'tipo' | 'obj' | 'oferta';
  const ofertaOk = (r: Row) => !v.oferta || (!!r.c && (v.oferta === 'com' ? r.c.oferta.tem : v.oferta === 'sem' ? !r.c.oferta.tem : r.c.oferta.tipos.includes(v.oferta as never)));
  const passes = (r: Row, skip?: Skip) => (compId || skip === 'conc' || !v.conc || r.compId === v.conc)
    && (skip === 'formato' || !v.formato || r.media.type === v.formato) && (skip === 'rede' || !v.rede || r.platforms.includes(v.rede)) && (!v.novos || r.isNew)
    && (skip === 'funil' || !v.funil || r.c?.funil === v.funil) && (skip === 'tipo' || !v.tipo || r.c?.tipo === v.tipo)
    && (skip === 'obj' || !v.obj || r.c?.objetivo === v.obj) && (skip === 'oferta' || ofertaOk(r))
    && (!q || `${r.text ?? ''} ${r.title ?? ''} ${r.compName}`.toLowerCase().includes(q));
  const shown = sortRows(pool.filter((r) => passes(r)), SORTS, sort);
  const countBy = (skip: Skip, keys: (r: Row) => string[]) => {
    const m = new Map<string, number>();
    for (const r of pool) if (passes(r, skip)) for (const k of keys(r)) m.set(k, (m.get(k) ?? 0) + 1);
    return m;
  };
  const nConc = countBy('conc', (r) => [r.compId]), nRede = countBy('rede', (r) => r.platforms), nFormato = countBy('formato', (r) => [r.media.type]);
  const nFunil = countBy('funil', (r) => (r.c ? [r.c.funil] : [])), nTipo = countBy('tipo', (r) => (r.c ? [r.c.tipo] : [])), nObj = countBy('obj', (r) => (r.c ? [r.c.objetivo] : []));
  const nOferta = countBy('oferta', (r) => (r.c ? [r.c.oferta.tem ? 'com' : 'sem', ...r.c.oferta.tipos] : []));
  // conceitos: a mesma criação repetida (texto e título iguais) vira um card só, com as versões escondidas ("+N variações")
  const parents = new Map<string, Row>(), kidsOf = new Map<string, Row[]>();
  const items: Item[] = [];
  for (const r of shown) {
    const p = r.gk ? parents.get(r.gk) : undefined;
    if (p) kidsOf.get(r.gk)!.push(r); else { if (r.gk) { parents.set(r.gk, r); kidsOf.set(r.gk, []); } items.push({ ...r, kids: 0, child: false }); }
  }
  for (const it of items) if (it.gk) it.kids = kidsOf.get(it.gk)?.length ?? 0;
  // "Analisar": os 10 primeiros da lista (ordem e filtros de agora, um por conceito) que ainda não têm análise nem estão na fila; só grava o pedido
  const paraAnalisar = items.filter((r) => !r.child && !r.gone && !r.ficha?.analisada && !r.ficha?.naFila).slice(0, 10);
  const list: Item[] = items.flatMap((it) => (it.kids && open.has(it.gk) ? [it, ...kidsOf.get(it.gk)!.map((k) => ({ ...k, kids: 0, child: true }))] : [it]));
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
  const concOpts: SelectOption[] = [{ value: '', label: 'Todos os concorrentes', icon: <Users />, count: rows.filter((r) => passes(r, 'conc')).length }, ...per.flatMap((p) => {
    const mr = names.get(p.id);
    if (!mr || mr.c.data.kind !== 'concorrente') return [];
    return [{ value: p.id, label: mr.c.data.name, icon: <Avatar name={mr.c.data.name} size={16} local={mr.avatar.local} remote={mr.avatar.remote} className="!ring-0" />, count: nConc.get(p.id) ?? 0, disabled: p.id !== v.conc && !nConc.get(p.id) }];
  })];
  const redeOpts: SelectOption[] = [{ value: '', label: 'Todas as redes', icon: <Share2 /> }, ...platforms.map((p) => ({ value: p, label: platformLabel(p), icon: <PlatformIcon platform={p} size={16} />, count: nRede.get(p) ?? 0, disabled: p !== v.rede && !nRede.get(p) }))];
  const formatoOpts: SelectOption[] = [{ value: '', label: 'Todos os formatos', icon: <Shapes /> }, ...mediaTypes.map((t) => ({ value: t, label: mediaLabel(t), icon: MEDIA_ICON[t], count: nFormato.get(t) ?? 0, disabled: t !== v.formato && !nFormato.get(t) }))];
  const vocab = (all: string, icon: ReactNode, labels: Record<string, string>, cnt: Map<string, number>, cur: string, skip: string[] = []): SelectOption[] => [{ value: '', label: all, icon }, ...Object.entries(labels).filter(([k]) => !skip.includes(k)).map(([k, l]) => ({ value: k, label: l, count: cnt.get(k) ?? 0, disabled: k !== cur && !cnt.get(k) }))];
  const funilOpts = vocab('Todos os funis', <Funnel />, FUNIL, nFunil, v.funil);
  const tipoOpts = vocab('Todos os tipos', <Tag />, TIPO, nTipo, v.tipo);
  const objOpts = vocab('Todos os objetivos', <Target />, OBJETIVO, nObj, v.obj);
  const ofertaOpts: SelectOption[] = [{ value: '', label: 'Com ou sem oferta', icon: <BadgePercent /> }, { value: 'com', label: 'Com oferta', count: nOferta.get('com') ?? 0, disabled: v.oferta !== 'com' && !nOferta.get('com') }, { value: 'sem', label: 'Sem oferta', count: nOferta.get('sem') ?? 0, disabled: v.oferta !== 'sem' && !nOferta.get('sem') },
    ...Object.entries(OFERTA_TIPO).map(([k, l]) => ({ value: k, label: l, count: nOferta.get(k) ?? 0, disabled: v.oferta !== k && !nOferta.get(k), group: 'Tipo de oferta' }))];
  const sortOpts: SelectOption[] = Object.entries(SORTS).filter(([, d]) => d.bar).map(([value, d]) => ({ value, label: d.label }));
  const active = !!(v.q || v.conc || v.rede || v.formato || v.funil || v.tipo || v.obj || v.oferta || v.novos || v.saiu || v.salvos);

  const dash = <span className="text-muted-foreground">—</span>;
  const cols: Col<Item>[] = [
    { k: 'thumb', label: '', width: '60px', pin: 'left', render: (r) => (
      <span className="block size-11 rounded-md overflow-hidden bg-muted">
        <Img local={thumbOf(r)} remote={r.media.thumbnail} className="size-full object-cover" fallback={<div className="size-full grid place-items-center text-muted-foreground"><Megaphone className="size-4" /></div>} />
      </span>
    ) },
    { k: 'salvo', label: '', width: '40px', pin: 'left', render: (r) => <SaveBtn on={!!r.mark?.saved} onClick={() => onMark(r.compId, r.id, { saved: !r.mark?.saved })} /> },
    { k: 'comp', label: 'Concorrente', sort: 'concorrente', render: (r) => {
      const mr = names.get(r.compId);
      return <Link to={`/p/${slug}/concorrentes/${r.compId}`} className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-primary-ink"><Avatar name={r.compName} size={18} local={mr?.avatar.local} remote={mr?.avatar.remote} className="!ring-0" />{r.compName}</Link>;
    } },
    { k: 'funil', label: 'Funil', sort: 'funil', desc: true, title: 'temperatura do público: topo (frio), meio, fundo (pede a decisão)', render: (r) => r.c ? <ChipFunil c={r.c} voce={voceDe(r, 'funil')} /> : dash },
    { k: 'tipo', label: 'Tipo', sort: 'tipo', render: (r) => r.c ? <ChipTipo c={r.c} voce={voceDe(r, 'tipo')} /> : dash },
    { k: 'objetivo', label: 'Objetivo', sort: 'objetivo', title: 'palpite pelo botão e pelo destino (o objetivo real da campanha não é público)', render: (r) => r.c ? <ChipObjetivo c={r.c} voce={voceDe(r, 'objetivo')} /> : dash },
    { k: 'oferta', label: 'Oferta', sort: 'oferta', desc: true, render: (r) => r.c?.oferta.tem ? <ChipOferta c={r.c} /> : dash },
    { k: 'texto', label: 'Gancho / texto', sort: 'texto', width: '220px', render: (r) => {
      const t = adText(r.text), title = (r.title ?? '').replace(/\{\{[^}]+\}\}/g, '').trim();
      const full = [title, t].filter(Boolean).join('\n\n');
      return <span className={cx('flex items-center gap-1.5', r.child && 'pl-4')}>
        <Tip content={full || undefined}><span className={cx('block max-w-[200px] truncate', !r.text?.replace(/\{\{[^}]+\}\}/g, '').trim() && 'text-muted-foreground italic')}>{t || title || '—'}</span></Tip>
        {r.kids > 0 && <KidsToggle n={r.kids} open={open.has(r.gk)} onClick={() => toggleOpen(r.gk)} />}
      </span>;
    } },
    { k: 'formato', label: 'Formato', sort: 'formato', className: 'whitespace-nowrap', render: (r) => mediaLabel(r.media.type) },
    { k: 'destino', label: 'Destino', sort: 'destino', render: (r) => r.c ? <ChipDestino c={r.c} /> : dash },
    { k: 'cta', label: 'CTA', sort: 'cta', render: (r) => r.cta ? <span className="block max-w-[130px] truncate px-1.5 py-0.5 rounded bg-muted text-xs" title={r.cta}>{r.cta}</span> : <span className="text-muted-foreground">—</span> },
    { k: 'dominio', label: 'Link', sort: 'dominio', render: (r) => {
      const h = hostOf(r.linkUrl);
      return h ? <a href={r.linkUrl!} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="block max-w-[130px] truncate text-primary-ink hover:underline" title={r.linkUrl!}>{h}</a> : <span className="text-muted-foreground">—</span>;
    } },
    { k: 'inicio', label: 'Início', sort: 'recentes', desc: true, className: 'whitespace-nowrap', title: 'início da veiculação', render: (r) => r.startedAt ? fmtDate(r.startedAt) : '—' },
    { k: 'variacoes', label: 'Variações', optional: true, off: true, sort: 'variacoes', num: true, title: 'anúncios que usam este criativo e texto', render: (r) => (r.variations ?? 0) > 1 ? fmtNum(r.variations ?? 0) : <span className="text-muted-foreground">1</span> },
    { k: 'plataformas', label: 'Onde roda', optional: true, sort: 'plataformas', desc: true, render: (r) => <span className="inline-flex gap-1">{r.platforms.map((p) => <span key={p} title={platformLabel(p)}><PlatformIcon platform={p} size={14} /></span>)}</span> },
    { k: 'sinal', label: 'Sinal', width: '72px', pin: 'right', sort: 'sinal', num: true, title: 'sinal de resultado 0–100 (indireto): tempo no ar, versões do conceito, persistência entre coletas', render: (r) => <span className="tabular-nums">{r.sinal}</span> },
    { k: 'dias', label: 'Dias no ar', width: '96px', pin: 'right', sort: 'tempo', num: true, title: 'desde o início informado pela biblioteca (anúncio que saiu: dias até sair)', render: (r) => r.days != null ? <span className={cx('tabular-nums', (r.days ?? 0) >= PROVEN_DAYS ? 'font-semibold text-amber-700' : '')}>{r.days}</span> : '—' },
    { k: 'status', label: 'Status', width: '112px', pin: 'right', sort: 'status', desc: true, render: (r) => <span className="inline-flex items-center gap-1"><StatusBadge status={r.status} sinal={r.sinal} extra={statusExtra(r)} />{r.isNew && <span className="text-[11px] font-semibold rounded px-1.5 py-0.5 bg-success/15 text-success-ink">Novo</span>}</span> },
  ];

  /** a miniatura guardada no repositório (salvos) vence a de media/, que não vai para o git */
  const thumbOf = (r: Row) => (r.mark?.frozenMedia ? api.adSalvoUrl(slug, r.compId, r.mark.frozenMedia) : api.mediaUrl(slug, r.compId, r.media.thumbnailLocal ?? undefined));
  const openRow = openKey ? allRows.find((r) => `${r.compId}/${r.id}` === openKey) : undefined;
  const pullChip = (id: string) => (
    <Button variant="ghost" onClick={() => pullOne(id)} disabled={puxando(id) || !!pulling} title={`Puxar só os anúncios de ${names.get(id)?.c.data.name}`}>{puxando(id) ? <Spinner /> : <RefreshCw className="size-3.5" />} {names.get(id)?.c.data.name}</Button>
  );

  return shell(<>
      {!compId && v.conc && pullChip(v.conc)}
      <Button variant="ai-soft" className="inline-flex items-center gap-1.5 whitespace-nowrap border border-ai-border" disabled={!paraAnalisar.length || fila.pedir.isPending}
        title="Põe na fila de análise da IA os 10 primeiros da lista (pela ordem e pelos filtros de agora) que ainda não têm análise. Só grava o pedido: rode pela faixa “Rodar agora” ou com “roda a fila de fichas” no Claude Code (≈ US$ 0,08 por anúncio)."
        onClick={() => fila.pedir.mutate({ itens: paraAnalisar.map((r) => ({ comp: r.compId, key: fichaKeyDeAd(r.id) })), origem: 'top', n: paraAnalisar.length, rodar: false })}>
        {fila.pedir.isPending ? <Spinner /> : <ScanSearch className="size-3.5" />}Analisar {paraAnalisar.length ? `os ${paraAnalisar.length} primeiros` : 'anúncios'}
      </Button>
      <Button variant="ghost" className="inline-flex items-center gap-1.5 whitespace-nowrap" onClick={compId ? () => pullOne(compId) : pullAll} disabled={!!pulling || (!!compId && puxando(compId))} title={compId ? 'Busca os anúncios deste concorrente na Biblioteca de Anúncios da Meta' : 'Busca na Biblioteca de Anúncios da Meta, um concorrente por vez'}>{pulling ? <><Spinner /> {pulling.i}/{pulling.n} {pulling.name}</> : compId && puxando(compId) ? <><Spinner /> {coleta('anuncios', compId)?.passo ?? 'Puxando anúncios'}</> : <><RefreshCw className="size-3.5" />Puxar anúncios</>}</Button>
    </>, <>
      <ErrorBox error={ads.error} />
      {ads.isLoading && <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />}
      {ads.data && !collected.length && (
        <Empty title={compId ? 'Anúncios ainda não puxados' : 'Nenhuma coleta de anúncios ainda'} hint={compId ? 'Clique em “Puxar anúncios” para buscar na Biblioteca de Anúncios da Meta (página pública, sem login).' : "Busca os anúncios ativos de cada concorrente na Biblioteca de Anúncios da Meta (página pública, sem login). Também roda sozinha na coleta semanal."}
          action={<Button onClick={compId ? () => pullOne(compId) : pullAll} disabled={!!pulling}>{pulling ? <><Spinner /> {pulling.i}/{pulling.n}</> : <><RefreshCw className="size-3.5" />Puxar anúncios de todos</>}</Button>} />
      )}
      {collected.length > 0 && <>
        <FilaFaixa fila={fila} />
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
            <SelectField size="sm" aria-label="Funil" icon={<Funnel />} value={v.funil} options={funilOpts} onChange={(x) => set({ funil: x })} />
            <SelectField size="sm" aria-label="Tipo" icon={<Tag />} value={v.tipo} options={tipoOpts} onChange={(x) => set({ tipo: x })} />
            <SelectField size="sm" aria-label="Ordenar" icon={<ArrowUpDown />} value={sort.k} options={sortOpts} placeholder={SORTS[sort.k]?.label} onChange={(x) => set({ ordem: x, asc: SORTS[x]?.text ? '1' : '' })} />
          </>}
          secondary={[
            { label: 'Objetivo', active: !!v.obj, node: <SelectField size="sm" aria-label="Objetivo" icon={<Target />} value={v.obj} options={objOpts} onChange={(x) => set({ obj: x })} /> },
            { label: 'Oferta', active: !!v.oferta, node: <SelectField size="sm" aria-label="Oferta" icon={<BadgePercent />} value={v.oferta} options={ofertaOpts} onChange={(x) => set({ oferta: x })} /> },
            ...(platforms.length > 1 ? [{ label: 'Rede', active: !!v.rede, node: <SelectField size="sm" aria-label="Rede" value={v.rede} options={redeOpts} onChange={(x) => set({ rede: x })} /> }] : []),
            ...(mediaTypes.length > 1 ? [{ label: 'Formato', active: !!v.formato, node: <SelectField size="sm" aria-label="Formato" value={v.formato} options={formatoOpts} onChange={(x) => set({ formato: x })} /> }] : []),
          ]}
          trailing={<>
            {gone.length > 0 && <FlagToggle on={!!v.saiu} onChange={(x) => set({ saiu: x ? '1' : '' })} icon={LogOut} tone="amber" label="Saíram do ar" title="Só os anúncios que sumiram numa coleta completa (perdeu = saiu com menos de 30 dias; encerrado = 30+)" />}
            {(savedRows.length > 0 || !!v.salvos) && <FlagToggle on={!!v.salvos} onChange={(x) => set({ salvos: x ? '1' : '' })} icon={Bookmark} tone="violet" label={`Salvos ${savedRows.length}`} title="Só os anúncios que você salvou. Salvo guarda uma cópia: continua abrindo mesmo se sair do ar." />}
            <FlagToggle on={!!v.novos} onChange={(x) => set({ novos: x ? '1' : '' })} icon={Sparkles} label="Só novos" title="Só os anúncios que não estavam na coleta anterior" />
            <ViewToggle value={v.vista} onChange={(x) => set({ vista: x })} options={[{ value: 'grade', label: 'Grade', icon: LayoutGrid }, { value: 'lista', label: 'Lista', icon: List }]} />
          </>}
          active={active} onClear={() => reset(['q', 'conc', 'rede', 'formato', 'funil', 'tipo', 'obj', 'oferta', 'novos', 'saiu', 'salvos'])} />

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
        {!shown.length && <div className="mt-6"><Empty title={pool.length ? 'Nada com esses filtros' : compId ? 'Sem anúncios na Biblioteca da Meta' : 'Nenhum anúncio ativo nos concorrentes coletados'} hint={!rows.length && compId ? 'Confira o link da página do Facebook em Editar.' : undefined} /></div>}
        {shown.length > 0 && (v.vista === 'lista'
          ? <DataTable rows={list} cols={cols} onRowClick={(r) => setOpenKey(`${r.compId}/${r.id}`)} rowClass={(r) => (r.child ? 'bg-muted/30' : undefined)} colsKey="anuncios" rowKey={(r) => `${r.compId}/${r.id}`} sort={sort} fill={!compId} onSort={(k, dir) => set({ ordem: k, asc: dir === 1 ? '1' : '' })} />
                      : (compId ? (c: ReactNode) => <>{c}</> : (c: ReactNode) => <FillBox>{c}</FillBox>)(<div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
            {list.map((r) => <AdCard key={`${r.compId}/${r.id}`} slug={slug} r={r} thumb={thumbOf(r)} open={open.has(r.gk)} onToggle={() => toggleOpen(r.gk)} onOpen={() => setOpenKey(`${r.compId}/${r.id}`)} onSave={() => onMark(r.compId, r.id, { saved: !r.mark?.saved })} />)}
          </div>))}
      </>}
      {openRow && <AdPanel key={openKey} slug={slug} open onClose={() => setOpenKey(null)} mark={openRow.mark} onMark={(patch) => onMark(openRow.compId, openRow.id, patch)}
        r={{ ad: openRow, compId: openRow.compId, compName: openRow.compName, days: openRow.days, c: openRow.c, auto: openRow.auto, hist: openRow.hist, status: openRow.status, sinal: openRow.sinal, gone: openRow.gone, fromCopy: openRow.fromCopy, thumb: thumbOf(openRow) }} />}
    </>);
}

/** botão de salvar do card e da linha (não abre o painel) */
function SaveBtn({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <Tip content={on ? 'Salvo. Clique para tirar dos salvos.' : 'Salvar: guarda uma cópia do anúncio, que continua abrindo mesmo se sair do ar.'}>
      <button type="button" aria-pressed={on} aria-label={on ? 'Tirar dos salvos' : 'Salvar anúncio'} onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={cx('grid place-items-center size-7 rounded-md transition outline-none focus-visible:ring-2 focus-visible:ring-ring', on ? 'text-ai' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
        {on ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      </button>
    </Tip>
  );
}

/** frase do histórico para o tooltip do status (saiu do ar, voltou com outro id, quantas coletas) */
function statusExtra(r: Row): string | undefined {
  const h = r.hist;
  if (!h) return undefined;
  const out: string[] = [];
  if (h.saiuDoAr && h.saiuEm) out.push(`Saiu do ar até ${fmtDate(h.saiuEm)}${h.duracaoFinal != null ? ` (rodou ${h.duracaoFinal} dias)` : ''}`);
  if (h.reapareceu) out.push('O mesmo criativo saiu e voltou com outro id: sinal de que vale manter.');
  if (h.coletas > 1) out.push(`Visto em ${h.coletas} coletas.`);
  return out.join('\n') || undefined;
}

function KidsToggle({ n, open, onClick }: { n: number; open: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(); }} aria-expanded={open} title={open ? 'Esconder as variações' : 'Mostrar as variações do mesmo anúncio (texto e título iguais)'}
      className="shrink-0 inline-flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted whitespace-nowrap">
      {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}+{n} {n === 1 ? 'variação' : 'variações'}
    </button>
  );
}

function AdCard({ slug, r, thumb, open, onToggle, onOpen, onSave }: { slug: string; r: Item; thumb?: string; open: boolean; onToggle: () => void; onOpen: () => void; onSave: () => void }) {
  const proven = (r.days ?? 0) >= PROVEN_DAYS && !r.gone;
  const title = (r.title ?? '').replace(/\{\{[^}]+\}\}/g, '').trim();
  const host = hostOf(r.linkUrl);
  return (
    <article onClick={onOpen} className={cx('bg-card border rounded-xl overflow-hidden flex flex-col cursor-pointer hover:shadow-sm transition', r.child && 'border-dashed bg-muted/30', proven ? 'border-amber-300' : 'border-border', r.gone && 'opacity-80')}>
      <div className="relative block aspect-square bg-muted">
        <Img local={thumb} remote={r.media.thumbnail} className="absolute inset-0 w-full h-full object-cover" fallback={<div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">sem miniatura</div>} />
        <span className="absolute top-2 left-2 flex gap-1">
          {r.isNew && <span className="text-[10px] font-semibold bg-success text-white rounded px-1.5 py-0.5">NOVO</span>}
          <span className="text-[10px] font-semibold bg-black/70 text-white rounded px-1.5 py-0.5 uppercase">{r.media.type === 'desconhecido' ? 'anúncio' : r.media.type}</span>
        </span>
        <span className="absolute top-2 right-2"><StatusBadge status={r.status} sinal={r.sinal} extra={statusExtra(r)} className="shadow-sm ring-1 ring-black/10 !bg-card" /></span>
        {r.days != null && <span className={cx('absolute bottom-2 left-2 text-[11px] font-semibold rounded px-1.5 py-0.5', proven ? 'bg-amber-400 text-black' : 'bg-black/70 text-white')} title={`no ar desde ${new Date(r.startedAt!).toLocaleDateString('pt-BR')}`}>{r.days} dia(s) no ar</span>}
        {(r.variations ?? 0) > 1 ? <span className="absolute bottom-2 right-2 text-[11px] bg-black/70 text-white rounded px-1.5 py-0.5" title="anúncios que usam este criativo e texto">{r.variations} variações</span> : null}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to={`/p/${slug}/concorrentes/${r.compId}`} onClick={(e) => e.stopPropagation()} className="font-medium text-foreground hover:text-primary-ink truncate">{r.compName}</Link>
          <span className="ml-auto flex gap-1">{r.platforms.map((p) => <PlatformIcon key={p} platform={p} size={12} />)}</span>
          {r.ficha && <AnalyzedBadge ficha={r.ficha} compact />}
          <span className="-my-1 -mr-1"><SaveBtn on={!!r.mark?.saved} onClick={onSave} /></span>
        </div>
        {r.c && (
          <div className="flex flex-wrap gap-1">
            <ChipFunil c={r.c} voce={voceDe(r, 'funil')} /><ChipTipo c={r.c} voce={voceDe(r, 'tipo')} /><ChipObjetivo c={r.c} voce={voceDe(r, 'objetivo')} />
            {r.c.oferta.tem && <ChipOferta c={r.c} />}
            <ChipDestino c={r.c} />
          </div>
        )}
        {adText(r.text) && <p className={cx('text-[13px] leading-snug line-clamp-5 whitespace-pre-line', !r.text?.replace(/\{\{[^}]+\}\}/g, '').trim() && 'text-muted-foreground italic')}>{adText(r.text)}</p>}
        {(title || r.cta) && (
          <div className="mt-auto pt-2 border-t border-border flex items-center gap-2 text-xs">
            <span className="min-w-0 flex-1"><span className="block font-medium truncate">{title}</span>{host && <span className="block text-muted-foreground truncate">{host}</span>}</span>
            {r.cta && <span className="shrink-0 px-2 py-0.5 rounded bg-muted">{r.cta}</span>}
          </div>
        )}
        {r.kids > 0 && <div className={cx(!(title || r.cta) && 'mt-auto')}><KidsToggle n={r.kids} open={open} onClick={onToggle} /></div>}
        {r.child && <span className="text-[11px] text-muted-foreground">variação do anúncio acima</span>}
      </div>
    </article>
  );
}
