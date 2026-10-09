# Blocos de vídeo (contrato, tarefa 045)

Um vídeo = lista de blocos na `timeline.json`. O `produce.mjs` chama o `compor.mjs`, que monta o `composition.html` (gerado, não editar). O LLM escreve **blocos**; variante = outra lista ou outros textos/vozes, montada por script.

## Onde moram (o 1º que existir vence)
`<pasta-do-vídeo>/blocos/<use>` (nasceu no projeto) → `companies/<slug>/video-templates/blocos/<use>` (marca) → `library/blocos/<use>` (genérico, só tokens).
Classes de marca compartilhadas (ex.: `.t-coral`): `companies/<slug>/video-templates/base.css`. Base do palco e utilitários (`.hl`, `.w`, `.acc`, `.center`, `.tile-ic`, `.burst`): `tools/video-kit/runtime/base.css`.

## Arquivos do bloco
```
<tipo>/<id>/
  bloco.json   { id, tipo, titulo, camada ("palco" | "fundo" | "frente"), slots: [...], params: { nome: { padrao, descricao } },
                 cues: [...], min_s, elastico, formatos, sfx_sugeridos, tokens, origem, licenca }
  bloco.html   marcação; classes, nunca id (o mesmo bloco pode aparecer 2× no vídeo); ícones {{i:<lucide>}}
  bloco.css    seletores simples; o compor prefixa tudo com .b-<tipo>-<id> (`:scope` = a raiz)
  bloco.js     BLOCO('<tipo>/<id>', function (ctx) { ... })   ← sem fecho de tag script dentro
```

## ctx (tudo que o bloco usa)
| campo | o que é |
|---|---|
| `tl`, `K` | timeline GSAP; ajudantes `K.type(el, texto, fala, de, dy, 1ªNoDe)`, `K.flash(el, texto, at)`, `K.out`, `K.pop`, `K.burst` |
| `root`, `$`, `$$` | raiz do bloco e seletores só dentro dele |
| `cena` | `{ start, end, dur }` (camada: o vídeo inteiro) |
| `texto('slot')` / `partes()` | parte do `on_screen` na ordem de `slots` (`|` separa; `*x*` = ênfase) |
| `fala(i)` | id da i-ésima fala da cena (para `K.type` casar palavra e voz) |
| `cue('nome', padrão?)` | segundo do evento da cena com `"cue": "nome"` |
| `params` | padrões do `bloco.json` + `scenes[].params` |
| `box(el, fx, fy)` | ponto no espaço do palco; **meça antes de animar** (fromTo aplica o "de" na hora) |
| `cursor()` | cursor + eco no palco (fora do zoom da cena); `{ el, move, click, press }` |

## Regras
- Nada de tempo, texto ou cor fixos: tempo por `cue`/`cena`, texto por slot, cor por token. Dado de demonstração fixo no HTML só em bloco de marca, marcado como ilustrativo.
- Elástico: entrada no cue, saída por `cena.end - x` ou cue `sai`; aceita outra duração/voz sem mexer no código.
- Sem depender do vizinho. Transbordo para a próxima cena só por param declarado (ex.: `sobra` da abertura).
- O `compor` recusa: slot faltando no `on_screen`, cue declarado sem evento na cena, bloco não achado.

## Timeline
```json
"camadas": [{ "use": "fundo/blobs", "params": {} }],
"scenes": [{ "id": "s1", "use": "abertura/pergunta-fragmentos", "vo": ["f1"], "on_screen": "Você é *terapeuta*?|…" }],
"events": [{ "id": "e2", "cue": "troca", "scene": "s1", "word": "f1:ainda", "offset": -0.12 }]
```
- **Param por formato:** `"params": { "zoom": 1.5, "por_formato": { "9x16": { "zoom": 1.9 } } }` (o runtime sobrescreve só no formato em render).
- **Param de arquivo:** `"pagina": "@data/pagina.html"` (texto grande; o `produce.mjs` lê da pasta do vídeo, ou da origem numa variante).

Comandos: `node tools/video-kit/scripts/compor.mjs <pasta> --listar` (monta e diz de onde veio cada bloco); o resto do fluxo não muda.
Exemplo completo: `companies/kz/contents/V0001-apresentacao-kz` (8 blocos da kz em `companies/kz/video-templates/blocos/`).
