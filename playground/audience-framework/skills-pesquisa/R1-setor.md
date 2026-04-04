# R1 — Pesquisa Setorial

**Responsabilidade:** Estabelecer o contexto de mercado antes de qualquer mapeamento de audiência. Sem saber onde o produto está inserido, as sugestões das etapas seguintes são genéricas. Com esse contexto, cada sugestão é calibrada para a realidade do setor.

**Quando aciona:** Início da Skill 4.1 (Target Audiences), após ler `PRODUCT_CONTEXT.md`. É a primeira pesquisa do fluxo — sem ela, todas as outras são menos precisas.

**Input necessário:**
- Nicho / setor de atuação (de `PRODUCT_CONTEXT.md`)
- Tipo de produto ou serviço
- Região de atuação (Brasil, nicho regional, global)
- Lista inicial de concorrentes percebidos (se o usuário tiver)

> **Nota:** Se `PRODUCT_CONTEXT.md` já contiver informações de mercado ou lista de concorrentes, usar como ponto de partida — não ignorar o que já existe.

---

## O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Tamanho e crescimento do setor | SEBRAE, Statista, relatórios setoriais, web search | O setor está crescendo, estagnado ou encolhendo? Qual o tamanho estimado? |
| Principais players do mercado | Web search, SimilarWeb (se disponível) | Quem são os concorrentes diretos e indiretos |
| Modelo de negócio predominante | Sites dos concorrentes identificados | Como o mercado cobra, entrega e se posiciona |
| Notícias recentes do setor | Web search com filtro temporal (últimos 12 meses) | Eventos, regulações, tendências ou mudanças que afetam o mercado |

---

## Como os dados alimentam o restante do fluxo

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Tamanho + crescimento do setor   → R5 (oportunidade de posicionamento)
                                 → Skill 4.1 (priorização de segmentos)
Lista de concorrentes            → R4 (Reclame Aqui + reviews específicos)
                                 → R5 (análise de anúncios na Ad Library)
Modelo de negócio do setor       → R5 (diferenciação de precificação)
                                 → Skill 4.5 (argumento de valor)
Notícias e tendências            → R6 (contexto cultural atual)
                                 → Skill 4.3 (dores emergentes do mercado)
```

---

## Output — Seção R1 de RESEARCH_[publico].md

```markdown
## R1 — Contexto Setorial
*Pesquisa executada em: [data]*

### Visão Geral do Setor
- **Setor:** [nome] [D]
- **Tamanho estimado:** [dado + fonte] [D]
- **Trajetória:** crescendo / estagnado / encolhendo — [contexto] [D]
- **Modelo de negócio predominante:** [como o mercado cobra e entrega] [D]

### Players Identificados
| Empresa | Tipo (direto/indireto) | Observação |
|---|---|---|
| [nome] | [tipo] | [D] |

### Tendências e Notícias Recentes
- [evento/tendência] — [fonte + data aproximada] [D]
- [evento/tendência] [D]

### Hipóteses do Usuário (Pré-Pesquisa)
- [o que o usuário informou sobre o mercado] [U]
- Validado pela pesquisa: sim / não / parcialmente

### Implicações para o Mapeamento
- Oportunidade identificada: [D]
- Risco identificado: [D]
```

---

## Regra de Ouro desta Skill

> A lista de concorrentes gerada aqui não é detalhe — é o mapa que guia as pesquisas de Etapa 4 (Reclame Aqui e reviews) e Etapa 6 (anúncios). Um mau mapeamento de concorrentes na R1 prejudica todas as pesquisas qualitativas que vêm depois.
