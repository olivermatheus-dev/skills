# Direção de arte para carrosséis minimalistas de marca (1080×1350)

Pesquisa de 2026-10-09 para a tarefa 049. Objetivo: transformar "carrossel genérico" em regras numéricas de skill e rubrica de crítica.

**Como ler a confiança.** Cada regra vem marcada:
- **[F]** = fonte citada, número verificado na fonte.
- **[P]** = prática de mercado/convenção de design system; fonte secundária ou síntese minha.
- **[S]** = proposta minha, derivada das fontes, para o nosso sistema. Vale como padrão a testar, não como fato.

Limites da pesquisa: não consegui abrir as páginas do Apple HIG, Material 3 nem do artigo de dicas de carrossel (403 ou página vazia). Os números do HIG e do Material abaixo vêm do meu conhecimento prévio e estão marcados [P]. Os guias de carrossel achados são quase todos de fornecedores de ferramentas; são consenso de prática, não dado medido. Nenhuma fonte achada mede o efeito de capa/CTA em salvamentos.

---

## 1. Grid e espaçamento em 1080×1350

**Formato.** 1080×1350 (4:5). O Instagram corta os slides seguintes para a proporção do primeiro, então todos devem ter a mesma. A grade do perfil hoje mostra 3:4; quem se preocupa com isso mantém o conteúdo crítico centralizado e testa em 1080×1440. [F: moda.app, decktopus, mergeimages (links ao fim)]

**Margens (proposta).**
- Margem externa: **96 px** laterais e **96 px** topo/base, com o rodapé (índice, handle) dentro dessa área. Equivale a 8,9% da largura. [S]
- Mínimo absoluto: **60 px** lateral / **75 px** vertical (zona segura 960×1200 que um guia cita); abaixo de 40–50 px o texto encosta na borda e no corte da grade. [F: guias de carrossel]
- Zona de texto efetiva: 888×1158 px. Todo texto e ícone fica dentro; só fundo, foto e elementos decorativos sangram.

**Colunas.** 6 colunas, gutter **24 px**, margens de 96 px: coluna = (888 − 5×24)/6 = **128 px**. Alternativa de 4 colunas (gutter 24 px → coluna 204 px) para layouts mais arejados. Regra Müller-Brockmann: grid modular, texto alinhado à esquerda e solto à direita, assimetria e espaço vazio como elemento ativo. [F: Wikipedia Swiss Style; Müller-Brockmann]

**Escala de espaçamento.** Base 8 px, escala fixa: **8, 16, 24, 32, 48, 64, 96, 128, 192**. Refactoring UI recomenda escala fixa quase linear em vez de valores soltos, e começar com espaço demais e tirar depois. [F/P: resumos de Refactoring UI]
- Espaço **dentro** de um grupo (título ↔ subtítulo): 16–24.
- Espaço **entre** grupos: 64–96. Regra: espaço entre grupos ≥ **2,5×** o espaço interno, senão a proximidade não agrupa. [S]
- Agrupe com espaço antes de usar linha divisória. [F: Refactoring UI]

**Baseline.** Linha-base de **8 px**: todo line-height de texto em múltiplo de 8 (ex.: corpo 40/56; título 120/120). Não precisa de baseline grid rígido; basta que alturas de bloco e espaços caiam na escala. [S]

**Escala tipográfica.** Poucos degraus, razão grande, porque o slide tem 3–4 níveis (Refactoring UI: 2–3 tamanhos por componente; para 3–4 níveis usar razão larga 1,25–1,414). [F: fontes de escala modular]

Proposta com base 36 px e razão **1,5** (quinta justa), arredondada ao múltiplo de 4:

| Papel | Tamanho | Peso | Entrelinha | Tracking |
|---|---|---|---|---|
| Número/destaque gigante | 360–520 | 500–600 | 0,85–1,0 | −0,04em |
| Título de capa (display) | 120–144 | 600 | 1,0–1,05 | −0,03em |
| Título de slide | 80–96 | 600 | 1,05–1,1 | −0,02em |
| Subtítulo / lead | 48–56 | 400 | 1,25 | −0,01em |
| Corpo | 36–40 | 400 | 1,4 | 0 |
| Legenda / nota | 28–30 | 400–500 | 1,4 | 0 a +0,01em |
| Rótulo (eyebrow, índice) | 24–26 | 500–600 | 1,2 | +0,08 a +0,12em, CAIXA ALTA |

Justificativas:
- Mínimo de corpo: guia de carrossel fala em "mínimo 60 px"; para título isso vale, para corpo ~36 px já lê a 33% do zoom. **Teste: reduzir o slide a 33% e conferir que o título ainda lê.** [F para o teste; S para os tamanhos]
- Entrelinha: Butterick 120–145% do corpo; Refactoring UI 1,5–1,75 corpo web, 1,2–1,3 título; títulos grandes 1,0–1,1, e 1,1 como piso para títulos de mais de uma linha (descendentes cortam em 1,0). Usar valor sem unidade. [F]
- Tracking: Butterick manda **+5% a +12%** em caixa alta; Refactoring UI +0,05 a +0,1em; display grande fica entre −0,02 e −0,04em (o intervalo de display vem de resumos secundários, é convenção). Nunca tracking negativo em texto pequeno. [F para caixa alta; P para display]
- Largura de linha: Butterick 45–90 caracteres. Em carrossel o texto é curto; alvo **25–40 caracteres por linha** no corpo e **≤ 18 por linha** no título (quebre à mão em frases, evite viúva de uma palavra). [F para 45–90; S para o resto]
- Peso: evite 300 e 800+ (leitura ruim); use 400 corpo, 500–600 título. Weight-contraste: usar só 2 pesos por slide. [F/P: Refactoring UI, HIG]
- Caixa alta só em menos de uma linha de texto (Butterick). Ou seja: só rótulos. [F]

---

## 2. Hierarquia

**4 níveis, nunca mais**, cada um separado dos outros por pelo menos 2 sinais (tamanho, peso, cor, caixa):
1. **Âncora** (1 por slide): título, número ou citação. 70%+ do "peso visual".
2. **Apoio**: subtítulo/corpo, razão de tamanho âncora:apoio ≥ **2:1** (ex.: 96 → 44).
3. **Rótulo**: eyebrow em caixa alta com tracking, 24–26 px, cor de acento ou 60% de opacidade.
4. **Metadados**: índice "03/08", handle, seta. 22–24 px, 40–50% de opacidade.

Regras:
- Hierarquia = combinação de sinais (tamanho, peso, cor, espaço), não só tamanho. Diminuir o secundário vale tanto quanto aumentar o primário. [F: Refactoring UI]
- **Teste do aperto de olho:** desfocar/reduzir a 33%; deve restar uma leitura de 1 entrada → 1 apoio. Se duas coisas competem, rebaixar uma. [F: Refactoring UI squint test]
- **Eyebrow/kicker:** 1 por slide, acima do título, 16–24 px de distância, formato "01 — CONTEXTO" ou categoria. Serve também para quem salva e reabre semanas depois, fora de contexto. [F: guias de carrossel recomendam rótulos de seção]
- **Numeração:** "1/7" ou "01" em todo slide menos a capa; mostra progresso e estimula deslizar. [F]
- **Rodapé:** uma linha fixa a 96 px da base: handle à esquerda, índice à direita, mesma posição em todos os slides. Na capa, sem marca (a marca vai no último slide). [F: guias dizem marca no final]
- **1 ideia por slide;** se o texto não lê confortável no celular, o slide tem coisa demais. [F]
- **Limites de texto:** capa ≤ 10 palavras (guia citado); slides de conteúdo ≤ 35 palavras; título ≤ 12 palavras. [F para 10; S para o resto]

---

## 3. Camadas e detalhes finos

O que separa "gerado" de "desenhado": profundidade em 3–4 planos e microdetalhes consistentes. Receita:

**Planos (de trás para frente):** (1) fundo sólido; (2) textura/grão ou forma grande de 4–8% de contraste; (3) card/imagem/UI; (4) texto; (5) microdetalhes (hairline, rótulo, índice).

- **Hairlines:** 1 px (em export 1080 pode ser 2 px para sobreviver à compressão), cor = texto a 12–16% de opacidade no claro, branco 14–18% no escuro. Usar para: separar rodapé, delimitar cards, regras entre itens de lista. [P/S]
- **Cantos:** um único raio-base. Proposta **24 px** em cards, **12 px** em chips/botões, **999** em pílulas; raio de elemento interno = raio externo − padding (cantos concêntricos). Nunca misturar cantos retos e arredondados no mesmo slide. [P/S]
- **Cards sobrepostos:** cards com 24–32 px de padding, sobrepostos em 15–25% da área, deslocados 24–48 px, rotação 0° (ou ≤ 2° no máximo). Mostrar 2–3 níveis de profundidade, não 5. [S]
- **Sombras em camadas:** uma luz global, mesma razão de offset em todas as sombras; quanto mais alto o elemento, maior o offset e o blur e menor a opacidade; pilha de camadas dobrando offset/blur. Exemplo verificado: `0 1px 1px, 0 2px 2px, 0 4px 4px, 0 8px 8px, 0 16px 16px` a 0,075 de opacidade cada. Não usar preto puro: manter o matiz do fundo e baixar saturação/luminosidade. [F: Josh Comeau, joshwcomeau.com/css/designing-shadows]
- **Grão/ruído:** overlay em todo o slide, opacidade **3–8%** (uma fonte de componente fala em 5–15%; ficamos no piso por ser marca calma), blend `soft-light` ou `overlay`, ruído SVG `feTurbulence` (baseFrequency 0,8–0,9). Serve para tirar o aspecto de "flat digital" e esconder banding. Teste: no celular não deve ser visível como textura, só sentido. [F para o intervalo geral e blend; S para 3–8%]
- **Molduras e marcas:** moldura fina de 1 px a 32–48 px da borda do slide (inset), com marcas de registro "+" de 16 px nos cantos ou nas interseções, são um recurso editorial barato que sinaliza "desenhado". Use em no máximo 1 de cada 3 slides. [S]
- **Rótulos pequenos:** caixa alta, 22–26 px, +8 a +12% de tracking, opacidade 60%. Ideal em cantos opostos (esquerda-topo: categoria; direita-topo: índice). [F: tracking; S: uso]
- **Ícones:** só em linha (Lucide), traço 2 px a 48 px (escala proporcional), cor de texto ou de acento, dentro de cartão ou chip de 96–120 px. Nunca emoji, nunca mistura de família. (regra já em BRAND)
- **Ornamentos tipográficos:** aspas gigantes (240–320 px) a 12–20% de opacidade atrás da citação; travessão e numerais em tabular; seta "→" como pista de deslize. Máximo 1 ornamento por slide. [S]
- **Continuidade entre slides / panorama:** desenhar uma tela larga de N×1080 de largura (3 slides = 3240, 5 = 5400), colocar uma linha, forma, card ou foto cruzando a emenda e fatiar. Regra: nenhum texto na emenda; o elemento atravessa por **120–240 px** para dar pista de deslize; mesmo fundo dos dois lados. Confirmar no celular se a emenda aparece. [F: fstoppers, krumzi, ivorymix]
  - Uso moderado: 1 a 2 ligações no carrossel (capa→2 e penúltimo→último), não em todos. Um elemento "vazando" da borda direita da capa é a pista de deslize mais barata. [S]

---

## 4. Variação visual sem perder o sistema

**Sistema = o que NUNCA muda:** grid, margens, família tipográfica (1 família, no máximo 2), raio de canto, estilo de ícone, posição do rodapé/índice, paleta de 3–4 cores, estilo de sombra.
**Variação = o que muda:** layout, fundo (entre 3 variantes), escala da âncora, proporção de espaço vazio, tipo de elemento visual (número, card, ícone).

**Catálogo de layouts (8–10).** Cada um é um template com regras próprias:
1. **Capa:** título display 120–144 px ocupando 3–4 linhas no terço inferior ou centro-esquerda; eyebrow; um elemento gráfico; dica de deslize.
2. **Split vertical 50/50 ou 40/60:** metade de cor sólida, outra com texto/imagem.
3. **Full-bleed de cor sólida:** só uma frase de 80–120 px com muito espaço (respiro); o slide mais "vazio" do carrossel.
4. **Número gigante:** numeral 360–520 px ocupando 40–50% da altura; legenda de 1–2 linhas; ideal para dado ou passo.
5. **Citação:** aspas ornamentais, texto 64–72 px, atribuição em rótulo.
6. **Lista (3–5 itens):** linhas separadas por hairline, número tabular à esquerda, 96–128 px por item.
7. **Comparação antes/depois:** 2 colunas ou 2 cards com fundo diferente (claro/escuro); rótulos "ANTES / DEPOIS".
8. **Detalhe/zoom:** recorte ampliado (150–250%) de um print da UI, com moldura fina e anotação.
9. **Card de UI:** print/mockup num card com sombra em camadas e raio 24 px, texto curto ao lado ou abaixo.
10. **Diagrama:** 3–5 nós, linhas de 2 px, rótulos em 26 px; sem decoração.

**Regras de ritmo:** [S, a partir das práticas de carrossel]
- **Nunca o mesmo layout em dois slides vizinhos;** o mesmo layout pode voltar após ≥ 2 slides. Pelo menos **4 layouts diferentes** em 7–8 slides.
- Alternar **densidade:** pesado (card/diagrama/lista) → leve (frase solta/número) → médio. Depois de dois slides densos, um de respiro.
- Alternar **fundo**: padrão claro (papel) → escuro → cor de marca → claro. Máximo 2 slides seguidos com o mesmo fundo; 1 slide de cor de marca a cada 3–4.
- Slide de respiro (full-bleed de cor, uma frase) a cada **3–4 slides**.
- Mover a âncora: alinhar título no topo num slide, na base noutro (sempre na mesma grade de colunas), em vez de centralizar tudo.
- Conteúdo forte nos primeiros slides (queda de swipe ao longo do carrossel). [F: guias]

---

## 5. Cor

**Fundos sólidos por padrão.** Gradiente de fundo cobrindo o slide é o sintoma de "gerado"; marcas de referência (Linear, Stripe, Apple) usam superfícies planas e deixam gradiente para um **ponto de luz localizado**. [P/S — não consegui fonte para a leitura específica do gradiente nessas marcas; é observação de prática]
- **Gradiente aceitável:** (a) glow radial localizado atrás de um card/ícone, ≤ 30% da área, 2 tons do mesmo matiz com diferença de luminosidade ≤ 8–10 pontos; (b) 1 por carrossel como "peça especial", não em todos; (c) nunca em texto corrido. [S]
- Linear migrou a geração de temas de HSL para **LCH** por consistência perceptual e subiu o contraste dos temas; vale usar OKLCH/LCH ao escolher tons de fundo para manter luminosidade previsível. [F: linear.app/now/how-we-redesigned-the-linear-ui]

**60-30-10.** Dominante ~60% (neutro: papel/off-white), secundário ~30% (escuro ou tom de apoio), acento ~10% (1 cor, em elementos importantes). Percentuais aproximados; a função é limitar a paleta e dar hierarquia. [F: freeCodeCamp, uxcel, welsh design]
- Aplicação no carrossel: ao longo do conjunto, ~60% dos slides em fundo neutro claro, ~30% em fundo escuro/apoio, ~10% (1 slide) em cor de marca cheia.
- Dentro do slide: acento só em **1–2 elementos** (numeral, eyebrow, ícone, sublinhado), nunca em parágrafo.

**Contraste.** WCAG: texto normal ≥ **4,5:1**; texto grande ≥ 3:1 (≥ 24 px regular ou 18,66 px negrito); ícones e bordas informativas ≥ 3:1. [F: W3C WCAG 2.2]. Para o carrossel: corpo ≥ 4,5:1, título ≥ 7:1 (alvo de nitidez em celular). Hairlines são decorativas (exceção). Já existe `node tools/contrast.mjs`.

**Contexto saúde mental.** Headspace foge do clichê azul/verde com uma laranja ownable, formas arredondadas e paleta por humor (calmo = azul suave + verde sálvia; foco = laranja); evitam preto e branco puros. Aprendizado: para terapeutas, **neutros quentes (off-white, areia) em vez de branco puro; texto em quase-preto quente em vez de #000; 1 acento** em vez de gradientes arco-íris. [P: blakecrosley.com guide, kimp.io; hex divergem entre fontes, não copiar]

---

## 6. Capa e último slide

**Capa (para o scroll).** Consenso de vários guias: a capa é o ativo mais importante; decide em menos de 1 segundo; abrir com afirmação específica, número ou pergunta; contraste texto/fundo máximo; sem logo; escrever o título por último. [P: PostNitro, Zoviz, BrandGhost, mergeimages — fornecedores]

Padrões de capa minimalista que funcionam:
1. **Título tipográfico enorme:** 120–144 px, 3–4 linhas, alinhado à esquerda, na grade de colunas; 45–60% da área é espaço vazio; 1 palavra em cor de acento ou itálico.
2. **Número + promessa:** "7" em 400 px + frase de 56 px.
3. **Card único flutuante:** print de UI num card com sombra em camadas, título acima.
4. **Citação/afirmação incômoda** em fundo de cor cheia.
5. **Elemento atravessando a borda direita** como pista de deslize + índice "01/08" ou "→".

Regras: ≤ 10 palavras; um único ponto focal; eyebrow opcional; teste a 33% do tamanho, o título ainda lê.

**Último slide (CTA).** Slide anterior resume o ganho (a recompensa por terminar). CTA único, específico ao tipo de conteúdo: educativo → "salve"; identificação → "envie para alguém"; opinião → "comente". Inclui handle e convite a seguir; o logo entra aqui. Layout: título de CTA 72–96 px, 1 botão/pílula (altura 96–120 px, raio 999) ou seta, fundo de cor de marca (o slide de ~10% do 60-30-10). Um CTA só; sem 3 pedidos. [P]

---

## 7. Como designers criticam, e rubrica de QA

**Arcabouço.** CRAP (Contraste, Repetição, Alinhamento, Proximidade) de Robin Williams, usado como lista de verificação para criar e criticar; mais hierarquia como resultado. [F: Andrew Heiss, talks.andrewheiss.com/2021-gpl/01_graphic-design/slides/02_crap-design.pdf]. Pergunta de abertura de crítica profissional: "o que o olho vê primeiro, depois, e por último?" e "isso comunica a mensagem pretendida?".

**Rubrica proposta (0–4 cada; reprovar se qualquer item < 2 ou média < 3,0).** [S, baseada em CRAP + Refactoring UI]

| # | Critério | 4 pontos se... | Teste objetivo |
|---|---|---|---|
| 1 | Hierarquia | 1 âncora clara, 3–4 níveis, razão âncora:apoio ≥ 2:1 | 33% de zoom: dá para ler a âncora e achar o apoio |
| 2 | Contraste | corpo ≥ 4,5:1, título ≥ 7:1, diferenças de peso/cor deliberadas | `tools/contrast.mjs` |
| 3 | Repetição | rodapé, raio, ícones, paleta idênticos em todos os slides | sobrepor slides: elementos fixos coincidem |
| 4 | Alinhamento | ≤ 4 linhas de alinhamento verticais por slide; tudo na grade 6 col/margem 96 | guias visíveis, contar bordas esquerdas |
| 5 | Proximidade | espaço entre grupos ≥ 2,5× o interno | squint test |
| 6 | Equilíbrio / espaço negativo | ≥ 35% da área zona de texto vazia na maioria dos slides; ≥ 50% na capa | binarizar: proporção de pixels de fundo |
| 7 | Consistência com variedade | ≥ 4 layouts distintos em 8 slides; nenhum par vizinho igual | lista de layouts por slide |
| 8 | Acabamento | hairlines, cantos concêntricos, sombra em camadas, grão ≤ 8% | zoom 100% em 3 pontos |
| 9 | Ritmo do conjunto | fundo alterna; respiro a cada 3–4; ≤ 2 fundos iguais seguidos | tira de miniaturas lado a lado |
| 10 | Função (capa/CTA) | capa ≤ 10 palavras, CTA único, sem marca na capa | lista |

**Checklist de QA visual (passar antes de entregar).**
1. Todos os slides exatamente 1080×1350; texto dentro da zona segura (96 px).
2. Miniaturas lado a lado a 20%: ritmo de fundo e de densidade visível; nenhuma repetição vizinha.
3. Zoom 33%: título da capa lê; cada slide tem uma entrada clara.
4. Zoom 100%: sem texto cortado, sem viúva de uma palavra, sem quebra feia; hairlines nítidas.
5. Contraste medido; nenhum texto sobre gradiente ou foto sem camada de apoio.
6. Cores: ≤ 1 acento por slide; gradiente só se for o slide especial; grão ≤ 8%.
7. Elementos fixos (rodapé, índice, marca) nas mesmas coordenadas em todos os slides.
8. Emendas de panorama: sem texto na emenda; checar no celular.
9. Sombras: mesma direção de luz em todo o conjunto.
10. Texto: 1 ideia por slide, ≤ 35 palavras, pt-BR, sem número inventado.

**Sinais de "genérico" a reprovar de pronto:** mesmo layout em todos os slides; gradiente de fundo cobrindo o slide; fundo e card com a mesma cor; texto centralizado em tudo; sem rótulo/índice; sombra única de preto puro; 3+ tamanhos de título parecidos (ex.: 64, 72, 80 sem razão).

---

## Resumo acionável para a skill `carousel`

1. Fundo sólido por slide, alternando 3 variantes (papel, escuro, marca); gradiente só como glow local em 1 slide.
2. Margem 96, grid 6 colunas, escala 8 px, escala de texto da tabela, 4 níveis de hierarquia.
3. Sempre: rodapé fixo, índice "0N/0M", eyebrow em caixa alta com tracking.
4. Camadas: grão 3–8%, hairline 1–2 px, cartões com sombra em camadas, raio-base 24 px.
5. Catálogo de 8–10 layouts, nunca repetir nos vizinhos, respiro a cada 3–4 slides.
6. Capa ≤ 10 palavras sem marca; CTA único com marca no último.
7. Rubrica de 10 critérios + checklist com testes objetivos.

---

## Fontes

- Butterick, Practical Typography: https://practicaltypography.com/summary-of-key-rules.html · https://practicaltypography.com/line-length.html
- Josh Comeau, designing beautiful shadows: https://www.joshwcomeau.com/css/designing-shadows/
- Refactoring UI (resumos secundários): https://cdn.jsdelivr.net/npm/claude-code-skills@0.5.0/data/skills/ux-ui-design-system/references/refactoring-ui.md · https://playbooks.com/skills/wondelai/skills/refactoring-ui (livro: Wathan e Schoger)
- Andrew Heiss, CRAP: https://talks.andrewheiss.com/2021-gpl/01_graphic-design/slides/02_crap-design.pdf
- Swiss Style: https://en.wikipedia.org/wiki/Swiss_Style_(design) · Müller-Brockmann, *Grid Systems in Graphic Design* (1981)
- Linear (cor LCH, contraste): https://linear.app/now/how-we-redesigned-the-linear-ui
- WCAG 2.2 Understanding: https://www.w3.org/WAI/WCAG22/Understanding/
- Panorama: https://fstoppers.com/social-media/how-create-seamless-carousel-instagram-431677 · https://www.krumzi.com/blog/seamless-instagram-carousel · https://ivorymix.com/how-to-create-seamless-instagram-carousels/
- Tamanho/zona segura: https://moda.app/resources/sizes/instagram-carousel · https://www.decktopus.com/blog/instagram-carousel-size-dimensions · https://mergeimages.net/blog/instagram-carousel-design-tips-2026
- Capa/CTA: https://postnitro.ai/blog/post/instagram-carousel-design · https://zoviz.com/blog/instagram-carousel-design-tips-saves-shares · https://blog.brandghost.ai/posts/instagram-carousel-design-guide/
- 60-30-10: https://www.freecodecamp.org/news/the-60-30-10-rule-in-design/ · https://uxcel.com/blog/mastering-the-60-30-10-rule-in-design-691
- Escala modular: https://cieden.com/book/sub-atomic/typography/different-type-scale-types · https://madegooddesigns.com/type-scale-calculator/
- Headspace: https://blakecrosley.com/guides/design/headspace · https://www.kimp.io/headspace-brand/
- Grão: https://www.framer.com/marketplace/components/noise-grain-texture · https://bushe.co/tools/css-noise-grain-overlay/
- Material 3 spacing e Apple HIG typography (não consegui ler as páginas; números dessas fontes aqui são de memória): https://m3.material.io/foundations/layout/understanding-layout/spacing · https://developer.apple.com/design/human-interface-guidelines/typography
