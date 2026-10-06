# 101 — Arquitetura e stack do editor de vídeo

**Status:** rascunho · **Fase:** 3 · **Depende de:** 001 · **Visão:** [../../VIDEO.md](../../VIDEO.md)

## Objetivo
Decidir a arquitetura do "editor de vídeo integrado ao Claude Code": ferramentas, onde fica o código (`video/` na raiz?), como templates, presets e tokens se conectam, e como o usuário faz preview e render. Sai daqui um **documento de decisão** e um **protótipo de 10 s** renderizado com tokens da kz.

## Avaliar
- Remotion (React → MP4) vs. alternativas (HTML+ffmpeg, MLT/Shotcut headless, Motion Canvas)
- ffmpeg + Whisper (local, ex.: whisper.cpp ou faster-whisper) para base real e legendas com tempo por palavra
- Detecção de cena (ffmpeg `scdet` / PySceneDetect) para cortes e para a engenharia reversa
- Preview: Remotion Studio local; render: CLI
- Licença do Remotion (gratuito para indivíduos e empresas pequenas — confirmar)

## Perguntas em aberto
- [ ] Máquina do usuário: Windows ou Mac? GPU? Aceita instalar Node, Python e ffmpeg?
- [ ] 3–5 vídeos de referência do estilo desejado (servem também de teste para a 106)
- [ ] Faz sentido uma interface visual própria do editor ou o Remotion Studio + Claude Code basta no começo?

## Critérios de pronto
- [ ] `DECISAO.md` nesta pasta (stack, estrutura de pastas, prós/contras, limites)
- [ ] Protótipo: vídeo 9:16 de 10 s com legenda e cores da kz, renderizado localmente

## Arquivos
- `ref-roteiros-video-antigo.md`: plano antigo de skills de roteiro (TikTok/Reels/YouTube). Só referência; o roteiro de reels já está na skill `ig-post`.

## Log
- 2026-10-06 — criada.
