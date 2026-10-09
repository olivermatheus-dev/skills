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
  "trilha": { "ancora": "s2", "respiro_compassos": 2, "ancora_fim": "s7", "andamento_max": 0.15 },
  "limites": { "gancho_s": 3, "abertura_max_s": 5, "max_s": 45 },   // opcional (QC de sincronia)
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

## Sincronia (QC por variante, fase C)
Toda variante passa por `montar → QC → correção automática (até 3 voltas) → efeitos/mix/render → QC técnico do MP4`. Módulo: `tools/video-kit/scripts/sincronia.mjs` (também roda avulso em qualquer vídeo: `node tools/video-kit/scripts/sincronia.mjs <pasta>`, depois de `produce.mjs --build-only`).
```
node tools/video-kit/scripts/variantes.mjs <pasta> --matriz --qc        # só monta e confere (9 variantes ≈ 30 s), sem render
node tools/video-kit/scripts/variantes.mjs <pasta> --relatorio [id]      # o relatório curto de cada variante com pendência
```
**A base aprovada é o gabarito:** o que já acontecia nela sai como "herdado" e não vira aviso; só conta o que a variante piorou. Medidas da base em cache (`variantes/qc-base.json`, fora do git).

| regra | o que confere | corrige sozinho |
|---|---|---|
| `cue-fora` | evento preso a palavra cai fora da cena que o bloco espera (o compor recusaria) | `offset` do evento, se passou por pouco do início da cena |
| `min_s` | cena abaixo do `min_s` do bloco | `min` da cena |
| `leitura` (tela) | texto na tela ≥ max(1 s; 0,3 s × palavras) desde a 1ª palavra e a última palavra ≥ 0,5 s antes de sumir ou recuar (Playwright, quadro a quadro) | `tail` da cena (até +0,8 s), quando o texto sai no fim da cena; no meio da cena vai ao LLM com a dica do evento que o tira |
| `area-segura` (tela) | texto-chave fora da área segura do formato (`knowledge/video/REGRAS.md` §3; anúncio 9:16 até y 1250) | — |
| `colisao` (tela) | texto coberto ≥ 10% por cartão, fragmento ou outro texto por ≥ 0,2 s (brilho e desfoque decorativos não contam) | — |
| `gancho` | a 1ª frase da tela completa em ≤ 3 s (`limites.gancho_s`) | — |
| `abertura`, `duracao` | início do corpo ≤ `limites.abertura_max_s` (5 s no anúncio), total ≤ `limites.max_s` | — |
| `parado` | cena sem nada novo > 3 s (e pior que a base) | — |
| `texto-fala` | palavra na tela que a fala não diz (entra sem voz) | — |
| `trilha` | abertura maior que o respiro, trilha acabando antes do vídeo, fim fora do ponto da base | andamento (ver abaixo) |
| `tecnico` | o `tools/video/qc.mjs` no MP4 (loudness −14 LUFS, true peak, BT.709, quadro preto, congelado…) | — |

**Trilha com duas âncoras:** o corpo (`trilha.ancora`, padrão a 2ª cena) e o cartão final (`trilha.ancora_fim`, padrão a última cena; `null` desliga) caem no mesmo ponto da música que na base. A trilha-mãe é sintetizada no andamento da variante (até `trilha.andamento_max` = 15%; cache por 0,1 BPM). Ex.: base com a Carla a 84 BPM → Thalita ≈ 85, Francisca ≈ 91; o "resolve" cai no cartão final com erro < 0,01 s.

**Relatório para o LLM** (`variantes/<id>/sincronia.md`, ≈ 500–900 tokens, meta ≤ 2 mil): só o que o script não resolveu, as falas da cena com o tempo de cada palavra, os eventos, a opção do eixo e o formato da resposta. O LLM responde com **um ajuste JSON**:
- só desta variante → `projeto.json > ajustes["<id>"]` = `{ "scenes": { "s2": { "tail": 0.5 } }, "events": { "e5": { "word": "f2:pacientes" } }, "vo": { "f2": { "rate": "-10%", "say": "…" } } }` (`por_que` livre ao lado);
- vale para todas as variantes de uma opção (ex.: uma voz rápida demais) → na **opção do eixo**: `{ "id": "francisca", "voz": "edge-francisca", "rate": "-8%", "falas": { "f2": { "say": "Agenda de um lado. Informações…", "rate": "-12%" } } }`.
Alavancas de voz de rascunho: `rate` (por fala ou na opção de voz; edge: `"-10%"`) e `say` com **ponto final** onde precisa de pausa (o edge quase ignora reticências). Depois: `variantes.mjs <pasta> --so <id>` (ou `--qc` para conferir antes de renderizar).

## Saída
`<pasta>/variantes/<id>/timeline.json` (gerada; não editar: mude o `projeto.json` e rode de novo) · `sincronia.json` (status ok/aviso/erro, correções automáticas, problemas) · `sincronia.md` (só com pendência) · `audio/` · `render/` · `exports/` · `variantes/indice.json` (escolhas, duração, início do corpo, MP4s, `qc: { status, corrigidos, pendentes }`) · `variantes/aval.json` (aval do Oliver pelo app: `aprovada` | `final` | `descartada`).

## No app (aba Variantes, fase D)
Peça com `projeto.json` ganha a aba **Variantes** (Conteúdos → peça): **Fluxo** (insumos → base v1 → ramo por opção → variantes) ou **Matriz** (colunas = 1º eixo, linhas = os outros), miniatura que toca no hover, selo do QC, aval. **Marcar** por rodada/linha/coluna/ramo → **Conferir** (`--qc`) ou **Gerar** no fundo (`variantes.mjs <pasta> --matriz --so <ids> [--only=<formato>]`, faixa de progresso + dock, Parar) → **Baixar** as marcadas (.zip). Rodada com opção pendente (`"<vencedora da r1>"`) mostra os botões para escolher (grava `rodadas.<r>.<eixo>`). **Anotar** abre a Edição do vídeo da própria variante (`contents/<projeto>/variantes/<id>`, sem os ajustes diretos): a anotação leva `alcance: variante | todas`, e o `review.mjs` da pasta da variante diz onde mexer (`ajustes["<id>"]` ou a base/opção do eixo). Núcleo: `core/variantes.ts`.
