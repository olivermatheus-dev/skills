# Crítica 3 · C0002-fixado-dor · v3/

**Veredito:** sistema limpo e fiel ao app, mas a virada mente sobre o produto e o miolo (s5–s7) é kit de UI de SaaS sem ideia própria. **Nota ponderada 2,40 / 4 · não passa** (dois critérios de peso 3 em 2; tipografia e espaço em 2).

Base: 9 PNG em 100%, `contato.png` (sequência + grade 1:1), `slides.json`, BRAND.md, rubrica, `check.mjs` (0 ✗ · 11 ⚠, todos de ênfase-serifa repetida ou contraste de exceção de marca/UI, aceitos pelo dono).

## Notas

| # | critério | peso | nota | evidência (slide e região) |
|---|---|---|---|---|
| 1 | Originalidade | 3 | 2 | O motivo existe e atravessa 7 de 9 (s1 lista, s3 pilha, s4 balão, s7 monte, s8 barra). Só este carrossel teria **s3** (os 4 gestos das 19h50 empilhados) e o "EM 10 MIN" do s8, ligado ao 19h50. O resto é o clichê de SaaS "5 apps → 1 tela", feito com tiles pastel de ícone: a régua de 5 tiles se repete **igual** em s2 (terço inferior), s5 (terço inferior esq.) e s8 (topo do card). O motivo se repete, não evolui. |
| 2 | Qualidade visual | 3 | 2 | Na folha a 20% só param o scroll o "5" coral (s5, metade esq.) e o monte de tiles (s7, metade dir.). s2, s3, s6 e s8 ficam todos no mesmo tom pálido. s7: o monte de tiles de 270 px pesa mais que o título e o texto juntos e parece pasta de ícones de app. s5: vazio morto à direita do "5" (x 430–984, y 290–660). |
| 3 | Hierarquia | 2 | 3 | Uma entrada por slide na maioria. Falha no s5: título 72 px no topo e apoio 44 px ao lado do numeral (razão 1,6:1), os dois brigam pelo segundo lugar. No s8 o card sozinho tem 5 níveis (barra de tiles, barra lateral, rótulo, nome, botão, aviso). |
| 4 | Ritmo e variação | 2 | 3 | 8 famílias, leves em s1/s5/s6/s9, sem ⚠ de repetição. Mas o título fica no canto sup. esq. em 5 de 9 (s2, s3, s5, s7, s8) e em vizinhos seguidos (s2–s3, s7–s8): o movimento do olho vira um molde só. |
| 5 | Camadas e detalhe | 2 | 2 | Tem profundidade em s3, s4 e s8 (card sobre card, sombra suave, borda hairline). s2, s5, s6 e s9 são planos: título + uma fileira. Os avisos "ilustrativa/ilustrativos" (s4 meio dir., s8 canto inf. dir. do card, s9 canto inf. dir. do card) flutuam, cada um numa posição e num alinhamento. |
| 6 | Espaço e equilíbrio | 2 | 2 | s6: 620 px de vazio no topo sem âncora (35% de ocupação). Pausa declarada, mas lê como sobra porque nada a enquadra. s2: faixa morta y 1040–1240. s8: miolo do card vazio acima e abaixo do card de sessão (y 470–585 e 930–1045). s5: quadrante sup. dir. vazio. |
| 7 | Tipografia | 2 | 2 | s7: o apoio em coluna de ~360 px quebra em 9 linhas com linhas de uma palavra só ("montado", "empilhando", "ferramentas."). s5: o apoio quebra contra o sentido ("Todo dia. Entre / uma sessão e outra."). s8: título com 19 caracteres na 1ª linha ("Dá para atender com"), acima do limite de 18. |
| 8 | Marca e cor | 2 | 3 | Sempre claro, coral só em pontos, ênfase serifa coral em s1 e s8 (regra da marca). s7 usa o tom-300 em ~65% do slide: é o campo mais saturado da peça e destoa do "visual do app". Logo kz duas vezes no s8 (barra lateral do card + rodapé). |
| 9 | Capa e CTA | 1 | 3 | Capa inteira dentro de y 222–1140 e legível na miniatura 1:1. As 5 janelas estão quase retas (o plano pede ±6°): lê como escada organizada, não como caos (capa aprovada, só registro). CTA único. O "Enviar" do s9 é um botão falso que convida ao toque. |
| 10 | Craft e legibilidade | 1 | 3 | 0 ✗. Nada cortado. s8: o aviso "dados ilustrativos" fica com a linha de base abaixo do botão, sem alinhar com nada. s4: "conversa ilustrativa" boia sozinha entre o balão e o título. |

Cálculo: (2·3 + 2·3 + 3·2 + 3·2 + 2·2 + 2·2 + 2·2 + 3·2 + 3·1 + 3·1) ÷ 20 = 48 ÷ 20 = **2,40**.

## Isto é específico deste produto?
Só a kz teria a cena das 19h50 (s3) e o card "Próxima · em 10 min / Iniciar sessão" (s8), que é o Painel do dia de verdade e responde ao relógio do s3.
Qualquer SaaS teria o resto: tiles pastel de app em fileira, "5 ferramentas viram 1", monte de ícones 3D, frase solta sobre cor clara.

## Problemas (P0 → P3)

1. **P0 · s8, faixa do topo do card (y 330–470)**. A tela da kz mostra como "abas" os ícones de Meet, WhatsApp e Planilha. Isso diz que a kz embute o Meet e a planilha, e é falso: a videochamada é própria, "sem Meet/Zoom" (PRODUTO.md, Videochamada própria), e a tela real tem as abas Anotações, Histórico e Cliente. A virada vende uma integração que não existe.
   → **Recompor + destilar:** tirar a barra de 5 tiles de terceiros de dentro do card. O motivo termina **trocado**: cada tile antigo entra no card e vira a função real que o substitui (agenda → próxima sessão, Meet → "Iniciar sessão", caderno → "Ver prontuário", planilha → item financeiro da barra lateral). Ou mostrar os 5 tiles **fora** do card, apagados e convergindo para ele. O que fica dentro do card é só UI da kz, conferida no PRODUTO.md.

2. **P1 · s2 (terço inferior), s5 (terço inferior esq.), s8 (topo do card): a mesma régua de 5 tiles três vezes.** O motivo não evolui, só reaparece. s5 é o caso mais grave: o "5" já conta, e a régua com rótulos embaixo repete o s2 com legenda.
   → **Ligar + destilar:** cada aparição muda de estado. No s2 ficam só os 5 tiles. No s5 o "5" é a soma, e os tiles somem ou viram 5 marcas mínimas coladas à base do numeral, sem rótulo (os nomes já foram lidos em s1 e s3). No s8 entra a troca do P0. Rodar o `check` depois: o s5 não pode cair no molde "título solto sobre cor".

3. **P1 · s7, metade dir. + coluna esq.** O monte de tiles de 270 px é o maior objeto, mas é decoração genérica (pasta de ícones), e a coluna de texto ao lado fica estrangulada: 9 linhas, linhas de uma palavra só. O título "Não é falta de disciplina." perde para os ícones.
   → **Mais quieto + reescalar:** reduzir o monte a ~60% e encostá-lo na divisa, como pilha torta coerente com a capa e o s3 (cards com nome, não tiles soltos). Abrir a coluna do apoio para ≥ 560 px, em no máximo 5 linhas. O título continua a entrada.

4. **P2 · s6, metade superior (y 0–620).** O vazio da pausa não tem borda nem âncora e lê como slide inacabado. É o molde "frase solta sobre cor" mais fraco da peça.
   → **Recompor:** subir o bloco do título para o terço médio e assentar o apoio na mesma linha de base dos rodapés. O vazio passa a ser a faixa de cima, medida e intencional. Sem objeto novo (o motivo_falta está declarado).

5. **P2 · avisos de "ilustrativo" em s4 (meio dir., y 685), s8 (canto inf. dir. do card) e s9 (canto inf. dir. do card).** Três posições, três alinhamentos, nenhum preso ao objeto. Junto vai a tipografia: s5 quebra "Entre / uma sessão" e o título do s8 tem 19 caracteres na 1ª linha.
   → **Ligar:** um único lugar para o aviso, encostado na borda inferior do objeto que ele qualifica, alinhado à margem interna dele e no mesmo corpo e cor nos três slides. Quebrar o apoio do s5 por sentido ("Todo dia." sozinho ou junto de "Entre uma sessão e outra.") e reflowar o título do s8 para ≤ 18 caracteres por linha, sem mudar o texto.

## Manter
- s3: os 4 gestos em cards empilhados sob o "19h50." É o único slide que só este carrossel teria.
- s8: o card "Próxima · EM 10 MIN / Ana L. / Iniciar sessão" é UI real e responde ao relógio do s3. Fica, com a correção do P0 em volta dele.
- s4: o balão do paciente cobrindo os 2 cards de gesto (a interrupção como objeto).
