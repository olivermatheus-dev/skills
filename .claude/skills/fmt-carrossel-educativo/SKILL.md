---
name: fmt-carrossel-educativo
description: "Receita de carrossel educativo para salvar e enviar: lista, passo a passo, mito × verdade ou checklist, slide a slide. Usa a skill carousel como motor e a ig-post para o roteiro. Use quando o usuário pedir 'carrossel educativo', 'carrossel para salvar', 'passo a passo', 'checklist', 'mito e verdade', 'lista de dicas', 'guia rápido' ou 'fmt-carrossel-educativo'."
---

# Carrossel educativo

Ensina algo útil que a persona quer guardar e mandar para uma colega. Topo/meio de funil: salvamento, envio por DM, autoridade. Motor: `carousel`; texto: `ig-post`.

## Quando usar / quando não usar
- **Usar:** como fazer, sinais, erros, checklists, regra nova do setor.
- **Não usar:** ideia única (→ `fmt-post-frase`), humor (→ `fmt-meme`), oferta (→ `ads-meta`).

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| estrutura | `lista` | `lista` · `passo-a-passo` · `mito-verdade` · `checklist` |
| slides | 7–9 | 6–12 |
| formato | 1080×1350 | 1080×1080 |
| CTA | salvar | enviar · comentar palavra · link na bio |

## Estrutura (slide a slide)
| # | tipo | regra |
|---|---|---|
| 1 | capa | hook ≤ 10 palavras: número + público + resultado; "arraste →" |
| 2 | texto | promessa: o que ela leva no fim; nunca repete a capa |
| 3…N-2 | texto · lista · comparação · dado | 1 ideia/slide: título ≤ 8 palavras + apoio ≤ 25; numerado (1/5…) |
| N-1 | síntese (`ul.list`) | todos os itens num slide: é o print que circula |
| N | CTA (`.inverse`) | 1 pedido só |

Por estrutura:
- `lista`: 3–7 itens; o mais surpreendente primeiro.
- `passo-a-passo`: verbo no imperativo em cada título; resultado visível no último passo.
- `mito-verdade`: `.compare`, "Mito" à esquerda, "Verdade" em `.yes`; 3–5 pares.
- `checklist`: itens sim/não que ela marca de cabeça; síntese = checklist completo.

## Regras do formato
- Capa concreta ("5 sinais de que…"), nunca "Dicas importantes".
- Cada slide lido em ≤ 5 s; passou de ~30 palavras, divida. Fonte ≥ 36px.
- **Útil sem o produto.** Produto só no CTA ou como 1 item entre vários.
- `.inverse` no máximo 1 a cada 3 slides (síntese ou CTA).
- Dado só do contexto e com fonte (`.note`).
- Legenda: 1ª linha = segundo hook; corpo traz 1 bônus; CTA igual ao da imagem.

## Erros comuns
- Capa vaga ou longa demais para o feed.
- 2–3 itens por slide para "economizar".
- Terminar sem síntese (nada para salvar).
- CTA duplo ("salva, comenta e segue").

## Exemplo (kz)
`checklist`, 9 slides:
1. "5 sinais de que seu consultório vive em 5 apps"
2. "Marcou 3 ou mais? O cansaço não é das sessões."
3. "Você confirma sessão no WhatsApp à noite."
4. "O link da videochamada mora numa conversa antiga."
5. "A nota da última sessão está em outro lugar."
6. "A cobrança é um lembrete na sua cabeça."
7. "'Depois eu organizo' virou rotina."
8. Síntese: os 5 sinais em lista.
9. CTA: "Quantos você marcou? Manda pra colega que marcaria os 5."

## Checklist do formato
- [ ] Capa ≤ 10 palavras, com número/resultado e público?
- [ ] Slide 2 promete e não repete?
- [ ] 1 ideia por slide, ≤ 30 palavras?
- [ ] Síntese antes do CTA?
- [ ] CTA único?
