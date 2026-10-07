# Biblioteca (assets reutilizáveis)

Mapa de **onde fica cada asset** do hub. Regra de decisão:
- **genérico** (serve para qualquer empresa, só tokens e parâmetros) → `library/`;
- **da marca** (logo, fonte, print, vinheta, cena com identidade) → `companies/<slug>/`;
- **peça de um conteúdo específico** → `companies/<slug>/contents/<data-tema>/`.

## Onde fica cada coisa

| o quê | pasta | mídia vai para o git? | catálogo |
|---|---|---|---|
| efeitos sonoros (SFX) | `library/audio/sfx/<categoria>/` | não (local) | `audio/sfx.json` |
| trilhas prontas | `library/audio/music/` | não | `audio/music.json` |
| loops, stems e samples para compor | `library/audio/bases/<tipo>/` | não | `audio/bases.json` |
| ícones, logos de terceiros, bandeiras, mapas, ilustrações | `library/visual/<tipo>/` | sim (SVG/PNG leves) | registro no `visual/README.md` |
| clipes de efeito de vídeo (transições, partículas, grão, light leak) | `library/fx/<categoria>/` | não | `fx/fx.json` |
| componentes de motion em código (fundos, gráficos, contadores, transições) | `library/motion/<categoria>/<id>/` | sim (código) | `meta.json` por item |
| looks de cor (cadeias ffmpeg, LUT `.cube`) | `library/looks/` | sim | `looks/looks.json` |
| templates genéricos de peça | `library/templates/{carousel,post,video}/` | sim (HTML) | — |
| formatos de conteúdo (galeria: verbete, exemplos, referências) | `library/formatos/<id>/` | sim (`formato.json`); prints de referência não | `formato.json` (aba Formatos do app) |
| mockups: templates, aparelhos, fundos (estúdio de mockups) | `library/mockups/` | sim (HTML/CSS/JS) | `catalogo.json` + `meta.json` (`node tools/mockup/render.mjs --listar`) |
| prints do produto para mockup (bruto) | `companies/<slug>/capturas/<data>-<tela>/` | sim (PNG + `captura.json`) | `captura.json` |
| marca: logo, ícones, fontes, fotos, prints | `companies/<slug>/brand/` | sim | `BRAND.md` |
| marca: logo sonoro, vinheta, voz da marca | `companies/<slug>/brand/audio/` | não | `BRAND.md` > Som |
| templates de vídeo da marca | `companies/<slug>/video-templates/` | sim | — |
| **entrada bruta** (tudo que ainda não foi organizado) | `_inbox/{audio,visual,video}/` | não | — |

Detalhes por tipo: [`audio/README.md`](audio/README.md) · [`visual/README.md`](visual/README.md) · contrato de motion, fx e looks em `roadmap/tasks/014-galeria-reutilizavel/TASK.md`.

## Mídia fora do git
Áudio e vídeo **ficam só nesta máquina** (o `.gitignore` bloqueia `*.wav`, `*.mp3`, `*.mp4`, `*.mov`…); **os catálogos JSON vão para o git**. Assim o Claude sabe o que existe sem abrir nenhum arquivo, e o repo não incha.
⚠️ Isso significa que a mídia **não tem backup pelo GitHub**: faça backup da pasta `library/` (e de `companies/*/brand/audio/`) por fora, por exemplo no Drive.

## Como trazer arquivos que você já tem
1. **Copie a pasta como está** para `_inbox/<tipo>/<nome-do-pacote>/`, por exemplo `_inbox/audio/sonniss-gdc-2024/`. Não renomeie nem reorganize à mão: o nome do pacote ajuda a descobrir a origem e a licença.
2. Anote a **origem e a licença** de cada pacote (de onde baixou, se é CC0, Pixabay, compra, gerado por IA…).
3. Peça ao Claude: `organiza os sons do _inbox`. Ele classifica, renomeia no padrão de família (`Whoosh_Cinematic_Soft_Short_01.wav`), move para `library/audio/…` e cadastra no catálogo.
4. **Sem licença registrada, não usa:** itens sem licença ficam no catálogo como pendentes e não aparecem na busca.

## Regras
- Procurar no catálogo **antes** de criar, gerar ou baixar.
- Todo arquivo novo entra no catálogo antes de ser usado.
- Ficou bom num conteúdo e serve de novo? **Promova** para `library/` (genérico) ou `video-templates/` (marca).
