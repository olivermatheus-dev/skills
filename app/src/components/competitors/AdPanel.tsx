// Painel do anúncio (037 D): o mesmo desenho do painel de conteúdo (mídia à esquerda, miolo, rodapé), para o que o Oliver faz com o anúncio:
// corrigir funil/tipo/objetivo (o valor dele vence regra e IA, coleta nova não apaga), anotar, pôr tags e SALVAR (guarda uma cópia do anúncio
// e da miniatura: o salvo continua abrindo inteiro mesmo se a Biblioteca tirar o anúncio do ar).
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ExternalLink, Info, LogOut, Megaphone, Sparkles, Undo2, UserRound } from 'lucide-react';
import type { Ad, AdMark, AdMarkPatch, AnuncioHistorico, Classificacao } from '../../api';
import { AD_FUNIS, AD_OBJETIVOS, AD_TIPOS, fichaKeyDeAd, resolverCampo, type AdCampo } from '../../../../schema/ads-marks';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Button, SelectField, Textarea, cx, fmtDate, type SelectOption } from '../kit';
import { Img, PlatformIcon, platformLabel, timeAgo } from './lib';
import { Tip } from './toolbar';
import { TagsInput, TagChip, useProjectTags } from '../notes/TagsInput';
import { ChipDestino, ChipOferta, FUNIL, OBJETIVO, StatusBadge, TIPO, motivosDe, type StatusAd } from './AdChips';
import { AnaliseAnuncio } from './ficha/AdFicha';
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
      <DialogContent aria-describedby={undefined}
        className="p-0 gap-0 flex flex-col overflow-hidden w-[calc(100vw-2rem)] max-w-[1100px] sm:max-w-[1100px] h-[calc(100vh-2rem)] max-h-[860px]">
        <header className="flex items-center gap-3 px-6 py-3.5 pr-14 border-b border-border">
          <Megaphone className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold leading-snug truncate" title={title || text}>{title || text.slice(0, 90) || 'Anúncio sem texto'}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              <Link to={`/p/${slug}/concorrentes/${r.compId}`} className="font-medium text-foreground hover:text-primary-ink">{r.compName}</Link>
              {' · '}{MEDIA_LABEL[ad.media.type]}
              {ad.startedAt ? ` · no ar desde ${fmtDate(ad.startedAt)}${r.days != null ? ` (${r.days} dias${r.gone ? ' até sair' : ''})` : ''}` : ''}
              {' · '}<a href={ad.url} target="_blank" rel="noreferrer" className="text-primary-ink inline-flex items-center gap-0.5">abrir na Biblioteca<ExternalLink className="size-3" /></a>
            </DialogDescription>
          </div>
          {r.gone && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 shrink-0"><LogOut className="size-3" />Fora do ar</span>}
          <StatusBadge status={r.status} sinal={r.sinal} />
        </header>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          {/* mídia e destino */}
          <aside className="md:w-[360px] shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/30 overflow-y-auto p-5 space-y-4">
            <div className="rounded-xl overflow-hidden bg-muted border border-border">
              {ad.media.type === 'video' && ad.media.videoUrl && !r.gone
                ? <video src={ad.media.videoUrl} poster={r.thumb ?? ad.media.thumbnail ?? undefined} controls preload="none" playsInline className="w-full max-h-[460px] bg-black" />
                : <Img local={r.thumb} remote={ad.media.thumbnail} className="w-full max-h-[460px] object-contain" fallback={<div className="aspect-square grid place-items-center text-xs text-muted-foreground">sem miniatura</div>} />}
            </div>
            {ad.media.type === 'video' && (r.gone || !ad.media.videoUrl) && <p className="text-xs text-muted-foreground">Vídeo pesado não vai para o repositório: só a miniatura fica guardada.</p>}
            <dl className="text-xs space-y-1.5">
              <Linha k="Plataformas"><span className="inline-flex gap-1.5 items-center">{ad.platforms.map((p) => <span key={p} title={platformLabel(p)}><PlatformIcon platform={p} size={14} /></span>)}{!ad.platforms.length && '—'}</span></Linha>
              {ad.variations != null && ad.variations > 1 && <Linha k="Variações">{ad.variations} anúncios usam este criativo</Linha>}
              {r.hist && <Linha k="Coletas">visto em {r.hist.coletas}{r.hist.saiuEm ? `; saiu até ${fmtDate(r.hist.saiuEm)}` : ''}{r.hist.reapareceu ? '; o criativo voltou com outro id' : ''}</Linha>}
              {ad.endedAt && <Linha k="Terminou">{fmtDate(ad.endedAt)}</Linha>}
            </dl>
            {(ad.cta || ad.linkUrl) && (
              <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  {ad.cta && <span className="px-2 py-0.5 rounded bg-muted font-medium">{ad.cta}</span>}
                  {c && <ChipDestino c={c} />}
                </div>
                {ad.linkUrl && <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="block text-primary-ink hover:underline break-all" title={ad.linkUrl}>{host}{(() => { try { const u = new URL(ad.linkUrl); return u.pathname !== '/' ? u.pathname : ''; } catch { return ''; } })()}</a>}
                {c?.sinais.utm?.campaign && <p className="text-muted-foreground">Campanha (UTM): {c.sinais.utm.campaign}</p>}
              </div>
            )}
          </aside>

          {/* miolo */}
          <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-6">
            <Secao titulo="Texto do anúncio">
              {title && <p className="font-semibold text-sm">{title}</p>}
              {text ? <p className="text-sm leading-relaxed whitespace-pre-line">{text}</p> : <p className="text-sm text-muted-foreground italic">{ad.text?.includes('{{') ? 'Catálogo (texto dinâmico): a Biblioteca não traz o texto real.' : 'Sem texto.'}</p>}
              {clean(ad.description) && <p className="text-xs text-muted-foreground">{clean(ad.description)}</p>}
              {c?.oferta.tem && <div><ChipOferta c={c} /></div>}
            </Secao>

            {c && auto && (
              <Secao titulo="Classificação" dica="Escolha o valor certo. O seu vale sobre a regra (e sobre a IA); coleta nova e reclassificação não apagam.">
                <div className="grid gap-3">
                  {CAMPOS.map((f) => {
                    const regra = auto[f.k];
                    // ordem fixa: a sua correção (marks.json) > a análise da IA (ficha) > a regra. Editar aqui escreve SÓ no marks.json
                    const { valor, origem } = resolverCampo(f.k, regra as string, mark, ia?.[f.k]);
                    // o que valeria sem a sua correção: escolher esse valor desfaz a correção
                    const { valor: semVoce, origem: origemSemVoce } = resolverCampo(f.k, regra as string, undefined, ia?.[f.k]);
                    const linhas = origem === 'regra' ? motivosDe(auto, f.k) : [];
                    const motivoIa = ia?.motivo?.[f.k];
                    const iaTxt = ia?.[f.k] ? (ia[f.k] === regra ? `A IA confirmou a regra (${f.labels[regra as string]}).` : `A IA ${motivoIa ? 'corrigiu a regra' : 'disse'}: ${f.labels[ia[f.k]!]}.`) : '';
                    return (
                      <div key={f.k} className="grid grid-cols-[88px_1fr] gap-x-3 items-start">
                        <Tip content={f.hint}><span className="text-xs font-medium text-muted-foreground pt-2 cursor-default">{f.label}</span></Tip>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <SelectField aria-label={f.label} value={valor} options={optionsOf(f)}
                              onChange={(x) => x && onMark({ override: { [f.k]: x === semVoce ? null : x } })} />
                            {origem === 'voce'
                              ? <>
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary-ink text-[11px] font-semibold px-2 py-0.5"><UserRound className="size-3" />você</span>
                                <Tip content={`Voltar ao automático (${origemSemVoce === 'ia' ? 'IA' : 'regras'}: ${f.labels[semVoce as string]})`}>
                                  <button type="button" onClick={() => onMark({ override: { [f.k]: null } })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Undo2 className="size-3.5" />voltar ao automático</button>
                                </Tip>
                              </>
                              : origem === 'ia'
                                ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 text-[11px] font-semibold px-2 py-0.5"><Sparkles className="size-3" />IA</span>
                                : <span className={cx('text-[11px]', auto.confiancaCampos[f.k] < 0.5 ? 'text-warning-ink' : 'text-muted-foreground')}>regra · {Math.round(auto.confiancaCampos[f.k] * 100)}%{auto.confiancaCampos[f.k] < 0.5 ? ' (incerto)' : ''}</span>}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground leading-snug">
                            {origem === 'voce' ? `As regras diziam: ${f.labels[regra as string]}.${iaTxt ? ` ${iaTxt}` : ''}`
                              : origem === 'ia' ? `${iaTxt}${motivoIa ? ` Motivo: ${motivoIa}` : ''}`
                              : linhas.length ? linhas.join(' · ').replace(/• /g, '') : 'Nenhum sinal forte: valor padrão das regras.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Secao>
            )}

            <Secao titulo="Análise da IA" dica="Ficha do anúncio (040). Funil, tipo e objetivo ficam em Classificação, acima.">
              <AnaliseAnuncio slug={slug} compId={r.compId} fichaKey={fichaKey} resumo={selo} />
            </Secao>

            <Secao titulo="Nota" dica="Por que este anúncio importa, o que copiar (o mecanismo, não a frase).">
              <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Ex.: abre com a dor do prontuário; oferta de 15 dias sem cartão." />
            </Secao>

            <Secao titulo="Tags">
              <TagsInput slug={slug} value={tags} onChange={(t) => onMark({ tags: t })} />
              {grupos.map((g) => (
                <div key={g.g} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground w-full sm:w-auto sm:mr-1">{g.nome}</span>
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
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 px-6 py-3 border-t border-border bg-muted/30">
          <Tip content={saved ? 'Tirar dos salvos (apaga a cópia guardada; nota e tags ficam)' : 'Guarda uma cópia do anúncio e da miniatura: continua abrindo inteiro mesmo se a Biblioteca tirar do ar.'}>
            <Button variant={saved ? 'soft' : 'primary'} className="inline-flex items-center gap-1.5" onClick={() => onMark({ saved: !saved })}>
              {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}{saved ? 'Salvo' : 'Salvar anúncio'}
            </Button>
          </Tip>
          {saved && mark?.savedAt && <span className="text-xs text-muted-foreground">salvo {timeAgo(mark.savedAt)}{mark.frozenMedia ? ' · miniatura guardada' : ''}</span>}
          {r.fromCopy && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Info className="size-3.5" />Aberto pela cópia guardada: o anúncio não está mais na coleta.</span>}
          <span className="ml-auto text-xs text-muted-foreground hidden lg:inline">Sem gasto nem alcance na Biblioteca: o sinal é indireto.</span>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function Secao({ titulo, dica, children }: { titulo: string; dica?: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h3>
        {dica && <span className="text-xs text-muted-foreground">{dica}</span>}
      </div>
      {children}
    </section>
  );
}
function Linha({ k, children }: { k: string; children: ReactNode }) {
  return <div className="flex gap-2"><dt className="w-20 shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0">{children}</dd></div>;
}
