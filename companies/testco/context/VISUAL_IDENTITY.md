# Identidade Visual — TestCo

> Gerado pela Skill S7 (Setup, Bloco 7).
> **Última atualização:** 2026-04-16
> **Fonte dos tokens:** site (testco.example)

## Tipografia
- **Fonte primária:** Inter (Google Fonts)
  - Import: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`
  - Fallback: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Fonte mono (para código):** JetBrains Mono (Google Fonts)
  - Import: `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap')`
- **Pesos disponíveis:** 400, 500, 600, 700, 800
- **Regras:**
  - Headlines: `font-weight: 700-800; line-height: 1.1; letter-spacing: -0.02em`
  - Corpo: `font-weight: 400-500; line-height: 1.6`
  - Labels: `font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em`
  - Código: `font-family: 'JetBrains Mono'; font-weight: 400-600`

## Paleta — Brand
```css
--brand: #7C5CFF;
--brand-subtle: #9F88FF;
--brand-accent: #00E0B2;
--brand-70: rgba(124, 92, 255, 0.70);
--brand-40: rgba(124, 92, 255, 0.40);
--brand-10: rgba(124, 92, 255, 0.10);
--brand-05: rgba(124, 92, 255, 0.05);
--brand-03: rgba(124, 92, 255, 0.03);
```

## Paleta — Neutros (Dark Mode)
```css
--bg-deep: #0A0A0F;
--bg-surface: #111116;
--bg-elevated: #1A1A22;
--fg-primary: #F5F5F7;
--fg-secondary: #A8A8B3;
--fg-muted: #6B6B78;
--border-default: rgba(255,255,255,0.08);
--border-subtle: rgba(255,255,255,0.04);
```

## Paleta — Neutros (Light Mode)
```css
--bg-light: #FFFFFF;
--bg-light-muted: #F7F7F9;
--fg-light-primary: #0A0A0F;
--fg-light-secondary: #4A4A55;
--border-light: #E5E5EA;
```

## Paleta — Semânticas
```css
--blue: #4A9FFF;
--green: #00E0B2;
--amber: #FFB547;
--red: #FF5C7A;
--violet: #7C5CFF;
```

## Gradients
```css
/* Texto */
background: linear-gradient(135deg, var(--fg-primary), var(--brand));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Surface */
background: linear-gradient(135deg, var(--bg-surface), var(--bg-elevated));

/* Mesh background */
background:
  radial-gradient(ellipse 800px 600px at 20% 20%, rgba(124, 92, 255, 0.04) 0%, transparent 60%),
  radial-gradient(ellipse 600px 800px at 80% 80%, rgba(0, 224, 178, 0.03) 0%, transparent 60%),
  var(--bg-deep);
```

## Bordas
```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

## Sombras
```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
--shadow-md: 0 8px 24px rgba(0,0,0,0.4);
--shadow-glow: 0 0 40px rgba(124, 92, 255, 0.25);
```

## Elementos Decorativos
- **Efeitos:** glow sutil em elementos ativos + mesh background em hero
- **Background patterns:** grid sutil em seções de código (linhas de 1px a 4% de opacidade)
- **Ícones:** lucide-react (line icons, peso 1.5)

## Modo e Mood
- **Base dos slides:** Dark
- **Mood:**
  - Minimalista-Vibrante: 4/5 (poucos elementos, mas roxo/verde com presença)
  - Clean-Texturizado: 2/5 (quase zero textura, máximo clean)
  - Geom-Orgânico: 1/5 (totalmente geométrico, sem formas orgânicas)
  - Sóbrio-Ousado: 3.5/5 (sóbrio no spacing, ousado no acento de cor)
