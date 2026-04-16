---
artifact: proof_hierarchy
company: testco
generated_at: 2026-04-16
source_files:
  - context/PRODUCT_CONTEXT.md
  - context/COMPANY_PROFILE.md
version: 1
status: draft
---

# Proof Hierarchy — TestCo

> **Framework:** Cialdini (Influence) + tradição direct response.
> Esta hierarquia ordena por força da prova, para saber o que citar primeiro em cada contexto.

## Tier 1 — Prova Quantitativa (mais forte)

Números específicos, auditáveis, difíceis de contestar.

- **90% de taxa de auto-reparo autônomo** do Auto-Heal Engine (benchmark em 180 empresas)
- **NPS 72** (Q1/2026)
- **Case Fintech X:** CI de 42min → 8min em 30 dias (redução de 81%)
- **Crescimento:** ~R$ 6M ARR, crescendo 12% MoM (2026)

**Gap a preencher:**
- Benchmark comparativo público TestCo vs. Cypress vs. Playwright com metodologia aberta (crítico para conteúdo BOFU)
- Taxa de conversão de trial para paid (dado existe mas não é público)
- Estudo longitudinal: redução de flakiness em 6-12 meses por cliente

## Tier 2 — Cases Específicos

### Case 1: Fintech Series B brasileira (nome sob NDA)
- **Contexto inicial:** suite Cypress com 800 testes, CI de 42 minutos, ~35% dos testes com histórico flaky
- **O que fizeram:** instalaram TestCo em paralelo ao Cypress; em 30 dias, migraram progressivamente usando o Auto-Heal Engine para reparar e estabilizar
- **Resultado mensurado:** CI reduziu de 42min para 8min; flakiness caiu de 35% para < 5%; time recuperou ~120h/mês de dev sênior

### Case 2: [pendente — ainda não temos segundo case consolidado para conteúdo público]

### Case 3: [pendente]

**Gap a preencher:**
- Case de migração partindo de Playwright (nenhum ainda)
- Case de empresa com < 10 devs (para atender segmento menor do ICP)
- Case com nome público (todos atuais sob NDA)

## Tier 3 — Prova Social Agregada

- **Volume de clientes:** 180 empresas ativas (2026)
- **Logos destacadas:** 4 unicórnios brasileiros entre os clientes (nomes sob NDA público — liberar logos é próxima prioridade de marketing)
- **GitHub:** @testco-labs com 450 stars em projetos open-source
- **Reviews públicos:** [ainda sem presença em G2, Capterra — lacuna a preencher]
- **Presença em comunidades:** menções orgânicas em newsletters técnicas (DevTools Digest, entre outras)

## Tier 4 — Autoridade (terceiros validam)

- **Imprensa:** [lacuna — ainda sem matérias em veículos principais]
- **Parcerias estratégicas:** integração oficial com GitHub Actions, GitLab CI, CircleCI e Jenkins — validação implícita dos vendors
- **Prêmios / certificações:** [nenhum destacado ainda]
- **Endorsements:** [gap — falta recrutar 2-3 tech leads reconhecidos para endossar publicamente]

## Tier 5 — Experiência e Tempo (mais fraca — não usar sozinha)

- **Tempo de mercado:** 5 anos (produto em produção desde 2022)
- **Background do fundador:** fundadores eram tech leads frustrados com suítes Cypress/Playwright — narrativa de "dog fooding" autêntica
- **Volume histórico:** Series A captada em 2025 (~R$ 6M ARR)

## Matriz: qual tier usar em qual contexto

| Contexto | Tiers primários | Motivo |
|---|---|---|
| **Sales page hero** | Tier 1 + 2 | Ex: "90% de taxa de auto-reparo — Fintech X reduziu CI em 81% em 30 dias" |
| **Sales page seção "Provas"** | Tier 1 + 2 + 3 | Profundidade com dados, case e volume |
| **FAQ de produto** | Tier 3 | "180 empresas" quebra ceticismo |
| **About/Sobre** | Tier 4 + 5 | Autoridade contextualizada por tempo |
| **Email BOFU #3 (case)** | Tier 2 | Fintech X em narrativa completa |
| **Email de objeção "não funciona"** | Tier 1 | Números neutralizam ceticismo (90%, NPS 72) |
| **Ads LinkedIn (decisor)** | Tier 1 | "90% de auto-reparo" é hook |
| **Ads X/Twitter (dev)** | Tier 1 + 4 | "450 stars no GitHub" tem peso no círculo técnico |
| **Proposta comercial** | Tier 1 + 2 + 3 | Máxima profundidade |
| **Post técnico deep-dive** | Tier 1 + 4 | Dado proprietário + integrações validadas |

## Regras de combinação aplicadas

1. **Nunca usar Tier 5 sozinho.** "5 anos de mercado" só funciona emparelhado com "180 clientes" ou "NPS 72".
2. **Um número por headline.** Escolher entre "90% de auto-reparo" OU "NPS 72" OU "81% de redução de CI" — nunca os três juntos.
3. **Case com nome bate case anônimo.** Prioridade de produto: liberar logos públicas para evoluir Tier 2 e Tier 3.
4. **Prova fresca bate prova antiga.** NPS 72 é Q1/2026 — citar trimestre. Rotacionar cases quando houver mais de 2.

## Pontos de atenção para gap de prova

Em ordem de prioridade:
1. **Liberar logos públicas** — maior alavanca de credibilidade com mínimo esforço
2. **Publicar benchmark comparativo** TestCo vs. Cypress com metodologia aberta
3. **Consolidar 2º e 3º cases** para diversificar Tier 2
4. **Buscar presença em G2** — Tier 3 precisa de reviews externos

## Fonte de derivação

- `PRODUCT_CONTEXT.md > Prova social disponível`: "180 empresas ativas, 4 unicórnios brasileiros (NDA), Case Fintech X redução CI 42→8min, 450 stars GitHub labs, NPS 72"
- `PRODUCT_CONTEXT.md > Diferenciais competitivos`: "IA proprietária — 90% de conserto autônomo"
- `COMPANY_PROFILE.md > Estágio do negócio`: "Series A captada em 2025, ~R$ 6M ARR, crescendo 12% MoM"
- `COMPANY_PROFILE.md > Tempo real de mercado`: "5 anos (produto em produção desde 2022)"
- `COMPANY_PROFILE.md > Origem e motivação`: "Fundadores eram tech leads frustrados..."
