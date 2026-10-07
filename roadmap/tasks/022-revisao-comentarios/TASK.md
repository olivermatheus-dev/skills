# 022 — Revisão com comentários ancorados (roteiro, vídeo, carrossel) + entrada de roteiros prontos

**Status:** v1 enxuta de vídeo **feita** (2026-10-07); fases A, C e D e a v1.1 (elemento clicando no frame) pendentes · **Depende de:** 018 (app) · **Liga com:** 007 (comentários tipados), 009 (MCP de edição), `tools/video/timeline.mjs`, skill `elevenlabs`

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
- [ ] Tela Conteúdos: lista das pastas com status, tipo (vídeo, carrossel, post) e nº de comentários abertos.
- [ ] **Novo conteúdo / roteiro pronto:** colar texto ou enviar `.md`/`.txt`/`.docx` → cria a pasta com `roteiro.md` e (opcional) a tarefa no quadro "Produzir a partir do roteiro" para a IA.
- [ ] Editor do roteiro (o editor markdown que já existe) com seleção → comentar.
- [ ] `schema/review.ts`, rotas da API, `tools/review.mjs` (listar/resolver), validação no `npm run validate`.

**B. Vídeo: player + faixas + comentários**
- [ ] Servir o MP4 mais recente (`exports/` ou `-rascunho.mp4`) pelo app.
- [ ] Faixas desenhadas a partir da `timeline.json`: cenas (blocos com nome), falas (com palavras), texto na tela/legendas, eventos (SFX), trilha. Cursor sincronizado com o player.
- [ ] Clicar num bloco ou pausar num tempo → comentar com a âncora certa. Marcadores dos comentários nas faixas.
- [ ] Folha de quadros do `check.mjs` como alternativa ao player (comentar num quadro).

**C. Ajustes diretos (sem o Claude)**
- [ ] Volume por faixa (voz, trilha, efeitos) e por evento → grava na `timeline.json` e roda `mix.mjs`.
- [ ] Texto de legenda e duração de cena → `timeline.mjs text|dur` (mesmo núcleo do MCP da 009).
- [ ] Botão "gerar prévia" (`produce --draft`).

**D. Carrossel e posts**
- [ ] Grade dos PNG; pino com comentário por slide (`slide`, `x`, `y`).

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
- [ ] Fora da v1: clicar no frame para capturar o elemento (render ao vivo da composição no app) = v1.1; volume/duração diretos = fase C.
- Critério de pronto: Oliver anota 3 coisas num vídeo (uma cena, um elemento, um "template"), manda revisar, e o agente corrige/cria o componente lendo só as anotações, sem perguntar de volta.

## Log
- 2026-10-07 — criada a partir do pedido do Oliver na sessão da 020 (ElevenLabs v4 + chaves por projeto).
- 2026-10-07 — adicionada a "Versão 1 enxuta, vídeo primeiro" (anotações por cena/evento/elemento, tipo `template`, ids estáveis) a pedido do Oliver.
- 2026-10-07 — **v1 enxuta implementada.** `schema/review.ts` (âncoras cena/fala/evento/tempo/elemento; tipo corrigir|ajustar|template|ok; `comments[]` com `status`, `reply`, `video`), validado em `npm run validate`; `core/store.ts` (`listPieces/getPiece/getReview/saveReview/pieceFile`) + rotas `/api/projects/:slug/pieces|piece|piece/review?path=` e `/piece-file/<slug>/<peça>/exports/<mp4>` (com Range); tela **Conteúdos** (`app/src/pages/Conteudos.tsx`: player do MP4 mais recente, faixas cenas/falas/eventos/trilha somente leitura, cursor sincronizado, clicar bloco/evento/fala (palavra) ou "Anotar neste tempo", campo opcional de elemento, marcadores nas faixas, resolver/reabrir/excluir); `tools/review.mjs <pasta> [--all] [--no-frames]` + `resolve <id> "…"` (quadros via ffmpeg em `render/review/`); regras na skill `video` (seção Revisão por anotações + ids estáveis `id`/`data-bloco`) e no `agent-notes/revisor.md`. Teste real: `companies/kz/contents/2026-10-07-ab-sessao/B-sonnet/revisao.json` com 3 anotações (cena s2 corrigir; elemento #tabhist ajustar; elemento #nextsess template) criadas pela UI e lidas pelo `review.mjs` com contexto + quadro. Fora da v1 (como combinado): capturar elemento clicando no frame, volume/duração diretos. Próximo: v1.1 (render ao vivo da composição para clicar no elemento) e fase A (roteiro).
