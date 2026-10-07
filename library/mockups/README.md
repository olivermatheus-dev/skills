# Mockups (estúdio de mockups, tarefa 028)

Print ou link → mockup pronto. **O Claude escolhe, o script compõe:** templates parametrizados (HTML + tokens do `brand.css`) recebem o print num slot e o Playwright renderiza em alta. Nada é desenhado do zero; nenhuma imagem é lida quando o pedido já diz o que quer.

```
print → captura.mjs (captura.json) → render.mjs (mockup.json: template + slots + params) → png/ (2×–3×, transparente opcional) → peça na central
```

## Comandos
```bash
node tools/mockup/captura.mjs <print.png> --empresa kz --nome agenda [--dpr 2] [--ficticios]
node tools/mockup/render.mjs --listar
node tools/mockup/render.mjs --captura companies/kz/capturas/<data>-<tela> --alternativas 6 --formato 4:5 [--titulo "…"]
node tools/mockup/render.mjs --captura <…> --template heroi --aparelho notebook --fundo liso --formato 4:5 [--transparente] [--escala 3]
node tools/mockup/render.mjs companies/kz/contents/<pasta> [--so a2,a5] [--escala 3]   # re-render do mockup.json editado
node tools/mockup/render.mjs --previews --captura <…>                                  # preview.png dos templates
```
Flags de composição: `--zoom <regiao|x,y,w,h>` · `--destaques a,b` · `--recorte <regiao>` · `--tela2 <captura do celular>` · `--angulo frente|esquerda|direita|inclinado|isometrico` · `--tema claro|escuro` · `--ampliacao 1.6` · `--sem-reflexo` · `--titulo "Texto com *ênfase* ou _serifa_"` · `--subtitulo` · `--webp` · `--saida <pasta>` · `--substituir` · `--sem-folha`.

## Catálogo
| tipo | onde | itens |
|---|---|---|
| templates | `templates/<id>/` (`template.html` + `meta.json` + `preview.png`) | `heroi` · `duo` (notebook + celular) · `zoom` (lupa) · `cards` (regiões flutuando) · `anotacoes` (rótulos com linha) · `recorte` (só a tela, para sobrepor) |
| aparelhos | `runtime/mockup.js` (geometria) + `runtime/mockup.css` (visual) | `navegador` (claro/escuro) · `notebook` · `celular` (grafite/claro) · `sem-moldura` — todos próprios, sem marca registrada; ângulos CSS 3D |
| fundos | `runtime/mockup.css` | `liso` · `gradiente` · `malha` · `grade` · `pontos` · `brilho` · `desfoque` (a própria tela) · `transparente` |
| formatos | `render.mjs` | `1:1` 1080² · `4:5` 1080×1350 · `9:16` 1080×1920 · `16:9` 1920×1080 · `livre` (tamanho do recorte) |

Lista de 1 linha por item: `node tools/mockup/render.mjs --listar` (é isto que a IA lê; `catalogo.json` + `meta.json`).

## Contrato de template
- `template.html` carrega `../../runtime/mockup.css` e `../../runtime/mockup.js` (script clássico: abre via `file://` e num iframe do app) e chama `MK.montar(async (MK) => { … })`.
- Config em `window.MOCKUP` (o `render.mjs` injeta) ou JSON no `#hash` da URL: `brandCss`, `largura`, `altura`, `fundo`, `transparente`, `params`, `textos`, `telas.{tela,tela2}` (`src`, `recorte`, `ocultar`, `dpr`), `destaques[]`, `zoom` — regiões já em px da imagem original.
- Ferramentas do runtime: `MK.cabecalho()` (título + área livre, respeita a área segura do 9:16), `MK.moldura(tipo, tela, caixa, {angulo, reflexo, tema, foco})`, `MK.imagem`, `MK.recorte`, `MK.regiaoNoPalco`, `MK.chip`, `MK.svg/tracar`, `MK.sombraChao`, `MK.colocar`, `MK.p(param, padrão)`.
- Cor sempre `var(--…)` da marca; nada de cor fixa além do aparelho (grafite/prata neutros). Bolinhas da janela são neutras (vermelho+amarelo+coral juntos é proibido na kz).
- `meta.json`: `id`, `nome`, `descricao` (1 linha), `telas`, `precisa`, `formatos`, `transparente`, `animavel`, `params` (tipo, opções, padrão).
- Fim: `window.MK_PRONTO = { ok, qa }` — QA automático avisa print esticado (> 1,35×), texto fora da área segura e título sob a interface do Stories.

## Dados e marca
- **Captura** (`companies/<slug>/capturas/<data>-<tela>/captura.json`): `regioes` nomeadas (com `rotulo` = texto da anotação) e `ocultar` (áreas borradas no canvas antes de compor). `dadosFicticios: false` → a peça sai com tag `nao-publicar`.
- **Marca** (`companies/<slug>/brand/mockups.json`): fundos permitidos em ordem de preferência; o gerador de alternativas só usa estes.
- Print em 1× aguenta herói e anotações; zoom e cards pedem 2–3× (a ampliação padrão já cai para 1,4×/1,3× com print em 1×).
- Renders (`png/`, `folha.png`) ficam fora do git: refaça com `render.mjs <pasta>`.

## Próximas fases
B captura por link com login persistente · C aba Mockups no app (o editor usa este mesmo `template.html` num iframe com `#hash`) · D animações e 3D no vídeo · E criar template a partir de referência. Ver `roadmap/tasks/028-estudio-de-mockups/TASK.md`.
