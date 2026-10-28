---
id: T-0004
title: V0001 · trilha + efeitos (protótipo)
board: conteudo
status: done
assignee: agent:sound-designer
priority: alta
due:
depends: [T-0003]
parent: T-0002
links: [contents/V0001-apresentacao-aluno-professor/]
context: [contents/V0001-apresentacao-aluno-professor/plano.md]
skills: [audio]
---

Trilha e sound design do protótipo V0001 (Olá Espanhol, ~45 s, 4:5), em faixas próprias (trilha e efeitos separados da voz f01…f20). Eventos em `timeline.json > events`; SFX sugerido por gesto em `cenas.json > gestos[].sfx`. Direção: orgânica, quente, leve e playful-elegante; toque latino discreto (violão de nylon, percussão de mão leve), ~100–110 BPM, sem clichê (mariachi, trompete). Trilha viva desde o 1º quadro, resolve no fim. SFX 12–20 dB abaixo da voz; um só ding + pop forte em "Vira aula" (f18). Sem licença registrada não usa.

## Estado
- Entregue (v04, 69,87 s): trilha ola-violao-percussao-106-04 em nível fixo (duck false + levels), 50 SFX, audio/sfx.wav e audio/mix.wav (−13,7 LUFS, TP −1,5).
- Próximo: editor renderiza; se os events mudarem, rodar sfx.mjs + mix.mjs; trilha só se 7,57 s ou 61,873 s mudarem.
- Falta do Oliver: ouvir (ouvido final: Oliver).

## Checklist
- [x] trilha no tempo da timeline (3 candidatas catalogadas)
- [x] efeitos nos events
- [x] mix medida (voz em cima)

## Comentários
### 2026-10-26 16:36 · agent:sound-designer · revisar
Som do V0001 pronto. Trilha própria (sintetizada no hub, sem direito autoral): violão de nylon + percussão de mão leve, 105,9 BPM, drop no 'Vira aula' (40,443 s) com 0,3 s de respiro antes (cama a −16 dB, sem silêncio digital) e resolução em 42,71 s. 3 candidatas para ouvir: audio/previa-mix-ola-violao-percussao-106-01.wav (na timeline), …-violao-shaker-… (sem cajón e conga), …-synth-leve-… (synth do kit). Efeitos: 56 em 47 dos 68 eventos, família única (pop, click e swish suaves + Whoosh_Fino), um só ding + pop forte no e60. Mix: −14,0 LUFS, true peak −1,5 dBTP, SFX 13–23 dB abaixo da voz. Não verificado: escuta e sincronia contra os quadros renderizados. Ouvido final: Oliver.

### 2026-10-26 17:16 · agent:sound-designer · revisar
V02 (80,13 s): trilha refeita (ola-violao-percussao-106-02, mesma candidata 1, grade em 8,90 s e 72,329 s, abertura com crescendo até o clique). e33 sem som. Tiques de hover em e6/e69/e37/e70. Mix −13,9 LUFS, TP −1,5 dBTP, SFX 19–21 dB abaixo da voz (e60 a 10 dB). Prévia: audio/previa-mix-ola-violao-percussao-106-02.wav. Ouvido final: Oliver.

### 2026-10-26 17:48 · agent:sound-designer · revisar
V03 (voz final, 82,06 s): trilha ola-violao-percussao-106-03, grade em 8,90 s e 74,256 s. A música só fica mais alta na abertura sem voz; da entrada da voz até o fim, nível fixo, sem ducking (mix.mjs: duck false + levels). Medidas: música na abertura −28,1 LUFS; sob a voz −36,8 LUFS, 21 dB abaixo da voz (−15,6). SFX 19–20 dB abaixo, e33 sem som. Mix −13,8 LUFS, TP −1,4 dBTP. Prévia: audio/previa-mix-ola-violao-percussao-106-03.wav. Ouvido final: Oliver.

## Log
- 2026-10-26 · agent:sound-designer · trilha própria (violão + percussão, 105,9 BPM, 3 candidatas) + 56 SFX em 47 eventos + mix −14,0 LUFS / −1,5 dBTP → contents/V0001-apresentacao-aluno-professor/audio/
- 2026-10-26 · agent:sound-designer · V02: trilha 106-02 (80 s), e33 sem som, hovers e69/e70, mix −13,9 LUFS / −1,5 dBTP → contents/V0001-apresentacao-aluno-professor/audio/
- 2026-10-26 · agent:sound-designer · V03: trilha 106-03, nível fixo sem ducking (mix.mjs duck false + levels), mix −13,8 LUFS / −1,4 dBTP → contents/V0001-apresentacao-aluno-professor/audio/
- 2026-10-28 · agent:sound-designer · v04: trilha 106-04 (69,9 s, fecha em 69,86), 50 SFX nos eventos novos (sem click sintético, e33 sem som), nível fixo duck false + levels, mix −13,7 LUFS / −1,5 dBTP → contents/V0001-apresentacao-aluno-professor/audio/
