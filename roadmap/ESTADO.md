# Onde paramos (ler primeiro numa sessão nova)

> Atualizado em 2026-10-07. Branch: `main`. Leia **só isto** e depois o `TASK.md` (ou `board/T-NNNN.md`) da vez; não percorra o repo. Regras de sessão: `CLAUDE.md` > Sessões e contexto.

## Pronto para usar
- **Máquina:** Node 22 por projeto (`.nvmrc`; o fnm troca sozinho ao entrar na pasta), `npm install` feito, ffmpeg, Python (pyenv) + edge-tts, yt-dlp, Chromium do Playwright. `.env` criado (chaves vazias).
- **App local:** `npm run app` (quadro, concorrentes, ideias, personas, anotações, contexto e marca).
- **Vídeo (003, feita):** `tools/video-kit/` — HyperFrames 0.8.94 + GSAP (do kit do Ludus). Comandos em `tools/video-kit/README.md`, armadilhas em `GUIA-TECNICO.md`, molde em `library/templates/video/base/`, exemplo em `companies/kz/contents/2026-10-07-teste-kit/` (teste, não publicar; v02 com a Thalita).
  - **Voz:** rascunho grátis = **Thalita** (`edge-thalita`, padrão do hub e da kz; offline: `win-maria`) → aval de copy e estrutura → ElevenLabs → `fit-vo.mjs` corta, trata e reencaixa. Catálogo `library/voices/`, escolha por empresa em `companies/<slug>/brand/voices.json`.
- **Áudio:** 560 SFX licenciados (EditorPro, comprado, uso comercial) em `library/audio/sfx/`; consultar `library/audio/INDEX.md`. Import de pacotes: `tools/audio/import.mjs`.
- **Assets:** mapa em `library/README.md`; arquivos brutos entram por `_inbox/{audio,visual,video}/`.
- **Conteúdo:** 21 skills + 9 formatos `fmt-*`, 7 agentes, Kanban em `companies/<slug>/board/` (`node tools/board.mjs kz --me`), heartbeat. Base de vídeo em `knowledge/video/REGRAS.md`.

## Pendências do Oliver (bloqueiam a produção da kz)
1. **Origin story (T-0009, em review):** nome público do fundador, se há foto real, (opcional) uma cena real. Texto em `companies/kz/contents/2026-10-07-origin-story/`.
2. **Contexto da kz (T-0001 a T-0003):** preço final, trial/garantia, link de cadastro, @ do Instagram.
3. **Regras CFP/CRP (T-0004):** até lá, anúncio e LP saem "não publicar".
4. **Arquivos de marca:** logo SVG, ícones e **prints do produto** em `_inbox/visual/` (destravam o teste 3D e os vídeos de demo).
5. **Ouvir o teste de vídeo** (v02) com fone: voz, trilha sintetizada e efeitos; validar a identidade sonora (`BRAND.md` > Som) e o elenco fictício.
6. **ElevenLabs (020):** qual plano, gerar pela API ou no site, perfil de voz da kz e pronúncia de "kz".
7. Decisões antigas: mínimo de 6 anúncios por teste no ads-meta? teto de 550–600 palavras por `fmt-*`?

## Próximas tarefas (escolha 1 por sessão)
| tarefa | o quê | depende de |
|---|---|---|
| **006** | Meta do MVP: 12 posts da kz | pendências 1–4 |
| **020** | Skill ElevenLabs + vozes finais | pendência 6 |
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
