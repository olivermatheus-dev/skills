# Protocolo de Extração e Geração de Design Tokens

## Fontes de Extração (tentar nesta ordem)

| Prioridade | Fonte | Como extrair |
|---|---|---|
| 1 | Site da empresa | Acessar via web, analisar CSS: variáveis, cores, fontes, border-radius, sombras |
| 2 | Redes sociais | Analisar perfil visual: cores dominantes, estilo de fonte, mood |
| 3 | Uploads do usuário | Screenshots, PDFs de brand guide, logos → extrair paleta, tipografia |
| 4 | Brand guide / Manual | PDF ou link → extrair tokens diretamente |
| 5 | Descrição verbal | "Gosto de escuro com detalhes laranja" → dark mode + accent color |

---

## Protocolo de Extração Automatizada (quando autorizado em 7.2)

```
1. Acessar URL via web
2. Analisar HTML/CSS retornado:
   - Variáveis CSS (--color-primary, --font-family, etc.)
   - Cores computadas dos elementos principais (header, botões, links, backgrounds)
   - Fontes carregadas (@font-face, Google Fonts imports)
   - Border-radius predominante
   - Gradients utilizados
   - Indicadores de dark/light mode (prefers-color-scheme, classe .dark)
3. Para referências visuais de terceiros: extrair padrões INSPIRADOS, não idênticos
4. Consolidar tokens e apresentar ao usuário para validação
```

---

## Geração Inteligente de Tokens Complementares

### A partir de 1 cor primária

**Variações de opacidade (para backgrounds e mesh):**
- `--brand: [hex];` → cor pura
- `--brand-subtle: [derivação mais clara ou escura];`
- `--brand-accent: [complementar ou análoga];`
- `--brand-70: rgba([r,g,b], 0.70);`
- `--brand-40: rgba([r,g,b], 0.40);`
- `--brand-10: rgba([r,g,b], 0.10);`
- `--brand-05: rgba([r,g,b], 0.05);`
- `--brand-03: rgba([r,g,b], 0.03);`

**Paleta de neutros para dark mode:**
- `--bg-deep: #0a0a0f` a `#111117` (mais escuro possível sem ser puro preto)
- `--bg-surface: #141419` a `#1a1a21` (fundo de cards)
- `--bg-elevated: #1e1e26` a `#24242e` (fundo de elementos elevados)
- `--fg-primary: #f0f0f5` a `#fafafa` (texto principal)
- `--fg-secondary: #a0a0b0` a `#b0b0c0` (texto secundário)
- `--fg-muted: #606070` a `#707080` (texto desativado)
- `--border-default: rgba(255,255,255,0.08)` (bordas sutis)
- `--border-subtle: rgba(255,255,255,0.04)` (bordas muito sutis)

**Paleta de neutros para light mode:**
- `--bg-light: #ffffff` ou `#fafafa`
- `--bg-light-muted: #f5f5f7`
- `--fg-light-primary: #1a1a2e`
- `--fg-light-secondary: #4a4a6a`
- `--border-light: #e0e0e8`

**Cores semânticas:**
- `--blue: #3b82f6` (info)
- `--green: #22c55e` (sucesso)
- `--amber: #f59e0b` (alerta)
- `--red: #ef4444` (erro)
- `--violet: #8b5cf6` (destaque especial)

### A partir de 1 fonte

```
1. Verificar disponibilidade no Google Fonts:
   https://fonts.google.com/?query=[nome-da-fonte]

2. Gerar URL de import com pesos 400, 500, 600, 700, 800:
   @import url('https://fonts.googleapis.com/css2?family=[Nome+Da+Fonte]:wght@400;500;600;700;800&display=swap');

3. Definir fallback stack baseado no estilo:
   - Sans-serif moderna: "[Nome]", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
   - Serif: "[Nome]", Georgia, "Times New Roman", serif
   - Display/decorativa: "[Nome]", "Arial Black", sans-serif

4. Regras de uso:
   - Headlines: font-weight: 700-800, line-height: 1.1-1.2, letter-spacing: -0.02em
   - Corpo: font-weight: 400-500, line-height: 1.6-1.7
   - Labels/meta: font-weight: 600, text-transform: uppercase, letter-spacing: 0.05em
```

### Tokens derivados (sempre gerar)

**Border-radius:**
- `--radius-sm: 6px;`
- `--radius-md: 10px;`
- `--radius-lg: 16px;`
- `--radius-xl: 24px;`
- `--radius-full: 9999px;`

Ajustar baseado no mood geométrico/orgânico: mood mais geométrico (1-2) → usar valores menores; mood mais orgânico (4-5) → usar valores maiores.

**Sombras:**
- `--shadow-sm: 0 2px 8px rgba(0,0,0,0.3);`
- `--shadow-md: 0 8px 24px rgba(0,0,0,0.4);`

**Gradients:**
- Texto: `linear-gradient(135deg, var(--fg-primary), var(--brand))`
- Surface: `linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))`
- Mesh (dark): radial-gradients com a cor brand em 2-5% de opacidade

---

## Regras para Mesh Backgrounds

Os blobs de mesh SEMPRE usam:
- Opacidades entre **2% e 5%** da cor brand
- Blur entre **48px e 80px** (via tamanho grande do ellipse no radial-gradient)
- **2-4 blobs** por slide
- Capa: 3-4 blobs com 4-5% de opacidade
- Demais slides: 2-3 blobs com 2-3%
- O efeito deve ser **sutil e ambiental** — nunca saturado ou óbvio

**Exemplo de código mesh:**
```css
background:
  radial-gradient(ellipse 800px 600px at 20% 20%, rgba(R,G,B,0.04) 0%, transparent 60%),
  radial-gradient(ellipse 600px 800px at 80% 80%, rgba(R,G,B,0.03) 0%, transparent 60%),
  radial-gradient(ellipse 400px 400px at 50% 50%, rgba(R,G,B,0.02) 0%, transparent 70%),
  var(--bg-deep);
```

---

## Exercício de Mood Visual — Referências por Escala

### Escala 1: Minimalista ←→ Vibrante (1-5)
- 1 (Minimalista): Apple.com, Stripe.com — muito espaço em branco, pouquíssimas cores
- 3 (Equilibrado): Linear.app, Vercel.com — clean mas com personalidade
- 5 (Vibrante): Duolingo, Notion — cores fortes, muita energia visual

### Escala 2: Clean ←→ Texturizado (1-5)
- 1 (Clean): Linear, Vercel — superfícies lisas, sem efeitos
- 3 (Equilibrado): Figma blog — alguma textura, gradients simples
- 5 (Texturizado): Discord, Figma.com — gradients complexos, glassmorphism, profundidade

### Escala 3: Geométrico ←→ Orgânico (1-5)
- 1 (Geométrico): IBM, Stripe — formas exatas, reto, preciso
- 3 (Equilibrado): GitHub, Notion — mix de reto e arredondado
- 5 (Orgânico): Mailchimp, Headspace — formas fluidas, curvas naturais

### Escala 4: Sóbrio ←→ Ousado (1-5)
- 1 (Sóbrio): Basecamp, Ghost — previsível, seguro, neutro
- 3 (Equilibrado): Loom, Webflow — tem personalidade mas sem exagero
- 5 (Ousado): Gumroad, Superhuman — diferente, memorável, que quebra padrão
