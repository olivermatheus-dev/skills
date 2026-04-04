# Template — OUTPUT_PERFORMANCE.md

> Use este template para gerar o arquivo `OUTPUT_PERFORMANCE.md` ao final de cada sessão de análise.
> Preencha todos os campos com dados reais da sessão. Campos em `[colchetes]` são placeholders.
> Este arquivo é o input para a Skill 1 (Ideação) no próximo ciclo.

---

```markdown
# Análise de Performance — [Título ou tema do(s) post(s) analisado(s)]

> Gerado pela Skill 8 — Performance Analyzer.
> **Data:** [DD/MM/AAAA]
> **Fonte dos dados:** [Métricas digitadas / Screenshot de analytics / CSV / Qualitativo]

---

## Contexto da Sessão

| Campo | Valor |
|---|---|
| **Plataforma(s)** | [LinkedIn / Instagram / TikTok / etc.] |
| **Posts analisados** | [N] |
| **Período** | [data início — data fim ou "pontual"] |
| **Objetivo do conteúdo** | [Alcance / Engajamento / Save / Conversão] |
| **Histórico disponível** | [Média de N posts / Não disponível — benchmarks de mercado usados] |
| **Distribuição por Tier** | [N Tier A / N Tier B / N Tier C / N Tier D] |

---

## Análise por Post

### Post [N]: [título ou descrição curta do post]

**Plataforma:** [qual] | **Formato:** [carrossel / reels / texto / etc.] | **Data:** [DD/MM/AAAA] | **Tier:** [A / B / C / D]

#### WHAT — O que aconteceu

| Métrica | Valor | Referência | Comparação |
|---|---|---|---|
| Impressões | [X] | [média ou benchmark] | [+X% / -X%] |
| Alcance | [X] | [média ou benchmark] | [+X% / -X%] |
| Taxa de engajamento | [X%] | [média ou benchmark] | [+X% / -X%] |
| Saves | [X] | [média ou benchmark] | [+X% / -X%] |
| Shares | [X] | [média ou benchmark] | [+X% / -X%] |
| Comentários | [X] | [média ou benchmark] | [+X% / -X%] |
| [Métrica específica da plataforma] | [X] | [referência] | [comparação] |

**Métrica-surpresa:** [o que se comportou diferente do esperado e por quê é relevante]

#### WHY — Por que aconteceu

| Dimensão | Análise |
|---|---|
| **Hook** | [categoria do hook, força, por que funcionou ou não] |
| **Formato** | [carrossel / reels / texto — como o formato contribuiu ou prejudicou] |
| **Tema/Pilar** | [qual pilar, estágio de funil, alinhamento com persona] |
| **Timing** | [horário, dia, contexto sazonal ou de notícia relevante] |
| **Estrutura** | [CTA presente? Argumento claro? Legibilidade?] |
| **Padrão** | [confirma ou quebra padrão já observado na conta?] |

#### NEXT — O que fazer agora

**Replicar:**
- [O que funcionou e deve ser repetido com variação]

**Testar:**
- [O que foi promissor mas precisa de confirmação]

**Abandonar:**
- [O que claramente não funcionou para esta audiência/plataforma]

**Investigar:**
- [O que precisa de mais dados antes de decidir]

---

[Repetir bloco "Análise por Post" para cada post analisado]

---

## Padrões Identificados

> Preencher apenas quando N ≥ 3 posts analisados.

### Formatos

[Qual formato performa melhor? Há padrão consistente?]

### Temas/Pilares

[Quais pilares geram mais engajamento? Mais saves? Mais alcance?]

### Hooks

[Que categorias de hook estão funcionando? Contrarian? Número? Pergunta?]

### Timing

[Dias/horários com melhor performance? Sazonalidade aparente?]

### Funil

[TOFU/MOFU/BOFU — qual estágio ressoa mais com esta audiência nesta plataforma?]

---

## Hooks para a HOOK_LIBRARY.md

> Hooks identificados nesta sessão para adicionar à biblioteca. Confirmados com o usuário antes de salvar.

### Hook [N]: "[texto exato do hook]"

- **Plataforma:** [plataforma]
- **Formato:** [formato do post]
- **Categoria:** [dor / contrarian / número / curiosidade / pergunta / autoridade]
- **Funil:** [TOFU / MOFU / BOFU]
- **Métricas:** Impressões: [X] | Engajamento: [Y]% | Saves: [Z] | Shares: [W]
- **Tier:** [A / B / C / D]
- **Veredito:** ✅ Replicar / ⚠️ Testar variação / ❌ Não replicar
- **Aprendizado:** [1 frase sobre o que funcionou ou não funcionou neste hook]

---

## Retroalimentação para o Próximo Ciclo

> Insights diretos para a Skill 1 (Ideação) incorporar na próxima rodada de geração de ideias.

### Formatos a priorizar
- [Formato 1 com justificativa baseada nos dados]

### Temas/pilares a explorar mais
- [Tema 1 com justificativa]

### Temas/pilares a reduzir
- [Tema 1 com justificativa]

### Tipos de hook a repetir
- [Categoria de hook com justificativa]

### Testes A/B sugeridos para o próximo ciclo
- **Teste 1:** [hipótese] — publicar [formato/hook A] vs. [formato/hook B] na mesma semana
- **Teste 2:** [hipótese]

---

## Próximos Passos

- **Skill 1 — Ideation Engine:** iniciar novo ciclo com os insights acima como calibração
- **HOOK_LIBRARY.md:** [N] hooks adicionados/atualizados nesta sessão
- **Próxima análise:** [data sugerida ou "após próximo lote de N posts publicados"]
```

---

## Notas de uso

- **Análise pontual vs. lote:** Para 1 post, omitir a seção "Padrões Identificados" (sem dados suficientes). Incluí-la apenas a partir de 3 posts.
- **Dados qualitativos:** Se o usuário não tiver números, preencher a tabela WHAT com sinais qualitativos (ex: "alto — 'post bombou'") e anotar no cabeçalho que a análise é qualitativa.
- **Downstream compatibility:** A seção "Retroalimentação para o Próximo Ciclo" é o input direto para a Skill 1. Manter os insights específicos e acionáveis — não genéricos.
- **HOOK_LIBRARY:** Os hooks desta seção devem ser copiados para o HOOK_LIBRARY.md com confirmação do usuário. Não modificar a biblioteca sem confirmação explícita.
- **Tier D:** Quando não há histórico, registrar os dados desta sessão como linha base e anotar: "Tier D — linha base estabelecida. Comparar próximos posts contra estes valores."
