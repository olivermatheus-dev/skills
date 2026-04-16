# Output Template — INDEX.md

Use este template exato ao gerar o arquivo INDEX.md (sumário do pacote de copy foundation).

---

```markdown
---
artifact: copy_foundation_index
company: [slug]
generated_at: [YYYY-MM-DD]
version: 1
---

# Copy Foundation — [Nome da empresa]

Este pacote contém artefatos de copy foundation para venda direta. Cada arquivo é derivado dos context files do setup e pode ser consumido por:

- **Humanos** — escrevendo sales page, email, VSL manualmente
- **Skills downstream** — ex: geração de sales page HTML usando VISUAL_IDENTITY + estes artefatos

## Modo de geração

- **Modo:** [unificado | bifurcado]
- **Perfis:** [unificado] OU [decisor, usuario]
- **Estrutura de arquivos:**
  - Unificado: artefatos ficam na raiz de `context/copy/`
  - Bifurcado: artefatos ficam em `context/copy/decisor/` e `context/copy/usuario/` (cada perfil tem os 7)

Para detalhes da sessão (status por artefato, histórico, depósito intermediário), ver [`COPY_SESSION_STATE.md`](COPY_SESSION_STATE.md).

## Artefatos neste pacote

| # | Arquivo | Status | Quando usar |
|---|---|---|---|
| 1 | [`BIG_IDEA.md`](BIG_IDEA.md) | [draft/approved] | Toda peça começa por aqui. H1 de sales, subject principal de email, hook de topo. |
| 2 | [`UNIQUE_MECHANISM.md`](UNIQUE_MECHANISM.md) | [status] | Seção "como funciona", reply a "é igual a X", post técnico. |
| 3 | [`MECHANISM_OF_FAILURE.md`](MECHANISM_OF_FAILURE.md) | [status] | "Por que você ainda sofre" em sales, hook "Pare de [abordagem errada]", email #2 da nutrição. |
| 4 | [`OBJECTIONS.md`](OBJECTIONS.md) | [status] | FAQ da sales, emails BOFU, VSL, call de fechamento. |
| 5 | [`VALUE_STACK.md`](VALUE_STACK.md) | [status] | "O que você recebe" + ancoragem de preço, propostas comerciais. |
| 6 | [`PROOF_HIERARCHY.md`](PROOF_HIERARCHY.md) | [status] | Qualquer seção que precise de "por que confiar". |
| 7 | [`CTA_LIBRARY.md`](CTA_LIBRARY.md) | [status] | Qualquer CTA. Escolha pelo nível de consciência do público. |

## Receita: montagem de sales page

Ordem recomendada usando os 7 artefatos:

```
1. Hero         → BIG_IDEA.md (Promessa Central)  +  PROOF_HIERARCHY (Tier 1 — número)
2. Problema     → MECHANISM_OF_FAILURE.md (as 3 formas de falhar)
3. Solução      → UNIQUE_MECHANISM.md (nome + metáfora + prova de unicidade)
4. Benefícios   → VALUE_STACK.md (stack completo)
5. Prova        → PROOF_HIERARCHY.md (Tier 2 cases)
6. Oferta       → VALUE_STACK.md (âncora de preço) + CTA_LIBRARY (Nível 5)
7. Objeções/FAQ → OBJECTIONS.md (5 universais na ordem da persona)
8. CTA final    → CTA_LIBRARY.md (Nível 5)
```

## Receita: sequência de email (5 emails BOFU)

```
Email 1 — Problema nomeado     → MECHANISM_OF_FAILURE
Email 2 — Solução revelada     → UNIQUE_MECHANISM
Email 3 — Prova social          → PROOF_HIERARCHY (Tier 2)
Email 4 — Objeção + resposta    → OBJECTIONS (1 objeção por email)
Email 5 — Oferta + urgência     → VALUE_STACK + CTA_LIBRARY (Nível 5)
```

## Receita: VSL (Video Sales Letter)

```
0:00  Hook        → MECHANISM_OF_FAILURE (vilão nomeado)
0:30  Promessa    → BIG_IDEA
1:30  Autoridade  → PROOF_HIERARCHY (Tier 4 + 5 = experiência + autoridade)
3:00  Storytelling→ MECHANISM_OF_FAILURE (narrativa)
6:00  Revelação   → UNIQUE_MECHANISM
10:00 Prova       → PROOF_HIERARCHY (Tier 2 cases)
13:00 Oferta      → VALUE_STACK
17:00 Objeções    → OBJECTIONS (as 5 em ordem de peso)
22:00 CTA         → CTA_LIBRARY (Nível 5)
```

## Regeneração

Para atualizar estes artefatos quando o setup mudar (novo concorrente, nova persona, ajuste de preço):

```
/setup-copy-foundation [empresa]
```

A skill detecta arquivos existentes e oferece:
- Atualizar todos (re-derive + re-pergunta)
- Atualizar apenas os que tiveram `source_files` modificados
- Pular existentes e gerar só os faltantes

## Changelog

- [YYYY-MM-DD] — Versão inicial gerada após setup completo.
```
