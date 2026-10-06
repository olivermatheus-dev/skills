# Roadmap do hub

Backlog de **construção do repositório** (skills, ferramentas, padrões). Tarefas de marketing de cada empresa ficam em `companies/<slug>/tasks.md`.

## Visão
Central de operações com IA para as empresas do Oliver: pesquisa, estratégia, produção de conteúdo (carrossel, vídeo com base real e motion design), anúncios, LPs e gestão de marketing/vendas — tudo lendo o contexto e a **identidade visual de cada marca**. Futuramente com uma interface para acompanhar tarefas e projetos.

## Como trabalhar (1 tarefa por sessão)
1. Nova sessão (após `/clear`): leia este arquivo → pegue a primeira tarefa com status `pronta` (ou a que o usuário indicar).
2. Leia `tasks/<id>/TASK.md`. Se houver perguntas em aberto, resolva com o usuário antes de codar.
3. Mude o status para `fazendo`, execute, valide os critérios de pronto.
4. Ao terminar: status `feita`, preencha o **Log** do TASK.md (o que foi feito, decisões, próximo passo), commit + push na branch de trabalho.
5. Ideias novas do usuário → `IDEIAS.md`. Quando ficarem claras, viram tarefa aqui.

Status: `rascunho` (ainda sendo definida) · `pronta` (pode começar) · `fazendo` · `feita` · `pausada`

## Fases e tarefas (ordem de execução)

### Fase 1 — Fundação de marca
| id | tarefa | status |
|---|---|---|
| 001 | [Padrão de marca por empresa: tokens + pasta de assets](tasks/001-padrao-de-marca/TASK.md) | rascunho |
| 002 | [Migrar a kz para o padrão de marca](tasks/002-migrar-kz-marca/TASK.md) | rascunho |
| 003 | [Skills passam a consumir os tokens e assets](tasks/003-skills-usam-tokens/TASK.md) | rascunho |

### Fase 2 — Produção visual (carrossel e conteúdo)
| id | tarefa | status |
|---|---|---|
| 004 | [Evolução do carrossel e templates de conteúdo](tasks/004-evolucao-carrossel/TASK.md) | rascunho |

### Fase 3 — Vídeo
| id | tarefa | status |
|---|---|---|
| 005 | [Pesquisa e decisão da stack de vídeo](tasks/005-stack-de-video/TASK.md) | rascunho |
| 006 | [Skill: edição de vídeo com base real](tasks/006-video-base-real/TASK.md) | rascunho |
| 007 | [Skill: vídeo em motion design](tasks/007-video-motion/TASK.md) | rascunho |

### Fase 4 — Gestão
| id | tarefa | status |
|---|---|---|
| 008 | [Interface de gestão de tarefas e projetos](tasks/008-interface-gestao/TASK.md) | rascunho |

> Ordem e escopo ainda em definição — o usuário vai detalhar as ideias nas próximas interações.
