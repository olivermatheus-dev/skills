# 022 — Revisão com comentários ancorados (roteiro, vídeo, carrossel) + entrada de roteiros prontos

**Status:** rascunho (desenho aprovado em conversa; implementar por fases) · **Depende de:** 018 (app) · **Liga com:** 007 (comentários tipados), 009 (MCP de edição), `tools/video/timeline.mjs`, skill `elevenlabs`

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

## Log
- 2026-10-07 — criada a partir do pedido do Oliver na sessão da 020 (ElevenLabs v4 + chaves por projeto).
