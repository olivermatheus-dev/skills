# 003 — Skills passam a consumir os tokens e assets

**Status:** rascunho · **Fase:** 1 · **Depende de:** 001, 002

## Objetivo
Toda skill visual lê `companies/<slug>/brand/` em vez de copiar cores à mão: carrossel usa `tokens.css` + logo; `ads-meta` e `landing-page` citam tokens/logos nos briefings visuais.

## Escopo
- Entra: `carousel` (template importa `tokens.css`, usa logo no rodapé), briefings visuais de `ads-meta`/`landing-page`, regra no `CLAUDE.md`.
- Não entra: novas skills.

## Critérios de pronto
- [ ] Carrossel da kz renderizado com tokens e logo reais sem editar CSS à mão
- [ ] Nenhuma skill referencia `context/VISUAL.md` se ele deixar de existir

## Log
- 2026-10-06 — criada.
