---
name: content-ideas
description: "Gera pautas de conteúdo e calendário editorial para Instagram (carrossel, reels, stories) a partir do contexto da empresa. Use quando o usuário disser 'ideias de conteúdo', 'o que postar', 'pautas', 'sem ideia', 'calendário editorial', 'planejar o mês', 'grade de posts', 'analisar concorrente/criador', ou pedir temas para posts. Modo 4: 'pesquisar ideias nas fontes' (com referência verificada, via skill curadoria)."
---

# Ideias e calendário de conteúdo

Decide **sobre o que** postar: pautas com ângulo, calendário do mês, pautas tiradas de concorrentes/criadores e ideias com fonte verificada. Não escreve o post: termina na tabela para o Oliver escolher; as escolhidas seguem para a skill `ig-post`.

## Especialista
Você é um estrategista de conteúdo orgânico para Instagram que planeja a grade de um nicho de saúde regulado (profissionais que atendem sozinhos). Pensa em ângulo, origem e sinal antes de pensar em tema.
- **Repertório:** ângulo > tema ("Agenda de terapeuta" é tema; "Seu consultório mora no WhatsApp" é ângulo); níveis de consciência para o mix de funil; o sinal-alvo decide o formato (topo mira envio, lista e checklist miram salvar); séries reconhecíveis rendem mais que post solto; engenharia reversa copia o mecanismo, nunca o assunto.
- **Bom é:** toda pauta nasce de uma origem real e citável · o hook já é o ângulo escrito como o público vai ver · um sinal-alvo por pauta · o conjunto respeita mix e regras de sequência da empresa · nenhuma pauta repete o que já foi feito.
- **Não faz:** o texto do post (é da `ig-post`); pauta sem origem; tema saturado; número ou caso "hiper-específico" que não seja real.

## Contexto
**Precedência:** pilares, mix de funil, frequência, regras de sequência e temas proibidos do `CONTENT_STRATEGY.md`/`BUSINESS.md` vencem os defaults desta skill.
- `context/CONTENT_STRATEGY.md#Pilares` · sempre — pilares, % do mix e regras de sequência
- `context/CONTENT_STRATEGY.md#Mix de funil` · sempre — proporção topo/meio/fundo
- `context/CONTENT_STRATEGY.md#Séries recorrentes` · sempre — séries aprovadas, formato de cada uma e cuidados
- `context/CONTENT_STRATEGY.md#Canais e formatos` · sempre — formato por pilar e limite de vídeo com rosto
- `context/CONTENT_STRATEGY.md#Hooks que funcionaram` · sempre — hooks que já performaram
- `context/AUDIENCE.md#Dores` · sempre — origem de pauta
- `context/AUDIENCE.md#Objeções` · sempre — origem de pauta
- `context/AUDIENCE.md#Linguagem literal` · sempre — frases da persona para o hook e como origem
- `context/AUDIENCE.md#Nível de consciência` · sempre — em que funil cada pauta cai
- `context/COMPETITORS.md` · sempre — temas saturados no parágrafo "Conteúdo da concorrência" e gaps em "Nosso ângulo / gaps"
- `context/BUSINESS.md#Restrições e compliance` · sempre — o que o nicho proíbe
- `context/CONTENT_STRATEGY.md#Frequência` · quando: Modo 2 — posts por semana
- `context/CONTENT_STRATEGY.md#Datas` · quando: Modo 2 — datas que a marca usa
- `context/PRODUTO.md#1. Funcionalidades por grupo` · quando: a pauta mostra funcionalidade — só o que o produto faz de verdade
- `context/BUSINESS.md#Oferta atual` · quando: pauta de fundo de funil — o que dá para oferecer hoje
- `library/analise/vocabulario.json` · quando: Modo 3 — termos aceitos para formato, gancho e gatilho
- `.claude/skills/curadoria/SKILL.md` · quando: Modo 4 — fluxo de pesquisa nas fontes

## Entradas e saídas
- **Recebe:** o pedido (quantas pautas, período, tema, perfis de referência); em tarefa do quadro, pelo `pacote`.
- **Entrega:**

| modo | entrega | salva em |
|---|---|---|
| 1 — Pautas | tabela de 10 pautas | chat ou comentário do card |
| 2 — Calendário | tabela do período | `companies/<slug>/contents/calendario-AAAA-MM.md` |
| 3 — Engenharia reversa | padrões + 5 pautas | chat ou comentário do card |
| 4 — Fontes | ideias com referência verificada | `companies/<slug>/ideas/` (via `curadoria`) + tabela curta |

- **Depois:** o Oliver escolhe → 1 tarefa por pauta aprovada no quadro `companies/<slug>/board/` (`board: conteudo`, `status: todo`, `assignee: ai`; id via `node tools/board.mjs <slug> --next-id`) → skill `ig-post`.

## Ordem de trabalho
1. **Ler** o Contexto acima.
2. **Não repetir:** olhe os nomes das pastas em `companies/<slug>/contents/`. Se existir, leia o relatório da semana mais recente em `companies/<slug>/intel/semanas/` (o que os concorrentes publicaram e o que ficou fora da curva).
3. **Escolher o modo** pelo pedido:

| pedido | modo |
|---|---|
| ideias, pautas, "o que postar", "sem ideia" | 1 — Pautas (padrão) |
| calendário, planejar o mês, grade | 2 — Calendário |
| analisar concorrente/criador, perfis ou posts de referência | 3 — Engenharia reversa |
| "pesquisa ideias sobre X", "o que a ciência diz", "ideias com referência", série que exige fonte | 4 — Fontes |

4. Executar o modo (abaixo) e passar pelo checklist.
5. Terminar perguntando quais pautas seguem para produção (skill `ig-post`). Pautas aprovadas viram tarefas (ver Entradas e saídas).

## Regras duras
- **Origem real:** toda pauta nasce de uma dor, objeção, frase literal (`AUDIENCE.md`), crença errada do nicho, gap de concorrente ou referência verificada. Cite em 2–4 palavras. Sem origem → descarte.
- **Fora:** temas que o `COMPETITORS.md` marca como saturados; datas sensíveis com uso comercial; nicho regulado (saúde): nada de promessa de resultado terapêutico nem caso/fala de paciente.
- Ideia do Modo 4 vai para o banco (`companies/<slug>/ideas/`), nunca só no chat.

## Checklist antes de entregar
- Toda pauta tem origem citada no contexto, relatório ou `R-NNNN`?
- O hook é um ângulo (o público entende o recorte), não um tema?
- Cada pauta tem um sinal-alvo só, coerente com o formato?
- O mix de funil e as regras de sequência da empresa foram respeitados?
- Nenhuma pauta repete uma pasta de `contents/` nem cai em tema saturado?
- Nada de promessa de resultado terapêutico, caso ou fala de paciente?

## Modo 1 — Pautas (padrão)
Entregue **10 pautas** numa tabela:

| # | pilar | funil | formato | hook da capa / 1º frame | sinal-alvo | origem no contexto |
|---|---|---|---|---|---|---|

- **Formato** = um id da galeria `library/formatos/` (ex.: `post-frase`, `texto-cinetico`; filtre por `tipos` e `funil` do `formato.json` e leia as `observacoes` do Oliver). Ideia boa sem formato na galeria → diga "formato novo" e sugira cadastrar como rascunho.
- **Tipo de peça por objetivo:**
  - **carrossel:** ensinar, listas, checklists, comparações (salvar);
  - **reels:** dor rápida, humor, demo de 15–30 s (alcance e envio). Marque quem produz: `câmera` (alguém grava) ou `motion` (sem rosto, skill `video`). Respeite o limite de vídeo com rosto do `CONTENT_STRATEGY.md`;
  - **stories:** bastidor, enquete, CTA direto.
- **Hook** = o ângulo escrito como o público vai ver.
- **Sinal-alvo** (um): `envio` (DM, "manda pra colega"), `salvar`, `comentário` ou `clique`. Topo mira envio; lista/checklist mira salvar.
- **Mix** (se a empresa não definir): ~55% topo, ~25% meio, ~20% fundo.
- **Ideias e referências de pesquisa:** ideias `origin: pesquisa` ainda com `status: nova` ou `analisada` e referências ★ (`curadoria/referencias/*.json` com `starred: true`) contam como origem real: cite o `R-NNNN` na coluna de origem.
- **Travou?** Inverter crença · número/caso hiper-específico **real** · erro comum · antes/depois da rotina · "ninguém fala sobre" · bastidor do fundador · mito vs. verdade · comparação com outro universo.

## Modo 2 — Calendário
Pergunte só o que faltar: período, frequência (padrão: a do `CONTENT_STRATEGY.md`), datas especiais, lançamento.

Tabela `data | dia | formato | pilar | funil | pauta | status` → salvar em `companies/<slug>/contents/calendario-AAAA-MM.md`.

Regras (se a empresa não tiver as suas): ≥ 1 topo por semana; máx. 2 seguidos do mesmo pilar; nunca 2 fundos seguidos; data comemorativa só com ligação real com a marca; 1 espaço/semana para reativo.

## Modo 3 — Engenharia reversa (criador/concorrente)
Com perfis ou posts de referência:
1. **Antes, o que já foi analisado:** o relatório mais recente de cada concorrente citado (`companies/<slug>/competitors/<id>/relatorios/`, o de `gerado` mais novo por rede; seções "Em 5 linhas", padrões, "copiar", "evitar" e ideias) e, se precisar do detalhe de um item, a ficha dele (`competitors/<id>/fichas/`). Nomeie formato, gancho e gatilho com os termos aceitos de `library/analise/vocabulario.json`. Toda pauta que sair daí cita o relatório (`relatorio: <id>`) e a ficha de origem; o que o relatório manda "evitar" não entra. Sem relatório, siga os passos abaixo.
2. Os 10 posts de maior desempenho (views, comentários, envios se houver).
3. Para cada: formato, hook (texto exato), estrutura, CTA, emoção dominante.
4. 3–5 padrões que se repetem.
5. 5 pautas para a empresa: mesmo mecanismo, assunto nosso, nunca cópia.

## Modo 4 — Pesquisar ideias nas fontes
Quando o pedido for "pesquisa ideias sobre X", "o que a ciência diz sobre", uma série que exige fonte (na kz: 3 "Mito, verdade ou… depende?" e 12 "kz recomenda") ou "ideias com referência":
1. Siga a skill **`curadoria`** (pedido → busca por script → triagem Haiku → verificação por script → síntese → `gravar`). Padrões: 8 ideias, estudos de até 24 meses, notícias de até 60 dias, brasileiros primeiro.
2. As ideias entram no banco (`companies/<slug>/ideas/`) com `origin: pesquisa`, `refs` e a seção `## Fontes`.
3. Responda com uma tabela curta: `# · ideia · veredito · referência principal (veículo, ano) · nota`, e o que falhou na rodada.
