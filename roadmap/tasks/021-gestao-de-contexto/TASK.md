# 021 — Gestão de contexto pela própria IA (sessões, quadro e agentes)

**Status:** feita (2026-10-08). Fase A + 1ª tarefa real (T-0012, rascunho) rodada pelo pacote e medida: `RESULTADO.md`. · **Liga com:** skill `orquestrar` (protocolo), `tools/board.mjs`, `tools/heartbeat.mjs`, `schema/` (tarefa), `roadmap/ESTADO.md`

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

## Como ficou (fase A)
- **`context:`** no frontmatter da tarefa: `[context/BUSINESS.md#Modelo e preço, brand/BRAND.md#Proibições]`. Ref = `arquivo#Seção`, relativa a `companies/<slug>/` ou à raiz; sem `#` = arquivo inteiro (aviso acima de 150 linhas); seção = título de qualquer nível, sem diferença de maiúscula/acento, prefixo basta (`#Diferenciais`); **sem vírgula** (a lista é inline). Lógica em `tools/lib/contexto.mjs`; schema em `schema/task.ts` (junto com `recurring`, que o app apagava ao salvar); app → painel da tarefa → "Dependências, links e contexto" → **Contexto** (um por linha).
- **`node tools/board.mjs pacote <slug> <id>`** = 1ª leitura de todo agente: Estado, descrição/checklist, comentários, 5 últimas linhas do log, Estado da mãe e só os trechos do `context:`. Heartbeat e delegação do orquestrador já mandam começar por ele.
- **`## Estado`** (≤ 5 linhas, logo depois da descrição, visível no app): `node tools/board.mjs estado <slug> <id> "Parou em: …\nPróximo: …\nFalta do Oliver: …"`. Escrito nas ativas da kz (T-0009, T-0011, T-0014).
- **Log compacto:** `node tools/board.mjs compactar <slug> <id> "resumo" [--manter 5]` (o git guarda o histórico).
- **Índice:** `node tools/contexto.mjs indice <slug>` (seções e tamanho, já com a ref curta) · `ler <slug> <ref>…`.
- **`--check`:** ref quebrada = erro; aviso para ativa (`doing`/`review`) sem Estado, Estado > 5 linhas, log > 15 linhas, arquivo inteiro grande.
- **Regras:** protocolo (`orquestrar/references/protocolo.md`: ler pelo pacote; faltou algo → ler a seção e **somar ao `context:`**; Estado a cada marco e no portão), skill `orquestrar` (tabela de `context:` padrão por agente), agentes (linha "Primeiro: pacote" no "Ler antes"; a lista antiga vale só sem `context:`), revisor (soma Restrições e Proibições sempre).
- `context:` preenchido nas tarefas de agente da kz que vão rodar: T-0007 (LP), T-0012 (PNG), T-0013 (QA).

## Critérios de pronto
- [x] `context:` no schema, no protocolo e no `board.mjs --check`; orquestrador preenche
- [x] `## Estado` em toda tarefa ativa; agentes atualizam (regra no protocolo; T-0017 é teste, sem Estado)
- [x] 1 tarefa real da kz executada por agente lendo só o `context:` declarado (T-0012 como rascunho, sem nome/foto, por decisão do Oliver)
- [x] Medir tokens (T-0012: US$ 1,19; leitura de contexto −40%, ~3,5 mil tokens; ver `RESULTADO.md`)

## Log
- 2026-10-07 — criada a partir do pedido do Oliver; regra de sessão já registrada no `CLAUDE.md` (Sessões e contexto).
- 2026-10-08 — fase A: `context:` + `pacote` + `estado` + `compactar` + `contexto.mjs indice/ler` + `--check` + campo no app; regras no protocolo, orquestrar e agentes. Testado: comandos na T-0017 (cópia restaurada), round-trip pelo app (salvar mantém `context:` e `recurring:`), campo Contexto editado e salvo pela tela; typecheck, validate e `--check` limpos. Achado: servidor de prévia herdava um `HUB_ROOT` de outra cópia (lá havia uma T-0018); para testar, pôr `HUB_ROOT` no `env` da config de prévia do `launch.json`.
- 2026-10-08 — T-0012 rodada pelo designer como rascunho (10 PNG, review com o Oliver), começando pelo `pacote`; leu a mais só template, brand.css, logo e um peca.json de exemplo. Medição em `RESULTADO.md`: ganho é foco, não dinheiro (custo dominado por turnos e conferência de PNG). `brand.css` + logo entraram no `context:` padrão do designer.
