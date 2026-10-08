# 035 — Fontes de inteligência de concorrentes (anúncios, SEO, estratégia)

**Status:** pesquisa feita (2026-10-08). Nada implementado. Próximo passo: Oliver escolher a fase 1 (ver "Ordem de implementação").

**Objetivo:** mapear a estratégia completa de um concorrente SaaS (Sintropia, Corpora, PsicoManager...) além do que já temos (site via Playwright, Reclame Aqui, Instagram público, YouTube/TikTok via yt-dlp, Biblioteca de Anúncios da Meta só ativos/BR). Ver `roadmap/INTEL.md` e `031-concorrentes-v2`.

**Aviso de confiança:** a pesquisa usou busca web. Itens marcados **(confirmar)** vieram de fonte de terceiros ou conflitante e precisam de teste real/página oficial antes de construir. Preços de terceiros mudam.

## 1. Anúncios

| fonte | entrega | custo / acesso | automatizar | risco | prioridade |
|---|---|---|---|---|---|
| **Google Ads Transparency Center** ([site](https://adstransparency.google.com)) | anúncios por anunciante ou domínio: criativos texto/imagem/vídeo (inclui YouTube), região, plataforma, datas de veiculação; histórico ~12 meses | grátis na web, sem login. **Sem API oficial** | Média-alta. O site usa chamadas RPC internas que scrapers reproduzem e devolvem JSON ([SerpApi](https://serpapi.com/blog/scrape-competitors-google-ads-data-using-python), [Apify](https://apify.com/datapeak/google-ads-transparency)). Dá para fazer com Playwright interceptando a rede (como já fazemos na Meta), filtro região Brasil. Pago por terceiros: ~US$ 0,35 a 3 por mil anúncios (confirmar) | endpoint interno muda sem aviso; termos de uso do Google; volume baixo para 3 a 5 concorrentes = risco baixo | **Alta** |
| **TikTok Creative Center, Top Ads** ([ajuda](https://ads.tiktok.com/help/article?aid=14099)) | anúncios de melhor desempenho por região/setor/objetivo/formato; tendências de hashtags e músicas | grátis; pode exigir login com conta TikTok grátis (confirmar). Não é busca por anunciante: serve para **tendência de criativo no nicho**, não para espionar um concorrente | Baixa (login, interface dinâmica) | login, bloqueio | Média-baixa |
| **TikTok Commercial Content Library** ([API](https://developers.tiktok.com/products/commercial-content-api)) | anúncios por anunciante | grátis, mas cobre só EEE/UK/Suíça; **Brasil fora** (guia de abril de 2026) | Não serve para Brasil | — | Descartar |
| **LinkedIn Ad Library** | anúncios por empresa, último ano | grátis, sem login para navegar; sem API/exportação; sem gasto/impressões (fora UE) | Baixa | B2B: concorrentes da Kzloo (terapeutas autônomos) quase não anunciam lá | Baixa |
| **Pinterest** | não encontrei biblioteca pública equivalente (confirmar) | — | — | — | Descartar por ora |
| **Microsoft/Bing Ads** | escopo da biblioteca incerto (confirmar) | — | — | público de terapeuta BR usa pouco Bing | Descartar por ora |
| **Meta (já temos)** | ativos, BR | grátis | feito | já mapeado | Manter. Lacuna: só ativos; guardar histórico local a cada coleta para ver o que parou |

## 2. SEO e palavras-chave

| fonte | entrega | custo / acesso | automatizar | risco | prioridade |
|---|---|---|---|---|---|
| **Ahrefs Webmaster Tools** ([site](https://ahrefs.com/webmaster-tools)) | **só do nosso domínio**: backlinks (top 1.000), palavras orgânicas (top 1.000), auditoria | grátis, precisa verificar propriedade | Baixa (UI); útil manualmente | — | Média (quando a Kzloo tiver site/blog ativo) |
| **Ahrefs Keyword Generator grátis** ([site](https://ahrefs.com/keyword-generator/?country=br)) | ideias de palavras, volume estimado por país (trocar para BR; confirmar), dificuldade | grátis, sem conta, CAPTCHA a cada busca, sem exportar | Não (CAPTCHA) | proibido contornar CAPTCHA | Média, uso manual |
| **Google Keyword Planner** | ideias e volume; sem gasto ativo mostra **faixas** (0, 1–100, 100–1K, 1K–10K...) e agrupa variantes | grátis com conta Google Ads (sem campanha ativa, volume em faixa) | API exige developer token e conta Ads | faixas largas demais para priorizar | Média: serve para planejar Google Ads **depois que houver campanha** |
| **DataForSEO** ([site](https://dataforseo.com)) | via API: palavras orgânicas de um domínio (Labs), concorrentes por SERP, volume/CPC exatos BR via Keyword Planner API, SERP ao vivo, backlinks, OnPage | **pago por uso**, depósito mínimo ~US$ 50 (confirmar); referências: SERP ~US$ 0,0006 a 0,002 por chamada, keywords ~US$ 0,05 por mil, backlinks ~US$ 0,025 (confirmar na página oficial). Custo real para 5 concorrentes por mês tende a poucos dólares | **Alta**: REST simples, sem scraping, sem bloqueio | custo (controlável com teto), cobrança por endpoint | **Alta** |
| **Google Trends** | interesse relativo, consultas relacionadas, sazonalidade | grátis na web; **API oficial só em alpha por convite** ([Google](https://developers.google.com/search/apis/trends)); alternativas: pytrends (não oficial) | Média: pytrends instável, 429 frequente | bloqueio por taxa | Média (pauta de conteúdo e sazonalidade, não é concorrente) |
| **Autocomplete do Google** (`suggestqueries.google.com`) | sugestões reais de busca ("sistema para psicólogo ...") | grátis, sem chave | Alta, uma linha de fetch | baixo, endpoint não documentado | **Alta** (barato, vira ideias de pauta e de palavras) |
| **Search Console** | consultas, cliques, posição **do nosso site** | grátis, API oficial com OAuth | Média | — | Alta **depois** que o site da Kzloo tiver tráfego |
| **SimilarWeb grátis** | tráfego estimado, fontes, países, concorrentes similares; só estimativa e fraca para site pequeno | grátis na web (limites não confirmados); API paga (planos a partir de ~US$ 199/mês, confirmar) | Baixa (bloqueia scraper) | dado ruim para nichos pequenos | Baixa |
| **Semrush / Ubersuggest / Moz / Keyword Surfer / AnswerThePublic / SerpApi / SE Ranking** | similares aos acima; grátis é muito limitado (poucas consultas/dia) | grátis limitado ou pago mensal | Baixa | custo fixo mensal sem ganho sobre DataForSEO para nosso volume | Baixa |

Resposta direta às perguntas: **palavras orgânicas do concorrente** e **volume/CPC BR** = DataForSEO (única opção barata e automatizável). **Palavras pagas (quem compra qual termo)**: DataForSEO Labs tem endpoint de palavras pagas por domínio (confirmar cobertura de domínios pequenos); alternativa grátis indireta é o Transparency Center (textos dos anúncios mostram os termos). **Tráfego estimado e fontes**: SimilarWeb, pouco confiável para sites pequenos; tratar como ordem de grandeza.

## 3. Outras fontes para mapear a estratégia

| fonte | entrega | custo / acesso | automatizar | risco | prioridade |
|---|---|---|---|---|---|
| **Pixels/tecnologias (detecção própria)** | quais tags o site carrega: Meta Pixel, Google Ads/GA4/GTM, TikTok Pixel, Hotjar, RD Station, HubSpot... = **indica em quais canais ele compra mídia** | grátis: o Playwright que já coleta o site lê requisições e HTML (`fbevents.js`, `gtag`, `analytics.tiktok.com`). BuiltWith free: 10 consultas detalhadas/dia; Wappalyzer API é paga ([comparativo](https://seomator.com/blog/wappalyzer-alternatives), confirmar) | **Alta**, é só estender a coleta atual | nenhum | **Alta** |
| **Wayback Machine** ([CDX API](https://archive.org/help/wayback_api.php)) | histórico de preço, LP, home, planos; datas de mudança | grátis, sem chave | **Alta**, HTTP simples; lista capturas e baixa as relevantes | baixo; limite de taxa | **Alta** (preços e posicionamento ao longo do tempo) |
| **Diff do site** | detecta mudança de preço/oferta/copy semana a semana | grátis, local | **Alta**: guardar texto/screenshot da coleta e comparar com a anterior | nenhum | **Alta** |
| **CNPJ** ([BrasilAPI](https://brasilapi.com.br/docs)) | data de abertura (`dataInicioAtividade`), porte, capital social, sócios, CNAE | grátis, sem chave (campos a confirmar com resposta real) | **Alta**, 1 request por CNPJ (precisa do CNPJ: está no rodapé do site) | baixo | Média (maturidade e tamanho) |
| **App Store / Google Play** | avaliações, notas, changelog, frequência de atualização, descrição | grátis (páginas públicas; iTunes Lookup API sem chave; Play via scraper) | Média-alta | Play muda HTML | Média (só concorrentes com app) |
| **E-mail marketing (assinar newsletter)** | sequência de boas-vindas, ofertas, cadência | grátis; **cadastro com e-mail = ação manual do Oliver** (o agente não cria conta) | Parcial: Oliver assina com um e-mail dedicado e a IA lê a caixa depois | cadastro é de responsabilidade do Oliver | Média-alta |
| **Glassdoor / LinkedIn (tamanho do time)** | nº de funcionários, vagas abertas (vaga = foco estratégico) | grátis na web com login obrigatório | Baixa (login e anti-bot) | termos proíbem scraping; fazer **manual** | Baixa |
| **Google Meu Negócio / Maps** | só se houver endereço físico | — | — | — | Descartar (SaaS online) |
| **Comunidades** (grupos de terapeutas no Facebook/WhatsApp/Reddit, fóruns, Reclame Aqui já feito) | dores reais, objeções, o que citam dos concorrentes | grátis | Baixa (grupos fechados) | privacidade/LGPD | Média, manual, alimenta `AUDIENCE.md` |

## 4. Ordem de implementação recomendada

**Fase 1 — barato, grátis, só estender o que existe (alimenta: estratégia/oferta do concorrente)**
1. Detecção de pixels e ferramentas de marketing na coleta do site (Playwright). Mostra Meta/Google/TikTok pixel por concorrente.
2. Histórico de preço/LP: Wayback CDX + diff semanal do site coletado. Alimenta "preços e planos" e a LP.
3. CNPJ via BrasilAPI (data de abertura, porte).

**Fase 2 — anúncios do Google (alimenta: aba Anúncios do app, ângulos para `ads-meta`/Google Ads)**
4. Google Ads Transparency Center por domínio, região BR, via interceptação de rede no Playwright; guardar criativos e textos em `competitors/<slug>/ads-google/` com data de primeira/última vez visto (histórico local). Se quebrar muito, fallback pago por terceiros (Apify, centavos).

**Fase 3 — SEO e palavras (alimenta: aba SEO/Palavras, planejamento de Google Ads)**
5. Autocomplete do Google: sugestões para ~20 sementes ("sistema para psicólogo", "agenda para terapeuta", "prontuário online"...) → banco de ideias de pauta e palavras.
6. DataForSEO com teto mensal (ex.: US$ 5): palavras orgânicas e pagas por domínio concorrente, volume e CPC BR dos termos do plano de Google Ads, SERP dos termos principais (quem aparece). Depende de decisão de orçamento do Oliver (pergunta em aberto do INTEL.md).
7. Google Trends (pytrends ou API oficial se o convite sair) para sazonalidade.

**Fase 4 — manuais assistidos**
8. Newsletter dos concorrentes (Oliver assina, IA lê), App Store/Play, comunidades.

**Depois que o site/blog da Kzloo tiver tráfego:** Search Console (API) e Ahrefs Webmaster Tools.

## 5. Mapa fonte → tela do app
- **Anúncios:** Meta (existente) + Google Transparency + pixels detectados (mostra em que canal o concorrente investe).
- **SEO/palavras:** DataForSEO + autocomplete + Trends (+ Search Console depois).
- **Planejamento de Google Ads:** lista de palavras com volume e CPC BR (DataForSEO/Keyword Planner), termos que concorrentes compram, textos de anúncio do Transparency Center como referência de copy.
- **Estratégia do concorrente:** Wayback + diff + CNPJ + pixels + newsletter.

## 6. Decisões pendentes do Oliver
- Orçamento mensal para DataForSEO (sugestão: teto de US$ 5 a 10; depósito mínimo ~US$ 50 pode valer por meses).
- Criar e-mail dedicado para assinar newsletters dos concorrentes (cadastro é feito por ele).
- Quais domínios/CNPJs entram na primeira rodada (Sintropia, Corpora, PsicoManager).

## 7. Fontes consultadas
- Transparency Center: [SerpApi](https://serpapi.com/blog/scrape-competitors-google-ads-data-using-python), [Apify datapeak](https://apify.com/datapeak/google-ads-transparency), [ScrapingBee](https://www.scrapingbee.com/scrapers/ads-transparency-center-api/)
- TikTok: [Creative Center](https://ads.tiktok.com/help/article?aid=14099), [Commercial Content API](https://developers.tiktok.com/products/commercial-content-api), [Search Engine Land](https://searchengineland.com/tiktok-ads-transparency-library-429659)
- LinkedIn: [Zernio docs](https://docs.zernio.com/platforms/linkedin-ads/ad-library), [Cleverly](https://www.cleverly.co/blog/linkedin-ad-library-for-b2b-lead-gen)
- Keywords: [Keyword Planner 2026](https://www.dataslayer.ai/blog/how-to-master-google-keyword-planner-in-2026), [Ahrefs Keyword Generator](https://ahrefs.com/keyword-generator/?country=us), [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools/), [DataForSEO Keyword Planner API](https://dataforseo.com/keyword-planner-api), [SE Ranking: alternativas ao DataForSEO](https://seranking.com/blog/dataforseo-alternatives/)
- Trends: [Google Trends API alpha](https://developers.google.com/search/apis/trends), [anúncio](https://developers.google.com/search/blog/2025/07/trends-api)
- Tecnologias/tráfego: [Wappalyzer alternativas](https://seomator.com/blog/wappalyzer-alternatives), [BuiltWith](https://builtwith.com/), [SimilarWeb API](https://developers.similarweb.com/docs/rate-limit)
- Wayback: [API](https://archive.org/help/wayback_api.php) · CNPJ: [BrasilAPI](https://brasilapi.com.br/docs)

**Não verificado (testar antes de construir):** preço atual por endpoint do DataForSEO Labs; Brasil como região no Top Ads do TikTok; limites do SimilarWeb grátis; campo exato de porte na BrasilAPI; existência de biblioteca pública da Pinterest/Microsoft.
