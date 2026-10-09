---
name: fmt-trailer-lancamento
description: "Receita de trailer cinematográfico de lançamento de produto (15–30 s): cold open → build → drop → revelação → cartão final, com ou sem locução. Use quando o usuário pedir trailer, teaser, vídeo de lançamento, vídeo de anúncio do produto, 'tá chegando', 'lançamos' ou pré-lançamento em vídeo. Usa a skill `video` como motor (plano, render e QA)."
---

# Trailer de lançamento

O caos acelera, silêncio, drop no produto, revelação da marca. Topo/meio de funil. Motores: `plano-de-cenas` e `video` (nível médio); os **Padrões do Oliver** (skill `video`) mandam sobre esta receita. Estilo: Trailer + Premium Minimal.

## Especialista
Você é editor de trailer de cinema aplicado a software.
- **Repertório:** build que acelera na batida; tirar o som antes do impacto; drop "para dentro" do produto; revelação que segura.
- **Bom é:** persona reconhecida no 1º quadro · drop em 60–70% · ≤ 2 transições.
- **Não faz:** 1 funcionalidade só (→ `fmt-recorte-funcionalidade`); sem tela real (→ `fmt-texto-cinetico`); oferta com preço.

## Contexto
- `library/formatos/trailer-lancamento/formato.json` · sempre — observações do Oliver (mandam sobre esta receita) e variações
- `knowledge/video/som.md#3. Música como narrativa` · quando: montar o silêncio e o drop — tirar a música, drop no quadro da virada
- `knowledge/video/efeitos.md#2. Transições` · quando: escolher a transição-assinatura — máscara, whip, zoom-through

## Entradas e saídas
- **Recebe:** pedido com o recorte; `roteiro.md`, se existir.
- **Entrega:** roteirista → `roteiro.md` com o texto de cada bloco da receita; editor-de-video → plano e MP4 pela `video`.
- **Salva em:** `companies/<slug>/contents/AAAA-MM-DD-<nome>/` (anúncio: `campaigns/…`), `formato: trailer-lancamento` no `peca.json` → aval do plano pelo Oliver.

## Ordem de trabalho
1. `formato.json` e o **Não faz**. Parâmetros do pedido, senão os defaults.
2. Roteirista: 3–4 golpes de dor (1 ideia cada), slogan, 1 CTA. Com locução: ≤ 2,7 palavras/s, revelação ≤ 6 palavras, voz cala no silêncio e volta *depois* do impacto.
3. Editor-de-video: 1 cena por bloco, silêncio e drop declarados no plano; outra duração → reescale mantendo o drop em 60–70%. Depois, `video` etapas 2–5.

## Checklist antes de entregar
- Persona na tela já no 1º quadro?
- Silêncio de 0,2–0,5 s declarado antes do drop, e drop em 60–70%?
- Build acelera (golpes até 0,8 s) e produto e revelação seguram?
- No máximo 2 transições: hard cut no build + 1 assinatura no drop?
- Produto em tela real, com gestos de cursor, sem preço?
- Cartão final com 1 CTA só?

## Parâmetros
duração **20 s** (15 · 30) · áudio **trilha + SFX, sem locução** (com locução) · BPM **do `BRAND.md`**, senão 110 (70–128) · assinatura **máscara com forma da marca** (match cut · whip · zoom-through) · CTA **o da oferta em `BUSINESS.md`** (pedir acesso, lista de espera, data).

## Receita de cenas (20 s, ~110 BPM ≈ 0,55 s/batida)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| cold open | 0–2 s | situação real da persona (frase literal do `AUDIENCE.md`) | texto `FAST`, drift 1→1,03 | pulso grave no quadro 0 |
| build | 2–8 s | 3–4 golpes da dor, 1,2–1,5 s cada | hard cut na batida; `swap` ou `SNAP` | pulso a cada 2 batidas; riser em ~6 s |
| silêncio | 8–8,4 s | tela limpa ou último golpe congelado | nada se move | corte seco |
| drop | 8,4–9 s | 1ª imagem do produto | zoom-through ou máscara, `GENTLE` | sub boom + impacto |
| produto | 9–15 s | 2–3 gestos com cursor (clique → estado muda) | câmera 1,3–2×; `stretchTo`; card `SOFT` | UI SFX nos `events`; motivo melódico |
| revelação | 15–17,5 s | logo + slogan | logo `GENTLE`; slogan `FAST` +120 ms | impacto com cauda; motivo repete |
| cartão final | 17,5–20 s | 1 CTA + marca | drift + microanimação | cauda; trilha resolvendo |

## Exemplo (kz) — 20 s, 85 BPM, sem locução
0 s "23h. Ainda confirmando paciente." · 2–6 s "Agenda num app." / "Link em outro." / "Lembrete? Na memória." · 8 s silêncio 0,4 s → máscara (raio 16) abre a agenda; cursor liga lembrete · 15 s logo + "Feito por terapeuta, pra terapeuta." · 17,5 s "Peça seu acesso".
