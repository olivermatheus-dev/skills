# CSS Tokens Fallback — `/company-preview`

Use este bloco quando a empresa **não tem** `context/VISUAL_IDENTITY.md` ou quando campos obrigatórios estão ausentes/`[pendente]`. Garante graceful degradation.

Injetar dentro do placeholder `{{CSS_TOKENS}}` do html-template.html.

---

## Fallback — modo light neutro

```css
:root {
  /* Brand (azul neutro — não compete com conteúdo) */
  --brand: #3B82F6;
  --brand-subtle: #60A5FA;
  --brand-accent: #10B981;
  --brand-70: rgba(59, 130, 246, 0.70);
  --brand-40: rgba(59, 130, 246, 0.40);
  --brand-10: rgba(59, 130, 246, 0.10);
  --brand-05: rgba(59, 130, 246, 0.05);

  /* Neutros (base light) */
  --bg-base: #FFFFFF;
  --bg-surface: #F7F7F9;
  --bg-elevated: #FFFFFF;
  --fg-primary: #1A1A1A;
  --fg-secondary: #4A4A55;
  --fg-muted: #8A8A95;
  --border-default: #E5E5EA;
  --border-subtle: #F0F0F4;

  /* Semânticas */
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* Tipografia */
  --font-primary: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);

  /* Tipografia — escala */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 28px;
  --text-3xl: 36px;
  --text-4xl: 48px;
}
```

---

## Como adaptar ao VISUAL_IDENTITY da empresa

Se `VISUAL_IDENTITY.md` existe, substituir os valores do fallback pelos tokens extraídos.

**Mapeamento:**

| VISUAL_IDENTITY.md | CSS token final |
|---|---|
| `--brand` (Paleta — Brand) | `--brand` |
| `--brand-subtle` | `--brand-subtle` |
| `--brand-accent` | `--brand-accent` |
| Paleta Dark/Light (conforme modo preferencial) | `--bg-base` ← `--bg-deep` (dark) ou `--bg-light` (light) |
| | `--bg-surface` ← `--bg-surface` (dark) ou `--bg-light-muted` (light) |
| | `--fg-primary` ← `--fg-primary` (dark) ou `--fg-light-primary` (light) |
| | `--fg-secondary` ← `--fg-secondary` (dark) ou `--fg-light-secondary` (light) |
| `--radius-sm/md/lg/xl/full` | idem |
| `--shadow-sm/md` | idem |
| Tipografia — Fonte primária | `--font-primary` |
| Tipografia — Fonte mono | `--font-mono` |

**Modo (dark/light):**
- VISUAL_IDENTITY > "Modo e Mood" > "Base dos slides":
  - "Dark" → `data-theme="dark"` no `<html>` + usar Paleta Dark
  - "Light" → `data-theme="light"` + Paleta Light
  - "Ambos" → preferir Dark (mais popular em tech; mas considere persona se B2C hedônico, usar Light)

**Font imports:**
- Extrair a URL do `@import url(...)` de "Tipografia > Fonte primária" e "Fonte mono"
- Converter para `<link rel="stylesheet" href="..." crossorigin>`
- Colocar ambos no placeholder `{{FONT_IMPORTS}}`

**Regras de contraste:**
- Se `--brand` tem contraste baixo vs `--bg-base`, **usar `--brand-subtle` nas superfícies com texto, não `--brand`**
- Validação rápida: hex brand + hex bg → L1/L2 > 4.5 para WCAG AA
- Se falhar, manter fallback azul `#3B82F6` mesmo em empresas com brand exótico

---

## Modo dark — fallback alternativo

Quando VISUAL_IDENTITY diz "Dark" mas não tem tokens neutros preenchidos:

```css
:root[data-theme="dark"] {
  --bg-base: #0A0A0F;
  --bg-surface: #111116;
  --bg-elevated: #1A1A22;
  --fg-primary: #F5F5F7;
  --fg-secondary: #A8A8B3;
  --fg-muted: #6B6B78;
  --border-default: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.04);

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 24px 64px rgba(0, 0, 0, 0.5);
}
```
