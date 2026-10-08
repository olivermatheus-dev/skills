# Brechas — redesign (043 fase B)

Prints: `prints/antes-*` e `prints/depois-*` (1280 e 1920 px).

## De onde vem cada coisa
- **Brechas (temas):** `companies/kz/intel/brechas.json`. A IA junta as "brechas para nós" (`forcas.opportunities`) das 11 análises de pontos fortes e fracos em 13 temas; cada tema tem tipo (público, mensagem, oferta, produto), ação, "depende de", funcionalidades da matriz ligadas e as frases originais.
- **Produto × mercado:** `companies/kz/intel/matriz.json` (coluna `_nos` = Kzloo). Faltam = metade ou mais dos concorrentes têm e a Kzloo não; só você tem = ninguém (ou no máx. 2) tem.
- **Por concorrente:** `analysis/forcas.json` de cada um (`opportunities`), as frases como vieram.

## O que confunde hoje
1. Tudo numa tela só: lista longa de brechas + "Faltam no produto/Só você tem" ao lado + frases escondidas num `<details>` no fim. Não diz por onde começar.
2. Jargão e números sem rótulo: "7/11", "análises de pontos fortes e fracos", tipos "Público/Mensagem/Oferta/Produto" sem dizer o que fazer com cada um.
3. Cada linha tem 7 sinais (número, barra, seta, título, chip, "você tem", ação, depende de, avatares, botão): nada se destaca.
4. Duas fontes diferentes (análises × matriz) lado a lado sem explicar a diferença.
5. Brecha de produto que a Kzloo **já tem** aparece igual à que falta (uma é "comunicar", a outra é "construir").
6. A lista rola a página inteira; os filtros somem.

## Nova estrutura (sub-abas por chips, `?v=`)
| sub-aba | responde | o que mostra | ação principal |
|---|---|---|---|
| **Resumo** (padrão) | Por onde eu começo? | 4 números (brechas, já viraram tarefa, faltam no produto, só você tem: cada um abre a sub-aba), "Comece por aqui" com as 3 maiores em cards, e o que é uma brecha em 1 linha | Virar tarefa (nas 3) |
| **Todas as brechas** | Quais espaços os concorrentes deixam abertos e o que fazer com cada um? | lista à esquerda (rola por dentro, filtros à vista: área e "sem tarefa") + detalhe da brecha à direita: o que fazer, se você já tem, depende de, quem deixa aberto com a frase de cada um | Virar tarefa / Ver T-NNNN |
| **Produto × mercado** | O que falta no produto e o que só a Kzloo tem? | duas colunas: "Faltam no produto" (barra de quantos têm) e "Só você tem" (exclusivas e raras) | Abrir na matriz |
| **Por concorrente** | O que cada concorrente deixa aberto? | um card por concorrente com as frases originais e em que brecha cada frase entrou | abrir a brecha / a ficha |

Rótulos das áreas viram perguntas: Público → **Para quem falar**, Mensagem → **O que dizer**, Oferta → **Como vender**, Produto → **Produto**. Cada brecha ganha um verbo: *Comunicar* (público, mensagem, produto que você já tem), *Ajustar a oferta* (oferta), *Construir* (produto que falta ou em parte).

O card do Panorama (`GapSummaryCard`) continua igual; cada brecha nele agora abre direto a brecha na sub-aba "Todas as brechas" (`?v=temas&t=<id>`).

## Pendências (fora do meu escopo)
- "Virar tarefa" para uma funcionalidade de "Faltam no produto" (hoje o marcador de tarefa é por tema de brecha; precisaria de um marcador por funcionalidade). Por ora a ação é abrir a matriz.
- O nome da aba "Brechas" em `area.tsx` está bom; se a fase C quiser, o subtítulo pode virar "o que os concorrentes deixam aberto".
