# Kit de vídeo (motor de render)

HTML/CSS/GSAP → MP4 com o [HyperFrames](https://hyperframes.heygen.com) **0.8.94 (versão fixa no `package.json`)**. Veio do kit do Ludus (`../ludus/videos/_kit`, em produção) e foi adaptado ao contrato deste hub: timeline em `vo[]`/`scenes[]`/`events[]`, SFX da biblioteca licenciada, marca de cada empresa, formatos 4:5 · 9:16 · 16:9 · 1:1. Decisão e alternativas: `roadmap/tasks/003-stack-motion/DECISAO.md`.

```
tools/video-kit/
  runtime/   motion.js (molas SNAP/FAST/SOFT/GENTLE, swap, stretchTo, cursor, offset) · tl.js (T.scene/ev/word/text) · icons.json (Lucide)
  scripts/   tts · fit-vo · music · sfx · mix · produce · check  (+ lib.mjs, tts-windows.ps1)
  GUIA-TECNICO.md   armadilhas do HyperFrames/GSAP (leia antes de animar)
```

Pré-requisitos: Node 22 (`.nvmrc`, o fnm troca sozinho), `npm install`, ffmpeg no PATH, Python + `edge-tts` só para as vozes `edge-*`. Molde de vídeo novo: `library/templates/video/base/`.

## Fluxo (pasta = `companies/<slug>/contents/AAAA-MM-DD-<nome>/`)

| etapa | comando | o que faz |
|---|---|---|
| 1. voz de rascunho | `node tools/video-kit/scripts/tts.mjs <pasta> [--voice win-maria]` | gera cada fala com voz grátis (Thalita por padrão; `win-*` offline), corta silêncio, mede palavras e **encaixa a timeline** |
| 2. trilha | `node tools/video-kit/scripts/music.mjs <pasta>` **ou** `node tools/video/timeline.mjs music <pasta> <id>` | sintetiza uma trilha própria (`music.synth`) ou usa uma do catálogo |
| 3. efeitos | `node tools/video-kit/scripts/sfx.mjs <pasta>` | posiciona os SFX da biblioteca (e os sintetizados) nos eventos |
| 4. mix | `node tools/video-kit/scripts/mix.mjs <pasta>` | voz + trilha com ducking + efeitos → −14 LUFS (duas passadas) |
| 5. montar | `node tools/video-kit/scripts/produce.mjs <pasta> --build-only` | um projeto HyperFrames por formato em `render/<formato>/` |
| 6. conferir | `node tools/video-kit/scripts/check.mjs <pasta>` | regras de tempo + quadros de cada cena e evento em `render/<formato>/check/` → **olhar** |
| 7. exportar | `node tools/video-kit/scripts/produce.mjs <pasta>` | MP4 com motion blur (60→30), BT.709 → `exports/<pasta>-<formato>-vNN.mp4` |
| 8. QC final | `node tools/video/qc.mjs <pasta> --sheet` | formato, cor, loudness, tela parada + folha do MP4 (pega o que os quadros do passo 6 não pegam: transições) |

Rascunho rápido: `produce.mjs <pasta> --draft` (sem rastro, sobrescreve `-rascunho.mp4`). Um formato: `--only=9x16`. Sem som: `--mute`.

## Voz: rascunho grátis → final na ElevenLabs
1. **Rascunho (sempre o padrão):** `tts.mjs` com a voz `draft` da empresa (`companies/<slug>/brand/voices.json`; catálogo em `library/voices/`). Serve para aprovar copy, ritmo e cenas.
2. **Aprovado:** gerar as falas na ElevenLabs (skill de ElevenLabs, tarefa 020), uma fala = um arquivo (`f1.mp3`, `f2.mp3`…).
3. **Encaixe:** `node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta-com-os-arquivos>` (ou `<pasta> f2 arquivo.mp3 [--words tempos.json]`): guarda o original em `audio/vo/final/`, corta o silêncio, padroniza, mede e **reencaixa cenas e eventos**; avisa a fala que mudou mais de 0,6 s.
4. `check.mjs` → olhar os quadros (palavras estimadas sem `--words`) → ajustes pontuais (`timeline.json`: `lead`, `gap`, `tail`, `min`, `len`; ou `timeline.mjs text|dur`) → `sfx` + `mix` + `produce`.

## Por que trocar a voz não quebra o vídeo
A timeline nasce do áudio (`lib.mjs` → `layout()`): cada cena dura o que suas falas duram (+ `lead`/`gap`/`tail`), e eventos podem se prender a palavras (`"word": "f2:WhatsApp"`), ao início da cena (`"at"`) ou ao fim (`"before_end"`). A composição lê tudo por `T.scene/T.ev/T.word` e os marcadores `__S:s1__ __D:s1__ __E:e3__`; nenhum tempo fica escrito à mão. Esquema completo: `.claude/skills/video/references/timeline.md`.
