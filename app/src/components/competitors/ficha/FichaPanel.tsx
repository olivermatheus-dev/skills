// Painel do item (040 D, unificado na 042): diálogo grande, o mesmo com ou sem análise profunda. Hierarquia pensada para "por que funcionou, em 10 s":
// à esquerda a mídia, os quadros-chave e o desempenho; à direita a hipótese (por quê), headline e gancho, os 5 s e a classificação;
// abaixo, abas Resumo · Roteiro · Detalhes · Fonte. Tudo editável: cada edição vai para `override` (nunca apagado pela reanálise),
// marcada como "você"; se a IA mudar de ideia numa reanálise posterior, o campo mostra "a IA agora diz: …".
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Ban, Captions, Check, CircleDot, Clock, ExternalLink, FileText, Film, Flame, Lightbulb, Pencil, Plus, RefreshCw, ScanSearch, Sparkles, TriangleAlert, Undo2, X,
} from 'lucide-react';
import type { EdicaoInfo, FichaView, ItemMark, OpcaoVocab, VocabView } from '../../../api';
import type { FichaCampos } from '../../../../../schema/ficha';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button, Field, Input, SelectField, Textarea, cx, fmtDate, fmtNum, type SelectOption } from '../../kit';
import { PlatformIcon, STATUS_COLOR, STATUS_LABEL, Spinner, TYPE_LABEL, fmtPct, fmtRatio, platformLabel, slugify, timeAgo, type Row } from '../lib';
import { Thumb, FavStar, ViewsHistory, isVertical, mercadoTip, mercadoVazioTip, perfilTip, porSeguidorTip, titleOf } from '../Items';
import { Tip } from '../toolbar';
import { useFicha, useFichasResumo, useFichasVocab, usePedido } from './useFichas';
import { analiseParaIdeia, type IdeaExtra } from './paraIdeia';
import { RelatorioDialog } from '../relatorios/Relatorios';
import { GRUPO_TERMO, TermoDialog, estadoNoVocab, rotuloAceitar, destinoDoTermo, useDecidirTermo } from './TermoDialog';

/** "Virar ideia" dentro do painel: `foco` = a adaptação escolhida (sem foco = o item inteiro) */
type OnIdea = (title: string, foco?: { ideia: string; formato?: string | null }) => void;

type Campos = Partial<FichaCampos>;

// ───────────────────────── vocabulário ─────────────────────────
/** caminho editável → grupo do vocabulário */
const GRUPO: Record<string, string> = {
  'tema.tag': 'tema', 'tipoConteudo.principal': 'tipoConteudo', 'tipoConteudo.secundarios': 'tipoConteudo', formato: 'formato', estiloProducao: 'estiloProducao',
  'gancho.tipo': 'tipoGancho', 'gancho.canal': 'canalGancho', 'estrutura.macro': 'estruturaMacro', 'cta.tipo': 'ctaTipo', 'produto.presenca': 'produtoPresenca',
  'publico.quem': 'publico', 'publico.consciencia': 'consciencia', tom: 'tom', som: 'som', autoria: 'autoria', angulo: 'angulo', provaTipo: 'provaTipo',
};
const ROTULO: Record<string, string> = {
  'tema.texto': 'tema', 'tema.tag': 'tag do tema', mensagem: 'mensagem', 'tipoConteudo.principal': 'tipo', 'tipoConteudo.secundarios': 'tipos secundários', formato: 'formato',
  estiloProducao: 'estilo', 'headline.texto': 'headline', 'gancho.texto': 'gancho', 'gancho.tipo': 'tipo de gancho', 'gancho.canal': 'canal do gancho', retencao5s: 'primeiros 5 s',
  gatilhos: 'gatilhos', 'estrutura.macro': 'estrutura', 'cta.tipo': 'CTA', 'cta.texto': 'texto do CTA', 'produto.presenca': 'presença do produto', 'publico.quem': 'público',
  'publico.consciencia': 'consciência', tom: 'tom', som: 'som', porQue: 'por quê', adaptar: 'adaptar', riscos: 'riscos', replicavel: 'replicável', autoria: 'autoria', serie: 'série', angulo: 'ângulo', provaTipo: 'prova',
};
/** o que `faltou` quer dizer, em palavras */
const FALTOU_ROTULO: Record<string, string> = {
  'sem-transcricao': 'sem transcrição', 'sem-quadros': 'sem quadros', 'legenda-vazia': 'legenda vazia', 'audio-sem-fala': 'áudio sem fala', 'midia-indisponivel': 'mídia indisponível', 'so-capa': 'só a capa (carrossel)',
};
const GRUPO_NOME: Record<string, string> = {
  tipoConteudo: 'tipo de conteúdo', gatilho: 'gatilho', tipoGancho: 'tipo de gancho', canalGancho: 'canal do gancho', elemento5s: 'elemento dos 5 s', estruturaMacro: 'estrutura',
  estiloProducao: 'estilo de produção', ctaTipo: 'CTA', produtoPresenca: 'presença do produto', consciencia: 'consciência', tom: 'tom', som: 'som', risco: 'risco', autoria: 'autoria',
  formato: 'formato', tema: 'tema', angulo: 'ângulo', publico: 'público', provaTipo: 'prova', funil: 'funil',
};

export interface Ctx {
  slug: string; v: FichaView; vocab?: VocabView; saving: boolean;
  edit: (path: string, value: unknown) => void; revert: (path: string) => void;
}
export const FCtx = createContext<Ctx | null>(null);
const useF = () => useContext(FCtx)!;

function useVoc() {
  const { v, vocab } = useF();
  const novos = v.ficha.analise?.termosNovos ?? [];
  const termo = (g: string, id: string | null | undefined): (OpcaoVocab & { proposto?: boolean; recusado?: boolean }) | undefined => {
    if (!id) return undefined;
    const t = vocab?.grupos[g]?.find((x) => x.id === id);
    if (t) return t;
    const n = novos.find((x) => x.grupo === g && x.valor === id);
    // proposto = termo novo que ainda espera o Oliver; recusado = ele recusou e a ficha ainda o usa (reetiquetar pelo selo)
    const recusado = estadoNoVocab(vocab, g, id) === 'recusado';
    return n ? { id, nome: id.replace(/-/g, ' '), definicao: n.definicao, proposto: !recusado, recusado } : { id, nome: id.replace(/-/g, ' ') };
  };
  const nome = (g: string, id: string | null | undefined) => termo(g, id)?.nome ?? '—';
  const options = (g: string, atual?: string | null, vazio?: string): SelectOption[] => {
    const base = (vocab?.grupos[g] ?? []).map((t) => ({ value: t.id, label: t.nome }));
    const prop = novos.filter((t) => t.grupo === g && !base.some((b) => b.value === t.valor))
      .map((t) => ({ value: t.valor, label: t.valor.replace(/-/g, ' '), icon: <Sparkles className="text-violet-600" />, group: 'Proposto pela IA' }));
    const fora = atual && !base.some((b) => b.value === atual) && !prop.some((p) => p.value === atual) ? [{ value: atual, label: `${atual} (fora do vocabulário)` }] : [];
    return [...(vazio ? [{ value: '', label: vazio }] : []), ...base, ...prop, ...fora];
  };
  return { termo, nome, options };
}

/** valor da IA, legível (para o "a IA agora diz") */
function useFmtIa() {
  const { nome } = useVoc();
  return (path: string, val: unknown): string => {
    if (val == null || val === '' || (Array.isArray(val) && !val.length)) return 'vazio';
    const g = GRUPO[path];
    if (path === 'gatilhos') return (val as { id: string }[]).map((x) => nome('gatilho', x.id)).join(', ');
    if (path === 'retencao5s') return (val as { t: string; elemento: string }[]).map((x) => `${x.t} ${nome('elemento5s', x.elemento)}`).join(' · ');
    if (path === 'adaptar') return (val as { ideia: string }[]).map((x, i) => `${i + 1}. ${x.ideia}`).join(' ');
    if (path === 'riscos') return (val as { tipo: string }[]).map((x) => nome('risco', x.tipo)).join(', ');
    if (g && Array.isArray(val)) return (val as string[]).map((x) => nome(g, x)).join(', ');
    if (g) return nome(g, String(val));
    return typeof val === 'string' ? `“${val}”` : String(val);
  };
}

// ───────────────────────── peças de edição ─────────────────────────
/** select de vocabulário com cara de chip (o valor É o controle) */
export function VSelect({ path, grupo, value, onChange, vazio, size = 'sm', className, label }: {
  path?: string; grupo: string; value?: string | null; onChange?: (v: string) => void; vazio?: string; size?: 'sm' | 'md'; className?: string; label?: string;
}) {
  const { edit } = useF();
  const { termo, options } = useVoc();
  const t = termo(grupo, value);
  const set = onChange ?? ((x: string) => path && edit(path, x || null));
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
    <Tip content={t?.definicao ? `${t.proposto ? 'Termo novo proposto pela IA: use o selo ao lado para aceitar ou recusar.\n' : ''}${t.definicao}` : undefined}>
      <span className="inline-flex max-w-full">
        <SelectField size="sm" aria-label={label ?? GRUPO_NOME[grupo] ?? grupo} value={value ?? ''} options={options(grupo, value, vazio)} placeholder={<span className="text-muted-foreground">escolher…</span>}
          icon={t?.proposto ? <Sparkles className="text-violet-600" /> : undefined} onChange={set}
          className={cx('rounded-full border max-w-full', size === 'md' ? '!h-8 !px-3 !text-[13px] font-medium' : '!h-7 font-medium',
            t?.proposto ? 'border-dashed border-violet-400 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-200' : 'bg-muted/70 border-transparent hover:bg-muted', className)} />
      </span>
    </Tip>
    {(t?.proposto || t?.recusado) && value && <TermoSelo grupo={grupo} valor={value} recusado={t.recusado} />}
    </span>
  );
}

/** selo "termo novo" (ou "recusado", se a ficha ainda o usa): 1 clique abre o diálogo de aceitar/recusar com o substituto já escolhido */
export function TermoSelo({ grupo, valor, recusado, mini }: { grupo: string; valor: string; recusado?: boolean; mini?: boolean }) {
  const { slug } = useF();
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)} title={recusado ? 'Termo recusado que esta ficha ainda usa: reetiquetar' : 'Termo novo proposto pela IA: aceitar ou recusar'}
        className={cx('inline-flex items-center gap-1 rounded-full border font-semibold shrink-0', mini ? 'h-5 px-1.5 text-[10px]' : 'h-6 px-2 text-[11px]',
          recusado ? 'border-border bg-muted text-muted-foreground hover:text-foreground' : 'border-violet-300 bg-violet-600 text-white hover:bg-violet-700 dark:border-violet-500/40')}>
        {recusado ? <Ban className="size-3" /> : <Sparkles className="size-3" />}{recusado ? 'recusado' : 'termo novo'}
      </button>
      {aberto && <TermoDialog slug={slug} grupo={grupo} valor={valor} modo={recusado ? 'recusar' : undefined} onClose={() => setAberto(false)} />}
    </>
  );
}

/** lista de chips de vocabulário (secundários, tom, público) */
export function MultiSelect({ path, grupo, values, max }: { path: string; grupo: string; values: string[]; max?: number }) {
  const { edit } = useF();
  const { termo, options } = useVoc();
  const livres = options(grupo).filter((o) => !values.includes(o.value));
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {values.map((id) => {
        const t = termo(grupo, id);
        return (
          <Tip key={id} content={t?.definicao}>
            <span className={cx('inline-flex items-center gap-1 rounded-full pl-2.5 pr-1 h-7 text-xs font-medium', t?.proposto ? 'border border-dashed border-violet-400 bg-violet-50 text-violet-800 dark:bg-violet-500/10 dark:text-violet-200' : 'bg-muted/70')}>
              {t?.proposto && <Sparkles className="size-3" />}{t?.nome ?? id}{(t?.proposto || t?.recusado) && <TermoSelo grupo={grupo} valor={id} recusado={t.recusado} mini />}
              <button type="button" aria-label={`Tirar ${t?.nome ?? id}`} className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-background" onClick={() => edit(path, values.filter((x) => x !== id))}><X className="size-3" /></button>
            </span>
          </Tip>
        );
      })}
      {(!max || values.length < max) && livres.length > 0 && (
        <SelectField size="sm" aria-label={`Adicionar ${GRUPO_NOME[grupo] ?? grupo}`} value="" options={livres} placeholder={<span className="inline-flex items-center gap-1"><Plus className="size-3" />{values.length ? '' : 'adicionar'}</span>}
          onChange={(x) => x && edit(path, [...values, x])} className="!h-7 rounded-full border-dashed text-muted-foreground bg-transparent" />
      )}
    </span>
  );
}

/** texto livre editável no lugar: clique para editar; Enter (ou Ctrl+Enter no multilinha) salva, Esc cancela, sair do campo salva */
export function EditText({ path, value, multiline, className, placeholder = 'clique para escrever', onSave }: {
  path?: string; value?: string | null; multiline?: boolean; className?: string; placeholder?: string; onSave?: (v: string) => void;
}) {
  const { edit } = useF();
  const [on, setOn] = useState(false);
  const [txt, setTxt] = useState(value ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!on) setTxt(value ?? ''); }, [value, on]);
  useEffect(() => { if (on && ref.current) { ref.current.focus(); ref.current.select(); ref.current.style.height = `${ref.current.scrollHeight + 2}px`; } }, [on]);
  const save = () => { setOn(false); if (txt.trim() !== (value ?? '').trim()) (onSave ?? ((x: string) => path && edit(path, x)))(txt); };
  if (on) return (
    <textarea ref={ref} rows={1} value={txt} className={cx('block w-[calc(100%+1rem)] resize-none rounded-md border border-primary bg-card outline-none text-[length:inherit] leading-[inherit] font-[inherit] py-1 px-2 -mx-2 -my-1', className)}
      onChange={(e) => { setTxt(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight + 2}px`; }}
      onBlur={save} onKeyDown={(e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setTxt(value ?? ''); setOn(false); }
        if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
      }} />
  );
  return (
    <button type="button" onClick={() => setOn(true)} title="Clique para editar"
      className={cx('group/et text-left rounded-md -mx-1.5 px-1.5 -my-0.5 py-0.5 hover:bg-muted/70 transition w-[calc(100%+0.75rem)]', className)}>
      {value ? <span className="whitespace-pre-line">{value}</span> : <span className="text-muted-foreground italic">{placeholder}</span>}
      <Pencil className="inline size-3 ml-1.5 -mt-0.5 text-muted-foreground opacity-0 group-hover/et:opacity-100 transition" />
    </button>
  );
}

/** bloco com rótulo; marca "você" quando algum dos caminhos foi editado e mostra "a IA agora diz" quando divergiu */
export function Campo({ label, icon, paths = [], children, className, aside }: { label: ReactNode; icon?: ReactNode; paths?: string[]; children: ReactNode; className?: string; aside?: ReactNode }) {
  const { v, revert } = useF();
  const fmt = useFmtIa();
  const eds = paths.map((p) => [p, v.edicoes[p]] as [string, EdicaoInfo | undefined]).filter((x): x is [string, EdicaoInfo] => !!x[1]);
  const div = eds.filter(([, e]) => e.diverge);
  return (
    <section className={className}>
      <div className="flex items-center gap-2 mb-1.5 min-h-5">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5 [&_svg]:size-3.5">{icon}{label}</h4>
        {eds.length > 0 && (
          <Tip content={`Editado por você${eds[0][1].em ? ` em ${fmtDate(eds[0][1].em)}` : ''}: ${eds.map(([p]) => ROTULO[p] ?? p).join(', ')}.\nUma reanálise nunca apaga.`}>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary-ink text-[10px] font-semibold px-1.5 py-px">você</span>
          </Tip>
        )}
        {eds.length > 0 && (
          <Tip content={eds.length === 1 ? `Voltar ao da IA: ${fmt(eds[0][0], eds[0][1].ia)}` : 'Voltar tudo deste bloco ao da IA'}>
            <button type="button" aria-label="Voltar ao valor da IA" onClick={() => eds.forEach(([p]) => revert(p))} className="text-muted-foreground hover:text-foreground"><Undo2 className="size-3.5" /></button>
          </Tip>
        )}
        {aside && <span className="ml-auto">{aside}</span>}
      </div>
      {children}
      {div.map(([p, e]) => (
        <div key={p} className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200 px-2 py-1.5 text-xs">
          <CircleDot className="size-3.5 mt-px shrink-0" />
          <span className="flex-1"><b>A IA agora diz</b>{eds.length > 1 || paths.length > 1 ? ` (${ROTULO[p] ?? p})` : ''}: {fmt(p, e.ia)}. <span className="opacity-75">Mantido o seu.</span></span>
          <button type="button" className="font-medium underline underline-offset-2 shrink-0" onClick={() => revert(p)}>usar o da IA</button>
        </div>
      ))}
    </section>
  );
}

// ───────────────────────── quadros e medidas ─────────────────────────
const fmtS = (ms: number) => `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`;
const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function Ratio({ v, label, tip, fmt = fmtRatio }: { v?: number | null; label: string; tip?: string; fmt?: (n?: number) => string }) {
  const hot = (v ?? 0) >= 3 && fmt === fmtRatio, warm = (v ?? 0) >= 1.5 && fmt === fmtRatio;
  return (
    <Tip content={tip}>
      <div className={cx('rounded-lg px-2.5 py-2 cursor-help', hot ? 'bg-amber-400 text-amber-950' : warm ? 'bg-card border border-border' : 'bg-card border border-border')}>
        <div className={cx('text-lg font-semibold tabular-nums leading-tight inline-flex items-center gap-0.5', v == null && 'text-muted-foreground')}>{hot && <Flame className="size-4" />}{v == null ? '—' : fmt(v)}</div>
        <div className={cx('text-[11px]', hot ? 'text-amber-950/80' : 'text-muted-foreground')}>{label}</div>
      </div>
    </Tip>
  );
}

function MediaCol({ r, media }: { r: Row; media?: string }) {
  const { v } = useF();
  const f = v.ficha, md = f.medidas;
  const quadros = [...(f.insumos?.quadros ?? [])].sort((a, b) => a.tMs - b.tMs);
  const [sel, setSel] = useState(0);
  const q = quadros[sel];
  const vertical = isVertical(r);
  const src = (arq: string) => `${v.quadrosUrl}${arq.split('/').map(encodeURIComponent).join('/')}`;
  const viewsHoje = r.item.metrics.views, viewsAnalise = md.views;
  const mudou = viewsHoje != null && viewsAnalise != null && Math.abs(viewsHoje - viewsAnalise) / Math.max(1, viewsAnalise) > 0.05;
  return (
    <div className="space-y-4">
      {/* o número que explica o resto vem antes da mídia: precisa estar visível sem rolar */}
      <div className="grid grid-cols-3 gap-1.5">
        <Ratio v={md.xPerfil} label="× perfil" tip={r.outlier != null ? perfilTip(r) : 'views ÷ mediana do próprio perfil'} />
        <Ratio v={md.xMercado} label="× mercado" tip={md.xMercado != null ? mercadoTip(r) : (mercadoVazioTip(r) ?? 'Sem mercado: menos de 3 concorrentes com dados nesta rede.')} />
        <Ratio v={md.porSeguidor} label="por seguidor" fmt={(n) => (n != null && n >= 1 ? fmtRatio(n) : fmtPct(n))} tip={porSeguidorTip(r) ?? 'views ÷ seguidores do perfil'} />
      </div>
      <div className={cx('relative rounded-xl overflow-hidden bg-zinc-900 mx-auto', vertical ? 'aspect-[9/16] max-h-[min(400px,42vh)]' : 'aspect-video')}>
        {q ? <img src={src(q.arquivo)} alt={q.descricao ?? `quadro em ${fmtS(q.tMs)}`} className="absolute inset-0 w-full h-full object-contain" />
          : <Thumb r={r} media={media} className="absolute inset-0" />}
        {q && quadros.length > 1 && <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] font-medium px-1.5 py-0.5 rounded tabular-nums">{fmtS(q.tMs)}</span>}
        {q?.ocr && <Tip content={`Texto na tela (OCR): ${q.ocr}`}><span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">texto na tela</span></Tip>}
      </div>
      {quadros.length > 1 ? (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5"><Film className="size-3.5" />Quadros-chave <span className="font-normal normal-case tracking-normal">· {quadros.length}</span></div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {quadros.map((x, i) => (
              <button key={x.tMs} type="button" onClick={() => setSel(i)} onMouseEnter={() => setSel(i)} title={x.descricao ?? fmtS(x.tMs)}
                className={cx('shrink-0 rounded-md overflow-hidden ring-2 transition', i === sel ? 'ring-primary' : 'ring-transparent opacity-80 hover:opacity-100')}>
                <img src={src(x.arquivo)} alt="" className={cx('block object-cover bg-zinc-900', vertical ? 'w-10 h-[71px]' : 'w-16 h-9')} />
                <div className="text-[10px] tabular-nums text-center py-0.5 bg-background">{fmtS(x.tMs)}</div>
              </button>
            ))}
          </div>
        </div>
      ) : quadros.length === 1 ? <div className="text-xs text-muted-foreground -mt-2">Só a capa: o vídeo não pôde ser baixado.</div> : null}

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Números</div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          {([['Views', md.views], ['Curtidas', md.likes], ['Comentários', md.comments], ['Envios', md.shares], ...(md.saves != null ? [['Salvos', md.saves]] : []), ['Seguidores', md.seguidores]] as [string, number | null | undefined][]).map(([k, n]) => (
            <div key={k} className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1">
              <dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold tabular-nums">{fmtNum(n ?? undefined)}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1 col-span-2">
            <dt className="text-xs text-muted-foreground">Engajamento</dt><dd className="font-semibold tabular-nums">{fmtPct(md.engajamento ?? undefined)}</dd>
          </div>
        </dl>
        <div className="text-[11px] text-muted-foreground mt-1.5">
          Medidas congeladas na análise ({fmtDate(f.analise?.geradoEm)}).{mudou && <> Hoje: <b className="text-foreground">{fmtNum(viewsHoje)}</b> views.</>}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── abas ─────────────────────────
export function Gatilhos({ c }: { c: Campos }) {
  const { edit } = useF();
  const { nome } = useVoc();
  const lista = c.gatilhos ?? [];
  const [novo, setNovo] = useState<{ id: string; trecho: string; onde: string } | null>(null);
  const set = (l: typeof lista) => edit('gatilhos', l);
  return (
    <Campo label={<>Gatilhos mentais <span className="font-normal normal-case tracking-normal">· com a prova</span></>} paths={['gatilhos']}
      aside={!novo && <button type="button" className="text-xs text-primary-ink inline-flex items-center gap-1 hover:underline" onClick={() => setNovo({ id: '', trecho: '', onde: '' })}><Plus className="size-3" />gatilho</button>}>
      {!lista.length && !novo && <div className="text-sm text-muted-foreground">Nenhum gatilho com prova.</div>}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {lista.map((g, i) => (
          <li key={`${g.id}-${i}`} className="grid grid-cols-[170px_1fr_auto] items-start gap-3 px-3 py-2">
            <VSelect grupo="gatilho" value={g.id} label="Gatilho" onChange={(x) => x && set(lista.map((y, j) => (j === i ? { ...y, id: x } : y)))} />
            <div className="min-w-0 text-sm pt-0.5">
              <span className="text-foreground">“{g.trecho}”</span>
              {g.onde && <span className="text-xs text-muted-foreground ml-1.5 whitespace-nowrap">{g.onde}</span>}
            </div>
            <Tip content={`Tirar ${nome('gatilho', g.id)}`}><button type="button" aria-label="Tirar gatilho" className="text-muted-foreground hover:text-destructive mt-1" onClick={() => set(lista.filter((_, j) => j !== i))}><X className="size-3.5" /></button></Tip>
          </li>
        ))}
        {novo && (
          <li className="grid grid-cols-[170px_1fr_auto] items-center gap-3 px-3 py-2 bg-muted/40">
            <VSelect grupo="gatilho" value={novo.id} label="Gatilho" onChange={(x) => setNovo({ ...novo, id: x })} />
            <div className="flex gap-2">
              <input className="flex-1 min-w-0 h-7 rounded-md border border-border bg-card px-2 text-sm" placeholder="trecho literal que prova (obrigatório)" value={novo.trecho} onChange={(e) => setNovo({ ...novo, trecho: e.target.value })} />
              <input className="w-28 h-7 rounded-md border border-border bg-card px-2 text-sm" placeholder="onde (fala 0:04)" value={novo.onde} onChange={(e) => setNovo({ ...novo, onde: e.target.value })} />
            </div>
            <span className="flex gap-1">
              <Button className="!h-7 !px-2 text-xs" disabled={!novo.id || !novo.trecho.trim()} onClick={() => { set([...lista, { id: novo.id, trecho: novo.trecho.trim(), onde: novo.onde.trim() || null }]); setNovo(null); }}>Pôr</Button>
              <Button variant="ghost" className="!h-7 !px-2 text-xs" onClick={() => setNovo(null)}>Cancelar</Button>
            </span>
          </li>
        )}
      </ul>
    </Campo>
  );
}

function Resumo({ c, onIdea, ideaBusy }: { c: Campos; onIdea: OnIdea; ideaBusy: boolean }) {
  const { edit } = useF();
  return (
    <div className="space-y-6">
      <Gatilhos c={c} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Campo label="Estrutura" paths={['estrutura.macro']}><VSelect path="estrutura.macro" grupo="estruturaMacro" value={c.estrutura?.macro} vazio="—" /></Campo>
        <Campo label="CTA" paths={['cta.tipo', 'cta.texto']}>
          <div className="space-y-1">
            <VSelect path="cta.tipo" grupo="ctaTipo" value={c.cta?.tipo} vazio="—" />
            {(c.cta?.tipo && c.cta.tipo !== 'nenhum') || c.cta?.texto ? <div className="text-sm"><EditText path="cta.texto" value={c.cta?.texto} placeholder="texto do CTA" /></div> : null}
            {c.cta?.momento && <div className="text-xs text-muted-foreground">quando: {c.cta.momento}</div>}
          </div>
        </Campo>
        <Campo label="Produto" paths={['produto.presenca']}>
          <VSelect path="produto.presenca" grupo="produtoPresenca" value={c.produto?.presenca} vazio="—" />
          {c.produto?.primeiraMencaoS != null && <div className="text-xs text-muted-foreground mt-1">aparece aos {c.produto.primeiraMencaoS} s</div>}
        </Campo>
      </div>
      <Campo label={<>Adaptar para a nossa marca</>} icon={<Lightbulb />} paths={['adaptar']}>
        {!(c.adaptar ?? []).length && <div className="text-sm text-muted-foreground">Sem sugestão.</div>}
        <ol className="space-y-2">
          {(c.adaptar ?? []).map((a, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span className="size-5 shrink-0 rounded-full bg-muted text-xs font-semibold grid place-items-center mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0 text-sm space-y-1.5">
                <EditText value={a.ideia} multiline onSave={(x) => x.trim() && edit('adaptar', (c.adaptar ?? []).map((y, j) => (j === i ? { ...y, ideia: x.trim() } : y)))} />
                <VSelect grupo="formato" value={a.formato} vazio="sem formato" label="Formato da adaptação" onChange={(x) => edit('adaptar', (c.adaptar ?? []).map((y, j) => (j === i ? { ...y, formato: x || null } : y)))} />
              </div>
              <Button variant="soft" className="!h-7 !px-2 text-xs shrink-0 inline-flex items-center gap-1" disabled={ideaBusy}
                onClick={() => onIdea(a.ideia.replace(/^["“]|["”]$/g, '').slice(0, 120), { ideia: a.ideia, formato: a.formato })}>
                <Lightbulb className="size-3.5" />Virar ideia
              </Button>
            </li>
          ))}
        </ol>
      </Campo>
      <Campo label="O que não copiar" icon={<TriangleAlert />} paths={['riscos']}>
        {(c.riscos ?? []).length ? (
          <ul className="space-y-1">{(c.riscos ?? []).map((x, i) => <li key={i} className="text-sm"><RiscoChip id={x.tipo} />{x.trecho && <span className="text-muted-foreground ml-1.5">“{x.trecho}”</span>}</li>)}</ul>
        ) : <div className="text-sm text-muted-foreground">Nenhum risco apontado.</div>}
      </Campo>
      <TermosNovos />
    </div>
  );
}

/** termos novos que ESTA ficha propôs: aceitar (1 clique) ou recusar (diálogo com o substituto já escolhido) */
function TermosNovos() {
  const { slug, v, vocab } = useF();
  const termos = v.ficha.analise?.termosNovos ?? [];
  const [recusar, setRecusar] = useState<{ grupo: string; valor: string } | null>(null);
  const m = useDecidirTermo(slug);
  if (!termos.length) return null;
  return (
    <Campo label={<>Termos novos propostos <span className="font-normal normal-case tracking-normal">· {termos.length}</span></>} icon={<Sparkles />}>
      <ul className="grid gap-2 sm:grid-cols-2">
        {termos.map((t) => {
          const estado = estadoNoVocab(vocab, t.grupo, t.valor);
          return (
            <li key={`${t.grupo}:${t.valor}`} className={cx('rounded-lg border p-3', estado === 'pendente' ? 'border-dashed border-violet-300 bg-violet-50/50 dark:bg-violet-500/5 dark:border-violet-500/30' : 'border-border bg-muted/30')}>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-300 font-semibold">{GRUPO_NOME[t.grupo] ?? t.grupo}</span>
                <b className="truncate">{t.valor}</b>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.definicao}</p>
              {estado === 'pendente' ? (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Button variant="soft" disabled={m.isPending} onClick={() => m.mutate({ grupo: t.grupo, valor: t.valor, decisao: 'aceito' })} className="!h-7 !px-2 text-xs inline-flex items-center gap-1" title={`Ao aceitar, ${destinoDoTermo(t.grupo)}`}><Check className="size-3" />{rotuloAceitar(t.grupo)}</Button>
                  <Button variant="ghost" disabled={m.isPending} onClick={() => setRecusar({ grupo: t.grupo, valor: t.valor })} className="!h-7 !px-2 text-xs inline-flex items-center gap-1" title="Recusar: pede o termo existente que fica no lugar"><Ban className="size-3" />Recusar</Button>
                </div>
              ) : estado === 'aceito' ? (
                <div className="mt-2 text-xs font-medium text-success-ink inline-flex items-center gap-1"><Check className="size-3" />{t.grupo === 'formato' ? 'formato rascunho criado' : 'aceito'}
                  {t.grupo === 'formato' && <Link to={`/p/${slug}/formatos?formato=${t.valor}`} className="underline font-normal ml-1">ver na galeria</Link>}</div>
              ) : (
                <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1"><Ban className="size-3" />recusado
                  {(v.campos && JSON.stringify(v.campos).includes(`"${t.valor}"`)) && <button type="button" className="underline ml-1" onClick={() => setRecusar({ grupo: t.grupo, valor: t.valor })}>reetiquetar</button>}</div>
              )}
            </li>
          );
        })}
      </ul>
      {recusar && <TermoDialog slug={slug} grupo={recusar.grupo} valor={recusar.valor} modo="recusar" onClose={() => setRecusar(null)} />}
    </Campo>
  );
}

function RiscoChip({ id }: { id: string }) {
  const { termo } = useVoc();
  const t = termo('risco', id);
  return <Tip content={t?.definicao}><span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300 px-2 py-0.5 text-xs font-medium"><TriangleAlert className="size-3" />{t?.nome ?? id}</span></Tip>;
}

function Roteiro({ c }: { c: Campos }) {
  const { v } = useF();
  const ins = v.ficha.insumos;
  const segs = ins?.transcricao?.segmentos ?? [];
  const quadros = [...(ins?.quadros ?? [])].sort((a, b) => a.tMs - b.tMs);
  const falaEm = (ms: number) => segs.find((s) => ms / 1000 >= s.ini && ms / 1000 < s.fim)?.texto;
  const src = (arq: string) => `${v.quadrosUrl}${arq.split('/').map(encodeURIComponent).join('/')}`;
  const blocos = c.estrutura?.blocos ?? [];
  const legenda = ins?.legendaLimpa ?? ('caption' in v.ficha.item ? v.ficha.item.caption : undefined);
  return (
    <div className="space-y-6">
      {blocos.length > 0 && (
        <Campo label="Estrutura, bloco a bloco">
          <ol className="relative border-l-2 border-border ml-1.5 space-y-3">
            {blocos.map((b, i) => (
              <li key={i} className="pl-4 relative">
                <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-background border-2 border-primary" />
                <div className="flex items-baseline gap-2"><span className="text-xs font-semibold uppercase tracking-wide">{b.bloco}</span>{b.quando && <span className="text-xs tabular-nums text-muted-foreground">{b.quando}</span>}</div>
                <p className="text-sm">{b.oque}</p>
              </li>
            ))}
          </ol>
        </Campo>
      )}
      <Campo label="Quadro a quadro" icon={<Film />}>
        {!quadros.length ? <div className="text-sm text-muted-foreground">Sem quadros.</div> : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {quadros.map((q) => (
              <li key={q.tMs} className="grid grid-cols-[48px_52px_1fr] gap-3 p-2.5 items-start">
                <img src={src(q.arquivo)} alt="" className="w-12 h-[85px] object-cover rounded bg-zinc-900" />
                <span className="text-xs font-semibold tabular-nums pt-0.5">{fmtS(q.tMs)}</span>
                <div className="text-sm space-y-1 min-w-0">
                  {q.descricao && <p>{q.descricao}</p>}
                  {q.ocr && <p className="text-xs"><span className="text-muted-foreground">na tela:</span> <span className="font-medium">“{q.ocr}”</span></p>}
                  {falaEm(q.tMs) && <p className="text-xs"><span className="text-muted-foreground">fala:</span> “{falaEm(q.tMs)}”</p>}
                  {!q.descricao && !q.ocr && <p className="text-xs text-muted-foreground">sem descrição</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Campo>
      <Campo label={<>Transcrição {ins?.transcricao && <span className="font-normal normal-case tracking-normal">· {ins.transcricao.fonte === 'yt-auto-subs' ? 'legenda automática do YouTube' : ins.transcricao.fonte}</span>}</>} icon={<Captions />}>
        {!ins?.transcricao ? (
          <div className="text-sm text-muted-foreground">Sem transcrição{ins?.faltou.length ? ` (${ins.faltou.map((x) => FALTOU_ROTULO[x] ?? x).join(', ')})` : ''}.</div>
        ) : segs.length ? (
          <ul className="space-y-1.5">{segs.map((s, i) => <li key={i} className="grid grid-cols-[72px_1fr] gap-2 text-sm"><span className="text-xs tabular-nums text-muted-foreground pt-0.5">{fmtClock(s.ini)}–{fmtClock(s.fim)}</span><span>{s.texto}</span></li>)}</ul>
        ) : <p className="text-sm whitespace-pre-line">{ins.transcricao.texto}</p>}
      </Campo>
      {legenda && (
        <Campo label="Legenda do post"><p className="text-sm whitespace-pre-line bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">{legenda}</p></Campo>
      )}
    </div>
  );
}

function Detalhes({ c }: { c: Campos }) {
  const { edit } = useF();
  const of = c.oferta;
  const conf = c.confianca;
  return (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      <Campo label="Mensagem" paths={['mensagem']} className="sm:col-span-2"><div className="text-sm"><EditText path="mensagem" value={c.mensagem} multiline placeholder="o que a pessoa leva, em 1 frase" /></div></Campo>
      <Campo label="Público" paths={['publico.quem']}><MultiSelect path="publico.quem" grupo="publico" values={c.publico?.quem ?? []} /></Campo>
      <Campo label="Consciência" paths={['publico.consciencia']}><VSelect path="publico.consciencia" grupo="consciencia" value={c.publico?.consciencia} vazio="—" /></Campo>
      <Campo label="Tom" paths={['tom']}><MultiSelect path="tom" grupo="tom" values={c.tom ?? []} max={2} /></Campo>
      <Campo label="Som" paths={['som']}><VSelect path="som" grupo="som" value={c.som} vazio="—" /></Campo>
      <Campo label="Autoria" paths={['autoria']}><VSelect path="autoria" grupo="autoria" value={c.autoria} vazio="não se sabe" /></Campo>
      <Campo label="Série" paths={['serie']}><div className="text-sm"><EditText path="serie" value={c.serie} placeholder="quadro recorrente, se houver" /></div></Campo>
      <Campo label="Replicável" paths={['replicavel']}>
        <SelectField size="sm" aria-label="Replicável" value={c.replicavel == null ? '' : String(c.replicavel)} onChange={(x) => edit('replicavel', x === '' ? null : Number(x))} className="!h-7 rounded-full bg-muted/70 border-transparent font-medium"
          options={[{ value: '', label: '—' }, { value: '0', label: '0 · depende de quem fala' }, { value: '1', label: '1 · difícil' }, { value: '2', label: '2 · dá com ajuste' }, { value: '3', label: '3 · qualquer marca faz amanhã' }]} />
      </Campo>
      <Campo label="Ritmo e tela">
        <div className="text-sm space-y-0.5">
          <div>{c.ritmo?.cortesPorMin != null ? `${c.ritmo.cortesPorMin.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} cortes por minuto` : 'cortes: —'}</div>
          <div className="text-muted-foreground">{c.legendaTela == null ? 'legenda queimada: —' : c.legendaTela ? 'com legenda queimada' : 'sem legenda queimada'}</div>
        </div>
      </Campo>
      <Campo label="Oferta">
        {of?.tem ? (
          <div className="text-sm space-y-0.5">
            {of.tipos?.length ? <div>{of.tipos.join(', ')}</div> : null}
            {of.precoBRL != null && <div>R$ {of.precoBRL.toLocaleString('pt-BR')}</div>}
            {of.diasTeste != null && <div>{of.diasTeste} dias de teste</div>}
            {of.cupom && <div>cupom <b>{of.cupom}</b></div>}
            {of.trecho && <div className="text-muted-foreground">“{of.trecho}”</div>}
          </div>
        ) : <div className="text-sm text-muted-foreground">sem oferta</div>}
      </Campo>
      <Campo label="Funcionalidades mostradas"><div className="text-sm">{c.produto?.funcionalidades?.length ? c.produto.funcionalidades.join(', ') : <span className="text-muted-foreground">nenhuma</span>}</div></Campo>
      <Campo label="Hashtags"><div className="text-sm text-muted-foreground break-words">{c.hashtags?.length ? c.hashtags.join(' ') : '—'}</div></Campo>
      <Campo label="Confiança da IA">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {(['texto', 'visual', 'retencao'] as const).map((k) => (
            <span key={k} className={cx('rounded-full px-2 py-0.5', conf?.[k] === 'alta' ? 'bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300' : conf?.[k] === 'media' ? 'bg-muted' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300')}>
              {k === 'retencao' ? 'retenção' : k}: {conf?.[k] === 'media' ? 'média' : conf?.[k] ?? '—'}
            </span>
          ))}
        </div>
      </Campo>
    </div>
  );
}

function Fonte() {
  const { v } = useF();
  const f = v.ficha, a = f.analise, ins = f.insumos;
  const linha = (k: string, val: ReactNode) => <div className="grid grid-cols-[150px_1fr] gap-3 py-1.5 border-b border-border/60 text-sm"><dt className="text-muted-foreground">{k}</dt><dd>{val}</dd></div>;
  const eds = Object.entries(v.edicoes);
  return (
    <div className="space-y-6">
      <dl>
        {linha('Modelo', a ? `${a.modelo}${a.esforco ? ` · esforço ${a.esforco}` : ''}` : '—')}
        {linha('Gerada em', a ? `${fmtDate(a.geradoEm)} (${timeAgo(a.geradoEm)})` : '—')}
        {linha('Versões', a ? `prompt v${a.versaoPrompt} · vocabulário v${a.versaoVocab}` : '—')}
        {linha('Custo', a?.custo ? `${fmtNum(a.custo.entrada)} tokens de entrada · ${fmtNum(a.custo.saida)} de saída${a.custo.usd != null ? ` · US$ ${a.custo.usd.toFixed(2)}` : ''} · via ${a.custo.via}` : '—')}
        {linha('Insumos', ins ? `${ins.transcricao ? `transcrição (${ins.transcricao.fonte})` : 'sem transcrição'} · ${ins.quadros.length} quadro(s)${ins.cenas?.length ? ` · ${ins.cenas.length} cortes` : ''} · preparado em ${fmtDate(ins.preparadoEm)}${ins.tempos ? ` (${ins.tempos.total.toLocaleString('pt-BR')} s)` : ''}` : '—')}
        {linha('Faltou', ins?.faltou.length || a?.campos.faltou?.length ? [...new Set([...(ins?.faltou ?? []), ...(a?.campos.faltou ?? [])])].map((x) => FALTOU_ROTULO[x] ?? x).join(', ') : 'nada')}
        {linha('Coleta de origem', `${f.origem.arquivo} · ${fmtDate(f.origem.collectedAt)}`)}
        {linha('Arquivo', <code className="text-xs">competitors/{f.competitorId}/fichas/{f.key.replace(':', '__')}.json</code>)}
      </dl>
      <Campo label={`Suas edições · ${eds.length}`}>
        {!eds.length ? <div className="text-sm text-muted-foreground">Nenhuma. Tudo o que você editar fica guardado à parte e nenhuma reanálise apaga.</div> : (
          <ul className="text-sm space-y-1">{eds.map(([p, e]) => <li key={p} className="flex gap-2"><span className="font-medium">{ROTULO[p] ?? p}</span><span className="text-muted-foreground">{e.em ? fmtDate(e.em) : ''}</span>{e.diverge && <span className="text-amber-700 inline-flex items-center gap-1"><CircleDot className="size-3" />a IA mudou depois</span>}</li>)}</ul>
        )}
      </Campo>
      <Campo label={`Análises anteriores · ${f.anteriores.length}`}>
        {!f.anteriores.length ? <div className="text-sm text-muted-foreground">Nenhuma (esta é a primeira).</div> : (
          <ul className="text-sm space-y-1">{f.anteriores.map((x) => <li key={x.geradoEm}>{fmtDate(x.geradoEm)} · {x.modelo} · prompt v{x.versaoPrompt}</li>)}</ul>
        )}
      </Campo>
    </div>
  );
}

// ───────────────────────── o painel ─────────────────────────
/** "Por que funcionou" muda de título conforme o desempenho, para a leitura bater com o número */
const tituloPorQue = (x?: number | null) => (x == null ? 'Por que performou assim' : x >= 1.5 ? 'Por que funcionou' : x < 0.9 ? 'Por que não decolou' : 'Por que ficou na média');

function Corpo({ r, media, onIdea, ideaBusy, nota, temNota }: { r: Row; media?: string; onIdea: OnIdea; ideaBusy: boolean; nota: ReactNode; temNota: boolean }) {
  const { v, edit } = useF();
  const c = v.campos;
  // o porQue é guardado como a IA escreve ("hipótese: …"); a tela tira o prefixo e o devolve ao salvar
  const porQue = c.porQue?.replace(/^hip[oó]tese:\s*/i, '');
  const [tab, setTab] = useState('resumo');
  return (
    <div className="flex-1 min-h-0 grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] overflow-y-auto lg:overflow-hidden">
      <aside className="lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border bg-muted/30 p-5"><MediaCol r={r} media={media} /></aside>
      <div className="lg:overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* 1. o porquê, primeiro: é a pergunta de quem abre */}
          <Campo label={tituloPorQue(v.ficha.medidas.xPerfil)} icon={<ScanSearch />} paths={['porQue']}
            aside={<span className="text-[11px] text-muted-foreground">hipótese da IA</span>}
            className="rounded-xl border border-violet-200 bg-violet-50/60 dark:bg-violet-500/5 dark:border-violet-500/25 p-4">
            <div className="text-[15px] leading-relaxed"><EditText path="porQue" value={porQue} multiline placeholder="hipótese de por que performou" onSave={(x) => edit('porQue', x.trim() ? `hipótese: ${x.trim().replace(/^hip[oó]tese:\s*/i, '')}` : null)} /></div>
          </Campo>

          {/* 2. o que a pessoa vê e ouve primeiro */}
          <div className="grid gap-5 xl:grid-cols-2">
            <Campo label={<>Headline <span className="font-normal normal-case tracking-normal">· {c.headline?.fonte === 'tela' ? 'na tela' : c.headline?.fonte ?? '—'}</span></>} paths={['headline.texto']}>
              <blockquote className="border-l-[3px] border-foreground/80 pl-3 text-[15px] font-semibold leading-snug"><EditText path="headline.texto" value={c.headline?.texto} placeholder="sem headline" /></blockquote>
            </Campo>
            <Campo label="Gancho" paths={['gancho.texto', 'gancho.tipo', 'gancho.canal']}>
              <blockquote className="border-l-[3px] border-primary pl-3 text-[15px] leading-snug"><EditText path="gancho.texto" value={c.gancho?.texto} placeholder="gancho não identificado" /></blockquote>
              <div className="flex flex-wrap gap-1.5 mt-2 pl-3">
                <VSelect path="gancho.tipo" grupo="tipoGancho" value={c.gancho?.tipo} vazio="tipo indefinido" />
                <VSelect path="gancho.canal" grupo="canalGancho" value={c.gancho?.canal} vazio="canal —" />
              </div>
            </Campo>
          </div>

          <Cinco c={c} />

          {/* 3. classificação */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 rounded-xl border border-border p-4">
            <Campo label="Tipo" paths={['tipoConteudo.principal', 'tipoConteudo.secundarios']}>
              <div className="flex flex-wrap gap-1.5 items-center">
                <VSelect path="tipoConteudo.principal" grupo="tipoConteudo" value={c.tipoConteudo?.principal} size="md" />
                {c.tipoConteudo?.principal && <MultiSelect path="tipoConteudo.secundarios" grupo="tipoConteudo" values={c.tipoConteudo?.secundarios ?? []} max={2} />}
              </div>
            </Campo>
            <Campo label="Formato" paths={['formato']}><VSelect path="formato" grupo="formato" value={c.formato} vazio="sem formato" size="md" /></Campo>
            <Campo label="Estilo" paths={['estiloProducao']}><VSelect path="estiloProducao" grupo="estiloProducao" value={c.estiloProducao} vazio="—" size="md" /></Campo>
            <Campo label="Tema" paths={['tema.texto', 'tema.tag']}>
              <div className="text-sm leading-snug mb-1.5"><EditText path="tema.texto" value={c.tema?.texto} placeholder="tema" /></div>
              <VSelect path="tema.tag" grupo="tema" value={c.tema?.tag} vazio="sem tag" />
            </Campo>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-y border-border px-6 py-2">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="roteiro"><Captions />Roteiro</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="nota">Minha nota{temNota && <span className="size-1.5 rounded-full bg-primary" />}</TabsTrigger>
              <TabsTrigger value="fonte">Fonte</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6">
            <TabsContent value="resumo"><Resumo c={c} onIdea={onIdea} ideaBusy={ideaBusy} /></TabsContent>
            <TabsContent value="roteiro"><Roteiro c={c} /></TabsContent>
            <TabsContent value="detalhes"><Detalhes c={c} /></TabsContent>
            <TabsContent value="nota"><div className="max-w-xl">{nota}</div></TabsContent>
            <TabsContent value="fonte"><Fonte /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

/** primeiros 5 s: uma linha do tempo com o que segura e o gatilho que ativa */
function Cinco({ c }: { c: Campos }) {
  const { edit } = useF();
  const lista = c.retencao5s ?? [];
  const set = (i: number, patch: Partial<(typeof lista)[number]>) => edit('retencao5s', lista.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <Campo label="Primeiros 5 s · o que segura" icon={<Clock />} paths={['retencao5s']}>
      {!lista.length ? <div className="text-sm text-muted-foreground">Sem leitura dos 5 s.</div> : (
        <ol className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
          {lista.map((x, i) => (
            <li key={i} className="relative min-w-0 rounded-lg border border-border bg-card p-2.5 space-y-1.5">
              <div className="text-xs font-semibold tabular-nums text-muted-foreground">{x.t}</div>
              <VSelect grupo="elemento5s" value={x.elemento} label="Elemento" onChange={(e) => e && set(i, { elemento: e })} />
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><span>ativa</span><VSelect grupo="gatilho" value={x.gatilho} vazio="—" label="Gatilho" onChange={(g) => set(i, { gatilho: g || null })} /></div>
            </li>
          ))}
        </ol>
      )}
    </Campo>
  );
}

// ───────────────────────── marcação do Oliver (status, tags, nota) ─────────────────────────
/** tags e nota em edição; salvam ao sair do campo, ao trocar de item e ao fechar o painel (o cleanup grava o que sobrou) */
function useMarcacao(r: Row, onMark: (patch: Partial<ItemMark>) => void) {
  const m = r.mark;
  const [note, setNote] = useState(m?.note ?? '');
  const [tags, setTags] = useState((m?.tags ?? []).join(', '));
  const parseTags = (s: string) => [...new Set(s.split(/[,\s]+/).map((t) => slugify(t.replace(/^#/, ''))).filter((t) => t && t !== 'item'))];
  const latest = useRef({ note, tags, m, onMark });
  latest.current = { note, tags, m, onMark };
  const flush = useCallback(() => {
    const { note: n, tags: t, m: mk, onMark: om } = latest.current;
    const patch: Partial<ItemMark> = {};
    if (n !== (mk?.note ?? '')) patch.note = n;
    const pt = parseTags(t);
    if (pt.join() !== (mk?.tags ?? []).join()) patch.tags = pt;
    if (Object.keys(patch).length) om(patch);
  }, []);
  useEffect(() => () => flush(), [flush]);
  const saveTags = () => { flush(); setTags(parseTags(tags).join(', ')); };
  return { note, setNote, tags, setTags, parseTags, flush, saveTags };
}
type Marcacao = ReturnType<typeof useMarcacao>;

function CamposMarcacao({ mar, suggestions }: { mar: Marcacao; suggestions: string[] }) {
  return (
    <div className="space-y-3">
      <Field label="Tags" hint="separadas por vírgula; salvam ao sair do campo">
        <Input className="w-full" list="item-tags" value={mar.tags} onChange={(e) => mar.setTags(e.target.value)} onBlur={mar.saveTags} placeholder="ex.: gancho-forte, humor" />
        <datalist id="item-tags">{suggestions.map((t) => <option key={t} value={t} />)}</datalist>
      </Field>
      <Field label="Nota" hint="o que chamou atenção: gancho, estrutura, formato…">
        <Textarea rows={3} value={mar.note} onChange={(e) => mar.setNote(e.target.value)} onBlur={mar.flush} placeholder="Ex.: abre com pergunta; prova social aos 10 s; CTA para salvar." />
      </Field>
    </div>
  );
}

// ───────────────────────── "Analisar / Reanalisar" ─────────────────────────
function useAnalisar(slug: string, compId: string, mk: string) {
  const { pedir, cancelar } = usePedido(slug, compId, mk);
  const err = (pedir.error ?? cancelar.error) as { message?: string } | null;
  return { pedir, cancelar, busy: pedir.isPending || cancelar.isPending, erro: err?.message };
}

/** estado vazio de um conteúdo ainda sem análise: o convite é a ação principal da tela */
function SemAnaliseConvite({ naFila, a }: { naFila: boolean; a: ReturnType<typeof useAnalisar> }) {
  return (
    <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/60 dark:bg-violet-500/5 dark:border-violet-500/30 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <ScanSearch className="size-8 text-violet-600 shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{naFila ? 'Na fila de análise' : 'Ainda sem análise'}</div>
        <p className="text-sm text-muted-foreground mt-0.5">{naFila
          ? 'Roda quando você pedir “roda a fila de fichas” no Claude Code (≈ US$ 0,08 por item).'
          : 'A IA lê o vídeo e devolve tema, tipo, gancho, gatilhos dos 5 s e por que funcionou. Grava o pedido; nada roda sozinho.'}</p>
        {a.erro && <p className="text-xs text-destructive mt-1">{a.erro}</p>}
      </div>
      {naFila
        ? <Button variant="ghost" disabled={a.busy} onClick={() => a.cancelar.mutate()} className="shrink-0">{a.busy ? <Spinner /> : 'Tirar da fila'}</Button>
        : <Button disabled={a.busy} onClick={() => a.pedir.mutate()} className="shrink-0 inline-flex items-center gap-1.5">{a.busy ? <Spinner /> : <ScanSearch className="size-4" />}Analisar este</Button>}
    </div>
  );
}

// ───────────────────────── sem análise: o miolo ─────────────────────────
/** coluna da esquerda sem ficha: os mesmos números (× perfil, × mercado, por seguidor) lidos da última coleta */
function ColunaSimples({ r, media }: { r: Row; media?: string }) {
  const m = r.item.metrics;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5">
        <Ratio v={r.outlier} label="× perfil" tip={r.outlier != null ? perfilTip(r) : 'views ÷ mediana do próprio perfil'} />
        <Ratio v={r.outlierMercado} label="× mercado" tip={r.outlierMercado != null ? mercadoTip(r) : (mercadoVazioTip(r) ?? 'Sem mercado: menos de 3 concorrentes com dados nesta rede.')} />
        <Ratio v={r.porSeguidor} label="por seguidor" fmt={(n) => (n != null && n >= 1 ? fmtRatio(n) : fmtPct(n))} tip={porSeguidorTip(r) ?? 'views ÷ seguidores do perfil'} />
      </div>
      <Thumb r={r} media={media} className={cx('rounded-xl mx-auto', isVertical(r) ? 'aspect-[9/16] max-h-[min(400px,42vh)]' : 'aspect-video')} />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Números</div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          {([['Views', m.views], ['Curtidas', m.likes], ['Comentários', m.comments], ['Envios', m.shares], ...(m.saves != null ? [['Salvos', m.saves]] : [])] as [string, number | undefined][]).map(([k, n]) => (
            <div key={k} className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1">
              <dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold tabular-nums">{fmtNum(n)}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1 col-span-2">
            <dt className="text-xs text-muted-foreground">Engajamento</dt><dd className="font-semibold tabular-nums">{fmtPct(r.engagement)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function CorpoSemAnalise({ r, media, mar, suggestions, a, naFila, slug, ideaTitle, setIdeaTitle, ideaBusy, onIdea, focusIdea, ideaRef }: {
  r: Row; media?: string; mar: Marcacao; suggestions: string[]; a: ReturnType<typeof useAnalisar>; naFila: boolean; slug: string;
  ideaTitle: string; setIdeaTitle: (s: string) => void; ideaBusy: boolean; onIdea: () => void; focusIdea?: boolean; ideaRef: React.RefObject<HTMLDivElement | null>;
}) {
  const m = r.mark;
  useEffect(() => {
    if (!focusIdea) return;
    const t = setTimeout(() => { ideaRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); ideaRef.current?.querySelector('input')?.focus({ preventScroll: true }); }, 250);
    return () => clearTimeout(t);
  }, [focusIdea, r.mk, ideaRef]);
  return (
    <div className="flex-1 min-h-0 grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] overflow-y-auto lg:overflow-hidden">
      <aside className="lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border bg-muted/30 p-5"><ColunaSimples r={r} media={media} /></aside>
      <div className="lg:overflow-y-auto p-6 space-y-6">
        <SemAnaliseConvite naFila={naFila} a={a} />
        {r.item.caption && r.item.caption !== r.item.title && (
          <details open={!r.item.title}>
            <summary className="text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer">Legenda / descrição</summary>
            <p className="text-sm whitespace-pre-line mt-2 max-h-48 overflow-y-auto bg-muted rounded-lg p-3">{r.item.caption}</p>
          </details>
        )}
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Views por coleta</div>
          <ViewsHistory r={r} />
        </div>
        <CamposMarcacao mar={mar} suggestions={suggestions} />
        <div ref={ideaRef} data-virar-ideia className="bg-primary-soft/60 border border-primary/20 rounded-lg p-3">
          {m?.ideaId ? (
            <div className="text-sm"><Sparkles className="inline size-3.5 -mt-0.5" /> Virou a ideia <b>{m.ideaId}</b>. <Link to={`/p/${slug}/ideias`} className="text-primary-ink">Abrir banco de ideias →</Link></div>
          ) : (
            <>
              <div className="text-xs font-medium text-primary-ink uppercase tracking-wide mb-2">Virar ideia</div>
              <div className="flex gap-2">
                <Input className="flex-1" value={ideaTitle} onChange={(e) => setIdeaTitle(e.target.value)} placeholder="Título da ideia" />
                <Button disabled={!ideaTitle.trim() || ideaBusy} onClick={onIdea}>{ideaBusy ? <Spinner /> : 'Criar ideia'}</Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">Leva o link, as métricas, o outlier e a sua nota; o item fica como “analisada”.</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── o diálogo único (042) ─────────────────────────
const STATUS_OPTS: SelectOption[] = Object.entries(STATUS_LABEL).map(([k, label]) => ({ value: k, label, icon: <span className="size-2 rounded-full" style={{ background: STATUS_COLOR[k as ItemMark['status']] }} /> }));

export interface ItemPanelProps {
  r: Row | null; compId?: string; media?: string; open: boolean; onClose: () => void; slug: string; profileLabel?: string; tagSuggestions: string[];
  /** abre já no "Virar ideia" (rola até o bloco e foca o título) */
  focusIdea?: boolean;
  onMark: (patch: Partial<ItemMark>) => void; onIdea: (title: string, tags: string[], note: string, extra?: IdeaExtra) => void; ideaBusy: boolean;
  /** um item citado no relatório de origem foi clicado (outro que não este): quem usa troca o painel */
  onOpenItem?: (key: string) => void;
}

/**
 * Um painel só para o conteúdo (042): mesma moldura com ou sem análise (cabeçalho, coluna da mídia e dos números, rodapé com favorito,
 * status, Virar ideia e Analisar/Reanalisar). O miolo muda: com análise = abas da ficha; sem = convite "Analisar este" + nota, tags e ideia.
 */
export function ItemPanel(p: ItemPanelProps) {
  const res = useFichasResumo(p.slug);
  if (!p.r || !p.compId || !p.open) return null;
  if (res.loading) return null; // evita piscar o estado vazio antes de saber se há análise
  return <Painel key={`${p.compId}/${p.r.mk}`} {...p} r={p.r} compId={p.compId} analisada={!!res.of(p.compId, p.r.mk)?.analisada} naFila={!!res.of(p.compId, p.r.mk)?.naFila} />;
}

function Painel({ r, compId, analisada, naFila, slug, media, open, onClose, profileLabel, tagSuggestions, focusIdea, onMark, onIdea, ideaBusy, onOpenItem }:
  ItemPanelProps & { r: Row; compId: string; analisada: boolean; naFila: boolean }) {
  const fq = useFicha(slug, compId, r.mk, open && analisada);
  const vocab = useFichasVocab(slug);
  const v = analisada ? fq.data : undefined;
  const ctx = useMemo<Ctx | null>(() => (v ? { slug, v, vocab: vocab.data, saving: fq.saving, edit: fq.edit, revert: fq.revert } : null), [slug, v, vocab.data, fq.saving, fq.edit, fq.revert]);
  const m = r.mark;
  const a = v?.ficha.analise;
  const mar = useMarcacao(r, onMark);
  const an = useAnalisar(slug, compId, r.mk);
  const [ideaTitle, setIdeaTitle] = useState(() => titleOf(r).slice(0, 120));
  const [relAberto, setRelAberto] = useState(false);
  const ideaRef = useRef<HTMLDivElement>(null);
  // com análise: a análise inteira vai para o corpo da ideia; a ficha e o relatório de origem ficam no `source` (040 I)
  const ideiaAnalisada: OnIdea = (title, foco) => { mar.flush(); onIdea(title, m?.tags ?? [], m?.note ?? '', v ? analiseParaIdeia(v, compId, foco) : undefined); };
  const ideiaSimples = () => { mar.flush(); onIdea(ideaTitle.trim(), mar.parseTags(mar.tags), mar.note); };
  const rel = v?.relatorio ?? null;
  const fechar = () => { mar.flush(); onClose(); };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
        <DialogContent aria-describedby={undefined}
          className="p-0 gap-0 flex flex-col overflow-hidden w-[calc(100vw-2rem)] max-w-[1280px] sm:max-w-[1280px] h-[calc(100vh-2rem)] max-h-[1000px]">
          <header className="flex items-center gap-3 px-6 py-3.5 pr-14 border-b border-border">
            <PlatformIcon platform={r.platform} size={20} />
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold leading-snug truncate" title={titleOf(r)}>{titleOf(r)}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                {platformLabel(r.platform)} · {TYPE_LABEL[r.item.type] ?? r.item.type}{profileLabel ? ` · ${profileLabel}` : ''}
                {r.item.durationS ? ` · ${Math.round(r.item.durationS)} s` : ''}{r.item.publishedAt ? ` · publicado em ${fmtDate(r.item.publishedAt)} (${timeAgo(r.item.publishedAt)})` : ' · data desconhecida'}
                {' · '}<a href={r.item.url} target="_blank" rel="noreferrer" className="text-primary-ink inline-flex items-center gap-0.5">abrir original<ExternalLink className="size-3" /></a>
              </DialogDescription>
            </div>
            {fq.saving && <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Spinner />salvando</span>}
            {rel && (
              <Tip content={`Este conteúdo é citado no relatório de ${fmtDate(rel.gerado)}.\nAbre o relatório.`}>
                <button type="button" onClick={() => setRelAberto(true)} className="inline-flex items-center gap-1 rounded-full border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-[11px] font-medium px-2 py-0.5 shrink-0">
                  <FileText className="size-3" />Relatório de origem
                </button>
              </Tip>
            )}
            {a ? (
              <Tip content={`Análise de ${a.modelo} em ${fmtDate(a.geradoEm)}.\nO que tem o selo "você" foi editado por você e nenhuma reanálise apaga.`}>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 text-white text-[11px] font-medium px-2 py-0.5 shrink-0"><Sparkles className="size-3" />Análise da IA · {fmtDate(a.geradoEm)}</span>
              </Tip>
            ) : !analisada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium px-2 py-0.5 shrink-0">{naFila ? <><Clock className="size-3" />Na fila</> : 'Sem análise'}</span>
            )}
          </header>

          {!analisada ? (
            <CorpoSemAnalise r={r} media={media} mar={mar} suggestions={tagSuggestions} a={an} naFila={naFila} slug={slug} ideaTitle={ideaTitle} setIdeaTitle={setIdeaTitle}
              ideaBusy={ideaBusy} onIdea={ideiaSimples} focusIdea={focusIdea} ideaRef={ideaRef} />
          ) : !ctx ? (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">{fq.isError ? 'Não foi possível abrir a ficha.' : <Spinner />}</div>
          ) : (
            <FCtx.Provider value={ctx}>
              <Corpo r={r} media={media} onIdea={ideiaAnalisada} ideaBusy={ideaBusy}
                nota={<CamposMarcacao mar={mar} suggestions={tagSuggestions} />} temNota={!!(m?.note || m?.tags.length)} />
            </FCtx.Provider>
          )}

          <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 px-6 py-3 border-t border-border bg-muted/30">
            <FavStar on={!!m?.favorite} onClick={() => onMark({ favorite: !m?.favorite })} size="size-5" />
            <SelectField size="sm" aria-label="Status" value={m?.status ?? 'nova'} options={STATUS_OPTS} onChange={(x) => onMark({ status: x as ItemMark['status'] })} />
            {m?.ideaId ? (
              <Link to={`/p/${slug}/ideias`} className="inline-flex items-center gap-1 text-sm font-medium text-success-ink"><Sparkles className="size-3.5" />Virou a ideia {m.ideaId}</Link>
            ) : analisada ? (
              <Button variant="soft" disabled={ideaBusy || !v} className="inline-flex items-center gap-1.5"
                onClick={() => ideiaAnalisada((v?.campos.headline?.texto || titleOf(r)).slice(0, 120))}>
                {ideaBusy ? <Spinner /> : <Lightbulb className="size-4" />}Virar ideia
              </Button>
            ) : (
              <Button variant="soft" disabled={ideaBusy} className="inline-flex items-center gap-1.5"
                onClick={() => { ideaRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); ideaRef.current?.querySelector('input')?.focus({ preventScroll: true }); }}>
                <Lightbulb className="size-4" />Virar ideia
              </Button>
            )}
            {m?.updated && <span className="text-xs text-muted-foreground hidden lg:inline">marcado {timeAgo(m.updated)}</span>}
            {analisada && <span className="text-xs text-muted-foreground hidden xl:inline">Clique em qualquer valor para corrigir. O que você muda fica guardado à parte e vale sobre a IA.</span>}
            {analisada && (
              <span className="ml-auto inline-flex items-center gap-2">
                {an.erro && <span className="text-xs text-destructive">{an.erro}</span>}
                {naFila
                  ? <><span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3.5" />Reanálise na fila</span><Button variant="ghost" disabled={an.busy} onClick={() => an.cancelar.mutate()}>Tirar da fila</Button></>
                  : <Tip content="Entra na fila de fichas; roda com “roda a fila de fichas” no Claude Code. Suas edições continuam."><span>
                    <Button variant="ghost" disabled={an.busy} onClick={() => an.pedir.mutate()} className="inline-flex items-center gap-1.5">{an.busy ? <Spinner /> : <RefreshCw className="size-3.5" />}Reanalisar</Button>
                  </span></Tip>}
              </span>
            )}
          </footer>
        </DialogContent>
      </Dialog>
      {relAberto && rel && (
        <RelatorioDialog slug={slug} comp={compId} id={rel.id} onClose={() => setRelAberto(false)}
          onOpenItem={(k) => { setRelAberto(false); if (k !== r.mk) onOpenItem?.(k); }} />
      )}
    </>
  );
}
