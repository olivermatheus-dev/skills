---
name: fmt-recorte-funcionalidade
description: "Receita de vídeo de UMA funcionalidade em uso (15–30 s): momento-problema → demo conduzida pelo cursor com micro-interações e zoom → resultado → CTA. Cobre também 'demo de produto'. Use quando o usuário pedir recorte de funcionalidade, demo, demonstração, 'mostra como funciona', vídeo da feature, tutorial curto, 'vídeo do lembrete/agenda/…' ou fmt-demo-produto. Usa a skill `video` como motor (plano, render e QA)."
---

# Recorte de funcionalidade

Mostra uma funcionalidade resolvendo uma dor concreta, com a interface sendo usada. Meio/fundo de funil (níveis 3–4 de consciência): reels, anúncio de consideração, LP, onboarding.

## Quando usar / quando não usar
- **Usar:** 1 recurso com antes/depois claro em ≤ 3 gestos; prova de "é simples".
- **Não usar:** tour do produto inteiro (vira 3 recortes); recurso sem print ou gravação real; lançamento (→ `fmt-trailer-lancamento`).

## Parâmetros (o usuário pode mudar)
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
- **O cursor conduz:** cada mudança de estado tem um `click`, `press` ou digitação antes dela. Nada muda sozinho.
- **Uma funcionalidade só.** O rótulo do resultado nomeia o ganho, não o recurso ("Ninguém esquece mais" > "Lembretes automáticos"), sem número inventado.
- **Legível no celular:** se o rótulo de UI ficar < 28 px a 1080 de largura, aproxime a câmera. Cursor dentro do quadro durante todo o zoom.
- Câmera: aproxima **antes** do gesto, não durante o clique. Máx. 2 níveis de zoom (1× e o escolhido).
- UI reconstruída em HTML com tokens de `brand.css`, fiel ao print real em `brand/screenshots/`. Dados = elenco fictício do `BRAND.md`, marcados como ilustrativos.
- Com locução: a palavra-chave coincide com o gesto (visual na palavra ou até 4 quadros antes).
- Nicho de saúde: mostrar o fluxo administrativo; nada de nota clínica real ou promessa terapêutica.

## Erros comuns
- Tela inteira do app pequena demais para ler.
- Cursor em linha reta, sem pausa antes do clique.
- Zoom e clique ao mesmo tempo (dois protagonistas).
- Demonstrar 4 recursos em 20 s.
- Resultado que some antes do tempo de leitura.

## Exemplo (kz) — lembrete automático no WhatsApp, 20 s, 85 BPM
- 0,0 s — "Sessão às 9h. Ela vai lembrar?" + celular com notificação; SFX de aviso.
- 3,0 s — a notificação desce e vira o card da sessão na agenda da kz (match cut).
- 4,5 s — cursor em curva até a sessão; câmera `GENTLE` 1,5×; clique.
- 8,0 s — toggle "lembrete pelo WhatsApp" liga (`SNAP`); chip "agendado" entra `FAST`.
- 12 s — mensagem de lembrete aparece no celular do paciente (ilustrativo; recurso em `BUSINESS.md`).
- 16 s — "Peça seu acesso" + logo.

## Checklist do formato
- [ ] 1 funcionalidade, com fonte?
- [ ] Todo estado novo precedido de gesto?
- [ ] Rótulos ≥ 28 px no zoom?
- [ ] Match cut ou zoom-through na entrada, máx. 2 transições?
- [ ] Resultado legível pelo tempo mínimo; CTA ≥ 2 s?
- [ ] Pipeline: siga a skill `video`.
