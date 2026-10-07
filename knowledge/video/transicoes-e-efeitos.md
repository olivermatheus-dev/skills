# Transições e efeitos de edição

> Base: material do usuário "Etapa 6" (2026-10-07), verificado. Complementa `movimento.md` §6 (transições em motion), `cortes-e-montagem.md` (hard/J/L/match/cut on action) e `sound-design.md` §5 (som da transição). Cada item tem a tradução **Em motion**.

## 1. Princípio
Uma transição existe para **comunicar uma mudança** (de tempo, espaço, narrativa, emoção, conceito, energia ou estilo), não para esconder um corte. O padrão continua sendo o **hard cut**.

Antes de usar qualquer transição, responda:
1. O que mudou?
2. O espectador precisa *sentir* essa mudança?
3. Um corte resolveria?
4. A transição tem relação com o movimento, o ritmo ou a narrativa?
5. Ela pertence à linguagem do projeto?

**Princípio-mestre:** a pergunta não é "ficou legal?". É "comunica a mudança, combina com o movimento, pertence à marca e é **melhor que um corte**?". A transição excelente parece inevitável.

## 2. Escada (use o degrau mais baixo que resolve)
1. hard cut
2. J/L-cut
3. match cut
4. cut on action
5. dissolve/fade
6. transição motivada por movimento
7. máscara/objeto
8. estilizada
9. efeito muito perceptível

## 3. Sistema de decisão
| a mudança é / existe… | considere | em motion |
|---|---|---|
| neutra | **hard cut** | troca seca na batida ou no fim da frase |
| suave, passagem gradual, memória | **dissolve** (não universal; nunca para remendar corte ruim) | crossfade curto entre estados |
| separar capítulos, encerrar | **fade/dip to black** (quanto mais longo, mais "fim") | dip para `--bg`/`--inverse-bg` da marca, não necessariamente preto |
| movimento lateral | **whip, push/slide, object wipe** | push de cards/painéis com **direção coerente** (o conteúdo avança sempre para o mesmo lado) |
| mudança forte de escala | **zoom transition** (zoom-in → corte → continua o zoom) | zoom-through: entrar num elemento que vira a próxima tela; alinhar centro de interesse e velocidade |
| um objeto cobre o quadro | **máscara / object wipe** | forma da marca ou elemento da cena cobre e revela; bordas precisas, motion blur |
| luz forte | **flash, light, luma** | só se a marca comportar; nunca enfeite |
| transformação | **morph** | morph de forma SVG (bolha → card, ícone → tela) |
| ruptura digital | **glitch** | só se "falha" fizer parte da mensagem |
| movimento precisa de impacto | **speed ramp** | curva de tempo (acelera no meio, assenta no fim) |
| observar um momento | **slow motion / freeze** | segurar o estado (hold) com drift sutil; freeze + anotação gráfica |
| comprimir ação | **fast motion** | timelapse do processo na UI (vários estados em sequência rápida) |
| nada disso | **sem transição estilizada** | — |

## 4. Regras por tipo
- **Motivada:** a própria imagem dá o motivo (whip da câmera, silhueta que cobre, luz que invade). Procure a correspondência entre as imagens **antes** de procurar um preset.
- **Dissolve:** sugere tempo, continuidade emocional, associação. Ponto de partida: 0,3–0,8 s (contemplativo até 1,5 s).
- **Fade/dip:**
  - fade from black: só quando a entrada gradual é a intenção. Em social, **o 1º quadro já tem conteúdo** (`ritmo-e-leitura.md` §5);
  - dip: pontuação curta entre momentos, de 6–12 quadros.
- **Flash/branco:** representa algo luminoso ou uma ruptura forte, não "energia". **Acessibilidade:** nunca mais de 3 flashes por segundo (WCAG 2.3.1); evite clarões repetidos.
- **Push/slide:** ótimo em motion e interface. **Lógica espacial:** a direção não muda sem motivo.
- **Whip:** funciona quando há momentum dos dois lados. O corte cai no quadro de maior blur. Duração: 6–10 quadros. O whoosh é opcional e proporcional.
- **Zoom / zoom blur:** preserve direção, centro de interesse, velocidade e perspectiva. O blur sustenta o movimento; não esconde falta de correspondência. Excesso parece preset.
- **Blur (foco):** ligado a lente, percepção ou movimento, nunca um Gaussian solto. Nítido → perde foco → corte → próxima começa desfocada → recupera.
- **Máscara / object wipe:** **precisão > complexidade**. Confira suavização da borda, motion blur, tracking, qualidade da borda, paralaxe e luz. Se a filmagem tem oclusão real, use a real.
- **Luma, light leak, textura, grão, aberração cromática, glitch:** só quando a estética do projeto pede. Grão não deixa nada "cinematográfico". Aberração cromática deve ser breve e de baixa intensidade.
- **Morph:** comunica transformação (antes/depois, evolução). Revise deformações em rosto, mãos, objetos e fundo.
- **Speed ramp:** siga a física percebida (aproxima → acelera → ação → desacelera → volta), com curva e não degrau. Como transição: A acelera → corte no pico → B começa rápido e desacelera.
- **Slow motion:** aumenta o significado, não só a duração. Com interpolação, revise mãos, cabelo, água, partículas e cruzamentos.
- **Freeze frame:** escolha um quadro forte (sem blur ruim, sem olho fechado, sem expressão intermediária). **Freeze + gráfico:** use o tempo extra para uma informação que mereça; não cubra o sujeito.
- **Flash frame:** pontuação forte. Raro.
- **Camera shake:** representa uma força real (impacto, explosão, caos), proporcional ao evento, com aceleração e amplitude decrescente. Nunca para enfatizar frase comum. Em motion: shake de 2–4 quadros, amplitude de 4–12 px, decaindo.
- **Impact zoom:** pontuação expressiva (humor, choque, reveal), não padrão de talking head.
- **Overlay:** precisa parecer parte do mundo (blend mode, opacidade, movimento, escala, cor, perspectiva), nunca uma camada achada.
- **Motion blur artificial:** proporcional à velocidade e à direção, sem destruir a legibilidade (ver `esteira-de-producao.md` §5).

## 5. Sistema da marca (consistência)
- Por vídeo: **1 família principal + 1 alternativa + 1 especial** para o grande momento. Nunca vinte tipos.
- **Duração não é default:** curta = rápida, energética, discreta; longa = suave, contemplativa. Combine com ritmo, música e narrativa.
- **Direção do olhar:** o ponto de interesse de A e de B na mesma região exige menos esforço. Quebre só de propósito.
- **Momentum:** o movimento **atravessa** o corte (direção, velocidade, aceleração, escala, ponto de interesse), não só existe dos dois lados.

## 6. Por formato
- **Talking head:** hard cut, J/L, B-roll, reframing, troca de câmera. Estilizada só em capítulo, grande mudança, abertura ou fim. Conversa editada, não transicionada.
- **Short-form:** aceita mais whip, zoom, speed ramp e motion, mas **mais permitido ≠ obrigatório**. Nunca uma transição por frase.
- **Premium:** cortes precisos, match de movimento, object wipes, máscaras bem feitas, transições ópticas sutis, som discreto. **Sofisticação vem de precisão, não de quantidade.**

## 7. Biblioteca de presets (quando existir)
- **Nunca comece pelo preset.** Defina primeiro função, movimento, intensidade, duração, direção e estética; só então busque.
- **Ficha do preset:**
  - tipo: dissolve/whip/zoom/blur/mask/slide/light/glitch/luma/morph/stylized;
  - intensidade: subtle…extreme;
  - duração: micro/short/medium/long;
  - direção: left/right/up/down/inward/outward/none;
  - estilo: clean, premium, cinematic, energetic, digital, analog, playful, aggressive, elegant.
- **Preset é matéria-prima:** ajuste duração, amplitude, direção, easing, blur, escala, posição, opacidade, cor, som e timing.

## 8. Controle de qualidade (quadro a quadro quando preciso)
- [ ] **Timing:** começa e termina no momento certo?
- [ ] **Movimento:** há continuidade de velocidade?
- [ ] **Easing:** a aceleração é natural?
- [ ] **Blur:** combina com a velocidade?
- [ ] **Composição:** o olho sabe onde olhar?
- [ ] **Bordas:** as máscaras estão limpas?
- [ ] **Escala:** a intensidade é proporcional ao evento?
- [ ] **Som:** som e imagem estão sincronizados?
- [ ] **Cor:** os dois lados têm exposição e cor compatíveis?
- [ ] **Necessidade:** melhora o vídeo?

**Teste de remoção (toda transição estilizada):** troque mentalmente por um hard cut. Se o corte ficar mais claro, elegante, rápido ou natural, **fique com o corte.**
