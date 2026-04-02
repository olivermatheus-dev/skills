# Bloco 7 — Identidade Visual

## Objetivo

Extrair e documentar os design tokens da marca — cores, tipografia, gradients, espaçamentos, efeitos visuais — para que skills visuais (Carousel Creator) gerem artes on-brand.

**O usuário provavelmente não sabe o que são "design tokens".** Pergunte em linguagem acessível e traduza para tokens CSS.

## Fontes de Extração (tentar nesta ordem)

| Prioridade | Fonte | Como extrair |
|---|---|---|
| 1 | Site da empresa | Acessar via web, analisar CSS: variáveis, cores, fontes, border-radius, sombras |
| 2 | Redes sociais | Analisar perfil visual: cores dominantes, estilo de fonte, mood |
| 3 | Uploads do usuário | Screenshots, PDFs de brand guide, logos → extrair paleta, tipografia |
| 4 | Brand guide / Manual | PDF ou link → extrair tokens diretamente |
| 5 | Descrição verbal | "Gosto de escuro com detalhes laranja" → dark mode + accent color |

## Sequência de Perguntas

| # | Pergunta | Ajuda |
|---|---|---|
| 7.1 | Sua empresa tem um manual de marca ou brand guide? | "Pode ser PDF, link para Figma/Notion. Se tiver, envie que extraio tudo" |
| 7.2 | Posso analisar seu site para extrair cores e fontes automaticamente? | Se autorizar: acessar site do Bloco 1, analisar CSS, mostrar resultado |
| 7.3 | Qual(is) a(s) cor(es) principal(is)? | Se extraiu: confirmar. Se não: aceitar nome ("azul escuro") ou hex (#1a2b3c) |
| 7.4 | Tem cores secundárias ou de apoio? | "Se não tem, posso sugerir cores harmônicas" |
| 7.5 | Qual a fonte/tipografia? | Se extraiu: confirmar. Se não: pedir nome ou estilo preferido (serif, sans-serif, moderna, clássica) |
| 7.6 | Preferência: dark ou light mode para carrosséis? | "Dark destaca mais no feed. Light é mais corporativo. Pode ter ambos." |
| 7.7 | **Mood visual** — posicionar em 4 escalas | Apresentar pares um por vez com referências visuais |
| 7.8 | Tem referência visual que admira? (marca, site, @) | Se fornecido: analisar e extrair padrões (inspirar, não copiar) |

### Exercício de Mood (7.7)

Apresentar um par por vez com exemplos de marcas conhecidas:

```
Minimalista ←————→ Vibrante     (1-5)
  Ex 1: Apple, Stripe           Ex 5: Duolingo, Notion
  
Clean ←————→ Texturizado        (1-5)
  Ex 1: Linear, Vercel          Ex 5: Discord, Figma

Geométrico ←————→ Orgânico      (1-5)
  Ex 1: IBM, Stripe             Ex 5: Mailchimp, Headspace

Sóbrio ←————→ Ousado            (1-5)
  Ex 1: Basecamp, Ghost         Ex 5: Gumroad, Superhuman
```

## Protocolo de Extração Automatizada (quando autorizado em 7.2)

```
1. Acessar URL via web
2. Analisar HTML/CSS retornado:
   - Variáveis CSS (--color-primary, --font-family, etc.)
   - Cores computadas dos elementos principais (header, botões, links, backgrounds)
   - Fontes carregadas (@font-face, Google Fonts imports)
   - Border-radius predominante
   - Gradients utilizados
   - Indicadores de dark/light mode
3. Para referências visuais de terceiros: extrair padrões INSPIRADOS, não idênticos
4. Consolidar tokens e apresentar ao usuário para validação
```

## Geração Inteligente de Tokens Complementares

Se o usuário fornecer apenas cor primária e fonte, gerar automaticamente:

### A partir de 1 cor primária:
- Variações de opacidade: 70%, 40%, 10%, 5%, 3% (para backgrounds e mesh)
- Cor de acento: complementar ou análoga (oferecer 2-3 opções)
- Paleta de neutros para dark mode: bg-deep (#0a0a0f a #111117), bg-surface, bg-elevated, fg-primary, fg-secondary, fg-muted, borders
- Paleta de neutros para light mode: bg-light, fg-light-primary, etc.
- Cores semânticas: verde/sucesso, âmbar/alerta, vermelho/erro, azul/info

### A partir de 1 fonte:
- Verificar disponibilidade no Google Fonts
- Gerar URL de import com pesos 400, 500, 600, 700, 800
- Definir fallback stack
- Sugerir regras: headlines (700-800, 1.1 line-height), corpo (400-500, 1.6 line-height), labels (600, uppercase, tracking 0.05em)

### Tokens derivados:
- Border-radius: sm (6px), md (10px), lg (16px), xl (24px), full (9999px)
- Sombras: sm e md
- Gradient de texto: `linear-gradient(135deg, var(--fg-primary), var(--brand))`
- Gradient de mesh: radial-gradients com a cor brand em 2-5% de opacidade

Apresentar ao usuário: "Baseado na sua cor [X] e fonte [Y], gerei uma paleta completa. Quer revisar?"

## Regras para Mesh Backgrounds

Os blobs de mesh SEMPRE usam:
- Opacidades entre 2% e 5% da cor brand
- Blur entre 48px e 80px (via tamanho grande do ellipse no radial-gradient)
- 2-4 blobs por slide
- Capa: 3-4 blobs com 4-5% de opacidade
- Demais slides: 2-3 blobs com 2-3%
- O efeito deve ser sutil e ambiental — nunca saturado ou óbvio

## Formato de Saída

Consultar `output-templates.md` seção VISUAL_IDENTITY.
