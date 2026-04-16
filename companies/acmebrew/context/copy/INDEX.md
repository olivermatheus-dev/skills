---
artifact: copy_foundation_index
company: acmebrew
generated_at: 2026-04-16
version: 1
---

# Copy Foundation — AcmeBrew

Este pacote contém 7 artefatos de copy foundation para venda direta (assinatura recorrente B2C de café especialidade), derivados dos context files do setup da AcmeBrew em 2026-04-16.

- **Humanos** — escrevendo sales page, email, TikTok, newsletter manualmente
- **Skills downstream** — ex: futura skill de geração de sales page HTML usando VISUAL_IDENTITY + estes artefatos

## Modo de geração

- **Modo:** unificado
- **Perfis:** [unificado]
- **Estrutura:** artefatos na raiz de `context/copy/` (1 persona Julia, sem bifurcação B2B)

Para detalhes da sessão (status, histórico, depósito intermediário com todos os campos das 7 sub-skills), ver [`COPY_SESSION_STATE.md`](COPY_SESSION_STATE.md).

## Artefatos neste pacote

| # | Arquivo | Status | Quando usar |
|---|---|---|---|
| 1 | [`BIG_IDEA.md`](BIG_IDEA.md) | draft | Toda peça começa por aqui. H1 "Descubra um café raro todo mês — sem precisar virar sommelier". |
| 2 | [`UNIQUE_MECHANISM.md`](UNIQUE_MECHANISM.md) | draft | Seção "como escolhemos cada café" em sales, About page, série Instagram. Nome: "Curadoria Produtor-a-Xícara". |
| 3 | [`MECHANISM_OF_FAILURE.md`](MECHANISM_OF_FAILURE.md) | draft | Seção "por que café do supermercado decepciona" em sales, hook TikTok, email #2 nutrição. Vilão: rotação lenta + linguagem snob + sabor achatado. |
| 4 | [`OBJECTIONS.md`](OBJECTIONS.md) | draft | FAQ da sales, emails BOFU, call de atendimento. Ordem de peso: 1→4→5→3→2. |
| 5 | [`VALUE_STACK.md`](VALUE_STACK.md) | draft | "O que você recebe" + ancoragem R$ 245 de valor por R$ 89 de preço (= economia R$ 156/mês). |
| 6 | [`PROOF_HIERARCHY.md`](PROOF_HIERARCHY.md) | draft | Qualquer seção de confiança. Força: 12k assinantes + NPS 68 + 2 prêmios. Gap #1: falta case estruturado. |
| 7 | [`CTA_LIBRARY.md`](CTA_LIBRARY.md) | draft | Qualquer CTA. 15 variações + 7 plataformas (Insta/TikTok/YT/Newsletter/Blog/Email/Sales). |

## Receita: montagem de sales page (AcmeBrew)

```
1. Hero         → BIG_IDEA (Promessa Central) + PROOF (Tier 1 — "12k assinantes, NPS 68")
2. Problema     → MECHANISM_OF_FAILURE (3 formas de falhar: rotação lenta, snob, sabor achatado)
3. Solução      → UNIQUE_MECHANISM ("Curadoria Produtor-a-Xícara" + metáfora dos 3 amigos baristas)
4. Benefícios   → VALUE_STACK (tabela com 5 itens = R$ 245/mês de valor)
5. Prova        → PROOF_HIERARCHY (Tier 1 + Tier 4 prêmios)
6. Oferta       → VALUE_STACK (Âncora 1: Custo da Inação) + CTA_LIBRARY (Nível 5: "Começar minha primeira caixa")
7. Objeções/FAQ → OBJECTIONS (5 universais na ordem de peso para Julia: 1→4→5→3→2)
8. CTA final    → CTA_LIBRARY (Nível 5: "Assinar plano Básico — R$ 89/mês")
```

## Receita: sequência de 5 emails BOFU

```
Email 1 — Problema nomeado       → MECHANISM_OF_FAILURE (vilão: "rótulo bonito, curadoria algoritmo")
Email 2 — Solução revelada        → UNIQUE_MECHANISM ("3 baristas, 100 cafés/mês, 4 escolhidos")
Email 3 — Prova social             → PROOF_HIERARCHY (Tier 4 prêmios + Tier 3 volume Instagram)
Email 4 — Objeção + resposta       → OBJECTIONS (Objeção 1: "meu paladar não é apurado")
Email 5 — Oferta + primeira caixa  → VALUE_STACK (Âncora 1) + CTA_LIBRARY (Nível 5)
```

## Receita: série de 4 posts carrossel Instagram (Nível 2 — topo/meio de funil)

```
Post 1 → MECHANISM_OF_FAILURE (Falha 1: rotação lenta)       | CTA "Saiba mais"
Post 2 → MECHANISM_OF_FAILURE (Falha 2: linguagem snob)      | CTA "Siga a gente"
Post 3 → UNIQUE_MECHANISM (apresentação dos 3 curadores)     | CTA "Veja quem curou o mês"
Post 4 → PROOF_HIERARCHY + VALUE_STACK leve                   | CTA Nível 4 "Experimente"
```

## Regeneração

Para atualizar estes artefatos quando mudar setup (nova persona, novo concorrente, ajuste de preço, novo case para PROOF):

```
/setup-copy-foundation acmebrew
```

A skill detecta arquivos existentes e oferece:
- Atualizar todos
- Atualizar apenas os com `source_files` modificados
- Pular existentes e gerar só os faltantes

## Changelog

- **2026-04-16 v1** — smoke test de reuso. Gerado logo após refatoração da Camada 1 em orquestrador + 7 sub-skills atômicas. Todos artefatos como `draft` (requer aprovação humana da AcmeBrew para virar `approved`).

## Pontos de atenção para revisão humana

1. **Nome "Curadoria Produtor-a-Xícara"** — proposta do smoke test; AcmeBrew pode já ter nome interno diferente.
2. **Valores do VALUE_STACK** — plausíveis mas não auditados; validar com métricas reais de uso.
3. **Gaps de PROOF Tier 2** — estruturar case Julia-like é prioridade urgente de marketing.
