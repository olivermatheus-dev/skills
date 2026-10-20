# 6. Números: custos, unidade e metas

> **Tudo o que estiver marcado ESTIMATIVA é conta com premissa declarada, não dado.** Troque a premissa e a conta muda. Fontes de custo: `ludus/docs/reference/hospedagem-e-turn.md` (pesquisa de 27/09/2026, com links) e `context/BUSINESS.md`.

## Custos fixos para operar
| item | custo | fonte |
|---|---|---|
| Servidor (VPS em São Paulo: app, banco, sinalização e vídeo) | ≈ R$ 80/mês | BUSINESS.md; preço da Magalu Cloud não confirmado na página oficial |
| Domínio fulger.com.br | ≈ R$ 40/ano | registro.br |
| **Total técnico** | **≈ R$ 100/mês** | ESTIMATIVA |
| Contador, CNPJ, e-mail, ferramentas, termos de uso | **a levantar** | pergunta do cap. 9 |

**O maior custo não é o servidor.** São as suas horas e o dinheiro de aquisição. O capítulo 7 protege os dois.

## Quanto custa o vídeo
**Como funciona:** a chamada vai direto entre professor e aluno (WebRTC). Ela só passa pelo nosso servidor (relay) quando a rede do aluno bloqueia a ligação direta. Pela literatura, isso acontece em **15% a 30% das chamadas**, taxa ainda não medida no nosso público.

| cenário | horas de aula por mês | horas com relay (15% a 30%) | custo por mês (R$ 0,35 a 0,95 por hora com relay) |
|---|---|---|---|
| 1 professora no Grátis (3 alunos) | ≈ 13 | 2 a 4 | **R$ 0,70 a 3,70** |
| 1 professora de agenda cheia (20 aulas por semana) | ≈ 87 | 13 a 26 | **R$ 4,50 a 25** |
| 100 professoras de agenda cheia | ≈ 8.660 | 1.300 a 2.600 | de 1,7 a 9,4 TB de tráfego: **passa da franquia da VPS** |

- **Banda:** uma hora com relay gasta de 1,35 a 3,6 GB. O preço por hora (R$ 0,35 a 0,95) vem do plano B pago (Cloudflare TURN, US$ 0,05/GB, com 1.000 GB/mês grátis).
- **Conclusão:** para poucas professoras o vídeo custa quase nada. **Em escala, ele pode comer de 9% a 50% do plano de fundador de R$ 49.** Por isso:
  1. medir a taxa de relay real com os testadores antes de decidir o Grátis;
  2. pôr um teto de horas de vídeo em cada plano (uso justo);
  3. separar o servidor de vídeo quando passar de algumas dezenas de professoras ativas.

## Custo de cada assinatura
| item | valor | observação |
|---|---|---|
| Taxa do Stripe (cartão nacional) | ≈ 3,99% + R$ 0,39 por cobrança | **conferir no site do Stripe antes de decidir** |
| Fundador (R$ 49) | ≈ R$ 2,35 de taxa → **≈ R$ 46,65 líquido** | ESTIMATIVA |
| Profissional (R$ 79) | ≈ R$ 3,54 de taxa → **≈ R$ 75,46 líquido** | ESTIMATIVA |
| Anual (R$ 790) | ≈ R$ 31,91 de taxa, uma vez por ano | o anual paga menos taxa e traz caixa |

## Quanto vale um cliente e quanto dá para pagar por ele (ESTIMATIVA)
**Premissas, todas para validar:**
- **5% de cancelamento por mês**, o que dá vida média de 20 meses;
- 5% de taxas.

| turma | receita por mês | LTV (líquido × 20 meses) | teto de CAC com caixa curto (líquido × 3 meses) |
|---|---|---|---|
| **Fundadores** (R$ 49) | R$ 49 | **≈ R$ 930** | **≈ R$ 140** |
| Depois, com mistura de planos (média de R$ 60) | R$ 60 | ≈ R$ 1.140 | ≈ R$ 170 |

**Regra prática:** se um canal traz pagante por **mais de R$ 140** (na turma de fundadores), ele não se paga no tempo que o nosso caixa aguenta. Corta ou muda.

## O funil: o que esperar da fila (ESTIMATIVA)
| etapa | métrica | referência inicial (hipótese) |
|---|---|---|
| Entrou na fila | inscritos ÷ visitas ao site | 10% a 25% |
| Ativou (3 alunos + 1 aula) | ativados ÷ convidados | 40% |
| Usa toda semana | ativos na semana 4 ÷ ativados | 50% |
| Pagou | pagantes ÷ ativos | 15% a 30% |
| **Da fila ao pagante** | 40% × 50% × 15–30% | **3% a 6%** |
| Ficou | cancelamento por mês | ≤ 5% |

**O que isso quer dizer:**
- **300 a 500 na fila dão de 9 a 30 fundadores.** Para chegar a 50–100 fundadores, é preciso uma fila de 830 a 3.300 ou uma conversão maior.
- **Quanto pode custar um inscrito:** R$ 140 × 3% a 6% = **R$ 4 a 8**. Anúncio na Meta raramente traz inscrito tão barato, então **a fila precisa vir do orgânico, de grupos e de parceiros** (cap. 7).
- **A primeira onda de acesso serve para medir.** A conversão real dela substitui estas hipóteses, e só então fixamos a meta.

## Metas para discutir (ESTIMATIVA)
| marco | pagantes | receita por mês | o que significa |
|---|---|---|---|
| Fundadores | 9 a 30 (pelo funil) | R$ 440 a 1.470 | prova que pagam; paga o servidor |
| Validação | 50 | ≈ R$ 2.500 a 3.000 | o produto se paga e gera os primeiros casos |
| Base | 150 | ≈ R$ 7.500 a 9.000 | caixa para testar canais pagos com folga |
| Ambição de 12 meses | 500 | ≈ R$ 25.000 a 30.000 | time mínimo |

A meta de verdade é **sua decisão** (capítulo 9). Ela define quanto conteúdo e quantos parceiros o plano precisa. O cap. 2 mostra só a **ordem de grandeza do mercado**, não uma meta.
