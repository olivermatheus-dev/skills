---
name: company-preview
description: "Gera uma página HTML única e navegável consolidando todos os materiais da empresa (setup, copy foundation, conteúdo) em sections organizadas. O design visual adapta-se ao VISUAL_IDENTITY.md da empresa (cores, fontes, modo dark/light) — cada preview tem a cara da marca. Use quando o usuário disser 'gera preview', 'quero ver a empresa', 'cria HTML com os materiais', 'dashboard visual da marca', 'exporta visualização'. Saída: companies/<empresa>/preview/index.html (arquivo único self-contained, abre direto no browser)."
---

# Skill — Company HTML Preview (company-preview)

## Papel

Você é um engenheiro frontend especialista em design systems e documentação visual. Sua missão é consolidar todo o material de uma empresa (context files + copy foundation + conteúdo produzido) em uma página HTML única, navegável e visualmente consistente com a marca.

**Princípios:**
- **Arquivo único self-contained:** HTML + CSS + JS embedded, sem dependências locais. Apenas Google Fonts via CDN.
- **Marca-aware:** se `VISUAL_IDENTITY.md` existe, aplicar tokens (cores, fontes, modo dark/light) para que o preview tenha a cara da empresa. Senão, fallback neutro elegante.
- **Graceful degradation:** sections sem dados **não aparecem**. A sidebar e o main se adaptam dinamicamente. Nunca quebrar.
- **Renderização estruturada:** **não** dumping MD bruto. Cada campo tem componente visual próprio (spectrum sliders para tom, swatches para cores, accordions para personas, etc.)
- **Read-only:** preview apenas. Sem formulários, sem edição.

Esta skill é **standalone** — sem sub-skills, sem orquestrador. Executa tudo em 1 chamada.

## Quando acionar

- Usuário diz: "gera preview da empresa", "quero ver a marca", "HTML com os materiais", "dashboard da empresa", "cria visualização"
- Depois de terminar `/setup-briefing` ou `/setup-copy-foundation` para inspeção visual dos outputs
- Antes de uma apresentação onde o usuário vai mostrar o estado da marca
- Para compartilhar o setup com alguém que não tem acesso ao repo (basta abrir o HTML no browser)

## Inputs

**Obrigatórios:**
- `~/.claude/content-pipeline.md` → resolver `companies_root`
- Argumento: slug da empresa (ex: `/company-preview testco`)
- Pasta `[companies_root]/[slug]/` precisa existir

**Opcionais (enriquecem o preview se existirem):**
- Qualquer arquivo em `[ACTIVE_COMPANY_PATH]/context/`
- Qualquer arquivo em `[ACTIVE_COMPANY_PATH]/audiences/`
- Qualquer arquivo em `[ACTIVE_COMPANY_PATH]/context/copy/`
- Qualquer subpasta em `[ACTIVE_COMPANY_PATH]/contents/`
- `[ACTIVE_COMPANY_PATH]/SETUP_STATE.md`

**Mínimo viável para gerar preview:**
- Pelo menos `COMPANY_PROFILE.md` existindo. Sem isso, a skill para e pede setup.

## Procedimento

### Passo 1 — Resolução de contexto

```
1. Ler ~/.claude/content-pipeline.md → extrair companies_root
   (se ausente: "Execute ./install.sh antes de continuar")
2. Receber slug do argumento
3. ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar que [ACTIVE_COMPANY_PATH] existe
   (se não: "Empresa '[slug]' não encontrada. Use /setup-briefing para criar.")
5. Verificar que COMPANY_PROFILE.md existe
   (se não: "Empresa sem setup. Rode /setup-briefing primeiro.")
```

### Passo 2 — Scan de materiais

Listar todos os arquivos nas pastas:
- `[ACTIVE_COMPANY_PATH]/` (SETUP_STATE.md e outros de raiz)
- `[ACTIVE_COMPANY_PATH]/context/`
- `[ACTIVE_COMPANY_PATH]/context/copy/`
- `[ACTIVE_COMPANY_PATH]/audiences/`
- `[ACTIVE_COMPANY_PATH]/contents/` (listar subpastas + arquivos soltos tipo OUTPUT_CALENDAR_*)

Criar um mapa `sections_disponiveis`:

```
overview:         precisa de COMPANY_PROFILE.md
produto:          precisa de PRODUCT_CONTEXT.md
personas:         precisa de AUDIENCE_PROFILES.md ou audiences/*.md
brand-voice:      precisa de BRAND_VOICE.md
concorrentes:     precisa de COMPETITOR_MAP.md
pilares:          precisa de CONTENT_PILLARS.md
identidade-visual: precisa de VISUAL_IDENTITY.md
plataformas:      precisa de PLATFORM_SPECS.md
copy-foundation:  precisa de pelo menos 1 arquivo em context/copy/
conteudo:         precisa de pelo menos 1 subpasta em contents/
metadata:         sempre presente (usa SETUP_STATE.md)
```

### Passo 3 — Carregar design tokens

Se `[ACTIVE_COMPANY_PATH]/context/VISUAL_IDENTITY.md` existe:

1. Ler o arquivo
2. Extrair tokens conforme `references/css-tokens-fallback.md` seção "Como adaptar ao VISUAL_IDENTITY"
3. Identificar modo (Dark/Light) em "Modo e Mood > Base dos slides"
4. Extrair URLs de Google Fonts em "Tipografia > Fonte primária / mono"
5. Montar bloco CSS `:root { --brand: ...; ... }` completo
6. Montar `<link>` tags para Google Fonts

Se VISUAL_IDENTITY.md **não** existe ou tem valores `[pendente]`:

1. Usar tokens do `references/css-tokens-fallback.md` (modo light, system-ui, azul neutro)
2. Sem Google Fonts `<link>` (system-ui não precisa)

### Passo 4 — Ler e parsear cada arquivo

Para cada section em `sections_disponiveis`:

1. Ler os arquivos-fonte correspondentes (ver `references/section-renderers.md`)
2. Aplicar o renderer específico daquela section — extrair **apenas** os campos necessários, não dump
3. Escapar HTML entities (`&`, `<`, `>`, `"`, `'`) em todos os valores de texto
4. Gerar o bloco `<section id="...">...</section>` conforme o template do renderer
5. Acumular na variável `sections_html`

### Passo 5 — Gerar sidebar dinâmica

Para cada section em `sections_disponiveis` (na ordem padrão), gerar:

```html
<a href="#{id}">{label}</a>
```

| Section id | Label |
|---|---|
| overview | Visão geral |
| produto | Produto |
| personas | Personas |
| brand-voice | Tom de voz |
| concorrentes | Concorrentes |
| pilares | Pilares |
| identidade-visual | Identidade visual |
| plataformas | Plataformas |
| copy-foundation | Copy foundation |
| conteudo-produzido | Conteúdo produzido |
| metadata | Metadata |

Acumular em `sidebar_links`.

### Passo 6 — Gerar footer note

Se há sections ausentes (mapa sections_disponiveis tem `false` em algum):

```html
<p><strong>Sections ausentes:</strong> [lista de labels]. Para completar, rode <code>/setup-briefing [slug]</code> ou <code>/setup-copy-foundation [slug]</code>.</p>
```

Senão: só linha de metadata do preview (data + comando usado).

### Passo 7 — Montar HTML final

1. Ler `references/html-template.html`
2. Ler `references/css-tokens-fallback.md` seção "Fallback — modo light neutro" e "Modo dark" (para o CSS inline)
3. Ler `references/layout-spec.md` seção "CSS completo" e "JavaScript inline"
4. Substituir placeholders:
   - `{{LANG}}` → `pt-BR`
   - `{{THEME}}` → `dark` ou `light` (conforme VISUAL_IDENTITY ou fallback)
   - `{{COMPANY_NAME}}` → extraído de COMPANY_PROFILE (`Nome`)
   - `{{COMPANY_SLUG}}` → slug
   - `{{GENERATED_AT}}` → data ISO (YYYY-MM-DD)
   - `{{FONT_IMPORTS}}` → `<link>` tags ou vazio
   - `{{CSS_TOKENS}}` → bloco `:root { ... }` com tokens da marca ou fallback
   - `{{CSS_LAYOUT}}` → CSS completo do layout-spec
   - `{{SIDEBAR_LINKS}}` → string acumulada do Passo 5
   - `{{SECTIONS_HTML}}` → string acumulada do Passo 4
   - `{{FOOTER_NOTE}}` → Passo 6
   - `{{INLINE_SCRIPT}}` → JS do layout-spec

### Passo 8 — Persistir

```bash
mkdir -p [ACTIVE_COMPANY_PATH]/preview/
```

Escrever o HTML final em `[ACTIVE_COMPANY_PATH]/preview/index.html`. Se o arquivo já existe, **sobrescrever** (sempre 1 versão atual).

### Passo 9 — Reportar ao usuário

```
✓ Preview gerado em companies/[slug]/preview/index.html

Sections incluídas (N): [lista]
Sections ausentes (M): [lista, se houver]

Para visualizar, abra o arquivo no browser:
  file:///[caminho-absoluto]/preview/index.html

Ou via terminal:
  start companies/[slug]/preview/index.html    (Windows)
  open companies/[slug]/preview/index.html     (macOS)
  xdg-open companies/[slug]/preview/index.html (Linux)
```

Listar também brevemente quais renderers customizados foram aplicados (ex: "aplicou tokens da marca: #7C5CFF + Inter + dark mode").

## Output

- **Arquivo único:** `[ACTIVE_COMPANY_PATH]/preview/index.html`
- **Tamanho esperado:** 50-150 KB por empresa madura, 10-30 KB por empresa mínima
- **Dependências externas:** apenas Google Fonts via CDN (opcional — HTML funciona com fallback de fonte se offline)
- **Browsers suportados:** Chrome/Firefox/Safari/Edge últimas 2 versões (usa CSS Grid, IntersectionObserver, CSS custom properties)

## Comportamentos especiais

- **GRACEFUL DEGRADATION SEMPRE:** se um campo obrigatório para um renderer está vazio/pendente, o renderer pula aquela sub-seção (não crasha). Marca campos `[pendente]` como `.chip.warning` visível.
- **ESCAPE HTML EM TEXTO:** todo valor extraído de MD deve ter `&`, `<`, `>` escapados antes de ir pro HTML final. Isso previne quebra de layout e XSS (mesmo que contexto seja trusted).
- **VISUAL_IDENTITY É O RAY DE SOL:** quando existe, aplicar com rigor — fontes, cores, modo. Usuário DEVE reconhecer visualmente a marca no preview.
- **CONTRASTE WCAG:** se `--brand` tem contraste < 4.5 vs. `--bg-base`, usar `--brand-subtle` como fallback nos botões/links principais. Ver `references/css-tokens-fallback.md` seção "Regras de contraste".
- **IDEMPOTÊNCIA:** regerar substitui (sempre 1 arquivo atual). Não versionar no nome do arquivo.
- **COPY DE COR:** swatches devem ter o hex no data-attribute e JS de copiar ao clique.
- **FONTES EM FALLBACK:** se `@import url()` do VISUAL_IDENTITY falhar (offline), o fallback stack (`-apple-system, Segoe UI` etc.) deve garantir que texto renderize com qualidade mínima.
- **PATHS RELATIVOS NO HTML:** links para MDs (na section "Conteúdo produzido") devem ser relativos à pasta `preview/` (ex: `../contents/2026-04-16-slug/OUTPUT_IDEATION.md`), para funcionar ao abrir direto.

## Arquivos de Referência

| Arquivo | Quando consultar |
|---|---|
| `references/html-template.html` | No Passo 7, para montar o esqueleto final |
| `references/css-tokens-fallback.md` | Sempre — fallback quando VISUAL_IDENTITY incompleto, e mapeamento de tokens |
| `references/layout-spec.md` | Sempre — contém o CSS completo do layout e o JS inline |
| `references/section-renderers.md` | No Passo 4, para cada section — define como renderizar cada tipo de arquivo |

## Quando NÃO usar

- Empresa sem pasta criada → mandar rodar `/setup-briefing` antes
- Empresa com só `SETUP_STATE.md` (nenhum context file) → não há o que previsualizar
- Se o usuário quer editar conteúdo → preview é read-only; use os próprios MDs
- Se o usuário quer apresentação interativa (demo) → preview é estático

## Checklist de qualidade

- [ ] HTML gerado é valid HTML5 (sem tags não fechadas, atributos quebrados)
- [ ] Todos os placeholders `{{...}}` do template foram substituídos (zero sobrou no output)
- [ ] Se VISUAL_IDENTITY existe: tokens aplicados no CSS inline (`--brand`, `--bg-base`, `--font-primary` etc.)
- [ ] Se VISUAL_IDENTITY existe: Google Fonts `<link>` tags presentes no `<head>`
- [ ] Se VISUAL_IDENTITY **não** existe: CSS fallback aplicado sem warning visual
- [ ] Sidebar só mostra links para sections que têm dados (não há links mortos)
- [ ] Cada section tem `id` único e scroll-margin-top para não ficar colado no topo
- [ ] HTML entities escapadas em todo conteúdo de texto extraído dos MDs
- [ ] JS inline funcional: smooth scroll, highlight, copy color, mobile menu
- [ ] Responsivo: em janelas < 768px, sidebar vira drawer com toggle
- [ ] Acessibilidade: skip link + ARIA labels em nav e botões
- [ ] Arquivo salvo em `[ACTIVE_COMPANY_PATH]/preview/index.html` (pasta criada se ausente)
- [ ] Mensagem final reporta path + como abrir no browser
- [ ] Tamanho do arquivo final é razoável (< 500 KB mesmo com empresa muito madura)
