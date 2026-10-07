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
  tasks.md          backlog de marketing e vendas
```
Molde: `companies/_modelo/`. Arquivos novos do usuário → `_inbox/` (fora do git) → a skill `setup` classifica e move.
Marca: `brand.css` é a **fonte única de tokens** (carrossel e vídeo linkam direto); `BRAND.md` manda sobre os defaults das skills; **Proibições** são regra dura. Contraste: `node tools/contrast.mjs`.
Arquivos pesados (vídeo, áudio, renders, .psd/.ai/.fig) não vão para o git.

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

**Formatos (`fmt-*`)**: receitas curtas por tipo de conteúdo que usam os motores `carousel` (imagem) ou `video` (motion).
- Imagem: `fmt-post-frase`, `fmt-meme`, `fmt-antes-depois`, `fmt-carrossel-educativo`.
- Vídeo: `fmt-trailer-lancamento`, `fmt-recorte-funcionalidade`, `fmt-texto-cinetico`, `fmt-dialogo`, `fmt-3d-produto`.

Fluxo típico: `content-ideas` → `ig-post` → formato `fmt-*` → `carousel` (imagem) ou `video` (motion). Venda: `COPY.md` → `landing-page` + `ads-meta`.

## Ao terminar uma tarefa
- Salve a peça na pasta certa (acima).
- Atualize `tasks.md` se a tarefa estava lá.
- Aprendizado novo (hook vencedor, objeção nova, frase de cliente) → registre no arquivo de contexto correspondente.

## Construção do hub (roadmap)
Evolução do próprio repositório fica em `roadmap/`: `BACKLOG.md` (prioridade e ordem), `VIDEO.md` (visão do vídeo), `IDEIAS.md` (caixa de entrada), `DEPOIS.md` (adiados), `INTEL.md` (inteligência de mercado, em discussão) e `tasks/<id>-<slug>/TASK.md` (1 pasta por tarefa ativa, com log).
Ao iniciar uma sessão de construção: leia `roadmap/BACKLOG.md` e o `TASK.md` da tarefa da vez. Ao terminar: atualize status e log, faça commit + push.
Material novo do usuário sobre vídeo/motion → registrar e destilar conforme `roadmap/tasks/002-conhecimento-motion/TASK.md`. Base de conhecimento verificada de vídeo: `knowledge/video/` (as skills de vídeo leem daqui).
