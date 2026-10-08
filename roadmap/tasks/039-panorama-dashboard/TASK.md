# 039 — Panorama dos concorrentes como dashboard + Brechas em página própria

**Status:** pronta (registrada pelo orquestrador em 2026-10-08). Desenho do dashboard por agente antes do código (mesma rodada da 038 C1).
**Depende de:** 038 fase A (AppContent, SelectField) e fase B2 (fora da curva × perfil e × mercado). **Relacionada:** 031 (Panorama), 034 (brechas, matriz e as 14 melhorias).

## Pedido do Oliver (2026-10-08, ditado)
- O **Panorama** (`/concorrentes`, primeira aba) **tem que ser um dashboard**: ao entrar, entregar logo de cara as informações mais relevantes sobre os concorrentes. Hoje ocupa espaço demais.
- **"Brechas para nós" vira uma página separada.** No Panorama fica uma **versão resumida, num card, sempre visível** ("isso é muito importante").
- **Cards do topo quebram de linha:** com 7 números, "Maior audiência · Corpora" desce para uma segunda linha. "Isso não pode acontecer." Deixar mais compacto e dar um tapa nos outros cards.
- **Header da área com mais ícones** e o visual geral mais fácil de entender (UI/UX).
- Gosta de **"Conteúdos fora da curva"** no Panorama: manter, mas com as **duas medidas** (× média do próprio perfil e × média geral dos concorrentes na rede), ver 038 B2.

## O que existe hoje (`app/src/pages/concorrentes/Panorama.tsx`, 199 linhas)
De cima para baixo:
1. `StatStrip` com 7 números: preço da Kzloo × mediana, preço de entrada (mediana), cobertura da matriz, plano grátis, teste grátis, audiência somada, maior audiência.
2. Grade com **Brechas para nós** (`GapThemes`, em `PanoramaBrechas.tsx`: lista longa por tema com chips de tipo e itens abertos) + **Produto × mercado** (`ProductVsMarket`: "Faltam no produto" e "Só você tem").
3. **Preço × audiência** (dispersão) + **Audiência e crescimento**.
4. **Conteúdos fora da curva** (top 6 só pela medida do perfil, `Panorama.tsx:150-170`).

O problema: as brechas ocupam a parte mais nobre da tela com a lista inteira; o resto fica abaixo da dobra.

**Causa da quebra:** `StatStrip` (`app/src/components/competitors/area.tsx:160`) é `flex flex-wrap` com divisórias e sem largura por item; com 7 itens não cabe e o último desce, deixando um buraco. É usado em 6 telas.

## Fases
| fase | entrega | critério de pronto |
|---|---|---|
| **A. Desenho (agente)** | O **estrategista** (Opus) desenha o Panorama na mesma rodada do dashboard de Conteúdos (038 C1), para os dois conversarem: que perguntas o gestor de marketing responde em 10 s ao abrir (quem cresce, quem anuncia mais e há quanto tempo, o que viraliza × perfil e × mercado, preço e posição da Kzloo, maiores brechas), quais blocos, em que ordem, o que cabe na primeira dobra a 1440×900. Só dados que existem (`companies/kz/competitors/`, `intel/matriz.json`, `intel/brechas.json`, `ads/`, `referencia.json`). Saída: `DASHBOARD.md` nesta pasta com wireframe. | Oliver aprova (devolver em `review`). |
| **A2. Faixa de números e header (pode ir antes do desenho)** | **StatStrip novo (vale para as 6 telas):** cards de KPI em grade de largura fixa por coluna (`grid` com `auto-fit`, mín. ~160 px), ícone Lucide por número (ex.: `Tag` preço, `Gift` grátis, `Timer` teste, `Users` audiência, `Trophy` maior audiência, `Grid3x3` cobertura), rótulo em cima, valor grande, comparação embaixo (ex.: "+12% vs mediana") com cor de alta/baixa; nunca quebrar para uma linha sozinha: acima de 6 itens, o excesso vai para um "ver mais" ou o desenho (fase A) corta para os 4–6 que importam. **Header da área** (`AreaHeader`, mesmo arquivo): ícone Lucide em cada aba (Panorama `LayoutDashboard`, Lista `List`, Comparar `Columns3`, Conteúdos `Clapperboard`, Redes `Share2`, Anúncios `Megaphone`, Coletas `RefreshCw`, Brechas `Target`), botão "+ Adicionar" com ícone `Plus`, subtítulo como chip. | A 1280, 1440 e 1920 px nenhum card fica sozinho numa segunda linha; print das 6 telas que usam o `StatStrip`. |
| **B. Página Brechas** | Nova aba/rota `/concorrentes/brechas` na área (barra de abas em `components/competitors/area.tsx`) com o `GapThemes` completo + `ProductVsMarket` + atalho "virar tarefa" (melhoria 5 da 034, se couber). | A página mostra tudo que o Panorama mostra hoje sobre brechas; nada se perde. |
| **C. Panorama dashboard** | Reescrever o Panorama conforme o `DASHBOARD.md`: card **Brechas (resumo)** com as 3–5 maiores brechas (tema + nº de concorrentes) e "ver todas →" para a página B; "Conteúdos fora da curva" com as duas medidas (038 B2) e opção de alternar o top por × perfil / × mercado; blocos compactos em grade; usa `AppContent` e `SelectField`. | Primeira dobra (1440×900) mostra os blocos prioritários do desenho; print antes/depois; `npm run typecheck` limpo. |

## Log
- 2026-10-08 — registrada pelo orquestrador a partir do áudio do Oliver (nada alterado no código).
- 2026-10-08 — fase A2 (agente de UI): `StatStrip` novo (grade de colunas iguais, ícone Lucide por KPI nas 5 telas que o usam, reparte 4+3 em vez de 6+1) e `AreaHeader` com ícones nas abas, "Adicionar" com `Plus` e subtítulo em chip. Aba Brechas fica para a fase B.
