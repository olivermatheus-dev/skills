# 008 — Biblioteca de áudio inicial

**Status:** rascunho · **Depende de:** 003 (máquina local, chaves no `.env`)

## Objetivo
Ter a biblioteca mínima para os primeiros vídeos sem improviso: famílias de efeitos coerentes com a identidade sonora das marcas e 3 a 5 trilhas base, todas catalogadas e com licença.

## Escopo
- **Efeitos:** lote mínimo da skill `audio`, Modo C, com 3–5 variantes por família:
  - whoosh e air;
  - swish;
  - click e pop de UI;
  - impact suave e médio;
  - sub;
  - riser curto e longo;
  - reverse;
  - downer;
  - transição tonal;
  - success e notification;
  - room tone.
- **Trilhas:** calma/acolhedora (kz), média/confiante, energia/lançamento. Cada uma com seções e tempos.
- **Bases:** alguns loops e pads no mesmo tom e BPM, para arranjar.
- Fontes: ElevenLabs (geração), Freesound/Pixabay/Sonniss (download com licença) e síntese em código.

## Perguntas em aberto
- [ ] Qual plano da ElevenLabs? Os termos de uso comercial dependem dele.
- [ ] Alguma referência de trilha que o Oliver ama (para a kz e em geral)?

## Critérios de pronto
- [ ] `node tools/audio/catalog.mjs check` limpo
- [ ] O Oliver ouviu e aprovou as famílias e as trilhas

## Log
- 2026-10-07 — criada.
