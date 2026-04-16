# Tech Leads em startups de engenharia (scale-ups Series A-B)

---

## 1. Grupo e Segmentação

- **Segmento:** Tech leads e gerentes de engenharia em scale-ups brasileiras com 10-50 desenvolvedores, tipicamente Series A ou B, produto SaaS web em produção.
- **Tipo:** B2B
- **B2B — Decisor:** Tech Lead / Head of Engineering / CTO | **Usuário Final:** Devs do time (QA, backend, frontend)
- **Prioridade estratégica:** Alta
- **Por que esse grupo:** 500+ empresas no Brasil no ICP, time-to-buy relativamente curto (4-6 semanas), maior dor documentada no product feedback, conversão self-serve bem acima da média.
- **Anti-persona:** Engineering managers enterprise com 200+ devs (processo de compra longo, ~9-12 meses, precisa de procurement/LGPD pesado — não é nosso foco neste momento).

---

## 2. Persona: Ana, a tech lead estica-tempo

### Perfil Base
- **Nome arquétipo:** Ana, tech lead responsável pelo platform team que "cuida de testes entre mil outras coisas"
- **Faixa etária:** 30-38 — Geração: Millennial
- **Gênero predominante:** sem predominância clara (levemente feminino no ICP brasileiro)
- **Localização mais provável:** São Paulo, Floripa, Belo Horizonte, remoto
- **Escolaridade:** Graduação em Ciência da Computação ou Engenharia; alguns com especialização

### Contexto de Vida e Trabalho
- **Cargo/Função:** Tech Lead / Engineering Manager (nível sênior, reporta ao CTO)
- **Tipo de empresa:** Scale-up SaaS B2B, 10-50 engenheiros, Series A-B, 3-6 anos de idade
- **Rotina típica:** 8h30 standup, code review manhã inteira, reuniões de roadmap à tarde, 1:1s com devs, 1h de foco só tarde da noite

### Dados Socioeconômicos
- **Renda individual estimada:** R$ 20-35k/mês
- **Classe social:** A
- **Padrão de consumo:** Assinaturas de ferramentas dev (DataDog, Linear, Notion), conferências técnicas, equipamento top
- **Percepção do preço do produto:** Se o produto economiza 5-10h/semana do time, o ticket de R$1.800/mês é "quase embaraçosamente barato"

### 5 Rings of Buying Insight
- **Ring 1 — Gatilho:** "Na última sprint o CI travou 3x por teste flaky — perdi meia tarde procurando o que quebrou e no final era só data mock desatualizado. Preciso resolver isso."
- **Ring 2 — Sucesso:** "CI verde consistente sem intervenção manual. Deploy sexta à tarde sem medo. Dev focado em feature, não em teste quebrado."
- **Ring 3 — Barreira:** "Medo de que a IA 'conserte errado' e a gente passe a confiar em teste que não testa de verdade. Opacidade do engine seria dealbreaker."
- **Ring 4 — Jornada:** Lê Hacker News, assiste YouTube de tech YouTubers (Theo, Primeagen), GitHub trending, newsletters (DevTools Digest). Pede indicação em grupos no Discord.
- **Ring 5 — Decisão:** Trial gratuito que funciona sem onboarding forçado + transparência técnica do engine + case de empresa parecida.

### Perfil Psicográfico
- **Valores inegociáveis:** Qualidade técnica, autonomia do time, pragmatismo
- **Relação com mudança:** Pragmática — adota ferramenta nova se ROI é claro em 30 dias
- **Relação com autoridade:** Confia em pares e especialistas técnicos, cética com marketing
- **Relação com risco:** Calculado — testa em projeto pequeno antes de migrar stack principal
- **Vieses cognitivos dominantes:** Status quo bias (pra migrar precisa de gatilho forte), aversão à perda
- **Referências que admira:** Kent Beck, Martin Fowler, Camille Fournier (The Manager's Path)
- **Hobbies:** Boardgames, trilhas, side projects open-source
- **Referências culturais:** Silicon Valley (série), xkcd, Hacker News comment threads

### Linguagem e Comunicação
- **Palavras que ela usa:** "flaky test", "CI pipeline", "blast radius", "regression", "auto-healing", "developer experience (DX)"
- **Palavras que a afastam:** "solução inovadora", "revolucionário", "transformação digital", "inteligência artificial de ponta"
- **Tom esperado:** Técnico-direto, com dados e código no exemplo
- **Canais não-sociais:** Newsletters técnicas, podcasts (Software Engineering Daily, Ship It!)
- **Redes sociais:** X (diária, consumo), LinkedIn (semanal, profissional), YouTube (sessões longas nos fins de semana)
- **Formato preferido:** Blog post técnico longo + vídeo de código ao vivo

---

## 3. Dores, Desejos e Motivações

### Dores em 3 Camadas
- **Camada 1 — Dor Superficial:** "Os testes quebram toda vez que a gente mexe no CSS. Dá uma raiva."
- **Camada 2 — Dor Profunda:** "Perco 6-8h por semana do meu time com manutenção de teste. Isso trava roadmap e frustra dev sênior — três deles já comentaram em 1:1 que 'testes são um peso morto'."
- **Camada 3 — Medo Não Declarado:** "Se meu time ficar famoso pela suite de testes ruim, vou ser lembrada como a tech lead que não cuidou da qualidade — e vai ser justo porque eu realmente não priorizei."

### Custo da Inação
- **Financeiro:** ~R$ 80k/mês em horas de dev queimadas em manutenção de testes
- **Tempo:** 6-8h/semana por dev sênior
- **Emocional:** Ansiedade antes de cada release, brigas recorrentes sobre "escrever teste ou não"
- **Prazo crítico:** Próxima rodada de investimento (Q3 2026) vai avaliar velocity do time

### O Que Já Tentou
| Solução tentada | Por que tentou | Por que falhou |
|---|---|---|
| Cypress puro | Padrão do mercado | Testes quebram a cada refator, sem auto-reparo |
| Testing trophy com pouco E2E | Melhorar DX | Cobertura caiu, bugs em produção aumentaram |
| Contratar QA dedicado | Terceirizar o problema | QA virou gargalo, demora no feedback |

### Desejos
- **Desejo Declarado:** "Quero testes que rodem rápido e sejam confiáveis."
- **Desejo Real:** "Quero dormir bem na sexta sabendo que o deploy não vai quebrar."
- **Desejo de Identidade:** "Quero ser a tech lead que construiu a cultura de qualidade sem virar pesadelo burocrático."
- **Dia Ideal em 12 meses:** CI com 95%+ de pass rate consistente; 0h/semana em manutenção de teste; time usa tempo ganho para shipar features.

### Jobs-to-Be-Done
- **Job Funcional:** "Quando commito mudança de UI, preciso que os testes continuem passando sem intervenção, para não perder tempo consertando."
- **Job Emocional:** "Quando uso o produto, quero me sentir em controle do meu pipeline."
- **Job Social:** "Quando uso o produto, quero que meu time me perceba como quem trouxe produtividade, não burocracia."
- **Situação de Trigger:** Sexta à tarde, deploy pendente, 3 testes falhando por motivos aparentemente aleatórios.

### Narrativa Interna
"É porque a gente cresceu rápido e não teve tempo de estruturar qualidade — mas é temporário, já vai passar."

---

## 4. Os 9 Tipos de Público

### Distribuição Atual
- **Maioria está em:** Tipo 2 — Seguidor (leitor recorrente do blog/X sem trial ainda)
- **Tipo mais negligenciado:** Tipo 7 — Cliente recorrente (não tem conteúdo de expansão)
- **Prioridade estratégica:** Tipos 2, 3, 4 (MOFU-BOFU, converter quem já conhece)

---

## 5. Nível de Consciência e Conteúdo

### Diagnóstico de Consciência
- **Nível predominante hoje:** Nível 2 — Consciente do problema
- **Justificativa:** Sabem que testes são um problema, mas acham que é o estado natural de quem usa Cypress. Não sabem que auto-reparo existe.
- **Distribuição ideal:**
  - Nível 1: 10% (devs júnior entrando no mercado)
  - Nível 2: 40% (maior massa — problema conhecido, solução desconhecida)
  - Nível 3: 25% (conhecem auto-reparo como conceito)
  - Nível 4: 15% (conhecem TestCo especificamente)
  - Nível 5: 10% (trial ativo ou avaliando)

---

## Síntese Executiva

| Campo | Conteúdo |
|---|---|
| P11.1 — Frase da persona | Tech lead em scale-up B2B que perde dias do time com testes flaky |
| P11.2 — Dor mais premente | 6-8h/semana de dev sênior queimadas em manutenção de teste |
| P11.3 — Desejo real | Ser lembrada como quem trouxe qualidade sem virar burocrata |
| P11.4 — Medo oculto | Ficar marcada como tech lead que não cuidou da qualidade |
| P11.5 — Gatilho de ação | Teste flaky recorrente travando release importante |
| P11.6 — Objeção principal | "E se a IA 'consertar errado' e a gente confiar em teste falso?" |
| P11.7 — Requisito de confiança | Transparência do engine + trial que funciona sem onboarding |
| P11.8 — Mensagem-chave | Pare de perder sexta à tarde consertando teste que a IA podia consertar |
| P11.9 — Canal principal | X + Blog técnico + YouTube |
| P11.10 — Transformação prometida | De "tech lead que apaga fogo de teste" para "tech lead com pipeline confiável" |

---

## Notas
- **Data:** 2026-04-16
- **Status:** Completo (smoke test)
- **Próxima ação sugerida:** Rodar /content-ideation para gerar pautas direcionadas
