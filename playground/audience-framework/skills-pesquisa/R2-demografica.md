# R2 — Pesquisa Demográfica

**Responsabilidade:** Substituir estimativas do usuário por dados reais de renda, escolaridade, composição familiar e comportamento digital para a faixa etária + região confirmados. O usuário descreve quem é seu público em termos aproximados — a R2 transforma essas aproximações em perfis estatisticamente fundamentados.

**Quando aciona:** Durante a Skill 4.2 (Persona Builder), após o usuário confirmar faixa etária e região (P2.1 e P2.4). Roda em paralelo com R3.

**Input necessário:**
- Faixa etária confirmada (P2.1)
- Região de atuação (P2.4)
- Classe social estimada (P2.3 ou inferida do pricing do produto)
- Contexto B2B ou B2C

> **Prioridade de dados:** Se o usuário tiver Google Analytics, Instagram Insights, dados de CRM ou qualquer analytics proprietário, esses dados são MAIS VALIOSOS do que qualquer pesquisa externa. Sempre perguntar antes de pesquisar:
> "Você tem acesso a analytics da sua audiência? (Google Analytics, Instagram Insights, dados do CRM?) Se sim, me passe — são mais precisos que qualquer dado externo para o seu caso."

---

## O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Dados socioeconômicos por faixa/região | IBGE (PNAD, POF) | Renda média, escolaridade, estrutura familiar da faixa informada |
| Composição de classe por região | IBGE, FGV Social | Distribuição de classes no mercado-alvo |
| Hábitos digitais por faixa etária | DataReportal, We Are Social (relatório anual) | Redes usadas, tempo de tela, formatos consumidos, horários |
| Comportamento de consumo por perfil | SEBRAE, pesquisas setoriais | Como compram, quais fatores influenciam, canais preferidos |

---

## Como os dados alimentam o restante do fluxo

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Renda média por faixa/região     → R6 (classe social de origem, valores)
                                 → Skill 4.5: percepção de preço calibrada
Hábitos digitais confirmados     → Skill 4.2: P8.4 (canais não-sociais)
                                 → Skill 4.2: P8.6 (redes sociais)
                                 → Skill 4.5: canal prioritário de comunicação
Escolaridade + formação          → Skill 4.2: tom de linguagem
                                 → Skill 4.2: P8.1 (vocabulário esperado)
Comportamento de consumo         → Skill 4.3: gatilho de compra (P7.1)
                                 → Skill 4.4: tipo 2-4 dos 9 públicos
```

---

## Output — Seção R2 de RESEARCH_[publico].md

```markdown
## R2 — Perfil Demográfico com Dados
*Pesquisa executada em: [data]*

### Dados Socioeconômicos (faixa confirmada: [X] anos, [região])
- **Renda média familiar:** [dado] — fonte: IBGE [ano] [D]
- **Renda individual estimada:** [dado] [D]
- **Escolaridade predominante:** [dado] [D]
- **Estrutura familiar típica:** [dado] [D]
- **Classe social predominante:** [A/B/C] — [% da faixa] [D]

### Hábitos Digitais Confirmados
- **Tempo médio de tela por dia:** [dado] [D]
- **Plataformas mais usadas (ranking):** [D]
- **Formatos de conteúdo mais consumidos:** [D]
- **Horários de pico de acesso:** [D]

### Comportamento de Consumo
- **Canal de pesquisa preferido antes de comprar:** [D]
- **Fatores de decisão mais citados:** [D]
- **Ticket médio de compras planejadas:** [D]

### Analytics do Usuário (se fornecido)
- **Fonte:** [GA4 / Instagram Insights / CRM] [U]
- **Split demográfico real:** [U]
- **Divergências com dados externos:** [U vs D — se houver]

### Divergências da Estimativa Inicial
O usuário estimou: [o que disse] [U]
Dado confirma / contradiz / refina: [análise]
```

---

## Regra de Ouro desta Skill

> Renda média do IBGE para uma faixa etária e região específica é mais precisa do que qualquer intuição do dono do negócio — a menos que o dono tenha analytics próprio. Sempre verificar se o dado externo confirma ou contradiz o que o usuário acredita sobre seu público.
