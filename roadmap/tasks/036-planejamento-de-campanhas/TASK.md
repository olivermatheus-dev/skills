# 036 — Planejamento de campanhas de anúncios (Google Ads por palavra-chave · Meta/TikTok em quadro de funil)

Status: **registrada (2026-10-08)**, sem desenho detalhado · Depende de: 035 (fontes: volumes, CPC e palavras dos concorrentes), 034 (anúncios dos concorrentes como referência), skill `ads-meta`

## Pedido do Oliver (2026-10-08)
"Quero uma parte do nosso software para fazermos um planejamento com nossas estratégias de campanhas de anúncios."
- **Google Ads:** foco em **rede de pesquisa e palavras-chave**. A ferramenta já vem montada para isso. A IA ajuda a pesquisar termos, palavras-chave, volumes de pesquisa etc.
- **Meta Ads e TikTok Ads:** um **mapa mental/fluxograma**, um grande quadro para organizar tudo, criar as campanhas e projetar com facilidade uma **estratégia de funil de anúncios**.

## Primeiro esboço (a validar no desenho)
**Google Ads (pesquisa)**
- Estrutura nativa do Google: campanha → grupo de anúncios → palavras-chave (tipo de correspondência: ampla, frase, exata) + negativas + anúncios RSA (até 15 títulos de 30 caracteres, 4 descrições de 90) + extensões.
- Pesquisa assistida: semente → a IA expande (autocomplete, buscas relacionadas, perguntas, termos dos concorrentes) → volume, CPC e concorrência pela fonte escolhida na 035 → agrupamento por intenção (problema, solução, marca do concorrente, comparação, preço) → sugestão de grupos.
- Lista de negativas reaproveitável; orçamento e CPC estimados por grupo; exportar no formato do Google Ads Editor (CSV).

**Meta / TikTok (quadro de funil)**
- Quadro infinito (canvas) com nós: campanha (objetivo, orçamento CBO/ABO) → conjunto (público, posicionamento, frio/morno/quente) → anúncio (criativo, ângulo, CTA, link), e setas de fluxo entre etapas (topo → meio → fundo, remarketing por engajamento/visita).
- Molde pronto de funil (ex.: conteúdo frio → prova/demo para quem engajou → oferta/trial para visitantes), arrastar anúncios salvos de concorrentes (034) e ideias como referência num nó.
- Ligado à skill `ads-meta` (gerar textos e briefing do criativo a partir de um nó) e ao quadro de tarefas (nó vira tarefa de produção).

## Perguntas em aberto
- Fonte de volume/CPC: Keyword Planner (exige conta Google Ads) ou API paga barata? (depende da 035)
- Biblioteca de canvas (ex.: React Flow / tldraw) — decidir no desenho.
- Arquivos: `companies/<slug>/campaigns/<data>-<campanha>/` já existe para ads.md/lp.md; o plano visual entra lá (ex.: `plano-meta.json`, `google-ads.json`)?

## Log
- 2026-10-08 — registrada a pedido do Oliver. Desenho detalhado: um agente Sonnet com pesquisa na web, depois da 033 e da 034.
