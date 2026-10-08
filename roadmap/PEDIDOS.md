# Fila de pedidos do Oliver (visão do orquestrador)

> Uma linha por pedido que **ainda não foi entregue**. Detalhe e instruções ficam no `TASK.md` da tarefa (seção "Pedidos do Oliver (fila)"); aqui só o resumo para saber o que ficou de fora.
> Quem registra: a sessão orquestradora. Quem implementa: uma sessão por tarefa, começando pelo `TASK.md`. Ao entregar, apagar a linha daqui e registrar no Log da tarefa.
> Atualizado em 2026-10-08.

## Bloqueado por resposta do Oliver
| tarefa | o que falta decidir |
|---|---|
| 037 anúncios | seção 13 do `TASK.md` (6 perguntas; a 1, funil por temperatura × pelo botão, trava a fase B) + "republicado" à parte do "reapareceu" (Log) + rotular o gabarito de anúncios |
| 036 campanhas | seção 11 do `TASK.md` + aval da fase A |
| 035 fontes | teto DataForSEO, e-mail para newsletters, domínios da 1ª rodada |
| 034 matriz | confirmar 11 "?" na coluna da Kzloo; priorizar as 14 melhorias |
| 029 curadoria | 4 perguntas no `TASK.md` |
| 030 mockups | testar o editor + aprovar os 8 fundos → fase B |
| 032 quadro | `/login` do `claude` no terminal → teste com a T-0017 |

## Na fila (pedido feito, não implementado)
| tarefa | pedido | próximo passo |
|---|---|---|
| 037 | anúncios dos concorrentes: classificador funil/tipo/objetivo, chips e filtros, salvar/nota/tag, virar ideia, IA, Gantt, Google | fases B → H (só a A está feita) |
| 031 | ficha e abas dos concorrentes | uso e aval do Oliver; pendências: 5 concorrentes sem página na Biblioteca, YouTube Allminds 404, YouTube Sintropia 0 itens |
| 022 | volume/duração/texto direto no app (fase C) · pinos no carrossel (fase D) | **C em andamento sem commit** (`core/videoedit.ts`, `app/server/api.ts`) |
| 030 B | alinhar/distribuir, seleção múltipla, girar, composições prontas, ocultar dados | depende do aval |
| 028 B/D/E | captura por link, 3D/animação real, template a partir de referência | depende do aval |
| 025 | ficha de produção (briefing, funil de status, custo por peça) | pronta para começar |
| 026 | skills e agentes no app | rascunho |
| 019 | front-end passo 6 + motion no resto do app | aval da mola do Quadro |
| 021 | rodar a T-0012 com `context:` e medir tokens | aval da T-0011 |
| central de peças | renomear o arquivo exportado (hoje só o nome de exibição) | pequeno, sem tarefa própria |

## Novos (registrados pelo orquestrador)
| tarefa | pedido | próximo passo |
|---|---|---|
| 038 | **app inteiro:** AppContent centralizado em todas as páginas · Select bonito com ícones/logos no lugar dos `<select>` nativos | fase A |
| 038 | **Concorrentes → Conteúdos:** barra de filtros numa linha (período e rede viram select, ícones, busca sem quebrar) · card com hierarquia e ícones nas métricas · vista em tabela ordenável · espaço sobrando embaixo da grade | fase B |
| 038 | **Fora da curva duplo** (Conteúdos, Panorama, ficha): × média do próprio perfil e × média dos concorrentes na rede, lado a lado | fase B2 |
| 038 | **Concorrentes → Anúncios** no mesmo padrão: barra com selects, visual limpo, vista Lista = tabela com miniatura pequena e colunas ordenáveis (mais novos, dias no ar) | fase D |
| 039 | **Panorama vira dashboard** (o mais relevante de cara) · **Brechas** em página própria + card resumido sempre visível no Panorama | desenho (estrategista) → B → C |
| 039 | **Faixa de números (StatStrip)** sem card quebrando para a linha de baixo, mais compacta, com ícones · **ícones nas abas do header** da área Concorrentes | fase A2 (não depende do desenho) |
| 040 | **Análise profunda de conteúdos e anúncios:** por concorrente/rede (top 20) ou seleção na aba (top 10, só os não analisados; reanalisar é opção à parte), transcrição barata, Opus analisa (tipo, tema, gancho, gatilhos dos 5 s…), tudo salvo por item, relatório dentro do concorrente, painel do item editável | desenho (Opus) → aval |
| 041 | **Fontes e referências:** cadastro (nome, link, tipo…) que a IA usa para pesquisar ideias e temas com subagentes por fonte | desenho (Opus) → aval |
| 038 | **Lista de concorrentes:** barra numa linha (tabs viram selects, mais compacta) · erro "Failed to fetch" acima da tabela | em execução (Opus UX + correção) |
| — | **Polimento visual geral do app** ("o app como um todo precisa de ajustes"): ir juntando aqui os pontos que o Oliver apontar, tela a tela | acumular; vira tarefa quando houver lista |
| 038 | **Concorrentes → Conteúdos:** dashboard estratégico, projetado antes por um agente de marketing | C1 (estrategista) → aval → C2 |
