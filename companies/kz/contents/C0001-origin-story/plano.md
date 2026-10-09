# Plano de slides · Origin story do fundador
> Status: aguardando aval · 10 slides · 1080x1350 · roteiro: roteiro.md · wireframes: wireframes.png
> Refaz a v1 antiga (`v1-antigo/png/`). Prova do fluxo novo (tarefa 049, onda 2): a `v1/` foi produzida junto para teste, antes do aval.

## Leitura de design
Carta de fundador em 10 slides: voz de par para a terapeuta que atende sozinha, editorial e calma, tipo grande em grafite sobre creme e tons do coral, as 5 ferramentas como único objeto, coral só em pontos.

## Motivo
As 5 ferramentas abertas (Agenda, WhatsApp, Meet, Caderno, Site) — s1 5 abas fixadas (só ícone) no alto, barra sangrando → s2 5 marcas numa régua → s3 pilha torta ocupando o slide → s4–s6 somem (o peso vira frase) → s7 5 fios convergem numa tela só → s10 a régua de respostas 1 a 5+ · identidade fixa: 5 itens, mesmos ícones Lucide no coral, mesma ordem, nome curto.

## Arco
| # | papel | família | fundo | herói | ênfase |
|---|---|---|---|---|---|
| 1 | gancho | capa-tipografica | creme | "Eu também queria só atender." em display, embaixo | — |
| 2 | contexto | split | tom-50 (campo tom-200) | "Sou hipnoterapeuta. Atendo pacientes até hoje." | — |
| 3 | tensão | pilha | creme | a pilha de 5 cards tortos, sem título | — |
| 4 | tensão | campo | tom-300 | "Estava cansado de gerenciar." | cor: "gerenciar" |
| 5 | tensão | split | creme (campo tom-100 embaixo) | "Achei que era desorganização minha." | — |
| 6 | prova | trilho | branco | "Ouvi a mesma dor, de novo e de novo:" | — |
| 7 | virada | fluxo | tom-900 | "Não era a gente que era desorganizado." + 5 fios → 1 | serifa: "jeito" |
| 8 | prova | numero | tom-50 | o numeral 2 | — |
| 9 | síntese | campo | tom-100 | "Se uma feature complica, não entra." | — |
| 10 | CTA | cta | tom-800 | a pergunta | — |

## Por slide (só o que não está na tabela)
- **s1** · camadas: 5 abas fixadas (só ícone, a 1ª ativa) sobre uma barra que sangra → o motivo entra e a capa vira a página de uma aba · sem eyebrow e sem foto · liga: as abas viram a régua do s2.
- **s2** · campo tom-200 nos 52% de cima → quem ele é × o problema; régua de 5 marcas → mede o "espalhado em 5 apps" · liga: a régua desmonta na pilha.
- **s3** · 5 cards sobrepostos ±2°, dentro da margem → a bagunça vista, sem título (o roteiro não tem) · liga: corte para o slide vazio.
- **s4** · logo na variante ink (a coral some no tom-300) · o vazio entre as duas frases é o cansaço; tom-300 = fim de tarde, quente · liga: volta ao creme, voz baixa.
- **s5** · campo tom-100 só embaixo (o inverso do s2), os dois textos encostados na costura: em cima ele sozinho, embaixo a ida aos colegas; seta coral empurra para o s6.
- **s6** · trilho com 3 nós de ícone (sem 1-2-3: não há sequência) + hairlines · liga: corte para o escuro.
- **s7** · 5 nós do motivo → fios de 2 px → 1 card com a logo (a "tela só") · único 900 · liga: a tela só vira "esse lugar".
- **s8** · ficha de 2 linhas sob hairline, sem rótulos inventados · "2 anos" com fonte (BUSINESS > Origem).
- **s9** · rótulo do roteiro "Uma regra desde o começo" + assinatura com hairline curta, sem nome · liga: a pergunta devolve a régua.
- **s10** · régua 1, 2, 3, 4, 5+ → o motivo volta como contagem; rodapé sem seta.

## O que muda em relação à v1 antiga
- Âncora troca de lugar (embaixo, cheio, alto, dividido, lista) em vez de texto centralizado na vertical em todos.
- 7 fundos (creme, branco, tom-50, tom-100, tom-300, tom-800, tom-900) em vez de creme fixo com 2 inversos.
- Um objeto (as 5 ferramentas) que evolui; a v1 tinha cards só no s3.
- Ênfase em 2 de 10 slides; a v1 não tinha hierarquia além do tamanho.

## Autocrítica (o default previsível e o que trocamos)
- O default (a v1) seria texto centralizado e o mesmo creme em tudo → 8 famílias, âncora mudando de lugar, 7 fundos sem 3 iguais seguidos.
- O default do catálogo seria a capa em leque e o título "Meu consultório, por muito tempo:" na pilha → capa com faixa de abas (o gesto de ter tudo aberto) e pilha sem título, como no roteiro.
- O default seria a regra (s9) em citação serifada e ênfase em 3–4 títulos → serifa só no "jeito" da virada, cor só no "gerenciar"; a regra fica em Montserrat grande (citação contaria como 2ª serifa na mesma janela de 3).
- O default seria rótulos "O quê / Com quem" e eyebrow "Carta do fundador" → cortados (microcopy fora do roteiro).

## Check
`v1/` (prova): `node tools/carrossel/check.mjs . --html v1/carrossel.html` → 0 ✗ · 0 ⚠ · contraste 48 textos ok.
`node tools/carrossel/plano.mjs check` → 10 slides · 8 famílias · 0 ✗ · 0 ⚠.

## Perguntas ao Oliver (com recomendação)
1. Nome público e foto do fundador: sem eles, capa tipográfica e assinatura "Fundador da kz, hipnoterapeuta". Recomendo manter assim até confirmar; com foto, ela entra no s9 (não na capa).
2. s4 em tom-300 (campo quente) em vez de escuro: deixa o escuro só para a virada (s7) e o CTA (s10), como no roteiro. Recomendo manter.
3. Corte de texto: o "→" do apoio da capa saiu (o rodapé já diz "arraste"); no s8 "São 2 anos de desenvolvimento, com uma terapeuta…" virou numeral + "anos de desenvolvimento" e "Uma terapeuta no time testando cada decisão." Recomendo aprovar.
