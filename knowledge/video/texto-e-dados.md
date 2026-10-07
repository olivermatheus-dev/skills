# Texto animado, legendas e dados

> Fontes: Etapas 10–11 (consolidado em 2026-10-07). Valores = ponto de partida.

Tipografia parada e áreas seguras: `frame.md`. Leitura: `ritmo.md`. Curvas: `movimento.md`.

## 1. Ordem de decisão
- Texto: **sentido → hierarquia → tipografia → timing → movimento → hold → saída**. Dados: **takeaway → representação → assets → design → motion**.
- Anime a estrutura de sentido: em "Crescemos **300%** em **seis meses**" só os protagonistas ganham destaque.
- Escreva o takeaway ("o espectador sai entendendo que…") antes de desenhar o gráfico. Gráfico só quando há uma relação que se entende melhor visualmente.

## 2. Unidade de animação (a maior que resolve)
| unidade | quando | stagger |
|---|---|---|
| **bloco** (default) | título, rótulo, lower third, frase = 1 ideia | — |
| linha | texto com hierarquia; ordem de leitura ou fala | 100–200 ms |
| palavra | keyword, número, punchline, ritmo com a fala | 60–120 ms |
| caractere | título-herói, logo (vira "preset" fácil) | 15–30 ms |
- Stagger segue a importância, não a ordem das camadas. Frase inteira legível em ≤ 0,6–0,8 s.
- Código: `SplitText` (GSAP, gratuito) em linha, palavra ou caractere.

## 3. Ênfase
- Meios: escala, peso, cor, posição, movimento, timing. **Máx. 1–2 por palavra.**
- Escala = escala do conceito. Peso antes de animar. Cor: 1 palavra por frase.
- Frase entra suave; só a keyword dá um snap pequeno.

## 4. Sincronia e tempo de tela
- Sincronize com unidades de sentido (frase, keyword, virada, punchline), nunca com fonema ou forma de onda.
- **Lead:** texto 2–4 quadros antes da fala. Nunca antecipe a punchline. Número ou conclusão pode vir logo depois (confirma).
- Palavra falada fica ≥ 0,8–1 s.
- **Entrada → hold → saída: hold ≥ 60% da vida do texto.** A leitura conta do texto parado. Informação demais: divida antes de animar.

## 5. Legendas (sistema próprio, legibilidade > efeito)
| item | valor inicial (1080 de largura) |
|---|---|
| corpo | 48–64 px, peso 600–800 |
| bloco | 1–2 linhas, ≤ 28–32 caracteres/linha; short-form 2–5 palavras |
| quebra | onde a fala respira; nunca separe grupos ("a / empresa" ✗) |
| posição | fixa; 9:16 base do bloco em y ≈ 1250–1400, acima da UI; nunca sobre rosto, produto, interface ou gráfico; trocar só por obstrução, entre 2–3 posições |
| fundo | o mínimo (sombra, caixa, scrim); contraste ≥ 4,5:1; contorno pesado não é default |
| entrada | ≤ 200 ms: fade, slide 8–16 px, escala 0,96 → 1 ou máscara; blur ≤ 2 quadros |
| saída | corte ou dissolve rápido |
| palavra atual | um sistema só (cor, peso, fundo ou escala leve) |
| karaokê | só short-form de alta energia; nunca depoimento emocional ou premium |

## 6. Técnicas de texto
- **Máscara:** o texto anda na direção da máscara; folga para descendentes (`tecnico.md`).
- **Escala:** nunca 0 → 1; sutil = 0,92–0,96 → 1. **Rotação**, 3D, texto em caminho, typewriter, tracking animado: só com motivo de sentido; estado final = boa tipografia.
- **Contador:** só se a mudança é a mensagem. `power3.out`/`expo.out`, **`font-variant-numeric: tabular-nums`, valor final parado ≥ 1 s**. Não conte do zero por hábito.
- **Número + rótulo:** valor grande, unidade menor, contexto secundário ("**72%** dos usuários").
- **Substituição** (ANTES → DEPOIS, 10 → 100): preserve as partes comuns; cada estado é percebido.
- **Lower third:** nome, função, organização no máximo; entra rápido e para.
- **Kinetic em tela cheia:** coreografe como sequência com clímax; palavras anteriores encolhem e viram contexto em vez de recomeçar o layout.
- Noise nunca em texto de leitura.
- Família única por vídeo (premium minimal · editorial · social energético). Não misture legenda quicando + título glitch + contador gamer.
- O texto ajusta o preset, não o contrário.
- Som do texto: escala do som = escala da tipografia; não sonorize toda aparição (`som.md`).

## 7. Representação de dados (a mais simples que explica)
| relação | use |
|---|---|
| 1 valor | número tipográfico + rótulo + contexto |
| 2–3 valores | números lado a lado ou barras |
| categorias / ranking | barras (horizontais com rótulo longo; ordenadas se o ranking importa) |
| tempo | linha; área só se o acumulado importa |
| parte do todo | barra empilhada; pizza/donut ≤ 4–5 fatias |
| 2 variáveis | dispersão |
| processo / hierarquia | etapas ou fluxo / árvore |
| causa → efeito | causa, mecanismo e efeito separados; correlação ≠ causalidade |
| cronologia | linha do tempo (proporcional só com escala real) |
| lugar / rota | mapa, pins, coroplético |

## 8. Integridade (regra dura)
- **Nunca invente dado.** Ilustrativo é marcado como ilustrativo (`illustrative: true` + aviso na tela quando couber).
- Confira fonte, unidade, período, base, definição. Dado ausente ≠ zero. Incerteza aparece (faixa, palavras certas).
- Barras com base zero; eixo cortado só explícito. Sem 3D em gráfico. Eixos não mudam sem aviso.
- **Bloqueante: nada de overshoot em propriedade que codifica valor** (altura, largura, ângulo, posição do ponto, número). Barra de 72% não passa por 80%. Use `.out` sem `back`/mola; mola só em container e decoração.
- Fonte discreta (instituição, ano).

## 9. Design do gráfico
- Título com a conclusão: "receita quase dobrou em 4 anos" > "receita por ano".
- Rótulo direto na ponta > legenda. Rotule só o que precisa ser lido. Poucos ticks, grade fraca ou nenhuma.
- **Formato BR:** `R$ 4,24 mi`, `1,5 mil`, `72%`; vírgula decimal, ponto de milhar; precisão só a necessária. `tabular-nums` em colunas.
- Cor: protagonista em `--primary`/`--accent`, contexto neutro. **Nunca codifique só por cor e nunca vermelho × verde sozinhos**: some rótulo, forma, posição ou tracejado.
- Anotação responde "por que este ponto importa?"; uma linguagem só (mesma forma, cor, espessura). Seta só com direção ou relação.
- Sem sombra pesada, gradiente decorativo, ícone redundante.

## 10. Revelação no tempo
- **Progressiva:** estrutura → dado principal → comparação → contexto → conclusão, com a narração.
- Origem com sentido: barra da base, linha no tempo, rota da origem.
- Comparação: A → hold → transformação → B. Preserve a identidade (o mesmo elemento muda).
- Etapas passadas esmaecem (opacidade 30–50%) em vez de sumir; estado atual sempre com o mesmo destaque. Spotlight por subtração > inflar o alvo.
- **Mapas:** contexto progressivo (país → estado → cidade); nunca zoom direto em lugar desconhecido; só o detalhe necessário; muitos pins → agrupe ou revele aos poucos; rota na direção real.
- Não se entende pausado = problema de design.

## 11. Dados e assets no código
- `data/<nome>.json` na pasta do vídeo: `{ "source", "unit", "period", "illustrative": false, "values": [...] }`. Barras, linhas e rótulos gerados do JSON (SVG ou D3), nunca posicionados à mão. Paleta do `brand.css`.
- Template se adapta ao dado; nunca o contrário.
- Busca de asset por necessidade: oficial → `companies/<slug>/brand/` → `library/visual/` (**sem licença registrada, não usa**) → composição com formas → externo licenciado → criar.
- SVG preferido, com grupos/paths nomeados e viewBox; guarde o mestre. Ícones de uma família. Logos de terceiros: SVG oficial, proporção e área de proteção, sem descaracterizar.

## 12. QC
- [ ] Frame parado funciona (hierarquia, quebras, contraste ≥ 4,5:1, área segura).
- [ ] Unidade de animação = a maior possível; ≤ 1–2 meios de ênfase por palavra.
- [ ] Legenda: 48–64 px, ≤ 32 car./linha, posição fixa fora de rosto/UI, entrada ≤ 200 ms.
- [ ] Hold ≥ 60%; tudo lido sem pausar no celular; nada some cedo.
- [ ] Contadores com `tabular-nums` e valor final ≥ 1 s.
- [ ] Dados batem com a fonte; unidade, período e formato BR certos; ilustrativo marcado.
- [ ] Zero overshoot em propriedades de valor; barras com base zero.
- [ ] Nada codificado só por cor (nem vermelho × verde).
- [ ] Revelação progressiva segue a narração; anotações com linguagem única.
- [ ] Teste de remoção: sem bounce, cores extras, SFX e decoração a mensagem ficou mais forte? Fique com o simples.
