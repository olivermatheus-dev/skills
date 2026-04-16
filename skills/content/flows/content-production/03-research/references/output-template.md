# Template — OUTPUT_RESEARCH.md

> Use este template para gerar o arquivo `OUTPUT_RESEARCH.md` ao final de cada sessão de pesquisa.
> Preencha todos os campos com dados reais da sessão. Campos em `[colchetes]` são placeholders.
> Este arquivo é consumido pela Skill 04 (Hooks Factory) e pela Skill 05 (Content Writer).

---

```markdown
# Pesquisa: [Título do tema / ângulo pesquisado]

> Gerado pela Skill 03 — Deep Research.
> **Data da pesquisa:** [DD/MM/AAAA]
> **Última atualização:** [data e hora]

---

## Contexto da Pesquisa

| Campo | Valor |
|---|---|
| **Ideia de origem** | [título provisório da Ideia #N do OUTPUT_IDEATION.md, ou "input direto"] |
| **Ângulo pesquisado** | [descrição do ângulo específico] |
| **Persona-alvo** | [nome da persona conforme AUDIENCE_PROFILES] |
| **Funil** | [TOFU / MOFU / BOFU] |
| **Profundidade** | [Rápida / Completa] |
| **Context files disponíveis** | [listar os que estavam presentes; anotar ausentes] |
| **Total de dados verificados** | [N] |
| **Fontes utilizadas** | [N fontes — listar tiers] |

---

## 1. Dados e Estatísticas

> Dados quantitativos com fonte verificável. Ordenados por impacto (o mais forte primeiro).

- **[Dado 1 — o mais forte]**
  Fonte: [nome da fonte] — [link] — Tier [N]
  Verificação: ✅ 2+ fontes confirmam / ⚠️ 1 fonte apenas
  Contexto: [breve nota sobre o que o dado prova ou dimensiona]

- **[Dado 2]**
  Fonte: [nome da fonte] — [link] — Tier [N]
  Verificação: ✅ / ⚠️
  Contexto: [nota]

- **[Dado 3]**
  Fonte: [nome da fonte] — [link] — Tier [N]
  Verificação: ✅ / ⚠️
  Contexto: [nota]

[continuar para mais dados se disponíveis]

---

## 2. Cases e Exemplos

> Histórias reais com resultado mensurável. Um caso bem descrito vale mais do que cinco vagos.

### Case 1
**Empresa/contexto:** [nome ou perfil da empresa se anônimo]
**Situação antes:** [o problema que tinham]
**Ação realizada:** [o que fizeram]
**Resultado:** [resultado específico com número, prazo ou escala]
**Fonte:** [link]
**Relevância para a persona:** [por que esse case ressoa com [persona-alvo]]

### Case 2 (se disponível)
**Empresa/contexto:** ...
**Situação antes:** ...
**Ação realizada:** ...
**Resultado:** ...
**Fonte:** ...
**Relevância:** ...

---

## 3. Citações de Autoridade

> Frases de especialistas reconhecidos que fortalecem o argumento. Atribuição obrigatória.

- **"[Citação exata ou parafraseada com sinalização]"**
  — [Nome do especialista], [cargo/credencial]
  Contexto: [livro, palestra, entrevista — com link se disponível]
  Uso sugerido: [abertura / argumento central / fechamento]

- **"[Citação 2]"**
  — [Nome], [credencial]
  Contexto: [fonte]
  Uso sugerido: [...]

---

## 4. Contra-Argumentos e Objeções

> O "outro lado" do argumento. Incluir a objeção E a resposta — ambas fortalecem o conteúdo.

| Objeção | De quem vem | Resposta / Dado que refuta |
|---|---|---|
| "[Objeção 1 — texto da resistência real]" | [persona / crítico / dado conflitante] | [resposta fundamentada] |
| "[Objeção 2]" | [...] | [...] |

---

## 5. Gaps de Conteúdo

> O que ninguém está dizendo. Ângulos originais identificados na pesquisa.

- **Gap identificado:** [descrição do que está ausente na cobertura atual do tema]
  **Ângulo original possível:** [como explorar esse gap no conteúdo]
  **Por que é relevante para a persona:** [conexão com dor ou nível de consciência]

- **Gap 2 (se identificado):** ...
  **Ângulo possível:** ...

---

## 6. Material Complementar

> Fontes, livros, relatórios e referências adicionais que não entraram nas seções acima, mas podem ser úteis para o redator.

- [Título do material] — [link] — [nota de 1 frase sobre o que contém]
- [Título] — [link] — [nota]

---

## 7. Resumo Executivo para o Redator

> Este é o material mais importante do output. O redator (Skill 05) vai ler este bloco primeiro.
> Escrever como um **briefing verbal para o redator** — prospectivo e diretivo, não como relatório de conclusão.
> Cobrir em 3–5 frases: dado mais forte, case mais relevante, principal insight, e recomendação de uso.

[Exemplo de formato:]
"O dado mais forte desta pesquisa é [dado 1 com fonte], que pode ser usado como abertura ou argumento central. O case de [empresa/contexto] demonstra [resultado] e é o exemplo mais próximo da situação da persona [nome]. O principal insight é [observação que vai além do dado — a interpretação]. O gap identificado ([gap]) sugere que um ângulo de [natureza do ângulo] ainda não foi explorado pelo setor. Recomendação: abrir com o dado, desenvolver com o framework implícito no case, fechar com o gap como provocação."

---

## Notas de Qualidade

| Item | Status |
|---|---|
| Todos os dados têm fonte rastreável? | ✅ / ⚠️ [detalhar se ⚠️] |
| Dados de contexto diferente sinalizados? | ✅ / ⚠️ |
| Contra-argumentos incluídos? | ✅ / Não (motivo: [...]) |
| Gap de conteúdo identificado? | ✅ / Não (motivo: [...]) |
| Context files ausentes registrados? | ✅ / N/A |

---

## Próximos Passos Sugeridos

**Próxima skill recomendada:**
- **Skill 04 — Hooks Factory:** para criar ganchos de abertura usando os dados e ângulos encontrados
- **Skill 05 — Content Writer:** se hooks já foram definidos ou se o usuário quer ir direto para a redação
```

---

## Notas de uso

- **Mínimo viável (pesquisa rápida):** O OUTPUT_RESEARCH.md mínimo precisa ter: Contexto da Pesquisa + dados suficientes em seção 1 (o redator não precisaria sair para buscar mais) + 1 case em seção 2 + Resumo Executivo.
- **Campos ausentes:** Se não encontrou dados suficientes para alguma seção, escrever "[Dados insuficientes — motivo: ...]" em vez de deixar em branco ou inventar.
- **Downstream compatibility:** O Resumo Executivo (seção 7) é o campo mais crítico — Skill 3 e Skill 4 o usam como ponto de partida. Nunca omiti-lo.
- **Fallback D:** Se o usuário pulou a pesquisa, registrar "Pesquisa não realizada — dados fornecidos pelo usuário" no campo Profundidade e preencher apenas com o que o usuário forneceu.
