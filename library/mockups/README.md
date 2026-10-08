# Mockups (estúdio de mockups, tarefa 028)

Print ou link → mockup pronto, em alta. **O Claude escolhe, o script compõe:** templates parametrizados (HTML + tokens do `brand.css`) recebem o print num slot e o Playwright renderiza. Nada é desenhado do zero; nenhuma imagem é lida quando o pedido já diz o que quer.

```
print → captura.mjs (mede + analisar.mjs: onde cortar) → render.mjs (mockup.json: template + slots + params) → png/ 3× (transparente opcional) → peça na central
```

**Galeria visual de tudo** (peças reais já geradas, análise de cortes, aparelhos, cores, fundos, sombras, cantos, ângulos, templates, cada card com a flag que reproduz): `node tools/mockup/galeria.mjs` (gera) → `node tools/mockup/servir.mjs` → http://localhost:5181/ (ou, no Claude Code, o preview `galeria-mockups` do `.claude/launch.json`).

## Molduras e exemplos
As molduras calibradas (78 MB) e as telas de exemplo estão no git (repositório privado, uso próprio): basta `git pull` em qualquer máquina. Para **atualizar ou adicionar modelos** (iPhone novo etc.), acrescente em `aparelhos/fontes.json` e rode (~1 GB de download, precisa do 7-Zip: `winget install 7zip.7zip`):
```bash
node tools/mockup/aparelhos.mjs baixar
node tools/mockup/aparelhos.mjs preparar
```

## Comandos
```bash
node tools/mockup/captura.mjs <print.png> --empresa kz --nome agenda [--dpr 2] [--ficticios]   # registra + analisa os cortes
node tools/mockup/analisar.mjs companies/kz/capturas/<pasta>                                  # refaz a análise (analise.png para conferir)
node tools/mockup/render.mjs --listar
node tools/mockup/render.mjs --captura companies/kz/capturas/<pasta> --alternativas 8 --formato 4:5 [--titulo "…"]
node tools/mockup/render.mjs --captura <…> --template heroi --aparelho iphone-18-pro --cor black --fundo estudio --formato 4:5
node tools/mockup/render.mjs companies/kz/contents/<pasta> [--so a2,a5] [--escala 4]          # re-render do mockup.json editado
node tools/mockup/aparelhos.mjs listar                                                       # molduras reais, cores e orientações
node tools/mockup/galeria.mjs [--so templates,fundos] [--empresa kz]                          # galeria (com a marca da empresa, se quiser)
```
Flags de composição: `--aparelho` · `--cor` · `--orientacao vertical|horizontal` · `--angulo` · `--sombra` · `--cantos` · `--ajuste auto|cobrir|conter|estender` · `--recorte auto|<regiao>|x,y,w,h` · `--sem-corte` · `--zoom` · `--destaques a,b` · `--tela2/--tela3 <captura>` · `--aparelho2/--aparelho3` · `--tema claro|escuro` · `--bolinhas cores|neutras` · `--chips vidro` · `--sem-grao` · `--generico` · `--ampliacao` · `--sem-reflexo` · `--titulo "Texto com *ênfase* ou _serifa_"` · `--subtitulo` · `--transparente` · `--escala` (padrão **3**: 4:5 sai 3240×4050) · `--webp` · `--saida` · `--substituir` · `--sem-folha`.

## Catálogo
| tipo | onde | itens |
|---|---|---|
| templates | `templates/<id>/` (`template.html` + `meta.json` + `preview.png`) | `heroi` · `duo` (MacBook + iPhone) · `trio` (MacBook + iPad + iPhone) · `perspectiva` (keynote, sangrando) · `pilha` (cascata 3D) · `leque` (3 iPhones) · `vidro` (glassmorphism + cards) · `zoom` · `cards` · `anotacoes` · `recorte` |
| aparelhos reais | `aparelhos/<id>/` (`aparelho.json` com a geometria calibrada + PNGs das cores + máscara, tudo no git) | iPhone 18 Pro / Pro Max, 17 / 17 Pro / Pro Max, Air, Duo (dobrável) · iPad Pro 11/13 · MacBook Pro 14/16, Air 13/15 · iMac 24 · Studio Display / XDR · Pixel 9 Pro, 10, 10 Pro, 10 Pro XL, Pixel Tablet — com todas as cores oficiais |
| apelidos | `aparelho.json → apelidos` | `celular`/`iphone` → iPhone 18 Pro · `notebook`/`macbook` → MacBook Pro 14 · `tablet`/`ipad` → iPad Pro 13 · `android`/`pixel` → Pixel 10 Pro · `imac` · `monitor` |
| desenhos próprios | `runtime/mockup.js` + `.css` | `navegador` (janela macOS/Safari) · `vidro` (borda de vidro) · `sem-moldura` · `celular-generico` · `notebook-generico` |
| fundos | `runtime/mockup.css` | **da marca** (tokens): liso, gradiente, spot, malha, brilho, desfoque, grade, pontos · **premium** (paleta própria): estudio, estudio-escuro, neutro, grafite, gelo, pessego, menta, papel, vidro-fosco, aurora, ametista, por-do-sol, macos, vinho · transparente. Grão (feTurbulence) automático nos gradientes |
| sombras | `runtime/mockup.js` (`SOMBRAS`) | nenhuma · contato · suave · flutuante · produto (padrão dos reais) · dramatica — camadas suaves tingidas; no aparelho real seguem o contorno (drop-shadow) + sombra de chão de 2 camadas quando apoiado |
| cantos | `CANTOS` | nenhum · sutil · medio · grande · ios (superelipse) · macos |
| ângulos | `ANGULOS` | frente · esquerda · direita · inclinado · isometrico · heroi · heroi-esq |
| formatos | `render.mjs` | `1:1` · `4:5` · `9:16` · `16:9` · `livre` |

Tudo em 1 linha por item: `node tools/mockup/render.mjs --listar` (é isto que a IA lê).

## Onde cortar (analisar.mjs)
Roda sozinho no `captura.mjs`. Acha **fio na beirada** (borda de outra janela), **barra do sistema** (Windows/macOS), **barra do navegador/abas**, **barra de rolagem**, **elemento cortado pela beirada** (recua até o vão vazio mais próximo; se não há vão perto, só avisa — dentro do aparelho a tela "continua") e **sobra vazia grande**; avisa resolução baixa. Grava `captura.json → sugestoes` e `analise.png` (vermelho sai, verde fica: a IA confere num olhar).
- Cortes de confiança **alta** (fio, rolagem) → `recorteSeguro`, aplicado sozinho no render (`--sem-corte` desliga).
- Cortes de confiança **média** (barra do navegador/sistema, sobra) → só com `--recorte auto` depois de conferir a `analise.png`.

## Encaixe do print na tela do aparelho
`--ajuste auto` (padrão): proporção igual → cobre; print mais largo que a tela e base lisa → **estende** (a última linha do print é esticada coluna a coluna: a barra lateral continua branca, o conteúdo continua creme, sem emenda); print mais alto → corta embaixo (a tela rola). Celular foca o topo; notebook, o canto superior esquerdo.

## Contrato de template
- `template.html` carrega `../../runtime/mockup.css` e `../../runtime/mockup.js` (script clássico: abre via `file://` e num iframe do app) e chama `MK.montar(async (MK) => { … })`.
- Config em `window.MOCKUP` (o `render.mjs` injeta) ou JSON no `#hash` da URL: `brandCss`, `largura`, `altura`, `fundo`, `transparente`, `params`, `textos`, `telas.{tela,tela2,tela3}` (`src`, `recorte`, `ocultar`, `dpr`), `destaques[]`, `zoom`, `aparelhos` (aparelho.json + base + máscara inline).
- Ferramentas: `MK.cabecalho()`, `MK.moldura(tipo, tela, caixa, {angulo, cor, orientacao, sombra, cantos, ajuste, foco, aspecto, reflexo, tema})` → `{ el, w, h, tela, real, apoiado }`, `MK.chao(ap, x, y)`, `MK.sombraChao`, `MK.classe(tipo)`, `MK.aparelhoPadrao(tela)`, `MK.imagem`, `MK.recorte`, `MK.regiaoNoPalco`, `MK.chip`, `MK.dropShadow/boxShadow(preset, tamanho)`, `MK.raio(w, preset)`, `MK.svg/tracar`, `MK.colocar`, `MK.p(param, padrão)`, `MK.fundoEscuro()`.
- Cor da marca sempre `var(--…)`; fundos premium têm paleta própria e só entram nas alternativas se a marca liberar em `brand/mockups.json`. Bolinhas da janela neutras por padrão (vermelho+amarelo+coral juntos é proibido na kz).
- `meta.json`: `id`, `nome`, `descricao` (1 linha), `telas`, `precisa`, `formatos`, `transparente`, `animavel`, `params` (tipo, opções, padrão).
- Fim: `window.MK_PRONTO = { ok, qa }` — QA avisa print esticado (> 1,35×), texto fora da área segura, título sob a interface do Stories e desktop dentro do celular.

## Dados e marca
- **Captura** (`companies/<slug>/capturas/<data>-<tela>/captura.json`): `regioes` nomeadas (com `rotulo`), `ocultar` (borradas antes de compor), `sugestoes` (cortes). `dadosFicticios: false` → a peça sai com tag `nao-publicar`.
- **Marca** (`companies/<slug>/brand/mockups.json`): fundos permitidos em ordem de preferência; o gerador de alternativas só usa estes.
- Print em 1× aguenta herói e anotações; zoom, cards e vidro pedem 2–3× (zoom 200% do navegador).
- Renders (`png/`, `folha.png`, `analise.png`, galeria) ficam fora do git: refaça com os comandos acima. Molduras e telas de exemplo ficam no git.

## Licenças
- **Apple Product Bezels** (developer.apple.com/design/resources): para mostrar o seu app em marketing; não alterar o aparelho, não sugerir parceria. Versionadas aqui só porque o repositório é privado e de uso próprio: não tornar público. Regras: developer.apple.com/app-store/marketing/guidelines/#section-products
- **Android Studio device art** (AOSP): Apache 2.0. Pixel é marca do Google.
- Referências de acabamento: shots.so (fundos, vidro), Josh Comeau e Tobias Ahlin (sombras em camadas).

## Próximas fases
B captura por link com login persistente · C aba Mockups no app (o editor usa este mesmo `template.html` num iframe com `#hash`; a galeria é o catálogo visual) · D animações e 3D de verdade (Blender/Three.js, reaproveitando as molduras calibradas) · E criar template a partir de referência. Ver `roadmap/tasks/028-estudio-de-mockups/TASK.md`.
