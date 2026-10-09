---
name: fmt-post-frase
description: "Receita de post estático com UMA frase forte (insight, verdade incômoda, identificação) na identidade da marca. Usa a skill carousel como motor (1 slide) e a ig-post para frase e legenda quando faltar texto. Use quando o usuário pedir 'post frase', 'frase de impacto', 'post de insight', 'post tipográfico', 'post só com texto', 'quote' ou 'fmt-post-frase'."
---

# Post frase

Uma imagem, uma frase que a persona manda para uma colega ("é exatamente isso"). Topo de funil: envio por DM e salvamento. Texto pela `ig-post`, arte pela `carousel` (1 slide); aqui só o próprio do formato.

## Especialista
Você é redator e diretor de arte de post tipográfico: a frase é a peça inteira.
- **Repertório:** concreto vence abstrato ("confirmar sessão às 23h" > "falta de organização"); quebra de linha por sentido; tipografia grande como imagem.
- **Bom é:** lida em 2 s no feed, sem legenda · 1 ideia · 1 ênfase, na palavra que carrega o sentido.
- **Não faz:** frase de coach que serve a qualquer perfil; diminuir a fonte para caber (corta palavras); apoio que repete a frase; logo grande competindo; citação inventada.

## Contexto
- `library/formatos/post-frase/formato.json` · sempre — quando usar, quando não usar e observações do Oliver (vencem esta receita)
- `.claude/skills/fmt-post-frase/references/layout.html` · quando: diagramar — classes dos layouts
- `context/CONTENT_STRATEGY.md#Datas` · quando: data comemorativa — datas e cuidados

## Entradas e saídas
- **Entrega:** roteirista → `roteiro.md` (frase, apoio, tag, legenda) pela `ig-post`; designer → `carrossel.html` + `png/slide-01.png` pela `carousel`.
- **Salva em:** `companies/<slug>/contents/AAAA-MM-DD-<tema>/`, com `formato: post-frase` no `peca.json`.

## Ordem de trabalho
1. Roteirista: a frase é o hook (passo de hooks da `ig-post`, recomende 1); legenda com 1ª linha que estende a frase e CTA de envio ("manda pra colega que…").
2. Designer: layout e fundo (Variações) → `carousel` → conferir em 100%.

## Regras duras
- Frase de 6–15 palavras, 2–5 linhas, sem palavra órfã; apoio opcional ≤ 15 palavras.
- Frase ≥ 96 px; até 8 palavras, 120–140 px.
- 1 ênfase `.hl` em `--accent`; sem sublinhado, caixa alta ou segunda cor.
- `citacao`: só autor real com fonte verificável ou frase do founder.
- Foto só de `brand/photos/`, frase sempre sobre área lisa.
- Rodapé só com `@handle`, sem "arraste →".

## Checklist antes de entregar
- A frase tem 6–15 palavras, na voz da persona, e se lê em 2 s?
- Há 1 ênfase só, na palavra que carrega o sentido?
- Frase ≥ 96 px, sem órfã, dentro da margem de 80 px?
- Citação tem autor real (ou não há citação)?
- Rodapé sem seta e legenda com CTA de envio?

## Estrutura e variações
Topo: `.tag` opcional (1–3 palavras) · centro: frase (`.pf-frase`) · abaixo: `.sub` ou "— autor", opcional · rodapé: `@handle`.
Layouts: `esquerda` (padrão, frase gigante ancorada embaixo à esquerda) · `centro` (frase curta) · `citacao` (`.quote` do template). Fundo `--bg` ou `.inverse`; foto da marca em faixa (`.slide.photo`); 1080×1350 ou 1080×1080.

## Exemplo (kz)
`esquerda`, fundo `--bg`, tag `rotina`: "Você não está cansada de atender. Está cansada de **gerenciar**."
Legenda: "Atender cabe no seu dia. Confirmar, cobrar, achar o link e anotar em 3 lugares é que não cabe. Manda pra colega que fecha a agenda às 23h 🤍"
