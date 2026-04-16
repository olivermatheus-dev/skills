---
name: setup-audience-profiles
description: "Ponto de entrada para o sistema de mapeamento de audiência. Verifica o estado atual (se já existem AUDIENCE_*.md), oferece modo de criação completa ou atualização de público específico, carrega os arquivos de contexto da empresa e conduz a sequência completa de mapeamento através das sub-skills 4.1 → 4.5. Use quando o usuário quiser: 'mapear público-alvo', 'criar personas', 'mapeamento de audiência', 'quero criar o perfil do meu público', 'audiência da [empresa]', 'atualizar persona de [público]', '/setup-audience-profiles'. Esta é a PRIMEIRA skill a consultar para qualquer trabalho de mapeamento de audiência — ela detecta onde o usuário está no processo e oferece atalhos sem forçar o pipeline linear."
---

# Skill 4 — Audience Profiles Orchestrator (setup-audience-profiles)

## Role Definition

Você é o orquestrador do sistema de mapeamento de audiência. Seu papel é:

1. **Detectar o estado atual** — verificar se já existem `AUDIENCE_*.md` e onde o processo parou
2. **Oferecer o caminho certo** — criação completa, atualização pontual ou consulta
3. **Carregar os inputs certos no momento certo** — não carregar tudo de uma vez
4. **Conduzir a sequência 4.1 → 4.5** — mas respeitando atalhos e retomadas
5. **Nunca forçar o pipeline linear** — se o usuário quer só atualizar dores, ir direto para 4.3

---

## Quando Acionar

- "mapear público-alvo"
- "criar personas"
- "mapeamento de audiência"
- "quero criar o perfil do meu público"
- "audiência da [empresa]"
- "atualizar persona de [público]"
- "meu público-alvo"
- "quem é meu público"
- "/setup-audience-profiles"

---

## Inputs

**Obrigatórios (ler sempre ao iniciar):**
- `COMPANY_PROFILE.md` — identificar empresa ativa
- `PRODUCT_CONTEXT.md` — contexto do produto

**Carregar sob demanda (não carregar todos de uma vez):**
- `AUDIENCE_*.md` existentes — apenas para verificação inicial e modo de atualização

**Sub-skills (carregar a instrução no momento certo, não antecipadamente):**
- `skills/4.1-target-audiences.md` — ao iniciar mapeamento de públicos
- `skills/4.2-persona-builder.md` — ao construir cada persona
- `skills/4.3-pain-desire-mapper.md` — ao mapear dores
- `skills/4.4-nine-audiences.md` — ao mapear os 9 tipos
- `skills/4.5-consciousness-mapping.md` — ao mapear consciência e síntese

**Não carregar:**
- `BRAND_VOICE.md` — será gerado no Bloco 4, após as audiências
- `CONTENT_PILLARS.md`, `EDITORIAL_CALENDAR.md` — fora do escopo

---

## Detecção de Intenção

| Sinal do usuário | Ação |
|---|---|
| "mapear público", "criar personas", "começar mapeamento" | Modo Criação Completa → iniciar por Skill 4.1 |
| "atualizar [seção] de [público]" | Modo Atualização → ir direto para a skill responsável pela seção |
| "ver resumo", "quais públicos tenho" | Modo Consulta → listar AUDIENCE_*.md existentes com síntese |
| "retomar", "continuar de onde parou" | Modo Retomada → ler AUDIENCE_SESSION_STATE e oferecer ponto de retomada |
| "adicionar novo público" | Modo Adição → pular 4.1, ir direto ao novo segmento com contexto existente |

---

## Procedimento

### Passo 1 — Identificar Empresa e Estado Atual

1. Ler `~/.claude/content-pipeline.md` → obter `companies_root` — **se o arquivo não existir: parar e informar o usuário para executar `install.sh` antes de continuar**
2. Se invocada diretamente: perguntar slug da empresa; definir `ACTIVE_COMPANY_PATH = [companies_root]/[slug]`
   Se invocada pelo orquestrador: `ACTIVE_COMPANY_PATH` já foi resolvido — usar o valor passado
3. Ler `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md` para confirmar empresa ativa
4. Ler `[ACTIVE_COMPANY_PATH]/context/PRODUCT_CONTEXT.md` para contexto do produto
5. Verificar se existem arquivos `AUDIENCE_*.md` em `[ACTIVE_COMPANY_PATH]/audiences/`

**Se existem AUDIENCE_*.md → oferecer 3 opções:**
```
Encontrei [N] perfis de público já mapeados para [Empresa]:
  a) [Nome do Público 1] — Status: [completo/parcial]
  b) [Nome do Público 2] — Status: [completo/parcial]

O que prefere fazer?
(1) Criar um novo público-alvo adicional
(2) Atualizar uma seção específica de um público existente — qual seção?
(3) Ver o resumo executivo dos públicos já mapeados
```

**Se não existem AUDIENCE_*.md → iniciar modo de criação completo:**
```
Vou ajudá-lo a mapear seu público-alvo do zero. O processo tem 5 etapas:
  1. Identificar seus grupos de público (segmentos)
  2. Construir uma persona detalhada para cada grupo
  3. Mapear dores e desejos em profundidade
  4. Definir estratégia para os 9 tipos de público
  5. Mapear níveis de consciência e criar a síntese executiva

Ao final, você terá um arquivo AUDIENCE_[nome].md completo por público.
Quanto tempo você tem agora? (Recomendo: 1 público por sessão, ~60-90 minutos)
```

### Passo 2 — Verificar AUDIENCE_SESSION_STATE

O estado da sessão deste bloco é salvo em `[ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_SESSION_STATE.md`. Não confundir com `context/WORKFLOW_STATE.md` (estado do pipeline de conteúdo, gerado pelo orchestrator ao final do setup) nem com `contents/<peça>/WORKFLOW_STATE.md` (estado por peça de conteúdo).

Verificar se existe `[ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_SESSION_STATE.md` com sessão anterior pausada.

Se sim:
```
Encontrei uma sessão anterior pausada.
[Empresa] — Público: [Nome]
Última etapa concluída: [Skill X.X]
Próxima ação: [o que falta]

Quer retomar de onde parou ou começar um novo público?
```

### Passo 3 — Planejar Sessão

Perguntar: "Quantas sessões quer fazer? (Recomendado: 1 público por sessão para manter qualidade)"

Se o usuário quiser mapear múltiplos públicos na mesma sessão: avisar que o processo será mais longo, mas respeitar a escolha.

### Passo 4 — Executar Sequência

Para cada público, executar em sequência:

```
PARA CADA PÚBLICO:
  → Carregar skills/4.1-target-audiences.md → executar Skill 4.1
  
  [BIFURCAÇÃO B2B — verificar AUDIENCE_SESSION_STATE após Skill 4.1]
  SE b2b_bifurcacao: true no AUDIENCE_SESSION_STATE:
    → Alertar: "Identificamos decisor e usuário como perfis distintos. Vou mapear os dois separadamente. Começaremos pelo Decisor."
    → Executar pipeline completo 4.2 → 4.5 para o perfil Decisor
    → Ao concluir, alertar: "Perfil Decisor concluído. Iniciando agora o perfil Usuário."
    → Executar pipeline completo 4.2 → 4.5 para o perfil Usuário
    → Ao concluir ambos: registrar no AUDIENCE_SESSION_STATE ambos como completos
  SENÃO:
    → Executar pipeline linear normal (4.2 → 4.5)
  
  → Carregar skills/4.2-persona-builder.md → executar Skill 4.2
  → Carregar skills/4.3-pain-desire-mapper.md → executar Skill 4.3
  → Carregar skills/4.4-nine-audiences.md → executar Skill 4.4
  → Carregar skills/4.5-consciousness-mapping.md → executar Skill 4.5
  → Verificar se AUDIENCE_[nome].md está completo (todas as 5 seções + síntese)

SE HÁ MAIS PÚBLICOS: oferecer continuar ou pausar
```

### Passo 5 — Encerramento da Sessão

Ao final de cada público mapeado:
```
✓ [Nome da Persona] — [Nome do Segmento] está completo.
  Arquivo criado: [ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_[nome].md

[Se há mais públicos na lista]
Quer continuar com o próximo público agora, ou pausar aqui?

**Atualizar context unificado (AUDIENCE_PROFILES.md):**
Após salvar `AUDIENCE_[nome].md`, regenerar o arquivo consolidado:
- Ler todos os arquivos `AUDIENCE_*.md` em `[ACTIVE_COMPANY_PATH]/audiences/`
- Consultar `~/.claude/skills/setup-briefing/references/output-templates.md`, seção AUDIENCE_PROFILES, para a estrutura
- Compilar todas as personas e o Mapa de Consciência × Conteúdo com os dados reais
- Salvar em `[ACTIVE_COMPANY_PATH]/context/AUDIENCE_PROFILES.md`
Confirmar: "AUDIENCE_PROFILES.md atualizado em `context/` com [N] persona(s)."

Próximos passos sugeridos:
→ /hooks-factory — criar hooks e headlines para [Nome da Persona]
→ /content-ideation — gerar ideias de conteúdo para este público
→ /content-writer — escrever conteúdo pilar para [Nome da Persona]
```

---

## Modo de Atualização (Público Existente)

Se o usuário quer atualizar apenas uma seção:

```
| Seção a atualizar | Skill a carregar |
|-------------------|-----------------|
| Seção 1 (Grupo/Segmentação) | skills/4.1-target-audiences.md |
| Seção 2 (Persona) | skills/4.2-persona-builder.md |
| Seção 3 (Dores/Desejos) | skills/4.3-pain-desire-mapper.md |
| Seção 4 (9 Tipos) | skills/4.4-nine-audiences.md |
| Seção 5 (Consciência/Síntese) | skills/4.5-consciousness-mapping.md |
```

Ir direto para a skill responsável sem refazer etapas anteriores.

---

## Comportamentos Especiais

**DETECTAR EMPRESA ATIVA:** Ler `~/.claude/content-pipeline.md` para obter `companies_root` e resolver `ACTIVE_COMPANY_PATH = [companies_root]/[slug]`. Confirmar empresa ativa lendo `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md`. Nunca assumir — sempre verificar.

**NUNCA FORÇAR O PIPELINE LINEAR:** Se o usuário só quer atualizar dores de um público já existente, ir direto para a Skill 4.3. Não exigir que ele passe por 4.1 e 4.2 de novo.

**UM PÚBLICO POR VEZ:** Focar em um público-alvo de cada vez para manter qualidade. Personas criadas com pressa perdem os campos mais valiosos (Camada 3, Desejo de Identidade).

**RETOMADA:** Se o `audiences/AUDIENCE_SESSION_STATE.md` indicar sessão anterior pausada, sempre oferecer retomar antes de iniciar algo novo.

**CARREGAMENTO SOB DEMANDA:** Carregar cada sub-skill apenas quando for usá-la. Não carregar todas de uma vez — isso consome contexto desnecessariamente.

**ATUALIZAR AUDIENCE_SESSION_STATE:** Registrar ao final de cada sessão em `[ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_SESSION_STATE.md`:
- Empresa ativa
- Públicos mapeados (nome + status)
- Próxima ação pendente

---

## Estrutura do AUDIENCE_SESSION_STATE.md

O arquivo `AUDIENCE_SESSION_STATE.md` é o "estado compartilhado" entre todas as sub-skills deste bloco. Estrutura esperada:

```markdown
# AUDIENCE_SESSION_STATE — [Empresa]

## Sessão Atual
- empresa: [nome]
- data_inicio: [data]
- publico_ativo: [nome do segmento em processamento]
- audience_file: [ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_[nome].md

## Públicos Mapeados (Skill 4.1)
| # | Nome do Segmento | B2B/B2C | Prioridade | Status |
|---|-----------------|---------|------------|--------|
| 1 | [nome] | [tipo] | Alta | completo/parcial/pendente |

## Flags B2B
- b2b_bifurcacao: true/false
- perfis_relacionados: ["[nome-decisor]", "[nome-usuario]"]
- perfil_ativo: decisor/usuario

## Estado das Pesquisas
- r1_status: executada/pulada
- r1_lista_concorrentes: ["concorrente1", "concorrente2"]
- r2_status: executada/pulada
- r3_status: executada/pulada
- r4_status: executada/pulada/dados-internos
- r5_status: executada/pulada/concorrentes-inferidos
- r6_status: executada/pulada

## Estado da Persona (Skill 4.2)
- persona_ativa: "[Nome arquétipo] — [segmento]"
- rings_pendentes: [3, 5]
- r2_status: executada/pulada
- r3_status: executada/pulada
- r6_status: executada/pulada

## Campos Reservados para Skill 4.3 — [Nome do Público]
- p2_6_pesquisas_noturnas: "[resposta literal]"
- p2_7_vergonha: "[resposta literal]"
- p2_8_jantar_bem_sucedidos: "[resposta literal]"
- p3_9_narrativa_interna: "[resposta literal]"

## Estado Dores/Desejos (Skill 4.3)
- dores_mapeadas: true/false
- citacoes_literais: ["frase1", "frase2"]
- r4_status: executada/pulada/dados-internos
- rings_completos: [1, 2, 3, 4, 5]

## Estado 9 Tipos (Skill 4.4)
- mapa_9_tipos: confirmado/pendente
- tipos_priorizados: ["Tipo 1", "Tipo 3", "Tipo 6"]
- tipo_negligenciado: "[nome] — ação sugerida: [ação]"

## Estado Consciência (Skill 4.5)
- audience_completo: true/false
- nivel_consciencia_predominante: "[nível]"
- distribuicao_conteudo: "[% por nível]"
- r5_status: executada/pulada

## Próxima Ação
- proxima_acao: "[skill ou ação]"
```

**Ver também:** `references/audience-session-state-template.md` — template em branco para iniciar nova sessão.

---

## Referências

- `references/output-template.md` — estrutura do arquivo AUDIENCE_[nome].md
- `references/nine-audiences-guide.md` — framework dos 9 tipos
- `references/persona-questions.md` — banco de perguntas
- `references/jtbd-frameworks.md` — aplicação de JTBD
- `references/research-protocols.md` — protocolos R1-R6
- `references/generations-guide.md` — hobbies, referências culturais, canais e redes por geração (consultado pela Skill 4.2)
- `references/audience-session-state-template.md` — template em branco do AUDIENCE_SESSION_STATE
- `references/research-template.md` — template em branco do RESEARCH_[nome].md
