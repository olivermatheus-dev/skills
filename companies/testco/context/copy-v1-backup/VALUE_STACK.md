---
artifact: value_stack
company: testco
generated_at: 2026-04-16
source_files:
  - context/PRODUCT_CONTEXT.md
  - context/AUDIENCE_PROFILES.md
  - audiences/AUDIENCE_ana-tech-lead.md
version: 1
status: draft
---

# Value Stack — TestCo

> **Framework:** Price anchoring (tradição direct response — Hopkins, Halbert).
> Quando o valor percebido de cada benefício é explicitado e somado, o preço
> final parece uma pechincha.

## Custo da Inação (status quo sem o produto)

Do AUDIENCE_PROFILES, o que Ana perde HOJE com o time dela:

| Dimensão | Custo |
|---|---|
| **Financeiro** | R$ 80.000/mês em horas de dev queimadas em manutenção de testes |
| **Tempo** | 6-8h/semana por dev sênior |
| **Emocional** | Ansiedade antes de cada release; brigas recorrentes "escrever teste ou não"; 3 devs já reclamaram em 1:1 |
| **Prazo crítico** | Próxima rodada de investimento (Q3 2026) vai avaliar velocity do time — se a manutenção continuar, vai aparecer na due diligence técnica |

**Total de perda anualizada:** R$ 960.000 + custo intangível de churn de dev sênior (dev sair por frustração custa 6-9 meses de salário em reposição).

## Stack de Valor Entregue

Unidade familiar da persona (Ana): "horas de dev sênior" a R$ 150/hora.

| # | Benefício | O que entrega de concreto | Valor percebido/mês |
|---|---|---|---|
| 1 | **Auto-Heal Engine** | Elimina ~30h/mês de manutenção de teste no time de 20 devs | R$ 4.500 |
| 2 | **Gravador inteligente** | Converte sessões reais em testes, economiza 4h/semana de QA escrevendo caso | R$ 2.400 |
| 3 | **Execução paralela em cloud** | CI 5x mais rápido sem infra própria — dev espera menos, entrega mais | R$ 3.000 |
| 4 | **Integração CI/CD nativa** | Zero setup de infra; evita 1-2 dias de SRE configurando | R$ 500 |
| 5 | **Dashboard de flakiness** | Visibilidade temporal — descobre testes flaky antes deles virarem crise; evita 1 incidente/trimestre (~R$ 15k) | R$ 5.000 |
| 6 | **Bonus: integração com session replay** | Converte bugs reportados por usuário em teste de regressão em minutos | R$ 1.500 |
| **TOTAL** | | | **R$ 16.900/mês** |

**Preço real (plano médio, time 20 devs):** R$ 1.800/mês
**Economia mensal (stack − preço):** R$ 15.100
**Economia anualizada:** R$ 181.200

## 3 Âncoras de preço para copy

### Âncora 1 — Custo da Inação
> "Seu time já perde R$ 80.000/mês com testes flaky. O TestCo custa R$ 1.800/mês — 2,25% dessa perda, e para no primeiro dia de uso. O ROI é positivo no primeiro mês."

### Âncora 2 — Alternativa humana
> "Um QA sênior dedicado a manutenção de teste custa R$ 14.000/mês e vira gargalo. O Auto-Heal Engine faz o equivalente por R$ 1.800/mês, sem virar gargalo e sem entrar de férias."

### Âncora 3 — Stack somado
> "Se você pagasse cada benefício separado: R$ 16.900/mês. Pacote completo TestCo: R$ 1.800/mês. Você economiza R$ 15.100 todo mês — pra sempre."

## Regras de construção aplicadas

1. **Valor percebido ≠ custo de produção.** Todos os itens usam "horas de dev sênior economizadas" ou "incidente evitado" — unidades que Ana contabiliza no dia a dia.
2. **Ancorado em unidade familiar.** R$ 150/h é consistente com a faixa salarial da persona (R$ 20-35k/mês ≈ R$ 125-220/h).
3. **Bonus subestimado funciona.** Item 6 (session replay) é "feature subestimada" do PRODUCT_CONTEXT — surpresa positiva eleva valor percebido.

## Quando usar

- **Sales page:** seção "O que você recebe" com a tabela completa
- **Proposta comercial:** stack de valor em 1 página, precede o preço
- **Email de objeção #4 (preço):** usar Âncora 1 (Custo da Inação) — a mais forte para tech lead
- **Call de fechamento:** citar Âncora 1 se prospect é Series A (cost-conscious) ou Âncora 3 se é Series B+ (quer stack completo)
- **Material de retenção (evitar churn):** relembrar stack para cliente considerando cancelar

## Fonte de derivação

- `PRODUCT_CONTEXT.md > Módulos / Funcionalidades principais`: 5 features principais
- `PRODUCT_CONTEXT.md > Features subestimadas > Integração com session replay`
- `PRODUCT_CONTEXT.md > Detalhes comerciais > Faixa de preço`: "R$ 499/mês (time 5 devs) até R$ 4.999/mês (50+ devs)"
- `PRODUCT_CONTEXT.md > Time-to-value`: "Primeiro auto-reparo (wow moment) em ~1 semana"
- `audiences/AUDIENCE_ana-tech-lead.md > Custo da Inação`: "R$ 80k/mês, 6-8h/semana por dev sênior, ansiedade antes de release"
- `audiences/AUDIENCE_ana-tech-lead.md > Percepção do preço do produto`: "Se o produto economiza 5-10h/semana do time, o ticket de R$1.800/mês é 'quase embaraçosamente barato'"
- `audiences/AUDIENCE_ana-tech-lead.md > Dados Socioeconômicos > Renda individual`: "R$ 20-35k/mês" (confirma R$ 150/h como unidade)
