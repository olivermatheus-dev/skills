---
id: T-0005
title: V0001 · cenas + render 4:5 (protótipo)
board: conteudo
status: done
assignee: agent:editor-de-video
priority: alta
due:
depends: [T-0003]
parent: T-0002
links: [contents/V0001-apresentacao-aluno-professor/]
context: [contents/V0001-apresentacao-aluno-professor/plano.md, brand/BRAND.md#Combinações, brand/BRAND.md#Proibições]
skills: [video]
---

Protótipo do V0001 (Oliver pediu ≤45 s, sem enrolação, direto do plano atual): blocos/cenas em HTML/CSS/GSAP pelo `cenas.json` e `timeline.json`, nível alto, na identidade (7 dobras, Outfit, elementos oficiais de `brand/`). Render **4:5** (1080×1350; formato único, decisão do Oliver 2026-10-26), com a voz de teste e a trilha/efeitos do sound-designer (T-0004) quando prontos. QC: `node tools/video/qc.mjs <pasta> --sheet` e olhar as folhas. Export em `exports/V0001-4x5-v01.mp4`.

## Estado
- Parou em: v04 renderizada (exports/V0001-4x5-v04.mp4, versoes/v04), qc sem critico na v04.
- Proximo: o Oliver assiste a v04; com o aval, voz final em ES/PT (texto v4) para f05-f07, f09-f20.
- Falta do Oliver: aval da v04 e os audios finais das falas de rascunho.

## Checklist
- [x] blocos e composition
- [x] render 4:5 com voz + trilha + efeitos
- [x] qc.mjs --sheet olhado

## Comentários
### 2026-10-26 16:55 · agent:editor-de-video · revisar
Protótipo 4:5 pronto: companies/ola/contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v01.mp4 (45,9 s, voz de teste + trilha e efeitos da T-0004). qc.mjs --sheet: −14 LUFS, true peak −1,5 dBTP, BT.709, sem crítico nem maior; folha olhada. 11 blocos novos em blocos/ da peça + fundo/dobras (7 dobras por token). Abaixo do ideal: olhos dos mascotes não seguem o cursor (piscam e inclinam), cursor não vira mão, laço do logo revelado por máscara, s07 e abertura rápidas com rastro de blur, agenda da s05 com metade de baixo vazia, voz de teste a 3,45 pal/s. Ouvir com fone e no celular, ver pequeno e sem som; detalhes em plano.md > Entrega.

### 2026-10-26 17:34 · agent:editor-de-video · revisar
v02 pronta: companies/ola/contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v02.mp4 (80,1 s, voz edge-thalita no rate normal, f10 nova, trilha+sfx+mix novos da T-0004). qc.mjs --sheet: −13,9 LUFS, true peak −1,2 dBTP, BT.709, sem crítico nem maior na v02 (o crítico listado é a v01, que tem 45,9 s contra a timeline nova). Folha olhada; corte do 'Vira aula' sem blur. Salto em 49,285 s = sibilante do 'Você' (f11), não estalo; f11 não regenerada. Abaixo do ideal: olhos não seguem o cursor, cursor não vira mão, laço por máscara, rastro de blur nos voos. Detalhes em plano.md > v02.

### 2026-10-26 17:53 · agent:editor-de-video · revisar
v03 (voz final Carla): companies/ola/contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v03.mp4 (82,1 s). qc.mjs --sheet: −13,8 LUFS, true peak −1,4 dBTP, BT.709, sem crítico nem maior na v03 (críticos listados = duração das v01/v02 antigas). Folha olhada: gestos sincronizados com a voz nova, digitação até ~2,7 s, headline 'Vira aula.' mantida. A conferir de ouvido: f18 (Whisper ouviu 'Vira a aula!').

### 2026-10-28 13:44 · agent:editor-de-video · revisar
v04 renderizada: exports/V0001-4x5-v04.mp4 (69,87 s, 1080x1350) · fonte em versoes/v04/ · v01-v03 intactas. qc --sheet da v04: -13,7 LUFS, true peak -1,5 dBTP, BT.709, sem critico nem maior (os 3 criticos do qc sao de duracao da v01/v02/v03, feitas com a timeline antiga). Os 10 ajustes do ajustes-v04.md estao nos blocos; o unico campo mudado na timeline foi scenes[s07].params.de = corte (nenhum tempo de evento, sfx, music ou mix mexido). Digitacao na tela termina em 2,75 s, junto com o teclado do sound-designer. Para ouvir e ver no celular: (1) s05, numero centralizado e avatares nas aulas (11-28 s) e o arraste de uma aula de 15'; (2) s06, cascata dos 4 cards e videochamada com as bolhas (28-37 s); (3) s07 em 0,72 s com zoom no card do professor ate a s08; (4) s11, troca aluno/professor, circulo vermelho, clique no ola e link (64-70 s); (5) vozes de rascunho win-maria e edge-salome ainda no lugar das finais. Abaixo do ideal: 1 quadro so de creme no fim da s02 (6,6 s, o card expandido; o qc nao acusou); avatar do aluno na videochamada e o mascote (o elenco nao tem foto).

## Log
- 2026-10-26 · agent:editor-de-video · 11 blocos + fundo/dobras, render 4:5 v01 com voz de teste, trilha e efeitos; qc.mjs --sheet limpo (corrigidos flash s06/s04, tela parada s05, sobreposições) → contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v01.mp4
- 2026-10-26 · agent:editor-de-video · v02 (feedback do Oliver): voz rate normal, f10 nova, hover nos cards, digitação ~2,4 s, agenda maior, passagens sem quadro vazio, corte do "Vira aula" sem blur; qc limpo → contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v02.mp4
- 2026-10-26 · agent:editor-de-video · v03 com a voz final Carla (split-vo + fit-vo) e mix novo; qc limpo → contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v03.mp4
- 2026-10-28 · agent:editor-de-video · v04 fase 1: edge-salome registrada; rascunho win-maria (f05–f07, f09, f10) e edge-salome (f11–f20), Carla mantida em f03/f04/f08; s03 removida; cenas.json e timeline.json reestruturados (69,9 s, 68 eventos); falas antigas em audio/vo/_v03/ → contents/V0001-apresentacao-aluno-professor/timeline.json
- 2026-10-28 · agent:editor-de-video · v04 fase 2: blocos dos 10 ajustes (dois-cards, hora-divide, professores-chat, bloco-professor, como-funciona-professor, vira-aula, fecho-ola); render v04 com o mix novo; qc sem critico → exports/V0001-4x5-v04.mp4
