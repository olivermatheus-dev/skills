# [BRUTO] Etapa 13 — Partículas, atmosfera e microdetalhes

> Enviado pelo usuário em 2026-10-07, copiado sem edição. Versão destilada: `knowledge/video/particulas-e-atmosfera.md`.

1. Princípio fundamental
Categoria: Motion Design / Partículas e Atmosfera
Instruções
Partículas, fumaça, poeira, glow, noise e outros microefeitos não devem existir apenas para tornar uma composição visualmente mais complexa.
Eles podem cumprir funções como:

* criar profundidade;
* estabelecer atmosfera;
* comunicar material;
* representar força;
* indicar movimento;
* mostrar energia;
* aumentar impacto;
* integrar elementos;
* criar continuidade;
* fornecer microfeedback.

Antes de adicionar qualquer efeito ambiental, pergunte:
O que esta camada acrescenta à percepção da cena?
Se a resposta for apenas:
“fica mais bonito”
avalie se o mesmo resultado pode ser obtido através de composição, iluminação ou movimento melhor resolvidos.
Regra principal
Microdetalhe deve reforçar uma propriedade da cena, não apenas aumentar sua densidade.
2. Mundo físico vs camada gráfica
Categoria: Partículas / Sistema decisório
Instruções
Determine primeiro se o efeito pertence:
ao mundo físico da filmagem
ou
à linguagem gráfica do vídeo.
Exemplos físicos:

* poeira;
* chuva;
* fumaça;
* neve;
* sparks;
* embers.

Exemplos gráficos:

* dots;
* streaks;
* particles de UI;
* abstrações;
* data particles;
* trails.

Efeitos físicos precisam obedecer mais intensamente a:

* perspectiva;
* gravidade;
* luz;
* profundidade;
* foco;
* movimento da câmera.

Efeitos gráficos possuem maior liberdade.
Regra principal
Defina em qual realidade o efeito existe antes de definir sua aparência.
3. Asset ou sistema procedural
Categoria: Asset Library / Sistema decisório
Instruções
Antes de criar uma simulação, verifique se existe asset adequado na biblioteca.
Prefira asset pré-renderizado quando:

* comportamento já é adequado;
* interação complexa não é necessária;
* perspectiva funciona;
* duração funciona;
* qualidade é alta.

Prefira sistema procedural quando:

* efeito precisa reagir à cena;
* emissão precisa acompanhar objeto;
* trajetória precisa ser controlada;
* quantidade precisa mudar;
* câmera atravessa partículas;
* profundidade 3D é importante;
* direção precisa ser específica.

Regra principal
Use procedural quando precisar de comportamento. Use assets quando precisar principalmente de aparência.
4. Biblioteca de efeitos
Categoria: Asset Library / Taxonomia
Instruções
A biblioteca pode conter famílias como:

* dust;
* floating dust;
* smoke;
* fog;
* mist;
* haze;
* sparks;
* embers;
* fire;
* rain;
* snow;
* debris;
* confetti;
* bokeh;
* light particles;
* energy particles;
* trails;
* streaks;
* lens particles;
* glass;
* dust hits;
* smoke hits;
* impact debris;
* atmospheric overlays;
* procedural textures;
* noise maps;
* displacement maps;
* mattes.

Assets devem ser pesquisáveis por função.
5. Metadados dos assets
Categoria: Asset Library / Organização
Instruções
Quando possível, cada asset deve possuir informações como:
Type

* dust
* smoke
* fog
* spark
* rain
* snow
* trail
* debris

Density

* sparse
* light
* medium
* dense

Speed

* slow
* medium
* fast

Scale

* micro
* small
* medium
* large

Character

* realistic
* cinematic
* stylized
* elegant
* energetic
* magical
* industrial

Direction

* static
* up
* down
* left
* right
* radial
* turbulent

Depth

* foreground
* midground
* background
* full-depth

Regra principal
Procure efeitos por comportamento perceptivo, não apenas por nome.
6. Sistema de partículas
Categoria: Particles / Fundamentals
Instruções
Um sistema de partículas normalmente envolve:
Emitter
define onde partículas nascem.
Particle
define aparência de cada unidade.
Forces
controlam comportamento.
Renderer
transforma a simulação em imagem.
Não ajuste tudo simultaneamente.
Construa progressivamente:
emissão
→ movimento
→ lifespan
→ variance
→ aparência
→ forças
→ shading
→ integration.
7. Emitter
Categoria: Particles / Emission
Instruções
Escolha formato do emitter de acordo com a origem física ou gráfica.
Pode ser:

* point;
* line;
* circle;
* sphere;
* box;
* plane;
* path;
* image;
* surface.

Exemplo:
faísca de contato:
point ou região pequena.
chuva:
plane/volume acima da cena.
poeira atmosférica:
volume amplo.
Regra principal
A origem das partículas precisa explicar de onde elas vêm.
8. Emission Rate
Categoria: Particles / Density
Instruções
Controle quantidade de partículas cuidadosamente.
Maior quantidade não significa efeito melhor.
Baixa densidade pode ser mais convincente para:

* floating dust;
* ambient particles;
* premium motion.

Alta densidade pode funcionar para:

* explosão;
* chuva;
* neve;
* debris.

Regra principal
Densidade deve corresponder ao fenômeno, não à capacidade do sistema.
9. Burst Emission
Categoria: Particles / Impact
Instruções
Utilize burst quando muitas partículas precisam nascer em um momento específico.
Adequado para:

* impacto;
* explosão;
* confetti;
* spark hit;
* debris;
* logo reveal.

Burst precisa possuir evento causal.
Regra principal
Explosão de partículas precisa parecer resposta a alguma coisa.
10. Continuous Emission
Categoria: Particles / Ambient Motion
Instruções
Use emissão contínua para fenômenos persistentes:

* smoke;
* rain;
* snow;
* dust;
* fire;
* trails.

Controle estabilidade e variação.
Não permita que a densidade cresça indefinidamente quando fenômeno deveria permanecer estável.
11. Lifespan
Categoria: Particles / Timing
Instruções
Lifespan determina quanto tempo cada partícula permanece.
Lifespan curto:

* sparks;
* micro impacts;
* fast trails.

Lifespan longo:

* floating dust;
* smoke;
* snow.

A duração deve fazer sentido para velocidade e distância percorrida.
Regra principal
Partícula deve morrer quando sua função visual termina.
12. Lifespan Variance
Categoria: Particles / Naturalidade
Instruções
Quando fenômeno for orgânico, evite todas as partículas desaparecendo exatamente depois do mesmo tempo.
Introduza variação controlada.
Regra principal
Fenômenos naturais geralmente possuem distribuição, não uniformidade perfeita.
13. Velocity
Categoria: Particles / Motion
Instruções
Determine velocidade inicial de acordo com a força que criou as partículas.
Sparks de impacto:
rápidos.
Floating dust:
muito lentos.
Smoke:
movimento lento ou moderado.
Debris:
depende do impacto.
Regra principal
Velocidade inicial comunica força de origem.
14. Velocity Variance
Categoria: Particles / Naturalidade
Instruções
Não faça todas as partículas possuírem a mesma velocidade quando buscamos naturalidade.
Use variação controlada.
Não randomize tanto que o comportamento perca direção.
Regra principal
Variance quebra repetição; direção preserva intenção.
15. Direction
Categoria: Particles / Motion
Instruções
Determine direção predominante.
Depois introduza dispersão.
Exemplo:
impacto para direita:
maioria das partículas deve respeitar o impulso para direita.
Algumas podem divergir.
Regra principal
Randomness deve acontecer dentro de uma força principal.
16. Gravity
Categoria: Particles / Forces
Instruções
Utilize gravidade quando partículas representam matéria afetada por peso.
Adequado para:

* debris;
* sparks;
* snow;
* rain;
* confetti.

Floating dust pode exigir gravidade praticamente irrelevante.
Regra principal
Nem toda partícula precisa cair.
17. Drag e Friction
Categoria: Particles / Forces
Instruções
Use drag para reduzir velocidade progressivamente.
Pode ajudar:

* smoke;
* floating particles;
* debris;
* movimento em fluidos.

Objetos leves podem perder velocidade rapidamente.
Regra principal
Partículas não precisam manter para sempre a energia inicial.
18. Turbulence
Categoria: Particles / Forces
Instruções
Turbulence introduz movimento irregular.
É útil para:

* smoke;
* fog;
* dust;
* embers;
* magical particles.

Não aumente turbulence até o efeito parecer completamente aleatório.
Regra principal
Turbulence modifica fluxo; não deveria destruir completamente sua direção.
19. Wind
Categoria: Particles / Forces
Instruções
Use força direcional ampla para simular:

* vento;
* ventilação;
* deslocamento do ambiente.

Várias partículas ambientais da mesma cena podem responder aproximadamente à mesma direção de vento.
Regra principal
Fenômenos compartilhando o mesmo ambiente devem compartilhar parte das mesmas forças.
20. Attractors
Categoria: Particles / Forces
Instruções
Attractors podem puxar partículas para:

* objeto;
* logo;
* ponto;
* shape.

Útil para:

* logo formation;
* magical effects;
* data visualization;
* energy effects.

Regra principal
Atração deve produzir comportamento coerente com o conceito.
21. Repulsion
Categoria: Particles / Forces
Instruções
Repulsão pode criar:

* explosões;
* avoidance;
* interaction;
* displacement.

Associe a repulsão a evento ou objeto quando possível.
22. Collision
Categoria: Particles / Interaction
Instruções
Quando partículas deveriam tocar superfícies, colisões podem aumentar realismo.
Exemplos:

* debris no chão;
* sparks na parede;
* confetti;
* chuva.

Não simule colisões complexas quando não forem perceptíveis.
Regra principal
Simule apenas interações que realmente afetam a imagem final.
23. Bounce
Categoria: Particles / Collision
Instruções
Controle elasticidade conforme material.
Metal spark:
pode ricochetear.
Poeira:
normalmente não.
Pedra:
pouco bounce.
Confetti:
pode ter comportamento leve e irregular.
24. Particle Variance
Categoria: Particles / Naturalidade
Instruções
Considere variação de:

* scale;
* rotation;
* velocity;
* lifespan;
* opacity;
* color;
* trajectory.

Não necessariamente varie todas.
Regra principal
Variação precisa quebrar repetição sem quebrar identidade.
25. Scale Distribution
Categoria: Particles / Depth
Instruções
Evite todas as partículas com exatamente o mesmo tamanho.
Use distribution adequada.
Em perspectiva, partículas próximas podem parecer maiores.
Regra principal
Tamanho ajuda a comunicar profundidade e naturalidade.
26. Rotation
Categoria: Particles / Motion
Instruções
Partículas não esféricas podem precisar de rotação.
Especialmente:

* confetti;
* leaves;
* debris;
* paper;
* fragments.

Controle spin e variance.
27. Opacity over Life
Categoria: Particles / Lifecycle
Instruções
Partículas podem possuir ciclo visual:
nascer
→ estabilizar
→ desaparecer.
Evite pop instantâneo quando fenômeno pede suavidade.
Sparks podem nascer abruptamente.
Smoke normalmente não.
Regra principal
O início e fim da partícula devem pertencer ao fenômeno.
28. Size over Life
Categoria: Particles / Lifecycle
Instruções
Tamanho também pode mudar.
Smoke:
pode expandir.
Spark:
pode reduzir.
Glow particle:
pode pulsar.
Não anime tamanho automaticamente.
29. Color over Life
Categoria: Particles / Lifecycle
Instruções
Cor pode mudar para representar:

* cooling;
* fading;
* energy loss;
* atmosphere.

Exemplo:
spark quente:
branco/amarelo
→ laranja
→ escuro.
Regra principal
Mudança de cor pode comunicar transformação física.
30. Particle Shape
Categoria: Particles / Appearance
Instruções
Escolha shape adequado:

* dot;
* streak;
* sprite;
* texture;
* image;
* custom SVG;
* 3D geometry.

Não utilize círculos genéricos quando uma forma específica melhorar significativamente a percepção.
31. Sprite Assets
Categoria: Asset Library / Particles
Instruções
Biblioteca pode conter sprites como:

* smoke puffs;
* dust;
* sparks;
* snowflakes;
* debris;
* bokeh.

Revise:

* alpha;
* edge;
* resolution;
* orientation.

Regra principal
Sprite bom reduz complexidade sem necessariamente reduzir qualidade.
32. Motion Blur em partículas
Categoria: Particles / Polish
Instruções
Partículas rápidas geralmente precisam de motion blur.
Especialmente:

* sparks;
* debris;
* rain;
* streaks.

Floating dust pode permanecer mais definida.
Regra principal
Blur deve acompanhar velocidade.
33. Depth of Field
Categoria: Particles / Depth
Instruções
Em sistemas 3D, considere foco.
Foreground particle pode ficar desfocada.
Midground pode estar nítida.
Background pode perder foco.
Isso cria profundidade significativa.
Regra principal
Partículas atravessando diferentes planos devem responder à lente.
34. Foreground Particles
Categoria: Particles / Composition
Instruções
Algumas partículas grandes e desfocadas próximas à câmera podem aumentar profundidade.
Use poucas.
Evite obstruir:

* rosto;
* texto;
* dado importante.

35. Midground Particles
Categoria: Particles / Composition
Instruções
Normalmente carregam maior parte da leitura do efeito.
Devem possuir escala e foco intermediários.
36. Background Particles
Categoria: Particles / Composition
Instruções
Podem ser menores, mais suaves e com menor contraste.
Não precisam competir com o sujeito.
Regra principal
Profundidade pode ser construída pela combinação de escalas, foco e velocidade.
37. Parallax de partículas
Categoria: Particles / Depth
Instruções
Quando câmera se move, partículas em diferentes profundidades devem apresentar deslocamento relativo.
Esse parallax é importante em efeitos imersivos.
Regra principal
Partícula ambiental precisa pertencer ao espaço, não ao vidro da tela.
38. Floating Dust
Categoria: Atmospheric Effects / Dust
Instruções
Floating dust funciona melhor com:

* baixa densidade;
* baixa velocidade;
* variação sutil;
* profundidade;
* iluminação coerente.

Não transforme a cena em tempestade de poeira se o objetivo é apenas criar atmosfera.
Regra principal
Poeira atmosférica é microdetalhe.
39. Dust Hit
Categoria: Atmospheric Effects / Impact
Instruções
Dust hits podem acompanhar:

* impacto no chão;
* objeto pesado;
* queda;
* explosão.

Observe:

* ponto de contato;
* direção;
* expansão;
* gravidade.

Regra principal
Poeira deve nascer da superfície impactada.
40. Smoke
Categoria: Atmospheric Effects / Smoke
Instruções
Smoke exige:

* evolução de forma;
* expansão;
* turbulence;
* redução de densidade;
* integração com luz.

Evite apenas mover uma imagem estática de fumaça para cima.
Regra principal
Fumaça deve deformar enquanto se desloca.
41. Fog
Categoria: Atmospheric Effects / Fog
Instruções
Fog é útil para:

* separar profundidades;
* suavizar background;
* criar mood;
* integrar elementos distantes.

Fog deve afetar contraste e saturação do que está atrás dele.
Regra principal
Fog é meio atmosférico, não apenas overlay branco.
42. Haze
Categoria: Atmospheric Effects / Depth
Instruções
Haze é mais sutil que fog.
Pode reduzir contraste e aumentar sensação de distância sem esconder elementos.
Excelente para integração de compositing.
43. Rain
Categoria: Atmospheric Effects / Weather
Instruções
Chuva convincente normalmente possui diferentes planos:
foreground drops;
midground rain;
background rain.
Considere:

* direção;
* vento;
* motion blur;
* velocidade;
* interaction;
* wetness da cena quando apropriado.

Regra principal
Chuva não é apenas linhas caindo sobre a imagem.
44. Snow
Categoria: Atmospheric Effects / Weather
Instruções
Snow possui:

* velocidade menor;
* mais drift lateral;
* mais variance;
* flocos em diferentes profundidades.

Evite trajetória perfeitamente vertical e uniforme salvo estilização.
45. Sparks
Categoria: Particles / Energy
Instruções
Sparks geralmente:

* nascem rapidamente;
* possuem velocidade inicial alta;
* sofrem gravidade;
* diminuem brilho;
* possuem lifespan curto.

Podem combinar com:

* streak;
* glow;
* motion blur.

Regra principal
Spark deve possuir origem energética clara.
46. Embers
Categoria: Atmospheric Effects / Fire
Instruções
Embers normalmente:

* sobem;
* possuem movimento mais lento que sparks;
* respondem a turbulence;
* perdem brilho gradualmente.

Podem aumentar atmosfera de fogo sem mostrar fogo diretamente.
47. Debris
Categoria: Particles / Impact
Instruções
Debris precisa comunicar material.
Fragmentos de:

* vidro;
* madeira;
* pedra;
* metal;

devem possuir formas e física diferentes.
Regra principal
Material determina comportamento.
48. Confetti
Categoria: Particles / Celebration
Instruções
Confetti pode utilizar:

* gravity;
* drag;
* rotation;
* turbulence;
* color variety.

Mantenha paleta compatível com identidade visual quando possível.
Não precisa utilizar todas as cores do espectro.
49. Bokeh Particles
Categoria: Atmospheric Effects / Optical
Instruções
Use bokeh quando o efeito deve parecer relacionado à lente e luz fora de foco.
Observe:

* depth;
* aperture feel;
* brightness;
* motion.

Não confunda bokeh com círculos translúcidos arbitrários.
50. Light Particles
Categoria: Motion Design / Abstract Particles
Instruções
Partículas luminosas abstratas podem funcionar em:

* technology;
* luxury;
* magical;
* cinematic;
* data visualization.

Defina sistema visual e paleta.
Evite “golden particles” automaticamente para qualquer estética premium.
51. Data Particles
Categoria: Motion Design / Information
Instruções
Partículas podem representar:

* usuários;
* eventos;
* transações;
* dados;
* conexões.

Quando representarem informação real, mantenha significado claro.
Não use milhares de partículas como pseudovisualização quantitativa se não correspondem a dados.
52. Trails
Categoria: Motion Design / Movement
Instruções
Trail pode comunicar:

* direção;
* velocidade;
* percurso;
* energia.

Trail deve seguir movimento do objeto.
Controle:

* length;
* taper;
* opacity;
* decay.

Regra principal
Trail mostra história recente de movimento.
53. Motion Streaks
Categoria: Motion Design / Speed
Instruções
Streaks podem enfatizar alta velocidade.
Use principalmente em:

* fast transitions;
* sports;
* energetic graphics;
* futuristic design.

Evite em movimentos lentos ou elegantes sem justificativa.
54. Glow
Categoria: Effects / Light
Instruções
Glow deve partir de algo que plausivelmente:

* emite luz;
* possui energia;
* recebe destaque estilístico.

Controle:

* threshold;
* radius;
* intensity;
* color.

Regra principal
Glow deve ter fonte.
55. Multi-scale Glow
Categoria: Effects / Polish
Instruções
Em efeitos luminosos importantes, um único glow muito grande pode parecer artificial.
Quando necessário, use combinação controlada de:

* core glow pequeno;
* glow médio;
* bloom maior.

Não faça isso para todos os elementos.
Regra principal
Luz costuma possuir diferentes escalas de espalhamento.
56. Glow clipping
Categoria: Effects / Quality Control
Instruções
Verifique se glow:

* corta nas bordas;
* estoura highlights;
* destrói legibilidade;
* contamina demais outros elementos.

57. Noise
Categoria: Procedural Effects / Noise
Instruções
Noise pode ser utilizado como fonte para:

* texture;
* displacement;
* opacity;
* clouds;
* smoke;
* flicker;
* organic movement.

Não utilize noise apenas como camada visível.
Frequentemente seu melhor uso é controlar outra propriedade.
Regra principal
Noise é excelente como sinal de controle.
58. Fractal Noise
Categoria: Procedural Effects / Texture
Instruções
Fractal noise pode criar bases para:

* smoke;
* clouds;
* fog;
* textures;
* displacement;
* matte.

Ajuste:

* scale;
* contrast;
* complexity;
* evolution;
* transform.

Não aceite configuração padrão.
59. Turbulent Displacement
Categoria: Procedural Effects / Deformation
Instruções
Pode criar:

* organic deformation;
* heat;
* fluid movement;
* distortion;
* handmade feel.

Use amplitude proporcional.
Excesso destrói shape e legibilidade.
60. Displacement Map
Categoria: Procedural Effects / Integration
Instruções
Use mapa de displacement para controlar deformação através de outra imagem ou textura.
Pode integrar:

* graphics à parede;
* projections;
* water distortion;
* heat;
* fabric.

Regra principal
Deformação deve possuir fonte visual coerente.
61. Heat Distortion
Categoria: Atmospheric Effects / Distortion
Instruções
Heat distortion deve:

* nascer próximo à fonte quente;
* subir;
* variar organicamente;
* ser sutil.

Não distorça uniformemente o frame inteiro.
62. Procedural Flicker
Categoria: Procedural Motion / Light
Instruções
Flicker pode funcionar em:

* neon;
* old screens;
* fire;
* unstable electricity.

Evite randomness totalmente uniforme.
Crie padrões com períodos de estabilidade.
Regra principal
Randomness convincente também possui ritmo.
63. Controlled Randomness
Categoria: Procedural Motion / Princípios
Instruções
Randomness deve possuir limites.
Defina:

* range;
* frequency;
* direction;
* distribution.

Evite valores completamente independentes a cada frame quando queremos movimento orgânico.
Regra principal
Natureza é variável, mas não necessariamente caótica.
64. Noise Frequency
Categoria: Procedural Motion / Timing
Instruções
Alta frequência:

* nervous;
* electrical;
* unstable.

Baixa frequência:

* atmospheric;
* drifting;
* organic.

Escolha frequência pelo comportamento desejado.
65. Noise Amplitude
Categoria: Procedural Motion / Intensity
Instruções
Amplitude define intensidade da variação.
Movimento premium frequentemente utiliza:
low amplitude + controlled frequency
para criar vida quase imperceptível.
66. Ambient Motion
Categoria: Motion Design / Micro-motion
Instruções
Alguns elementos podem possuir movimento contínuo muito discreto para evitar sensação completamente estática.
Exemplos:

* slow drift;
* subtle parallax;
* light movement;
* atmospheric texture.

Não aplique movimento contínuo a tudo.
Regra principal
Ambient motion deve ser sentido antes de ser percebido conscientemente.
67. Micro-motion
Categoria: Motion Design / Polish
Instruções
Micro-motion pode incluir:

* slight floating;
* subtle rotation;
* small light movement;
* tiny scale breathing.

Utilize especialmente em:

* hero elements;
* idle states;
* long holds.

Regra principal
Pequeno movimento pode manter vida sem roubar atenção.
68. Breathing Animation
Categoria: Motion Design / Idle Motion
Instruções
Breathing deve ser:

* lento;
* pequeno;
* suave;
* repetível.

Evite scale pulsando claramente em conteúdo premium.
O espectador não deveria pensar:
“isso está crescendo e diminuindo.”
69. Looping
Categoria: Procedural Motion / Loops
Instruções
Loops ambientais precisam evitar seam perceptível.
Revise:

* primeiro frame;
* último frame;
* position;
* noise evolution;
* opacity;
* particle population.

Regra principal
Loop deve desaparecer como mecanismo.
70. Particle Loop Population
Categoria: Particles / Loops
Instruções
Não permita que no começo do loop não existam partículas e alguns segundos depois a cena esteja cheia.
Quando necessário:

* pre-roll simulation;
* offset lifecycle;
* loop assets preparados.

71. Depth Sorting
Categoria: Particles / 3D
Instruções
Verifique ordem de render quando partículas transparentes se cruzam.
Artefatos de sorting podem produzir:

* popping;
* opacity errada;
* layers invertidas.

Resolva antes do polish.
72. Lighting de partículas
Categoria: Particles / Integration
Instruções
Partículas físicas podem precisar responder à iluminação.
Observe:

* direção;
* intensity;
* color.

Embers podem emitir luz.
Dust normalmente recebe luz.
Regra principal
Determine se partícula emite ou recebe luz.
73. Particle Shadow
Categoria: Particles / Integration
Instruções
Nem toda partícula precisa produzir sombra.
Use apenas quando:

* escala;
* proximidade;
* iluminação;

fazem sombra perceptível.
74. Color Matching
Categoria: Particles / Integration
Instruções
Assets pré-renderizados precisam ser adaptados ao grade e iluminação do footage.
Considere:

* black point;
* white point;
* temperature;
* saturation.

Não deixe overlay carregar aparência de outro projeto.
75. Black Background Assets
Categoria: Asset Library / Compositing
Instruções
Alguns efeitos pré-renderizados podem vir sobre preto e serem integrados via blend modes.
Revise:

* black contamination;
* edge;
* gamma;
* color;
* exposure.

Não presuma que Screen blend resolve tudo perfeitamente.
76. Alpha Assets
Categoria: Asset Library / Compositing
Instruções
Prefira alpha de boa qualidade quando disponível.
Revise:

* premultiplication;
* halos;
* compression;
* edge.

77. Atmosphere Layers
Categoria: Compositing / Depth
Instruções
Atmosfera pode ser dividida em:
background
→ haze/fog.
midground
→ smoke/dust.
foreground
→ larger particles/out-of-focus elements.
Não é obrigatório usar todas.
Regra principal
Atmosfera funciona melhor quando ocupa espaço, não quando é uma única camada plana.
78. Atmosphere and Subject
Categoria: Compositing / Focus
Instruções
Não permita que efeitos atmosféricos reduzam excessivamente:

* leitura de rosto;
* produto;
* texto;
* ação.

Use masks quando necessário.
79. Atmospheric Occlusion
Categoria: Compositing / Depth
Instruções
Se fumaça ou neblina existe em determinada profundidade, alguns elementos devem ficar:

* na frente;
* parcialmente dentro;
* atrás.

Isso aumenta integração.
80. Particles and Camera Movement
Categoria: Particles / Camera
Instruções
Se partículas pertencem ao mundo, elas precisam reagir ao movimento da câmera através de perspectiva e parallax.
Se pertencem à interface, podem permanecer screen-space.
Regra principal
Decida se partículas pertencem ao mundo ou ao frame.
81. Particle Interaction with Objects
Categoria: Particles / Advanced Integration
Instruções
Quando relevante, partículas podem:

* contornar;
* colidir;
* ser ocluídas;
* ser atraídas;
* reagir ao movimento de objetos.

Não simule interação sofisticada se praticamente invisível.
82. Particle Reveal
Categoria: Motion Design / Reveals
Instruções
Partículas podem participar de:

* logo reveal;
* text reveal;
* dissolve;
* transformation.

Evite simplesmente transformar qualquer logo em milhares de partículas.
Determine se:

* fragmentação;
* construção;
* dissolução;

faz sentido conceitualmente.
83. Particle Dissolve
Categoria: Motion Design / Transition
Instruções
Ao dissolver objeto em partículas, preserve inicialmente parte da forma original.
Progressivamente:
forma
→ fragmentação
→ dispersão.
A direção da dispersão deve possuir lógica.
Regra principal
Transformação deve possuir continuidade visual entre objeto e partículas.
84. Logo Particle Formation
Categoria: Motion Design / Branding
Instruções
Se partículas formam logo:

* não esconda legibilidade final;
* não prolongue demais;
* mantenha comportamento coerente com marca.

Uma marca minimalista provavelmente não precisa de explosão cósmica.
85. Particle Typography
Categoria: Motion Design / Typography
Instruções
Partículas podem formar ou dissolver texto em hero moments.
Não use para:

* body text;
* captions;
* informações que precisam ser lidas rapidamente.

86. Trails e Typography
Categoria: Motion Design / Typography
Instruções
Trails podem acompanhar movimentos tipográficos energéticos.
Mas não prejudique leitura.
Elementos secundários devem desaparecer rapidamente após o movimento.
87. Ambient UI Particles
Categoria: Motion Design / Interface
Instruções
Em interfaces futuristas, partículas ou dots podem sugerir atividade.
Use densidade extremamente controlada.
Não cubra informação funcional.
88. Background Motion
Categoria: Motion Design / Background
Instruções
Background procedural pode possuir:

* gradient movement;
* noise;
* subtle particles;
* shapes;
* light movement.

Movimento deve ser mais lento e menos contrastado que foreground informacional.
Regra principal
Background pode ter vida sem pedir atenção.
89. Foreground Accents
Categoria: Motion Design / Foreground
Instruções
Pequenos elementos de foreground podem acrescentar:

* profundidade;
* movimento;
* energia.

Use-os principalmente nos momentos em que composição comportar.
90. Sparkle
Categoria: Motion Design / Micro-effect
Instruções
Sparkles podem indicar:

* brilho;
* limpeza;
* novidade;
* magia;
* premium.

Use seletivamente.
Não adicione sparkle em qualquer objeto para fazê-lo parecer valioso.
91. Shine Sweep
Categoria: Motion Design / Light Effect
Instruções
Shine sweep pode funcionar em:

* logos;
* metal;
* glass;
* product highlights.

Movimento deve acompanhar superfície e direção aparente da luz.
Regra principal
Shine deve parecer luz atravessando material, não uma linha branca passando pelo objeto.
92. Light Rays
Categoria: Atmospheric Effects / Lighting
Instruções
Light rays exigem:

* fonte;
* atmosfera;
* direção.

Eles se tornam visíveis porque existe meio atmosférico.
Não adicione rays sem fonte luminosa coerente salvo estilização deliberada.
93. God Rays
Categoria: Atmospheric Effects / Lighting
Instruções
Em cenas cinematográficas, rays mais intensos podem ser utilizados.
Respeite:

* geometry;
* occlusion;
* source direction.

Evite exagero que retire contraste do sujeito.
94. Dust in Light
Categoria: Atmospheric Effects / Integration
Instruções
Dust torna-se mais perceptível onde luz atravessa o espaço.
Distribua brilho das partículas de acordo com regiões iluminadas quando possível.
Regra principal
Visibilidade de atmosfera também depende de iluminação.
95. Microdetail Hierarchy
Categoria: Motion Design / Polish
Instruções
Classifique microefeitos por importância.
Primary
→ efeito ligado diretamente ao evento.
Secondary
→ suporte.
Ambient
→ quase invisível.
Não deixe ambient details mais contrastados que o sujeito principal.
96. SFX Integration
Categoria: Motion Design / Sound Design
Instruções
Efeitos de partículas podem receber sons quando existe evento perceptível.
Exemplos:
spark burst;
debris impact;
magical formation;
energy trail.
Poeira atmosférica normalmente não precisa ser sonorizada.
Regra principal
Som acompanha eventos; não acompanha cada partícula.
97. Texture Sound
Categoria: Motion Design / Sound Design
Instruções
Certos efeitos podem receber camada sonora textural:

* electrical hum;
* fire crackle;
* soft shimmer;
* wind.

Use biblioteca interna de sound design quando apropriado.
98. Effects Density Curve
Categoria: Motion Design / Pacing
Instruções
A densidade de efeitos pode acompanhar energia narrativa.
Momentos calmos:
poucos detalhes.
Build:
densidade aumenta.
Clímax:
maior atividade.
Resolução:
efeitos diminuem.
Regra principal
Microdetalhes também fazem parte da curva de energia.
99. Hero Effects
Categoria: Motion Design / Hierarquia
Instruções
Reserve efeitos elaborados para:

* logo reveal;
* chapter opening;
* product reveal;
* climax;
* transformação importante.

Não distribua hero effects igualmente por todo o vídeo.
100. Restraint
Categoria: Motion Design / Princípio
Instruções
Quando uma cena já contém:

* pessoa;
* B-roll;
* texto;
* gráfico;
* música;
* sound design;

partículas adicionais podem não melhorar nada.
Considere não adicionar.
Regra principal
Ausência de partículas também é uma decisão profissional.
101. Avoid “Motion Design Dust”
Categoria: Motion Design / Problemas comuns
Instruções
Evite hábito de adicionar:

* floating dots;
* dust;
* grain;
* glow;
* noise;

em todo frame para fazê-lo parecer mais elaborado.
Esses recursos devem responder à direção artística.
Regra principal
Não crie textura visual sem conceito.
102. Evitar partículas uniformes
Categoria: Particles / Problemas comuns
Instruções
Sinais de efeito artificial:

* mesmo tamanho;
* mesma velocidade;
* mesmo lifespan;
* mesma direção;
* mesma opacity.

Introduza variation quando fenômeno exigir.
103. Evitar randomness total
Categoria: Particles / Problemas comuns
Instruções
O extremo oposto também parece artificial.
Se tudo varia completamente:

* sistema perde fluxo;
* direção desaparece;
* composição fica ruidosa.

Regra principal
Naturalidade fica entre repetição perfeita e caos completo.
104. Evitar densidade excessiva
Categoria: Particles / Problemas comuns
Instruções
Muitas partículas podem:

* reduzir legibilidade;
* diminuir contraste;
* aumentar ruído;
* esconder sujeito;
* aumentar custo de render.

Reduza até restar apenas o necessário.
105. Evitar velocidade excessiva
Categoria: Particles / Problemas comuns
Instruções
Partículas ambientais rápidas demais deixam de parecer atmosfera e começam a parecer efeito.
Observe fenômeno real.
106. Evitar glow excessivo
Categoria: Effects / Problemas comuns
Instruções
Glow excessivo:

* achata imagem;
* reduz contraste;
* destrói detalhe;
* cria aparência genérica.

Comece menor que sua primeira intuição.
107. Evitar efeitos idênticos
Categoria: Asset Library / Variação
Instruções
Assim como sound effects, não reutilize exatamente o mesmo overlay perceptível repetidamente.
Procure variantes da mesma família.
Regra principal
Repita linguagem, não necessariamente arquivos.
108. Asset Adaptation
Categoria: Asset Library / Polish
Instruções
Para qualquer efeito pré-renderizado, adapte:

* duration;
* speed;
* direction;
* scale;
* position;
* color;
* opacity;
* blur;
* density aparente;
* crop.

O asset deve parecer criado para a cena.
109. Mirror e Reverse
Categoria: Asset Library / Variation
Instruções
Quando tecnicamente apropriado, pequenas transformações podem criar variação:

* mirror;
* reverse;
* speed change;
* crop.

Mas não faça isso quando física ficar incoerente.
Exemplo:
reverse smoke frequentemente parece fisicamente estranho.
110. Pre-render
Categoria: Workflow / Performance
Instruções
Sistemas complexos podem ser pré-renderizados quando:

* simulação está aprovada;
* parâmetros não precisam mais de edição constante;
* performance prejudica workflow.

Preserve versão procedural editável quando importante.
Regra principal
Performance técnica não deve impedir revisão criativa.
111. Simulation Pre-roll
Categoria: Particles / Workflow
Instruções
Algumas simulações precisam começar antes do frame utilizado.
Isso permite que:

* emitter estabilize;
* densidade se forme;
* forças entrem em equilíbrio.

Não deixe sistema parecer estar “ligando” no primeiro frame salvo intenção.
112. Cache
Categoria: Workflow / Performance
Instruções
Quando software oferecer caching para simulações pesadas, utilize antes de avaliar timing final.
Playback irregular pode levar a decisões erradas sobre velocidade e ritmo.
Regra principal
Avalie movimento em reprodução confiável.
113. Preview Quality
Categoria: Workflow / Performance
Instruções
Durante design, pode ser apropriado reduzir:

* particle count;
* resolution;
* samples;
* blur quality.

Antes do render final, restaure qualidade adequada e revise novamente.
114. Quality Control — Physics
Categoria: Particles / QC
Instruções
Pergunte:

* partículas possuem origem?
* direção faz sentido?
* gravidade faz sentido?
* perdem energia?
* turbulence está coerente?
* material combina com comportamento?

115. Quality Control — Variation
Categoria: Particles / QC
Instruções
Procure repetição artificial.
Avalie:

* size;
* speed;
* rotation;
* lifespan;
* distribution.

116. Quality Control — Depth
Categoria: Particles / QC
Instruções
Verifique:

* foreground;
* midground;
* background;
* focus;
* parallax;
* occlusion.

Pergunte:
O efeito parece ocupar espaço ou simplesmente estar sobre a tela?
117. Quality Control — Lighting
Categoria: Particles / QC
Instruções
Observe:

* color;
* brightness;
* emission;
* shadows;
* environment.

Partículas parecem pertencer à iluminação existente?
118. Quality Control — Motion Blur
Categoria: Particles / QC
Instruções
Compare velocidade com blur.
Fast particles sem blur podem parecer sprites.
Slow particles com blur intenso podem parecer artificiais.
119. Quality Control — Loop
Categoria: Particles / QC
Instruções
Se efeito é loopável:

* identifique seam;
* observe population;
* verifique jumps;
* avalie noise evolution.

120. Quality Control — Composition
Categoria: Particles / QC
Instruções
Pergunte:

* efeitos escondem texto?
* competem com rosto?
* atravessam pontos importantes?
* aumentam ruído?
* direcionam atenção incorretamente?

121. Quality Control — Real Time
Categoria: Particles / QC
Instruções
Assista no contexto.
Partículas que parecem bonitas quando pausadas podem distrair excessivamente em movimento.
122. Quality Control — Removal
Categoria: Motion Design / QC
Instruções
Desative temporariamente o efeito.
Compare:
com efeito;
sem efeito.
Pergunte:
A cena perdeu profundidade, atmosfera, significado ou impacto?
Se praticamente nada mudou:
considere remover.
123. Quality Control — Asset Recognition
Categoria: Asset Library / QC
Instruções
Pergunte:
Este overlay parece claramente um asset colocado sobre o vídeo?
Se sim, refine:

* scale;
* crop;
* color;
* speed;
* perspective;
* depth;
* blending.

O espectador não precisa reconhecer a origem do asset.
124. Sinais de efeito barato
Categoria: Motion Design / Diagnóstico
Instruções
Procure:

* partículas demais;
* glow excessivo;
* mesma partícula repetida;
* smoke estático deslizando;
* fog como camada branca;
* sparks sem origem;
* dust movendo rápido demais;
* rain plana;
* ausência de depth;
* ausência de motion blur;
* overlays não color-matched;
* partículas passando sobre texto;
* randomization sem direção;
* lens flare sem fonte;
* efeito usado apenas para preencher espaço.

125. Sinais de efeito premium
Categoria: Motion Design / Diagnóstico
Instruções
Efeitos refinados frequentemente possuem:

* origem clara;
* comportamento controlado;
* diferentes profundidades;
* iluminação coerente;
* quantidade reduzida;
* variation sutil;
* blur compatível;
* excelente integração;
* função narrativa;
* direção artística consistente.

Muitas vezes o espectador percebe atmosfera sem identificar o efeito individual.
126. Pipeline para efeitos ambientais
Categoria: Motion Design / Workflow
Instruções
Siga aproximadamente:
1. DEFINE FUNCTION
Determine:

* atmosphere?
* depth?
* impact?
* energy?
* material?
* transition?

2. DETERMINE WORLD
Physical world ou graphic layer?
3. SEARCH LIBRARY
Procure asset existente.
4. CHOOSE IMPLEMENTATION
Asset ou procedural.
5. BUILD BEHAVIOR
Configure:

* source;
* direction;
* speed;
* forces;
* lifespan;
* variation.

6. BUILD DEPTH
Configure:

* scale;
* foreground;
* midground;
* background;
* focus.

7. INTEGRATE
Ajuste:

* color;
* lighting;
* blur;
* grain;
* perspective.

8. ADD SOUND IF NEEDED
Somente para eventos perceptivos relevantes.
9. REVIEW
Veja em tempo real.
10. REDUCE
Remova densidade, glow ou layers desnecessários.
127. Princípio de microdetalhe
Categoria: Motion Design / Polish
Instruções
Microdetalhes excelentes frequentemente possuem intensidade abaixo do ponto em que o espectador os identifica conscientemente.
Eles podem criar sensação de:

* profundidade;
* movimento;
* atmosfera;
* materialidade;
* refinamento.

O objetivo nem sempre é:
“ver partículas.”
Pode ser simplesmente:
“sentir que a cena possui ar, espaço e vida.”
Regra principal
Quanto mais secundária a função, menos o efeito deve pedir atenção.
128. Princípio mestre
Categoria: Motion Design / Princípio mestre
Instruções
Antes de adicionar partículas, glow, smoke, noise ou qualquer microefeito, pergunte:
Qual propriedade da cena estou tentando comunicar?
Se for:
profundidade
construa profundidade.
Se for:
energia
construa energia.
Se for:
atmosfera
construa atmosfera.
Se for:
impacto
construa impacto.
Não confunda a ferramenta com o objetivo.
Uma partícula não é:
“um detalhe bonito”.
Ela pode representar:

* matéria;
* força;
* movimento;
* energia;
* espaço;
* ambiente.

Use assets pré-prontos quando forem a matéria-prima certa.
Use sistemas procedurais quando precisar controlar comportamento.
Integre ambos ao mundo visual.
E depois remova qualquer coisa que esteja chamando mais atenção do que sua função exige.
Microdetalhe profissional não diz “olhe para mim”.
Ele faz o restante da cena parecer melhor.