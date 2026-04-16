---
name: editorial-calendar
description: "Monta calendários editoriais semanais ou mensais, integrando ideias aprovadas, mix de funil, distribuição por plataforma e frequência. Use quando o usuário quiser planejar conteúdo para a semana ou mês, organizar uma grade de publicação, montar calendário editorial, ou programar posts. Também use quando mencionar 'o que postar essa semana', 'planejamento mensal', 'grade de conteúdo', 'agenda de posts', 'preciso de um calendário', 'organizar meus posts'. Se o usuário tem ideias soltas e quer organizá-las no tempo, esta é a skill certa."
---

# Skill 7 — Editorial Calendar Builder

## Propósito

Montar calendários editoriais equilibrados, distribuindo conteúdo entre pilares, estágios de funil, formatos e plataformas de forma estratégica.

## Context Files Obrigatórios

> **Caminhos:** todos os context files estão em `[ACTIVE_COMPANY_PATH]/context/`. O output do calendário é salvo em `[ACTIVE_COMPANY_PATH]/contents/` (nível empresa, não de peça individual) — caminhos resolvidos pelo orquestrador no início da sessão.

Carregar ANTES de montar:
- `CONTENT_PILLARS.md` — pilares, frequência e proporção de funil
- `PLATFORM_SPECS.md` — horários ideais e frequência por plataforma

**NÃO carregar:** BRAND_VOICE, PRODUCT_CONTEXT, AUDIENCE_PROFILES, COMPETITOR_MAP, HOOK_LIBRARY, VISUAL_IDENTITY

## Perguntas Iniciais

1. Qual período? (semana / mês)
2. Frequência por plataforma? (ou usar o que está em CONTENT_PILLARS)
3. Datas especiais ou lançamentos previstos?
4. Há ideias já geradas pela Skill 1 para incluir?

## Regras de Composição

### Distribuição de funil (ajustável)
- 50% TOFU / 30% MOFU / 20% BOFU
- Nunca 3+ posts BOFU consecutivos (fadiga de venda)
- Nunca uma semana inteira sem TOFU

### Distribuição de pilares
- Rotacionar entre os pilares de CONTENT_PILLARS
- Máximo 2 posts consecutivos do mesmo pilar
- Pelo menos 1 post por pilar a cada 2 semanas

### Distribuição de formatos
- Variar entre carrossel, post texto, reels, story, quote card
- LinkedIn: priorizar carrosséis e posts longos
- Instagram: alternar carrossel (engajamento) e reels (alcance)
- Não repetir mesmo formato 3x seguidas na mesma plataforma

## Elementos do Calendário

Para cada slot:

| Campo | Descrição |
|---|---|
| Data | Dia e horário sugerido |
| Plataforma | Onde publicar |
| Pilar | Pilar temático |
| Funil | TOFU / MOFU / BOFU |
| Tema | Título provisório ou ideia |
| Formato | Carrossel, Reels, Post texto, etc. |
| Status | Ideia / Pesquisado / Em produção / Pronto / Publicado |
| Referência | Link para ideia da Skill 1, se existir |

## Slots Especiais

- **Datas comemorativas:** Dia do Empreendedor, Black Friday, início de trimestre, etc.
- **Eventos do produto:** Lançamentos de features, marcos
- **Conteúdo reativo:** Reservar 1-2 slots/semana para trending topics

## Formato de Output

```markdown
# Calendário Editorial — [Mês/Semana]
**Frequência:** [X posts/semana por plataforma]
**Mix:** [X]% TOFU / [Y]% MOFU / [Z]% BOFU

## Semana 1 (DD/MM — DD/MM)

| Dia | Plataforma | Pilar | Funil | Tema | Formato | Status |
|---|---|---|---|---|---|---|
| Seg | LinkedIn | [pilar] | TOFU | "[tema]" | Carrossel 8 slides | Ideia |
| Ter | Instagram | [pilar] | TOFU | "[tema]" | Reels 45s | Ideia |
| Qua | LinkedIn | [pilar] | MOFU | "[tema]" | Post longo | Ideia |
| Qui | Instagram | [pilar] | MOFU | "[tema]" | Carrossel 6 slides | Ideia |
| Sex | LinkedIn | [pilar] | BOFU | "[tema]" | Carrossel case | Ideia |
| Sex | Instagram | — | — | [Slot reativo] | A definir | Reservado |

## Notas da semana
- [Observações, lançamentos, datas]
```

## Após Montar o Calendário

Salvar o arquivo como `OUTPUT_CALENDAR_[YYYY-MM].md` (use o mês coberto, ex: `OUTPUT_CALENDAR_2026-04.md`) em `[ACTIVE_COMPANY_PATH]/contents/`.

Perguntar: "Quer que eu comece a produzir alguma dessas pautas? Posso pesquisar e escrever o conteúdo (→ Skill 2 Research → Skill 4 Writer) ou criar os slides diretamente (→ Skill 8 Carousel Creator)."
