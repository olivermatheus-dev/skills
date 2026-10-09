// Editor rich text que lê e grava markdown (Tiptap + @tiptap/markdown). Carregado sob demanda por Markdown.tsx.
// · Barra mínima e arredondada com ícones Lucide; atalhos de markdown (#, -, [ ], **…) funcionam direto no texto.
// · Frontmatter (`---` no topo, ex.: agentes e skills) não passa pelo Tiptap: vira o bloco "Propriedades" e volta intacto.
// · `source` liga o botão de markdown cru (para arquivos técnicos, ex.: SKILL.md com blocos de código).
import { useEditor, useEditorState, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extensions';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Bold, Check, ChevronDown, Code, Code2, FileCode2, Heading1, Heading2, Heading3, Italic, Link2, List, ListChecks, ListOrdered,
  Minus, Pilcrow, Quote, Redo2, Strikethrough, Table2, Trash2, Underline, Undo2, type LucideIcon,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type MarkdownEditorProps = {
  value: string; onChange: (md: string) => void; placeholder?: string; minHeight?: number;
  /** sem cartão: ocupa o painel em que está (editor de arquivos); a barra gruda no topo da rolagem */
  bare?: boolean;
  /** mostra o botão de alternar para o markdown cru */
  source?: boolean;
  className?: string;
};

// ── frontmatter ───────────────────────────────────────────────────────────────
const FM = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
function split(md: string) {
  const m = md.match(FM);
  return m ? { fm: m[1], body: md.slice(m[0].length).replace(/^\r?\n/, '') } : { fm: null, body: md };
}
const join = (fm: string | null, body: string) => (fm == null ? body : `---\n${fm}\n---\n\n${body}`);

// O serializador escapa como HTML (">" → "&gt;", "~" → "\~"). Nos nossos arquivos isso só atrapalha quem lê (pessoa e agente).
const limpar = (md: string) => md.replace(/&gt;/g, '>').replace(/&lt;(?=[\s\d=>])/g, '<').replace(/&amp;(?!#?\w+;)/g, '&').replace(/\\~/g, '~');
const markdownDe = (e: Editor) => limpar(e.getMarkdown());

/** o texto volta igual depois de passar pelo editor? (ignora espaços, linhas vazias, alinhamento de tabela) */
function fiel(original: string, saida: string) {
  const norm = (s: string) => s.replace(/\r\n/g, '\n').split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' ').replace(/\s*\|\s*/g, '|').replace(/^([-*+]) /, '- '))
    .filter((l) => l && !/^\|?[\s:|-]+\|?$/.test(l));
  const a = norm(original), b = norm(saida);
  return a.length === b.length && a.every((l, i) => l === b[i]);
}

// ── tipografia do conteúdo (o preflight do Tailwind zera h1/ul/…; sem plugin typography) ──
const CONTENT_CSS = `
.hub-md { line-height: 1.65; color: var(--color-foreground); min-height: var(--md-min-h, 240px); outline: none; }
.hub-md > * + * { margin-top: .65em; }
.hub-md h1 { font-size: 1.55em; font-weight: 700; letter-spacing: -.015em; line-height: 1.25; margin-top: 1.2em; }
.hub-md h2 { font-size: 1.25em; font-weight: 650; letter-spacing: -.01em; line-height: 1.3; margin-top: 1.1em; }
.hub-md h3 { font-size: 1.06em; font-weight: 620; margin-top: .95em; }
.hub-md h4, .hub-md h5, .hub-md h6 { font-weight: 600; margin-top: .8em; }
.hub-md > :first-child { margin-top: 0; }
.hub-md ul { list-style: disc; padding-left: 1.35em; }
.hub-md ol { list-style: decimal; padding-left: 1.45em; }
.hub-md li { margin: .12em 0; }
.hub-md li::marker { color: var(--color-muted-foreground); }
.hub-md li > p, .hub-md li > ul, .hub-md li > ol { margin-top: 0; }
.hub-md ul[data-type="taskList"] { list-style: none; padding-left: .1em; }
.hub-md ul[data-type="taskList"] li { display: flex; gap: .55em; align-items: flex-start; }
.hub-md ul[data-type="taskList"] li > label { flex: none; margin-top: .3em; user-select: none; }
.hub-md ul[data-type="taskList"] li > div { flex: 1; min-width: 0; }
.hub-md ul[data-type="taskList"] input[type="checkbox"] { appearance: none; width: 15px; height: 15px; border: 1.5px solid var(--color-border); border-radius: 5px; display: grid; place-items: center; cursor: pointer; background: var(--color-card); transition: background .12s, border-color .12s; }
.hub-md ul[data-type="taskList"] input[type="checkbox"]:hover { border-color: var(--color-primary); }
.hub-md ul[data-type="taskList"] input[type="checkbox"]:checked { background: var(--color-primary); border-color: var(--color-primary); }
.hub-md ul[data-type="taskList"] input[type="checkbox"]:checked::after { content: ""; width: 4px; height: 8px; border: solid #fff; border-width: 0 1.75px 1.75px 0; transform: translateY(-1px) rotate(45deg); }
.hub-md ul[data-type="taskList"] li[data-checked="true"] > div { color: var(--color-muted-foreground); text-decoration: line-through; text-decoration-color: color-mix(in oklab, var(--color-muted-foreground) 50%, transparent); }
.hub-md blockquote { border-left: 2.5px solid color-mix(in oklab, var(--color-primary) 35%, var(--color-border)); padding: .1em 0 .1em .95em; color: var(--color-muted-foreground); }
.hub-md a { color: var(--color-primary-ink); text-decoration: underline; text-decoration-color: color-mix(in oklab, var(--color-primary) 40%, transparent); text-underline-offset: 3px; cursor: pointer; }
.hub-md code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .86em; background: var(--color-muted); padding: .12em .38em; border-radius: 5px; }
.hub-md pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.6; background: var(--color-muted); border: 1px solid var(--color-border); border-radius: 10px; padding: .8em 1em; overflow-x: auto; white-space: pre; }
.hub-md pre code { background: none; padding: 0; font-size: inherit; border-radius: 0; }
.hub-md hr { border: 0; border-top: 1px solid var(--color-border); margin: 1.4em 0; }
.hub-md hr.ProseMirror-selectednode { border-top-color: var(--color-primary); }
.hub-md .tableWrapper { overflow-x: auto; }
.hub-md table { border-collapse: separate; border-spacing: 0; font-size: .95em; border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; min-width: 50%; }
.hub-md th, .hub-md td { border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: .38em .7em; vertical-align: top; text-align: left; position: relative; }
.hub-md th { background: var(--color-muted); font-weight: 600; }
.hub-md tr > :last-child { border-right: 0; } .hub-md tr:last-child > * { border-bottom: 0; }
.hub-md th > p, .hub-md td > p { margin: 0; }
.hub-md .selectedCell::after { content: ""; position: absolute; inset: 0; background: color-mix(in oklab, var(--color-primary) 12%, transparent); pointer-events: none; }
.hub-md strong { font-weight: 650; }
.hub-md s { color: var(--color-muted-foreground); }
.hub-md p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: color-mix(in oklab, var(--color-muted-foreground) 70%, transparent); float: left; height: 0; pointer-events: none; }
.hub-md ::selection { background: color-mix(in oklab, var(--color-primary) 18%, transparent); }
`;
if (typeof document !== 'undefined') {
  const el = document.getElementById('hub-md-css') ?? Object.assign(document.createElement('style'), { id: 'hub-md-css' });
  el.textContent = CONTENT_CSS; if (!el.parentNode) document.head.appendChild(el);
}

// ── barra ─────────────────────────────────────────────────────────────────────
const ICON = 'size-[15px]';
function Btn({ icon: I, label, on, disabled, onClick, children, className }: { icon?: LucideIcon; label: string; on?: boolean; disabled?: boolean; onClick?: () => void; children?: ReactNode; className?: string }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={on} disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className={cn('h-7 min-w-7 px-1.5 inline-flex items-center justify-center gap-1 rounded-lg text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground disabled:opacity-35 disabled:pointer-events-none',
        on && 'bg-primary-soft text-primary-ink hover:bg-primary-soft hover:text-primary-ink', className)}>
      {I && <I className={ICON} strokeWidth={1.9} />}{children}
    </button>
  );
}
const Sep = () => <span className="mx-1 h-4 w-px shrink-0 bg-border" aria-hidden />;

const BLOCOS: { id: string; label: string; icon: LucideIcon; on: (e: Editor) => boolean; run: (e: Editor) => void }[] = [
  { id: 'p', label: 'Texto', icon: Pilcrow, on: (e) => e.isActive('paragraph'), run: (e) => e.chain().focus().setParagraph().run() },
  { id: 'h1', label: 'Título 1', icon: Heading1, on: (e) => e.isActive('heading', { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: 'h2', label: 'Título 2', icon: Heading2, on: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'h3', label: 'Título 3', icon: Heading3, on: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'quote', label: 'Citação', icon: Quote, on: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { id: 'code', label: 'Bloco de código', icon: Code2, on: (e) => e.isActive('codeBlock'), run: (e) => e.chain().focus().toggleCodeBlock().run() },
];

function LinkBtn({ editor, href }: { editor: Editor; href: string | null }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const apply = () => {
    const u = url.trim();
    const c = editor.chain().focus().extendMarkRange('link');
    (u ? c.setLink({ href: /^(https?:|mailto:|\/|#|\.)/.test(u) ? u : `https://${u}` }) : c.unsetLink()).run();
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setUrl(href ?? ''); }}>
      <PopoverTrigger asChild>
        <button type="button" title="Link" aria-label="Link" onMouseDown={(e) => e.preventDefault()}
          className={cn('h-7 min-w-7 px-1.5 inline-flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            href != null && 'bg-primary-soft text-primary-ink hover:bg-primary-soft hover:text-primary-ink')}>
          <Link2 className={ICON} strokeWidth={1.9} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-1.5 rounded-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); apply(); }}>
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Cole o endereço do link"
            className="h-8 flex-1 min-w-0 rounded-lg bg-muted/60 px-2.5 text-sm outline-none focus:bg-muted" />
          <Btn icon={Check} label="Aplicar" onClick={apply} />
          {href != null && <Btn icon={Trash2} label="Remover link" onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setOpen(false); }} />}
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({ editor, raw, onRaw, source, sticky }: { editor: Editor; raw: boolean; onRaw: () => void; source?: boolean; sticky?: boolean }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bloco: BLOCOS.find((b) => b.id !== 'p' && b.on(e))?.id ?? 'p',
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'), code: e.isActive('code'),
      ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), task: e.isActive('taskList'), table: e.isActive('table'),
      href: e.isActive('link') ? String(e.getAttributes('link').href ?? '') : null,
      undo: e.can().undo(), redo: e.can().redo(),
    }),
  });
  const bloco = BLOCOS.find((b) => b.id === s.bloco) ?? BLOCOS[0];
  const c = () => editor.chain().focus();
  return (
    <div className={cn('z-10 flex items-center gap-0.5 overflow-x-auto rounded-xl border border-border/80 bg-card/90 px-1 py-1 shadow-[0_1px_2px_rgb(0_0_0/0.04)] backdrop-blur [scrollbar-width:none]',
      sticky && 'sticky top-0')}>
      {raw ? (
        <span className="px-2 text-xs text-muted-foreground">Markdown</span>
      ) : (
        <>
          <Btn icon={Undo2} label="Desfazer (Ctrl+Z)" disabled={!s.undo} onClick={() => c().undo().run()} />
          <Btn icon={Redo2} label="Refazer (Ctrl+Shift+Z)" disabled={!s.redo} onClick={() => c().redo().run()} />
          <Sep />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" onMouseDown={(e) => e.preventDefault()} title="Tipo de bloco"
                className="h-7 pl-2 pr-1.5 inline-flex items-center gap-1.5 rounded-lg text-[13px] text-foreground/85 hover:bg-muted data-[state=open]:bg-muted whitespace-nowrap">
                <bloco.icon className={cn(ICON, 'text-muted-foreground')} strokeWidth={1.9} />{bloco.label}
                <ChevronDown className="size-3 text-muted-foreground" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 rounded-xl p-1" onCloseAutoFocus={(e) => e.preventDefault()}>
              {BLOCOS.map((b) => (
                <DropdownMenuItem key={b.id} onSelect={() => b.run(editor)} className="rounded-lg text-[13px] gap-2">
                  <b.icon className="size-[15px]" strokeWidth={1.9} /><span className="flex-1">{b.label}</span>
                  {b.id === s.bloco && <Check className="size-3.5 text-primary-ink" strokeWidth={2.2} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Sep />
          <Btn icon={Bold} label="Negrito (Ctrl+B)" on={s.bold} onClick={() => c().toggleBold().run()} />
          <Btn icon={Italic} label="Itálico (Ctrl+I)" on={s.italic} onClick={() => c().toggleItalic().run()} />
          <Btn icon={Underline} label="Sublinhado (Ctrl+U)" on={s.underline} onClick={() => c().toggleUnderline().run()} />
          <Btn icon={Strikethrough} label="Riscado" on={s.strike} onClick={() => c().toggleStrike().run()} />
          <Btn icon={Code} label="Código" on={s.code} onClick={() => c().toggleCode().run()} />
          <Sep />
          <Btn icon={List} label="Lista" on={s.ul} onClick={() => c().toggleBulletList().run()} />
          <Btn icon={ListOrdered} label="Lista numerada" on={s.ol} onClick={() => c().toggleOrderedList().run()} />
          <Btn icon={ListChecks} label="Checklist" on={s.task} onClick={() => c().toggleTaskList().run()} />
          <Sep />
          <LinkBtn editor={editor} href={s.href} />
          {s.table ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" title="Tabela" onMouseDown={(e) => e.preventDefault()}
                  className="h-7 min-w-7 px-1.5 inline-flex items-center justify-center gap-0.5 rounded-lg bg-primary-soft text-primary-ink">
                  <Table2 className={ICON} strokeWidth={1.9} /><ChevronDown className="size-3" strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 rounded-xl p-1 text-[13px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                {([
                  ['Linha acima', () => c().addRowBefore().run()], ['Linha abaixo', () => c().addRowAfter().run()],
                  ['Coluna à esquerda', () => c().addColumnBefore().run()], ['Coluna à direita', () => c().addColumnAfter().run()],
                  ['Apagar linha', () => c().deleteRow().run()], ['Apagar coluna', () => c().deleteColumn().run()],
                ] as const).map(([l, f]) => <DropdownMenuItem key={l} onSelect={f} className="rounded-lg text-[13px]">{l}</DropdownMenuItem>)}
                <DropdownMenuItem variant="destructive" onSelect={() => c().deleteTable().run()} className="rounded-lg text-[13px]">Apagar tabela</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Btn icon={Table2} label="Inserir tabela" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
          )}
          <Btn icon={Minus} label="Divisória" onClick={() => c().setHorizontalRule().run()} />
        </>
      )}
      {source && (
        <>
          <span className="flex-1" />
          <Btn icon={FileCode2} label={raw ? 'Voltar ao editor' : 'Ver o markdown'} on={raw} onClick={onRaw} />
        </>
      )}
    </div>
  );
}

// ── propriedades (frontmatter) ────────────────────────────────────────────────
const LINHA = /^([A-Za-z_][\w-]*):[ \t]?(.*)$/;
function Propriedades({ fm, onChange }: { fm: string; onChange: (fm: string) => void }) {
  const linhas = fm.split(/\r?\n/);
  const simples = linhas.every((l) => LINHA.test(l));
  const [cru, setCru] = useState(!simples);
  return (
    <div className="mb-4 rounded-xl border border-border/80 bg-muted/30">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Propriedades</span>
        {simples && <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => setCru((v) => !v)}>{cru ? 'Campos' : 'YAML'}</button>}
      </div>
      {cru ? (
        <textarea value={fm} onChange={(e) => onChange(e.target.value)} spellCheck={false} rows={Math.max(2, linhas.length)}
          className="block w-full resize-y bg-transparent px-3 pb-2.5 font-mono text-[12px] leading-relaxed outline-none" />
      ) : (
        <dl className="grid grid-cols-[minmax(80px,auto)_1fr] gap-x-3 px-3 pb-2">
          {linhas.map((l, i) => {
            const [, k, v] = l.match(LINHA)!;
            return (
              <div key={i} className="contents">
                <dt className="py-1 text-[12.5px] text-muted-foreground">{k}</dt>
                <dd className="min-w-0">
                  <input value={v} spellCheck={false} aria-label={k}
                    onChange={(e) => onChange(linhas.map((x, j) => (j === i ? `${k}: ${e.target.value}` : x)).join('\n'))}
                    className="w-full rounded-md bg-transparent px-1.5 py-1 -mx-1.5 text-[12.5px] outline-none hover:bg-muted focus:bg-card focus:ring-1 focus:ring-border" />
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

// ── editor ────────────────────────────────────────────────────────────────────
export default function MarkdownEditor({ value, onChange, placeholder, minHeight = 240, bare, source, className }: MarkdownEditorProps) {
  const last = useRef(value);
  const fm = useRef(split(value).fm);
  const [fmView, setFmView] = useState(fm.current);
  const [raw, setRaw] = useState(false);
  // arquivo que o editor visual não devolveria igual (ex.: negrito com * dentro, lista que começa no 0): abre em markdown
  const [perda, setPerda] = useState(false);
  const cb = useRef(onChange); cb.current = onChange;
  const emit = (md: string) => { last.current = md; cb.current(md); };
  const checar = (e: Editor, body: string) => {
    if (!source) return;
    const ok = fiel(body, markdownDe(e));
    setPerda(!ok); setRaw(!ok);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: null } } }),
      TaskList, TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escreva aqui…' }),
      Markdown.configure({ indentation: { style: 'space', size: 2 } }),
    ],
    content: split(value).body,
    contentType: 'markdown',
    // arquivos técnicos (source) cheios de caminhos e comandos: sem o sublinhado vermelho do corretor
    editorProps: { attributes: { class: 'hub-md text-sm', spellcheck: source ? 'false' : 'true' } },
    // só edição de verdade dispara (carregar ou trocar de documento não marca "alterado")
    onUpdate: ({ editor: e }) => emit(join(fm.current, markdownDe(e))),
  });
  // confere a fidelidade depois de montar (no onCreate o componente ainda não montou)
  useEffect(() => { if (editor) checar(editor, split(last.current).body); }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // troca de documento por fora (ex.: outro arquivo selecionado) → recarrega sem emitir
  useEffect(() => {
    if (!editor || value === last.current) return;
    last.current = value;
    const p = split(value);
    fm.current = p.fm; setFmView(p.fm);
    editor.commands.setContent(p.body, { contentType: 'markdown', emitUpdate: false });
    checar(editor, p.body);
  }, [value, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRaw = () => {
    if (raw && editor) editor.commands.setContent(split(last.current).body, { contentType: 'markdown', emitUpdate: false });
    setRaw((r) => !r);
  };

  if (!editor) return null;
  const corpo = (
    <>
      {raw ? (
        <>
        {perda && (
          <div className="mb-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
            Aberto em markdown: este arquivo tem trechos (ex.: negrito com <code>*</code> dentro, lista que começa no 0) que o editor visual reescreveria.
            {' '}<button type="button" className="text-primary-ink hover:underline" onClick={toggleRaw}>Usar o editor visual mesmo assim</button>
          </div>
        )}
        <textarea value={last.current} spellCheck={false}
          onChange={(e) => { const p = split(e.target.value); fm.current = p.fm; setFmView(p.fm); emit(e.target.value); }}
          className="block w-full resize-none bg-transparent font-mono text-[12.5px] leading-relaxed outline-none"
          style={{ minHeight, fieldSizing: 'content' } as CSSProperties} />
        </>
      ) : (
        <>
          {fmView != null && <Propriedades fm={fmView} onChange={(f) => { fm.current = f; setFmView(f); emit(join(f, markdownDe(editor))); }} />}
          <EditorContent editor={editor} />
        </>
      )}
    </>
  );

  if (bare) {
    return (
      <div className={cn('flex flex-col gap-3', className)} style={{ '--md-min-h': `${minHeight}px` } as CSSProperties}>
        <Toolbar editor={editor} raw={raw} onRaw={toggleRaw} source={source} sticky />
        <div className="px-1">{corpo}</div>
      </div>
    );
  }
  return (
    <div className={cn('rounded-xl border border-border bg-card p-1.5 focus-within:border-primary/40 transition-colors', className)}
      style={{ '--md-min-h': `${minHeight}px` } as CSSProperties}>
      <Toolbar editor={editor} raw={raw} onRaw={toggleRaw} source={source} />
      <div className="px-3 pt-3 pb-2" onClick={(e) => { if (e.target === e.currentTarget) editor.commands.focus('end'); }}>{corpo}</div>
    </div>
  );
}
