# Técnico — HyperFrames + GSAP (armadilhas medidas)

> Base: armadilhas medidas pelo usuário nos vídeos do Ludus (2026-10-07). Vale se a stack escolhida na tarefa 003 for HyperFrames + GSAP; os itens marcados ★ valem para qualquer render HTML → vídeo.

## Registro e versão
- **Registro literal da timeline:** `window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)`, com a biblioteca de movimento carregada **depois** do GSAP. Embrulhado em outra linha, o HyperFrames não enxerga, e os estados saem sobrepostos (e o motion blur perde o 2º passe).
- **Fixar a versão do HyperFrames** no kit (`node_modules` local) e chamar sempre essa. `npx` fora do kit baixa a versão mais nova e o render muda sem aviso.
- **Um projeto por formato** (`render/4x5/`, `render/9x16/`). Dois `index.html` na mesma pasta = erro de raiz dupla.

## Animação ★
- **Anime só `x`, `y`, `scale`, `rotation`, `opacity`** (e filtros), nunca `left`, `top`, `width` ou `height`: estes pulam de pixel em pixel e recalculam o layout.
- Centralizar com `xPercent: -50` / `yPercent: -50` do GSAP, não com `translate` no CSS (os dois brigam).
- **Meça antes de animar:** coordenadas (`getBoundingClientRect`) no início do script, antes do primeiro `fromTo`. Depois do transform, os valores mentem.
- **Sem `will-change`** em elementos que a câmera escala: o navegador rasteriza na escala atual e o texto ampliado sai borrado.
- **`zIndex` de volta** depois de arrastar ou elevar um elemento, senão ele vaza por cima da próxima cena.

## Texto ★
- **Degradê em texto vai em cada palavra**, não na linha: filho com `transform` não herda o `background-clip: text` do pai e some.
- **Máscara de revelação** (`overflow: hidden` na linha): dê folga embaixo (`padding-bottom` ~0,15–0,2 em) ou as descendentes (ç, g, j, p) perdem a perna.

## Seletores e camadas ★
- Use **seletor de filho direto** (`#net > svg`) quando houver SVG aninhado; `#net svg` pega também os ícones dentro de chips.
- **Cursor dentro do quadro** em todo zoom, inclusive **no meio** da transformação. Confira os quadros intermediários, não só o início e o fim.

## Export
- Motion blur: ver `esteira-de-producao.md` §5 (o Ludus usa 2 amostras = 60 → 30 fps com obturador de 180°; em movimento rápido, considerar 4–8 amostras).
