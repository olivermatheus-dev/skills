# Lógica de Sugestão de Pilares de Conteúdo

## Algoritmo de Cruzamento

O coração do Bloco 6 é a geração automática de pilares. Executar antes da primeira pergunta:

```
Para cada feature principal do PRODUCT_CONTEXT:
  → Cruzar com as dores do AUDIENCE_PROFILES que essa feature resolve
  → Verificar se algum concorrente no COMPETITOR_MAP domina esse tema
  → Se gap encontrado: prioridade alta
  → Se concorrente domina: prioridade menor (mas pode entrar com ângulo diferente)

Considerar também os gaps explícitos listados no COMPETITOR_MAP.

Gerar 4-6 pilares no formato:
  Pilar: [Nome]
  Cobre: [subtemas]
  Dor que endereça: [dor do AUDIENCE_PROFILES]
  Persona principal: [qual]
  Gap de mercado: [sim/não, baseado no COMPETITOR_MAP]
  Prioridade sugerida: [alta/média]
```

### Como apresentar cada pilar

Usar justificativa clara com os dados dos arquivos de contexto:

> "**Pilar: Organização Comercial** — Este pilar cobre funil de vendas, processos e follow-up. Sugiro porque sua persona principal ('O Gestor Sobrecarregado') tem como dor principal a falta de processo, e nenhum dos 3 concorrentes mapeados publica conteúdo aprofundado sobre isso. Prioridade: alta."

Não apresentar apenas o nome — sempre com justificativa que mostra o raciocínio.

---

## Pilares Comuns por Tipo de Negócio

Se faltar dados para cruzamento, sugerir baseado no tipo de negócio identificado no COMPANY_PROFILE:

### SaaS B2B
1. **Problema/dor** — educação sobre o problema que resolve (TOFU)
2. **Produto/solução** — features, tutoriais, demos, casos de uso (MOFU/BOFU)
3. **Bastidores/cultura** — transparência, jornada do fundador, equipe (TOFU)
4. **Setor/mercado** — tendências, dados, análises do mercado (TOFU/MOFU)
5. **Cases/resultados** — provas sociais, antes/depois (MOFU/BOFU)

### Serviços / Consultoria
1. **Metodologia** — frameworks, processos, como funciona por dentro (MOFU)
2. **Cases e resultados** — provas sociais, transformações, antes/depois (BOFU)
3. **Educação do mercado** — mitos, erros comuns, tendências (TOFU)
4. **Autoridade** — opinião, posicionamento, tendências do setor (TOFU/MOFU)
5. **Bastidores** — como trabalha, cultura, seleção de clientes (TOFU)

### E-commerce / Varejo
1. **Produto/curadoria** — novidades, combinações, usos criativos (MOFU/BOFU)
2. **Lifestyle** — como o produto se encaixa na vida ideal da persona (TOFU)
3. **Bastidores** — fabricação, equipe, valores, processo (TOFU)
4. **Comunidade** — UGC, depoimentos, interação com clientes (TOFU/BOFU)
5. **Educação** — como usar, cuidados, guias de compra (MOFU)

### Educação / Cursos
1. **Educação gratuita** — conteúdo do próprio tema do curso (TOFU)
2. **Metodologia** — por que sua abordagem é diferente (MOFU)
3. **Resultados dos alunos** — transformações e cases (BOFU)
4. **Jornada pessoal** — história, bastidores, aprendizados (TOFU)
5. **Mercado** — tendências, oportunidades na área (TOFU)

### Health / Bem-estar
1. **Educação** — informação baseada em evidência sobre o tema (TOFU)
2. **Protocolo/método** — como funciona sua abordagem (MOFU)
3. **Resultados** — transformações reais de clientes (BOFU)
4. **Mitos e verdades** — desconstrução de desinformação (TOFU)
5. **Rotina/prática** — conteúdo aplicável no dia a dia (TOFU/MOFU)

---

## Exercício de Proporção TOFU/MOFU/BOFU

Explicar para o usuário de forma acessível:

- **TOFU (Topo do funil — consciência):** "Conteúdo para quem NÃO sabe que tem um problema, ou não te conhece. O objetivo é fazer pensar e aparecer no radar. Ex: dados do setor, provocações, checklists, listas."

- **MOFU (Meio do funil — consideração):** "Conteúdo para quem SABE que tem um problema e busca solução. O objetivo é educar e construir autoridade. Ex: frameworks, tutoriais, comparativos, guias aprofundados."

- **BOFU (Fundo do funil — decisão):** "Conteúdo para quem está DECIDINDO entre opções. O objetivo é converter. Ex: cases, depoimentos, demos, garantias, objeções respondidas."

### Mixes recomendados por estágio

Sugerir baseado no campo `estágio` do COMPANY_PROFILE:

| Estágio | Mix sugerido | Justificativa |
|---|---|---|
| Planejando / Lançando | 30% TOFU / 30% MOFU / 40% BOFU | Precisa de conversão para validar |
| Crescimento | 50% TOFU / 30% MOFU / 20% BOFU | Priorizar alcance e audiência |
| Operação estável | 40% TOFU / 40% MOFU / 20% BOFU | Equilibrar crescimento e conversão |

Se persona tem nível de consciência predominantemente "inconsciente": aumentar TOFU em 10%.
Se empresa tem base de clientes satisfeitos mas poucas indicações: focar mais em cases (BOFU).

---

## Regras de Distribuição entre Pilares

Ao finalizar os pilares, definir regras de distribuição:

- Máximo 2 posts consecutivos do mesmo pilar
- Pelo menos 1 post por pilar a cada 2 semanas
- Nunca 3+ posts BOFU consecutivos
- 1-2 slots/semana para conteúdo reativo (tendências, notícias do setor)
- Pilar de maior prioridade recebe 30-40% dos posts
- Pilares secundários dividem o restante igualmente

---

## Datas Sazonais e Ganchos Temporais

Ao finalizar os pilares, perguntar sobre datas relevantes para o setor:

**Perguntar:**
> "Tem alguma data sazonal importante para o seu setor? Pode ser datas do calendário (Black Friday, início de ano), ou específicas do nicho (ex: Dia do Vendedor, Copa do Mundo, lançamentos de produtos)."

Incluir no CONTENT_PILLARS.md como tabela de datas com gancho e pilar relacionado.

---

## Ângulos e Hook Categories por Tipo de Pilar

Este mapa conecta o tipo de pilar com os ângulos de ideação (usados pela Skill 1 — Ideação) e as categorias de hook (usadas pela Skill 3 — Hooks Factory). Usar para preencher automaticamente os campos `Ângulos preferenciais` e `Hook categories` de cada pilar sugerido.

| Tipo de pilar | Estágios de funil | Ângulos recomendados | Hook categories |
|---|---|---|---|
| Educação / Problema-dor | TOFU | How-to, Pergunta Provocativa, Número/Lista | Pergunta provocativa, Dor, How-to |
| Produto / Solução | MOFU | Contrarian, Dados, How-to | Autoridade, Número, Contrarian |
| Cases / Resultados | BOFU | Story, Autoridade, Antes/Depois | Story, Autoridade, FOMO |
| Bastidores / Cultura | TOFU | Story, Contrarian, Perspectiva única | Story, Pergunta provocativa, Contrarian |
| Setor / Tendências | TOFU/MOFU | Dados, Contrarian, Provocação | Número, Contrarian, FOMO |
| Metodologia / Framework | MOFU | How-to, Dados, Autoridade | Autoridade, How-to, Número |
| Comunidade / UGC | TOFU/BOFU | Story, Pergunta Provocativa, Antes/Depois | Story, FOMO, Pergunta provocativa |

**Como usar na sugestão de pilares:**
1. Identificar o tipo mais próximo para cada pilar gerado
2. Usar os ângulos e hook categories como valor inicial dos campos
3. Adaptar se o contexto da empresa sugerir algo diferente (ex: marca provocativa → dar peso extra a Contrarian)

---

## Peso Sugerido por Posição do Pilar

Usar como valor default ao sugerir o campo `Peso no mix` de cada pilar.

| Posição | Tipo | Peso sugerido |
|---|---|---|
| Pilar principal | Endereça a dor primária da persona + gap de mercado | 30–40% |
| Pilar de produto | Features, soluções, diferenciadores | 20–25% |
| Pilares de suporte | Bastidores, setor, cases, comunidade | Dividir o restante igualmente |

**Regra de consistência:** a soma dos pesos deve fechar em 100%. Com 4 pilares: 35% + 25% + 20% + 20%. Com 5 pilares: 30% + 25% + 15% + 15% + 15%.

Ajustar se o usuário indicar que um pilar secundário tem importância estratégica maior (ex: cases como prova social intensiva → elevar para 25%).

---

## Plataformas Primárias por Tipo de Pilar

Usar como valor default ao sugerir o campo `Plataformas primárias` de cada pilar. Ajustar se AUDIENCE_PROFILES indicar plataformas diferentes.

| Tipo de pilar | Plataformas naturais | Motivo |
|---|---|---|
| Educação / Problema-dor | LinkedIn, Blog, YouTube | Conteúdo longo e aprofundado tem maior tração aqui |
| Produto / Solução | LinkedIn, Instagram Feed | Demonstrações visuais e autoridade profissional |
| Cases / Resultados | LinkedIn, Instagram Feed, Blog | Prova social precisa de espaço para narrar |
| Bastidores / Cultura | Instagram Stories/Reels, TikTok | Conteúdo de nos bastidores é nativo do vertical |
| Setor / Tendências | LinkedIn, X/Twitter | Discussão e repercussão de novidades |
| Metodologia / Framework | LinkedIn, Blog, YouTube | Profundidade de conteúdo e SEO |
| Comunidade / UGC | Instagram, TikTok | Conteúdo participativo e de identificação |

**Nota:** Se o COMPANY_PROFILE indicar plataformas prioritárias específicas, priorizar sempre essa informação sobre o mapa acima.

---

## Objetivo de Conversão por Estágio de Funil

Usar para sugerir automaticamente o campo `Objetivo do pilar` com base no estágio de funil predominante do pilar.

| Estágio | Objetivo sugerido | CTA típico |
|---|---|---|
| TOFU | Awareness | "Salva para ler depois", "Segue para mais", "Compartilha com quem precisa" |
| MOFU | Autoridade / Geração de leads | "Baixa o material", "Comenta sua dúvida", "Acessa o link na bio" |
| BOFU | Conversão direta | "Agenda uma demo", "Começa o teste grátis", "Fala com a gente" |
| TOFU/MOFU misto | Autoridade | "Salva", "Comenta", "Segue" |
| MOFU/BOFU misto | Geração de leads | "Acessa o link", "Agenda" |
