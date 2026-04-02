---
name: content-performance
description: "Analisa a performance de conteúdos publicados e gera insights para retroalimentar o pipeline. Use quando o usuário compartilhar métricas de posts, prints de analytics, ou quiser entender o que funcionou e o que não funcionou. Também use quando mencionar 'métricas', 'performance', 'analytics', 'engajamento', 'esse post bombou', 'esse post flopou', 'o que funcionou', 'o que melhorar', 'analisar resultado', 'taxa de engajamento'. Se o usuário quer aprender com posts passados para melhorar os próximos, esta é a skill. É a única skill que ESCREVE no HOOK_LIBRARY.md."
---

# Skill 6 — Performance Analyzer

## Propósito

Analisar performance de conteúdos publicados e gerar insights acionáveis que retroalimentam todo o pipeline — especialmente a biblioteca de hooks e a estratégia de pilares.

## Context Files

Carregar:
- `HOOK_LIBRARY.md` — comparar com hooks documentados e ATUALIZAR com novos dados

**NÃO carregar:** BRAND_VOICE, PRODUCT_CONTEXT, AUDIENCE_PROFILES, COMPETITOR_MAP, CONTENT_PILLARS, PLATFORM_SPECS, VISUAL_IDENTITY

**Nota importante:** Esta é a ÚNICA skill que ESCREVE no `HOOK_LIBRARY.md`. Todas as outras apenas lêem.

## Fontes de Dados Aceitas

- Métricas digitadas pelo usuário (impressões, engajamento, cliques, saves, shares)
- Screenshots de analytics (Instagram Insights, LinkedIn Analytics)
- Dados exportados em CSV ou planilha
- Descrição qualitativa ("esse post bombou", "esse não foi bem")

## Framework de Análise — WHAT-WHY-NEXT

### WHAT (O que aconteceu)
- Performance absoluta (números)
- Comparação com média dos últimos posts (se disponível)
- Qual métrica se destacou? (alto alcance mas baixo engajamento? Alto save mas baixo share?)

### WHY (Por que aconteceu)
- **Hook:** Foi forte? Qual categoria?
- **Formato:** Carrossel, vídeo, texto? Qual performa melhor historicamente?
- **Tema:** Qual pilar/funil? Persona certa?
- **Timing:** Horário, dia da semana, contexto sazonal
- **Padrões:** Cruzar com últimos 5-10 posts para tendências

### NEXT (O que fazer agora)
- Quais hooks replicar? (→ atualizar HOOK_LIBRARY)
- Quais formatos priorizar?
- Quais temas explorar mais ou menos?
- Testes A/B sugeridos para o próximo ciclo

## Atualização da HOOK_LIBRARY.md

Após cada análise, sugerir adição à biblioteca:

```markdown
## Hook: "[texto do hook]"
- **Data:** [quando usado]
- **Plataforma:** [qual]
- **Formato:** [carrossel, reels, etc.]
- **Categoria:** [dor, contrarian, número, etc.]
- **Métricas:** Impressões: [X] | Engajamento: [Y]% | Saves: [Z]
- **Veredito:** ✅ Replicar / ⚠️ Testar variação / ❌ Não replicar
- **Aprendizado:** [1 frase sobre o que funcionou ou não]
```

Confirmar com o usuário antes de salvar: "Posso adicionar esse hook à biblioteca para referência futura?"

## Formato de Output

```markdown
# Análise de Performance — [Título ou descrição do post]
**Plataforma:** [qual] | **Data:** [quando] | **Formato:** [qual]

## O que aconteceu (WHAT)
[Números e comparações]

## Por que aconteceu (WHY)
[Análise de hook, formato, tema, timing]

## O que fazer agora (NEXT)
- [Ação 1]
- [Ação 2]
- [Ação 3]

## Hooks para a biblioteca
[Hook(s) sugerido(s) para adicionar ao HOOK_LIBRARY com veredito]
```
