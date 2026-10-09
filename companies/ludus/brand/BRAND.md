# Marca — ludus (Ludus)

> Regras de uso da identidade. Os **tokens** (valores) ficam em `brand.css`; aqui fica **como usar**.
> Precedência: o que está aqui vence o default das skills. Seção vazia = vale o default (`knowledge/video/frame.md`).
> Seção **Proibições** = regra dura (entra no QA de toda peça).
> Fonte dos valores: `ludus/src/app/tokens.css` (tema claro), lido em 2026-10-09. Se o app mudar, o app vence: atualizar o `brand.json`.

<!-- kit-de-marca:inicio (gerado pelo app; edite em Contexto e marca → Marca) -->
## Kit de marca (estilo, ícones e anotações)

**Ícones:** só **Lucide** (lucide.dev, licença ISC), sem misturar bibliotecas. Traço `1.75` (`--icon-stroke`), estilo linha, cor `--accent` (`--icon-color`). SVG pronto: `node tools/icon.mjs <nome> --brand <slug>`.

**Anotações:**
Neutros quentes (Stone) com o ouro como único destaque. O ouro é preenchimento (botão, marca, realce), nunca texto.
<!-- kit-de-marca:fim -->

## Essência visual
Simples, muito bem feito: acabamento de referência Apple, neutros quentes e calmos, um único ouro que marca a ação. A peça parece o próprio app.

## Cores
| token | hex | papel / significado |
|---|---|---|
| --primary | #F6BF51 | ouro da marca: logo, botão principal, realce, série 1 de gráfico. **Nunca texto** |
| --on-primary | #1C1917 | texto sobre o ouro (10,4:1) |
| --accent | #825B0C | tinta da marca: texto e ícone dourado pequeno, link (5,7:1) |
| --accent-soft | #FFF6E4 | ouro claríssimo: fundo de item marcado, realce de palavra |
| --bg | #F9F8F7 | fundo da peça (fundo do app) |
| --surface | #FFFFFF | cartão, janela |
| --surface-2 | #F5F5F4 | poço: campos, fundos recuados |
| --text | #1C1917 | títulos e frases |
| --muted | #6C645F | legenda e rótulo pequeno de interface |
| --border | #E7E5E4 | borda de cartão e divisor |
| --success / --warning / --danger | #216D4E / #9A4A05 / #AE2322 | só dentro de interface (pago, aviso, exclusão) |

Ouro vivo para texto grande (≥ 24 px no app, título nas peças): ≈ `#BC7E0D` (`--tone-600` ≈ `#BC8603`), contraste 3:1. Escala tonal completa no `brand.css` (`--tone-50…950`).

## Texto
- Fonte: **Nunito Sans** (local, `fonts/`), a mesma do app.
- Cor de título e frase: `--text`, nunca cinza.
- Caixa alta: **nunca** (o dono recusou três vezes no app).
- Ênfase: por peso, ou fundo `--accent-soft` atrás da palavra. Em vídeo, a palavra-chave **não ganha cor**.
- Tamanhos mínimos em 1080 px: default (título 72 px, apoio 40 px).

## Fundo
Liso: `--bg` ou branco. Sem gradiente colorido, sem fundo escuro como padrão.

## Formas
App: raio base 10 px (cartão ~14 px, painel ~21 px). Nas peças em 1080 px, `--radius` 20 px e `--radius-sm` 12 px. Sombras suaves de `brand.css`; borda 1 px `--border`.

## Logo
Arquivos em `logo/` (copiados de `ludus/public/logos`):
- `logo-simbolo-cor.svg` (ouro, já atualizado para `#F6BF51`), `logo-simbolo-preto.svg`, `logo-simbolo-branco.svg`: três quadrados, o terceiro a 55%.
- `logo-horizontal-cor.svg`: lockup "Ludus OS". ⚠️ Pede a fonte Geist sem embutir: renderiza diferente em cada máquina. Usar o PNG ou montar o lockup com o símbolo + "Ludus" em Nunito Sans.
- `logo-horizontal-cor.png`, `logo-horizontal-branco.png`, `logo-app-1024.png`: ⚠️ ainda no ouro antigo (`#F2A61C`), a conferir.

## Imagem, ícones e ilustração
Ícones Lucide em linha, cor `--accent`. Prints do próprio app (`screenshots/`) valem mais que ilustração. Persona de demonstração: Gaby, professora de espanhol (escola `uniespanhol`).

## Movimento (opcional)
Animação do app vem de catálogo e respeita "Reduzir Movimento": nas peças, movimento contido, sem duração inventada fora do default das skills.

## Som (identidade sonora)
(vazio = default das skills: minimalista premium)

## Vídeo
Regras do dono para vídeo de marca: plano aprovado antes de gerar; fundo liso; palavra-chave sem cor; silêncio de no máximo 0,5 s. Vídeos de lançamento já existem no repositório do Ludus (`videos/002-lancamento-v2/`). Sem endereço no fim enquanto o domínio não for definido.

## Proibições
- Ouro (`--primary`) como cor de texto ou ícone pequeno sobre fundo claro (1,6:1).
- Caixa alta em título, rótulo ou texto.
- Vermelho fora de exclusão/erro.
- Cor da escola ou do professor no lugar da identidade do Ludus.
- Coral (marca antiga) e o ouro `#F2A61C` (substituído em 2026-09-30).

## Aprendizados
Feedback do dono, peça a peça (data · peça · o que mudar). Vira regra acima quando se repetir.
