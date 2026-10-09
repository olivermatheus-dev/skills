// Explorador de arquivos de agentes e skills (estilo Notion): lista à esquerda (arquivos fixos no topo, skills como pastas
// recolhíveis, subpastas também) e o editor à direita (rich text para .md, texto puro para scripts e dados).
// O arquivo aberto fica na URL (?f=), então dá para mandar o link de um arquivo direto.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Braces, ChevronRight, ClipboardList, File, FileCode2, FileText, Folder, FolderOpen, Loader2, NotebookPen, Pin, ScrollText, Settings2, Sparkles, Undo2, X, type LucideIcon,
} from 'lucide-react';
import { api, type ArquivoFixo, type NoArquivo, type SkillDetalhe } from '../../api';
import { MarkdownEditor } from '../Markdown';
import { useFillHeight } from '../fill';
import { Button, ErrorBox, cx } from '../kit';
import { toast } from '../toast';
import { FichaEditor, fichaDoArquivo } from './Ficha';

const ext = (p: string) => p.slice(p.lastIndexOf('.') + 1).toLowerCase();
function iconeArquivo(nome: string): LucideIcon {
  const e = ext(nome);
  if (e === 'md' || e === 'mdx' || e === 'txt') return FileText;
  if (e === 'json' || e === 'yml' || e === 'yaml') return Braces;
  if (['mjs', 'js', 'cjs', 'ts', 'tsx', 'py', 'sh', 'ps1', 'html', 'css'].includes(e)) return FileCode2;
  return File;
}
const ICONE_FIXO = (path: string): LucideIcon => (path.includes('agent-notes') ? NotebookPen : path.includes('protocolo') ? ScrollText : path === 'CLAUDE.md' ? ScrollText : Settings2);

// ── linhas da lista ───────────────────────────────────────────────────────────
const ROW = 'group w-full flex items-center gap-1.5 h-7 pr-1.5 rounded-md text-[13px] text-left transition-colors';
const rowCls = (on: boolean, off?: boolean) => cx(ROW, off ? 'text-muted-foreground/60 cursor-default' : on ? 'bg-primary-soft text-primary-ink font-medium' : 'text-foreground/85 hover:bg-muted');

function Chevron({ open }: { open: boolean }) {
  return <ChevronRight className={cx('size-3.5 shrink-0 text-muted-foreground transition-transform duration-150', open && 'rotate-90')} strokeWidth={2} />;
}

function Arvore({ nos, nivel, sel, onSel, abertas, alternar }: { nos: NoArquivo[]; nivel: number; sel: string | null; onSel: (p: string) => void; abertas: Set<string>; alternar: (p: string) => void }) {
  return (
    <>
      {nos.map((n) => {
        const pad = { paddingLeft: 6 + nivel * 14 };
        if (n.pasta) {
          const open = abertas.has(n.path);
          const I = open ? FolderOpen : Folder;
          return (
            <div key={n.path}>
              <button className={rowCls(false)} style={pad} onClick={() => alternar(n.path)}>
                <Chevron open={open} /><I className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.7} />
                <span className="truncate flex-1">{n.nome}</span>
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">{n.filhos?.length ?? 0}</span>
              </button>
              {open && <Arvore nos={n.filhos ?? []} nivel={nivel + 1} sel={sel} onSel={onSel} abertas={abertas} alternar={alternar} />}
            </div>
          );
        }
        const I = iconeArquivo(n.nome);
        return (
          <button key={n.path} className={rowCls(sel === n.path, !n.texto)} style={pad} disabled={!n.texto}
            title={n.texto ? n.path : `${n.nome}: arquivo binário (abra pela pasta)`} onClick={() => onSel(n.path)}>
            <span className="w-3.5 shrink-0" /><I className="size-4 shrink-0 opacity-70" strokeWidth={1.7} />
            <span className="truncate">{n.nome}</span>
          </button>
        );
      })}
    </>
  );
}

const Titulo = ({ children, extra }: { children: ReactNode; extra?: ReactNode }) => (
  <div className="flex items-center gap-1.5 px-2 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
    <span className="flex-1 inline-flex items-center gap-1.5">{children}</span>{extra}
  </div>
);

// ── editor de um arquivo ──────────────────────────────────────────────────────
function ArquivoEditor({ path, fixo, onDirty, onFicha }: { path: string; fixo?: ArquivoFixo; onDirty: (d: boolean) => void; /** arquivo que tem ficha: volta para ela */ onFicha?: () => void }) {
  const qc = useQueryClient();
  const { data, error, isLoading } = useQuery({ queryKey: ['arquivo', path], queryFn: () => api.arquivo(path), staleTime: 0 });
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => { if (data && draft == null) setDraft(data.texto); }, [data, draft]);
  const dirty = !!data && draft != null && draft !== data.texto;
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);

  const salvar = useMutation({
    mutationFn: (texto: string) => api.salvarArquivo(path, texto, data?.mtime ?? null),
    onSuccess: (r) => {
      qc.setQueryData(['arquivo', path], r); setDraft(r.texto);
      for (const k of ['agente-arquivos', 'skills', 'skill', 'agentes', 'agente-notas']) void qc.invalidateQueries({ queryKey: [k] });
      toast.ok('Salvo: vale a partir da próxima tarefa');
    },
    onError: (e) => toast.error(e, 'Não foi possível salvar'),
  });
  const salvarRef = useRef(() => {}); salvarRef.current = () => { if (dirty && !salvar.isPending && draft != null) salvar.mutate(draft); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); salvarRef.current(); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  const md = /\.(md|mdx)$/i.test(path);
  const partes = path.split('/');
  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 bg-card/95 backdrop-blur border-b border-border/70">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold truncate">{fixo?.titulo ?? partes[partes.length - 1]}</div>
          <div className="text-xs text-muted-foreground truncate" title={path}>
            {fixo?.dica ? <>{fixo.dica} · </> : null}<span className="font-mono text-[11px]">{path}</span>
          </div>
        </div>
        {data && !data.existe && <span className="text-xs text-muted-foreground">Arquivo novo: nasce ao salvar</span>}
        {dirty && <span className="inline-flex items-center gap-1.5 text-xs text-warning-ink"><span className="size-1.5 rounded-full bg-warning" />Não salvo</span>}
        {dirty && <Button variant="ghost" className="h-8 px-2.5 text-xs inline-flex items-center gap-1" onClick={() => setDraft(data!.texto)} title="Descartar alterações"><Undo2 className="size-3.5" />Descartar</Button>}
        {onFicha && <Button variant="ghost" className="h-8 px-2.5 text-xs inline-flex items-center gap-1.5" onClick={() => { if (!dirty || window.confirm('Há alterações não salvas no arquivo. Voltar para a ficha sem salvar?')) onFicha(); }} title="Ver em campos (formulário)"><ClipboardList className="size-3.5" />Ver a ficha</Button>}
        <Button className="h-8 px-3 text-xs inline-flex items-center gap-1.5" disabled={!dirty || salvar.isPending} onClick={() => salvarRef.current()} title="Salvar (Ctrl+S)">
          {salvar.isPending && <Loader2 className="size-3.5 animate-spin" />}Salvar
        </Button>
      </div>
      <div className="flex-1 px-6 py-4">
        <ErrorBox error={error} />
        {isLoading && <div className="space-y-2">{[70, 90, 55, 80].map((w, i) => <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${w}%` }} />)}</div>}
        {draft != null && (md ? (
          <MarkdownEditor bare source value={draft} onChange={setDraft} minHeight={360} placeholder="Escreva as instruções…" className="max-w-3xl mx-auto" />
        ) : (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false}
            className="w-full min-h-[60vh] resize-none rounded-xl border border-border bg-muted/30 p-4 font-mono text-[12.5px] leading-relaxed outline-none focus:border-primary/40"
            style={{ fieldSizing: 'content' } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

// ── área completa ─────────────────────────────────────────────────────────────
export function ArquivosWorkspace({ fixos = [], skills = [], arvore, padrao, rodapeSkills, onRemoverSkill, vazio }: {
  fixos?: ArquivoFixo[];
  /** cada skill vira uma pasta recolhível */
  skills?: SkillDetalhe[];
  /** ou: a árvore de uma skill só, sem a pasta de fora */
  arvore?: NoArquivo[];
  padrao?: string | null;
  rodapeSkills?: ReactNode;
  onRemoverSkill?: (id: string) => void;
  vazio?: ReactNode;
}) {
  const [sp, setSp] = useSearchParams();
  const [fillRef, fillH] = useFillHeight();
  const sel = sp.get('f') ?? padrao ?? fixos[0]?.path ?? skills[0]?.arvore[0]?.path ?? arvore?.find((n) => !n.pasta)?.path ?? null;
  const dirty = useRef(false);
  const onDirty = useCallback((d: boolean) => { dirty.current = d; }, []);
  useEffect(() => {
    const k = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener('beforeunload', k); return () => window.removeEventListener('beforeunload', k);
  }, []);
  const abrir = (p: string) => {
    if (p === sel) return;
    if (dirty.current && !window.confirm('Há alterações não salvas neste arquivo. Sair sem salvar?')) return;
    setSp((s) => { const n = new URLSearchParams(s); n.set('f', p); n.delete('modo'); return n; }, { replace: true });
  };

  // pastas abertas: a skill (e subpastas) do arquivo aberto começam abertas
  const [abertas, setAbertas] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    if (!sel) return;
    const partes = sel.split('/');
    setAbertas((a) => { const n = new Set(a); for (let i = 3; i < partes.length; i++) n.add(partes.slice(0, i).join('/')); return n; });
  }, [sel]);
  const alternar = (p: string) => setAbertas((a) => { const n = new Set(a); if (n.has(p)) n.delete(p); else n.add(p); return n; });
  const fixo = useMemo(() => fixos.find((f) => f.path === sel), [fixos, sel]);
  // definição do agente e SKILL.md abrem na ficha (048); ?modo=arquivo = markdown cru
  const ficha = sel ? fichaDoArquivo(sel) : null;
  const cru = sp.get('modo') === 'arquivo';
  const trocarModo = (arquivo: boolean) => {
    if (dirty.current && !window.confirm('Há alterações não salvas. Trocar de visão sem salvar?')) return;
    setSp((s) => { const n = new URLSearchParams(s); if (arquivo) n.set('modo', 'arquivo'); else n.delete('modo'); return n; }, { replace: true });
  };

  return (
    <div ref={fillRef} style={{ height: fillH }} className="grid grid-cols-[280px_1fr] rounded-xl border border-border bg-card overflow-hidden min-h-[420px]">
      <nav className="border-r border-border bg-muted/25 overflow-y-auto p-1.5 pb-4">
        {fixos.length > 0 && (
          <>
            <Titulo><Pin className="size-3" />Arquivos do agente</Titulo>
            {fixos.map((f) => {
              const I = ICONE_FIXO(f.path);
              return (
                <button key={f.path} className={rowCls(sel === f.path)} style={{ paddingLeft: 6 }} onClick={() => abrir(f.path)} title={f.dica}>
                  <I className="size-4 shrink-0 opacity-75" strokeWidth={1.7} />
                  <span className="truncate flex-1">{f.titulo}</span>
                  {!f.existe && <span className="text-[10px] text-muted-foreground">vazio</span>}
                </button>
              );
            })}
          </>
        )}
        {arvore ? (
          <div className="pt-1.5"><Arvore nos={arvore} nivel={0} sel={sel} onSel={abrir} abertas={abertas} alternar={alternar} /></div>
        ) : (
          <>
            <Titulo extra={<span className="tabular-nums normal-case">{skills.length}</span>}><Sparkles className="size-3" />Skills</Titulo>
            {skills.map((s) => {
              const raiz = `.claude/skills/${s.id}`;
              const open = abertas.has(raiz);
              return (
                <div key={s.id}>
                  <div className={cx(rowCls(false), 'pl-1.5')}>
                    <button className="flex items-center gap-1.5 flex-1 min-w-0 h-full" title={s.descricao}
                      onClick={() => { alternar(raiz); if (!open) { const main = s.arvore.find((n) => n.nome === 'SKILL.md'); if (main) abrir(main.path); } }}>
                      <Chevron open={open} />
                      <span className="size-4 shrink-0 grid place-items-center rounded bg-ai-soft text-ai-ink"><Sparkles className="size-2.5" strokeWidth={2.2} /></span>
                      <span className="truncate">{s.id}</span>
                    </button>
                    <span className="text-[11px] text-muted-foreground/70 tabular-nums group-hover:hidden">{s.arquivos}</span>
                    {onRemoverSkill && (
                      <button className="hidden group-hover:grid size-5 place-items-center rounded text-muted-foreground hover:bg-card hover:text-destructive" title="Desativar esta skill para o agente"
                        onClick={() => onRemoverSkill(s.id)}><X className="size-3.5" /></button>
                    )}
                  </div>
                  {open && <Arvore nos={s.arvore} nivel={1} sel={sel} onSel={abrir} abertas={abertas} alternar={alternar} />}
                </div>
              );
            })}
            {!skills.length && <div className="px-2 py-1.5 text-xs text-muted-foreground">{vazio ?? 'Nenhuma skill ativada.'}</div>}
            {rodapeSkills}
          </>
        )}
      </nav>
      <div className="overflow-y-auto min-w-0">
        {!sel ? <div className="p-10 text-sm text-muted-foreground text-center">Escolha um arquivo na lista.</div>
          : ficha && !cru ? <FichaEditor key={sel} tipo={ficha.tipo} id={ficha.id} onDirty={onDirty} onArquivo={() => trocarModo(true)} />
          : <ArquivoEditor key={sel} path={sel} fixo={fixo} onDirty={onDirty} onFicha={ficha ? () => trocarModo(false) : undefined} />}
      </div>
    </div>
  );
}
