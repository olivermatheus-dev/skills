# Marca — kz

> Tokens em `brand.json` (gera o `brand.css`; editar no app → Contexto e marca → Marca, ou `npm run brand -- kz`). Aqui, como usar. Precedência: isto vence o default das skills.

<!-- kit-de-marca:inicio (gerado pelo app; edite em Contexto e marca → Marca) -->
## Kit de marca (estilo, ícones e anotações)

**Ícones:** só **Lucide** (lucide.dev, licença ISC), sem misturar bibliotecas. Traço `1.5` (`--icon-stroke`), estilo linha, cor `--primary` (`--icon-color`). SVG pronto: `node tools/icon.mjs <nome> --brand <slug>`.

**Anotações:**
Nosso estilo na maioria das vezes será monocromática, usando variações mas mantendo a cor principal e suas versões mais pastéis na composição.
<!-- kit-de-marca:fim -->

## Essência visual
**Calma antes de impacto.** Fundo creme, coral só como destaque, pastéis suaves, cantos arredondados e muito respiro. Acolhedor, nunca corporativo. Peças no modo claro por padrão; slide escuro só com os tons 800–900 da escala (ver Fundo).

## Cores
| token | hex | papel / significado |
|---|---|---|
| --bg | #faf5f1 | creme do app (medido no painel) — fundo padrão de todas as peças |
| --surface | #ffffff | cards e barra lateral do app |
| --surface-2 | #f6f1ec | seções secundárias |
| --text | #50505e | tinta do app: títulos e frases (grafite levemente azulado) |
| --ink | #2b2b2b | tinta máxima: texto sobre coral, contraste extra |
| --logo | #d8735e | cor exata da logo (mais fechada que o coral dos botões) |
| --muted | #5a5a5a | rótulos pequenos dentro do app |
| --primary | #ef7960 | coral da marca: CTA, logo, ponto de destaque. **Em pontos, nunca em blocos grandes** |
| --on-primary | #2b2b2b | texto sobre coral nas peças. O **app** usa branco sobre coral (`--on-primary-app`, 2,8:1): só ao recriar a tela do produto, em botão curto e peso 600+ |
| --primary como texto | — | **não usar coral #ef7960 como cor de texto** (2,6:1 sobre o creme) |
| --accent | #d66954 | coral profundo: palavra de ênfase sobre fundo claro (#bc5a47 se precisar de AAA) |
| --accent-soft | #fce0d7 | fundo de tag e de realce |
| pastéis | sage #cfe0d0 · lavanda #d8d2e3 · céu #cdd8e0 · manteiga #f1e7c9 · rosa #f1d6cc · argila #ddcfc2 | **só semânticos**: cor de uma funcionalidade ou categoria (ex.: tipos de sessão na agenda); nunca como paleta geral nem fundo da peça inteira |
| --tone-50 … --tone-950 | escala gerada da cor principal (kit de marca → Paleta tonal) | **a paleta das peças**: tons claros e escuros do coral. Texto sobre cada tom: `--on-tone-N` (contraste ≥ 4,5:1) |

## UI do produto (para recriar telas em vídeo e carrossel)
Medido no print do painel (2026-10-07): fundo `--bg`, barra lateral e cards brancos (raio ~16 px, borda `--border` #ece4dc, sombra quase nula), divisórias `--ui-divider`, botões coral com texto branco, avatar com iniciais coral sobre `--ui-avatar`, brilho coral suave no canto do card de destaque (`--ui-glow`), blocos de ícone dos Atalhos em 4 pares fundo/traço (`--tile-coral`, `--tile-teal`, `--tile-amber`, `--tile-lilac`), rótulos pequenos em caixa alta `--ui-muted`. Saudação: "Boa tarde," em Montserrat + **nome em serifa itálica coral (hoje Newsreader no material; o app ainda usa Fraunces)**. Ícones de linha (Lucide). Tokens em `brand.css` > "UI do app".

## Texto
- **Serifa de destaque:** Newsreader (itálico ou romano; trocou a Fraunces em 2026-10-09) (`--font-accent`): nome, palavra da virada ou citação curta, como o nome na saudação do app.
- Título e frase em `--text`. Ênfase **rara** (decisão de 2026-10-09): no máximo em 1 a cada 3 slides, só na palavra da virada, alternando `--accent` (3,3:1 sobre o creme: só em título grande, nunca em texto corrido) e a serifa de destaque. Título comum fica numa cor só; o destaque vem de escala e layout.
- Montserrat em tudo: títulos 700 (line-height 1.15, −0.01em), subtítulos 600, corpo 400 (line-height 1.6).
- Sem caixa alta em texto longo. Sem peso 900. Serifa só a de destaque (nunca em corpo de texto).

## Fundo
- O fundo do slide é **creme `--bg` / branco** ou **um tom da escala** (`--tone-50`…`--tone-950`). Claros: 50–100; campos de cor: 200–300; ênfase: 600–700.
- **Slide escuro permitido** com os tons 800–900 (quente, nunca preto puro); texto com `--on-tone-N`. Isto vale para peças; o modo escuro do app segue só dentro do app.
- Pastéis são **só semânticos** (cor de uma funcionalidade/categoria), nunca fundo geral.
- Coral `#ef7960` continua **só em pontos** (CTA, ícone, palavra de destaque), nunca em bloco grande. Para campos de cor use os tons 200–300 ou 600–700.
- Gradiente só **local** (brilho num canto, transição entre dois tons vizinhos da escala dentro de um elemento), nunca como fundo inteiro.
- Profundidade com cards brancos e sombra suave.

## Formas
Raio 16 px (cards) e 10 px (chips e botões pequenos). Sombras suaves (`--shadow-md` padrão). Bordas `--border` 1 px.

## Logo
- `logo/kz-logo.svg`: "kz" em ligadura (a perna e o braço do k viram as barras do z), cor `--logo` #d8735e. Redesenhado em vetor a partir do PNG oficial (sobreposição conferida). Variantes: `kz-logo-ink.svg` (#2b2b2b) e `kz-logo-white.svg` (fundo escuro).
- Em vídeo: SVG inline com `fill: var(--logo)`. Altura mínima ~48 px; respiro em volta ≥ metade da altura.
- A validar: área de proteção oficial e se existe versão com o nome por extenso.

## Imagem, ícones e ilustração
- **Foto:** luz natural, tons quentes, terapeutas em consultório acolhedor (escutando, escrevendo, lendo), close médio em mãos e expressão.
- **Ilustração:** orgânica e abstrata, traço leve, curvas, paleta coral + pastéis.
- **Ícones:** só Lucide, linha 1,5 (ver Kit de marca acima).

## Movimento
Mais calmo que o default: preferir molas `GENTLE`/`FAST`, evitar `SOFT` com passagem grande e chicotes agressivos. Nada de partículas festivas, exceto confirmação de pagamento/agendamento.

## Som (identidade sonora)
- **Eixos:** orgânico (mais que digital) · suave · minimalista · elegante · natural · quente. Coerente com "calma antes de impacto".
- **Trilha:** acolhedora, 70–95 BPM, piano/cordas leves/pads quentes; nada épico ou agressivo.
- **Efeitos:** clicks e pops discretos de UI, *air* suave para movimento, soft impacts só na revelação, notificação/sucesso gentil (sem "plim" estridente). Famílias: a definir ao montar a biblioteca.
- **Proibido:** bass drop, sirene, glitch agressivo, risada pronta.
- A validar com o Oliver.

## Vídeo
- Formatos padrão: 4:5 e 9:16.
- Voz: rascunho `edge-thalita` (Thalita, grátis); final **Carla** (`el-carla`, ElevenLabs v4, stability 0,38), desde 2026-10-07. Escolha em `brand/voices.json`, catálogo em `library/voices/`.
- Pronúncia de "kz" na locução: **"cá-zê"** (como a Carla leu "KZ" no 1º vídeo). Na tela, sempre a logo ou "kz" minúsculo.
- Trilha: calma/acolhedora (70–95 BPM).
- Elenco fictício para dados de demonstração: a definir (nomes de terapeutas e pacientes, sempre marcados como ilustrativos).

## Proibições
- Cores digitais puras (#FF0000, #00FF00 etc.); coral, vermelho e amarelo juntos na mesma peça.
- Banco de imagens corporativo, aperto de mão, gráfico subindo, foguete, personagens corporativos.
- Promessas de resultado terapêutico ou uso de depoimento de paciente (regras CFP/CRP — ver `context/BUSINESS.md`).

## Aprendizados
- 2026-10-07 (1º vídeo, v01 → v02): o Oliver quer **mais dinâmica** — sem espaço vazio antes do texto, headline animada em toda frase, ícones e elementos que ilustram o que é dito, sons discretos em cada card que entra ou sai. Calma ≠ parado.
- 2026-10-07 (teste do kit): o ponto/ênfase do logotipo em texto usa `--accent`, nunca `--primary` (coral como texto reprova contraste).

## A validar
- Logo final e variações (horizontal, símbolo, branco); área de proteção.
- O creme #faf8f5 funciona bem nas peças reais?
- Cores de status (`--success/--warning/--danger`) são estimativas — confirmar com o CSS do app.
