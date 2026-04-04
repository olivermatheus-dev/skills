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
```

Definir `ACTIVE_COMPANY_PATH = [companies_root]/[slug]`

Criar `SETUP_STATE.md` em `[ACTIVE_COMPANY_PATH]/SETUP_STATE.md` (ver template abaixo).

Confirmar: "Empresa `[slug]` criada em `[ACTIVE_COMPANY_PATH]`. Vou agora iniciar a configuração."

### Passo 3: Selecionar Caminho de Setup

Perguntar qual caminho o usuário prefere:

**Caminho Auto-Draft** (recomendado se tem site):
> "Posso analisar seu site e redes sociais para gerar um rascunho inicial de todos os blocos. Você só revisa, corrige e complementa. É mais rápido — cerca de 5-10 minutos."

**Caminho Conversacional** (do zero):
> "Vou te guiar pergunta por pergunta. Mais preciso, leva 15-20 minutos."

**Protocolo Auto-Draft:**
1. Receber URL do site + redes sociais
2. Acessar via web e analisar: textos do site, about, features, pricing, CSS (cores, fontes), meta descriptions, posts recentes
3. Gerar rascunho de TODOS os 7 blocos de uma vez
4. Salvar todos os rascunhos em `[ACTIVE_COMPANY_PATH]/context/` com sufixo `-draft`
5. Apresentar bloco por bloco para revisão: "Aqui está o que encontrei sobre [bloco]. O que precisa corrigir?"
6. Ajustar conforme feedback e salvar versão final

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
- Ler todos os arquivos `AUDIENCE_[nome].md` em `[ACTIVE_COMPANY_PATH]/audiences/`
- Consultar `references/output-templates.md`, seção AUDIENCE_PROFILES, para a estrutura exata
- Para cada persona encontrada, extrair e preencher: Quem é, Cargo/Papel, Tamanho da empresa, Dor principal, O que já tentou, Nível de consciência, Objeções principais (3 com resposta recomendada), Onde consome conteúdo, Fala como, Gatilhos emocionais
- Incluir o Mapa de Consciência × Conteúdo ao final, preenchido com os níveis reais presentes nas personas
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
**Modo:** conversacional | auto-draft
**Site:** [URL se fornecida, ou "não informado"]
**Iniciado em:** [data]

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

Encerrar com:
> "Setup concluído para `[slug]`! Você já pode usar `/content` para iniciar a produção de conteúdo. Para retomar qualquer bloco, use a skill específica: `/setup-brand-voice`, `/setup-audience-profiles`, etc."

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
