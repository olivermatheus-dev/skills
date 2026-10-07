---
name: locucao
description: "Prepara a locução de um vídeo: na versão 1.0, gera a voz com TTS gratuito de modelo; depois da aprovação, escreve o texto de voz com emoção para o Eleven v4 e gera pela API (skill elevenlabs) ou entrega para o Oliver gerar no site, e encaixa o áudio final no vídeo. Use quando o usuário pedir locução, narração, voz, 'texto pro ElevenLabs', 'roteiro de voz', 'gerei o áudio', 'troca a voz', ou quando a skill video chegar na etapa de voz."
---

# Locução

Política de custo:
- **v1.0:** voz **gratuita de modelo**, só para aprovar ritmo e cenas.
- **Depois do aval:** voz final na ElevenLabs (Eleven v4), pela API com a chave do projeto (skill `elevenlabs`).
- **Encaixe:** feito pela ferramenta `timeline.mjs`, quase sem gastar tokens.

## 1. v1.0: voz de rascunho (padrão de todo vídeo)
- `node tools/video-kit/scripts/tts.mjs <pasta>`: gera todas as falas com a voz `draft` da empresa (`companies/<slug>/brand/voices.json`; catálogo `library/voices/`). Padrão do hub: **Thalita** (`edge-thalita`, neural da Microsoft, grátis, online). Sem internet: `--voice win-maria` (Windows, offline). Corta o silêncio, mede cada palavra e **encaixa a timeline** sozinho.
- Número, hora e sigla: escreva em `vo[].say` como se fala ("onze da noite"); `text` fica como se lê.
- Registre no `plano.md`: "voz de rascunho; trocar pela final após aval". **Nunca publicar com voz de rascunho.**

## 2. Voz final: ElevenLabs, sempre Eleven v4
**Siga a skill `elevenlabs`** (regras do v4, audio tags, vozes, comando). Resumo:
- Para cada fala, escreva `vo[].el` na `timeline.json`: o `say` aprovado + emoção em audio tags (`[tired, end of a long day]`, `[sighs]`, `[relieved]`), reticências para pausa e no máximo 1 palavra em MAIÚSCULAS. No v4 **não existe** `<break>`, style nem speed.
- `node tools/video-kit/scripts/elevenlabs.mjs <pasta> --dry` (confere texto, voz e créditos) → com o aval do Oliver, `--aprovado` (gera pela API com a chave do projeto, tempos exatos por palavra, e encaixa sozinho).
- Sem API: entregue `<pasta>/locucao-elevenlabs.md`, um bloco por fala (`### f1 · arquivo: f1.mp3 · alvo ≈ 1,8 s`, modelo Eleven v4, stability, similarity e o texto `el`); os arquivos voltam pelo passo 3.

## 3. Encaixe da voz final (quase zero token)
Os arquivos da ElevenLabs (um por fala, nomeados pelo id: `f1.mp3`, `f2.mp3`…) chegam numa pasta qualquer (ex.: `_inbox/audio/<vídeo>/`):
```
node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta-com-os-arquivos>
node tools/video-kit/scripts/fit-vo.mjs <pasta> f2 <arquivo> --words <tempos.json>   (uma fala, com tempos exatos da API)
```
O script guarda o original (`audio/vo/final/`), **corta o silêncio das pontas, padroniza** (mono 48 kHz, sem grave abaixo de 70 Hz), mede, **reencaixa cenas e eventos** (os presos a palavras andam junto) e avisa as falas que mudaram mais de 0,6 s. Sem `--words`, os tempos por palavra são estimados (`words_approx`): confira os gestos presos a palavras nos quadros do `check.mjs`.
Depois: ajustes pontuais na timeline (`lead`/`gap`/`tail`/`min`, ou `timeline.mjs text|dur`) → `sfx` → `mix` → `produce --build-only` → `check` → `produce` → `qc.mjs --sheet`.

## Nunca
- Gastar crédito de voz final antes do aval da v1.0.
- Número ou sigla sem estar por extenso no texto da voz.
- Locução que não cabe na duração (≤ ~2,7 palavras/s; ver `knowledge/video/ritmo.md`).
