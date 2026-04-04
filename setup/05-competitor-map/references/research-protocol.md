# Protocolo de Pesquisa de Concorrentes

---

## Pesquisa Proativa de Discovery (executar antes das perguntas)

Esta pesquisa roda automaticamente assim que o contexto da empresa está carregado — o usuário não precisa pedir.

### Queries de discovery

Montar queries combinando os dados do PRODUCT_CONTEXT e COMPANY_PROFILE:

```
"[categoria do produto] alternativas Brasil"
"[setor] software/ferramenta [país/região do cliente]"
"melhor [categoria] para [público-alvo]"
"[produto do usuário] vs"  ← o autocomplete revela concorrentes
"[problema que o produto resolve] ferramenta"
"[tipo de empresa alvo] [categoria] comparativo"
"[categoria] [ano atual] top ferramentas"
```

Se a empresa tem site: acessar a página de Features ou Pricing — muitas vezes listam nomes de concorrentes em tabelas comparativas ou no texto de posicionamento.

### Para cada empresa encontrada

Coletar rapidamente:
- Nome da empresa
- URL do site
- Descrição em 1 linha (o que fazem)
- Posicionamento aparente (premium, popular, nicho, enterprise)
- País/região de atuação

### Apresentação dos resultados

Apresentar ao usuário em formato de tabela para classificação:

> "Pesquisei seu setor antes de começar. Encontrei estas empresas. Para cada uma, me diga: concorrente direto, indireto, ou pode ignorar:"

| Empresa | Site | O que faz | Direto / Indireto / Ignorar |
|---|---|---|---|
| [nome] | [url] | [descrição] | _aguardando_ |

Confirmar antes de incluir no mapa final.

---

## Pesquisa Aprofundada por Concorrente (após classificação)

Após o usuário confirmar quais são concorrentes diretos, executar análise mais profunda de cada um.

### Análise do site

Acessar o site do concorrente e extrair:
- **Hero text / tagline** — como se apresentam na primeira dobra
- **Proposta de valor principal** — o que prometem como benefício central
- **Features em destaque** — o que listam como principais funcionalidades
- **Segmento-alvo** — a quem dizem servir (texto de "Para quem é isso?", "Ideal para...")
- **Pricing** (se público) — tier / faixa de preço / modelo (assinatura, por uso, por empresa)
- **Social proof** — número de clientes, logos, depoimentos visíveis

### Queries de posicionamento e percepção

```
"[concorrente] review"
"[concorrente] é bom"
"[concorrente] problemas"
"[concorrente] vs [produto do cliente]"
"[concorrente] preço" / "[concorrente] pricing" / "[concorrente] plano"
"[concorrente] desvantagens" / "[concorrente] reclamação"
```

Fontes relevantes: G2, Capterra, Reclame Aqui, Reddit, Product Hunt, comentários do LinkedIn.

### Síntese por concorrente (completa)

Para cada concorrente analisado, gerar:

```
[Concorrente]:
- Site: [url]
- Tagline/hero: [texto exato ou paráfrase]
- Proposta de valor: [o que prometem]
- Público declarado: [quem eles dizem atender]
- Tier de preço: [faixa ou "não divulgado"]
- Posicionamento: [premium / popular / nicho / enterprise]
- Pontos fortes (produto): [o que entregam bem]
- Pontos fracos (produto): [reclamações frequentes, gaps visíveis]
- Diferencial vs. [produto do cliente]: [onde diferem — a favor e contra]
```

---

## Análise de Conteúdo dos Concorrentes (Pergunta 5.6)

Quando o usuário aceitar análise de conteúdo, executar para cada concorrente principal.

### Busca de presença digital

```
"[nome do concorrente] LinkedIn"
"[nome do concorrente] Instagram"
"[nome do concorrente] TikTok"
"[nome do concorrente] YouTube"
"[nome do concorrente] blog"
```

### O que analisar em cada rede

**LinkedIn:**
- Tipo de conteúdo predominante (educativo, produto, cases, opinião, cultura)
- Frequência estimada (diário / 3x semana / semanal / irregular)
- Formatos usados (texto longo, carrossel, vídeo, infográfico, documento)
- Tom de voz percebido (formal/casual, técnico/acessível, sério/leve)
- Engajamento visível (comentários, compartilhamentos — comparativamente, sem números exatos)
- Temas que performam melhor (se visível por interação)

**Instagram:**
- Mix feed vs. reels vs. stories (estimativa de proporção)
- Estética visual (consistente / variada / profissional / amadora)
- Frequência de cada formato (reels / carrosséis / fotos / infográficos)
- Uso de audio/trends nos reels
- Frequência de stories e tipo de conteúdo ali
- Engajamento relativo nos formatos

**TikTok (se ativo):**
- Tipo de vídeo (educativo, demonstração, entretenimento, bastidores, tendências)
- Frequência de publicação
- Vídeos com mais views — que temas e formatos performaram?
- Uso de trends, duetos, sons populares
- Tom geral do canal (mais profissional ou mais nativo/casual)

**YouTube (se ativo):**
- Tipo de vídeo (tutorial, case, webinar, vlog, entrevista, demo)
- Frequência de publicação
- Duração predominante (short, 5-15min, +20min)
- Vídeos com mais visualizações — que temas performaram?
- Presença de Shorts

**Blog/SEO (se ativo):**
- Frequência de publicação estimada
- Temas predominantes
- Tipo de conteúdo (tutorial, opinião, comparativo, caso de uso)
- Profundidade percebida (raso/médio/profundo)

### Síntese de conteúdo por concorrente

```
[Concorrente] — Conteúdo:
- Plataformas ativas: [lista, ordenadas por relevância]
- Plataformas ausentes: [onde não estão]
- Conteúdo predominante: [tipos e temas]
- Frequência estimada: [por plataforma]
- Formatos favoritos: [lista]
- Tom percebido: [descrição]
- Pontos fortes de conteúdo: [o que fazem bem]
- Gaps de conteúdo: [o que não fazem ou fazem mal]
- Tema de maior engajamento aparente: [se identificável]
```

**Regra crítica:** Nunca reproduzir conteúdo alheio. Apenas analisar padrões e extrair insights estratégicos.

---

## Consolidação de Gaps de Conteúdo

Após analisar todos os concorrentes, cruzar os dados para identificar oportunidades.

### Checklist de gaps a verificar

**Gaps de tema:**
- [ ] Existe algum tema relevante para a persona que nenhum concorrente cobre?
- [ ] Existe algum tema coberto de forma superficial que merece aprofundamento?

**Gaps de formato:**
- [ ] Existe algum formato que nenhum concorrente usa no setor? (ex: carrossel técnico, série temática, behind-the-scenes)
- [ ] Existe alguma plataforma onde nenhum concorrente está presente ou está inconsistente?

**Gaps de ângulo narrativo:**
- [ ] Ninguém usa dados próprios / pesquisa original como conteúdo?
- [ ] Ninguém usa humor, tom provocador ou contrarian?
- [ ] Ninguém conta a história da empresa / jornada do fundador?

**Gaps de audiência:**
- [ ] Existe algum segmento de público relevante que nenhum concorrente atende no conteúdo?
- [ ] Existe alguma dor da persona que nenhum concorrente endereça diretamente?

**Gaps de posicionamento:**
- [ ] Existe algum tier de preço ou nicho de mercado sem representante forte no setor?
- [ ] Existe espaço para um posicionamento "mais acessível", "mais técnico" ou "mais especializado"?

**Gaps de consistência:**
- [ ] Nenhum concorrente mantém frequência consistente em alguma plataforma?
- [ ] Nenhum concorrente tem série temática recorrente (ex: "toda terça, dica de X")?

### Priorização de gaps

Priorizar gaps que:
1. São relevantes para as personas mapeadas em AUDIENCE_PROFILES (alta relevância para o público)
2. Se encaixam nos diferenciais do produto em PRODUCT_CONTEXT (autenticidade de falar sobre isso)
3. São viáveis para a empresa executar considerando recursos atuais

Esses gaps alimentam diretamente a sugestão automática de Pilares no Bloco 6 e a seção "Inputs para os Pilares" do COMPETITOR_MAP.md.
