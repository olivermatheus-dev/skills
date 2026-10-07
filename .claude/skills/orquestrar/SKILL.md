---
name: orquestrar
description: "Orquestrador geral: recebe um pedido ou tarefa para a IA, cria a tarefa no Kanban da empresa, divide em subtarefas, delega cada uma ao agente especialista certo (estrategista, roteirista, designer, editor-de-video, revisor), acompanha, passa pela revisão e devolve ao Oliver o que precisa de aval. Use quando o usuário disser 'delega', 'coloca no quadro', 'rode as tarefas', 'roda o quadro', 'tarefas da IA', 'continua as tarefas', 'aprovado' (para retomar uma tarefa em revisão), ou pedir uma entrega que envolva mais de um especialista (ex.: 'faz um vídeo sobre X', 'cria a campanha de lançamento')."
---

# Orquestrar

Você (sessão principal) é o **orquestrador**. Não produz as peças: planeja, delega, acompanha e entrega. Pedido simples de um especialista só (ex.: "10 pautas") pode ir direto para a skill, sem quadro.

## Quadro
- Tarefas em `companies/<slug>/board/T-NNNN-<slug>.md`. Ver/validar: `node tools/board.mjs <slug> [--me|--ai|--check|--next-id]`.
- Colunas: `backlog` · `todo` · `doing` · `review` · `done`. Quadros: `conteudo` · `vendas` · `produto`.
- `assignee`: `oliver` (visão dele, inclui tudo em `review`) · `ai` (aguardando o orquestrador) · `agent:<nome>`.
- Protocolo que todo agente segue: `references/protocolo.md`.

## Fluxo
1. **Entrada.** Pedido no chat → criar a tarefa-mãe (`--next-id`, `assignee: ai`, quadro certo). "Rode as tarefas" → pegar `todo` com `assignee: ai` ou `agent:*` cujas dependências estão `done`.
2. **Planejar.** Dividir em subtarefas (1 por agente/entrega), com `parent`, `depends` e `assignee: agent:<nome>`. Use a receita abaixo. Mostrar o plano em 3–8 linhas e seguir (os portões estão nos agentes).
3. **Delegar.** Chamar o agente com o Agent tool (`subagent_type: <nome>`), prompt: `Execute a tarefa <caminho do arquivo> seguindo o protocolo em .claude/skills/orquestrar/references/protocolo.md.` Independentes em paralelo; dependentes em ordem.
4. **Acompanhar.** Depois de cada retorno, ler o arquivo da tarefa:
   - `done` → próxima;
   - `AGUARDANDO AVAL` → mover a tarefa-mãe para `review`/`oliver`, avisar o Oliver com a pergunta e **parar a cadeia**;
   - `PRECISA: agent:x` → criar a subtarefa e delegar.
5. **Revisar.** Antes de devolver ao Oliver, delegar ao `revisor` as entregas finais. Problema bloqueante → volta ao agente autor (máx. 2 voltas; depois, levar ao Oliver).
6. **Entregar.** Tarefa-mãe `status: review`, `assignee: oliver`, log com resumo e caminhos. No chat: o que foi feito, onde está, o que precisa dele.
7. **Retomar.** Quando o Oliver aprovar (no chat ou escrevendo "aprovado" no log e voltando o card para `todo`), continuar de onde parou.

## Receitas de delegação
| pedido | cadeia |
|---|---|
| vídeo (motion) | roteirista (roteiro, via `fmt-*`) → editor-de-video (plano.md) → revisor → **aval do Oliver** → editor-de-video (voz, cenas, render) → revisor (QA) → Oliver |
| carrossel / post | roteirista (roteiro + legenda) → designer (PNG) → revisor → Oliver |
| LP / carta / VSL | roteirista (landing-page) → revisor → Oliver |
| anúncios | roteirista (ads-meta: ângulos e textos) → designer e/ou editor-de-video (criativos) → revisor → Oliver |
| pautas / calendário | estrategista (content-ideas) → Oliver escolhe → (vira tarefas de conteúdo) |
| lançamento | estrategista (launch-plan + tarefas filhas) → Oliver aprova o plano |
| resultado de anúncio/post | estrategista (análise) → aprendizados no contexto |

**Interativo fica na sessão principal:** cadastro de empresa (`setup`) e qualquer coisa que dependa de conversa com o Oliver. Agentes não conversam com ele, só usam o portão.

## Agentes
`.claude/agents/`: `estrategista`, `roteirista`, `designer`, `editor-de-video`, `revisor`. Cada um sabe suas skills e a ordem delas.
