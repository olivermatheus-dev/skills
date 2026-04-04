# R4 — Análise Qualitativa de Audiência (Voz do Público)

**Responsabilidade:** Coletar a voz não-filtrada do público — reclamações reais, frustrações reais, desejos reais — de fontes onde as pessoas falam sem filtro de marketing. Essa é a pesquisa de maior impacto para copywriting e posicionamento.

**Quando aciona:** Durante a Skill 4.3 (Pain & Desire Mapper), após a persona ter esqueleto básico (demografia + psicografia) e a lista de concorrentes estar disponível da R1.

> **Importante:** Esta skill SÓ funciona bem quando a R1 (pesquisa setorial) já foi executada. Os concorrentes identificados na R1 são os alvos das buscas no Reclame Aqui e Google Reviews.

**Input necessário:**
- Lista de concorrentes (da R1 — campo "Players Identificados")
- Nicho/problema principal
- Perfil básico da persona (quem procura por esse tipo de solução)

**Perguntar ao usuário antes de pesquisar:**
> "Antes de pesquisar externamente: você tem transcrições de calls de vendas, respostas de pesquisas com clientes, tickets de suporte, ou mensagens de clientes insatisfeitos? Esses dados são ouro — me passe o que tiver e eu processo antes de ir ao externo."

---

## O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Reclamações reais com linguagem do cliente | Reclame Aqui (empresas da lista R1) | Dores não-resolvidas, linguagem emocional das frustrações |
| O que o mercado entrega mal | Google Reviews 1-3 estrelas (concorrentes) | Expectativas quebradas = desejos não atendidos |
| O que encanta nos concorrentes | Google Reviews 4-5 estrelas | O que o público VALORIZA = expectativas mínimas e diferenciais |
| Discussões espontâneas do público | Reddit, Quora, fóruns do setor | Dores e desejos sem filtro, linguagem coloquial real |
| Comentários em conteúdo do nicho | YouTube (vídeos relevantes sobre o problema) | Linguagem, nível de consciência, dúvidas não respondidas |

---

## Como usar os dados nas etapas seguintes

```
Palavras exatas das reclamações   → Skill 4.3: linguagem de dor validada (P4.1, P8.1)
                                  → Skill 4.5: hooks e headlines que param o scroll
Padrões de frustração             → Skill 4.3: hierarquia de dor (qual dor mais arde)
                                  → Skill 4.4: o que move cada tipo dos 9 públicos
O que encanta nos concorrentes    → Skill 4.3: desejos confirmados (Dimensão 5)
                                  → Skill 4.5: standard mínimo de entrega para o mercado
Discussões em fóruns              → Skill 4.3: dores ocultas, vergonhas (P4.8, P2.7)
                                  → Skill 4.5: nível de consciência real do público
```

---

## Protocolo de Análise

Ao processar as fontes, a IA deve:

1. **Extrair citações literais** — não parafrasear. As palavras exatas são matéria-prima de copy.
2. **Rankear por frequência × intensidade** — quantas vezes aparece × quão emocionalmente carregado é
3. **Identificar o verbo emocional** — raiva, frustração, decepção, medo, vergonha, esperança
4. **Conectar ao framework de dor** — em qual dos 4 níveis (operacional / estratégico / emocional / existencial) essa dor se encaixa?
5. **Sinalizar o gap** — dores frequentes que nenhum concorrente endereça bem

---

## Output — Seção R4 de RESEARCH_[publico].md

```markdown
## R4 — Voz do Público (Qualitativo)
*Pesquisa executada em: [data]*
*Fontes pesquisadas: [lista de onde pesquisou]*

### Temas de Dor Mais Frequentes (ordenados por frequência × intensidade)

#### Tema 1: [Nome do tema]
- **Frequência:** [N] menções em [N] fontes [D]
- **Intensidade emocional:** Alta / Média / Baixa
- **Nível na Pirâmide de Dor:** Operacional / Estratégico / Emocional / Existencial
- **Citações literais:**
  - "[citação exata do cliente]" — [Reclame Aqui / Review / Reddit] [D]
  - "[citação exata]" [D]

#### Tema 2: [Nome do tema]
[mesma estrutura]

### Desejos Confirmados pelo Público
(extraídos de reviews positivos e comentários aspiracionais)
- "[o que o público elogia / deseja]" — [fonte] [D]
- "[citação]" [D]

### Dores Ocultas Identificadas
(apareceram em fóruns/Reddit — não em reviews/reclame aqui)
- [dor que o público não diz abertamente mas aparece em discussões anônimas] [D]

### Banco de Linguagem (Copy-Ready)
Frases que o próprio público usa e que funcionam como headlines:
- "[frase literal]" — tipo de conteúdo: [hook / headline / subject de email] [D]
- "[frase literal]" [D]

### Alternativas Consideradas (o que tentaram antes)
- [alternativa 1] — por que tentaram + por que não funcionou [D]
- [alternativa 2] [D]

### Notas de Qualidade da Pesquisa
- Amostras coletadas: [N] fontes, [N] citações
- Viés identificado: [ex: "Reclame Aqui tende a super-representar casos não resolvidos"]
- Confiança geral: Alta / Média / Baixa

### Dados do Usuário (se fornecido)
- [summary de calls/tickets/pesquisas fornecidos] [U]
- Divergências com dados externos: [se houver] [U vs D]
```

---

## Regra de Ouro desta Skill

> Você não escreve copy. Você minera copy. As melhores headlines já foram escritas pelo cliente, numa avaliação de 1 estrela de um concorrente ou numa thread do Reddit às 2 da manhã. A R4 vai buscar isso.
