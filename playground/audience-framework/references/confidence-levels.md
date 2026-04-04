# Sistema de Classificação de Respostas — Níveis de Confiança

**Objetivo:** Definir como cada campo do `AUDIENCE_[nome].md` é marcado com seu grau de solidez, permitindo rastrear hipóteses vs. dados confirmados e orientar validação futura.

---

## Os 4 Níveis

### [H] — HIPÓTESE
> Suposição feita sem nenhuma validação direta com o mercado ou clientes.

**Quando usar:**
- Resposta baseada em intuição do fundador/gestor
- Estimativa sem nenhum dado de apoio
- "Acredito que...", "Imagino que...", "Deve ser..."

**Exemplo:**
```
- **Faixa etária:** [H] 28-42 anos
- **Medo profundo:** [H] Medo de ser percebida como incompetente pela liderança
```

**Ação recomendada:** Validar com entrevistas ou pesquisa antes de basear decisões importantes neste campo.

---

### [E] — ESTIMATIVA
> Baseado em experiência acumulada, conhecimento do mercado ou padrões observados indiretamente. Provável, mas não confirmado com essa persona específica.

**Quando usar:**
- Percepção de padrão em calls de vendas ou atendimento
- Analogia com mercado similar ou benchmarks do setor
- "Percebo que...", "Na minha experiência...", "Geralmente clientes como esse..."

**Exemplo:**
```
- **Cargo predominante:** [E] Gestora de marketing em PMEs
- **Canal principal:** [E] LinkedIn + grupos de WhatsApp
```

**Ação recomendada:** Validar com pelo menos 3-5 conversas diretas para elevar para [V].

---

### [V] — VALIDADO
> Confirmado por conversa direta com clientes, prospects ou pesquisa informal (entrevistas, formulários, observação).

**Quando usar:**
- "X clientes me disseram exatamente isso"
- Padrão observado em múltiplas conversas de vendas
- Feedback direto coletado sistematicamente

**Exemplo:**
```
- **Dor central:** [V] "Não tenho tempo para criar conteúdo de qualidade toda semana"
- **Gatilho de compra:** [V] Apresentação de pitch/proposta no trimestre chegando
```

**Ação recomendada:** Documentar a fonte (quantas pessoas, como foi validado) em nota interna.

---

### [D] — DADO
> Baseado em número, analytics, pesquisa formal ou experimento mensurável.

**Quando usar:**
- Dado de Google Analytics, CRM, pesquisa quantitativa
- A/B test com resultado
- Survey com amostra representativa
- "68% das sessões são de mulheres entre 28-42 anos"

**Exemplo:**
```
- **Faixa etária:** [D] 31-44 anos (Google Analytics, n=4.200)
- **Canal principal:** [D] Instagram (62% do tráfego de redes sociais, Q1 2026)
```

**Ação recomendada:** Registrar a fonte e data do dado. Dados ficam desatualizados — revisar a cada 6-12 meses.

---

## Como as Skills Perguntam sobre Confiança

As skills NÃO interrompem o fluxo para perguntar o nível de cada resposta. Em vez disso:

### Pergunta opcional ao final de cada bloco de respostas

Após coletar um conjunto de respostas em uma dimensão, a skill pode perguntar:

> "Antes de continuar: essas informações são hipóteses suas (H), estimativas por experiência (E), ou foram validadas com clientes (V/D)? Pode responder com uma letra ou pressionar Enter para marcar tudo como [H] por ora."

### Inferência automática por qualidade da resposta

A skill infere o nível sem perguntar quando a resposta tem pistas claras:

| Sinal na resposta | Inferência |
|-------------------|------------|
| "Acredito que...", "Imagino que...", vago/curto | [H] |
| "Na experiência...", "Geralmente...", baseado em padrão | [E] |
| "X clientes me disseram...", exemplo específico com pessoa real | [V] |
| Número, percentual, referência a ferramenta de analytics | [D] |

---

## Como Aparece nos Arquivos AUDIENCE

### Sintaxe padrão

O nível é prefixado **antes** do conteúdo do campo, entre colchetes:

```markdown
- **Campo:** [NÍVEL] conteúdo da resposta
```

### Exemplo de seção completa

```markdown
## Perfil Demográfico
- **Faixa etária:** [H] 28-42 anos
- **Gênero predominante:** [E] 70% mulheres
- **Cargo:** [V] Gestora de marketing em PMEs (10-100 funcionários)
- **Renda mensal:** [H] R$6.000 - R$12.000
- **Escolaridade:** [E] Superior completo, área de comunicação ou administração

## Dores
- **Dor central (linguagem literal):** [V] "Não tenho tempo para criar conteúdo de qualidade toda semana"
- **Dor profunda:** [E] Empresa perde visibilidade enquanto concorrentes aparecem consistentemente
- **Medo não declarado:** [H] Medo de ser percebida como incompetente pela liderança
- **Custo da inação:** [H] Perda gradual de posição e orçamento de marketing

## Desejos
- **Desejo declarado:** [V] "Quero ter um calendário editorial organizado"
- **Desejo real:** [E] Previsibilidade e controle sobre a estratégia de conteúdo
- **Identidade aspiracional:** [H] Ser a profissional que transforma o marketing da empresa
```

---

## Seção "Validação Pendente" no AUDIENCE file

Esta seção aparece **ao final de cada arquivo** `AUDIENCE_[nome].md`, gerada automaticamente pelas skills ao consolidar os campos [H] e [E].

### Template

```markdown
---

## Validação Pendente

Os campos abaixo foram marcados como hipótese [H] ou estimativa [E] e devem ser validados antes de decisões estratégicas importantes.

| Campo | Nível atual | Por que validar | Como validar |
|-------|-------------|-----------------|--------------|
| Faixa de renda | [H] | Impacta percepção de preço e copy de objeções | Perguntar em 5 entrevistas de cliente |
| Medo profundo | [H] | Fundamenta toda a comunicação emocional | Survey anônimo (Google Forms) |
| Canal principal | [E] | Define onde concentrar investimento de conteúdo | Analisar UTMs + A/B teste por canal |
| Gatilho de compra | [E] | Define timing e contexto dos anúncios | Perguntar em próximas 10 calls de vendas |

**Prioridade de validação:** Campos de Doras e Desejos têm maior impacto em copy. Dados demográficos têm maior impacto em segmentação de anúncios.
```

### Regras de geração automática

- Todo campo [H] entra automaticamente na tabela
- Campos [E] entram se forem categorias de alto impacto (doras, desejos, canal, gatilho)
- A coluna "Como validar" é preenchida com sugestão padrão por tipo de campo:
  - Dados demográficos → analytics ou pesquisa quantitativa
  - Dores/desejos → entrevistas qualitativas ou survey
  - Comportamento de compra → análise de CRM ou calls de vendas
  - Canais → UTMs e análise de tráfego

---

## Regras de Atualização

### Quando um campo muda de nível

Um campo passa de [H] → [E] → [V] → [D] à medida que mais evidências chegam. Para atualizar:

1. Trocar o prefixo no campo
2. Adicionar nota entre parênteses com a fonte: `[V] (3 entrevistas, Jan 2026)`
3. Remover da tabela "Validação Pendente" quando chegar em [V] ou [D]

### Quem pode atualizar

- Qualquer skill que receba novos dados explícitos do usuário
- O usuário diretamente, ao revisar o arquivo
- Futuros relatórios de performance que contradigam uma hipótese

### Vida útil dos dados

| Nível | Validade recomendada |
|-------|---------------------|
| [H] | Até primeira validação |
| [E] | 12 meses (mercados mudam) |
| [V] | 18 meses |
| [D] | 6 meses (dados ficam desatualizados) |

---

## Por que esse sistema existe

Um mapeamento de audiência sem classificação de confiança é perigoso: a IA (e o usuário) trata hipóteses como certezas, e decisões de conteúdo, produto e posicionamento são tomadas sobre base frágil.

Com os níveis [H][E][V][D]:
- O usuário sabe onde investir esforço de pesquisa
- A IA sabe quais campos usar com mais ou menos peso nas sugestões
- O documento se mantém honesto mesmo quando está 70% incompleto
- Futuras iterações (com analytics reais, relatórios de performance) podem atualizar campos específicos sem reescrever tudo
