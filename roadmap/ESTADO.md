# Onde paramos (ler primeiro numa sessão nova)

> Atualizado em 2026-10-07 (sessão 022 fase A: roteiro pronto + anotações no roteiro). Branch: `main`. Leia **só isto** e depois o `TASK.md` (ou `board/T-NNNN.md`) da vez; não percorra o repo. Regras de sessão: `CLAUDE.md` > Sessões e contexto.

## Pronto para usar
- **Máquina:** Node 22 por projeto (`.nvmrc`; o fnm troca sozinho ao entrar na pasta), `npm install` feito, ffmpeg, Python (pyenv) + edge-tts, yt-dlp, Chromium do Playwright. `.env` criado (chaves vazias).
- **App local:** `npm run app` (quadro, concorrentes, ideias, personas, anotações, contexto e marca). Precisa do **Node 22** (no Node 20 o Vite não sobe).
- **Concorrentes (023, feita):** 10 da kz com análise completa (perfis, site/sitemap, contato, onde atua, resumo, features, fortes/fracos, preços, LP, Reclame Aqui). App: aba **Análise** + **Comparar**. Rodar de novo/pontual: marcar no app → "roda a fila de concorrentes" (skill `analise-concorrentes`).
- **Vídeo (003, feita):** `tools/video-kit/` — HyperFrames 0.8.94 + GSAP (do kit do Ludus). Comandos em `tools/video-kit/README.md`, armadilhas em `GUIA-TECNICO.md`, molde em `library/templates/video/base/`, exemplo em `companies/kz/contents/2026-10-07-teste-kit/` (teste, não publicar; v02 com a Thalita).
  - **Voz:** rascunho grátis = **Thalita** (`edge-thalita`; offline: `win-maria`) → aval → **Eleven v4 pela API** (`elevenlabs.mjs`, skill `elevenlabs`: emoção por audio tags em `vo[].el`, tempos exatos, encaixe automático). Catálogo `library/voices/`, escolha por empresa em `companies/<slug>/brand/voices.json`.
- **Revisão de vídeo por anotações (022 v1):** app → **Conteúdos** (player + faixas da `timeline.json`; anota cena/fala/evento/tempo/elemento — v1.1: modo "Clicar no elemento" renderiza a composição ao vivo e captura o `#id` clicando no quadro, tipo corrigir|ajustar|template|ok → `revisao.json`). IA: `node tools/review.mjs <pasta>` (abertas + contexto + quadros) e `… resolve <id> "o que mudou"`. Regras na skill `video`.
- **Roteiro pronto e anotações no roteiro (022 A):** app → **Conteúdos** → **Novo conteúdo** (colar ou enviar .md/.txt/.docx → `contents/AAAA-MM-DD-<tema>/roteiro.md` + tarefa opcional para a IA). Na peça, aba **Roteiro**: selecionar trecho → anotar; Editar; **Aprovar roteiro**. A IA lê com o mesmo `review.mjs` (trecho reencontrado mesmo se as linhas mudarem).
  - ⚠ **v1.1 (clicar no elemento) precisa ser reaplicada** em `app/src/components/pieces/VideoReview.tsx`: a fase A reescreveu a tela e o código da v1.1, feito em paralelo noutra sessão, não ficou no arquivo.
- **Locução única do site:** o Oliver gera 1 arquivo com todas as falas → `split-vo.mjs` (Whisper local) corta, mede e encaixa. Voz final da kz: **Carla** (v4).
- **Chaves de API por projeto:** app → **Configurações** (grava `companies/<slug>/.env`, fora do git; botão Testar). `.env` da raiz = reserva.
- **Áudio:** 560 SFX licenciados (EditorPro, comprado, uso comercial) em `library/audio/sfx/`; consultar `library/audio/INDEX.md`. Import de pacotes: `tools/audio/import.mjs`.
- **Assets:** mapa em `library/README.md`; arquivos brutos entram por `_inbox/{audio,visual,video}/`.
- **Conteúdo:** 21 skills + 9 formatos `fmt-*`, 7 agentes, Kanban em `companies/<slug>/board/` (`node tools/board.mjs kz --me`), heartbeat. Base de vídeo em `knowledge/video/REGRAS.md`.

## Pendências do Oliver (bloqueiam a produção da kz)
1. **Origin story (T-0009, em review):** nome público do fundador, se há foto real, (opcional) uma cena real. Texto em `companies/kz/contents/2026-10-07-origin-story/`.
2. **Contexto da kz (T-0001 a T-0003):** preço final, trial/garantia, link de cadastro, @ do Instagram.
3. **Regras CFP/CRP (T-0004):** até lá, anúncio e LP saem "não publicar".
4. **Arquivos de marca:** logo SVG **feito** (`brand/logo/`, redesenhado do PNG) e tokens do app medidos do print do painel. Faltam mais **prints do produto** (agenda, prontuário, financeiro) para demos e o 3D.
5. **Revisar o 1º vídeo real** (`companies/kz/contents/2026-10-07-apresentacao-kz/`, v01, 4:5 + 9:16): pontos em `plano.md` > "Para o Oliver conferir" (inclui confirmar se a kz manda lembrete automático).
6. **ElevenLabs (020):** salvar a chave da kz no app (Configurações → Testar) e mandar os nomes das vozes pré-selecionadas em pt-BR; pronúncia de "kz".
7. Decisões antigas: mínimo de 6 anúncios por teste no ads-meta? teto de 550–600 palavras por `fmt-*`?

## Próximas tarefas (escolha 1 por sessão)
| tarefa | o quê | depende de |
|---|---|---|
| **006** | Meta do MVP: 12 posts da kz | pendências 1–4 |
| **020** | Fechar: cadastrar vozes, 1º teste real do v4 no `teste-kit` | pendência 6 |
| **022 v1.1** | Reaplicar "clicar no elemento" em `VideoReview.tsx` (código na sessão "022 v1") | — |
| **022 (C/D)** | Volume/duração diretos no app · pinos no carrossel | — |
| **024** | Kit de marca visual no app: tokens, fontes, ícones, raio, presets de estilo, anotações, prévia ao vivo | — (pronta: `brand.json` → `brand.css`, preset minimalista Apple, Lucide) |
| **021** | Gestão de contexto pela IA (contexto declarado por tarefa, estado para retomar, log compacto) | — (pode começar já) |
| **008** | Trilhas e bases (SFX já feitos) | pendência 5 |
| **019** | Visual shadcn do app (pausada em ponto seguro; passos no `TASK.md`) | — |
| 011 · 013 · 014 · 009 · 012 | teste de custo · variantes · galeria · MCP de edição · motor de ideias | kit (feito) |

Registradas para depois: 007, 015, 016, 017 (`BACKLOG.md`).

## Como retomar
- **Construção do hub:** `roadmap/BACKLOG.md` → `tasks/<id>/TASK.md` da vez.
- **Produção para a kz:** skill `orquestrar`; quadro com `node tools/board.mjs kz --me`.
- **Vídeo novo:** skill `video` (lê o kit). **Material novo de vídeo/motion:** tarefa 002.
- **Fim de sessão:** atualizar este arquivo e o `TASK.md`, commit + push, sugerir `/clear`.
