---
artifact: mechanism_of_failure
company: testco
generated_at: 2026-04-16
source_files:
  - context/COMPETITOR_MAP.md
  - context/AUDIENCE_PROFILES.md
  - audiences/AUDIENCE_ana-tech-lead.md
version: 1
status: draft
---

# Mechanism of Failure — TestCo

> **Framework:** StoryBrand (Donald Miller) — toda história precisa de um vilão.
> Este documento nomeia o "vilão" da categoria: por que outras soluções falham.
> O herói (tech lead) só é salvo pelo guia (TestCo) que entende como derrotar
> este vilão específico.

## O Vilão — em uma frase

> "A ilusão de que teste E2E é só escrever código — quando na verdade 80% do trabalho é manter o que já foi escrito."

A abordagem comum trata teste como artefato único, feito uma vez. Mas todo teste E2E nasce com prazo de validade curto: a cada refator de UI, ele quebra. Frameworks tradicionais transferem o custo de manutenção silenciosamente para o time, que só percebe a sangria meses depois.

## As 3 formas de falhar

### 1. Fragilidade por design (selectors acoplados ao DOM)
- **O que acontece:** testes E2E tradicionais dependem de selectors CSS ou XPath que quebram à menor mudança de estrutura — mesmo sem mudança de comportamento real
- **Sintoma que o cliente vê:** "Os testes quebram toda vez que a gente mexe no CSS. Dá uma raiva."
- **Por que é inevitável nessa abordagem:** frameworks como Cypress e Playwright foram projetados para execução, não para sobreviver a refator — o selector é contrato explícito do dev, não um sinal que o framework interpreta

### 2. Flakiness acumulada sem diagnóstico
- **O que acontece:** testes que "às vezes passam, às vezes falham" são marcados como `.skip()` ou aceitos como normais, corroendo a confiança no CI ao longo do tempo
- **Sintoma que o cliente vê:** "Na última sprint o CI travou 3x por teste flaky — perdi meia tarde procurando o que quebrou e no final era só data mock desatualizado."
- **Por que é inevitável nessa abordagem:** sem dashboard de flakiness temporal, você não vê o padrão — só vê o teste falhando hoje, não que ele falha 30% das vezes há 3 meses

### 3. Dívida de manutenção invisível
- **O que acontece:** 15-20% do tempo dos devs sêniores vai para consertar testes, mas ninguém contabiliza — fica diluído em sprints e vira "parte do trabalho"
- **Sintoma que o cliente vê:** "Perco 6-8h por semana do meu time com manutenção de teste. Três devs já comentaram em 1:1 que 'testes são um peso morto'."
- **Por que é inevitável nessa abordagem:** o custo só fica visível se você mede — e nenhum framework tradicional entrega esse relatório por padrão

## Como o Auto-Heal Engine derrota o vilão

O Auto-Heal Engine foi construído especificamente para virar o jogo nas 3 falhas:

- **Contra Falha 1 (Fragilidade):** o engine não se apega ao selector — ele reconhece o elemento equivalente após refator e conserta sozinho. Dev não precisa abrir arquivo de teste a cada mudança de UI.
- **Contra Falha 2 (Flakiness invisível):** o dashboard de flakiness mostra quais testes são historicamente instáveis, com heatmap temporal — o padrão vira visível no primeiro dia de uso.
- **Contra Falha 3 (Dívida invisível):** cada PR de conserto é auditável, e o volume de consertos autônomos por semana vira métrica no dashboard — você mede quanto tempo de dev está sendo poupado.

## Narrativa de storytelling (para sales page / VSL)

```
Antes: Ana passava sexta-feira à tarde debugando CI — "o teste quebrou de novo,
       nem mexi no fluxo, só mudei o CSS."

Descobriu: o problema nunca foi o CSS. Era a abordagem — tratar teste como
           código estático, quando na verdade teste é contrato vivo com a UI.

Por que: Cypress, Playwright e companhia foram desenhados para EXECUTAR testes,
         não para MANTER. Toda a dívida de manutenção que os times acumularam
         veio dessa decisão de design silenciosa.

Solução: O Auto-Heal Engine foi construído do zero para sobreviver a refator.
         Ele trata teste como sinal, não como selector — e a cada mudança de UI,
         o engine propõe o conserto. O dev revisa em 30 segundos.

Agora: O time de Ana roda deploy sexta-feira sem medo. O CI fica verde
       consistente. E Ana é a tech lead conhecida por ter construído cultura
       de qualidade — sem virar pesadelo burocrático.
```

## Quando usar

- **Sales page:** seção "Por que você ainda está sofrendo com teste flaky" ANTES de apresentar o Auto-Heal Engine
- **Email #2 da sequência de nutrição:** "Por que teste E2E quebra mesmo sem você ter mudado nada"
- **Ads TOFU:** hook "Pare de confiar em selectors que quebram"
- **Posts MOFU:** "3 motivos pelos quais seu CI está travando (e não é o teste que tá errado)"
- **Call de discovery:** roteiro para diagnóstico de flakiness no prospect

## Fonte de derivação

- `COMPETITOR_MAP.md > Concorrentes Diretos > Cypress > Pontos fracos`: "Sem auto-reparo de testes; flakiness é problema recorrente"
- `COMPETITOR_MAP.md > Concorrentes Diretos > Playwright > Pontos fracos`: "ainda sofre de flakiness; setup inicial mais complexo"
- `COMPETITOR_MAP.md > Concorrentes Indiretos > Manter Cypress + QA dedicado > Limitação que nos favorece`: "Não escala — cada dev QA novo é custo que não resolve o problema estrutural"
- `audiences/AUDIENCE_ana-tech-lead.md > Dores em 3 Camadas > Camada 1`: "Os testes quebram toda vez que a gente mexe no CSS. Dá uma raiva."
- `audiences/AUDIENCE_ana-tech-lead.md > Dores em 3 Camadas > Camada 2`: "Perco 6-8h por semana do meu time com manutenção de teste."
- `audiences/AUDIENCE_ana-tech-lead.md > Narrativa Interna`: "É porque a gente cresceu rápido e não teve tempo de estruturar qualidade — mas é temporário, já vai passar."
- `audiences/AUDIENCE_ana-tech-lead.md > O Que Já Tentou > Cypress puro`: "Testes quebram a cada refator, sem auto-reparo"
