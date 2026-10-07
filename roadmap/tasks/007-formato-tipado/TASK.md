# 007 — Formato tipado dos arquivos

**Status:** rascunho · **Depende de:** — · **Visão:** [../../APP.md](../../APP.md)

## Objetivo
Definir e aplicar o formato (frontmatter YAML / YAML / JSON) de cada tipo de arquivo, para que a futura interface leia, edite, comente e mostre tudo **sem migração**, e o Claude continue editando os mesmos arquivos.

## Escopo
- Esquemas: `project.yml`, frontmatter de `context/*.md`, `context/personas/*.md`, `board/T-*.md` (kanban), `_comments/*.json`, `competitors/<x>/competitor.yml`, `favorites.yml`, `snapshots/*.json`.
- Documento único `SCHEMAS.md` (ou JSON Schema em `schemas/`) + validador simples (`node tools/validate.mjs`).
- Migrar a kz: `project.yml`; `AUDIENCE.md` → visão geral + `personas/`; `tasks.md` → `board/`.
- Atualizar as skills que escrevem esses arquivos (setup, content-ideas, launch-plan) e o molde `_modelo/`.

## Perguntas em aberto
- [ ] Quais colunas padrão do Kanban? Sugestão: backlog · todo · doing · review · done.
- [ ] Vários quadros por projeto (ex.: conteúdo, vendas, produto) — confirmar nomes.
- [ ] Comentários ficam ao lado (`_comments/`) ou dentro do próprio arquivo? Recomendação: ao lado, para não poluir o que o Claude lê.

## Critérios de pronto
- [ ] Esquemas documentados e validador rodando sem erro na kz
- [ ] kz migrada; skills e molde atualizados

## Log
- 2026-10-07 — criada a partir do pedido do usuário (app com projetos, personas, kanban, comentários, concorrentes, agentes).
