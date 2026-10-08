# Interface do hub (local)

## No PC (Windows), uma vez
1. `npm install` na raiz do repo.
2. Coletas: `pip install -U yt-dlp` (YouTube/TikTok). Instagram com views: `APIFY_TOKEN=` no `.env` (opcional: `YOUTUBE_API_KEY`, `YTDLP_COOKIES_FROM_BROWSER=chrome` se o TikTok bloquear).
3. `npm run app` → http://localhost:5173. Coleta pelo terminal: `npm run collect -- kz <id|--all>`.
4. Testes: `npm run typecheck` · `npm run validate` · `npm run test:intel`.

`npm install` uma vez → `npm run app` (abre http://localhost:5173). Os dados são os arquivos de `companies/` — não há banco.

## Camadas (de baixo para cima)
| camada | onde | regra |
|---|---|---|
| tipos | `schema/*.ts` (Zod) | **fonte única** do formato de cada arquivo. Mudou um campo? Mude aqui primeiro. |
| dados | `core/store.ts` | todo ler/gravar passa por aqui e é validado; erro vira `ValidationError` (arquivo + campos). |
| API | `app/server/api.ts` | plugin do Vite; rotas finas sobre o `store`. Sem lógica de negócio aqui. |
| cliente | `app/src/api.ts` | `fetch` tipado com os tipos do `schema`. |
| telas | `app/src/pages/*.tsx` (registro em `pages/index.ts`: rota, nome, ícone Lucide, sidebar recolhida) | componentes **shadcn** em `components/ui/` (`@/components/ui/…`, preferir estes); antigos em `components/kit.tsx` (migrar aos poucos); barra contextual padrão `components/ContextSidebar.tsx`; tokens em `src/index.css`; cor do projeto em `lib/theme.ts`; editor markdown em `components/Markdown.tsx`. |

## Arquivos por projeto
```
companies/<slug>/
  project.yml · tags.yml
  board/T-NNNN-*.md        tarefas (formato simples, compatível com tools/lib/board.mjs e o heartbeat): descrição + checklist · ## Comentários (Oliver ↔ IA, schema/task.ts) · ## Log. Quadro: criar na coluna, Rodar IA (core/runner.ts → heartbeat ou terminal; estado em logs/heartbeat/.lock)
  personas/<id>.md         persona tipada + corpo livre
  notes/<id>.md            anotações (markdown)
  ideas/I-NNNN-*.md        banco de ideias (tarefa 012)
  competitors/<id>/competitor.md · marks.json · snapshots/<plataforma>-<perfil>/<data>.json · media/ (fora do git)
                    analysis/<modulo>.json (último resultado de cada módulo) · pedido.json (fila da IA) · notas.json (anotações do Oliver)
                    site/*.md + extract.json + reclameaqui.json (texto extraído pelo script; fora do git, refazível)
  contents/<peça>/peca.json     ficha da peça (schema/piece.ts): nome de exibição, versão principal, tags, favorito/arquivada, publicação e textos (legenda, copy, CTA, hashtags, notas). Tela Conteúdos = central em grade/lista + aba Ficha; botões abrem a pasta no Explorer e o vídeo no player do sistema
  contents/<peça>/mockup.json   versão 2 = mockup em camadas (tela Mockups, tarefa 030: editor estilo Canva; runtime library/mockups/runtime/cena.html num iframe, export pelo tools/mockup/cena.mjs; lógica em core/mockups.ts). capturas/<data>-<tela>/ = prints colados/arrastados (captura.mjs mede e sugere cortes)
  contents/<peça>/revisao.json  status, aprovação do roteiro e anotações do Oliver no roteiro, no vídeo e nos slides (pino x/y) (schema/review.ts; ajustes diretos de volume/duração/texto + prévia: core/videoedit.ts; tela Conteúdos; a IA lê com `node tools/review.mjs <pasta>`). "Novo conteúdo" cola/envia roteiro pronto (.md/.txt/.docx) → contents/AAAA-MM-DD-<tema>/roteiro.md + tarefa opcional para a IA
  context/*.md · brand/
  .env                     chaves de API do projeto (tela Configurações; fora do git; a tela só mostra os 4 últimos caracteres)
```
**Análise de concorrentes** (aba Análise do concorrente; tabela em Concorrentes → Comparar): o Oliver marca módulos → script roda na hora (site, Reclame Aqui, redes) e o resto vira `pedido.json` → "roda a fila de concorrentes" (skill `analise-concorrentes`). Terminal: `npm run analise -- fila|site|ra|pedir|salvar|status kz`.

Coletas são **imutáveis**: cada "Puxar" grava um arquivo novo; o histórico nunca é apagado.

## Checar
- `npm run typecheck` · `npm run validate` (todos os arquivos contra os schemas).
- Testar sem mexer nos dados reais: `HUB_ROOT=/caminho/copia HUB_NO_OPEN=1 npx vite --config app/vite.config.ts --port 5181`.
