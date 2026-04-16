# Técnicas CSS Avançadas para Slides

> Referência de técnicas CSS usadas na geração de slides. Cada técnica inclui quando usar,
> código de referência e cuidados de compatibilidade.
> Os valores de cor devem vir do VISUAL_IDENTITY.md via tokens CSS (`:root` variables).

---

## 0. Tokens CSS — Como usar o VISUAL_IDENTITY

Antes de qualquer técnica, mapear os valores do VISUAL_IDENTITY.md para variáveis CSS no `:root` de cada slide. Isso garante que trocar a paleta ou fonte exige alterar apenas uma linha.

```css
:root {
  /* Cores */
  --bg-deep: [valor do VISUAL_IDENTITY — ex: #0a0a0f];
  --fg-primary: [ex: #f0f0f0];
  --fg-secondary: [ex: #a0a0b0];
  --fg-muted: [ex: #606070];
  --brand: [cor principal — ex: #6366f1];
  --brand-accent: [cor de acento — ex: #8b5cf6];

  /* Derivados da brand color (calcular com RGB separado) */
  --brand-10: rgba(99, 102, 241, 0.10);   /* brand com 10% opacidade */
  --brand-40: rgba(99, 102, 241, 0.40);   /* brand com 40% opacidade */

  /* Bordas */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.12);

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 9999px;
}
```

**Como extrair RGB de uma cor hex para usar em rgba():**
- `#6366f1` → R=99, G=102, B=241 → `rgba(99, 102, 241, 0.10)`
- Calcular sempre que uma técnica precisar de opacidade variável da brand color

---

## 1. Mesh Gradients (Background Multi-Ponto)

Mesh gradients criam fundos orgânicos usando radial-gradients empilhados. É a base visual de todo slide.

```css
.mesh {
  /* Blob 1 — canto superior esquerdo */
  background:
    radial-gradient(
      ellipse 600px 500px at 10% 15%,
      rgba(BRAND_R, BRAND_G, BRAND_B, 0.04) 0%,
      transparent 70%
    ),
    /* Blob 2 — centro direita */
    radial-gradient(
      ellipse 500px 600px at 85% 50%,
      rgba(BRAND_R, BRAND_G, BRAND_B, 0.03) 0%,
      transparent 70%
    ),
    /* Blob 3 — inferior esquerdo */
    radial-gradient(
      ellipse 400px 400px at 20% 80%,
      rgba(ACCENT_R, ACCENT_G, ACCENT_B, 0.02) 0%,
      transparent 70%
    );
}
```

**Regras de ouro:**
- Opacidade entre 2% e 5% (nunca acima)
- Blur implícito nos gradients (bordas suaves via tamanho grande do ellipse)
- Variação sutil entre slides: mover posições dos blobs 5-10% para criar ritmo
- Na capa: usar 4 blobs com opacidade 4-5%
- Nos demais: usar 2-3 blobs com opacidade 2-3%

---

## 2. Text Gradients

Para headlines e números de destaque. Cria efeito premium.

```css
.gradient-text {
  background: linear-gradient(135deg, var(--fg-primary) 0%, var(--brand) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Variações:**
- Horizontal: `90deg` — mais sutil
- Diagonal: `135deg` — mais dinâmico (padrão)
- Vertical: `180deg` — para números gigantes

---

## 3. Glassmorphism

Cards com vidro fosco. Cria profundidade e hierarquia visual.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

**Quando usar:** Cards internos em slides de conteúdo, stats, citações.
**Cuidado:** `backdrop-filter` pode não renderizar em screenshots de alguns browsers. Testar antes.

---

## 4. Glow Effects

Brilho sutil em volta de elementos de destaque.

```css
/* Glow em botões */
.glow-button {
  box-shadow:
    0 0 20px rgba(BRAND_R, BRAND_G, BRAND_B, 0.3),
    0 0 60px rgba(BRAND_R, BRAND_G, BRAND_B, 0.1);
}

/* Glow em ícones/dots */
.accent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 12px rgba(BRAND_R, BRAND_G, BRAND_B, 0.5);
}
```

---

## 5. CSS Masks (para imagens)

Quando slides incluem imagens, usar masks para integrar ao design.

```css
/* Fade gradual nas bordas */
.masked-image {
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 60%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 60%,
    transparent 100%
  );
}

/* Máscara radial (vignette) */
.vignette-image {
  -webkit-mask-image: radial-gradient(
    ellipse 80% 80% at center,
    black 0%,
    transparent 100%
  );
}
```

---

## 6. Background Patterns

Texturas sutis para marcas com mood "texturizado".

```css
/* Dot grid */
.dot-pattern {
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

/* Noise (via SVG inline) */
.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

---

## 7. Clip-path (Shapes Decorativos)

Para diagonais, blobs e formas orgânicas.

```css
/* Diagonal cortando o slide */
.diagonal-shape {
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}

/* Blob orgânico */
.blob-shape {
  clip-path: polygon(
    30% 0%, 70% 0%, 100% 30%, 100% 70%,
    70% 100%, 30% 100%, 0% 70%, 0% 30%
  );
}
```

---

## 8. Accent Dots Decorativos

Pontos sutis nos cantos para enriquecer o layout.

```css
.accent-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  opacity: 0.4;
}

/* Posições típicas */
.accent-dot.top-right { top: 60px; right: 60px; }
.accent-dot.bottom-left { bottom: 80px; left: 60px; }
```

---

## Combinação Completa — Exemplo de Slide

```css
.slide {
  width: 1080px;
  height: 1350px;
  position: relative;
  overflow: hidden;
  background: #0a0a0f;
  font-family: 'Inter', sans-serif;
}

/* Mesh com 3 blobs */
.slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 600px 500px at 15% 20%, rgba(99,102,241,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 500px 600px at 80% 45%, rgba(99,102,241,0.03) 0%, transparent 70%),
    radial-gradient(ellipse 400px 400px at 30% 85%, rgba(139,92,246,0.02) 0%, transparent 70%);
}

/* Dot pattern */
.slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 24px 24px;
}
```
