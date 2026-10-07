---
name: launch-plan
description: Monta plano de lançamento em pt-BR por fases e semanas, usando canais próprios, alugados e emprestados (Instagram, WhatsApp, parcerias, influenciadores). Use quando o usuário falar em "lançamento", "plano de lançamento", "pré-lançamento", "lançar produto", "estratégia de lançamento" ou "plano de marketing".
---

# Launch Plan

Plano de lançamento semana a semana + tarefas no quadro `board/` da empresa.

## Antes de começar

1. **Empresa:** pelo `CLAUDE.md`; na dúvida, perguntar.
2. **Ler** `companies/<slug>/context/`: `BUSINESS.md`, `AUDIENCE.md`, `COPY.md`, `CONTENT_STRATEGY.md`, `COMPETITORS.md`; e o quadro `node tools/board.mjs <slug>` (pendências que travam o lançamento: preço, link, compliance).
3. **Contexto velho?** Se o `BUSINESS.md` fala de uma data de lançamento que já passou ou tem "a validar" sobre o estágio, perguntar primeiro: já lançou? Tem clientes?
4. **Confirmar:** o que se lança, data de abertura, verba de anúncios, audiência atual (seguidores, lista/WhatsApp), quem executa e quantas horas/semana.

## Tipo de lançamento (decide a mecânica)

| Tipo | Exemplo | Mecânica |
|---|---|---|
| **Perpétuo** | SaaS, assinatura, serviço contínuo | Lista de espera → acesso em ondas → abertura. **Não "fecha carrinho"**: a escassez real é a condição de fundador (preço/bônus) com prazo ou nº de vagas declarados. Depois, aquisição contínua. |
| **Turma/carrinho** | curso, mentoria, evento | Aquecimento → conteúdo/aula de abertura → carrinho aberto 5–7 dias → fechamento com prazo real. |

## Canais (ORB)

Todo canal leva para um canal **próprio**. Escolher 1–2 de cada, conforme onde o público está (`AUDIENCE.md`).

| Tipo | Exemplos | Papel |
|---|---|---|
| **Próprios** | lista/grupo de WhatsApp, e-mail, LP | onde se converte |
| **Alugados** | Instagram, TikTok, YouTube, Meta Ads | alcance, sempre com CTA para a lista |
| **Emprestados** | parceiros e influenciadores do nicho, lives conjuntas, podcasts, grupos de terceiros, indicação | credibilidade e público novo |

## Fases

| Fase | Objetivo | O que fazer |
|---|---|---|
| **1. Validação** | provar que usam | 3–10 pessoas próximas usam de graça; colher frases, ajustes e primeiros depoimentos autorizados |
| **2. Lista** | juntar interessados | página de captura/lista de espera; conteúdo sobre o problema; convites um a um |
| **3. Aquecimento** | gerar desejo e prova | bastidores, demos, parceiros testando, ondas de acesso para a lista, pesquisa com quem entrou |
| **4. Abertura** | máxima visibilidade e venda | oferta para a lista primeiro, depois aberto; Stories/Lives, anúncios, parceiros; prazo real da condição |
| **5. Pós** | reter e gerar prova | onboarding, conteúdo de resultado, casos, pedir indicação; próxima onda |

**Quantas semanas por fase:** produto já usado por clientes reais → pular a 1. Sem lista e sem seguidores → fase 2 com pelo menos 2 semanas. A fase 5 sempre entra no plano (mín. 1 semana).

## Saída

### 1. Plano

Salvar em `companies/<slug>/campaigns/AAAA-MM-DD-lancamento/plano.md`:

```markdown
# Plano de lançamento — <produto>
**Tipo:** perpétuo | turma · **Abertura:** ... · **Meta:** ... · **Verba:** ...
**Canais:** próprios ... | alugados ... | emprestados ...

| Semana | Fase | Objetivo | Ações | Peças (skill) | Métrica |
|---|---|---|---|---|---|
| S1 (dd/mm) | ... | ... | ... | LP de captura (`landing-page`) | inscritos |

## Bloqueios antes da abertura
- tarefas abertas do quadro (`node tools/board.mjs <slug>`) que impedem anunciar/vender (preço, link, compliance)

## Riscos
- ...
```

- **Peças:** cada uma aponta a skill que a produz: `content-ideas`/`ig-post` (conteúdo), `carousel`, `video`, `landing-page`, `ads-meta`. O plano não escreve a copy.
- Volume de conteúdo cabe na frequência do `CONTENT_STRATEGY.md` e nas horas de quem executa.
- **Métricas contáveis:** inscritos, % de ativação, respostas no WhatsApp, vendas/assinaturas, CPA.

### 2. Tarefas

Criar 1 arquivo de tarefa por ação em `companies/<slug>/board/` (formato em `.claude/skills/orquestrar/SKILL.md`; id via `node tools/board.mjs <slug> --next-id`; `parent` = tarefa do lançamento; produção → `assignee: ai`, decisão/dado do dono → `assignee: oliver`). Rodar `--check` no fim.

```markdown
| 12 | Criar página de captura | lp | todo | 2026-10-20 | campaigns/2026-10-06-lancamento/plano.md |
```

## Nichos regulados
Conteúdo, depoimentos e promessas seguem o compliance de `../landing-page/references/qa-copy.md`.
