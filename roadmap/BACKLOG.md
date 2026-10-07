# Roadmap do hub

Backlog de **construção do repositório**. Tarefas de marketing de cada empresa ficam em `companies/<slug>/tasks.md`.

## Meta do MVP
**12 posts da kz prontos para publicar** (carrosséis, posts estáticos e vídeos em motion graphics sobre o produto), produzidos por skills que funcionam de verdade, incluindo **mini skills por tipo e estilo de conteúdo** (3D, diálogos, memes etc.). A interface visual (Vite), a inteligência de mercado e o resto só vêm depois disso.

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
| 001 | [Estrutura de empresa + pasta de marca + `_inbox` (kz migrada)](tasks/001-estrutura-e-marca/TASK.md) | — | feita (faltam arquivos reais da kz) |
| 002 | [Base de conhecimento de motion (material do usuário → referências da skill)](tasks/002-conhecimento-motion/TASK.md) | — | contínua |
| 003 | [Stack de render de motion + protótipo](tasks/003-stack-motion/TASK.md) | 001 | rascunho |
| 004 | [Motor de motion graphics v1 (skill base de vídeo)](tasks/004-skill-motion-v1/TASK.md) | 002, 003 | skill escrita; falta o kit de render (003) |
| 005 | [Formatos: arquitetura e catálogo de mini skills por tipo/estilo de conteúdo](tasks/005-formatos-mini-skills/TASK.md) | 004 | 9 formatos escritos; imagem testada; vídeo depende do kit |
| 006 | [Meta: 12 posts da kz](tasks/006-meta-12-posts-kz/TASK.md) | 005 | rascunho |
| 008 | [Biblioteca de áudio inicial (famílias de SFX + 3–5 trilhas base)](tasks/008-biblioteca-audio/TASK.md) | 003 | rascunho |
| 007 | [Formato tipado dos arquivos (projeto, personas, kanban, comentários, concorrentes)](tasks/007-formato-tipado/TASK.md) | — | Kanban + agentes feitos; faltam project.yml, personas, comentários, concorrentes |

Adiado (sem pasta): ver `DEPOIS.md`. Depois do MVP: app em Vite (`APP.md`: projetos, kanban, concorrentes, agentes) e `INTEL.md` (monitoramento de concorrentes e tendências). Caixa de entrada: `IDEIAS.md`.
