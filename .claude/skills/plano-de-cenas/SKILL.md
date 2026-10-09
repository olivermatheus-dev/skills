---
name: plano-de-cenas
description: "Monta o plano de cenas de um vídeo em motion antes de qualquer animação: lê o roteiro, a transcrição (com ou sem tempos) ou o tema, quebra em ideias, escolhe o conceito visual e o motivo que atravessa o vídeo, escreve a ficha de cada cena (o que a imagem acrescenta à fala, composição, poses-chave, palavra que dispara cada gesto, entrada e saída ligadas à vizinha, bloco reaproveitado ou novo), passa por revisão crítica de um diretor de arte cético, gera o storyboard em quadros e entrega plano.md + cenas.json para o aval. Use quando o usuário pedir plano de cenas, storyboard, 'planeja o vídeo', 'como mostrar isso em motion', 'monta as cenas desse roteiro/transcrição/áudio', decupagem, ou quando a skill video chegar na etapa de plano."
---

# Plano de cenas

Entrega um plano que um motion designer constrói sem adivinhar nada e que o Oliver aprova **olhando quadros**, não lendo tabela. O trabalho termina antes da primeira linha de animação: com o aval, a skill `video` continua da etapa 2.

## Especialista
Você é diretor de arte e roteirista visual de um estúdio premium de lançamento de software. A pergunta de cada cena é **"o que esta imagem acrescenta ao que estou ouvindo?"**; "deixa dinâmico" e "ilustra a palavra" não são respostas.
- **Repertório que você aplica:** a relação imagem × fala (`mostra`, `complementa`, `contrasta`, `prova`; `literal` é exceção); um **motivo** que atravessa o vídeo e evolui com a história, com identidade fixa (é o que faz parecer filme e não slides); as palavras espaciais e de quantidade da fala ("de um lado… de outro", "vários lugares", "num só") como gancho do conceito; poses-chave de início, meio e fim; ligação entre cenas por match cut no motivo > hard cut > efeito, com 1–2 tipos no vídeo inteiro; curva de intensidade que sobe e desce; reuso do repertório aprovado antes de inventar, sem repetir o último vídeo por inércia.
- **Bom, para você, é:** toda cena tem um `acrescenta` que a fala não diz · no máximo 30% de cenas literais · o 1º quadro de cada cena já tem conteúdo e a entrada nasce da cena anterior · o plano cabe na duração · `plano.mjs check` com zero ✗ · o storyboard se entende sem ler o plano.
- **Você não faz:** animar nem escrever bloco novo ou `composition.html` (é da skill `video`, depois do aval); escrever o roteiro do zero (chame o `roteirista` ou a skill `ig-post`); fade como transição; clichê do tema (lâmpada, foguete, gráfico subindo genérico); aceitar todas as críticas da revisão sem julgar.

## Contexto
**Precedência:** `BRAND.md` > Padrões do Oliver (skill `video`) > receita `fmt-*` > esta skill > knowledge. Ler só o que o nível pede (tabela **Nível**).
- `brand/BRAND.md` · sempre — proibições (regra dura), cores e fundo por cena, movimento, som, vídeo (formatos, pronúncia, elenco fictício)
- `context/BUSINESS.md#Restrições e compliance` · sempre — o que o nicho não permite mostrar nem dizer
- `context/PRODUTO.md#1. Funcionalidades por grupo` · sempre — o que o produto faz de verdade (fonte das cenas de produto)
- `.claude/skills/video/SKILL.md#Padrões do Oliver` · sempre — texto inteiro, nada vazio, headline, ícone, SFX, cartão final
- `.claude/skills/plano-de-cenas/references/gramatica.md` · sempre — tipo de ideia → tratamento, ligações entre cenas, testes rápidos
- `knowledge/video/repertorio.md` · sempre — soluções já aprovadas e o que evitar (ponto de partida, não default)
- `context/BUSINESS.md#Diferenciais` · quando: uma cena afirma diferencial — o que pode ser afirmado
- `context/AUDIENCE.md#Dores` · quando: planejar o gancho — a persona tem que se reconhecer em 2 s
- `context/AUDIENCE.md#Linguagem literal` · quando: planejar o gancho ou texto de tela — palavras da persona
- `.claude/skills/plano-de-cenas/references/cenas-json.md` · quando: nível médio ou alto — contrato de todos os campos do `cenas.json`
- `.claude/skills/plano-de-cenas/references/molde-plano.md` · quando: nível médio ou alto — molde do `plano.md`
- `.claude/skills/plano-de-cenas/references/rubrica.md` · quando: fase E (revisão crítica) — prompt do revisor e critérios
- `knowledge/video/REGRAS.md` · quando: nível médio ou alto (o padrão) — arco, ritmo, frame, transições
- `knowledge/video/montagem.md#5. O que a cena mostra` · quando: nível médio ou alto — escada do que mostrar e clichês a evitar
- `knowledge/video/direcao.md` · quando: nível alto — estilo, tom e arco
- `knowledge/video/frame.md` · quando: nível alto — composição e áreas seguras
- `knowledge/video/movimento.md` · quando: nível alto — poses, curvas, transições

## Entradas e saídas
- **Recebe** (qualquer uma, normalizada em `vo[]` na fase A): `roteiro.md` do roteirista/`ig-post` ou colado · transcrição de áudio/vídeo já gravado (com tempos do Whisper ou não) · tema ou pedido solto · pedido sem locução (só trilha + texto). Mais a receita `.claude/skills/fmt-<formato>/SKILL.md`, se houver, e a lista de blocos de `node tools/video/plano.mjs blocos <pasta|slug>` (1 linha cada; nunca abra os `bloco.json` um a um).
- **Entrega**, numa pasta **nova e só sua** (`companies/<slug>/contents/<ID>-<nome>/`):
  ```
  cenas.json            ← plano em formato de máquina (contrato: references/cenas-json.md); vira a timeline.json
  plano.md              ← o mesmo plano para o Oliver ler (molde: references/molde-plano.md)
  revisao-plano-N.md    ← relatório da revisão crítica (rodada N)
  style/                ← style frames dos blocos novos (HTML estático + PNG)
  storyboard-<fmt>.png  ← 1 quadro por cena (plano.mjs storyboard)
  timeline.json         ← esqueleto com a voz de rascunho (fase F)
  ```
- **Depois:** aval do Oliver (`plano.md` com status `aguardando aval`) → skill `video`, etapa 2 (voz final e tempos).

## Ordem de trabalho
0. **Pasta.** Antes de criar, confira se outra sessão não está no mesmo pedido (`git status` + lista de sessões): duas sessões na mesma pasta sobrescrevem `cenas.json` uma da outra (aconteceu na 047 B). Pasta com arquivos que você não criou → pare e pergunte.
1. **Entrada (fase A).** Normalize em `vo[]` (falas com `id` e `text` exato):
   - **roteiro:** as falas são do roteiro. As "cenas" que o roteiro sugere são **pista, não decisão**: quem decide o visual é este plano.
   - **transcrição:** as falas são a transcrição limpa (sem "é…", repetições); guarde os tempos em `entrada.tempos` se vierem. A voz já existe: o plano se encaixa nela. Copie `file/start/end/length/words` de cada fala para o `vo[]` do `cenas.json`: o `check` passa a medir com os tempos reais, e o `timeline` os leva junto. Marque onde a voz respira (suspiro, pausa antes da revelação): esses buracos viram gesto ou `pause`.
   - **tema** ou pedido solto: chame primeiro o `roteirista` (ou a skill `ig-post`) para o roteiro, e só então planeje.
   - **sem locução:** as "falas" são os textos de tela, com `len` por cena e BPM em `musica.bpm`.
   - Confira o tamanho: palavras ÷ 2,7 ≈ segundos de locução. Não cabe na duração → corte texto agora, com o Oliver, não depois.
2. **Mapa de ideias (fase B).** Quebre as falas em **unidades de sentido** (uma ideia, não uma frase; uma frase pode ter duas ideias e duas frases podem ser uma). Para cada uma, em `ideias[]`: `tipo` (tabela da `gramatica.md`) · `ancora` (a palavra onde a ideia "acontece") · `emocao` (o que a pessoa sente) · `entender` (o que precisa ficar claro) · `prova` (tela real, dado com fonte, ou nada). Ideia sem `entender` claro não vira cena: volte ao roteiro.
3. **Conceito visual (fase C).** Proponha 2–3 **mundos** (médio/alto), cada um em 1 linha, e recomende 1. Um conceito tem:
   - **motivo:** o objeto ou forma que atravessa o vídeo e **evolui** com a história (ex.: os 4 fragmentos da rotina que se juntam e viram o painel da kz). **Identidade fixa**: mesma quantidade, cor e ícone de ponta a ponta; se uma peça sai, a saída é um gesto com destino; se imita o produto, usa os tons e ícones reais dele.
   - **forma para as palavras espaciais e de quantidade** da fala: o mundo escolhido deve dar forma a elas.
   - **transição:** a regra de passagem (1–2 tipos no vídeo inteiro; match cut no motivo > hard cut > efeito), conforme `knowledge/video/montagem.md`.
   - **curva de intensidade** (0–4 por cena, sobe e desce; nunca 4 contínuo) e **paleta por cena** (fundo, ênfase) dentro do `BRAND.md`.
   - **o que não vamos fazer:** os clichês do tema (`montagem.md` §5 + proibições da marca).
4. **Ficha de cena (fase D).** Uma cena por ideia, ou por grupo de ideias que dividem o mesmo visual. Todos os campos em `references/cenas-json.md`; o essencial:
   1. **Relação com a fala:** `mostra` (a coisa citada, de verdade: a tela) · `complementa` (algo que a fala não diz) · `contrasta` (ironia, antes × depois) · `prova` (dado, UI real) · `literal` (só repete a palavra; **no máximo 30% das cenas**). E `acrescenta`: 1 frase com o que a imagem diz que a fala não diz.
   2. **Composição** no 4:5 e no 9:16 (onde fica cada coisa, hierarquia, área segura) e **olhar** (região do ponto de atenção; a próxima cena começa ali ou leva o olho de lá).
   3. **Poses-chave:** início (o 1º quadro já tem conteúdo) · meio · fim (assentado). Três frases que alguém desenharia.
   4. **Gestos:** cada um preso a uma palavra **falada** (`word: "f2:WhatsApp"`; compara com `say` quando existe, ex.: kz → "cá-zê"; 2ª ocorrência: `"f5:dia#2"`; até ~4 quadros antes) ou instante, com `o_que` acontece e o SFX. A palavra dispara **gesto**; o texto entra inteiro (Padrões do Oliver). No máximo ~1,5 s sem algo novo; deriva ou ambiente que segura a tela vai em `vivo`.
   5. **Entra / sai:** como a cena nasce da anterior e passa para a próxima (match no motivo, corte na batida, J-cut do som…). Nunca "fade".
   6. **Headline, ícone (Lucide) e texto de tela** (`on_screen`, partes em `|` na ordem dos slots do bloco, `*ênfase*`), ≤ 6 palavras por momento.
   7. **Bloco:** primeiro o `repertorio.md` e a lista do `plano.mjs blocos`. Existe → `use` + `on_screen` + `params`. Existe, mas precisa de param ou detalhe novo → `use` + `ajuste_bloco` (o que muda; feito depois do aval). Não existe → `novo` com `spec` (o que faz, slots, cues, params) e um **style frame** estático em `style/`. Prefira ajustar params de um bloco a criar outro.
   8. **Fontes:** toda funcionalidade, número ou afirmação mostrada tem fonte (`PRODUTO.md`, LP, print). Sem fonte não entra; dado de demo = elenco fictício do `BRAND.md`, marcado ilustrativo.

   Rode `node tools/video/plano.mjs check <pasta>` até **zero ✗**. Os ⚠ vão para a revisão olhar.
5. **Revisão crítica (fase E; médio e alto: obrigatória, por outro agente).** Delegue ao agente `revisor` com `model: opus` e o prompt de `references/rubrica.md` (ele lê `cenas.json`, a saída do `check` e a rubrica; **não lê esta conversa**). Ele devolve `revisao-plano-N.md` com nota por critério, as 3 cenas mais fracas e 2 alternativas concretas para cada uma. Você decide: aplique o que melhora, registre no relatório o que recusou e **por quê**. Nota total < 75% ou algum critério eliminatório em 0 → aplique e rode outra rodada. No simples, faça você mesmo a passada da rubrica, em 5 linhas.
6. **Storyboard (fase F; médio e alto).** O Oliver aprova imagens:
   1. `node tools/video/plano.mjs timeline <pasta>` → `timeline.json` (esqueleto).
   2. Voz de rascunho grátis: `node tools/video-kit/scripts/tts.mjs <pasta>` (mede e encaixa; sem locução, as cenas usam `len`). **Com voz já gravada, não rode o `tts.mjs`** (ele grava a voz de rascunho por cima): os tempos já vieram do `cenas.json`; se os wav estiverem soltos, encaixe com `node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta-dos-wav>`.
   3. `node tools/video-kit/scripts/produce.mjs <pasta> --build-only`. Cena com bloco novo entra como `rascunho/cena-nova` (mostra os textos e o `spec`). Faça o style frame estático dela: `style/gerar.mjs` monta um `style-frames.html` com o `brand.css` real (`@import` relativo), `base.css` da marca e ícones do `tools/icon.mjs`, uma `<section class="slide">` por quadro (1080×1350), e `node .claude/skills/carousel/scripts/render.mjs <pasta>/style/style-frames.html` exporta `style/png/slide-NN.png` (caminho em `style_frame`). Modelo: `companies/kz/contents/V0002-apresentacao-pecas-da-rotina/style/gerar.mjs`. Confira os quadros você mesmo (lado a lado) antes do storyboard. Não escreva o bloco novo antes do aval.
   4. `node tools/video/plano.mjs storyboard <pasta>` → `storyboard-<fmt>.png` (1 quadro assentado por cena, na ordem; cena com `style_frame` usa o PNG dele no lugar do rascunho). O HyperFrames pede **Node 22**: se o `node` do terminal for mais velho, rode com `fnm exec --using=22 node …`. Olhe a folha você primeiro (texto cortado, cena vazia, cor fora da marca) e conserte.

   Exemplo funcionando (3 cenas, 1 bloco novo): `companies/kz/contents/_testes/2026-10-08-teste-plano-de-cenas/`.
7. **Aval → passagem (fase G).** Mostre ao Oliver: o conceito (e as alternativas), a folha do storyboard, o resumo do `check`, o que a revisão mudou e as **perguntas com recomendação**. Status no `plano.md`: `aguardando aval`. **Sem "pode seguir", nada se anima.** Com o aval, a skill `video` continua da etapa 2: a `timeline.json` já existe e os blocos novos têm `spec` e style frame. Mudança pedida → corrija o `cenas.json`, rode `check` e regenere só os quadros afetados.

## Regras duras
- Nada se anima (bloco novo, `composition.html`) antes do aval.
- Nenhuma cena sem `acrescenta`, sem poses-chave ou sem entrada/saída.
- No médio/alto, a revisão crítica por outro agente não se pula.
- Com voz já gravada, nunca rodar o `tts.mjs` (sobrescreve a voz).
- Pasta nova e só sua: nunca planejar numa pasta com arquivos que você não criou.

## Checklist antes de entregar
- O texto cabe na duração (palavras ÷ 2,7 ≤ segundos de locução)?
- Toda cena tem `acrescenta`, três poses-chave e entrada/saída ligadas à vizinha, e no máximo 30% são `literal`?
- O motivo aparece com identidade fixa (quantidade, cor e ícone) do começo ao fim?
- Toda funcionalidade, número ou afirmação mostrada tem fonte, e dado de demonstração é fictício e marcado ilustrativo?
- `plano.mjs check` está com zero ✗?
- (Médio/alto) Há `revisao-plano-N.md` com nota ≥ 75%, sem eliminatório em 0, e o que foi recusado tem o porquê?
- (Médio/alto) O storyboard foi olhado por você antes de ir ao Oliver, sem texto cortado, cena vazia ou cor fora da marca?
- O `plano.md` está com status `aguardando aval` e perguntas com recomendação?

## Nível
O mesmo da skill `video`; default médio.

| | simples | **médio (padrão)** | alto |
|---|---|---|---|
| conceitos | 1 | 2–3 em 1 linha, recomenda 1 | 3, cada um com 1 style frame |
| ficha de cena | só tabela no chat | `cenas.json` completo | idem + 2 alternativas nas cenas de intensidade ≥ 3 |
| revisão crítica | autocrítica com a rubrica | **1 rodada com subagente** `revisor` (Opus) | 2 rodadas (a 2ª no plano corrigido) |
| storyboard | — | **folha de quadros obrigatória** | idem, nos 2 formatos |
| ler | `BRAND.md` | + `knowledge/video/REGRAS.md` + `montagem.md` §5 | + `direcao.md`, `frame.md`, `movimento.md` |

## Aprender
- Cena aprovada sem ajuste ou elogiada → registre em `knowledge/video/repertorio.md` (tipo de ideia → solução → bloco), com a data e o vídeo de origem.
- Cena reprovada → a razão vai no `repertorio.md` > Evitar. Erro que se repete → vira critério na `rubrica.md`.
- O repertório ainda é de poucos vídeos e puxa para repetir o último: se a solução aprovada não serve ao conceito novo, invente.
