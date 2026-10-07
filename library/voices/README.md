# Vozes (catálogo geral)

Todas as vozes que o hub usa, de qualquer empresa, com as características e os ajustes que funcionam. **Cada empresa escolhe as suas** em `companies/<slug>/brand/voices.json`.

## Política (padrão de todo vídeo)
1. **Rascunho grátis primeiro:** padrão do hub = **Thalita** (`edge-thalita`, neural da Microsoft, online). Sem internet: Windows (`win-maria`/`win-daniel`, offline). Serve para aprovar copy, ritmo e estrutura. **Nunca publicar** com voz de rascunho.
2. **Só depois do aval:** gerar as falas na **ElevenLabs** com a voz final da empresa → `tools/video-kit/scripts/fit-vo.mjs` trata, encaixa e avisa onde o ritmo mudou → ajustes pontuais → render.

## `voices.json` (este catálogo)
| campo | o quê |
|---|---|
| `id` | `win-daniel`, `edge-thalita`, `el-<nome>` (ElevenLabs) |
| `engine` | `windows` · `edge` · `elevenlabs` |
| `voice` | nome no motor (Windows/edge) ou **voice_id** da ElevenLabs |
| `lang`, `gender` | `pt-BR`, feminina/masculina |
| `stage` | `draft` (rascunho) ou `final` |
| `characteristics` | timbre, idade aparente, energia, para que serve, para que **não** serve |
| `settings` | Windows: `rate` · edge: `rate`, `pitch` · ElevenLabs (**sempre Eleven v4**): `model` (`eleven_v4`), `stability` (`creative`/`natural`/`robust` ou 0–1), `similarity`, `speaker_boost`, `seed`, `language_code` (`pt`). O v4 não tem style nem speed. |
| `tags_ok`, `tags_ruins` | (ElevenLabs) audio tags já testadas nessa voz |
| `license` | termos de uso (ElevenLabs: plano que permite uso comercial) |
| `words` | `exato` (motor dá o tempo de cada palavra) ou `estimado` |

As vozes da ElevenLabs entram aqui ao serem escolhidas (skill `elevenlabs`), com a ficha completa. Geração: `tools/video-kit/scripts/elevenlabs.mjs`.

## `companies/<slug>/brand/voices.json`
```json
{ "draft": "edge-thalita", "final": "el-<nome>", "roles": { "narrador": "el-<nome>", "paciente": "el-<outra>" }, "note": "…" }
```
Um vídeo pode sobrescrever em `timeline.json` > `voice.draft` / `voice.final`.

## Vozes de rascunho disponíveis nesta máquina
- **Windows (offline):** Daniel e Maria (pt-BR).
- **edge-tts (online, grátis):** Thalita, Antonio, Francisca (e outras `pt-BR-*Neural`: `python -m edge_tts --list-voices`).
