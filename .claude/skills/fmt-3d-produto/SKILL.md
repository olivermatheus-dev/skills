---
name: fmt-3d-produto
description: "Receita de herói 3D do produto: celular ou notebook girando com print real do produto na tela, órbita, paralaxe e reflexo de luz (10–20 s). Use quando o usuário pedir 3D, vídeo 3D, mockup animado, celular girando, notebook girando, 'produto em 3D', hero do app, abertura premium ou fmt-3d-produto. Usa a skill `video` como motor (plano, render e QA)."
---

# 3D produto

Estilo default: Tech Product + Premium Minimal
Motor: skill `video` (nível médio por padrão) · regras gerais: `knowledge/video/REGRAS.md`.

**Não usar:** explicar fluxo (→ `fmt-recorte-funcionalidade`) · sem print real · tela lida > 3 s (use 2D).

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| aparelho | celular | notebook · os dois (paralaxe) |
| duração | 12 s | 8–20 s |
| motor 3D | CSS 3D | Three.js/R3F (só com motivo, ver abaixo) |
| movimento | órbita curta | entrada de baixo · paralaxe de camadas · zoom-through na tela |
| uso | peça própria | bloco dentro do `fmt-trailer-lancamento` |

## Receita de cenas (12 s)
| bloco | tempo | na tela | movimento | som |
|---|---|---|---|---|
| entrada | 0–2 s | aparelho já no quadro, inclinado (rotateY −25°, rotateX 8°) | sobe 120 px e gira até −12° com `GENTLE` | grave suave |
| órbita | 2–5 s | aparelho de 3/4, 2 cards de UI flutuando à frente | rotateY −12° → +12°; cards com paralaxe 1,5–2× | pulso |
| reflexo | 4–5 s | faixa de luz cruza o vidro uma vez | 0,9 s, `power2.inOut` | *shimmer* curto |
| de frente | 5–9 s | tela encarando a câmera (±3°) com a mensagem do vídeo | aproxima 1,2× com `GENTLE`; dentro da tela, 1 gesto real com cursor/toque | clique preso ao `event` |
| saída | 9–10 s | zoom-through na tela ou aparelho recua | `GENTLE`; vira o cartão final por match cut | whoosh 4–8 quadros antes |
| cartão final | 10–12 s | CTA + marca | parado + drift | cauda |

## Regras do formato
- **Sem enjoo:** ≤ 30°/s, ≤ 35° por movimento, nunca 360° contínuo; câmera e aparelho nunca giram juntos; sem tremor.
- **Tela legível:** com a mensagem, de frente (±3°); em ângulo > 15° é só textura. Nunca mockup genérico.
- **CSS 3D (default):** `perspective` 1200–2000 px no palco, `preserve-3d` no aparelho, camadas corpo/borda/tela. `filter`, `opacity < 1` e `overflow: hidden` no pai achatam o 3D: aplique nos filhos.
- **Three.js/R3F só se precisar** (glTF licenciado, órbita > 35°, reflexo físico); captura WebGL **validada no kit** (tarefa 003) antes de prometer.
- **Integração** (`knowledge/video/efeitos.md`): UI recortada pela tela (cantos, notch), com pretos e brancos nos tons do `brand.css` (nada de `#000` puro); sombra de contato que desbota quando o aparelho sobe.

## Exemplo (kz) — 12 s, 85 BPM, celular
- 0 s celular sobe, agenda (print real, pacientes ilustrativos) · 2 s órbita; card "lembrete enviado" (paralaxe 1,8×).
- 4 s reflexo · 5 s de frente, toque abre a videochamada.
- 9 s zoom-through → "Feito por terapeuta, pra terapeuta." · 10 s "Peça seu acesso".

## Checklist do formato
- [ ] ≤ 30°/s e ≤ 35° por movimento?
- [ ] Tela de frente quando carrega a mensagem?
- [ ] Filtros e opacidade só nos filhos?
- [ ] CSS 3D, ou WebGL validado no kit?
