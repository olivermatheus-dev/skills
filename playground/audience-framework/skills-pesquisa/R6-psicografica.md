# R6 — Inferência Psicográfica e Cultural

**Responsabilidade:** Reconstruir o contexto formativo da persona — os valores, vieses cognitivos, relação com autoridade, estilo de comunicação e referências culturais que moldaram quem ela é hoje. Esta skill NÃO faz web search: usa a base de conhecimento do LLM como "antropólogo digital".

**Quando aciona:** Durante a Skill 4.2 (Persona Builder), após dados demográficos confirmados (faixa etária, classe social, região, escolaridade). Idealmente logo após a R2 ser executada.

**Input necessário:**
- Faixa etária e geração (de P2.1 e P2.10)
- Classe social estimada (de R2 ou usuário)
- Região e contexto sociocultural (de P2.4)
- Escolaridade e área de formação (de P2.5)

> **Nota de transparência:** O output desta skill é hipótese estruturada, não dado. O LLM usa conhecimento de história, psicologia, sociologia e cultura para reconstruir o contexto formativo por inferência contextual. Cada campo deve ser apresentado como hipótese [H] elevável a [V] com validação direta do usuário.

---

## O que a IA infere (sem web search)

| Dimensão | O que reconstrói | Por que importa |
|---|---|---|
| Contexto histórico formativo | Eventos marcantes durante os 10-25 anos da persona | Molda relação com risco, autoridade, dinheiro e estabilidade |
| Cultura de mídia consumida | O que assistiu, ouviu, leu na formação | Referências para memes, analogias, conexão emocional |
| Valores centrais por classe/geração | O que é inegociável para esse perfil | Base de todo posicionamento e argumento de valor |
| Vieses cognitivos dominantes | Quais vieses são mais presentes nesse perfil | Como estruturar argumentos de forma mais persuasiva |
| Relação com autoridade | Confia em especialistas? Prefere pares? | Define o tipo de prova social mais eficaz |
| Relação com risco e mudança | Early adopter vs. late majority | Define o framing de oferta e garantias necessárias |
| Estilo de comunicação preferido | Formal/informal, direto/narrativo, técnico/acessível | Calibra tom de todas as skills de conteúdo |

---

## Como usar os dados nas etapas seguintes

```
Valores centrais              → Skill 4.3: hierarquia de desejos (P5.x)
                              → Skill 4.5: o que justifica preço alto
Vieses cognitivos             → Skill 4.3: como enquadrar dores
                              → Skill 4.5: estrutura de argumentação
Relação com autoridade        → Skill 4.4: tipo de prova social por tipo dos 9
                              → Skill 4.5: nível de consciência e conteúdo
Relação com risco             → Skill 4.4: gatilhos de avanço por tipo
                              → Skill 4.5: garantias e mitigação de medo
Referências culturais         → Todos os conteúdos: memes, analogias, hooks
Estilo de comunicação         → BRAND_VOICE calibration, todos os conteúdos
```

---

## Protocolo de Inferência

Ao reconstruir o perfil, o LLM deve:

1. **Ancorar na geração + classe + região** — a combinação é mais precisa que qualquer variável isolada
2. **Cruzar com o contexto do produto** — uma persona de classe B em São Paulo é diferente de uma de classe B no interior do Nordeste, especialmente se o produto é B2B
3. **Diferenciar o que é geracional do que é individual** — o perfil é estatístico, não determinístico. Apresentar como "tendências do perfil", não como certezas
4. **Incluir o que pode contradizer** — para cada tendência, indicar quando ela NÃO se aplica

---

## Output — Seção R6 de RESEARCH_[publico].md

```markdown
## R6 — Perfil Psicográfico e Cultural (Inferência)
*Gerado em: [data] | Fonte: Inferência do LLM — validar com dados do usuário*

> ⚠️ Todo o conteúdo desta seção é classificado como [H] (hipótese estruturada).
> Elevado a [E] após experiência do usuário confirmar padrões.
> Elevado a [V] após validação direta com clientes.

### Geração e Contexto Formativo
- **Geração:** [nome] ([anos]) [H]
- **Eventos históricos dos 10-25 anos desta persona:**
  - [evento] → impacto: [como moldou valores/comportamento] [H]
  - [evento] → impacto: [H]
- **Relação com dinheiro e estabilidade:** [descrição baseada no contexto geracional] [H]
- **Relação com tecnologia:** [early adopter / pragmático / resistente] [H]

### Valores Centrais do Perfil
(por geração + classe social + contexto regional)
1. [valor] — por que importa para este perfil [H]
2. [valor] [H]
3. [valor] [H]

### Vieses Cognitivos Predominantes
| Viés | Manifestação neste perfil | Implicação para comunicação |
|---|---|---|
| [nome do viés] | [como aparece] [H] | [como usar/considerar] |

### Relação com Autoridade e Expertise
- [descrição: confia em especialistas formais / prefere pares / desconfia de autoridade] [H]
- Implicação: tipo de prova social mais eficaz = [depoimento de par / número / especialista / caso similar] [H]

### Relação com Risco e Mudança
- Perfil de adoção: [early adopter / early majority / late majority / laggard] [H]
- Implicação: [o que reduz friction na compra — garantia, trial, referência, etc.] [H]

### Estilo de Comunicação Preferido
- Tom: [formal / semiformal / informal / direto] [H]
- Estrutura: [narrativa / lista / dado + análise / exemplo + princípio] [H]
- Jargão: [técnico aceitável / prefere linguagem simples / misto] [H]

### Referências Culturais Prováveis
(consultar references/generations-guide.md para lista completa)
- **Mídia da formação:** [filmes, séries, programas] [H]
- **Música:** [gêneros e artistas da época] [H]
- **Referências que conectam:** [o que usar para criar pertencimento] [H]
- **Referências que alienam:** [o que evitar — parece forçado ou errado para a geração] [H]

### Notas de Calibração
- Onde este perfil PODE divergir do padrão geracional: [situações específicas]
- O que o usuário deve validar primeiro: [os campos de maior impacto e menor certeza]
```

---

## Regra de Ouro desta Skill

> Esta skill não pesquisa dados. Ela pensa. O LLM funciona como um estrategista que conhece história, psicologia e cultura — e cruza isso com os dados demográficos para reconstituir quem é essa pessoa. O output é mais rápido e mais profundo do que qualquer web search, mas precisa de validação. Apresente sempre como hipótese, não como fato.
