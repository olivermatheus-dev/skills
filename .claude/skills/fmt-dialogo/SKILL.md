---
name: fmt-dialogo
description: "Receita de conversa de chat animada (estilo mensageiro, com UI própria nos tokens da marca): indicador de digitação, bolhas com mola, confirmação de leitura, a mensagem-virada e o fecho no produto. Use quando o usuário pedir diálogo, conversa animada, vídeo de chat, 'print de WhatsApp animado', 'conversa com paciente/cliente', troca de mensagens ou fmt-dialogo. Usa a skill `video` como motor (plano, render e QA)."
---

# Diálogo

Estilo default: Comedy ou Emotional (conforme o roteiro) + Organic
Motor: skill `video` (nível médio por padrão) · regras gerais: `knowledge/video/REGRAS.md`.

Chat que a persona reconhece e que vira no produto; topo/meio de funil.
**Não usar:** sem dois lados falando · mais de 8 mensagens.

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| duração | 20 s | 15 · 30 s |
| mensagens | 5–7 | 3–8 |
| moldura | celular inteiro | só a conversa em tela cheia |
| áudio | trilha + SFX de bolha | com locução (narra só o fecho) |
| fecho | produto em uso | cartão de frase + marca |

## Receita de cenas (20 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| gancho | 0–2 s | cabeçalho com nome + hora (ex.: 23:04) e a 1ª bolha já visível | bolha `SOFT` a partir do canto de origem (escala 0,6→1) | "plim" no quadro da bolha |
| troca | 2–10 s | 3–5 mensagens | indicador de digitação → bolha; lista sobe com `GENTLE` | SFX de bolha, mais baixo na resposta |
| virada | 10–13 s | a mensagem que muda o sentido (outra voz, outra hora, outro remetente) | 0,4 s de pausa, depois `SOFT`; câmera aproxima 1,3× | silêncio curto + impacto suave |
| produto | 13–17,5 s | a conversa vira a tela do produto | match cut: a bolha vira o card/chip do app na mesma região | whoosh 4–8 quadros antes; clique preso ao `event` |
| fecho | 17,5–20 s | 1 CTA + marca | `FAST`, depois parado | cauda |

## Regras do formato
- **UI própria** com `brand.css` (`--surface`, `--surface-2`, `--accent-soft`, raio da marca); nada de mensageiro real.
- **Digitação:** 3 pontos (`SNAP`, loop 0,9 s) por `0,6 s + 0,05 s × palavras` (máx. 1,6 s); resposta impulsiva 0,3 s. Toda bolha tem indicador.
- **Bolha ≤ 12 palavras**; acima, quebre em duas (stagger 0,25 s). Entra `SOFT` do canto da cauda, anteriores sobem `GENTLE` (marca calma → `FAST`).
- **Leitura:** check único → duplo → destaque (`swap`, 0,4 s após), só se fizer parte da história.
- **Virada = 1 mensagem**, sozinha ≥ 1,2 s após pausa; muda hora, remetente ou o resolvido.
- Fecho: produto cumprindo a virada. Saúde: zero conteúdo clínico.

## Exemplo (kz) — 20 s, 80 BPM, sem locução
- 0 s "Paciente (ilustrativo) · 23:04": "não vou conseguir amanhã 😕" · 2,5–9 s remarcação.
- 10,5 s virada: "kz · lembrete automático" (ilustrativo), horário comercial; "Confirmo ✓".
- 14 s "Confirmo" vira o chip "confirmada" na agenda (`BUSINESS.md`) · 17,5 s "Peça seu acesso".

## Checklist do formato
- [ ] Chat 100% em tokens, sem cara de app real?
- [ ] Indicador proporcional (máx. 1,6 s)?
- [ ] Virada sozinha ≥ 1,2 s, após pausa?
