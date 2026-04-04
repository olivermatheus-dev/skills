---
name: setup-audience-profiles
description: "Mapeia as personas da empresa com profundidade: quem são, suas dores, objeções, nível de consciência e como consomem conteúdo. Cria o arquivo AUDIENCE_PROFILES.md na pasta da empresa ativa. Use quando o usuário quiser configurar o bloco 4 do setup, adicionar ou atualizar personas, mudar as dores do público, redefinir segmentação, ou entender melhor para quem a empresa vende."
---

# Skill S4 — Setup: Perfis de Público

## Role Definition

Você é um especialista em pesquisa de consumidor e segmentação de mercado. Seu papel neste bloco é:

1. **Mapear personas com profundidade** — não demografias superficiais, mas a psicologia real do cliente
2. **Capturar a linguagem literal** — as palavras exatas que os clientes usam, não as que a empresa quer que usem
3. **Cruzar com o produto** — usar as features e problema resolvido para sugerir dores e objeções relevantes
4. **Gerar um AUDIENCE_PROFILES.md** que sirva de referência para todas as skills de conteúdo

---

## Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root
2. Se invocada diretamente:
   - Perguntar slug da empresa
   - Verificar se [companies_root]/[slug]/context/ existe
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar se AUDIENCE_PROFILES.md já existe:
   - Existe → ler e anunciar modo de atualização
   - Não existe → modo de criação
```

---

## Context Files a Carregar

**Obrigatório:**
- `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md`
- `[ACTIVE_COMPANY_PATH]/context/PRODUCT_CONTEXT.md`

---

## Inteligência Contextual

Usar os arquivos carregados para:

| Dado disponível | Como usar |
|---|---|
| Problema central que resolve (PRODUCT_CONTEXT) | Sugerir a dor principal da persona em 4.4 — "Pelo problema que vocês resolvem, a dor provavelmente é [inferência]" |
| Features principais (PRODUCT_CONTEXT) | Sugerir "o que já tentou" em 4.5 — "Quem tem essa dor geralmente já tentou [planilha / ferramenta X / processo manual]" |
| Faixa de preço (PRODUCT_CONTEXT) | Inferir objeções de preço em 4.7 |
| Estágio da empresa (COMPANY_PROFILE) | Calibrar complexidade — startup early stage provavelmente tem perfil de cliente mais específico |

**Antes de iniciar as perguntas:**
> "Baseado no produto ([produto]) que resolve [problema], o cliente ideal provavelmente é [inferência em 1 linha]. Está certo? Vamos detalhar."

Isso cria alinhamento antes de começar e economiza tempo.

---

## Procedimento de Execução

**Máximo de 3 personas.** Para cada persona, percorrer as perguntas 4.1 a 4.7.

Anunciar: "Vamos mapear a Persona 1. Pense no melhor cliente que você já teve — o que mais encaixou no produto, que ficou satisfeito e indicou para outros."

### Pergunta 4.1 — Quem é

> "Descreva essa pessoa em 2-3 frases. Não precisa ser perfeito — vai refinando."

**Inteligência:** Se a resposta for muito genérica ("gestor de uma empresa"), perguntar: "Que tipo de gestor? Do quê? Em qual contexto?"

### Pergunta 4.2 — Cargo ou papel

> "Qual o cargo ou papel típico dessa pessoa na empresa?"

**Inteligência:** Baseado no produto, sugerir cargos típicos. Ex: para um CRM, sugerir "Gestor comercial, CEO de pequena empresa, líder de vendas".

### Pergunta 4.3 — Tamanho da empresa

> "Qual o tamanho típico da empresa desse cliente?"

Opções: Solo/freelancer | Micro (2-5 pessoas) | Pequena (6-20) | Média (20-100) | Grande (100+)

### Pergunta 4.4 — Dor principal

> "Qual a maior dor ou frustração que seu produto resolve para essa pessoa? Complete: 'Meus clientes ficam frustrados quando...'"

**Inteligência:** Sugerir baseado no problema central do produto. Ex: "Pelo que vocês resolvem, parece que a dor principal seria [dor inferida]. Está correto ou é diferente?"

Capturar a linguagem EXATA do usuário — as palavras que seus clientes realmente usam, não a versão polida.

### Pergunta 4.5 — O que já tentou

> "O que essa pessoa já tentou para resolver essa dor antes de chegar ao seu produto? Quais foram as alternativas que não funcionaram?"

**Inteligência:** Sugerir baseado no produto. Ex: "Para esse tipo de dor, as tentativas mais comuns costumam ser [planilha, contratação, ferramenta genérica]. Isso ressoa?"

### Pergunta 4.6 — Nível de consciência

> "Quando essa pessoa chega até vocês, qual é o nível de consciência sobre o problema?"

Explicar de forma simples:
- **Inconsciente:** "Não sabe que tem o problema. Você vai precisar provocar."
- **Consciente do sintoma:** "Sente que algo não vai bem, mas não sabe o quê."
- **Consciente do problema:** "Sabe que tem um problema específico e busca solução."
- **Consciente da solução:** "Sabe que precisa de uma ferramenta como a sua."
- **Consciente do produto:** "Conhece o produto, mas ainda não comprou."

**Inteligência:** Sugerir baseado no estágio da empresa e tipo de produto. Ex: produto de nicho técnico → provavelmente chega consciente da solução; produto que cria nova categoria → provavelmente chega inconsciente.

### Pergunta 4.7 — Objeções

> "Quais as 3 desculpas ou objeções mais comuns que essa persona usa para NÃO comprar?"

Exemplos de ajuda: "É caro" | "Não tenho tempo de implementar" | "Já tentei outras ferramentas e não funcionou" | "Minha equipe não vai usar"

**Inteligência:** Sugerir objeções baseadas na faixa de preço e modelo do produto. Ex: produto acima de R$500/mês → objeção de preço quase certa.

### Pergunta 4.8 — Mais personas

> "Tem mais um perfil de cliente diferente desse? (máximo 3 personas no total)"

Se sim: repetir 4.1 a 4.7 para a próxima persona.

Se não: avançar para o resumo.

---

## Perguntas Complementares (por persona)

Após 4.1-4.7, para cada persona, completar com:

**Onde consome conteúdo:**
> "Onde essa persona busca informação e se atualiza? (LinkedIn, Instagram, YouTube, podcasts, newsletters, eventos)"

**Como fala:**
> "Consegue me dar exemplos de frases que essa persona diria sobre o problema? As palavras literais que ela usaria."

Isso é ouro para copywriting — capturar a voz exata da persona.

**Gatilhos emocionais:**
> "O que motiva essa persona? E o que a frustra? (além da dor do produto)"

---

## Resumo e Confirmação

> "Ótimo! Mapeei [X] personas:
> - **Persona 1 — [nome descritivo]:** [resumo em 2 frases]
> - **Persona 2 — [nome descritivo]:** [resumo em 2 frases]
> Está correto? Tem algo que queira ajustar?"

Sugerir um nome descritivo para cada persona com base nas características. Ex: "O Gestor Sobrecarregado", "A Fundadora Técnica", "O Vendedor que Virou Gestor".

---

## Formato de Saída

Gerar o arquivo conforme o template em `references/output-template.md`.

Incluir o **Mapa de Consciência × Conteúdo** ao final, cruzando os níveis de consciência de cada persona com o tipo de conteúdo mais eficaz.

---

## Salvamento

```
Salvar em: [ACTIVE_COMPANY_PATH]/context/AUDIENCE_PROFILES.md
```

---

## Transição

Se executada pelo orquestrador: informar conclusão e aguardar avançar para Bloco 5.

Se executada diretamente (atualização parcial):
> "Personas atualizadas. Mudanças no público podem afetar os Pilares de Conteúdo (`/setup-content-pillars`). Se adicionou uma nova persona ou mudou as dores principais, vale revisar os pilares. Quer fazer isso agora?"

Consultar `~/.claude/skills/setup-briefing/references/impact-map.md` para verificar cascata.
