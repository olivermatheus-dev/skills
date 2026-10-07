# 003 — Stack de render de motion + protótipo

**Status:** rascunho · **Depende de:** 001

## Objetivo
Escolher **uma** forma de o Claude escrever animações (HTML/CSS/JS) e renderizar em MP4 localmente, com qualidade e de forma previsível. Provar com um protótipo de 10–15 s usando a marca da kz.

## Fato novo (2026-10-07)
O usuário **já usa HyperFrames + GSAP em produção** no produto Ludus (skill `ludus-video`, ver `../002-conhecimento-motion/material/2026-10-07-skill-ludus-video.md`). O kit de lá tem:
- `motion.js`: molas, `swap`, `stretchTo`, `cursor`, `offset`.
- scripts `tts`, `words`, `music`, `sfx`, `mix`, `produce`, `check`.
- motion blur.
- um `GUIA-DE-MOVIMENTO.md`.

→ **HyperFrames + GSAP vira o candidato nº 1.** Antes de pesquisar alternativas, avaliar **reaproveitar o kit do Ludus** de forma genérica (sem regras do Ludus).

## Requisito novo (2026-10-07)
O kit precisa carregar **cenas isoladas por id** e aplicar **CSS de tema por variante** (tarefa 013), para gerar variantes de anúncio sem reescrever código.

## Candidatos (pesquisa curta: verificar licença, maturidade, se suporta fontes, SVG, áudio e 60 fps)
- **HyperFrames + GSAP** (em uso no Ludus): framework HTML → vídeo pensado para agentes.
- **Remotion**: React → MP4; maduro, com preview no navegador (Studio); licença gratuita para empresas pequenas (confirmar).
- **Playwright + ffmpeg**: captura frame a frame; nenhuma dependência nova (o carrossel já usa Playwright).
- Bibliotecas de animação a considerar dentro do HTML: GSAP (agora gratuita), Lottie (para vetores animados).
- **3D** (o usuário vai usar animações e recursos 3D): Three.js / React Three Fiber, modelos glTF, cenas exportadas do Spline. Verificar se o render escolhido captura WebGL frame a frame sem perder qualidade.

Critérios de escolha: (1) qualidade final, (2) o Claude escreve com facilidade, (3) render determinístico (frame a frame, sem travadas), (4) preview rápido, (5) depois dá para conectar com uma timeline (ver `DEPOIS.md`).

## Perguntas em aberto
- [ ] Máquina do usuário: provavelmente **Windows** (o Ludus usa `Start-Process` e `fnm` com Node 22). Confirmar se tem ffmpeg e Python.
- [ ] **Pode trazer o `_kit` do Ludus** (motion.js, scripts, GUIA-DE-MOVIMENTO.md) para este repo como base genérica?
- [ ] Qual provedor de TTS o Ludus usa (voz "Thalita")? Mesma conta serve aqui?
- [ ] 2–3 vídeos de referência de motion que o usuário acha excelentes

## Critérios de pronto
- [ ] `DECISAO.md` nesta pasta (escolha, prós/contras, como instalar)
- [ ] Protótipo 9:16 de 10–15 s com tipografia animada, logo e cores da kz, renderizado em MP4
- [ ] Teste com 1 elemento 3D (ex.: celular girando com print do produto) renderizado sem perda de qualidade

## Log
- 2026-10-06 — criada.
- 2026-10-07 — HyperFrames + GSAP vira o candidato nº 1 (já em produção no Ludus). Próximo passo: reaproveitar o kit.
