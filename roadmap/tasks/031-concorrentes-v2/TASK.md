# 031 — Concorrentes v2: estrutura de gestor de marketing + central de métricas das redes

Status: **fases A–D feitas (2026-10-08): ficha por área, Instagram sem token, abas da área, anúncios da Meta e coleta semanal** · aguardando uso/aval do Oliver · Depende de: 023 (análise por módulos), 019 (shadcn, ContextSidebar), 012 (motor de ideias)

## Onde está (2026-10-08)
- **Ficha do concorrente** (`app/src/pages/CompetitorDetail.tsx`): cabeçalho compacto e fixo (trilha, logo, frase, chips de mercado · preço · seguidores · Reclame Aqui/loja · ícones das redes com ponto vermelho se a coleta falhou · "atualizado há"). Abas por área com rota `?aba=`: Diagnóstico · Oferta · Produto · Mensagem · Redes e conteúdos · Reputação · Dados.
- **Puxar → diálogo** (`RunDialog` em `components/competitors/Analysis.tsx`): lista compacta dos módulos com a data da última vez; já abre com "redes + o que falta"; atalhos Só redes / Completa; confirma. A coleta das redes roda no fundo, e o pedido na fila da IA vira chip no cabeçalho (`QueueChip`).
- **Resultado da coleta em uma linha** (`CollectStrip`): um chip por perfil (seguidores · itens); erro resumido ("precisa de acesso", "limite", "não encontrado"), com o texto inteiro no tooltip.
- **Redes:** números numa faixa só (seguidores, conteúdos, mediana de views, engajamento, fora da curva; "marcados" só se houver). Perfis sem coleta viram ícone apagado. O gráfico de seguidores só aparece com 3 ou mais coletas, e "redes encontradas no site" já descarta links genéricos.
- **Barra lateral:** logo real e seguidores somados ao lado do nome.
- **Instagram sem token** (`tools/intel/adapters.ts → instagramViaPublicWeb`, normalizador `normalizePublicInstagram`): embed público com UA de rastreador de preview. Traz seguidores, seguindo, nº de posts, bio, verificado e foto. Os **últimos 6 posts** vêm com tipo, legenda, curtidas, comentários, data e capa; reels também com views e duração (1 chamada por vídeo, pausa de 1,5 s). Apify e cookies do yt-dlp ficam como reserva. `INTEL_IG_PUBLIC=0` desliga. Testado de verdade: clinicaagil (31,3 mil) e sintropia.psi (53,4 mil). Limites: só 6 posts, sem link/categoria; pode quebrar se o Instagram mudar o preview.
- Prints: `prints/antes/` e `prints/depois/` (01–08 abas e diálogo; 09–10 coleta real da Sintropia).

## Abas da área (2026-10-08)
Rotas fixas em `pages/index.ts` (ganham da `:id` da ficha); casca comum `components/competitors/area.tsx` (`AreaPage`, `useMarket`, `SortTable`, `StatStrip`). Dois endpoints novos em `app/server/api.ts`: `analysis-all` (resultados de todos) e `competitors-feed` (2 últimas coletas de cada perfil + marcações).
- **Panorama** (`/concorrentes`): faixa com preço de entrada (mediana e faixa), plano grátis, teste grátis, audiência somada e a maior; gráfico preço × audiência (log, tooltip, clique abre a ficha); audiência e crescimento; 6 conteúdos mais fora da curva; brechas para nós de todas as análises.
- **Concorrentes** (`/lista`): tabela densa por padrão (logo, frase, preço, modelo, seguidores com Δ, redes com ponto de erro, atualizado, ★, puxar); cards continuam como opção; candidatos com aceitar/recusar na linha.
- **Comparar** (`/comparar?v=`): Oferta e preço (entrada, plano mais caro, anual, modelo, planos, teste, fidelidade) · Funcionalidades (matriz **funcionalidade × concorrente** em `intel/matriz.json`, `schema/matrix.ts`: 43 funcionalidades em 11 grupos, Kzloo fixa na 1ª coluna, status tem/parcial/não/não sei/planejado, filtros "onde há diferença", "eles têm, nós não", "só nós temos"; clicar na célula edita e vira `by: oliver`, a IA nunca sobrescreve) · Mensagem (promessa do hero, CTA, prova social, tom, seções) · Reputação.
- **Conteúdos** (`/conteudos`): feed de todos com período (7/30/90/tudo), rede, formato, concorrente, ordenação, status, ★, busca; faixa com mediana de views, engajamento, fora da curva e formato que mais rende; marcar e "Virar ideia" ali mesmo (`useMakeIdea`, compartilhado com a ficha).
- **Redes** (`/redes`): um perfil por linha e rede (Instagram por padrão): seguidores, Δ, posts/semana, mediana de views e ♥, engajamento por seguidor, formato que rende, último post; quem não tem coleta naquela rede aparece embaixo (`metrics.ts`).
- **Anúncios** (`/anuncios`): reservado para a fase D; atalhos para a Biblioteca de Anúncios de cada concorrente.
- **Coletas** (`/coletas`): estado de cada perfil (ok, erro resumido com tooltip, velho > 7 dias, nunca puxado; redes sem coletor escondidas por padrão), filtros, "Puxar todos" e puxar por concorrente, fila da IA.
- Prints: `prints/area/`.

## Fase D: anúncios e coleta semanal (2026-10-08)
- **Anúncios** (`tools/intel/ads.ts`, CLI `npm run ads -- kz <id>|--all`, schema `schema/ads.ts`): Biblioteca de Anúncios da Meta, página pública, BR, só ativos, sem login. Playwright headless lê o JSON embutido na página (`ad_library_main.search_results_connection`) e o `/api/graphql/` da rolagem. Acha a página do anunciante pelo nome (o `page_id` fica no snapshot). Campos: id, página, início, plataformas, texto, título, CTA, destino, imagem/vídeo/carrossel, miniatura (baixada em `media/ads/`), variações. Gravado em `competitors/<id>/ads/<data>.json` (imutável). Para em login/checkpoint/captcha; pausa de 4 s entre concorrentes. Até 30 por concorrente.
- **Aba Anúncios:** faixa (ativos, quantos anunciam, novos, no ar há 30+ dias = sinal de resultado, formato mais usado), chip por concorrente com contagem, novos e ↻, filtros (formato, plataforma, só novos, busca), ordenação por tempo no ar; card com miniatura, dias no ar (âmbar ≥ 30), variações, texto, título, CTA e domínio. Anúncio de catálogo (`{{product.brand}}`) aparece como "Catálogo (texto dinâmico)".
- **Coleta semanal** (`tools/intel/semanal.ts`, `npm run intel:semanal -- kz [--sem-anuncios]`): redes de todos os ativos + anúncios, e o relatório `companies/<slug>/intel/semanas/AAAA-Wss.md` (audiência com Δ e a data da base, publicado nos últimos 7 dias ordenado por fora da curva, anúncios ativos e novos, falhas). Estado em `intel/coleta-semanal.json`. **Só roda quando o Oliver manda** (decisão de 2026-10-08: nada recorrente nem agendado): botão "Rodar agora" com o app aberto ou o comando acima. Trava contra rodada dupla (3 h). Script puro: não gasta tokens.
- **Painel na aba Coletas:** última rodada, progresso ao vivo, "Rodar agora", relatórios por semana (abre formatado).
- Skills `content-ideas` e `ads-meta` passam a ler o relatório mais recente.
- **Primeira rodada real (2026-W41):** 28/29 perfis ok; 50 anúncios ativos em 6 de 11 concorrentes (Sintropia 15, Corpora 10, Allminds 9, PsicoManager 7, Mais Terapias 6, Psicoplanner 3); 40 dos 50 no ar há 30+ dias. Na 2ª busca seguida a Corpora deu HTTP 403 (limite da Meta): o relatório avisa e a aba usa a coleta anterior.
- Prints: `prints/fase-d/`.

## Kzloo como referência (2026-10-08)
- `companies/kz/intel/referencia.json` (schema `schema/referencia.ts`, rota `GET /referencia`): a própria empresa tirada só do contexto. Preço de referência R$ 129, que é o da copy (faixa R$ 100–129, final a validar); plano único; sem trial nem garantia declarados; promessa e CTA do COPY; tom do VOICE; funcionalidades **só as prontas** do PRODUTO, nos mesmos grupos da análise dos concorrentes (31 itens). Seguidores: null, porque o Instagram ainda está "a definir".
- **Comparar:** a Kzloo aparece fixa no topo (fora da ordenação) em Oferta e Mensagem, e como 1ª coluna da matriz. Na matriz, "falta" marca os grupos que metade ou mais dos concorrentes têm e a Kzloo não: hoje **IA (8/11)** e **Gestão de equipe (9/11)**.
- **Panorama:** chip "Kzloo (você) R$ 129 · +100% vs mediana · 10/10 cobram menos" e linha tracejada no preço da Kzloo no gráfico ("ainda sem audiência própria"; vira ponto quando houver seguidores). Os rótulos do gráfico não se sobrepõem mais.
- **Manter atualizado:** mudou preço, plano, trial, funcionalidade pronta ou rede própria no contexto → editar o `referencia.json` (as skills `setup` e `analise-concorrentes` não fazem isso sozinhas ainda).
- Prints: `prints/referencia/`.

## Falta / próximos passos
- **Oliver:** usar a ficha nova e dizer o que ainda ocupa espaço demais.
- **Oliver:** usar as abas e apontar o que sobra ou falta (ex.: incluir a Kzloo como linha de referência no Comparar e no gráfico preço × audiência).
- Sem página achada na Biblioteca: Clínica Ágil, GestorPsi, PersonCare, PsiNota AI e Terapee (0 anúncios ou nome diferente). Se anunciam com outro nome de página, cadastrar o link do Facebook em Editar.
- Allminds: o YouTube `@allmindsapp` dá 404 (canal mudou ou não existe): conferir o link.
- YouTube da Sintropia (`@sintropiapsi`) volta com 0 itens pelo yt-dlp: investigar.
- `npm run test:intel`: o teste "coleta completa (fixtures)" já falhava antes (`by.facebook` undefined), segundo o subagente.
- Mais de 6 posts no Instagram sem login: não há rota anônima conhecida. Se precisar de histórico, rodar a coleta toda semana (os snapshots acumulam) ou usar o Apify.

## Pedido do Oliver (2026-10-08)
- Mais abas e lugares dedicados, para focar em uma coisa por vez.
- Lugar próprio para **métricas de conteúdo e redes** (YouTube, TikTok, Instagram), com o máximo de informação.
- **Instagram sem token** (pesquisa em paralelo, ver "Coleta" abaixo).
- "O que rodar" só aparece ao clicar em **Puxar**: escolhe os módulos e confirma.
- Informação compacta: "onde atua", preço, idioma etc. viram chips no cabeçalho, quase sem ocupar espaço.
- Organizar **por área e por diagnóstico, do ponto de vista do marketing**.
- Ficar com cara de app profissional.

Prints de antes: `prints/antes/` (01 lista em cards, 02 tabela, 03 detalhe/Análise, 04 detalhe/Redes, 05 detalhe/perfil).

## Diagnóstico da tela atual
**Lista (01, 02)**
1. O card repete "não puxado" em 4–6 linhas: ruído, e o que importa (audiência, crescimento, preço) fica pequeno.
2. Duas linhas de filtros (tipo, plataforma, tag, favoritos, mercado, estágio, modo) pesam mais que o conteúdo.
3. A tabela "Comparar" mistura oferta com operação (colunas "Módulos 10/10" e "Seções da LP"): o gestor quer ver oferta, produto e audiência lado a lado, cada um em seu lugar.
4. Não existe visão do **mercado** (preço mediano, quem tem plano grátis, quem cresce mais, brechas somadas).

**Detalhe (03–05)**
5. A aba Análise **abre pelo painel de controle** ("O que rodar", 11 caixas), e não pelo insight. → vira diálogo do botão Puxar.
6. Página única com ~10 blocos empilhados (resumo, onde atua, preços, features, SWOT, LP, reputação, contato, perfis, sitemap): longa e sem hierarquia de marketing.
7. "Onde atua" ocupa um card inteiro para dizer "Brasil · pt-BR · BRL". O mesmo vale para contato, modelo e trial: são **chips de cabeçalho**.
8. As abas por perfil (Todos 60 · site · @… · @…) estouram na horizontal, e perfis "não puxado" aparecem como se tivessem dado.
9. Os KPIs são grandes para pouca informação ("Marcados 0"); os gráficos de seguidores com 2 pontos são uma linha reta e não dizem nada.
10. "Redes encontradas no site" traz lixo (`facebook.com/business/marketing-partners`, perfil de outra marca).
11. Instagram nunca foi puxado (exige token/cookies). É a rede mais importante do nicho.
12. As métricas que um gestor usa não existem: taxa de engajamento, frequência de posts, mix de formatos, melhor dia/horário, crescimento em 7/30 dias, duração × views.

## Nova arquitetura

### Área "Concorrentes": abas no topo (rota por aba)
| aba | rota | pergunta que responde |
|---|---|---|
| **Panorama** | `/concorrentes` | como está o mercado? (KPIs, preço × audiência, quem cresce, brechas somadas, alertas da semana) |
| **Concorrentes** | `/concorrentes/lista` | quem são? (tabela densa com logo, preço de entrada, modelo, audiência total, Δ30d, nota; cards como opção) |
| **Comparar** | `/concorrentes/comparar` | onde ganho e onde perco? (sub-abas: Oferta e preço · Matriz de funcionalidades ✓/✗ · Mensagem e LP · Reputação) |
| **Conteúdos** | `/concorrentes/conteudos` | o que está funcionando? (feed unificado de todos os posts/vídeos, grade de miniaturas, filtros de rede/formato/período, ordenar por fora da curva, views, engajamento; ★ → ideia) |
| **Redes** | `/concorrentes/redes` | quem tem audiência e quem cresce? (tabela por perfil: seguidores, Δ7d/Δ30d, posts/semana, mediana de views, engajamento %, formato que mais rende; gráficos de evolução; filtro por rede) |
| **Anúncios** | `/concorrentes/anuncios` | o que estão anunciando? (Biblioteca de Anúncios da Meta; fica como "em breve" até o coletor existir) |
| **Coletas** | `/concorrentes/coletas` | o que rodou, falhou ou está na fila? (histórico, erros, agenda, candidatos do radar e arquivados) |

### Ficha do concorrente
**Cabeçalho compacto (fixo ao rolar):** logo, nome, ★, frase de uma linha, e uma única linha de chips:
`🇧🇷 BR · pt-BR` · `A partir de R$ 89 · freemium · 7 dias grátis` · `2,9 mil seguidores ▲3%` · `Reclame Aqui —` · ícones das redes (cinza = não puxado) · `Atualizado há 19 h`. À direita: **Editar** e **Puxar ▾** → diálogo "O que atualizar" (módulos com a data da última vez, "Só o que falta", "Completa", estimativa de custo) → **Confirmar**.

**Abas da ficha, por área de marketing:**
| aba | conteúdo (vindo dos módulos de hoje) |
|---|---|
| **Diagnóstico** | resumo, público, posicionamento, tamanho; SWOT compacto (fortes · fracos · **brechas para nós** em destaque); "o que copiar" (achados da LP); minhas anotações |
| **Oferta** | planos lado a lado, trial, fidelidade, add-ons e taxas, observações |
| **Produto** | funcionalidades por categoria (★ diferenciais), "não mostram", comparação com a Kzloo |
| **Mensagem** | hero da LP, sequência de seções, CTAs, prova social, tom de voz |
| **Redes e conteúdos** | métricas por rede (sub-abas por perfil, só os puxados; os não puxados ficam num aviso "conectar") + feed de conteúdos com os filtros de hoje |
| **Reputação** | Reclame Aqui, nota nas lojas, menções na imprensa e em comparativos |
| **Dados** | contato, perfis confirmados, site e sitemap, histórico de coletas (técnico, fica por último) |

### Métricas de redes (cálculo no normalizador, uma vez, gravado no snapshot)
- Perfil: seguidores, seguindo, nº de posts, Δ7d e Δ30d (entre snapshots), posts por semana (últimos 30 dias).
- Conteúdo: views, curtidas, comentários, compartilhamentos/salvos quando houver, **engajamento** = (curtidas + comentários) ÷ seguidores, **fora da curva** = views ÷ mediana do perfil (já existe), duração, formato (reel, carrossel, foto, short, vídeo, live).
- Agregados: mix de formatos e rendimento por formato, melhor dia da semana e horário, hashtags e temas mais usados, duração × views.
- Coleta recorrente semanal (heartbeat) para os gráficos terem histórico de verdade.

### Coleta do Instagram sem token
Pesquisa e implementação em paralelo (subagente, 2026-10-08): rotas públicas do site (`web_profile_info` com `x-ig-app-id`, embed, og tags) primeiro; Apify e cookies do yt-dlp ficam como reserva. Resultado: ver o log abaixo.

### Acabamento de app profissional
- Cabeçalho de página e trilha (Concorrentes › Corpora) no mesmo padrão em todas as abas; abas com rota (voltar e compartilhar funcionam).
- Tabelas densas (shadcn Table) com ordenação por coluna, colunas fixas e números alinhados à direita; cards só como opção.
- Barra lateral do contexto com logo real e mini-métrica (seguidores ou Δ) em vez da letra.
- Estados: skeleton parecido com o conteúdo final, vazio com ação ("Conectar Instagram"), erro com o que fazer.
- Números: 2,9 mil / 1,2 mi, Δ com cor e seta, tooltip com o valor exato e a data da coleta.
- Gráfico só com 3+ coletas; antes disso, número + "1ª coleta em 07/10".
- Filtrar os links de "redes encontradas no site" (descartar páginas genéricas do Facebook/Meta e perfis de outras marcas).
- Atalhos: `/` busca, `J/K` navega entre concorrentes na ficha.

## Fases
- **A — estrutura:** abas da área com rota, ficha com cabeçalho compacto + abas por área, "Puxar ▾" com diálogo de módulos. Só reorganiza o que já existe.
- **B — Redes e Conteúdos:** métricas novas no normalizador, aba Redes (tabela + evolução), feed unificado de Conteúdos, Instagram sem token ligado.
- **C — Panorama e Comparar:** KPIs de mercado, preço × audiência, matriz de funcionalidades, brechas somadas.
- **D — Anúncios** (Biblioteca da Meta) e coleta semanal automática.

## Log
- 2026-10-08 — fase C (parte): matriz de funcionalidades editável no Comparar (API `/matrix`, store, schema), preenchida para os 11 concorrentes (Sintropia entrou) e a Kzloo; conferida no app.
- 2026-10-08 — diagnóstico com prints (`prints/antes/`), plano da estrutura. Pesquisa do Instagram sem token disparada em paralelo.
- 2026-10-08 — Kzloo como linha de referência no Comparar e no gráfico do Panorama (dados do contexto).
- 2026-10-08 — Oliver: coleta semanal só sob comando, sem agendamento → agendador removido (servidor, painel e estado).
- 2026-10-08 — fase D: coletor de anúncios da Meta (subagente) + coleta semanal com relatório e agendador no app; 1ª rodada real W41.
- 2026-10-08 — abas da área feitas (Panorama, Concorrentes, Comparar, Conteúdos, Redes, Anúncios, Coletas), conferidas com prints em `prints/area/`.
- 2026-10-08 — pedidos do Oliver: "o que rodar" só no Puxar; onde atua e afins como chips; resultado da coleta compacto; organizar como gestor de marketing. Fase A da ficha feita. Instagram público implementado (subagente) e conferido numa coleta real.
