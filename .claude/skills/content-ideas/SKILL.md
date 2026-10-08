---
name: content-ideas
description: "Gera pautas de conteúdo e calendário editorial para Instagram (carrossel, reels, stories) a partir do contexto da empresa. Use quando o usuário disser 'ideias de conteúdo', 'o que postar', 'pautas', 'sem ideia', 'calendário editorial', 'planejar o mês', 'grade de posts', 'analisar concorrente/criador', ou pedir temas para posts."
---

# Ideias e calendário de conteúdo

## Ler antes
`companies/<slug>/context/` → `CONTENT_STRATEGY.md`, `AUDIENCE.md`, `BUSINESS.md`, `COMPETITORS.md`. Olhe os nomes das pastas em `contents/` para não repetir pauta. Se existir, leia o relatório da semana mais recente em `companies/<slug>/intel/semanas/` (o que os concorrentes publicaram e o que ficou fora da curva).

**Precedência:** pilares, mix de funil, frequência, regras de sequência e temas proibidos do `CONTENT_STRATEGY.md`/`BUSINESS.md` vencem os defaults desta skill.

## Modo 1 — Pautas (padrão)

Entregue **10 pautas** numa tabela:

| # | pilar | funil | formato | hook da capa / 1º frame | sinal-alvo | origem no contexto |
|---|---|---|---|---|---|---|

**Formato** = um id da galeria `library/formatos/` (ex.: `post-frase`, `texto-cinetico`; filtre por `tipos` e `funil` do `formato.json` e leia as `observacoes` do Oliver). Ideia boa sem formato na galeria → diga "formato novo" e sugira cadastrar como rascunho.

- **Ângulo > tema.** "Agenda de terapeuta" é tema; "Seu consultório mora no WhatsApp" é ângulo. A coluna de hook já é o ângulo escrito como o público vai ver.
- **Origem real:** toda pauta nasce de uma dor, objeção, frase literal (`AUDIENCE.md`), crença errada do nicho ou gap de concorrente. Cite em 2–4 palavras. Sem origem → descarte.
- **Sinal-alvo** (um): `envio` (DM, "manda pra colega"), `salvar`, `comentário` ou `clique`. Topo mira envio; lista/checklist mira salvar.
- **Mix** (se a empresa não definir): ~55% topo, ~25% meio, ~20% fundo.
- **Formato:**
  - **carrossel:** ensinar, listas, checklists, comparações (salvar);
  - **reels:** dor rápida, humor, demo de 15–30 s (alcance e envio). Marque quem produz: `câmera` (alguém grava) ou `motion` (sem rosto, skill `video`). Respeite o limite de vídeo com rosto do `CONTENT_STRATEGY.md`;
  - **stories:** bastidor, enquete, CTA direto.
- **Fora:** temas que o `COMPETITORS.md` marca como saturados; datas sensíveis com uso comercial; nicho regulado (saúde): nada de promessa de resultado terapêutico nem caso/fala de paciente.
- **Travou?** Inverter crença · número/caso hiper-específico **real** · erro comum · antes/depois da rotina · "ninguém fala sobre" · bastidor do fundador · mito vs. verdade · comparação com outro universo.

Termine perguntando quais seguem para produção (skill `ig-post`).

## Modo 2 — Calendário

Pergunte só o que faltar: período, frequência (padrão: a do `CONTENT_STRATEGY.md`), datas especiais, lançamento.

Tabela `data | dia | formato | pilar | funil | pauta | status` → salvar em `companies/<slug>/contents/calendario-AAAA-MM.md`.

Regras (se a empresa não tiver as suas): ≥ 1 topo por semana; máx. 2 seguidos do mesmo pilar; nunca 2 fundos seguidos; data comemorativa só com ligação real com a marca; 1 espaço/semana para reativo.

## Modo 3 — Engenharia reversa (criador/concorrente)

Com perfis ou posts de referência:
1. Os 10 posts de maior desempenho (views, comentários, envios se houver).
2. Para cada: formato, hook (texto exato), estrutura, CTA, emoção dominante.
3. 3–5 padrões que se repetem.
4. 5 pautas para a empresa: mesmo mecanismo, assunto nosso, nunca cópia.

## Saída
Tabela no chat. Pautas aprovadas → 1 tarefa por pauta no quadro `companies/<slug>/board/` (`board: conteudo`, `status: todo`, `assignee: ai`; id via `node tools/board.mjs <slug> --next-id`).
