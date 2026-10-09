# Famílias de layout do carrossel

Um fragmento HTML por família (`NN-<família>.html`, guia de slots no comentário do topo); o CSS de todas está em `../sistema.css` (seção 8). Renderizadas na marca: `../catalogo/png/` e `../catalogo/contato.png` (refazer: `node .claude/skills/carousel/scripts/catalogo.mjs --brand <slug>` + `render.mjs` no `catalogo.html`).

**Regra de uso:** a família é escolhida no plano (`slides.json`, skill `plano-de-slides`), nunca na hora de diagramar. Vizinhos nunca na mesma família; ≥ 4 famílias em 8 slides; um slide **leve** a cada 3–4.

| família | papel típico | densidade | herói | quando usar | quando NÃO usar |
|---|---|---|---|---|---|
| `capa-tipografica` | gancho | leve | o título em display (136 px) ancorado embaixo | capa de frase forte ≤ 10 palavras; o motivo do carrossel entra pelo alto e sangra à direita | título longo (vira parede); quando a prova visual é o gancho (use `capa-objeto`) |
| `capa-objeto` | gancho, 2ª capa | média | um objeto real (tela, agenda, card) sangrando | quando mostrar vence dizer ("De 5 apps para 1." + a agenda) | sem tela/print real; objeto decorativo ou ilustração genérica |
| `split` | contexto, tensão em 2 tempos | média | o campo de cor com a 1ª ideia | duas ideias que se opõem ou se completam (quem sou / o problema); a costura é o corte | texto atravessando a costura; duas metades com o mesmo peso |
| `campo` | tensão, virada, respiro | leve | a frase-golpe em display | uma frase só, com pausa dramática; o vazio é o assunto | mais de 2 frases; logo depois de outro slide escuro |
| `numero` | prova, decisão | leve | o numeral gigante (560 px) | 1 número com fonte no contexto + o que ele significa | número inventado ou redondo; dois números competindo |
| `citacao` | síntese, regra, voz | leve | a frase na serifa de destaque (108 px) | frase do fundador/autor real ≤ 14 palavras | citação inventada, fala de paciente; a ≤ 2 slides de uma ênfase serifa |
| `trilho` | prova, passos, lista | média | o título + 3–5 itens no trilho | itens da mesma família (mesma dor, passos de um processo) | itens sem relação; número no nó sem sequência real |
| `pilha` | contexto, tensão (acúmulo) | densa | a pilha de cards | bagunça, camadas, "tudo junto" (o motivo dos 5 apps) | lista que precisa ser lida em ordem (use `trilho`); mais de 5 cards |
| `comparacao` | prova, antes × depois | densa | a coluna boa em campo | antes × depois, mito × verdade, 2–3 linhas pareadas | vermelho × verde; funcionalidade que não existe; mais de 3 linhas |
| `zoom` | prova | média | o detalhe da UI ampliado e cortado | mostrar UMA funcionalidade real de perto, com anotação | painel inventado; zoom de algo que não se lê; 2 zooms seguidos |
| `fluxo` | virada, mecanismo | média | os fios convergindo no destino | N → 1, 1 → 2 → 3: explicar como uma coisa vira outra | decoração (setas sem significado); mais de 5 nós |
| `cta` | CTA (último) | leve | o pedido em display + o objeto da resposta | sempre o último; 1 pedido (comentar, salvar, enviar ou link) | 2 pedidos; "arraste"; logo extra (a marca já está no rodapé) |

## Fundo por slide (classes `fundo-*` em `sistema.css`)
`creme` (padrão) · `branco` · `tom-50` · `tom-100` (claros) · `tom-200` · `tom-300` (campos de cor) · `tom-800` · `tom-900` (escuro, ≤ 1/3 dos slides). Cada classe redefine as variáveis locais (`--s-fg`, `--s-meta`, `--s-hair`, `--s-enf`, `--s-card`…): os componentes se adaptam sozinhos. A mesma classe serve num bloco interno (o campo do `split`).

## Componentes de detalhe (cada um precisa de função no plano)
`eyebrow`/`t-rotulo` (≤ 1 a cada 3 slides) · `hairline` · `regua` (escala que conta algo) · `card` / `card alto` (sombra tingida em 6 camadas) · `chip` · `t-giga` · `moldura` com marcas de registro (detalhe/recorte) · `aspas` + `citacao-texto` (serifa de destaque) · `anota` (fio + ponto) · `ui-*` (fragmento da UI do produto, BRAND.md > UI do produto) · `ui-brilho` (o único gradiente aceito: 1 slide) · `grao` (opcional, 6%) · `rodape` (marca + `NN/TT`; capa: só "arraste"; último: sem seta).

## Tokens dos fragmentos
`{{icone:nome}}` (Lucide, traço do kit) · `{{logo}}` (logo da marca em `currentColor`) · `{{n}}`/`{{t}}` (nº do slide/total). Depois de colar os fragmentos no `carrossel.html`: `node .claude/skills/carousel/scripts/catalogo.mjs --expandir <carrossel.html> --brand <slug>`.
