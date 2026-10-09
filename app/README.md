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
| API | `app/server/handler.ts` (rotas) · `app/server/api.ts` (plugin) | rotas finas sobre o `store`, sem lógica de negócio. O plugin carrega o handler à parte (`ssrLoadModule`): editar `core/`, `schema/`, `tools/` troca a API sem reiniciar o app. Servidor em `127.0.0.1`. |
| cliente | `app/src/api.ts` | `fetch` tipado com os tipos do `schema`. |
| telas | `app/src/pages/*.tsx` (registro em `pages/index.ts`: rota, nome, ícone Lucide, sidebar recolhida) | componentes **shadcn** em `components/ui/` (`@/components/ui/…`, preferir estes); antigos em `components/kit.tsx` (migrar aos poucos); barra contextual padrão `components/ContextSidebar.tsx`; tokens em `src/index.css`; cor do projeto em `lib/theme.ts`; editor markdown em `components/Markdown.tsx` (Tiptap: barra mínima com ícones Lucide; `bare` = ocupa o painel; `source` = botão de markdown cru, e abre cru sozinho quando o arquivo não voltaria igual; frontmatter vira "Propriedades"). Agentes e skills: `pages/Agentes.tsx` (abas Em andamento · Equipe · Skills · Histórico), `AgenteDetalhe.tsx`, `SkillDetalhe.tsx`; explorador + editor de arquivos em `components/agentes/Arquivos.tsx` (API em `core/skills.ts`: só lê/grava `.claude/agents`, `agent-notes`, `skills` e `CLAUDE.md`). |

### Padrão de altura (aprovado pelo Oliver em 2026-10-08)
Lista, tabela ou grade longa **ocupa o resto da tela e rola por dentro**: título, filtros e números do topo ficam sempre à vista e a página não rola.
- Tabela da área de Concorrentes: `<SortTable fill …>` (cabeçalho das colunas fixo).
- Grade ou lista em qualquer página: `<FillBox>…</FillBox>` (`components/fill.tsx`); tabela própria: `useFillHeight()` na caixa com `overflow-auto`, como a matriz de funcionalidades.
- A altura se mede sozinha (onde a caixa começa + o que vem depois dela até o fim da página) e se ajusta quando algo carrega depois.
- Exceção: muita coisa acima da lista (ex.: ficha do concorrente → Redes e conteúdos) → a lista rola com a página e só a barra de filtros gruda no topo (`sticky`), senão a caixa fica pequena demais.

### Atividade (046): tudo que roda por trás de um clique aparece no dock
IA, coleta ou render novo **registra o trabalho** em `logs/atividade/` (`tools/lib/atividade.mjs`): no servidor, embrulhe a rota com `comAtividade({ slug, tipo, fonte, titulo, passo, link }, (passo) => …, resumir)` (`core/atividade.ts`); em script/heartbeat, `iniciar` → `passo` → `terminar`. O dock (`components/atividade/AtividadeDock.tsx`) mostra sozinho, em qualquer tela, e recarrega os dados quando termina. Cada `passo` entra no histórico do trabalho (página **Agentes** → Histórico). Sessões do Claude Code abertas no terminal (ou no app desktop) entram no mesmo registro pelos hooks de `.claude/settings.json` → `tools/hooks/atividade.mjs` (o `settings.json` fica fora do git; em outra máquina, copie os `hooks` de `tools/hooks/settings.hooks.json` para ele) (sessão do heartbeat é ignorada: `HUB_ATIVIDADE` no ambiente).

## Arquivos por projeto
```
companies/<slug>/
  project.yml · tags.yml
  board/T-NNNN-*.md        tarefas (formato simples, compatível com tools/lib/board.mjs e o heartbeat): descrição + checklist · ## Comentários (Oliver ↔ IA, schema/task.ts) · ## Log. Quadro: criar na coluna, Rodar IA (core/runner.ts → heartbeat ou terminal; estado em logs/heartbeat/.lock)
  personas/<id>.md         persona tipada + corpo livre
  notes/<id>.md            anotações (markdown)
  ideas/I-NNNN-*.md        banco de ideias (tarefa 012)
  curadoria/fontes.json    fontes onde a IA procura ideias (041; schema/curadoria.ts, tela Ideias → Fontes; sugestão ao colar link em core/curadoria.ts, sem IA)
  curadoria/rodadas/<id>/  pesquisa de ideias (041 F3): pedido.json (gravado pelo botão Pesquisar ideias com o mesmo código do `npm run curadoria -- pedir`) · consultas.json · resultado.json. Disparo = core/pesquisas.ts → core/runner.ts → `heartbeat.mjs --pesquisa <id>` (segundo plano, só sob clique) ou janela de terminal; andamento lido dos arquivos em data/curadoria/<slug>/<id>/; abas Ideias · Fontes · Pesquisas
  competitors/<id>/competitor.md · marks.json · snapshots/<plataforma>-<perfil>/<data>.json · media/ (fora do git)
                    analysis/<modulo>.json (último resultado de cada módulo) · pedido.json (fila da IA) · notas.json (anotações do Oliver)
                    site/*.md + extract.json + reclameaqui.json (texto extraído pelo script; fora do git, refazível)
  contents/<peça>/peca.json     ficha da peça (schema/piece.ts): nome de exibição, versão principal, tags, favorito/arquivada, publicação e textos (legenda, copy, CTA, hashtags, notas). Tela Conteúdos = central em grade/lista + aba Ficha; botões abrem a pasta no Explorer e o vídeo no player do sistema
  contents/<peça>/mockup.json   versão 2 = mockup em camadas (tela Mockups, tarefa 030: editor estilo Canva; runtime library/mockups/runtime/cena.html num iframe, export pelo tools/mockup/cena.mjs; lógica em core/mockups.ts). capturas/<data>-<tela>/ = prints colados/arrastados (captura.mjs mede e sugere cortes)
  contents/<peça>/projeto.json  projeto de vídeo com variantes (045): aba Variantes (Fluxo em React Flow + Matriz, QC, aval → variantes/aval.json, Gerar no fundo, .zip das marcadas em /variantes-zip/; core/variantes.ts). As pastas variantes/<id>/ não aparecem soltas na lista; Anotar abre a variante como peça
  contents/<peça>/revisao.json  status, aprovação do roteiro e anotações do Oliver no roteiro, no vídeo e nos slides (pino x/y) (schema/review.ts; ajustes diretos de volume/duração/texto + prévia: core/videoedit.ts; tela Conteúdos; a IA lê com `node tools/review.mjs <pasta>`). "Novo conteúdo" cola/envia roteiro pronto (.md/.txt/.docx) → contents/AAAA-MM-DD-<tema>/roteiro.md + tarefa opcional para a IA
  context/*.md · brand/
  .env                     chaves de API do projeto (tela Configurações; fora do git; a tela só mostra os 4 últimos caracteres)
```
**Análise de concorrentes** (aba Análise do concorrente; tabela em Concorrentes → Comparar): o Oliver marca módulos → script roda na hora (site, Reclame Aqui, redes) e o resto vira `pedido.json` → "roda a fila de concorrentes" (skill `analise-concorrentes`). Terminal: `npm run analise -- fila|site|ra|pedir|salvar|status kz`.

Coletas são **imutáveis**: cada "Puxar" grava um arquivo novo; o histórico nunca é apagado.

## Checar
- `npm run typecheck` · `npm run validate` (todos os arquivos contra os schemas).
- Testar sem mexer nos dados reais: `HUB_ROOT=/caminho/copia HUB_NO_OPEN=1 npx vite --config app/vite.config.ts --port 5181`.
