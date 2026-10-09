// Cards de conteúdo (vídeo/post) com as medidas de fora da curva, métricas e crescimento + painel de detalhe com marcação e "Virar ideia".
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, ExternalLink, FileText, Loader2, Eye, Flame, Heart, MessageCircle, Send, Sparkles, Star as StarIcon, type LucideIcon } from 'lucide-react';
import type { ItemMark } from '../../api';
import { Select, cx, fmtDate, fmtNum } from '../kit';
import {
  Img, MERCADO_MIN_AMOSTRA, MERCADO_MIN_CONCORRENTES, PlatformIcon, STATUS_COLOR, STATUS_LABEL, Spinner, TYPE_LABEL, fmtDelta, fmtDur, fmtPct, fmtRatio, platformLabel, timeAgo, type Row,
} from './lib';
import { Tip } from './toolbar';

export const isVertical = (r: Row) => ['short', 'reel'].includes(r.item.type) || r.platform === 'tiktok' || (r.platform === 'instagram' && r.item.type !== 'post');
export const titleOf = (r: Row) => r.item.title || r.item.caption?.split('\n')[0] || `${TYPE_LABEL[r.item.type] ?? 'Item'} ${r.item.id}`;

export function Thumb({ r, media, className }: { r: Row; media?: string; className?: string }) {
  const vertical = isVertical(r);
  const ph = <div className="absolute inset-0 grid place-items-center text-muted-foreground"><PlatformIcon platform={r.platform} size={28} /></div>;
  return (
    <div className={cx('relative bg-zinc-900 overflow-hidden', className)}>
      {vertical && <Img local={media} remote={r.item.thumbnail} className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" fallback={<span />} />}
      <Img local={media} remote={r.item.thumbnail} alt={titleOf(r)} className={cx('absolute inset-0 w-full h-full', vertical ? 'object-contain' : 'object-cover')} fallback={ph} />
    </div>
  );
}

// ---------- fora da curva: três leituras ----------
const baseLabel = (b?: 'views' | 'likes') => (b === 'likes' ? 'curtidas' : 'views');
const FORMATO_PLURAL: Record<string, string> = { video: 'vídeos', short: 'shorts', reel: 'reels', post: 'posts', carrossel: 'carrosséis', live: 'lives', outro: 'outros' };

/** explicação do × perfil */
export const perfilTip = (r: Row) => `${fmtRatio(r.outlier)} a mediana de ${baseLabel(r.outlierBasis)} do próprio perfil (${platformLabel(r.platform)}) na última coleta.\nMostra o que viralizou para esse perfil.`;
/** por que o formato não bastou: poucos itens, poucos concorrentes, ou os dois */
function motivoRede(r: Row) {
  const n = r.mercadoFormatoAmostra ?? 0, c = r.mercadoFormatoConcorrentes ?? 0;
  const itens = `${n} conteúdo${n === 1 ? '' : 's'}`, conc = `${c} concorrente${c === 1 ? '' : 's'}`;
  return n < MERCADO_MIN_AMOSTRA && c < MERCADO_MIN_CONCORRENTES ? `só ${itens} de ${conc}` : n < MERCADO_MIN_AMOSTRA ? `só ${itens}` : `só ${conc}`;
}
/** explicação do × mercado, com escopo e amostra */
export function mercadoTip(r: Row) {
  const escopo = r.mercadoEscopo === 'formato' ? `${FORMATO_PLURAL[r.item.type] ?? r.item.type} no ${platformLabel(r.platform)}` : `todos os conteúdos no ${platformLabel(r.platform)}`;
  return `${fmtRatio(r.outlierMercado)} a mediana de ${baseLabel(r.outlierMercadoBasis)} de ${escopo} entre os concorrentes (${r.mercadoAmostra ?? '?'} conteúdos de ${r.mercadoConcorrentes ?? '?'} concorrentes).`
    + (r.mercadoEscopo === 'rede' ? `\nComparou com a rede inteira porque o formato tem ${motivoRede(r)} (precisa de ${MERCADO_MIN_AMOSTRA} conteúdos e ${MERCADO_MIN_CONCORRENTES} concorrentes).` : '')
    + '\nPerfil grande tende a ficar alto aqui; veja também “por seguidor”.';
}
/** quando o × mercado não vale: poucos concorrentes na rede */
export const mercadoVazioTip = (r: Row) => r.mercadoConcorrentes != null ? `Menos de 3 concorrentes nesta comparação (n=${r.mercadoConcorrentes}, ${platformLabel(r.platform)}).\nCom tão poucos, seria só "× o outro perfil".` : undefined;
/** explicação do por seguidor */
export const porSeguidorTip = (r: Row) => r.porSeguidor == null ? undefined
  : `Alcance relativo: ${baseLabel(r.porSeguidorBasis)} = ${fmtPct(r.porSeguidor)} dos seguidores do perfil.`
    + (r.porSeguidorMercado != null ? `\n${fmtRatio(r.porSeguidorMercado)} o típico do mercado nessa medida (tira o efeito do tamanho do perfil).` : '');

/** selo de razão: quente (≥3×) âmbar, morno (≥1,5×) branco, frio escuro; texto curto + tooltip */
function RatioPill({ v, label, tip, big, basisLikes }: { v: number; label: string; tip: ReactNode; big?: boolean; basisLikes?: boolean }) {
  const hot = v >= 3, warm = v >= 1.5;
  return (
    <Tip content={tip}>
      <span className={cx('inline-flex items-center gap-0.5 rounded-md font-semibold tabular-nums shadow-sm whitespace-nowrap', big ? 'px-2 py-1 text-sm' : 'px-1.5 py-0.5 text-[11px]',
        hot ? 'bg-amber-400 text-amber-950' : warm ? 'bg-white/95 text-zinc-900' : 'bg-black/60 text-white')}>
        {hot && <Flame className={big ? 'size-3.5' : 'size-3'} />}{fmtRatio(v)}<span className="font-normal opacity-75 ml-0.5 inline-flex items-center gap-0.5">{label}{basisLikes && <Heart className="size-2.5" />}</span>
      </span>
    </Tip>
  );
}

/** os selos lado a lado: × perfil e × mercado (o "por seguidor" fica no tooltip do mercado e na gaveta) */
export function OutlierBadges({ r, big }: { r: Row; big?: boolean }) {
  if (r.outlier == null && r.outlierMercado == null && r.mercadoConcorrentes == null) return null;
  return (
    <span className="inline-flex items-center gap-1">
      {r.outlier != null && <RatioPill v={r.outlier} label="perfil" tip={perfilTip(r)} big={big} basisLikes={r.outlierBasis === 'likes'} />}
      {r.outlierMercado != null
        ? <RatioPill v={r.outlierMercado} label="mercado" tip={<>{mercadoTip(r)}{porSeguidorTip(r) ? `\n${porSeguidorTip(r)}` : ''}</>} big={big} basisLikes={r.outlierMercadoBasis === 'likes'} />
        : r.mercadoConcorrentes != null && (
          <Tip content={mercadoVazioTip(r)}>
            <span className={cx('inline-flex items-center gap-0.5 rounded-md tabular-nums shadow-sm whitespace-nowrap bg-black/45 text-white/90', big ? 'px-2 py-1 text-sm' : 'px-1.5 py-0.5 text-[11px]')}>—<span className="opacity-75 ml-0.5">mercado</span></span>
          </Tip>
        )}
    </span>
  );
}

/** célula de tabela: razão colorida (≥3× âmbar em negrito) */
export function RatioCell({ v, tip }: { v?: number; tip?: ReactNode }) {
  if (v == null) return tip ? <Tip content={tip}><span className="text-muted-foreground cursor-help">—</span></Tip> : <span className="text-muted-foreground">—</span>;
  return <Tip content={tip}><span className={cx('tabular-nums', v >= 3 ? 'font-semibold text-amber-700' : v >= 1.5 ? 'font-medium' : 'text-muted-foreground')}>{v >= 3 && <Flame className="inline size-3 -mt-0.5 mr-0.5" />}{fmtRatio(v)}</span></Tip>;
}

export interface FichaSelo { analisada: boolean; naFila: boolean; geradoEm?: string; editados: number; /** 040 E: a rodada da fila está analisando este item agora */ analisando?: boolean }
/** selo da análise profunda (040): roxo = analisado (abre o painel), escuro = pedido na fila. `compact` = só o ícone (tabela) */
export function AnalyzedBadge({ ficha, compact }: { ficha: FichaSelo; compact?: boolean }) {
  if (!ficha.analisada && !ficha.naFila && !ficha.analisando) return null;
  // "analisando" e "na fila" mandam sobre "analisado" (reanálise pedida)
  const estado = ficha.analisando ? 'analisando' : ficha.naFila ? 'fila' : 'analisado';
  const tip = estado === 'analisando' ? 'A IA está analisando este conteúdo agora (acompanhe na faixa acima da lista).'
    : estado === 'fila' ? `Na fila de análise${ficha.analisada ? ' (reanálise)' : ''}: roda com "Rodar agora" ou "roda a fila de fichas" no Claude Code.`
    : `Analisado pela IA${ficha.geradoEm ? ` em ${fmtDate(ficha.geradoEm)}` : ''}${ficha.editados ? ` · ${ficha.editados} campo(s) editado(s) por você` : ''}.\nAbre o painel da análise.`;
  const label = { analisando: 'Analisando', fila: 'Na fila', analisado: 'Analisado' }[estado];
  return (
    <Tip content={tip}>
      <span aria-label={label} className={cx('inline-flex items-center gap-1 rounded-md font-medium whitespace-nowrap shrink-0', compact ? 'p-0.5' : 'px-1.5 py-0.5 text-[11px] shadow-sm',
        estado === 'analisado' ? (compact ? 'text-ai' : 'bg-ai text-white')
        : estado === 'analisando' ? (compact ? 'text-ai' : 'bg-ai-muted text-ai-ink ring-1 ring-ai-border')
        : (compact ? 'text-muted-foreground' : 'bg-black/65 text-white'))}>
        {estado === 'analisado' ? <Sparkles className="size-3" /> : estado === 'analisando' ? <Loader2 className="size-3 animate-spin" /> : <Clock className="size-3" />}{!compact && label}
      </span>
    </Tip>
  );
}

const Metric =({ icon: Icon, v, title }: { icon: LucideIcon; v?: number; title: string }) =>
  v == null ? null : <span title={`${title}: ${v.toLocaleString('pt-BR')}`} className="inline-flex items-center gap-1 tabular-nums"><Icon className="size-3.5 text-muted-foreground" strokeWidth={1.8} />{fmtNum(v)}</span>;

export const FavStar = ({ on, onClick, size = 'size-4' }: { on: boolean; onClick?: () => void; size?: string }) => (
  <button type="button" title={on ? 'Tirar dos favoritos' : 'Favoritar'} aria-pressed={on} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick?.(); }}
    className={cx('leading-none transition hover:scale-110', on ? 'text-amber-400' : 'text-zinc-300 hover:text-amber-300')}>
    <StarIcon className={cx(size, on && 'fill-current')} />
  </button>
);

export function ItemCard({ r, media, showPlatform, onMark, onIdea, onOpen, ideaBusy, slug, owner, ficha, select, relatorio, onRelatorio }: {
  /** 042: conteúdo citado num relatório (o mais recente): atalho no rodapé do card */
  relatorio?: { id: string; gerado: string }; onRelatorio?: () => void;
  /** 040 D: selo "Analisado" (ou "Na fila") no canto da miniatura */
  ficha?: FichaSelo;
  /** 040 E: caixa de seleção para analisar (aparece ao passar o mouse ou quando já há seleção) */
  select?: { checked: boolean; disabled?: boolean; title?: string; always: boolean; onChange: () => void };
  r: Row; media?: string; showPlatform: boolean; slug: string; ideaBusy: boolean;
  /** concorrente dono do conteúdo (feed): avatar + nome logo abaixo do título */
  owner?: { name: string; avatar?: ReactNode };
  onMark: (patch: Partial<ItemMark>) => void; onIdea: () => void; onOpen: () => void;
}) {
  const m = r.mark;
  const status = m?.status ?? 'nova';
  const dGrowth = fmtDelta(r.viewsDelta);
  const hot = (r.outlier ?? 0) >= 3 || (r.outlierMercado ?? 0) >= 3;
  return (
    <div className={cx('group/card relative bg-card border rounded-xl overflow-hidden flex flex-col transition hover:shadow-md', select?.checked ? 'border-primary ring-2 ring-primary/40' : hot ? 'border-amber-300 ring-1 ring-amber-200' : 'border-border', status === 'descartada' && 'opacity-55')}>
      {select && (
        <label title={select.title} onClick={(e) => e.stopPropagation()}
          className={cx('absolute top-2 left-2 z-[2] grid place-items-center size-6 rounded-md bg-white/95 shadow-sm ring-1 ring-black/10 transition',
            select.checked || select.always ? 'opacity-100' : select.disabled ? 'opacity-0 group-hover/card:opacity-50' : 'opacity-0 group-hover/card:opacity-100 focus-within:opacity-100', select.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
          <input type="checkbox" aria-label={`Selecionar ${titleOf(r)} para analisar`} className="size-4 accent-[var(--primary)] cursor-[inherit]" checked={select.checked} disabled={select.disabled} onChange={select.onChange} />
        </label>
      )}
      <button type="button" onClick={onOpen} className="relative block text-left" aria-label={`Abrir ${titleOf(r)}`}>
        <Thumb r={r} media={media} className="aspect-video" />
        <div className={cx('absolute top-2 transition-[left]', select && (select.checked || select.always) ? 'left-10' : 'left-2', select && 'group-hover/card:left-10')}><OutlierBadges r={r} /></div>
        {ficha && <div className="absolute top-2 right-2"><AnalyzedBadge ficha={ficha} /></div>}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide">{TYPE_LABEL[r.item.type] ?? r.item.type}</span>
        </div>
        {fmtDur(r.item.durationS) && <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] font-medium px-1.5 py-0.5 rounded tabular-nums">{fmtDur(r.item.durationS)}</span>}
      </button>

      <div className="p-3 flex-1 flex flex-col gap-2">
        {/* 1. título */}
        <button type="button" onClick={onOpen} className="text-left text-sm font-semibold leading-snug line-clamp-2 hover:text-primary-ink" title={titleOf(r)}>{titleOf(r)}</button>
        {/* 2. concorrente + rede */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          {owner && <>{owner.avatar}<span className="truncate font-medium text-foreground/80">{owner.name}</span></>}
          {showPlatform && <span className="inline-flex items-center gap-1 shrink-0" title={platformLabel(r.platform)}><PlatformIcon platform={r.platform} size={13} />{!owner && platformLabel(r.platform)}</span>}
        </div>
        {/* 3. métricas */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground">
          <span className="inline-flex items-center gap-1">
            <Metric icon={Eye} v={r.item.metrics.views} title="Views" />
            {dGrowth && <span className={cx('tabular-nums text-[11px] font-medium', r.viewsDelta! > 0 ? 'text-success-ink' : 'text-destructive')} title={`desde a coleta de ${fmtDate(r.prevAt)}`}>{dGrowth}</span>}
          </span>
          <Metric icon={Heart} v={r.item.metrics.likes} title="Curtidas" />
          <Metric icon={MessageCircle} v={r.item.metrics.comments} title="Comentários" />
          <Metric icon={Send} v={r.item.metrics.shares} title="Envios / compartilhamentos" />
        </div>
        {/* 4. engajamento + 5. data relativa */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {r.engagement != null
            ? <span className="inline-flex items-center gap-1 font-semibold text-foreground" title="(curtidas + comentários + envios) ÷ views"><Activity className="size-3.5 text-muted-foreground" strokeWidth={1.8} />{fmtPct(r.engagement)}<span className="font-normal text-muted-foreground">engajamento</span></span>
            : <span />}
          <span className="text-muted-foreground" title={r.item.publishedAt ? fmtDate(r.item.publishedAt) : undefined}>{r.item.publishedAt ? timeAgo(r.item.publishedAt) : 'data desconhecida'}</span>
        </div>
        {(m?.tags.length || m?.note) ? (
          <div className="flex flex-wrap gap-1.5 items-center text-xs">
            {m?.tags.map((t) => <span key={t} className="text-primary-ink">#{t}</span>)}
            {m?.note && <span className="text-muted-foreground truncate max-w-full" title={m.note}>{m.note}</span>}
          </div>
        ) : null}

        <div className="mt-auto pt-2 border-t border-border flex items-center gap-1.5">
          <FavStar on={!!m?.favorite} onClick={() => onMark({ favorite: !m?.favorite })} />
          <Select value={status} onChange={(e) => onMark({ status: e.target.value as ItemMark['status'] })} aria-label="Status"
            className="h-7 text-xs px-1.5" style={{ color: STATUS_COLOR[status] }}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          {m?.ideaId ? (
            <Link to={`/p/${slug}/ideias`} className="inline-flex items-center gap-1 text-xs font-medium text-success-ink bg-green-50 px-1.5 py-1 rounded-md" title="Já virou ideia"><Sparkles className="size-3" />{m.ideaId}</Link>
          ) : (
            <button type="button" onClick={onIdea} disabled={ideaBusy} className="inline-flex items-center gap-1 text-xs font-medium text-primary-ink hover:bg-primary-soft px-1.5 py-1 rounded-md disabled:opacity-50">
              {ideaBusy ? <Spinner /> : <Sparkles className="size-3" />} Virar ideia
            </button>
          )}
          {relatorio && onRelatorio && (
            <Tip content={`Relatório: citado em ${fmtDate(relatorio.gerado)}. Clique para abrir.`}>
              <button type="button" onClick={onRelatorio} aria-label="Abrir o relatório que cita este conteúdo" className="ml-auto inline-flex items-center text-ai-ink hover:bg-ai-soft p-1 rounded-md"><FileText className="size-3.5" /></button>
            </Tip>
          )}
          <a href={r.item.url} target="_blank" rel="noreferrer" className={cx(!relatorio && 'ml-auto', 'text-muted-foreground hover:text-foreground px-1')} title={`Abrir no ${platformLabel(r.platform)}`}><ExternalLink className="size-3.5" /></a>
        </div>
      </div>
    </div>
  );
}

/** mini-série de views do item ao longo das coletas */
export function ViewsHistory({ r }: { r: Row }) {
  const pts = r.history.filter((h) => h.views != null) as { at: string; views: number }[];
  if (pts.length < 2) return <div className="text-xs text-muted-foreground">O crescimento aparece a partir da 2ª coleta que incluir este item.</div>;
  const W = 520, H = 70, lo = Math.min(...pts.map((p) => p.views)), hi = Math.max(...pts.map((p) => p.views));
  const t0 = new Date(pts[0].at).getTime(), t1 = new Date(pts.at(-1)!.at).getTime();
  const x = (a: string) => 6 + ((new Date(a).getTime() - t0) / Math.max(1, t1 - t0)) * (W - 12);
  const y = (v: number) => 8 + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - 16);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[70px]" role="img" aria-label="Views por coleta">
        <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.at)},${y(p.views)}`).join(' ')} fill="none" stroke="#2a78d6" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {pts.map((p) => <circle key={p.at} cx={x(p.at)} cy={y(p.views)} r={3} fill="#2a78d6" stroke="#fff" strokeWidth={1.5}><title>{`${fmtDate(p.at)}: ${p.views.toLocaleString('pt-BR')} views`}</title></circle>)}
      </svg>
      <table className="w-full text-xs mt-1">
        <tbody>
          {pts.map((p, i) => (
            <tr key={p.at} className="border-t border-border">
              <td className="py-1 text-muted-foreground">{fmtDate(p.at)}</td>
              <td className="py-1 text-right tabular-nums">{p.views.toLocaleString('pt-BR')}</td>
              <td className="py-1 text-right tabular-nums w-24 text-success-ink">{i ? fmtDelta(p.views - pts[i - 1].views) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
