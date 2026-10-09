# Variantes por script (tarefa 045 B)

Depois do aval da base (v1 montada com blocos), as variantes saem **sem LLM**: o `projeto.json` diz os eixos e as opções, o `variantes.mjs` monta uma timeline por combinação, gera as falas que faltam (cache), ancora a trilha no corpo, roda sfx → mix → render de rascunho.

```
node tools/video-kit/scripts/variantes.mjs <pasta> --listar              # combinações da rodada atual
node tools/video-kit/scripts/variantes.mjs <pasta> [--rodada r2|--matriz] [--so id1,id2] [--sem-render] [--only=9x16] [--final]
```
Node 22 (o HyperFrames recusa o 20). No terminal do Bash: `fnm exec --using 22 node …`.

## projeto.json (ao lado da timeline.json aprovada, que é a base)
```json
{
  "nome": "kz-apresentacao",                       // prefixo do nome do anúncio/arquivo
  "base": "timeline.json",
  "trilha": { "ancora": "s2", "respiro_compassos": 2, "ancora_fim": "s7", "andamento_max": 0.15 },
  "limites": { "gancho_s": 3, "abertura_max_s": 5, "max_s": 45 },   // opcional (QC de sincronia)
  "voz": "edge-thalita",                           // opcional; sem eixo voz = draft do brand/voices.json
  "eixos": {
    "abertura": [{ "id": "pergunta", "cena": "s1", "falas": { "f1": "texto falado" },
                   "on_screen": "a|b", "use": "abertura/…", "params": {}, "cues": { "troca": "f1:ainda", "entra": { "at": 0.02 } } }],
    "voz":      [{ "id": "thalita", "voz": "edge-thalita" }]
  },
  "rodada": "r1",
  "rodadas": { "r1": { "abertura": ["pergunta", "…"], "voz": ["thalita"] } },   // ou lista [{ abertura, voz }]
  "ajustes": { "<id-da-variante>": { "scenes": { "s1": { "tail": 0.4 } }, "events": { "e2": { "offset": -0.2 } } } }
}
```
- **Opção de eixo = remendo pequeno**, nunca HTML: `voz` (todas as falas), `falas` (texto, ou `{ text, say }`), `cenas: { s1: {…} }` ou o atalho `cena` + campos da cena (`use`, `on_screen`, `params`, `lead`, `tail`…). `cues` move o evento da cena com aquele `cue` (string = palavra `"f1:x"`; objeto = `at`/`before_end`/`offset`); cue que não existe vira evento novo `<cena>-<cue>`.
- Eixo não citado na rodada fica com a 1ª opção. `--matriz` = todas as combinações.
- Id da variante = `<eixo>-<opção>__…` (ex.: `abertura-pergunta__voz-thalita`); nome do arquivo/anúncio = `<nome>__<id>-<formato>-rascunho.mp4`.
- **Abertura nova barata:** se o bloco já existe, é só texto (fala + `on_screen` + palavras dos cues). Ideia visual nova = 1 bloco novo no projeto (`<pasta>/blocos/`), o resto continua por script.

## O que o script garante
- **Cache de falas** por (texto + voz + ajustes da voz) em `<pasta>/audio/cache/vo/<voz>/`: 3 aberturas × 3 vozes geram 9 falas de abertura + 3 corpos, não 9 locuções inteiras. A fala da base é reaproveitada quando texto e voz batem.
- **Só voz de rascunho** (`edge-*`, `win-*`). Voz final (ElevenLabs) só nas aprovadas: o script recusa e manda para a skill `elevenlabs`.
- **Trilha ancorada:** a trilha sintetizada vira uma trilha-mãe com `respiro_compassos` a mais no começo (`audio/cache/trilha-<hash>/`); cada variante pula (`music.start`) até a cena-âncora cair no mesmo ponto da música que na base. Abertura mais longa que o respiro → aviso. Trilha do catálogo: só o pulo.
- **Tudo reencaixa** pelo `layout()` (cenas pelas falas, eventos pelas palavras), os SFX seguem os ids dos eventos, os blocos do projeto e `data/`/`assets/` vêm da origem (`timeline.origem`).
- Uma variante que falha não derruba as outras: vai para `variantes/indice.json` com `erro`.

## Sincronia (QC por variante, fase C)
Toda variante passa por `montar → QC → correção automática (até 3 voltas) → efeitos/mix/render → QC técnico do MP4`. Módulo: `tools/video-kit/scripts/sincronia.mjs` (também roda avulso em qualquer vídeo: `node tools/video-kit/scripts/sincronia.mjs <pasta>`, depois de `produce.mjs --build-only`).
```
node tools/video-kit/scripts/variantes.mjs <pasta> --matriz --qc        # só monta e confere (9 variantes ≈ 30 s), sem render
node tools/video-kit/scripts/variantes.mjs <pasta> --relatorio [id]      # o relatório curto de cada variante com pendência
```
**A base aprovada é o gabarito:** o que já acontecia nela sai como "herdado" e não vira aviso; só conta o que a variante piorou. Medidas da base em cache (`variantes/qc-base.json`, fora do git).

| regra | o que confere | corrige sozinho |
|---|---|---|
| `cue-fora` | evento preso a palavra cai fora da cena que o bloco espera (o compor recusaria) | `offset` do evento, se passou por pouco do início da cena |
| `min_s` | cena abaixo do `min_s` do bloco | `min` da cena |
| `leitura` (tela) | texto na tela ≥ max(1 s; 0,3 s × palavras) desde a 1ª palavra e a última palavra ≥ 0,5 s antes de sumir ou recuar (Playwright, quadro a quadro) | `tail` da cena (até +0,8 s), quando o texto sai no fim da cena; no meio da cena vai ao LLM com a dica do evento que o tira |
| `area-segura` (tela) | texto-chave fora da área segura do formato (`knowledge/video/REGRAS.md` §3; anúncio 9:16 até y 1250) | — |
| `colisao` (tela) | texto coberto ≥ 10% por cartão, fragmento ou outro texto por ≥ 0,2 s (brilho e desfoque decorativos não contam) | — |
| `gancho` | a 1ª frase da tela completa em ≤ 3 s (`limites.gancho_s`) | — |
| `abertura`, `duracao` | início do corpo ≤ `limites.abertura_max_s` (5 s no anúncio), total ≤ `limites.max_s` | — |
| `parado` | cena sem nada novo > 3 s (e pior que a base) | — |
| `texto-fala` | palavra na tela que a fala não diz (entra sem voz) | — |
| `trilha` | abertura maior que o respiro, trilha acabando antes do vídeo, fim fora do ponto da base | andamento (ver abaixo) |
| `tecnico` | o `tools/video/qc.mjs` no MP4 (loudness −14 LUFS, true peak, BT.709, quadro preto, congelado…) | — |

**Trilha com duas âncoras:** o corpo (`trilha.ancora`, padrão a 2ª cena) e o cartão final (`trilha.ancora_fim`, padrão a última cena; `null` desliga) caem no mesmo ponto da música que na base. A trilha-mãe é sintetizada no andamento da variante (até `trilha.andamento_max` = 15%; cache por 0,1 BPM). Ex.: base com a Carla a 84 BPM → Thalita ≈ 85, Francisca ≈ 91; o "resolve" cai no cartão final com erro < 0,01 s.

**Relatório para o LLM** (`variantes/<id>/sincronia.md`, ≈ 500–900 tokens, meta ≤ 2 mil): só o que o script não resolveu, as falas da cena com o tempo de cada palavra, os eventos, a opção do eixo e o formato da resposta. O LLM responde com **um ajuste JSON**:
- só desta variante → `projeto.json > ajustes["<id>"]` = `{ "scenes": { "s2": { "tail": 0.5 } }, "events": { "e5": { "word": "f2:pacientes" } }, "vo": { "f2": { "rate": "-10%", "say": "…" } } }` (`por_que` livre ao lado);
- vale para todas as variantes de uma opção (ex.: uma voz rápida demais) → na **opção do eixo**: `{ "id": "francisca", "voz": "edge-francisca", "rate": "-8%", "falas": { "f2": { "say": "Agenda de um lado. Informações…", "rate": "-12%" } } }`.
Alavancas de voz de rascunho: `rate` (por fala ou na opção de voz; edge: `"-10%"`) e `say` com **ponto final** onde precisa de pausa (o edge quase ignora reticências). Depois: `variantes.mjs <pasta> --so <id>` (ou `--qc` para conferir antes de renderizar).

## Saída
`<pasta>/variantes/<id>/timeline.json` (gerada; não editar: mude o `projeto.json` e rode de novo) · `sincronia.json` (status ok/aviso/erro, correções automáticas, problemas) · `sincronia.md` (só com pendência) · `audio/` · `render/` · `exports/` · `variantes/indice.json` (escolhas, duração, início do corpo, MP4s, `qc: { status, corrigidos, pendentes }`) · `variantes/aval.json` (aval do Oliver pelo app: `aprovada` | `final` | `descartada`).

## No app (aba Variantes, fase D)
Peça com `projeto.json` ganha a aba **Variantes** (Conteúdos → peça): **Fluxo** (insumos → base v1 → ramo por opção → variantes) ou **Matriz** (colunas = 1º eixo, linhas = os outros), miniatura que toca no hover, selo do QC, aval. **Marcar** por rodada/linha/coluna/ramo → **Conferir** (`--qc`) ou **Gerar** no fundo (`variantes.mjs <pasta> --matriz --so <ids> [--only=<formato>]`, faixa de progresso + dock, Parar) → **Baixar** as marcadas (.zip). Rodada com opção pendente (`"<vencedora da r1>"`) mostra os botões para escolher (grava `rodadas.<r>.<eixo>`). **Anotar** abre a Edição do vídeo da própria variante (`contents/<projeto>/variantes/<id>`, sem os ajustes diretos): a anotação leva `alcance: variante | todas`, e o `review.mjs` da pasta da variante diz onde mexer (`ajustes["<id>"]` ou a base/opção do eixo). Núcleo: `core/variantes.ts`.

## Insumos (fase E)
Os insumos do projeto (o que vira variante e o que vira texto do anúncio) vivem no `projeto.json` e se mudam **só** por `tools/video-kit/scripts/insumos.mjs` (lib `tools/lib/insumos.mjs`, a mesma do app). Nunca edite o `projeto.json` à mão para isso: o script valida, carimba e preserva a ordem das chaves.

| tipo | onde fica | vira variante? |
|---|---|---|
| `abertura` | `eixos.abertura[]` | sim (eixo; aparece tracejada na matriz até o Gerar) |
| `voz` | `eixos.voz[]` | sim (só voz de rascunho `edge-*`/`win-*`; a IA não escolhe voz) |
| `headline` `{ id, texto }` · `cta` `{ id, botao, fala? }` · `copy` `{ id, texto_principal, titulo, descricao? }` | `insumos.headlines/ctas/copys[]` | não: a Meta testa sozinha; entram no pacote do anúncio (fase F) |

Todas levam `origem: "oliver" | "ia"`, `criado` (ISO) e `por_que` (o ângulo + a fonte, 1 linha).

```
node tools/video-kit/scripts/insumos.mjs <pasta> listar [--json]          # o que existe, [em uso] (já gerou variante), avisos
node tools/video-kit/scripts/insumos.mjs <pasta> contexto                 # pacote curto para a IA (≈ 2,3 mil tokens)
node tools/video-kit/scripts/insumos.mjs <pasta> add abertura --fala "…" --tela "a *b*|c" --cues troca=palavra,espalha=palavra [--id] [--titulo] --origem ia --por-que "…"
node tools/video-kit/scripts/insumos.mjs <pasta> add voz --voz edge-francisca [--id] [--rate -8%]
node tools/video-kit/scripts/insumos.mjs <pasta> add headline --texto "…"  |  add cta --botao "Saiba mais" [--fala]  |  add copy --principal "…" --titulo "…" [--descricao]
node tools/video-kit/scripts/insumos.mjs <pasta> editar <tipo> <id> --campo valor   |   rm <tipo> <id> [--forcar]
```
- **Abertura nova reaproveita o molde** da 1ª abertura do eixo (mesma `cena`, `use`, `params` e as **mesmas chaves de `cues`**): só troca `falas.f1`, `on_screen` e as palavras dos cues. `--cues` leva uma palavra dita na fala por chave do molde (`troca=ainda`; o script grava `f1:ainda`).
- **Erro (recusa, nada é gravado, saída 1):** id fora de `[a-z0-9-]` ou repetido · cue faltando, com número (escolha uma palavra) ou com palavra que a fala não diz · palavra da tela que a fala não diz **na ordem** (mesma regra `texto-fala` do QC, via `tools/lib/texto-fala.mjs`; "e-mail" = "email") · voz que não é de rascunho ou não está em `library/voices/voices.json` · botão fora dos CTAs da Meta · termo proibido da `VOICE.md` (casa o radical e o plural: "cliente" pega "clientes", "transforme" pega "transformar") · "cura"/"curar" · apagar a única abertura/voz.
- **Pede `--forcar` (a tela pergunta):** editar texto/fala/voz de opção que já gerou variante (o vídeo e o aval ficam com o texto antigo) · `rm` de opção em uso · `rm` que esvazia uma rodada (a mensagem diz qual opção assume) ou tira combinações de rodada em lista · criar a 1ª voz de um projeto sem eixo de voz (os ids das variantes mudam).
- **Aviso (grava e mostra):** gancho longo (1ª frase da tela > ~9 palavras ou fala de abertura > ~16 palavras: não fecha em 3 s/5 s) · headline > 40 caracteres · título > 40 · texto principal > 125 · CAIXA ALTA · tema sensível (tratamento, garantia, resultado garantido, depoimento, antes e depois, Setembro Amarelo: BUSINESS.md#Restrições e compliance). `rm` da 1ª abertura/voz avisa qual vira o molde/padrão.
- `editar ... --campo ""` apaga o campo opcional (título, por_que, rate, descrição…). `editar voz --rate` vale também nas `falas.*.rate` que a voz já tinha.
- `rm` de abertura/voz também tira o id das `rodadas` (objeto ou lista) e apaga o eixo da rodada se esvaziar (vale a 1ª opção).
- **Pedido de IA do app** roda com a env `HUB_PEDIDO_IA=1` (o heartbeat põe): a lib recusa `voz`, recusa `editar`/`rm` do que não tem `origem: "ia"` e ignora `forcar`; além disso o pedido bloqueia `variantes.mjs`, `tts`, `voz`, `elevenlabs`, `produce` e `tools/video/*`. Terminal interativo (sem env) não tem essa trava.
- **Pedir à IA** (app, aba Variantes → Insumos → "+5"): `core/pedidos-ia.ts > pedirInsumos` abre o `agent:roteirista` com o prompt: começar por `contexto`, escrever N opções com ângulos diferentes entre si e das existentes, usar só `add` (nunca `editar`/`rm`) com `--origem ia --por-que "…"`, corrigir e repetir quando o `add` recusar, nunca editar o `projeto.json`, nunca gerar voz nem render. O Oliver confere, e manda **Gerar** pela matriz.

## Pacote e resultados (fase F)
Zero LLM. Lib `tools/lib/pacote.mjs` (script e app usam a mesma).
```
node tools/video-kit/scripts/pacote.mjs <pasta> [--so id1,id2] [--formatos 4x5,9x16] [--link URL] [--campanha x] [--seco]
node tools/video-kit/scripts/pacote.mjs <pasta> resultados <relatorio.csv> [--data AAAA-MM-DD] [--seco]
```
- **Pacote** (sem `--so` = variantes com aval aprovada/final) → `<pasta>/pacote/<data>/`: MP4 com o **nome do anúncio** (`<nome>__<id>-<formato>.mp4`; o final ganha do rascunho), `anuncios.csv` (molde da importação em massa da Meta: Campaign Name, Ad Set Name, Ad Name, Body, Title, Link Description, Link, Call to Action, URL Tags, Video File Name; **conferir os cabeçalhos com o modelo baixado do Gerenciador na 1ª importação**), `pacote.md` (lista para colar à mão) e `pacote.json`. 1 anúncio por variante: feed = 4:5, Stories/Reels = 9:16 do mesmo nome (personalizar por posicionamento).
- **Textos** vêm dos insumos: textos principais (copys), títulos (copys + headlines), descrições, botão (1º CTA; botão diferente = outro conjunto). A Meta testa até 5 de cada dentro do anúncio, então copy não multiplica vídeo. Link/campanha/conjunto: flags ou `"anuncio": { "link", "campanha", "conjunto" }` no `projeto.json` (o app grava o link digitado). Sem link, sem copy ou só rascunho = aviso, não erro.
- **UTMs:** `utm_source=meta&utm_medium=paid-social&utm_campaign=<AAAA-MM>-<nome>&utm_content=<nome do anúncio>&utm_term={{adset.name}}` (padrão da `ads-meta`).
- **Resultados:** CSV do Gerenciador **por anúncio** (pt-BR ou inglês; `;`/`,`/tab; "1.234,56" ou "1,234.56"). Colunas lidas: Nome do anúncio, Valor usado, Impressões, Cliques no link, Resultados, Reproduções de 3 s, ThruPlays. O nome volta para a variante sozinho (`<nome>__<id>`, com ou sem `-4x5`); o que não bate sai em "sem par".
- **Vencedora por eixo** (soma das variantes de cada opção): abertura = **gancho** (3 s ÷ impressões), voz = **retenção** (ThruPlay ÷ 3 s), outros = CTR do link. Só com ≥ 1000 impressões por opção e folga ≥ 10%; senão "pouco volume" ou "empate técnico". Perdedora a ≤ 80% da vencedora = `aposentado`, o resto `em teste`.
- Grava `variantes/resultados/<data>.{json,md}` e **acrescenta** ao `companies/<slug>/campaigns/LOG_ANGULOS.md` (formato da `ads-meta`; reimportar o mesmo CSV não duplica). App: aba Variantes → **Anúncio** (Montar pacote, Importar CSV, tabela por eixo; a vencedora fica destacada na faixa "r2 espera" e as métricas aparecem no painel da variante).
