// Rede de segurança do Layout: se uma tela falhar ao desenhar (dado inesperado, gráfico), o resto do app continua de pé
// (barra lateral e navegação) e a área da tela mostra um aviso com "Recarregar" em vez de ficar em branco.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';
import { AppContent } from './AppContent';

interface State { error: Error | null }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[tela quebrou]', error, info.componentStack); }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <AppContent>
        <div role="alert" className="mx-auto max-w-md mt-24 text-center">
          <span className="mx-auto grid place-items-center size-12 rounded-full bg-warning/15 text-warning-ink"><TriangleAlert className="size-6" /></span>
          <h1 className="mt-4 text-lg font-semibold">Algo quebrou nesta tela</h1>
          <p className="mt-1 text-sm text-muted-foreground">Seus dados estão salvos. Recarregue a página; se voltar a quebrar, chame a IA com o texto abaixo.</p>
          <button type="button" onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <RefreshCw className="size-4" />Recarregar
          </button>
          <details className="mt-5 text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground">Detalhes do erro</summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed whitespace-pre-wrap">{error.message}</pre>
          </details>
        </div>
      </AppContent>
    );
  }
}
