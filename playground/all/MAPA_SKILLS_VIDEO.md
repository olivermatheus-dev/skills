# Mapa de Arquivos — 3 Skills Especializadas de Vídeo

## Visão Geral

Separar em 3 skills especializadas faz sentido porque cada plataforma tem regras de algoritmo, tempos de retenção, estilos de hook e formatos completamente diferentes. Um vídeo que viraliza no TikTok pode flopar no YouTube e vice-versa.

A estrutura proposta separa arquivos em 2 categorias:
- **Universais (compartilhados):** Funcionam para qualquer marca/projeto. São fundamentos de psicologia, templates de hooks, e frameworks de storytelling.
- **Individuais (por projeto):** Context files específicos de cada marca/audiência, gerados pelo Setup.

---

## ARQUIVOS UNIVERSAIS (compartilhados entre as 3 skills)

Estes arquivos ficam em um diretório `shared-references/` que todas as 3 skills referenciam, ou são duplicados em cada skill. Contêm conhecimento "atemporal" de psicologia, storytelling e copywriting.

### 1. `hooks-masterlist.md`
**O que é:** Biblioteca modular de 80-100 templates de hooks organizados por GATILHO PSICOLÓGICO, não por plataforma. Cada hook tem a estrutura base + exemplo genérico + campo para adaptação por nicho.

**Organização interna:**
```
Por Gatilho:
├── Curiosity Gap (lacuna de curiosidade)
│   ├── Templates verbais (texto/fala)
│   ├── Templates visuais (ação na tela)
│   └── Templates mistos (visual + texto)
├── Pattern Interrupt (quebra de padrão)
│   ├── Visual interrupts (movimento inesperado, zoom, objeto)
│   ├── Audio interrupts (silêncio, som inesperado, sussurro)
│   └── Statement interrupts (afirmação chocante)
├── Loss Aversion (aversão à perda)
├── Social Proof (prova social)
├── Authority (autoridade/credibilidade)
├── Specificity (especificidade numérica)
├── Identity (identidade/pertencimento)
├── Urgency/FOMO (urgência)
├── Contrarian (contradição ao senso comum)
├── Story Open Loop (narrativa em aberto)
└── Direct Challenge (desafio direto ao espectador)
```

**Por que universal:** Os gatilhos psicológicos são humanos, não de plataforma. O mesmo gatilho de curiosity gap funciona em TikTok, Reels e Shorts — o que muda é o FORMATO de entrega (verbal, visual, duração).

---

### 2. `psychology-triggers-deep.md`
**O que é:** Documento profundo sobre os mecanismos psicológicos por trás de cada tipo de hook. Vai além da lista de templates — explica POR QUE cada gatilho funciona, com referências (Cialdini, Kahneman, Zeigarnik Effect, etc.)

**Conteúdo:**
- Os 6 princípios de Cialdini aplicados a vídeo curto (reciprocidade, escassez, autoridade, consistência, simpatia, prova social)
- Efeito Zeigarnik (loops abertos) — por que o cérebro PRECISA fechar o gap
- Loss aversion de Kahneman — perda pesa 2x mais que ganho
- Dopamine loops — como micro-recompensas mantêm atenção
- Pattern interrupt neuroscience — piloto automático vs. atenção consciente
- Identity triggers — conteúdo que fala sobre "quem eu sou" vs. "o que eu sei"
- Como combinar 2-3 gatilhos no mesmo hook (combinação = potência)

**Por que universal:** Neurociência e psicologia não mudam por plataforma.

---

### 3. `video-storytelling-frameworks.md`
**O que é:** Frameworks de narrativa adaptados para vídeo curto. Diferente dos frameworks de copy (AIDA, PAS) que são para texto, estes são para FLUXO VISUAL + VERBAL.

**Conteúdo:**
- **Hook → Tension → Resolution** (HTR): O mais simples. 3 atos em 15-60 segundos.
- **Promise → Proof → Payoff** (PPP): Para conteúdo educativo. "Vou te mostrar X" → demonstra → entrega.
- **Before → After → Bridge** (BAB visual): Cenário ruim → cenário bom → como chegar lá. Funciona muito bem em split-screen.
- **Curiosity Stack**: Abre um loop → responde parcialmente → abre OUTRO loop → responde o primeiro. Mantém atenção em vídeos mais longos (45-90s).
- **Cold Open**: Começa pelo momento mais impactante, volta ao início, e reconstrói até aquele ponto.
- **POV Narrative**: "POV: você é o [persona] e [cenário]". Identificação imediata.
- **The List Build**: "5 coisas que..." — cada item é um mini-hook dentro do vídeo.

**Para cada framework:** Diagrama de tempo (quais segundos para cada seção), exemplo de script real, e indicação de qual plataforma performa melhor.

---

### 4. `retention-techniques.md`
**O que é:** Técnicas de MANUTENÇÃO de atenção ao longo do vídeo (não apenas o hook inicial). O hook captura nos primeiros 3 segundos, mas o vídeo precisa manter atenção até o final.

**Conteúdo:**
- **Pattern interrupts a cada 3-5 segundos:** Cortes, zoom, B-roll, texto na tela, mudança de ângulo
- **Mid-video hooks** (ganchos no meio): "Mas a parte mais importante vem agora...", "O próximo é o melhor..."
- **Curiosity stacking:** Sempre ter uma pergunta aberta que só fecha no final
- **Visual variety mapping:** Template para planejar mudanças visuais a cada X segundos
- **Pacing rules:** Quando acelerar, quando desacelerar, quando usar silêncio
- **Loop mechanics:** Como criar vídeos "rewatchable" (início que faz sentido após o final)
- **Completion rate optimization:** Técnicas para que o espectador assista até os últimos 3 segundos (onde fica o CTA)

---

### 5. `video-types-catalog.md`
**O que é:** Catálogo de TIPOS de conteúdo em vídeo, organizados por objetivo (educar, entreter, converter, engajar). Cada tipo tem estrutura, duração ideal, e exemplo.

**Tipos mapeados:**
```
Educativos:
├── Tutorial passo-a-passo ("como fazer X")
├── Explicação de conceito ("o que é X e por que importa")
├── Mito vs Realidade
├── Erro Comum ("pare de fazer X")
├── Dica Rápida (1 insight em 15s)
├── Comparativo (X vs Y)
└── Framework/Método (apresentar um sistema)

Engajamento:
├── Pergunta provocativa (gera comentários)
├── Enquete/Quiz (interativo)
├── POV/Cenário identificável
├── Desafio/Trend
├── Reação a conteúdo
├── "Isso ou aquilo?"
└── Completar a frase (hook de interação)

Conversão (BOFU):
├── Demonstração de produto
├── Case/Resultado (antes × depois)
├── Objeção respondida
├── Depoimento/Prova social
├── Behind the scenes (bastidores)
└── "Um dia usando [produto]"

Autoridade:
├── Opinião polêmica (hot take)
├── Análise de tendência
├── Storytelling pessoal
├── Dados surpreendentes
└── Previsão/Tendência futura

Viralização:
├── Trend + nicho (adaptar trend ao seu tema)
├── Absurdo calculado
├── Relatable content (identificação em massa)
├── Satisfying/ASMR visual
└── Dueto/Stitch com conteúdo viral
```

---

### 6. `cta-library.md`
**O que é:** Biblioteca de CTAs otimizados por objetivo e plataforma. O CTA em vídeo é diferente de texto — precisa ser verbal + visual + rápido.

**Organização:**
- CTAs de engajamento (comentar, compartilhar, dueto)
- CTAs de retenção (seguir, ativar sino)
- CTAs de conversão (link na bio, DM, landing page)
- CTAs de salvamento (salvar para depois — altíssimo valor algorítmico)
- CTAs nativos por plataforma (stitch TikTok, remix Reels, etc.)

---

## ARQUIVOS ESPECÍFICOS POR PLATAFORMA

### Skill: `dealflux-tiktok-creator/`

```
dealflux-tiktok-creator/
├── SKILL.md
└── references/
    ├── tiktok-algorithm-rules.md      ← Regras do algoritmo 2026
    ├── tiktok-formats-specs.md        ← Dimensões, durações, limites técnicos
    ├── tiktok-hook-adaptations.md     ← Como adaptar hooks universais para TikTok
    ├── tiktok-trends-framework.md     ← Como identificar e cavalgar trends
    ├── tiktok-script-templates.md     ← Templates de script por tipo de vídeo
    └── tiktok-seo-keywords.md         ← Otimização para busca no TikTok (40% Gen Z usa como buscador)
```

**Detalhamento dos arquivos específicos:**

**`tiktok-algorithm-rules.md`:**
- Fator #1: Watch time (completion rate 70%+ para segunda onda de distribuição)
- Fator #2: Replays (vídeos rewatched recebem 2.8x mais views)
- Fator #3: Shares > saves > comments > likes (ordem de peso)
- Progressão: 200 viewers iniciais → 1K se passar → 10K se passar → viral
- Penalizações: conteúdo duplicado, engagement bait, watermarks de outras plataformas
- SEO: keywords nos primeiros 3 segundos de texto na tela + na fala

**`tiktok-hook-adaptations.md`:**
- Hooks DEVEM funcionar em ≤2 segundos (mais agressivo que Reels/Shorts)
- Tom ultra-casual obrigatório (linguagem de conversa, não de apresentação)
- Visual hooks específicos: zoom in abrupto, objeto inesperado na tela, texto grande
- Audio hooks: sussurro, silêncio seguido de fala alta, som inesperado
- Hooks que performam melhor no TikTok vs. outras plataformas (dados comparativos)

**`tiktok-trends-framework.md`:**
- Como identificar trends cedo (Creative Center, For You analysis)
- Janela de oportunidade: 24-72h para cavalgar um trend antes de saturar
- Framework "Trend + Nicho": pegar o formato trending e aplicar ao seu tema
- Sons trending vs. sons originais (quando usar cada um)
- Quando NÃO cavalgar um trend (desalinhamento com marca)

**`tiktok-script-templates.md`:**
- Template de 15 segundos (hook 2s → conteúdo 10s → CTA 3s)
- Template de 30 segundos (hook 2s → contexto 5s → valor 18s → CTA 5s)
- Template de 60 segundos (hook 2s → contexto 5s → 3 pontos × 15s → CTA 5s)
- Template de 60s+ para Creator Rewards ($0.50-1.00 por 1K views qualificados)
- Marcações de pattern interrupt no script (a cada 3-5 segundos)

---

### Skill: `dealflux-instagram-creator/`

```
dealflux-instagram-creator/
├── SKILL.md
└── references/
    ├── instagram-algorithm-rules.md    ← Regras do algoritmo 2026 por superfície (Feed, Reels, Stories, Explore)
    ├── instagram-formats-specs.md      ← Dimensões e specs (Reels, Carrossel, Stories, Feed)
    ├── instagram-reels-hooks.md        ← Adaptação de hooks para Reels (3 segundos, visual-first)
    ├── instagram-carousel-strategy.md  ← Estratégia de carrosséis (reis do engajamento)
    ├── instagram-stories-tactics.md    ← Uso estratégico de Stories (enquetes, stickers, interação)
    ├── instagram-script-templates.md   ← Scripts por formato (Reels, Carrossel-base, Stories)
    ├── instagram-content-mix.md        ← Mix ideal: 3-4 Reels + 2-3 Carrosséis + 1-2 estáticas/semana
    └── instagram-audio-trends.md       ← Como usar áudios trending + quando usar áudio original
```

**Detalhamento dos arquivos específicos:**

**`instagram-algorithm-rules.md`:**
- Sinal #1 em 2026: Sends (compartilhamentos por DM) > tudo
- Sinal #2: Watch time / completion rate
- Sinal #3: Saves (altíssimo peso para carrosséis)
- Reels: 2x mais alcance de não-seguidores vs. posts estáticos
- Carrosséis: redistribuídos pelo algoritmo se o usuário viu só o 1º slide (2ª chance)
- Penalizações: watermark TikTok, repost sem valor agregado, engagement bait
- Views como métrica primária unificada em 2026

**`instagram-reels-hooks.md`:**
- Hooks DEVEM funcionar em ≤3 segundos (um pouco mais tolerante que TikTok)
- 50% dos espectadores saem nos primeiros 3 segundos — hook é vida ou morte
- Reels com hold rate >60% nos 3 primeiros segundos performam 5-10x mais
- Tom: mais polido que TikTok, mas ainda autêntico. Não pode parecer comercial.
- Kinetic typography (texto em movimento) como substituto de narração para quem assiste mudo (85% dos usuários)
- Lista de hooks visuais específicos do Instagram (close-up, reveal, split-screen)

**`instagram-carousel-strategy.md`:**
- Carrosséis são reis do engajamento e salvamento
- Slide 1 = hook visual (scroll-stopper) — precisa funcionar sozinho
- Regra "1 ideia por slide" — máximo 30 palavras por slide
- Formatos de carrossel: educativo, storytelling, comparativo, checklist, step-by-step
- Integração Reels ↔ Carrossel: como usar Reels para alcance e carrossel para profundidade do mesmo tema
- Quando usar 1080×1350 (portrait, recomendado) vs. 1080×1080 (quadrado)

**`instagram-stories-tactics.md`:**
- Stories não são para alcance — são para RELAÇÃO e PROFUNDIDADE
- Uso de stickers interativos: enquete, pergunta, quiz, slider, countdown
- Stories como ferramenta de pesquisa (perguntar à audiência, validar temas)
- Sequência de stories como "mini-série" (narrative arc em 5-8 frames)
- Frequência ideal: 3-7 stories/dia, mix de foto, texto, video, interativo

---

### Skill: `dealflux-youtube-creator/`

```
dealflux-youtube-creator/
├── SKILL.md
└── references/
    ├── youtube-algorithm-rules.md      ← Regras do algoritmo 2026 (Shorts + Long-form)
    ├── youtube-shorts-specs.md         ← Specs e regras específicas de Shorts
    ├── youtube-longform-structure.md   ← Estrutura de vídeos longos (8-20 min)
    ├── youtube-shorts-hooks.md         ← Adaptação de hooks para Shorts (loop-first)
    ├── youtube-thumbnail-titles.md     ← Títulos e thumbnails (CTR é rei no YouTube)
    ├── youtube-script-templates.md     ← Scripts para Shorts + roteiros para long-form
    ├── youtube-retention-patterns.md   ← Curvas de retenção e como otimizar cada zona
    └── youtube-seo-optimization.md     ← SEO: títulos, tags, descrições, chapters
```

**Detalhamento dos arquivos específicos:**

**`youtube-algorithm-rules.md`:**
- YouTube = interest graph (recomenda por comportamento, não por quem você segue)
- Shorts: completion rate 70%+ como baseline para promoção
- Shorts: 15-30 segundos é sweet spot. Loop infinito = rewatches = boost
- Long-form: 50%+ retention geral é bom. Primeiros 30s decidem tudo.
- Long-form: Click-Through Rate (CTR) do thumbnail é o primeiro filtro
- Shorts e long-form usam algoritmos SEPARADOS — sucesso em Shorts não garante views em long-form

**`youtube-shorts-hooks.md`:**
- Hook em ≤3 segundos (50-60% dos drop-offs acontecem aqui)
- Fórmula 3 camadas simultâneas: visual hook + texto na tela + verbal
- Loops: o vídeo deve parecer que recomeça naturalmente (sem "despedida")
- Educational: direct promises performam melhor ("Aprenda X em 30 segundos")
- Entertainment: pattern interrupts performam melhor (visual inesperado)
- Diferença chave vs. TikTok: YouTube Shorts recompensa rewatches mais agressivamente

**`youtube-longform-structure.md`:**
- Estrutura "Intro → Chapters → Climax → CTA"
- Primeiros 30 segundos: hook + preview do valor + por que assistir até o final
- Chapters/timestamps: facilitam navegação E melhoram SEO
- Retention hooks a cada 2-3 minutos ("Mas o mais importante vem agora...")
- Últimos 20% do vídeo: sinal de qualidade para o algoritmo (quem assiste até aqui = conteúdo bom)
- Pacing: jump cuts, B-roll, gráficos, zoom — variedade a cada 5-8 segundos

**`youtube-thumbnail-titles.md`:**
- CTR é o PRIMEIRO filtro no YouTube — se ninguém clica, ninguém assiste
- Regras de thumbnail: rosto com emoção forte, texto grande (3-4 palavras), contraste alto, curiosity gap visual
- Regras de título: ≤60 caracteres, keyword no início, números específicos, promessa clara
- A/B testing de thumbnails (YouTube permite nativamente)
- Relação título ↔ hook: o título promete, o hook confirma nos primeiros 5 segundos

---

## ARQUIVOS INDIVIDUAIS POR PROJETO (Context Files)

Estes já existem no pipeline e são gerados pelo Setup. As 3 skills de vídeo consultam os mesmos context files que as demais:

| Arquivo | O que as skills de vídeo usam dele |
|---|---|
| `BRAND_VOICE.md` | Tom de voz, vocabulário, nível de formalidade, uso de emojis, tratamento |
| `AUDIENCE_PROFILES.md` | Linguagem da persona, dores, nível de consciência, objeções, gatilhos emocionais |
| `PRODUCT_CONTEXT.md` | Features para demonstrar, diferenciais, proposta de valor |
| `VISUAL_IDENTITY.md` | Cores, fontes, mood visual (para texto na tela, overlays, thumbnails) |
| `CONTENT_PILLARS.md` | Pilares temáticos e mix de funil |
| `PLATFORM_SPECS.md` | Specs técnicas da plataforma específica |
| `HOOK_LIBRARY.md` | Hooks que já performaram (feedback loop) |
| `COMPETITOR_MAP.md` | O que concorrentes fazem em vídeo (formatos, frequência, gaps) |

### Context files NOVOS sugeridos (específicos para vídeo):

**`VIDEO_BRAND_GUIDE.md`** (gerado no Setup como extensão do Bloco 3 ou como Bloco 8 novo)
- Estilo de edição preferido (cortes rápidos vs. planos longos)
- Cenário/background padrão
- Elementos visuais recorrentes (logo overlay, lower third, transições)
- Música/vibe sonora preferida (energético, chill, épico, minimalista)
- Formato de texto na tela (fonte, cor, posição, animação)
- Se a marca faz vídeo com rosto ou faceless
- Referências de canais/criadores que admira (estilo, não conteúdo)

---

## RESUMO: O QUE CRIAR

### Universais (6 arquivos):
1. `hooks-masterlist.md` — 80-100 templates por gatilho psicológico
2. `psychology-triggers-deep.md` — Cialdini, Kahneman, Zeigarnik, dopamine loops
3. `video-storytelling-frameworks.md` — HTR, PPP, BAB visual, Curiosity Stack, Cold Open, POV, List Build
4. `retention-techniques.md` — Pattern interrupts, mid-video hooks, pacing, loops
5. `video-types-catalog.md` — 25+ tipos de vídeo por objetivo (educar, engajar, converter, viralizar)
6. `cta-library.md` — CTAs por objetivo e plataforma

### TikTok (6 arquivos):
1. `tiktok-algorithm-rules.md`
2. `tiktok-formats-specs.md`
3. `tiktok-hook-adaptations.md`
4. `tiktok-trends-framework.md`
5. `tiktok-script-templates.md`
6. `tiktok-seo-keywords.md`

### Instagram (8 arquivos):
1. `instagram-algorithm-rules.md`
2. `instagram-formats-specs.md`
3. `instagram-reels-hooks.md`
4. `instagram-carousel-strategy.md`
5. `instagram-stories-tactics.md`
6. `instagram-script-templates.md`
7. `instagram-content-mix.md`
8. `instagram-audio-trends.md`

### YouTube (8 arquivos):
1. `youtube-algorithm-rules.md`
2. `youtube-shorts-specs.md`
3. `youtube-longform-structure.md`
4. `youtube-shorts-hooks.md`
5. `youtube-thumbnail-titles.md`
6. `youtube-script-templates.md`
7. `youtube-retention-patterns.md`
8. `youtube-seo-optimization.md`

### Context file novo por projeto (1 arquivo):
1. `VIDEO_BRAND_GUIDE.md` — estilo visual, edição, som, cenário da marca

**Total: 29 arquivos de referência + 3 SKILL.md + 1 context file novo = 33 arquivos**
