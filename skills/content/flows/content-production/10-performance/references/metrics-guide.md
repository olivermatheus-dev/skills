# Guia de Métricas — Performance Analyzer

> Referência de KPIs por plataforma, benchmarks de mercado, classificação de métricas
> e lógica de interpretação. Usar como base comparativa quando o usuário não tem
> histórico próprio disponível.

---

## 1. Métricas de Vaidade vs. Métricas de Comportamento

Antes de interpretar qualquer número, classificar a métrica:

| Categoria | Métricas | O que indicam |
|---|---|---|
| **Vaidade** | Impressões, alcance, curtidas | Visibilidade — não indicam que o conteúdo gerou valor ou ação |
| **Comportamento** | Saves, shares, comentários de qualidade, cliques em link | A pessoa interagiu de forma intencional — o conteúdo valeu o esforço |
| **Conversão** | Swipe up, clique em bio, cadastro, mensagem DM | Saiu da plataforma — máxima intenção |

**Regra:** Interpretar sempre em conjunto. Alto alcance + zero saves = visível mas descartável. Baixo alcance + alto save rate = conteúdo valioso para quem viu, problema de distribuição — não de qualidade.

---

## 2. Taxa de Engajamento — Cálculo e Benchmarks

### Fórmula padrão

```
Taxa de Engajamento = (curtidas + comentários + saves + shares) / alcance × 100
```

**Nota:** Alguns relatórios usam "impressões" no denominador em vez de "alcance". Usar sempre a mesma base comparativa dentro de uma análise.

### Benchmarks por plataforma e tamanho de conta

| Plataforma | Conta pequena (< 10k) | Conta média (10k–100k) | Conta grande (> 100k) |
|---|---|---|---|
| **Instagram Feed** | 4–7% bom / > 7% excelente | 2–4% bom / > 4% excelente | 1–2% bom / > 2% excelente |
| **Instagram Reels** | 8–15% bom / > 15% excelente | 4–8% bom / > 8% excelente | 2–4% bom / > 4% excelente |
| **LinkedIn** | 2–4% bom / > 4% excelente | 1–2% bom / > 2% excelente | 0,5–1% bom / > 1% excelente |
| **TikTok** | 5–10% bom / > 10% excelente | 3–6% bom / > 6% excelente | 1–3% bom / > 3% excelente |
| **Twitter/X** | 0,5–1% bom / > 1% excelente | 0,2–0,5% bom / > 0,5% excelente | 0,1–0,2% bom / > 0,2% excelente |

**Importante:** Benchmarks são médias de mercado, não metas obrigatórias. Uma conta de nicho técnico terá taxas naturalmente menores que uma conta de entretenimento. Calibrar sempre pelo histórico próprio quando disponível.

---

## 3. KPIs por Plataforma

### LinkedIn

| Métrica | O que mede | Meta indicativa |
|---|---|---|
| **Impressões** | Quantas vezes o post apareceu no feed | — |
| **Cliques no post** | Engajamento intencional (ler além do truncamento) | > 3% das impressões |
| **Reações** | Sinal fraco de aprovação | Contexto — volume + tipo importam |
| **Comentários** | Engajamento de alto valor — algoritmo prioriza | > 0,3% das impressões |
| **Reposts** | Aprovação de conteúdo para rede própria | > 0,1% das impressões |
| **CTR para link** | Saiu da plataforma | > 1% das impressões |

**Particularidade LinkedIn:** Carrosséis têm vantagem de 196% em alcance vs. posts de texto. Comparar carrossel com carrossel, não com post de texto.

### Instagram

| Métrica | O que mede | Meta indicativa |
|---|---|---|
| **Alcance** | Contas únicas que viram | — |
| **Impressões** | Total de visualizações (inclui revisitas) | Impressões/Alcance > 1,3 indica revisita |
| **Saves** | Conteúdo considerado valioso para guardar | > 2% do alcance é bom |
| **Shares (envio por DM/stories)** | Conteúdo valioso para compartilhar | > 1% do alcance é bom |
| **Comentários** | Engajamento ativo | > 0,5% do alcance é bom |
| **Cliques no perfil** | Consideração para seguir/comprar | > 2% do alcance |
| **Swipe up / Link na bio** | Saiu da plataforma | Depende do CTA |

**Particularidade Reels:** Métrica mais relevante é retenção média (assistiu até quando?). > 50% de retenção = bom gancho. > 80% = excelente.

### TikTok

| Métrica | O que mede | Meta indicativa |
|---|---|---|
| **Visualizações** | Alcance raw (muito inflado) | Contexto |
| **Taxa de conclusão** | Assistiu até o fim | > 40% = bom; > 60% = excelente |
| **Tempo médio assistido** | Retenção real | > 60% da duração do vídeo |
| **Compartilhamentos** | Conteúdo digno de viralizar | > 1% das visualizações |
| **Comentários** | Engajamento de alto valor no TikTok | > 0,5% das visualizações |
| **Seguidores ganhos no post** | Conversão em audiência | > 0,1% das visualizações |

### YouTube

| Métrica | O que mede | Meta indicativa |
|---|---|---|
| **Retenção média** | Assistiu qual porcentagem | Long-form: > 40% bom; Shorts: > 60% bom |
| **CTR do thumbnail** | Click-through rate na thumbnail | 4–10% é bom para long-form |
| **Watch time total** | Minutos assistidos | Fator de rankeamento principal |
| **Likes/Views ratio** | Aprovação da audiência que assistiu | > 3% é bom |
| **Comentários** | Engajamento ativo | > 0,3% das views |

### Blog/SEO

| Métrica | O que mede | Meta indicativa |
|---|---|---|
| **Tempo na página** | Leu ou apenas abriu? | > 3min para artigos longos |
| **Taxa de rejeição** | Saiu sem interagir | < 70% é aceitável; < 50% é bom |
| **Scroll depth** | Leu até onde | > 50% do artigo lido = bom |
| **Cliques em CTA interno** | Avançou no funil | Depende da oferta |
| **Posição no rankeamento** | SEO — visibilidade orgânica | Top 3 para palavra-chave principal |

---

## 4. Métricas por Objetivo de Conteúdo

Cada post tem um objetivo principal. A métrica de sucesso muda conforme o objetivo:

| Objetivo | Métrica principal | Métrica secundária | Ignorar (não relevante) |
|---|---|---|---|
| **Alcance / Awareness** | Impressões, alcance | Compartilhamentos | Saves (UTILidade ainda baixa nesta fase) |
| **Engajamento** | Taxa de engajamento, comentários | Saves, reações | Impressões brutas |
| **Save / Valor** | Saves | Compartilhamentos | Curtidas (muito fracas aqui) |
| **Conversão** | Cliques em link, mensagens, cadastros | CTR em bio/link | Métricas de engajamento passivo |
| **Construção de audiência** | Seguidores ganhos | Visitas ao perfil | Impressões de posts não relacionados |

---

## 5. Análise de Save Rate

Save rate é uma das métricas mais valiosas para conteúdo B2B e educacional:

```
Save Rate = saves / alcance × 100
```

| Save Rate | Interpretação |
|---|---|
| > 5% | Conteúdo altamente utilitário — replicar estrutura |
| 2–5% | Bom desempenho — identificar o elemento mais valioso |
| 0,5–2% | Médio — conteúdo foi visto mas não considerado para guardar |
| < 0,5% | Baixo — conteúdo descartável para a audiência |

---

## 6. Correlações Comuns e O Que Indicam

| Padrão observado | Diagnóstico provável | Ação sugerida |
|---|---|---|
| Alto alcance + baixo engajamento | Hook forte (gerou alcance) mas conteúdo fraco ou genérico | Melhorar profundidade; manter tipo de hook |
| Baixo alcance + alto engajamento | Conteúdo nicho e valioso mas distribuição baixa | Boostar com variação ou reshare |
| Alto save + baixo share | Conteúdo utilitário (salvar para uso próprio) mas não emocional | Para mais shares: adicionar tensão ou provocação |
| Alto share + baixo save | Conteúdo provocativo ou emocional mas baixo valor prático | Para mais saves: adicionar lista acionável ou insight |
| Muitos comentários negativos | Provocação calculada funcionou — mas polarizou | Avaliar se polarização é intencional ou prejudicial |
| Alto CTR no link + baixa conversão | Página de destino é o problema — não o conteúdo | Otimizar landing page, não o post |

---

## 7. Benchmarks de Frequência de Publicação

Para contextualizar análises que consideram timing e saturação:

| Plataforma | Frequência ideal | Frequência mínima |
|---|---|---|
| **LinkedIn** | 3–5x por semana | 2x por semana |
| **Instagram Feed** | 3–5x por semana | 2x por semana |
| **Instagram Reels** | 3–7x por semana | 1x por semana |
| **TikTok** | 5–7x por semana | 3x por semana |
| **Twitter/X** | 2–5x por dia | 1x por dia |
| **YouTube long-form** | 1–2x por semana | 1x por semana |
| **YouTube Shorts** | 3–7x por semana | 1x por semana |
| **Blog** | 2–4x por mês | 1x por mês |

---

## 8. Heurística de Decisão — O Que Fazer com Cada Tier

| Tier | Próxima ação | Prazo |
|---|---|---|
| **A — Top performer** | Criar 2–3 variações imediatamente. Identificar o elemento-chave (hook? formato? tema?) e replicá-lo. Marcar hook como ✅ na biblioteca. | Próxima semana |
| **B — Bom desempenho** | Otimizar o elemento mais fraco. Testar variação com uma mudança de cada vez. Hook entra com ⚠️. | Próximas 2 semanas |
| **C — Abaixo da média** | Identificar o elemento que falhou (1 hipótese). Criar 1 post para testar a hipótese antes de descartar o formato/tema. | Próximo mês |
| **D — Sem referência** | Usar como linha base. Comparar os próximos 4 posts contra este para estabelecer média própria. | Em curso |
