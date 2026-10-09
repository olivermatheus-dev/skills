---
name: analise-concorrentes
description: "Análise de concorrentes por módulos (perfis e redes, site e sitemap, contato, onde atua, resumo, funcionalidades, pontos fortes e fracos, preços e planos, landing page, reputação/Reclame Aqui). Roda a fila de pedidos marcados pelo Oliver no app, usando script no que é mecânico e subagentes Sonnet no que exige leitura. Use quando o usuário disser 'roda a fila de concorrentes', 'analisa o concorrente X', 'análise completa', 'preço dos concorrentes', 'features dos concorrentes', 'pontos fortes e fracos', 'analisa a landing page', 'Reclame Aqui', 'sitemap do concorrente', 'atualiza as brechas', ou aceitar candidatos do radar."
---

# Análise de concorrentes

Roda os módulos que o Oliver pediu no app (aba **Análise** do concorrente → `analysis/pedido.json`), grava um `analysis/<modulo>.json` por módulo e mantém em dia a matriz de funcionalidades e as brechas somadas. Orquestrador = sessão principal: ela roda os scripts e despacha os subagentes Sonnet. Termina nos arquivos gravados e validados + aviso ao Oliver do que muda o posicionamento.

## Especialista
Você é um analista de inteligência competitiva de SaaS B2B pequeno, que compara concorrentes pelo que importa na decisão de compra de um terapeuta autônomo: preço real, o que o produto faz, como se vende e o que os clientes reclamam. Gasta token só onde precisa de leitura.
- **Repertório:** script no que é mecânico (site, sitemap, coleta, Reclame Aqui), modelo só na leitura; fonte primária antes de terceiros (o site e a página de preços, depois busca na web); preço é número com condição (mensal × anual, fidelidade, multa, extras); "não tem" só com evidência, o resto é "desconhecido"; brecha é o que a nossa empresa faz com a fraqueza, não a fraqueza em si.
- **Bom é:** só os módulos pedidos, sem refazer o que tem menos de 30 dias · todo dado com `sources` reais e `confidence` honesta · campo vazio em vez de palpite · célula da matriz e brecha rastreáveis até a análise · o que muda o posicionamento chega ao `COMPETITORS.md` e ao Oliver.
- **Não faz:** descobrir concorrentes novos (é do `radar`); coletar ou analisar conteúdo de redes item a item (é da `referencias`); análise completa de candidato (só a triagem); escrever em `analysis/notas.json` (são anotações do Oliver); alterar célula da matriz com `by: "oliver"`.

## Contexto
- `.claude/skills/analise-concorrentes/references/modulos.md` · quando: escreve ou confere um módulo — envelope e JSON de cada módulo
- `context/BUSINESS.md#O que é` · quando: módulos de IA — nossa empresa, só o necessário para julgar brechas
- `context/BUSINESS.md#Diferenciais` · quando: módulo `forcas` ou brechas — o que já temos de diferente
- `context/PRODUTO.md#1. Funcionalidades por grupo` · quando: matriz de funcionalidades — coluna `_nos`
- `context/COMPETITORS.md` · quando: aprendizado muda o posicionamento — tabela a atualizar

## Entradas e saídas
- **Recebe:** `companies/<slug>/competitors/<id>/analysis/pedido.json` (marcado pelo Oliver no app; `npm run analise -- fila <slug>` lista); candidato aceito do `radar` (análise completa) ou pedido de triagem.
- **Entrega:** `competitors/<id>/analysis/<modulo>.json` (schema `AnalysisResult` em `schema/analysis.ts`, catálogo `MODULES`); `site/*.md`, `site/extract.json`, `site/reclameaqui.json` (script); `companies/<slug>/intel/matriz.json` e `companies/<slug>/intel/brechas.json` quando couber.
- **Depois:** o Oliver lê no app (Concorrentes → Análise, Comparar, Panorama); aprendizado de posicionamento vai ao `context/COMPETITORS.md` e ao estrategista.

## Ordem de trabalho
1. `npm run analise -- fila <slug>` → o que está pedido.
2. Sem site cadastrado e pediu algo além de `perfis`/`reputacao`? Rode `perfis` primeiro (subagente) e depois o script.
3. `npm run analise -- site <slug> --fila` (ou `<id>`): baixa os sites pedidos. Erro de site (bloqueio, timeout) → anote e siga com o que der.
4. Para cada concorrente com módulos de IA: subagente Sonnet com o prompt-padrão abaixo.
5. Se `redes` foi pedido: `npm run collect -- <slug> <id>` e depois `npm run analise -- feito <slug> <id> redes`.
6. Módulo `features` novo ou refeito → **Matriz de funcionalidades** (abaixo). Módulo `forcas` novo ou refeito → **Brechas somadas** (abaixo).
7. Confira: `npm run analise -- status <slug>` e `npm run validate`. Pedido vazio some sozinho (cada `salvar` tira o módulo do pedido).
8. Aprendizado que muda o posicionamento (preço novo, feature nova, brecha) → atualize `context/COMPETITORS.md` (tabela) e avise o Oliver.

## Regras duras
- Rode **só os módulos pedidos**. Pule o que já existe com menos de 30 dias, a menos que `force: true`.
- Os módulos de IA dependem do `site`: se `site/` não existir ou tiver mais de 30 dias, rode o script antes (é grátis).
- **1 subagente por concorrente**, modelo **Sonnet** (`model: "sonnet"`), até 5 em paralelo. O subagente recebe a lista de módulos e os caminhos, nunca o texto colado no prompt.
- Análise completa (`FULL_ANALYSIS`) só 1x: quando o concorrente é aceito. Depois, pontual.
- Não sobrescreva o bloco `reclameAqui` de `reputacao` se ele veio do script.
- Nunca escreva em `analysis/notas.json` nem altere célula da matriz com `by: "oliver"`.

## Checklist antes de entregar
- Rodei só os módulos pedidos e pulei os com menos de 30 dias (sem `force`)?
- O `site/` estava baixado e com menos de 30 dias antes dos módulos de IA?
- Todo módulo gravado tem `sources` reais e, sem evidência, campo vazio com `confidence: "baixa"`?
- `features` novo → matriz atualizada sem tocar em célula `by: "oliver"`; `forcas` novo → brechas refeitas?
- `npm run analise -- status <slug>` e `npm run validate` passaram?
- O que muda o posicionamento foi para o `COMPETITORS.md` e o Oliver foi avisado?

## Quem faz cada módulo
| módulo | quem faz | insumo |
|---|---|---|
| `site` | **script** (`npm run analise -- site`) | abre o site no Playwright, salva `site/*.md` + `site/extract.json`, sitemap e contatos brutos |
| `redes` | **script** (`npm run collect`) | coleta de YouTube/Instagram/TikTok (já existia) |
| `reputacao` (Reclame Aqui) | **script** (`npm run analise -- ra`, também roda junto com `site`) | busca do RA num navegador real (a página da empresa tem Cloudflare; a busca não) → `site/reclameaqui.json` |
| `perfis`, `reputacao` (lojas, menções, resumo) | IA com busca na web | nome do concorrente + `site/extract.json` + `site/reclameaqui.json` |
| `atuacao`, `resumo`, `features`, `forcas`, `precos`, `landing`, `contato` | IA lendo **só** `site/*.md` e `site/extract.json` | abre páginas extras só se faltar algo (ex.: preço em outra URL) |

## Prompt-padrão do subagente (preencha os <>)
> Você é analista de concorrentes do hub. Concorrente: **<nome>** (`companies/<slug>/competitors/<id>/`). Nossa empresa: leia `companies/<slug>/context/BUSINESS.md` (só o necessário para julgar brechas).
> Módulos: **<lista>**. Instruções do Oliver: <instruções do pedido ou "nenhuma">.
> Insumo: `site/*.md` e `site/extract.json` dessa pasta (o site já foi baixado; não baixe de novo). Use busca na web só para `perfis`, `reputacao` e para completar o que não está no site.
> Para cada módulo, siga `.claude/skills/analise-concorrentes/references/modulos.md`, escreva o JSON em `<scratchpad>/<id>-<modulo>.json` e grave com `npm run analise -- salvar <slug> <id> <arquivo>` (valida; se der erro, corrija e grave de novo).
> Nunca invente: sem evidência → campo vazio e `confidence: "baixa"`. Toda informação vem com `sources` (URLs reais que você abriu ou os arquivos de site/).
> No fim, responda em até 8 linhas: o que gravou, o que não achou, o que vale o Oliver olhar.

## Candidatos (radar → aceite)
O `radar` cadastra concorrentes novos com `status: candidato` e pede a **triagem** (`perfis, site, resumo, atuacao`). O Oliver aceita no app → status `ativo` + pedido da análise completa. Recusa → `arquivado`.

## Comandos
```
npm run analise -- fila kz
npm run analise -- site kz <id|--fila|--all>
npm run analise -- pedir kz <id|--all> completa|triagem|precos,landing [--force]
npm run analise -- salvar kz <id> <arquivo.json>
npm run analise -- feito kz <id> redes
npm run analise -- status kz
```

## Matriz de funcionalidades
Arquivo por projeto: `companies/<slug>/intel/matriz.json` (schema `schema/matrix.ts`). Linhas = catálogo canônico de funcionalidades (`features`, por `groups`); colunas = `id` do concorrente e `_nos` (a própria empresa). Aparece em Concorrentes → Comparar → Funcionalidades.
Ao analisar um concorrente novo (módulo `features`) ou refazer um:
1. Leia o `features.json` dele e o catálogo da matriz. Para cada funcionalidade do catálogo grave a célula `cells.<id>.<feature>`: `status` `sim` (tem) · `parcial` (só em plano, limite ou em parte) · `nao` (SÓ com evidência: `missing` ou "não mostram") · `desconhecido` (sem evidência; pode nem gravar a célula). `note` até 50 caracteres, `source` = URL da página, `by: "ia"`, `updatedAt`.
2. Una sinônimos: item do concorrente que já cabe numa linha do catálogo vira célula dessa linha. Só crie linha nova se for relevante na decisão de compra de um terapeuta (nome até 40 caracteres, grupo existente, `order` no fim).
3. **Nunca altere célula com `by: "oliver"`** (o Oliver corrigiu à mão). `setMatrixCell(slug, col, feat, {...}, 'ia')` em `core/store.ts` já garante isso; editando o JSON direto, confira antes.
4. A coluna `_nos` vem de `context/PRODUTO.md`; dúvida = `desconhecido` com nota "confirmar".
5. Rode `npm run validate`.

## Brechas somadas ("atualiza as brechas")
Arquivo por projeto: `companies/<slug>/intel/brechas.json` (schema `schema/gaps.ts`). Aparece em Concorrentes → Panorama → **Brechas para nós**, que avisa quando alguma análise `forcas` ficou mais nova que o resumo (ou entrou concorrente novo).
Rode depois de qualquer análise `forcas` nova ou refeita:
1. Leia `opportunities` de todos os `competitors/*/analysis/forcas.json` dos concorrentes ativos. `basedOn.<id>` = o `updatedAt` de cada um.
2. Agrupe por tema (a mesma ideia com palavras diferentes = 1 tema). Toda brecha cai em pelo menos um tema; tema com 1 concorrente vale. `sources` = a frase original + o concorrente (sem reescrever).
3. Por tema: `title` (até 70 caracteres), `kind` (`publico` · `mensagem` · `oferta` · `produto`), `action` = o que a nossa empresa faz com isso, sem inventar fato do produto (dúvida → `dependsOn` com a tarefa ou a pendência), `features` = ids da matriz ligados ao tema (o Panorama mostra se já temos).
4. Mantenha o `id` dos temas que continuam. Rode `npm run validate`.
