# Animação: timing, spacing e física do movimento

> Base: material do usuário "Etapa 8" (2026-10-07), verificado. Valores iniciais em `movimento.md` (durações, molas); curvas e polimento em `curvas-e-polimento.md`. **Anime comportamento, não propriedades.**

## 1. Antes de animar: as 4 perguntas
1. **Intenção:** por que se move?
2. **Energia:** que força inicia o movimento?
3. **Trajetória:** como a energia se distribui no tempo e no espaço?
4. **Resolução:** como termina e estabiliza?

Defina o caráter: rápido/lento · seco/suave · leve/pesado · preciso/orgânico · elegante/enérgico · rígido/elástico. Nunca "posição A → ease padrão → posição B".

## 2. Timing e spacing
- **Timing** = quanto dura. Curto: rápido, leve, preciso. Longo: pesado, suave, elegante. Escolha pela personalidade, não pelo default.
- **Spacing** = como o movimento se distribui entre os quadros. Mesma duração e mesmos pontos podem parecer outra coisa: uniforme = velocidade constante; espaçamento crescente = acelera; decrescente = desacelera. **Timing diz quando chega; spacing diz como chega.**
- **A duração depende da distância e da escala:** copiar a mesma duração para uma distância 3× maior triplica a velocidade percebida. Elementos grandes pedem mais tempo (movimento brusco grande domina o quadro); pequenos toleram mais velocidade.
- **Linear é linguagem:** scanner, barra de progresso, relógio, loop mecânico, indicador técnico. Fora disso, objeto real não começa nem para instantaneamente.

## 3. Easing (atenção à terminologia)
| no material (After Effects) | significa | no nosso código (GSAP/CSS) |
|---|---|---|
| "ease in" (chegada suave ao keyframe) | **desacelera ao chegar** | **`.out`** (ex.: `power3.out`, `expo.out`) |
| "ease out" (saída suave do keyframe) | **acelera ao sair** | **`.in`** (ex.: `power2.in`) |
| "ease in-out" | sai e chega suave | **`.inOut`** |

⚠️ No CSS/GSAP, `ease-in` = começa devagar (acelera) e `ease-out` = termina devagar. É o inverso do vocabulário do After Effects. **No código, siga sempre a coluna da direita.**
- **Ease padrão não é resultado final.** Depois de aplicar, olhe a velocidade, onde está o pico e o peso, e ajuste (ver `curvas-e-polimento.md`).
- **Assimetria é normal:** saída rápida + chegada longa (premium UI) ou saída lenta + chegada rápida. Curva bonita não precisa ser simétrica.

## 4. Princípios de física (use quando ajudam; nunca todos em tudo)
- **Antecipação:** pequeno movimento contrário antes da ação (recuo, compressão). Comunica intenção, peso e impacto. Intensidade pela personalidade: premium = quase imperceptível (2–4% da distância), expressivo = maior, comédia = exagerada. **Nem toda microinteração precisa.**
- **Overshoot + settle:** o objeto passa do destino e assenta, representando a energia que sobrou.
  - **Premium:** 0–4% (escala 1,02–1,04) ou nenhum.
  - **Expressivo:** até 8–10%.
  - Mais oscilações = mais elástico/instável.
  - **Proibido como receita:** `scale 0 → 110 → 95 → 100`.
- **Bounce:** cada quique perde amplitude, duração e energia (ex.: amplitude ×0,4–0,6 por quique). Quiques iguais parecem máquina. Leve quica mais; pesado, menos.
- **Mola (spring):** rigidez (*stiffness*), amortecimento (*damping*), frequência e tempo de assentar compatíveis com o elemento. Amortecimento alto = pouca oscilação. Use as molas nomeadas (`movimento.md` §2b).
- **Follow-through e overlapping action:** partes secundárias terminam alguns quadros depois (a sombra assenta depois do card; o texto chega 2–4 quadros depois do container). **Coordenado ≠ simultâneo.**
- **Arcos:** objetos e gestos naturais andam em curva (cursor, ícone físico, órbita). UI técnica pode andar reto, de propósito.
- **Momentum:** movimento anterior cria expectativa. Mudança brusca de direção, velocidade ou escala precisa de causa (desaceleração, antecipação, impacto, curva).
- **Peso:** pesado acelera devagar, quica pouco, impacta mais (inclusive no som); leve responde rápido.
- **Squash & stretch:** comunica força e impacto; **preserve o volume** (comprime um eixo, expande o outro). Sutil em UI (clique: escalaY ~0,97–0,98 / escalaX ~1,01, ilustrativo). Não vire preset.
- **Ponto de origem (*transform-origin*):** a origem explica a física e a causalidade (porta na dobradiça, menu a partir do botão, barra cresce da base ou da esquerda, card nasce perto do que o abriu). **Não cresça tudo do centro.**
- **Rotação:** energia alta. Com parcimônia em sistemas minimalistas; só com trajetória, força ou personalidade.
- **Opacidade:** controla presença; fade puro é passivo. Combine com deslocamento pequeno (y 16–40 px em 1080) ou escala (0,96 → 1), **não com escala 0 → 1**.
- **Blur no movimento:** reforça velocidade ou foco, nunca esconde animação ruim. **Texto não fica borrado durante a leitura**: no máximo alguns quadros em movimento muito rápido.

## 5. Sequenciamento e hierarquia do movimento
- **Primário → secundário → terciário:** a headline entra claro; o sublinhado acompanha; a partícula responde discretamente. O secundário apoia, nunca disputa.
- **Contraste de movimento = contraste de importância:** principal com amplitude e velocidade; contextual com fade suave.
- **Ordem perceptiva:** container → headline → dado → explicação (segue a hierarquia da informação). **Não comece tudo junto.**
- **Stagger** transforma repetição espacial em ritmo:
  - ordem com sentido: leitura, posição, hierarquia, direção;
  - intervalos curtos (40–80 ms);
  - **pode ser não uniforme** (1º item, pausa, depois 3 rápidos = fraseado).
- **Não anime tudo:** ícones, divisores, fundo e rótulos podem já estar lá. **Movimento é contraste: se tudo se move, nada se destaca.**
- **Frequência:** movimento → assentar → **leitura** → próximo movimento. O espectador precisa de momentos em que a informação para de fugir.
- **Reading hold:** o tempo de leitura **conta a partir de quando o texto fica legível e parado**, não do início da entrada.
- **Olhar durante o movimento:** o próximo evento começa perto de onde o olho terminou; evite fazer o olho cruzar o quadro sem preparo.

## 6. Entradas, saídas e continuidade
- **Entrada pela origem e função:** fade, slide, escala, revelação por máscara, *draw-on*, transformação (ou combinação). Não use a mesma entrada para tudo.
- **Saída também é design:** sumir, continuar o movimento, colapsar, voltar à origem, ser substituído, transformar-se. Ela prepara a próxima composição. **Saída ≠ entrada invertida:** a entrada pode ser elegante e a saída rápida e funcional (~70–80% da duração).
- **Transformar em vez de destruir e recriar:** o card se expande e vira a próxima tela; o número se reposiciona e vira dado do gráfico. Preserva a continuidade cognitiva.
- **Elementos persistentes:** o título fica, o resto se transforma. Menos contexto para reconstruir.

## 7. Fluxo de trabalho
1. **Blocking:** estados principais e ordem dos eventos primeiro.
2. **Key poses:** inicial, antecipação, principal, overshoot, settle. Pose a pose: se as poses não funcionam, os intermediários não salvam.
3. Curvas e polimento só depois (`curvas-e-polimento.md`).
4. **Movimento antes de efeito:** desligue glow, partículas, blur e SFX. A animação pura (posição, escala, rotação, opacidade) tem que funcionar sozinha.
5. **Som por último**, nos eventos perceptivos que já existem (início, pico de velocidade, impacto, snap, assentamento), sem sonorizar todos (`sound-design.md` §5).

## 8. Personalidade e tokens de movimento
| personalidade | como é |
|---|---|
| **premium** | rápido e controlado, saída rápida + chegada longa, overshoot 0–4%, settle curto, transições limpas |
| **playful** | mais bounce, squash, overlap, stagger e amplitude |
| **técnico** | linear/snap, precisão, pouca elasticidade |
| **cinematográfico** | durações maiores, drift, profundidade, desfoque, contraste de ritmo |

**Tokens** (consistência no projeto, não valores universais):
- **duração:** `micro` 120–180 ms · `fast` 200–300 ms · `standard` 350–500 ms · `deliberate` 600–800 ms · `cinematic` 900 ms+;
- **família de curva:** `sharp` · `smooth` · `expressive` · `spring`.

A personalidade da marca fica em `BRAND.md` > Movimento.

## 9. Problemas comuns (diagnóstico)
| sintoma | causa provável | correção |
|---|---|---|
| **flutuante / gelatinoso** | ease longo demais, sem pico claro, tudo suave | encurtar, acelerar decidido, deslocar o pico, contraste entre movimento e settle |
| **seco / robótico** | velocidade constante sem motivo, para/arranca no keyframe, tudo começa e acaba junto | aceleração/desaceleração, overlap, offsets |
| **mole** | overshoot e oscilação demais, settle longo, tudo elástico | reduzir amplitude, número de oscilações e tempo de assentar |
| **"preset"** | mesmo ease, overshoot, distância e origem em tudo; stagger idêntico; `scale 0 → 100` | variar **pela função** do elemento, nunca aleatório |

## 10. Controle de qualidade
- **Sem áudio:** ainda tem peso, ritmo, clareza e impacto? Se não, o som não salva.
- **Em loop** para achar hesitações e atrasos; **depois na sequência completa** (bonito em loop pode falhar no vídeo).
- **Quadro a quadro:** saltos, recortes, quadros vazios, mudanças bruscas, máscaras, blur inconsistente, ordem de camadas.
- **Teste de simplificação:** tire antecipação, overshoot, movimento secundário, blur e transform extra. **Se o simples ficar melhor, fique com ele.** Princípios são ferramentas, não obrigação.
- **Terminado** = começa, acelera, mantém o momentum, chega, responde à chegada, assenta, conduz a atenção e combina com o resto e com a personalidade. **O profissional está entre os keyframes.**
