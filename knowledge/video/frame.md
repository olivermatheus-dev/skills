# Frame: formato, cor e composição

> Fontes: Etapa 7 + guia do Ludus (consolidado em 2026-10-07). Valores = ponto de partida.
> `brand.css` e `BRAND.md` mandam sobre estes defaults. **Design primeiro, movimento depois:** frame fraco parado continua fraco animado.

## 1. Formatos e tamanhos
| uso | proporção | px |
|---|---|---|
| feed (post, carrossel, vídeo) | 4:5 | 1080×1350 |
| Reels, Stories, TikTok, Shorts | 9:16 | 1080×1920 |
| quadrado (só se pedido) | 1:1 | 1080×1080 |
| YouTube, LP, trailer horizontal | 16:9 | 1920×1080 (ou 2560×1440, 3840×2160) |

- 4:5, 9:16 e 1:1 têm a mesma largura (1080): **mesmo tamanho de título** em todos. Aumentar no story quebra 2 linhas em 3.
- Cada formato pede **composição própria** do mesmo sistema (hierarquia, quebras, margens, recorte, densidade), não só redimensionar.
- 1º quadro do vídeo e 1º slide = o que aparece no feed: precisa funcionar sozinho.

## 2. Áreas seguras
**9:16 (interface cobre; valores 2025–26, confira o guia oficial):**
| zona | Reels / TikTok / Shorts | Stories |
|---|---|---|
| topo | ~14% (≈ 270 px) | ~14% (≈ 270 px) |
| base | anúncio ~35% (≈ 670 px); orgânico ~20–25% (≈ 400–480 px) | ~20% (≈ 380 px) |
| direita | ~120–150 px (botões) | — |
| laterais | ~6% (≈ 65 px) | ~6% |

- Texto e elementos-chave em 9:16: **x 65–930, y 270–1250** (anúncio) ou **y 270–1440** (orgânico). Fundo e movimento podem ocupar a tela toda.
- 4:5: margem segura de **80 px** em todos os lados.

**Recorte da grade do perfil (miniatura 3:4):**
- Post 4:5 → corta **~34 px de cada lado**: nada importante encostado nas laterais.
- Reels 9:16 → mostra só a faixa central **1080×1440** (corta **~240 px em cima e embaixo**): título da capa e rosto dentro dela.

**Duração de referência:** anúncio 15–20 s (máx. 30; mensagem completa nos 5 primeiros s) · reels orgânico 15–45 s · trailer 20–30 s · story ≤ 15 s por tela.

## 3. Cor
- **Fundo liso** (`--bg` ou branco). Sem mancha, halo, blob nem gradiente colorido. Cor de fundo não muda entre cenas sem motivo narrativo (ex.: virada caos → calma, 1 vez).
- Profundidade = escala, sombra suave, desfoque; não cor no fundo.
- **Toda cor responde "o que ela significa?"** Sem resposta, sai.

| cor | pode | não pode |
|---|---|---|
| destaque (`--primary`) | logo, botão principal, ênfase única, CTA | fundo inteiro, enfeite |
| cinza (`--muted`) | rótulo pequeno **dentro da interface** (campo, hora) | texto narrativo, título |
| status (verde, âmbar, vermelho) | dentro da interface, com significado (pago, pendente, erro) | fundo, título, decoração |
| brilho, degradê, glow | só no elemento da marca, se o `BRAND.md` permitir | qualquer outro lugar |

- Paleta: base · apoio · **destaque raro** · semânticas. Teste em escala de cinza: mesmo valor em todos os níveis = sem hierarquia.

## 4. Texto no frame
- Título e frase principal em **tinta** (`--text`). **Nunca cinza.**
- Contraste ≥ **4,5:1** (meta ≥ 7:1 em título); palavra de destaque em título grande ≥ 3:1. `node tools/contrast.mjs <cor1> <cor2>`.
- Texto sobre cor clara/quente da marca (coral, amarelo, verde-claro) quase sempre pede **texto escuro**. Ex.: branco sobre #ef7960 = 2,8:1 (reprovado); #2b2b2b = 5,1:1.
- **No máximo 1 ênfase por título**, na palavra-chave, pela cor de destaque ou peso. Nunca cores aleatórias.
- Mínimos em 1080 px de largura: título ≥ 64–72 px · apoio ≥ 36–40 px · rótulo de UI ampliado ≥ 28 px.
- 1 família (máx. 2: display + neutra). Leading: título 1,0–1,15, corpo 1,35–1,6. Tracking: título grande −0,01 a −0,03 em; CAIXA ALTA +0,02 a +0,08 em. Default sem caixa alta. Detalhes em `texto-e-dados.md`.
- Quebra por sentido: nunca separar "R$ / 129" nem deixar palavra curta sozinha. Kerning em título-herói (AV, To).
- Se o texto não cabe no tempo de leitura, **corte, resuma ou divida** antes de animar (`ritmo.md`).
- Legibilidade sobre imagem, nesta ordem: reposicionar → scrim/gradiente local → desfoque/escurecimento local → forma de fundo → mudar a cor. Sombra pesada nunca primeiro. Não cobrir rosto, objeto principal ou ação.

## 5. Composição
- **1 elemento dominante por frame.** Teste do relance: o olho acha primeiro o mais importante? Senão, reajuste escala, peso, contraste ou posição (não tudo ao mesmo tempo).
- Caminho do olhar (headline → dado → explicação → detalhe) define a ordem da animação (`movimento.md`).
- Cada elemento tem função; decoração por último. **Espaço negativo é elemento**: não preencha com ícone, partícula ou textura. Não centralize tudo por hábito. Proximidade antes de caixas e bordas.
- Grid invisível (margens, colunas); alinhamento exato. Alinhamento óptico em play, triângulos, "A/V/O" e logos.
- Spacing em escala `--space-1..6` (ex.: 8 · 16 · 24 · 40 · 64 · 104 px em 1080), com as mesmas relações em todo o vídeo.
- Formas: mesmo raio (`brand.css`) em equivalentes; uma espessura de contorno (1,5 px em ícone de 24 px, proporcional); ícones de uma família. Texto simples > ícone decorativo.
- Sombra: 1 direção de luz no vídeo todo, níveis `--shadow-sm/md/lg`. Glow só justificado. Desfoque de profundidade em sistema frente / sujeito / fundo.
- Partícula, faísca e confete só como resposta a gesto (pago, enviado), nunca enfeite (`efeitos.md`).
- Densidade: informação pesada entra em etapas (título → dado → comparação → conclusão). Complexidade proporcional: só o momento-herói recebe elaboração.
- **Na dúvida, remova antes de adicionar.**

## 6. Processo antes de animar
1. Direção de arte vem do `BRAND.md`: o motion estende a marca no tempo, não inventa outra (`direcao.md`).
2. **Style frames:** 2–3 frames-chave estáticos fixam composição, tipo, cor, formas e tratamento **antes** de animar.
3. **Quadro mais cheio:** desenhe também o estado com todos os elementos; o sistema tem que aguentar o pior caso.
4. Design system do vídeo (títulos, legendas, lower thirds, números, callouts, cartão final): resolva uma vez e reuse (`companies/<slug>/video-templates/`). Não misture linguagens.
5. Polimento: revise ampliado e depois em tamanho real de celular. O vídeo vale o componente menos resolvido.

## 7. QC do frame
- [ ] Hierarquia: 1 dominante, sei onde olhar no relance?
- [ ] Texto-chave dentro da área segura; capa legível na faixa 3:4 (1080×1440); 80 px no 4:5?
- [ ] Fundo liso; toda cor com significado; destaque raro?
- [ ] Nenhum título/frase em cinza; contraste ≥ 4,5:1?
- [ ] No máximo 1 ênfase por título?
- [ ] Spacing, alinhamento e quebras deliberados (sem distância acidental)?
- [ ] Mesmo sistema (raio, contorno, ícones, tipo) e mesmo título nos formatos de 1080?
- [ ] Style frames e quadro mais cheio aprovados; dá para remover algo? Se o frame depende da animação para ficar interessante, volte ao design.
