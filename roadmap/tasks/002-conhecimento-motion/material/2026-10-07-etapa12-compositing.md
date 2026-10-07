# [BRUTO] Etapa 12 — Compositing e integração com live action

> Enviado pelo usuário em 2026-10-07, copiado sem edição. Versão destilada: `knowledge/video/compositing.md`.


## 1. Princípio fundamental do compositing

**Categoria:** Compositing / Princípios

### Instruções

O objetivo do compositing é fazer elementos provenientes de fontes diferentes parecerem pertencer à mesma imagem ou à mesma linguagem visual.

Isso pode envolver:

- motion graphics;
- textos;
- telas;
- imagens;
- objetos 2D;
- objetos 3D;
- partículas;
- backgrounds;
- footage adicional;
- efeitos.

Não considere um elemento integrado apenas porque está na posição correta.

Integração depende de múltiplas dimensões:

- movimento;
- perspectiva;
- escala;
- profundidade;
- oclusão;
- iluminação;
- cor;
- foco;
- grain;
- motion blur;
- atmosfera;
- interação com a cena.

### Regra principal

**Posicionar é diferente de integrar.**

---

# 2. Diagnóstico de integração

**Categoria:** Compositing / Sistema decisório

### Instruções

Antes de adicionar um elemento à filmagem, determine:

- ele pertence fisicamente ao mundo da cena?
- é um overlay gráfico?
- está preso a uma superfície?
- ocupa espaço 3D?
- está na frente ou atrás do sujeito?
- precisa receber sombra?
- precisa ser afetado por foco?
- precisa acompanhar câmera?
- precisa acompanhar objeto?
- precisa ser parcialmente ocultado?

Essas respostas determinam a técnica necessária.

### Regra principal

**Defina a relação espacial do elemento com a cena antes de construí-lo.**

---

# 3. Overlay vs elemento integrado

**Categoria:** Compositing / Relação com a cena

### Instruções

Existem duas linguagens principais.

### Overlay

Elemento pertence à camada gráfica do vídeo.

Exemplos:

- captions;
- title;
- HUD;
- lower third;
- chart.

Não precisa necessariamente obedecer à perspectiva física do ambiente.

### Integrated Graphic

Elemento parece existir dentro da filmagem.

Exemplos:

- label preso a prédio;
- texto no chão;
- tela substituída;
- gráfico flutuando ao lado de objeto;
- projeção na parede.

Esse elemento deve obedecer muito mais à lógica da cena.

### Regra principal

**Não misture linguagem de overlay com linguagem diegética sem intenção.**

---

# 4. Escolha do tipo de tracking

**Categoria:** Tracking / Sistema decisório

### Instruções

Escolha tracking de acordo com o problema.

Se precisa seguir um ponto ou objeto relativamente simples:

**Point Tracking.**

Se precisa acompanhar posição, escala e rotação:

**Transform Tracking.**

Se precisa acompanhar uma superfície plana com perspectiva:

**Planar Tracking.**

Se precisa reconstruir o movimento da câmera no espaço:

**3D Camera Tracking.**

Se precisa acompanhar contorno ou isolamento:

**Mask Tracking / Rotoscoping.**

Não utilize a técnica mais complexa automaticamente.

### Regra principal

**Use o menor modelo de tracking capaz de descrever corretamente o movimento.**

---

# 5. Point Tracking

**Categoria:** Tracking / 2D

### Instruções

Use point tracking para elementos com features visualmente identificáveis.

Bons pontos de tracking possuem:

- contraste;
- detalhe;
- forma distinta;
- estabilidade ao longo dos frames.

Evite áreas:

- homogêneas;
- borradas;
- reflexivas;
- muito comprimidas;
- constantemente ocluídas.

### Regra principal

**Tracker precisa de informação visual consistente para seguir.**

---

# 6. Track Feature Quality

**Categoria:** Tracking / Quality

### Instruções

Antes de iniciar tracking, observe o ponto ao longo de parte significativa da cena.

Pergunte:

- permanece visível?
- muda drasticamente de forma?
- sai do frame?
- é coberto?
- recebe motion blur extremo?
- muda de iluminação?

Escolher bem o feature geralmente economiza mais tempo do que corrigir tracking ruim depois.

### Regra principal

**A qualidade do tracking começa na escolha do feature.**

---

# 7. Position Tracking

**Categoria:** Tracking / 2D

### Instruções

Use somente position quando o objeto:

- se desloca;
- não muda significativamente de escala;
- não gira significativamente;
- não sofre perspectiva relevante.

Não calcule informações adicionais se não forem necessárias.

---

# 8. Position + Rotation

**Categoria:** Tracking / 2D

### Instruções

Use quando o objeto se move e gira no plano.

Verifique se os features utilizados oferecem distância suficiente entre si para calcular rotação de forma estável.

### Regra principal

**Rotação precisa de referência espacial, não apenas de um ponto isolado.**

---

# 9. Position + Scale + Rotation

**Categoria:** Tracking / 2D

### Instruções

Use quando distância aparente do objeto varia.

Isso é comum quando:

- objeto aproxima-se;
- câmera aproxima-se;
- objeto afasta-se;
- câmera muda ligeiramente de escala.

Revise se a mudança de escala é realmente física ou resultado de perspectiva que exige solução mais avançada.

---

# 10. Planar Tracking

**Categoria:** Tracking / Superfícies

### Instruções

Utilize planar tracking quando o elemento está preso a uma superfície aproximadamente plana.

Exemplos:

- monitor;
- celular;
- outdoor;
- placa;
- parede;
- mesa;
- papel;
- fachada.

Planar tracking deve acompanhar:

- posição;
- rotação;
- escala;
- perspectiva.

### Regra principal

**Se o problema é uma superfície, rastreie a superfície, não apenas um ponto sobre ela.**

---

# 11. Screen Replacement

**Categoria:** Compositing / Screen Replacement

### Instruções

Ao substituir uma tela:

1. trackeie a superfície;
2. alinhe os quatro cantos;
3. corrija perspectiva;
4. ajuste crop;
5. integre brilho;
6. preserve reflexos quando possível;
7. preserve motion blur;
8. ajuste exposição;
9. ajuste temperatura de cor;
10. adicione grain compatível.

Não considere screen replacement concluído apenas porque o conteúdo acompanha o aparelho.

### Regra principal

**Uma tela real interage com lente, luz, reflexos e exposição.**

---

# 12. Corner Pin

**Categoria:** Compositing / Perspective

### Instruções

Use corner pin para posicionar conteúdo sobre superfícies quadrilaterais.

Verifique os quatro cantos ao longo da sequência.

Problemas comuns:

- drift;
- stretching;
- edge misalignment;
- perspectiva inconsistente.

### Regra principal

**Corners devem permanecer presos à geometria da superfície.**

---

# 13. Screen Black Levels

**Categoria:** Screen Replacement / Polish

### Instruções

Não deixe pretos da nova tela desconectados dos pretos reais da cena.

Ajuste:

- black level;
- contrast;
- exposure;
- gamma.

Uma tela perfeitamente preta em filmagem lavada pode parecer artificial.

### Regra principal

**O display substituído ainda foi fotografado pela mesma câmera.**

---

# 14. Screen Brightness

**Categoria:** Screen Replacement / Lighting

### Instruções

Tela digital pode emitir luz.

Observe se deveria:

- iluminar dedos;
- iluminar rosto;
- gerar glow;
- contaminar superfície próxima.

Não adicione iluminação exagerada quando exposição da cena não indica isso.

### Regra principal

**Se a tela parece luminosa, a cena deve responder proporcionalmente.**

---

# 15. Preserve Reflections

**Categoria:** Screen Replacement / Polish

### Instruções

Quando existir reflexo original sobre a tela, preserve-o quando possível.

Estratégias podem incluir:

- extraction;
- blend modes;
- masks;
- highlight recovery.

Tela sem reflexos em dispositivo altamente reflexivo parece colada.

### Regra principal

**Reflexo pertence ao vidro, não ao conteúdo digital.**

---

# 16. 3D Camera Tracking

**Categoria:** Tracking / 3D

### Instruções

Use camera tracking quando o elemento precisa existir no espaço tridimensional da cena enquanto a câmera se move.

Exemplos:

- texto preso ao chão;
- labels em prédios;
- objeto 3D;
- set extension;
- elementos distribuídos no cenário.

Analise cuidadosamente a qualidade da solução antes de construir elementos sobre ela.

### Regra principal

**Camera track recria a câmera; não rastreia magicamente cada objeto da cena.**

---

# 17. Track Solve Quality

**Categoria:** 3D Tracking / Quality

### Instruções

Antes de aceitar camera solve:

- observe track points;
- verifique perspectiva;
- teste um objeto simples;
- observe sliding;
- procure drift;
- valide chão e paredes.

Um track aparentemente resolvido pode ainda produzir elementos deslizando pela superfície.

### Regra principal

**Teste a solução visualmente antes de investir em compositing complexo.**

---

# 18. Ground Plane

**Categoria:** 3D Compositing / Space

### Instruções

Quando necessário, determine corretamente:

- chão;
- orientação;
- escala;
- origin.

Isso facilita posicionar elementos consistentemente.

### Regra principal

**Espaço 3D precisa de referência espacial coerente.**

---

# 19. Perspective Matching

**Categoria:** Compositing / Perspective

### Instruções

Qualquer elemento integrado precisa compartilhar perspectiva com a filmagem.

Observe:

- horizon;
- vanishing points;
- lens distortion;
- camera angle;
- focal length aparente.

Elementos perfeitamente frontais sobre uma superfície oblíqua parecem overlays.

### Regra principal

**Perspectiva incompatível é percebida antes mesmo de o espectador saber explicar o erro.**

---

# 20. Scale Matching

**Categoria:** Compositing / Scale

### Instruções

Determine escala visual utilizando referências existentes.

Considere:

- pessoas;
- portas;
- objetos conhecidos;
- arquitetura.

Não dimensione elementos apenas pelo espaço disponível na composição.

### Regra principal

**Elementos físicos precisam possuir escala plausível dentro do mundo.**

---

# 21. Lens Matching

**Categoria:** Compositing / Camera

### Instruções

Observe características ópticas:

- field of view;
- distortion;
- depth of field;
- chromatic behavior;
- softness.

Um elemento renderizado com aparência telephoto em footage wide-angle pode parecer desconectado.

### Regra principal

**Elemento integrado precisa parecer observado pela mesma lente.**

---

# 22. Lens Distortion

**Categoria:** Compositing / Lens

### Instruções

Em lentes com distorção perceptível, considere fluxo:

1. undistort footage;
2. composite;
3. redistort resultado.

Isso pode facilitar integração geométrica.

Não aplique distorção arbitrariamente sem analisar lente.

### Regra principal

**O elemento deve sofrer a mesma geometria óptica que a imagem original.**

---

# 23. Depth of Field

**Categoria:** Compositing / Focus

### Instruções

Elemento integrado deve respeitar o plano focal.

Se background está desfocado e gráfico supostamente está naquele plano:

o gráfico também precisa receber blur compatível.

Se foco muda durante o plano:

elementos integrados podem precisar acompanhar essa mudança.

### Regra principal

**Foco comunica distância.**

---

# 24. Defocus Matching

**Categoria:** Compositing / Focus

### Instruções

Não utilize apenas Gaussian Blur arbitrariamente.

Observe:

- quantidade;
- edge behavior;
- bokeh;
- highlights;
- lens character.

Objetivo é aproximar a aparência óptica do footage.

### Regra principal

**Blur deve parecer resultado da lente, não filtro digital adicionado.**

---

# 25. Motion Blur Matching

**Categoria:** Compositing / Motion

### Instruções

Elementos rastreados precisam acompanhar o motion blur da filmagem.

Observe:

- shutter aparente;
- velocidade;
- direção;
- intensidade.

Elemento perfeitamente nítido durante movimento borrado denuncia imediatamente o composite.

### Regra principal

**Movimento compartilhado exige blur compartilhado.**

---

# 26. Rotoscoping

**Categoria:** Compositing / Isolation

### Instruções

Use rotoscopia para separar elementos da filmagem quando precisar controlar:

- foreground;
- background;
- oclusão;
- efeitos locais;
- color correction localizada.

Sempre procure primeiro saber se tracking pode reduzir trabalho manual.

### Regra principal

**Roto deve seguir forma percebida, não simplesmente contorno aproximado.**

---

# 27. Roto Strategy

**Categoria:** Rotoscoping / Workflow

### Instruções

Comece por:

- formas grandes;
- partes rígidas;
- movimentos simples.

Separe regiões com movimentos diferentes.

Exemplo:

corpo;
braço;
mão;
cabelo.

Não tente necessariamente resolver personagem complexo com uma única máscara gigante.

### Regra principal

**Quebre formas de acordo com comportamento de movimento.**

---

# 28. Roto Keyframes

**Categoria:** Rotoscoping / Timing

### Instruções

Não crie keyframe em todo frame automaticamente.

Defina shapes nos momentos principais e refine intermediários.

Adicione mais keyframes quando:

- forma muda;
- direção muda;
- oclusão acontece;
- tracking falha.

### Regra principal

**Use keyframes onde o movimento realmente muda.**

---

# 29. Roto Edge Quality

**Categoria:** Rotoscoping / Polish

### Instruções

Observe especialmente:

- cabelo;
- dedos;
- motion blur;
- transparências;
- roupas soltas;
- objetos finos.

Edge perfeito demais também pode parecer falso.

### Regra principal

**Borda integrada precisa possuir a mesma qualidade óptica da filmagem.**

---

# 30. Feather

**Categoria:** Masking / Edges

### Instruções

Feather deve acompanhar a natureza da borda.

Sharp object:

feather pequeno.

Soft hair:

mais transição.

Defocus:

edge mais suave.

Não aplique o mesmo feather global a toda máscara.

### Regra principal

**Bordas diferentes podem precisar de tratamentos diferentes.**

---

# 31. Mask Expansion

**Categoria:** Masking / Edges

### Instruções

Use expansão ou contração para corrigir:

- halos;
- bordas sobrando;
- background contaminando.

Faça ajustes pequenos e revise em movimento.

### Regra principal

**Edge cleanup deve remover artefatos sem destruir silhueta.**

---

# 32. Occlusion

**Categoria:** Compositing / Depth

### Instruções

Quando um objeto da cena passa na frente do elemento inserido, o elemento deve ser ocultado corretamente.

Exemplo:

texto atrás de pessoa.

Pessoa cruza o texto.

Isso exige:

- roto;
- mask;
- depth information;
- matte.

### Regra principal

**Oclusão é uma das pistas mais fortes de profundidade.**

---

# 33. Foreground Separation

**Categoria:** Compositing / Depth

### Instruções

Separar foreground pode permitir que graphics existam entre camadas reais da cena.

Estrutura:

background footage;

graphic;

foreground roto.

Isso cria profundidade sem exigir 3D complexo.

### Regra principal

**Mesmo compositing 2.5D pode produzir forte sensação espacial quando a oclusão está correta.**

---

# 34. Parallax

**Categoria:** Compositing / Depth

### Instruções

Elementos em profundidades diferentes devem apresentar velocidades aparentes diferentes durante movimento de câmera.

Foreground:

move mais.

Background:

move menos.

Quando elementos gráficos ocupam espaço 3D, respeite essa relação.

### Regra principal

**Parallax comunica profundidade através de movimento relativo.**

---

# 35. Layered Depth

**Categoria:** Compositing / Spatial Design

### Instruções

Pense a cena em planos:

- foreground;
- subject;
- midground;
- background.

Determine onde o graphic pertence.

Não deixe todos os elementos na mesma profundidade visual.

### Regra principal

**Profundidade é uma hierarquia espacial.**

---

# 36. Shadows

**Categoria:** Compositing / Lighting

### Instruções

Quando elemento deveria bloquear luz, considere sombra.

Observe:

- direção;
- softness;
- opacity;
- distance;
- color;
- contact.

Não use drop shadow padrão automaticamente.

### Regra principal

**Sombras precisam responder à iluminação da cena.**

---

# 37. Contact Shadow

**Categoria:** Compositing / Grounding

### Instruções

Objetos próximos a superfícies geralmente apresentam sombra de contato mais concentrada.

Essa pequena sombra pode ser mais importante para grounding do que uma sombra grande e dramática.

### Regra principal

**Contato visual com a superfície precisa de evidência de contato.**

---

# 38. Shadow Softness

**Categoria:** Compositing / Lighting

### Instruções

Sombras mais distantes da superfície normalmente podem apresentar maior suavidade.

Considere também tamanho e natureza da fonte de luz.

Não utilize softness uniforme quando geometria sugere variação.

---

# 39. Light Direction

**Categoria:** Compositing / Lighting

### Instruções

Identifique direção dominante da luz.

Observe:

- highlights;
- sombras;
- rosto;
- chão;
- arquitetura.

Elementos integrados devem responder coerentemente.

### Regra principal

**Luz é uma estrutura espacial, não apenas um ajuste de brightness.**

---

# 40. Light Intensity

**Categoria:** Compositing / Lighting

### Instruções

Não faça elemento muito mais contrastado ou luminoso que a cena sem razão.

Analise:

- exposure;
- dynamic range;
- highlight roll-off.

### Regra principal

**O elemento deve existir dentro da mesma exposição percebida.**

---

# 41. Light Color

**Categoria:** Compositing / Lighting

### Instruções

Observe temperatura e contaminação de luz.

Ambiente quente:

elementos podem receber influência quente.

Luz azul lateral:

elementos naquele espaço podem precisar responder.

### Regra principal

**Iluminação possui cor além de intensidade.**

---

# 42. Light Wrap

**Categoria:** Compositing / Edge Integration

### Instruções

Em certos composites, luz do background pode contaminar discretamente bordas do foreground.

Light wrap pode ajudar integração.

Use com extremo controle.

Excesso cria halo artificial.

### Regra principal

**Light wrap deve sugerir interação luminosa, não desenhar uma borda brilhante.**

---

# 43. Color Matching

**Categoria:** Compositing / Color

### Instruções

Ao integrar footage ou elementos renderizados, compare:

- exposure;
- contrast;
- black point;
- white point;
- saturation;
- temperature;
- tint.

Não comece ajustando apenas hue.

### Regra principal

**Matching de luminância costuma ser tão importante quanto matching de cor.**

---

# 44. Black Point Matching

**Categoria:** Compositing / Color

### Instruções

Compare as regiões escuras.

Se um elemento possui preto absoluto enquanto a imagem possui shadows levantadas, ele parecerá artificial.

Ajuste o black point ao mundo da cena.

---

# 45. White Point Matching

**Categoria:** Compositing / Color

### Instruções

Highlights também precisam pertencer ao mesmo range.

Evite whites digitais perfeitos quando footage não possui esse nível.

### Regra principal

**Brancos e pretos definem a faixa tonal do mundo visual.**

---

# 46. Saturation Matching

**Categoria:** Compositing / Color

### Instruções

Elementos externos frequentemente chegam mais saturados que footage.

Compare especialmente:

- reds;
- blues;
- skin-adjacent colors.

Reduza saturação quando necessário.

---

# 47. Contrast Matching

**Categoria:** Compositing / Color

### Instruções

Um elemento pode possuir cores corretas e ainda parecer falso por contraste incompatível.

Observe:

- local contrast;
- global contrast;
- haze;
- distance.

Elementos distantes normalmente podem apresentar menos contraste devido à atmosfera.

### Regra principal

**Contraste também comunica profundidade.**

---

# 48. Atmospheric Perspective

**Categoria:** Compositing / Depth

### Instruções

Objetos muito distantes podem receber:

- menor contraste;
- menor saturação;
- haze;
- color contamination.

Não aplique com exagero.

### Regra principal

**Distância altera aparência visual, não apenas tamanho.**

---

# 49. Grain Matching

**Categoria:** Compositing / Texture

### Instruções

Elementos digitais perfeitamente limpos sobre footage com noise ou grain geralmente parecem colados.

Depois do compositing, considere adicionar textura compatível.

Observe:

- grain size;
- intensity;
- color;
- luminance behavior.

### Regra principal

**Tudo que passa pela mesma câmera deveria compartilhar alguma assinatura de imagem.**

---

# 50. Grain Order

**Categoria:** Compositing / Workflow

### Instruções

Quando possível, grain global pode ser aplicado depois de grande parte do compositing para ajudar unificação.

Isso não elimina necessidade de matching anterior.

### Regra principal

**Grain é acabamento de integração, não solução para composite ruim.**

---

# 51. Noise vs Grain

**Categoria:** Compositing / Texture

### Instruções

Não trate noise digital e film grain como equivalentes.

Escolha textura compatível com:

- câmera;
- ISO aparente;
- estética;
- material.

---

# 52. Sharpness Matching

**Categoria:** Compositing / Detail

### Instruções

Compare nível de nitidez.

Elemento muito nítido sobre footage suave parece artificial.

Considere:

- slight blur;
- sharpening;
- scaling quality.

### Regra principal

**Resolução matemática e nitidez percebida são coisas diferentes.**

---

# 53. Edge Sharpness

**Categoria:** Compositing / Edges

### Instruções

Observe edges de elementos inseridos.

Vetores e renders costumam possuir bordas mais perfeitas do que footage.

Pode ser necessário:

- slight softness;
- motion blur;
- grain;
- antialiasing apropriado.

### Regra principal

**Bordas perfeitas demais podem ser tão falsas quanto bordas ruins.**

---

# 54. Keying

**Categoria:** Compositing / Keying

### Instruções

Use keying para remover backgrounds de cor controlada, principalmente:

- green screen;
- blue screen.

Key limpo não termina na remoção do fundo.

Também revise:

- spill;
- edges;
- transparency;
- hair;
- motion blur;
- noise.

### Regra principal

**Keying cria matte; compositing torna o matte convincente.**

---

# 55. Spill Suppression

**Categoria:** Keying / Color

### Instruções

Observe contaminação verde ou azul em:

- pele;
- cabelo;
- roupas;
- superfícies reflexivas.

Remova spill sem destruir cores naturais.

### Regra principal

**Neutralizar fundo não significa neutralizar o sujeito.**

---

# 56. Key Edge Cleanup

**Categoria:** Keying / Edges

### Instruções

Revise:

- holes;
- chatter;
- halos;
- semi-transparent edges;
- hair detail.

Faça ajustes locais quando necessário.

Não tente resolver todos os problemas com um único slider global.

---

# 57. Despill + Re-light

**Categoria:** Keying / Integration

### Instruções

Depois do despill, foreground pode precisar receber nova influência cromática do ambiente final.

Exemplo:

sujeito originalmente em green screen;

novo ambiente possui luz quente.

Pode ser necessário contaminar bordas e sombras discretamente com essa luz.

### Regra principal

**Remover a luz do estúdio não basta; o novo ambiente precisa começar a afetar o sujeito.**

---

# 58. Edge Chatter

**Categoria:** Roto / Key / Quality

### Instruções

Bordas que tremem entre frames são altamente perceptíveis.

Revise máscaras e mattes em reprodução.

Estabilidade temporal é tão importante quanto precisão de um frame isolado.

### Regra principal

**Boa borda precisa ser correta no espaço e estável no tempo.**

---

# 59. Temporal Consistency

**Categoria:** Compositing / Quality

### Instruções

Verifique se efeitos permanecem consistentes ao longo da sequência.

Procure:

- flicker;
- exposure jumps;
- mask pops;
- grain changes;
- blur changes;
- tracking drift.

### Regra principal

**Composite é uma sequência temporal, não uma coleção de frames bons.**

---

# 60. Track Drift

**Categoria:** Tracking / Quality Control

### Instruções

Drift acontece quando elemento gradualmente perde relação com objeto rastreado.

Procure especialmente no:

- início;
- meio;
- fim;
- mudanças rápidas;
- oclusões.

Corrija antes de adicionar polish.

### Regra principal

**Não tente esconder tracking ruim com motion blur ou efeitos.**

---

# 61. Tracking Error Priorities

**Categoria:** Tracking / Repair

### Instruções

Quando tracking falhar:

1. identifique trecho problemático;
2. procure feature melhor;
3. refine track;
4. combine tracks quando necessário;
5. ajuste manualmente apenas onde preciso.

Não reanime toda sequência manualmente imediatamente.

---

# 62. Occlusion Interruptions

**Categoria:** Tracking / Repair

### Instruções

Se feature rastreado for temporariamente ocultado:

- use outro feature;
- continue track depois da oclusão;
- blend tracking data;
- ajuste manualmente transição.

### Regra principal

**Tracking precisa sobreviver a eventos reais da cena, não apenas frames fáceis.**

---

# 63. Screen Edge Interaction

**Categoria:** Screen Replacement / Polish

### Instruções

Observe dedos, bordas de aparelho e objetos que cruzam a tela.

Esses elementos precisam permanecer acima do conteúdo substituído.

Use roto ou mattes.

### Regra principal

**Conteúdo de tela deve permanecer atrás do vidro e dos objetos fisicamente à frente dele.**

---

# 64. UI Inside Devices

**Categoria:** Compositing / UI

### Instruções

Ao colocar UI dentro de dispositivo, considere:

- perspective;
- safe crop;
- rounded corners;
- notch;
- reflections;
- brightness;
- scroll behavior;
- refresh appearance.

Não permita que UI ultrapasse fisicamente os limites da tela.

---

# 65. Graphics Attached to Objects

**Categoria:** Compositing / Motion Graphics

### Instruções

Labels ou callouts presos a objetos devem acompanhar:

- movement;
- scale;
- rotation;
- perspective quando necessário.

Mas texto auxiliar pode permanecer orientado para câmera se essa for a linguagem escolhida.

Defina explicitamente se o graphic:

**pertence ao objeto**

ou

**apenas referencia o objeto.**

---

# 66. Callout Anchor

**Categoria:** Compositing / Callouts

### Instruções

Quando label aponta para objeto em movimento:

anchor deve permanecer estável no feature correto.

Linha pode:

- esticar;
- rotacionar;
- adaptar-se.

Texto pode permanecer em região mais estável do frame.

### Regra principal

**Separar alvo rastreado de área de leitura pode melhorar legibilidade.**

---

# 67. Graphics Behind People

**Categoria:** Compositing / Depth

### Instruções

Para colocar graphics atrás do sujeito:

1. crie ou obtenha matte do sujeito;
2. coloque graphic entre footage e foreground;
3. revise edges;
4. revise motion blur;
5. revise oclusões.

Não transforme toda cena em roto complexo se apenas pequena região precisa de oclusão.

---

# 68. Graphics Passing Through Scene

**Categoria:** Compositing / Spatial Motion

### Instruções

Se elemento atravessa diferentes profundidades:

- foreground;
- atrás do sujeito;
- novamente foreground;

planeje mattes e ordem de layers para cada região.

### Regra principal

**Mudança de profundidade precisa ser coerente durante toda trajetória.**

---

# 69. Projection / Surface Graphics

**Categoria:** Compositing / Surface Integration

### Instruções

Quando gráfico deve parecer projetado ou pintado sobre superfície, considere:

- perspective;
- surface texture;
- blend mode;
- shadows/highlights existentes;
- displacement;
- roughness aparente.

Não preserve gráfico perfeitamente limpo se superfície é irregular.

### Regra principal

**Superfície deve modificar o gráfico.**

---

# 70. Displacement

**Categoria:** Compositing / Surface

### Instruções

Use displacement quando gráfico precisa acompanhar irregularidades de:

- tecido;
- parede;
- papel;
- pele;
- superfície orgânica.

Use com sutileza.

### Regra principal

**Deformação deve ser guiada pela superfície, não por ruído aleatório.**

---

# 71. Blend Modes

**Categoria:** Compositing / Integration

### Instruções

Blend modes podem ajudar elementos interagirem com luminância e cor da cena.

Use com intenção.

Não escolha Screen, Multiply ou Overlay apenas porque parecem melhores rapidamente.

Observe se comportamento físico faz sentido.

---

# 72. Multiply

**Categoria:** Compositing / Blend

### Instruções

Pode funcionar para:

- tinta;
- sombras;
- elementos escuros sobre superfície clara.

Mas altera cor e contraste.

Revise cuidadosamente.

---

# 73. Screen/Add

**Categoria:** Compositing / Blend

### Instruções

Pode funcionar para:

- luz;
- glow;
- holographic elements;
- highlights.

Não use para qualquer overlay claro.

### Regra principal

**Blend mode precisa corresponder ao tipo de interação visual pretendida.**

---

# 74. Holographic Graphics

**Categoria:** Compositing / Stylized Integration

### Instruções

Se a estética exigir hologramas ou graphics futuristas, considere:

- transparency;
- emission;
- light spill;
- occlusion;
- perspective;
- flicker control;
- depth.

Mesmo elementos irreais precisam obedecer às regras internas da cena.

### Regra principal

**Fantasia visual ainda precisa de consistência física própria.**

---

# 75. Reflections

**Categoria:** Compositing / Environment Interaction

### Instruções

Objetos ou graphics brilhantes podem precisar refletir ou aparecer em superfícies próximas.

Não crie reflexos automaticamente.

Avalie:

- material;
- angle;
- lighting;
- visibility.

### Regra principal

**Reflexo deve existir apenas onde o mundo visual permitir.**

---

# 76. Contact Interaction

**Categoria:** Compositing / Physical Integration

### Instruções

Quando elemento toca algo real, procure sinais de interação:

- shadow;
- reflection;
- displacement;
- light;
- occlusion.

Contato sem consequência visual parece flutuar.

---

# 77. Camera Shake Integration

**Categoria:** Compositing / Camera

### Instruções

Se a câmera sofre shake real, elemento integrado deve compartilhar o mesmo movimento.

Elementos gráficos overlay podem permanecer independentes se fizer parte da linguagem.

### Regra principal

**Determine se o elemento pertence à câmera ou ao mundo.**

---

# 78. World Space vs Screen Space

**Categoria:** Compositing / Spatial Model

### Instruções

Classifique graphics como:

**Screen Space**

presos ao frame.

Exemplo:

HUD, caption.

**World Space**

presos à cena.

Exemplo:

label em prédio.

Essa classificação determina comportamento durante movimento da câmera.

### Regra principal

**Screen space acompanha a tela. World space acompanha o mundo.**

---

# 79. Hybrid Graphics

**Categoria:** Compositing / Motion Design

### Instruções

É possível conectar elementos world-space a informações screen-space.

Exemplo:

ponto rastreado no produto;

linha conecta;

label permanece estável na lateral do frame.

Isso pode preservar integração e legibilidade.

### Regra principal

**Use diferentes espaços quando isso resolver melhor diferentes funções.**

---

# 80. Source Quality

**Categoria:** Compositing / Asset Selection

### Instruções

Antes de iniciar composite, verifique qualidade dos assets.

Observe:

- resolution;
- alpha;
- compression;
- color space;
- frame rate;
- bit depth;
- edges.

Não invista horas tentando integrar asset de qualidade insuficiente se versão melhor puder ser encontrada.

### Regra principal

**Qualidade do composite não pode superar indefinidamente qualidade de sua matéria-prima.**

---

# 81. Alpha Channels

**Categoria:** Compositing / Technical

### Instruções

Verifique:

- straight alpha;
- premultiplied alpha;
- edge contamination.

Halos pretos ou brancos podem vir de interpretação incorreta de alpha.

### Regra principal

**Problemas de alpha precisam ser resolvidos antes do polish estético.**

---

# 82. Color Space

**Categoria:** Compositing / Technical

### Instruções

Assets provenientes de diferentes fontes podem utilizar transforms ou espaços de cor diferentes.

Evite decisões de matching antes de garantir interpretação correta.

### Regra principal

**Não corrija artisticamente um problema técnico de color management.**

---

# 83. Pre-multiplication Artifacts

**Categoria:** Compositing / Edge Quality

### Instruções

Procure halos em bordas transparentes.

Especialmente:

- motion graphics;
- renders 3D;
- PNG;
- keyed footage.

Corrija interpretação ou edge treatment.

---

# 84. Asset Search

**Categoria:** Asset Library / Compositing

### Instruções

Antes de criar elementos auxiliares, procure biblioteca interna por:

- grain;
- lens dirt;
- light leaks;
- bokeh;
- smoke;
- fog;
- shadow assets;
- reflections;
- texture maps;
- screen reflections;
- mattes;
- transitions;
- particles.

Não use asset apenas porque existe.

Primeiro determine qual interação precisa ser criada.

---

# 85. Texture Assets

**Categoria:** Asset Library / Compositing

### Instruções

Texturas pré-prontas podem ajudar a integrar:

- paper;
- walls;
- film;
- screens;
- holograms;
- projections.

Escolha textura compatível com material.

### Regra principal

**Texture deve explicar materialidade, não simplesmente adicionar detalhe.**

---

# 86. Atmospheric Assets

**Categoria:** Asset Library / Environment

### Instruções

Fog, haze, smoke e dust podem integrar planos de profundidade.

Elementos mais distantes podem ficar parcialmente atrás desses elementos atmosféricos.

Não use partículas como decoração universal.

### Regra principal

**Atmosfera deve existir dentro do espaço, não apenas sobre o frame.**

---

# 87. Occlusion by Atmosphere

**Categoria:** Compositing / Depth

### Instruções

Se smoke passa na frente de elemento integrado, o elemento deve ser parcialmente ocultado.

Essa pequena interação aumenta integração significativamente.

---

# 88. Lens Effects

**Categoria:** Compositing / Lens

### Instruções

Lens effects podem incluir:

- bloom;
- flare;
- diffraction;
- chromatic aberration;
- vignette.

Use apenas quando coerentes com footage.

Não aplique lens flare para tornar composite “cinematográfico”.

### Regra principal

**Efeito de lente deve parecer produzido pela lente.**

---

# 89. Lens Flare

**Categoria:** Compositing / Optical Effects

### Instruções

Flare deve possuir causa luminosa plausível ou intenção estilística explícita.

Observe:

- source position;
- intensity;
- occlusion;
- camera movement.

Quando fonte luminosa sai ou é ocluída, flare pode responder.

---

# 90. Bloom

**Categoria:** Compositing / Optical Effects

### Instruções

Highlights muito intensos podem espalhar luz.

Use bloom principalmente em:

- screens;
- neon;
- lights;
- emissive graphics.

Mantenha highlights legíveis.

---

# 91. Chromatic Aberration

**Categoria:** Compositing / Optical Effects

### Instruções

Se footage possui aberração cromática perceptível nas bordas, elementos integrados podem precisar de matching discreto.

Não introduza aberração apenas como efeito estilístico sem razão.

---

# 92. Vignette

**Categoria:** Compositing / Optical Effects

### Instruções

Se footage apresenta queda de exposição nas bordas, elementos integrados devem ser afetados pelo mesmo frame final.

Preferencialmente, efeitos ópticos globais podem ser aplicados depois do composite quando isso fizer sentido.

---

# 93. Global Integration Pass

**Categoria:** Compositing / Polish

### Instruções

Depois de integrar individualmente os elementos, realize uma passagem global.

Considere:

- color grade;
- grain;
- optical effects;
- slight atmosphere;
- sharpening/softening.

Isso pode ajudar a unificar o resultado.

### Regra principal

**A última camada de integração pode ser compartilhada pelo frame inteiro.**

---

# 94. Integration Stack

**Categoria:** Compositing / Workflow

### Instruções

Uma ordem conceitual possível:

1. tracking;
2. perspective;
3. scale;
4. masking/occlusion;
5. color matching;
6. lighting interaction;
7. focus;
8. motion blur;
9. texture/grain;
10. optical effects;
11. global grade.

A ordem exata pode variar conforme software e técnica.

### Regra principal

**Resolva estrutura antes de acabamento.**

---

# 95. Structural Pass

**Categoria:** Compositing / Workflow

### Instruções

Primeiro valide apenas:

- track;
- position;
- scale;
- perspective;
- occlusion.

Não perca tempo refinando glow enquanto o elemento ainda desliza pela cena.

---

# 96. Look Pass

**Categoria:** Compositing / Workflow

### Instruções

Depois da estrutura:

- exposure;
- contrast;
- color;
- focus;
- shadows;
- reflections.

---

# 97. Texture Pass

**Categoria:** Compositing / Workflow

### Instruções

Depois:

- grain;
- noise;
- edge treatment;
- atmosphere;
- optical imperfections.

---

# 98. Motion Pass

**Categoria:** Compositing / Workflow

### Instruções

Revise:

- motion blur;
- camera motion;
- parallax;
- tracking;
- temporal stability.

---

# 99. Sound Interaction

**Categoria:** Compositing / Sound Design

### Instruções

Se elemento integrado produz acontecimento perceptível, considere som.

Exemplo:

hologram liga;

screen ativa;

object lands;

graphic snaps.

Não sonorize apenas porque algo foi compositado.

### Regra principal

**Som deve reforçar a existência do objeto no mundo quando isso fizer sentido.**

---

# 100. Realism vs Graphic Style

**Categoria:** Compositing / Art Direction

### Instruções

Nem todo composite precisa buscar fotorealismo.

Determine intenção:

**Photoreal**

elemento deve desaparecer dentro da cena.

**Stylized Integration**

elemento pode permanecer claramente gráfico, mas precisa responder ao espaço.

**Overlay**

elemento pertence à linguagem editorial.

### Regra principal

**Integração não significa necessariamente realismo; significa coerência com a regra visual escolhida.**

---

# 101. Premium Graphic Integration

**Categoria:** Compositing / Motion Graphics

### Instruções

Em gráficos integrados de alto nível, procure pequenas relações com footage:

- linhas passam atrás de objetos;
- labels acompanham perspectiva;
- sombras discretas;
- graphics respondem à câmera;
- luz influencia elementos;
- depth of field afeta layers.

Não é necessário utilizar todas.

Uma ou duas relações bem executadas podem vender a integração.

### Regra principal

**Poucas interações espaciais precisas valem mais que muitos efeitos superficiais.**

---

# 102. Avoid Overcompositing

**Categoria:** Compositing / Restraint

### Instruções

Não tente demonstrar capacidade técnica em cada plano.

Evite adicionar:

- tracking;
- particles;
- roto;
- depth;
- flares;

quando um simples overlay seria melhor.

### Regra principal

**Complexidade técnica só possui valor quando melhora a comunicação ou direção visual.**

---

# 103. Quality Control — Tracking

**Categoria:** Compositing / QC

### Instruções

Assista em velocidade normal.

Procure:

- drift;
- jitter;
- sliding;
- scale errors;
- perspective errors.

Depois revise frames problemáticos individualmente.

---

# 104. Quality Control — Perspective

**Categoria:** Compositing / QC

### Instruções

Pergunte:

- orientação corresponde à superfície?
- vanishing points fazem sentido?
- escala muda corretamente?
- elementos parecem inclinados corretamente?

---

# 105. Quality Control — Occlusion

**Categoria:** Compositing / QC

### Instruções

Procure todos os objetos que cruzam o elemento.

Verifique:

- mãos;
- cabeça;
- cabelo;
- roupa;
- objetos;
- bordas.

Mesmo alguns frames incorretos podem quebrar a ilusão.

---

# 106. Quality Control — Edges

**Categoria:** Compositing / QC

### Instruções

Amplie.

Procure:

- halos;
- matte lines;
- sharp edges;
- edge chatter;
- spill;
- clipping.

Depois volte ao tamanho real.

---

# 107. Quality Control — Color

**Categoria:** Compositing / QC

### Instruções

Compare:

- black point;
- white point;
- saturation;
- temperature;
- contrast.

Faça comparação também em grayscale quando útil.

---

# 108. Quality Control — Focus

**Categoria:** Compositing / QC

### Instruções

Pergunte:

- deveria estar em foco?
- blur corresponde à profundidade?
- foco muda ao longo do plano?
- graphic fica nítido demais durante rack focus?

---

# 109. Quality Control — Motion Blur

**Categoria:** Compositing / QC

### Instruções

Pause em regiões de movimento intenso.

Compare blur do elemento inserido com blur dos objetos reais próximos.

---

# 110. Quality Control — Grain

**Categoria:** Compositing / QC

### Instruções

Observe a 100%.

Elemento possui textura semelhante?

Grain muda entre layers?

Noise parece estático quando footage muda?

---

# 111. Quality Control — Lighting

**Categoria:** Compositing / QC

### Instruções

Pergunte:

- direção da sombra faz sentido?
- exposição combina?
- highlights são coerentes?
- elemento deveria emitir luz?
- deveria receber contaminação de luz?

---

# 112. Quality Control — Temporal Stability

**Categoria:** Compositing / QC

### Instruções

Assista repetidamente.

Procure qualquer:

- flicker;
- jitter;
- pop;
- edge change;
- color jump;
- tracking jump.

### Regra principal

**Um composite precisa sobreviver ao movimento, não apenas ao frame parado.**

---

# 113. Difference Test

**Categoria:** Compositing / QC

### Instruções

Quando possível, alterne rapidamente entre:

composite;

e footage original.

Isso ajuda a perceber:

- mudanças excessivas;
- tracking;
- exposição;
- edges.

---

# 114. Blur Test

**Categoria:** Compositing / QC

### Instruções

Desfoque mentalmente ou temporariamente a imagem.

Pergunte se massas de:

- luz;
- cor;
- contraste;

do elemento inserido ainda parecem compatíveis com a cena.

Pode revelar mismatches tonais escondidos por detalhes.

---

# 115. Flip Test

**Categoria:** Compositing / QC

### Instruções

Em certos casos, espelhar temporariamente o frame pode ajudar a enxergar composição e erros com olhar novo.

Não é necessário para todo composite.

---

# 116. Full-frame Review

**Categoria:** Compositing / QC

### Instruções

Não permaneça ampliado durante toda revisão.

Depois do micro-polimento, assista novamente em tamanho real.

Um edge que parece imperfeito a 800% pode ser completamente adequado em reprodução.

### Regra principal

**Otimize para a experiência final, não para zoom extremo isolado.**

---

# 117. Device Review

**Categoria:** Compositing / QC

### Instruções

Quando destino incluir smartphone, verifique se integração continua convincente em escala pequena.

Pequenos detalhes podem desaparecer.

Outros problemas, como jitter, podem ficar ainda mais aparentes.

---

# 118. Asset Library para Compositing

**Categoria:** Asset Library / Sistema

### Instruções

A biblioteca interna pode possuir categorias como:

- grain;
- noise;
- dust;
- fog;
- smoke;
- particles;
- light leaks;
- flares;
- bokeh;
- reflections;
- glass;
- shadows;
- screen reflections;
- mattes;
- lens dirt;
- textures;
- displacement maps;
- transition elements.

Cada asset deve possuir metadados quando possível:

- type;
- style;
- intensity;
- resolution;
- alpha;
- loopability;
- color;
- intended use.

### Regra principal

**Assets de integração precisam ser encontráveis por função.**

---

# 119. Asset Adaptation

**Categoria:** Asset Library / Compositing

### Instruções

Nunca presuma que overlay pré-pronto está finalizado.

Adapte:

- scale;
- crop;
- color;
- opacity;
- speed;
- blur;
- blend;
- grain.

### Regra principal

**Asset precisa pertencer à cena depois da adaptação.**

---

# 120. Pipeline mestre de compositing

**Categoria:** Compositing / Workflow

### Instruções

Para qualquer integração com live action:

### 1. DEFINE RELATIONSHIP

Determine se elemento pertence:

- à tela;
- à superfície;
- ao objeto;
- ao espaço 3D;
- ao foreground;
- ao background.

### 2. CHOOSE TRACKING

Escolha:

- point;
- transform;
- planar;
- 3D camera;
- roto.

### 3. SOLVE STRUCTURE

Resolva:

- position;
- scale;
- rotation;
- perspective;
- depth.

### 4. SOLVE OCCLUSION

Determine o que passa na frente e atrás.

### 5. MATCH CAMERA

Resolva:

- focus;
- blur;
- distortion;
- motion blur.

### 6. MATCH LIGHT

Resolva:

- exposure;
- direction;
- shadows;
- highlights.

### 7. MATCH COLOR

Resolva:

- black point;
- white point;
- contrast;
- saturation;
- temperature.

### 8. MATCH TEXTURE

Resolva:

- grain;
- noise;
- sharpness;
- edges.

### 9. ADD INTERACTION

Quando necessário:

- shadows;
- reflections;
- light spill;
- atmosphere.

### 10. GLOBAL INTEGRATION

Aplique acabamento compartilhado quando adequado.

### 11. REVIEW MOTION

Assista em tempo real procurando drift e jitter.

### 12. REVIEW FRAME

Inspecione frames críticos.

### 13. SIMPLIFY

Remova efeitos que não melhoram a integração.

---

# 121. Princípio mestre

**Categoria:** Compositing / Princípio mestre

### Instruções

Quando um elemento parece “colado por cima”, não resolva imediatamente adicionando:

- glow;
- shadow;
- blur;
- grain.

Primeiro diagnostique qual relação está faltando.

Pode ser:

- tracking incorreto;
- perspectiva errada;
- escala;
- oclusão;
- foco;
- exposição;
- cor;
- textura;
- iluminação.

Pergunte:

> “Se este elemento realmente estivesse nesta cena, como a câmera, a luz, os objetos e o ambiente o afetariam?”

Depois reproduza apenas as interações necessárias.

**Compositing de alto nível não é adicionar mais efeitos.**

**É reconstruir as relações que fariam elementos diferentes parecerem ter sido capturados juntos.**

Próximo:

