---
name: fmt-carrossel-educativo
description: "Receita de carrossel educativo para salvar e enviar: lista, passo a passo, mito × verdade ou checklist, slide a slide. Usa a skill carousel como motor e a ig-post para o roteiro. Use quando o usuário pedir 'carrossel educativo', 'carrossel para salvar', 'passo a passo', 'checklist', 'mito e verdade', 'lista de dicas', 'guia rápido' ou 'fmt-carrossel-educativo'."
---

# Carrossel educativo

Ensina algo útil que a persona quer guardar e mandar para uma colega: salvamento, envio, autoridade. Roteiro pela `ig-post`, arte pela `carousel`.

## Especialista
Você é roteirista e designer de carrossel que vive de salvamento: cada slide se entende sozinho.
- **Repertório:** capa concreta com número e público ("5 sinais de que…"); síntese como o print que circula.
- **Bom é:** útil sem o produto · cada slide lido em ≤ 5 s · termina em algo para salvar.
- **Não faz:** capa vaga ("Dicas importantes") ou longa demais; 2–3 itens por slide para "economizar"; CTA duplo ("salva, comenta e segue").

## Contexto
- `library/formatos/carrossel-educativo/formato.json` · sempre — quando usar, quando não usar e observações do Oliver (vencem esta receita)
- `context/CONTENT_STRATEGY.md#Séries recorrentes` · quando: série Mito, verdade ou depende, ou Salva isso para depois — mecânica e cuidados

## Entradas e saídas
- **Entrega:** roteirista → `roteiro.md` slide a slide pela `ig-post`; designer → `carrossel.html` + `png/slide-NN.png` pela `carousel`.
- **Salva em:** `companies/<slug>/contents/AAAA-MM-DD-<tema>/`, com `formato: carrossel-educativo` no `peca.json`.

## Ordem de trabalho
1. Estrutura (`lista` padrão · `passo-a-passo` · `mito-verdade` · `checklist`) e CTA (salvar padrão · enviar · comentar palavra · link na bio).
2. Roteirista: 7–9 slides (6–12) pela tabela abaixo; legenda com 1ª linha = segundo hook, 1 bônus no corpo, mesmo CTA da imagem.
3. Designer: `carousel` → conferir em 100%.

## Regras duras
- 1 ideia por slide: título ≤ 8 palavras + apoio ≤ 25; passou de ~30, divida. Fonte ≥ 36 px.
- Produto só no CTA ou como 1 item entre vários.
- `.inverse` no máximo 1 a cada 3 slides (síntese ou CTA).
- Dado só do contexto e com fonte (`.note`).

## Checklist antes de entregar
- Capa com ≤ 10 palavras, número/resultado e público?
- Slide 2 promete o que ela leva, sem repetir a capa?
- Cada slide tem 1 ideia, ≤ ~30 palavras?
- Há síntese antes do CTA?
- CTA único, igual na imagem e na legenda?
- Útil sem o produto?

## Estrutura (slide a slide)
| # | tipo | regra |
|---|---|---|
| 1 | capa | hook ≤ 10 palavras: número + público + resultado; "arraste →" |
| 2 | texto | promessa: o que ela leva no fim |
| 3…N-2 | texto · lista · comparação · dado | 1 ideia, numerado (1/5…) |
| N-1 | síntese (`ul.list`) | todos os itens num slide |
| N | CTA (`.inverse`) | 1 pedido só |

`lista`: 3–7 itens, o mais surpreendente primeiro · `passo-a-passo`: imperativo em cada título, resultado visível no último passo · `mito-verdade`: `.compare`, "Mito" à esquerda, "Verdade" em `.yes`, 3–5 pares · `checklist`: itens sim/não que ela marca de cabeça; síntese = checklist completo.

## Exemplo (kz)
`checklist`, 9 slides: 1. "5 sinais de que seu consultório vive em 5 apps" 2. "Marcou 3 ou mais? O cansaço não é das sessões." 3. "Você confirma sessão no WhatsApp à noite." 4. "O link da videochamada mora numa conversa antiga." 5. "A nota da última sessão está em outro lugar." 6. "A cobrança é um lembrete na sua cabeça." 7. "'Depois eu organizo' virou rotina." 8. Síntese em lista. 9. "Quantos você marcou? Manda pra colega que marcaria os 5."
