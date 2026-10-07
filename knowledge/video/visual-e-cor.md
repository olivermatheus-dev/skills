# Visual e cor — defaults da skill

> Base: regras do dono no guia de movimento do Ludus (2026-10-07), nascidas de feedback real sobre um vídeo ruim ("gradientes coloridos estranhos", "textos cinzas de um jeito muito ruim", "gradiente que aparece do nada"). Esses são os **erros típicos de vídeo gerado por IA**. Aqui viram **defaults genéricos**; a marca pode sobrescrever no `BRAND.md`.

## 1. Fundo
- **Default: liso.** Cor de fundo da marca (`--bg`) ou branco. Sem mancha, halo, "blob" nem gradiente colorido.
- **Não troque a cor de fundo de cena para cena** sem motivo narrativo (ex.: virada caos → calma pode mudar 1 vez).
- **Profundidade vem de escala, sombra suave e desfoque de foco**, não de cor no fundo.

## 2. Texto que o vídeo "fala" (títulos, frases)
- **Cor de tinta** (`--text`, alto contraste). **Nunca cinza** em título ou frase principal.
- Contraste mínimo **4,5:1** com o fundo (meta: ≥ 7:1 em título).
- **No máximo 1 ênfase por título**, com motivo (a palavra-chave). Ênfase na cor de destaque da marca ou por peso, **nunca em cores aleatórias**.

## 3. Hierarquia de cores (quem pode usar o quê)
| cor | onde pode | onde não pode |
|---|---|---|
| **destaque da marca** (`--primary`) | símbolo/logo, botão principal, ênfase única, fecho/CTA | fundo inteiro, enfeite |
| **cinza** (`--muted`) | rótulo pequeno **dentro da interface** (legenda de campo, hora) | texto narrativo, título |
| **cores de status** (verde, âmbar, vermelho…) | **dentro da interface, com significado** (pago, pendente, erro) | fundo, título, decoração |
| **brilho, degradê, glow** | só no elemento da marca, se o `BRAND.md` permitir | qualquer outro lugar |

Regra de bolso: **toda cor na tela precisa responder "o que ela significa?"** Se não houver resposta, tire.

## 4. Efeitos
- **Faísca, partícula, confete:** só como **resposta a um gesto** (o "pago" confirmado, o envio concluído), nunca como enfeite de fundo.
- Sombra: suave e consistente (1 direção de luz no vídeo todo). Níveis do `brand.css` (`--shadow-sm/md/lg`).

## 5. Tipografia
- Fontes da marca (`--font-heading`, `--font-body`). Default: 1 família, no máximo 2.
- Tamanho mínimo em 1080 px de largura: **título ≥ 64–72 px, texto de apoio ≥ 36–40 px**, rótulo de UI ampliado ≥ 28 px.
- **4:5 e 9:16 têm a mesma largura (1080):** use o **mesmo tamanho de título** nos dois. Aumentar no story quebra frases de 2 linhas em 3.
- Caixa alta, espaçamento de letras e pesos seguem o `BRAND.md`. Default: frases sem caixa alta.

## 6. Checklist visual
- [ ] Fundo liso (ou mudança única e motivada)?
- [ ] Nenhum título ou frase em cinza; contraste ≥ 4,5:1?
- [ ] No máximo 1 ênfase por título, na cor da marca?
- [ ] Toda cor tem significado?
- [ ] Partículas e brilho só como resposta a gesto ou na marca?
- [ ] Mesmo tamanho de título nos formatos de 1080 px de largura?
