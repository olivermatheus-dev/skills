// Insumos do projeto de variantes (045 E): o que alimenta os eixos (aberturas, vozes) e o texto do anúncio (headlines,
// CTAs, copys). O Oliver escreve aqui ou pede à IA (+5 por aba); tudo grava por insumos.mjs no servidor, com validação.
// Abertura/voz nova já entra na matriz (Fluxo/Matriz) pronta para Gerar; os de texto do anúncio só listam.
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button as UiButton } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api, avisoFila, type InsumosView, type InsumoTipo, type VariantesVista } from '../../api';
import { toast } from '../toast';
import { Badge, Button, Card, Input, SelectField, Textarea, cx } from '../kit';
import { PedidoStatus, PedirIa, usePedidoIa } from '../atividade/PedidoIa';

const ABERTO_KEY = 'hub:variantes:insumos';
const ABA_KEY = 'hub:variantes:insumos-aba';
const lerAberto = () => { try { return localStorage.getItem(ABERTO_KEY) !== '0'; } catch { return true; } };
const ABAS = ['abertura', 'voz', 'headline', 'cta', 'copy'] as const;
const lerAba = (): InsumoTipo => { try { const a = localStorage.getItem(ABA_KEY) as InsumoTipo; return ABAS.includes(a) ? a : 'abertura'; } catch { return 'abertura'; } };

const CTAS_META = ['Saiba mais', 'Cadastre-se', 'Comece agora', 'Baixar', 'Fale conosco', 'Enviar mensagem', 'Assinar'];
const META: Record<InsumoTipo, { aba: string; um: string; este: string; nova: string; adic: string; lista: keyof Pick<InsumosView, 'aberturas' | 'vozes' | 'headlines' | 'ctas' | 'copys'>; vazio: string }> = {
  abertura: { aba: 'Aberturas', um: 'abertura', este: 'esta abertura', nova: '5 aberturas novas', adic: 'Abertura adicionada', lista: 'aberturas', vazio: 'Nenhuma abertura ainda. Escreva uma ou peça 5 à IA.' },
  voz: { aba: 'Vozes', um: 'voz', este: 'esta voz', nova: '5 vozes novas', adic: 'Voz adicionada', lista: 'vozes', vazio: 'Nenhuma voz ainda. Escolha uma da lista.' },
  headline: { aba: 'Headlines', um: 'headline', este: 'esta headline', nova: '5 headlines novas', adic: 'Headline adicionada', lista: 'headlines', vazio: 'Nenhuma headline ainda.' },
  cta: { aba: 'CTAs', um: 'CTA', este: 'este CTA', nova: '5 CTAs novos', adic: 'CTA adicionado', lista: 'ctas', vazio: 'Nenhum CTA ainda.' },
  copy: { aba: 'Copys', um: 'copy', este: 'esta copy', nova: '5 copys novas', adic: 'Copy adicionada', lista: 'copys', vazio: 'Nenhuma copy ainda.' },
};

/** palavras da fala, sem pontuação nas pontas e sem repetir (as opções dos chips de cue) */
const palavrasDe = (fala: string) => [...new Set(fala.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).filter((w) => w && !/^\d+$/.test(w)))]; // só dígitos fora: o motor trata número como índice
/** minúsculas, sem acento e sem pontuação (compara o cue gravado com as palavras da fala) */
const fold = (w: string) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** a tela como será vista: *destaque* em negrito colorido, | quebra a linha */
function Tela({ texto }: { texto: string }) {
  return (
    <div className="text-sm font-medium leading-snug">
      {texto.split('|').map((linha, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {linha.trim().split(/(\*[^*]+\*)/).map((p, j) => (/^\*[^*]+\*$/.test(p) ? <b key={j} className="text-primary-ink font-bold">{p.slice(1, -1)}</b> : <Fragment key={j}>{p}</Fragment>))}
        </Fragment>
      ))}
    </div>
  );
}

function SeloIa({ porQue }: { porQue?: string }) {
  const b = <span className="inline-flex items-center gap-1 rounded-full bg-ai-soft text-ai-ink px-2 py-0.5 text-xs font-medium cursor-default"><Sparkles className="size-3" />IA</span>;
  if (!porQue) return b;
  return <Tooltip><TooltipTrigger asChild>{b}</TooltipTrigger><TooltipContent className="max-w-xs">{porQue}</TooltipContent></Tooltip>;
}

function Avisos({ itens }: { itens?: string[] }) {
  if (!itens?.length) return null;
  return (
    <ul className="space-y-0.5">
      {itens.map((a, i) => <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-amber-700 dark:text-amber-500"><AlertTriangle className="size-3 shrink-0 mt-px" /><span>{a}</span></li>)}
    </ul>
  );
}

/** cartão genérico: selos no topo, corpo, avisos e as ações (aparecem ao passar o mouse) */
function Cartao({ selos, children, avisos, travado, onEditar, onApagar }: { travado?: boolean; selos?: ReactNode; children: ReactNode; avisos?: string[]; onEditar: () => void; onApagar: () => void }) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-2.5 space-y-1.5 hover:border-foreground/30">
      <div className="flex items-center gap-1.5 min-h-5 pr-14">{selos}</div>
      {children}
      <Avisos itens={avisos} />
      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
        <button disabled={travado} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none" title="Editar" aria-label="Editar" onClick={onEditar}><Pencil className="size-3.5" /></button>
        <button disabled={travado} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none" title="Apagar" aria-label="Apagar" onClick={onApagar}><Trash2 className="size-3.5" /></button>
      </div>
    </div>
  );
}

const Dica = ({ children }: { children: ReactNode }) => <div className="text-[11px] text-muted-foreground">{children}</div>;
const Contador = ({ n, max, rotulo }: { n: number; max: number; rotulo?: string }) => <span className={cx('text-[11px] tabular-nums', n > max ? 'text-amber-700 dark:text-amber-500' : 'text-muted-foreground')}>{n}/{max}{rotulo ? ` ${rotulo}` : ''}</span>;
const Campo = ({ label, extra, children }: { label: string; extra?: ReactNode; children: ReactNode }) => (
  <div className="space-y-1"><div className="flex items-center justify-between"><label className="text-xs font-medium">{label}</label>{extra}</div>{children}</div>
);

type Item = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** formulário curto de um insumo (novo ou edição); devolve os `dados` que a API espera */
function Formulario({ tipo, ins, inicial, onSalvar, onCancelar }: { tipo: InsumoTipo; ins: InsumosView; inicial?: Item; onSalvar: (dados: Record<string, unknown>) => Promise<void>; onCancelar: () => void }) {
  const [v, setV] = useState<Item>(() => ({
    fala: '', tela: '', titulo: '', cues: {}, voz: ins.vozesDisponiveis[0]?.id ?? '', rate: '', texto: '', botao: CTAS_META[0], texto_principal: '', descricao: '', ...inicial,
    ...(inicial?.cues ? { cues: { ...inicial.cues } } : {}),
  }));
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');
  const set = (k: string, val: unknown) => setV((o) => ({ ...o, [k]: val }));
  const palavras = useMemo(() => palavrasDe(String(v.fala)), [v.fala]);
  const chaves = ins.molde?.cues ?? [];

  const pronto = {
    abertura: String(v.fala).trim() && String(v.tela).trim() && chaves.every((k) => v.cues[k] && palavras.some((p) => fold(p) === fold(v.cues[k]))),
    voz: !!v.voz,
    headline: !!String(v.texto).trim(),
    cta: !!v.botao,
    copy: !!String(v.texto_principal).trim() && !!String(v.titulo).trim(),
  }[tipo];

  const vazio = inicial ? '' : undefined; // editar: campo apagado manda '' para o servidor tirar a chave
  const montar = (): Record<string, unknown> => {
    switch (tipo) {
      case 'abertura': return { ...(inicial?.id ? { id: inicial.id } : {}), titulo: String(v.titulo).trim() || vazio, fala: String(v.fala).trim(), tela: String(v.tela).trim(), cues: Object.fromEntries(chaves.map((k) => [k, v.cues[k]])) };
      case 'voz': return { voz: v.voz, ...(inicial?.id ? { id: inicial.id } : {}), rate: String(v.rate).trim() || vazio };
      case 'headline': return { texto: String(v.texto).trim() };
      case 'cta': return { botao: v.botao, fala: String(v.fala).trim() || vazio };
      case 'copy': return { texto_principal: String(v.texto_principal).trim(), titulo: String(v.titulo).trim(), descricao: String(v.descricao).trim() || vazio };
    }
  };
  const salvar = async () => {
    setBusy(true); setErro('');
    try { await onSalvar(montar()); } catch (e) { setErro((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-lg border border-primary/40 bg-card p-3 space-y-2.5 col-span-full">
      {tipo === 'abertura' && (
        <>
          <Campo label="Fala (o que a voz diz)"><Textarea rows={2} autoFocus value={v.fala} onChange={(e) => set('fala', e.target.value)} placeholder="Quantos apps você abre antes de atender o primeiro paciente?" /></Campo>
          <Campo label="Tela (o texto que aparece)">
            <Input value={v.tela} onChange={(e) => set('tela', e.target.value)} placeholder="Quantos *apps*|antes do primeiro paciente?" />
            <Dica>Use *palavra* para destacar e | para trocar de linha. Só use palavras que a fala diz.</Dica>
            {String(v.tela).trim() && <div className="rounded-md bg-muted/60 px-2.5 py-2"><Tela texto={v.tela} /></div>}
          </Campo>
          {chaves.length > 0 && (
            <Campo label="Em que palavra dispara cada gesto">
              {!palavras.length ? <Dica>Escreva a fala primeiro; as palavras dela aparecem aqui para escolher.</Dica> : (
                <div className="space-y-1.5">
                  {chaves.map((k) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="w-20 shrink-0 pt-0.5 font-mono text-[11px] text-muted-foreground truncate" title={k}>{k}</span>
                      <div className="flex flex-wrap gap-1">
                        {palavras.map((p) => (
                          <button key={p} type="button" onClick={() => set('cues', { ...v.cues, [k]: p })}
                            className={cx('px-1.5 py-0.5 rounded-md border text-xs', fold(v.cues[k] ?? '') === fold(p) ?'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted')}>{p}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Campo>
          )}
          <Campo label="Nome (opcional)"><Input value={v.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="ex.: quantos apps" /></Campo>
        </>
      )}
      {tipo === 'voz' && (
        <>
          <Campo label="Voz">
            <SelectField className="w-full" aria-label="Voz" value={v.voz} onChange={(x) => set('voz', x)} placeholder="Escolher a voz"
              options={ins.vozesDisponiveis.map((x) => ({ value: x.id, label: `${x.nome}${x.genero ? ` · ${x.genero}` : ''}` }))} />
            <Dica>Vozes de rascunho (grátis). A voz final do Eleven é outro passo.</Dica>
          </Campo>
          <Campo label="Ritmo (opcional)"><Input value={v.rate} onChange={(e) => set('rate', e.target.value)} placeholder="-8% (mais devagar) ou +5%" /></Campo>
        </>
      )}
      {tipo === 'headline' && (
        <Campo label="Headline" extra={<Contador n={String(v.texto).length} max={40} />}><Input autoFocus value={v.texto} onChange={(e) => set('texto', e.target.value)} placeholder="Sua agenda, sem 5 apps" /></Campo>
      )}
      {tipo === 'cta' && (
        <>
          <Campo label="Botão do anúncio"><SelectField className="w-full" aria-label="Botão" value={v.botao} onChange={(x) => set('botao', x)} options={CTAS_META.map((c) => ({ value: c, label: c }))} /></Campo>
          <Campo label="Fala do CTA (opcional)"><Input value={v.fala} onChange={(e) => set('fala', e.target.value)} placeholder="Teste grátis por 14 dias" /></Campo>
        </>
      )}
      {tipo === 'copy' && (
        <>
          <Campo label="Texto principal" extra={<Contador n={String(v.texto_principal).length} max={125} rotulo="antes do “ver mais”" />}><Textarea rows={3} autoFocus value={v.texto_principal} onChange={(e) => set('texto_principal', e.target.value)} /></Campo>
          <Campo label="Título" extra={<Contador n={String(v.titulo).length} max={40} />}><Input value={v.titulo} onChange={(e) => set('titulo', e.target.value)} /></Campo>
          <Campo label="Descrição (opcional)"><Input value={v.descricao} onChange={(e) => set('descricao', e.target.value)} /></Campo>
        </>
      )}
      {erro && <div className="rounded-md bg-red-50 text-destructive text-xs px-2.5 py-1.5 whitespace-pre-line">{erro}</div>}
      <div className="flex items-center gap-2">
        <Button disabled={!pronto || busy} onClick={() => void salvar()}>{inicial ? 'Salvar' : 'Adicionar'}</Button>
        <Button variant="ghost" disabled={busy} onClick={onCancelar}>Cancelar</Button>
        {tipo === 'abertura' && !pronto && chaves.length > 0 && <span className="text-[11px] text-muted-foreground">Falta escolher a palavra de cada gesto.</span>}
      </div>
    </div>
  );
}

export default function VariantesInsumos({ slug, path, ins, onView, onRecarregar }: { slug: string; path: string; ins: InsumosView; onView: (v: VariantesVista) => void; onRecarregar: () => void }) {
  const [aberto, setAberto] = useState(lerAberto);
  const [aba, setAba] = useState<InsumoTipo>(lerAba);
  const [form, setForm] = useState<string | null>(null); // 'novo' | id em edição
  const { pedido, rodando, atualizar } = usePedidoIa(slug, `insumos:${path}`, {
    enquantoRoda: onRecarregar,
    aoTerminar: (p) => { onRecarregar(); if (p.status === 'feito') toast.ok(p.resumo ?? 'Opções novas gravadas'); },
  });
  const alternar = () => { const n = !aberto; setAberto(n); try { localStorage.setItem(ABERTO_KEY, n ? '1' : '0'); } catch { /* sem storage */ } };
  const trocarAba = (a: InsumoTipo) => { setAba(a); setForm(null); try { localStorage.setItem(ABA_KEY, a); } catch { /* sem storage */ } };

  const m = META[aba];
  const lista = ins[m.lista] as Item[];
  const resumo = ABAS.map((t) => `${META[t].aba} ${(ins[META[t].lista] as unknown[]).length}`).join(' · ');

  /** manda; se o servidor recusar numa ação de voz, mostra a mensagem e, aceitando, reenvia com forcar */
  const enviar = async (b: { acao: 'add' | 'editar' | 'rm'; id?: string; dados?: Record<string, unknown>; forcar?: boolean }) => {
    try { return await api.insumoVariantes(slug, path, { ...b, tipo: aba }); }
    catch (e) {
      if (aba !== 'voz' || b.forcar || !window.confirm(`${(e as Error).message}

Fazer mesmo assim?`)) throw e;
      return api.insumoVariantes(slug, path, { ...b, tipo: aba, forcar: true });
    }
  };
  const salvar = (acao: 'add' | 'editar', it?: Item) => async (dados: Record<string, unknown>) => {
    const usada = acao === 'editar' && !!it?.usada && (aba === 'abertura' || aba === 'voz');
    if (usada && !window.confirm('Esta opção já gerou variante; o vídeo e o aval ficam com o texto antigo até gerar de novo. Salvar mesmo assim?')) return;
    onView(await enviar({ acao, id: it?.id, dados, forcar: usada || undefined }));
    setForm(null);
    toast.ok(acao === 'add' ? m.adic : 'Salvo');
  };
  const apagar = async (it: Item) => {
    const usada = !!it.usada;
    const msg = usada ? 'Esta opção já gerou variante(s). Apagar mesmo assim? As variantes geradas ficam na pasta, mas saem da matriz.' : `Apagar ${m.este}?`;
    if (!window.confirm(msg)) return;
    try { onView(await enviar({ acao: 'rm', id: it.id, forcar: usada || undefined })); toast.ok('Apagado'); }
    catch (e) { toast.error(e, 'Não foi possível apagar'); }
  };

  const avisosDe = (id: string) => ins.avisos[`${aba}:${id}`];
  const selos = (it: Item, extra?: ReactNode) => (
    <>
      {it.origem === 'ia' && <SeloIa porQue={it.por_que} />}
      {it.usada && <Badge color="#16a34a">em uso</Badge>}
      {extra}
    </>
  );
  const corpo = (it: Item): ReactNode => {
    switch (aba) {
      case 'abertura': return (
        <>
          <Tela texto={it.tela} />
          <div className="text-xs text-muted-foreground italic">“{it.fala}”</div>
          {it.titulo && <div className="text-[11px] font-mono text-muted-foreground">{it.id}</div>}
          {Object.keys(it.cues ?? {}).length > 0 && <div className="flex flex-wrap gap-1">{Object.entries(it.cues as Record<string, string>).map(([k, w]) => <span key={k} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"><span className="font-mono">{k}</span> → {w}</span>)}</div>}
        </>
      );
      case 'voz': return (
        <>
          <div className="text-sm font-medium">{it.nome}{it.genero ? <span className="text-muted-foreground font-normal"> · {it.genero}</span> : null}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{it.voz}{it.rate ? ` · ${it.rate}` : ''}</div>
        </>
      );
      case 'headline': return <div className="text-sm font-medium">{it.texto}</div>;
      case 'cta': return (
        <>
          <span className="inline-block rounded-md bg-muted px-2.5 py-1 text-sm font-medium">{it.botao}</span>
          {it.fala && <div className="text-xs text-muted-foreground italic">“{it.fala}”</div>}
        </>
      );
      case 'copy': return (
        <>
          <div className="text-sm font-medium">{it.titulo}</div>
          <div className="text-xs text-muted-foreground whitespace-pre-line line-clamp-4">{it.texto_principal}</div>
          {it.descricao && <div className="text-[11px] text-muted-foreground">{it.descricao}</div>}
        </>
      );
    }
  };
  const inicialDe = (it: Item): Item => (aba === 'cta' ? { ...it } : it);

  return (
    <Card className="p-0 overflow-hidden">
      <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/40" onClick={alternar} aria-expanded={aberto}>
        {aberto ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        <span className="text-sm font-medium">Insumos</span>
        {!aberto && <span className="text-xs text-muted-foreground truncate">{resumo}</span>}
        {rodando && <Sparkles className="size-3.5 text-ai-ink animate-pulse ml-auto" aria-label="A IA está escrevendo" />}
      </button>
      {aberto && (
        <div className="border-t border-border p-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-card">
              {ABAS.map((t) => (
                <button key={t} onClick={() => trocarAba(t)} className={cx('px-2.5 py-1 text-sm rounded-md inline-flex items-center gap-1.5', aba === t ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground')}>
                  {META[t].aba}<span className="text-[11px] tabular-nums text-muted-foreground">{(ins[META[t].lista] as unknown[]).length}</span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap min-w-0">
              <Button variant="ghost" className="inline-flex items-center gap-1.5" onClick={() => setForm('novo')} disabled={form === 'novo' || rodando} title={rodando ? 'Espere a IA terminar de gravar' : undefined}><Plus className="size-4" />Escrever</Button>
              {aba !== 'voz' && (rodando ? <PedidoStatus slug={slug} pedido={pedido} className="min-w-0" /> : (
                <PedirIa
                  trigger={<UiButton size="sm" variant="ai" className="gap-1.5"><Sparkles />Pedir à IA: +5</UiButton>}
                  titulo={`Pedir ${m.nova}`}
                  terminal={false}
                  descricao="Vai para o roteirista, que lê a copy, o público, os anúncios dos concorrentes e as brechas e grava as opções aqui."
                  placeholder="Algum ângulo ou limite? (opcional)"
                  onRodar={async (modo, instrucoes) => {
                    const r = await api.pedirInsumos(slug, path, { tipo: aba as 'abertura' | 'headline' | 'cta' | 'copy', quantidade: 5, instrucoes: instrucoes || undefined, modo });
                    toast.ok(modo === 'terminal' ? 'Claude Code aberto num terminal' : avisoFila(r.fila, 'Roteirista escrevendo 5 opções'));
                    atualizar();
                  }}
                />
              ))}
            </div>
          </div>
          {!rodando && pedido && pedido.status !== 'feito' && <PedidoStatus slug={slug} pedido={pedido} />}
          {(aba === 'abertura' || aba === 'voz') && <Dica>Entra direto na matriz abaixo, pronta para Gerar.</Dica>}
          {(aba === 'headline' || aba === 'cta' || aba === 'copy') && <Dica>Texto do anúncio: não gera vídeo; vai para o pacote do anúncio.</Dica>}

          <div className="max-h-[300px] overflow-y-auto -mr-1 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-2">
              {form === 'novo' && <Formulario key="novo" tipo={aba} ins={ins} onSalvar={salvar('add')} onCancelar={() => setForm(null)} />}
              {lista.map((it) => form === it.id
                ? <Formulario key={it.id} tipo={aba} ins={ins} inicial={inicialDe(it)} onSalvar={salvar('editar', it)} onCancelar={() => setForm(null)} />
                : <Cartao key={it.id} selos={selos(it)} avisos={avisosDe(it.id)} travado={rodando} onEditar={() => setForm(it.id)} onApagar={() => void apagar(it)}>{corpo(it)}</Cartao>)}
            </div>
            {!lista.length && form !== 'novo' && <div className="py-6 text-center text-sm text-muted-foreground">{m.vazio}</div>}
          </div>
        </div>
      )}
    </Card>
  );
}
