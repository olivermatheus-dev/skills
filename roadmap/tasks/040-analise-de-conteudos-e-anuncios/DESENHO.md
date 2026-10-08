# 040 — Desenho: análise profunda de conteúdos e anúncios dos concorrentes

Autor: Opus 5.5 (papel: especialista sênior em social media + arquiteto) · 2026-10-08 · **só desenho, nada implementado.**
Lido antes: TASK 040, skill `referencias`, 037 (§4–6, §12), 012, `library/formatos/` (README + `meme`, `recorte-funcionalidade`), `schema/format.ts`, `schema/competitor.ts`, `schema/ads.ts`, `schema/analysis.ts` (`AnalysisRequest`), skill `analise-concorrentes` (fila `pedido.json`), `Items.tsx` (`ItemDrawer`), 038 B2 (`withMarketOutlier` em `lib.tsx`), snapshots reais da Corpora e da Sintropia, `tools/usage.mjs`.

## 0. Decisões em uma tela
1. **Uma ficha por item** (conteúdo ou anúncio) em `competitors/<id>/fichas/<plataforma>__<itemId>.json`: cópia congelada do item, medidas no momento da análise, insumos (transcrição, quadros, OCR), análise do Opus com versão, modelo e custo, e **edições do Oliver em `override`, que nenhuma reanálise apaga**.
2. **Pipeline em 3 comandos, todos sob comando:** `preparar` (script: legenda/áudio → faster-whisper, quadros com ffmpeg, hash) → `analisar` (Opus, só o pacote enxuto) → `relatorio` (script calcula os números e o Opus escreve a leitura). Nada roda sozinho.
3. **O Oliver dispara pelo app:** seleção ou "Top N" grava um `fichas/pedido.json` com a **lista de itens congelada no clique**. Depois roda "roda a fila de fichas" no Claude Code ou `npm run fichas -- rodar kz`.
4. **Vocabulários:** os universais (gatilho, tipo de gancho, elementos dos 5 s, estrutura, estilo de produção, CTA) ficam num arquivo global `library/analise/vocabulario.json`. O formato reaproveita `library/formatos/`. O tipo de conteúdo estende o `CONTENT_TYPES`. Os específicos do nicho (tema, ângulo/dor, público) vão em `companies/<slug>/tags.yml`, que a 037 já previa. A IA só escolhe dentro do vocabulário; o que não cabe vira **termo proposto**, e o Oliver aceita.
5. **Custo:** ~US$ 0,08 por item no Opus 5.5 e ~US$ 1,9 por rodada de 20 com o relatório (~US$ 1 pela Batch API). Pelos subagentes do Claude Code não há custo por token, mas a rodada consome a cota da assinatura (§5).
6. **Sem duplicar:** a 040 **substitui o passo 3 da skill `referencias`** (análise do marcado) e passa a ser o caminho "sob demanda" da **037 F** para anúncios. Regras, histórico e marcas da 037 entram como insumo e não são refeitos. As ideias continuam no modelo da 012 (`ideas/I-NNNN`).

**Achado que muda o "top 20":** a coleta pública do Instagram (`instagram-public`) traz **só 6 itens por perfil** (Corpora, Sintropia e PsicoManager: 6 cada). Por isso o "top 20 do Instagram" não existe hoje. YouTube e TikTok trazem 30 (`yt-dlp`). Para ter 20 no Instagram é preciso o Apify (`APIFY_TOKEN`, pago por uso). Ver pergunta 1.

---

## 1. Ficha de análise: campos

Legenda da coluna **origem**: `S` = script (grátis, determinístico) · `H` = Haiku 5.5 (preparo barato) · `O` = Opus 5.5 (análise) · `037` = já calculado pela 037 (regras/histórico) · `B2` = medidas da 038 B2.
**Vocabulário:** `F` = fechado (só valores da lista; o que não cabe vira `novo`) · `L` = livre (texto) · `N` = número/data.
**Destaque:** `★` = aparece no topo do painel; os demais vão para "Detalhes".

### 1.1 Comum a conteúdo e anúncio
| campo | tipo | voc. | origem | ★ | o que é (definição operacional) |
|---|---|---|---|---|---|
| `plataforma` | enum | F | S | ★ | instagram · tiktok · youtube · meta-ads |
| `formatoMidia` | enum | F | S | ★ | reel · short · video · carrossel · imagem · post (do snapshot) |
| `duracaoS` | número | N | S | ★ | do snapshot; carrossel = nº de slides |
| `publicadoEm` | data | N | S | | anúncio: `startedAt` |
| `tema` | texto + tag | L + F(`tags.yml#tema`) | O | ★ | assunto em até 8 palavras + 1 tag de tema do nicho |
| `mensagem` | texto | L | O | | o que a pessoa leva, em 1 frase |
| `tipoConteudo` | enum (1 principal + até 2 secundários) | F | O | ★ | o **porquê** (§1.4.1) |
| `formato` | id de `library/formatos` | F | O | ★ | o **como**; sem par → `novo` (formato rascunho proposto) |
| `estiloProducao` | enum | F | O (quadros) | | ugc-celular · talking-head · esquete · motion · gravacao-de-tela · texto-sobre-fundo · trend-audio · foto · carrossel-design · corte-de-video-longo |
| `headline` | texto | L | O (OCR dos quadros, título) | ★ | o texto **na tela** na abertura (vídeo) ou no 1º slide/arte. Sem quadros, usa título/1ª linha e marca `fonte: "legenda"` |
| `gancho.texto` | texto | L | O | ★ | a primeira frase falada **ou** escrita (0–3 s), literal |
| `gancho.tipo` | enum | F | O | ★ | §1.4.3 |
| `gancho.canal` | enum | F | O | | fala · texto-na-tela · visual · audio-trend · legenda |
| `retencao5s[]` | lista `{ t: "0–1 s", elemento, gatilho }` | F + L | O (quadros + transcrição) | ★ | o que segura nos primeiros 5 s, segundo a segundo (§1.4.4) |
| `gatilhos[]` | lista `{ id, onde, trecho }` | F | O | ★ | gatilhos mentais com **o trecho literal** que prova cada um (§1.4.2) |
| `estrutura.macro` | enum | F | O | | §1.4.5 |
| `estrutura.blocos[]` | `{ bloco, quando, oque }` | F (bloco) + L | O (transcrição) | | mesmo formato do `FormatBlock` de `schema/format.ts` |
| `cta.tipo` | enum | F | O / S | ★ | comentar-palavra · link-bio · salvar · enviar · seguir · cadastro-teste · cupom · whatsapp · nenhum |
| `cta.texto` | texto | L | S/O | | literal |
| `cta.momento` | texto | L | O | | "fim", "legenda", "0:12" |
| `produto.presenca` | enum | F | O | ★ | nenhuma · rodape (marca/@ no fim) · sutil (aparece no meio) · central (o conteúdo é o produto) |
| `produto.primeiraMencaoS` | número | N | O (transcrição) | | segundos até falar/mostrar o produto |
| `produto.funcionalidades[]` | ids da matriz | F (`intel/matriz.json`) | O | | as mesmas linhas da matriz de funcionalidades |
| `oferta` | objeto da 037 §5.7 | F | 037 + O | | tipos, preços, dias de teste, cupom, trecho |
| `publico.quem` | enum | F (`tags.yml#publico`) | O | | psicologo-autonomo · estudante · recem-formado · clinica · paciente · outra-especialidade |
| `publico.consciencia` | enum | F | O | | inconsciente · problema · solucao · produto · pronto (níveis de Schwartz) |
| `tom` | enum (até 2) | F | O | | leve-humor · ironico · acolhedor · tecnico · indignado-posicionamento · aspiracional · urgente |
| `som` | enum | F | S/O | | fala · audio-trend · trilha · sem-som (S marca `fala` quando o Whisper acha voz) |
| `legendaTela` | boolean | | O (quadros) | | legenda queimada no vídeo |
| `ritmo.cortesPorMin` | número | N | S (detecção de cena do ffmpeg) | | só com vídeo baixado |
| `hashtags[]` | lista | L | S | | da legenda |
| `porQue` | texto ≤ 2 linhas | L | O | ★ | hipótese de **por que performou (ou não)**, ligada às medidas. Sempre escrita como hipótese |
| `adaptar[]` | até 3 `{ ideia, formato }` | L + F | O | ★ | como a Kzloo usaria o padrão, sem copiar e respeitando `VOICE.md` |
| `riscos[]` | enum + trecho | F | O | | promessa-de-resultado · exposicao-de-paciente · fala-sobre-conselho-sem-fonte · humor-com-sofrimento · claim-sem-prova (o que **não** replicar) |
| `replicavel` | 0–3 | N | O | | 0 = depende de quem fala ou do tamanho do perfil · 3 = qualquer marca faz amanhã |
| `confianca` | por bloco: `{ texto, visual, retencao }` alta/media/baixa | F | O | | baixa quando faltou insumo |
| `faltou[]` | lista | F | S/O | | sem-transcricao · sem-quadros · legenda-vazia · audio-sem-fala · midia-indisponivel |
| `termosNovos[]` | `{ grupo, valor, definicao, exemplo }` | L | O | | proposta de termo novo para o vocabulário (o Oliver aceita) |

### 1.2 Só conteúdo orgânico
| campo | tipo | origem | ★ | nota |
|---|---|---|---|---|
| `medidas` | `{ views, likes, comments, shares, saves, seguidores, xPerfil, xMercado, porSeguidor, porSeguidorMercado, engajamento, escopoMercado, amostraMercado, base }` | S (B2) | ★ | **congeladas no momento da análise** (o painel mostra também as atuais, da última coleta) |
| `autoria` | enum | O | | proprio · colab (post colaborativo) · criador-parceiro · repost |
| `serie` | texto | O | | quadro/série recorrente ("bate-bola", "pack de figurinhas pt 2") |

### 1.3 Só anúncio
| campo | tipo | origem | ★ | nota |
|---|---|---|---|---|
| `funil`, `objetivo`, `tipoAnuncio` | enums da 037 §5.1–5.3 | 037 (regras) → O confirma ou corrige com motivo | ★ | a resolução continua a da 037: você > IA > regra |
| `angulo[]` | `tags.yml#angulo` (037 §5.5) | O | ★ | |
| `destino` | 037 §5.6 | 037 | | |
| `historico` | `{ diasNoAr, variations, irmaos, saiuDoAr, reapareceu }` | 037 A | ★ | o "sinal de resultado" do anúncio, porque o anúncio não tem views |
| `textoPrincipal.gancho` | 1ª linha do texto | S | | |
| `criativo.headline` | texto da arte | O (visão) | ★ | |
| `provaTipo` | enum | O | | criador · depoimento · numero · especialista · nenhuma |
| `coerenciaLP` | texto curto | O | | só se existir `analysis/landing.json` desse domínio: o anúncio promete o que a página entrega? |

### 1.4 Vocabulários iniciais (adaptados ao nicho: SaaS para psicólogas/terapeutas no Brasil)
Todos com `id`, `nome`, `definicao`, `sinais` e `exemplo`, em `library/analise/vocabulario.json`. Os grupos marcados "nicho" vão para `companies/<slug>/tags.yml`.

**1.4.1 Tipo de conteúdo (o porquê).** Base = `CONTENT_TYPES` atuais: `educativo` · `identificacao` · `humor` · `bastidor` · `prova` · `produto` · `lancamento` · `oferta`. **Propostos** pelo que já aparece na coleta:
- `posicionamento`: opinião sobre a profissão, ética ou política. Ex.: Corpora, "A psicologia está diretamente ligada à política", 11,6 mil curtidas.
- `comunidade`: pertencimento e "mimo" para a classe. Ex.: "Pack de Figurinhas para as PSICODIVAS".
- `noticia`: CFP, lei, tendência ou "URGENTE".
- `parceria-evento`: evento, curso ou retiro em que a marca é parceira.
- `isca`: ebook ou modelo para baixar. Ex.: Mais Terapias, "Canvas de Planejamento Terapêutico".

**1.4.2 Gatilhos mentais.** Só valem com o trecho literal:
| id | definição no nicho | sinal típico |
|---|---|---|
| `identificacao` | cena reconhecível do dia a dia da psi | "quando o paciente…", POV do consultório |
| `pertencimento` | "somos psis", tribo, linguagem interna | "psis", "PSICODIVAS", "low profile" |
| `autoridade` | especialista, CRP, CFP, advogada, docente | crachá, título, "segundo a resolução…" |
| `prova-social` | colegas usam ou recomendam | "+X psicólogas", criador parceiro, @ de psi |
| `escassez` | quantidade limitada | "últimas vagas" |
| `urgencia` | prazo | "faltam poucas semanas", "só até…" |
| `exclusividade` | único ou só para um grupo | "único do Brasil", "exclusivo para psicólogas" |
| `curiosidade` | loop aberto, surpresa | "o que será que…", "no fim…" |
| `reciprocidade` | dá algo antes de pedir | pack, ebook, modelo grátis |
| `gratuidade-sem-risco` | grátis, sem cartão, teste | "plano gratuito sem prazo" |
| `ancoragem-preco` | preço posto contra outra coisa | "R$ 89 por tudo isso", "50% OFF" |
| `medo-de-perda` | multa, CFP, LGPD, prontuário errado, perder paciente | "você pode ser processada" |
| `alivio-tempo` | menos burocracia, mais tempo para a clínica | "menos trabalho repetitivo" |
| `contraste` | antes × depois, planilha × sistema | split, "eu antes / eu agora" |
| `humor-alivio` | piada que alivia a tensão da profissão | meme, esquete |
| `indignacao-valores` | posição moral que gera debate | "quer você queira ou não" |
| `aspiracao` | consultório e vida que a psi quer ter | estética, rotina calma |
| `compromisso` | pede microação pública | "comenta X", "salva para depois" |

**1.4.3 Tipo de gancho.** Supera e substitui a lista `gancho` da 037 §5.5:
`pergunta-direta` · `cena-da-dor` · `pov-esquete` ("POV: o paciente…") · `afirmacao-ousada` (contraintuitiva) · `polemica` · `numero-lista` ("3 erros…") · `chamado-de-identidade` ("psicóloga que…") · `noticia-urgente` · `curiosidade-loop` · `demonstracao-imediata` (tela do produto já nos 0 s) · `humor-absurdo` · `fala-de-terceiro` (depoimento ou criador) · `promessa` (**sinaliza risco** em saúde) · `quebra-visual` (movimento ou imagem estranha sem fala) · `texto-mudo` (só texto, áudio de trend).

**1.4.4 Elementos dos 5 s (retenção).** Cada item de `retencao5s` traz `t`, `elemento` e o `gatilho` que ele ativa:
`texto-na-tela-0s` · `rosto-close` · `fala-em-menos-de-0,5s` · `corte-rapido` (< 1,5 s) · `movimento-de-camera` · `audio-trend-reconhecivel` · `legenda-dinamica` · `promessa-do-que-vem` · `pergunta-sem-resposta` · `payoff-visual-imediato` · `contraste-visual` · `rotulo-de-identidade` ("psis, isso é para vocês") · `produto-na-tela`.

**1.4.5 Estrutura macro.** Os blocos seguem a ficha de pauta da 012 §5 (gancho → contexto → loop → entrega → payoff → CTA):
`gancho-entrega-cta` · `problema-solucao` · `lista` · `antes-depois` · `historia-virada` · `esquete-punchline` · `pergunta-resposta` · `demo-passo-a-passo` · `loop-curto` (vídeo de 5–10 s feito para rever) · `comparacao` · `anuncio-evento`.

**1.4.6 Formatos.** Ids atuais de `library/formatos/`: `post-frase`, `meme`, `antes-depois`, `carrossel-educativo`, `trailer-lancamento`, `recorte-funcionalidade`, `texto-cinetico`, `dialogo`, `3d-produto`, `apresentacao-locucao`. **Candidatos já observados**, que só entram com o aceite do Oliver (viram verbete `rascunho` com a ficha como referência):
- `meme-trend-video`: áudio em alta + texto na tela, 5–15 s. Corpora no TikTok: o "😔 droga" teve 126 mil views com mediana do perfil de 770 (164× perfil).
- `esquete-consultorio`: encenação curta. Corpora no YouTube: "como BEBER ÁGUA sem INCOMODAR O PACIENTE".
- `ugc-criador`: criador ou psi apresentando a ferramenta. Corpora no anúncio @kellyciberpsi.
- `carrossel-lista-features`.
- `corte-de-video-longo`: Mais Terapias.
- `bate-bola`: entrevista rápida.
- `pack-recurso`: figurinhas e modelos.

**Fluxo do termo novo:** o Opus devolve `termosNovos[]`. O app mostra no relatório e no painel um chip "proposto" (Lucide `Sparkles`). **Aceitar** grava o termo no vocabulário (ou cria `library/formatos/<id>/formato.json` como `rascunho`) e reetiqueta a ficha. **Recusar** grava em `recusados[]`, para a IA não propor de novo.

---

## 2. Arquivo por item

### 2.1 Onde mora
```
companies/<slug>/competitors/<id>/
  snapshots/…            (já existe, imutável)
  ads/…                  (já existe, imutável; marks.json da 037 D)
  marks.json             (já existe: status nova/marcada/analisada/descartada)
  fichas/
    pedido.json          ← fila do Oliver (§4)
    instagram__DdtuawFvkXi.json   ← 1 ficha por item (no git: é texto e custou dinheiro)
    meta-ads__2312915999516286.json
  relatorios/
    2026-10-08-tiktok-top20.md     ← mini compilado (§6)
data/intel/<slug>/<id>/<plataforma>__<itemId>/   (FORA do git)
    audio.wav · video.mp4 (apagado depois, ver pergunta 3) · quadros/0000ms.jpg… · whisper.json
```
Separador `__` porque `:` não vale em nome de arquivo no Windows; a chave lógica continua `<plataforma>:<itemId>`, igual ao `marks.json`.

### 2.2 Schema (`schema/ficha.ts`, esboço)
```ts
FichaInsumos = {
  hash: string,                     // sha1(itemId + legenda + duracao + url da mídia + texto da transcrição)
  preparadoEm: IsoDateTime, preparadoPor: 'script' | 'claude-haiku-5-5',
  legendaLimpa?: string,            // sem links/listas de playlist (Mais Terapias tem 4 mil caracteres de links)
  transcricao?: { fonte: 'yt-auto-subs' | 'whisper-small' | 'whisper-medium', idioma: string,
                  texto: string, segmentos: { ini: number, fim: number, texto: string }[] },
  quadros: { tMs: number, arquivo: string /* data/intel/... */, descricao?: string /* Haiku */, ocr?: string }[],
  cenas?: number[],                 // tempos de corte (ffmpeg scene) → ritmo
  faltou: Faltou[],
}
FichaAnalise = {
  versaoPrompt: number, versaoVocab: number, modelo: 'claude-opus-5-5', esforco: 'medium' | 'high',
  geradoEm: IsoDateTime, custo?: { entrada: number, saida: number, cacheLeitura: number, usd?: number, via: 'api' | 'api-batch' | 'claude-code' },
  campos: FichaCampos,              // §1 (Zod com os enums dos vocabulários)
  termosNovos: TermoNovo[],
}
Ficha = {
  schema: 1, kind: 'conteudo' | 'anuncio', key: `${plataforma}:${itemId}`, competitorId: Slug, url: Url,
  item: ContentItem | Ad,           // cópia congelada (o snapshot de origem fica em `origem`)
  origem: { arquivo: string, collectedAt: IsoDateTime },
  medidas: Medidas,                 // B2 (conteúdo) ou histórico da 037 (anúncio), no momento da análise
  insumos?: FichaInsumos,
  analise?: FichaAnalise,
  anteriores: FichaAnalise[],       // até 3 análises antigas (reanálise não perde o que custou)
  override: Partial<FichaCampos> & { editadoEm?: IsoDateTime },   // do Oliver: SEMPRE ganha
  relatorios: string[],             // ids dos relatórios que usaram esta ficha
}
```
**Resolução de um campo:** `override` (Oliver) > `analise.campos` (Opus) > regra da 037 (só anúncio) > vazio. A tela mostra a origem com um chip ("você" / "IA" / "regra").
**Um lugar só por campo editado:** nos anúncios, os campos que a 037 D já guarda em `AdMark.override` (funil, tipo, objetivo, ângulo, gancho, oferta) continuam lá, e o painel lê e escreve em `marks.json`. Os demais campos vão para `ficha.override`. Assim não há duas verdades.
**Reanálise:** a análise atual vai para `anteriores` e uma nova é gerada. O `override` não é tocado. Se a nova análise discordar de um campo que o Oliver editou, o painel mostra um ponto (Lucide `CircleDot`) com "a IA agora diz X" e não troca nada.
**`marks.json`:** quando a ficha é gravada, o item vira `status: analisada` (o status já existe). A ficha não substitui as marcas.

---

## 3. Pipeline barato

```
seleção (app) ─▶ fichas/pedido.json ─▶ preparar (script, H opcional) ─▶ analisar (Opus) ─▶ salvar (Zod) ─▶ relatorio (script + Opus)
```
| passo | quem | o que faz | custo |
|---|---|---|---|
| 1. congelar | script | lê a última coleta, copia o item e calcula as medidas B2 (`withMarketOutlier`, a mesma função do app) | 0 |
| 2. pular | script | ficha com `analise` e o mesmo `hash` → pula. `--reanalisar` só pelo pedido explícito | 0 |
| 3. texto da fala | script | YouTube: `yt-dlp --write-auto-subs --skip-download --sub-langs pt.*`. Sem legenda, ou IG/TikTok: `yt-dlp -f bestaudio` (IG pode exigir o vídeo) → `ffmpeg -vn -ac 1 -ar 16000` → **faster-whisper `small`**, `language=pt`, `vad_filter`. Sem voz detectada → `faltou: audio-sem-fala` | 0 (CPU local) |
| 4. quadros | script | `ffmpeg` em **0 · 0,5 · 1,5 · 3 · 5 s + meio + último**, a 540 px. Carrossel: até 5 slides. Anúncio de imagem: a miniatura. Cortes de cena (`select='gt(scene,0.3)'`) → ritmo | 0 |
| 5. preparo | **Haiku 5.5** (opcional, recomendado) | descreve cada quadro em 1 linha + texto na tela (OCR); limpa a legenda (tira listas de links e hashtags repetidas) | ~US$ 0,001/item |
| 6. análise | **Opus 5.5** | recebe o **pacote enxuto**: metadados + medidas + legenda limpa + transcrição com tempos + descrições/OCR dos quadros + **2 imagens** (0 s e 1,5 s). Devolve a ficha em JSON | ~US$ 0,08/item |
| 7. salvar | script | `npm run fichas -- salvar` valida no Zod, grava, marca `analisada` e tira o item do pedido | 0 |
| 8. relatório | script + Opus | o script agrega (contagens, medianas e "lift" por gatilho/gancho/tipo) e o Opus escreve a leitura (§6) | ~US$ 0,25/relatório |

**Por que Haiku no passo 5:** reduz as imagens enviadas ao Opus de 7 para 2 sem perder o texto da tela. O Opus continua vendo a abertura (o que mais importa para gancho e 5 s). Se a leitura visual ficar pobre, o vídeo passa a mandar as 7 imagens (pergunta 4).
**Idempotência:** o `hash` cobre o insumo; `versaoPrompt` e `versaoVocab` ficam gravados. Mudar o prompt **não** reanalisa nada sozinho: as fichas antigas ganham o selo "versão antiga" e o Oliver decide.

---

## 4. Como o Oliver dispara (sem agendamento)

**Pedido** (`fichas/pedido.json`, mesmo padrão do `AnalysisRequest`):
```ts
FichasPedido = {
  itens: string[],                 // chaves congeladas no clique (o "top 10" vira lista fixa)
  origem: 'selecao' | 'top', rede?: Platform, n?: number, criterio?: 'xPerfil' | 'xMercado' | 'porSeguidor' | 'engajamento',
  reanalisar: boolean,             // default false: itens já analisados são tirados no clique
  relatorio: boolean,              // gerar mini compilado no fim (default true se ≥ 5 itens)
  instrucoes: string,              // "foca nos ganchos", "compara com o mês passado"…
  requestedAt: IsoDateTime, status: 'pendente' | 'rodando',
}
```
**Comandos** (`tools/intel/fichas-cli.ts`, `npm run fichas -- …`):
```
npm run fichas -- fila kz                                  # o que está pedido
npm run fichas -- pedir kz corpora --rede tiktok --top 20 [--criterio xPerfil] [--reanalisar]
npm run fichas -- pedir kz corpora --itens tiktok:769…,youtube:yAx_…
npm run fichas -- preparar kz [corpora|--fila]             # passos 1–5, sem Opus
npm run fichas -- pacote kz corpora tiktok:769…            # imprime o pacote enxuto (o que o Opus recebe)
npm run fichas -- salvar kz corpora <arquivo.json>         # valida e grava
npm run fichas -- relatorio kz corpora --rede tiktok       # agregados (o texto vem do Opus)
npm run fichas -- custo kz                                 # soma por rodada
```
**Dois modos de rodar o Opus** (pergunta 2):
- **A. Claude Code** (padrão do hub, sem chave): "roda a fila de fichas" → skill `referencias` (passo 3 reescrito) → o orquestrador roda `preparar` → **1 subagente `model: "opus"` para cada 5 itens**, até 4 em paralelo. Cada subagente lê `npm run fichas -- pacote …` e grava com `salvar`. No fim, 1 subagente Opus escreve o relatório.
- **B. API direta** (`npm run fichas -- rodar kz --api [--batch]`): `claude-opus-5-5` com saída estruturada (`output_config.format` com o JSON Schema gerado do Zod), prompt de sistema em cache e `effort: "medium"` (o padrão do 5.5; `high` só no relatório). Roda sem sessão aberta e loga o custo real por item (`tools/usage.mjs` já tem a tabela de preços).

---

## 5. Prompt do Opus (esboço)

**Sistema (fixo, em cache; ~3,5 mil tokens com o vocabulário):**
> Você é analista sênior de conteúdo e anúncios para redes sociais (Reels, TikTok, Shorts, Meta Ads), especialista no mercado de SaaS para psicólogas e terapeutas no Brasil. Recebe o pacote de UM conteúdo de concorrente e devolve a ficha em JSON no schema dado.
> Regras:
> 1. **Nunca invente.** Cada afirmação sobre o conteúdo vem de um insumo do pacote (legenda, transcrição com tempo, descrição/OCR de quadro, imagem, métrica). Campo sem evidência = `null` e o motivo em `faltou`. Não deduza fala sem transcrição nem tela sem quadro.
> 2. Gatilhos e ganchos: **só ids do vocabulário**, cada um com o `trecho` literal que o prova. Se nada servir, use `termosNovos` com definição e exemplo (no máximo 2 por item).
> 3. `porQue` é **hipótese** ligada às medidas: × perfil diz se foi bem para aquela conta; × mercado mede tamanho; por seguidor × mercado é a régua mais justa. Amostra pequena (< 10 itens no perfil) = diga isso.
> 4. `adaptar`: ideias para a Kzloo (contexto abaixo) que usem o **padrão**, nunca o texto. Nicho de saúde: sem promessa de resultado clínico, sem paciente exposto, sem depoimento de paciente; fala sobre o CFP só com fonte.
> 5. `riscos`: marque o que o concorrente fez que **nós não devemos** replicar.
> 6. Seja curto: frases de até 20 palavras; nada de teoria.
> Contexto da nossa empresa: <trecho de `context/BUSINESS.md#Posicionamento` e `VOICE.md#Tom`, ~400 tokens>.
> Vocabulário: <JSON dos grupos com id, definição e sinais>.

**Usuário (por item, ~2,5–4 mil tokens):**
```json
{ "kind": "conteudo", "plataforma": "instagram", "formatoMidia": "reel", "duracaoS": 34, "publicadoEm": "2026-09-25",
  "perfil": { "nome": "Sintropia", "seguidores": 53408, "itensNaColeta": 6 },
  "medidas": { "views": 1996, "likes": 103, "comments": 5, "xPerfil": 0.84, "xMercado": 9.6, "porSeguidor": 0.037, "porSeguidorMercado": 1.23, "engajamento": 0.054, "escopoMercado": "formato", "amostraMercado": 24 },
  "legenda": "…", "transcricao": { "fonte": "whisper-small", "segmentos": [{ "ini": 0.0, "fim": 2.1, "texto": "…" }] },
  "quadros": [{ "tMs": 0, "descricao": "…", "ocr": "…", "imagem": true }, { "tMs": 500, "descricao": "…", "ocr": "…" }],
  "regras037": null, "instrucoes": "" }
```
**Saída:** o objeto `FichaCampos` (§1) + `termosNovos` + `confianca` + `faltou`. Na API, a saída é validada pelo schema; no Claude Code, pelo `salvar`.

**Prompt do relatório (resumo):** recebe os **agregados calculados pelo script** (o modelo não faz conta), as fichas da rodada (só `campos`, ~1,2 mil tokens cada) e o relatório anterior do mesmo concorrente e rede, se houver. Escreve as seções do §6, citando o item por chave e sem número que não esteja nos agregados.

---

## 5b. Custo estimado (preços conferidos em 2026-10-08)
Fonte: skill `claude-api` (tabela de modelos, cache de 2026-10-06), que **bate com `tools/usage.mjs`**. Valores em US$ por milhão de tokens:

| modelo | entrada | saída | leitura de cache | Batch API |
|---|---|---|---|---|
| Opus 5.5 (`claude-opus-5-5`) | 4,00 | 20,00 | 0,20 | −50% (desconto padrão do Batch; **conferir** se vale para o 5.5) |
| Sonnet 5.5 | 2,00 | 10,00 | 0,20 | −50% (conferir) |
| Haiku 5.5 | 0,10 | 0,50 | a conferir | −50% (conferir) |

**Imagem:** ≈ largura × altura ÷ 750 tokens (fórmula da documentação de visão; **a conferir** no tokenizer do 5.5). Um quadro de 540×960 dá ≈ 690 tokens.

**Por item de vídeo (Opus, API padrão):**
| parte | tokens | US$ |
|---|---|---|
| sistema + vocabulário (cache lido) | 3.500 | 0,0007 (1ª escrita do cache na rodada: ~0,018) |
| pacote: metadados, medidas e legenda limpa | ~800 | |
| transcrição de 30–60 s (~150 palavras/min) | ~250–450 | |
| descrições/OCR de 7 quadros (Haiku) | ~350 | |
| 2 imagens 540×960 | ~1.400 | |
| **entrada não cacheada** | **~3.000** | **0,012** |
| saída: ficha JSON (~1.500) + raciocínio no esforço `medium` (~1.500–2.500, a medir) | ~3.000–4.000 | 0,06–0,08 |
| **total por item** | | **≈ US$ 0,08** (faixa 0,06–0,10) |
| preparo Haiku (7 quadros + legenda) | ~6.000 entrada / 600 saída | ≈ 0,001 |
| com 7 imagens no Opus, em vez de 2 | +3.500 entrada | +0,014 → ≈ US$ 0,095 |

Anúncio: texto + 1 a 3 imagens, sem transcrição na maioria → **≈ US$ 0,06–0,08**.
**Rodada de 20 + relatório:** 20 × 0,08 = 1,60 + relatório (~30 mil de entrada e ~8 mil de saída com raciocínio `high` ≈ 0,28) = **≈ US$ 1,9** (faixa 1,3–2,5). **Batch API: ≈ US$ 1,0.** Rodar de novo o que já foi analisado custa 0 (o hash pula).
**Pelos subagentes do Claude Code (modo A):** sem cobrança por token, mas cada subagente tem um custo fixo de contexto (~20–30 mil tokens de ferramentas e instruções). Por isso o lote é de 5 itens por subagente. Isso consome a cota da assinatura. O `custo` da ficha grava `via: "claude-code"` e os tokens, sem US$.
Transcrição: 0 em dinheiro. Tempo do faster-whisper `small` em CPU: **a medir na fase B** (estimativa: menos de 1 min por minuto de áudio).

---

## 6. Relatório por concorrente (mini compilado)

**Onde:** `competitors/<id>/relatorios/AAAA-MM-DD-<rede|anuncios>-<escopo>.md` (frontmatter + corpo, como o `competitor.md`). Schema `schema/relatorio.ts`:
```yaml
id: 2026-10-08-tiktok-top20
competitor: corpora
rede: tiktok            # ou anuncios
escopo: top20 | selecao | todos-analisados
itens: [tiktok:7691064446289988884, …]
agregados: { … }        # números do script (o texto nunca traz número fora daqui)
modelo: claude-opus-5-5
custo: { usd: 1.84, via: api }
gerado: 2026-10-08T18:00:00Z
anterior: 2026-09-20-tiktok-top20   # se houver
```
**Corpo (seções fixas):**
1. **Em 5 linhas:** a aposta de conteúdo desse concorrente nessa rede e o que funciona.
2. **Mix × desempenho** (tabela do script): por `tipoConteudo` e por `formato`, com n, mediana × perfil, mediana × mercado, mediana por seguidor × mercado e o melhor item (link).
3. **Gatilhos e ganchos que separam os vencedores:** "lift" = % no quartil de cima (× perfil) ÷ % no resto, só com n ≥ 3. Mais os 3 ganchos literais que mais renderam.
4. **Temas:** o que se repete e o que viralizou fora da curva.
5. **Padrões dos 5 s:** elementos mais frequentes nos vencedores.
6. **Produto no conteúdo:** % sem produto, rodapé, sutil ou central, e o desempenho de cada grupo. (Na Corpora, o meme sem produto domina o TikTok.)
7. **Anúncios** (se a rodada for de anúncios): ângulos, ofertas, longevidade (dias no ar, variações) e o que está "provado" (30+ dias).
8. **Mudou desde o relatório anterior.**
9. **Para nós:** até 5 ideias adaptadas (cada uma com a ficha de origem e o botão "Virar ideia" → `I-NNNN`, origem = ficha + relatório) e o que **não** replicar (`riscos`).
10. **Limites:** tamanho da amostra (Instagram = 6 itens), itens sem transcrição e termos novos propostos.

**Regra de amostra:** com menos de 10 itens o relatório fala em "observações", não em "padrões", e não calcula lift.
**Alimenta:**
- **012:** o "Virar ideia" leva a ficha inteira para o corpo da ideia (gancho, estrutura, 5 s, adaptar), já na ficha de pauta.
- **content-ideas** (Modo 3) e **ads-meta:** passam a ler o relatório mais recente de cada concorrente e os `termosNovos` aceitos. O texto das duas skills precisa ganhar uma linha cada (fase I).
- **039 Panorama** (depois): um bloco "o que funciona no mercado" juntando os relatórios.

---

## 7. Telas (wireframes)

### 7.1 Seleção na aba Conteúdos (sobre a tabela da 038)
```
┌ Concorrentes › Conteúdos ───────────────────────────────────────────────────────────────┐
│ [Buscar…] [Concorrente ▾] [Rede ▾] [Formato ▾] [Ordenar: × perfil ▾]  [Grade|Lista]      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ☑ 3 selecionados · [ScanSearch Analisar 3]  [ListOrdered Top… ▾ 10 | 20]                 │
│   ☐ incluir já analisados (reanalisa: custa de novo)   ≈ US$ 0,24 · ~4 min por item     │
├──┬──────┬──────────────────────────────┬───────┬────────┬────────┬──────────┬────────────┤
│☐ │ mini │ título / gancho              │ rede  │ views  │×perfil │×mercado  │ análise    │
│☑ │ ▣    │ 😔 droga #fyp #meme           │ TikTok│ 126,3k │ 164×   │ …        │ —          │
│☑ │ ▣    │ como BEBER ÁGUA sem…          │ YT    │ 2,1k   │ 1,4×   │ …        │ —          │
│☐ │ ▣    │ Faltam poucas semanas…        │ IG    │ 2,0k   │ 0,8×   │ 9,6×     │ FileCheck2 │
└──┴──────┴──────────────────────────────┴───────┴────────┴────────┴──────────┴────────────┘
```
- "Top…" usa o filtro atual (concorrente e rede) e o critério do Ordenar. Ao clicar, mostra a lista que vai entrar e quantos já estão analisados (que saem, a menos que "incluir já analisados" esteja marcado).
- Depois de "Analisar": o toast diz "Pedido gravado. No Claude Code: *roda a fila de fichas* (ou `npm run fichas -- rodar kz`)". Os itens ganham o selo "na fila" (Lucide `Clock`).
- A coluna **análise** mostra um ícone (`FileCheck2` analisado · `Clock` na fila · `CircleDot` versão antiga) e, ao passar o mouse, o tipo e o gancho.
- Na **Anúncios**, a barra é a mesma (com "Top por dias no ar").

### 7.2 Painel do item (diálogo grande; substitui o `ItemDrawer` quando há ficha, senão mostra o drawer atual + "Analisar este")
```
┌ [Instagram] Reel · Sintropia · 34 s · 25/09/2026 · abrir original ↗          [X] ─────────────┐
│ ┌──────────────┐  HEADLINE (na tela, 0 s)                                     chip: IA         │
│ │              │  "…"                                                                           │
│ │  quadro 0 s  │  GANCHO  "Faltam poucas semanas pro único Retiro…"  [noticia-urgente ▾]        │
│ │              │                                                                                │
│ │ ▸0 ▸0,5 ▸1,5 │  0–5 s  ▕0 s texto-na-tela▕1 s rosto-close▕3 s promessa▕  (linha do tempo)     │
│ │ ▸3 ▸5 ▸meio  │  TIPO [parceria-evento ▾] +oferta · FORMATO [? proposto: teaser-evento ▾]      │
│ └──────────────┘  TEMA  Retiro de ACT para psicólogas (Sintropia como parceira)                 │
│ Views 2,0k   Curt. 103   Com. 5   Eng. 5,4%                                                     │
│ × perfil 0,84 · × mercado 9,6 · por seguidor 3,7% (1,2× mercado)                               │
├─ Resumo │ Roteiro │ Detalhes │ Fonte ──────────────────────────────────────────────────────────┤
│ GATILHOS  [urgencia] [escassez] [exclusividade] [curiosidade] [pertencimento] [+]               │
│           └ passar o mouse: o trecho literal                                                    │
│ CTA       comentar-palavra "comente retiro" · cupom MARCELABOHN (produto no rodapé)             │
│ POR QUE   hipótese: post de evento de terceiro; a Sintropia é coadjuvante; abaixo da mediana…   │
│ ADAPTAR   1. … [Lightbulb Virar ideia]   2. …                                                   │
│ RISCOS    nenhum                                                                                │
└──────────────────────────────────────────────────────────────── [RefreshCw Reanalisar] ─────────┘
```
- **Hierarquia:** em cima, mídia + medidas + headline/gancho/5 s/tipo/formato/tema (o que o Oliver procura de relance). Na aba Resumo: gatilhos, CTA, por quê, adaptar e riscos. Na aba **Roteiro**: a transcrição por bloco (`estrutura.blocos`), com o tempo, e os quadros alinhados. Em **Detalhes**: o resto do §1 (público, consciência, tom, som, ritmo, produto, funcionalidades, oferta, hashtags, autoria). Em **Fonte**: modelo, versões, data, custo, insumos usados, `faltou` e as análises anteriores.
- **Edição:** os campos `F` usam `SelectField` (o da 038 A, com busca e "Propor novo…"); os gatilhos são um multi-select de chips; os textos editam no lugar. Qualquer edição grava em `override` e o chip vira "você". Para voltar ao valor da IA: Lucide `Undo2`.
- **Ícones** (só Lucide): `ScanSearch`, `FileCheck2`, `Clock`, `CircleDot`, `RefreshCw`, `Lightbulb`, `Sparkles` (termo proposto), `Undo2`, `TriangleAlert` (riscos), `Captions` (transcrição), `Film` (quadros).

### 7.3 Relatórios na ficha do concorrente (aba "Redes e conteúdos" ganha a seção)
```
┌ Corpora › Redes e conteúdos ─────────────────────────────────────────────────────┐
│ Relatórios de análise                                   [ScanSearch Nova análise] │
│ ┌────────────┬───────────┬────────────┬──────┬────────┬──────────────────────────┐ │
│ │ data       │ rede      │ escopo     │ itens│ custo  │ em 1 linha               │ │
│ │ 08/10/2026 │ TikTok    │ top 20     │ 20   │ US$1,84│ meme de 6–15 s sem prod… │ │
│ │ 08/10/2026 │ Anúncios  │ seleção    │ 10   │ US$0,71│ criador + cupom + R$ 89  │ │
│ └────────────┴───────────┴────────────┴──────┴────────┴──────────────────────────┘ │
│ (clicar abre o relatório em página: seções do §6, itens citados abrem o painel)  │
└──────────────────────────────────────────────────────────────────────────────────┘
```
"Nova análise" abre um mini diálogo: rede, Top 10/20 ou "todos os não analisados", critério, "gerar relatório", instruções. Grava o `pedido.json`.

---

## 8. Fases (pequenas e testáveis)

| fase | entrega | critério de pronto | reaproveita |
|---|---|---|---|
| **A. Ficha e vocabulário** | `schema/ficha.ts`, `schema/relatorio.ts`, `library/analise/vocabulario.json` (+ schema), grupos `tema`/`angulo`/`publico` em `companies/kz/tags.yml`, `npm run fichas -- salvar` e `validate` | a ficha de exemplo do §9 convertida em JSON passa no `npm run validate`; um enum fora do vocabulário falha com mensagem clara | `FormatBlock`, `CONTENT_TYPES`, 037 §5 |
| **B. Preparar (script)** | `fichas -- preparar` e `pacote`: legenda do YT, áudio + faster-whisper, quadros, cenas, hash, `data/intel/` fora do git | 3 itens reais (1 short do YT, 1 reel do IG e 1 TikTok da Corpora) com transcrição e quadros; 2ª execução não refaz nada; tempo por item medido e anotado | passo 3 da `referencias`, `media.ts` |
| **C. Analisar (Opus)** | prompt v1 + skill `referencias` §3 reescrita (modos A e B) + custo logado | **5 itens reais** analisados; o Oliver corrige os campos que achar errados e medimos a % de campos alterados (meta: < 20% nos campos ★); custo real dentro de ±50% do §5b | `usage.mjs`, padrão de subagentes da `analise-concorrentes` |
| **D. Painel do item** | diálogo do §7.2 (leitura + edição com override) | editar 3 campos, reanalisar o item: as 3 edições continuam e o "a IA agora diz" aparece onde divergiu; print antes/depois | `ItemDrawer`, `SelectField` (038 A), `OutlierBadges` |
| **E. Seleção e fila no app** | checkbox, "Top 10/20", "incluir já analisados", `pedido.json`, selo "na fila", `fichas -- fila/rodar` | selecionar 3 + Top 10 grava a lista certa; os já analisados ficam fora sem o toggle; rodar a fila esvazia o pedido | `AnalysisRequest`, tabela da 038 B |
| **F. Relatório** | `fichas -- relatorio` (agregados) + texto do Opus + lista na ficha do concorrente | relatório "Corpora TikTok top 20" com os números da tabela batendo com uma conta manual em 2 linhas; nenhum número no texto fora dos agregados | B2 (`withMarketOutlier`) |
| **G. Anúncios** | `kind: anuncio`, insumos com regras e histórico da 037, `AdMark.override` lido e escrito pelo painel | 10 anúncios da Corpora analisados; funil/tipo da 037 confirmados ou corrigidos com motivo; editar o funil no painel aparece igual na aba Anúncios | 037 A, B e D |
| **H. Vocabulário vivo** | aceitar/recusar termos novos (painel e relatório) e "virar formato rascunho" | aceitar 1 formato proposto cria `library/formatos/<id>/formato.json` com a ficha como referência; recusar some das próximas propostas | galeria de formatos (027) |
| **I. Ligações** | "Virar ideia" com a ficha; `content-ideas` e `ads-meta` leem o relatório mais recente | rodar a `content-ideas` num pedido de teste cita o relatório de origem | 012, `useMakeIdea.ts` |

Ordem: **A → B → C** (valida a qualidade da ficha antes de qualquer tela) **→ D → E → F → G → H → I**. As fases A e B não gastam token. Na C, o Oliver dá o aval da ficha.

---

## 9. Análise de exemplo (feita com o que existe no snapshot)

**Item:** Sintropia (concorrente direto), Instagram, reel `DdtuawFvkXi`, 34 s, publicado em 25/09/2026, <https://www.instagram.com/reel/DdtuawFvkXi/>. Coleta `snapshots/instagram-sintropia-psi/2026-10-08T15-12-15.json`.
**Escolha:** é o reel de concorrente direto com a legenda mais longa (904 caracteres), o que permite testar a ficha só com texto. Vídeo não baixado.
**Medidas (calculadas agora, com a mesma regra da B2):**
- views 1.996 · curtidas 103 · comentários 5 · seguidores 53.408.
- **× perfil 0,84**: mediana dos 4 reels com views do perfil = 2.368,5.
- **× mercado 9,6**: escopo formato, 24 reels de IG de 8 concorrentes, mediana 208,5.
- **por seguidor 3,7%**, **1,23× o mercado** (mediana 3,0%).
- **engajamento 5,4%**: (103 + 5) ÷ 1.996.

Marcadores: `⟨T⟩` = precisaria da transcrição · `⟨Q⟩` = precisaria dos quadros · `(h)` = hipótese.

| campo | valor | origem |
|---|---|---|
| plataforma · formato de mídia · duração | instagram · reel · 34 s | S |
| tema | Retiro Experiencial em ACT para psicólogas, com a Sintropia como marca parceira · tag `evento-formacao` (proposta) | O |
| mensagem | "Últimas vagas no retiro exclusivo para psicólogas; a Sintropia vai aparecer com surpresa." | O |
| autoria | `colab` (h): a legenda fala na voz do retiro ("nosso evento", "marcas parceiras… @sintropia.psi") e traz o cupom de uma pessoa (MARCELABOHN). Conferir no original se é post colaborativo | O |
| tipoConteudo | principal **`parceria-evento`** (proposto, §1.4.1) · secundário `oferta` | O |
| formato | sem par no catálogo → **proposto `teaser-evento`** (h). O formato visual real é ⟨Q⟩ | O |
| estiloProducao | ⟨Q⟩ | — |
| headline (na tela) | ⟨Q⟩. Pela legenda: "Faltam poucas semanas pro único Retiro Experiencial em ACT do Brasil" (`fonte: legenda`) | O |
| gancho.texto | legenda: "Faltam poucas semanas pro único Retiro Experiencial em ACT do Brasil ocorrer!" · gancho do vídeo ⟨T⟩⟨Q⟩ | O |
| gancho.tipo | `noticia-urgente` (contagem regressiva) + `curiosidade-loop` no 2º parágrafo · `canal: legenda` (só o da legenda é confirmado) | O |
| retencao5s | ⟨T⟩⟨Q⟩: não dá para afirmar sem vídeo. `confianca.retencao: baixa`, `faltou: [sem-transcricao, sem-quadros]` | — |
| gatilhos | `urgencia` ("Faltam poucas semanas") · `exclusividade` ("único… do Brasil"; "exclusivo para Psicólogas e estudantes… mulheres") · `curiosidade` ("O que será que a @sintropia.psi está aprontando"; "cronograma é sempre SURPRESA") · `escassez` ("são as últimas vagas!!!") · `pertencimento` ("Psicólogas… de qualquer abordagem teórica") · `aspiracao` ("tempo de qualidade pra vocês cuidarem de si") · `compromisso` ("comente retiro") · `gratuidade-sem-risco` ("15 dias grátis") · `ancoragem-preco` ("100 reais de desconto no plano anual") | O |
| estrutura.macro | `anuncio-evento` (pela legenda) · blocos do vídeo ⟨T⟩ | O |
| estrutura da legenda | urgência → parceria → curiosidade → promessa de experiência → público → CTA com escassez → oferta do produto entre parênteses → hashtags | O |
| cta | principal `comentar-palavra` "comente retiro" (para o **evento**) · secundário `cupom` MARCELABOHN (para a **Sintropia**), entre parênteses no fim | O |
| produto.presenca | `rodape`: a Sintropia aparece como @ e no parêntese final; vídeo ⟨Q⟩ | O |
| produto.funcionalidades | nenhuma citada | O |
| oferta | `teste-gratis` 15 dias + `cupom` R$ 100 no plano anual · trecho: "aproveite 15 dias grátis e use o cupom MARCELABOHN" | 037 (regras) + O |
| publico | `psicologo-autonomo` + `estudante` (só mulheres) · consciência `inconsciente` (para a Sintropia; quem lê veio pelo retiro) | O |
| tom | `aspiracional` + `urgente` | O |
| som · legendaTela · ritmo | ⟨T⟩ · ⟨Q⟩ · ⟨Q⟩ | — |
| hashtags | #retiroparapsicologas #retiroexperiencial #terapiadeaceitacaoecompromisso #flexibilidadepsicologica | S |
| porQue (h) | Abaixo da mediana da própria conta (0,84×) e com a pior taxa de comentário do perfil (5 comentários para um CTA de "comente retiro"): o assunto é de terceiro, para um nicho (ACT, só mulheres), e a marca entra como coadjuvante. Por seguidor fica na média do mercado (1,2×): o alcance foi o normal da base, sem extrapolar | O |
| adaptar | 1. **Parceria com evento ou formação de psis** (TCC, ACT, supervisão), com cupom do organizador para medir quem veio dali; o padrão "cupom com nome de pessoa" se repete no mercado (Sintropia MARCELABOHN, Corpora CIBERPSI) · 2. Se fizermos, **um único CTA**: aqui dois CTAs (evento e produto) disputam a atenção, e o do produto fica num parêntese · 3. Formato `fmt-post-frase` ou story para "kit da participante" (planner de sessões), sem prometer resultado | O |
| riscos | nenhum de saúde. Ressalva de marca: público restrito a mulheres (não replicar sem decidir) | O |
| replicavel | 2: depende de ter um evento parceiro, mas o mecanismo (parceria + cupom nominal) é simples | O |
| confianca | texto **alta** · visual **nula** · retenção **nula** | O |
| faltou | `sem-transcricao`, `sem-quadros` | S |
| termosNovos | `tipoConteudo: parceria-evento` · `formato: teaser-evento` · `tema: evento-formacao` | O |

**O que o exemplo mostra:**
1. Só com a legenda, a ficha já entrega bem tema, tipo, gatilhos com trecho, CTA, oferta, público, por quê e adaptar: são 9 dos 13 campos ★.
2. **Gancho do vídeo, headline na tela, 5 s, estilo e formato dependem de transcrição e quadros.** Num reel de 34 s com legenda longa, é provável que o vídeo diga outra coisa. Daí os passos 3–5 do §3 serem obrigatórios para vídeo, e não opcionais.
3. As medidas contam histórias opostas (0,84× perfil × 9,6× mercado). Sem a leitura da B2 (por seguidor × mercado = 1,2×), o "× mercado" sozinho enganaria. O prompt precisa da regra 3.
4. Apareceram 3 termos novos num único item. O vocabulário inicial vai crescer rápido nas primeiras rodadas, por isso o aceite em lote no relatório (pergunta 6).
5. Um padrão de mercado só aparece **cruzando fichas** (cupom nominal na Sintropia e na Corpora). Isso é trabalho do relatório, não da ficha.

---

## 10. Perguntas para o Oliver (só as que mudam o desenho)
1. **Instagram com 20 itens:** a coleta pública traz só 6 por perfil. Liberar o Apify (`APIFY_TOKEN`, pago por uso) para os perfis analisados, ou "top 20" vale só para YouTube e TikTok e o Instagram fica com os 6?
2. **Onde roda o Opus:** pelos subagentes do Claude Code (sem custo por token, consome a cota da assinatura, precisa da sessão aberta) ou pela API com chave (~US$ 1,9 por rodada de 20, ~US$ 1 no Batch, roda sozinho pelo terminal)? Dá para ter os dois, mas o padrão muda a fase C.
3. **Vídeo baixado:** apagar o MP4 depois de extrair áudio e quadros (economiza disco) ou guardar fora do git para rever depois?
4. **Imagens para o Opus:** 2 quadros + descrições do Haiku (padrão, ~US$ 0,08/item) ou os 7 quadros direto (~US$ 0,095/item, leitura visual melhor)?
5. **037 F (IA barata em todo anúncio):** continua como triagem em lote (Haiku, centavos) ou a 040 substitui, com Opus só no anúncio selecionado?
6. **Termos novos:** aceitar um a um no painel ou em lote na tela do relatório (recomendo em lote)?
7. **Relatório:** um arquivo por rodada (histórico, pode haver vários por semana) ou um "vivo" por concorrente e rede, que se atualiza e guarda versões?
