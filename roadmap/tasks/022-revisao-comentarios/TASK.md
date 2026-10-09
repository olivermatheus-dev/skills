# 022 — Revisão com comentários ancorados (roteiro, vídeo, carrossel) + entrada de roteiros prontos

**Status:** v1 enxuta de vídeo **feita** (2026-10-07); v1.1 (elemento clicando no frame) **reaplicada** em `VideoReview.tsx` (2026-10-07); **fase A feita** (2026-10-07); **C e D feitas** (2026-10-08) · **Depende de:** 018 (app) · **Liga com:** 007 (comentários tipados), 009 (MCP de edição), `tools/video/timeline.mjs`, skill `elevenlabs`

## Pedido do Oliver (2026-10-07)
- Quase nunca editar à mão (as animações são código). Em vez de descrever no chat de forma imprecisa, **comentar no ponto exato**: um quadro, um bloco (cena), uma fala, um efeito, a trilha, um trecho do roteiro. O Claude Code relê os comentários e ajusta certeiro.
- Ver o vídeo em **blocos e faixas** (parecido com o CapCut): cenas, falas, legendas, efeitos, trilha; ajustar volumes e pequenas coisas.
- O mesmo recurso no **carrossel** e no **gerador de conteúdos**. O **roteiro** também: editar e comentar trechos para revisão.
- **Adicionar roteiros prontos** (colar ou enviar arquivo) para o Claude deixar registrado e produzir a partir deles.

## Desenho
**Um conceito só: a peça** = uma pasta `companies/<slug>/contents/AAAA-MM-DD-<tema>/` (já é o padrão). O app ganha a tela **Conteúdos** (lista de peças com status) e, em cada peça, abas por tipo de arquivo que existir nela.

### Arquivo de revisão (fonte única, no git)
`<pasta>/revisao.json`, com schema Zod em `schema/review.ts`:
```json
{
  "status": "rascunho | em_revisao | aprovado",
  "approvals": { "roteiro": "2026-10-08", "v1": null, "final": null },
  "comments": [
    { "id": "c1", "at": "2026-10-08T10:00", "author": "oliver", "status": "aberto | resolvido",
      "anchor": { "kind": "roteiro", "quote": "trecho selecionado", "line": 12 },
      "text": "isso aqui está formal demais", "reply": "reescrito: …" }
  ]
}
```
Âncoras (`anchor.kind`):
| kind | campos | exemplo |
|---|---|---|
| `roteiro` | `quote`, `line` (arquivo `roteiro.md`/`plano.md`) | trecho selecionado no editor |
| `tempo` | `t` (s), `format` (9x16…) | "aos 3,2 s o texto some cedo" (pausar o player e comentar) |
| `cena` | `scene` (+ `t` opcional) | bloco s2 |
| `fala` | `vo` (+ `word` opcional) | f2, palavra "WhatsApp" |
| `evento` | `event` | SFX e3 |
| `trilha` | — | "trilha alta demais no meio" |
| `slide` | `slide`, `x`, `y` (0–1, opcional) | pino no slide 3 do carrossel |

Ids de cena/fala/evento vêm da `timeline.json`: o comentário continua válido mesmo se o tempo mudar.

### Como o Claude lê (barato em tokens)
`node tools/review.mjs <pasta>` → só os comentários **abertos**, cada um com o contexto resolvido (texto da cena, fala, tempo, trecho do roteiro). Depois de corrigir: `node tools/review.mjs <pasta> resolve c1 "o que mudou"`. As skills `video`, `carousel`, `ig-post` e o agente `revisor` passam a começar por aqui quando a peça tem comentários abertos.

### Aprovações viram trava real
O botão **Aprovar v1.0** grava `approvals.v1`; o `elevenlabs.mjs` passa a aceitar isso no lugar do `--aprovado`. Mesma ideia para "roteiro aprovado" antes de animar.

## Fases
**A. Conteúdos + roteiro (primeiro, porque tudo começa no roteiro)**
- [x] Tela Conteúdos: lista das pastas com status, tipo (vídeo, carrossel, post) e nº de comentários abertos.
- [x] **Novo conteúdo / roteiro pronto:** colar texto ou enviar `.md`/`.txt`/`.docx` → cria a pasta com `roteiro.md` e (opcional) a tarefa no quadro "Produzir a partir do roteiro" para a IA.
- [x] Roteiro: modo Revisar (selecionar trecho → anotar; linhas numeradas, destaque das abertas) + modo Editar (texto cru, salvar explícito; não usa o MDXEditor para não reformatar o roteiro e não quebrar as linhas).
- [x] `schema/review.ts`, rotas da API, `tools/review.mjs` (listar/resolver), validação no `npm run validate`.

**B. Vídeo: player + faixas + comentários**
- [ ] Servir o MP4 mais recente (`exports/` ou `-rascunho.mp4`) pelo app.
- [ ] Faixas desenhadas a partir da `timeline.json`: cenas (blocos com nome), falas (com palavras), texto na tela/legendas, eventos (SFX), trilha. Cursor sincronizado com o player.
- [ ] Clicar num bloco ou pausar num tempo → comentar com a âncora certa. Marcadores dos comentários nas faixas.
- [ ] Folha de quadros do `check.mjs` como alternativa ao player (comentar num quadro).

**C. Ajustes diretos (sem o Claude)**
- [x] Volume por faixa (voz, trilha, efeitos) e por evento → grava na `timeline.json` (`timeline.mjs vol`) e o `mix.mjs` lê `mix.vo_db`/`mix.sfx_db`.
- [x] Texto e duração de cena → `timeline.mjs text|dur` (mesmo núcleo do MCP da 009; `dur` agora grava `min`/`len` e refaz o layout).
- [x] Botão "gerar prévia" (trilha se ficou curta → sfx → mix → `produce --draft --only=<fmt>`, em segundo plano com passo e log).

**D. Carrossel e posts**
- [x] Grade dos PNG; pino com comentário por slide (âncora `slide`: `file` = id estável, `slide`, `x`, `y`).

## Critérios de pronto (por fase)
- A: um roteiro colado no app vira pasta + tarefa; um comentário num trecho é lido pelo `review.mjs` e resolvido pelo Claude.
- B: um comentário feito pausando o vídeo chega ao Claude com cena, fala e tempo corretos, e o ajuste sai sem pergunta de volta.
- C: mudar o volume da trilha no app e gerar a prévia sem abrir o chat.

## Versão 1 enxuta, vídeo primeiro (pedido do Oliver, 2026-10-07, após o teste A/B)
Motivo: no vídeo da kz (B-sonnet) os bugs eram pontuais (texto que demora, linha atrás do card, botão colado, aba do navegador) e a correção em chat é imprecisa. Hoje a peça já é 1 `composition.html` com cenas em seções + `timeline.json` (cenas, 45 eventos com id/tempo/alvo, falas, música, sfx): falta só a camada de anotação.
- [x] **Faixas somente leitura** a partir da `timeline.json` (cenas, falas, eventos, trilha) + player do MP4 mais recente + cursor sincronizado.
- [x] **Anotar** cena, fala, evento, tempo/intervalo e **elemento** (digitando o seletor; clicar no frame = v1.1) → `revisao.json`. Novo `anchor.kind: "elemento"` com `selector` (id estável) + `t`; novo `tipo` da anotação: `corrigir | ajustar | template | ok`. `template` = "transformar em componente reutilizável" (vai para a galeria da 014).
- [x] **Ids estáveis de elemento** como regra da skill `video` (todo elemento relevante com `id`, e `data-bloco`), senão o alvo se perde quando a cena é reescrita.
- [x] `tools/review.mjs <pasta>`: lista só as abertas com contexto resolvido + extrai os quadros dos tempos anotados (ffmpeg) para o agente olhar; `resolve` marca resolvida. Skill `video` e agente `revisor` começam por isso.
- [x] **v1.1 feita:** clicar no frame captura o elemento (render ao vivo de `render/<formato>/index.html` num iframe, timeline GSAP sincronizada com o MP4). Volume/duração diretos = fase C.
- Critério de pronto: Oliver anota 3 coisas num vídeo (uma cena, um elemento, um "template"), manda revisar, e o agente corrige/cria o componente lendo só as anotações, sem perguntar de volta.

## Log
- 2026-10-07 — criada a partir do pedido do Oliver na sessão da 020 (ElevenLabs v4 + chaves por projeto).
- 2026-10-07 — adicionada a "Versão 1 enxuta, vídeo primeiro" (anotações por cena/evento/elemento, tipo `template`, ids estáveis) a pedido do Oliver.
- 2026-10-07 — **v1 enxuta implementada.** `schema/review.ts` (âncoras cena/fala/evento/tempo/elemento; tipo corrigir|ajustar|template|ok; `comments[]` com `status`, `reply`, `video`), validado em `npm run validate`; `core/store.ts` (`listPieces/getPiece/getReview/saveReview/pieceFile`) + rotas `/api/projects/:slug/pieces|piece|piece/review?path=` e `/piece-file/<slug>/<peça>/exports/<mp4>` (com Range); tela **Conteúdos** (`app/src/pages/Conteudos.tsx`: player do MP4 mais recente, faixas cenas/falas/eventos/trilha somente leitura, cursor sincronizado, clicar bloco/evento/fala (palavra) ou "Anotar neste tempo", campo opcional de elemento, marcadores nas faixas, resolver/reabrir/excluir); `tools/review.mjs <pasta> [--all] [--no-frames]` + `resolve <id> "…"` (quadros via ffmpeg em `render/review/`); regras na skill `video` (seção Revisão por anotações + ids estáveis `id`/`data-bloco`) e no `agent-notes/revisor.md`. Teste real: `companies/kz/contents/_testes/2026-10-07-ab-sessao/B-sonnet/revisao.json` com 3 anotações (cena s2 corrigir; elemento #tabhist ajustar; elemento #nextsess template) criadas pela UI e lidas pelo `review.mjs` com contexto + quadro. Fora da v1 (como combinado): capturar elemento clicando no frame, volume/duração diretos. Próximo: v1.1 (render ao vivo da composição para clicar no elemento) e fase A (roteiro).
- 2026-10-07 — **v1.1 implementada.** Em Conteúdos, modo **Clicar no elemento**: iframe de `render/<formato>/index.html` (servido por `/piece-file/…/render/…`, MIME de html/js/css/fonte/áudio; `getPiece` devolve `previews`), escalado ao tamanho do quadro; o `<video>` (oculto) manda o tempo e `__timelines.main.time(t)` segue; hover destaca o elemento visível (opacidade efetiva > 0) com o seletor, clique grava âncora `elemento` (`#id` ou `[data-bloco]` do ancestral; sem id estável avisa e usa caminho CSS). Testado na B-sonnet: clique na aba Histórico aos 31,9 s → `#tabhist` (igual ao c2). Limite: só funciona com `render/<fmt>/index.html` montado (produce.mjs); sem isso o modo não aparece.
- 2026-10-07 — **Fase A implementada.** Schema: âncora `roteiro` (`file`, `quote`, `line`) + `status` (rascunho|em_revisao|aprovado) e `approvals` (roteiro/v1/final) no `revisao.json`. Store: `listPieces` agora pega toda pasta com textos/carrossel/vídeo (`kind`, `texts`, status), corrige o caminho com `\` no Windows (contagem de abertas das peças aninhadas dava 0), `getPieceText/savePieceText` (só .md/.txt da raiz), `createPiece` (colar ou enviar .md/.txt/.docx → `contents/AAAA-MM-DD-<tema>/roteiro.md` + tarefa opcional `assignee: ai`, `status: todo`, com formato e observações); `core/docx.ts` lê .docx sem dependência (zip + zlib). App: Conteúdos virou lista (tipo, status, roteiro aprovado, abertas, filtro) + detalhe com abas Roteiro/Vídeo e status; componentes em `app/src/components/pieces/` (`TextReview`, `VideoReview` = tela de vídeo da v1 movida, `NewPiece`, `shared`). `review.mjs`: âncora `roteiro` reencontra o trecho pelo texto (mostra linha atual e vizinhas, avisa se sumiu) e o cabeçalho mostra status/aprovações. Regras: skills `ig-post` e `carousel`, protocolo dos agentes, `app/README.md`. Teste pela UI: roteiro colado → pasta + T-0014; trecho selecionado na linha 4 → anotação; 2 linhas inseridas no topo pelo Editar → anotação seguiu para a linha 7 na tela e no `review.mjs`; `resolve` ok; .docx pela API ok; erros (docx inválido, vazio, caminho com ..) ok. Dados de teste apagados. ⚠ A tela de vídeo foi reescrita a partir da versão commitada (3ce508f): as mudanças da v1.1 feitas em paralelo na outra sessão em `Conteudos.tsx` (iframe para clicar no elemento) não estão no arquivo e precisam ser reaplicadas em `app/src/components/pieces/VideoReview.tsx`. Próximo: reaplicar a v1.1; fase C (volume/duração diretos) ou D (carrossel).
- 2026-10-07 — **v1.1 reaplicada** em `app/src/components/pieces/VideoReview.tsx` (o backend — `previews`, MIME, rota `/piece-file/…/render/…` — tinha sobrevivido). Componente `LivePreview`: iframe de `render/<fmt>/index.html` escalado a 60vh, escolhe a composição pelo nome do MP4 (ex.: `…-9x16-v06.mp4` → `9x16`; seletor se houver várias), muta mídia, pausa `__timelines.main` e segue o `<video>` oculto por rAF **e** pelos eventos `seeked`/`timeupdate` (o rAF para com a janela em segundo plano). Hover = elemento visível de cima (opacidade efetiva > 0, força `pointer-events`) com caixa + seletor; clique = âncora `elemento` (`#id` ou `[data-bloco]` do ancestral; sem id estável, caminho CSS e aviso na anotação). Botões: Clicar no elemento / Voltar ao MP4 e ⏯. Testado na B-sonnet: 31,9 s → `#tabhist`, timeline em 31,9. Próximo: fase C (volume/duração) ou D (carrossel).
- 2026-10-08 — **Fase C feita.** `tools/video/timeline.mjs`: novo `vol <voz|trilha|efeitos|evento> <dB>` (−40…+12; voz/efeitos → `mix.vo_db`/`mix.sfx_db`, trilha → `music.gain_db`, evento → `sfx[].gain_db`); `dur` em timeline que nasce do áudio grava `min` (cena com fala) ou `len` (sem fala) e roda o `layout()` do kit — antes o próximo relayout/tts desfazia; avisa quando a fala não deixa encurtar. `mix.mjs` aplica `mix.vo_db`/`mix.sfx_db`. `core/videoedit.ts` + rotas `POST piece/adjust`, `GET|POST piece/preview` (job em memória por peça: music.mjs se a trilha sintetizada ficou curta → sfx → mix → `produce --draft --only=<fmt>`; passo, log, erro; ajustes travados enquanto roda). App: painel **Ajustes diretos** (`VideoAdjust.tsx`) na Edição do vídeo — sliders Voz/Trilha/Efeitos (grava 400 ms depois de soltar), cena selecionada → duração + texto na tela, evento → volume do som; Gerar prévia troca o player para o `-rascunho.mp4`. Testado no `teste-kit`: s4 2,6→3,2 s, trilha −16 dB, prévia 14,0 s em ~30 s; peça restaurada depois.
- 2026-10-08 — **Fase D feita.** Âncora `slide` no `schema/review.ts`. App: aba **Slides** (carrossel) / **Imagens** (post, mockup) com `SlideReview.tsx`: slide grande, clique = pino numerado na cor do tipo, "Anotar o slide todo", setas ← →, grade com nº de abertas, lista com ir/resolver/excluir; contagem por aba separa roteiro/vídeo/slides. `review.mjs`: slide atual (avisa se a ordem mudou ou o PNG sumiu), posição em palavras, fonte (`carrossel.html`/`mockup.json`) e PNG com anel vermelho no pino em `render/review/<id>-slide.png` (ffmpeg geq). Skills `carousel` e `video` e `app/README.md` atualizados. Testado no `mockup-painel` (dado de teste apagado). Próximo: uso real pelo Oliver; 009 (MCP de edição) pode expor `vol/dur/text` direto.
