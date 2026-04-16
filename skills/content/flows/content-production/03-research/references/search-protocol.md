# Protocolo de Busca por Camada

> Consultar durante o beat **Research** (passo 2 do fluxo) para construir queries antes de buscar, não depois.
> Este arquivo detalha as estratégias de busca para cada uma das 5 camadas de pesquisa da Skill 03.

---

## Operadores e Técnicas de Busca

Antes das queries por camada, dominar estes operadores muda o resultado da pesquisa.

### Operadores Booleanos e de Busca

| Operador | Função | Exemplo |
|---|---|---|
| `"aspas"` | Buscar frase exata | `"taxa de churn" SaaS Brasil` |
| `site:` | Buscar dentro de um domínio específico | `site:hbr.org employee engagement productivity` |
| `filetype:pdf` | Buscar documentos em formato específico | `filetype:pdf "pesquisa de vendas" Brasil 2024` |
| `-palavra` | Excluir termo da busca | `produtividade equipe -home office` |
| `OR` | Buscar um termo OU outro | `"small business" OR PME CRM adoption` |
| `*` (asterisco) | Curinga para palavras desconhecidas | `"* percent of salespeople use CRM"` |
| `before:AAAA-MM-DD` | Resultados antes de uma data | `churn rate SaaS before:2023-01-01` |
| `after:AAAA-MM-DD` | Resultados após uma data | `remote work productivity after:2023-01-01` |
| `intitle:` | Buscar no título da página | `intitle:"state of sales" 2024` |

### Técnicas de Refinamento

**Busca em inglês para dados internacionais:** A maioria das pesquisas de tier 1–3 são publicadas em inglês. Quando não encontrar dado em português, buscar em inglês e sinalizar como referência internacional.

**Ir à fonte primária:** Quando encontrar uma estatística citada em um artigo, procurar sempre a pesquisa original. Use a query: `[dado encontrado] original study source filetype:pdf` ou busque diretamente no domínio da fonte citada.

**Busca negativa para filtrar conteúdo raso:** Adicione `-tips -dicas -"5 formas"` para filtrar artigos de blog genérico e encontrar fontes mais substanciais.

**Google Scholar para acadêmico:** scholar.google.com para papers e meta-análises. Use filtros de data e cite as métricas de citação como indicador de relevância.

---

## Queries por Camada

---

### Camada 1 — Dados e Estatísticas

**Objetivo:** Encontrar números que dimensionem ou provem o problema descrito no ângulo da ideia.

**Templates de query:**

```
"[tema]" statistics 2023 OR 2024 site:gartner.com OR site:mckinsey.com OR site:hbr.org
"[tema]" survey report 2024 filetype:pdf
"[tema]" data trends "[mercado-alvo]" -tips -"how to"
"[problema específico]" cost percentage companies
"[comportamento da persona]" percent survey research
pesquisa "[tema]" site:sebrae.com.br OR site:endeavor.org.br OR site:fgv.br
"[tema]" estatísticas site:ibge.gov.br OR site:ipea.gov.br
estado de [área] relatório 2024 Brasil
"[métrica relevante]" benchmark "[setor]" 2023 OR 2024
```

**Plataformas a consultar:**
- Google (com operadores acima)
- Google Scholar (scholar.google.com)
- Statista.com — dados compilados por tema
- Gartner.com/research (relatórios públicos)
- Sebrae.com.br/pesquisas
- IBGE.gov.br
- Endeavor.org.br/pesquisas

**Sinal de dado de qualidade:** Tem percentual ou número específico + metodologia descrita (amostra, data, região) + nome da pesquisa/instituto.

---

### Camada 2 — Cases e Exemplos

**Objetivo:** Encontrar histórias reais com resultados mensuráveis que ilustrem o tema.

**Templates de query:**

```
"[tema/problema]" case study results "[métrica de resultado]"
"[tema]" example company increased "[resultado]" percent
"[solução/abordagem]" before after results
"[tema]" success story ROI site:hubspot.com OR site:salesforce.com
"[problema]" resolved how company "[resultado]"
"[tema]" empresa brasileira resultado case
"[setor]" empresa case study "[métrica]" redução OR aumento
"[tema]" implementou conseguiu OR alcançou resultado
```

**Plataformas a consultar:**
- HubSpot Case Studies (hubspot.com/case-studies)
- Salesforce Customer Stories
- G2.com e Capterra (reviews com resultados específicos)
- YouTube — buscar por "[empresa + tema + resultados]" para palestras e webinars com cases
- SlideShare — apresentações de conferências frequentemente contêm cases internos

**Sinal de case de qualidade:** Empresa nomeada (ou descrita com contexto suficiente) + situação antes + ação realizada + resultado específico (não apenas "melhorou").

---

### Camada 3 — Citações de Autoridade

**Objetivo:** Encontrar afirmações de especialistas reconhecidos que fortaleçam o argumento.

**Templates de query:**

```
"[especialista do setor]" quote "[tema]"
"[autor do livro de referência]" on "[tema]"
"[tema]" said expert researcher study
"[tema]" "according to" researcher OR professor OR author
"[tema]" palestra RD Summit OR SaaStr OR TED
"[tema]" entrevista especialista "[veículo de referência]"
site:linkedin.com "[nome do especialista]" "[tema]"
"[livro de referência]" chapter "[tema relacionado]"
```

**Plataformas a consultar:**
- LinkedIn (posts de especialistas reconhecidos)
- YouTube — palestras de conferências (TED, RD Summit, SaaStr, Web Summit)
- Goodreads e Amazon — trechos de livros de referência
- Podcasts relevantes do setor (buscar no Google por transcrições)
- Twitter/X — buscar por especialistas do tema com filtro de engajamento alto

**Sinal de citação de qualidade:** Especialista identificável com credencial + frase que vai além do óbvio + contexto de onde foi dita (livro, palestra, entrevista).

**Importante:** Verificar se a citação é real antes de usar. Citações atribuídas erroneamente são comuns online. Buscar a fonte original.

---

### Camada 4 — Contra-Argumentos e Objeções

**Objetivo:** Encontrar o "outro lado" do argumento — o que pessoas resistentes diriam, e o que os dados indicam sobre falhas ou limitações da abordagem.

**Templates de query:**

```
"[solução/abordagem]" doesn't work criticism
"[solução/abordagem]" failed why problems
"[solução/abordagem]" limitations drawbacks
"[tema]" challenges obstacles companies face
against "[solução/abordagem]" argument counterpoint
"[tema]" critique academic OR research
"[solução]" falhou fracassou OR não funcionou porque
reddit "[tema]" problems OR issues OR "doesn't work"
"[tema]" contras desvantagens desafios
```

**Plataformas a consultar:**
- Reddit — fóruns de profissionais do setor (r/sales, r/marketing, r/entrepreneur)
- Quora — perguntas sobre falhas e problemas
- AUDIENCE_PROFILES.md — objeções já documentadas da persona
- Reviews negativos em G2.com e Capterra (para entender frustrações reais)
- Comentários em posts virais sobre o tema (no LinkedIn e Instagram)

**Uso no conteúdo:** Contra-argumentos fortalecem o conteúdo ao mostrar que a empresa conhece as críticas e as responde — não os ignore. Incluir no output a objeção E a resposta.

---

### Camada 5 — Gaps de Conteúdo

**Objetivo:** Identificar o que NÃO está sendo dito sobre o tema — ângulos inexplorados ou mal cobertos.

**Templates de query:**

```
"[tema]" -tips -dicas -"how to" -"5 ways" research analysis
"[tema]" nuanced OR "it's complicated" OR "actually"
"[tema]" nobody talks about OR overlooked OR underrated
"[tema]" myth debunked OR misconception
"[tema]" original perspective 2024
site:[domínio do concorrente A] "[tema]"
site:[domínio do concorrente B] "[tema]"
```

**Processo de identificação de gaps:**

1. Listar os títulos dos top 10 resultados para o tema principal
2. Identificar o padrão de cobertura (o que todo mundo cobre)
3. Cruzar com `COMPETITOR_MAP.md` — o que os concorrentes publicaram sobre o tema
4. Identificar o que está faltando: perspectiva diferente, dado mais recente, ângulo específico para a persona, contra-argumento não explorado
5. Registrar o gap como "Ângulo original possível: [descrição]"

**Sinal de gap de qualidade:** Algo que é verdade e relevante para a persona, mas que as 10 primeiras páginas de resultado não cobrem.

---

## Roteiro de Pesquisa por Profundidade

### Pesquisa Rápida (15–20 min)

Executar camadas 1, 2 e 5 com mínimo aceitável:
- 3–5 dados verificáveis (Camada 1)
- 1 case com resultado específico (Camada 2)
- 1 ângulo original identificado (Camada 5)

Usar queries diretas sem muita iteração. Priorizar tier 2–3 para velocidade.

### Pesquisa Completa (45–60 min)

Executar todas as 5 camadas com profundidade:
- 5–8 dados verificáveis de tiers variados
- 2–3 cases com resultados específicos
- 2 citações de autoridade atribuíveis
- 2–3 objeções com respostas
- 1–2 ângulos originais identificados

Iterar as queries — se a primeira não encontrar, tentar versão em inglês, trocar o operador, ou buscar no domínio específico.

---

## Erros Comuns na Pesquisa de Conteúdo

**1. Usar o dado que aparece primeiro, não o melhor**
O primeiro resultado no Google frequentemente é o mais otimizado para SEO, não o mais confiável. Sempre verificar tier e fonte original.

**2. Confundir correlação com causalidade em dados**
"Empresas que usam X têm Y% mais resultado" pode ser correlação (empresas que usam X já eram melhores). Sinalizar quando o dado não prova causalidade.

**3. Extrapolar dados de contexto diferente**
Dado americano sobre PMEs pode não se aplicar ao mercado brasileiro. Dado de 2019 pode não refletir o cenário pós-2020. Sempre contextualizar.

**4. Ignorar o contra-argumento**
Pesquisa que só busca confirmação produz conteúdo raso. As camadas 4 e 5 existem para evitar isso.

**5. Citação sem verificação**
Citações atribuídas erroneamente circulam amplamente na internet. Sempre buscar a fonte original da citação antes de incluir.
