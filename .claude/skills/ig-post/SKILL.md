---
name: ig-post
description: "Escreve conteúdo pronto para Instagram: roteiro de carrossel (texto slide a slide), roteiro de reels (gancho, falas, texto na tela, cenas), post único e legenda com CTA. Use quando o usuário disser 'escreve um post', 'carrossel sobre', 'roteiro de reels', 'vídeo para o Instagram', 'legenda', 'transformar essa ideia em post', 'hooks', 'gancho', ou aprovar uma pauta da skill content-ideas."
---

# Post de Instagram

Escreve o **texto**. A peça visual é feita depois por outra skill (ver Handoff).

## Ler antes
`companies/<slug>/context/` → `VOICE.md`, `AUDIENCE.md`, `CONTENT_STRATEGY.md`. Fundo de funil → também `COPY.md`. Hooks: `references/hooks.md`.
**Precedência:** duração, hashtags e CTA definidos no `CONTENT_STRATEGY.md` vencem os defaults daqui.

## Processo
**Anotações do Oliver:** se a pasta da peça tem `revisao.json` com anotações abertas (app → Conteúdos → aba Roteiro), comece por `node tools/review.mjs <pasta>`: cada uma vem com o trecho e a linha atual; corrija e rode `… resolve <id> "o que mudou"`. Roteiro pronto do Oliver (colado no app) é a fonte: ajuste forma, nunca o sentido.
1. **Briefing em 1 linha** (confirmar só se ambíguo): formato · pauta · pilar · funil · sinal-alvo (envio, salvar, comentário, clique).
2. **5 hooks** de tipos diferentes → recomende 1 em uma linha e siga (o usuário pode trocar).
3. **Escrever** no formato abaixo.
4. **Checar:** o 1º frame/capa se entende em 1 s, sem som? Uma ideia só? Palavras literais da persona? Um CTA, ligado ao sinal-alvo? Número só se estiver no contexto. Nicho regulado (saúde): sem promessa de resultado terapêutico, sem caso/fala de paciente; depoimento só de cliente real e autorizado.
5. **Salvar** em `companies/<slug>/contents/AAAA-MM-DD-<tema>/roteiro.md` e fazer o handoff.

## Formatos

### Carrossel (6–10 slides, 1080×1350)
```
Slide 1 (capa): hook, máx. 10 palavras. Sozinho já gera o clique.
Slide 2: segura quem não arrastou. O Instagram reexibe o carrossel a partir dele: precisa funcionar como 2ª capa.
Slides 3–N: 1 ideia por slide, máx. ~30 palavras, tipo sugerido (texto/lista/dado/comparação/citação/foto/print)
Penúltimo: síntese ou virada
Último: CTA único
```

### Reels (padrão 15–30 s, 1080×1920)
```
| tempo | cena/visual | fala | texto na tela |
0–2 s: hook dito E escrito no 1º frame (esse frame é a capa). Sem logo, sem "oi, gente".
2–8 s: tensão/problema
8–X s: entrega (passos, virada, demo)
final: CTA falado + escrito
```
+ produção: `câmera` (talking head, b-roll) ou `motion` (sem rosto, tela do produto, tipografia) · áudio · duração. Legenda na tela sempre (maioria assiste sem som). Texto fora da zona segura (250 px de cima, 350 px de baixo).

### Post único (1080×1350)
Frase central (máx. 15 palavras) + apoio visual + legenda.

### Legenda (todos)
- 1ª linha = segundo hook (~125 caracteres antes do "mais"), com a palavra-chave que a persona buscaria.
- Corpo curto, parágrafos de 1–2 linhas; complementa, não repete.
- CTA único conforme o sinal-alvo: envio → "manda pra uma colega que…"; salvar → "salva pra…"; comentário → pergunta ou "comenta X"; clique → "link na bio".
- Hashtags: as do `CONTENT_STRATEGY.md`; sem regra, 3–5 de nicho.

## Handoff
| peça | próxima skill |
|---|---|
| carrossel | `carousel` (lê o `roteiro.md`) |
| post único estático | `carousel` com 1 slide |
| reels/vídeo em motion | `video` (usa o roteiro como briefing do `plano.md`) |
| reels de câmera | o roteiro é a entrega final; o usuário grava |

Ofereça a próxima skill ao terminar. Se houver uma receita `fmt-*` que case com a peça (ex.: `fmt-post-frase`, `fmt-recorte-funcionalidade`), ofereça-a: ela usa essas mesmas skills como motor.

## Resultados
Envios por DM e salvamentos > curtidas. Reels: retenção nos 3 primeiros segundos. Carrossel: % que chega ao fim. Quando o usuário trouxer números, registre os hooks vencedores em `CONTENT_STRATEGY.md` > "Hooks que funcionaram".
