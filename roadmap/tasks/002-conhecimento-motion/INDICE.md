# Índice do material de motion

Destino da versão destilada: `knowledge/video/<tema>.md` (ver `knowledge/video/README.md`).

| data | bruto | tema | destilado em | status |
|---|---|---|---|---|
| 2026-10-06 | material/ref-roteiros-video-antigo.md (plano antigo do repo) | roteiro, hooks, retenção | — | novo |
| 2026-10-07 | material/2026-10-07-etapa1-cortes-montagem.md | fundamentos de corte, hard/jump/J/L-cut, cut on action | knowledge/video/cortes-e-montagem.md | destilado |
| 2026-10-07 | material/2026-10-07-skill-ludus-video.md (skill do produto Ludus) | processo de produção, arquitetura de skill, QA, export | knowledge/video/esteira-de-producao.md + tarefas 001, 003, 004 | destilado |
| 2026-10-07 | material/2026-10-07-prompts-video-e-trailer.md (prompt do Ludus + prompt de trailer de um editor) | briefing, direção, arco, movimento, ritmo, som | knowledge/video/briefing-e-direcao.md, movimento.md, ritmo-e-leitura.md, som.md | destilado |
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
