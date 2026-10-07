---
name: fmt-texto-cinetico
description: "Receita de vídeo só de tipografia animada (10–20 s): gancho → dor → virada → solução → CTA, com tempo por palavra e 1 ideia por tela. Use quando o usuário pedir texto cinético, tipografia animada, kinetic type, vídeo só com texto, reels de frase, 'vídeo sem gravar', 'lettering animado' ou quando não houver tela do produto para mostrar. Usa a skill `video` como motor (plano, render e QA)."
---

# Texto cinético

Estilo default: Editorial + Short Premium
Motor: skill `video` (nível médio por padrão) · regras gerais: `knowledge/video/REGRAS.md`.

Uma ideia só com palavras em movimento. Topo de funil; funciona no mudo, sem print. Aprofundar: `knowledge/video/texto-e-dados.md`.
**Não usar:** mostrar como funciona (→ `fmt-recorte-funcionalidade`) · mais de 5 frases (vira carrossel).

## Parâmetros
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
- **Palavra entra em 0,25–0,35 s**; com locução, no tempo dela no `timeline.json`.
- **Máx. 3 linhas por tela**, quebradas por sentido ("perco paciente / por esquecer").
- **Layouts:** pilha à esquerda (default; linha nova empurra a anterior com `GENTLE`) · centro (≤ 4 palavras) · palavra gigante (~70% da largura, só na virada).
- **Ênfase: 1 palavra por tela, 1 técnica** (`--accent` **ou** peso **ou** escala ≥ 1,3× `SOFT`), chegando por último, na batida.
- **Entre telas:** `swap` ou match cut (a palavra que fica vira âncora, mesma posição). Sem crossfade; texto não treme nem gira.

## Exemplo (kz) — 15 s, 90 BPM, sem locução
- 0 s "Queria só atender." ("atender" em `--accent`) · 2 s "Mas confirmo, / cobro, / mando link…" · 4,3 s "e anoto em 3 lugares."
- 6 s silêncio 0,3 s; "E se fosse um lugar só?" ("um" gigante) · 8,5 s "Agenda, sessão e notas. / Juntas." (`BUSINESS.md`).
- 10,5 s "kz" `GENTLE` · 12,5 s "Peça seu acesso".

## Checklist do formato
- [ ] Palavras em 0,25–0,35 s; ≤ 3 linhas, quebra por sentido?
- [ ] 1 ênfase por tela, 1 técnica, por último?
- [ ] Virada com 0,3 s de silêncio?
- [ ] Trocas por `swap`/match cut, sem crossfade?
