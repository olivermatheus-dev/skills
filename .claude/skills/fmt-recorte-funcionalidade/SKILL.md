---
name: fmt-recorte-funcionalidade
description: "Receita de vídeo de UMA funcionalidade em uso (15–30 s): momento-problema → demo conduzida pelo cursor com micro-interações e zoom → resultado → CTA. Cobre também 'demo de produto'. Use quando o usuário pedir recorte de funcionalidade, demo, demonstração, 'mostra como funciona', vídeo da feature, tutorial curto, 'vídeo do lembrete/agenda/…' ou fmt-demo-produto. Usa a skill `video` como motor (plano, render e QA)."
---

# Recorte de funcionalidade

Uma funcionalidade resolvendo uma dor concreta, com a interface em uso conduzida pelo cursor. Meio/fundo de funil. Motores: `plano-de-cenas` e `video` (nível médio); os **Padrões do Oliver** (skill `video`) mandam sobre esta receita. Estilo: Tutorial/Software + Tech Product.

## Especialista
Você é motion designer de demo de software: o cursor conta a história.
- **Repertório:** a dor no momento exato; o elemento da dor vira o elemento do app (match cut); nada muda na UI sem gesto; câmera aproxima a ação e volta.
- **Bom é:** 1 funcionalidade, ≤ 3 gestos · rótulo que nomeia o ganho, não o recurso ("Ninguém esquece mais" > "Lembretes automáticos") · UI fiel ao print real.
- **Não faz:** tour do produto (vira 3 recortes); recurso sem print real; lançamento (→ `fmt-trailer-lancamento`); nota clínica (só fluxo administrativo).

## Contexto
- `library/formatos/recorte-funcionalidade/formato.json` · sempre — observações do Oliver (mandam sobre esta receita), variações e exemplo
- `context/PRODUTO.md#1. Funcionalidades por grupo` · sempre — a funcionalidade recortada e o que ela faz de verdade
- `knowledge/video/movimento.md#8. Produto em uso (UI)` · quando: animar os gestos — cursor, clique, `stretchTo`, `swap`, câmera

## Entradas e saídas
- **Recebe:** pedido com a funcionalidade; print real em `brand/screenshots/`; `roteiro.md`, se existir.
- **Entrega:** roteirista → `roteiro.md` com a dor, o rótulo do ganho e o CTA; editor-de-video → plano e MP4 pela `video`.
- **Salva em:** `companies/<slug>/contents/<ID>-<nome>/` (anúncio: `campaigns/…`), `formato: recorte-funcionalidade` no `peca.json` → aval do plano pelo Oliver.

## Ordem de trabalho
1. Ler `formato.json`; conferir o **Não faz** e se a funcionalidade existe no `PRODUTO.md` e tem print. Sem print → pare e peça.
2. Roteirista: a dor em 1 frase (hora, objeto, frase da persona) ou pergunta direta; rótulo do resultado em 3–6 palavras; 1 CTA. Com locução: L-cut sobre a demo.
3. Editor-de-video: 1 cena por bloco; UI em HTML com tokens do `brand.css`, fiel ao print; gestos presos a `events`. Depois, `video` etapas 2–5.

## Checklist antes de entregar
- 1 funcionalidade, ≤ 3 gestos (≤ 4 em 30 s), e o rótulo nomeia o ganho?
- A entrada no app é por match cut ou zoom-through?
- O cursor fica no quadro durante todo o zoom, e zoom e clique nunca acontecem juntos?
- Rótulos ≥ 28 px no zoom?
- A UI é fiel ao print real, sem conteúdo clínico?

## Parâmetros
duração **20 s** (15 · 30) · áudio **trilha + UI SFX** (com locução em L-cut) · gestos **2–3** (máx. 4 em 30 s) · zoom **1,5×** (1,3–2×) · abertura **momento-problema** (pergunta direta: "Ainda confirma na mão?").

## Receita de cenas (20 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| problema | 0–3 s | a dor no momento exato (hora, objeto, frase literal da persona) | texto `FAST`; elemento da dor `SOFT` | 1 SFX do objeto (notificação, relógio) |
| entrada no app | 3–4 s | janela do app em `--surface` | match cut (mesma região) ou zoom-through | whoosh 4–8 quadros antes |
| gesto 1 | 4–8 s | cursor vai ao controle | curva, pausa 0,2 s, `click` (0,96 + eco 0,4 s); câmera `GENTLE` 1,5× | clique preso ao `event` |
| gesto 2 | 8–12 s | estado muda: chip, status, contador | `swap` no texto; `stretchTo` na seleção; card `SOFT` | confirmação suave |
| resultado | 12–16 s | estado final + rótulo de 3–6 palavras | câmera volta a 1× `GENTLE`; drift | motivo melódico |
| CTA | 16–20 s | 1 CTA + marca | entra `FAST`; microanimação | cauda; trilha resolvendo |

## Exemplo (kz) — lembrete automático no WhatsApp, 20 s, 85 BPM
0 s "Sessão às 9h. Ela vai lembrar?" + notificação no celular · 3 s a notificação vira o card da sessão (match cut) · 4,5 s cursor + câmera 1,5× · 8 s toggle "lembrete pelo WhatsApp" (`SNAP`), chip "agendado" (`BUSINESS.md`) · 12 s lembrete no celular do paciente (ilustrativo) · 16 s "Peça seu acesso".
