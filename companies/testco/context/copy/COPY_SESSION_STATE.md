# COPY_SESSION_STATE — testco

> Este arquivo combina status + depósito de artefatos intermediários do fluxo `/setup-copy-foundation`. Gerado pela refatoração v2 (orquestrador + 7 sub-skills atômicas).

---

## Sessão Atual
- empresa: testco
- data_inicio: 2026-04-16
- escopo_selecionado: completo
- artefatos_solicitados: [BIG_IDEA, UNIQUE_MECHANISM, MECHANISM_OF_FAILURE, OBJECTIONS, VALUE_STACK, PROOF_HIERARCHY, CTA_LIBRARY]
- modo: unificado
- perfis: [unificado]
- perfil_ativo: unificado
- versao: 2 (migrado da v1 — orquestrador refatorado)

---

## Pré-requisitos verificados
| Arquivo | Status | Nota |
|---|---|---|
| PRODUCT_CONTEXT.md | ✅ | |
| AUDIENCE_PROFILES.md | ✅ | 1 persona (Ana, tech lead) — sem bifurcação B2B explícita |
| COMPETITOR_MAP.md | ✅ | |
| BRAND_VOICE.md | ✅ | |
| COMPANY_PROFILE.md | ✅ | Missão consultada para Big Idea |
| CONTENT_PILLARS.md | ✅ | Pilar 1 como âncora principal |
| PLATFORM_SPECS.md | ✅ | LinkedIn, X, YouTube, Blog, Email, Sales Page |

---

## Artefatos — status por perfil

| Artefato | Perfil | Status | Versão | Atualização | Arquivo |
|---|---|---|---|---|---|
| BIG_IDEA | unificado | draft | 1 | 2026-04-16 | context/copy/BIG_IDEA.md |
| UNIQUE_MECHANISM | unificado | draft | 1 | 2026-04-16 | context/copy/UNIQUE_MECHANISM.md |
| MECHANISM_OF_FAILURE | unificado | draft | 1 | 2026-04-16 | context/copy/MECHANISM_OF_FAILURE.md |
| OBJECTIONS | unificado | draft | 1 | 2026-04-16 | context/copy/OBJECTIONS.md |
| VALUE_STACK | unificado | draft | 1 | 2026-04-16 | context/copy/VALUE_STACK.md |
| PROOF_HIERARCHY | unificado | draft | 1 | 2026-04-16 | context/copy/PROOF_HIERARCHY.md |
| CTA_LIBRARY | unificado | draft | 1 | 2026-04-16 | context/copy/CTA_LIBRARY.md |

---

## Depósito de artefatos intermediários

### Perfil: unificado

#### BIG_IDEA (8.1)
- promessa_central: "Construa cultura de qualidade sem ser a tech lead que mantém os testes."
- variacao_resultado: "Testes E2E com 90% de taxa de auto-reparo — sem dev mexendo em teste quebrado."
- variacao_dor: "Pare de perder 6h da sua sexta-feira consertando testes flaky."
- variacao_identidade: "A tech lead que construiu cultura de qualidade sem virar pesadelo burocrático."
- sujeito: "Tech lead de scale-up B2B responsável por qualidade entre mil outras coisas"
- transformacao: "De 'tech lead que apaga fogo de teste' para 'tech lead com pipeline confiável'"
- diferencial_implicito: "Engine de auto-reparo que elimina a manutenção — qualidade sem o trabalho manual"
- status: draft
- atualizado_em: 2026-04-16

#### UNIQUE_MECHANISM (8.2)
- nome: "Auto-Heal Engine"
- narrativa: "Sistema proprietário que detecta quando um teste E2E quebra por mudança de UI e sugere a correção automaticamente em 90% dos casos. Compara estrutura do DOM antes/depois do refator, identifica o elemento equivalente e gera PR de conserto com diff em linguagem natural. Diferente de frameworks tradicionais que quebram e precisam de manutenção manual, aprende com histórico e melhora a cada refator. Não é wrapper de LLM — é modelo treinado em padrões de UI-drift de apps web reais."
- metafora: "É como um auto-complete, mas para testes quebrados."
- provas_unicidade: ["Engine proprietário treinado em UI-drift de apps web reais (não wrapper de LLM)", "Transparência total — cada conserto vira PR revisável com diff em linguagem natural", "Dev-first via CLI — setup em 5 min, zero onboarding forçado"]
- candidatos_nome_rejeitados: ["Zero-Maintenance Testing", "Reflex Guard"]
- status: draft
- atualizado_em: 2026-04-16

#### MECHANISM_OF_FAILURE (8.3)
- vilao_uma_frase: "A ilusão de que teste E2E é só escrever código — quando na verdade 80% do trabalho é manter o que já foi escrito."
- falha_1_nome: "Fragilidade por design (selectors acoplados ao DOM)"
- falha_1_sintoma: "Os testes quebram toda vez que a gente mexe no CSS. Dá uma raiva."
- falha_1_raiz: "Frameworks como Cypress e Playwright foram projetados para execução, não para sobreviver a refator"
- falha_2_nome: "Flakiness acumulada sem diagnóstico"
- falha_2_sintoma: "Na última sprint o CI travou 3x por teste flaky — perdi meia tarde procurando o que quebrou e no final era só data mock desatualizado."
- falha_2_raiz: "Sem dashboard de flakiness temporal, você não vê o padrão — só vê o teste falhando hoje, não que ele falha 30% das vezes há 3 meses"
- falha_3_nome: "Dívida de manutenção invisível"
- falha_3_sintoma: "Perco 6-8h por semana do meu time com manutenção de teste. Três devs já comentaram em 1:1 que 'testes são um peso morto'."
- falha_3_raiz: "O custo só fica visível se você mede — nenhum framework tradicional entrega esse relatório por padrão"
- status: draft
- atualizado_em: 2026-04-16

#### OBJECTIONS (8.4)
- obj_1_verbalizacao: "IA consertando teste parece bom demais pra ser verdade. Vai dar resultado fake, positivo errado."
- obj_1_resposta_curta: "O engine tem 90% de taxa de acerto em auto-reparo, auditado em 180 empresas, e cada conserto vira PR que você revisa antes de ir pro main."
- obj_1_resposta_longa: "O Auto-Heal Engine não é uma caixa-preta. Todo conserto é PR com diff explicado em linguagem natural — você aceita, rejeita ou ajusta como faria com qualquer PR. Em 180 empresas ativas, 90% dos consertos são aceitos sem modificação; os 10% restantes geram feedback que o engine usa para melhorar, e você sempre mantém o veto final."
- obj_2_verbalizacao: "Nosso stack é específico. Temos framework customizado, CI peculiar — não vai se adaptar."
- obj_2_resposta_curta: "Integração nativa com GitHub Actions, GitLab CI, CircleCI e Jenkins, e já atende 180 scale-ups SaaS com stacks parecidos."
- obj_2_resposta_longa: "Construído para apps web modernas — SPAs com React, Vue, Svelte ou Angular em CI padrão. Entre os 180 clientes ativos estão 4 unicórnios brasileiros e múltiplas fintechs Series B. Mobile nativo e stacks legacy NÃO são foco — honestidade sobre onde não funciona constrói confiança sobre onde funciona."
- obj_3_verbalizacao: "Já temos Cypress há 2 anos — migrar vai travar o time por semanas."
- obj_3_resposta_curta: "Setup em 5 min via CLI, e o Auto-Heal Engine roda em paralelo ao Cypress — você não migra, você adiciona."
- obj_3_resposta_longa: "Não exigimos que você rasgue sua suite Cypress. Instala CLI em 5 min, aponta para o repo, engine roda em paralelo. Em 30 dias você vê Auto-Heal funcionando nos mesmos testes com dashboard mostrando consertos feitos e tempo economizado. Só depois, com ROI claro, você decide migrar. Fintech X: migração completa em 30 dias rodando dois em paralelo."
- obj_4_verbalizacao: "Está fora do orçamento deste trimestre. Precisamos justificar cada ferramenta nova."
- obj_4_resposta_curta: "Seu time perde R$ 80k/mês com testes flaky. R$ 1.800/mês é 2,25% disso — ROI positivo no primeiro mês."
- obj_4_resposta_longa: "Custo escondido da flakiness numa scale-up de 20 devs é R$ 80k/mês em horas de dev sênior. A TestCo custa R$ 499 a R$ 4.999/mês; ticket médio R$ 1.800/mês. Se o engine economiza 5h/semana de dev sênior, ROI é positivo antes do fim do primeiro mês."
- obj_5_verbalizacao: "Nunca ouvi falar. Como sei que não vão sumir em 2 anos?"
- obj_5_resposta_curta: "5 anos no mercado, Series A 2025, R$ 6M ARR crescendo 12% MoM, 450 stars no GitHub open-source."
- obj_5_resposta_longa: "Existimos desde 2021, produto em produção desde 2022. 5 anos antes do investimento institucional. 180 clientes, NPS 72, projetos open-source auditáveis. Fundadores foram tech leads do mesmo perfil da persona — commits históricos no github.com/testco-labs. CLI transparente, changelog público do engine."
- objecoes_especificas: ["'Medo de que a IA conserte errado' → cada conserto é PR revisável. Controle 100% humano, automação 100% do trabalho chato.", "'Já paguei Mabl — é a mesma coisa?' → Mabl é no-code enterprise para QA, preço enterprise-only, engine opaco. TestCo é CLI-first para dev, 1/5 do preço médio, transparência total."]
- ordem_peso_persona: [3, 1, 4, 5, 2]
- status: draft
- atualizado_em: 2026-04-16

#### VALUE_STACK (8.5)
- unidade_familiar: "horas de dev sênior"
- valor_unitario_rs: "R$ 150/h"
- custo_inacao_financeiro: "R$ 80.000/mês em horas de dev queimadas em manutenção"
- custo_inacao_tempo: "6-8h/semana por dev sênior"
- custo_inacao_emocional: "Ansiedade antes de release; brigas 'escrever teste ou não'; 3 devs já reclamaram em 1:1"
- custo_inacao_prazo: "Q3 2026 — rodada de investimento vai avaliar velocity na due diligence técnica"
- custo_inacao_anualizado: "R$ 960.000 + custo intangível (churn de dev = 6-9 meses de salário em reposição)"
- stack_itens:
  - beneficio: "Auto-Heal Engine"
    entrega: "Elimina ~30h/mês de manutenção no time de 20 devs"
    valor_rs: "R$ 4.500"
  - beneficio: "Gravador inteligente"
    entrega: "Converte sessões reais em testes, economiza 4h/semana de QA"
    valor_rs: "R$ 2.400"
  - beneficio: "Execução paralela em cloud"
    entrega: "CI 5x mais rápido sem infra própria"
    valor_rs: "R$ 3.000"
  - beneficio: "Integração CI/CD nativa"
    entrega: "Zero setup de infra; evita 1-2 dias de SRE"
    valor_rs: "R$ 500"
  - beneficio: "Dashboard de flakiness"
    entrega: "Visibilidade temporal; evita 1 incidente/trimestre (~R$ 15k)"
    valor_rs: "R$ 5.000"
  - beneficio: "Bonus: integração com session replay"
    entrega: "Converte bugs reportados em testes de regressão em minutos"
    valor_rs: "R$ 1.500"
- stack_total_rs: "R$ 16.900/mês"
- preco_real_rs: "R$ 1.800/mês"
- economia_mensal_rs: "R$ 15.100"
- economia_anualizada_rs: "R$ 181.200"
- ancora_1_inacao: "Seu time já perde R$ 80.000/mês com testes flaky. O TestCo custa R$ 1.800/mês — 2,25% dessa perda, e para no primeiro dia de uso. O ROI é positivo no primeiro mês."
- ancora_2_humana: "Um QA sênior dedicado a manutenção de teste custa R$ 14.000/mês e vira gargalo. O Auto-Heal Engine faz o equivalente por R$ 1.800/mês, sem virar gargalo e sem entrar de férias."
- ancora_3_stack: "Se você pagasse cada benefício separado: R$ 16.900/mês. Pacote completo TestCo: R$ 1.800/mês. Você economiza R$ 15.100 todo mês — pra sempre."
- status: draft
- atualizado_em: 2026-04-16

#### PROOF_HIERARCHY (8.6)
- tier_1_quantitativa: ["90% de taxa de auto-reparo autônomo (benchmark em 180 empresas)", "NPS 72 (Q1/2026)", "Case Fintech X: CI de 42min → 8min em 30 dias (redução de 81%)", "~R$ 6M ARR, 12% MoM (2026)"]
- tier_2_cases:
  - empresa: "Fintech Series B brasileira (NDA)"
    contexto: "Suite Cypress 800 testes, CI de 42min, ~35% de testes flaky"
    acao: "Instalaram TestCo em paralelo ao Cypress; em 30 dias migraram progressivamente usando Auto-Heal Engine"
    resultado: "CI 42→8min; flakiness 35%→<5%; time recuperou ~120h/mês de dev sênior"
- tier_3_agregada: ["180 empresas ativas (2026)", "4 unicórnios brasileiros entre os clientes (NDA)", "GitHub @testco-labs: 450 stars", "Menções orgânicas em DevTools Digest"]
- tier_4_autoridade: ["Integração oficial com GitHub Actions, GitLab CI, CircleCI, Jenkins"]
- tier_5_experiencia: ["5 anos no mercado (desde 2021, produto em produção desde 2022)", "Fundadores eram tech leads com narrativa de dog fooding autêntica", "Series A 2025, ~R$ 6M ARR"]
- gaps_tier_1: ["Benchmark comparativo público TestCo vs. Cypress vs. Playwright (crítico)", "Taxa de conversão trial→paid", "Estudo longitudinal redução de flakiness 6-12 meses"]
- gaps_tier_2: ["2º e 3º cases consolidados", "Case partindo de Playwright", "Case com nome público (não NDA)"]
- gaps_tier_3: ["Reviews em G2/Capterra"]
- gaps_tier_4: ["Imprensa em veículos principais", "Prêmios/certificações", "Endorsements públicos"]
- gaps_prioridade: [2, 1, 3, 4]
- status: draft
- atualizado_em: 2026-04-16

#### CTA_LIBRARY (8.7)
- nivel_1_ctas: ["Descubra quanto sua suite de testes está custando por mês", "Rode o diagnóstico de flakiness do seu CI em 60s", "Veja como o CI do seu time se compara a 180 scale-ups"]
- nivel_2_ctas: ["Baixe o guia: como scale-ups estão reduzindo flakiness em 80%", "Entenda por que Cypress quebra a cada refator (e o que fazer sobre isso)", "Receba a série sobre manutenção de teste sem dor"]
- nivel_3_ctas: ["Compare TestCo, Cypress e Playwright lado a lado", "Baixe o playbook: migrando Cypress para auto-heal em 30 dias", "Veja 3 abordagens para eliminar flakiness do seu CI"]
- nivel_4_ctas: ["Teste grátis por 14 dias — setup em 5 minutos, sem cartão", "Agende demo de 20 min com um engineer", "Veja o Auto-Heal Engine rodando no seu repo"]
- nivel_5_ctas: ["Começar agora", "Ativar o plano Team", "Criar conta e rodar o primeiro teste"]
- cta_linkedin: "Ver o Auto-Heal Engine em ação no seu repo é mais rápido do que ler o print. Link pra trial de 14 dias no primeiro comentário."
- cta_twitter: "Se isso ressoou e você quer o playbook completo de migração Cypress → auto-heal em 30 dias, salvei em [link]."
- cta_youtube: "Se quer rodar isso no seu repo, o CLI tá na descrição. Setup em 5 min."
- cta_blog: "Inline: 'Quer entender por que isso acontece? Baixe o guia completo aqui.' / Banner: 'Guia: manutenção de teste sem dor' / Final: 'Pegue o guia + 3 emails com benchmarks reais.'"
- cta_email: "Botão 'Ativar meu trial' no meio + 'Se preferir agendar com um engineer antes, responda este email' no final."
- cta_sales_page: "Hero 'Teste grátis por 14 dias' → Oferta 'Começar agora' → FAQ 'Falar com um engineer'"
- distribuicao_niveis: "10/40/25/15/10 (Nível 1 a 5)"
- mecanismo_entrada: "Trial gratuito 14 dias + demo opcional"
- status: draft
- atualizado_em: 2026-04-16

---

## Próxima ação
- proxima_acao: "Nenhuma — foundation gerada. Próxima fase do projeto: Camada Marketing (/copy-sales-page, /copy-email-sequence)."

---

## Histórico de sessões

| Data | Sub-skill | Perfil | Ação | Resultado |
|---|---|---|---|---|
| 2026-04-16 | (v1 monolítica) | unificado | generate | 7 artefatos gerados como draft — antes da refatoração |
| 2026-04-16 | (v2 refatorada) | unificado | migrate | STATE inicializado com depósito populado a partir dos MDs existentes |
