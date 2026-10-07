# 014 — Galeria reutilizável (motion, efeitos, looks, áudio) com catálogo barato

Status: rascunho (prioridade alta: nasce junto com o kit) · Depende de: 003 · Liga com: 013 (cenas modulares), 015 (cortes e edits), 008 (áudio)
Pedido do Oliver em 2026-10-07: tudo que ficou bom e pode ser reaproveitado (fundo animado, gráfico, mapa, bloco de vídeo, transição, efeito, preset de cor, áudio) vai para uma **galeria**, e o Claude **sabe o que existe sem assistir nada**.

## 1. Onde fica cada coisa
| pasta | o que guarda | exemplo |
|---|---|---|
| `library/motion/<categoria>/<id>/` | **componentes em código** com parâmetros: fundos, gráficos, mapas, contadores, transições em código, blocos de cena genéricos | fundo de pontos (espaçamento, tamanho, opacidade, cor, deriva), gradiente que se move, blur, barra/linha animada, mapa do Brasil por estado |
| `library/fx/<categoria>/` | **clipes de vídeo** para sobrepor ou pôr entre cenas | transições prontas, partículas, light leak, poeira, grão, flare (sobre preto ou com alpha) |
| `library/looks/` | **presets de cor/edição** aplicáveis a qualquer vídeo, inclusive filmagem real | P&B, mais saturado, quente, frio, contraste "edit" — cadeia de filtros do ffmpeg e/ou LUT `.cube` |
| `library/audio/` | trilhas, bases e SFX (já existe) | — |
| `library/visual/` | ícones, mapas SVG, bandeiras, logos (já existe) | — |
| `companies/<slug>/video-templates/` | o que é **da marca**: cenas, cartões finais, aberturas, estilos | cartão final da kz, gancho-pergunta da kz |

Regra: **genérico (só tokens e parâmetros) → `library/`; usa identidade da marca → `companies/<slug>/video-templates/`.** `BRAND.md` continua mandando (ex.: a kz pede fundo liso, então fundo de pontos só se a marca permitir).

## 2. Contrato de componente em código (`library/motion`)
```
library/motion/fundos/pontos/
  index.js     export function criar(root, params, tl, inicio, duracao)  ← determinístico (tempo da timeline, semente fixa)
  meta.json    { "id", "categoria", "tags", "params": { "gap": {"padrao": 24, "min": 8, "max": 80}, "opacidade": {...}, "cor": {"padrao": "var(--muted)"} }, "formatos", "custo_render", "licenca": "própria" }
  preview.png  1 quadro (gerado por script)
```
- Cor sempre por token (`var(--…)`), nunca hex fixo. Funciona em 4:5, 9:16 e 16:9 (layout por área segura).
- Mesmo contrato das cenas da tarefa 013: elástico no tempo, sem depender do vizinho.

## 3. Catálogo que o Claude lê (sem assistir 500 vídeos)
- Cada pasta tem um catálogo JSON (`fx.json`, `looks.json`, `motion.json`, além dos de áudio). Campos mínimos: `id`, `tipo`, `tags`, `descricao` (1 linha), `duracao`, `formatos`/resolução, `alpha` ou fundo preto, `params`, `licenca`, `preview`.
- **`library/INDEX.md` gerado por script**: 1 linha por item (`id · tipo · tags · duração · licença`). É o que o Claude consulta; nunca abre os arquivos de mídia.
- **Busca:** `node tools/library/find.mjs "transição whip 9x16 energética"` → 5–10 melhores por tag e descrição. Só entre os finalistas o Claude olha o `preview.png` (folha de 3–6 quadros feita uma vez por ffmpeg).
- **Sem licença registrada não usa** (mesma regra do áudio e do visual).

## 4. Importar do PC do Oliver
`node tools/library/import.mjs <pasta-no-pc> --tipo fx|looks|audio [--licenca "…"] [--fonte URL]`:
1. lê os arquivos (ffprobe: duração, resolução, fps, alpha, áudio);
2. **renomeia** no padrão `<tipo>-<estilo>-<descrição>-NN.ext` (ex.: `fx-transicao-whip-ar-01.mov`) e copia para a pasta certa (mídia fica local, fora do git);
3. gera `preview.png` e propõe `tags` e `descricao` (o Claude revisa só os nomes e tags, em lote);
4. grava no catálogo com `licenca` = pendente até o Oliver informar → **não aparece na busca enquanto pendente**.
Áudio usa o mesmo fluxo (ampliando `tools/audio/catalog.mjs`).

## 5. Promover para a galeria (hábito de toda entrega)
No fim de cada vídeo: **"algo aqui serve de novo?"** (fundo, gráfico, mapa, transição, bloco de cena, preset de cor).
- Se sim: extrair para `library/` (genérico) ou `video-templates/` (marca) já no contrato do §2, com `meta.json` e preview, e registrar no catálogo.
- Antes de criar algo novo: **consultar o índice primeiro** (`find.mjs`). Criar do zero só se não existir nada adaptável.

## 6. Mesmo vídeo em vários formatos
Já coberto pelo contrato de cena (013): **uma timeline e um áudio**, layout por área segura de cada formato. O Claude ajusta o que não encaixa (texto que quebra diferente, elemento que sai da área segura) e confere a folha de contato **de cada formato**. Variante por formato = script, não reescrita.

## Critérios de pronto
- 5 componentes iniciais em `library/motion` (fundo de pontos, gradiente animado, blur, barra animada, contador) + 3 looks + import de 1 pasta de fx do PC do Oliver.
- `find.mjs` acha o item certo pela descrição; `INDEX.md` < 1 linha por item; nada sem licença aparece.
- Um vídeo novo reaproveita ≥ 1 item da galeria.

## Log
- 2026-10-07: pedido registrado e desenhado.
