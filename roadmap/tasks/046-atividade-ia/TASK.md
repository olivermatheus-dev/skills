# 046 · Atividade da IA e das coletas no app (dock + página Agentes)

> Pedido do Oliver em 2026-10-08: usar o app para quase tudo. Todo clique que aciona IA ou coleta (web scraping) precisa mostrar, no lugar do clique e no app inteiro, **o que está rodando, qual agente e em que passo**, e avisar quando termina. Toast minimizado com as ações em andamento (opacidade baixa navegando, volta ao passar o mouse) + página dedicada aos agentes (acordado, trabalhando, sessões, histórico).
> Status: **análise feita, aguardando aval** (2026-10-08).

## Diagnóstico (como funciona hoje)

**Caminho do clique até o Claude:** botão → rota em `app/server/handler.ts` → `core/runner.ts` → um destes:
1. **Segundo plano:** `node tools/heartbeat.mjs --run …` (destacado) → `claude -p` (com `--agent` se a tarefa for de um agente). Estado = **um lock só** (`logs/heartbeat/.lock`: pid, título, quem). Saída do Claude vai para `logs/heartbeat/<data>.log`.
2. **Janela de terminal:** `openTerminal()` grava `logs/abrir-ia.cmd` e abre o `claude` interativo. **O app não sabe mais nada** depois disso.

**Está funcionando?** Sim, no essencial. `claude` está logado (`claude auth status` = claude.ai). Log de hoje: o Rodar IA do quadro rodou a T-0017 de ponta a ponta (15:05, 47 s, foi para `review`) depois de 4 falhas por falta de login; a fila de fichas fez 4 análises certas. **Mas 2 de 6 rodadas de fichas morreram** com o código `3221225786` (= `0xC000013A`, processo encerrado pelo Ctrl+C/fechamento do console): o Claude filho morre junto quando o terminal do `npm run app` reinicia ou fecha.

### O que cada ponto de disparo mostra hoje
| onde (app) | o quê | como roda | feedback hoje | problema |
|---|---|---|---|---|
| Quadro → Rodar IA | tarefas prontas | heartbeat | faixa ao vivo **só no Quadro** (polling 3 s), log, Parar | log fica vazio até o fim (`claude -p` só imprime o resultado final); não diz o agente/subagente nem o passo |
| Quadro → Rodar IA (terminal) | idem | janela | toast "aberto" | **nada no app** depois |
| Concorrentes → Conteúdos/Anúncios → Analisar | fila de fichas | heartbeat `--fichas` | barra na própria aba (polling) | passo quase sempre "Abrindo o Claude Code"; morre se o app reinicia |
| Ideias → Pesquisar ideias | rodada de curadoria | heartbeat `--pesquisa` ou janela | aba Pesquisas (polling pelos arquivos) | nunca rodada pelo botão ainda |
| Concorrente → Análise (módulos de IA) | perfis, preços, features… | **não roda**: grava `pedido.json` | dica "diga ao Claude: roda a fila de concorrentes" | **sem botão de rodar**: exige terminal |
| Conteúdos → anotações no vídeo/slides/roteiro | ajustes | **não roda** | dica "peça: revisa as anotações de …" | **sem botão "Pedir ajustes ao Claude"** |
| Concorrente → Relatório | relatório Opus | só janela de terminal | nada | sem segundo plano nem andamento |
| Concorrentes → Puxar / Coletas / Anúncios | scraping | **requisição HTTP presa** até acabar (1–2 min por concorrente) | spinner/toast **só no componente** | sair da página perde o andamento; não aparece em lugar nenhum |
| Site / Reclame Aqui | scraping | requisição presa | idem | idem |
| Coleta semanal | redes + anúncios | segundo plano no processo do app | painel na aba Coletas (polling) | só visível na aba |
| Vídeo → Gerar prévia · Mockup → Exportar | render | processo filho | no componente | idem |

### Falhas de desenho
1. **Não existe um registro único de "o que está rodando".** Cada fluxo tem seu jeito (lock, `progresso.json`, `pedido.json`, estado do componente). Por isso não há dock global nem página de agentes.
2. **Um lock para tudo:** só uma IA por vez no projeto inteiro. O segundo clique dá erro "o pedido ficou na fila: rode quando ela terminar", mas **não há fila**: nada roda sozinho depois.
3. **Sem passos:** `claude -p` em texto só escreve no fim. Dá para ver cada ferramenta, cada subagente acordado e o custo com `--output-format stream-json --verbose`.
4. **Modo terminal é cego** para o app. Hooks do Claude Code (`SessionStart`, `PreToolUse`, `SubagentStart/Stop`, `Stop`) resolvem isso, inclusive para sessões que o Oliver abre à mão.
5. **Coletas presas na requisição**: deviam ser trabalhos em segundo plano com id.
6. Dois botões que faltam (análise de concorrente, ajustes por anotação) quebram a regra "falar com a IA pelo app tem que ser fácil" (`roadmap/APP.md`).

## Plano (fases, cada uma entregável sozinha)

**A · Registro de atividade + dock** (base de tudo)
- `core/atividade.ts`: um arquivo por trabalho em `logs/atividade/<id>.json` (fora do git): `tipo` (ia | coleta | render), `titulo`, `agente`, `passo`, `status` (fila · rodando · feito · erro · parado), `inicio/fim`, `pid`, `link` (rota do app onde ver o resultado), `log`. Funções `iniciar · passo · terminar · listar · parar`.
- Ligar o que já existe: heartbeat (tarefa, fichas, pesquisa), coleta semanal, prévia de vídeo, export de mockup.
- Rota `GET /api/atividade` (polling 2 s com algo rodando, 15 s parado).
- **Dock** no `Layout`: pílula fixa no canto inferior direito, compacta (avatar do agente · "Designer · exportando slide 3/8" · 2:14). Opacidade ~0,4 enquanto navega, volta a 1 com o mouse em cima. Clique abre a lista (Abrir onde rodou · Ver log · Parar). Ao terminar: toast "Pronto: … · Ver resultado"; erro fica vermelho até ser visto.

**B · Passos de verdade**: heartbeat com `stream-json` → cada linha vira `passo` legível ("lendo PRODUTO.md", "rodando npm run fichas", "delegou ao designer") e `agente` ativo (ferramenta Agent → `subagent_type`); custo e duração no fim. O texto final continua no log. Também: o Claude filho sair do grupo do console (morre hoje com o código `0xC000013A`).

**C · Coletas como trabalho**: Puxar, Coletas, Anúncios, Site, Reclame Aqui respondem na hora com o id e rodam no fundo; o componente acompanha pelo registro (e o dock também). Coletas podem rodar em paralelo à IA.

**D · Botões que faltam** (mesmo diálogo simples dos outros):
- Conteúdos → **Pedir ajustes ao Claude** (anotações abertas do vídeo, slides ou roteiro → skill `video`/`carousel` → `review.mjs resolve`); a anotação mostra "em ajuste" e depois a resposta da IA.
- Concorrente → Análise → **Rodar agora** (fila da skill `analise-concorrentes`).
- Relatório em segundo plano (hoje só terminal).

**E · Página Agentes** (nova rota `agentes`): um cartão por agente (orquestrador + 7): dormindo · acordado · trabalhando, em quê, desde quando, últimas entregas; fila do que vem; aba **Sessões/Histórico** (cada trabalho com passos, duração, custo e log); atalho para as instruções permanentes (`.claude/agent-notes/`). Hooks em `.claude/settings.json` gravam no mesmo registro as sessões abertas no terminal.

**F · Fila de verdade**: IA uma por vez (custo e limite da conta), o resto entra como "na fila" e roda sozinho ao acabar a anterior (sob clique, nada agendado). Coletas e renders não esperam a IA.

## Decisões (padrões aplicados, o Oliver pode mudar)
- IA uma por vez + fila; coletas em paralelo.
- Dock aparece só com algo rodando ou com resultado não visto.
- Nada recorrente: tudo continua só sob clique.

## Log
- 2026-10-08 · análise do fluxo app → orquestrador, inventário dos 12 pontos de disparo, plano A–F.
