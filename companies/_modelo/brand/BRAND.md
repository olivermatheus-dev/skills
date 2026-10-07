# Marca — <empresa>

> Regras de uso da identidade. Os **tokens** (valores) ficam em `brand.css`; aqui fica **como usar**.
> Precedência: o que está aqui vence o default das skills. Seção vazia = vale o default (`knowledge/video/frame.md`).
> Seção **Proibições** = regra dura (entra no QA de toda peça).

<!-- kit-de-marca:inicio (gerado pelo app; edite em Contexto e marca → Marca) -->
## Kit de marca (estilo, ícones e anotações)

**Ícones:** só **Lucide** (lucide.dev, licença ISC), sem misturar bibliotecas. Traço `1.75` (`--icon-stroke`), estilo linha, cor `--primary` (`--icon-color`). SVG pronto: `node tools/icon.mjs <nome> --brand <slug>`.
<!-- kit-de-marca:fim -->

## Essência visual
1–2 frases: a sensação (ex.: "calma antes de impacto", "contido, premium, confiante").

## Cores
| token | hex | papel / significado |
|---|---|---|
| --primary | | |

## Texto
- Cor de título e frase: (default: `--text`, nunca cinza)
- Caixa alta: (default: não)
- Ênfase: (default: 1 por título, em `--primary`)
- Tamanhos mínimos em 1080 px: (default: título 72 px, apoio 40 px)

## Fundo
(default: liso `--bg` ou branco; sem gradiente colorido)

## Formas
Raio, bordas, sombras (níveis de `brand.css`), espaçamento.

## Logo
Arquivos em `logo/` (`logo-horizontal-cor.svg`, `logo-simbolo-cor.svg`, `logo-*-branco.svg`). Área de proteção, tamanho mínimo, onde usar.

## Imagem, ícones e ilustração
Estilo de foto, biblioteca de ícones, ilustração.

## Movimento (opcional)
Só ajustes sobre o default das skills (ex.: "mais calmo", estilo do cursor).

## Som (identidade sonora)
Eixos (marque um lado ou o meio): orgânico ↔ digital · suave ↔ agressivo · minimalista ↔ maximalista · elegante ↔ playful · cinematográfico ↔ natural · quente ↔ tecnológico.
Famílias preferidas da biblioteca (`library/audio/sfx.json`): …  Trilhas da marca (`music.json`, `brand: <slug>`): …  BPM típico: …
(vazio = default das skills: minimalista premium)

## Vídeo
Formatos padrão, voz (serviço + nome), trilha (sintetizada/licenciada), elenco fictício para dados de demonstração.

## Proibições
-

## Aprendizados
Feedback do dono, peça a peça (data · peça · o que mudar). Vira regra acima quando se repetir.
