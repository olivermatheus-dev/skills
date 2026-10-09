---
name: fmt-dialogo
description: "Receita de conversa de chat animada (estilo mensageiro, com UI própria nos tokens da marca): indicador de digitação, bolhas com mola, confirmação de leitura, a mensagem-virada e o fecho no produto. Use quando o usuário pedir diálogo, conversa animada, vídeo de chat, 'print de WhatsApp animado', 'conversa com paciente/cliente', troca de mensagens ou fmt-dialogo. Usa a skill `video` como motor (plano, render e QA)."
---

# Diálogo

Conversa de chat que a persona reconhece e que vira no produto, com UI própria na marca. Topo/meio de funil. Motores: `plano-de-cenas` e `video` (nível médio); os **Padrões do Oliver** (skill `video`) mandam sobre esta receita. Estilo: Comedy ou Emotional (conforme o roteiro) + Organic.

## Especialista
Você é roteirista e animador de conversa: o ritmo da digitação é a piada ou a emoção.
- **Repertório:** situação que acontece por mensagem (remarcar, cobrar, confirmar); digitação proporcional à mensagem; a bolha vira o card do app.
- **Bom é:** a persona reconhece a conversa em 2 s · cada bolha lida sem pausar · a virada é 1 mensagem que muda hora, remetente ou o resolvido.
- **Não faz:** um lado só falando; mais de 8 mensagens; mensageiro real (marca, cores, ícones); conteúdo clínico.

## Contexto
- `library/formatos/dialogo/formato.json` · sempre — observações do Oliver (mandam sobre esta receita) e variações
- `knowledge/video/efeitos.md#2. Transições` · quando: fecho no produto — match cut e morph bolha → card

## Entradas e saídas
- **Recebe:** pedido com a situação; `roteiro.md`, se existir.
- **Entrega:** roteirista → `roteiro.md` com cada mensagem (remetente, hora, texto), a virada marcada e o CTA; editor-de-video → plano e MP4 pela `video`.
- **Salva em:** `companies/<slug>/contents/AAAA-MM-DD-<nome>/`, `formato: dialogo` no `peca.json` → aval do plano pelo Oliver.

## Ordem de trabalho
1. `formato.json` e o **Não faz**. Parâmetros do pedido, senão os defaults.
2. Roteirista: 5–7 mensagens, bolha ≤ 12 palavras (acima, quebre em duas); nomes do elenco fictício marcados como ilustrativos; a virada em 1 mensagem; fecho = o produto cumprindo a virada.
3. Editor-de-video: chat em HTML com tokens do `brand.css` (`--surface`, `--surface-2`, `--accent-soft`, raio da marca); depois, `video` etapas 2–5.

## Regras duras
- **Digitação:** 3 pontos (`SNAP`, loop 0,9 s) por `0,6 s + 0,05 s × palavras` (máx. 1,6 s); resposta impulsiva 0,3 s. Toda bolha tem indicador.
- **Bolha** entra `SOFT` do canto da cauda (escala 0,6→1); anteriores sobem `GENTLE` (marca calma → `FAST`); bolha quebrada em duas: stagger 0,25 s.
- **Leitura:** check único → duplo → destaque (`swap`, 0,4 s após), só se fizer parte da história.
- **Virada** sozinha ≥ 1,2 s, depois de 0,4 s de pausa.

## Checklist antes de entregar
- O chat é 100% em tokens, sem cara de mensageiro real?
- Toda bolha tem indicador proporcional (máx. 1,6 s) e ≤ 12 palavras?
- A virada é 1 mensagem, sozinha ≥ 1,2 s, depois da pausa?
- O fecho mostra o produto cumprindo a virada?
- Nenhum conteúdo clínico, e nomes de paciente marcados como ilustrativos?

## Parâmetros
duração **20 s** (15 · 30) · mensagens **5–7** (3–8) · moldura **celular inteiro** (só a conversa em tela cheia) · áudio **trilha + SFX de bolha** (locução narra só o fecho) · fecho **produto em uso** (cartão de frase + marca).

## Receita de cenas (20 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| gancho | 0–2 s | cabeçalho com nome + hora (ex.: 23:04) e 1ª bolha já visível | bolha `SOFT` do canto de origem | "plim" no quadro da bolha |
| troca | 2–10 s | 3–5 mensagens | indicador → bolha; lista sobe `GENTLE` | SFX de bolha, mais baixo na resposta |
| virada | 10–13 s | a mensagem que muda o sentido (outra voz, hora ou remetente) | pausa 0,4 s, depois `SOFT`; câmera 1,3× | silêncio curto + impacto suave |
| produto | 13–17,5 s | a conversa vira a tela do produto | match cut: a bolha vira o card/chip na mesma região | whoosh 4–8 quadros antes; clique no `event` |
| fecho | 17,5–20 s | 1 CTA + marca | `FAST`; microanimação | cauda; trilha resolvendo |

## Exemplo (kz) — 20 s, 80 BPM, sem locução
0 s "Paciente (ilustrativo) · 23:04": "não vou conseguir amanhã 😕" · 2,5–9 s remarcação · 10,5 s virada: "kz · lembrete automático" (ilustrativo), horário comercial; "Confirmo ✓" · 14 s "Confirmo" vira o chip "confirmada" na agenda (`BUSINESS.md`) · 17,5 s "Peça seu acesso".
