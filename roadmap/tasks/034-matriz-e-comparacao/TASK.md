# 034 — Matriz de funcionalidades × concorrentes e melhorias da área

Status: **matriz feita (2026-10-08)**; melhorias propostas abaixo aguardam priorização do Oliver · Depende de: 031 (área de concorrentes), 023 (módulo `features`)

## Objetivo
Tabela com as funcionalidades nas linhas e os concorrentes nas colunas, para ver de relance quem tem o quê. A coluna da nossa empresa fica fixa, na cor do projeto, com fundo por situação (verde = tem, amarelo = parcial/planejado, vermelho = não tem, cinza = a confirmar).

## O que foi feito
- **Dados:** `companies/kz/intel/matriz.json` (schema `schema/matrix.ts`, exportado em `schema/index.ts`). 43 funcionalidades em 11 grupos, 11 concorrentes + `_nos`. Célula = `status` (sim/parcial/nao/desconhecido; `planejado` só em `_nos`), `note` (≤ 50), `source`, `by` (ia/oliver), `updatedAt`. Ausente = desconhecido. O `nao` de concorrente só existe onde a análise lista a falta (`missing`); o resto é desconhecido.
- **Store/API:** `core/store.ts` (`getMatrix`, `setMatrixCell` com a regra "IA nunca sobrescreve `by: oliver`", `saveMatrixFeature`, `deleteMatrixFeature`, `renameMatrixGroup`; validado também no `npm run validate`). Rotas `/api/projects/:slug/matrix…` em `app/server/api.ts`; cliente em `app/src/api.ts`; query `useMatrix` e ações otimistas em `components/competitors/useMatrixActions.ts`.
- **Tela:** `pages/concorrentes/MatrizFuncionalidades.tsx` (substitui a vista antiga grupo × contagem em `Comparar.tsx`). Nome da funcionalidade e coluna da nossa empresa fixos; cabeçalho e rodapé fixos; grupos recolhíveis; busca, filtros (só diferença, eles têm e nós não, só nós temos, grupo), ordem das colunas (mais completos / A–Z), cobertura por coluna no rodapé (tem = 1, parcial = ½). Clicar na célula abre o editor (status, nota, fonte) e grava como `oliver`; criar, renomear, mover e remover funcionalidade; renomear grupo.
- **Skill:** seção "Matriz de funcionalidades" em `.claude/skills/analise-concorrentes/SKILL.md`.
- **Tema:** o app só tem tema claro hoje (não há bloco `.dark` em `index.css`); as células já têm variantes `dark:` prontas.
- Prints: `prints/matriz-light.png`, `matriz-rolada.png`, `matriz-edicao.png`, `matriz-popover.png`.
- A linha fixada de referência (`intel/referencia.json`) deixou de aparecer em Funcionalidades: a coluna fixa `_nos` a substitui. Oferta e Mensagem seguem com a linha fixada.

## Melhorias propostas para a área de concorrentes
Base: Crayon e Klue (battlecards vivos, monitoramento de páginas com alertas, win-loss ligado ao CRM), Kompyte/Semrush (crawlers sobre páginas públicas, alertas de preço e banner) e ferramentas de diff de página (filtram ruído exigindo a mudança em checagens seguidas). O hub já cobre coleta, análise por módulo, redes, anúncios e comparação; falta transformar isso em decisão e em histórico.

| # | melhoria | prioridade | esforço | onde entra |
|---|---|---|---|---|
| 1 | **Histórico de mudanças com diff e alerta** (preço, planos, hero da LP, funcionalidades): guardar a versão anterior de `analysis/precos.json`, `landing.json`, `features.json` e comparar; listar "o que mudou" | alta | M | `core/store.ts` (snapshot ao salvar), seção nova no Panorama, relatório semanal (`tools/intel/semanal.ts`) |
| 2 | **Battlecard por concorrente** (1 tela imprimível: onde ganhamos, onde perdemos, objeções e respostas, preço, frases da LP), montada de `forcas`, matriz, preços e reputação | alta | M | ficha `CompetitorDetail.tsx` (aba Battlecard) + skill `analise-concorrentes` |
| 3 | **A Kzloo como linha de referência em todas as tabelas** (preço, mensagem, reputação, redes, anúncios), como já é a coluna fixa da matriz | alta | P | `area.tsx` (`refRow` já existe; falta Reputação e Redes), `Comparar.tsx` |
| 4 | **Matriz de preço normalizada por plano** (mesmo recorte: 1 profissional, mensal e anual, o que cada plano inclui: WhatsApp, IA, NFS-e), cruzada com a matriz de funcionalidades | alta | M | vista nova em `Comparar.tsx`, dados de `analysis/precos.json` (`plans[].highlights`) |
| 5 | **Brechas viram tarefa**: da matriz sai "eles têm, nós não" ordenado por nº de concorrentes que têm; botão "virar tarefa" no quadro `produto` | alta | P | `MatrizFuncionalidades.tsx` + `useTaskActions` |
| 6 | **Linha do tempo do concorrente** (lançamentos, mudança de preço, anúncios novos, picos de conteúdo) | média | M | `CompetitorDetail.tsx`, junta histórico (1), `ads/` e snapshots |
| 7 | **Mapa de posicionamento** com eixos escolhíveis (preço × cobertura da matriz, preço × audiência, IA × equipe) | média | M | Panorama já tem preço × audiência; generalizar eixos |
| 8 | **Comparação de mensagem e ângulos** (hero, promessa, CTA, prova social lado a lado, ângulos classificados), ligada a `campaigns/LOG_ANGULOS.md` | média | M | aba Mensagem de `Comparar.tsx` + módulo `landing` |
| 9 | **SWOT agregado do mercado** (forças e fraquezas mais repetidas em `forcas`, oportunidades somadas) | média | P | Panorama (já lista brechas) |
| 10 | **Exportar para PDF/apresentação** (matriz, battlecard, Panorama) | média | M | botão em cada tela; renderizar via Playwright como o carrossel |
| 11 | **Alertas sem ruído**: avisar só quando a mudança aparece em 2 coletas seguidas; digest semanal curto | média | P | `tools/intel/semanal.ts` |
| 12 | **Confiança na matriz**: marcar célula velha (> 90 dias), botão "reanalisar este concorrente" e fila de dúvidas (`desconhecido`) | média | P | `MatrizFuncionalidades.tsx` + `pedido.json` |
| 13 | **Win/loss simples**: registrar por que um terapeuta escolheu ou largou a Kzloo (nota do Oliver e concorrente envolvido) | baixa | P | `notes/` com tag; resumo na ficha |
| 14 | **Avaliações de terceiros** (Capterra, Google, lojas) com temas recorrentes | baixa | G | módulo `reputacao` |

## Log
- 2026-10-08 — schema, store, API, tela e dados (43 funcionalidades × 11 concorrentes + Kzloo). Testado em cópia dos dados (HUB_ROOT) com Playwright: edição grava `by: oliver`, filtros e colunas fixas ok. `npm run typecheck` e `npm run validate` limpos.
