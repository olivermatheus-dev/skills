# Índice do material de motion

Destino da versão destilada: `knowledge/video/<tema>.md` (ver `knowledge/video/README.md`).

| data | bruto | tema | destilado em | status |
|---|---|---|---|---|
| 2026-10-06 | material/ref-roteiros-video-antigo.md (plano antigo do repo) | roteiro, hooks, retenção | — | novo |
| 2026-10-07 | material/2026-10-07-etapa1-cortes-montagem.md | fundamentos de corte, hard/jump/J/L-cut, cut on action | knowledge/video/cortes-e-montagem.md | destilado |
| 2026-10-07 | material/2026-10-07-skill-ludus-video.md (skill do produto Ludus) | processo de produção, arquitetura de skill, QA, export | knowledge/video/esteira-de-producao.md + tarefas 001, 003, 004 | destilado |
| 2026-10-07 | material/2026-10-07-prompts-video-e-trailer.md (prompt do Ludus + prompt de trailer de um editor) | briefing, direção, arco, movimento, ritmo, som | knowledge/video/briefing-e-direcao.md, movimento.md, ritmo-e-leitura.md, som.md | destilado |
| 2026-10-07 | (enviado no chat; não salvo bruto) Etapa 2 — cobertura, continuidade e reação | cutaway, insert, reação, eyeline, shot/reverse, match, smash, sistema de decisão | knowledge/video/cobertura-e-reacao.md | destilado |
| 2026-10-07 | (enviado no chat; não salvo bruto) Etapa 3 — B-roll e cobertura visual | 11 tipos de B-roll, sincronia semântica, fontes, integridade, QC | knowledge/video/b-roll.md | destilado |
| 2026-10-07 | (enviado no chat; não salvo bruto) Etapa 4 — ritmo, pacing e atenção | macro/micro, densidade, interrupt motivado, escala 0–4, diagnóstico, QC | knowledge/video/pacing-e-atencao.md (+ ajuste em ritmo-e-leitura) | destilado |
| 2026-10-07 | (chat) Etapa 5 — sound design e biblioteca de SFX | funções, hierarquia, biblioteca e metadados, regras por tipo, motion, layering, identidade sonora, QC | knowledge/video/sound-design.md, som.md, library/audio/README.md, skill `audio`, agente `sound-designer` | destilado |
| 2026-10-07 | (chat) Etapa 6 — transições visuais e efeitos | escada e sistema de decisão, regras por tipo, presets, sistema da marca, QC, teste de remoção | knowledge/video/transicoes-e-efeitos.md | destilado |
| 2026-10-07 | (chat) Etapa 7 — design, composição e direção de arte | hierarquia, composição, tipografia, formas, densidade, style frames, design system, polimento | knowledge/video/design-e-composicao.md | destilado |
| 2026-10-07 | (chat) Etapa 8 — timing, spacing e física | timing/spacing, easing, princípios de física, sequenciamento, entradas/saídas, personalidade e tokens, diagnóstico | knowledge/video/animacao-comportamento.md (+ correção em movimento.md) | destilado |
| 2026-10-07 | (chat) Etapa 9 — Graph Editor e micro-polimento | leitura de curvas, assimetria, keyframes de passagem, caminho × tempo, percepção, famílias, inspeção, checklist | knowledge/video/curvas-e-polimento.md (traduzido para GSAP) | destilado |
| 2026-10-07 | material/2026-10-07-guia-de-movimento-ludus.md | 6 ideias, cor/texto/fundo, ritmo medido, armadilhas técnicas | visual-e-cor.md (novo), tecnico-hyperframes.md (novo), movimento.md, ritmo-e-leitura.md, tarefa 001 | destilado |

## Notas de verificação
- **2026-10-07 · Etapa 1:** conteúdo correto e alinhado à prática profissional. Ajustes feitos:
  - Prioridade dos motivos alinhada à "Regra dos Seis" de Walter Murch, em que a **emoção vem antes da história**. O original punha emoção em 4º.
  - Adicionada a **direção do olhar** (*eye-trace*), que faltava e é crítica no 9:16.
  - Incluídos **valores iniciais**: margens de silêncio, duração de J/L-cut, escala de punch-in, ponto de corte no movimento.
  - Cada técnica ganhou uma tradução **"Em motion"**: o J-cut vira SFX/VO antes do visual, o L-cut vira VO sobre a cena e o cut on action vira *match cut*.
  - A tabela de função do trecho ganhou o tratamento recomendado para cada função.
- **2026-10-07 · skill ludus-video:** é uma referência de arquitetura e processo, não de técnica de edição. O que foi aproveitado:
  - as 5 etapas com portão de aval;
  - o "plano.md" com 7 seções;
  - os tempos derivados da voz;
  - os SFX ligados a eventos;
  - o QA por folhas de contato;
  - a regra "dizer o que não foi verificado";
  - as afirmações só com fonte.
  - O que ficou de fora, por ser específico do Ludus: as cores #F5F5F7 e #1D1D1F, a proibição de caixa alta, a persona Gaby e a voz Thalita. Isso vira exemplo do que vai no `BRAND.md` de cada marca.
  - Correção: o motion blur com 2 amostras (60→30 fps) pode gerar "fantasma" em movimento rápido. A recomendação passou a ser 4–8 amostras com obturador de 180°, ou desfoque direcional no elemento.
  - Impacto: HyperFrames + GSAP vira o candidato nº 1 na tarefa 003, com a sugestão de reaproveitar o `_kit` do Ludus.
- **2026-10-07 · prompts de vídeo e trailer:** conteúdo correto, mas qualitativo ("eased", "loud but never clipping"). O ganho foi **quantificar e completar com referências profissionais**:
  - **Briefing:** reduzido a 4 variáveis (recorte, duração, formatos, áudio). O resto sai da marca, do contexto e dos defaults, com proposta de 2–3 conceitos antes do plano.
  - **Movimento:** tabela de easing por situação, durações por tamanho de elemento, overshoot ≤ 10%, stagger de 40–80 ms, cursor em curva com pausa antes do clique. Fontes: princípios Disney e motion de UI (Material/Apple).
  - **Ritmo:** fórmula de tempo mínimo de leitura (máx(1 s; 0,3 s/palavra)), limite de palavras da locução por duração e 1º quadro com conteúdo.
  - **Som:**
    - BPM → quadros por batida, com cortes nos tempos fortes;
    - sincronia em que o som nunca vem antes da imagem (ITU-R BT.1359);
    - silêncio antes do impacto, ducking de 8–12 dB;
    - −14 LUFS ±1 com true peak ≤ −1 dBTP (faltava no original), medido com ffmpeg.
  - **Ressalva:** trilha 100% sintetizada soa menos rica. Para vídeos-chave, considerar faixa licenciada.
  - **Novos formatos para o catálogo da 005:** `fmt-trailer-lancamento` e `fmt-recorte-funcionalidade`.
- **2026-10-07 · guia de movimento do Ludus:** é o material mais valioso até aqui, porque as regras nasceram de feedback real e de medições.
  - **Genérico → `visual-e-cor.md`:**
    - fundo liso por padrão;
    - nunca título em cinza;
    - no máximo 1 ênfase por título;
    - cada cor com significado;
    - partícula só como resposta a um gesto;
    - mesmo tamanho de título em 4:5 e 9:16.
    São exatamente os erros típicos de vídeo gerado por IA, e agora viram defaults da skill.
  - **Molas nomeadas (SNAP 0%, FAST 4%, SOFT 8%, GENTLE 2%), `stretchTo`, `swap` e "o cursor conduz" → `movimento.md`.**
  - **Ritmo:** de 0,4 a 1,2 s entre mudanças. A evidência é um vídeo reprovado com silêncios de 1,1 a 2,7 s.
  - **Armadilhas técnicas → `tecnico-hyperframes.md`.** Conferidas como corretas pelo funcionamento do navegador:
    - transform não herda `background-clip:text`;
    - animar `left`/`top` causa saltos de pixel;
    - `will-change` rasteriza a camada na escala atual;
    - o overflow da máscara corta as descendentes.
  - **Específico do Ludus** (cores `#F5F5F7`, `#1D1D1F` e `#F2A61C`, Inter com −0,055 em, proibição de caixa alta, elenco fictício) → **exemplo preenchido de `BRAND.md`** na tarefa 001.
  - **Motion blur:** o guia confirma 2 amostras (60→30 fps) com obturador de 180°. A nota sobre o risco de "fantasma" continua válida.
- **2026-10-07 · Etapas 2, 3 e 4:** o conteúdo está correto e alinhado à prática profissional. O bruto não foi salvo, para economizar contexto; a destilação preserva todas as regras. O que mudou:
  - **Conflito resolvido:** a regra antiga "algo novo a cada 2–3 s" contradizia o "não use intervalos fixos". Agora os 2–3 s são um **teto**, não um metrônomo, e as mudanças precisam de motivo.
  - **Tradução para motion** em cada técnica de cobertura:
    - insert → zoom em elemento da interface;
    - eyeline → cursor ou seta que conduz;
    - shot/reverse → foco alternado no diálogo;
    - smash → caos→calma.
  - **B-roll:**
    - ordem para SaaS em motion: tela do produto → evidência → conceito da história;
    - clichês da marca somam-se aos clichês gerais no `BRAND.md`.
  - **Pacing:**
    - a escala de intensidade 0–4 virou **coluna obrigatória** na folha de batidas do `plano.md`, junto com a "função da cena";
    - curva típica de um vídeo curto de produto: 3-2-1/2-3-4-1.
  - **Ligações:** skill `video`, `plano.md`, `editor-de-video` e `revisor` agora apontam para os 3 arquivos novos.
- **2026-10-07 · Etapa 5 (som):** o conteúdo está correto. O que acrescentei:
  - **Valores iniciais:**
    - variação de pops: pitch ±1–2 semitons ou ±5% de ganho;
    - crossfade de 5–20 ms contra estalos e de 0,3–2 s para ambiência;
    - pan ≤ ±0,3;
    - SFX de UI 12–20 dB abaixo da voz;
    - riser de 1–4 s.
  - **"O pico do whoosh no quadro de maior velocidade" virou regra executável:**
    - o catálogo mede `peak_s` de cada arquivo;
    - o `timeline.json` usa `align: "peak"`, ou seja, o arquivo começa em `t − peak_s`.
  - **Infraestrutura nova, para não depender de efeitos que ainda não temos:**
    - `library/audio/`, com os arquivos locais e os catálogos no git;
    - `tools/audio/catalog.mjs` (scan, search e check, com licença obrigatória), testado;
    - `tools/audio/elevenlabs-sfx.mjs`, não testado por falta de chave;
    - skill `audio` (trilha, sound design e curadoria);
    - agente `sound-designer`;
    - seção **Som** no `BRAND.md`.
- **2026-10-07 · Etapa 6 (transições):** o conteúdo está correto. O que acrescentei:
  - **Acessibilidade:** no máximo 3 flashes por segundo (WCAG 2.3.1).
  - **Durações iniciais:** dissolve de 0,3–0,8 s; dip de 6–12 quadros; whip de 6–10 quadros; camera shake de 2–4 quadros com 4–12 px, decaindo.
  - **Tradução para motion de cada tipo:**
    - dip vai para a cor de fundo da marca;
    - push tem direção coerente;
    - zoom-through;
    - morph de SVG;
    - speed ramp vira curva de tempo;
    - freeze vira hold + anotação.
  - **Sistema da marca:** por vídeo, 1 família principal + 1 alternativa + 1 especial.
- **2026-10-07 · Etapas 7–9 (motion I, II e III):** o conteúdo está correto, mas escrito no vocabulário do After Effects. O que fiz:
  - **Conflito de terminologia corrigido.** No AE, "Ease In" é desacelerar **ao chegar**. No GSAP/CSS, isso é `.out`, e `ease-in` significa acelerar. Seguir o material ao pé da letra geraria o código invertido. A tabela de equivalência está em `animacao-comportamento.md` §3, `curvas-e-polimento.md` §2 e `movimento.md`.
  - **Overshoot recalibrado:** premium de 0–4% e expressivo de até 8–10%. A versão antiga aceitava 5–10% para tudo. A receita `scale 0→110→95→100` foi proibida.
  - **Graph Editor traduzido para o nosso stack:**
    - família de ease;
    - `CustomEase` para handles assimétricos;
    - um tween com `keyframes` e `easeEach` para keyframes de passagem;
    - `motionPath` para o caminho espacial;
    - parâmetro de posição da timeline para os offsets.
  - **Ideia registrada:** medir a velocidade por quadro no navegador headless, que seria o nosso "speed graph" (tarefas 003/009).
  - **Mudanças no processo:** style frames estáticos entram no plano, com um único aval para roteiro e visual; a ordem de trabalho por cena virou blocking → poses → curvas → offsets → settle → efeitos → som; tokens de duração e famílias de curva por personalidade.
