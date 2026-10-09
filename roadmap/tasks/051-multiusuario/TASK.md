# 051 — Hub multiusuário: Oliver + sócio (e os agentes dos dois) ao mesmo tempo

Status: rascunho (plano escrito em 2026-10-09; **nada implementado**) · aguarda as decisões do Oliver (seção 7)

## Pedido
O Oliver vai trabalhar no hub junto com o sócio, os dois ao mesmo tempo, cada um com o app local e o Claude Code com agentes. Hoje tudo é arquivo no git (`APP.md`: "os arquivos do repo são a fonte da verdade, nada de banco por enquanto").

Recomendação aceita no princípio (híbrida):
- **git** continua com o que é código e texto autoral revisável: código, skills, agentes, contexto, marca, roteiros.
- **banco remoto** (MongoDB Atlas, região São Paulo) guarda o **estado operacional** que os dois e os agentes escrevem ao mesmo tempo: quadro, comentários, filas da IA, ideias, coletas e análises de concorrentes, intel.
- **armazenamento de objetos** (Cloudflare R2) guarda os binários pesados (vídeo, áudio, renders).
- Agentes **não** usam MCP genérico do Mongo: usam comandos prontos dos scripts que já existem (`tools/board.mjs pacote/comment…`), com **reivindicar tarefa** atômico.
- Antes de qualquer banco, uma **fase 0 só com git**.

Prova de que o problema já existe: hoje, com duas sessões do Claude na mesma máquina, duas tarefas nasceram como `049` (`049-design-carrossel` e `049-videos-versoes…`, esta renomeada para 050). Com duas máquinas isso vira regra, não exceção.

---

## 1. Levantamento: o que é escrito por quem

Levantado em 2026-10-09 (`git ls-files`, `core/store.ts`, `tools/lib/*.mjs`, `tools/heartbeat.mjs`). Em `companies/kz/` há ~530 arquivos no git: 244 em `competitors/`, 164 em `contents/`.

### 1.1 Texto autoral (fica no git; conflito raro e legível)
| caminho | quem escreve | obs. |
|---|---|---|
| `companies/<slug>/context/*.md` | Oliver, skill `setup` | conflito real só se os dois editarem o mesmo arquivo; PR resolve |
| `brand/BRAND.md`, `brand/brand.json` (+ `brand.css` gerado), `brand/logo,icons,fonts,…` | Oliver (app → Kit de marca) | `brand.css` é gerado: em conflito, regenerar (`npm run brand`) |
| `personas/*.md`, `project.yml`, `tags.yml` | Oliver, `setup` | raro |
| `contents/<peça>/roteiro.md`, `plano.md`, `cenas.json`, `revisao-plano-*.md`, `notas-*.md` | roteirista, editor, Oliver | autoral, mas da **peça**: regra "um dono por peça" (seção 3.4) |
| `contents/<peça>/timeline.json`, `composition.html`, `blocos/`, `style/`, `versoes/vNN/` | editor-de-vídeo (máquina) | é **fonte** de vídeo, como código; fica no git com dono por peça |
| `campaigns/*/*.md`, `video-templates/` | roteirista, editor | autoral |
| `.claude/` (skills, agents, agent-notes), `library/formatos/`, `knowledge/`, `roadmap/`, `schema/`, `tools/`, `core/`, `app/` | Oliver + Claude | código: branch + PR |

### 1.2 Escrito por máquina ou pelos dois ao mesmo tempo (fonte de conflito)
| caminho | quem escreve | por que conflita | destino |
|---|---|---|---|
| `board/T-NNNN-*.md` | app (Oliver/sócio), heartbeat (`status: doing`), agentes (`board.mjs comment`, `## Log`) | **ID sequencial** por varredura de pasta (`nextTaskId`, `board.mjs --next-id`) → dois `T-0017`; status e log editados por 3 escritores | F0: faixa de ID; F1: banco |
| `board/recorrentes.json` | heartbeat (`last`) | dois heartbeats criam a mesma recorrente duas vezes | F1: banco (índice único) |
| `ideas/I-NNNN-*.md` | app, pesquisador, curadoria | ID sequencial | F0: faixa; F1: banco |
| `notes/*.md` | app | baixo, mas os dois anotam | F1: banco |
| `curadoria/fontes.json`, `referencias/R-NNNN.json`, `rodadas/<id>/{pedido,consultas,resultado}.json` | app + script + agente | ID sequencial (`nextRefId`); `fontes.json` é arquivo único editado pelos dois | F1: banco |
| `competitors/<id>/competitor.md` | app + `radar` | ficha editada pelos dois | F1: banco |
| `competitors/<id>/snapshots/<perfil>/<data>.json` | coletores (`npm run collect`, coleta semanal) | **gerado**, cresce a cada coleta; hoje 86 no git (2,1 MB) + dezenas não commitados | F0: fora do git; F1: banco |
| `competitors/<id>/ads/<data>.json` | `npm run ads` | gerado | idem |
| `competitors/<id>/analysis/{<modulo>,pedido,notas}.json` | fila do app (`pedido.json`), subagentes (resultado), Oliver (`notas.json`) | três escritores no mesmo diretório; `pedido.json` é fila | F1: banco |
| `competitors/<id>/marks.json`, `ads/marks.json` | app (marcar, favoritar, salvar anúncio) | arquivo único por concorrente, os dois marcam | F1: banco |
| `competitors/<id>/fichas/`, `relatorios/` | `npm run fichas`, Opus | gerado | F1: banco |
| `intel/coleta-semanal.json`, `intel/semanas/AAAA-Wss.md` | `npm run intel:semanal` | gerado | F1: banco (o `.md` semanal pode continuar exportado) |
| `intel/matriz.json`, `brechas.json`, `referencia.json` | app (célula a célula) + agente | arquivo único, edição fina pelos dois | F1: banco |
| `contents/<peça>/peca.json` | app (status, principal, legenda) + agentes | ficha da peça, dois escritores | F1: banco |
| `contents/<peça>/revisao.json` | Oliver anota no app; agente responde (`review.mjs responde`, `pedidos-ia.mjs`) | escrita concorrente certa (anotar enquanto o agente responde) | F1: banco |
| `contents/<peça>/variantes/indice.json`, `insumos` (`tools/lib/insumos.mjs`) | app + `variantes.mjs` | gerado + editado | F1: banco |
| `campaigns/LOG_ANGULOS.md` | `pacote.mjs` (append) | só acrescenta linhas | F0: `merge=union` |
| `capturas/*/original.png`, `contents/*/storyboard-*.png`, `library/mockups/` (196 arquivos) | mockup, plano de cenas | **binário no git** | F2: R2 |

### 1.3 Estado local por máquina (fora do git) — hoje invisível para o outro
Achado importante: as filas da IA vivem em `logs/`, que é **local**. Com duas máquinas, cada uma tem a sua fila e um não vê o pedido do outro.
| caminho | o que é |
|---|---|
| `logs/pedidos-ia/<id>.json` (`tools/lib/pedidos-ia.mjs`) | "Pedir à IA" do app |
| `logs/fila-ia/` (`tools/lib/fila-ia.mjs`) | fila do heartbeat |
| `logs/atividade/` (`tools/lib/atividade.mjs`, `core/atividade.ts`) | painel Atividade da IA |
| `logs/heartbeat/.lock` | 1 trabalho por vez **nesta máquina** (flag `wx` + pid + toque a cada 30 s) |
| `data/intel/`, `data/curadoria/` | brutos refazíveis (áudio, quadros, páginas) — continuam locais |
| `render/`, `exports/`, `companies/**/audio|media/`, `competitors/*/site/` | binários/caches — já fora do git |
| `companies/<slug>/.env`, `.env` | chaves (decisão 7.6) |

---

## 2. Fase 0 — só git (sem banco; dá para começar já)
Objetivo: os dois trabalham no mesmo repo sem conflito diário e sem colisão de ID. Tudo reversível.

### 2.1 Sai do git
`.gitignore` ganha:
```
companies/*/competitors/*/snapshots/
companies/*/competitors/*/ads/*.json
!companies/*/competitors/*/ads/marks.json
companies/*/intel/coleta-semanal.json
```
+ `git rm -r --cached` dos 86 snapshots e dos `ads/*.json` já commitados (o arquivo continua no disco). Histórico antigo fica como está (2,1 MB, não vale reescrever).

**Onde guardar os snapshots na fase 0:** continuam no disco, no mesmo caminho (o app não muda). Para o sócio ver os mesmos dados:
- **(recomendado)** um dono da coleta (Oliver) roda as coletas; `node tools/dados.mjs enviar|receber` sincroniza `competitors/*/snapshots` e `ads/` com um bucket R2 (`hub-dados/<slug>/…`) **sob comando** (botão no app + terminal; nada agendado — regra do Oliver). Mesmo script serve depois para os binários (seção 4).
- alternativa sem nuvem nova: pasta compartilhada (Google Drive/OneDrive para desktop) e `HUB_DATA_DIR` apontando os snapshots para lá. Mais simples, mas o Drive faz cópias "conflito (1)" em escrita simultânea.

### 2.2 `.gitattributes` (novo)
```
* text=auto eol=lf
*.png *.jpg *.webp *.woff2 *.ttf *.otf binary
companies/*/campaigns/LOG_ANGULOS.md merge=union
companies/*/competitors/*/analysis/*.json -diff linguist-generated
companies/*/competitors/*/fichas/** -diff linguist-generated
companies/*/intel/*.json -diff linguist-generated
companies/*/brand/brand.css -diff linguist-generated
```
- `eol=lf` resolve de vez o CRLF do Windows (já mordeu, ver memória "edição por shell"); rodar `git add --renormalize .` num commit só.
- **`merge=union` só em arquivo que só cresce.** Não usar nos `board/T-*.md`: o union juntaria as duas linhas `status:` do frontmatter e quebraria o schema. O `## Log` do card é append, mas o card inteiro não.

### 2.3 IDs sem colisão (antes do banco)
Todo gerador de ID sequencial passa por uma função só (`tools/lib/ids.mjs`, usada por `core/store.ts` e pelos scripts): `nextTaskId`, `nextIdeaId`, `nextRefId`, `board.mjs --next-id`, e o `pecas.mjs --next-id` da 050 C.
- **(recomendado) faixa por pessoa:** Oliver `0001–4999`, sócio `5001–9999`, definido em `HUB_USUARIO=oliver|socio` no `.env` local. Mantém o formato `T-\d{4}` dos schemas e o ID diz quem criou.
- alternativa: sufixo de iniciais (`T-0017-mo`): exige mudar regex em `schema/task.ts`, `idea.ts`, `curadoria.ts`.
- Tarefas do `roadmap/tasks/` (construção do hub): mesma regra, ou só o Oliver cria.

### 2.4 Fluxo de branches
- **Código, skills, agentes, contexto, marca** → branch curta por pessoa (`oliver/<assunto>`, `socio/<assunto>`), PR no GitHub, merge rápido (squash). O `CLAUDE.md` já manda "commit + push" ao fim: passa a ser "push na branch + PR".
- **Dados operacionais que ficam no git na fase 0** (board, ideias, notas, marcas, análises, peças) → direto na `main` com `npm run sync` (novo): `git pull --rebase --autostash` → commit só de `companies/` com mensagem `dados: <usuario> <hora>` → `push`; em conflito, para e mostra os arquivos. Botão "Sincronizar" no app chama o mesmo.
- Config de cada máquina (documentar no README): `pull.rebase=true`, `rebase.autoStash=true`, `rerere.enabled=true`, `core.autocrlf=false`.
- **Um dono por peça e por tarefa:** a pessoa (ou o agente dela) que move a tarefa para `doing` é dona dos arquivos da peça até `review`. Na fase 0 isso é combinado + `assignee`; na fase 1 é o *lease* do banco (3.4).
- Heartbeat: na fase 0, **só uma máquina roda `--run`** (decisão 7.7), senão dois agentes pegam a mesma tarefa (o lock `logs/heartbeat/.lock` é por máquina).

### 2.5 Pronto da fase 0
- snapshots fora do git; `.gitattributes` aplicado e renormalizado; IDs por faixa em todos os geradores (`npm run validate` acusa ID fora da faixa do autor); `npm run sync`; README de "como trabalhar a dois"; um dia de teste com o sócio criando tarefas e ideias ao mesmo tempo sem conflito.

---

## 3. Fase 1 — banco (MongoDB Atlas, São Paulo)

### 3.1 Princípio
- **Uma camada de acesso, dois motores.** `core/store.ts` hoje é síncrono e lê/escreve arquivo (1.120 linhas; o `app/server/handler.ts` tem 162 rotas, ~97 chamadas a `S.*`). Cria-se `core/repo/` com interface **assíncrona** por coleção e dois motores: `arquivos` (o de hoje, embrulhado) e `mongo`. Escolha por `HUB_STORE=arquivos|mongo`. Assim a migração é por coleção, e o Oliver sozinho pode continuar em arquivos.
- **Os schemas zod de `schema/` continuam valendo**: o repo valida antes de gravar (como o `check()` de hoje). O documento no banco = o objeto do schema + `_id`, `slug`, `_rev`, `criadoPor`, `atualizadoPor`, `atualizadoEm`.
- Corpo em markdown (descrição de tarefa, ideia, nota, `competitor.md`) vira campo `corpo` (string markdown). O Claude continua lendo markdown: o `pacote` monta o texto.
- **Exportar sempre possível:** `node tools/db.mjs exportar <slug>` escreve tudo no layout de pastas de hoje (frontmatter + JSON). Serve de backup legível, de diff e de saída de emergência.

### 3.2 Coleções (seguindo `schema/`)
| coleção | schema | vem de | índices / regras |
|---|---|---|---|
| `tarefas` | `task.ts` (+ `comentarios[]`, `log[]` embutidos) | `board/T-*.md` | `{slug,id}` único; `{slug,status,assignee}`; campo `lease` (3.4) |
| `recorrentes` | — (hoje JSON solto; criar schema) | `board/recorrentes.json` | `{slug,id}`; criação de instância com `{slug,recorrente,due}` único |
| `ideias` | `idea.ts` | `ideas/I-*.md` | `{slug,id}` único |
| `notas` | `note.ts` | `notes/*.md` | |
| `concorrentes` | `competitor.ts` | `competitors/<id>/competitor.md` | `{slug,id}` único |
| `snapshots` | `Snapshot` (`competitor.ts`) | `snapshots/<perfil>/<data>.json` | `{slug,concorrente,perfil,coletadoEm}`; sem histórico (imutável) |
| `anuncios` | `ads.ts` | `ads/<data>.json` | `{slug,concorrente,coletadoEm}` |
| `marcas` | `ItemMark` + `ads-marks.ts` | `marks.json`, `ads/marks.json` | **1 documento por item marcado** (não por concorrente) → fim do conflito no arquivo único |
| `analises` | `analysis.ts` | `analysis/<modulo>.json` | `{slug,concorrente,modulo}` único |
| `analise_notas` | `AnalysisNotes` | `analysis/notas.json` | 1 doc por `{concorrente,chave}` |
| `fichas`, `relatorios` | `ficha.ts`, `relatorio.ts` | `fichas/`, `relatorios/` | |
| `intel` | `matrix.ts`, `gaps.ts`, `referencia.ts` | `intel/*.json` | matriz: **1 doc por célula** (`{slug,coluna,feature}`) para dois editarem células diferentes |
| `coletas` | — | `intel/coleta-semanal.json`, `semanas/` | |
| `fontes`, `referencias`, `rodadas` | `curadoria.ts` | `curadoria/…` | `referencias {slug,id}` único |
| `pecas` | `piece.ts` (`peca.json`) | `contents/<peça>/peca.json` | `{slug,id}` (ID da 050 C); a **pasta** da peça continua no git |
| `revisoes` | `review.ts` | `contents/<peça>/revisao.json` | 1 doc por anotação (Oliver anota enquanto o agente responde outra) |
| `variantes` | `core/variantes.ts` | `variantes/indice.json`, insumos | |
| `jobs` | `tools/lib/pedidos-ia.mjs`, `fila-ia.mjs`, `fichas-fila.mjs`, pedidos de análise | `logs/pedidos-ia`, `logs/fila-ia`, `analysis/pedido.json`, `curadoria/rodadas/*/pedido.json` | **fila única compartilhada**; `{status,criadoEm}`; `lease` |
| `atividade` | `core/atividade.ts` | `logs/atividade/` | TTL 90 dias (decisão) |
| `contadores` | — | (novo) | `{_id:"kz:T"}` + `$inc` atômico → **acaba a faixa da fase 0** |
| `historico` | — | (novo, substitui o git para estes dados) | 3.5 |

Ficam no git (não migram): `project.yml`, `tags.yml`, `personas/`, `context/`, `brand/`, conteúdo autoral das peças, `campaigns/`, `video-templates/`, `capturas/*/captura.json`, `library/` (catálogos), `.claude/`. Personas e tags podem migrar depois se o sócio editar muito (pergunta 7.10).

### 3.3 Quem passa a ler/escrever no banco
| arquivo | mudança |
|---|---|
| `core/store.ts` | vira fachada sobre `core/repo/` (async); funções de arquivo vão para `core/repo/arquivos.ts` |
| `core/repo/` (novo) | `index.ts` (interface + escolha do motor), `arquivos.ts`, `mongo.ts`, `historico.ts`, `contadores.ts` |
| `tools/lib/db.mjs` (+ `.d.mts`) (novo) | conexão única (driver `mongodb`), lida por `tools/lib/env.mjs` (`MONGODB_URI` no `.env` local, nunca impressa) — usada por `core/` e por `tools/` |
| `app/server/handler.ts` | rotas passam a `await`; conflito de `_rev` → HTTP 409 → app mostra "mudou enquanto você editava: recarregar / sobrescrever" |
| `app/src/api.ts` + telas com escrita otimista (019) | tratar 409; **atualização ao vivo**: change streams do Mongo → SSE `/api/eventos` → react-query invalida (o card que o sócio moveu aparece sem F5) |
| `core/pedidos-ia.ts`, `core/runner.ts`, `core/atividade.ts`, `core/fichas-fila.ts`, `core/pesquisas.ts`, `core/curadoria.ts`, `core/variantes.ts`, `core/relatorios.ts`, `core/fichas.ts` | leem/escrevem pelo repo |
| `tools/lib/board.mjs`, `tools/board.mjs` | camada de acesso dos agentes (3.4) |
| `tools/heartbeat.mjs` | fila e tarefas do banco; reivindicar com lease; recorrentes idempotentes |
| `tools/lib/pedidos-ia.mjs`, `fila-ia.mjs`, `fichas-fila.mjs`, `atividade.mjs`, `pesquisa.mjs`, `insumos.mjs`, `pacote.mjs` | trocam `writeFileSync` em `logs/`/`companies/` por chamadas ao repo |
| `tools/review.mjs` | `responde`/anotações em `revisoes` |
| `tools/intel/*` (`cli.ts`, `ads-cli.ts`, `semanal.ts`, `analysis-cli.ts`), `tools/fichas/*`, `tools/curadoria/*` | gravam snapshots, anúncios, fichas, rodadas no banco (já usam `core/store`) |
| `tools/validate.ts` | valida o banco também (`npm run validate -- --banco`) |
| `tools/db.mjs` (novo) | `migrar <slug> [--dry]` (arquivos → banco), `exportar`, `backup`, `restaurar`, `historico`, `usuarios` |
| `.claude/skills/orquestrar/references/protocolo.md`, `.claude/agent-notes/*`, skills que citam `board/T-*.md` ou `marks.json` | trocar "edite o arquivo" por "use `board.mjs …`" |
| `CLAUDE.md`, `roadmap/APP.md` | princípio novo: git = autoral; banco = operacional |
| `.claude/settings.json` (allowlist) | nada novo: `node tools/*` já liberado; **não** liberar `mongosh`/`mongodump` para agentes |

### 3.4 `board.mjs` como camada de acesso dos agentes + reivindicar tarefa
Agentes não veem a string de conexão e não falam Mongo. Comandos (os que existem continuam; novos em negrito):
```
node tools/board.mjs <slug> [--me|--ai|--check]            # ver (já existe)
node tools/board.mjs pacote <slug> <T-NNNN>                # contexto da tarefa (já existe)
node tools/board.mjs comment <slug> <T-NNNN> "…" --as agent:x [--status review --para oliver]   # já existe
node tools/board.mjs pegar <slug> [--agente x] [--id T-NNNN]   # reivindica: devolve a tarefa ou "nada pronto"
node tools/board.mjs renovar <slug> <T-NNNN>                   # estende o lease (o heartbeat faz sozinho)
node tools/board.mjs soltar <slug> <T-NNNN> [--status todo|review]
node tools/board.mjs log <slug> <T-NNNN> "…"   ·   mover <slug> <T-NNNN> <status>   ·   nova <slug> "título" …
node tools/board.mjs exportar <slug> <T-NNNN>                  # o card em markdown, como hoje
```
Mesmo padrão para as outras filas: `node tools/fila.mjs pegar|soltar` (jobs: pedidos-ia, análise, fichas, pesquisa), `node tools/ideias.mjs nova|ver`, `review.mjs responde` (já existe).

**Reivindicar (sem duas máquinas pegarem a mesma):** uma operação atômica do Mongo, sem lock global:
```js
tarefas.findOneAndUpdate(
  { slug, status: 'todo', assignee: { $in: ['ai', /^agent:/] }, depsFeitas: true,
    $or: [{ lease: null }, { 'lease.ate': { $lt: agora } }] },
  { $set: { status: 'doing', lease: { maquina, usuario, pid, por: 'agent:x', desde: agora, ate: agora + 10min } },
    $inc: { _rev: 1 } },
  { sort: { prioridade: -1, criadoEm: 1 }, returnDocument: 'after' })
```
- O Mongo garante que só um `findOneAndUpdate` casa o mesmo documento; a outra máquina recebe a próxima tarefa ou `null`.
- `depsFeitas` é recalculado quando uma tarefa vai a `done` (ou checado depois de pegar; se faltar, solta na hora).
- **Lease** de 10 min renovado a cada 30 s pelo heartbeat (como o `utimesSync` do lock de hoje). Máquina caiu → lease vence → a tarefa volta a ser pegável; o card ganha log "retomada: lease de <máquina> venceu".
- O lock local `logs/heartbeat/.lock` continua: limita **um trabalho por máquina**; o lease limita **uma máquina por tarefa**.
- Recorrentes: instância criada com `insertOne` sob índice único `{slug, recorrente, due}`; o segundo heartbeat recebe erro de chave duplicada e ignora.
- Jobs (`pedidos-ia`, análise, fichas, pesquisa): mesmo `findOneAndUpdate` com `status: 'pendente' → 'rodando'` + lease; resolve o "pendente que ficou rodando" de hoje (`pedidos-ia.mjs:82`) pelo vencimento do lease.
- Escrita humana concorrente (Oliver e sócio no mesmo card): `updateOne({_id, _rev})`; se não casou, 409 (3.3). Comentários e log são `$push` — nunca conflitam.

### 3.5 Histórico e versões no lugar do git
- Todo `update`/`delete` passa pelo repo, que grava em `historico`: `{colecao, docId, rev, antes, por, quando, origem: app|agent:x|script}` (documento anterior inteiro; são pequenos). Índice `{colecao, docId, rev}`.
- `node tools/db.mjs historico tarefas kz:T-0012` lista; `… restaurar … --rev 7` volta (e gera nova revisão, nunca apaga).
- No app: "Histórico" no card, na ideia, na ficha do concorrente (mesma tela do diff de versões da 050).
- Snapshots, anúncios e atividade **não** têm histórico (são imutáveis ou descartáveis).
- Retenção: para sempre no começo (cabe no plano grátis); revisar com `db.stats()` (pergunta 7.9).
- Exportação para o git (opcional): `db.mjs exportar` numa branch `dados` sob comando, para ter diff legível de um mês para o outro.

### 3.6 Backup
- `node tools/db.mjs backup` = `mongodump --uri … --gzip --archive=backups/AAAA-MM-DD.gz` (pasta fora do git) + envio ao R2 (`hub-backups/`). Mais `exportar` (JSON/MD) no mesmo pacote: restauração não depende do Mongo.
- **Sob comando** (botão "Fazer backup" no app + terminal; regra "nada agendado"). O heartbeat `--run`, que já é acionado pelo Oliver, **avisa** quando o último backup tem mais de 7 dias; não roda sozinho.
- Teste de restauração em banco de teste (`hub_teste`) com `mongorestore --nsFrom hub.* --nsTo hub_teste.*` antes de declarar a fase pronta.
- Plano pago do Atlas (Flex/M10) tem backup automático do próprio Atlas; o M0 não (conferir na contratação) → decisão 7.2.

### 3.7 Usuários e permissões
- **Atlas (conta):** só o Oliver é dono do projeto Atlas; o sócio entra como "Project Read Only" se quiser ver o painel.
- **Usuários do banco** (um por pessoa, para o `atualizadoPor` ser verdade e para revogar um sem afetar o outro):
  - `hub_oliver`, `hub_socio`: papel customizado `hub_rw` = `find/insert/update/remove` + `changeStream` **só no banco `hub`**; sem `dropDatabase`, `dropCollection`, `createUser`, índices.
  - `hub_backup`: `read` no `hub` (para `mongodump`).
  - `hub_admin` (só Oliver, fora do `.env` do dia a dia): índices, migração, usuários.
- Agentes rodam com o usuário da pessoa dona da máquina, e gravam `origem: agent:<nome>`.
- Rede: lista de IPs (casa de cada um) ou `0.0.0.0/0` com senha longa + TLS (decisão 7.5). String de conexão só em `companies/<slug>/.env`/`.env` local (app → Configurações), nunca no git.
- `deleteMany`/apagar concorrente pelo app: vira "arquivar" (`arquivado: true`); apagar de verdade só pelo `db.mjs` com o usuário admin.

### 3.8 Ordem da fase 1 (cada etapa entrega sozinha)
| etapa | o que | pronto quando |
|---|---|---|
| **1A** | `core/repo/` com o motor `arquivos` (async), handler com `await`, `tools/lib/ids.mjs` | app e scripts iguais a hoje, `npm run typecheck` e `validate` verdes |
| **1B** | Atlas + usuários + `tools/lib/db.mjs` + `db.mjs migrar/exportar/backup`; **`jobs`, `atividade`, `tarefas`, `recorrentes`, `contadores`, `historico`** no Mongo; `board.mjs pegar/soltar`; heartbeat com lease | dois heartbeats em duas máquinas (ou dois processos com `HUB_MAQUINA` diferente) nunca pegam a mesma tarefa num teste de 50 rodadas; o sócio vê o pedido do Oliver na Atividade |
| **1C** | concorrentes, snapshots, anúncios, marcas, análises, fichas, relatórios, intel, curadoria, ideias, notas | `db.mjs migrar kz --dry` mostra a tabela; migração real; `exportar` bate com os arquivos de antes (diff vazio) |
| **1D** | `pecas` (ficha), `revisoes`, `variantes` | anotar no app enquanto o agente responde não perde nada |
| **1E** | SSE ao vivo, tela de histórico, botão de backup | o card movido pelo sócio aparece em ≤ 2 s |

Depois da 1C, os arquivos migrados saem do git (`git rm --cached` + `.gitignore`), com `exportar` como espelho legível.

---

## 4. Binários (vídeo, áudio, renders) e como o sócio recebe
- **Cloudflare R2** (S3 compatível, saída grátis): bucket `hub-arquivos`, chave `<slug>/<caminho igual ao do repo>` (ex.: `kz/contents/V0012-apresentacao/exports/V0012-v03-9x16.mp4`).
- `node tools/arquivos.mjs enviar <pasta|arquivo>` · `baixar <pasta>` · `link <arquivo>` (URL assinada, 7 dias) · `status` (o que falta local/remoto). Usa `@aws-sdk/client-s3`; chaves R2 no `.env` local.
- **Registro:** coleção `arquivos` (fase 1) ou `arquivos.json` na pasta da peça (fase 0): `{caminho, sha256, bytes, por, quando}`. Mesmo sha → não reenvia.
- **O sócio recebe assim:** o `produce.mjs`/`render` do kit chama `arquivos enviar` ao fim do export (opção `--enviar`, padrão ligado quando há chave R2); no app do sócio a peça mostra o vídeo **direto do R2** (URL assinada, sem baixar) e um botão "Baixar"; para editar/re-renderizar, `arquivos baixar <peça>`.
- O que vai para o R2: `exports/*.mp4`, áudios de voz (`companies/**/audio/`), `library/audio/` (os arquivos dos catálogos `sfx.json`/`music.json`: hoje só existem na máquina do Oliver, então o render do sócio sairia sem som), renders de mockup, `media/` dos concorrentes, backups. **Não** vai: `render/` intermediário (refazível).
- PNGs hoje no git (`storyboard-*.png`, `capturas/*/original.png`, `library/mockups/` 196 arquivos): continuam no git por enquanto (são pequenos); regra nova: PNG > 1 MB vai para o R2.
- Alternativa sem R2: pasta compartilhada do Google Drive com `exports/` dentro (decisão 7.3).

---

## 5. Custo estimado (preços de referência; conferir ao contratar)
| item | opção | custo/mês |
|---|---|---|
| MongoDB Atlas, AWS São Paulo (`sa-east-1`) | **M0** (grátis, 512 MB, sem backup automático) | US$ 0 |
| | Flex (backup diário do Atlas) | ~US$ 8–30 |
| | M10 dedicado | ~US$ 75–90 |
| Cloudflare R2 | 10 GB grátis, depois US$ 0,015/GB; saída grátis | US$ 0 até 10 GB · ~US$ 1,50 com 100 GB |
| GitHub | repo privado, 2 pessoas | US$ 0 |
| Claude | cada pessoa com o próprio plano (agentes rodam local) | já existe |
| APIs (ElevenLabs, Apify…) | uma conta compartilhada ou uma por pessoa | decisão 7.6 |

Volume esperado: os dados operacionais da kz cabem hoje em poucos MB (snapshots ~25 KB cada); o M0 deve aguentar o primeiro ano. **Estimativa: US$ 0–2/mês no começo; ~US$ 10–30 se quiser backup automático.**

---

## 6. Arquivos afetados (resumo)
- **Fase 0:** `.gitignore`, `.gitattributes` (novo), `package.json` (`sync`), `tools/sync.mjs` (novo), `tools/lib/ids.mjs` (novo), `core/store.ts` (`nextTaskId`, `nextIdeaId`, `nextRefId`), `tools/lib/board.mjs`, `tools/board.mjs` (`--next-id`), `tools/curadoria/*` (IDs de referência), `tools/validate.ts`, `tools/dados.mjs` (novo, se R2), `README.md` / `app/README.md`, `CLAUDE.md` (fluxo de branch + PR).
- **Fase 1:** `core/repo/*` (novo), `core/store.ts`, `core/{pedidos-ia,runner,atividade,fichas-fila,fichas,pesquisas,curadoria,variantes,relatorios}.ts`, `app/server/handler.ts`, `app/server/api.ts`, `app/src/api.ts` (+ telas com escrita otimista), `tools/lib/{db,board,pedidos-ia,fila-ia,fichas-fila,atividade,pesquisa,insumos,pacote}.mjs`, `tools/{board,heartbeat,review,validate}.*`, `tools/db.mjs` (novo), `tools/fila.mjs` (novo), `tools/ideias.mjs` (novo), `tools/intel/*`, `tools/fichas/*`, `tools/curadoria/*`, `schema/` (recorrentes, jobs, lease, campos `_rev/criadoPor`), `.claude/skills/orquestrar/references/protocolo.md`, `.claude/agent-notes/*`, `CLAUDE.md`, `roadmap/APP.md`.
- **Binários:** `tools/arquivos.mjs` (novo), `tools/video-kit/scripts/produce.mjs` (`--enviar`), app (player por URL assinada), `library/README.md`.

---

## 7. Decisões e perguntas abertas (Oliver)
1. **Quando o sócio começa?** Se for já: fase 0 primeiro (1–2 sessões). A fase 1 só depois de uma ou duas semanas usando a fase 0 e vendo onde dói.
2. **Atlas M0 (grátis, backup só pelo nosso `db.mjs backup`) ou Flex (~US$ 8–30, backup automático)?** Recomendação: M0 + backup sob comando; subir quando houver cliente pagante.
3. **Binários: R2 (recomendado) ou pasta do Google Drive?**
4. **IDs na fase 0: faixa por pessoa (recomendado) ou sufixo de iniciais?**
5. **Rede do banco:** lista de IPs fixos (mais seguro, quebra quando o IP de casa muda) ou aberto com senha forte + TLS?
6. **Chaves de API (ElevenLabs, Apify, DataForSEO…):** uma conta paga compartilhada (cada um com a chave no `.env`) ou cada um com a sua? Afeta custo e limite.
7. **Quem roda o heartbeat e as coletas?** Fase 0: só uma máquina (recomendado: a do Oliver). Fase 1: os dois, com lease.
8. **O sócio mexe em quê?** Só conteúdo e quadro, ou também skills/agentes/código? Define se ele precisa de PR obrigatório (proteção da `main` no GitHub) e qual papel no banco.
9. **Histórico:** guardar para sempre ou por 180 dias?
10. **Personas, tags, contexto e marca** continuam no git (recomendado; texto autoral revisável) ou vão para o banco porque o sócio vai editar pelo app ao mesmo tempo?
11. **Atividade da IA compartilhada:** o sócio vê os pedidos e os custos em tokens do Oliver (e vice-versa)? Recomendação: sim, com filtro "meus".
12. **Hospedar o app** (um servidor só, os dois pelo navegador) fica fora desta tarefa: o app continua local em cada máquina (`127.0.0.1`). Reavaliar depois da fase 1.

## Log
- 2026-10-09 · plano escrito (sessão lateral a pedido da sessão principal): levantamento de escritores por pasta, fase 0 (git), fase 1 (Mongo: coleções, repo com dois motores, `board.mjs pegar` com lease, histórico, backup, usuários), binários no R2, custos e 12 decisões. Nada implementado. Próximo passo: o Oliver responde a seção 7; depois, 1 sessão para a fase 0.
