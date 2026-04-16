# Output Template — VALUE_STACK.md

Use este template exato ao gerar o arquivo VALUE_STACK.md.

---

```markdown
---
artifact: value_stack
company: [slug]
generated_at: [YYYY-MM-DD]
source_files:
  - context/PRODUCT_CONTEXT.md
  - context/AUDIENCE_PROFILES.md
version: 1
status: draft
---

# Value Stack — [Nome da empresa]

> **Framework:** Price anchoring (tradição direct response — Hopkins, Halbert).
> Quando o valor percebido de cada benefício é explicitado e somado, o preço
> final parece uma pechincha. Este documento destila os componentes de valor
> do produto com âncoras em R$ para usar em sales pages, propostas e calls.

## Custo da Inação (status quo sem o produto)

Do AUDIENCE_PROFILES, o que este cliente perde HOJE:

| Dimensão | Custo |
|---|---|
| **Financeiro** | R$ [X]/mês |
| **Tempo** | [horas/semana] por [quem] |
| **Emocional** | [descrição qualitativa] |
| **Prazo crítico** | [quando vira insustentável] |

**Total de perda anualizada:** R$ [valor] + [custo intangível]

## Stack de Valor Entregue

Cada feature/benefício com valor percebido em R$:

| # | Benefício | O que entrega de concreto | Valor percebido/mês |
|---|---|---|---|
| 1 | [Feature 1] | [impacto operacional] | R$ [X] |
| 2 | [Feature 2] | [impacto operacional] | R$ [X] |
| 3 | [Feature 3] | [impacto operacional] | R$ [X] |
| 4 | [Feature 4] | [impacto operacional] | R$ [X] |
| 5 | [Bonus — feature subestimada] | [impacto] | R$ [X] |
| **TOTAL** | | | **R$ [SOMA]/mês** |

**Preço real:** R$ [preço]/mês
**Economia mensal (stack - preço):** R$ [diff]
**Economia anualizada:** R$ [diff × 12]

## 3 Âncoras de preço para copy

Cada uma é um parágrafo plug-and-play para usar em sales page, proposta ou call.

### Âncora 1 — Custo da Inação
> "Você já perde R$ [X]/mês com [problema]. O preço é [Y]% dessa perda — e para no primeiro dia de uso."

### Âncora 2 — Alternativa humana
> "Um [profissional equivalente] dedicado custa R$ [X]/mês. Por R$ [preço]/mês o [produto] entrega o mesmo sem [limites do humano]."

### Âncora 3 — Stack somado
> "Comprando cada benefício separadamente: R$ [SOMA]. Pacote completo: R$ [preço]. Você economiza R$ [diff] todo mês — pra sempre."

## Regras de construção

1. **Valor percebido ≠ custo de produção.** Usar o que o cliente ganhou/deixou de perder, não o que custa operar.
2. **Ancorar em unidade familiar do cliente.** Se persona é tech lead, usar "horas de dev sênior"; se é CMO, "CAC"; se é CEO, "receita perdida".
3. **Nunca somar coisas que o cliente não contaria.** Ex: "acesso ao suporte por email" pode ter valor, mas se a persona não paga por suporte separado, não conta.

## Quando usar

- **Sales page:** seção "O que você recebe" com a tabela completa
- **Proposta comercial:** stack de valor precede o preço em 1 página
- **Email de objeção #4 (preço):** usar Âncora 1 ou 3
- **Call de fechamento:** citar a âncora mais forte para o perfil do prospect
- **Material de retenção (evitar churn):** relembrar o stack para cliente considerando cancelar

## Fonte de derivação

- `PRODUCT_CONTEXT.md > Módulos / Funcionalidades principais`: [lista]
- `PRODUCT_CONTEXT.md > Features subestimadas`: [lista — geralmente boa origem de "bonus"]
- `PRODUCT_CONTEXT.md > Detalhes comerciais > Faixa de preço`: "[valor]"
- `PRODUCT_CONTEXT.md > Time-to-value`: "[citação]"
- `AUDIENCE_PROFILES.md > Persona > Custo da Inação`: [tabela 4 dimensões]
- `AUDIENCE_PROFILES.md > Persona > Percepção do preço do produto`: "[citação]"
```
