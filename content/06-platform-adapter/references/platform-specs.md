# Especificações Técnicas por Plataforma

> Referência de specs técnicas, boas práticas, decisão de formato e estratégia de hashtag por plataforma.
> Consulte ao adaptar qualquer conteúdo para uma plataforma específica.
> Para as configurações específicas da marca, verificar o context file `PLATFORM_SPECS.md`.

---

## Matriz de Decisão Rápida

| Se o conteúdo tem... | Melhor formato | Plataforma |
|---|---|---|
| Lista de N itens (3+) | Carrossel | LinkedIn, Instagram |
| Dado chocante + argumento | Thread ou post longo | Twitter, LinkedIn |
| Narrativa / história pessoal | Reels / TikTok + post | Instagram, TikTok |
| Instrução passo a passo | Carrossel ou artigo | LinkedIn, Blog |
| Opinião contrarian | Thread ou post LinkedIn | Twitter, LinkedIn |
| Transformação antes/depois | Reels / carrossel | Instagram, LinkedIn |
| Conteúdo educativo profundo | Artigo ou vídeo longo | Blog, YouTube |
| Dado de mercado + análise | Post LinkedIn + infográfico | LinkedIn |

---

## LinkedIn

### Specs técnicas

| Formato | Dimensão | Limite | Notas |
|---|---|---|---|
| **Carrossel PDF** | 1080×1080 (quadrado) ou 1080×1350 (portrait) | Máx 300 slides; recomendado 8–12 | Formato PDF; cada slide = 1 página |
| **Imagem única** | 1200×627 (landscape) ou 1080×1080 | 1 imagem | Aparece completa no feed sem click |
| **Vídeo nativo** | 1920×1080 (landscape) ou 1080×1920 (portrait) | 3s a 10min | Auto-play sem som; legendas obrigatórias |
| **Post texto** | — | ~3.000 caracteres | Primeiras ~2 linhas visíveis antes do "ver mais" |

### Zona de truncamento

LinkedIn trunca o post na linha 2–3 (aproximadamente 150–200 caracteres). As primeiras 2 linhas decidem se o leitor clica em "ver mais". Regra: o hook deve estar completo antes da quebra. A quebra de linha após o hook é estratégica — força o "ver mais" e sinaliza que há mais conteúdo.

### Boas práticas

- Carrossel PDF gera ~196% mais engajamento que vídeo nativo no LinkedIn
- Dados, frameworks e listas acionáveis performam melhor que conteúdo motivacional vago
- Parágrafos de máximo 3 linhas; linha em branco entre parágrafos
- Negrito para dados e termos centrais (máximo 3–4 usos por post)
- Links no corpo prejudicam o alcance orgânico — mencionar "link nos comentários" ou "link na bio"
- CTA na última linha, sem parágrafo extra após ele

### Hashtags

- Quantidade: 3–5
- Estratégia: temáticas do nicho, não palavras populares genéricas
- Posição: no final do post, após o CTA
- Evitar: colocar hashtags no meio do texto (quebra o fluxo de leitura)

### Horários sugeridos (Brasil)

Terça a quinta, 8h–10h e 17h–18h. Segunda e sexta têm desempenho menor.

---

## Instagram Feed (Carrossel)

### Specs técnicas

| Formato | Dimensão | Limite | Notas |
|---|---|---|---|
| **Carrossel** | 1080×1350 (portrait, recomendado) ou 1080×1080 | Máx 10 slides | O algoritmo favorece slides que geram swipe |
| **Imagem única** | 1080×1350 ou 1080×1080 | 1 imagem | Aparece completa no feed |
| **Caption** | — | Máx 2.200 caracteres | ~3–4 linhas visíveis antes do "mais" |

### Estrutura de caption

```
[Hook — 1-2 linhas visíveis antes do "mais"] 
.
.
[Corpo — máx 300 palavras]
.
.
[CTA — 1 linha]
.
.
.
#hashtag1 #hashtag2 #hashtag3 [...]
```

Usar múltiplas linhas em branco (ou pontos) para empurrar as hashtags para fora da área visível da caption.

### Boas práticas

- Slide 1 (capa): texto com máx 6–7 palavras em fonte grande; visual que para o scroll
- Slides 2–N: uma ideia por slide; máx 20–25 palavras; dado ou elemento visual em pelo menos 1 slide
- Último slide: CTA visual + convite a salvar ou seguir
- Independência de slide: cada slide deve ser compreensível fora do contexto do carrossel
- CTA "salvar" é o mais valioso para o algoritmo do Instagram (mais do que likes)

### Hashtags

- Quantidade: 15–20
- Mix: 5 hashtags de nicho específico (5K–50K posts) + 5 de nicho médio (50K–500K) + 5 broad (500K+) + 1–2 da marca
- Posição: no final da caption, separadas do corpo por linhas em branco
- Evitar: hashtags genéricas (#motivation, #success) sem relação com o nicho

### Horários sugeridos (Brasil)

Terça a sexta, 11h–13h e 18h–20h. Sábado de manhã também funciona para nichos B2C.

---

## Instagram Reels

### Specs técnicas

| Formato | Dimensão | Duração ideal | Notas |
|---|---|---|---|
| **Reels** | 1080×1920 (9:16) | 30–60 segundos | 90s possível, mas atenção cai significativamente após 60s |
| **Cover (capa)** | 1080×1920 | — | Aparece no feed de perfil — deve ser atraente fora do contexto do vídeo |

### Estrutura de script por duração

| Bloco | 30s | 60s | 90s |
|---|---|---|---|
| Hook verbal | 0–3s | 0–3s | 0–3s |
| Contexto | 3–8s | 3–10s | 3–12s |
| Conteúdo principal | 8–22s | 10–45s | 12–70s |
| CTA | 22–30s | 45–60s | 70–90s |

### Boas práticas

- Hook nos primeiros 3 segundos: dado, pergunta ou afirmação contrarian dita diretamente para a câmera
- Legenda (CC) obrigatória — 60–80% dos usuários assiste sem som
- Ritmo rápido; cortes a cada 2–4 segundos
- Sugerir b-roll ou visual para cada bloco do script (o que aparece na tela durante cada fala)
- Música trending pode ampliar distribuição — anotar "verificar trending sounds na semana de publicação"

### Hashtags

- Quantidade: 15–20 (mesma lógica do feed)
- Posição: na caption

### Horários sugeridos (Brasil)

Qualquer dia, 12h–14h e 19h–22h. Reels têm janela de distribuição mais longa que posts de feed.

---

## TikTok

### Specs técnicas

| Formato | Dimensão | Duração ideal | Notas |
|---|---|---|---|
| **Vídeo** | 1080×1920 (9:16) | 15–60 segundos | 3min possível, mas 15–60s tem melhor completion rate |
| **Carrossel TikTok** | 1080×1350 ou 1080×1920 | Máx 35 slides | Alternativa ao vídeo para conteúdo de lista |

### Estrutura de script por duração

| Bloco | 15s | 30s | 60s |
|---|---|---|---|
| Hook (visual + verbal) | 0–2s | 0–2s | 0–2s |
| Contexto | — | 2–8s | 2–10s |
| Conteúdo | 2–12s | 8–25s | 10–48s |
| CTA | 12–15s | 25–30s | 48–60s |

### Boas práticas

- Hook nos primeiros 2 segundos: pattern interrupt visual + verbal simultâneos
- Tom ultra-casual; como falando com um amigo; humor bem-vindo se coerente com BRAND_VOICE
- Frases de 5–8 palavras; cortes frequentes; evitar parágrafos longos
- Autenticidade supera produção polida — iluminação básica e câmera boa são suficientes
- Completion rate é a métrica mais importante para o algoritmo TikTok; vídeos curtos têm maior chance de completion
- Anotar: "verificar trending sounds e desafios na semana de publicação"

### Hashtags

- Quantidade: 3–5
- #fyp não tem mais impacto relevante no algoritmo
- Usar hashtags de nicho específico + 1–2 broad

### Horários sugeridos (Brasil)

Qualquer dia, 19h–22h. TikTok tem distribuição global — horário de Brasil pode não ser o fator mais crítico.

---

## X / Twitter

### Specs técnicas

| Formato | Limite | Notas |
|---|---|---|
| **Tweet único** | 280 caracteres | Com imagem ou vídeo, mesmos 280 caracteres |
| **Thread** | 280 caracteres/tweet | Recomendado 5–10 tweets; mais de 15 perde atenção |
| **Imagem** | 1600×900 (16:9) ou 1080×1080 | Máx 4 imagens por tweet |
| **Vídeo** | Máx 2min20s | 1280×720 mínimo |

### Estrutura de thread

```
T1 — Hook puro (deve funcionar completamente sozinho)
T2 — "Deixa eu te mostrar por quê..." (contexto)
T3 — Ponto 1 (máx 240 caracteres)
T4 — Ponto 2
T5 — Ponto 3
[...]
T(N-1) — Insight central ou virada
T(N) — CTA + convite a seguir ou RT
```

**Regra:** o T1 é o único tweet que aparece no feed de quem não segue. Deve funcionar como post independente, sem depender de T2+.

### Boas práticas

- Tom: direto, opinionado, assertivo — hedging ("pode ser que", "talvez") reduz engajamento
- Afirmações fortes e contrarian performam melhor no Twitter do que em outras plataformas
- Máx 240 caracteres por tweet de thread (reservar 40 para [N/N] numeração se usar)
- Hashtags: 1–2, integradas ao texto; nunca colar 5 hashtags no final do tweet

### Horários sugeridos (Brasil)

Segunda a sexta, 8h–11h e 18h–20h.

---

## YouTube (Vídeo Longo)

### Specs técnicas

| Elemento | Spec | Notas |
|---|---|---|
| **Vídeo** | 1920×1080 (16:9) | Mínimo 720p para qualidade |
| **Thumbnail** | 1280×720 (16:9) | JPG/PNG; máx 2MB; texto legível em miniatura |
| **Título** | 50–60 caracteres | Palavra-chave + número ou promessa; mais longo é cortado na busca |
| **Descrição** | 150–300 palavras úteis | Palavra-chave no primeiro parágrafo; links; capítulos |
| **Tags** | 10–15 | Variações da keyword principal |

### Estrutura de script (5–15min)

```
[INTRO 30–60s] Hook → sobre o que é o vídeo → CTA antecipado (like/inscrito)
[CAPÍTULO 1 - 2min] Contexto e por que isso importa agora
[CAPÍTULO 2 - 3–5min] Desenvolvimento principal com exemplos
[CAPÍTULO 3 - 2–3min] Como aplicar / passo a passo
[CONCLUSÃO 30–60s] Resumo → insight central → CTA (link, playlist, inscrição)
```

### Boas práticas

- Os primeiros 30 segundos decidem se o espectador fica — entregar o hook rápido, antes de qualquer apresentação longa
- Capítulos (timestamps na descrição) melhoram SEO e UX — sugerir timestamps no script
- Thumbnail: texto de 3–5 palavras + elemento visual; deve gerar curiosidade como mini-post
- Descrição: tratar como mini-artigo de blog; palavra-chave no primeiro parágrafo
- CTA antecipado: pedir like/inscrição 30–60s antes do final (quando o espectador já entendeu o valor)

### Hashtags

- 3–5 na descrição (aparecem abaixo do título no mobile)

---

## YouTube Shorts

### Specs técnicas

| Elemento | Spec | Notas |
|---|---|---|
| **Vídeo** | 1080×1920 (9:16) | Duração máxima: 60 segundos |
| **Título** | 50–60 caracteres | Funciona como headline; keyword importante |

### Estrutura de script (até 60s)

```
[0–3s] Hook verbal direto — sem intro
[3–10s] Contexto em 1–2 frases
[10–50s] Conteúdo denso — 3–5 pontos rápidos ou 1 demonstração
[50–60s] CTA + convite ao canal principal
```

### Boas práticas

- Sem intro longa — Shorts não tem paciência para "olá, meu nome é..."
- Texto na região segura: evitar bordas (10% superior e inferior podem ser cortados na UI)
- Cada Short pode ser porta de entrada para o canal — incluir CTA para playlist ou vídeo longo relacionado

---

## Blog / Artigo

### Specs técnicas

| Elemento | Spec | Notas |
|---|---|---|
| **Comprimento** | 800–2.000 palavras | Mínimo 600 para SEO básico; mais que 2.000 apenas para conteúdo pilar |
| **Imagem destaque** | 1200×630 | OG image para compartilhamento social |
| **Título** | 50–60 caracteres | Com palavra-chave principal |
| **Meta description** | 150–160 caracteres | Keyword + benefício + verbo de ação |
| **URL** | — | Amigável; com keyword; sem stop words desnecessárias |

### Estrutura de artigo

```
[TÍTULO com keyword]
[META DESCRIPTION 150-160 chars]

[INTRO — primeiras 100 palavras]
Hook + contexto + o que o leitor vai aprender

[H2 — Contexto ou Problema]
[2–3 parágrafos]

[H2 — Desenvolvimento Principal]
  [H3 — Subponto 1]
  [H3 — Subponto 2]
[3–5 parágrafos; exemplo concreto]

[H2 — Como Aplicar / Passo a Passo]
[Lista ou parágrafos curtos]

[H2 — Conclusão]
[Síntese + insight central + CTA]
```

### Boas práticas de SEO básico

- Palavra-chave no título, primeiro parágrafo e pelo menos 1 H2
- Parágrafos de máximo 5 linhas; H2 a cada 200–300 palavras
- Links: 1–2 internos (outros artigos do blog) + 1–2 externos (fontes citadas, abre em nova aba)
- Dados com fonte linkada (aumenta autoridade e confiabilidade)
- CTA no meio do artigo (após primeiro H2) e no final
- Alt text em imagens: descrever o que a imagem mostra

### Horário de publicação

Terça a quinta, 8h–10h (para nichos B2B). Para B2C, fins de semana também funcionam.
