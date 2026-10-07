// Editor markdown (MDXEditor) carregado sob demanda: telas que não editam markdown não pagam pelo editor.
// Enquanto o pedaço chega (normalmente já pré-carregado no ocioso), mostra o texto como prévia, sem tela vazia.
import { lazy, Suspense, type CSSProperties } from 'react';
import type { MarkdownEditorProps } from './MarkdownEditorImpl';

let loader: Promise<typeof import('./MarkdownEditorImpl')> | null = null;
export const preloadMarkdownEditor = () => (loader ??= import('./MarkdownEditorImpl'));
const Impl = lazy(preloadMarkdownEditor);

function Preview({ value, placeholder, minHeight = 240 }: MarkdownEditorProps) {
  return (
    <div className="border border-border rounded-lg bg-surface overflow-hidden" aria-busy="true">
      <div className="h-[41px] bg-surface-2 border-b border-border" />
      <div className="px-4 py-3 text-sm whitespace-pre-wrap text-text/80" style={{ minHeight } as CSSProperties}>{value || <span className="text-muted">{placeholder}</span>}</div>
    </div>
  );
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  return <Suspense fallback={<Preview {...props} />}><Impl {...props} /></Suspense>;
}
