---
name: fmt-texto-cinetico
description: "Receita de vídeo só de tipografia animada (10–20 s): gancho → dor → virada → solução → CTA, frase inteira por tela e 1 ideia por tela. Use quando o usuário pedir texto cinético, tipografia animada, kinetic type, vídeo só com texto, reels de frase, 'vídeo sem gravar', 'lettering animado' ou quando não houver tela do produto para mostrar. Usa a skill `video` como motor (plano, render e QA)."
---

# Texto cinético

Uma ideia só com palavras em movimento: frase inteira por tela, sem print nem gravação. Topo de funil; funciona no mudo. Motores: `plano-de-cenas` e `video` (nível médio); os **Padrões do Oliver** (skill `video`) mandam sobre esta receita. Estilo: Editorial + Short Premium.

## Especialista
Você é designer de tipografia em movimento: a palavra é a imagem.
- **Repertório:** quebra de linha por sentido ("perco paciente / por esquecer"); a palavra que fica vira âncora da próxima tela (mesma posição); silêncio antes da virada.
- **Bom é:** lido no mudo, de primeira · frase inteira na tela, nunca palavra a palavra · 1 ideia por tela.
- **Não faz:** mostrar como funciona (→ `fmt-recorte-funcionalidade`); mais de 5 frases (vira carrossel); crossfade; texto que treme ou gira.

## Contexto
- `library/formatos/texto-cinetico/formato.json` · sempre — observações do Oliver (mandam sobre esta receita) e variações
- `knowledge/video/texto-e-dados.md#3. Ênfase` · quando: nível alto ou dúvida de ênfase — meios e limites de ênfase
- `knowledge/video/texto-e-dados.md#4. Sincronia e tempo de tela` · quando: com locução ou nível alto — lead, hold e tempo de leitura

## Entradas e saídas
- **Recebe:** pedido ou ideia; `roteiro.md`, se existir.
- **Entrega:** roteirista → `roteiro.md` com as telas (texto exato, quebra de linha, palavra de ênfase); editor-de-video → plano e MP4 pela `video`.
- **Salva em:** `companies/<slug>/contents/<ID>-<nome>/`, `formato: texto-cinetico` no `peca.json` → aval do plano pelo Oliver.

## Ordem de trabalho
1. `formato.json` e o **Não faz**. Parâmetros do pedido, senão os defaults.
2. Roteirista: ≤ 5 frases no arco da receita; gancho de 2–4 palavras com a frase literal da persona; ≤ 6 palavras por tela de dor; virada de 1–3 palavras; marque a palavra de ênfase de cada tela.
3. Editor-de-video: escolha o layout; 1 cena por tela; trocas por `swap` ou match cut. Depois, `video` etapas 2–5.

## Regras duras
- **Frase inteira em ≤ 0,5 s** (cascata de 40–60 ms por palavra); com locução, entra completa no início da fala.
- **Ênfase:** 1 palavra por tela, 1 técnica (`--accent` **ou** peso **ou** escala ≥ 1,3× `SOFT`), chegando por último, na batida.

## Checklist antes de entregar
- Cada frase entra inteira em ≤ 0,5 s, cada palavra em 0,25–0,35 s?
- ≤ 3 linhas por tela, quebradas por sentido?
- 1 ênfase por tela, 1 técnica, chegando por último?
- A virada tem 0,3 s de silêncio antes?
- As trocas são por `swap` ou match cut, sem crossfade?

## Parâmetros e layouts
duração **15 s** (10 · 20) · áudio **trilha + 1 batida por palavra-chave** (com locução) · BPM **do `BRAND.md`**, senão 100 (70–128) · layout **pilha à esquerda**: linha nova empurra a anterior com `GENTLE` (centro: ≤ 4 palavras · palavra gigante: ~70% da largura, só na virada).

## Receita de cenas (15 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| gancho | 0–2 s | 2–4 palavras, frase literal da persona, já no 1º quadro | `FAST`, stagger 60 ms | pulso no quadro 0 |
| dor | 2–6 s | 2 telas, ≤ 6 palavras cada | `swap` (linha sai, nova entra) | batida a cada 2 tempos |
| virada | 6–8 s | 1–3 palavras ("E se não?") | tela esvazia; palavra `SOFT`, escala 1,15→1 | 0,3 s de silêncio, depois impacto |
| solução | 8–12,5 s | 2 telas: o ganho + nome do produto | palavra-chave em `--accent`; match cut por posição | motivo melódico |
| CTA | 12,5–15 s | 1 CTA + marca | `FAST`; microanimação | cauda; trilha resolvendo |

## Exemplo (kz) — 15 s, 90 BPM, sem locução
0 s "Queria só atender." ("atender" em `--accent`) · 2 s "Mas confirmo, / cobro, / mando link…" · 4,3 s "e anoto em 3 lugares." · 6 s silêncio 0,3 s; "E se fosse um lugar só?" ("um" gigante) · 8,5 s "Agenda, sessão e notas. / Juntas." (`BUSINESS.md`) · 10,5 s "kz" `GENTLE` · 12,5 s "Peça seu acesso".
