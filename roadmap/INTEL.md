# Inteligência de mercado — registro e análise

> Status: **ideia em discussão** (não é prioridade agora; a prioridade é o vídeo). Registrado em 2026-10-06.

## O que o usuário quer
- **Concorrentes**: toda semana, coletar os anúncios que eles estão veiculando e analisar ângulos, ofertas, formatos e criativos.
- **Redes sociais**: acompanhar os perfis próprios e os dos concorrentes, e achar conteúdos virais por hashtag, assunto ou nicho.
- **Tendências**: o que está em alta no Google, o que está sendo pesquisado e os assuntos do momento. Encaixar nos conteúdos quando fizer sentido para a marca.
- **Ranqueador econômico**: tecnologia "GEV/JEV" (nome a confirmar com o usuário) para **ordenar e filtrar** muitos itens de forma barata, sem passar tudo por um LLM.
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
- [ ] "GEV/JEV": qual é exatamente? (link ou nome correto) Será que é um *reranker*/ordenador por embeddings?
- [ ] Orçamento mensal aceitável para coletores pagos (Apify, SerpAPI)?
- [ ] Quantos concorrentes por empresa? Quais redes importam?
- [ ] O software de marketing existente vai, no futuro, absorver este hub ou ler os dados dele?
