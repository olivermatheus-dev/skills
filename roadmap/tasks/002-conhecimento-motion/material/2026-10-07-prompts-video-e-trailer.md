# [BRUTO] Prompts de vídeo (Ludus) e de trailer de lançamento

> Enviados pelo usuário em 2026-10-07, copiados sem edição. O primeiro é o prompt que o usuário usa no Ludus. O segundo foi transcrito de um print de um editor que pedia vídeos ao Claude sem skills, só com prompts. O resultado destilado está em `knowledge/video/` (briefing-e-direcao, movimento, ritmo-e-leitura, som).

---

# Prompt: vídeo do Ludus

> Adaptado em 2026-09-30 do [prompt de trailer](trailer-de-lancamento.md), para servir a qualquer
> vídeo do Ludus. Copie o bloco abaixo, preencha as quatro linhas entre `{chaves}` e mande.
> Ele parte do kit desta pasta (`videos/_kit/`) e do [guia de movimento](../GUIA-DE-MOVIMENTO.md).

Faça um vídeo do Ludus em motion graphic.

- **O recorte:** {o que este vídeo vende — ex.: "o lançamento", "o registro da aula", "saber quem pagou"}
- **Duração:** {ex.: 15 s · 30 s · 45 s}
- **Formatos:** {4:5 (1080×1350) e story (1080×1920) — ou só um}
- **Locução:** {sim, voz Thalita · ou não, só música e efeitos}

Tudo na tela é feito em código, com o HyperFrames: HTML, CSS, SVG e GSAP. Nada de imagem, banco de
imagens ou mídia gerada. O som também é nosso: a trilha sai do `_kit/scripts/music.mjs`, os efeitos
do `sfx.mjs`, a voz do `tts.mjs` e a mixagem do `mix.mjs`. Nenhum arquivo de áudio de terceiros.
Crie a pasta `videos/NNN-<nome>/` seguindo o `videos/README.md`.

Você dirige. Escolha o conceito, a história e o que mostrar. Tem que parecer o lançamento de um
software premium, não um modelo pronto nem uma sequência de slides.

**Para quem.** O professor independente — quem dá aula por conta própria e faz tudo sozinho:
titular, professor e secretário ao mesmo tempo. A persona é a Gaby, professora de espanhol. Ele
tem que se reconhecer nos primeiros segundos e entender o valor sem esforço.

**Regras:**
- **Só o que é verdade sobre o Ludus.** Mostre apenas o que a landing (`src/components/marketing/`)
  promete: planejar a aula a partir do histórico; ver onde o aluno parou, o que ficou pendente e
  os materiais; registrar presença, anotações e próximos passos, que viram contexto da próxima
  aula; agenda com aulas individuais, recorrências e remarcações; saber o que está pago, pendente
  e a receber; programas, cursos e materiais reutilizáveis. Não mostre personalização de cor —
  não estará no sistema. Nenhum número real, depoimento, métrica ou preço inventado. O acesso é
  gratuito na fase de testes, por fila de acesso antecipado.
- **Dados são do elenco fictício.** Gaby, Mariana, Lucas, Beatriz e Pedro; valores ilustrativos
  (R$ 280 a aula), marcados como tal no roteiro.
- **Pouco texto, grande:** poucas palavras por momento, nunca um parágrafo. Nunca caixa alta. Rótulo
  de botão é o verbo.
- **O visual:** a identidade do Ludus — fundo **liso**, papel `#F5F5F7` ou branco, sem mancha,
  halo ou gradiente colorido. Títulos em tinta `#1D1D1F`, as duas linhas — nenhum título em
  cinza, nenhuma palavra em cor de família. Cinza só em rótulo pequeno dentro da janela do app. Cor
  de família só dentro do app e com significado (Pago verde, Pendente âmbar). O ouro `#F2A61C` é
  da marca: o símbolo, o botão principal, o fecho. Inter. Contido, premium, confiante — Apple como
  referência.
- **O arco:** abertura que prende nos primeiros 2 s; o conceito entendido até os 10 s; o produto em
  uso, com o cursor fazendo gestos reais no app; uma virada em que música e imagem batem juntas;
  a revelação do Ludus; um cartão final com "Entre na fila de testes" que fica pelo menos 2 s.
- **O movimento:** molas do `brand/motion.js` com um toque de passagem, antecipação e nada
  linear. Nada fica completamente parado. Profundidade com escala, desfoque e paralaxe. Transição
  com motivo — corte por semelhança, máscara, chicote, uma forma que vira a próxima cena —, nunca
  dissolve sem motivo. Micro-interações no app: hover, botão que afunda, eco do clique, contador
  que sobe, selo que troca.
- **O tempo:** feito para quem vê uma vez só. Uma ideia por vez, movimento rápido, significado que
  fica. Nada some antes de dar tempo de ler. Com locução, cada mudança cai numa palavra da fala, e
  o silêncio entre uma fala e a próxima é de no máximo 0,5 s (uma pausa de até 1 s só na virada).
  Algo novo a cada 2–3 s: dinâmico, nunca tela parada esperando a voz.
- **O som:** escolha um andamento e prenda cada corte e cada impacto no tempo. Desenho de som de
  trailer: grave de impacto, subida de ruído filtrado, um motivo melódico, um impacto grande na
  revelação com cauda longa, e os efeitos de interface (clique, balão, digitação, aviso) presos
  aos `events` do `timeline.json`. Mixagem limpa, em −14 LUFS: alta, mas nunca estourada nem
  esmagada.

**Planeje antes de gerar — e espere o meu aval.** Escreva o `plano.md` da pasta do vídeo, no
molde da skill `ludus-video`: o recorte, as falas, a folha de batidas (tempo, o que está na tela,
o que quem assiste precisa entender, o que o som faz), as cores e o fundo de cada cena, e as
afirmações sobre o produto com a fonte de cada uma. Nenhum código antes do meu aval no plano.

**Confira o próprio trabalho.** Rode `_kit/scripts/check.mjs`, olhe as folhas de contato dos dois
formatos você mesmo e conserte o que estiver errado: tempo, legibilidade, sobreposição, cursor fora
do quadro, contraste, volume. Repita até ser algo que você publicaria. Só então exporte, com
motion blur.

---

# Prompt de referência: trailer de lançamento (transcrito de captura de tela)

> Transcrito em 2026-09-30 de uma captura enviada pelo dono. Trechos entre `[colchetes]` estavam
> cobertos pela webcam ou pelo cursor e foram **reconstruídos por inferência**, não lidos.

Make your own launch trailer. You're Claude Opus 5.5, and I want an 18 second cinematic launch video for yourself, built entirely in HyperFrames and rendered to a 2560x1440 60fps MP4. Everything on screen is made in code: HTML, CSS, SVG, canvas, GSAP. No images, no stock footage, no generated media. The audio is yours too: synthesize the whole soundtrack with the Web Audio API (render it offline with OfflineAudioContext to a WAV, no audio files or samples), then mux it into the final MP4.

You direct it. Pick the concept, the story and what to show. It should feel like a real launch film from a top AI lab, not a template or a slideshow.

Rules:
- Only say true things about yourself. No invented benchmark numbers, no made-up features.
- Text is sparse and big: a few words per moment, never a paragraph.
- Look: warm cream (#F0EEE6), deep ink (#1F1E1D), clay orange (#D97757) as the accent. An elegant serif for headlines, a clean sans for the rest. Restrained, premium, confident.
- Arc: a cold open that hooks in the first 2 seconds, a build, a drop where the music and visuals hit together, the reveal of "Claude Opus 5.5", and an end card that holds for at least 2 seconds.
- Motion: every move eased, anticipation and overshoot, nothing linear, nothing ever fully still. Depth from scale, blur and parallax. Transitions are motivated (match cuts, masks, whips, a shape that becomes the next scene), never plain crossfades.
- Time it for someone seeing it once: one idea at a time, fast motion, held meaning. Nothing flashes by before it can be [read].
- Sound: pick a tempo and lock every cut and hit to the beat. Real trailer sound design: sub booms, risers from filtered n[oise, a] melodic hook, a big impact on the reveal with a long tail. No voiceover. Mix it clean: loud but never clipping or crushed.

Plan before you build: write a short beat sheet (time, what's on screen, what the viewer should take in, what the audio d[oes at that moment]).

Check your own work[: render stills at the key] f[rames, look at them yourself, and fix anything that is off — timing, legibility, overlaps, audio levels. Then] repeat until it's some[thing you would ship].
