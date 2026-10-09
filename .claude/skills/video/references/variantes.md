# Variantes por script (tarefa 045 B)

Depois do aval da base (v1 montada com blocos), as variantes saem **sem LLM**: o `projeto.json` diz os eixos e as opções, o `variantes.mjs` monta uma timeline por combinação, gera as falas que faltam (cache), ancora a trilha no corpo, roda sfx → mix → render de rascunho.

```
node tools/video-kit/scripts/variantes.mjs <pasta> --listar              # combinações da rodada atual
node tools/video-kit/scripts/variantes.mjs <pasta> [--rodada r2|--matriz] [--so id1,id2] [--sem-render] [--only=9x16] [--final]
```
Node 22 (o HyperFrames recusa o 20). No terminal do Bash: `fnm exec --using 22 node …`.

## projeto.json (ao lado da timeline.json aprovada, que é a base)
```json
{
  "nome": "kz-apresentacao",                       // prefixo do nome do anúncio/arquivo
  "base": "timeline.json",
  "trilha": { "ancora": "s2", "respiro_compassos": 2 },
  "voz": "edge-thalita",                           // opcional; sem eixo voz = draft do brand/voices.json
  "eixos": {
    "abertura": [{ "id": "pergunta", "cena": "s1", "falas": { "f1": "texto falado" },
                   "on_screen": "a|b", "use": "abertura/…", "params": {}, "cues": { "troca": "f1:ainda", "entra": { "at": 0.02 } } }],
    "voz":      [{ "id": "thalita", "voz": "edge-thalita" }]
  },
  "rodada": "r1",
  "rodadas": { "r1": { "abertura": ["pergunta", "…"], "voz": ["thalita"] } },   // ou lista [{ abertura, voz }]
  "ajustes": { "<id-da-variante>": { "scenes": { "s1": { "tail": 0.4 } }, "events": { "e2": { "offset": -0.2 } } } }
}
```
- **Opção de eixo = remendo pequeno**, nunca HTML: `voz` (todas as falas), `falas` (texto, ou `{ text, say }`), `cenas: { s1: {…} }` ou o atalho `cena` + campos da cena (`use`, `on_screen`, `params`, `lead`, `tail`…). `cues` move o evento da cena com aquele `cue` (string = palavra `"f1:x"`; objeto = `at`/`before_end`/`offset`); cue que não existe vira evento novo `<cena>-<cue>`.
- Eixo não citado na rodada fica com a 1ª opção. `--matriz` = todas as combinações.
- Id da variante = `<eixo>-<opção>__…` (ex.: `abertura-pergunta__voz-thalita`); nome do arquivo/anúncio = `<nome>__<id>-<formato>-rascunho.mp4`.
- **Abertura nova barata:** se o bloco já existe, é só texto (fala + `on_screen` + palavras dos cues). Ideia visual nova = 1 bloco novo no projeto (`<pasta>/blocos/`), o resto continua por script.

## O que o script garante
- **Cache de falas** por (texto + voz + ajustes da voz) em `<pasta>/audio/cache/vo/<voz>/`: 3 aberturas × 3 vozes geram 9 falas de abertura + 3 corpos, não 9 locuções inteiras. A fala da base é reaproveitada quando texto e voz batem.
- **Só voz de rascunho** (`edge-*`, `win-*`). Voz final (ElevenLabs) só nas aprovadas: o script recusa e manda para a skill `elevenlabs`.
- **Trilha ancorada:** a trilha sintetizada vira uma trilha-mãe com `respiro_compassos` a mais no começo (`audio/cache/trilha-<hash>/`); cada variante pula (`music.start`) até a cena-âncora cair no mesmo ponto da música que na base. Abertura mais longa que o respiro → aviso. Trilha do catálogo: só o pulo.
- **Tudo reencaixa** pelo `layout()` (cenas pelas falas, eventos pelas palavras), os SFX seguem os ids dos eventos, os blocos do projeto e `data/`/`assets/` vêm da origem (`timeline.origem`).
- Uma variante que falha não derruba as outras: vai para `variantes/indice.json` com `erro`.

## Saída
`<pasta>/variantes/<id>/timeline.json` (gerada; não editar: mude o `projeto.json` e rode de novo) · `audio/` · `render/` · `exports/` · `variantes/indice.json` (escolhas, duração, início do corpo, MP4s). Sincronia por variante (QC + ajustes automáticos) é a fase C; aba Variantes no app, a fase D.
