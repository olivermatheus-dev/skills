---
name: hooks-factory
description: "Gera hooks virais e headlines para conteúdo do DealFlux, organizados por gatilho psicológico e ranqueados por potencial. Use quando o usuário tiver um tema pesquisado e precisar de ganchos, ou quando pedir hooks, ganchos, headlines, chamadas, títulos, primeiras linhas, ou abertura para qualquer conteúdo de redes sociais. Também use quando mencionar 'o que escrever primeiro', 'como abrir o post', 'preciso de um gancho', 'primeira frase', 'scroll-stopper'. Esta skill complementa a Ideation e antecede o Writer no pipeline."
---

# Skill 3 — Hooks & Headlines Factory

## Propósito

Gerar hooks que param o scroll e criam curiosidade irresistível, organizados por gatilho psicológico, ranqueados por potencial, e calibrados para o tom de voz da marca.

## Context Files Obrigatórios

Carregar ANTES de gerar hooks:
- `BRAND_VOICE.md` — tom e limites de linguagem
- `AUDIENCE_PROFILES.md` — nível de consciência e linguagem da persona
- `HOOK_LIBRARY.md` — padrões que já performaram (se existir; se vazio, pular)

**NÃO carregar:** PRODUCT_CONTEXT, COMPETITOR_MAP, CONTENT_PILLARS, PLATFORM_SPECS, VISUAL_IDENTITY

## Input Esperado

A skill precisa receber:
- O tema do conteúdo (output da Skill 1 ou input direto)
- A pesquisa realizada (output da Skill 2, se disponível)
- A persona-alvo
- A plataforma primária (afeta o comprimento e tom do hook)

## Etapa Obrigatória: Pesquisa de Hooks Virais

Antes de gerar, pesquisar na web por hooks virais recentes no nicho. Isso calibra a geração para padrões que estão funcionando AGORA, não apenas templates teóricos.

Buscar:
- Posts virais sobre vendas, CRM, gestão comercial no Brasil (LinkedIn e Instagram)
- Reels e carrosséis com alto engajamento no nicho
- Identificar padrões nas primeiras linhas
- Extrair TEMPLATES dos hooks encontrados (a estrutura, não o texto literal)

## Taxonomia de Hooks — Gerar no Mínimo 2 de Cada Categoria

| Categoria | Gatilho | Template base | Exemplo |
|---|---|---|---|
| **Dor (PAS)** | Identificação com frustração | Dor → amplifica → sugere solução | "Você perde leads toda semana e nem sabe disso." |
| **Contrarian** | Curiosidade por contradição | Afirmação ousada → desafia senso comum | "CRM não salva empresa nenhuma. O que salva é processo." |
| **Número/Lista** | Promessa de estrutura | Número específico → preview do valor | "3 perguntas que seu vendedor deveria fazer — mas não faz." |
| **Autoridade** | Credibilidade | Credencial → resultado → takeaway | "Analisei 200+ times comerciais. O padrão dos que vendem mais é simples." |
| **FOMO** | Medo de ficar para trás | Concorrentes já fazem X → pressão | "Enquanto você improvisa, seu concorrente testa 3 scripts por semana." |
| **Story** | Curiosidade narrativa | Situação → twist → promessa | "Um cliente demitiu o melhor vendedor. O motivo me surpreendeu." |
| **How-to** | Resultado com passos | Resultado desejado → simplicidade | "Como montar um funil em 15 minutos — mesmo sem CRM." |
| **Pergunta provocativa** | Reflexão forçada | Pergunta impossível de ignorar | "Quantos leads você perdeu este mês por esquecimento?" |

Para referência expandida sobre templates e gatilhos psicológicos, consultar `references/hook-templates.md` e `references/psychology-triggers.md` quando disponíveis.

## Regras de Qualidade

- **Vídeo curto:** Máximo 15 palavras (primeiros 3 segundos)
- **Texto (LinkedIn, Instagram caption):** Máximo 2 linhas
- O hook deve funcionar SOZINHO — sem contexto prévio, deve criar curiosidade
- Evitar clickbait vazio — o hook deve prometer algo que o conteúdo entrega
- Evitar jargões que persona de maturidade zero não entende
- Teste mental: "Se eu visse isso no feed, pararia de scrollar?"

## Sistema de Ranqueamento

Cada hook recebe nota de 1-5 em três critérios:

| Critério | O que avalia |
|---|---|
| **Scroll-stop** (1-5) | Ele para o scroll? Tem pattern interrupt? |
| **Relevância** (1-5) | Ressoa com a dor/desejo da persona-alvo? |
| **Entregabilidade** (1-5) | O conteúdo consegue entregar o que o hook promete? |

Score total: soma dos 3 critérios (/15).

## Formato de Output

```markdown
# Hooks para: [Título do tema]
**Persona:** [qual] | **Plataforma primária:** [qual] | **Funil:** [TOFU/MOFU/BOFU]

## 🏆 Top 3 Recomendados
1. **"[Hook]"** — Categoria: [tipo] — Score: [X/15]
   - Por que funciona: [1 frase]
   - Sugestão visual: [para vídeo/imagem se aplicável]

2. **"[Hook]"** — Categoria: [tipo] — Score: [X/15]
   - Por que funciona: [1 frase]

3. **"[Hook]"** — Categoria: [tipo] — Score: [X/15]
   - Por que funciona: [1 frase]

## Todos os hooks gerados

### Dor (PAS)
1. "[Hook]" — Score: [X/15]
2. "[Hook]" — Score: [X/15]

### Contrarian
1. "[Hook]" — Score: [X/15]
2. "[Hook]" — Score: [X/15]

[... demais categorias ...]

## Hooks de referência encontrados na pesquisa
- "[Hook viral encontrado]" — Fonte: [tipo de post] — Template extraído: "[estrutura]"
```

## Após a Escolha do Usuário

Quando o usuário selecionar hook(s), confirmar: "Quer que eu escreva o conteúdo completo usando esse hook? (→ Skill 4 - Writer)"
