# Identidade Visual — kz

> Gerado pela Skill S7 (Setup, Bloco 7) em modo Caminho C (mínimo viável).
> **Última atualização:** 2026-04-16
> **Fonte dos tokens:** extração automática do CSS de https://kz.app.br/home (Mantine UI + customização) + descrição verbal do usuário
> **Status:** 🔸 Tokens iniciais — logotipo será aprimorado. Revalidar após lançamento.

---

## Princípios Visuais

A visual da kz reforça o tom acolhedor definido no Brand Voice:

- **Calma acima de impacto.** Nenhuma cor ou elemento chama mais atenção do que precisa.
- **Light como padrão.** Fundo claro passa serenidade, coerente com o ofício terapêutico e com o público feminino predominante. Dark mode existe **apenas como conforto ocular opcional** dentro da plataforma — não é ambiente narrativo da marca.
- **Pastéis calmos, não vibrantes.** Nenhum acento forte ou cor sinalizadora agressiva.
- **Orgânico e respirado.** Formas com cantos suaves, muito espaço em branco, sem texturas pesadas.

---

## Tipografia

- **Fonte primária:** Montserrat (Google Fonts)
  - Import: `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');`
  - Fallback: `"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Pesos disponíveis:** 300, 400, 500, 600, 700, 800
- **Regras:**
  - Headlines: `font-weight: 700; line-height: 1.15; letter-spacing: -0.01em`
  - Subheads: `font-weight: 600; line-height: 1.3`
  - Corpo: `font-weight: 400; line-height: 1.6; letter-spacing: 0`
  - Labels / UI: `font-weight: 500; letter-spacing: 0.02em`
  - **Evitar caixa alta agressiva.** Capitalização natural preserva tom acolhedor.

---

## Paleta — Brand (Laranja/Coral)

Cor principal: **#ef7960** (coral terracota, quente sem estridência). Variantes derivadas do esquema Mantine + tints complementares:

```css
--brand:           #ef7960;   /* base — botões primários, links, destaque principal */
--brand-soft:      #f69a7f;   /* brand-3 — hover, estados suaves */
--brand-muted:     #f28b70;   /* brand-4 — elementos secundários */
--brand-subtle:    #fce0d7;   /* brand-1 — backgrounds de alerta leve */
--brand-whisper:   #fef2ee;   /* brand-0 — backgrounds muito sutis, tags */
--brand-deep:      #d66954;   /* brand-6 — texto sobre fundo claro, ênfase */
--brand-darker:    #bc5a47;   /* brand-7 — acessibilidade AAA sobre branco */

/* Transparências (para overlays e glows suaves) */
--brand-70: rgba(239, 121, 96, 0.70);
--brand-40: rgba(239, 121, 96, 0.40);
--brand-10: rgba(239, 121, 96, 0.10);
--brand-05: rgba(239, 121, 96, 0.05);
--brand-03: rgba(239, 121, 96, 0.03);
```

---

## Paleta — Neutros (Light Mode — PADRÃO)

Tons creme/off-white criam calor sem o branco clínico duro:

```css
--bg-light:            #faf8f5;   /* creme base — respira melhor que #ffffff puro */
--bg-light-surface:    #ffffff;   /* cards, superfícies elevadas */
--bg-light-muted:      #f4f1ec;   /* seções secundárias, bordas visuais suaves */
--fg-light-primary:    #2b2b2b;   /* texto principal — menos agressivo que #000 */
--fg-light-secondary:  #5a5a5a;   /* texto secundário, descrições */
--fg-light-muted:      #8a8a8a;   /* texto terciário, metadados */
--border-light:        #e8e4dc;   /* bordas padrão */
--border-light-subtle: #f0ede7;   /* bordas quase invisíveis */
```

## Paleta — Neutros (Dark Mode — apenas conforto ocular)

Dark mode existe exclusivamente como preferência de leitura dentro da plataforma. **Não é modo narrativo da marca** — materiais de marketing, conteúdo, peças editoriais e redes sociais usam sempre o Light Mode.

```css
--bg-deep:       #1a1a1a;
--bg-surface:    #242424;
--bg-elevated:   #2e2e2e;
--fg-primary:    #f4f1ec;   /* mesmo creme do light, invertido */
--fg-secondary:  #a8a8a8;
--fg-muted:      #6a6a6a;
--border-default: rgba(255, 255, 255, 0.08);
--border-subtle:  rgba(255, 255, 255, 0.04);
```

## Paleta — Pastéis Calmos (Acentos da Plataforma)

Usados dentro do produto para diferenciar contextos (status, categorias, estados de sessão). Não são cores de marca — são **tons pastel calmos** que convivem com o coral sem competir:

```css
--pastel-sage:     #cfe0d0;   /* verde pastel — sucesso, completado */
--pastel-lavender: #d8d2e3;   /* lavanda — informação neutra, roxo sutil */
--pastel-sky:      #cdd8e0;   /* azul acinzentado — estados informativos */
--pastel-butter:   #f1e7c9;   /* amarelo manteiga — atenção suave */
--pastel-rose:     #f1d6cc;   /* rosa suave — acolhimento, destaque feminino */
--pastel-clay:     #ddcfc2;   /* bege terra — neutro quente */
```

## Paleta — Semânticas (uso pontual)

```css
--success:  #6b9e72;   /* verde sage mais saturado */
--info:     #7a94a8;   /* azul acinzentado */
--warning:  #d4a64c;   /* ocre — nunca amarelo estridente */
--danger:   #c77166;   /* variante do próprio coral, sem vermelho agressivo */
```

**Regra:** nunca usar verde #00FF00, vermelho #FF0000, amarelo #FFFF00 ou qualquer cor primária digital pura. Todas as cores passam pelo filtro "calma".

---

## Gradients

Gradientes são **suaves** e **discretos**. Nunca multi-cor agressivo, nunca holográfico.

```css
/* Gradient de marca — botão destaque, call-to-action */
background: linear-gradient(135deg, #ef7960 0%, #f28b70 100%);

/* Gradient de seção — respiração entre blocos */
background: linear-gradient(180deg, var(--bg-light) 0%, var(--bg-light-muted) 100%);

/* Gradient de texto — só para headlines especiais (usar com parcimônia) */
background: linear-gradient(135deg, var(--fg-light-primary) 0%, var(--brand-deep) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Mesh background — hero sections */
background:
  radial-gradient(ellipse 600px 400px at 20% 20%, rgba(239, 121, 96, 0.04) 0%, transparent 60%),
  radial-gradient(ellipse 500px 400px at 80% 80%, rgba(239, 121, 96, 0.03) 0%, transparent 60%),
  var(--bg-light);
```

---

## Bordas

Cantos arredondados generosos (mas não exagerados) reforçam o tom acolhedor. Detectado no site: `border-radius: 10px` em componentes + Mantine default (2px) para micro-elementos.

```css
--radius-xs: 4px;    /* tags, chips */
--radius-sm: 8px;    /* inputs, botões pequenos */
--radius-md: 10px;   /* botões padrão, cards pequenos */
--radius-lg: 16px;   /* cards grandes, modais */
--radius-xl: 24px;   /* sections, hero blocks */
--radius-full: 9999px;  /* avatares, pills */
```

---

## Sombras

Sombras suaves, nunca dramáticas. Reforçam suavidade acolhedora.

```css
--shadow-xs: 0 1px 2px rgba(43, 43, 43, 0.04);
--shadow-sm: 0 2px 8px rgba(43, 43, 43, 0.06);
--shadow-md: 0 8px 24px rgba(43, 43, 43, 0.08);
--shadow-lg: 0 16px 40px rgba(43, 43, 43, 0.10);
--shadow-brand: 0 4px 16px rgba(239, 121, 96, 0.20);  /* glow suave da marca */
```

---

## Iconografia

- **Estilo:** line icons com 1.5px de stroke (não filled, não 3D)
- **Cantos:** arredondados (`stroke-linecap: round; stroke-linejoin: round`)
- **Biblioteca sugerida:** Lucide (coerente com Mantine) ou Phosphor Icons (cantos arredondados)
- **Tamanho padrão:** 20px em UI · 24px em hero · 16px em labels pequenas

---

## Fotografia / Ilustrações

### Fotografia
- Sempre **natural e calma** — luz natural, paletas quentes terrosas
- **Mulheres em contextos profissionais acolhedores** (terapeutas no consultório, escutando, escrevendo, lendo, pausando)
- **Evitar:** poses corporativas duras, handshakes, gráficos ascendentes, gente de terno, stock-photo genérico
- **Enquadramentos:** close médio, foco em mãos + expressão; ambiente suave desfocado

### Ilustrações
- **Estilo orgânico e abstrato** com traços leves
- Paleta: coral + pastéis + neutros creme
- Formas curvas, nunca pontiagudas
- Simbolismo sutil: pausas, respiração, espaço, pontos de conexão
- **Evitar:** ilustrações corporate (personagens genéricos sorrindo), icones de "produtividade" (foguetes, gráficos)

---

## Elementos Decorativos

- **Efeitos:** glows coral muito sutis (`--shadow-brand`), nunca neon; glassmorphism **não** (afasta do tom orgânico)
- **Background patterns:** nenhum padrão geométrico repetitivo; ocasionalmente manchas orgânicas pastel muito sutis (blur alto, opacity baixa)
- **Animação:** transições suaves (200–400ms, `cubic-bezier(0.4, 0, 0.2, 1)`), nunca bounce ou rotações grandes
- **Respiração:** espaços generosos entre elementos; padding > 24px em cards

---

## Modo e Mood

- **Base dos slides e materiais de conteúdo:** **Light** (padrão e narrativo)
- **Dark mode:** apenas dentro da plataforma, como preferência opcional de conforto ocular — NÃO aparece em peças editoriais, posts, carrosséis, landing pages
- **Mood (escala 1–5):**
  - **Minimalista ←→ Vibrante:** 2/5 (mais minimalista; coral dá calor, nunca vibra)
  - **Clean ←→ Texturizado:** 1/5 (clean total)
  - **Geométrico ←→ Orgânico:** 4/5 (orgânico prevalece — curvas, pastéis, fotografia natural)
  - **Sóbrio ←→ Ousado:** 2/5 (sóbrio com calor)
  - **Sério ←→ Lúdico:** 2/5 (sério com suavidade, não lúdico)

---

## Do's and Don'ts Visuais

### ✅ Faça
- Fundo creme/off-white com um toque coral em destaque
- Muito espaço em branco — respira bem
- Tipografia em pesos moderados (500-700 para destaque, nunca 900 bold pesado)
- Ilustrações orgânicas, fotos naturais com luz quente
- Cantos arredondados em tudo (8-16px)
- Sombras suaves, quase imperceptíveis

### ❌ Não faça
- Fundo preto puro em materiais narrativos (só dark mode da plataforma)
- Coral + vermelho + amarelo em peça única (satura e agride)
- Caixa alta em textos longos
- Ícones 3D ou com gradiente cromado
- Emojis visuais agressivos (🚀 💥 🔥 ⚡)
- Stock photos corporativos
- Tipografia serifada em UI (quebra a coerência com Montserrat)

---

## Aplicação por Plataforma (síntese)

| Plataforma | Fundo | Uso do coral | Tipografia destaque | Formato predominante |
|---|---|---|---|---|
| Instagram feed | creme (#faf8f5) | coral em pequenos destaques; nunca dominante | Montserrat 700 | carrossel + post único |
| Instagram stories | creme ou pastel | coral como CTA ou realce | Montserrat 600-700 | vertical, respiração ampla |
| LinkedIn | branco | coral em bullets/destaques de headline | Montserrat 600 | texto + 1 imagem discreta |
| Blog / Site | creme base + branco em cards | coral em links, botões, dados-chave | Montserrat 700 | tipografia-first |
| Newsletter (email) | creme ou branco | coral em links e CTA; 1 destaque visual coral por edição | Montserrat 600 (quando renderizar) ou fallback Arial | texto-first, 1 imagem |
| Apresentações / decks | creme base, 1 slide coral por 8 | coral em highlights, não em fundos inteiros | Montserrat 700 (título) + 400 (corpo) | 1 ideia por slide |

---

## Campos para Revalidação em 30 Dias / Roadmap Visual

- 🟡 **Logotipo será aprimorado** — quando finalizado, adicionar seção "Logotipo" (variações, margem de segurança, versões mono, sobre cor, sobre fundo, minimum size)
- 🟡 Validar se creme (#faf8f5) é a tonalidade certa de fundo (pode precisar ajuste fino após primeiros materiais)
- 🟡 Definir biblioteca de ilustrações proprietária (ou pack consistente do Storyset/Humaaans adaptado para a paleta coral-pastel)
- 🟡 Criar templates Figma/Canva para cada plataforma usando estes tokens
- 🟡 Decidir 1-2 tipografias display alternativas para peças especiais (headlines-manifesto, capas de ebook), mantendo Montserrat como base do sistema
