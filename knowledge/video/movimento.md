# Movimento

> Base: prompts de vídeo e trailer + guia de movimento do Ludus + Etapas 7–9 (2026-10-07), verificados e quantificados com os 12 princípios da animação da Disney (antecipação, *follow-through*, *slow in/slow out*) e as diretrizes de movimento de interface (Material Design / Apple HIG). Números = **pontos de partida**.

## 1. Princípios
1. **Nada linear.** Todo movimento tem easing. O linear só vale em loops contínuos (rotação de fundo, *marquee*).
2. **Antecipação e passagem (*overshoot*).** Recuo pequeno antes de um movimento grande e um leve passar do ponto antes de assentar. Use molas.
3. **Nada fica totalmente parado.** Em tela "parada" há sempre um drift sutil, mas o texto continua legível.
4. **Profundidade** com escala, desfoque e paralaxe, não com sombras pesadas.
5. **Transição com motivo.** *Match cut*, máscara, chicote (*whip*), forma que vira a próxima cena. **Nunca crossfade solto.**
6. **Um protagonista por vez.** Só um elemento faz o movimento principal; o resto apoia.

## 2. Easing (qual curva usar)
| situação | curva | GSAP (aprox.) |
|---|---|---|
| **entrada** (aparece, chega) | desacelera no fim | `power3.out` / `expo.out` |
| **saída** (vai embora) | acelera no fim | `power2.in` |
| **deslocamento na tela** | suave nos dois lados | `power2.inOut` |
| **pop / chegada com vida** | mola com passagem | `back.out(1.4–1.8)` ou mola do kit |
| **elemento físico** (card caindo, botão) | mola amortecida | mola do kit (sem quicar mais de 1×) |

Overshoot: **premium 0–4%** (escala 1,02–1,04), **expressivo até 8–10%**. Mais que isso parece desenho infantil, salvo pedido da marca. Nunca `scale 0 → 110 → 95 → 100` como receita (ver `animacao-comportamento.md`).

⚠️ **Terminologia:** no GSAP/CSS, `.out` = **desacelera ao chegar** (o que o After Effects chama de "ease in") e `.in` = acelera ao sair. Siga sempre esta tabela.

## 2b. Molas nomeadas (preferir a curvas genéricas)
Uma biblioteca de movimento compartilhada expõe **4 molas** com passagem previsível (forma fechada: passam do alvo o que prometem e assentam sem quicar). Valores do kit do Ludus, validados em vídeo:
| mola | passagem | uso |
|---|---|---|
| `SNAP` | 0% | encaixe seco: chip, check, corte de estado |
| `FAST` | ~4% | entrada de elemento de UI, botão |
| `SOFT` | ~8% | pop com vida: card, selo, número |
| `GENTLE` | ~2% | câmera, aproximação, grandes deslocamentos |

Padrões de movimento reutilizáveis:
- **`stretchTo`:** indicador que anda (aba ativa, sublinhado, seleção) **estica** no caminho e encolhe ao chegar.
- **`swap`:** conteúdo que troca (número, texto, status) sai com um desfoque curto e o novo entra; saída e entrada separadas, nunca sobrepostas.
- **Câmera que aproxima** com `GENTLE` para o estado importante ocupar o quadro.

## 3. Durações (vídeo 30 fps; em quadros ≈ s × 30)
| movimento | duração |
|---|---|
| micro-interação (hover, clique, toggle) | 0,15–0,3 s |
| elemento pequeno entra/sai (ícone, palavra, chip) | 0,3–0,5 s |
| elemento médio (card, título) | 0,4–0,7 s |
| tela cheia / troca de cena | 0,5–0,9 s |
| chicote (*whip*) | 6–10 quadros (0,2–0,33 s) |
| saída | ~70–80% da duração da entrada |

**Escalonamento (*stagger*)** entre itens de uma lista ou palavras: 40–80 ms. Mais de ~8 itens: o total do stagger não passa de ~0,6 s.

## 4. "Nada parado" sem atrapalhar
- Drift de câmera: escala de 1,00 → 1,03 ao longo do plano, ou 10–30 px/s de deslocamento.
- Paralaxe: camada da frente move ~1,5–2× a de trás.
- Texto que precisa ser lido: no máximo um drift muito sutil, nunca tremendo nem girando.

## 5. Profundidade
- **Desfoque de fundo:** 4–12 px quando o primeiro plano é o foco.
- **Escala** para hierarquia: o que importa avança (escala ↑), o resto recua (escala ↓ + leve desfoque + opacidade 60–80%).
- **Paralaxe** em 2–3 camadas no máximo.

## 6. Transições (escolha 1–2 por vídeo e repita como linguagem; sistema completo em `transicoes-e-efeitos.md`)
| transição | quando |
|---|---|
| **hard cut na batida** | default; troca de ideia |
| ***match cut* / forma que vira cena** | conectar duas ideias com o mesmo formato ou posição (ex.: bolha de mensagem → card da agenda) |
| **máscara / wipe com forma da marca** | mudança de bloco (gancho → produto) |
| **chicote (*whip*)** | energia, virada; com motion blur direcional |
| **zoom-through** (entra num elemento e ele vira a próxima tela) | do "fora" para "dentro do produto" |

Regra de continuidade em motion: no *match cut*, mantenha **direção, velocidade e região da tela** (ver `cortes-e-montagem.md` §6).

## 7. Produto em uso (UI)
- **O cursor conduz:** toda mudança no app acontece **porque** alguém clicou, arrastou ou digitou. Nada muda sozinho na interface. Gestos: `move`, `click` (aperta, solta com mola, eco) e `press`.
- **Cursor real:** caminho em curva (nunca reta perfeita), acelera e desacelera, pausa curta (~0,2 s) antes do clique.
- **Micro-interações:** hover, botão que afunda (escala 0,96) e volta, eco do clique (anel que expande e some em ~0,4 s), contador que sobe, selo ou status que troca, digitação com cadência humana.
- **Zoom no que importa:** a câmera aproxima a área da ação (1,3–2×) e volta. Não mostrar a tela inteira pequena demais para ler no celular.

## 8. Checklist de movimento
- [ ] Nenhum movimento linear (exceto loops)?
- [ ] Entradas com ease-out e saídas com ease-in?
- [ ] Overshoot ≤ 4% (premium) / ≤ 10% (expressivo)?
- [ ] Só 1 protagonista em movimento por momento?
- [ ] No máximo 2 tipos de transição, sem crossfade solto?
- [ ] Cursor em curva, com pausa antes do clique?
