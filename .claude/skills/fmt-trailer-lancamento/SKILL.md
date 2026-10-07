---
name: fmt-trailer-lancamento
description: "Receita de trailer cinematográfico de lançamento de produto (15–30 s): cold open → build → drop → revelação → cartão final, com ou sem locução. Use quando o usuário pedir trailer, teaser, vídeo de lançamento, vídeo de anúncio do produto, 'tá chegando', 'lançamos' ou pré-lançamento em vídeo. Usa a skill `video` como motor (plano, render e QA)."
---

# Trailer de lançamento

Peça de topo/meio de funil para anunciar o produto (ou uma versão) com impacto de estúdio. Reels, feed, stories e pré-roll; 4:5 + 9:16.

## Quando usar / quando não usar
- **Usar:** lançamento, pré-lançamento, versão nova grande, abertura de lista de espera.
- **Não usar:** explicar 1 funcionalidade (→ `fmt-recorte-funcionalidade`), produto sem tela real para mostrar (→ `fmt-texto-cinetico`), anúncio de conversão com oferta (o trailer vende desejo, não preço).

## Parâmetros (o usuário pode mudar)
| parâmetro | default | opções |
|---|---|---|
| duração | 20 s | 15 · 30 s |
| áudio | sem locução (trilha + SFX) | com locução (≤ 2,7 palavras/s) |
| BPM | o do `BRAND.md` (senão 110) | 70–128 |
| transição-assinatura | máscara com forma da marca | match cut · whip · zoom-through (máx. 2) |
| CTA | o da oferta em `BUSINESS.md` | "pedir acesso", "lista de espera", data |

## Receita de cenas (20 s, ~110 BPM ≈ 0,55 s/batida)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| cold open | 0–2 s | situação real da persona (frase literal do `AUDIENCE.md`) já no 1º quadro | texto entra `FAST`, drift 1,00→1,03 | pulso grave começa no quadro 0 |
| build | 2–8 s | 3–4 golpes da dor/caos (1 ideia por golpe, 1,2–1,5 s cada) | hard cut na batida; cada golpe com `swap` ou `SNAP` | pulsos a cada 2 batidas; riser começa em ~6 s |
| silêncio | 8,0–8,4 s | tela limpa (só fundo) ou último golpe congelado | nada se move | corte seco do som |
| drop | 8,4–9 s | primeira imagem do produto | zoom-through ou máscara para "dentro" do app, `GENTLE` | sub boom + impacto |
| produto | 9–15 s | 2–3 gestos reais com cursor (clique → estado muda) | câmera 1,3–2× na ação; `stretchTo` em seleção; `SOFT` em card | UI SFX presos a `events`; motivo melódico |
| revelação | 15–17,5 s | logo/nome + slogan | logo assenta com `GENTLE`; slogan `FAST` 120 ms depois | impacto grande com cauda; motivo repete |
| cartão final | 17,5–20 s | CTA único + marca | só drift; nada some | cauda do impacto, sem SFX novo |

## Regras do formato
- **A virada cai entre 60–70%** e é precedida de 0,2–0,5 s de silêncio declarado no plano.
- Build **acelera** (golpes cada vez mais curtos, até 0,8 s); produto e revelação **seguram**. O contraste de ritmo é o trailer.
- No máximo **2 transições**: uma para o build (hard cut) e uma assinatura para o drop.
- **Com locução:** a voz cala no silêncio e volta *depois* do impacto; frase da revelação ≤ 6 palavras. **Sem locução:** o texto conta a história sozinho (autoplay mudo).
- Todo recurso mostrado no bloco "produto" tem fonte (print, `BUSINESS.md`). Nicho de saúde: dor administrativa, nunca promessa de resultado terapêutico.
- Cores, fonte e molas pelo `brand.css`/`BRAND.md` (a marca pode proibir whip ou `SOFT`).

## Erros comuns
- Abrir com logo ou fade do preto.
- Drop sem silêncio antes (o impacto não pesa).
- Produto como print parado; nada muda sem clique.
- Cartão final com 2 CTAs ou < 2 s.
- Build com texto demais (> 6 palavras por golpe).

## Exemplo (kz) — folha de batidas, 20 s, 85 BPM, sem locução
- 0,0 s — "23h. Ainda confirmando paciente." sobre o creme; pulso grave.
- 2,0 / 3,4 / 4,8 / 6,0 s — golpes: "Agenda num app." · "Link em outro." · "Notas no caderno." · "Lembrete? Na memória." (`SNAP`, hard cut na batida).
- 7,2 s — riser; 8,0 s — silêncio 0,4 s.
- 8,4 s — máscara arredondada (raio 16) abre a agenda da kz; sub boom.
- 10–14 s — cursor clica numa sessão; chip "lembrete enviado" entra com `FAST` (recurso: lembretes via WhatsApp, `BUSINESS.md`).
- 15 s — logo kz + "Feito por terapeuta, pra terapeuta." · 17,5 s — CTA "Peça seu acesso".

## Checklist do formato
- [ ] 1º quadro com a situação da persona?
- [ ] Silêncio antes do drop, drop em 60–70%?
- [ ] Build acelera, revelação segura?
- [ ] ≤ 2 transições?
- [ ] Todo gesto no produto conduzido pelo cursor e com fonte?
- [ ] Cartão final ≥ 2 s com 1 CTA?
- [ ] Pipeline: siga a skill `video`.
