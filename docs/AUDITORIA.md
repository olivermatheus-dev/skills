# Auditoria do repositório — out/2026

> Feita por 5 subagentes em paralelo (setup, conteúdo, marketingskills ×2, infra). Nada foi apagado ainda.

## Diagnóstico em 1 frase
O repo tem ~300k palavras de skills, e menos de 10% disso é conhecimento que o Claude **não** já sabe. O resto é protocolo, estado, template vazio e teoria genérica (AIDA, Cialdini, gerações…).

| Bloco | Hoje | Proposto |
|---|---|---|
| Setup (9 skills + 13 sub-skills) | ~68k palavras | 1 skill, ~3k |
| Conteúdo (10 etapas) | ~55k | 4 skills, ~8–10k |
| marketingskills (34 skills + tools, 2.8MB) | ~120k | 0 (extrair ~5 pepitas) |
| Contexto da kz | ~28k | ~4k |
| playground / exemplos / install | ~60k | 0 |

## Problemas estruturais
- **Nada roda direto do repo.** Skills ficam em pastas profundas (`skills/<area>/flows/...`) e dependem de `install.sh` copiar para `~/.claude`. Solução: `.claude/skills/` plano no próprio repo.
- **Nenhuma skill de LP/ads/carta lê `context/copy/`.** O bloco 08 gera 7 artefatos que ninguém consome (só o preview).
- **Excesso de estado:** `SETUP_STATE`, `WORKFLOW_STATE`, `COPY_SESSION_STATE` (2,5k palavras — maior que o próprio copy).
- **Pipeline de conteúdo nunca rodou** além da ideação, e tem viés Blog/LinkedIn/YouTube — não Instagram.
- **marketingskills não é instalado** e procura `.agents/product-marketing-context.md` — ignoraria o contexto das suas empresas.
- Duas fontes de verdade para persona (`AUDIENCE_PROFILES.md` vs `audiences/AUDIENCE_*.md`).
- Bugs: "DealFlux" hardcoded no orquestrador, numeração quebrada (sem etapa 01; sub-skills 4.x no bloco 03), caminho Windows no `SETUP_STATE` da kz, zip `.skill` binário commitado.

## Veredito por item

### Setup (`skills/setup/flows/company-setup/`)
| Item | Veredito |
|---|---|
| 00-orchestrator | ENXUGAR → vira a skill `setup` única |
| 01-company-profile + 02-product-context | FUNDIR → `BUSINESS.md` |
| 03-audience-profiles (~20k!) | ENXUGAR muito → `AUDIENCE.md` |
| 04-brand-voice | MANTER enxuto → `VOICE.md` |
| 05-competitor-map | ENXUGAR → `COMPETITORS.md` (tabela 5–8) |
| 06-content-pillars | MANTER enxuto → `CONTENT_STRATEGY.md` |
| 07-visual-identity | MANTER enxuto → `VISUAL.md` |
| 08-copy-foundation | FUNDIR → `COPY_FOUNDATION.md` (1 arquivo) |

### Conteúdo (`skills/content/flows/content-production/`)
| Item | Veredito |
|---|---|
| 00-orchestrator, 08-derivatives, WORKFLOW_STATE, context-templates | CORTAR |
| 02-ideation + 03-research + 09-calendar | FUNDIR → `content-ideas` |
| 04-hooks + 05-writer + 06-adapter | FUNDIR → `ig-post` (carrossel + reels) |
| 07-carousel-creator | MANTER + script de export PNG + estilo claro/foto |
| 10-performance | ADIAR (virar "análise de CSV do Instagram" quando houver dados) |
| company-preview | ADIAR (base possível para a futura UI) |

### marketingskills (Corey Haines) — CORTAR a pasta inteira após extrair:
1. **Seven Sweeps** (`copy-editing`) → QA de LP/carta/anúncio.
2. **Estrutura de LP em seções** (`copywriting/references/copy-frameworks.md`) + checklist 7 pontos (`page-cro`).
3. **Matriz de ângulos + ciclo de iteração** (`ad-creative`) + diagnóstico CPA/CTR/CPM (`paid-ads`).
4. **Extração de VOC** (`customer-research`) — com fontes BR (Reclame Aqui, grupos, comentários IG).
5. **ORB + lançamento em 5 fases** (`launch-strategy`) — útil para o momento da kz.
- Guardar para depois (só no histórico do git, commit `bcd7912`): referral-program, onboarding-cro, signup-flow-cro, ab-test-setup, free-tool-strategy, email-sequence.

### Infra
| Item | Veredito |
|---|---|
| playground/ | CORTAR (já absorvido). Mover `all/MAPA_SKILLS_VIDEO.md` → `docs/backlog/`; `all/concept.md` vira base do `CLAUDE.md` |
| companies/acmebrew, dealflux | CORTAR |
| companies/testco | CORTAR ou virar `_example` (sem `copy-v1-backup/`) |
| companies/*/preview/ | gitignore (é gerado) |
| install.sh, scripts/, GUIA_DE_SETUP.md, references/output-template.md, READMEs placeholder | CORTAR |
| CLAUDE.md raiz | CRIAR |

## Lacunas (o que falta para seus objetivos)
- **Skill de landing page / carta de vendas** (lead → história → mecanismo → oferta empilhada → garantia → escassez → P.S.), lendo `COPY_FOUNDATION.md`.
- **Skill de anúncios Meta** (ângulos, variações, briefing visual, diagnóstico).
- **Roteiro de Reels** dentro de `ig-post`.
- **Vídeo**: depois — skill `video-edit` com ffmpeg + whisper (cortes e legendas) em `tools/`.
- **Tarefas/projetos**: `companies/<x>/tasks.md` (ou `.json`) — a futura UI lê daí.

## Lacunas no contexto da kz
- Desatualizado: gerado em abr/2026 em pré-lançamento; nada revalidado. Falta: data real de lançamento, pagantes, churn, CAC, canal que funcionou.
- Oferta não fechada: preço final, trial, garantia, desconto de lançamento, como funciona a aprovação manual.
- Zero prova social (depoimentos de beta testers).
- **Compliance CFP/CRP** para publicidade em saúde mental + LGPD — crítico para anúncios.
- Links básicos: site, @instagram, link de cadastro.
- Assets: logo, fotos, screenshots, bio do founder.
- `HOOK_LIBRARY` vazio; `contents/` vazio.

## Estrutura-alvo
```
.
├── CLAUDE.md                 # roteador: empresas, skills, "sempre ler companies/<x>/context antes"
├── README.md                 # curto: clonar, abrir `claude`, exemplos
├── .claude/skills/           # skills planas (abaixo)
├── companies/<slug>/
│   ├── context/              # BUSINESS, AUDIENCE, VOICE, COMPETITORS, CONTENT_STRATEGY, VISUAL, COPY_FOUNDATION
│   ├── assets/               # logo, fotos, screenshots (ou link do Drive)
│   ├── contents/             # AAAA-MM-DD-slug/ (posts, carrosséis, reels)
│   ├── campaigns/            # anúncios, LPs, cartas por campanha
│   └── tasks.md              # backlog de marketing/vendas (futura UI)
├── tools/                    # scripts (render PNG, ffmpeg…) — só quando existirem
└── docs/                     # esta auditoria, backlog
```

Skills finais (7): `setup`, `content-ideas`, `ig-post`, `carousel-render`, `landing-page` (inclui carta de vendas), `ads-meta`, `launch-plan` (opcional).
