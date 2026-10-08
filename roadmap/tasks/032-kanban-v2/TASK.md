# 032 — Kanban v2: criar na coluna, comentários da IA no card e botão Rodar IA

Status: **fase A feita (2026-10-08)** · próximo: o Oliver fazer `/login` no Claude Code do terminal e testar o Rodar IA de verdade (T-0017) · Depende de: 018 (app), 019 (shadcn, Lucide) · Referência: Paperclip AI (issues + comentários dos agentes + heartbeat), mas **só arquivos de texto**, sem banco.

## Pedido do Oliver (2026-10-08)
Revisão visual do quadro; criar tarefa direto numa coluna, estilo Trello (só o título, detalhes no painel lateral); espaço para a IA comentar dentro da tarefa (o que fez, o que revisar) num fluxo simples; botão para rodar o Claude Code nas tarefas aprovadas com os agentes.

## Decisões
- **Nenhum arquivo novo por tarefa.** Comentários ficam no próprio `board/T-NNNN-*.md`, seção `## Comentários` antes do `## Log` (que segue a última):
  ```
  ## Comentários
  ### 2026-10-08 14:32 · agent:roteirista · revisar
  Texto livre (várias linhas).
  ```
  Tipos: sem tipo = nota · `revisar` = conferir entrega · `pergunta` = precisa de resposta. O card fica marcado "Revisar/Pergunta" enquanto o último comentário for da IA com tipo (`pendingAsk`).
- **Log × comentário:** log = trilha curta de marcos; comentário = o que o Oliver lê. Agentes comentam só pela CLI: `node tools/board.mjs comment <slug> <id> "texto" --as agent:<nome> [--tipo revisar|pergunta] [--status review --para oliver]` (protocolo e skill `orquestrar` atualizados; o portão agora é um comentário `pergunta`/`revisar`).
- **Aprovado = coluna A fazer.** Backlog nunca roda. Pronta para a IA = A fazer · responsável `ai`/`agent:*` · dependências feitas (mesma regra no app e no heartbeat).
- **Rodar IA** reaproveita o heartbeat (nada de executor novo): segundo plano = `tools/heartbeat.mjs --run --slug <slug> --max N [--task T-NNNN]`; terminal = janela interativa com `claude "Use a skill orquestrar…"` (Windows: `logs/abrir-ia.cmd`). Estado = `logs/heartbeat/.lock` em JSON (pid, tarefa, início, log); processo morto = lock descartado. Parar = mata a árvore e devolve a tarefa para A fazer com comentário.

## Feito (fase A)
- **Formato:** `schema/task.ts` (`splitTaskBody`, `joinTaskBody`, `pendingAsk`, `nowStamp`); mesmo formato em `tools/lib/board.mjs` (`addComment`). Ida e volta testada nas 16 tarefas reais da kz sem perda. Leitor do `board.mjs` agora aceita CRLF.
- **Servidor:** `POST /tasks/:id/comments` (comentário + opcionalmente status/responsável), `GET|POST|DELETE /runner` (`core/runner.ts`). Tarefa nova não repete mais o título na descrição.
- **Quadro** (`pages/Board.tsx`): ícones Lucide por coluna com dica do significado, `+` no cabeçalho e **Adicionar tarefa** no pé de cada coluna (Enter cria e mantém aberto, Ctrl+Enter cria e abre o painel, chip Oliver/IA para quem faz); botão **Rodar IA** com nº de prontas (lista, segundo plano ou terminal); faixa **IA trabalhando** (tarefa, tempo, log ao vivo, Parar); o quadro se atualiza a cada 4 s enquanto roda.
- **Card:** avatar do responsável (Oliver ou ícone do agente), selos **IA trabalhando** / **Revisar** / **Pergunta para você**, "pronta", nº de comentários, ícones Lucide.
- **Painel:** faixa de próximo passo (Aprovar e concluir · Aprovar e devolver à IA · Aprovar backlog → A fazer · Rodar agora / No terminal), propriedades, dependências e links recolhidos, descrição + checklist no editor (sem comentários e log misturados), **thread de comentários** com caixa de resposta (Comentar · Comentar e devolver à IA), **Atividade** (log) recolhida. Salvar junta a descrição editada com os comentários e o log atuais do arquivo (o que a IA escreveu enquanto você editava não se perde).
- **Heartbeat:** `--task`, lock em JSON, saída do Claude direto no log, aspas corretas no Windows (antes `Bash(node tools/*)` e o prompt eram quebrados em pedaços), variáveis da sessão-mãe do Claude removidas do filho, falha vira comentário `revisar` no card e a tarefa volta para A fazer; "não logado" vira instrução clara.

## Testado
Criar na coluna (T-0017), comentário de agente pela CLI → selo e faixa no painel, Comentar e devolver à IA (arquivo: comentário + `todo`/`ai` + log), Rodar agora (heartbeat de verdade: falhou por falta de login → comentário certo e volta para A fazer), faixa IA trabalhando + log + Parar (lock simulado), popover do Rodar IA, `npm run typecheck`, `node tools/board.mjs kz --check`.
**Não verificado:** a janela do "No terminal" (o sandbox desta sessão não abre janelas; o `.cmd` foi gerado certo) e uma execução completa de agente (o `claude` do terminal desta máquina está **sem login**).

## Falta
- **Oliver:** abrir um terminal na pasta do hub, rodar `claude` e fazer `/login` uma vez (o app desktop tem login próprio). Depois: Quadro → T-0017 → Rodar agora; deve aparecer o comentário "Oi, Oliver!" e o card ir para Revisão. Pode arquivar a T-0017 depois.
- Fase B (ideias): Rodar IA em fila contínua (`--watch`) ligável no app; menção `@agente` no comentário virar delegação; filtro "esperando você"; print colado no comentário; custo da execução no card (`tools/usage.mjs`).
