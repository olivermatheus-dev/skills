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
| telas | `app/src/pages/*.tsx` (registro em `pages/index.ts`) | componentes base em `components/ui.tsx`, editor markdown em `components/Markdown.tsx`. |

## Arquivos por projeto
```
companies/<slug>/
  project.yml · tags.yml
  board/T-NNNN-*.md        tarefas (formato simples, compatível com tools/lib/board.mjs e o heartbeat)
  personas/<id>.md         persona tipada + corpo livre
  notes/<id>.md            anotações (markdown)
  ideas/I-NNNN-*.md        banco de ideias (tarefa 012)
  competitors/<id>/competitor.md · marks.json · snapshots/<plataforma>-<perfil>/<data>.json · media/ (fora do git)
  context/*.md · brand/
```
Coletas são **imutáveis**: cada "Puxar" grava um arquivo novo; o histórico nunca é apagado.

## Checar
- `npm run typecheck` · `npm run validate` (todos os arquivos contra os schemas).
- Testar sem mexer nos dados reais: `HUB_ROOT=/caminho/copia HUB_NO_OPEN=1 npx vite --config app/vite.config.ts --port 5181`.
