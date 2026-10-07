---
name: fmt-texto-cinetico
description: "Receita de vídeo só de tipografia animada (10–20 s): gancho → dor → virada → solução → CTA, com tempo por palavra e 1 ideia por tela. Use quando o usuário pedir texto cinético, tipografia animada, kinetic type, vídeo só com texto, reels de frase, 'vídeo sem gravar', 'lettering animado' ou quando não houver tela do produto para mostrar. Usa a skill `video` como motor (plano, render e QA)."
---

# Texto cinético

Uma ideia contada só com palavras em movimento. Topo de funil (níveis 1–3): reels e stories que funcionam no mudo, produção rápida, sem depender de print.

## Quando usar / quando não usar
- **Usar:** espelho de dor, quebra de crença, anúncio curto, produto ainda sem tela, frase da persona.
- **Não usar:** mostrar como algo funciona (→ `fmt-recorte-funcionalidade`); argumento com mais de 5 frases (vira carrossel).

## Parâmetros (o usuário pode mudar)
| parâmetro | default | opções |
|---|---|---|
| duração | 15 s | 10 · 20 s |
| áudio | trilha + 1 batida por palavra-chave | com locução (texto = fala, palavra a palavra) |
| layout | pilha à esquerda | centro · palavra gigante · linha que cresce |
| BPM | o do `BRAND.md` (senão 100) | 70–128 |

## Receita de cenas (15 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| gancho | 0–2 s | 2–4 palavras, frase literal da persona, já no 1º quadro | palavras entram `FAST`, stagger 60 ms | pulso no quadro 0 |
| dor | 2–6 s | 2 telas, ≤ 6 palavras cada | troca de tela por `swap` (linha sai, linha nova entra) | batida a cada 2 tempos |
| virada | 6–8 s | 1–3 palavras ("E se não?") | tela esvazia; palavra entra `SOFT` em escala 1,15→1 | 0,3 s de silêncio, depois impacto |
| solução | 8–12,5 s | 2 telas: o ganho + nome do produto | palavra-chave em `--accent`; match cut por posição | motivo melódico |
| CTA | 12,5–15 s | 1 CTA + marca | entra `FAST`, depois parado | cauda |

## Regras do formato
- **Tempo por palavra:** cada palavra entra em 0,25–0,35 s; a tela assentada fica `máx(1,0 s; 0,3 s × palavras)` (ver `ritmo-e-leitura.md`). Com locução, cada palavra aparece no seu tempo do `timeline.json` (até 4 quadros antes).
- **1 ideia por tela, ≤ 6 palavras, máx. 3 linhas.** Quebre a linha por sentido ("perco paciente / por esquecer"), nunca no meio de um sintagma.
- **Layouts seguros:** pilha à esquerda (default; a linha nova empurra a anterior para cima com `GENTLE`) · centro (frases ≤ 4 palavras) · palavra gigante (1 palavra ocupa ~70% da largura, só na virada). Mesmo tamanho de título em 4:5 e 9:16.
- **Ênfase em 1 palavra por tela, uma técnica só:** cor `--accent` **ou** peso maior **ou** escala ≥ 1,3× com `SOFT`. Nunca as três; nunca cor aleatória. A palavra enfatizada chega por último, na batida.
- **Transição entre telas:** `swap` (default) ou match cut — a palavra que fica vira âncora da próxima frase, na mesma posição. Sem crossfade.
- Nada parado: drift 1,00→1,03 na tela assentada; o texto não treme nem gira.
- Fonte, pesos e caixa alta pelo `BRAND.md`. Frase sem fonte de dado não leva número.

## Erros comuns
- Uma palavra por vez em ritmo de metralhadora (ilegível) ou frase inteira de uma vez (vira slide).
- Ênfase em todas as telas.
- Efeito diferente em cada palavra (girar, quicar, glitch).
- Texto sumindo antes do tempo de leitura.
- Fundo com gradiente para "dar vida".

## Exemplo (kz) — 15 s, 90 BPM, sem locução
- 0,0 s — "Queria só atender." (frase do `AUDIENCE.md`), "atender" em `--accent`.
- 2,0 s — `swap`: "Mas confirmo, / cobro, / mando link…"
- 4,3 s — "e anoto em 3 lugares."
- 6,0 s — silêncio 0,3 s; "E se fosse um lugar só?" ("um" gigante com `SOFT`).
- 8,5 s — "Agenda, sessão e notas. / Juntas." (módulos de `BUSINESS.md`).
- 10,5 s — "kz" assenta `GENTLE` · 12,5 s — "Peça seu acesso" + logo.

## Checklist do formato
- [ ] ≤ 6 palavras e 1 ideia por tela?
- [ ] Tempo mínimo de leitura em toda tela?
- [ ] 1 ênfase por tela, 1 técnica?
- [ ] Virada com silêncio e contraste de ritmo?
- [ ] Funciona no mudo?
- [ ] Pipeline: siga a skill `video`.
