// Botão "Pesquisar ideias" (041 F3), nas três abas de Ideias. Um clique abre o diálogo com tudo preenchido (série ou pilar mais
// antigo sem ideia nova, fontes ativas que cruzam, período, 8 ideias) e a estimativa; "Pesquisar" grava o pedido (o mesmo do
// terminal) e dispara a IA em segundo plano. O mesmo diálogo vira o painel de progresso, lido dos arquivos da rodada.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, CircleAlert, Clock, Coins, Loader2, Settings2, Sparkles, SquareTerminal, Square, TriangleAlert, Check } from 'lucide-react';
import { api, type PesquisaBody, type RodadaView, type Source } from '../../api';
import { Button, Input, SelectField, Textarea, cx, type SelectOption } from '../kit';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Spinner } from '../competitors/lib';
import { Tip } from '../competitors/toolbar';
import { qk, useIdeas, usePesquisa, usePesquisas, useSources, useStrategyRefs } from '../../queries';
import { toast } from '../toast';
import { PesquisaProgresso } from './PesquisaProgresso';
import { typeMeta } from './sources-meta';
import { LIMITE_AVISO_USD, duracao, fmtFaixa, fmtUsd, fontesPadrao, rotuloRodada, setRodadaEmTela, sobrePadrao, type Modo, type Sobre } from './pesquisa';

/** tique para atualizar "há 3 min" sem pedir nada ao servidor */
function useAgora(ms = 15000) {
  const [t, setT] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setT(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return t;
}

export function PesquisarIdeias({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState<string | null>(null);
  const st = usePesquisas(slug).data;
  const rodandoId = st?.rodando?.round ?? st?.rodadas.find((r) => r.estado === 'rodando')?.id ?? null;

  const abrir = () => { setRound(rodandoId); setOpen(true); };
  const fechar = () => { setOpen(false); setRound(null); };
  useEffect(() => { setRodadaEmTela(open ? round : null); return () => setRodadaEmTela(null); }, [open, round]);

  return (
    <>
      {rodandoId ? (
        <Button variant="soft" onClick={abrir} className="inline-flex items-center gap-1.5" title="A IA está pesquisando: ver o andamento">
          <Loader2 className="size-4 animate-spin" aria-hidden />Pesquisando…
        </Button>
      ) : (
        <Button onClick={abrir} className="inline-flex items-center gap-1.5" title="A IA procura ideias nas fontes aceitas e traz cada uma com referência verificada">
          <Sparkles className="size-4" aria-hidden />Pesquisar ideias
        </Button>
      )}
      <Dialog open={open} onOpenChange={(v) => { if (!v) fechar(); }}>
        <DialogContent className="sm:max-w-xl gap-3 max-h-[92vh] overflow-y-auto">
          {open && (round
            ? <Painel slug={slug} round={round} onClose={fechar} />
            : <Formulario slug={slug} onClose={fechar} onStarted={setRound} />)}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ───────────────────────── formulário ─────────────────────────
const MESES = [6, 12, 24, 36, 60];
const DIAS = [30, 60, 90];
const IDIOMAS: { id: 'pt' | 'en' | 'es'; label: string }[] = [{ id: 'pt', label: 'Português' }, { id: 'en', label: 'Inglês' }, { id: 'es', label: 'Espanhol' }];

function Formulario({ slug, onClose, onStarted }: { slug: string; onClose: () => void; onStarted: (round: string) => void }) {
  const qc = useQueryClient();
  const sourcesQ = useSources(slug), ideasQ = useIdeas(slug), refsQ = useStrategyRefs(slug), st = usePesquisas(slug).data;
  if (!sourcesQ.data || !ideasQ.data || !refsQ.data || !st) {
    return (<><DialogTitle>Pesquisar ideias</DialogTitle><div className="h-64 rounded-lg bg-muted animate-pulse" /></>);
  }
  return <FormularioPronto slug={slug} qc={qc} sources={sourcesQ.data} ideas={ideasQ.data} refs={refsQ.data} st={st} onClose={onClose} onStarted={onStarted} />;
}

function FormularioPronto({ slug, qc, sources, ideas, refs, st, onClose, onStarted }: {
  slug: string; qc: ReturnType<typeof useQueryClient>; sources: Source[]; ideas: NonNullable<ReturnType<typeof useIdeas>['data']>;
  refs: NonNullable<ReturnType<typeof useStrategyRefs>['data']>; st: NonNullable<ReturnType<typeof usePesquisas>['data']>; onClose: () => void; onStarted: (round: string) => void;
}) {
  const [sobre, setSobre] = useState<Sobre>(() => sobrePadrao(ideas, sources, refs, st.coletores));
  const [custom, setCustom] = useState<Set<string> | null>(null); // null = o padrão da escolha
  const [meses, setMeses] = useState(24);
  const [dias, setDias] = useState(60);
  const [n, setN] = useState(8);
  const [adv, setAdv] = useState(false);
  const [rapida, setRapida] = useState(false);
  const [idiomas, setIdiomas] = useState<('pt' | 'en' | 'es')[]>(['pt', 'en']);
  const [instrucoes, setInstrucoes] = useState('');

  const padrao = useMemo(() => fontesPadrao(sources, sobre), [sources, sobre]);
  const ids = custom ? [...custom] : padrao.ids;
  const escolhidas = ids.map((id) => sources.find((s) => s.id === id)).filter((s): s is Source => !!s);
  const naoAceitas = escolhidas.filter((s) => s.status !== 'ativa');
  const semColetor = (s: Source) => !s.access.adapter || !st.coletores.includes(s.access.adapter);
  const mudas = escolhidas.filter(semColetor);
  const temNoticia = escolhidas.some((s) => s.type === 'noticia');
  const est = rapida ? st.estimativa.rapida : st.estimativa.normal;
  const passa = est.usdHigh > LIMITE_AVISO_USD + 0.005;
  const ocupado = st.ocupado;

  const mudaSobre = (s: Sobre) => { setSobre(s); setCustom(null); };
  const serieOpts: SelectOption[] = refs.series.map((s) => ({ value: String(s.n), label: `${s.n} · ${s.name}`, count: fontesPadrao(sources, { modo: 'serie', n: s.n, tema: '' }).ids.length }));
  const pilarOpts: SelectOption[] = refs.pillars.map((p) => ({ value: String(p.n), label: `${p.n} · ${p.name}`, count: fontesPadrao(sources, { modo: 'pilar', n: p.n, tema: '' }).ids.length }));
  const primeiro = (modo: Modo) => (modo === 'serie' ? refs.series[0]?.n : refs.pillars[0]?.n) ?? null;

  const faltaTema = sobre.modo === 'tema' && !sobre.tema.trim();
  const semFonte = !ids.length;
  const invalido = faltaTema || semFonte || !Number.isInteger(n) || n < 1 || n > 20 || !idiomas.length;

  const pedir = useMutation({
    mutationFn: (acao: NonNullable<PesquisaBody['acao']>) => api.pedirPesquisa(slug, {
      serie: sobre.modo === 'serie' ? sobre.n : null, pilar: sobre.modo === 'pilar' ? sobre.n : null, tema: sobre.modo === 'tema' ? sobre.tema.trim() : null,
      fontes: ids, meses, diasNoticia: dias, ideias: n, rapida, idiomas, instrucoes, acao,
    }),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: qk.pesquisas(slug) });
      if (r.rodando) { toast.ok(r.modo === 'terminal' ? 'Aberto no terminal' : 'Pesquisa iniciada no Claude Code'); onStarted(r.round); }
      else { toast.info(r.aviso ? `Pedido gravado. ${r.aviso}` : 'Pedido gravado na aba Pesquisas'); onClose(); }
    },
    onError: (e) => toast.error(e, 'Não foi possível gravar o pedido'),
  });

  return (
    <>
      <DialogTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary-ink" />Pesquisar ideias</DialogTitle>
      <DialogDescription className="-mt-1">A IA procura nas fontes e traz ideias novas, cada uma com a referência (link, DOI e trecho conferidos por script).</DialogDescription>

      <section className="space-y-2" aria-label="Sobre o quê">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sobre o quê?</div>
        <Linha ativo={sobre.modo === 'serie'} onPick={() => sobre.modo !== 'serie' && mudaSobre({ modo: 'serie', n: primeiro('serie'), tema: '' })} label="Série">
          <SelectField aria-label="Série" className="w-full" value={sobre.modo === 'serie' ? String(sobre.n) : ''} placeholder="Escolher a série"
            onChange={(v) => mudaSobre({ modo: 'serie', n: +v, tema: '' })} options={serieOpts} />
        </Linha>
        <Linha ativo={sobre.modo === 'pilar'} onPick={() => sobre.modo !== 'pilar' && mudaSobre({ modo: 'pilar', n: primeiro('pilar'), tema: '' })} label="Pilar">
          <SelectField aria-label="Pilar" className="w-full" value={sobre.modo === 'pilar' ? String(sobre.n) : ''} placeholder="Escolher o pilar"
            onChange={(v) => mudaSobre({ modo: 'pilar', n: +v, tema: '' })} options={pilarOpts} />
        </Linha>
        <Linha ativo={sobre.modo === 'tema'} onPick={() => sobre.modo !== 'tema' && mudaSobre({ modo: 'tema', n: null, tema: '' })} label="Tema">
          <Input aria-label="Tema livre" className="w-full" placeholder="ex.: terapia online, cansaço do terapeuta" value={sobre.modo === 'tema' ? sobre.tema : ''}
            onFocus={() => sobre.modo !== 'tema' && mudaSobre({ modo: 'tema', n: null, tema: '' })} onChange={(e) => mudaSobre({ modo: 'tema', n: null, tema: e.target.value })} />
        </Linha>
      </section>

      <section className="space-y-1.5" aria-label="Fontes">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fontes <span className="font-normal normal-case tracking-normal tabular-nums">· {ids.length}</span></div>
          <TrocarFontes sources={sources} sobre={sobre} escolhidas={new Set(ids)} coletores={st.coletores} onChange={(s) => setCustom(s)} personalizada={!!custom} onPadrao={() => setCustom(null)} />
        </div>
        {semFonte
          ? <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">Nenhuma fonte para essa escolha. Aceite fontes na aba Fontes ou use “Trocar fontes”.</p>
          : <div className="flex flex-wrap gap-1">{escolhidas.slice(0, 6).map((s) => <Chip key={s.id} s={s} muda={semColetor(s)} />)}{escolhidas.length > 6 && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">+{escolhidas.length - 6}</span>}</div>}
        {mudas.length > 0 && (
          <p className="flex gap-1.5 text-xs text-muted-foreground"><CircleAlert className="mt-px size-3.5 shrink-0" />
            {mudas.length === escolhidas.length ? 'Nenhuma dessas fontes tem' : mudas.length === 1 ? '1 dessas fontes não tem' : `${mudas.length} dessas fontes não têm`} coletor por script ainda (tracejadas): {mudas.length === escolhidas.length ? 'a rodada não teria o que buscar.' : 'ficam de fora desta rodada.'}</p>
        )}
        {naoAceitas.length > 0 && (
          <p className="flex gap-1.5 text-xs text-amber-700 dark:text-amber-400"><CircleAlert className="mt-px size-3.5 shrink-0" />
            {naoAceitas.length === escolhidas.length ? 'Você ainda não aceitou nenhuma dessas fontes' : `${naoAceitas.length} dessas fontes ainda não foram aceitas`}
            {padrao.provisorias && !custom ? ': usei as sugeridas já conferidas, de confiança alta.' : '.'} Aceite na aba Fontes para fixar.</p>
        )}
      </section>

      <section className="grid grid-cols-[1fr_auto] items-end gap-x-3 gap-y-2" aria-label="Período e quantidade">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <label className="block text-xs text-muted-foreground">Estudos
            <SelectField aria-label="Período dos estudos" className="mt-1 w-40" value={String(meses)} onChange={(v) => setMeses(+v)} options={MESES.map((m) => ({ value: String(m), label: `Últimos ${m} meses` }))} />
          </label>
          {temNoticia && (
            <label className="block text-xs text-muted-foreground">Notícias
              <SelectField aria-label="Período das notícias" className="mt-1 w-36" value={String(dias)} onChange={(v) => setDias(+v)} options={DIAS.map((d) => ({ value: String(d), label: `Últimos ${d} dias` }))} />
            </label>
          )}
        </div>
        <label className="block text-xs text-muted-foreground">Quantas ideias
          <Input aria-label="Quantas ideias" type="number" min={1} max={20} className="mt-1 block w-24" value={Number.isNaN(n) ? '' : n} onChange={(e) => setN(e.target.value === '' ? NaN : Math.round(+e.target.value))} />
        </label>
      </section>

      <div>
        <button type="button" onClick={() => setAdv((v) => !v)} aria-expanded={adv} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          {adv ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}<Settings2 className="size-3.5" />Avançado
          <span className="font-normal">· {rapida ? 'rápida' : 'normal'}, {idiomas.join(' + ')}{instrucoes.trim() ? ', com instruções' : ''}</span>
        </button>
        {adv && (
          <div className="mt-2 space-y-3 rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Profundidade</div>
              <SelectField aria-label="Profundidade" className="w-full" value={rapida ? 'rapida' : 'normal'} onChange={(v) => setRapida(v === 'rapida')} options={[
                { value: 'normal', label: 'Normal · APIs e leitura de páginas' },
                { value: 'rapida', label: 'Rápida · só fontes com API ou RSS, sem subagente Sonnet' },
              ]} />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Idiomas dos estudos</div>
              <div className="flex flex-wrap gap-3">
                {IDIOMAS.map((l) => (
                  <label key={l.id} className="inline-flex cursor-pointer items-center gap-1.5 text-sm">
                    <Checkbox checked={idiomas.includes(l.id)} onCheckedChange={() => setIdiomas((x) => (x.includes(l.id) ? x.filter((y) => y !== l.id) : [...x, l.id]))} />{l.label}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Estudo em inglês entra explicado em português; os brasileiros têm prioridade.</p>
            </div>
            <label className="block text-xs font-medium text-muted-foreground">Instruções para esta rodada
              <Textarea rows={3} className="mt-1 text-sm font-normal" placeholder="ex.: só estudos com adultos; evitar tema de TDAH" value={instrucoes} onChange={(e) => setInstrucoes(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-muted-foreground" />~5–{est.minutes} min</span>
          <Tip content={est.real
            ? `Média real de ${est.real.n} rodada${est.real.n === 1 ? '' : 's'} anterior${est.real.n === 1 ? '' : 'es'} (resultado.json). Pela assinatura do Claude Code é cota do plano, não cobrança por token.`
            : 'Faixa do desenho (normal US$ 1,30–3,00 · rápida US$ 1,00–2,10), ainda sem rodadas medidas. Pela assinatura do Claude Code é cota do plano, não cobrança por token.'}>
            <span className="inline-flex items-center gap-1.5"><Coins className="size-4 text-muted-foreground" />{fmtFaixa(est.usdLow, est.usdHigh)}
              <span className="text-xs text-muted-foreground">{est.real ? `(média de ${est.real.n} rodada${est.real.n === 1 ? '' : 's'})` : '(média das últimas rodadas: —)'}</span></span>
          </Tip>
        </div>
        {passa && (
          <div role="alert" className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <TriangleAlert className="mt-px size-4 shrink-0" />
            <span><b className="font-semibold">Pode passar de {fmtUsd(LIMITE_AVISO_USD)}.</b>{' '}
              {est.real ? <>A média medida nas últimas rodadas é {fmtUsd(est.real.media)}. </> : null}A profundidade rápida custa menos. Pela assinatura é cota do plano, não cobrança.</span>
          </div>
        )}
        {ocupado && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            A IA está ocupada{ocupado.task ? ` com ${ocupado.task}` : ocupado.title ? ` com ${ocupado.title}` : ''}. Grave o pedido e rode quando ela terminar (aba Pesquisas).
          </p>
        )}
        <p className="text-xs text-muted-foreground">As ideias chegam na aba Ideias, com fonte e link conferidos. Só roda quando você clica.</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button variant="ghost" disabled={invalido || pedir.isPending} onClick={() => pedir.mutate('terminal')} className="inline-flex items-center gap-1.5" title="Abre uma janela do Claude Code para você acompanhar e responder">
          <SquareTerminal className="size-4" />Abrir no terminal
        </Button>
        {ocupado
          ? <Button disabled={invalido || pedir.isPending} onClick={() => pedir.mutate('so-pedir')}>Só gravar o pedido</Button>
          : <Button disabled={invalido || pedir.isPending} onClick={() => pedir.mutate('rodar')} className="inline-flex items-center gap-1.5">
            {pedir.isPending ? <Spinner /> : <Sparkles className="size-4" />}Pesquisar
          </Button>}
      </div>
    </>
  );
}

function Linha({ ativo, onPick, label, children }: { ativo: boolean; onPick: () => void; label: string; children: React.ReactNode }) {
  return (
    <div className={cx('grid grid-cols-[84px_1fr] items-center gap-2 rounded-lg border px-2.5 py-1.5 transition', ativo ? 'border-primary/50 bg-primary-soft/40' : 'border-border')}>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="radio" name="sobre" checked={ativo} onChange={onPick} className="size-4 accent-[var(--primary)]" />{label}
      </label>
      {children}
    </div>
  );
}

function Chip({ s, muda }: { s: Source; muda?: boolean }) {
  const T = typeMeta(s.type).icon;
  return <span title={muda ? 'Ainda sem coletor por script: fica de fora da rodada' : undefined} className={cx('inline-flex max-w-[11rem] items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs', muda ? 'border-dashed border-border text-muted-foreground' : 'border-border')}><T className="size-3 shrink-0 text-muted-foreground" /><span className="truncate">{s.name}</span></span>;
}

function TrocarFontes({ sources, sobre, escolhidas, coletores, personalizada, onChange, onPadrao }: {
  sources: Source[]; sobre: Sobre; escolhidas: Set<string>; coletores: string[]; personalizada: boolean; onChange: (s: Set<string>) => void; onPadrao: () => void;
}) {
  const cruzam = new Set(fontesPadrao(sources, sobre).ids);
  const lista = sources.filter((s) => s.status !== 'arquivada').sort((a, b) => Number(escolhidas.has(b.id)) - Number(escolhidas.has(a.id)) || Number(cruzam.has(b.id)) - Number(cruzam.has(a.id)) || b.weight - a.weight || a.name.localeCompare(b.name, 'pt-BR'));
  const toggle = (id: string) => { const n = new Set(escolhidas); if (n.has(id)) n.delete(id); else n.add(id); onChange(n); };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-xs font-medium hover:bg-muted">Trocar fontes<ChevronDown className="size-3.5 text-muted-foreground" /></button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-2">
        <div className="flex items-center justify-between px-1.5 pb-1.5">
          <span className="text-xs font-medium text-muted-foreground">{escolhidas.size} de {lista.length} marcadas</span>
          {personalizada && <button type="button" onClick={onPadrao} className="text-xs text-primary-ink hover:underline">Usar o padrão</button>}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {lista.map((s) => {
            const T = typeMeta(s.type).icon;
            const semColetor = !s.access.adapter || !coletores.includes(s.access.adapter);
            return (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                <Checkbox checked={escolhidas.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                <T className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                {s.status === 'sugerida' && <span className="shrink-0 rounded bg-amber-50 px-1 text-[10px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">sugerida</span>}
                {semColetor && <Tip content="Ainda sem coletor por script: fica de fora da rodada"><span className="shrink-0 text-[10px] text-muted-foreground">sem coletor</span></Tip>}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ───────────────────────── painel de progresso ─────────────────────────
function Painel({ slug, round, onClose }: { slug: string; round: string; onClose: () => void }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const refs = useStrategyRefs(slug).data;
  const sources = useSources(slug).data;
  const q = usePesquisa(slug, round);
  const st = usePesquisas(slug).data;
  const agora = useAgora();
  const [verCaidos, setVerCaidos] = useState(false);
  const v: RodadaView | undefined = q.data;
  const refresh = () => { void qc.invalidateQueries({ queryKey: qk.pesquisas(slug) }); void qc.invalidateQueries({ queryKey: qk.pesquisa(slug, round) }); };
  const parar = useMutation({ mutationFn: () => api.pararPesquisa(slug), onSuccess: () => { toast.ok('Pesquisa parada'); refresh(); }, onError: (e) => toast.error(e, 'Não foi possível parar') });
  const rodar = useMutation({ mutationFn: () => api.rodarPesquisa(slug, round), onSuccess: () => { toast.ok('Pesquisa iniciada no Claude Code'); refresh(); setTimeout(refresh, 1200); }, onError: (e) => toast.error(e, 'Não foi possível rodar') });

  if (!v) return (<><DialogTitle>Pesquisa</DialogTitle><div className="h-48 rounded-lg bg-muted animate-pulse" /></>);
  const l = v.linha, rotulo = rotuloRodada(l.req, refs);
  const rodando = l.estado === 'rodando';
  const inicio = rodando && st?.rodando?.round === round ? st.rodando.started : l.req.requestedAt;
  const ultimo = st?.ultimo?.round === round ? st.ultimo : null;
  const r = l.result;
  const verIdeias = () => { onClose(); nav(`/p/${slug}/ideias?rodada=${encodeURIComponent(round)}`); };
  const detalhe = () => { onClose(); nav(`/p/${slug}/ideias/pesquisas/${encodeURIComponent(round)}`); };

  return (
    <>
      <DialogTitle className="flex flex-wrap items-center gap-x-2 pr-6 leading-snug">
        <Sparkles className="size-5 shrink-0 text-primary-ink" />
        <span>Pesquisa · {rotuloRodada(l.req, refs, true)}</span>
        <span className="text-sm font-normal text-muted-foreground">
          {rodando ? `rodando ${duracao(inicio, agora)}` : l.estado === 'feito' ? 'pronta' : l.estado === 'erro' ? 'não terminou' : 'na fila'}
        </span>
      </DialogTitle>
      <DialogDescription className="-mt-1 truncate">{rotulo}</DialogDescription>

      <PesquisaProgresso p={v.progresso} sources={sources} />

      {rodando && (
        <p className="text-xs text-muted-foreground">{l.terminal ? 'Rodando numa janela do terminal; este painel acompanha pelos arquivos da rodada.' : 'Roda no Claude Code em segundo plano. Pode fechar este painel: o aviso chega quando acabar.'}</p>
      )}

      {l.estado === 'feito' && r && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-center gap-x-1.5 font-medium text-emerald-900 dark:text-emerald-200">
            <Check className="size-4" />
            <span>{r.ideas.length} ideias novas · {r.refs.length} referências ·</span>
            <button type="button" disabled={!r.dropped.length} onClick={() => setVerCaidos((x) => !x)} className={cx('text-left', r.dropped.length > 0 && 'underline-offset-2 hover:underline')}>
              {r.dropped.length} caíram na verificação{r.dropped.length > 0 && <span className="font-normal"> [{verCaidos ? 'esconder' : 'ver'}]</span>}
            </button>
          </div>
          {verCaidos && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-emerald-950/80 dark:text-emerald-100/80">
              {r.dropped.map((d) => <li key={d.url}><a href={d.url} target="_blank" rel="noreferrer" className="hover:underline">{d.title}</a> <span className="opacity-70">— {d.reason}</span></li>)}
            </ul>
          )}
          {l.custo != null && <div className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200/80">Custo medido: {fmtUsd(l.custo)}{l.custo > LIMITE_AVISO_USD ? ' (acima do aviso de US$ 3)' : ''}</div>}
        </div>
      )}
      {(l.estado === 'erro' || (l.estado === 'pendente' && ultimo?.erro)) && (
        <div role="alert" className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <TriangleAlert className="mt-px size-4 shrink-0" /><span><b className="font-semibold">A pesquisa não terminou.</b> {l.erro ?? ultimo?.erro ?? 'A rodada parou sem gravar o resultado.'} O que já foi buscado fica guardado.</span>
        </div>
      )}
      {l.estado === 'pendente' && !ultimo?.erro && !rodando && (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Pedido gravado, ainda não rodou.{st?.ocupado ? ' A IA está ocupada; rode quando ela terminar.' : ''}</p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {rodando && !l.terminal && <Button variant="ghost" disabled={parar.isPending} onClick={() => parar.mutate()} className="inline-flex items-center gap-1.5"><Square className="size-3.5" />Parar</Button>}
        {rodando && <Button variant={l.terminal ? 'primary' : 'soft'} onClick={onClose}>{l.terminal ? 'Fechar' : 'Fechar, aviso quando acabar'}</Button>}
        {l.estado === 'feito' && (<>
          <Button variant="ghost" onClick={detalhe}>Detalhes da rodada</Button>
          <Button onClick={verIdeias} className="inline-flex items-center gap-1.5">Ver as {r?.ideas.length ?? ''} ideias</Button>
        </>)}
        {(l.estado === 'erro' || l.estado === 'pendente') && !rodando && (<>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button disabled={rodar.isPending || !!st?.ocupado} onClick={() => rodar.mutate()} className="inline-flex items-center gap-1.5">{rodar.isPending ? <Spinner /> : <Sparkles className="size-4" />}{l.estado === 'erro' ? 'Tentar de novo' : 'Rodar agora'}</Button>
        </>)}
      </div>
    </>
  );
}
