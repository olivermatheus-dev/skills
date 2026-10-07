# Onde paramos (ler primeiro numa sessão nova)

> Atualizado em 2026-10-07. Branch de trabalho: `claude/happy-wozniak-x1qxse`. Visão geral do repo: `CLAUDE.md`.

## O que já existe
- **Hub enxuto:**
  - 21 skills: núcleo (setup, content-ideas, ig-post, carousel, ads-meta, landing-page, launch-plan, video, audio, locucao, orquestrar) + 9 formatos `fmt-*`;
  - 6 agentes;
  - Kanban em arquivos;
  - heartbeat e tarefas recorrentes.
- **Base de vídeo verificada:** `knowledge/video/`, 20 arquivos, Etapas 1–11 do material do Oliver destiladas. O índice está em `knowledge/video/README.md` e o registro em `roadmap/tasks/002-conhecimento-motion/INDICE.md`.
- **Ferramentas (`tools/`):**
  - `board.mjs` (quadro);
  - `heartbeat.mjs` (agentes sozinhos);
  - `contrast.mjs`;
  - `audio/catalog.mjs` (biblioteca de sons);
  - `audio/elevenlabs-sfx.mjs` (não testado);
  - `video/timeline.mjs` (trocar voz, duração, texto e trilha; núcleo do futuro MCP);
  - render do carrossel (`.claude/skills/carousel/scripts/render.mjs`).
- **Bibliotecas globais:** `library/audio/` e `library/visual/`. Os arquivos ficam locais; os catálogos e o registro de licenças ficam no git.
- **kz:** contexto (6 arquivos), `brand/` (brand.css + BRAND.md, com seção Som em rascunho) e o quadro `companies/kz/board/` (13 tarefas).

## Em andamento
- **T-0009 (origin story da kz)** em `review`, aguardando o Oliver informar: **nome público do fundador, se há foto real e (opcional) uma cena real**. Ao responder:
  1. T-0011 vai para `done`;
  2. libera a T-0012 (designer, PNG) e a T-0013 (revisor).

  O texto está em `companies/kz/contents/2026-10-07-origin-story/`.
- **Tarefa 002 (contínua):** o Oliver segue mandando etapas do material de edição e motion. Processo: verificar → destilar em `knowledge/video/<tema>.md` → ligar à skill `video` e aos agentes → registrar no INDICE.

## Pendências do Oliver (bloqueiam produção)
1. **Contexto da kz desatualizado** (dizia lançamento em mai/2026): preço final, trial/garantia, link de cadastro, @ do Instagram. Tarefas T-0001 a T-0003.
2. **Regras CFP/CRP de publicidade:** T-0004. Até lá, anúncio e LP saem marcados "não publicar".
3. **Arquivos de marca:** logo SVG, ícones e **prints do produto** em `_inbox/`.
4. **Validar** a identidade sonora da kz (`brand/BRAND.md` > Som) e definir o elenco fictício.
5. **Duas decisões:**
   - o mínimo de 6 anúncios por teste no ads-meta serve?
   - o teto de 550–600 palavras por `fmt-*` fica?

## Próximo passo técnico (na máquina local do Oliver)
- **Tarefa 003:**
  1. trazer o `_kit` do Ludus (HyperFrames + GSAP, `motion.js`, scripts tts/words/music/sfx/mix/produce/check) para `tools/video-kit/`, de forma genérica;
  2. confirmar Windows, ffmpeg e Python;
  3. renderizar o 1º vídeo de teste (sugestão: `fmt-dialogo` da kz).
- **Depois:**
  - tarefa 008 (biblioteca de áudio inicial);
  - tarefa 009 (MCP de edição);
  - tarefa 007 (`project.yml`, personas, comentários, concorrentes).
- **Meta do MVP:** 12 posts da kz (tarefa 006).

## Como retomar
- **Construção do hub:** leia `roadmap/BACKLOG.md` → `TASK.md` da tarefa da vez.
- **Produção para a kz:** use o orquestrador (skill `orquestrar`); veja o quadro com `node tools/board.mjs kz --me`.
- **Material novo de vídeo:** siga a tarefa 002.
