# Partículas, atmosfera e microdetalhes

> Base: material do usuário "Etapa 13" (2026-10-07), verificado e traduzido para o nosso stack (canvas/SVG + GSAP, render quadro a quadro). Valores são **pontos de partida** em px de um quadro 1080 de largura.
> **Default do hub: sem partículas.** Elas entram só com função. A marca pode restringir mais (kz: só na confirmação de pagamento/agendamento).

## 1. Princípio
**Microdetalhe reforça uma propriedade da cena; não aumenta densidade.** Antes de adicionar partícula, glow, fumaça ou ruído, responda: **que propriedade estou comunicando?**
| quero comunicar | construa | exemplo nosso |
|---|---|---|
| impacto / confirmação | burst curto com origem no gesto | "pago" confirmado solta 16 faíscas do selo |
| energia / velocidade | trail ou streak que segue o objeto | card que voa deixa rastro curto |
| profundidade / ar | poeira ambiente em 2–3 camadas, quase invisível | hero do produto em long hold |
| material / brilho | shine sweep na direção da luz | reflexo único no vidro do celular |
| transformação | dissolve ou formação com continuidade | logo que se monta no fecho |

Se a resposta for "fica mais bonito", resolva com composição, luz ou movimento. **Ausência de partículas também é decisão profissional**: se a cena já tem texto, UI, voz e trilha, provavelmente não precisa.

## 2. Decisões antes de construir
1. **Mundo ou gráfico?** Físico (poeira, fumaça, faísca, chuva) obedece perspectiva, gravidade, luz, foco e parallax. Gráfico (dots, streaks, partículas de UI, dados) tem mais liberdade, mas regras internas consistentes.
2. **Mundo ou quadro?** Partícula do mundo reage à câmera (parallax); partícula de interface fica em screen space (ver `compositing.md` §2).
3. **Asset ou procedural?** Asset (vídeo/sprite pré-renderizado) quando só importa a **aparência**; procedural quando importa o **comportamento** (origem num objeto, trajetória controlada, quantidade variável, câmera atravessando). No nosso stack, o procedural em canvas é o default para bursts e trails; fumaça/névoa realista vem de asset.
4. **Hierarquia:** *primário* (ligado ao evento) · *secundário* (suporte) · *ambiente* (quase invisível). **Ambiente nunca mais contrastado que o sujeito.**

## 3. Comportamento (construa nesta ordem)
emissão → movimento → vida → variação → aparência → forças → luz → integração. Não ajuste tudo de uma vez.
- **Emissor explica a origem:** ponto (faísca de contato), linha/borda (energia num card), círculo (selo que confirma), plano acima (chuva), volume amplo (poeira).
- **Burst precisa de causa:** nasce no quadro do gesto (o clique, o selo), nunca solto. **Contínuo** para fenômeno persistente, com densidade estável (não cresce sem fim).
- **Direção primeiro, dispersão depois:** impacto para a direita → a maioria vai para a direita, poucas divergem. Aleatório dentro de uma força principal.
- **Velocidade inicial comunica a força de origem;** perde energia com arrasto (drag). Nada mantém a velocidade inicial para sempre.
- **Gravidade só para matéria com peso** (faísca, confete, detrito). Poeira flutuante: gravidade ~0.
- **Vida:** morre quando a função visual acaba. Curta (faísca 0,3–0,8 s) · longa (poeira 4–10 s, fumaça).
- **Ciclo de vida:** nascer → estabilizar → sumir. Faísca pode nascer seca e encolher; fumaça nasce suave, expande e desbota. **Faísca esfria:** branco/amarelo → laranja → escuro (ou cor da marca → transparente).
- **Variação quebra repetição sem quebrar identidade:** varie 2–4 entre tamanho, velocidade, vida, rotação e opacidade. Tudo igual = artificial; tudo aleatório = ruído sem fluxo. O natural fica no meio.
- **Material define física:** faísca de metal quica, poeira não, papel/confete gira e plana (drag alto + rotação), pedra quica pouco.
- **Colisão e interação só se aparecem na imagem final.**

### Valores iniciais (1080 px de largura, 30 fps)
| efeito | qtd | vida | velocidade | forças | opacidade |
|---|---|---|---|---|---|
| burst de confirmação | 12–30 | 0,4–0,9 s | 300–900 px/s | drag alto; gravidade leve 800–1500 px/s² | 1 → 0 |
| confete (comemoração rara) | 30–60 | 1,2–2 s | 400–1000 px/s, para cima | gravidade 1200–2000; drag alto; rotação 1–3 voltas/s | 1 → 0 no fim |
| poeira ambiente | 15–40 | 4–10 s | 5–20 px/s | ruído lento; vento comum | 0,05–0,25 |
| trail / rastro | segue o objeto | 0,15–0,4 s | — | — | afina e desbota |

Confete e burst usam **2–3 cores da marca**, nunca o arco-íris.

## 4. Profundidade
- **3 camadas quando é ambiente:** fundo (pequenas, suaves, pouco contraste, lentas) · meio (carregam a leitura) · frente (poucas, grandes, desfocadas). Não é obrigatório usar as 3.
- **Parallax:** frente se move mais que fundo na câmera que se move (frente 1,5–2×, fundo 0,3–0,5×).
- **Tamanho e foco por profundidade:** perto = maior e desfocada; longe = menor, suave e com menos contraste.
- **Nunca sobre rosto, texto ou dado importante.** Use máscara para limpar a área de leitura.
- **Atmosfera ocupa espaço:** névoa/haze reduz contraste e saturação do que está **atrás**; elementos ficam na frente, dentro ou atrás dela. Névoa não é uma camada branca por cima.

## 5. Efeitos específicos (regras curtas)
- **Glow tem fonte:** tela, neon, luz, elemento da marca. Comece menor que a primeira intuição. Em efeito-herói, glow em 2–3 escalas (núcleo pequeno + médio + bloom largo). Confira se corta na borda, estoura ou tira legibilidade.
- **Shine sweep:** luz atravessando o material, na direção da luz do vídeo, **1 vez**; faixa suave em máscara, opacidade ≤ 0,25. Não é uma linha branca passando.
- **Sparkle:** novidade/limpeza/premium, seletivo. Não deixa nada "valioso" por si só.
- **Trail:** segue o caminho do objeto (história recente do movimento); controle comprimento, afinamento e decaimento. Some logo após o movimento, sem atrapalhar leitura.
- **Streaks:** só para alta velocidade e transição energética; nunca em movimento lento ou elegante.
- **Fumaça deforma enquanto sobe** (nunca uma imagem parada deslizando). Neve: lenta, deriva lateral. Chuva: 3 planos com motion blur. Raios de luz precisam de fonte + atmosfera. Poeira aparece onde a luz atravessa.
- **Partícula de dado** só representa dado real; milhares de pontos não viram "visualização". Ver `infograficos-e-dados.md`.
- **Partícula formando logo/texto:** só em momento-herói, curto, legível no fim. Nunca em legenda ou corpo de texto. **Dissolve:** a forma original se mantém no início → fragmenta → dispersa, com direção lógica. Marca minimalista não pede explosão cósmica.
- **Ruído é melhor como sinal de controle** (opacidade, deriva, deformação) do que como camada visível. Baixa frequência = atmosférico; alta = elétrico/nervoso. Premium = amplitude baixa + frequência controlada.
- **Flicker** (neon, tela velha): com períodos de estabilidade, nunca aleatório uniforme.
- **Respiração/micro-movimento** em herói e long hold: lento, pequeno (escala 1,00 → 1,01–1,02, período 3–5 s). Se dá para notar "está crescendo e diminuindo", está demais. Ver "nada fica parado" em `movimento.md`.
- **Distorção de calor/deslocamento:** nasce na fonte, sutil, nunca no quadro inteiro.

## 6. Implementação no nosso stack (render quadro a quadro) ★
O render captura **o tempo t da timeline**, não o relógio do navegador. Partícula que depende de `Math.random()` ou `requestAnimationFrame` sai diferente a cada render, treme no motion blur e quebra o preview.
- **Semente fixa:** gere os parâmetros de cada partícula **uma vez**, com PRNG semeado (ex.: `mulberry32(seed)`). Proibido `Math.random()` dentro do desenho.
- **Estado = função de t** (forma fechada, sem simular passo a passo):
  - posição com drag: `x = x0 + (vx/k)·(1 − e^(−k·a))`, com idade `a = t − nascimento`;
  - gravidade com drag (exato): `y = y0 + (g/k)·a + ((vy − g/k)/k)·(1 − e^(−k·a))`; sem drag: `y = y0 + vy·a + ½·g·a²`;
  - deriva orgânica: ruído suave (simplex/value noise) com entrada `(id, t)`, não números novos por quadro.
- **Desenhe a partir da timeline:** um tween "fantasma" na timeline principal, com `onUpdate` que redesenha o canvas com `tl.time()`. Scrubbing e render ficam idênticos.
- **Pre-roll sem simulação:** comece a avaliar em `t + preRoll` (ex.: 3 s) para a poeira já estar formada no 1º quadro.
- **Loop sem emenda e população constante:** período P; nascimento `bᵢ = (i/N)·P`; idade `a = (t − bᵢ) mod P`. Sempre há N partículas, em fases diferentes.
- **Motion blur barato:** desenhe faísca rápida como traço do ponto em `t − Δ` até `t`, com Δ = obturador (180° a 30 fps = 1/60 s). Partícula lenta fica definida.
- **Desempenho:** pré-renderize o sprite (círculo desfocado) **uma vez** num canvas fora da tela e use `drawImage`; `ctx.filter`/`shadowBlur` por partícula é caro. Ordene por profundidade (fundo → frente) antes de desenhar.
- **Preview leve, final completo:** menos partículas e sem motion blur no preview; restaure e revise antes do export.
- **Grão por quadro:** mesma regra (semente = número do quadro).

## 7. Assets prontos (fumaça, névoa, light leak, bokeh)
- Busque por **função e comportamento**, não por nome. Metadados: tipo · densidade (esparsa→densa) · velocidade · escala · caráter (realista, elegante, energético…) · direção · profundidade · loop · alpha ou fundo preto · licença.
- Ficam em `library/visual/fx/`. **Sem licença registrada, não usa.**
- **Adapte sempre:** duração, velocidade, direção, escala, recorte, cor (ponto de preto/branco, temperatura), opacidade, blur. O espectador não pode reconhecer "um asset colocado".
- **Asset sobre preto + Screen:** confira contaminação de preto, gama e borda; Screen não resolve tudo.
- **Varie, não repita o mesmo arquivo perceptível:** repita a linguagem, não o arquivo. Espelhar, acelerar ou recortar cria variação; **fumaça ao contrário quase sempre denuncia.**

## 8. Curva de densidade e som
- **Densidade de efeitos segue a curva de intensidade** (`pacing-e-atencao.md`): 0–1 nada ou ambiente quase invisível · 2 secundário pontual · 3 burst/trail no evento · 4 efeito-herói (revelação, clímax). Na resolução, os efeitos diminuem.
- **Efeito-herói 1–2 por vídeo** (revelação do produto, logo, clímax). Não distribua por igual.
- **Som acompanha o evento, não cada partícula:** burst de confirmação = 1 SFX no gesto; poeira ambiente = sem som. Textura (zumbido, crepitar, shimmer) só se combinar com a identidade sonora da marca. Ver `sound-design.md`.

## 9. QC
- [ ] Cada efeito tem função nomeada (tabela §1) e origem visível?
- [ ] Direção, gravidade e perda de energia fazem sentido para o material?
- [ ] Variação sem uniformidade e sem caos?
- [ ] Profundidade: parece ocupar espaço ou está "no vidro"?
- [ ] Blur combina com a velocidade (rápida sem blur = sprite; lenta com blur = falso)?
- [ ] Nada passa sobre texto, rosto, dado ou CTA?
- [ ] Loop sem emenda e sem "ligar" no 1º quadro?
- [ ] Determinístico: 2 renders do mesmo quadro saem idênticos?
- [ ] Assistido em tempo real (bonito parado pode distrair em movimento)?
- [ ] **Teste de remoção:** desligue. Se a cena não perde profundidade, atmosfera, significado ou impacto, **remova**.

**Sinais de efeito barato:** partículas demais · glow forte · mesma partícula repetida · fumaça parada deslizando · névoa como camada branca · faísca sem origem · poeira rápida · sem profundidade · sem motion blur · overlay sem ajuste de cor · partícula sobre texto · flare sem fonte · efeito para preencher espaço.

**Microdetalhe profissional não diz "olhe para mim": faz o resto da cena parecer melhor.** Quanto mais secundária a função, menos o efeito pede atenção.
