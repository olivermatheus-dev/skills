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
  context/          BUSINESS · AUDIENCE · VOICE · COMPETITORS · CONTENT_STRATEGY · COPY
  brand/            BRAND.md (regras de uso) · brand.css (tokens) · logo/ icons/ vectors/ fonts/ photos/ screenshots/
  video-templates/  templates de vídeo da empresa
  contents/         AAAA-MM-DD-<tema>/  (roteiro.md, carrossel.html, png/, plano.md, composition.html…)
  campaigns/        AAAA-MM-DD-<campanha>/  (ads.md, lp.md, carta.md, plano.md) + LOG_ANGULOS.md
  board/            Kanban: 1 arquivo por tarefa (T-NNNN-<slug>.md)
```
Molde: `companies/_modelo/`. Arquivos novos do usuário → `_inbox/` (fora do git) → a skill `setup` classifica e move.
Marca: `brand.css` é a **fonte única de tokens** (carrossel e vídeo linkam direto); `BRAND.md` manda sobre os defaults das skills; **Proibições** são regra dura. Contraste: `node tools/contrast.mjs`.
Arquivos pesados (vídeo, áudio, renders, .psd/.ai/.fig) não vão para o git.
Vídeo: ajuste de voz, duração, texto e trilha sem reescrever nada → `node tools/video/timeline.mjs` (núcleo do futuro MCP de edição). QC do MP4 final antes de entregar → `node tools/video/qc.mjs <pasta> --sheet`.
Biblioteca visual global (ícones, mapas, bandeiras, logos de terceiros): `library/visual/` (sem licença registrada, não usa).
Biblioteca de áudio (todas as empresas): `library/audio/`. Arquivos ficam locais, catálogos `sfx.json`/`music.json`/`bases.json` no git, e **sem licença não usa**. Ferramenta: `node tools/audio/catalog.mjs`.

## Skills (`.claude/skills/`)

| skill | para quê |
|---|---|
| `setup` | criar/atualizar o contexto de uma empresa |
| `content-ideas` | pautas, calendário, engenharia reversa de criadores |
| `ig-post` | roteiro de carrossel, reels, post e legenda |
| `carousel` | gerar o carrossel em HTML e exportar PNG |
| `ads-meta` | criar e analisar anúncios Meta/Instagram |
| `landing-page` | LP, página de captura, carta de vendas, VSL |
| `launch-plan` | plano de lançamento semana a semana |
| `video` | vídeo em motion graphics: briefing → plano aprovado → timeline → cenas → QA → MP4 |
| `audio` | trilhas, sound design de vídeo, biblioteca de sons (buscar, gerar, baixar, catalogar) |
| `locucao` | voz v1.0 gratuita → roteiro no formato ElevenLabs → encaixe do áudio final |

**Formatos (`fmt-*`)**: receitas curtas por tipo de conteúdo que usam os motores `carousel` (imagem) ou `video` (motion).
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

  Todos seguem `.claude/skills/orquestrar/references/protocolo.md` e leem suas instruções permanentes em `.claude/agent-notes/<agente>.md`.
- **Falar com um agente:**
  - instrução permanente → `.claude/agent-notes/`;
  - trabalhar junto → `claude --agent <agente>` num terminal.
- **Heartbeat:** `node tools/heartbeat.mjs --run [--watch 30]` acorda os agentes com tarefa pronta e cria as recorrentes (`board/recorrentes.json`). Detalhes na skill `orquestrar`.

## Construção do hub (roadmap)
**Sessão nova? Comece por `roadmap/ESTADO.md`** (onde paramos, pendências, próximo passo).
Evolução do próprio repositório fica em `roadmap/`: `BACKLOG.md` (prioridade e ordem), `VIDEO.md` (visão do vídeo), `IDEIAS.md` (caixa de entrada), `DEPOIS.md` (adiados), `INTEL.md` (inteligência de mercado), `APP.md` (visão do app: projetos, kanban, concorrentes, agentes) e `tasks/<id>-<slug>/TASK.md` (1 pasta por tarefa ativa, com log).
Ao iniciar uma sessão de construção: leia `roadmap/BACKLOG.md` e o `TASK.md` da tarefa da vez. Ao terminar: atualize status e log, faça commit + push.
Material novo do usuário sobre vídeo/motion → registrar e destilar conforme `roadmap/tasks/002-conhecimento-motion/TASK.md`. Base de conhecimento verificada de vídeo: `knowledge/video/` (as skills de vídeo leem daqui).
