# Guia técnico do kit (armadilhas medidas)

> Regras de movimento, ritmo e cor ficam em `knowledge/video/` e no `BRAND.md` de cada empresa. Aqui só o que quebra o render. Origem: kit do Ludus (vídeos 001–003) + teste do kit da kz (tarefa 003).

## Estrutura obrigatória da composição
- Raiz: `<div id="root" data-composition-id="main" data-start="0" data-duration="__DURATION__" data-width="__W__" data-height="__H__">`.
- Scripts: `kit/gsap.min.js` → `kit/motion.js` → `<script>window.__TL = __TIMELINE__</script>` → `kit/tl.js` → o seu script.
- Uma timeline pausada, registrada **literalmente**: `window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)`. O HyperFrames não enxerga uma linha embrulhada em outra (os estados saem sobrepostos), e o `M.offset` é o que faz o 2º passe do motion blur.
- Termine com `tl.set({}, {}, T.duration)` para a timeline ter a duração do vídeo.
- Marca em `brand/brand.css` (copiada de `companies/<slug>/brand/`); fontes **locais** no `brand/fonts/` (render sem internet e determinístico).

## Armadilhas
- **`fromTo` desenha o estado inicial já no quadro 0.** Se o "de" é visível (ex.: anel de explosão `{ opacity: 0.7 }` → `0`), ele aparece desde o começo do vídeo, em cima de outras cenas. Nesses, use `immediateRender: false` (o `M.cursor().click` do kit já faz isso com o anel do clique).
- **Tempos do Whisper chegam 0,1–0,3 s atrasados.** O `split-vo.mjs`/`fit-vo.mjs` corrigem pelas pausas do próprio áudio (`snapWords` em `lib.mjs`); a palavra entra ~0,14 s antes de ser dita.
- **Regra CSS por descendente pega ícones.** `#x svg { … }` também atinge o `<svg class="icon">` dos `{{i:…}}` dentro de `#x`. Use filho direto (`#x > svg`).
- **Medir elemento depois de preencher o texto.** Botão vazio na hora do `getBoundingClientRect` = cursor no lugar errado.
- **Linha centralizada que entra palavra a palavra** começa pela esquerda (as palavras invisíveis já ocupam espaço). Frase grande de abertura: quebre em 2 linhas curtas (`max-width`).
- **O HyperFrames embute e reordena os scripts.** Nada de ler `window.__TL` no topo de um arquivo do kit: o `tl.js` lê na hora do uso. Erro típico: "T is not defined" e todos os quadros iguais. Diagnóstico: `node node_modules/hyperframes/bin/hyperframes.mjs validate .` dentro de `render/<formato>/`.
- **Nenhum JS (kit, `lib/motion`, composição) pode conter a tag de fechar script**, nem em comentário: o HyperFrames embute os arquivos na página, a tag fecha o script cedo e sai "Invalid or unexpected token" + "gsap is not defined" (todos os quadros vazios).
- **Componentes da galeria:** `library/motion/` é copiada para `render/<formato>/lib/motion/` pelo `produce.mjs`.
- **Estado inicial escondido vai no CSS** (`opacity: 0`), não em `tl.set(..., 0)`: um `set` em 0 não aparece no quadro 0 (o lint avisa).
- **Saída termina antes da entrada.** Na troca de cena, o que sai acaba antes do que entra aparecer. Os quadros do `check.mjs` (fim de cena e eventos) **não pegam transição**: a folha do `qc.mjs --sheet` (a cada 0,5 s) pega.
- **Nada parado > 1,5 s** (o `qc.mjs` acusa tela congelada): na espera, algo vivo (indicador de digitação, câmera respirando com escala ≥ 1,03, cursor andando).
- **Meça antes de qualquer transform** (`getBoundingClientRect` no início do script), para cursor e alvos.
- **`left/top/width` não se animam** (pulam de pixel); use `x/y/scale`. Centralize com `xPercent: -50`.
- **Nada de `will-change`** no que a câmera escala (texto borrado). `filter: blur` funciona, mas troca a captura rápida pela lenta (o render fica ~2× mais lento).
- **Degradê de texto vai em cada palavra**, não na linha (palavra com transform não herda `background-clip: text`).
- **Linha com `overflow: hidden`** (revelação por máscara) precisa de folga embaixo, senão `ç` e `g` perdem a perna.
- **O que sobe de camada para ser arrastado desce depois** (`zIndex` de volta ao soltar).
- **Um projeto do HyperFrames por formato** (`render/9x16/`, `render/4x5/`): o `produce.mjs` já faz assim.
- **Sempre o HyperFrames do projeto** (`node_modules/hyperframes`, versão fixa). Pelo `npx` ele baixa a mais nova e o render muda sem aviso.
- **Determinismo:** nada de `Math.random()`, `Date.now()` ou timers; tudo função do tempo da timeline.
- **Cor da marca como texto:** o validador acusa contraste (ex.: coral `--primary` como texto na kz = 2,6:1, proibido no BRAND.md). Use o token de ênfase da marca.
- **Exportar com BT.709 completo** (matriz, primárias e transferência): o `produce.mjs` marca no stream e no contêiner; o `qc.mjs` confere (`cor bt709/bt709/bt709`).
