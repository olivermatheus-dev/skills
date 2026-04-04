# Output Template — VISUAL_IDENTITY.md

Use este template exato ao gerar o arquivo VISUAL_IDENTITY.md.

---

```markdown
# Identidade Visual — [Nome da marca]

> Gerado pela Skill S7 (Setup, Bloco 7).
> **Última atualização:** [data]
> **Fonte dos tokens:** [site / brand guide / descrição verbal]

## Tipografia
- **Fonte primária:** [nome] ([Google Fonts / local])
  - Import: `@import url('[url completa do Google Fonts com todos os pesos]')`
  - Fallback: "[fonte]", [sistema fallback]
- **Pesos disponíveis:** 400, 500, 600, 700, 800
- **Regras:**
  - Headlines: `font-weight: 700-800; line-height: 1.1; letter-spacing: -0.02em`
  - Corpo: `font-weight: 400-500; line-height: 1.6`
  - Labels: `font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em`

## Paleta — Brand
```css
--brand: [hex];
--brand-subtle: [hex derivado];
--brand-accent: [hex complementar ou análogo];
--brand-70: rgba([r],[g],[b], 0.70);
--brand-40: rgba([r],[g],[b], 0.40);
--brand-10: rgba([r],[g],[b], 0.10);
--brand-05: rgba([r],[g],[b], 0.05);
--brand-03: rgba([r],[g],[b], 0.03);
```

## Paleta — Neutros (Dark Mode)
```css
--bg-deep: [hex];
--bg-surface: [hex];
--bg-elevated: [hex];
--fg-primary: [hex];
--fg-secondary: [hex];
--fg-muted: [hex];
--border-default: rgba(255,255,255,[opacidade]);
--border-subtle: rgba(255,255,255,[opacidade]);
```

## Paleta — Neutros (Light Mode)
```css
--bg-light: [hex];
--bg-light-muted: [hex];
--fg-light-primary: [hex];
--fg-light-secondary: [hex];
--border-light: [hex];
```

## Paleta — Semânticas
```css
--blue: [hex];
--green: [hex];
--amber: [hex];
--red: [hex];
--violet: [hex];
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
  radial-gradient(ellipse 800px 600px at 20% 20%, [brand-rgba-004] 0%, transparent 60%),
  radial-gradient(ellipse 600px 800px at 80% 80%, [brand-rgba-003] 0%, transparent 60%),
  var(--bg-deep);
```

## Bordas
```css
--radius-sm: [valor]px;
--radius-md: [valor]px;
--radius-lg: [valor]px;
--radius-xl: [valor]px;
--radius-full: 9999px;
```

## Sombras
```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
--shadow-md: 0 8px 24px rgba(0,0,0,0.4);
```

## Elementos Decorativos
- **Efeitos:** [glassmorphism / glow / mesh / nenhum]
- **Background patterns:** [tipo ou nenhum]

## Modo e Mood
- **Base dos slides:** [Dark / Light / Ambos]
- **Mood:** Minimalista-Vibrante [X/5] | Clean-Texturizado [X/5] | Geom-Orgânico [X/5] | Sóbrio-Ousado [X/5]
```
