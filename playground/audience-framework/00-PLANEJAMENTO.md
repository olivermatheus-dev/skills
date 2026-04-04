# Projeto: Audience Mapping Framework

**Status:** Em construção — Fase 1 em andamento  
**Objetivo:** Redesenhar a skill `04-audience-profiles` em um conjunto de skills especializadas que produzam o mapeamento completo de públicos-alvo, personas e os 9 tipos de audiência.

---

## O Problema Atual

A skill `setup/04-audience-profiles/SKILL.md` é rasa. Ela faz até 3 personas com 8 perguntas cada. Não distingue público-alvo de persona, não mapeia os 9 tipos de público, não usa frameworks modernos de psicologia de compra, e não gera arquivos separados por público — o que dificulta o uso por LLMs nas etapas seguintes do pipeline.

---

## Decisões de Arquitetura

| Decisão | Escolha |
|---------|---------|
| Estrutura de skills | Skills separadas, numeradas: `4.1 — Nome`, `4.2 — Nome` |
| Output por público | Um arquivo por público-alvo: `AUDIENCE_[nome].md` |
| Onde ficam os arquivos | `companies/[empresa]/audiences/` |
| Conteúdo do arquivo | Persona + dores + desejos + valores + comunicação + cultura + classe social + renda + 9 tipos mapeados |
| Modificar a skill atual | Não — novo sistema construído do zero |

---

## Arquitetura Final das Skills

```
setup/04-audience-profiles/
├── SKILL.md                          ← Orquestrador: entrada, contexto, sequência
├── skills/
│   ├── 4.1-target-audiences.md       ← Identificar grupos amplos de público-alvo
│   ├── 4.2-persona-builder.md        ← Criar persona para cada público-alvo
│   ├── 4.3-pain-desire-mapper.md     ← Dores, desejos, medos, JTBD por persona
│   ├── 4.4-nine-audiences.md         ← Mapear os 9 tipos de público por persona
│   └── 4.5-consciousness-mapping.md  ← Nível de consciência × estratégia de conteúdo
└── references/
    ├── persona-questions.md           ← Banco de perguntas (ver 03-PERGUNTAS.md)
    ├── nine-audiences-guide.md        ← Guia dos 9 tipos (ver 01-PESQUISA.md)
    ├── pain-taxonomies.md             ← Taxonomia de dores por setor
    ├── jtbd-frameworks.md             ← Jobs-to-Be-Done aplicado
    └── output-template.md             ← Template do AUDIENCE_[nome].md
```

### Output gerado por empresa

```
companies/[empresa]/
└── audiences/
    ├── AUDIENCE_empreendedores-iniciantes.md
    ├── AUDIENCE_gestores-de-marketing.md
    └── AUDIENCE_[nome-publico].md
```

Cada arquivo contém: persona, dados demográficos, classe social, renda estimada, dores profundas, desejos, valores, JTBD, cultura, comunicação, nível de consciência, e os 9 tipos mapeados para aquele público.

---

## Fases do Projeto

### Fase 1 — Pesquisa e Framework Teórico ← ESTAMOS AQUI
**Entregável:** Documentos de referência e pesquisa nesta pasta

- [x] Pesquisa sobre os 9 tipos de público (Conrado Adolpho)
- [x] Pesquisa sobre frameworks modernos (5 Rings, JTBD, Níveis de Consciência)
- [x] Lista de o que mapear (óbvio e não-óbvio)
- [ ] Banco de perguntas completo e organizado por dimensão
- [ ] Taxonomia de dores por setor
- [ ] Guia dos 9 tipos com estratégias práticas

**Arquivos desta fase:** `01-PESQUISA.md`, `03-PERGUNTAS.md`

---

### Fase 2 — Template de Output
**Entregável:** `references/output-template.md` — estrutura completa do `AUDIENCE_[nome].md`

O template deve ser:
- Legível por LLMs (estrutura clara, seções bem nomeadas)
- Completo o suficiente para alimentar todo o pipeline de conteúdo
- Com comentários explicando o que cada campo significa

---

### Fase 3 — Skill 4.1: Target Audiences
**Entregável:** `skills/4.1-target-audiences.md`

O que esta skill faz:
- Lê `PRODUCT_CONTEXT.md` e `COMPANY_PROFILE.md`
- Faz perguntas para identificar grupos amplos de público-alvo
- Diferencia B2B (quem compra vs. quem usa) de B2C
- Sugere segmentos baseados no produto/problema central
- Define quantos públicos-alvo trabalhar (recomendação: 2–4 para o setup inicial)
- Nomeia cada público-alvo de forma descritiva

---

### Fase 4 — Skill 4.2: Persona Builder
**Entregável:** `skills/4.2-persona-builder.md`

O que esta skill faz:
- Uma persona por público-alvo identificado na 4.1
- Constrói a pessoa com história, contexto, rotina
- Aplica os 5 Rings of Buying Insight (Adele Revella)
- Captura a linguagem literal da persona
- Mapeia dados demográficos, classe social, renda estimada

---

### Fase 5 — Skill 4.3: Pain & Desire Mapper
**Entregável:** `skills/4.3-pain-desire-mapper.md`

O que esta skill faz:
- Dores em 3 camadas: superficial, profunda, medo não declarado
- Desejos: declarados + aspirações de identidade
- Jobs-to-Be-Done: funcional, emocional, social
- O que já tentaram → por que falhou → frustração acumulada
- Custo da inação: o que acontece se não resolverem

---

### Fase 6 — Skill 4.4: Nine Audiences
**Entregável:** `skills/4.4-nine-audiences.md`

O que esta skill faz:
- Para cada persona, mapeia os 9 tipos de público
- Identifica em qual tipo a maioria do público atual se encontra
- Define mensagem, canal, objetivo e gatilho de avanço para cada tipo
- Ajuda a priorizar quais tipos focar na estratégia de conteúdo

---

### Fase 7 — Skill 4.5: Consciousness Mapping
**Entregável:** `skills/4.5-consciousness-mapping.md`

O que esta skill faz:
- Mapeia o nível de consciência predominante da persona
- Define quais tipos de conteúdo funcionam em cada nível
- Gera a matriz Consciência × Conteúdo (TOFU/MOFU/BOFU revisitada)
- Sugere headlines e ganchos para cada nível

---

### Fase 8 — Orquestrador e Integração
**Entregável:** `SKILL.md` reescrito + impact-map atualizado

- Reescrever o `SKILL.md` como orquestrador que chama 4.1 → 4.5 em sequência
- Atualizar impact-map: novos arquivos `AUDIENCE_[nome].md` impactam CONTENT_PILLARS
- Verificar integração com skills de conteúdo que leem os arquivos de audiência

---

## Contexto Disponível Quando as Skills Rodam

| Arquivo | O que contém | Como usar |
|---------|-------------|-----------|
| `COMPANY_PROFILE.md` | Nome, missão, valores, stage, canais | Stage → complexidade das personas |
| `PRODUCT_CONTEXT.md` | Produto, problema central, diferenciadores, pricing, modelo | Pré-sugerir dores, objeções por pricing |
| `BRAND_VOICE.md` | Arquétipo, tons, vocabulário, endereçamento | Guiar linguagem das personas, estilo de comunicação |

---

## Critério de Sucesso

O framework está completo quando:
1. Qualquer empresa pode passar por todas as 5 sub-skills e ter seus públicos mapeados com profundidade
2. Cada arquivo `AUDIENCE_[nome].md` gerado é rico o suficiente para alimentar 6+ meses de estratégia de conteúdo
3. Uma LLM lendo os arquivos de audiência consegue sugerir temas, hooks, formatos e canais sem informações adicionais
4. As sugestões automáticas das skills são tão boas que o usuário raramente precisa criar respostas do zero
