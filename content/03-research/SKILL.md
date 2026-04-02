---
name: content-research
description: "Realiza pesquisa aprofundada sobre um tópico de conteúdo, buscando dados, estatísticas, cases, citações e ângulos originais na web. Use quando o usuário escolheu um tema e precisa de fundamentação antes de escrever, ou quando pedir para pesquisar um tópico, buscar dados, encontrar estatísticas, fundamentar argumentos, ou validar informações para conteúdo. Também use quando mencionar 'preciso de dados', 'busca estatísticas sobre', 'me fundamenta isso', 'quero provar que', 'existe pesquisa sobre'. Se o usuário tem um tema mas precisa de substância para o conteúdo, esta é a skill."
---

# Skill 2 — Deep Research

## Propósito

Pesquisar e fundamentar um tópico de conteúdo com dados verificáveis, cases reais, citações de autoridade e ângulos originais — tudo organizado para facilitar a redação.

## Context Files Obrigatórios

Carregar ANTES de pesquisar:
- `PRODUCT_CONTEXT.md` — como o tema se conecta ao produto
- `AUDIENCE_PROFILES.md` — quais dados ressoam com a persona
- `COMPETITOR_MAP.md` — o que concorrentes já disseram sobre o tema

**NÃO carregar:** BRAND_VOICE, CONTENT_PILLARS, PLATFORM_SPECS, HOOK_LIBRARY, VISUAL_IDENTITY

## Input Esperado

- Tema/ideia (output da Skill 1 ou input direto)
- Ângulo específico desejado
- Persona-alvo
- Profundidade: rápida (3-5 dados) ou completa (pesquisa 5 camadas)

## Protocolo de Pesquisa — 5 Camadas

| Camada | O que buscar | Fontes aceitáveis |
|---|---|---|
| 1. Dados e estatísticas | Números que provam/dimensionam o problema | Gartner, McKinsey, IBGE, Sebrae, Endeavor, pesquisas acadêmicas |
| 2. Cases e exemplos | Histórias reais que ilustram | Blogs referência (HubSpot, Salesforce, RD Station), cases publicados |
| 3. Citações de autoridade | Frases de especialistas | Livros (SPIN Selling, Receita Previsível), palestras, entrevistas |
| 4. Contra-argumentos | O que o "outro lado" diria | Fóruns, comentários em posts virais, objeções do AUDIENCE_PROFILES |
| 5. Gaps de conteúdo | O que ninguém está dizendo | Cruzar conteúdo de concorrentes vs. o que falta |

## Verificação de Fontes (CRAAP Adaptado)

Para cada dado incluído, verificar:

- **Atualidade:** Dado tem menos de 2 anos? Se não, sinalizar como histórico
- **Relevância:** Aplica ao contexto brasileiro de PMEs? Dados americanos sinalizados como referência internacional
- **Autoridade:** Instituto de pesquisa? Empresa respeitada? Blog aleatório?
- **Precisão:** Encontrado em 2+ fontes independentes? (dados importantes precisam de dupla verificação)
- **Propósito:** Fonte tem viés comercial? ("pesquisa" da própria empresa vendendo o produto)

## Regras de Integridade

- NUNCA inventar estatísticas. Se não encontrar, dizer: "Não encontrei dados específicos sobre X, mas Y sugere que..."
- SEMPRE incluir fonte com link para dados quantitativos
- Priorizar fontes primárias (estudo original, não quem citou o estudo)
- Contexto brasileiro: priorizar Sebrae, Endeavor, IBGE, ABComm, associações setoriais
- Se dado parece bom demais → buscar verificação cruzada

## Hierarquia de Fontes

1. Pesquisas acadêmicas e relatórios de institutos
2. Consultorias (McKinsey, BCG, Gartner, Bain)
3. Pesquisas de empresas do setor (HubSpot State of Marketing, etc.)
4. Blogs referência com dados proprietários
5. Artigos jornalísticos de veículos reconhecidos
6. Posts de especialistas (LinkedIn/Twitter)
7. Fóruns e comunidades — SOMENTE como evidência anedótica

## Formato de Output

```markdown
# Pesquisa: [Título do tema]
**Persona-alvo:** [qual]
**Ângulo:** [qual]
**Data da pesquisa:** [data]

## 1. Dados-chave
- [Dado 1] — Fonte: [link] — Verificação: ✅ 2+ fontes
- [Dado 2] — Fonte: [link] — Verificação: ⚠️ 1 fonte

## 2. Cases e exemplos
- [Case com resumo em 2-3 frases]

## 3. Citações de autoridade
- "[Citação curta]" — [Autor], [Contexto/Livro]

## 4. Contra-argumentos e objeções
- Objeção: "[texto]" → Resposta: "[texto]"

## 5. Gaps identificados
- Ninguém fala sobre [X]
- Ângulo original possível: [Y]

## 6. Resumo executivo para o redator
[3-5 frases com os insights mais poderosos para usar no conteúdo]
```

Consultar `references/source-tiers.md` para hierarquia detalhada de fontes, quando disponível.
