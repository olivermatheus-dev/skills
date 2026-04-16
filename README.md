# Skills — Catálogo de Marketing e Copy para Claude Code

Catálogo de skills que automatizam o fluxo completo de marketing para pequenos empreendedores:
**Setup da empresa → Copy foundation → Produção de conteúdo → Preview em HTML.**

Todas as skills rodam dentro do Claude Code via slash commands (ex: `/setup-briefing`, `/content`, `/company-preview`).

---

## Pré-requisitos

- [Claude Code](https://docs.claude.com/en/docs/claude-code) instalado
- Git Bash / WSL / macOS / Linux (o script de instalação usa bash)

---

## Instalação

```bash
git clone https://github.com/olivermatheus-dev/skills.git
cd skills
./install.sh
```

O script:
1. Copia todas as 20 skills do repo para `~/.claude/skills/`
2. Cria `~/.claude/content-pipeline.md` apontando para a pasta `companies/` deste repo
3. Instala a `skill-creator` oficial da Anthropic (se tiver acesso)

**Depois da instalação, reinicie o Claude Code** para as skills serem carregadas.

---

## Uso básico — do zero ao primeiro post

### 1. Criar nova empresa
```
/setup-briefing minha-empresa
```
Orquestra os 7 blocos de setup (perfil, produto, público, tom de voz, concorrentes, pilares, identidade visual). Cria `companies/minha-empresa/context/` com todos os arquivos de contexto.

### 2. Destilar copy foundation (opcional, pós-setup)
```
/setup-copy-foundation minha-empresa
```
Gera 7 artefatos de copy para venda direta (Big Idea, Unique Mechanism, Objections, Value Stack, etc.) em `companies/minha-empresa/context/copy/`.

### 3. Produzir conteúdo
```
/content minha-empresa
```
Orquestra o pipeline de ideias → pesquisa → hooks → texto → adaptação por plataforma → carrossel. Outputs em `companies/minha-empresa/contents/<data-slug>/`.

### 4. Visualizar tudo em HTML
```
/company-preview minha-empresa
```
Gera `companies/minha-empresa/preview/index.html` — página única com sidebar fixa consolidando todos os materiais. Abre direto no browser.

---

## Estrutura de pastas

```
skills/
├── install.sh                         # script de instalação
├── scripts/
│   ├── install-skills.sh              # lógica real do install
│   └── skills-manifest.txt            # manifesto das 20 skills
├── skills/                            # catálogo (fonte das skills)
│   ├── setup/flows/company-setup/     # 8 blocos do setup
│   ├── content/flows/content-production/  # 10 skills do pipeline
│   └── marketing/standalone/          # skills utilitárias (preview, etc.)
├── companies/                         # 1 pasta por empresa (context + outputs)
│   ├── testco/                        # exemplo: SaaS B2B (com VISUAL_IDENTITY)
│   ├── acmebrew/                      # exemplo: café B2C (sem VISUAL_IDENTITY)
│   └── dealflux/                      # exemplo: empresa mínima
└── playground/                        # experimentos e material de referência
```

---

## Catálogo de skills disponíveis

### Setup (8 skills)
Cada bloco do setup é uma skill independente que pode ser rodada isoladamente ou em sequência via `/setup-briefing`:

| Skill | O que faz |
|---|---|
| `/setup-briefing` | Orquestrador — guia o setup completo em 7 blocos |
| `/setup-company-profile` | Bloco 1: perfil institucional (4 etapas) |
| `/setup-product-context` | Bloco 2: produto, features, diferenciais |
| `/setup-audience-profiles` | Bloco 3: personas e público-alvo (5 sub-skills) |
| `/setup-brand-voice` | Bloco 4: tom de voz e vocabulário |
| `/setup-competitor-map` | Bloco 5: concorrentes e gaps |
| `/setup-content-pillars` | Bloco 6: pilares de conteúdo |
| `/setup-visual-identity` | Bloco 7: design tokens (cores, fontes) |
| `/setup-copy-foundation` | Bloco 8 opcional: copy para venda direta (7 sub-skills) |

### Produção de Conteúdo (10 skills)
Pipeline de conteúdo orgânico para redes sociais:

| Skill | O que faz |
|---|---|
| `/content` | Orquestrador — porta de entrada, roteia conforme intenção |
| `/content-ideation` | Gera ideias por pilar + funil |
| `/content-research` | Pesquisa aprofundada com dados e fontes |
| `/hooks-factory` | Gera hooks virais e headlines |
| `/content-writer` | Redige conteúdo-pilar completo |
| `/platform-adapter` | Adapta para LinkedIn, Instagram, TikTok, X, Blog, YouTube |
| `/carousel-creator` | Gera slides HTML prontos para screenshot |
| `/content-derivatives` | Formatos derivados (tierlists, checklists, etc.) |
| `/editorial-calendar` | Calendário editorial mensal |
| `/content-performance` | Analisa métricas e retroalimenta o pipeline |

### Marketing / Utilitárias (1 skill)

| Skill | O que faz |
|---|---|
| `/company-preview` | Gera HTML único consolidando todos os materiais da empresa (sidebar + sections), com design derivado do VISUAL_IDENTITY da marca |

---

## Fluxo recomendado para primeira empresa

```
1. /setup-briefing <empresa>           # 7 blocos de setup (~2h)
2. /setup-copy-foundation <empresa>    # 7 artefatos de copy (~30min)
3. /content <empresa>                  # primeira peça de conteúdo
4. /company-preview <empresa>          # visualizar tudo em HTML
```

Cada empresa fica isolada em sua própria pasta em `companies/<empresa>/`. Paths são resolvidos automaticamente via `~/.claude/content-pipeline.md`.

---

## Como adicionar sua própria skill

Use `/skill-creator` (fornecida pelo plugin oficial da Anthropic) para criar skills novas seguindo o padrão do repo. Depois:

1. Coloque a skill em `skills/<area>/<tipo>/<nome>/` (ex: `skills/marketing/standalone/minha-skill/`)
2. Adicione a linha correspondente em `scripts/skills-manifest.txt`
3. Rode `./install.sh` novamente
4. Reinicie o Claude Code

---

## Estrutura de uma empresa em `companies/<empresa>/`

Depois de rodar os 3 comandos principais:

```
companies/<empresa>/
├── SETUP_STATE.md                     # status do setup
├── context/                           # contexto da marca (consumido pelas skills)
│   ├── COMPANY_PROFILE.md
│   ├── PRODUCT_CONTEXT.md
│   ├── AUDIENCE_PROFILES.md
│   ├── BRAND_VOICE.md
│   ├── COMPETITOR_MAP.md
│   ├── CONTENT_PILLARS.md
│   ├── VISUAL_IDENTITY.md
│   ├── PLATFORM_SPECS.md
│   ├── HOOK_LIBRARY.md
│   ├── WORKFLOW_STATE.md
│   └── copy/                          # copy foundation (bloco 8)
│       ├── BIG_IDEA.md
│       ├── UNIQUE_MECHANISM.md
│       ├── MECHANISM_OF_FAILURE.md
│       ├── OBJECTIONS.md
│       ├── VALUE_STACK.md
│       ├── PROOF_HIERARCHY.md
│       ├── CTA_LIBRARY.md
│       ├── COPY_SESSION_STATE.md
│       └── INDEX.md
├── audiences/                         # personas individuais
│   └── AUDIENCE_<persona>.md
├── contents/                          # peças de conteúdo produzidas
│   └── <YYYY-MM-DD>-<slug>/
│       ├── WORKFLOW_STATE.md
│       ├── OUTPUT_IDEATION.md
│       ├── OUTPUT_WRITER.md
│       └── ...
└── preview/
    └── index.html                     # dashboard visual navegável
```

---

## Troubleshooting

**"Empresa não encontrada" ao rodar uma skill**
→ Confirme que `~/.claude/content-pipeline.md` aponta para a pasta `companies/` correta. Rode `./install.sh` novamente se necessário.

**Skill não aparece no Claude Code**
→ Reinicie o Claude Code. As skills são carregadas na inicialização.

**Preview HTML abre em branco**
→ Verifique se tem internet (usa Google Fonts via CDN). O fallback local de fonte deve funcionar mesmo offline.

---

## Licença

Uso pessoal e educacional. Contribuições bem-vindas via pull request.
