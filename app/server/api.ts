// Plugin do Vite que liga a API local (rotas em handler.ts) no servidor do app.
// Este arquivo NÃO importa nada do hub de propósito: tudo que o vite.config importa vira dependência da config,
// e o Vite reinicia o servidor inteiro a cada edição (o app caía com "Failed to fetch" enquanto os agentes
// editavam core/, schema/, tools/). Por isso o handler é carregado à parte:
// - dev (npm run app:dev): ssrLoadModule a cada requisição; o Vite guarda o módulo e só o recarrega quando um
//   arquivo da cadeia muda. Troca a API sem derrubar o servidor nem a página.
// - preview (npm run app): carregado uma vez na subida (é o modo rápido; reinicie para pegar mudanças da API).
import type { Plugin, Connect } from 'vite';
import { runnerImport } from 'vite';
import { fileURLToPath } from 'node:url';

type HandlerMod = { handler: Connect.NextHandleFunction };
const HANDLER = fileURLToPath(new URL('./handler.ts', import.meta.url));

export const hubApi = (): Plugin => ({
  name: 'hub-api',
  configureServer: (s) => {
    s.middlewares.use((req, res, next) => {
      (s.ssrLoadModule(HANDLER) as Promise<HandlerMod>)
        .then((m) => m.handler(req, res, next))
        .catch((e) => {
          // erro de sintaxe no meio de uma edição: responde 500 e segue; a próxima requisição tenta de novo
          console.error('[hub-api] não carregou a API:', (e as Error)?.message ?? e);
          if (res.headersSent) return res.end();
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: `API não carregou: ${(e as Error)?.message ?? e}` }));
        });
    });
  },
  configurePreviewServer: async (s) => {
    const { module } = await runnerImport<HandlerMod>(HANDLER, { configFile: false, logLevel: 'warn' });
    s.middlewares.use(module.handler);
  },
});
