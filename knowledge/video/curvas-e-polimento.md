# Curvas e micro-polimento (Graph Editor → código)

> Base: material do usuário "Etapa 9" (2026-10-07), verificado e **traduzido para o nosso stack** (HTML/CSS + GSAP + HyperFrames). Não temos Graph Editor: a curva vive na escolha do `ease`, no `CustomEase`, na estrutura da timeline e na inspeção por quadros. **Não desenhe curvas bonitas: desenhe comportamento.**

## 1. Ler o comportamento antes de mexer
Descreva em linguagem natural antes de ajustar. Exemplos:
- "sai rápido, pico no primeiro terço, chegada longa, sem parar no meio";
- "acelera devagar, pico no fim, para seco".

Se não consegue descrever, não ajuste no chute. As perguntas:
- quando acelera?
- onde é o pico?
- quanto dura?
- quando desacelera?
- chega a zero?
- passa do destino?
- assenta?

## 2. Equivalências AE → GSAP
| conceito (After Effects) | no nosso código |
|---|---|
| Speed Graph (velocidade) | escolha da família de `ease` + **inspeção de velocidade por quadro** (§6) |
| Value Graph (valor: overshoot, bounce) | `back.out(n)`, molas do kit, `elastic.out(a,p)`, keyframes de valor |
| influência do handle | "força" da curva: `power1` < `power2` < `power3` < `power4` < `expo` (quanto do tempo é gasto perto do destino) |
| handles assimétricos | curvas `.out` (saída rápida, chegada longa) ou `CustomEase` com bezier assimétrico (`"M0,0 C0.2,0 0,1 1,1"`) |
| Linear | `ease: "none"` |
| Hold (stepped) | `ease: "steps(n)"` ou `tl.set()`. Use para contador, troca de estado, stop motion, tipografia em degraus |
| Bezier contínuo / keyframe de passagem | **um único tween com `keyframes` e `easeEach`**, ou `motionPath` com `ease` no movimento inteiro. Evita "anda → para → anda" |
| Auto Bezier | curva automática do `motionPath` (`curviness`): ponto de partida; revise o caminho |
| interpolação espacial (caminho) | `motionPath` (plugin gratuito do GSAP): `path`, `curviness`, `autoRotate` |
| roving keyframes | `motionPath` com o ease aplicado ao percurso todo, quando os tempos intermediários não carregam significado |
| separar dimensões | tweens separados para `x` e `y` (eases diferentes por eixo) |
| offset de propriedades/camadas | parâmetro de posição da timeline: `"<0.05"`, `"-=0.1"`, `">"` |

## 3. Regras de curva
- **O pico não precisa estar no meio:** pico cedo = enérgico (saída explosiva); pico tardio = contemplativo. A simetria é uma escolha.
- **Velocidade zero = parada.** Ponto intermediário de passagem (A → B → C) **não para em B**: use um tween com `keyframes` e um ease no conjunto, ou o `motionPath`.
- **Continuidade de velocidade e de aceleração:** sem colisão, mudança de força ou virada deliberada, nada de solavancos. Quinas só quando a linguagem é mecânica ou de impacto.
- **Tempo e caminho são problemas diferentes:** um easing ótimo não corrige trajetória ruim (curvas acidentais, desvios, "bumerangue", arco sem função). Cada curva espacial precisa fazer sentido como trajetória.
- **Propriedades não andam em bloco:** posição, escala, rotação e opacidade podem ter tempos e eases diferentes. Ex.: a opacidade chega a 1 em 40% do tempo; a escala assenta 2–3 quadros depois da posição. **Offsets pequenos criam causalidade**: decida quem lidera (container → headline → metadado).
- **Pense em quadros:** a 30 fps, 1 quadro = 33 ms; a 60 fps, 16,7 ms. "5 quadros" muda conforme o fps: converta sempre (`movimento.md` §3).
- **Durações não são lei:** dependem da distância, escala, fps, complexidade, quantidade de texto, estilo e ritmo. Defaults são pontos de partida.
- **Overshoot é consequência da energia:** ultrapassagem real do valor (0 → 100 → 104 → 100), proporcional a tamanho, material e velocidade. **Seletivo:** opacidade nunca passa de 1; posição pode passar; escala responde de leve. **Hierárquico:** só o principal elástico, os secundários discretos ou estáveis.
- **Amortecimento:** cada oscilação perde amplitude e duração; amplitude constante é máquina.
- **Snap sem bounce:** desaceleração rápida (`expo.out`/`power4.out` curto) + chegada precisa (+ click discreto). Ideal em UI, tech, minimalista e premium. **Impacto não exige quique.**
- **Economia de keyframes:** cada keyframe representa um **estado ou mudança de força**. Mais keyframes = mais chance de solavancos e pausas. Use o mínimo que descreve o comportamento.

## 4. Percepção > matemática
- **Sincronia óptica:** dois eventos com o mesmo timestamp podem não *parecer* juntos (tamanho, contraste e velocidade diferentes). Ajuste 1–3 quadros pelo olho.
- **Velocidade óptica:** a mesma distância e o mesmo tempo parecem velocidades diferentes conforme tamanho, contraste e trajetória. Ajuste pela percepção.
- **Som no evento percebido** (`sound-design.md`), não no primeiro keyframe:
  - whoosh com o pico no **pico de velocidade**;
  - impacto no **contato** (com overshoot, normalmente no primeiro contato, não no settle).

## 5. Famílias de curva (por marca/projeto)
Reuse **comportamento**, não números:
| família | uso | GSAP (ponto de partida) |
|---|---|---|
| `sharp_enter` | entrada decidida de UI | `power4.out` / `expo.out`, curto |
| `smooth_arrival` | chegada elegante | `power3.out`, médio |
| `premium_snap` | encaixe sem bounce | `expo.out` curto + settle de 1–2 quadros |
| `soft_float` | fundo, drift | `sine.inOut`, longo |
| `playful_spring` | pop com vida | mola `SOFT` / `back.out(1.6)` |
| `cinematic_drift` | câmera lenta | `power1.inOut`, longo |

Diagnóstico após aplicar uma família ou preset:
- velocidade certa para esta distância?
- overshoot adequado a este elemento?
- settle demora?
- combina com o projeto?
- texto legível?
- ficou genérico?

## 6. Inspeção (o nosso "Graph Editor")
- **Por quadros:** renderizar quadros-chave e folhas de contato (`check` do kit). No movimento importante, quadro a quadro: onde começa, onde está o maior deslocamento, onde começa a desacelerar, overshoot, settle, recortes, blur, máscaras. **O gráfico explica; os quadros mostram.**
- **Velocidade medida:** amostrar a posição do elemento a cada quadro (no navegador headless) e calcular a velocidade revela paradas acidentais, picos e quinas. *Ferramenta a construir com o kit (tarefa 003/009).*
- **Em tempo real, sempre por último:** a curva pode ser matemática e ficar feia. **A percepção decide.**
- **Em contexto:** alguns segundos antes → animação → alguns depois (energia, continuidade, música, fala, outros gráficos).
- **Em loop:** para diagnosticar. Não otimize "o GIF"; o espectador vê uma vez.
- **Em câmera lenta:** para achar defeitos (saltos, *popping*, máscara errada). **A personalidade se julga em tempo real.**
- **Motion blur:** ligue só depois do movimento resolvido; desligue de novo para ver se não está escondendo problema.
- **Texto animado:** leitura > hierarquia > movimento.
- **A/B:** na dúvida entre duas curvas, renderize as duas e compare lado a lado, no contexto.
- **Sem efeitos:** desligue SFX, glow, blur extra, partículas, distorção e overlays. Se perder a graça, a curva é que está fraca.
- **Simplificação:** menos overshoot, stagger, duração, keyframes e propriedades. **Polir também é subtrair.**

## 7. Passadas separadas
Não misture layout, texto, cor, timing e som o tempo todo. Faça passadas dedicadas:
1. **estrutura:** blocking e poses;
2. **refinamento:** curvas, timing, offsets, trajetórias, settle, blur;
3. **limpeza:** keyframes redundantes, camadas e nomes organizados, elementos invisíveis removidos, limites e artefatos revisados.

## 8. Sinais (diagnóstico rápido)
**Barato:**
- mesmo ease em tudo;
- flutuante;
- overshoot padrão em toda entrada;
- bounce excessivo;
- pausas em keyframes intermediários;
- tudo começa e acaba junto;
- blur exagerado;
- stagger lento;
- distâncias enormes sem motivo;
- mesma duração para tudo;
- sem reading hold;
- elementos irrelevantes se mexendo;
- curvas complexas sem função.

**Não corrija com mais efeito.**

**Premium:**
- intenção clara e poucos movimentos principais;
- timing preciso e curvas ajustadas;
- chegadas controladas e continuidade;
- offsets discretos;
- estabilidade na leitura;
- som proporcional;
- consistência entre cenas.

**Premium = controle percebido.**

## 9. Checklist final de uma animação importante
- [ ] **Intenção:** por que se move?
- [ ] **Timing:** a duração está certa?
- [ ] **Spacing:** a distribuição está certa?
- [ ] **Pico:** a velocidade máxima está no lugar certo?
- [ ] **Continuidade:** há paradas ou picos acidentais?
- [ ] **Caminho:** a trajetória está limpa?
- [ ] **Chegada:** adequada?
- [ ] **Overshoot:** só quando precisa?
- [ ] **Settle:** termina com controle?
- [ ] **Hierarquia:** o mais importante é percebido primeiro?
- [ ] **Leitura:** há tempo para consumir?
- [ ] **Som:** está nos eventos certos?
- [ ] **Efeitos:** ajudam ou escondem?
- [ ] **Contexto:** funciona com o antes e o depois?
- [ ] **Simplificação:** dá para tirar algo?

**Keyframes definem estados; a curva define o caminho temporal entre eles; o micro-polimento transforma o caminho em sensação.**
