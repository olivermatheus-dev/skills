---
name: fmt-post-frase
description: "Receita de post estático com UMA frase forte (insight, verdade incômoda, identificação) na identidade da marca. Usa a skill carousel como motor (1 slide) e a ig-post para frase e legenda quando faltar texto. Use quando o usuário pedir 'post frase', 'frase de impacto', 'post de insight', 'post tipográfico', 'post só com texto', 'quote' ou 'fmt-post-frase'."
---

# Post frase

Uma imagem, uma frase que a persona manda para uma colega ("é exatamente isso"). Topo de funil: alcance, envio por DM, salvamento. Motor: `carousel` com 1 slide.

## Quando usar / quando não usar
- **Usar:** espelho de dor, crença a quebrar, verdade do ofício, data comemorativa sem venda, semana corrida.
- **Não usar:** ideia que precisa de passos (→ `fmt-carrossel-educativo`); oferta ou preço (→ `ads-meta`).

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| layout | `esquerda` | `esquerda` · `centro` · `citacao` |
| formato | 1080×1350 | 1080×1080 |
| apoio | sem | 1 linha ≤ 15 palavras |
| fundo | `--bg` | `.inverse` |
| foto | sem | foto da marca em faixa (`.slide.photo`) |

## Estrutura (layout)
| zona | conteúdo | regra |
|---|---|---|
| topo | `.tag` opcional | tema em 1–3 palavras |
| centro | frase (`.pf-frase`) | 6–15 palavras, 2–5 linhas, 1 ênfase `.hl` |
| abaixo | `.sub` ou "— autor" | opcional |
| rodapé | `@handle` | sem "arraste →" |

Classes em `references/layout.html`: `esquerda` = frase gigante ancorada embaixo à esquerda; `centro` = frase curta centralizada; `citacao` = `.quote` do template.

## Regras do formato
- **Funciona sem legenda**, lida em 2 s no feed.
- Linguagem literal da persona (`AUDIENCE.md`), nunca frase de coach. Concreto > abstrato: "confirmar sessão às 23h" > "falta de organização".
- Frase ≥ 96px; até 8 palavras, 120–140px. Quebre linhas à mão por sentido, sem palavra órfã.
- 1 palavra de ênfase em `--accent`. Sem sublinhado, caixa alta ou segunda cor.
- `citacao`: só autor real com fonte verificável ou frase do founder. Nunca invente citação.
- Foto só da marca (`brand/photos/`); frase sempre sobre área lisa.
- Legenda (`ig-post`): 1ª linha estende a frase; CTA de envio ("manda pra colega que…").

## Erros comuns
- Frase de autoajuda que serve para qualquer perfil.
- Duas ideias na mesma frase.
- Diminuir a fonte para caber: corte palavras.
- Apoio que repete a frase.
- Logo grande competindo com a frase.

## Exemplo (kz)
Layout `esquerda`, fundo `--bg`, tag `rotina`:
"Você não está cansada de atender. Está cansada de **gerenciar**."

Legenda: "Atender cabe no seu dia. Confirmar, cobrar, achar o link e anotar em 3 lugares é que não cabe. Manda pra colega que fecha a agenda às 23h 🤍"

## Checklist do formato
- [ ] 6–15 palavras, lida em 2 s, na voz da persona?
- [ ] 1 ênfase em `--accent`, na palavra que carrega o sentido?
- [ ] Frase ≥ 96px, sem órfã, dentro da margem de 80px?
- [ ] Citação com autor real (ou nenhuma)?
- [ ] Rodapé sem seta; legenda com CTA de envio?
