---
name: fmt-3d-produto
description: "Receita de herói 3D do produto: celular ou notebook girando com print real do produto na tela, órbita, paralaxe e reflexo de luz (10–20 s). Use quando o usuário pedir 3D, vídeo 3D, mockup animado, celular girando, notebook girando, 'produto em 3D', hero do app, abertura premium ou fmt-3d-produto. Usa a skill `video` como motor (plano, render e QA)."
---

# 3D do produto

Celular ou notebook girando com o print real na tela: abertura premium do produto, herói de LP ou bloco dentro do `fmt-trailer-lancamento`. Topo/meio de funil. Motores: `plano-de-cenas` e `video` (nível médio); os **Padrões do Oliver** (skill `video`) mandam sobre esta receita. Estilo: Tech Product + Premium Minimal.

## Especialista
Você é motion designer de produto em 3D: o aparelho é o herói, a tela é a prova.
- **Repertório:** órbita curta e paralaxe de camadas; tela de frente quando carrega a mensagem; UI integrada ao vidro.
- **Bom é:** sem enjoo · tela legível quando importa · parece produto real, nunca mockup genérico.
- **Não faz:** explicar fluxo (→ `fmt-recorte-funcionalidade`); 3D sem print real; tela lida por mais de 3 s (use 2D).

## Contexto
- `library/formatos/3d-produto/formato.json` · sempre — observações do Oliver (mandam sobre esta receita) e variações
- `knowledge/video/efeitos.md#3. Integração (compositing)` · sempre — UI dentro do aparelho, sombra e tons de preto e branco
- `roadmap/tasks/003-stack-motion/TASK.md` · quando: pensar em Three.js/R3F — se a captura WebGL já está validada no kit

## Entradas e saídas
- **Recebe:** pedido com aparelho e mensagem; print real em `brand/screenshots/`.
- **Entrega:** roteirista → a mensagem da tela de frente e o CTA (no `roteiro.md`); editor-de-video → plano e MP4 pela `video`.
- **Salva em:** `companies/<slug>/contents/<ID>-<nome>/` (anúncio: `campaigns/…`), `formato: 3d-produto` no `peca.json` → aval do plano pelo Oliver.

## Ordem de trabalho
1. `formato.json` e o **Não faz**. Sem print real → pare e peça. Parâmetros do pedido, senão os defaults.
2. Roteirista: 1 mensagem curta para a tela de frente + 1 CTA.
3. Editor-de-video: motor 3D pela regra abaixo; depois, `video` etapas 2–5.

## Regras duras
- **Sem enjoo:** ≤ 30°/s, ≤ 35° por movimento, nunca 360° contínuo; câmera e aparelho nunca giram juntos; sem tremor.
- **Tela legível:** com a mensagem, de frente (±3°); em ângulo > 15° é só textura.
- **CSS 3D (default):** `perspective` 1200–2000 px no palco, `preserve-3d` no aparelho, camadas corpo/borda/tela. `filter`, `opacity < 1` e `overflow: hidden` no pai achatam o 3D: aplique nos filhos. Three.js/R3F só se precisar (glTF licenciado, órbita > 35°, reflexo físico) e com a captura WebGL validada no kit.
- **Integração:** UI recortada pela tela (cantos, notch), pretos e brancos nos tons do `brand.css` (nada de `#000` puro); sombra de contato que desbota quando o aparelho sobe.

## Checklist antes de entregar
- ≤ 30°/s e ≤ 35° por movimento, sem 360° e sem câmera e aparelho girando juntos?
- A tela está de frente (±3°) quando carrega a mensagem?
- O print é real (dados de paciente ilustrativos), recortado pela tela?
- `filter` e opacidade só nos filhos, nunca no pai do 3D?
- É CSS 3D, ou WebGL já validado no kit?

## Parâmetros
aparelho **celular** (notebook · os dois em paralaxe) · duração **12 s** (8–20) · motor **CSS 3D** (Three.js/R3F) · movimento **órbita curta** (entrada de baixo · paralaxe de camadas · zoom-through na tela) · uso **peça própria** (bloco dentro do trailer).

## Receita de cenas (12 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| entrada | 0–2 s | aparelho já no quadro, inclinado (rotateY −25°, rotateX 8°) | sobe 120 px e gira até −12°, `GENTLE` | grave suave |
| órbita | 2–5 s | 3/4, 2 cards de UI à frente | rotateY −12° → +12°; cards com paralaxe 1,5–2× | pulso |
| reflexo | 4–5 s | faixa de luz cruza o vidro uma vez | 0,9 s, `power2.inOut` | *shimmer* curto |
| de frente | 5–9 s | tela de frente (±3°) com a mensagem | aproxima 1,2× `GENTLE`; 1 gesto real com cursor/toque | clique no `event` |
| saída | 9–10 s | zoom-through na tela ou aparelho recua | `GENTLE`; vira o cartão final por match cut | whoosh 4–8 quadros antes |
| cartão final | 10–12 s | CTA + marca | drift + microanimação | cauda; trilha resolvendo |

## Exemplo (kz) — 12 s, 85 BPM, celular
0 s celular sobe, agenda (print real, pacientes ilustrativos) · 2 s órbita; card "lembrete enviado" (paralaxe 1,8×) · 4 s reflexo · 5 s de frente, toque abre a videochamada · 9 s zoom-through → "Feito por terapeuta, pra terapeuta." · 10 s "Peça seu acesso".
