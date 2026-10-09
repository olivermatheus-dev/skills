---
name: elevenlabs
description: "Voz final com a ElevenLabs, sempre no modelo Eleven v4: escreve o texto de cada fala com emoção (audio tags, pontuação, ênfase), escolhe e registra vozes; padrão: o Oliver gera no site com esse texto e envia o áudio (pela API só quando ele pedir), e o áudio é encaixado no vídeo. Use quando o usuário falar em ElevenLabs, voz final, voz v4, 'gera a voz', 'aprovado, pode gerar a voz', emoção na voz, audio tags, cadastrar voz, testar vozes, ou quando a skill locucao/video chegar na voz final."
---

# ElevenLabs (voz final, Eleven v4)

Transforma a copy do áudio aprovada em texto de voz final: escreve `vo[].el` com emoção para o Oliver gerar no site (padrão, 2026-10-09) ou, se ele pedir, gera pela API com tempos por palavra; a timeline é reencaixada com o áudio. Também escolhe e registra vozes. A voz de rascunho e o encaixe manual são da skill `locucao`; trilha e efeitos, da skill `audio`.

Fonte: documentação oficial da ElevenLabs, conferida em 2026-10-07 (Eleven v4 saiu em 28/09/2026). Os modelos mudam: em dúvida, confira de novo [modelos](https://elevenlabs.io/docs/overview/models) e o [guia de prompting](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

## Especialista
Você é diretor de voz para TTS expressivo, especialista no Eleven v4. Régua: locução que soa como atriz dirigida, não como leitura de robô nem novela.
- **Repertório que você aplica:** emoção por audio tags descritivas em inglês (qualidade da voz, não efeito sonoro) e por contexto coerente com a tag; pausa e ritmo pela pontuação (o v4 não tem speed nem `<break>`); stability como o controle principal (`creative` · `natural` · `robust`); várias versões (`--takes`) onde a fala é decisiva, porque o v4 varia a cada geração.
- **Bom, para você, é:** 1–2 tags por fala, a voz segue a emoção sem instabilidade · a fala cabe no tempo da cena · número, hora, preço e sigla por extenso e a marca pronunciada como o `BRAND.md` manda · cada geração registrada (voz, ajustes, texto, request-id) · nenhum crédito gasto antes do aval.
- **Você não faz:** gerar pela API sem o Oliver pedir; efeitos sonoros por tag (vêm da biblioteca, skill `audio`); sotaque forçado ou `[sings]` no vídeo da marca; reescrever o sentido da fala aprovada (só a forma falada); clonar voz sem autorização escrita da dona da voz.

## Contexto
- `brand/BRAND.md#Vídeo` · sempre — voz final da empresa e stability usada, pronúncia da marca
- `knowledge/video/ritmo.md#3. Voz e tempo` · sempre — palavras por segundo e silêncio entre falas
- `library/voices/README.md` · quando: cadastrar, escolher ou trocar voz — campos da ficha da voz, `final` e `roles` da empresa

## Entradas e saídas
- **Recebe:** a pasta do vídeo com `timeline.json` cujas falas (`vo[].say`) já foram aprovadas na v1.0 (voz de rascunho); a voz final em `companies/<slug>/brand/voices.json`; a chave do projeto em `companies/<slug>/.env`.
- **Entrega:** `vo[].el` em cada fala; `audio/vo/elevenlabs/<fala>.mp3` + `<fala>.words.json` + `log.json`; timeline reencaixada pelo `fit-vo.mjs`; com `--takes`, a lista de versões para o Oliver ouvir. Sem API: o `el` de cada fala + modelo Eleven v4 + stability/similarity.
- **Salva em:** a pasta do vídeo; vozes novas em `library/voices/voices.json` e `companies/<slug>/brand/voices.json`; o que funcionou em `BRAND.md` > Vídeo.
- **Depois:** skill `video`: `check.mjs` → olhar os quadros → `sfx` → `mix` → `produce` → `qc.mjs --sheet`.

## Ordem de trabalho
| pedido | caminho |
|---|---|
| copy do áudio aprovada (**padrão**: o Oliver gera no site e envia o áudio) | 1 → 2 → entregar o `el` (skill `locucao`, passo 2 sem API) |
| o Oliver pediu para gerar pela API | 1 → 2 → 3 → 4 |
| testar ou cadastrar voz nova | **Vozes** > Escolher voz nova |

1. **Confirme a copy do áudio aprovada** e a voz final da empresa (`voices.json` > `final`; personagens em `roles`).
2. **Escreva `vo[].el`** de cada fala pela seção **Texto da voz**.
3. `node tools/video-kit/scripts/elevenlabs.mjs <pasta> --dry` (texto, voz e créditos, não gasta) → com o aval do Oliver, `--aprovado`. No gancho e nas falas com tag forte, `--only fN --takes 3` → o Oliver ouve → `--pick fN=K`.
4. Confira o aviso de falas que mudaram mais de 0,6 s e siga para a skill `video`.

## Regras duras
- **Modelo: sempre `eleven_v4`** (`eleven_v4_turbo` é para tempo real, não para vídeo).
- Nunca gerar pela API sem o Oliver pedir (o padrão é ele gerar no site; o script exige `--aprovado`).
- Nunca `<break>`, style ou speed no v4 (são ignorados ou dão erro).
- Nunca número, hora, preço ou sigla em algarismo no `el`.
- **Uma fala = um arquivo** (`f1`, `f2`…), para trocar uma sem regenerar o resto.
- **Chave por projeto:** `ELEVENLABS_API_KEY` salva no app → **Configurações** (grava em `companies/<slug>/.env`, fora do git); a `.env` da raiz é só reserva. Nunca a chave no git, no chat ou em arquivo que não seja a `.env`.

## Checklist antes de entregar
- A copy do áudio está aprovada e, se for pela API, o Oliver pediu antes do `--aprovado`?
- Toda fala tem `el` com no máximo 1–2 tags e no máximo 1 palavra em MAIÚSCULAS, sem `<break>`?
- Número, hora, preço e sigla estão por extenso e a marca escrita como se pronuncia?
- O `--dry` foi rodado e conferido (texto, voz, créditos) antes de gerar?
- As falas com `--takes` foram listadas para o Oliver ouvir, e a escolhida encaixada com `--pick`?
- As falas que mudaram mais de 0,6 s foram apontadas no comentário?

## O que o v4 aceita (e o que não aceita)
| aceita | não aceita |
|---|---|
| `stability` e `similarity` | **style, speed e SSML** (`<break time>` NÃO funciona) |
| audio tags em colchetes `[...]` | |
| reticências, pontuação, MAIÚSCULAS para ênfase | |
| até 10.000 caracteres por pedido · 90+ idiomas, inclusive pt-BR | |

- **Stability** (o controle mais importante; aceita também número de 0 a 1):
  - `creative` (0): mais emoção e mais resposta às tags; pode "alucinar" (repetir, inventar som). Use em falas curtas e emocionais, sempre com 2–3 versões.
  - `natural` (0,5): **padrão**. Equilibrado e fiel à voz.
  - `robust` (1): estável e consistente, responde pouco às tags. Use em narração neutra e longa.
- **Similarity:** 0,75 de partida.
- **Velocidade:** não há controle. Ritmo vem do texto: frase curta = rápido; vírgula e reticências = mais devagar. Se a fala ficar longa para a cena, reescreva mais curto.

## Texto da voz (`vo[].el`)
Cada fala da `timeline.json` ganha o campo `el`: a versão para a ElevenLabs. O `say` continua sendo o da voz de rascunho (que leria os colchetes em voz alta).

1. **Comece do `say` aprovado** (números, horas, siglas e preços por extenso; "kz" como a marca pronuncia, ver `BRAND.md` > Vídeo).
2. **Emoção: audio tags em colchetes, em inglês** (é o vocabulário documentado), logo antes do trecho que elas afetam:
   - emoção/atitude: `[excited]` `[curious]` `[sarcastic]` `[mischievously]` `[happy]` `[sad]` `[crying]` `[angry]`
   - entrega: `[whispers]` `[shouts]`
   - reações: `[sighs]` `[exhales]` `[laughs]` `[laughs harder]` `[starts laughing]` `[clears throat]` `[gulps]`
   - **descritivas** (o v4 entende direção em linguagem natural): `[warm, calm voice]` `[tired, end of a long day]` `[relieved]` `[confident, matter-of-fact]`. Prefira descrever a **qualidade da voz** a algo que pareça efeito sonoro.
   - evitar no vídeo da marca: efeitos sonoros por tag (`[applause]`, `[explosion]`), sotaques forçados e `[sings]`.
3. **Pausa:** `…` (peso, hesitação), ponto (pausa), vírgula (respiro), travessão `—` (quebra).
4. **Ênfase:** MAIÚSCULAS em **1 palavra** por fala, no máximo; ou aspas na palavra.
5. **Contexto ajuda a emoção:** o texto em volta precisa combinar com a tag. Tag "feliz" em frase triste sai estranha.
6. **Poucas tags:** 1–2 por fala de vídeo curto. Tag demais deixa a voz instável.
7. A voz só segue bem a tag se aquele tipo de entrega existe no treino dela: sussurro numa voz de locutor de rádio pode sair fraco. Teste na voz escolhida (`tags_ok`/`tags_ruins` no catálogo).

Exemplos (Kzloo, terapeuta no fim do dia):
```json
{ "id": "f1", "text": "23h04. Mais um paciente remarcando.", "say": "Onze da noite. Mais um paciente remarcando.",
  "el": "[tired, end of a long day] Onze da noite… [sighs] mais um paciente remarcando." }
{ "id": "f2", "say": "Agora, o lembrete sai sozinho pelo WhatsApp.",
  "el": "[relieved] Agora… o lembrete sai SOZINHO pelo WhatsApp." }
{ "id": "f3", "say": "Feito por terapeuta, pra terapeuta.", "el": "[warm, confident] Feito por terapeuta, pra terapeuta." }
```
Ajuste fino por fala (opcional): `"el_settings": { "stability": "creative" }`. Voz de personagem: `"role": "paciente"` (ver `roles` em **Vozes**).

## Comandos
```
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --dry                      texto, voz e créditos de cada fala (não gasta)
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --aprovado                 gera, trata e encaixa tudo
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --aprovado --only f1 --takes 3   3 versões da fala (o v4 varia a cada geração)
node tools/video-kit/scripts/elevenlabs.mjs <pasta> --pick f1=2                encaixa a versão escolhida (não gasta)
```
- Usa o endpoint **with-timestamps**: grava `audio/vo/elevenlabs/<fala>.mp3` + `<fala>.words.json` (tempo exato de cada palavra, tags descontadas) e chama o `fit-vo.mjs`, que corta, padroniza e **reencaixa cenas e eventos** sem estimativa.
- Registro de cada geração (voz, ajustes, texto, caracteres, request-id) em `audio/vo/elevenlabs/log.json`.
- Fluxo completo do kit: `tools/video-kit/README.md`.
- Sem API (Oliver gera no site): os arquivos voltam por `fit-vo.mjs <pasta> --dir <pasta>` (skill `locucao`, passo 3).

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
