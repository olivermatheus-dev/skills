import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from './components/toast';
import { Reconnecting } from './components/Reconnecting';
import './index.css';

// A API local responde em ~1 ms: o cache serve a tela na hora e revalida por trás.
// Sem keepPreviousData global: as listas dependem só do projeto, e mostrar os itens de outro projeto
// enquanto carrega seria errado (ex.: abrir uma anotação do projeto anterior).
const qc = new QueryClient({
  defaultOptions: {
    // erro de rede ("Failed to fetch": o servidor do app reiniciando) tenta de novo por ~30 s antes de mostrar erro
    queries: {
      staleTime: 30_000, gcTime: 30 * 60_000, refetchOnWindowFocus: true,
      retry: (n, e) => (e instanceof TypeError ? n < 6 : n < 1),
      retryDelay: (n) => Math.min(500 * 2 ** n, 8_000),
    },
    mutations: { retry: 0 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter><App /></BrowserRouter>
      <Toaster />
      <Reconnecting />
    </QueryClientProvider>
  </StrictMode>,
);
