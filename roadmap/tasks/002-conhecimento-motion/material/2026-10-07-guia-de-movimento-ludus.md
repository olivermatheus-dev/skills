# [BRUTO] Guia de movimento dos vídeos do Ludus

> Enviado pelo usuário em 2026-10-07, copiado sem edição. O conteúdo destilado está em `knowledge/video/` (movimento, ritmo-e-leitura, visual-e-cor, tecnico-hyperframes) e o exemplo de marca na tarefa 001.

> O que trouxemos da skill `motion-broll` (2026-09-30), somado ao que os vídeos 001 e 002 ensinaram. Vale para todo vídeo desta pasta. Quem conduz a produção é a skill `ludus-video`; o prompt que dispara um vídeo novo é `prompts/video-ludus.md`.

## As seis ideias

1. **Uma forma que não corta.** Cada cena nasce de algo que já estava na tela: a aula encolhe e vira o centro do caos, o caos é puxado para dentro da janela, a janela vira a órbita. Nada de dissolve entre cenas soltas: a transição tem motivo (corte por semelhança, máscara, chicote, uma forma que vira a próxima).
2. **O cursor conduz.** Toda mudança no app acontece porque alguém clicou, arrastou ou digitou — `M.cursor(tl, cursor, ripple)` dá `move`, `click` (aperta, solta com mola, eco) e `press`.
3. **Cada mudança num tempo.** Na fala: uma mudança por batida falada, de 0,4 s a 1,2 s de distância — `python _kit/scripts/words.py <video>/locucao.json` dá o segundo de cada palavra. Na música: cortes e impactos no compasso (a 100 BPM, um tempo = 0,6 s). Uma ideia por vez; nada some antes de dar tempo de ler.
4. **Molas, não curvas genéricas.** `M.SNAP`, `M.FAST`, `M.SOFT`, `M.GENTLE` em `brand/motion.js` — molas em forma fechada, que passam do alvo o que prometem (0, 4 %, 8 %, 2 %) e assentam sem pular. Indicador que anda estica (`M.stretchTo`); conteúdo que troca passa por um desfoque curto (`M.swap`), com saída e entrada separadas.
5. **Profundidade e rastro.** Escala, desfoque e paralaxe dão camada; a câmera se aproxima para o estado ocupar o quadro (`M.GENTLE`); nada fica completamente parado — a câmera anda. O export sai com **motion blur** (60 → 30 quadros, obturador a 180°) por padrão.
6. **Só o que é verdade.** Nenhum número real inventado, nenhum recurso que o produto não tem. O que aparece como dado é do elenco fictício (Gaby, Mariana, Lucas, Beatriz, Pedro) e diz-se ilustrativo no roteiro. O que o Ludus faz vem da landing (`src/components/marketing/`) — se a landing não promete, o vídeo não mostra.

## Cor, texto e fundo — as regras do dono (2026-09-30)

> Depois do 002: *"fundos com gradientes coloridos estranhos, não quero isso"*, *"alguns textos estão cinzas (de um jeito muito ruim)"*, *"o gradiente azul não faz sentido algum existir do jeito que foi colocado do nada"*. Estas regras vencem qualquer outra linha deste guia.

| | a regra |
|---|---|
| **fundo** | **liso**: papel `#F5F5F7` ou branco. Nada de mancha, halo ou gradiente colorido, nem cor que troca de cena para cena. Profundidade vem de sombra, escala e desfoque de foco — não de cor no fundo |
| **título** | **tinta `#1D1D1F`, as duas linhas.** Nenhuma linha de título em cinza |
| **ênfase no título** | uma por título, no máximo, e com motivo. Nunca em cor de família (o "pararam" azul, o "planejada" violeta e o "pagou" verde do 002 saem) |
| **cinza** | só em rótulo pequeno **dentro da janela do app** (legenda de campo, hora), como no produto; nunca em texto que o vídeo "fala" |
| **cor de família** | só dentro do app e com significado: o selo Pago é verde, o Pendente é âmbar. Nunca no fundo, nunca no título |
| **marca** | ouro `#F2A61C`: o símbolo, o botão principal, o fecho. Brilho e degradê, só nela |
| **fonte** | Inter (`brand/fonts/`); o logotipo em Inter 700, espaçamento −0,055 em. **Nunca caixa alta**, nem em rótulo |

## Ritmo — silêncio curto, vídeo dinâmico

> Medido no 002: silêncios de 0,59 s, 1,60 s, **2,67 s**, 2,06 s, 1,90 s e 1,08 s entre falas. O dono: *"os intervalos de silêncio estão grandes demais"*, e quer *"algo mais dinâmico"*.

- **No máximo 0,5 s de silêncio entre uma fala e a próxima.** Uma pausa de até 1 s só na virada, e declarada no plano (`"pause": true` na cena). O `check.mjs` acusa o que passar.
- **A cena dura o que a fala dura.** A ação que precisa de mais tempo acontece *debaixo* da voz, não depois dela.
- **Algo novo a cada 2–3 s**: um gesto, um corte, a câmera que anda. Nada de tela parada esperando a próxima fala.

## Armadilhas (medidas nos vídeos 001–002 e na skill)

- **Registre a linha do tempo assim**, com `brand/motion.js` carregado depois do GSAP: `window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)`. É o que deixa o `produce.mjs` fazer o segundo passe do motion blur. O registro tem que ser literal — o HyperFrames não enxerga uma linha embrulhada em outra, e os estados saem todos sobrepostos.
- **Degradê de texto vai em cada palavra**, não na linha: palavra com `transform` não herda o `background-clip: text` do pai e some.
- **Meça antes de qualquer transform.** Coordenadas do cursor saem de `getBoundingClientRect` no início do script, antes do primeiro `fromTo`.
- **`left`/`top`/`width` não se animam** (o lint do HyperFrames recusa: pulam de pixel em pixel). Use `x`/`y`/`scale`; centralização por `xPercent: -50`, não por `translate` no CSS.
- **Nada de `will-change`** no que a câmera escala: o texto sai borrado.
- **O cursor fica dentro do quadro** em todo zoom, inclusive no meio da transformação.
- **Seletor de SVG com `>`**: `#net svg` pega também os ícones dentro dos chips.
- **Linha com `overflow: hidden`** (a revelação por máscara) precisa de folga embaixo, ou o `ç` e o `g` perdem a perna.
- **Um projeto do HyperFrames por formato** (`render/4x5/`, `render/story/`): dois `index.html` na mesma pasta disparam o erro de raiz dupla.
- **O que sobe de camada para ser arrastado tem que descer depois** (`zIndex` de volta ao soltar): no 003, a aula arrastada vazava por cima da ficha do aluno que abriu em seguida.
- **O HyperFrames é o do kit** (`_kit/node_modules/hyperframes`, hoje 0.8.94): os scripts o chamam direto. Pelo `npx`, fora de `_kit/`, ele baixa a versão mais nova sozinho e o render muda sem aviso.
- **Faísca e partícula só como resposta a um gesto** (o "pago"), nunca como enfeite.
- **Título no story**: 72 px, o mesmo do 4:5 — a 86 px as frases de duas linhas viram três.

## Conferir antes de exportar

```bash
fnm exec --using=22 -- node _kit/scripts/produce.mjs NNN-<nome> --build-only
fnm exec --using=22 -- node _kit/scripts/check.mjs NNN-<nome>
```

Abra `render/<formato>/check/contact-sheet*.jpg` e olhe cada quadro: texto cortado, sobreposição, cursor fora, contraste, palavra fora do tempo. Conserte e confira de novo. Só então exporte.
