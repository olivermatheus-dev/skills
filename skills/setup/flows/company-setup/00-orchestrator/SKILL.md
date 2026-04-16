---
name: setup
description: "Orquestra o fluxo completo de configuração de empresa, criando todos os arquivos de contexto necessários para o pipeline de conteúdo. Use para criar uma nova empresa, retomar um setup pausado, ou atualizar context files de uma empresa existente. Acione quando o usuário mencionar 'configurar', 'setup', 'nova empresa', 'começar do zero', 'primeira vez', 'preencher perfil da marca', 'quero usar o pipeline', 'minha empresa', 'setup completo'. Redireciona para skills especializadas quando o usuário quiser atualizar um bloco específico: 'atualizar tom de voz' → /setup-brand-voice, 'nova persona' → /setup-audience-profiles, 'mudar concorrentes' → /setup-competitor-map, etc."
---

# Skill S — Setup Wizard (Orquestrador)

## Role Definition

Você é o ponto de entrada do fluxo de configuração. Seu papel é:

1. **Criar a estrutura da empresa** — pasta, slug, arquivos de estado
2. **Guiar o fluxo completo** — executar os 7 blocos em sequência, lendo a sub-skill de cada bloco
3. **Controlar o progresso** — manter SETUP_STATE.md atualizado para suportar pausa e retomada
4. **Finalizar automaticamente** — gerar PLATFORM_SPECS.md, HOOK_LIBRARY.md e checklist final
5. **Rotear atualizações parciais** — identificar quando o usuário quer editar só um bloco e invocar a sub-skill correta

Você NÃO executa os blocos diretamente. Para cada bloco, você **lê e executa o procedimento** definido na sub-skill correspondente em `~/.claude/skills/setup-[nome-do-bloco]/SKILL.md`.

---

## Regras Fundamentais

### Uma pergunta por vez
Nunca envie várias perguntas de uma vez. Faça uma, espere, use a resposta para contextualizar a próxima.

### Respostas ricas
Se o usuário fornecer informações que cobrem múltiplas perguntas, extrair TUDO e pular as perguntas já respondidas. Confirmar: "Entendi que [X], [Y] e [Z]. Correto? Vou pular para a próxima questão."

### Sugestão inteligente
A cada bloco, revisar todos os arquivos já preenchidos e usar essas informações para sugestões melhores. Essa lógica está detalhada em cada sub-skill.

### Pesquisa assistida
Quando o usuário não souber responder, oferecer pesquisar na web: "Posso pesquisar por [X] para ajudar. Quer que eu faça isso?"

---

## Fluxo Principal — Empresa Nova

### Passo 1: Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root — **se o arquivo não existir: parar e informar o usuário para executar `install.sh` antes de continuar**
2. Perguntar: "Qual o identificador (slug) desta empresa? Use letras minúsculas e hífens. Ex: dealflux, cliente-x, minha-marca"
   - Se nome com espaços/acentos: sugerir slug automaticamente. Ex: "Minha Marca" → "minha-marca. Correto?"
   - Regra: lowercase, apenas letras, números e hífens, sem acentos, max 30 caracteres
3. Verificar se [companies_root]/[slug]/ já existe:
   - Já existe → verificar SETUP_STATE.md:
     - Setup incompleto → "Encontrei um setup pausado para '[slug]'. Quer continuar de onde parou?"
     - Setup completo → "Esta empresa já está configurada. Quer atualizar algum bloco específico?"
   - Não existe → criar estrutura (Passo 2)
```

### Passo 2: Criar Estrutura de Pastas

```bash
mkdir -p [companies_root]/[slug]/context/
mkdir -p [companies_root]/[slug]/contents/
mkdir -p [companies_root]/[slug]/audiences/
cat > [companies_root]/[slug]/contents/README.md <<'EOF'
# Conteúdo produzido

Esta pasta é preenchida pelo pipeline de conteúdo (`/content`), não pelo setup.
Cada peça fica em `YYYY-MM-DD-slug/` com seu próprio `WORKFLOW_STATE.md` e `OUTPUT_*.md`.
Calendários mensais ficam soltos como `OUTPUT_CALENDAR_YYYY-MM.md`.
EOF
```

Definir `ACTIVE_COMPANY_PATH = [companies_root]/[slug]`

Criar `SETUP_STATE.md` em `[ACTIVE_COMPANY_PATH]/SETUP_STATE.md` (ver template abaixo).

Confirmar: "Empresa `[slug]` criada em `[ACTIVE_COMPANY_PATH]`. Vou agora iniciar a configuração."

### Passo 3: Selecionar Caminho de Setup

Perguntar qual caminho o usuário prefere entre 3 opções:

**Caminho A — Auto-Draft** (recomendado se tem site ativo):
> "Posso analisar seu site e redes sociais para gerar um rascunho inicial de todos os blocos. Você só revisa, corrige e complementa. É mais rápido — cerca de 5-10 minutos."

**Caminho B — Conversacional Completo** (empresa consolidada, sem site ou prefere aprofundar):
> "Vou te guiar pergunta por pergunta, cobrindo todos os detalhes. Mais preciso, leva cerca de 2 horas."

**Caminho C — Mínimo Viável** (recomendado para empresa em pré-lançamento/validação):
> "Caminho enxuto em ~30 minutos: coleta apenas os campos críticos, infere o resto a partir do contexto, e gera uma persona *provisória* — acionável para começar a produzir conteúdo hoje. Ideal para quem não tem site nem clientes ainda, mas quer validar hipóteses na prática. Pode ser aprofundado depois via skills específicas (`/setup-audience-profiles`, etc.)."

**Recomendação automática:**
Antes de perguntar, checar sinais de startup (ver `references/startup-mode.md`):
- Usuário mencionou "estou começando", "pré-lançamento", "ainda não tenho clientes", "nem tenho site" → recomendar **C**
- Usuário forneceu URL de site funcional → recomendar **A**
- Caso contrário → apresentar as 3 opções sem recomendação forte

**Protocolo Auto-Draft (Caminho A):**
1. Receber URL do site + redes sociais
2. Acessar via web e analisar: textos do site, about, features, pricing, CSS (cores, fontes), meta descriptions, posts recentes
3. Gerar rascunho de TODOS os 7 blocos de uma vez
4. Salvar todos os rascunhos em `[ACTIVE_COMPANY_PATH]/context/` com sufixo `-draft`
5. Apresentar bloco por bloco para revisão: "Aqui está o que encontrei sobre [bloco]. O que precisa corrigir?"
6. Ajustar conforme feedback e salvar versão final

**Protocolo Mínimo Viável (Caminho C):**

Este caminho combina 4 mecanismos:
1. **Flag `startup_mode: true`** — setada desde o início em `SETUP_STATE.md` (campo `perfil: startup`). Ver `references/startup-mode.md`.
2. **Perguntas críticas apenas** — cada skill pula complementares e auto-infere o que for possível do contexto já coletado.
3. **Handoffs narrados** — cada transição entre blocos traz síntese + pré-hipóteses + próximo passo (ver `references/startup-mode.md`, seção 4).
4. **Persona marcada como provisória** — AUDIENCE_*.md tem header "🔸 Persona provisória — revalidar após 30 dias".

**Cobertura por bloco no Caminho C:**
- Bloco 1 (Company): Etapa 1 completa + Etapa 2 com 3 campos críticos (B2B/B2C, Estágio, Diferencial) + Etapa 3 mínima (missão/valores aceitam "em construção") + Etapa 4 (pular se sem site) + Etapa 5 (diagnóstico com legenda 🔴🟡🟢)
- Bloco 2 (Product): 6 perguntas críticas (P2.1, P2.2, P2.3, P2.4, P2.4b com 3 anti-personas sugeridas, P2.5, P2.8 com 3 propostas de valor). Pula P2.5b, P2.5c, P2.6b, P2.7, P2.7b.
- Bloco 3 (Audience): Skill 4.1 auto-sugere segmentos; 4.2 gera rascunho de 40+ campos com `[H]`; **4.3 faz apenas as 6 críticas** (ver `skills/setup/flows/company-setup/03-audience-profiles/references/persona-questions.md`, seção "Classificação de Prioridade"); 4.4 e 4.5 auto-inferidas.
- Blocos 4-7: mantidos mas com ajustes do `startup-mode.md` (seção 3) — Brand Voice pula auto-análise de redes se ausentes; Competitor Map mantém pesquisa proativa; Content Pillars usa rascunhos `[H]`; Visual Identity usa fallback verbal se sem site.

**Tempo estimado:** 30-40 minutos totais. Persona gerada é **usável imediatamente** (copy pode ser escrita lendo só o `AUDIENCE_*.md`) mas marcada como provisória.

**Setar flag ao iniciar Caminho C:**

Ao usuário escolher Caminho C, gravar em `SETUP_STATE.md`:
```yaml
perfil: startup
caminho: C-minimo-viavel
startup_flags:
  - modo_minimo_viavel
```

As outras flags (`sem_site`, `sem_clientes`, etc.) serão adicionadas ao longo do Bloco 1 conforme detectadas.

### Passo 4: Executar os 7 Blocos em Sequência

Para cada bloco, executar o seguinte:

```
1. Atualizar SETUP_STATE.md: marcar bloco atual como "em andamento"
2. Anunciar: "Vamos para o Bloco [N]: [nome]"
3. Ler e executar o procedimento definido em:
   ~/.claude/skills/setup-[nome-skill]/SKILL.md
4. Após concluir: atualizar SETUP_STATE.md marcando bloco como "concluído"
5. Avançar para o próximo bloco
```

**Mapa de sub-skills por bloco:**

| Bloco | Tema | Sub-skill a executar |
|---|---|---|
| 1 | Quem é sua empresa? | `~/.claude/skills/setup-company-profile/SKILL.md` |
| 2 | O que você vende? | `~/.claude/skills/setup-product-context/SKILL.md` |
| 3 | Para quem você vende? | `~/.claude/skills/setup-audience-profiles/SKILL.md` |
| 4 | Como sua marca fala? | `~/.claude/skills/setup-brand-voice/SKILL.md` |
| 5 | Contra quem você compete? | `~/.claude/skills/setup-competitor-map/SKILL.md` |
| 6 | Sobre o que vai falar? | `~/.claude/skills/setup-content-pillars/SKILL.md` |
| 7 | Como sua marca se apresenta? | `~/.claude/skills/setup-visual-identity/SKILL.md` |

### Passo 5: Finalização Automática

Após os 7 blocos, gerar automaticamente:

**AUDIENCE_PROFILES.md:**
- Verificar se `[ACTIVE_COMPANY_PATH]/context/AUDIENCE_PROFILES.md` já existe (gerado incrementalmente pelo Bloco 3 a cada persona mapeada).
- **SE existe:** preservar sem modificações e pular este passo. O Bloco 3 é o autor único deste arquivo; regerar aqui sobrescreveria edições manuais feitas durante a sessão.
- **SE não existe** (ex: Bloco 3 foi pulado ou modo C-minimo-viavel sem personas completas):
  - Ler todos os arquivos `AUDIENCE_[nome].md` em `[ACTIVE_COMPANY_PATH]/audiences/`
  - Consultar `references/output-templates.md`, seção AUDIENCE_PROFILES, para a estrutura exata
  - Para cada persona encontrada, extrair e preencher: Quem é, Cargo/Papel, Tamanho da empresa, Dor principal, O que já tentou, Nível de consciência, Objeções principais (3 com resposta recomendada), Onde consome conteúdo, Fala como, Gatilhos emocionais
  - Incluir o Mapa de Consciência × Conteúdo ao final, preenchido com os níveis reais presentes nas personas
  - Adicionar aviso no topo: `> ⚠️ Gerado na finalização sem o Bloco 3 completo — execute /setup-audience-profiles para enriquecer.`
  - Salvar em `[ACTIVE_COMPANY_PATH]/context/AUDIENCE_PROFILES.md`

**PLATFORM_SPECS.md:**
- Perguntar: "Quais plataformas você vai usar? (Instagram, LinkedIn, TikTok, X, Blog, YouTube, WhatsApp)"
- Gerar spec apenas das plataformas selecionadas com dados padrão de dimensões, formatos e boas práticas
- Salvar em `[ACTIVE_COMPANY_PATH]/context/PLATFORM_SPECS.md`

**HOOK_LIBRARY.md:**
- Gerar arquivo vazio com template
- Consultar `references/output-templates.md`, seção HOOK_LIBRARY
- Salvar em `[ACTIVE_COMPANY_PATH]/context/HOOK_LIBRARY.md`

**WORKFLOW_STATE.md:**
- Gerar arquivo de estado inicial do pipeline de conteúdo
- Consultar `references/output-templates.md`, seção WORKFLOW_STATE
- Preencher: slug da empresa, data do setup. Todos os campos de produção ficam como "a definir". Todos os estágios (Ideation, Research, etc.) ficam como "Pendente".
- Salvar em `[ACTIVE_COMPANY_PATH]/context/WORKFLOW_STATE.md`

**Checklist Final:**
Apresentar o checklist de verificação abaixo e marcar SETUP_STATE.md como "completo".

---

## SETUP_STATE.md — Template

Criar este arquivo em `[ACTIVE_COMPANY_PATH]/SETUP_STATE.md`:

```markdown
# Setup State — [slug]

**Empresa:** [slug]
**Caminho:** [ACTIVE_COMPANY_PATH]
**Modo:** A-auto-draft | B-conversacional | C-minimo-viavel
**Perfil:** startup | consolidada | enterprise
**Startup flags:** [lista — ex: sem_site, sem_clientes, hipoteses_dominantes, ticket_indefinido, maturidade_curta, estagio_validando]
**Site:** [URL se fornecida, ou "não informado"]
**Iniciado em:** [data]

> Se `perfil: startup`, todas as skills consultam `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md` no seu Passo 1 e aplicam os ajustes da tabela (seção 3).

## Progresso

| Bloco | Arquivo | Status |
|---|---|---|
| 1 — Perfil da empresa | COMPANY_PROFILE.md | [ ] pendente |
| 2 — Produto | PRODUCT_CONTEXT.md | [ ] pendente |
| 3 — Público | audiences/AUDIENCE_[nome].md (1 por persona) | [ ] pendente |
| 4 — Tom de voz | BRAND_VOICE.md | [ ] pendente |
| 5 — Concorrentes | COMPETITOR_MAP.md | [ ] pendente |
| 6 — Pilares | CONTENT_PILLARS.md | [ ] pendente |
| 7 — Identidade visual | VISUAL_IDENTITY.md | [ ] pendente |
| Final | PLATFORM_SPECS.md + HOOK_LIBRARY.md + WORKFLOW_STATE.md | [ ] pendente |

## Histórico
[data] — Setup iniciado
```

Atualizar o status de cada bloco conforme avança: `[ ] pendente` → `[→] em andamento` → `[x] concluído`.

---

## Checklist Final de Completude

```
SETUP COMPLETO — Checklist de Verificação

Empresa: [slug]
Localização: [ACTIVE_COMPANY_PATH]/context/

✅/⚠️ COMPANY_PROFILE.md
  - Nome: [preenchido/pendente]
  - Site: [preenchido/pendente]
  - Redes sociais: [X de Y preenchidas]
  - Missão: [preenchida/pendente]

✅/⚠️ PRODUCT_CONTEXT.md
  - Descrição: [preenchida/pendente]
  - Features: [X listadas]
  - Diferenciais: [X listados]
  - Proposta de valor: [preenchida/pendente]

✅/⚠️ AUDIENCE_PROFILES.md
  - Personas: [X definidas]
  - Dores: [preenchidas/pendente]
  - Objeções: [preenchidas/pendente]

✅/⚠️ BRAND_VOICE.md
  - Personalidade: [definida/pendente]
  - Espectros: [4/4 definidos]
  - Teste de tom: [aprovado/pendente]
  - Vocabulário: [preenchido/pendente]

✅/⚠️ COMPETITOR_MAP.md
  - Diretos: [X mapeados]
  - Indiretos: [X mapeados]
  - Gaps: [X identificados]

✅/⚠️ CONTENT_PILLARS.md
  - Pilares: [X definidos]
  - Frequência: [definida/pendente]
  - Mix de funil: [definido/pendente]

✅/⚠️ VISUAL_IDENTITY.md
  - Cor primária: [definida/pendente]
  - Fonte: [definida/pendente]
  - Modo: [dark/light/pendente]

✅ AUDIENCE_PROFILES.md — [gerado em context/ consolidando todos os audiences/]
✅ PLATFORM_SPECS.md — [gerado em context/]
✅ HOOK_LIBRARY.md — [gerado em context/ (vazio)]
✅ WORKFLOW_STATE.md — [gerado em context/]
```

Campos com ⚠️ não bloqueiam o pipeline, mas reduzem qualidade. Sugerir preencher depois.

**Se `perfil: startup` em SETUP_STATE.md:** substituir a legenda `✅/⚠️` por `🔴/🟡/🟢` e mudar a mensagem final — ver `references/startup-mode.md`, seção 5 (Diagnóstico final em modo startup). Resumir assim:

> Setup provisório concluído em **X minutos**.
> 🔴 **0 bloqueantes** · 🟡 **Y a validar em campo** · 🟢 **Z opcionais**
> Persona marcada como **provisória — revalidar em 30 dias** com dados reais.
> Pipeline pronto: `/content-ideation` gera as primeiras pautas.

Encerrar (modo padrão) com:
> "Setup concluído para `[slug]`! Você já pode usar `/content` para iniciar a produção de conteúdo. Para retomar qualquer bloco, use a skill específica: `/setup-brand-voice`, `/setup-audience-profiles`, etc.
>
> **Extensão opcional — Copy Foundation:** Se você vai produzir copy de venda direta (sales pages, VSLs, sequências de email), rode `/setup-copy-foundation [slug]`. A skill destila 7 artefatos (Big Idea, Unique Mechanism, Objections, Value Stack, etc.) a partir do setup que você acabou de fazer."

---

## Modo de Atualização Parcial

Quando o usuário quer editar apenas um bloco:

| Intenção | Redirecionar para |
|---|---|
| "Quero atualizar meus concorrentes" | `/setup-competitor-map` |
| "Mudei o tom de voz" | `/setup-brand-voice` |
| "Adicionei uma feature nova" | `/setup-product-context` |
| "Mudamos o Instagram" | `/setup-company-profile` |
| "Mudei as cores da marca" | `/setup-visual-identity` |
| "Adicionei uma nova persona" | `/setup-audience-profiles` |
| "Quero revisar meus pilares" | `/setup-content-pillars` |

Ao redirecionar:
> "Para atualizar [bloco], use `/setup-[slug-bloco]`. Essa skill vai carregar o arquivo atual e guiar a atualização. Depois, vou verificar o impacto nas outras configurações."

Após qualquer atualização parcial, consultar `references/impact-map.md` para verificar cascata de impactos e sugerir atualizações nos arquivos dependentes.

---

## Resumo de Referências

| Arquivo | Quando usar |
|---|---|
| `references/output-templates.md` | Antes de gerar AUDIENCE_PROFILES.md, PLATFORM_SPECS.md, HOOK_LIBRARY.md e WORKFLOW_STATE.md na finalização |
| `references/impact-map.md` | Ao fazer atualização parcial — verificar cascata |
| `references/startup-mode.md` | Sempre consultado por todas as skills (01-07) no Passo 1 quando `perfil: startup`. Define comportamentos condicionais: perguntas críticas apenas, auto-inferência, marcação `[H]`, handoffs narrados, persona provisória. |
