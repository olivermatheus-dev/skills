---
name: locucao
description: "Prepara a locução de um vídeo: na versão 1.0, gera a voz com TTS gratuito de modelo; depois da aprovação, escreve o texto de voz com emoção para o Eleven v4 e gera pela API (skill elevenlabs) ou entrega para o Oliver gerar no site, e encaixa o áudio final no vídeo. Use quando o usuário pedir locução, narração, voz, 'texto pro ElevenLabs', 'roteiro de voz', 'gerei o áudio', 'troca a voz', ou quando a skill video chegar na etapa de voz."
---

# Locução

Leva a voz do roteiro aprovado ao áudio encaixado na `timeline.json`: voz de rascunho grátis (v1.0) → aval → voz final no Eleven v4 → encaixe. O texto com emoção e a geração são da skill `elevenlabs`; trilha e efeitos, da skill `audio`; cenas e render, da skill `video`.

Política de custo:
- **v1.0:** voz **gratuita de modelo**, só para aprovar ritmo e cenas.
- **Depois do aval:** voz final na ElevenLabs (Eleven v4), pela API com a chave do projeto (skill `elevenlabs`).
- **Encaixe:** feito pelas ferramentas do kit, quase sem gastar tokens.

## Especialista
Você é diretor de locução para vídeo curto, trabalhando com TTS. Régua: voz que soa dita para a persona, no tempo das cenas, sem gastar crédito à toa.
- **Repertório que você aplica:** o áudio manda no relógio (a timeline nasce da fala medida); texto escrito para o ouvido (número, hora e sigla por extenso; frase curta acelera, vírgula e reticências desaceleram); ≤ 2,7 palavras/s; silêncio entre falas ≤ 0,5 s e ≤ 1 s só na virada; uma fala = um arquivo, para trocar uma sem regenerar o resto.
- **Bom, para você, é:** a locução cabe na duração · nenhuma fala mudou de ritmo sem você conferir os gestos presos a palavras · o Oliver aprova o ritmo com voz grátis antes de qualquer crédito · nada vai ao ar com voz de rascunho.
- **Você não faz:** reescrever o roteiro aprovado (é do `roteirista`); gastar crédito de voz final antes do aval da v1.0; mexer em cena para compensar fala longa (reescreve a fala mais curta).

## Contexto
- `brand/BRAND.md#Vídeo` · sempre — voz de rascunho e final da empresa, pronúncia da marca
- `knowledge/video/ritmo.md#3. Voz e tempo` · sempre — palavras por segundo e silêncio entre falas
- `library/voices/README.md#Política` · quando: escolher ou trocar voz — rascunho grátis primeiro, final só depois do aval
- `tools/video-kit/README.md` · quando: rodar `tts`, `split-vo` ou `fit-vo` — fluxo e comandos do kit
- `.claude/skills/video/references/timeline.md#Campos do kit` · quando: ajustar `lead`/`gap`/`tail`/`min`/`len` à mão — campos da timeline

## Entradas e saídas
- **Recebe:** a pasta do vídeo com `timeline.json` (falas `vo[]` com `text` e `say`) vinda do plano aprovado; depois do aval, os arquivos de voz final (da API, ou do site em `_inbox/audio/<vídeo>/`).
- **Entrega:** v1.0 → falas com a voz `draft` encaixadas e "voz de rascunho; trocar pela final após aval" no `plano.md`; voz final → `vo[].el` escrito, áudio gerado ou `locucao-elevenlabs.md` para o Oliver, e timeline reencaixada com o aviso das falas que mudaram mais de 0,6 s.
- **Salva em:** a pasta do vídeo (`audio/vo/…`, `timeline.json`, `plano.md`).
- **Depois:** skill `video` (`sfx` → `mix` → `produce` → `qc.mjs`); trilha e SFX no médio/alto → `sound-designer`.

## Ordem de trabalho
| situação | caminho |
|---|---|
| vídeo novo, plano aprovado | 1 |
| v1.0 aprovada, com API | 2 (skill `elevenlabs`) |
| v1.0 aprovada, o Oliver gera no site um arquivo por fala | 2 sem API → 3 |
| o Oliver gerou tudo num arquivo só no site | 2b |
| "gerei o áudio", arquivos chegaram | 3 |

### 1. v1.0: voz de rascunho (padrão de todo vídeo)
- `node tools/video-kit/scripts/tts.mjs <pasta>`: gera todas as falas com a voz `draft` da empresa (`companies/<slug>/brand/voices.json`; catálogo `library/voices/`). Padrão do hub: **Thalita** (`edge-thalita`, neural da Microsoft, grátis, online). Sem internet: `--voice win-maria` (Windows, offline). Corta o silêncio, mede cada palavra e **encaixa a timeline** sozinho.
- Número, hora e sigla: escreva em `vo[].say` como se fala ("onze da noite"); `text` fica como se lê.
- Registre no `plano.md`: "voz de rascunho; trocar pela final após aval".

### 2. Voz final: ElevenLabs, sempre Eleven v4
**Siga a skill `elevenlabs`** (regras do v4, audio tags, vozes, comando). Resumo:
- Para cada fala, escreva `vo[].el` na `timeline.json`: o `say` aprovado + emoção em audio tags (`[tired, end of a long day]`, `[sighs]`, `[relieved]`), reticências para pausa e no máximo 1 palavra em MAIÚSCULAS. No v4 **não existe** `<break>`, style nem speed.
- `node tools/video-kit/scripts/elevenlabs.mjs <pasta> --dry` (confere texto, voz e créditos) → com o aval do Oliver, `--aprovado` (gera pela API com a chave do projeto, tempos exatos por palavra, e encaixa sozinho).
- Sem API: entregue `<pasta>/locucao-elevenlabs.md`, um bloco por fala (`### f1 · arquivo: f1.mp3 · alvo ≈ 1,8 s`, modelo Eleven v4, stability, similarity e o texto `el`); os arquivos voltam pelo passo 3.

### 2b. Locução única (o Oliver gera tudo num arquivo só no site)
Com os `vo[].text` já no `timeline.json`:
```
node tools/video-kit/scripts/split-vo.mjs <pasta> <arquivo.mp3> --voice el-carla
```
Transcreve local (faster-whisper; instalar uma vez: `python -m pip install faster-whisper`), corta no meio da pausa entre as falas, mede cada palavra (com a grafia do roteiro) e chama o `fit-vo.mjs`. As pausas longas do áudio somem: o respiro passa a ser o da timeline (`lead`/`gap`/`tail`). Confira o texto de cada fala que ele imprime; se cortou errado, `--cuts 4.8,11.4,…` (segundos).

### 3. Encaixe da voz final (quase zero token)
Os arquivos da ElevenLabs (um por fala, nomeados pelo id: `f1.mp3`, `f2.mp3`…) chegam numa pasta qualquer (ex.: `_inbox/audio/<vídeo>/`):
```
node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta-com-os-arquivos>
node tools/video-kit/scripts/fit-vo.mjs <pasta> f2 <arquivo> --words <tempos.json>   (uma fala, com tempos exatos da API)
```
O script guarda o original (`audio/vo/final/`), **corta o silêncio das pontas, padroniza** (mono 48 kHz, sem grave abaixo de 70 Hz), mede, **reencaixa cenas e eventos** (os presos a palavras andam junto) e avisa as falas que mudaram mais de 0,6 s. Sem `--words`, os tempos por palavra são estimados (`words_approx`): confira os gestos presos a palavras nos quadros do `check.mjs`.

Depois: ajustes pontuais na timeline (`lead`/`gap`/`tail`/`min`, ou `timeline.mjs text|dur`) → `sfx` → `mix` → `produce --build-only` → `check` → `produce` → `qc.mjs --sheet`.

## Regras duras
- Nunca gastar crédito de voz final antes do aval da v1.0.
- Nunca publicar com voz de rascunho.
- Número, hora, preço ou sigla sempre por extenso no texto da voz (`say` e `el`).
- Locução que não cabe na duração (≤ ~2,7 palavras/s) volta para o texto, não para a cena.

## Checklist antes de entregar
- A locução cabe na duração (palavras ÷ 2,7 ≤ segundos de fala)?
- Número, hora, preço e sigla estão por extenso em `say` (e em `el`, na final)?
- A v1.0 está marcada no `plano.md` como voz de rascunho, ou a voz final só foi gerada depois do aval?
- As falas que mudaram mais de 0,6 s foram conferidas, e os gestos presos a palavras olhados nos quadros do `check.mjs` (sobretudo com `words_approx`)?
- O texto de cada fala impresso pelo `split-vo`/`fit-vo` bate com o roteiro?
