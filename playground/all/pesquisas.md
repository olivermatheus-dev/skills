# MAPA DO FLUXO: DADOS MANUAIS × PESQUISA DA IA POR ETAPA

> **Princípio arquitetural:** A pesquisa não acontece toda de uma vez.
> Cada etapa do fluxo gera contexto que torna a pesquisa da etapa
> seguinte mais precisa. A IA só pesquisa quando tem contexto suficiente
> para fazer buscas inteligentes.

---

## VISÃO GERAL DO FLUXO

```
ETAPA 1          ETAPA 2          ETAPA 3          ETAPA 4
Produto/         Público-Alvo     Perfil           Persona
Empresa          (amplo)          Psicográfico     (profunda)
   │                │                │                │
   ▼                ▼                ▼                ▼
🧑 Manual:       🧑 Manual:       🤖 IA pesquisa:  🧑 Manual:
Quem sou,        Quem compra      Contexto         Validar e
o que vendo      de mim           geracional       refinar
                                  e cultural
🤖 IA pesquisa:  🤖 IA pesquisa:                   🤖 IA pesquisa:
Setor,           Dados demográ-   🧑 Manual:       Dores reais
mercado,         ficos, compor-   Ajustar e        (qualitativo)
concorrentes     tamento de       confirmar
                 busca            hipóteses
   │                │                │                │
   └────────────────┴────────────────┴────────────────┘
                           │
                    ETAPA 5          ETAPA 6
                    Dores e          Posicionamento
                    Desejos          e Valor
                       │                │
                       ▼                ▼
                    🧑 Manual:       🧑 Manual:
                    Priorizar e      Definir
                    validar          diferenciais

                    🤖 IA pesquisa:  🤖 IA pesquisa:
                    Reviews,         Anúncios dos
                    reclamações,     concorrentes,
                    fóruns           gaps de mercado
```

---

## ETAPA 1 — PRODUTO E EMPRESA

### O que o usuário fornece manualmente

| Informação | Por que é manual |
|---|---|
| O que vende (produto/serviço) | Só o dono sabe descrever com precisão |
| Qual problema resolve | Visão interna que dados não capturam |
| Diferencial percebido | Percepção do fundador (será validada depois) |
| Preço / faixas de preço | Dado interno |
| Tempo de mercado | Dado interno |
| Região de atuação | Dado interno |
| Cliente que recusaria (anti-persona) | Experiência pessoal |

### O que a IA pesquisa nesta etapa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Tamanho e crescimento do setor | SEBRAE, Statista, relatórios setoriais | Contexto de mercado: o setor está crescendo ou encolhendo? |
| Principais players do mercado | Web search, SimilarWeb | Quem são os concorrentes diretos e indiretos |
| Modelo de negócio predominante | Sites dos concorrentes | Como o mercado cobra, entrega e se posiciona |
| Notícias recentes do setor | Web search com filtro temporal | Eventos, regulações ou mudanças que afetam o mercado |

### Por que pesquisar AQUI

A IA precisa de contexto setorial para fazer sugestões inteligentes
nas etapas seguintes. Se ela sabe que o setor de "gestão de tráfego"
está saturado e com margens caindo, isso muda completamente as
sugestões de posicionamento lá na Etapa 6.

### Como os dados desta etapa alimentam as próximas

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Tamanho do mercado               → Etapa 6 (oportunidade de posicionamento)
Lista de concorrentes            → Etapa 5 (pesquisa de dores no Reclame Aqui)
                                 → Etapa 6 (análise de anúncios na Ad Library)
Modelo de negócio do setor       → Etapa 6 (precificação e diferenciação)
Notícias e tendências            → Etapa 3 (contexto cultural atual)
```

---

## ETAPA 2 — PÚBLICO-ALVO

### O que o usuário fornece manualmente

| Informação | Por que é manual |
|---|---|
| Quem é o cliente atual (se já vende) | Experiência direta |
| Faixa etária estimada | Observação ou dados de analytics |
| Gênero predominante | Observação ou dados de analytics |
| Onde os clientes estão (geografia) | Dados de venda / analytics |
| Dados de Analytics, CRM, Instagram Insights | Dados proprietários que a IA não acessa |

> **Nota importante:** Se o usuário tem Google Analytics, Instagram
> Insights ou CRM, esses dados são MAIS VALIOSOS que qualquer pesquisa
> externa. A IA deve sempre perguntar se existem antes de pesquisar.

### O que a IA pesquisa nesta etapa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Dados demográficos do setor | IBGE (PNAD, POF), SEBRAE | Renda média, escolaridade, estrutura familiar da faixa informada |
| Comportamento de busca | Google Trends, autocompletar | O que esse público pesquisa, sazonalidade, linguagem |
| Perguntas frequentes do público | Google "People Also Ask", Answer The Public | Dúvidas reais organizadas por tipo |
| Hábitos digitais por faixa etária | DataReportal, We Are Social | Redes usadas, tempo de tela, formatos consumidos |

### Por que pesquisar AQUI

Com a faixa etária + região + nicho, a IA consegue cruzar dados do
IBGE para dar profundidade demográfica que o usuário provavelmente
não tem. E o comportamento de busca revela a LINGUAGEM REAL do
público — essencial para todas as etapas seguintes.

### Como os dados desta etapa alimentam as próximas

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Renda média por faixa/região     → Etapa 3 (classe social de origem, valores)
                                 → Etapa 6 (faixas de preço aceitáveis)
Termos de busca + linguagem      → Etapa 5 (palavras exatas para descrever dores)
                                 → Etapa 6 (copy e comunicação)
Perguntas frequentes             → Etapa 5 (mapeamento de dores e desejos)
Hábitos digitais                 → Etapa 4 (rotina da persona)
                                 → Etapa 6 (canal prioritário)
```

---

## ETAPA 3 — PERFIL PSICOGRÁFICO E CULTURAL

### O que o usuário fornece manualmente

| Informação | Por que é manual |
|---|---|
| Impressão sobre valores do público | Percepção da convivência |
| Nível de conservadorismo/progressismo | Observação direta |
| Tipo de conteúdo que o público consome | Experiência com engajamento |
| Objeções que escuta em vendas | Dado qualitativo direto |

### O que a IA pesquisa/infere nesta etapa

| Pesquisa/Inferência | Fontes | O que extrai |
|---|---|---|
| Contexto geracional | Base de conhecimento do LLM + faixa etária | Eventos históricos formativos, cultura consumida, narrativas da época |
| Cultura de mídia por geração | Base de conhecimento do LLM | O que assistiu, ouviu, leu na formação (10-25 anos) |
| Valores por classe social e região | Pesquisas sociológicas, IBGE, estudos acadêmicos | Crenças sobre dinheiro, trabalho, sucesso |
| Tendências culturais atuais que afetam o público | Web search de tendências comportamentais | Mudanças de valores em curso |

### Por que pesquisar AQUI

Esta é a etapa onde a IA agrega MAIS VALOR. O usuário raramente
sabe responder "quais vieses cognitivos dominam meu público" ou
"que eventos históricos moldaram os valores dessa geração". Mas
o LLM, com a faixa etária + classe social + região, consegue
reconstruir o contexto formativo com alta precisão.

### Como os dados desta etapa alimentam as próximas

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Valores centrais da persona      → Etapa 5 (hierarquia de desejos)
                                 → Etapa 6 (o que justifica preço alto)
Vieses cognitivos dominantes     → Etapa 5 (como enquadrar dores)
                                 → Etapa 6 (estrutura de argumentação)
Relação com autoridade           → Etapa 6 (tipo de prova social)
Relação com risco                → Etapa 6 (garantias e mitigação de medo)
Estilo de comunicação            → Etapa 6 (tom de voz, formato de conteúdo)
```

> **Diferencial desta etapa:** Aqui, em vez de buscar na web,
> a IA usa sua própria base de conhecimento sobre história, cultura,
> psicologia e sociologia. É mais inferência contextual do que pesquisa
> de dados. O LLM funciona como um "antropólogo digital" que cruza
> informações demográficas com conhecimento cultural.

---

## ETAPA 4 — CONSTRUÇÃO DA PERSONA

### O que o usuário fornece manualmente

| Informação | Por que é manual |
|---|---|
| Nome fictício e "foto mental" | Exercício criativo do dono |
| Frase que a persona diria | Captura a essência emocional |
| Rotina de um dia comum | Observação real dos clientes |
| Frustrações que já ouviu | Conversas reais com clientes |
| O que já tentou que não funcionou | Relato dos clientes |

### O que a IA pesquisa nesta etapa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Dores reais expressas pelo público | Reclame Aqui (concorrentes mapeados na Etapa 1) | Reclamações reais com linguagem do cliente |
| Frustrações com soluções existentes | Reviews 1-3 estrelas no Google | O que o mercado entrega mal |
| O que encanta nos concorrentes | Reviews 4-5 estrelas no Google | Desejos atendidos = expectativas do público |
| Discussões espontâneas do público | Reddit, fóruns, grupos | Dores e desejos sem filtro de marketing |
| Comentários em conteúdo do nicho | YouTube (vídeos relevantes) | Linguagem, dúvidas, nível de consciência |

### Por que pesquisar AQUI

Na Etapa 4, a persona já tem esqueleto (demografia, psicografia,
valores). Agora a IA pesquisa dados QUALITATIVOS para dar carne
ao esqueleto. A pesquisa no Reclame Aqui e em reviews é cirúrgica
porque a IA já sabe QUEM é a persona e QUAIS concorrentes buscar
(dados das Etapas 1 e 2).

### Como os dados desta etapa alimentam as próximas

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Palavras exatas das reclamações  → Etapa 5 (linguagem de dor validada)
                                 → Etapa 6 (hooks de anúncio e copy)
Padrões de frustração            → Etapa 5 (hierarquia de dor)
O que encanta nos concorrentes   → Etapa 5 (desejos confirmados)
                                 → Etapa 6 (standard mínimo de entrega)
Discussões em fóruns             → Etapa 5 (dores ocultas, vergonhas)
```

---

## ETAPA 5 — DORES E DESEJOS

### O que o usuário fornece manualmente

| Informação | Por que é manual |
|---|---|
| Hierarquia de dores (qual é a pior) | Experiência direta com clientes |
| Qual dor, quando resolvida, gera indicação | Percepção qualitativa do dono |
| Desejos declarados dos clientes | O que pedem diretamente |
| Cenário ideal do cliente (12 meses) | Conversas e intuição |

### O que a IA pesquisa nesta etapa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Dores por nível de consciência | Análise dos termos de busca (Etapa 2) cruzados com reclamações (Etapa 4) | Classifica dores por urgência e sofisticação |
| Desejos aspiracionais do público | Perfis de influenciadores do nicho, conteúdo aspiracional | O que o público admira e quer para si |
| Análise emocional das reclamações | Reclame Aqui, reviews (já coletados na Etapa 4) | Tom emocional predominante: raiva, frustração, decepção, medo |
| Custo da inação | Pesquisas de mercado, dados do setor | O que acontece com quem NÃO resolve o problema |

### Por que pesquisar AQUI

Nesta etapa a IA não precisa buscar dados novos — ela REPROCESSA
dados já coletados com uma lente diferente. Os reviews e reclamações
da Etapa 4 são reanalisados agora sob a ótica de hierarquia de dor
e camadas de desejo. É análise, não pesquisa.

### Como os dados desta etapa alimentam a próxima

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Hierarquia de dores confirmada   → Etapa 6 (promessa central)
Desejos em 3 camadas             → Etapa 6 (proposta de valor)
Tom emocional do público         → Etapa 6 (tom de comunicação)
Custo da inação                  → Etapa 6 (argumento de urgência)
```

> **Nota sobre eficiência:** Na Etapa 5 a IA quase não faz
> buscas novas. Ela analisa o que já tem. Isso é intencional —
> evita redundância e mantém o fluxo ágil.

---

## ETAPA 6 — POSICIONAMENTO E VALOR

### O que o usuário fornece manualmente

| Informação | Por que é manual |
|---|---|
| Diferenciais comprováveis | Só o dono sabe o que realmente entrega |
| Crença forte do negócio (stake in the ground) | Posicionamento é decisão, não dado |
| Promessa central | Definição estratégica do dono |
| Metáfora do serviço | Exercício criativo |

### O que a IA pesquisa nesta etapa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Anúncios ativos dos concorrentes | Meta Ad Library (concorrentes da Etapa 1) | Ângulos de venda, hooks, ofertas, formatos |
| Posicionamento dos concorrentes | Sites, landing pages, redes sociais | Como se apresentam, que promessa fazem |
| Gaps de mercado | Cruzamento: dores (Etapa 5) × o que concorrentes oferecem (pesquisa) | O que o público quer mas ninguém entrega bem |
| Benchmarks de preço | Sites dos concorrentes, pesquisa de mercado | Faixas de preço praticadas no mercado |
| Tipo de prova social que funciona no nicho | Análise dos anúncios e landing pages | Cases, números, depoimentos, antes/depois |

### Por que pesquisar AQUI

A pesquisa competitiva faz mais sentido aqui — e não no início —
porque agora a IA sabe exatamente O QUE procurar. Ela não está
fazendo uma análise competitiva genérica. Ela está buscando:
"Dado que a dor principal é X e o desejo é Y, como os concorrentes
estão endereçando isso? Onde estão falhando?"

### Output final desta etapa

O cruzamento de tudo gera as recomendações estratégicas finais:
- Tom de comunicação ideal (validado por dados)
- Tipo de prova social mais eficaz (baseado no que funciona no setor)
- Gaps de posicionamento (onde ninguém atua bem)
- Estrutura de oferta (baseada em dores e desejos hierarquizados)

---

## RESUMO: MANUAL × IA POR ETAPA

| Etapa | Manual (usuário) | IA pesquisa | IA infere/analisa |
|---|---|---|---|
| 1. Produto | ████████░░ 80% | ██░░░░░░░░ 20% | — |
| 2. Público | ██████░░░░ 60% | ████░░░░░░ 40% | — |
| 3. Psicográfico | ███░░░░░░░ 30% | ██░░░░░░░░ 20% | █████░░░░░ 50% |
| 4. Persona | █████░░░░░ 50% | ████░░░░░░ 40% | █░░░░░░░░░ 10% |
| 5. Dores/Desejos | ████░░░░░░ 40% | ██░░░░░░░░ 20% | ████░░░░░░ 40% |
| 6. Posicionamento | █████░░░░░ 50% | ████░░░░░░ 40% | █░░░░░░░░░ 10% |

**Legenda:**
- **Manual** = Só o usuário pode fornecer (experiência, decisão, dados internos)
- **IA pesquisa** = Busca ativa em fontes externas (web search, bases de dados)
- **IA infere/analisa** = Cruza dados já coletados para gerar insights novos

---

## SKILLS ESPECIALIZADAS SUGERIDAS

Cada tipo de pesquisa pode ser uma skill dedicada que é acionada
no momento certo do fluxo:

### Skill 1: Pesquisa Setorial
```
Quando aciona:  Etapa 1 (após o usuário definir o produto/nicho)
Input:          Nicho + região + tipo de produto
O que faz:      Busca tamanho de mercado, crescimento, players,
                notícias recentes, modelo de negócio predominante
Fontes:         SEBRAE, Statista, relatórios setoriais, web search
Output:         Briefing setorial com fontes citadas
```

### Skill 2: Pesquisa Demográfica
```
Quando aciona:  Etapa 2 (após o usuário informar faixa etária + região)
Input:          Faixa etária + região + classe social estimada
O que faz:      Busca dados do IBGE, hábitos digitais, comportamento
                de consumo por faixa
Fontes:         IBGE (PNAD, POF), DataReportal, pesquisas de mercado
Output:         Perfil demográfico enriquecido com dados reais
```

### Skill 3: Pesquisa de Comportamento de Busca
```
Quando aciona:  Etapa 2 (em paralelo com a Skill 2)
Input:          Nicho + problema principal + termos do setor
O que faz:      Mapeia termos de busca, perguntas frequentes,
                sazonalidade, linguagem do público
Fontes:         Google Trends, autocompletar, Answer The Public
Output:         Mapa de linguagem e perguntas do público
```

### Skill 4: Análise Qualitativa de Audiência
```
Quando aciona:  Etapa 4 (após definir concorrentes + persona básica)
Input:          Lista de concorrentes + perfil da persona
O que faz:      Coleta e analisa reclamações, reviews, discussões
                em fóruns, comentários em vídeos do nicho
Fontes:         Reclame Aqui, Google Reviews, Reddit, YouTube
Output:         Relatório de dores e desejos com citações reais
```

### Skill 5: Análise Competitiva de Posicionamento
```
Quando aciona:  Etapa 6 (após dores e desejos mapeados)
Input:          Concorrentes + dores + desejos + valores da persona
O que faz:      Analisa anúncios ativos, landing pages,
                posicionamento, preços, tipo de prova social
Fontes:         Meta Ad Library, sites dos concorrentes, SimilarWeb
Output:         Mapa competitivo com gaps e oportunidades
```

### Skill 6: Inferência Psicográfica (sem pesquisa externa)
```
Quando aciona:  Etapa 3 (após dados demográficos confirmados)
Input:          Faixa etária + classe social + região + escolaridade
O que faz:      Usa a base de conhecimento do LLM para reconstruir
                contexto geracional, valores, vieses cognitivos,
                cultura consumida, relação com autoridade e risco
Fontes:         Base de conhecimento do LLM (não faz web search)
Output:         Perfil psicográfico como hipótese estruturada
```

---

## FLUXO COMPLETO COM SKILLS ATIVADAS

```
USUÁRIO INFORMA: Produto + Nicho + Região
        │
        ▼
   ┌─────────────────────┐
   │   ETAPA 1: Produto   │ ← Perguntas manuais ao usuário
   │                       │ ← 🔍 Skill 1: Pesquisa Setorial
   └──────────┬────────────┘
              │ Contexto de mercado adquirido
              ▼
   ┌─────────────────────┐
   │  ETAPA 2: Público    │ ← Perguntas manuais ao usuário
   │                       │ ← 🔍 Skill 2: Pesquisa Demográfica
   │                       │ ← 🔍 Skill 3: Comportamento de Busca
   └──────────┬────────────┘
              │ Demografia + linguagem confirmadas
              ▼
   ┌─────────────────────┐
   │  ETAPA 3: Psico      │ ← Perguntas manuais (poucas)
   │                       │ ← 🧠 Skill 6: Inferência Psicográfica
   └──────────┬────────────┘
              │ Valores + vieses + perfil cognitivo
              ▼
   ┌─────────────────────┐
   │  ETAPA 4: Persona    │ ← Perguntas manuais ao usuário
   │                       │ ← 🔍 Skill 4: Análise Qualitativa
   └──────────┬────────────┘
              │ Persona completa + voz do cliente real
              ▼
   ┌─────────────────────┐
   │  ETAPA 5: Dores e    │ ← Perguntas manuais (priorização)
   │  Desejos             │ ← 🧠 Reanálise dos dados das Etapas 2+4
   └──────────┬────────────┘
              │ Dores e desejos hierarquizados
              ▼
   ┌─────────────────────┐
   │  ETAPA 6: Posiciona- │ ← Perguntas manuais (decisões)
   │  mento e Valor        │ ← 🔍 Skill 5: Análise Competitiva
   └──────────┬────────────┘
              │
              ▼
        SÍNTESE FINAL
        Documento consolidado com marcadores ✅ 🔶 ⚪
```

---

## REGRA DE OURO PARA O LLM

A cada transição de etapa, o LLM deve:

1. **Resumir** o que foi definido até aqui
2. **Mostrar** quais dados são confirmados (✅) e quais são hipóteses (⚪)
3. **Perguntar** se o usuário tem dados internos antes de pesquisar
4. **Pesquisar** apenas o que o usuário não tem
5. **Apresentar** resultados da pesquisa de forma acionável
6. **Perguntar** se os dados batem com a realidade do usuário
7. **Seguir** para a próxima etapa com o contexto atualizado