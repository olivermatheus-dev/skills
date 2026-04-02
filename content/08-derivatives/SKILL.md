---
name: content-derivatives
description: "Analisa conteúdo bruto e identifica todos os formatos derivados possíveis: tierlists, rankings, comparativos, infográficos, quizzes, checklists, templates, calculadoras e mais. Use quando o usuário tiver conteúdo pesquisado ou escrito e quiser maximizar a produção com formatos derivados. Também use quando mencionar 'tierlist', 'ranking', 'comparativo', 'derivar conteúdo', 'transformar em outros formatos', 'reaproveitar', 'quantos formatos consigo tirar disso', 'antes e depois', 'checklist', 'infográfico'. Se o usuário quer extrair o máximo de um conteúdo existente, esta é a skill."
---

# Skill 5B — Content Derivatives Engine

## Propósito

Analisar um conteúdo-pilar e identificar automaticamente quais formatos derivados são possíveis, classificando por viabilidade e potencial de engajamento. O objetivo é maximizar o ROI de cada conteúdo produzido.

## Context Files Obrigatórios

Carregar ANTES de derivar:
- `PLATFORM_SPECS.md` — quais formatos performam em cada plataforma

**NÃO carregar:** BRAND_VOICE, PRODUCT_CONTEXT, AUDIENCE_PROFILES, COMPETITOR_MAP, CONTENT_PILLARS, HOOK_LIBRARY, VISUAL_IDENTITY

## Input Esperado

- Conteúdo-pilar completo (output da Skill 4) ou pesquisa completa (output da Skill 2)
- Identificar as marcações de atomização se presentes (tags HTML da Skill 4)

## Catálogo de Formatos Derivados

Analisar o conteúdo contra TODOS os formatos abaixo:

| Formato | Viável quando... | Exemplo |
|---|---|---|
| **Tier List** | Múltiplos itens classificáveis | "Tier List de CRMs para PMEs: S, A, B, C-tier" |
| **Ranking / Top N** | Itens ordenáveis por critério claro | "Top 5 erros de follow-up que matam vendas" |
| **Comparativo (vs.)** | 2+ opções contrastáveis | "Planilha vs. CRM: qual funciona para times pequenos?" |
| **Antes/Depois** | Cenário de transformação | "Time sem processo vs. com funil: o que muda em 30 dias" |
| **Checklist** | Etapas ou itens verificáveis | "Checklist: 10 sinais de que seus leads estão vazando" |
| **Infográfico** | Dados quantitativos ou fluxos visuais | "O caminho de um lead: da entrada ao fechamento" |
| **Mapa mental** | Conceitos interconectados | "Tudo que influencia a conversão do time" |
| **Quiz / Enquete** | Autodiagnóstico possível | "Qual o nível de maturidade comercial da sua empresa?" |
| **Template / Modelo** | Framework replicável | "Template: funil de 5 etapas para serviços" |
| **Calculadora / Simulador** | Números manipuláveis | "Quanto você perde por mês sem follow-up?" |
| **Mito vs. Realidade** | Crenças contestáveis | "5 mitos sobre CRM que doem nas PMEs" |
| **Linha do tempo** | Progressão temporal | "Os 90 primeiros dias com processo de vendas" |
| **Quote card** | Frases impactantes | Card com citação ou dado impactante |
| **Problema → Solução** | Pares problema/solução | "3 problemas de equipes de 3 vendedores" |
| **Hot take** | Posicionamento forte | "CRM gratuito é mais caro que CRM pago" |
| **Storytelling case** | Narrativa de caso real | Relato de transformação de cliente |
| **Tutorial passo-a-passo** | Sequência de ações | "Configure seu primeiro funil em 4 passos" |
| **Carrossel educativo** | Conceitos em sequência | "O ABC de gestão de leads: 8 conceitos em 8 slides" |
| **POV / Cenário** | Situação identificável | "POV: você é gestor e não sabe por que o time não bate meta" |

Consultar `references/format-catalog.md` para catálogo expandido quando disponível.

## Análise de Viabilidade

Para cada formato, avaliar:

| Critério | O que medir |
|---|---|
| **Viável?** | O conteúdo tem os elementos necessários? |
| **Potencial de engajamento** | Alto / Médio / Baixo — baseado em dados de performance por formato |
| **Plataforma ideal** | Onde esse formato performa melhor? |
| **Esforço de produção** | Baixo / Médio / Alto — trabalho adicional necessário |

## Formato de Output

```markdown
# Análise de Derivados — [Título do conteúdo-pilar]

## 🟢 Alta prioridade
1. **[Formato]** — Potencial: Alto | Plataforma: [quais] | Esforço: [nível]
   - Elementos identificados: [o que do conteúdo serve]
   - Sugestão de execução: [como montar]

2. **[Formato]** — Potencial: Alto | Plataforma: [quais] | Esforço: [nível]
   - Elementos identificados: [lista]
   - Sugestão de execução: [como montar]

## 🟡 Média prioridade
[mesma estrutura]

## ⚪ Possível mas não prioritário
[mesma estrutura]

## ❌ Não viáveis
- **[Formato]:** [motivo — ex: sem dados numéricos manipuláveis]
```

## Após a Análise

Perguntar: "Qual formato quer produzir primeiro? Posso adaptar para a plataforma (→ Skill 5A) ou criar os slides visuais (→ Skill 8 Carousel Creator)."
