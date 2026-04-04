# Fluxo Proposto: Skills de Audience Mapping

**Objetivo:** Descrever como cada skill se comporta, o que recebe, o que produz e como se conecta com as demais.

---

## Visão Geral do Fluxo

```
[COMPANY_PROFILE.md]
[PRODUCT_CONTEXT.md]    → 4.1 → 4.2 → 4.3 → 4.4 → 4.5
[BRAND_VOICE.md]          ↑      ↑      ↑           ↑
                          R1    R2,R3  R4,R6        R5
                          │     R6     │             │
                          └─────┴──────┴─────────────┘
                                       │
                              RESEARCH_[publico].md (arquivo de pesquisa consolidado)
                                       │
                              AUDIENCE_[nome].md × N públicos
                                       ↓
                              alimenta todo o pipeline de conteúdo
```

### Skills de Pesquisa (R1–R6)

| Skill | Nome | Aciona em | Tipo |
|---|---|---|---|
| R1 | Pesquisa Setorial | Início de 4.1 | IA pesquisa |
| R2 | Pesquisa Demográfica | Durante 4.2 (após faixa etária confirmada) | IA pesquisa |
| R3 | Comportamento de Busca e Linguagem | Durante 4.2 (em paralelo com R2) | IA pesquisa |
| R6 | Inferência Psicográfica | Durante 4.2 (após dados demográficos) | IA infere (sem web search) |
| R4 | Análise Qualitativa — Voz do Público | Durante 4.3 (após persona básica + lista de concorrentes da R1) | IA pesquisa |
| R5 | Análise Competitiva de Posicionamento | Durante 4.5 (após dores e desejos mapeados) | IA pesquisa |

**Output consolidado:** `companies/[empresa]/audiences/RESEARCH_[nome-publico].md`  
**Template:** `references/output-template-research.md`  
**Regra de ouro:** A IA pergunta se o usuário tem dados internos ANTES de pesquisar externamente. Dados proprietários ([U]) sempre prevalecem sobre dados pesquisados ([D]).

---

## Skill Orquestradora — `SKILL.md`

**Responsabilidade:** Ponto de entrada. Lê os arquivos de contexto existentes, verifica o que já foi mapeado, e conduz o usuário pela sequência 4.1 → 4.5.

**Comportamento:**
1. Verificar se existem arquivos `AUDIENCE_*.md` na pasta `audiences/`
2. Se existem: oferecer modo de atualização (qual público-alvo atualizar?)
3. Se não existem: iniciar modo de criação completo
4. Carregar e resumir: COMPANY_PROFILE, PRODUCT_CONTEXT, BRAND_VOICE
5. Informar ao usuário o que será feito em cada etapa
6. Chamar 4.1 → 4.2 → 4.3 → 4.4 → 4.5 em sequência, passando o contexto acumulado

**Output:** Nenhum arquivo direto — delega para as sub-skills

---

## Skill 4.1 — Identificação de Públicos-Alvo

**Responsabilidade:** Definir quem são os grupos amplos de pessoas/empresas que se beneficiam do produto. Um público-alvo é um segmento, não uma pessoa.

**Input disponível:**
- `PRODUCT_CONTEXT.md` — problema central, diferenciadores, pricing, modelo de negócio
- `COMPANY_PROFILE.md` — stage da empresa, missão, valores

**O que a skill faz:**

1. Com base no `PRODUCT_CONTEXT.md`, sugere automaticamente 2-4 grupos prováveis de público-alvo
2. Pergunta ao usuário se os grupos sugeridos fazem sentido ou se há outros
3. Para cada grupo identificado, coleta:
   - Nome descritivo do grupo (não um nome de persona — um segmento: "Gestores de marketing em PMEs")
   - B2B ou B2C? Se B2B: quem compra? Quem usa? São a mesma pessoa?
   - Tamanho estimado do mercado (nicho pequeno / mercado amplo)
   - Por que esse grupo tem mais chance de comprar/contratar?
   - Qual é a característica mais definidora desse grupo?
4. Define ordem de prioridade dos públicos (qual focar primeiro no conteúdo)
5. Gera um sumário dos públicos para passar para a 4.2

**Sugestões automáticas que a skill deve gerar:**
- Se o produto é SaaS com pricing > R$500/mês → sugerir gestores de mid-market como público provável
- Se o produto resolve problema de produtividade → sugerir empreendedores solo e pequenas equipes
- Se modelo é one-time e problema é muito específico → sugerir que o público seja bem nichado
- Se B2B: perguntar se o decisor de compra é diferente do usuário final

**⚠️ Bifurcação B2B — decisor ≠ usuário:** Se a resposta a essa pergunta revelar que o comprador (quem aprova e paga) é uma pessoa diferente do usuário final (quem usa no dia a dia), a skill deve perguntar ao usuário: "Para esse público B2B, prefere mapear as duas perspectivas separadamente (economic buyer + technical buyer) ou focar em uma? Se houver diferença significativa de cargo e dores entre eles, o ideal é criar dois perfis distintos." Cada perfil segue o fluxo 4.2–4.5 individualmente.

**🔍 Pesquisa R1 — Setorial:** Após ler `PRODUCT_CONTEXT.md` e antes da primeira pergunta ao usuário, oferecer:
> "Posso pesquisar o contexto do seu setor agora — tamanho de mercado, principais concorrentes e tendências recentes. Isso melhora muito a qualidade das sugestões ao longo de todo o mapeamento. Quer que eu faça isso agora? (recomendado)"
- Se sim → executar R1 e gravar seção R1 em `RESEARCH_[publico].md`
- Se não → continuar sem, marcando R1 como pulada

**Output:** Lista estruturada de públicos-alvo com nome, caracterização, prioridade e contexto B2B/B2C

---

## Skill 4.2 — Persona Builder

**Responsabilidade:** Criar uma persona detalhada para cada público-alvo identificado na 4.1. A persona é a representação individual fictícia — tem nome, história, rotina, linguagem.

**Input disponível:**
- Output da 4.1 (lista de públicos)
- `PRODUCT_CONTEXT.md`
- `BRAND_VOICE.md` (para calibrar a linguagem e como a persona "fala")

**🔍 Pesquisas R2 + R3 + R6 — Demográfica, Linguagem e Psicográfica:** Após o usuário confirmar faixa etária (P2.1) e região (P2.4):
> "Antes de continuar: você tem Google Analytics, Instagram Insights ou dados do CRM com informações sobre sua audiência? Se sim, me passe — são mais precisos do que qualquer pesquisa externa para o seu caso específico."
- Se forneceu dados internos → processar como [U] na seção R2
- Independentemente → executar R2 (demográfica) + R3 (comportamento de busca) em paralelo
- Após R2 confirmada → executar R6 (inferência psicográfica — sem web search)
- Gravar R2, R3 e R6 em `RESEARCH_[publico].md`

**⚠️ Modo de operação — auto-sugestão primeiro:** Esta skill cobre 34 perguntas (dimensões 2, 3, 7 parcial e 8). O usuário NÃO responde 34 perguntas do zero. O fluxo correto é:
1. A skill lê os arquivos de contexto (PRODUCT_CONTEXT, BRAND_VOICE, output da 4.1)
2. Gera um rascunho completo da persona com ~80% dos campos preenchidos por inferência
3. Apresenta o rascunho em blocos (demographics → psychographics → communication) e pede validação
4. O usuário corrige, complementa ou confirma — sem ter que criar tudo do zero
5. Apenas campos que a skill não consegue inferir (ex: rotina diária, referências culturais específicas) são perguntados diretamente

**Nota sobre P2.6–P2.8:** As perguntas sobre pesquisas noturnas (P2.6), vergonha (P2.7) e o jantar com bem-sucedidos (P2.8) são coletadas aqui como parte da construção da persona, mas o conteúdo gerado por elas alimenta diretamente a seção de **dores e medos** no output — não o perfil demográfico. A skill 4.3 deve referenciá-las explicitamente ao preencher as camadas de dor.

**O que a skill faz (por persona):**

1. Nomear a persona — não "João" genérico, mas um nome que evoca o arquétipo (ex: "Carla, a gestora sobrecarregada")
2. Construir o perfil base:
   - Idade e faixa etária
   - Cargo e nível hierárquico
   - Tamanho de empresa (B2B) ou contexto de vida (B2C)
   - Localização e contexto geográfico
   - Escolaridade e área de formação
3. Construir o contexto de vida/trabalho:
   - Rotina típica de um dia
   - Pressões e responsabilidades
   - Quem ela responde / quem responde a ela
   - O que "sucesso no trabalho" significa para ela
4. Dados socioeconômicos:
   - Classe social estimada (A/B/C/D)
   - Faixa de renda estimada
   - Padrão de consumo (como decide comprar, referências de preço)
5. Aplicar os 5 Rings of Buying Insight (Adele Revella):
   - Ring 1: O que fez buscar solução agora? (evento gatilho)
   - Ring 2: O que significa sucesso para ela?
   - Ring 3: O que pode impedir a compra?
   - Ring 4: Como pesquisou e avaliou?
   - Ring 5: O que seria decisivo para escolher?
6. Perfil psicográfico:
   - 3 valores principais que guiam suas decisões
   - Atitude em relação a tecnologia e mudança
   - Como se identifica profissionalmente (o que diz que faz vs. o que realmente faz)
   - Quem admira profissionalmente e por quê

**Sugestões automáticas que a skill deve gerar:**
- Com base no pricing do produto → sugerir faixa de renda compatível
- Com base no problema central → sugerir cargo/função mais provável
- Com base no BRAND_VOICE arquétipo → sugerir tom de comunicação que ressoa com a persona
- Se B2B enterprise → sugerir que a persona tem influência mas não decisão final sozinha

**Output:** Seção "Persona" e "Perfil Socioeconômico" e "5 Rings" do `AUDIENCE_[nome].md`

---

## Skill 4.3 — Pain & Desire Mapper

**Responsabilidade:** Mapear em profundidade as dores, medos, desejos e jobs-to-be-done de cada persona. É aqui que o framework sai do raso e vai no que realmente motiva o comportamento.

**Input disponível:**
- Output da 4.2 (persona completa)
- `PRODUCT_CONTEXT.md` (problema central, o que já tentaram)

**O que a skill faz (por persona):**

### Mapeamento de Dores em 3 Camadas

**Camada 1 — Dor Superficial (o que ela reclama)**
> O que ela diz quando alguém pergunta qual é o problema. A versão racional e segura.

Exemplo: "Não tenho tempo para criar conteúdo de qualidade toda semana"

**Camada 2 — Dor Profunda (o que realmente dói)**
> O que está por trás da queixa. Envolve consequências reais e impacto no trabalho/vida.

Exemplo: "Minha empresa está perdendo visibilidade enquanto concorrentes aparecem toda semana. Estou sendo questionada pela liderança sobre os resultados de marketing."

**Camada 3 — Medo Não Declarado (o que ela não admite nem para si mesma)**
> A dimensão emocional mais profunda. Envolve identidade, medo de julgamento, medo de fracasso.

Exemplo: "Tenho medo de que as pessoas percebam que não sei o que estou fazendo. Que minha posição não seja tão sólida quanto parece."

### Mapeamento de Desejos em 2 Camadas

**Desejo Declarado (o que ela pede)**
> O resultado funcional que diz querer.

Exemplo: "Quero ter um calendário editorial organizado e postagens consistentes"

**Desejo Não Declarado / Identidade Aspiracional (o que ela realmente quer ser)**
> Quem ela quer ser depois de resolver o problema. Envolve status, reconhecimento, identidade.

Exemplo: "Quero ser a profissional que transforma o marketing da empresa — que as pessoas olham e pensam 'ela sabe o que faz'."

### Jobs-to-Be-Done

- **Job Funcional:** O resultado prático que contrata a solução para entregar
- **Job Emocional:** Como quer se sentir durante e após usar a solução
- **Job Social:** Como quer ser percebida pelos outros ao usar a solução
- **Situação de Trigger:** O contexto específico que faz o job ser ativado

### O Que Já Tentou

- Soluções anteriores testadas (ferramentas, métodos, pessoas)
- Por que não funcionou (específico, não genérico)
- Frustração acumulada e narrativa interna sobre "por que é difícil"
- O que aprendeu com as tentativas anteriores

### Custo da Inação

- O que continua acontecendo se ela não resolver isso
- Impacto financeiro da não resolução
- Impacto emocional / de carreira
- Em quanto tempo o problema se torna crítico

**Sugestões automáticas que a skill deve gerar:**
- Com base no setor do produto → sugerir dores comuns da indústria
- Com base no pricing tier → sugerir nível de dor compatível (pricing alto = dor alta = custo da inação alto)
- Com base na persona construída na 4.2 → sugerir medos relacionados ao cargo e nível hierárquico
- Com base no modelo de negócio → sugerir jobs funcionais típicos

**🔍 Pesquisa R4 — Voz do Público:** No início desta skill, após a persona ter esqueleto básico:
> "Posso pesquisar agora o que clientes REAIS do mercado reclamam e desejam — no Reclame Aqui, Google Reviews e fóruns, focado nos concorrentes já identificados. Isso dá às dores linguagem real e citações literais. Quer que eu faça isso agora?"
- Requer lista de concorrentes da R1 para busca precisa
- Antes de pesquisar externamente: perguntar se o usuário tem transcrições de calls, tickets de suporte ou feedbacks de clientes
- Gravar seção R4 em `RESEARCH_[publico].md`
- As citações literais coletadas alimentam diretamente P4.1 (dor central) e P8.1 (linguagem da persona)

**Output:** Seção "Dores", "Desejos", "JTBD" e "O Que Já Tentou" do `AUDIENCE_[nome].md`

---

## Skill 4.4 — Nine Audiences Mapper

**Responsabilidade:** Para cada persona, mapear como deve ser abordada em cada um dos 9 tipos de público. Transforma o mapa de persona em estratégia operacional.

**⚠️ Modo de operação — geração por inferência:** Esta skill precisa entregar 9 tipos × 5 dimensões = 45 campos de estratégia (mensagem, canal, objetivo, gatilho, erro). Apenas 5 desses dados vêm diretamente do usuário (P9.1–P9.5). Os 40 campos restantes são gerados por inferência a partir das dimensões anteriores (dores, desejos, linguagem, canais, JTBD). O usuário valida e ajusta o output gerado — não responde 45 perguntas. Consultar `references/nine-audiences-guide.md` para os padrões estratégicos por tipo.

**Input disponível:**
- Output completo das skills 4.1, 4.2, 4.3
- `COMPANY_PROFILE.md` (para entender o stage da empresa)
- `BRAND_VOICE.md` (para calibrar tom em cada estágio)

**O que a skill faz (por persona):**

1. Identificar em qual dos 9 tipos a **maioria** desse público está hoje
2. Para cada tipo (1 a 9), definir:
   - A mensagem central para esse persona nesse estágio
   - O canal mais eficiente
   - O objetivo de conversão (o que fazer ela avançar para o próximo tipo)
   - Um gatilho específico de avanço
   - O que NÃO fazer nesse estágio (erro comum)
3. Priorizar os 3 tipos mais críticos para a empresa nesse momento
4. Sugerir qual tipo é mais negligenciado e tem maior oportunidade

**Sugestões automáticas que a skill deve gerar:**
- Se empresa é early stage → foco nos tipos 1-3 (ainda construindo audiência)
- Se empresa tem clientes mas churn alto → foco nos tipos 6-9
- Com base nas dores mapeadas → sugerir mensagem específica por tipo
- Com base nos canais de consumo da persona → sugerir canal certo para cada tipo

**Output:** Seção "Os 9 Tipos de Público" do `AUDIENCE_[nome].md`

---

## Skill 4.5 — Consciousness Mapping

**Responsabilidade:** Mapear o nível de consciência predominante da persona, definir a estratégia de conteúdo por nível, e consolidar toda a análise na Síntese Executiva.

**⚠️ Síntese Executiva — geração automática:** Os campos P11.1–P11.10 da Dimensão 11 NÃO são novas perguntas para o usuário. São campos consolidados que a skill preenche automaticamente a partir de tudo que foi coletado nas dimensões 2–10. O fluxo correto é:
1. Gerar os 10 campos da síntese por inferência
2. Apresentar ao usuário para validação rápida em bloco único
3. Ajustar com base no feedback
O objetivo é que o usuário consiga revisar e validar a síntese em menos de 2 minutos.

**Input disponível:**
- Output completo das skills 4.1 a 4.4
- `PRODUCT_CONTEXT.md`

**O que a skill faz (por persona):**

1. Identificar o nível de consciência predominante da persona (Schwartz 1-5)
2. Criar a matriz Consciência × Conteúdo:
   - Para cada nível de consciência: que tipo de conteúdo funciona, que headlines ressoam, que formato prefere
3. Sugerir a distribuição ideal de conteúdo por nível (ex: 40% nível 2, 30% nível 3, 20% nível 4, 10% nível 5)
4. Sugerir 3 headlines de exemplo para cada nível com base nas dores mapeadas
5. Conectar com os 9 tipos: anônimos geralmente estão no nível 1-2, leads no 3-4, etc.

**Sugestões automáticas que a skill deve gerar:**
- Com base no produto e mercado → sugerir nível predominante provável
- Se produto é inovador → mais conteúdo nos níveis 1-2 (educar o mercado)
- Se mercado é saturado → foco nos níveis 3-4 (diferenciação)
- Com base na linguagem literal da persona → exemplos de headline adaptados

**🔍 Pesquisa R5 — Análise Competitiva:** No início desta skill, após dores e desejos mapeados:
> "Agora que sei o que sua audiência quer e teme, posso pesquisar como seus concorrentes estão se comunicando com elas — anúncios ativos, promessas, nível de consciência que endereçam — e identificar os gaps onde ninguém atua bem. Quer que eu faça isso agora?"
- Requer: lista de concorrentes (R1) + mapa de dores (R4 + Skill 4.3)
- Pesquisa: Meta Ad Library, landing pages, preços, tipos de prova social
- Gravar seção R5 em `RESEARCH_[publico].md`
- Os gaps identificados alimentam diretamente a distribuição de conteúdo por nível de consciência (P10.2)

**Output:** Seção "Nível de Consciência" e "Estratégia de Conteúdo" do `AUDIENCE_[nome].md`

---

## Estrutura Final do Arquivo de Output

Cada `AUDIENCE_[nome].md` terá esta estrutura após passar pelas 5 skills:

```markdown
# [Nome do Público-Alvo]

## 1. Grupo e Segmentação (4.1)
- Descrição do grupo amplo
- B2B ou B2C
- Prioridade estratégica

## 2. Persona: [Nome] (4.2)
- Perfil e contexto
- Dados socioeconômicos (classe, renda)
- 5 Rings of Buying Insight
- Perfil psicográfico
- Linguagem e comunicação

## 3. Dores, Desejos e Motivações (4.3)
- Dores em 3 camadas
- Desejos declarados e identidade aspiracional
- Jobs-to-Be-Done
- O que já tentou
- Custo da inação

## 4. Os 9 Tipos de Público (4.4)
- Onde está a maioria hoje
- Estratégia por tipo (mensagem, canal, gatilho, erro)
- Prioridades e oportunidades

## 5. Nível de Consciência e Conteúdo (4.5)
- Nível predominante
- Distribuição de conteúdo por nível
- Headlines de exemplo
- Formatos que funcionam
```
