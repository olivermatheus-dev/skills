# 003 — Stack de render de motion + protótipo

**Status:** rascunho · **Depende de:** 001

## Objetivo
Escolher **uma** forma de o Claude escrever animações (HTML/CSS/JS) e renderizar em MP4 localmente, com qualidade e de forma previsível. Provar com um protótipo de 10–15 s usando a marca da kz.

## Candidatos (pesquisa curta: verificar licença, maturidade, se suporta fontes, SVG, áudio e 60 fps)
- **HyperFrames**: framework HTML → vídeo pensado para agentes.
- **Remotion**: React → MP4; maduro, com preview no navegador (Studio); licença gratuita para empresas pequenas (confirmar).
- **Playwright + ffmpeg**: captura frame a frame; nenhuma dependência nova (o carrossel já usa Playwright).
- Bibliotecas de animação a considerar dentro do HTML: GSAP (agora gratuita), Lottie (para vetores animados).
- **3D** (o usuário vai usar animações e recursos 3D): Three.js / React Three Fiber, modelos glTF, cenas exportadas do Spline. Verificar se o render escolhido captura WebGL frame a frame sem perder qualidade.

Critérios de escolha: (1) qualidade final, (2) o Claude escreve com facilidade, (3) render determinístico (frame a frame, sem travadas), (4) preview rápido, (5) depois dá para conectar com uma timeline (ver `DEPOIS.md`).

## Perguntas em aberto
- [ ] Máquina do usuário: Windows ou Mac? Já tem Node e ffmpeg?
- [ ] 2–3 vídeos de referência de motion que o usuário acha excelentes

## Critérios de pronto
- [ ] `DECISAO.md` nesta pasta (escolha, prós/contras, como instalar)
- [ ] Protótipo 9:16 de 10–15 s com tipografia animada, logo e cores da kz, renderizado em MP4
- [ ] Teste com 1 elemento 3D (ex.: celular girando com print do produto) renderizado sem perda de qualidade

## Log
- 2026-10-06 — criada.
