# Compositing e integração

> Base: material do usuário "Etapa 12" (2026-10-07), verificado (prática padrão de VFX/compositing) e traduzido para o nosso stack (HTML/CSS/GSAP → MP4). Valores são **pontos de partida**.
> **Onde vale hoje:** UI dentro de aparelho, print sobre fundo, mockup 3D (`fmt-3d-produto`), callout preso a objeto, grão/textura. **Live action** (tracking, roto, keying sobre filmagem) só quando houver filmagem; está em §7 e no `roadmap/DEPOIS.md`.

## 1. Princípio
**Posicionar é diferente de integrar.** Um elemento integrado combina com a cena em movimento, perspectiva, escala, profundidade, oclusão, luz, cor, foco, grão e motion blur.
Quando algo parece "colado por cima", **não comece adicionando glow, sombra, blur ou grão**. Pergunte: *se isto estivesse mesmo nesta cena, como a câmera, a luz e os objetos o afetariam?* Ache a relação que falta e reproduza só ela.

## 2. Primeira decisão: a que espaço o elemento pertence
| espaço | preso a | exemplos | na câmera que se move |
|---|---|---|---|
| **screen space** (overlay) | o quadro | legenda, título, lower third, gráfico editorial, HUD | fica parado no quadro |
| **world space** (integrado) | a cena | UI na tela do celular, label na parede, texto no chão | acompanha posição, escala, perspectiva, foco e tremor |
| **híbrido** | âncora no mundo + leitura no quadro | ponto no produto → linha → label estável na lateral | âncora segue; linha estica; texto fica onde dá para ler |

- **Defina o espaço antes de construir.** Misturar as duas linguagens sem intenção é o erro nº 1.
- **Callout em objeto que se move:** separe o **alvo** (preso ao objeto) da **área de leitura** (estável no quadro). A legibilidade ganha.
- **Tremor de câmera:** world space treme junto; screen space não treme (salvo como efeito deliberado).
- **Nível de realismo** (escolha 1 por vídeo): *fotoreal* (some na cena) · *integração estilizada* (é gráfico, mas responde ao espaço) · *overlay* (linguagem editorial). Integrar ≠ ser realista: é ser **coerente com a regra escolhida**.

## 3. UI dentro de aparelho (o caso mais comum nosso)
- **A tela vive atrás do vidro:** conteúdo recortado pela tela com cantos arredondados, notch e moldura (`overflow: hidden` + `border-radius` da tela real). Nada vaza da tela.
- **Crop seguro:** a UI cabe na área útil (barra de status e home indicator não cobrem informação).
- **Perspectiva única:** a UI sofre a mesma transformação do aparelho (filha do grupo 3D). UI de frente sobre aparelho inclinado = overlay.
- **Pretos e brancos da tela no mesmo range da cena:** se a cena é clara e suave, a UI não tem preto `#000` nem branco estourado. Use os tons do `brand.css`.
- **Reflexo pertence ao vidro:** camada **por cima** da UI, branco translúcido (opacidade ≤ 0,25), 1 passada, na direção da luz do vídeo. Nunca reflexo dentro da UI.
- **Tela emite luz só se a cena pedir:** glow da tela em cena escura, sutil; em fundo claro da marca, nada.
- **Rolagem e troca de tela** com a física do app (desacelera no fim), não deslize linear.
- **Dedos, cursor e objetos à frente da tela ficam acima dela.**
- **Print real** em ≥ 2× o tamanho exibido (escala com nitidez). Ver `fmt-3d-produto`.

## 4. Sombra, luz e contato
- **1 direção de luz no vídeo todo.** Sombra, reflexo e shine seguem essa direção.
- **Sombra de contato > sombra grande:** um objeto pousado precisa de uma sombra curta, escura e concentrada junto à base. Ela "aterra" mais que um drop shadow dramático.
- **Mais longe da superfície → sombra maior, mais suave e mais clara.** Objeto subindo: a sombra abre e desbota; pousando: fecha e escurece.
- **Nada de drop shadow padrão:** use os níveis `--shadow-sm/md/lg` da marca. Glow só tem uso onde existe fonte de luz.
- **Contato sem consequência = flutua.** Ao tocar algo, dê ao menos 1 sinal: sombra, leve deformação, luz ou som.

## 5. Cor, nitidez e textura (matching)
- **Luminância antes de matiz:** compare ponto de preto, ponto de branco e contraste antes de mexer na cor.
- **Elementos externos chegam saturados demais** (prints, ícones, assets): reduza a saturação até combinar.
- **Distância tira contraste e saturação** (perspectiva atmosférica); use pouco.
- **Nitidez:** vetor perfeito sobre fundo suave denuncia. Se a cena é suave, um blur de 0,3–0,6 px ou o motion blur resolvem.
- **Teste do desfoque:** desfoque a imagem (mentalmente ou com filtro). As massas de luz e cor do elemento ainda combinam com a cena? Revela erro de tom que o detalhe esconde.
- **Teste em cinza:** em escala de cinza, o elemento tem o mesmo peso dos vizinhos?

### Grão (acabamento, não conserto)
- Só se a marca pedir textura ou houver filmagem; o default motion limpo **não leva grão**.
- **Aplicado por último, no quadro inteiro** (camada global), para unificar. Não conserta composite ruim.
- **Grão parado = vidro sujo.** Ele muda a cada quadro, de forma **determinística** (semente por quadro, ver `particulas-e-atmosfera.md` §6). Opacidade inicial 2–4%.
- Grão digital (ruído de câmera) ≠ grão de filme: escolha 1, coerente com a estética.

## 6. Foco, motion blur e lente
- **Foco comunica distância:** elemento no plano desfocado recebe o mesmo desfoque. Se o foco muda, ele acompanha.
- **Movimento compartilhado exige blur compartilhado:** elemento nítido sobre movimento borrado denuncia o composite. No nosso render, o motion blur do export cobre isso (ver `esteira-de-producao.md` §5).
- **Efeito de lente só se a lente "produziria":** bloom em tela/neon/luz; flare com fonte visível; aberração cromática e vinheta só se a filmagem já tem. **Nunca flare para "ficar cinematográfico".** Vinheta e grade são globais, no fim.

## 7. Live action (quando houver filmagem)
Regras para o futuro; ferramentas no `roadmap/DEPOIS.md`.
- **Use o menor modelo de tracking que descreve o movimento:** ponto → posição+rotação+escala → **planar** (superfície plana: tela, placa, papel, parede) → câmera 3D (texto no chão, set extension) → roto.
- **Bom ponto de tracking:** contraste, detalhe, forma estável; evite áreas lisas, borradas, reflexivas ou que somem. Rotação precisa de 2 pontos distantes.
- **Substituir tela:** planar track → 4 cantos (corner pin; em CSS = `matrix3d` calculada dos 4 pontos) → perspectiva → recorte → exposição e temperatura → manter reflexos originais por cima → motion blur → grão. Dedos que cruzam a tela ficam acima (roto).
- **Câmera 3D:** valide com um objeto simples (cubo no chão) antes de construir; procure deslizamento.
- **Oclusão é a pista de profundidade mais forte:** gráfico atrás da pessoa = fundo → gráfico → **pessoa recortada** por cima (2,5D). Recorte só a região que cruza o gráfico.
- **Roto:** formas grandes e rígidas primeiro; separe partes que se movem diferente (corpo, braço, mão, cabelo); keyframe onde o movimento muda, não em todo quadro; feather conforme a borda (objeto duro: pequeno; cabelo e desfoque: maior).
- **Keying:** chave limpa só gera o matte. Depois: spill (verde na pele/cabelo), bordas, cabelo, motion blur e **re-luz** (o novo ambiente contamina levemente bordas e sombras).
- **Atmosfera também oculta:** fumaça na frente do elemento o cobre parcialmente.

## 8. Ordem de trabalho (estrutura antes de acabamento)
1. **Relação:** tela, superfície, objeto, espaço 3D, frente ou fundo?
2. **Estrutura:** posição, escala, rotação, perspectiva (+ tracking, se filmagem).
3. **Oclusão:** o que passa na frente e atrás.
4. **Câmera:** foco, blur, distorção, motion blur.
5. **Luz:** exposição, direção, sombras, realces.
6. **Cor:** preto, branco, contraste, saturação, temperatura.
7. **Textura:** grão, nitidez, bordas.
8. **Interação:** sombra de contato, reflexo, luz, atmosfera (só as necessárias).
9. **Passada global:** grade, grão, vinheta.
10. **Simplificar:** remova o que não melhora a integração.

**Não polir glow enquanto o elemento ainda desliza.** Uma ou duas relações bem feitas (linha passando atrás do objeto, sombra de contato) vendem mais que dez efeitos.

## 9. Armadilhas técnicas
- **Alpha:** halo preto/branco na borda = alpha mal interpretado (straight × premultiplied). Resolva antes do polimento. PNG é straight; vídeo com alpha (ProRes 4444, WebM VP9) confira no render de teste.
- **Gerenciamento de cor ★:** o navegador renderiza em sRGB; o MP4 sai em YUV. Sem marcar BT.709 no ffmpeg, a conversão padrão pode usar BT.601 e **a cor da marca muda no vídeo** (coral vira outro coral). Exportar com `-vf scale=out_color_matrix=bt709 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -pix_fmt yuv420p` e comparar um quadro do MP4 com o PNG do mesmo quadro. **Não corrija "no olho" um problema técnico de cor.**
- **Matéria-prima limita o resultado:** print em baixa, asset comprimido ou com borda suja → troque o asset antes de gastar tempo integrando.
- **Asset pronto nunca está pronto:** adapte escala, recorte, cor, opacidade, velocidade, blur, blend e grão. Busque por **função** (`library/visual/fx/`).
- **Blend mode com intenção:** Multiply = tinta/sombra sobre claro; Screen/Add = luz, glow, holograma. Não use Screen em qualquer overlay claro.

## 10. QC (assista em velocidade real, depois quadro a quadro)
- [ ] O espaço de cada elemento (screen/world/híbrido) está definido e coerente na câmera que se move?
- [ ] UI dentro da tela: recortada, de frente quando carrega a mensagem, reflexo por cima?
- [ ] Uma direção de luz; sombra de contato onde algo toca?
- [ ] Preto, branco e saturação do elemento combinam com a cena (teste em cinza/desfoque)?
- [ ] Nítido demais ou limpo demais em relação ao resto?
- [ ] Estável no tempo: sem tremor de borda, deslizamento, salto de cor ou de grão?
- [ ] Cor da marca no MP4 = cor no PNG (BT.709)?
- [ ] Revisão em tamanho real e **no celular** (borda que parece ruim a 800% pode estar ótima; tremor fica mais visível pequeno).
- [ ] **Teste de remoção:** cada efeito de integração ajuda? Se não, tire. Overlay simples muitas vezes é melhor que composite complexo.
