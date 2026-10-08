# 030 — Editor de mockups no app (mini Canva) + refazer o visual com bom gosto

Status: **fase A feita (2026-10-07) — aguardando o Oliver testar e aprovar os fundos** · Depende de: 028 (motor, molduras calibradas), 018 (app), 024 (kit de marca) · Substitui a fase C da 028

## Onde está (fase A, 2026-10-07)
- **Usar:** `npm run app` → projeto → **Mockups**. Cole (Ctrl+V) ou arraste um print, ou clique num print registrado. Exemplo pronto: `companies/kz/contents/2026-10-07-mockup-painel-inicio` (MacBook + título, 4:5 e 9:16, ajuste fino no 9:16).
- **Decisão de stack:** camadas como **DOM/CSS no mesmo runtime da 028** (`library/mockups/runtime/cena.html` = `mockup.js` + `cena.js`), num iframe do app; o export (`tools/mockup/cena.mjs`, Playwright) abre o mesmo arquivo. Konva/Fabric descartados: teriam de redesenhar molduras, máscaras, vidro (`backdrop-filter`) e gradientes, e o export divergiria do editor.
- **Documento:** `mockup.json` versão 2 (`schema/mockup.ts → MockupScene`; contrato no cabeçalho do `cena.js`). Geometria relativa (centro em fração, largura em u = menor lado = 1080 em todos os formatos). Formato principal = base; outros formatos = ajuste fino gravado só neles ("voltar ao padrão" apaga).
- **Editor:** camadas (aparelho, imagem, texto, forma; arrastar para reordenar, ocultar, travar, duplicar, apagar), mover/redimensionar com alças, encaixe no centro e nas bordas da área segura (Alt desliga), setas (Shift = 10 px), desfazer/refazer, salvar automático, duplo clique edita o texto no próprio quadro (`*ênfase*`, `_serifa_`), zoom Ajustar/50/100/200%, guia da área segura, aviso de texto fora dela (editor e export), formatos marcados exportados juntos, biblioteca de prints (clique troca o print da camada selecionada; arrastar solta no quadro).
- **Painel:** aparelho (21 modelos reais + janela, vidro, tela sem moldura; cor, orientação, ângulo, cantos, tema, encaixe, reflexo, corte automático/sugerido/nenhum), sombra (preset + intensidade, distância, desfoque, cor, sombra de chão), texto (fonte título/corpo/serifa, tamanho, peso, alinhamento, cor e cor da ênfase, entrelinha, espaçamento), forma (retângulo/pílula/círculo, vidro fosco, cor, cantos, borda), fundo (8 presets, cor, gradiente linear/radial com paradas, malha com manchas editáveis, print desfocado, transparente; padrão grade/pontos/linhas/xadrez/círculos com escala, opacidade, cor e esmaecer; grão; vinheta).
- **Defeitos da 028 resolvidos e conferidos em 100%:**
  1. *Sombra com marca (a3)*: confirmada (retângulo cortado do `drop-shadow` dentro do 3D). Agora: perspectiva própria por camada, `drop-shadow` numa camada plana fora do 3D para molduras opacas, `box-shadow` para vidro/janela/tela (o `drop-shadow` aparecia através do vidro como faixa cinza e desligava o desfoque do vidro).
  2. *Gradientes*: 8 fundos novos a partir de referências (mesh gradients, estúdio de produto). Achado em 100% com contraste 8×: o gradiente CSS sai em 8 bits e faz **anéis** em 3×; o grão em `overlay` não pontilha fundo claro. Solução: gradiente/malha pintados num canvas em ponto flutuante (oklab, mancha = disco desfocado por gaussiana) com pontilhado triangular por pixel → liso mesmo esticado 8×.
  3. *Área segura*: guia no editor + aviso no editor e no export (6% do menor lado; 9:16 topo 10% e base 18%). Texto novo já nasce dentro dela.
  4. *Controle*: o editor.
- **Testado no navegador:** criar a partir do print, adicionar texto, mover, redimensionar, trocar para MacBook real, 9:16 com ajuste fino, editar texto no quadro, forma de vidro sobreposta, padrão grade, zoom 100%, colar print pela API (captura + análise de cortes), exportar 4:5 + 9:16 (~15 s, 3240×4050 e 3240×5760). `render.mjs` antigo continua funcionando.

## Falta / próximos passos
- **Oliver:** testar o editor sozinho (critério do "pronto quando") e aprovar ou reprovar os 8 fundos (`node tools/mockup/cena.mjs --teste-fundos` → `library/mockups/galeria/fundos/`, ou no painel Fundo do editor).
- Fase B (depois do aval): alinhar/distribuir e encaixe entre camadas, seleção múltipla, girar pela alça, composições prontas como ponto de partida (herói, duo, perspectiva… refeitos em camadas), recorte do print desenhando no quadro, marcar áreas a ocultar no editor, apagar PNG de formato desmarcado, miniatura da peça na central.
- Os fundos premium antigos do `render.mjs` (aurora, macos…) ficam só para as peças da 028; peça nova usa `fundos.json`.

## Avaliação do Oliver sobre a galeria premium (2026-10-07) — ponto de partida
Veredito: **"a maioria do que foi produzido é lixo"**. Problemas concretos:
1. **Sombra mal feita visível** no `a3` (perspectiva + fundo brilho, `contents/2026-10-07-mockup-painel-premium`): dá para ver a marca/borda da sombra. Hipótese a confirmar: `filter: drop-shadow` em camadas aplicado dentro de um elemento com transform 3D (o filtro achata e o desfoque é cortado no limite da camada) + a sombra de chão elíptica separada. Corrigir com sombra pintada fora do elemento 3D (camada própria, sem corte) e conferir em 100% de zoom.
2. **Fundos e gradientes feios**, "mal feitos, sem suavidade, sem bom gosto". Os 14 premium (aurora, ametista, por-do-sol, macos etc.) foram montados de cabeça com radial-gradients duros. Refazer **a partir de referências reais** (olhar as imagens, não só valores): poucos fundos, muito bons, com transição suave (gradientes em espaço oklch, muitas paradas ou mesh real, desfoque grande, grão fino), e testar cada um em 100% antes de entrar.
3. **Textos sem área segura**: título encostado no topo/bordas; nada respeita margem segura. Regra a aplicar em todo template: margem mínima ~6–8% do menor lado (e topo 10% / base 18% no 9:16), medida e conferida no QA — falhou, não exporta.
4. Falta de **controle**: o Oliver quer ajustar ele mesmo, não receber 8 alternativas fechadas.

O que **vale manter** da 028 (não refazer): molduras reais calibradas (`library/mockups/aparelhos/`, 21 modelos, máscara exata), encaixe do print na tela (`ajuste auto`/estender), analisador de cortes (`tools/mockup/analisar.mjs`), render em 3× pelo Playwright, contrato `mockup.json`/`captura.json`, peça na central.

## O que construir: editor de mockups dentro do app (estilo Canva, enxuto)
Entrada: app → projeto → **Mockups** (aba própria) ou "Abrir no editor" numa peça Mockup da central.

- **Canvas central** com a peça; **sidebar contextual** à direita: mostra os parâmetros do que está selecionado (aparelho, camada de texto, fundo, imagem).
- **Colar (Ctrl+V) e arrastar** imagens novas para o canvas ou para a biblioteca de capturas (registra via `captura.mjs`/análise de cortes por trás).
- **Camadas** (essencial): lista de camadas reordenável (arrastar), mostrar/ocultar, travar, opacidade; tipos: fundo, aparelho+tela, imagem solta, texto, forma/realce, card recortado. Sobrepor livremente para compor visuais.
- **Texto**: adicionar/editar títulos e rótulos direto no canvas (fonte/tokens da marca, tamanho, peso, cor, alinhamento), sempre dentro da área segura (guias visíveis).
- **Fundo**: cor, gradiente editável (paradas, ângulo, tipo linear/radial/mesh), **patterns** selecionáveis (grade, pontos, ruído, etc.) com escala/opacidade, imagem; presets bons como ponto de partida.
- **Aparelho**: trocar modelo/cor/ângulo, sombra (com controle de intensidade/distância/desfoque), cantos; mover/redimensionar no canvas.
- **Proporções múltiplas**: escolher vários formatos (1:1, 4:5, 9:16, 16:9…) e **gerar todos de uma vez**, com a composição se adaptando (ancoragens relativas) e ajuste fino por formato.
- **Exportar**: PNG/WebP 2–3×, transparente, todos os formatos marcados; salva `mockup.json` na peça (reabre no editor).
- Guias: área segura, centro, encaixe (snap) entre camadas.

## Como fazer (rápido e com qualidade)
- **Antes de codar**: 1) achar referências de editores (Canva, shots.so, Figma/Framer) e de fundos/mockups bons e **olhar as imagens**; 2) decidir a stack do canvas (ex.: camadas como objetos DOM/CSS no mesmo runtime da 028, para o render Playwright continuar idêntico ao que se vê; ou lib de canvas como Konva/Fabric — avaliar o custo de manter o render 3× fiel).
- O `mockup.json` vira **lista de camadas** (posição/tamanho relativos ao formato, z-order, props) — o render do Playwright lê o mesmo arquivo; o editor e o export mostram exatamente a mesma coisa.
- Polimento visual conferido em **100% de zoom** (sombras, gradientes, bordas, texto) antes de mostrar ao Oliver; nada de "8 alternativas" sem passar por esse crivo.
- Componentes do app seguem o visual atual (019/shadcn se já aplicada).

## Pronto quando
- O Oliver cola um print, monta um mockup com aparelho + texto + fundo com gradiente/pattern + 1 camada sobreposta, gera 4:5 e 9:16 juntos e exporta, sem ajuda.
- Nenhuma sombra/gradiente com marca visível em 100%; todos os textos dentro da área segura.
- Fundos-padrão refeitos com referência e aprovados pelo Oliver.

## Log
- 2026-10-07: registrada após a avaliação do Oliver da galeria premium (028). Próximo passo: sessão nova, começar por referências visuais + decisão da stack do canvas.
- 2026-10-07 (fase A): referências olhadas (editor do shots.so: estilo à esquerda, quadro no centro, presets; mesh gradients do meshgradient.in). Stack = DOM no runtime da 028. Feitos: `runtime/cena.{html,js,css}`, `fundos.json`, `tools/mockup/cena.mjs` + `cena-lib.mjs`, `core/mockups.ts` + rotas, `schema/mockup.ts` (versão 2), tela `app/src/pages/Mockups.tsx` + `components/mockups/`. Sombra, banda de gradiente e vidro corrigidos e conferidos em 100%. Skill `mockup` e README atualizados (editor = caminho padrão).
