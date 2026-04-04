# Templates HTML por Tipo de Slide

> Templates de referência para cada tipo de slide. Os tokens CSS (`--brand`, `--fg-primary`, etc.)
> são preenchidos com os valores do VISUAL_IDENTITY.md antes de gerar os slides.
> Todos os `[PLACEHOLDERS]` devem ser substituídos por conteúdo real antes da entrega.

---

## Estrutura Base Comum

Todo slide compartilha esta estrutura HTML base. Copiar e adaptar para cada tipo.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('[GOOGLE_FONTS_URL]');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    /* Tokens do VISUAL_IDENTITY.md — substituir com valores reais */
    --bg-deep: [COR_FUNDO_PROFUNDO];
    --fg-primary: [COR_TEXTO_PRINCIPAL];
    --fg-secondary: [COR_TEXTO_SECUNDARIO];
    --fg-muted: [COR_TEXTO_MUTED];
    --brand: [COR_BRAND_PRINCIPAL];
    --brand-accent: [COR_BRAND_ACENTO];
    --brand-10: rgba([R],[G],[B], 0.10);
    --brand-40: rgba([R],[G],[B], 0.40);
    --border-subtle: rgba(255,255,255,0.06);
    --border-default: rgba(255,255,255,0.12);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-full: 9999px;
  }

  .slide {
    width: 1080px;       /* ou 1080px para square */
    height: 1350px;      /* ou 1080px para square */
    position: relative;
    overflow: hidden;
    font-family: '[FONTE_PRINCIPAL]', sans-serif;
    background: var(--bg-deep);
    color: var(--fg-primary);
  }

  /* Camada 1: Mesh Background */
  .mesh {
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse 600px 500px at 15% 20%, var(--brand-10) 0%, transparent 70%),
      radial-gradient(ellipse 500px 600px at 80% 45%, var(--brand-10) 0%, transparent 70%);
  }

  /* Camada 2: Content */
  .content {
    position: relative;
    z-index: 2;
    padding: 100px 80px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Camada 4: Footer */
  .footer {
    position: absolute;
    bottom: 40px;
    left: 80px;
    right: 80px;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .gradient-text {
    background: linear-gradient(135deg, var(--fg-primary) 0%, var(--brand) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gradient-brand {
    background: linear-gradient(135deg, var(--brand) 0%, var(--brand-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
</head>
<body>
<div class="slide">
  <div class="mesh"></div>
  <div class="content">
    <!-- Conteúdo do slide aqui -->
  </div>
  <div class="footer">
    <!-- Progress dots + watermark -->
    <div style="display: flex; gap: 8px;">
      <!-- Substituir por N dots, onde o dot ativo = --brand e os inativos = --border-default -->
      <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--brand);"></span>
      <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--border-default);"></span>
    </div>
    <span style="font-size: 14px; color: var(--fg-muted); font-weight: 500;">@[handle]</span>
  </div>
</div>
</body>
</html>
```

---

## Tipo: Cover (Capa)

Sempre o primeiro slide. Mesh mais intenso (4 blobs, opacidade 4–5%). Título em hero gradient. Badge no topo.

```html
<!-- Mesh mais intenso na capa -->
<div class="mesh" style="background:
  radial-gradient(ellipse 700px 600px at 10% 15%, var(--brand-10) 0%, transparent 70%),
  radial-gradient(ellipse 600px 700px at 85% 50%, var(--brand-10) 0%, transparent 70%),
  radial-gradient(ellipse 500px 400px at 20% 80%, var(--brand-10) 0%, transparent 70%),
  radial-gradient(ellipse 400px 500px at 70% 10%, var(--brand-10) 0%, transparent 70%);
"></div>

<div class="content" style="justify-content: center; gap: 28px;">
  <!-- Badge/tag -->
  <span style="
    display: inline-block;
    padding: 8px 20px;
    background: var(--brand-10);
    border: 1px solid var(--brand-40);
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 600;
    color: var(--brand);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    width: fit-content;
  ">[CATEGORIA OU TEMA]</span>

  <!-- Título hero -->
  <h1 class="gradient-text" style="
    font-size: 56px;
    font-weight: 800;
    line-height: 1.1;
    max-width: 90%;
  ">[TÍTULO DO CARROSSEL — 5 A 8 PALAVRAS]</h1>

  <!-- Subtítulo -->
  <p style="
    font-size: 22px;
    color: var(--fg-secondary);
    line-height: 1.5;
    max-width: 80%;
  ">[Subtítulo explicativo em 1–2 linhas]</p>

  <!-- Accent dot decorativo -->
  <span style="
    position: absolute; top: 60px; right: 60px;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--brand); opacity: 0.4;
  "></span>
</div>
```

---

## Tipo: Content (Ponto Numerado)

Slide padrão para pontos de argumento. Número em gradient brand, título bold, corpo em secondary.

```html
<div class="content" style="gap: 32px;">
  <!-- Número gradient -->
  <span class="gradient-brand" style="
    font-size: 80px;
    font-weight: 800;
    line-height: 1;
  ">01</span>

  <!-- Título do ponto -->
  <h2 style="
    font-size: 38px;
    font-weight: 700;
    color: var(--fg-primary);
    line-height: 1.2;
  ">[Título do ponto — 4 a 6 palavras]</h2>

  <!-- Corpo -->
  <p style="
    font-size: 22px;
    color: var(--fg-secondary);
    line-height: 1.6;
  ">[Explicação em 2–3 frases curtas. Máximo 60 palavras.]</p>

  <!-- Linha de destaque (opcional) -->
  <div style="
    margin-top: 8px;
    padding: 20px 24px;
    background: var(--brand-10);
    border-left: 3px solid var(--brand);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    font-size: 20px;
    color: var(--fg-secondary);
  ">[Dado ou insight de reforço opcional]</div>
</div>
```

---

## Tipo: Content-Icon (Ponto com Ícone)

Variante do Content quando um ícone é mais adequado que um número. Útil para checklists conceituais ou pontos sem ordem obrigatória.

```html
<div class="content" style="gap: 32px;">
  <!-- Ícone em card glass -->
  <div style="
    width: 72px; height: 72px;
    background: var(--brand-10);
    border: 1px solid var(--brand-40);
    border-radius: var(--radius-lg);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
  ">[EMOJI_OU_ÍCONE]</div>

  <!-- Título -->
  <h2 style="
    font-size: 38px;
    font-weight: 700;
    color: var(--fg-primary);
    line-height: 1.2;
  ">[Título do ponto]</h2>

  <!-- Corpo -->
  <p style="
    font-size: 22px;
    color: var(--fg-secondary);
    line-height: 1.6;
  ">[Explicação em 2–3 frases. Máximo 60 palavras.]</p>
</div>
```

---

## Tipo: List (Itens Enumeráveis)

Para listas de 3–6 itens. Máximo 6 itens por slide — se tiver mais, dividir em dois slides.

```html
<div class="content" style="gap: 28px;">
  <!-- Título da lista (opcional se for continuação) -->
  <h2 style="
    font-size: 32px;
    font-weight: 700;
    color: var(--fg-primary);
    line-height: 1.2;
    margin-bottom: 8px;
  ">[Título da lista]</h2>

  <!-- Item — repetir para cada bullet -->
  <div style="display: flex; gap: 16px; align-items: flex-start;">
    <span style="
      width: 32px; height: 32px; flex-shrink: 0;
      background: var(--brand-10);
      border: 1px solid var(--brand-40);
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      color: var(--brand);
      font-size: 14px;
      font-weight: 700;
    ">✓</span>
    <p style="
      font-size: 22px;
      color: var(--fg-secondary);
      line-height: 1.5;
      padding-top: 4px;
    ">[Texto do item — máximo 15 palavras]</p>
  </div>

  <!-- Repetir o bloco div acima para cada item -->
</div>
```

**Variação com número:** substituir `✓` pelo número do item (`1`, `2`, `3`...) e usar `font-size: 16px; font-weight: 800; color: var(--brand)`.

---

## Tipo: Stat (Destaque Numérico)

Para dados, percentuais ou números impactantes. Número gigante centralizado em card glass.

```html
<div class="content" style="justify-content: center; align-items: center; text-align: center; gap: 0;">
  <!-- Card glass -->
  <div style="
    padding: 60px 80px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  ">
    <!-- Número gigante -->
    <span class="gradient-brand" style="
      font-size: 96px;
      font-weight: 800;
      display: block;
      line-height: 1;
    ">[X%]</span>

    <!-- Label descritivo -->
    <p style="
      font-size: 26px;
      color: var(--fg-secondary);
      line-height: 1.4;
      max-width: 500px;
    ">[descrição do que o número significa — 1–2 linhas]</p>

    <!-- Fonte (opcional) -->
    <span style="
      font-size: 15px;
      color: var(--fg-muted);
      margin-top: 8px;
    ">Fonte: [origem do dado]</span>
  </div>
</div>
```

---

## Tipo: Quote (Citação)

Para frases de impacto ou citações de especialistas.

```html
<div class="content" style="justify-content: center; gap: 24px;">
  <!-- Aspas decorativas -->
  <span style="
    font-size: 120px;
    color: var(--brand-40);
    line-height: 0.6;
    font-family: Georgia, serif;
  ">"</span>

  <!-- Citação -->
  <blockquote style="
    font-size: 32px;
    font-weight: 500;
    color: var(--fg-primary);
    line-height: 1.4;
    font-style: italic;
    padding-left: 24px;
    border-left: 3px solid var(--brand);
    max-width: 90%;
  ">[Texto da citação — máximo 30 palavras]</blockquote>

  <!-- Atribuição -->
  <p style="
    font-size: 18px;
    color: var(--fg-muted);
    padding-left: 24px;
  ">— [Autor], [Contexto ou obra]</p>
</div>
```

---

## Tipo: Comparison (Comparativo)

Para antes/depois ou opção A vs. opção B. Duas colunas com separador visual.

```html
<div class="content" style="gap: 28px;">
  <!-- Título do comparativo -->
  <h2 style="
    font-size: 34px;
    font-weight: 700;
    color: var(--fg-primary);
    text-align: center;
  ">[Título do comparativo]</h2>

  <!-- Duas colunas -->
  <div style="
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    flex: 1;
  ">
    <!-- Coluna A (negativa / "antes") -->
    <div style="
      padding: 28px 24px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      display: flex; flex-direction: column; gap: 16px;
    ">
      <span style="
        font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
        text-transform: uppercase; color: var(--fg-muted);
      ">[LABEL A — ex: ANTES / SEM PROCESSO]</span>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px;">
        <li style="font-size: 18px; color: var(--fg-secondary); display: flex; gap: 10px;">
          <span style="color: #ef4444;">✗</span> [Item negativo]
        </li>
        <li style="font-size: 18px; color: var(--fg-secondary); display: flex; gap: 10px;">
          <span style="color: #ef4444;">✗</span> [Item negativo]
        </li>
        <li style="font-size: 18px; color: var(--fg-secondary); display: flex; gap: 10px;">
          <span style="color: #ef4444;">✗</span> [Item negativo]
        </li>
      </ul>
    </div>

    <!-- Coluna B (positiva / "depois") -->
    <div style="
      padding: 28px 24px;
      background: var(--brand-10);
      border: 1px solid var(--brand-40);
      border-radius: var(--radius-lg);
      display: flex; flex-direction: column; gap: 16px;
    ">
      <span style="
        font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
        text-transform: uppercase; color: var(--brand);
      ">[LABEL B — ex: DEPOIS / COM PROCESSO]</span>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px;">
        <li style="font-size: 18px; color: var(--fg-secondary); display: flex; gap: 10px;">
          <span style="color: var(--brand);">✓</span> [Item positivo]
        </li>
        <li style="font-size: 18px; color: var(--fg-secondary); display: flex; gap: 10px;">
          <span style="color: var(--brand);">✓</span> [Item positivo]
        </li>
        <li style="font-size: 18px; color: var(--fg-secondary); display: flex; gap: 10px;">
          <span style="color: var(--brand);">✓</span> [Item positivo]
        </li>
      </ul>
    </div>
  </div>
</div>
```

---

## Tipo: CTA (Slide Final)

Slide de fechamento. Mesh mais intenso (similar ao Cover). CTA text gradient + botão visual + @handle.

```html
<!-- Mesh intenso como na capa -->
<div class="mesh" style="background:
  radial-gradient(ellipse 700px 600px at 10% 15%, var(--brand-10) 0%, transparent 70%),
  radial-gradient(ellipse 600px 700px at 85% 50%, var(--brand-10) 0%, transparent 70%),
  radial-gradient(ellipse 500px 400px at 50% 80%, var(--brand-10) 0%, transparent 70%);
"></div>

<div class="content" style="justify-content: center; align-items: center; text-align: center; gap: 32px;">
  <!-- CTA principal -->
  <h2 class="gradient-text" style="
    font-size: 44px;
    font-weight: 800;
    line-height: 1.2;
    max-width: 80%;
  ">[Chamada para ação — 5 a 8 palavras]</h2>

  <!-- Texto de apoio -->
  <p style="
    font-size: 22px;
    color: var(--fg-secondary);
    max-width: 70%;
    line-height: 1.5;
  ">[Texto de apoio — 1 frase]</p>

  <!-- Botão visual -->
  <div style="
    padding: 18px 52px;
    background: var(--brand);
    border-radius: var(--radius-full);
    color: white;
    font-size: 20px;
    font-weight: 700;
    box-shadow: 0 0 30px rgba([R],[G],[B], 0.3);
  ">[Texto do botão — 2 a 4 palavras]</div>

  <!-- Handle -->
  <p style="font-size: 18px; color: var(--fg-muted); margin-top: 8px;">
    @[handle]
  </p>
</div>
```

---

## Footer com Progress Dots

Incluir em todos os slides. Atualizar o dot ativo para cada slide (posição muda slide a slide).

```html
<div class="footer">
  <!-- Progress dots — N dots onde N = total de slides -->
  <div style="display: flex; gap: 8px; align-items: center;">
    <span style="width: 24px; height: 8px; border-radius: var(--radius-full); background: var(--brand);"></span>
    <!-- Dot ativo tem largura maior (24px) em vez de circular (8×8) -->
    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--border-default);"></span>
    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--border-default);"></span>
    <!-- Repetir para cada slide inativo -->
  </div>

  <!-- Watermark -->
  <span style="
    font-size: 14px;
    color: var(--fg-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
  ">@[handle]</span>
</div>
```

**Nota:** o dot ativo pode ser um retângulo arredondado (24×8px) em vez de círculo para distinguir claramente a posição atual. Os dots inativos permanecem circulares (8×8px).
