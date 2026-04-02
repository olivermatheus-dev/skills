# Templates HTML por Tipo de Slide

## Estrutura Base Comum

Todo slide compartilha esta estrutura HTML base. Os tokens CSS vêm do VISUAL_IDENTITY.md.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('GOOGLE_FONTS_URL');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .slide {
    width: WIDTH;  /* 1080px */
    height: HEIGHT; /* 1350px ou 1080px */
    position: relative;
    overflow: hidden;
    font-family: FONT_STACK;
    background: var(--bg-deep);
    color: var(--fg-primary);
  }

  /* Camada 1: Mesh Background */
  .mesh {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .mesh .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
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

  /* Camada 4: Footer/Branding */
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
</style>
</head>
<body>
<div class="slide">
  <div class="mesh">
    <!-- Blobs posicionados -->
  </div>
  <div class="content">
    <!-- Conteúdo do slide -->
  </div>
  <div class="footer">
    <!-- Progress dots + watermark -->
  </div>
</div>
</body>
</html>
```

---

## Tipo: Cover (Capa)

Sempre o primeiro slide. Mesh mais intenso, título grande, badge no topo.

```html
<div class="content" style="justify-content: center; gap: 24px;">
  <!-- Badge/tag -->
  <span style="
    display: inline-block;
    padding: 8px 20px;
    background: var(--brand-10);
    border: 1px solid var(--brand-40);
    border-radius: var(--radius-full);
    font-size: 14px;
    font-weight: 600;
    color: var(--brand);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    width: fit-content;
  ">[CATEGORIA]</span>

  <!-- Título hero -->
  <h1 style="
    font-size: 56px;
    font-weight: 700;
    line-height: 1.1;
    background: linear-gradient(135deg, var(--fg-primary), var(--brand));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  ">[TÍTULO DO CARROSSEL]</h1>

  <!-- Subtítulo -->
  <p style="
    font-size: 22px;
    color: var(--fg-secondary);
    line-height: 1.5;
    max-width: 80%;
  ">[Subtítulo explicativo]</p>
</div>
```

**Mesh mais intenso na capa:** Usar 3-4 blobs com opacidade 4-5% (vs. 2-3% nos demais slides).

---

## Tipo: Content (Conteúdo)

Slide padrão com número/ícone, título e corpo.

```html
<div class="content" style="gap: 32px;">
  <!-- Número com gradient -->
  <span style="
    font-size: 80px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--brand), var(--brand-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
  ">[01]</span>

  <!-- Título do ponto -->
  <h2 style="
    font-size: 36px;
    font-weight: 700;
    color: var(--fg-primary);
    line-height: 1.2;
  ">[Título do ponto]</h2>

  <!-- Corpo -->
  <p style="
    font-size: 22px;
    color: var(--fg-secondary);
    line-height: 1.6;
  ">[Explicação em 2-3 frases curtas]</p>
</div>
```

---

## Tipo: Stat (Destaque Numérico)

Para números impactantes.

```html
<div class="content" style="justify-content: center; align-items: center; text-align: center; gap: 16px;">
  <!-- Card com glassmorphism -->
  <div style="
    padding: 60px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(12px);
  ">
    <!-- Número gigante -->
    <span style="
      font-size: 96px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--brand), var(--brand-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    ">[78%]</span>

    <!-- Label -->
    <p style="
      font-size: 24px;
      color: var(--fg-secondary);
      margin-top: 16px;
    ">[dos leads são perdidos por falta de follow-up]</p>
  </div>
</div>
```

---

## Tipo: List/Bullets

Para itens enumeráveis.

```html
<div class="content" style="gap: 28px;">
  <h2 style="font-size: 32px; font-weight: 700;">[Título da lista]</h2>

  <!-- Item -->
  <div style="display: flex; gap: 16px; align-items: flex-start;">
    <span style="
      width: 28px; height: 28px;
      background: var(--brand-10);
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      color: var(--brand);
      font-size: 14px;
      font-weight: 700;
    ">✓</span>
    <p style="font-size: 22px; color: var(--fg-secondary); line-height: 1.5;">
      [Texto do item]
    </p>
  </div>

  <!-- Repetir para cada item, com gap de 20-24px entre eles -->
</div>
```

---

## Tipo: Quote (Citação)

```html
<div class="content" style="justify-content: center; gap: 24px;">
  <!-- Aspas decorativas -->
  <span style="font-size: 120px; color: var(--brand-40); line-height: 0.5;">"</span>

  <!-- Citação -->
  <blockquote style="
    font-size: 32px;
    font-weight: 500;
    color: var(--fg-primary);
    line-height: 1.4;
    font-style: italic;
    padding-left: 20px;
    border-left: 3px solid var(--brand);
  ">[Texto da citação]</blockquote>

  <!-- Atribuição -->
  <p style="font-size: 18px; color: var(--fg-muted);">
    — [Autor], [Contexto]
  </p>
</div>
```

---

## Tipo: CTA (Slide Final)

```html
<div class="content" style="justify-content: center; align-items: center; text-align: center; gap: 32px;">
  <h2 style="
    font-size: 40px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--fg-primary), var(--brand));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  ">[Chamada para ação]</h2>

  <p style="font-size: 22px; color: var(--fg-secondary);">
    [Texto de apoio]
  </p>

  <!-- Botão visual -->
  <div style="
    padding: 16px 48px;
    background: var(--brand);
    border-radius: var(--radius-full);
    color: white;
    font-size: 20px;
    font-weight: 600;
  ">[Texto do botão]</div>

  <!-- Handle -->
  <p style="font-size: 18px; color: var(--fg-muted); margin-top: 16px;">
    @[handle]
  </p>
</div>
```

---

## Footer com Progress Dots

Incluir em todos os slides:

```html
<div class="footer">
  <!-- Progress dots -->
  <div style="display: flex; gap: 8px;">
    <!-- Dot ativo -->
    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--brand);"></span>
    <!-- Dots inativos -->
    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--border-default);"></span>
    <!-- ... repetir conforme total de slides -->
  </div>

  <!-- Watermark -->
  <span style="font-size: 14px; color: var(--fg-muted); font-weight: 500;">
    @[handle]
  </span>
</div>
```
