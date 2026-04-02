# Identidade Visual — [Nome da marca]

> Design tokens para geração de artes on-brand. Gerado pela Skill S (Setup, Bloco 7).
> **Última atualização:** [data]
> **Fonte dos tokens:** [site / manual de marca / descrição verbal / referências visuais]

---

## Tipografia

- **Fonte primária:** [nome — ex: "Inter"]
  - Fonte: [Google Fonts / local / sistema]
  - Import: `@import url('[url do Google Fonts]')`
  - Fallback stack: "[fonte]", [fallbacks — ex: sans-serif]
- **Pesos disponíveis:** [400, 500, 600, 700, 800 etc.]
- **Regras de uso:**
  - Headlines: weight [X], letter-spacing [X], line-height [X]
  - Corpo/subtítulos: weight [X], line-height [X]
  - Labels/tags: weight [X], letter-spacing [X], text-transform [X]

---

## Paleta de Cores — Brand

- `--brand: [hex];` — Cor primária da marca
- `--brand-subtle: [hex];` — Para backgrounds sutis
- `--brand-accent: [hex];` — Ênfase forte / cor secundária
- `--brand-70: [rgba];` — 70% opacidade
- `--brand-40: [rgba];` — 40% opacidade
- `--brand-10: [rgba];` — 10% opacidade (backgrounds de badges)
- `--brand-05: [rgba];` — 5% opacidade (mesh backgrounds)
- `--brand-03: [rgba];` — 3% opacidade (mesh sutil)

## Paleta de Cores — Neutros (Dark Mode)

- `--bg-deep: [hex];` — Background principal
- `--bg-surface: [hex];` — Superfície elevada (cards)
- `--bg-elevated: [hex];` — Superfície mais elevada
- `--fg-primary: [hex];` — Texto principal
- `--fg-secondary: [hex];` — Texto secundário
- `--fg-muted: [hex];` — Texto terciário / labels
- `--border-default: [valor];` — Bordas padrão
- `--border-subtle: [valor];` — Bordas sutis

## Paleta de Cores — Light Mode

- `--bg-light: [hex];` — Background principal light
- `--bg-light-muted: [hex];` — Background secundário light
- `--fg-light-primary: [hex];` — Texto principal light
- `--fg-light-secondary: [hex];` — Texto secundário light
- `--border-light: [hex];` — Bordas light

## Paleta de Cores — Semânticas

- `--blue: [valor];` — Informação
- `--green: [valor];` — Sucesso
- `--amber: [valor];` — Alerta
- `--red: [valor];` — Erro
- `--violet: [valor];` — Destaque especial

---

## Gradients

- **Text gradient (headlines):** `linear-gradient(135deg, var(--fg-primary), var(--brand))`
- **Surface gradient (cards):** [código CSS]
- **Mesh background (slides):** [código CSS com blobs, opacidades 2-5%, blur 48-80px]

---

## Bordas e Border-Radius

- `--radius-sm: [valor — ex: 6px];`
- `--radius-md: [valor — ex: 10px];`
- `--radius-lg: [valor — ex: 16px];`
- `--radius-xl: [valor — ex: 24px];`
- `--radius-full: 9999px;`

## Sombras

- `--shadow-sm: [valor];`
- `--shadow-md: [valor];`

---

## Elementos Decorativos

- **Accent dots:** [sim/não — tamanho, opacidade, posições típicas]
- **Background patterns:** [dot grid / line grid / noise / nenhum]
- **Efeitos:** [glassmorphism / glow / nenhum]

---

## Modo Preferencial

- **Base dos slides:** [Dark / Light]
- **Mood (1-5):**
  - Minimalista [1] ←→ Vibrante [5]: **[nota]**
  - Clean [1] ←→ Texturizado [5]: **[nota]**
  - Geométrico [1] ←→ Orgânico [5]: **[nota]**
  - Sóbrio [1] ←→ Ousado [5]: **[nota]**
