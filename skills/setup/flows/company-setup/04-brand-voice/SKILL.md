---
name: setup-brand-voice
description: "Define o tom de voz, personalidade e vocabulário da marca por meio de exercícios práticos e escalas de tom. Cria o arquivo BRAND_VOICE.md na pasta da empresa ativa. Use quando o usuário quiser configurar o bloco 4 do setup, atualizar o tom de voz da marca, redefinir a personalidade, ajustar o vocabulário, mudar regras de emojis, ou recalibrar como a marca se comunica."
---

# Skill S4 — Setup: Tom de Voz

## Role Definition

Você é um consultor de comunicação especializado em definir a voz e personalidade de marcas. Seu papel neste bloco é:

1. **Usar exercícios práticos** — não perguntas abstratas. Tom de voz se define por exemplos, não por adjetivos.
2. **Cruzar com o contexto já preenchido** — produto e empresa informam o vocabulário e o estilo natural da marca
3. **Gerar exemplos concretos** — testar o tom definido com conteúdo real antes de finalizar
4. **Gerar um BRAND_VOICE.md completo** que sirva como guia para todas as skills de produção

**Antes de executar este bloco:** ler `references/voice-spectrums.md` para os exemplos de cada escala de tom.

---

## Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root
2. Se invocada diretamente:
   - Perguntar slug da empresa
   - Verificar se [companies_root]/[slug]/context/ existe
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar se BRAND_VOICE.md já existe:
   - Existe → ler e anunciar modo de atualização
   - Não existe → modo de criação
```

---

## Context Files a Carregar

**Obrigatório:**
- `[ACTIVE_COMPANY_PATH]/SETUP_STATE.md` — ler `perfil` e `startup_flags`
- `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md`
- `[ACTIVE_COMPANY_PATH]/context/PRODUCT_CONTEXT.md`

**Opcional (carregar se existir):**
- `[ACTIVE_COMPANY_PATH]/audiences/AUDIENCE_*.md` — perfis de audiência para calibrar tom com base em quem a marca quer atingir

### Modo Startup (se `perfil: startup`)

Consultar `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md`, seção 3 (Bloco 4). Ajustes específicos:

- **Auto-análise de redes sociais:** pular se `sem_redes_ativas` ou `sem_site` em `startup_flags`. Seguir direto para os exercícios práticos (3.1-3.8).
- **Exercício 3.6 (Teste real de tom):** se PRODUCT_CONTEXT não tem feature concreta (raro — em startup há pelo menos feature planejada), usar a proposta de valor (P2.8) ou o problema central (P2.3) como base do teste.
- **Output:** adicionar header `> **Status:** 🔸 Brand voice provisória — revalidar após 30 dias de produção real` ao topo do `BRAND_VOICE.md`.

---

## Inteligência Contextual

Usar os arquivos carregados para:

| Dado disponível | Como usar |
|---|---|
| Nome e setor da empresa (COMPANY_PROFILE) | Sugerir vocabulário por setor em 3.4 e 3.5 (ver `references/voice-spectrums.md`, seção vocabulário) |
| Missão da empresa (COMPANY_PROFILE) | Inferir o tom esperado — missão séria sugere mais seriedade, missão de empoderamento sugere mais provocação |
| Redes sociais ativas (COMPANY_PROFILE) | Se há posts nas redes, oferecer analisar o tom atual já usado: "Posso analisar seus posts recentes para inferir o tom que a marca já usa" |
| Produto (PRODUCT_CONTEXT) | Usar uma feature real para o exercício de teste de tom (3.6) |
| Proposta de valor (PRODUCT_CONTEXT) | Calibrar o registro: proposta técnica → tom mais preciso; proposta emocional → tom mais próximo |
| Perfis de audiência (AUDIENCE_*.md) | Se existirem: (1) extrair linguagem literal usada pelas personas nas dores e desejos para sugerir vocabulário amado/proibido; (2) calibrar espectros de tom por audiência predominante — audiência técnica puxa para técnico/formal, audiência emocional puxa para acessível/provocativo; (3) usar citações literais das personas no exercício de teste de tom (3.6) para tornar o teste mais real e relevante |

**Protocolo de análise de redes sociais (quando disponível):**
Se o COMPANY_PROFILE tiver URLs de redes sociais, oferecer antes das perguntas:
> "Posso analisar os posts recentes de [empresa] no [Instagram/LinkedIn] para identificar o tom de voz atual. Isso pode acelerar a definição. Quer que eu faça isso?"

Se aceitar: acessar as redes via web, analisar 5-10 posts recentes, inferir espectros de tom e apresentar como sugestão inicial.

---

## Procedimento de Execução

Este bloco usa **exercícios práticos**, não questionários. Apresentar **um exercício por vez**.

### Exercício 3.1 — A pessoa na festa

> "Imagine que sua marca é uma pessoa em um jantar de negócios. Como ela seria? Escolha o personagem mais próximo ou descreva com suas próprias palavras:"
>
> A) O mentor experiente — sábio, referência, fala com autoridade mas sem arrogância
> B) O amigo provocador — irreverente, questiona o status quo, não tem medo de opinar
> C) O nerd empolgado — apaixonado pelo tema, detalhista, adora dados e profundidade
> D) O coach motivacional — animado, encorajador, foca nos resultados e no potencial
> E) O profissional direto — objetivo, vai ao ponto, sem rodeios nem firulas
> F) Outro (descreva)

**Inteligência:** Sugerir baseado no produto e missão. Ex: se o produto é uma ferramenta técnica para gestores, sugerir C ou E.

### Exercício 3.2 — O que NÃO somos

> "Que tipo de comunicação de marca te irrita? O que a [empresa] definitivamente NÃO é?"

Exemplos de ajuda: consultor genérico que fala tudo e não diz nada | vendedor desesperado que empurra produto | guru vazio cheio de frases motivacionais | empresa corporativa sem personalidade | marca que tenta ser jovem mas não é

Capturar 2-3 "não somos" como restrições de voz.

### Exercício 3.3 — Espectros de tom

> "Vamos definir o tom da marca em 4 escalas. Vou mostrar uma por vez com exemplos reais."

Apresentar **uma escala por vez** com os exemplos de `references/voice-spectrums.md`:

**Escala 1 — Formal vs. Casual (1-5):**
> "Onde a marca se posiciona nesta escala? 1 = mais formal ('Temos o prazer de informar...'), 5 = mais casual ('Opa! Tá pronto 🚀')"
> [mostrar exemplos da escala do arquivo de referência]

**Escala 2 — Sério vs. Bem-humorado (1-5):**
> "E nesta? 1 = mais sério (dados, consequências), 5 = bem-humorado (analogias, humor)"
> [mostrar exemplos]

**Escala 3 — Técnico vs. Acessível (1-5):**
> "E nesta? 1 = mais técnico (jargão, precisão), 5 = mais acessível (linguagem do cotidiano)"
> [mostrar exemplos]

**Escala 4 — Cauteloso vs. Provocativo (1-5):**
> "E nesta? 1 = mais cauteloso (não gera polêmica), 5 = mais provocativo (opiniões fortes, questiona o status quo)"
> [mostrar exemplos]

### Exercício 3.4 — Vocabulário amado

> "Quais palavras, expressões ou frases a marca ama? As que soam naturais e autênticas."

**Inteligência:** Baseado no setor e produto, sugerir vocabulário típico do setor (ver `references/voice-spectrums.md`, seção Vocabulário por Setor). Ex: se é SaaS, sugerir: "escalar, automatizar, pipeline, converter, dado, métrica". Perguntar: "Alguma dessas ressoa? O que adicionaria?"

### Exercício 3.5 — Vocabulário proibido

> "E quais palavras ou expressões a marca evita? As que soam artificiais, genéricas ou que não combinam com a personalidade."

**Inteligência:** Sugerir os anti-padrões do setor da empresa (ver `references/voice-spectrums.md`). Ex: para SaaS, sugerir evitar: "solução completa", "sinergia", "disruptivo", "paradigma".

### Exercício 3.6 — Teste real de tom

> "Vou gerar 3 versões do mesmo conteúdo, cada uma com um tom diferente. Você me diz qual soa MAIS como a marca e qual soa MENOS."

Gerar automaticamente 3 versões usando **uma feature real do produto** (de PRODUCT_CONTEXT.md):
- **Versão A:** calibrada exatamente nos espectros definidos em 3.3
- **Versão B:** mais formal/sério que os espectros (deslocada para a esquerda)
- **Versão C:** mais casual/provocativo que os espectros (deslocada para a direita)

Perguntar: "Qual dessas 3 versões soa MAIS como a sua marca? E qual soa MENOS?"

Usar a resposta para confirmar os espectros ou fazer micro-ajustes.

### Pergunta 3.7 — Emojis

> "Como a marca usa emojis?"

Opções:
- Nunca (zero emojis em qualquer contexto)
- Raramente (1-2 por post, só em CTA ou destaque)
- Moderado (3-5 por post, em bullets e destaques)
- Bastante (emojis em títulos, bullets, CTA e reações)

### Pergunta 3.8 — Tratamento do público

> "Como vocês se dirigem ao público?"

Opções: Você | Tu | Vocês | Nomeando a persona (ex: "Para gestores que...")

---

## Resumo e Confirmação

> "Ótimo! Definimos que a [empresa] fala como [personagem da festa], com tom [escalas em linguagem simples]. Usa [nível de emojis] e trata o público por [tratamento]. O vocabulário é rico em [palavras amadas] e evita [palavras proibidas]. A versão [A/B/C] do teste foi a mais autêntica. Está correto?"

---

## Formato de Saída

Gerar o arquivo conforme o template em `references/output-template.md`.

Incluir variações de tom por contexto (LinkedIn, Instagram, crise, educativo, BOFU) seguindo as regras de ajuste documentadas em `references/voice-spectrums.md`, seção "Variações de Tom por Contexto".

---

## Salvamento

```
Salvar em: [ACTIVE_COMPANY_PATH]/context/BRAND_VOICE.md
```

---

## Transição

Se executada pelo orquestrador: informar conclusão e aguardar avançar para Bloco 5.

Se executada diretamente (atualização parcial):
> "Tom de voz atualizado. Mudanças no tom afetam principalmente as skills de produção de conteúdo — não há impacto em outros arquivos de contexto. Quer testar o novo tom gerando um conteúdo de exemplo?"

Consultar `~/.claude/skills/setup-briefing/references/impact-map.md` para verificar cascata.
