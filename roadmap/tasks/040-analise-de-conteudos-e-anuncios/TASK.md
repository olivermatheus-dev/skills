# 040 — Análise profunda de conteúdos e anúncios dos concorrentes (sob comando, por seleção, com relatório por concorrente)

**Status:** desenho (registrada pelo orquestrador em 2026-10-08). Um Opus no papel de especialista em social media e marketing de conteúdo desenha o sistema (`DESENHO.md` nesta pasta) → aval do Oliver → fases de implementação.
**Relacionadas:** skill `referencias` (já faz "analisar só o marcado" com transcrição barata) · 012 (motor de ideias) · 037 (anúncios: taxonomia de funil, `ads-classify.ts`, fase F = IA nos anúncios) · 038 (tabela/seleção na aba Conteúdos, gaveta do item) · `library/formatos/` (tipos de conteúdo já catalogados) · `.claude/agents/pesquisador`.

## Pedido do Oliver (2026-10-08, ditado)
- Um **script pré-pronto**, **não automatizado**, que o Oliver dispara: escolhe **um concorrente** e roda uma análise. Pode ser **geral de uma rede social**: não todos os posts, mas os **top 20** (se houver) daquela rede.
- Também pela aba **Concorrentes → Conteúdos**: selecionar **um ou mais** conteúdos, ou um atalho como "**top 10**", e analisar.
- **Só analisa o que ainda não foi analisado.** Reanalisar o que já tem análise é uma **opção explícita e separada**.
- **Para cada post/vídeo:** tema; **tipo/estilo de conteúdo** (feature do produto, meme, vídeo explicativo, notícia…; já existe um catálogo no repo e a ideia é catalogar e **descobrir tipos novos**); **gatilhos mentais**; **gancho de abertura** (se houver); os **gatilhos dos primeiros 5 s de retenção**; headline; duração; e o que mais for relevante. **O Opus decide a lista exata de campos.**
- **Transcrição otimizada**, gastando poucos tokens (ferramenta de transcrição, não LLM). **Salvar tudo, nada se perde:** cada conteúdo e cada anúncio puxado vira **um arquivo nosso** com dados, transcrição e análise juntos.
- **Relatórios por concorrente:** cada rodada gera um **mini compilado** que fica **dentro do concorrente**. Na ficha (e na aba Redes e conteúdos) o Oliver vê os relatórios que gerou.
- **Painel do item:** clicar num conteúdo ou anúncio abre um diálogo maior com um **mini painel da análise**: plataforma, views, engajamento, headline, gancho, gatilhos dos 5 s, duração, tipo… organizado e fácil de ler, sem despejar tudo. **Editável**, com selects nos campos categóricos.
- **Vale igual para anúncios** (análise do anúncio + relatório, mesmo painel).
- **Modelos:** extrair, baixar, transcrever e rodar = **Sonnet 5.5 ou Haiku 5.5** (ou script sem LLM); **a análise do conteúdo = Opus 5.5** (qualidade e profundidade).
- **Objetivo:** entender os padrões do que funciona nos concorrentes (tipo, gatilhos, ganchos, temas) para orientar o nosso conteúdo e os anúncios.

## Brief para o desenho (`DESENHO.md`)
1. **Ficha de análise**: os campos exatos (nome, tipo, vocabulário fechado × livre, de onde vem: script, Haiku/Sonnet ou Opus), para conteúdo orgânico e para anúncio, com o que é comum e o que é específico. Vocabulários controlados (tipo de conteúdo, gatilho, tipo de gancho, formato) editáveis em `tags.yml` ou `library/formatos/`, com "novo tipo proposto" que o Oliver aprova.
2. **Arquivo por item**: onde mora (ao lado dos snapshots/`ads/` do concorrente), schema Zod em `schema/`, como guarda transcrição, quadros-chave/OCR (se valer), análise com versão e modelo, e as **edições do Oliver como override** que sobrevive a reanálise (mesmo princípio do `marks.json` da 037).
3. **Pipeline barato**: seleção → baixar só o necessário (áudio; quadros do início para o gancho visual) → transcrever local (faster-whisper; legenda automática do YouTube quando houver) → pré-processar com script/Haiku → **Opus** só com o pacote enxuto (transcrição + métricas + legenda + 3–5 quadros, não o vídeo) → gravar. Estimar tokens e custo por item e por rodada de 20. Idempotência (hash) e "reanalisar" explícito.
4. **Como o Oliver dispara** sem agendamento (regra do hub): botão no app que grava um pedido de fila (como o `pedido.json` da `analise-concorrentes`) + comando/skill que roda a fila no Claude Code (subagentes: Haiku/Sonnet para extração, Opus para análise), e/ou CLI direta.
5. **Relatório por concorrente**: estrutura do mini compilado (padrões de tipo, gatilho, gancho, tema × desempenho medido pelas medidas × perfil, × mercado e por seguidor da 038 B2), onde mora, como aparece na ficha (lista de relatórios por data/rede) e como alimenta ideias (012) e a skill `ads-meta`.
6. **Telas**: seleção na aba Conteúdos/Anúncios (checkbox na tabela da 038, "top 10/20", "incluir já analisados"), o painel do item (layout com hierarquia; o que fica em destaque e o que vai para "detalhes"), a lista de relatórios na ficha.
7. **Fases pequenas e testáveis**, com critério de pronto, e o que reaproveita da skill `referencias`, da 037 e da 012 (sem duplicar).
8. Perguntas para o Oliver (só as que mudam o desenho).

## Log
- 2026-10-08 — registrada pelo orquestrador a partir do áudio do Oliver; desenho disparado para um Opus especialista em social media.
- 2026-10-08 — `DESENHO.md` entregue (Opus): ficha por item em `competitors/<id>/fichas/` com override do Oliver, vocabulários do nicho, pipeline preparar → Opus → relatório, prompt, custo (~US$ 0,08/item; ~US$ 1,9 por rodada de 20; ~1 no Batch), wireframes, fases A–I e exemplo real (Sintropia, reel DdtuawFvkXi, só legenda). Achado: coleta pública do IG traz só 6 itens por perfil (top 20 exige Apify). Nada implementado, sem commit. Aguarda as 7 perguntas do §10 e o aval da fase A.
- 2026-10-08 — **Oliver: "segue as recomendações"** (decisões do §10): (1) sem Apify por ora; top 20 só YouTube/TikTok, Instagram usa o que tem (6); (2) Opus roda como subagente do Claude Code (assinatura), disparado pelo caminho do "Rodar IA"; (3) vídeo apagado após extrair áudio e quadros (fica transcrição + quadros, fora do git); (4) Opus recebe 2 quadros + descrição do Haiku; (5) sem IA barata em todo anúncio: Opus só no selecionado, triagem grátis = classificador de regras da 037; (6) termos novos aceitos em lote no relatório; (7) um relatório por rodada, o mais recente em destaque na ficha. Orquestrador dispara as fases A → B.
