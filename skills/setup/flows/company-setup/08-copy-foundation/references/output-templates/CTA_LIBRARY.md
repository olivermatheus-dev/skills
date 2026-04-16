# Output Template — CTA_LIBRARY.md

Use este template exato ao gerar o arquivo CTA_LIBRARY.md.

---

```markdown
---
artifact: cta_library
company: [slug]
generated_at: [YYYY-MM-DD]
source_files:
  - context/AUDIENCE_PROFILES.md
  - context/PRODUCT_CONTEXT.md
  - context/PLATFORM_SPECS.md
version: 1
status: draft
---

# CTA Library — [Nome da empresa]

> **Framework:** Eugene Schwartz — 5 níveis de consciência.
> A mesma peça NÃO pode ter o mesmo CTA para níveis diferentes. Alguém no
> Nível 1 (inconsciente) não clica em "Compre agora"; alguém no Nível 5
> (pronto para comprar) fica irritado com "Saiba mais".

## CTAs por Nível de Consciência

---

### Nível 1 — Inconsciente do problema

Cliente não sabe que tem o problema. CTAs focam em curiosidade e autoidentificação.

**CTAs primários (3 variações):**
- "[CTA 1 — ex: 'Descubra se você está perdendo X']"
- "[CTA 2 — ex: 'Faça o diagnóstico gratuito']"
- "[CTA 3 — ex: 'Veja como sua empresa se compara']"

**Uso:** blog TOFU, ads de topo, posts educativos, quiz/calculadora.

**Verbos que funcionam:** descubra, identifique, diagnostique, compare.
**Verbos que NÃO funcionam:** compre, agende, contrate, ative.

---

### Nível 2 — Consciente do problema

Sabe que tem problema, não sabe que solução existe. CTAs focam em educação.

**CTAs primários:**
- "[CTA 1 — ex: 'Saiba como outras empresas resolveram']"
- "[CTA 2 — ex: 'Baixe o guia [tópico]']"
- "[CTA 3 — ex: 'Receba o checklist de diagnóstico']"

**Uso:** carrosséis, emails de nutrição, posts MOFU.

**Verbos que funcionam:** entenda, aprenda, baixe, receba.

---

### Nível 3 — Consciente da solução

Sabe que solução existe, avalia opções. CTAs focam em comparativo.

**CTAs primários:**
- "[CTA 1 — ex: 'Compare [produto] com [concorrente]']"
- "[CTA 2 — ex: 'Baixe o playbook de migração']"
- "[CTA 3 — ex: 'Veja 3 abordagens para [problema]']"

**Uso:** blog posts comparativos, landing pages de comparação, webinars.

**Verbos que funcionam:** compare, analise, avalie.

---

### Nível 4 — Consciente do produto

Conhece a marca, ainda não comprou. CTAs focam em remover atrito.

**CTAs primários:**
- "[CTA 1 — ex: 'Teste grátis por 14 dias']"
- "[CTA 2 — ex: 'Agende demonstração de 20 min']"
- "[CTA 3 — ex: 'Fale com um especialista']"

**Uso:** sales page de produto, ads de retargeting, email warming.

**Verbos que funcionam:** teste, experimente, agende, fale.

---

### Nível 5 — Pronto para comprar

Quer comprar agora. CTAs diretos, sem firulas.

**CTAs primários:**
- "[CTA 1 — ex: 'Comece agora']"
- "[CTA 2 — ex: 'Contrate o plano [X]']"
- "[CTA 3 — ex: 'Ativar minha conta']"

**Uso:** checkout, emails BOFU finais, calls de fechamento.

**Verbos que funcionam:** comece, ative, contrate, assine, compre.

---

## CTAs por Plataforma

Cada plataforma tem norma de apresentação própria. Os verbos vêm dos níveis acima, mas o formato muda.

### LinkedIn (decisor)
- **Norma:** link no 1º comentário, não no post (algoritmo penaliza links no corpo)
- **Formato:** CTA curto no texto + "Link no comentário" como amarração
- **Exemplo:** "[CTA adaptado — ex: 'Agende uma demo sem compromisso. Link no 1º comentário.']"

### X / Twitter (usuário técnico)
- **Norma:** thread termina com CTA + link
- **Formato:** último tweet tem CTA direto + link
- **Exemplo:** "[CTA adaptado — ex: 'Se isso ressoou, leia a doc técnica completa: [link]']"

### YouTube
- **Norma:** pinned comment + card no vídeo + descrição com link destacado
- **Formato:** CTA verbal no vídeo ("link na descrição") + visual overlay
- **Exemplo:** "[CTA adaptado]"

### Blog
- **Norma:** 1 CTA inline no corpo (após parágrafo de valor) + banner lateral + CTA de fechamento
- **Formato:** 3 instâncias do mesmo CTA principal
- **Exemplo:** "[CTA adaptado]"

### Email
- **Norma:** 1 CTA principal, repetido 2x (meio + final)
- **Formato:** botão com verbo único + link texto em sequência
- **Exemplo:** "[CTA adaptado]"

### Sales page
- **Norma:** CTA repetido a cada "altura de tela" (hero + stack + prova + oferta + FAQ + footer)
- **Formato:** botão grande + verbo único
- **Exemplo:** "[CTA adaptado]"

## Regras de uso

1. **Um nível = um tipo de CTA.** Não misture "Saiba mais" (Nível 2) com "Compre agora" (Nível 5) na mesma peça.
2. **Plataforma ajusta verbo e formato, não intenção.** "Agende demo" no LinkedIn e "Book demo" em email operam no mesmo nível.
3. **Teste com A/B.** Para cada nível, as 3 variações servem exatamente para isso.
4. **CTA de Nível 5 sem preço visível é desperdício.** Quem está pronto para comprar quer ver preço sem clicar mais.

## Fonte de derivação

- `AUDIENCE_PROFILES.md > Mapa de Consciência × Conteúdo`: [tabela]
- `AUDIENCE_PROFILES.md > Persona > Distribuição ideal de conteúdo por nível`: [%]
- `PRODUCT_CONTEXT.md > Detalhes comerciais > Modelo`: "[ex: 'trial 14 dias']"
- `PLATFORM_SPECS.md > Boas práticas por plataforma`: [regras]
```
