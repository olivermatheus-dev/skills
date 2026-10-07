# 021 — Gestão de contexto pela própria IA (sessões, quadro e agentes)

**Status:** rascunho · **Liga com:** skill `orquestrar` (protocolo), `tools/board.mjs`, `tools/heartbeat.mjs`, `schema/` (tarefa), `roadmap/ESTADO.md`

## Pedido do Oliver (2026-10-07)
- Sempre limpar o contexto (`/clear`) quando a próxima tarefa não precisa da anterior.
- O sistema de tarefas e o Kanban devem deixar a **própria IA gerenciar o contexto**: cada agente lê **só o estritamente necessário** para a tarefa.
- Prioridade agora: começar a usar. Isto evolui em cima do que já funciona.

## O que já existe (base)
- Tarefa = 1 arquivo (`board/T-NNNN.md`) com descrição, checklist, `links` e log: é a fonte da verdade e permite retomar sem a conversa.
- Protocolo dos agentes: ler a tarefa, a tarefa-mãe e só o contexto da função; portão para o Oliver; só o orquestrador delega.
- Heartbeat acorda cada agente numa sessão nova (contexto limpo por tarefa).
- Construção do hub: `ESTADO.md` + `TASK.md` da vez → sessão nova sem histórico.

## Escopo (proposta)
1. **Campo `context:` na tarefa** (lista de arquivos e seções, ex.: `context/BUSINESS.md#Modelo e preço`, `brand/BRAND.md#Som`): o orquestrador preenche ao criar/delegar; o agente lê **só isso** + a tarefa. Validação no `schema/` e no `board.mjs --check`.
2. **Resumo para retomar** (`## Estado` no topo do arquivo da tarefa, ≤ 5 linhas: onde parou, próximo passo, o que falta do Oliver), atualizado a cada marco. Quem retoma lê o Estado, não o log inteiro.
3. **Log compacto:** ao fechar ou passar de ~15 linhas, o agente condensa o log antigo em 1–3 linhas no Estado.
4. **Índices baratos em vez de arquivos grandes** (padrão do `library/audio/INDEX.md`): contexto da empresa com sumário por seção; agentes leem a seção, não o arquivo inteiro.
5. **Regra de sessão para a IA:** ao terminar uma tarefa, atualizar `ESTADO.md`/tarefa e **sugerir `/clear`** ao Oliver quando a próxima não depender da atual; ao começar, ler só `ESTADO.md` + a tarefa da vez.
6. Medir: tokens por tarefa antes/depois (liga com a 011).

## Critérios de pronto
- [ ] `context:` no schema, no protocolo e no `board.mjs --check`; orquestrador preenche
- [ ] `## Estado` em toda tarefa ativa; agentes atualizam
- [ ] 1 tarefa real da kz executada por agente lendo só o `context:` declarado

## Log
- 2026-10-07 — criada a partir do pedido do Oliver; regra de sessão já registrada no `CLAUDE.md` (Sessões e contexto).
