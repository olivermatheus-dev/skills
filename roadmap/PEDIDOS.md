# Fila de pedidos do Oliver (visão do orquestrador)

> Uma linha por pedido que **ainda não foi entregue**. Detalhe e instruções ficam no `TASK.md` da tarefa; aqui só o resumo para saber o que ficou de fora.
> Quem registra: a sessão orquestradora (`CLAUDE.md` + memória "orquestrador com especialistas": registrar → disparar agentes com persona de especialista, em ondas sem conflito de arquivo → revisar → commit → aval do Oliver).
> Ao entregar, apagar a linha daqui e registrar no Log da tarefa. Atualizado em 2026-10-08 (fim da sessão orquestradora).

## Próximo da fila (fazer nesta ordem, sem esperar o Oliver)
| # | tarefa | o quê | por que agora |
|---|---|---|---|
| 1 | 047 | **Fase B:** refazer o plano da apresentação kz com a skill `plano-de-cenas` (revisão Opus + storyboard) e comparar com a v03; calibrar rubrica e `plano.mjs check` | pedido do Oliver de 2026-10-08 (fase A feita) |
| 2 | 045 | **Fase E:** insumos pela IA ("Pedir à IA" +5 aberturas/headlines/copys/CTAs com contexto + intel; insumos editáveis na aba Variantes; seção Variantes nas skills `video` e `ads-meta`) | fase D feita em 2026-10-09 |

## Esperando o Oliver (não travam o resto)
| tarefa | o que falta |
|---|---|
| 046 | usar a fila da IA (pedir duas coisas seguidas: a 2ª fica "na fila" no dock e roda sozinha) e o resto da 046 (dock, página Agentes, Pedir ajustes, Rodar agora) e apontar ajustes |
| 045 | assistir às 3 aberturas da rodada 1 (app → Conteúdos → apresentacao kz → aba **Variantes**) e escolher a vencedora no botão da faixa "r2 espera" (vira `rodadas.r2`; as 9 da matriz já existem em 4:5 e 9:16, sincronia ok) · perguntas 4 (1º projeto de edits) e 5 (planilha da Meta × lista); não travam A–D |
| 043 | dados da Kzloo para Preços: preço final (100–129; hoje 129), % trimestral/anual, teste/garantia (e se pede cartão), limites por plano, formas de pagamento/fidelidade, headline de referência · card "Já viraram tarefa" das Brechas abre qual filtro? · comparar a Kzloo contra a entrada mediana (atual) ou o topo solo? · usar as telas e apontar ajustes |
| 040 | aceitar/recusar os 4 termos novos do relatório de anúncios da Corpora · revisar as 5 fichas em `tasks/040-…/AVAL-FICHAS.md` (meta: corrigir < 20% dos campos ★) · **cookies do Chrome** para baixar reels do Instagram (`YTDLP_COOKIES_FROM_BROWSER=chrome`; mexe com a sessão dele, só com o sim) |
| 041 | avaliar as 8 ideias I-0001…I-0008 (app → Ideias) · aceitar as fontes (app → Ideias → Fontes, "Aceitar as 36 conferidas") · decidir as 7 "não conferido" · criar chave grátis do OpenAlex (`OPENALEX_API_KEY`) · podcasts/newsletters/criadores que ele segue |
| 038/039 | usar as telas novas e apontar ajustes (Panorama, Conteúdos Grade/Tabela/Painel, Anúncios, Brechas, Lista, ficha com aba Anúncios) · Instagram da Kzloo como referência? · token do Instagram para > 6 posts? · preço final e teste grátis da Kzloo |
| 037 | seção 13 do `TASK.md` (6 perguntas; a 1, funil por temperatura × pelo botão, trava a fase B) + "republicado" à parte do "reapareceu" + rotular o gabarito |
| 036 | seção 11 do `TASK.md` + aval da fase A |
| 035 | teto DataForSEO, e-mail para newsletters, domínios da 1ª rodada |
| 034 | confirmar 11 "?" na coluna da Kzloo; priorizar as melhorias que sobraram (battlecard, histórico de preço, PDF…) |
| 029 | 4 perguntas no `TASK.md` (a 041 já cobre as fontes) |
| 030 | testar o editor de mockups + aprovar os 8 fundos → fase B |
| 032 | ~~`/login`~~ feito em 2026-10-08; falta o teste com a T-0017 no Rodar IA |
| 048 | feita (34 fichas no molde); decisões pontuais restantes no fim do `TASK.md` (área segura de anúncio, Write no revisor, ads-meta no estrategista, PRODUTO.md na setup, teto dos fmt-*, etc.) |

## Na fila (pedido antigo, não implementado)
| tarefa | pedido | próximo passo |
|---|---|---|
| 037 | anúncios: classificador funil/tipo/objetivo, chips, salvar/nota/tag, virar ideia, Gantt, Google | B → H (A feita; o visual da aba foi na 038 D) |
| 041 | F4 refino (páginas sem RSS: PePSIC, RBTC, OMS, CRPs; "Pedir à IA" ao colar link; peso pelo histórico) | após 5 rodadas reais |
| 031 | pendências de coleta: 5 concorrentes sem página na Biblioteca, YouTube Allminds 404, YouTube Sintropia 0 itens | conferir links |
| 022 | pinos no carrossel (fase D) | — |
| 030 B · 028 B/D/E | editor de mockups e estúdio | aval do Oliver |
| 025 | ficha de produção (briefing, funil de status, custo por peça) | pronta para começar |
| 019 | front-end passo 6 + motion no resto do app | aval da mola do Quadro |
| 021 | rodar a T-0012 com `context:` e medir tokens | aval da T-0011 |
| central de peças | renomear o arquivo exportado (hoje só o nome de exibição) | pequeno |
| — | **polimento visual geral do app**: juntar aqui o que o Oliver apontar, tela a tela | acumular |
