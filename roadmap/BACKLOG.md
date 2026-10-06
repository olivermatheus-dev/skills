# Roadmap do hub

Backlog de **construção do repositório**. Tarefas de marketing de cada empresa ficam em `companies/<slug>/tasks.md`.

## Prioridade atual
**Skills de vídeo em motion graphics, funcionando de verdade, para os vídeos de lançamento da kz** (SaaS para terapeutas). Todo o resto espera.

Princípios:
- **Só construir o que vai ser usado agora.** Ideia boa, mas não prioritária, vai para `IDEIAS.md` ou `DEPOIS.md`, sem pasta e sem código.
- **Repositório genérico e local.** A kz é a primeira empresa, não a única. Arquivos pesados ficam fora do git.
- **Qualidade profissional de fábrica.** Timing, easing e áreas seguras já vêm pré-configurados; a empresa só escolhe o estilo.

## Como trabalhar (1 tarefa por sessão)
1. Nova sessão (após `/clear`): leia este arquivo, depois `VIDEO.md`, e pegue a tarefa da vez.
2. Leia `tasks/<id>-<slug>/TASK.md`. Resolva as perguntas em aberto com o usuário antes de implementar.
3. Mude o status para `fazendo`, execute e valide os critérios de pronto.
4. Ao terminar: status `feita`, preencha o **Log** (o que foi feito, decisões, próximo passo), atualize esta tabela, faça commit + push.

Status: `rascunho` · `pronta` · `fazendo` · `feita` · `contínua`

## Tarefas (em ordem)
| id | tarefa | depende | status |
|---|---|---|---|
| 001 | [Estrutura de empresa + pasta de marca + `_inbox` (kz migrada)](tasks/001-estrutura-e-marca/TASK.md) | — | pronta |
| 002 | [Base de conhecimento de motion (material do usuário → referências da skill)](tasks/002-conhecimento-motion/TASK.md) | — | contínua |
| 003 | [Stack de render de motion + protótipo](tasks/003-stack-motion/TASK.md) | 001 | rascunho |
| 004 | [Skill de motion graphics v1](tasks/004-skill-motion-v1/TASK.md) | 002, 003 | rascunho |
| 005 | [Vídeos de lançamento da kz](tasks/005-videos-lancamento-kz/TASK.md) | 004 | rascunho |

Adiado (sem pasta): ver `DEPOIS.md`. Caixa de entrada: `IDEIAS.md`.
