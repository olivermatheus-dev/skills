# Hub de marketing

Central de gestão, estratégia, conteúdo e vendas com IA para as empresas do Oliver. Toda a gestão do negócio vive aqui: cada empresa com seus documentos, ideias e peças exportadas. Responda em pt-BR, direto, sem teoria desnecessária.

## Empresas

| slug | empresa | o que é |
|---|---|---|
| `kz` | Kzloo | SaaS de gestão para terapeutas autônomos (Brasil) |

Se o pedido não disser a empresa e houver mais de uma, pergunte. Empresa nova → skill `setup`.

## Regra de ouro
Antes de produzir qualquer peça, leia os arquivos relevantes de `companies/<slug>/context/` e, se for visual, `brand/BRAND.md`. Nunca invente dados (preço, números, depoimentos): use o contexto ou pergunte.

## Estrutura

```
companies/<slug>/
  context/          BUSINESS · PRODUTO · AUDIENCE · VOICE · COMPETITORS · CONTENT_STRATEGY · COPY
  brand/            BRAND.md (regras de uso) · brand.json (tokens, editável no app) → brand.css (gerado) · logo/ icons/ vectors/ fonts/ photos/ screenshots/
  video-templates/  templates de vídeo da empresa
  contents/         AAAA-MM-DD-<tema>/  (peca.json = ficha: nome, legenda/copy/notas, principal · revisao.json · roteiro.md, exports/*.mp4, png/, plano.md, mockup.json…)
  campaigns/        AAAA-MM-DD-<campanha>/  (ads.md, lp.md, carta.md, plano.md) + LOG_ANGULOS.md
  board/            Kanban: 1 arquivo por tarefa (T-NNNN-<slug>.md)
  intel/            coleta-semanal.json + semanas/AAAA-Wss.md (relatório semanal dos concorrentes: redes + anúncios; npm run intel:semanal) · referencia.json (a própria empresa no Comparar; atualizar quando o contexto mudar)
  capturas/         AAAA-MM-DD-<tela>/ (original.png + captura.json: regiões e áreas a borrar) → skill `mockup`
  project.yml · tags.yml · personas/ · notes/ · ideas/ · competitors/   (dados tipados: schema/, validar com npm run validate)
```
**Interface local:** `npm run app` (quadro, concorrentes, ideias, personas, anotações, contexto). Ver `app/README.md`. Todo arquivo de dados segue `schema/`; depois de editar à mão, rode `npm run validate`.
Molde: `companies/_modelo/`. Arquivos novos do usuário → `_inbox/` (fora do git) → a skill `setup` classifica e move.
Marca: **`brand.json` é a fonte única de tokens** (app → Contexto e marca → Kit de marca, ou editar o JSON e rodar `npm run brand -- <slug>`); ele gera o `brand.css`, que carrossel e vídeo linkam direto (nunca editar o `brand.css` à mão: o `validate` acusa). Ícones: só **Lucide** → `node tools/icon.mjs <nome> --brand <slug>` (busca: `--busca <termo>`); `BRAND.md` manda sobre os defaults das skills; **Proibições** são regra dura. Contraste: `node tools/contrast.mjs`.
Arquivos pesados (vídeo, áudio, renders, .psd/.ai/.fig) não vão para o git.
Vídeo: motor em `tools/video-kit/` (README = comandos; voz de rascunho grátis → aval → Eleven v4 pela API → `elevenlabs.mjs` encaixa).
**Chaves de API:** uma por projeto, salvas no app → Configurações (`companies/<slug>/.env`, fora do git); `.env` da raiz é reserva. Scripts leem por `tools/lib/env.mjs`. Vozes: `library/voices/` + `companies/<slug>/brand/voices.json`. Ajuste de voz, duração, texto e trilha sem reescrever nada → `node tools/video/timeline.mjs` (núcleo do futuro MCP de edição). QC do MP4 final antes de entregar → `node tools/video/qc.mjs <pasta> --sheet`.
**Onde fica cada asset** (sons, efeitos, templates, marca, entrada bruta): `library/README.md`.
Biblioteca visual global (ícones, mapas, bandeiras, logos de terceiros): `library/visual/` (sem licença registrada, não usa). Galeria de reuso (componentes de motion, fx, looks): consultar o índice antes de criar, promover o que ficou bom (tarefa 014).
Biblioteca de áudio (todas as empresas): `library/audio/`. Arquivos ficam locais, catálogos `sfx.json`/`music.json`/`bases.json` no git, e **sem licença não usa**. Ferramenta: `node tools/audio/catalog.mjs`.

## Skills (`.claude/skills/`)

| skill | para quê |
|---|---|
| `setup` | criar/atualizar o contexto de uma empresa |
| `content-ideas` | pautas, calendário, engenharia reversa de criadores |
| `ig-post` | roteiro de carrossel, reels, post e legenda |
| `carousel` | gerar o carrossel em HTML e exportar PNG |
| `mockup` | print → mockups premium em 3× (iPhone/iPad/MacBook/iMac/Pixel reais, vidro, perspectiva, duo/trio/leque/pilha, zoom, cards, anotações, transparente), sugere cortes no print, alternativas + folha de contato · galeria: `node tools/mockup/galeria.mjs` |
| `ads-meta` | criar e analisar anúncios Meta/Instagram |
| `landing-page` | LP, página de captura, carta de vendas, VSL |
| `launch-plan` | plano de lançamento semana a semana |
| `video` | vídeo em motion graphics: briefing → plano aprovado → timeline → cenas → QA → MP4 |
| `audio` | trilhas, sound design de vídeo, biblioteca de sons (buscar, gerar, baixar, catalogar) |
| `locucao` | voz v1.0 gratuita → voz final → encaixe do áudio final |
| `elevenlabs` | voz final sempre no Eleven v4: emoção (audio tags), vozes, geração pela API e encaixe |
| `radar` | descobrir concorrentes, referências e páginas → candidatos (aceite do Oliver) |
| `analise-concorrentes` | análise por módulos (perfis, site/sitemap, contato, onde atua, resumo, features, fortes/fracos, preços, LP, Reclame Aqui): roda a fila marcada no app, script + subagentes Sonnet |
| `referencias` | coletar, ranquear e analisar o que o Oliver marcou → banco de ideias |

**Formatos (`fmt-*`)**: receitas curtas por tipo de conteúdo que usam os motores `carousel` (imagem) ou `video` (motion). Galeria global com ficha, exemplos e observações do Oliver (mandam sobre a skill): `library/formatos/` (app → Formatos; peça → `formato` no `peca.json`).
- Imagem: `fmt-post-frase`, `fmt-meme`, `fmt-antes-depois`, `fmt-carrossel-educativo`.
- Vídeo: `fmt-trailer-lancamento`, `fmt-recorte-funcionalidade`, `fmt-texto-cinetico`, `fmt-dialogo`, `fmt-3d-produto`.

Fluxo típico: `content-ideas` → `ig-post` → formato `fmt-*` → `carousel` (imagem) ou `video` (motion). Venda: `COPY.md` → `landing-page` + `ads-meta`.

## Ao terminar uma tarefa
- Salve a peça na pasta certa (acima).
- Se a tarefa estava no quadro, atualize o arquivo dela (status, checklist, log).
- Aprendizado novo (hook vencedor, objeção nova, frase de cliente) → registre no arquivo de contexto correspondente.

## Agentes e Kanban
- **Kanban:** `companies/<slug>/board/` · colunas `backlog · todo · doing · review · done` · quadros `conteudo · vendas · produto` · `assignee: oliver | ai | agent:<nome>`.
  - Ver: `node tools/board.mjs <slug>` (`--me` = minha visão, inclui o que está em revisão; `--ai`; `--check`; `--next-id`).
  - **Comentários no card** (o que o Oliver lê no app): `node tools/board.mjs comment <slug> <T-NNNN> "texto" --as agent:<nome> [--tipo revisar|pergunta] [--status review --para oliver]`. Ficam no próprio arquivo (`## Comentários`, antes do `## Log`).
  - **A fazer = aprovado.** App → Quadro → **Rodar IA** roda as prontas (A fazer · IA/agente · dependências feitas) pelo heartbeat ou abre o Claude Code num terminal.
- **Orquestrador = esta sessão principal** (skill `orquestrar`): tarefa para a IA → divide em subtarefas → delega ao agente → revisor → devolve ao Oliver em `review`.
- **Agentes** (`.claude/agents/`), cada um com instruções, skills pré-carregadas e ordem de trabalho:

  | agente | faz |
  |---|---|
  | `estrategista` | pautas, calendário, plano de lançamento, análise de resultados |
  | `roteirista` | roteiros, legendas, LP, carta, VSL, textos de anúncio |
  | `designer` | carrosséis, posts, criativos estáticos (PNG) |
  | `editor-de-video` | plano, voz, cenas e MP4 em motion |
  | `sound-designer` | trilhas sonoras, efeitos e mix; cuida da biblioteca de áudio |
  | `revisor` | QA de tudo antes de ir para o Oliver |
  | `pesquisador` | radar de concorrentes e referências, coletas, análise só do que o Oliver marcou → ideias |

  Todos seguem `.claude/skills/orquestrar/references/protocolo.md` e leem suas instruções permanentes em `.claude/agent-notes/<agente>.md`.
- **Falar com um agente:**
  - instrução permanente → `.claude/agent-notes/`;
  - trabalhar junto → `claude --agent <agente>` num terminal.
- **Heartbeat:** `node tools/heartbeat.mjs --run [--watch 30]` acorda os agentes com tarefa pronta e cria as recorrentes (`board/recorrentes.json`). Detalhes na skill `orquestrar`.

## Sessões e contexto
- **Uma tarefa por sessão.** Quando a próxima tarefa não depende da atual, o Oliver dá `/clear`. Antes disso, deixe tudo registrado no repositório (nunca só na conversa): `roadmap/ESTADO.md` (construção do hub) ou o arquivo da tarefa no quadro (produção), com onde parou, o próximo passo e o que falta do Oliver. Ao terminar uma tarefa, **sugira o `/clear`** se a próxima for independente.
- **Ao começar, leia só o necessário:** `ESTADO.md` → o `TASK.md` (ou `board/T-NNNN.md`) da vez → só os arquivos que ela cita. Não percorra o repositório "para entender".
- Prefira índices a arquivos grandes (`library/audio/INDEX.md`, nunca o `sfx.json` inteiro). **Tarefas do quadro:** cada uma declara `context:` (arquivo#Seção) e um `## Estado` de até 5 linhas; quem executa ou retoma começa por `node tools/board.mjs pacote <slug> <T-NNNN>` e lê só isso (seções: `node tools/contexto.mjs indice <slug>`; regras no protocolo da skill `orquestrar`; tarefa 021).

## Construção do hub (roadmap)
**Sessão nova? Comece por `roadmap/ESTADO.md`** (onde paramos, pendências, próximo passo).
Evolução do próprio repositório fica em `roadmap/`: `BACKLOG.md` (prioridade e ordem), `VIDEO.md` (visão do vídeo), `IDEIAS.md` (caixa de entrada), `DEPOIS.md` (adiados), `INTEL.md` (inteligência de mercado), `APP.md` (visão do app: projetos, kanban, concorrentes, agentes) e `tasks/<id>-<slug>/TASK.md` (1 pasta por tarefa ativa, com log).
Ao iniciar uma sessão de construção: leia `roadmap/BACKLOG.md` e o `TASK.md` da tarefa da vez. Ao terminar: atualize status e log, faça commit + push.
Material novo do usuário sobre vídeo/motion → registrar e destilar conforme `roadmap/tasks/002-conhecimento-motion/TASK.md`. Base de conhecimento verificada de vídeo: `knowledge/video/` — núcleo em `REGRAS.md` (nível médio); temas só no nível alto ou em dúvida pontual.
