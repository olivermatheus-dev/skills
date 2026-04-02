---
name: content-ideation
description: "Gera ideias de conteúdo para redes sociais organizadas por estágio de funil (TOFU/MOFU/BOFU) e pilar temático. Use quando o usuário quiser brainstormar temas, encontrar sobre o que postar, gerar pautas, preencher calendário com ideias, ou disser que está sem ideias, bloqueado criativamente, ou precisar de inspiração. Também use quando mencionar 'não sei o que postar', 'me dá ideias', 'preciso de temas', 'o que falar sobre', 'pautas para a semana'. Se o usuário pedir 'conteúdo' de forma genérica e os context files existirem, esta skill é o ponto de partida natural."
---

# Skill 1 — Ideation Engine

## Propósito

Gerar ideias de conteúdo de alta qualidade, organizadas por pilar temático e estágio de funil, com ângulos específicos e provocativos — nunca genéricos.

## Context Files Obrigatórios

Carregar ANTES de gerar qualquer ideia:
- `CONTENT_PILLARS.md` — pilares temáticos definidos
- `AUDIENCE_PROFILES.md` — dores e nível de consciência por persona
- `COMPETITOR_MAP.md` — gaps de conteúdo identificados
- `PRODUCT_CONTEXT.md` — features e diferenciais para ângulos únicos

**NÃO carregar:** BRAND_VOICE, PLATFORM_SPECS, HOOK_LIBRARY, VISUAL_IDENTITY

## Perguntas Iniciais

Antes de gerar, perguntar ao usuário:
1. Para qual persona está gerando? (ou todas?)
2. Qual estágio de funil priorizar? (TOFU/MOFU/BOFU ou mix?)
3. Há algum tema urgente ou sazonal?
4. Quantas ideias quer? (default: 10)

## Framework de Geração — Matriz 3×3×3

Cada ideia nasce do cruzamento de três dimensões:

| Dimensão | Opções |
|---|---|
| **Pilar temático** | Os pilares definidos em CONTENT_PILLARS |
| **Estágio de funil** | TOFU (consciência do problema) · MOFU (consideração) · BOFU (decisão) |
| **Ângulo de abordagem** | Contrarian · Dados/Números · História pessoal · How-to · Erro comum · Comparativo · Provocação |

## Regras de Qualidade

O que separa uma ideia boa de uma ideia genérica:

**Nunca genérico.** "A importância do CRM" é proibido. Sempre com ângulo específico e provocativo: "Por que seu melhor vendedor está te sabotando sem saber".

**Por estágio de funil:**
- **TOFU:** Dores não-óbvias que o público não reconhece como problema. O objetivo é fazer a pessoa pensar "nossa, isso acontece comigo". Ex: "Por que sua equipe vende diferente de você — e o custo invisível disso"
- **MOFU:** Comparações, frameworks, provas de que o problema tem solução. Ex: "O framework de 3 etapas que times de 3 pessoas usam para vender como times de 10"
- **BOFU:** Objeções, provas sociais, urgência. Ex: "O que acontece com seus leads nas primeiras 48h sem um funil estruturado"

**Pattern interrupts:** Priorizar ângulos contraintuitivos que quebram a expectativa do leitor. Se todo mundo no setor fala X, diga "X está errado, e aqui está o porquê".

## Proporção Padrão (ajustável)

- 50% TOFU / 30% MOFU / 20% BOFU
- Se em fase de lançamento: 30% TOFU / 30% MOFU / 40% BOFU

## Formato de Output

Para cada ideia gerada:

```markdown
## Ideia #[N]
- **Título provisório:** "[título com gancho — não é o hook final, é o conceito]"
- **Pilar:** [nome do pilar]
- **Funil:** [TOFU/MOFU/BOFU] — [descrição do objetivo]
- **Persona:** [nome da persona-alvo]
- **Ângulo:** [categoria do ângulo]
- **Formato sugerido:** [Carrossel LinkedIn / Reels / Post longo / etc.]
- **Por que funciona:** [1 frase explicando o gatilho emocional ou intelectual]
```

## Geração em Lote

Ao gerar múltiplas ideias:
1. Distribuir entre os pilares de forma equilibrada (não mais que 2 consecutivas do mesmo pilar)
2. Respeitar a proporção TOFU/MOFU/BOFU
3. Variar os ângulos de abordagem (não repetir o mesmo ângulo 3x)
4. Ao final, destacar as 3 ideias com maior potencial e explicar por quê
5. Perguntar: "Quer aprofundar alguma dessas? Posso pesquisar e fundamentar."

## Técnicas para Gerar Ângulos Originais

Quando os temas parecerem saturados, aplicar estas técnicas:

- **Inversão:** Se todos dizem "faça X", explorar "por que fazer X pode estar errado"
- **Especificidade extrema:** Em vez de "dicas de vendas", usar "o que fazer nos primeiros 47 segundos de uma ligação de prospecção"
- **Cruzamento de domínios:** Trazer conceitos de fora do setor (ex: "o que videogames ensinam sobre motivação de vendedores")
- **Zoom in:** Pegar um tópico amplo e focar em um microdetalhe que ninguém cobre
- **Provocação calculada:** Afirmações fortes que geram debate (ex: "CRM não salva empresa nenhuma")
