---
name: carousel-creator
description: "Gera carrosséis visuais (slides individuais em HTML/CSS puro) prontos para exportar como imagem, seguindo a identidade visual da marca. Use quando o usuário quiser criar carrossel, slides visuais, arte para Instagram, slides para LinkedIn, transformar conteúdo em formato visual. Também use quando mencionar 'criar slides', 'fazer arte', 'carrossel', 'carousel', 'post visual', 'arte para feed', 'slide de Instagram', 'slide de LinkedIn', ou pedir peças visuais para redes sociais. Se o usuário tiver conteúdo textual e quiser transformar em visual, esta é a skill certa."
---

# Skill 8 — Carousel Creator

## Propósito

Receber conteúdo textual (de qualquer skill ou input direto) e transformar em slides HTML/CSS de alta qualidade, seguindo rigorosamente a identidade visual da marca.

## Context Files Obrigatórios

Carregar ANTES de gerar slides:
- `VISUAL_IDENTITY.md` — Design tokens: cores, fontes, gradients, efeitos, modo dark/light
- `BRAND_VOICE.md` — Tom de voz para textos curtos dos slides
- `PLATFORM_SPECS.md` — Dimensões por plataforma

**Se `VISUAL_IDENTITY.md` não existir → redirecionar para Skill S (Setup, Bloco 7).**

**NÃO carregar:** PRODUCT_CONTEXT, AUDIENCE_PROFILES, COMPETITOR_MAP, CONTENT_PILLARS, HOOK_LIBRARY

## Perguntas Obrigatórias (se não especificado)

| Pergunta | Opções | Default |
|---|---|---|
| Formato | Portrait 1080×1350 (Instagram) / Square 1080×1080 (LinkedIn) | Portrait |
| Quantidade de slides | Auto ou número específico | Auto (5-10) |
| Tema visual | Dark / Light | Conforme VISUAL_IDENTITY |
| Slide de CTA no final? | Sim / Não | Sim |

## Anatomia de um Slide — 4 Camadas

```
┌─────────────────────────────────────────┐
│  Camada 1: Mesh/Background              │  ← Gradients, blobs, patterns
│  ┌───────────────────────────────────┐  │
│  │  Camada 2: Content                │  │  ← Textos, números, ícones
│  │  ┌───────────────────────────┐    │  │
│  │  │  Camada 3: Decorative     │    │  │  ← Accent dots, glow, bordas
│  │  └───────────────────────────┘    │  │
│  └───────────────────────────────────┘  │
│  Camada 4: Branding footer              │  ← Watermark, progress dots
└─────────────────────────────────────────┘
```

## Tipos de Slide

Selecionar o tipo adequado para cada bloco de conteúdo:

| Tipo | Quando usar | Elementos obrigatórios |
|---|---|---|
| **Cover** | Primeiro slide sempre | Badge/tag, título grande (hero font), subtítulo, mesh intenso, accent dot |
| **Content** | Explicação/argumento | Número ou ícone no topo (gradient text), título bold, corpo (secondary color) |
| **List/Bullets** | Itens enumeráveis | Ícone check com brand color, texto por bullet, espaçamento generoso (16-24px gap) |
| **Stat/Destaque** | Número impactante | Número gigante (72-96px, gradient text), label descritivo, card com borda sutil |
| **Quote** | Frase de impacto | Aspas decorativas em brand color, texto destaque, atribuição em muted |
| **Comparison** | Comparativos | Duas colunas ou antes/depois, separador visual, cores contrastantes |
| **CTA** | Último slide (se habilitado) | Mesh intenso, CTA text, menção marca/handle, botão visual |

## Regras de Design

### Consistência intra-carrossel
Todos os slides compartilham: mesmo estilo de mesh, mesma posição de watermark, mesmo padding base. Variação permitida: posição dos blobs muda levemente entre slides para ritmo visual.

### Hierarquia tipográfica
- Títulos: `--fg-primary`
- Corpo: `--fg-secondary`
- Metadados/labels: `--fg-muted`
- Cor brand (`--brand`): SOMENTE para acentos (badges, ícones, gradient text, dots). NUNCA para blocos grandes de texto corrido.

### Espaçamento
- Padding lateral: 80-100px
- Padding vertical: 100-120px
- Generoso — o slide deve "respirar"

### Progresso
- Indicador no rodapé (dots ou barra)
- Dot ativo: `--brand` / Inativos: `--border-default`

### Branding
- Último slide (e opcionalmente todos): watermark discreto com nome ou @handle
- Nunca obstruir conteúdo

## Técnicas CSS Necessárias

Aplicar conforme indicado pelo VISUAL_IDENTITY:

| Técnica | Quando usar |
|---|---|
| **Mesh gradients** (radial-gradient empilhados) | Background — SEMPRE, com cores e opacidades do VISUAL_IDENTITY |
| **Text gradients** (-webkit-background-clip: text) | Headlines hero, números destaque |
| **Glassmorphism** (backdrop-filter: blur + borda) | Cards internos |
| **Glow** (box-shadow com brand color) | Destaques, CTAs |
| **CSS Masks** | Imagens com fade gradual |
| **Background patterns** (dot grid, noise) | Quando VISUAL_IDENTITY indicar texturas |
| **Clip-path** | Shapes decorativos, diagonais |

### Regra de mesh backgrounds
Blobs SEMPRE usam opacidades entre 2% e 5% da cor brand, blur entre 48px e 80px. Efeito sutil e ambiental — nunca saturado.

## Processo de Análise do Conteúdo

Ao receber o conteúdo textual:

1. **Contar ideias/pontos:** Quantos pontos distintos existem?
2. **Identificar hierarquia:** Título geral? Subtópicos?
3. **Detectar dados/números:** → Slide Stat
4. **Detectar citações:** → Slide Quote
5. **Detectar listas:** → Slide List
6. **Propor distribuição:** Montar outline antes de gerar
7. **Confirmar:** "Vou criar [N] slides: [lista]. Quer ajustar?"

## Output

Para cada carrossel, gerar:
- Um arquivo HTML por slide (`slide-01.html`, `slide-02.html`, etc.)
- Cada HTML é standalone, completo, abrível no browser, pronto para screenshot
- Dimensões exatas (1080×1350 ou 1080×1080)
- Fontes via Google Fonts `@import`
- Todo CSS inline (sem dependência externa além da fonte)
- Salvar em `/mnt/user-data/outputs/carousel-[tema]/`

Para referência de templates HTML por tipo de slide e técnicas CSS avançadas, consultar `references/slide-types.md` e `references/css-techniques.md` quando disponíveis.
