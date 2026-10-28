---
id: T-0002
title: Vídeo de apresentação aluno e professor (V0001)
board: conteudo
status: review
assignee: oliver
priority: alta
due:
depends: []
parent:
links: [contents/V0001-apresentacao-aluno-professor/]
context: [contents/V0001-apresentacao-aluno-professor/roteiro.md, brand/BRAND.md#Referência obrigatória, brand/BRAND.md#Combinações, brand/BRAND.md#Proibições]
skills: [plano-de-cenas, video, elevenlabs, audio]
---
Vídeo em motion graphics, nível **alto**, 9:16 + 4:5, com o roteiro do Oliver e a direção visual por tela em `contents/V0001-apresentacao-aluno-professor/roteiro.md`. Orquestrador (Opus) segue a receita de vídeo da skill `orquestrar`: editor-de-video (plano de cenas + revisão crítica + storyboard) → **aval do Oliver** → voz de rascunho + timeline → sound-designer (trilha + efeitos) ∥ editor-de-video (cenas) → render → revisor → Oliver.

Áudio em **faixas separadas** (uma por fala, `f01`…`f20`; trilha e efeitos à parte). **v1 sem ElevenLabs** (voz de rascunho grátis); a v1 já entrega o texto v4 de cada fala para o Oliver gerar no site. **v2** = `fit-vo --dir` com os 20 arquivos, versão nova sem reescrever cena.

## Estado
Roteiro e ajustes aprovados pelo Oliver (2026-10-26), voz única pt-BR. Rodar o orquestrador: plano de cenas → aval → v1 com voz de teste. Áudios finais só depois do vídeo aprovado.

## Checklist
- [x] Oliver aprova os ajustes do roteiro (voz única)
- [ ] Plano de cenas + storyboard (editor-de-video, revisão crítica Opus)
- [ ] Aval do plano pelo Oliver
- [ ] v1: voz de rascunho por fala + trilha + efeitos + cenas + render 9:16 e 4:5 + QC
- [x] Texto v4 por fala entregue (locucao-elevenlabs.md)
- [x] Oliver envia a voz do ElevenLabs (contínua, Carla)
- [ ] v2: fit-vo --dir + render + QC + revisor

## Comentários
### 2026-10-26 16:03 · ai
Orquestrador iniciou: voices.json criado (rascunho edge-thalita), bandeiras co/ar/mx da flag-icons (MIT) em library/visual/flags/flag-icons com licença registrada. Subtarefa T-0003 (editor-de-video: plano de cenas) criada; revisão crítica pelo revisor/Opus em seguida.

### 2026-10-26 16:17 · ai
Oliver (chat, 2026-10-26): vídeo de até ~45 s, sem enrolação; avançar para o protótipo com o plano atual. Revisão crítica do plano cancelada. Perguntas do plano.md §9 seguem a recomendação do editor (abertura curta, s10 creme, sem selo 'Mais escolhido', resposta do chat proposta, textos de tela propostos) e ficam para o Oliver ver no protótipo. Protótipo = 9:16 primeiro; 4:5 depois do aval.

### 2026-10-26 16:27 · ai
Oliver (chat): formato único 4:5 (1080×1350); sem 9:16.

### 2026-10-26 16:56 · ai · revisar
Protótipo v01 pronto: contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v01.mp4 (4:5, 45,9 s, -14 LUFS, QC técnico limpo; folha em render/qc/V0001-4x5-v01-sheet.png). Voz de teste edge-thalita +30% (3,45 palavras/s, rápida de propósito para caber em 45 s); trilha própria sintetizada (violão + percussão, 106 BPM; 2 alternativas em audio/previa-mix-*.wav) e efeitos com licença. Revisor pulado a pedido (rapidez). Abaixo do ideal: olhos dos mascotes não seguem o cursor (só piscam/inclinam), cursor não vira mão, abertura (1,9 s) e virada s07 (0,75 s) muito rápidas com motion blur nas passagens card↔página, metade de baixo da agenda da s05 vazia, quadros de passagem quase vazios em ~9,6 s e ~24 s. Anote no app (Conteúdos → V0001) e devolva.

### 2026-10-26 17:08 · ai
Oliver (chat) sobre a v01: gostou do motion. v02 mais longa, sem teto (1 min ou 1:07 tudo bem): abertura do navegador mais longa e digitação mais lenta; cards 'Quero aprender/ensinar espanhol' com mais tempo, mouse passando por um e depois pelo outro com animação de hover no botão; todas as cenas com mais respiro, principalmente as primeiras; voz SEM aceleração (rate normal).

### 2026-10-26 17:11 · ai
Oliver (chat): áudio bugado ~23 s da v01 (no 'Ayer fui al…', antes de 'eles entendem') sai; f10 muda para 'Você fala como consegue e eles entendem.'

### 2026-10-26 17:26 · ai
Texto v4 por fala entregue ao Oliver: contents/V0001-apresentacao-aluno-professor/locucao-elevenlabs.md (f01…f20, Eleven v4, stability natural). Ele gera no site e envia f01.mp3…f20.mp3 → fit-vo --dir.

### 2026-10-26 17:35 · ai · revisar
v02 pronta: contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v02.mp4 (4:5, 80,1 s, -13,9 LUFS, QC sem crítico na v02). Voz Thalita no ritmo normal, f10 nova sem o som bugado, abertura 4 s com digitação ~2,4 s, cards com hover nos dois (círculo cresce, seta desliza), respiro em todas as cenas, agenda da s05 cheia, passagens sem quadro vazio. Abaixo do ideal: olhos dos mascotes não seguem o cursor, cursor não vira mão, laço do logo por máscara, algum blur em movimentos rápidos, sibilantes da voz de teste. Texto v4 entregue (locucao-elevenlabs.md, por fala e contínuo). Revisor pulado (rapidez).

### 2026-10-26 17:39 · ai
Oliver enviou a voz final (ElevenLabs v4, Carla, áudio contínuo) → audio/elevenlabs/v0001-voz-carla.mp3. Pedido: recortar por fala e encaixar; música mais baixa: um pouco mais alta na abertura, depois baixa e constante até o fim (sem voltar a subir entre falas).

### 2026-10-26 17:54 · ai · revisar
v03 pronta: contents/V0001-apresentacao-aluno-professor/exports/V0001-4x5-v03.mp4 (4:5, 82,1 s, -13,8 LUFS, QC sem crítico). Voz final Carla (ElevenLabs) cortada em f01…f20 e encaixada; música um pouco mais alta só na abertura sem voz e depois baixa e fixa até o fim (sem ducking; automação nova no mix.mjs: duck:false + levels). Ouvir 74,2–75,2 s: a transcrição ouviu 'Vira a aula!'. Pendências visuais: olhos não seguem o cursor, cursor não vira mão, laço por máscara, blur em voos rápidos (avatar ~35 s). Revisor pulado.

### 2026-10-28 13:14 · ai
Oliver mandou os ajustes da v04 (2026-10-28): briefing completo em contents/V0001-apresentacao-aluno-professor/ajustes-v04.md. Narração em ES a partir da cena do professor, com voz de rascunho até o áudio final do ElevenLabs. Delegado ao editor (voz de rascunho + timeline + cenas) e ao sound-designer (mix nos tempos novos).

### 2026-10-28 13:47 · ai · revisar
v04 entregue: exports/V0001-4x5-v04.mp4 (69,9 s), qc limpo. Voz de rascunho (Maria PT, Salome ES) até o áudio final; texto v4 em locucao-elevenlabs-v04.md. Ponto em aberto: os cards da s09 mostram títulos curtos ('Sin clases complicadas'…); a narração diz a frase inteira.

## Log
- 2026-10-26 · ai · roteiro do Oliver + direção visual por tela em contents/V0001-apresentacao-aluno-professor/roteiro.md
- 2026-10-26 · ai · Oliver aprovou os ajustes, voz única; movida para A fazer e passada a uma sessão do orquestrador
- 2026-10-26 · ai · status → review · assignee → oliver
- 2026-10-26 · ai · status → review · assignee → oliver
- 2026-10-26 · ai · status → review · assignee → oliver
- 2026-10-28 · ai · status → doing · assignee → ai
- 2026-10-28 · ai · status → review · assignee → oliver
