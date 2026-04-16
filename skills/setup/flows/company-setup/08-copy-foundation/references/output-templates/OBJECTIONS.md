# Output Template — OBJECTIONS.md

Use este template exato ao gerar o arquivo OBJECTIONS.md.

---

```markdown
---
artifact: objections
company: [slug]
generated_at: [YYYY-MM-DD]
source_files:
  - context/PRODUCT_CONTEXT.md
  - context/AUDIENCE_PROFILES.md
version: 1
status: draft
---

# Objections Framework — [Nome da empresa]

> **Framework:** 5 objeções universais (tradição direct response — Halbert,
> Kurtz, Makepeace). Toda venda acontece quando as 5 são neutralizadas,
> mesmo que o cliente verbalize só 1-2. Esta matriz trata as 5 com
> verbalização típica + resposta curta + resposta longa + prova de apoio.

## Matriz das 5 Objeções Universais

---

### Objeção 1 — "Não funciona" (ceticismo sobre resultado)

**Como a persona verbaliza:**
> "[citação típica — ex: 'Parece bom demais para ser verdade']"

**Resposta curta (1 frase para reply rápido):**
> "[resposta]"

**Resposta longa (para FAQ / email):**

[Parágrafo de 2-3 frases que amplia a resposta curta com mecanismo + prova.]

**Prova de apoio:**
- [Tier 1 de PROOF_HIERARCHY — dado quantitativo]
- [Tier 2 de PROOF_HIERARCHY — case específico]

---

### Objeção 2 — "Não funciona pra mim" (context mismatch)

**Como a persona verbaliza:**
> "[citação — ex: 'Meu caso é diferente, somos muito pequenos']"

**Resposta curta:**
> "[resposta]"

**Resposta longa:**

[Parágrafo demonstrando que o produto atende especificamente este contexto.]

**Prova de apoio:**
- [Case de empresa com perfil similar ao da persona]
- [Anti-persona do PRODUCT_CONTEXT — confirma quem é e quem NÃO é o cliente ideal]

---

### Objeção 3 — "Não consigo usar / é complicado" (esforço percebido)

**Como a persona verbaliza:**
> "[citação — ex: 'Não tenho tempo nem time pra migrar']"

**Resposta curta:**
> "[resposta]"

**Resposta longa:**

[Parágrafo focando em time-to-value + onboarding + DX.]

**Prova de apoio:**
- Time-to-value do PRODUCT_CONTEXT
- [Case de onboarding rápido / número específico de minutos]

---

### Objeção 4 — "Não posso pagar agora" (price/timing)

**Como a persona verbaliza:**
> "[citação — ex: 'Está fora do orçamento deste trimestre']"

**Resposta curta:**
> "[resposta]"

**Resposta longa:**

[Parágrafo usando ancoragem do VALUE_STACK + custo da inação.]

**Prova de apoio:**
- VALUE_STACK completo (total vs. preço)
- Custo da inação (do AUDIENCE_PROFILES)
- [Mecanismo de preço — ex: trial gratuito, pay-as-you-go]

---

### Objeção 5 — "Não confio em vocês" (trust gap)

**Como a persona verbaliza:**
> "[citação — ex: 'Nunca ouvi falar, como sei que vão estar aqui em 2 anos?']"

**Resposta curta:**
> "[resposta]"

**Resposta longa:**

[Parágrafo combinando autoridade + tempo de mercado + transparência.]

**Prova de apoio:**
- [Tempo de mercado, clientes, NPS]
- [Origin story — credibilidade do fundador]
- [Transparência técnica / mostrar o "como" do produto]

---

## Objeções específicas desta persona (não universais)

Do AUDIENCE_PROFILES, objeções adicionais deste perfil que não se encaixam nas 5 universais:

- **[Objeção específica 1]:** [resposta]
- **[Objeção específica 2]:** [resposta]

## Como usar

- **Sales page FAQ:** 5 perguntas = 5 objeções, NA ORDEM ACIMA (peso decrescente)
- **Email sequence BOFU:** 1 email por objeção = sequência de 5 emails
- **Landing sections:** intercalar prova + resposta de objeção após cada benefício
- **VSL:** abordar as 5 na ordem de maior peso para a persona específica
- **Call de fechamento:** roteiro de resposta pronta para as 5

## Regra de prioridade

Ordem de tratamento muda por persona. Para [Nome da persona principal], a ordem de peso é:
1. [Objeção mais pesada — ex: Objeção 3]
2. [Segunda]
3. ...

Este ranking vem do Ring 3 (Barreira) da persona.

## Fonte de derivação

- `AUDIENCE_PROFILES.md > Persona > Ring 3 (Barreira)`: "[citação]"
- `AUDIENCE_PROFILES.md > Persona > Objeções principais (3 com resposta)`: [tabela]
- `PRODUCT_CONTEXT.md > Objeção principal pré-compra`: "[citação]"
- `PRODUCT_CONTEXT.md > Prova social disponível`: [lista]
- `PRODUCT_CONTEXT.md > Limitações do produto`: [lista] (confirma honestidade)
```
