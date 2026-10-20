# Crítica 3 · C0004-fixado-duvidas · v3/

**Veredito:** sistema coerente e fiel ao app, mas o molde faq ainda está frouxo: há um vão morto no meio do campo, alguns cards estão meio vazios e o destino do s2 está fraco. **Nota ponderada 2,30 / 4 · não passa** (precisa de ≥ 3,0).

Base: `check.mjs` com 0 ✗ e 19 ⚠ (os de contraste são exceção aprovada; sobram 4: s1 apoio 34 px, s5–s6 fundos, s2 destino < origem, s2 com 45 palavras). Ocupação: 49 64 49 54 49 60 58 58 66 55.

## Notas

| # | critério | peso | nota | evidência (slide e região) |
|---|---|---|---|---|
| 1 | Originalidade | 3 | 2 | O motivo existe e evolui: a fila de chips vai de "Garantia" acesa (s1) aos checks um a um (s3–s8) e a 7 checks sem chip ativo (s9, faixa do alto). O card de UI responde a pergunta no s5 (toggle Online/Presencial, terço superior) e no s3 (sala de espera, "Ana M. chegou agora"). O resto é o FAQ de duas faixas (pergunta entre aspas sobre cor, resposta embaixo) que qualquer gerador de template entrega. s4 (dois pills soltos) e s8 (um botão só) são ilustração fraca. |
| 2 | Qualidade visual | 3 | 2 | Na folha de contato o conjunto é limpo e coerente, mas não para o scroll: é SaaS competente. Vão morto entre o card (base y 427) e a pergunta (topo y ~660) no s3 e no s5, no meio do campo. Card do s8 com a metade direita e o terço de baixo vazios. Os campos tom-300 do s4 e do s7 (≈ 66% do slide) pesam mais que o conteúdo. |
| 3 | Hierarquia | 2 | 2 | s3–s8: entra no card, apoia na pergunta de 84 px e para na resposta de 42 px (2:1, ok). No s2 há duas âncoras quase iguais: o título no campo (~66 px, terço superior) e "Reembolso integral" (~60 px, centro do card). Não se sabe qual é a resposta, e o check confirma que o destino (33%) pesa menos que a origem (45%). |
| 4 | Ritmo e variação | 2 | 3 | Dentro do molde pedido, a cor gira com sistema: tom-100/branco → tom-300/creme → branco/tom-200 se repete em s3–s5 e s6–s8, e a inversão do s5 e do s8 (campo branco, resposta em cor) dá respiro. O s9 (trilho) e o s10 saem do molde no ponto certo. Ponto contra: o ⚠ de s5–s6 e o fato de s3 = s6 e s4 = s7 serem combinações idênticas. |
| 5 | Camadas e detalhe | 2 | 2 | Tem fundo → campo → card branco com borda e sombra → UI interna → chips, e o "dados ilustrativos" do s3 (rodapé do card) tem função. Mas a divisão do campo é um corte seco, sem hairline nem transição, a sombra do card é cinza neutra e o interior de vários cards é raso (s4, s8). |
| 6 | Espaço e equilíbrio | 2 | 2 | Sobra, não respiro: s3 e s5 têm ~230 px vazios no centro do campo (ocupação 49%). O s10 tem o quarto superior vazio (y 0–330), porque a fila sumiu e nada ocupou o lugar. A capa tem ~265 px entre o card e o título (aprovada; só registro). |
| 7 | Tipografia | 2 | 2 | As perguntas quebram por sentido (s4, s6, s8 bem). Nas respostas, o fim de linha fica em palavra fraca: s3 "kz, e / você", s6 "não / a ferramenta.", s7 "é o / resto:" e "Na kz, vem / tudo junto." (o fecho em negrito quebrado). Linhas acima de 18 caracteres no título do s2 e do s9 ("não faz, para você"). |
| 8 | Marca e cor | 2 | 3 | Tudo claro: creme, branco e tons; coral só em chip, botão e ícone; serifa itálica coral uma vez (capa, "não usar?"); UI fiel ao painel. Proibições respeitadas. Ressalva: o tom-300 como campo de ~66% do slide (s4, s7) funciona na prática como fundo, e o BRAND.md dá o fundo até o tom-200. |
| 9 | Capa e CTA | 1 | 3 | No 1:1 (y 135–1215) a capa lê na miniatura: título na base, ênfase serifada, "arraste" fora do quadrado. CTA único (s10, botão "Pedir meu acesso"), mas o apoio "Peça seu acesso no link da bio." repete o botão dentro do mesmo card. |
| 10 | Craft e legibilidade | 1 | 3 | 0 ✗, margens de 96 px respeitadas, nada cortado. Ressalvas do check: s1 com apoio em 34 px e s2 com 45 palavras. |

Conta: (2×3 + 2×3 + 2×2 + 3×2 + 2×2 + 2×2 + 2×2 + 3×2 + 3×1 + 3×1) ÷ 20 = 46 ÷ 20 = **2,30**.

## Isto é específico deste produto?
Só a kz teria a sala de espera com "Ana M. chegou agora", o toggle Online/Presencial, as abas Anotações/Histórico/Cliente, o botão Exportar dados da ficha e as 14 casas da garantia: é a UI do próprio app respondendo a cada objeção.
Qualquer marca teria a fila de chips de progresso, as aspas gigantes e a divisão em duas faixas pergunta/resposta. Hoje o que é genérico ocupa mais área que o específico.

## Problemas (P0 → P3)

1. **P1 · s3, s5 (e s4, s7, s8 em menor grau), centro do campo, y ~430–660:** a pergunta está presa ao fundo do campo (base em ~820). Com 2 a 3 linhas, sobra um vão de 150 a 230 px entre o card e a pergunta, e o meio do slide fica morto.
   → **recompor:** prender o topo da pergunta numa y fixa logo abaixo do card (base do card + 64 px, igual em s3–s8). Assim a pergunta entra sempre no mesmo lugar, que é o que um molde repetido pede, e a divisão campo/resposta passa a ficar 72 px abaixo da última linha da pergunta. A sobra desce para o pé da faixa de resposta, onde vira respiro antes do rodapé. As posições do card, dos chips e das aspas não mudam.

2. **P1 · s2, terço superior × centro:** o destino do motivo não domina. "Reembolso integral" (~60 px) disputa com o título do campo (~66 px), as 14 casas são só uma faixa no pé do card e o slide passa do alvo de palavras (45 contra ≤ 35).
   → **mais quieto** em "Reembolso integral": reescalar para o tamanho de subtítulo (~40 px, 600) e deixar o título do campo como única âncora. **Mais ousado** nas 14 casas: o card passa a ser o maior objeto do slide (≥ 45% da área, subindo a divisão do campo) e as casas ganham altura. **Cortar** ~10 palavras do apoio dentro do card. Isso também resolve os dois ⚠ do s2.

3. **P2 · s4 e s8, interior do card:** no s8 o card tem um rótulo e um único botão à esquerda, com a metade direita e o terço de baixo vazios. No s4, os dois pills ("Link da sessão" largo, "Sessão confirmada" pela metade) parecem rascunho de UI, e não a tela.
   → **reescalar** o elemento de UI para ocupar a largura útil do card. s8: o botão "Exportar dados" na largura toda, centrado na altura do card. s4: os dois pills na mesma largura, empilhados e centrados. **Destilar** o rótulo em caixa alta onde ele não acrescenta nada ("FICHA DO PACIENTE" se o botão já diz o que é). Tamanho do card fixo, como pede o molde.

4. **P2 · s3, s6, s7, faixa de resposta:** o rag termina em palavra fraca: "e" (s3), "não / a ferramenta." (s6), "é o / resto:" e "vem / tudo junto." (s7). No s7, o fecho em negrito quebrado em dois perde o soco.
   → **reescalar a medida** da resposta (coluna de ~780 px em vez de ~840) e quebrar à mão com espaço inseparável nos pares "e você", "não a ferramenta", "o resto", "vem tudo junto". O texto não muda.

5. **P2 · s10, quarto superior (y 0–330):** a fila de chips sumiu e o título ficou flutuando abaixo de um vazio sem função. O apoio do card repete o botão.
   → **recompor** como espelho da capa: card do selo no terço de cima (onde estava o card da capa), título no terço de baixo, com a base perto de y 1060. Abrir com card + pergunta e fechar com card + pergunta amarra o carrossel, e a âncora do s10 sai do mesmo terço da do s9. **Destilar** a linha "Peça seu acesso no link da bio." de dentro do card ou o rótulo do botão: fica um dos dois.

## Manter
- A fila de chips como progresso: chip ativo em coral, checks acumulando, 7 checks no s9. É o fio que segura as 7 perguntas.
- Um pedaço de UI real do app por pergunta, que responde sozinho (o toggle do s5 é o padrão a seguir; a sala de espera do s3 vem logo atrás).
- A resposta que abre com a palavra-veredito em negrito ("Não.", "Serve.", "É.", "Leva.") e o ciclo de cor governado do campo.
