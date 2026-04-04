# Banco de Perguntas — Audience Mapping Framework

**Objetivo:** Repositório completo de perguntas organizadas por dimensão.  
Cada pergunta tem: **por que perguntar**, **sugestão automática que a IA pode gerar** e **onde usar** (qual skill).

---

## Dimensão 0 — Autoconhecimento do Produto (Pré-skill / Contexto)

> Estas perguntas devem ser respondidas antes de iniciar o mapeamento de público-alvo. Elas revelam os limites do produto e o posicionamento estratégico, que influenciam diretamente todas as perguntas seguintes.

> **⚠️ Verificar antes de perguntar:** Antes de fazer P0.1, P0.2 e P0.3, a skill deve ler `PRODUCT_CONTEXT.md` e `BRAND_VOICE.md`. Se alguma dessas informações já estiver documentada — anti-persona em PRODUCT_CONTEXT, arquétipo de personalidade em BRAND_VOICE — usar como resposta pre-preenchida e apenas pedir confirmação. Não repetir informação que já existe.

---

### P0.1 — Qual cliente você RECUSARIA mesmo que pagasse o dobro?
> "Existe algum perfil de cliente que, mesmo pagando caro, você preferiria não ter? Quais as características desse cliente que você ativamente evita?"

**Por que perguntar:** Delimitar o cliente ideal pelo seu contorno negativo é tão poderoso quanto descrevê-lo positivamente. A anti-persona revela os valores e limites da empresa.  
**Sugestão automática:** Com base no modelo de negócio → sugerir anti-personas típicas: "Clientes que precisam de resultado em menos de 30 dias", "Empresas sem produto validado", "Clientes que querem microgerenciar"  
**Skill:** 4.1

---

### P0.2 — Qual crença comum no seu mercado você discorda ativamente?
> "Tem alguma 'verdade universal' que o seu mercado repete, mas que você acredita que está errada ou que é incompleta? Qual seria a sua versão da verdade?"

**Por que perguntar:** A crença que o usuário combate é a base do posicionamento diferenciado. Ela define o "stake in the ground" e o ponto de vista proprietário da marca.  
**Sugestão automática:** Nenhuma — essa resposta precisa vir do usuário, pois é profundamente específica ao posicionamento  
**Skill:** 4.1 (complementa o contexto estratégico de diferenciação)

---

### P0.3 — Se seu produto/serviço fosse uma pessoa, quem seria?
> "Descreva a personalidade do seu produto como se fosse um indivíduo: como ele fala, o que defende, o que nunca diria, com quem se pareceria."

**Por que perguntar:** Conecta o produto ao BRAND_VOICE e revela se há coerência entre a personalidade da marca e o que é vendido. Também ajuda a calibrar o tom das skills seguintes.  
**Sugestão automática:** Com base no arquétipo do BRAND_VOICE → sugerir traços de personalidade compatíveis  
**Skill:** 4.1, 4.2 (calibra tom das personas)

---

## Dimensão 1 — Identificação do Público-Alvo (Skill 4.1)

### P1.1 — Quem se beneficia mais do produto?
> "Se você pudesse escolher qual tipo de cliente é o mais fácil de atender E o mais lucrativo, quem seria?"

**Por que perguntar:** Força o usuário a pensar em valor e fit, não só em "todo mundo que tem o problema"  
**Sugestão automática:** Com base no problema central do PRODUCT_CONTEXT, sugerir: "Provavelmente pessoas/empresas que [situação específica do problema]"  
**Skill:** 4.1

---

### P1.2 — Esse público compra por conta própria ou precisa de aprovação?
> "Quem decide a compra? É a mesma pessoa que vai usar o produto?"

**Por que perguntar:** Em B2B, o decisor e o usuário muitas vezes são pessoas diferentes com dores e motivações completamente distintas  
**Sugestão automática:** Se pricing > R$2.000/mês → provavelmente envolve aprovação de gestor ou diretoria  
**Skill:** 4.1

---

### P1.3 — Qual é o denominador comum entre seus melhores clientes?
> "Seus clientes mais satisfeitos, que obtiveram mais resultado — o que eles têm em comum?"

**Por que perguntar:** O padrão dos melhores clientes revela o público-alvo ideal  
**Sugestão automática:** "Com base no tipo de produto, os melhores clientes provavelmente têm em comum: [característica ligada ao problema central]"  
**Skill:** 4.1

---

### P1.4 — Existe um público que você NÃO quer atender?
> "Existe algum perfil de cliente que gera mais dor de cabeça, churn ou problemas? Quem você preferiria não ter?"

**Por que perguntar:** Delimitar quem NÃO é o público é tão importante quanto definir quem é  
**Sugestão automática:** Nenhuma — essa resposta precisa vir do usuário  
**Skill:** 4.1

---

### P1.5 — Quais são os 2-3 grupos mais distintos que compram de você?
> "Se você dividisse seus clientes em grupos pelo perfil ou pela forma como usam o produto, quais grupos identificaria?"

**Por que perguntar:** Revela se existe mais de um público-alvo com jornadas diferentes  
**Sugestão automática:** "Com base no seu produto, é comum ter: [grupo 1 típico do segmento] e [grupo 2 típico]. Faz sentido?"  
**Skill:** 4.1

---

## Dimensão 2 — Perfil Demográfico e Socioeconômico (Skill 4.2)

### P2.1 — Qual é a faixa etária predominante?
> "Se você tivesse que estimar, qual seria a faixa de idade da maioria dos seus clientes? E qual seria a mais valiosa?"

**Por que perguntar:** Idade muda radicalmente o contexto de vida, referências culturais e comportamento digital  
**Sugestão automática:** Com base no setor e tipo de produto, sugerir faixa etária típica  
**Skill:** 4.2

---

### P2.2 — Qual é o cargo ou função típica?
> "Qual é o título de cargo mais comum nos seus clientes? E qual é o nível hierárquico (operacional, gerência, diretoria, C-level)?"

**Por que perguntar:** Cargo define autonomia de decisão, vocabulário, pressões e métricas que importam  
**Sugestão automática:** Com base no pricing e tipo de produto → sugerir nível hierárquico mais provável  
**Skill:** 4.2

---

### P2.3 — Qual é a renda ou orçamento típico?
> "Quanto essa pessoa ganha por mês (B2C) ou qual é o orçamento que ela gerencia (B2B)?"

**Por que perguntar:** A renda calibra como a persona percebe o preço do produto — caro ou investimento razoável  
**Sugestão automática:** Com base no pricing do produto → estimar faixa de renda compatível (produto não deve custar mais de 5-10% da renda disponível para compra impulsiva; até 20% para decisão planejada)  
**Skill:** 4.2

---

### P2.4 — Em que contexto (empresa/vida) essa persona está inserida?
> "Como é a empresa onde ela trabalha? (tamanho, cultura, crescimento, setor) — ou, para B2C, como é a vida dela fora do trabalho?"

**Por que perguntar:** Contexto organizacional ou de vida define as restrições e possibilidades da persona  
**Sugestão automática:** Se B2B e produto é para PMEs → "Provavelmente ela trabalha em empresa de 10-100 pessoas, com equipe enxuta e usa múltiplos chapéus"  
**Skill:** 4.2

---

### P2.5 — Qual é o nível de escolaridade?
> "Qual é a formação acadêmica típica? Isso impacta no vocabulário que ela usa e espera receber."

**Por que perguntar:** Calibra complexidade da linguagem e nível de jargão aceitável  
**Sugestão automática:** Com base no setor e cargo → sugerir formação típica  
**Skill:** 4.2

---

### P2.6 — O que esse público pesquisa às 23h quando está sozinho?
> "Quando a persona está sozinha, sem filtro social — tarde da noite, sem precisar se justificar para ninguém — o que ela pesquisa? Que perguntas faz ao Google? Que vídeos assiste?"

**Por que perguntar:** As pesquisas feitas a sós revelam os medos, desejos e inseguranças reais — sem a autocensura que existe em grupos ou entrevistas formais. É o material mais honesto disponível.  
**Sugestão automática:** Com base nas dores e cargo → sugerir buscas típicas: "como saber se minha empresa vai quebrar", "vale a pena contratar [X]", "sinais de que você não é bom o suficiente para [cargo]"  
**Skill:** 4.2, 4.3

---

### P2.7 — Do que essa persona tem vergonha em relação ao problema?
> "Existe algum aspecto do problema que ela sente vergonha de admitir — para a equipe, para o chefe, para o cônjuge, ou até para si mesma? O que ela nunca diria em voz alta sobre a situação?"

**Por que perguntar:** Vergonha é o medo de reputação não declarado. Comunicação que toca essa camada com delicadeza cria conexão emocional profunda e imediata.  
**Sugestão automática:** Por cargo/contexto → "Gestores têm vergonha de não entender os próprios relatórios", "Empreendedores têm vergonha de admitir que consideram desistir", "Profissionais sênior têm vergonha de pedir ajuda"  
**Skill:** 4.3

---

### P2.8 — O que ela NÃO contaria num jantar com amigos bem-sucedidos?
> "Se essa persona estivesse num jantar com pessoas que ela admira ou que considera bem-sucedidas, o que sobre o negócio ou situação profissional ela omite ou esconde?"

**Por que perguntar:** O gap entre a aparência que a persona projeta e a realidade que vive é ouro estratégico. Comunicação que valida essa realidade (sem expô-la) cria uma conexão de 'você me entende'.  
**Sugestão automática:** Nenhuma — essa resposta é específica demais para sugestão automática. Deve ser construída no diálogo.  
**Skill:** 4.3

---

### P2.9 — Em que grupo de pessoas ela quer se encaixar?
> "Qual é o grupo social ou profissional em que essa persona sonha fazer parte? Quem ela seguiria, quais eventos frequentaria, com quem ela se compararia para saber se está 'chegando lá'?"

**Por que perguntar:** Identidade aspiracional de pertencimento é uma das motivações de compra mais fortes. Pessoas compram produtos que as aproximam do grupo em que querem estar.  
**Sugestão automática:** Por cargo e mercado → "Empreendedores de tecnologia querem entrar no grupo de 'fundadores que escalaram'", "Gestores de marketing querem ser vistos pelos outros gestores como estratégicos (não operacionais)"  
**Skill:** 4.2, 4.3

---

### P2.10 — A qual geração essa persona pertence?
> "Com base na faixa etária identificada, qual é a geração dessa persona? (Baby Boomer / Gen X / Millennial / Gen Z / Gen Alpha)"

**Por que perguntar:** A geração molda comportamento digital, plataformas preferidas, referências culturais, relação com tecnologia e estilo de tomada de decisão. Identificar a geração permite usar o guia de gerações para preencher automaticamente dezenas de atributos comportamentais.  
**Sugestão automática:** Com base na faixa etária (P2.1) → mapear automaticamente:
- Até ~13 anos (2013+): **Gen Alpha** — nativos do YouTube e Roblox
- 14–28 anos (1997–2012): **Gen Z** — TikTok, memes, autenticidade
- 29–44 anos (1981–1996): **Millennial** — Instagram, nostalgia dos anos 90/00, digital-fluente
- 45–60 anos (1965–1980): **Gen X** — Facebook/LinkedIn, pragmáticos, céticos
- 60+ anos (antes de 1965): **Baby Boomer** — WhatsApp, televisão, comunicação formal

> Consultar `references/generations-guide.md` para o mapa completo de comportamentos, plataformas e referências culturais por geração.

**Skill:** 4.2

---

## Dimensão 3 — Psicografia e Valores (Skill 4.2)

### P3.1 — Quais são os 3 valores que guiam essa persona?
> "O que é inegociável para ela? O que ela nunca abriria mão mesmo sob pressão?"

**Por que perguntar:** Valores determinam como a persona avalia qualquer proposta — o produto precisa ser compatível com os valores dela  
**Sugestão automática:** Com base no arquétipo do BRAND_VOICE e no setor → sugerir valores compatíveis  
**Skill:** 4.2

---

### P3.2 — Como essa persona se relaciona com mudança e novidade?
> "Ela é early adopter (testa tudo novo) ou late majority (espera a prova social antes de adotar)?"

**Por que perguntar:** Define qual argumento funciona: inovação vs. segurança vs. prova social  
**Sugestão automática:** Se produto é inovador/tecnológico → a persona mais provável é early adopter; se produto é solução estabelecida → late majority mais receptivo  
**Skill:** 4.2

---

### P3.3 — Quem essa persona admira ou segue?
> "Quem são as referências profissionais dela? Que criadores de conteúdo, especialistas ou líderes ela acompanha?"

**Por que perguntar:** Revela onde influenciar (canal) e como ser visto como autoridade (associação com referências conhecidas)  
**Sugestão automática:** Com base no setor → sugerir tipos de referências típicas  
**Skill:** 4.2

---

### P3.4 — O que essa persona faz para crescer profissionalmente?
> "Ela lê livros? Faz cursos? Vai a eventos? Consome podcasts? Como ela investe em si mesma?"

**Por que perguntar:** Revela disposição para aprender E onde encontrá-la  
**Sugestão automática:** Cruzar com canais do COMPANY_PROFILE para identificar possíveis pontos de encontro  
**Skill:** 4.2

---

### P3.5 — Como essa persona se identifica profissionalmente?
> "Se você pedisse para ela se apresentar em 30 segundos, o que ela diria? Qual é a identidade que ela projeta?"

**Por que perguntar:** A identidade profissional projetada é diferente da identidade real — e ambas importam para a comunicação  
**Sugestão automática:** Com base no cargo e setor → sugerir identidade típica  
**Skill:** 4.2

---

### P3.6 — Em uma frase, o que essa persona diria sobre a própria vida?
> "Se ela tivesse que resumir onde está agora — trabalho, vida, sensação geral — em uma frase honesta dita para uma amiga próxima, qual seria?"

**Por que perguntar:** Uma frase sobre a própria vida captura o arquétipo emocional da persona. É o tom base de toda a comunicação: não falar com ela como quem tem tudo resolvido, mas como quem entende exatamente onde ela está.  
**Sugestão automática:** Com base nas dores mapeadas → gerar exemplos: "Eu amo o que faço, mas às vezes sinto que estou enxugando gelo", "Trabalho muito mas não vejo resultado proporcional"  
**Skill:** 4.2

---

### P3.7 — Como é a rotina típica dela do acordar ao dormir?
> "Descreva um dia comum: que horas acorda, quais são as primeiras ações, como é a parte da manhã, almoço, tarde, noite, e com que pensamento dorme?"

**Por que perguntar:** A rotina revela contextos específicos para mensagens — onde ela está aberta a consumir conteúdo, quando está sob pressão, quando está receptiva a soluções. Também revela o custo real do problema na vida dela.  
**Sugestão automática:** Com base no cargo e contexto → esboçar rotina típica que o usuário pode validar  
**Skill:** 4.2

---

### P3.8 — Se pudesse mudar UMA coisa no trabalho ou vida, o que seria?
> "Uma varinha mágica. Uma mudança. Sem custo, sem risco. O que ela mudaria primeiro?"

**Por que perguntar:** A resposta à varinha mágica é o desejo mais visceral e direto da persona — sem a camada de racionalização. É o ponto mais próximo do verdadeiro "trabalho" que ela quer contratar o produto para fazer.  
**Sugestão automática:** Com base no problema central → sugerir a mudança que o produto poderia representar, na perspectiva dela  
**Skill:** 4.3

---

### P3.9 — O que ela conta para si mesma sobre por que o problema ainda existe?
> "Qual é a história interna — a narrativa na cabeça dela — que explica por que o problema persiste? ('É porque não tenho tempo', 'É porque o mercado está difícil', 'É porque eu não sei o suficiente')"

**Por que perguntar:** A narrativa interna é a crença limitante que a persona carrega. Comunicação que reconhece essa narrativa (e depois a ressignifica) é muito mais eficaz que atacá-la de frente.  
**Sugestão automática:** Por tipo de problema → sugerir narrativas típicas: "Profissionais sobrecarregados se culpam por falta de organização", "Empreendedores em platô geralmente atribuem ao mercado ou à equipe"  
**Skill:** 4.3

---

### P3.10 — Se pudesse contratar qualquer pessoa do mundo para resolver isso, quem seria?
> "Imagine que a persona tem orçamento ilimitado e pode contratar qualquer especialista, empresa ou persona para resolver esse problema de vez. Quem ela contrataria? Por quê?"

**Por que perguntar:** A resposta revela o arquétipo da solução ideal — não a funcionalidade, mas o tipo de relacionamento, o estilo de trabalho, a autoridade esperada. Informa como o produto deve se posicionar.  
**Sugestão automática:** Com base no perfil → sugerir arquétipos: "Aquele amigo especialista que fala direto", "Uma equipe que faz tudo", "Um mentor que guia sem tirar a autonomia"  
**Skill:** 4.2

---

### P3.11 — Qual é a objeção que ela FALA vs. o que ela realmente SENTE?
> "Quando ela hesita ou não compra, o que ela diz? ('Não tenho orçamento', 'Preciso pensar') E por baixo disso, o que realmente a impede? O que ela não diz?"

**Por que perguntar:** A objeção falada é racional e defensiva. A objeção sentida é emocional e real. Comunicação que resolve a objeção sentida (não a falada) é o que converte.  
**Sugestão automática:** Por pricing tier e contexto → mapear: "Fala: 'preciso pensar' | Sente: 'tenho medo de investir mais e falhar de novo'", "Fala: 'não tenho budget' | Sente: 'não confio que vai funcionar pra mim'"  
**Skill:** 4.3, 4.4

---

### P3.12 — O que precisaria acontecer para ela confiar em VOCÊ especificamente?
> "Não em qualquer solução — em você. O que ela precisaria ver, ouvir ou experienciar para deixar de lado a desconfiança e dar o próximo passo?"

**Por que perguntar:** Confiança específica é diferente de confiança no produto. Ela envolve prova social, estilo de comunicação, acesso, transparência. Responder isso define a estratégia de conversão para esse público.  
**Sugestão automática:** Com base no histórico de tentativas anteriores → "Quem já foi queimado antes precisa de: caso idêntico ao dele, garantia sem pegadinha, acesso antes da compra"  
**Skill:** 4.3, 4.4

---

### P3.13 — Quais são os gostos e hobbies dessa persona?
> "O que ela faz nas horas livres? O que a entusiasma fora do trabalho? (esportes, viagens, gastronomia, tecnologia, moda, carros, música, games, pets, família...)"

**Por que perguntar:** Gostos e hobbies revelam universos de referência que podem ser usados para criar conexão genuína — analogias, memes, metáforas e contextos que ressoam sem forçar. Também revelam onde a persona pode ser encontrada além dos canais profissionais.  
**Sugestão automática:** Com base na geração (P2.10), cargo e contexto socioeconômico → sugerir hobbies típicos do perfil. Exemplos: Millennials de classe B em gestão → viagens internacionais, gastronomia, academia, séries; Gen Z empreendedor → games, tecnologia, moda streetwear, música  
**Skill:** 4.2

---

### P3.14 — Quais referências culturais e de entretenimento essa persona carrega?
> "Que desenhos animados provavelmente assistia na infância? Que filmes, séries, músicas ou personagens fazem parte do repertório cultural dela? Com quais memes e referências ela se identificaria?"

**Por que perguntar:** Referências culturais compartilhadas criam pertencimento imediato. Um meme que usa um personagem que a persona cresceu assistindo parece natural — um que usa uma referência errada para a geração parece forçado e desconectado. Isso é especialmente importante para conteúdo de redes sociais e para criar hooks que param o scroll.  
**Sugestão automática:** Com base na geração (P2.10) → mapear automaticamente referências típicas:
- **Gen Z (14–28):** Minecraft, Roblox, Among Us, TikTok trends, animes (Demon Slayer, JJK), memes de Internet
- **Millennial (29–44):** Chaves, Dragon Ball, Pokémon, Cavaleiros do Zodíaco, Naruto, MSN, Orkut, séries dos anos 2000 (Friends, Lost)
- **Gen X (45–60):** He-Man, She-Ra, Pica-Pau, Hanna-Barbera, Looney Tunes, cinema dos anos 80-90
- **Baby Boomer (60+):** TV em preto e branco, Jovem Guarda, clássicos do cinema nacional

> Consultar `references/generations-guide.md` para lista completa de referências por geração.

**Skill:** 4.2

---

## Dimensão 4 — Dores (Skill 4.3)

> **Instrução de processamento para Skill 4.3:** Ao consolidar as respostas desta dimensão, classificar cada dor nos 4 níveis da Pirâmide de Dor automaticamente — não perguntar ao usuário sobre o nível, apenas aplicar na hora de escrever o output:
> - **Nível 1 — Operacional:** atrito diário, tarefas que não funcionam, falta de tempo → geralmente P4.1, P4.2
> - **Nível 2 — Estratégico:** decisões que não sabe tomar, direção incerta, risco de negócio → geralmente P4.3, P4.7
> - **Nível 3 — Emocional:** sentimentos de inadequação, solidão, ansiedade, vergonha → geralmente P2.7, P4.8, P4.6
> - **Nível 4 — Existencial:** questionamento de identidade e escolha de vida → geralmente P4.6 (medo profundo), P2.6
>
> Os 4 níveis são um framework de classificação, não 4 perguntas separadas.

### P4.1 — Qual é o maior problema que essa persona resolve com o produto?
> "Em uma frase, qual é a dor central? A resposta tem que ser na linguagem DELA, não na linguagem da empresa."

**Por que perguntar:** Diferencia a dor como a persona a vive da dor como a empresa a enquadra  
**Sugestão automática:** Com base no problema central do PRODUCT_CONTEXT → reescrever na perspectiva emocional do usuário  
**Skill:** 4.3

---

### P4.2 — O que essa dor custa para ela (em tempo, dinheiro, energia)?
> "Quanto tempo por semana ela perde? Quanto isso custa em dinheiro real? Qual é o impacto no seu trabalho/vida?"

**Por que perguntar:** Custo concreto da dor é um dos argumentos mais poderosos de venda — e de conteúdo  
**Sugestão automática:** Com base no tipo de produto → sugerir estimativas de custo típico do problema  
**Skill:** 4.3

---

### P4.3 — O que ela teme que aconteça se não resolver isso?
> "No pior cenário, o que acontece com a carreira, negócio ou vida dela se esse problema continuar sem solução?"

**Por que perguntar:** O medo do pior cenário é um motivador muito mais poderoso que a promessa do melhor cenário  
**Sugestão automática:** Com base no cargo e contexto → sugerir consequências típicas  
**Skill:** 4.3

---

### P4.4 — O que ela já tentou antes de chegar aqui?
> "Antes de considerar esse produto, o que ela tentou? Ferramentas, processos, consultores, cursos?"

**Por que perguntar:** Revela o nível de frustração acumulada E o que NOT to repeat na comunicação (ela já sabe que aquelas soluções não funcionam)  
**Sugestão automática:** Com base no produto e mercado → listar alternativas típicas que as pessoas tentam primeiro  
**Skill:** 4.3

---

### P4.5 — Por que as tentativas anteriores falharam?
> "O que especificamente não funcionou nas soluções que ela tentou antes?"

**Por que perguntar:** Revela onde o produto precisa ser posicionado como diferente — e qual é o gap que ele preenche  
**Sugestão automática:** Com base nos diferenciadores do produto → sugerir por que as alternativas geralmente falham  
**Skill:** 4.3

---

### P4.6 — Qual é o medo não declarado por trás da dor?
> "Por baixo do problema prático, o que essa persona realmente teme? (ser julgada, parecer incompetente, perder a posição, etc.)"

**Por que perguntar:** O medo emocional profundo motiva mais que a dor racional — e raramente é falado diretamente  
**Sugestão automática:** Por nível hierárquico → sugerir medos típicos:
- Operacional: "medo de não dar conta, de ser demitido"
- Gerência: "medo de tomar decisão errada e ser responsabilizado"
- Diretoria: "medo de parecer sem estratégia, de perder autoridade"
- Empreendedor: "medo de falhar, de ter sido ingênuo, de não conseguir"  
**Skill:** 4.3

---

### P4.7 — Em que momento a dor fica insuportável?
> "Existe um gatilho específico que faz essa dor passar de 'desconforto' para 'preciso resolver isso agora'?"

**Por que perguntar:** O pico de dor é o momento de compra — entendê-lo define o timing e contexto da comunicação  
**Sugestão automática:** Com base no tipo de problema → sugerir situações de pico típicas  
**Skill:** 4.3

---

### P4.8 — Qual dor ela sente mas NUNCA postaria nas redes sociais?
> "Existe alguma dor, frustração ou insegurança ligada ao problema que ela guarda para si? Que ela jamais publicaria porque machuca a imagem que quer passar?"

**Por que perguntar:** A dor que não é dita em público é frequentemente a mais real e intensa. Conteúdo que toca essas dores com delicadeza (sem expor) gera identificação imediata.  
**Sugestão automática:** Por perfil e cargo → exemplos: "Gestores não postam que estão perdendo autoridade com a equipe", "Empreendedores não postam que estão arrependidos de ter aberto a empresa"  
**Skill:** 4.3

---

### P4.9 — Qual dor ela já normalizou ao ponto de não perceber mais?
> "Existe alguma fonte de sofrimento ou ineficiência que ela parou de questionar? Algo que 'sempre foi assim' e ela nem tenta mais mudar?"

**Por que perguntar:** Dores normalizadas são as mais difíceis de resolver — mas quando você nomeia uma delas de forma inesperada, a persona tem uma reação de "como você sabia?". É um gancho poderoso de conteúdo e de posicionamento.  
**Sugestão automática:** Por setor → "Profissionais de marketing normalizaram não saber o ROI real das ações", "Empreendedores normalizaram não ter férias de verdade"  
**Skill:** 4.3

---

### P4.10 — Qual dor, se você resolver, faria ela indicar você para 10 pessoas?
> "Entre todas as dores mapeadas, qual é aquela que, se for resolvida de verdade, ela não conseguiria não falar para todo mundo que conhece no mesmo contexto?"

**Por que perguntar:** A dor geradora de indicações é o ativo mais valioso — ela define onde concentrar o produto e a promessa central da comunicação. Não é a dor mais frequente, é a mais transformadora.  
**Sugestão automática:** Com base nas dores mapeadas → identificar qual tem maior custo emocional + maior visibilidade social quando resolvida  
**Skill:** 4.3, 4.4

---

## Dimensão 5 — Desejos e Aspirações (Skill 4.3)

### P5.1 — O que essa persona quer alcançar com o produto?
> "O resultado número 1 que ela quer. Não o que ela diz que quer — o que realmente importa para ela."

**Por que perguntar:** O desejo declarado e o desejo real muitas vezes são diferentes — o marketing que toca o real funciona mais  
**Sugestão automática:** Com base no produto e persona → sugerir desejo típico do segmento  
**Skill:** 4.3

---

### P5.2 — Como ela quer ser percebida e que status o resultado traria?
> "Quando resolver esse problema: (1) como ela quer que colegas, chefe ou clientes a vejam profissionalmente? (2) Que mudança de STATUS isso traria nos círculos sociais dela — família, amigos, pares do setor?"

**Por que perguntar:** O desejo de reconhecimento tem duas camadas distintas: a percepção profissional (como é vista no trabalho) e o status social (como é vista nos grupos que importam para ela). Ambas são motivadores reais de compra — raramente admitidos, mas muito presentes.  
**Sugestão automática:** Por cargo e contexto → "Gestores querem ser vistos como estratégicos pelos pares e como referência pelo time"; "Empreendedores querem ser vistos como 'empresário de verdade' pela família e como 'player sério' pelo setor"  
**Skill:** 4.3

---

### P5.3 — Quem ela quer se tornar?
> "Se o produto funcionar perfeitamente por 6 meses, quem é ela? O que mudou na identidade dela?"

**Por que perguntar:** Identidade aspiracional é o nível mais profundo de desejo — e o mais poderoso para criar conexão emocional  
**Sugestão automática:** Com base no produto e persona → sugerir transformação de identidade típica  
**Skill:** 4.3

---

### P5.4 — Qual é o sonho real por trás da meta imediata?
> "A meta imediata é [X]. Mas por que ela quer [X]? O que ela vai poder fazer quando tiver [X]?"

**Por que perguntar:** A meta imediata é o ticket; o sonho real é a motivação verdadeira. Comunicar o sonho real gera conexão profunda  
**Sugestão automática:** Nenhuma — precisa ser construída no diálogo com o usuário  
**Skill:** 4.3

---

### P5.5 — Como seria um dia ideal dessa persona daqui a 12 meses?
> "Peça para ela descrever: que horas acorda, o que vê quando abre o celular, como é o trabalho, o que mudou. O cenário específico, não o genérico."

**Por que perguntar:** O dia ideal operacionaliza o sonho — transforma aspiração abstrata em imagem concreta. Essa imagem é o material das promessas de transformação mais eficazes.  
**Sugestão automática:** Com base nos desejos mapeados → esboçar dia ideal que conecta com as resoluções das dores principais  
**Skill:** 4.3

---

### P5.6 — Qual conquista faria ela chorar de alegria?
> "Se o produto funcionasse perfeitamente e ela chegasse num momento específico de resultado — qual seria esse momento? O que aconteceria que faria lágrimas de alívio, orgulho ou alegria?"

**Por que perguntar:** A conquista emocional máxima é o desejo profundo em forma concreta. É a promessa mais poderosa que pode ser feita — e o conteúdo mais compartilhável quando genuíno.  
**Sugestão automática:** Com base na identidade aspiracional → sugerir momentos de validação externos: reconhecimento, superação de referência, liberdade conquistada  
**Skill:** 4.3

---

### ~~P5.7~~ — *(Merged into P5.2)*
> Esta pergunta foi consolidada em P5.2, que agora cobre as duas camadas: percepção profissional + status nos círculos sociais. Ver P5.2.

---

### P5.8 — O que ela compraria ou faria PRIMEIRO quando atingir o resultado?
> "Imagine que o resultado chegou. A primeira coisa simbólica que ela faria ou compraria — não o que é mais racional, mas o que representa que deu certo."

**Por que perguntar:** O desejo simbólico revela o que o resultado significa na prática para a identidade da persona. É o atalho para a motivação emocional de compra.  
**Sugestão automática:** Por perfil socioeconômico e contexto → exemplos: "Compraria um carro", "Tiraria uma viagem internacional com a família", "Contraria mais pessoas para tirar o peso dos ombros"  
**Skill:** 4.3

---

### P5.9 — Se tudo fosse resolvido por mágica, o que ela faria com o tempo livre?
> "Imagine que o produto magicamente resolve tudo e ela tem tempo, energia e dinheiro livres. O que ela faria com esse espaço? O que voltaria a fazer? O que começaria a fazer?"

**Por que perguntar:** A resposta revela a vida que a persona quer ter — não só o resultado profissional. Comunicação que toca essa camada ("imagine poder voltar a...") cria conexão emocional com o que foi sacrificado.  
**Sugestão automática:** Com base no perfil e rotina → exemplos: "Passaria mais tempo com os filhos", "Voltaria a fazer exercício", "Começaria aquele projeto criativo que engavetou"  
**Skill:** 4.3

---

## Dimensão 6 — Jobs-to-Be-Done (Skill 4.3)

### P6.1 — Qual é o trabalho funcional que ela contrata o produto para fazer?
> "Complete: 'Quando [situação], preciso [fazer algo], para [resultado].'"

**Por que perguntar:** JTBD funcional define o posicionamento do produto de forma mais precisa que qualquer feature  
**Sugestão automática:** Com base no produto → sugerir situação de trigger e resultado típico  
**Skill:** 4.3

---

### P6.2 — Como ela quer se sentir usando o produto?
> "Quando ela está usando o produto no dia a dia, que sentimento quer ter? (confiante, organizada, no controle, tranquila?)"

**Por que perguntar:** Job emocional define a experiência que precisa ser entregue — e os atributos de comunicação do produto  
**Sugestão automática:** Com base nos medos mapeados → sugerir o oposto como job emocional (medo de caos → quer sentir controle)  
**Skill:** 4.3

---

### P6.3 — Como o produto muda como ela é percebida?
> "Depois de usar o produto, como ela é vista pelos outros? O que muda na percepção do entorno?"

**Por que perguntar:** Job social define o argumento de status — fundamental para produtos profissionais  
**Sugestão automática:** Com base na identidade aspiracional da persona → sugerir percepção desejada  
**Skill:** 4.3

---

## Dimensão 7 — Comportamento de Compra (Skill 4.2 e 4.4)

### P7.1 — Qual foi o evento gatilho que fez ela buscar solução?
> "O que aconteceu que fez ela sair de 'vou resolver isso algum dia' para 'preciso resolver isso agora'?"

**Por que perguntar:** O gatilho de ação é o momento de ouro — e entendê-lo permite criar conteúdo que o simula ou ativa  
**Sugestão automática:** Por tipo de produto → "Gatilhos típicos para esse segmento incluem: [lista]"  
**Skill:** 4.2, 4.4

---

### P7.2 — Como ela pesquisa antes de comprar?
> "Quando precisa resolver um problema assim, o que ela faz? Google? Pergunta para colegas? Grupo de WhatsApp? LinkedIn?"

**Por que perguntar:** Define onde estar presente na jornada de compra  
**Sugestão automática:** Por faixa etária e setor → sugerir comportamento de pesquisa típico  
**Skill:** 4.2

---

### P7.3 — Quem mais influencia a decisão?
> "Antes de comprar, ela conversa com alguém? Quem tem poder de veto? Quem valida a escolha?"

**Por que perguntar:** Em B2B especialmente, a influência é coletiva — precisamos comunicar para todos os envolvidos  
**Sugestão automática:** Se cargo é gerência → provavelmente há influência de diretoria e validação de equipe  
**Skill:** 4.2, 4.4

---

### P7.4 — O que pode paralisá-la no momento de decidir?
> "Ela está convencida, mas algo a faz hesitar. O que é?"

**Por que perguntar:** A última barreira antes da compra é o que o tipo 4 dos 9 públicos (Quase-cliente) precisa ver resolvido  
**Sugestão automática:** Por pricing tier → "Para produtos nessa faixa de preço, as barreiras mais comuns são: [lista]"  
**Skill:** 4.3, 4.4

---

### P7.5 — O que tornaria a decisão óbvia para ela?
> "Se você pudesse dar a ela uma coisa que removesse toda a dúvida, o que seria? (garantia, caso idêntico ao dela, demo, etc.)"

**Por que perguntar:** Define o argumento decisivo e o tipo de prova social mais eficiente para essa persona  
**Sugestão automática:** Com base nos medos mapeados → sugerir tipo de prova social que endereça o medo específico  
**Skill:** 4.3, 4.4

---

### P7.6 — O que essa persona considera "valor real"?
> "Quando ela avalia se algo vale o preço, o que ela está pesando? Velocidade? Qualidade do resultado? Reputação de quem entrega? Não precisar se preocupar? ROI mensurável? Status de ter escolhido bem?"

**Por que perguntar:** Diferentes personas têm critérios de valor completamente diferentes. Uma persona valoriza ROI mensurável; outra valoriza paz de espírito; outra valoriza status da escolha. A comunicação de valor precisa falar a língua certa.  
**Sugestão automática:** Por cargo e perfil:
- C-level/Diretoria → valor = resultado estratégico + não precisar microgerenciar
- Gerência → valor = resultado comprovável + facilidade de justificar para cima
- Empreendedor → valor = resultado rápido + relação custo/benefício clara
- Operacional → valor = facilidade de usar + suporte confiável  
**Skill:** 4.3, 4.4

---

### P7.7 — O que ela nunca aceitaria numa solução, independente do preço?
> "Existe alguma característica, comportamento ou limitação que, se a solução tiver, ela descarta imediatamente? Qual é o dealbreaker absoluto?"

**Por que perguntar:** Os dealbreakers são tão definidores quanto os desejadores. Eles revelam os valores inegociáveis da persona e devem ser endereçados proativamente na comunicação.  
**Sugestão automática:** Por perfil → exemplos comuns: "Contratos longos de fidelidade", "Falta de transparência nos relatórios", "Processo de onboarding complexo demais", "Não ter suporte humano acessível"  
**Skill:** 4.3, 4.4

---

### P7.8 — Como ela percebe o preço do produto?
> "Dado o preço do produto e o perfil dessa persona, como ela provavelmente reage ao ver o valor? (barato e suspeito / caro mas consideraria / justo / muito fora do orçamento)"

**Por que perguntar:** Percepção de preço é relativa ao contexto da persona. O mesmo preço pode ser 'óbvio' para uma persona e 'absurdo' para outra. Mapear isso calibra o argumento de valor e o contexto da oferta.  
**Sugestão automática:** Com base no pricing do produto e na renda estimada (P2.3) → calcular % da renda/orçamento e sugerir percepção: até 1% = sem fricção, 1-5% = considera, acima de 5% = precisa de argumento forte  
**Skill:** 4.3, 4.4

---

### P7.9 — Quais alternativas e concorrentes ela conhece e consideraria?
> "Quando essa persona decide resolver o problema, o que ela avaliaria antes ou junto com o seu produto? Quais são os competidores diretos (mesma solução), as alternativas indiretas (abordagens diferentes para o mesmo problema), e o 'não fazer nada' (status quo que ela poderia manter)?"

**Por que perguntar:** O Ring 4 dos 5 Rings of Buying Insight trata de como a persona pesquisa, avalia e decide. Saber com quem você compete na cabeça dela é essencial para: (1) definir o argumento diferenciador correto, (2) antecipar comparações que ela vai fazer, (3) criar conteúdo que posicione você em relação às alternativas que ela já conhece — sem precisar citá-las diretamente.  
**Sugestão automática:** Com base no tipo de produto e mercado → sugerir:
- Concorrentes diretos típicos do segmento
- Alternativas do-it-yourself que ela pode tentar primeiro
- A alternativa "contratar alguém" vs "usar ferramenta"
- O status quo: continuar como está e não resolver  
**Skill:** 4.3, 4.4

---

## Dimensão 8 — Comunicação e Linguagem (Skill 4.2)

### P8.1 — Quais são as palavras exatas que ela usa para descrever o problema?
> "Se ela estivesse falando com um amigo sobre esse problema, como descreveria? Que palavras usaria?"

**Por que perguntar:** A linguagem literal da persona é o material bruto dos hooks, headlines e CTAs mais eficientes  
**Sugestão automática:** Com base no problema central → sugerir frases típicas do segmento  
**Skill:** 4.2

---

### P8.2 — Quais palavras ou frases a afastariam imediatamente?
> "Existe algum vocabulário que ela odeia, que parece falso ou que soa como 'papo de vendedor'?"

**Por que perguntar:** Saber o que evitar é tão valioso quanto saber o que usar  
**Sugestão automática:** Por arquétipo de BRAND_VOICE e setor → listar vocabulário que gera rejeição  
**Skill:** 4.2

---

### P8.3 — Qual é o tom que ela espera?
> "Quando ela consome conteúdo sobre esse tema, prefere linguagem técnica, acessível, direta, inspiracional?"

**Por que perguntar:** Tom incompatível com a expectativa da persona gera rejeição imediata, mesmo que o conteúdo seja bom  
**Sugestão automática:** Cruzar com os tons do BRAND_VOICE para verificar alinhamento  
**Skill:** 4.2

---

### P8.4 — Quais canais não-sociais ela usa e com que frequência?
> "Além das redes sociais (cobertas em P8.6): ela abre emails de marcas? Assina newsletters? Ouve podcast? Assiste YouTube como entretenimento/aprendizado? Vai a eventos presenciais ou online? Participa de grupos de WhatsApp profissionais?"

**Por que perguntar:** Redes sociais são o canal óbvio, mas email, newsletter, podcast e eventos têm taxas de engajamento muito maiores para certos públicos. Mapear os canais não-sociais identifica onde a persona está mais receptiva e menos disputada. (Nota: redes sociais são mapeadas em detalhes em P8.6.)  
**Sugestão automática:** Por geração e cargo:
- Boomers: email, WhatsApp grupos, eventos presenciais
- Gen X: email, podcast de negócios, LinkedIn newsletter, eventos de setor
- Millennials: newsletter de nicho, podcast, email, YouTube como aprendizado
- Gen Z: YouTube, Discord, Twitch — email é irrelevante  
**Skill:** 4.2

---

### P8.5 — Que formato de conteúdo ela realmente consome?
> "Ela assiste vídeos longos ou só reels? Lê artigos completos ou só cabeçalhos? Prefere áudio?"

**Por que perguntar:** Formato errado = conteúdo ignorado, mesmo que a mensagem seja perfeita  
**Sugestão automática:** Por faixa etária e contexto de uso → sugerir formatos preferidos  
**Skill:** 4.2

---

### P8.6 — Quais redes sociais essa persona usa e como ela usa cada uma?
> "Mapeie plataforma por plataforma: Instagram, TikTok, YouTube, LinkedIn, Facebook, Twitter/X, WhatsApp, Pinterest, Kwai. Para cada uma que usa: com que frequência? Com qual intenção? (entretenimento, informação, networking, inspiração, compras)"

**Por que perguntar:** Estar no canal certo não basta — é preciso entender como a persona usa cada plataforma. Ela pode estar no LinkedIn mas nunca interagir com conteúdo. Pode usar o Instagram só para DMs. O comportamento por plataforma define onde e como investir.  
**Sugestão automática:** Com base na geração (P2.10) e cargo → sugerir mapa de plataformas típico:

| Plataforma | Gen Z (14–28) | Millennial (29–44) | Gen X (45–60) | Boomer (60+) |
|------------|--------------|-------------------|--------------|--------------|
| Instagram | Principal | Principal | Secundário | Raramente |
| TikTok | Principal | Crescente | Raramente | Não |
| YouTube | Principal | Principal | Principal | Crescente |
| LinkedIn | Profissional | Principal (profissional) | Principal | Secundário |
| Facebook | Não | Grupos/eventos | Principal | Principal |
| Twitter/X | Nicho/debates | Nicho | Nicho | Raramente |
| WhatsApp | Mensagens | Principal (grupos) | Principal | Principal |
| Pinterest | Nicho (feminino) | Nicho (feminino) | Nicho | Raramente |
| Kwai | Raramente | Raramente | Crescente | Crescente |

> Consultar `references/generations-guide.md` para comportamento detalhado por plataforma e geração.

**Skill:** 4.2

---

### P8.7 — Que tipo de conta/perfil ela segue em cada plataforma?
> "No Instagram, quem ela segue: especialistas, influencers de lifestyle, marcas, amigos, humor, notícias? No LinkedIn, que tipo de post ela curte ou compartilha? Isso varia por plataforma."

**Por que perguntar:** O tipo de conta seguida revela a função que cada plataforma tem na vida da persona. Uma pessoa que segue humor no Instagram mas conteúdo técnico no LinkedIn exige estratégias completamente diferentes para cada canal.  
**Sugestão automática:** Com base na geração e cargo → sugerir padrão de consumo por plataforma  
**Skill:** 4.2

---

## Dimensão 9 — Os 9 Tipos de Público (Skill 4.4)

### P9.1 — Em qual dos 9 tipos está a maioria do público hoje?
> "Se você tivesse que estimar, onde está a maioria das pessoas que compõem esse público: anônimos, seguidores, leads, quase-clientes?"

**Por que perguntar:** Define onde concentrar esforços de conteúdo e comunicação agora  
**Sugestão automática:** Com base no stage da empresa no COMPANY_PROFILE → sugerir distribuição típica  
**Skill:** 4.4

---

### P9.2 — Qual tipo é mais negligenciado na estratégia atual?
> "Qual dos 9 grupos você tem mais dificuldade de avançar ou quase não considera na estratégia?"

**Por que perguntar:** O tipo negligenciado é frequentemente a maior oportunidade de crescimento  
**Sugestão automática:** Com base no stage → "Empresas em crescimento frequentemente negligenciam os tipos 6, 7 e 8 (foco em aquisição, esquece retenção)"  
**Skill:** 4.4

---

### P9.3 — O que faz um anônimo virar seguidor para essa persona?
> "O que desperta a atenção inicial de alguém do tipo 1 nesse perfil? Que tipo de conteúdo ou situação?"

**Por que perguntar:** O ponto de entrada na audiência é o mais crítico para crescimento de alcance  
**Sugestão automática:** Com base nas dores de nível 1 e canais → sugerir tipo de conteúdo de awareness  
**Skill:** 4.4

---

### P9.4 — O que separa um lead de um quase-cliente para essa persona?
> "Que informação, prova ou experiência faz ela passar de 'estou considerando' para 'quero comprar'?"

**Por que perguntar:** O gap entre lead e quase-cliente é onde a maioria das conversões se perde  
**Sugestão automática:** Com base nas barreiras mapeadas na 4.3 → sugerir o que resolve o gap  
**Skill:** 4.4

---

### P9.5 — O que faz um cliente virar indicador?
> "O que precisaria acontecer para que essa persona recomendasse ativamente o produto para outros?"

**Por que perguntar:** O indicador é o ativo mais valioso — entender o que o cria permite construir isso intencionalmente  
**Sugestão automática:** Com base nos success factors (Ring 2) → sugerir o que precisa ser entregue para gerar indicação  
**Skill:** 4.4

---

## Dimensão 10 — Nível de Consciência (Skill 4.5)

### P10.1 — Em qual nível de consciência está a maioria dessa persona?
> "Essa persona sabe que tem o problema (nível 2+) ou ainda nem reconheceu que o problema existe (nível 1)? Ela já conhece soluções como a sua (nível 3+)?"

**Por que perguntar:** O nível de consciência define toda a estratégia de conteúdo — headline, argumento, CTA  
**Sugestão automática:** Com base na maturidade do mercado e tipo de produto → sugerir nível provável  
**Skill:** 4.5

---

### P10.2 — Qual porcentagem do conteúdo deve ir para cada nível?
> "Considerando onde a maioria da audiência está e onde quer chegar, como distribuir o conteúdo entre os 5 níveis?"

**Por que perguntar:** Define o mix estratégico de TOFU/MOFU/BOFU de forma mais precisa  
**Sugestão automática:** Fórmulas típicas por objetivo:
- Crescer audiência: 50% nível 1-2 / 30% nível 3 / 20% nível 4-5
- Converter mais: 20% nível 1-2 / 30% nível 3 / 50% nível 4-5
- Mercado educado: 30% nível 2-3 / 50% nível 3-4 / 20% nível 5  
**Skill:** 4.5

---

### P10.3 — Que headline ressoa em cada nível para essa persona?
> "Com base nas dores e desejos mapeados, qual seria uma headline de exemplo para cada nível de consciência?"

**Por que perguntar:** Traduz o framework em material concreto e imediatamente utilizável  
**Sugestão automática:** Gerar 3 headlines de exemplo por nível usando a linguagem literal mapeada na P8.1  
**Skill:** 4.5

---

## Dimensão 11 — Síntese Executiva (Skill 4.5 / Output Final)

> Estas perguntas consolidam tudo que foi mapeado em 11 campos de alta densidade. O output desta dimensão alimenta o **Template de Síntese Executiva** ao final de cada arquivo `AUDIENCE_[nome].md` — projetado para ser lido em 60 segundos por humanos e pela IA no pipeline de conteúdo.

---

### P11.1 — Qual é a frase-resumo desta persona?
> "Em uma frase, quem é essa persona, onde está, e o que define a situação dela agora?"

**Por que perguntar:** A frase-resumo é o atalho de contexto. Toda skill que ler o arquivo no futuro entende imediatamente com quem está lidando.  
**Sugestão automática:** Com base no perfil completo → gerar: "[Nome], [cargo], que [situação atual com uma tensão central]"  
**Skill:** 4.5

---

### P11.2 — Qual é a dor que mais arde?
> "Entre todas as dores mapeadas, qual é a que ela mais sente no cotidiano? Não a mais grave no longo prazo — a que dói mais agora."

**Por que perguntar:** A dor mais presente é a entrada da comunicação. É ela que precisa aparecer no hook, no subject do email, na primeira frase do anúncio.  
**Sugestão automática:** Com base nas dimensões 4 (dores) → identificar a que tem maior urgência + frequência  
**Skill:** 4.5

---

### P11.3 — O que ela realmente quer?
> "Não o que ela diz que quer — o desejo real e profundo, a versão honesta."

**Por que perguntar:** O desejo real é o destino. Toda comunicação precisa apontar para ele, mesmo que implicitamente.  
**Sugestão automática:** Com base nas dimensões 5 (desejos) → consolidar em uma frase que combine resultado funcional + identidade aspiracional  
**Skill:** 4.5

---

### P11.4 — Qual é o medo oculto?
> "O que ela não fala, mas sente. A insegurança profunda por baixo das objeções racionais."

**Por que perguntar:** Comunicação que valida (sem expor) o medo oculto gera uma conexão de 'você me entende' que é difícil de criar de outra forma.  
**Sugestão automática:** Com base em P4.6 (medo não declarado) e P3.11 (objeção sentida) → consolidar  
**Skill:** 4.5

---

### P11.5 — O que faz ela agir agora?
> "O gatilho específico que move essa persona da intenção para a ação. O evento que a faz sair de 'vou pensar' para 'preciso resolver isso'."

**Por que perguntar:** O gatilho de compra define o timing e o contexto da comunicação de conversão.  
**Sugestão automática:** Com base em P4.7 e P7.1 → consolidar em situação específica + urgência  
**Skill:** 4.5

---

### P11.6 — O que quase impede a compra?
> "A objeção principal — o que ela levanta quando está convencida mas ainda hesita."

**Por que perguntar:** A objeção principal precisa ser endereçada proativamente antes que ela a verbalize.  
**Sugestão automática:** Com base em P3.11 e P7.4 → consolidar objeção mais frequente  
**Skill:** 4.5

---

### P11.7 — O que ela precisa ver para confiar?
> "Qual é a prova social ou evidência específica que remove a dúvida final e justifica a decisão?"

**Por que perguntar:** Define o tipo de conteúdo de conversão mais eficiente para essa persona (caso de uso similar, garantia, demo, depoimento específico).  
**Sugestão automática:** Com base em P3.12 e P7.5 → sugerir formato de prova mais adequado ao medo  
**Skill:** 4.5

---

### P11.8 — Qual é a mensagem-chave?
> "A frase que, se essa persona lesse num feed, faria ela parar o scroll. A que combina a dor dela com a promessa de transformação."

**Por que perguntar:** A mensagem-chave é o núcleo de toda a comunicação com essa persona. Não é um slogan — é a frase que ela pensaria 'é exatamente assim que me sinto'.  
**Sugestão automática:** Gerar 3 opções cruzando linguagem literal (P8.1) + dor que mais arde (P11.2) + desejo real (P11.3)  
**Skill:** 4.5

---

### P11.9 — Qual é o canal principal?
> "Onde essa persona está com mais frequência e abertura para receber comunicação sobre esse tema?"

**Por que perguntar:** Canal certo + mensagem certa = impacto real. Canal errado = invisibilidade.  
**Sugestão automática:** Com base em P8.4 (canais) + tipo de conteúdo preferido → indicar canal primário e secundário  
**Skill:** 4.5

---

### P11.10 — Qual é a transformação prometida?
> "Complete: 'De [estado atual problemático] para [estado futuro desejado].' Em uma linha, preciso e específico."

**Por que perguntar:** A transformação é a promessa central do produto para essa persona. É a estrutura de toda oferta, todo case, todo depoimento.  
**Sugestão automática:** Com base na dor principal (P11.2) e desejo real (P11.3) → formatar: "De [dor mais presente] para [desejo real]"  
**Skill:** 4.5
