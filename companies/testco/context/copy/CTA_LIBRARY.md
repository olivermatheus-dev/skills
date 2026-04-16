---
artifact: cta_library
company: testco
generated_at: 2026-04-16
source_files:
  - context/AUDIENCE_PROFILES.md
  - audiences/AUDIENCE_ana-tech-lead.md
  - context/PRODUCT_CONTEXT.md
  - context/PLATFORM_SPECS.md
version: 1
status: draft
---

# CTA Library — TestCo

> **Framework:** Eugene Schwartz — 5 níveis de consciência.
> A mesma peça NÃO pode ter o mesmo CTA para níveis diferentes. Alguém no
> Nível 1 (inconsciente) não clica em "Compre agora"; alguém no Nível 5
> (pronto para comprar) fica irritado com "Saiba mais".

## CTAs por Nível de Consciência

---

### Nível 1 — Inconsciente do problema

Persona não sabe que perde 6-8h/semana em manutenção. CTAs focam em curiosidade/autodiagnóstico.

**CTAs primários (3 variações):**
- "Descubra quanto sua suite de testes está custando por mês"
- "Rode o diagnóstico de flakiness do seu CI em 60s"
- "Veja como o CI do seu time se compara a 180 scale-ups"

**Uso:** blog TOFU, ads X/Twitter de topo, posts educativos, calculadora no site.

**Verbos que funcionam:** descubra, rode, veja, compare.
**Verbos que NÃO funcionam:** compre, agende, contrate.

---

### Nível 2 — Consciente do problema

Sabe que teste é um saco, não sabe que auto-reparo existe. CTAs focam em educação.

**CTAs primários:**
- "Baixe o guia: como scale-ups estão reduzindo flakiness em 80%"
- "Entenda por que Cypress quebra a cada refator (e o que fazer sobre isso)"
- "Receba a série sobre manutenção de teste sem dor"

**Uso:** carrosséis LinkedIn, email de nutrição, posts MOFU do pilar 1.

**Verbos que funcionam:** entenda, baixe, receba.

---

### Nível 3 — Consciente da solução

Conhece auto-reparo como conceito, avalia abordagens. CTAs focam em comparativo.

**CTAs primários:**
- "Compare TestCo, Cypress e Playwright lado a lado"
- "Baixe o playbook: migrando Cypress para auto-heal em 30 dias"
- "Veja 3 abordagens para eliminar flakiness do seu CI"

**Uso:** blog posts comparativos, landing pages de comparação, webinars.

**Verbos que funcionam:** compare, analise, avalie.

---

### Nível 4 — Consciente do produto

Conhece TestCo, ainda não ativou. CTAs focam em remover atrito.

**CTAs primários:**
- "Teste grátis por 14 dias — setup em 5 minutos, sem cartão"
- "Agende demo de 20 min com um engineer"
- "Veja o Auto-Heal Engine rodando no seu repo"

**Uso:** sales page do produto, ads LinkedIn de retargeting, email warming.

**Verbos que funcionam:** teste, agende, veja (com "o Auto-Heal Engine").

---

### Nível 5 — Pronto para comprar

Quer ativar agora. CTAs diretos.

**CTAs primários:**
- "Começar agora"
- "Ativar o plano Team"
- "Criar conta e rodar o primeiro teste"

**Uso:** checkout, emails BOFU finais, calls de fechamento.

**Verbos que funcionam:** começar, ativar, criar.

---

## CTAs por Plataforma

### LinkedIn (decisor — tech lead/CTO)
- **Norma:** link no 1º comentário, não no post
- **Formato:** CTA curto no post + "Link no comentário" como amarração
- **Exemplo Nível 4:** "Ver o Auto-Heal Engine em ação no seu repo é mais rápido do que ler o print. Link pra trial de 14 dias no primeiro comentário."

### X / Twitter (usuário técnico — dev sênior)
- **Norma:** thread termina com CTA + link
- **Formato:** último tweet com CTA direto ao estilo do público técnico
- **Exemplo Nível 3:** "Se isso ressoou e você quer o playbook completo de migração Cypress → auto-heal em 30 dias, salvei em [link]."

### YouTube (tutoriais técnicos)
- **Norma:** pinned comment + card no vídeo + descrição
- **Formato:** CTA verbal no vídeo ("link na descrição") + visual overlay
- **Exemplo Nível 4:** "Se quer rodar isso no seu repo, o CLI tá na descrição. Setup em 5 min."

### Blog (aprofundamento técnico)
- **Norma:** 1 CTA inline após parágrafo de valor + banner lateral + CTA de fechamento
- **Formato:** 3 instâncias do mesmo CTA principal
- **Exemplo Nível 2:** Inline "Quer entender por que isso acontece? Baixe o guia completo aqui." / Banner "Guia: manutenção de teste sem dor" / Final "Pegue o guia + 3 emails com benchmarks reais."

### Email (sequência de venda)
- **Norma:** 1 CTA principal, repetido 2x (meio + final do email)
- **Formato:** botão com verbo único + link texto em sequência
- **Exemplo Nível 5:** Botão "Ativar meu trial" (meio) + "Se preferir agendar com um engineer antes, responda este email" (final).

### Sales page
- **Norma:** CTA repetido a cada altura de tela (hero + stack + prova + oferta + FAQ + footer)
- **Formato:** botão grande + verbo Nível 4 ou 5 conforme contexto da seção
- **Exemplo:** Hero "Teste grátis por 14 dias" → Oferta "Começar agora" → FAQ "Falar com um engineer".

## Regras de uso aplicadas

1. **Um nível = um tipo de CTA.** Não misture "Saiba mais" (Nível 2) com "Começar agora" (Nível 5) na mesma peça.
2. **Plataforma ajusta verbo e formato, não intenção.** "Agende demo" no LinkedIn e "Book demo" em email operam no mesmo nível.
3. **Teste com A/B.** Para cada nível, as 3 variações servem para isso.
4. **CTA de Nível 5 sem preço visível é desperdício.** A sales page TestCo tem que mostrar R$ 499/mês (base) antes do checkout.

## Distribuição ideal de níveis no conteúdo (para Ana)

Do AUDIENCE_PROFILES, a distribuição ideal de conteúdo por nível para Ana é:

- Nível 1: 10% (devs júnior entrando no mercado — posts muito TOFU)
- Nível 2: 40% (maior massa — problema conhecido, solução desconhecida)
- Nível 3: 25% (conhecem auto-reparo como conceito)
- Nível 4: 15% (conhecem TestCo especificamente)
- Nível 5: 10% (trial ativo ou avaliando)

Priorizar CTAs de Nível 2 no volume geral de conteúdo; reservar Níveis 4 e 5 para páginas de conversão e emails de fundo de funil.

## Fonte de derivação

- `audiences/AUDIENCE_ana-tech-lead.md > Mapa Consciência × Conteúdo`: distribuição por nível
- `audiences/AUDIENCE_ana-tech-lead.md > Síntese Executiva > P11.9 Canal principal`: "X + Blog técnico + YouTube"
- `PRODUCT_CONTEXT.md > Detalhes comerciais > Modelo`: "Assinatura mensal; trial 14 dias"
- `context/PLATFORM_SPECS.md > LinkedIn, X, YouTube, Blog, Email, Sales page`: normas de cada canal
