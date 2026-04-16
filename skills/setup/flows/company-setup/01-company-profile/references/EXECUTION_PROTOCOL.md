# Protocolo de Execução — Setup Company Profile

> Referência obrigatória. Cada etapa executa as 6 fases abaixo, na ordem, sem exceção.
> Este arquivo é lido a cada etapa e descartado ao final.

---

## Fases

```
FASE 1 → Carregar Contexto
FASE 2 → Definir Modo de Entrada
FASE 3 → Coletar e Classificar
FASE 4 → Análise de Qualidade
FASE 5 → Resumo e Decisão
FASE 6 → Salvar
```

---

## FASE 1 — Carregar Contexto

**Se é a primeira etapa:** Pular. Ir para Fase 2.

**Se não é a primeira etapa:**

```
1. Ler COMPANY_PROFILE.md da empresa ativa
2. Para cada campo preenchido (não é [pendente]), registrar:
   - Valor
   - Classificação (ler o comentário HTML <!-- status: xxx -->)
3. Consultar a TABELA DE CONTEXTO definida na etapa atual
4. Se há campos com status hipotese-vaga que esta etapa usa:
   → Marcar para refinamento no início da Fase 3
```

**Regra de uso por classificação:**

| Status do dado | Como usar nesta etapa |
|----------------|----------------------|
| `validado` | Usar como fato. Referenciar diretamente: "Você atua em [setor]..." |
| `hipotese-precisa` | Usar como sugestão. Confirmar: "Você mencionou [X] — confirma?" |
| `hipotese-vaga` | Não usar como base. Tentar refinar antes de usar. |

---

## FASE 2 — Definir Modo de Entrada

### Etapas tipo Pergunta ou Híbrido:

```
"Nesta etapa vou fazer [N] perguntas sobre [tema].
Prefere:
(A) Responder uma por uma
(B) Enviar um documento ou texto — eu extraio e a gente valida"
```

**Se (A):** Ir para Fase 3.

**Se (B) — Protocolo de Extração:**

```
1. Receber e ler o documento
2. Para cada pergunta da etapa, buscar resposta no documento:
   - Encontrou → extrair valor
   - Não encontrou → marcar ❌
3. Apresentar resumo:
   "Extraí do documento:
    ✅ [Campo]: [valor] — claro e específico
    ⚠️ [Campo]: [valor] — encontrei mas está genérico
    ❌ [Campo]: não encontrado no documento
    Correto até aqui? Posso validar um por um?"
4. Após confirmação → Fase 3 em modo validação
   (respostas pré-preenchidas, usuário confirma/ajusta cada uma)
```

### Etapas tipo Pesquisa:

```
"Nesta etapa vou fazer [N] pesquisas sobre [tema],
usando as informações já coletadas.
Vou apresentar os resultados para validação. Começar?"
```

### Etapas tipo Análise:

```
"Vou cruzar os dados das etapas anteriores para gerar [tipo].
Apresento as conclusões para validação. Começar?"
```

---

## FASE 3 — Coletar e Classificar

### Refinamento de hipóteses vagas (se aplicável)

Se a Fase 1 marcou campos `hipotese-vaga` para refinamento:

```
"Antes de começar, quero refinar [N] ponto(s) que ficaram vagos:

🔸 [Campo]: [valor atual]
Consegue dar mais detalhe, ou mantenho como está?"

Se refinar → atualizar classificação no COMPANY_PROFILE.md
Se não → manter e seguir
```

### Tipo PERGUNTA — Loop por pergunta

```
PASSO 1 — APRESENTAR
  - "Pergunta [X] de [Y]"
  - Texto da pergunta (definido na etapa)
  - Por que importa (máx 2 frases)
  - Sugestão contextualizada (se há dados anteriores — definido na etapa)
  - Exemplos de resposta (mínimo 2 — definidos na etapa)

PASSO 2 — RECEBER RESPOSTA

PASSO 3 — PROCESSAR (checar na ordem)
  a) Resposta vaga?
     → SIM: Reformular com exemplo concreto (texto definido na etapa)
            Máximo 2 tentativas. Após 2x → aceitar como está.
     → NÃO: Seguir.
  b) Contradiz dado anterior?
     → SIM: "Na Etapa [N] você disse [X], agora mencionou [Y]. Qual vale?"
            Resolver. Atualizar dado anterior se necessário.
     → NÃO: Seguir.
  c) Cobre múltiplas perguntas?
     → SIM: Extrair todas as informações. Confirmar cada uma.
            Pular perguntas cobertas.
     → NÃO: Seguir.

PASSO 4 — CLASSIFICAR
  "Registrei: [resposta processada]
   Classificação sugerida: [✅/🔶/🔸] — [justificativa em 1 frase]

   Como classifica?
   (✅) Validado — tenho certeza
   (🔶) Hipótese precisa — acredito que sim, pode mudar
   (🔸) Hipótese vaga — não tenho certeza"

  REGRA: A IA sugere. O usuário decide. Nunca classificar sozinha.
```

### Tipo PESQUISA — Loop por query

```
PASSO 1 — MONTAR QUERY
  - Substituir [variáveis] no template com dados do COMPANY_PROFILE.md
  - Se variável é hipotese-vaga → alertar:
    "Esta pesquisa usa [campo] que está incerto. Resultados podem não ser precisos."

PASSO 2 — EXECUTAR
  - Buscar na web com a query montada
  - Sem resultados úteis → reformular (máx 2 tentativas)

PASSO 3 — EXTRAIR (para cada resultado relevante)
  - Query executada
  - Título da fonte
  - URL
  - Resumo (máx 3 frases, palavras próprias)
  - Insights relevantes para o fluxo
  - Relevância: Alta / Média / Baixa

PASSO 4 — CLASSIFICAR
  "Encontrei: [resumo]
   Fonte: [url]
   Classificação sugerida: [✅/🔶/🔸]

   (✅) Validado — confirmado por 2+ fontes confiáveis
   (🔶) Hipótese precisa — 1 fonte confiável, sem contradição
   (🔸) Hipótese vaga — fonte fraca ou contraditória"

PASSO 5 — CRITÉRIO DE PARADA
  Atingiu mínimo definido pela etapa? → Próxima query ou Fase 4
  Não atingiu? → Query alternativa
```

### Tipo ANÁLISE — Loop por verificação

```
PASSO 1 — CRUZAR
  - Ler campos indicados na verificação
  - Aplicar lógica de cruzamento definida na etapa

PASSO 2 — GERAR INSIGHT
  - Conclusão em 1-2 frases
  - Indicar quais dados sustentam

PASSO 3 — CLASSIFICAR
  "Conclusão: [insight]
   Baseado em: [campo A] (status) + [campo B] (status)
   Classificação sugerida: [✅/🔶/🔸]

   (✅) Conclusão sólida — dados confiáveis, lógica direta
   (🔶) Conclusão provável — alguma incerteza nos dados
   (🔸) Hipótese — dados fracos ou lógica especulativa"
```

---

## FASE 4 — Análise de Qualidade

Executar internamente (não mostrar processo ao usuário):

```
1. Contar classificações: quantas ✅, 🔶, 🔸
2. Coerência interna: respostas desta etapa entre si
3. Coerência com etapas anteriores: contradições?
4. Gaps: campos sem resposta, "a definir", ou "Não definido"
5. Campos críticos (definidos na etapa):
   - Crítico como 🔸 → confiança = Baixo (automático)
   - Crítico sem resposta → confiança = Baixo (automático)
6. Nível de confiança:
   - Alto: 70%+ ✅, zero incoerências, zero gaps em campos críticos
   - Médio: 50-70% ✅, ou 1 gap/incoerência menor
   - Baixo: <50% ✅, ou incoerência grave, ou campo crítico como 🔸
```

---

## FASE 5 — Resumo e Decisão

Apresentar:

```
## Resumo — Etapa [N]: [Nome]

[Uma linha por campo:]
[✅/🔶/🔸] **[Campo]:** [Resposta]

---
Confiança: [Alto/Médio/Baixo]
Validadas: [X] de [total] | Precisas: [X] | Vagas: [X]

[Se gaps:] ⚠️ Gaps: [lista]
[Se incoerências:] ⚠️ Incoerências: [lista]

---
Próximo: [1 frase sobre o que a próxima etapa faz com esses dados]

(A) Prosseguir para Etapa [N+1]
(B) Refinar — ajustar campo(s) específico(s)
(C) Refazer — repassar todas as perguntas
```

**Se (A):** Fase 6.
**Se (B):** Voltar para Fase 3 apenas para campos indicados → voltar para Fase 5.
**Se (C):** Voltar para Fase 3 completa. Respostas anteriores como sugestão: "Antes você disse [X]. Mantém?"

---

## FASE 6 — Salvar

```
1. Atualizar a seção da etapa no COMPANY_PROFILE.md:
   - Substituir [pendente] pelos dados coletados
   - Registrar classificação como comentário HTML em cada campo:
     <!-- status: validado -->
     <!-- status: hipotese-precisa -->
     <!-- status: hipotese-vaga -->
   - Preencher insights da etapa (fórmulas definidas na etapa)

2. Se refinamentos alteraram dados de etapas anteriores:
   → Atualizar a seção anterior + sua classificação

3. Atualizar cabeçalho:
   <!-- Última atualização: [data] -->
   <!-- Status: em andamento | Etapa atual: [N+1] de [total] -->

4. Confirmar ao usuário:
   "Etapa [N] salva. [1 frase do que foi mapeado].
    Vamos para a Etapa [N+1] — [nome]?"
```

---

## Regras Permanentes

1. **Uma pergunta por mensagem.** Nunca duas.
2. **Nunca inventar dados.** Sem informação = `[pendente]`, nunca fato.
3. **Sugestões ≠ respostas.** Apresentar como opção, nunca como fato.
4. **Contradição = parar.** Apontar imediatamente, nunca ignorar.
5. **Resposta vaga: máx 2 tentativas.** Depois aceitar e classificar como 🔸.
6. **Progresso visível.** Sempre indicar "Pergunta X de Y".
7. **Tom de conversa.** Nunca linguagem de formulário.
