# Etapa 1 — Identidade & Fundação

> Protocolo: `references/EXECUTION_PROTOCOL.md`
> Tipo: **Pergunta** | Perguntas: **6** | Salva em: **Seção 1**

---

## Importância

Define quem é a empresa. A precisão aqui determina a qualidade de tudo que vem depois.

**Insights gerados:**
- Clareza de posicionamento (setor específico + slogan = alta)
- Maturidade real (tempo de mercado, não ano de fundação)
- Potencial de storytelling (riqueza da história de origem)
- Complexidade operacional (solo ≠ 50 pessoas)

---

## FASE 1 — Carregar Contexto

**Esta é a primeira etapa. Pular. Ir para Fase 2.**

Exceção — modo atualização: se COMPANY_PROFILE.md já tem dados na Seção 1, ler e usar como sugestão em cada pergunta: "Atualmente está registrado como [valor]. Mantém ou quer mudar?"

---

## FASE 2 — Definir Modo de Entrada

```
"Vamos começar pela identidade da [slug]. São 6 perguntas.

Prefere:
(A) Responder uma por uma
(B) Me enviar um texto ou documento com essas informações"
```

Se (B): aplicar Protocolo de Extração do EXECUTION_PROTOCOL.md, mapeando contra as 6 perguntas abaixo.

---

## FASE 3 — Coletar e Classificar

**Refinamento:** Não aplicável (primeira etapa).

---

### Pergunta 1 de 6 — Nome da empresa

**Texto:**
> "Qual o nome da sua empresa ou marca?"

**Por que importa:** Identificador em todo o fluxo. Precisa ser a grafia exata usada pela empresa.

**Sugestão contextualizada:** Não aplicável (primeira pergunta).

**Exemplos:**
- "Método Vendas"
- "StudioLab"
- "Clínica Dra. Fernanda Alves"
- "Café do Bairro"

**Processamento:**
- Resposta vaga: Improvável. Se der mais de um nome ("é Método Vendas, mas uso MV também") → "Qual é o nome oficial que aparece pro cliente?"
- Contradição: Não aplicável (primeiro dado).
- Cobre múltiplas: Se disser "Método Vendas, consultoria de vendas B2B" → extrair nome + setor. Confirmar: "Registrei o nome como 'Método Vendas' e já anotei que o setor é consultoria de vendas B2B. Correto?"
- Sem resposta: Não aceitar. Campo obrigatório.

**Classificação esperada:**
- ✅ se nome claro e definitivo
- 🔶 se está em processo de trocar o nome
- 🔸 improvável para nome

**Prioridade:** Crítico

---

### Pergunta 2 de 6 — Slogan ou tagline

**Texto:**
> "Tem um slogan ou tagline? Se não tem, pode pular — a gente pode criar um depois."

**Por que importa:** Revela se a empresa já tem clareza da proposta de valor. Não ter é dado útil — mostra oportunidade de posicionamento.

**Sugestão contextualizada:** Se o nome (P1) sugerir algo, usar: "O nome [Nome] já passa alguma mensagem. Tem uma frase que complementa?"

**Exemplos:**
- "Venda com método, não no improviso"
- "Feito para quem faz"
- "Educação que transforma carreiras"
- "Seu pet merece mais"

**Processamento:**
- Resposta vaga: Se genérico tipo "A melhor empresa" → "Isso é mais um desejo do que um slogan. Tem alguma frase que vocês usam na comunicação — no Instagram, no site, ou no WhatsApp? Se não tem, pula tranquilo."
- Sem resposta: Registrar "Não definido". Não insistir. Não classificar.
- Contradição: Não aplicável.

**Classificação esperada:**
- ✅ se tem slogan que usa ativamente na comunicação
- 🔶 se tem mas não sabe se é definitivo
- 🔸 se inventou na hora ou é muito genérico
- "Não definido" → sem classificação

**Prioridade:** Desejável

---

### Pergunta 3 de 6 — Setor e nicho

**Texto:**
> "Em qual setor ou nicho a [Nome] atua? Seja o mais específico possível."

**Por que importa:** Base para pesquisa de concorrentes, benchmarks de conteúdo e tom. Sem setor específico, as próximas etapas não conseguem gerar sugestões úteis.

**Sugestão contextualizada:** Se P1 ou P2 já deram pistas de setor, usar: "Pelo nome/slogan, parece que vocês atuam com [X]. Pode detalhar?"

**Exemplos:**
- "SaaS B2B para gestão de equipes de vendas"
- "E-commerce de cosméticos veganos"
- "Consultoria jurídica para startups"
- "Hamburgueria artesanal em SP"
- "Escola de inglês online para adultos"
- "Agência de marketing digital para médicos"

**Processamento:**
- Resposta vaga:
  - 1ª tentativa: Se "tecnologia" → "Pode detalhar? 'Tecnologia' pode ser SaaS, hardware, consultoria de TI, dev de apps... Qual é o caso da [Nome]?"
  - 2ª tentativa: Se "software" → "Que tipo de software? Para quem? Ex: 'software de gestão para restaurantes' ou 'app de delivery para bairros'. Quanto mais específico, melhor consigo ajudar nas próximas etapas."
  - Após 2x: Aceitar. Classificar como 🔸.
- Contradição: Não aplicável (primeiro dado de setor).
- Sem resposta: Não aceitar — campo crítico. Insistir com exemplos.

**Classificação esperada:**
- ✅ se inclui tipo + público OU tipo + mercado (ex: "SaaS B2B para equipes de vendas")
- 🔶 se tem direção mas não detalhou (ex: "SaaS" sem dizer pra quem)
- 🔸 se genérico (ex: "tecnologia", "saúde", "serviços")

**Prioridade:** Crítico

---

### Pergunta 4 de 6 — Origem e motivação

**Texto:**
> "Quando a [Nome] foi fundada? E o que motivou a criação — qual problema você queria resolver?"

**Por que importa:** DNA da empresa. Matéria-prima para storytelling, posts de fundador e conteúdo TOFU. Revela o problema-raiz — fundamental para persona e produto.

**Sugestão contextualizada:** Se setor (P3) foi específico → "Você atua em [setor] — o que te levou a entrar nesse mercado?"

**Exemplos:**
- "Comecei em 2019 porque vi que pequenas clínicas não sabiam usar Instagram pra atrair pacientes"
- "Nasceu em 2021 quando saí de uma big tech e quis aplicar growth marketing pra PMEs"
- "Minha família sempre teve restaurante. Em 2018 decidi modernizar e abrir a minha hamburgueria"
- "Sou dentista há 15 anos. Montei a clínica porque queria atender de um jeito diferente"

**Processamento:**
- Resposta vaga: Se só disser o ano → "E o que te motivou? Qual problema você viu que queria resolver?"
- Se resposta longa: Extrair (a) ano de fundação e (b) motivação/problema. Confirmar: "Entendi: fundada em [ano], motivada por [problema resumido]. Correto?"
- Contradição: Não aplicável.
- Sem resposta: Aceitar ano sem motivação se insistir. Registrar motivação como "Não informada".

**Classificação esperada:**
- ✅ se tem ano + motivação clara com problema específico
- 🔶 se tem ano + motivação genérica (ex: "vi uma oportunidade")
- 🔸 se não sabe o ano ou não consegue articular motivação

**Prioridade:** Importante

---

### Pergunta 5 de 6 — Tamanho da operação

**Texto:**
> "Quantas pessoas trabalham na [Nome] hoje?"

**Por que importa:** Calibra complexidade e realismo de estratégias. Solo precisa de conteúdo que uma pessoa executa. Equipe de 50 pode ter time dedicado de marketing.

**Sugestão contextualizada:** Não aplicável (dado independente).

**Opções:**
- Solo (só você)
- Micro (2–10 pessoas)
- Pequena (11–50 pessoas)
- Média (51–200 pessoas)
- Grande (mais de 200)

**Processamento:**
- Resposta fora das opções: Se "tenho 3 freelancers" → "Considerando os freelancers fixos, ficaria em Micro (2-10). Faz sentido?"
- Se número exato: Enquadrar na faixa e confirmar.
- Contradição: Não aplicável.

**Classificação esperada:**
- ✅ quase sempre (dado objetivo)
- 🔶 se contratando/demitindo ativamente e pode mudar em breve

**Prioridade:** Importante

---

### Pergunta 6 de 6 — Maturidade real de mercado

**Texto:**
> "Há quanto tempo a [Nome] opera de fato? Desde que começou a vender ou atender — pode ser diferente do ano de fundação."

**Por que importa:** Maturidade real impacta estratégia de conteúdo e estágio de funil. Fundada em 2020 mas vendendo desde 2023 = 2 anos, não 5.

**Sugestão contextualizada:** Usar ano de fundação da P4: "Você disse que fundou em [ano]. Começou a vender/atender no mesmo ano ou depois?"

**Exemplos:**
- "Desde 2020, mesmo ano que fundei"
- "Fundei em 2021 mas só comecei a vender em 2023"
- "6 meses atrás"
- "Desde 2015, mais de 10 anos"

**Processamento:**
- Se igual ao ano de fundação: Registrar direto.
- Se diferente: Registrar ambos. Usar início real como maturidade.
- Contradição com P4: Se disser que opera há 10 anos mas fundou há 2 → "Você mencionou que fundou em [ano]. Opera há mais tempo com outro formato? Me explica pra registrar certo."

**Classificação esperada:**
- ✅ se data concreta
- 🔶 se aproximada ("uns 3 anos")
- 🔸 se muito incerta ("não lembro bem")

**Prioridade:** Desejável

---

## FASE 4 — Análise de Qualidade

### Campos por prioridade

| Prioridade | Campos |
|------------|--------|
| **Crítico** | Nome, Setor/Nicho |
| **Importante** | Origem/motivação, Tamanho |
| **Desejável** | Slogan, Maturidade |

### Verificações de coerência

```
1. Setor vs. Origem: A motivação faz sentido para o setor?
   - "e-commerce de cosméticos" + "saí de consultoria de TI" → ok, transição
   - "consultoria jurídica" + "trabalhei com gastronomia" → apontar inconsistência
2. Nome vs. Setor: O nome reflete o setor ou é genérico?
   - Dado informativo, não bloqueante.
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

[Gaps e incoerências se houver]

---
Próximo: Etapa 2 mapeia mercado, modelo de negócio e posição
competitiva usando o setor e a maturidade registrados aqui.

(A) Prosseguir para Etapa 2
(B) Refinar campo(s)
(C) Refazer etapa
```

---

## FASE 6 — Salvar

Atualizar Seção 1 do COMPANY_PROFILE.md. Preencher insights:

- **Clareza de posicionamento:**
  - Alta = setor ✅ específico + slogan ✅ definido
  - Média = um dos dois específico
  - Baixa = ambos vagos ou ausentes
- **Maturidade:**
  - Iniciante = <1 ano de mercado real
  - Em crescimento = 1-3 anos
  - Estabelecida = 3+ anos
- **Complexidade operacional:**
  - Baixa = Solo ou Micro
  - Média = Pequena
  - Alta = Média ou Grande
- **Potencial de storytelling:**
  - Alto = origem com história rica, emocional, problema claro
  - Médio = origem funcional mas articulada
  - Baixo = origem vaga ou ausente

Transição: "Etapa 1 salva. Identidade da [Nome] registrada. Vamos para a Etapa 2 — Mercado & Modelo de Negócio?"
