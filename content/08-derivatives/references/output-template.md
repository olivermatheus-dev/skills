# Template — OUTPUT_DERIVATIVES.md

> Use este template para gerar o arquivo `OUTPUT_DERIVATIVES.md` ao final de cada sessão de análise.
> Preencha todos os campos com dados reais da sessão. Campos em `[colchetes]` são placeholders.
> Este arquivo é o input para a Skill 6 (Editorial Calendar) e a Skill 8 (Carousel Creator).

---

```markdown
# Derivados: [Título ou tema do conteúdo-pilar]

> Gerado pela Skill 5B — Derivatives Engine.
> **Data:** [DD/MM/AAAA]
> **Fonte:** [OUTPUT_WRITER.md / OUTPUT_RESEARCH.md / texto direto]

---

## Contexto da Sessão

| Campo | Valor |
|---|---|
| **Conteúdo-pilar** | [título ou tema] |
| **Estágio de funil** | [TOFU / MOFU / BOFU] |
| **Plataformas ativas** | [conforme PLATFORM_SPECS] |
| **Tags de atomização encontradas** | [N] tags — [listar: HOOK_PRINCIPAL, DADO_DESTAQUE, etc.] |
| **Total de derivados viáveis** | [N] |

---

## Elementos Identificados no Conteúdo

| Elemento | Quantidade | Detalhes |
|---|---|---|
| Listas | [N] | "[descrição das listas encontradas]" |
| Dados / estatísticas | [N] | "[dados encontrados]" |
| Comparações | [N] | "[o que foi comparado]" |
| Histórias / casos | [N] | "[resumo das histórias]" |
| Insights isoláveis | [N] | "[frases que funcionam sozinhas]" |
| Citações de autoridade | [N] | "[citações encontradas]" |

---

## Alta Prioridade

> Formatos com alto potencial de engajamento e esforço baixo a médio.

### 1. [Nome do Formato]

| Campo | Valor |
|---|---|
| **Potencial** | Alto |
| **Plataforma** | [LinkedIn / Instagram / etc.] |
| **Esforço** | [Baixo / Médio] |
| **Elementos do conteúdo** | [o que especificamente do conteúdo-pilar serve] |
| **Próxima skill** | [5A para adaptar / 8 para visual / produzir aqui] |

**Sugestão de execução:**
[Como montar esse derivado em 3–5 linhas — estrutura, título sugerido, gancho]

---

### 2. [Nome do Formato]

[mesma estrutura]

---

## Média Prioridade

> Formatos viáveis mas com esforço maior ou potencial menor para este conteúdo específico.

### 1. [Nome do Formato]

| Campo | Valor |
|---|---|
| **Potencial** | Médio |
| **Plataforma** | [plataforma] |
| **Esforço** | [nível] |
| **Elementos do conteúdo** | [elementos disponíveis] |

**Sugestão de execução:**
[Como montar]

---

## Baixo Retorno / Alto Custo

> Formatos viáveis tecnicamente, mas cuja relação esforço/retorno não justifica para este conteúdo.

- **[Formato]:** Viável mas exige [esforço específico] — retorno estimado não justifica neste momento.

---

## Não Viáveis

> Formatos do catálogo que não têm material suficiente no conteúdo-pilar.

- **[Formato]:** [motivo — ex: "sem dados numéricos manipuláveis para calculadora"]
- **[Formato]:** [motivo — ex: "menos de 3 itens para checklist viável"]

---

## Cluster Sugerido — [N] dias

> Como distribuir o conteúdo-pilar + derivados em uma semana de publicação.

| Dia | Formato | Plataforma | Peça |
|---|---|---|---|
| Dia 1 | [Conteúdo-pilar] | [Plataforma principal] | [título/tema] |
| Dia 2 | [Derivado 1] | [Plataforma] | [título sugerido] |
| Dia 3 | [Derivado 2] | [Plataforma] | [título sugerido] |
| Dia 4 | [Derivado 3] | [Plataforma] | [título sugerido] |
| Dia 5 | [Derivado 4] | [Plataforma] | [título sugerido] |

**Lógica do cluster:**
- [Justificativa de por que essa ordem e distribuição de formatos]
- [Quais formatos são de "save" vs. "comentário" vs. "alcance"]

---

## Derivados Produzidos Nesta Sessão

> Preencher apenas se a skill produziu derivados além da análise.

### [Nome do Derivado Produzido]

[Conteúdo completo do derivado]

---

## Próximos Passos

- **Skill 8 — Carousel Creator:** produzir os slides visuais dos carrosséis identificados
- **Skill 5A — Platform Adapter:** adaptar derivados para plataformas específicas
- **Skill 6 — Editorial Calendar:** agendar o cluster no calendário editorial
```

---

## Notas de uso

- **Mínimo viável:** OUTPUT_DERIVATIVES.md mínimo precisa ter: Contexto da Sessão + Elementos Identificados + pelo menos a seção de Alta Prioridade + Cluster Sugerido.
- **Derivados não produzidos:** se a skill apenas identificou formatos sem produzi-los, as seções de Alta/Média Prioridade devem ter sugestões de execução suficientemente detalhadas para que o usuário ou outra skill possa produzir sem nova análise.
- **Downstream compatibility:** a Skill 6 (Editorial Calendar) usa a tabela de Cluster para montar o calendário. A Skill 8 usa as sugestões de execução dos carrosséis como briefing. Manter as sugestões específicas e acionáveis.
- **Tags de atomização:** se o conteúdo-pilar tinha tags, cruzar os elementos identificados com as tags para garantir que nada foi perdido na análise.
