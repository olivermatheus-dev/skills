# Protocolos de Pesquisa R1–R6

> **Uso:** Referência consolidada para as pesquisas executadas durante o pipeline de mapeamento de audiência.
> Cada skill chama os protocolos no momento adequado. Ver seção de cada protocolo para o timing exato.

---

## Sistema de Marcação de Confiança

Todo dado inserido no `RESEARCH_[publico].md` deve ser marcado com:
- `[D]` — Dado de pesquisa (fontes externas verificadas)
- `[U]` — Input do usuário (informação fornecida diretamente)
- `[H]` — Hipótese estruturada (inferência do LLM sem pesquisa)
- `[E]` — Estimativa (inferência com base em padrões, não dados diretos)
- `[V]` — Validado (dado [H] ou [E] confirmado pelo usuário ou por fonte)

---

## R1 — Pesquisa Setorial

**Responsabilidade:** Estabelecer o contexto de mercado antes de qualquer mapeamento de audiência.

**Quando aciona:** Início da Skill 4.1 (Target Audiences), após ler `PRODUCT_CONTEXT.md`.

**Input necessário:**
- Nicho / setor de atuação (de `PRODUCT_CONTEXT.md`)
- Tipo de produto ou serviço
- Região de atuação
- Lista inicial de concorrentes percebidos (se o usuário tiver)

**Texto da oferta ao usuário:**
> "Posso pesquisar o contexto do seu setor agora — tamanho de mercado, principais concorrentes e tendências recentes. Isso melhora a qualidade das sugestões ao longo de todo o mapeamento. Quer que eu faça isso agora? (recomendado)"

### O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Tamanho e crescimento do setor | SEBRAE, Statista, relatórios setoriais, web search | O setor está crescendo, estagnado ou encolhendo? |
| Principais players do mercado | Web search, SimilarWeb | Concorrentes diretos e indiretos |
| Modelo de negócio predominante | Sites dos concorrentes identificados | Como o mercado cobra, entrega e se posiciona |
| Notícias recentes do setor | Web search (últimos 12 meses) | Eventos, regulações, tendências |

### Como os dados alimentam o restante do fluxo

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Tamanho + crescimento do setor   → R5 (oportunidade de posicionamento)
                                 → Skill 4.1 (priorização de segmentos)
Lista de concorrentes            → R4 (Reclame Aqui + reviews específicos)
                                 → R5 (análise de anúncios na Ad Library)
Modelo de negócio do setor       → R5 (diferenciação de precificação)
Notícias e tendências            → R6 (contexto cultural atual)
                                 → Skill 4.3 (dores emergentes do mercado)
```

### Output — Seção R1 de RESEARCH_[publico].md

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

### Hipóteses do Usuário (Pré-Pesquisa)
- [o que o usuário informou sobre o mercado] [U]
- Validado pela pesquisa: sim / não / parcialmente

### Implicações para o Mapeamento
- Oportunidade identificada: [D]
- Risco identificado: [D]
```

> **Regra de Ouro:** A lista de concorrentes gerada aqui não é detalhe — é o mapa que guia as pesquisas R4 e R5. Um mau mapeamento de concorrentes na R1 prejudica todas as pesquisas qualitativas que vêm depois.

---

## R2 — Pesquisa Demográfica

**Responsabilidade:** Substituir estimativas do usuário por dados reais de renda, escolaridade, composição familiar e comportamento digital.

**Quando aciona:** Durante a Skill 4.2 (Persona Builder), após confirmar faixa etária e região. Roda em **paralelo com R3**.

**Input necessário:**
- Faixa etária confirmada (P2.1)
- Região de atuação (P2.4)
- Classe social estimada (P2.3 ou inferida do pricing)
- Contexto B2B ou B2C

**Prioridade de dados — Perguntar antes de pesquisar:**
> "Você tem acesso a analytics da sua audiência? (Google Analytics, Instagram Insights, dados do CRM?) Se sim, me passe — são mais precisos que qualquer dado externo para o seu caso."

### O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Dados socioeconômicos por faixa/região | IBGE (PNAD, POF) | Renda média, escolaridade, estrutura familiar |
| Composição de classe por região | IBGE, FGV Social | Distribuição de classes no mercado-alvo |
| Hábitos digitais por faixa etária | DataReportal, We Are Social | Redes usadas, tempo de tela, formatos, horários |
| Comportamento de consumo por perfil | SEBRAE, pesquisas setoriais | Como compram, fatores de influência, canais |

### Output — Seção R2 de RESEARCH_[publico].md

```markdown
## R2 — Perfil Demográfico com Dados
*Pesquisa executada em: [data]*

### Dados Socioeconômicos (faixa confirmada: [X] anos, [região])
- **Renda média familiar:** [dado] — fonte: IBGE [ano] [D]
- **Renda individual estimada:** [dado] [D]
- **Escolaridade predominante:** [dado] [D]
- **Classe social predominante:** [A/B/C] — [% da faixa] [D]

### Hábitos Digitais Confirmados
- **Tempo médio de tela por dia:** [dado] [D]
- **Plataformas mais usadas (ranking):** [D]
- **Formatos de conteúdo mais consumidos:** [D]
- **Horários de pico de acesso:** [D]

### Analytics do Usuário (se fornecido)
- **Fonte:** [GA4 / Instagram Insights / CRM] [U]
- **Split demográfico real:** [U]
- **Divergências com dados externos:** [U vs D — se houver]
```

> **Regra de Ouro:** Analytics proprietário do usuário é mais preciso que qualquer dado do IBGE para o caso específico dele. Sempre perguntar antes de pesquisar externamente.

---

## R3 — Pesquisa de Comportamento de Busca e Linguagem

**Responsabilidade:** Mapear a linguagem REAL que o público usa para descrever o problema — os termos exatos que digitam, as perguntas que fazem.

**Quando aciona:** Durante a Skill 4.2, em **paralelo com R2**, após confirmar nicho e problema central.

**Input necessário:**
- Nicho / problema principal
- Termos do setor que o usuário usa
- Faixa etária e região confirmados

### O Gap de Linguagem (Por que esta pesquisa é crítica)

A empresa fala em **categoria/solução**: "gestão de tráfego pago", "funil de conversão"
O público fala em **sintoma/problema**: "como parar de perder dinheiro no Google Ads"

Headlines que usam a linguagem do sintoma performam consistentemente melhor que os que usam linguagem de categoria.

### O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Termos de busca reais | Google Trends, autocompletar | O que o público digita — não o que a empresa acha |
| Perguntas frequentes | Google "People Also Ask", fóruns | Dúvidas coloquiais reais |
| Sazonalidade e tendências | Google Trends | Quando o interesse cresce/cai |
| Variações regionais | Google Trends por região | Diferenças de vocabulário por estado |

### Output — Seção R3 de RESEARCH_[publico].md

```markdown
## R3 — Comportamento de Busca e Mapa de Linguagem
*Pesquisa executada em: [data]*

### Termos de Busca Reais (o que digitam)
1. "[termo exato]" — intenção: informacional / transacional / navegacional [D]
2. "[termo exato]" [D]

### Perguntas Frequentes do Público
- "[pergunta literal]" [D]
- "[pergunta literal]" [D]

### Gap de Linguagem Identificado
| O que a empresa diz | O que o público busca |
|---|---|
| [termo técnico/categoria] | [termo de sintoma/problema] [D] |

### Banco de Linguagem (Copy-Ready)
- "[frase literal do público]" — usar em: [hook / headline / subject] [D]
```

> **Regra de Ouro:** O autocompletar do Google é uma janela para a mente coletiva do seu público. Uma hora minerando linguagem real economiza meses de copy que não converte.

---

## R4 — Análise Qualitativa de Audiência (Voz do Público)

**Responsabilidade:** Coletar a voz não-filtrada do público — reclamações reais, frustrações reais, desejos reais.

**Quando aciona:** Durante a Skill 4.3 (Pain & Desire Mapper), após persona ter esqueleto básico e lista de concorrentes disponível da R1.

**Dependência:** Esta skill SÓ funciona bem quando a R1 já foi executada.

**Texto da oferta ao usuário:**
> "Posso pesquisar agora o que clientes REAIS do mercado reclamam e desejam — no Reclame Aqui, Google Reviews e fóruns, focado nos concorrentes já identificados. Isso dá às dores linguagem real e citações literais. Quer que eu faça isso agora?"

**Antes de pesquisar, perguntar:**
> "Antes de pesquisar externamente: você tem transcrições de calls de vendas, respostas de pesquisas com clientes, tickets de suporte, ou mensagens de clientes insatisfeitos? Esses dados são ouro — me passe o que tiver e eu processo antes de ir ao externo."

### O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Reclamações reais | Reclame Aqui (empresas da lista R1) | Dores não-resolvidas, linguagem emocional |
| O que o mercado entrega mal | Google Reviews 1-3 estrelas (concorrentes) | Expectativas quebradas = desejos não atendidos |
| O que encanta | Google Reviews 4-5 estrelas | O que o público valoriza = diferenciais |
| Discussões espontâneas | Reddit, Quora, fóruns do setor | Dores e desejos sem filtro |
| Comentários em conteúdo | YouTube (vídeos sobre o problema) | Linguagem, nível de consciência, dúvidas |

### Protocolo de Análise

1. **Extrair citações literais** — não parafrasear. As palavras exatas são matéria-prima de copy.
2. **Rankear por frequência × intensidade** — quantas vezes aparece × quão emocionalmente carregado é
3. **Identificar o verbo emocional** — raiva, frustração, decepção, medo, vergonha, esperança
4. **Classificar na Pirâmide de Dor** — Operacional / Estratégico / Emocional / Existencial
5. **Sinalizar o gap** — dores frequentes que nenhum concorrente endereça bem

### Output — Seção R4 de RESEARCH_[publico].md

```markdown
## R4 — Voz do Público (Qualitativo)
*Pesquisa executada em: [data]*

### Temas de Dor Mais Frequentes

#### Tema 1: [Nome do tema]
- **Frequência:** [N] menções
- **Intensidade:** Alta / Média / Baixa
- **Nível:** Operacional / Estratégico / Emocional / Existencial
- **Citações literais:**
  - "[citação exata]" — [fonte] [D]

### Banco de Linguagem (Copy-Ready)
- "[frase literal]" — tipo: [hook / headline / subject de email] [D]

### Alternativas Consideradas
- [alternativa 1] — por que tentaram + por que não funcionou [D]
```

> **Regra de Ouro:** Você não escreve copy. Você minera copy. As melhores headlines já foram escritas pelo cliente, numa avaliação de 1 estrela de um concorrente ou numa thread do Reddit às 2 da manhã.

---

## R5 — Análise Competitiva de Posicionamento

**Responsabilidade:** Mapear como os concorrentes estão se comunicando com o mesmo público e identificar os gaps.

**Quando aciona:** Durante a Skill 4.5 (Consciousness Mapping), após dores e desejos mapeados.

**Dependência:** Requer R1 (lista de concorrentes) e R4 (mapa de dores).

**Texto da oferta ao usuário:**
> "Agora que sei o que sua audiência quer e teme, posso pesquisar como seus concorrentes estão se comunicando com elas — anúncios ativos, promessas, nível de consciência que endereçam — e identificar gaps onde ninguém atua bem. Quer que eu faça isso agora?"

### O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Anúncios ativos | Meta Ad Library | Ângulos de venda, hooks, tipos de criativos |
| Posicionamento | Sites e landing pages | Promessa central, para quem falam, diferencial |
| Nível de consciência endereçado | Análise dos anúncios | Estão falando com inconsciente (1-2) ou produto (4-5)? |
| Prova social | Anúncios, sites, redes sociais | Números, depoimentos, antes/depois, logos |
| Benchmarks de preço | Sites com preço visível | Faixas praticadas, estrutura de cobrança |

### Framework de Análise de Gaps

```
Gap Tipo 1 — Dor Real × Promessa Ausente
  "O público se queixa de X, mas nenhum concorrente faz promessa sobre X"
  → Oportunidade de posicionamento direto sobre a dor real

Gap Tipo 2 — Nível de Consciência Aberto
  "Todos os concorrentes falam com público em nível 4-5, mas a maioria
  da audiência está em nível 2-3"
  → Oportunidade de criar conteúdo de awareness sem concorrência

Gap Tipo 3 — Formato/Canal Não Ocupado
  "Todos usam vídeo de depoimento. Ninguém usa data-driven proof"
  → Oportunidade de se diferenciar pelo tipo de prova social
```

### Output — Seção R5 de RESEARCH_[publico].md

```markdown
## R5 — Análise Competitiva e Gaps de Mercado
*Pesquisa executada em: [data]*

### Análise por Concorrente
#### [Concorrente 1]
- **Ângulo principal:** [descrição] [D]
- **Promessa central:** "[frase]" [D]
- **Nível de consciência:** [nível 1-5] [D]
- **O que NÃO dizem:** [gap potencial] [D]

### Gaps Identificados
| # | Gap | Tipo | Dor que endereça | Oportunidade |
|---|---|---|---|---|
| 1 | [descrição] | [1/2/3] | [dor da R4] | [como explorar] [D] |

### Síntese Estratégica
- **Principal oportunidade de diferenciação:** [D]
- **Ângulo de conteúdo mais aberto:** [nível sem concorrência] [D]
```

> **Regra de Ouro:** Análise competitiva sem mapa de dores é turismo. Com o mapa de dores em mãos, você está procurando onde os concorrentes deixaram a audiência sem resposta.

---

## R6 — Inferência Psicográfica e Cultural

**Responsabilidade:** Reconstruir o contexto formativo da persona — valores, vieses cognitivos, relação com autoridade, referências culturais.

**Quando aciona:** Durante a Skill 4.2, após dados demográficos confirmados. Idealmente logo após R2.

**Nota importante:** Esta skill NÃO faz web search. Usa a base de conhecimento do LLM como "antropólogo digital". O output é hipótese estruturada — não dado.

**Input necessário:**
- Faixa etária e geração (P2.1 e P2.10)
- Classe social estimada (R2 ou usuário)
- Região e contexto sociocultural (P2.4)
- Escolaridade e área de formação (P2.5)

### O que a IA infere (sem web search)

| Dimensão | O que reconstrói | Por que importa |
|---|---|---|
| Contexto histórico formativo | Eventos durante os 10-25 anos da persona | Molda relação com risco, autoridade, dinheiro |
| Cultura de mídia consumida | O que assistiu/ouviu/leu na formação | Referências para memes e analogias |
| Valores centrais | O que é inegociável para esse perfil | Base de todo posicionamento |
| Vieses cognitivos | Quais vieses são mais presentes | Como estruturar argumentos persuasivos |
| Relação com autoridade | Confia em especialistas? Prefere pares? | Define tipo de prova social mais eficaz |
| Relação com risco | Early adopter vs. late majority | Define framing de oferta e garantias |
| Estilo de comunicação | Formal/informal, direto/narrativo | Calibra tom de todos os conteúdos |

### Protocolo de Inferência

1. **Ancorar na geração + classe + região** — a combinação é mais precisa que variável isolada
2. **Cruzar com o contexto do produto** — mesma classe em São Paulo vs. interior do Nordeste = perfis diferentes
3. **Diferenciar geracional do individual** — apresentar como "tendências do perfil", não certezas
4. **Incluir o que pode contradizer** — para cada tendência, indicar quando NÃO se aplica

### Output — Seção R6 de RESEARCH_[publico].md

```markdown
## R6 — Perfil Psicográfico e Cultural (Inferência)
*Gerado em: [data] | Fonte: Inferência do LLM*

> ⚠️ Todo o conteúdo desta seção é [H] (hipótese estruturada).

### Geração e Contexto Formativo
- **Geração:** [nome] ([anos]) [H]
- **Eventos históricos formativos → impacto comportamental:** [H]
- **Relação com dinheiro:** [H]
- **Relação com tecnologia:** [H]

### Valores Centrais do Perfil [H]
1. [valor] — por que importa para este perfil
2. [valor]
3. [valor]

### Vieses Cognitivos Predominantes [H]
| Viés | Manifestação | Implicação para comunicação |
|---|---|---|
| [nome] | [como aparece] | [como usar] |

### Relação com Autoridade e Risco [H]
- Tipo de prova social mais eficaz: [depoimento de par / número / especialista]
- Perfil de adoção: [early adopter / early majority / late majority]
- O que reduz friction na compra: [garantia, trial, referência, etc.]

### Estilo de Comunicação Preferido [H]
- Tom: [formal / semiformal / informal / direto]
- Estrutura: [narrativa / lista / dado + análise]
- Jargão: [técnico aceitável / prefere simples / misto]

### Referências Culturais Prováveis [H]
- **Mídia da formação:** [filmes, séries, programas]
- **Referências que conectam:** [usar para criar pertencimento]
- **Referências que alienam:** [evitar — parece forçado]
```

> **Regra de Ouro:** Esta skill não pesquisa dados. Ela pensa. O LLM funciona como um estrategista que cruza história, psicologia e cultura com os dados demográficos. O output é mais rápido e profundo que qualquer web search, mas precisa de validação. Apresente sempre como hipótese.
