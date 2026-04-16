---
artifact: copy_foundation_index
company: testco
generated_at: 2026-04-16
version: 1
---

# Copy Foundation — TestCo

Este pacote contém 7 artefatos de copy foundation para venda direta, derivados dos context files do setup da TestCo em 2026-04-16. Cada arquivo é consumível por:

- **Humanos** — escrevendo sales page, email, VSL manualmente
- **Skills downstream** — ex: futura skill de geração de sales page HTML usando VISUAL_IDENTITY + estes artefatos

## Artefatos neste pacote

| # | Arquivo | Status | Quando usar |
|---|---|---|---|
| 1 | [`BIG_IDEA.md`](BIG_IDEA.md) | draft | Toda peça começa por aqui. H1 de sales ("Construa cultura de qualidade sem ser a tech lead que mantém os testes"), subject de email, hook de topo. |
| 2 | [`UNIQUE_MECHANISM.md`](UNIQUE_MECHANISM.md) | draft | Seção "como funciona" (Auto-Heal Engine), reply a "é igual ao Mabl?", post técnico deep-dive. |
| 3 | [`MECHANISM_OF_FAILURE.md`](MECHANISM_OF_FAILURE.md) | draft | "Por que você ainda sofre com flakiness" em sales, hook "Pare de confiar em selectors que quebram", email #2 da nutrição. |
| 4 | [`OBJECTIONS.md`](OBJECTIONS.md) | draft | FAQ da sales, emails BOFU, VSL, call de fechamento. 5 objeções universais na ordem de peso para Ana (tech lead). |
| 5 | [`VALUE_STACK.md`](VALUE_STACK.md) | draft | "O que você recebe" (R$ 16.900/mês de valor por R$ 1.800/mês) + 3 âncoras de preço. |
| 6 | [`PROOF_HIERARCHY.md`](PROOF_HIERARCHY.md) | draft | Qualquer seção que precise de "por que confiar" — provas organizadas em 5 tiers. |
| 7 | [`CTA_LIBRARY.md`](CTA_LIBRARY.md) | draft | Qualquer CTA. Escolher pelo nível de consciência do público + plataforma. |

**Todos os 7 artefatos estão como `draft`.** Status sobe para `approved` após revisão manual pelo usuário responsável pela marca.

## Receita: montagem de sales page TestCo

Ordem recomendada usando os 7 artefatos:

```
1. Hero          → BIG_IDEA (Promessa Central) + PROOF_HIERARCHY (Tier 1 — "90% de auto-reparo")
2. Problema      → MECHANISM_OF_FAILURE (as 3 formas de falhar)
3. Solução       → UNIQUE_MECHANISM (Auto-Heal Engine + metáfora do auto-complete)
4. Benefícios    → VALUE_STACK (stack completo com 6 linhas)
5. Prova         → PROOF_HIERARCHY (Tier 2 — Case Fintech X + Tier 3 volume)
6. Oferta        → VALUE_STACK (Âncora 1: Custo da Inação) + CTA_LIBRARY (Nível 5)
7. Objeções/FAQ  → OBJECTIONS (5 universais na ordem de peso: 3→1→4→5→2)
8. CTA final     → CTA_LIBRARY (Nível 5: "Começar agora")
```

## Receita: sequência de email BOFU (5 emails)

```
Email 1 — Problema nomeado      → MECHANISM_OF_FAILURE (vilão)
Email 2 — Solução revelada      → UNIQUE_MECHANISM (Auto-Heal Engine)
Email 3 — Prova social           → PROOF_HIERARCHY (Fintech X como narrativa)
Email 4 — Objeção + resposta     → OBJECTIONS (1 objeção por email, começando pela #3 "migração")
Email 5 — Oferta + urgência      → VALUE_STACK + CTA_LIBRARY (Nível 5)
```

## Receita: VSL (Video Sales Letter)

```
0:00   Hook        → MECHANISM_OF_FAILURE (o vilão em 1 frase)
0:30   Promessa    → BIG_IDEA (Promessa Central)
1:30   Autoridade  → PROOF_HIERARCHY (Tier 4 + 5 = integrações + 5 anos)
3:00   Storytelling→ MECHANISM_OF_FAILURE (narrativa antes/descobriu/agora)
6:00   Revelação   → UNIQUE_MECHANISM (Auto-Heal Engine + metáfora)
10:00  Prova       → PROOF_HIERARCHY (Case Fintech X com números)
13:00  Oferta      → VALUE_STACK (stack + Âncora 1)
17:00  Objeções    → OBJECTIONS (as 5 em ordem de peso)
22:00  CTA         → CTA_LIBRARY (Nível 5)
```

## Regeneração

Para atualizar estes artefatos quando o setup mudar (novo concorrente, nova persona, ajuste de preço):

```
/setup-copy-foundation testco
```

A skill detecta arquivos existentes e oferece:
- Atualizar todos (re-derive + re-pergunta)
- Atualizar apenas os que tiveram `source_files` modificados
- Pular existentes e gerar só os faltantes

## Changelog

- **2026-04-16 v1** — versão inicial gerada automaticamente no smoke test da skill `/setup-copy-foundation`. Todos os 7 artefatos como `draft`. Revisar pontos marcados em "pontos de atenção" do reporte da skill.
