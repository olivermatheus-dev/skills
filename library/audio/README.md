# Biblioteca de áudio

Compartilhada por todas as empresas. **Os arquivos de áudio ficam só na máquina (fora do git); os catálogos JSON ficam no git.** Assim a busca funciona em qualquer lugar e o arquivo pesado não infla o repo. Mapa geral e como trazer sons que você já tem: `library/README.md` (entrada bruta em `_inbox/audio/`).

```
library/audio/
  sfx/<categoria>/<Familia>_NN.wav      efeitos (whoosh, impact, ui, foley…)
  music/<id>.wav (+ stems/)             trilhas prontas ou compostas por nós
  bases/<tipo>/…                        loops, one-shots, stems e samples para compor trilhas
  sfx.json · music.json · bases.json    catálogos (metadados + licença)
```

## Regras
1. **Procurar no catálogo antes de gerar ou baixar.** `node tools/audio/catalog.mjs search sfx --category whoosh --intensity light --character clean`
2. **Todo arquivo novo entra no catálogo antes de ser usado:** `node tools/audio/catalog.mjs scan` cria a ficha (duração, canais, pico) e você/agente completa os campos `?`.
3. **Sem licença registrada = não usa.** `node tools/audio/catalog.mjs check` acusa.
4. **Nome por família** (consistência sem repetição): `<Categoria>_<Caráter>_<Peso|Intensidade>_<Duração>_NN` → `Whoosh_Cinematic_Soft_Short_01.wav`, `UI_Elegant_Click_03.wav`.

## Ficha de SFX (`sfx.json`)
| campo | valores |
|---|---|
| `id`, `file`, `family` | — |
| `category` | whoosh, swish, pass-by, impact, hit, boom, sub, pop, click, tick, ui, riser, uplifter, downer, drop, reverse, tonal, glitch, digital, mechanical, foley, footsteps, cloth, handling, ambience, room-tone, crowd, texture, drone, tension, cinematic, comedic, notification, success, error, reveal, sparkle, material |
| `function` | movement, impact, feedback, anticipation, resolution, atmosphere, foley, transition, continuity |
| `intensity` | subtle, light, medium, strong, extreme |
| `character` | clean, soft, organic, cinematic, digital, mechanical, playful, elegant, futuristic, dark, aggressive |
| `movement` | fast, medium, slow · `weight`: light, medium, heavy · `scale`: small, medium, large |
| `duration_s`, `peak_s`, `channels` | medidos pelo `scan` (`peak_s` = onde está o pico: alinhar com o quadro de maior velocidade) |
| `tonal`, `key` | se tem altura definida e em que tom |
| `style` | natural, stylized · `texture`: livre (air, grit, metal, glass…) |
| `source` | `{type: downloaded\|generated\|synthesized\|recorded, origin, author}` |
| `license`, `attribution` | ex.: CC0, CC-BY-4.0 (exige atribuição), Pixabay, Sonniss-GDC, ElevenLabs-<plano>, own |

## Ficha de música (`music.json`)
`id, file, title, mood[], energy (low|medium|high), bpm, key, duration_s, sections[{name,start,end}], stems[], uses[], brand (slug ou null), source, license`. As **seções com tempo** (intro, build, drop, outro) permitem casar a trilha com os blocos do vídeo.

## Ficha de base (`bases.json`)
`id, file, kind (loop|one-shot|stem|sample), instrument, bpm, key, bars, mood[], source, license`.

## Fontes (verificar licença de cada arquivo)
- **Gerar:** ElevenLabs (efeitos por texto e música; ver os termos do plano), síntese em código (Web Audio / OfflineAudioContext, como no kit do Ludus).
- **Baixar:** Freesound (CC0 / CC-BY — conferir arquivo a arquivo), Pixabay Sounds, pacotes gratuitos da Sonniss (GDC). Bibliotecas "só uso pessoal/educacional" (ex.: BBC Sound Effects) **não servem** para marketing.
