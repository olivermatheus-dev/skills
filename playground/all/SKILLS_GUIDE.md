# Guia de Arquitetura de Skills

> Referência permanente para criar novas skills e arquitetar fluxos neste repositório.
> Use a [Seção 16 — Referência Rápida](#16--referência-rápida) para consultas rápidas.

---

## Sumário

1. [Visão Geral da Arquitetura](#1--visão-geral-da-arquitetura)
2. [Anatomia de uma Skill](#2--anatomia-de-uma-skill)
3. [O SKILL.md: Guia de Escrita](#3--o-skillmd-guia-de-escrita)
   - [3.1 Frontmatter YAML](#31--frontmatter-yaml)
   - [3.2 Os Três Níveis de Carregamento](#32--os-três-níveis-de-carregamento)
   - [3.3 Template Canônico do Corpo](#33--template-canônico-do-corpo)
   - [3.4 Regras de Estilo de Escrita](#34--regras-de-estilo-de-escrita)
4. [Padrões de Referências (`references/`)](#4--padrões-de-referências-references)
5. [Context Files: o Sistema de Conhecimento da Empresa](#5--context-files-o-sistema-de-conhecimento-da-empresa)
6. [Gestão de Estado: WORKFLOW_STATE.md](#6--gestão-de-estado-workflow_statemd)
7. [O Padrão de Output/Handoff entre Skills](#7--o-padrão-de-outputhandoff-entre-skills)
8. [Padrão Orquestrador](#8--padrão-orquestrador)
9. [Padrões de Subagentes](#9--padrões-de-subagentes)
10. [Padrão `agents/`: Agentes Especializados](#10--padrão-agents-agentes-especializados)
11. [Padrão `scripts/`: Scripts Reutilizáveis](#11--padrão-scripts-scripts-reutilizáveis)
12. [Criando uma Nova Skill do Zero](#12--criando-uma-nova-skill-do-zero)
13. [Criando um Novo Fluxo de Skills](#13--criando-um-novo-fluxo-de-skills)
14. [Erros Comuns e Como Evitá-los](#14--erros-comuns-e-como-evitá-los)
15. [Checklist: Criando uma Nova Skill](#15--checklist-criando-uma-nova-skill)
16. [Referência Rápida](#16--referência-rápida)
- [Apêndice A — Estrutura Completa do Projeto](#apêndice-a--estrutura-completa-do-projeto)
- [Apêndice B — Fluxo Completo de Conteúdo](#apêndice-b--fluxo-completo-de-conteúdo)

---

## 1 — Visão Geral da Arquitetura

### Modelo mental fundamental

Skills não são scripts executáveis. São **contexto especializado** que o Claude carrega sob demanda. Quando uma skill é ativada, o Claude lê o `SKILL.md` e passa a operar dentro das instruções ali definidas — com o papel, os critérios de qualidade, os arquivos que deve consultar e o output que deve produzir.

```
Usuário → Claude Code → Detecta intenção → Carrega SKILL.md
         → Lê context files → Executa → Gera OUTPUT_*.md → Atualiza estado
```

### Os dois tipos de skill neste projeto

| Tipo | Exemplo | Papel |
|---|---|---|
| **Orquestradora** | `content`, `setup-briefing` | Detecta intenção, roteia para skill certa, mantém estado do pipeline |
| **Folha** | `content-writer`, `hooks-factory` | Executa uma etapa específica do pipeline e produz um output bem definido |

Uma orquestradora nunca produz o conteúdo diretamente. Uma skill folha nunca decide para onde o pipeline vai depois.

### Os dois planos do sistema

| Plano | O que vive lá | Localização |
|---|---|---|
| **Skills (código)** | Instruções, templates, frameworks — o "como fazer" | `~/.claude/skills/[nome-da-skill]/` |
| **Dados (conteúdo)** | Context files de empresa, outputs de conteúdo — o "o quê" | `~/companies/[slug]/` |

**Princípio de separação:** uma skill nunca contém dados de uma empresa específica. Os dados de uma empresa nunca contêm lógica de processamento. Misturar os dois planos quebra a reutilização: a mesma skill deve funcionar para qualquer empresa.

---

## 2 — Anatomia de uma Skill

### Estrutura mínima (o que este projeto usa hoje)

```
minha-skill/
├── SKILL.md                    ← OBRIGATÓRIO: instruções + frontmatter YAML
└── references/                 ← base de conhecimento carregada sob demanda
    ├── frameworks.md           ← metodologias e critérios de decisão
    ├── templates.md            ← exemplos reutilizáveis
    └── output-template.md      ← estrutura exata do arquivo de saída
```

### Estrutura completa (com recursos avançados)

```
minha-skill/
├── SKILL.md                    ← instruções + frontmatter
├── references/                 ← conhecimento carregado sob demanda
├── agents/                     ← instruções para subagentes especializados
│   ├── evaluator.md            ← agente que avalia outputs com olhos frescos
│   └── executor.md             ← agente que executa uma variante da tarefa
├── scripts/                    ← scripts Python/Bash reutilizáveis
│   └── score_hooks.py          ← cálculo determinístico; não reescreve a cada sessão
└── assets/                     ← arquivos usados nos outputs
    └── template.html           ← template HTML para carrosseis, relatórios, etc.
```

### Quando usar cada pasta

| Pasta | Usar quando | Não usar quando |
|---|---|---|
| `references/` | Há frameworks, templates, specs que a skill consulta conforme necessário | O conteúdo cabe inteiramente no SKILL.md sem deixá-lo enorme |
| `agents/` | Partes do trabalho devem rodar em paralelo ou precisam de avaliação independente | A tarefa é linear e o Claude faz tudo em sequência sem precisar de "olhos frescos" |
| `scripts/` | Há cálculo determinístico, agregação ou transformação de arquivo repetível entre sessões | A lógica é simples demais para merecer um script separado |
| `assets/` | A skill gera outputs que dependem de arquivos externos (HTML templates, fontes, ícones) | Os outputs são puramente texto em Markdown |

> **Estado atual deste projeto:** todas as skills usam apenas `SKILL.md` + `references/`. Os padrões `agents/` e `scripts/` são o próximo nível de complexidade, documentados aqui para quando o pipeline precisar de paralelismo ou avaliação automatizada.

---

## 3 — O SKILL.md: Guia de Escrita

### 3.1 — Frontmatter YAML

```yaml
---
name: nome-da-skill           # slug kebab-case, único, sem espaços, sem acentos
description: "Descrição..."   # o mecanismo de ativação — detalhado abaixo
---
```

#### Regras para `name`

- Kebab-case sem acentos: `content-writer`, não `escritor-de-conteúdo`
- Deve refletir o que a skill faz, não onde ela fica na pasta numerada
- O `name` no frontmatter vira o slash command após instalação

#### Regras para `description` — o campo mais importante

A `description` é o **único critério** que o Claude usa para decidir se uma skill é relevante. Quando o usuário envia uma mensagem, o Claude vê a lista de todas as skills disponíveis com apenas `name + description` e decide qual acionar. Portanto, a description precisa:

1. **Dizer o que faz** — resumo em 1 frase
2. **Dizer quando acionar** — contextos e estágios do pipeline
3. **Incluir frases literais** que o usuário provavelmente vai digitar
4. **Ser levemente "pushy"** — é melhor acionar e não ser necessária do que deixar passar uma invocação legítima

**Comparação: description fraca vs. forte**

| Fraca | Forte |
|---|---|
| "Escreve conteúdo." | "Redige conteúdo-pilar completo a partir de pesquisa e hooks selecionados. Use quando o usuário tiver tema pesquisado e hooks aprovados e quiser produzir o conteúdo final, ou quando pedir para escrever artigos, posts longos, scripts de vídeo, ou qualquer peça de conteúdo completa. Também use quando mencionar 'escrever o post', 'redigir', 'agora escreve', 'cria o conteúdo', 'monta o texto', 'faz o copy', 'script para vídeo'." |
| "Gera hooks." | "Gera hooks virais e headlines para conteúdo, organizados por gatilho psicológico e ranqueados por potencial. Use quando o usuário tiver um tema pesquisado e precisar de ganchos, ou quando pedir hooks, ganchos, headlines, chamadas, título para o post, primeira linha, como abrir o conteúdo." |
| "Orquestra o pipeline." | "Orquestra o pipeline de produção de conteúdo para redes sociais. Esta é a PRIMEIRA skill a ser consultada quando o assunto é conteúdo. (...) Use SEMPRE que o usuário quiser produzir conteúdo, gerar ideias, pesquisar temas, criar hooks, escrever posts (...) mesmo que outra skill pareça mais específica." |

A description da `content-orchestrator` real inclui exemplos literais de frases do usuário e instrui o Claude a acionar esta skill "mesmo que outra skill pareça mais específica" — isso resolve o problema de competição entre skills.

---

### 3.2 — Os Três Níveis de Carregamento

Skills usam um sistema de **progressive disclosure**. Não tudo é carregado ao mesmo tempo.

| Nível | O que é | Tamanho alvo | Sempre em contexto? |
|---|---|---|---|
| **1 — Metadados** | `name` + `description` do frontmatter | ~100 palavras | Sim — para todas as skills instaladas |
| **2 — Corpo do SKILL.md** | As instruções completas da skill | < 500 linhas | Sim — quando a skill é ativada |
| **3 — References** | Arquivos em `references/` | Ilimitado | Não — carregados sob demanda conforme necessário |

**Regra prática:** se o SKILL.md está se aproximando de 500 linhas, é sinal de que conhecimento detalhado deveria estar em `references/`. O corpo do SKILL.md deve ser um **roteiro de execução**; o conhecimento aprofundado fica nos arquivos de referência.

**Como referenciar arquivos sob demanda** (padrão usado no `content-writer`):

```markdown
### Arquivos de referência (carregar sob demanda)

| Arquivo | Quando carregar |
|---|---|
| `references/copy-frameworks.md` | Ao selecionar o framework de copy para o funil |
| `references/storytelling-guide.md` | Quando o conteúdo abre com história, caso ou POV |
| `references/output-template.md` | Ao gerar o OUTPUT_WRITER.md ao final da sessão |
```

O Claude carrega apenas o arquivo relevante no momento relevante — não todos de uma vez.

---

### 3.3 — Template Canônico do Corpo

Use esta estrutura como ponto de partida para qualquer skill folha. Nem toda seção é obrigatória — adapte ao que a skill precisa.

```markdown
---
name: minha-skill
description: "..."
---

# Skill N — Nome Descritivo

## Role Definition
[Quem o Claude é quando esta skill está ativa.
 3–5 frases que definem o estado mental, não apenas as tarefas.
 O que ele prioriza. Como ele pensa o problema. Como é uma sessão bem-sucedida.]

---

## Pipeline Context

| Posição | Skill | O que entrega |
|---|---|---|
| **Anterior** | Skill N-1 — Nome | `OUTPUT_ANTERIOR.md` com [conteúdo] |
| **Atual** | **Skill N — Esta Skill** | `OUTPUT_ATUAL.md` com [conteúdo] |
| **Próxima** | Skill N+1 — Nome | [o que espera receber desta skill] |

**Input mínimo necessário:** [o que precisa para funcionar sem o pipeline completo]

---

## Context Files

> **Caminho:** todos os context files estão em `[ACTIVE_COMPANY_PATH]/context/`

### Carregar ANTES de executar
- `ARQUIVO_OBRIGATORIO.md` — por que é necessário e o que a skill extrai dele

### Carregar se disponível
- `ARQUIVO_OPCIONAL.md` — o que melhora quando disponível

### NÃO carregar
`ARQUIVO_A`, `ARQUIVO_B`, `ARQUIVO_C`
[Explique por que: "informação irrelevante para esta etapa que apenas polui o contexto"]

### Arquivos de referência (carregar sob demanda)
| Arquivo | Quando carregar |
|---|---|
| `references/arquivo.md` | Em qual situação específica |

---

## Input Esperado

Perguntar ao usuário antes de iniciar (se não vier dos outputs anteriores):
1. [Pergunta específica]
2. [Pergunta específica]

Se OUTPUT_ANTERIOR.md estiver disponível, extrair diretamente — não perguntar o que já está documentado.

---

## Procedimento de Execução

Execute nesta ordem:

1. **Verificar context files** — se [arquivo crítico] ausente, aplicar Fallback A
2. **Confirmar input** — [o que precisa confirmar com o usuário]
3. **Carregar `references/[arquivo].md`** — [quando/por que]
4. **[Executar trabalho principal]**
5. **Verificar checklist pré-entrega**
6. **Gerar `OUTPUT_[NOME].md`** — usando `references/output-template.md`; salvar em `[CONTENT_PIECE_PATH]/`
7. **Atualizar `WORKFLOW_STATE.md`** em `[CONTENT_PIECE_PATH]/` — ANTES de apresentar ao usuário
8. **Apresentar output e Resumo Obrigatório** — aguardar aprovação

---

## [Seções de Conhecimento Específico da Skill]
[Tabelas de seleção, regras de qualidade, taxonomias, frameworks]
[Este é o "know-how" proprietário da skill]

---

## Checklist Pré-Entrega

Verificar ANTES de apresentar ao usuário:
- [ ] [Critério verificável]
- [ ] [Critério verificável]

---

## Fallbacks

### Fallback A — [Nome do cenário]
[O que fazer quando o arquivo crítico falta. Como compensar. O que avisar ao usuário.]

### Fallback B — [Outro cenário]
[...]

---

## Resumo Obrigatório e Transição

### Campos do WORKFLOW_STATE.md a atualizar
[Bloco exato de texto para colar no WORKFLOW_STATE]

### Formato do resumo
[Parágrafo de 3-5 frases cobrindo: o que foi produzido, decisões tomadas, próximos passos]

### Pergunta de transição padrão
> "[Texto da pergunta que encerra a sessão desta skill]"

---

## Referências

| Arquivo | Finalidade |
|---|---|
| `references/arquivo.md` | O que contém e quando usar |
```

---

### 3.4 — Regras de Estilo de Escrita

**Use o modo imperativo.** "Carregar BRAND_VOICE.md antes de escrever", não "O Claude deve carregar BRAND_VOICE.md".

**Explique o porquê, não só o o quê.** Compare:
- Fraco: "NÃO carregar COMPETITOR_MAP nesta skill."
- Forte: "NÃO carregar COMPETITOR_MAP — o conteúdo já está sendo redigido; análise de concorrentes polui o contexto de redação com informações irrelevantes para esta etapa."

O Claude entende e respeita melhor quando sabe a razão.

**Prefira tabelas** para mapeamentos (framework × funil, arquivo × quando usar) e matrizes de seleção.

**Prefira listas numeradas** para procedimentos sequenciais onde a ordem importa.

**Prefira blocos de código** para templates de output, exemplos de formato, exemplos de frontmatter YAML.

**Evite MUST e NEVER em caps.** Prefira explicar a razão. Instruções imperativas com o porquê claro funcionam melhor do que mandamentos em caixa alta.

**Cada seção deve responder uma pergunta específica.** Se você não sabe qual pergunta a seção responde, ela provavelmente não deveria existir.

---

## 4 — Padrões de Referências (`references/`)

### Os quatro tipos de arquivo de referência

| Tipo | Nome típico | Conteúdo | Quando criar |
|---|---|---|---|
| **Template de output** | `output-template.md` | Estrutura exata do `OUTPUT_*.md` que a skill gera | Toda skill que gera um arquivo de output |
| **Framework/metodologia** | `copy-frameworks.md`, `funnel-guide.md` | A teoria, critérios de decisão e estrutura passo a passo | Quando o SKILL.md referencia critérios complexos que cresceriam demais no corpo |
| **Banco de exemplos** | `hook-templates.md`, `idea-bank.md` | Exemplos reutilizáveis para calibração e referência | Quando há padrões estruturais que o Claude pode reaproveitar e adaptar |
| **Specs técnicas** | `platform-specs.md`, `slide-types.md` | Especificações detalhadas por variante | Quando há múltiplas variantes (7 plataformas, 6 tipos de slide) cada uma com regras próprias |

### Padrão de organização por domínio

Quando uma skill suporta múltiplas variantes (por exemplo, um adaptador de plataformas), organize as specs em arquivos separados por variante:

```
platform-adapter/references/
├── platform-specs.md        ← specs de todas as plataformas (se couber em 300 linhas)
```

Ou, se cada variante tiver muitas regras:

```
cloud-deploy/references/
├── aws.md                   ← regras específicas para AWS
├── gcp.md                   ← regras específicas para GCP
└── azure.md                 ← regras específicas para Azure
```

O SKILL.md instrui: "carregar `references/[plataforma].md` conforme a plataforma solicitada" — o Claude lê apenas o arquivo relevante, não todos.

### Regra de tamanho

Para arquivos de referência com mais de 300 linhas, incluir um **sumário no topo** com links âncora para cada seção. Isso permite que o Claude encontre a seção relevante sem ler o arquivo inteiro.

```markdown
## Sumário
- [AIDA — Awareness/TOFU](#aida)
- [PAS — Consideração/MOFU](#pas)
- [4Ps — Conversão/BOFU](#4ps)
```

---

## 5 — Context Files: o Sistema de Conhecimento da Empresa

### A distinção fundamental

| Tipo | O que é | Onde vive | Quem cria |
|---|---|---|---|
| **Context files** | Dados específicos de uma empresa: tom de voz, produto, personas, concorrentes | `~/companies/[slug]/context/` | Skill de setup; atualizado pelo usuário |
| **Reference files** | Conhecimento da skill: frameworks, templates, metodologias | `~/.claude/skills/[skill]/references/` | Neste repositório; é o "know-how" |

Uma skill consulta context files para saber **sobre quem está trabalhando**. Consulta reference files para saber **como fazer o trabalho**.

### Os 9 context files deste projeto

| Arquivo | Conteúdo | Skills que obrigatoriamente usam |
|---|---|---|
| `COMPANY_PROFILE.md` | Missão, setor, história, posicionamento | Setup |
| `PRODUCT_CONTEXT.md` | Features, diferenciais, planos, limitações | Research, Writer |
| `BRAND_VOICE.md` | Tom, vocabulário, palavras proibidas, nível de formalidade | Hooks, Writer, Adapter |
| `AUDIENCE_PROFILES.md` | Personas, dores, linguagem literal, nível de consciência | Ideation, Research, Hooks, Writer, Adapter, Derivatives |
| `COMPETITOR_MAP.md` | Concorrentes, gaps de conteúdo, diferencial percebido | Ideation, Research |
| `CONTENT_PILLARS.md` | Pilares temáticos, proporção de funil por pilar | Ideation, Calendar |
| `VISUAL_IDENTITY.md` | Tokens de design: cores, fontes, gradients, radius | Carousel Creator |
| `PLATFORM_SPECS.md` | Frequência, formatos e horários por plataforma | Adapter, Derivatives, Calendar, Carousel |
| `HOOK_LIBRARY.md` | Biblioteca de hooks que já performaram (atualizada pelo Analyzer) | Hooks (opcional) |

### Mapa de dependências (do `content-orchestrator`)

| Skill | Context files obrigatórios |
|---|---|
| Ideation | CONTENT_PILLARS, AUDIENCE_PROFILES, COMPETITOR_MAP, PRODUCT_CONTEXT |
| Research | PRODUCT_CONTEXT, AUDIENCE_PROFILES, COMPETITOR_MAP |
| Hooks | BRAND_VOICE, AUDIENCE_PROFILES |
| Writer | BRAND_VOICE, PRODUCT_CONTEXT, AUDIENCE_PROFILES |
| Platform Adapter | PLATFORM_SPECS, BRAND_VOICE |
| Derivatives | PLATFORM_SPECS |
| Analyzer | HOOK_LIBRARY (opcional) |
| Calendar | CONTENT_PILLARS, PLATFORM_SPECS |
| Carousel Creator | VISUAL_IDENTITY, BRAND_VOICE, PLATFORM_SPECS |

### Regras para lidar com context files em uma skill

**1. Só carregue o que vai usar.** Cada context file desnecessário polui o contexto e pode degradar a qualidade do raciocínio. O `content-writer` não carrega `COMPETITOR_MAP` ou `CONTENT_PILLARS` — esses dados são irrelevantes na hora de redigir.

**2. Liste explicitamente o que NÃO carregar.** A seção "NÃO carregar" é tão importante quanto a lista obrigatória. Exemplo do `content-writer`:
```
### NÃO carregar
`COMPETITOR_MAP`, `CONTENT_PILLARS`, `HOOK_LIBRARY`, `VISUAL_IDENTITY`, `PLATFORM_SPECS`
```

**3. Aplique degradação graciosa quando um arquivo falta.** Nunca quebrar a execução. Para cada arquivo obrigatório, defina um Fallback: o que inferir, o que avisar, o que perguntar ao usuário.

---

## 6 — Gestão de Estado: WORKFLOW_STATE.md

### O problema que o WORKFLOW_STATE resolve

Sem ele, cada sessão começa do zero. O usuário precisa repetir "estou trabalhando com empresa X, o post é sobre Y, já pesquisamos e escolhemos o hook Z" toda vez que abre uma nova conversa. Com o WORKFLOW_STATE, o orquestrador lê o arquivo e retoma exatamente de onde a última sessão parou.

### Localização

Um arquivo por **peça de conteúdo** — não um por empresa:

```
~/companies/[slug]/contents/[YYYY-MM-DD]-[slug-do-tema]/WORKFLOW_STATE.md
```

Cada peça tem seu próprio estado, completamente isolado de outras peças da mesma empresa.

### Ciclo de vida

```
Orquestrador cria o arquivo ao iniciar nova peça
       ↓
Skill folha executa a etapa
       ↓
Skill folha atualiza o bloco correspondente no WORKFLOW_STATE
       ↓
Próxima skill lê o WORKFLOW_STATE para saber o que já foi feito
       ↓
(repete até o pipeline estar completo)
```

### Bloco obrigatório que toda skill folha deve gravar

```markdown
### [Nome da Skill] (Skill N)
- Status: Completo
- Output: OUTPUT_[NOME].md gerado
- [Campo específico da skill]: [valor]
- Resumo: [1-2 frases sobre o que foi produzido e decisões tomadas]
```

Exemplo real do `content-writer`:

```markdown
### Writer (Skill 4)
- Status: Completo
- Output: OUTPUT_WRITER.md gerado
- Formato: post longo LinkedIn
- Framework usado: PAS
- Tags de atomização: 6 tags inseridas
- Resumo: Conteúdo de 1.400 caracteres sobre follow-up para gestores, framework PAS, abertura com história de caso real.
```

### Regra de timing crítica

**Atualizar o WORKFLOW_STATE ANTES de apresentar o output ao usuário.**

Se a sessão cair no exato momento em que o usuário recebe o conteúdo, o estado deve estar salvo. Na ordem do Procedimento de Execução, "gerar output" e "atualizar WORKFLOW_STATE" vêm sempre antes de "apresentar ao usuário".

---

## 7 — O Padrão de Output/Handoff entre Skills

### O contrato de handoff

Toda skill folha gera um `OUTPUT_[NOME].md` ao final da execução. Esse arquivo é:
- O **entregável** que o usuário pode baixar a qualquer momento
- O **input** que a próxima skill no pipeline lê

A localização é sempre `[CONTENT_PIECE_PATH]/OUTPUT_[NOME].md`.

### Tabela completa de outputs do pipeline

| Skill | Arquivo gerado | Conteúdo |
|---|---|---|
| Ideation | `OUTPUT_IDEATION.md` | Lista de ideias ranqueadas com metadata por card |
| Research | `OUTPUT_RESEARCH.md` | Pesquisa estruturada com fontes, dados e gaps |
| Hooks | `OUTPUT_HOOKS.md` | Hooks ranqueados com scores e justificativas |
| Writer | `OUTPUT_CONTENT.md` | Conteúdo-pilar com marcações de atomização |
| Platform Adapter | `OUTPUT_ADAPTED.md` | Versões formatadas por plataforma |
| Derivatives | `OUTPUT_DERIVATIVES.md` | Mapa de derivados com prioridade |
| Analyzer | `OUTPUT_ANALYSIS.md` | Análise WHAT-WHY-NEXT + hooks para biblioteca |
| Calendar | `OUTPUT_CALENDAR.md` | Calendário editorial com slots preenchidos |
| Carousel | `carousel/slide-N.html` | Arquivos HTML standalone por slide |

### O padrão `output-template.md`

Toda skill que gera um `OUTPUT_*.md` deve ter um `references/output-template.md` com a estrutura exata do arquivo. Isso serve como:
- Contrato para a skill downstream saber onde encontrar cada dado
- Garantia de consistência entre sessões diferentes

Sem esse template, o formato do output muda conforme a conversa — e a skill seguinte não sabe o que esperar.

### As tags de atomização — o sistema de handoff semântico do Writer

O `content-writer` insere marcações HTML comment no conteúdo antes de entregá-lo. Essas tags funcionam como metadados em linha que sobrevivem ao handoff:

```html
<!-- HOOK_PRINCIPAL: "texto do hook" -->
<!-- DADO_DESTAQUE: "estatística ou dado impactante" -->
<!-- CITAÇÃO_AUTORIDADE: "citação de especialista" -->
<!-- INSIGHT_CHAVE: "insight que pode virar post solo" -->
<!-- LISTA_DERIVÁVEL: "lista que pode virar carrossel" -->
<!-- HISTÓRIA: "narrativa que pode virar reels/story" -->
<!-- CTA: "call to action" -->
```

**Por que isso importa para o pipeline:**
- **Derivatives** (Skill 5B) lê as tags para mapear automaticamente quais derivados são viáveis — uma `LISTA_DERIVÁVEL` vira carrossel, uma `HISTÓRIA` vira Reels
- **Platform Adapter** (Skill 5A) preserva o `HOOK_PRINCIPAL` exatamente como escrito ao adaptar para cada plataforma
- O usuário pode reutilizar o mesmo `OUTPUT_CONTENT.md` em sessões futuras sem precisar re-identificar o que pode ser derivado

**Regra de densidade:** mínimo 4 tags em conteúdos de 400+ palavras. `HOOK_PRINCIPAL` e `CTA` são obrigatórios em todo conteúdo.

---

## 8 — Padrão Orquestrador

### As cinco responsabilidades de uma skill orquestradora

1. **Detectar intenção** — mapear o que o usuário quer para a skill correta
2. **Resolver contexto** — identificar empresa ativa e peça de conteúdo em andamento
3. **Verificar pré-requisitos** — confirmar que os context files necessários existem antes de rotear
4. **Criar e manter o estado** — WORKFLOW_STATE por peça de conteúdo
5. **Aceitar atalhos** — nunca bloquear o pipeline; o usuário pode entrar em qualquer etapa

### Fluxo de decisão

```
Mensagem do usuário
      ↓
Detectar intenção (tabela de roteamento)
      ↓
Resolver empresa ativa ──── se não existe ──→ Redirecionar para setup
      ↓
Identificar/criar peça de conteúdo
      ↓
Verificar context files ──── se faltam ──→ Oferecer setup completo ou mínimo
      ↓
Se intenção clara e direta → Rotear imediatamente sem atrito
Se intenção vaga → Guiar o usuário com opções
Se já em pipeline → Retomar de onde parou (WORKFLOW_STATE)
```

### Tabela de roteamento (do `content-orchestrator` real)

| Sinal do usuário | Skill de destino |
|---|---|
| "configurar", "setup", "primeira vez", "mudar cores", "atualizar persona" | Setup (`/setup-briefing`) |
| "ideias", "temas", "sobre o que postar", "brainstorm" | Ideation |
| "pesquisar", "aprofundar", "dados sobre", "estatísticas" | Research |
| "hook", "gancho", "headline", "primeira linha", "scroll-stopper" | Hooks Factory |
| "escrever", "redigir", "criar post", "copy", "script" | Content Writer |
| "adaptar", "LinkedIn", "Instagram", "Reels", "formatar para" | Platform Adapter |
| "derivar", "transformar", "tierlist", "reaproveitar" | Derivatives |
| "performance", "métricas", "o que funcionou", "analytics" | Performance Analyzer |
| "calendário", "planejamento", "semana", "grade" | Editorial Calendar |
| "carrossel", "carousel", "slides", "arte", "post visual" | Carousel Creator |

### Atalhos obrigatórios

| Situação | Atalho |
|---|---|
| Usuário já tem tema definido | Pular direto para Research ou Hooks |
| Usuário já tem conteúdo bruto | Ir para Derivatives ou Adapter |
| Quer só hooks para um tema | Hooks direto (sem Research completo) |
| Quer carrossel de algo escrito | Carousel Creator direto |
| Quer analisar um post publicado | Analyzer direto |
| Diz "escreve sobre X" com context files disponíveis | Writer direto sem passar por Ideation/Research |

### Anti-padrão: orquestradora que adiciona atrito

Se o usuário diz "escreve um post sobre follow-up" e os context files existem, rotear direto para o Writer. Não forçar Ideation → Research → Hooks antes. O pipeline é uma sugestão de qualidade, não um bloqueio.

### Os dois designs de orquestrador neste projeto

| Design | Exemplo | Comportamento |
|---|---|---|
| **Roteador reativo** | `content` | Responde ao que o usuário quer; qualquer etapa é válida como entrada; não há sequência obrigatória |
| **Guia linear** | `setup-briefing` | Há uma sequência preferida (7 blocos em ordem); conduz o usuário pelo caminho completo; mas permite atualização parcial de blocos específicos |

Use o design reativo quando o pipeline tem muitos caminhos possíveis. Use o design linear quando há uma sequência que maximiza a qualidade do resultado final.

---

## 9 — Padrões de Subagentes

Subagentes são instâncias isoladas do Claude que o agente principal spawna para executar tarefas específicas. Cada subagente tem contexto isolado — não vê a conversa principal nem os outros subagentes. A comunicação entre eles acontece via **arquivos no sistema**.

> **Estado atual:** este projeto não usa subagentes ainda. Estes padrões são documentados para quando o pipeline evoluir para automação completa de etapas.

---

### Padrão 1: Executor Paralelo

**Quando usar:** tarefas independentes que podem rodar simultaneamente e cujos resultados são depois agregados.

**Como funciona:**
```
Agente Principal
├── spawn → Subagente A: tarefa A → salva em outputs/a/
├── spawn → Subagente B: tarefa B → salva em outputs/b/
└── spawn → Subagente C: tarefa C → salva em outputs/c/
[Rodam em paralelo — tempo total ≈ tempo de 1 subagente]
Agente Principal coleta e agrega os resultados
```

**Aplicação neste pipeline:** Platform Adapter rodando LinkedIn + Instagram + TikTok simultaneamente em vez de sequencialmente. Tempo de execução cai de 3× para ~1×.

**Como escrever no SKILL.md:**
```markdown
## Execução paralela
Spawn um subagente para cada plataforma no mesmo turno:

**Subagente LinkedIn:** adaptar para LinkedIn → salvar em `outputs/linkedin.md`
**Subagente Instagram:** adaptar para Instagram → salvar em `outputs/instagram.md`
**Subagente TikTok:** adaptar para TikTok → salvar em `outputs/tiktok.md`

Aguardar todos terminarem. Agregar em `OUTPUT_ADAPTED.md`.
```

---

### Padrão 2: Executor + Avaliador

**Quando usar:** a qualidade do output é crítica e vale ter "olhos frescos" avaliando o resultado de forma independente.

**Como funciona:**
```
Agente Principal
├── spawn → Executor: executa a tarefa → salva output em outputs/
└── spawn → Avaliador: lê outputs/ → avalia contra critérios → salva grading.json
[Podem rodar em paralelo se os critérios já existem]
Agente Principal lê grading.json → decide se aceita ou itera
```

**Por que o avaliador precisa ser independente:** um agente que gerou um output tende a avaliá-lo mais favoravelmente — está influenciado pelo processo de geração. O avaliador não tem esse viés porque não viu como o output foi construído, apenas o resultado.

**Aplicação neste pipeline:** Content Writer gera o conteúdo; um segundo agente verifica o checklist de qualidade (hook não alterado? framework seguido? tags de atomização presentes?) sem ter participado da redação.

---

### Padrão 3: Comparação com Baseline

**Quando usar:** ao criar ou melhorar uma skill, para medir objetivamente se ela agrega valor.

**Como funciona:**
```
Agente Principal
├── spawn → Run A: mesma tarefa + skill ativa → salva em with_skill/
└── spawn → Run B: mesma tarefa sem skill → salva em without_skill/
[Simultâneo]
spawn → Comparador cego: recebe A e B sem saber qual é qual → julga qual é melhor
Agente Principal desvenda: A=com skill, B=sem skill → quantifica o delta
```

**Aplicação neste pipeline:** Hooks Factory com a skill vs. sem a skill para o mesmo tema. O comparador cego escolhe o melhor conjunto de hooks. O delta de qualidade justifica (ou questiona) a skill.

---

### Padrão 4: Pipeline Sequencial via Arquivos

**Quando usar:** subagentes precisam passar resultados entre si em sequência.

**Como funciona:**
```
Agente Principal
├── spawn → Subagente Pesquisa → salva research/data.md
├── [aguarda] → lê research/data.md
├── spawn → Subagente Hooks (recebe path de research/data.md) → salva hooks/options.md
└── spawn → Subagente Writer (recebe path de hooks/options.md) → salva content/final.md
```

**Aplicação neste pipeline:** é exatamente o que o pipeline faz hoje — cada skill escreve um `OUTPUT_*.md` que o próximo lê. A diferença é que hoje o usuário coordena as transições manualmente. Subagentes sequenciais automatizariam isso.

**Insight importante:** o protocolo `OUTPUT_*.md` que este pipeline já usa **é exatamente o protocolo de handoff** que subagentes sequenciais precisam. Adicionar subagentes no futuro não requer redesenho da arquitetura — só automação do que o usuário hoje faz manualmente entre sessões.

---

## 10 — Padrão `agents/`: Agentes Especializados

### O que é um arquivo de agente

Um arquivo `.md` em `agents/` define o papel completo de um subagente especializado: quem ele é, o que recebe, como processa e o que grava em disco. Ele é carregado pelo agente principal apenas quando aquele subagente precisa ser invocado — não fica em contexto o tempo todo.

**A diferença de um SKILL.md:** o arquivo de agente é uma instrução para um subagente que executa uma subtarefa específica dentro de uma skill maior. É autocontido: o agente que o lê deve conseguir executar sua tarefa sem ler o SKILL.md principal.

### Template canônico de um arquivo de agente

```markdown
# Nome do Agente

[Uma linha: o que ele faz]

## Role
[O papel e a mentalidade do agente — como ele deve pensar o problema]

## Inputs
[O que este agente recebe como parâmetros nomeados:]
- `output_path`: caminho para salvar o resultado
- `criteria`: lista de critérios a verificar
- `transcript_path`: caminho do transcript a avaliar

## Process
[Passos numerados de execução — sem ambiguidade]

1. Ler os arquivos de input
2. [Executar a tarefa específica]
3. Gravar resultado em `{output_path}`

## Output Format
[Estrutura exata do que grava em disco — com exemplo completo]
JSON ou Markdown específico, campos fixos.

## Guidelines
[Regras de comportamento e critérios de qualidade]
- O que fazer
- O que não fazer
```

### Exemplos de agentes para este pipeline

| Agente | Propósito | Quando invocar |
|---|---|---|
| `agents/hook-evaluator.md` | Avaliar hooks com "olhos frescos" contra os critérios de scroll-stop, relevância e entregabilidade | Hooks Factory quer Executor + Avaliador |
| `agents/quality-checker.md` | Verificar o checklist do Writer de forma independente | Writer quer avaliação independente do output |
| `agents/platform-adapter-linkedin.md` | Lógica específica de formatação LinkedIn | Platform Adapter usa Executor Paralelo por plataforma |
| `agents/performance-scorer.md` | Calcular scores de performance a partir de métricas brutas | Performance Analyzer quer resultado determinístico |

### Regra de design

O arquivo de agente deve ser autocontido. Não assumir que o agente viu a conversa principal ou o SKILL.md. Passar explicitamente tudo que o agente precisa como parâmetros no prompt de invocação.

---

## 11 — Padrão `scripts/`: Scripts Reutilizáveis

### Quando criar um script

- O Claude percebe que está reescrevendo a mesma lógica em múltiplas sessões
- Há cálculo determinístico que deve produzir o mesmo resultado toda vez (scoring, agregação, ranqueamento)
- Há transformação de arquivo que o Claude faria de forma inconsistente se fizesse "na mão" (gerar HTML, parsear CSV, calcular médias)

### Exemplos hipotéticos para este pipeline

| Script | O que faz | Benefício |
|---|---|---|
| `scripts/score_hooks.py` | Calcula score dos hooks com base nos 3 critérios (scroll-stop, relevância, entregabilidade) × 5 pontos | Resultado consistente entre sessões; não depende do "humor" do Claude |
| `scripts/generate_calendar.py` | Monta a estrutura HTML do calendário editorial com slots por plataforma | Claude não reescreve o HTML toda vez; resultado visualmente consistente |
| `scripts/aggregate_performance.py` | Agrega métricas de múltiplos posts em um único relatório com médias, desvio padrão e tendências | Análise rápida de um mês de dados; evita erros de cálculo manual |
| `scripts/validate_output.py` | Verifica se um `OUTPUT_*.md` tem todos os campos obrigatórios do template | Garante que o output está correto antes de passar para a próxima skill |

### Distinção fundamental: scripts vs. referências

| Scripts | References |
|---|---|
| **Executam**: rodam via `python script.py` ou `bash script.sh` | **São lidos**: o Claude lê e aplica as instruções |
| Para cálculo determinístico e transformação de arquivo | Para frameworks, critérios de decisão e exemplos |
| Resultado idêntico toda vez | O Claude interpreta e adapta ao contexto |

Se o Claude precisa **calcular** algo, é script. Se precisa **consultar** um framework, é referência.

---

## 12 — Criando uma Nova Skill do Zero

### Passo 1: Definir o contrato antes de escrever qualquer coisa

Responda as quatro perguntas:

1. **O que esta skill recebe como input?** (outputs de skills anteriores? pergunta ao usuário? context files?)
2. **O que ela entrega como output?** (nome exato do arquivo, estrutura geral)
3. **Quais context files ela precisa?** (obrigatórios, opcionais, explicitamente excluídos)
4. **Em qual etapa do pipeline ela se encaixa?** (qual vem antes, qual vem depois)

Se você não consegue responder as quatro perguntas com clareza, a skill não está bem definida ainda. Defina o contrato primeiro.

### Passo 2: Nomear corretamente

- **`name` no frontmatter:** kebab-case, sem acentos. Ex: `content-writer`
- **Pasta no repositório:** número + nome descritivo. Ex: `05-writer`
- **Nome instalado:** definido no `install.sh`. Ex: `["content/05-writer"]="content-writer"`

O número na pasta define a posição visual no pipeline, não a lógica de execução.

### Passo 3: Escrever a `description` antes do corpo

Antes de escrever qualquer instrução, escreva a `description`. Isso força clareza sobre:
- Quando a skill DEVE ser acionada (frases literais do usuário)
- Quando a skill NÃO deve ser acionada (near-misses com skills adjacentes)
- O que ela faz de diferente de skills parecidas

Se você escreve o corpo primeiro, tende a escrever uma description que resume o corpo — mas a description não deve resumir, deve **ativar**.

### Passo 4: Definir o Role Definition

Escreva 3–5 frases que definem o estado mental do Claude nesta skill. A diferença entre:
- Fraco: "Você escreve posts para redes sociais."
- Forte (do `content-writer` real): "Você é um redator de conteúdo profissional especializado em redes sociais. Seu papel é transformar dados em narrativa. (...) Uma sessão bem-sucedida termina com o OUTPUT_WRITER.md: conteúdo completo, formatado para o formato solicitado, com marcações de atomização, checklist de qualidade verificado."

O Role Definition define não só as tarefas mas o **critério de sucesso da sessão**.

### Passo 5: Mapear o Pipeline Context

Crie a tabela de 3 linhas: skill anterior → atual → próxima. Se a skill pode ser acionada diretamente (sem passar pela anterior), mencione explicitamente qual é o "Input mínimo necessário" — o que a skill precisa no mínimo para funcionar sem o pipeline completo.

### Passo 6: Listar context files com precisão

Divida em três grupos explícitos:
1. **Carregar ANTES** — obrigatórios, com uma linha explicando o que a skill extrai de cada um
2. **Carregar se disponível** — opcionais que melhoram a qualidade
3. **NÃO carregar** — lista explícita com a razão

Não deixe o terceiro grupo vazio. Se você não listou o que não carregar, o Claude pode carregar arquivos irrelevantes por dedução.

### Passo 7: Escrever o Procedimento de Execução

Lista numerada com todos os passos na ordem exata. Todo procedimento deve incluir:
- **Verificação de pré-requisitos** como passo 1
- **Carregamento de referências** nos passos seguintes (só quando relevante)
- **Execução do trabalho principal**
- **Geração do output** (com nome exato do arquivo e localização)
- **Atualização do WORKFLOW_STATE** — ANTES do próximo passo
- **Apresentar ao usuário e aguardar aprovação** — sempre o último passo

### Passo 8: Criar o `output-template.md` e atualizar o `install.sh`

Antes de finalizar, crie `references/output-template.md` com a estrutura exata do arquivo de saída. Isso é o contrato que a skill downstream vai ler.

Em seguida, adicione ao `install.sh`:

```bash
declare -A CONTENT_SKILLS=(
  # ... skills existentes ...
  ["content/NN-nome-da-skill"]="nome-da-skill"
)
```

---

## 13 — Criando um Novo Fluxo de Skills

### Passo 1: Mapear o pipeline como tabela antes de criar qualquer skill

| Etapa | Skill name | Input | Output | Context files obrigatórios | Pode pular? |
|---|---|---|---|---|---|
| 1 | `minha-skill-a` | Tema do usuário | `OUTPUT_A.md` | BRAND_VOICE | Não |
| 2 | `minha-skill-b` | `OUTPUT_A.md` | `OUTPUT_B.md` | AUDIENCE_PROFILES | Sim, se usuário já tem B |
| ... | | | | | |

Identificar antes de codificar:
- Quais etapas podem rodar em paralelo?
- Quais são dependências rígidas (B não pode rodar sem A)?
- Quais são atalhos naturais (usuário entra na etapa 3 com contexto externo)?

### Passo 2: Designar o orquestrador

Todo fluxo com mais de 2 etapas precisa de uma skill orquestradora. Convenções:
- Sempre numerada `00-` na pasta
- Define o protocolo de roteamento (tabela de intenção → skill)
- É responsável pelo WORKFLOW_STATE (criar, caminhos, atualizar)
- Gerencia a resolução de contexto (empresa, peça, sessão)
- Nunca executa o trabalho das skills folha — só roteia e coordena

### Passo 3: Definir o protocolo de handoff

Antes de escrever qualquer skill folha, defina:

1. **Nomes de output padronizados:** `OUTPUT_[NOME_EM_CAPS].md`
2. **Localização padronizada:** sempre `[CONTENT_PIECE_PATH]/` para peças de conteúdo
3. **Template de output:** criar `references/output-template.md` em cada skill antes de escrever o procedimento de execução

Com o protocolo definido, cada skill folha sabe exatamente onde encontrar o output da skill anterior e onde salvar o próprio output. O orquestrador resolve os caminhos no início da sessão e passa para as skills.

---

## 14 — Erros Comuns e Como Evitá-los

| Erro | Sinal de alerta | Correção |
|---|---|---|
| **Description vaga demais** | A skill nunca é acionada espontaneamente, só com slash command explícito | Adicionar frases literais que o usuário diz; competir explicitamente com skills adjacentes; ser "levemente pushy" |
| **SKILL.md com 800+ linhas** | Difícil de manter; sessões ficam lentas; o Claude usa contexto excessivo | Mover frameworks, tabelas detalhadas e exemplos para `references/`; o corpo deve ser um roteiro, não uma enciclopédia |
| **Todos os context files carregados** | Skill lenta; raciocínio poluído por informação irrelevante para a etapa | Listar explicitamente o que NÃO carregar com a razão; carregar só o que a skill realmente usa |
| **Sem fallback para context file ausente** | Skill quebra completamente ou produz output errado quando falta um arquivo | Definir Fallback A/B/C para cada arquivo obrigatório; nunca travar o pipeline |
| **Output sem template** | O formato do `OUTPUT_*.md` muda entre sessões; a skill downstream não sabe o que esperar | Criar `references/output-template.md` para toda skill que gera um arquivo de output |
| **Orquestradora que bloqueia pipeline** | Usuário frustrado; é forçado a passar por etapas que não precisa | Adicionar atalhos explícitos; aceitar quando o usuário quer pular etapas; rotear diretamente quando a intenção é clara |
| **Skill folha com lógica de roteamento** | A skill tenta decidir para onde o pipeline vai depois | Separar: roteamento é responsabilidade da orquestradora; execução é da skill folha |
| **Seção "NÃO carregar" ausente** | O Claude carrega arquivos irrelevantes por dedução, poluindo o contexto | Sempre incluir a lista explícita; se não tem certeza, liste os arquivos que definitivamente não são necessários |
| **WORKFLOW_STATE atualizado depois do output** | Se a sessão cair após o output ser apresentado, o estado fica desatualizado | Gravar o WORKFLOW_STATE ANTES de apresentar qualquer output ao usuário |
| **Tags de atomização ausentes no Writer** | Derivatives e Adapter não sabem o que reaproveitar; derivação manual e inconsistente | Mínimo 4 tags em conteúdos de 400+ palavras; `HOOK_PRINCIPAL` e `CTA` são sempre obrigatórios |

---

## 15 — Checklist: Criando uma Nova Skill

### Fase 1 — Design (antes de escrever qualquer linha)

- [ ] Defini o contrato: input, output, context files, posição no pipeline
- [ ] Escolhi o `name` correto (kebab-case, sem acentos)
- [ ] Escrevi a `description` antes do corpo (inclui frases literais do usuário)
- [ ] Desenhei a tabela de Pipeline Context (anterior → atual → próxima)
- [ ] Identifiquei context files: obrigatórios / opcionais / explicitamente excluídos
- [ ] Defini o nome exato do arquivo de output (`OUTPUT_[NOME].md`)

### Fase 2 — Escrita do SKILL.md

- [ ] Frontmatter tem `name` e `description`
- [ ] Role Definition define estado mental e critério de sucesso da sessão (não só tarefas)
- [ ] Pipeline Context é a tabela de 3 linhas com inputs e outputs
- [ ] Context files divididos em: obrigatórios / opcionais / NÃO carregar / referências sob demanda
- [ ] Procedimento de Execução é lista numerada com todos os passos em ordem
- [ ] Passos incluem: verificar pré-requisitos → carregar referências → executar → gerar output → atualizar WORKFLOW_STATE → apresentar ao usuário
- [ ] Checklist pré-entrega incluído (itens verificáveis objetivamente)
- [ ] Fallbacks para os cenários mais comuns de degradação (arquivo ausente, input incompleto)
- [ ] Resumo Obrigatório e Transição incluídos (campos do WORKFLOW_STATE + pergunta de transição)
- [ ] Tabela de Referências no final
- [ ] SKILL.md tem menos de 500 linhas (se não: mover conteúdo para `references/`)

### Fase 3 — Resources e Integração

- [ ] `references/output-template.md` criado com a estrutura exata do arquivo de saída
- [ ] Outros arquivos de referência criados em `references/` com o conhecimento necessário
- [ ] `install.sh` atualizado com o mapeamento `["pasta/NN-nome"]="nome-da-skill"`
- [ ] `WORKFLOW_STATE.md` template atualizado com o bloco desta skill
- [ ] Skill testada manualmente com uma empresa de teste

---

## 16 — Referência Rápida

### Tamanhos alvo por componente

| Componente | Alvo | Máximo |
|---|---|---|
| `description` | 50–150 palavras | 200 palavras |
| Corpo do `SKILL.md` | 200–400 linhas | 500 linhas |
| Arquivo de referência | 100–300 linhas | 500 linhas (incluir sumário se > 300) |
| Arquivo de agente (`agents/`) | 50–150 linhas | 200 linhas |

### Padrões de nomes

| Elemento | Padrão | Exemplos reais |
|---|---|---|
| Pasta no repo | `NN-nome-descritivo` | `05-writer`, `00-orchestrator` |
| `name` no frontmatter | `kebab-case` | `content-writer`, `hooks-factory` |
| Arquivo de output | `OUTPUT_[NOME].md` (caps) | `OUTPUT_CONTENT.md`, `OUTPUT_HOOKS.md` |
| Context file | `NOME_EM_CAPS.md` | `BRAND_VOICE.md`, `AUDIENCE_PROFILES.md` |
| Arquivo de referência | `nome-descritivo.md` | `copy-frameworks.md`, `output-template.md` |
| Arquivo de agente | `nome-do-papel.md` | `hook-evaluator.md`, `quality-checker.md` |

### O que vai onde — hierarquia de decisão

| Conteúdo | Onde vai |
|---|---|
| Quando acionar a skill | `description` no frontmatter |
| Quem o Claude é nesta skill | `## Role Definition` no SKILL.md |
| Passos de execução | `## Procedimento de Execução` no SKILL.md |
| Critérios de seleção e tabelas de decisão | SKILL.md (se cabe em ~50 linhas) ou `references/` |
| Framework/metodologia detalhada | `references/[framework].md` |
| Template do arquivo de saída | `references/output-template.md` |
| Banco de exemplos reutilizáveis | `references/[nome-do-banco].md` |
| Specs de múltiplas variantes | `references/[variante].md` por variante |
| Tarefa para subagente especializado | `agents/[nome-do-agente].md` |
| Cálculo ou transformação determinística | `scripts/[nome-do-script].py` |
| Dados de uma empresa específica | `~/companies/[slug]/context/[NOME].md` |
| Progresso de uma peça de conteúdo | `~/companies/[slug]/contents/[slug-da-peça]/WORKFLOW_STATE.md` |

### Estrutura de qualquer skill folha (resumo)

```
Frontmatter (name + description)
Role Definition
Pipeline Context (tabela anterior → atual → próxima)
Context Files (obrigatórios / opcionais / NÃO carregar / referências)
Input Esperado
Procedimento de Execução (lista numerada)
[Conhecimento específico: tabelas, frameworks, regras]
Checklist Pré-Entrega
Fallbacks (A, B, C)
Resumo Obrigatório e Transição
Referências (tabela arquivo → finalidade)
```

---

## Apêndice A — Estrutura Completa do Projeto

```
skills/
├── SKILLS_GUIDE.md            ← este guia de arquitetura
├── concept.md                 ← visão geral e first-use flow do projeto
├── install.sh                 ← instala todas as skills em ~/.claude/skills/
│
├── content/                   ← pipeline de produção de conteúdo
│   ├── 00-orchestrator/       ← orquestrador; ponto de entrada; mantém WORKFLOW_STATE
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── WORKFLOW_STATE.md         ← template do arquivo de estado
│   │       └── context-templates/        ← 9 templates de context files
│   │           ├── BRAND_VOICE.md
│   │           ├── AUDIENCE_PROFILES.md
│   │           ├── PRODUCT_CONTEXT.md
│   │           ├── COMPANY_PROFILE.md
│   │           ├── COMPETITOR_MAP.md
│   │           ├── CONTENT_PILLARS.md
│   │           ├── VISUAL_IDENTITY.md
│   │           ├── PLATFORM_SPECS.md
│   │           └── HOOK_LIBRARY.md
│   │
│   ├── 02-ideation/           ← gera ideias por funil e pilar temático
│   ├── 03-research/           ← pesquisa aprofundada com fontes e dados
│   ├── 04-hooks-factory/      ← gera e rankeia hooks por gatilho psicológico
│   ├── 05-writer/             ← redige conteúdo com framework de copy + atomização
│   ├── 06-platform-adapter/   ← adapta conteúdo por plataforma e formato
│   ├── 07-carousel-creator/   ← gera slides HTML por identidade visual
│   ├── 08-derivatives/        ← mapeia formatos derivados do conteúdo-pilar
│   ├── 09-editorial-calendar/ ← monta calendários editoriais semanais/mensais
│   └── 10-performance/        ← analisa métricas e retroalimenta o pipeline
│
└── setup/                     ← pipeline de configuração inicial de empresa
    ├── 00-orchestrator/       ← guia linear pelos 7 blocos de setup
    ├── 01-company-profile/    ← bloco 1: perfil institucional
    ├── 02-product-context/    ← bloco 2: produto e proposta de valor
    ├── 03-brand-voice/        ← bloco 3: tom de voz e vocabulário
    ├── 04-audience-profiles/  ← bloco 4: personas e público-alvo
    ├── 05-competitor-map/     ← bloco 5: concorrentes e gaps
    ├── 06-content-pillars/    ← bloco 6: pilares e estratégia editorial
    └── 07-visual-identity/    ← bloco 7: tokens de design

Após install.sh, as skills vivem em:
~/.claude/skills/
    content/                   ← instalada como /content
    content-ideation/          ← instalada como /content-ideation
    content-research/          ← instalada como /content-research
    hooks-factory/             ← instalada como /hooks-factory
    content-writer/            ← instalada como /content-writer
    platform-adapter/          ← instalada como /platform-adapter
    carousel-creator/          ← instalada como /carousel-creator
    content-derivatives/       ← instalada como /content-derivatives
    editorial-calendar/        ← instalada como /editorial-calendar
    content-performance/       ← instalada como /content-performance
    setup-briefing/            ← instalada como /setup-briefing
    setup-[bloco]/             ← instalada como /setup-[bloco] (×7)

Os dados de cada empresa ficam em:
~/companies/
    [slug-empresa]/
        context/               ← os 9 context files preenchidos pelo setup
        contents/
            [YYYY-MM-DD]-[slug-do-tema]/
                WORKFLOW_STATE.md
                OUTPUT_IDEATION.md
                OUTPUT_RESEARCH.md
                OUTPUT_HOOKS.md
                OUTPUT_CONTENT.md
                OUTPUT_ADAPTED.md
                OUTPUT_DERIVATIVES.md
                OUTPUT_ANALYSIS.md
                OUTPUT_CALENDAR.md
                carousel/
                    slide-1.html
                    slide-N.html
```

---

## Apêndice B — Fluxo Completo de Conteúdo

```
                    ┌─────────────────────────────────────┐
                    │         /content (Orquestrador)      │
                    │  Detecta intenção, resolve empresa,  │
                    │  verifica context files, roteia      │
                    └─────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
    [Sem context files]      [Com context files]      [Conteúdo existente]
              │               Pipeline completo          Entrar em qualquer
              ▼                       │                   etapa diretamente
    /setup-briefing          ┌────────┘
    (7 blocos)               │
                             ▼
                    /content-ideation
                    OUTPUT_IDEATION.md
                    (ideias por funil e pilar)
                             │
                    ┌────────┴──────────────────────┐
                    │ Atalho: usuário já tem tema    │
                    │ → pular direto para Research   │
                    └────────────────────────────────┘
                             ▼
                    /content-research
                    OUTPUT_RESEARCH.md
                    (dados, fontes, casos, gaps)
                             │
                    ┌────────┴──────────────────────┐
                    │ Atalho: usuário tem tema       │
                    │ pesquisado → ir direto         │
                    └────────────────────────────────┘
                             ▼
                    /hooks-factory
                    OUTPUT_HOOKS.md
                    (hooks ranqueados por score)
                             │
                    ┌────────┴──────────────────────┐
                    │ Atalho: tem hook aprovado      │
                    │ → escrever diretamente         │
                    └────────────────────────────────┘
                             ▼
                    /content-writer
                    OUTPUT_CONTENT.md
                    (conteúdo-pilar com tags)
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    /platform-adapter              /content-derivatives
    OUTPUT_ADAPTED.md              OUTPUT_DERIVATIVES.md
    (versões por plataforma)       (mapa de formatos derivados)
              │                             │
              ▼                             ▼
    /carousel-creator              [Derivados individuais]
    carousel/slide-N.html          (carrossel, checklist, etc.)

              ┌─────────────────────────────────┐
              │ A qualquer momento:             │
              ├─────────────────────────────────┤
              │ /editorial-calendar             │
              │   OUTPUT_CALENDAR.md            │
              │   (planejamento semanal/mensal) │
              ├─────────────────────────────────┤
              │ /content-performance            │
              │   OUTPUT_ANALYSIS.md            │
              │   (retroalimentação do pipeline)│
              └─────────────────────────────────┘

Legenda:
  ─── fluxo padrão
  [Atalho] entradas diretas sem percorrer o pipeline completo
  Qualquer etapa pode ser entrada; o pipeline é sugestão, não bloqueio
```
