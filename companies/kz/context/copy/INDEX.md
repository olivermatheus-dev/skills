---
artifact: copy_foundation_index
company: kz
generated_at: 2026-04-16
version: 1
---

# Copy Foundation — kz

Este pacote contém os 7 artefatos de copy foundation para venda direta, todos derivados dos context files do setup (`PRODUCT_CONTEXT`, `AUDIENCE_PROFILES`, `COMPETITOR_MAP`, `BRAND_VOICE`, `COMPANY_PROFILE`).

**Status global:** todos os 7 artefatos aprovados em versão 1.

**Pode ser consumido por:**
- **Humanos** — escrevendo sales page, e-mail BOFU, VSL ou scripts manualmente
- **Skills downstream** (Camada Marketing futura) — `/copy-sales-page`, `/copy-email-sequence`, `/copy-vsl-script` consumirão este pacote

## Modo de geração

- **Modo:** unificado (a persona Mariana é simultaneamente decisora e usuária — terapeuta solo, sem secretária/sócios, conforme `AUDIENCE_PROFILES.md`)
- **Perfis:** [unificado]
- **Estrutura:** artefatos na raiz de `context/copy/`
- **Status do contexto base:** ~25% validado · ~65% hipótese · ~10% estimativa — **revalidação obrigatória 30 dias após os primeiros pagantes reais**

Para detalhes da sessão (depósito intermediário, histórico de decisões, versões rejeitadas), ver [`COPY_SESSION_STATE.md`](COPY_SESSION_STATE.md).

## Artefatos neste pacote

| # | Arquivo | Status | Quando usar |
|---|---|---|---|
| 1 | [`BIG_IDEA.md`](BIG_IDEA.md) | ✅ approved v1 | Toda peça começa por aqui. H1 de sales, subject de e-mail, hook de topo. **Promessa:** *"Um sistema feito por terapeuta — para você voltar a ser só terapeuta."* |
| 2 | [`UNIQUE_MECHANISM.md`](UNIQUE_MECHANISM.md) | ✅ approved v1 | Seção "como funciona", reply a "é igual a X", post técnico sobre anti-empilhamento. **Nome:** *Sessão Inteira*. |
| 3 | [`MECHANISM_OF_FAILURE.md`](MECHANISM_OF_FAILURE.md) | ✅ approved v1 | "Por que você ainda sofre" em sales page, e-mail #2 da nutrição, post "o motivo real pelo qual seu consultório parece bagunçado". |
| 4 | [`OBJECTIONS.md`](OBJECTIONS.md) | ✅ approved v1 | FAQ da sales page, sequência de 5 e-mails BOFU, VSL, roteiro de call. **Ordem da Mariana:** #3 → #4 → #5 → #1 → #2. |
| 5 | [`VALUE_STACK.md`](VALUE_STACK.md) | ✅ approved v1 | Seção "O que você recebe" + ancoragem de preço. **Stack:** R$ 2.295/mês em valor vs. R$ 129/mês de preço. |
| 6 | [`PROOF_HIERARCHY.md`](PROOF_HIERARCHY.md) | ✅ approved v1 (com gaps) | Qualquer "por que confiar". **Nota:** pré-lançamento → Tier 1-2 são gaps; arsenal atual é Tier 4 (founder) + Tier 5 (tempo) + roadmap de coleta. |
| 7 | [`CTA_LIBRARY.md`](CTA_LIBRARY.md) | ✅ approved v1 | Qualquer CTA. 15 base (3 por nível) + 7 adaptações por plataforma. Tom pacífico (BRAND_VOICE). |

## Artefatos centrais (resumo executivo)

**Big Idea (Promessa Central):**
> "Um sistema feito por terapeuta — para você voltar a ser só terapeuta."

**Unique Mechanism:**
> **Sessão Inteira** — "É como uma mesa de trabalho onde tudo já está aberto e à mão — em vez de quatro abas que você precisa lembrar de consultar."

**Vilão da categoria:**
> "A suposição de que consultório se resolve empilhando ferramentas — quando o que a sessão precisa é uma tela só."

**Objeção mais pesada da Mariana:**
> *"E se eu pagar e não usar? Vou cair em mais um sistema pesado que largo no mês 2?"*
> → resposta: *"A gente também teria medo. Por isso a kz foi construída pra caber na cabeça já na primeira abertura — não pra ter 'curso de onboarding'."*

**Âncora de preço mais forte:**
> "Você já perde entre R$ 500 e R$ 1.500 por mês em pacientes que esqueceram, no-shows sem confirmação e receita captada pela metade. O preço da kz é uma fração disso — e para no primeiro lembrete WhatsApp enviado."

**CTA BOFU padrão:**
> "Dá pra ver como funciona aqui" (pergunta > imperativo; literal do BRAND_VOICE)

---

## Receita: montagem de sales page de lançamento

Ordem recomendada usando os 7 artefatos + ajustes para pré-lançamento (sem Tier 1-2 ainda).

```
1. Hero          → BIG_IDEA.md (Promessa Central)
                   + PROOF Tier 4 narrativo ("feito por um terapeuta em exercício")

2. Problema       → MECHANISM_OF_FAILURE.md (bloco "Antes/Descobriu/Por que")
                    Aqui acontece a realocação de culpa — "não é você, é a categoria"

3. Solução        → UNIQUE_MECHANISM.md (nome + narrativa + metáfora da mesa)

4. Benefícios    → VALUE_STACK.md (stack de 6 itens em tabela com valores)

5. Prova          → PROOF_HIERARCHY.md (primeiros 30 dias: origin story do founder em profundidade;
                    após 30 dias: substituir por 2-3 cases Tier 2)

6. Oferta        → VALUE_STACK.md (Âncora 1 — Custo da Inação, preço R$ 129 visível)
                   + CTA_LIBRARY.md (Nível 4 — "Pedir meu acesso")

7. Objeções/FAQ → OBJECTIONS.md (5 universais na ordem 3 → 4 → 5 → 1 → 2)

8. CTA final     → CTA_LIBRARY.md (Nível 5 — "Começar meu consultório na kz")
```

**Regra:** repetir CTA principal a cada altura de tela (ver CTA_LIBRARY > Sales page).

---

## Receita: sequência de 5 e-mails BOFU

```
Email 1 — Problema nomeado + realocação de culpa  → MECHANISM_OF_FAILURE (bloco narrativo)
                                                    Subject: "Não é você, é a categoria."

Email 2 — Solução revelada                        → UNIQUE_MECHANISM (Sessão Inteira)
                                                    Subject: "Uma tela só para atender."

Email 3 — Prova social                             → PROOF_HIERARCHY (dias 0-30: origin story;
                                                    dias 30+: caso Tier 2 de colega terapeuta)

Email 4 — Objeção #4 (preço) + Âncora 1            → OBJECTIONS #4 + VALUE_STACK Âncora 1
                                                    Subject: "Google Agenda custa mais do que parece."

Email 5 — Oferta + CTA final                       → VALUE_STACK (stack + preço) + CTA Nível 5
                                                    Subject: "Se fizer sentido, seu acesso está aqui."
```

**Nota:** nenhum e-mail usa urgência artificial. Se a Mariana não abre/não responde após o 5º, **parar** — respeitar o silêncio é parte do tom da marca.

---

## Receita: VSL / vídeo-venda (baseado em founder terapeuta, 15-20 min)

```
0:00   Hook            → MECHANISM_OF_FAILURE (vilão nomeado em 1 frase)
                          "Se você acha que é desorganizada, deixa eu te contar o que descobri..."

0:30   Promessa         → BIG_IDEA (Promessa Central)

1:30   Autoridade       → PROOF_HIERARCHY Tier 4 + 5 (founder é terapeuta em exercício
                           + 2 anos construindo com um terapeuta no time)

3:00   Storytelling    → MECHANISM_OF_FAILURE (narrativa Antes/Descobriu/Por que)
                          Founder em 1ª pessoa conta a dor dele — pessoal, acolhedor

6:00   Revelação        → UNIQUE_MECHANISM (Sessão Inteira demonstrada em tela)

10:00  Prova           → PROOF_HIERARCHY (nos primeiros 30 dias: depoimentos beta;
                         após 30 dias: cases Tier 2 completos)

13:00  Oferta           → VALUE_STACK (Âncora 1: Custo da Inação + preço R$ 129 visível)

16:00  Objeções          → OBJECTIONS (as 5 em ordem de peso; total ~3 min)

19:00  CTA              → CTA_LIBRARY (Nível 4-5: "Se fizer sentido, peça seu acesso aqui")
```

**Regra de tom:** BRAND_VOICE variação BOFU — pacífico, acolhedor, sem venda empurrada. O founder fala como colega de profissão, não como vendedor de sistema.

---

## Receita: carrossel MOFU para Instagram (10 slides)

```
Slide 1 (capa)          → hook do MECHANISM_OF_FAILURE
                           "Se seu consultório parece bagunçado, talvez não seja você."

Slide 2                  → diagnóstico (Falha 1 — Fragmentação por Soma)
Slide 3                  → diagnóstico (Falha 2 — Gestor, não terapeuta)
Slide 4                  → diagnóstico (Falha 3 — Sistema pesado demais)
Slide 5 (virada)         → "Então descobri uma coisa" — transição
Slide 6                  → UNIQUE_MECHANISM (Sessão Inteira apresentada)
Slide 7                  → metáfora da mesa de trabalho
Slide 8                  → prova qualitativa (Tier 4 + 5 — founder)
Slide 9                  → BIG_IDEA (Promessa Central com destaque visual)
Slide 10 (CTA)           → CTA_LIBRARY Nível 4 ("Dá pra ver como funciona aqui — link na bio")
```

---

## Critério de qualidade — antes de publicar qualquer peça

Antes de enviar/postar qualquer copy da kz:

- [ ] Conecta à Big Idea? Se não, não está fazendo seu trabalho
- [ ] Usa o nome do Mechanism (Sessão Inteira) quando cita solução
- [ ] Nenhuma palavra proibida do BRAND_VOICE (transforme, escale, 10x, disrupção, otimize, conversão, "COMPRE AGORA")
- [ ] Tom pacífico — sem urgência fabricada, sem imperativo agressivo
- [ ] CTA calibrado pelo nível de consciência da peça (não misturar Nível 2 e Nível 5 na mesma)
- [ ] Se cita prova: Tier 4/5 está bem emparelhado com Tier 1/2 quando disponível
- [ ] Se cita preço: Âncora 1 (Custo da Inação) explicitada antes

---

## Estado do contexto e revalidação

**Campos de maior risco (hipótese, não validado):**

| Campo | Onde está | Ação para validar |
|---|---|---|
| Ring 3 da Mariana ("medo de largar no mês 2") | OBJECTIONS #3 + MECHANISM_OF_FAILURE | Pergunta aberta nos primeiros 10 fechamentos |
| Custo de inação R$ 500-1.500/mês | VALUE_STACK + Âncora 1 | Self-report dos primeiros 10 pagantes em 30 dias |
| Distribuição de consciência 20/35/25/15/5 | CTA_LIBRARY + estratégia de conteúdo | Observar de onde vêm os primeiros pagantes |
| Hipótese de audiência hipno/integrativa | OBJECTIONS #2 | Validar se chegam ao topo do funil ou permanecem hipótese |
| Tom acolhedor conversa com a persona | Todos os artefatos (BRAND_VOICE) | A/B test com 3-5 posts de tom distinto |

**Prazo de revalidação recomendado:** 30 dias após os primeiros pagantes reais. Se o lançamento é maio/2026, revalidação prevista para **junho–julho/2026**.

---

## Regeneração

Para atualizar estes artefatos quando algo mudar no setup (nova persona, novo concorrente, mudança de ticket, bug descoberto em uma hipótese):

```
/setup-copy-foundation kz
```

A skill detecta arquivos existentes e oferece:
- Atualizar todos (re-derive + re-pergunta do zero)
- Atualizar apenas os que tiveram `source_files` modificados desde a última geração
- Pular existentes e gerar só os faltantes

---

## Próximos passos sugeridos

1. **Usar este pacote para escrever a primeira sales page de lançamento** (manual, até Camada Marketing existir)
2. **Agendar coleta de provas:** entrevistar beta/primeiros pagantes com template do PROOF_HIERARCHY (meta: 3 cases até dia 30)
3. **Publicar primeiro conteúdo orgânico** no Instagram/LinkedIn usando a Receita do carrossel MOFU como primeiro teste
4. **Revalidar aos 30 dias:** rodar `/setup-copy-foundation kz` novamente e comparar — qual dos 5 campos de maior risco se confirmou, qual precisa de ajuste

## Changelog

- **2026-04-16** — Versão 1 gerada após setup completo em modo Caminho C. Status de todos os 7 artefatos: approved. Contexto base ~65% hipótese — revalidação obrigatória em ~30 dias pós-lançamento.
