# Etapa 5 — Consolidação & Diagnóstico

> Protocolo: `references/EXECUTION_PROTOCOL.md`
> Tipo: **Análise** | Verificações: **5** | Salva em: **Seção 5**

---

## Importância

Cruza dados das 4 etapas anteriores para gerar diagnóstico geral, identificar gaps consolidados e recomendar próximos passos concretos.

**Insights gerados:**
- Clareza de posicionamento geral (cruzando E1 + E3)
- Coerência geral (missão ↔ diferencial ↔ tom ↔ canais)
- Gaps consolidados (tudo que ficou incompleto)
- Top 3 oportunidades imediatas

---

## FASE 1 — Carregar Contexto

```
Ler: COMPANY_PROFILE.md → TODAS as seções (1 a 4) + TODOS os Insights
```

Para cada campo, registrar valor + classificação (`<!-- status: xxx -->`).

Montar 3 listas internas:
- **Validados (✅):** dados que são fatos
- **Hipóteses precisas (🔶):** dados que provavelmente estão certos
- **Hipóteses vagas (🔸):** dados incertos + todos os "a definir" / "Em construção" / "Não definido"

---

## FASE 2 — Definir Modo de Entrada

Tipo Análise — sem modo de entrada. Informar:

```
"Vou cruzar os dados das 4 etapas para gerar o diagnóstico final da [Nome].
Vou apresentar 5 verificações e as conclusões para você validar. Começar?"
```

---

## FASE 3 — Verificações de Cruzamento

---

### Verificação 1 de 5 — Clareza de posicionamento geral

**Campos a cruzar:**

| Campo | Seção | Usar valor e status |
|-------|-------|---------------------|
| Clareza de posicionamento | Insight E1 | |
| Clareza de posicionamento verbal | Insight E3 | |
| Setor / Nicho | Seção 1 | |
| Missão | Seção 3 | |
| Slogan | Seção 1 | |

**Lógica de cruzamento:**
- Insight E1 = Alta + Insight E3 = Alta → Clareza geral = Alta
- Um dos dois = Média ou Baixa → Clareza geral = Média
- Ambos = Baixa → Clareza geral = Baixa
- Se Setor é ✅ + Missão é ✅ + Slogan existe → reforça Alta
- Se Setor é 🔸 OU Missão é "Em construção" → puxar para Média/Baixa

**Output:** "Clareza de posicionamento geral: [Alta/Média/Baixa]. [Justificativa em 1 frase]."

**Classificação:**
- ✅ se todos os dados cruzados são ✅
- 🔶 se algum é 🔶
- 🔸 se algum é 🔸 ou "Em construção"

---

### Verificação 2 de 5 — Coerência missão-diferencial

**Campos a cruzar:**

| Campo | Seção | |
|-------|-------|--|
| Missão | Seção 3 | |
| Diferencial | Seção 2 | |
| Origem / motivação | Seção 1 | |

**Lógica de cruzamento:**
- Missão menciona ou implica o mesmo problema que a Origem? → Se sim: alinhamento forte.
- Diferencial reforça a Missão? → Se sim: coerência alta.
- Diferencial contradiz a Missão? → Gap: "Missão fala de [X] mas diferencial é [Y]".
- Se Missão = "Em construção" → "Não há missão para cruzar. Recomendação: definir missão baseada na origem + diferencial."

**Output:** "[Coerente/Tensão/Gap]. [Descrição em 1-2 frases]."

**Classificação:**
- ✅ se alinhamento claro entre os 3 campos
- 🔶 se alinhamento parcial ou missão em construção
- 🔸 se contradição clara

---

### Verificação 3 de 5 — Coerência tom-canais

**Campos a cruzar:**

| Campo | Seção | |
|-------|-------|--|
| Tom de comunicação | Seção 3 | |
| Canais ativos | Seção 4 | |
| Consistência tom vs. prática | Insight E4 | |
| Modelo de negócio | Seção 2 | |

**Lógica de cruzamento:**
- Tom declarado funciona nos canais ativos?
  - Tom "técnico" + LinkedIn ativo → coerente
  - Tom "descontraído" + só LinkedIn → tensão (pode funcionar, mas vale considerar Instagram/TikTok)
  - Tom "provocador" + nenhum canal ativo → gap
- Se Insight E4 apontou inconsistência → reforçar aqui
- Se Modelo é B2B e canais são só B2C (Instagram sem LinkedIn) → tensão estratégica

**Output:** "[Coerente/Tensão/Gap estratégico]. [Descrição]."

**Classificação:**
- ✅ se tom + canais + modelo alinham
- 🔶 se tensão menor
- 🔸 se gap estratégico claro

---

### Verificação 4 de 5 — Coerência estágio-funil-canais

**Campos a cruzar:**

| Campo | Seção | |
|-------|-------|--|
| Estágio do negócio | Seção 2 | |
| Prioridade de funil | Insight E2 | |
| Canal principal | Seção 4 | |
| Canais ativos | Seção 4 | |
| Dependência de canal | Insight E4 | |

**Lógica de cruzamento:**
- Prioridade é TOFU e canais são de alcance (Instagram, TikTok, SEO, Blog) → alinhado
- Prioridade é TOFU mas só tem WhatsApp → gap de canal
- Prioridade é Retenção e tem newsletter/comunidade → alinhado
- Prioridade é Retenção e não tem e-mail nem comunidade → gap
- Se Dependência = Offline → gap estratégico: "Empresa depende de indicação. Prioridade: construir presença digital."

**Output:** "[Alinhado/Parcial/Gap]. [Descrição + recomendação se gap]."

**Classificação:**
- ✅ se canais servem a prioridade de funil
- 🔶 se parcialmente alinhado
- 🔸 se desalinhamento claro

---

### Verificação 5 de 5 — Gaps consolidados

**Campos a cruzar:** TODOS os campos de TODAS as seções.

**Lógica:**
```
Listar tudo que está como:
- "a definir"
- "Em construção"
- "Não definido"
- "Sem site"
- Status hipotese-vaga
- Status Inativo (canais)

Categorizar cada gap:
- Crítico: impacta diretamente a estratégia de conteúdo
  Ex: setor vago, sem missão, sem canal ativo
- Importante: útil mas não bloqueante
  Ex: valores em construção, audiência desconhecida
- Menor: bônus
  Ex: sem slogan, sem referências
```

**Output:** Lista categorizada de gaps com prioridade.

**Classificação:**
- ✅ se 0-2 gaps menores
- 🔶 se 1-3 gaps importantes
- 🔸 se qualquer gap crítico

---

## FASE 4 — Análise de Qualidade

### Campos por prioridade

| Prioridade | Verificações |
|------------|-------------|
| **Crítico** | V5 (Gaps consolidados) |
| **Importante** | V1 (Clareza), V4 (Estágio-funil-canais) |
| **Desejável** | V2 (Missão-diferencial), V3 (Tom-canais) |

### Nível de confiança geral

```
Combinar:
- Nível de confiança de cada etapa anterior (E1 a E4)
- Resultado das 5 verificações
- Se 3+ etapas = Alto e 3+ verificações = ✅ → Alto
- Se mix → Médio
- Se alguma etapa = Baixo ou V5 = 🔸 → Baixo
```

---

## FASE 5 — Resumo e Decisão

Apresentar resumo executivo (diferente das etapas anteriores — mais narrativo):

```
## Diagnóstico Final — [Nome da Empresa]

### Resumo executivo
[5-7 frases narrativas cobrindo: quem é a empresa, como funciona,
como se posiciona, onde está digitalmente, e o estado geral]

### Verificações

[✅/🔶/🔸] Clareza de posicionamento: [resultado]
[✅/🔶/🔸] Coerência missão-diferencial: [resultado]
[✅/🔶/🔸] Coerência tom-canais: [resultado]
[✅/🔶/🔸] Alinhamento estágio-funil-canais: [resultado]
[✅/🔶/🔸] Gaps consolidados: [N gaps — X críticos, Y importantes, Z menores]

Confiança geral: [Alto/Médio/Baixo]

### Próximos passos recomendados
1. [Ação mais impactante — baseada no maior gap ou oportunidade]
2. [Segunda ação — baseada em oportunidade de canal ou editorial]
3. [Terceira ação — baseada em gap de posicionamento]

---
(A) Aprovar diagnóstico e salvar
(B) Ajustar verificação ou conclusão específica
(C) Revisar etapas anteriores antes de finalizar
```

---

## FASE 6 — Salvar e Gerar Handoff para Bloco 2

Atualizar Seção 5 do COMPANY_PROFILE.md:

- **Clareza de posicionamento geral:** [resultado da V1]
- **Maturidade digital geral:** [Insight E4 direto]
- **Coerência geral:** [síntese de V2 + V3 + V4]
- **Gaps identificados:** [lista de V5]
- **Oportunidades imediatas:** [top 3 de impacto]
- **Próximos Passos:** [3 recomendações]

Atualizar cabeçalho:
```
<!-- Última atualização: [data] -->
<!-- Status: completo -->
```

**Se `perfil: startup` em SETUP_STATE.md:** adicionar ao topo do COMPANY_PROFILE.md:
```markdown
> **Status:** 🔸 Perfil provisório — revalidar após 30 dias
> **Confiança geral:** [X]% validado · [Y]% hipótese · [Z]% estimativa
```

E aplicar legenda 🔴/🟡/🟢 no diagnóstico (ver `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md`, seção 5).

Confirmar:
> "COMPANY_PROFILE.md da [Nome] finalizado e salvo. O perfil está completo."

### Handoff narrado para Bloco 2 — Product Context

Antes de passar para o próximo bloco, apresentar uma transição narrada com tripla **Síntese + Pré-hipóteses + Próximo passo** (formato definido em `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md`, seção 4):

```
## Transição para o Bloco 2

**Síntese do Bloco 1:**
[1 frase juntando: Nome + Setor + B2B/B2C + Estágio + Diferencial principal]
Ex: "A [Nome] é [modelo] no setor [setor], em [estágio], com diferencial '[diferencial]'."

**Pré-hipóteses para Produto (a validar no próximo bloco):**
(1) [Problema central provável — inferir de Origem + Diferencial]
(2) [Tipo de produto — SaaS / Físico / Serviço / etc., inferir de Setor + Modelo]
(3) [Faixa de ticket provável — se não coletada, sugerir a partir de perfil detectado]

**Próximo passo:**
Bloco 2 — detalhar features, problema central, diferenciais e anti-persona do produto. Vou usar o diferencial e o modelo registrados aqui como ponto de partida.

Pronto para seguir?
```

**Exemplo concreto (FluxoPro, startup SaaS B2B em validação):**

> **Síntese do Bloco 1:**
> FluxoPro é SaaS B2B no setor de CRM, em validação, com diferencial "simplicidade para times pequenos".
>
> **Pré-hipóteses para Produto:**
> (1) Resolve fricção de follow-up manual em times comerciais pequenos.
> (2) Tipo: SaaS subscription mensal.
> (3) Ticket provável: R$100-300/mês por usuário (PMEs não pagam R$500+).
>
> **Próximo passo:**
> Bloco 2 — detalhar features, problema central e anti-persona. Vou partir de "CRM simplificado para times de 2-10 vendedores".

### Encerramento

Se executada pelo orquestrador → informar conclusão e seguir para Bloco 2.
Se executada diretamente:
> "Próximos blocos disponíveis: Persona, Produto, ou Brand Voice. Qual quer fazer?"
