---
name: audio
description: "Trilhas sonoras e sound design: compõe ou gera trilhas para cada objetivo e sensação (a partir da biblioteca, de bases baixadas, de IA ou de síntese), faz o sound design de um vídeo (efeitos posicionados nos eventos da timeline), cuida da biblioteca de áudio (buscar, baixar, gerar, catalogar, licenças) e mede a mixagem. Use quando o usuário pedir trilha, música, soundtrack, som do vídeo, efeitos sonoros, SFX, whoosh, sound design, mixagem, 'gera uns sons', 'baixa efeitos', 'organiza a biblioteca de sons' ou quando a skill video chegar na etapa de áudio."
---

# Áudio: trilhas, sound design e biblioteca

O conhecimento vem de dois arquivos:
- `knowledge/video/som.md`: função dos efeitos, regras por tipo, BPM, ducking, loudness, QC.

A biblioteca e as fichas estão em `library/audio/README.md`.

A identidade sonora da marca fica em `companies/<slug>/brand/BRAND.md` > **Som**. Se estiver vazia, use o default: minimalista premium, com clicks discretos, soft impacts, *air* e transições tonais sutis.

**O Claude não escuta.** Ele decide pelo que pode conferir: metadados, sincronia (pico do arquivo × quadro do evento) e medições. Toda entrega diz: "ouvido final: Oliver".

## Ferramentas
- Catálogo: `node tools/audio/catalog.mjs search|scan|check` (sem licença o arquivo nem aparece na busca).
- Gerar efeito: `node tools/audio/elevenlabs-sfx.mjs "<prompt em inglês>" --duration 0.8 --out library/audio/sfx/<cat>/<Familia>_NN.mp3` (lê `ELEVENLABS_API_KEY` do `.env`).
- Medir/normalizar: `ffmpeg -i x.wav -af ebur128=peak=true -f null -` · `-af loudnorm=I=-14:TP=-1:LRA=11`.
- Editar: ffmpeg (`atrim`, `afade`, `acrossfade`, `atempo`, `asetrate` para pitch, `volume`, `pan`, `amix`).

## Modo A: Trilha
1. **Briefing:**
   - objetivo e sensação (ex.: "acolhimento → alívio");
   - duração e versões (15/30 s);
   - faixa de BPM (calmo 70–95 · médio 96–115 · energia 116–128);
   - estrutura **casada com os blocos do plano do vídeo** (gancho, build, virada, revelação, cartão final, com tempos);
   - se haverá voz por cima, que pede trilha menos melódica no registro médio;
   - marca (BRAND.md > Som) e 1–3 referências.
2. **Buscar** em `music.json` (mood, energy, bpm). Uma faixa que serve com edição é melhor que compor do zero.
   - **Não há? Procurar trilhas gratuitas** com licença comercial e sem exigência que trave anúncio:
     - **Pixabay Music:** licença própria, uso comercial, sem atribuição;
     - **Mixkit:** licença própria;
     - **Free Music Archive:** CC por faixa; **evitar NC** (não comercial);
     - **Incompetech:** CC-BY, exige atribuição na legenda;
     - **YouTube Audio Library:** conferir se a faixa permite uso fora do YouTube.

     Registre a licença na ficha.
   - **Sempre 2–3 candidatas** catalogadas. Para cada uma: `node tools/video/timeline.mjs music <pasta> <id>` → render de prévia → o Oliver ouve e escolhe. Trocar a trilha não exige reescrever nada.
   - A música da biblioteca do Instagram só vale **dentro do app**, em post orgânico. Anúncio exige faixa licenciada.
3. **Se não houver, compor** pelo caminho mais adequado:
   - **IA** (texto → música): prompt com gênero, mood, BPM, tom, instrumentos, estrutura com tempos, "instrumental, sem vocais" e duração.
   - **Arranjo de bases** (`bases.json`): loops e stems no **mesmo BPM e tom compatível**; cortes no compasso; crossfade de 10–50 ms entre loops e de 1–2 s entre seções.
   - **Síntese em código** (Web Audio / OfflineAudioContext): pulsos, pads, risers e impactos.
4. **Editar à estrutura:** entradas e saídas em pontos musicais, o drop no quadro da virada, o silêncio antes do impacto. A música é narrativa (`som.md` §2b).
5. **Masterizar e medir:** −14 LUFS ±1 e true peak ≤ −1 dBTP na mix final. A trilha "cama" sob voz é entregue já com o ducking planejado.
6. **Catalogar** em `music.json`, com seções e tempos, mood, BPM, tom, stems, origem e **licença**. Entregar o arquivo, as versões, a ficha e o que não foi verificado.

## Modo B: Sound design de um vídeo
Entrada:
- `timeline.json` (eventos com tempo);
- `plano.md` (intensidade 0–4 por bloco);
- BRAND.md > Som.

1. **Spotting:** para cada evento, aplique o sistema de decisão (`knowledge/video/som.md`). A maioria dos eventos **não ganha som**. A densidade segue a intensidade do bloco (§6).
2. **Escolher o asset:** função → intensidade → caráter → duração → escala → `catalog.mjs search`. Use **2–4 candidatos** e a mesma família no vídeo inteiro. Para eventos repetidos, peça variantes (`--family X --n 3`) e alterne.
3. **Faltou som:** gere (prompt: tipo + caráter + duração + "no music") ou baixe de fonte com licença → **catalogue** → use.
4. **Posicionar:** em `timeline.json` > `sfx`, informe `{event, asset, align, offset_s, gain_db, pan}`.
   - **align `peak`**: o arquivo começa em `t_evento − peak_s` (whoosh, impact);
   - **align `start`** para clicks e pops.
5. **Mix:**
   - voz > sons necessários > SFX > música > ambiência;
   - UI SFX ~12–20 dB abaixo da voz;
   - ducking da trilha sob a voz (revisar as transições).
6. **QC:** o QC de `knowledge/video/som.md`. Meça e registre os valores no `plano.md`.

## Modo C: Curadoria da biblioteca
- Montar famílias **por identidade sonora** (ex.: `UI_Elegant_*`, `Whoosh_Air_*`, `Impact_Soft_*`), com 3–5 variantes cada.
- Lote mínimo inicial: whoosh (leve, médio), swish, click/pop (UI), impact (suave, médio), sub, riser (curto, longo), reverse, downer, transição tonal, success/notification, room tone.
- Cada arquivo novo segue o caminho: `scan` → preencher a ficha → `check` limpo.

## Nunca
- Usar áudio sem licença registrada, ou de uso só pessoal/educacional.
- Efeito "YouTube genérico" (`knowledge/video/som.md`).
- Afirmar que "soa bem": diga o que foi medido e peça a audição.
