# Inteligência de mercado — registro e análise

> **Desenho atual e fases: `tasks/012-motor-de-ideias/TASK.md`** (2026-10-07: motor de ideias com painel ranqueado, marcação do Oliver e análise barata só do marcado). Este arquivo fica como registro das fontes e da análise dentro × fora.
>
> Status: **ideia em discussão** (não é prioridade agora; a prioridade é o vídeo). Registrado em 2026-10-06; ampliado em 2026-10-07 com o cadastro de concorrentes e as fontes gratuitas. Modelo de dados em `APP.md`.

## O que o usuário quer
- **Concorrentes**: toda semana, coletar os anúncios que eles estão veiculando e analisar ângulos, ofertas, formatos e criativos.
- **Redes sociais**: acompanhar os perfis próprios e os dos concorrentes, e achar conteúdos virais por hashtag, assunto ou nicho.
- **Tendências**: o que está em alta no Google, o que está sendo pesquisado e os assuntos do momento. Encaixar nos conteúdos quando fizer sentido para a marca.
- **Ranqueador econômico**: tecnologia **JEV**, para **ordenar e filtrar** muitos itens de forma barata, sem passar tudo por um LLM. O usuário tem vídeos explicando como criar o nosso próprio (registrar em `material/` quando chegarem).
- **Tudo centralizado**: os dados ficam num lugar só, para que as skills (ideias, anúncios, LP, vídeo) já leiam esses insights.
- Existe um software de marketing do usuário que precisa de refatoração. Por enquanto o trabalho fica aqui.

## Análise: dentro ou fora deste repositório?
**Recomendação: os dados ficam dentro; os coletores ficam como um módulo isolado dentro do mesmo repo. Não é para virar um "software gigante" agora.**

Para comparar: o repo é a **biblioteca** (o que se sabe sobre cada empresa); os coletores são os **estagiários** que trazem recortes de jornal toda semana. Os recortes entram na biblioteca já resumidos. O caderno bruto do estagiário fica numa gaveta à parte.

| | dentro do repo | fora (projeto/app separado) |
|---|---|---|
| Skills leem os insights direto | ✅ | ❌ precisa de integração |
| Um lugar só para dados | ✅ | ❌ |
| Rodar em agenda (semanal) | ⚠️ cron local ou rotina agendada | ✅ servidor |
| Volume de dados brutos | ⚠️ não cabe no git → banco/arquivos ignorados | ✅ |
| Manutenção de scrapers | igual | igual |

Regra que resolve: **só o que é digerido vai para o git em markdown** (o que as skills leem). O bruto (JSON, imagens e vídeos dos anúncios) fica local, fora do git, num SQLite ou em pastas ignoradas. Se um dia o volume ou a agenda pedirem um servidor, só os coletores migram; os dados digeridos continuam onde estão.

## Cadastro e monitoramento de concorrentes (pedido de 2026-10-07)
- Cadastrar, editar e remover concorrentes por projeto: site, Instagram (@ e ID), YouTube (ID do canal), TikTok, página no Meta (ID), anunciante no Google, outras redes.
- "Atualizar": o comando ou o botão roda os coletores e traz os dados novos (posts, métricas, anúncios ativos, vídeos).
- Análise: o que mais engaja (curtidas, comentários, views, envios), temas, formatos, hooks e ângulos de anúncio. **Favoritar** itens e transformar em pautas e argumentos de venda.
- Modelo de dados: `companies/<slug>/competitors/` (ver `APP.md`).

## Ferramentas e fontes gratuitas (verificar condições atuais antes de implementar)
| fonte | o que dá | custo / acesso | observação |
|---|---|---|---|
| **Instagram Graph API — Business Discovery** | perfil público de contas profissionais: seguidores, posts, legenda, curtidas, comentários, data, tipo de mídia | grátis; exige conta IG profissional própria + app Meta + token | **melhor caminho oficial** para posts de concorrentes. Não traz views de reels de terceiros |
| **Biblioteca de Anúncios da Meta** (site) | anúncios ativos por página, criativos, data de início, variações | grátis, via web | a API oficial cobre só anúncios políticos/sociais e os da UE; anúncio comercial no Brasil = navegador ou scraper |
| **YouTube Data API v3** | canais, vídeos, views, curtidas, comentários | grátis (cota de ~10 mil unidades/dia) | chave de API simples |
| **RSS do YouTube** | últimos vídeos de um canal | grátis, sem chave | `youtube.com/feeds/videos.xml?channel_id=…` |
| **Central de Transparência de Anúncios do Google** | anúncios do Google por anunciante | grátis, via web | sem API oficial |
| **TikTok Creative Center** | top anúncios, hashtags e músicas em alta | grátis, via web | ótimo para tendências de criativo |
| **Biblioteca de Anúncios do LinkedIn** | anúncios por empresa | grátis, via web | B2B |
| **Google Trends** | interesse de busca e assuntos em alta | grátis, via web | API oficial restrita; bibliotecas não oficiais são instáveis |
| **yt-dlp** (código aberto) | metadados e download de vídeos (YouTube, IG, TikTok) | grátis | respeitar os Termos de Uso; útil para analisar o vídeo de referência (engenharia reversa) |
| **Apify** | scrapers prontos (Instagram, Biblioteca de Anúncios, TikTok) | plano grátis com crédito mensal pequeno | caminho pago-por-uso quando a escala crescer |
| **Social Blade** | histórico de seguidores e visualizações | grátis, via web | crescimento ao longo do tempo |
| **Claude no navegador** (extensão do Chrome) | ler a Biblioteca de Anúncios ou perfis logado, como uma pessoa | já disponível | v0 sem infraestrutura; bom para coletas semanais pequenas |

## Desenho proposto (quando for a hora)
```
tools/intel/                     ← coletores (scripts), 1 por fonte
data/intel.sqlite                ← dados brutos (fora do git)
companies/<slug>/intel/
  concorrentes.md                ← lista monitorada (perfis, páginas de anúncio, sites)
  semanas/AAAA-Wss.md            ← relatório semanal digerido
  INSIGHTS.md                    ← o que vale lembrar (as skills leem este)
.claude/skills/intel-semanal/    ← roda coleta → ranqueia → analisa → relatório → sugere pautas
```
Pipeline: **coletar → filtrar/ranquear barato (ranqueador) → LLM só nos top N → relatório → pautas para `content-ideas` e ângulos para `ads-meta`**.

## Fontes e como coletar (comprar antes de construir)
| fonte | caminho provável | atenção |
|---|---|---|
| Anúncios de concorrentes (Meta) | Biblioteca de Anúncios da Meta (via scraper pronto, ex.: Apify) | a API oficial cobre bem só anúncios políticos/UE; scraping pode violar os Termos de Uso |
| Instagram / TikTok (perfis, hashtags, virais) | scrapers prontos (Apify etc.), TikTok Creative Center | Termos de Uso, bloqueios, custo por coleta |
| Tendências Google | Google Trends (via SerpAPI ou biblioteca não oficial) | limites de uso |
| Sites/LPs dos concorrentes | busca na web + leitura direta | — |

Princípio: **usar coletores prontos e pagos por uso** em vez de manter scrapers próprios, que quebram toda vez que a plataforma muda.

## Como começar pequeno (80/20)
1. **v0 manual-assistido:** skill `intel-semanal` em que o Claude pesquisa na web e lê os links de anúncios ou perfis que o usuário colar. Gera o relatório e as pautas. Zero infraestrutura. Valida se o relatório é útil.
2. **v1:** automatizar 1 fonte (anúncios Meta dos concorrentes) com um coletor pronto + SQLite.
3. **v2:** ranqueador + mais fontes + rodar sozinho toda semana.

## Perguntas em aberto
- [x] Tecnologia confirmada: **JEV**. O usuário vai mandar vídeos sobre como construir.
- [ ] Orçamento mensal aceitável para coletores pagos (Apify, SerpAPI)?
- [ ] Quantos concorrentes por empresa? Quais redes importam?
- [x] Decisão (2026-10-07): **toda a gestão do negócio fica neste repo**. O SaaS de marketing do usuário no futuro só puxa ideias daqui e implementa por lá.
