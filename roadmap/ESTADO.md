# Onde paramos (ler primeiro numa sessão nova)

> Atualizado em 2026-10-07 (022 fase A + v1.1 reaplicada + 024 kit de marca + 028 fase A + 027 fase A). Branch: `main`. Leia **só isto** e depois o `TASK.md` (ou `board/T-NNNN.md`) da vez; não percorra o repo. Regras de sessão: `CLAUDE.md` > Sessões e contexto.

## Pronto para usar
- **Máquina:** Node 22 por projeto (`.nvmrc`; o fnm troca sozinho ao entrar na pasta), `npm install` feito, ffmpeg, Python (pyenv) + edge-tts, yt-dlp, Chromium do Playwright. `.env` criado (chaves vazias).
- **App local:** `npm run app` (quadro, concorrentes, ideias, personas, anotações, contexto e marca). Precisa do **Node 22** (no Node 20 o Vite não sobe).
- **Concorrentes (023, feita):** 10 da kz com análise completa (perfis, site/sitemap, contato, onde atua, resumo, features, fortes/fracos, preços, LP, Reclame Aqui). App: aba **Análise** + **Comparar**. Rodar de novo/pontual: marcar no app → "roda a fila de concorrentes" (skill `analise-concorrentes`).
- **Vídeo (003, feita):** `tools/video-kit/` — HyperFrames 0.8.94 + GSAP (do kit do Ludus). Comandos em `tools/video-kit/README.md`, armadilhas em `GUIA-TECNICO.md`, molde em `library/templates/video/base/`, exemplo em `companies/kz/contents/2026-10-07-teste-kit/` (teste, não publicar; v02 com a Thalita).
  - **Voz:** rascunho grátis = **Thalita** (`edge-thalita`; offline: `win-maria`) → aval → **Eleven v4 pela API** (`elevenlabs.mjs`, skill `elevenlabs`: emoção por audio tags em `vo[].el`, tempos exatos, encaixe automático). Catálogo `library/voices/`, escolha por empresa em `companies/<slug>/brand/voices.json`.
- **Revisão de vídeo por anotações (022 v1):** app → **Conteúdos** (player + faixas da `timeline.json`; anota cena/fala/evento/tempo/elemento — v1.1: modo "Clicar no elemento" renderiza a composição ao vivo e captura o `#id` clicando no quadro, tipo corrigir|ajustar|template|ok → `revisao.json`). IA: `node tools/review.mjs <pasta>` (abertas + contexto + quadros) e `… resolve <id> "o que mudou"`. Regras na skill `video`.
- **Central de peças (2026-10-07):** app → **Conteúdos** = todas as peças (vídeo, carrossel, post, roteiro) em grade com miniatura (vídeo toca ao passar o mouse) ou lista; busca, filtros por tipo/status/tag, favoritos, arquivadas. Cada peça: aba **Ficha** (prévia, arquivos com versão principal, abrir no player/Explorer, renomear, legenda/copy/CTA/hashtags/notas, tags, publicação → `peca.json`, `schema/piece.ts`) + Roteiro + Edição do vídeo. Convenção para agentes/geradores no `protocolo.md` (exports/, png/, `peca.json`). Falta: renomear o arquivo exportado (hoje renomeia só o nome de exibição) e miniatura dos carrosséis gerados pelo novo motor (já funciona se exportar em `png/`).
- **Galeria de formatos (027 A):** app → **Formatos** (global): 9 `fmt-*` com ficha (`library/formatos/<id>/formato.json`) + 1 rascunho (*Apresentação com locução*, o que já fizemos 3×). Filtros por tipo de conteúdo/mídia/canal/proporção; verbete com exemplos, estrutura, referências, **observações do Oliver (mandam sobre a skill)**, nota; "Usar num conteúdo novo" (aceita só o pedido, sem roteiro), "Marcar numa peça", "Promover como exemplo", "Nova referência" (link + print colado). Peça → `formato` no `peca.json`; `review.mjs` mostra o formato. Falta: 1 exemplo nosso para 8 formatos (fase B).
- **Roteiro pronto e anotações no roteiro (022 A):** app → **Conteúdos** → **Novo conteúdo** (colar ou enviar .md/.txt/.docx → `contents/AAAA-MM-DD-<tema>/roteiro.md` + tarefa opcional para a IA). Na peça, aba **Roteiro**: selecionar trecho → anotar; Editar; **Aprovar roteiro**. A IA lê com o mesmo `review.mjs` (trecho reencontrado mesmo se as linhas mudarem).
- **Kit de marca (024):** `brand/brand.json` é a fonte dos tokens → gera o `brand.css` (`npm run brand -- <slug>`; o validate acusa CSS editado à mão). App → Contexto e marca → **Kit de marca**: prévia ao vivo, preset **Minimalista (estilo Apple)**, cores com contraste, fontes, raio/sombras, ícones **Lucide** (`node tools/icon.mjs <nome> --brand <slug>`), fazer / não fazer → bloco no `BRAND.md`. A kz ainda **sem** preset aplicado: decidir no app.
- **Estúdio de mockups (028 A + galeria premium):** print → `node tools/mockup/captura.mjs <png> --empresa kz` (mede e **sugere cortes**: barra do navegador/sistema, rolagem, elemento cortado → `analise.png`) → `node tools/mockup/render.mjs --captura <pasta> --alternativas 8 --formato 4:5` → peça tipo **Mockup** na central, em **3×** (3240×4050). **21 aparelhos reais** (iPhone 17/18, Air, Duo, iPad Pro, MacBook Pro/Air, iMac, Studio Display, Pixel) com todas as cores, 11 templates (herói, duo, trio, perspectiva, pilha, leque, vidro, zoom, cards, anotações, recorte), 22 fundos, 6 sombras, 6 cantos. **Galeria:** `node tools/mockup/galeria.mjs` → `library/mockups/galeria/index.html`. Molduras (78 MB) e telas de exemplo no git: `git pull` basta em outra máquina. kz: **todos os fundos premium liberados**. Skill `mockup`; contrato em `library/mockups/README.md`.
- **Locução única do site:** o Oliver gera 1 arquivo com todas as falas → `split-vo.mjs` (Whisper local) corta, mede e encaixa. Voz final da kz: **Carla** (v4).
- **Chaves de API por projeto:** app → **Configurações** (grava `companies/<slug>/.env`, fora do git; botão Testar). `.env` da raiz = reserva.
- **Áudio:** 560 SFX licenciados (EditorPro, comprado, uso comercial) em `library/audio/sfx/`; consultar `library/audio/INDEX.md`. Import de pacotes: `tools/audio/import.mjs`.
- **Assets:** mapa em `library/README.md`; arquivos brutos entram por `_inbox/{audio,visual,video}/`.
- **Conteúdo:** 21 skills + 9 formatos `fmt-*`, 7 agentes, Kanban em `companies/<slug>/board/` (`node tools/board.mjs kz --me`), heartbeat. Base de vídeo em `knowledge/video/REGRAS.md`.

## Pendências do Oliver (bloqueiam a produção da kz)
0. **Revisar a base antes de qualquer post (T-0014, decisão de 2026-10-07):** confirmar o inventário `companies/kz/context/PRODUTO.md` (17 linhas; dúvidas: Sessão rápida, Financeiro, lembrete automático, segurança) e escolher as 6 da vitrine → prints → persona → carta de vendas. Depois: os 3 posts fixados (T-0015).
1. **Origin story (T-0009, em review):** nome público do fundador, se há foto real, (opcional) uma cena real. Texto em `companies/kz/contents/2026-10-07-origin-story/`.
2. **Contexto da kz (T-0001 a T-0003):** preço final, trial/garantia, link de cadastro, @ do Instagram.
3. **Regras CFP/CRP (T-0004):** até lá, anúncio e LP saem "não publicar".
4. **Arquivos de marca:** logo SVG **feito** (`brand/logo/`, redesenhado do PNG) e tokens do app medidos do print do painel. Faltam mais **prints do produto** (agenda, prontuário, financeiro) para demos e o 3D.
5. **Revisar o 1º vídeo real** (`companies/kz/contents/2026-10-07-apresentacao-kz/`, v01, 4:5 + 9:16): pontos em `plano.md` > "Para o Oliver conferir" (inclui confirmar se a kz manda lembrete automático).
6. **ElevenLabs (020):** salvar a chave da kz no app (Configurações → Testar) e mandar os nomes das vozes pré-selecionadas em pt-BR; pronúncia de "kz".
7. Decisões antigas: mínimo de 6 anúncios por teste no ads-meta? teto de 550–600 palavras por `fmt-*`?
8. **Mockups (028):** abrir a galeria (`library/mockups/galeria/index.html`) e `contents/2026-10-07-mockup-painel-premium` (8 alternativas novas): fundos premium **liberados** (2026-10-07); falta escolher as favoritas. Antigo: `contents/2026-10-07-mockup-painel` (app → Conteúdos → Mockup): 2 das 6 servem sem retocar? Liberar fundos além do liso? Respostas às 5 perguntas do `TASK.md` (defaults aplicados). Prints do produto em 2–3× ajudam muito.

## Próxima sessão (combinado com o Oliver em 2026-10-07)
**030 — Editor de mockups no app** (`roadmap/tasks/030-editor-de-mockups/TASK.md`): o Oliver achou a galeria da 028 feia (gradientes duros, sombra com marca no a3, textos fora da área segura) e quer um mini Canva: camadas, texto, fundo com gradiente/pattern, vários formatos de uma vez, colar/arrastar, exportar. Reaproveita molduras calibradas, encaixe, analisador de cortes e render 3×. Começar por referências visuais (olhar as imagens) + decisão da stack do canvas.

## Próximas tarefas (escolha 1 por sessão)
| tarefa | o quê | depende de |
|---|---|---|
| **006** | Meta do MVP: 12 posts da kz | pendências 1–4 |
| **029** | Motor de curadoria + fichas das 5 séries + inventário do produto (análise feita; 4 perguntas no `TASK.md`) | aval do Oliver |
| **020** | Fechar: cadastrar vozes, 1º teste real do v4 no `teste-kit` | pendência 6 |
| **022 (C/D)** | Volume/duração diretos no app · pinos no carrossel | — |
| **021** | Gestão de contexto pela IA (contexto declarado por tarefa, estado para retomar, log compacto) | — (pode começar já) |
| **008** | Trilhas e bases (SFX já feitos) | pendência 5 |
| **028 (B–E)** | Mockups: B captura por link (login persistente), C aba Mockups no app (galeria = catálogo), D animações/3D de verdade (Blender MCP / Three.js com as molduras calibradas), E template a partir de referência | aval (pendência 8) |
| **019** | Visual shadcn do app (pausada em ponto seguro; passos no `TASK.md`) | — |
| 013 · 014 · 009 · 012 | variantes · galeria · MCP de edição · motor de ideias | kit (feito) |

Registradas para depois: 007, 015, 016, 017 (`BACKLOG.md`).

## Caminho até a produção em série (combinado em 2026-10-07)
1. ~~Fechar o A/B (011)~~ **medido** (`roadmap/tasks/011-teste-custo-ab/RESULTADO.md`): Opus solo US$ 8,91 × Sonnet + subagentes US$ 11,03 → padrão provisório = vídeo numa sessão Opus sem subagentes. Custo de qualquer sessão: `node tools/usage.mjs <sessão> [--until ISO]`. Falta só a nota cega do Oliver e os ajustes pontuais dele nos 2 vídeos (fichas na central, tag `ab-teste`).
2. **025 Ficha de produção:** briefing + funil de status + custo por peça (`tools/usage.mjs` lendo os transcripts).
3. **027 Galeria de formatos:** ~~galeria + fichas~~ **fase A feita**. Fase B: escolher com o Oliver os formatos dos 12 posts (pergunta em aberto da 005) e produzir 1 exemplo de cada formato sem exemplo (de preferência já sendo posts da 006).
4. **008 Trilhas** (só há SFX; "nunca fundo mudo") e **014 Galeria de componentes** (promover o que ficou bom = qualidade constante).
5. Pendências do Oliver acima (1–4 e 6) → então **006: os 12 posts**.
- Em paralelo, sem bloquear: **026** (skills e agentes no app), 022 C/D, 019, 021, 013.

## Como retomar
- **Construção do hub:** `roadmap/BACKLOG.md` → `tasks/<id>/TASK.md` da vez.
- **Produção para a kz:** skill `orquestrar`; quadro com `node tools/board.mjs kz --me`.
- **Vídeo novo:** skill `video` (lê o kit). **Material novo de vídeo/motion:** tarefa 002.
- **Fim de sessão:** atualizar este arquivo e o `TASK.md`, commit + push, sugerir `/clear`.
