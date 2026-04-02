---
name: content-writer
description: "Redige conteúdo-pilar completo a partir de pesquisa e hooks selecionados. Use quando o usuário tiver tema pesquisado e hooks aprovados e quiser produzir o conteúdo final, ou quando pedir para escrever artigos, posts longos, scripts de vídeo, ou qualquer peça de conteúdo completa. Também use quando mencionar 'escrever o post', 'redigir', 'agora escreve', 'cria o conteúdo', 'monta o texto', 'faz o copy', 'script para vídeo'. Se o tema já foi pesquisado e o hook escolhido, esta skill produz a peça final."
---

# Skill 4 — Content Writer

## Propósito

Redigir o conteúdo-pilar completo com qualidade profissional, aplicando frameworks de copy por estágio de funil, mantendo tom de voz consistente, e inserindo marcações que facilitam derivação posterior em outros formatos.

## Context Files Obrigatórios

Carregar ANTES de escrever:
- `BRAND_VOICE.md` — tom, vocabulário, estilo
- `PRODUCT_CONTEXT.md` — precisão técnica sobre features mencionadas
- `AUDIENCE_PROFILES.md` — adaptar linguagem ao nível de consciência

**NÃO carregar:** COMPETITOR_MAP, CONTENT_PILLARS, PLATFORM_SPECS, HOOK_LIBRARY, VISUAL_IDENTITY

## Input Esperado

- Pesquisa da Skill 2 (dados, cases, citações)
- Hook selecionado da Skill 3
- Formato-pilar desejado (post longo, artigo, script de vídeo, carrossel-base)
- Estágio de funil confirmado

## Seleção de Framework de Copy

| Estágio | Framework | Estrutura | Quando usar |
|---|---|---|---|
| TOFU | **AIDA** | Atenção → Interesse → Desejo → Ação | Consciência do problema, educativo |
| MOFU | **PAS** | Problema → Agitação → Solução | Quem já reconhece o problema |
| MOFU | **BAB** | Before → After → Bridge | Transformação, cenário antes/depois |
| BOFU | **4Ps** | Promise → Picture → Proof → Push | Conversão com prova social e CTA direto |
| BOFU | **PASTOR** | Problema → Amplificação → Story → Transformação → Oferta → Resposta | Conteúdo longo de venda |

Para detalhamento completo dos frameworks com exemplos, consultar `references/copy-frameworks.md` quando disponível.

## Marcações de Atomização

O conteúdo-pilar deve incluir marcações que facilitam derivação posterior pela Skill 5B. Usar comentários HTML:

```html
<!-- HOOK_PRINCIPAL: "texto do hook" -->
<!-- DADO_DESTAQUE: "estatística ou dado impactante" -->
<!-- CITAÇÃO_AUTORIDADE: "citação de especialista" -->
<!-- INSIGHT_CHAVE: "insight que pode virar post solo" -->
<!-- LISTA_DERIVÁVEL: "lista que pode virar carrossel" -->
<!-- HISTÓRIA: "narrativa que pode virar reels/story" -->
<!-- CTA: "call to action" -->
```

A ideia é que cada marcação sinaliza um trecho reutilizável. Quando a Skill 5B analisar o conteúdo, ela sabe exatamente o que pode extrair. Consultar `references/atomization-guide.md` quando disponível.

## Regras de Redação

- **Primeira frase = hook aprovado** (sem alterar, a menos que o formato exija)
- **Parágrafos curtos:** Máximo 3 linhas para formato social
- **Uma ideia por parágrafo**
- **Dados em destaque:** Negrito ou isolados em linha própria
- **Storytelling primeiro:** Abrir com história ou cenário antes da teoria, sempre que possível
- **CTA claro e alinhado ao estágio:**
  - TOFU: seguir, salvar, compartilhar ("Salva pra aplicar amanhã")
  - MOFU: comentar, engajar, recurso ("Comenta 'funil' que te mando o template")
  - BOFU: link, demo, contato ("Quer ver como funciona? Link na bio")

## Checklist Pré-Entrega

Verificar ANTES de entregar ao usuário:

- [ ] Hook abre o conteúdo de forma impactante?
- [ ] Dados têm fonte citada?
- [ ] Framework de copy seguido corretamente?
- [ ] Tom de voz alinhado com BRAND_VOICE?
- [ ] Pelo menos 1 elemento de storytelling?
- [ ] CTA claro e alinhado ao funil?
- [ ] Marcações de atomização inseridas?
- [ ] Conteúdo entrega o que o hook prometeu?

## Após a Entrega

Perguntar: "Aprovado? Posso adaptar para plataformas específicas (→ Skill 5A) ou identificar formatos derivados como tierlists, checklists, infográficos (→ Skill 5B)."
