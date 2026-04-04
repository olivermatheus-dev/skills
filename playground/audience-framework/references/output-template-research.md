# Template: RESEARCH_[publico].md

**Onde fica:** `companies/[empresa]/audiences/RESEARCH_[nome-do-publico].md`  
**Uma instância por:** público-alvo mapeado (um arquivo por AUDIENCE_[nome].md correspondente)  
**Lido por:** todas as skills 4.1–4.5 para gerar sugestões fundamentadas em dados

> **Marcadores de confiança:**
> - `[D]` = Dado pesquisado pela IA em fontes públicas (web search, IBGE, DataReportal etc.)
> - `[U]` = Dado fornecido pelo usuário (proprietário: CRM, analytics, entrevistas, experiência direta)
> - `[H]` = Hipótese estruturada (inferência do LLM sem pesquisa ou dado — precisa de validação)
> - `[D+U]` = Dado externo confirmado por dado interno — maior confiança
>
> **Prioridade:** `[U]` sempre prevalece sobre `[D]` quando há contradição. `[D+U]` é o estado ideal.

---

# RESEARCH — [Nome do Público-Alvo]
*Empresa: [slug]*  
*Criado em: [data] | Última atualização: [data]*

## Status das Pesquisas

| Skill | Status | Data | Fontes usadas |
|---|---|---|---|
| R1 — Setorial | ⬜ pendente / ✅ completa / ⏭️ pulada | — | — |
| R2 — Demográfica | ⬜ / ✅ / ⏭️ | — | — |
| R3 — Comportamento de Busca | ⬜ / ✅ / ⏭️ | — | — |
| R4 — Voz do Público | ⬜ / ✅ / ⏭️ | — | — |
| R5 — Análise Competitiva | ⬜ / ✅ / ⏭️ | — | — |
| R6 — Inferência Psicográfica | ⬜ / ✅ / ⏭️ | — | — |

---

## R1 — Contexto Setorial
*Pesquisa executada em: [data] | Skill: R1-setor.md*

### Visão Geral do Setor
- **Setor:** [nome] [D]
- **Tamanho estimado:** [dado + fonte] [D]
- **Trajetória:** crescendo / estagnado / encolhendo — [contexto breve] [D]
- **Modelo de negócio predominante no mercado:** [como o mercado cobra e entrega] [D]

### Players Identificados
| Empresa | Tipo | Observação |
|---|---|---|
| [nome] | direto / indireto | [D] |

### Tendências e Notícias Recentes (últimos 12 meses)
- [evento/tendência relevante] — [fonte] [D]

### Hipóteses do Usuário (Pré-Pesquisa)
- [o que o usuário informou sobre o mercado] [U]
- Validado pela pesquisa: sim / não / parcialmente — [notas]

---

## R2 — Perfil Demográfico com Dados
*Pesquisa executada em: [data] | Skill: R2-demografica.md*

### Dados Socioeconômicos (faixa: [X] anos, [região])
- **Renda média familiar:** [dado] — IBGE [ano] [D]
- **Renda individual estimada:** [dado] [D]
- **Escolaridade predominante:** [dado] [D]
- **Estrutura familiar típica:** [dado] [D]
- **Classe social predominante:** [classe] — [%] [D]

### Hábitos Digitais Confirmados
- **Tempo médio de tela/dia:** [dado] [D]
- **Plataformas mais usadas (ranking):** [D]
- **Formatos mais consumidos:** [D]
- **Horários de pico:** [D]

### Analytics do Usuário (se fornecido)
- **Fonte:** [GA4 / Instagram Insights / CRM] [U]
- **Split demográfico real:** [U]
- **Divergências notadas:** [U vs D — se houver]

---

## R3 — Comportamento de Busca e Mapa de Linguagem
*Pesquisa executada em: [data] | Skill: R3-busca.md*

### Termos de Busca Reais
1. "[termo]" — intenção: [informacional/transacional] [D]
2. "[termo]" [D]
3. "[termo]" [D]

### Perguntas Frequentes do Público
- "[pergunta literal]" [D]
- "[pergunta literal]" [D]

### Gap de Linguagem
| O que a empresa diz | O que o público busca |
|---|---|
| [termo técnico] | [termo de sintoma] [D] |

### Banco de Linguagem (Copy-Ready)
- "[frase literal do público]" — usar em: [hook / headline / subject] [D]
- "[frase]" [D]

### Sazonalidade
- Pico de interesse: [meses/eventos] [D]

---

## R4 — Voz do Público (Qualitativo)
*Pesquisa executada em: [data] | Skill: R4-qualitativa.md*
*Fontes: [lista de onde pesquisou]*

### Temas de Dor Mais Frequentes

#### Tema 1: [Nome]
- **Frequência:** [N] menções / **Intensidade:** Alta / Média / Baixa [D]
- **Nível (Pirâmide):** Operacional / Estratégico / Emocional / Existencial
- **Citações literais:**
  - "[citação exata]" — [Reclame Aqui / Google Review / Reddit] [D]

#### Tema 2: [Nome]
[mesma estrutura]

### Desejos Confirmados pelo Público
- "[o que o público elogia / quer]" — [fonte] [D]

### Dores Ocultas (fóruns e discussões anônimas)
- [dor que não aparece em reviews mas aparece em discussões] [D]

### Banco de Linguagem de Dor (Copy-Ready)
- "[frase literal]" — tipo: [hook / headline] [D]

### Alternativas que Já Tentaram
- [alternativa] — por que tentaram / por que falhou [D]

### Dados do Usuário
- [calls, tickets, pesquisas fornecidos pelo usuário] [U]

---

## R5 — Análise Competitiva e Gaps
*Pesquisa executada em: [data] | Skill: R5-competitiva.md*

### Por Concorrente

#### [Concorrente 1]
- **Ângulo principal:** [D] | **Promessa central:** "[frase]" [D]
- **Nível de consciência endereçado:** [1-5] [D]
- **Prova social usada:** [tipo] [D] | **Preço:** [dado se visível] [D]
- **O que NÃO dizem (gap):** [D]

### Mapa de Consciência do Mercado
| Concorrente | Nível primário | Gap (nível não ocupado) |
|---|---|---|
| [nome] | [nível] [D] | [nível aberto] [D] |

### Gaps Identificados
| Gap | Tipo | Dor que endereça | Oportunidade |
|---|---|---|---|
| [descrição] | [1/2/3] | [da R4] | [como explorar] [D] |

### Síntese Estratégica
- **Melhor ângulo de diferenciação:** [D]
- **Nível de consciência mais aberto:** [D]
- **Tipo de prova social mais eficaz:** [D]

---

## R6 — Perfil Psicográfico e Cultural
*Gerado em: [data] | Skill: R6-psicografica.md*
*⚠️ Todo conteúdo desta seção é [H] — validar com experiência direta do usuário*

### Geração e Contexto Formativo
- **Geração:** [nome] ([anos]) [H]
- **Eventos formativos:** [evento → impacto] [H]
- **Relação com dinheiro/estabilidade:** [H] | **Relação com tecnologia:** [H]

### Valores Centrais do Perfil
1. [valor] — por que importa [H]
2. [valor] [H]
3. [valor] [H]

### Vieses Cognitivos Predominantes
| Viés | Manifestação | Implicação para comunicação |
|---|---|---|
| [viés] | [como aparece] [H] | [como usar] |

### Relação com Autoridade e Risco
- **Autoridade:** [confia em especialistas / prefere pares / desconfia] [H]
- **Risco:** [early adopter / late majority] [H]
- **O que reduz friction:** [garantia / trial / referência / etc.] [H]

### Estilo de Comunicação
- **Tom:** [formal/informal/direto] [H]
- **Estrutura:** [narrativa/lista/dado+análise] [H]
- **Jargão:** [técnico aceitável / prefere simples] [H]

### Referências Culturais Prováveis
- **Mídia da formação:** [H] | **Referências que conectam:** [H]
- **Referências que alienam (evitar):** [H]

---

## Síntese Transversal
*Gerada após R1–R6 completas — cruza pesquisas para insights não-óbvios*

### Insights Validados (convergência [D] + [U])
- [insight confirmado por múltiplas fontes] — sustentado por R[x] e R[y]

### Hipóteses de Alto Impacto (forte sinal [D], aguarda [U])
- [hipótese] — validar com: [método sugerido]

### Contradições a Resolver
- [D] diz [X] mas [U] diz [Y] — implicação: [o que fazer]

### Top 5 Insights Acionáveis para o Pipeline de Conteúdo
1. [insight com aplicação direta em copy / posicionamento / canal]
2. [insight]
3. [insight]
4. [insight]
5. [insight]

---

## Como as Skills 4.x Usam Este Arquivo

| Skill | Seções prioritárias | O que extrai |
|---|---|---|
| 4.1 Target Audiences | R1 | Contexto setorial para sugestões de segmentação |
| 4.2 Persona Builder | R2, R3, R6 | Dados demográficos + linguagem + perfil psicográfico |
| 4.3 Pain & Desire | R3, R4, R6 | Linguagem de dor validada + hierarquia emocional |
| 4.4 Nine Audiences | R4, R5 | Voz do público + gaps competitivos por tipo |
| 4.5 Consciousness | R5, R3 | Nível competitivo + vocabulário por nível de consciência |
