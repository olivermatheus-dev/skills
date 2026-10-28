# Marca — Olá Espanhol

> Regras de uso da identidade. Os **tokens** (valores) ficam em `brand.css`; aqui fica **como usar**.
> Precedência: o que está aqui vence o default das skills. Seção vazia = vale o default (`knowledge/video/frame.md`).
> Seção **Proibições** = regra dura (entra no QA de toda peça).

<!-- kit-de-marca:inicio (gerado pelo app; edite em Contexto e marca → Marca) -->
## Kit de marca (estilo, ícones e anotações)

**Ícones:** só **Lucide** (lucide.dev, licença ISC), sem misturar bibliotecas. Traço `2` (`--icon-stroke`), estilo linha, cor `--text` (`--icon-color`). SVG pronto: `node tools/icon.mjs <nome> --brand <slug>`.

**Fazer:**
- Antes de qualquer peça, abrir as páginas do manual (brand/manual/) e os prints do site ola-espanhol.com.br (brand/screenshots/) e seguir aquele estilo exato
- Título-herói: abertura em Outfit ExtraLight grafite + virada em Outfit Bold vermelho
- Visual minimalista e claro: fundo creme, cores fortes usadas com equilíbrio
- Vermelho e verde são as cores principais; azul, creme e grafite são de apoio
- Cards de cantos bem arredondados
- Título em Outfit Bold; palavra delicada em Outfit ExtraLight; texto corrido em Outfit Regular
- Ícones e ilustrações com traço redondo, grafite, com detalhe em verde
- Elementos de apoio (formas geométricas do estilo do logo) em traço ou preenchidos, em qualquer cor da paleta

**Não fazer** (regra dura, como as Proibições):
- Alterar cor, distorcer ou reordenar o logotipo
- Mascote em branco sem os detalhes internos (olhos) sobre fundo escuro
<!-- kit-de-marca:fim -->

## Referência obrigatória (ler antes de qualquer peça)
O estilo da Olá Espanhol é **o do manual e o do site**, não o default das skills. Toda peça (vídeo, carrossel, post, mockup, LP, anúncio) copia a linguagem destas referências; na dúvida, abra a imagem e imite, não invente.
- **Manual** (*Manual de Identidad Visual*, Osney Reymy, 2026): páginas em `manual/manual-NN-<tema>.jpg`. Por tema:
  - logotipo: 03, 06 · mascote: 04, 05, 15 · tipografia: 07, 08, **09 (exemplo de uso)** · paleta: 10
  - ícones: 11, 12 · elementos de apoio: 13 · ilustrações: 14, 15
  - peças aplicadas (o "como fica"): **17 navegador, 20 cards professor/aluno, 21 cartaz**, 16/18/19 objetos
- **Site** https://ola-espanhol.com.br: tokens do `:root` copiados no `brand.json`; prints em `screenshots/tela-site-*.jpg` (01 hero · 02 método · 03 diferenças · 04 como funciona · 05 sem amarras · 06 pacotes · 07 seja professor · 08 CTA final + rodapé).
- **Combinações de cor:** só as 7 dobras da seção [Combinações](#combinações-dobras-do-site). Não invente outra.
- Revisor: peça que não parece ter saído do manual ou do site = reprovada.

## Essência visual
Minimalista, clara e calorosa: fundo creme, cores fortes em blocos chapados, tudo redondo (logo, traço, cards, botões). Amigável, sem ser infantil; muito respiro.

## Cores
| token | hex | papel |
|---|---|---|
| --primary | #CF3F56 | rojo, **principal**: logo, palavra de virada do título, botão principal, faixa do logo, fundo de seção de destaque |
| --accent | #DAE069 | verde, **principal**: laço do L, preenchimento dos ícones, pílula/contorno de tag, formas de apoio, blob decorativo. **Nunca texto sobre claro** |
| --support | #A6D1CC | azul, apoio: fundo de seção/cena, moldura, linha fina acima da faixa vermelha, seta curva decorativa |
| --bg | #FFFFF0 | blanco (creme): fundo padrão de tudo |
| --text | #3F3F3F | negro (grafite): texto, ícones, ilustrações, fundo inverso |
| --primary-strong | #AF2F48 | texto e contorno do botão secundário, links |
| --*-deep | #6D1A22 · #918E33 · #4A6B66 | **tom-sobre-tom**: mascote ou número grande sobre o fundo da mesma cor (vinho no vermelho, oliva no verde, teal no azul; ex.: "01 02 03" da seção Como funciona) |

## Combinações (dobras do site)
**Regra dura:** toda cena, slide, bloco ou criativo usa **uma destas 7 dobras, inteira** (fundo + título + ênfase + texto + card + botão + elemento). Não se mistura papel de uma dobra com outra e não se cria combinação nova. Medido no CSS computado de cada `<section>` da home (2026-10-26). Tokens prontos no `brand.css`: `--dobra-<nome>-<papel>` (papéis: `fundo`, `titulo`, `enfase`, `texto`, `card`, `card-titulo`, `card-texto`, `botao`, `botao-texto`, `elemento`).

| dobra | onde está no site | fundo | título | ênfase | texto | card (fundo · título · texto) | botão | elementos visuais | print |
|---|---|---|---|---|---|---|---|---|---|
| **creme** (padrão) | Hero, O que prende a sua fala, Pacotes, Saiba mais | #FFFFF0 | #3F3F3F | **#CF3F56 Bold** (virada) | #3F3F3F | #F8F7E6 · #3F3F3F · #6B6B66 (sem borda); chip flutuante #FFFFFF + `--shadow-md` | principal #CF3F56 / texto #FFFFFF · secundário contorno 2 px #AF2F48 | asterisco e balão em **traço verde** #DAE069; tag pílula contorno verde; ícones grafite + verde; barra de progresso #CF3F56 em trilho #FFFFF0 | 01, 03, 06 |
| **creme-claro** | Por que Olá Espanhol (Método), Dúvidas | #FFFEFA | #3F3F3F (Bold + trecho em ExtraLight) | peso (700 × 200), sem cor | #6B6B66 | #FFFFF0 + borda 1 px #E9E7D3 · #3F3F3F · #6B6B66 | igual ao creme | rótulo caixa alta pequeno #6B6B66 ("MÉTODO"); ícones grafite + verde; seta do FAQ #AF2F48 | 02 |
| **vermelho** | Sem amarras, CTA final | #CF3F56 | #FFFFFF Bold | peso, sem cor | #FFFFFF | #FFFFF0 sem borda · #3F3F3F · #6B6B66 | **creme #FFFFF0 / texto #3F3F3F** (nunca vermelho sobre vermelho) | **blob verde preenchido** #DAE069 saindo da borda; traço "brilho" verde ao lado do título; ícones grafite + verde dentro dos cards | 05, 08 |
| **azul** | Como funciona | #A6D1CC | #3F3F3F Bold | **números grandes #4A6B66 Bold** ("01 02 03 04") | #3F3F3F | #FFFFF0 sem borda · #3F3F3F · #6B6B66 | principal #CF3F56 / #FFFFFF; link grafite sublinhado | número teal; mascote tom-sobre-tom #4A6B66 (manual 14) | 04 |
| **creme-suave** | Conheça nossos professores | #F8F7E6 | #3F3F3F (Bold + ExtraLight) | peso, sem cor | #6B6B66 | **#FFFFFF** + borda #E9E7D3 + `--shadow-sm` · #3F3F3F · #6B6B66 | só contorno 2 px #AF2F48 / texto #AF2F48 | foto redonda do professor, bandeira + país | — |
| **verde** | Para professores nativos (bloco de raio 32 sobre o creme) | #DAE069 | #3F3F3F (Bold + ExtraLight) | peso, sem cor | #3F3F3F | — (o próprio bloco é o card) | principal #CF3F56 / #FFFFFF · secundário **creme #FFFFF0 / #3F3F3F** | **mascote professor** (grafite + fone vermelho) grande à direita; rótulo caixa alta grafite | 07 |
| **grafite** | Rodapé | #2D2D2D | **#DAE069 SemiBold** (título de coluna) | #DAE069 | #FFFFF0 (links) · #D6D5C4 (apoio) | #3F3F3F · #FFFFF0 · #D6D5C4 | creme #FFFFF0 / #3F3F3F | **logo claro** (creme + laço verde); **laço verde** grande decorativo | 08 |

**Selos e destaques (dentro de qualquer dobra clara):** "Promoção" #FBF0F1 / #AF2F48 · "Mais escolhido" #DAE069 / #3F3F3F · "Melhor valor" #E4F1F0 / #4A6B66 · card em destaque com borda 2 px #CF3F56 · separador vertical fino #A6D1CC entre itens de confiança ("Pix, boleto ou cartão | Cancele quando quiser").

**Contraste medido (WCAG):** creme título 10,4 · ênfase vermelha 4,6 · vermelho texto branco 4,7 · azul texto 6,3 · verde texto 7,5 · grafite texto 13,7 · botão vermelho 4,7. **Verde e azul nunca são texto sobre claro** (1,4 e ~1,6); em cima deles o texto é sempre grafite.

**Ritmo (ordem real da home):** creme → creme-claro → **vermelho** → creme → **azul** → creme → creme-suave → creme com **bloco verde** → creme-claro → creme → **vermelho** → **grafite**. Em vídeo e carrossel, siga o mesmo revezamento: a maior parte em creme, uma dobra colorida a cada 2–3 telas, nunca duas coloridas seguidas, **grafite só no fechamento** (como o rodapé).

**Como aplicar no carrossel/vídeo:** cada slide/cena recebe a classe da dobra e mapeia os papéis do sistema para os tokens dela:
```css
.fundo-dobra-vermelho { --s-bg: var(--dobra-vermelho-fundo); --s-fg: var(--dobra-vermelho-titulo); --s-fg2: var(--dobra-vermelho-texto);
  --s-enf: var(--dobra-vermelho-enfase); --s-card: var(--dobra-vermelho-card); --s-orn: var(--dobra-vermelho-elemento);
  --s-icone: var(--text); --s-logo: var(--on-inverse); }
/* idem para creme, creme-claro, azul, creme-suave, verde, grafite */
```

## Texto
- Família única **Outfit** (Google Fonts): ExtraLight 200, Regular 400, SemiBold 600 (botões), Bold 700.
- **Título-herói = assinatura da marca:** abertura em **ExtraLight grafite** + virada em **Bold vermelho** na linha de baixo ("Você entende espanhol." / "**Falta falar.**"; "Chega de dizer que fala" / "**"un poquito"**"). Entrelinha apertada (1,02).
- Título de seção: Bold grafite, com variação **Bold + Regular** na mesma linha ("**O que prende** a sua fala"). Sobre vermelho: Bold creme/branco.
- Frase de apoio solta (cartaz): Regular/ExtraLight pequeno, à esquerda, com palavra-chave em Bold ("Treine seu **espanhol** conversando com **nativos**!"), às vezes com a palavra dentro de caixa de contorno verde.
- Card: título Bold grafite curto + texto Regular grafite.
- Caixa alta: não (só rótulo minúsculo tipo "MÉTODO", pequeno e espaçado). Cor de frase nunca cinza.
- Tamanhos mínimos em 1080 px: default (título 72 px, apoio 40 px).

## Fundo
Liso, sempre chapado, e **só os fundos das 7 dobras** (acima): #FFFFF0, #FFFEFA, #F8F7E6, #CF3F56, #A6D1CC, #DAE069 (em bloco), #2D2D2D. Sem gradiente, sem textura, sem foto de fundo, **sem os tons gerados `fundo-tom-*`** (rosas que não existem na marca).
- Supergráfico: mascote "oló" gigante tom-sobre-tom, **cortado pela borda** (manual 14, caneca 18).
- Blob/forma de apoio verde saindo do canto (seção vermelha do site).

## Formas
- Card: fundo `--bg` ou `--surface`, cantos 24–32 px, borda 1 px `--border` ou sombra suave `--shadow-md`; sobre fundo colorido, card creme sem borda.
- Botões em **pílula**: principal `--primary` com texto branco SemiBold; secundário contorno 2 px `--primary-strong` com texto da mesma cor; botão-círculo com seta branca (vermelho ou verde, manual 20).
- Tag: pílula com contorno verde e fundo creme, texto grafite pequeno ("Conversa de verdade com **nativos**").
- Foto em **arco** (topo semicircular) ou recortada sobre meia-lua/arco verde ou azul (site, cartaz).
- Chips flutuantes sobre a foto: card branco com mini-mascote, "Sua próxima aula", fala em espanhol entre aspas; barra de progresso em pílula ("2 / 3h esta semana").
- Faixa de rodapé: bloco `--primary` com logo branco, linha fina `--support` em cima (cartaz 21).
- **Elementos de apoio** (manual 13): traço redondo, sem ponta: asterisco, seta, +, X, coração, check, balão de fala, envelope, lupa, laço do L, pílula; preenchidas: flor/estrela, cruz, meio-círculo, gota, círculo. Em traço ou cheias, qualquer cor da paleta, soltas e pequenas, para preencher espaço ou apontar destaque. Nunca muitas: 2–4 por composição.

## Logo
- **Logo principal:** `logo/logo-horizontal-cor.svg` (letras #CF3F56 + laço do L #DAE069). Usar em fundo creme, creme-claro, creme-suave.
- Arquivos em `logo/`:

  | arquivo | o que é | fundo |
  |---|---|---|
  | `logo-horizontal-cor.svg` | **principal** | dobras creme |
  | `logo-horizontal-branco-laco-verde.svg` | letras creme + laço verde (derivado do manual 06/17) | vermelho, grafite |
  | `logo-horizontal-branco.svg` | tudo creme #FFFAE7, **oficial do site** (`/marca/logo-claro.svg`, usado no rodapé) | grafite, azul, verde, foto |
  | `logo-horizontal-preto.svg` | tudo #2D2D2D | verde, impressão 1 cor |
  | `logo-simbolo-cor.svg` | mascote "oló" vermelho + acento verde | creme; avatar, favicon |
  | `logo-simbolo-branco.svg` | mascote creme (derivado) | vermelho, azul, grafite |
  | `logo-simbolo-preto.svg` | mascote #3F3F3F | creme, verde |
- Falta a versão **vertical** (manual 03): pedir ao Oliver quando precisar.
- Branco sobre vermelho, verde, azul e grafite; sobre o vermelho e o grafite, manter o laço verde (manual 06, 17; rodapé do site).
- **Mascote "oló"** (olhos nas letras, acento verde): logo secundário, substitui o logotipo em avatar, favicon e espaço pequeno (manual 04). Branco/preto com os olhos preenchidos; sobre cor, versão tom-sobre-tom com acento contrastante (manual 05).
- Mascote **professor** (fone vermelho) e **aluno** (livros vermelho/verde) (manual 15, 20): `vectors/vetor-mascote-professor.svg` e `vectors/vetor-mascote-aluno.svg` (oficiais do site).

## Imagem, ícones e ilustração
- Ícones próprios (manual 11–12): traço grafite grosso e redondo + **preenchimento verde** (duotone), nunca só linha fina. Os 9, um por arquivo (oficiais do site), em `icons/`: `icone-constancia` · `icone-nativos-verificados` · `icone-foco-diferencas` · `icone-trocar-professor` · `icone-sem-contrato` · `icone-sem-horario-fixo` · `icone-falsos-amigos` · `icone-sons` · `icone-conjugacoes` (.svg). Folha com todos: `icone-folha-principais.svg`. Na falta de um, Lucide em `--text` com área preenchida em `--accent`.
- Elementos de apoio soltos (oficiais do site) em `vectors/`:
  - traço verde: `vetor-traco-asterisco` · `-balao` · `-brilho` · `-coracao` · `-envelope` · `-laco` · `-lupa` · `-seta-curva`
  - formas cheias: `vetor-forma-flor-verde` · `-blob-verde` (o da dobra vermelha) · `-cruz-azul` · `-gota-azul` · `-meias-luas-vermelho`
  - folhas completas do manual: `vetor-elementos-apoio-traco.svg` (inclui seta, +, X, check e pílula, que não existem soltos) e `vetor-elementos-apoio-preenchidos.svg`.
- Ilustrações grafite (oficiais do site): `vetor-ilustracao-confete` · `-relogio` · `-mao-paz` · `-lampada`.
- Composição pronta: `vetor-cards-professor-aluno.svg` (manual 20).
- Uso nas dobras como no site: asterisco + balão na creme (hero), blob verde na vermelha, brilho ao lado do título no CTA vermelho, laço na grafite.
- Ilustrações (manual 14): só grafite, minimalistas, traço do mascote; mascote pode ganhar detalhe colorido.
- Foto: pessoa real sorrindo, com fone, em contexto de aula online; recorte em arco/forma, com bandeira do país + nome ou balão de fala em espanhol.

## Movimento (opcional)
Calmo e redondo como a marca: entradas com mola suave, formas de apoio que "desenham" o traço, chips que sobem leve. Nada de glitch, flash ou corte seco agressivo.

## Som (identidade sonora)

## Vídeo

## Proibições
- Não alterar cor, distorcer ou reordenar os elementos do logotipo.
- Não usar o mascote em branco "vazado" (sem os olhos) sobre fundo escuro.
- `--accent` (verde) nunca como cor de texto sobre fundo claro.
- Nada fora da linguagem do manual/site: sem gradiente, sem fundo escuro como padrão, sem outra fonte, sem ícone só de linha fina, sem canto reto.
- Combinação de cor fora das 7 dobras (ex.: texto vermelho sobre azul, verde sobre creme, botão vermelho sobre fundo vermelho, fundo `fundo-tom-*`) = reprovado.

## Aprendizados
Feedback do dono, peça a peça (data · peça · o que mudar). Vira regra acima quando se repetir.
