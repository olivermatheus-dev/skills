# Especificações por Plataforma — TestCo

> Gerado automaticamente pela Skill S (Finalização). Dados padrão filtrados pelas plataformas selecionadas.
> **Última atualização:** 2026-04-16
> **Plataformas ativas:** LinkedIn, X/Twitter, YouTube, Blog

---

## LinkedIn

**Dimensões canônicas:**
- Portrait: 1080×1350 (feed — maior CTR)
- Square: 1080×1080 (fallback)
- Landscape: 1200×628 (links)

**Boas práticas:**
- Hook nas primeiras 2 linhas (antes do "ver mais")
- Parágrafos curtos (1-2 frases) com quebra de linha entre eles
- Documento/Carrossel nativo converte mais que imagem única no B2B
- Postagem entre terça-feira 7h-9h ou 17h-19h (BR)
- Evitar links no corpo — colocar no 1º comentário
- Hashtags: 3-5 relevantes no final

**Tom TestCo no LinkedIn:**
- Case-driven, com dados reais e nomes quando possível (sob NDA: "fintech brasileira Series B")
- Profissional, menos sarcástico que no X
- Aceita inglês misturado com português (audiência dev)

---

## X / Twitter

**Dimensões canônicas:**
- Landscape: 1200×675
- Square: 1080×1080

**Boas práticas:**
- Thread dev-técnico (8-15 tweets) funciona bem
- Primeiro tweet = hook completo (ninguém abre sem gatilho forte)
- Código em imagem (via Carbon ou Ray.so) supera texto puro
- Memes técnicos performam — mas cuidado com jargão muito interno
- Postagem 8h-10h (manhã BR) ou 20h-22h (noite)

**Tom TestCo no X:**
- Mais afiado, aceita sarcasmo técnico
- Provocações a convenções fracas são bem-vindas ("Cypress quebrou de novo?")
- Número por tweet pra manter unidade da thread
- Fim da thread sempre com CTA para algo mais denso (blog, docs, trial)

---

## YouTube

**Dimensões canônicas:**
- Thumbnail: 1280×720
- Banner: 2560×1440
- Vídeo: 16:9 (tutoriais), 9:16 (Shorts)

**Boas práticas:**
- Título com número + promessa concreta ("Migrando Cypress em 15 min")
- Thumbnail com rosto humano + elemento gráfico forte
- 10-20 min é sweet spot para tutoriais técnicos
- Código na tela em JetBrains Mono, fundo dark
- Capítulos no YouTube são mandatórios para tutoriais
- Primeiros 30s são decisivos (anti-bounce)

**Tom TestCo no YouTube:**
- Narração calma, pausada, com tempo para o espectador pensar
- Mostrar erros reais e como foram corrigidos (transparência radical)
- Live coding > slides para tutoriais

---

## Blog

**Dimensões canônicas:**
- Sem dimensão fixa — priorizar legibilidade
- Imagens inline: 1200×630 (aspecto social share)

**Boas práticas:**
- Post longo (1.500-3.000 palavras) supera short form em SEO técnico
- Headings H2/H3 com palavras-chave buscadas
- Bloco de código com highlight sintático
- Diagramas (Excalidraw, Mermaid) quebram texto denso
- TL;DR no topo
- Links internos para docs e posts relacionados

**Tom TestCo no Blog:**
- Aprofundado — pode assumir conhecimento técnico prévio
- Mostrar raciocínio + código + resultado
- Benchmarks com metodologia aberta (nunca cherry-picked)
- Author bio no final com foto e link social

---

## Regras cross-platform

- Mesmo conteúdo NUNCA copiado raw entre plataformas — adaptar formato
- Blog é a "fonte da verdade"; outras plataformas fazem recorte ou teaser
- Imagens com acento de cor usando `--brand: #7C5CFF` (VISUAL_IDENTITY.md)
- Código sempre em JetBrains Mono, tema dark
