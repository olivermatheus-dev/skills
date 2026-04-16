# Startup Mode — Modo para empresas em desenvolvimento

> **Uso:** Referência consultada por TODAS as skills do setup (01 a 07) no seu Passo 1.
> Determina se a empresa é uma startup em validação/lançamento/pivô e, se sim, ativa um conjunto de comportamentos que reduzem fricção, aceitam hipóteses marcadas como `[H]` e geram sugestões em vez de exigir respostas precisas.

---

## 1. Detecção da flag `startup_mode`

A flag é setada em `SETUP_STATE.md` ao final da **Etapa 2** (Mercado & Modelo de Negócio) do Bloco 1 — Company Profile. A partir daí, todas as skills consultam o campo `perfil` e `startup_flags` no `SETUP_STATE.md`.

### Condições que ativam `startup_mode: true`

Basta **QUALQUER uma** das abaixo ser verdadeira:

- **Estágio** (Company E2, P5) ∈ {`Validando`, `Lançando`, `Pivotando`}
- **Maturidade real** (Company E1, P6) < 12 meses
- **Site** ausente, "em construção" ou landing page mínima
- **Ticket médio / Ciclo de venda** (Company E2, P4) = "a definir" / "ainda não vendi"
- **3 ou mais campos** em `COMPANY_PROFILE.md` classificados como `🔸 hipotese-vaga` após Etapa 5

### Campo `startup_flags` (array)

Listar quais condições foram atendidas, para que outras skills decidam comportamentos específicos:

```yaml
perfil: startup | consolidada | enterprise
startup_flags:
  - estagio_validando        # ou estagio_lancando / estagio_pivotando
  - sem_site                 # ou site_minimo
  - sem_clientes             # nenhum cliente pagante confirmado
  - hipoteses_dominantes     # 3+ campos como [H] ou hipotese-vaga
  - ticket_indefinido
  - maturidade_curta         # < 12 meses real
```

Empresas `consolidada` ou `enterprise` ignoram este arquivo e seguem o fluxo padrão.

---

## 2. Comportamentos no modo startup

Quando `perfil: startup`, toda skill aplica os 6 comportamentos abaixo:

### (a) Pesquisa web mais agressiva desde Company E1
Oferecer pesquisa setorial já na Etapa 1 do Company Profile (não esperar até Bloco 5 Competitor). Consultar `referenceu/sector-examples.md` se existir; senão, usar WebSearch com query `[setor] + [país] + tamanho de mercado + principais players + tendências 2026`.

### (b) Marcação default `[H]` (hipótese) em vez de exigir `[U]`
Classificação de confiança nas respostas:
- `[U]` = Usuário confirmou com base em dados reais
- `[H]` = Hipótese razoável (default em startup)
- `[V]` = Validado por pesquisa web
- `[E]` = Estimativa da IA (fallback)

Em startup mode, uma resposta sem dados externos vira `[H]`, não precisa ser escalada a `[U]`.

### (c) Toda pergunta "não sei" gera 2-3 sugestões
Se usuário responder "não sei", "ainda não defini" ou similar, a skill NÃO aceita silêncio. Oferece 3 opções estruturadas (ex: 3 slogans, 3 anti-personas, 3 diferenciais típicos do setor). Sempre inclui opção 4: "Nenhuma — descrever a minha".

### (d) Perguntas críticas apenas
Cada skill tem uma classificação Crítica/Complementar/Avançada das suas perguntas. Em startup mode, apenas as **críticas** são feitas. Complementares e avançadas são **auto-inferidas** a partir do contexto já coletado ou marcadas `[H]-pendente` para revisão futura.

### (e) Header da persona marcado como provisória
Ao gerar qualquer `AUDIENCE_[nome].md` em startup mode, incluir no topo:

```markdown
> **Status:** 🔸 Persona provisória — revalidar após 30 dias com dados reais
> **Gerada em:** [data]
> **Confiança geral:** [X]% validado · [Y]% hipótese · [Z]% estimativa
```

Idem para `COMPANY_PROFILE.md`, `PRODUCT_CONTEXT.md` e `CONTENT_PILLARS.md` — marcar como provisórios.

### (f) Gaps no diagnóstico final não são "bloqueios"
No Checklist Final do orchestrator, campos vazios em startup mode aparecem como **"a validar em campo"**, não como "⚠️ pendente" ou "gap". Mensagem:

> ✅ 0 bloqueantes · 🟡 X a validar em campo · 🟢 Y opcionais

---

## 3. Tabela de ajustes por skill

### Bloco 1 — Company Profile
- **E1 P2 (Slogan):** Em vez de "pode pular", oferece 3 slogans (funcional / emocional / provocativo) baseados em Nome + Setor + Diferencial inferido.
- **E3 P1 (Missão):** Aceita "em construção" com linguagem normalizadora. Sugere 3 rascunhos para escolher.
- **E4 (Presença Digital):** Se sem site, pula análise automática. Marca canais como `planejados`, não `inativos`.
- **E5 Diagnóstico Final:** Usa legenda "0 bloqueantes / X a validar em campo". Gera handoff narrado para Bloco 2 (ver seção 4 abaixo).

### Bloco 2 — Product Context
- **Pula:** P2.5c (Prova social formal), P2.6b (Time-to-value com dados), P2.7 (Feature subestimada).
- **Mantém críticas:** P2.1, P2.2, P2.3, P2.4, P2.4b (anti-persona com 3 sugestões), P2.5, P2.8 (já sugere 3 opções).
- **Gera handoff narrado** para Bloco 3 com persona provável inferida.

### Bloco 3 — Audience Profiles
- **Skill 4.1:** Auto-sugere 2-3 segmentos antes de perguntar. Aceita escolha sem questionar "mas você tem clientes desses?".
- **Skill 4.2:** Gera rascunho completo de 40+ campos em `[H]`. Header marca "provisória — revalidar em 30 dias". Validação em 3 blocos mantida.
- **Skill 4.3 (CRÍTICA):** Apenas **6 perguntas críticas** (P4.1, P4.4, P5.1, P5.4, P7.4, P8.1) — ver classificação em `skills/setup/flows/company-setup/03-audience-profiles/references/persona-questions.md`, seção "Classificação de Prioridade".
- **Skills 4.4 e 4.5:** Auto-inferidas a partir do rascunho de 4.2 + 4.3; usuário só confirma.

### Bloco 4 — Brand Voice
- **Exercício 3.6 (Teste de tom):** Se sem feature real em PRODUCT_CONTEXT (raro, mas possível), usar feature planejada ou exemplo genérico do setor.
- **Auto-análise de posts:** Pula se `sem_redes_ativas` em startup_flags.

### Bloco 5 — Competitor Map
- **Fase 1 (Pesquisa):** Mantém — é o principal gerador de contexto para startup sem histórico.
- **Fase 3 (Análise profunda):** Reduz a 2-3 concorrentes principais (em vez de 3-6).
- **Gera handoff narrado** para Bloco 6 com gap → pilar provável.

### Bloco 6 — Content Pillars
- **Pré-verificação:** Se `perfil: startup`, NÃO bloqueia por falta de dados. Usa os rascunhos `[H]` disponíveis e marca os pilares como "provisórios".
- **Mix de funil:** Default para startup/validação = 30% TOFU / 30% MOFU / 40% BOFU (precisa validar produto).

### Bloco 7 — Visual Identity
- **P7.2 (Extração de site):** Se `sem_site` em startup_flags, vai direto para fallback estruturado (2-3 marcas-referência, paleta de humor, ou moodboard verbal).
- **Gera tokens completos** mesmo sem site.

---

## 4. Handoffs narrados (padrão transversal)

Toda transição entre blocos em startup mode segue o formato **tripla "Síntese + Pré-hipóteses + Próximo passo"**:

```
**Síntese do que acabamos de fazer:**
[1 frase resumindo o que ficou documentado]

**Pré-hipóteses para o próximo bloco:**
[2-3 inferências concretas que o próximo bloco já pode validar, baseadas no que acabamos de coletar]

**Próximo passo:**
[Qual skill vai rodar e qual é o objetivo concreto]
```

### Exemplos concretos de handoffs

**Company → Product (final da E5):**
> **Síntese:** FluxoPro é SaaS B2B em validação, no setor de CRM, com diferencial "simplicidade para times pequenos".
> **Pré-hipóteses para Produto:** (1) resolve fricção de follow-up manual; (2) compete contra Pipedrive e RD Station; (3) ticket estimado R$100-500/mês.
> **Próximo passo:** Bloco 2 — detalhar features, problema central, diferenciais e anti-persona do produto.

**Product → Audience (final do Bloco 2):**
> **Síntese:** FluxoPro é CRM simplificado para times comerciais de 2-10 vendedores, R$149/mês/vendedor, resolve follow-up manual.
> **Pré-hipóteses para Audience:** (1) Persona provável #1: Gestor comercial de PME, 28-40 anos, já tentou planilha + Trello; (2) decisor e usuário podem ser a mesma pessoa (CEO/sócio que vende); (3) dor principal provável: perde negócios por follow-up inconsistente.
> **Próximo passo:** Bloco 3 — validar personas, mapear dores em 3 camadas e desejos.

**Audience → Pillars (final do 4.5):**
> **Síntese:** Persona principal "Ricardo, gestor comercial sobrecarregado" mapeada com 3 camadas de dor (superficial: tempo perdido; profunda: perdendo market share; medo: parecer incompetente diante do board).
> **Pré-hipóteses para Pillars:** (1) Pilar TOFU "Gestão de Tempo Comercial" (Camada 1); (2) Pilar MOFU "Processos de Vendas para PMEs" (Camada 2 + Nível 3 consciência); (3) Pilar BOFU "Cases de times enxutos escalando" (Tipo 4 dos 9 — prontos para decidir).
> **Próximo passo:** Bloco 6 — formalizar pilares com peso, plataformas e ângulos.

**Competitor → Pillars (final do Bloco 5):**
> **Síntese:** 3 concorrentes diretos (Pipedrive, RD Station, Ploomes); gaps identificados: conteúdo educativo prático para times < 10 vendedores; ângulo "anti-complicação".
> **Pré-hipóteses para Pillars:** Gap "CRM descomplicado para time enxuto" → pilar provável "Vendas Simples" (TOFU); Gap "conteúdo de bastidores" → pilar provável "Como a FluxoPro foi construída" (MOFU).
> **Próximo passo:** Bloco 6 — consolidar pilares cruzando produto × persona × gaps.

---

## 5. Diagnóstico final em modo startup

Substituir a legenda `✅ / ⚠️` por legenda de prioridade:

| Símbolo | Significado | Ação |
|---------|-------------|------|
| 🔴 | Bloqueante — pipeline não roda sem | Preencher agora, mesmo com `[H]` |
| 🟡 | Importante — pipeline roda com qualidade reduzida | Validar em campo nos próximos 30 dias |
| 🟢 | Opcional — refinar depois | Deixar para quando tiver mais dados |

Mensagem final:

> Setup provisório concluído em **X minutos**.
> 🔴 **0 bloqueantes** · 🟡 **Y a validar em campo** · 🟢 **Z opcionais**
> Persona marcada como **provisória — revalidar em 30 dias** com dados reais (conversas, reuniões, reviews).
> Pipeline pronto para rodar: `/content-ideation` gera as primeiras pautas.

---

## 6. Como cada skill invoca este arquivo

No **Passo 1** de cada skill (01 a 07), incluir:

```
1. Ler SETUP_STATE.md em [ACTIVE_COMPANY_PATH]
2. Verificar campo `perfil`:
   - Se `perfil: startup` → carregar e aplicar comportamentos de
    skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md (seção 3, entrada da skill atual)
   - Senão → seguir fluxo padrão
```

A skill não precisa duplicar a lógica — só consulta este arquivo e aplica os ajustes da sua linha na tabela.

---

## Versão

<!-- version: 1.0 · created: 2026-04-16 · scope: M1+M2+M4+M8 do plano imperative-twirling-moon -->
