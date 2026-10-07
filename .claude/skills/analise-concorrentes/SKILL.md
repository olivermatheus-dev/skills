---
name: analise-concorrentes
description: "Análise de concorrentes por módulos (perfis e redes, site e sitemap, contato, onde atua, resumo, funcionalidades, pontos fortes e fracos, preços e planos, landing page, reputação/Reclame Aqui). Roda a fila de pedidos marcados pelo Oliver no app, usando script no que é mecânico e subagentes Sonnet no que exige leitura. Use quando o usuário disser 'roda a fila de concorrentes', 'analisa o concorrente X', 'análise completa', 'preço dos concorrentes', 'features dos concorrentes', 'pontos fortes e fracos', 'analisa a landing page', 'Reclame Aqui', 'sitemap do concorrente', ou aceitar candidatos do radar."
---

# Análise de concorrentes

Dados: `companies/<slug>/competitors/<id>/analysis/<modulo>.json` (schema `AnalysisResult` em `schema/analysis.ts`, catálogo `MODULES`).
O Oliver marca no app o que quer (aba **Análise** do concorrente) → vira `analysis/pedido.json`. Ele nunca escreve em `analysis/notas.json`: são anotações dele.

## Princípio: gastar token só onde precisa de inteligência
| módulo | quem faz | insumo |
|---|---|---|
| `site` | **script** (`npm run analise -- site`) | abre o site no Playwright, salva `site/*.md` + `site/extract.json`, sitemap e contatos brutos |
| `redes` | **script** (`npm run collect`) | coleta de YouTube/Instagram/TikTok (já existia) |
| `perfis`, `reputacao` | IA com busca na web | nome do concorrente + `site/extract.json` (redes linkadas no site) |
| `atuacao`, `resumo`, `features`, `forcas`, `precos`, `landing`, `contato` | IA lendo **só** `site/*.md` e `site/extract.json` | abre páginas extras só se faltar algo (ex.: preço em outra URL) |

Regras de custo:
- Rode **só os módulos pedidos**. Pulou o que já existe com menos de 30 dias, a menos que `force: true`.
- Os módulos de IA dependem do `site`: se `site/` não existir ou tiver mais de 30 dias, rode o script antes (é grátis).
- **1 subagente por concorrente**, modelo **Sonnet** (`model: "sonnet"`), até 5 em paralelo. O subagente recebe a lista de módulos e os caminhos, nunca o texto colado no prompt.
- Análise completa (`FULL_ANALYSIS`) só 1x: quando o concorrente é aceito. Depois, pontual.

## Fluxo (orquestrador = sessão principal)
1. `npm run analise -- fila <slug>` → o que está pedido.
2. Sem site cadastrado e pediu algo além de `perfis`/`reputacao`? Rode `perfis` primeiro (subagente) e depois o script.
3. `npm run analise -- site <slug> --fila` (ou `<id>`): baixa os sites pedidos. Erro de site (bloqueio, timeout) → anote e siga com o que der.
4. Para cada concorrente com módulos de IA: subagente Sonnet com o prompt-padrão abaixo.
5. Confira: `npm run analise -- status <slug>` e `npm run validate`. Pedido vazio some sozinho (cada `salvar` tira o módulo do pedido).
6. Se `redes` foi pedido: `npm run collect -- <slug> <id>` e depois `npm run analise -- feito <slug> <id> redes`.
7. Aprendizado que muda o posicionamento (preço novo, feature nova, brecha) → atualize `context/COMPETITORS.md` (tabela) e avise o Oliver.

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
