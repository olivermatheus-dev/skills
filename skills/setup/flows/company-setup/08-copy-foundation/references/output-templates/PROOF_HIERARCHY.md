# Output Template — PROOF_HIERARCHY.md

Use este template exato ao gerar o arquivo PROOF_HIERARCHY.md.

---

```markdown
---
artifact: proof_hierarchy
company: [slug]
generated_at: [YYYY-MM-DD]
source_files:
  - context/PRODUCT_CONTEXT.md
version: 1
status: draft
---

# Proof Hierarchy — [Nome da empresa]

> **Framework:** Cialdini (Influence) + tradição direct response.
> Nem toda prova tem o mesmo peso. Esta hierarquia ordena por força, para
> você saber o que citar primeiro em cada contexto de copy.

## Tier 1 — Prova Quantitativa (mais forte)

Números específicos, auditáveis, difíceis de contestar.

- **Dados proprietários:** [ex: "180 empresas ativas", "NPS 72"]
- **Benchmarks:** [ex: "90% de taxa de auto-reparo"]
- **Comparativos mensurados:** [ex: "CI de 42min para 8min em 30 dias"]
- **Métricas de adoção:** [ex: "uso diário por 70% dos seats ativos"]

**Gap a preencher:** [lista de dados que AINDA NÃO tem mas precisa coletar]

## Tier 2 — Cases Específicos

Histórias concretas de clientes reais, com nome sempre que NDA permitir.

### [Case 1]
- **Empresa:** [nome ou "fintech Series B brasileira"]
- **Contexto inicial:** [dor / estado antes]
- **O que fizeram:** [ação usando o produto]
- **Resultado mensurado:** [número concreto + período]

### [Case 2]
- **Empresa:** ...
- **Contexto inicial:** ...
- **O que fizeram:** ...
- **Resultado mensurado:** ...

### [Case 3]
- **Empresa:** ...
- **Contexto inicial:** ...
- **O que fizeram:** ...
- **Resultado mensurado:** ...

**Gap a preencher:** [quais cases faltam — ex: "nenhum case de migração vindo de X ainda"]

## Tier 3 — Prova Social Agregada

Volume de adoção, reviews, logos.

- **Volume:** [ex: "180 empresas", "450 stars no GitHub"]
- **Logos destacadas:** [marcas conhecidas, se NDA permitir — lista]
- **Reviews públicos:** [links para G2, Capterra, TrustPilot, etc. — se aplicável]
- **Presença em comunidades:** [menções em newsletters, podcasts do setor]

## Tier 4 — Autoridade (terceiros validam)

Menções, prêmios, imprensa, parcerias.

- **Imprensa:** [lista de matérias com links]
- **Parcerias estratégicas:** [integrações, partnerships com marcas reconhecidas]
- **Prêmios / certificações:** [lista]
- **Endorsements:** [citações de nomes reconhecidos no setor]

## Tier 5 — Experiência e Tempo (mais fraca — não usar sozinha)

Só funciona junto com algum dos tiers acima. Usada isolada soa defensiva.

- **Tempo de mercado:** [X anos]
- **Background do fundador:** [credencial relevante]
- **Volume histórico:** [total de usuários/operações ao longo do tempo]

## Matriz: qual tier usar em qual contexto

| Contexto | Tiers primários | Motivo |
|---|---|---|
| **Sales page hero** | Tier 1 + 2 | Headline precisa de número + nome |
| **Sales page seção "Provas"** | Tier 1 + 2 + 3 | Profundidade + volume |
| **FAQ de produto** | Tier 3 | Volume quebra ceticismo |
| **About page** | Tier 4 + 5 | Contextualiza autoridade |
| **Email BOFU (case)** | Tier 2 | Narrativa específica engaja |
| **Email objeção "não funciona"** | Tier 1 | Números neutralizam ceticismo |
| **Ads de topo** | Tier 1 | Número chocante = hook |
| **Proposta comercial** | Tier 1 + 2 + 3 | Máxima profundidade |
| **Post técnico** | Tier 1 + 4 | Dado proprietário + validação externa |

## Regras de combinação

1. **Nunca usar Tier 5 sozinho.** Sempre emparelhe com Tier 1 ou 2.
2. **Um número por headline.** Múltiplos números competem pela atenção.
3. **Case com nome bate case anônimo.** Preferir nomes reconhecidos (se NDA permitir) a "uma grande empresa".
4. **Prova fresca bate prova antiga.** Rotacionar cases — o mesmo case há 2 anos perde força.

## Fonte de derivação

- `PRODUCT_CONTEXT.md > Prova social disponível`: [lista]
- `PRODUCT_CONTEXT.md > Detalhes comerciais`: [modelo, ticket — contexto para tier 3]
- `PRODUCT_CONTEXT.md > Limitações do produto`: [lista] (identificar gaps de prova)
- `COMPANY_PROFILE.md > Tempo real de mercado, Tamanho da operação` (opcional): "[dados]"
```
