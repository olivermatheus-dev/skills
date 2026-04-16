# Perfis de Público — TestCo

> Gerado pela Skill S (Setup, Bloco 3 + Finalização).
> **Última atualização:** 2026-04-16
> **Fonte:** consolidado a partir de audiences/AUDIENCE_ana-tech-lead.md

## Persona 1: Ana, a tech lead estica-tempo

- **Quem é:** Tech lead ou engineering manager em scale-up B2B brasileira, responsável por platform/qualidade entre várias outras frentes
- **Cargo/Papel:** Tech Lead / Engineering Manager (reporta ao CTO)
- **Tamanho da empresa:** Scale-up SaaS B2B com 10-50 engenheiros (Series A-B)
- **Dor principal:** Perde 6-8h/semana do time com manutenção de testes E2E que quebram a cada refator; já ouviu 3 devs sêniores dizerem que "testes são um peso morto"
- **O que já tentou:** Cypress puro (quebra a cada refator), testing trophy com pouco E2E (cobertura caiu, bugs subiram), contratar QA dedicado (virou gargalo)
- **Nível de consciência:** Nível 2 (Consciente do problema) — sabe que tem problema, mas acha que é o estado natural de quem usa Cypress
- **Objeções principais:**
  1. "E se a IA consertar errado e eu não perceber?" → Resposta: Todo conserto vira PR revisável com diff explicado em linguagem natural + benchmark público de 90% de acerto
  2. "Migrar Cypress vai travar o time por semanas" → Resposta: Case da Fintech X completou migração em 30 dias rodando Cypress em paralelo; CLI de 5 min evita onboarding forçado
  3. "Já paguei Mabl — é a mesma coisa?" → Resposta: Mabl é no-code enterprise pra QA; TestCo é CLI-first pra dev com 1/5 do preço
- **Onde consome conteúdo:** X (diário), LinkedIn (semanal), YouTube (fins de semana), Hacker News (diário), newsletters técnicas, podcasts (SE Daily, Ship It!)
- **Fala como:** "flaky test", "CI pipeline", "blast radius", "auto-healing", "developer experience", "isso deveria ser boring"
- **Gatilhos emocionais:** Orgulho da qualidade do time (desejo de identidade), medo de ser lembrada como a tech lead que não cuidou de QA (medo oculto), ansiedade antes de deploys importantes

---

## Mapa de Consciência × Conteúdo

| Nível | O que pensa | Conteúdo ideal |
|---|---|---|
| Inconsciente | "Teste flaky é normal, faz parte" | TOFU — dados chocantes ("quanto custa a flakiness") |
| Consciente do sintoma | "Os testes tão um saco" | TOFU/MOFU — diagnósticos, checklists de CI saudável |
| Consciente do problema | "Preciso reduzir manutenção de teste" | MOFU — frameworks, comparativo Cypress vs. alternativas |
| Consciente da solução | "Auto-reparo pode funcionar" | MOFU/BOFU — cases, benchmarks, like-for-like |
| Consciente do produto | "Conheço TestCo mas não comprei" | BOFU — objeções respondidas, trial, demo ao vivo |
