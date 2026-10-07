# Efeitos: transições, integração e partículas

> Fontes: Etapas 6, 12 e 13 (consolidado em 2026-10-07). Valores = ponto de partida. Default do hub: sem partículas; a marca pode restringir mais.

Px de quadro 1080 de largura, 30 fps. Cortes: `montagem.md`. Som: `som.md`.

## 1. Princípio
- Efeito **comunica uma mudança ou propriedade** (tempo, espaço, energia, impacto, material, profundidade). "Fica bonito" → resolva com composição, luz ou movimento.
- Posicionar ≠ integrar: reproduza só a relação com câmera/luz/objetos que falta.
- **Teste de remoção:** troque por hard cut / desligue. Ficou igual ou melhor → remova.

## 2. Transições
**Escada (use o degrau mais baixo que resolve):** hard cut → J/L → match cut → cut on action → dissolve/fade → motivada por movimento → máscara/objeto → estilizada → efeito muito perceptível.

- Por vídeo: **1–2 tipos** (principal + 1 especial no grande momento). Nunca uma por frase.
- **Momentum atravessa o corte** (direção, velocidade, escala); ponto de interesse de A e B na mesma região.
- Correspondência entre imagens antes de preset; preset é matéria-prima (ajuste tudo).
- **Nunca dissolve solto** para remendar corte ruim.

| mudança | tipo | regra em motion |
|---|---|---|
| neutra | hard cut | na batida ou no fim da frase |
| tempo/memória, passagem suave | dissolve | crossfade 0,3–0,8 s (contemplativo até 1,5 s) |
| capítulo/fim | dip/fade | dip 6–12 quadros para `--bg`/`--inverse-bg` da marca; em social o 1º quadro já tem conteúdo (`ritmo.md`) |
| lateral | push/slide, whip | direção nunca muda sem motivo; whip 6–10 quadros, corte no quadro de maior blur |
| escala | zoom-through | entrar num elemento que vira a próxima tela; centro e velocidade alinhados |
| objeto cobre | máscara/wipe | precisão > complexidade; borda limpa + motion blur |
| transformação | morph | SVG (bolha → card, ícone → tela) |
| impacto | speed ramp | curva, não degrau: A acelera → corte no pico → B começa rápido e assenta |
| observar | hold/freeze | drift sutil; anotação sem cobrir o sujeito |
| comprimir | fast motion | vários estados da UI em sequência rápida |
| foco | blur de lente | nítido → desfoca → corte → B desfocada → recupera; nunca Gaussian solto |
| força real | camera shake | 2–4 quadros, 4–12 px, amplitude decaindo; nunca para frase comum |
| luz/ruptura | flash, glitch, luma, leak | só se a estética pedir; ≤ 3 flashes/s (WCAG 2.3.1) |

Impact zoom e flash frame: raros. Premium = precisão, não quantidade.

## 3. Integração (compositing)
**Defina o espaço antes de construir** (misturar sem intenção = erro nº 1):
| espaço | preso a | exemplos | câmera move/treme |
|---|---|---|---|
| screen | quadro | legenda, título, lower third, HUD | parado |
| world | cena | UI no celular, label na parede | acompanha posição, escala, perspectiva, foco, tremor |
| híbrido | âncora no mundo + leitura no quadro | ponto no produto → linha → label lateral | âncora segue, linha estica, texto estável |

1 nível de realismo por vídeo (fotoreal · estilizado · overlay).

**UI dentro do aparelho**
- `overflow: hidden` + `border-radius` real da tela; nada vaza; status/home bar não cobrem informação.
- Filha do grupo 3D (mesma perspectiva). Sem `#000`/branco estourado: tons do `brand.css`.
- Reflexo **por cima** da UI, branco ≤ 0,25, 1 passada, na direção da luz. Glow da tela só em cena escura.
- Rolagem desacelera no fim. Dedos/cursor acima. Print ≥ 2× o tamanho exibido.

**Luz, sombra, contato**
- **1 direção de luz no vídeo todo**; sombra, reflexo e shine seguem.
- Sombra de contato (curta, escura, na base) > drop shadow. Mais longe = maior, suave, clara. Níveis `--shadow-sm/md/lg`.
- Contato com ≥ 1 sinal (sombra, deformação, luz ou som).

**Matching**
- Luminância antes de matiz. Asset externo saturado: reduza.
- Vetor nítido em cena suave: blur 0,3–0,6 px. Plano desfocado = mesmo desfoque.
- Testes de desfoque e de cinza (mesmo peso dos vizinhos?).
- Multiply = sombra/tinta; Screen/Add = luz. Flare/bloom só com fonte; vinheta e grade globais, no fim.
- Grão só se a marca pedir: último, quadro inteiro, 2–4%, semente = nº do quadro.
- Halo na borda = alpha straight × premultiplied (PNG é straight).
- **Export BT.709 obrigatório** (sem isso o ffmpeg pode usar BT.601 e a cor da marca muda): `-vf scale=out_color_matrix=bt709 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -pix_fmt yuv420p`. Compare um quadro do MP4 com o PNG; não corrija "no olho".

**Ordem:** relação → estrutura → oclusão → câmera → luz → cor → textura → interação → global → simplificar.

## 4. Partículas e microdetalhes
**Default: nenhuma.** kz: só na confirmação de pagamento/agendamento.

| função | construa |
|---|---|
| impacto/confirmação | burst curto com origem no gesto (selo "pago" solta 16 faíscas) |
| energia/velocidade | trail/streak que segue o objeto |
| profundidade/ar | poeira em 2–3 camadas, quase invisível (long hold) |
| material/brilho | shine sweep na direção da luz |
| transformação | formação/dissolve com continuidade (logo no fecho) |

| efeito | qtd | vida | velocidade | forças | opacidade |
|---|---|---|---|---|---|
| burst | 12–30 | 0,4–0,9 s | 300–900 px/s | drag alto; g 800–1500 px/s² | 1 → 0 |
| confete (raro) | 30–60 | 1,2–2 s | 400–1000 px/s, para cima | g 1200–2000; drag alto; 1–3 voltas/s | 1 → 0 no fim |
| poeira | 15–40 | 4–10 s | 5–20 px/s | ruído lento, g ~0 | 0,05–0,25 |
| trail | segue objeto | 0,15–0,4 s | — | — | afina e desbota |

- Burst nasce no quadro do gesto; contínuo com densidade estável. Direção principal, depois dispersão. Drag sempre; gravidade só com peso.
- Varie 2–4 atributos. 2–3 cores da marca, nunca arco-íris. Ambiente nunca mais contrastado que o sujeito.
- **Profundidade:** fundo pequeno/lento · frente grande/desfocada; parallax frente 1,5–2×, fundo 0,3–0,5×.
- **Nunca sobre rosto, texto, dado ou CTA** (máscara na área de leitura).
- Glow só com fonte, menor que a intuição; herói em 2–3 escalas (núcleo + médio + bloom). Shine: 1 vez, faixa suave em máscara, ≤ 0,25.
- Streak só em alta velocidade. Partícula de dado só com dado real (`texto-e-dados.md`). Logo de partículas só no herói.
- Respiração em hold: escala 1,00 → 1,01–1,02, período 3–5 s (`movimento.md`).

## 5. Implementação determinística (render quadro a quadro)
O render captura o **t da timeline**; `Math.random()`/`requestAnimationFrame` geram renders diferentes e tremor no motion blur (`tecnico.md`).
- **Semente:** parâmetros gerados 1 vez com PRNG semeado (`mulberry32(seed)`). Proibido `Math.random()` no desenho.
- **Estado = f(t)**, idade `a = t − nascimento`, sem simular passo a passo:
  - drag: `x = x0 + (vx/k)·(1 − e^(−k·a))`;
  - gravidade + drag: `y = y0 + (g/k)·a + ((vy − g/k)/k)·(1 − e^(−k·a))`; sem drag: `y = y0 + vy·a + ½·g·a²`;
  - deriva: ruído suave com entrada `(id, t)`.
- **Redesenho:** tween fantasma na timeline principal com `onUpdate` que desenha o canvas com `tl.time()`. Scrub = render.
- **Pre-roll:** avalie em `t + preRoll` (ex.: 3 s) para a poeira já estar formada no 1º quadro.
- **Loop com população constante:** período P, `bᵢ = (i/N)·P`, `a = (t − bᵢ) mod P`.
- **Motion blur de streak:** traço de `t − Δ` até `t`, Δ = 1/60 s (180° a 30 fps). Lenta fica definida.
- **Sprite:** círculo desfocado pré-renderizado 1 vez em canvas fora da tela + `drawImage`; evite `ctx.filter`/`shadowBlur` por partícula. Ordene fundo → frente.
- Preview leve (menos partículas, sem blur); restaure antes do export.

## 6. Assets (fumaça, névoa, light leak, bokeh)
- `library/visual/fx/`, busca por **função**. **Sem licença registrada, não usa.**
- Burst/trail = procedural em canvas; fumaça/névoa = asset.
- **Adapte sempre** (duração, velocidade, escala, cor, opacidade, blur). Asset ruim → troque. Não repita o arquivo; fumaça ao contrário denuncia.

## 7. Densidade × intensidade (0–4, `ritmo.md`)
| intensidade | efeitos |
|---|---|
| 0–1 | nada ou ambiente quase invisível |
| 2 | secundário pontual |
| 3 | burst/trail no evento |
| 4 | efeito-herói (revelação, clímax) |
- Herói 1–2 por vídeo; na resolução, diminui. Som: 1 SFX por evento, nunca por partícula; poeira sem som.

## 8. Com filmagem (live action, futuro)
- **Tracking, menor modelo que basta:** ponto → posição+rotação+escala → planar (tela, placa, parede) → câmera 3D (valide com cubo, procure deslize) → roto. Pontos de contraste estável; rotação pede 2 pontos distantes.
- **Troca de tela:** planar → corner pin (CSS `matrix3d` dos 4 cantos) → exposição/temperatura → reflexos originais por cima → motion blur → grão; dedos acima (roto).
- **Oclusão** (fundo → gráfico → pessoa recortada) é a pista de profundidade mais forte; recorte só onde cruza.
- **Roto:** formas grandes primeiro, partes separadas, keyframe onde o movimento muda, feather conforme a borda.
- **Keying:** depois do matte, spill, bordas, cabelo, motion blur e re-luz.

## 9. QC
- [ ] Cada efeito tem função, origem e passa no teste de remoção.
- [ ] ≤ 2 tipos de transição; direção coerente; ≤ 3 flashes/s.
- [ ] Espaço coerente com a câmera; UI recortada, reflexo por cima.
- [ ] 1 direção de luz; sombra de contato.
- [ ] Tom e nitidez combinam (cinza/desfoque).
- [ ] Nada sobre texto, rosto, dado ou CTA.
- [ ] Blur proporcional à velocidade; sem deslize ou tremor de borda.
- [ ] 2 renders do mesmo quadro idênticos; loop sem emenda.
- [ ] Cor no MP4 = PNG (BT.709).
- [ ] Visto em tempo real e no celular. Geral: `qc-final.md`.
