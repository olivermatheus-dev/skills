# Técnico — HyperFrames + GSAP (armadilhas medidas)

> Fontes: tecnico-hyperframes.md, armadilhas medidas nos vídeos do Ludus (consolidado em 2026-10-07). Valores = ponto de partida. ★ = vale para qualquer render HTML → vídeo; o resto, para HyperFrames + GSAP.

## 1. Registro e versão
- **Registro literal:** `window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)`, biblioteca de movimento carregada **depois** do GSAP. Embrulhado em outra linha, o HyperFrames não enxerga: estados sobrepostos e motion blur sem o 2º passe.
- **Fixar a versão do HyperFrames** no kit (`node_modules` local). `npx` fora do kit baixa a mais nova e o render muda sem aviso.
- **Um projeto por formato** (`render/4x5/`, `render/9x16/`). Dois `index.html` na mesma pasta = erro de raiz dupla.

## 2. Animação ★
- Anime só `x`, `y`, `scale`, `rotation`, `opacity` (e filtros); nunca `left`, `top`, `width`, `height` (pulam de pixel e recalculam layout).
- Centralizar com `xPercent: -50` / `yPercent: -50` do GSAP, não `translate` no CSS (brigam).
- **Meça antes de animar:** `getBoundingClientRect` no início do script, antes do primeiro `fromTo`; depois do transform os valores mentem.
- **Sem `will-change`** em elemento que a câmera escala: rasteriza na escala atual e o texto ampliado sai borrado.
- **`zIndex` de volta** depois de arrastar/elevar, senão vaza sobre a próxima cena.

## 3. Texto ★
- **Degradê em texto vai em cada palavra**, não na linha: filho com `transform` não herda o `background-clip: text` e some.
- **Máscara de revelação** (`overflow: hidden`): `padding-bottom` ~0,15–0,2 em, senão ç, g, j, p perdem a perna.

## 4. Seletores e camadas ★
- **Seletor de filho direto** (`#net > svg`) com SVG aninhado; `#net svg` pega os ícones dos chips.
- **Cursor dentro do quadro** em todo zoom, inclusive no meio da transformação: confira quadros intermediários.

## 5. Partículas, grão e ruído ★
- Nada de `Math.random()` nem relógio do navegador: PRNG com semente fixa, estado = função do tempo da timeline; pre-roll e loop por fórmula (`efeitos.md`).
- Canvas redesenhado no `onUpdate` da timeline principal (lê `tl.time()`); sprite desfocado pré-renderizado uma vez.

## 6. Export
- **Cor da marca ★:** BT.709 marcado — `-vf scale=out_color_matrix=bt709 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -pix_fmt yuv420p` — e comparar 1 quadro do MP4 com o PNG (`efeitos.md`).
- **Motion blur:** 2 amostras = 60 → 30 fps, obturador 180° (Ludus); movimento rápido: 4–8 amostras. Processo na skill `video`.
