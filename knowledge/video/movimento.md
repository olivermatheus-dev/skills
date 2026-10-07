# Movimento

> Fontes: Etapas 7–9 + guia do Ludus (consolidado em 2026-10-07). Valores = ponto de partida.

**Anime comportamento, não propriedades.** Antes: por que se move · que força o inicia · como assenta.

## 1. Regras-base
- **Nada linear.** `ease: "none"` só em loop mecânico, scanner, barra de progresso, relógio, marquee.
- **Um protagonista por vez.** Contraste de movimento = contraste de importância; se tudo se move, nada se destaca. Fundo e rótulos podem já estar lá.
- **Nada totalmente parado:** drift sutil, mas texto em leitura fica estável.
- **Profundidade** com escala, desfoque e paralaxe, não com sombra pesada.
- **Transformar > destruir e recriar:** card vira a próxima tela, número vira dado do gráfico; elemento persistente (título) fica.
- **Movimento antes de efeito:** desligue glow, partículas, blur e SFX; posição/escala/rotação/opacidade têm que funcionar sozinhas.

## 2. Easing
⚠️ **Terminologia:** After Effects "ease in" (chegada suave) = GSAP/CSS **`.out`**; AE "ease out" (saída suave) = **`.in`**; "ease in-out" = `.inOut`. **No código, siga sempre o GSAP.**

| situação | GSAP |
|---|---|
| entrada (chega) | `power3.out` / `expo.out` |
| saída (vai embora) | `power2.in` |
| deslocamento na tela | `power2.inOut` |
| pop com vida | `back.out(1.4–1.8)` ou mola `SOFT` |
| elemento físico (card, botão) | mola do kit, no máx. 1 quique |
| contador, troca de estado, tipografia em degraus | `steps(n)` ou `tl.set()` |

- Força da curva (quanto tempo perto do destino): `power1` < `power2` < `power3` < `power4` < `expo`.
- **Pico não precisa estar no meio:** pico cedo = enérgico; tardio = contemplativo. Assimetria é normal (premium: saída rápida + chegada longa); bezier assimétrico: `CustomEase "M0,0 C0.2,0 0,1 1,1"`.

### Molas nomeadas (preferir a curvas genéricas; kit do Ludus)
| mola | passagem | uso |
|---|---|---|
| `SNAP` | 0% | encaixe seco: chip, check, troca de estado |
| `FAST` | ~4% | entrada de UI, botão |
| `SOFT` | ~8% | pop: card, selo, número |
| `GENTLE` | ~2% | câmera, aproximação, grandes deslocamentos |

### Famílias por projeto (reuse comportamento, não números)
| família | GSAP |
|---|---|
| `sharp_enter` (entrada decidida de UI) | `power4.out` / `expo.out`, curto |
| `smooth_arrival` (chegada elegante) | `power3.out`, médio |
| `premium_snap` (encaixe sem bounce) | `expo.out` curto + settle 1–2 quadros |
| `soft_float` (fundo, drift) | `sine.inOut`, longo |
| `playful_spring` | `SOFT` / `back.out(1.6)` |
| `cinematic_drift` (câmera lenta) | `power1.inOut`, longo |

## 3. Durações e stagger (30 fps: 1 quadro = 33 ms; 60 fps = 16,7 ms; converta sempre)
| movimento | duração |
|---|---|
| micro-interação (hover, clique, toggle) | 0,15–0,3 s |
| elemento pequeno (ícone, palavra, chip) | 0,3–0,5 s |
| elemento médio (card, título) | 0,4–0,7 s |
| tela cheia / troca de cena | 0,5–0,9 s |
| chicote (*whip*) | 6–10 quadros |
| saída | ~70–80% da entrada |

Tokens de projeto: `micro` 120–180 ms · `fast` 200–300 · `standard` 350–500 · `deliberate` 600–800 · `cinematic` 900+.
- **Duração escala com distância e tamanho:** mesma duração em distância 3× = 3× mais rápido. Grande pede mais tempo.
- **Stagger:** 40–80 ms entre itens; > ~8 itens, total ≤ ~0,6 s. Ordem com sentido (leitura, posição, hierarquia). Pode ser não uniforme (1º, pausa, 3 rápidos = fraseado). Stagger lento = barato.
- **Ordem perceptiva:** container → headline → dado → explicação. Não comece tudo junto.
- **Ciclo:** movimento → assenta → **leitura** → próximo. O hold de leitura conta **a partir de quando o texto fica legível e parado** (tempos em `ritmo.md`).

## 4. Física (use quando ajuda; nunca tudo em tudo)
- **Overshoot:** premium **0–4%** (escala 1,02–1,04) ou nenhum; expressivo **até 8–10%**. Seletivo: opacidade nunca passa de 1; posição pode; escala de leve. Só o principal elástico. **Proibido como receita:** `scale 0 → 110 → 95 → 100`.
- **Snap sem bounce** (`expo.out`/`power4.out` curto + chegada precisa) é o default de UI/premium. Impacto não exige quique.
- **Antecipação:** recuo contrário de 2–4% da distância (premium, quase imperceptível); nem toda micro-interação precisa.
- **Bounce/amortecimento:** cada quique perde amplitude (×0,4–0,6) e duração. Quiques iguais = máquina. Leve quica mais; pesado, menos.
- **Follow-through / overlap:** secundário chega 2–4 quadros depois (texto após o container, sombra após o card). Coordenado ≠ simultâneo.
- **Propriedades com tempos próprios:** opacidade chega a 1 em ~40% do tempo; escala assenta 2–3 quadros após a posição; `x` e `y` em tweens separados se precisar de eases diferentes. Offsets na timeline: `"<0.05"`, `"-=0.1"`.
- **Arcos:** cursor e objeto físico andam em curva; UI técnica pode andar reto.
- Mudança brusca de direção/velocidade precisa de causa.
- **Squash & stretch:** preserve volume; em UI sutil (clique: scaleY ~0,97–0,98, scaleX ~1,01).
- **`transform-origin` com causa:** menu nasce do botão, barra cresce da base/esquerda, card perto de quem o abriu. Não cresça tudo do centro.
- **Opacidade:** fade puro é passivo; combine com y 16–40 px (em 1080) ou escala 0,96 → 1, **nunca escala 0 → 1**.
- **Blur de movimento:** só alguns quadros em movimento rápido; texto nunca borrado na leitura; não esconde animação ruim.

## 5. Curva e caminho
- **Velocidade zero = parada.** Passagem A → B → C não para em B: um tween com `keyframes` + `easeEach`, ou `motionPath` (`path`, `curviness`, `autoRotate`) com ease no percurso todo.
- **Sem solavancos:** velocidade contínua; quina só em linguagem mecânica/impacto.
- **Tempo e caminho são problemas diferentes:** ease bom não salva trajetória ruim (desvio, bumerangue, arco sem função).
- **Mínimo de keyframes:** cada um = um estado ou mudança de força.
- **Percepção > matemática:** ajuste sincronia 1–3 quadros pelo olho.
- **Som no evento percebido:** whoosh no pico de velocidade; impacto no primeiro contato, não no settle (`som.md`).

## 6. Entradas, saídas, transições
- Entrada pela origem e função; não a mesma para tudo.
- **Saída ≠ entrada invertida:** rápida e funcional, prepara a próxima composição.
- **Transição com motivo, 1–2 tipos por vídeo, repetidos como linguagem; nunca crossfade solto** (sistema em `efeitos.md`):

| transição | quando |
|---|---|
| hard cut na batida | default; troca de ideia |
| *match cut* / forma que vira cena | mesmo formato/posição liga duas ideias |
| máscara/wipe com forma da marca | mudança de bloco |
| chicote (*whip*) | energia, virada; com motion blur direcional |
| zoom-through | de "fora" para "dentro do produto" |

- *Match cut*: mantenha direção, velocidade e região da tela (`montagem.md`).

## 7. "Nada parado" e profundidade
- Drift de câmera: escala 1,00 → 1,03 no plano, ou 10–30 px/s.
- Paralaxe: frente ~1,5–2× a de trás; máx. 2–3 camadas.
- Desfoque de fundo 4–12 px quando o primeiro plano é o foco.
- Hierarquia: o que importa avança (escala ↑); o resto recua (escala ↓ + leve desfoque + opacidade 60–80%).

## 8. Produto em uso (UI)
- **O cursor conduz:** nada muda na interface sem clique, arraste ou digitação. Gestos: `move`, `click` (aperta, solta com mola, eco), `press`.
- Cursor em curva, acelera/desacelera, pausa ~0,2 s antes do clique.
- Micro-interações: botão afunda (escala 0,96) e volta; eco do clique (anel que expande e some em ~0,4 s); contador que sobe; digitação com cadência humana.
- Padrões: **`stretchTo`** (indicador estica no caminho, encolhe ao chegar); **`swap`** (sai com blur curto, novo entra; nunca sobrepostos); câmera `GENTLE` aproxima a ação 1,3–2× e volta. Nunca tela inteira pequena demais para o celular.

## 9. Personalidade (a da marca: `BRAND.md` > Movimento)
**premium** rápido/controlado, overshoot 0–4%, settle curto · **playful** + bounce, squash, overlap · **técnico** linear/snap · **cinematográfico** longo, drift, profundidade.

## 10. Diagnóstico
| sintoma | correção |
|---|---|
| flutuante/gelatinoso (ease longo, sem pico) | encurtar, acelerar decidido, deslocar o pico |
| seco/robótico (velocidade constante, tudo junto) | aceleração/desaceleração, overlap, offsets |
| mole (oscilação demais, settle longo) | menos amplitude, oscilações e settle |
| "preset" (mesmo ease/overshoot/origem/stagger em tudo) | variar **pela função** do elemento |

**Não corrija com mais efeito. Polir também é subtrair. Premium = controle percebido.**

**Fluxo:** blocking (estados e ordem) → key poses (inicial, antecipação, principal, overshoot, settle) → curvas/offsets → limpeza (keyframes redundantes, invisíveis) → som nos eventos existentes.
**Inspeção:** folha de contato (`check` do kit; `tecnico.md`); loop e câmera lenta acham defeitos, mas **personalidade se julga em tempo real, no contexto**; A/B na dúvida.

## 11. QC de movimento
- [ ] Nenhum linear fora de loop/mecânico; entradas `.out`, saídas `.in` (~70–80% da entrada).
- [ ] Overshoot ≤ 4% premium / ≤ 10% expressivo; opacidade nunca > 1; sem `scale 0 →`.
- [ ] Um protagonista por momento; ordem container → headline → dado.
- [ ] Duração proporcional à distância; stagger 40–80 ms (total ≤ ~0,6 s).
- [ ] Sem paradas acidentais em passagem, solavancos ou trajetória sem função.
- [ ] Texto legível e parado no hold; sem blur na leitura.
- [ ] Máx. 2 tipos de transição, sem crossfade solto.
- [ ] Cursor em curva, pausa antes do clique; nada muda sem causa.
- [ ] Funciona sem áudio e sem efeitos; som no pico/contato.
- [ ] Teste de simplificação: tirar algo melhora? Então tire.
