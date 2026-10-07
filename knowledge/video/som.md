# Som

> Base: prompts de vídeo e trailer (2026-10-07), verificados com os padrões de loudness (EBU R128 / ITU-R BS.1770; plataformas normalizam ~−14 LUFS) e de sincronia audiovisual (ITU-R BT.1359). Números = **pontos de partida**. O Claude **não escuta**: a validação de ouvido é do usuário, e o Claude mede o que dá para medir.

## 1. Andamento manda nos cortes
- Escolha um **BPM** antes de animar. Lançamento/energia: 100–128 BPM; calmo/acolhedor: 70–95 BPM.
- 1 batida = 60 / BPM s (120 BPM → 0,5 s = 15 quadros a 30 fps).
- **Cortes e impactos na batida**, mas não em toda batida: troque de ideia nos tempos fortes, a cada 2 ou 4 batidas (frase musical).
- **Sincronia:** som e imagem no **mesmo quadro**. Na dúvida, o visual pode vir 1 quadro antes, nunca o som antes; som adiantado é percebido muito mais cedo do que atrasado.

## 2. Desenho de som de trailer (camadas)
| camada | o que é | quando |
|---|---|---|
| **sub boom** | grave curto e profundo | cortes fortes, entrada de bloco |
| **riser** | ruído filtrado subindo (filtro abrindo + volume) | 1–4 s antes da virada/revelação |
| **motivo melódico** | 3–5 notas reconhecíveis | identidade; repete na revelação |
| **impacto grande** | hit + cauda longa (reverb 2–4 s) | revelação da marca |
| **silêncio** | corte seco do som por 0,2–0,5 s | logo antes do impacto (o contraste aumenta o peso) |
| **UI SFX** | clique, balão, digitação, aviso, *whoosh* | presos aos `events` do `timeline.json` |

- **Whoosh** de transição começa **4–8 quadros antes** do movimento (J-cut sonoro).
- UI SFX baixinhos e curtos: são tempero, não protagonistas. Não colocar SFX em todo corte.

## 2b. Música como narrativa
- **Não é papel de parede:** varie energia, instrumentação, presença, e até a ausência. **Tirar a música** num momento importante pode pesar mais do que acrescentar.
- **Entrar e sair em pontos musicais** (começo de frase, mudança harmônica, fim de seção, build, drop, resolução), com fade quando preciso. A estrutura da música e a da história trabalham juntas: editar música é editar narrativa.
- **Silêncio:** reduzir a densidade antes de um evento costuma funcionar melhor que um riser.
- Hierarquia completa e sound design: `sound-design.md`.

## 3. Voz + trilha
- Com locução, a trilha **abaixa 8–12 dB** enquanto há fala (*ducking*), com ataque de ~100 ms e retorno de ~300–500 ms. Ducking automático é ponto de partida: **revise as transições** (subidas no meio de frase, buracos).
- Evite a melodia da trilha na mesma faixa da voz: prefira trilha mais grave ou mais aguda, ou uma melodia simples.

## 4. Mixagem e entrega
- **Loudness integrado: −14 LUFS** (±1). Alto, nunca estourado.
- **True peak ≤ −1 dBTP**: nunca clipar.
- Não esmagar: evite compressão/limitação pesada. A faixa dinâmica (LRA) entre ~4 e 10 LU é saudável para trailer.
- **Medir sempre** (ex.: `ffmpeg -af loudnorm=print_format=summary` ou `ebur128`) e registrar o valor no `plano.md`.

## 5. Fontes de áudio
Sempre **a biblioteca primeiro** (`library/audio/`, catálogo com licença de cada arquivo); depois gerar (IA, síntese em código) ou baixar de fonte com licença compatível, e **catalogar** antes de usar. Nunca áudio sem licença registrada. Processo completo: skill `audio`.
- Limite honesto: trilha 100% sintetizada é ótima para pulsos, impactos e risers, mas costuma soar menos rica que uma trilha produzida. Para vídeos-chave (lançamento), considerar uma faixa licenciada.

## 6. Checklist
- [ ] BPM definido e cortes nos tempos fortes?
- [ ] Silêncio antes do impacto da revelação?
- [ ] SFX de UI ligados a eventos, sem SFX em todo corte?
- [ ] Ducking sob a voz?
- [ ] Medido: −14 LUFS ±1 e true peak ≤ −1 dBTP?
- [ ] Avisado ao usuário que voz e mixagem precisam do ouvido dele?
