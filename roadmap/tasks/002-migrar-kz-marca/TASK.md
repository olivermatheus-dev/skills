# 002 — Migrar a kz para o padrão de marca

**Status:** rascunho · **Fase:** 1 · **Depende de:** 001

## Objetivo
`companies/kz/brand/` completo: tokens extraídos do `context/VISUAL.md` atual (coral #ef7960, creme #faf8f5, Montserrat…) e logos/vetores reais da kz.

## Escopo
- Entra: converter tokens, receber e organizar arquivos de logo/vetor que o usuário enviar, revisar regras de uso.
- Não entra: criar logo novo.

## Perguntas em aberto
- [ ] Usuário envia os arquivos de logo (SVG de preferência) e vetores — de onde? (Figma, Drive, site)
- [ ] O logo ainda estava "em revisão" em abril — qual é a versão final?

## Critérios de pronto
- [ ] `tokens.json` da kz válido e `tokens.css` gerado
- [ ] Logos nas variações definidas em 001
- [ ] `VISUAL.md` antigo removido/apontando para `brand/`

## Log
- 2026-10-06 — criada.
