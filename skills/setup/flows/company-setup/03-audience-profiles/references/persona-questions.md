# Banco de Perguntas — Persona e Audiência

> **Uso:** Repositório de perguntas organizadas por dimensão para as Skills 4.1, 4.2 e 4.3.
> Cada pergunta tem: o que perguntar, por que perguntar, sugestão automática e skill responsável.
>
> **Regra de Ouro:** Antes de fazer P0.1, P0.2 e P0.3, a skill deve ler `PRODUCT_CONTEXT.md` e `BRAND_VOICE.md`.
> Se alguma informação já estiver documentada, usar como resposta pré-preenchida e apenas pedir confirmação — nunca repetir informação existente.

---

## Classificação de Prioridade (para modo startup)

Quando `perfil: startup` no `SETUP_STATE.md` (ver `skills/setup/flows/company-setup/00-orchestrator/references/startup-mode.md`), a Skill 4.3 aplica priorização dinâmica: faz apenas as **6 Críticas**, auto-infere as Complementares e Avançadas a partir do contexto (campos reservados do AUDIENCE_SESSION_STATE, rascunho da 4.2, PRODUCT_CONTEXT).

### Tabela Mestre — Skill 4.3 (Pain-Desire Mapper)

| Nível | Pergunta | Por que é desse nível |
|-------|----------|----------------------|
| **🔴 Crítica** | **P4.1** — Dor central em uma frase (linguagem dela) | Resumo acionável; alimenta copy BOFU |
| **🔴 Crítica** | **P4.4** — O que já tentou? | Revela objeções implícitas e diferencial real |
| **🔴 Crítica** | **P5.1** — Vida se o problema for resolvido | Base do desejo funcional (JTBD) |
| **🔴 Crítica** | **P5.4** — Desejo de identidade (quem ela quer SER) | Camada mais valiosa para copy emocional |
| **🔴 Crítica** | **P7.4** — O que a faz hesitar (Ring 3 — Barreira) | Objeção principal a derrubar |
| **🔴 Crítica** | **P8.1** — Palavras exatas que ela usa | Material bruto para hooks e headlines |
| 🟡 Complementar | P3.8 — Varinha mágica (mudaria UMA coisa) | Redundante com P5.1 para primeira versão |
| 🟡 Complementar | P4.2 — Custo real (financeiro, tempo, energia) | Inferível pela dor + cargo |
| 🟡 Complementar | P4.3 — Pior cenário se não resolver | Inferível pela Camada 2 |
| 🟡 Complementar | P4.5 — Por que tentativas anteriores falharam | Inferível de P4.4 |
| 🟡 Complementar | P4.9 — Dor que ela normalizou | Avançado, raramente crítico |
| 🟡 Complementar | P5.2 — Quem ela quer que perceba a mudança | Útil mas inferível do cargo + geração |
| 🟡 Complementar | P6.1 — Job Funcional (JTBD) | Inferível da P5.1 + PRODUCT_CONTEXT |
| 🟡 Complementar | P6.2 — Job Emocional | Inferível da P5.4 |
| 🟡 Complementar | P6.3 — Job Social | Inferível da P5.2 + P5.4 |
| 🟡 Complementar | P7.5 — Ring 5 (o que tornaria a decisão óbvia) | Inferível do Ring 3 invertido |
| 🟡 Complementar | P7.6 — O que ela considera "valor real" | Inferível por perfil (cargo + pricing tier) |
| 🟡 Complementar | P8.2 — Palavras que a afastam | Inferível pelo BRAND_VOICE anti-padrões |
| 🔵 Avançada | P7.7 — Dealbreaker absoluto | Refinamento — fase de otimização |
| 🔵 Avançada | P7.8 — Reação ao preço | Inferível pelo % da renda estimada |
| 🔵 Avançada | P5.5 — Dia ideal em 12 meses | Nice-to-have; Desejo de Identidade (P5.4) já cobre o núcleo |

### Regra de execução

**Se `startup_mode: true`:**
1. Fazer apenas as 6 Críticas (P4.1, P4.4, P5.1, P5.4, P7.4, P8.1).
2. Auto-inferir todas as Complementares a partir de:
   - Rascunho da Skill 4.2 (Seção 2 do AUDIENCE_*.md)
   - Campos reservados do AUDIENCE_SESSION_STATE (`p2_6_pesquisas_noturnas`, `p2_7_vergonha`, `p2_8_jantar_bem_sucedidos`, `p3_9_narrativa_interna`)
   - PRODUCT_CONTEXT (problema, anti-persona, preço)
3. Marcar cada campo auto-inferido como `[H]-pendente`.
4. Pular as 3 Avançadas (P7.7, P7.8, P5.5) — documentar como "a validar em campo".

**Se `startup_mode: false` (empresa consolidada):**
- Críticas + Complementares obrigatórias (20 perguntas).
- Avançadas opcionais após as 20.

**Exceção:** Se `p2_7_vergonha` OU `p3_9_narrativa_interna` estiverem vazios no AUDIENCE_SESSION_STATE ao iniciar 4.3, adicionar P2.7 e/ou P3.9 como 7ª/8ª Crítica contextual (sem essas âncoras, a Camada 3 fica rasa).

### Progresso visível ao usuário

Em modo startup, mostrar:
> "Pergunta **3 de 6** (essenciais). Depois disso, sua persona já é usável para copy e conteúdo."

Em modo padrão:
> "Pergunta **7 de 20** (essenciais + complementares). Avançadas são opcionais no final."

---

## Dimensão 0 — Autoconhecimento do Produto (Pré-skill / Contexto)

> Estas perguntas revelam os limites do produto e o posicionamento estratégico. Influenciam diretamente todas as perguntas seguintes.

### P0.1 — Qual cliente você RECUSARIA mesmo que pagasse o dobro?
> "Existe algum perfil de cliente que, mesmo pagando caro, você preferiria não ter? Quais as características desse cliente que você ativamente evita?"

**Por que perguntar:** Delimitar o cliente ideal pelo contorno negativo é tão poderoso quanto descrevê-lo positivamente.
**Sugestão automática:** Com base no modelo de negócio → "Clientes que precisam de resultado em menos de 30 dias", "Empresas sem produto validado", "Clientes que querem microgerenciar"
**Skill:** 4.1

---

### P0.2 — Qual crença comum no seu mercado você discorda ativamente?
> "Tem alguma 'verdade universal' que o seu mercado repete, mas que você acredita que está errada ou incompleta?"

**Por que perguntar:** A crença que o usuário combate é a base do posicionamento diferenciado.
**Sugestão automática:** Nenhuma — resposta precisa vir do usuário.
**Skill:** 4.1

---

### P0.3 — Se seu produto/serviço fosse uma pessoa, quem seria?
> "Descreva a personalidade do seu produto como se fosse um indivíduo: como ele fala, o que defende, o que nunca diria."

**Por que perguntar:** Conecta o produto ao BRAND_VOICE e calibra o tom das skills seguintes.
**Sugestão automática:** Com base no arquétipo do BRAND_VOICE → sugerir traços de personalidade compatíveis.
**Skill:** 4.1, 4.2

---

## Dimensão 1 — Identificação do Público-Alvo (Skill 4.1)

### P1.1 — Quem se beneficia mais do produto?
> "Se você pudesse escolher qual tipo de cliente é o mais fácil de atender E o mais lucrativo, quem seria?"

**Por que perguntar:** Força o usuário a pensar em valor e fit, não só em "todo mundo que tem o problema".
**Sugestão automática:** Com base no problema central → "Provavelmente pessoas/empresas que [situação específica]"
**Skill:** 4.1

---

### P1.2 — Esse público compra por conta própria ou precisa de aprovação?
> "Quem decide a compra? É a mesma pessoa que vai usar o produto?"

**Por que perguntar:** Em B2B, decisor e usuário muitas vezes são pessoas diferentes com dores completamente distintas.
**Sugestão automática:** Se pricing > R$2.000/mês → provavelmente envolve aprovação de gestor ou diretoria.
**Skill:** 4.1

---

### P1.3 — Qual é o denominador comum entre seus melhores clientes?
> "Seus clientes mais satisfeitos, que obtiveram mais resultado — o que eles têm em comum?"

**Por que perguntar:** O padrão dos melhores clientes revela o público-alvo ideal.
**Sugestão automática:** "Com base no tipo de produto, os melhores clientes provavelmente têm em comum: [característica ligada ao problema central]"
**Skill:** 4.1

---

### P1.4 — Existe um público que você NÃO quer atender?
> "Existe algum perfil de cliente que gera mais dor de cabeça, churn ou problemas? Quem você preferiria não ter?"

**Por que perguntar:** Delimitar quem NÃO é o público é tão importante quanto definir quem é.
**Sugestão automática:** Nenhuma — precisa vir do usuário.
**Skill:** 4.1

---

### P1.5 — Quais são os 2-3 grupos mais distintos que compram de você?
> "Se você dividisse seus clientes em grupos pelo perfil ou pela forma como usam o produto, quais grupos identificaria?"

**Por que perguntar:** Revela se existe mais de um público-alvo com jornadas diferentes.
**Sugestão automática:** "Com base no seu produto, é comum ter: [grupo 1 típico] e [grupo 2 típico]. Faz sentido?"
**Skill:** 4.1

---

## Dimensão 2 — Perfil Demográfico e Socioeconômico (Skill 4.2)

### P2.1 — Qual é a faixa etária predominante?
> "Se você tivesse que estimar, qual seria a faixa de idade da maioria dos seus clientes?"

**Sugestão automática:** Com base no setor e tipo de produto → sugerir faixa etária típica.
**Skill:** 4.2

---

### P2.2 — Qual é o cargo ou função típica?
> "Qual é o título de cargo mais comum? E qual é o nível hierárquico (operacional, gerência, diretoria, C-level)?"

**Sugestão automática:** Com base no pricing e tipo de produto → sugerir nível hierárquico mais provável.
**Skill:** 4.2

---

### P2.3 — Qual é a renda ou orçamento típico?
> "Quanto essa pessoa ganha por mês (B2C) ou qual é o orçamento que ela gerencia (B2B)?"

**Sugestão automática:** Com base no pricing → estimar faixa de renda compatível (produto não deve custar mais de 5-10% da renda disponível para compra impulsiva; até 20% para decisão planejada).
**Skill:** 4.2

---

### P2.4 — Em que contexto (empresa/vida) essa persona está inserida?
> "Como é a empresa onde ela trabalha? (tamanho, cultura, crescimento, setor) — ou, para B2C, como é a vida dela fora do trabalho?"

**Sugestão automática:** Se B2B para PMEs → "Provavelmente trabalha em empresa de 10-100 pessoas, com equipe enxuta e usa múltiplos chapéus"
**Skill:** 4.2

---

### P2.5 — Qual é o nível de escolaridade?
> "Qual é a formação acadêmica típica? Isso impacta no vocabulário que ela usa e espera receber."

**Sugestão automática:** Com base no setor e cargo → sugerir formação típica.
**Skill:** 4.2

---

### P2.6 — O que esse público pesquisa às 23h quando está sozinho?
> "Quando a persona está sozinha, sem filtro social — tarde da noite — o que ela pesquisa? Que perguntas faz ao Google?"

**Por que perguntar:** As pesquisas feitas a sós revelam medos, desejos e inseguranças reais sem autocensura.
**Sugestão automática:** Com base nas dores e cargo → "como saber se minha empresa vai quebrar", "vale a pena contratar [X]", "sinais de que você não é bom o suficiente para [cargo]"
**Skill:** 4.2, 4.3

---

### P2.7 — Do que essa persona tem vergonha em relação ao problema?
> "Existe algum aspecto do problema que ela sente vergonha de admitir — para a equipe, chefe, cônjuge, ou até para si mesma?"

**Por que perguntar:** Vergonha é o medo de reputação não declarado. Comunicação que toca essa camada com delicadeza cria conexão emocional profunda.
**Sugestão automática:** Por cargo → "Gestores têm vergonha de não entender os próprios relatórios", "Empreendedores têm vergonha de admitir que consideram desistir"
**Skill:** 4.3

---

### P2.8 — O que ela NÃO contaria num jantar com amigos bem-sucedidos?
> "Se essa persona estivesse num jantar com pessoas que admira, o que sobre o negócio ou situação profissional ela omite ou esconde?"

**Por que perguntar:** O gap entre a aparência projetada e a realidade vivida é ouro estratégico.
**Sugestão automática:** Nenhuma — específica demais para sugestão automática.
**Skill:** 4.3

---

### P2.10 — A qual geração essa persona pertence?
> "Com base na faixa etária identificada, qual é a geração dessa persona?"

**Mapeamento automático:**
- Até ~13 anos (2013+): **Gen Alpha** — nativos do YouTube e Roblox
- 14–28 anos (1997–2012): **Gen Z** — TikTok, memes, autenticidade
- 29–44 anos (1981–1996): **Millennial** — Instagram, nostalgia anos 90/00, digital-fluente
- 45–60 anos (1965–1980): **Gen X** — Facebook/LinkedIn, pragmáticos, céticos
- 60+ anos (antes de 1965): **Baby Boomer** — WhatsApp, televisão, comunicação formal

**Skill:** 4.2

---

## Dimensão 3 — Psicografia e Valores (Skill 4.2)

### P3.1 — Quais são os 3 valores que guiam essa persona?
> "O que é inegociável para ela? O que ela nunca abriria mão mesmo sob pressão?"

**Sugestão automática:** Com base no arquétipo do BRAND_VOICE e no setor → sugerir valores compatíveis.
**Skill:** 4.2

---

### P3.2 — Como essa persona se relaciona com mudança e novidade?
> "Ela é early adopter (testa tudo novo) ou late majority (espera a prova social antes de adotar)?"

**Sugestão automática:** Se produto é inovador/tecnológico → early adopter mais provável; se produto é solução estabelecida → late majority mais receptivo.
**Skill:** 4.2

---

### P3.3 — Quem essa persona admira ou segue?
> "Quem são as referências profissionais dela? Que criadores de conteúdo, especialistas ou líderes ela acompanha?"

**Sugestão automática:** Com base no setor → sugerir tipos de referências típicas.
**Skill:** 4.2

---

### P3.4 — O que essa persona faz para crescer profissionalmente?
> "Ela lê livros? Faz cursos? Vai a eventos? Consome podcasts?"

**Sugestão automática:** Cruzar com canais do COMPANY_PROFILE para identificar possíveis pontos de encontro.
**Skill:** 4.2

---

### P3.5 — Como essa persona se identifica profissionalmente?
> "Se você pedisse para ela se apresentar em 30 segundos, o que ela diria?"

**Sugestão automática:** Com base no cargo e setor → sugerir identidade típica.
**Skill:** 4.2

---

### P3.6 — Em uma frase, o que essa persona diria sobre a própria vida?
> "Se ela tivesse que resumir onde está agora em uma frase honesta dita para uma amiga próxima, qual seria?"

**Sugestão automática:** Com base nas dores → "Eu amo o que faço, mas às vezes sinto que estou enxugando gelo"
**Skill:** 4.2

---

### P3.7 — Como é a rotina típica dela do acordar ao dormir?
> "Descreva um dia comum: que horas acorda, primeiras ações, manhã, almoço, tarde, noite, com que pensamento dorme."

**Sugestão automática:** Com base no cargo e contexto → esboçar rotina típica para o usuário validar.
**Skill:** 4.2

---

### P3.8 — Se pudesse mudar UMA coisa no trabalho ou vida, o que seria?
> "Uma varinha mágica. Uma mudança. Sem custo, sem risco. O que ela mudaria primeiro?"

**Sugestão automática:** Com base no problema central → sugerir a mudança que o produto poderia representar, na perspectiva dela.
**Skill:** 4.3

---

### P3.9 — O que ela conta para si mesma sobre por que o problema ainda existe?
> "Qual é a narrativa interna que explica por que o problema persiste? ('É porque não tenho tempo', 'É porque o mercado está difícil')"

**Sugestão automática:** Por tipo de problema → "Profissionais sobrecarregados se culpam por falta de organização", "Empreendedores em platô geralmente atribuem ao mercado ou à equipe"
**Skill:** 4.3

---

### P3.13 — Quais são os gostos e hobbies dessa persona?
> "O que ela faz nas horas livres? O que a entusiasma fora do trabalho?"

**Sugestão automática:** Com base na geração, cargo e contexto socioeconômico → Millennials de classe B em gestão: viagens internacionais, gastronomia, academia, séries; Gen Z empreendedor: games, tecnologia, moda streetwear.
**Skill:** 4.2

---

### P3.14 — Quais referências culturais e de entretenimento essa persona carrega?
> "Que filmes, séries, músicas ou personagens fazem parte do repertório cultural dela?"

**Sugestão automática por geração:**
- **Gen Z (14–28):** Minecraft, TikTok trends, animes (Demon Slayer, JJK), memes de Internet
- **Millennial (29–44):** Chaves, Dragon Ball, Pokémon, Naruto, MSN, Orkut, Friends, Lost
- **Gen X (45–60):** He-Man, Hanna-Barbera, Looney Tunes, cinema anos 80-90
- **Baby Boomer (60+):** TV em preto e branco, Jovem Guarda, clássicos do cinema nacional

**Skill:** 4.2

---

## Dimensão 7 — Comportamento de Compra (Skill 4.2 e 4.4)

### P7.1 — Qual foi o evento gatilho que fez ela buscar solução?
> "O que aconteceu que fez ela sair de 'vou resolver isso algum dia' para 'preciso resolver isso agora'?"

**Sugestão automática:** Por tipo de produto → "Gatilhos típicos para esse segmento incluem: [lista]"
**Skill:** 4.2, 4.4

---

### P7.2 — Como ela pesquisa antes de comprar?
> "Quando precisa resolver um problema assim, o que ela faz? Google? Pergunta para colegas? Grupo de WhatsApp? LinkedIn?"

**Sugestão automática:** Por faixa etária e setor → sugerir comportamento de pesquisa típico.
**Skill:** 4.2

---

### P7.3 — Quem mais influencia a decisão?
> "Antes de comprar, ela conversa com alguém? Quem tem poder de veto? Quem valida a escolha?"

**Sugestão automática:** Se cargo é gerência → provavelmente há influência de diretoria e validação de equipe.
**Skill:** 4.2, 4.4

---

### P7.4 — O que pode paralisá-la no momento de decidir?
> "Ela está convencida, mas algo a faz hesitar. O que é?"

**Sugestão automática:** Por pricing tier → "Para produtos nessa faixa de preço, as barreiras mais comuns são: [lista]"
**Skill:** 4.3, 4.4

---

### P7.5 — O que tornaria a decisão óbvia para ela?
> "Se você pudesse dar a ela uma coisa que removesse toda a dúvida, o que seria? (garantia, caso idêntico ao dela, demo)"

**Sugestão automática:** Com base nos medos mapeados → sugerir tipo de prova social que endereça o medo específico.
**Skill:** 4.3, 4.4

---

### P7.6 — O que essa persona considera "valor real"?
> "Quando ela avalia se algo vale o preço, o que ela está pesando? ROI mensurável? Paz de espírito? Status da escolha?"

**Sugestão automática por perfil:**
- C-level/Diretoria → resultado estratégico + não precisar microgerenciar
- Gerência → resultado comprovável + facilidade de justificar para cima
- Empreendedor → resultado rápido + relação custo/benefício clara
- Operacional → facilidade de usar + suporte confiável

**Skill:** 4.3, 4.4

---

## Dimensão 8 — Comunicação e Linguagem (Skill 4.2)

### P8.1 — Quais são as palavras exatas que ela usa para descrever o problema?
> "Se ela estivesse falando com um amigo sobre esse problema, como descreveria? Que palavras usaria?"

**Por que perguntar:** A linguagem literal da persona é o material bruto dos hooks, headlines e CTAs mais eficientes.
**Sugestão automática:** Com base no problema central → sugerir frases típicas do segmento.
**Skill:** 4.2

---

### P8.2 — Quais palavras ou frases a afastariam imediatamente?
> "Existe algum vocabulário que ela odeia, que parece falso ou que soa como 'papo de vendedor'?"

**Sugestão automática:** Por arquétipo de BRAND_VOICE e setor → listar vocabulário que gera rejeição.
**Skill:** 4.2

---

### P8.3 — Qual é o tom que ela espera?
> "Quando ela consome conteúdo sobre esse tema, prefere linguagem técnica, acessível, direta, inspiracional?"

**Sugestão automática:** Cruzar com os tons do BRAND_VOICE para verificar alinhamento.
**Skill:** 4.2

---

### P8.4 — Quais canais não-sociais ela usa?
> "Além das redes sociais: ela abre emails de marcas? Assina newsletters? Ouve podcast? Vai a eventos?"

**Sugestão automática por geração:**
- Boomers: email, WhatsApp grupos, eventos presenciais
- Gen X: email, podcast de negócios, LinkedIn newsletter, eventos de setor
- Millennials: newsletter de nicho, podcast, email, YouTube como aprendizado
- Gen Z: YouTube, Discord, Twitch — email é irrelevante

**Skill:** 4.2

---

### P8.5 — Que formato de conteúdo ela realmente consome?
> "Ela assiste vídeos longos ou só reels? Lê artigos completos ou só cabeçalhos? Prefere áudio?"

**Sugestão automática:** Por faixa etária e contexto de uso → sugerir formatos preferidos.
**Skill:** 4.2

---

### P8.6 — Quais redes sociais essa persona usa e como ela usa cada uma?
> "Para cada plataforma que usa: com que frequência? Com qual intenção? (entretenimento, informação, networking, inspiração)"

**Mapa padrão por geração:**

| Plataforma | Gen Z (14–28) | Millennial (29–44) | Gen X (45–60) | Boomer (60+) |
|------------|--------------|-------------------|--------------|--------------|
| Instagram | Principal | Principal | Secundário | Raramente |
| TikTok | Principal | Crescente | Raramente | Não |
| YouTube | Principal | Principal | Principal | Crescente |
| LinkedIn | Profissional | Principal (profissional) | Principal | Secundário |
| Facebook | Não | Grupos/eventos | Principal | Principal |
| Twitter/X | Nicho/debates | Nicho | Nicho | Raramente |
| WhatsApp | Mensagens | Principal (grupos) | Principal | Principal |

**Skill:** 4.2

---

### P8.7 — Que tipo de conta/perfil ela segue em cada plataforma?
> "No Instagram, quem ela segue: especialistas, influencers de lifestyle, marcas, amigos, humor, notícias?"

**Por que perguntar:** O tipo de conta seguida revela a função que cada plataforma tem na vida da persona.
**Sugestão automática:** Com base na geração e cargo → sugerir padrão de consumo por plataforma.
**Skill:** 4.2
