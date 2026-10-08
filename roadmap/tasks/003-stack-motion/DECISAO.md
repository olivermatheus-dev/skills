# Decisão — stack de render de motion (003)

**Escolha:** HyperFrames **0.8.141 (fixo)** + GSAP 3.15 (era 0.8.94; upgrade medido em `roadmap/tasks/032-upgrade-hyperframes/TASK.md`: mesmo visual, mesmo tempo), a partir do kit do Ludus (em produção), adaptado e genérico em `tools/video-kit/`.

## Por quê
- Já entregou vídeos reais no Ludus; o Claude escreve HTML/CSS/GSAP com facilidade.
- Render determinístico quadro a quadro (Chrome headless), validação (`validate`/`lint`) e snapshots para conferência.
- Motion blur real (2 passes a 60 → 30 quadros, obturador 180°), BT.709 marcado, −14 LUFS. O blur nativo do HyperFrames (sub-quadro, até 16 amostras) fica **opcional** (`--blur=nativo`): rastro mais liso, ~7–8× mais lento (032).
- Teste da kz (2026-10-07): 15 s, 9:16 + 4:5, render final com blur em ~2 min nesta máquina (GPU AMD).

## Alternativas descartadas (por ora)
- **Remotion:** maduro, mas React e licença por empresa; não traz vantagem sobre um kit que já funciona.
- **Playwright + ffmpeg puro:** reimplementaria o que o HyperFrames já faz (captura determinística, dedup de quadros).

## Como instalar
`npm install` na raiz (HyperFrames e GSAP estão no `package.json`, versões exatas) · Node 22 (`.nvmrc`) · ffmpeg no PATH · Python + `edge-tts` só para vozes `edge-*`.

## O que mudou em relação ao kit do Ludus
- Timeline do hub (`vo[]`, `scenes[]`, `events[]` em lista) **montada a partir do áudio** (`layout()`), com eventos presos a palavras → trocar a voz não exige reescrever cenas.
- Voz de rascunho: **Windows local** (OneCore, com tempo por palavra) ou edge-tts; voz final entra com `fit-vo.mjs` (corta, padroniza, reencaixa).
- SFX da **biblioteca licenciada** (`asset`) além dos sintetizados; trilha do catálogo ou sintetizada; mix com ducking e loudness em duas passadas.
- Marca copiada de `companies/<slug>/brand/`; fontes locais; formatos 4:5 · 9:16 · 16:9 · 1:1; nome `AAAA-MM-DD-nome-formato-vNN.mp4`.

## Pendente
- Teste com elemento 3D (celular girando com print real) — depende dos prints da kz.
