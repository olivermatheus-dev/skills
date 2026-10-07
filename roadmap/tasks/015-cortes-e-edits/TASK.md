# 015 — Cortes e edits em escala (vídeos reais)

Status: rascunho · Depende de: 014 (galeria: looks, fx, trilhas), 003 (render/ffmpeg) · Liga com: 012 (motor de ideias)
Pedido do Oliver em 2026-10-07: páginas temáticas (ex.: futebol, política) com **cortes** de vídeos e **edits** (música + estilo de edição), produzidos em escala, sem recriar o estilo toda vez.

## Dois produtos
- **Corte:** trecho de um vídeo longo (fala, entrevista, podcast) que funciona sozinho: gancho → ideia completa → fecho. Vertical, com legenda.
- **Edit:** montagem de clipes no ritmo de uma música, com estilo de edição pronto (cortes na batida, transições, look, texto).

## Fluxo do corte (barato)
1. `yt-dlp` baixa a fonte (respeitar direitos e Termos de Uso; usar só material com permissão ou uso aceito pela plataforma).
2. **Whisper local** transcreve com tempo por palavra (grátis).
3. Modelo **barato** lê a transcrição e sugere 5–10 trechos (início/fim, gancho, por que funciona). **Oliver marca** quais cortar.
4. Script corta, **reenquadra para 9:16** (rosto/ação no centro), aplica legenda animada no estilo escolhido, look da galeria e trilha opcional → `qc.mjs`.

## Fluxo do edit
- **Preset de edit** (`library/edits/<id>.json`): trilha (id da biblioteca) · grade de corte na batida (a cada 1, 2 ou 4 tempos; acelera no drop) · transições da galeria (fx ou código) · look (`library/looks`) · velocidade (ramp no drop) · estilo de texto/legenda · formatos.
- Entrada: lista de clipes + preset → script monta a timeline na batida → render → `qc.mjs`. O Claude só escolhe os clipes e ajusta o que destoar.
- Preset bom vira item da galeria (vale a regra de promover da 014).

## Regras de qualidade (base: `knowledge/video/montagem.md` "Com filmagem", `efeitos.md`, `som.md`)
- Corte começa no gancho (sem "então, como eu dizia"); ideia completa; ≤ 60 s salvo pedido.
- Jump cut com margens da fala; punch-in em 2 enquadramentos fixos; legenda nunca sobre o rosto.
- Look aplicado igual em todos os clipes (consistência); música medida (−14 LUFS).

## Critérios de pronto
- 1 vídeo longo → 5 cortes 9:16 legendados com ≤ 1 intervenção do Oliver (a marcação).
- 1 preset de edit + 10 clipes → 1 edit na batida, sem o Claude escrever código de animação.

## Log
- 2026-10-07: pedido registrado e desenhado.
