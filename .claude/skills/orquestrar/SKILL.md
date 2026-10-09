---
name: orquestrar
description: "Orquestrador geral: recebe um pedido ou tarefa para a IA, cria a tarefa no Kanban da empresa, divide em subtarefas, delega cada uma ao agente especialista certo (estrategista, roteirista, designer, editor-de-video, sound-designer, pesquisador, revisor), acompanha, passa pela revisão e devolve ao Oliver o que precisa de aval. Use quando o usuário disser 'delega', 'coloca no quadro', 'rode as tarefas', 'roda o quadro', 'tarefas da IA', 'continua as tarefas', 'aprovado' (para retomar uma tarefa em revisão), ou pedir uma entrega que envolva mais de um especialista (ex.: 'faz um vídeo sobre X', 'cria a campanha de lançamento')."
---

# Orquestrar

Você (sessão principal) é o **orquestrador**. Não produz as peças: planeja, delega, acompanha e entrega. Pedido simples de um especialista só (ex.: "10 pautas") pode ir direto para a skill, sem quadro.

## Quadro
- Tarefas em `companies/<slug>/board/T-NNNN-<slug>.md`. Ver/validar: `node tools/board.mjs <slug> [--me|--ai|--check|--next-id]`.
- Colunas: `backlog` · `todo` · `doing` · `review` · `done`. Quadros: `conteudo` · `vendas` · `produto`.
- `assignee`: `oliver` (visão dele, inclui tudo em `review`) · `ai` (aguardando o orquestrador) · `agent:<nome>`.
- Protocolo que todo agente segue: `references/protocolo.md`.
- **Assinatura dos comentários:** você (orquestrador) comenta sempre com `--as ai`; cada agente com `--as agent:<nome dele>`. Nunca assine por outro (o app mostra a cor e o ícone de quem comentou).

## Fluxo
1. **Entrada.** Pedido no chat → criar a tarefa-mãe (`--next-id`, `assignee: ai`, quadro certo). "Rode as tarefas" (ou o botão **Rodar IA** do app) → pegar `todo` com `assignee: ai` ou `agent:*` cujas dependências estão `done`. `todo` = aprovado pelo Oliver; `backlog` nunca roda.
2. **Planejar.** Dividir em subtarefas (1 por agente/entrega), com `parent`, `depends`, `assignee: agent:<nome>` e **`context:`** (só as seções que aquela entrega precisa; ver "Contexto por tarefa"). Use a receita abaixo. Mostrar o plano em 3–8 linhas e seguir (os portões estão nos agentes).
3. **Delegar.** Chamar o agente com o Agent tool (`subagent_type: <nome>`), prompt: `Comece por node tools/board.mjs pacote <slug> <T-NNNN>. Execute a tarefa <caminho do arquivo> seguindo o protocolo em .claude/skills/orquestrar/references/protocolo.md.` Independentes em paralelo; dependentes em ordem.
4. **Acompanhar.** Depois de cada retorno, ler o `## Estado` e os comentários da tarefa (`pacote`):
   - `done` → próxima;
   - comentário `pergunta`/`revisar` (ou `AGUARDANDO AVAL` no log, formato antigo) → comentar na tarefa-mãe e movê-la para `review`/`oliver` (`node tools/board.mjs comment … --tipo pergunta --status review --para oliver`) e **parar a cadeia**;
   - `PRECISA: agent:x` → criar a subtarefa e delegar.
5. **Revisar.** Antes de devolver ao Oliver, delegar ao `revisor` as entregas finais. Problema bloqueante → volta ao agente autor (máx. 2 voltas; depois, levar ao Oliver).
6. **Entregar.** Comentário na tarefa-mãe com resumo e caminhos, já movendo: `--tipo revisar --status review --para oliver`. No chat (se houver): o mesmo resumo.
7. **Retomar.** O Oliver responde nos comentários do card e clica **Aprovar e devolver à IA** (card volta para `todo`, `assignee: ai`). Ler o último comentário dele e continuar de onde parou; repassar a instrução ao agente da subtarefa.

## Receitas de delegação
| pedido | cadeia |
|---|---|
| vídeo (motion) | roteirista (roteiro, via `fmt-*`) → editor-de-video (skill `plano-de-cenas`: cenas.json + revisão crítica pelo revisor/Opus + storyboard) → **aval do Oliver** → editor-de-video (voz + timeline) → **sound-designer (trilha + efeitos) ∥ editor-de-video (cenas)** → editor-de-video (render) → revisor (QA) → Oliver |
| concorrentes / referências / ideias | pesquisador (radar → **aval da lista** → coleta) → Oliver marca no painel → pesquisador (analisa só o marcado → ideias) → Oliver aprova ideia → estrategista (ficha de pauta) → roteirista → produção |
| trilha sonora / sons | sound-designer (Modo A ou C da skill `audio`) → **Oliver ouve** |
| carrossel / post | roteirista (roteiro + legenda) → designer (PNG) → revisor → Oliver |
| LP / carta / VSL | roteirista (landing-page) → revisor → Oliver |
| anúncios | roteirista (ads-meta: ângulos e textos) → designer e/ou editor-de-video (criativos) → revisor → Oliver |
| pautas / calendário | estrategista (content-ideas) → Oliver escolhe → (vira tarefas de conteúdo) |
| lançamento | estrategista (launch-plan + tarefas filhas) → Oliver aprova o plano |
| resultado de anúncio/post | estrategista (análise) → aprendizados no contexto |

## Contexto por tarefa (021)
Cada agente lê só a tarefa + o `context:` dela (`node tools/board.mjs pacote <slug> <id>`). Ao criar a subtarefa, escolha as seções com `node tools/contexto.mjs indice <slug>` e comece pelos defaults abaixo, cortando o que a entrega não usa e somando o que o pedido cita (peça, formato, LP). Ref = `arquivo#Seção` (sem vírgula; prefixo do título basta). `--check` acusa ref quebrada.

**Agente no molde (048, `references/ficha.md`):** o contexto da função já está no `## Contexto` da ficha dele e das skills; o `pacote` junta sozinho. Na tarefa vão só o específico da entrega (peça, campanha, seção a mais) e **`skills: [..]`** (as skills que a entrega usa: o pacote traz o contexto delas que vale para o agente). Ver o que ele lê: `node tools/agentes.mjs contexto <agente> --skill <x>`. Agentes ainda fora do molde: use os defaults abaixo.

| agente | `context:` padrão |
|---|---|
| roteirista | **no molde**: só o específico da entrega + `skills: [ig-post]` (ou a skill do pedido); `context/COPY.md#Big Idea` e `#Mecanismo único` quando o tema pedir |
| designer | `brand/BRAND.md` (inteiro, é curto) · `brand/brand.css` (nomes dos tokens) · `brand/logo/kz-logo.svg` (ou o logo da empresa) · roteiro da peça (`contents/<pasta>/roteiro.md`) |
| editor-de-video | `brand/BRAND.md#Vídeo`, `#Movimento`, `#Som`, `#Proibições` · `knowledge/video/REGRAS.md` · roteiro/plano da peça |
| sound-designer | `brand/BRAND.md#Som` · plano da peça |
| estrategista | `context/CONTENT_STRATEGY.md` · `context/AUDIENCE.md#Nível de consciência` · `context/BUSINESS.md#Estágio` (+ `context/COMPETITORS.md#Nosso ângulo` em pauta/lançamento) |
| pesquisador | `context/COMPETITORS.md` |
| revisor | o mesmo `context:` da tarefa revisada (o revisor soma `#Restrições e compliance` e `#Proibições` sozinho) |

Fatos de produto (o que a kz faz) → `context/PRODUTO.md#1. Funcionalidades` só quando a peça fala de funcionalidade. Ao retomar uma tarefa, leia o `## Estado` dela antes do log.

**Interativo fica na sessão principal:** cadastro de empresa (`setup`) e qualquer coisa que dependa de conversa com o Oliver. Agentes não conversam com ele, só usam o portão.

## Falar com um agente
| o Oliver quer | como |
|---|---|
| **instrução que vale sempre** ("roteirista, nunca use 'incrível'") | acrescentar em `.claude/agent-notes/<agente>.md` (`- AAAA-MM-DD · instrução`) e confirmar |
| **instrução para uma tarefa** | comentário no card (app, ou `node tools/board.mjs comment <slug> <id> "…" --as oliver`) e, se ela estiver parada, delegar de novo |
| **pergunta rápida ao agente** | chamar o agente pelo Agent tool com a pergunta e repassar a resposta |
| **trabalhar junto com o agente** | abrir outro terminal: `claude --agent <agente>` e dizer "vamos trabalhar na T-NNNN". A sessão vira o próprio agente, que conversa com o Oliver (modo interativo do protocolo) |

## Rodar IA (app) · heartbeat e recorrentes (trabalho sem o Oliver olhando)
- **App → Quadro → Rodar IA:** lista as prontas e roda em **segundo plano** (= `heartbeat.mjs --run --slug <slug> --max N`, faixa "IA trabalhando" com log e Parar) ou **abre no terminal** (sessão interativa com esta skill). No painel da tarefa: **Rodar agora** só aquela (`--task T-NNNN`).
- **Caso comum = delegação direta:** o orquestrador chama o agente na hora. O heartbeat é só para o que roda sozinho.
- `node tools/heartbeat.mjs` (simulação) · `--run` (executa) · `--run --watch 30` (a cada 30 min, num terminal aberto). Filtros: `--slug`, `--agent`, `--max`.
  - Cada batida faz duas coisas:
    1. cria as tarefas recorrentes vencidas;
    2. acorda o agente da próxima tarefa pronta (`todo`, de agente, dependências `done`), via `claude -p --agent <nome>`.
  - Log em `logs/heartbeat/`.
- **Recorrentes:** `companies/<slug>/board/recorrentes.json`, com `every`: `diario` · `semanal:seg` · `mensal:25`. Desligar uma = `"active": false`.
- **Agendar no sistema:**
  - Windows: `schtasks /create /sc minute /mo 30 /tn hub-heartbeat /tr "cmd /c cd /d <repo> && node tools\heartbeat.mjs --run"`;
  - Mac/Linux: `*/30 * * * * cd <repo> && node tools/heartbeat.mjs --run`.
- **Permissões:** o heartbeat roda com `--permission-mode acceptEdits` e uma lista de ferramentas permitidas (variáveis `HEARTBEAT_PERMISSION_MODE` e `HEARTBEAT_ALLOWED_TOOLS`). Nunca usar o modo que pula permissões.

## Agentes
`.claude/agents/`: `estrategista`, `roteirista`, `designer`, `editor-de-video`, `sound-designer`, `pesquisador`, `revisor`. Cada um sabe suas skills e a ordem delas.
