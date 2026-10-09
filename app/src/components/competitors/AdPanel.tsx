// Painel do anúncio (037 D): cabeçalho com todas as ações (como o painel de conteúdo); à esquerda a prévia do anúncio como no feed e o destino;
// à direita, separados por divisores: tags, sinal de resultado, classificação, análise da IA e nota. Para o que o Oliver faz com o anúncio:
// corrigir funil/tipo/objetivo (o valor dele vence regra e IA, coleta nova não apaga), anotar, pôr tags e SALVAR (guarda uma cópia do anúncio
// e da miniatura: o salvo continua abrindo inteiro mesmo se a Biblioteca tirar o anúncio do ar).
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Bookmark, BookmarkCheck, CircleHelp, Filter, LogOut, Megaphone, Sparkles, StickyNote, Tag as TagIcon, Undo2, UserRound } from 'lucide-react';
import type { Ad, AdMark, AdMarkPatch, AnuncioHistorico, Classificacao } from '../../api';
import { AD_FUNIS, AD_OBJETIVOS, AD_TIPOS, fichaKeyDeAd, resolverCampo, type AdCampo } from '../../../../schema/ads-marks';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Button, SelectField, Textarea, cx, fmtDate, type SelectOption } from '../kit';
import { Img, PlatformIcon, platformLabel, timeAgo } from './lib';
import { Tip } from './toolbar';
import { TagsInput, TagChip, useProjectTags } from '../notes/TagsInput';
import { ChipDestino, ChipOferta, FUNIL, INCERTO, OBJETIVO, StatusBadge, TIPO, motivosDe, type StatusAd } from './AdChips';
import { AnaliseAnuncio } from './ficha/AdFicha';
import { AbrirOriginal, BotaoAnalisar, SeloAnalise, Secao } from './ficha/FichaPanel';
import { useFichasResumo } from './ficha/useFichas';

/** o que o painel precisa saber de um anúncio (a linha da aba Anúncios, já com a classificação resolvida) */
export interface AdPanelData {
  ad: Ad; compId: string; compName: string; days?: number;
  /** classificação já resolvida (valor do Oliver no lugar da regra) */
  c?: Classificacao;
  /** o que as regras dizem (sem override) */
  auto?: Classificacao;
  hist?: AnuncioHistorico; status: StatusAd; sinal: number;
  /** não está mais na coleta: a tela vem da cópia guardada */
  gone?: boolean; fromCopy?: boolean;
  /** miniatura (a guardada no repo, se houver) */
  thumb?: string;
}

const MEDIA_LABEL = { imagem: 'Imagem', video: 'Vídeo', carrossel: 'Carrossel', desconhecido: 'Anúncio' } as const;
const clean = (t?: string | null) => (t ?? '').replace(/\{\{[^}]+\}\}/g, '').trim();
const hostOf = (u?: string | null) => { try { return u ? new URL(u).hostname.replace(/^www\./, '') : null; } catch { return null; } };
/** grupos de tags.yml que servem para anúncio (as outras, como "tema", são de conteúdo) */
const GRUPOS_ANUNCIO: Record<string, string> = { angulo: 'Ângulo', gancho: 'Gancho', campanha: 'Tipo de campanha' };

const CAMPOS: { k: AdCampo; label: string; hint: string; labels: Record<string, string>; values: readonly string[] }[] = [
  { k: 'funil', label: 'Funil', hint: 'temperatura do público: topo (frio), meio, fundo (pede a decisão)', labels: FUNIL, values: AD_FUNIS },
  { k: 'tipo', label: 'Tipo', hint: 'o que o anúncio é', labels: TIPO, values: AD_TIPOS },
  { k: 'objetivo', label: 'Objetivo', hint: 'palpite pelo botão e pelo destino (o objetivo real da campanha não é público)', labels: OBJETIVO, values: AD_OBJETIVOS },
];

export function AdPanel({ slug, r, mark, open, onClose, onMark }: {
  slug: string; r: AdPanelData; mark?: AdMark; open: boolean; onClose: () => void; onMark: (patch: AdMarkPatch) => void;
}) {
  const { ad, c, auto } = r;
  const [note, setNote] = useState(mark?.note ?? '');
  const lastNote = useRef(mark?.note ?? '');
  const { list: tagDefs } = useProjectTags(slug);
  // análise da IA (040 G): vale entre a regra e a sua correção
  const fichaKey = fichaKeyDeAd(ad.id);
  const selo = useFichasResumo(slug).of(r.compId, fichaKey);
  const ia = selo?.analisada ? selo.anuncio : undefined;
  const saveNote = () => { if (note !== lastNote.current) { lastNote.current = note; onMark({ note: note.trim() ? note : null }); } };
  const fechar = () => { saveNote(); onClose(); };

  const title = clean(ad.title), text = clean(ad.text), host = hostOf(ad.linkUrl);
  const saved = !!mark?.saved;
  const tags = mark?.tags ?? [];
  const grupos = Object.entries(GRUPOS_ANUNCIO).map(([g, nome]) => ({ g, nome, defs: tagDefs.filter((t) => t.grupo === g) })).filter((x) => x.defs.length);
  const toggleTag = (id: string) => onMark({ tags: tags.includes(id) ? tags.filter((t) => t !== id) : [...tags, id] });

  const optionsOf = (campo: (typeof CAMPOS)[number]): SelectOption[] => campo.values.map((v) => ({ value: v, label: campo.labels[v] }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
      <DialogContent aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 gap-0 flex flex-col overflow-hidden outline-none w-[calc(100vw-2rem)] max-w-[1100px] sm:max-w-[1100px] h-[calc(100vh-2rem)] max-h-[860px]">
        {/* cabeçalho no mesmo padrão do painel de conteúdo: o que é (esquerda) e TODAS as ações (direita): salvar, IA (roxo) e abrir na Biblioteca (cor do projeto) */}
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 pr-14 border-b border-border">
          <div className="flex items-center gap-3 min-w-0 flex-1 basis-[320px]">
            <Megaphone className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold leading-snug truncate" title={title || text}>{title || text.slice(0, 90) || 'Anúncio sem texto'}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 min-w-0">
                <span className="truncate">
                  <Link to={`/p/${slug}/concorrentes/${r.compId}`} className="font-medium text-foreground hover:text-primary-ink">{r.compName}</Link>
                  {' · '}{MEDIA_LABEL[ad.media.type]}
                  {ad.startedAt ? ` · no ar desde ${fmtDate(ad.startedAt)}${r.days != null ? ` (${r.days} dias${r.gone ? ' até sair' : ''})` : ''}` : ''}
                </span>
                <span className="shrink-0"><StatusBadge status={r.status} sinal={r.sinal} /></span>
                {r.gone && <Tip content={r.fromCopy ? 'Aberto pela cópia guardada: o anúncio não está mais na coleta.' : undefined}>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-px shrink-0"><LogOut className="size-3" />Fora do ar</span>
                </Tip>}
                {selo?.analisada && <SeloAnalise geradoEm={selo.geradoEm} />}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Tip content={saved
              ? `Salvo ${mark?.savedAt ? timeAgo(mark.savedAt) : ''}${mark?.frozenMedia ? ' · miniatura guardada' : ''}.\nClique para tirar dos salvos (apaga a cópia guardada; nota e tags ficam).`
              : 'Guarda uma cópia do anúncio e da miniatura: continua abrindo inteiro mesmo se a Biblioteca tirar do ar.'}>
              <span><Button variant="soft" className="inline-flex items-center gap-1.5 h-8" onClick={() => onMark({ saved: !saved })}>
                {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}{saved ? 'Salvo' : 'Salvar'}
              </Button></span>
            </Tip>

            <span className="w-px h-6 bg-border mx-1" aria-hidden />

            <BotaoAnalisar slug={slug} compId={r.compId} chave={fichaKey} analisada={!!selo?.analisada} naFila={!!selo?.naFila} custo="anúncio"
              explica="A IA lê a arte e o texto, confirma ou corrige funil, tipo e objetivo (com o motivo) e diz por que o anúncio fica no ar." />
            <AbrirOriginal href={ad.url} label="Abrir na Biblioteca" />
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* esquerda: o anúncio como a pessoa vê no feed (texto, criativo, botão) e para onde o clique leva */}
          <aside className="md:w-[380px] shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/30 md:overflow-y-auto p-5 space-y-4">
            <Previa r={r} title={title} text={text} host={host} />
            <Destino r={r} host={host} />
          </aside>

          {/* direita: o que o Oliver faz com o anúncio, de cima para baixo; cada bloco separado por divisor */}
          <div className="flex-1 min-w-0 md:overflow-y-auto">
            <div className="p-6 space-y-5">
              <Secao icone={<TagIcon />} titulo="Tags" dica="Para achar e agrupar depois. Clique numa sugestão para pôr ou tirar.">
                <TagsInput slug={slug} value={tags} onChange={(t) => onMark({ tags: t })} />
                {grupos.map((g) => (
                  <div key={g.g} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground mr-1">{g.nome}</span>
                    {g.defs.map((d) => {
                      const on = tags.includes(d.id);
                      return (
                        <button key={d.id} type="button" aria-pressed={on} onClick={() => toggleTag(d.id)} title={d.definicao}
                          className={cx('rounded-full transition outline-none focus-visible:ring-2 focus-visible:ring-ring', on ? 'ring-1 ring-primary' : 'opacity-60 hover:opacity-100')}>
                          <TagChip id={d.id} def={d} small />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </Secao>

              <Separator />

              <Secao icone={<Activity />} titulo="Sinal de resultado" dica="Indireto: a Biblioteca não mostra gasto nem alcance. Anúncio que fica muito tempo no ar, ganha variações ou volta depois de sair tende a estar dando resultado.">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Stat k={r.gone ? 'dias no ar (até sair)' : 'dias no ar'} v={r.days != null ? String(r.days) : '—'} extra={<StatusBadge status={r.status} sinal={r.sinal} />} />
                  <Stat k="variações" v={ad.variations != null ? String(ad.variations) : '—'} tip="Anúncios que usam este mesmo criativo e texto." />
                  <Stat k="do mesmo conceito" v={c ? String(c.sinais.irmaos) : '—'} tip="Anúncios ativos do mesmo concorrente com o mesmo texto e título." />
                  <Stat k="coletas" v={r.hist ? String(r.hist.coletas) : '—'}
                    tip={r.hist ? `Visto em ${r.hist.coletas} coleta(s)${r.hist.saiuEm ? `; saiu até ${fmtDate(r.hist.saiuEm)}` : ''}${r.hist.reapareceu ? '; o criativo voltou com outro id (sinal de que vale manter)' : ''}.` : undefined}
                    extra={r.hist?.reapareceu ? <span className="text-[11px] font-medium text-success-ink">voltou</span> : ad.endedAt ? <span className="text-[11px] text-muted-foreground">terminou {fmtDate(ad.endedAt)}</span> : undefined} />
                </div>
              </Secao>

              {c && auto && <>
                <Separator />
                <Secao icone={<Filter />} titulo="Classificação" dica="Quem decidiu cada valor aparece no selo: regra, IA ou você. O seu vale sobre a regra e sobre a IA; coleta nova não apaga.">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {CAMPOS.map((f) => {
                      const regra = auto[f.k] as string;
                      // ordem fixa: a sua correção (marks.json) > a análise da IA (ficha) > a regra. Editar aqui escreve SÓ no marks.json
                      const { valor, origem } = resolverCampo(f.k, regra, mark, ia?.[f.k]);
                      // o que valeria sem a sua correção: escolher esse valor desfaz a correção
                      const { valor: semVoce, origem: origemSemVoce } = resolverCampo(f.k, regra, undefined, ia?.[f.k]);
                      const conf = auto.confiancaCampos[f.k], incerto = origem === 'regra' && conf < INCERTO;
                      const motivoIa = ia?.motivo?.[f.k];
                      const porque = origem === 'voce'
                        ? `Você corrigiu. ${origemSemVoce === 'ia' ? 'A IA' : 'As regras'} diziam: ${f.labels[semVoce as string]}.`
                        : origem === 'ia'
                          ? (ia?.[f.k] === regra ? 'A IA confirmou a regra.' : `A IA corrigiu a regra (${f.labels[regra]}).`) + (motivoIa ? ` ${motivoIa}` : '')
                          : motivosDe(auto, f.k).map((x) => x.replace(/^• /, '')).join(' · ') || 'Nenhum sinal forte: valor padrão das regras.';
                      return (
                        <div key={f.k} className={cx('rounded-xl border bg-card p-3 flex flex-col gap-2', incerto ? 'border-warning/40' : 'border-border')}>
                          <div className="flex items-center gap-2">
                            <Tip content={f.hint}><span className="text-xs font-semibold cursor-help">{f.label}</span></Tip>
                            <span className="ml-auto"><Origem origem={origem} conf={conf} incerto={incerto} /></span>
                          </div>
                          <SelectField aria-label={f.label} value={valor} options={optionsOf(f)} className="w-full"
                            onChange={(x) => x && onMark({ override: { [f.k]: x === semVoce ? null : x } })} />
                          <Tip content={porque.length > 110 ? porque : undefined}>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-3">{porque}</p>
                          </Tip>
                          {origem === 'voce' && (
                            <button type="button" onClick={() => onMark({ override: { [f.k]: null } })} className="mt-auto self-start inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                              <Undo2 className="size-3.5" />voltar ao automático
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Secao>
              </>}

              {selo?.analisada && <>
                <Separator />
                <Secao icone={<Sparkles className="text-ai" />} titulo="Análise da IA" dica="Ficha do anúncio. Funil, tipo e objetivo ficam em Classificação, acima.">
                  <AnaliseAnuncio slug={slug} compId={r.compId} fichaKey={fichaKey} resumo={selo} />
                </Secao>
              </>}

              <Separator />

              <Secao icone={<StickyNote />} titulo="Nota" dica="Por que este anúncio importa e o que copiar: o mecanismo, não a frase.">
                <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Ex.: abre com a dor do prontuário; oferta de 15 dias sem cartão." />
              </Secao>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** o anúncio como aparece no feed: anunciante + "Patrocinado", texto principal (com "ver mais"), criativo e a faixa do link com o botão */
function Previa({ r, title, text, host }: { r: AdPanelData; title: string; text: string; host: string | null }) {
  const { ad, c } = r;
  const [aberto, setAberto] = useState(false);
  const longo = text.length > 220 || text.split('\n').length > 4;
  const nome = ad.pageName || r.compName;
  const desc = clean(ad.description);
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <span className="size-8 rounded-full bg-muted grid place-items-center text-xs font-semibold text-muted-foreground shrink-0">{nome.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-semibold truncate">{nome}</div>
          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            Patrocinado · {MEDIA_LABEL[ad.media.type].toLowerCase()}
            <span className="inline-flex items-center gap-1 ml-1">{ad.platforms.map((p) => <span key={p} title={platformLabel(p)}><PlatformIcon platform={p} size={11} /></span>)}</span>
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5 text-[13px] leading-relaxed">
        {text ? (
          <>
            <div className={cx('whitespace-pre-line break-words', !aberto && longo && 'line-clamp-4')}>{text}</div>
            {longo && <button type="button" onClick={() => setAberto(!aberto)} className="text-xs font-medium text-muted-foreground hover:text-foreground mt-0.5">{aberto ? 'ver menos' : 'ver mais'}</button>}
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">{ad.text?.includes('{{') ? 'Catálogo (texto dinâmico): a Biblioteca não traz o texto real.' : 'Sem texto principal.'}</p>
        )}
        {c?.oferta.tem && <div className="mt-2"><ChipOferta c={c} /></div>}
      </div>

      <div className="bg-muted">
        {ad.media.type === 'video' && ad.media.videoUrl && !r.gone
          ? <video src={ad.media.videoUrl} poster={r.thumb ?? ad.media.thumbnail ?? undefined} controls preload="none" playsInline className="w-full max-h-[440px] bg-black" />
          : <Img local={r.thumb} remote={ad.media.thumbnail} className="w-full max-h-[440px] object-contain" fallback={<div className="aspect-square grid place-items-center text-xs text-muted-foreground">sem miniatura</div>} />}
      </div>
      {ad.media.type === 'video' && (r.gone || !ad.media.videoUrl) && <p className="px-3 pt-2 text-[11px] text-muted-foreground">Vídeo pesado não vai para o repositório: só a miniatura fica guardada.</p>}

      {(host || title || desc || ad.cta) && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/60 border-t border-border">
          <div className="min-w-0 flex-1 leading-tight">
            {host && <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{host}</div>}
            {title && <div className="text-[13px] font-semibold line-clamp-2">{title}</div>}
            {desc && <div className="text-[11px] text-muted-foreground line-clamp-2">{desc}</div>}
          </div>
          {ad.cta && <span className="shrink-0 rounded-md bg-card border border-border px-2.5 py-1 text-xs font-semibold">{ad.cta}</span>}
        </div>
      )}
    </div>
  );
}

/** para onde o clique leva: tipo de destino, o link inteiro e a campanha (UTM) */
function Destino({ r, host }: { r: AdPanelData; host: string | null }) {
  const { ad, c } = r;
  if (!ad.linkUrl && !c) return null;
  const caminho = (() => { try { const u = new URL(ad.linkUrl ?? ''); return u.pathname !== '/' ? u.pathname : ''; } catch { return ''; } })();
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Destino do clique</span>
        {c && <span className="ml-auto"><ChipDestino c={c} /></span>}
      </div>
      {ad.linkUrl
        ? <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary-ink hover:underline break-all" title={ad.linkUrl}>{host}{caminho}</a>
        : <p className="text-sm text-muted-foreground">Sem link.</p>}
      {c?.sinais.utm?.campaign && <p className="text-xs text-muted-foreground">Campanha (UTM): <span className="text-foreground">{c.sinais.utm.campaign}</span></p>}
    </div>
  );
}

function Stat({ k, v, tip, extra }: { k: string; v: string; tip?: string; extra?: ReactNode }) {
  return (
    <Tip content={tip}>
      <div className={cx('rounded-lg border border-border bg-card px-3 py-2', tip && 'cursor-help')}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tabular-nums leading-tight">{v}</span>
          {extra && <span className="ml-auto">{extra}</span>}
        </div>
        <div className="text-[11px] text-muted-foreground">{k}</div>
      </div>
    </Tip>
  );
}

/** quem decidiu o valor: você (cor do projeto), IA (roxo) ou regra (com a confiança; âmbar se incerto) */
function Origem({ origem, conf, incerto }: { origem: 'voce' | 'ia' | 'regra'; conf: number; incerto: boolean }) {
  if (origem === 'voce') return <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary-ink text-[10px] font-semibold px-1.5 py-px"><UserRound className="size-3" />você</span>;
  if (origem === 'ia') return <span className="inline-flex items-center gap-1 rounded-full bg-ai-muted text-ai-ink text-[10px] font-semibold px-1.5 py-px"><Sparkles className="size-3" />IA</span>;
  return (
    <Tip content={`Regra automática, confiança ${Math.round(conf * 100)}%.${incerto ? '\nIncerto: vale conferir.' : ''}`}>
      <span className={cx('inline-flex items-center gap-1 rounded-full text-[10px] font-semibold px-1.5 py-px cursor-help', incerto ? 'bg-warning/15 text-warning-ink' : 'bg-muted text-muted-foreground')}>
        {incerto && <CircleHelp className="size-3" />}regra · {Math.round(conf * 100)}%
      </span>
    </Tip>
  );
}
