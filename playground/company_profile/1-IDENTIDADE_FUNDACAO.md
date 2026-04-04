# Etapa 1 — Identidade & Fundação

> Protocolo de referência: `protocolo-execucao-v2.md`
> Executa as 6 fases na ordem definida.

---

## Importância desta etapa

Define quem é a empresa. A precisão aqui determina a qualidade de todas as etapas seguintes: persona, produto, conteúdo e concorrentes.

**Insights esperados:**
- Clareza de posicionamento (setor específico + slogan = alta; sem nenhum = baixa)
- Maturidade real (tempo de mercado, não ano de fundação)
- Potencial de storytelling (riqueza da história de origem)
- Complexidade operacional (solo ≠ 50 pessoas)

---

## FASE 1 — Carregar Contexto

**Esta é a primeira etapa do fluxo. Pular. Ir para Fase 2.**

Exceção: se `COMPANY_PROFILE.md` já existe com dados na Seção 1 (modo atualização), ler e usar valores atuais como sugestão antes de cada pergunta.

---

## FASE 2 — Definir Modo de Entrada

```
"Vamos começar pelo básico da [slug]: identidade e fundação.
São 6 perguntas.

Prefere:
(A) Responder uma por uma
(B) Me enviar um texto ou documento com essas informações — eu extraio e a gente valida"
```

Se (B): aplicar Protocolo de Extração (ver protocolo geral) mapeando o documento contra as 6 perguntas abaixo. Após resumo e "ok", ir para Fase 3 em modo validação.

---

## FASE 3 — Coletar e Classificar

**Refinamento de etapas anteriores:** Não aplicável (primeira etapa).

### Pergunta 1 de 6 — Nome da empresa

**Texto:**
> "Qual o nome da sua empresa ou marca?"

**Por que importa:** É o identificador em todo o fluxo. Precisa ser a grafia exata que a empresa usa.

**Sugestão contextualizada:** Não aplicável (primeira pergunta, sem contexto anterior).

**Exemplos:**
- "Método Vendas"
- "StudioLab"
- "Clínica Dra. Fernanda Alves"
- "Café do Bairro"

**Processamento:**
- Resposta vaga: Improvável nesta pergunta. Se o usuário der mais de um nome ("é Método Vendas, mas às vezes uso MV"), perguntar: "Qual é o nome oficial que aparece pro cliente?"
- Contradição: Não aplicável (primeiro dado).

**Classificação esperada:** Quase sempre ✅. Só seria 🔶 se o usuário disser que está em processo de trocar o nome.

---

### Pergunta 2 de 6 — Slogan ou tagline

**Texto:**
> "Tem um slogan ou tagline? Se não tem, pode pular — a gente pode criar um depois."

**Por que importa:** Revela se a empresa já tem clareza da proposta de valor. Não ter é dado útil — mostra oportunidade.

**Sugestão contextualizada:** Não aplicável (sem dados anteriores).

**Exemplos:**
- "Venda com método, não no improviso"
- "Feito para quem faz"
- "Educação que transforma carreiras"
- "Seu pet merece mais"

**Processamento:**
- Resposta vaga: Se o usuário der algo genérico tipo "A melhor empresa" → "Isso é mais um desejo do que um slogan. Tem alguma frase que vocês usam na comunicação, tipo no Instagram ou no site? Se não, a gente pula e pode criar depois."
- Sem resposta: Registrar "Não definido". Não é campo crítico.

**Classificação esperada:** ✅ se tem e usa ativamente. 🔶 se tem mas não sabe se é definitivo. 🔸 se inventou na hora. "Não definido" não precisa de classificação.

---

### Pergunta 3 de 6 — Setor e nicho

**Texto:**
> "Em qual setor ou nicho a [Nome] atua? Seja o mais específico possível."

**Por que importa:** Base para pesquisa de concorrentes, benchmarks de conteúdo e tom. Sem setor específico, as próximas etapas não conseguem gerar sugestões úteis.

**Sugestão contextualizada:** Não aplicável (sem dados anteriores). Dar exemplos variados.

**Exemplos:**
- "SaaS B2B para gestão de equipes de vendas"
- "E-commerce de cosméticos veganos"
- "Consultoria jurídica para startups"
- "Hamburgueria artesanal em SP"
- "Escola de inglês online para adultos"

**Processamento:**
- Resposta vaga:
  - 1ª tentativa: Se "tecnologia" → "Pode detalhar? 'Tecnologia' pode ser SaaS, hardware, consultoria de TI, dev de apps... Qual é o caso da [Nome]?"
  - 2ª tentativa: Se "software" → "Que tipo de software? Para quem? Ex: 'software de gestão para restaurantes' ou 'app de delivery para bairros'. Quanto mais específico, melhor consigo ajudar nas próximas etapas."
  - Ainda vaga após 2x → Aceitar. Classificar como 🔸.
- Contradição: Não aplicável (primeiro dado de setor).

**Classificação esperada:** ✅ se específico (inclui tipo + público ou tipo + mercado). 🔶 se tem direção mas não detalhou (ex: "SaaS" sem dizer pra quem). 🔸 se genérico (ex: "tecnologia", "saúde").

**Campo crítico:** SIM. Se classificado como 🔸, o nível de confiança da etapa cai automaticamente para Baixo.

---

### Pergunta 4 de 6 — Origem e motivação

**Texto:**
> "Quando a [Nome] foi fundada? E o que motivou a criação — qual problema você queria resolver?"

**Por que importa:** DNA da empresa. Matéria-prima para storytelling, posts de fundador e conteúdo TOFU. Também revela o problema-raiz, fundamental para persona e produto.

**Sugestão contextualizada:** Se o setor (P3) foi específico, usar como contexto: "Você atua em [setor] — o que te levou a entrar nesse mercado?"

**Exemplos:**
- "Comecei em 2019 porque vi que pequenas clínicas não sabiam usar Instagram pra atrair pacientes"
- "Nasceu em 2021 quando saí de uma big tech e quis aplicar growth marketing pra PMEs"
- "Minha família sempre teve restaurante. Em 2018 decidi modernizar e abrir a minha hamburgueria"
- "Sou dentista há 15 anos. Montei a clínica porque queria atender de um jeito diferente, sem aquela frieza"

**Processamento:**
- Resposta vaga: Se só disser o ano sem motivação → "E o que te motivou? Qual problema você viu que queria resolver?"
- Se resposta longa: Extrair (a) ano de fundação e (b) motivação/problema. Confirmar ambos separadamente.
- Contradição: Não aplicável.

**Classificação esperada:** ✅ se tem ano + motivação clara. 🔶 se tem ano mas motivação genérica (ex: "vi uma oportunidade"). 🔸 se não sabe o ano ou não consegue articular motivação.

---

### Pergunta 5 de 6 — Tamanho da operação

**Texto:**
> "Quantas pessoas trabalham na [Nome] hoje?"

**Por que importa:** Calibra complexidade e realismo de tudo que vem depois. Solo precisa de estratégia que uma pessoa executa. Equipe de 50 pode ter time dedicado.

**Sugestão contextualizada:** Não aplicável (dado independente).

**Opções:**
- Solo (só você)
- Micro (2–10 pessoas)
- Pequena (11–50 pessoas)
- Média (51–200 pessoas)
- Grande (mais de 200)

**Processamento:**
- Resposta fora das opções (ex: "tenho 3 freelancers"): Enquadrar: "Considerando os freelancers fixos, ficaria em Micro (2-10). Faz sentido?"
- Contradição: Não aplicável.

**Classificação esperada:** Quase sempre ✅ (é um dado objetivo). Seria 🔶 se estiver contratando/demitindo ativamente.

---

### Pergunta 6 de 6 — Maturidade real de mercado

**Texto:**
> "Há quanto tempo a [Nome] opera de fato? Desde que começou a vender ou atender — pode ser diferente do ano de fundação."

**Por que importa:** Maturidade real impacta estratégia de conteúdo e estágio de funil. Fundada em 2020 mas vendendo desde 2023 = 2 anos de mercado, não 5.

**Sugestão contextualizada:** Usar ano de fundação da P4: "Você disse que fundou em [ano]. Começou a vender/atender no mesmo ano ou depois?"

**Exemplos:**
- "Desde 2020, mesmo ano que fundei"
- "Fundei em 2021 mas só comecei a vender em 2023"
- "6 meses atrás"
- "Desde 2015, mais de 10 anos"

**Processamento:**
- Se igual ao ano de fundação: Registrar. Sem necessidade de detalhar.
- Se diferente: Registrar ambos (fundação e início real). Usar o início real como maturidade.
- Contradição com P4: Se disser que opera há 10 anos mas fundou há 2 → "Você mencionou que fundou em [ano]. Opera há mais tempo com outro formato? Me explica pra eu registrar certo."

**Classificação esperada:** ✅ se data concreta. 🔶 se aproximada ("uns 3 anos"). 🔸 se muito incerta ("não lembro bem").

---

## FASE 4 — Análise de Qualidade

### Campos por prioridade

| Prioridade | Campos |
|------------|--------|
| **Crítico** | Nome, Setor/Nicho |
| **Importante** | Origem/motivação, Tamanho |
| **Desejável** | Slogan, Maturidade |

### Verificações

```
1. Contar classificações (✅ / 🔶 / 🔸)
2. Coerência interna:
   - Setor vs. Origem: A motivação faz sentido para o setor?
     Ex: setor "e-commerce de cosméticos" + origem "saí de uma consultoria de TI" → ok, é uma transição.
     Ex: setor "consultoria jurídica" + origem "sempre trabalhei com gastronomia" → incoerência, apontar.
3. Gaps:
   - Campos sem resposta ou "a definir"
   - Campos críticos como 🔸
4. Nível de confiança:
   - Alto: 70%+ ✅, zero gaps em críticos
   - Médio: 50-70% ✅, ou 1 gap menor
   - Baixo: <50% ✅, ou campo crítico 🔸/sem resposta
```

---

## FASE 5 — Resumo e Decisão

```
## Resumo — Etapa 1: Identidade & Fundação

[✅/🔶/🔸] **Nome:** [valor]
[✅/🔶/🔸] **Slogan:** [valor ou "Não definido"]
[✅/🔶/🔸] **Setor / Nicho:** [valor]
[✅/🔶/🔸] **Origem:** [ano + motivação resumida]
[✅/🔶/🔸] **Tamanho:** [classificação]
[✅/🔶/🔸] **Maturidade:** [tempo real]

---
Confiança: [Alto/Médio/Baixo]
Validadas: [X] de 6 | Precisas: [X] | Vagas: [X]

[Gaps se houver]
[Incoerências se houver]

---
Próximo: Etapa 2 mapeia mercado, modelo de negócio e posição competitiva
usando o setor e a maturidade que registramos aqui.

(A) Prosseguir
(B) Refinar campo(s)
(C) Refazer etapa
```

---

## FASE 6 — Salvar

Atualizar `Seção 1` do `COMPANY_PROFILE.md`:

```markdown
## 1. Identidade & Fundação
<!-- Preenchido pela Etapa 1 -->

- **Nome:** Método Vendas <!-- status: validado -->
- **Slogan:** Venda com método, não no improviso <!-- status: validado -->
- **Setor / Nicho:** Consultoria de vendas B2B para startups early-stage <!-- status: validado -->
- **Fundação:** 2021 <!-- status: validado -->
- **Tempo real de mercado:** 3 anos (vende desde 2022) <!-- status: hipotese-precisa -->
- **Tamanho da operação:** Micro (5 pessoas) <!-- status: validado -->
- **Origem e motivação:** Fundador saiu de uma big tech em 2021 e viu que startups early-stage não tinham processo de vendas — fechavam negócio no improviso. Criou a Método Vendas para trazer estrutura comercial acessível para esse público. <!-- status: validado -->

### Insights — Etapa 1
- **Clareza de posicionamento:** Alta (setor específico + slogan definido)
- **Maturidade:** Em crescimento (3 anos de mercado)
- **Complexidade operacional:** Baixa (micro, 5 pessoas)
- **Potencial de storytelling:** Alto (história de transição big tech → empreendedorismo com problema claro)
```

Atualizar cabeçalho:
```
<!-- Última atualização: [data] -->
<!-- Status: em andamento | Etapa atual: 2 de 4 -->
```

Confirmar:
> "Etapa 1 salva. Identidade da Método Vendas registrada com confiança [nível]. Vamos para a Etapa 2 — Mercado & Modelo de Negócio?"