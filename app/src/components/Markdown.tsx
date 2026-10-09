// Editor markdown (Tiptap) carregado sob demanda: telas que não editam markdown não pagam pelo editor.
// Enquanto o pedaço chega (normalmente já pré-carregado no ocioso), mostra o texto como prévia, sem tela vazia.
import { lazy, Suspense, type CSSProperties } from 'react';
import type { MarkdownEditorProps } from './MarkdownEditorImpl';
import { cn } from '@/lib/utils';

export type { MarkdownEditorProps };
let loader: Promise<typeof import('./MarkdownEditorImpl')> | null = null;
export const preloadMarkdownEditor = () => (loader ??= import('./MarkdownEditorImpl'));
const Impl = lazy(preloadMarkdownEditor);

function Preview({ value, placeholder, minHeight = 240, bare }: MarkdownEditorProps) {
  return (
    <div className={cn(!bare && 'rounded-xl border border-border bg-card p-1.5')} aria-busy="true">
      <div className="h-[38px] rounded-xl border border-border/80 bg-muted/40" />
      <div className="px-3 py-3 text-sm whitespace-pre-wrap text-foreground/80" style={{ minHeight } as CSSProperties}>{value || <span className="text-muted-foreground">{placeholder}</span>}</div>
    </div>
  );
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  return <Suspense fallback={<Preview {...props} />}><Impl {...props} /></Suspense>;
}
