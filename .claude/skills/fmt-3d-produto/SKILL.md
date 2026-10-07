---
name: fmt-3d-produto
description: "Receita de herói 3D do produto: celular ou notebook girando com print real do produto na tela, órbita, paralaxe e reflexo de luz (10–20 s). Use quando o usuário pedir 3D, vídeo 3D, mockup animado, celular girando, notebook girando, 'produto em 3D', hero do app, abertura premium ou fmt-3d-produto. Usa a skill `video` como motor (plano, render e QA)."
---

# 3D produto

O aparelho com a tela real do produto como protagonista, em movimento de câmera de estúdio. Meio de funil e marca: abertura/revelação de trailer, hero de LP, anúncio de reconhecimento. Feed, reels e 16:9.

## Quando usar / quando não usar
- **Usar:** revelar o produto, dar sensação premium, mostrar que existe app no celular e no computador.
- **Não usar:** explicar um fluxo (→ `fmt-recorte-funcionalidade`); sem print real em `brand/screenshots/`; quando a tela precisa ser lida por mais de 3 s seguidos (use 2D).

## Parâmetros (o usuário pode mudar)
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
- **Sem enjoo:** rotação ≤ 30°/s, nunca giro contínuo de 360°; amplitude total ≤ 35° por movimento; nunca girar câmera e aparelho ao mesmo tempo; sem tremor de câmera.
- **Tela legível:** quando a tela carrega a mensagem, ela fica de frente (±3°) pelo tempo mínimo de leitura (`ritmo-e-leitura.md`). Em ângulo > 15°, a tela é só textura.
- **Print real** do produto, em alta resolução (≥ 2× o tamanho na tela); dados do elenco fictício, marcados como ilustrativos. Nada de tela inventada.
- **Luz:** 1 direção no vídeo todo; sombra suave do `brand.css`; reflexo uma vez, branco translúcido (opacidade ≤ 0,25) só no vidro. Fundo liso da marca.
- **CSS 3D (default, determinístico):** `perspective` 1200–2000 px no palco, `transform-style: preserve-3d` no aparelho, camadas de corpo, borda e tela; animar só `transform`. `filter`, `opacity < 1` e `overflow: hidden` no pai achatam o 3D: aplique-os em filhos.
- **Three.js/R3F (só se precisar):** modelo glTF de aparelho com licença registrada, órbita > 35° ou reflexo físico real. Animação dirigida pelo tempo da timeline, nunca pelo relógio do navegador. A captura de WebGL **precisa ser validada no kit** (tarefa 003) antes de prometer o render.
- Movimento e cores pela marca (`BRAND.md` pode pedir `GENTLE` em tudo).

## Erros comuns
- Celular girando sem parar.
- Tela em ângulo forte justo quando a mensagem aparece.
- Mockup genérico com tela falsa.
- Sombras pesadas, glow ou gradiente no fundo.
- Blur aplicado no pai do 3D (achata tudo).

## Exemplo (kz) — 12 s, 85 BPM, celular
- 0,0 s — celular inclinado sobe com `GENTLE`; tela: agenda da semana (print real, pacientes ilustrativos).
- 2,0 s — órbita −12° → +12°; card "lembrete enviado" flutua à frente (paralaxe 1,8×).
- 4,0 s — reflexo cruza o vidro.
- 5,0 s — de frente; toque numa sessão abre a sala de videochamada (recurso em `BUSINESS.md`).
- 9,0 s — zoom-through na tela → "Feito por terapeuta, pra terapeuta."
- 10 s — "Peça seu acesso" + logo.

## Checklist do formato
- [ ] Rotação ≤ 30°/s e ≤ 35° por movimento?
- [ ] Tela de frente sempre que carrega a mensagem?
- [ ] Print real, dados ilustrativos?
- [ ] 1 direção de luz, reflexo único?
- [ ] CSS 3D, ou WebGL validado no kit?
- [ ] Pipeline: siga a skill `video`.
