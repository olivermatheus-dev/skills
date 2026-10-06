---
name: landing-page
description: Escreve e revisa páginas de conversão em pt-BR — landing page (LP) curta para tráfego pago, página de captura, carta de vendas longa (sales letter direct-response) e roteiro de VSL — a partir do contexto da empresa. Use quando o usuário pedir "landing page", "LP", "página de vendas", "carta de vendas", "sales letter", "página de captura", "VSL script", "roteiro de VSL" ou "revisar copy de página".
---

# Landing Page

Cria ou revisa a copy de uma página de conversão usando o contexto da empresa. Saída: um `.md` pronto para o designer/dev montar.

## Antes de começar

1. **Empresa:** se o slug não foi dado, inferir pela lista no `CLAUDE.md`; se houver dúvida, perguntar.
2. **Ler contexto** em `companies/<slug>/context/`: `BUSINESS.md`, `AUDIENCE.md`, `VOICE.md`, `COPY.md` (obrigatórios); `COMPETITORS.md`, `VISUAL.md` (se existirem).
3. Se faltar `COPY.md` ou `AUDIENCE.md`, avisar e pedir o mínimo: oferta, preço, público, principal dor, provas disponíveis.
4. **Nunca inventar** provas, números, depoimentos ou garantias. Onde faltar, deixar `[PROVA: ...]` como marcador.

## Escolher o formato

Escolha pelo **nível de consciência** do público (está em `AUDIENCE.md`) e pela fonte de tráfego.

| Formato | Quando usar | Nível de consciência | Tamanho |
|---|---|---|---|
| **Página de captura** | Troca de isca (aula, e-book, lista de espera, diagnóstico) por contato | Qualquer; ideal 1–3 | 1 dobra + 2–3 blocos |
| **LP curta** | Tráfego pago frio/morno, oferta simples ou ticket baixo/médio, agendamento, WhatsApp | 3–5 | ~8 seções |
| **Carta de vendas longa** | Ticket médio/alto, oferta nova, público cético ou pouco consciente | 1–3 | Longa, narrativa |
| **Roteiro de VSL** | Mesma lógica da carta, quando o público consome melhor vídeo | 1–3 | 5–20 min |

Regra prática: quanto **menos consciente** e **mais caro**, mais longa a página. Quanto mais consciente, mais direto à oferta.

## Processo

1. **Ler contexto** (acima).
2. **Definir em 5 linhas** e mostrar ao usuário antes de escrever:
   - Objetivo (1 ação: comprar, cadastrar, chamar no WhatsApp, agendar)
   - Público/persona
   - Nível de consciência
   - Oferta (o que, preço, bônus, garantia)
   - Fonte de tráfego (anúncio Meta, orgânico, lista)
3. **Escolher a estrutura** (abaixo).
4. **Escrever** seguindo as regras de escrita.
5. **Passar no QA**: `references/qa-copy.md` (Seven Sweeps + CRO + formulário + compliance). Corrigir antes de entregar.
6. **Salvar** em `companies/<slug>/campaigns/AAAA-MM-DD-<slug-da-campanha>/` como `lp.md` (LP curta ou captura), `carta.md` (carta longa) ou `vsl.md` (roteiro de VSL). Se a pasta da campanha já existir, salvar nela.

## Estruturas

### Página de captura
1. Headline com a promessa da isca + subheadline (o que recebe, em quanto tempo)
2. Formulário (2–3 campos) + botão com benefício ("Quero a aula gratuita")
3. 3 bullets do que vai aprender/receber
4. Prova curta (quem é você ou número/depoimento)
5. Linha de privacidade + o que acontece depois do envio

### LP curta (tráfego pago, ~8 seções)
1. **Hero:** headline (mesma promessa do anúncio) + subheadline + CTA + imagem/vídeo
2. **Barra de prova:** número, nota, logos ou mídia
3. **Problema:** a dor nas palavras do público + custo de não resolver
4. **Solução/mecanismo único:** por que isto funciona quando o resto falhou
5. **3 benefícios** (benefício + "o que isso significa" + prova)
6. **Como funciona:** 3 passos
7. **Depoimentos/resultados**
8. **Oferta + garantia + CTA final**, seguido de FAQ curto (3–5 objeções)

### Carta de vendas longa (direct-response)
1. **Headline + lead:** promessa grande ou pergunta/afirmação que nomeia o vilão
2. **História:** origem, identificação com o leitor
3. **Problema + mecanismo da falha:** por que o que ele tentou não funcionou (não é culpa dele)
4. **Mecanismo único:** a virada; o que é diferente
5. **Prova:** casos, números, depoimentos, autoridade
6. **Oferta empilhada:** cada item com valor; âncora antes do preço; preço
7. **Bônus:** cada um resolve uma objeção
8. **Garantia:** reversão de risco clara
9. **Escassez real:** só se existir (vagas, prazo, lote). Nada inventado
10. **CTA** (repetir a cada bloco grande)
11. **FAQ/objeções:** cobrir as 5 objeções universais (não funciona / não funciona pra mim / não consigo / não posso pagar / não confio)
12. **P.S.:** resumo da promessa + garantia + CTA

### Roteiro de VSL (7 passos)
| # | Bloco | Tempo aprox. | Fonte no `COPY.md` |
|---|---|---|---|
| 1 | Hook / quebra de padrão (nomeia o vilão) | 0–30s | mecanismo da falha |
| 2 | Promessa | 30s–2min | big idea |
| 3 | Autoridade (por que me ouvir) | 2–4min | provas |
| 4 | História do vilão | 4–8min | mecanismo da falha |
| 5 | Revelação | 8–12min | mecanismo único |
| 6 | Prova | 12–15min | provas |
| 7 | Oferta + objeções + CTA | 15min+ | value stack, objeções, CTAs |

Escrever em falas curtas, com indicação `[TELA: ...]` para texto/imagem de apoio. Ajustar tempos à densidade.

## Regras de escrita

- **Uma página, um objetivo, um CTA principal.** CTA secundário só se não competir.
- **Congruência com o anúncio:** a headline do hero repete a promessa/ângulo do criativo que traz o tráfego.
- Usar as **palavras literais do público** (`AUDIENCE.md`) e o tom do `VOICE.md`.
- Puxar big idea, mecanismos, objeções, value stack, provas e CTAs do `COPY.md`, sem reinventar.
- Benefício antes de característica; números e prazos concretos; frases curtas; parágrafos de 1–3 linhas (leitura no celular).
- Botões com verbo + benefício ("Quero minha vaga", "Falar no WhatsApp"), nunca "Enviar".
- Brasil: preço em R$, parcelamento ("12x de R$ 49,70"), Pix, botão de WhatsApp quando fizer sentido.
- Frameworks (PAS, AIDA, Schwartz, Cialdini) podem ser citados por nome; não explicar.

## Formato de saída

```markdown
# <Nome da página> — <formato>

**Objetivo:** ... | **Público:** ... | **Consciência:** nível X | **Tráfego:** ...
**Oferta:** ... | **CTA principal:** ...

## Variações de headline (teste A/B)
- A: ... (ângulo: ...)
- B: ... (ângulo: ...)
- C: ...

## Seção 1 — Hero
**Headline:** ...
**Subheadline:** ...
**CTA:** ...
> Design: imagem/vídeo sugerido, posição do botão, o que aparece no mobile sem rolar.

## Seção 2 — ...
(copy completa)
> Design: ...

...

## Pendências
- [PROVA: ...] / dados que faltam / itens para validar com o cliente

## QA
- Resultado resumido do checklist de `references/qa-copy.md` (inclui compliance)
```

Cada seção traz a copy final + uma linha **Design:** (layout, imagem, destaque). Pendências e QA sempre no fim.

## Revisar copy existente

Se o pedido for "revisar copy de página":
1. Ler a copy (colada, arquivo ou URL) + contexto da empresa.
2. Rodar `references/qa-copy.md` inteiro.
3. Entregar: **problemas por prioridade** (alto impacto primeiro), **correções reescritas** (antes → depois) e **2–3 variações de headline**.
4. Salvar como `revisao-lp.md` na pasta da campanha, se houver.

## Nichos regulados

Saúde (psicologia, medicina, nutrição, estética, odontologia), finanças e similares: **sempre** rodar o check de compliance do QA (CFP/CRP, CFM, CRN, CFO etc.: sem promessa de resultado/cura, sem antes-e-depois, depoimentos conforme o conselho). Na dúvida, sinalizar em Pendências em vez de publicar.
