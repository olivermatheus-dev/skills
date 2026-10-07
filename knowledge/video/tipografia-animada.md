# Tipografia animada, kinetic type e legendas

> Base: material do usuário "Etapa 10" (2026-10-07), verificado e com valores iniciais. Design tipográfico parado em `design-e-composicao.md` §2; tempos de leitura em `ritmo-e-leitura.md`; curvas em `curvas-e-polimento.md`. **O movimento amplifica o significado do texto, não compete com ele.**

## 1. Sequência mestra (para todo texto animado)
**Significado → hierarquia → tipografia → timing → movimento → hold → saída.**
Nunca comece por "que efeito coloco aqui?". Comece por "como esta frase deve ser percebida?".
- **Anime a estrutura de sentido, não a de texto.** Em "Crescemos 300% em apenas seis meses", os protagonistas são **300%** e **seis meses**; o resto entra junto, sem destaque.

## 2. Unidade de animação (use a maior que resolve)
| unidade | quando | caráter |
|---|---|---|
| **bloco** | título, subtítulo, lower third, rótulo, frase curta que é uma ideia só | limpo, maduro, estável (**default**) |
| **linha** | texto em linhas com hierarquia; revelar na ordem de leitura/importância/fala | estruturado |
| **palavra** | keyword, contraste, número, punchline, ritmo com a fala | ênfase semântica |
| **caractere** | título-herói, logo, identidade expressiva | energia, mas difícil de controlar; vira "infantil/preset" fácil |

- **Stagger:** caractere 15–30 ms (fluxo; título elegante soa coletivo), palavra 60–120 ms, linha 100–200 ms, **seguindo a importância**, não a ordem das camadas. **Nunca transforme leitura em espera:** a frase toda tem que estar legível em ≤ ~0,6–0,8 s.
- Em código: `SplitText` do GSAP (gratuito) para dividir em linha, palavra ou caractere; **anime a maior unidade possível**.

## 3. Ênfase (poucas ferramentas por palavra)
Escala · peso · cor · posição · movimento · timing. **No máximo 1–2 para a mesma palavra.** Cor + zoom + shake + glow + sublinhado + SFX juntos só com intenção extrema.
- **Escala** reflete a escala do conceito ("300%" grande), nunca é arbitrária.
- **Peso** costuma ser mais elegante que animar: antes de animar para enfatizar, veja se a tipografia já resolve.
- **Cor de destaque** é recurso raro: 1 palavra por frase (5 destaques = nenhum).
- **Movimento excepcional = importância excepcional:** a frase entra suave e só a keyword dá um pequeno snap.

## 4. Sincronia com a fala
- Sincronize com **unidades de sentido** (frase, keyword, virada, pausa, punchline), não com cada fonema ou com a forma de onda.
- **Lead:** o texto pode surgir 2–4 quadros **antes** da palavra para o olho localizar. **Nunca antecipe a punchline.**
- **Follow:** o texto aparece logo **depois** da fala para confirmar (número, conclusão, conceito-chave).
- **Persistência:** palavra falada não some na hora. Mínimo ~0,8–1 s visível (`ritmo-e-leitura.md` §2).

## 5. Legendas (sistema separado do kinetic type)
A função é **ler a fala**: legibilidade > animação. Premium = precisa, legível, controlada (não = mais efeito).
| item | regra (valor inicial para 1080 de largura) |
|---|---|
| tamanho | 48–64 px (reels/shorts); peso 600–800 |
| tamanho do bloco | 1–2 linhas; ≤ ~28–32 caracteres por linha em vertical; em short-form, blocos de 2–5 palavras |
| quebra | por unidade de fala ou ideia; nunca separe grupos ("Eu comecei a / empresa ontem" ✗). Quebre onde a fala respira |
| posição | fixa e consistente, **acima da área da interface** (9:16 orgânico: base do bloco em y ≈ 1250–1400; ver `formatos-e-areas-seguras.md`); nunca sobre boca, rosto, mãos, produto, interface ou gráfico. Mudança só por obstrução real, entre 2–3 posições predefinidas |
| fundo | o menor tratamento necessário: caixa, sombra sutil, contorno discreto, gradiente ou scrim. Contorno pesado não é default. Contraste ≥ 4,5:1 |
| entrada | rápida e consistente: fade, slide de 8–16 px, escala 0,96 → 1 ou máscara (≤ 150–200 ms). **A animação aparece menos que a frase.** Blur só por 1–2 quadros |
| saída | muito rápida, dissolvida ou substituição direta; nunca atrapalha a próxima |
| destaque da palavra atual | **um sistema só** (cor, peso, fundo ou leve escala), para ajudar a acompanhar e não virar jogo |
| karaokê | short-form de alta energia, para público acostumado. **Evite** em depoimento emocional, contemplativo ou premium minimalista (salvo direção de arte) |

## 6. Revelações e técnicas
- **Máscara:** vertical, horizontal, radial ou por forma do layout. O movimento do texto acompanha a direção da máscara. Folga embaixo para as descendentes (`tecnico-hyperframes.md`).
- **Linha que revela:** só se linhas e formas já pertencem à linguagem visual (a linha cresce e o texto emerge dela).
- **Typewriter:** só com sentido de escrita, terminal, mensagem, busca, código ou documento. Ritmo com pausas na pontuação e no fim de frase (humano), ou uniforme (UI técnica).
- **Tracking animado:** em título, logo ou palavra curta (a palavra como forma). **O estado final tem que ser boa tipografia.**
- **Escala:** nada de 0 → 100%. Para sutileza, 0,92–0,96 → 1.
- **Rotação:** personalidade forte. Pequenos graus já pesam; nunca "para ficar interessante".
- **Texto em caminho:** só quando o caminho tem sentido (mapa, trajetória, objeto). Não deforme texto informativo.
- **3D e 3D por caractere:** só quando cria espaço real (perspectiva, câmera). Nunca em texto de leitura rápida.
- **Trocar o conteúdo do texto (contador, rótulo, comparação, correção):** cada estado precisa ser percebido.
- **Contador:** só se a mudança faz parte da mensagem (crescimento, progresso). Desacelera no fim (`power3.out`/`expo.out`), **valor final parado ≥ 1 s**, `font-variant-numeric: tabular-nums` (os dígitos não "tremem"). Nunca conte do zero por hábito.
- **Número + rótulo:** valor grande, unidade menor, contexto secundário ("**72%** dos usuários").
- **Citação:** citação → autor → contexto, em hierarquia separada.
- **Lower third:** identifica sem roubar a cena. Nome, função e organização no máximo; entrada limpa e rápida; parado para leitura.
- **Title card e capítulos:** mais expressão onde merece ocupar o quadro. Capítulos seguem **o mesmo sistema** (layout, pausa, fundo, numeração, som).
- **Texto como transição:** a palavra cresce até encher o quadro; a letra vira máscara. Momento especial, sempre ligado ao sentido.
- **Substituição:** ANTES → DEPOIS, 10 → 100, PROBLEMA → SOLUÇÃO, preservando as partes comuns.
- **Movimento semântico / onomatopeia visual** ("cair" cai, "expandir" cresce): recurso expressivo **seletivo** (publicidade, título, humor), nunca gramática obrigatória.
- **Kinetic em tela cheia:** coreografe como sequência (frases, batidas, hierarquia, transições, clímax). A **câmera explora um espaço tipográfico que já existe**. Reaproveite o espaço: palavras anteriores ficam, encolhem e viram contexto, em vez de recomeçar o layout a cada frase.
- **Procedural** (seletores de faixa, aleatório, noise): controle amplitude, frequência e semente. Nunca noise em texto de leitura; aleatório sem controle destrói a hierarquia.

## 7. Som do texto
Revelação pequena = tick suave; slide rápido = swish; título importante = impacto discreto; contador = ticks seletivos; grande revelação = camada tonal + impacto. **A escala do som segue a da tipografia; não sonorize toda aparição.** O texto pode reagir a batidas ou impactos **selecionados**, nunca mecanicamente.

## 8. Estrutura temporal de cada texto
**Entrada → hold (leitura) → saída.** Entrada e saída não podem comer a duração: o hold é ≥ 60% da vida do texto na tela, e o tempo de leitura conta a partir do texto **parado e legível**. Muita informação? **Divida antes de animar** (problema → causa → resultado).

## 9. Sistema e presets
- **Família editorial antes das animações individuais:**
  - *Premium minimal*: máscara suave, movimento contido, overshoot baixo, legenda neutra;
  - *Editorial*: tipografia grande, grid forte, transições deliberadas;
  - *Social energético*: legendas rápidas, ênfase em keywords, impactos selecionados.
- **Não misture** legenda quicando + lower third corporativo + título glitch + citação clássica + contador gamer.
- **Ficha de preset:**
  - nomes: `title_enter`, `caption`, `keyword_highlight`, `lower_third`, `counter`, `quote`, `chapter`, `mask_reveal`, `kinetic_word`, `character_stagger`;
  - caráter: premium/elegant/playful/energetic/technical/cinematic;
  - intensidade: subtle/medium/strong;
  - unidade: block/line/word/character.
- **O conteúdo determina a forma final do preset:** revise fonte, quebras, tracking, entrelinha, escala, distância, timing, stagger, easing, hold, saída e som. Não force o texto a caber na animação.

## 10. Controle de qualidade
- **Design (parado):** hierarquia, quebras, entrelinha, tracking, kerning, alinhamento, contraste, margens. Se o frame parado não funciona, pare.
- **Movimento:** timing, stagger, easing, blur, escala, caminho, overshoot, settle. **Aumenta a compreensão ou só a atividade?**
- **Leitura (sem pausar):** li tudo? precisei correr? algo sumiu cedo? achei o principal na hora? Se não, simplifique.
- **Som:** sincronia com a fala e com as batidas relevantes, repetição de SFX, excesso de clicks. **Depois sem SFX:** ainda funciona?
- **Celular:** tamanho, contraste, quebras, área segura, velocidade, quantidade.
- **Amador:**
  - todas as palavras animadas, ou cada uma de um jeito;
  - bounce em excesso e fontes demais;
  - cor arbitrária;
  - palavra pulando a cada sílaba;
  - sem hold;
  - tracking e quebras ruins;
  - SFX em todo texto;
  - legenda sobre o rosto;
  - preset reconhecível;
  - efeito sem relação com o sentido.
- **Premium:**
  - hierarquia imediata e poucas decisões fortes;
  - quebras excelentes;
  - timing ligado ao sentido e curvas refinadas;
  - legibilidade;
  - consistência e estabilidade na leitura.

  **Coreografada, não decorada.**
- **Teste de remoção:** tire bounce, rotação, cores extras, animações secundárias e SFX. Se a mensagem ficar mais forte, fique com o simples.
