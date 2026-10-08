# 043 — Abas da área Concorrentes: nomes, Comparar mais profundo (preços e planos, posicionamento) e Brechas redesenhada

**Status:** em andamento (registrada pelo orquestrador em 2026-10-08).
**Depende de:** 034 (matriz), 039 (Panorama/Brechas). **Cuidado:** outra sessão (042) tem mudanças sem commit em `app/src/components/competitors/lib.tsx`, `core/*`, `schema/ficha.ts`, `schema/ads-marks.ts`, `tools/fichas/*`. Esta tarefa **não mexe** nesses arquivos.

## Pedido do Oliver (2026-10-08, ditado)
1. **Oferta e preço mais profundo.** Ex.: o GestorPsi tem plano de R$ 34,50, mas a tela não diz o que ele oferece. Quer **ver os planos**, **comparar por faixa de preço**, entender a **precificação média** e **o que cada plano oferece**. Duas visões: uma **resumida/compacta** e uma **completa**, que permita uma **comparação justa**. Analisar como um estrategista de marketing fazendo análise de concorrentes.
2. **Aba "Mensagem"**: o título é péssimo, não explica nada. Fazer algo bem melhor, com **visões diferentes**, incluindo uma que mostre **quais seções os concorrentes têm em comum, numa tabela lado a lado**.
3. **Aba "Concorrentes"** dentro da área Concorrentes: nome repetido, não faz sentido.
4. **Revisão de nomes e organização de todas as abas** (Panorama, Concorrentes, Comparar, Brechas, Conteúdos, Redes, Anúncios, Coletas e as sub-abas do Comparar), apontando **quais merecem mais variações de painéis internos** para tirar os melhores insights.
5. **Brechas**: um subagente de UX/UI analisa e faz o **redesign** para ficar fácil de entender e visualmente organizado, talvez com sub-abas. "Tem que ficar fácil."

## Diagnóstico (o que existe hoje)
- Abas: `app/src/components/competitors/area.tsx:16-23` (`Panorama · Concorrentes · Comparar · Brechas · Conteúdos · Redes · Anúncios · Coletas`). A aba "Concorrentes" é `pages/concorrentes/Lista.tsx`.
- Comparar: `pages/concorrentes/Comparar.tsx` com sub-abas por chips (`?v=`): `Oferta e preço` (tabela de 1 linha por concorrente: a partir de, plano mais caro, no anual, modelo, nº de planos, teste, fidelidade), `Funcionalidades` (`MatrizFuncionalidades.tsx`), `Mensagem` (hero, CTA, prova social, tom, nº de seções), `Reputação`.
- **Os dados de planos já existem** em `companies/kz/competitors/<id>/analysis/precos.json` (schema `schema/analysis.ts` → `precos`): cada plano tem `name, monthly, yearlyMonthly, yearlyTotal, users, highlights[], recommended`, mais `extras`, `notes`, `trial`, `guarantee`. A tela **não mostra os planos**. Os `highlights` são rasos e inconsistentes (GestorPsi: "mesmos recursos do Individual"; nada de limites de pacientes, armazenamento, WhatsApp, cobrança extra). Não há ligação plano × funcionalidade da matriz (`intel/matriz.json`).
- Landing: `analysis/landing.json` tem `sections[]` tipadas (`hero, logos, problema, solucao, features, como-funciona, beneficios, prova-social, depoimentos, numeros, precos, comparativo, seguranca, integracoes, fundador, faq, blog, cta, rodape, outro`) em ordem, mais `ctas`, `socialProof`, `interesting`, `tone`. Dá para fazer a matriz seção × concorrente sem nova coleta.
- Brechas: `pages/concorrentes/Brechas.tsx` (26 linhas) monta `GapThemes`, `ProductVsMarket` e `GapsByCompetitor` de `PanoramaBrechas.tsx` (353 linhas, também usado pelo Panorama via `GapSummaryCard`).

## Fases
| fase | quem | entrega | pronto quando |
|---|---|---|---|
| **A. Desenho (análise)** | agente Opus, persona estrategista de marketing + designer de produto | `DESENHO.md` nesta pasta: (1) nomes e ordem das abas e sub-abas, com justificativa; (2) para cada aba, quais painéis internos/visões merece (prioridade alta/média/baixa); (3) **Preços e planos**: perguntas que a visão responde, visão compacta × completa, faixas de preço, média/mediana, preço normalizado (por profissional, mensal × anual), plano × funcionalidade, o que falta nos dados e **como coletar** (campos novos no schema `precos`, prompt da re-coleta); (4) **aba que substitui "Mensagem"**: nome e visões (matriz de seções lado a lado, promessas, CTAs, prova social…). | Oliver aprova (os nomes são decisão pequena: seguir e avisar). |
| **B. Brechas redesenhada** | agente UX/UI (designer de produto sênior) | redesign em `Brechas.tsx` + `PanoramaBrechas.tsx` (sem quebrar o `GapSummaryCard` do Panorama), sub-abas se fizer sentido, prints antes/depois em `prints/`. Não mexe em `area.tsx` nem `Comparar.tsx`. | typecheck limpo, prints, roda no app. |
| **C. Nomes das abas** | orquestrador | aplicar os nomes do `DESENHO.md` em `area.tsx` e `Comparar.tsx` (rótulos; rotas antigas continuam valendo). | — |
| **D. Dados de preços** | agente Sonnet | campos novos no schema `precos` (do `DESENHO.md`), re-coleta dos 11 concorrentes com os planos completos (o que cada plano inclui, limites, cobrança extra), `npm run validate`. | GestorPsi e outros 2 conferidos à mão contra o site. |
| **E. Preços e planos no app** | agente Sonnet (UI) | visão compacta + completa conforme o `DESENHO.md`. | conforme o desenho. |
| **F. Posicionamento no app** | agente Sonnet (UI) | a aba que substitui "Mensagem", com a matriz de seções e as outras visões do desenho. | conforme o desenho. |
| **G. Revisão** | Opus | revisão de UX e de dados das fases B, E, F. | — |

Ondas: **1** = A ∥ B (arquivos diferentes). **2** = C (orquestrador) → D ∥ F. **3** = E (depende de D) → G.

## Log
- 2026-10-08 — registrada. Onda 1 disparada (A desenho, B Brechas).
