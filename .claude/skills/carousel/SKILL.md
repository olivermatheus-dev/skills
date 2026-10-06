---
name: carousel
description: "Diagrama e exporta carrosséis do Instagram: gera UM carrossel.html com todos os slides na identidade visual da empresa e renderiza um PNG por slide. Use quando o usuário pedir carrossel, carousel, slides do Instagram, arte para feed, gerar imagens do carrossel, exportar PNG, ou quiser transformar um roteiro.md (da skill ig-post) ou texto colado em imagens prontas para postar."
---

# Carousel

Transforma texto pronto (roteiro ou texto colado) em slides visuais. Não reescreve o conteúdo, só corta e ajusta o que for necessário para caber.

## Entradas

- `companies/<slug>/context/VISUAL.md` traz o bloco `:root` com `--bg --surface --text --muted --primary --accent --font-heading --font-body --radius`, além das cores e fontes. **Se não existir, pare** e sugira criar antes. Só use o tema padrão do template se o usuário pedir um carrossel genérico.
- `companies/<slug>/context/VOICE.md`: tom para os textos curtos (tag, CTA, rodapé).
- `companies/<slug>/contents/AAAA-MM-DD-<tema>/roteiro.md`, com o texto slide a slide escrito pela skill ig-post, **ou** texto colado no chat.
- Fotos ficam em `companies/<slug>/assets/`.

## Processo

1. **Ler** VISUAL.md, VOICE.md e o roteiro. Se faltar a empresa ou a peça, pergunte.
2. **Propor o outline** em **uma única tabela** e esperar o "ok":

   | # | tipo | texto |
   |---|---|---|
   | 1 | capa | ... |

   Pergunte o formato só se não estiver claro. O padrão é retrato 1080×1350; use 1080×1080 se o usuário pedir.
3. **Gerar UM arquivo** `contents/<peça>/carrossel.html` partindo de `references/template.html`:
   - cole o `:root` do VISUAL.md por cima dos tokens padrão e troque o `<link>` do Google Fonts pelas fontes da marca;
   - cada slide é uma `<section class="slide">`. Para quadrado, use `<body class="square">`;
   - apague do template os tipos que não forem usados. Não invente classes novas sem necessidade.
4. **Renderizar:**
   ```bash
   node .claude/skills/carousel/scripts/render.mjs companies/<slug>/contents/<peça>/carrossel.html
   # ou: npm run carousel -- <caminho/carrossel.html> [pasta-saida]
   ```
   Se der erro de Playwright, rode `npm i` (ou `npm i -D playwright`) e, se pedir, `npx playwright install chromium`.
5. **Conferir**: abra 1 ou 2 PNGs, procure texto cortado, contraste ruim ou foto quebrada, corrija o HTML e renderize de novo.
6. **Entregar** a lista dos arquivos e um resumo de uma linha por slide.

## Saída

```
companies/<slug>/contents/AAAA-MM-DD-<tema>/
├── roteiro.md
├── carrossel.html      ← abre no navegador com todos os slides empilhados para revisão
└── png/slide-01.png, slide-02.png, ...
```

## Tipos de slide (classes do template)

- **capa**: tag + título forte + subtítulo. Sempre o primeiro, com "arraste →".
- **texto**: um título curto + 1 ou 2 frases de apoio.
- **lista**: 3 a 5 itens numerados (`ul.list`).
- **dado/stat**: número gigante (`.big`) + o que ele significa + fonte.
- **citação**: frase de impacto (`.quote`) + autor. Fica bem com `.inverse`.
- **comparação**: duas colunas Antes × Depois ou A × B (`.compare`, destaque em `.yes`).
- **foto+texto**: foto no topo (`.photo-box`) e texto embaixo (`section.slide.photo`).
- **CTA**: pedido de ação único + botão visual (`.btn`). Sempre o último.

`.inverse` (fundo `--primary`) serve para criar ritmo. Use em no máximo 1 de cada 3 slides.

## Regras de design

- **1 ideia por slide**, com no máximo ~30 palavras. Se passar disso, divida em dois slides.
- **Fonte mínima**: 36px no corpo e 72px no título. Rodapé e fonte de dados podem ter 28px.
- **Contraste**: texto sobre fundo precisa ser legível no celular. `--accent` e `--primary` são para destaque, não para parágrafo.
- **Margem segura de 80px** em todos os lados. Nada importante fica no rodapé além da marca e da numeração.
- **Rodapé** em todo slide com `@handle`/marca à esquerda e `NN/TT →` à direita. A capa leva "arraste →" e o último slide não leva seta.
- **Estilo vem do VISUAL.md**: fundo claro ou escuro conforme `--bg`. Nada de glassmorphism, glow ou mesh se a marca não pedir.
- Mesma fonte, mesmos tokens e mesma posição de rodapé em todos os slides.
- Nada de placeholder (`[TEXTO]`, `@suamarca`) no arquivo final.

## Foto

```html
<section class="slide photo">
  <div class="photo-box"><img src="../../assets/equipe.jpg" alt=""></div>
  <h2>Título</h2><p>Texto curto.</p>
  <div class="footer">...</div>
</section>
```

- O caminho é relativo ao `carrossel.html`: `contents/<peça>/` → `../../assets/<arquivo>`.
- Se a foto ainda não existe, mantenha o `onerror="this.remove()"` do template, que deixa aparecer o gradiente da marca, e avise o usuário qual arquivo falta.
- Use `object-fit: cover`, que já está no template. Para foto de fundo inteiro, troque `inset` para `0` e coloque o texto sobre uma faixa `--surface`.

## Dimensões fora do padrão

Para Stories (1080×1920), ajuste apenas `--w`/`--h` no `:root`. O render captura cada `.slide` no tamanho exato.
