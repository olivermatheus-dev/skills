---
name: content-ideas
description: "Gera pautas de conteúdo e calendário editorial para Instagram (carrossel, reels, stories) a partir do contexto da empresa. Use quando o usuário disser 'ideias de conteúdo', 'o que postar', 'pautas', 'sem ideia', 'calendário editorial', 'planejar o mês', 'grade de posts', 'analisar concorrente/criador', ou pedir temas para posts."
---

# Ideias e calendário de conteúdo

## Ler antes
`companies/<slug>/context/` → `CONTENT_STRATEGY.md`, `AUDIENCE.md`, `BUSINESS.md`. Se houver, `COMPETITORS.md` e as últimas peças em `contents/` (para não repetir).

## Modo 1 — Pautas (padrão)

Entregue **10 ideias** numa tabela:

| # | pilar | funil | formato | ideia (título de trabalho) | ângulo | por que funciona p/ a persona |
|---|---|---|---|---|---|---|

Regras:
- **Ângulo > tema.** "Agenda de terapeuta" é tema; "O WhatsApp está atendendo mais que você" é ângulo.
- Toda ideia nasce de algo real do contexto: uma dor, objeção, frase literal, crença errada do nicho ou fraqueza de concorrente. Cite a origem em 2–4 palavras.
- Mix padrão: ~50% topo (dor/identificação/educação), ~30% meio (método, comparação, bastidores, prova), ~20% fundo (oferta, objeção, depoimento, demo).
- Formato: **reels** para alcance e dor rápida; **carrossel** para ensinar, listas, comparações e salvar; **stories** para bastidores, enquete e CTA direto.
- Técnicas de ângulo quando travar: inverter crença comum · número/caso hiper-específico · erro que o público comete · antes/depois · "ninguém fala sobre" · bastidor do fundador · mito vs verdade · comparação com algo de outro universo.

Termine perguntando quais ideias seguem para produção (skill `ig-post`).

## Modo 2 — Calendário

Pergunte só: período (semana/mês) e frequência (padrão: a de `CONTENT_STRATEGY.md`), datas especiais ou lançamento.

Entregue tabela `data | dia | formato | pilar | funil | pauta | status` e salve em `companies/<slug>/contents/calendario-AAAA-MM.md`.

Regras: nunca 2 posts de fundo seguidos; pelo menos 1 topo por semana; rotacionar pilares (máx. 2 seguidos do mesmo); datas comemorativas só se tiverem ligação real com a marca.

## Modo 3 — Engenharia reversa (criador/concorrente)

Quando o usuário passar perfis ou posts de referência:
1. Liste os 10 posts de maior desempenho (views/curtidas/comentários se disponíveis).
2. Para cada: formato, hook (texto exato), estrutura, CTA, emoção dominante.
3. Extraia 3–5 padrões que se repetem.
4. Adapte em 5 pautas para a empresa (sem copiar — mesmo mecanismo, assunto nosso).

## Saída
Tabela no chat. Se o usuário aprovar ideias, adicione linhas em `companies/<slug>/tasks.md` (tipo `conteudo`).
