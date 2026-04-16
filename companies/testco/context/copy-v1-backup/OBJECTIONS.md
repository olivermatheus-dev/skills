---
artifact: objections
company: testco
generated_at: 2026-04-16
source_files:
  - context/PRODUCT_CONTEXT.md
  - context/AUDIENCE_PROFILES.md
  - audiences/AUDIENCE_ana-tech-lead.md
version: 1
status: draft
---

# Objections Framework — TestCo

> **Framework:** 5 objeções universais (tradição direct response — Halbert,
> Kurtz, Makepeace). Toda venda acontece quando as 5 são neutralizadas,
> mesmo que o cliente verbalize só 1-2.

## Matriz das 5 Objeções Universais

---

### Objeção 1 — "Não funciona" (ceticismo sobre resultado)

**Como a persona verbaliza:**
> "IA consertando teste parece bom demais pra ser verdade. Vai dar resultado fake, positivo errado."

**Resposta curta:**
> "O engine tem 90% de taxa de acerto em auto-reparo, auditado em 180 empresas, e cada conserto vira PR que você revisa antes de ir pro main."

**Resposta longa:**

O Auto-Heal Engine não é uma caixa-preta que "conserta" silenciosamente. Todo conserto proposto é um pull request com diff explicado em linguagem natural — você aceita, rejeita ou ajusta, como faria com qualquer PR de um dev do time. Em 180 empresas ativas, 90% dos consertos são aceitos sem modificação; os 10% restantes geram feedback que o engine usa para melhorar, e você sempre mantém o veto final.

**Prova de apoio:**
- 90% de taxa de conserto autônomo (Tier 1)
- NPS 72 (Tier 1)
- Case Fintech X: CI de 42min → 8min em 30 dias (Tier 2)

---

### Objeção 2 — "Não funciona pra mim" (context mismatch)

**Como a persona verbaliza:**
> "Nosso stack é específico. Temos framework customizado, CI peculiar, rotinas próprias — não vai se adaptar."

**Resposta curta:**
> "A TestCo integra nativamente com GitHub Actions, GitLab CI, CircleCI e Jenkins, e já atende 180 scale-ups SaaS — provavelmente com stack parecido com o seu."

**Resposta longa:**

O Auto-Heal Engine foi construído para a realidade de aplicação web moderna — SPAs com React, Vue, Svelte ou Angular, rodando em CI padrão de mercado. Entre os 180 clientes ativos estão 4 unicórnios brasileiros e múltiplas fintechs Series B — com stacks tão diversos quanto o mercado brasileiro permite. Se seu stack web é padrão dos últimos 5 anos, funciona no primeiro dia.

**Prova de apoio:**
- 180 empresas ativas, 4 unicórnios brasileiros (Tier 3)
- Integrações CI/CD nativas: GitHub Actions, GitLab CI, CircleCI, Jenkins (PRODUCT_CONTEXT)
- Anti-persona explícita no PRODUCT: mobile nativo e stacks legacy NÃO são nosso foco — honestidade sobre onde não funciona constrói confiança sobre onde funciona

---

### Objeção 3 — "Não consigo usar / é complicado" (esforço percebido)

**Como a persona verbaliza:**
> "Já temos Cypress implementado há 2 anos — migrar vai travar o time por semanas."

**Resposta curta:**
> "Setup em 5 min via CLI, e o Auto-Heal Engine roda em paralelo ao seu Cypress existente — você não migra, você adiciona."

**Resposta longa:**

A TestCo não exige que você rasgue sua suite Cypress atual. Você instala o CLI em 5 minutos, aponta para seu repo e o engine começa a rodar em paralelo ao Cypress. Durante 30 dias, você vê o Auto-Heal funcionando nos mesmos testes — com dashboard mostrando quantos consertos foram feitos e quanto tempo de dev foi economizado. Só depois, quando o ROI estiver claro, você decide migrar (ou não). O caso da Fintech X: migração completa em 30 dias rodando os dois em paralelo.

**Prova de apoio:**
- Time-to-value: primeiro teste rodando em < 10 min (PRODUCT_CONTEXT)
- Case Fintech X: migração em 30 dias com Cypress rodando em paralelo (Tier 2)

---

### Objeção 4 — "Não posso pagar agora" (price/timing)

**Como a persona verbaliza:**
> "Está fora do orçamento deste trimestre. Precisamos justificar cada ferramenta nova."

**Resposta curta:**
> "Seu time perde R$ 80k/mês com testes flaky. R$ 1.800/mês é 2,25% disso — ROI positivo no primeiro mês."

**Resposta longa:**

O custo escondido da flakiness numa scale-up de 20 devs é R$ 80k/mês em horas de dev sênior queimadas em manutenção de teste. A TestCo custa R$ 499 a R$ 4.999/mês conforme tamanho do time — o ticket médio fica em R$ 1.800/mês. Se o engine economiza 5 horas/semana do seu dev sênior, o ROI é positivo antes do fim do primeiro mês — e a partir daí você tem uma linha de custo fixa em vez da sangria variável que você tem hoje.

**Prova de apoio:**
- Custo da inação: R$ 80k/mês, 6-8h/semana por dev sênior (AUDIENCE)
- Stack completo em VALUE_STACK.md com 3 âncoras

---

### Objeção 5 — "Não confio em vocês" (trust gap)

**Como a persona verbaliza:**
> "Nunca ouvi falar. Como sei que não vão sumir em 2 anos e eu ficar na mão com suite migrada?"

**Resposta curta:**
> "5 anos no mercado, Series A captada em 2025, R$ 6M ARR crescendo 12% MoM, e 450 stars no GitHub open-source."

**Resposta longa:**

A TestCo existe desde 2021, com produto em produção desde 2022. Captamos Series A em 2025 — 5 anos de histórico antes do investimento institucional. Temos 180 clientes ativos, NPS 72, e projetos open-source no GitHub que o seu time pode auditar agora. Os fundadores eram tech leads do mesmo perfil da sua persona — você pode ler os commits históricos deles no github.com/testco-labs. A fragilidade de ferramenta fechada não se aplica: nosso CLI é transparente e nosso engine tem changelog público.

**Prova de apoio:**
- 5 anos de mercado, Series A 2025 (Tier 5 + 4)
- 180 empresas, NPS 72 (Tier 1 + 3)
- GitHub @testco-labs com 450 stars (Tier 3 + 4)
- Transparência do engine: PRs auditáveis

---

## Objeções específicas desta persona (não universais)

Do AUDIENCE_PROFILES, objeções específicas de Ana além das 5 universais:

- **"Medo de que a IA 'conserte errado'":** cada conserto é PR revisável com diff em linguagem natural — você aprova antes de ir pro main. Controle 100% humano, automação 100% do trabalho chato.
- **"Já paguei Mabl — é a mesma coisa?":** Mabl é no-code enterprise para QA, com preço enterprise-only e engine opaco. TestCo é CLI-first para dev, 1/5 do preço médio, com transparência total do conserto.

## Regra de prioridade

Para Ana (tech lead estica-tempo), a ordem de peso das 5 objeções é:

1. **Objeção 3** — "Vai travar o time por semanas" (migração é a barreira mais forte — Ring 3 da persona)
2. **Objeção 1** — "IA conserta errado" (ceticismo técnico de quem já foi queimado por hype)
3. **Objeção 4** — Preço (importante mas não bloqueante para scale-up Series A-B)
4. **Objeção 5** — Trust gap (mitigado por open-source + NPS)
5. **Objeção 2** — Context mismatch (baixo peso — stack padrão)

Este ranking vem do Ring 3 (Barreira) da persona e deve guiar a ordem em sales pages e VSLs.

## Fonte de derivação

- `audiences/AUDIENCE_ana-tech-lead.md > Ring 3 (Barreira)`: "Medo de que a IA 'conserte errado' e a gente passe a confiar em teste que não testa de verdade. Opacidade do engine seria dealbreaker."
- `audiences/AUDIENCE_ana-tech-lead.md > Objeções principais (3 com resposta)`
- `PRODUCT_CONTEXT.md > Objeção principal pré-compra`: "Já temos Cypress há 2 anos — migrar vai travar o time por semanas."
- `PRODUCT_CONTEXT.md > Prova social disponível`: "180 empresas ativas, 4 unicórnios brasileiros (NDA), Case Fintech X, 450 stars GitHub, NPS 72"
- `PRODUCT_CONTEXT.md > Limitações do produto` (confirma honestidade na Objeção 2)
