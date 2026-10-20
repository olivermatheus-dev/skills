# Crítica 1 · C0002-fixado-dor (raiz)

**Veredito:** limpo e fiel ao app, mas o miolo é "título no topo + card embaixo" repetido. O motivo das 5 ferramentas muda de conjunto no meio e encolhe justo no destino. **Nota ponderada 2,20 / 4. Não passa** (precisa de ≥ 3,0 e nenhum critério abaixo de 2).

Check: 0 ✗ · 18 ⚠. Os avisos de contraste marcados como exceção de marca ou de UI foram aceitos como decisão aprovada. Pesam aqui: 3 pares de fundos vizinhos que não se distinguem (s1–s2, s2–s3, s6–s7) e o s8 com 57 palavras.

## Notas por critério

| critério | peso | nota | evidência (slide e região) |
|---|---|---|---|
| 1 Originalidade | 3 | 2 | Só este carrossel teria três coisas: a capa (5 cards de ferramenta + balão do paciente), o s3 (os 4 gestos das 19h50 em cards) e o s9 (card de envio com avatares). O resto sai de template: s2 e s7 são o mesmo split "título no campo de cima, corpo e ícones embaixo"; o s4 se chama zoom, mas é uma moldura creme no terço central com o balão do mesmo tamanho da capa. |
| 2 Qualidade visual | 3 | 2 | Na folha de contato a 20%, s1–s4 viram uma faixa pálida contínua. O s6 tem a metade de cima vazia. O s8 tem 5 andares empilhados (título, ícones, fios, card, legenda e apoio) e nenhum respira. Os slides que param o scroll são s1, s5 e s9. |
| 3 Hierarquia | 2 | 2 | Entrada clara no s1, no s5 (numeral) e no s9. No s3, o título de 4 linhas (terço superior) e a pilha (terço médio) pesam o mesmo. No s4, a entrada é o título e não o balão, que deveria ser o herói. O s8 tem 5 níveis (título, ícones, saudação "Clara", "EM 10 MIN", apoio). |
| 4 Ritmo e variação | 2 | 2 | 8 famílias no nome, mas a âncora fica no terço superior esquerdo em s3, s4, s5, s8 e s9. s3→s4→s5 é a mesma batida: título de 2 a 4 linhas em cima e objeto embaixo. O s2 e o s7 são gêmeos. Fundos sem distinção na miniatura em s1–s2, s2–s3 e s6–s7 (check). |
| 5 Camadas e detalhe | 2 | 3 | Os cards têm borda #ece4dc, sombra tingida e tile de ícone com fundo semântico. O card do app no s8 tem barra lateral, divisória, card interno, avatar e botão: profundidade real, com função. Plano demais no s2 (texto + régua de 84 px), no s6 (só texto) e no s7. |
| 6 Espaço e equilíbrio | 2 | 2 | Sobra sem intenção no s2 (terço inferior y 1075–1240, ocupação 32%), no s7 (direita dos ícones, y 1050–1170) e no s4 (faixa morta y 345–515 entre o título e a moldura). O vazio do s6 (metade superior) é declarado como pausa e funciona. |
| 7 Tipografia | 2 | 2 | Montserrat 700 bem assentada e entrelinha certa. Mas: no s2, o apoio quebra "está em / volta delas" no meio do sintagma. "outro paciente quer" (s4, linha 2) e "Dá para atender com" (s8, linha 1) têm 19 caracteres, acima do limite de 18. No s5, o apoio de 44 px ao lado do numeral disputa com o título de cima. |
| 8 Marca e cor | 2 | 2 | Visual do app respeitado: creme, cards brancos, coral em pontos, nada escuro. Mas a ênfase aparece em s1 (serifa "atender."), s3 ("19h50." em coral, não declarado no slides.json) e s8 (serifa). s1→s3 fere a regra de no máximo 1 ênfase a cada 3 slides. |
| 9 Capa e CTA | 1 | 3 | No 1:1 (y 135–1215), tudo cabe na zona y 222–1140: título 108 px legível na miniatura, ênfase lida, "arraste" fora do quadrado. CTA único no s9, sem "arraste". |
| 10 Craft e legibilidade | 1 | 3 | Check sem ✗. Margem de 96 px respeitada em todos os slides, nada cortado, rótulos "conversa ilustrativa", "dados ilustrativos" e "nomes ilustrativos" presentes. |

Cálculo: (2×3 + 2×3 + 2×2 + 2×2 + 3×2 + 2×2 + 2×2 + 2×2 + 3×1 + 3×1) ÷ 20 = 44 ÷ 20 = **2,20**.

## Isto é específico deste produto?
Só a kz teria a cena das 19h50 com os 4 gestos (s3), a tela "Boa tarde, *Clara*" com "Iniciar sessão" (s8) e o pedido de envio para a colega (s9). Esse é o núcleo, e é bom.
Qualquer SaaS teria o s2, o s6 e o s7 (frase em bloco de cor com ícones miúdos), o s4 (título em cima de um print emoldurado) e o funil "5 ícones com fios num card" do s8.

## Problemas (P0 → P3)

**P1 · s8, terço médio (o destino).** Pelo plano, o card do app ocupa 60% do slide. Na tela, ele tem 886×470 px, cerca de 29% da área, espremido entre o título, a fileira de ícones com fios (y 390–540) e o apoio com a legenda (y 1030–1175). Com 57 palavras, o fecho do motivo pesa pouco mais que o s3 e lê como diagrama de funil, não como "5 viram 1". Correção: **ligar + mais ousado**.
- Trazer os 5 tiles para dentro do card, como fileira de abas na borda superior. Os fios saem.
- Reescalar o card para ocupar y ~330–1120.
- **Destilar**: barra lateral só com ícones, sem os 5 rótulos de menu.
- Cortar o apoio para no máximo 1 linha. Quem decide o texto é o roteirista.
- Acerto de coerência: o card diz "Boa tarde" e "15:00 — 15:50", e a história é das 19h50 para a sessão das 20h. Use "Boa noite" e 20:00–20:50, que mantém o "EM 10 MIN".

**P1 · s4, slide inteiro (o zoom que não amplia).** O balão tem ~660 px de largura, quase a mesma escala da capa, e está dentro de uma moldura creme com os cards "Agenda" e "Caderno", que são da capa e não da pilha do s3. O slide é uma versão menor do s1. Também repete o molde do s3 e do s5 (título de 3 linhas no terço superior, objeto embaixo). Correção: **recompor**.
- O balão vira o herói: largura x 96–984, centro na altura de y ~600, texto da mensagem ≥ 64 px.
- O título desce para o terço inferior. Com isso, o slide quebra a sequência de âncoras no topo em s3–s4–s5.
- **Destilar** a moldura creme e os cards da capa.
- Atrás do balão, 2 cards de gesto do s3, inteiros e em escala menor, com o mesmo texto e ícone, para provar que ele "caiu por cima da pilha".

**P1 · s5, faixa inferior (régua y 1060–1185).** O argumento é "são cinco", mas a régua mostra outro conjunto: "Agenda, Link, Caderno, Planilha, Mensagem". Não tem Meet; "Link" usa o ícone de balão do WhatsApp; "Mensagem" é um ícone novo. Em s1, s2, s7 e s8, os 5 são Agenda, WhatsApp, Meet, Caderno e Planilha. A persona conta e não fecha. Correção: **ligar**.
- Os 4 primeiros itens saem dos cards do s3, com os mesmos ícones e as mesmas palavras.
- O 5º é o mini-balão do paciente, com o ponto coral, no lugar de um ícone genérico.
- Se o plano mantiver "5 ferramentas" no s8, alinhar o apoio do s8, que lista 4 itens e não cita planilha.

**P1 · s2 e s7, metade inferior (gêmeos pálidos com o motivo em miniatura).** Os dois usam o mesmo split: frase no campo de cor em cima, corpo e fileira de tiles de ~84 px no canto inferior esquerdo, com sobra embaixo. Os fundos colam nos vizinhos (check: s1–s2 ΔL 2, s2–s3 ΔL 3, s6–s7 ΔL 2). Correção:
- **Recolorir**: inverter o split nos dois. Campo do título em branco, fundo do slide em tom-200. Assim cada um se distingue do vizinho claro.
- **Mais ousado** no motivo do s2: régua com tiles de ~150 px ocupando a largura útil (x 96–984), apoiada na base do texto e sem sobra abaixo.
- **Mais ousado** no motivo do s7: "empilhando ferramentas" vira uma pilha torta de verdade (tiles de ~180 px) no terço inferior direito, ocupando o vazio de hoje.
- Depois, rodar o check para confirmar que nenhum ⚠ de vizinho apareceu.

**P2 · s3, terço superior (ênfase não declarada).** "19h50." em coral bold é ênfase de cor dois slides depois da serifa da capa (s1→s3), e a regra da marca é no máximo 1 a cada 3. O slides.json declara `enfase: null` no s3. Correção: **mais quieto**. Recolorir "19h50." para --text e manter a linha própria e a escala. A ênfase da peça fica no s1 e no s8.

## Manter
1. A capa como está: título 108 px, "atender." em serifa itálica coral, cards do app e balão, tudo dentro do 1:1. Ajuste fino só se pedido: a escada de cards lê mais como lista ordenada do que como caos. Fica registrado, sem mudança.
2. O s3: 4 gestos, um por card, com o ícone da ferramenta. É a cena que a persona reconhece.
3. O s9: card de envio com avatares, botão "Enviar" e "nomes ilustrativos". CTA único, específico e no visual do app.

## Resposta do implementador (v2)
- Aplicados todos os P0/P1/P2: s2 e s7 invertidos (campo branco, slide tom-200, tiles 150 px na régua do s2, pilha torta de 180 px no s7); s4 recomposto (balão 888 px com texto de 64 px, título no terço inferior, 2 cards de gesto do s3 atrás, moldura e cards da capa removidos); s5 com a régua do s3 (Agenda, WhatsApp, Caderno, Planilha) + balão do paciente; s8 com as 5 abas dentro do card (fios removidos, barra lateral só com ícones, card 888×720, "Boa noite", 20:00 — 20:50, apoio cortado para "É para isso que a kz existe."); s3 "19h50." sem coral.
- Ajustes extras para o check dos fundos vizinhos (a inversão do s2 criou Δ<4 com s1 e s3): s2 campo 46%, s4 passou de branco para tom-200, s5 de tom-200 para branco (slides.json atualizado).
- Recusado: nada. Passada de subtração: saíram a hairline do s5, o "+ Outra" do s9 e a linha "Terça-feira · 4 sessões agendadas" do s8.
