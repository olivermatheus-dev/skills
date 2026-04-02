---
name: platform-adapter
description: "Adapta conteúdo-pilar para formatos nativos de cada plataforma de redes sociais: LinkedIn, Instagram (feed, reels, stories), TikTok, X/Twitter, YouTube e Blog. Use quando o usuário tiver conteúdo pronto e quiser versões para plataformas específicas. Também use quando mencionar 'adaptar para LinkedIn', 'versão para Instagram', 'formatar para Reels', 'postar em', 'criar versão para', 'thread no Twitter', 'artigo para blog'. Se o conteúdo existe mas precisa ser formatado para o canal certo, esta é a skill."
---

# Skill 5A — Platform Adapter

## Propósito

Pegar um conteúdo-pilar e transformá-lo em versões otimizadas para cada plataforma, respeitando limites, formatos, tom e boas práticas de cada canal.

## Context Files Obrigatórios

Carregar ANTES de adaptar:
- `PLATFORM_SPECS.md` — regras específicas de cada plataforma
- `BRAND_VOICE.md` — adaptar tom por plataforma (mais formal no LinkedIn, mais casual no Instagram)

**NÃO carregar:** PRODUCT_CONTEXT, AUDIENCE_PROFILES, COMPETITOR_MAP, CONTENT_PILLARS, HOOK_LIBRARY, VISUAL_IDENTITY

## Input Esperado

- Conteúdo-pilar da Skill 4 (com marcações de atomização)
- Quais plataformas? (todas ou específicas)

## Regras de Adaptação por Plataforma

### LinkedIn
- **Formato:** Carrossel PDF (196% mais engajamento) ou Post longo
- **Hook:** Primeira linha é tudo. Quebra de linha após hook para forçar "ver mais"
- **Tom:** Profissional, não corporativo. Insights acionáveis
- **Carrossel:** 8-12 slides. Slide 1 = capa com hook. Final = CTA + perfil. Máx 30 palavras/slide
- **Hashtags:** 3-5 no final
- **CTA:** Comentar, compartilhar experiência, seguir

### Instagram (Feed/Carrossel)
- **Formato:** Carrossel (109% mais engajamento que Reels por alcance)
- **Hook:** Primeira imagem = scroll-stopper com texto grande e legível
- **Tom:** Mais casual e visual. Emojis com moderação
- **Carrossel:** 6-10 slides. Visual clean. Uma frase-chave por slide
- **Caption:** Máx 300 palavras. Hook no início. 15-20 hashtags
- **CTA:** Salvar, compartilhar, comentar

### Instagram (Reels)
- **Formato:** Vídeo vertical 9:16, 30-60 segundos
- **Hook:** Primeiros 3 segundos = hook mais forte
- **Script:** Máx 150 palavras para 60s. Linguagem coloquial. Frases curtas
- **Estrutura:** Hook (3s) → Contexto (5s) → Conteúdo (40s) → CTA (10s)
- **Incluir sugestão de b-roll/visual para cada trecho**

### TikTok
- **Formato:** Vídeo vertical, 15-60 segundos
- **Hook:** Primeiros 2 segundos. Mais provocativo. Pattern interrupt visual
- **Tom:** Ultra-casual, conversacional. Como falando com amigo
- **Verificar tendências atuais e sugerir adaptação**

### X (Twitter)
- **Formato:** Thread (5-10 tweets) ou post único
- **Tweet 1:** Hook puro. Máx 280 caracteres
- **Thread:** Tweet 1 = hook. Tweet 2 = contexto. 3-8 = valor. Final = CTA + RT
- **Tom:** Direto, opinionado, sem rodeios

### Blog
- **Formato:** Artigo 1000-2000 palavras
- **SEO:** H2/H3 estruturados, meta description, keywords sugeridas
- **Estrutura:** Intro com hook → Seções com subheadings → Conclusão com CTA
- **Maior profundidade, incluir todos os dados da pesquisa**

## Formato de Output

Para cada plataforma solicitada, entregar o conteúdo formatado e pronto para publicar:

```markdown
## LinkedIn
**Formato:** [Carrossel / Post longo]
[conteúdo completo formatado]
**Hashtags:** [lista]

## Instagram (Feed)
**Formato:** [Carrossel / Imagem]
[descrição dos slides ou conteúdo visual]
**Caption:** [texto]
**Hashtags:** [lista]

## Instagram (Reels)
**Script ([X]s):**
[00:00-00:03] HOOK: "[texto]" — Visual: [sugestão]
[00:03-00:08] CONTEXTO: "[texto]" — Visual: [sugestão]
[...]
**Caption:** [texto]
**Hashtags:** [lista]
```

Consultar `references/platform-specs.md` para detalhamento técnico por plataforma quando disponível.
