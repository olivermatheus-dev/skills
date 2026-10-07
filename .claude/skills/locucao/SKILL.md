---
name: locucao
description: "Prepara a locução de um vídeo: na versão 1.0, gera a voz com TTS gratuito de modelo; depois da aprovação, entrega o roteiro de voz no formato exato da ElevenLabs (pausas, entonação, números por extenso, ajustes de voz) para o Oliver gerar fora da API, e encaixa o áudio final no vídeo. Use quando o usuário pedir locução, narração, voz, 'texto pro ElevenLabs', 'roteiro de voz', 'gerei o áudio', 'troca a voz', ou quando a skill video chegar na etapa de voz."
---

# Locução

Política de custo:
- **v1.0:** voz **gratuita de modelo**, só para aprovar ritmo e cenas.
- **Depois do aval:** voz final na ElevenLabs. O Oliver gera fora da API, ou um agente no navegador gera, e devolve o arquivo.
- **Encaixe:** feito pela ferramenta `timeline.mjs`, quase sem gastar tokens.

## 1. v1.0: voz de rascunho (padrão de todo vídeo)
- `node tools/video-kit/scripts/tts.mjs <pasta>`: gera todas as falas com a voz `draft` da empresa (`companies/<slug>/brand/voices.json`; catálogo `library/voices/`). Padrão do hub: **Thalita** (`edge-thalita`, neural da Microsoft, grátis, online). Sem internet: `--voice win-maria` (Windows, offline). Corta o silêncio, mede cada palavra e **encaixa a timeline** sozinho.
- Número, hora e sigla: escreva em `vo[].say` como se fala ("onze da noite"); `text` fica como se lê.
- Registre no `plano.md`: "voz de rascunho; trocar pela final após aval". **Nunca publicar com voz de rascunho.**

## 2. Voz final: roteiro no formato ElevenLabs
> A skill própria de ElevenLabs (vozes escolhidas, ajustes por voz, API com tempos por palavra) está na tarefa 020. Até lá, vale o formato abaixo.

Entregue `<pasta>/locucao-elevenlabs.md` com **um bloco por fala**, pronto para copiar:

```
### f1 · arquivo: f1.mp3 · alvo ≈ 1,8 s · bloco: gancho
Modelo: Eleven Multilingual v2 · Voz: <nome/ID da voz da marca> · Stability 45 · Similarity 75 · Style 15 · Speed 1.0
Texto:
Toda noite… a mesma mensagem.
```

Regras do texto. Confira a documentação atual da ElevenLabs, porque os modelos mudam.
- **Pausas:**
  - vírgula = respiro curto; ponto = pausa;
  - reticências `…` = hesitação ou suspense;
  - travessão `—` = quebra curta;
  - pausa exata (modelos v2/Flash): `<break time="0.6s" />`, no máximo ~3 s e poucas por fala, porque em excesso deixa a voz instável;
  - **no v3**, use pontuação e *audio tags* em colchetes (`[pausa]`, `[sussurrando]`, `[animada]`, `[suspira]`) no lugar de `<break>`.
- **Ênfase:** reescreva a frase para a palavra importante cair no fim; no v3, MAIÚSCULAS dão ênfase (use 1 palavra por fala, no máximo).
- **Números, preços e datas por extenso:** "R$ 129" → "cento e vinte e nove reais"; "23h04" → "vinte e três e quatro" ou "onze da noite"; "2026" → "dois mil e vinte e seis".
- **Siglas e nomes:** escreva como se fala ("CRP" → "cê-erre-pê", "kz" → como a marca pronuncia, registrado no `BRAND.md` > Vídeo).
- **Uma fala = um arquivo.** É o que permite trocar só uma, sem regenerar tudo.
- **Ajustes da voz** (ponto de partida):
  - Stability 40–55 (menor = mais expressivo);
  - Similarity 70–80;
  - Style 0–20;
  - Speed 0,95–1,05.

  Registre os valores que funcionaram no `BRAND.md` > Vídeo.
- **Duração-alvo** por fala (da timeline atual), para quem gerar saber se precisa acelerar ou cortar.

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
