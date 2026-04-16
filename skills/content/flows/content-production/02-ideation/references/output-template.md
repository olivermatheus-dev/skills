# Template — OUTPUT_IDEATION.md

> Use este template para gerar o arquivo `OUTPUT_IDEATION.md` ao final de cada sessão de ideação.
> Preencha todos os campos com dados reais da sessão. Campos em `[colchetes]` são placeholders.
> Este arquivo é o input para a Skill 2 (Deep Research) e para a Skill 3 (Hooks Factory).

---

```markdown
# Ideias de Conteúdo — [Data da sessão: DD/MM/AAAA]

> Gerado pela Skill 1 — Ideation Engine.
> **Última atualização:** [data e hora]

---

## Contexto da Sessão

| Campo | Valor |
|---|---|
| **Empresa** | [nome da empresa conforme COMPANY_PROFILE] |
| **Persona-alvo** | [nome da persona ou "Todas as personas"] |
| **Foco de funil** | [TOFU / MOFU / BOFU / Mix — especificar proporção] |
| **Tema urgente/sazonal** | [se informado pelo usuário, ou "nenhum"] |
| **Total de ideias geradas** | [N] |
| **Distribuição por funil** | [X TOFU / Y MOFU / Z BOFU] |
| **Context files disponíveis** | [listar os que estavam presentes; anotar ausentes] |

---

## Ideias Geradas

[Repetir o bloco abaixo para cada ideia. Manter a numeração sequencial.]

---

## Ideia #1
- **Título provisório:** "[título com gancho — não é o hook final, é o conceito]"
- **Pilar:** [nome do pilar conforme CONTENT_PILLARS]
- **Funil:** [TOFU/MOFU/BOFU] — [objetivo da etapa em 1 frase]
- **Persona:** [nome da persona conforme AUDIENCE_PROFILES]
- **Ângulo:** [categoria do ângulo]
- **Formato sugerido:** [Carrossel / Reels / Post longo / Thread / Vídeo / etc.]
- **Por que funciona:** [1 frase explicando o gatilho emocional ou intelectual ativado]

---

## Ideia #2
- **Título provisório:** "..."
- **Pilar:** ...
- **Funil:** ...
- **Persona:** ...
- **Ângulo:** ...
- **Formato sugerido:** ...
- **Por que funciona:** ...

---

[... continuar até Ideia #N]

---

## Top 3 Ideias com Maior Potencial

> Selecionar apenas quando foram geradas 3 ou mais ideias.
> Critérios: originalidade do ângulo, alinhamento com persona prioritária, potencial de engajamento e proximidade com diferencial da empresa.

### 1º lugar — Ideia #[N]: "[título]"
[2–3 frases explicando por que esta ideia se destaca: qual problema resolve, qual gatilho ativa, por que o ângulo é difícil de replicar por concorrentes.]

### 2º lugar — Ideia #[N]: "[título]"
[2–3 frases de justificativa.]

### 3º lugar — Ideia #[N]: "[título]"
[2–3 frases de justificativa.]

---

## Próximos Passos Sugeridos

**Ideia selecionada para aprofundamento:** [título da ideia escolhida, ou "nenhuma ainda — aguardando escolha do usuário"]

**Próxima skill recomendada:**
- **Skill 2 — Deep Research:** para fundamentar a ideia escolhida com dados, cases e estatísticas
- **Skill 3 — Hooks Factory:** se a ideia já está clara e o foco é criar o gancho de abertura
- **Manter em backlog:** se nenhuma ideia for selecionada agora; salvar OUTPUT_IDEATION.md para uso futuro

> Pergunta de transição:
> "Quer aprofundar alguma dessas ideias? Posso ir direto para a Skill 2 (Research) com a ideia que você escolher e fundamentar com dados, cases e estatísticas. Ou prefere ir para outra etapa?"
```

---

## Notas de uso

- **Mínimo viável:** Se o usuário pulou a ideação e forneceu um tema direto (Fallback B), o OUTPUT_IDEATION.md mínimo precisa ter apenas o Contexto da Sessão + 1 ideia com todos os 7 campos preenchidos.
- **Campos ausentes:** Se algum campo não puder ser preenchido por falta de context files, registrar "[não disponível — [nome do arquivo] ausente]" em vez de deixar em branco.
- **Downstream compatibility:** Os 7 campos do card de ideia (título, pilar, funil, persona, ângulo, formato, por que funciona) são consumidos pela Skill 2 (Research) e pela Skill 3 (Hooks). Nunca omitir nenhum deles.
