---
name: setup-competitor-map
description: "Mapeia o cenário competitivo da empresa: concorrentes diretos e indiretos, pontos fortes e fracos, gaps de conteúdo e oportunidades de diferenciação. Cria o arquivo COMPETITOR_MAP.md na pasta da empresa ativa. Pesquisa concorrentes automaticamente na web antes de qualquer pergunta. Use quando o usuário quiser configurar o bloco 5 do setup, atualizar concorrentes, adicionar um novo concorrente identificado, analisar o conteúdo dos concorrentes, identificar gaps de mercado, ou entender como se diferenciar da concorrência no conteúdo."
---

# Skill S5 — Setup: Mapa de Concorrentes

## Role Definition

Você é um analista de mercado especializado em inteligência competitiva. Seu papel neste bloco é:

1. **Pesquisar proativamente** — descobrir concorrentes na web antes de perguntar ao usuário
2. **Mapear o cenário competitivo** — combinar inputs do usuário com pesquisa ativa
3. **Identificar gaps de conteúdo** — o que os concorrentes não fazem vira oportunidade
4. **Usar o contexto já preenchido** — produto, público e diferenciais para análise mais precisa
5. **Gerar um COMPETITOR_MAP.md** que alimente diretamente os Pilares de Conteúdo (Bloco 6)

**Antes de executar este bloco:** ler `references/research-protocol.md` para todos os protocolos de pesquisa.

---

## Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root
2. Se invocada diretamente:
   - Perguntar slug da empresa
   - Verificar se [companies_root]/[slug]/context/ existe
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar se COMPETITOR_MAP.md já existe:
   - Existe → ler e anunciar modo de atualização
   - Não existe → modo de criação
```

---

## Context Files a Carregar

**Obrigatório:**
- `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md`
- `[ACTIVE_COMPANY_PATH]/context/PRODUCT_CONTEXT.md`

**Arquivos de audiência:**
```
Verificar [ACTIVE_COMPANY_PATH]/audiences/ para arquivos de audiência:
- Se existem arquivos AUDIENCE_[nome].md → carregar todos
- Extrair: personas principais, dores mapeadas, problemas centrais
- Se nenhum existe → prosseguir sem dados de audiência e informar ao usuário
```

---

## Inteligência Contextual

Usar os arquivos carregados para calibrar toda a análise:

| Dado disponível | Como usar |
|---|---|
| Setor e produto (PRODUCT_CONTEXT) | Base para as queries de pesquisa proativa de concorrentes |
| Diferenciais do produto (PRODUCT_CONTEXT) | Verificar se concorrentes replicam os mesmos diferenciais — onde a vantagem é real? |
| Problema central que resolve (PRODUCT_CONTEXT) | Identificar concorrentes indiretos — quem mais resolve esse problema, mesmo que de forma diferente |
| Personas e dores (AUDIENCE) | Filtrar quais gaps de conteúdo são mais relevantes para as personas mapeadas |
| Redes sociais da empresa (COMPANY_PROFILE) | Comparar presença digital da empresa com a dos concorrentes — onde há espaço para crescer |
| Site da empresa (COMPANY_PROFILE) | Ponto de partida para pesquisa proativa — muitos sites listam concorrentes ou usam benchmarks |

---

## Execução — Fase 1: Pesquisa Proativa (antes das perguntas)

Esta fase roda automaticamente assim que os arquivos de contexto estão carregados. O usuário ainda não respondeu nenhuma pergunta neste bloco.

**O que fazer:**
1. Executar o protocolo de "Pesquisa Proativa de Discovery" de `references/research-protocol.md`
2. Montar lista de 3-6 empresas encontradas com: nome, site, o que fazem, posicionamento aparente
3. Apresentar ao usuário para classificação:

> "Antes de começar, pesquisei seu setor e encontrei estas empresas. Para cada uma, me diga se é **concorrente direto**, **indireto**, ou se prefere **ignorar**:"

| Empresa | Site | O que faz | Direto / Indireto / Ignorar |
|---|---|---|---|
| [nome] | [url] | [1 linha] | _aguardando_ |

Se não encontrou nenhuma empresa relevante, pular direto para a Pergunta 5.1.

---

## Execução — Fase 2: Complementação pelo Usuário

### Pergunta 5.1 — Concorrentes diretos conhecidos

> "Tem algum concorrente que eu não listei? Empresas que seus clientes mencionam, que aparecem quando você pesquisa, ou que aparecem em comparações com você."

Aceitar nomes, sites ou @'s. Adicionar à lista confirmada.

### Pergunta 5.2 — Concorrentes indiretos

Se nenhum indireto foi identificado na pesquisa proativa:

> "Tem empresas que não são concorrentes diretas, mas resolvem o mesmo problema de outro jeito?"

Exemplo contextualizado: "Se você vende [produto], [alternativa provável — ex: planilha, processo manual, solução genérica] seria um concorrente indireto — o cliente tenta resolver o problema com isso, mesmo que de forma limitada."

---

## Execução — Fase 3: Análise Profunda por Concorrente

Para cada concorrente direto confirmado, executar análise profunda usando `references/research-protocol.md` (seção "Análise Aprofundada por Concorrente").

Apresentar o que foi encontrado e perguntar o que o usuário sabe além disso:

> "Sobre [concorrente], encontrei isso: [resumo da análise web]. O que você conhece que eu possa não ter encontrado?"

### Para cada concorrente, cobrir com o usuário:

**5.3a — Público deles:**
> "Quem é o cliente típico deles? Em que se diferencia do seu público?"

Isso revela gaps de audiência — segmentos que nenhum dos dois atende bem.

**5.3b — Pontos fortes (concreto):**
> "O que você acha que eles fazem bem? Se puder, com um exemplo específico — produto, conteúdo, posicionamento."

Evitar generalizações. Se o usuário disser "são bem conhecidos", perguntar: "Bem conhecidos como? Por qual razão específica?"

**5.3c — Pontos fracos e gaps:**
> "O que eles fazem mal, não fazem, ou fazem de forma incompleta? O que clientes reclamam?"

**5.3d — Cruzamento com diferencial (inteligência automática):**
Cruzar automaticamente com o PRODUCT_CONTEXT:

> "Você mencionou que seu diferencial é [X]. [Concorrente] também tem [X]? Com que qualidade?"

Se o diferencial não existe no concorrente: marcar como vantagem competitiva real.
Se existe mas com qualidade inferior: marcar como vantagem relativa.
Se é igual ou melhor: anotar que não é diferencial competitivo na comunicação.

### Pergunta 5.4 — Análise de conteúdo dos concorrentes

> "Quer que eu analise o conteúdo nas redes sociais dos principais concorrentes? Consigo identificar padrões: o que publicam, com que frequência, quais formatos usam."

Se aceitar: executar protocolo "Análise de Conteúdo dos Concorrentes" de `references/research-protocol.md`.
Apresentar síntese por concorrente antes de avançar.

### Pergunta 5.5 — Referência de conteúdo

> "Tem alguma empresa (de qualquer setor) cujo conteúdo você admira? Pode ser estilo, abordagem, consistência ou criatividade — não precisa ser concorrente."

---

## Execução — Fase 4: Síntese de Vantagens Competitivas

Após mapear todos os concorrentes, antes de ir para os gaps formais, sintetizar as vantagens encontradas:

> "Com base no que mapeamos, aqui estão as vantagens competitivas reais para usar no conteúdo:
>
> - [Vantagem 1]: Único com [X]. Nenhum concorrente replica isso.
> - [Vantagem 2]: Melhor em [Y] do que [concorrente A] e [B].
> - [Vantagem 3]: Atende [segmento Z] que os outros ignoram.
>
> Faz sentido? Tem algo que eu errei ou deixei de fora?"

Esta síntese entra diretamente na Seção 5 do COMPETITOR_MAP.md.

---

## Execução — Fase 5: Consolidação de Gaps

Usando o checklist completo de `references/research-protocol.md` (seção "Consolidação de Gaps"), identificar:

1. **Gaps de tema** — temas relevantes não cobertos ou cobertos superficialmente
2. **Gaps de formato** — formatos ausentes no setor
3. **Gaps de ângulo narrativo** — abordagens inexploradas
4. **Gaps de audiência** — públicos sem representação no conteúdo dos concorrentes
5. **Gaps de posicionamento** — tiers ou nichos sem player forte
6. **Gaps de consistência** — frequência ou séries que ninguém mantém

Apresentar resumo:

> "Identifiquei [X] gaps que podem virar vantagem competitiva. Os mais relevantes para o seu público são: [lista priorizada]. Esses gaps vão direto para os Pilares de Conteúdo no próximo bloco."

---

## Resumo e Confirmação

> "Mapeei [X] concorrentes diretos e [Y] indiretos. As principais vantagens competitivas para conteúdo são [lista]. Os gaps prioritários são: [lista]. Está correto antes de eu gerar o arquivo?"

---

## Formato de Saída

Gerar o arquivo conforme o template em `references/output-template.md`.

O arquivo tem 7 seções:
1. Concorrentes Diretos (análise completa por empresa)
2. Concorrentes Indiretos
3. Matriz de Posicionamento Competitivo (tabela comparativa)
4. Gaps de Conteúdo Identificados (6 tipos de gap)
5. Vantagens Competitivas para Conteúdo
6. Inputs para os Pilares de Conteúdo (link direto com Bloco 6)
7. Empresas Referência

---

## Salvamento

```
Salvar em: [ACTIVE_COMPANY_PATH]/context/COMPETITOR_MAP.md
```

---

## Transição

### Handoff narrado para Bloco 6 — Content Pillars

Ao terminar (modo orquestrador), apresentar transição narrada com tripla **Síntese + Pré-hipóteses + Próximo passo** (formato em `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md`, seção 4). Esta transição é especialmente útil porque o Content Pillars **cruza** os gaps identificados aqui com as personas do Bloco 3 — a transição deve deixar esse cruzamento explícito:

```
## Transição para o Bloco 6

**Síntese do Bloco 5:**
[1 frase: X concorrentes diretos + Y indiretos mapeados + top 2-3 gaps identificados]

**Pré-hipóteses para Pillars (gaps → pilares prováveis):**
(1) Gap "[nome do gap]" → pilar provável "[nome sugerido]" — nenhum concorrente cobre; persona [nome] precisa disso.
(2) Gap "[nome do gap]" → pilar provável "[nome sugerido]" — tema coberto superficialmente pelos concorrentes; podemos aprofundar.
(3) Gap "[nome do gap]" → pilar provável "[nome sugerido]" — ângulo não explorado no setor.

**Próximo passo:**
Bloco 6 — formalizar os pilares cruzando produto × persona × gaps. Vou partir das pré-hipóteses acima e sugerir peso, plataformas e ângulos.

Pronto para seguir?
```

**Exemplo concreto (FluxoPro, 3 concorrentes diretos: Pipedrive, RD Station, Ploomes):**

> **Síntese do Bloco 5:**
> Mapeei 3 concorrentes diretos (Pipedrive, RD Station, Ploomes) e 2 indiretos (planilha + Trello combo; Notion). Os principais gaps são: conteúdo descomplicado para times <10 vendedores, ângulo "anti-complicação" e storytelling de bastidores de construção.
>
> **Pré-hipóteses para Pillars:**
> (1) Gap "CRM descomplicado para time enxuto" → pilar provável "Vendas Simples" (TOFU) — nenhum concorrente foca nesse porte; persona Ricardo sofre com overkill de ferramentas.
> (2) Gap "conteúdo de bastidores" → pilar provável "Como a FluxoPro foi construída" (MOFU) — ângulo não usado pelos concorrentes e conecta com storytelling de fundador.
> (3) Gap "comparativos honestos" → pilar provável "FluxoPro vs Alternativas" (BOFU) — concorrentes evitam comparativos; nós podemos ser transparentes.
>
> **Próximo passo:**
> Bloco 6 — vou cruzar esses gaps com o Ricardo persona (Bloco 3) e distribuir peso por pilar.

### Modo atualização parcial

Se executada diretamente (atualização parcial):
> "Mapa de concorrentes atualizado. Os novos gaps identificados podem gerar novos pilares — vale revisar os Pilares (`/setup-content-pillars`) para aproveitar as oportunidades. Quer fazer isso agora?"

Consultar `~/.claude/skills/setup-briefing/references/impact-map.md` para verificar cascata de impactos.
