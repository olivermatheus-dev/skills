# 018 — App local (interface) + banco de dados tipado em arquivos

Status: fazendo · Depende de: 007 · Liga com: 012 (motor de ideias), APP.md
Pedido do Oliver em 2026-10-07: usar o saldo da nuvem para deixar pronto o máximo antes de ir para a máquina local; interface para concorrentes (colar links, detectar plataforma, puxar tudo, histórico sem apagar), personas, backlog/tarefas e anotações (editor rich text em markdown), com **tipagem forte** porque os arquivos são o banco de dados.

## Feito nesta tarefa
- **Tipos** (`schema/`, Zod): Project, Tags, Persona, Competitor/Profile, Snapshot (coleta imutável), Marks, Note, Idea, Task (compatível com `board.mjs`/heartbeat).
- **Dados** (`core/store.ts`): ler/gravar validado; `npm run validate` checa tudo; `core/platform.ts` detecta links.
- **App** (`app/`, `npm run app`): Vite + React + API local; telas: visão geral, quadro (Kanban), concorrentes (+ detalhe), ideias, personas, anotações, contexto e marca.
- **Coletores** (`tools/intel/`, `npm run collect`): YouTube/TikTok via yt-dlp, Instagram via Apify (token) ou yt-dlp, site via HTML; mídia local fora do git.
- **Agente `pesquisador`** + skills `radar` e `referencias`; `setup` grava `project.yml` e personas tipadas; `orquestrar` conhece o novo fluxo.

## Análise do MVP (2026-10-07)
**MVP = 12 posts da kz produzidos pelo fluxo + app local usável no dia a dia.**
| frente | estado | falta |
|---|---|---|
| skills de texto (ideias, posts, LP, anúncios, lançamento) | prontas e testadas | contexto da kz atualizado (Oliver) |
| carrossel e formatos de imagem | prontos (render testado) | arquivos de marca reais (logo, prints) |
| vídeo (skill com níveis, REGRAS, formatos) | pronto no papel | **kit de render (003, local)**; 1º vídeo de teste; galeria (014) junto com o kit |
| áudio | skill + catálogo prontos | baixar 3–5 trilhas e famílias de SFX com licença (008, local) |
| agentes + quadro + heartbeat | prontos | testar heartbeat com `claude` real (local) |
| motor de ideias (012) | radar, referências, coletores e painel prontos | testar coleta real no PC (yt-dlp, APIFY_TOKEN) |
| app | feito nesta tarefa | uso real e ajustes |
| variantes e galeria (013, 014) | desenhadas | dependem do kit |

**Ordem sugerida na máquina local:** 1) `npm install` + `npm run app` (conferir dados) → 2) tarefa 003 (kit de render) → 3) 1º vídeo nível simples → 4) coleta real de 3 concorrentes → 5) contexto da kz → 6) 12 posts.

## Log
- 2026-10-07: tipos, store, validação, casca do app e API (commit 2390652); telas e coletores em construção por 3 frentes paralelas.
