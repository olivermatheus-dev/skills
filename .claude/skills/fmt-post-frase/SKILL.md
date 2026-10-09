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
- `.claude/skills/carousel/references/layouts/INDEX.md` · quando: diagramar — famílias de layout (`capa-tipografica`, `campo`, `citacao`)
- `context/CONTENT_STRATEGY.md#Datas` · quando: data comemorativa — datas e cuidados

## Entradas e saídas
- **Entrega:** roteirista → `roteiro.md` (frase, apoio, tag, legenda) pela `ig-post`; designer → plano de 1 slide (`plano-de-slides`) e `carrossel.html` + `png/slide-01.png` pela `carousel`.
- **Salva em:** `companies/<slug>/contents/<ID>-<tema>/`, com `formato: post-frase` no `peca.json`.

## Ordem de trabalho
1. Roteirista: a frase é o hook (passo de hooks da `ig-post`, recomende 1); legenda com 1ª linha que estende a frase e CTA de envio ("manda pra colega que…").
2. Designer: `plano-de-slides` (1 slide: família e fundo pelas Variações) → `carousel` → conferir em 100%.

## Regras duras
- Frase de 6–15 palavras, 2–5 linhas, sem palavra órfã; apoio opcional ≤ 15 palavras.
- Frase ≥ 96 px; até 8 palavras, 120–140 px.
- No máx. 1 ênfase (`enf-cor` ou `enf-serifa`), na palavra que carrega o sentido, ou nenhuma; sem sublinhado, caixa alta ou segunda cor.
- `citacao`: só autor real com fonte verificável ou frase do founder.
- Foto só de `brand/photos/`, frase sempre sobre área lisa.
- Rodapé só com a marca, sem "arraste".

## Checklist antes de entregar
- A frase tem 6–15 palavras, na voz da persona, e se lê em 2 s?
- No máximo 1 ênfase, na palavra que carrega o sentido?
- Frase ≥ 96 px, sem órfã, dentro da margem de 96 px (`check.mjs` sem ✗)?
- Citação tem autor real (ou não há citação)?
- Rodapé sem seta e legenda com CTA de envio?

## Estrutura e variações
Rótulo opcional (1–3 palavras) · frase · apoio ou autor, opcional · rodapé com a marca.
Famílias: `capa-tipografica` sem motivo (padrão: frase em display ancorada embaixo) · `campo` (frase em 2 tempos, fundo da escala, claro ou escuro 800–900) · `citacao` (autor real ou fundador). Fundo sólido da escala (creme, branco, tons); 1080×1350 ou 1080×1080.

## Exemplo (kz)
`capa-tipografica`, fundo creme, rótulo `rotina`: "Você não está cansada de atender. Está cansada de **gerenciar**."
Legenda: "Atender cabe no seu dia. Confirmar, cobrar, achar o link e anotar em 3 lugares é que não cabe. Manda pra colega que fecha a agenda às 23h 🤍"
