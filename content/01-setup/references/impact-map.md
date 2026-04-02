# Mapa de Impacto — Dependências entre Context Files

> Quando o usuário atualiza um bloco, este mapa indica quais outros arquivos podem precisar de revisão. Consultar ANTES de finalizar qualquer atualização parcial.

---

## Como Usar

1. Identifique qual campo foi alterado
2. Consulte a tabela abaixo para ver quais arquivos são impactados
3. Para cada arquivo impactado, verifique se a mudança exige atualização
4. Sugira ao usuário: "Você mudou [X]. Isso pode afetar [Y] e [Z]. Quer que eu revise?"

---

## Mapa de Dependências

### COMPANY_PROFILE.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Nome da empresa | TODOS | Headers e referências ao nome | Atualizar nome em todos os arquivos |
| Site | VISUAL_IDENTITY.md | Tokens extraídos | Re-extrair cores/fontes do novo site |
| Redes sociais | PLATFORM_SPECS.md | Plataformas ativas | Adicionar/remover plataformas do spec |
| Redes sociais | CONTENT_PILLARS.md | Plataformas primárias | Revisar distribuição de pilares |
| Missão | CONTENT_PILLARS.md | Pilares temáticos | Verificar se pilares ainda refletem missão |
| Estágio | CONTENT_PILLARS.md | Mix de funil | Estágio de lançamento = mais BOFU |

### PRODUCT_CONTEXT.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Features | AUDIENCE_PROFILES.md | Dores que resolve | Revisar dores por persona |
| Features | CONTENT_PILLARS.md | Pilares e subtemas | Novo pilar se feature é significativa |
| Features | COMPETITOR_MAP.md | Diferenciais | Revisar gaps competitivos |
| Problema central | AUDIENCE_PROFILES.md | Dor principal por persona | Realinhar dores |
| Diferenciais | COMPETITOR_MAP.md | "O que podemos fazer melhor" | Atualizar oportunidades |
| Faixa de preço | AUDIENCE_PROFILES.md | Objeções | Objeção de preço pode mudar |

### BRAND_VOICE.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Espectros de tom | Nenhum diretamente | — | Impacto é nas skills de produção, não nos context files |
| Vocabulário | Nenhum diretamente | — | Impacto é nas skills de produção |
| Tratamento (você/tu) | AUDIENCE_PROFILES.md | "Fala como" | Verificar consistência |

### AUDIENCE_PROFILES.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Nova persona | CONTENT_PILLARS.md | Pilares e mix | Verificar se pilares cobrem a nova persona |
| Dor principal | CONTENT_PILLARS.md | "Dor que endereça" | Realinhar pilares com novas dores |
| Objeções | Nenhum diretamente | — | Impacto é no conteúdo BOFU |
| Nível de consciência | CONTENT_PILLARS.md | Mix TOFU/MOFU/BOFU | Se mais inconscientes → mais TOFU |
| Remover persona | CONTENT_PILLARS.md | Pilares órfãos | Verificar se algum pilar perdeu sua persona |

### COMPETITOR_MAP.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Novo concorrente | CONTENT_PILLARS.md | Gaps de conteúdo | Novo gap pode virar novo pilar |
| Gaps identificados | CONTENT_PILLARS.md | Exemplos de temas | Adicionar temas que exploram gaps |
| Pontos fortes do concorrente | PRODUCT_CONTEXT.md | Diferenciais | Verificar se diferenciais ainda são válidos |

### CONTENT_PILLARS.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Frequência | PLATFORM_SPECS.md | Horários e distribuição | Apenas informativo |
| Plataformas primárias | PLATFORM_SPECS.md | Plataformas ativas | Alinhar specs com plataformas escolhidas |
| Novo pilar | Nenhum | — | Impacto é na Ideation |
| Mix de funil | Nenhum | — | Impacto é no Calendar |

### VISUAL_IDENTITY.md → impacta:

| Campo alterado | Arquivo impactado | Campo afetado | Ação sugerida |
|---|---|---|---|
| Cor primária | Nenhum context file | — | Impacto direto nos slides do Carousel |
| Fonte | Nenhum context file | — | Impacto direto nos slides |
| Modo dark/light | Nenhum context file | — | Impacto direto nos slides |

---

## Regra de Cascata

**Nível de urgência:**

- 🔴 **Crítico** — Mudança invalida o arquivo dependente. Ex: remover persona que é referenciada em pilares.
- 🟡 **Recomendado** — Mudança pode desalinhar. Ex: nova feature que deveria gerar novo pilar.
- 🟢 **Opcional** — Mudança é cosmética. Ex: atualizar nome da empresa em headers.

Ao detectar impacto:
1. Listar todos os arquivos afetados com nível de urgência
2. Começar pelos 🔴 (críticos)
3. Sugerir mas não forçar os 🟡 (recomendados)
4. Mencionar mas não insistir nos 🟢 (opcionais)
