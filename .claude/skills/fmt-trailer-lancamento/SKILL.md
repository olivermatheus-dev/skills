---
name: fmt-trailer-lancamento
description: "Receita de trailer cinematográfico de lançamento de produto (15–30 s): cold open → build → drop → revelação → cartão final, com ou sem locução. Use quando o usuário pedir trailer, teaser, vídeo de lançamento, vídeo de anúncio do produto, 'tá chegando', 'lançamos' ou pré-lançamento em vídeo. Usa a skill `video` como motor (plano, render e QA)."
---

# Trailer de lançamento

Estilo default: Trailer + Premium Minimal
Motor: skill `video` (nível médio por padrão) · regras gerais: `knowledge/video/REGRAS.md`.

**Não usar:** 1 funcionalidade (→ `fmt-recorte-funcionalidade`) · sem tela real (→ `fmt-texto-cinetico`) · oferta com preço.

## Parâmetros
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
- **Drop em 60–70%**, após 0,2–0,5 s de silêncio declarado no plano.
- Build **acelera** (golpes até 0,8 s); produto e revelação **seguram**.
- Máx. **2 transições**: hard cut no build + 1 assinatura no drop.
- **Com locução:** a voz cala no silêncio e volta *depois* do impacto; revelação ≤ 6 palavras.

## Exemplo (kz) — 20 s, 85 BPM, sem locução
- 0 s "23h. Ainda confirmando paciente." · 2–6 s golpes "Agenda num app." / "Link em outro." / "Lembrete? Na memória."
- 8 s silêncio 0,4 s → máscara (raio 16) abre a agenda; cursor liga lembrete.
- 15 s logo + "Feito por terapeuta, pra terapeuta." · 17,5 s "Peça seu acesso".

## Checklist do formato
- [ ] Persona no 1º quadro?
- [ ] Silêncio antes do drop; drop em 60–70%?
- [ ] Build acelera, revelação segura?
- [ ] ≤ 2 transições?
