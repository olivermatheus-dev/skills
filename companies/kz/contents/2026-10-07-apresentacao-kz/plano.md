# kz · apresentação

**Status:** v03 entregue para revisão (2026-10-07) · nível médio · 4:5 + 9:16 · 43 s
**Locução:** Carla (ElevenLabs v4), arquivo único gerado pelo Oliver → `split-vo.mjs` (7 falas, pausas apertadas: 40,3 s → 38,1 s de fala).
Original em `_inbox/audio/kz-teste-carla/carla-v4.mp3` (fora do git).

## Roteiro (texto do Oliver, com as tags usadas no v4)
> [confident] Você é terapeuta e ainda organiza sua rotina em vários lugares diferentes? [short pause] [sighs] Agenda de um lado, informações dos pacientes de outro, anotações espalhadas… e no fim, sobra menos tempo para aquilo que realmente importa: atender. [confident] A KZ é uma plataforma feita para terapeutas que querem deixar a gestão da rotina mais simples, organizada e profissional. [warm] Tudo pensado para você acompanhar seus atendimentos e organizar seu dia a dia com muito menos complicação. [slightly upbeat] Menos tempo administrando. Mais tempo cuidando dos seus pacientes! [confident] [inviting] Conheça a KZ e descubra uma forma mais simples de cuidar da sua rotina profissional.

## Folha de batidas (v02)
| cena | tempo | na tela | som |
|---|---|---|---|
| s1 gancho | 0–5,1 | selo com ícone + "Você é *terapeuta*?" grande, palavra a palavra → encolhe e sobe em "ainda" → "Sua rotina em *vários lugares* diferentes?"; 4 pedaços (Agenda, Mensagens, Planilha, Caderno) saltam em "vários" | whoosh · pop · swish · 4 pops em cascata |
| s2 caos | 5,1–11,6 | no suspiro, os pedaços caem; headline troca a cada frase (*Agenda* de um lado → *Pacientes* de outro → *Anotações* espalhadas…) com o card de cada uma; em "espalhadas" alertas nos cards e tudo se afasta; cards saem voando | clique de UI por card · alerta · whoosh |
| s3 dor | 11,6–16,9 | "E no fim, sobra *menos* tempo" palavra a palavra + relógio "seu tempo livre" que esvazia em "menos" (ponteiro balança); "para aquilo que realmente importa:"; tudo recua e *atender.* chega com coração e anel | swish · tique de relógio · clique · chime |
| s4 revelação | 16,9–25,2 | brilho + logo se desenha; pulso no "KZ"; "Feita para terapeutas" com ícone; em "gestão" logo sobe e encolhe → "A gestão da sua rotina mais" + 3 pílulas com ícone (simples, organizada, profissional) | whoosh · piano F maior · pop · 3 pops de UI |
| s5 produto | 25,2–31,9 | headline troca: "Tudo pensado para *você*" → "Acompanhe seus *atendimentos*" → "Organize seu *dia a dia*"; painel monta peça a peça; câmera e cursor na próxima sessão e na lista; toast "Sessão agendada · lembrete enviado" | whoosh · clicks · ding |
| s6 virada | 31,9–36,6 | 3 ícones de "administração" + "Menos tempo administrando." → risco, ícones somem; "Mais tempo *cuidando* dos seus pacientes." + coração com anel | clique · swish · chime · pop |
| s7 cartão final | 36,6–43,0 | brilho + logo se desenha · "Conheça a kz" · botão kz.app.br pulsa · "Plataforma para terapeutas" · cursor clica | whoosh · pop · clique |

Trilha: própria (sintetizada no kit), 84 BPM, Dm–Bb–F–C, estilo `light`, riser suave antes da revelação, `resolve` no final. −14 LUFS.

## Afirmações e fontes
- "Plataforma para terapeutas": título do site kz.app.br.
- Funções mostradas no painel (próxima sessão, prontuário, próximas sessões, atalhos Sessão rápida/Agendar/Novo cliente/Nova anotação): print do painel enviado pelo Oliver (2026-10-07).
- **A confirmar:** o toast "lembrete enviado" sugere lembrete automático. Se a kz ainda não envia lembrete, trocar o texto (`composition.html`, `#done`).
- Nomes (Ana, Marina S., Lucas P., Helena R., Clara A.): fictícios, marcados "dados ilustrativos".

## Para o Oliver conferir
1. Ouvir com fone e no celular: volume da trilha sob a voz, os pops (cena 2) e o piano da revelação.
2. As pausas foram apertadas (cada fala encosta na próxima, 0,15–0,5 s). Se quiser mais respiro em algum ponto, me diga onde.
3. O "lembrete enviado" do toast (acima).
4. No 9:16, o conteúdo fica no alto (a parte de baixo é coberta pela legenda/botões do Reels/TikTok).

## Entregue
- v01, v02 e v03: `exports/2026-10-07-apresentacao-kz-<4x5|9x16>-vNN.mp4` (fora do git).

## Feedback
- **v01 (Oliver):** abertura com tela vazia; "sobra menos tempo" vazio e textos atrasados; faltam headlines (ex.: cena dos cards), ícones e elementos que ilustrem o que é dito; mais dinâmica no geral; mais efeitos sonoros discretos (entrada e saída de cards).
- **v02 (feito):** tudo acima + tempos por palavra corrigidos pelo áudio (o Whisper atrasava até 0,3 s; `snapWords`), cenas se cruzam (sem quadro vazio), 40 efeitos (eram 19).
- **v02 (Oliver):** relógio da cena 3 bugado (único ajuste pedido).
- **v03 (feito):** relógio corrigido (a rotação do anel pegava o ícone, que girava e esticava; agente Sonnet). Revisão completa por outro agente Sonnet → aplicado: frase final com headline ("Uma forma *mais simples*…") e assinatura antes; "Feita para terapeutas" em "feita" e logo respirando até lá; headlines palavra a palavra no tempo da fala (cenas 2 e 5); sem vazio em 2 s e 5 s; cards longe das bordas; toast legível; quebras equilibradas (`text-wrap: balance`); ícones e rótulos pequenos maiores; anel do clique do cursor não aparece mais no canto (correção no kit). Ficaram para decidir: zoom forte no painel na cena 5 e descer o conteúdo no 9:16.

