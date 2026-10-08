# 037 — Inteligência de anúncios dos concorrentes (salvos, notas, tags, funil, classificador)

**Status:** **fase A feita** (2026-10-08): histórico entre coletas em `core/store.ts` (`adsHistory`) + rota `GET /api/projects/:slug/competitors/:id/ads/history`. Próximo: fase B (classificador + gabarito), que precisa da pergunta 1 da seção 13 e do gabarito rotulado pelo Oliver.
**Depende de:** 031 (coletor Meta, fase D). **Alimenta:** 036 (planejamento de campanhas), skill `ads-meta`. **Pode receber:** Google Ads Transparency da 035 (mesmo modelo, ver seção 11).

## 1. Pedido do Oliver
Estudar as campanhas dos concorrentes: abrir o concorrente, puxar da Biblioteca de Anúncios da Meta os anúncios e as informações com a data, ordenados pelos que rodam há mais tempo. Salvar anúncios para ver depois, anotar, pôr tags (tipo de anúncio, tipo de campanha), registrar ideias de anúncio. Coletar se tem link (clicável), se é topo/meio/fundo de funil, se é oferta ou conteúdo etc. **"O ponto é não só puxar os anúncios, mas ter um algoritmo para nos ajudar a extrair as informações mais relevantes."**

## 2. O que já existe (031 fase D)
`tools/intel/ads.ts` coleta a página pública da Biblioteca (BR, só ativos, sem login) e grava `competitors/<id>/ads/<data>.json` imutável (schema `schema/ads.ts`): id, página, início, plataformas, texto, título, descrição, CTA, link, mídia (imagem/vídeo/carrossel + miniatura local), variações. A aba `Anuncios.tsx` mostra cards ordenados por dias no ar. **Não existe:** histórico entre coletas, classificação, salvar/nota/tag, ideia, linha do tempo.

Dados reais de hoje (1 rodada, 2026-10-08): 50 anúncios ativos em 6 de 11 concorrentes; 40 no ar há 30+ dias, 18 há 90+, 7 com até 7 dias; os mais velhos têm 349 e 347 dias (Psicoplanner, PsicoManager). 3 trazem `variations >= 2`, mas **14 de 50 repetem o mesmo texto+título de outro anúncio do mesmo concorrente** (Sintropia 6, PsicoManager 4, MaisTerapias 2, Psicoplanner 2): o `variations` da Meta subconta, então o agrupamento próprio vale mais. 5 anúncios vêm com texto de catálogo (`{{product.brand}}`), sem texto real. 5 (todos Sintropia) vêm sem link e sem botão (impulsionamento/conteúdo de parceria). 11 têm UTM, todos de 2 anunciantes (Sintropia: `paid-social-prospecting`/`retargeting`, `broad`/`retarget-engajamento-ig-365d`).

## 3. Pesquisa: o que as ferramentas profissionais fazem (e o que copiamos)
| ferramenta | o que faz | o que copiar |
|---|---|---|
| **Foreplay** | Discovery (busca em 100 mi+ anúncios, "Sort by Longest Running", filtro por nicho/formato/plataforma/status ativo), **Swipe File** para salvar de qualquer lugar, **Boards** estilo moodboard, tags, transcrição automática, análise de IA (inclusive emocional), Spyder (rastreia concorrentes e avisa de anúncios novos), mostra a página de destino | ordenar por tempo no ar como padrão; salvar + boards; transcrição; monitorar anúncio novo/saído; ver a LP junto |
| **Atria** | **tagging automático** de hook, persona, USP e formato; extrai hooks, personas e landing pages dos concorrentes; temas (unboxing, "nós vs eles", promoção) como filtro | tags automáticas de gancho/público/USP; filtro por tema |
| **Motion** | análise criativa por atributos (formato, ângulo, persona, hook), "Naming Conventions" e "Winning Combinations" (quais combinações de atributos performam). Não consegui abrir a página de AI Tagging; só o que a busca devolveu | analisar por **atributo do criativo**, não só por anúncio; cruzar atributos |
| **Segwise** (guia de taxonomia) | taxonomia fixa por anúncio: hook (pergunta, problema primeiro, afirmação ousada, estatística, depoimento), ângulo (valor, emoção, prova), oferta (tipo, profundidade, urgência), formato (tipo, proporção, duração, estilo), funil via estágio de consciência. Regra: **poucos tags obrigatórios (5–6), vocabulário fechado**, "conceito × variação" (rolar o desempenho para o conceito) | vocabulário fechado; separar **conceito** de **variação**; funil por consciência (problema/solução/produto) |
| **MagicBrief** | encerrou em 31/07/2026 (aviso na própria página) | nada |
| **AdSpy, BigSpy, Minea, PiPiAds** | bancos grandes, filtros de engajamento/país/idioma, preço US$ 9–149/mês; só encontrei comparativos de afiliados, **sem confirmar tags nem boards** | nada além de ordenar por veiculação; não pagar: nosso universo é 11 concorrentes |
| **Biblioteca de Anúncios da Meta** | pública: id, status, data de início, plataformas, texto, mídia, link/CTA, "várias versões". **Gasto, impressões, alcance e público só para anúncios políticos/de temas sociais** (e alcance por país/idade/gênero na UE/UK). Na API oficial (`archived-ad`) `ad_delivery_stop_time` existe, mas comercial no BR não entra na API; a página pública entra | **não há gasto nem alcance**: o sinal de vencedor é indireto (seção 7) |

Sinais de vencedor citados nas fontes (todos heurísticos de blog, não regra da Meta): tempo no ar (limiares citados: 25+ dias "provável lucro", 60+ "vale copiar"), cluster de variações parecidas = vencedor sendo escalado, rajada de anúncios novos = teste, anúncio que sumiu em ~3 dias = teste fracassado. **Longevidade não prova lucro** (pode ser barato ou institucional), por isso o app mostra "sinal", nunca "vencedor" como fato.

## 4. Modelo de dados
Regra: **imutável (coleta) / do Oliver / derivado**. O que é do Oliver nunca é sobrescrito por coleta nem por IA.

| camada | arquivo | quem escreve | no git |
|---|---|---|---|
| **Snapshot** (imutável) | `competitors/<id>/ads/<AAAA-MM-DDTHH-mm-ss>.json` (já existe; ganha só um campo opcional `source`, ver seção 11) | coletor | sim |
| **Histórico** (derivado, calculado ao ler) | não é arquivo: `core` percorre os snapshots e devolve por anúncio `{ primeiraVez, ultimaVez, coletas, diasNoAr, saiuDoAr, reapareceu }` | `core/store.ts` | — |
| **Regras** (derivado, grátis) | calculado ao ler com `classificarAnuncio()` (sem cache; é puro e rápido) | `tools/intel/ads-classify.ts` | — |
| **IA** (derivado, custa) | `competitors/<id>/ads/ia.json`: `{ schema, modelo, itens: { <adId>: { hash, geradoEm, angulo, gancho, promessa, funil?, tipo?, publico, transcricao?, ocr?, confianca } } }`. `hash` = texto+título+miniatura; muda o criativo, refaz | camada IA | sim (custou dinheiro; não refazer) |
| **Marcas do Oliver** | `competitors/<id>/ads/marks.json` | app | sim |
| **Coleções** | `companies/<slug>/intel/colecoes-anuncios.yml`: `{ colecoes: [{ id, nome, cor }] }` | app | sim |
| **Ideias de anúncio** | `companies/<slug>/ideas/I-NNNN-*.md` (modelo existente, com extensão pequena, seção 9) | app / skill | sim |
| **Vocabulário de tags** | `companies/<slug>/tags.yml`: `TagDef` ganha `group?: string` (opcional, compatível) | app | sim |

### `marks.json` (esboço do schema Zod, `schema/ads-marks.ts`)
```ts
AdMark = {
  saved: boolean, savedAt?: IsoDateTime, colecoes: string[],        // ids de colecoes-anuncios.yml
  note?: string,                                                     // markdown curto
  tags: Slug[],                                                      // livres, com grupo em tags.yml
  override?: { funil?, tipo?, objetivo?, angulo?, gancho?, oferta? },// correção manual: SEMPRE ganha de regra e IA
  ideaId?: 'I-NNNN',
  frozen?: Ad,        // cópia do anúncio no momento de salvar (a Biblioteca apaga o que sai do ar)
  frozenMedia?: string,// miniatura/vídeo já baixados em media/ads/ (não limpar)
  updatedAt: IsoDateTime
}
AdsMarks = { schema: 1, ads: Record<`${source}:${adId}`, AdMark> }
```
Ao salvar, o app copia o anúncio inteiro para `frozen`: se ele sair do ar, o salvo continua inteiro. Chave com `source:` (`meta:123`) para o Google Transparency entrar sem colisão.

### Resolução de um campo (ordem fixa)
`override do Oliver` > `IA com confiança >= 0,6` > `regras` > `indefinido`. A tela sempre mostra **de onde veio** (chip "você", "IA", "regra") e os motivos.

### Histórico entre coletas
Por anúncio, percorrendo todos os snapshots do concorrente em ordem:
- `primeiraVez` / `ultimaVez` = primeira e última coleta em que apareceu; `diasNoAr` = hoje − `startedAt` da Biblioteca (a data oficial, não a nossa).
- `saiuDoAr` = estava na coleta N−1 e **não está na N**, **desde que a coleta N tenha sido completa** (sem erro e `ads.length >= total`; o coletor limita a 30 por concorrente, então uma coleta truncada não prova saída). Guarda `saiuEm = data da coleta N` (precisão = intervalo entre coletas) e `duracaoFinal = saiuEm − startedAt`.
- `reapareceu` = mesmo criativo (hash de texto+título) volta com outro `id` depois de sumir. Sinal de sazonal ou de ressuscitado.
- `conceito` = agrupamento por texto+título normalizados dentro do concorrente (`contarIrmaos` do protótipo). `irmaos` = nº de anúncios ativos no conceito.
- O histórico só existe a partir da 2ª coleta; antes disso valem `startedAt` e `variations`.

## 5. Taxonomia (definições operacionais)
Vocabulário **fechado em código** para o que as regras conseguem decidir (funil, tipo, objetivo, formato, destino). **Aberto em `tags.yml` por grupo** para o que é de gosto do Oliver (ângulo, gancho, tipo de campanha). A IA só escolhe dentro do vocabulário; se nenhum serve, devolve `novo: "<sugestão>"` e o Oliver aceita ou não.

### 5.1 Etapa de funil (temperatura do público + o que o anúncio pede)
| valor | definição | sinais |
|---|---|---|
| **topo** | público frio. Apresenta problema, marca ou conteúdo; pede atenção, não decisão | CTA para o perfil; sem link e sem botão; UTM `prospecting/broad/frio`; tipo conteúdo/institucional |
| **meio** | quem já sabe que tem o problema. Apresenta solução, produto, prova; pede para conhecer | CTA "Saiba mais"/"Ver detalhes" para site ou LP; tipo demonstração/prova social/isca |
| **fundo** | pede a decisão: cadastrar, assinar, testar, falar com vendas. Inclui remarketing | destino planos/cadastro/WhatsApp; CTA Assinar/Cadastre-se/Obter oferta; oferta explícita; UTM `retarget` |

Ressalva importante: **SaaS com teste grátis costuma pôr público frio direto no cadastro** (Sintropia: `prospecting` + "Cadastre-se" + 15 dias grátis). Por isso funil = temperatura do público (UTM manda quando existe), e o que o anúncio pede fica em `objetivo`. Os dois podem divergir de propósito: "topo + cadastro".

### 5.2 Objetivo provável (o que o anúncio quer que a pessoa faça)
`trafego` (conhecer, clique em "Saiba mais" para site/LP) · `cadastro` (criar conta/teste/assinar; destino planos/cadastro ou CTA de conversão) · `mensagem-whatsapp` (link `wa.me`/`api.whatsapp.com` ou CTA "Enviar mensagem") · `lead` (formulário, isca, e-mail/telefone antes da venda) · `instalacao-app` (loja de apps) · `engajamento` (perfil, seguir, sem link: alcance/vídeo). O objetivo real da campanha no Gerenciador **não é público**; é palpite pelo botão e pelo destino.

### 5.3 Tipo de anúncio (o que ele é)
| valor | definição operacional |
|---|---|
| **oferta** | traz condição explícita: preço, desconto, teste grátis, plano gratuito, cupom, prazo, "sem cartão", ou CTA "Obter oferta"/"Assinar" |
| **conteudo** | educa, provoca ou entretém sem vender: pergunta, dica, humor, lista "Como…?", CTA só para o perfil |
| **prova-social** | alguém fala do produto: depoimento, criador (`@perfil`), "usam", profissional/especialista explicando |
| **demonstracao** | mostra o produto ou o que ele faz: cita 2+ funcionalidades, "veja como funciona", tela |
| **institucional** | fala da marca, missão, história; sem link e sem botão; reforço de marca |
| **isca** | lead magnet: ebook, guia, aula, checklist, webinar, diagnóstico gratuito |
| **remarketing** | para quem já interagiu: UTM `retarget`/`remarketing`, "você já usa…" (upsell) |
| **indefinido** | texto de catálogo dinâmico (`{{product.*}}`) ou sem texto: o snapshot não permite dizer |

Um anúncio tem **um tipo principal** e pode ter oferta junto (a oferta é medida à parte, em 5.7). Ex.: demonstração + teste grátis.

### 5.4 Formato
`imagem` · `video` · `carrossel` (já no snapshot). Sinais extras só com mídia baixada: proporção (4:5, 9:16, 1:1), duração (≤6 s, 6–15, 15–30, 30+), estilo (UGC/câmera, motion, gravação de tela, texto sobre fundo). Estilo exige IA com visão (camada B).

### 5.5 Ângulo / gatilho (vocabulário inicial para a Kzloo, editável em `tags.yml`, grupo `angulo`)
`dor-burocracia` · `ganho-de-tempo` · `carga-mental` · `preco-economia` · `gratuito-sem-risco` · `ia-prontuario` · `sigilo-seguranca` (LGPD, dado do paciente) · `norma-cfp` (medo de descumprir a resolução do conselho, prontuário obrigatório) · `autoridade` (especialista, advogada, fundador) · `identidade-psi` (comunidade, "psis") · `comparacao` (marketplace vs autonomia, planilha vs sistema) · `captacao-de-pacientes` · `humor`. Gancho (grupo `gancho`): `pergunta`, `cena-da-dor`, `afirmacao-ousada`, `numero-ou-preco`, `humor`, `depoimento`, `quebra-de-padrao`. **Só a IA decide ângulo e gancho com qualidade**; as regras só acertam os casos óbvios (palavra "grátis" → `gratuito-sem-risco`, "prontuário"+"CFP" → `norma-cfp`).

### 5.6 Link, CTA e destino
`temLink` (boolean) · `destino.kind`: `whatsapp`, `instagram`, `facebook`, `loja-app`, `formulario`, `planos`, `cadastro`, `lp` (subdomínio `lp.`, lovable/vercel/netlify ou caminho interno), `site` (home), `nenhum` · `dominio` · `caminho` · `utm {source, medium, campaign, content, term}`. CTA literal do botão guardado como veio. **Anúncio sem link e sem botão** não é erro: é impulsionamento de post ou conteúdo de parceria (Sintropia tem 5).

### 5.7 Oferta explícita
`tipos`: `preco`, `desconto`, `teste-gratis`, `plano-gratuito`, `sem-cartao`, `cupom`, `prazo`, `garantia` · `precos[]` (todos os R$ citados; **cuidado**: o primeiro pode ser preço da sessão do paciente, não do produto) · `precoPor` (mês, dia, sessão) · `diasTeste` · `trecho` (frase onde achou, para o Oliver conferir).

### 5.8 Público implícito
Quem o anúncio chama: `psicologo-autonomo`, `clinica/equipe`, `recem-formado`, `paciente` (anúncio para o paciente, como o "Encontre seu terapeuta" da Allminds), `outra-especialidade` (ABA/TEA da Mais Terapias). Regras: palavras-chave ("psicóloga", "clínica", "recém-formada", "paciente", "ABA"); **IA** confirma. Útil para descartar ruído (anúncio para paciente não é concorrente direto).

## 6. Algoritmo em duas camadas

### Camada A: regras determinísticas (grátis, já prototipada)
`classificarAnuncio(ad, { hoje, irmaos })` em `tools/intel/ads-classify.ts` (função pura, sem rede). Cada campo (funil, tipo, objetivo) é uma **votação ponderada**: cada regra que dispara soma peso a um valor e registra um **motivo legível**. Vence quem tem mais peso. Confiança por campo = `0,15 + 0,4 × margem sobre o 2º + 0,12 × nº de regras que concordam` (teto 0,95): uma regra isolada dá ~0,67, três regras concordando dão ~0,9, empate dá ~0,2–0,3. Confiança geral = média dos três.

Regras implementadas (peso):
- **UTM**: `retarget|remarket` → funil fundo (3,5) e tipo remarketing (4); `prospect|broad|frio` → funil topo (3,5).
- **Destino**: WhatsApp → objetivo mensagem (3), funil fundo (1,5); perfil Instagram/Facebook → engajamento (2,5), topo (2); loja de apps → instalação (3); formulário → lead (3); `/planos|/pricing|/checkout` → cadastro (2,5) e fundo (2); `/cadastro|/signup` → cadastro (2,5) e fundo (1,5).
- **CTA**: Cadastre-se/Assinar/Obter oferta → cadastro (1,5) e fundo (1); "Saiba mais"/"Ver detalhes" → meio (1) e tráfego (2, se vai para site/LP); "Acessar o perfil" → engajamento (1,5) e topo (2); sem link e sem botão → engajamento (2), topo (2), institucional (1,5).
- **Oferta no texto**: R$ (2), desconto/%/OFF/promoção (2), teste grátis (2), plano gratuito (1,5), cupom/prazo (1,5), "assine" (1,5) → tipo oferta; oferta → funil fundo (1,5).
- **Tipo por conteúdo**: 3+ funcionalidades (agenda, prontuário, financeiro, lembretes, IA, WhatsApp, relatórios…) → demonstração (2,5); depoimento/`@perfil`/"usam"/advogada/especialista → prova social (2,5); "nasceu"/missão/"cuidar de quem cuida" → institucional (2,5); ebook/guia/aula/checklist/webinar → isca (3); lista de 2+ perguntas "Como…?" → conteúdo (2,5); pergunta, dica, "por que", "hoje mudou" → conteúdo (1,5).
- **Catálogo dinâmico** (`{{product.*}}` sem texto real) → tipo `indefinido`, confiança 0,2, motivo explícito.
- **Sinais** (não votam, só descrevem): dias no ar, `variations`, `irmaos`, formato, plataformas, UTM, gancho (1ª frase), caracteres, funcionalidades citadas.

### Camada B: IA barata, em lote, só onde precisa
Roda para: (1) anúncio **novo** (sem item em `ia.json`) ou **criativo trocado** (hash mudou); (2) anúncio com **confiança das regras < 0,5**; (3) **sob demanda** num anúncio (botão "Analisar com IA" na gaveta). Nunca em toda coleta.
- **Entrada** (por anúncio): texto, título, descrição, CTA, destino/UTM, formato, dias no ar, **a classificação das regras** (a IA corrige em vez de começar do zero) + vocabulário de ângulos e ganchos de `tags.yml`. Texto + metadados custam ~300 tokens por anúncio.
- **Saída** (JSON): `angulo[]`, `gancho`, `promessa` (1 frase), `publico`, `funil`/`tipo` (só se as regras estavam abaixo de 0,5 ou se a IA discordar com motivo), `confianca`, `motivo`.
- **Mídia** (opcional, 2º nível): **imagem/carrossel** → visão em 1 a 3 quadros, para OCR do texto na arte e estilo; **vídeo** → transcrição do áudio com o mesmo caminho barato que a skill `referencias` já usa (Whisper local/yt-dlp; custo de API zero) e 1 quadro de abertura para o gancho visual. Vídeo e imagem só entram quando o texto do post é vazio ou genérico, ou o Oliver pede.
- **Execução**: subagentes Sonnet via skill (padrão do hub, sem chave de API) **ou** API do Claude em lote com cache do prompt de sistema. Lotes de 10 anúncios por chamada.

**Custo estimado por 50 anúncios** (preços de lista que eu conheço; conferir na página da Anthropic antes de fechar: Haiku ~US$ 1/5 por milhão de tokens entrada/saída, Sonnet ~US$ 3/15):
| cenário | tokens (entrada / saída) | Haiku | Sonnet |
|---|---|---|---|
| só texto, 5 chamadas de 10 anúncios (prompt de sistema ~1 mil tokens + 10 × ~300) | ~20 mil / ~9 mil | **~US$ 0,07** | **~US$ 0,19** |
| com visão (1 imagem/anúncio, ~2 mil tokens cada) | ~120 mil / ~9 mil | ~US$ 0,17 | ~US$ 0,50 |
| semana típica (só 5–10 novos/baixa confiança, texto) | ~4 mil / ~2 mil | < US$ 0,02 | < US$ 0,05 |
Ou seja: **centavos por rodada**; refazer os 50 do zero custa menos de R$ 3 mesmo com visão em Sonnet. Com a Batch API (-50%) e cache do prompt, menos ainda. Conclusão: dá para rodar IA em **todos** os anúncios novos sem pensar no custo; o gargalo é qualidade, não preço. Recomendação: Haiku para ângulo/gancho em texto, Sonnet para visão e para os casos de baixa confiança.

## 7. Sinais de vencedor e ranking
Sem gasto nem alcance, o app calcula um **sinal de resultado** (0–100) e um **status**, sempre rotulado como indireto:

| sinal | como mede | peso |
|---|---|---|
| **tempo no ar** | `min(dias, 120)/120` | 50 |
| **escala do conceito** | irmãos no conceito (texto+título iguais) e `variations` da Meta: `min((irmaos−1) + (variations−1), 5)/5` | 20 |
| **persistência** | nº de coletas seguidas em que aparece (só a partir da 2ª coleta) | 10 |
| **reaparecimento** | o mesmo criativo saiu e voltou com outro id | 10 |
| **peso do anunciante** | conceito é grande dentro dos ativos do concorrente (≥ 3 anúncios) | 10 |

Status (o que aparece em chip): `em-teste` (< 14 dias) · `promissor` (14–29) · `provado` (30–89) · `veterano` (90+) · `perdeu` (saiu do ar com < 30 dias de vida) · `encerrado` (saiu com 30+). Limiares 30 e 90 vêm das fontes e do que o 031 já usa (âmbar ≥ 30); ficam em constante editável. **Ordenação padrão = dias no ar** (pedido do Oliver); alternativas: sinal de resultado, mais novos, mais versões. "Anúncio-pai" (primeiro do conceito) representa o grupo; os irmãos ficam colapsados ("+5 versões"). Caveats mostrados na tela: sem gasto, sem alcance; longevidade pode ser anúncio barato ou institucional.

Sinal de **teste**: rajada (3+ anúncios do mesmo concorrente começando na mesma semana) = concorrente testando ângulos; vira linha no relatório semanal ("Sintropia lançou 4 vídeos em 07/07").

## 8. Telas
Todas dentro da área Concorrentes que já existe (abas por rota).

1. **Aba Anúncios (mercado)** `/concorrentes/anuncios`: faixa de números (ativos, novos, provados 30+, saíram do ar desde a última coleta) · filtros: concorrente, **funil** (topo/meio/fundo), **tipo**, **objetivo**, **ângulo** (tags), formato, **tem link / só com oferta**, status do sinal, só salvos, busca · **ordenação padrão: dias no ar** · cada card: miniatura, dias no ar, chips (funil, tipo, objetivo, "teste grátis R$ 89"), gancho, domínio/caminho do link, selo "você corrigiu" · seletor **Lista / Linha do tempo**. A linha do tempo é um **Gantt por concorrente**: uma linha por conceito, barra de `startedAt` até hoje (ou até `saiuEm`), cor pelo funil, marca de variações; mostra rajadas e quem parou. Clique abre a gaveta.
2. **Aba Anúncios na ficha do concorrente**: mesma lista, já filtrada, com resumo do concorrente: mix de funil e tipo (barras), % com oferta, destino mais usado, cadência (anúncios novos por mês), UTMs e a estrutura de campanha que dá para deduzir (ex.: Sintropia `br-trial-funil-completo-202607-v1`, prospecting broad + retarget engajamento 365 d).
3. **Gaveta de detalhe do anúncio**: mídia grande (vídeo toca), texto completo, título/descrição/CTA, link clicável (abre a LP) com domínio e UTM abertos, plataformas, datas, histórico (coletas, "saiu do ar em…"), **classificação editável**: cada campo mostra valor, origem (regra/IA/você), confiança e **motivos**; o Oliver troca o valor e vira override; **nota**, **tags** (com grupo), **Salvar** (coleção), **Virar ideia de anúncio** (abre o formulário já preenchido), botão "Analisar com IA".
4. **Salvos (boards)** `/concorrentes/anuncios/salvos`: coleções (Foreplay-style), grade de cards com a nota por baixo, arrastar entre coleções, filtro por tag. Salvo usa `frozen`, então não some.
5. **Ideias de anúncio**: a página de Ideias existente ganha o filtro "anúncio"; ver seção 9.
6. **Relatório semanal** (031) ganha: provados novos, saíram do ar, rajadas, melhores conceitos por funil. A skill `ads-meta` já lê esse relatório.

## 9. Ideias de anúncio e ligação com a skill `ads-meta` e a tarefa 036
- Reusa o modelo de ideia (`schema/idea.ts`): `source { competitor, platform: 'facebook', itemId: <adId>, url: <link da Biblioteca> }`, `format`, `objective`, `tags`, `task`. **Extensão proposta (opcional, compatível):** `ad?: { funil, tipo, angulo, gancho, oferta, referencias: [`${source}:${adId}`] }` para guardar a hipótese ("copiar o ângulo X da Corpora para o funil de fundo") e o conjunto de anúncios de referência; a tag `anuncio` marca que é ideia de anúncio.
- **Skill `ads-meta`** (modo Criar, passo 1 "Ângulos"): passa a ler (a) ideias com tag `anuncio` e status `aprovada`/`analisada`; (b) os **salvos** do Oliver com nota; (c) um resumo do mercado: ângulos e ganchos mais usados e quais estão no ar há 90+ dias por funil; (d) `LOG_ANGULOS.md` (não repetir aposentados). Pedido para a skill: **referenciar o anúncio de origem** no `ads.md` ("inspirado em Corpora 1357…, no ar há 62 dias") e não copiar texto: copiar o mecanismo, não a frase.
- **Tarefa 036**: a ideia de anúncio e o salvo podem ser arrastados para um nó do quadro de funil (o nó guarda `ideaId`/`adKey`); o funil do concorrente (UTM + mix topo/meio/fundo) serve de molde de comparação.
- **Kanban**: "virar tarefa" a partir da ideia segue o fluxo atual (`task: T-NNNN`).

## 10. Limites e riscos da coleta
- **Só ativos, só BR, sem gasto, sem alcance, sem público** (política da Meta: só anúncios políticos/de temas sociais têm esses campos). Nada de "quanto investem": só tempo no ar, versões e cadência.
- **Anúncio inativo some**: o app só sabe que saiu comparando coletas. Coletas espaçadas demais (ou truncadas pelo limite de 30 por concorrente) deixam o `saiuEm` impreciso ou ausente. Mitigação: coletar toda semana (já existe `intel:semanal`), só marcar "saiu" em coleta completa (`ads.length >= total`), guardar `frozen` para os salvos.
- **Limite e HTTP 403** da Meta (a Corpora deu 403 na 2ª busca seguida): coleta lenta (pausa de 4 s entre concorrentes, já existe), uma tentativa por concorrente, nunca contornar login/captcha; o app avisa e usa a coleta anterior. Risco aceito: a página pública pode mudar o JSON embutido; o coletor tem fixtures e testes.
- **Subcontagem de variações**: `collation_count` da Meta mostrou 1 em quase tudo, e 14/50 anúncios eram clones. Por isso o conceito é calculado por nós (texto+título).
- **Catálogo dinâmico** (`{{product.name}}`): 5/50 sem texto real; classificação `indefinido` honesta, só IA com visão resolve.
- **Anúncio sem link/botão** (Sintropia, 5/50): pode ser post impulsionado ou conteúdo de parceria; não dá para saber o objetivo real.
- **Classificação é hipótese**: o objetivo e o funil reais ficam no Gerenciador do concorrente, fora de alcance. Toda tela mostra motivo e confiança e deixa o Oliver corrigir.
- **Direitos autorais**: salvar miniatura/vídeo é referência interna de estudo (como a Foreplay); não republicar. Não copiar texto de concorrente em anúncio nosso.
- **Privacidade**: nada de dado pessoal; anúncios são públicos. Notas e marcas ficam no repositório (git privado do Oliver).

## 11. Outras fontes no mesmo modelo (035)
`Ad` ganha `source` opcional (`meta` por padrão). O Google Ads Transparency (035, fase 2) grava em `competitors/<id>/ads-google/<data>.json` com o mesmo `Ad` (texto, título, imagem/vídeo, região, datas, formato). Chave global `google:<creativeId>`; `marks.json` e `ia.json` aceitam as duas fontes. Regras ajustam: anúncio de pesquisa Google é quase sempre intenção alta (**fundo**, objetivo tráfego/cadastro) e o texto tem os termos comprados, que alimentam o planejamento de palavras-chave da 036. Pixels detectados (035, fase 1) entram no resumo do concorrente: "tem Meta Pixel + TikTok Pixel, sem Google Ads" explica por que só há anúncios da Meta.

## 12. Fases (pequenas e testáveis)
| fase | entrega | critério de pronto |
|---|---|---|
| **A. Histórico** | função `adsHistory(slug, id)` em `core/store.ts` (primeira/última vez, dias, saiu do ar, reapareceu, conceito/irmãos) + rota `GET /ads/history`; teste com 2 snapshots de fixture (um anúncio some, um volta com id novo, uma coleta truncada não marca "saiu") | teste automatizado verde; com os snapshots reais do Sintropia e PsicoManager (2 coletas) devolve 0 saídas |
| **B. Classificador de regras** | mover o protótipo para o pacote do app (ou importar de `tools/intel/`), rota `GET /ads/classified`, **gabarito** `tools/intel/fixtures/ads-gold.json` (anúncios reais rotulados à mão pelo Oliver) e teste que falha se a acurácia cair abaixo de 85% (funil e tipo) | `npm run test:intel` mede e imprime acerto por campo; sem regressão no gabarito |
| **C. Aba Anúncios com tags e filtros** | chips de funil/tipo/objetivo/oferta/destino nos cards; filtros novos; ordenação por tempo no ar (padrão) e por sinal de resultado; status (provado/veterano/perdeu); colapsar irmãos | filtrar "fundo + oferta" nos 50 reais devolve só ofertas; cada chip abre o motivo |
| **D. Marcas do Oliver** | `schema/ads-marks.ts` + `marks.json` + rotas; gaveta com nota, tags (com `group` em `tags.yml`), salvar com `frozen`, override da classificação; coleção "Salvos" | override do Oliver sobrevive a nova coleta e a reclassificação; anúncio salvo que saiu do ar continua abrindo inteiro |
| **E. Ideias de anúncio** | botão "Virar ideia" cria `I-NNNN` com origem e hipótese; extensão `ad?` em `schema/idea.ts`; ajuste do texto da skill `ads-meta` (ler ideias/salvos/resumo) | `npm run validate` limpo; rodar a skill num pedido de teste cita o anúncio de origem |
| **F. Camada de IA** | `ia.json`, comando `npm run ads:ia -- kz` (lote, só novos/baixa confiança), prompt com vocabulário de `tags.yml`, custo logado por rodada; transcrição/visão opcionais | 50 anúncios classificados por IA com custo < US$ 0,50 registrado; concordância IA×gabarito medida; hash evita refazer |
| **G. Linha do tempo (Gantt) e ficha do concorrente** | seletor Lista/Linha do tempo; aba Anúncios na ficha com mix de funil/tipo e estrutura de campanha por UTM; seção no relatório semanal | Gantt dos 6 concorrentes com barras corretas contra `startedAt`; relatório lista rajadas e saídas |
| **H. Google Transparency** (depende da 035) | `source` no `Ad`, coletor Google, mesmas telas | anúncios Google aparecem com chip de fonte e entram no ranking |

Ordem recomendada: A → B → C (já dá valor: o Oliver passa a filtrar por funil/tipo) → D → E → F → G → H. A–C não gastam token nenhum.

## 13. Perguntas para o Oliver (só as que mudam o desenho)
1. **Funil**: topo/meio/fundo pela **temperatura do público** (UTM/mensagem; "cadastre-se" frio vira topo) ou pelo **que o botão pede** (cadastre-se = fundo sempre)? Eu proponho a primeira, com o objetivo à parte. Muda a leitura dos anúncios da Sintropia e como entram no quadro 036.
2. **Ângulos e ganchos**: o vocabulário inicial da seção 5.5 está bom para a Kzloo? Quer travar em ~12 ou deixar a IA propor novos?
3. **IA nos anúncios**: rodar automático em todo anúncio novo (centavos) ou só quando você mandar, como a coleta semanal? E com visão/transcrição desde a fase F ou só texto primeiro?
4. **Salvar**: um anúncio salvo copia a mídia para o repositório (`frozenMedia`, miniatura leve; vídeo só se você pedir). Vídeo pesado fica fora do git, certo?
5. **Concorrentes sem anúncio achado** (Clínica Ágil, GestorPsi, PersonCare, PsiNota AI, Terapee): quer cadastrar o link da página do Facebook deles para a gente olhar de novo, ou aceitar que não anunciam?
6. **"Tipo de campanha"**: o que você quer ver como tipo de campanha além de funil e objetivo (ex.: lançamento, Black Friday, trial, institucional, remarketing, captação de pacientes)? Isso vira o grupo de tags `campanha` e eu preencho sozinho só o que a UTM deixar claro (ex.: `br-trial-funil-completo`).

## 14. Protótipo do classificador de regras (feito)
Arquivos novos (nada existente foi tocado):
- `tools/intel/ads-classify.ts`: `classificarAnuncio(ad, { hoje, irmaos })` → `{ funil, tipo, objetivo, temLink, destino, oferta, sinais, confianca, confiancaCampos, motivos[] }`; também `classificarDestino`, `extrairOferta`, `parseUtm`, `contarIrmaos`. Puro, sem rede.
- `tools/intel/ads-classify-run.ts`: roda nos snapshots reais. `npx tsx tools/intel/ads-classify-run.ts kz [--exemplos=10] [--todos] [--id=<adId>] [--json]`.

**Resumo da rodada final (50 anúncios, 6 concorrentes, hoje = 2026-10-08):**
```
FUNIL     : topo 20 · fundo 17 · meio 13
TIPO      : demonstracao 16 · oferta 15 · conteudo 6 · indefinido 5 · institucional 5 · remarketing 2 · prova-social 1
OBJETIVO  : cadastro 21 · trafego 17 · engajamento 10 · mensagem-whatsapp 2
LINK      : com link 45 · sem link 5
DESTINO   : site 18 · lp 11 · cadastro 6 · instagram 5 · nenhum 5 · planos 3 · whatsapp 2
OFERTA    : sem oferta explícita 23 · teste grátis (+ sem cartão) 19 · preço (+ teste/desconto/cupom) 6 · plano gratuito 2 · ... (27 de 50 trazem oferta explícita)
UTM       : com UTM 11 (só Sintropia e Psicoplanner) · catálogo dinâmico 5
CONFIANÇA : média 0,63 · abaixo de 0,50: 2 (4%) → só esses foram para IA por baixa confiança (mais os 5 de catálogo)
POR CONCORRENTE
  allminds       9 | meio 3, fundo 3, topo 3 | oferta 3, conteudo 3, demonstracao 2, indefinido 1
  corpora       10 | fundo 7, topo 3         | oferta 7, conteudo 2, prova-social 1
  mais-terapias  6 | meio 5, fundo 1         | demonstracao 3, indefinido 2, oferta 1
  psicomanager   7 | meio 4, fundo 2, topo 1 | demonstracao 4, oferta 1, conteudo 1, indefinido 1
  psicoplanner   3 | fundo 2, meio 1         | oferta 2, indefinido 1
  sintropia     15 | topo 13, fundo 2        | demonstracao 7, institucional 5, remarketing 2, oferta 1
```
Leituras que o mercado já entrega: **a Sintropia faz funil completo de verdade** (prospecting broad para teste grátis de 15 dias + retargeting de engajamento 365 d com `seletor de abordagem` e `sigilo`, 13 de 15 caem em topo (8 por UTM de prospecção, 5 sem link nem botão), vídeo em 100%); **a Corpora é a mais agressiva em oferta** (7 de 10 com oferta: plano gratuito, R$ 89, cupom 50% OFF, upsell para quem já usa) e usa o perfil do Instagram para conteúdo/humor (3 de 10); **a Allminds vende outro produto** (captação de pacientes por WhatsApp, R$ 223 por 9 contatos em 3 meses); **a Mais Terapias é ABA/TEA**, outro nicho; os dois anúncios mais velhos (PsicoManager 347 d e Psicoplanner 349 d) são perfil e teste grátis de 7 dias.

**Taxa de acerto (conferência à mão):** li o texto, botão e link de **todos os 45 anúncios com texto real** (os 5 de catálogo saem da conta: o classificador os marcou `indefinido` com confiança 0,2, 5 de 5) e comparei com o que eu classificaria. Critério brando: conta como certo se a classificação é defensável. Erros:
- **funil: 43/45 (96%)**. Erros: Allminds "Se você acabou de se formar…" (virou meio, é topo) e Mais Terapias "demonstração gratuita" (virou fundo, é meio).
- **tipo: 39/45 (87%)**. Erros: Allminds "Encontre seu terapeuta" (anúncio para paciente, virou demonstração), Allminds "se formar" (demonstração, é conteúdo), Corpora "Ative o modo profissional" (oferta, é remarketing/upsell), Mais Terapias "demonstração gratuita" (oferta, é demonstração), Sintropia "garrancho" (oferta, é demonstração), Sintropia "date" (institucional, é prova social/UGC).
- **objetivo: 44/45 (98%)**. Erro: Allminds "Teste grátis" para LP, que o botão "Saiba mais" fez virar tráfego (é cadastro).
- **link/destino/UTM/oferta explícita: 100%** nas conferidas (determinístico; o único cuidado é o preço: "R$ 80 a R$ 100 por sessão" da Allminds é preço do paciente, por isso `precos[]` e `precoPor`).

**Leia com cuidado:** (1) ajustei as regras olhando esses mesmos 50 anúncios (isca falsa por "planilhas", demonstração falsa em listas "Como…?", `\b` quebrado por um script meu): isso **infla** o acerto; (2) são 6 concorrentes e um deles (Sintropia) vale 30% da amostra; (3) tipo é o campo frágil porque um anúncio costuma ser dois tipos ao mesmo tempo. **Expectativa realista fora da amostra: funil ~80%, tipo ~70–75%, objetivo ~90%**, e é para isso que existem a confiança, os motivos, a camada de IA e o override do Oliver. Fase B manda o Oliver rotular um gabarito para medir de verdade.

Defeitos conhecidos do protótipo (para a fase B): "prova social" casa palavras soltas ("especialista", "recomendo") e pode disparar em texto de produto; `precoBRL` pega o primeiro R$ do texto; o funil de anúncio sem UTM pende para "meio" quando o botão é "Saiba mais"; não lê o texto em vídeo/imagem (isso é da IA).

## 15. Referências
Abri e li:
- Foreplay: https://www.foreplay.co/ e https://www.foreplay.co/discovery (Swipe File, Boards, "Sort by Longest Running", filtros, Spyder, análise de IA)
- Atria: https://www.tryatria.com/ (tagging automático de hook, persona, USP, formato; extração de hooks/LPs de concorrentes)
- Segwise, taxonomia de tags de criativo: https://segwise.ai/blog/creative-tag-taxonomy (hook, ângulo, oferta, formato, consciência; vocabulário fechado, conceito × variação)
- Meta Graph API, `archived-ad` (campos e para quais anúncios existem; gasto/impressões só político/temas sociais; alcance UE/UK): https://developers.facebook.com/docs/graph-api/reference/archived-ad/
- MagicBrief (aviso de encerramento em 31/07/2026): https://www.magicbrief.com/
- Motion, lançamentos (Leaderboard, Naming Conventions, Winning Combinations; a página não detalha o AI Tagging): https://motionapp.com/releases

Só vi em resultado de busca (não abri a página inteira, tratar como vendor/afiliado):
- Sinais de vencedor, tempo no ar e variações: https://apify.com/bovi/meta-ads-library-scraper · https://brandsearch.co/blog/meta-ad-library-limitations-gaps (a página deu 404 quando tentei abrir) · https://pixis.ai/blog/how-to-analyze-meta-ads-competitors-quickly-and-accurately/ · https://adkit.so/resources/how-to-see-competitor-ads-on-facebook
- Taxonomia de criativos: https://deeplinks.linkrunner.io/blog/creative-tagging-taxonomy-that-scales · https://segwise.ai/blog/ai-creative-library-tagging
- Comparativos de espiãs (preço e cobertura, não confirmei tags): https://www.trendtrack.io/blog-post/bigspy-alternatives · https://www.tryatria.com/blog/bigspy-alternatives-4-better-ways-to-gather-and-use-competitive-intelligence · https://affninja.com/pipiads-alternatives/ · https://affninja.com/bigspy-vs-pipiads/

**Não verificado:** a página "Sobre" da Biblioteca da Meta não abriu (erro de conexão), então a lista de campos públicos vem da documentação da Graph API e do que o coletor já lê da página; tags e boards de AdSpy, BigSpy, Minea e PiPiAds; o AI Tagging do Motion; preços de modelo da seção 6 (conferir antes de orçar).

## Log
- 2026-10-08 — **fase B feita** (orquestrador). Funil pela temperatura do público (recomendação da pergunta 1, seguida sem resposta do Oliver; dá para trocar). Rota `GET /api/projects/:slug/ads/classified` (+ `api.adsClassified`), usando `tools/intel/ads-classify.ts` direto. Gabarito `tools/intel/fixtures/ads-gold.json`: 45 anúncios reais (sem os 5 de catálogo) com os rótulos da conferência à mão da §14 (`por: claude`); `npx tsx tools/intel/ads-gold.ts` mede e `… gerar` regera sem tocar rótulos `por: oliver`. `npm run test:intel` falha abaixo de 85% em funil/tipo: hoje funil 96%, tipo 89% (44, o anúncio para paciente fica fora), objetivo 98%. **Falta do Oliver:** conferir/rotular o gabarito (até lá a medida é contra a própria IA). Próximo: fase C (chips e filtros na aba Anúncios).
- 2026-10-08 — (orquestrador) o visual da aba Anúncios (barra, selects, vista Lista = tabela ordenável) foi para a **038 fase D**. A fase C desta tarefa só acrescenta as colunas/filtros de funil, tipo, objetivo e oferta em cima daquela tabela.
- 2026-10-08 — tarefa registrada pelo pedido do Oliver; BACKLOG ganhou a linha 037.
- 2026-10-08 — desenho + pesquisa + protótipo do classificador de regras (`tools/intel/ads-classify.ts`, `ads-classify-run.ts`). Nenhum arquivo existente alterado além da linha 037 do BACKLOG. Sem commit. Aguardando respostas da seção 13 e aval da fase A.
- 2026-10-08 — **fase A feita** (Sonnet implementou, Opus revisou, correções aplicadas). `adsHistory(slug, id)` devolve por anúncio primeira/última vez, diasNoAr (= duracaoFinal se saiu), saiuDoAr/saiuEm/duracaoFinal, reapareceu/reapareceuDe, conceito (sha1 de texto+título normalizados, mesma regra do `contarIrmaos`) e irmaos (sobre a última coleta completa com anúncios). Completude: o coletor agora grava `max` e `truncada` no snapshot e não copia mais `ads.length` para `total`; coleta completa = sem erro e `!truncada` (snapshot antigo: `< 30` e `>= total` se houver); coleta vazia só prova saída com `total === 0` explícito. Rotas de concorrentes validam `slug`/`id` (`isSlug`, fecha path traversal). Teste antigo do Facebook atualizado (perfis sem coletor saem da coleta desde 5eb62e8). `test:intel` 18 ok, typecheck e validate limpos; Sintropia e PsicoManager: 2 coletas, 0 saídas.
  - **Decisão pendente do Oliver:** saída + entrada de id novo com o mesmo texto **na mesma coleta** hoje não conta como "reapareceu" (é substituição; deve ser o caso comum, a Meta republica). E conceito com irmão ainda no ar + id novo conta como "reapareceu". Marcar substituição à parte como "republicado"?
