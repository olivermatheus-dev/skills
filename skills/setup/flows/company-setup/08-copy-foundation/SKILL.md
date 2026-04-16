---
name: setup-copy-foundation
description: "Orquestra a destilação de 7 artefatos de copy foundation para venda direta (sales pages, VSLs, emails BOFU) a partir dos context files do setup. Detecta automaticamente se o ICP tem bifurcação B2B (decisor ≠ usuário) e oferece gerar copy separada para cada perfil. Cada artefato é gerado por uma sub-skill atômica (8.1 a 8.7), carregada sob demanda. Output: companies/<empresa>/context/copy/[perfil/]*.md + COPY_SESSION_STATE.md + INDEX.md. Use quando a empresa já completou o /setup-briefing e quer preparar o arsenal de copy antes de escrever sales pages. Dispara com 'prepare copy', 'gere big idea', 'foundation de copywriting', 'destilar objeções', 'arsenal de venda direta'."
---

# Skill S8 — Copy Foundation Orchestrator (setup-copy-foundation)

## Role Definition

Você é o orquestrador do fluxo de destilação de copy foundation. Seu papel é **coordenar** — não executar os algoritmos de derivação. Cada um dos 7 artefatos é gerado por uma sub-skill atômica e especializada em `skills/8.X-*.md`. Você:

1. Resolve a empresa ativa e verifica pré-requisitos
2. Detecta bifurcação B2B (decisor ≠ usuário) e coordena modo unificado ou bifurcado
3. Inicializa `COPY_SESSION_STATE.md` (estado + depósito de artefatos intermediários)
4. Loop: para cada perfil ativo × cada artefato no escopo, carrega a sub-skill correta e executa
5. Consolida em `INDEX.md` ao final
6. Transiciona para o próximo passo (Camada Marketing, conteúdo, ou parada)

Você NÃO detém os protocolos de derivação — cada sub-skill tem o seu próprio. Carregue `skills/8.X-*.md` **apenas no momento de executar**, nunca antes (economia de contexto).

---

## Arquitetura: orquestrador + 7 sub-skills atômicas

| Sub-skill | Arquivo | Artefato gerado | Framework base |
|---|---|---|---|
| 8.1 | `skills/8.1-big-idea-synthesizer.md` | BIG_IDEA.md | Schwartz — Big Idea |
| 8.2 | `skills/8.2-unique-mechanism-mapper.md` | UNIQUE_MECHANISM.md | Schwartz — Mechanism of Action |
| 8.3 | `skills/8.3-failure-analyzer.md` | MECHANISM_OF_FAILURE.md | StoryBrand — vilão |
| 8.4 | `skills/8.4-objection-handler.md` | OBJECTIONS.md | 5 objeções universais (Halbert/Kurtz) |
| 8.5 | `skills/8.5-value-stacker.md` | VALUE_STACK.md | Price anchoring (Hopkins) |
| 8.6 | `skills/8.6-proof-strategist.md` | PROOF_HIERARCHY.md | Cialdini — prova social hierarquizada |
| 8.7 | `skills/8.7-cta-builder.md` | CTA_LIBRARY.md | Schwartz — 5 níveis de consciência |

**Ordem de dependência:**
- 8.1, 8.2, 8.5, 8.6, 8.7 — independentes entre si
- 8.3 depende de 8.2 (cita nome do Mechanism)
- 8.4 depende de 8.2 (respostas citam Mechanism)

Ordem padrão de execução: `8.1 → 8.2 → 8.3 → 8.4 → 8.5 → 8.6 → 8.7`

---

## Fluxo de Execução

### Passo 1 — Resolução de contexto

```
1. Ler ~/.claude/content-pipeline.md → companies_root
   (se não existir: "Execute install.sh antes de continuar")
2. Extrair slug do argumento do usuário
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar se [ACTIVE_COMPANY_PATH]/context/ existe
   (se não: "Empresa não tem setup. Use /setup-briefing primeiro")
```

### Passo 2 — Verificação de pré-requisitos

Verificar em `[ACTIVE_COMPANY_PATH]/context/`:

| Arquivo | Obrigatório? |
|---|---|
| PRODUCT_CONTEXT.md | ✅ |
| AUDIENCE_PROFILES.md | ✅ |
| COMPETITOR_MAP.md | ✅ |
| BRAND_VOICE.md | ✅ |
| COMPANY_PROFILE.md | 🟡 opcional |
| CONTENT_PILLARS.md | 🟡 opcional |
| PLATFORM_SPECS.md | 🟡 opcional |

Se faltar obrigatório: parar + orientar a rodar `/setup-briefing`.

### Passo 3 — Detecção de bifurcação B2B

Ler `AUDIENCE_PROFILES.md` (e personas individuais em `audiences/AUDIENCE_*.md`).

**Critério de bifurcação B2B:** existe em algum perfil a marcação explícita `B2B — Decisor: ... | Usuário Final: ...` com perfis distintos? OU o usuário tem múltiplas personas em `audiences/` representando decisor vs. usuário de um mesmo ICP?

- **Se detectada:** perguntar ao usuário:
  > "Detectei que sua persona tem decisor (X) e usuário final (Y) distintos. Quer gerar copy separada para cada um (modo **bifurcado** — 2x o trabalho, copy mais precisa) ou uma única copy unificada para ambos (modo **unificado** — mais simples)?"
- **Se não detectada:** modo unificado automaticamente.

Gravar a decisão no estado (Passo 5).

### Passo 4 — Escolha de escopo

Apresentar opções:
```
Opção A — Core (4 artefatos, ~15 min):
  - BIG_IDEA, UNIQUE_MECHANISM, OBJECTIONS, VALUE_STACK

Opção B — Completo (7 artefatos, ~30 min):
  - Core + MECHANISM_OF_FAILURE + PROOF_HIERARCHY + CTA_LIBRARY

Opção C — Custom — você escolhe quais
```

Default sugerido: B (Completo). Em modo bifurcado, tempo duplica.

### Passo 5 — Inicializar COPY_SESSION_STATE.md

1. Criar pasta: `mkdir -p [ACTIVE_COMPANY_PATH]/context/copy/`
2. Se modo bifurcado, criar subpastas: `mkdir -p [ACTIVE_COMPANY_PATH]/context/copy/decisor/ [ACTIVE_COMPANY_PATH]/context/copy/usuario/`
3. Ler template `references/copy-session-state-template.md`
4. Preencher cabeçalho (empresa, data, escopo, modo, perfis, pré-requisitos)
5. Salvar em `[ACTIVE_COMPANY_PATH]/context/copy/COPY_SESSION_STATE.md`

### Passo 6 — Verificar estado existente

Se `COPY_SESSION_STATE.md` já existia antes deste Passo 5 (rodada anterior):
```
"Já existe uma copy foundation para [empresa] (gerada em [data]).
O que fazer?
1. Atualizar todos os artefatos (re-derive + re-pergunta)
2. Atualizar apenas os que tiveram source_files modificados desde a última geração
3. Pular existentes e gerar só os faltantes
4. Cancelar"
```

Aguardar escolha antes de prosseguir.

### Passo 7 — Loop de execução

```
PARA CADA perfil em perfis_ativos:          (unificado OR [decisor, usuario])
  Atualizar STATE: perfil_ativo = [perfil]

  PARA CADA artefato em artefatos_solicitados (ordem 8.1 → 8.7):
    → Carregar skills/8.X-*.md correspondente
    → Executar a sub-skill (ela faz seu próprio protocolo + diálogo + persistência)
    → Ao final, a sub-skill terá:
       - Atualizado STATE (depósito + status)
       - Escrito [ACTIVE_COMPANY_PATH]/context/copy/[perfil/]<ARTIFACT>.md

    Se artefato tem dependência (8.3, 8.4 dependem de 8.2):
      → Verificar no STATE se a dependência foi aprovada
      → Se não: alertar usuário e pular (ou pedir para rodar dependência antes)

  Entre sub-skills, oferecer pausar ou continuar.
```

**Regra de lazy loading:** nunca pré-carregar todas as sub-skills. Carregar `skills/8.X-*.md` via Read apenas no início do ciclo de cada artefato.

### Passo 8 — Gerar INDEX.md

Após concluir o loop, gerar o índice consolidado:
1. Usar `references/output-templates/INDEX.md` como estrutura
2. Listar todos os artefatos gerados com status e paths (considerando bifurcação se aplicável)
3. Incluir receitas de montagem (sales page, email sequence, VSL)
4. Salvar em `[ACTIVE_COMPANY_PATH]/context/copy/INDEX.md`

### Passo 9 — Handoff

```
"✓ Copy foundation [unificada/bifurcada] gerada em [ACTIVE_COMPANY_PATH]/context/copy/:
  - [lista de arquivos gerados]
  - COPY_SESSION_STATE.md (estado + depósito)
  - INDEX.md (receitas de montagem)

Próximos passos:
→ Ler INDEX.md para ver receitas prontas (sales page, emails, VSL)
→ Usar os artefatos para escrever copy manualmente
→ (em breve) skills da Camada Marketing (/copy-sales-page, /copy-email-sequence) consumirão estes artefatos para gerar entregáveis finais
→ Quando mudar o setup, rodar /setup-copy-foundation novamente — a skill detecta mudanças e atualiza seletivamente"
```

---

## Comportamentos Especiais

- **LAZY LOADING:** nunca carregar sub-skills antecipadamente — só no momento de executar. Economiza contexto.
- **PRÉ-REQUISITOS RIGOROSOS:** se faltar arquivo obrigatório, parar. Não tentar gerar com fontes incompletas.
- **BIFURCAÇÃO B2B EXPLÍCITA:** sempre perguntar ao usuário (nunca assumir silenciosamente), mesmo quando detectada.
- **STATE É FONTE DE VERDADE:** sub-skills 8.3 e 8.4 leem depósito de 8.2 no STATE, não o arquivo UNIQUE_MECHANISM.md. MD final é contrato para downstream; STATE é estado de trabalho.
- **CARREGAMENTO SOB DEMANDA DE REFERENCES:**
  - `copywriting-frameworks.md` — não ler aqui; sub-skills que precisarem da teoria leem
  - `copy-session-state-template.md` — ler no Passo 5 para inicializar STATE
  - `output-templates/*.md` — sub-skills leem cada uma o seu
- **IDEMPOTÊNCIA:** rodar duas vezes detecta STATE anterior e oferece atualizar/pular (Passo 6).
- **B2B DUPLO:** em modo bifurcado, TODOS os 7 artefatos são gerados 2x. Alguns ficam similares (UNIQUE_MECHANISM), mas não tentamos prescrever "o que compartilhar" — usuário decide.

---

## Quando NÃO usar esta skill

- Empresa ainda não rodou `/setup-briefing` → mandar rodar primeiro
- Empresa é pure content marketing sem funil de venda direto → os artefatos vão ser sub-utilizados
- Empresa é pre-revenue com hipóteses não validadas → gerar copy foundation com dados fictícios pode cristalizar mensagens erradas; prefira Caminho C (Mínimo Viável) do setup antes

---

## Arquivos de Referência

| Arquivo | Quando consultar |
|---|---|
| `skills/8.X-*.md` | No Passo 7, no momento de executar cada artefato (carregamento sob demanda) |
| `references/copy-session-state-template.md` | No Passo 5, para inicializar o estado compartilhado |
| `references/output-templates/INDEX.md` | No Passo 8, para gerar o índice consolidado |
| `references/copywriting-frameworks.md` | Só se o usuário pedir base teórica — sub-skills já carregam quando precisam |

## Transição

Ao concluir, sugerir:
- "Use o INDEX.md como roteiro para escrever sua primeira sales page"
- "A Camada Marketing (próxima fase do projeto) terá skills dedicadas (/copy-sales-page, /copy-email-sequence, /copy-vsl-script) que consumirão estes artefatos"
- "Quando mudar algum context file, rodar `/setup-copy-foundation [empresa]` atualiza apenas o afetado"

Não transitar automaticamente para nenhuma outra skill — copy foundation é entregável em si.
