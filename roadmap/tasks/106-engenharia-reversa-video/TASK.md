# 106 — Skill: engenharia reversa de vídeo → estilo

**Status:** rascunho · **Fase:** 3 · **Depende de:** 105

## Objetivo
Usuário passa um vídeo de referência → o Claude devolve um **template de vídeo** (formato da 102) que reproduz o estilo: edição, legenda (fonte, se varia, cores, animação, posição), cortes (ritmo, tipo), overlays e transições. Depois renderiza um vídeo de teste para comparar lado a lado.

## Como (hipótese)
1. ffmpeg: metadados (resolução, fps, duração) + frames a cada troca de cena e em intervalos curtos
2. Detecção de cena → ritmo de corte (cortes/min, duração média do plano)
3. Whisper → fala com tempo por palavra; comparada com os frames, mostra quantas palavras aparecem por legenda e quando
4. Claude (visão) analisa os frames: fonte provável (sugere a mais parecida do Google Fonts), cores, posição, caixa/contorno, destaques, overlays, moldura
5. Gera o rascunho do template → render de teste → usuário ajusta → salva em `companies/<slug>/video-templates/<nome>/`

## Limites
Identificação de fonte e de animação é aproximada; o usuário confirma.

## Log
- 2026-10-06 — criada.
