# 042 — Ficha do concorrente: conteúdo → relatório, um painel só para o conteúdo e topo compacto

**Status:** review (aval do Oliver) · **Quadro:** produto · **Depende de:** 040 (fichas e relatórios), 031 (aba Redes e conteúdos)

## Pedido do Oliver (2026-10-08, ditado)
1. "Quando um relatório for gerado para analisar um conteúdo, temos que poder clicar direto no conteúdo em questão para ver o relatório."
2. "O próprio sheet quando clicamos em um conteúdo pode virar um dialog também. Analise isso para ver se faz sentido os 2 serem coisas diferentes ou se podemos simplificar."
3. "A parte no topo que exibe os cards com seguidores, conteúdos, mediana de views e outros pode ser muito compactada, e essa parte, a seguidores por coleta e redes encontradas no site, tudo muito mais compacto."

## Leitura do orquestrador
- (1) O caminho relatório → conteúdo já existe (`RelatorioDialog` → `onOpenItem`). Falta o inverso: no **card** do conteúdo citado num relatório, um selo/atalho "Relatório"; e no **painel** do conteúdo, o link para o relatório que o cita (`FichaView.relatorio`, criado na 040 I) abrindo o `RelatorioDialog` direto.
- (2) Hoje: item sem análise → `ItemDrawer` (sheet lateral: mídia, métricas, marcação, nota, tags, Virar ideia, "Analisar este"); com análise → `FichaDialog` (diálogo grande). Dois componentes para o mesmo objeto, com cabeçalho, mídia, métricas e marcação duplicados. **Recomendação:** um só diálogo (`ItemPanel`) com a mesma moldura (cabeçalho, coluna da mídia + números, rodapé com favorito/Virar ideia) e o miolo variando: com análise = abas da ficha; sem análise = estado vazio "Ainda sem análise" com **Analisar este** em destaque + nota e tags. O sheet deixa de existir para conteúdo.
- (3) Aba Redes e conteúdos (`CompetitorDetail.tsx`): `StatStrip` de cards + "Seguidores por coleta" + "Redes encontradas no site" → uma faixa compacta (números em linha, sparkline pequeno de seguidores, chips das redes do site).

## Log
- 2026-10-08 — feita (Sonnet) e revisada pelo orquestrador no navegador (Corpora): faixa compacta, selo no card, painel único com e sem análise, Relatório de origem abre por cima. Fora: selo no feed Conteúdos (só o link no painel), sparkline só aparece com 2+ coletas.
- 2026-10-08 — Oliver aprovou: **um painel só para o conteúdo** (item 2).
- 2026-10-08 — registrada a partir do pedido do Oliver; enviada a um agente (Sonnet, persona UX/UI sênior), revisão do orquestrador.

## Análise do painel (decisão aprovada pelo Oliver em 2026-10-08)
- Manter sheet + diálogo não se justificava: cabeçalho, mídia, números, marcação e Virar ideia eram duplicados, e o conteúdo "mudava de forma" ao ganhar análise (sheet → diálogo), perdendo o contexto de onde o Oliver estava.
- Implementado: `ItemPanel` (`ficha/FichaPanel.tsx`) é um diálogo só. Moldura igual: cabeçalho (rede, tipo, perfil, data, abrir original, selo "Relatório de origem" e "Análise da IA"/"Sem análise"), coluna da mídia com × perfil / × mercado / por seguidor e números, rodapé com favorito, status, Virar ideia e Analisar/Reanalisar.
- Miolo: com análise = abas da ficha (+ aba "Minha nota" com tags e nota); sem análise = convite "Ainda sem análise" com **Analisar este**, legenda, views por coleta, tags, nota e Virar ideia com título editável. `ItemDrawer` removido de `Items.tsx`. `onIdea(title, tags, note, extra?)`, `analiseParaIdeia` e `?ideia=1` (foco no Virar ideia, item sem análise) seguem.

## Log (042)
- 2026-10-08 — (1) selo "Relatório" no card (mapa itemKey → relatório mais recente por concorrente, `useRelatorioPorItem`, sem endpoint novo) e link "Relatório de origem" no painel; (2) painel único; (3) `FaixaRedes` (números em linha + sparkline + chips das redes do site). Falta: selo no card do feed Conteúdos (precisaria de mapa por concorrente).
