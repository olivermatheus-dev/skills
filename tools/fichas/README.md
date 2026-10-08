# Fichas de análise (tarefa 040, fases A e B)

Uma ficha por conteúdo/anúncio de concorrente: `companies/<empresa>/competitors/<id>/fichas/<plataforma>__<itemId>.json`
(schema em `schema/ficha.ts`; vocabulário em `library/analise/vocabulario.json`; temas, ângulos e públicos em `companies/<empresa>/tags.yml`, campo `grupo`).
Desenho: `roadmap/tasks/040-analise-de-conteudos-e-anuncios/DESENHO.md`. Esta pasta não chama LLM.

```
npm run fichas -- preparar <empresa> <concorrente> <plataforma:id>… [--reanalisar]
npm run fichas -- pacote   <empresa> <concorrente> <plataforma:id>
npm run fichas -- quadros  <empresa> <concorrente> <arquivo.json>   # descrição/OCR dos quadros (Haiku) → insumos
npm run fichas -- salvar   <empresa> <concorrente> <arquivo.json> [--reanalisar]
npm run fichas -- relatorio <empresa> <concorrente> [--rede tiktok] [--itens a,b | --top 10] [--rodada id] [--pacote]
npm run fichas -- relatorio <empresa> <concorrente> --rodada <id> --leitura <arquivo.json>
npm run fichas -- termo    <empresa> aceitar|recusar <grupo>:<valor> [--de <concorrente> --rodada <id>] [--motivo "…"]
npm run fichas -- validar                     # o mesmo roda dentro do npm run validate
```
Chave = `<plataforma>:<idDoItem>` (`youtube:cqGT7R6JImo`, `tiktok:7690…`, `instagram:DeKnYQFRBpY`), a mesma do `marks.json`.

## preparar (script, sem LLM, idempotente)
1. **YouTube:** legenda automática (`yt-dlp --write-auto-subs`, `pt-orig`/`pt`) vira a transcrição.
2. **Vídeo** em até 720p (uma vez só) → `ffmpeg` extrai o áudio (mono, 16 kHz) → **faster-whisper `small`, pt** (só se não veio legenda). Sem fala detectada → `faltou: audio-sem-fala`.
3. **Quadros** a 540 px: 0 · 0,5 · 1,5 · 3 · 5 s + meio + último + até 3 cortes de cena dos 5 s iniciais (detecção `scene>0.3`, que também dá `cenas[]` = ritmo).
4. **O vídeo é apagado** (decisão do Oliver). Ficam áudio, quadros e legenda bruta em `data/intel/<empresa>/<concorrente>/<plataforma>__<id>/` (**fora do git**, regra `data/intel/` no `.gitignore`); a transcrição, o hash e os tempos vão **dentro da ficha**.
5. **Idempotência:** `insumos.hashEntrada` = sha1(id + legenda + duração + url). Mesmo hash e quadros presentes → pula sem baixar nada. Preparo parcial (`midia-indisponivel`) tenta de novo. `--reanalisar` refaz tudo; `salvar` recusa sobrescrever análise existente sem a mesma flag (a antiga vai para `anteriores`, o `override` do Oliver nunca é tocado).
6. As medidas (views, × perfil, × mercado, por seguidor…) usam a mesma conta do app (`buildRows` + `withMarketOutlier`).

## quadros (Haiku, fase C)
Arquivo `{ "<chave>": [{ "tMs": 0, "descricao": "…", "ocr": "…" | null }] }` (vale com várias chaves; só grava as do concorrente informado). O `pacote` passa a levar essas descrições, e o Opus abre só as 2 imagens marcadas.

## salvar (como o Opus grava, fase C; prompt em `prompt-analise.md`)
Arquivo `{ "key": "instagram:ID", "analise": { versaoPrompt, modelo, termosNovos, campos: {…} } }` (ou os campos da análise soltos ao lado do `key`).
Valida o schema e **todo valor categórico contra o vocabulário** (mais `tags.yml` e `library/formatos/`); erro sai com o campo, o valor, "você quis dizer…" e a lista aceita. Valor que não cabe entra em `termosNovos` (vale como "proposto"). Marca o item como `analisada` no `marks.json`.

## Dependências (uma vez)
- `ffmpeg` e `ffprobe` no PATH; `yt-dlp` (`python -m pip install -U yt-dlp`).
- `python -m pip install faster-whisper` (já instalado; o modelo `small` baixa ~460 MB na 1ª vez e fica em cache).
- **YouTube:** o cliente web do yt-dlp hoje falha com "The page needs to be reloaded" (SABR). O preparo usa `player_client=android_vr,tv,web`, que funciona na 2025.10.14.
- **TikTok:** o extrator do yt-dlp 2025.10.14 (último que roda no Python 3.9) não acha os dados da página. Plano B em `tiktok.ts`: lê a página pública e baixa o MP4 direto (sem login). Um Python ≥ 3.10 com yt-dlp atual provavelmente resolve de vez.
- **Instagram:** o vídeo exige login. Defina `YTDLP_COOKIES_FROM_BROWSER=chrome` (app → Configurações da empresa, ou `.env`) para o preparo baixar reels; sem isso a ficha sai parcial (legenda + miniatura, `faltou: midia-indisponivel`). Carrossel e post usam só a miniatura.

## Tempos medidos (CPU, `small`, vídeos de 6–24 s)
Short do YouTube com legenda: ~12 s. TikTok com fala: ~8–11 s (baixar 2–6 s, Whisper 4–5 s, quadros 1–1,5 s). 2ª execução: 0 s por item.

## relatorio (fase F)
Um relatório por rodada em `competitors/<id>/relatorios/AAAA-MM-DD-<rede>-<escopo>.md` (schema `schema/relatorio.ts`; o corpo é gerado, o app lê o frontmatter). O mais recente do concorrente fica `emDestaque`.
1. **Script** (`relatorio.ts`): lê as fichas analisadas com `camposEfetivos` (as correções do Oliver mandam) e as medidas da última coleta (a mesma conta do app). Agregados por tipo, formato, tipo de gancho, estrutura, tema, gatilho, elementos dos 5 s e presença do produto: n, itens, melhor item e medianas de × perfil, × mercado, por seguidor (e × mercado) e engajamento. Regras: grupo com n < 3 = fraco (⚠); rodada com < 10 itens = "observações", sem quartil de vencedores e sem lift; sem 3 concorrentes na rede, o × mercado fica indefinido e o relatório avisa. `--pacote` imprime o que o Opus lê.
2. **Leitura do Opus** (`--leitura`, JSON `{ modelo, leitura: { resumo[≤5], padroes[], copiar[], evitar[], ideias[≤5], limites[] } }`): recusa número que não esteja nos agregados (arredondado, em % ou "mil" vale) e item fora da rodada. O `validate` refaz as duas conferências.
3. **Termos novos**: os `termosNovos` das fichas da rodada que ainda não existem nem foram recusados. Aceitar (app ou `termo`): grupo do vocabulário → `vocabulario.json` (status `proposto`, versão +1); `formato` → `library/formatos/<id>/formato.json` como `rascunho` com as fichas como referência; `tema`/`angulo`/`publico` → `tags.yml` (comentários preservados). Recusar → `recusados` (some das próximas propostas).
4. **No app:** ficha do concorrente → Redes e conteúdos → Relatórios de análise. "Gerar relatório" escolhe rede e fichas e abre o Claude Code num terminal (`openTerminal`, o mesmo do Rodar IA → terminal) com a skill `referencias`, passo 5; "Só o comando" mostra a linha para rodar à mão.

## Quadros já descritos sobrevivem ao preparo
Cada quadro guarda `assinatura` (16×16 em cinza, 1 bit por pixel). Um novo `preparar` (inclusive `--reanalisar`) mantém descrição e OCR do Haiku nos quadros cuja imagem não mudou (até 20 de 256 bits diferentes, no mesmo instante); só os novos ou diferentes voltam para o passo `quadros`. Capa/miniatura (Instagram sem vídeo, post, carrossel) é reduzida a 540 px de largura, como os quadros do vídeo.

## Fila (fase E): o app pede, o Claude Code roda
- **Pedido:** `competitors/<id>/fichas/pedido.json`, **um por concorrente** (o mesmo arquivo do "Analisar este" da fase D; mora ao lado das fichas e os comandos acima já trabalham por concorrente). A lista é fixada no clique (o "Top 10" vira chaves). Sem "reanalisar", os já analisados nem entram.
- **No app:** Concorrentes → Conteúdos (ou a ficha do concorrente → Redes e conteúdos) → caixas na lista ou **Analisar ▾ → Top 10/20** (pela ordem e pelos filtros atuais) → barra embaixo → **Analisar** → **Rodar agora** (ou **Só pôr na fila**). Roda pelo mesmo caminho do Rodar IA: `tools/heartbeat.mjs --run --slug <slug> --fichas` em segundo plano, mesmo lock (`logs/heartbeat/.lock`, `kind: "fichas"`); a faixa mostra a etapa ao vivo e tem **Parar**.
- **Pelo terminal** (mesma fila):
  - ver o que está pedido: `node tools/fichas-fila.mjs fila <slug>`
  - rodar tudo em segundo plano, igual ao botão: `node tools/heartbeat.mjs --run --slug <slug> --fichas`
  - numa sessão do Claude Code: **"roda a fila de fichas da <slug>"** (skill `referencias`, passo 3)
- **Quem roda segue o passo 3 da skill:** preparar → quadros (1 subagente Haiku para a rodada inteira) → pacote → análise (subagente Opus, até 5 itens cada) → salvar → `node tools/fichas-fila.mjs tirar <slug> <concorrente> <chave>`; no começo de cada etapa, `node tools/fichas-fila.mjs passo <slug> <etapa> [chaves]` (é o que a faixa do app mostra).
- **Fecho:** ao sair o Claude (ou no Parar), `fechar` tira da fila tudo o que ficou analisado (com "reanalisar", só análise posterior ao pedido), devolve o resto a `pendente` e grava `logs/fichas/<slug>-ultimo.json` (o app avisa e abre o painel do primeiro feito). Rodada que morreu sem fechar volta a `pendente` sozinha na próxima leitura do app. Se a sessão rodou só pela frase, rode `node tools/fichas-fila.mjs fechar <slug>` no fim.
- **Tempo e custo medidos (2026-10-08, 3 rodadas de 1 TikTok da Corpora):** 2,7 · 8,5 · 7,4 min. O app estima ~5 min + 1,5 min por item e ~US$ 0,08 por item (equivalente na API, §5b; pela assinatura não há cobrança por token, consome a cota).

## Anúncios (fase G)
Mesma ficha, mesmo fluxo, `kind: "anuncio"` e chave **`meta-ads:<id da Biblioteca>`** (arquivo `meta-ads__<id>.json`). A marca do Oliver da 037 (`ads/marks.json`) usa `meta:<id>`: os dois lados se ligam só pelos conversores de `schema/ads-marks.ts` (`fichaKeyDeAd`, `adIdDeFichaKey`, `markKeyDeFichaKey`). Código em `anuncios.ts`.
- **preparar** (`npm run fichas -- preparar kz corpora meta-ads:<id>…`): o anúncio vem da coleta mais recente que o traz (`ads/<data>.json`; sem ela, da cópia `frozen` que o Oliver guardou ao salvar). Imagem/carrossel: a miniatura reduzida a 540 px é o **quadro 0** (carrossel = só a capa). Vídeo: só se a coleta trouxe `media.videoUrl`; baixa direto, tira áudio e quadros como no resto; se falhar, miniatura. `legendaLimpa` = título + texto + descrição + botão. Hash de entrada = id + campos do anúncio (idempotente). Não há `sem-transcricao` em anúncio de imagem.
- **medidas**: sem views. `medidas.historico` = o histórico da 037 (`adsHistory`: diasNoAr, variações do Ad, irmãos, saiu do ar, reapareceu), congelado quando a análise é salva.
- **pacote**: além do que sai para conteúdo, `anuncio` (texto, título, descrição, botão, plataformas, início, variações), `destino` (link, tipo, domínio, UTM), **`regras`** (o `ads-classify`: funil, tipo e objetivo com valor, confiança e **motivo**; oferta; funcionalidades), **`override037`** (o que o Oliver já corrigiu no `marks.json`, mais a nota), `historico` e `landing` resumida (`analysis/landing.json` do concorrente, para a `coerenciaLP`).
- **salvar**: a IA confirma ou corrige. `funil`, `tipoAnuncio` e `objetivo` são obrigatórios e seguem a lista da 037 (`topo/meio/fundo`; `oferta/conteudo/prova-social/demonstracao/institucional/isca/remarketing/indefinido`; `trafego/cadastro/mensagem-whatsapp/lead/instalacao-app/engajamento/indefinido`). Onde discorda da regra, `correcaoRegra: [{ campo: "funil|tipo|objetivo", regra, ia, motivo }]` (o script confere `regra` com a regra de verdade e recusa divergência sem motivo). **Não** grava status em `marks.json`: o `marks.json` de conteúdo não tem chave de anúncio, e "analisada" de anúncio = ficha com `analise`.
- **No app** (ordem fixa por campo): **você** (`ads/marks.json`, editado no painel do anúncio) > **IA** (`analise.campos` da ficha) > **regra**. A aba Anúncios (chips, filtros, ordenação) e o painel mostram o chip de origem ("você" / "IA" / regra com a confiança). Editar funil/tipo/objetivo escreve **só** no `marks.json`; os outros campos (gancho, headline da arte, ângulo, prova, gatilhos, adaptar) vão para `ficha.override`, como no conteúdo. Pedido: botão "Analisar este" no painel ou "Analisar os N primeiros" na aba (grava `pedido.json`; a faixa da fila roda).
- **relatorio** (`npm run fichas -- relatorio kz corpora --rede anuncios`): agregados por funil, tipo, objetivo, ângulo, tipo de gancho, prova, gatilho e formato do criativo; a medida é a mediana de `diasNoAr` e de variações (não há views). Lê funil/tipo/objetivo já resolvidos (você > IA > regra). Mesmas regras de amostra (< 10 itens = observações; grupo com n < 3 = ⚠). A tela de relatórios mostra a rede "Anúncios", com as colunas de views vazias (a tabela própria de anúncios fica para depois).
- **Limites**: carrossel só tem a capa; sem gasto, alcance nem conversão: longevidade é sinal indireto (anúncio barato ou institucional também fica no ar); o download de vídeo de anúncio não foi exercitado com dado real (a coleta atual da Corpora só tem imagem e carrossel).

## Vocabulário vivo (fase H)
Uma porta só para decidir um termo novo: `tools/fichas/decidir.ts` (CLI `termo`, painel da ficha e relatório chamam a mesma função; leitura e troca em `core/termos.ts`).
- **Aceitar:** como na fase F; termo de `formato` vira `library/formatos/<id>/formato.json` rascunho com TODAS as fichas do projeto que o propuseram como referência (botão "Virar formato rascunho"); nunca sobrescreve formato existente.
- **Recusar** (`termo <empresa> recusar <grupo>:<valor> --substituto <termo>`): `recusados` ganha `substituto` (o prompt manda a IA usá-lo) e, em TODAS as fichas do projeto, o campo que usava o termo passa a usar o substituto **como edição do Oliver** (`override` + data em `override.editados`, só nos caminhos afetados, valor efetivo: o que ele já trocou não é tocado). A análise da IA não muda e "voltar ao da IA" restaura o termo recusado (continua válido: a própria análise o propõe). Assim vale "você > IA > regra", o histórico fica e os relatórios novos já agregam pelo substituto. Sem `--substituto` o termo só deixa de ser proposto e o aviso diz quantas fichas ainda o usam; recusar de novo com substituto reetiqueta. `funil` não reetiqueta (o Oliver o corrige no marks.json da 037).
- **Painel:** selo "termo novo" ao lado do chip que usa o termo (e a lista "Termos novos propostos"): Aceitar (1 clique) ou Recusar → diálogo com o substituto mais provável já escolhido (palavras em comum com nome/definição dos verbetes do grupo, ponderadas pela raridade; sem nada em comum, o mais usado). Rotas: `GET /api/projects/:slug/termos/:grupo/:valor`, `POST /api/projects/:slug/termos/decidir`.
- **`faltou: so-capa`:** carrossel (post ou anúncio) só tem a capa; o `preparar` marca nos insumos e o prompt manda a IA repetir em `campos.faltou` (em vez de escrever em `mensagem`).
