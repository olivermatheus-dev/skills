# Section Renderers — `/company-preview`

Especificação de como transformar cada tipo de arquivo markdown em uma `<section>` HTML estruturada. **NÃO é dump do MD bruto** — cada campo vai para um componente visual específico.

Ordem de renderização segue a ordem da sidebar.

---

## 1. Section `#overview` — Hero da empresa

**Fontes:** `SETUP_STATE.md` + `context/COMPANY_PROFILE.md`

**Campos a extrair:**
- `COMPANY_PROFILE > 1. Identidade > Nome` → `<h1>`
- `COMPANY_PROFILE > 1. Identidade > Slogan` → `<p class="tagline">`
- `COMPANY_PROFILE > 1. Identidade > Setor / Nicho` → badge
- `COMPANY_PROFILE > 3. Posicionamento > Missão` → blockquote ou paragraph destacado
- `COMPANY_PROFILE > 2. Mercado > Estágio do negócio` → kv
- `COMPANY_PROFILE > 2. Mercado > Modelo de negócio` → kv
- `COMPANY_PROFILE > 1. Identidade > Fundação` → kv
- `COMPANY_PROFILE > 1. Identidade > Tamanho da operação` → kv
- `COMPANY_PROFILE > 4. Presença > Canais` (tabela) → renderizar cada canal como chip
- `SETUP_STATE > Progresso` → progress bar visual (X/8 blocos completos)

**HTML aproximado:**
```html
<section id="overview">
  <div class="hero">
    <span class="badge">{{Setor}}</span>
    <h1>{{Nome}}</h1>
    <p class="tagline">{{Slogan}}</p>
    <blockquote class="hero-quote">{{Missão}}</blockquote>
  </div>
  <div class="grid grid-2">
    <dl class="kv">
      <dt>Modelo</dt><dd>{{Modelo de negócio}}</dd>
      <dt>Estágio</dt><dd>{{Estágio}}</dd>
      <dt>Fundação</dt><dd>{{Fundação}}</dd>
      <dt>Tamanho</dt><dd>{{Tamanho}}</dd>
    </dl>
    <div>
      <h4>Canais ativos</h4>
      <div class="chips">
        {{Para cada canal ativo: <span class="chip">{{Canal}}</span>}}
      </div>
    </div>
  </div>
</section>
```

---

## 2. Section `#produto` — Product Context

**Fonte:** `context/PRODUCT_CONTEXT.md`

**Campos:**
- `Tipo de Produto > Categoria` → badge
- `O que é (descrição informal)` → paragraph destacado
- `Proposta de valor em uma frase` → `blockquote.hero-quote`
- `Módulos / Funcionalidades principais` (lista numerada) → grid de cards (1 card por feature)
- `Diferenciais competitivos` → lista com bullets
- `Detalhes comerciais > Faixa de preço` + `Modelo` → card destacado de preço
- `Objeção principal pré-compra` → blockquote (fonte da persona)
- `Prova social disponível` → lista com badges
- `Anti-persona` → card com `.chip.negative`
- `Limitações do produto` → lista em tom neutro/secundário

**HTML aproximado:**
```html
<section id="produto">
  <h2>Produto</h2>
  <span class="badge">{{Categoria}}</span>
  <p>{{Descrição informal}}</p>
  <blockquote class="hero-quote">{{Proposta de valor}}</blockquote>

  <h3>Funcionalidades principais</h3>
  <div class="grid grid-2">
    {{Para cada feature: <div class="card"><h4>{{Nome}}</h4><p>{{O que faz}}</p></div>}}
  </div>

  <h3>Diferenciais</h3>
  <ul>{{lista de diferenciais}}</ul>

  <h3>Detalhes comerciais</h3>
  <div class="card">
    <dl class="kv">
      <dt>Faixa de preço</dt><dd>{{Faixa}}</dd>
      <dt>Modelo</dt><dd>{{Modelo}}</dd>
      <dt>Time-to-value</dt><dd>{{Time-to-value}}</dd>
    </dl>
  </div>

  <h3>Anti-persona</h3>
  <p>{{Anti-persona em voz da marca}}</p>

  <h3>Limitações</h3>
  <ul class="muted">{{Limitações}}</ul>
</section>
```

---

## 3. Section `#personas` — Audience

**Fontes:** `context/AUDIENCE_PROFILES.md` + todos os `audiences/AUDIENCE_*.md`

**Estrutura:** 1 `<details>` (accordion) por persona encontrada. Aberto por default se há só 1 persona.

**Por persona, extrair:**
- Nome arquétipo (do `audiences/AUDIENCE_*.md > Persona > Nome arquétipo`)
- Faixa etária + Geração
- Cargo/Função + Tipo de empresa
- `5 Rings of Buying Insight` → sub-accordion ou blockquotes
- `Dores em 3 Camadas` → 3 blockquotes com labels "Superficial / Profunda / Medo"
- `Desejos` → 3 cards (Declarado / Real / Identidade)
- `O Que Já Tentou` → tabela
- `Linguagem e Comunicação > Palavras que ela usa` → chips
- `Linguagem > Palavras que a afastam` → chips negativas
- Síntese Executiva → kv

**HTML aproximado:**
```html
<section id="personas">
  <h2>Personas</h2>
  {{Para cada persona:}}
  <details {{open se 1 persona só}}>
    <summary>{{Nome arquétipo}} · {{Cargo}}</summary>
    <div class="grid grid-2">
      <dl class="kv">
        <dt>Idade</dt><dd>{{Faixa etária}}</dd>
        <dt>Cargo</dt><dd>{{Cargo}}</dd>
        <dt>Empresa</dt><dd>{{Tipo de empresa}}</dd>
      </dl>
      <div>
        <h4>Palavras que ela usa</h4>
        <div class="chips">{{chips}}</div>
        <h4>Palavras que a afastam</h4>
        <div class="chips">{{chips.negative}}</div>
      </div>
    </div>

    <h4>5 Rings of Buying Insight</h4>
    <blockquote><strong>Gatilho:</strong> {{Ring 1}}</blockquote>
    <blockquote><strong>Sucesso:</strong> {{Ring 2}}</blockquote>
    <blockquote><strong>Barreira:</strong> {{Ring 3}}</blockquote>
    <blockquote><strong>Jornada:</strong> {{Ring 4}}</blockquote>
    <blockquote><strong>Decisão:</strong> {{Ring 5}}</blockquote>

    <h4>Dores em 3 Camadas</h4>
    <div class="grid grid-3">
      <div class="card"><h4>Superficial</h4><blockquote>{{Camada 1}}</blockquote></div>
      <div class="card"><h4>Profunda</h4><blockquote>{{Camada 2}}</blockquote></div>
      <div class="card"><h4>Medo Oculto</h4><blockquote>{{Camada 3}}</blockquote></div>
    </div>

    <h4>Desejos</h4>
    <div class="grid grid-3">
      <div class="card"><h4>Declarado</h4><p>{{Desejo declarado}}</p></div>
      <div class="card"><h4>Real</h4><p>{{Desejo real}}</p></div>
      <div class="card"><h4>Identidade</h4><p>{{Desejo de identidade}}</p></div>
    </div>
  </details>
  {{endfor}}
</section>
```

---

## 4. Section `#brand-voice` — Brand Voice

**Fonte:** `context/BRAND_VOICE.md`

**Campos:**
- `Personalidade em uma frase` → blockquote destacado
- `O que NÃO somos` → lista com `.chip.negative`
- `Espectros de Tom` (4 escalas 1-5) → renderizar como **sliders visuais** usando `.spectrum`
- `Vocabulário da Marca > amamos` → chips
- `Vocabulário > proibidas` → chips negativas
- `Regras de Estilo` → kv
- `Exemplos Referência ✅ / ❌` → 2 blockquotes (um "soa como" em `--success`, outro "não soa" em `--danger`)
- `Variações por Contexto` → tabela

**Renderização dos espectros — exemplo:**
```html
<div class="spectrum">
  <div class="spectrum-label">
    <span>Formal</span>
    <span>Casual</span>
  </div>
  <div class="spectrum-track">
    <div class="spectrum-marker" style="left: 60%"></div>
  </div>
  <p class="spectrum-value">3/5</p>
</div>
```
O `left:` é calculado: `nota ∈ {1,2,3,4,5}` → `left: (nota - 1) * 25%`. Ex: nota 2 → left: 25%.

---

## 5. Section `#concorrentes` — Competitor Map

**Fonte:** `context/COMPETITOR_MAP.md`

**Campos:**
- `Concorrentes Diretos` → 1 card por concorrente com nome, site, posicionamento (badge), pontos fortes/fracos
- `Matriz de Posicionamento Competitivo` → tabela
- `Gaps de Conteúdo Identificados` → lista numerada com cards
- `Vantagens Competitivas para Conteúdo` → cards destacados
- `Empresas Referência (inspiração)` → chips

---

## 6. Section `#pilares` — Content Pillars

**Fonte:** `context/CONTENT_PILLARS.md`

**Campos:**
- `Estratégia > Frequência, Plataformas, Mix de funil` → kv no topo
- `Pilares > Pilar 1, 2, 3` → 1 card por pilar com:
  - Nome (h4)
  - Peso no mix (badge ou barra visual)
  - Cobre, Dor endereça, Persona, Formatos → kv
  - Exemplos de temas → lista
- `Temas Sazonais / Datas Relevantes` → tabela
- `Regras de Distribuição` → lista

---

## 7. Section `#identidade-visual` — Visual Identity

**Fonte:** `context/VISUAL_IDENTITY.md`

**Campos:**
- `Tipografia > Fonte primária + mono` → font samples (com `.font-sample`)
- `Paleta — Brand` → swatches (brand, subtle, accent)
- `Paleta — Neutros (Dark ou Light)` → swatches
- `Paleta — Semânticas` → swatches
- `Bordas + Sombras` → exemplos visuais
- `Modo e Mood` → badges descritivos

**Swatch HTML:**
```html
<div class="swatch" title="Clique para copiar">
  <div class="swatch-color" style="background: #7C5CFF"></div>
  <div class="swatch-meta">
    <span class="swatch-name">brand</span>
    <span class="swatch-hex">#7C5CFF</span>
  </div>
</div>
```

**Font sample HTML:**
```html
<div class="font-sample">
  <div class="font-sample-name">Primária · Inter</div>
  <p class="font-sample-text" style="font-family: 'Inter', sans-serif;">Aa Bb Cc 123</p>
</div>
```

---

## 8. Section `#plataformas` — Platform Specs

**Fonte:** `context/PLATFORM_SPECS.md`

Renderizar cada plataforma como um card. Campos típicos: dimensões canônicas, boas práticas, tom específico.

---

## 9. Section `#copy-foundation` — Copy Foundation

**Fonte:** `context/copy/*.md` (7 artefatos + INDEX)

**Estrutura:** um `<details>` por artefato, com rendering específico:

### BIG_IDEA.md
- `Promessa Central` → `blockquote.hero-quote`
- `Variações Testáveis` (3 variações) → lista numerada
- `Anatomia` → kv
- `Quando usar / Quando NÃO usar` → 2 cards side-by-side

### UNIQUE_MECHANISM.md
- `Nome do Mechanism` → `<h3>` em destaque
- `Metáfora Proprietária` → blockquote
- `O que é (narrativa)` → paragraph
- `Prova de que é único` → lista com badges

### MECHANISM_OF_FAILURE.md
- `O Vilão — em uma frase` → blockquote destacado (vermelho suave)
- `As 3 formas de falhar` → 3 cards com `.chip.negative` por falha
- `Narrativa de storytelling` → `<pre>` com texto formatado
- Como Mechanism derrota → lista

### OBJECTIONS.md
- 5 universais → 5 details (accordions) com verbalização (blockquote) + resposta curta (card success) + longa (paragraph)
- `Ordem de peso para a persona` → badge numerado

### VALUE_STACK.md
- `Custo da Inação` → card vermelho/warning com kv
- `Stack de Valor` → tabela com total destacado
- `3 Âncoras de preço` → 3 cards side-by-side

### PROOF_HIERARCHY.md
- 5 tiers → 5 cards com badge Tier 1-5 (Tier 1 em destaque visual)
- `Matriz: qual tier usar em qual contexto` → tabela
- `Gaps a preencher` → lista com `.chip.warning`

### CTA_LIBRARY.md
- 5 níveis → 5 seções com 3 CTAs cada em cards
- `CTAs por Plataforma` → tabela

---

## 10. Section `#conteudo-produzido` — Content Production

**Fonte:** listar subpastas de `contents/`

Cada peça é 1 card com:
- Nome da pasta (ex: "2026-04-16-custo-flakiness-scaleups")
- Data extraída do slug
- Se existe `WORKFLOW_STATE.md` dentro, mostrar status do pipeline (% completude visual)
- Link (relativo) para abrir a pasta

Se `contents/` tem `OUTPUT_CALENDAR_*.md` soltos, listar separado como "Calendários editoriais".

---

## 11. Section `#metadata` (footer) — Status técnico

**Fontes:** `SETUP_STATE.md` + `context/copy/COPY_SESSION_STATE.md` (se existir)

Renderizar como footer compacto:
- Data de geração do preview
- Status dos setups (progresso dos 7 blocos)
- Status da copy foundation (draft/approved por artefato)
- Arquivos totais
- Versão do preview (se regeneração)

---

## Ordem de sidebar — exemplo gerado

```html
<nav class="sidebar-nav">
  <a href="#overview">Visão geral</a>
  <a href="#produto">Produto</a>
  <a href="#personas">Personas</a>
  <a href="#brand-voice">Tom de voz</a>
  <a href="#concorrentes">Concorrentes</a>
  <a href="#pilares">Pilares</a>
  <a href="#identidade-visual">Identidade visual</a>
  <a href="#plataformas">Plataformas</a>
  <a href="#copy-foundation">Copy foundation</a>
  <a href="#conteudo-produzido">Conteúdo produzido</a>
  <a href="#metadata">Metadata</a>
</nav>
```

Só links para sections com dados. Se empresa não tem VISUAL_IDENTITY.md, a sidebar não mostra "Identidade visual" e o main não renderiza aquela section.

---

## Footer note (quando há sections ausentes)

```html
<footer class="main-footer">
  <p><strong>Sections ausentes:</strong> Pilares de conteúdo, Identidade visual, Plataformas. Para completar, rode <code>/setup-briefing {{slug}}</code>.</p>
  <p class="small">Preview gerado em {{data}} · <code>/company-preview {{slug}}</code></p>
</footer>
```

Quando todas as sections estão presentes, footer é só a linha de metadata.

---

## Regras gerais de renderização

1. **Escape HTML entities** em conteúdo de texto (markdown pode ter `<`, `>`, `&` legítimos). Usar HTML entity encoding nos valores extraídos.
2. **Listas markdown `-` ou `*`** → `<ul><li>`
3. **Tabelas markdown `| col |`** → `<table>` com `<thead>`/`<tbody>`
4. **Blocos code com ```** → `<pre><code>`
5. **Inline code com `texto`** → `<code>`
6. **Bold `**texto**`** → `<strong>`
7. **Italic `*texto*`** → `<em>`
8. **Headings `##` dentro de arquivos MD** → usar `<h3>` ou `<h4>` para não competir com o h2 da section
9. **Citações `> texto`** → `<blockquote>` (ou `.hero-quote` se campo especial)
10. **Campos `[pendente]` ou `[a refinar]`** → renderizar como `.chip.warning` em vez de texto puro (chama atenção)
