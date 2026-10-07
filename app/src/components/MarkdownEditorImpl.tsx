// Editor rich text que lê e grava markdown (MDXEditor). Carregado sob demanda por Markdown.tsx (pedaço próprio do bundle).
import '@mdxeditor/editor/style.css';
import {
  MDXEditor, type MDXEditorMethods, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, linkPlugin, linkDialogPlugin,
  tablePlugin, markdownShortcutPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, BlockTypeSelect, ListsToggle,
  CreateLink, InsertTable, InsertThematicBreak, codeBlockPlugin, Separator, useCodeBlockEditorContext, type CodeBlockEditorDescriptor,
} from '@mdxeditor/editor';
import { useEffect, useRef, type CSSProperties } from 'react';

// Interface do editor em pt-BR (chaves do MDXEditor; o que faltar cai no texto original em inglês).
const PT: Record<string, string> = {
  'toolbar.blockTypeSelect.placeholder': 'Tipo de bloco',
  'toolbar.blockTypeSelect.selectBlockTypeTooltip': 'Tipo de bloco',
  'toolbar.blockTypes.heading': 'Título {{level}}',
  'toolbar.blockTypes.paragraph': 'Parágrafo',
  'toolbar.blockTypes.quote': 'Citação',
  'toolbar.bold': 'Negrito', 'toolbar.removeBold': 'Tirar negrito',
  'toolbar.italic': 'Itálico', 'toolbar.removeItalic': 'Tirar itálico',
  'toolbar.underline': 'Sublinhado', 'toolbar.removeUnderline': 'Tirar sublinhado',
  'toolbar.bulletedList': 'Lista', 'toolbar.numberedList': 'Lista numerada', 'toolbar.checkList': 'Checklist',
  'toolbar.link': 'Inserir link', 'toolbar.table': 'Inserir tabela', 'toolbar.thematicBreak': 'Inserir divisória',
  'toolbar.undo': 'Desfazer {{shortcut}}', 'toolbar.redo': 'Refazer {{shortcut}}',
  'createLink.url': 'URL', 'createLink.urlPlaceholder': 'Cole ou escolha um endereço', 'createLink.text': 'Texto do link',
  'createLink.title': 'Título do link', 'createLink.saveTooltip': 'Salvar link', 'createLink.cancelTooltip': 'Cancelar',
  'linkPreview.edit': 'Editar link', 'linkPreview.remove': 'Remover link', 'linkPreview.copyToClipboard': 'Copiar', 'linkPreview.copied': 'Copiado!',
  'dialogControls.save': 'Salvar', 'dialogControls.cancel': 'Cancelar', 'dialog.close': 'Fechar',
  'table.deleteTable': 'Apagar tabela', 'table.insertRowAbove': 'Inserir linha acima', 'table.insertRowBelow': 'Inserir linha abaixo',
  'table.insertColumnLeft': 'Inserir coluna à esquerda', 'table.insertColumnRight': 'Inserir coluna à direita',
  'table.deleteRow': 'Apagar linha', 'table.deleteColumn': 'Apagar coluna',
  'codeBlock.language': 'Linguagem do bloco', 'codeblock.delete': 'Apagar bloco de código',
};
const translate = (key: string, def: string, vars?: Record<string, unknown>) =>
  (PT[key] ?? def).replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars?.[k] ?? ''));

// Tipografia do conteúdo (o preflight do Tailwind zera h1/ul/…; sem plugin typography).
const CONTENT_CSS = `
.hub-md { line-height: 1.6; color: var(--color-text); min-height: var(--md-min-h, 240px); }
.hub-md > * + * { margin-top: .6em; }
.hub-md h1 { font-size: 1.5em; font-weight: 700; letter-spacing: -.01em; margin-top: 1.1em; }
.hub-md h2 { font-size: 1.25em; font-weight: 650; margin-top: 1em; }
.hub-md h3 { font-size: 1.08em; font-weight: 600; margin-top: .9em; }
.hub-md h4, .hub-md h5, .hub-md h6 { font-weight: 600; margin-top: .8em; }
.hub-md > :first-child { margin-top: 0; }
.hub-md ul { list-style: disc; padding-left: 1.4em; }
.hub-md ol { list-style: decimal; padding-left: 1.4em; }
.hub-md li { margin: .15em 0; }
.hub-md li > ul, .hub-md li > ol { margin-top: .15em; }
.hub-md blockquote { border-left: 3px solid var(--color-border); padding-left: .9em; color: var(--color-muted); }
.hub-md a { color: var(--color-accent); text-decoration: underline; text-underline-offset: 2px; }
.hub-md code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .88em; background: var(--color-surface-2); padding: .1em .35em; border-radius: 4px; }
.hub-md hr { border: 0; border-top: 1px solid var(--color-border); margin: 1.2em 0; }
.hub-md table { border-collapse: collapse; }
.hub-md th, .hub-md td { border: 1px solid var(--color-border); padding: .3em .6em; }
.hub-md strong { font-weight: 650; }
`;
if (typeof document !== 'undefined' && !document.getElementById('hub-md-css')) {
  const s = document.createElement('style'); s.id = 'hub-md-css'; s.textContent = CONTENT_CSS; document.head.appendChild(s);
}

// Bloco de código simples (textarea): sem CodeMirror e suas dezenas de linguagens no bundle.
const PlainCodeBlock: CodeBlockEditorDescriptor = {
  match: () => true,
  priority: 0,
  Editor: ({ code }) => {
    const cb = useCodeBlockEditorContext();
    return (
      <div className="my-2" onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
        <textarea defaultValue={code} onChange={(e) => cb.setCode(e.target.value)} spellCheck={false}
          rows={Math.max(2, code.split('\n').length)}
          className="w-full font-mono text-[12.5px] leading-relaxed bg-surface-2 border border-border rounded-md px-3 py-2 outline-none focus:border-accent resize-y" />
      </div>
    );
  },
};

export type MarkdownEditorProps = { value: string; onChange: (md: string) => void; placeholder?: string; minHeight?: number };

export default function MarkdownEditor({ value, onChange, placeholder, minHeight = 240 }: MarkdownEditorProps) {
  const ref = useRef<MDXEditorMethods>(null);
  const last = useRef(value);
  // O MDXEditor reemite o markdown normalizado ao carregar (ex.: "*" → "-"). Isso não é edição do usuário:
  // só repassamos onChange depois de alguma interação, para não marcar "alterado" nem gravar à toa.
  const touched = useRef(false);
  const touch = () => { touched.current = true; };
  // Troca de documento por fora (ex.: outra anotação selecionada) → atualiza o editor.
  useEffect(() => { if (value !== last.current) { ref.current?.setMarkdown(value); last.current = value; } }, [value]);
  return (
    <div className="border border-border rounded-lg bg-surface overflow-hidden [&_.mdxeditor-toolbar]:bg-surface-2"
      style={{ '--md-min-h': `${minHeight}px` } as CSSProperties}
      onKeyDownCapture={touch} onPasteCapture={touch} onCutCapture={touch} onDropCapture={touch} onPointerDownCapture={touch}>
      <MDXEditor
        ref={ref}
        markdown={value}
        placeholder={placeholder}
        translation={translate}
        toMarkdownOptions={{ bullet: '-', rule: '-' }}
        onChange={(md) => { last.current = md; if (touched.current) onChange(md); }}
        contentEditableClassName="hub-md max-w-none px-4 py-3 text-sm"
        plugins={[
          headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), linkPlugin(), linkDialogPlugin(), tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'txt', codeBlockEditorDescriptors: [PlainCodeBlock] }),
          markdownShortcutPlugin(),
          toolbarPlugin({ toolbarContents: () => (<><UndoRedo /><Separator /><BlockTypeSelect /><BoldItalicUnderlineToggles /><Separator /><ListsToggle /><CreateLink /><InsertTable /><InsertThematicBreak /></>) }),
        ]}
      />
    </div>
  );
}
