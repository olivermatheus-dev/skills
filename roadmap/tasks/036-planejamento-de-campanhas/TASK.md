# 036 — Planejamento de campanhas de anúncios (Google Ads por palavra-chave · Meta/TikTok em quadro de funil)

**Status:** desenho completo (2026-10-08). **Nada implementado, nenhuma dependência instalada.** Próximo passo: o Oliver responder a seção 11 e dar o aval da fase A.
**Depende de:** 035 (fontes de volume, CPC e palavras dos concorrentes), 037 (anúncios dos concorrentes: salvos, ideias, taxonomia de funil), skill `ads-meta`. **Não depende** de nenhuma API paga para a fase A.

## Pedido do Oliver (2026-10-08)
"Quero uma parte do nosso software para fazermos um planejamento com nossas estratégias de campanhas de anúncios."
- **Google Ads:** foco em **rede de pesquisa e palavras-chave**. A ferramenta já vem montada para isso. A IA ajuda a pesquisar termos, palavras-chave, volumes de pesquisa etc.
- **Meta Ads e TikTok Ads:** um **mapa mental/fluxograma**, um grande quadro para organizar tudo, criar as campanhas e projetar com facilidade uma **estratégia de funil de anúncios**.

## Resumo do desenho (leia isto primeiro)
- Área nova **Campanhas** no app. Unidade = **plano** (pasta `companies/<slug>/campaigns/<data>-<nome>/`, a mesma dos `ads.md`/`plano.md`). Cada plano pode ter um plano de **Google Ads** (`google-ads.json`) e/ou um **quadro de funil** Meta/TikTok (`funil.json`). O texto (`ads.md`, `plano.md`) continua existindo; o JSON é a fonte estruturada e o `.md` vira exportação.
- **Google Ads (pesquisa)** é uma tela em 7 passos, montada para palavra-chave: sementes → palavras (banco compartilhado, com intenção, volume, CPC) → grupos de anúncios → RSA com contador → negativas → orçamento estimado → CSV do Google Ads Editor. A fase A faz tudo isso **sem API paga** (autocomplete grátis, importação de CSV do Keyword Planner, regras de intenção). A IA entra na fase B; o volume pago (DataForSEO) na C.
- **Meta/TikTok** é um canvas em **React Flow** (`@xyflow/react`, MIT) com 8 tipos de nó, 7 tipos de aresta, moldes de funil, painel lateral de edição, arrastar anúncio de concorrente/ideia, gerar texto pela skill `ads-meta`, nó vira tarefa do quadro e versões do plano.
- **Regra de ouro herdada do hub:** o app **nunca inventa volume, CPC ou taxa**. Sem dado, mostra "sem dado". Premissas de estimativa são editáveis e rotuladas "hipótese".

---

## 1. Google Ads (rede de pesquisa)

### 1.1 Estrutura oficial que a tela segue
Conta → **campanha** (orçamento, lances, rede, local, idioma) → **grupo de anúncios** (tema; palavras-chave e anúncios) → **palavra-chave** com tipo de correspondência → **anúncio responsivo de pesquisa (RSA)**; negativas em campanha, grupo ou lista compartilhada.
- **Correspondência** (página oficial): **ampla** (padrão, sem símbolo; Google recomenda com Smart Bidding), **frase** (`"termo"`), **exata** (`[termo]`). Mais ampla cobre as mais estreitas, então não repetir a mesma palavra em vários tipos.
- **RSA** (página oficial): **3 a 15 títulos de até 30 caracteres; 2 a 4 descrições de até 90; 2 campos de caminho de até 15**. Fixação (títulos 1, 2, 3 e descrições 1, 2): títulos 1 e 2 e descrição 1 sempre aparecem, o 3º título e a 2ª descrição não são garantidos; fixar reduz as combinações testáveis e pode baixar a Ad Strength (Google não recomenda para a maioria). Recomenda 2+ RSAs por grupo, cada um com URL final própria e Ad Strength "Boa" ou "Excelente".
- **Agrupar por intenção, não por palavra:** fontes de mercado (blogs, não o Google) convergem em **grupos temáticos (STAG)** em vez de um grupo por palavra (SKAG): dados juntos deixam o lance automático aprender mais rápido; SKAG só para as 10–20 palavras mais valiosas. **Marca e concorrente** ficam em campanha própria com correspondência mais fechada; nas outras campanhas, os nomes dos concorrentes entram como negativas. A recomendação de "incluir marca" do Google pode ligar correspondência ampla na campanha toda: revisar antes de aceitar.
- Lance: conta nova sem conversões não tem dado para Smart Bidding. Sugestão do app: começar com **frase + exata**, "maximizar cliques" com teto de CPC (ou CPC manual) e só migrar para "maximizar conversões" e ampla depois de ~15 a 30 conversões (regra de dedão de blog, rotulada como tal).

### 1.2 Fluxo (7 passos, cada um com chip de estado)
1. **Sementes.** Lista curta de termos que o Oliver acredita (ex.: "sistema para psicólogo", "agenda para terapeuta", "prontuário online") + sementes automáticas: nomes dos concorrentes cadastrados em `competitors/` (gera `<marca>`, `<marca> preço`, `<marca> alternativa`, `<marca> vs`, `<marca> é bom`) e as dores de `AUDIENCE.md` (a IA propõe, o Oliver aprova).
2. **Palavras.** Expande, mede, classifica (1.3). Resultado: **banco de palavras** da empresa, compartilhado entre planos.
3. **Grupos.** Sugestão de grupos por intenção + tema; arrastar/mover em massa; sugestão de campanhas (1.5).
4. **Anúncios.** Editor de RSA com contadores (1.6).
5. **Negativas.** Lista-base por empresa + negativas sugeridas pelo descarte de palavras (1.7).
6. **Orçamento.** Cliques e custo estimados por grupo, com premissas visíveis (1.8).
7. **Exportar.** CSV para o Google Ads Editor + checagem (1.9).

### 1.3 Pesquisa de palavras: fontes, métricas e intenção
**Expansão** (de onde vêm os termos), em ordem de custo:
| origem | como | custo | fase |
|---|---|---|---|
| **Autocomplete** (`suggestqueries.google.com`, `hl=pt-BR&gl=br`) | semente + a–z, + prefixos de pergunta (como, qual, melhor, quanto custa, para) | grátis, endpoint não documentado (já avaliado na 035), ~30 chamadas por semente com pausa de 300 ms | A |
| **Termos dos concorrentes** | nomes (marca), títulos/H1/meta do site já coletado em `competitors/<id>/site/`, textos dos anúncios do Transparency Center (035 fase 2), autocomplete de `<marca> ...`; palavras pagas/orgânicas do domínio via DataForSEO Labs (035 fase 3, cobertura de domínio pequeno a confirmar) | grátis, exceto DataForSEO | A (site e marca), C (domínio) |
| **IA** | a partir das dores/linguagem literal de `AUDIENCE.md`, mecanismo e objeções de `COPY.md`, e do que a busca devolve | tokens (1.10) | B |
| **Relacionadas e "as pessoas também buscam"** | não há fonte grátis estável; vêm do DataForSEO (SERP) | pago | C |
| **Importadas** | CSV do Keyword Planner, do Ahrefs/Semrush ou do relatório de termos de pesquisa do Ads | grátis | A |

**Métricas por palavra** (mesma ideia do Keyword Planner, do Magic Tool da Semrush e do Keywords Explorer da Ahrefs, adaptada):
- **Volume mensal BR**, número exato (DataForSEO) ou **faixa** (Keyword Planner de conta sem gasto: o app aceita e mostra "1 mil–10 mil"); **tendência** de 12 meses (sparkline; vem dos `monthly_searches` do DataForSEO ou do Keyword Planner; sem dado fica em branco); **CPC** mínimo–máximo em R$ (Keyword Planner mostra o custo médio para aparecer; DataForSEO também); **concorrência** (baixa/média/alta, do Planner). A Ahrefs mostra ainda dificuldade, potencial de tráfego e tópico-pai: são métricas de SEO orgânico, **não entram** (o Google Ads não usa).
- Cada métrica carrega **fonte e data** (chip "Planner · 08/10", "DataForSEO · 08/10", "manual"). Métrica de fonte diferente nunca é somada em silêncio.
- **Plano B sem custo** (a fase A inteira roda nele): (a) importar CSV do Keyword Planner (exige conta Google Ads com cobrança configurada; sem gasto ativo o volume vem em faixas; categorias sensíveis como saúde podem não devolver nada, ver pergunta 1); (b) a posição e a frequência no autocomplete viram um **sinal de demanda sem número** (ordenável, nunca exibido como volume); (c) colar volume à mão. **A IA nunca estima volume nem CPC.**

**Classificação por intenção** (vocabulário fechado, mesmo espírito da 037):
| intenção | exemplo (Kzloo) | valor para anúncio | correspondência sugerida |
|---|---|---|---|
| `solucao` | "software para psicólogo", "sistema de agendamento para terapeuta" | alto (compra) | frase + exata |
| `categoria` | "sistema para psicólogo", "app de gestão para consultório" | alto | frase + exata |
| `problema` | "como organizar agenda de consultório", "cobrar paciente que falta" | médio (dor, ainda não busca produto) | frase |
| `marca-concorrente` | "sintropia", "psicomanager preço" | médio-alto, **campanha própria** | exata |
| `comparacao` | "sintropia ou corpora", "melhor sistema para psicólogo" | alto | frase + exata |
| `preco` | "quanto custa sistema para psicólogo", "sistema para psicólogo grátis" | alto (grátis = cuidado) | frase |
| `informacional` | "modelo de prontuário psicológico", "o que é evolução de sessão" | baixo para conversão (vai para conteúdo/SEO, ou negativa) | evitar |
| `marca-propria` | "kzloo", "kzloo login" | protege a marca, barato | exata |
| `irrelevante` | "psicólogo perto de mim", "valor da consulta" | descartar | negativa |

Além da intenção, **público** (`terapeuta`, `paciente`, `misto`, `indefinido`): "psicólogo online" é busca de paciente e deve virar negativa. Origem do rótulo sempre visível (**regra**, **IA**, **você**; o do Oliver nunca é sobrescrito), como na 037. **Regras grátis** (fase A): lista de marcas dos concorrentes → `marca-concorrente`; "preço/valor/quanto custa/plano/grátis" → `preco`; " vs |ou|melhor|alternativa" → `comparacao`; "como|o que é|modelo|exemplo|passo a passo" → `informacional`; "perto de mim|consulta|valor da sessão|vaga|emprego|curso" → `irrelevante`/paciente; "sistema|software|app|plataforma|programa" + ofício → `categoria`/`solucao`. O que sobra fica "sem intenção" para a IA (fase B).

**Prioridade** (coluna calculada, pesos editáveis): peso da intenção × log(volume) ÷ CPC; sem volume, usa o sinal de autocomplete. Serve para ordenar, não para decidir.

### 1.4 Layout da tela de palavras (passo 2)
- **Esquerda (filtros, 240 px):** busca; intenção (multi); público; origem; status (nova/aprovada/descartada); grupo (inclui "sem grupo"); volume mínimo; "com métrica / sem métrica"; "só de concorrente X".
- **Centro (tabela):** colunas `☐ · Termo · Intenção (chip editável) · Público · Volume (número ou faixa + fonte) · Tendência (sparkline) · CPC (R$ min–máx) · Concorrência · Origem · Grupo · Status`. Ordenar por qualquer coluna (padrão: prioridade). Linha clicável abre a gaveta. Tabela simples com componentes shadcn (sem biblioteca nova); até ~2 mil linhas sem virtualização.
- **Direita (gaveta do termo):** origens do termo (de qual semente/concorrente veio), métricas com fonte, variações próximas (singular/plural, com/sem acento: dedupe por texto normalizado), anúncios de concorrente que usam o termo (037/035), nota, histórico.
- **Barra de ações em massa** (aparece com seleção): aprovar · descartar · **descartar e virar negativa** · mover para grupo · mudar intenção/público · "buscar métrica" (fase C) · "classificar com IA" (fase B) · copiar termos.
- **Rodapé fixo:** nº aprovadas, volume somado (só de métricas da mesma fonte), custo mensal estimado das aprovadas.
- Botões de topo: `+ Sementes`, `Expandir (autocomplete)`, `Importar CSV`, `Pedir para a IA` (B), `Atualizar métricas` (C).

### 1.5 Grupos e campanhas sugeridos
- Regra de agrupamento (fase A, sem IA): intenção + palavra-núcleo comum; limite 5–20 palavras por grupo; grupos com 1 palavra viram "SKAG opcional" só se o Oliver marcar.
- **Campanhas do Google sugeridas** (cada uma com orçamento próprio, porque a intenção tem custo e valor diferentes): 1) *Categoria e solução* (+ comparação, preço); 2) *Problema* (menor prioridade, mais barata de testar); 3) *Concorrentes* (exata/frase, **sem o nome do concorrente no texto do anúncio**: marca de terceiros em texto pode ser reprovada, conferir na política atual); 4) *Marca Kzloo* (exata, protege o nome quando houver busca). Conta nova com verba pequena: começar só com a 1 e a 3.
- Regras de qualidade mostradas como avisos: grupo com intenções misturadas; palavra repetida em dois grupos (canibalização); grupo sem anúncio; grupo sem URL final.

### 1.6 Editor de RSA (passo 4)
- Lista de **15 títulos** e **4 descrições**, cada linha com contador `n/30` e `n/90` (verde ≤ limite, vermelho acima, bloqueia exportar), 2 campos de caminho `n/15`, URL final, UTM automático (`utm_source=google&utm_medium=cpc&utm_campaign=<AAAA-MM>-<plano>&utm_content=<grupo>&utm_term={keyword}`; minúsculas e hífens como na skill `ads-meta`).
- **Fixar**: seletor por linha (nenhum / posição 1, 2, 3), com aviso "reduz combinações".
- **Prévia** do anúncio (simulação de resultado de pesquisa) com 3 combinações aleatórias. Regras locais (avisos, não bloqueios): menos de 3 títulos ou 2 descrições; duplicata exata; nenhum título contém a palavra-núcleo do grupo; título com nome de concorrente; `!` em título e CAPS excessivo (confirmar na política vigente); promessa sem lastro (número, prazo, depoimento) → checar `COPY.md`; **nichos regulados**: o Google restringe publicidade de saúde, e as regras de publicidade do CFP estão em aberto (T-0004): anúncios marcados "não subir até validar" enquanto a pendência existir, como a skill `ads-meta` já exige.
- **Indicador local de variedade** (0–100: cobertura de intenções, diversidade de começo de frase, presença de CTA e de benefício). **Não é a Ad Strength do Google**, que só aparece na conta; o rótulo diz isso.
- Recomendação oficial refletida: 2 RSAs por grupo (botão "duplicar com outro ângulo").
- **Recursos** (sitelinks, frases de destaque, snippets estruturados, ligação) entram na fase H; os limites de caracteres deles **não foram verificados** em página oficial (ver "Não verificado").

### 1.7 Negativas
- Três níveis: **lista compartilhada** (ex.: "paciente e emprego"), campanha, grupo. Tipo de correspondência por negativa (ampla/frase/exata); negativa de correspondência ampla **não** expande para sinônimos (comportamento do Google, confirmar ao testar).
- **Lista-base da Kzloo** criada pela IA e aprovada pelo Oliver: busca de paciente ("consulta", "valor da sessão", "perto de mim", "terapeuta online para mim"), emprego/curso/faculdade, grátis (conforme a oferta), concorrentes (nas campanhas que não são a de concorrentes).
- Cada negativa guarda `motivo` e `origem` (descarte, lista-base, relatório de termos de pesquisa). Fase G importa o relatório real e propõe negativas.

### 1.8 Orçamento estimado
- **Premissas** (painel visível, tudo editável e rotulado hipótese até haver dado): participação nas impressões (quanto da demanda de busca o anúncio captura), CTR por intenção, taxa de clique→pedido de acesso, CPC (usa o da fonte; se faltar, o Oliver informa), orçamento diário por campanha.
- Conta por grupo: `impressões ≈ Σ volume × participação`; `cliques = impressões × CTR` (limitado pelo orçamento ÷ CPC); `custo = cliques × CPC`; `resultados = cliques × taxa`; `CPA = custo ÷ resultados`. Mostra também "com esse orçamento você cobre X% da demanda do grupo". Palavra sem volume ou CPC entra como **"sem dado"** e fica fora da soma (a tela diz quantas ficaram de fora). Nenhum padrão vira número do plano sem o Oliver confirmar.
- O que é "resultado" e o CPA alvo dependem da oferta (pergunta 5).

### 1.9 Exportar para o Google Ads Editor
Botão gera `exports/google-ads-editor-<AAAA-MM-DD>.csv` (fora do git). Formato (página oficial de importação): **uma linha por entidade** (campanha, grupo, palavra, negativa, anúncio), cabeçalho em inglês (maiúscula e espaço não importam), células com vários valores separadas por `;`, texto de anúncio com a coluna de palavra em branco. Colunas confirmadas na página: `Campaign`, `Campaign type`, `Daily budget`, `Campaign status`, `Networks`, `Language`, `Ad group`, `Ad group status`, `Max CPC`, `Keyword`, `Criterion Type`/`Match type`, `Status`, `Headline 1..15` (+ `Headline N position` para fixar), `Description 1..` (+ position). Negativas: `Type` = `Negative` (grupo) ou `Campaign negative` (campanha).
- **Codificação:** a ajuda manda salvar como **Unicode Text** no Windows. O exportador oferece UTF-16 LE com BOM e tabulação (padrão) e CSV UTF-8 com BOM (alternativa); testar qual o Editor do Oliver aceita.
- **Antes de implementar o exportador**: exportar do Editor um RSA de exemplo e copiar os cabeçalhos reais de URL final, caminhos (`Path 1/2`) e tipo de anúncio, que **a pesquisa não conseguiu confirmar**. O teste do exportador compara com esse arquivo de referência (fixture).
- Checagem antes de exportar: contadores dentro do limite, todo grupo com ≥ 1 RSA e ≥ 1 palavra, campanha com orçamento, sem palavra duplicada entre grupos, aviso do CFP/T-0004. Tudo sai com `status = Paused` (nada vai ao ar sem o Oliver ativar no Editor).

### 1.10 Papel da IA em cada passo e custo
A IA **propõe**, o Oliver **aprova**; nada da IA sobrescreve o que o Oliver escreveu. Execução padrão = skill nova `google-ads` (agente `estrategista`; `roteirista` para o texto do RSA) por **pedido** (como `pedido.json` da análise de concorrentes) e subagentes Sonnet, sem chave de API; botões instantâneos por API do Claude são opcionais (pergunta 3). Preços de lista que conheço (**conferir antes de orçar**): Haiku ~US$ 1/5 por milhão de tokens (entrada/saída), Sonnet ~US$ 3/15.

| passo | o que a IA faz | entrada / saída | modelo |
|---|---|---|---|
| Expandir | de cada semente, ~60 termos a partir de `AUDIENCE.md`/`COPY.md`/autocomplete já puxado | 10 sementes × 3,5 mil / 2 mil = 35 mil / 20 mil | Haiku |
| Classificar | intenção + público só do que as regras não resolveram (~40%) | 5 mil / 3 mil | Haiku |
| Agrupar | clusters e nome dos grupos, avisos de canibalização | 6 mil / 4 mil | Sonnet |
| RSA | 15 títulos + 4 descrições por grupo, 2 ângulos, respeitando `VOICE.md`/`BRAND.md`/`COPY.md` e as regras da seção 1.6 | 8 grupos × 2 × 3,5 mil / 1,5 mil = 56 mil / 24 mil | Sonnet |
| Negativas | lista-base e sugestão a partir dos descartados | 4 mil / 2 mil | Sonnet |
| **Plano completo** | | **~106 mil / ~55 mil** | **~US$ 0,8** (mistura; ~US$ 0,4 tudo Haiku, ~US$ 1,1 tudo Sonnet) |

Refazer só um grupo custa centavos. A IA não consulta volume nem CPC; ela lê os que já estão no banco. Fase B grava o custo de cada rodada no arquivo.

---

## 2. Meta / TikTok (quadro de funil)

### 2.1 Estrutura das plataformas que o quadro representa
(Fontes de blog e página de ajuda do TikTok; a ajuda da Meta não abriu. Conferir no Gerenciador antes de fixar listas de opções.)
- **Meta:** campanha (**objetivo ODAX**: Reconhecimento, Tráfego, Engajamento, Cadastros/Leads, Promoção de app, Vendas; orçamento no nível da campanha com Advantage+ ou no conjunto) → **conjunto** (público, local, posicionamentos Advantage+ ou manuais, local da conversão, evento de otimização, orçamento e período) → **anúncio** (mídia, texto principal, título, descrição, botão, destino, UTM). A skill `ads-meta` já fixa o padrão da casa: 1 campanha por objetivo, público amplo com Advantage+, 6+ anúncios no conjunto, evento com ~50 resultados/semana.
- **TikTok:** campanha (tipo de configuração **Manual**, **Search** (anúncios por palavra-chave na busca do TikTok) ou **Smart+**; objetivo em 3 categorias: **Reconhecimento**, **Consideração** (tráfego, visualizações, engajamento) e **Conversão**) → **grupo de anúncios** (público, lance, posicionamento, orçamento e período) → **anúncio**. Smart+ automatiza público, criativo e lance.
- No quadro os dois usam os mesmos nós; o campo `plataforma` troca os rótulos e as opções (ex.: "conjunto" ↔ "grupo de anúncios").

### 2.2 Nós (tipos)
| tipo | o que representa | campos principais |
|---|---|---|
| **campanha** | campanha Meta ou TikTok | plataforma, nome, objetivo (lista da plataforma), tipo de orçamento (campanha/conjunto), orçamento diário, TikTok: Manual/Search/Smart+, status |
| **conjunto** | conjunto (Meta) / grupo de anúncios (TikTok) = o **público** | temperatura (frio/morno/quente), público (aberto · interesse · semelhante · personalizado · lista) + descrição, local, idade, posicionamentos (Advantage+/manual), evento de otimização, orçamento, exclusões |
| **anúncio** | criativo | formato, ângulo, gancho, texto principal, título, descrição, botão, briefing do criativo, peça ligada (`contents/<peça>`), referências (anúncio de concorrente `meta:123`, ideia `I-0012`), UTM de conteúdo |
| **destino** | LP/site/WhatsApp/formulário/perfil | tipo, URL, promessa da página (a promessa do anúncio deve bater, regra do QA da skill) |
| **evento** | conversão ou marco | nome (ex.: pedido de acesso, acesso aprovado, pagamento), tipo (evento do pixel ou marco manual), CPA alvo |
| **audiencia** | público personalizado que o funil **forma** (o elo do remarketing) | fonte (vídeo, perfil, site, formulário, lista, clientes), regra ("assistiu 50% do vídeo"), janela em dias, tamanho estimado |
| **nota** | anotação livre (post-it) | texto, cor |
| **faixa** | raia/grupo visual (ex.: "Topo", "Meio", "Fundo") que contém outros nós | título, cor |

O pedido do Oliver listava seis (campanha, conjunto/público, anúncio/criativo, LP/destino, evento/conversão, nota). Acrescentei **audiencia** porque é ela que liga uma etapa à outra (sem ela, "engajou 50% do vídeo → remarketing" não tem onde morar) e **faixa** só para organizar visualmente.

### 2.3 Arestas (fluxo do público)
| tipo | de → para | exemplo |
|---|---|---|
| `hierarquia` | campanha → conjunto → anúncio | estrutura da conta (traço fino, cinza) |
| `clique` | anúncio → destino | clicou e foi para a LP |
| `conversao` | destino → evento | LP → pedido de acesso |
| `alimenta` | anúncio/destino/evento → audiencia | "assistiu 50% do vídeo 30 d" |
| `segmenta` | audiencia → conjunto | quem engajou vira público do conjunto morno |
| `exclui` | audiencia → conjunto | tracejada vermelha: quem já pediu acesso não vê a oferta fria |
| `sequencia` | qualquer → qualquer | ordem/ideia sem regra de plataforma |
Cada aresta tem `rotulo` e `taxa` opcional (0–1, hipótese) que alimenta a simulação (2.9). Regras de ligação validadas ao soltar a seta (ex.: `anuncio → destino` sim, `evento → anuncio` não), com aviso claro em vez de erro mudo.

### 2.4 Moldes de funil (JSON em `library/moldes-funil/`, global, no git)
Aplicar molde insere os nós no centro da vista, com ids novos, e deixa os textos como `[a preencher]`.
1. **Teste de criativos amplo** (padrão da `ads-meta`): 1 campanha → 1 conjunto aberto Advantage+ → 6 anúncios (3 ângulos × 2 formatos) → LP → pedido de acesso.
2. **Frio → morno → quente:** campanha de vídeo/tráfego (frio, conteúdo e dor) → audiências "assistiu 50% 30 d" e "engajou no perfil 90 d" → conjunto morno (demonstração e prova) → audiência "visitou a LP e não pediu acesso" → conjunto quente (oferta/depoimento real) → evento; exclusão de quem já pediu.
3. **Lançamento:** aquecimento (conteúdo) → captação (formulário/WhatsApp, lista de espera) → abertura (oferta) → últimos dias (remarketing da lista e da LP). Adaptar à regra atual da Kzloo (acesso com aprovação manual, sem trial universal, `BUSINESS.md`).
4. **Acesso/trial self-serve com remarketing:** inspirado na estrutura que a 037 achou na Sintropia (prospecção ampla para o teste grátis + remarketing de engajamento 365 d com `retarget`). Só vira recomendação para a Kzloo se o Oliver quiser; serve de comparação.
5. **TikTok Smart+ / Spark Ads:** campanha Smart+ com criativos próprios e Spark Ads (post orgânico impulsionado) → LP; variante com campanha Search por palavras.
Molde novo: o Oliver seleciona um trecho do quadro → "Salvar como molde".

### 2.5 Tela e painel de edição
- **Barra superior:** adicionar nó (menu), molde, auto-organizar, ajustar à tela, desfazer/refazer, alternar Meta/TikTok/ambos, **Salvar versão**, exportar (JSON, PNG), liga/desliga **Simulação**.
- **Esquerda (abas):** *Nós* (arrastar para o quadro) · *Referências* (salvos do Oliver da 037 e ideias de anúncio; arrastar para o quadro) · *Peças* (itens de `contents/` com imagem/vídeo pronto).
- **Centro:** quadro infinito, minimapa, grade com encaixe, atalhos (Del, Ctrl+Z/Y, Ctrl+D duplica, Ctrl+C/V). Cor da borda pela temperatura (frio/morno/quente) e selo de status (ideia → planejado → em produção → pronto → no ar → pausado). O nó mostra só o resumo (nome, objetivo, 1 linha); **editar é no painel**.
- **Direita (painel do nó selecionado):** formulário do tipo (campos da tabela 2.2) em shadcn, com validação (ex.: título ≤ 40 e descrição ≤ 30 no anúncio Meta, os limites da skill), contadores, seção *Referências* (anúncios/ideias ligados, com miniatura), seção *Tarefa* (2.8), seção *IA* (2.7), *Notas*. Alterar o painel grava no quadro com salvamento automático.

### 2.6 Arrastar referências (037) para dentro do quadro
- Arrastar um **anúncio salvo de concorrente** (chave `meta:123`, e depois `google:...`) para o vazio cria um nó **anúncio** com `ref`, formato, gancho/ângulo/funil que a 037 já classificou e a nota do Oliver como briefing inicial; para cima de um nó existente, só **anexa a referência**. Usa o `frozen` da 037, então funciona mesmo se o anúncio saiu do ar.
- Arrastar uma **ideia de anúncio** (`I-NNNN` com tag `anuncio`) cria o nó com a hipótese ("copiar o ângulo X para o funil de fundo") e liga `ideaId`.
- **"Funil do concorrente como molde de comparação":** a partir da ficha do concorrente (UTM + mix topo/meio/fundo da 037) o app gera um quadro **somente leitura** ao lado do nosso.
- O texto do concorrente **não** é copiado para o campo de texto: a referência fica como cartão ao lado; o mecanismo se copia, a frase não (regra da 037).

### 2.7 Gerar texto e briefing pela skill `ads-meta` a partir de um nó
- Botão **"Gerar anúncios"** num nó *anúncio* (ou em um *conjunto*, para um lote de 6) cria um **pedido** (arquivo `pedidos/<nó>.json` ao lado do funil: id do nó, objetivo da campanha, público, destino, evento, referências) e uma tarefa para `agent:roteirista` com a skill `ads-meta` (Modo A). A skill lê `funil.json` (nó + pais + audiência), `COPY/AUDIENCE/VOICE`, `BRAND.md` (proibições), `LOG_ANGULOS.md` e as referências da 037; **grava de volta nos campos do nó** pelo CLI `tools/campanhas.mjs set-node` (mesmo schema Zod, mesma validação do app) e registra os ângulos em `LOG_ANGULOS.md` como `em teste`.
- O briefing de criativo (estático 4:5, carrossel, vídeo motion 9:16) já vai no formato da skill; o botão seguinte do nó chama `carousel`/`video` (cria tarefa para `designer`/`editor-de-video`) e guarda a pasta da peça em `pecaId`.
- **Mudança necessária na skill `ads-meta`** (fase E): novo bloco "A partir de um nó do funil" no início do Modo A + aceitar `funil.json` como entrada. `ads.md` passa a ser gerado do quadro (cabeçalho `<!-- gerado de funil.json -->`); edição à mão desse arquivo é perdida, e o app avisa.
- Custo por lote de 6 anúncios (3 ângulos × 2 formatos): ~3 mil / 2,5 mil tokens por ângulo → ~US$ 0,05 por ângulo em Sonnet, ~US$ 0,3 o lote com briefings.

### 2.8 Nó vira tarefa no quadro do projeto
- Botão **"Criar tarefa"** no painel: cria `companies/<slug>/board/T-NNNN-<slug>.md` (rota existente do quadro) com título pelo tipo do nó ("Produzir anúncio: dor-estatico-v1"), `board: conteudo` (criativo e peça) ou `vendas` (campanha, LP, evento), `assignee` à escolha (oliver / ai / agent:…), `links: [campaigns/<plano>/funil.json]`, corpo preenchido com o resumo do nó e o checklist da produção. O nó guarda `tarefa: T-NNNN` e **mostra o estado da tarefa** (backlog/doing/review/done) como selo, só leitura; ao concluir a tarefa, o nó pode virar `pronto` (o Oliver confirma).
- "Criar tarefas dos nós selecionados" em lote (uma por anúncio sem tarefa).

### 2.9 Versões do plano e simulação
- **Versões:** `Salvar versão` (com rótulo) copia o quadro para `versoes/funil-<AAAA-MM-DDTHH-mm>-<rotulo>.json` (conteúdo completo + `auto: false`). **Versão automática** (`auto: true`, máx. 20, a mais antiga cai) antes de: restaurar uma versão, aplicar molde, qualquer edição vinda de agente/CLI. Restaurar = abrir a versão (a atual vira versão automática). **Comparar** mostra lista de nós/arestas adicionados, removidos e alterados (por id), sem diff visual no início.
- **Simulação** (fase F): liga uma camada sobre o quadro com as premissas por conjunto (orçamento, CPM, CTR, taxa de conversão do destino) e as `taxa` das arestas; mostra por nó impressões → cliques → eventos e custo por evento, como a camada "Forecast" de ferramentas de funil. Tudo rotulado hipótese; depois da campanha rodar, o CSV do Gerenciador (skill `ads-meta`, Modo B) pode trocar as hipóteses por números reais.

---

## 3. Modelo de dados e arquivos

### 3.1 Onde gravar
```
companies/<slug>/campaigns/
  LOG_ANGULOS.md                      (existe; a skill ads-meta continua gravando)
  palavras.json                       banco de palavras da empresa (compartilhado entre planos; no git: dados pagos custaram dinheiro)
  negativas-base.json                 listas de negativas reutilizáveis
  <AAAA-MM-DD>-<plano>/
    campanha.json                     ficha do plano (nome, canais, objetivo, status, orçamento, tarefa) — criada pelo app; pastas antigas sem ele aparecem na lista só com os .md
    google-ads.json                   plano de Google Ads (campanhas do Google → grupos → palavras → RSA)
    funil.json                        quadro Meta/TikTok (nós + arestas)
    versoes/                          google-ads-*.json e funil-*.json (histórico)        — no git
    pedidos/                          pedidos para a IA (nó ou etapa) e respostas        — no git
    exports/                          CSV do Ads Editor, PNG do quadro (regeneráveis)    — FORA do git
    ads.md · plano.md · carta.md · lp.md   (textos; ads.md vira exportação de funil.json se ele existir)
library/moldes-funil/<id>.json        moldes globais (no git)
```
**Git:** vai tudo menos `exports/` (e qualquer vídeo/imagem pesada; `.gitignore` ganha `companies/*/campaigns/*/exports/`). O banco de palavras vai porque métrica paga não se refaz de graça. Mídia de peça continua em `contents/` (já regra do hub).
Caminhos novos em `schema/paths.ts` (`P.campanhas`, `P.campanha`, `P.palavras`...) e lógica em `core/campanhas.ts` (arquivo novo, para não inflar `store.ts`), exposta por rotas finas em `app/server/api.ts`, como no resto do app.

### 3.2 Schemas Zod propostos (esboço; vão em `schema/campanha.ts`, `schema/google-ads.ts`, `schema/funil.ts`)
Todo arquivo tem `schema: 1` e `rev` (inteiro, incrementa a cada gravação; gravação com `rev` desatualizado é recusada com aviso "outra sessão mexeu", porque agentes e CLI também editam).

```ts
// campanha.json
Canal = enum['google-pesquisa','meta','tiktok']
Campanha = { schema:1, nome, canais: Canal[], objetivo: enum['cadastro','lead','mensagem','trafego','reconhecimento'],
  status: enum['planejando','pronta','no-ar','pausada','encerrada'], orcamentoMensal?: number /*R$*/,
  inicio?: IsoDate, fim?: IsoDate, destino?: Url, utmCampanha: Slug, tarefa?: 'T-NNNN', notas?: string,
  criada: IsoDate, atualizada: IsoDateTime }

// palavras.json (banco)
Intencao = enum['solucao','categoria','problema','marca-concorrente','comparacao','preco','informacional','marca-propria','irrelevante']
Publico = enum['terapeuta','paciente','misto','indefinido']
Rotulo<T> = { valor:T, origem: enum['regra','ia','oliver'], confianca?: 0..1, motivo?: string }
Metrica = { fonte: enum['dataforseo','keyword-planner','manual'], obtidoEm: IsoDate,
  volume?: int, volumeFaixa?: {min:int,max:int}, mensal?: int[12], cpcMin?: number, cpcMax?: number,
  concorrencia?: enum['baixa','media','alta'] }
Palavra = { id /*hash do texto normalizado*/, termo, origens: {tipo: enum['semente','autocomplete','pergunta','concorrente','ia','importada'], detalhe?:string}[],
  intencao?: Rotulo<Intencao>, publico?: Rotulo<Publico>, sinalDemanda?: number /*autocomplete, sem unidade*/,
  metrica?: Metrica, status: enum['nova','aprovada','descartada'], nota?: string, criada: IsoDate }
BancoPalavras = { schema:1, rev, sementes: {termo, tipo?: enum['manual','marca','dor']}[], palavras: Palavra[], custos?: {data, fonte, usd}[] }

// google-ads.json
Correspondencia = enum['ampla','frase','exata']
Rsa = { id, titulos: {texto: string(≤30), fixar?: 1|2|3}[] (3..15), descricoes: {texto: string(≤90), fixar?: 1|2}[] (2..4),
  caminho1?: string(≤15), caminho2?: string(≤15), urlFinal: Url, estado: enum['rascunho','revisado'], origem: enum['ia','oliver'], angulo?: string }
GrupoAds = { id, nome, intencao: Intencao, palavras: {palavraId, termo, correspondencia, cpcMax?: number}[],
  negativas: Negativa[], anuncios: Rsa[] }
Negativa = { termo, correspondencia, motivo?, origem?: enum['descarte','lista-base','relatorio','ia'] }
CampanhaGoogle = { id, nome, tipo: 'pesquisa', orcamentoDiario?: number, lance: enum['cliques-max','cpc-manual','conversoes-max'],
  cpcTeto?: number, grupos: GrupoAds[], negativas: Negativa[], listasNegativas: string[] /*ids*/ }
GoogleAds = { schema:1, rev, premissas: { participacaoImpressoes?: number, ctrPorIntencao?: Record<Intencao,number>, taxaConversao?: number, cpcPadrao?: number },
  campanhas: CampanhaGoogle[], recursos?: {...} /*fase H*/, atualizado: IsoDateTime }

// funil.json  (formato = React Flow: id/type/position/data/parentId)
Plataforma = enum['meta','tiktok']
No = discriminatedUnion('tipo', [Campanha, Conjunto, Anuncio, Destino, Evento, Audiencia, Nota, Faixa]) cada um com
  { id, posicao:{x,y}, tamanho?:{w,h}, parentId?, rotulo?, status: enum['ideia','planejado','em-producao','pronto','no-ar','pausado'], tarefa?: 'T-NNNN', dados:{...campos da tabela 2.2} }
Aresta = { id, de, para, tipo: enum['hierarquia','clique','conversao','alimenta','segmenta','exclui','sequencia'], rotulo?, taxa?: 0..1 }
Funil = { schema:1, rev, plataformas: Plataforma[], viewport?:{x,y,zoom}, premissas?: {...}, nos: No[], arestas: Aresta[], atualizado: IsoDateTime }

// versoes/*.json
Versao = { schema:1, de: 'funil'|'google-ads', rotulo?, auto: boolean, criadoEm: IsoDateTime, quem: 'oliver'|'ia'|'cli', conteudo: Funil|GoogleAds }
```
Mapeamento para React Flow (`type`, `source`, `target`, `data`) fica numa função pura em `core/campanhas.ts`, testada. `npm run validate` passa a cobrir os arquivos novos. Alterar à mão exige `npm run validate`.

### 3.3 Relação com o que já existe
- `ads.md` (skill `ads-meta`): hoje é a saída em texto. Com `funil.json` presente, é **gerado** do quadro (cabeçalho marcado). Sem `funil.json`, a skill funciona como hoje. A skill passa a ler o quadro quando existir.
- `plano.md`: texto livre do plano (estratégia, calendário, verba). Fica manual; a tela de Resumo do plano mostra ele (editor Markdown já existente) ao lado dos números.
- `LOG_ANGULOS.md`: continua sendo a memória de ângulos; o nó mostra o status do ângulo lido de lá.
- Ideias (`I-NNNN`), salvos de concorrente (`marks.json`, 037) e quadro de tarefas: só **referenciados por id**, nunca copiados.
- `tags.yml`: vocabulário de ângulo/gancho da 037 é reaproveitado nos campos de ângulo e gancho do nó.

---

## 4. Navegação no app
Registro em `app/src/pages/index.ts` (uma linha, no padrão de Concorrentes), ícone Lucide `Megaphone`, `sidebar: 'recolhida'` (tela de trabalho):
```ts
{ path: 'campanhas', label: 'Campanhas', icon: Megaphone, sidebar: 'recolhida', ...page(() => import('./campanhas/Lista')), children: [
  { path: 'palavras', ...page(() => import('./campanhas/BancoPalavras')) },      // fixas antes do :id
  { path: 'moldes',   ...page(() => import('./campanhas/Moldes')) },
  { path: ':id',        ...page(() => import('./campanhas/Resumo')) },
  { path: ':id/google', ...page(() => import('./campanhas/GoogleAds')) },
  { path: ':id/funil',  ...page(() => import('./campanhas/Funil')) },
] },
```
- **`ContextSidebar`** (storageKey `campanhas`, título "Campanhas", ação `+ Novo plano`, busca): seção *Planos* (cada plano com ícones dos canais à direita e selo de status) · seção *Pesquisa* (Banco de palavras · Listas de negativas) · seção *Biblioteca* (Moldes de funil). Item ativo conforme a rota, como em Concorrentes.
- **Abas no topo da área** (padrão das abas de Concorrentes): **Lista** (todos os planos, cards com canais, orçamento, status, tarefa, data) · **Google Ads** · **Meta/TikTok** — as duas últimas atuam no plano selecionado na barra (sem plano selecionado, mostram a lista para escolher/criar).
- **Resumo do plano** (`:id`): ficha (`campanha.json`), `plano.md`, números (palavras aprovadas, orçamento estimado, nº de nós por tipo, anúncios por status), pendências e links das tarefas.
- Telas pesadas (GoogleAds, Funil) são pedaços separados do bundle (`React.lazy`, como as outras): o React Flow só carrega ao abrir o Funil.

## 5. Biblioteca do canvas: **React Flow (`@xyflow/react`)**
| opção | licença | encaixe | veredito |
|---|---|---|---|
| **React Flow / xyflow** | **MIT** (rodapé do site e repositório) | feito para **grafos com nós = componentes React**: nó de formulário, handles, minimapa, controles, seleção, `toObject`/`ReactFlowJsonObject` para salvar e restaurar JSON, sub-fluxos (faixa contendo nós). Não tem auto-layout próprio: a doc recomenda dagre (simples, árvore) ou ELK (mais completo) | **escolhida** |
| tldraw | SDK com licença própria: uso em produção exige **chave de licença** (teste de 100 dias; licença comercial por contato; "hobby" com marca d'água) | quadro branco de formas livres; personalizar vira criar "shapes" e ferramentas | descartada: custo/licença e modelo errado para nós com formulário |
| Excalidraw | MIT | quadro desenhado à mão, não tem modelo de nó/aresta tipado nem painel de formulário por nó | descartada |

Motivo: o quadro **é um grafo tipado** (campanha → conjunto → anúncio → destino → evento → audiência), com validação de ligações, edição por formulário e dados estruturados que a IA e o CLI leem. React Flow entrega isso com licença livre e salva em JSON que o Zod valida.
**Dependências novas (fase D):** `@xyflow/react` e `@dagrejs/dagre` (auto-organizar; ELK só se o dagre não bastar). Na fase F, opcional `html-to-image` (exportar PNG do quadro). Sem biblioteca de tabela (tabela simples shadcn), sem estado global novo (React Query já existe), desfazer/refazer por pilha de snapshots do próprio quadro (o React Flow não traz). Confirmar na instalação: compatibilidade do `@xyflow/react` com React 19 e o tamanho do chunk (fica em pedaço próprio, só carrega no Funil). Peso de dagre e chunk **não medidos**.

---

## 6. Fases (pequenas, testáveis)

| fase | entrega | critério de pronto |
|---|---|---|
| **A. Google Ads sem API paga** | (1) schemas `campanha`/`google-ads`/palavras + `paths` + `core/campanhas.ts` + rotas + `validate`; (2) rota **Campanhas** (lista, criar plano, sidebar); (3) **banco de palavras**: sementes (incluindo marcas dos concorrentes cadastrados), **autocomplete** grátis, **importar CSV** (Keyword Planner/qualquer com coluna `Keyword`), **regras de intenção/público**, tabela com filtros e ações em massa; (4) **grupos** (manual + sugestão por regra), **RSA** com contadores, fixação, prévia e avisos, **negativas** com lista-base, **orçamento** com premissas; (5) **exportar CSV do Ads Editor** | (a) `npm run typecheck` e `validate` limpos; (b) teste do exportador compara com o CSV de referência exportado do Editor real (fixture) e passa; (c) **o Oliver importa o CSV de um plano de teste no Google Ads Editor sem erro** (campanhas, grupos, palavras, negativas e RSA pausados); (d) 1 semente → ≥ 100 termos únicos do autocomplete, deduplicados; (e) contadores bloqueiam 31/91/16 caracteres; (f) nenhuma célula de volume/CPC preenchida sem fonte |
| **B. IA no Google Ads** | skill `google-ads` (agente `estrategista`/`roteirista`), botão **Pedir para a IA** (expandir, classificar, agrupar, RSA, negativas) por arquivo de pedido; custo gravado por rodada; IA corrige em vez de começar do zero (lê regras e banco) | rodar o fluxo no plano da Kzloo: ≥ 80% dos termos com intenção, grupos sem palavra repetida, RSA sem estourar limites, custo registrado < US$ 1,50; override do Oliver sobrevive a nova rodada |
| **C. Métricas pagas** (depende de 035 fase 3 e da decisão de orçamento) | DataForSEO (volume, CPC, mensal, relacionadas) com **teto mensal** no app → Configurações, cache no banco, atualização por seleção; mapeamento do CSV do Planner para o mesmo campo | teto respeitado (recusa chamada que passaria); termo já medido há < 30 dias não é pedido de novo; custo da rodada aparece antes de confirmar |
| **D. Quadro de funil base** | `schema/funil`, rotas, tela Funil com React Flow: 8 tipos de nó, 7 de aresta com validação, painel de edição por tipo, salvamento automático com `rev`, desfazer/refazer, auto-organizar (dagre), 3 moldes (1, 2 e 3 da seção 2.4), exportar/importar JSON | criar o "Frio → morno → quente" do molde, mover, editar, recarregar a página e voltar idêntico; ligação inválida é recusada com mensagem; arquivo passa no `validate`; chunk do Funil separado do bundle principal |
| **E. Integrações do quadro** (depende de 037 fase D/E) | arrastar **salvos** e **ideias** (037) para o quadro; **Gerar anúncios** via `ads-meta` (pedido + CLI `tools/campanhas.mjs`); **Criar tarefa** do nó com selo de estado; ajuste do texto da skill `ads-meta`; `ads.md` gerado | arrastar um salvo cria nó com a referência e a classificação; "Gerar anúncios" preenche os campos do nó sem quebrar o schema e registra ângulos no `LOG_ANGULOS.md`; tarefa criada aparece no quadro com `links` para o `funil.json` |
| **F. Versões, simulação e extras do quadro** | versões manuais e automáticas, restaurar, comparar; camada de simulação com premissas; exportar PNG; moldes 4 e 5 e "salvar como molde" | restaurar uma versão antiga e voltar à atual sem perda; edição de agente/CLI sempre cria versão automática; simulação não preenche nada sem premissa informada |
| **G. Loop pós-lançamento** | importar relatório de **termos de pesquisa** do Google Ads e CSV de resultados da Meta/TikTok → sugerir negativas, aposentar/promover palavras e anúncios (liga ao Modo B da `ads-meta`); comparar premissa × real | importar um relatório de teste gera negativas propostas com motivo; premissas do plano são substituídas pelo real só com aval |
| **H. Recursos do Google e TikTok específico** | sitelinks, frases de destaque, snippets estruturados (limites verificados antes na página oficial); campanha TikTok *Search* por palavra reutilizando o banco | limites conferidos em página oficial e anotados aqui; CSV com recursos importa no Editor |

Ordem: **A → B → C**; **D → E → F** pode andar em paralelo com B/C (independentes). A e D são as duas portas de entrada úteis sozinhas. G e H depois de haver campanha no ar.

---

## 7. Riscos e cuidados
- **Dado inventado:** o maior risco numa ferramenta de palavra-chave. Mitigação: sem fonte, sem número; métrica sempre com fonte e data; premissas rotuladas.
- **Autocomplete** usa endpoint não documentado: pode mudar ou limitar; fallback é colar/importar. Pausa entre chamadas, sem contornar bloqueio.
- **Keyword Planner** exige conta com cobrança configurada, mostra faixas sem gasto ativo e pode não devolver nada em categorias sensíveis (saúde); "sistema para psicólogo" é software B2B, mas termos de paciente podem cair nisso.
- **Políticas:** saúde regulada, marca de terceiros em texto de anúncio, regras de publicidade do CFP (T-0004). Anúncios saem `Paused` e com aviso até a pendência fechar.
- **Concorrência de edição** (app, agente, CLI): `rev` + versão automática antes de edição de agente.
- **Escopo:** é fácil virar clone do Gerenciador. O plano termina no CSV/briefing e na tarefa; não publica nada em conta alguma nem usa API de escrita do Google/Meta.
- **Texto do concorrente:** só referência, nunca copiado (herdado da 037).

## 8. O que a fase A **não** faz
Não chama API paga, não consulta conta Google Ads, não sobe nada no ar, não mede resultado, não gera texto por IA (isso é a fase B; na A o Oliver ou o `ads.md` preenchem o RSA à mão).

## 9. Não verificado (testar antes de construir)
- Cabeçalhos exatos do CSV do Editor para **RSA** (URL final, caminhos, tipo de anúncio) e a **codificação** aceita: exportar um exemplo do Editor primeiro.
- Limites de **sitelinks/destaques/snippets** (fase H).
- Regras atuais de Google sobre `!` em título, nome de concorrente em texto e saúde/CFP.
- Estrutura oficial da Meta (a página de ajuda não abriu; objetivos e Advantage+ vêm de blogs, inclusive com fontes discordando sobre o que mudou em 2026) e do TikTok além do básico (campanha → grupo → anúncio, tipos Manual/Search/Smart+).
- Preço por chamada do DataForSEO e se devolve palavras pagas de domínio pequeno (herdado da 035).
- Compatibilidade `@xyflow/react` × React 19, tamanho do chunk, peso do dagre.
- Preços de modelo da seção 1.10.

## 10. Referências
**Abri e li:**
- Google Ads, anúncios responsivos de pesquisa (limites, fixação, Ad Strength): https://support.google.com/google-ads/answer/7684791
- Google Ads, tipos de correspondência e negativas: https://support.google.com/google-ads/answer/7478529
- Google Ads Editor, colunas de CSV (campanha, grupo, palavra, negativa, títulos, descrições): https://support.google.com/google-ads/editor/answer/57747
- Google Ads Editor, preparar e importar CSV (uma entidade por linha, codificação): https://support.google.com/google-ads/editor/answer/56368
- Google Keyword Planner (o que mostra, forecast, exigência de conta e cobrança, categorias sensíveis): https://support.google.com/google-ads/answer/7337243
- Semrush Keyword Magic Tool (a página não lista CPC nem clusters; clusters ficam no Strategy Builder): https://www.semrush.com/features/keyword-magic-tool/
- Ahrefs Keywords Explorer (volume, dificuldade, potencial de tráfego, tópico-pai, intenção, clusters): https://ahrefs.com/keywords-explorer
- Funnelytics (canvas, nós, moldes, camadas Map/Forecast/Analytics, métricas por nó): https://www.funnelytics.io/
- React Flow, introdução (MIT, nós, salvar e restaurar, layouts): https://reactflow.dev/learn
- React Flow, layouts (dagre, d3-hierarchy, ELK, d3-force; sem layout próprio): https://reactflow.dev/learn/layouting/layouting
- tldraw, licença (produção exige chave; hobby com marca d'água): https://tldraw.dev/community/license

**Só vi em resultado de busca (tratar como blog/terceiro):**
- ODAX e Advantage+ (um blog replicado em vários países; fontes divergem sobre a mudança de 2026): https://influee.co/blog/meta-campaign-objectives · https://www.1clickreport.com/blog/meta-advantage-plus-campaign-setup-2026 · https://benly.ai/learn/meta-ads/advantage-plus-campaigns-guide
- TikTok Ads Manager (campanha → grupo → anúncio; Manual/Search/Smart+; Reconhecimento/Consideração/Conversão): https://ads.tiktok.com/help/article/campaign-set-up?lang=en · https://ads.tiktok.com/business/en-US/blog/how-to-get-started-with-tiktok-ads-manager-your-step-by-step-guide
- SKAG × grupos temáticos, broad + Smart Bidding, marca e concorrente: https://www.sitecentre.com.au/blog/stag-vs-skag-campaigns · https://www.webtonic.io/blog/single-keyword-ad-groups · https://benly.ai/learn/google-ads/google-ads-skags-vs-stags · https://benly.ai/learn/google-ads/google-ads-broad-match-2026 · https://www.tripledart.com/saas-ppc/google-ads-broad-match
- Comparativo React Flow × tldraw × Excalidraw (licença): https://www.pkgpulse.com/guides/excalidraw-vs-tldraw-vs-miro-sdk-collaborative-2026 · https://openalternative.co/compare/excalidraw/vs/tldraw

## 11. Perguntas para o Oliver (só as que mudam o desenho)
1. **Conta Google Ads:** você tem uma conta com cobrança configurada (necessária para o Keyword Planner) e o Google Ads Editor instalado? Sem conta, a fase A usa só autocomplete e volume colado à mão, e o teste de importação do CSV fica para quando houver Editor.
2. **Teto do DataForSEO:** aceita depositar o mínimo (~US$ 50, a confirmar) e qual teto mensal (sugestão US$ 5 a 10, como na 035)? Define se a fase C existe ou se ficamos no Planner + autocomplete.
3. **IA:** os botões "classificar/agrupar/gerar RSA" podem esperar alguns minutos (pedido para a skill, sem chave de API, custo dentro da assinatura), ou você quer resposta na hora por chave da API do Claude em Configurações (~US$ 0,8 por plano completo)?
4. **Concorrentes no Google:** quer lance em **marca de concorrente** (campanha própria, texto sem o nome deles) ou prefere só marcá-los como negativas e usar os nomes só para pesquisa?
5. **O que é um resultado:** hoje o clique termina em "pedir acesso" (aprovação manual, sem trial). É esse o evento e qual CPA alvo? Muda a conta do orçamento e o molde de funil (3 ou 4). Depende de `T-0002` (fechar oferta) e `T-0003` (links).
6. **Funil:** mesma dúvida da 037 (topo/meio/fundo pela temperatura do público ou pelo que o botão pede)? Proponho temperatura, e é como os nós `conjunto` e `audiencia` ficam desenhados.

## Log
- 2026-10-08 — registrada a pedido do Oliver. Desenho detalhado: um agente Sonnet com pesquisa na web, depois da 034 (matriz) e da 037 (anúncios).
- 2026-10-08 — **desenho completo** (este arquivo): Google Ads em 7 passos com fase A sem API paga; quadro de funil em React Flow (MIT) com 8 nós, 7 arestas, moldes, referências da 037, ponte com `ads-meta` e tarefas; modelo de dados e rota Campanhas; fases A–H. Pesquisa na web feita (seção 10; itens não verificados na seção 9). Nenhum código, dependência ou outro arquivo alterado além da linha 036 do BACKLOG. Sem commit. Aguardando respostas da seção 11 e aval da fase A.
