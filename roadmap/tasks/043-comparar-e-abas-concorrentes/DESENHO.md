# 043 · Fase A: desenho da área Concorrentes (nomes, painéis, Preços e planos, Posicionamento)

> Autor: estrategista (Opus), 2026-10-08. Base: dados reais de `companies/kz/competitors/*/analysis/{precos,landing}.json` (11 concorrentes), `intel/matriz.json` (43 funcionalidades), `intel/referencia.json`, `context/BUSINESS.md`, `COMPETITORS.md`, `campaigns/2026-10-07-carta-base/carta.md`.
> Para quem implementa (Sonnet): toda conta deste documento é **calculada no app a partir dos arquivos**, nunca escrita à mão no código. Os números aqui servem para conferir a implementação.
> Princípios: listas longas rolam por dentro (`FillBox`/`useFillHeight`), filtros à vista, compacto, só ícones Lucide (todos abaixo conferidos no `lucide-react` instalado), sem dado inventado (falta dado → "—" + o que coletar).

---

## 1. Nomes e ordem das abas

### Área Concorrentes (`app/src/components/competitors/area.tsx` → `AREA_TABS`)

Ordem nova: **insight à esquerda, gestão à direita** (separadas por um divisor vertical fino; as duas últimas podem ficar alinhadas à direita da barra). As rotas não mudam.

| # | rota | hoje | proposto | ícone Lucide | por quê |
|---|---|---|---|---|---|
| 1 | `''` | Panorama | **Panorama** | `LayoutDashboard` | Claro: o resumo do mercado. Fica. |
| 2 | `comparar` | Comparar | **Comparar** | `Columns3` | Claro e é onde está o foco (preços). Sobe para 2º. |
| 3 | `brechas` | Brechas | **Brechas** | `Target` | Nome bom: "onde eles deixam espaço". Redesenho é a fase B. |
| 4 | `conteudos` | Conteúdos | **Conteúdos** | `Clapperboard` | Claro. |
| 5 | `anuncios` | Anúncios | **Anúncios** | `Megaphone` | Claro. Sobe antes de Redes (insight mais acionável: ângulo que paga a conta). |
| 6 | `redes` | Redes | **Redes** | `Share2` | Claro (perfil × rede). Não funde com Conteúdos: Redes é o perfil, Conteúdos é o post. |
| — | | | *divisor* | | |
| 7 | `lista` | Concorrentes | **Cadastro** | `BookUser` | Tira a repetição do nome da área. É onde se adiciona, aceita candidato, arquiva e abre a ficha de cada um: é cadastro, não análise. ("Lista" seria a 2ª opção.) |
| 8 | `coletas` | Coletas | **Coletas** | `RefreshCw` | Operação (frescor dos dados). Fica no fim. |

Nada sai e nada funde. O que muda de lugar: **Cadastro** e **Coletas** viram "gestão" (fim da barra).

### Sub-abas do Comparar (`pages/concorrentes/Comparar.tsx` → `VIEWS`, `?v=`)

| # | `?v=` (manter) | hoje | proposto | ícone | por quê |
|---|---|---|---|---|---|
| 1 | `oferta` (padrão) | Oferta e preço | **Preços** | `Tag` | Curto, diz o que é. Vira a visão mais rica (seção 3). |
| 2 | `funcionalidades` | Funcionalidades | **Funcionalidades** | `Grid3x3` | Claro. |
| 3 | `mensagem` → aceitar também `posicionamento` | Mensagem | **Posicionamento** | `PanelsTopLeft` | "Mensagem" não diz nada. A aba responde "como cada um se apresenta e vende no site": estrutura da página, promessa, porta de entrada, prova, tom. `?v=mensagem` continua abrindo a mesma aba. |
| 4 | `reputacao` | Reputação | **Reputação** | `Star` | Claro. |

Os chips do Comparar ganham o ícone à esquerda do rótulo (como as abas da área).

---

## 2. Painéis por aba (o que cada uma merece)

Prioridade: **A** = fazer nesta tarefa · **M** = próxima rodada · **B** = backlog. "Dados" = bastam os atuais ou precisa coletar.

| aba | painel / visão | prio | pergunta de negócio | dados |
|---|---|---|---|---|
| Panorama | KPI "Kzloo × mercado" comparando com o **plano equivalente** (seção 3.4), não com a entrada | M | "Estou caro de verdade, comparando a mesma coisa?" | depois da fase D |
| Panorama | mini-régua de preço (só pontos + Kzloo) no lugar do "Preço × audiência" | B | idem, de relance | atuais |
| Comparar · Preços | **Régua** (compacta) + **Planos** (tabela) + **Lado a lado** (completa) | **A** | seção 3 | régua e tabela: atuais; lado a lado: fase D |
| Comparar · Funcionalidades | alternância **por concorrente / por plano** (colunas = planos, células de `plans[].matrix`) | A (depois de D) | "Isso vem no plano de entrada ou só no caro?" | fase D |
| Comparar · Funcionalidades | filtro "raras" (≤ 2 concorrentes têm) e "padrão que a Kzloo não tem" (≥ 70% têm, `_nos` ≠ sim) | M | "O que é diferencial e o que é obrigação de mesa?" | atuais |
| Comparar · Posicionamento | **Estrutura** (matriz seção × concorrente) | **A** | seção 4 | atuais |
| Comparar · Posicionamento | **Promessa**, **Porta de entrada** | **A** | seção 4 | atuais |
| Comparar · Posicionamento | **Prova**, **Tom**, **Vale copiar** | M | seção 4 | atuais (+ campo opcional) |
| Comparar · Reputação | temas de reclamação agregados do mercado (`topComplaints` de todos, agrupados) → "objeções que a Kzloo pode responder na copy" | M | "Do que os clientes deles reclamam?" | atuais; agrupar exige 1 passo de IA (tags) |
| Brechas | (fase B, UX) sub-abas sugeridas: **Temas** · **Produto × mercado** · **Por concorrente**; cada brecha com evidência, nº de concorrentes e "Virar tarefa" | A (fase B) | "Onde entrar e com que prova?" | atuais |
| Conteúdos | painel "o que funciona" por formato/gancho (vocabulário das fichas) | M | "Que formato e gancho rendem neste nicho?" | fichas existentes |
| Anúncios | (já feito na 037) nada novo | — | | |
| Redes | crescimento 30/90 d por perfil (linha) | B | "Quem está crescendo?" | precisa de histórico de coletas |
| Cadastro | coluna "análise" (módulos feitos e idade, ex.: `precos 1 d · landing 1 d · reputacao —`) | M | "Posso confiar no que o Comparar mostra?" | atuais (`updatedAt`) |
| Coletas | bloco "frescor da análise" (módulo × concorrente, idade, confiança) com "pedir de novo" | M | idem, com ação | atuais |

---

## 3. Preços e planos (foco principal)

### 3.1 Perguntas que a visão responde
1. Quanto o mercado cobra de **um terapeuta solo**? (entrada, plano completo, média, mediana, quartis)
2. **Onde a Kzloo fica** nessa régua, a R$ 100 e a R$ 129?
3. **O que cada plano inclui** e o que o plano mais caro destrava? (ex.: o que os R$ 34,50 do GestorPsi entregam)
4. **O que é cobrado à parte** (WhatsApp, vídeo, NF, IA, taxa de Pix) e quanto custa de verdade?
5. **Qual desconto no anual** e qual ciclo cada site mostra por padrão (vários mostram o anual primeiro)?
6. **Risco de entrada**: teste, cartão no teste, garantia, fidelidade, plano grátis permanente.
7. **Quem está em cada faixa** de preço e o que a faixa costuma entregar.
8. **"Quanto custa ter o que a Kzloo entrega"** em cada concorrente (plano equivalente).

### 3.2 A conta com os dados reais (07–08/out/2026)

**Planos pagos para 1 profissional (solo), cobrança mensal** — base da comparação justa (n = 15):

| concorrente | plano | R$/mês | anual eq. R$/mês | obs. |
|---|---|---|---|---|
| GestorPsi | Individual | 34,50 | — | "condições exclusivas p/ pagamento eletrônico" (conferir se é preço com desconto) |
| Mais Terapias | Terapeuta Starter | 39,90 | — | promo; cheio 59,90 |
| PsiNota AI | Clínico | 49,00 | 32,50 | |
| Terapee | Individual | 55,90 | 44,72 | WhatsApp próprio à parte |
| Psicoplanner | Individual | 59,00 | 49,17 | |
| Mais Terapias | Terapeuta Premium | 59,90 | — | promo; cheio 79,90 |
| PersonCare | Profissional | 69,90 | (existe, não capturado) | 1 prof. + 1 secretário |
| Allminds | Gestão | 74,90 | 67,41 | vídeo R$ 2/sessão |
| Psicoplanner | Plus | 79,00 | 65,83 | `users` vazio |
| Corpora | Profissional | 89,00 | — | taxa Pix 1,99% / cartão 4,59% |
| Sintropia | (plano único) | 99,00 | 66,58 | promo 24 meses por R$ 790 até 14/10 |
| PsicoManager | Individual Pró | 109,00 | 89,00 | página abre no anual |
| PsiNota AI | Pro | 119,00 | 79,00 | página abre no anual |
| PsicoManager | Individual Plus | 149,00 | 119,00 | |
| Allminds | Ecossistema | 179,90 | 161,91 | `users` vazio |

Fora: Clínica Ágil (sem preço público), planos grátis (Corpora, PsiNota), Allminds Captação (R$ 279/trimestre, só leads, sem gestão), planos de equipe.

Estatística (quartis por interpolação linear, = `QUARTIL.INC` do Excel; o app calcula):

| recorte | n | mín | Q1 | **mediana** | **média** | Q3 | máx |
|---|---|---|---|---|---|---|---|
| **Entrada** (menor plano pago de cada um) | 10 | 34,50 | 50,73 | **64,45** | **68,01** | 85,47 | 109,00 |
| **Todos os planos solo** | 15 | 34,50 | 57,45 | **74,90** | **84,46** | 104,00 | 179,90 |
| **Topo solo** (plano solo mais caro de cada um) | 10 | 34,50 | 62,40 | **84,00** | **93,51** | 114,00 | 179,90 |
| Todos os planos pagos (inclui equipe) | 22 | 34,50 | 59,60 | 89,45 | 106,61 | 123,35 | 349,90 |

**Kzloo:** R$ 129 → **+100%** sobre a mediana de entrada e **+54%** sobre a mediana do topo solo; mais cara que **todas as entradas** (a maior é PsicoManager R$ 109). A R$ 100 → +55% e +19%.

**Anual:** desconto declarado por concorrente: Allminds 10% · Psicoplanner 17% · PsicoManager 18–20% · Terapee 20% · Sintropia 33% · PsiNota 34% → **mediana ~19%, média ~22%**. Sem anual: Corpora, GestorPsi, Mais Terapias. PersonCare tem ("mais de 20%") mas não foi capturado. **Abrem no anual por padrão:** PsicoManager, PsiNota (comparar o "preço da vitrine" deles com o mensal de outro é injusto).

**Risco de entrada:** teste grátis 9/11 (7 a 15 dias; "sem cartão" declarado em 6) · plano grátis permanente 2/11 (Corpora, PsiNota) · garantia/reembolso explícito 2/11 (Allminds 7 d só no anual, PsiNota 7 d) · sem preço 1/11 (Clínica Ágil). Kzloo: sem teste, garantia "a definir", entrada por aprovação manual.

### 3.3 Faixas de preço (calculadas, não fixas)
Cortes = quartis dos **planos solo** (Q1 57,45 · mediana 74,90 · Q3 104,00). O app recalcula a cada dado novo; os rótulos são fixos.

| faixa | regra | planos hoje |
|---|---|---|
| **Entrada** | < Q1 (< R$ 57,45) | GestorPsi Individual 34,50 · Mais Terapias Starter 39,90 · PsiNota Clínico 49 · Terapee Individual 55,90 |
| **Popular** | Q1 a mediana (57,45–74,90) | Psicoplanner Individual 59 · Mais Terapias Premium 59,90 · PersonCare Profissional 69,90 · Allminds Gestão 74,90 |
| **Intermediária** | mediana a Q3 (74,91–104) | Psicoplanner Plus 79 · Corpora Profissional 89 · Sintropia 99 |
| **Premium** | > Q3 (> R$ 104) | PsicoManager Pró 109 · PsiNota Pro 119 · PsicoManager Plus 149 · Allminds Ecossistema 179,90 |

Leitura: **a R$ 129 a Kzloo está na Premium**, ao lado de quem vende IA clínica (PsiNota Pro) e do "maior do Brasil" (PsicoManager). **A R$ 100 fica na Intermediária**, ao lado de Sintropia (99) e Corpora (89), que são os rivais de tom mais próximos. Isso é decisão de preço (seção 5).

### 3.4 Comparação justa (regras que o app aplica)
1. **Mesma base:** plano para **1 profissional**. Planos de equipe só na lente "Equipe", com **preço por profissional** (ex.: GestorPsi 4 prof. 59,50 → 14,88/prof.; Terapee Clínica 15 usuários 89,90 → 5,99; PersonCare 5 acessos 119,90 → 23,98 e 10 acessos 349,90 → 34,99 **por acesso, mais caro**: conferir no site).
2. **Mesmo ciclo:** mensal com mensal, anual equivalente com anual equivalente. Nunca misturar. Sem anual → "—" na lente anual (não usar o mensal no lugar).
3. **Plano equivalente** (a comparação principal): para cada concorrente, o **plano solo mais barato que cobre o "pacote Kzloo"**. Pacote proposto (ids da matriz em que `_nos` = sim e que são diferenciais da Kzloo): `agenda-visual`, `recorrencia`, `prontuario`, `formulario-paciente`, `video-nativa`, `wpp-lembrete`, `controle-cobrancas`, `portal-paciente`. Se nenhum plano cobre tudo: o que cobre mais, com o selo "cobre 6 de 8". **Depende da fase D** (`plans[].matrix`). Pacote = aval do Oliver.
4. **Custo real/mês** = preço do plano + add-ons fixos necessários para o pacote (ex.: Terapee Individual + "WhatsApp próprio"). Add-on por uso (vídeo R$ 2/sessão, taxa de Pix %) só entra se o Oliver aprovar um **perfil-padrão** (ex.: X sessões/mês, Y pacientes, R$ Z por sessão); sem aval, mostrar só como nota "+ R$ 2 por sessão de vídeo".
5. **Promoção:** mostrar o preço vigente com selo "promo até dd/mm" e o cheio riscado; alternância "sem promoções" usa `regularMonthly`.
6. **Frescor e confiança:** preço com `updatedAt` > 60 dias ou `confidence` ≠ alta ganha ícone `TriangleAlert` com tooltip.
7. **R$/dia** (Allminds ancora "menos de R$ 2 por dia"): `monthly / 30`, só como coluna de leitura.

### 3.5 Visão compacta: "Régua" (padrão da sub-aba Preços)
Altura de uma tela, sem rolar a página (a tabela rola por dentro).

1. **Faixa de números** (`StatStrip`, 6 itens): Entrada mediana R$ 64,45 · Plano solo mediano R$ 74,90 · Topo solo mediano R$ 84 · Desconto anual mediano 19% · Teste grátis 9/11 (2 grátis p/ sempre) · **Kzloo** R$ 129 (Premium · +54% vs topo solo). Cada número com tooltip "como calculei".
2. **Régua (dot plot)** — 1 linha por concorrente (Kzloo fixa no topo, destacada), eixo R$ 0–200 (planos > 200 viram seta "→ 349,90" na borda):
   - fundo com as 4 faixas (tons neutros, rótulo no topo); linhas verticais finas da **mediana** e da **média** do recorte;
   - cada plano = ponto (cheio = solo, vazado = equipe; anel = recomendado pelo site); um traço liga entrada ao topo solo;
   - Kzloo = barra de faixa R$ 100–129 (preço não é final), não ponto;
   - hover no ponto → card: plano, preço mensal/anual, para quem, 3 primeiros `includes`, limites-chave, fonte e data; clique → abre a visão completa já com esse plano selecionado.
   - controles à vista: **Ciclo** `Mensal | Anual eq.` · **Base** `Solo | Equipe | Todos` · **Promo** `vigente | cheio` · ordenar por `entrada | topo | nome`.
3. **Tabela "Planos"** (1 linha por plano, `SortTable fill`, rola por dentro): Concorrente · Plano · Faixa (chip) · Para quem (`seats`) · Mensal · Anual eq. · Desc. % · R$/dia · Limites-chave (até 2 chips, ex.: "50 sessões/mês", "25 msgs WhatsApp") · Funcionalidades (nº da matriz, ex.: "14/43") · Extras pagos (ícone com tooltip) · Teste. Filtro por faixa (chips) acima. Linhas de equipe recolhidas por padrão.
4. **Por faixa** (3–4 linhas, abaixo da régua ou em `Collapsible`): faixa · quantos planos · **o que a faixa costuma incluir** (funcionalidades presentes em ≥ 60% dos planos da faixa) · **o que só aparece da faixa X para cima**. Antes da fase D, mostrar só os nomes dos planos.

### 3.6 Visão completa: "Lado a lado"
Para comparar 2 a ~10 planos de verdade, como a tabela de planos de um site.

- **Colunas = planos selecionados** (cabeçalho fixo com logo, nome do plano, preço grande, faixa); **1ª coluna fixa** com os atributos; rolagem horizontal dentro do bloco.
- **Seleção padrão = "plano equivalente" de cada concorrente + Kzloo** (comparação justa pronta). Seletor à vista: "Equivalentes" · "Entradas" · "Topos" · "Escolher…" (multi-select por concorrente/plano).
- Alternância **"só diferenças"** (esconde linhas iguais em todos os selecionados) e **"comparar com Kzloo"** (pinta verde/vermelho o que o plano tem e a Kzloo não, e vice-versa).
- **Linhas (agrupadas, cada grupo recolhível):**

| grupo | linhas | campo |
|---|---|---|
| Preço | mensal · anual eq. · total anual · desconto % · outros ciclos · ciclo que o site mostra primeiro · promo (até quando, preço cheio) · R$/dia · **custo real/mês** | `monthly`, `yearlyMonthly`, `yearlyTotal`, `otherCycles`, `pageDefaultCycle`, `regularMonthly`, `promo` |
| Para quem | profissionais inclusos · máximo · assento extra R$ · secretária/atendente | `seats` |
| Limites | pacientes · sessões/mês · WhatsApp msgs/mês · vídeo (min ou sessões) · IA · NF/mês · cobranças · armazenamento | `limits[]` (vazio = "sem limite informado", ≠ "ilimitado") |
| Inclui | os grupos da matriz (Agenda, Prontuário, IA, Financeiro…) com ✓ / parcial / — por funcionalidade; contagem por grupo no cabeçalho do grupo | `plans[].matrix` |
| Também inclui | itens que não estão na matriz | `includes` sem par na matriz |
| Extras pagos | add-on, preço, unidade | `addOns[]` (filtrados por `planIds`) |
| Condições | teste (dias, cartão, qual plano) · garantia/reembolso · fidelidade · formas de pagamento | `trialDays`, `trialNeedsCard`, `trialPlanId`, `refundDays`, `refundScope`, `commitment`, `paymentMethods` |
| Fonte | link · data · confiança | `sources`, `updatedAt`, `confidence` |

### 3.7 Plano × funcionalidade (ligação com a matriz)
Hoje a matriz (`intel/matriz.json`) é **por concorrente**: diz que o PsicoManager tem IA, mas não em qual plano (o Pró tem "créditos limitados"; o Plus, ilimitada). Ligação proposta: cada plano grava `matrix: [{ id, status, note }]` com os **ids do catálogo da matriz** (cumulativo: o plano de cima repete o que herda). O app deriva:
- célula da matriz por concorrente = melhor status entre os planos (a matriz atual continua valendo como fallback);
- "a partir de qual plano" cada funcionalidade aparece (tooltip na matriz: "IA ilimitada: só no Plus, R$ 149");
- cobertura do pacote Kzloo por plano (3.4) e "funcionalidades por faixa" (3.5 item 4).

### 3.8 O que falta nos dados (lacunas reais)

| campo | lacuna | exemplos reais |
|---|---|---|
| o que o plano inclui | `highlights` rasos, com referência a outro plano em vez da lista | GestorPsi "Até 4" e "Até 50": "mesmos recursos do Individual" · PersonCare Clínica 5/10: "mesmos recursos do Profissional" · Psicoplanner Plus: "demais itens do Individual" · Sintropia: planos "Mensal/Anual" sem recursos, mas `notes` diz que "recursos variam por plano" |
| para quem | `users` vazio | Allminds Gestão e Ecossistema · Psicoplanner Plus · Sintropia |
| limites | só em texto livre, sem número estruturado; às vezes sem número | PsiNota "60/300/800 min de vídeo" · Corpora Grátis "50 sessões por mês" · Mais Terapias "WhatsApp 25 msgs/mês" · PsicoManager Pró "créditos limitados de IA e WhatsApp" (quanto?) · Allminds "30 sessões de vídeo", "100 NF/mês" |
| anual | não capturado ou inexistente sem distinção | PersonCare (aba Anual existe, ">20%", sem valores) · Corpora, GestorPsi, Mais Terapias: "só mensal" só em `notes` |
| plano sem preço | não existe como plano | PsicoManager Clínica, Psicoplanner Clínicas (só em `extras`/`notes`); PsiNota Clínica sem `monthly`, sem flag |
| promoção | preço cheio e validade em texto | Mais Terapias "preço normal R$ 59,90" dentro de `highlights` · Sintropia promo até 14/10 em `extras` |
| ciclo padrão da página | só em `notes` | PsicoManager e PsiNota abrem no anual |
| teste | texto livre; cartão e plano do teste ambíguos | GestorPsi "14 dias grátis, sem informar cobrança" · Corpora "7 dias do plano Pro" |
| garantia × fidelidade | misturados em `guarantee` | Corpora "sem fidelidade" · Mais Terapias "sem fidelidade, cancele quando quiser" · Allminds "reembolso integral em até 7 dias no anual" |
| extras | texto, sem preço/unidade/plano | Allminds "Vídeo adicional: R$ 2/sessão" · Corpora "Pix 4,99% (grátis) ou 1,99% (Pro)" · Terapee "WhatsApp próprio cobrado à parte" (sem preço) · Mais Terapias créditos WhatsApp (4 pacotes) |
| pagamento | só em `notes`/`extras` | Terapee "só cartão" · PsiNota "cartão ou boleto via Stripe" |
| plano × matriz | inexistente | todos |
| Kzloo | `referencia.json` tem só `fromMonthly: 129`, `plans: 1` | sem plano descrito, sem ciclos, sem limites; trimestral/anual "% a definir" (BUSINESS) |
| sem preço público | Clínica Ágil | ~R$ 199 em abr/2026, sem fonte atual |

### 3.9 Campos novos no schema `precos` (`schema/analysis.ts`)
Todos **opcionais** (`nullish` ou `.default([])`): os 11 arquivos atuais continuam válidos. `highlights` fica (3 destaques do site); `extras` fica como legado (texto).

**No plano (`plans[]`):**

| campo | tipo (zod) | exemplo real |
|---|---|---|
| `id` | `S` (slug estável) | `"individual-plus"` |
| `audience` | `z.enum(['solo','equipe'])` | `"solo"` |
| `seats` | `z.object({ included: Num, max: Num, unlimited: z.boolean().default(false), extraPrice: Num, staff: Num })` nullish | GestorPsi "Até 4": `{ included: 4, max: 4 }` · PersonCare Profissional: `{ included: 1, max: 1, staff: 1 }` · Mais Terapias Clínicas: `{ unlimited: true }` |
| `onRequest` | `z.boolean().default(false)` | PsiNota Clínica, PsicoManager Clínica |
| `regularMonthly` | `Num` | Mais Terapias Premium `79.9` |
| `promo` | `z.object({ label: S, until: nullish(IsoDate) })` nullish | Sintropia `{ label: "24 meses por R$ 790 à vista", until: "2026-10-14" }` |
| `otherCycles` | `z.array(z.object({ cycle: z.enum(['trimestral','semestral','bienal']), total: Num, perMonth: Num, installments: nullish(S) }))` | Sintropia `{ cycle: "bienal", total: 790, perMonth: 32.92 }` · Allminds Captação `{ cycle: "trimestral", total: 279, perMonth: 93 }` |
| `inherits` | `nullish(S)` (id do plano de baixo) | Psicoplanner Plus → `"individual"` |
| `includes` | `Strs` (lista **completa e explícita**, cumulativa) | GestorPsi Até 4: a lista inteira do Individual + o que muda |
| `matrix` | `z.array(z.object({ id: S, status: z.enum(['sim','parcial']), note: nullish(S) }))` | PsicoManager Pró `{ id: "ia-transcricao-nota", status: "parcial", note: "créditos limitados" }` |
| `limits` | `z.array(z.object({ metric: z.enum(['pacientes','sessoes','profissionais','whatsapp-msgs','video-min','video-sessoes','ia-creditos','nf','cobrancas','armazenamento-gb','relatorios','outro']), value: Num, unlimited: z.boolean().default(false), period: nullish(z.enum(['mes','trimestre','ano','total'])), note: nullish(S) }))` | PsiNota Free `{ metric: "pacientes", value: 5 }`, `{ metric: "video-min", value: 60, period: "mes" }` |

**No nível do concorrente (`data`):**

| campo | tipo | exemplo real |
|---|---|---|
| `pageDefaultCycle` | `nullish(z.enum(['mensal','anual','outro']))` | PsicoManager `"anual"` |
| `trialDays` | `Num` (int) | Terapee `14` |
| `trialNeedsCard` | `nullish(z.boolean())` | Mais Terapias `false`; GestorPsi `null` |
| `trialPlanId` | `nullish(S)` | Corpora `"profissional"` |
| `refundDays` | `Num` | PsiNota `7` |
| `refundScope` | `nullish(S)` | Allminds `"só no plano anual"` |
| `commitment` | `nullish(z.enum(['sem-fidelidade','fidelidade-anual','multa','nao-informado']))` | Corpora `"sem-fidelidade"` |
| `paymentMethods` | `z.array(z.enum(['cartao','pix','boleto','debito','outro'])).default([])` | Terapee `["cartao"]` |
| `addOns` | `z.array(z.object({ name: S, price: Num, unit: z.enum(['mes','unico','por-uso','percentual']), per: nullish(S), planIds: Strs, unlocks: Strs }))` | Allminds `{ name: "Vídeo adicional", price: 2, unit: "por-uso", per: "sessão" }` · Corpora `{ name: "Taxa Pix", price: 1.99, unit: "percentual", per: "cobrança", planIds: ["profissional"] }` · Terapee `{ name: "WhatsApp próprio", price: null, unit: "mes", planIds: ["individual","clinica"], unlocks: ["wpp-lembrete"] }` |
| `checkedPages` | `z.array(z.object({ kind: z.enum(['precos','comparativo','faq','termos','checkout','ajuda','home']), url: Url }))` | prova de onde a coleta olhou |

Derivados (o app calcula, **não** gravar): desconto anual %, R$/dia, preço por profissional, faixa, custo real, cobertura do pacote, `fromMonthly` (continua gravado por compatibilidade).

**Kzloo (`intel/referencia.json` → `price`)**: aceitar `plans[]` no **mesmo formato** e `range: { min: 100, max: 129 }`. O plano único da Kzloo: `matrix` = células `_nos` com `sim` da matriz; limites e ciclos = "a definir" até o aval.

### 3.10 Re-coleta (fase D): checklist por concorrente
Atualizar `.claude/skills/analise-concorrentes/references/modulos.md` → seção `precos` com os campos novos e este checklist. Rodar com `npm run analise -- pedir kz --all precos --force`, 1 subagente Sonnet por concorrente (até 5 em paralelo). **Precisa de navegador** (clicar no seletor mensal/anual e abrir "ver todos os recursos"); o `site/precos.md` estático não basta.

Rascunho do prompt (vai junto do prompt-padrão da skill):
> Módulo `precos` em modo completo. Para **<nome>**:
> 1. **Ache todas as páginas de preço:** `/planos`, `/precos`, `/pricing`, o bloco de preços da home, a página de clínica/equipe, "comparar planos" / "ver todos os recursos", FAQ, termos de uso, central de ajuda (busque "limite", "mensagens", "cancelar", "reembolso"), e o início do cadastro/checkout (pede cartão no teste?). Registre cada uma em `checkedPages`.
> 2. **Ciclos:** anote qual ciclo a página mostra ao abrir (`pageDefaultCycle`). Clique em cada opção (mensal, trimestral, anual, bienal) e grave os valores de cada plano. Nunca calcule anual a partir do mensal; se o site só mostra o total, `yearlyMonthly = total / 12` e diga em `notes`.
> 3. **Cada plano:** `id`, `audience`, `seats` (profissionais inclusos, máximo, preço do assento extra, secretária), `includes` com **a lista completa** (se o site diz "tudo do anterior", copie a lista do anterior e acrescente; preencha `inherits`), `limits` com número (pacientes, sessões, msgs de WhatsApp, minutos/sessões de vídeo, créditos de IA, NF, armazenamento). "Ilimitado" escrito no site → `unlimited: true`; sem informação → não grave o limite.
> 4. **Matriz:** leia o catálogo `companies/kz/intel/matriz.json > features` e, para cada plano, grave em `matrix` os ids que o plano tem (`sim`) ou tem em parte (`parcial` + `note` até 50 caracteres). Só com evidência na página.
> 5. **Promoção:** preço riscado → `regularMonthly`; prazo → `promo.until`.
> 6. **Extras pagos:** cada add-on em `addOns` com preço, unidade (`mes`, `unico`, `por-uso`, `percentual`), sobre o quê (`per`), em quais planos e qual funcionalidade destrava. Taxas de cobrança (Pix, cartão) entram aqui.
> 7. **Condições:** `trialDays`, `trialNeedsCard`, `trialPlanId`, `refundDays` + `refundScope`, `commitment` (procure "fidelidade", "multa", "cancele quando quiser" nos termos), `paymentMethods`.
> 8. **Plano sem preço** ("fale com consultor") vira plano com `onRequest: true`, não texto em `extras`.
> 9. Mantenha `highlights` (até 3 destaques como o site mostra) e `fromMonthly`. Sem evidência → campo vazio e `confidence: "baixa"`.
> 10. No fim, em até 8 linhas: o que mudou em relação ao arquivo anterior (preço novo, plano novo, promo), o que não achou.

Conferência à mão (pronto quando): **GestorPsi** (o que os R$ 34,50 incluem; o "pagamento eletrônico" muda o preço?), **PsicoManager** (anual por padrão, limites de créditos) e **Mais Terapias** (promo + créditos de WhatsApp). Depois: `npm run validate` e atualizar a tabela do `COMPETITORS.md` se algum preço mudou.

---

## 4. Aba que substitui "Mensagem": **Posicionamento**
Pergunta-mãe: **como cada concorrente se apresenta e vende na home, e onde a Kzloo pode soar diferente.** Visões por chips internos (`?pv=`), na ordem:

| # | visão | ícone | prio | dados |
|---|---|---|---|---|
| 1 | **Estrutura** (matriz de seções) | `LayoutList` | A | atuais |
| 2 | **Promessa** (headlines lado a lado) | `MessageSquareQuote` | A | atuais (+ `hero.angle` opcional) |
| 3 | **Porta de entrada** (CTAs e oferta de entrada) | `MousePointerClick` | A | atuais + `precos` |
| 4 | **Prova** (prova social) | `BadgeCheck` | M | atuais |
| 5 | **Tom** | `Speech` | M | atuais |
| 6 | **Vale copiar** | `Lightbulb` | M | atuais |

### 4.1 Estrutura: matriz seção × concorrente (obrigatória)
- **Linhas = tipos de seção**, ordenadas pela **posição típica** (média da posição relativa na página: 0% = topo, 100% = fim). **Colunas** = 1ª coluna fixa com o nome da seção + barra "quantos têm" (n/11 e %) + chip **Padrão / Comum / Rara**; depois **Kzloo** (fixa, destacada) e os concorrentes.
- **Célula** = número da posição da seção naquela página (1, 2, 3…), com fundo em 3 tons (terço de cima / meio / fim). Vazio = não tem. Seção repetida (ex.: Terapee tem 2× `features`) → mostra as duas posições ("7·8"). Hover → `title` e `summary` da seção.
- **Linha extra "Prova social (qualquer)"** = depoimentos ∪ números ∪ logos ∪ prova-social.
- Filtros à vista: chips `Padrão | Comum | Rara | Todas` e ordem `posição típica | frequência`. Rodapé (`rodape`) fica fora da conta (é trivial e foi anotado em só 9/11).
- Rodapé da matriz: "Páginas com mais seções: Terapee 17 · Sintropia 12 … menos: GestorPsi 6".

**A conta com os dados reais** (11 homes, sem rodapé; `outro` agrupado pelo título):

| seção | têm | % | posição típica | classe | quem **não** tem |
|---|---|---|---|---|---|
| hero | 11 | 100% | 0% | **Padrão** | — |
| features | 10 | 91% | 33% | **Padrão** | GestorPsi |
| benefícios | 9 | 82% | 42% | **Padrão** | PsicoManager, Sintropia |
| FAQ | 9 | 82% | 92% | **Padrão** | Clínica Ágil, GestorPsi |
| preços na home | 8 | 73% | 83% | **Padrão** | Allminds, Clínica Ágil, PsicoManager |
| *prova social (depoimentos ∪ números)* | 9 | 82% | — | **Padrão** | GestorPsi, PersonCare |
| solução | 7 | 64% | 26% | Comum | |
| depoimentos | 7 | 64% | 63% | Comum | |
| CTA final | 6 | 55% | 93% | Comum | |
| problema | 5 | 45% | 22% | Comum | |
| como funciona | 5 | 45% | 34% | Comum | |
| números | 5 | 45% | 26% | Comum | |
| segurança/LGPD | 5 | 45% | 59% | Comum | |
| para quem é (*outro*) | 4 | 36% | 56% | Rara | |
| demonstração (*outro*) | 3 | 27% | 66% | Rara | |
| blog | 3 | 27% | 98% | Rara | |
| fundador | 2 | 18% | 44% | Rara | só Mais Terapias, Sintropia |
| comparativo | 1 | 9% | 63% | Rara | só Terapee |
| migração (*outro*) | 1 | 9% | 75% | Rara | só Terapee |
| suporte humano, mídia, comunidade, diferencial (*outro*) | 1 cada | 9% | — | Rara | |
| logos de clientes, integrações | 0 | 0% | — | — | ninguém |

Classes: **Padrão ≥ 70%** · **Comum 40–69%** · **Rara < 40%**.

**Kzloo na matriz:** não há LP publicada; a fonte é a **carta-base** (`campaigns/2026-10-07-carta-base/carta.md`), mapeada assim (marcar a coluna como "carta, rascunho"): hero (1) · problema (2–3) · solução (4) · como funciona "o seu dia" (5) · benefícios (6) · **fundador** (7) · **"o que a kz não faz" → comparativo** (8) · preços (9) · **garantia** (10) · FAQ (11) · CTA/P.S. (12). Para isso, `referencia.json` ganha `landing: { source, sections: [{ type, title }] }` no mesmo formato do módulo.

**O que a matriz já prova (insight):**
- O "kit mínimo" do mercado é hero → features → benefícios → preços → FAQ, com prova social. A carta da Kzloo cobre o kit, **menos prova social** (ainda não há clientes: compensar com fundador e garantia) e **sem bloco de segurança/LGPD** (45% têm; em saúde mental é objeção real).
- As seções em que a Kzloo pode se diferenciar são **raras no mercado**: fundador (2/11), comparativo honesto "quando não é pra você" (1/11), garantia explícita como seção (0/11). Ninguém usa logos nem integrações.
- Só 5/11 abrem com **problema**; as maiores (Corpora, PsicoManager) vão direto a features e números.

### 4.2 Promessa (headlines lado a lado)
Grade compacta de cards (2–3 por linha, rola por dentro), Kzloo primeiro: logo · headline (grande) · subheadline (2 linhas) · CTA (chip) · visual do hero (texto pequeno) · chip de **ângulo**.
Ângulo = campo opcional novo `landing.hero.angle: z.enum(['dor','resultado','categoria','prova','emocional'])`. Sem o campo, o chip não aparece (não inferir no código). Leitura possível hoje, para conferir quando o campo for preenchido: dor específica = Psicoplanner (prontuário), PsiNota (nota) e Kzloo (5 apps); resultado = Terapee; categoria/prova = Clínica Ágil, Corpora, PersonCare, Allminds; emocional = Mais Terapias, PsicoManager, Sintropia, GestorPsi.
Filtro: por ângulo; busca por palavra (ex.: "IA", "WhatsApp").

### 4.3 Porta de entrada (CTA e oferta de entrada)
Tabela 1 linha por concorrente: CTA principal · tipo (`testar grátis` / `criar conta grátis` / `demonstração` / `pedir acesso`) · CTAs secundários (chips) · teste (dias, cartão) · plano grátis · preço na home (sim/não, da Estrutura) · garantia. Tipo do CTA por regra simples no app (regex sobre `hero.cta`: grátis|gratuit|teste|experimente → teste; demonstra → demo; senão → outro), com override se `hero.angle`/campo novo vier.
Insight com os dados: **10/11 levam a teste ou conta grátis**, 1/11 a demonstração (Clínica Ágil); a Kzloo ("Pedir meu acesso", aprovação manual) é a **única porta com fricção**: decisão consciente, precisa ser explicada na página.

### 4.4 Prova (média)
Matriz tipo de prova × concorrente: nº de usuários · nº de sessões/atendimentos · depoimentos com CRP · selo/mídia/instituição · nota em loja · "maior número declarado". Fonte: `socialProof` (classificar por regex de número + palavras; o resto em "outros"). Insight: Corpora (+60 mil), Clínica Ágil (+45 mil), PsicoManager (+40 mil) brigam por "o maior"; PersonCare não mostra prova nenhuma.

### 4.5 Tom (média)
Lista: concorrente · `tone` · chips de adjetivos extraídos (institucional, corporativo, acolhedor, técnico, direto) e a Kzloo (`message.tone`). Alerta a destacar: **Sintropia ("acolhedor, calmo e cuidadoso") é o tom mais próximo do da Kzloo**; 6 dos 11 são descritos como "institucionais" ou "corporativos" (Corpora, GestorPsi, Mais Terapias, PsicoManager, Clínica Ágil, PersonCare).

### 4.6 Vale copiar (média)
Feed dos `interesting` de todos, agrupado por tema (preço/ancoragem, quebra de objeção, prova, demonstração, SEO, IA com limite) com filtro por tema e "Virar tarefa" (reusar o hook de tarefa das Brechas, quadro `vendas`). O agrupamento por tema precisa de tags: na fase F, regex simples; tags por IA ficam para depois.

### 4.7 Ajuste pequeno no schema `landing` (opcional, barato)
- `sections[].type`: acrescentar `demonstracao`, `para-quem`, `migracao`, `garantia`, `suporte` (hoje caem em `outro`). Reclassificar os `outro` atuais por script a partir do `title` (12 entradas) e revisar.
- `hero.angle` (4.2). Os dois são `nullish`/superset: nada quebra.

---

## 5. Ordem de implementação e avais

| ordem | fase | o quê | depende de |
|---|---|---|---|
| 1 | C | nomes e ordem (seção 1), `?v=posicionamento` aceito junto de `mensagem` | — |
| 2 | F1 ∥ D | **Posicionamento**: Estrutura + Promessa + Porta de entrada (dados atuais) · **Dados de preço**: schema (3.9), `modulos.md` (3.10), re-coleta dos 11, conferência de 3, `referencia.json` da Kzloo | C |
| 3 | E1 | **Preços compacta**: faixa de números + régua + tabela de planos + faixas (funciona já com os campos atuais; ganha limites/extras quando D chegar) | pode começar com C |
| 4 | E2 | **Lado a lado** + plano equivalente + custo real + Funcionalidades "por plano" | D |
| 5 | F2 | Prova, Tom, Vale copiar; enum novo de seções + `hero.angle` | F1 |
| 6 | G | revisão de UX e dados (conferir os números da seção 3.2 e 4.1 contra a tela) | E2, F2 |
| depois | M/B | painéis M e B da seção 2 → `roadmap/BACKLOG.md` | |

**O que precisa de aval do Oliver** (só o que muda negócio ou dado):
1. **Preço da Kzloo na comparação:** usar R$ 129 (copy) ou a faixa R$ 100–129? Muda a faixa (Premium × Intermediária) e com quem ela é comparada. E os % do trimestral/anual (hoje "a definir").
2. **Pacote Kzloo** que define o "plano equivalente" (os 8 ids da seção 3.4): confirma ou ajusta.
3. **Perfil-padrão para custo real** (sessões/mês, pacientes ativos, valor da sessão) para somar add-ons por uso e taxas; sem ele, add-ons por uso aparecem só como nota.
4. **Re-coleta de preços dos 11** com navegador (11 subagentes Sonnet) e reclassificação dos `outro` da landing: ok para rodar?

Nomes das abas: decisão pequena, seguir e avisar (fase C).
