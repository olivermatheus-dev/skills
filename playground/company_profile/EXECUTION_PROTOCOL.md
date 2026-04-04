# Protocolo de Execução de Etapas — v2

> Referência obrigatória para toda etapa do fluxo.
> Cada etapa executa as 6 fases abaixo, na ordem, sem exceção.

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

**Se é a primeira etapa do fluxo:** Pular. Ir para Fase 2.

**Se não é a primeira etapa:**

```
1. Ler COMPANY_PROFILE.md
2. Para cada campo já preenchido, registrar internamente:
   - Valor
   - Classificação (✅ / 🔶 / 🔸)
3. Consultar a TABELA DE CONTEXTO da etapa atual
   (cada etapa define a sua — ver exemplo na etapa)
4. Se há campos 🔸 (hipótese vaga) que esta etapa usa:
   → Marcar para refinamento na Fase 3 (antes das perguntas novas)
```

**Regra de uso por classificação:**

| Classificação do dado | Como usar |
|-----------------------|-----------|
| ✅ Validado | Usar como fato. Referenciar diretamente: "Você atua em [setor]..." |
| 🔶 Hipótese precisa | Usar como sugestão. Apresentar para confirmação: "Você mencionou [X] — confirma?" |
| 🔸 Hipótese vaga | Não usar como base. Tentar refinar antes de usar. |

---

## FASE 2 — Definir Modo de Entrada

Apresentar ao usuário:

```
"Nesta etapa vou fazer [N] perguntas sobre [tema].
Prefere:
(A) Responder uma por uma
(B) Enviar um documento ou texto com as informações — eu extraio e a gente valida"
```

**Se (A):** Ir para Fase 3.

**Se (B):** Executar extração:

```
1. Ler documento
2. Para cada pergunta da etapa:
   - Encontrou resposta → extrair
   - Não encontrou → marcar ❌
3. Apresentar resumo ao usuário:
   "Extraí do documento:
    ✅ [Campo]: [valor] — claro
    ⚠️ [Campo]: [valor] — genérico, preciso detalhar
    ❌ [Campo]: não encontrado
    Correto? Posso validar um por um?"
4. Após "ok" → Ir para Fase 3 (modo validação: respostas pré-preenchidas)
```

---

## FASE 3 — Coletar e Classificar

### Refinamento primeiro (se aplicável)

Se a Fase 1 marcou campos 🔸 para refinamento:

```
"Antes das perguntas desta etapa, quero refinar [N] ponto(s)
que ficou vago anteriormente:

🔸 [Campo]: [valor atual]
Consegue dar mais detalhe, ou mantenho como está?"
```

Se refinar → atualizar classificação no template.
Se não → manter e seguir.

### Loop por pergunta

Para cada pergunta da etapa, na ordem definida:

```
PASSO 1 — APRESENTAR
  Mostrar:
  - Número: "Pergunta [X] de [Y]"
  - Texto da pergunta
  - Por que importa (máximo 2 frases)
  - Sugestão contextualizada (se há dados anteriores para usar)
  - Exemplos de resposta (mínimo 2)

PASSO 2 — RECEBER RESPOSTA

PASSO 3 — PROCESSAR
  Checar na ordem:
  a) Resposta vaga?
     → SIM: Reformular com exemplo concreto. Máximo 2 tentativas.
            Se continuar vaga após 2 tentativas → aceitar.
     → NÃO: Seguir.
  b) Contradiz dado anterior?
     → SIM: "Na Etapa [N] você disse [X], agora mencionou [Y]. Qual vale?"
            Resolver antes de seguir. Atualizar dado anterior se necessário.
     → NÃO: Seguir.
  c) Cobre mais de uma pergunta?
     → SIM: Extrair todas as informações. Confirmar cada uma.
            Pular perguntas cobertas.
     → NÃO: Seguir.

PASSO 4 — CLASSIFICAR
  Apresentar:
  "Registrei: [resposta processada]
   Classificação sugerida: [✅/🔶/🔸] — [justificativa em 1 frase]

   Como classifica?
   (✅) Validado — tenho certeza
   (🔶) Hipótese precisa — acredito que sim, mas pode mudar
   (🔸) Hipótese vaga — não tenho certeza"

  Regra: A IA sugere. O usuário decide. Nunca classificar sozinha.
```

**Repetir o loop até cobrir todas as perguntas da etapa.**

---

## FASE 4 — Análise de Qualidade

Executar internamente (não mostrar o processo ao usuário):

```
1. Contar: quantas ✅, quantas 🔶, quantas 🔸
2. Verificar coerência interna (respostas desta etapa entre si)
3. Verificar coerência com etapas anteriores
4. Identificar gaps (campos sem resposta ou "a definir")
5. Verificar campos críticos:
   - Campo crítico como 🔸 → nível de confiança = Baixo (automático)
   - Campo crítico sem resposta → nível de confiança = Baixo (automático)
6. Calcular nível de confiança:
   - Alto: 70%+ são ✅, zero incoerências, zero gaps em campos críticos
   - Médio: 50-70% são ✅, ou 1 gap/incoerência menor
   - Baixo: <50% são ✅, ou incoerência grave, ou campo crítico como 🔸
```

Cada etapa define quais campos são:
- **Críticos** — sem eles, próximas etapas não funcionam
- **Importantes** — úteis mas não bloqueantes
- **Desejáveis** — bônus

---

## FASE 5 — Resumo e Decisão

Apresentar ao usuário:

```
## Resumo — Etapa [N]: [Nome]

[Uma linha por campo:]
[✅/🔶/🔸] **[Campo]:** [Resposta]

---
Confiança: [Alto/Médio/Baixo]
Validadas: [X] de [total] | Hipóteses precisas: [X] | Hipóteses vagas: [X]

[Se há gaps:]
⚠️ Gaps: [lista]

[Se há incoerências:]
⚠️ Incoerências: [lista]

---
O que vem depois: [1 frase sobre como esses dados serão usados na próxima etapa]

(A) Prosseguir
(B) Refinar — ajustar campo(s) específico(s)
(C) Refazer — repassar todas as perguntas
```

**Se (A):** Fase 6.
**Se (B):** Voltar para Fase 3 apenas para os campos indicados. Após ajuste, voltar para Fase 5.
**Se (C):** Voltar para Fase 3 completa. Respostas anteriores viram sugestão: "Antes você disse [X]. Mantém?"

---

## FASE 6 — Salvar

```
1. Atualizar seção da etapa no COMPANY_PROFILE.md:
   - Substituir [pendente] pelos dados coletados
   - Adicionar classificação como comentário HTML:
     <!-- status: validado --> ou <!-- status: hipotese-precisa -->
     ou <!-- status: hipotese-vaga -->
   - Preencher insights da etapa

2. Se refinamentos alteraram dados de etapas anteriores:
   - Atualizar seção anterior + classificação

3. Atualizar cabeçalho:
   <!-- Última atualização: [data] -->
   <!-- Status: em andamento | Etapa atual: [N+1] de [total] -->

4. Confirmar ao usuário:
   "Etapa [N] salva. [1 frase]. Vamos para Etapa [N+1] — [nome]?"
```

---

## Regras Permanentes

Estas regras se aplicam a toda etapa, toda fase, toda interação:

1. **Uma pergunta por mensagem.** Nunca duas.
2. **Nunca inventar dados.** Sem informação = `[pendente]`, nunca fato.
3. **Sugestões ≠ respostas.** Sempre apresentar como opção, nunca como fato.
4. **Contradição = parar.** Sempre apontar, nunca ignorar.
5. **Reformulação de resposta vaga: máximo 2 tentativas.** Depois aceitar e classificar como 🔸.
6. **Progresso visível.** Sempre indicar "Pergunta X de Y" e o que vem depois.
7. **Tom de conversa.** Nunca linguagem de formulário.