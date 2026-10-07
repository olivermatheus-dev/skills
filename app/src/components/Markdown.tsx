// Editor rich text que lê e grava markdown (MDXEditor). Usado em anotações, corpo de tarefas, personas, contexto.
import '@mdxeditor/editor/style.css';
import {
  MDXEditor, type MDXEditorMethods, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, linkPlugin, linkDialogPlugin,
  tablePlugin, markdownShortcutPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, BlockTypeSelect, ListsToggle,
  CreateLink, InsertTable, InsertThematicBreak, codeBlockPlugin, codeMirrorPlugin, Separator,
} from '@mdxeditor/editor';
import { useEffect, useRef } from 'react';

export function MarkdownEditor({ value, onChange, placeholder, minHeight = 240 }: { value: string; onChange: (md: string) => void; placeholder?: string; minHeight?: number }) {
  const ref = useRef<MDXEditorMethods>(null);
  const last = useRef(value);
  // Troca de documento por fora (ex.: outra anotação selecionada) → atualiza o editor.
  useEffect(() => { if (value !== last.current) { ref.current?.setMarkdown(value); last.current = value; } }, [value]);
  return (
    <div className="border border-border rounded-lg bg-surface overflow-hidden [&_.mdxeditor-toolbar]:bg-surface-2">
      <MDXEditor
        ref={ref}
        markdown={value}
        placeholder={placeholder}
        onChange={(md) => { last.current = md; onChange(md); }}
        contentEditableClassName="prose max-w-none px-4 py-3 text-sm"
        plugins={[
          headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), linkPlugin(), linkDialogPlugin(), tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }), codeMirrorPlugin({ codeBlockLanguages: { txt: 'Texto', js: 'JS', ts: 'TS', json: 'JSON', bash: 'Bash' } }),
          markdownShortcutPlugin(),
          toolbarPlugin({ toolbarContents: () => (<><UndoRedo /><Separator /><BlockTypeSelect /><BoldItalicUnderlineToggles /><Separator /><ListsToggle /><CreateLink /><InsertTable /><InsertThematicBreak /></>) }),
        ]}
      />
      <style>{`.mdxeditor [contenteditable] { min-height: ${minHeight}px }`}</style>
    </div>
  );
}
