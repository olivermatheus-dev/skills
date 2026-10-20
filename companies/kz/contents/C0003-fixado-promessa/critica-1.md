# Crítica 1 · C0003-fixado-promessa (raiz)

**Veredito:** competente e fiel ao app, mas o miolo é um carrossel de funcionalidades de SaaS com cabeçalho de progresso: s5 e s6 são gêmeos e o destino (s7) não é o maior objeto. **Nota 2,05 / 4 · não passa** (ritmo < 2 e média < 3,0).

## Notas

| # | critério | peso | nota | evidência (slide e região) |
|---|---|---|---|---|
| 1 | Originalidade | 3 | 2 | A régua aparece em 9 de 10 slides e o ponto anda (s3→s9), mas lê como stepper de onboarding ("passo 4 de 7"), não como um dia: é uma linha de 2 px no topo (y ≈ 105) que não muda de forma nem de luz. Só o s4 (balão "Amanhã está de pé?" riscado → botão "Confirmação enviada", terço médio) é uma ideia que só este carrossel teria. |
| 2 | Qualidade visual | 3 | 2 | Folha de contato a 20%: s4 e s9 (tom-200) param o olho; s3, s5, s6, s8 e s10 viram a mesma placa creme com título no alto à esquerda. Nenhum slide do miolo tem escala de estúdio: o maior objeto é sempre um card de UI de 880 px com o mesmo raio e a mesma sombra. |
| 3 | Hierarquia | 2 | 2 | s4: a entrada é o apoio de 48 px (terço superior, y 255–430) e a âncora fica no rodapé (y 960–1170): lê-se a explicação antes da afirmação. s2: âncora de 5 linhas ocupa a metade de cima toda, o apoio (y 830–940) fica perdido. s3, s5, s6 e s9 estão certos (título → objeto). |
| 4 | Ritmo e variação | 2 | 1 | `check`: fundos indistintos em s1–s2 (campo tom-100 do s2 = fundo do s1) e s5–s6 (creme × creme). s5 e s6 têm o mesmo molde (régua → título de 2 linhas no terço sup. esquerdo, y 230–400 → objeto no terço médio): as 7 famílias diferem no nome, não na tela. Creme em 5 de 10 slides. |
| 5 | Camadas e detalhe | 2 | 2 | Fundo → card branco → conteúdo → microdetalhe existe em s3, s6, s7, s9 (hairlines nítidas, raio 16 coerente). Mas: s9, miolo dos dois cards (y 650–760) oco; s7, quadro de vídeo (terço esquerdo) é um bloco tom-200 chapado com PiP vazio; s5, trilho e divisórias em cinza neutro, fora do `--border` creme. |
| 6 | Espaço e equilíbrio | 2 | 2 | Vazio que é sobra: s10, faixa y 620–870 entre título e card (≈ 250 px); s4, faixa y 720–950 com o par balão/botão flutuando sem âncora na grade; s2, ocupação 31%, metade de baixo com apoio + régua soltos. s3 e s9 equilibrados. |
| 7 | Tipografia | 2 | 2 | s5, passos 2 e 3: "sessão." e "coisa." sozinhas na 2ª linha. s2: "WhatsApp" sozinha numa linha de título. s3: "o" no fim de linha do apoio ("toma o / café"). s8: apoio colado no título (≈ 25 px de respiro, terço médio). s9: "· dados ilustrativos" grudado na frase do pagamento. Corpo < 36 px em s7 (34) e s9 (32); s3, s7 e s9 acima de 35 palavras. |
| 8 | Marca e cor | 2 | 3 | Claro em tudo, coral só em pontos (botões, ponto da régua, horários, quadrados do pacote), ênfase em 2 de 10 (s1, s7). Desvios: s7, "Sessão Inteira." em Montserrat coral, não na serifa itálica que a capa estabeleceu; s1, os 5 ícones da faixa de cima em cinza, quando o kit pede Lucide em `--primary`. |
| 9 | Capa e CTA | 1 | 3 | Recorte 1:1 (y 135–1215): ícones, card, título e apoio inteiros; "arraste" (y 1265) fora do quadrado, como previsto. O título lê na miniatura. CTA único no s10, sem "arraste". |
| 10 | Craft e legibilidade | 1 | 2 | `check`: 0 ✗, 88 textos medidos acima do mínimo; os ⚠ de contraste são exceções de marca/UI aprovadas. Contam contra: 3 slides acima do teto de palavras e 2 corpos abaixo de 36 px. |

**Nota ponderada** = (2×3 + 2×3 + 2×2 + 1×2 + 2×2 + 2×2 + 2×2 + 3×2 + 3×1 + 2×1) ÷ 20 = 41 ÷ 20 = **2,05**.

## Isto é específico deste produto?
Só a kz teria: a agenda do dia chegando no WhatsApp (s3), a sala de espera com "Atender" (s6), a tela da Sessão Inteira (s7) e mensalidade × pacote com "o pagamento continua com você" (s9). O dado é dela.
Qualquer SaaS teria: o sistema que embrulha esses dados (barra de progresso no topo + título à esquerda + card de UI no meio + logo e paginação no rodapé). Tire a régua e é o carrossel padrão de "funcionalidades".

## Problemas (P0 → P3)

1. **P1 · s5 e s6, slide inteiro: gêmeos.** Mesmo fundo creme (⚠ do check), mesmo molde (título de 2 linhas no terço sup. esquerdo, objeto no terço médio, régua no topo). No swipe, parece o mesmo slide com outro texto.
   → **recolorir** o fundo do s6 para tom-200 (s5 creme, s7 branco: os vizinhos continuam distintos) e **recompor** o s6: o card da Sala de Espera sobe para logo abaixo da régua, maior (≈ 900 px de largura, avatar e "Atender" maiores), e título + apoio descem para o terço inferior. Assim a âncora alterna: s4 embaixo, s5 em cima, s6 embaixo, s7 em cima. No mesmo passe, **recolorir** o campo do s2 de tom-100 para tom-200 (resolve o ⚠ s1–s2 sem tocar na capa).

2. **P1 · s7, metade inferior: o destino pesa menos que o caminho.** O ⚠ do check confirma: tela = 35% do slide, texto = 45%. O campo tom-100 com título + apoio de 2 linhas (y 0–520) domina, e a tela branca sobre o fundo branco perde a borda: o clímax do carrossel é o slide em que o produto mais se dissolve.
   → **reescalar**: cortar o apoio para 1 linha (≤ 10 palavras; a tela já mostra anotações, histórico e ficha) e subir a tela para começar em y ≈ 400, ocupando ≥ 55% do slide. **Recolorir** invertendo o split: título sobre o branco no topo, campo tom-100 atrás da tela, que assim acende como o card "Próxima sessão" da capa. O `fundo` do slide continua branco (sem ⚠ novo com s6 e s8). Como o slide vira vídeo, o 1º quadro do MP4 não pode ser este estado parado com o PiP vazio.

3. **P1 · motivo, régua (s2 rodapé → s3–s10 topo; s10 topo): o fio pula de lugar e não fecha.** No s2 a régua vazia está em y ≈ 1055; do s3 em diante, em y ≈ 105. No swipe, ela salta de baixo para cima justo quando o ponto deveria "entrar". E no s10, onde o plano diz que o dia fechou, ela continua um fio de 2 px no topo, enquanto o slide tem 250 px de vazio no meio.
   → **ligar**: no s2, subir a régua para y ≈ 105, na posição exata de s3–s10. **Mais ousado** no s10: a régua completa vira o herói, com a largura toda no terço médio (y ≈ 680–760), os 7 nomes de momento sob as marcas e o coral cheio. O título fica em cima e o card do CTA embaixo, ocupando a faixa morta. Tirar o rótulo "O SEU DIA, NUMA TELA" do topo (**destilar**).

4. **P2 · s4, terço superior e meio: ordem de leitura invertida.** O apoio em 48 px logo sob a régua é a primeira coisa lida. O par balão riscado + botão flutua numa faixa sem âncora (y 550–725), com 230 px de nada até a âncora.
   → **recompor**: o par balão → botão sobe para o terço superior, logo sob a régua, como herói (maior, alinhado à margem esquerda de 96). A âncora fica onde está e o apoio desce para baixo dela, **reescalado** para ≤ 40 px. Assim a âncora continua no terço inferior e não repete o s5.

5. **P2 · tipografia e tamanho (s2, s3, s5, s7, s8, s9).** "sessão." e "coisa." sozinhas (s5, passos 2 e 3); "WhatsApp" sozinha no título (s2); "o" no fim de linha (s3, apoio); apoio colado no título (s8, ≈ 25 px); "· dados ilustrativos" grudado na frase (s9, rodapé). s3 (49), s7 (43) e s9 (47) passam de 35 palavras.
   → **reescalar** a coluna de texto do s5 (texto a partir de x ≈ 230, com a medida estendida até 984) para cada passo caber em 1 linha, ou cortar 1–2 palavras por passo. Cortar s3, s7 e s9 para ≤ 35 palavras. s7 e s9 com corpo ≥ 36 px depois do corte. s8: respiro ≥ 48 px entre título e apoio. s9: "dados ilustrativos" vira meta separada, alinhada à direita como em s3 e s6. Capa (ajuste fino, sem refazer): **recolorir** os traços dos 5 ícones de cinza para `--primary`, como pede o kit.

## Manter
- O s4 como callback do fixado da Dor: o balão "Amanhã está de pé?" riscado virando "Confirmação enviada". É o único momento com ideia própria.
- A UI recriada fiel ao app (s3, s6, s9: cards brancos, raio 16, avatar coral sobre `#fddbd3`, botão coral), com "dados ilustrativos" à vista.
- O ponto coral andando uma marca por slide com o nome do momento embaixo: é o sistema; corrigir a posição (s2) e o fecho (s10), não trocar.

## Resposta do implementador (v2)
- **Recusado:** item da capa (s1) — aprovada pelo dono da marca, os ícones cinza são intencionais (ferramentas antigas entrando na tela).
- **Adaptado:** s5 resolvido com `text-wrap: balance` (2 linhas equilibradas, sem palavra sozinha) em vez de forçar 1 linha, que exigiria cortar "primeira".
- **Adaptado:** s10, os 7 nomes de momento ficam em 2–3 linhas sob as marcas (a largura de 148 px por marca não comporta 1 linha).
- **Passada que só remove:** s6 sem o chip "kz.app.br/call/clara" (URL inventada, não está no roteiro, disputava com o título).
- s7: cortes no texto (apoio e nota de anotação) para ≤ 35 palavras; adicionado "dados ilustrativos"; mantida a ênfase em cor do plano.
