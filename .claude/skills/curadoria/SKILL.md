---
name: curadoria
description: "Pesquisa ideias e temas de conteúdo nas fontes cadastradas (periódicos, bases de artigos, órgãos oficiais, notícias): busca por script nas APIs grátis, triagem barata, verificação por script (link, DOI e trecho literal) e síntese em ideias com referências no banco de ideias. Use quando o usuário disser 'pesquisa ideias sobre X', 'pesquisa nas fontes', 'roda a fila de pesquisa', 'rodada da série N', 'ideias com fonte', 'o que a ciência diz sobre', 'mito ou verdade', ou quando a content-ideas cair no Modo 4."
---

# Curadoria: fontes → referências verificadas → ideias

Tarefa 041 (1ª peça da 029). **Tudo sob comando**, nada agendado. Fonte = onde procurar (`companies/<slug>/curadoria/fontes.json`). Referência = item achado e **verificado por script** (`curadoria/referencias/R-NNNN.json`). Ideia de pesquisa = `ideas/I-NNNN-*.md` com `origin: pesquisa` e `refs` (sem referência verificada, não nasce: o schema recusa).

## Ler antes (só isto)
- `context/CONTENT_STRATEGY.md` → a linha da série/pilar pedido (mecânica, exemplos, cuidados).
- Títulos das ideias e conteúdos existentes (`ls companies/<slug>/ideas companies/<slug>/contents`) para não repetir pauta.
- `context/VOICE.md` → só a tabela Faz/Não faz, na hora de escrever o gancho.

## Fluxo da rodada
| # | passo | quem | comando / saída |
|---|---|---|---|
| 0 | **Pedido**: série, pilar ou tema; consultas pt e en; termos | você | `npm run curadoria -- pedir <slug> --serie 3 --pt "a; b" --en "c; d" --termos "x; y"` → `curadoria/rodadas/<id>/pedido.json` + `consultas.json` |
| 1 | **Buscar** nas fontes com adaptador (PubMed, Europe PMC, OpenAlex, Crossref, DOAJ, RSS, Google Notícias); deduplica por DOI/título | script | `npm run curadoria -- rodada <slug> <id>` (= buscar + pré-triagem) → `data/curadoria/<slug>/<id>/brutos.json`, `candidatos.json` |
| 2 | **Triagem barata**: rubrica fixa, ~20 achados com trecho LITERAL do resumo | subagente **Haiku** (ferramenta Agent, `model: haiku`) | grava `achados.json` |
| 3 | **Verificar**: link abre na página do item, DOI resolve, trecho existe no resumo baixado de novo | script | `npm run curadoria -- verificar <slug> <id>` → `verificados.json` |
| 4 | **Síntese e ranking**: escolhe as N ideias, nota 0–10, ficha de pauta | **você (Opus)**, lendo só os verificados | `sintese.json` (formato abaixo) |
| 5 | **Gravar**: referências, ideias (`status: nova`), `resultado.json`, `lastUsedAt` das fontes | script | `npm run curadoria -- gravar <slug> <id>` → depois `npm run validate` |

**Rodada pedida pelo app** (Ideias → Pesquisar ideias): o `pedido.json` já existe (mesma função do `pedir`, `tools/curadoria/pedido.ts`) e, para série ou pilar, **sem `consultas.json`**. O heartbeat (`--pesquisa <rodada>`) ou o terminal te dá só o id: leia o pedido, defina as consultas com `npm run curadoria -- consultas <slug> <id> --pt "a; b" --en "c; d" --termos "x; y"` e siga do passo 1. O app acompanha pelos arquivos da rodada (consultas, brutos, candidatos, achados, verificados, sintese, resultado): grave cada um assim que o passo acabar. Respeite `depth` (rapida = sem subagente Sonnet), `maxIdeas`, `languages` e `instructions` do pedido; avisos de fonte não aceita estão em `instructions`.

Outros: `buscar <slug> <id> --fontes a,b` (refaz só essas fontes e junta), `triar <slug> <id> --anexar doi1,doi2` (põe itens escolhidos a dedo nos candidatos sem renumerar), `status <slug>`.

**Padrões aprovados pelo Oliver (041, F0):** 8 ideias · estudos de até 24 meses · notícias de até 60 dias · estudos em inglês aceitos com **prioridade para os brasileiros** · aviso se a rodada passar de **US$ 3**. Sem fonte aceita (`ativa`), use `pedir … --sugeridas` (sugeridas conferidas de confiança 3) e registre isso nas notas.

## Passo 2 · triagem (Haiku)
Despache **um** subagente Haiku por grupo (ciência; notícias, se houver), nunca um por fonte. Ele lê só `candidatos.json` (título + resumo). Prompt mínimo:
- contexto da marca e a mecânica da série em 2 linhas;
- **rubrica** (nota 0–10): aderência a uma crença ou dor da persona que vire post (peso maior) · força da evidência que o resumo declara (meta-análise > revisão sistemática > ensaio > observacional > qualitativo > revisão narrativa) · interesse para terapeuta autônoma · cabe num carrossel ou reels de 30 s · penaliza fora do tema, protocolo sem resultado, risco ético/CFP;
- para cada item ≥ 6: `cand`, `score`, `claim`, `quote` (**copiado literalmente** do resumo, 12–40 palavras, mesmo idioma, sem reticências), `summary` (paráfrase pt-BR sem extrapolar), `evidence`, `why`;
- "confira cada quote como substring exata antes de gravar".
Brasileiros ficaram de fora? Ache-os nos brutos (periódicos `pcp`, `ptp`, `prc`, `estpsi`, `pusf`, `jbpsiq`, `scielo`), use `triar --anexar` e faça uma 2ª passada curta só com eles.

**Sem a ferramenta Agent** (ex.: rodando pelo heartbeat num terminal sem subagentes): `npm run curadoria -- triar <slug> <id> --sem-modelo --top 20`. A nota vira a da pré-triagem por regra (termos da consulta no título/resumo + força da evidência + Brasil + acesso aberto + peso da fonte + recência) e o trecho é a frase de resultado/conclusão do resumo (literal, cortada em 40 palavras). `claim` e `summary` ficam vazios: **você** preenche em `achados.json` só para os que vão para a síntese (o `gravar` recusa referência sem paráfrase). Mais barato, menos fino: a regra não sabe se o tema é aderente, então leia os títulos antes de sintetizar.

## Passo 4 · síntese (você)
Leia `verificados.json` (só os `ok`) e, para cada um que pretende usar, o resumo em `candidatos.json`. Confira na leitura que a `summary` não diz mais que o resumo.
- **Ranking** (nota 0–10 na ideia): a rubrica da triagem + sinal-alvo (envio/salvar) + peso da fonte + variedade (no máximo 2 ideias por referência; temas diferentes) + brasileiro na frente quando a força for parecida.
- **Afirmação técnica só com referência de `trust: 3`.** Notícia é gatilho: se citar estudo, busque o original numa próxima rodada.
- Venue duvidosa (periódico sem revisão clara, multidisciplinar genérico) não vira prova principal.
- Nicho de saúde: nada de promessa de resultado nem caso de paciente. "Nos estudos, redução de sintomas parecida" ≠ "funciona igual para você".

`data/curadoria/<slug>/<id>/sintese.json`:
```json
{ "ideas": [ { "title": "Terapia por vídeo funciona menos que a presencial?", "refs": ["C-012"], "pillar": 6, "series": 3, "score": 9.2,
    "objective": "informar", "tone": "curioso", "format": "carrossel-educativo", "tags": ["terapia-online"],
    "body": "## Ficha de pauta …\n- **Prova:** {C-012} (metanálise, 2026)" } ],
  "notes": "o que faltou, fontes que falharam, decisões" }
```
`body` = ficha de pauta da 012 (objetivo · mensagem · público e consciência · gancho que nunca engana · veredito · estrutura · prova · cuidados · formato · métrica). Escreva `{C-NNN}` na prova: o `gravar` troca pelo `R-NNNN` e escreve sozinho a seção `## Fontes` (título, veículo, ano, DOI, tipo de evidência, trecho, o que dá para afirmar, carimbo da verificação) e `## Observações do Oliver`.

## Custo
Meça com `node tools/usage.mjs <sessão>` (ou somando os transcripts da rodada) e grave em `resultado.json` → `cost`. Acima de US$ 3: avise o Oliver no resultado. O que mais pesa é a sessão Opus; a triagem Haiku fica em centavos a ~US$ 0,70.

## Falhas conhecidas (e o que o script faz)
- **OpenAlex sem chave** divide uma cota grátis diária por IP: acabou → periódico com `issn` e SciELO (`crossrefPrefix: 10.1590`) caem no Crossref sozinhos; a fonte `openalex` genérica fica com erro até a meia-noite UTC. Solução: chave grátis do OpenAlex em `OPENALEX_API_KEY` (app → Configurações).
- **Periódico** (`openalexSource`/`issn` no `filters`) = modo revista: traz todos os artigos do período e a pré-triagem ordena pelos termos.
- **Fontes `web`/`html-diff`** (PePSIC, RBTC, CRPs, editoras, OMS): sem coletor por script; ficam `bloqueado` até a fase de subagente Sonnet de leitura de página.
- **PubMed e editoras** às vezes respondem 2xx com página de desafio: a verificação exige título ou DOI na página e tenta no navegador headless (Playwright); se nada abrir, a referência cai (vai para `dropped`).

## Regras
- Nunca analisar fora do pedido; nunca guardar texto completo no git (só trecho ≤ 40 palavras + link). Brutos e páginas ficam em `data/curadoria/` (fora do git).
- Nunca inventar: sem trecho verificado não há referência; sem referência não há ideia de pesquisa.
- Ideias entram `status: nova`; o Oliver avalia no app (Ideias).
- Ao terminar: `npm run validate` limpo e 1 linha no Log da tarefa (041 ou a do quadro).
