---
name: elevenlabs
description: "Voz final com a ElevenLabs, sempre no modelo Eleven v4: escreve o texto de cada fala com emoção (audio tags, pontuação, ênfase), escolhe e registra vozes, gera pela API com tempos por palavra e encaixa no vídeo. Use quando o usuário falar em ElevenLabs, voz final, voz v4, 'gera a voz', 'aprovado, pode gerar a voz', emoção na voz, audio tags, cadastrar voz, testar vozes, ou quando a skill locucao/video chegar na voz final."
---

# ElevenLabs (voz final, Eleven v4)

Fonte: documentação oficial da ElevenLabs, conferida em 2026-10-07 (Eleven v4 saiu em 28/09/2026). Os modelos mudam: em dúvida, confira de novo [modelos](https://elevenlabs.io/docs/overview/models) e o [guia de prompting](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

## Regras fixas
- **Modelo: sempre `eleven_v4`.** (`eleven_v4_turbo` é para tempo real, não para vídeo.)
- **Só depois do aval da v1.0** (voz de rascunho). Antes disso, nada de crédito gasto.
- **Chave por projeto:** `ELEVENLABS_API_KEY` salva no app → **Configurações** (grava em `companies/<slug>/.env`, fora do git). A `.env` da raiz é só reserva.
- **Uma fala = um arquivo** (`f1`, `f2`…), para trocar uma sem regenerar o resto.

## O que o v4 aceita (e o que não aceita)
| aceita | não aceita |
|---|---|
| `stability` e `similarity` | **style, speed e SSML** (`<break time>` NÃO funciona) |
| audio tags em colchetes `[...]` | |
| reticências, pontuação, MAIÚSCULAS para ênfase | |
| até 10.000 caracteres por pedido · 90+ idiomas, inclusive pt-BR | |

- **Stability** (o controle mais importante):
  - `creative` (0): mais emoção e mais resposta às tags; pode "alucinar" (repetir, inventar som). Use em falas curtas e emocionais, sempre com 2–3 versões.
  - `natural` (0,5): **padrão**. Equilibrado e fiel à voz.
  - `robust` (1): estável e consistente, responde pouco às tags. Use em narração neutra e longa.
- **Similarity:** 0,75 de partida.
- **Velocidade:** não há controle. Ritmo vem do texto: frase curta = rápido; vírgula e reticências = mais devagar. Se a fala ficar longa para a cena, reescreva mais curto.

## Como escrever o texto da voz (`vo[].el`)
Cada fala da `timeline.json` ganha o campo `el`: a versão para a ElevenLabs. O `say` continua sendo o da voz de rascunho (que leria os colchetes em voz alta).

1. **Comece do `say` aprovado** (números, horas, siglas e preços por extenso; "kz" como a marca pronuncia, ver `BRAND.md` > Vídeo).
2. **Emoção: audio tags em colchetes, em inglês** (é o vocabulário documentado), logo antes do trecho que elas afetam:
   - emoção/atitude: `[excited]` `[curious]` `[sarcastic]` `[mischievously]` `[happy]` `[sad]` `[crying]` `[angry]`
   - entrega: `[whispers]` `[shouts]`
   - reações: `[sighs]` `[exhales]` `[laughs]` `[laughs harder]` `[starts laughing]` `[clears throat]` `[gulps]`
   - **descritivas** (o v4 entende direção em linguagem natural): `[warm, calm voice]` `[tired, end of a long day]` `[relieved]` `[confident, matter-of-fact]`. Prefira descrever a **qualidade da voz** a algo que pareça efeito sonoro.
   - evitar no vídeo da marca: efeitos sonoros por tag (`[applause]`, `[explosion]`), sotaques forçados e `[sings]`. Efeito sonoro vem da biblioteca (skill `audio`).
3. **Pausa:** `…` (peso, hesitação), ponto (pausa), vírgula (respiro), travessão `—` (quebra). Nunca `<break>`.
4. **Ênfase:** MAIÚSCULAS em **1 palavra** por fala, no máximo; ou aspas na palavra.
5. **Contexto ajuda a emoção:** o texto em volta precisa combinar com a tag. Tag "feliz" em frase triste sai estranha.
6. **Poucas tags:** 1–2 por fala de vídeo curto. Tag demais deixa a voz instável.
7. A voz só segue bem a tag se aquele tipo de entrega existe no treino dela: sussurro numa voz de locutor de rádio pode sair fraco. Teste na voz escolhida.

Exemplos (Kzloo, terapeuta no fim do dia):
```json
{ "id": "f1", "text": "23h04. Mais um paciente remarcando.", "say": "Onze da noite. Mais um paciente remarcando.",
  "el": "[tired, end of a long day] Onze da noite… [sighs] mais um paciente remarcando." }
{ "id": "f2", "say": "Agora, o lembrete sai sozinho pelo WhatsApp.",
  "el": "[relieved] Agora… o lembrete sai SOZINHO pelo WhatsApp." }
{ "id": "f3", "say": "Feito por terapeuta, pra terapeuta.", "el": "[warm, confident] Feito por terapeuta, pra terapeuta." }
```
Ajuste fino por fala (opcional): `"el_settings": { "stability": "creative" }`. Voz de personagem: `"role": "paciente"` (ver `roles` abaixo).

## Gerar (comando)
```
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --dry                      texto, voz e créditos de cada fala (não gasta)
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --aprovado                 gera, trata e encaixa tudo
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --aprovado --only f1 --takes 3   3 versões da fala (o v4 varia a cada geração)
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --pick f1=2                encaixa a versão escolhida (não gasta)
```
- Usa o endpoint **with-timestamps**: grava `audio/vo/elevenlabs/<fala>.mp3` + `<fala>.words.json` (tempo exato de cada palavra, tags descontadas) e chama o `fit-vo.mjs`, que corta, padroniza e **reencaixa cenas e eventos** sem estimativa.
- Registro de cada geração (voz, ajustes, texto, caracteres, request-id) em `audio/vo/elevenlabs/log.json`.
- **Versões (`--takes`):** use no gancho e nas falas com tag forte. Liste os arquivos para o Oliver ouvir e encaixe a escolhida com `--pick`.
- Depois: `check.mjs` → olhar os quadros → `sfx` → `mix` → `produce` → `qc.mjs --sheet` (fluxo do `tools/video-kit/README.md`).
- Sem API (Oliver gera no site): entregue o `el` de cada fala + modelo Eleven v4 + stability/similarity; os arquivos voltam por `fit-vo.mjs <pasta> --dir <pasta>`.

## Vozes
- **Catálogo geral:** `library/voices/voices.json`, entradas `el-<nome>`:
```json
{ "id": "el-<nome>", "engine": "elevenlabs", "voice": "<voice_id>", "lang": "pt-BR", "gender": "feminina", "stage": "final",
  "characteristics": "timbre, idade aparente, energia; serve para…; NÃO serve para…",
  "settings": { "model": "eleven_v4", "stability": "natural", "similarity": 0.75, "speaker_boost": true, "language_code": "pt" },
  "tags_ok": ["[warm, calm voice]", "[sighs]"], "tags_ruins": ["[whispers]"],
  "license": "ElevenLabs <plano> (uso comercial)", "words": "exato" }
```
  `voice_id`: na ElevenLabs, ⋯ da voz → *Copy voice ID*. `tags_ok`/`tags_ruins`: o que já se testou nessa voz.
- **Por empresa:** `companies/<slug>/brand/voices.json` → `"final": "el-<nome>"` e, para vários personagens, `"roles": { "narrador": "el-a", "paciente": "el-b" }`.
- **Escolher voz nova:** o Oliver pré-seleciona os nomes que soam bem em português → cadastrar cada uma no catálogo → gerar a mesma fala de teste com cada uma (`--voice el-<nome> --only f1 --takes 2`) → ele escolhe → registrar no `voices.json` da empresa e o que funcionou no `BRAND.md` > Vídeo.
- Clonagem de voz só com autorização escrita da pessoa dona da voz.

## Nunca
- Gerar antes do aval da v1.0 (o script exige `--aprovado`).
- `<break>`, style ou speed no v4 (são ignorados ou dão erro).
- Número, hora, preço ou sigla em algarismo no `el`.
- Chave de API no git, no chat ou em arquivo que não seja a `.env`.
