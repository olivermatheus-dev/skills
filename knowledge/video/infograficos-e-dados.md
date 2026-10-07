# Infográficos, dados, diagramas e explicação visual

> Base: material do usuário "Etapa 11" (2026-10-07), verificado. **Significado → representação → assets → design → motion → polimento.** Nunca efeito → template → informação encaixada à força.

## 1. Quando usar
- **Imagem/B-roll mostra a realidade; o gráfico revela relações difíceis de ver na realidade** (comparação, estrutura, número, evolução, abstração). Ver `b-roll.md`.
- Pergunta-guia: **existe uma relação que seria entendida melhor visualmente?** Não crie gráfico só porque há número, nem diagrama só porque é complexo.
- **Escreva o *takeaway* antes de desenhar:** "o espectador sai entendendo que…". Ele define o tipo, o título, o destaque, as anotações e a ordem da animação.

## 2. Escolha da representação (a mais simples que explica)
| a informação é… | representação |
|---|---|
| **um valor** | **número tipográfico** + rótulo + contexto (não precisa de gráfico) |
| comparação de 2–3 valores | números lado a lado ("72% vs 41%") ou barras; antes/depois |
| comparação entre categorias / ranking | **barras** (horizontais se houver muitos rótulos longos; ordenadas se o ranking importa) |
| evolução no tempo | **linha** (o eixo X precisa ter ordem com sentido); área só se o volume acumulado importa |
| parte de um todo | barra empilhada ou pizza/donut **com ≤ 4–5 fatias** e diferenças grandes |
| relação entre 2 variáveis | **dispersão** (correlação, clusters, outliers) |
| distribuição | mostrar concentração, variação e extremos; a média sozinha esconde a estrutura |
| processo / etapas | diagrama de etapas (1 → 2 → 3) ou fluxograma (com decisões) |
| hierarquia | árvore: posição e escala comunicam o nível antes do rótulo |
| rede | só as relações que importam, agrupadas ou reveladas aos poucos (sem "espaguete") |
| causa → efeito | causa, mecanismo e consequência distintos; **não sugira causalidade quando há só correlação** |
| cronologia | linha do tempo (distância proporcional **só** se a escala de tempo é real) |
| localização / deslocamento | mapa de localização, mapa por região (coroplético), pins, rota |

## 3. Integridade dos dados (regra dura)
- **Nunca invente dado** para completar um gráfico. Dado ilustrativo é **marcado como ilustrativo** (`BRAND.md` > elenco fictício).
- Confira fonte, unidade, período, população, definição da métrica e valores. O contexto evita leituras falsas: período, base, amostra, valor anterior, denominador, inflação, região.
- **Barras com base zero.** Cortar o eixo exagera diferenças; se for inevitável, deixe isso explícito.
- **Dado ausente ≠ zero.** Incerteza relevante é mostrada (faixa, barra de erro, palavras certas). Estimativa não vira certeza.
- **Animação não distorce:** **nada de overshoot em propriedades que codificam valor.** Uma barra de 72% não passa por 80% e volta. Use `.out` sem `back`/mola nesses elementos (containers e decoração podem ter mola). Eixos não mudam sem aviso.
- **3D em gráfico tradicional, não:** a perspectiva distorce a comparação.
- **Fonte discreta** (instituição, relatório, ano) quando o contexto pede credibilidade, sem competir com a conclusão.

## 4. Design do gráfico
- **Título informativo**, com a conclusão real: "receita quase dobrou em 4 anos" > "receita por ano".
- **Rótulo direto** no fim da linha ou na ponta da barra > legenda. Legenda só quando o direto não funciona (ordem coerente, nomes curtos).
- **Valores seletivos:** rotule o que precisa ser lido, não tudo.
- **Eixos e grade são auxiliares:** poucos ticks, unidade clara, grade em baixo contraste (ou nenhuma).
- **Unidade sempre explícita.** **Formato brasileiro:** `R$ 4,24 mi`, `1,5 mil`, `72%`, vírgula decimal, ponto de milhar. Precisão só a necessária (`R$ 4.237.812,53` → `R$ 4,24 mi`, a não ser que a precisão seja a mensagem). `tabular-nums` em colunas e contadores.
- **Cor dirige a atenção:** o protagonista com contraste alto (`--primary`/`--accent`), o contexto neutro e esmaecido. **Nunca dependa só de cor:** some rótulo, forma, posição ou tipo de linha (daltonismo: evite codificar só por vermelho × verde).
- **Anotações** respondem "por que este ponto importa?" (pico, queda, outlier, evento, meta), ligadas visualmente ao dado. **Linhas de referência** (média, meta, limite, zero) ficam secundárias.
- **Sem lixo gráfico:** 3D, sombras pesadas, gradientes decorativos, grades fortes, bordas pesadas, fundos complexos, ícones redundantes.
- **Pictogramas:** para quantidade simples e intuitiva, nunca para comparação precisa.
- **Foto + gráfico:** a foto responde "o que é?"; o gráfico responde "quanto?", "como mudou?", "como se compara?". Sem competir.

## 5. Revelar no tempo (motion de dados)
- **Revelação progressiva:** estrutura → dado principal → comparação → contexto → conclusão, acompanhando a narração.
- **Origem com sentido:** a barra cresce da base, a linha avança no tempo, a rota sai da origem real, o ponto surge na sua vez.
- **Comparação animada:** estado A → **hold** → transformação → estado B, devagar o bastante para **perceber** a diferença.
- **Identidade preservada:** o mesmo elemento muda (a barra de 2025 vira a de 2026; o número isolado vira a barra; o pin vira rótulo; os cards se reorganizam em ranking).
- **Contexto que fica:** etapas anteriores **esmaecem** (opacidade 30–50%, menos saturação ou contorno mais fino) em vez de sumir. **Estado atual destacado** com um sistema fixo (destaque = atual, neutro = contexto). O espectador sabe onde está.
- **Spotlight:** criar foco **subtraindo** (esmaecer o resto) costuma ser mais elegante que inflar o alvo.
- **Callout:** primeiro o objeto, depois o foco, o callout e o rótulo; nunca antes de o objeto estar "disponível". Ligação clara entre o rótulo e o alvo.
- **Linguagem de anotações única** (mesma forma, cor e espessura). Sem misturar círculo vermelho, seta amarela, caixa verde e glow azul.
- **Setas** significam direção ou relação. Sem uma das duas, não precisa de seta.
- **Mapas:** revelação progressiva de contexto (mundo → país → estado → cidade); nunca zoom direto num lugar que o espectador não sabe onde fica. Mapa de localização só localiza (remova o detalhe). Muitos pins: agrupe, filtre ou revele aos poucos. A rota segue a direção real.
- **Teste parado:** pause no estado principal. Se não dá para entender parado, o problema é design ou estrutura, não motion.

## 6. Assets antes de desenhar
1. **Procure por necessidade, não por beleza.** "Preciso localizar São Paulo" → mapa SVG do Brasil + estado + sistema de pins. "Cadeia de suprimentos" → ícones de caminhão, fábrica, armazém e loja + sistema de setas.
2. **Ordem de busca:**
   1. asset oficial;
   2. biblioteca da marca (`companies/<slug>/brand/`);
   3. biblioteca visual global (`library/visual/`);
   4. pack compatível;
   5. template interno;
   6. composição com formas existentes;
   7. fonte externa com licença;
   8. criação.
3. **Prefira SVG** (escala, recolorir, separar partes, animar traço, morph, máscara). **Prepare para motion:** paths, grupos, clipping, contornos, preenchimentos, viewBox, nomes de camadas. Guarde um mestre intacto.
4. **Encaixe do asset:** sentido, estilo, qualidade técnica, editabilidade, resolução, consistência. Adapte cor, contorno, escala e cantos ao sistema, **sem descaracterizar símbolos oficiais** (logos de terceiros: SVG oficial, proporção e área de proteção; normalize o tamanho óptico entre logos; o logo não substitui o rótulo quando houver ambiguidade). Bandeiras complementam o nome do país, não viram quiz.
5. **Ícones de uma família só**, escolhidos por clareza (com rótulo quando o sentido não for óbvio). Evite clichês (engrenagem = "sistema").

## 7. Dados no código (nosso stack)
- **Dados em arquivo** na pasta do vídeo: `data/<nome>.json` com `{ "source": "...", "unit": "...", "period": "...", "illustrative": false, "values": [...] }`. A composição gera barras, linhas e rótulos **a partir do JSON** (SVG gerado em código ou D3), sem posicionar à mão.
- **Templates de dados se adaptam aos dados:** recebem dataset, título, destaque, rótulos, paleta (do `brand.css`) e estilo de animação. Nunca distorça o dado para caber no template.
- Componentes reutilizáveis (a construir conforme o uso, em `video-templates/` ou no kit): cartão de número, cartão de comparação, barras, linha, mapa, linha do tempo, fluxo, setas, callouts, rótulos, etiqueta de fonte.

## 8. Controle de qualidade
- **Informação:** a mensagem bate com os dados? Há contexto? Interpretação enganosa? Unidade e fonte estão certas?
- **Representação:** é o melhor tipo de gráfico? Daria para simplificar?
- **Design:** hierarquia, alinhamento, espaçamento, tipografia, cor, ícones, rótulos, margens.
- **Motion:** a ordem das revelações, o timing, a legibilidade, a continuidade. **Revela informação ou só mexe o gráfico?**
- **Assets:** havia um asset melhor? O SVG é bom? A família de ícones é a mesma? O mapa está correto? O logo é oficial?
- **Leitura (sem pausar):** entendi? li os rótulos? peguei o takeaway? havia informação demais? ficou tempo suficiente?
- **Celular:** tamanho do texto, rótulos, detalhe do mapa, espessura de linha, densidade, ícones pequenos.
- **Remoção:** tire decoração, ícones secundários, grade, formas de fundo, animações extras e rótulos redundantes. Se a compreensão se mantém, fique com o simples.

**Premium = uma mensagem clara, dados corretos, assets certos, composição limpa e animação ligada à explicação. Não parece complexo: parece inevitavelmente correto.**
