---
name: fmt-dialogo
description: "Receita de conversa de chat animada (estilo mensageiro, com UI própria nos tokens da marca): indicador de digitação, bolhas com mola, confirmação de leitura, a mensagem-virada e o fecho no produto. Use quando o usuário pedir diálogo, conversa animada, vídeo de chat, 'print de WhatsApp animado', 'conversa com paciente/cliente', troca de mensagens ou fmt-dialogo. Usa a skill `video` como motor (plano, render e QA)."
---

# Diálogo

Conversa de chat que a persona reconhece e que vira no produto. Topo/meio de funil: reels e stories, alto envio por DM ("isso sou eu").

## Quando usar / quando não usar
- **Usar:** a dor acontece numa conversa (cliente que cancela, some, pede o link).
- **Não usar:** não há dois lados falando; precisa de mais de 8 mensagens.

## Parâmetros (o usuário pode mudar)
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
- **UI própria:** bolhas, cabeçalho e checks desenhados com `brand.css` (`--surface`, `--surface-2`, `--accent-soft`, raio da marca). Nunca copiar cores, ícones, fundo ou logo de mensageiros reais.
- **Cadência de digitação:** indicador (3 pontos, `SNAP` em loop de 0,9 s) dura `0,6 s + 0,05 s × palavras` (máx. 1,6 s). Resposta impulsiva: 0,3 s.
- **Tempo de leitura por bolha:** antes da próxima ação, `máx(1,0 s; 0,3 s × palavras)`. Bolha ≤ 12 palavras; mais que isso, quebre em duas (stagger 0,25 s).
- **Entrada da bolha:** `SOFT` (passagem ~8%) com origem no canto da cauda; as anteriores sobem com `GENTLE` ao mesmo tempo. Se o `BRAND.md` pedir calma, use `FAST`.
- **Confirmação de leitura:** check único → duplo → cor de destaque com `swap` 0,4 s depois da leitura; só quando a leitura é parte da história.
- **A virada é 1 mensagem**, sozinha na tela por ≥ 1,2 s, precedida de pausa. Ela muda a hora, quem fala ou o que já estava resolvido.
- O fecho mostra o produto cumprindo a virada, com cursor se for interface (ver `fmt-recorte-funcionalidade`).
- Nomes = elenco fictício do `BRAND.md`, marcados como ilustrativos. Nicho de saúde: zero conteúdo clínico na conversa, nenhum depoimento de paciente, nenhuma promessa de resultado.

## Erros comuns
- Bolhas sem indicador ou todas no mesmo ritmo.
- Conversa longa demais para ler no tempo.
- Copiar a cara de um app real (verde, papel de parede, logo).
- Virada misturada no meio da troca, sem pausa.

## Exemplo (kz) — 20 s, 80 BPM, sem locução
- 0,0 s — cabeçalho "Paciente (ilustrativo) · 23:04"; bolha: "Oi, desculpa a hora… não vou conseguir amanhã 😕".
- 2,5 s — terapeuta digitando 1,1 s: "Tudo bem! Me fala um horário 🙂" · 5 s — 2 respostas curtas de remarcação.
- 9,5 s — pausa; texto na tela: "23h. Ainda no WhatsApp do consultório."
- 10,5 s — virada: mesma conversa, remetente "kz · lembrete automático" (ilustrativo), em horário comercial; paciente responde "Confirmo ✓".
- 14 s — a bolha "Confirmo" vira o chip "confirmada" na agenda da kz (recurso: lembretes e confirmações via WhatsApp, `BUSINESS.md`).
- 17,5 s — "Peça seu acesso" + logo.

## Checklist do formato
- [ ] UI do chat 100% em tokens da marca, sem marca de terceiros?
- [ ] Indicador proporcional ao tamanho da mensagem?
- [ ] Cada bolha legível pelo tempo mínimo?
- [ ] Virada sozinha, com pausa?
- [ ] Fecho com recurso real e fonte?
- [ ] Pipeline: siga a skill `video`.
