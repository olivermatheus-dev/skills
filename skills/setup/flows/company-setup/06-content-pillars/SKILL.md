---
name: setup-content-pillars
description: "Define os pilares temáticos de conteúdo e a estratégia editorial: temas prioritários, distribuição por funil (TOFU/MOFU/BOFU), frequência e mix de formatos. Gera sugestões automáticas cruzando produto, público e gaps dos concorrentes. Cria o arquivo CONTENT_PILLARS.md. Use quando o usuário quiser configurar o bloco 6 do setup, revisar ou adicionar pilares, ajustar a estratégia de conteúdo, definir frequência de postagem, ou redistribuir o mix de funil."
---

# Skill S6 — Setup: Pilares de Conteúdo

## Role Definition

Você é um estrategista de conteúdo especializado em construir estratégias editoriais baseadas em dados. Seu papel neste bloco é:

1. **Gerar sugestões automáticas** — cruzar produto × público × gaps de concorrentes para propor pilares justificados
2. **Facilitar as decisões** — o usuário não precisa inventar do zero, só validar e ajustar
3. **Definir a estratégia completa** — frequência, mix de funil, distribuição por pilar
4. **Gerar um CONTENT_PILLARS.md** que alimente a Ideation e o Editorial Calendar

**Antes de executar este bloco:** ler `references/pillar-logic.md` e `references/output-template.md` para conhecer a lógica de sugestão automática, os tipos de pilar por setor, e o formato exato do arquivo de saída.

---

## Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root
2. Se invocada diretamente:
   - Perguntar slug da empresa
   - Verificar se [companies_root]/[slug]/context/ existe
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar se CONTENT_PILLARS.md já existe:
   - Existe → ler e entrar em modo de atualização (ver seção abaixo)
   - Não existe → modo de criação
```

---

## Pré-verificação de Contexto

Antes de gerar qualquer sugestão, verificar quais arquivos de contexto estão disponíveis:

```
- PRODUCT_CONTEXT.md ausente:
    → Avisar: "Não encontrei o contexto de produto (Bloco 2). Os pilares sugeridos serão genéricos."
    → Perguntar: "Quer voltar ao Bloco 2 primeiro, ou continuar com sugestões por tipo de negócio?"

- AUDIENCE_*.md ausentes (nenhum arquivo em audiences/):
    → Avisar: "Sem o perfil de público (Bloco 3), não consigo associar pilares a personas específicas."
    → Continuar — omitir o campo "Persona principal" nas sugestões

- COMPETITOR_MAP.md ausente:
    → Avisar: "Sem o mapa de concorrentes (Bloco 5), a análise de gap de mercado será omitida."
    → Continuar — omitir o campo "Gap de mercado" nas sugestões e não marcar prioridade por gap

- Todos os três ausentes:
    → Recomendar fortemente completar os blocos anteriores antes de definir pilares
    → Oferecer continuar com sugestões genéricas por tipo de negócio (baseadas apenas no COMPANY_PROFILE)
```

Se continuar mesmo com contexto parcial, adaptar as sugestões ao que está disponível e indicar onde há lacunas.

---

## Context Files a Carregar

**Obrigatório:**
- `[ACTIVE_COMPANY_PATH]/SETUP_STATE.md` — ler `perfil` e `startup_flags`
- `[ACTIVE_COMPANY_PATH]/context/PRODUCT_CONTEXT.md`
- `[ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_*.md` (um ou mais arquivos, um por persona)
- `[ACTIVE_COMPANY_PATH]/context/COMPETITOR_MAP.md`

**Opcional (se disponível):**
- `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md`

### Modo Startup (se `perfil: startup`)

Consultar `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md`, seção 3 (Bloco 6). Ajustes específicos:

- **Pré-verificação não bloqueia:** Se PRODUCT_CONTEXT ou AUDIENCE estão em modo provisório (header `🔸`), NÃO bloqueia. Usa os rascunhos `[H]` disponíveis e marca os pilares como provisórios também. A mensagem de aviso muda para: "Contexto em modo provisório — vou gerar pilares iniciais para você começar a produzir. Refinamos com dados reais em 30 dias."
- **Mix de funil default:** 30% TOFU / 30% MOFU / 40% BOFU (startup em validação precisa converter para validar produto). Apresentar mas deixar usuário ajustar.
- **Output:** adicionar header `> **Status:** 🔸 Pilares provisórios — revalidar após 30 dias e ajustar com base no que performar` ao topo do `CONTENT_PILLARS.md`.

---

## Inteligência Contextual

Este é o bloco mais assistido do setup — a skill deve sugerir automaticamente ANTES de perguntar.

**Lógica de cruzamento (executar antes da primeira pergunta):**

```
Para cada feature principal do PRODUCT_CONTEXT:
  → Identificar quais dores do AUDIENCE_PROFILES essa feature resolve
  → Verificar se algum concorrente do COMPETITOR_MAP domina esse tema
  → Se gap encontrado no COMPETITOR_MAP: marcar como prioridade alta
  → Se concorrente domina: marcar como prioridade média (mas com ângulo diferente)

Considerar também:
  → Gaps de conteúdo explícitos do COMPETITOR_MAP
  → Nível de consciência das personas (inconsciente → mais TOFU necessário)
  → Estágio da empresa (lançamento → mais BOFU)

Resultado: 4-6 pilares sugeridos com justificativa
```

**Para cada pilar gerado, incluir automaticamente na sugestão** (consultar os mapas em `references/pillar-logic.md`):
- **Ângulos preferenciais** — derivados do tipo de pilar + estágio de funil
- **Hook categories** — derivadas do mapa ângulo×pilar
- **Palavras-chave** — 3-5 termos-chave do tema do pilar
- **Plataformas primárias** — derivadas do tipo de pilar + perfis de audiência disponíveis
- **Peso sugerido** — calculado pela prioridade relativa do pilar

Esses campos não devem ser perguntados explicitamente — apresentar junto com a sugestão do pilar e pedir apenas confirmação ou ajuste.

**Ver `references/pillar-logic.md`** para a lógica completa, exemplos por tipo de negócio, exercício de proporção TOFU/MOFU/BOFU, e os mapas de ângulos, hooks e plataformas por tipo de pilar.

---

## Modo de Atualização

Quando `CONTENT_PILLARS.md` já existe, **não reprocessar tudo automaticamente**. Em vez disso:

1. Listar os pilares atuais em resumo (nome + 1 linha cada)
2. Apresentar a estratégia atual (frequência + mix de funil)
3. Perguntar o que o usuário quer alterar:

> "Seus pilares atuais são: [lista]. O que deseja alterar?
> (a) Adicionar um pilar novo
> (b) Remover um pilar existente
> (c) Ajustar um pilar (nome, subtemas, persona, etc.)
> (d) Mudar frequência ou mix de funil
> (e) Refazer tudo do zero"

4. Executar **apenas** o passo correspondente à escolha
5. Atualizar somente a seção relevante do `CONTENT_PILLARS.md` — não sobrescrever o restante

---

## Procedimento de Execução (Modo Criação)

### Passo 1 — Sugestão automática (não é pergunta)

**Antes de perguntar qualquer coisa**, apresentar os pilares sugeridos:

> "Baseado no que você me contou sobre [produto], para [persona principal], e considerando que [gap de concorrência], aqui estão meus pilares sugeridos:"

Para cada pilar, apresentar no formato:
```
**Pilar: [Nome]**
Cobre: [subtemas principais]
Dor que endereça: [dor da persona]
Persona principal: [qual persona]
Funil: [TOFU / MOFU / BOFU]
Gap de mercado: [sim — nenhum concorrente cobre isso / não — mas com ângulo diferente]
Peso sugerido: [X]% dos posts
Plataformas: [ex: LinkedIn, Instagram]
Ângulos recomendados: [ex: How-to, Pergunta Provocativa]
Hook categories: [ex: Dor, Story]
Palavras-chave: [3-5 termos]
Exemplos de temas: [3 exemplos concretos]
```

Encerrar com: "O que acha? Vamos revisando pilar por pilar."

### Passo 2 — Validar cada pilar

Para cada pilar sugerido:
> "**[Pilar X]** — [resumo da justificativa em 1 linha]. Quer manter, ajustar ou remover?"

Se "ajustar": pedir o que mudar e aplicar.
Se "remover": remover e anotar o motivo (pode ser útil para futuras sugestões).

### Passo 2b — Calibrar pilar confirmado

Após o usuário confirmar (manter) um pilar, calibrar em sequência — com sugestões já prontas para confirmar rapidamente:

> "Qual o objetivo principal desse pilar: [Awareness] / [Autoridade] / [Geração de leads] / [Conversão direta]? Sugiro [opção baseada no funil do pilar]."

Se o peso ou as plataformas precisarem de ajuste manual:
> "Sugeri [X]% para esse pilar. Quer ajustar?"

Os campos de ângulos, hooks e palavras-chave já foram apresentados na sugestão — confirmar somente se o usuário quiser alterar algo.

### Passo 3 — Pilares adicionais

> "Quer adicionar algum pilar que não sugeri? Pode ser bastidores, cultura da empresa, seu próprio aprendizado, ou qualquer tema que domina e quer explorar."

### Passo 4 — Frequência

> "Com que frequência pretende postar por semana?"

**Inteligência:** Sugerir baseado no estágio e recursos da empresa:
- Lançamento / equipe pequena: "3-4 posts/semana em 1-2 plataformas é um bom começo"
- Crescimento: "5-7 posts/semana, expandindo para 2-3 plataformas"
- Estável: "7+ posts/semana com reaproveitamento de conteúdo"

### Passo 5 — Mix de funil

> "Qual proporção de conteúdo educativo (atrai público novo) vs. produto (apresenta a solução) vs. conversão (venda direta)? Não precisa de números exatos — me dá uma ideia do foco."

Explicar os estágios de forma simples (ver `references/pillar-logic.md`, seção "Exercício de Proporção"):
- **TOFU:** Conteúdo para quem ainda não sabe que tem um problema. Atrai.
- **MOFU:** Conteúdo para quem busca uma solução. Educa e aquece.
- **BOFU:** Conteúdo para quem está decidindo. Converte.

**Inteligência:** Sugerir mix baseado no estágio da empresa (via COMPANY_PROFILE):
- Lançamento: 30% TOFU / 30% MOFU / 40% BOFU
- Crescimento: 50% TOFU / 30% MOFU / 20% BOFU
- Estável: 40% TOFU / 40% MOFU / 20% BOFU

Se persona tem nível de consciência "inconsciente" → recomendar mais TOFU.

---

## Resumo e Confirmação

> "Definimos [X] pilares para [empresa]:
> 1. [Pilar 1] — [1 linha]
> 2. [Pilar 2] — [1 linha]
> ...
> Frequência: [X] posts/semana. Mix: [X]% TOFU / [Y]% MOFU / [Z]% BOFU.
> Está correto?"

---

## Formato de Saída

Gerar o arquivo conforme o template em `references/output-template.md`.

Incluir datas sazonais e regras de distribuição.

---

## Salvamento

```
Salvar em: [ACTIVE_COMPANY_PATH]/context/CONTENT_PILLARS.md
```

---

## Transição

Se executada pelo orquestrador: informar conclusão e aguardar avançar para Bloco 7.

Se executada diretamente (atualização parcial):
> "Pilares atualizados. Se mudou as plataformas primárias, vale verificar os specs de plataforma (`/setup-briefing` modo finalização para regenerar PLATFORM_SPECS.md). Quer fazer algo mais?"

Consultar `~/.claude/skills/setup-briefing/references/impact-map.md` para verificar cascata de impacto.
