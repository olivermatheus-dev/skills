---
name: fmt-recorte-funcionalidade
description: "Receita de vídeo de UMA funcionalidade em uso (15–30 s): momento-problema → demo conduzida pelo cursor com micro-interações e zoom → resultado → CTA. Cobre também 'demo de produto'. Use quando o usuário pedir recorte de funcionalidade, demo, demonstração, 'mostra como funciona', vídeo da feature, tutorial curto, 'vídeo do lembrete/agenda/…' ou fmt-demo-produto. Usa a skill `video` como motor (plano, render e QA)."
---

# Recorte de funcionalidade

Estilo default: Tutorial/Software + Tech Product
Motor: skill `video` (nível médio por padrão) · regras gerais: `knowledge/video/REGRAS.md`.

Uma funcionalidade resolvendo uma dor concreta, com a interface em uso. Meio/fundo de funil.
**Não usar:** tour do produto (vira 3 recortes) · recurso sem print real · lançamento (→ `fmt-trailer-lancamento`).

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| duração | 20 s | 15 · 30 s |
| áudio | trilha + UI SFX | com locução (L-cut sobre a demo) |
| gestos | 2–3 | máx. 4 em 30 s |
| zoom | 1,5× | 1,3–2× |
| abertura | momento-problema | pergunta direta ("Ainda confirma na mão?") |

## Receita de cenas (20 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| problema | 0–3 s | a dor no momento exato (hora, objeto, frase literal da persona) | texto `FAST`; elemento da dor com `SOFT` | 1 SFX ligado ao objeto (notificação, relógio) |
| entrada no app | 3–4 s | janela do app em `--surface` | match cut: o elemento da dor vira o elemento do app (mesma região) ou zoom-through | whoosh 4–8 quadros antes |
| gesto 1 | 4–8 s | cursor vai ao controle | curva, acelera/desacelera, pausa 0,2 s, `click` (0,96 + eco 0,4 s); câmera `GENTLE` para 1,5× | clique preso ao `event` |
| gesto 2 | 8–12 s | estado muda: chip, status, contador | `swap` no texto; `stretchTo` na seleção; card `SOFT` | SFX de confirmação suave |
| resultado | 12–16 s | estado final legível + rótulo de 3–6 palavras | câmera volta a 1× com `GENTLE`; drift | motivo melódico |
| CTA | 16–20 s | 1 CTA + marca | entra `FAST`, depois parado | cauda, sem SFX novo |

## Regras do formato
- **Uma funcionalidade só**, ≤ 3 gestos. O rótulo do resultado nomeia o ganho, não o recurso ("Ninguém esquece mais" > "Lembretes automáticos").
- Cursor dentro do quadro durante todo o zoom; zoom e clique nunca juntos.
- UI em HTML com tokens de `brand.css`, fiel ao print de `brand/screenshots/`. Saúde: só fluxo administrativo, nada de nota clínica.

## Exemplo (kz) — lembrete automático no WhatsApp, 20 s, 85 BPM
- 0 s "Sessão às 9h. Ela vai lembrar?" + notificação no celular · 3 s a notificação vira o card da sessão na agenda (match cut).
- 4,5 s cursor + câmera 1,5× · 8 s toggle "lembrete pelo WhatsApp" (`SNAP`), chip "agendado" (`BUSINESS.md`).
- 12 s lembrete no celular do paciente (ilustrativo) · 16 s "Peça seu acesso".

## Checklist do formato
- [ ] 1 funcionalidade; rótulo = ganho?
- [ ] Entrada por match cut ou zoom-through?
- [ ] Rótulos ≥ 28 px no zoom; cursor sempre no quadro?
- [ ] UI fiel ao print real?
