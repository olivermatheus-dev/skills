# Roadmap do hub

Backlog de **construção do repositório** (skills, ferramentas, padrões). Tarefas de marketing de cada empresa ficam em `companies/<slug>/tasks.md`.

## Visão
Repositório **genérico e local** que funciona como central de operações com IA: qualquer empresa ou projeto novo é cadastrado pelo próprio chat do Claude Code ("vamos registrar a empresa X" + arquivos), e a partir daí tudo — pesquisa, estratégia, conteúdo, anúncios, LPs, **vídeo** e gestão — usa o contexto e a identidade visual daquela marca.

Princípios:
- **Local-first.** Arquivos pesados (vídeos brutos, renders, fontes/fotos em alta) não vão para o git. Destino definitivo deles: decidir depois.
- **Genérico.** Nada hardcoded para uma empresa; a kz é só a primeira.
- **Defaults profissionais.** O usuário escolhe estilo/template; parâmetros técnicos (timing, easing, safe areas) já vêm bons de fábrica.

## Como trabalhar (1 tarefa por sessão)
1. Nova sessão (após `/clear`): leia este arquivo → pegue a próxima tarefa `pronta` (ou a que o usuário indicar).
2. Leia `tasks/<id>-<slug>/TASK.md`. Perguntas em aberto → resolva com o usuário antes de implementar.
3. Status `fazendo` → execute → valide os critérios de pronto.
4. Ao terminar: status `feita`, preencha o **Log** (o que foi feito, decisões, próximo passo), atualize esta tabela, commit + push.
5. Ideias novas → `IDEIAS.md`. Quando claras, viram tarefa aqui.

Status: `rascunho` (definindo) · `pronta` · `fazendo` · `feita` · `pausada`

## Fase 1 — Fundação: repositório genérico + marca
| id | tarefa | depende | status |
|---|---|---|---|
| 001 | [Estrutura genérica de empresa/projeto + pasta de marca + regra de arquivos pesados](tasks/001-estrutura-generica/TASK.md) | — | rascunho |
| 002 | [Cadastro de empresa via chat (onboarding + recebimento de arquivos)](tasks/002-cadastro-via-chat/TASK.md) | 001 | rascunho |
| 003 | [Migrar a kz para a nova estrutura](tasks/003-migrar-kz/TASK.md) | 002 | rascunho |
| 004 | [Skills passam a usar tokens e assets da marca](tasks/004-skills-usam-marca/TASK.md) | 003 | rascunho |

## Fase 2 — Conteúdo visual
| id | tarefa | depende | status |
|---|---|---|---|
| 005 | [Evolução do carrossel e templates de conteúdo](tasks/005-evolucao-carrossel/TASK.md) | 004 | rascunho |

## Fase 3 — Projeto Vídeo (visão completa em [VIDEO.md](VIDEO.md))
| id | tarefa | depende | status |
|---|---|---|---|
| 101 | [Arquitetura e stack do editor de vídeo](tasks/101-arquitetura-editor-video/TASK.md) | 001 | rascunho |
| 102 | [Especificação de estilo/template de vídeo + presets profissionais](tasks/102-spec-estilo-video/TASK.md) | 101 | rascunho |
| 103 | [Skill: briefing de vídeo](tasks/103-skill-briefing-video/TASK.md) | 102 | rascunho |
| 104 | [MVP: template estático (moldura + texto sobre vídeo)](tasks/104-mvp-template-estatico/TASK.md) | 102 | rascunho |
| 105 | [Edição com base real (cortes, legendas animadas, zooms)](tasks/105-edicao-base-real/TASK.md) | 104 | rascunho |
| 106 | [Skill: engenharia reversa de vídeo → estilo](tasks/106-engenharia-reversa-video/TASK.md) | 105 | rascunho |
| 107 | [Motion design 100% gerado](tasks/107-motion-design/TASK.md) | 104 | rascunho |
| 108 | [Produção em lote com o mesmo template](tasks/108-producao-em-lote/TASK.md) | 105 | rascunho |

## Fase 4 — Gestão
| id | tarefa | depende | status |
|---|---|---|---|
| 201 | [Interface de gestão de tarefas, projetos e peças](tasks/201-interface-gestao/TASK.md) | 001 | rascunho |
