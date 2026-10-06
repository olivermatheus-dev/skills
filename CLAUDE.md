# Hub de marketing

Central de estratégia, conteúdo e vendas com IA para as empresas do Oliver. Responda em pt-BR, direto, sem teoria desnecessária.

## Empresas

| slug | empresa | o que é |
|---|---|---|
| `kz` | Kzloo | SaaS de gestão para terapeutas autônomos (Brasil) |

Se o pedido não disser a empresa e houver mais de uma, pergunte. Empresa nova → skill `setup`.

## Regra de ouro
Antes de produzir qualquer peça, leia os arquivos relevantes de `companies/<slug>/context/`. Nunca invente dados (preço, números, depoimentos): use o contexto ou pergunte.

## Estrutura

```
companies/<slug>/
  context/     BUSINESS · AUDIENCE · VOICE · COMPETITORS · CONTENT_STRATEGY · VISUAL · COPY
  contents/    AAAA-MM-DD-<tema>/  (roteiro.md, carrossel.html, png/)
  campaigns/   AAAA-MM-DD-<campanha>/  (ads.md, lp.md, carta.md, plano.md) + LOG_ANGULOS.md
  assets/      logo, fotos, prints
  tasks.md     backlog de marketing e vendas
```

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

Fluxo típico: `content-ideas` → `ig-post` → `carousel`. Venda: `COPY.md` → `landing-page` + `ads-meta`.

## Ao terminar uma tarefa
- Salve a peça na pasta certa (acima).
- Atualize `tasks.md` se a tarefa estava lá.
- Aprendizado novo (hook vencedor, objeção nova, frase de cliente) → registre no arquivo de contexto correspondente.

## Construção do hub (roadmap)
Evolução do próprio repositório fica em `roadmap/`: `BACKLOG.md` (fases e ordem), `IDEIAS.md` (caixa de entrada) e `tasks/<id>-<slug>/TASK.md` (1 pasta por tarefa, com log).
Ao iniciar uma sessão de construção: leia `roadmap/BACKLOG.md` e o `TASK.md` da tarefa da vez. Ao terminar: atualize status e log, commit + push.
