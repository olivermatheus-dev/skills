# Audience Framework — Implementation Playbook

**Objetivo:** Guia executável para criar todas as skills do sistema de mapeamento de audiência em `setup/04-audience-profiles/`, usando o skill-creator da Anthropic em cada etapa.

**Tempo estimado por etapa:** 20-40 minutos (skill-creator + revisão + ajuste)

---

## Índice

- [Parte 0 — Setup Inicial](#parte-0--setup-inicial)
- [Parte 1 — Template Reutilizável](#parte-1--template-reutilizável)
- [Parte 2 — Reference Files](#parte-2--reference-files-criar-antes-das-skills)
- [Fase 3.1 — Skill 4.1: Target Audiences](#fase-31--skill-41-target-audiences)
- [Fase 3.2 — Skill 4.2: Persona Builder](#fase-32--skill-42-persona-builder)
- [Fase 3.3 — Skill 4.3: Pain & Desire Mapper](#fase-33--skill-43-pain--desire-mapper)
- [Fase 3.4 — Skill 4.4: Nine Audiences Mapper](#fase-34--skill-44-nine-audiences-mapper)
- [Fase 3.5 — Skill 4.5: Consciousness Mapping](#fase-35--skill-45-consciousness-mapping)
- [Parte 4 — Orquestrador SKILL.md](#parte-4--orquestrador-skillmd)
- [Parte 5 — Validação Final](#parte-5--validação-final)

---

## Parte 0 — Setup Inicial

### Criar a estrutura de pastas (executar uma vez)

```bash
mkdir -p setup/04-audience-profiles/skills
mkdir -p setup/04-audience-profiles/references
```

### Arquitetura final esperada

```
setup/04-audience-profiles/
├── SKILL.md                           ← Orquestrador (criado por ÚLTIMO, Parte 4)
├── skills/
│   ├── 4.1-target-audiences.md        ← Fase 3.1
│   ├── 4.2-persona-builder.md         ← Fase 3.2
│   ├── 4.3-pain-desire-mapper.md      ← Fase 3.3
│   ├── 4.4-nine-audiences.md          ← Fase 3.4
│   └── 4.5-consciousness-mapping.md   ← Fase 3.5
└── references/
    ├── output-template.md             ← Parte 2.1 (PRIMEIRO a criar)
    ├── persona-questions.md           ← Parte 2.2
    ├── nine-audiences-guide.md        ← Parte 2.3
    ├── jtbd-frameworks.md             ← Parte 2.4
    └── research-protocols.md          ← Parte 2.5
```

### Sequência obrigatória

| # | Entregável | Depende de | Seção |
|---|-----------|------------|-------|
| 1 | `references/output-template.md` | Nada | Parte 2.1 |
| 2 | `references/persona-questions.md` | Nada | Parte 2.2 |
| 3 | `references/nine-audiences-guide.md` | Nada | Parte 2.3 |
| 4 | `references/jtbd-frameworks.md` | Nada | Parte 2.4 |
| 5 | `references/research-protocols.md` | Nada | Parte 2.5 |
| 6 | `skills/4.1-target-audiences.md` | References prontas | Fase 3.1 |
| 7 | `skills/4.2-persona-builder.md` | 4.1 criada | Fase 3.2 |
| 8 | `skills/4.3-pain-desire-mapper.md` | 4.2 criada | Fase 3.3 |
| 9 | `skills/4.4-nine-audiences.md` | 4.3 criada | Fase 3.4 |
| 10 | `skills/4.5-consciousness-mapping.md` | 4.4 criada | Fase 3.5 |
| 11 | `SKILL.md` (orquestrador) | Todas as sub-skills | Parte 4 |

---

## Parte 1 — Template Reutilizável

Para cada sub-skill (Fases 3.1-3.5), o ciclo é sempre o mesmo:

---

### Passo 1 — GATHER (preparar contexto)

Antes de rodar o skill-creator, abra os arquivos listados em cada fase e deixe o conteúdo acessível.

Arquivos base que sempre estarão disponíveis:
- `audience-framework/02-FLUXO-PROPOSTO.md` — procedimento detalhado por skill
- `audience-framework/03-PERGUNTAS.md` — banco completo de perguntas por dimensão
- `audience-framework/01-PESQUISA.md` — frameworks teóricos
- `audience-framework/skills-pesquisa/` — protocolos R1-R6

---

### Passo 2 — PROMPT (rodar skill-creator)

1. Ative o skill-creator: diga `quero criar uma nova skill` ou `/skill-creator`
2. Quando o skill-creator pedir contexto, cole o **prompt pré-formatado** da fase correspondente
3. Responda as perguntas de clarificação que o skill-creator fizer

**Estrutura do prompt pré-formatado** (usada em cada fase):

```
NOME DA SKILL: [nome]

PAPEL: [o que a skill faz em 2-3 frases]

QUANDO ACIONAR: [frases literais do usuário]

INPUTS (arquivos de contexto que a skill lê):
[lista]

PROCEDIMENTO DETALHADO:
[passos numerados]

PERGUNTAS QUE A SKILL FAZ AO USUÁRIO:
[lista por dimensão]

OUTPUT:
[arquivo gerado + seções preenchidas]

COMPORTAMENTOS ESPECIAIS:
[regras, bifurcações, triggers de pesquisa]
```

---

### Passo 3 — REVIEW (revisar o rascunho)

Após skill-creator gerar o rascunho, verificar:

**Checklist universal (8 itens):**

- [ ] O nome está em kebab-case e começa com `setup-audience-`
- [ ] A `description` menciona frases literais que o usuário diria (não só o nome técnico)
- [ ] O procedimento tem passos numerados, não parágrafos vagos
- [ ] Context files estão listados com três grupos: obrigatórios / opcionais / NÃO carregar
- [ ] O comportamento de auto-sugestão está explícito (skill gera rascunho antes de perguntar)
- [ ] O output tem referência explícita ao `references/output-template.md`
- [ ] O bloco de atualização do `WORKFLOW_STATE.md` está no final
- [ ] Todos os triggers de pesquisa (R1-R6) estão descritos com o texto exato da oferta

---

### Passo 4 — PLACE (posicionar o arquivo)

O skill-creator cria um `SKILL.md` com frontmatter + corpo. Para as sub-skills:

1. Copie **apenas o corpo** do SKILL.md gerado (tudo abaixo do frontmatter `---`)
2. Salve em `setup/04-audience-profiles/skills/[número]-[nome].md`
3. Se o skill-creator criou `references/` para a sub-skill: avalie se move para a pasta `references/` compartilhada ou descarta (as references da sub-skill geralmente já estão cobertas pelos arquivos de `references/` da Parte 2)

Para o orquestrador (Parte 4): manter o `SKILL.md` completo com frontmatter na raiz de `setup/04-audience-profiles/SKILL.md`.

---

## Parte 2 — Reference Files (criar antes das skills)

Estes arquivos são criados **diretamente** (sem skill-creator) a partir do conteúdo existente em `audience-framework/`.

---

### 2.1 — `references/output-template.md`

**Por que criar primeiro:** Define o contrato de output. Todas as sub-skills referenciam este template.

**Fonte:** `audience-framework/02-FLUXO-PROPOSTO.md` — seção "Estrutura Final do Arquivo de Output" (linhas 310-347)

**Conteúdo mínimo:** O template completo do `AUDIENCE_[nome].md` com as 5 seções e campos comentados. Adicione comentários explicando o que cada campo significa para o LLM que vai ler o arquivo.

**Caminho final:** `setup/04-audience-profiles/references/output-template.md`

**Como criar:** Copie a estrutura do `02-FLUXO-PROPOSTO.md` e expanda cada seção com comentários de uso:

```markdown
# [Nome do Público-Alvo]
<!-- Nome descritivo do segmento, não da persona. Ex: "Gestores de Marketing em PMEs" -->

## 1. Grupo e Segmentação
<!-- Preenchido por Skill 4.1 -->
- **Segmento:** [descrição do grupo amplo]
- **Tipo:** B2B / B2C
- **B2B — Decisor:** [quem aprova a compra] / **Usuário:** [quem usa]
- **Prioridade estratégica:** Alta / Média / Baixa
- **Por que esse grupo:** [justificativa de oportunidade]

## 2. Persona: [Nome Arquétipo]
<!-- Preenchido por Skill 4.2 -->
[... expandir todos os campos do Skill 4.2 ...]

## 3. Dores, Desejos e Motivações
<!-- Preenchido por Skill 4.3 -->
[... expandir todos os campos do Skill 4.3 ...]

## 4. Os 9 Tipos de Público
<!-- Preenchido por Skill 4.4 -->
[... expandir todos os campos do Skill 4.4 ...]

## 5. Nível de Consciência e Conteúdo
<!-- Preenchido por Skill 4.5 -->
[... expandir todos os campos do Skill 4.5 ...]

---
## Síntese Executiva
<!-- Auto-gerada por Skill 4.5 — validar em bloco único -->
[10 campos da Dimensão 11]
```

---

### 2.2 — `references/persona-questions.md`

**Fonte:** `audience-framework/03-PERGUNTAS.md` — dimensões D0 a D3 + D7 parcial + D8

**Conteúdo:** Banco de perguntas organizado por dimensão para as skills 4.1 e 4.2. Manter o formato original com: pergunta literal, por que perguntar, sugestão automática.

**Caminho final:** `setup/04-audience-profiles/references/persona-questions.md`

**Como criar:** Copie as seções D0, D1, D2, D3, D7 (P7.1-P7.5) e D8 do arquivo `03-PERGUNTAS.md`.

---

### 2.3 — `references/nine-audiences-guide.md`

**Fonte:** `audience-framework/01-PESQUISA.md` — seção "Os 9 Tipos de Público — Conrado Adolpho" (início do arquivo)

**Conteúdo:** O framework completo dos 9 tipos com: definição, mentalidade, time responsável, estratégia (objetivo, canais, mensagem, gatilho de avanço, erro comum).

**Caminho final:** `setup/04-audience-profiles/references/nine-audiences-guide.md`

**Como criar:** Copie a seção completa de `01-PESQUISA.md` sobre os 9 tipos.

---

### 2.4 — `references/jtbd-frameworks.md`

**Fonte:** `audience-framework/01-PESQUISA.md` — seção sobre Clayton Christensen e Jobs-to-Be-Done

**Conteúdo:** Framework JTBD com: tipos de job (funcional/emocional/social), situação de trigger, como formular os jobs, exemplos por setor.

**Caminho final:** `setup/04-audience-profiles/references/jtbd-frameworks.md`

**Como criar:** Copie a seção de JTBD de `01-PESQUISA.md`.

---

### 2.5 — `references/research-protocols.md`

**Fonte:** `audience-framework/skills-pesquisa/R1-R6.md` (6 arquivos)

**Conteúdo:** Protocolos R1-R6 consolidados em um único arquivo. Cada protocolo com: responsabilidade, quando aciona, fontes de dados, o que pesquisar, como gravar no `RESEARCH_[publico].md`.

**Caminho final:** `setup/04-audience-profiles/references/research-protocols.md`

**Como criar:** Copie e concatene os 6 arquivos de `audience-framework/skills-pesquisa/` com cabeçalhos de seção.

---

## Fase 3.1 — Skill 4.1: Target Audiences

**O que esta skill faz:** Identifica os grupos amplos de público-alvo a partir do contexto do produto. Não é uma persona — é um segmento. Distingue B2B de B2C e detecta quando o decisor ≠ usuário final.

**Output que preenche:** Seção 1 (Grupo e Segmentação) de cada `AUDIENCE_[nome].md` + lista estruturada que alimenta a 4.2.

---

### GATHER — Arquivos a consultar

- `audience-framework/02-FLUXO-PROPOSTO.md` — linhas 57-91 (Skill 4.1 completo)
- `audience-framework/03-PERGUNTAS.md` — Dimensão 0 (P0.1-P0.3) e Dimensão 1 (P1.1-P1.5)

---

### PROMPT — Cole no skill-creator

```
NOME DA SKILL: setup-audience-target-identifier

PAPEL:
Identifica os grupos amplos de público-alvo para uma empresa. Lê o PRODUCT_CONTEXT.md 
e COMPANY_PROFILE.md, gera sugestões automáticas de 2-4 segmentos e conduz o usuário 
para confirmá-los e detalhar cada um. Distingue B2B de B2C e detecta quando decisor 
de compra é diferente do usuário final.

QUANDO ACIONAR:
- "quero mapear meu público-alvo"
- "vamos definir as personas"
- "quero criar o perfil de audiência"
- "preciso identificar meu público"
- É chamada internamente pelo orquestrador setup-audience-profiles

INPUTS:
Obrigatórios:
- PRODUCT_CONTEXT.md — problema central, diferenciadores, pricing, modelo de negócio
- COMPANY_PROFILE.md — stage da empresa, missão, valores

Não carregar:
- AUDIENCE_*.md (ainda não existem nesta fase)
- CONTENT_PILLARS.md (fora do escopo)

PROCEDIMENTO:
1. Ler PRODUCT_CONTEXT.md e COMPANY_PROFILE.md antes de qualquer pergunta
2. Verificar se PRODUCT_CONTEXT.md já tem anti-persona documentada (não repetir se já existe)
3. OFERECER PESQUISA R1: "Posso pesquisar o contexto do seu setor agora — tamanho de 
   mercado, principais concorrentes e tendências recentes. Isso melhora a qualidade das 
   sugestões ao longo de todo o mapeamento. Quer que eu faça isso agora? (recomendado)"
   - Se sim: executar R1 (ver references/research-protocols.md) e gravar seção R1 em 
     RESEARCH_[publico].md em companies/[empresa]/audiences/
   - Se não: continuar sem, registrando que R1 foi pulada
4. Com base no produto, gerar automaticamente 2-4 grupos prováveis de público-alvo. 
   Regras de sugestão automática:
   - Produto SaaS com pricing > R$500/mês → sugerir gestores de mid-market
   - Produto de produtividade → sugerir empreendedores solo e pequenas equipes
   - Modelo one-time com problema específico → sugerir público muito nichado
5. Apresentar sugestões e perguntar: "Estes grupos fazem sentido? Há algum que eu não 
   incluí ou algum que você removeria?"
6. Para cada grupo confirmado, coletar (em sequência, não em lista):
   P0.1 — "Existe algum perfil de cliente que, mesmo pagando caro, você preferiria não 
           ter? Isso ajuda a definir os limites do público ideal."
   P0.2 — "Tem alguma 'verdade universal' do seu mercado que você discorda ativamente?"
   P1.1 — "Se você pudesse escolher o cliente mais fácil de atender E o mais lucrativo, 
           quem seria?"
   P1.2 — "Quem decide a compra? É a mesma pessoa que vai usar o produto?"
   P1.3 — "O que seus melhores clientes têm em comum?"
   P1.4 — "Existe algum perfil que gera mais problemas ou churn? Quem você preferiria 
           não ter?"
   P1.5 — "Se você dividisse seus clientes em grupos, quais identificaria?"
7. BIFURCAÇÃO B2B: Se decisor ≠ usuário final, perguntar: "Para esse público B2B, prefere 
   mapear as duas perspectivas separadamente (economic buyer + technical buyer) ou focar 
   em uma? Se houver diferença significativa de cargo e dores, o ideal é criar dois perfis."
8. Para cada grupo, definir: nome descritivo (segmento, não persona), B2B/B2C, tamanho 
   de mercado estimado (nicho/amplo), por que tem chance maior de comprar, 
   característica mais definidora
9. Ordenar públicos por prioridade estratégica e justificar
10. Gerar sumário estruturado dos públicos para passar à Skill 4.2

OUTPUT:
- Arquivo: não cria AUDIENCE_*.md ainda — produz um SUMÁRIO DE PÚBLICOS no WORKFLOW_STATE
- Conteúdo do sumário: nome de cada segmento + B2B/B2C + prioridade + contexto B2B se aplicável
- Template de referência: references/output-template.md (seção 1)

COMPORTAMENTOS ESPECIAIS:
- AUTO-SUGESTÃO OBRIGATÓRIA: A skill NUNCA começa perguntando — sempre gera 2-4 sugestões 
  primeiro baseadas no PRODUCT_CONTEXT
- VERIFICAR ANTES DE PERGUNTAR: P0.1 e P0.3 — verificar se já existe anti-persona ou 
  arquétipo documentado nos arquivos de contexto antes de perguntar
- NÃO CRIAR PERSONAS: O resultado desta skill são segmentos/grupos, não personas individuais. 
  Exemplo correto: "Gestores de marketing em PMEs". Errado: "Maria, 35 anos..."
- MÁXIMO 4 PÚBLICOS: Recomendar no máximo 4 para o setup inicial. Se o usuário quiser mais, 
  alertar que o processo será mais longo
- ATUALIZAR WORKFLOW_STATE ao final com: lista de públicos mapeados, B2B flags, R1 status
```

---

### REVIEW — Checklist específico

Além do checklist universal, verificar para esta skill:

- [ ] A skill gera sugestões automáticas ANTES de fazer qualquer pergunta ao usuário
- [ ] O trigger de pesquisa R1 tem o texto exato da oferta (com "recomendado" explícito)
- [ ] A bifurcação B2B (decisor ≠ usuário) está documentada com a pergunta exata
- [ ] O output é claramente um SUMÁRIO DE PÚBLICOS, não personas
- [ ] A skill sabe a diferença entre público-alvo (segmento) e persona (indivíduo fictício)
- [ ] Limite de 4 públicos está documentado com o alerta para o usuário

---

### PLACE

```
Destino: setup/04-audience-profiles/skills/4.1-target-audiences.md
Copiar: corpo do SKILL.md gerado (abaixo do frontmatter)
References criadas pelo skill-creator: avaliar se já cobertas por references/ da Parte 2
```

---

## Fase 3.2 — Skill 4.2: Persona Builder

**O que esta skill faz:** Cria a persona detalhada para cada segmento identificado na 4.1. Usa auto-geração: lê os arquivos de contexto, gera um rascunho com ~80% dos campos preenchidos e pede validação por blocos (não 34 perguntas seguidas).

**Output que preenche:** Seção 2 (Persona) de cada `AUDIENCE_[nome].md`, incluindo: perfil base, contexto de vida/trabalho, dados socioeconômicos, 5 Rings of Buying Insight, perfil psicográfico.

---

### GATHER — Arquivos a consultar

- `audience-framework/02-FLUXO-PROPOSTO.md` — linhas 93-156 (Skill 4.2 completo)
- `audience-framework/03-PERGUNTAS.md` — Dimensão 2 (P2.1-P2.10), Dimensão 3 (P3.1-P3.14), D7 (P7.1-P7.5), Dimensão 8 (P8.1-P8.7)
- `audience-framework/references/generations-guide.md` — comportamento por geração

---

### PROMPT — Cole no skill-creator

```
NOME DA SKILL: setup-audience-persona-builder

PAPEL:
Cria personas detalhadas para cada segmento de público identificado na Skill 4.1. 
Opera em modo de AUTO-GERAÇÃO: lê os arquivos de contexto, produz um rascunho 
completo com ~80% dos campos preenchidos por inferência e pede validação em blocos 
— o usuário corrige e complementa, não cria do zero. Integra pesquisas R2 
(demográfica), R3 (comportamento de busca) e R6 (inferência psicográfica).

QUANDO ACIONAR:
- "criar persona"
- "construir persona para [público]"
- "detalhar o público [nome]"
- Chamada internamente após Skill 4.1 pelo orquestrador

INPUTS:
Obrigatórios:
- Output da Skill 4.1 (sumário de públicos do WORKFLOW_STATE)
- PRODUCT_CONTEXT.md — para inferir cargo, renda, dores por pricing
- BRAND_VOICE.md — para calibrar como a persona fala e o que ressoa

Opcionais:
- COMPANY_PROFILE.md — stage da empresa afeta complexidade das personas

Não carregar:
- AUDIENCE_*.md de outros públicos (evitar contaminação entre personas)

PROCEDIMENTO:
Para cada público-alvo (um de cada vez):

1. Ler contexto completo (PRODUCT_CONTEXT + BRAND_VOICE + output da 4.1)
2. GERAR RASCUNHO COMPLETO da persona por inferência antes de qualquer pergunta:
   - Nomear com arquétipo: não "João" genérico, mas "Carla, a gestora sobrecarregada"
   - Inferir: faixa etária (baseado no produto), cargo provável, tamanho de empresa, 
     localização mais provável, escolaridade, padrão de consumo compatível com o pricing
   - Pré-preencher todos os campos com [E] Estimativa
3. PERGUNTAR ANTES DE PESQUISAR (R2): "Você tem Google Analytics, Instagram Insights 
   ou dados do CRM com informações sobre sua audiência? Me passe — são mais precisos 
   que qualquer pesquisa externa."
   - Se forneceu dados internos → processar como [U] na seção R2
4. TRIGGERS DE PESQUISA (após confirmar faixa etária + região):
   - Executar R2 (demográfica) + R3 (comportamento de busca) em paralelo
   - Após R2 confirmada → executar R6 (inferência psicográfica — SEM web search)
   - Gravar R2, R3, R6 em RESEARCH_[publico].md
5. APRESENTAR RASCUNHO em 3 blocos para validação (não todos de uma vez):
   Bloco A — Demographics: "Aqui está meu rascunho do perfil demográfico. O que está 
   certo, o que muda?"
   Bloco B — Psychographics: "Agora o perfil psicográfico e de valores. Ajuste o que 
   não se encaixa."
   Bloco C — Communication: "Por último, como essa persona se comunica e consome 
   conteúdo."
6. Perguntar APENAS os campos que a skill não consegue inferir:
   P2.6 — "Esse público costuma pesquisar seu tipo de problema fora do horário comercial 
           (noite/madrugada)? O que buscam?"
   P2.7 — "Existe alguma vergonha ou tabu ligado ao problema que o produto resolve?"
   P2.8 — "Se essa persona fosse a um jantar com profissionais muito bem-sucedidos do 
           mesmo setor, o que ela diria que faz? Como gostaria de ser vista?"
   P3.2 — "Como essa persona reage a mudanças? Adota novidades cedo ou espera provas?"
   P3.9 — "Qual frase ela diz internamente sobre por que ainda não resolveu o problema?"
   P8.3 — "Qual tom ela prefere: direto e sem rodeios / consultivo e explicativo / 
           inspiracional e motivador / técnico e aprofundado?"
7. Aplicar 5 Rings of Buying Insight (Adele Revella):
   - Ring 1: O que fez buscar solução AGORA? (evento gatilho específico)
   - Ring 2: O que significa sucesso para ela?
   - Ring 3: O que pode impedir a compra?
   - Ring 4: Como pesquisou e avaliou?
   - Ring 5: O que seria decisivo para escolher?
8. NOTA P2.6-P2.8: As respostas sobre pesquisas noturnas, vergonha e aspiração de 
   identidade vão para a seção de DORES do AUDIENCE_[nome].md (não demográficos). 
   Registrar no WORKFLOW_STATE para a Skill 4.3 usar.
9. Gerar seção 2 completa do AUDIENCE_[nome].md

SUGESTÕES AUTOMÁTICAS:
- Pricing do produto → faixa de renda compatível
- Problema central → cargo/função mais provável
- BRAND_VOICE arquétipo → tom de comunicação que ressoa
- B2B enterprise → persona tem influência mas não decisão final sozinha

OUTPUT:
- Arquivo: companies/[empresa]/audiences/AUDIENCE_[nome-segmento].md (criar ou expandir)
- Seções preenchidas: "2. Persona", "Perfil Socioeconômico", "5 Rings of Buying Insight", 
  "Perfil Psicográfico", "Linguagem e Comunicação"
- Arquivo de pesquisa: companies/[empresa]/audiences/RESEARCH_[nome-segmento].md 
  (seções R2, R3, R6)
- Template: references/output-template.md
- Referência para perguntas: references/persona-questions.md

COMPORTAMENTOS ESPECIAIS:
- MODO AUTO-GERAÇÃO OBRIGATÓRIO: sempre gerar rascunho ANTES de fazer perguntas
- VALIDAÇÃO POR BLOCOS: nunca apresentar 34 perguntas seguidas — dividir em 3 blocos
- DADOS INTERNOS PRIMEIRO: sempre perguntar sobre dados do usuário antes de pesquisa externa
- MARCAÇÃO DE CONFIANÇA: usar sistema [H]/[E]/[V]/[D] de references/confidence-levels.md
- CONTEXTUALIZAR RESPOSTAS: se a persona disser que faz X, a skill deve perguntar 
  "por que isso importa para ela?" para ir além do óbvio
- ATUALIZAR WORKFLOW_STATE ao final com: persona criada, campos P2.6-P2.8 reservados 
  para 4.3, status das pesquisas R2/R3/R6
```

---

### REVIEW — Checklist específico

- [ ] Modo de auto-geração está explícito: rascunho ANTES das perguntas
- [ ] Validação por blocos (3 blocos), não lista de perguntas
- [ ] Trigger de perguntar sobre dados internos ANTES de executar R2/R3
- [ ] Instruções para os 5 Rings of Buying Insight com os 5 rings nomeados
- [ ] Nota sobre P2.6-P2.8 vai para seção de DORES (não demográficos)
- [ ] Sistema de marcação de confiança [H]/[E]/[V]/[D] está documentado
- [ ] R2 e R3 rodam em paralelo; R6 roda APÓS R2 confirmada

---

### PLACE

```
Destino: setup/04-audience-profiles/skills/4.2-persona-builder.md
Copiar: corpo do SKILL.md gerado (abaixo do frontmatter)
Arquivo de pesquisa gerado: companies/[empresa]/audiences/RESEARCH_[nome].md (seções R2, R3, R6)
```

---

## Fase 3.3 — Skill 4.3: Pain & Desire Mapper

**O que esta skill faz:** Mapeia em profundidade as dores (3 camadas), desejos (2 camadas), JTBD e o que já tentaram. É onde o framework vai além do óbvio — a Camada 3 (medo não declarado) e o Desejo de Identidade são os campos mais valiosos para copywriting.

**Output que preenche:** Seção 3 (Dores, Desejos e Motivações) de cada `AUDIENCE_[nome].md`.

---

### GATHER — Arquivos a consultar

- `audience-framework/02-FLUXO-PROPOSTO.md` — linhas 158-233 (Skill 4.3 completo)
- `audience-framework/03-PERGUNTAS.md` — Dimensão 4 (P4.1-P4.10), Dimensão 5 (P5.1-P5.9), Dimensão 6 (P6.1-P6.3)

---

### PROMPT — Cole no skill-creator

```
NOME DA SKILL: setup-audience-pain-mapper

PAPEL:
Mapeia dores, desejos e motivações em profundidade para cada persona criada na 4.2.
Opera em modo de inferência primeiro: usa o contexto da persona + produto para 
gerar um mapa preliminar de dores/desejos em 3 camadas, depois valida com o usuário.
Integra pesquisa R4 (voz qualitativa do público — Reclame Aqui, reviews, fóruns).

QUANDO ACIONAR:
- "mapear dores do público"
- "aprofundar o mapeamento de [persona]"
- "quero entender os medos e desejos de [público]"
- Chamada internamente após Skill 4.2 pelo orquestrador

INPUTS:
Obrigatórios:
- AUDIENCE_[nome].md (seções 1 e 2, criadas por 4.1 e 4.2)
- PRODUCT_CONTEXT.md — para inferir dores compatíveis com o problema central
- Notas P2.6-P2.8 do WORKFLOW_STATE (pesquisas noturnas, vergonha, aspiração)

Opcionais:
- RESEARCH_[nome].md (seção R1 — lista de concorrentes para pesquisa R4)

Não carregar:
- BRAND_VOICE.md (fora do escopo desta skill)

PROCEDIMENTO:
1. Ler AUDIENCE_[nome].md (seções 1-2) e PRODUCT_CONTEXT.md
2. Recuperar do WORKFLOW_STATE as respostas de P2.6, P2.7, P2.8 (da Skill 4.2)
3. GERAR RASCUNHO de dores × 3 camadas por inferência:
   Camada 1 — Dor Superficial (o que ela reclama): 
   Ex: "Não tenho tempo para criar conteúdo de qualidade toda semana"
   Camada 2 — Dor Profunda (o que realmente dói):
   Ex: "Minha empresa está perdendo visibilidade enquanto concorrentes aparecem toda semana"
   Camada 3 — Medo Não Declarado (o que ela não admite):
   Ex: "Tenho medo de que as pessoas percebam que não sei o que estou fazendo"
4. TRIGGER PESQUISA R4: "Posso pesquisar agora o que clientes REAIS do mercado 
   reclamam e desejam — no Reclame Aqui, Google Reviews e fóruns, focado nos 
   concorrentes já identificados. Isso dá às dores linguagem real e citações literais. 
   Quer que eu faça isso agora?"
   - ANTES: perguntar se o usuário tem transcrições de calls, tickets de suporte, 
     feedbacks de clientes
   - Requer lista de concorrentes da seção R1 do RESEARCH_[nome].md
   - Gravar seção R4 em RESEARCH_[nome].md
   - Citações literais alimentam P4.1 (dor central) e P8.1 (linguagem da persona)
5. Apresentar rascunho e perguntar por validação, depois aprofundar com:
   P4.1 — "Em uma frase, qual é a DOR CENTRAL — o resumo de tudo o que ela sente?"
   P4.2 — "Qual é o custo real (financeiro, tempo, energia) de ter esse problema?"
   P4.3 — "Qual é o pior cenário que ela imagina se não resolver isso?"
   P4.4 — "O que ela já tentou para resolver? Quais ferramentas, métodos, pessoas?"
   P4.5 — "Por que essas tentativas anteriores não funcionaram?"
   P4.9 — "Existe alguma dor que ela normalizou — que acha que 'é assim mesmo'?"
   P5.1 — "Se o problema fosse resolvido completamente, como seria a vida dela?"
   P5.2 — "Além do resultado funcional, qual percepção externa ela quer? Quem quer que 
           perceba a mudança?"
   P5.4 — "Qual é o sonho real por trás do problema — não o que diz que quer, mas o 
           que realmente quer se tornar?"
   P5.5 — "Como seria o dia ideal dela daqui a 12 meses se o problema estiver resolvido?"
   P6.1 — "Qual é o resultado PRÁTICO que ela 'contrataria' o produto para entregar?"
   P6.2 — "Como ela quer se SENTIR durante e depois de usar o produto?"
   P6.3 — "Como ela quer ser PERCEBIDA pelos outros ao usar o produto?"
6. Mapear: o que já tentou → por que falhou → frustração acumulada → narrativa interna
7. Mapear: custo da inação (financeiro + emocional + prazo até o problema ser crítico)
8. Gerar seção 3 completa do AUDIENCE_[nome].md

SUGESTÕES AUTOMÁTICAS:
- Setor do produto → sugerir dores comuns da indústria
- Pricing alto → dor alta + custo da inação alto (justifica o preço)
- Cargo da persona → medos relacionados à posição hierárquica
- Modelo de negócio → jobs funcionais típicos

OUTPUT:
- Arquivo: companies/[empresa]/audiences/AUDIENCE_[nome].md (expandir seção 3)
- Seções preenchidas: "3. Dores" (3 camadas), "Desejos" (2 camadas), "JTBD" (3 jobs + 
  trigger), "O Que Já Tentou", "Custo da Inação"
- Arquivo de pesquisa: RESEARCH_[nome].md (seção R4)
- Referência para perguntas: references/persona-questions.md
- Referência para JTBD: references/jtbd-frameworks.md

COMPORTAMENTOS ESPECIAIS:
- CAMADA 3 É A MAIS IMPORTANTE: garantir que o medo não declarado é genuinamente 
  profundo, não uma variação da Camada 2. Deve envolver identidade, julgamento social 
  ou medo de fracasso.
- DESEJO DE IDENTIDADE ≠ DESEJO DECLARADO: o desejo não declarado é sobre QUEM ela 
  quer se tornar, não o que ela pede. "Quero ser a profissional que transforma o 
  marketing da empresa" ≠ "Quero ter um calendário editorial organizado"
- LINGUAGEM LITERAL: citar frases reais da persona (de R4 ou fornecidas pelo usuário) 
  nas seções de dor e desejo
- ATUALIZAR WORKFLOW_STATE ao final com: dores mapeadas, citações literais coletadas, 
  status R4
```

---

### REVIEW — Checklist específico

- [ ] Skill explica explicitamente as 3 camadas com exemplos concretos
- [ ] Desejo de identidade vs. desejo declarado estão diferenciados
- [ ] 3 jobs JTBD (funcional/emocional/social) + situação de trigger
- [ ] Trigger R4 tem texto exato + pergunta sobre dados internos primeiro
- [ ] Recupera P2.6-P2.8 do WORKFLOW_STATE (da Skill 4.2) para enriquecer as dores
- [ ] "O que já tentou" inclui: soluções testadas + por que falhou + frustração acumulada

---

### PLACE

```
Destino: setup/04-audience-profiles/skills/4.3-pain-desire-mapper.md
Copiar: corpo do SKILL.md gerado (abaixo do frontmatter)
```

---

## Fase 3.4 — Skill 4.4: Nine Audiences Mapper

**O que esta skill faz:** Para cada persona, mapeia a estratégia para cada um dos 9 tipos de público (Conrado Adolpho). Opera em modo de INFERÊNCIA MÁXIMA: apenas 5 campos vêm do usuário (P9.1-P9.5); os 40 campos restantes (9 tipos × 4-5 dimensões) são gerados automaticamente e apresentados para validação em bloco.

**Output que preenche:** Seção 4 (Os 9 Tipos de Público) de cada `AUDIENCE_[nome].md`.

---

### GATHER — Arquivos a consultar

- `audience-framework/02-FLUXO-PROPOSTO.md` — linhas 235-266 (Skill 4.4 completo)
- `audience-framework/03-PERGUNTAS.md` — Dimensão 9 (P9.1-P9.5)
- `audience-framework/01-PESQUISA.md` — Seção "Os 9 Tipos de Público" (início do arquivo)

---

### PROMPT — Cole no skill-creator

```
NOME DA SKILL: setup-audience-nine-types-mapper

PAPEL:
Mapeia a estratégia completa dos 9 tipos de público para cada persona. Gera 
automaticamente 40 dos 45 campos por inferência a partir das dores, desejos, 
linguagem e canais já mapeados — o usuário fornece apenas 5 dados estratégicos 
e valida o output em bloco. Usa o guia references/nine-audiences-guide.md como 
base para os padrões de cada tipo.

QUANDO ACIONAR:
- "mapear os 9 tipos de público"
- "estratégia por tipo de audiência"
- "como abordar cada estágio do público"
- Chamada internamente após Skill 4.3 pelo orquestrador

INPUTS:
Obrigatórios:
- AUDIENCE_[nome].md (seções 1, 2 e 3 — grupo, persona, dores/desejos)
- COMPANY_PROFILE.md — stage da empresa (early stage vs. consolidada)
- BRAND_VOICE.md — para calibrar tom em cada estágio do funil
- references/nine-audiences-guide.md — padrões estratégicos por tipo

Não carregar:
- RESEARCH_[nome].md (pesquisas já foram processadas; não carregar de novo)

PROCEDIMENTO:
1. Ler AUDIENCE_[nome].md completo (seções 1-3)
2. Ler COMPANY_PROFILE.md para identificar o stage da empresa
3. Perguntar os 5 dados estratégicos (únicos campos que precisam do usuário):
   P9.1 — "Em qual dos 9 tipos a MAIORIA do seu público está hoje?"
           [mostrar lista dos 9 tipos com definições breves para o usuário escolher]
   P9.2 — "Qual tipo é mais NEGLIGENCIADO atualmente na sua estratégia?"
   P9.3 — "Para cada tipo, o que faz o público AVANÇAR para o próximo? 
           Quero entender os gatilhos específicos para ESTE público."
   P9.4 — "O que separa um Lead (Tipo 3) de um Quase-cliente (Tipo 4) para este público 
           específico? Qual é a dúvida/barreira que fica no último momento?"
   P9.5 — "O que transforma um Cliente (Tipo 6-7) em um Indicador (Tipo 8)? 
           O que faria ESTE público falar de você para outros?"
4. GERAR MAPA COMPLETO por inferência: para cada um dos 9 tipos, definir:
   - Mensagem central para esta persona neste estágio
   - Canal mais eficiente (baseado em P8.4-P8.7 — canais da persona)
   - Objetivo de conversão (o que fazer ela avançar)
   - Gatilho específico de avanço
   - O que NÃO fazer neste estágio (erro comum)
   Usar references/nine-audiences-guide.md como base + adaptar com as dores/desejos 
   específicos desta persona
5. Priorizar os 3 tipos mais críticos com base no stage da empresa:
   - Early stage → focar tipos 1-3 (construir audiência)
   - Empresa com clientes mas churn → focar tipos 6-9
6. Identificar o tipo mais negligenciado (resposta de P9.2) e sugerir ação imediata
7. Apresentar o mapa completo ao usuário para validação em bloco único:
   "Aqui está o mapa de estratégia para os 9 tipos de público. Valide e ajuste o que 
   não reflete a realidade do seu negócio."
8. Gerar seção 4 do AUDIENCE_[nome].md

SUGESTÕES AUTOMÁTICAS:
- Stage early stage → alertar que tipos 1-3 precisam de mais atenção
- Churn mencionado no COMPANY_PROFILE → destacar tipos 6-9
- Dores mapeadas → sugerir mensagem específica por tipo usando linguagem da persona
- Canais de consumo da persona → sugerir canal certo para cada tipo

OUTPUT:
- Arquivo: companies/[empresa]/audiences/AUDIENCE_[nome].md (expandir seção 4)
- Seção preenchida: "4. Os 9 Tipos de Público" com: onde está a maioria hoje + 
  estratégia por tipo (mensagem/canal/objetivo/gatilho/erro) + prioridades + 
  oportunidade mais negligenciada
- Referência: references/nine-audiences-guide.md

COMPORTAMENTOS ESPECIAIS:
- INFERÊNCIA MÁXIMA: 40 de 45 campos são gerados pela IA — o usuário NÃO responde 
  45 perguntas. Apenas 5 campos precisam de input direto.
- VALIDAÇÃO EM BLOCO: apresentar o mapa completo de uma vez, não tipo por tipo 
  (evitar fricção)
- ADAPTAR AO STAGE: as recomendações de prioridade dependem do stage da empresa
- SEM GENÉRICOS: cada mensagem deve usar a linguagem específica desta persona 
  (usar as frases literais coletadas em R4)
- ATUALIZAR WORKFLOW_STATE ao final com: tipos priorizados, tipo mais negligenciado
```

---

### REVIEW — Checklist específico

- [ ] Skill usa o `references/nine-audiences-guide.md` como base (não cria os 9 tipos do zero)
- [ ] Os 5 campos P9.1-P9.5 têm as perguntas exatas com contexto
- [ ] Inferência máxima: 40 campos automáticos, validação em bloco único
- [ ] Priorização baseada no stage da empresa (early vs. consolidada)
- [ ] Mensagens por tipo usam linguagem específica da persona (não genérica)

---

### PLACE

```
Destino: setup/04-audience-profiles/skills/4.4-nine-audiences.md
Copiar: corpo do SKILL.md gerado (abaixo do frontmatter)
```

---

## Fase 3.5 — Skill 4.5: Consciousness Mapping

**O que esta skill faz:** Mapeia o nível de consciência predominante (Schwartz 1-5), cria a matriz Consciência × Conteúdo, gera a distribuição ideal de conteúdo por nível e consolida TODA a análise na Síntese Executiva (10 campos auto-gerados, validados em 2 minutos).

**Output que preenche:** Seção 5 (Nível de Consciência e Conteúdo) + Síntese Executiva de cada `AUDIENCE_[nome].md`.

---

### GATHER — Arquivos a consultar

- `audience-framework/02-FLUXO-PROPOSTO.md` — linhas 268-306 (Skill 4.5 completo)
- `audience-framework/03-PERGUNTAS.md` — Dimensão 10 (P10.1-P10.3), Dimensão 11 (P11.1-P11.10)

---

### PROMPT — Cole no skill-creator

```
NOME DA SKILL: setup-audience-consciousness-mapper

PAPEL:
Mapeia o nível de consciência predominante da persona (framework de Eugene Schwartz), 
define a estratégia de conteúdo por nível e gera a Síntese Executiva automática 
com os 10 campos-chave da persona. Integra pesquisa R5 (análise competitiva de 
posicionamento). É a skill final do fluxo — produz o arquivo AUDIENCE_[nome].md 
completo e validado.

QUANDO ACIONAR:
- "mapear nível de consciência"
- "criar estratégia de conteúdo por nível"
- "finalizar o mapeamento de [público]"
- Chamada internamente após Skill 4.4 pelo orquestrador

INPUTS:
Obrigatórios:
- AUDIENCE_[nome].md completo (seções 1-4)
- PRODUCT_CONTEXT.md — maturidade do mercado → nível de consciência provável

Não carregar:
- COMPANY_PROFILE.md, BRAND_VOICE.md (já processados nas skills anteriores)

PROCEDIMENTO:
1. Ler AUDIENCE_[nome].md completo (seções 1-4)
2. Ler PRODUCT_CONTEXT.md para avaliar maturidade do mercado
3. Perguntar os 3 campos de consciência:
   P10.1 — "Em qual nível de consciência a maioria do seu público está hoje?"
            [mostrar os 5 níveis com descrição breve: 
             1=Sem consciência, 2=Consciente do problema, 3=Consciente da solução, 
             4=Consciente do produto, 5=Totalmente consciente/pronto para comprar]
   P10.2 — "Qual a distribuição ideal do seu conteúdo por nível? 
            Ex: 40% nível 2, 30% nível 3, 20% nível 4, 10% nível 5"
   P10.3 — "Para cada nível, qual headline ressoa mais com ESTE público?"
4. TRIGGER PESQUISA R5: "Agora que sei o que sua audiência quer e teme, posso pesquisar 
   como seus concorrentes estão se comunicando com elas — anúncios ativos, promessas, 
   nível de consciência que endereçam — e identificar gaps onde ninguém atua bem. 
   Quer que eu faça isso agora?"
   - Requer: lista de concorrentes (seção R1 do RESEARCH_[nome].md) + mapa de dores 
     (seção 3 do AUDIENCE_[nome].md)
   - Pesquisa: Meta Ad Library, landing pages, preços, tipos de prova social
   - Gravar seção R5 em RESEARCH_[nome].md
   - Os gaps identificados alimentam P10.2 (distribuição de conteúdo por nível)
5. Gerar MATRIZ CONSCIÊNCIA × CONTEÚDO para esta persona:
   Para cada nível de consciência: tipo de conteúdo que funciona, headlines que 
   ressoam, formato preferido, CTA adequado
6. Sugerir 3 headlines de exemplo por nível usando as dores/desejos literais da persona
7. Conectar com os 9 tipos: Anônimos (tipo 1-2) → nível 1-2; Leads (tipo 3) → nível 3-4
8. GERAR SÍNTESE EXECUTIVA AUTOMATICAMENTE (Dimensão 11):
   Os 10 campos abaixo são preenchidos por inferência — NÃO são novas perguntas:
   P11.1 — Frase de persona (resumo em 1 linha)
   P11.2 — Dor mais premente (da Camada 2 da skill 4.3)
   P11.3 — Desejo real (Desejo de Identidade da skill 4.3)
   P11.4 — Medo oculto (Camada 3 da skill 4.3)
   P11.5 — Gatilho de ação (Ring 1 dos 5 Rings da skill 4.2)
   P11.6 — Objeção principal (Ring 3 dos 5 Rings da skill 4.2)
   P11.7 — Requisito de confiança (Ring 5 dos 5 Rings da skill 4.2)
   P11.8 — Mensagem-chave (síntese de dor + desejo em 1 frase)
   P11.9 — Canal principal (P8.4-P8.5 da skill 4.2)
   P11.10 — Transformação prometida (Job Emocional + Desejo de Identidade)
9. APRESENTAR SÍNTESE ao usuário: "Aqui está a Síntese Executiva desta persona. 
   Valide em menos de 2 minutos — é o resumo de tudo que mapeamos."
10. Ajustar com base no feedback
11. Gerar seção 5 + Síntese Executiva do AUDIENCE_[nome].md

SUGESTÕES AUTOMÁTICAS:
- Produto inovador → mais conteúdo nos níveis 1-2 (educar o mercado)
- Mercado saturado → foco nos níveis 3-4 (diferenciação)
- Linguagem literal da persona → exemplos de headline adaptados
- Análise R5 → distribuição baseada em gaps competitivos reais

OUTPUT:
- Arquivo: companies/[empresa]/audiences/AUDIENCE_[nome].md (FINALIZAR — seção 5 + 
  Síntese Executiva completa)
- Arquivo de pesquisa: RESEARCH_[nome].md (seção R5)
- Seções preenchidas: "5. Nível de Consciência", "Estratégia de Conteúdo por Nível", 
  "Headlines por Nível", "Síntese Executiva" (10 campos)

COMPORTAMENTOS ESPECIAIS:
- SÍNTESE EXECUTIVA = AUTO-GERADA: os 10 campos não são novas perguntas — são 
  consolidados a partir de TUDO que foi coletado nas skills 4.1-4.4
- VALIDAÇÃO RÁPIDA: apresentar síntese em bloco único para validação em ≤ 2 minutos
- CONECTAR NÍVEIS COM 9 TIPOS: a distribuição de conteúdo por nível deve mapear 
  para os tipos de público (ex: "Tipo 1-2 = Nível 1-2 = conteúdo de awareness")
- ATUALIZAR WORKFLOW_STATE ao final: marcar AUDIENCE_[nome].md como completo, 
  status R5, indicar se há próximo público para mapear
```

---

### REVIEW — Checklist específico

- [ ] Os 5 níveis de consciência de Schwartz estão descritos com clareza
- [ ] Síntese Executiva (D11) é auto-gerada — não são novas perguntas ao usuário
- [ ] Validação da síntese em bloco único (≤ 2 minutos)
- [ ] Trigger R5 tem texto exato + requisitos (R1 + dores mapeadas)
- [ ] Conexão explícita entre níveis de consciência e os 9 tipos
- [ ] Ao final, AUDIENCE_[nome].md está COMPLETO (todas as 5 seções + síntese)

---

### PLACE

```
Destino: setup/04-audience-profiles/skills/4.5-consciousness-mapping.md
Copiar: corpo do SKILL.md gerado (abaixo do frontmatter)
AUDIENCE_[nome].md final: companies/[empresa]/audiences/ (gerado durante a execução)
```

---

## Parte 4 — Orquestrador SKILL.md

**O que o orquestrador faz:** Ponto de entrada único para todo o sistema. Detecta se já existem arquivos `AUDIENCE_*.md`, oferece modo de criação ou atualização, carrega os arquivos de contexto e conduz a sequência 4.1 → 4.5.

**Criar por último** — depois de entender o que cada sub-skill faz.

---

### GATHER — Arquivos a consultar

- `audience-framework/02-FLUXO-PROPOSTO.md` — linhas 41-54 (Orquestrador)
- `skills/content/flows/content-production/00-orchestrator/SKILL.md` — exemplo de orquestrador real do projeto
- `skills/setup/flows/company-setup/03-audience-profiles/skills/` — os 5 arquivos de sub-skill já criados

---

### PROMPT — Cole no skill-creator

```
NOME DA SKILL: setup-audience-profiles

PAPEL:
Ponto de entrada para o sistema de mapeamento de audiência. Verifica o estado atual 
(se já existem AUDIENCE_*.md), oferece modo de criação completa ou atualização de 
público específico, carrega os arquivos de contexto da empresa e conduz a sequência 
completa de mapeamento através das sub-skills 4.1 → 4.5.

QUANDO ACIONAR:
- "mapear público-alvo"
- "criar personas"
- "mapeamento de audiência"
- "quero criar o perfil do meu público"
- "audiência da [empresa]"
- "atualizar persona de [público]"
- "/setup-audience-profiles"

INPUTS:
Obrigatórios (ler sempre):
- COMPANY_PROFILE.md — identificar a empresa ativa
- PRODUCT_CONTEXT.md — contexto do produto

Carregar sob demanda (não carregar todos de uma vez):
- BRAND_VOICE.md — quando for iniciar Skill 4.2
- AUDIENCE_*.md existentes — apenas para verificação inicial

Sub-skills (carregar a instrução no momento certo):
- skills/4.1-target-audiences.md — ao iniciar mapeamento de públicos
- skills/4.2-persona-builder.md — ao construir cada persona
- skills/4.3-pain-desire-mapper.md — ao mapear dores
- skills/4.4-nine-audiences.md — ao mapear os 9 tipos
- skills/4.5-consciousness-mapping.md — ao mapear consciência e síntese

Não carregar:
- CONTENT_PILLARS.md, EDITORIAL_CALENDAR.md (fora do escopo)

PROCEDIMENTO:
1. Ler COMPANY_PROFILE.md e PRODUCT_CONTEXT.md
2. Verificar se existem arquivos AUDIENCE_*.md em companies/[empresa]/audiences/
   - Se existem → oferecer:
     a) "Criar um novo público-alvo adicional"
     b) "Atualizar uma seção específica de um público existente"
     c) "Ver resumo dos públicos já mapeados"
   - Se não existem → iniciar modo de criação completo
3. Informar ao usuário o que será feito em cada etapa:
   "Vamos passar por 5 etapas: (1) identificar seus grupos de público, (2) construir 
   uma persona para cada grupo, (3) mapear dores e desejos em profundidade, (4) 
   definir estratégia para os 9 tipos de público e (5) mapear níveis de consciência. 
   Ao final, você terá um arquivo AUDIENCE_[nome].md completo por público."
4. Perguntar: quantas sessões quer fazer? (recomendado: 1 público por sessão)
5. INICIAR SEQUÊNCIA:
   - Carregar skills/4.1-target-audiences.md → executar Skill 4.1
   - Para cada público identificado:
     - Carregar skills/4.2-persona-builder.md → executar Skill 4.2
     - Carregar skills/4.3-pain-desire-mapper.md → executar Skill 4.3
     - Carregar skills/4.4-nine-audiences.md → executar Skill 4.4
     - Carregar skills/4.5-consciousness-mapping.md → executar Skill 4.5
     - Verificar se AUDIENCE_[nome].md está completo
   - Se há mais públicos: oferecer continuar ou pausar
6. Ao final: apresentar resumo do que foi criado + próximos passos sugeridos
   (ex: "Agora você pode usar /content-ideation para criar conteúdo para estes públicos")

COMPORTAMENTOS ESPECIAIS:
- DETECTAR EMPRESA ATIVA: ler COMPANY_PROFILE.md para saber em qual pasta companies/ operar
- NUNCA FORÇAR O PIPELINE LINEAR: se o usuário só quer atualizar a seção de dores de 
  um público já existente, ir direto para a Skill 4.3 sem refazer 4.1 e 4.2
- UM PÚBLICO POR VEZ: focar em um público-alvo de cada vez para manter qualidade
- RETOMADA: se o WORKFLOW_STATE indicar uma sessão anterior pausada, oferece retomar 
  de onde parou

OUTPUT:
- Nenhum arquivo direto — delega para as sub-skills
- WORKFLOW_STATE.md atualizado ao final de cada sessão

REFERENCES A CRIAR:
- references/output-template.md (já criado na Parte 2.1)
- references/nine-audiences-guide.md (já criado na Parte 2.3)
```

---

### REVIEW — Checklist do orquestrador

Além do checklist universal, verificar:

- [ ] `description` menciona pelo menos 4 frases literais diferentes que o usuário diria
- [ ] Modo de atualização (público existente) está documentado explicitamente
- [ ] Carregamento sob demanda: sub-skills são carregadas no momento certo, não todas de uma vez
- [ ] A skill não força pipeline linear — detecta onde o usuário está e oferece atalhos
- [ ] Instrução de "um público por vez" está documentada com justificativa de qualidade
- [ ] Ao final da sessão: resumo + próximos passos sugeridos

---

### PLACE

```
Destino: setup/04-audience-profiles/SKILL.md
Copiar: arquivo completo gerado pelo skill-creator (com frontmatter)
Instalar: rodar install.sh após colocar o arquivo (ou copiar manualmente para 
          ~/.claude/skills/setup-audience-profiles/)
```

---

## Parte 5 — Validação Final

Após criar todos os arquivos, verificar:

### Checklist de estrutura

```bash
# Verificar que todos os arquivos existem
ls setup/04-audience-profiles/
ls setup/04-audience-profiles/skills/
ls setup/04-audience-profiles/references/
```

Esperado:
```
setup/04-audience-profiles/
├── SKILL.md                           ✓
├── skills/
│   ├── 4.1-target-audiences.md        ✓
│   ├── 4.2-persona-builder.md         ✓
│   ├── 4.3-pain-desire-mapper.md      ✓
│   ├── 4.4-nine-audiences.md          ✓
│   └── 4.5-consciousness-mapping.md   ✓
└── references/
    ├── output-template.md             ✓
    ├── persona-questions.md           ✓
    ├── nine-audiences-guide.md        ✓
    ├── jtbd-frameworks.md             ✓
    └── research-protocols.md          ✓
```

### Teste funcional

1. Rodar `install.sh` para registrar a skill
2. Ativar: diga `"quero mapear meu público-alvo"`
3. Verificar que o orquestrador:
   - Lê COMPANY_PROFILE.md e PRODUCT_CONTEXT.md corretamente
   - Oferece as duas opções (criar novo / atualizar existente)
   - Carrega skills/4.1-target-audiences.md ao iniciar
4. Passar pela Skill 4.1 com uma empresa de teste
5. Verificar que ao final é gerado o sumário de públicos no WORKFLOW_STATE
6. Continuar com a Skill 4.2 e verificar:
   - Auto-geração do rascunho antes de perguntas
   - Validação em blocos (3 blocos, não lista única)
7. Ao final da skill 4.5, verificar que `AUDIENCE_[nome].md` tem todas as 5 seções + Síntese Executiva

### Critérios de sucesso (de 00-PLANEJAMENTO.md)

- [ ] Qualquer empresa pode passar pelas 5 sub-skills e ter públicos mapeados com profundidade
- [ ] Cada `AUDIENCE_[nome].md` gerado é rico o suficiente para alimentar 6+ meses de estratégia
- [ ] Uma LLM lendo os arquivos de audiência consegue sugerir temas, hooks, formatos e canais sem informações adicionais
- [ ] As sugestões automáticas são tão boas que o usuário raramente precisa criar respostas do zero

---

*Playbook gerado a partir de: `audience-framework/00-PLANEJAMENTO.md`, `02-FLUXO-PROPOSTO.md`, `03-PERGUNTAS.md`, `01-PESQUISA.md` e `skills-pesquisa/R1-R6`.*
