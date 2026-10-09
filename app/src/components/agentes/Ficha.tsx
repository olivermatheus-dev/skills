// Ficha do agente ou da skill (048): o arquivo em campos do molde, visão padrão ao abrir a definição do agente ou o
// SKILL.md. Grava o mesmo markdown que o Claude Code lê (tools/lib/ficha-agente.mjs); "Editar o arquivo" abre o cru.
// Peça central: Especialista. Logo abaixo, o Contexto: arquivos e seções exatos que o agente/skill lê (select com busca
// sobre o contexto da empresa, marca, conhecimento e referências das skills), cada um conferido (existe? a seção existe?).
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, BookOpenText, Check, CheckCircle2, ChevronRight, CircleAlert, FileCode2, FileText, GraduationCap, Hash, ListChecks,
  ListOrdered, Loader2, Plus, Search, ShieldAlert, Undo2, Workflow, X, XCircle, type LucideIcon,
} from 'lucide-react';
import { api, type CampoMolde, type ContextoFicha, type EdicaoFicha, type FichaAgenteView, type ItemContexto, type RefConferida, type SecaoLivre, type TipoFicha } from '../../api';
import { MarkdownEditor } from '../Markdown';
import { Button, ErrorBox, Input, SelectField, Textarea, cx } from '../kit';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '../toast';
import { COR, NOME_AGENTE, Avatar } from './shared';

type CampoKey = CampoMolde['key'];
interface Draft {
  description: string; model: string; color: string; tools: string;
  titulo: string; abertura: string; campos: Record<CampoKey, string>; contexto: ContextoFicha; outras: SecaoLivre[];
}
const ICONE: Record<CampoKey, LucideIcon> = { especialista: GraduationCap, contexto: BookOpenText, entradas: Workflow, ordem: ListOrdered, regras: ShieldAlert, checklist: ListChecks };
const PLACEHOLDER: Record<CampoKey, string> = {
  especialista: 'Você é… (nível, repertório, referências do ofício). Bom trabalho aqui é… Você não faz…',
  contexto: '',
  entradas: 'Recebe: … · Entrega: … · Salva em: companies/<slug>/…',
  ordem: '1. …\n2. …',
  regras: '- Nunca…',
  checklist: '- [ ] …?',
};

const str = (v: unknown) => (v == null ? '' : String(v));
function draftDe(f: FichaAgenteView): Draft {
  return {
    description: str(f.fm.description).replace(/\s+/g, ' ').trim(), model: str(f.fm.model), color: str(f.fm.color), tools: Array.isArray(f.fm.tools) ? f.fm.tools.join(', ') : str(f.fm.tools),
    titulo: f.titulo, abertura: f.abertura, campos: { ...f.campos }, contexto: { nota: f.contexto.nota, itens: f.contexto.itens.map((i) => ({ ...i, agentes: [...i.agentes] })) },
    outras: f.outras.map((o) => ({ titulo: o.titulo, corpo: o.corpo })),
  };
}
function edicaoDe(d: Draft, tipo: TipoFicha): EdicaoFicha {
  const fm: Record<string, unknown> = { description: d.description };
  if (tipo === 'agente') { fm.model = d.model || null; fm.color = d.color || null; fm.tools = d.tools.trim() || null; }
  return { fm, titulo: d.titulo, abertura: d.abertura, campos: d.campos, contexto: d.contexto, outras: d.outras };
}
const partesRef = (ref: string) => {
  const [p, ...s] = ref.split('#');
  const nome = p.split('/').pop() ?? p;
  return { path: p, nome, secao: s.join('#').trim() || null, pasta: p.slice(0, p.length - nome.length).replace(/\/$/, '') };
};
const normTxt = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ── peças ────────────────────────────────────────────────────────────────────
function Bloco({ icone: I, titulo, dica, destaque, extra, children }: { icone: LucideIcon; titulo: string; dica?: string; destaque?: boolean; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className={cx('rounded-xl border bg-card', destaque ? 'border-primary/35 ring-1 ring-primary/10' : 'border-border')}>
      <header className="flex items-start gap-2.5 px-4 pt-3.5 pb-2">
        <span className={cx('size-7 shrink-0 rounded-lg grid place-items-center', destaque ? 'bg-primary-soft text-primary-ink' : 'bg-muted text-muted-foreground')}><I className="size-4" strokeWidth={1.8} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{titulo}</div>
          {dica && <div className="text-xs text-muted-foreground leading-snug mt-0.5">{dica}</div>}
        </div>
        {extra}
      </header>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

function StatusRef({ c }: { c?: RefConferida }) {
  if (!c) return <span className="size-4 shrink-0" />;
  if (!c.ok) return <XCircle className="size-4 shrink-0 text-destructive" strokeWidth={2} aria-label={c.erro} />;
  if (c.avisos.length) return <AlertTriangle className="size-4 shrink-0 text-warning-ink" strokeWidth={2} aria-label={c.avisos.join(' · ')} />;
  return <CheckCircle2 className="size-4 shrink-0 text-success" strokeWidth={2} aria-label="existe" />;
}

/** select com busca: arquivo inteiro ou uma seção */
function SeletorContexto({ slug, usados, onEscolher }: { slug: string; usados: Set<string>; onEscolher: (ref: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['ficha-candidatos', slug], queryFn: () => api.fichaCandidatos(slug), enabled: open, staleTime: 30_000 });
  const linhas = useMemo(() => {
    const t = normTxt(q.trim());
    const out: { grupo: string; ref: string; titulo: string; sub?: string; nivel: number; linhas: number }[] = [];
    for (const c of data ?? []) {
      const arq = { grupo: c.grupo, ref: c.ref, titulo: partesRef(c.ref).nome, sub: partesRef(c.ref).pasta, nivel: 0, linhas: c.linhas };
      const secs = c.secoes.map((s) => ({ grupo: c.grupo, ref: `${c.ref}#${s.titulo}`, titulo: s.titulo, nivel: s.nivel, linhas: s.linhas }));
      if (!t) { out.push(arq, ...secs); continue; }
      const arqOk = normTxt(c.ref).includes(t);
      const secOk = secs.filter((s) => normTxt(s.titulo).includes(t));
      if (arqOk || secOk.length) out.push(arq, ...(arqOk && !secOk.length ? secs : secOk));
    }
    return out;
  }, [data, q]);
  const escolher = (ref: string) => { onEscolher(ref); setQ(''); };
  let grupo = '';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-border text-[13px] text-muted-foreground hover:border-primary/40 hover:text-foreground">
          <Plus className="size-3.5" />Adicionar arquivo ou seção
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[440px] p-0 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <Search className="size-4 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar arquivo ou seção (ex.: objeções, VOICE, hooks)…"
            onKeyDown={(e) => { if (e.key === 'Enter' && q.includes('/')) escolher(q.trim()); }}
            className="flex-1 h-10 bg-transparent text-sm outline-none" />
        </div>
        <div className="max-h-[360px] overflow-y-auto p-1">
          {isLoading && <div className="p-3 text-xs text-muted-foreground inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" />Lendo arquivos…</div>}
          {!isLoading && !linhas.length && (
            <div className="p-3 text-xs text-muted-foreground">
              Nada encontrado.{q.includes('/') && <> Enter usa <span className="font-mono">{q}</span> como caminho.</>}
            </div>
          )}
          {linhas.map((l, i) => {
            const cab = l.grupo !== grupo ? (grupo = l.grupo) : null;
            const ja = usados.has(normTxt(l.ref));
            return (
              <div key={`${l.ref}-${i}`}>
                {cab && <div className="px-2 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{cab}</div>}
                <button disabled={ja} onClick={() => escolher(l.ref)} title={l.ref}
                  className={cx('w-full flex items-center gap-1.5 h-7 pr-2 rounded-md text-left text-[13px]', ja ? 'text-muted-foreground/60' : 'hover:bg-muted')}
                  style={{ paddingLeft: 8 + l.nivel * 16 }}>
                  {l.nivel ? <Hash className="size-3 shrink-0 text-muted-foreground" /> : <FileText className="size-3.5 shrink-0 text-muted-foreground" />}
                  <span className={cx('truncate', !l.nivel && 'font-medium')}>{l.titulo}</span>
                  {!l.nivel && l.sub && <span className="truncate text-[11px] text-muted-foreground font-mono">{l.sub}</span>}
                  <span className="ml-auto pl-2 text-[11px] tabular-nums text-muted-foreground">{ja ? <Check className="size-3.5" /> : `${l.linhas} l`}</span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="px-3 py-2 border-t border-border text-[11px] text-muted-foreground leading-snug">
          Prefira a seção ao arquivo inteiro. Ref de empresa (context/, brand/) vale para todo projeto: o agente lê a do projeto da tarefa.
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ItemLinha({ it, c, tipo, agentes, onChange, onRemover }: {
  it: ItemContexto; c?: RefConferida; tipo: TipoFicha; agentes: string[]; onChange: (i: ItemContexto) => void; onRemover: () => void;
}) {
  const p = partesRef(it.ref);
  const sempre = it.quando === 'sempre';
  const problema = c && (!c.ok ? c.erro : c.avisos.join(' · '));
  return (
    <li className="group rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <StatusRef c={c} />
        <span className="min-w-0 flex-1 truncate text-[13px]" title={it.ref}>
          <span className="font-medium">{p.nome}</span>
          {p.secao && <span className="text-foreground/80"> › {p.secao}</span>}
          <span className="ml-2 text-[11px] font-mono text-muted-foreground">{p.pasta}</span>
        </span>
        <div className="inline-flex rounded-md border border-border bg-card p-0.5 text-[11px]">
          <button className={cx('px-2 h-5 rounded', sempre ? 'bg-primary-soft text-primary-ink font-medium' : 'text-muted-foreground hover:text-foreground')} onClick={() => onChange({ ...it, quando: 'sempre' })}>Sempre</button>
          <button className={cx('px-2 h-5 rounded', !sempre ? 'bg-primary-soft text-primary-ink font-medium' : 'text-muted-foreground hover:text-foreground')} onClick={() => !sempre || onChange({ ...it, quando: '' })}>Só quando…</button>
        </div>
        <button className="size-6 grid place-items-center rounded text-muted-foreground opacity-60 hover:opacity-100 hover:bg-card hover:text-destructive" title="Tirar do contexto" onClick={onRemover}><X className="size-3.5" /></button>
      </div>
      {problema && <div className={cx('text-[11px] mt-1 pl-6', c?.ok ? 'text-warning-ink' : 'text-destructive')}>{problema}</div>}
      <div className="flex flex-wrap items-center gap-2 mt-1.5 pl-6">
        {!sempre && (
          <input value={it.quando} onChange={(e) => onChange({ ...it, quando: e.target.value })} placeholder="quando? ex.: vídeo, fundo de funil"
            className="h-7 w-52 rounded-md border border-border bg-card px-2 text-xs outline-none focus:border-primary" />
        )}
        <input value={it.motivo} onChange={(e) => onChange({ ...it, motivo: e.target.value })} placeholder="para quê (o que tirar daqui)"
          className="h-7 flex-1 min-w-[180px] rounded-md border border-transparent bg-transparent px-2 text-xs outline-none hover:border-border focus:border-primary focus:bg-card" />
      </div>
      {tipo === 'skill' && agentes.length > 1 && (
        <div className="flex flex-wrap items-center gap-1 mt-1.5 pl-6">
          <span className="text-[11px] text-muted-foreground mr-1">Quem lê:</span>
          <button className={cx('h-6 px-2 rounded-full text-[11px] border', !it.agentes.length ? 'border-primary/40 bg-primary-soft text-primary-ink' : 'border-border text-muted-foreground hover:text-foreground')}
            onClick={() => onChange({ ...it, agentes: [] })}>Todos</button>
          {agentes.map((a) => {
            const on = it.agentes.includes(a);
            return (
              <button key={a} className={cx('h-6 px-2 rounded-full text-[11px] border', on ? 'border-primary/40 bg-primary-soft text-primary-ink' : 'border-border text-muted-foreground hover:text-foreground')}
                onClick={() => onChange({ ...it, agentes: on ? it.agentes.filter((x) => x !== a) : [...it.agentes, a] })}>{NOME_AGENTE[a] ?? a}</button>
            );
          })}
        </div>
      )}
    </li>
  );
}

/** skill usada por vários agentes: o que cada um lê dentro dela */
function PorAgente({ itens, agentes }: { itens: ItemContexto[]; agentes: string[] }) {
  if (agentes.length < 2 || !itens.some((i) => i.agentes.length)) return null;
  return (
    <div className="mt-3 rounded-lg border border-border overflow-hidden">
      {agentes.map((a) => {
        const meus = itens.filter((i) => !i.agentes.length || i.agentes.includes(a));
        return (
          <div key={a} className="flex items-start gap-2.5 px-3 py-2 border-b border-border last:border-0 text-[13px]">
            <Avatar a={{ nome: NOME_AGENTE[a] ?? a, cor: null }} size="xs" estado={false} />
            <span className="w-28 shrink-0 font-medium">{NOME_AGENTE[a] ?? a}</span>
            <span className="text-muted-foreground leading-snug">{meus.length ? meus.map((i) => { const p = partesRef(i.ref); return p.secao ? `${p.nome} › ${p.secao}` : p.nome; }).join(' · ') : 'nada'}</span>
          </div>
        );
      })}
    </div>
  );
}

/** agente: tudo o que ele lê (ficha + skills ativadas), do jeito que o `pacote` monta */
function LeituraTotal({ f }: { f: FichaAgenteView }) {
  const [open, setOpen] = useState(false);
  const itens = f.leitura ?? [];
  const daSkill = itens.filter((i) => i.de.some((d) => d.startsWith('skill')));
  if (!daSkill.length) return null;
  return (
    <div className="mt-3">
      <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)}>
        <ChevronRight className={cx('size-3.5 transition-transform', open && 'rotate-90')} />Mais {daSkill.length} das skills ativadas (o pacote da tarefa junta)
      </button>
      {open && (
        <ul className="mt-1.5 space-y-1 text-[12.5px]">
          {daSkill.map((i) => { const p = partesRef(i.ref); return (
            <li key={i.ref} className="flex gap-2"><span className="text-muted-foreground w-36 shrink-0 truncate">{i.de.join(', ').replace(/skill /g, '')}</span>
              <span className="truncate"><span className="font-medium">{p.nome}</span>{p.secao && ` › ${p.secao}`}<span className="text-muted-foreground"> · {i.quando === 'sempre' ? 'sempre' : `quando: ${i.quando}`}</span></span></li>
          ); })}
        </ul>
      )}
    </div>
  );
}

// ── ficha ────────────────────────────────────────────────────────────────────
export function FichaEditor({ tipo, id, onArquivo, onDirty }: { tipo: TipoFicha; id: string; onArquivo: () => void; onDirty: (d: boolean) => void }) {
  const { slug = '' } = useParams();
  const qc = useQueryClient();
  const key = ['ficha-agente', tipo, id, slug];
  const { data, error, isLoading } = useQuery({ queryKey: key, queryFn: () => api.fichaAgente(tipo, id, slug), staleTime: 0 });
  const [draft, setDraft] = useState<Draft | null>(null);
  const base = useMemo(() => (data ? draftDe(data) : null), [data]);
  useEffect(() => { if (base && draft == null) setDraft(base); }, [base, draft]);
  const dirty = !!base && !!draft && JSON.stringify(base) !== JSON.stringify(draft);
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);

  // conferência ao vivo das refs (inclusive as que ainda não foram salvas)
  const refs = draft?.contexto.itens.map((i) => i.ref) ?? [];
  const conf = useQuery({ queryKey: ['ficha-refs', slug, refs.join('|')], queryFn: () => api.fichaRefs(refs, slug), enabled: refs.length > 0, placeholderData: (p) => p });
  const confDe = (ref: string) => conf.data?.find((c) => c.ref === ref);

  const salvar = useMutation({
    mutationFn: (d: Draft) => api.salvarFichaAgente(tipo, id, slug, edicaoDe(d, tipo), data?.mtime ?? null),
    onSuccess: (r) => {
      qc.setQueryData(key, r); setDraft(draftDe(r));
      for (const k of ['arquivo', 'agente-arquivos', 'skills', 'skill', 'agentes']) void qc.invalidateQueries({ queryKey: [k] });
      toast.ok(r.conferencia.erros.length ? `Salvo, com ${r.conferencia.erros.length} problema(s) na conferência` : 'Salvo: vale a partir da próxima tarefa');
    },
    onError: (e) => toast.error(e, 'Não foi possível salvar'),
  });
  const salvarRef = useRef(() => {}); salvarRef.current = () => { if (dirty && draft && !salvar.isPending) salvar.mutate(draft); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); salvarRef.current(); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  if (error) return <div className="p-6"><ErrorBox error={error} /></div>;
  if (isLoading || !data || !draft) return <div className="p-6 space-y-3">{[90, 160, 120].map((h, i) => <div key={i} className="rounded-xl bg-muted animate-pulse" style={{ height: h }} />)}</div>;

  const set = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const setCampo = (k: CampoKey, v: string) => setDraft((d) => (d ? { ...d, campos: { ...d.campos, [k]: v } } : d));
  const setItens = (itens: ItemContexto[]) => setDraft((d) => (d ? { ...d, contexto: { ...d.contexto, itens } } : d));
  const molde = data.molde.filter((c) => c.key !== 'contexto');
  const usados = new Set(draft.contexto.itens.map((i) => normTxt(i.ref)));
  const conferencia = data.conferencia;
  const sempre = draft.contexto.itens.filter((i) => i.quando === 'sempre').length;

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 bg-card/95 backdrop-blur border-b border-border/70">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold truncate">Ficha {tipo === 'agente' ? `do ${NOME_AGENTE[id]?.toLowerCase() ?? id}` : `da skill ${id}`}</span>
            {data.noMolde
              ? <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-success/10 text-success-ink px-2 py-0.5"><Check className="size-3" />No molde</span>
              : <span className="inline-flex items-center gap-1 text-[11px] rounded-full bg-warning/10 text-warning-ink px-2 py-0.5"><CircleAlert className="size-3" />Fora do molde</span>}
          </div>
          <div className="text-xs text-muted-foreground truncate font-mono text-[11px]">{data.path}</div>
        </div>
        {dirty && <span className="inline-flex items-center gap-1.5 text-xs text-warning-ink"><span className="size-1.5 rounded-full bg-warning" />Não salvo</span>}
        {dirty && <Button variant="ghost" className="h-8 px-2.5 text-xs inline-flex items-center gap-1" onClick={() => setDraft(base)}><Undo2 className="size-3.5" />Descartar</Button>}
        <Button variant="ghost" className="h-8 px-2.5 text-xs inline-flex items-center gap-1.5" onClick={onArquivo} title="Abrir o markdown cru (o mesmo arquivo)"><FileCode2 className="size-3.5" />Editar o arquivo</Button>
        <Button className="h-8 px-3 text-xs inline-flex items-center gap-1.5" disabled={!dirty || salvar.isPending} onClick={() => salvarRef.current()} title="Salvar (Ctrl+S)">
          {salvar.isPending && <Loader2 className="size-3.5 animate-spin" />}Salvar
        </Button>
      </div>

      <div className="flex-1 px-6 py-5">
        <div className="max-w-3xl mx-auto space-y-4">
          {!data.noMolde && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-[13px] leading-relaxed">
              <b>Ainda não revisada no molde.</b> O texto atual está em <i>Outras seções</i>, no fim. Preencha os campos (a começar por Especialista e Contexto) e
              mova o que estiver lá; ao salvar, as seções do molde entram no arquivo na ordem certa.
            </div>
          )}
          {(conferencia.erros.length > 0 || conferencia.avisos.filter((a) => !a.startsWith('fora do molde')).length > 0) && (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-[13px] space-y-1">
              {conferencia.erros.map((e) => <div key={e} className="flex gap-2 text-destructive"><XCircle className="size-4 shrink-0 mt-0.5" />{e}</div>)}
              {conferencia.avisos.filter((a) => !a.startsWith('fora do molde')).map((a) => <div key={a} className="flex gap-2 text-warning-ink"><AlertTriangle className="size-4 shrink-0 mt-0.5" />{a}</div>)}
            </div>
          )}

          <Bloco icone={Search} titulo="Quando usar" dica={tipo === 'agente' ? 'Descrição que o orquestrador lê para decidir a quem delegar.' : 'Descrição que o Claude lê para decidir quando carregar a skill: o que faz + frases que disparam.'}>
            <Textarea value={draft.description} onChange={(e) => set({ description: e.target.value })} rows={3} className="text-[13px] leading-relaxed resize-y" />
            {tipo === 'agente' && (
              <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 mt-2.5">
                <label className="text-xs text-muted-foreground space-y-1"><span>Modelo</span>
                  <SelectField value={draft.model} onChange={(v) => set({ model: v })} options={[{ value: '', label: 'Herdar da sessão' }, { value: 'haiku', label: 'Haiku' }, { value: 'sonnet', label: 'Sonnet' }, { value: 'opus', label: 'Opus' }]} />
                </label>
                <label className="text-xs text-muted-foreground space-y-1"><span>Cor</span>
                  <SelectField value={draft.color} onChange={(v) => set({ color: v })}
                    options={[{ value: '', label: 'Padrão' }, ...Object.entries(COR).map(([k, c]) => ({ value: k, label: k, icon: <span className="size-3 rounded-full" style={{ background: c }} /> }))]} />
                </label>
                <label className="text-xs text-muted-foreground space-y-1"><span>Ferramentas (vazio = todas)</span>
                  <Input value={draft.tools} onChange={(e) => set({ tools: e.target.value })} placeholder="Read, Grep, Glob, Bash, Edit" className="w-full h-[34px]" />
                </label>
              </div>
            )}
          </Bloco>

          {molde.slice(0, 1).map((c) => (
            <Bloco key={c.key} icone={ICONE[c.key]} titulo={c.titulo} dica={c.dica} destaque>
              <MarkdownEditor value={draft.campos[c.key]} onChange={(v) => setCampo(c.key, v)} minHeight={140} placeholder={PLACEHOLDER[c.key]} />
            </Bloco>
          ))}

          <Bloco icone={BookOpenText} titulo="Contexto" destaque
            dica={tipo === 'agente' ? 'O que este agente lê em toda tarefa, exatamente. O pacote da tarefa junta isto + o contexto das skills + o da tarefa.' : 'O que quem usa esta skill lê, exatamente. Em skill usada por mais de um agente, marque quem lê cada item.'}
            extra={<span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{sempre} sempre · {draft.contexto.itens.length - sempre} sob condição</span>}>
            {draft.contexto.itens.length > 0 && (
              <ul className="space-y-1.5 mb-2.5">
                {draft.contexto.itens.map((it, k) => (
                  <ItemLinha key={`${it.ref}-${k}`} it={it} c={confDe(it.ref)} tipo={tipo} agentes={data.agentes}
                    onChange={(n) => setItens(draft.contexto.itens.map((x, j) => (j === k ? n : x)))}
                    onRemover={() => setItens(draft.contexto.itens.filter((_, j) => j !== k))} />
                ))}
              </ul>
            )}
            <SeletorContexto slug={slug} usados={usados} onEscolher={(ref) => setItens([...draft.contexto.itens, { ref, quando: 'sempre', agentes: [], motivo: '' }])} />
            <textarea value={draft.contexto.nota} onChange={(e) => setDraft({ ...draft, contexto: { ...draft.contexto, nota: e.target.value } })}
              placeholder="Observação sobre o contexto (opcional). Ex.: com context: na tarefa, ele vem primeiro."
              className="mt-2.5 w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-xs text-muted-foreground outline-none hover:border-border focus:border-primary focus:bg-card resize-none"
              rows={draft.contexto.nota ? 2 : 1} />
            {tipo === 'skill' && <PorAgente itens={draft.contexto.itens} agentes={data.agentes} />}
            {tipo === 'agente' && <LeituraTotal f={data} />}
          </Bloco>

          {molde.slice(1).map((c) => (
            <Bloco key={c.key} icone={ICONE[c.key]} titulo={c.titulo} dica={c.dica + (c.obrigatorio ? '' : ' (opcional)')}>
              <MarkdownEditor value={draft.campos[c.key]} onChange={(v) => setCampo(c.key, v)} minHeight={90} placeholder={PLACEHOLDER[c.key]} />
            </Bloco>
          ))}

          <OutrasSecoes draft={draft} setDraft={setDraft} />
        </div>
      </div>
    </div>
  );
}

function OutrasSecoes({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const tog = (k: number) => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const setOutra = (k: number, o: SecaoLivre) => setDraft({ ...draft, outras: draft.outras.map((x, j) => (j === k ? o : x)) });
  const linhas = (t: string) => t.split('\n').filter((l) => l.trim()).length;
  return (
    <section className="pt-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 px-1">Outras seções do arquivo</div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        <Recolhivel titulo={`Abertura${draft.titulo ? ` · # ${draft.titulo}` : ''}`} info={`${linhas(draft.abertura)} linha(s)`} aberto={open.has(-1)} onToggle={() => tog(-1)}>
          <Input value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} placeholder="Título (# …)" className="w-full mb-2" />
          <MarkdownEditor value={draft.abertura} onChange={(v) => setDraft({ ...draft, abertura: v })} minHeight={80} placeholder="Texto antes das seções" />
        </Recolhivel>
        {draft.outras.map((o, k) => (
          <Recolhivel key={k} titulo={o.titulo} info={`${linhas(o.corpo)} linha(s)`} aberto={open.has(k)} onToggle={() => tog(k)}
            onRemover={() => { if (window.confirm(`Apagar a seção "${o.titulo}" do arquivo? (só ao salvar)`)) setDraft({ ...draft, outras: draft.outras.filter((_, j) => j !== k) }); }}>
            <Input value={o.titulo} onChange={(e) => setOutra(k, { ...o, titulo: e.target.value })} className="w-full mb-2" />
            <MarkdownEditor value={o.corpo} onChange={(v) => setOutra(k, { ...o, corpo: v })} minHeight={80} />
          </Recolhivel>
        ))}
      </div>
    </section>
  );
}

function Recolhivel({ titulo, info, aberto, onToggle, onRemover, children }: { titulo: string; info: string; aberto: boolean; onToggle: () => void; onRemover?: () => void; children: ReactNode }) {
  return (
    <div>
      <div className="group flex items-center gap-2 px-3 h-10">
        <button className="flex items-center gap-1.5 flex-1 min-w-0 text-left text-[13px]" onClick={onToggle}>
          <ChevronRight className={cx('size-3.5 shrink-0 text-muted-foreground transition-transform', aberto && 'rotate-90')} />
          <span className="truncate">{titulo}</span>
          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{info}</span>
        </button>
        {onRemover && <button className="hidden group-hover:grid size-6 place-items-center rounded text-muted-foreground hover:text-destructive" title="Apagar seção" onClick={onRemover}><X className="size-3.5" /></button>}
      </div>
      {aberto && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

/** caminho do arquivo → ficha (definição de agente ou SKILL.md) */
export function fichaDoArquivo(path: string): { tipo: TipoFicha; id: string } | null {
  const a = path.match(/^\.claude\/agents\/([a-z0-9][a-z0-9-]*)\.md$/);
  if (a) return { tipo: 'agente', id: a[1] };
  const s = path.match(/^\.claude\/skills\/([a-z0-9][a-z0-9-]*)\/SKILL\.md$/);
  return s ? { tipo: 'skill', id: s[1] } : null;
}
